<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    // Helper untuk generate URL avatar yang dioptimasi
    private function getAvatarUrl($publicId)
    {
        if (!$publicId || str_starts_with($publicId, 'http://') || str_starts_with($publicId, 'https://')) {
            return $publicId;
        }
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        // Optimasi untuk thumbnail kecil di navbar (100x100)
        return "https://res.cloudinary.com/{$cloudName}/image/upload/q_auto:good,f_auto,w_100,h_100,c_fill/{$publicId}";
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Email belum diverifikasi. Silakan cek email Anda.'], 403);
        }

        $token = Str::random(60);
        $user->update(['user_token' => hash('sha256', $token)]);

        return response()->json([
            'message' => 'Login berhasil',
            'user_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telp' => $user->telp,
                'avatar' => $this->getAvatarUrl($user->avatar), // <-- TAMBAHAN: Kembalikan URL avatar
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->update(['user_token' => null]);
        }
        return response()->json(['message' => 'Logout berhasil']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telp' => $user->telp,
                'avatar' => $this->getAvatarUrl($user->avatar), // <-- TAMBAHAN
                'is_admin' => $user->is_admin,
            ]
        ]);
    }
}