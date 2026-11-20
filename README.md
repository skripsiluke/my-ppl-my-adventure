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
