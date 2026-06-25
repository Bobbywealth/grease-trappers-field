import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock as ClockIcon, Loader2, ChevronRight,
  Briefcase, Calendar, AlertCircle
} from 'lucide-react';
import { apiGet } from '../lib/api';

const STATUS_STYLES = {
  scheduled:    'bg-gray-500/20 text-gray-300 border-gray-500/30',
  in_progress:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed:    'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled:    'bg-red-500/20 text-red-300 border-red-500/30',
};
const STATUS_LABELS = {
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet('/api/jobs/today')
      .then(data => { setJobs(Array.isArray(data) ? data : []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen max-w-md mx-auto gradient-dark">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-white/10">
        <div className="px-4 py-3 flex items-center gap-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <Link to="/" className="p-2 -ml-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-white leading-tight">Today's Jobs</h1>
            <p className="text-xs text-gray-400 leading-tight flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {today}
            </p>
          </div>
          <div className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {jobs.length}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-3 pb-24">
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            <p className="text-sm text-gray-400">Loading jobs…</p>
          </div>
        )}

        {error && (
          <div className="p-4 glass rounded-2xl border-red-500/30 animate-fade-up">
            <div className="flex items-start gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 animate-fade-up">
            <div className="relative w-24 h-24 mx-auto mb-5">
              <div className="absolute inset-0 bg-brand-copper/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 rounded-full glass-strong flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="font-bold text-white text-lg mb-1">No jobs scheduled</h3>
            <p className="text-sm text-gray-400">Enjoy the day off!</p>
          </div>
        )}

        {jobs.map((job, idx) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="group block glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.01] animate-fade-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Top accent bar */}
            <div className={`h-1 ${
              job.status === 'completed' ? 'bg-green-500' :
              job.status === 'in_progress' ? 'bg-blue-500' :
              job.status === 'cancelled' ? 'bg-red-500' :
              'bg-gradient-to-r from-brand-copper to-brand-gold'
            }`} />

            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-base leading-tight mb-1">
                    {job.customer_name || job.customer?.business_name || 'Customer'}
                  </div>
                  {job.trap_size && (
                    <div className="text-xs text-gray-400">Trap size: {job.trap_size}</div>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border whitespace-nowrap ${STATUS_STYLES[job.status] || STATUS_STYLES.scheduled}`}>
                  {STATUS_LABELS[job.status] || job.status}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                {job.scheduled_time && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-7 h-7 rounded-lg bg-brand-copper/20 flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-3.5 h-3.5 text-brand-gold" />
                    </div>
                    <span>
                      {new Date(`1970-01-01T${job.scheduled_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {(job.customer_address || job.customer?.address) && (
                  <div className="flex items-start gap-2 text-gray-300">
                    <div className="w-7 h-7 rounded-lg bg-brand-copper/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                    </div>
                    <span className="text-xs leading-relaxed">
                      {job.customer_address || job.customer?.address}{job.customer_city || job.customer?.city ? `, ${job.customer_city || job.customer?.city}` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end mt-3 pt-3 border-t border-white/10">
                <span className="text-xs text-gray-400 group-hover:text-brand-gold flex items-center gap-1 transition-colors">
                  View details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}