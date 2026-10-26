import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-900">
      <h1 className="text-4xl font-bold text-white">COMING SOON 😀</h1>
      <p className="text-gray-400">Logged in as {user?.email}</p>
      <button
        onClick={handleLogout}
        className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Log out
      </button>
    </div>
  )
}

export default Dashboard;
