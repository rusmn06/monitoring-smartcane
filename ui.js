let sedangCari = false;

// ── TOMBOL CARI TONGKAT
function cariTongkat() {
  if (!mqttTerhubung()) {
    tambahLog('ERROR', 'Tidak bisa kirim: MQTT belum terhubung.');
    return;
  }
  if (sedangCari) return;

  sedangCari = true;
  const tombol     = document.getElementById('tombolCari');
  const teksTombol = document.getElementById('teksTombolCari');
  const statusCari = document.getElementById('statusCari');

  tombol.disabled        = true;
  teksTombol.textContent = 'Meminta lokasi dari tongkat...';
  statusCari.textContent = 'Menunggu respons GPS dari ESP32...';

  kirimPerintahCari();

  setTimeout(function () {
    if (sedangCari) selesaiCari(false);
  }, TIMEOUT_CARI_MS);
}

function selesaiCari(berhasil) {
  sedangCari = false;
  const tombol     = document.getElementById('tombolCari');
  const teksTombol = document.getElementById('teksTombolCari');
  const statusCari = document.getElementById('statusCari');

  tombol.disabled        = false;
  teksTombol.textContent = 'Cari Tongkat';

  if (berhasil) {
    statusCari.textContent = 'Lokasi berhasil diperbarui!';
    setTimeout(() => {
      statusCari.textContent = 'Tekan tombol untuk meminta lokasi GPS terkini dari tongkat';
    }, 3000);
  } else {
    statusCari.textContent = 'GPS belum fix atau tidak ada respons. Coba lagi.';
  }
}

// ── UPDATE STATUS KONEKSI
function updateUIKoneksi(status) {
  const badgeNav    = document.getElementById('badgeKoneksiNav');
  const titikNav    = badgeNav.querySelector('.titik-status');
  const teksNav     = document.getElementById('teksKoneksiNav');
  const nilaiStatus = document.getElementById('nilaiStatusPerangkat');
  const subStatus   = document.getElementById('subStatusPerangkat');
  const ikonStatus  = document.getElementById('ikonStatusPerangkat');

  badgeNav.className = 'badge-koneksi';
  titikNav.className = 'titik-status';

  const tabel = {
    online: {
      badge: 'online', titik: 'online',
      teksNav: 'Terhubung',
      nilaiTeks: 'Terhubung', nilaiWarna: 'var(--hijau)',
      subTeks: 'Perangkat aktif & berjalan',
      ikonKelas: 'ikon-info-wrap hijau',
      ikonHTML: '<i class="bi bi-wifi"></i>',
    },
    offline: {
      badge: 'offline', titik: 'offline',
      teksNav: 'Tidak Terhubung',
      nilaiTeks: 'Tidak Terhubung', nilaiWarna: 'var(--merah)',
      subTeks: 'Perangkat tidak aktif / mati',
      ikonKelas: 'ikon-info-wrap abu',
      ikonHTML: '<i class="bi bi-wifi-off"></i>',
    },
    connecting: {
      badge: 'connecting', titik: 'connecting',
      teksNav: 'Menghubungkan...',
      nilaiTeks: 'Menghubungkan...', nilaiWarna: 'var(--kuning)',
      subTeks: 'Menyambungkan ke broker MQTT',
      ikonKelas: 'ikon-info-wrap abu',
      ikonHTML: '<i class="bi bi-wifi"></i>',
    },
  };

  const s = tabel[status] || tabel.connecting;
  badgeNav.classList.add(s.badge);
  titikNav.classList.add(s.titik);
  teksNav.textContent       = s.teksNav;
  nilaiStatus.textContent   = s.nilaiTeks;
  nilaiStatus.style.color   = s.nilaiWarna;
  subStatus.textContent     = s.subTeks;
  ikonStatus.className      = s.ikonKelas;
  ikonStatus.innerHTML      = s.ikonHTML;
}

// ── UPDATE BADGE KONDISI SENSOR
function updateUIKondisi(kondisi) {
  const badge = document.getElementById('badgeKondisi');
  const teks  = document.getElementById('teksKondisi');
  const waktu = document.getElementById('waktuKondisi');

  badge.className = 'badge-kondisi';

  const daftarKondisi = {
    'NORMAL':            { label: 'Normal – Jalur Aman',             ikon: 'bi-check-circle-fill',        kelas: 'kondisi-NORMAL' },
    'OBS_NEAR':          { label: 'Waspada – Ada Halangan Depan',    ikon: 'bi-exclamation-triangle-fill', kelas: 'kondisi-OBS_NEAR' },
    'WATER_WARN':        { label: 'Hati-hati – Ada Genangan',        ikon: 'bi-droplet-fill',              kelas: 'kondisi-WATER_WARN' },
    'WATER_DANGER':      { label: 'Bahaya – Genangan Tinggi',        ikon: 'bi-exclamation-octagon-fill',  kelas: 'kondisi-WATER_DANGER' },
    'OBS_CRITICAL_HY':  { label: 'Kritis – Halangan Sangat Dekat!', ikon: 'bi-x-octagon-fill',            kelas: 'kondisi-OBS_CRITICAL' },
    'OBS_CRITICAL_JSN': { label: 'Kritis – Bahaya Lantai/Tangga!',  ikon: 'bi-exclamation-diamond-fill',  kelas: 'kondisi-OBS_CRITICAL' },
  };

  const info = daftarKondisi[kondisi] || { label: kondisi, ikon: 'bi-question', kelas: 'kondisi-UNKNOWN' };
  badge.classList.add(info.kelas);
  teks.innerHTML    = `<i class="bi ${info.ikon} me-1"></i>${info.label}`;
  waktu.textContent = formatWaktu(new Date());
}

// ── UPDATE KARTU DATA SENSOR MENTAH
// Dipanggil setiap data baru dari topik smartstick/sensor masuk
function updateUIDataSensor(depan, bawah, air) {
  // Jarak depan (HY-SR05)
  const elDepan = document.getElementById('nilaiJarakDepan');
  if (elDepan) {
    elDepan.textContent = (depan === -1 || depan === null)
      ? 'Tidak terbaca'
      : depan + ' cm';
  }

  // Jarak bawah (JSN-SR04T)
  const elBawah = document.getElementById('nilaiJarakBawah');
  if (elBawah) {
    elBawah.textContent = (bawah === -1 || bawah === null)
      ? 'Tidak terbaca'
      : bawah + ' cm';
  }

  // Nilai sensor air (ADC 0-4095)
  const elAir = document.getElementById('nilaiAir');
  if (elAir) {
    let labelAir = '';
    if      (air <= 1500) labelAir = `${air}  (Kering)`;
    else if (air <= 2500) labelAir = `${air}  (Genangan ringan)`;
    else                  labelAir = `${air}  (Genangan berbahaya!)`;
    elAir.textContent = labelAir;
  }

  // Waktu update terakhir
  const elWaktu = document.getElementById('waktuDataSensor');
  if (elWaktu) {
    elWaktu.textContent = 'Update: ' + new Date().toLocaleTimeString('id-ID');
  }
}

// ── LOG KOMUNIKASI MQTT
function tambahLog(tipe, pesan) {
  const kotak = document.getElementById('kotakLog');
  const waktu = new Date().toLocaleTimeString('id-ID');

  const kelasMap = {
    'INFO':       'log-tipe-info',
    'SUKSES':     'log-tipe-sukses',
    'PERINGATAN': 'log-tipe-peringatan',
    'ERROR':      'log-tipe-error',
  };

  const baris = document.createElement('div');
  baris.className = 'log-baris';
  baris.innerHTML = `
    <span class="log-waktu">${waktu}</span>
    <span class="${kelasMap[tipe] || 'log-tipe-info'}">[${tipe}]</span>
    <span class="log-pesan">${pesan}</span>`;

  kotak.appendChild(baris);
  kotak.scrollTop = kotak.scrollHeight;

  const semua = kotak.querySelectorAll('.log-baris');
  if (semua.length > MAKS_BARIS_LOG) semua[0].remove();
}

function bersihkanLog() {
  document.getElementById('kotakLog').innerHTML = '';
  tambahLog('INFO', 'Log dibersihkan.');
}

// ── FORMAT WAKTU
function formatWaktu(tgl) {
  return tgl.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false
  }) + ' WIB';
}
