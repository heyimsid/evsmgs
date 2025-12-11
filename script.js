// NOTE: This script relies on the global 'database' object initialized in index.html (V8 SDK).

// Initial data for seeding the database if it's empty
const defaultStations = [
    { id: 101, name: "Tata Power EZ Charge", location: "Bandra Kurla Complex, Mumbai", power: 100, type: "CCS2", status: "Available", lat: 19.0573, lng: 72.8647 },
    { id: 102, name: "Statiq Hub", location: "Phoenix Marketcity, Kurla", power: 60, type: "CCS2", status: "Charging", lat: 19.0888, lng: 72.9069 },
    { id: 201, name: "Fortum Charge & Drive", location: "Select Citywalk, Saket, Delhi", power: 50, type: "CCS2", status: "Available", lat: 28.5273, lng: 77.2155 },
    { id: 301, name: "Ather Grid (Fast)", location: "Koramangala, Bangalore", power: 25, type: "Type 2", status: "Available", lat: 12.9345, lng: 77.6186 },
    { id: 302, name: "Magenta ChargeGrid", location: "Electronic City Phase 1, Bangalore", power: 150, type: "CCS2", status: "Available", lat: 12.8465, lng: 77.6749 },
];

let map;
let markers = [];
let userLocationMarker;
let userCoords = null; // Stores user's detected coordinates

// Helper: Define the Firebase reference (V8 Syntax)
const stationsRef = database.ref('stations'); 

// --- DISTANCE CALCULATION (Haversine Formula) ---
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// 2. Initialize Map (Leaflet)
function initMap() {
    map = L.map('map').setView([28.6139, 77.2090], 5); 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // --- GEOLOCATION FEATURE ---
    map.locate({setView: true, maxZoom: 14}); 
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    // ----------------------------

    listenForStationUpdates();
}

// Store user location and trigger resort
function onLocationFound(e) {
    const latlng = e.latlng;
    const radius = e.accuracy;

    userCoords = { lat: latlng.lat, lng: latlng.lng };

    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    
    userLocationMarker = L.marker(latlng).addTo(map)
        .bindPopup("You are here!").openPopup();
    L.circle(latlng, radius).addTo(map);
    
    // Trigger a full update to sort by distance
    listenForStationUpdates(); 
}

function onLocationError(e) {
    console.error("Geolocation Error:", e.message);
}


// 3. CORE: Real-time Listener (V8 Syntax)
function listenForStationUpdates() {
    stationsRef.on('value', (snapshot) => {
        let stationsData = snapshot.val();
        
        if (!stationsData) {
            // Seed the database using V8 syntax
            defaultStations.forEach(station => {
                database.ref('stations/' + station.id).set(station);
            });
            return;
        }

        let stations = Object.keys(stationsData).map(key => stationsData[key]);
        
        // --- PROXIMITY SORTING ---
        if (userCoords) {
            stations.forEach(station => {
                station.distance = getDistance(
                    userCoords.lat, userCoords.lng,
                    station.lat, station.lng
                );
            });
            stations.sort((a, b) => a.distance - b.distance);
        }
        // ---------------------------

        const filterText = document.getElementById('searchInput').value || '';
        const filterStatus = document.getElementById('filterStatus').value || 'all';
        
        renderStations(stations, filterText, filterStatus);
    });
}


// 4. Status Transitions (V8 Syntax)
window.handleStatusAction = (id) => {
    database.ref('stations/' + id).once('value').then((snapshot) => {
        const station = snapshot.val();
        if (!station) return;

        let newStatus, alertMessage;

        if (station.status === 'Available') {
            newStatus = 'Reserved';
            alertMessage = `⚡ Slot at ${station.name} is reserved! (Updating for all users)`;
        } else if (station.status === 'Reserved') {
            newStatus = 'Charging';
            alertMessage = `🔋 Charging session started!`;
        } else if (station.status === 'Charging') {
            newStatus = 'Available';
            alertMessage = `✅ Session ended. Slot is now available for others.`;
        }
        
        // Update data in Firebase using standard V8 .update()
        database.ref('stations/' + id).update({ status: newStatus })
            .then(() => alert(alertMessage))
            .catch(error => console.error("Firebase Update Error:", error));
    });
};


// 5. Render List and Markers (Handles filtering and display)
function renderStations(stations, filterText, filterStatus) {
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

            // Display distance if available
            const distanceText = station.distance ? 
                `<span class="distance-text"><i class="fas fa-route"></i> ${station.distance.toFixed(1)} km</span>` : 
                '';

            const card = document.createElement('div');
            card.className = 'station-card';
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="station-title">
                        <h3>${station.name}</h3>
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${station.location} ${distanceText}</span>
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

    document.getElementById('totalStations').innerText = stations.length;
    document.getElementById('totalAvailable').innerText = availableCount;
}

// 6. Event Listeners
document.getElementById('searchInput').addEventListener('input', () => {
    listenForStationUpdates(); 
});

document.getElementById('filterStatus').addEventListener('change', () => {
    listenForStationUpdates();
});

const modal = document.getElementById('stationModal');
document.getElementById('addStationBtn').onclick = () => modal.style.display = 'flex';
document.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

document.getElementById('stationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newStationId = Date.now().toString(); 

    const newStation = {
        id: newStationId,
        name: document.getElementById('nameInput').value,
        location: document.getElementById('locationInput').value,
        lat: parseFloat(document.getElementById('latInput').value),
        lng: parseFloat(document.getElementById('lngInput').value),
        power: document.getElementById('powerInput').value,
        type: document.getElementById('typeInput').value,
        status: "Available"
    };

    // Use V8 .set() to push data
    database.ref('stations/' + newStationId).set(newStation)
        .then(() => {
            modal.style.display = 'none';
            e.target.reset();
            alert("Station deployed successfully! Check the map.");
        })
        .catch(error => console.error("Error deploying station:", error));
});

// 7. FINAL ENTRY POINT
initMap();
