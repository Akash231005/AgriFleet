import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, AlertCircle, X, ShieldAlert, Eye,
  Search, ShieldCheck, HelpCircle, FileText, Download, UserCheck, Ban
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import API from '../../utils/api';

/* --- Review Modal --- */
function ApplicationModal({ applicantId, onClose, onRefresh }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Action states
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showRequestDocsForm, setShowRequestDocsForm] = useState(false);
  const [requestComments, setRequestComments] = useState('');

  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/drivers/admin/applications/${applicantId}`);
      setDetails(res.data.data);
      if (res.data.data.documents && res.data.data.documents.length > 0) {
        setSelectedDoc(res.data.data.documents[0]);
      }
    } catch (err) {
      console.error('Failed to load application details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicantId) loadDetails();
  }, [applicantId]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to APPROVE this driver? This generates a Driver ID and activates their dashboard access.')) return;
    setActionLoading(true);
    try {
      await API.patch(`/drivers/admin/applications/${applicantId}/approve`);
      alert('Driver application approved successfully!');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setActionLoading(true);
    try {
      await API.patch(`/drivers/admin/applications/${applicantId}/reject`, { rejectionReason });
      alert('Driver application rejected.');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestDocsSubmit = async (e) => {
    e.preventDefault();
    if (!requestComments.trim()) return;
    setActionLoading(true);
    try {
      await API.patch(`/drivers/admin/applications/${applicantId}/request-docs`, { comments: requestComments });
      alert('Feedback and request sent to driver.');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!window.confirm('Are you sure you want to SUSPEND this driver? This disables their operational portal access.')) return;
    setActionLoading(true);
    try {
      await API.patch(`/drivers/admin/applications/${applicantId}/suspend`);
      alert('Driver account suspended.');
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend account.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !details) {
    return (
      <div className="modal-overlay">
        <div className="modal-card flex items-center justify-center py-20" style={{ maxWidth: '40rem' }}>
          <div className="w-8 h-8 rounded-full border-[3px] animate-spin" style={{ borderColor: 'rgba(21,128,61,0.15)', borderTopColor: '#15803D' }} />
        </div>
      </div>
    );
  }

  const { driver, bank, documents, application } = details;
  const isPending = driver.approvalStatus === 'PENDING_APPROVAL';
  const isDocsRequested = driver.approvalStatus === 'DOCS_REQUESTED';
  const isApproved = driver.approvalStatus === 'APPROVED';
  const isSuspended = driver.approvalStatus === 'SUSPENDED';

  // Base URL for serving static media from backend
  const mediaBaseUrl = import.meta.env.VITE_API_MEDIA_URL;
  if (!mediaBaseUrl) {
    throw new Error('VITE_API_MEDIA_URL environment variable is missing. Check your .env file.');
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '64rem', width: '100%', height: '90vh', display: 'flex', flexDirection: 'col', padding: 0, overflow: 'hidden' }}>

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.15)', color: '#15803D' }}>
              {driver.userId?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                Review Onboarding: {driver.userId?.name}
              </h2>
              <p className="text-xs text-gray-500">
                Status: <span className="font-semibold uppercase" style={{ color: '#15803D' }}>{driver.approvalStatus}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable Split Pane) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Left Panel: Profile Details */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 border-r" style={{ borderColor: '#E5E7EB' }}>

            {/* Personal Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-1" style={{ borderColor: '#E5E7EB' }}>Personal Profile</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800">{driver.userId?.email}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Phone</span>
                  <span className="font-semibold text-gray-800">{driver.userId?.phone}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Date of Birth</span>
                  <span className="font-semibold text-gray-800">
                    {driver.dob ? new Date(driver.dob).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400">Gender</span>
                  <span className="font-semibold text-gray-800 capitalize">{driver.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Emergency Contact</span>
                  <span className="font-semibold text-gray-800">{driver.emergencyContact || 'N/A'}</span>
                </div>
                {driver.driverId && (
                  <div>
                    <span className="block text-gray-400">Driver ID</span>
                    <span className="font-bold" style={{ color: '#15803D' }}>{driver.driverId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-1" style={{ borderColor: '#E5E7EB' }}>Address Details</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-gray-400">Village</span>
                  <span className="font-semibold text-gray-800">{driver.address?.village || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Taluk</span>
                  <span className="font-semibold text-gray-800">{driver.address?.taluk || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-400">District / State</span>
                  <span className="font-semibold text-gray-800">
                    {driver.address?.district}, {driver.address?.state}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400">Pincode</span>
                  <span className="font-semibold text-gray-800">{driver.address?.pincode || 'N/A'}</span>
                </div>
              </div>
              <div className="text-xs">
                <span className="block text-gray-400">Full Address</span>
                <span className="font-medium text-gray-700">{driver.address?.fullAddress || 'N/A'}</span>
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-1" style={{ borderColor: '#E5E7EB' }}>Professional Experience</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-gray-400">Total Experience</span>
                  <span className="font-semibold text-gray-800">{driver.experienceYears} Years</span>
                </div>
                <div>
                  <span className="block text-gray-400">Tractor Driving</span>
                  <span className="font-semibold text-gray-800">{driver.tractorExperienceYears} Years</span>
                </div>
                <div>
                  <span className="block text-gray-400">License Number</span>
                  <span className="font-semibold text-gray-800">{driver.licenseNumber}</span>
                </div>
                <div>
                  <span className="block text-gray-400">License Expiry</span>
                  <span className="font-semibold text-gray-800">
                    {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400">Languages</span>
                  <span className="font-semibold text-gray-800">{driver.languages?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-400">Preferred Districts</span>
                  <span className="font-semibold text-gray-800">{driver.preferredDistricts?.join(', ') || 'N/A'}</span>
                </div>
              </div>
              {driver.otherMachinery && (
                <div className="text-xs">
                  <span className="block text-gray-400">Other Machinery Skills</span>
                  <span className="font-medium text-gray-700">{driver.otherMachinery}</span>
                </div>
              )}
            </div>

            {/* Financial Details */}
            {bank && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-1" style={{ borderColor: '#E5E7EB' }}>Bank Account Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-gray-400">Holder Name</span>
                    <span className="font-semibold text-gray-800">{bank.accountHolderName}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Bank Name</span>
                    <span className="font-semibold text-gray-800">{bank.bankName}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Account Number</span>
                    <span className="font-semibold text-gray-800">{bank.accountNumber}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">IFSC Code</span>
                    <span className="font-semibold text-gray-800">{bank.ifscCode}</span>
                  </div>
                  {bank.upiId && (
                    <div className="col-span-2">
                      <span className="block text-gray-400">UPI ID</span>
                      <span className="font-semibold" style={{ color: '#15803D' }}>{bank.upiId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Logs */}
            {application && application.history && application.history.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-1" style={{ borderColor: '#E5E7EB' }}>Application History</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {application.history.map((hist, idx) => (
                    <div key={idx} className="text-[10px] p-2 rounded border space-y-1" style={{ background: '#F9FAFB', borderColor: '#E5E7EB' }}>
                      <div className="flex justify-between font-semibold">
                        <span className="uppercase" style={{ color: '#15803D' }}>{hist.status}</span>
                        <span className="text-gray-400">
                          {new Date(hist.updatedAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {hist.comments && <p className="text-gray-500">{hist.comments}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Document Inspector */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden" style={{ background: '#F9FAFB' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b pb-2 mb-4" style={{ borderColor: '#E5E7EB' }}>
              Document Verification Panel
            </h3>

            {/* List of uploaded documents */}
            <div className="flex gap-2 pb-3 overflow-x-auto select-none border-b mb-4" style={{ borderColor: '#E5E7EB' }}>
              {documents && documents.length > 0 ? (
                documents.map((doc) => {
                  const isSelected = selectedDoc && selectedDoc._id === doc._id;
                  return (
                    <button
                      key={doc._id}
                      onClick={() => setSelectedDoc(doc)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
                      style={{
                        background: isSelected ? 'rgba(21,128,61,0.08)' : '#FFFFFF',
                        borderColor: isSelected ? '#15803D' : '#E5E7EB',
                        color: isSelected ? '#15803D' : '#6B7280'
                      }}
                    >
                      <FileText size={12} />
                      {doc.documentType?.replace('_', ' ')}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-gray-400 py-2">No documents uploaded.</div>
              )}
            </div>

            {/* Document display preview */}
            {selectedDoc ? (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-900 uppercase">{selectedDoc.documentType?.replace('_', ' ')}</span>
                  <a
                    href={`${mediaBaseUrl}${selectedDoc.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:underline font-semibold"
                    style={{ color: '#15803D' }}
                  >
                    <Download size={12} /> Open original window
                  </a>
                </div>

                <div className="flex-1 bg-white border rounded-xl overflow-hidden relative flex items-center justify-center" style={{ borderColor: '#E5E7EB' }}>
                  {selectedDoc.fileUrl?.endsWith('.pdf') ? (
                    <iframe
                      src={`${mediaBaseUrl}${selectedDoc.fileUrl}`}
                      className="w-full h-full"
                      title="PDF Doc Preview"
                    />
                  ) : (
                    <img
                      src={`${mediaBaseUrl}${selectedDoc.fileUrl}`}
                      alt={selectedDoc.documentType}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border border-dashed rounded-xl text-xs text-gray-400" style={{ borderColor: '#D1D5DB' }}>
                Select a document to preview
              </div>
            )}

          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t flex flex-wrap gap-3 justify-end items-center" style={{ borderColor: '#E5E7EB', background: '#F9FAFB' }}>

          {/* Default Actions */}
          {!showRejectForm && !showRequestDocsForm && (
            <>
              {(isPending || isDocsRequested) && (
                <>
                  <button
                    onClick={() => setShowRequestDocsForm(true)}
                    disabled={actionLoading}
                    className="btn-secondary text-amber-500 border-amber-500/20 hover:bg-amber-500/5"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}
                  >
                    Request Documents
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    className="btn-danger"
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}
                  >
                    <UserCheck size={14} /> Approve Driver
                  </button>
                </>
              )}

              {isApproved && (
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading}
                  className="btn-danger flex items-center gap-1.5"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}
                >
                  <Ban size={14} /> Suspend Operator
                </button>
              )}

              {isSuspended && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}
                >
                  Unsuspend & Activate
                </button>
              )}

              <button onClick={onClose} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem' }}>
                Close
              </button>
            </>
          )}

          {/* Form: Request Documents */}
          {showRequestDocsForm && (
            <form onSubmit={handleRequestDocsSubmit} className="w-full flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="form-label text-amber-500">Provide document comments (instructions to driver) *</label>
                <input
                  type="text"
                  placeholder="e.g. Please re-upload a clearer Passport photo and Aadhaar front image."
                  value={requestComments}
                  onChange={e => setRequestComments(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestDocsForm(false)}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}
                >
                  Send Request
                </button>
              </div>
            </form>
          )}

          {/* Form: Reject Driver */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="w-full flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="form-label text-red-500">Reason for Rejection *</label>
                <input
                  type="text"
                  placeholder="e.g. Police verification certificate rejected due to mismatching background checks."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

/* --- Main Page --- */
export default function DriverApplications() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('PENDING_APPROVAL'); // PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
  const [reviewId, setReviewId] = useState(null);

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const res = await API.get('/drivers/admin/applications', {
        params: { status: selectedTab }
      });
      setApplicants(res.data.data);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [selectedTab]);

  // Filter based on search query
  const filteredApplicants = applicants.filter(app => {
    const name = app.userId?.name?.toLowerCase() || '';
    const email = app.userId?.email?.toLowerCase() || '';
    const phone = app.userId?.phone || '';
    const id = app.driverId?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q);
  });

  return (
    <PageWrapper>
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#15803D' }}>Admin Command</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
            Driver Applications
          </h1>
          <p className="text-sm mt-1 text-gray-500">
            Review self-registered driver profiles, verify uploaded documents, and approve credentials.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b pb-px overflow-x-auto" style={{ borderColor: '#E5E7EB' }}>
        {[
          { key: 'PENDING_APPROVAL', label: 'Pending Review' },
          { key: 'DOCS_REQUESTED', label: 'Docs Requested' },
          { key: 'APPROVED', label: 'Approved Operators' },
          { key: 'REJECTED', label: 'Rejected Applications' },
          { key: 'SUSPENDED', label: 'Suspended Drivers' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap focus:outline-none"
            style={{
              borderColor: selectedTab === tab.key ? '#15803D' : 'transparent',
              color: selectedTab === tab.key ? '#15803D' : '#6B7280'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center gap-3 bg-white border px-4 py-2.5 rounded-xl" style={{ borderColor: '#E5E7EB' }}>
        <Search size={15} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, or Driver ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-gray-800 outline-none flex-1 placeholder-gray-400"
        />
      </div>

      {/* Grid / Table content */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-10 h-10 rounded-full border-[3px] animate-spin" style={{ borderColor: 'rgba(21,128,61,0.15)', borderTopColor: '#15803D' }} />
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl border bg-white" style={{ borderColor: '#E5E7EB' }}>
          <HelpCircle size={40} style={{ color: '#D1D5DB', margin: '0 auto' }} />
          <p className="font-semibold text-gray-700 text-sm">No applications found.</p>
          <p className="text-xs text-gray-400">No driver profiles match the selected status.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operator details</th>
                <th>Experience</th>
                <th>Mobile</th>
                <th>Registered At</th>
                <th>License Info</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((applicant) => (
                <tr key={applicant._id}>
                  <td>
                    <div>
                      <div className="font-bold text-gray-900">{applicant.userId?.name || 'N/A'}</div>
                      <div className="text-[10px] mt-0.5 text-gray-400">{applicant.userId?.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">{applicant.experienceYears} Years Total</span>
                      <span className="block text-[10px] text-gray-400">
                        Tractor: {applicant.tractorExperienceYears} Yrs
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-gray-700">
                      {applicant.userId?.phone || applicant.phone}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-500">
                      {new Date(applicant.joinedAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">{applicant.licenseNumber}</span>
                      <span className="block text-[10px] text-gray-400">
                        Exp: {applicant.licenseExpiry ? new Date(applicant.licenseExpiry).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setReviewId(applicant._id)}
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.875rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={12} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review details modal */}
      {reviewId && (
        <ApplicationModal
          applicantId={reviewId}
          onClose={() => setReviewId(null)}
          onRefresh={loadApplicants}
        />
      )}

    </PageWrapper>
  );
}
