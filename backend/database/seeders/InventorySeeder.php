<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates comprehensive inventory data for live CRUD testing.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // ============================================
        // FOOD CATEGORY (20 items)
        // ============================================
        $foodItems = [
            ['sku' => 'FOOD-DOG-001', 'name' => 'Premium Dog Food 5kg', 'brand' => 'Royal Canin', 'price' => 1250, 'stock' => 45, 'reorder_level' => 20, 'expiry' => $now->copy()->addMonths(8)],
            ['sku' => 'FOOD-DOG-002', 'name' => 'Adult Dog Kibble 10kg', 'brand' => 'Pedigree', 'price' => 850, 'stock' => 32, 'reorder_level' => 15, 'expiry' => $now->copy()->addMonths(10)],
            ['sku' => 'FOOD-DOG-003', 'name' => 'Puppy Starter Pack 3kg', 'brand' => 'Hills Science', 'price' => 1450, 'stock' => 18, 'reorder_level' => 10, 'expiry' => $now->copy()->addMonths(6)],
            ['sku' => 'FOOD-DOG-004', 'name' => 'Grain-Free Dog Food 4kg', 'brand' => 'Blue Buffalo', 'price' => 1650, 'stock' => 22, 'reorder_level' => 12, 'expiry' => $now->copy()->addMonths(9)],
            ['sku' => 'FOOD-DOG-005', 'name' => 'Senior Dog Formula 5kg', 'brand' => 'Wellness', 'price' => 1350, 'stock' => 15, 'reorder_level' => 8, 'expiry' => $now->copy()->addMonths(7)],
            ['sku' => 'FOOD-CAT-001', 'name' => 'Premium Cat Kibble 2kg', 'brand' => 'Royal Canin', 'price' => 750, 'stock' => 38, 'reorder_level' => 15, 'expiry' => $now->copy()->addMonths(12)],
            ['sku' => 'FOOD-CAT-002', 'name' => 'Wet Cat Food Cans (12pcs)', 'brand' => 'Whiskas', 'price' => 450, 'stock' => 55, 'reorder_level' => 25, 'expiry' => $now->copy()->addMonths(18)],
            ['sku' => 'FOOD-CAT-003', 'name' => 'Kitten Milk Formula 500g', 'brand' => 'KMR', 'price' => 650, 'stock' => 12, 'reorder_level' => 8, 'expiry' => $now->copy()->addMonths(6)],
            ['sku' => 'FOOD-TREAT-001', 'name' => 'Dental Chews Pack', 'brand' => 'Greenies', 'price' => 350, 'stock' => 42, 'reorder_level' => 20, 'expiry' => $now->copy()->addMonths(14)],
            ['sku' => 'FOOD-TREAT-002', 'name' => 'Training Treats Bag', 'brand' => 'Zuke\'s', 'price' => 280, 'stock' => 67, 'reorder_level' => 30, 'expiry' => $now->copy()->addMonths(10)],
            ['sku' => 'FOOD-TREAT-003', 'name' => 'Biscuits Assorted 500g', 'brand' => 'Milk-Bone', 'price' => 180, 'stock' => 48, 'reorder_level' => 20, 'expiry' => $now->copy()->addMonths(11)],
            ['sku' => 'FOOD-RAW-001', 'name' => 'Raw Chicken Patties 1kg', 'brand' => 'Stella', 'price' => 550, 'stock' => 20, 'reorder_level' => 10, 'expiry' => $now->copy()->addMonths(4)],
            ['sku' => 'FOOD-WET-001', 'name' => 'Canned Dog Food (6pcs)', 'brand' => 'Cesar', 'price' => 320, 'stock' => 60, 'reorder_level' => 25, 'expiry' => $now->copy()->addMonths(20)],
            ['sku' => 'FOOD-SUPP-001', 'name' => 'Joint Supplement', 'brand' => 'Dasuquin', 'price' => 1200, 'stock' => 14, 'reorder_level' => 8, 'expiry' => $now->copy()->addMonths(24)],
            ['sku' => 'FOOD-SUPP-002', 'name' => 'Probiotic Powder 100g', 'brand' => 'FortiFlora', 'price' => 450, 'stock' => 28, 'reorder_level' => 15, 'expiry' => $now->copy()->addMonths(15)],
            ['sku' => 'FOOD-FISH-001', 'name' => 'Fish Flakes 100g', 'brand' => 'Tetra', 'price' => 180, 'stock' => 35, 'reorder_level' => 15, 'expiry' => $now->copy()->addMonths(16)],
            ['sku' => 'FOOD-BIRD-001', 'name' => 'Parrot Seed Mix 1kg', 'brand' => 'Kaytee', 'price' => 380, 'stock' => 22, 'reorder_level' => 10, 'expiry' => $now->copy()->addMonths(8)],
            ['sku' => 'FOOD-SPEC-001', 'name' => 'Small Animal Pellets', 'brand' => 'Oxbow', 'price' => 420, 'stock' => 30, 'reorder_level' => 15, 'expiry' => $now->copy()->addMonths(9)],
            ['sku' => 'FOOD-SPEC-002', 'name' => 'Reptile Food 200g', 'brand' => 'Fluker', 'price' => 290, 'stock' => 18, 'reorder_level' => 8, 'expiry' => $now->copy()->addMonths(6)],
            ['sku' => 'FOOD-LIMIT-001', 'name' => 'Limited Ingredient Diet', 'brand' => 'Natural Balance', 'price' => 1550, 'stock' => 8, 'reorder_level' => 5, 'expiry' => $now->copy()->addMonths(5)],
        ];

        foreach ($foodItems as $item) {
            $inventoryItem = InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => 'Food',
                    'brand' => $item['brand'],
                    'supplier' => $item['brand'] . ' Distributor',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder_level'],
                    'expiry_date' => $item['expiry'],
                    'status' => $item['stock'] > 0 ? 'active' : 'inactive',
                    'description' => 'Premium quality ' . strtolower($item['name']) . ' for pets.',
                ]
            );
            
            // Add initial stock log
            InventoryLog::create([
                'inventory_item_id' => $inventoryItem->id,
                'delta' => $item['stock'],
                'reason' => 'Initial stock - ' . $item['brand'] . ' delivery',
                'reference_type' => 'initial',
            ]);
        }

        // ============================================
        // ACCESSORIES CATEGORY (15 items)
        // ============================================
        $accessoryItems = [
            ['sku' => 'ACC-LEASH-001', 'name' => 'Nylon Dog Leash 6ft', 'brand' => 'PetSafe', 'price' => 280, 'stock' => 35, 'reorder' => 15],
            ['sku' => 'ACC-LEASH-002', 'name' => 'Retractable Leash Large', 'brand' => 'Flexi', 'price' => 650, 'stock' => 18, 'reorder' => 10],
            ['sku' => 'ACC-COLL-001', 'name' => 'Adjustable Dog Collar M', 'brand' => 'Coastal', 'price' => 180, 'stock' => 42, 'reorder' => 20],
            ['sku' => 'ACC-COLL-002', 'name' => 'Leather Dog Collar', 'brand' => 'Mendota', 'price' => 450, 'stock' => 15, 'reorder' => 8],
            ['sku' => 'ACC-HARN-001', 'name' => 'No-Pull Dog Harness', 'brand' => 'PetSafe', 'price' => 950, 'stock' => 22, 'reorder' => 12],
            ['sku' => 'ACC-HARN-002', 'name' => 'Cat Harness with Leash', 'brand' => 'ComeWithMe', 'price' => 380, 'stock' => 28, 'reorder' => 15],
            ['sku' => 'ACC-BED-001', 'name' => 'Orthopedic Pet Bed L', 'brand' => 'Furhaven', 'price' => 1850, 'stock' => 8, 'reorder' => 5],
            ['sku' => 'ACC-BED-002', 'name' => 'Donut Cuddler Bed M', 'brand' => 'Best Friends', 'price' => 1250, 'stock' => 12, 'reorder' => 8],
            ['sku' => 'ACC-CARR-001', 'name' => 'Soft Pet Carrier', 'brand' => 'Sherpa', 'price' => 2200, 'stock' => 6, 'reorder' => 4],
            ['sku' => 'ACC-CARR-002', 'name' => 'Pet Travel Crate L', 'brand' => 'Petmate', 'price' => 2800, 'stock' => 4, 'reorder' => 3],
            ['sku' => 'ACC-CRATE-001', 'name' => 'Wire Dog Crate 36"', 'brand' => 'MidWest', 'price' => 3200, 'stock' => 3, 'reorder' => 3],
            ['sku' => 'ACC-GATE-001', 'name' => 'Adjustable Pet Gate', 'brand' => 'Carlson', 'price' => 1650, 'stock' => 7, 'reorder' => 5],
            ['sku' => 'ACC-PAD-001', 'name' => 'Training Pads 100ct', 'brand' => 'AmazonBasics', 'price' => 650, 'stock' => 55, 'reorder' => 25],
            ['sku' => 'ACC-WAST-001', 'name' => 'Pooper Scooper Set', 'brand' => 'Petmate', 'price' => 320, 'stock' => 25, 'reorder' => 12],
            ['sku' => 'ACC-FOOD-001', 'name' => 'Stainless Steel Bowl', 'brand' => 'Durapet', 'price' => 280, 'stock' => 38, 'reorder' => 20],
        ];

        foreach ($accessoryItems as $item) {
            $inventoryItem = InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => 'Accessories',
                    'brand' => $item['brand'],
                    'supplier' => $item['brand'] . ' Supply Co.',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder'],
                    'expiry_date' => null,
                    'status' => 'active',
                    'description' => 'Quality ' . strtolower($item['name']) . ' for pet comfort and safety.',
                ]
            );
            
            InventoryLog::create([
                'inventory_item_id' => $inventoryItem->id,
                'delta' => $item['stock'],
                'reason' => 'Initial stock - ' . $item['brand'] . ' shipment',
                'reference_type' => 'initial',
            ]);
        }

        // ============================================
        // GROOMING CATEGORY (12 items)
        // ============================================
        $groomingItems = [
            ['sku' => 'GROOM-SHAM-001', 'name' => 'Oatmeal Shampoo 500ml', 'brand' => 'Earthbath', 'price' => 450, 'stock' => 28, 'reorder' => 15, 'expiry' => $now->copy()->addMonths(24)],
            ['sku' => 'GROOM-SHAM-002', 'name' => 'Flea & Tick Shampoo', 'brand' => 'Adams', 'price' => 380, 'stock' => 22, 'reorder' => 12, 'expiry' => $now->copy()->addMonths(18)],
            ['sku' => 'GROOM-COND-001', 'name' => 'Conditioner Spray 250ml', 'brand' => 'Chi', 'price' => 520, 'stock' => 18, 'reorder' => 10, 'expiry' => $now->copy()->addMonths(20)],
            ['sku' => 'GROOM-BRUSH-001', 'name' => 'Slicker Brush Large', 'brand' => 'FURminator', 'price' => 850, 'stock' => 15, 'reorder' => 8],
            ['sku' => 'GROOM-BRUSH-002', 'name' => 'Deshedding Tool', 'brand' => 'FURminator', 'price' => 1250, 'stock' => 12, 'reorder' => 6],
            ['sku' => 'GROOM-NAIL-001', 'name' => 'Nail Clippers', 'brand' => 'Safari', 'price' => 280, 'stock' => 35, 'reorder' => 15],
            ['sku' => 'GROOM-GRIN-001', 'name' => 'Dental Kit (Brush+Paste)', 'brand' => 'Virbac', 'price' => 450, 'stock' => 20, 'reorder' => 10, 'expiry' => $now->copy()->addMonths(12)],
            ['sku' => 'GROOM-WIPE-001', 'name' => 'Ear Wipes 100ct', 'brand' => 'PetMD', 'price' => 320, 'stock' => 25, 'reorder' => 12, 'expiry' => $now->copy()->addMonths(15)],
            ['sku' => 'GROOM-COAT-001', 'name' => 'Dematting Comb', 'brand' => 'Andis', 'price' => 580, 'stock' => 10, 'reorder' => 5],
            ['sku' => 'GROOM-DRY-001', 'name' => 'Microfiber Towel', 'brand' => 'Tuff Pupper', 'price' => 380, 'stock' => 30, 'reorder' => 15],
            ['sku' => 'GROOM-CLP-001', 'name' => 'Electric Clippers', 'brand' => 'Wahl', 'price' => 1850, 'stock' => 6, 'reorder' => 4],
            ['sku' => 'GROOM-PARF-001', 'name' => 'Pet Cologne 150ml', 'brand' => 'Bio-Groom', 'price' => 420, 'stock' => 14, 'reorder' => 8, 'expiry' => $now->copy()->addMonths(30)],
        ];

        foreach ($groomingItems as $item) {
            $inventoryItem = InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => 'Grooming',
                    'brand' => $item['brand'],
                    'supplier' => $item['brand'] . ' Grooming Supplies',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder'],
                    'expiry_date' => $item['expiry'] ?? null,
                    'status' => 'active',
                    'description' => 'Professional grade ' . strtolower($item['name']) . ' for grooming services.',
                ]
            );
            
            InventoryLog::create([
                'inventory_item_id' => $inventoryItem->id,
                'delta' => $item['stock'],
                'reason' => 'Initial stock - ' . $item['brand'] . ' delivery',
                'reference_type' => 'initial',
            ]);
        }

        // ============================================
        // TOYS CATEGORY (10 items)
        // ============================================
        $toyItems = [
            ['sku' => 'TOY-PLUSH-001', 'name' => 'Squeaky Plush Bear', 'brand' => 'KONG', 'price' => 380, 'stock' => 32, 'reorder' => 15],
            ['sku' => 'TOY-ROPE-001', 'name' => 'Rope Tug Toy Large', 'brand' => 'Mammoth', 'price' => 280, 'stock' => 28, 'reorder' => 15],
            ['sku' => 'TOY-BALL-001', 'name' => 'Tennis Balls 3pk', 'brand' => 'KONG', 'price' => 180, 'stock' => 65, 'reorder' => 30],
            ['sku' => 'TOY-CHEW-001', 'name' => 'Extreme Chew Bone', 'brand' => 'Nylabone', 'price' => 420, 'stock' => 25, 'reorder' => 12],
            ['sku' => 'TOY-TREAT-001', 'name' => 'Treat Dispensing Ball', 'brand' => 'PetSafe', 'price' => 550, 'stock' => 18, 'reorder' => 10],
            ['sku' => 'TOY-CAT-001', 'name' => 'Feather Wand Toy', 'brand' => 'Da Bird', 'price' => 320, 'stock' => 22, 'reorder' => 12],
            ['sku' => 'TOY-CAT-002', 'name' => 'Catnip Mice 3pk', 'brand' => 'Yeowww', 'price' => 250, 'stock' => 40, 'reorder' => 20],
            ['sku' => 'TOY-SCRATCH-001', 'name' => 'Scratching Post', 'brand' => 'SmartCat', 'price' => 1450, 'stock' => 8, 'reorder' => 5],
            ['sku' => 'TOY-PUZZLE-001', 'name' => 'Interactive Puzzle Toy', 'brand' => 'Nina Ottosson', 'price' => 850, 'stock' => 12, 'reorder' => 8],
            ['sku' => 'TOY-LASER-001', 'name' => 'Laser Pointer Toy', 'brand' => 'PetSafe', 'price' => 280, 'stock' => 30, 'reorder' => 15],
        ];

        foreach ($toyItems as $item) {
            $inventoryItem = InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => 'Toys',
                    'brand' => $item['brand'],
                    'supplier' => $item['brand'] . ' Toys Inc.',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder'],
                    'expiry_date' => null,
                    'status' => 'active',
                    'description' => 'Fun and durable ' . strtolower($item['name']) . ' for pet entertainment.',
                ]
            );
            
            InventoryLog::create([
                'inventory_item_id' => $inventoryItem->id,
                'delta' => $item['stock'],
                'reason' => 'Initial stock - ' . $item['brand'] . ' shipment',
                'reference_type' => 'initial',
            ]);
        }

        // ============================================
        // HEALTH CATEGORY (10 items)
        // ============================================
        $healthItems = [
            ['sku' => 'HLTH-FLEA-001', 'name' => 'Flea Drops (3-month)', 'brand' => 'Frontline', 'price' => 850, 'stock' => 25, 'reorder' => 12, 'expiry' => $now->copy()->addMonths(18)],
            ['sku' => 'HLTH-FLEA-002', 'name' => 'Oral Flea Prevention', 'brand' => 'NexGard', 'price' => 1250, 'stock' => 18, 'reorder' => 10, 'expiry' => $now->copy()->addMonths(20)],
            ['sku' => 'HLTH-WORM-001', 'name' => 'Dewormer Tablets 2ct', 'brand' => 'Drontal', 'price' => 450, 'stock' => 30, 'reorder' => 15, 'expiry' => $now->copy()->addMonths(24)],
            ['sku' => 'HLTH-VIT-001', 'name' => 'Multivitamin Chews', 'brand' => 'Zesty Paws', 'price' => 680, 'stock' => 22, 'reorder' => 12, 'expiry' => $now->copy()->addMonths(15)],
            ['sku' => 'HLTH-EAR-001', 'name' => 'Ear Cleaner 120ml', 'brand' => 'Zymox', 'price' => 520, 'stock' => 18, 'reorder' => 10, 'expiry' => $now->copy()->addMonths(30)],
            ['sku' => 'HLTH-EYE-001', 'name' => 'Eye Wash Drops', 'brand' => 'Terramycin', 'price' => 380, 'stock' => 15, 'reorder' => 8, 'expiry' => $now->copy()->addMonths(12)],
            ['sku' => 'HLTH-FIRSAID-001', 'name' => 'Pet First Aid Kit', 'brand' => 'RC Pet', 'price' => 950, 'stock' => 10, 'reorder' => 6],
            ['sku' => 'HLTH-THERM-001', 'name' => 'Digital Thermometer', 'brand' => 'Pet-Temp', 'price' => 650, 'stock' => 12, 'reorder' => 8],
            ['sku' => 'HLTH-BANDG-001', 'name' => 'Bandage Wrap 4in', 'brand' => 'Vetrap', 'price' => 180, 'stock' => 35, 'reorder' => 15, 'expiry' => $now->copy()->addMonths(48)],
            ['sku' => 'HLTH-CPR-001', 'name' => 'Pet CPR Mask', 'brand' => 'Rescue', 'price' => 450, 'stock' => 8, 'reorder' => 5],
        ];

        foreach ($healthItems as $item) {
            $inventoryItem = InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => 'Health',
                    'brand' => $item['brand'],
                    'supplier' => $item['brand'] . ' Veterinary',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder'],
                    'expiry_date' => $item['expiry'] ?? null,
                    'status' => 'active',
                    'description' => 'Essential ' . strtolower($item['name']) . ' for pet health and wellness.',
                ]
            );
            
            InventoryLog::create([
                'inventory_item_id' => $inventoryItem->id,
                'delta' => $item['stock'],
                'reason' => 'Initial stock - ' . $item['brand'] . ' delivery',
                'reference_type' => 'initial',
            ]);
        }

        // ============================================
        // SERVICES (Virtual Products - 5 items)
        // ============================================
        $serviceItems = [
            ['sku' => 'SRV-GROOM-FULL', 'name' => 'Full Grooming Service', 'price' => 1200, 'stock' => 999, 'reorder' => 0],
            ['sku' => 'SRV-GROOM-BATH', 'name' => 'Bath & Dry Service', 'price' => 550, 'stock' => 999, 'reorder' => 0],
            ['sku' => 'SRV-VET-CHECK', 'name' => 'Veterinary Check-up', 'price' => 850, 'stock' => 999, 'reorder' => 0],
            ['sku' => 'SRV-VET-VACC', 'name' => 'Vaccination Service', 'price' => 650, 'stock' => 999, 'reorder' => 0],
            ['sku' => 'SRV-DAYCARE', 'name' => 'Daycare (per day)', 'price' => 450, 'stock' => 999, 'reorder' => 0],
        ];

        foreach ($serviceItems as $item) {
            InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => 'Services',
                    'brand' => 'Pawesome',
                    'supplier' => 'Pawesome Services',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder'],
                    'expiry_date' => null,
                    'status' => 'active',
                    'description' => 'Professional ' . strtolower($item['name']) . ' provided by certified staff.',
                ]
            );
            // No inventory log for services (unlimited)
        }

        // Add some items with LOW STOCK for testing reorder alerts
        $lowStockItems = [
            ['sku' => 'FOOD-DOG-LOW', 'name' => 'Low Stock Dog Food (Test)', 'category' => 'Food', 'brand' => 'Test', 'price' => 500, 'stock' => 2, 'reorder' => 10, 'expiry' => $now->copy()->addMonths(6)],
            ['sku' => 'ACC-COLL-LOW', 'name' => 'Low Stock Collar (Test)', 'category' => 'Accessories', 'brand' => 'Test', 'price' => 200, 'stock' => 1, 'reorder' => 5],
            ['sku' => 'GROOM-SHAM-LOW', 'name' => 'Low Stock Shampoo (Test)', 'category' => 'Grooming', 'brand' => 'Test', 'price' => 300, 'stock' => 3, 'reorder' => 10, 'expiry' => $now->copy()->addMonths(12)],
        ];

        foreach ($lowStockItems as $item) {
            $inventoryItem = InventoryItem::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'brand' => $item['brand'],
                    'supplier' => 'Test Supplier',
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'reorder_level' => $item['reorder'],
                    'expiry_date' => $item['expiry'] ?? null,
                    'status' => 'active',
                    'description' => 'Low stock test item for reorder alert testing.',
                ]
            );
            
            InventoryLog::create([
                'inventory_item_id' => $inventoryItem->id,
                'delta' => $item['stock'],
                'reason' => 'Initial low stock for testing',
                'reference_type' => 'initial',
            ]);
        }

        // Add an OUT OF STOCK item
        $outOfStockItem = InventoryItem::updateOrCreate(
            ['sku' => 'TOY-BALL-OUT'],
            [
                'name' => 'Out of Stock Toy (Test)',
                'category' => 'Toys',
                'brand' => 'Test',
                'supplier' => 'Test Supplier',
                'price' => 150,
                'stock' => 0,
                'reorder_level' => 5,
                'expiry_date' => null,
                'status' => 'active',
                'description' => 'Out of stock test item for availability testing.',
            ]
        );
        
        // Add log showing it was depleted
        InventoryLog::create([
            'inventory_item_id' => $outOfStockItem->id,
            'delta' => -5,
            'reason' => 'Sold out - test data',
            'reference_type' => 'sale',
        ]);

        // Summary
        $totalItems = InventoryItem::count();
        $foodCount = InventoryItem::where('category', 'Food')->count();
        $accessoriesCount = InventoryItem::where('category', 'Accessories')->count();
        $groomingCount = InventoryItem::where('category', 'Grooming')->count();
        $toysCount = InventoryItem::where('category', 'Toys')->count();
        $healthCount = InventoryItem::where('category', 'Health')->count();
        $servicesCount = InventoryItem::where('category', 'Services')->count();
        $lowStock = InventoryItem::whereColumn('stock', '<=', 'reorder_level')->where('stock', '>', 0)->count();
        $outOfStock = InventoryItem::where('stock', 0)->count();

        $this->command->info("✅ Inventory populated successfully!");
        $this->command->info("📊 Summary:");
        $this->command->info("   - Total Items: {$totalItems}");
        $this->command->info("   - Food: {$foodCount}");
        $this->command->info("   - Accessories: {$accessoriesCount}");
        $this->command->info("   - Grooming: {$groomingCount}");
        $this->command->info("   - Toys: {$toysCount}");
        $this->command->info("   - Health: {$healthCount}");
        $this->command->info("   - Services: {$servicesCount}");
        $this->command->info("   - Low Stock Alerts: {$lowStock}");
        $this->command->info("   - Out of Stock: {$outOfStock}");
    }
}
