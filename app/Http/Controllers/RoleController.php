<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;

// ملاحظة مراجعة: اسم الكلاس كان "Roles" ولا يطابق اسم الملف RoleController.php،
// وهذا يخالف PSR-4 فلا يستطيع Composer تحميل الكلاس تلقائيًا (ويظهر تحذير عند dump-autoload).
// class Roles extends Controller
class RoleController extends Controller
{
    /*
    ========================================================
    ADDED - قائمة الأدوار (أدمن)
    GET /roles
    تحتاجها لوحة التحكم لعرض الأدوار المتاحة عند تعديل صلاحيات مستخدم
    (PUT /users/{id}/roles يستقبل أرقام الأدوار).
    ========================================================
    */
    public function index()
    {
        return response()->json(['roles' => Role::select('id', 'name', 'code', 'description')->orderBy('id')->get()], 200);
    }
}
