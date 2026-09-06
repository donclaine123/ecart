<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether anyone can view products (public).
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether anyone can view product detail.
     */
    public function view(?User $user, Product $product): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create products (admin only).
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the product (admin only).
     */
    public function update(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can delete the product (admin only).
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->role === 'admin';
    }
}
