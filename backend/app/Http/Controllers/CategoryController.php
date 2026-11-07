<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Models\Category;

class CategoryController extends Controller
{
    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل: المسار كان يتطلب تسجيل الدخول، بينما الزائر يجب أن يتصفح
    التصنيفات. أصبح GET /categories عامًا ويعيد التصنيفات النشطة فقط مع عدد
    الكتب في كل تصنيف (books_count). شكل الاستجابة { status, categories } كما هو.
    ========================================================
    */
    // public function index()
    // {
    //     $categories = Category::all(); // جلب جميع التصنيفات التي أنشأناها بالسيدر
    //
    //     return response()->json([
    //         'status' => true,
    //         'categories' => $categories
    //     ], 200);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    ========================================================
    */
    public function index()
    {
        $categories = Category::where('status', 'active')
            ->withCount('books')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => true,
            'categories' => $categories
        ], 200);
    }

    /*
    ========================================================
    ADDED - إدارة التصنيفات (أدمن)
    GET    /admin/categories        كل التصنيفات (نشطة وغير نشطة)
    POST   /admin/categories        إضافة
    PATCH  /admin/categories/{id}   تعديل
    DELETE /admin/categories/{id}   حذف
    ========================================================
    */
    public function adminIndex()
    {
        $categories = Category::withCount('books')->with('parent:id,name')->orderBy('name')->get();

        return response()->json(['status' => true, 'categories' => $categories], 200);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:100|alpha_dash|unique:categories,slug',
            'description' => 'nullable|string|max:1000',
            'status'      => 'required|in:active,inactive',
            'parent_id'   => 'nullable|integer|exists:categories,id',
        ]);

        $data['slug'] = $data['slug'] ?? $this->uniqueSlug($data['name']);

        $category = Category::create($data);

        return response()->json(['message' => 'تمت إضافة التصنيف بنجاح', 'category' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'التصنيف غير موجود'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:100',
            'slug'        => ['sometimes', 'required', 'string', 'max:100', 'alpha_dash', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => 'nullable|string|max:1000',
            'status'      => 'sometimes|required|in:active,inactive',
            // التصنيف لا يمكن أن يكون أبًا لنفسه
            'parent_id'   => ['nullable', 'integer', 'exists:categories,id', Rule::notIn([$category->id])],
        ]);

        $category->update($data);

        return response()->json(['message' => 'تم تعديل التصنيف بنجاح', 'category' => $category], 200);
    }

    public function destroy($id)
    {
        $category = Category::withCount('books')->find($id);
        if (!$category) {
            return response()->json(['message' => 'التصنيف غير موجود'], 404);
        }

        // حماية: لا نحذف تصنيفًا مرتبطًا بكتب، لأن الحذف يزيل الربط من book_categories
        // (cascade) فتبقى الكتب بلا تصنيف دون أن ينتبه الأدمن.
        if ($category->books_count > 0) {
            return response()->json(['message' => 'لا يمكن حذف تصنيف مرتبط بكتب. انقلي الكتب أو عطّلي التصنيف بدلًا من ذلك'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'تم حذف التصنيف بنجاح'], 200);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $i = 2;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
