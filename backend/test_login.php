<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@pawesome.com')->first();

if ($user) {
    // Generate a token (this depends on your auth system)
    $token = $user->createToken('test-token')->plainTextToken;
    
    echo "✓ User found: {$user->name} (ID: {$user->id})\n";
    echo "✓ Token: {$token}\n";
    echo "✓ Use this token for API testing\n";
} else {
    echo "✗ Admin user not found. Creating one...\n";
    
    $user = User::create([
        'name' => 'Test Admin',
        'email' => 'admin@pawesome.com',
        'password' => Hash::make('password123'),
        'role' => 'admin',
    ]);
    
    $token = $user->createToken('test-token')->plainTextToken;
    
    echo "✓ Created admin user: {$user->name} (ID: {$user->id})\n";
    echo "✓ Token: {$token}\n";
    echo "✓ Email: admin@pawesome.com\n";
    echo "✓ Password: password123\n";
}
