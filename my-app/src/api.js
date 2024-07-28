import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

export const fetchShows = async () => {
  try {
    const response = await axios.get(`${API_URL}shows/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching shows', error);
    throw error;
  }
};