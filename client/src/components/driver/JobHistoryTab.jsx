import React, { useState, useEffect } from 'react';
import driverAxios from '../../utils/driverAxios';
import { Calendar, MapPin, IndianRupee, RefreshCw, AlertCircle, Clock } from 'lucide-react';

export default function JobHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await driverAxios.get('/dashboard/job-history');
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to load job history:', err);
      setError(err.response?.data?.message || 'Failed to fetch job history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
        <button onClick={fetchHistory} className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Job History</h2>
          <p className="text-xs text-gray-500">Record of your completed and cancelled assignments.</p>
        </div>
        <button onClick={fetchHistory} className="p-2 bg-white border border-green-100 hover:border-green-300 rounded-xl text-gray-500 hover:text-green-700 shadow-sm transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-green-150 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <Clock size={44} className="mx-auto text-gray-300 stroke-[1.5]" />
          <p className="text-sm font-semibold text-gray-700">No completed jobs yet.</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Once you are assigned and complete a booking service, it will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-green-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-green-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Job Ref / Work</th>
                  <th className="py-4 px-5">Area</th>
                  <th className="py-4 px-5">Scheduled Date</th>
                  <th className="py-4 px-5">Location</th>
                  <th className="py-4 px-5">Earnings</th>
                  <th className="py-4 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {history.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-800">{job.bookingRef}</div>
                      <div className="text-[10px] text-gray-400 capitalize mt-0.5">{job.workType}</div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-gray-700">
                      {job.areaAcres} Acres
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-gray-700 font-medium">{formatDate(job.scheduledDate)}</div>
                      <div className="text-[10px] text-gray-400 capitalize mt-0.5">{job.timeSlot} shift</div>
                    </td>
                    <td className="py-4 px-5 text-gray-600 truncate max-w-[150px]" title={job.location}>
                      {job.location}
                    </td>
                    <td className="py-4 px-5 font-bold text-gray-800">
                      ₹{job.actualCost?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        job.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
