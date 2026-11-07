<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && isset($user->ban_info)) {
            $banInfo = $user->ban_info;

            if (!empty($banInfo['is_banned']) && $banInfo['is_banned'] === true) {
                
                if (!empty($banInfo['ban_until'])) {
                    $banUntil = \Carbon\Carbon::parse($banInfo['ban_until']);
                    
                    if (now()->greaterThan($banUntil)) {
                        $user->update([
                            'ban_info' => ['is_banned' => false, 'ban_until' => null]
                        ]);
                        return $next($request);
                    }
                }

                $user->currentAccessToken()->delete();

                return response()->json([
                    'status' => false,
                    'message' => 'عذراً، حسابك محظور من قبل الإدارة.'
                ], 403);
            }
        }

        return $next($request);
    }
}