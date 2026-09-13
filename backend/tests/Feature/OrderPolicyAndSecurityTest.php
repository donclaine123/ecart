<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderPolicyAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $customerA;
    private User $customerB;
    private User $admin;
    private Order $orderA;

    protected function setUp(): void
    {
        parent::setUp();

        $this->customerA = User::factory()->create([
            'name' => 'Alice Customer',
            'email' => 'alice@ecart.test',
            'role' => 'customer',
        ]);

        $this->customerB = User::factory()->create([
            'name' => 'Bob Customer',
            'email' => 'bob@ecart.test',
            'role' => 'customer',
        ]);

        $this->admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@ecart.test',
            'role' => 'admin',
        ]);

        $this->orderA = Order::create([
            'order_number' => 'ORD-2026-ALICE01',
            'user_id' => $this->customerA->id,
            'subtotal' => 200.00,
            'shipping_cost' => 0.00,
            'total_amount' => 200.00,
            'status' => 'processing',
            'payment_status' => 'paid',
            'shipping_address_json' => [
                'name' => 'Alice Customer',
                'email' => 'alice@ecart.test',
                'address' => '100 Main St',
                'city' => 'Portland',
                'state' => 'OR',
                'postal_code' => '97201',
                'country' => 'United States',
                'phone' => '+15551234567',
            ],
        ]);
    }

    public function test_customer_can_view_their_own_order(): void
    {
        Sanctum::actingAs($this->customerA);

        $response = $this->getJson("/api/v1/orders/{$this->orderA->order_number}");

        $response->assertStatus(200);
        $response->assertJson([
            'order_number' => 'ORD-2026-ALICE01',
            'user_id' => $this->customerA->id,
            'total_amount' => '200.00',
        ]);
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        Sanctum::actingAs($this->customerB);

        $response = $this->getJson("/api/v1/orders/{$this->orderA->order_number}");

        // OrderPolicy should deny access with 403 Forbidden
        $response->assertStatus(403);
    }

    public function test_admin_can_view_any_customers_order(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson("/api/v1/orders/{$this->orderA->order_number}");

        $response->assertStatus(200);
        $response->assertJson([
            'order_number' => 'ORD-2026-ALICE01',
        ]);
    }

    public function test_unauthenticated_request_cannot_view_order(): void
    {
        $response = $this->getJson("/api/v1/orders/{$this->orderA->order_number}");

        $response->assertStatus(401);
    }

    public function test_nonexistent_order_returns_404(): void
    {
        Sanctum::actingAs($this->customerA);

        $response = $this->getJson('/api/v1/orders/ORD-NONEXISTENT-999');

        $response->assertStatus(404);
    }

    public function test_admin_can_access_admin_orders_queue(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/orders');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_customer_forbidden_from_admin_orders_queue(): void
    {
        Sanctum::actingAs($this->customerA);

        $response = $this->getJson('/api/v1/admin/orders');

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Forbidden. This action requires admin privileges.',
        ]);
    }

    public function test_admin_can_update_order_fulfillment_status(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson("/api/v1/admin/orders/{$this->orderA->id}/status", [
            'status' => 'shipped',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('shipped', $this->orderA->fresh()->status);
    }

    public function test_customer_cannot_update_order_fulfillment_status(): void
    {
        Sanctum::actingAs($this->customerA);

        $response = $this->patchJson("/api/v1/admin/orders/{$this->orderA->id}/status", [
            'status' => 'delivered',
        ]);

        $response->assertStatus(403);
        $this->assertEquals('processing', $this->orderA->fresh()->status);
    }
}
