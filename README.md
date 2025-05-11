# Employee Task Management (Next.js Frontend)

## Arsitektur Solusi
Aplikasi ini menggunakan arsitektur frontend React (Next.js) yang berinteraksi dengan backend melalui RESTful API. Berikut adalah alur data antara frontend dan backend:
1. **Frontend Request** : Pengguna berinteraksi dengan antarmuka frontend untuk menambah, mengedit, atau menghapus tugas karyawan.
2. **HTTP Communication** : Frontend mengirimkan request HTTP ke backend (misalnya: POST untuk menambah data, GET untuk mengambil data).
3. **Backend Processing** : Backend memproses permintaan, seperti menyimpan data ke database atau mengambil data dari database.
4. **Response Handling** : Backend mengembalikan respons dalam format JSON, yang kemudian ditangkap oleh frontend untuk dirender di UI.

Diagram alur data:
> Frontend (Next.js) -[HTTP Request]→ Backend (Laravel) -[Database Interaction]→ Database
>
> Frontend (Next.js) ←[JSON Response]- Backend (Laravel) ←[Database Query]- Database

## Penjelasan Desain
1. **Validasi Input dan Schema**
    - Aplikasi menggunakan Zod sebagai pustaka validasi schema untuk memastikan bahwa input yang diberikan pengguna sesuai dengan aturan yang telah ditentukan
    - Schema taskSchema mendefinisikan struktur dan validasi untuk setiap field task, seperti nama karyawan, deskripsi tugas, tanggal, jam kerja, tarif per jam, biaya tambahan, dan total remunerasi.
    - Validasi ini membantu mencegah error sebelum data dikirim ke backend.
2. Perhitungan Total Remunerasi
    - Logika perhitungan total remunerasi diimplementasikan pada sisi frontend untuk memberikan feedback langsung kepada pengguna.
    - Rumus perhitungan adalah:    
    `Total Remunerasi = (Jam Kerja × Tarif Per Jam) + Biaya Tambahan`
    - Fungsi calculateTotalRemuneration digunakan untuk menghitung nilai ini secara otomatis saat pengguna memasukkan atau memperbarui data terkait jam kerja, tarif per jam, atau biaya tambahan

3. **Manajemen State**
    - State lokal dikelola menggunakan React useState dan React Hook Form untuk mengelola formulir dan data task.
    - Data task disimpan dalam state tasks dan diperbarui secara dinamis ketika ada operasi CRUD (Create, Read, Update, Delete).
4. **Komponen UI**
    - Aplikasi menggunakan komponen UI dari Shadcn/ui , seperti tabel, dialog, tombol, dan form, untuk menciptakan antarmuka yang modern dan responsif.
    - Tabel digunakan untuk menampilkan daftar tugas, sedangkan dialog digunakan untuk membuat atau mengedit tugas.

## Fitur Utama
1. CRUD Operations
    - **Create** : Pengguna dapat membuat task baru melalui dialog form.
    - **Read** : Daftar task ditampilkan dalam tabel dengan informasi seperti nama karyawan, deskripsi tugas, tanggal, jam kerja, tarif per jam, biaya tambahan, dan total remunerasi.
    - **Update** : Pengguna dapat mengedit task yang sudah ada dengan membuka dialog form yang telah diisi dengan data task tersebut.
    - **Delete** : Pengguna dapat menghapus task setelah konfirmasi melalui dialog alert.
2. Validasi dan Feedback
    - Setiap input divalidasi menggunakan Zod dan React Hook Form.
    - Jika ada kesalahan validasi, pesan kesalahan akan ditampilkan di bawah field yang bersangkutan.
    - Notifikasi sukses atau gagal ditampilkan menggunakan Sonner Toast .
3. Pengaturan Format
    - **Tanggal** : Diformat menjadi format pendek (e.g., "Oct 5, 2023").
    - **Mata Uang** : Nilai numerik seperti tarif per jam, biaya tambahan, dan total remunerasi diformat ke dalam mata uang USD.


## Setup & Deploy
### Langkah-langkah Menjalankan Aplikasi Secara Lokal
1. Clone Repository
    ```bash
    git clone https://github.com/gunnery34/nextjs-coding-challenge-aic

    cd nextjs-coding-challenge-aic

    ```
2. Install Dependencies
    ```bash
    npm install
    ```
3. Konfigurasi Environment
    - Salin file `.env.example` menjadi `.env`:
        ```
        cp .env.example .env
        ```
    - Edit file `.env` untuk mengatur endpoint API:
        ```
        NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000/
        ````
4. Jalankan Aplikasi Lokal
    ```
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`
5. Testing dengan Backend
    - Pastikan backend Laravel sudah berjalan di `http://localhost:8000`.
    - Gunakan aplikasi frontend untuk menguji operasi CRUD melalui API.


### Deploy ke Production
1. Hosting Frontend
    - Platform yang direkomendasikan: **Vercel**, **Netlify**, atau **AWS Amplify**.
    - Pastikan environment production sudah dikonfigurasi dengan benar (`.env.production`).
2. Setup Backend
    - Pastikan backend Laravel sudah di-deploy dan endpoint API dapat diakses oleh frontend.
3. Optimasi Aplikasi
    - Jalankan perintah berikut untuk optimasi
        ```
        npm run build
        ```


## Tantangan & Solusi
### Tantangan 1: Integrasi dengan Backend
- **Masalah** : Frontend membutuhkan data dalam format JSON yang konsisten dengan struktur yang diharapkan.
- **Solusi** : Memastikan semua response API mengembalikan data dalam format yang sesuai dengan schema frontend.

### Tantangan 2: Modularitas Logika Perhitungan
- **Masalah** : Logika perhitungan awalnya tersebar di beberapa komponen, membuat kode kurang modular.
- **Solusi** : Refactor logika perhitungan ke fungsi terpisah (`calculateTotalRemuneration`) untuk meningkatkan reusability dan maintainability.

### Tantangan 3: Error Handling
- **Masalah** : Kesalahan jaringan atau validasi tidak ditangani dengan baik.
- **Solusi** : Implementasi notifikasi toast untuk memberikan feedback langsung kepada pengguna jika terjadi kesalahan.
