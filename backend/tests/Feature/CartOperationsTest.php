<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartOperationsTest extends TestCase
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
            'name' => 'Wearables',
            'slug' => 'wearables',
            'description' => 'Smart watches',
            'is_active' => true,
        ]);

        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Smart Watch Ultra',
            'slug' => 'smart-watch-ultra',
            'sku' => 'WATCH-001',
            'description' => 'Fitness smartwatch',
            'price' => 299.00,
            'stock_quantity' => 5,
            'image_url' => 'https://example.com/watch.jpg',
            'is_active' => true,
            'is_featured' => true,
        ]);
    }

    public function test_guest_cannot_access_cart(): void
    {
        $response = $this->getJson('/api/v1/cart');

        $response->assertStatus(401);
    }

    public function test_user_can_add_item_to_cart(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);
    }

    public function test_cannot_add_more_than_available_stock_to_cart(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 10, // Stock is only 5
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
        ]);
    }

    public function test_user_can_update_cart_item_quantity(): void
    {
        Sanctum::actingAs($this->user);

        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

        $response = $this->patchJson("/api/v1/cart/items/{$cartItem->id}", [
            'quantity' => 3,
        ]);

        $response->assertStatus(200);
        $this->assertEquals(3, $cartItem->fresh()->quantity);
    }

    public function test_user_can_remove_item_from_cart(): void
    {
        Sanctum::actingAs($this->user);

        $cartItem = CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response = $this->deleteJson("/api/v1/cart/items/{$cartItem->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_user_can_clear_entire_cart(): void
    {
        Sanctum::actingAs($this->user);

        CartItem::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

        $response = $this->deleteJson('/api/v1/cart');

        $response->assertStatus(200);
        $this->assertEquals(0, CartItem::where('user_id', $this->user->id)->count());
    }
}
