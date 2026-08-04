import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { REPORT_CATEGORIES, URGENCY_LEVELS, MAX_IMAGES, MAX_SIZE_MB } from '../constants/reportForm';

export default function useCreateReport() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = detail, 2 = preview
    const [focusedField, setFocusedField] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    // Ambil data user dari localStorage untuk auto-fill nomor telepon
    const getUserData = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    };

    const [form, setForm] = useState({
        title: '', 
        category: '', 
        urgency: '', 
        location: '',
        description: '', 
        contact: getUserData().telp || '', // <-- AUTO-FILL dari DB/LocalStorage
        images: [],
    });
    
    const [errors, setErrors] = useState({});

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleChange = (field, value) => {
        // Mencegah perubahan manual pada field contact (opsional, double protection)
        if (field === 'contact') return; 
        
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const addImages = (files) => {
        const fileArray = Array.from(files);
        const current = form.images.length;
        const available = MAX_IMAGES - current;

        if (available <= 0) {
            Swal.fire({ icon: 'warning', title: 'Batas Foto', text: `Maksimal ${MAX_IMAGES} foto.`, confirmButtonColor: '#10b981' });
            return;
        }

        const toAdd = fileArray.slice(0, available);
        const oversized = toAdd.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
        if (oversized.length > 0) {
            Swal.fire({ icon: 'error', title: 'File Terlalu Besar', text: `Maksimal ukuran tiap foto adalah ${MAX_SIZE_MB} MB.`, confirmButtonColor: '#10b981' });
            return;
        }

        const newImages = toAdd.map(file => ({
            file, preview: URL.createObjectURL(file), name: file.name,
        }));

        setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    };

    const removeImage = (idx) => {
        setForm(prev => {
            const imgs = [...prev.images];
            URL.revokeObjectURL(imgs[idx].preview); // Bagus! Mencegah memory leak
            imgs.splice(idx, 1);
            return { ...prev, images: imgs };
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        addImages(e.dataTransfer.files);
    };

    // ─── Validation ──────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Judul laporan wajib diisi.';
        if (!form.category) e.category = 'Pilih kategori laporan.';
        if (!form.urgency) e.urgency = 'Pilih tingkat urgensi.';
        if (!form.location.trim()) e.location = 'Lokasi wajib diisi.';
        if (!form.description.trim()) e.description = 'Deskripsi wajib diisi.';
        if (form.description.trim().length < 20) e.description = 'Deskripsi minimal 20 karakter.';
        
        // Validasi contact (sebagai pengaman)
        if (!form.contact || form.contact.trim() === '') {
            e.contact = 'Nomor kontak tidak ditemukan. Silakan logout dan login kembali.';
        }
        
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (validate()) setStep(2);
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem('user_token');

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('category', form.category);
            formData.append('urgency', form.urgency);
            formData.append('location', form.location);
            formData.append('description', form.description);
            
            // Fallback: Pastikan contact terisi dari localStorage jika form.contact kosong
            const finalContact = form.contact || getUserData().telp || '';
            formData.append('contact', finalContact);
            
            form.images.forEach((img, i) => formData.append(`images[${i}]`, img.file));

            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Accept': 'application/json' 
                },
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                await Swal.fire({
                    icon: 'success', title: 'Laporan Terkirim! 🐱',
                    text: 'Laporan Anda sudah diterima. Tim komunitas akan segera merespons.',
                    confirmButtonColor: '#10b981', confirmButtonText: 'Lihat Laporan',
                });
                navigate(`/dashboard`);
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Gagal mengirim laporan.');
            }
        } catch (err) {
            if (!navigator.onLine || err.message === 'Failed to fetch') {
                await Swal.fire({
                    icon: 'warning', title: 'Mode Demo',
                    html: '<p class="text-sm text-gray-500">Koneksi backend belum tersedia. Data tidak benar-benar terkirim.</p>',
                    confirmButtonColor: '#10b981', confirmButtonText: 'Oke',
                });
                navigate('/');
                return;
            }
            Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, confirmButtonColor: '#10b981' });
        } finally {
            setLoading(false);
        }
    };

    // ─── Derived State ───────────────────────────────────────────────────────
    const selectedCategory = REPORT_CATEGORIES.find(c => c.id === form.category);
    const selectedUrgency = URGENCY_LEVELS.find(u => u.id === form.urgency);
    const urgencyBadgeClass = {
        rendah: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        sedang: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        tinggi: 'bg-red-500/20 text-red-300 border-red-500/30',
    }[form.urgency] ?? '';

    return {
        form, errors, loading, step, setStep,
        focusedField, setFocusedField, dragOver, setDragOver,
        fileInputRef, handleChange, addImages, removeImage, handleDrop,
        handleNext, handleSubmit, selectedCategory, selectedUrgency, urgencyBadgeClass
    };
}