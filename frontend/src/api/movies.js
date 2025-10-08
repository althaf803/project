import api from '../api'; // Corrected

const API_BASE_URL = '/api';

export async function fetchMovies() {
  const response = await api.get(`${API_BASE_URL}/movies`);
  return response.data;
}
