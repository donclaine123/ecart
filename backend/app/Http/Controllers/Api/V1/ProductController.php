<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Cache::remember('catalog_categories_v1', 300, function () {
            return Category::where('is_active', true)
                ->withCount('products')
                ->get();
        });

        return response()->json([
            'data' => $categories,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    public function index(Request $request): JsonResponse
    {
        $cacheKey = 'catalog_products_' . md5(json_encode($request->all()));

        $products = Cache::remember($cacheKey, 180, function () use ($request) {
            $query = Product::with('category')->where('is_active', true);

            // Filter by category slug or ID
            if ($request->filled('category') && $request->category !== 'all') {
                $cat = $request->category;
                $query->whereHas('category', function ($q) use ($cat) {
                    if (is_numeric($cat)) {
                        $q->where('id', (int) $cat)->orWhere('slug', $cat);
                    } else {
                        $q->where('slug', $cat);
                    }
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

            return $query->paginate($request->get('per_page', 12));
        });

        return response()->json($products)
            ->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    }

    public function show(string $slug): JsonResponse
    {
        $data = Cache::remember("product_detail_{$slug}", 120, function () use ($slug) {
            $product = Product::with('category')
                ->where('slug', $slug)
                ->where('is_active', true)
                ->first();

            if (!$product) {
                return null;
            }

            $related = Product::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->where('is_active', true)
                ->limit(4)
                ->get();

            return [
                'product' => $product,
                'related' => $related,
            ];
        });

        if (!$data) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return response()->json($data);
    }

    public function featured(): JsonResponse
    {
        $featured = Cache::remember('catalog_featured_products_v1', 300, function () {
            return Product::with('category')
                ->where('is_featured', true)
                ->where('is_active', true)
                ->limit(8)
                ->get();
        });

        return response()->json([
            'data' => $featured,
        ])->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }

    // Admin CRUD Endpoints
    public function adminIndex(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 100), 100);
        $page = (int) $request->query('page', 1);
        $cacheKey = "admin_products_p{$page}_{$perPage}";

        $products = Cache::remember($cacheKey, 120, function () use ($perPage) {
            return Product::with('category')->orderBy('id', 'asc')->paginate($perPage);
        });

        return response()->json($products)->header('Cache-Control', 'private, max-age=30, stale-while-revalidate=120');
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
        $product->load('category');

        $this->clearCatalogCache();

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
        $product->load('category');

        $this->clearCatalogCache();

        return response()->json($product);
    }

    public function adminDestroy(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        $this->clearCatalogCache();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    private function clearCatalogCache(): void
    {
        Cache::flush();
    }
}
