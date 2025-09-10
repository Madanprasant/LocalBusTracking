# 🚌Local Bus Tracker (Hackathon Project)

A hackathon project to build a **local bus tracking and alert system** starting with **Erode district**.  
Our focus is **daily passengers** (work, school, town-to-town travel), not luxury travels.  
We aim to solve problems of **uncertainty in timings** and **waiting at stops**.

---

## 🚀 Features
### Hackathon Deliverable (Passenger Web App)
- 🔑 Login (basic, passenger/admin roles)
- 🚌 Search buses (routes, timings, fares from TN official data)
- ⭐ Favorite buses (quick access list)
- ⏳ Arrival alerts (“Bus will arrive in 10 mins” – simulated now)
- 🗺️ Map placeholder (future: live tracking with driver app)
- ⚙️ Admin panel (add/edit routes manually)

### Future Roadmap
- 📱 Driver app with GPS tracking (React Native)
- 📍 Live map tracking in passenger app (Leaflet.js / Google Maps)
- 👥 Bus occupancy info (crowded / free marking)
- ⏲️ AI-based delay predictions

---

## 🛠️ Tech Stack
- **Frontend:** React + Vite (with Tailwind CSS for styling)
- **UI Libraries:** Acernity UI, ReactBits
- **Routing:** React Router
- **Backend (planned):** Node.js + Express
- **Database (planned):** SQLite (simple + hackathon-friendly)
- **Deployment:** Vercel (frontend) + Render/Heroku (backend)

---

## 📂 Project Structure
bus-tracker/
│── frontend/ # React + Vite app
│ ├── src/
│ │ ├── assets/ # logos, icons
│ │ ├── components/ # reusable UI
│ │ ├── data/ # tn-bus-data.json (dummy bus data)
│ │ ├── pages/
│ │ │ ├── Login.jsx
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Favorites.jsx
│ │ │ ├── AdminPanel.jsx
│ │ ├── utils/ # arrival calculation, helpers
│ │ ├── App.jsx
│ │ └── main.jsx
│── backend/ (future) # Node.js + Express APIs
│── driver-app/ (future) # React Native app for GPS tracking
