<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\InventoryItem;

echo "🧪 INVENTORY SYSTEM TEST\n";
echo "======================\n\n";

try {
    $inventory = InventoryItem::first();
    
    if ($inventory) {
        echo "✅ Inventory system accessible\n";
        echo "   Sample item: {$inventory->name}\n";
        echo "   Current stock: {$inventory->stock}\n";
        echo "   Item type: {$inventory->type}\n";
        echo "   Item category: {$inventory->category}\n";
    } else {
        echo "❌ No inventory items found\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error accessing inventory: {$e->getMessage()}\n";
}
