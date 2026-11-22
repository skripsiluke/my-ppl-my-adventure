## Update v0.20.85
- Pada tampilan HP/Android, kontrol gerak (joystick/arah) dan tombol INTERAKSI dipindahkan tepat di bawah scene gameplay.
- Kartu Misi Adventure dipindahkan ke bawah kontrol agar kontrol lebih dekat dengan area permainan.
- Tata letak desktop tidak diubah.

## Update v0.20.84
- Judul LTT pada layar HP penyuluh dipecah menjadi dua baris: “LAPORAN LUAS” dan “TAMBAH TANAM”, dengan ukuran dan jarak yang disesuaikan agar tidak melebar keluar layar.

## Update v0.20.80
- Menghapus tombol overlay “Keluar Kios” yang menumpuk/tersangkut. Keluar dari interior kios sekarang menggunakan tombol E saat pemain berada di dekat pintu.
- Misi Monitoring Harga Pupuk Bersubsidi dapat diulang satu kali per hari kalender lokal. Setelah laporan diserahkan, misi baru tersedia pada hari berikutnya.
- Hadiah setiap penyelesaian tetap 50 XP (5 tahap × 10 XP), tanpa hadiah koin tambahan.

## Update v0.20.78
- Misi Monitoring Harga Pupuk Bersubsidi: setelah menerima tugas dari PPL Monitoring, pemain langsung berpindah ke interior Kios Pertanian bersama NPC PPL.
- Interior kios dilengkapi rak dan karung pupuk Urea/NPK, papan harga, meja pelayanan, Pak Hasan, serta pintu keluar.
- Pemeriksaan harga dan stok dilakukan di dalam kios; setelah wawancara petani, pemain kembali ke kios untuk mengisi dan menyerahkan laporan kepada PPL.
- Scene lain, termasuk BPP dan Farm Simulator, tidak diubah.

## Update v0.20.76
- NPC desa kini berjalan berkeliling secara mandiri, baik misi belum maupun sudah selesai; interaksi NPC tetap menggunakan E / tombol INTERAKSI.
- Lahan Demonstrasi dapat dimasuki melalui E / INTERAKSI dan membuka Farm Simulator.
- Ditambahkan tombol kembali ke Adventure Map dari Farm Simulator. Mekanik dan kontrol inti Farm Simulator tidak diubah.

## Update v0.20.18
- Farm Simulator: pembelian benih dan pestisida langsung menyegarkan seluruh indikator koin setelah transaksi tersimpan.
- Sinkronisasi saldo juga diterapkan pada pembelian pupuk dan pembukaan lahan.

## Update v0.17.0
- Farm Simulator redesigned into one compact interactive gameplay canvas.
- Seed selection, farming actions, and shop / inventory / market buildings are clickable inside the game area.
- Canvas backing resolution increased to 2x for sharper rendering while keeping the same saved-game data.

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


## v0.16.2 — Pemilihan benih sebelum menanam
- Stok tiap jenis benih kini berupa tombol yang dapat diketuk/diklik.
- Benih terpilih ditandai dengan highlight dan label DIPILIH.
- Tombol tanam menampilkan jenis benih aktif, misalnya Tanam Padi.
- Benih dengan stok nol tidak dapat dipilih.
- Pemilihan benih disimpan pada progres kebun.


## v0.19.2 — Penguncian Kebun Sawit
- Kebun Sawit terkunci sampai pemain mencapai Level 5 — Penyuluh Pertanian Ahli Pertama.
- Pemain di bawah Level 5 menerima notifikasi saat mencoba masuk; gerbang menampilkan status terkunci.
- Progres permainan dan penyimpanan lama tetap dipertahankan.

## v0.20.0 — Penyempurnaan Tambang Emas
- Area tambang dipercantik dengan detail gua, obor, peti harta karun, dan permata sebagai dekorasi.
- Objek emas yang dapat ditambang divisualisasikan sebagai emas batangan dan koin.
- Kelabang merah bawah tanah muncul berkala dan mengejar pemain.
- Jika tersentuh kelabang, XP berkurang 2 poin (tidak sampai negatif); monster menghilang sementara sebelum muncul kembali.
- Sistem save lama tetap dipertahankan.


## v0.20.1 — Regenerasi Emas Otomatis
- Titik emas yang sudah ditambang muncul kembali otomatis setelah sekitar 3,5 detik.
- Emas terus tersedia selama pemain berada di dalam tambang; tidak perlu keluar-masuk untuk mengisi ulang.
- Titik kemunculan baru dipilih secara acak dan diupayakan tidak terlalu dekat dengan pemain atau titik emas lain.
- Saat masuk kembali, titik emas yang sedang kosong dipulihkan agar tambang tetap siap digunakan.
- Progres permainan dan sistem monster kelabang tetap dipertahankan.


## v0.20.4 — Akses Tambang dan Tantangan Kelabang
- Tambang Emas terkunci sampai pemain mencapai Level 2 — Penyuluh Pertanian Terampil (400 XP). Pemain yang belum memenuhi syarat menerima notifikasi saat mencoba masuk.
- Regenerasi titik emas diperlambat menjadi sekitar 12 detik setelah ditambang.
- Sentuhan kelabang merah mengurangi 10 XP (tidak sampai nilai XP negatif).
- Penyimpanan progres dan kunci save tetap kompatibel dengan versi sebelumnya.


## v0.20.6 — Boss Kelabang Tambang Emas
- Kapak tambang tersedia melalui tombol khusus di pojok kanan atas area tambang, terpisah dari pintu keluar. Pemain perlu mengetuk/mengklik tombol untuk mengambil kapak.
- Saat memasuki tambang, pemain menerima notifikasi untuk mengambil kapak sebagai persiapan menghadapi boss.
- Setelah lima kelabang biasa muncul, pemain mendapat peringatan sebelum Boss Kelabang keluar. Boss menunggu kelabang biasa yang sedang aktif selesai terlebih dahulu.
- Boss memiliki 100 HP dan membutuhkan 20 pukulan kapak; setiap pukulan mengurangi 5 HP dengan jeda 0,5 detik. Serangan dilakukan saat pemain dekat boss menggunakan E/Spasi atau tombol INTERAKSI.
- Sentuhan Boss mengurangi 20 XP (tidak sampai negatif). Setelah boss dikalahkan, pemain mendapat 100 XP dan 50 koin.
- Save game lama tetap kompatibel; status kapak dan pertarungan boss berlaku selama sesi berada di tambang.


## v0.20.7 — Perbaikan Karakter Terkunci Setelah Terkena Kelabang
- Memperbaiki penanganan tabrakan kelabang biasa setelah pemain mengambil kapak.
- Saat terkena kelabang, pemain tetap menerima penalti -10 XP dan kelabang menghilang seperti sebelumnya.
- Karakter mendapat dorongan menjauh singkat dan input gerak yang tertahan dilepas agar kontrol dapat digunakan kembali.
- Fitur kapak dan Boss Kelabang tetap dipertahankan.


## v0.20.8 — Perbaikan Kontrol Setelah Tabrakan Kelabang
- Menghapus reset objek input keyboard, joystick, dan status interaksi dari proses tabrakan kelabang biasa.
- Setelah terkena kelabang, XP tetap berkurang 10, kelabang menghilang sementara, dan karakter terdorong menjauh.
- Input gerak yang sedang aktif tidak lagi dihapus dari dalam game loop, sehingga kontrol sentuh/keyboard tetap tersambung.
- Sistem kapak, Boss Kelabang, tambang emas, dan kompatibilitas save tetap dipertahankan.


## v0.20.10 — Ketahanan Game Loop Setelah Tabrakan
- Memperbaiki loop animasi utama agar frame berikutnya tetap dijadwalkan sebelum proses gambar dan simulasi dijalankan.
- Error pada satu frame tidak lagi menghentikan seluruh loop kontrol secara permanen.
- Input gerak, joystick, dan interaksi tetap diproses pada frame berikutnya.
- Mekanisme penalti kelabang tetap: -10 XP dan kelabang menghilang sementara.

## v0.20.12 — Notifikasi Kemenangan dan Peti Hadiah Boss
- Setelah Boss Kelabang dikalahkan, tampil notifikasi selamat dengan rincian hadiah +100 XP dan +50 koin.
- Peti harta karun kini benar-benar muncul di lokasi Boss dikalahkan.
- Pemain dapat mendekati peti dan menekan E/Spasi atau tombol INTERAKSI untuk membuka peti.
- Membuka peti menampilkan konfirmasi bahwa hadiah kemenangan sudah diterima; hadiah tidak diberikan dua kali.
- Progres dan penyimpanan permainan sebelumnya tetap dipertahankan.

## v0.20.15 — Notifikasi Boss Meriah dan Siklus Gelombang Tambang
- Kemenangan Boss Kelabang kini menampilkan overlay SELAMAT bergaya notifikasi naik level, berisi hadiah +100 XP dan +50 koin.
- Setelah Boss kalah, gelombang kelabang berhenti sementara selama 45 detik.
- Setelah jeda, lima kelabang biasa muncul kembali, disusul peringatan dan Boss Kelabang berikutnya.
- Sistem gelombang berulang menjaga tantangan tambang tetap aktif sehingga penambangan tidak berlangsung tanpa risiko.


## v0.20.15
- Siklus tambang berulang: setelah Boss dikalahkan, jeda 30 detik lalu lima kelabang kecil muncul kembali sebelum Boss berikutnya.
- Notifikasi kemenangan Boss menggunakan tampilan overlay bergaya naik level dengan pesan dan hadiah lebih meriah.


## v0.20.21
- Memindahkan pintu masuk Tambang Emas ke area kosong di sisi jalan desa (koordinat peta 760, 760), termasuk papan nama, petunjuk, dan titik interaksi.
- Tidak mengubah struktur penyimpanan progres permainan.


## Update v0.20.48
- Mode Adventure: mengganti tanaman hias yang menutupi pertemuan jalan desa dan sungai dengan jembatan kayu kecil.
- Jembatan disejajarkan dengan jalan desa, diberi papan lantai dan pegangan rendah, serta area pendekatannya dibersihkan.
- Menghapus tanaman dan pohon dekoratif yang menempati titik jembatan. Tidak mengubah sistem misi, penyimpanan progres, maupun scene lainnya.


## Update v0.20.49
- Memperbaiki collision pada jembatan jalan desa yang melintasi sungai.
- Area dek jembatan dan jalur pendekatannya kini dikecualikan dari collision dekorasi/pagar sehingga karakter dapat berjalan melintasinya.
- Tidak mengubah tata letak jembatan, misi, penyimpanan, atau fitur gameplay lainnya.


## Update v0.20.50
- Menghilangkan dua pohon dekoratif yang tumbuh/bertumpuk di area bangunan Balai Kelompok Tani Sukamaju, termasuk collision batang pohon yang terkait.
- Memperlebar papan nama Balai dan membagi tulisan menjadi dua baris agar seluruh teks berada di dalam border.
- Tidak mengubah collision jembatan, misi, penyimpanan progres, maupun fitur gameplay lainnya.


## Update v0.20.51
- Menghapus bedeng tanaman dekoratif pada koordinat yang bertumpuk dengan barisan tanaman di lahan demonstrasi/area administrasi.
- Menjaga bedeng dekoratif lainnya dan seluruh fitur gameplay, collision jembatan, serta progres tersimpan.


## Update v0.20.52
- Jendela portal SIMLUHTAN/e-RDKK/e-Banper kini diposisikan berdasarkan batas layar monitor CRT pada canvas, bukan persentase wrapper, sehingga konten terpotong rapi di dalam monitor.
- Pita petunjuk misi PC diperlebar dan teks dipisah menjadi dua baris agar tetap berada di dalam border.


## Patch BPP berbasis v0.20.52
- Pada perangkat sentuh, papan pintu BPP menampilkan petunjuk `MASUK: INTERAKSI`; pada desktop tetap `MASUK E`.
- Label nama BPP di bawah fasad disembunyikan agar tidak bertumpuk dengan petunjuk pintu.
- Patch dibuat langsung dari baseline v0.20.52 untuk mempertahankan fitur dan tata letak versi tersebut.


## Update v0.20.57 (berbasis v0.20.52 BPP Fix)
- Menambahkan truk Koperasi Desa Merah Putih Sukamaju yang bergerak bolak-balik di jalan utama Desa Sukamaju.
- Ukuran sprite disesuaikan dengan skala karakter dan lebar jalan; truk digambar di lapisan jalan di belakang NPC/pemain.
- Truk bersifat dekoratif dan tidak mengubah collision, misi, maupun data save.


## Update v0.20.58
- Model truk Kopdes diperbarui mengikuti referensi foto: truk bak terbuka/berpagar putih dengan aksen merah dan identitas Koperasi Desa Merah Putih.
- Truk mengikuti rute berulang yang menyusuri jalan horizontal, jalan vertikal, dan akses jalan menuju BPP.
- Orientasi sprite mengikuti arah perjalanan, termasuk saat berbelok ke ruas jalan vertikal, sehingga bagian depan selalu menghadap arah maju.
- Ukuran sprite disesuaikan dengan lebar jalan.


## Update v0.20.59
- Truk Kopdes diperbesar dari 132 menjadi 164 unit game dan orientasi sprite diperbaiki: tetap tegak, tidak terbalik saat berbelok atau bergerak ke arah berlawanan. Sprite dibalik horizontal hanya saat menuju kanan.
- Menambahkan pengendara ojek online bermotor yang bergerak mengikuti rute jalan yang sama dengan jeda posisi terhadap truk.


## Update v0.20.60
- Memperbaiki arah hadap truk Kopdes: sprite sumber menghadap ke kanan, sehingga hanya dibalik horizontal saat bergerak ke kiri. Truk tidak lagi tampak mundur saat bergerak ke kanan.


## Update v0.20.61
- Truk Kopdes dan motor ojol diputar mengikuti arah jalan pada ruas vertikal maupun horizontal.
- Menambahkan mobil penumpang yang bergerak mengikuti rute jalan desa.


## Update v0.20.62
- Pada jalan horizontal ke kiri, kendaraan dicerminkan kiri-kanan tanpa rotasi 180 derajat agar tidak terbalik.
- Orientasi kendaraan pada jalan vertikal dipertahankan seperti v0.20.61.


## Update v0.20.63
- Memperluas area map dari 1800×1200 menjadi 2400×1600 tanpa memindahkan objek, bangunan, NPC, dan lahan lama.
- Menambahkan ruas jalan tersambung di sisi timur dan selatan, kebun, rumah warga, dan gudang tani.
- Rute kendaraan diperluas agar ikut menyusuri jaringan jalan tambahan.


## Update v0.20.64
- Memindahkan Balai Kelompok Tani ke koordinat dunia X=800, Y=1200 (sudut kiri atas bangunan).
- Memindahkan papan nama Balai mengikuti bangunan. Collision bangunan mengikuti koordinat baru melalui data buildings.
- Objek dan fitur lain tidak diubah.

## Update v0.20.65
- Mengalihkan aliran sungai irigasi ke koridor hijau di selatan jalan utama agar tidak bertumpuk dengan jalan.
- Memindahkan jembatan kayu ke titik perpotongan sungai dengan jalan vertikal desa.
- Mempertahankan jalur jalan, bangunan, dan data penyimpanan permainan.


## Update v0.20.67
- Gudang Tani dipindahkan ke koordinat X=2200, Y=400.
- Balai Kelompok Tani dipindahkan ke koordinat X=600, Y=1000; papan nama dan tiang penyangga disesuaikan.
- Penyesuaian tetap mempertahankan bangunan SPPG, kendaraan, sungai, dan progres penyimpanan permainan.


## Update v0.20.70
- Balai Kelompok Tani digeser ke kiri dari X=600 menjadi X=500 (Y tetap 1000) agar tidak bertumpuk dengan jalan.
- Papan nama dan tiang penyangga ikut disesuaikan dengan posisi bangunan.


## Update v0.20.72
- Menambahkan Motor PPL bergaya Honda CRF sebagai kendaraan yang dapat dinaiki di tepi jalan utama desa.
- Tekan E / INTERAKSI saat dekat motor untuk naik; gunakan WASD, tombol panah, atau analog untuk berkendara.
- XP: +1 saat motor pertama kali mulai berjalan, lalu +3 XP setiap 30 detik selama berkendara.
- Tekan E / INTERAKSI untuk memarkir motor dan turun. Motor dapat digunakan berulang kali dan tidak menambah jumlah 12 misi reguler Adventure.
- Posisi motor terakhir disimpan; status sedang mengendarai tidak dipertahankan saat halaman dimuat ulang.


## Update v0.20.73
- Ukuran visual Motor PPL beserta pengendara diperkecil sekitar 18% agar lebih proporsional dengan karakter dan kendaraan NPC.
- Tidak mengubah posisi motor, kecepatan, kontrol, atau sistem hadiah XP.


## Update v0.20.75
- Memindahkan kandang ternak ke area rumput kosong di sebelah barat Balai Kelompok Tani; label AREA PERSAWAHAN dan objek sekitar tetap bebas.

## Update v0.20.74
- Ukuran tampilan motor PPL beserta pengendara diperkecil menjadi 60% dari ukuran dasar agar lebih proporsional dengan karakter dan kendaraan NPC.
- Kontrol, kecepatan, orientasi, serta sistem hadiah XP motor tidak diubah.


## Update v0.20.77
- Menambahkan NPC khusus PPL Monitoring di sekitar Kios Pertanian dengan area patroli terbatas.
- Menambahkan misi Monitoring Harga Pupuk Bersubsidi dengan lima tahapan, total 50 XP, tanpa hadiah koin.
- Progres misi disimpan dan dapat dilanjutkan setelah permainan dimuat ulang.


## v0.20.83
- Perbaikan formulir LTT pada HP: seluruh kontrol HTML diskalakan bersama canvas agar tetap berada di dalam layar ponsel.
- Menghapus tombol kirim duplikat yang sebelumnya digambar pada canvas; hanya satu tombol Kirim Laporan pada formulir.


## v0.20.86
- Memperbaiki urutan kontrol Adventure pada Android secara struktural: joystick dan tombol INTERAKSI ditempatkan tepat setelah scene gameplay dan sebelum kartu misi.
- Urutan desktop dipertahankan seperti sebelumnya.


## v0.20.88
- BGM otomatis dijeda saat halaman game masuk latar belakang, tab berpindah, jendela kehilangan fokus, atau perangkat menyembunyikan halaman.
- BGM dilanjutkan saat pengguna kembali hanya jika sebelumnya sedang diputar dan pengaturan BGM masih aktif.
- Jika pengguna mematikan BGM, game tidak menyalakannya kembali secara otomatis.


## v0.20.88
- Perbaikan lifecycle audio: BGM dipause secara paksa saat halaman tersembunyi, kehilangan fokus, pagehide, atau Android membekukan tab; BGM hanya dilanjutkan ketika halaman kembali terlihat dan sebelumnya memang sedang aktif.
