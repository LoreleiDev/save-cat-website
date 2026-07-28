<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Report;
use App\Models\Comment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private function isAdmin(Request $request)
    {
        $user = $request->user();
        return $user && $user->is_admin;
    }

    public function overview(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak. Khusus Admin.'], 403);
        }

        $totalUsers = User::count();
        $onlineUsers = User::whereNotNull('user_token')->count();
        $totalReports = Report::count();
        $totalComments = Comment::count();

        $recentReports = Report::with('user')->orderBy('created_at', 'desc')->limit(5)->get();
        $recentComments = Comment::with(['user', 'report'])->orderBy('created_at', 'desc')->limit(5)->get();

        $activities = [];
        foreach ($recentReports as $r) {
            $activities[] = [
                'id' => 'report_' . $r->id,
                'type' => 'report',
                'user' => $r->user->name ?? 'Anonim',
                'title' => $r->title,
                'time' => $r->created_at->toIso8601String(),
                'detail' => $r->location,
            ];
        }
        foreach ($recentComments as $c) {
            $activities[] = [
                'id' => 'comment_' . $c->id,
                'type' => 'comment',
                'user' => $c->user->name ?? 'Anonim',
                'title' => $c->report->title ?? 'Laporan dihapus',
                'time' => $c->created_at->toIso8601String(),
                'detail' => substr($c->comment_text, 0, 50) . (strlen($c->comment_text) > 50 ? '...' : ''),
            ];
        }

        usort($activities, function($a, $b) {
            return strcmp($b['time'], $a['time']);
        });

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'online_users' => $onlineUsers,
                'total_reports' => $totalReports,
                'total_comments' => $totalComments,
            ],
            'activities' => array_slice($activities, 0, 6),
        ]);
    }

    public function users(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['message' => 'Akses ditolak. Khusus Admin.'], 403);
        }

        $users = User::withCount(['reports', 'comments'])->get();
        return response()->json($users->map(function($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'telp' => $u->telp,
                'status' => $u->user_token ? 'online' : 'offline',
                'reports_count' => $u->reports_count,
                'comments_count' => $u->comments_count,
                'joined_date' => $u->created_at->toDateString(),
            ];
        }));
    }

    // PERUBAHAN PENTING: Semua user (termasuk admin) hanya lihat laporan MILIK SENDIRI
    public function reports(Request $request)
    {
        $user = $request->user();

        $query = Report::with(['user', 'comments']);
        
        // Filter berdasarkan user_id untuk SEMUA user
        $query->where('user_id', $user->id);

        $reports = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($reports->map(function($r) {
            return [
                'id' => $r->id,
                'user_id' => $r->user_id,
                'title' => $r->title,
                'category' => $r->category,
                'urgency' => $r->urgency,
                'status' => $r->status,
                'location' => $r->location,
                'content' => $r->description,
                'reporter_name' => $r->user->name ?? 'Anonim',
                'comments_count' => $r->comments->count(),
                'created_at' => $r->created_at->toIso8601String(),
            ];
        }));
    }

    public function toggleReportStatus(Request $request, $id)
    {
        $user = $request->user();
        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        // Validasi: Hanya pemilik laporan yang bisa mengubah status
        if ($report->user_id !== $user->id) {
            return response()->json(['message' => 'Akses ditolak. Anda hanya bisa mengelola laporan sendiri.'], 403);
        }

        $report->status = ($report->status === 'aktif') ? 'selesai' : 'aktif';
        $report->save();

        return response()->json([
            'message' => 'Status laporan berhasil diperbarui',
            'status' => $report->status,
        ]);
    }

    public function deleteReport(Request $request, $id)
    {
        $user = $request->user();
        $report = Report::find($id);

        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan'], 404);
        }

        // Validasi: Hanya pemilik laporan yang bisa menghapus
        if ($report->user_id !== $user->id) {
            return response()->json(['message' => 'Akses ditolak. Anda hanya bisa menghapus laporan sendiri.'], 403);
        }

        $report->delete();
        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }

    // PERUBAHAN PENTING: Semua user (termasuk admin) hanya lihat komentar MILIK SENDIRI
    public function comments(Request $request)
    {
        $user = $request->user();

        $query = Comment::with(['user', 'report']);
        
        // Filter berdasarkan user_id untuk SEMUA user
        $query->where('user_id', $user->id);

        $comments = $query->orderBy('created_at', 'desc')->get();

        return response()->json($comments->map(function($c) {
            return [
                'id' => $c->id,
                'user_id' => $c->user_id,
                'user_name' => $c->user->name ?? 'Anonim',
                'post_title' => $c->report->title ?? 'Laporan dihapus',
                'content' => $c->comment_text,
                'created_at' => $c->created_at->toIso8601String(),
            ];
        }));
    }

    public function deleteComment(Request $request, $id)
    {
        $user = $request->user();
        $comment = Comment::find($id);

        if (!$comment) {
            return response()->json(['message' => 'Komentar tidak ditemukan'], 404);
        }

        // Validasi: Hanya pemilik komentar yang bisa menghapus
        if ($comment->user_id !== $user->id) {
            return response()->json(['message' => 'Akses ditolak. Anda hanya bisa menghapus komentar sendiri.'], 403);
        }

        $comment->delete();
        return response()->json(['message' => 'Komentar berhasil dihapus']);
    }
}