import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import FilterPanel from '../FilterPanel.jsx';
import ListingCards from '../ListingCards.jsx';
import ListingCardSkeleton from '../ListingCardSkeleton.jsx';

const SAMPLE_LISTING = {
  id: 'sample-1',
  machine_type: 'vending',
  city: 'Orlando',
  state: 'FL',
  description:
    'Busy hotel lobby, 24/7 access, next to the elevator bank. Great foot traffic from both guests and event bookings.',
  foot_traffic: 'high',
  revenue_split: 30,
  photo_url: null,
  status: 'active',
  created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
};

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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 max-w-3xl mt-8">
        <ListingCards {...SAMPLE_LISTING} />
        <ListingCardSkeleton />
        <ListingCardSkeleton />
      </div>
    </div>
  )
}

export default Dashboard;
