const axios = require('axios');
const mongoose = require('mongoose');
const Bus = require('./models/Bus');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erode-bus-tracker');

const API_BASE_URL = 'http://localhost:5000/api';

async function updateBusLocation(busId, lat, lng) {
  try {
    const response = await axios.put(`${API_BASE_URL}/buses/${busId}/location`, {
      lat,
      lng
    });
    console.log(`Updated ${busId} location to (${lat}, ${lng})`);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${busId} location:`, error.message);
  }
}

function calculateNextPoint(currentPoint, nextPoint, step) {
  const totalDistance = Math.sqrt(
    Math.pow(nextPoint.lat - currentPoint.lat, 2) +
    Math.pow(nextPoint.lng - currentPoint.lng, 2)
  );
  
  if (totalDistance < 0.0001) return nextPoint; // Reached the point
  
  const ratio = step / totalDistance;
  const lat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * ratio;
  const lng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * ratio;
  
  return { lat, lng };
}

async function simulateBusMovement(busId, route, options = {}) {
  const {
    speed = 0.0005, // degrees per update
    interval = 2000, // ms between updates
    loop = true
  } = options;
  
  let currentPointIndex = 0;
  let currentPosition = { ...route[0] };
  
  console.log(`Starting simulation for bus ${busId}`);
  
  const moveBus = async () => {
    const nextPointIndex = (currentPointIndex + 1) % route.length;
    const nextPoint = route[nextPointIndex];
    
    // Calculate next position
    const nextPosition = calculateNextPoint(currentPosition, nextPoint, speed);
    
    // Update bus location
    await updateBusLocation(busId, nextPosition.lat, nextPosition.lng);
    
    // Check if we've reached the next point
    const distanceToNext = Math.sqrt(
      Math.pow(nextPoint.lat - nextPosition.lat, 2) +
      Math.pow(nextPoint.lng - nextPosition.lng, 2)
    );
    
    if (distanceToNext < 0.0001) {
      currentPointIndex = nextPointIndex;
      console.log(`Reached point ${currentPointIndex + 1}/${route.length}`);
      
      // If we've completed the route and not looping, stop
      if (currentPointIndex === 0 && !loop) {
        console.log('Route completed');
        return;
      }
    }
    
    currentPosition = nextPosition;
    
    // Schedule next move
    setTimeout(moveBus, interval);
  };
  
  // Start the movement
  moveBus();
}

// Example usage
async function startSimulation() {
  try {
    // Get the bus data
    const bus = await Bus.findOne({ id: 'ERD-101' });
    if (!bus) {
      console.error('Bus not found');
      process.exit(1);
    }
    
    // Extract route coordinates from stops
    const route = bus.stops.map(stop => ({
      lat: stop.coordinates.lat,
      lng: stop.coordinates.lng
    }));
    
    // Start simulation
    simulateBusMovement(bus.id, route, {
      speed: 0.0005, // Adjust speed as needed
      interval: 3000, // Update every 3 seconds
      loop: true      // Keep looping the route
    });
    
  } catch (error) {
    console.error('Error starting simulation:', error);
    process.exit(1);
  }
}

// Start the simulation
startSimulation();
