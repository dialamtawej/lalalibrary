<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index(Request $request){
        $query =Book::with(['categories']);
        if ($request->has('search') && !empty($request->search)){
            $search= $request->search;
            $query->where(function($q)use($search){
                $q->where('title','like', "%{$search}%")
                ->orWhere('description','like',"%{$search}%");
            });
        }
        $books = $query->paginate(10);
        return response()->json(['message'=>'تم جلب قائمة الكتب و الروايات بنجاح',
                                  'data'=> $books], 200);
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
            $filePath= $file->storeAs('books/files',$filename, 'public');

        } 
        $coverPath = null;
        if($request->hasFile('cover_image')){
            $cover =$request->file('cover_image');
            $coverName= time() . '_cover_' . 
            Str::slug($request->title) . '.' . 
            $cover->getClientOriginalExtension();
            $coverPath= $cover->storeAs('books/covers',$coverName, 'public');
        }  
        $book = Book::create(['title' =>$request->title,
                               'slug'=> Str::slug($request->title) . '-' . time(),
                               'description' =>$request->description,
                               'file_path'=> $filePath,
                               'cover_image' => $coverPath,]);
                if ($request->has('categories')){
                    $book->categories()->attach($request->categories);
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

        if ($request->has('title')) {
            $book->title = $request->title;
            $book->slug = Str::slug($request->title) . '-' . time();
        }

        if ($request->has('description')) {
            $book->description = $request->description;
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . 
            Str::slug($book->title) . '.' . 
            $file->getClientOriginalExtension();
            $book->file_path = $file->storeAs('books/files', $filename, 'public');
        }

        if ($request->hasFile('cover_image')) {
            $image = $request->file('cover_image');
            $imagename = time() . '_cover_' . 
            Str::slug($book->title) . '.' . 
            $image->getClientOriginalExtension();
            $book->cover_image = $image->storeAs('books/covers', $imagename, 'public');
        }

        $book->save();

        if ($request->has('categories')) {
            $book->categories()->sync($request->categories);
        }

        return response()->json([
            'message' => 'تم تحديث بيانات الكتاب بنجاح',
            'data' => $book->load('categories')
        ], 200);
    }


}

//1|fGYhYwN7rmB74kWD9smO2mHfpwFCVxRLPMxoBoEY8c28bee