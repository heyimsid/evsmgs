// 1. UPDATED DATA: Indian Locations with Coordinates (Lat, Lng)
const defaultStations = [
    { id: 1, name: "PowerGrid Station 1", location: "Bandra Kurla Complex, Mumbai", power: 200, type: "CCS2", status: "Available", lat: 19.0667, lng: 72.8683 },
    { id: 2, name: "TATA Power Station", location: "Electronic City, Bangalore", power: 150, type: "CCS2", status: "Charging", lat: 12.8465, lng: 77.6749 },
    { id: 3, name: "Reliance BP Mobility", location: "DLF Cyber Hub, Gurgaon", power: 50, type: "Type 2", status: "Reserved", lat: 28.4905, lng: 77.0877 },
    { id: 4, name: "Ather Grid Fast Charger", location: "Koregaon Park, Pune", power: 80, type: "CCS2", status: "Available", lat: 18.5307, lng: 73.8966 },
    { id: 5, name: "GoEgo Station", location: "Airport Road, Chennai", power: 100, type: "CCS2", status: "Available", lat: 13.0827, lng: 80.2707 }
];

let stations = JSON.parse(localStorage.getItem('evStations')) || defaultStations;
let map;
let markers = [];

// Helper: Save to LocalStorage
function saveData() {
    localStorage.setItem('evStations', JSON.stringify(stations));
}

// 2. Initialize Map (Leaflet) - Centered on Mumbai
function initMap() {
    // Center map on Mumbai (19.0760, 72.8777)
    map = L.map('map').setView([19.0760, 72.8777], 10); 

    // Add Dark Mode Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    renderStations();
}

// 3. CORE LOGIC: Handle Professional Status Transitions
window.handleStatusAction = (id) => {
    const station = stations.find(s => s.id === id);
    if (!station) return;

    let newStatus, alertMessage;

    if (station.status === 'Available') {
        newStatus = 'Reserved';
        alertMessage = `⚡ Slot at ${station.name} is reserved for 15 mins.`;
    } else if (station.status === 'Reserved') {
        newStatus = 'Charging';
        alertMessage = `🔋 Charging session started at ${station.name}.`;
    } else if (station.status === 'Charging') {
        newStatus = 'Available';
        alertMessage = `✅ Session ended. Slot at ${station.name} is now available.`;
    }
    
    // Update and re-render
    station.status = newStatus;
    saveData();
    alert(alertMessage);
    
    // Re-render dashboard instantly to show changes
    const filterText = document.getElementById('searchInput').value;
    const filterStatus = document.getElementById('filterStatus').value;
    renderStations(filterText, filterStatus);
};


// 4. Render List and Markers
function renderStations(filterText = '', filterStatus = 'all') {
    const listContainer = document.getElementById('stationList');
    listContainer.innerHTML = '';
    
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

            // Dynamic Button & Status Styling
            let btnText, btnClass, statusClass;

            if (station.status === 'Available') {
                btnText = '<i class="fas fa-plug"></i> Reserve Slot';
                btnClass = 'btn-available';
                statusClass = 'status-available';
            } else if (station.status === 'Reserved') {
                btnText = '<i class="fas fa-car"></i> Start Session';
                btnClass = 'btn-occupied status-reserved'; // Use occupied style for Reserved
                statusClass = 'status-reserved';
            } else { // Charging
                btnText = '<i class="fas fa-hand-pointer"></i> End Session';
                btnClass = 'btn-occupied';
                statusClass = 'status-charging';
            }


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
                <button class="btn-action ${btnClass}" onclick="handleStatusAction(${station.id})">
                    ${btnText}
                </button>
            `;
            
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-action')) {
                    map.flyTo([station.lat, station.lng], 15, { animate: true, duration: 1.5 });
                }
            });

            listContainer.appendChild(card);

            // B. Add to Map Marker
            let markerColor;
            if (station.status === 'Available') markerColor = '#00ff9d';
            else if (station.status === 'Reserved') markerColor = '#ffc107'; // Yellow/Amber for Reserved
            else markerColor = '#ff4757';
            
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

// 5. Search & Filter Listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    renderStations(e.target.value, document.getElementById('filterStatus').value);
});

document.getElementById('filterStatus').addEventListener('change', (e) => {
    renderStations(document.getElementById('searchInput').value, e.target.value);
});

// 6. Modal & Form Logic
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
