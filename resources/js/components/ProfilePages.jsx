import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, Phone, Mail, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import BgImage from '@/assets/imageskitten.jpeg';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        telp: '',
        email: '', // Read-only
    });
    
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('user_token');
        if (!storedToken) {
            navigate('/login');
            return;
        }
        setToken(storedToken);
        fetchProfileData(storedToken);
    }, [navigate]);

    const fetchProfileData = async (authToken) => {
        try {
            const res = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    telp: data.telp,
                    email: data.email,
                });
                setAvatarPreview(data.avatar);
            } else {
                throw new Error('Gagal memuat data');
                }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat data profil', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Peringatan', 'Ukuran gambar maksimal 2MB', 'warning');
                e.target.value = null;
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Preview lokal
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('telp', formData.telp);
        if (avatarFile) {
            data.append('avatar', avatarFile);
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'POST', // POST digunakan untuk FormData
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: data,
            });

            const result = await res.json();

            if (res.ok) {
                // 1. Update localStorage agar Navbar langsung berubah
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const updatedUser = { ...currentUser, ...result.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // 2. Dispatch event agar Navbar component tahu ada perubahan
                window.dispatchEvent(new Event('storage-change'));

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: result.message,
                    timer: 1500,
                    showConfirmButton: false,
                });
                
                setTimeout(() => navigate('/'), 1500);
            } else {
                const errorMsg = result.errors ? Object.values(result.errors).flat().join('\n') : result.message;
                Swal.fire('Gagal', errorMsg, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Terjadi kesalahan pada jaringan', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen font-poppins text-white bg-slate-950 flex items-center justify-center p-4">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <img src={BgImage} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-br from-teal-950/90 via-slate-950/85 to-emerald-950/90 backdrop-blur-md" />
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold">Edit Profil</h2>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-4xl font-bold">
                                        {formData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg border-2 border-slate-900">
                                <Camera className="w-5 h-5 text-white" />
                                <input 
                                    type="file" 
                                    accept="image/jpeg, image/png, image/webp" 
                                    onChange={handleFileChange} 
                                    className="hidden" 
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400">Klik ikon kamera untuk mengganti foto profil (Max 2MB)</p>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/20 transition-all"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">*Email tidak dapat diubah untuk keamanan akun.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nomor Telepon</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.telp}
                                    onChange={(e) => setFormData({...formData, telp: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-400/20 transition-all"
                                    placeholder="Contoh: 081234567890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="cursor-pointer w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}