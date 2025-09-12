const express = require('express');
const Bus = require('../models/Bus');
const { auth, adminAuth } = require('../middleware/auth');
const geolib = require('geolib');
const WebSocket = require('ws');

const router = express.Router();

// Store active WebSocket connections
const activeConnections = new Map();

// Function to broadcast location updates to all connected clients
function broadcastLocationUpdate(busId, locationData) {
  if (activeConnections.has(busId)) {
    const connections = activeConnections.get(busId);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(locationData));
      }
    });
  }
}

// Get all buses (public)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all buses...');
    // Remove isActive filter to get all buses
    const buses = await Bus.find({}).sort({ routeName: 1 });
    
    console.log(`Found ${buses.length} buses in total`);
    if (buses.length > 0) {
      console.log('Sample bus data:', {
        id: buses[0].id,
        routeName: buses[0].routeName,
        origin: buses[0].origin,
        destination: buses[0].destination,
        isActive: buses[0].isActive
      });
    }
    
    res.json(buses);
  } catch (error) {
    console.error('Error in GET /api/buses:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get single bus (public)
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching bus with ID: ${req.params.id}`);
    const bus = await Bus.findOne({ id: req.params.id });
    if (!bus) {
      console.log(`Bus with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Bus not found' });
    }
    console.log(`Found bus: ${bus.routeName} (ID: ${bus.id})`);
    res.json(bus);
  } catch (error) {
    console.error('Error in GET /api/buses/:id:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create bus (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const busData = req.body;
    
    // Check if bus ID already exists
    const existingBus = await Bus.findOne({ id: busData.id });
    if (existingBus) {
      return res.status(400).json({ message: 'Bus ID already exists' });
    }

    const bus = new Bus(busData);
    await bus.save();
    
    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bus (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const bus = await Bus.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete bus (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const bus = await Bus.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    );
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    
    res.json({ message: 'Bus deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update bus location and calculate ETAs
router.put('/:id/location', async (req, res) => {
  try {
    const { lat, lng, speed, bearing } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const bus = await Bus.findOne({ id: req.params.id });
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Calculate distance to each stop and update ETAs
    const now = new Date();
    const etas = bus.stops.map(stop => {
      if (stop.passed) return { ...stop.toObject(), eta: 'Passed' };
      
      const distance = geolib.getDistance(
        { latitude: lat, longitude: lng },
        { latitude: stop.coordinates.lat, longitude: stop.coordinates.lng }
      ) / 1000; // Convert to kilometers
      
      const effectiveSpeed = speed || bus.averageSpeed || 40; // km/h
      const hoursToArrival = distance / effectiveSpeed;
      const eta = new Date(now.getTime() + hoursToArrival * 60 * 60 * 1000);
      
      // Format as HH:MM
      const etaString = eta.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      // Store ETA history
      stop.etas.push({
        timestamp: now,
        eta: etaString
      });
      
      // Keep only the last 5 ETA updates
      if (stop.etas.length > 5) {
        stop.etas.shift();
      }

      return {
        ...stop.toObject(),
        distance: parseFloat(distance.toFixed(2)),
        eta: etaString
      };
    });

    // Update bus location
    bus.currentLocation = {
      coordinates: { lat, lng },
      lastUpdated: now,
      speed: speed || bus.currentLocation?.speed || bus.averageSpeed || 40,
      bearing: bearing || bus.currentLocation?.bearing || 0
    };

    await bus.save();

    res.json({
      success: true,
      location: bus.currentLocation,
      etas: etas.map(({ name, distance, eta }) => ({ name, distance, eta }))
    });
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update bus location',
      error: error.message 
    });
  }
});

// Get bus location and ETAs
router.get('/:id/etas', async (req, res) => {
  try {
    const busId = req.params.id;
    if (!busId) {
      return res.status(400).json({ message: 'Bus ID is required' });
    }

    const bus = await Bus.findOne({ id: busId });
    if (!bus) {
      return res.status(404).json({ message: `Bus with ID ${busId} not found` });
    }

    // If no location data is available
    if (!bus.currentLocation || !bus.currentLocation.coordinates) {
      return res.json({
        busId: bus.id,
        message: 'Bus location not available',
        location: null,
        etas: bus.stops?.map(stop => ({
          name: stop.name,
          eta: 'N/A',
          distance: 'N/A'
        })) || []
      });
    }

    const currentLocation = bus.currentLocation.coordinates;
    let totalDistance = 0;
    let prevPoint = { 
      lat: parseFloat(currentLocation.lat), 
      lng: parseFloat(currentLocation.lng) 
    };
    
    // Ensure stops is an array and has items
    const stops = Array.isArray(bus.stops) ? bus.stops : [];
    
    // Calculate ETAs for all stops
    const etas = stops.map(stop => {
      if (!stop || !stop.coordinates) {
        return {
          name: stop?.name || 'Unknown Stop',
          eta: 'N/A',
          distance: 'N/A'
        };
      }
      
      try {
        const stopCoords = {
          latitude: parseFloat(stop.coordinates.lat),
          longitude: parseFloat(stop.coordinates.lng)
        };
        
        // Calculate distance in kilometers
        const distance = geolib.getDistance(
          { latitude: prevPoint.lat, longitude: prevPoint.lng },
          stopCoords
        ) / 1000;
        
        totalDistance += Math.max(0, distance); // Ensure non-negative distance
        prevPoint = { lat: stopCoords.latitude, lng: stopCoords.longitude };
        
        // Calculate ETA in minutes (distance in km / speed in km/h * 60)
        const speed = Math.max(1, bus.averageSpeed || 40); // Ensure speed is at least 1 km/h
        const etaMinutes = Math.round((totalDistance / speed) * 60);
        
        return {
          name: stop.name,
          eta: etaMinutes <= 1 ? 'Arriving' : `${etaMinutes} min`,
          distance: Math.round(totalDistance * 10) / 10 // Round to 1 decimal
        };
      } catch (err) {
        console.error(`Error calculating ETA for stop ${stop.name || 'unknown'}:`, err);
        return {
          name: stop.name || 'Unknown Stop',
          eta: 'Error',
          distance: 'Error'
        };
      }
    });

    res.json({
      busId: bus.id,
      routeName: bus.routeName,
      location: bus.currentLocation,
      etas,
      lastUpdated: bus.currentLocation.timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/buses/:id/etas:', error);
    res.status(500).json({ 
      message: 'Error calculating ETAs',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;


