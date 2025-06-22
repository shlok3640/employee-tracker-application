import React, { useState, useEffect } from 'react';
import API from '../api';

const ScreenshotsAdmin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        setError('Failed to fetch users.');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const fetchScreenshots = async () => {
        setLoading(true);
        try {
          const res = await API.get(`/monitoring/screenshots/${selectedUser}`);
          setScreenshots(res.data);
          setError('');
        } catch (err) {
          setError('Failed to fetch screenshots.');
          setScreenshots([]);
        } finally {
          setLoading(false);
        }
      };
      fetchScreenshots();
    }
  }, [selectedUser]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">View Screenshots</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label htmlFor="user-select" className="mr-2">Select User:</label>
        <select
          id="user-select"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">--Select a user--</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading screenshots...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((ss) => (
          <div key={ss._id} className="border rounded-lg p-2 flex flex-col">
            <a href={ss.image} target="_blank" rel="noopener noreferrer" className="block bg-gray-100 rounded" style={{ height: '200px' }}>
              <img
                src={ss.image}
                alt={`Screenshot for ${selectedUser}`}
                className="w-full h-full object-contain"
              />
            </a>
            <p className="text-sm text-gray-600 mt-2">
              Captured at: {new Date(ss.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotsAdmin; 