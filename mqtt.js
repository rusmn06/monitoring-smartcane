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
      //clientMQTT.subscribe(TOPIK_SENSOR); // Subscribe data sensor mentah
      tambahLog('INFO', `Subscribe ke: ${TOPIK_STATUS}, ${TOPIK_KONDISI}, ${TOPIK_GPS}, ${TOPIK_SENSOR}`);
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

  // ── Status perangkat
  if (topik === TOPIK_STATUS) {
    tambahLog(isi === 'online' ? 'SUKSES' : 'PERINGATAN',
      isi === 'online' ? 'Perangkat ESP32 terhubung (online).' : 'Perangkat ESP32 terputus (offline).');
    updateUIKoneksi(isi === 'online' ? 'online' : 'offline');
    return;
  }

  // ── Kondisi sensor (state tongkat)
  if (topik === TOPIK_KONDISI) {
    try {
      const data = JSON.parse(isi);
      updateUIKondisi(data.kondisi);
      tambahLog('INFO', `Kondisi: ${data.kondisi}`);
    } catch (e) {
      tambahLog('ERROR', 'Gagal parse data kondisi.');
    }
    return;
  }

  // ── Data sensor mentah (jarak depan, bawah, air)
  // Format: {"depan":175,"bawah":25,"air":0}
  if (topik === TOPIK_SENSOR) {
    try {
      const data = JSON.parse(isi);
      updateUIDataSensor(data.depan, data.bawah, data.air);
      // Tidak tambahLog di sini karena dikirim tiap 500ms — log akan banjir
    } catch (e) {
      tambahLog('ERROR', 'Gagal parse data sensor.');
    }
    return;
  }

  // ── Data GPS
  if (topik === TOPIK_GPS) {
    try {
      const data = JSON.parse(isi);

      if (data.error || data.lat === 0) {
        tambahLog('PERINGATAN', 'GPS belum fix / sinyal lemah.');
        document.getElementById('nilaiLokasi').textContent    = 'GPS belum fix';
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

// ── CEK KONEKSI
function mqttTerhubung() {
  return clientMQTT && clientMQTT.isConnected();
}
