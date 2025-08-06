import { useEffect, useState } from 'react';
import axios from 'axios';
import BackToMovies from '../components/BackToMovies';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setBookings([]);
      setLoading(false);
      return;
    }
    axios
      .get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  // Function to cancel a booking
  function handleCancel(bookingId) {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('Booking cancelled.');
      setBookings(prev => prev.filter(b => b._id !== bookingId)); // Remove cancelled booking from list
    })
    .catch(err => alert(err.response?.data?.error || 'Failed to cancel booking'));
  }

  if (loading) return <p>Loading your bookings...</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div>
        <BackToMovies />
      <h2>My Bookings</h2>
      <ul>
        {bookings.map(booking => (
          <li key={booking._id} style={{ marginBottom: "1.5rem" }}>
            <strong>Movie:</strong> {booking.movie?.title || '-'}<br />
            <strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}<br />
            <strong>Seats:</strong> {booking.seats.join(', ')}<br />
            <small>Booked at: {new Date(booking.createdAt).toLocaleString()}</small><br />
            <button onClick={() => handleCancel(booking._id)} style={{ marginTop: '0.5rem' }}>
              Cancel Booking
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
