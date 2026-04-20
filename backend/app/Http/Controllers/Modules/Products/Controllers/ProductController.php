<?php

namespace App\Http\Controllers\Modules\Products\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Modules\Products\StoreProductRequest;
use App\Models\Modules\Products\Models\Product;
use App\Services\Modules\Products\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(protected ProductService $productService)
    {}

    public function index()
    {
        return response()->json(['data' => $this->productService->getAllProducts()]);
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->createProduct($request->validated());
        return response()->json(['data' => $product], 201);
    }

    public function show(Product $product)
    {
        $product->load('supplier', 'lots');
        return response()->json(['data' => $product]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'supplier_id' => 'sometimes|nullable|exists:suppliers,id',
            'description' => 'sometimes|nullable|string|max:1000',
            'default_shelf_life_days' => 'sometimes|nullable|integer|min:1',
        ]);
        $product->update($validated);
        return response()->json(['data' => $product]);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
