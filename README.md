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
