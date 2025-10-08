import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // Corrected
import BackToMovies from '../components/BackToMovies';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [theaters, setTheaters] = useState([]);
  const [theatersLoading, setTheatersLoading] = useState(true);
  const [theatersError, setTheatersError] = useState('');

  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedScreen, setSelectedScreen] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');
  const [seatLayout, setSeatLayout] = useState([]); // 2D array of seats in rows
  const [bookedSeats, setBookedSeats] = useState([]); // booked seats for showtime
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch movie details
  useEffect(() => {
    setLoading(true);
    api.get(`/api/movies/${id}`)
      .then(res => {
        console.log("Fetched movie data:", res.data);
        setMovie(res.data);
        // Reset selections now inside success
        setSelectedTheater('');
        setSelectedScreen('');
        setSelectedShowtime('');
        setSeatLayout([]);
        setBookedSeats([]);
        setSelectedSeats([]);
      })
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch all theaters to map theater IDs => names and get seat layouts
  useEffect(() => {
    setTheatersLoading(true);
    setTheatersError('');
    api.get('/api/theaters')
      .then(res => {
        console.log("Fetched theaters:", res.data);
        setTheaters(res.data);
      })
      .catch(() => setTheatersError('Failed to load theaters'))
      .finally(() => setTheatersLoading(false));
  }, []);

  // Reset downstream selection on theater change
  useEffect(() => {
    console.log("Selected Theater changed to:", selectedTheater);
    setSelectedScreen('');
    setSelectedShowtime('');
    setSeatLayout([]);
    setBookedSeats([]);
    setSelectedSeats([]);
  }, [selectedTheater]);

  // On screen change, fetch/generate seat layout for screen and reset downstream
  useEffect(() => {
    console.log("Selected Screen changed to:", selectedScreen);

    setSelectedShowtime('');
    setBookedSeats([]);
    setSelectedSeats([]);

    if (!selectedTheater || !selectedScreen) {
      setSeatLayout([]);
      return;
    }

    // Fetch seat layout for the screen from /api/theaters/:id
    api.get(`/api/theaters/${selectedTheater}`)
      .then(res => {
        const theaterData = res.data;
        console.log("Fetched theater data for seat layout:", theaterData);
        if (!theaterData || !theaterData.screens) {
          setSeatLayout([]);
          return;
        }
        const screenData = theaterData.screens.find(s => s.name === selectedScreen);
        if (!screenData) {
          console.log("Screen not found in theater screens!");
          setSeatLayout([]);
          return;
        }

        if (screenData.seatLayout && screenData.seatLayout.length > 0) {
          // Use defined seat layout
          setSeatLayout(screenData.seatLayout);
        } else {
          // Generate default seat layout from rows/seatsPerRow
          const arr = [];
          for (let r = 0; r < (screenData.rows || 0); r++) {
            const rowLabel = String.fromCharCode(65 + r); // A, B, C...
            const rowSeats = [];
            for (let s = 1; s <= (screenData.seatsPerRow || 0); s++) {
              rowSeats.push(`${rowLabel}${s}`);
            }
            arr.push(rowSeats);
          }
          setSeatLayout(arr);
        }
      })
      .catch(err => {
        console.error("Error fetching theater for seat layout:", err);
        setSeatLayout([]);
      });
  }, [selectedScreen, selectedTheater]);

  // On showtime change, fetch list of booked seats for that theater-screen-showtime
  useEffect(() => {
    console.log("Selected Showtime changed to:", selectedShowtime);

    setSelectedSeats([]);
    if (!selectedTheater || !selectedScreen || !selectedShowtime) {
      setBookedSeats([]);
      return;
    }

    api.get('/api/bookings/booked-seats', {
      params: {
        movie: id,
        theater: selectedTheater,
        screenName: selectedScreen,
        showtime: selectedShowtime,
      },
    })
      .then(res => {
        console.log("Fetched booked seats:", res.data.bookedSeats);
        setBookedSeats(res.data.bookedSeats || []);
      })
      .catch(() => setBookedSeats([]));
  }, [selectedShowtime, selectedTheater, selectedScreen, id]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const handleBook = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to book tickets.');
      return;
    }
    if (!selectedTheater || !selectedScreen || !selectedShowtime) {
      alert('Please select theater, screen, and showtime.');
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const bookingPayload = {
      movie: id,
      theater: selectedTheater,
      screenName: selectedScreen,
      showtime: selectedShowtime,
      seats: selectedSeats,
    };

    console.log("Attempting to book with payload:", bookingPayload);

    api.post('/api/bookings', bookingPayload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('Booking successful!');
        setSelectedSeats([]);
        // Refresh booked seats to update UI
        return api.get('/api/bookings/booked-seats', {
          params: {
            movie: id,
            theater: selectedTheater,
            screenName: selectedScreen,
            showtime: selectedShowtime,
          },
        });
      })
      .then(res => {
        console.log("Refreshed booked seats after booking:", res.data.bookedSeats);
        setBookedSeats(res.data.bookedSeats || []);
      })
      .catch(err => {
        console.error("Booking failed error:", err.response?.data || err.message);
        alert(err.response?.data?.error || 'Booking failed');
      });
  };

  if (loading) return <p>Loading movie details...</p>;
  if (!movie) return <p>Movie not found.</p>;
  if (theatersLoading) return <p>Loading theaters...</p>;
  if (theatersError) return <p style={{ color: 'red' }}>{theatersError}</p>;

  // Map theater IDs in movie.showtimes to names for dropdown display
  const theaterIdToName = theaters.reduce((acc, t) => {
    acc[t._id] = t.name;
    return acc;
  }, {});

  // Get distinct theaters in movie.showtimes for dropdown options
  const distinctTheaters = [...new Set(movie.showtimes.map(s => s.theater))];

  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <BackToMovies />
      <h2>{movie.title}</h2>
      <img src={movie.posterUrl} alt={movie.title} style={{ maxWidth: 300, borderRadius: 8 }} />
      <p><strong>Genre:</strong> {movie.genre}</p>
      <p><strong>Duration:</strong> {movie.duration} minutes</p>
      <p>{movie.description}</p>

      <h3>Book Tickets</h3>

      {/* Theater Select */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="theater-select">Theater:</label><br />
        <select
          id="theater-select"
          value={selectedTheater}
          onChange={e => setSelectedTheater(e.target.value)}
        >
          <option value="">Select Theater</option>
          {distinctTheaters.map(tid => (
            <option key={tid} value={tid}>
              {theaterIdToName[tid] || tid}
            </option>
          ))}
        </select>
      </div>

      {/* Screen Select */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="screen-select">Screen:</label><br />
        <select
          id="screen-select"
          value={selectedScreen}
          onChange={e => setSelectedScreen(e.target.value)}
          disabled={!selectedTheater}
        >
          <option value="">Select Screen</option>
          {selectedTheater && movie.showtimes
            .filter(s => s.theater === selectedTheater)
            .map(s => s.screenName)
            .filter((val, idx, arr) => arr.indexOf(val) === idx) // unique screens only
            .map(screen => (
              <option key={screen} value={screen}>{screen}</option>
            ))
          }
        </select>
      </div>

      {/* Showtimes Select */}
      <div style={{ marginBottom: 16 }}>
        <label>Showtime:</label><br />
        {selectedTheater && selectedScreen ? (
          movie.showtimes.find(st => st.theater === selectedTheater && st.screenName === selectedScreen)
            ?.times.map((time, idx) => (
              <button
                key={idx}
                type="button"
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  padding: '6px 12px',
                  backgroundColor: time === selectedShowtime ? '#007bff' : '#eee',
                  color: time === selectedShowtime ? '#fff' : '#333',
                  border: '1px solid #999',
                  borderRadius: 5,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedShowtime(time)}
              >
                {new Date(time).toLocaleString()}
              </button>
            ))
        ) : (
          <p>Please select theater and screen to see showtimes.</p>
        )}
      </div>

      {/* Seat Layout Visualization */}
      {seatLayout.length > 0 && (
        <>
          <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Select Seats:</div>
          <table style={{ marginBottom: 20 }}>
            <tbody>
              {seatLayout.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map(seat => {
                    const isBooked = bookedSeats.includes(seat);
                    const isSelected = selectedSeats.includes(seat);
                    return (
                      <td key={seat}>
                        <button
                          type="button"
                          disabled={isBooked}
                          onClick={() => toggleSeat(seat)}
                          style={{
                            width: 40,
                            height: 40,
                            margin: 4,
                            backgroundColor: isBooked ? '#bbb' : (isSelected ? '#2ecc40' : '#eee'),
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            borderRadius: 4,
                            border: '1px solid #777',
                            fontWeight: 'bold',
                          }}
                          title={seat}
                        >
                          {seat}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <div><span style={{ backgroundColor: '#eee', padding: '6px 12px', display: 'inline-block', borderRadius: 4, border: '1px solid #777' }}></span> Free</div>
            <div><span style={{ backgroundColor: '#2ecc40', padding: '6px 12px', display: 'inline-block', borderRadius: 4, border: '1px solid #279935' }}></span> Selected</div>
            <div><span style={{ backgroundColor: '#bbb', padding: '6px 12px', display: 'inline-block', borderRadius: 4, border: '1px solid #999' }}></span> Booked</div>
          </div>

          <button
            type="button"
            onClick={handleBook}
            disabled={selectedSeats.length === 0 || !selectedShowtime}
            style={{
              backgroundColor: selectedSeats.length === 0 || !selectedShowtime ? '#ccc' : '#007bff',
              color: selectedSeats.length === 0 || !selectedShowtime ? '#666' : '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 5,
              cursor: selectedSeats.length === 0 || !selectedShowtime ? 'not-allowed' : 'pointer',
            }}
          >
            Book Now
          </button>
        </>
      )}
    </div>
  );
}
