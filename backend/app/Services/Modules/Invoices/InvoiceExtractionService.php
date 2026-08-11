<?php

namespace App\Services\Modules\Invoices;

use App\Models\Modules\Invoices\Models\DeliveryInvoice;
use App\Models\Modules\Invoices\Models\InvoiceLineItem;
use App\Models\Modules\Products\Models\Product;
use App\Services\Audit\AuditService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceExtractionService
{
    private const ALLOWED_UNITS = ['kg', 'g', 'l', 'pz'];

    public function __construct(private AuditService $audit)
    {
    }

    /**
     * Salva la fattura caricata, invoca l'estrazione AI (Gemini vision) e crea le
     * righe di lettura da rivedere manualmente. Non tocca mai Lots/InventoryMovements:
     * quello avviene solo alla conferma esplicita (InvoiceConfirmationService).
     */
    public function scanInvoice(UploadedFile $file, int $supplierId, int $userId): DeliveryInvoice
    {
        $user = \App\Models\User::findOrFail($userId);

        $path = $file->store('invoices/'.$user->account_id, 'local');

        $invoice = DeliveryInvoice::create([
            'account_id' => $user->account_id,
            'supplier_id' => $supplierId,
            'user_id' => $userId,
            'file_path' => $path,
            'file_mime' => $file->getMimeType(),
            'status' => 'pending',
        ]);

        $this->audit->logModelChange('created', $invoice, user: $user);

        try {
            $decoded = $this->extractFromStoredFile($path, $invoice->file_mime);

            $invoice->update([
                'raw_ai_response' => $decoded,
                'invoice_number' => $decoded['invoice_number'] ?? null,
                'invoice_date' => $this->parseDate($decoded['invoice_date'] ?? null),
                'status' => 'reviewing',
            ]);

            foreach ($decoded['lines'] as $line) {
                $this->createLineItem($invoice, $line);
            }
        } catch (Exception $e) {
            $invoice->update([
                'status' => 'failed',
                'failure_reason' => $e->getMessage(),
            ]);
        }

        return $invoice->fresh('lineItems.product');
    }

    /**
     * Chiama Gemini Vision sul file gia' salvato e ritorna il JSON decodificato
     * ({invoice_number, invoice_date, lines: [...]}).
     */
    private function extractFromStoredFile(string $path, ?string $mimeType): array
    {
        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            throw new Exception('Chiave API Gemini non configurata (GEMINI_API_KEY).');
        }

        $model = config('services.gemini.model', 'gemini-2.0-flash');
        $bytes = Storage::disk('local')->get($path);
        if ($bytes === null) {
            throw new Exception('Impossibile leggere il file della fattura appena salvato.');
        }

        $base64Data = base64_encode($bytes);

        $prompt = <<<PROMPT
Sei un assistente che estrae dati da fatture di consegna per un ristorante.
Analizza il documento allegato e restituisci ESCLUSIVAMENTE un JSON valido (nessun testo
aggiuntivo, nessun markdown), con questa struttura esatta:
{
  "invoice_number": "numero fattura oppure null",
  "invoice_date": "YYYY-MM-DD oppure null",
  "lines": [
    {
      "nome_prodotto": "string",
      "quantita": number,
      "unita_misura": "kg|g|l|pz",
      "numero_lotto": "string oppure null",
      "data_scadenza": "YYYY-MM-DD oppure null",
      "confidence": number tra 0 e 1 che indica quanto sei sicuro della lettura di questa riga
    }
  ]
}
Se un campo non e' leggibile, usa null. Non inventare dati che non vedi nel documento.
Rispondi solo con il JSON, senza commenti.
PROMPT;

        $response = Http::timeout(45)
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [[
                    'parts' => [
                        ['text' => $prompt],
                        ['inline_data' => [
                            'mime_type' => $mimeType ?: 'image/jpeg',
                            'data' => $base64Data,
                        ]],
                    ],
                ]],
                'generationConfig' => [
                    'temperature' => 0,
                    'response_mime_type' => 'application/json',
                ],
            ]);

        if (!$response->successful()) {
            throw new Exception('Errore dal servizio AI ('.$response->status().'): '.Str::limit($response->body(), 300));
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');
        if (!$text) {
            throw new Exception('Risposta AI vuota o senza contenuto testuale.');
        }

        $decoded = json_decode((string) $text, true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($decoded['lines']) || !is_array($decoded['lines'])) {
            throw new Exception('La risposta AI non e\' un JSON valido con il formato atteso.');
        }

        return $decoded;
    }

    private function createLineItem(DeliveryInvoice $invoice, array $line): InvoiceLineItem
    {
        $rawName = trim((string) ($line['nome_prodotto'] ?? ''));
        [$product, $matchScore] = $this->matchProduct($rawName, $invoice->account_id);

        $aiConfidence = isset($line['confidence']) && is_numeric($line['confidence'])
            ? max(0.0, min(1.0, (float) $line['confidence']))
            : null;

        return InvoiceLineItem::create([
            'account_id' => $invoice->account_id,
            'delivery_invoice_id' => $invoice->id,
            'product_id' => $product?->id,
            'raw_product_name' => $rawName !== '' ? $rawName : 'Prodotto non riconosciuto',
            'quantity' => is_numeric($line['quantita'] ?? null) ? (float) $line['quantita'] : 0,
            'unit' => $this->normalizeUnit($line['unita_misura'] ?? null),
            'batch_number' => $line['numero_lotto'] ?? null,
            'expires_at' => $this->parseDate($line['data_scadenza'] ?? null),
            'confidence_score' => $aiConfidence ?? $matchScore,
            'status' => 'pending',
        ]);
    }

    /**
     * Ricerca fuzzy sul nome prodotto tra i prodotti gia' censiti dall'account.
     * Ritorna [Product|null, float score 0-1].
     */
    private function matchProduct(string $rawName, int $accountId): array
    {
        if ($rawName === '') {
            return [null, 0.0];
        }

        $products = Product::where('account_id', $accountId)->get(['id', 'name']);

        $bestProduct = null;
        $bestPercent = 0.0;

        foreach ($products as $product) {
            similar_text(Str::lower($rawName), Str::lower($product->name), $percent);
            if ($percent > $bestPercent) {
                $bestPercent = $percent;
                $bestProduct = $product;
            }
        }

        if ($bestProduct && $bestPercent >= 70.0) {
            return [$bestProduct, round($bestPercent / 100, 3)];
        }

        return [null, 0.0];
    }

    private function normalizeUnit(?string $rawUnit): string
    {
        $unit = Str::lower(trim((string) $rawUnit));

        return match (true) {
            in_array($unit, ['kg', 'kilogrammi', 'chilogrammi', 'chilo', 'chili'], true) => 'kg',
            in_array($unit, ['g', 'gr', 'grammi', 'grammo'], true) => 'g',
            in_array($unit, ['l', 'lt', 'litri', 'litro'], true) => 'l',
            in_array($unit, self::ALLOWED_UNITS, true) => $unit,
            default => 'pz',
        };
    }

    private function parseDate(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }

        try {
            return Carbon::parse($raw)->toDateString();
        } catch (Exception) {
            return null;
        }
    }
}
