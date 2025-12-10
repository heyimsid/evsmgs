/* --- Global Variables & Reset --- */
:root {
    --bg-color: #0f172a;       /* Dark Navy Background */
    --card-bg: #1e293b;        /* Lighter Navy for Cards */
    --text-main: #f8fafc;      /* White text */
    --text-muted: #94a3b8;     /* Grey text */
    --accent: #8b5cf6;         /* Purple accent */
    --accent-glow: #8b5cf680;
    --gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
}

body {
    background-color: var(--bg-color);
    color: var(--text-main);
    padding-bottom: 50px;
}

/* --- Navigation --- */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
}

.highlight {
    color: var(--accent);
}

/* --- Hero Section --- */
.hero {
    text-align: center;
    padding: 4rem 1rem;
}

.hero h1 {
    font-size: 3rem;
    line-height: 1.2;
    margin-bottom: 1rem;
}

/* Gradient Text Effect */
.gradient-text {
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero p {
    color: var(--text-muted);
}

/* --- Responsive Grid System --- */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.section-title {
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
    border-left: 4px solid var(--accent);
    padding-left: 10px;
}

/* The Mobile Stable Grid */
.events-grid {
    display: grid;
    /* This creates automatic columns based on screen width */
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

/* --- Event Cards --- */
.card {
    background-color: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid #334155;
    position: relative;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px var(--accent-glow);
}

.card-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.card-content {
    padding: 1.5rem;
}

.card-date {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    backdrop-filter: blur(5px);
}

.card-title {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.price {
    color: #4ade80; /* Green */
    font-weight: 600;
    font-size: 1.1rem;
}

/* --- Buttons --- */
.btn-primary, .btn-book {
    background: var(--gradient);
    border: none;
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
}

.btn-book {
    padding: 8px 16px;
    font-size: 0.9rem;
}

.btn-primary:hover, .btn-book:hover {
    opacity: 0.9;
}

/* --- Modal (Popup) --- */
.modal {
    display: none; /* Hidden by default */
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.8);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: var(--card-bg);
    padding: 2rem;
    border-radius: 16px;
    width: 90%;
    max-width: 400px;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
}

/* Form Styles */
input {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    background: #0f172a;
    border: 1px solid #334155;
    color: white;
    border-radius: 8px;
}

.btn-submit {
    width: 100%;
    background: var(--gradient);
    border: none;
    color: white;
    padding: 12px;
    border-radius: 8px;
    margin-top: 10px;
    cursor: pointer;
    font-weight: bold;
}
