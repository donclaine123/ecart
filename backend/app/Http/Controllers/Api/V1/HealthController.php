<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'api_version' => 'v1',
            'app_name' => config('app.name', 'Ecart'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
