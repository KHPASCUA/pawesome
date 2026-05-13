<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoardingRoomsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('boarding_rooms')->delete();
        
        $rooms = [];

        // 10 Small Dog Kennels (101-110)
        for ($i = 101; $i <= 110; $i++) {
            $rooms[] = [
                'room_code' => 'SK' . $i,
                'room_name' => 'Small Kennel ' . $i,
                'room_type' => 'small_kennel',
                'allowed_species' => json_encode(['dog']),
                'max_capacity' => 1,
                'total_rooms' => 1,
                'daily_rate' => 500.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Small kennel for dogs up to 15kg',
            ];
        }

        // 5 Large Dog Kennels (201-205)
        for ($i = 201; $i <= 205; $i++) {
            $rooms[] = [
                'room_code' => 'LK' . $i,
                'room_name' => 'Large Kennel ' . $i,
                'room_type' => 'large_kennel',
                'allowed_species' => json_encode(['dog']),
                'max_capacity' => 1,
                'total_rooms' => 1,
                'daily_rate' => 750.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Large kennel for dogs over 15kg',
            ];
        }

        // 10 Small Cat Catteries (301-310)
        for ($i = 301; $i <= 310; $i++) {
            $rooms[] = [
                'room_code' => 'SC' . $i,
                'room_name' => 'Small Cattery ' . $i,
                'room_type' => 'small_cattery',
                'allowed_species' => json_encode(['cat']),
                'max_capacity' => 1,
                'total_rooms' => 1,
                'daily_rate' => 400.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Small cattery for cats up to 4kg',
            ];
        }

        // 5 Large Cat Catteries (401-405)
        for ($i = 401; $i <= 405; $i++) {
            $rooms[] = [
                'room_code' => 'LC' . $i,
                'room_name' => 'Large Cattery ' . $i,
                'room_type' => 'large_cattery',
                'allowed_species' => json_encode(['cat']),
                'max_capacity' => 1,
                'total_rooms' => 1,
                'daily_rate' => 600.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Large cattery for cats over 4kg',
            ];
        }

        // 10 Small Pet Enclosures (501-510)
        for ($i = 501; $i <= 510; $i++) {
            $rooms[] = [
                'room_code' => 'SPE' . $i,
                'room_name' => 'Small Pet Enclosure ' . $i,
                'room_type' => 'small_pet',
                'allowed_species' => json_encode(['bird', 'small_pet']),
                'max_capacity' => 1,
                'total_rooms' => 1,
                'daily_rate' => 300.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Small pet enclosure for birds, rabbits, hamsters, and other small animals',
            ];
        }

        DB::table('boarding_rooms')->insert($rooms);
    }
}
