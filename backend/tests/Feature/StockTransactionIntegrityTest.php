<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StockTransactionIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $limitedProduct;
    private Product $inactiveProduct;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'customer',
        ]);

        $category = Category::create([
            'name' => 'Tech',
            'slug' => 'tech',
            'description' => 'Gadgets',
            'is_active' => true,
        ]);

        $this->limitedProduct = Product::create([
            'category_id' => $category->id,
            'name' => 'Limited Edition Device',
            'slug' => 'limited-edition-device',
            'sku' => 'TECH-LTD-001',
            'description' => 'Only 3 left in stock',
            'price' => 500.00,
            'stock_quantity' => 3,
            'image_url' => 'https://example.com/device.jpg',
            'is_active' => true,
            'is_featured' => true,
        ]);

        $this->inactiveProduct = Product::create([
            'category_id' => $category->id,
            'name' => 'Archived Device',
            'slug' => 'archived-device',
            'sku' => 'TECH-ARC-001',
            'description' => 'No longer available for sale',
            'price' => 250.00,
            'stock_quantity' => 10,
            'image_url' => 'https://example.com/archived.jpg',
            'is_active' => false,
            'is_featured' => false,
        ]);
    }

    public function test_checkout_fails_when_cart_quantity_exceeds_stock(): void
    {
        Sanctum::actingAs($this->user);

        // Put 5 units in cart when only 3 are available
        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->limitedProduct->id,
            'quantity' => 5,
        ]);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'Test Buyer',
                'email' => 'buyer@ecart.test',
                'address' => '123 Test St',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
                'phone' => '+15551234567',
            ],
            'gateway' => 'mock',
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Insufficient inventory', $response->json('message'));

        // Stock must remain untouched at 3
        $this->assertEquals(3, $this->limitedProduct->fresh()->stock_quantity);

        // No order should have been created
        $this->assertEquals(0, Order::count());
    }

    public function test_direct_buy_fails_when_quantity_exceeds_stock(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'Direct Buyer',
                'email' => 'buyer@ecart.test',
                'address' => '123 Test St',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
                'phone' => '+15551234567',
            ],
            'gateway' => 'stripe',
            'payment_intent_id' => 'pi_test_excess_stock',
            'direct_item' => [
                'product_id' => $this->limitedProduct->id,
                'quantity' => 10, // Requesting 10 when only 3 available
            ],
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('Insufficient inventory', $response->json('message'));

        // Stock must remain untouched at 3
        $this->assertEquals(3, $this->limitedProduct->fresh()->stock_quantity);
        $this->assertEquals(0, Order::count());
    }

    public function test_inactive_product_cannot_be_ordered(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/orders', [
            'shipping_address' => [
                'name' => 'Direct Buyer',
                'email' => 'buyer@ecart.test',
                'address' => '123 Test St',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
                'phone' => '+15551234567',
            ],
            'gateway' => 'stripe',
            'payment_intent_id' => 'pi_test_inactive',
            'direct_item' => [
                'product_id' => $this->inactiveProduct->id,
                'quantity' => 1,
            ],
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('no longer available', $response->json('message'));
        $this->assertEquals(0, Order::count());
    }
}
