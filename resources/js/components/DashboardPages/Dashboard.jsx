import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    Search, Users, Activity, MessageSquare, Calendar, MapPin, ThumbsUp,
    ChevronLeft, ChevronRight, X, Shield, ArrowLeft, LogOut, FileText,
    CheckCircle, UserX, Sparkles, Eye, MessageCircle, RefreshCw, Trash2
} from 'lucide-react';
import Logo from '@/assets/savecatlogo.png';
import BgImage from '@/assets/imageskitten.jpeg';

export default function Dashboard() {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('overview');
    const [userData, setUserData] = useState(null);
    const [token, setToken] = useState(null);

    // Data States
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Common states
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [reportStatusFilter, setReportStatusFilter] = useState('all');

    // Detail Modal States
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalTab, setModalTab] = useState('posts');
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('user_token');

        if (storedUser && storedToken) {
            const parsed = JSON.parse(storedUser);
            setUserData(parsed);
            setToken(storedToken);

            // Jika bukan admin, default tab ke 'reports'
            if (!parsed.is_admin) {
                setCurrentTab('reports');
            }

            fetchData(parsed.is_admin, storedToken);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchData = async (isAdmin, authToken) => {
        setLoading(true);
        const headers = {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
        };

        try {
            // 1. Fetch Overview (Hanya untuk admin)
            if (isAdmin) {
                const overviewRes = await fetch('/api/dashboard/overview', { headers });
                if (overviewRes.ok) {
                    const overviewData = await overviewRes.json();
                    setStats(overviewData.stats);
                    setActivities(overviewData.activities);
                }

                const usersRes = await fetch('/api/dashboard/users', { headers });
                if (usersRes.ok) setUsers(await usersRes.json());
            }

            // 2. Fetch Reports (HANYA MILIK SENDIRI untuk semua user, termasuk admin)
            const reportsRes = await fetch('/api/dashboard/reports', { headers });
            if (reportsRes.ok) setPosts(await reportsRes.json());

            // 3. Fetch Comments (HANYA MILIK SENDIRI untuk semua user, termasuk admin)
            const commentsRes = await fetch('/api/dashboard/comments', { headers });
            if (commentsRes.ok) setComments(await commentsRes.json());

        } catch (error) {
            console.error("Gagal memuat data dashboard:", error);
            Swal.fire('Error', 'Gagal memuat data dashboard', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Helper: Format Time Ago untuk aktivitas
    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Reset pagination and search query when changing tabs
    useEffect(() => {
        setSearchQuery('');
        setCurrentPage(1);
    }, [currentTab]);

    // ==========================================
    // ACTIONS
    // ==========================================
    const handleForceLogout = async (userId, userName) => {
        const result = await Swal.fire({
            title: 'Putuskan Sesi User?',
            text: `Apakah Anda yakin ingin melakukan force logout pada ${userName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Keluarkan!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                await fetch(`/api/dashboard/users/${userId}/force-logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'offline' } : u));
                Swal.fire({ icon: 'success', title: 'Berhasil', text: `Sesi ${userName} diputuskan.`, timer: 1500, showConfirmButton: false });
            } catch (error) {
                Swal.fire('Error', 'Gagal melakukan force logout', 'error');
            }
        }
    };

    const handleTogglePostStatus = async (postId, currentStatus, postTitle) => {
        const nextStatus = currentStatus === 'aktif' ? 'selesai' : 'aktif';
        const nextStatusLabel = nextStatus === 'selesai' ? 'Selesai (Resolved)' : 'Aktif';

        const result = await Swal.fire({
            title: 'Ubah Status Laporan?',
            text: `Ubah status laporan "${postTitle}" menjadi ${nextStatusLabel}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Ubah!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/dashboard/reports/${postId}/toggle`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await res.json();

                if (res.ok) {
                    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: data.status } : p));
                    Swal.fire({ icon: 'success', title: 'Status Diperbarui', text: data.message, timer: 1500, showConfirmButton: false });
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal memperbarui status', 'error');
            }
        }
    };

    const handleDeletePost = async (postId, postTitle) => {
        const result = await Swal.fire({
            title: 'Hapus Laporan?',
            text: `Hapus laporan "${postTitle}"? Tindakan ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/dashboard/reports/${postId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await res.json();

                if (res.ok) {
                    setPosts(prev => prev.filter(p => p.id !== postId));
                    setComments(prev => prev.filter(c => c.post_id !== postId));
                    Swal.fire({ icon: 'success', title: 'Dihapus', text: data.message, timer: 1500, showConfirmButton: false });
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menghapus laporan', 'error');
            }
        }
    };

    const handleDeleteComment = async (commentId, commenterName) => {
        const result = await Swal.fire({
            title: 'Hapus Komentar?',
            text: `Hapus komentar dari ${commenterName}? Tindakan ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/dashboard/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await res.json();

                if (res.ok) {
                    setComments(prev => prev.filter(c => c.id !== commentId));
                    Swal.fire({ icon: 'success', title: 'Dihapus', text: data.message, timer: 1500, showConfirmButton: false });
                } else {
                    Swal.fire('Error', data.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menghapus komentar', 'error');
            }
        }
    };

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-poppins">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const isAdmin = userData.is_admin;

    // ==========================================
    // FILTER & PAGINATION CALCULATIONS
    // ==========================================
    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.telp.includes(query);
    });
    const usersTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        const matchesQuery = post.title.toLowerCase().includes(query) || post.location.toLowerCase().includes(query) || post.content.toLowerCase().includes(query) || post.reporter_name.toLowerCase().includes(query);
        const matchesStatus = reportStatusFilter === 'all' || post.status === reportStatusFilter;
        return matchesQuery && matchesStatus;
    });
    const reportsTotalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filteredComments = comments.filter(comment => {
        const query = searchQuery.toLowerCase();
        return comment.content.toLowerCase().includes(query) || comment.user_name.toLowerCase().includes(query) || comment.post_title.toLowerCase().includes(query);
    });
    const commentsTotalPages = Math.ceil(filteredComments.length / itemsPerPage);
    const paginatedComments = filteredComments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="relative min-h-screen font-poppins overflow-x-hidden text-white bg-slate-950">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 animate-fade-in">
                <img src={BgImage} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-br from-teal-950/90 via-slate-950/85 to-emerald-950/90 backdrop-blur-md" />
            </div>

            {/* Main Layout Grid */}
            <div className="relative z-10 flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-80 bg-slate-900/60 backdrop-blur-xl border-r border-white/10 p-6 flex-col justify-between hidden md:flex">
                    <div className="space-y-8">
                        <div className="flex items-center space-x-3 pb-6 border-b border-white/10">
                            <img src={Logo} alt="Save Cat Logo" className="w-12 h-12 object-contain animate-pulse" />
                            <div>
                                <h2 className="font-bold text-lg leading-tight tracking-wider text-emerald-400">Save Cat</h2>
                                <span className="text-xs text-gray-400">{isAdmin ? 'ADMINISTRATOR' : 'DASHBOARD RELAWAN'}</span>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white shadow-inner">
                                {userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">{userData.name}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-medium border ${isAdmin ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                    {isAdmin ? 'Super Admin' : 'Relawan'}
                                </span>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {isAdmin && (
                                <button onClick={() => setCurrentTab('overview')} className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentTab === 'overview' ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                    <Activity className="w-5 h-5" /> <span>Beranda & Statistik</span>
                                </button>
                            )}
                            {isAdmin && (
                                <button onClick={() => setCurrentTab('users')} className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentTab === 'users' ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                    <Users className="w-5 h-5" /> <span>Pemantauan User</span>
                                </button>
                            )}
                            <button onClick={() => setCurrentTab('reports')} className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentTab === 'reports' ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                <FileText className="w-5 h-5" /> <span>Laporan Saya</span>
                            </button>
                            <button onClick={() => setCurrentTab('comments')} className={`cursor-pointer w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentTab === 'comments' ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                <MessageSquare className="w-5 h-5" /> <span>Komentar Saya</span>
                            </button>
                        </nav>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors">
                            <LogOut className="w-5 h-5" /> <span>Kembali ke Beranda</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-10 flex flex-col space-y-8 overflow-y-auto max-h-screen">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                        <div>
                            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-1">
                                <Sparkles className="w-3.5 h-3.5" /> <span>Dashboard Panel</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {currentTab === 'overview' && 'Selamat Datang, Admin'}
                                {currentTab === 'users' && 'Pemantauan Aktivitas User'}
                                {currentTab === 'reports' && 'Laporan yang Saya Buat'}
                                {currentTab === 'comments' && 'Komentar yang Saya Tulis'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {currentTab === 'overview' && 'Ringkasan data aktivitas penyelamatan kucing dan kontribusi komunitas.'}
                                {currentTab === 'users' && 'Pantau status login, postingan laporan, dan komentar user secara real-time.'}
                                {currentTab === 'reports' && 'Kelola laporan yang telah Anda posting.'}
                                {currentTab === 'comments' && 'Kelola komentar yang telah Anda tulis.'}
                            </p>
                        </div>
                        <Link to="/" className="md:hidden flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4" /> <span>Beranda</span>
                        </Link>
                    </header>

                    {/* ========================================== */}
                    {/* TAB CONTENT: OVERVIEW & STATS (ADMIN ONLY) */}
                    {/* ========================================== */}
                    {currentTab === 'overview' && isAdmin && stats && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Card 1 */}
                                <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 shadow-xl overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-gray-400 text-sm font-medium">Total User Terdaftar</p><h3 className="text-3xl font-bold mt-2 tracking-tight">{stats.total_users}</h3></div>
                                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20"><Users className="w-6 h-6" /></div>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-teal-500/30 rounded-2xl p-6 transition-all duration-300 shadow-xl overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-gray-400 text-sm font-medium">User Sedang Login</p><h3 className="text-3xl font-bold mt-2 tracking-tight flex items-center space-x-2"><span>{stats.online_users}</span><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span></h3></div>
                                        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/20"><Activity className="w-6 h-6" /></div>
                                    </div>
                                </div>
                                {/* Card 3 */}
                                <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-300 shadow-xl overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-gray-400 text-sm font-medium">Total Laporan</p><h3 className="text-3xl font-bold mt-2 tracking-tight">{stats.total_reports}</h3></div>
                                        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20"><FileText className="w-6 h-6" /></div>
                                    </div>
                                </div>
                                {/* Card 4 */}
                                <div className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-sky-500/30 rounded-2xl p-6 transition-all duration-300 shadow-xl overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-gray-400 text-sm font-medium">Total Komentar</p><h3 className="text-3xl font-bold mt-2 tracking-tight">{stats.total_comments}</h3></div>
                                        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20"><MessageSquare className="w-6 h-6" /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl space-y-4">
                                    <h4 className="text-lg font-bold text-emerald-400 flex items-center gap-2"><Shield className="w-5 h-5" /> Panduan Operasional Administrator</h4>
                                    <p className="text-gray-300 text-sm leading-relaxed">Sebagai administrator Save Cat, Anda bertanggung jawab penuh atas kebersihan data dan kenyamanan komunitas.</p>
                                </div>

                                {/* DINAMIS: Aktivitas Terkini Relawan */}
                                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <h4 className="text-md font-bold text-gray-200">Aktivitas Terkini Relawan</h4>
                                        <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                                            {activities && activities.length > 0 ? (
                                                activities.map((activity) => (
                                                    <div key={activity.id} className="flex items-start space-x-3 text-xs border-b border-white/5 pb-2.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${activity.type === 'report' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                                                        <div>
                                                            <p className="text-gray-300">
                                                                <span className="font-semibold text-white">{activity.user}</span>
                                                                {activity.type === 'report' ? ' memposting laporan: ' : ' berkomentar pada: '}
                                                                <span className="italic">"{activity.title}"</span>
                                                            </p>
                                                            <span className="text-[10px] text-gray-500">{formatTimeAgo(activity.time)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-500 text-center py-4">Belum ada aktivitas terkini.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================== */}
                    {/* TAB CONTENT: USERS MONITORING (ADMIN ONLY) */}
                    {/* ========================================== */}
                    {currentTab === 'users' && isAdmin && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Cari user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/20 text-sm transition-all" />
                                </div>
                                <div className="text-sm text-gray-300 shrink-0">Menampilkan <strong className="text-white">{paginatedUsers.length}</strong> dari <strong className="text-white">{filteredUsers.length}</strong> user</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                                    <div key={user.id} className="group relative bg-white/10 backdrop-blur-xl border border-white/15 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white shadow-inner">
                                                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{user.name}</h3>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${user.status === 'online' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'bg-gray-500/20 text-gray-300 border border-gray-500/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                                                {user.status === 'online' ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Laporan:</span>
                                                <span className="text-white font-semibold">{user.reports_count}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Komentar:</span>
                                                <span className="text-white font-semibold">{user.comments_count}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Bergabung:</span>
                                                <span className="text-white font-semibold">{formatDate(user.joined_date)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                            <button onClick={() => {
                                                setSelectedUser(user);
                                                setModalTab('posts');
                                            }} className="cursor-pointer flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">
                                                <Eye className="w-3.5 h-3.5 inline mr-1" /> Detail
                                            </button>
                                            {user.status === 'online' && (
                                                <button onClick={() => handleForceLogout(user.id, user.name)} className="cursor-pointer p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200">
                                                    <UserX className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-16 text-center text-gray-400">Tidak ada user yang sesuai.</div>
                                )}
                            </div>

                            {/* Pagination */}
                            {usersTotalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2 pt-4">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="cursor-pointer p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: usersTotalPages }).map((_, i) => (
                                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, usersTotalPages))} disabled={currentPage === usersTotalPages} className="cursor-pointer p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================== */}
                    {/* TAB CONTENT: REPORTS MANAGEMENT (SEMUA USER) */}
                    {/* ========================================== */}
                    {currentTab === 'reports' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Cari laporan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/20 text-sm transition-all" />
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto shrink-0 pb-1 md:pb-0">
                                    <button onClick={() => { setReportStatusFilter('all'); setCurrentPage(1); }} className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${reportStatusFilter === 'all' ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>Semua</button>
                                    <button onClick={() => { setReportStatusFilter('aktif'); setCurrentPage(1); }} className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${reportStatusFilter === 'aktif' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>Aktif</button>
                                    <button onClick={() => { setReportStatusFilter('selesai'); setCurrentPage(1); }} className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${reportStatusFilter === 'selesai' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}>Selesai</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedPosts.length > 0 ? paginatedPosts.map((post) => (
                                    <div key={post.id} className="group relative flex flex-col justify-between bg-white/10 backdrop-blur-xl border border-white/15 hover:border-emerald-500/40 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div>
                                            <div className="flex justify-between items-start gap-3">
                                                <span className="text-[10px] text-gray-400">ID: #{post.id}</span>
                                                {post.status === 'selesai' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"><CheckCircle className="w-3 h-3" /> Selesai</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"><Activity className="w-3 h-3" /> Aktif</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-sm text-white mt-3 line-clamp-2 group-hover:text-emerald-400 transition-colors">{post.title}</h3>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-500" /><span>{post.location}</span></p>
                                            <p className="text-xs text-gray-300 mt-3 line-clamp-3 leading-relaxed">{post.content}</p>
                                        </div>
                                        <div className="mt-5 space-y-4">
                                            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-gray-400">
                                                <span>Pelapor: <strong className="text-gray-300">{post.reporter_name}</strong></span>
                                                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-emerald-400" />{post.comments_count} Komentar</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setSelectedReport(post)} className="cursor-pointer flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">Detail</button>
                                                <button onClick={() => handleTogglePostStatus(post.id, post.status, post.title)} title="Ubah Status" className="cursor-pointer p-2 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"><RefreshCw className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeletePost(post.id, post.title)} title="Hapus" className="cursor-pointer p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-16 text-center text-gray-400">Tidak ada laporan yang sesuai.</div>
                                )}
                            </div>

                            {/* Pagination */}
                            {reportsTotalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2 pt-4">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="cursor-pointer p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: reportsTotalPages }).map((_, i) => (
                                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, reportsTotalPages))} disabled={currentPage === reportsTotalPages} className="cursor-pointer p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================== */}
                    {/* TAB CONTENT: COMMENTS MANAGEMENT (SEMUA USER) */}
                    {/* ========================================== */}
                    {currentTab === 'comments' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Cari komentar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/20 text-sm transition-all" />
                                </div>
                                <div className="text-sm text-gray-300 shrink-0">Total: <strong className="text-white">{filteredComments.length}</strong></div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 text-gray-200 border-b border-white/10 text-xs font-semibold uppercase tracking-wider">
                                                <th className="py-4 px-6 w-1/4">Penulis</th>
                                                <th className="py-4 px-6 w-1/3">Target Laporan</th>
                                                <th className="py-4 px-6">Isi Komentar</th>
                                                <th className="py-4 px-6 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {paginatedComments.length > 0 ? paginatedComments.map((comment) => (
                                                <tr key={comment.id} className="hover:bg-white/5 transition-colors duration-200">
                                                    <td className="py-4 px-6 font-semibold text-white">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-300 text-xs shrink-0">
                                                                {comment.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="truncate max-w-37.5">
                                                                <p className="truncate font-semibold">{comment.user_name}</p>
                                                                <span className="text-[10px] text-gray-500">{formatDate(comment.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6"><p className="text-emerald-300 hover:underline cursor-pointer truncate max-w-62.5 font-medium">{comment.post_title}</p></td>
                                                    <td className="py-4 px-6"><p className="text-gray-300 italic max-w-sm line-clamp-2">"{comment.content}"</p></td>
                                                    <td className="py-4 px-6 text-center">
                                                        <button onClick={() => handleDeleteComment(comment.id, comment.user_name)} className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold transition-all duration-200">
                                                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="py-12 px-6 text-center text-gray-400">Tidak ada komentar yang ditemukan.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {commentsTotalPages > 1 && (
                                <div className="flex justify-center items-center space-x-2 pt-4">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="cursor-pointer p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {Array.from({ length: commentsTotalPages }).map((_, i) => (
                                        <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, commentsTotalPages))} disabled={currentPage === commentsTotalPages} className="cursor-pointer p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ========================================== */}
            {/* DETAIL MODAL: LAPORAN PENYELAMATAN */}
            {/* ========================================== */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-slate-900/90 border border-white/20 rounded-2xl shadow-3xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
                        <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-bold text-white">Detail Laporan #{selectedReport.id}</h3>
                            </div>
                            <button onClick={() => setSelectedReport(null)} className="cursor-pointer p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    {selectedReport.status === 'selesai' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"><CheckCircle className="w-3.5 h-3.5" /> Selesai</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 animate-pulse"><Activity className="w-3.5 h-3.5" /> Aktif</span>
                                    )}
                                    <span className="text-xs text-gray-400">Tanggal: {formatDate(selectedReport.created_at)}</span>
                                </div>
                                <h2 className="text-xl font-bold text-white leading-snug">{selectedReport.title}</h2>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div><h4 className="text-xs text-gray-400 uppercase font-semibold">Lokasi Kejadian</h4><p className="text-sm text-gray-200 mt-1">{selectedReport.location}</p></div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xs text-gray-400 uppercase font-semibold">Deskripsi Kejadian</h4>
                                <p className="text-sm text-gray-300 leading-relaxed bg-black/10 p-4 rounded-xl border border-white/5 whitespace-pre-line">{selectedReport.content}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end gap-2">
                            <button onClick={() => { handleTogglePostStatus(selectedReport.id, selectedReport.status, selectedReport.title); setSelectedReport(null); }} className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors">Ubah Status</button>
                            <button onClick={() => setSelectedReport(null)} className="cursor-pointer px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-semibold transition-colors">Tutup</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* DETAIL MODAL: USER PROFILE */}
            {/* ========================================== */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-4xl bg-slate-900/90 border border-white/20 rounded-2xl shadow-3xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
                        <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white">
                                    {selectedUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                                    <p className="text-xs text-gray-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="cursor-pointer p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-emerald-400">{selectedUser.reports_count}</p>
                                    <p className="text-xs text-gray-400">Laporan</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-blue-400">{selectedUser.comments_count}</p>
                                    <p className="text-xs text-gray-400">Komentar</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-purple-400">{formatDate(selectedUser.joined_date)}</p>
                                    <p className="text-xs text-gray-400">Bergabung</p>
                                </div>
                            </div>
                            <p className="text-center text-gray-400 text-sm">Detail aktivitas user ini dapat dikembangkan lebih lanjut.</p>
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                            <button onClick={() => setSelectedUser(null)} className="cursor-pointer px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 font-semibold transition-colors">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}