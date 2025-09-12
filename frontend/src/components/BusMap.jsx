import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BusMap.css';

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

// Helper function to safely get coordinates
const getBusCoordinates = (bus) => {
  try {
    // Handle different possible location structures
    const location = bus?.location || bus?.currentLocation?.coordinates || bus?.coordinates;
    
    if (!location) return null;
    
    // Handle both { lat, lng } and [lng, lat] formats
    if (Array.isArray(location)) {
      return { lat: location[1], lng: location[0] };
    }
    
    const lat = parseFloat(location.lat || location.latitude || location[0]);
    const lng = parseFloat(location.lng || location.longitude || location[1] || location[0]);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return { lat, lng };
  } catch (error) {
    console.error('Error parsing bus coordinates:', error);
    return null;
  }
};

const BusMarker = ({ bus }) => {
  const coords = getBusCoordinates(bus);
  
  if (!coords) return null;
  
  return (
    <Marker position={[coords.lat, coords.lng]} icon={busIcon}>
      <Popup>
        <div>
          <h4>{bus.routeName || `Bus ${bus.id || 'Unknown'}`}</h4>
          {bus.vehicleId && <p>Vehicle: {bus.vehicleId}</p>}
          {bus.lastUpdated && (
            <p>Last updated: {new Date(bus.lastUpdated).toLocaleTimeString()}</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const BusMap = ({ buses = [], center, zoom = 13, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState(center || [11.3100, 77.6300]);
  
  // Update map center if new center prop is provided
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      setMapCenter(center);
    }
  }, [center]);
  
  // Handle loading state
  useEffect(() => {
    if (buses) {
      setIsLoading(false);
      setError(null);
    }
  }, [buses]);
  
  // Auto-center map when buses change
  const MapUpdater = () => {
    const map = useMap();
    
    useEffect(() => {
      if (buses?.length > 0) {
        const validBuses = buses
          .map(bus => getBusCoordinates(bus))
          .filter(Boolean);
        
        if (validBuses.length > 0) {
          const bounds = L.latLngBounds(validBuses);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } else if (center) {
        map.setView(center, zoom);
      }
    }, [buses, center, map]);
    
    return null;
  };
  
  // Handle error state
  if (error) {
    return (
      <div className="map-error">
        <div className="error-icon">⚠️</div>
        <p>Failed to load bus data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Loading bus locations...</p>
      </div>
    );
  }
  
  // Handle no buses case
  if (!buses || buses.length === 0) {
    return (
      <div className="map-no-buses">
        <p>No buses available at this time</p>
      </div>
    );
  }
  
  // Filter out buses without valid coordinates
  const validBuses = buses.filter(bus => {
    const coords = getBusCoordinates(bus);
    return coords && !isNaN(coords.lat) && !isNaN(coords.lng);
  });
  
  // If no buses have valid coordinates, show message
  if (validBuses.length === 0) {
    return (
      <div className="map-no-valid-locations">
        <p>No buses with valid location data</p>
      </div>
    );
  }
  
  return (
    <div className={`bus-map-container ${className}`}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        className="bus-map"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater />
        
        {validBuses.map((bus, index) => (
          <BusMarker key={`${bus.id || index}-${bus.vehicleId || ''}`} bus={bus} />
        ))}
      </MapContainer>
    </div>
  );
};

export default BusMap;
