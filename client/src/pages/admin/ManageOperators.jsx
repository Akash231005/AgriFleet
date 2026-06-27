import React, { useEffect, useState } from 'react';
import {
  Users, UserPlus, X, CheckCircle2, AlertCircle,
  Phone, Mail, CreditCard, Calendar, Star, Briefcase, Shield
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import API from '../../utils/api';

/* ── Modal wrapper ──────────────────────────────── */
function Modal({ title, icon, onClose, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '32rem' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.15)' }}
            >
              <span style={{ color: '#15803D' }}>{icon}</span>
            </div>
            <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Driver Card ─────────────────────────────────── */
function DriverCard({ driver }) {
  const STATUS_MAP = {
    available:   { color: '#16A34A', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.2)',  label: 'Available' },
    on_job:      { color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)',  label: 'On Job' },
    maintenance: { color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',  label: 'Maintenance' },
  };
  const st = STATUS_MAP[driver.status] || STATUS_MAP.available;

  return (
    <div
      className="bg-white rounded-2xl p-5 border transition-all hover:shadow-md hover:border-green-200"
      style={{ borderColor: '#E5E7EB', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.15)', color: '#15803D', fontFamily: 'Sora, sans-serif' }}
          >
            {driver.userId?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div>
            <div className="font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              {driver.userId?.name || 'Unknown'}
            </div>
            <div className="text-xs mt-0.5 text-gray-500">
              {driver.userId?.email}
            </div>
          </div>
        </div>
        {/* Status badge */}
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0"
          style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}
        >
          {st.label}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t" style={{ borderColor: '#F3F4F6' }}>
        {[
          { icon: <Phone size={11} />, label: 'Phone', value: driver.userId?.phone || driver.phone || '—' },
          { icon: <CreditCard size={11} />, label: 'License No', value: driver.licenseNumber || '—' },
          { icon: <Calendar size={11} />, label: 'License Expiry', value: driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString('en-IN') : '—' },
          { icon: <Star size={11} />, label: 'Rating', value: `${driver.rating} / 5.0` },
          { icon: <Briefcase size={11} />, label: 'Jobs Done', value: driver.totalJobsDone },
          { icon: <Shield size={11} />, label: 'Active', value: driver.userId?.isActive ? 'Yes' : 'No' },
        ].map(item => (
          <div key={item.label} className="flex items-start gap-1.5">
            <span className="mt-0.5 flex-shrink-0 text-gray-400">{item.icon}</span>
            <div>
              <div className="text-gray-400">{item.label}</div>
              <div className="font-semibold text-gray-800">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────── */
const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '',
  licenseNumber: '', licenseExpiry: '', profilePhoto: ''
};

export default function ManageOperators() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/drivers');
      setDrivers(res.data.data);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDrivers(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = { ...form };
      if (!payload.licenseExpiry) delete payload.licenseExpiry;
      if (!payload.profilePhoto) delete payload.profilePhoto;
      await API.post('/drivers', payload);
      setSuccessMsg(`Driver account for "${form.name}" created successfully!`);
      setForm(EMPTY_FORM);
      await loadDrivers();
      setTimeout(() => { setShowModal(false); setSuccessMsg(''); }, 1800);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create driver. Please check the details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#15803D' }}>Admin</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Manage Operators
          </h1>
          <p className="text-sm mt-1 text-gray-500">
            Create and view all registered field drivers on the platform.
          </p>
        </div>
        <button onClick={handleOpenModal} className="btn-primary" style={{ flexShrink: 0 }}>
          <UserPlus size={16} /> Add New Driver
        </button>
      </div>

      {/* Summary strip */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Total Drivers', value: drivers.length, color: '#15803D', bg: 'rgba(21,128,61,0.06)' },
          { label: 'Available', value: drivers.filter(d => d.status === 'available').length, color: '#16A34A', bg: 'rgba(22,163,74,0.06)' },
          { label: 'On Job', value: drivers.filter(d => d.status === 'on_job').length, color: '#D97706', bg: 'rgba(217,119,6,0.06)' },
        ].map(c => (
          <div
            key={c.label}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white border"
            style={{ borderColor: `${c.color}20`, background: c.bg }}
          >
            <span className="text-xl font-bold" style={{ color: c.color, fontFamily: 'Sora, sans-serif' }}>{c.value}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Driver Cards Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: 'rgba(21,128,61,0.15)', borderTopColor: '#15803D' }} />
        </div>
      ) : drivers.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <Users size={48} style={{ color: '#D1D5DB', margin: '0 auto' }} strokeWidth={1.5} />
          <p className="font-semibold text-gray-700">No drivers registered yet.</p>
          <p className="text-sm text-gray-400">Click "Add New Driver" to onboard your first operator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {drivers.map(driver => (
            <DriverCard key={driver._id} driver={driver} />
          ))}
        </div>
      )}

      {/* CREATE DRIVER MODAL */}
      {showModal && (
        <Modal title="Add New Driver" icon={<UserPlus size={16} />} onClose={() => setShowModal(false)}>

          {/* Success */}
          {successMsg && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(21,128,61,0.06)', border: '1px solid rgba(21,128,61,0.2)', color: '#15803D' }}
            >
              <CheckCircle2 size={16} className="flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div
              className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626' }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Section: Account */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b" style={{ borderColor: '#F3F4F6' }}>
                <span style={{ color: '#15803D', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Account Details
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="name" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={handleChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Phone *</label>
                  <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={handleChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input type="email" name="email" placeholder="driver@agrifleet.com" value={form.email} onChange={handleChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Password *</label>
                  <input type="password" name="password" placeholder="Min 8 characters" value={form.password} onChange={handleChange} className="form-input" required minLength={8} />
                </div>
              </div>
            </div>

            {/* Section: License */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b" style={{ borderColor: '#F3F4F6' }}>
                <span style={{ color: '#15803D', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  License Information
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">License Number *</label>
                  <input type="text" name="licenseNumber" placeholder="e.g. KA-0320240012345" value={form.licenseNumber} onChange={handleChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">License Expiry Date</label>
                  <input type="date" name="licenseExpiry" value={form.licenseExpiry} onChange={handleChange} className="form-input" />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                {submitting ? <div className="spinner" /> : <><UserPlus size={15} /> Create Driver</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </PageWrapper>
  );
}
