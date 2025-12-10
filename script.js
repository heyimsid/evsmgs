// 1. Station Data (Simulated Database)
const stationsData = [
    {
        id: 1,
        name: "Central Plaza Hub",
        location: "Downtown",
        type: "DC Fast Charge",
        speed: "150kW",
        price: "$0.45/kWh",
        status: "Available", // or 'Busy'
        image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "GreenWay Mall",
        location: "Westside",
        type: "Type 2 AC",
        speed: "22kW",
        price: "$0.25/kWh",
        status: "Available",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Tech Park Station",
        location: "North Gate",
        type: "Tesla Supercharger",
        speed: "250kW",
        price: "$0.50/kWh",
        status: "Busy",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "EcoStop Highway",
        location: "Exit 42",
        type: "CCS2 Rapid",
        speed: "50kW",
        price: "$0.30/kWh",
        status: "Available",
        image: "https://images.unsplash.com/photo-1647427060118-4911c9821b82?auto=format&fit=crop&w=600&q=80"
    }
];

// 2. Select DOM Elements
const grid = document.getElementById('stationGrid');
const searchInput = document.getElementById('searchInput');
const totalCount = document.getElementById('totalCount');
const availableCount = document.getElementById('availableCount');
const modal = document.getElementById('bookingModal');
const closeBtn = document.querySelector('.close-btn');
const bookingForm = document.getElementById('bookingForm');

let currentStationId = null;

// 3. Render Stations Function
function renderStations(data) {
    grid.innerHTML = ""; // Clear existing
    let available = 0;

    data.forEach(station => {
        if (station.status === 'Available') available++;

        const card = document.createElement('div');
        card.className = 'station-card';
        
        // Dynamic Badge Class (Green/Red)
        const badgeClass = station.status === 'Available' ? 'available' : 'busy';
        const btnState = station.status === 'Busy' ? 'disabled' : '';
        const btnText = station.status === 'Busy' ? 'Occupied' : 'Charge Now';

        card.innerHTML = `
            <div class="card-header">
                <span class="badge ${badgeClass}">${station.status}</span>
                <i class="fas fa-bolt" style="color: ${station.status === 'Available' ? '#00ff9d' : '#ff4757'}"></i>
            </div>
            <img src="${station.image}" alt="${station.name}" class="station-img">
            <div class="station-info">
                <h3>${station.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${station.location}</p>
                <div class="specs">
                    <span><i class="fas fa-plug"></i> ${station.type}</span>
                    <span><i class="fas fa-tachometer-alt"></i> ${station.speed}</span>
                </div>
                <button class="btn-action" ${btnState} onclick="openModal(${station.id})">
                    ${btnText}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Update Stats
    totalCount.textContent = data.length;
    availableCount.textContent = available;
}

// 4. Search Filter
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = stationsData.filter(station => 
        station.location.toLowerCase().includes(term) || 
        station.name.toLowerCase().includes(term)
    );
    renderStations(filtered);
});

// 5. Modal & Booking Logic
window.openModal = (id) => {
    const station = stationsData.find(s => s.id === id);
    if (!station || station.status === 'Busy') return;

    currentStationId = id;
    document.getElementById('modalTitle').innerText = station.name;
    document.getElementById('modalType').innerText = station.type;
    document.getElementById('modalPrice').innerText = station.price;
    modal.style.display = 'flex';
};

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Simulate Booking (Change Status to Busy)
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Update data array
    const stationIndex = stationsData.findIndex(s => s.id === currentStationId);
    if (stationIndex > -1) {
        stationsData[stationIndex].status = 'Busy';
    }

    // Refresh UI
    renderStations(stationsData);
    modal.style.display = 'none';
    bookingForm.reset();
    alert("Charging Session Started! Drive safe.");
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target == modal) modal.style.display = 'none';
});

// Initial Load
renderStations(stationsData);
