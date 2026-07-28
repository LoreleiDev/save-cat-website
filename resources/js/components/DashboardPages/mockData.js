// Mock Data for Save Cat Admin Dashboard
export const initialUsers = [
    {
        id: 1,
        name: 'Rian Kurniawan',
        email: 'rian.kurniawan@gmail.com',
        telp: '081234567890',
        status: 'online',
        joined_date: '2026-03-10'
    },
    {
        id: 2,
        name: 'Siti Rahmawati',
        email: 'siti.rahma@gmail.com',
        telp: '085712345678',
        status: 'offline',
        joined_date: '2026-04-15'
    },
    {
        id: 3,
        name: 'Budi Santoso',
        email: 'budi.santoso@yahoo.com',
        telp: '089698765432',
        status: 'online',
        joined_date: '2026-01-20'
    },
    {
        id: 4,
        name: 'Dewi Lestari',
        email: 'dewi.lestari@outlook.com',
        telp: '082133445566',
        status: 'online',
        joined_date: '2026-05-02'
    },
    {
        id: 5,
        name: 'Andi Wijaya',
        email: 'andi.wijaya@gmail.com',
        telp: '087855667788',
        status: 'offline',
        joined_date: '2026-02-18'
    },
    {
        id: 6,
        name: 'Lia Ananda',
        email: 'lia.ananda@gmail.com',
        telp: '081399887766',
        status: 'offline',
        joined_date: '2026-05-20'
    },
    {
        id: 7,
        name: 'Fikri Hidayat',
        email: 'fikri.h@gmail.com',
        telp: '085211223344',
        status: 'online',
        joined_date: '2026-06-01'
    },
    {
        id: 8,
        name: 'Putri Amelia',
        email: 'putri.amel@yahoo.com',
        telp: '081277665544',
        status: 'offline',
        joined_date: '2026-04-22'
    },
    {
        id: 9,
        name: 'Rudi Hermawan',
        email: 'rudi.herm@gmail.com',
        telp: '089944556677',
        status: 'offline',
        joined_date: '2026-03-05'
    },
    {
        id: 10,
        name: 'Mega Wahyuni',
        email: 'mega.wahyuni@gmail.com',
        telp: '085699887766',
        status: 'online',
        joined_date: '2026-05-28'
    },
    {
        id: 11,
        name: 'Yusuf Maulana',
        email: 'yusuf.m@gmail.com',
        telp: '081311223300',
        status: 'offline',
        joined_date: '2026-06-15'
    },
    {
        id: 12,
        name: 'Diana Sari',
        email: 'diana.sari@gmail.com',
        telp: '087812998877',
        status: 'online',
        joined_date: '2026-06-19'
    }
];

export const initialPosts = [
    {
        id: 1,
        user_id: 1,
        title: 'Kucing Domestik Terluka Kaki Kanan Depan di Jalan Margonda',
        content: 'Halo teman-teman Save Cat, saya menemukan seekor kucing kampung berbulu oranye putih terluka di kaki kanan depannya. Kucingnya terlihat pincang dan ketakutan di dekat halte bus depan Gramedia Margonda. Saya sudah memberinya makan, tetapi butuh bantuan untuk evakuasi medis karena saya tidak membawa kandang.',
        status: 'active',
        created_at: '2026-06-20 14:30:22',
        location: 'Margonda, Depok',
        likes_count: 12
    },
    {
        id: 2,
        user_id: 1,
        title: 'Kitten 3 Bulan Siap Adopsi - Bersih dan Manja',
        content: 'Ada 3 ekor anak kucing berumur sekitar 3 bulan yang saya rescue dari selokan dekat rumah dua minggu lalu. Sekarang sudah bersih, sehat, diberikan obat cacing, dan siap diadopsi oleh owner yang bertanggung jawab (free adopt, no jual beli). Lokasi Tebet, Jakarta Selatan.',
        status: 'resolved',
        created_at: '2026-06-22 09:15:00',
        location: 'Tebet, Jakarta Selatan',
        likes_count: 8
    },
    {
        id: 3,
        user_id: 3,
        title: 'Butuh Bantuan Steril Kucing Liar (Trap-Neuter-Return) di Pasar Minggu',
        content: 'Populasi kucing liar di sekitar Pasar Minggu sudah sangat memprihatinkan. Banyak anak kucing yang sakit mata dan kelaparan. Saya berencana mengadakan TNR (Trap-Neuter-Return) minggu depan. Apakah ada relawan Save Cat yang bersedia meminjamkan pet cargo/trap cage dan membantu transportasi ke klinik rekanan?',
        status: 'active',
        created_at: '2026-06-18 17:45:10',
        location: 'Pasar Minggu, Jakarta Selatan',
        likes_count: 24
    },
    {
        id: 4,
        user_id: 4,
        title: 'Kucing Ras Persia Hilang di Sekitar Bintaro Sektor 9',
        content: 'TOLONG SHARING! Kucing peliharaan kami bernama Miko, ras Persia Medium, bulu abu-abu polos, memakai kalung merah dengan lonceng kecil. Terakhir terlihat melompat pagar rumah di Bintaro Sektor 9 dekat McD. Bagi yang menemukan atau melihat harap hubungi kontak di profil saya. Ada imbalan bagi yang mengembalikan.',
        status: 'active',
        created_at: '2026-06-24 11:02:15',
        location: 'Bintaro Sektor 9',
        likes_count: 19
    },
    {
        id: 5,
        user_id: 7,
        title: 'Update Evakuasi Kucing Terjebak di Atap Gudang Tinggi',
        content: 'Terima kasih atas bantuan tim Damkar dan relawan Save Cat Kemarin sore! Kucing calico yang terjebak selama 3 hari di atap gudang setinggi 8 meter akhirnya berhasil dievakuasi dengan selamat. Kucing sekarang sedang diobservasi di klinik karena dehidrasi ringan.',
        status: 'resolved',
        created_at: '2026-06-25 08:30:00',
        location: 'Sunter, Jakarta Utara',
        likes_count: 35
    },
    {
        id: 6,
        user_id: 10,
        title: 'Menemukan Kucing Anggora Putih Bermata Odd-Eye di Taman Menteng',
        content: 'Ditemukan kucing anggora putih bersih, mata odd-eye (biru & kuning), sangat jinak dan terawat. Sepertinya kucing peliharaan orang yang lepas. Sementara saya amankan di rumah saya. Bagi pemilik asli yang merasa kehilangan, silakan hubungi saya dengan menyertakan bukti foto bersama kucing ini untuk verifikasi.',
        status: 'active',
        created_at: '2026-06-25 20:10:45',
        location: 'Menteng, Jakarta Pusat',
        likes_count: 15
    },
    {
        id: 7,
        user_id: 12,
        title: 'Open Donasi untuk Pengobatan Kucing Tabrak Lari Kornea Pecah',
        content: 'Teman-teman pecinta kucing, kemarin malam kami merescue kucing jalanan korban tabrak lari di daerah Pancoran. Kondisinya kritis, mata sebelah kiri pecah kornea dan harus segera dioperasi enukleasi (pengangkatan bola mata). Estimasi biaya operasi dan rawat inap sekitar Rp 2.500.000. Kami membuka donasi sukarela.',
        status: 'active',
        created_at: '2026-06-26 06:12:00',
        location: 'Pancoran, Jakarta Selatan',
        likes_count: 42
    }
];

export const initialComments = [
    {
        id: 1,
        user_id: 2,
        post_id: 1,
        content: 'Ya ampun kasihan banget kak. Lokasi detailnya di mana? Saya ada kandang di rumah dekat Juanda Depok, kalau belum ada yang evakuasi kabari ya, saya bisa meluncur sore ini.',
        created_at: '2026-06-20 15:05:00'
    },
    {
        id: 2,
        user_id: 1,
        post_id: 1,
        content: 'Terima kasih kak Siti! Lokasinya persis di halte bus arah Jakarta, di samping tukang jualan koran/majalah. Kucingnya bersembunyi di bawah bangku halte.',
        created_at: '2026-06-20 15:12:30'
    },
    {
        id: 3,
        user_id: 2,
        post_id: 1,
        content: 'Oke kak Rian, saya siap-siap jalan ke sana bawa kandang jinjing dan makanan basah buat pancing.',
        created_at: '2026-06-20 15:20:00'
    },
    {
        id: 4,
        user_id: 5,
        post_id: 2,
        content: 'Lucu-lucu banget kittennya kak, pengen adopsi yang warna abu-abu tapi sayang di rumah kontrakan saya tidak diperbolehkan pelihara hewan. Semoga cepat dapat adopter yang baik!',
        created_at: '2026-06-22 10:30:15'
    },
    {
        id: 5,
        user_id: 6,
        post_id: 2,
        content: 'Kak, adopsinya syaratnya apa aja ya? Saya tinggal di Kemang, rumah pribadi ada halaman berpagar. Apakah boleh survei lokasi?',
        created_at: '2026-06-22 11:15:00'
    },
    {
        id: 6,
        user_id: 1,
        post_id: 2,
        content: 'Boleh banget kak Lia, silakan DM nomor WhatsApp kakak ya untuk koordinasi lebih lanjut. Syaratnya cukup bersedia berkomitmen steril ketika umurnya sudah cukup dan bersedia mengirimkan update berkala.',
        created_at: '2026-06-22 11:32:00'
    },
    {
        id: 7,
        user_id: 4,
        post_id: 3,
        content: 'Ide yang sangat luar biasa kak Budi! TNR adalah jalan terbaik. Kebetulan saya ada 2 trap cage nganggur di rumah. Boleh gabung bantu angkut kucingnya nanti.',
        created_at: '2026-06-18 19:10:00'
    },
    {
        id: 8,
        user_id: 3,
        post_id: 3,
        content: 'Mantap kak Dewi, terima kasih banyak! Saya hubungi lewat telp ya kak untuk koordinasi jadwal pastinya.',
        created_at: '2026-06-18 20:05:40'
    },
    {
        id: 9,
        user_id: 8,
        post_id: 4,
        content: 'Semoga cepat ketemu ya kak Mikonya. Coba cari pas malam hari sekitar jam 11 malam ke atas pas lingkungan sudah sepi, biasanya kucing ras yang lepas bersembunyi di bawah kolong mobil atau saluran air terdekat karena ketakutan.',
        created_at: '2026-06-24 12:40:00'
    },
    {
        id: 10,
        user_id: 9,
        post_id: 5,
        content: 'Alhamdulillah, terima kasih tim Damkar dan para relawan yang bertugas luar biasa sigap!',
        created_at: '2026-06-25 09:00:12'
    },
    {
        id: 11,
        user_id: 11,
        post_id: 6,
        content: 'Cantik sekali kucingnya mata odd-eye. Pasti ada pemiliknya yang kebingungan mencari. Semoga lekas berkumpul kembali.',
        created_at: '2026-06-25 21:30:00'
    },
    {
        id: 12,
        user_id: 10,
        post_id: 7,
        content: 'Saya sudah transfer donasi sedikit kak Diana, semoga bisa meringankan dan operasi si manis berjalan dengan lancar. Tetap semangat para rescue!',
        created_at: '2026-06-26 07:45:00'
    }
];
