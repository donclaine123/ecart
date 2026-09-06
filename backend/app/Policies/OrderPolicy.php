<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any orders.
     */
    public function viewAny(User $user): bool
    {
        return true; // Users can view their own orders; admins can view all
    }

    /**
     * Determine whether the user can view the specific order.
     */
    public function view(User $user, Order $order): bool
    {
        return $user->role === 'admin' || $user->id === $order->user_id;
    }

    /**
     * Determine whether the user can create orders.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the order status.
     */
    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can cancel/delete the order.
     */
    public function delete(User $user, Order $order): bool
    {
        return $user->role === 'admin';
    }
}
