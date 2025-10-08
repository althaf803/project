import { useEffect, useState } from 'react';
import api from '../api'; // Corrected
import BackToMovies from '../components/BackToMovies';

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    genre: '',
    duration: '',
    showtimes: [
      {
        theater: '',
        screenName: '',
        times: [''] // array of strings (ISO datetime)
      }
    ]
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch movies and theaters on mount
  useEffect(() => {
    fetchMovies();
    fetchTheaters();
  }, []);

  const fetchMovies = () => {
    setLoading(true);
    api.get('/api/movies')
      .then(res => setMovies(res.data))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  };

  const fetchTheaters = () => {
    api.get('/api/theaters')
      .then(res => setTheaters(res.data))
      .catch(() => setTheaters([]));
  };

  // Handle simple input changes for string/number fields
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Showtime groups handlers:
  const handleShowtimeTheaterChange = (index, theaterId) => {
    setForm(prev => {
      const copy = { ...prev };
      copy.showtimes[index].theater = theaterId;
      // reset screenName when theater changes
      copy.showtimes[index].screenName = '';
      return copy;
    });
  };

  const handleShowtimeScreenChange = (index, screenName) => {
    setForm(prev => {
      const copy = { ...prev };
      copy.showtimes[index].screenName = screenName;
      return copy;
    });
  };

  const handleShowtimeTimeChange = (groupIndex, timeIndex, value) => {
    setForm(prev => {
      const copy = { ...prev };
      copy.showtimes[groupIndex].times[timeIndex] = value;
      return copy;
    });
  };

  const addShowtimeGroup = () => {
    setForm(prev => ({
      ...prev,
      showtimes: [...prev.showtimes, { theater: '', screenName: '', times: [''] }]
    }));
  };

  const removeShowtimeGroup = (index) => {
    setForm(prev => {
      const copy = { ...prev };
      copy.showtimes.splice(index, 1);
      return copy;
    });
  };

  const addTimeToGroup = (index) => {
    setForm(prev => {
      const copy = { ...prev };
      copy.showtimes[index].times.push('');
      return copy;
    });
  };

  const removeTimeFromGroup = (groupIndex, timeIndex) => {
    setForm(prev => {
      const copy = { ...prev };
      copy.showtimes[groupIndex].times.splice(timeIndex, 1);
      return copy;
    });
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Prepare payload:
    const movieData = {
      title: form.title.trim(),
      description: form.description.trim(),
      posterUrl: form.posterUrl.trim(),
      genre: form.genre.trim(),
      duration: Number(form.duration),
      showtimes: form.showtimes
        .filter(g => g.theater && g.screenName && g.times.length > 0)
        .map(g => ({
          theater: g.theater,
          screenName: g.screenName,
          times: g.times
            .filter(t => t)
            .map(t => new Date(t).toISOString())
        }))
        .filter(g => g.times.length > 0) // Remove groups with empty times
    };

    if (!movieData.title || !movieData.description) {
      setError('Title and description are required');
      return;
    }

    if (movieData.showtimes.length === 0) {
      setError('At least one showtime group with valid times is required');
      return;
    }

    if (editId) {
      api.put(`/api/movies/${editId}`, movieData, config)
        .then(() => {
          resetForm();
          fetchMovies();
          alert('Movie updated');
        })
        .catch(err => setError(err.response?.data?.error || 'Failed to update movie'));
    } else {
      api.post('/api/movies', movieData, config)
        .then(() => {
          resetForm();
          fetchMovies();
          alert('Movie added');
        })
        .catch(err => setError(err.response?.data?.error || 'Failed to add movie'));
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      posterUrl: '',
      genre: '',
      duration: '',
      showtimes: [{ theater: '', screenName: '', times: [''] }]
    });
    setEditId(null);
    setError('');
  };

  // Edit existing movie — populate form with correct showtimes shape
  const handleEdit = (movie) => {
    setEditId(movie._id);
    setForm({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl || '',
      genre: movie.genre || '',
      duration: movie.duration || '',
      showtimes: movie.showtimes.length > 0 ? movie.showtimes.map(g => ({
        theater: g.theater ? String(g.theater) : '',
        screenName: g.screenName || '',
        times: g.times.length > 0 ? g.times.map(t => new Date(t).toISOString().slice(0, 16)) : ['']
      })) : [{ theater: '', screenName: '', times: [''] }]
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    api.delete(`/api/movies/${id}`, config)
      .then(() => {
        fetchMovies();
        alert('Movie deleted');
      })
      .catch(err => alert(err.response?.data?.error || 'Failed to delete movie'));
  };


  return (
    <div style={{ maxWidth: 900, margin: 'auto' }}>
      <BackToMovies />
      <h2>Admin Movie Management</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div><label>Title *</label><br />
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>

        <div><label>Description *</label><br />
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </div>

        <div><label>Poster URL</label><br />
          <input name="posterUrl" value={form.posterUrl} onChange={handleChange} />
        </div>

        <div><label>Genre</label><br />
          <input name="genre" value={form.genre} onChange={handleChange} />
        </div>

        <div><label>Duration (minutes)</label><br />
          <input type="number" name="duration" value={form.duration} onChange={handleChange} />
        </div>

        <div style={{ marginTop: 20, marginBottom: 10 }}>
          <label>Showtimes</label><br />
          {form.showtimes.map((group, idx) => {
            const selectedTheater = theaters.find(t => t._id === group.theater);
            return (
              <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: 15 }}>
                <div>
                  <label>Theater:</label><br />
                  <select
                    value={group.theater}
                    onChange={(e) => handleShowtimeTheaterChange(idx, e.target.value)}
                    required
                  >
                    <option value="">Select Theater</option>
                    {theaters.map(th => <option key={th._id} value={th._id}>{th.name}</option>)}
                  </select>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label>Screen:</label><br />
                  <select
                    value={group.screenName}
                    onChange={(e) => handleShowtimeScreenChange(idx, e.target.value)}
                    required
                    disabled={!selectedTheater}
                  >
                    <option value="">Select Screen</option>
                    {selectedTheater?.screens.map(screen => (
                      <option key={screen.name} value={screen.name}>{screen.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label>Showtimes:</label><br />
                  {group.times.map((time, tIdx) => (
                    <div key={tIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                      <input
                        type="datetime-local"
                        value={time}
                        onChange={e => handleShowtimeTimeChange(idx, tIdx, e.target.value)}
                        required
                      />
                      {group.times.length > 1 &&
                        <button type="button" onClick={() => removeTimeFromGroup(idx, tIdx)} style={{ marginLeft: 6 }}>Remove</button>
                      }
                    </div>
                  ))}
                  <button type="button" onClick={() => addTimeToGroup(idx)} style={{ marginTop: 6 }}>
                    Add Showtime
                  </button>
                </div>

                {form.showtimes.length > 1 && (
                  <button type="button" onClick={() => removeShowtimeGroup(idx)} style={{ marginTop: 10, background: 'red', color: 'white' }}>
                    Remove This Group
                  </button>
                )}
              </div>
            );
          })}

          <button type="button" onClick={addShowtimeGroup}>
            Add Showtimes Group
          </button>
        </div>

        <button type="submit" style={{ marginTop: '1rem' }}>
          {editId ? 'Update Movie' : 'Add Movie'}
        </button>
        {editId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '1rem' }}>
            Cancel Edit
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading movies...</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Genre</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie._id}>
                <td>{movie.title}</td>
                <td>{movie.genre || '-'}</td>
                <td>{movie.duration || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(movie)}>Edit</button>
                  <button onClick={() => handleDelete(movie._id)} style={{ marginLeft: '1rem' }}>Delete</button>
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No movies found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

