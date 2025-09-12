import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { subscribeToBusLocation } from '../services/busApi';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="#ff6b6b"/>
      <rect x="5" y="8" width="14" height="8" fill="#ffffff"/>
      <circle cx="7" cy="16" r="1.5" fill="#333"/>
      <circle cx="17" cy="16" r="1.5" fill="#333"/>
      <text x="12" y="13" text-anchor="middle" font-size="8" fill="#333">BUS</text>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function MapView({ bus }) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [etData, setEtData] = useState(null);
  const intervalRef = useRef(null);

  // Process route coordinates
  const routeCoordinates = useMemo(() => {
    if (!bus?.stops) return [];
    
    return bus.stops.map(stop => {
      if (typeof stop === 'string') {
        return [11.3100, 77.6300]; // Default coordinates
      }
      // Handle both formats: stop.coordinates and stop.location
      const coords = stop.coordinates || stop.location;
      if (!coords) return [11.3100, 77.6300];
      
      return [
        parseFloat(coords.lat) || 11.3100, 
        parseFloat(coords.lng) || 77.6300
      ];
    });
  }, [bus]);

  // Subscribe to location updates
  useEffect(() => {
    if (!bus?.id) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToBusLocation(bus.id, ({ data, error }) => {
      if (error) {
        console.error('Error in location subscription:', error);
        setError(error.message || 'Failed to fetch bus location');
        setLoading(false);
        return;
      }

      if (data) {
        setEtData(data);
        setError(null);
      }
      setLoading(false);
    }, 10000); // Update every 10 seconds

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bus?.id]);
  
  // Calculate current bus position along the route
  const getCurrentBusPosition = useCallback(() => {
    if (!routeCoordinates || routeCoordinates.length === 0) {
      return [11.3100, 77.6300]; // Default coordinates
    }
    
    if (routeCoordinates.length < 2) return routeCoordinates[0];
    
    const totalStops = routeCoordinates.length;
    const progress = Math.min(1, Math.max(0, currentPosition / (totalStops - 1)));
    
    if (progress >= 1) return routeCoordinates[totalStops - 1];
    if (progress <= 0) return routeCoordinates[0];
    
    const currentIndex = Math.floor(progress * (totalStops - 1));
    const nextIndex = Math.min(currentIndex + 1, totalStops - 1);
    const segmentProgress = (progress * (totalStops - 1)) - currentIndex;
    
    const currentStop = routeCoordinates[currentIndex];
    const nextStop = routeCoordinates[nextIndex];
    
    return [
      currentStop[0] + (nextStop[0] - currentStop[0]) * segmentProgress,
      currentStop[1] + (nextStop[1] - currentStop[1]) * segmentProgress
    ];
  }, [currentPosition, routeCoordinates]);

  const startMovement = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsMoving(true);
    intervalRef.current = setInterval(() => {
      setCurrentPosition(prev => {
        const nextPos = prev + 0.1;
        if (nextPos >= routeCoordinates.length - 1) {
          setIsMoving(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0; // Reset position
        }
        return nextPos;
      });
    }, 100);
  }, [routeCoordinates.length]);

  const stopMovement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMoving(false);
  }, []);

  const resetPosition = useCallback(() => {
    setCurrentPosition(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMoving(false);
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading bus location...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="map-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentBusPos = getCurrentBusPosition();
  const currentStopIndex = Math.min(
    Math.floor(currentPosition), 
    (bus?.stops?.length || 1) - 1
  );
  const currentStop = bus?.stops?.[currentStopIndex];
  const currentStopName = !currentStop ? 'Loading...' : 
    (typeof currentStop === 'string' ? currentStop : currentStop.name || 'Unknown Stop');

  return (
    <div className="map-container">
      <div className="map-controls">
        <button className="btn" onClick={isMoving ? stopMovement : startMovement}>
          {isMoving ? "Stop Bus" : "Start Bus"}
        </button>
        <button className="btn" onClick={resetPosition}>
          Reset
        </button>
        <span className="map-status">
          {isMoving ? "Bus is moving..." : "Bus is stopped"}
          {currentStopName && ` - At: ${currentStopName}`}
        </span>
      </div>
      
      <div style={{ height: '400px', width: '100%', marginTop: '10px' }}>
        <MapContainer
          center={[11.3100, 77.6300]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route polyline */}
          <Polyline
            positions={routeCoordinates}
            color="blue"
            weight={4}
            opacity={0.7}
          />
          
          {/* Bus stops */}
          {routeCoordinates.map((coord, index) => (
            <Marker key={index} position={coord}>
              <Popup>
                <div>
                  <strong>{typeof bus.stops[index] === 'string' ? bus.stops[index] : bus.stops[index]?.name}</strong>
                  <br />
                  Stop {index + 1} of {bus.stops.length}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Moving bus */}
          <Marker position={currentBusPos} icon={busIcon}>
            <Popup>
              <div>
                <strong>🚌 Bus {bus.id}</strong>
                <br />
                {bus.routeName}
                <br />
                {currentStopName ? `At: ${currentStopName}` : 'Moving...'}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
