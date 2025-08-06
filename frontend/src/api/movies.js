import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchMovies() {
  const response = await axios.get(`${API_BASE_URL}/movies`);
  return response.data;
}
