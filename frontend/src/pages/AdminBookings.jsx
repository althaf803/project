import { useEffect, useState } from 'react';
import api from '../api';
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
    api
      .get('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setBookings(res.data))
      .catch(err => {
        // Show a more specific error if they are not admin!
        if (
          err.response &&
          (err.response.status === 401 ||
            err.response.status === 403 ||
            err.response?.data?.error?.toLowerCase().includes('admin'))
        ) {
          setError('Admin access required to view all bookings.');
        } else {
          setError(err.response?.data?.error || 'Failed to fetch bookings');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Admin booking cancellation handler
  function handleCancel(bookingId) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    api
      .delete(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert('Booking cancelled successfully.');
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      })
      .catch(err =>
        alert(err.response?.data?.error || 'Failed to cancel booking')
      );
  }

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (bookings.length === 0)
    return (
      <div style={{ maxWidth: 900, margin: 'auto' }}>
        <BackToMovies />
        <h2>All Bookings</h2>
        <p>No bookings found.</p>
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <BackToMovies />
      <h2>All Bookings</h2>
      <table
        border={1}
        cellPadding={8}
        style={{ width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            <th>User</th>
            <th>Movie</th>
            <th>Theater</th>
            <th>Screen</th>
            <th>Showtime</th>
            <th>Seats</th>
            <th>Booked At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(booking => (
            <tr key={booking._id}>
              <td>
                {booking.user?.name ||
                  booking.user?.email ||
                  booking.user?._id ||
                  '-'}
              </td>
              <td>{booking.movie?.title || booking.movie?._id || '-'}</td>
              <td>
                {booking.theater?.name || booking.theater?._id || '-'}
              </td>
              <td>{booking.screenName || '-'}</td>
              <td>
                {booking.showtime
                  ? new Date(booking.showtime).toLocaleString()
                  : '-'}
              </td>
              <td>{Array.isArray(booking.seats) ? booking.seats.join(', ') : '-'}</td>
              <td>
                {booking.createdAt
                  ? new Date(booking.createdAt).toLocaleString()
                  : '-'}
              </td>
              <td>
                <button
                  onClick={() => handleCancel(booking._id)}
                  style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
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
