import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock as ClockIcon, CheckCircle, Loader2, Camera } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';

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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-pink" /></div>;
  }

  if (!job) {
    return (
      <div className="min-h-screen p-4">
        <Link to="/jobs" className="text-brand-pink">← Back</Link>
        <div className="mt-4 text-red-600">{error || 'Job not found'}</div>
      </div>
    );
  }

  const customerName = job.customer_name || job.business_name || 'Customer';
  const address = job.address || job.customer_address;
  const city = job.city || job.customer_city;

  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto">
      <header className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/jobs" className="p-1"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-semibold">Job #{job.id}</h1>
      </header>

      <div className="p-4 space-y-4">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="font-bold text-lg mb-1">{customerName}</div>
          {address && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4" />
              {address}{city ? `, ${city}` : ''} {job.state || ''}
            </div>
          )}
          {job.contact_phone && (
            <a href={`tel:${job.contact_phone}`} className="text-sm text-brand-pink">📞 {job.contact_phone}</a>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              job.status === 'completed' ? 'bg-green-100 text-green-700' :
              job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>{job.status.replace('_',' ').toUpperCase()}</span>
          </div>
        </div>

        {job.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="text-xs uppercase tracking-wider text-yellow-800 mb-1 font-semibold">Notes</div>
            <div className="text-sm text-gray-700">{job.notes}</div>
          </div>
        )}

        <div className="space-y-3">
          {job.status === 'scheduled' && (
            <button onClick={start} disabled={busy}
              className="w-full bg-brand-pink text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Start Job
            </button>
          )}
          {job.status === 'in_progress' && (
            <>
              <label className="block">
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl py-6 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-pink transition-colors">
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">
                    {photoPreview ? 'Photo captured ✓' : 'Take Before/After Photo'}
                  </span>
                </div>
              </label>
              {photoPreview && (
                <img src={photoPreview} alt="preview" className="w-full rounded-2xl" />
              )}
              <button onClick={complete} disabled={busy}
                className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Mark Complete
              </button>
            </>
          )}
          {job.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-green-900">Job complete</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}