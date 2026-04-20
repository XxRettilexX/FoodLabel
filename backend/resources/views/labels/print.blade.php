<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Stampa Etichetta - {{ $payload['label_code'] }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .label-container {
            background: #fff;
            width: 10cm;
            height: 6cm;
            padding: 15px;
            border: 1px solid #000;
            box-sizing: border-box;
            border-radius: 4px;
            position: relative;
        }
        h1 {
            font-size: 16px;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        .info {
            font-size: 12px;
            line-height: 1.6;
        }
        .qr-placeholder {
            position: absolute;
            right: 15px;
            top: 50px;
            width: 80px;
            height: 80px;
            border: 1px solid #ccc;
            text-align: center;
            line-height: 80px;
            font-size: 10px;
            color: #666;
            background-color: #eee;
        }
        .barcode-strip {
            position: absolute;
            bottom: 15px;
            left: 15px;
            right: 15px;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 2px;
        }
        .btn-print {
            position: absolute;
            top: -40px;
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        @media print {
            body { background: #fff; display: block; margin: 0; padding: 0; }
            .label-container { border: none; border-radius: 0; width: auto; height: auto; break-inside: avoid; }
            .btn-print { display: none; }
            @page { margin: 0; size: 10cm 6cm; }
        }
    </style>
</head>
<body>
    <div class="label-container">
        <button class="btn-print" onclick="window.print()">Stampa Etichetta</button>
        
        <h1>FoodLabel HACCP</h1>
        
        <div class="info">
            <strong>Prodotto:</strong> {{ $payload['readable_data']['product_name'] }}<br>
            <strong>Fornitore:</strong> {{ $payload['readable_data']['supplier_name'] }}<br>
            <strong>Lotto Org:</strong> {{ $payload['readable_data']['batch_number'] }}<br>
            <strong>Scadenza:</strong> {{ \Carbon\Carbon::parse($payload['readable_data']['expires_at'])->format('d/m/Y') }}<br>
            <strong>Q.tà Iniziale:</strong> {{ $payload['readable_data']['quantity'] }} {{ $payload['readable_data']['unit'] }}
        </div>

        <div class="qr-placeholder">
            <!-- In produzione usare <img> generate dal backend o client render js -->
            [ QR CODE ]
        </div>

        <div class="barcode-strip">
            *{{ $payload['label_code'] }}*
        </div>
    </div>
</body>
</html>
