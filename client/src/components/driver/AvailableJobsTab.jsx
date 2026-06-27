import React, { useState, useEffect } from 'react';
import driverAxios from '../../utils/driverAxios';
import { Tractor, Calendar, MapPin, IndianRupee, RefreshCw, AlertCircle, Check, Play, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AvailableJobsTab() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('upcoming'); // 'upcoming', 'inprogress'
  const [actioningId, setActioningId] = useState(null);
  
  // States for complete form
  const [completingId, setCompletingId] = useState(null);
  const [driverNotes, setDriverNotes] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await driverAxios.get('/dashboard/my-jobs');
      setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to load assigned jobs:', err);
      setError(err.response?.data?.message || 'Failed to load assigned jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (bookingId) => {
    setActioningId(bookingId);
    try {
      await driverAxios.patch(`/dashboard/jobs/${bookingId}/accept`);
      alert('Assignment accepted successfully!');
      fetchJobs();
    } catch (err) {
      console.error('Failed to accept job:', err);
      alert(err.response?.data?.message || 'Failed to accept assignment. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleStartJob = async (bookingId) => {
    setActioningId(bookingId);
    try {
      await driverAxios.patch(`/dashboard/jobs/${bookingId}/start`);
      alert('Job started! You can now track your progress.');
      setActiveSubTab('inprogress');
      fetchJobs();
    } catch (err) {
      console.error('Failed to start job:', err);
      alert(err.response?.data?.message || 'Failed to start job. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const handleCompleteJob = async (bookingId) => {
    setActioningId(bookingId);
    try {
      await driverAxios.patch(`/dashboard/jobs/${bookingId}/complete`, {
        driverNotes,
        workPhotos: []
      });
      alert('Job completed successfully! Payout has been processed.');
      setCompletingId(null);
      setDriverNotes('');
      fetchJobs();
    } catch (err) {
      console.error('Failed to complete job:', err);
      alert(err.response?.data?.message || 'Failed to complete job. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-200 border-t-green-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle size={36} className="text-red-500" />
        <p className="text-red-800 font-semibold text-sm">{error}</p>
        <button onClick={fetchJobs} className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const upcomingJobs = jobs.filter(j => ['assigned', 'accepted'].includes(j.status));
  const inProgressJobs = jobs.filter(j => j.status === 'in_progress');
  const filteredJobs = activeSubTab === 'upcoming' ? upcomingJobs : inProgressJobs;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Assigned Jobs</h2>
          <p className="text-xs text-gray-500">Your direct assignments allocated by the operations team.</p>
        </div>
        <button onClick={fetchJobs} className="p-2 bg-white border border-green-100 hover:border-green-300 rounded-xl text-gray-500 hover:text-green-700 shadow-sm transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Subtab Filters */}
      <div className="flex gap-2 bg-green-50 p-1.5 rounded-2xl border border-green-100/50 max-w-sm">
        <button
          onClick={() => { setActiveSubTab('upcoming'); setCompletingId(null); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'upcoming' ? 'bg-[#166534] text-white shadow-sm' : 'text-green-800 hover:bg-green-100/50'
          }`}
        >
          Assigned / Upcoming ({upcomingJobs.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('inprogress'); setCompletingId(null); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'inprogress' ? 'bg-[#166534] text-white shadow-sm' : 'text-green-800 hover:bg-green-100/50'
          }`}
        >
          In Progress ({inProgressJobs.length})
        </button>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white border border-green-150 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <Tractor size={44} className="mx-auto text-gray-300 stroke-[1.5]" />
          <p className="text-sm font-semibold text-gray-700">No jobs in this category.</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">New assignments from the operations team will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div key={job._id || job.id} className="bg-white border border-green-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-green-300 hover:shadow-md transition-all flex flex-col justify-between">
              
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{job.bookingRef}</span>
                    <h3 className="text-base font-bold text-gray-800 capitalize mt-0.5">{job.workType}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg uppercase ${
                    job.status === 'accepted' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 
                    job.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-150' : 
                    'bg-green-50 text-green-700 border border-green-150'
                  }`}>
                    {job.status}
                  </span>
                </div>

                {/* Details Table */}
                <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#16a34a]" />
                    <span><span className="font-semibold text-gray-700">Scheduled:</span> {formatDate(job.scheduledDate)} ({job.timeSlot})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#16a34a]" />
                    <span className="truncate"><span className="font-semibold text-gray-700">Location:</span> {job.location || job.fieldLocation?.address || 'In field'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee size={14} className="text-[#16a34a]" />
                    <span><span className="font-semibold text-gray-700">Est. Payout:</span> ₹{job.estimatedCost?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-gray-200/50 pt-2 mt-2 flex justify-between items-center text-[10px] text-gray-400">
                    <span>Farmer: <span className="font-semibold text-gray-600">{job.farmerName || job.farmerId?.userId?.name}</span></span>
                    {job.areaAcres && <span>{job.areaAcres} Acres</span>}
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="mt-2">
                {job.status === 'assigned' && (
                  <button
                    onClick={() => handleAcceptJob(job._id || job.id)}
                    disabled={actioningId === (job._id || job.id)}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-400 text-white font-bold py-2.5 rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    {actioningId === (job._id || job.id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Accept Assignment</span>
                      </>
                    )}
                  </button>
                )}

                {job.status === 'accepted' && (
                  <button
                    onClick={() => handleStartJob(job._id || job.id)}
                    disabled={actioningId === (job._id || job.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2.5 rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    {actioningId === (job._id || job.id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Play size={14} />
                        <span>Start Job</span>
                      </>
                    )}
                  </button>
                )}

                {job.status === 'in_progress' && (
                  <div className="space-y-3">
                    {completingId !== (job._id || job.id) ? (
                      <button
                        onClick={() => setCompletingId(job._id || job.id)}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2.5 rounded-xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <CheckCircle2 size={14} />
                        <span>Complete Job...</span>
                      </button>
                    ) : (
                      <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-2xl space-y-2 text-xs">
                        <label className="font-bold text-gray-700 block">Driver Notes (Optional)</label>
                        <textarea
                          rows="2"
                          placeholder="Describe work completed..."
                          value={driverNotes}
                          onChange={(e) => setDriverNotes(e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded-xl outline-none focus:border-amber-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCompleteJob(job._id || job.id)}
                            disabled={actioningId === (job._id || job.id)}
                            className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-2 rounded-xl text-center flex items-center justify-center"
                          >
                            {actioningId === (job._id || job.id) ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'Submit'
                            )}
                          </button>
                          <button
                            onClick={() => { setCompletingId(null); setDriverNotes(''); }}
                            className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
