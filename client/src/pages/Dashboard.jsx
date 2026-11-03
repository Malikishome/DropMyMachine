import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import OperatorDashboard from './OperatorDashboard.jsx';
import HostDashboard from './HostDashboard.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OPERATOR_NAV = [
  { label: 'Dashboard', active: true },
  { label: 'Browse listings', active: false },
  { label: 'My requests', active: false },
  { label: 'Messages', active: false },
  { label: 'Saved', active: false },
  { label: 'Settings', active: false },
];

const HOST_NAV = [
  { label: 'Dashboard', active: true },
  { label: 'My listings', active: false },
  { label: 'Requests', active: false },
  { label: 'Messages', active: false },
  { label: 'Settings', active: false },
];

function Dashboard() {
  const { session, logout } = useAuth();
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

  const [myListings, setMyListings] = useState(null);
  const [myListingsLoading, setMyListingsLoading] = useState(true);
  const [myListingsError, setMyListingsError] = useState(null);

  const fetchMyListings = useCallback(async (signal) => {
    try {
      const res = await fetch(`${API_URL}/api/listings/mine`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        signal,
      });
      const data = await res.json();
      if (signal?.aborted) return;
      if (!res.ok) {
        setMyListingsError(data.message || "Couldn't load your listings");
        return;
      }
      setMyListings(data.listings || []);
    } catch (err) {
      if (signal?.aborted) return;
      console.error(err);
      setMyListingsError("Couldn't reach the server. Please try again.");
    } finally {
      if (!signal?.aborted) setMyListingsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!profile || profile.role === 'operator') return undefined;
    const controller = new AbortController();
    // fetchMyListings only sets state after an await, but the lint rule can't see that.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyListings(controller.signal);
    return () => controller.abort();
  }, [profile, fetchMyListings]);

  const handleMyListingsRetry = () => {
    setMyListingsLoading(true);
    setMyListingsError(null);
    fetchMyListings();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-bg p-8">
        <p className="text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-bg p-8">
        <p className="text-muted mb-4">{profileError}</p>
        <button
          onClick={handleRetry}
          className="bg-accent text-accent-ink rounded-control px-4 py-2 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  const isOperator = profile?.role === 'operator';
  const hostPlanLabel =
    myListingsLoading || myListingsError
      ? '— of 1 listing in use'
      : `${myListings.length} of 1 listing in use`;

  return (
    <DashboardLayout
      navItems={isOperator ? OPERATOR_NAV : HOST_NAV}
      planLabel={isOperator ? '— of 5 request slots free' : hostPlanLabel}
      onLogout={handleLogout}
    >
      {isOperator ? (
        <OperatorDashboard profile={profile} />
      ) : (
        <HostDashboard
          profile={profile}
          myListings={myListings}
          myListingsLoading={myListingsLoading}
          myListingsError={myListingsError}
          onMyListingsRetry={handleMyListingsRetry}
        />
      )}
    </DashboardLayout>
  )
}

export default Dashboard;
