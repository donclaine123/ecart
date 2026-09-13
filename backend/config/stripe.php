<?php

return [
    'key' => env('STRIPE_KEY', 'pk_test_placeholder'),
    'secret' => env('STRIPE_SECRET', 'sk_test_placeholder'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', 'whsec_placeholder'),
    'currency' => env('STRIPE_CURRENCY', 'usd'),
];
