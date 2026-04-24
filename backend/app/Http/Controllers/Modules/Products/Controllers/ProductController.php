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

    public function index(Request $request)
    {
        $search = $request->query('q');
        $barcode = $request->query('barcode');

        return response()->json([
            'data' => $this->productService->getAllProducts($search, $barcode),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $product = $this->productService->createProduct($request->validated(), $request->user()->id);
        return response()->json(['data' => $product], 201);
    }

    public function show(Product $product)
    {
        $product->load('supplier', 'lots', 'createdBy', 'updatedBy');
        return response()->json(['data' => $product]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'sometimes|nullable|string|max:100',
            'barcode' => 'sometimes|nullable|string|max:255|unique:products,barcode,' . $product->id,
            'category' => 'sometimes|nullable|string|max:100',
            'base_unit' => 'sometimes|string|in:kg,g,l,ml,pcs',
            'is_active' => 'sometimes|boolean',
            'notes' => 'sometimes|nullable|string|max:2000',
            'supplier_id' => 'sometimes|nullable|exists:suppliers,id',
            'description' => 'sometimes|nullable|string|max:1000',
            'default_shelf_life_days' => 'sometimes|nullable|integer|min:1',
        ]);

        $validated['updated_by'] = $request->user()->id;

        $product->update($validated);
        return response()->json(['data' => $product]);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }

    public function findByBarcode(string $barcode)
    {
        $product = $this->productService->findByBarcode($barcode);

        if (!$product) {
            return response()->json([
                'message' => 'Prodotto non trovato per il barcode indicato.',
            ], 404);
        }

        return response()->json(['data' => $product]);
    }
}
