import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock as ClockIcon, CheckCircle, Loader2, Camera,
  Phone, FileText, Play, CheckCheck, Trash2, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';

const STATUS_STYLES = {
  scheduled:    { bg: 'bg-gray-500/20',  text: 'text-gray-300',  border: 'border-gray-500/30',  label: 'Scheduled' },
  in_progress:  { bg: 'bg-blue-500/20',  text: 'text-blue-300',  border: 'border-blue-500/30',  label: 'In progress' },
  completed:    { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', label: 'Completed' },
  cancelled:    { bg: 'bg-red-500/20',   text: 'text-red-300',   border: 'border-red-500/30',   label: 'Cancelled' },
};

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const fetchJob = async () => {
    try {
      const data = await apiGet(`/api/jobs/${id}`);
      setJob(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const start = async () => {
    setBusy(true); setError('');
    try {
      await apiPost(`/api/jobs/${id}/start`, {});
      await fetchJob();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const complete = async () => {
    setBusy(true); setError('');
    try {
      await apiPost(`/api/jobs/${id}/complete`, {});
      await fetchJob();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center max-w-md mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen p-4 max-w-md mx-auto">
        <Link to="/jobs" className="text-brand-gold flex items-center gap-1">← Back</Link>
        <div className="mt-4 p-4 glass rounded-2xl text-red-300">{error || 'Job not found'}</div>
      </div>
    );
  }

  const customerName = job.customer_name || job.business_name || 'Customer';
  const address = job.address || job.customer_address;
  const city = job.city || job.customer_city;
  const status = STATUS_STYLES[job.status] || STATUS_STYLES.scheduled;
  const fullAddress = [address, city, job.state].filter(Boolean).join(', ');
  const mapsUrl = fullAddress ? `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}` : null;

  return (
    <div className="min-h-screen max-w-md mx-auto gradient-dark pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <Link to="/jobs" className="p-2 -ml-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-white leading-tight">Job #{job.id}</h1>
            <p className="text-xs text-gray-400 leading-tight">{status.label}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-start gap-2 animate-fade-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Hero card — customer + status */}
        <div className="relative overflow-hidden rounded-3xl animate-fade-up">
          <div className={`absolute inset-0 ${status.bg}`} />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-copper/10 via-transparent to-brand-gold/10" />
          <div className="relative p-6 text-white">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.text} ${status.border} mb-3`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                job.status === 'completed' ? 'bg-green-400' :
                job.status === 'in_progress' ? 'bg-blue-400' :
                job.status === 'cancelled' ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              {status.label}
            </div>

            <h2 className="text-2xl font-bold mb-3 leading-tight">{customerName}</h2>

            {fullAddress && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 mb-3 group"
              >
                <div className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Address</div>
                  <div className="text-sm text-white group-hover:text-brand-gold transition-colors leading-snug">
                    {fullAddress}
                  </div>
                </div>
              </a>
            )}

            {job.contact_phone && (
              <a href={`tel:${job.contact_phone}`} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-brand-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-0.5">Contact</div>
                  <div className="text-sm text-white group-hover:text-brand-gold transition-colors">
                    {job.contact_phone}
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Job details grid */}
        <div className="grid grid-cols-2 gap-3 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          {job.scheduled_time && (
            <div className="glass rounded-2xl p-4">
              <ClockIcon className="w-4 h-4 text-brand-gold mb-2" />
              <div className="text-xs text-gray-400 mb-1">Scheduled</div>
              <div className="font-bold text-white text-sm">
                {new Date(`1970-01-01T${job.scheduled_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}
          {job.trap_size && (
            <div className="glass rounded-2xl p-4">
              <div className="text-xs text-brand-gold mb-1 font-bold">TRAP SIZE</div>
              <div className="font-bold text-white text-sm">{job.trap_size}</div>
            </div>
          )}
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="glass rounded-2xl p-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Notes</span>
            </div>
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{job.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {job.status === 'scheduled' && (
            <button
              onClick={start}
              disabled={busy}
              className="group relative w-full overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 gradient-copper group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative px-6 py-4 flex items-center justify-center gap-2 text-white font-bold text-base">
                {busy ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                <span>Start Job</span>
              </div>
            </button>
          )}

          {job.status === 'in_progress' && (
            <>
              <label className="block cursor-pointer">
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                <div className="w-full glass border-2 border-dashed border-white/20 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-brand-copper hover:bg-white/10 transition-all">
                  {photoPreview ? (
                    <>
                      <ImageIcon className="w-8 h-8 text-brand-gold" />
                      <span className="text-sm text-white font-medium">Photo captured ✓</span>
                      <span className="text-xs text-gray-400">Tap to retake</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gold rounded-full" />
                      </div>
                      <span className="text-sm text-white font-medium">Take Before/After Photo</span>
                      <span className="text-xs text-gray-400">Tap to open camera</span>
                    </>
                  )}
                </div>
              </label>

              {photoPreview && (
                <div className="relative group">
                  <img src={photoPreview} alt="preview" className="w-full rounded-2xl border border-white/10" />
                  <button
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 p-2 bg-red-500/90 backdrop-blur rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={complete}
                disabled={busy}
                className="group relative w-full overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="relative px-6 py-4 flex items-center justify-center gap-2 text-white font-bold text-base">
                  {busy ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-5 h-5" />
                  )}
                  <span>Mark Complete</span>
                </div>
              </button>
            </>
          )}

          {job.status === 'completed' && (
            <div className="glass rounded-2xl p-6 text-center bg-green-500/10 border-green-500/20 animate-fade-up">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl" />
                <div className="relative w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">Job complete</h3>
              <p className="text-sm text-gray-400">Great work. On to the next one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}