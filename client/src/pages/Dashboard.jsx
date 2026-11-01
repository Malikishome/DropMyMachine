import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import OperatorDashboard from './OperatorDashboard.jsx';
import HostDashboard from './HostDashboard.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard() {
  const { user, session, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const fetchProfile = useCallback(async (signal) => {
    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        signal,
      });
      const data = await res.json();
      if (signal?.aborted) return;
      if (!res.ok) {
        setProfileError(data.message || "Couldn't load your profile");
        return;
      }
      setProfile(data.profile);
    } catch (err) {
      if (signal?.aborted) return;
      console.error(err);
      setProfileError("Couldn't reach the server. Please try again.");
    } finally {
      if (!signal?.aborted) setProfileLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const controller = new AbortController();
    // fetchProfile only sets state after an await, but the lint rule can't see that.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile(controller.signal);
    return () => controller.abort();
  }, [fetchProfile]);

  const handleRetry = () => {
    setProfileLoading(true);
    setProfileError(null);
    fetchProfile();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <p className="text-gray-400">Loading your dashboard...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <p className="text-gray-400 mb-4">{profileError}</p>
        <button
          onClick={handleRetry}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">
          Logged in as {profile?.full_name || user?.email}
        </p>
        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Log out
        </button>
      </div>
      {profile?.role === 'operator' ? <OperatorDashboard /> : <HostDashboard />}
    </div>
  )
}

export default Dashboard;
