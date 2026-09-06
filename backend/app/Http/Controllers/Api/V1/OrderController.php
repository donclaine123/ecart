<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Atomic Checkout with Pessimistic Row-Level Locking (DB::transaction + lockForUpdate)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => ['required', 'array'],
            'shipping_address.name' => ['required', 'string', 'max:255'],
            'shipping_address.email' => ['required', 'email'],
            'shipping_address.address' => ['required', 'string'],
            'shipping_address.city' => ['required', 'string'],
            'shipping_address.state' => ['required', 'string'],
            'shipping_address.postal_code' => ['required', 'string'],
            'shipping_address.country' => ['required', 'string'],
            'shipping_address.phone' => ['required', 'string'],
            'gateway' => ['nullable', 'in:mock,stripe'],
        ]);

        $user = $request->user();

        // 1. Fetch user cart items
        $cartItems = CartItem::where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cannot create order: your shopping cart is empty.',
            ], 422);
        }

        $order = null;

        // 2. Execute Atomic Checkout Transaction with Pessimistic Row Locking
        try {
            DB::transaction(function () use ($user, $cartItems, $validated, &$order) {
                $productIds = $cartItems->pluck('product_id')->all();

                // Pessimistic row-level lock acquired on inventory records
                $products = Product::whereIn('id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $subtotal = 0.00;
                $itemsToSnapshot = [];

                // Verify stock availability under lock and compute subtotal
                foreach ($cartItems as $cartItem) {
                    $product = $products->get($cartItem->product_id);

                    if (! $product || $product->stock_quantity < $cartItem->quantity) {
                        $available = $product ? $product->stock_quantity : 0;
                        $productName = $product ? $product->name : 'Unknown';
                        throw new \Exception("Insufficient inventory for '{$productName}'. Only {$available} units remain.");
                    }

                    $lineSubtotal = round($product->price * $cartItem->quantity, 2);
                    $subtotal += $lineSubtotal;

                    $itemsToSnapshot[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'unit_price' => $product->price,
                        'quantity' => $cartItem->quantity,
                        'subtotal' => $lineSubtotal,
                    ];
                }

                $shippingCost = $subtotal > 50.00 ? 0.00 : 15.00;
                $totalAmount = round($subtotal + $shippingCost, 2);

                // Generate unique order number (ORD-YYYY-XXXX)
                $orderNumber = 'ORD-' . date('Y') . '-' . strtoupper(Str::random(6));

                // Create master Order record
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'user_id' => $user->id,
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'total_amount' => $totalAmount,
                    'status' => 'processing',
                    'payment_status' => 'paid',
                    'shipping_address_json' => $validated['shipping_address'],
                ]);

                // Snapshot each item and decrement inventory atomically
                foreach ($itemsToSnapshot as $itemData) {
                    $itemData['order_id'] = $order->id;
                    OrderItem::create($itemData);

                    // Decrement stock under pessimistic lock
                    $products[$itemData['product_id']]->decrement('stock_quantity', $itemData['quantity']);
                }

                // Create Payment record (Phase 1 Mock Gateway)
                Payment::create([
                    'order_id' => $order->id,
                    'gateway' => $validated['gateway'] ?? 'mock',
                    'transaction_id' => 'TXN-' . strtoupper(Str::random(12)),
                    'amount' => $totalAmount,
                    'status' => 'paid',
                ]);

                // Clear user cart
                CartItem::where('user_id', $user->id)->delete();
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => $order->load('items'),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::with(['items', 'payments'])
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($order);
    }

    // Admin Operations
    public function adminOrders(): JsonResponse
    {
        $orders = Order::with(['user:id,name,email', 'items'])
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled,returned'],
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }

    public function adminStats(): JsonResponse
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $totalOrders = Order::count();
        $lowStockCount = Product::where('stock_quantity', '<=', 8)->count();

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'total_orders' => $totalOrders,
            'low_stock_products_count' => $lowStockCount,
        ]);
    }
}
