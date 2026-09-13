<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_fetch_products_list(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $category = Category::create([
            'name' => 'Tech',
            'slug' => 'tech',
            'is_active' => true,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Laptop Pro',
            'slug' => 'laptop-pro',
            'sku' => 'TECH-001',
            'price' => 1299.00,
            'stock_quantity' => 15,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/admin/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'sku', 'price', 'stock_quantity'],
                ],
            ]);
    }
}
