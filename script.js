// 1. DATA: Stations with Coordinates (Lat, Lng)
const defaultStations = [
    { id: 1, name: "Tesla Supercharger", location: "Downtown Plaza", power: 250, type: "CCS2", status: "Available", lat: 40.7128, lng: -74.0060 },
    { id: 2, name: "Ionity Fast Charge", location: "Grand Highway", power: 350, type: "CCS2", status: "Charging", lat: 40.7306, lng: -73.9352 },
    { id: 3, name: "Shell Recharge", location: "Tech Park", power: 50, type: "Type 2", status: "Available", lat: 40.7580, lng: -73.9855 },
    { id: 4, name: "Green Energy Hub", location: "Westside Market", power: 150, type: "CCS2", status: "Available", lat: 40.7850, lng: -73.9683 },
    { id: 5, name: "VoltSpot", location: "Brooklyn Bridge", power: 120, type: "CCS2", status: "Available", lat: 40.7061, lng: -73.9969 }
];

let stations = JSON.parse(localStorage.getItem('evStations')) || defaultStations;
let map;
let markers = [];

// Helper: Save to LocalStorage
function saveData() {
    localStorage.setItem('evStations', JSON.stringify(stations));
}

// 2. Initialize Map (Leaflet)
function initMap() {
    map = L.map('map').setView([40.7306, -73.98], 11);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    renderStations();
}

// 3. CORE LOGIC: Toggle Station Status (Booking Simulation)
window.toggleStatus = (id) => {
    const station = stations.find(s => s.id === id);
    if (station) {
        if (station.status === 'Available') {
            station.status = 'Charging';
            alert(`✅ Station ${station.name} is now reserved/in-use!`);
        } else {
            station.status = 'Available';
            alert(`🔌 Station ${station.name} is now free!`);
        }
        saveData();
        // Re-render everything to update the dashboard instantly
        const filterText = document.getElementById('searchInput').value;
        const filterStatus = document.getElementById('filterStatus').value;
        renderStations(filterText, filterStatus);
    }
};

// 4. Render List and Markers
function renderStations(filterText = '', filterStatus = 'all') {
    const listContainer = document.getElementById('stationList');
    listContainer.innerHTML = '';
    
    // Clear Map Markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    let availableCount = 0;

    stations.forEach(station => {
        // Filtering Logic
        const matchesSearch = station.location.toLowerCase().includes(filterText.toLowerCase()) || 
                              station.name.toLowerCase().includes(filterText.toLowerCase());
        const matchesStatus = filterStatus === 'all' || station.status === filterStatus;

        if (matchesSearch && matchesStatus) {
            
            if(station.status === 'Available') availableCount++;

            // Dynamic Button Text and Class
            const btnText = station.status === 'Available' ? 'BOOK / Start Charging' : 'Stop / Free Slot';
            const btnClass = station.status === 'Available' ? 'btn-available' : 'btn-occupied';
            const statusClass = station.status === 'Available' ? 'status-available' : 'status-charging';

            // A. Add to List
            const card = document.createElement('div');
            card.className = 'station-card';
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="station-title">
                        <h3>${station.name}</h3>
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${station.location}</span>
                    </div>
                    <span class="status-badge ${statusClass}">${station.status}</span>
                </div>
                <div class="specs">
                    <span><i class="fas fa-bolt"></i> ${station.power} kW</span>
                    <span>• ${station.type}</span>
                </div>
                <button class="btn-action ${btnClass}" onclick="toggleStatus(${station.id})">
                    ${btnText}
                </button>
            `;
            
            card.addEventListener('click', (e) => {
                // Only zoom if the button wasn't clicked
                if (!e.target.classList.contains('btn-action')) {
                    map.flyTo([station.lat, station.lng], 15, { animate: true, duration: 1.5 });
                }
            });

            listContainer.appendChild(card);

            // B. Add to Map
            const markerColor = station.status === 'Available' ? '#00ff9d' : '#ff4757';
            
            const customIcon = L.divIcon({
                className: 'custom-pin',
                html: `<div style="background-color: ${markerColor}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${markerColor};"></div>`
            });

            const marker = L.marker([station.lat, station.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`<b>${station.name}</b><br>Status: ${station.status}`);
            
            markers.push(marker);
        }
    });

    // Update Dashboard Stats
    document.getElementById('totalStations').innerText = stations.length;
    document.getElementById('totalAvailable').innerText = availableCount;
}

// 5. Search & Filter Listeners (unchanged)
document.getElementById('searchInput').addEventListener('input', (e) => {
    renderStations(e.target.value, document.getElementById('filterStatus').value);
});

document.getElementById('filterStatus').addEventListener('change', (e) => {
    renderStations(document.getElementById('searchInput').value, e.target.value);
});

// 6. Modal & Form Logic (unchanged)
const modal = document.getElementById('stationModal');
document.getElementById('addStationBtn').onclick = () => modal.style.display = 'flex';
document.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

document.getElementById('stationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newStation = {
        id: Date.now(),
        name: document.getElementById('nameInput').value,
        location: document.getElementById('locationInput').value,
        lat: parseFloat(document.getElementById('latInput').value),
        lng: parseFloat(document.getElementById('lngInput').value),
        power: document.getElementById('powerInput').value,
        type: document.getElementById('typeInput').value,
        status: "Available"
    };

    stations.push(newStation);
    saveData();
    
    renderStations();
    modal.style.display = 'none';
    e.target.reset();
});

// Start App
initMap();
