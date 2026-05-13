<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BoardingRoomsSeederFixed extends Seeder
{
    /**
     * Run database seeds.
     */
    public function run(): void
    {
        DB::table('boarding_rooms')->delete();
        
        $rooms = [
            [
                'room_code' => 'DOG_STD',
                'room_name' => 'Standard Dog Kennel',
                'room_type' => 'dog_standard',
                'allowed_species' => json_encode(['dog']),
                'max_capacity' => 1,
                'total_rooms' => 8,
                'daily_rate' => 350.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Standard kennel for dogs up to 30kg',
            ],
            [
                'room_code' => 'DOG_LARGE',
                'room_name' => 'Large Dog Kennel',
                'room_type' => 'dog_large',
                'allowed_species' => json_encode(['dog']),
                'max_capacity' => 1,
                'total_rooms' => 4,
                'daily_rate' => 500.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Spacious kennel for large dogs over 30kg',
            ],
            [
                'room_code' => 'DOG_FAMILY',
                'room_name' => 'Dog Family Suite',
                'room_type' => 'dog_family',
                'allowed_species' => json_encode(['dog']),
                'max_capacity' => 2,
                'total_rooms' => 2,
                'daily_rate' => 750.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Family suite allowing 2 dogs from same owner',
            ],
            [
                'room_code' => 'CAT_CONDO',
                'room_name' => 'Cat Condo',
                'room_type' => 'cat_condo',
                'allowed_species' => json_encode(['cat']),
                'max_capacity' => 1,
                'total_rooms' => 6,
                'daily_rate' => 300.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Comfortable condo for single cat',
            ],
            [
                'room_code' => 'CAT_SUITE',
                'room_name' => 'Cat Suite',
                'room_type' => 'cat_suite',
                'allowed_species' => json_encode(['cat']),
                'max_capacity' => 2,
                'total_rooms' => 2,
                'daily_rate' => 550.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Spacious suite for 2 cats from same owner',
            ],
            [
                'room_code' => 'SMALL_PET',
                'room_name' => 'Small Pet Enclosure',
                'room_type' => 'small_pet',
                'allowed_species' => json_encode(['rabbit', 'hamster', 'guinea pig', 'bird']),
                'max_capacity' => 1,
                'total_rooms' => 4,
                'daily_rate' => 250.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Safe enclosure for small pets',
            ],
            [
                'room_code' => 'AQUATIC',
                'room_name' => 'Aquatic Boarding Tank',
                'room_type' => 'aquatic',
                'allowed_species' => json_encode(['fish']),
                'max_capacity' => 1,
                'total_rooms' => 2,
                'daily_rate' => 200.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Temperature-controlled aquatic tank for fish',
            ],
            [
                'room_code' => 'REPTILE',
                'room_name' => 'Reptile Terrarium',
                'room_type' => 'reptile',
                'allowed_species' => json_encode(['reptile']),
                'max_capacity' => 1,
                'total_rooms' => 2,
                'daily_rate' => 250.00,
                'is_active' => true,
                'customer_selectable' => true,
                'notes' => 'Climate-controlled terrarium for reptiles',
            ],
            [
                'room_code' => 'ISOLATION',
                'room_name' => 'Isolation Room',
                'room_type' => 'isolation',
                'allowed_species' => json_encode(['dog', 'cat', 'rabbit', 'hamster', 'guinea pig', 'bird', 'fish', 'reptile']),
                'max_capacity' => 1,
                'total_rooms' => 2,
                'daily_rate' => 600.00,
                'is_active' => true,
                'customer_selectable' => false,
                'notes' => 'Isolation room for sick or recovering pets - staff only',
            ],
        ];

        DB::table('boarding_rooms')->insert($rooms);
    }
}
