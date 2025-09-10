# Erode Local Bus Tracker

A full-stack web application for tracking local buses in Erode, Tamil Nadu. Built with React frontend and Node.js/Express backend with MongoDB.

## Features

- **Public Dashboard**: View all available bus routes with real-time arrival estimates
- **User Authentication**: Sign up/Login with JWT tokens
- **Favorites**: Save favorite bus routes (requires login)
- **Admin Panel**: CRUD operations for bus routes (admin only)
- **Live Map Tracking**: Interactive maps with simulated bus movement using react-leaflet
- **Responsive Design**: Clean UI with dark theme

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- React Context for state management
- Axios for API calls
- React Leaflet for maps
- Custom CSS styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
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

The frontend will run on `http://localhost:5173`

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