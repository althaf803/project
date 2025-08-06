import { useState, useEffect } from 'react';
import { fetchMovies } from '../api/movies';
import { Link } from 'react-router-dom';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies()
      .then(data => setMovies(data))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading movies...</p>;

  if (movies.length === 0) return <p>No movies available.</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
      {movies.map(movie => (
        <div key={movie._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', borderRadius: '4px' }} />
          <h3>{movie.title}</h3>
          <p>{movie.genre} | {movie.duration} min</p>
          <Link to={`/movies/${movie._id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
}
