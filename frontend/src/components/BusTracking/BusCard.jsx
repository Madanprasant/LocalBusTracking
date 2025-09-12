import React, { useEffect, useState } from 'react';
import { getBusETAs } from '../../services/busApi';

const BusCard = ({ busId, routeName, origin, destination, className = '' }) => {
  const [etas, setEtas] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format time to HH:MM AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    
    // If it's already in HH:MM AM/PM format, return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }
    
    // If it's in 24-hour format, convert to 12-hour
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Format last updated time
  const formatLastUpdated = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    
    return date.toLocaleString();
  };

  // Fetch ETAs
  useEffect(() => {
    if (!busId) return;

    const fetchETAs = async () => {
      try {
        setLoading(true);
        const data = await getBusETAs(busId);
        setEtas(data.etas || []);
        setLastUpdated(data.lastUpdated);
        setError(null);
      } catch (err) {
        console.error('Error fetching ETAs:', err);
        setError('Failed to load ETAs');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchETAs();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchETAs, 30000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [busId]);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold">{routeName || 'Bus Route'}</h2>
        <div className="flex justify-between text-sm mt-1">
          <span>{origin} → {destination}</span>
          <span className="text-blue-100">
            {lastUpdated ? `Updated ${formatLastUpdated(lastUpdated)}` : 'Loading...'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : loading ? (
          <div className="text-center py-4">Loading stops...</div>
        ) : etas.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No stops available</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 pb-2 border-b">
              <div className="col-span-7">Stop</div>
              <div className="col-span-5 text-right">ETA</div>
            </div>
            
            {etas.map((stop, index) => (
              <div 
                key={`stop-${index}`}
                className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 last:border-0"
              >
                <div className="col-span-7 flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${stop.eta === 'Passed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className={stop.eta === 'Passed' ? 'line-through text-gray-400' : ''}>
                    {stop.name}
                  </span>
                </div>
                <div className="col-span-5 text-right font-medium">
                  {stop.eta === 'Passed' ? (
                    <span className="text-green-600">Passed</span>
                  ) : stop.eta === 'Calculating...' || !stop.eta ? (
                    <span className="text-gray-400">--:--</span>
                  ) : (
                    <span className="text-blue-600">{formatTime(stop.eta)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusCard;
