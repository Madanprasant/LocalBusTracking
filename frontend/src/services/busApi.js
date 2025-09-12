import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Get bus details by ID
export const getBusDetails = async (busId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/buses/${busId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bus details:', error);
    throw error;
  }
};

// Update bus location
export const updateBusLocation = async (busId, locationData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/buses/${busId}/location`,
      locationData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating bus location:', error);
    throw error;
  }
};

// Get bus ETAs for all stops
export const getBusETAs = async (busId) => {
  if (!busId) {
    console.error('No busId provided to getBusETAs');
    throw new Error('Bus ID is required');
  }

  try {
    console.log(`Fetching ETAs for bus ${busId}...`);
    const response = await axios.get(`${API_BASE_URL}/buses/${busId}/etas`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log(`Received ETAs for bus ${busId}:`, response.data);
    return response.data;
  } catch (error) {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    };
    
    console.error('Error in getBusETAs:', errorDetails);
    
    // Return a structured error response that components can handle
    throw {
      isAxiosError: true,
      message: error.response?.data?.message || 'Failed to fetch ETAs',
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Subscribe to bus location updates
export const subscribeToBusLocation = (busId, callback, interval = 5000) => {
  if (!busId) {
    console.error('No busId provided to subscribeToBusLocation');
    return () => {}; // Return no-op cleanup function
  }

  let isActive = true;
  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  const fetchLocation = async () => {
    if (!isActive) return;

    try {
      const data = await getBusETAs(busId);
      retryCount = 0; // Reset retry count on success
      callback({ data, error: null });
    } catch (error) {
      console.error('Error in location subscription:', error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retry attempt ${retryCount}/${maxRetries} in ${retryDelay}ms...`);
        setTimeout(fetchLocation, retryDelay);
      } else {
        console.error('Max retries reached, giving up');
        callback({ 
          data: null, 
          error: {
            message: error.message || 'Failed to fetch bus location',
            status: error.status,
            retryable: error.status !== 404 // Don't retry on 404
          }
        });
      }
      return;
    }

    // Schedule next fetch if still active
    if (isActive) {
      setTimeout(fetchLocation, interval);
    }
  };

  // Initial fetch
  fetchLocation();
  
  // Return cleanup function
  return () => {
    isActive = false;
  };
};
