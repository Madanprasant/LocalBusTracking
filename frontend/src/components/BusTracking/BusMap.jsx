import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getBusDetails, subscribeToBusLocation } from '../../services/busApi';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/477/477103.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom stop icon
const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2776/2776000.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Component to handle map updates when bus moves
const MapUpdater = ({ busPosition, zoom }) => {
  const map = useMap();
  const prevPositionRef = useRef();

  useEffect(() => {
    if (busPosition) {
      const newPosition = [busPosition.lat, busPosition.lng];
      
      // Smooth transition for the map view
      map.flyTo(newPosition, zoom, {
        duration: 1,
        animate: true,
      });
      
      prevPositionRef.current = newPosition;
    }
  }, [busPosition, map, zoom]);

  return null;
};

const BusMap = ({ busId }) => {
  const [busData, setBusData] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [etas, setEtas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial bus data
  useEffect(() => {
    const fetchBusData = async () => {
      try {
        setLoading(true);
        const data = await getBusDetails(busId);
        setBusData(data);
        
        if (data.currentLocation) {
          setCurrentLocation(data.currentLocation.coordinates);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bus data:', err);
        setError('Failed to load bus data');
        setLoading(false);
      }
    };

    fetchBusData();
  }, [busId]);

  // Subscribe to location updates
  useEffect(() => {
    if (!busId) return;
    
    const unsubscribe = subscribeToBusLocation(busId, (data) => {
      if (data.etas) {
        setEtas(data.etas);
      }
      
      if (data.location) {
        setCurrentLocation(data.location.coordinates);
      }
    }, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [busId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading bus data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!busData) {
    return <div className="text-center p-4">No bus data available</div>;
  }

  const center = currentLocation || 
    (busData.path && busData.path.length > 0 
      ? [busData.path[0].lat, busData.path[0].lng] 
      : [11.0168, 76.9558]); // Default to Erode coordinates

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Bus route polyline */}
        {busData.path && busData.path.length > 0 && (
          <Polyline 
            positions={busData.path.map(p => [p.lat, p.lng])} 
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Bus stops */}
        {busData.stops && busData.stops.map((stop, index) => (
          <Marker 
            key={`stop-${index}`}
            position={[stop.coordinates.lat, stop.coordinates.lng]}
            icon={stopIcon}
          >
            <Popup>
              <div className="font-semibold">{stop.name}</div>
              <div className="text-sm text-gray-600">
                {etas.find(e => e.name === stop.name)?.eta || 'ETA: Calculating...'}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current bus location */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.lat, currentLocation.lng]}
            icon={busIcon}
          >
            <Popup>
              <div className="font-semibold">{busData.routeName}</div>
              <div className="text-sm">{busData.id}</div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </Popup>
          </Marker>
        )}

        <MapUpdater 
          busPosition={currentLocation} 
          zoom={15} 
        />
      </MapContainer>
    </div>
  );
};

export default BusMap;
