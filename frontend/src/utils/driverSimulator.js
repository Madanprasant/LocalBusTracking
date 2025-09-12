import { updateBusLocation } from '../services/busApi';

class DriverSimulator {
  constructor(busId, path, updateInterval = 5000) {
    this.busId = busId;
    this.path = path;
    this.updateInterval = updateInterval;
    this.currentPointIndex = 0;
    this.intervalId = null;
    this.speedKmph = 40; // Average speed in km/h
    this.isRunning = false;
  }

  // Calculate distance between two points in kilometers
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calculate bearing between two points in degrees
  calculateBearing(lat1, lon1, lat2, lon2) {
    const φ1 = this.toRad(lat1);
    const φ2 = this.toRad(lat2);
    const Δλ = this.toRad(lon2 - lon1);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // in degrees
  }

  // Get next point on the path
  getNextPoint() {
    if (this.currentPointIndex >= this.path.length - 1) {
      this.currentPointIndex = 0; // Loop back to start
    }
    
    const currentPoint = this.path[this.currentPointIndex];
    const nextPoint = this.path[this.currentPointIndex + 1] || this.path[0];
    
    // Calculate distance between current and next point
    const distance = this.calculateDistance(
      currentPoint.lat,
      currentPoint.lng,
      nextPoint.lat,
      nextPoint.lng
    );
    
    // Calculate time to reach next point at current speed (in hours)
    const timeHours = distance / this.speedKmph;
    
    // Calculate fraction of the path to move in this update
    const fraction = (this.updateInterval / 1000 / 3600) / timeHours;
    
    // Calculate new position (linear interpolation)
    const newLat = currentPoint.lat + (nextPoint.lat - currentPoint.lat) * fraction;
    const newLng = currentPoint.lng + (nextPoint.lng - currentPoint.lng) * fraction;
    
    // Calculate bearing (direction) to next point
    const bearing = this.calculateBearing(
      newLat,
      newLng,
      nextPoint.lat,
      nextPoint.lng
    );
    
    // If we're close enough to the next point, move to it
    if (fraction >= 1) {
      this.currentPointIndex++;
      return {
        lat: nextPoint.lat,
        lng: nextPoint.lng,
        bearing: bearing,
        speed: this.speedKmph,
        reachedEnd: this.currentPointIndex >= this.path.length - 1
      };
    }
    
    return {
      lat: newLat,
      lng: newLng,
      bearing: bearing,
      speed: this.speedKmph,
      reachedEnd: false
    };
  }

  // Start the simulation
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    const updateLocation = async () => {
      try {
        const position = this.getNextPoint();
        
        // Update the bus location via API
        await updateBusLocation(this.busId, {
          lat: position.lat,
          lng: position.lng,
          speed: position.speed,
          bearing: position.bearing
        });
        
        console.log(`Updated bus ${this.busId} location to:`, position);
        
        // If we've reached the end of the path, start over
        if (position.reachedEnd) {
          console.log('Reached end of route. Starting over...');
        }
        
      } catch (error) {
        console.error('Error updating bus location:', error);
      }
    };
    
    // Initial update
    await updateLocation();
    
    // Set up interval for updates
    this.intervalId = setInterval(updateLocation, this.updateInterval);
  }
  
  // Stop the simulation
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
  
  // Set the speed of the bus in km/h
  setSpeed(kmh) {
    this.speedKmph = Math.max(1, Math.min(120, kmh)); // Clamp between 1-120 km/h
  }
}

export default DriverSimulator;
