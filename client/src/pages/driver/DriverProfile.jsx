import React, { useEffect, useState } from 'react';
import { 
  User, CheckCircle2, AlertCircle, Phone, Landmark, 
  ShieldAlert, RefreshCw, Upload, FileText, ExternalLink 
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import API from '../../utils/api';

const MANDATORY_DOCS = [
  { key: 'passport_photo', label: 'Passport Size Photo' },
  { key: 'aadhaar_front', label: 'Aadhaar Card (Front)' },
  { key: 'aadhaar_back', label: 'Aadhaar Card (Back)' },
  { key: 'pan_card', label: 'PAN Card' },
  { key: 'dl_front', label: 'Driving License (Front)' },
  { key: 'dl_back', label: 'Driving License (Back)' },
  { key: 'tractor_cert', label: 'Tractor Certification' },
  { key: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
  { key: 'police_verification', label: 'Police Verification' },
  { key: 'medical_fitness', label: 'Medical Fitness Certificate' }
];

export default function DriverProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form states
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bank, setBank] = useState({
    accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: ''
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/drivers/my/profile');
      const data = res.data.data;
      setProfile(data);
      setPhone(data.user.phone || '');
      setEmergencyContact(data.driver.emergencyContact || '');
      if (data.bank) {
        setBank({
          accountHolderName: data.bank.accountHolderName || '',
          bankName: data.bank.bankName || '',
          accountNumber: data.bank.accountNumber || '',
          ifscCode: data.bank.ifscCode || '',
          upiId: data.bank.upiId || ''
        });
      }
    } catch (err) {
      console.error('Failed to load driver profile details:', err);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.patch('/drivers/my/profile', {
        phone,
        emergencyContact,
        bankDetails: bank
      });
      setSuccessMsg('Profile details updated successfully!');
      await loadProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setUpdating(false);
    }
  };

  // Upload/renew document
  const handleDocumentRenew = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setUpdating(true);
        // Step 1: Upload file and get relative url
        const uploadRes = await API.post('/drivers/upload-document', {
          documentType: docType,
          base64Data: reader.result
        });
        const fileUrl = uploadRes.data.data.fileUrl;

        // Step 2: Update re-upload document
        await API.patch('/drivers/my/reupload-documents', {
          documents: { [docType]: reader.result }
        });

        setSuccessMsg(`Document ${docType.replace('_', ' ')} updated. Application status is pending approval.`);
        await loadProfile();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update document.');
      } finally {
        setUpdating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="py-24 flex justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-emerald-500 animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  const { user, driver, documents } = profile;
  const isApproved = driver.approvalStatus === 'APPROVED';
  const mediaBaseUrl = import.meta.env.VITE_API_MEDIA_URL || 'http://localhost:5000';

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#F59E0B' }}>Driver Portal</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Profile & Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Manage your personal data, bank records, and check document verification status.
          </p>
        </div>
        <button
          onClick={loadProfile}
          className="p-2.5 rounded-xl transition-all hover:text-white"
          style={{ background: '#0B132B', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Success/Error alert */}
      {successMsg && (
        <div 
          className="flex items-center gap-2.5 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}
        >
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div 
          className="flex items-center gap-2.5 p-4 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
        >
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Account Details (Update details) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6" style={{ background: '#0B132B', border: '1px solid #1E293B' }}>
            <div className="pb-3 border-b border-slate-800 mb-5 flex items-center justify-between">
              <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-emerald-500" /> Account Profile
              </h2>
              <span 
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ 
                  background: isApproved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', 
                  color: isApproved ? '#22C55E' : '#F59E0B',
                  border: isApproved ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(245,158,11,0.2)'
                }}
              >
                {driver.approvalStatus}
              </span>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              
              {/* Profile metadata info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                <div>
                  <span style={{ color: '#475569' }} className="block mb-0.5">Operator Name</span>
                  <span className="font-bold text-white text-sm">{user.name}</span>
                </div>
                <div>
                  <span style={{ color: '#475569' }} className="block mb-0.5">Email Address</span>
                  <span className="font-semibold text-slate-300">{user.email}</span>
                </div>
                {driver.driverId && (
                  <div>
                    <span style={{ color: '#475569' }} className="block mb-0.5">Operator ID</span>
                    <span className="font-extrabold text-emerald-400">{driver.driverId}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: '#475569' }} className="block mb-0.5">Joined Date</span>
                  <span className="font-semibold text-slate-300">
                    {new Date(driver.joinedAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Emergency Contact *</label>
                  <input 
                    type="tel"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Section Divider */}
              <div className="pb-2 border-b border-slate-800 pt-3">
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Landmark size={14} className="text-emerald-500" /> Settlement Bank Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Account Holder *</label>
                  <input 
                    type="text"
                    value={bank.accountHolderName}
                    onChange={e => setBank({ ...bank, accountHolderName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Bank Name *</label>
                  <input 
                    type="text"
                    value={bank.bankName}
                    onChange={e => setBank({ ...bank, bankName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Account Number *</label>
                  <input 
                    type="text"
                    value={bank.accountNumber}
                    onChange={e => setBank({ ...bank, accountNumber: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">IFSC Code *</label>
                  <input 
                    type="text"
                    value={bank.ifscCode}
                    onChange={e => setBank({ ...bank, ifscCode: e.target.value.toUpperCase() })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">UPI ID (Optional)</label>
                  <input 
                    type="text"
                    value={bank.upiId}
                    onChange={e => setBank({ ...bank, upiId: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={updating}
                className="btn-primary w-full justify-center mt-2"
                style={{ padding: '0.75rem' }}
              >
                {updating ? <div className="spinner" /> : 'Save Changes'}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Uploaded Documents Verification Grid */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="pb-3 border-b border-slate-800 mb-5">
              <h2 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-emerald-500" /> Onboarding Documents
              </h2>
              <p className="text-[10px] mt-1" style={{ color: '#64748B' }}>
                View and manage your credential documents. To renew a document, upload a new version.
              </p>
            </div>

            <div className="space-y-3">
              {MANDATORY_DOCS.map(doc => {
                const docRecord = documents.find(d => d.documentType === doc.key);
                return (
                  <div 
                    key={doc.key}
                    className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex justify-between items-center gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-300 block leading-tight">
                        {doc.label}
                      </span>
                      {docRecord ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span 
                            className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded"
                            style={{ 
                              background: docRecord.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                              color: docRecord.status === 'approved' ? '#22C55E' : '#F59E0B'
                            }}
                          >
                            {docRecord.status}
                          </span>
                          <a 
                            href={`${mediaBaseUrl}${docRecord.fileUrl}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] text-emerald-500 hover:underline inline-flex items-center gap-0.5"
                          >
                            View <ExternalLink size={8} />
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-500 font-medium">Missing</span>
                      )}
                    </div>

                    <label className="p-2 bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-white rounded-lg cursor-pointer transition-colors text-slate-400">
                      <Upload size={12} />
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => handleDocumentRenew(e, doc.key)}
                        className="hidden" 
                        disabled={updating}
                      />
                    </label>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
