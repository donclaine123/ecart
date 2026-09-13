<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthCorsTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_single_cors_header(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@ecart.test',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $response = $this->postJson(
            '/api/v1/auth/login',
            ['email' => 'admin@ecart.test', 'password' => 'password'],
            ['Origin' => 'http://localhost:5173']
        );

        $response->assertStatus(200);
        $this->assertArrayHasKey('token', $response->json());
        $this->assertEquals('admin', $response->json('user.role'));

        // Verify CORS header exists and does not contain multiple values
        $originHeader = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertNotNull($originHeader);
        $this->assertStringNotContainsString(',', $originHeader, "Access-Control-Allow-Origin contains multiple values: {$originHeader}");
    }

    public function test_unauthorized_origin_does_not_receive_allow_origin_header(): void
    {
        $response = $this->postJson(
            '/api/v1/auth/login',
            ['email' => 'hacker@evil.com', 'password' => 'password'],
            ['Origin' => 'http://malicious-site.com']
        );

        $originHeader = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertNull($originHeader, 'Unauthorized origins must not receive an Access-Control-Allow-Origin header');
    }

    public function test_deployed_myecart_vercel_app_is_allowed(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@ecart.test',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson(
            '/api/v1/auth/login',
            ['email' => 'customer@ecart.test', 'password' => 'password'],
            ['Origin' => 'https://myecart.vercel.app']
        );

        $response->assertStatus(200);
        $originHeader = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertEquals('https://myecart.vercel.app', $originHeader);
    }

    public function test_other_vercel_subdomains_are_rejected(): void
    {
        $response = $this->postJson(
            '/api/v1/auth/login',
            ['email' => 'hacker@evil.com', 'password' => 'password'],
            ['Origin' => 'https://unauthorized-clone.vercel.app']
        );

        $originHeader = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertNull($originHeader, 'Arbitrary vercel subdomains must be rejected');
    }
}
