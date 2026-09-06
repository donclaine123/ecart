<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->enum('gateway', ['mock', 'stripe']);
            $table->string('transaction_id')->nullable();
            $table->string('stripe_event_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->timestamps();

            $table->index('order_id', 'idx_payments_order');
            $table->index('stripe_event_id', 'idx_payments_stripe_event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
