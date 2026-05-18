# SmartCane – Struktur Proyek

```
smartcane/
├── index.html          ← Halaman utama (struktur HTML saja)
├── css/
│   └── style.css       ← Semua styling & tema warna
└── js/
    ├── config.js       ← KONFIGURASI (ganti di sini jika ganti platform)
    ├── ui.js           ← Logika tampilan & interaksi pengguna
    ├── map.js          ← Logika peta Leaflet / OpenStreetMap
    └── mqtt.js         ← Logika koneksi & komunikasi MQTT
```

---

## Panduan Perubahan Umum

### Ganti broker MQTT / pindah dari HiveMQ
Edit **`js/config.js`**:
```js
const MQTT_HOST = "broker-baru.example.com";
const MQTT_PORT = 8884;
const MQTT_USER = "username_baru";
const MQTT_PASS = "password_baru";
```

### Ganti nama topik MQTT (harus sinkron dengan ESP32)
Edit **`js/config.js`**:
```js
const TOPIK_STATUS  = "nama/topik/status";
const TOPIK_KONDISI = "nama/topik/kondisi";
const TOPIK_GPS     = "nama/topik/gps";
const TOPIK_CARI    = "nama/topik/cari";
```

### Ganti titik awal peta
Edit **`js/config.js`**:
```js
const PETA_LAT_AWAL = -6.2088;   // Jakarta
const PETA_LNG_AWAL = 106.8456;
```

### Ganti warna / tema
Edit **`css/style.css`** bagian `:root { ... }`.

### Ubah timeout & pengaturan umum
Edit **`js/config.js`**:
```js
const TIMEOUT_CARI_MS    = 15000; // Batas tunggu GPS (ms)
const RECONNECT_DELAY_MS = 5000;  // Jeda reconnect (ms)
const MAKS_BARIS_LOG     = 100;   // Maks baris log MQTT
```

---

## Urutan Pemuatan Script

Script di `index.html` dimuat dalam urutan ini (penting!):

1. Library eksternal (Leaflet, Paho MQTT, Bootstrap)
2. `config.js` — konstanta & konfigurasi
3. `ui.js` — fungsi UI (bergantung pada config)
4. `map.js` — fungsi peta (bergantung pada config & ui)
5. `mqtt.js` — koneksi MQTT (bergantung pada semua di atas)
