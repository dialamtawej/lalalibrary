<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'parent_id'   => null, // تصنيف رئيسي
                'name'        => 'روايات رومانسية وغموض',
                'slug'        => 'romance-and-mystery-novels',
                'description' => 'روايات تجمع بين المشاعر العميقة، الأسرار،   ',
                'status'      => 'active'
            ],
            [
                'parent_id'   => null,
                'name'        => 'روايات عالمية ومترجمة',
                'slug'        => 'translated-and-world-novels',
                'description' => 'أشهر الأعمال الأدبية المترجمة من مختلف ثقافات العالم',
                'status'      => 'active'
            ],
            [
                'parent_id'   => null,
                'name'        => 'برمجة وتطوير الويب',
                'slug'        => 'web-development-and-programming',
                'description' => 'كتب تقنية في لغات البرمجة، إطار عمل لارافيل، وإدارة قواعد البيانات',
                'status'      => 'active'
            ],
            [
                'parent_id'   => null,
                'name'        => 'تطوير الذات  ',
                'slug'        => 'self-development-and-habits',
                'description' => 'كتب التحفيز، بناء العادات الإيجابية،   ',
                'status'      => 'active'
            ],
            [
                'parent_id'   => null,
                'name'        => 'فلسفة ',
                'slug'        => 'philosophy-and-life-reflections',
                'description' => 'كتب فلسفية   تلامس أبعاد التفكير الإنساني',
                'status'      => 'active'
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
