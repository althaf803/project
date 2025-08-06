import { Link } from 'react-router-dom';

export default function BackToMovies() {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <Link to="/" style={{ color: '#007bff', textDecoration: 'underline' }}>
        ← Back to Movies
      </Link>
    </div>
  );
}
