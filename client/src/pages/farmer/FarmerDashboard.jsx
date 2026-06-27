import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Calendar, Tractor, IndianRupee, Plus, Clock, Ban, RefreshCw, MapPin, Leaf, CheckCircle2, ChevronDown, ChevronUp, UserCheck, Star } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { fetchMyBookings, cancelBookingRequest, fetchDriverRequests, selectDriverForJob } from '../../features/bookings/bookingSlice';

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status.replace('_', ' ')}</span>;
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-green-50 shadow-sm flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, border: `1px solid ${color}22` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#475569' }}>{label}</div>
        <div className="text-xl font-bold text-slate-800 truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</div>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  const dispatch = useDispatch();
  const { bookings, driverRequests, loading } = useSelector((state) => state.bookings);
  const { profile } = useSelector((state) => state.auth);
  
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      dispatch(cancelBookingRequest({ id, cancelReason: 'Cancelled by farmer' }));
    }
  };

  const toggleExpand = (bookingId) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };

  const handleSelectDriver = (bookingId, driverId) => {
    if (window.confirm('Assign this driver to your job?')) {
      dispatch(selectDriverForJob({ id: bookingId, driverId })).then(() => {
        setExpandedBookingId(null);
      });
    }
  };

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'assigned', 'in_progress'].includes(b.status)).length;
  const totalSpent = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#15803D' }}>Farmer Portal</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>My Dashboard</h1>
          <p className="text-sm mt-1 text-slate-500">Monitor and manage your agricultural service requests.</p>
        </div>
        <Link to="/farmer/new-booking" className="btn-primary" style={{ flexShrink: 0 }}>
          <Plus size={16} /> Book New Service
        </Link>
      </div>

      {/* Profile Info Banner */}
      {profile && (
        <div
          className="rounded-xl p-4 flex flex-wrap gap-x-8 gap-y-2 text-sm bg-white border border-green-100 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <MapPin size={14} style={{ color: '#15803D' }} />
            <span className="text-slate-600">
              <span className="text-slate-800 font-bold">Location: </span>
              {profile.village}, {profile.district}, {profile.state}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Leaf size={14} style={{ color: '#15803D' }} />
            <span className="text-slate-600">
              <span className="text-slate-800 font-bold">Landholding: </span>
              {profile.totalAcres} Acres ({profile.landType})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: profile.isVerified ? '#15803D' : '#D97706' }} />
            <span className="font-bold" style={{ color: profile.isVerified ? '#15803D' : '#D97706' }}>
              {profile.isVerified ? 'Verified Partner' : 'Pending Verification'}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<Tractor size={20} />} label="Total Bookings" value={`${totalBookings} Requests`} color="#15803D" bg="rgba(21,128,61,0.1)" />
        <StatCard icon={<Clock size={20} />} label="Active Bookings" value={`${activeBookings} Scheduled`} color="#D97706" bg="rgba(251,191,36,0.1)" />
        <StatCard icon={<IndianRupee size={20} />} label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} color="#2563EB" bg="rgba(59,130,246,0.1)" />
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white border border-green-50 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: '#15803D' }} />
            <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Service Orders</h2>
          </div>
          <button
            onClick={() => dispatch(fetchMyBookings())}
            className="p-2 rounded-lg transition-all text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-10 h-10 rounded-full border-[3px] border-green-100 border-t-[#15803D] animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Tractor size={44} style={{ color: '#CBD5E1', margin: '0 auto' }} strokeWidth={1.5} />
            <p className="text-sm text-slate-400">No service requests yet.</p>
            <Link to="/farmer/new-booking" style={{ color: '#15803D', fontSize: '0.8rem', fontWeight: 600 }}>
              Book your first service →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref / Service</th>
                  <th>Area</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Est. Cost</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <React.Fragment key={booking._id}>
                    <tr className={expandedBookingId === booking._id ? 'bg-green-50/20' : ''}>
                      <td>
                        <div className="font-bold text-slate-800 text-sm">{booking.bookingRef}</div>
                        <div className="text-xs capitalize mt-0.5 text-slate-500">{booking.workType}</div>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-800">{booking.areaAcres}</span>
                        <span className="text-xs ml-1 text-slate-500">acres</span>
                      </td>
                      <td>
                        <div className="font-medium text-sm text-slate-700">{new Date(booking.scheduledDate).toLocaleDateString('en-IN')}</div>
                        <div className="text-xs capitalize mt-0.5 text-slate-500">{booking.timeSlot} shift</div>
                      </td>
                      <td><StatusBadge status={booking.status} /></td>
                      <td>
                        <span className="font-bold text-slate-800">₹{booking.estimatedCost?.toLocaleString()}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button 
                            onClick={() => toggleExpand(booking._id)} 
                            className="btn-secondary py-1.5 px-3 text-xs"
                          >
                            {expandedBookingId === booking._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Details
                          </button>
                          {['pending', 'confirmed'].includes(booking.status) ? (
                            <button onClick={() => handleCancel(booking._id)} className="btn-danger py-1.5 px-3">
                              <Ban size={11} />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedBookingId === booking._id && (
                      <tr>
                        <td colSpan="6" className="p-0 border-0">
                          <div className="bg-slate-50 p-5 border-b border-slate-100 space-y-4">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                              <Tractor size={14} className="text-green-600" /> Booking Details & Resource Assignment
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                              {/* Resources */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
                                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Assigned Fleet Resources</div>
                                {booking.driverId ? (
                                  <div className="space-y-0.5">
                                    <div className="text-xs font-bold text-slate-800">{booking.driverId.name}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold">Phone: {booking.driverId.phone || booking.driverId.userId?.phone}</div>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic">No driver assigned yet.</div>
                                )}
                                {booking.tractorId ? (
                                  <div className="border-t border-slate-100 pt-2 space-y-0.5">
                                    <div className="text-xs font-bold text-slate-800">{booking.tractorId.brand} {booking.tractorId.model}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold">Reg No: {booking.tractorId.registrationNo}</div>
                                  </div>
                                ) : (
                                  <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 italic">No tractor assigned yet.</div>
                                )}
                                {booking.attachmentId ? (
                                  <div className="border-t border-slate-100 pt-2 space-y-0.5">
                                    <div className="text-xs font-bold text-slate-800">{booking.attachmentId.name}</div>
                                    <div className="text-[10px] text-slate-500 font-semibold">Type: {booking.attachmentId.type}</div>
                                  </div>
                                ) : (
                                  <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 italic">No attachment assigned yet.</div>
                                )}
                              </div>

                              {/* Costs */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Financial Summary</div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-slate-500">Estimated Cost:</span>
                                  <span className="font-semibold text-slate-800">₹{booking.estimatedCost?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                                  <span className="text-slate-500">Actual Cost:</span>
                                  <span className="font-bold text-green-700">
                                    {booking.status === 'completed' ? `₹${(booking.actualCost || booking.estimatedCost)?.toLocaleString()}` : 'Pending Completion'}
                                  </span>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2.5">
                                <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Service Timeline</div>
                                <div className="space-y-1.5 text-[11px] text-slate-600">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Requested:</span>
                                    <span className="font-medium">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500">Scheduled Date:</span>
                                    <span className="font-medium">{new Date(booking.scheduledDate).toLocaleDateString('en-IN')} ({booking.timeSlot})</span>
                                  </div>
                                  {booking.startedAt && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500">Started:</span>
                                      <span className="font-medium">{new Date(booking.startedAt).toLocaleTimeString('en-IN')}</span>
                                    </div>
                                  )}
                                  {booking.completedAt && (
                                    <div className="flex justify-between text-green-700 font-semibold">
                                      <span>Completed:</span>
                                      <span>{new Date(booking.completedAt).toLocaleDateString('en-IN')}</span>
                                    </div>
                                  )}
                                  {booking.status === 'cancelled' && (
                                    <div className="text-red-600 font-semibold mt-1">
                                      Cancelled Reason: {booking.cancelReason}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
