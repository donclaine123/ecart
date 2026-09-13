<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_update_profile(): void
    {
        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'Jane Doe',
            'phone' => '+1234567890',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_update_profile_and_addresses(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'customer@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'Updated Name',
            'phone' => '+1 (555) 987-6543',
            'address' => '742 Evergreen Terrace',
            'city' => 'Springfield',
            'state' => 'OR',
            'postal_code' => '97477',
            'country' => 'United States',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Profile updated successfully.',
            'user' => [
                'name' => 'Updated Name',
                'email' => 'customer@example.com',
                'phone' => '+1 (555) 987-6543',
                'address' => '742 Evergreen Terrace',
                'city' => 'Springfield',
                'state' => 'OR',
                'postal_code' => '97477',
                'country' => 'United States',
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'customer@example.com',
            'phone' => '+1 (555) 987-6543',
            'address' => '742 Evergreen Terrace',
            'city' => 'Springfield',
            'state' => 'OR',
            'postal_code' => '97477',
            'country' => 'United States',
        ]);
    }

    public function test_profile_endpoint_returns_user_address_fields(): void
    {
        $user = User::factory()->create([
            'name' => 'Saved User',
            'email' => 'saved@example.com',
            'phone' => '+1 (555) 123-4567',
            'address' => '100 Market St',
            'city' => 'San Francisco',
            'state' => 'CA',
            'postal_code' => '94105',
            'country' => 'United States',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/profile');

        $response->assertStatus(200);
        $response->assertJson([
            'user' => [
                'name' => 'Saved User',
                'email' => 'saved@example.com',
                'phone' => '+1 (555) 123-4567',
                'address' => '100 Market St',
                'city' => 'San Francisco',
                'state' => 'CA',
                'postal_code' => '94105',
                'country' => 'United States',
            ],
        ]);
    }
}
