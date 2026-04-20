<?php

namespace App\Services\Modules\Products;

use App\Models\Modules\Products\Models\Product;

class ProductService
{
    public function createProduct(array $data): Product
    {
        return Product::create($data);
    }

    public function getAllProducts()
    {
        return Product::with('supplier')->paginate(20);
    }
}
