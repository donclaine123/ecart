<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount('products')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->where('is_active', true);

        // Filter by category slug or ID
        if ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('category', function ($q) use ($cat) {
                $q->where('slug', $cat)->orWhere('id', $cat);
            });
        }

        // Search by keyword
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('sku', 'like', "%{$term}%");
            });
        }

        // Sort
        switch ($request->get('sort')) {
            case 'price_asc':
            case 'price-low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
            case 'price-high':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->latest();
                break;
            default:
                $query->orderBy('is_featured', 'desc')->latest();
                break;
        }

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with('category')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return response()->json([
            'product' => $product,
            'related' => $related,
        ]);
    }

    public function featured(): JsonResponse
    {
        $featured = Product::with('category')
            ->where('is_featured', true)
            ->where('is_active', true)
            ->limit(8)
            ->get();

        return response()->json([
            'data' => $featured,
        ]);
    }

    // Admin CRUD Endpoints
    public function adminIndex(): JsonResponse
    {
        $products = Product::with('category')->latest()->paginate(20);
        return response()->json($products);
    }

    public function adminStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:100', 'unique:products'],
            'price' => ['required', 'numeric', 'min:0.01'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(5);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'category_id' => ['sometimes', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'sku' => ['sometimes', 'string', 'max:100', 'unique:products,sku,' . $id],
            'price' => ['sometimes', 'numeric', 'min:0.01'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    public function adminDestroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }
}
