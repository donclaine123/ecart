<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StripePaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::create([
            'name' => 'Audio',
            'slug' => 'audio',
            'description' => 'Acoustic devices',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Wireless Studio Headphones',
            'slug' => 'wireless-studio-headphones',
            'sku' => 'AUDIO-TEST-001',
            'description' => 'Premium headphones',
            'price' => 150.00,
            'stock_quantity' => 20,
            'image_url' => 'https://example.com/audio.jpg',
            'is_active' => true,
            'is_featured' => true,
        ]);
    }

    public function test_cannot_create_payment_intent_with_empty_cart(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/checkout/payment-intent');

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot create payment intent: your shopping cart is empty.',
            ]);
    }

    public function test_creates_payment_intent_with_authoritative_server_calculation(): void
    {
        Sanctum::actingAs($this->user);

        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response = $this->postJson('/api/v1/checkout/payment-intent');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'clientSecret',
                'paymentIntentId',
                'amount',
                'currency',
                'publishableKey',
                'order_summary' => [
                    'subtotal',
                    'shipping_cost',
                    'total_amount',
                ],
            ]);

        // 2 items * $150 = $300. Free shipping over $50.
        // In cents: 30000
        $this->assertEquals(30000, $response->json('amount'));
        $this->assertEquals(300.00, $response->json('order_summary.subtotal'));
        $this->assertEquals(0.00, $response->json('order_summary.shipping_cost'));
    }

    public function test_order_creation_with_stripe_gateway_succeeds(): void
    {
        Sanctum::actingAs($this->user);

        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'Stripe Tester',
                'email' => 'stripe@ecart.test',
                'address' => '456 Stripe Blvd',
                'city' => 'San Francisco',
                'state' => 'CA',
                'postal_code' => '94103',
                'country' => 'United States',
                'phone' => '+1 (555) 012-3456',
            ],
            'gateway' => 'stripe',
            'payment_intent_id' => 'pi_test_mock_1234567890',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('order.payment_status', 'paid');

        // Check stock decremented
        $this->assertEquals(19, $this->product->fresh()->stock_quantity);

        // Check cart emptied
        $this->assertEquals(0, CartItem::where('user_id', $this->user->id)->count());

        // Check payment record
        $this->assertDatabaseHas('payments', [
            'gateway' => 'stripe',
            'transaction_id' => 'pi_test_mock_1234567890',
            'status' => 'paid',
        ]);
    }

    public function test_webhook_rejects_missing_signature(): void
    {
        $payload = json_encode([
            'id' => 'evt_test_123',
            'type' => 'payment_intent.succeeded',
        ]);

        $response = $this->call('POST', '/api/v1/webhooks/stripe', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);

        $response->assertStatus(400);
    }

    public function test_webhook_handles_payment_intent_succeeded_idempotently(): void
    {
        // 1. Setup existing order and payment
        $order = Order::create([
            'order_number' => 'ORD-2026-TESTST',
            'user_id' => $this->user->id,
            'subtotal' => 150.00,
            'shipping_cost' => 0.00,
            'total_amount' => 150.00,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_address_json' => ['address' => '123 Test St'],
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'gateway' => 'stripe',
            'transaction_id' => 'pi_webhook_test_999',
            'amount' => 150.00,
            'status' => 'pending',
        ]);

        $payload = json_encode([
            'id' => 'evt_webhook_unique_456',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_webhook_test_999',
                    'amount' => 15000,
                    'status' => 'succeeded',
                ],
            ],
        ]);

        // Send webhook with mock valid signature
        $response = $this->call('POST', '/api/v1/webhooks/stripe', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => 'mock_valid_signature',
        ], $payload);

        $response->assertStatus(200);

        // Verify status updated to paid
        $this->assertEquals('paid', $payment->fresh()->status);
        $this->assertEquals('evt_webhook_unique_456', $payment->fresh()->stripe_event_id);
        $this->assertEquals('paid', $order->fresh()->payment_status);
        $this->assertEquals('processing', $order->fresh()->status);

        // Send duplicate webhook event (idempotency test)
        $duplicateResponse = $this->call('POST', '/api/v1/webhooks/stripe', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_STRIPE_SIGNATURE' => 'mock_valid_signature',
        ], $payload);

        $duplicateResponse->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Event already processed (idempotent)',
            ]);
    }

    public function test_direct_buy_now_order_creation_without_cart(): void
    {
        Sanctum::actingAs($this->user);

        // Cart is completely empty!
        $this->assertEquals(0, CartItem::where('user_id', $this->user->id)->count());

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'Direct Buyer',
                'email' => 'direct@ecart.test',
                'address' => '789 Direct Way',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
                'phone' => '+1 (555) 012-7890',
            ],
            'gateway' => 'stripe',
            'payment_intent_id' => 'pi_test_direct_123',
            'direct_item' => [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('order.payment_status', 'paid');

        // Check stock decremented
        $this->assertEquals(19, $this->product->fresh()->stock_quantity);
    }
}
