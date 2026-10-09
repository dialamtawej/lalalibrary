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
        Schema::create('edition_assets', function (Blueprint $table) {
            $table->foreignId('edition_id')->constrained('people')->onDelete('cascade');
            $table->foreignId('media_asset_id')->constrained()->onDelete('cascade');
            $table->primary(['edition_id', 'media_asset_id','asset_role']);
            $table->string('asset_role',50);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('edition_assets');
    }
};
