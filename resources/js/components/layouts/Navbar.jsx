import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import Swal from 'sweetalert2';

import Logo from '@/assets/savecatlogo.png';

export default function Navbar() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Detect scroll position
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cek status login dan fetch data profil terbaru (termasuk avatar)
    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('user_token');
            const storedUserStr = localStorage.getItem('user');

            if (token) {
                setIsLoggedIn(true);
                
                // Tampilkan data dari localStorage dulu agar render cepat (tidak blank)
                if (storedUserStr) {
                    setUserData(JSON.parse(storedUserStr));
                }

                // Fetch data terbaru dari API untuk memastikan avatar & data lain up-to-date
                try {
                    const res = await fetch('/api/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        }
                    });
                    if (res.ok) {
                        const apiData = await res.json();
                        const updatedUser = { 
                            ...(storedUserStr ? JSON.parse(storedUserStr) : {}), 
                            ...apiData 
                        };
                        setUserData(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                } catch (error) {
                    console.error('Gagal mengambil data profil:', error);
                }
            } else {
                setIsLoggedIn(false);
                setUserData(null);
            }
        };

        checkLoginStatus();

        window.addEventListener('storage-change', checkLoginStatus);
        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('storage-change', checkLoginStatus);
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Yakin mau keluar?',
            text: 'Kamu perlu login lagi untuk mengakses akunmu.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem('user_token');

        try {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
        } catch (error) {
            console.error('Logout API error:', error);
        }

        localStorage.removeItem('user_token');
        localStorage.removeItem('user');

        setIsLoggedIn(false);
        setUserData(null);
        setShowProfileMenu(false);

        window.dispatchEvent(new Event('storage-change'));

        Swal.fire({
            icon: 'success',
            title: 'Logout Berhasil',
            text: 'Sampai jumpa lagi!',
            timer: 1500,
            showConfirmButton: false,
        });

        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Fungsi helper untuk render Avatar (Gambar atau Inisial)
    const renderAvatar = () => {
        if (userData?.avatar) {
            return (
                <img 
                    src={userData.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                />
            );
        }
        return userData ? getInitials(userData.name) : 'U';
    };

    // Fungsi khusus untuk menangani klik pada link navigasi
    const handleNavClick = (href) => {
        if (href === '/') {
            // Paksa scroll ke paling atas dengan animasi smooth
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const navLinks = [
        { name: 'Beranda', href: '/' },
        { name: 'Jelajahi Laporan', href: '/reports' },
        { name: 'Cara Kerja', href: '/#howto' }, 
        { name: 'Tentang Kami', href: '/about' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white shadow-md'
                    : 'bg-linear-to-b from-gray-950 to-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                            <img
                                src={Logo}
                                alt="Save Cat"
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold text-lg leading-tight transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                                Save Cat
                            </span>
                            <span className={`text-xs transition-colors duration-300 ${scrolled ? 'text-gray-500' : 'text-gray-300'}`}>
                                COMMUNITY
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => handleNavClick(link.href)}
                                className={`transition-colors text-sm font-medium ${
                                    scrolled
                                        ? 'text-gray-700 hover:text-gray-900'
                                        : 'text-gray-200 hover:text-white'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Buttons / Profile */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {!isLoggedIn ? (
                            <>
                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        className={`cursor-pointer transition-colors ${
                                            scrolled
                                                ? 'text-gray-700 hover:bg-gray-100'
                                                : 'text-white hover:bg-white/10'
                                        }`}
                                    >
                                        Masuk
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button className="bg-green-600 hover:bg-green-700 text-gray-100 cursor-pointer">
                                        + Buat Laporan
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/report/create">
                                    <Button className="bg-green-600 hover:bg-green-700 text-gray-100 cursor-pointer">
                                        + Buat Laporan
                                    </Button>
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center space-x-2 cursor-pointer group"
                                    >
                                        {/* PERBAIKAN: Render Avatar atau Inisial dengan overflow-hidden */}
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20 group-hover:ring-white/40 transition-all overflow-hidden">
                                            {renderAvatar()}
                                        </div>
                                    </button>

                                    {showProfileMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowProfileMenu(false)}
                                            />

                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                                    <p className="text-sm font-semibold text-gray-900">{userData?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors font-semibold border-b border-gray-100"
                                                        onClick={() => setShowProfileMenu(false)}
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 mr-3 text-emerald-500" />
                                                        Dashboard Saya
                                                    </Link>

                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                        onClick={() => setShowProfileMenu(false)}
                                                    >
                                                        <User className="w-4 h-4 mr-3" />
                                                        Profil Saya
                                                    </Link>

                                                    <button
                                                        onClick={handleLogout}
                                                        className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-3" />
                                                        Keluar
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`lg:hidden p-2 cursor-pointer transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-black/95 backdrop-blur-md rounded-lg mt-2 p-4 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="block text-gray-200 hover:text-white transition-colors py-2"
                                onClick={() => {
                                    handleNavClick(link.href);
                                    setIsMobileMenuOpen(false); // Tutup menu mobile setelah klik
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-gray-700 space-y-3">
                            {!isLoggedIn ? (
                                <>
                                    <Link to="/login" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-white text-gray-800 hover:bg-white/80 cursor-pointer">
                                            Masuk
                                        </Button>
                                    </Link>
                                    <Link to="/report/create" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                                            + Buat Laporan
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/profile" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg">
                                            {/* PERBAIKAN: Render Avatar atau Inisial di Mobile */}
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                                {renderAvatar()}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-white font-semibold text-sm">{userData?.name}</p>
                                                <p className="text-gray-300 text-xs truncate">{userData?.email}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <Link to="/dashboard" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center justify-center gap-2">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Dashboard Saya
                                        </Button>
                                    </Link>

                                    <Link to="/report/create" className="block w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-gray-200 cursor-pointer">
                                            + Buat Laporan
                                        </Button>
                                    </Link>
                                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full">
                                        <Button variant="outline" className="w-full border-red-500 bg-red-500 text-gray-200 hover:text-gray-200 hover:bg-red-700 cursor-pointer">
                                            Keluar
                                        </Button>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}