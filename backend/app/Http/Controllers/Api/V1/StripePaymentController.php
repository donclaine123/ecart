<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripePaymentController extends Controller
{
    protected StripeService $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    /**
     * Generate Stripe PaymentIntent with server-authoritative cart calculation.
     * POST /api/v1/checkout/payment-intent
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Direct "Buy Now" checkout support (without adding to cart)
        if ($request->filled('product_id')) {
            $productId = $request->input('product_id');
            $quantity = max(1, (int) $request->input('quantity', 1));
            $product = Product::find($productId);

            if (!$product || $product->stock_quantity < $quantity) {
                $available = $product ? $product->stock_quantity : 0;
                $name = $product ? $product->name : 'Unknown';
                return response()->json([
                    'message' => "Insufficient inventory for '{$name}'. Only {$available} units available.",
                ], 422);
            }

            $subtotal = round($product->price * $quantity, 2);
            $shippingCost = $subtotal > 50.00 ? 0.00 : 15.00;
            $totalAmount = round($subtotal + $shippingCost, 2);

            $paymentIntent = $this->stripeService->createPaymentIntent($totalAmount, 'usd', [
                'user_id' => $user->id,
                'email' => $user->email,
                'product_id' => $product->id,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
                'shipping' => $shippingCost,
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent['client_secret'],
                'paymentIntentId' => $paymentIntent['id'],
                'amount' => $paymentIntent['amount'],
                'currency' => $paymentIntent['currency'],
                'publishableKey' => $this->stripeService->getPublishableKey(),
                'is_mock' => $paymentIntent['is_mock'] ?? false,
                'order_summary' => [
                    'subtotal' => $subtotal,
                    'shipping_cost' => $shippingCost,
                    'total_amount' => $totalAmount,
                ],
            ]);
        }

        // 2. Standard Cart Checkout
        $cartItems = CartItem::where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Cannot create payment intent: your shopping cart is empty.',
            ], 422);
        }

        $productIds = $cartItems->pluck('product_id')->all();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $subtotal = 0.00;
        foreach ($cartItems as $cartItem) {
            $product = $products->get($cartItem->product_id);
            if (!$product || $product->stock_quantity < $cartItem->quantity) {
                $available = $product ? $product->stock_quantity : 0;
                $name = $product ? $product->name : 'Unknown';
                return response()->json([
                    'message' => "Insufficient inventory for '{$name}'. Only {$available} units available.",
                ], 422);
            }
            $subtotal += round($product->price * $cartItem->quantity, 2);
        }

        $shippingCost = $subtotal > 50.00 ? 0.00 : 15.00;
        $totalAmount = round($subtotal + $shippingCost, 2);

        $paymentIntent = $this->stripeService->createPaymentIntent($totalAmount, 'usd', [
            'user_id' => $user->id,
            'email' => $user->email,
            'subtotal' => $subtotal,
            'shipping' => $shippingCost,
        ]);

        return response()->json([
            'clientSecret' => $paymentIntent['client_secret'],
            'paymentIntentId' => $paymentIntent['id'],
            'amount' => $paymentIntent['amount'],
            'currency' => $paymentIntent['currency'],
            'publishableKey' => $this->stripeService->getPublishableKey(),
            'is_mock' => $paymentIntent['is_mock'] ?? false,
            'order_summary' => [
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
            ],
        ]);
    }

    /**
     * Stripe Webhook Handler with signature verification & idempotent event resolution.
     * POST /api/v1/webhooks/stripe
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        if (!$this->stripeService->verifyWebhookSignature($payload, $sigHeader)) {
            Log::warning('Stripe webhook signature verification failed');
            return response()->json(['error' => 'Invalid webhook signature'], 400);
        }

        $event = json_decode($payload, true);
        if (!$event || !isset($event['type'])) {
            return response()->json(['error' => 'Invalid payload format'], 400);
        }

        $eventId = $event['id'] ?? null;
        $eventType = $event['type'];

        Log::info("Received Stripe webhook: {$eventType} ({$eventId})");

        // Idempotency: Check if we already processed this exact event
        if ($eventId && Payment::where('stripe_event_id', $eventId)->exists()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Event already processed (idempotent)',
            ]);
        }

        switch ($eventType) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event['data']['object'] ?? [];
                $paymentIntentId = $paymentIntent['id'] ?? null;

                if ($paymentIntentId) {
                    $payment = Payment::where('transaction_id', $paymentIntentId)->first();

                    if ($payment) {
                        $payment->update([
                            'status' => 'paid',
                            'stripe_event_id' => $eventId,
                        ]);

                        if ($payment->order) {
                            $payment->order->update([
                                'payment_status' => 'paid',
                                'status' => 'processing',
                            ]);
                        }
                    } else {
                        // Payment record might not be created yet if checkout is still finalizing
                        Log::info("Stripe Webhook: No existing payment found for transaction_id {$paymentIntentId}. Will be reconciled upon order placement.");
                    }
                }
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event['data']['object'] ?? [];
                $paymentIntentId = $paymentIntent['id'] ?? null;

                if ($paymentIntentId) {
                    $payment = Payment::where('transaction_id', $paymentIntentId)->first();
                    if ($payment) {
                        $payment->update([
                            'status' => 'failed',
                            'stripe_event_id' => $eventId,
                        ]);

                        if ($payment->order) {
                            $payment->order->update([
                                'payment_status' => 'failed',
                            ]);
                        }
                    }
                }
                break;

            default:
                Log::info("Unhandled Stripe webhook event type: {$eventType}");
                break;
        }

        return response()->json(['status' => 'success']);
    }
}
