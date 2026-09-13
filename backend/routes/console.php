<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:fix-sequences', function () {
    $tables = ['users', 'categories', 'products', 'orders', 'order_items', 'cart_items'];
    foreach ($tables as $table) {
        try {
            $seq = \Illuminate\Support\Facades\DB::selectOne("SELECT pg_get_serial_sequence('{$table}', 'id') as seq");
            if ($seq && $seq->seq) {
                \Illuminate\Support\Facades\DB::statement("SELECT setval('{$seq->seq}', COALESCE((SELECT MAX(id) FROM {$table}), 0) + 1, false)");
                $this->info("Reset sequence for {$table} to {$seq->seq}");
            }
        } catch (\Throwable $e) {
            $this->warn("Skipped {$table}: " . $e->getMessage());
        }
    }
    $this->info("All PostgreSQL sequences synchronized successfully!");
})->purpose('Fix and synchronize PostgreSQL serial sequences with current max(id)');

