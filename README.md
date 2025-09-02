🚦 Smart Traffic Predictor

An app that helps you decide the best time to leave so you arrive on time.
See live traffic, distance, duration, and a suggested departure time, with searchable Google Maps for origin & destination.

✨ Features

🌍 Search origin/destination with Google Places

🗺️ Pin on map and auto-fill the address

🔄 One-click Swap for origin/destination

⏳ Real-time distance & duration

🕒 “Leave by” suggestion for a chosen arrival time

📱 Modern UI that works great on mobile

🧰 Tech

Frontend: React (Create React App)

Backend: FastAPI (Python)

APIs: Google Maps JavaScript, Places, Distance Matrix

Deploy: Vercel (frontend) + Railway/Render (backend)

🔐 API Keys (one-time setup)

You need one Google Maps API key with billing enabled and these APIs turned on:

Maps JavaScript API

Places API

Distance Matrix API

You will paste this key into two places later:

backend/.env

frontend/.env

Don’t commit .env files to GitHub.

🖥️ What you need installed

Python 3.10+ (3.11 or 3.13 are fine)

Node.js 18+ and npm

Git

🚀 Run the project locally (step by step)
1) Download the code
git clone https://github.com/your-username/smart-traffic-predictor.git
cd smart-traffic-predictor

2) Start the backend (FastAPI)
a) Open a terminal and go to the backend folder
cd backend

b) Create a virtual environment

Windows (PowerShell):

py -m venv .venv
.venv\Scripts\activate


macOS/Linux:

python3 -m venv .venv
source .venv/bin/activate


You should see (.venv) at the start of your terminal line after activation.

c) Install Python packages
pip install -r requirements.txt


If pip fails, try:
python -m pip install -r requirements.txt (Windows)
python3 -m pip install -r requirements.txt (macOS/Linux)

d) Add your Google API key

Create a file named .env inside the backend folder with this content:

GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

e) Run the backend server
uvicorn main:app --reload


You should see something like:

Uvicorn running on http://127.0.0.1:8000


Test it in your browser:
Open http://127.0.0.1:8000/docs
 — you should see the FastAPI docs.

Leave this terminal open.

3) Start the frontend (React)

Open a new terminal window (keep the backend running), then:

a) Go to the frontend folder
cd smart-traffic-predictor/frontend

b) Add your Google API key

Create a file named .env inside the frontend folder:

REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE


After creating or changing .env, you must restart npm start for it to take effect.

c) Install Node packages
npm install


If you see “react-scripts is not recognized”, run:

npm install react-scripts --save

d) Run the frontend
npm start


Your browser should open http://localhost:3000
 automatically.
If not, open it manually.

🕹️ How to use

In Origin, start typing (e.g., “Mumbai”). Select from the suggestions.

In Destination, do the same.

You can also tap the map to pinpoint a location — the address fills in automatically.

Set Desired Arrival Time (optional).

Click Get Route.

See Distance, Live Duration, and Leave by time.

Use 🔄 Swap to flip origin/destination instantly.

🧪 Quick checks if something breaks

Frontend can’t fetch / shows “Failed to fetch”
Make sure backend is running on http://127.0.0.1:8000 and you didn’t change the URL inside frontend/src/App.js.

422 error
Fill both Origin and Destination.

Map/Autocomplete not working

Check your frontend/.env key.

Make sure the three APIs are enabled.

Restart npm start after editing .env.

CORS issues
Our backend enables CORS for all origins in development. Keep both apps on your local machine (ports 3000 and 8000).

🧹 Clean start commands (if npm gets grumpy)

Windows (PowerShell):

cd frontend
rd /s /q node_modules
del package-lock.json
npm install
npm start


macOS/Linux:

cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

📦 Deploy (optional)

Frontend: Vercel

Backend: Railway or Render

Keep API keys in each platform’s Environment Variables, not in code.
