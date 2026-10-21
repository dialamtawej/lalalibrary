<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all(); // جلب جميع التصنيفات التي أنشأناها بالسيدر

        return response()->json([
            'status' => true,
            'categories' => $categories
        ], 200);
    }
}