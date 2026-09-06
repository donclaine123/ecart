<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $items = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        $subtotal = 0.00;
        $formattedItems = [];

        foreach ($items as $item) {
            $product = $item->product;
            $lineSubtotal = round($product->price * $item->quantity, 2);
            $subtotal += $lineSubtotal;

            $formattedItems[] = [
                'id' => $item->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price' => (float) $product->price,
                'stock_quantity' => $product->stock_quantity,
                'image_url' => $product->image_url,
                'quantity' => $item->quantity,
                'subtotal' => $lineSubtotal,
            ];
        }

        $shippingCost = ($subtotal > 50.00 || count($formattedItems) === 0) ? 0.00 : 15.00;
        $totalAmount = round($subtotal + $shippingCost, 2);

        return response()->json([
            'items' => $formattedItems,
            'subtotal' => round($subtotal, 2),
            'shipping_cost' => $shippingCost,
            'total_amount' => $totalAmount,
            'items_count' => count($formattedItems),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->stock_quantity < $validated['quantity']) {
            return response()->json([
                'message' => 'Requested quantity exceeds available stock (' . $product->stock_quantity . ' units available).',
            ], 422);
        }

        $cartItem = CartItem::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $newQuantity = min($cartItem->quantity + $validated['quantity'], $product->stock_quantity);
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            $cartItem = CartItem::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart successfully.',
            'item' => $cartItem,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = $cartItem->product;

        if ($product->stock_quantity < $validated['quantity']) {
            return response()->json([
                'message' => 'Requested quantity exceeds available inventory (' . $product->stock_quantity . ' available).',
            ], 422);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message' => 'Cart updated.',
            'item' => $cartItem,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $cartItem = CartItem::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart.',
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Cart cleared.',
        ]);
    }
}
