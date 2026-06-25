import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock as ClockIcon, Loader2, ChevronRight } from 'lucide-react';
import { apiGet } from '../lib/api';

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

  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto">
      <header className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <Link to="/" className="p-1"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-semibold">Today's Jobs</h1>
      </header>

      <div className="p-4 space-y-3">
        {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-copper" /></div>}
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No jobs scheduled</p>
            <p className="text-sm">Enjoy the day off!</p>
          </div>
        )}
        {jobs.map(job => (
          <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-white rounded-2xl p-4 border border-gray-200 hover:border-brand-copper transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-gray-900">{job.customer_name || job.customer?.business_name || 'Customer'}</div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                job.status === 'completed' ? 'bg-green-100 text-green-700' :
                job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>{job.status}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
              <ClockIcon className="w-3.5 h-3.5" />
              {job.scheduled_time ? new Date(`1970-01-01T${job.scheduled_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Anytime'}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5" />
              {job.customer_address || job.customer?.address}, {job.customer_city || job.customer?.city}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
          </Link>
        ))}
      </div>
    </div>
  );
}