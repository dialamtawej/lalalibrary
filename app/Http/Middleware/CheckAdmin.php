<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if($request->user()&& $request->user()->roles()->where('code','admin')->exists()){
            return $next($request);
        }
        return response()->json(['status'=>false,
                                  'message'=>'عذراً هذه الصفحة مخصصة للمدراء فقط'],403);
        
    }
}
