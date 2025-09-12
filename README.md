<<<<<<< HEAD
# Erode Local Bus Tracker

A full-stack web application for tracking local buses in Erode, Tamil Nadu. Built with React frontend and Node.js/Express backend with MongoDB.

## Features

- **Public Dashboard**: View all available bus routes with real-time arrival estimates
- **User Authentication**: Sign up/Login with JWT tokens
- **Favorites**: Save favorite bus routes (requires login)
- **Admin Panel**: CRUD operations for bus routes (admin only)
- **Live Map Tracking**: Interactive maps with real-time bus movement using react-leaflet
- **Real-time ETAs**: Estimated time of arrival for each stop
- **Driver Simulation**: Simulate bus movement for testing
- **Responsive Design**: Clean UI with dark theme

## How to Use

### For Passengers
1. **View Bus Routes**: Browse available routes on the home page
2. **Track a Bus**: Click on any bus to see its current location and route
3. **View ETAs**: Check estimated arrival times for upcoming stops
4. **Save Favorites**: Log in to save your frequently used routes

### For Drivers
1. **Start Simulation**: Go to a bus details page and start the simulation
2. **Adjust Speed**: Use the slider to set the desired speed
3. **Monitor Progress**: Watch the bus move along its route in real-time
4. **View ETAs**: See how speed changes affect arrival times

### For Admins
1. **Manage Routes**: Add, edit, or remove bus routes
2. **Monitor Buses**: Track all active buses in real-time
3. **Update Schedules**: Modify departure and arrival times (admin only)

## Tech Stack

### Frontend
- React 19 with Vite
- React Router v7 for navigation
- React Context for state management
- Axios for API calls
- React Leaflet v5 for maps
- Geolib for distance calculations
- Date-fns for date/time formatting
- Custom CSS styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Geolib for distance calculations
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd LocalBusTracking/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/erode-bus-tracker
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

4. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. Seed the database with sample data:
```bash
node seed.js
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd LocalBusTracking/bus-tracker
```

2. Install dependencies:
```bash
npm install
npm install react-leaflet leaflet
```

3. Start the development server:
```bash
npm run dev
```



## New Live Tracking Features

### Real-time Bus Tracking
- Live bus location updates every 5 seconds
- Smooth bus movement animation on the map
- Current speed and direction indicators
- Last updated timestamp

### ETA Calculation
- Real-time ETA calculation for each stop
- Considers current traffic conditions (simulated)
- Updates automatically as the bus moves
- Displays in HH:MM AM/PM format

### Driver Simulation
- Simulate bus movement along predefined routes
- Adjustable speed (10-120 km/h)
- Realistic movement with proper bearing calculation
- Loop back to start when route is completed

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Buses
- `GET /api/buses` - Get all buses (public)
- `GET /api/buses/:id` - Get single bus (public)
- `POST /api/buses` - Create bus (admin only)
- `PUT /api/buses/:id` - Update bus (admin only)
- `DELETE /api/buses/:id` - Delete bus (admin only)

### Favorites
- `GET /api/favorites` - Get user's favorites (protected)
- `POST /api/favorites/:busId` - Add to favorites (protected)
- `DELETE /api/favorites/:busId` - Remove from favorites (protected)

## Usage

1. **Public Access**: Visit the dashboard to view all bus routes without login
2. **User Registration**: Create an account to access favorites
3. **Admin Access**: Create an admin user by setting `role: "admin"` in the signup
4. **Favorites**: Click the star icon on bus cards to add/remove favorites
5. **Live Tracking**: Click "View Route" to see the map with simulated bus movement
6. **Admin Panel**: Manage bus routes (add, edit, delete)

## Default Admin User

To create an admin user, you can either:
1. Use the signup form and manually set role to "admin" in the database
2. Or modify the signup endpoint to allow role selection

## Map Features

- Interactive OpenStreetMap integration
- Route visualization with polylines
- Bus stop markers with popups
- Simulated bus movement with start/stop controls
- Real-time position updates

## Project Structure

```
LocalBusTracking/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   └── seed.js          # Database seeder
└── bus-tracker/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   ├── services/    # API services
    │   └── utils/       # Utility functions
    └── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
=======
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
>>>>>>> acc15a25a8c2411e1f07c2522a845e2f9c60ed32
