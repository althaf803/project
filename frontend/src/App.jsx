import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

import Home from './pages/Home';                 // Public landing page before login
import Movies from './pages/Movies';             // Movies listing page (protected)
import MovieDetails from './pages/MovieDetails';
import Register from './pages/Register';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';

import AdminMovies from './pages/AdminMovies';
import AdminBookings from './pages/AdminBookings';
import AdminTheaters from './pages/AdminTheaters';

import ProtectedRoute from './components/ProtectedRoute'; // Route guard

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Auto-login user if token exists
  useEffect(() => {
    async function loadUser() {
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
          navigate('/'); // redirect to public home on token failure
        }
      }
    }
    if (!user) loadUser();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/'); // Redirect to public landing page after logout
  };

  return (
    <div>
      {/* Navbar / Header */}
      <header
        style={{
          padding: '1rem',
          backgroundColor: '#333',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        {/* Brand Title linking to public landing */}
        <h1 style={{ margin: 0, fontWeight: 'bold' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Gossip
          </Link>
        </h1>

        {/* Navigation */}
        <nav style={{ marginLeft: 'auto' }}>
          {/* If no user logged in: show Login and Register */}
          {!user && (
            <>
              <Link
                to="/login"
                style={{ marginRight: '1rem', color: 'white' }}
              >
                Login
              </Link>
              <Link to="/register" style={{ color: 'white' }}>
                Register
              </Link>
            </>
          )}

          {/* If user logged in: show user-related links */}
          {user && (
            <>
              <Link
                to="/my-bookings"
                style={{ color: 'white', marginLeft: '1rem' }}
              >
                My Bookings
              </Link>
              <Link
                to="/movies"
                style={{
                  color: 'white',
                  textDecoration: 'underline',
                  marginLeft: '1rem'
                }}
              >
                Movies
              </Link>
              <button
                onClick={handleLogout}
                style={{ marginLeft: '1rem', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          )}

          {/* If user is admin: show admin links */}
          {user?.isAdmin && (
            <>
              <Link
                to="/admin/movies"
                style={{ color: 'white', marginLeft: '1rem' }}
              >
                Admin Movies
              </Link>
              <Link
                to="/admin/bookings"
                style={{ color: 'white', marginLeft: '1rem' }}
              >
                Admin Bookings
              </Link>
              <Link
                to="/admin/theaters"
                style={{ color: 'white', marginLeft: '1rem' }}
              >
                Admin Theaters
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Main content: routing */}
      <main style={{ padding: '1rem' }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes: require user login */}
          <Route
            path="/*"
            element={
              <ProtectedRoute user={user}>
                <Routes>
                  <Route path="movies" element={<Movies />} />
                  <Route path="movies/:id" element={<MovieDetails />} />
                  <Route path="my-bookings" element={<MyBookings />} />

                  {/* Admin-only routes */}
                  {user?.isAdmin && (
                    <>
                      <Route path="admin/movies" element={<AdminMovies />} />
                      <Route path="admin/bookings" element={<AdminBookings />} />
                      <Route path="admin/theaters" element={<AdminTheaters />} />
                    </>
                  )}
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
