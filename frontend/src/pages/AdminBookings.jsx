import { useEffect, useState } from 'react';
import axios from 'axios';
import BackToMovies from '../components/BackToMovies';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    setLoading(true);
    setError('');
    if (!token) {
      setError('You must be logged in as admin to view bookings.');
      setLoading(false);
      return;
    }
    axios.get('http://localhost:5000/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data))
    .catch(err => setError(err.response?.data?.error || 'Failed to fetch bookings'))
    .finally(() => setLoading(false));
  }, [token]);

  // Admin booking cancellation handler
  function handleCancel(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Booking cancelled successfully.');
      // Remove cancelled booking from list without reload
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    })
    .catch(err => alert(err.response?.data?.error || 'Failed to cancel booking'));
  }

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
        <BackToMovies />
      <h2>All Bookings</h2>
      <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Movie</th>
            <th>Showtime</th>
            <th>Seats</th>
            <th>Booked At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td>{booking.user?.name || booking.user?.email || '-'}</td>
              <td>{booking.movie?.title || '-'}</td>
              <td>{new Date(booking.showtime).toLocaleString()}</td>
              <td>{booking.seats.join(', ')}</td>
              <td>{new Date(booking.createdAt).toLocaleString()}</td>
              <td>
                <button
                  onClick={() => handleCancel(booking._id)}
                  style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Cancel Booking
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
