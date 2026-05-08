<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            if (Schema::hasColumn('boardings', 'pet_id')) {
                DB::statement('ALTER TABLE boardings MODIFY pet_id BIGINT UNSIGNED NULL');
            }

            if (Schema::hasColumn('boardings', 'hotel_room_id')) {
                DB::statement('ALTER TABLE boardings MODIFY hotel_room_id BIGINT UNSIGNED NULL');
            }
        }
    }

    public function down(): void
    {
        // Keep nullable columns on rollback to avoid breaking customer-submitted draft requests.
    }
};
