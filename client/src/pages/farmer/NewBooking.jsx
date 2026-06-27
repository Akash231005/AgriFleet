import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tractor, CheckCircle2, ChevronRight, ChevronLeft, MapPin, Clock, Fuel, IndianRupee, AlertCircle } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { requestBooking } from '../../features/bookings/bookingSlice';
import API from '../../utils/api';

const STEPS = [
  { id: 1, label: 'Service', icon: <Tractor size={14} /> },
  { id: 2, label: 'Schedule', icon: <Calendar size={14} /> },
  { id: 3, label: 'Confirm', icon: <CheckCircle2 size={14} /> },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.id;
        const active = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all"
                style={{
                  background: done ? '#15803D' : active ? 'rgba(21,128,61,0.12)' : '#F1F5F9',
                  border: done ? '2px solid #15803D' : active ? '2px solid rgba(21,128,61,0.6)' : '2px solid #CBD5E1',
                  color: done ? 'white' : active ? '#15803D' : '#64748B',
                  boxShadow: active ? '0 0 16px rgba(21,128,61,0.2)' : 'none',
                }}
              >
                {done ? <CheckCircle2 size={14} /> : <span>{step.id}</span>}
              </div>
              <span className="text-[10px] font-semibold mt-1.5" style={{ color: active ? '#15803D' : done ? '#475569' : '#94A3B8' }}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mt-[-12px] transition-all"
                style={{ background: done ? '#15803D' : '#CBD5E1' }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const SELECT_STYLE = {
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
  backgroundSize: '1.2rem',
  paddingRight: '2.5rem',
};

export default function NewBooking() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    workType: 'ploughing', areaAcres: '', scheduledDate: '',
    timeSlot: 'morning', address: '', village: ''
  });
  const [estimate, setEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [apiError, setApiError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submitting } = useSelector((state) => state.bookings);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const nextStep = async () => {
    if (step === 2) {
      setLoadingEstimate(true);
      setApiError(null);
      try {
        const response = await API.get(`/bookings/estimate?workType=${formData.workType}&areaAcres=${formData.areaAcres}`);
        setEstimate(response.data.data);
        setStep(3);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to calculate pricing estimate.');
      } finally {
        setLoadingEstimate(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const handleConfirm = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      areaAcres: parseFloat(formData.areaAcres),
      fieldLocation: { address: formData.address, village: formData.village }
    };
    dispatch(requestBooking(payload)).then((res) => {
      if (!res.error) navigate('/farmer');
    });
  };

  const WORK_TYPES = [
    { value: 'ploughing', label: '🌾 Ploughing (Tilling)' },
    { value: 'rotavating', label: '🔄 Rotavating' },
    { value: 'seeding', label: '🌱 Seeding / Planting' },
    { value: 'spraying', label: '💧 Crop Spraying' },
    { value: 'harvesting', label: '🚜 Harvesting' },
    { value: 'transportation', label: '🚛 Haulage / Transportation' },
  ];

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">

        {/* Page title */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#15803D' }}>New Request</p>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Book Service Operator</h1>
          <p className="text-sm mt-1 text-slate-500">Complete the booking wizard to schedule fleet assets.</p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Wizard Panel */}
        <div className="bg-white border border-green-50 rounded-3xl shadow-xl overflow-hidden" style={{ boxShadow: '0 20px 40px -15px rgba(21,128,61,0.06)' }}>

          {apiError && (
            <div className="mx-6 mt-6 flex items-start gap-2.5 p-3.5 rounded-xl text-sm bg-red-50 border border-red-100 text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="p-7">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-5">
                  <Tractor size={18} style={{ color: '#15803D' }} />
                  <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Service Classification</h2>
                </div>

                <div>
                  <label className="form-label">Select Service Type</label>
                  <select name="workType" value={formData.workType} onChange={handleChange} className="form-input" style={SELECT_STYLE}>
                    {WORK_TYPES.map(wt => <option key={wt.value} value={wt.value}>{wt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">Required Area (Acres)</label>
                  <input type="number" name="areaAcres" placeholder="e.g. 5.0" min="0.5" step="0.5" value={formData.areaAcres} onChange={handleChange} className="form-input" required />
                  <p className="text-[11px] mt-1.5 text-slate-400">Minimum 0.5 acres. Pricing scales linearly with land area.</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={nextStep}
                    disabled={!formData.areaAcres || parseFloat(formData.areaAcres) <= 0}
                    className="btn-primary"
                  >
                    Next Step <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-5">
                  <Calendar size={18} style={{ color: '#15803D' }} />
                  <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Schedule & Target Land</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Execution Date</label>
                    <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Preferred Shift</label>
                    <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className="form-input" style={SELECT_STYLE}>
                      <option value="morning">Morning (8:00 AM – 12:00 PM)</option>
                      <option value="afternoon">Afternoon (1:00 PM – 5:00 PM)</option>
                      <option value="evening">Evening (6:00 PM – 9:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Field Village / Landmark</label>
                  <input type="text" name="village" placeholder="Village name / District" value={formData.village} onChange={handleChange} className="form-input" required />
                </div>

                <div>
                  <label className="form-label">Plot Boundary Notes</label>
                  <textarea name="address" placeholder="Precise location markers, landmark descriptions..." value={formData.address} onChange={handleChange} rows={2} className="form-input" style={{ resize: 'vertical' }} />
                </div>

                <div className="pt-2 flex justify-between">
                  <button onClick={prevStep} className="btn-secondary">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={nextStep} disabled={!formData.scheduledDate || !formData.village || loadingEstimate} className="btn-primary">
                    {loadingEstimate ? <div className="spinner" /> : <>Get Estimate <ChevronRight size={16} /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && estimate && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-5">
                  <CheckCircle2 size={18} style={{ color: '#15803D' }} />
                  <h2 className="font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Booking Summary</h2>
                </div>

                {/* Summary details */}
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  {[
                    { label: 'Service Category', value: <span className="font-bold text-slate-800 uppercase">{formData.workType}</span> },
                    { label: 'Target Area', value: `${formData.areaAcres} Acres` },
                    { label: 'Execution Date', value: `${new Date(formData.scheduledDate).toLocaleDateString('en-IN')}` },
                    { label: 'Shift', value: <span className="capitalize">{formData.timeSlot}</span> },
                    { label: 'Field Location', value: formData.village },
                  ].map((row, i) => (
                    <div key={row.label} className="flex justify-between items-center px-5 py-3 border-b border-slate-100" style={{ background: i % 2 === 0 ? '#F9FBF9' : 'transparent' }}>
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className="text-sm font-semibold text-slate-700">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="rounded-xl p-5 space-y-2 bg-green-50/30 border border-green-100">
                  <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#15803D' }}>Cost Estimate</div>
                  {[
                    { icon: <Clock size={13} />, label: 'Estimated Duration', value: `${estimate.estimatedHours} Hours` },
                    { icon: <Fuel size={13} />, label: 'Estimated Fuel', value: `${estimate.estimatedFuel} Liters` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500">{r.icon}{r.label}</span>
                      <span className="text-slate-600 font-semibold">{r.value}</span>
                    </div>
                  ))}
                  <div className="divider my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">Estimated Price</span>
                    <span className="text-xl font-bold" style={{ color: '#15803D', fontFamily: 'Sora, sans-serif' }}>₹{estimate.estimatedCost?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between">
                  <button onClick={prevStep} disabled={submitting} className="btn-secondary">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button onClick={handleConfirm} disabled={submitting} className="btn-primary" style={{ padding: '0.7rem 1.75rem' }}>
                    {submitting ? <div className="spinner" /> : <><CheckCircle2 size={16} /> Confirm Booking</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
