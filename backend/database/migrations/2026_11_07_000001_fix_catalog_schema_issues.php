<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
========================================================
Migration تصحيحية - مراجعة
لماذا Migration جديدة بدل تعديل الملفات القديمة؟
الـ Migrations القديمة ربما نُفذت فعلًا على قواعد بيانات (جهاز المطورة،
Docker...). تعديلها لا يؤثر على قاعدة نُفذت عليها مسبقًا، فتصبح القواعد
مختلفة عن الكود. القاعدة: Migration نُفذت = تاريخ لا يُعدَّل، والتصحيح
يكون بـ Migration جديدة.

التصحيحات:
1) edition_assets.edition_id كان مربوطًا بجدول people بدل editions
   (create_edition_assets_table.php: constrained('people')).
2) book_credits.diaplay_order خطأ إملائي -> display_order.
3) publishers.website كان إجباريًا، والناشر قد لا يملك موقعًا.
========================================================
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('edition_assets', function (Blueprint $table) {
            $table->dropForeign(['edition_id']);
            $table->foreign('edition_id')->references('id')->on('editions')->onDelete('cascade');
        });

        Schema::table('book_credits', function (Blueprint $table) {
            $table->renameColumn('diaplay_order', 'display_order');
        });

        Schema::table('publishers', function (Blueprint $table) {
            $table->string('website')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('publishers', function (Blueprint $table) {
            $table->string('website')->nullable(false)->change();
        });

        Schema::table('book_credits', function (Blueprint $table) {
            $table->renameColumn('display_order', 'diaplay_order');
        });

        Schema::table('edition_assets', function (Blueprint $table) {
            $table->dropForeign(['edition_id']);
            $table->foreign('edition_id')->references('id')->on('people')->onDelete('cascade');
        });
    }
};
