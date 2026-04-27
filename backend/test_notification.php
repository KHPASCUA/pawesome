<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Notification;
use App\Models\User;

$user = User::first();

if ($user) {
    $notification = Notification::create([
        'user_id' => $user->id,
        'title' => 'Test Notification',
        'message' => 'This is a test notification from end-to-end testing',
        'type' => 'info',
        'read' => false,
    ]);

    echo "✓ Created notification ID: {$notification->id} for user: {$user->name} (ID: {$user->id})\n";
    echo "✓ Total notifications for user: " . Notification::forUser($user->id)->count() . "\n";
    echo "✓ Unread notifications: " . Notification::forUser($user->id)->unread()->count() . "\n";
} else {
    echo "✗ No users found in database\n";
}
