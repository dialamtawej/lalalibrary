<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل: القائمة كانت للأدمن فقط، بينما الدراسة تطلب أن يتصفح الزائر
    الكتب ويبحث فيها. أصبح المسار GET /books عامًا، وأُضيف:
      - category : فلترة حسب التصنيف (slug أو id)
      - sort     : latest (الافتراضي) | oldest | title
      - per_page : عدد العناصر في الصفحة (1..50، الافتراضي 12)
    وكان الترتيب غير محدد (قاعدة البيانات تعيد أي ترتيب)، فصار الأحدث أولًا.
    شكل الاستجابة لم يتغير: { message, data: <Laravel paginator> }.
    ========================================================
    */
    // public function index(Request $request){
    //     $query =Book::with(['categories']);
    //     if ($request->has('search') && !empty($request->search)){
    //         $search= $request->search;
    //         $query->where(function($q)use($search){
    //             $q->where('title','like', "%{$search}%")
    //             ->orWhere('description','like',"%{$search}%");
    //         });
    //     }
    //     $books = $query->paginate(10);
    //     return response()->json(['message'=>'تم جلب قائمة الكتب و الروايات بنجاح',
    //                               'data'=> $books], 200);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    ========================================================
    */
    public function index(Request $request){
        $request->validate(['search'   => 'nullable|string|max:100',
                            'category' => 'nullable|string|max:100',
                            'sort'     => 'nullable|in:latest,oldest,title',
                            'per_page' => 'nullable|integer|min:1|max:50']);

        $query =Book::with(['categories']);
        if ($request->filled('search')){
            $search= $request->search;
            $query->where(function($q)use($search){
                $q->where('title','like', "%{$search}%")
                ->orWhere('description','like',"%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $category = $request->category;
            $query->whereHas('categories', function ($q) use ($category) {
                $q->where('categories.slug', $category)->orWhere('categories.id', $category);
            });
        }

        match ($request->input('sort', 'latest')) {
            'oldest' => $query->oldest()->orderBy('id'),
            'title'  => $query->orderBy('title'),
            default  => $query->latest()->orderByDesc('id'),
        };

        $books = $query->paginate($request->integer('per_page', 12))->withQueryString();
        return response()->json(['message'=>'تم جلب قائمة الكتب و الروايات بنجاح',
                                  'data'=> $books], 200);
    }

    /*
    ========================================================
    ADDED - عرض كتاب واحد (عام)
    GET /books/{slug}
    ========================================================
    */
    public function show(string $slug){
        $book = Book::with('categories')->where('slug', $slug)->first();
        if (!$book) {
            return response()->json(['message' => 'الكتاب غير موجود'], 404);
        }
        return response()->json(['message' => 'تم جلب تفاصيل الكتاب بنجاح',
                                 'data' => $book], 200);
    }

    public function store(Request $request){
        $request->validate(['title'=> 'required|string|max:255',
                             'description'=> 'nullable|string',
                             'categories'=> 'required|array',
                             'categories.*'=> 'exists:categories,id',
                             'file'=> 'nullable|file|mimes:pdf,epub|max:20480',
                             'cover_image'=> 'nullable|image|mimes:jpeg,png,jpg|max:5120',]);
        $filePath = null;
        if ($request->hasFile('file')){
            $file = $request->file('file');
            $filename= time() . '_' .
            Str::slug($request->title) . '.' .
            $file->getClientOriginalExtension();
            // ملاحظة مراجعة: كان الملف يُحفظ على القرص public، أي أن أي شخص يعرف
            // الرابط يستطيع تنزيل الكتاب كاملًا بدون تسجيل دخول. أصبح يُحفظ على القرص
            // الخاص local (storage/app/private) ويُقدَّم لاحقًا عبر Endpoint محمي للقراءة.
            // $filePath= $file->storeAs('books/files',$filename, 'public');
            $filePath= $file->storeAs('books/files',$filename, 'local');

        }
        $coverPath = null;
        if($request->hasFile('cover_image')){
            $cover =$request->file('cover_image');
            $coverName= time() . '_cover_' . 
            Str::slug($request->title) . '.' . 
            $cover->getClientOriginalExtension();
            $coverPath= $cover->storeAs('books/covers',$coverName, 'public');
        }  
        /*
        ========================================================
        PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
        سبب التعديل: إنشاء الكتاب وربط التصنيفات عمليتان منفصلتان؛ إذا فشلت
        الثانية يبقى كتاب بلا تصنيفات في قاعدة البيانات. وضعناهما داخل
        Transaction حتى تنجحا معًا أو تُلغيا معًا، ونحذف الملفات المرفوعة إن فشلت.
        ========================================================
        */
        // $book = Book::create(['title' =>$request->title,
        //                        'slug'=> Str::slug($request->title) . '-' . time(),
        //                        'description' =>$request->description,
        //                        'file_path'=> $filePath,
        //                        'cover_image' => $coverPath,]);
        //         if ($request->has('categories')){
        //             $book->categories()->attach($request->categories);
        //         }
        /*
        ========================================================
        UPDATED IMPLEMENTATION
        ========================================================
        */
        try {
            $book = DB::transaction(function () use ($request, $filePath, $coverPath) {
                $book = Book::create(['title' =>$request->title,
                                       'slug'=> Str::slug($request->title) . '-' . time(),
                                       'description' =>$request->description,
                                       'file_path'=> $filePath,
                                       'cover_image' => $coverPath,]);
                if ($request->has('categories')){
                    $book->categories()->attach($request->categories);
                }
                return $book;
            });
        } catch (\Throwable $e) {
            if ($filePath) { Storage::disk('local')->delete($filePath); }
            if ($coverPath) { Storage::disk('public')->delete($coverPath); }
            throw $e;
        }
        $book->load('categories');
        return response()->json(['message' => 'تم اضافة الكتاب بنجاح',
                                  'data' => $book ], 201);                    

    }

    public function updateBook(Request $request, $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json([
                'message' => 'الكتاب غير موجود', ], 404); }

        $validatedData = $request->validate(['title' => 'sometimes|required|string|max:255',
                                             'description' => 'nullable|string',
                                             'categories' => 'sometimes|array',
                                             'categories.*' => 'exists:categories,id',
                                             'file' => 'nullable|file|mimes:pdf,epub|max:20480',
                                      'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:5120', ]);

        /*
        ========================================================
        PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
        سبب التعديل: كان الـ slug يتغير مع كل تعديل للعنوان (حتى تصحيح حرف)،
        فتنكسر روابط صفحة الكتاب المحفوظة أو المشاركة. الـ slug معرّف ثابت
        للرابط، لذلك يُنشأ مرة واحدة عند الإضافة فقط.
        ========================================================
        */
        // if ($request->has('title')) {
        //     $book->title = $request->title;
        //     $book->slug = Str::slug($request->title) . '-' . time();
        // }
        /*
        ========================================================
        UPDATED IMPLEMENTATION
        ========================================================
        */
        if ($request->has('title')) {
            $book->title = $request->title;
        }

        if ($request->has('description')) {
            $book->description = $request->description;
        }

        $filesToDelete = [];
        $coversToDelete = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . 
            Str::slug($book->title) . '.' . 
            $file->getClientOriginalExtension();
            // ملاحظة مراجعة: (1) الحفظ على القرص الخاص local بدل public كما في store.
            // (2) حذف الملف القديم بعد رفع الجديد، لأنه كان يبقى في التخزين بلا استخدام.
            // $book->file_path = $file->storeAs('books/files', $filename, 'public');
            $oldFilePath = $book->file_path;
            $book->file_path = $file->storeAs('books/files', $filename, 'local');
            // الحذف الفعلي يتم بعد save() حتى لا نخسر الملف القديم إن فشل الحفظ
            if ($oldFilePath && $oldFilePath !== $book->file_path) { $filesToDelete[] = $oldFilePath; }
        }

        if ($request->hasFile('cover_image')) {
            $image = $request->file('cover_image');
            $imagename = time() . '_cover_' . 
            Str::slug($book->title) . '.' . 
            $image->getClientOriginalExtension();
            // ملاحظة مراجعة: حذف الغلاف القديم بعد رفع الجديد.
            $oldCover = $book->cover_image;
            $book->cover_image = $image->storeAs('books/covers', $imagename, 'public');
            if ($oldCover && $oldCover !== $book->cover_image) { $coversToDelete[] = $oldCover; }
        }

        $book->save();

        // حذف الملفات القديمة بعد نجاح الحفظ
        foreach ($filesToDelete as $old) {
            Storage::disk('local')->delete($old);
            Storage::disk('public')->delete($old); // ملفات رُفعت سابقًا على القرص public
        }
        foreach ($coversToDelete as $old) {
            Storage::disk('public')->delete($old);
        }

        if ($request->has('categories')) {
            $book->categories()->sync($request->categories);
        }

        return response()->json([
            'message' => 'تم تحديث بيانات الكتاب بنجاح',
            'data' => $book->load('categories')
        ], 200);
    }



    /*
    ========================================================
    ADDED - حذف كتاب (أدمن)
    DELETE /books/{id}
    الموديل يستخدم SoftDeletes، فالحذف "ناعم" ويمكن استعادته لاحقًا،
    لذلك لا نحذف ملف الكتاب أو الغلاف من التخزين هنا.
    ========================================================
    */
    public function destroy($id){
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['message' => 'الكتاب غير موجود'], 404);
        }
        $book->delete();
        return response()->json(['message' => 'تم حذف الكتاب بنجاح'], 200);
    }
}

// ملاحظة مراجعة: كان هنا سطر يحتوي توكن Sanctum حقيقي (Bearer) ملصقًا كتعليق.
// المستودع عام على GitHub، فأي شخص يستطيع استخدامه إن كان ما يزال صالحًا.
// تمت إزالته؛ ويجب أيضًا حذف هذا التوكن من جدول personal_access_tokens
// في أي قاعدة بيانات استُخدم فيها. لا تُحفظ التوكنات أو كلمات المرور في الكود.
