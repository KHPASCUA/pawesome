<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('booking_requests', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name', 100);
            $table->string('request_type', 50);
            $table->string('service_name', 100);
            $table->date('request_date');
            $table->enum('status', ['pending', 'approved', 'rejected', 'rescheduled', 'paid', 'in_progress', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('booking_requests');
    }
};
