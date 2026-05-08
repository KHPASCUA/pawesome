<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\HotelRoom;
use App\Models\InventoryItem;
use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PawesomeLiveDemoSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $users = $this->ensureUsers();
        $customers = $this->ensureCustomersAndPets($users);
        $this->ensureRealisticPetshopInventory();
        $this->ensureRealisticServiceCatalog();
        $items = InventoryItem::where('is_sellable', true)
            ->where('stock', '>', 0)
            ->orderBy('id')
            ->take(8)
            ->get();

        if ($items->count() < 3) {
            return;
        }

        $this->clearPreviousLiveDemoRows();
        $this->ensureHotelRooms();
        $this->seedCustomerOrders($users, $customers, $items);
        $this->seedServiceRequests($users, $customers);
        $appointments = $this->seedVeterinaryWorkflow($users, $customers);
        $this->seedBoardingAndConfinement($users, $customers, $appointments);
        $sales = $this->seedSalesAndPayments($users, $customers, $items);
        $this->seedInventoryLogs($users, $items, $sales);
        $this->seedNotifications($users);
        $this->seedPayroll($users);
        $this->seedAuditLogs($users, $now);

        $this->command?->info('Pawesome live demo data seeded successfully.');
    }

    private function ensureUsers(): array
    {
        $accounts = [
            'admin' => ['name' => 'Administrator', 'role' => 'admin', 'department' => 'Administration', 'position' => 'System Administrator'],
            'manager' => ['name' => 'Manager', 'role' => 'manager', 'department' => 'Operations', 'position' => 'Operations Manager'],
            'receptionist' => ['name' => 'Receptionist', 'role' => 'receptionist', 'department' => 'Front Desk', 'position' => 'Receptionist'],
            'cashier' => ['name' => 'Cashier', 'role' => 'cashier', 'department' => 'Finance', 'position' => 'Cashier'],
            'inventory' => ['name' => 'Inventory Manager', 'role' => 'inventory', 'department' => 'Inventory', 'position' => 'Inventory Manager'],
            'vet' => ['name' => 'Veterinarian', 'role' => 'veterinary', 'department' => 'Veterinary', 'position' => 'Veterinarian'],
            'customer' => ['name' => 'Customer', 'role' => 'customer', 'department' => null, 'position' => null],
            'payroll' => ['name' => 'Payroll Manager', 'role' => 'payroll', 'department' => 'Finance', 'position' => 'Payroll Manager'],
        ];

        $users = [];
        foreach ($accounts as $username => $data) {
            $users[$username] = User::updateOrCreate(
                ['username' => $username],
                [
                    'name' => $data['name'],
                    'first_name' => $data['name'],
                    'last_name' => '',
                    'email' => $username . '@example.com',
                    'password' => Hash::make('Password123!'),
                    'role' => $data['role'],
                    'department' => $data['department'],
                    'position' => $data['position'],
                    'base_salary' => $data['role'] === 'customer' ? null : 32000,
                    'hourly_rate' => $data['role'] === 'customer' ? null : 180,
                    'employment_status' => 'active',
                    'is_active' => true,
                ]
            );
        }

        return $users;
    }

    private function ensureCustomersAndPets(array $users): array
    {
        $profiles = [
            ['username' => 'customer', 'name' => 'Customer', 'email' => 'customer@example.com', 'phone' => '09170000001', 'pet' => ['Buddy', 'Dog', 'Labrador Retriever', 3, 'Male']],
            ['username' => 'customer.maria', 'name' => 'Maria Santos', 'email' => 'maria.santos@pawesome.demo', 'phone' => '09170000002', 'pet' => ['Mochi', 'Cat', 'Persian', 2, 'Female']],
            ['username' => 'customer.ren', 'name' => 'Ren Dela Cruz', 'email' => 'ren.delacruz@pawesome.demo', 'phone' => '09170000003', 'pet' => ['Kona', 'Dog', 'Shih Tzu', 5, 'Female']],
            ['username' => 'customer.ana', 'name' => 'Ana Reyes', 'email' => 'ana.reyes@pawesome.demo', 'phone' => '09170000004', 'pet' => ['Pixel', 'Cat', 'Maine Coon', 4, 'Male']],
            ['username' => 'customer.leo', 'name' => 'Leo Garcia', 'email' => 'leo.garcia@pawesome.demo', 'phone' => '09170000005', 'pet' => ['Scout', 'Dog', 'Beagle', 1, 'Male']],
        ];

        $customers = [];
        foreach ($profiles as $profile) {
            $user = User::updateOrCreate(
                ['username' => $profile['username']],
                [
                    'name' => $profile['name'],
                    'first_name' => Str::before($profile['name'], ' '),
                    'last_name' => Str::after($profile['name'], ' '),
                    'email' => $profile['email'],
                    'password' => Hash::make('Password123!'),
                    'role' => 'customer',
                    'is_active' => true,
                ]
            );

            $customer = Customer::updateOrCreate(
                ['email' => $profile['email']],
                [
                    'user_id' => $user->id,
                    'name' => $profile['name'],
                    'phone' => $profile['phone'],
                    'address' => 'Pawesome Demo Address',
                    'loyalty_points' => 250,
                    'is_active' => true,
                    'notification_preferences' => ['email' => true, 'app' => true],
                ]
            );

            [$petName, $species, $breed, $age, $gender] = $profile['pet'];
            Pet::updateOrCreate(
                ['customer_id' => $customer->id, 'name' => $petName],
                [
                    'species' => $species,
                    'breed' => $breed,
                    'age' => $age,
                    'gender' => $gender,
                    'birth_date' => now()->subYears($age)->toDateString(),
                    'notes' => 'Live demo pet profile',
                ]
            );

            $customers[] = $customer->fresh('pets');
        }

        return $customers;
    }

    private function clearPreviousLiveDemoRows(): void
    {
        DB::table('notifications')->where('title', 'like', 'Demo:%')->delete();
        DB::table('inventory_logs')->where('reason', 'like', 'Demo:%')->delete();
        DB::table('customer_order_items')->whereIn('customer_order_id', function ($query) {
            $query->select('id')->from('customer_orders')->where('customer_email', 'like', '%pawesome.demo');
        })->delete();
        DB::table('customer_orders')->where('customer_email', 'like', '%pawesome.demo')->delete();
        DB::table('service_requests')->where('customer_email', 'like', '%pawesome.demo')->delete();
        DB::table('payments')->where('payment_number', 'like', 'PAY-DEMO-%')->delete();
        DB::table('sale_items')->where('notes', 'Live demo sale item')->delete();
        DB::table('sales')->where('transaction_number', 'like', 'TRX-DEMO-%')->delete();
        DB::table('medical_records')->where('notes', 'Live demo veterinary record')->delete();
        DB::table('medical_confinements')->where('customer_email', 'like', '%pawesome.demo')->delete();
        DB::table('appointments')->where('vet_remarks', 'Live demo veterinary appointment')->delete();
        DB::table('boardings')->where('customer_email', 'like', '%pawesome.demo')->delete();
        DB::table('payrolls')->where('payroll_id', 'like', 'PAY-DEMO-%')->delete();
        DB::table('activity_logs')->where('category', 'demo')->delete();
        DB::table('login_logs')->where('user_agent', 'Pawesome live demo seeder')->delete();
    }

    private function ensureRealisticPetshopInventory(): void
    {
        $items = [
            ['DOG-PED-ADULT-15', 'Pedigree Adult Dog Food 1.5kg', 'Food', 'Dog Food', 320, 24, 6, true, 'Mars Petcare', 'Dry adult dog food for daily nutrition.', now()->addMonths(14)],
            ['DOG-PED-PUPPY-15', 'Pedigree Puppy Food 1.5kg', 'Food', 'Dog Food', 350, 18, 5, true, 'Mars Petcare', 'Dry puppy food with balanced growth nutrients.', now()->addMonths(13)],
            ['DOG-AOZI-ORG-1KG', 'Aozi Organic Dog Food 1kg', 'Food', 'Dog Food', 280, 20, 5, true, 'Aozi Philippines', 'Organic dog food for sensitive stomachs.', now()->addMonths(12)],
            ['DOG-VITALITY-3KG', 'Vitality Classic Dog Food 3kg', 'Food', 'Dog Food', 650, 12, 4, true, 'Vitality', 'Classic dry food for adult dogs.', now()->addMonths(16)],
            ['DOG-BEEFPRO-1KG', 'BeefPro Adult Dog Food 1kg', 'Food', 'Dog Food', 180, 30, 8, true, 'Robina Agri Partners', 'Affordable adult dog food with beef flavor.', now()->addMonths(15)],
            ['CAT-WHISKAS-TUNA-12', 'Whiskas Tuna Cat Food 1.2kg', 'Food', 'Cat Food', 290, 22, 6, true, 'Mars Petcare', 'Tuna-flavored dry cat food.', now()->addMonths(14)],
            ['CAT-WHISKAS-JR-11', 'Whiskas Junior Cat Food 1.1kg', 'Food', 'Cat Food', 310, 16, 5, true, 'Mars Petcare', 'Dry food for kittens and junior cats.', now()->addMonths(13)],
            ['CAT-CUTIES-TUNA-1KG', 'Cuties Catz Tuna 1kg', 'Food', 'Cat Food', 185, 28, 8, true, 'Cuties Catz', 'Tuna cat food for everyday feeding.', now()->addMonths(12)],
            ['CAT-SPECIAL-URINARY-1KG', 'Special Cat Urinary 1kg', 'Food', 'Cat Food', 260, 14, 5, true, 'Monge', 'Urinary support cat food.', now()->addMonths(11)],
            ['CAT-AOZI-ORG-1KG', 'Aozi Organic Cat Food 1kg', 'Food', 'Cat Food', 300, 19, 5, true, 'Aozi Philippines', 'Organic dry cat food.', now()->addMonths(12)],
            ['TRT-JERHIGH-STICK', 'JerHigh Chicken Stick', 'Food', 'Pet Treats', 95, 40, 12, true, 'JerHigh', 'Chicken stick treat for dogs.', now()->addMonths(10)],
            ['TRT-SMARTHEART-DOG', 'SmartHeart Dog Treats', 'Food', 'Pet Treats', 120, 35, 10, true, 'SmartHeart', 'Training and reward treats for dogs.', now()->addMonths(10)],
            ['TRT-CATNIP-CAT', 'Catnip Cat Treats', 'Food', 'Pet Treats', 85, 26, 8, true, 'Purrfect Treats', 'Catnip-flavored cat treats.', now()->addMonths(9)],
            ['TRT-DENTAL-CHEW-S', 'Dental Chew Stick Small', 'Health', 'Pet Treats', 150, 18, 6, true, 'Dentalife', 'Dental chew for small dogs.', now()->addMonths(11)],
            ['TRT-BEEF-TRAINING', 'Training Treats Beef Flavor', 'Food', 'Pet Treats', 110, 32, 10, true, 'Pawesome Select', 'Small beef treats for training.', now()->addMonths(10)],
            ['GRM-MADRE-SHAMPOO', 'Madre de Cacao Pet Shampoo 500ml', 'Grooming', 'Pet Shampoo', 180, 20, 6, true, 'Herbal Pet Care', 'Herbal shampoo for dogs and cats.', now()->addMonths(18)],
            ['GRM-FLEA-SHAMPOO', 'Anti-Tick and Flea Shampoo 500ml', 'Grooming', 'Pet Shampoo', 220, 15, 6, true, 'Bearing', 'Anti-tick and flea shampoo.', now()->addMonths(18)],
            ['GRM-COLOGNE-250', 'Pet Cologne 250ml', 'Grooming', 'Grooming Supplies', 150, 24, 8, true, 'Pawesome Grooming', 'Fresh-scent pet cologne.', now()->addMonths(24)],
            ['GRM-NAIL-CLIPPER', 'Nail Clipper for Dogs and Cats', 'Grooming', 'Grooming Supplies', 120, 12, 5, true, 'Pet Groom Pro', 'Stainless nail clipper for small pets.', null],
            ['GRM-SLICKER-BRUSH', 'Slicker Brush', 'Grooming', 'Grooming Supplies', 180, 10, 4, true, 'Pet Groom Pro', 'Brush for detangling and de-shedding.', null],
            ['GRM-PET-TOWEL', 'Pet Towel', 'Grooming', 'Grooming Supplies', 160, 14, 5, true, 'Pawesome Grooming', 'Absorbent towel for baths.', null],
            ['ACC-COLLAR-S', 'Adjustable Dog Collar Small', 'Accessories', 'Collars and Leashes', 120, 25, 8, true, 'Pawesome Gear', 'Small adjustable nylon dog collar.', null],
            ['ACC-COLLAR-M', 'Adjustable Dog Collar Medium', 'Accessories', 'Collars and Leashes', 150, 21, 7, true, 'Pawesome Gear', 'Medium adjustable nylon dog collar.', null],
            ['ACC-LEASH-NYLON', 'Dog Leash Nylon 1.2m', 'Accessories', 'Collars and Leashes', 180, 18, 6, true, 'Pawesome Gear', 'Durable nylon leash.', null],
            ['ACC-CAT-BELL', 'Cat Collar with Bell', 'Accessories', 'Collars and Leashes', 90, 30, 10, true, 'Pawesome Gear', 'Cat collar with safety bell.', null],
            ['ACC-HARNESS-S', 'Pet Harness Small', 'Accessories', 'Pet Accessories', 250, 11, 5, true, 'Pawesome Gear', 'Small pet harness.', null],
            ['ACC-BOWL-SS-S', 'Stainless Pet Bowl Small', 'Accessories', 'Bowls and Feeders', 130, 18, 6, true, 'Pawesome Home', 'Small stainless feeding bowl.', null],
            ['ACC-BOWL-DOUBLE', 'Double Pet Bowl', 'Accessories', 'Bowls and Feeders', 220, 13, 5, true, 'Pawesome Home', 'Double feeding bowl for food and water.', null],
            ['ACC-CARRIER-S', 'Pet Carrier Small', 'Accessories', 'Pet Accessories', 850, 4, 3, true, 'Pawesome Travel', 'Small travel carrier for cats and small dogs.', null],
            ['TOY-CHEW-RUBBER', 'Rubber Chew Toy', 'Toys', 'Pet Toys', 140, 20, 7, true, 'KONG', 'Durable rubber chew toy.', null],
            ['TOY-ROPE-MED', 'Rope Toy Medium', 'Toys', 'Pet Toys', 120, 18, 6, true, 'Mammoth', 'Medium rope tug toy.', null],
            ['TOY-CAT-WAND', 'Cat Teaser Wand', 'Toys', 'Pet Toys', 90, 22, 8, true, 'Da Bird', 'Interactive teaser wand for cats.', null],
            ['TOY-SQUEAKY-BALL', 'Squeaky Ball', 'Toys', 'Pet Toys', 100, 0, 6, true, 'Pawesome Play', 'Squeaky ball toy, currently out of stock.', null],
            ['TOY-TREAT-BALL', 'Interactive Treat Ball', 'Toys', 'Pet Toys', 220, 7, 5, true, 'PetSafe', 'Treat-dispensing enrichment toy.', null],
            ['HYG-LITTER-5L', 'Cat Litter Sand 5L', 'Accessories', 'Litter and Hygiene', 280, 16, 6, true, 'Meowtech', 'Clumping cat litter sand.', null],
            ['HYG-WASTE-BAGS', 'Pet Waste Bags Roll', 'Accessories', 'Litter and Hygiene', 90, 40, 12, true, 'Pawesome Clean', 'Waste bag roll for walks.', null],
            ['HYG-PADS-10', 'Puppy Training Pads 10pcs', 'Accessories', 'Litter and Hygiene', 180, 24, 8, true, 'Pawesome Clean', 'Absorbent puppy training pads.', null],
            ['HYG-EAR-CLEANER', 'Pet Ear Cleaner 60ml', 'Health', 'Litter and Hygiene', 160, 12, 5, true, 'Vet Basics', 'Gentle ear cleaning solution.', now()->addMonths(18)],
            ['HYG-PET-WIPES', 'Pet Wipes 80 sheets', 'Grooming', 'Litter and Hygiene', 150, 20, 6, true, 'Pawesome Clean', 'Gentle pet wipes.', now()->addMonths(24)],
            ['VET-SYRINGE-3ML', 'Disposable Syringe 3ml', 'Health', 'Clinic Consumables', 15, 200, 50, false, 'MedSupply PH', 'Clinic-use disposable syringe.', now()->addMonths(36)],
            ['VET-GLOVES-BOX', 'Disposable Gloves Box', 'Health', 'Clinic Consumables', 280, 10, 4, false, 'MedSupply PH', 'Non-sterile disposable gloves.', now()->addMonths(36)],
            ['VET-GAUZE-PACK', 'Gauze Pads Pack', 'Health', 'Veterinary Supplies', 120, 18, 6, false, 'MedSupply PH', 'Sterile gauze pads for wound care.', now()->addMonths(30)],
            ['VET-COTTON-ROLL', 'Cotton Roll', 'Health', 'Clinic Consumables', 90, 22, 8, false, 'MedSupply PH', 'Clinic cotton roll.', now()->addMonths(30)],
            ['VET-ANTISEPTIC', 'Antiseptic Solution', 'Health', 'Veterinary Supplies', 180, 14, 5, false, 'Vet Basics', 'Topical antiseptic solution.', now()->addMonths(24)],
            ['VET-ECOLLAR-S', 'Elizabeth Collar Small', 'Health', 'Veterinary Supplies', 180, 8, 4, true, 'Vet Basics', 'Small recovery collar.', null],
            ['VET-ECOLLAR-M', 'Elizabeth Collar Medium', 'Health', 'Veterinary Supplies', 220, 7, 4, true, 'Vet Basics', 'Medium recovery collar.', null],
            ['HOTEL-BLANKET', 'Pet Hotel Fleece Blanket', 'Accessories', 'Pet Hotel Supplies', 240, 9, 5, false, 'Pawesome Hotel', 'Washable blanket for boarding rooms.', null],
            ['HOTEL-FEED-SCOOP', 'Pet Hotel Feeding Scoop', 'Accessories', 'Pet Hotel Supplies', 75, 6, 4, false, 'Pawesome Hotel', 'Measuring scoop for kennel feeding.', null],
        ];

        foreach ($items as [$sku, $name, $category, $group, $price, $stock, $reorder, $sellable, $supplier, $description, $expiry]) {
            InventoryItem::updateOrCreate(
                ['sku' => $sku],
                [
                    'name' => $name,
                    'category' => $category,
                    'brand' => Str::before($supplier, ' '),
                    'supplier' => $supplier,
                    'description' => $group . ': ' . $description,
                    'stock' => $stock,
                    'reorder_level' => $reorder,
                    'threshold' => $reorder,
                    'price' => $price,
                    'expiry_date' => $expiry,
                    'status' => 'active',
                    'is_sellable' => $sellable,
                ]
            );
        }
    }

    private function ensureRealisticServiceCatalog(): void
    {
        $services = [
            ['General Check-up', 'Consultation', 500, 30, 'Routine veterinary check-up and wellness exam.'],
            ['Consultation', 'Consultation', 450, 30, 'General veterinary consultation.'],
            ['Vaccination', 'Vaccination', 800, 20, 'Core vaccination service.'],
            ['Deworming', 'Treatment', 350, 15, 'Routine deworming treatment.'],
            ['Anti-Rabies Vaccine', 'Vaccination', 700, 20, 'Anti-rabies vaccination.'],
            ['Skin Consultation', 'Consultation', 600, 30, 'Skin, coat, and allergy consultation.'],
            ['Ear Cleaning Treatment', 'Treatment', 300, 20, 'Ear cleaning and basic treatment.'],
            ['Wound Cleaning', 'Treatment', 500, 30, 'Minor wound cleaning and dressing.'],
            ['Minor Treatment', 'Treatment', 750, 45, 'Minor outpatient veterinary treatment.'],
            ['Emergency Consultation', 'Emergency', 1200, 45, 'Urgent veterinary consultation.'],
            ['Basic Bath and Blow Dry Small Breed', 'Grooming', 350, 60, 'Bath and blow dry for small breeds.'],
            ['Basic Bath and Blow Dry Medium Breed', 'Grooming', 500, 75, 'Bath and blow dry for medium breeds.'],
            ['Full Grooming Small Breed', 'Grooming', 700, 120, 'Full grooming for small breeds.'],
            ['Full Grooming Medium Breed', 'Grooming', 950, 150, 'Full grooming for medium breeds.'],
            ['Nail Trimming', 'Grooming', 150, 15, 'Nail trimming service.'],
            ['Ear Cleaning', 'Grooming', 150, 15, 'Routine grooming ear cleaning.'],
            ['Fur Trimming', 'Grooming', 300, 30, 'Basic fur trimming.'],
            ['Medicated Bath', 'Grooming', 650, 75, 'Medicated bath for skin concerns.'],
            ['Tick and Flea Bath', 'Grooming', 600, 75, 'Tick and flea bath treatment.'],
            ['Dog Boarding Small Breed Per Night', 'Hotel', 500, 1440, 'Overnight boarding for small dogs.'],
            ['Dog Boarding Medium Breed Per Night', 'Hotel', 700, 1440, 'Overnight boarding for medium dogs.'],
            ['Cat Boarding Per Night', 'Hotel', 450, 1440, 'Overnight cat boarding.'],
            ['Day Care Half Day', 'Hotel', 300, 240, 'Half-day pet day care.'],
            ['Day Care Full Day', 'Hotel', 550, 480, 'Full-day pet day care.'],
            ['Premium Boarding with Walk', 'Hotel', 900, 1440, 'Premium boarding with supervised walk.'],
            ['Medical Confinement Per Day', 'Boarding Care', 1200, 1440, 'Medical confinement care per day.'],
            ['IV Fluid Monitoring', 'Treatment', 700, 120, 'IV fluid monitoring service.'],
            ['Post-Surgery Monitoring', 'Boarding Care', 1500, 1440, 'Post-surgery monitoring and care.'],
            ['Isolation Room Care', 'Boarding Care', 1800, 1440, 'Isolation room care for medical cases.'],
        ];

        foreach ($services as [$name, $category, $price, $duration, $description]) {
            Service::updateOrCreate(
                ['name' => $name],
                [
                    'category' => $category,
                    'price' => $price,
                    'duration' => $duration,
                    'duration_minutes' => $duration,
                    'description' => $description,
                    'is_active' => true,
                ]
            );
        }
    }

    private function ensureHotelRooms(): void
    {
        $rooms = [
            ['room_number' => 'H-101', 'name' => 'Small Kennel 101', 'type' => 'kennel', 'size' => 'small', 'capacity' => 1, 'daily_rate' => 650, 'status' => 'available'],
            ['room_number' => 'H-201', 'name' => 'Deluxe Suite 201', 'type' => 'suite', 'size' => 'suite', 'capacity' => 2, 'daily_rate' => 1400, 'status' => 'reserved'],
            ['room_number' => 'C-101', 'name' => 'Quiet Cattery 101', 'type' => 'cattery', 'size' => 'medium', 'capacity' => 1, 'daily_rate' => 850, 'status' => 'available'],
        ];

        foreach ($rooms as $room) {
            HotelRoom::updateOrCreate(['room_number' => $room['room_number']], $room + [
                'description' => 'Live demo room',
                'amenities' => ['climate_control', 'daily_cleaning'],
            ]);
        }
    }

    private function seedCustomerOrders(array $users, array $customers, $items): void
    {
        $statuses = [
            ['pending', 'unpaid', null, null],
            ['approved', 'unpaid', $users['receptionist']->id, now()->subDays(4)],
            ['approved', 'pending', $users['receptionist']->id, now()->subDays(3)],
            ['paid', 'paid', $users['receptionist']->id, now()->subDays(2)],
            ['completed', 'paid', $users['receptionist']->id, now()->subDay()],
            ['rejected', 'unpaid', null, null],
            ['cancelled', 'refunded', $users['receptionist']->id, now()->subDays(5)],
        ];

        foreach ($statuses as $index => [$status, $paymentStatus, $approvedBy, $approvedAt]) {
            $customer = $customers[$index % count($customers)];
            $userId = $customer->user_id;
            $first = $items[$index % $items->count()];
            $second = $items[($index + 1) % $items->count()];
            $total = ($first->price * 2) + $second->price;

            $orderId = DB::table('customer_orders')->insertGetId([
                'customer_id' => $userId,
                'customer_email' => $customer->email,
                'customer_name' => $customer->name,
                'total_amount' => $total,
                'order_type' => $index % 2 === 0 ? 'Pick-up' : 'Delivery',
                'payment_method' => 'GCash',
                'payment_reference' => in_array($paymentStatus, ['pending', 'paid', 'refunded'], true) ? 'GCASH-DEMO-' . ($index + 1) : null,
                'payment_proof' => in_array($paymentStatus, ['pending', 'paid'], true) ? 'demo/payment-proof-' . ($index + 1) . '.jpg' : null,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'paid_at' => $paymentStatus === 'paid' ? now()->subDay() : null,
                'verified_by' => $paymentStatus === 'paid' ? $users['cashier']->id : null,
                'cashier_remarks' => $paymentStatus === 'paid' ? 'Demo: payment verified by cashier' : null,
                'receipt_number' => $paymentStatus === 'paid' ? 'RCPT-DEMO-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) : null,
                'approved_by' => $approvedBy,
                'approved_at' => $approvedAt,
                'rejected_by' => $status === 'rejected' ? $users['receptionist']->id : null,
                'rejected_at' => $status === 'rejected' ? now()->subDays(2) : null,
                'rejection_reason' => $status === 'rejected' ? 'Demo: item unavailable' : null,
                'created_at' => now()->subDays(7 - $index),
                'updated_at' => now(),
            ]);

            foreach ([[$first, 2], [$second, 1]] as [$item, $quantity]) {
                DB::table('customer_order_items')->insert([
                    'customer_order_id' => $orderId,
                    'inventory_item_id' => $item->id,
                    'product_name' => $item->name,
                    'quantity' => $quantity,
                    'price' => $item->price,
                    'subtotal' => $item->price * $quantity,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function seedServiceRequests(array $users, array $customers): void
    {
        $requests = [
            ['veterinary', 'General Consultation', 'pending', 'pending'],
            ['grooming', 'Full Grooming', 'approved', 'unpaid'],
            ['pet_hotel', 'Pet Hotel Boarding', 'approved', 'paid'],
            ['medical_confinement', 'Medical Confinement', 'approved', 'pending'],
            ['grooming', 'Bath and Dry', 'rejected', 'unpaid'],
        ];

        foreach ($requests as $index => [$type, $service, $status, $paymentStatus]) {
            $customer = $customers[$index % count($customers)];
            $pet = $customer->pets->first();

            DB::table('service_requests')->insert([
                'customer_id' => $customer->user_id,
                'pet_id' => $pet?->id,
                'request_type' => $type,
                'service_type' => $type,
                'service_name' => $service,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'pet_name' => $pet?->name,
                'preferred_date' => now()->addDays($index + 1)->toDateString(),
                'preferred_time' => '10:00:00',
                'request_date' => now()->addDays($index + 1)->toDateString(),
                'request_time' => '10:00 AM',
                'status' => $status,
                'payment_status' => $paymentStatus,
                'approved_by' => $status === 'approved' ? $users['receptionist']->id : null,
                'approved_at' => $status === 'approved' ? now()->subDay() : null,
                'rejected_by' => $status === 'rejected' ? $users['receptionist']->id : null,
                'rejected_at' => $status === 'rejected' ? now()->subDay() : null,
                'rejection_reason' => $status === 'rejected' ? 'Demo: requested slot unavailable' : null,
                'payment_method' => $paymentStatus !== 'unpaid' ? 'GCash' : null,
                'payment_reference' => $paymentStatus !== 'unpaid' ? 'SRV-DEMO-' . ($index + 1) : null,
                'payment_proof' => $paymentStatus === 'pending' ? 'demo/service-proof.jpg' : null,
                'paid_at' => $paymentStatus === 'paid' ? now() : null,
                'verified_by' => $paymentStatus === 'paid' ? $users['cashier']->id : null,
                'cashier_remarks' => $paymentStatus === 'paid' ? 'Demo: service payment verified' : null,
                'notes' => 'Live demo service request',
                'created_at' => now()->subDays($index + 2),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedVeterinaryWorkflow(array $users, array $customers)
    {
        $service = Service::firstOrCreate(
            ['name' => 'General Consultation'],
            ['category' => 'Consultation', 'price' => 850, 'description' => 'General veterinary consultation', 'is_active' => true]
        );

        $statuses = ['scheduled', 'in_progress', 'completed'];
        $appointments = collect();
        foreach ($statuses as $index => $status) {
            $customer = $customers[$index % count($customers)];
            $pet = $customer->pets->first();
            $appointment = Appointment::create([
                'customer_id' => $customer->id,
                'pet_id' => $pet->id,
                'service_id' => $service->id,
                'veterinarian_id' => $users['vet']->id,
                'status' => $status,
                'scheduled_at' => now()->addDays($index + 1),
                'started_at' => in_array($status, ['in_progress', 'completed'], true) ? now()->subHours(2) : null,
                'completed_at' => $status === 'completed' ? now()->subHour() : null,
                'price' => $service->price,
                'payment_status' => $status === 'completed' ? 'paid' : 'unpaid',
                'diagnosis' => $status === 'completed' ? 'Mild dermatitis' : null,
                'treatment_notes' => $status === 'completed' ? 'Cleaned affected area and prescribed medicated shampoo.' : null,
                'prescription' => $status === 'completed' ? 'Medicated shampoo twice weekly for 3 weeks.' : null,
                'vet_remarks' => 'Live demo veterinary appointment',
            ]);
            $appointments->push($appointment);
        }

        MedicalRecord::create([
            'pet_id' => $appointments->last()->pet_id,
            'appointment_id' => $appointments->last()->id,
            'veterinarian_id' => $users['vet']->id,
            'visit_date' => now()->subHour(),
            'chief_complaint' => 'Itchy skin and redness',
            'symptoms' => 'Scratching, mild redness',
            'physical_examination' => 'Normal appetite, mild skin irritation',
            'diagnosis' => 'Mild dermatitis',
            'treatment_plan' => 'Topical medicated shampoo and follow-up',
            'follow_up_instructions' => 'Return in two weeks if symptoms persist',
            'weight_kg' => 12.4,
            'temperature_celsius' => 38.4,
            'heart_rate' => 92,
            'respiratory_rate' => 24,
            'body_condition_score' => '4/9',
            'status' => 'finalized',
            'is_editable' => true,
            'notes' => 'Live demo veterinary record',
        ]);

        return $appointments;
    }

    private function seedBoardingAndConfinement(array $users, array $customers, $appointments): void
    {
        $room = HotelRoom::where('room_number', 'H-201')->first();
        $customer = $customers[3];
        $pet = $customer->pets->first();

        DB::table('boardings')->insert([
            'pet_id' => $pet->id,
            'pet_name' => $pet->name,
            'pet_type' => $pet->species,
            'pet_breed' => $pet->breed,
            'customer_id' => $customer->id,
            'customer_email' => $customer->email,
            'customer_name' => $customer->name,
            'hotel_room_id' => $room?->id,
            'stay_type' => 'hotel_boarding',
            'check_in' => now()->addDays(2),
            'check_out' => now()->addDays(5),
            'status' => 'approved',
            'total_amount' => 4200,
            'payment_status' => 'pending',
            'payment_method' => 'GCash',
            'payment_reference' => 'BOARD-DEMO-001',
            'payment_proof' => 'demo/boarding-proof.jpg',
            'approved_by' => $users['receptionist']->id,
            'approved_at' => now()->subDay(),
            'special_requests' => 'Quiet room preferred',
            'feeding_instructions' => 'Feed twice daily',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('medical_confinements')->insert([
            'consultation_id' => $appointments->last()->id,
            'customer_id' => $customers[2]->id,
            'customer_email' => $customers[2]->email,
            'customer_name' => $customers[2]->name,
            'pet_id' => $customers[2]->pets->first()->id,
            'pet_name' => $customers[2]->pets->first()->name,
            'vet_id' => $users['vet']->id,
            'room_id' => HotelRoom::where('room_number', 'C-101')->value('id'),
            'diagnosis' => 'Observation after dehydration',
            'reason_for_confinement' => 'Needs fluid therapy and overnight monitoring',
            'urgency_level' => 'normal',
            'expected_stay_days' => 2,
            'treatment_plan' => 'Fluids and vitals monitoring',
            'medication_plan' => 'As prescribed by veterinarian',
            'estimated_cost' => 3500,
            'final_amount' => 3500,
            'status' => 'admitted',
            'payment_status' => 'unpaid',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function seedSalesAndPayments(array $users, array $customers, $items): array
    {
        $sales = [];
        $paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
        foreach ($paymentStatuses as $index => $paymentStatus) {
            $item = $items[$index % $items->count()];
            $quantity = $index + 1;
            $subtotal = $item->price * $quantity;
            $saleId = DB::table('sales')->insertGetId([
                'customer_id' => $customers[$index % count($customers)]->id,
                'cashier_id' => $users['cashier']->id,
                'product_id' => $item->id,
                'transaction_number' => 'TRX-DEMO-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'type' => 'product',
                'status' => $paymentStatus === 'pending' ? 'pending' : 'completed',
                'payment_type' => $index % 2 === 0 ? 'cash' : 'gcash',
                'payment_method' => $index % 2 === 0 ? 'cash' : 'gcash',
                'subtotal' => $subtotal,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => $subtotal,
                'amount' => $subtotal,
                'created_at' => now()->subDays($index + 1),
                'updated_at' => now(),
            ]);

            DB::table('sale_items')->insert([
                'sale_id' => $saleId,
                'product_id' => $item->id,
                'item_name' => $item->name,
                'item_type' => 'product',
                'quantity' => $quantity,
                'unit_price' => $item->price,
                'discount_amount' => 0,
                'total_price' => $subtotal,
                'notes' => 'Live demo sale item',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('payments')->insert([
                'sale_id' => $saleId,
                'payment_number' => 'PAY-DEMO-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'payment_method' => $index % 2 === 0 ? 'cash' : 'gcash',
                'reference_number' => $index % 2 === 0 ? null : 'GCASH-POS-DEMO-' . ($index + 1),
                'amount' => $subtotal,
                'change_amount' => 0,
                'status' => $paymentStatus,
                'paid_at' => $paymentStatus === 'completed' ? now()->subDay() : null,
                'notes' => 'Live demo POS payment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sales[] = ['id' => $saleId, 'item' => $item, 'quantity' => $quantity];
        }

        return $sales;
    }

    private function seedInventoryLogs(array $users, $items, array $sales): void
    {
        $examples = [
            [$sales[1]['item'], -$sales[1]['quantity'], 'Demo: POS sale deduction', 'sale', $sales[1]['id']],
            [$items[2], -2, 'Demo: receptionist-approved order deduction', 'customer_order', null],
            [$items[2], 2, 'Demo: stock restore after cancelled approved order', 'customer_order_cancelled', null],
            [$items[3], 5, 'Demo: manual stock adjustment', 'adjustment', null],
            [$items->last(), 0, 'Demo: low stock alert reviewed', 'low_stock', null],
        ];

        foreach ($examples as [$item, $delta, $reason, $referenceType, $referenceId]) {
            $before = $item->stock;
            $after = max(0, $before + $delta);
            DB::table('inventory_logs')->insert([
                'inventory_item_id' => $item->id,
                'delta' => $delta,
                'quantity' => abs($delta),
                'previous_stock' => $before,
                'new_stock' => $after,
                'stock_before' => $before,
                'stock_after' => $after,
                'reason' => $reason,
                'performed_by' => $users['inventory']->name,
                'role' => 'inventory',
                'user_id' => $users['inventory']->id,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'movement_type' => $delta < 0 ? 'stock_deduction' : ($delta > 0 ? 'stock_addition' : 'stock_review'),
                'type' => $delta < 0 ? 'sale' : 'adjustment',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedNotifications(array $users): void
    {
        $notifications = [
            ['customer', 'Demo: Order submitted', 'Your order was submitted and is waiting for review.', 'info'],
            ['customer', 'Demo: Order approved', 'Your order was approved. You may upload payment proof.', 'success'],
            ['customer', 'Demo: Order rejected', 'Your order was rejected by reception.', 'error'],
            ['cashier', 'Demo: Payment proof submitted', 'A customer uploaded proof for verification.', 'info'],
            ['customer', 'Demo: Payment verified', 'Your payment was verified by cashier.', 'success'],
            ['customer', 'Demo: Payment rejected', 'Your payment proof was rejected.', 'error'],
            ['receptionist', 'Demo: Service request submitted', 'A customer submitted a service request.', 'info'],
            ['customer', 'Demo: Service scheduled', 'Your service request has been scheduled.', 'success'],
            ['customer', 'Demo: Service completed', 'Your service has been completed.', 'success'],
            ['inventory', 'Demo: Low stock alert', 'One or more inventory items are below reorder level.', 'warning'],
            ['veterinary', 'Demo: Veterinary appointment scheduled', 'A veterinary appointment is ready for consultation.', 'info'],
        ];

        foreach ($notifications as [$role, $title, $message, $type]) {
            DB::table('notifications')->insert([
                'user_id' => $role === 'customer' ? $users['customer']->id : null,
                'role' => $role,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'read' => false,
                'data' => json_encode(['demo' => true]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedPayroll(array $users): void
    {
        foreach (['receptionist', 'cashier', 'inventory', 'vet', 'manager'] as $index => $key) {
            $user = $users[$key];
            $gross = 32000 + ($index * 1500);
            $deductions = 3500 + ($index * 100);
            DB::table('payrolls')->insert([
                'payroll_id' => 'PAY-DEMO-' . strtoupper($key),
                'user_id' => $user->id,
                'department' => $user->department ?? 'Operations',
                'position' => $user->position ?? 'Staff',
                'base_salary' => $gross,
                'hourly_rate' => $user->hourly_rate ?? 180,
                'working_days' => 22,
                'present_days' => 21,
                'absent_days' => 1,
                'regular_hours' => 168,
                'overtime_hours' => 4,
                'overtime_pay' => 1080,
                'bonus' => 500,
                'allowances' => 1200,
                'deductions' => 300,
                'tax_deduction' => 1800,
                'sss_contribution' => 900,
                'philhealth_contribution' => 500,
                'pagibig_contribution' => 100,
                'late_deductions' => 100,
                'absent_deductions' => 800,
                'gross_pay' => $gross + 2780,
                'net_pay' => ($gross + 2780) - $deductions,
                'pay_period_start' => now()->startOfMonth()->toDateString(),
                'pay_period_end' => now()->endOfMonth()->toDateString(),
                'pay_period_label' => now()->format('F Y'),
                'status' => $index % 2 === 0 ? 'paid' : 'pending',
                'payment_date' => $index % 2 === 0 ? now()->toDateString() : null,
                'payment_method' => 'bank_transfer',
                'remarks' => 'Live demo payroll record',
                'processed_by' => $users['payroll']->id,
                'processed_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function seedAuditLogs(array $users, $now): void
    {
        foreach (['admin', 'manager', 'receptionist', 'cashier'] as $index => $key) {
            DB::table('activity_logs')->insert([
                'user_id' => $users[$key]->id,
                'action' => 'demo.workflow.checked',
                'description' => 'Live demo workflow activity for ' . $key,
                'category' => 'demo',
                'reference_type' => 'seed',
                'reference_id' => (string) ($index + 1),
                'metadata' => json_encode(['demo' => true]),
                'ip_address' => '127.0.0.1',
                'status' => 'completed',
                'created_at' => $now->copy()->subMinutes($index * 5),
                'updated_at' => now(),
            ]);

            DB::table('login_logs')->insert([
                'user_id' => $users[$key]->id,
                'email' => $users[$key]->email,
                'action' => 'login',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Pawesome live demo seeder',
                'status' => 'success',
                'created_at' => $now->copy()->subMinutes($index * 8),
                'updated_at' => now(),
            ]);
        }
    }
}
