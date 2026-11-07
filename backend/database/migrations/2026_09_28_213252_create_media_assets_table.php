<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_type',50);
            $table->string('storage_key',500);
            $table->string('original_name',255)->nullable();
            $table->string('mime_type',100)->nullable();
            $table->string('checksum')->nullable();
            $table->bigInteger('file_size')->nullable();
           $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
