<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

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
            'payment_intent_id' => ['required_if:gateway,stripe', 'nullable', 'string'],
            'direct_item' => ['nullable', 'array'],
            'direct_item.product_id' => ['required_with:direct_item', 'exists:products,id'],
            'direct_item.quantity' => ['required_with:direct_item', 'integer', 'min:1'],
        ]);

        $user = $request->user();
        $isDirect = !empty($validated['direct_item']);

        if (!$isDirect) {
            $cartItems = CartItem::where('user_id', $user->id)->get();
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'message' => 'Cannot create order: your shopping cart is empty.',
                ], 422);
            }
        }

        $order = null;

        // 2. Execute Atomic Checkout Transaction with Pessimistic Row Locking
        try {
            DB::transaction(function () use ($user, $validated, $isDirect, &$order) {
                $itemsToSnapshot = [];
                $subtotal = 0.00;
                $productsMap = [];

                if ($isDirect) {
                    $directItem = $validated['direct_item'];
                    $product = Product::where('id', $directItem['product_id'])
                        ->lockForUpdate()
                        ->firstOrFail();

                    if (! $product->is_active) {
                        throw new \Exception("Product '{$product->name}' is no longer available for purchase.");
                    }

                    if ($product->stock_quantity < $directItem['quantity']) {
                        throw new \Exception("Insufficient inventory for '{$product->name}'. Only {$product->stock_quantity} units remain.");
                    }

                    $lineSubtotal = round($product->price * $directItem['quantity'], 2);
                    $subtotal += $lineSubtotal;

                    $itemsToSnapshot[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'unit_price' => $product->price,
                        'quantity' => $directItem['quantity'],
                        'subtotal' => $lineSubtotal,
                    ];
                    $productsMap[$product->id] = $product;
                } else {
                    $cartItems = CartItem::where('user_id', $user->id)->get();
                    $productIds = $cartItems->pluck('product_id')->all();

                    $products = Product::whereIn('id', $productIds)
                        ->lockForUpdate()
                        ->get()
                        ->keyBy('id');

                    foreach ($cartItems as $cartItem) {
                        $product = $products->get($cartItem->product_id);

                        if (! $product || ! $product->is_active) {
                            $productName = $product ? $product->name : 'Unknown';
                            throw new \Exception("Product '{$productName}' is no longer available for purchase.");
                        }

                        if ($product->stock_quantity < $cartItem->quantity) {
                            $available = $product->stock_quantity;
                            throw new \Exception("Insufficient inventory for '{$product->name}'. Only {$available} units remain.");
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
                    $productsMap = $products;
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
                    $productsMap[$itemData['product_id']]->decrement('stock_quantity', $itemData['quantity']);
                }

                $gateway = $validated['gateway'] ?? 'mock';
                $transactionId = 'TXN-' . strtoupper(Str::random(12));

                if ($gateway === 'stripe') {
                    $paymentIntentId = $validated['payment_intent_id'] ?? null;
                    if (!$paymentIntentId) {
                        throw new \Exception('PaymentIntent ID is required for Stripe checkout.');
                    }

                    $intent = $this->stripeService->retrievePaymentIntent($paymentIntentId);
                    if (empty($intent) || (!in_array($intent['status'] ?? '', ['succeeded', 'requires_capture']) && !($intent['is_mock'] ?? false))) {
                        throw new \Exception('Payment verification failed. Please check your card details and try again.');
                    }

                    $transactionId = $paymentIntentId;
                }

                // Create Payment record
                Payment::create([
                    'order_id' => $order->id,
                    'gateway' => $gateway,
                    'transaction_id' => $transactionId,
                    'amount' => $totalAmount,
                    'status' => 'paid',
                ]);

                // Clear user cart only if standard cart checkout
                if (!$isDirect) {
                    CartItem::where('user_id', $user->id)->delete();
                }
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
            ->firstOrFail();

        Gate::authorize('view', $order);

        return response()->json($order);
    }

    // Admin Operations
    public function adminOrders(): JsonResponse
    {
        $orders = Cache::remember('admin_orders_list', 60, function () {
            return Order::with(['user:id,name,email', 'items'])
                ->latest()
                ->paginate(20);
        });

        return response()->json($orders)->header('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled,returned'],
        ]);

        $order->update(['status' => $validated['status']]);

        Cache::forget('admin_orders_list');
        Cache::forget('admin_dashboard_stats');

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => $order,
        ]);
    }

    public function adminStats(): JsonResponse
    {
        $stats = Cache::remember('admin_dashboard_stats', 60, function () {
            $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
            $totalOrders = Order::count();
            $lowStockCount = Product::where('stock_quantity', '<=', 8)->count();

            return [
                'total_revenue' => (float) $totalRevenue,
                'total_orders' => $totalOrders,
                'low_stock_products_count' => $lowStockCount,
            ];
        });

        return response()->json($stats)->header('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
    }
}
