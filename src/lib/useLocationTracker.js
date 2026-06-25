import { useEffect, useRef, useState } from 'react';
import { apiPost } from './api';

/**
 * Periodically ping the user's GPS location to /api/locations while active.
 *
 * - Only runs when `active` is true (e.g., clocked in)
 * - Sends a single ping every `intervalMs` (default 60s)
 * - Queues offline pings and batch-flushes when connection returns
 * - Cleans up on unmount or when `active` flips to false
 *
 * Returns: { lastFix, lastSentAt, queuedCount, error }
 */
export function useLocationTracker({ active, intervalMs = 60_000 } = {}) {
  const [lastFix, setLastFix] = useState(null);       // { lat, lng, accuracy, captured_at }
  const [lastSentAt, setLastSentAt] = useState(null); // timestamp string
  const [queuedCount, setQueuedCount] = useState(0);
  const [error, setError] = useState('');
  const watchIdRef = useRef(null);
  const lastSentPosRef = useRef(null); // { lat, lng, captured_at } — for distance-based dedupe
  const queueRef = useRef([]);          // batched pings awaiting flush
  const sendingRef = useRef(false);

  // Persist queue across page reloads
  const QUEUE_KEY = 'gt_loc_queue';
  const loadQueue = () => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      // Drop anything older than 24h
      const cutoff = Date.now() - 24 * 3600 * 1000;
      return arr.filter(p => new Date(p.captured_at).getTime() > cutoff);
    } catch { return []; }
  };
  const saveQueue = () => {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queueRef.current)); } catch {}
    setQueuedCount(queueRef.current.length);
  };

  // Flush queued pings as a batch
  const flush = async () => {
    if (sendingRef.current) return;
    if (queueRef.current.length === 0) return;
    sendingRef.current = true;
    const batch = queueRef.current.slice(0, 100); // backend handles 100 at a time
    try {
      await apiPost('/api/locations', batch);
      // Only remove the sent ones
      queueRef.current = queueRef.current.slice(batch.length);
      saveQueue();
    } catch (e) {
      // Stay queued — try again next interval
      setError(`Queue flush failed: ${e.message}`);
    } finally {
      sendingRef.current = false;
    }
  };

  // Capture a position: either store to queue (if offline) or send immediately
  const recordPosition = (pos, opts = {}) => {
    const { immediate = false } = opts;
    const ping = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy_meters: pos.coords.accuracy,
      captured_at: new Date(pos.timestamp || Date.now()).toISOString(),
    };
    setLastFix(ping);
    // Dedupe: skip if within 25m of last sent ping
    const last = lastSentPosRef.current;
    if (last && !immediate) {
      const d = distanceMeters(last.lat, last.lng, ping.lat, ping.lng);
      const timeDiff = new Date(ping.captured_at) - new Date(last.captured_at);
      // Skip if moved less than 25m AND it's been less than 5 minutes since last ping
      if (d < 25 && timeDiff < 5 * 60_000) return;
    }
    lastSentPosRef.current = ping;
    queueRef.current.push(ping);
    saveQueue();
    flush();
  };

  // Start/stop the geolocation watcher
  useEffect(() => {
    queueRef.current = loadQueue();
    saveQueue();

    if (!active) {
      // Stop watching if active flipped off
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Try to flush any remaining queue one more time
      flush();
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported on this device');
      return;
    }

    // Start a single-shot initial fix so we get one immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => recordPosition(pos, { immediate: true }),
      (err) => setError(`Initial location failed: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Then watch for movement
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => recordPosition(pos),
      (err) => setError(`Location watch failed: ${err.message}`),
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 15000, // accept a fix up to 15s old
      }
    );

    // Periodic flush of queue + minimum pings (in case device stays still, we still heartbeat)
    const interval = setInterval(() => {
      // Force a fresh reading every intervalMs so "stuck" devices still ping
      navigator.geolocation.getCurrentPosition(
        (pos) => recordPosition(pos),
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: intervalMs + 5000 }
      );
      flush();
    }, intervalMs);

    // Flush on tab close
    const onUnload = () => {
      if (queueRef.current.length > 0 && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(queueRef.current)], { type: 'application/json' });
        navigator.sendBeacon('https://grease-trappers-api.onrender.com/api/locations', blob);
      }
    };
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('online', flush);

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(interval);
      window.removeEventListener('beforeunload', onUnload);
      window.removeEventListener('online', flush);
    };
  }, [active, intervalMs]);

  return { lastFix, lastSentAt, queuedCount, error };
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}