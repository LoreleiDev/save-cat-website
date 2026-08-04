<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Cloudinary\Cloudinary as CloudinarySDK;

class ReportController extends Controller
{
    private function getCloudinary()
    {
        return new CloudinarySDK(env('CLOUDINARY_URL'));
    }

    private function getOptimizedUrl($publicId)
    {
        if (!$publicId) return 'https://placehold.co/1280x720/0d9488/ffffff?text=🐱';
        if (str_starts_with($publicId, 'http://') || str_starts_with($publicId, 'https://')) return $publicId;
        
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        return "https://res.cloudinary.com/{$cloudName}/image/upload/q_auto:good,f_auto,w_1280,c_limit/{$publicId}";
    }

    private function getThumbnailUrl($publicId)
    {
        if (!$publicId) return 'https://placehold.co/400x300/0d9488/ffffff?text=🐱';
        if (str_starts_with($publicId, 'http://') || str_starts_with($publicId, 'https://')) return $publicId;
        
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        return "https://res.cloudinary.com/{$cloudName}/image/upload/q_auto:eco,f_auto,w_600,h_400,c_fill/{$publicId}";
    }

    // ✅ HELPER BARU UNTUK AVATAR
    private function getAvatarUrl($publicId)
    {
        if (!$publicId || str_starts_with($publicId, 'http://') || str_starts_with($publicId, 'https://')) {
            return $publicId;
        }
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        return "https://res.cloudinary.com/{$cloudName}/image/upload/q_auto:good,f_auto,w_100,h_100,c_fill/{$publicId}";
    }

    public function index(Request $request)
    {
        $query = Report::with(['user', 'images', 'comments']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($qu) use ($search) {
                        $qu->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'semua') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status') && $request->input('status') !== 'semua') {
            $query->where('status', $request->input('status'));
        }

        $sortBy = $request->input('sortBy', 'terbaru');
        if ($sortBy === 'terbaru') $query->orderBy('created_at', 'desc');
        elseif ($sortBy === 'terlama') $query->orderBy('created_at', 'asc');
        elseif ($sortBy === 'komentar') $query->withCount('comments')->orderBy('comments_count', 'desc');
        elseif ($sortBy === 'urgensi') {
            $query->orderByRaw("CASE urgency WHEN 'tinggi' THEN 1 WHEN 'sedang' THEN 2 WHEN 'rendah' THEN 3 ELSE 4 END ASC");
        }

        $perPage = $request->input('per_page', 8);
        $reports = $query->paginate($perPage);

        $items = collect($reports->items())->map(function ($report) {
            $firstImage = $report->images->first();
            $publicId = $firstImage ? $firstImage->image_path : null;

            return [
                'id' => $report->id,
                'title' => $report->title,
                'category' => $report->category,
                'urgency' => $report->urgency,
                'status' => $report->status,
                'location' => $report->location,
                'description' => $report->description,
                'reporter' => $report->user->name ?? 'Anonim',
                'contact' => $report->contact,
                'comments' => $report->comments->count(),
                'createdAt' => $report->created_at->toIso8601String(),
                'image' => $this->getThumbnailUrl($publicId),
                'tags' => $report->tags ?? [],
            ];
        });

        $stats = [
            'total' => Report::count(),
            'aktif' => Report::where('status', 'aktif')->count(),
            'selesai' => Report::where('status', 'selesai')->count(),
            'darurat' => Report::where('urgency', 'tinggi')->count(),
        ];

        return response()->json([
            'reports' => $items,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $report = Report::with(['user', 'images', 'comments.user'])->find($id);

        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        return response()->json([
            'id' => $report->id,
            'title' => $report->title,
            'category' => $report->category,
            'urgency' => $report->urgency,
            'status' => $report->status,
            'location' => $report->location,
            'description' => $report->description,
            'reporter' => $report->user->name ?? 'Anonim',
            'reporter_avatar' => $this->getAvatarUrl($report->user->avatar ?? null), // ✅ TAMBAHAN
            'contact' => $report->contact,
            'comments_count' => $report->comments->count(),
            'createdAt' => $report->created_at->toIso8601String(),
            'images' => $report->images->map(function ($img) {
                return $this->getOptimizedUrl($img->image_path);
            }),
            'tags' => $report->tags ?? [],
            'comments' => $report->comments->map(function ($c) {
                return [
                    'id' => $c->id,
                    'user_id' => $c->user_id,
                    'name' => $c->user->name ?? 'Anonim',
                    'avatar' => $this->getAvatarUrl($c->user->avatar ?? null), // ✅ TAMBAHAN
                    'comment_text' => $c->comment_text,
                    'createdAt' => $c->created_at->toIso8601String(),
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|string',
            'urgency' => 'required|string',
            'location' => 'required|string',
            'description' => 'required|string',
            'contact' => 'nullable|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        $tags = [];
        if ($request->input('urgency') === 'tinggi') $tags[] = 'Butuh Segera';
        if ($request->input('category') === 'terluka') $tags[] = 'Luka Fisik';
        if ($request->input('category') === 'terlantar') $tags[] = 'Terlantar';

        $report = Report::create([
            'user_id' => $user->id,
            'title' => $request->input('title'),
            'category' => $request->input('category'),
            'urgency' => $request->input('urgency'),
            'status' => 'aktif',
            'location' => $request->input('location'),
            'description' => $request->input('description'),
            'contact' => $request->input('contact'),
            'tags' => $tags,
        ]);

        if ($request->hasFile('images')) {
            $cloudinary = $this->getCloudinary();
            foreach ($request->file('images') as $file) {
                $uploaded = $cloudinary->uploadApi()->upload($file->getRealPath(), [
                    'folder' => 'savecat/reports',
                    'transformation' => [
                        'quality' => 'auto:good',
                        'fetch_format' => 'auto',
                        'width' => 1280,
                        'crop' => 'limit',
                    ],
                ]);

                ReportImage::create([
                    'report_id' => $report->id,
                    'image_path' => $uploaded['public_id'],
                ]);
            }
        }

        return response()->json([
            'id' => $report->id,
            'message' => 'Laporan berhasil dibuat',
        ], 201);
    }

    public function destroy($id)
    {
        $report = Report::with('images')->find($id);

        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        $cloudinary = $this->getCloudinary();
        foreach ($report->images as $img) {
            if ($img->image_path && !str_starts_with($img->image_path, 'http')) {
                try {
                    $cloudinary->uploadApi()->destroy($img->image_path, ['resource_type' => 'image']);
                } catch (\Exception $e) {
                    \Log::warning("Gagal hapus gambar Cloudinary: " . $e->getMessage());
                }
            }
        }

        $report->images()->delete();
        $report->comments()->delete();
        $report->delete();

        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }
}