/*
 * ============================================================
 *  SMART STICK TUNANETRA - Sistem IoT Tongkat Cerdas
 * ============================================================
 */

// ---- Library yang dibutuhkan ----
#include <WiFi.h>
#include <PubSubClient.h>   // Library MQTT
#include <TinyGPS++.h>      // Library parsing data GPS
#include <HardwareSerial.h> // Untuk komunikasi GPS lewat Serial

// ============================================================
//  PENGATURAN WIFI & MQTT (Ganti sesuai kebutuhan)
// ============================================================
const char* namaWifi       = "NAMA_WIFI";
const char* passwordWifi   = "PASSWORD_WIFI";

const char* alamatBroker   = "xxxx.s1.eu.hivemq.cloud"; // Ganti dengan broker HiveMQ
const int   portBroker     = 8883;                       // Port SSL HiveMQ Cloud
const char* usernameMQTT   = "USERNAME_HIVEMQ";
const char* passwordMQTT   = "PASSWORD_HIVEMQ";
const char* idPerangkat    = "smart-stick-001";          // ID unik perangkat

// ============================================================
//  TOPIK MQTT
// ============================================================
const char* topikStatus    = "smartstick/status";    // Status koneksi perangkat
const char* topikKondisi   = "smartstick/kondisi";   // Kondisi/state saat ini
const char* topikGPS       = "smartstick/gps";       // Data lokasi GPS
const char* topikCariTongkat = "smartstick/cari";    // Perintah dari website: minta lokasi sekarang

// Kode lanjut dibawah ini.......