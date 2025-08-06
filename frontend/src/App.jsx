import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminMovies from './pages/AdminMovies';
import AdminBookings from './pages/AdminBookings';
import AdminTheaters from './pages/AdminTheaters';

import axios from 'axios';
import MyBookings from './pages/MyBookings';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Auto-login user if token exists
  useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        // Token invalid or expired, clear it
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  };
  if (!user) loadUser();
}, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div>
      <header style={{ padding: '1rem', backgroundColor: '#333', color: 'white',display: 'flex', alignItems: 'center', gap: '1rem'}}>
        <h1>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Movie Ticket Booking
          </Link>
        </h1>
        <nav style={{ marginLeft: 'auto' }}>
          {user ? (
            <>
              <button onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: '1rem', color: 'white' }}>
                Login
              </Link>
              <Link to="/register" style={{ color: 'white' }}>
                Register
              </Link>
            </>
          )}
          {user && (
            <>
            <Link to="/my-bookings" style={{ color: 'white', marginLeft: '1rem' }}>
              My Bookings
            </Link>
            <Link to="/" style={{ color: 'white', textDecoration: 'underline' ,marginLeft: '1rem'}}>
              Movies
            </Link>
            </>
          )}
          
          {user?.isAdmin && (
            <>
              <Link to="/admin/movies" style={{ color: 'white', marginLeft: '1rem' }}>
                Admin Movies
              </Link>
              <Link to="/admin/bookings" style={{ color: 'white', marginLeft: '1rem' }}>
                Admin Bookings
              </Link>
              <Link to="/admin/theaters" style={{ color: 'white', marginLeft: '1rem' }}>
                Admin Theaters
              </Link>
           </>
          )}
        </nav>
      </header>

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin/movies" element={<AdminMovies />} />
          <Route path="/admin/theaters" element={<AdminTheaters />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
