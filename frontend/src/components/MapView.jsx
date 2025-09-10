import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const intervalRef = useRef(null);

  const routeCoordinates = bus.stops.map(stop => {
    if (typeof stop === 'string') {
      // Original format - use default coordinates
      return [11.3100, 77.6300];
    }
    return [stop.coordinates.lat, stop.coordinates.lng];
  });
  
  // Calculate current bus position along the route
  const getCurrentBusPosition = () => {
    if (routeCoordinates.length < 2) return routeCoordinates[0] || [11.3100, 77.6300];
    
    const totalStops = routeCoordinates.length;
    const progress = currentPosition / (totalStops - 1);
    
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
  };

  const startMovement = () => {
    if (intervalRef.current) return;
    
    setIsMoving(true);
    intervalRef.current = setInterval(() => {
      setCurrentPosition(prev => {
        const newPos = prev + 0.1;
        if (newPos >= bus.stops.length - 1) {
          setIsMoving(false);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return bus.stops.length - 1;
        }
        return newPos;
      });
    }, 2000); // Move every 2 seconds
  };

  const stopMovement = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMoving(false);
  };

  const resetPosition = () => {
    stopMovement();
    setCurrentPosition(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentBusPos = getCurrentBusPosition();
  const currentStopIndex = Math.floor(currentPosition);
  const currentStop = bus.stops[currentStopIndex];
  const currentStopName = typeof currentStop === 'string' ? currentStop : currentStop?.name;

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
