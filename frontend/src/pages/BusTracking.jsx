import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BusMap from '../components/BusTracking/BusMap';
import BusCard from '../components/BusTracking/BusCard';
import { getBusDetails } from '../services/busApi';
import DriverSimulator from '../utils/driverSimulator';

const BusTracking = () => {
  const { busId } = useParams();
  const [busData, setBusData] = useState(null);
  const [simulator, setSimulator] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [speed, setSpeed] = useState(40);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bus details
  useEffect(() => {
    const fetchBusData = async () => {
      if (!busId) {
        console.error('No busId provided');
        setError('No bus ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching bus data for ID: ${busId}`);
        setLoading(true);
        setError(null);
        
        const data = await getBusDetails(busId);
        console.log('Received bus data:', data);
        
        if (!data) {
          throw new Error('No data received from server');
        }
        
        setBusData(data);
      } catch (err) {
        console.error('Error in fetchBusData:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(`Failed to load bus data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBusData();
  }, [busId]);

  // Initialize simulator when bus data is loaded
  useEffect(() => {
    if (!busData || !busData.path || busData.path.length === 0) return;

    const newSimulator = new DriverSimulator(busId, busData.path, 5000);
    setSimulator(newSimulator);

    // Clean up on unmount
    return () => {
      if (newSimulator) {
        newSimulator.stop();
      }
    };
  }, [busData, busId]);

  // Toggle simulation
  const toggleSimulation = () => {
    if (!simulator) return;

    if (isSimulating) {
      simulator.stop();
    } else {
      simulator.start();
    }
    setIsSimulating(!isSimulating);
  };

  // Handle speed change
  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value, 10);
    setSpeed(newSpeed);
    if (simulator) {
      simulator.setSpeed(newSpeed);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading bus details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error || 'Bus not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Map */}
        <div className="lg:w-2/3 h-[600px] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
          <BusMap 
            busId={busId}
            className="h-full w-full"
          />
        </div>

        {/* Right side - Bus card and controls */}
        <div className="lg:w-1/3 space-y-6">
          <BusCard 
            busId={busId}
            routeName={busData.routeName}
            origin={busData.origin}
            destination={busData.destination}
            className="w-full"
          />

          {/* Simulation controls */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4">Simulation Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speed: {speed} km/h
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="w-full"
                  disabled={!isSimulating}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10 km/h</span>
                  <span>120 km/h</span>
                </div>
              </div>

              <button
                onClick={toggleSimulation}
                className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                  isSimulating 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </button>

              <div className="text-sm text-gray-600 mt-2">
                <p className="font-medium">How to use:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Click "Start Simulation" to begin the bus journey</li>
                  <li>Adjust the speed using the slider</li>
                  <li>Track the bus movement on the map</li>
                  <li>View ETAs for upcoming stops in the card</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTracking;
