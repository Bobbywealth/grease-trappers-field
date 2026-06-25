import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock as ClockIcon, MapPin, LogOut, Briefcase, Loader2, CheckCircle,
  Activity, Wifi, WifiOff, Bell, ChevronRight, PlayCircle, StopCircle
} from 'lucide-react';
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
  const [now, setNow] = useState(new Date());

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
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
    return (
      <Screen>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      </Screen>
    );
  }

  const elapsedMs = shift ? now - new Date(shift.clock_in_at) : 0;
  const elapsedH = Math.floor(elapsedMs / 3_600_000);
  const elapsedM = Math.floor((elapsedMs % 3_600_000) / 60_000);

  return (
    <Screen>
      {/* Glassy header */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Grease Trappers" className="h-8 w-auto" />
            <div>
              <div className="font-bold text-sm text-white leading-tight">Field Crew</div>
              <div className="text-xs text-gray-400 leading-tight">{user?.name}</div>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => { logout(); nav('/login'); }}
              className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm animate-fade-up">
            {error}
          </div>
        )}

        {/* Hero clock card */}
        <div className="relative overflow-hidden rounded-3xl">
          {shift && (
            <>
              <div className="absolute inset-0 gradient-copper" />
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3), transparent 50%)'
              }} />
            </>
          )}
          {!shift && (
            <>
              <div className="absolute inset-0 glass-strong" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-copper/10 via-transparent to-brand-gold/5" />
            </>
          )}
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              {shift ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold opacity-90">On the clock</span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Off the clock</span>
                </>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-5xl font-extrabold tracking-tight tabular-nums">
                {shift
                  ? `${String(elapsedH).padStart(2, '0')}:${String(elapsedM).padStart(2, '0')}`
                  : '--:--'}
              </div>
              <div className="text-sm font-medium opacity-70 mb-1">
                {shift ? 'elapsed' : 'today'}
              </div>
            </div>

            {shift ? (
              <div className="flex items-center gap-1.5 text-xs opacity-80 mb-5">
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Started at {new Date(shift.clock_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-400 mb-5">
                Tap below to start your shift with GPS
              </div>
            )}

            {shift?.clock_in_address && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 mb-4">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">{shift.clock_in_address}</div>
              </div>
            )}

            <button
              onClick={shift ? clockOut : clockIn}
              disabled={busy}
              className={`group w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${
                shift
                  ? 'bg-white text-brand-copper hover:bg-gray-50 shadow-xl shadow-black/30'
                  : 'gradient-copper text-white shadow-xl shadow-brand-copper/40 hover:shadow-brand-copper/60 hover:scale-[1.02]'
              }`}
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : shift ? (
                <StopCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span>{shift ? 'Clock Out' : 'Clock In'}</span>
            </button>
          </div>
        </div>

        {/* Live tracking status */}
        {shift && (
          <div className="glass rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="absolute inset-0 animate-ping opacity-75">
                    <Activity className="w-4 h-4 text-green-400" />
                  </span>
                </div>
                <span className="font-semibold text-sm text-white">Live tracking</span>
              </div>
              {tracking.lastFix ? (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Wifi className="w-3 h-3" />
                  Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <WifiOff className="w-3 h-3" />
                  Connecting
                </span>
              )}
            </div>
            <div className="space-y-1.5 text-xs text-gray-400">
              {tracking.lastFix ? (
                <>
                  <div className="flex justify-between">
                    <span>Last ping</span>
                    <span className="text-white font-medium">
                      {new Date(tracking.lastFix.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {tracking.lastFix.accuracy_meters && (
                    <div className="flex justify-between">
                      <span>Accuracy</span>
                      <span className="text-white font-medium">±{Math.round(tracking.lastFix.accuracy_meters)}m</span>
                    </div>
                  )}
                </>
              ) : (
                <div>Acquiring GPS signal…</div>
              )}
              {tracking.queuedCount > 0 && (
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-amber-400">Queued (offline)</span>
                  <span className="text-amber-400 font-medium">{tracking.queuedCount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Today's jobs shortcut */}
        <Link
          to="/jobs"
          className="group glass rounded-2xl p-5 flex items-center gap-4 hover:bg-white/10 transition-all hover:scale-[1.01]"
        >
          <div className="relative w-14 h-14 rounded-2xl gradient-copper flex items-center justify-center shadow-lg shadow-brand-copper/30">
            <Briefcase className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gold rounded-full animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-base">Today's Jobs</div>
            <div className="text-sm text-gray-400">View scheduled work</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-gold group-hover:translate-x-1 transition-all" />
        </Link>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shift</div>
            <div className="text-2xl font-bold text-white">
              {shift ? `${elapsedH}h ${elapsedM}m` : '0h 0m'}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Today</div>
            <div className="text-2xl font-bold text-brand-gold">
              {now.toLocaleDateString([], { weekday: 'short' })}
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div className="min-h-screen max-w-md mx-auto gradient-dark">
      {children}
    </div>
  );
}