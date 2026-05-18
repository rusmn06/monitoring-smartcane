
let petaLeaflet   = null;
let markerTongkat = null;
let latTerakhir   = null;
let lngTerakhir   = null;

// ── INISIALISASI PETA
function inisialisasiPeta() {
  petaLeaflet = L.map('peta', { zoomControl: false })
    .setView([PETA_LAT_AWAL, PETA_LNG_AWAL], PETA_ZOOM_AWAL);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(petaLeaflet);

  // Tombol zoom kanan bawah
  L.control.zoom({ position: 'bottomright' }).addTo(petaLeaflet);

  tambahLog('INFO', 'Peta berhasil dimuat.');
}

// ── UPDATE MARKER LOKASI TONGKAT
function updateMarkerPeta(lat, lng) {
  const ikonCustom = L.divIcon({
    className: '',
    html: `
      <div style="
        position:relative; width:40px; height:50px;
        display:flex; align-items:center; justify-content:center;">
        <div style="
          position:absolute; bottom:0;
          width:36px; height:36px;
          background:#2563EB; border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid #fff;
          box-shadow:0 3px 14px rgba(37,99,235,0.5);">
        </div>
        <div style="
          position:relative; z-index:1;
          font-size:14px; color:#fff; margin-bottom:6px;">
          <i class="bi bi-broadcast"></i>
        </div>
        <div style="
          position:absolute; bottom:-4px; left:50%;
          transform:translateX(-50%);
          width:14px; height:14px;
          background:rgba(37,99,235,0.2);
          border-radius:50%;
          animation:denyut 1.5s infinite;">
        </div>
      </div>`,
    iconSize:   [40, 50],
    iconAnchor: [20, 50],
  });

  if (markerTongkat) {
    markerTongkat.setLatLng([lat, lng]);
  } else {
    markerTongkat = L.marker([lat, lng], { icon: ikonCustom })
      .addTo(petaLeaflet)
      .bindPopup('<b>📍 Lokasi Tongkat</b><br>Data GPS terbaru');
  }

  petaLeaflet.setView([lat, lng], PETA_ZOOM_GPS, { animate: true });
}
