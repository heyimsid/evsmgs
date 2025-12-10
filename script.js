// 1. Initial Data (If storage is empty)
const initialEvents = [
    {
        id: 1,
        title: "Neon Cyber Party",
        date: "2025-08-15",
        price: 50,
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "Tech Innovation Summit",
        date: "2025-09-20",
        price: 120,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "Modern Art Gallery",
        date: "2025-10-05",
        price: 25,
        image: "https://images.unsplash.com/photo-1518998053901-5348d3969104?auto=format&fit=crop&w=600&q=80"
    }
];

// 2. Select DOM Elements
const eventsContainer = document.getElementById('eventsContainer');
const addEventBtn = document.getElementById('addEventBtn');
const modal = document.getElementById('eventModal');
const closeBtn = document.querySelector('.close-btn');
const eventForm = document.getElementById('eventForm');

// 3. Load Events from LocalStorage or use Initial Data
let events = JSON.parse(localStorage.getItem('myEvents')) || initialEvents;

// 4. Function to Render Events
function renderEvents() {
    eventsContainer.innerHTML = ""; // Clear current list

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Fallback image if user provides none
        const imgUrl = event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80";

        card.innerHTML = `
            <div class="relative">
                <img src="${imgUrl}" alt="${event.title}" class="card-image">
                <span class="card-date">${event.date}</span>
            </div>
            <div class="card-content">
                <h3 class="card-title">${event.title}</h3>
                <div class="card-footer">
                    <span class="price">$${event.price}</span>
                    <button class="btn-book" onclick="alert('Booking confirmed for ${event.title}!')">Book</button>
                </div>
            </div>
        `;
        eventsContainer.appendChild(card);
    });
}

// 5. Handle Modal (Open/Close)
addEventBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal if clicking outside the box
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

// 6. Handle New Event Submission
eventForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop page reload

    // Get values from inputs
    const newEvent = {
        id: Date.now(), // Unique ID based on time
        title: document.getElementById('titleInput').value,
        date: document.getElementById('dateInput').value,
        price: document.getElementById('priceInput').value,
        image: document.getElementById('imageInput').value
    };

    // Add to array
    events.push(newEvent);

    // Save to LocalStorage
    localStorage.setItem('myEvents', JSON.stringify(events));

    // Re-render and close modal
    renderEvents();
    modal.style.display = 'none';
    eventForm.reset();
});

// Initial Render
renderEvents();
