<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary as CloudinarySDK;

class ProfileController extends Controller
{
    private function getCloudinary()
    {
        return new CloudinarySDK(env('CLOUDINARY_URL'));
    }

    private function getAvatarUrl($publicId)
    {
        if (!$publicId || str_starts_with($publicId, 'http://') || str_starts_with($publicId, 'https://')) {
            return $publicId;
        }
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        return "https://res.cloudinary.com/{$cloudName}/image/upload/q_auto:good,f_auto,w_400,h_400,c_fill/{$publicId}";
    }

    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telp' => $user->telp,
            'avatar' => $this->getAvatarUrl($user->avatar),
            'is_admin' => $user->is_admin,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'telp' => 'required|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateData = [
            'name' => $request->input('name'),
            'telp' => $request->input('telp'),
        ];

        // Handle Upload Avatar ke Cloudinary
        if ($request->hasFile('avatar')) {
            // 1. Hapus avatar lama dari Cloudinary jika ada
            if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
                try {
                    $this->getCloudinary()->uploadApi()->destroy($user->avatar, ['resource_type' => 'image']);
                } catch (\Exception $e) {
                    \Log::warning("Gagal hapus avatar lama di Cloudinary: " . $e->getMessage());
                }
            }

            // 2. Upload avatar baru
            $file = $request->file('avatar');
            $uploaded = $this->getCloudinary()->uploadApi()->upload($file->getRealPath(), [
                'folder' => 'savecat/avatars',
                'transformation' => [
                    'quality' => 'auto:good',
                    'fetch_format' => 'auto',
                    'width' => 400,
                    'height' => 400,
                    'crop' => 'fill',
                ],
            ]);
            
            $updateData['avatar'] = $uploaded['public_id'];
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'telp' => $user->telp,
                'avatar' => $this->getAvatarUrl($user->avatar),
                'is_admin' => $user->is_admin,
            ]
        ]);
    }
}