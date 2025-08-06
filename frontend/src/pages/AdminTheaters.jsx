import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminTheaters() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // Form state for new theater
  const [form, setForm] = useState({
    name: '',
    address: '',
    screens: [
      { name: '', rows: '', seatsPerRow: '' }
    ]
  });

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = () => {
    setLoading(true);
    setError('');
    axios.get('http://localhost:5000/api/theaters')
      .then(res => setTheaters(res.data))
      .catch(() => setError('Failed to load theaters'))
      .finally(() => setLoading(false));
  };

  // Handle form changes
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Screen input changes
  const handleScreenChange = (index, e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const newScreens = [...prev.screens];
      newScreens[index] = { ...newScreens[index], [name]: value };
      return { ...prev, screens: newScreens };
    });
  };

  // Add/remove screen
  const addScreen = () => {
    setForm(prev => ({
      ...prev,
      screens: [...prev.screens, { name: '', rows: '', seatsPerRow: '' }]
    }));
  };

  const removeScreen = (index) => {
    setForm(prev => {
      const newScreens = [...prev.screens];
      newScreens.splice(index, 1);
      return { ...prev, screens: newScreens };
    });
  };

  // Submit new theater
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!form.name.trim()) {
      setError('Theater name is required');
      return;
    }
    for (const screen of form.screens) {
      if (!screen.name.trim() || !screen.rows || !screen.seatsPerRow) {
        setError('All screen fields are required');
        return;
      }
      if (isNaN(screen.rows) || isNaN(screen.seatsPerRow)) {
        setError('Rows and Seats per row must be numbers');
        return;
      }
    }

    // Prepare data with numeric rows & seatsPerRow
    const dataToSend = {
      name: form.name.trim(),
      address: form.address.trim(),
      screens: form.screens.map(s => ({
        name: s.name.trim(),
        rows: Number(s.rows),
        seatsPerRow: Number(s.seatsPerRow)
      }))
    };

    axios.post('http://localhost:5000/api/theaters', dataToSend, config)
      .then(() => {
        alert('Theater added successfully');
        setForm({
          name: '',
          address: '',
          screens: [{ name: '', rows: '', seatsPerRow: '' }]
        });
        fetchTheaters();
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to add theater');
      });
  };

  return (
    <div style={{ maxWidth: 700, margin: 'auto' }}>
      <h2>Admin Theater Management</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <div>
          <label>Theater Name *</label><br />
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Address</label><br />
          <input name="address" value={form.address} onChange={handleChange} />
        </div>

        <h3>Screens</h3>
        {form.screens.map((screen, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, borderRadius: 5 }}>
            <div>
              <label>Screen Name *</label><br />
              <input
                name="name"
                value={screen.name}
                onChange={(e) => handleScreenChange(idx, e)}
                required
              />
            </div>
            <div>
              <label>Rows *</label><br />
              <input
                name="rows"
                type="number"
                min="1"
                value={screen.rows}
                onChange={(e) => handleScreenChange(idx, e)}
                required
              />
            </div>
            <div>
              <label>Seats Per Row *</label><br />
              <input
                name="seatsPerRow"
                type="number"
                min="1"
                value={screen.seatsPerRow}
                onChange={(e) => handleScreenChange(idx, e)}
                required
              />
            </div>
            {form.screens.length > 1 && (
              <button
                type="button"
                onClick={() => removeScreen(idx)}
                style={{ marginTop: 8, backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
              >
                Remove Screen
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addScreen} style={{ marginBottom: 16 }}>
          Add Screen
        </button><br />

        <button type="submit" style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '1rem' }}>
          Save Theater
        </button>
      </form>

      <h3>Existing Theaters</h3>
      {loading ? (
        <p>Loading theaters...</p>
      ) : (
        <ul>
          {theaters.map(t => (
            <li key={t._id}>
              <strong>{t.name}</strong> - {t.address || 'No address'}
              <ul>
                {t.screens.map(screen => (
                  <li key={screen._id}>{screen.name} - Rows: {screen.rows}, Seats/Row: {screen.seatsPerRow}</li>
                ))}
              </ul>
            </li>
          ))}
          {theaters.length === 0 && <li>No theaters added yet.</li>}
        </ul>
      )}
    </div>
  );
}
