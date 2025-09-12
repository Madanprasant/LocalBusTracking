import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getBuses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/buses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching buses:', error);
    throw error;
  }
};
