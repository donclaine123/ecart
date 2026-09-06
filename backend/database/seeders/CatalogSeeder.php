<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    /**
     * Run the database seeds for categories and matching products.
     */
    public function run(): void
    {
        $categories = [
            [
                'id' => 1,
                'name' => 'Smartphones',
                'slug' => 'smartphones',
                'description' => 'Next-generation flagship smartphones with computational optics and all-day battery.',
                'image_url' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'id' => 2,
                'name' => 'Laptops',
                'slug' => 'laptops',
                'description' => 'Precision ultrabooks and studio workstations engineered for creatives and engineers.',
                'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'id' => 3,
                'name' => 'Audio',
                'slug' => 'audio',
                'description' => 'Acoustically tuned studio headphones and wireless earbuds with hybrid noise cancelling.',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
            [
                'id' => 4,
                'name' => 'Wearables',
                'slug' => 'wearables',
                'description' => 'Advanced health monitors, GPS smartwatches, and minimalist fitness trackers.',
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $products = [
            [
                'id' => 1,
                'category_id' => 1,
                'name' => 'Nexus Pro Phone',
                'slug' => 'nexus-pro-phone',
                'sku' => 'PHN-NXPR-001',
                'description' => 'Ultra-thin aerospace titanium chassis with 6.7-inch Super Retina XDR OLED display, 48MP pro triple-camera sensor, and lightning-fast 3nm neural engine.',
                'price' => 999.00,
                'stock_quantity' => 16,
                'image_url' => 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'id' => 2,
                'category_id' => 2,
                'name' => 'Zenbook Elite',
                'slug' => 'zenbook-elite',
                'sku' => 'LPT-ZNBL-002',
                'description' => 'Featherweight 14-inch OLED laptop with 120Hz refresh rate, Intel Core Ultra 9 processor, 32GB unified RAM, and 18-hour battery encased in ceramic aluminum.',
                'price' => 1199.00,
                'stock_quantity' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'id' => 3,
                'category_id' => 3,
                'name' => 'Silentis ANC',
                'slug' => 'silentis-anc',
                'sku' => 'AUD-SLNT-003',
                'description' => 'Flagship studio headphones with 45dB adaptive active noise cancellation, custom 40mm biocellulose drivers, spatial audio head tracking, and memory-foam ear cushions.',
                'price' => 299.00,
                'stock_quantity' => 24,
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'id' => 4,
                'category_id' => 4,
                'name' => 'Vitals Watch',
                'slug' => 'vitals-watch',
                'sku' => 'WRB-VTLS-004',
                'description' => 'Sleek aluminum smartwatch featuring continuous ECG, optical heart rate sensor, sapphire crystal touchscreen, 50-meter water resistance, and 4-day battery life.',
                'price' => 199.00,
                'stock_quantity' => 12,
                'image_url' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => true,
            ],
            [
                'id' => 5,
                'category_id' => 1,
                'name' => 'Nexus Neo 5G',
                'slug' => 'nexus-neo-5g',
                'sku' => 'PHN-NXNE-005',
                'description' => 'All-day powerhouse with 120Hz smooth display, dual 50MP optical stabilization cameras, 67W rapid charging, and pure minimalist Android UI.',
                'price' => 699.00,
                'stock_quantity' => 19,
                'image_url' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'id' => 6,
                'category_id' => 2,
                'name' => 'Zenbook Studio 16',
                'slug' => 'zenbook-studio-16',
                'sku' => 'LPT-ZNBS-006',
                'description' => 'Professional workstation laptop equipped with 4K OLED touch display, NVIDIA RTX graphics, 64GB RAM, and physical creative dial integration.',
                'price' => 1899.00,
                'stock_quantity' => 5,
                'image_url' => 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'id' => 7,
                'category_id' => 3,
                'name' => 'Pulse X Spatial Earbuds',
                'slug' => 'pulse-x-spatial-earbuds',
                'sku' => 'AUD-PULX-007',
                'description' => 'Ergonomic in-ear wireless monitors with transparency mode, wireless Qi charging, IPX7 water resistance, and crystal-clear voice beamforming.',
                'price' => 179.00,
                'stock_quantity' => 30,
                'image_url' => 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => false,
            ],
            [
                'id' => 8,
                'category_id' => 4,
                'name' => 'Chronos Titanium Ultra',
                'slug' => 'chronos-titanium-ultra',
                'sku' => 'WRB-CHRN-008',
                'description' => 'Rugged grade-5 titanium outdoor adventure smartwatch with multi-band GPS, sapphire glass, 100m depth gauge, and 30-day expedition solar battery.',
                'price' => 399.00,
                'stock_quantity' => 7,
                'image_url' => 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
                'is_active' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(['sku' => $prod['sku']], $prod);
        }
    }
}
