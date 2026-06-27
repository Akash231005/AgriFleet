import React, { useEffect, useState } from 'react';
import { Calendar, Tractor, IndianRupee, Award, Cpu, ClipboardList, RefreshCw, TrendingUp, Zap } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings, approveBookingRequest, autoAssignBooking } from '../../features/bookings/bookingSlice';
import API from '../../utils/api';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>;
}

function KpiCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: '#E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg, border: `1px solid ${color}30` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <TrendingUp size={14} style={{ color: '#9CA3AF' }} />
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{label}</div>
      <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</div>
      {sub && <div className="text-xs mt-0.5 text-gray-500">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { bookings, loading, submitting } = useSelector((state) => state.bookings);
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadAdminAnalytics = async () => {
    setLoadingStats(true);
    try {
      const summaryRes = await API.get('/analytics/summary');
      setSummary(summaryRes.data.data);
      const leaderboardRes = await API.get('/analytics/drivers');
      setLeaderboard(leaderboardRes.data.data);
    } catch (err) {
      console.error('Failed to load admin logs:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    dispatch(fetchBookings());
    loadAdminAnalytics();
  }, [dispatch]);

  const handleApprove = async (id) => {
    await dispatch(approveBookingRequest(id));
    await loadAdminAnalytics();
  };

  const handleAutoAssign = async (id) => {
    await dispatch(autoAssignBooking(id));
    await loadAdminAnalytics();
  };

  const RANK_COLORS = ['#F59E0B', '#94A3B8', '#B45309'];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#15803D' }}>Admin</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>Command Center</h1>
          <p className="text-sm mt-1 text-gray-500">Review requests, manage allocation, track fleet analytics.</p>
        </div>
        <button
          onClick={loadAdminAnalytics}
          disabled={loadingStats}
          className="p-2.5 rounded-xl transition-all flex-shrink-0 bg-white border hover:border-green-300 hover:text-green-700"
          style={{ borderColor: '#E5E7EB', color: '#6B7280', cursor: 'pointer' }}
        >
          <RefreshCw size={16} className={loadingStats ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* KPI Grid */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={<Calendar size={18} />} label="Today's Bookings" value={summary.todayBookings} sub="Requests today" color="#15803D" bg="rgba(21,128,61,0.08)" />
          <KpiCard icon={<Tractor size={18} />} label="Active Jobs" value={summary.activeJobs} sub="Fields in progress" color="#F59E0B" bg="rgba(245,158,11,0.08)" />
          <KpiCard icon={<IndianRupee size={18} />} label="Revenue Today" value={`₹${summary.revenueToday}`} sub="Completed orders" color="#6366F1" bg="rgba(99,102,241,0.08)" />
          <KpiCard icon={<Zap size={18} />} label="Fleet Telemetry" value={summary.fleetRatio} sub={`${summary.totalDrivers} drivers active`} color="#0EA5E9" bg="rgba(14,165,233,0.08)" />
        </div>
      )}

      {/* Main grid: bookings table + leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Booking Queue (L) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
          <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: '#F3F4F6' }}>
            <ClipboardList size={16} style={{ color: '#15803D' }} />
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>Service Requests & Assignments</h2>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: 'rgba(21,128,61,0.15)', borderTopColor: '#15803D' }} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center">
              <ClipboardList size={36} style={{ margin: '0 auto 12px', color: '#D1D5DB' }} strokeWidth={1.5} />
              <p className="text-sm text-gray-400">No active service bookings in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking Ref</th>
                    <th>Farmer / Land</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div className="font-bold text-gray-900 text-sm tracking-wide">{booking.bookingRef}</div>
                        <div className="text-[10px] uppercase mt-0.5 text-gray-400">{booking.workType}</div>
                      </td>
                      <td>
                        <div className="font-semibold text-sm text-gray-800">{booking.farmerId?.userId?.name || 'N/A'}</div>
                        <div className="text-xs mt-0.5 text-gray-400">{booking.areaAcres} ac · {booking.fieldLocation?.village}</div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-700">{new Date(booking.scheduledDate).toLocaleDateString('en-IN')}</div>
                        <div className="text-[10px] uppercase mt-0.5 text-gray-400">{booking.timeSlot} shift</div>
                      </td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(booking._id)}
                              disabled={submitting}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.875rem', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleAutoAssign(booking._id)}
                              disabled={submitting}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                              style={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow: '0 4px 12px rgba(99,102,241,0.25)', border: 'none', cursor: 'pointer' }}
                            >
                              <Cpu size={11} /> Auto-Allocate
                            </button>
                          )}
                          {!['pending', 'confirmed'].includes(booking.status) && (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Driver Leaderboard (R) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
          <div className="px-5 py-4 flex items-center gap-2 border-b" style={{ borderColor: '#F3F4F6' }}>
            <Award size={16} style={{ color: '#F59E0B' }} />
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>Operator Leaderboard</h2>
          </div>

          {loadingStats ? (
            <div className="py-16 flex justify-center">
              <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(21,128,61,0.15)', borderTopColor: '#15803D' }} />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No operator data.</div>
          ) : (
            <div className="p-3 space-y-1">
              {leaderboard.map((driver, index) => (
                <div
                  key={driver._id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50"
                  style={{
                    background: index === 0 ? 'rgba(245,158,11,0.04)' : 'transparent',
                    border: index === 0 ? '1px solid rgba(245,158,11,0.15)' : '1px solid transparent'
                  }}
                >
                  {/* Rank */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: index < 3 ? `${RANK_COLORS[index]}15` : '#F9FAFB',
                      color: index < 3 ? RANK_COLORS[index] : '#9CA3AF',
                      border: `1px solid ${index < 3 ? RANK_COLORS[index] + '30' : '#E5E7EB'}`
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* Driver info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800 truncate">{driver.userId?.name}</div>
                    <div className="text-[10px] mt-0.5 text-gray-400">{driver.totalJobsDone} tasks done</div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#F59E0B' }}>
                      ⭐ {driver.rating}
                    </div>
                    <div className="text-[10px] mt-0.5 font-semibold text-gray-500">₹{driver.totalEarnings}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
