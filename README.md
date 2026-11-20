# My PPL My Adventure

Game edukasi 2D bertema petualangan penyuluhan pertanian untuk mahasiswa.

## Mode permainan prototipe
- **Adventure:** jelajahi Desa Sukamaju dan bantu Pak Tani mengambil keputusan awal saat menemukan gejala gangguan tanaman.
- **Farm Simulator:** tanam, siram, dan panen tanaman.
- **Quiz Challenge:** jawab lima pertanyaan dasar penyuluhan dan pertanian.

## Teknologi
- HTML5, CSS3, JavaScript
- HTML Canvas 2D
- LocalStorage untuk menyimpan progres lokal
- GitHub Pages untuk publikasi

## Menjalankan secara lokal
Cukup buka `index.html` di browser modern. Untuk pengalaman terbaik, jalankan melalui ekstensi Live Server di Visual Studio Code.

## Publikasi GitHub Pages
1. Buat repository bernama `my-ppl-my-adventure`.
2. Unggah seluruh isi folder proyek ke root repository.
3. Buka **Settings → Pages**.
4. Pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Simpan dan tunggu proses publikasi selesai.

Workflow pada `.github/workflows/deploy.yml` juga disediakan untuk deployment otomatis melalui GitHub Actions.

## Catatan prototipe
- Tidak ada manajemen akun penyuluh atau registrasi resmi.
- Nama pemain bersifat nickname.
- Progres disimpan di browser/perangkat melalui LocalStorage. Menghapus data browser dapat menghapus progres.
- Leaderboard online, sinkronisasi lintas perangkat, aset karakter khusus, audio, dan konten misi lanjutan belum termasuk prototipe awal.


## Pembaruan versi 0.2.0
- Tampilan level dan gelar penyuluh mengikuti akumulasi XP.
- Informasi misi pada dashboard berubah setelah misi pertama selesai.
- Kontrol arah lebih nyaman untuk layar sentuh dan mendukung gerak diagonal yang seimbang.
- Status tombol gerak dibersihkan saat jendela kehilangan fokus.
- Fokus keyboard lebih terlihat untuk aksesibilitas.


## Versi 0.6.0 — Background Music & Settings
- Menambahkan menu **Pengaturan Game** pada menu utama.
- Toggle BGM Music untuk menghidupkan atau mematikan musik latar.
- Slider untuk mengatur volume musik (0–100%).
- Musik diputar berulang (loop) dan pengaturan audio tersimpan di perangkat melalui localStorage.
- Musik mulai diputar setelah interaksi pengguna melalui tombol **Mulai Petualangan**, sesuai kebijakan autoplay browser.
- File musik berada di `assets/audio/background-music.mp3`.


## Versi 0.7.0 — Adventure Missions & Milestones
- Adventure diperluas menjadi 11 misi dengan 8 warga/NPC tambahan.
- Tema misi: benih bermutu, pemupukan berimbang, komunikasi penyuluhan, keamanan pestisida, konservasi tanah, pangan keluarga, pengelolaan air, dan kompos.
- Setiap misi memiliki pertanyaan, pilihan jawaban, penjelasan, serta hadiah XP dan koin.
- Progres misi tambahan disimpan terpisah agar progres lama tetap dipertahankan.
- Kurva level diperlambat menjadi 250 XP per level (sebelumnya 100 XP).
- Indikator XP menampilkan progres terhadap target 250 XP.
- Ditambahkan milestone Penjelajah Desa (6 misi) dan Pahlawan Sukamaju (seluruh 11 misi).
- Syarat Penyuluh Berprestasi disesuaikan menjadi Level 5 (1.000 XP).


## Versi 0.9.0 — Mini-game Merakit Drum Seeder
- Menambahkan mini-game PM-AAS untuk menyusun lima komponen drum seeder: pegangan, rangka utama, poros, tabung penjatah benih, dan roda.
- Pemain dapat memilih komponen lalu memilih tempat pemasangan; pada desktop komponen juga dapat diseret (drag-and-drop).
- Menambahkan pemeriksaan hasil rakitan, umpan balik untuk jawaban yang belum tepat, dan bonus XP untuk rakitan tanpa kesalahan.
- Status penyelesaian misi disimpan bersama progres PM-AAS yang sudah ada.
- Progres versi sebelumnya, pengaturan musik, dan penyimpanan LocalStorage tetap menggunakan kunci yang sama.
- Ilustrasi rakitan merupakan penyederhanaan edukatif berdasarkan contoh drum seeder, bukan panduan servis untuk semua tipe alat.


## Versi 0.9.1 — Komponen Drum Seeder Bergambar
- Mengganti daftar komponen berbasis ikon menjadi kartu gambar roda, drum penjatah benih, poros, rangka utama, dan pegangan.
- Setiap slot perakitan menampilkan gambar komponen setelah berhasil dipasang.
- Drag-and-drop di komputer dan metode ketuk-komponen/ketuk-slot di ponsel tetap didukung.
- Memperjelas urutan perakitan dan mempertahankan hadiah serta status penyelesaian misi.


## Versi 0.9.2 — Perakitan Drum Seeder Interaktif
- Posisi tempat pemasangan diacak/tidak mengikuti urutan kartu komponen.
- Ilustrasi mesin di bagian atas memperlihatkan komponen secara bertahap hanya setelah dipasang.
- Roda, drum benih, poros, rangka, dan pegangan memiliki lapisan visual terpisah.

## Versi 0.10.0 — Pendampingan Adopter PM-AAS Lima Tahap
- Setiap calon adopter menjalani 5 tahapan dan 14 langkah: persiapan lahan; pemilihan benih dan Tabela; pemeliharaan air dan pemupukan; pengendalian gulma dan OPT; panen dan pascapanen.
- Setiap langkah menampilkan uraian pekerjaan lapangan, lalu pemain menyelesaikannya satu per satu.
- Progres setiap petani/kelompok tani disimpan terpisah.
- Hadiah XP diberikan per langkah, bonus ketika satu tahapan selesai, dan bonus adopsi ketika seluruh tahapan selesai.
- Adopsi kelompok tani tetap memperoleh bonus lebih besar daripada petani perorangan.
- Data adopsi yang telah selesai pada versi sebelumnya tetap dikenali; progres lama yang belum selesai perlu mengikuti rangkaian lima tahap yang baru.
- Herbisida hanya disebut sebagai pilihan bila diperlukan dan harus mengikuti label/petunjuk; rincian teknis mengikuti materi yang diberikan pengguna.

## Versi 0.11.0 — Penyempurnaan Profil, Level, Event, dan Kuis
- Profil penyuluh dipindahkan ke avatar kanan atas dan dibuka melalui klik/tap avatar.
- Tombol reset progres dipindahkan ke dalam Pengaturan Game.
- Event PM-AAS terkunci untuk pemain Level 1 dan terbuka mulai Level 2 (150 XP).
- Level 1 membutuhkan 150 XP; level berikutnya masing-masing membutuhkan 250 XP.
- Kuis tetap berisi 5 soal per sesi, tetapi diambil secara acak dari bank 20 pertanyaan, termasuk topik PM-AAS, Tabela, drum seeder, AWD, pemupukan, pengendalian OPT, dan panen.
- Pengaturan musik, progres misi, event, serta penyimpanan lokal tetap dipertahankan.


## Versi 0.11.1 — Tata Letak Drum Seeder untuk HP
- Kolom gambar komponen dan kolom tempat pemasangan tetap berdampingan pada layar handphone.
- Ukuran kartu, gambar, label, dan jarak disesuaikan agar dua kolom tetap muat di layar kecil.


## Pembaruan v0.12.1
- Memperbaiki tata letak kartu level agar ilustrasi daun tidak menimpa teks pada layar ponsel.
- Menambahkan indikator panah pada avatar profil.
- Menambahkan 10 pilihan ilustrasi avatar petani pria dan wanita.
- Avatar pilihan disimpan bersama progres lokal pemain; progres lama tetap dipertahankan.

## Pembaruan v0.13.0 — Visual Desa Adventure
- Memperbarui ilustrasi dunia Adventure dengan tekstur rumput, jalan desa berlapis, tepian sungai, dan detail pematang.
- Area persawahan kini memiliki genangan air, barisan tanaman, serta pematang yang lebih jelas.
- Lahan demonstrasi, rumah warga, balai kelompok tani, dan kios pertanian mendapat detail visual tambahan.
- Pepohonan, vegetasi, penanda NPC, dan karakter pemain diberi bayangan serta detail agar dunia terasa lebih hidup.
- Mempertahankan koordinat dunia, NPC, rintangan, sistem interaksi, misi, XP, dan penyimpanan progres.


## Pembaruan v0.14.0 — Karakter dan Interaksi Adventure
- Karakter pemain dan NPC kini digambar sebagai petani utuh dengan kepala, badan, tangan, kaki, pakaian, topi, dan bayangan yang solid.
- Kaki karakter pemain bergerak bergantian saat pemain berjalan.
- Label nama warga dan petunjuk interaksi diberi latar kontras, ukuran adaptif, dan batas posisi agar lebih mudah dibaca.
- Petunjuk desktop menggunakan tombol E/Spasi; pada layar HP berubah menjadi instruksi tap tombol INTERAKSI.
- Petunjuk kontrol, HUD, dan panel misi disesuaikan agar teks tidak mudah bertumpuk pada layar kecil.
- Data progres, koordinat NPC, misi, dan sistem permainan tetap dipertahankan.


Pembaruan v0.14.0: tempo animasi langkah kaki karakter pemain dipercepat dan ayunan langkah diperjelas.


Pembaruan v0.14.0: karakter pemain memakai seragam dinas lapangan lengkap terinspirasi referensi pengguna: kemeja olive dengan tanda bahu dan saku, sabuk hitam, celana panjang hijau gelap, dan sepatu hitam. Animasi langkah dipertahankan.


Pembaruan v0.14.0: frekuensi siklus animasi kaki karakter pemain dipercepat signifikan agar langkah lebih responsif saat bergerak. Kecepatan perpindahan karakter tidak diubah.


Pembaruan v0.14.0: pengaturan kontrol gerak HP dengan pilihan Analog (joystick virtual) atau Arah Panah. Preferensi tersimpan di pengaturan perangkat; keyboard desktop tetap tersedia.


Pembaruan v0.14.0: status bergerak untuk animasi karakter kini juga membaca input joystick analog, sehingga siklus langkah kaki aktif saat joystick digerakkan. Ambang input kecil digunakan untuk mencegah animasi saat joystick diam.


Pembaruan v0.14.0: peta Adventure diperkaya dengan petak tanaman, kebun kecil, bangku, peti, dan bunga. Ditambahkan satu misi spesial yang ditempatkan secara acak pada NPC; setelah diselesaikan pemain memperoleh kucing peliharaan yang mengikuti karakter. Kepemilikan kucing dan NPC pemberi misi disimpan pada save lama tanpa menghapus progres.


## Perbaikan v0.14.1 — Animasi Joystick HP

Memperbaiki kondisi animasi berjalan pada karakter pemain agar mendeteksi input joystick analog di perangkat HP. Animasi kaki kini aktif ketika joystick digeser, dan berhenti ketika joystick dilepas atau kembali ke posisi tengah. Pergerakan karakter, kontrol keyboard, serta data progres permainan tidak diubah.


## Pembaruan v0.15.0 — Desa, Peternakan, dan Tambang Emas
- Peta Adventure diperluas dengan area peternakan, kandang ternak, ilustrasi sapi/kambing, tempat pakan, papan petunjuk, dan mulut tambang emas.
- Tulisan “JALAN DESA” dipindahkan ke tengah jalan utama agar terbaca sebagai penanda jalan.
- Perbaikan collision: pemain tertahan oleh bangunan, petak kebun, area kandang, pepohonan, dan NPC sehingga tidak menembus atau bertumpuk dengan objek utama.
- Ditambahkan NPC Pak Asep di area peternakan dengan misi perawatan ternak. Hadiah misi: 30 XP dan 15 koin.
- Pemain dapat masuk melalui mulut tambang emas dan berpindah ke layar tambang bawah tanah. Terdapat lima bongkahan emas yang dapat ditambang dengan tombol E atau INTERAKSI.
- Saat kembali melalui pintu keluar tambang, setiap bongkah emas otomatis dikonversi menjadi 12 XP dan 2 koin. Sisa bongkahan yang belum ditambang tetap tersedia ketika pemain masuk kembali.
- Data misi peternakan dan hasil tambang disimpan pada save yang sama. Save lama tetap kompatibel dan progres lama tidak direset.


## v0.15.2 — Tutorial pemain baru
- Menambahkan panduan awal empat langkah untuk profil/avatar, Adventure, Farm Simulator, dan Quiz Challenge.
- Tutorial hanya muncul pada pemain yang belum memiliki data progres dan belum menyelesaikan tutorial.
- Pilihan tutorial disimpan terpisah agar progres permainan lama tidak berubah.


## v0.15.3 — Perbaikan pemicu tutorial pemain baru
- Tutorial dipicu saat pemain menekan Mulai Petualangan selama penanda tutorial belum berstatus completed.
- Tidak lagi bergantung pada keberadaan save game, karena proses pemuatan game membuat save awal otomatis.
- Memperbaiki selector sorotan avatar dan indikator langkah tutorial.


## v0.15.4 — Tutorial menyatu dengan beranda
- Pemain baru langsung diarahkan ke beranda game setelah memulai, lalu tutorial menyorot avatar dan kartu menu satu per satu.
- Latar belakang diredupkan dengan spotlight terang di sekitar elemen yang dijelaskan.
- Kotak tutorial berwarna terang berpindah posisi mengikuti letak elemen, dengan tombol Lanjutkan dan Lewati tetap tersedia.


## v0.15.5 — Penyempurnaan visual tutorial
- Kotak tutorial dibuat semi-transparan dengan efek blur agar menu di belakang tetap terlihat.
- Area sorotan mengikuti ukuran elemen menu/avatar yang sedang dijelaskan, bukan lingkaran tetap.
- Posisi kartu tutorial otomatis memilih sisi berlawanan dari elemen target agar tidak menutup menu.
- Ukuran kartu dipadatkan agar lebih nyaman pada layar HP.


## v0.16.0 — Farm Simulator hybrid
- Kebun 2D yang dapat dijelajahi dengan klik/tap, WASD/tombol panah, dan tombol arah di HP.
- Enam petak lahan, empat jenis tanaman, toko benih, inventaris, pasar hasil panen.
- Tanam, siram, pupuk, tunggu pertumbuhan, dan panen dengan hadiah XP/koin.
- Data kebun disimpan pada save game yang sama; progres dan fitur versi sebelumnya tetap dipertahankan.


## v0.16.1 — Ekonomi kebun dan pembukaan lahan bertahap
- Notifikasi pembelian benih, penjualan hasil panen, penanaman, penyiraman, pemupukan, panen, dan pembukaan lahan.
- Stok benih ditampilkan per jenis tanaman pada layar kebun dan toko.
- Hanya petak pertama yang terbuka di awal. Petak berikutnya dibeli berurutan menggunakan koin.
- Harga pembukaan lahan: 35, 55, 80, 110, dan 150 koin.
- Save lama tetap dibaca; petak lama yang sudah memiliki tanaman tetap dibuka agar tanaman/progres tidak hilang. Data lahan, stok benih, hasil panen, dan lahan terbuka kini ikut disimpan.
