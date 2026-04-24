<?php

namespace App\Services\Modules\Products;

use App\Models\Modules\Products\Models\Product;

class ProductService
{
    public function createProduct(array $data, int $userId): Product
    {
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;
        $data['is_active'] = $data['is_active'] ?? true;

        return Product::create($data);
    }

    public function getAllProducts(?string $search = null, ?string $barcode = null)
    {
        $query = Product::with('supplier');

        if ($barcode) {
            $query->where('barcode', $barcode);
        } elseif ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('name')->paginate(20);
    }

    public function findByBarcode(string $barcode): ?Product
    {
        return Product::with('supplier')
            ->where('barcode', $barcode)
            ->first();
    }
}
