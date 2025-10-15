
# Sepatu Wash API (Node.js + Express + Supabase) — Deploy ke Vercel

REST API sederhana untuk layanan daftar barang cuci sepatu. Mendukung operasi **CRUD** dan filter berdasarkan **status** (`GET /items?status=Selesai`). Dibangun dengan **Node.js + Express.js**, menyimpan data di **Supabase**, dan siap **deploy** ke **Vercel**.

> Referensi inspirasi: [responsi-ppb](https://github.com/princeofverry/responsi-ppb)

---

## Tujuan & Fitur Utama

- CRUD data item cucian sepatu
- Filter berdasarkan status: `Menunggu | Proses | Selesai | Diambil`
- Tersambung ke Supabase sebagai database
- Dapat dijalankan lokal dan di-deploy ke Vercel (serverless)
- Validasi payload menggunakan Zod
- Logging request (morgan) & CORS enabled

---

## Struktur Data

Tabel: `public.wash_items`

| Kolom          | Tipe         | Keterangan                                  |
|----------------|--------------|---------------------------------------------|
| id             | uuid (PK)    | default `gen_random_uuid()`                 |
| customer_name  | text         | wajib                                       |
| brand          | text         | opsional                                    |
| size           | text         | opsional                                    |
| service_type   | text         | opsional (deep clean, repaint, dsb.)        |
| status         | status_enum  | `Menunggu | Proses | Selesai | Diambil`     |
| drop_off_date  | date         | default `current_date`                      |
| pick_up_date   | date         | opsional                                    |
| notes          | text         | opsional                                    |
| created_at     | timestamptz  | default `now()`                             |
| updated_at     | timestamptz  | default `now()` + trigger update            |

SQL skema tersedia di [`supabase.sql`](./supabase.sql).

---

## Endpoint

Base URL lokal: `http://localhost:3000`  
Base URL produksi (Vercel): `https://<YOUR-VERCEL-URL>`

- `GET /` — health check
- `GET /docs` — ringkasan endpoint
- `GET /items?status=Menunggu|Proses|Selesai|Diambil` — daftar item (opsional filter status)
- `GET /items/:id` — detail item
- `POST /items` — buat item
- `PATCH /items/:id` — perbarui sebagian item
- `DELETE /items/:id` — hapus item

### Contoh Request/Response

#### Create
`POST /items`
```json
{
  "customer_name": "Andi",
  "brand": "Nike",
  "size": "42",
  "service_type": "Deep Clean",
  "status": "Menunggu",
  "drop_off_date": "2025-10-15",
  "notes": "Ada noda cat di sisi kiri"
}
```
**Response 201**
```json
{
  "data": {
    "id": "6b1f...",
    "customer_name": "Andi",
    "brand": "Nike",
    "size": "42",
    "service_type": "Deep Clean",
    "status": "Menunggu",
    "drop_off_date": "2025-10-15",
    "pick_up_date": null,
    "notes": "Ada noda cat di sisi kiri",
    "created_at": "2025-10-15T13:00:00.000Z",
    "updated_at": "2025-10-15T13:00:00.000Z"
  }
}
```

#### List (Filter Status)
`GET /items?status=Selesai`  
**Response 200**
```json
{ "data": [ /* array of items */ ] }
```

#### Detail
`GET /items/:id`  
**Response 200**
```json
{ "data": { /* satu item */ } }
```

#### Update
`PATCH /items/:id`
```json
{ "status": "Selesai", "pick_up_date": "2025-10-20" }
```
**Response 200**
```json
{ "data": { /* item setelah update */ } }
```

#### Delete
`DELETE /items/:id`  
**Response 204** — tanpa body

---

## Instalasi & Menjalankan Lokal

1. **Clone repo** ini (atau salin file proyek).  
2. Buat proyek **Supabase**, lalu jalankan SQL di [`supabase.sql`](./supabase.sql) pada SQL Editor.
3. Buat file `.env` dari contoh `.env.example` dan isi dengan kredensial:
   - `SUPABASE_URL` — URL Supabase
   - `SUPABASE_SERVICE_ROLE` — *Service Role key* (server-side saja)
   - `PORT` — opsional
4. Install dependencies dan jalankan:
   ```bash
   npm install
   npm run dev
   ```
5. Cek: `GET http://localhost:3000/`

> **Keamanan**: `SUPABASE_SERVICE_ROLE` hanya untuk server. Saat deploy di Vercel, simpan di **Project Settings → Environment Variables** (tidak di-commit).

---

## Deploy ke Vercel

1. Push kode ke **GitHub**.
2. Di **Vercel**, **New Project** → import repo GitHub Anda.
3. Tambahkan Environment Variables di Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE`
4. Deploy. Vercel akan menggunakan `vercel.json` dan handler Express dari `index.js`.

Jika sukses, Anda akan mendapatkan URL seperti:  
`https://sepatu-wash-api-yourname.vercel.app/`

Masukkan link itu ke bagian **Link Deploy** di bawah.

---

## Link Deploy (Vercel)

- Production: `https://<ISI-SETELAH-DEPLOY>.vercel.app`

---

## Struktur Proyek

```
.
├── index.js
├── supabaseClient.js
├── package.json
├── vercel.json
├── .env.example
├── supabase.sql
└── README.md
```

---

## Catatan RLS (opsional)

Jika Anda mengaktifkan **Row Level Security** di Supabase dan ingin mengakses tabel dengan **anon key** dari klien publik, Anda perlu menulis **policies** yang aman. Dalam proyek ini, API server menggunakan **service role**, sehingga tidak memerlukan policies khusus selain read-only untuk anon (jika diinginkan).

---

## Lisensi

MIT
