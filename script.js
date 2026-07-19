// ===============================
// LEAFLET MAP
// ===============================

const map = L.map('map').setView([-6.9175, 107.6191], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

let markers = [];

// ===============================
// LOAD STATISTIK
// ===============================

async function loadStatistik() {

    try {

        const response = await fetch("/api/statistik");
        const data = await response.json();

        document.getElementById("totalWisata").textContent = data.total;
        document.getElementById("totalKategori").textContent = data.kategori;
        document.getElementById("rating").textContent = data.rating;

    } catch (err) {

        console.log(err);

    }

}

// ===============================
// HAPUS MARKER
// ===============================

function clearMarker() {

    markers.forEach(marker => {

        map.removeLayer(marker);

    });

    markers = [];

}

// ===============================
// LOAD DATA WISATA
// ===============================

async function loadWisata() {

    clearMarker();

    const search = document.getElementById("search").value;
    const category = document.getElementById("category").value;

    try {

        const response = await fetch(
            `/api/wisata?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`
        );

        const data = await response.json();

        const container = document.getElementById("wisataContainer");

        container.innerHTML = "";

        data.forEach(item => {

            // Marker
            const marker = L.marker([item.lat, item.lng]).addTo(map);

            marker.bindPopup(`
                <b>${item.name}</b><br>
                <hr>
                Kategori : ${item.category}<br>
                Rating : ⭐ ${item.rating}<br>
                Harga : Rp ${item.price}<br>
                Estimasi : ${item.time} menit
            `);

            markers.push(marker);

            // Card
            container.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-4">

                <div class="card h-100 shadow">

                    <div class="card-body">

                        <h5>${item.name}</h5>

                        <span class="badge bg-success mb-2">
                            ${item.category}
                        </span>

                        <p style="height:90px;overflow:hidden;">
                            ${item.description}
                        </p>

                        <p>⭐ ${item.rating}</p>

                        <p>💰 Rp ${item.price}</p>

                        <button
                            class="btn btn-success w-100"
                            onclick="lihatLokasi(${item.lat},${item.lng})">

                            Lihat Lokasi

                        </button>

                    </div>

                </div>

            </div>
            `;

        });

    } catch (err) {

        console.log(err);

    }

}

// ===============================
// PINDAH MAP
// ===============================

function lihatLokasi(lat, lng) {

    map.setView([lat, lng], 16);

}

// ===============================
// SEARCH
// ===============================

document.getElementById("search").addEventListener("keyup", function () {

    loadWisata();

});

// ===============================
// FILTER
// ===============================

document.getElementById("category").addEventListener("change", function () {

    loadWisata();

});

// ===============================
// LOAD
// ===============================

loadStatistik();
loadWisata();