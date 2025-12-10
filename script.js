// 1. UPDATED DATA: Real-world Indian Locations with Approximate Coordinates
// Data includes stations from major networks like Tata Power and Statiq.
const defaultStations = [
    // --- Mumbai / Maharashtra ---
    { id: 101, name: "Tata Power EZ Charge", location: "BKC, Mumbai (Reliance Jio)", power: 100, type: "CCS2", status: "Available", lat: 19.0573, lng: 72.8647 },
    { id: 102, name: "Statiq Hub", location: "Phoenix Marketcity, Kurla", power: 60, type: "CCS2", status: "Charging", lat: 19.0888, lng: 72.9069 },
    { id: 103, name: "ChargeZone DC Fast", location: "Lonavala Food Mall (Highway)", power: 120, type: "CCS2", status: "Reserved", lat: 18.7758, lng: 73.4093 },
    
    // --- Delhi NCR ---
    { id: 201, name: "Fortum Charge & Drive", location: "Select Citywalk, Saket", power: 50, type: "CCS2", status: "Available", lat: 28.5273, lng: 77.2155 },
    { id: 202, name: "GLIDA EV Station", location: "DLF Cyber Hub, Gurgaon", power: 30, type: "Type 2", status: "Available", lat: 28.4905, lng: 77.0877 },
    { id: 203, name: "Tata Power Charging", location: "Noida Sector 62", power: 25, type: "Type 2", status: "Charging", lat: 28.6256, lng: 77.3752 },
    
    // --- Bangalore / Karnataka ---
    { id: 301, name: "Ather Grid (Fast)", location: "Koramangala, Bangalore", power: 25, type: "Type 2", status: "Available", lat: 12.9345, lng: 77.6186 },
    { id: 302, name: "Magenta ChargeGrid", location: "Electronic City Phase 1", power: 150, type: "CCS2", status: "Available", lat: 12.8465, lng: 77.6749 },
    { id: 303, name: "Statiq DC Hub", location: "Whitefield Road, Bangalore", power: 60, type: "CCS2", status: "Reserved", lat: 12.9698, lng: 77.7499 }
];

let stations = JSON.parse(localStorage.getItem('evStations')) || defaultStations;
let map;
let markers = [];

// Helper: Save to LocalStorage
function saveData() {
    localStorage.setItem('evStations', JSON.stringify(stations));
}

// 2. Initialize Map (Leaflet) - Centered on Delhi (NCR)
function initMap() {
    // Centered near Delhi for a good view of the northern stations
    map = L.map('map').setView([28.6139, 77.2090], 10); 

    // Add Dark Mode Map Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    renderStations();
}

// 3. CORE LOGIC: Handle Professional Status Transitions (Unchanged from previous response)
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
                btnClass = 'btn-occupied status-reserved';
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
                // Fly to map marker on click
                if (!e.target.classList.contains('btn-action')) {
                    map.flyTo([station.lat, station.lng], 15, { animate: true, duration: 1.5 });
                }
            });

            listContainer.appendChild(card);

            // B. Add to Map Marker
            let markerColor;
            if (station.status === 'Available') markerColor = '#00ff9d';
            else if (station.status === 'Reserved') markerColor = '#ffc107';
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
    
    // NOTE: You must use real coordinates (lat/lng) when adding a new station!
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
