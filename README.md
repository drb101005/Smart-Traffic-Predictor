# Project-3

# 🚦 Smart Traffic Predictor

An AI-powered traffic predictor that helps you decide the **best time to leave** for your destination.  
It shows **real-time traffic, distance, duration, and optimized departure suggestions** with interactive maps.

---

## ✨ Features
- 🌍 Interactive Google Maps with origin & destination search
- ⏳ Travel time & distance calculation using Google Distance Matrix API
- 🕒 Smart departure suggestions (leave now or later to arrive on time)
- 🔄 Swap origin/destination with one click
- 🎨 Modern, responsive UI

---

## 🛠️ Tech Stack
- **Frontend:** React (Vite/CRA) + TailwindCSS
- **Backend:** FastAPI (Python)
- **APIs:** Google Maps Places API + Distance Matrix API
- **Deployment:** Vercel (Frontend) + Railway/Render (Backend)

---

## 🚀 Getting Started (Run Locally)

### 1️⃣ Clone the Repository

git clone https://github.com/your-username/smart-traffic-predictor.git
cd smart-traffic-predictor
2️⃣ Backend Setup (FastAPI)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

3️⃣ Frontend Setup (React)
cd frontend
npm install
npm start
```bash
************************************************************************************************************************************
🔑 API Keys Setup

You need a Google Maps API Key with the following enabled:

Places API

Distance Matrix API

Maps JavaScript API

Add keys:

In backend/.env:

GOOGLE_MAPS_API_KEY=your_api_key_here


In frontend/.env:

REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here


(Restart servers after adding keys)
