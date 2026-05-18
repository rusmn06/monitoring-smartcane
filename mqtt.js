
let clientMQTT = null;

// ── INISIALISASI KONEKSI
function hubungkanMQTT() {
  tambahLog('INFO', `Menghubungkan ke ${MQTT_HOST}:${MQTT_PORT}...`);
  updateUIKoneksi('connecting');

  clientMQTT = new Paho.Client(MQTT_HOST, MQTT_PORT, MQTT_CLIENT_ID);

  clientMQTT.onConnectionLost = function (respon) {
    tambahLog('ERROR', `Koneksi terputus: ${respon.errorMessage}. Mencoba ulang dalam ${RECONNECT_DELAY_MS / 1000} detik...`);
    updateUIKoneksi('offline');
    setTimeout(hubungkanMQTT, RECONNECT_DELAY_MS);
  };

  clientMQTT.onMessageArrived = function (pesan) {
    prosesDataMasuk(pesan.destinationName, pesan.payloadString);
  };

  clientMQTT.connect({
    useSSL:   true,
    userName: MQTT_USER,
    password: MQTT_PASS,
    onSuccess: function () {
      tambahLog('SUKSES', 'Berhasil terhubung ke HiveMQ!');
      updateUIKoneksi('connecting'); // Tunggu heartbeat dari ESP32

      clientMQTT.subscribe(TOPIK_STATUS);
      clientMQTT.subscribe(TOPIK_KONDISI);
      clientMQTT.subscribe(TOPIK_GPS);
      tambahLog('INFO', `Subscribe ke: ${TOPIK_STATUS}, ${TOPIK_KONDISI}, ${TOPIK_GPS}`);
    },
    onFailure: function (err) {
      tambahLog('ERROR', `Gagal terhubung: ${err.errorMessage}`);
      updateUIKoneksi('offline');
      setTimeout(hubungkanMQTT, RECONNECT_DELAY_MS);
    }
  });
}

// ── PROSES PESAN MASUK
function prosesDataMasuk(topik, isi) {
  tambahLog('INFO', `[${topik}] → ${isi}`);

  // Status perangkat (online / offline dari ESP32)
  if (topik === TOPIK_STATUS) {
    if (isi === 'online') {
      updateUIKoneksi('online');
      tambahLog('SUKSES', 'Perangkat ESP32 terhubung (online).');
    } else {
      updateUIKoneksi('offline');
      tambahLog('PERINGATAN', 'Perangkat ESP32 terputus (offline).');
    }
    return;
  }

  // Kondisi sensor
  if (topik === TOPIK_KONDISI) {
    try {
      const data = JSON.parse(isi);
      updateUIKondisi(data.kondisi);
    } catch (e) {
      tambahLog('ERROR', 'Gagal parse data kondisi.');
    }
    return;
  }

  // Data GPS
  if (topik === TOPIK_GPS) {
    try {
      const data = JSON.parse(isi);

      if (data.error || data.lat === 0) {
        tambahLog('PERINGATAN', 'GPS belum fix / sinyal lemah.');
        document.getElementById('nilaiLokasi').textContent = 'GPS belum fix';
        document.getElementById('subWaktuLokasi').textContent = 'Sinyal lemah';

        if (sedangCari) selesaiCari(false);
        return;
      }

      latTerakhir = data.lat;
      lngTerakhir = data.lng;

      updateMarkerPeta(data.lat, data.lng);

      document.getElementById('nilaiLokasi').textContent =
        `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`;
      document.getElementById('subWaktuLokasi').textContent =
        'Diperbarui: ' + formatWaktu(new Date());

      tambahLog('SUKSES', `GPS diterima: ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)} (${data.alasan})`);

      if (sedangCari) selesaiCari(true);

    } catch (e) {
      tambahLog('ERROR', 'Gagal parse data GPS.');
    }
    return;
  }
}

// ── KIRIM PERINTAH CARI TONGKAT
function kirimPerintahCari() {
  const pesan = new Paho.Message("minta-lokasi");
  pesan.destinationName = TOPIK_CARI;
  pesan.retained = false;
  clientMQTT.send(pesan);
  tambahLog('INFO', 'Perintah "cari tongkat" dikirim ke ESP32.');
}

// ── CEK KONEKSI SEBELUM KIRIM
function mqttTerhubung() {
  return clientMQTT && clientMQTT.isConnected();
}
