import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import FilterPanel from '../FilterPanel.jsx';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">Logged in as {user?.email}</p>
        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log out
        </button>
      </div>
      <div className="grid grid-cols-[260px_1fr] gap-6 max-w-3xl">
        <FilterPanel onChange={setFilters} />
        <pre className="text-xs text-gray-400 bg-gray-800 rounded p-4 overflow-auto h-fit">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default Dashboard;
