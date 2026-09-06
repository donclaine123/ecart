<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Ecart REST API',
        'status' => 'online',
        'documentation' => '/api/v1/health',
    ]);
});
