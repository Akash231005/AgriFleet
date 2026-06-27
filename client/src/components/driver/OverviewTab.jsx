import React, { useState, useEffect } from 'react';
import driverAxios from '../../utils/driverAxios';
import { Landmark, Briefcase, Star, MapPin, Phone, Calendar, ArrowRight, RefreshCw, AlertCircle, Compass } from 'lucide-react';

export default function OverviewTab({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [actioning, setActioning] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [driverNotes, setDriverNotes] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await driverAxios.get('/dashboard/overview');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load overview:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleAccept = async (bookingId) => {
    setActioning(true);
    try {
      await driverAxios.patch(`/dashboard/jobs/${bookingId}/accept`);
      alert('Assignment accepted successfully!');
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept assignment.');
    } finally {
      setActioning(false);
    }
  };

  const handleStart = async (bookingId) => {
    setActioning(true);
    try {
      await driverAxios.patch(`/dashboard/jobs/${bookingId}/start`);
      alert('Job started!');
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start job.');
    } finally {
      setActioning(false);
    }
  };

  const handleComplete = async (bookingId) => {
    setActioning(true);
    try {
      await driverAxios.patch(`/dashboard/jobs/${bookingId}/complete`, {
        driverNotes,
        workPhotos: []
      });
      alert('Job completed successfully!');
      setCompleting(false);
      setDriverNotes('');
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setActioning(false);
    }
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
        <button onClick={fetchOverview} className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const { todayEarnings, totalJobsCompleted, rating, availableJobsCount, assignedJob, recentActivity } = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Title block with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Today's Summary</h2>
          <p className="text-xs text-gray-500">Real-time status of bookings and earnings.</p>
        </div>
        <button onClick={fetchOverview} className="p-2 bg-white border border-green-100 hover:border-green-300 rounded-xl text-gray-500 hover:text-green-700 shadow-sm transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Pay</span>
            <div className="p-1.5 bg-green-50 text-green-700 rounded-lg"><Landmark size={16} /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-bold text-gray-800">₹{todayEarnings.toLocaleString('en-IN')}</h4>
            <p className="text-[10px] text-green-600 font-medium mt-1">Today's work payouts</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jobs Done</span>
            <div className="p-1.5 bg-green-50 text-green-700 rounded-lg"><Briefcase size={16} /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-bold text-gray-800">{totalJobsCompleted}</h4>
            <p className="text-[10px] text-green-600 font-medium mt-1">Lifetime completed</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Rating</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Star size={16} /></div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-1">
              {rating || 0} <span className="text-xs text-gray-400 font-normal">/ 5</span>
            </h4>
            <p className="text-[10px] text-amber-600 font-medium mt-1">Farmer reviews rating</p>
          </div>
        </div>

        {/* Card 4 */}
        <button
          onClick={() => setActiveTab('jobs')}
          className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col justify-between text-left hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Jobs</span>
            <div className="p-1.5 bg-green-50 text-green-700 rounded-lg group-hover:bg-[#166534] group-hover:text-white transition-colors">
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-lg font-bold text-gray-800">{availableJobsCount}</h4>
            <p className="text-[10px] text-green-600 font-medium mt-1 group-hover:underline">View assigned jobs →</p>
          </div>
        </button>
      </div>

      {/* Active Job / Assigned Job Block */}
      <div className="bg-white border border-green-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-tight border-b border-green-50 pb-2">Active Service Assignment</h3>
        {assignedJob ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">{assignedJob.bookingRef}</p>
                <h4 className="text-base font-bold text-gray-800 capitalize mt-0.5">{assignedJob.workType}</h4>
              </div>
              <span className="text-xs bg-emerald-100 text-[#166534] font-bold px-3 py-1 rounded-full uppercase">
                {assignedJob.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-[#16a34a]" />
                  <span>
                    <span className="font-semibold text-gray-700">Scheduled:</span> {formatDate(assignedJob.scheduledDate)} ({assignedJob.timeSlot})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-[#16a34a]" />
                  <span className="truncate">
                    <span className="font-semibold text-gray-700">Location:</span> {assignedJob.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={16} className="text-[#16a34a]" />
                  <span>
                    <span className="font-semibold text-gray-700">Area holding:</span> {assignedJob.areaAcres} Acres
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 md:border-l md:border-gray-200 md:pl-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-bold text-[#166534]">₹</span>
                  <span>
                    <span className="font-semibold text-gray-700">Settlement Cost:</span> ₹{assignedJob.estimatedCost?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-[#16a34a]" />
                  <span>
                    <span className="font-semibold text-gray-700">Farmer:</span> {assignedJob.farmerName}
                  </span>
                </div>
                {assignedJob.farmerPhone && (
                  <a
                    href={`tel:${assignedJob.farmerPhone}`}
                    className="inline-flex items-center gap-1 text-xs text-green-700 font-bold hover:underline"
                  >
                    Call Farmer: {assignedJob.farmerPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons & navigation */}
            <div className="space-y-3 pt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignedJob.location)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-2xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
              >
                <Compass size={18} /> Get Driving Directions on Maps
              </a>

              {assignedJob.status === 'assigned' && (
                <button
                  onClick={() => handleAccept(assignedJob.id)}
                  disabled={actioning}
                  className="w-full bg-[#166534] hover:bg-[#15803d] disabled:bg-gray-400 text-white font-bold py-3 rounded-2xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                >
                  {actioning ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Accept Assignment'
                  )}
                </button>
              )}

              {assignedJob.status === 'accepted' && (
                <button
                  onClick={() => handleStart(assignedJob.id)}
                  disabled={actioning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-2xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                >
                  {actioning ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Start Job'
                  )}
                </button>
              )}

              {assignedJob.status === 'in_progress' && (
                <div className="space-y-3">
                  {!completing ? (
                    <button
                      onClick={() => setCompleting(true)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-2xl shadow hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                      Complete Job...
                    </button>
                  ) : (
                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-2 text-xs text-left">
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
                          onClick={() => handleComplete(assignedJob.id)}
                          disabled={actioning}
                          className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-2.5 rounded-xl text-center flex items-center justify-center"
                        >
                          {actioning ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Submit'
                          )}
                        </button>
                        <button
                          onClick={() => { setCompleting(false); setDriverNotes(''); }}
                          className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 rounded-xl"
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
        ) : (
          <div className="py-8 text-center text-gray-400 space-y-2">
            <Compass size={32} className="mx-auto text-gray-300 stroke-[1.5]" />
            <p className="text-xs">No active assignments. Go offline or wait for dispatch team to assign a job.</p>
          </div>
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white border border-green-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-tight border-b border-green-50 pb-2">Recent Activities</h3>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4 text-xs py-1 border-b border-gray-50 last:border-b-0">
                <p className="text-gray-700 font-medium leading-normal">{activity.message}</p>
                <span className="text-gray-400 text-[10px] whitespace-nowrap">{formatDate(activity.date)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-2">No recent activity logs.</p>
        )}
      </div>
    </div>
  );
}
