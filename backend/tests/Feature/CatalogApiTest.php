<?php

namespace Tests\Feature;

use Database\Seeders\CatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check_endpoint_returns_healthy(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'healthy',
                'api_version' => 'v1',
            ]);
    }

    public function test_public_products_endpoint_returns_json(): void
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'current_page',
            ]);
    }

    public function test_categories_endpoint_includes_accessories(): void
    {
        $this->seed(CatalogSeeder::class);

        $response = $this->getJson('/api/v1/categories');

        $response->assertStatus(200);
        $slugs = collect($response->json('data'))->pluck('slug');
        $this->assertTrue($slugs->contains('accessories'));
        $this->assertEquals(5, $slugs->count());
    }

    public function test_products_endpoint_returns_all_fifty_seeded_products(): void
    {
        $this->seed(CatalogSeeder::class);

        $response = $this->getJson('/api/v1/products?per_page=100');

        $response->assertStatus(200);
        $this->assertEquals(50, count($response->json('data')));
    }
}
