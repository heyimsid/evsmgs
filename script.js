// 1. DATA: Stations with Coordinates (Lat, Lng)
// (These are sample coords around New York City for the demo)
const defaultStations = [
    { id: 1, name: "Tesla Supercharger", location: "Downtown Plaza", power: 250, type: "CCS2", status: "Available", lat: 40.7128, lng: -74.0060 },
    { id: 2, name: "Ionity Fast Charge", location: "Grand Highway", power: 350, type: "CCS2", status: "Charging", lat: 40.7306, lng: -73.9352 },
    { id: 3, name: "Shell Recharge", location: "Tech Park", power: 50, type: "Type 2", status: "Available", lat: 40.7580, lng: -73.9855 },
    { id: 4, name: "Green Energy Hub", location: "Westside Market", power: 150, type: "CCS2", status: "Available", lat: 40.7850, lng: -73.9683 },
    { id: 5, name: "VoltSpot", location: "Brooklyn Bridge", power: 120, type: "CCS2", status: "Available", lat: 40.7061, lng: -73.9969 }
];

// Load from LocalStorage or use Default
let stations = JSON.parse(localStorage.getItem('evStations')) || defaultStations;
let map;
let markers = [];

// 2. Initialize Map (Leaflet)
function initMap() {
    // Create map instance centered on New York
    map = L.map('map').setView([40.7306, -73.98], 11);

    // Add Dark Mode Map Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    renderStations();
}

// 3. Render List and Markers
function renderStations(filterText = '', filterStatus = 'all') {
    const listContainer = document.getElementById('stationList');
    listContainer.innerHTML = ''; // Clear list
    
    // Clear Map Markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    let availableCount = 0;

    stations.forEach(station => {
        // Filter Logic
        const matchesSearch = station.location.toLowerCase().includes(filterText.toLowerCase()) || 
                              station.name.toLowerCase().includes(filterText.toLowerCase());
        const matchesStatus = filterStatus === 'all' || station.status === filterStatus;

        if (matchesSearch && matchesStatus) {
            
            // Stats
            if(station.status === 'Available') availableCount++;

            // A. Add to List
            const card = document.createElement('div');
            card.className = 'station-card';
            const statusClass = station.status === 'Available' ? 'status-available' : 'status-charging';
            
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
            `;
            
            // Add Click Event to Zoom Map
            card.addEventListener('click', () => {
                map.flyTo([station.lat, station.lng], 15, { animate: true, duration: 1.5 });
            });

            listContainer.appendChild(card);

            // B. Add to Map
            // Custom Colored Markers based on Status
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

// 4. Search & Filter Listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    renderStations(e.target.value, document.getElementById('filterStatus').value);
});

document.getElementById('filterStatus').addEventListener('change', (e) => {
    renderStations(document.getElementById('searchInput').value, e.target.value);
});

// 5. Modal & Form Logic
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
    localStorage.setItem('evStations', JSON.stringify(stations));
    
    renderStations();
    modal.style.display = 'none';
    e.target.reset();
});

// Start App
initMap();
