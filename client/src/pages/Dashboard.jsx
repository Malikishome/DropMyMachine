import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import DashboardLayout from '../components/DashboardLayout.jsx';
import SendRequestModal from '../components/SendRequestModal.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OPERATOR_NAV = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Browse listings', to: '/dashboard/browse' },
  { label: 'My requests' },
  { label: 'Messages' },
  { label: 'Saved' },
  { label: 'Settings' },
];

const HOST_NAV = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'My listings' },
  { label: 'Requests' },
  { label: 'Messages' },
  { label: 'Settings' },
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

  const saveListing = async (method, path, payload) => {
    let res;
    try {
      res = await fetch(`${API_URL}/api/listings${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error(err);
      throw new Error("Couldn't reach the server. Please try again.", { cause: err });
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.message || "Couldn't save the listing");
      error.fieldErrors = data.errors;
      throw error;
    }
    await fetchMyListings();
  };

  const handleCreateListing = (payload) => saveListing('POST', '', payload);
  const handleUpdateListing = (id, payload) => saveListing('PUT', `/${id}`, payload);

  const [myRequests, setMyRequests] = useState(null);
  const [myRequestsLoading, setMyRequestsLoading] = useState(true);
  const [myRequestsError, setMyRequestsError] = useState(null);
  const [requestingListing, setRequestingListing] = useState(null);

  const fetchMyRequests = useCallback(async (signal) => {
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        signal,
      });
      const data = await res.json();
      if (signal?.aborted) return;
      if (!res.ok) {
        setMyRequestsError(data.message || "Couldn't load your requests");
        return;
      }
      setMyRequests(data.requests || []);
    } catch (err) {
      if (signal?.aborted) return;
      console.error(err);
      setMyRequestsError("Couldn't reach the server. Please try again.");
    } finally {
      if (!signal?.aborted) setMyRequestsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (profile?.role !== 'operator') return undefined;
    const controller = new AbortController();
    // fetchMyRequests only sets state after an await, but the lint rule can't see that.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyRequests(controller.signal);
    return () => controller.abort();
  }, [profile, fetchMyRequests]);

  const handleMyRequestsRetry = () => {
    setMyRequestsLoading(true);
    setMyRequestsError(null);
    fetchMyRequests();
  };

  const handleSubmitRequest = async ({ message }) => {
    let res;
    try {
      res = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ listing_id: requestingListing.id, message }),
      });
    } catch (err) {
      console.error(err);
      throw new Error("Couldn't reach the server. Please try again.", { cause: err });
    }
    const data = await res.json().catch(() => ({}));
    // 409 means a request already exists, so the card should read as sent either way.
    if (!res.ok && res.status !== 409) {
      const error = new Error(data.message || "Couldn't send your request");
      error.fieldErrors = data.errors;
      throw error;
    }
    setRequestingListing(null);
    await fetchMyRequests();
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
      <Outlet
        context={{
          profile,
          myListings,
          myListingsLoading,
          myListingsError,
          onMyListingsRetry: handleMyListingsRetry,
          onCreateListing: handleCreateListing,
          onUpdateListing: handleUpdateListing,
          myRequests,
          myRequestsLoading,
          myRequestsError,
          onMyRequestsRetry: handleMyRequestsRetry,
          onSendRequest: setRequestingListing,
        }}
      />
      {requestingListing && (
        <SendRequestModal
          listing={requestingListing}
          onSubmit={handleSubmitRequest}
          onClose={() => setRequestingListing(null)}
        />
      )}
    </DashboardLayout>
  )
}

export default Dashboard;
