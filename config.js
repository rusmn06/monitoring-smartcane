
// ── BROKER MQTT (HiveMQ Cloud)
const MQTT_HOST      = "xxxx.s1.eu.hivemq.cloud"; // URL broker
const MQTT_PORT      = 8884;                        // Port WebSocket SSL
const MQTT_USER      = "USERNAME_HIVEMQ";           // Username HiveMQ
const MQTT_PASS      = "PASSWORD_HIVEMQ";           // Password HiveMQ
const MQTT_CLIENT_ID = "smartcane-web-" + Math.random().toString(16).substr(2, 6);

// ── TOPIK MQTT (harus sama dengan kode Arduino/ESP32)
const TOPIK_STATUS   = "smartstick/status";
const TOPIK_KONDISI  = "smartstick/kondisi";
const TOPIK_GPS      = "smartstick/gps";
const TOPIK_CARI     = "smartstick/cari";

// ── PENGATURAN PETA (Leaflet / OpenStreetMap)
const PETA_LAT_AWAL  = -3.3194;    // Koordinat awal peta (latitude)
const PETA_LNG_AWAL  = 114.5908;   // Koordinat awal peta (longitude)
const PETA_ZOOM_AWAL = 13;         // Level zoom saat pertama buka
const PETA_ZOOM_GPS  = 16;         // Level zoom saat GPS diterima

// ── PENGATURAN UMUM ──────────────────────────────────────────
const TIMEOUT_CARI_MS    = 15000;  // Batas tunggu respon GPS (ms)
const RECONNECT_DELAY_MS = 5000;   // Jeda reconnect jika putus (ms)
const MAKS_BARIS_LOG     = 100;    // Maksimum baris pada log MQTT
