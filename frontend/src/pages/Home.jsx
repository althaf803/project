import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      maxWidth: 900,
      margin: 'auto',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2c3e50' }}>Gossip</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#34495e' }}>
        Welcome to Gossip — Your ultimate destination for movie ticket bookings and exciting film experiences!
      </p>
      {/* Optional: Add a footer or some info about features here */}
    </div>
  );
}
