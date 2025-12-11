// NOTE: This script assumes the Firebase functions are successfully exposed
// to the window object in your index.html file.

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
let userLocationMarker; // To store the user's current location marker

// Helper: Define the Firebase reference
const stationsRef = window.dbRef(window.db, 'stations'); 

// 2. Initialize Map (Leaflet)
function initMap() {
    // Initial view set to India (Delhi NCR) as a fallback
    map = L.map('map').setView([28.6139, 77.2090], 5); 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // --- GEOLOCATION FEATURE ---
    // 1. Try to get the user's real location
    map.locate({setView: true, maxZoom: 14}); 

    // 2. Handle successful location found
    map.on('locationfound', onLocationFound);

    // 3. Handle location error
    map.on('locationerror', onLocationError);
    // ----------------------------

    // Start listening to the database
    listenForStationUpdates();
}

// Function to handle successful location access
function onLocationFound(e) {
    const latlng = e.latlng;
    const radius = e.accuracy;

    // Remove old marker if it exists
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }
    
    // Add a marker and circle to show user's position and accuracy
    userLocationMarker = L.marker(latlng).addTo(map)
        .bindPopup("You are here!").openPopup();
    L.circle(latlng, radius).addTo(map);
    
    // Optional: Log location for debug
    console.log(`User located at: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
}

// Function to handle location access denied or failure
function onLocationError(e) {
    console.error("Geolocation Error:", e.message);
    alert("Could not detect your location. Showing default map view.");
}


// 3. CORE CHANGE: Real-time Listener 
function listenForStationUpdates() {
    window.dbOnValue(stationsRef, (snapshot) => {
        let stationsData = snapshot.val();
        
        if (!stationsData) {
            // Seed the database if empty
            defaultStations.forEach(station => {
                window.dbSet(window.dbRef(window.db, 'stations/' + station.id), station);
            });
            return;
        }

        const stations = Object.keys(stationsData).map(key => stationsData[key]);
        
        const filterText = document.getElementById('searchInput').value || '';
        const filterStatus = document.getElementById('filterStatus').value || 'all';
        
        renderStations(stations, filterText, filterStatus);
    });
}


// 4. CORE LOGIC: Status Transitions (Now writes to Firebase)
window.handleStatusAction = async (id) => {
    // Fetch data once to confirm current status before update
    const snapshot = await window.dbGet(window.dbRef(window.db, 'stations/' + id));
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
    
    // Update data in Firebase using modular dbUpdate
    window.dbUpdate(window.dbRef(window.db, 'stations/' + id), { status: newStatus })
        .then(() => alert(alertMessage))
        .catch(error => console.error("Firebase Update Error:", error));
    
    // The dbOnValue listener will automatically trigger renderStations.
};


// 5. Render List and Markers 
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

// 6. Search & Filter Listeners (Triggers the listener to re-render)
document.getElementById('searchInput').addEventListener('input', () => {
    listenForStationUpdates(); 
});

document.getElementById('filterStatus').addEventListener('change', () => {
    listenForStationUpdates();
});

// 7. Modal & Form Logic (Using dbSet)
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

    // Use modular dbSet to push data
    window.dbSet(window.dbRef(window.db, 'stations/' + newStationId), newStation)
        .then(() => {
            modal.style.display = 'none';
            e.target.reset();
            alert("Station deployed successfully! Check the map.");
        })
        .catch(error => console.error("Error deploying station:", error));
});

// 8. FINAL ENTRY POINT (The structural fix)
window.startEVManager = function() {
    console.log("Firebase initialized. Starting Map...");
    initMap();
};
// ----------------------------------------------------------------------------------
This video demonstrates how to use Leaflet to get the user's current location and display it on the map.
[Leaflet geolocation | Find current location of user | GeoDev](https://www.youtube.com/watch?v=FaABCCKf97c)


http://googleusercontent.com/youtube_content/4
