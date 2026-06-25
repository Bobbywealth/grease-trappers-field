import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock as ClockIcon, MapPin, LogOut, Briefcase, Loader2, CheckCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../lib/api';
import { useLocationTracker } from '../lib/useLocationTracker';

export default function Clock() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Start tracking whenever there's an open shift
  const tracking = useLocationTracker({ active: !!shift, intervalMs: 60_000 });

  const fetchShift = async () => {
    try {
      const data = await apiGet('/api/time-clock/me');
      setShift(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShift(); }, []);

  const clockIn = async () => {
    setBusy(true); setError('');
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      }).catch(() => null);
      await apiPost('/api/time-clock/clock-in', {
        lat: pos?.coords?.latitude,
        lng: pos?.coords?.longitude,
      });
      await fetchShift();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    setBusy(true); setError('');
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      }).catch(() => null);
      await apiPost('/api/time-clock/clock-out', {
        lat: pos?.coords?.latitude,
        lng: pos?.coords?.longitude,
      });
      setShift(null);
      await fetchShift();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Screen><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-copper" /></div></Screen>;
  }

  return (
    <Screen>
      <header className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-copper flex items-center justify-center">
            <ClockIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm">Field Crew</div>
            <div className="text-xs text-gray-500">{user?.name}</div>
          </div>
        </div>
        <button onClick={() => { logout(); nav('/login'); }} className="p-2 text-gray-500 hover:text-gray-900">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {/* Clock card */}
        <div className="bg-gradient-to-br from-brand-copper to-brand-sienna rounded-2xl p-6 text-white">
          <div className="text-xs uppercase tracking-wider opacity-80 mb-1">
            {shift ? 'On the clock' : 'Not on the clock'}
          </div>
          <div className="text-3xl font-bold mb-4">
            {shift ? new Date(shift.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </div>
          {shift?.clock_in_address && (
            <div className="flex items-center gap-1 text-xs opacity-80 mb-4">
              <MapPin className="w-3 h-3" />
              {shift.clock_in_address}
            </div>
          )}
          {shift ? (
            <button onClick={clockOut} disabled={busy}
              className="w-full bg-white text-brand-copper font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
              Clock Out
            </button>
          ) : (
            <button onClick={clockIn} disabled={busy}
              className="w-full bg-white text-brand-copper font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Clock In
            </button>
          )}
        </div>

        {/* Live tracking status */}
        {shift && (
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-sm text-gray-900">Live tracking active</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {tracking.lastFix ? (
                <>
                  <div>Last fix: {new Date(tracking.lastFix.captured_at).toLocaleTimeString()}</div>
                  {tracking.lastFix.accuracy_meters && (
                    <div>Accuracy: ±{Math.round(tracking.lastFix.accuracy_meters)}m</div>
                  )}
                </>
              ) : (
                <div>Acquiring GPS...</div>
              )}
              {tracking.queuedCount > 0 && (
                <div className="text-amber-600">{tracking.queuedCount} ping(s) queued for upload</div>
              )}
            </div>
          </div>
        )}

        {/* Quick links */}
        <Link to="/jobs" className="block bg-white rounded-2xl p-5 border border-gray-200 hover:border-brand-copper transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-copper/10 text-brand-copper flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Today's Jobs</div>
              <div className="text-sm text-gray-500">View scheduled work</div>
            </div>
          </div>
        </Link>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto">
      {children}
    </div>
  );
}