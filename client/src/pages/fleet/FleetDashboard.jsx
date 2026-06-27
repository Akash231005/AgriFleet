import React, { useEffect, useState } from 'react';
import { Tractor, ClipboardList, Fuel, Wrench, Plus, RefreshCw, X } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import API from '../../utils/api';

function StatusBadge({ status }) {
  const map = {
    available:   { label: 'Available',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    on_job:      { label: 'On Job',       color: '#FB923C', bg: 'rgba(251,146,60,0.1)' },
    maintenance: { label: 'Maintenance',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    in_use:      { label: 'In Use',       color: '#FB923C', bg: 'rgba(251,146,60,0.1)' },
  };
  const c = map[status] || { label: status, color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' };
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
      style={{ color: c.color, background: c.bg }}
    >
      ● {c.label}
    </span>
  );
}

const INPUT_CLS = 'form-input';
const SELECT_STYLE = { appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2rem', paddingRight: '2.5rem' };

function Modal({ title, icon, onClose, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span style={{ color: '#22C55E' }}>{icon}</span>
            </div>
            <h2 className="font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function FleetDashboard() {
  const [tractors, setTractors] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tractors');
  const [fuelModal, setFuelModal] = useState(false);
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [tractorModal, setTractorModal] = useState(false);
  const [fuelForm, setFuelForm] = useState({ tractorId: '', liters: '', pricePerL: '', odometerKm: '', fuelStation: '' });
  const [maintenanceForm, setMaintenanceForm] = useState({ tractorId: '', type: 'oil_change', description: '', cost: '', technician: '', serviceCenter: '', nextDueDate: '' });
  const [tractorForm, setTractorForm] = useState({ registrationNo: '', model: '', brand: '', year: '', horsePower: '', fuelType: 'diesel' });

  const loadFleetData = async () => {
    setLoading(true);
    try {
      const tractorRes = await API.get('/tractors');
      setTractors(tractorRes.data.data);
      const attachmentRes = await API.get('/tractors/attachments');
      setAttachments(attachmentRes.data.data);
    } catch (err) {
      console.error('Failed to load fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFleetData(); }, []);

  const handleTractorSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tractors', { ...tractorForm, year: parseInt(tractorForm.year), horsePower: parseInt(tractorForm.horsePower) });
      setTractorModal(false);
      setTractorForm({ registrationNo: '', model: '', brand: '', year: '', horsePower: '', fuelType: 'diesel' });
      await loadFleetData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add tractor.'); }
  };

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tractors/fuel', { ...fuelForm, liters: parseFloat(fuelForm.liters), pricePerL: parseFloat(fuelForm.pricePerL), odometerKm: parseInt(fuelForm.odometerKm) });
      setFuelModal(false);
      setFuelForm({ tractorId: '', liters: '', pricePerL: '', odometerKm: '', fuelStation: '' });
      await loadFleetData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to log fuel.'); }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tractors/maintenance', { ...maintenanceForm, cost: parseFloat(maintenanceForm.cost) });
      setMaintenanceModal(false);
      setMaintenanceForm({ tractorId: '', type: 'oil_change', description: '', cost: '', technician: '', serviceCenter: '', nextDueDate: '' });
      await loadFleetData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to log maintenance.'); }
  };

  const MODAL_BTN_STYLE = { display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#818CF8' }}>Fleet Manager</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Fleet Control Center</h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>Track equipment, log maintenance events, and manage fuel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFuelModal(true)} className="btn-secondary">
            <Fuel size={14} style={{ color: '#22C55E' }} /> Log Refueling
          </button>
          <button onClick={() => setMaintenanceModal(true)} className="btn-secondary">
            <Wrench size={14} style={{ color: '#22C55E' }} /> Log Service
          </button>
          <button onClick={() => setTractorModal(true)} className="btn-primary">
            <Plus size={14} /> Add Tractor
          </button>
        </div>
      </div>

      {/* Fleet summary mini-cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tractors', value: tractors.length, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Available', value: tractors.filter(t => t.status === 'available').length, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Attachments', value: attachments.length, color: '#818CF8', bg: 'rgba(129,140,248,0.08)' },
        ].map(c => (
          <div key={c.label} className="rounded-xl px-4 py-3 text-center" style={{ background: c.bg, border: `1px solid ${c.color}20` }}>
            <div className="text-xl font-bold" style={{ color: c.color, fontFamily: 'Sora, sans-serif' }}>{c.value}</div>
            <div className="text-[10px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: '#64748B' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: '1px solid #1E293B' }}>
        {[{ id: 'tractors', label: 'Tractors Fleet', icon: <Tractor size={14} /> }, { id: 'attachments', label: 'Attachments', icon: <ClipboardList size={14} /> }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition-all"
            style={{
              borderBottom: activeTab === tab.id ? '2px solid #22C55E' : '2px solid transparent',
              color: activeTab === tab.id ? 'white' : '#64748B',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #22C55E' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            <span style={{ color: activeTab === tab.id ? '#22C55E' : '#475569' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tables */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: 'rgba(34,197,94,0.2)', borderTopColor: '#22C55E' }} />
        </div>
      ) : activeTab === 'tractors' ? (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0B132B', border: '1px solid #1E293B' }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg. No</th>
                  <th>Tractor</th>
                  <th>Power</th>
                  <th>Fuel Level</th>
                  <th>Hours Run</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tractors.map((tractor) => (
                  <tr key={tractor._id}>
                    <td>
                      <span className="font-bold text-white tracking-wider">{tractor.registrationNo}</span>
                    </td>
                    <td>
                      <div className="font-semibold" style={{ color: '#CBD5E1' }}>{tractor.model}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{tractor.brand} · {tractor.year}</div>
                    </td>
                    <td><span className="font-semibold text-white">{tractor.horsePower}</span><span className="text-xs ml-1" style={{ color: '#64748B' }}>HP</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E293B' }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${tractor.fuelLevel}%`, background: tractor.fuelLevel > 40 ? '#22C55E' : '#EF4444' }}
                          />
                        </div>
                        <span className="text-xs font-bold" style={{ color: tractor.fuelLevel > 40 ? '#22C55E' : '#EF4444' }}>
                          {tractor.fuelLevel}%
                        </span>
                      </div>
                    </td>
                    <td><span className="font-semibold text-white">{tractor.totalHoursRun}</span><span className="text-xs ml-1" style={{ color: '#64748B' }}>hrs</span></td>
                    <td><StatusBadge status={tractor.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#0B132B', border: '1px solid #1E293B' }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Type Class</th>
                  <th>Compatibility</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map((att) => (
                  <tr key={att._id}>
                    <td><span className="font-bold text-white">{att.name}</span></td>
                    <td>
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{ background: 'rgba(129,140,248,0.1)', color: '#818CF8' }}
                      >
                        {att.type}
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: '#64748B' }}>{att.compatibleWith?.join(', ') || 'All brands'}</td>
                    <td><StatusBadge status={att.status === 'in_use' ? 'on_job' : att.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FUEL MODAL */}
      {fuelModal && (
        <Modal title="Log Fuel Refueling" icon={<Fuel size={16} />} onClose={() => setFuelModal(false)}>
          <form onSubmit={handleFuelSubmit} className="space-y-4">
            <div>
              <label className="form-label">Select Tractor</label>
              <select value={fuelForm.tractorId} onChange={(e) => setFuelForm({ ...fuelForm, tractorId: e.target.value })} className={INPUT_CLS} style={SELECT_STYLE} required>
                <option value="">-- Select Tractor --</option>
                {tractors.map(t => <option key={t._id} value={t._id}>{t.registrationNo} – {t.model}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Liters Filled</label>
                <input type="number" step="0.1" placeholder="e.g. 40" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} className={INPUT_CLS} required />
              </div>
              <div>
                <label className="form-label">Price / Liter (₹)</label>
                <input type="number" step="0.5" placeholder="e.g. 96" value={fuelForm.pricePerL} onChange={(e) => setFuelForm({ ...fuelForm, pricePerL: e.target.value })} className={INPUT_CLS} required />
              </div>
            </div>
            <div>
              <label className="form-label">Odometer Reading (Km)</label>
              <input type="number" placeholder="e.g. 12000" value={fuelForm.odometerKm} onChange={(e) => setFuelForm({ ...fuelForm, odometerKm: e.target.value })} className={INPUT_CLS} />
            </div>
            <div style={MODAL_BTN_STYLE}>
              <button type="button" onClick={() => setFuelModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Log Fuel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* MAINTENANCE MODAL */}
      {maintenanceModal && (
        <Modal title="Log Service Activity" icon={<Wrench size={16} />} onClose={() => setMaintenanceModal(false)}>
          <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
            <div>
              <label className="form-label">Select Tractor</label>
              <select value={maintenanceForm.tractorId} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tractorId: e.target.value })} className={INPUT_CLS} style={SELECT_STYLE} required>
                <option value="">-- Select Tractor --</option>
                {tractors.map(t => <option key={t._id} value={t._id}>{t.registrationNo} – {t.model}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Service Type</label>
                <select value={maintenanceForm.type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })} className={INPUT_CLS} style={SELECT_STYLE}>
                  <option value="oil_change">Oil Change</option>
                  <option value="tyre">Tyre Service</option>
                  <option value="engine">Engine Repair</option>
                  <option value="hydraulic">Hydraulic Check</option>
                  <option value="electrical">Electrical Repair</option>
                  <option value="general">General Servicing</option>
                </select>
              </div>
              <div>
                <label className="form-label">Service Cost (₹)</label>
                <input type="number" placeholder="Cost" value={maintenanceForm.cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })} className={INPUT_CLS} required />
              </div>
            </div>
            <div>
              <label className="form-label">Technician / Workshop</label>
              <input type="text" placeholder="e.g. Mahindra Care Centre" value={maintenanceForm.technician} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technician: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="form-label">Log Description</label>
              <textarea placeholder="Engine oil replaced, filters cleaned..." value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} rows={2} className={INPUT_CLS} style={{ resize: 'vertical' }} required />
            </div>
            <div style={MODAL_BTN_STYLE}>
              <button type="button" onClick={() => setMaintenanceModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Log Service</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD TRACTOR MODAL */}
      {tractorModal && (
        <Modal title="Add Tractor to Fleet" icon={<Tractor size={16} />} onClose={() => setTractorModal(false)}>
          <form onSubmit={handleTractorSubmit} className="space-y-4">
            <div>
              <label className="form-label">Registration No</label>
              <input type="text" placeholder="e.g. KA-51-TR-1004" value={tractorForm.registrationNo} onChange={(e) => setTractorForm({ ...tractorForm, registrationNo: e.target.value })} className={INPUT_CLS} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Brand</label>
                <input type="text" placeholder="e.g. Mahindra" value={tractorForm.brand} onChange={(e) => setTractorForm({ ...tractorForm, brand: e.target.value })} className={INPUT_CLS} required />
              </div>
              <div>
                <label className="form-label">Model</label>
                <input type="text" placeholder="e.g. 475 DI" value={tractorForm.model} onChange={(e) => setTractorForm({ ...tractorForm, model: e.target.value })} className={INPUT_CLS} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Manufacture Year</label>
                <input type="number" placeholder="2024" value={tractorForm.year} onChange={(e) => setTractorForm({ ...tractorForm, year: e.target.value })} className={INPUT_CLS} required />
              </div>
              <div>
                <label className="form-label">Horsepower (HP)</label>
                <input type="number" placeholder="55" value={tractorForm.horsePower} onChange={(e) => setTractorForm({ ...tractorForm, horsePower: e.target.value })} className={INPUT_CLS} required />
              </div>
            </div>
            <div style={MODAL_BTN_STYLE}>
              <button type="button" onClick={() => setTractorModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Add Tractor</button>
            </div>
          </form>
        </Modal>
      )}
    </PageWrapper>
  );
}
