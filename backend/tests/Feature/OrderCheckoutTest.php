<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderCheckoutTest extends TestCase
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
            'name' => 'Phones',
            'slug' => 'phones',
            'description' => 'Flagship smartphones',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Flagship Pro Max',
            'slug' => 'flagship-pro-max',
            'sku' => 'PHONE-TEST-001',
            'description' => 'Test phone device',
            'price' => 999.00,
            'stock_quantity' => 10,
            'image_url' => 'https://example.com/phone.jpg',
            'is_active' => true,
            'is_featured' => true,
        ]);
    }

    public function test_empty_cart_checkout_returns_422(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'Test Customer',
                'email' => 'customer@ecart.test',
                'address' => '123 Test St',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
                'phone' => '+15551234567',
            ],
            'gateway' => 'mock',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot create order: your shopping cart is empty.',
            ]);
    }

    public function test_successful_checkout_decrements_stock_and_clears_cart(): void
    {
        Sanctum::actingAs($this->user);

        // Add 2 units to cart
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'John Doe',
                'email' => 'customer@ecart.test',
                'address' => '742 Evergreen Terrace',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
                'phone' => '+1 (555) 019-2834',
            ],
            'gateway' => 'mock',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'order' => [
                    'id',
                    'order_number',
                    'subtotal',
                    'shipping_cost',
                    'total_amount',
                    'status',
                    'payment_status',
                    'items',
                ],
            ]);

        // Verify stock decremented from 10 to 8
        $this->assertEquals(8, $this->product->fresh()->stock_quantity);

        // Verify cart is cleared
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $this->user->id,
        ]);

        // Verify order items snapshot
        $this->assertDatabaseHas('order_items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'product_name' => 'Flagship Pro Max',
        ]);
    }
}
