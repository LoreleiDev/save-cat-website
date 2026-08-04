import { useState, useEffect } from 'react';
import { MapPin, Clock, MessageCircle, CheckCircle2, X, Phone, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';
import { CATEGORIES, urgencyConfig, categoryConfig } from '../constants/reports';
import { timeAgo } from '../utils/timeAgo';

export default function ReportModal({ report, onClose }) {
    const u = urgencyConfig[report.urgency];
    const cat = categoryConfig[report.category] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
    const catInfo = CATEGORIES.find(c => c.id === report.category);
    const isDone = report.status === 'selesai';

    const [fullReport, setFullReport] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/reports/${report.id}`);
            if (res.ok) {
                const data = await res.json();
                setFullReport(data);
            }
        } catch (e) {
            console.error("Gagal memuat detail laporan", e);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => { fetchDetails(); }, [report.id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const token = localStorage.getItem('user_token');
        if (!token) {
            Swal.fire({ icon: 'warning', title: 'Perlu Login 🔒', text: 'Kamu harus masuk terlebih dahulu untuk ikut berdiskusi.', confirmButtonColor: '#0d9488', confirmButtonText: 'Mengerti' });
            return;
        }

        setIsSubmittingComment(true);
        try {
            const res = await fetch(`/api/reports/${report.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: JSON.stringify({ comment_text: commentText }),
            });

            if (res.ok) {
                setCommentText('');
                fetchDetails(); // Refresh data untuk menampilkan komentar baru + avatar
            } else {
                const errData = await res.json();
                Swal.fire({ icon: 'error', title: 'Gagal', text: errData.message || 'Gagal mengirim komentar.', confirmButtonColor: '#0d9488' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat mengirim komentar.', confirmButtonColor: '#0d9488' });
        } finally {
            setIsSubmittingComment(false);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    // ✅ FUNGSI HELPER UNTUK RENDER AVATAR ATAU INISIAL
    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const renderAvatar = (name, avatarUrl) => {
        if (avatarUrl && avatarUrl !== 'null' && avatarUrl !== 'undefined') {
            return (
                <img 
                    src={avatarUrl} 
                    alt={name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                        // Fallback ke inisial jika link gambar rusak
                        e.target.style.display = 'none';
                        e.target.parentElement.innerText = getInitials(name);
                    }}
                />
            );
        }
        return getInitials(name);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer">
                    <X className="w-4 h-4" />
                </button>

                <div className="relative h-52 overflow-hidden rounded-t-2xl">
                    <img src={report.image} alt={report.title} className="w-full h-full object-cover" onError={e => { e.target.src = `https://placehold.co/600x300/0d9488/ffffff?text=%F0%9F%90%B1`; }} />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        {isDone ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Selesai
                            </span>
                        ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${u.bg} ${u.text}`}>
                                <span className={`w-2 h-2 rounded-full ${u.dot} animate-pulse`} /> Urgensi {u.label}
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cat.bg} ${cat.text}`}>
                            {catInfo?.emoji} {catInfo?.label}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">{report.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-teal-500" /><span>{report.location}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-500" /><span>{timeAgo(report.createdAt)}</span></div>
                        <div className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-teal-500" /><span>{fullReport ? fullReport.comments_count : report.comments} komentar</span></div>
                    </div>

                    {report.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {report.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-700 text-sm leading-relaxed">{report.description}</p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50 border border-teal-100">
                        <div className="flex items-center gap-3">
                            {/* ✅ RENDER AVATAR PELAPOR */}
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow overflow-hidden">
                                {renderAvatar(report.reporter, fullReport?.reporter_avatar)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{report.reporter}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><User className="w-3 h-3" /> Pelapor</p>
                            </div>
                        </div>
                        {report.contact && (
                            <a href={`tel:${report.contact}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
                                <Phone className="w-4 h-4" /> Hubungi
                            </a>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-5 space-y-4">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-teal-600" /> Diskusi & Bantuan Komunitas
                        </h3>

                        {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-4 text-gray-400 text-xs">
                                <Loader2 className="w-4 h-4 animate-spin text-teal-500 mr-2" /> Memuat diskusi...
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                    {fullReport?.comments?.length === 0 ? (
                                        <p className="text-gray-400 text-xs italic text-center py-4">Belum ada diskusi. Tulis tanggapan atau kesediaanmu membantu!</p>
                                    ) : (
                                        fullReport?.comments?.map((c) => (
                                            <div key={c.id} className="flex items-start gap-3">
                                                {/* ✅ RENDER AVATAR KOMENTATOR */}
                                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0 overflow-hidden mt-0.5">
                                                    {renderAvatar(c.name, c.avatar)}
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100/50 space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-semibold text-teal-800">{c.name}</span>
                                                        <span className="text-gray-400 text-[10px]">{timeAgo(c.createdAt)}</span>
                                                    </div>
                                                    <p className="text-gray-700 text-xs leading-relaxed">{c.comment_text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
                                    <input
                                        type="text" placeholder="Tulis tanggapan atau koordinasi bantuan..." value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)} disabled={isSubmittingComment}
                                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400/50 bg-white"
                                    />
                                    <Button type="submit" disabled={isSubmittingComment || !commentText.trim()} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs px-4">
                                        {isSubmittingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Kirim'}
                                    </Button>
                                </form>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">Tutup</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}