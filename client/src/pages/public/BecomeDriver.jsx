import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Tractor, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, 
  Upload, Eye, Trash2, ShieldCheck, Landmark, Briefcase, MapPin, User 
} from 'lucide-react';
import { registerDriver } from '../../features/auth/authSlice';

const STEPS = [
  { label: 'Personal', icon: <User size={16} /> },
  { label: 'Address', icon: <MapPin size={16} /> },
  { label: 'Professional', icon: <Briefcase size={16} /> },
  { label: 'Bank Details', icon: <Landmark size={16} /> },
  { label: 'Documents', icon: <Upload size={16} /> }
];

const MANDATORY_DOCS = [
  { key: 'passport_photo', label: 'Passport Size Photo *' },
  { key: 'aadhaar_front', label: 'Aadhaar Card (Front) *' },
  { key: 'aadhaar_back', label: 'Aadhaar Card (Back) *' },
  { key: 'pan_card', label: 'PAN Card *' },
  { key: 'dl_front', label: 'Driving License (Front) *' },
  { key: 'dl_back', label: 'Driving License (Back) *' },
  { key: 'tractor_cert', label: 'Tractor Certification (If available)' },
  { key: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque *' },
  { key: 'police_verification', label: 'Police Verification *' },
  { key: 'medical_fitness', label: 'Medical Fitness Certificate *' }
];

const OPTIONAL_DOCS = [
  { key: 'prev_employment', label: 'Previous Employment Proof' },
  { key: 'add_cert', label: 'Additional Certifications' },
  { key: 'training_cert', label: 'Equipment Training Certificates' }
];

export default function BecomeDriver() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Form States
  const [personal, setPersonal] = useState({
    name: '', dob: '', gender: 'male', phone: '',
    email: '', password: '', confirmPassword: '', emergencyContact: ''
  });

  const [address, setAddress] = useState({
    village: '', taluk: '', district: '', state: '', pincode: '', fullAddress: ''
  });

  const [professional, setProfessional] = useState({
    experienceYears: '', tractorExperienceYears: '', otherMachinery: '',
    languages: '', preferredDistricts: '', licenseNumber: '', licenseExpiry: ''
  });

  const [bank, setBank] = useState({
    accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: ''
  });

  const [documents, setDocuments] = useState({});

  // File Upload Handler
  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments(prev => ({
        ...prev,
        [key]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (key) => {
    setDocuments(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  // Validators
  const validateStep = (step) => {
    const errors = {};

    if (step === 0) {
      if (!personal.name.trim()) errors.name = 'Full Name is required';
      if (!personal.dob) errors.dob = 'Date of Birth is required';
      
      // Mobile validation: 10 digits
      if (!/^[6-9]\d{9}$/.test(personal.phone)) {
        errors.phone = 'Enter a valid 10-digit Indian mobile number';
      }
      
      // Email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email)) {
        errors.email = 'Enter a valid email address';
      }
      
      // Password validation: min 8, uppercase, number, special character
      if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}/.test(personal.password)) {
        errors.password = 'Password must be min 8 characters, with 1 uppercase, 1 number, and 1 special symbol';
      }

      if (personal.password !== personal.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!/^[6-9]\d{9}$/.test(personal.emergencyContact)) {
        errors.emergencyContact = 'Enter a valid emergency contact number';
      }
    }

    if (step === 1) {
      if (!address.village.trim()) errors.village = 'Village is required';
      if (!address.taluk.trim()) errors.taluk = 'Taluk is required';
      if (!address.district.trim()) errors.district = 'District is required';
      if (!address.state.trim()) errors.state = 'State is required';
      if (!/^\d{6}$/.test(address.pincode)) errors.pincode = 'Enter a valid 6-digit Pincode';
      if (!address.fullAddress.trim()) errors.fullAddress = 'Full Address is required';
    }

    if (step === 2) {
      if (professional.experienceYears === '') errors.experienceYears = 'Experience is required';
      if (professional.tractorExperienceYears === '') errors.tractorExperienceYears = 'Tractor Experience is required';
      if (!professional.preferredDistricts.trim()) errors.preferredDistricts = 'Preferred Working Districts required';
      if (!professional.licenseNumber.trim()) errors.licenseNumber = 'License Number is required';
      if (!professional.licenseExpiry) errors.licenseExpiry = 'License Expiry Date is required';
    }

    if (step === 3) {
      if (!bank.accountHolderName.trim()) errors.accountHolderName = 'Account Holder Name is required';
      if (!bank.bankName.trim()) errors.bankName = 'Bank Name is required';
      if (!bank.accountNumber.trim()) errors.accountNumber = 'Account Number is required';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bank.ifscCode)) {
        errors.ifscCode = 'Enter a valid 11-digit IFSC code (e.g. SBIN0012345)';
      }
    }

    if (step === 4) {
      // Validate mandatory documents uploaded
      MANDATORY_DOCS.forEach(doc => {
        // tractor_cert is conditional: optional (if available)
        if (doc.key !== 'tractor_cert' && !documents[doc.key]) {
          errors[doc.key] = `${doc.label.replace(' *', '')} is required`;
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const languagesArray = professional.languages
      ? professional.languages.split(',').map(l => l.trim())
      : [];
    const preferredDistrictsArray = professional.preferredDistricts
      ? professional.preferredDistricts.split(',').map(d => d.trim())
      : [];

    const payload = {
      personalDetails: {
        name: personal.name,
        dob: personal.dob,
        gender: personal.gender,
        phone: personal.phone,
        email: personal.email,
        password: personal.password,
        emergencyContact: personal.emergencyContact
      },
      addressDetails: address,
      professionalDetails: {
        experienceYears: Number(professional.experienceYears),
        tractorExperienceYears: Number(professional.tractorExperienceYears),
        otherMachinery: professional.otherMachinery,
        languages: languagesArray,
        preferredDistricts: preferredDistrictsArray,
        licenseNumber: professional.licenseNumber,
        licenseExpiry: professional.licenseExpiry
      },
      bankDetails: bank,
      documents
    };

    const result = await dispatch(registerDriver(payload));
    if (registerDriver.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/driver');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between" style={{ backgroundColor: '#050816' }}>
      {/* Header */}
      <header
        className="px-6 md:px-12 h-16 flex justify-between items-center"
        style={{ background: 'rgba(5,8,22,0.92)', borderBottom: '1px solid #1E293B' }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Tractor size={16} style={{ color: '#22C55E' }} />
          </div>
          <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Agri<span style={{ color: '#22C55E' }}>Fleet</span>
          </span>
        </Link>
        <span className="text-xs" style={{ color: '#64748B' }}>
          Already have an application? <Link to="/login" className="text-emerald-500 hover:underline">Log In</Link>
        </span>
      </header>

      {/* Main Form container */}
      <main className="flex-1 flex items-center justify-center p-5 md:p-10">
        {success ? (
          <div 
            className="w-full max-w-xl p-8 rounded-2xl text-center space-y-6 animate-fade-in"
            style={{ background: '#0B132B', border: '1px solid #1E293B', boxShadow: '0 24px 64px -12px rgba(0,0,0,0.6)' }}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 animate-pulse">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                Application Submitted!
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
                Your application has been submitted successfully. Our team will review your documents and approve your account within 24-72 hours.
              </p>
            </div>
            <div className="text-xs" style={{ color: '#64748B' }}>
              Redirecting you to the operator dashboard in a few seconds...
            </div>
          </div>
        ) : (
          <div 
            className="w-full max-w-4xl p-6 md:p-8 rounded-2xl space-y-6"
            style={{ background: '#0B132B', border: '1px solid #1E293B', boxShadow: '0 24px 64px -12px rgba(0,0,0,0.6)' }}
          >
            {/* Form Title */}
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                <ShieldCheck className="text-emerald-500" /> Become an AgriFleet Operator
              </h1>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>
                Onboard as a professional tractor and machinery operator. Maintain your profile, bank info, and view job queues.
              </p>
            </div>

            {/* Stepper progress */}
            <div className="grid grid-cols-5 gap-2 pb-4 border-b border-slate-800">
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <div key={step.label} className="text-center space-y-1.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all font-bold text-xs"
                      style={{
                        background: isCompleted ? 'rgba(34,197,94,0.15)' : isActive ? 'rgba(16,185,129,0.1)' : 'rgba(5,8,22,0.4)',
                        border: isCompleted ? '1px solid #22C55E' : isActive ? '1px solid #10B981' : '1px solid #1E293B',
                        color: isCompleted ? '#22C55E' : isActive ? '#10B981' : '#475569'
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={14} /> : step.icon}
                    </div>
                    <span 
                      className="hidden md:block text-[10px] font-semibold tracking-wider uppercase"
                      style={{ color: isActive ? '#10B981' : isCompleted ? '#22C55E' : '#475569' }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Display errors */}
            {(authError || Object.keys(validationErrors).length > 0) && (
              <div 
                className="flex items-start gap-2.5 p-4 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
              >
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span className="font-semibold">Please correct the following errors:</span>
                  <ul className="list-disc list-inside text-xs space-y-0.5">
                    {authError && <li>{authError}</li>}
                    {Object.values(validationErrors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Stepper Form Content */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: Personal Details */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-800"><h3 className="font-bold text-slate-300 text-sm">Personal Details</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rajesh Kumar" 
                        value={personal.name}
                        onChange={e => setPersonal({ ...personal, name: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Date of Birth *</label>
                      <input 
                        type="date" 
                        value={personal.dob}
                        onChange={e => setPersonal({ ...personal, dob: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Gender *</label>
                      <select 
                        value={personal.gender}
                        onChange={e => setPersonal({ ...personal, gender: e.target.value })}
                        className="form-input"
                        style={{
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '1.2rem',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Mobile Number *</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. 9876543210" 
                        value={personal.phone}
                        onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address *</label>
                      <input 
                        type="email" 
                        placeholder="e.g. rajesh@example.com" 
                        value={personal.email}
                        onChange={e => setPersonal({ ...personal, email: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Emergency Contact Number *</label>
                      <input 
                        type="tel" 
                        placeholder="Emergency Contact" 
                        value={personal.emergencyContact}
                        onChange={e => setPersonal({ ...personal, emergencyContact: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Password *</label>
                      <input 
                        type="password" 
                        placeholder="Password" 
                        value={personal.password}
                        onChange={e => setPersonal({ ...personal, password: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirm Password *</label>
                      <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        value={personal.confirmPassword}
                        onChange={e => setPersonal({ ...personal, confirmPassword: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Address Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-800"><h3 className="font-bold text-slate-300 text-sm">Address Details</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Village / Locality *</label>
                      <input 
                        type="text" 
                        placeholder="Village name" 
                        value={address.village}
                        onChange={e => setAddress({ ...address, village: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Taluk *</label>
                      <input 
                        type="text" 
                        placeholder="Taluk" 
                        value={address.taluk}
                        onChange={e => setAddress({ ...address, taluk: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">District *</label>
                      <input 
                        type="text" 
                        placeholder="District" 
                        value={address.district}
                        onChange={e => setAddress({ ...address, district: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">State *</label>
                      <input 
                        type="text" 
                        placeholder="State" 
                        value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Pincode *</label>
                      <input 
                        type="text" 
                        placeholder="6-digit Pincode" 
                        value={address.pincode}
                        onChange={e => setAddress({ ...address, pincode: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Full Address *</label>
                    <textarea 
                      placeholder="Door no, Street, Landmark details..." 
                      value={address.fullAddress}
                      onChange={e => setAddress({ ...address, fullAddress: e.target.value })}
                      className="form-input" 
                      rows={3}
                      required 
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Professional Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-800"><h3 className="font-bold text-slate-300 text-sm">Professional Details</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Years of Driving Experience *</label>
                      <input 
                        type="number" 
                        placeholder="Total years" 
                        min="0"
                        value={professional.experienceYears}
                        onChange={e => setProfessional({ ...professional, experienceYears: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Tractor Driving Experience (Years) *</label>
                      <input 
                        type="number" 
                        placeholder="Tractor years" 
                        min="0"
                        value={professional.tractorExperienceYears}
                        onChange={e => setProfessional({ ...professional, tractorExperienceYears: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Driving License Number *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. KA5120230012345" 
                        value={professional.licenseNumber}
                        onChange={e => setProfessional({ ...professional, licenseNumber: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">License Expiry Date *</label>
                      <input 
                        type="date" 
                        value={professional.licenseExpiry}
                        onChange={e => setProfessional({ ...professional, licenseExpiry: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Languages Known (comma-separated) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Kannada, Hindi, English" 
                        value={professional.languages}
                        onChange={e => setProfessional({ ...professional, languages: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">Preferred Working Districts (comma-separated) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mandya, Mysore, Hassan" 
                        value={professional.preferredDistricts}
                        onChange={e => setProfessional({ ...professional, preferredDistricts: e.target.value })}
                        className="form-input" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Other Machinery Experience Details</label>
                    <textarea 
                      placeholder="List rotavator, harvester, seed sowing drill or other specialized attachments you have operated..." 
                      value={professional.otherMachinery}
                      onChange={e => setProfessional({ ...professional, otherMachinery: e.target.value })}
                      className="form-input" 
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Bank Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-800"><h3 className="font-bold text-slate-300 text-sm">Bank Details</h3></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Account Holder Name *</label>
                      <input 
                        type="text" 
                        placeholder="Name in passbook" 
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
                        placeholder="Bank name" 
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
                        placeholder="Bank account number" 
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
                        placeholder="e.g. SBIN0001234" 
                        value={bank.ifscCode}
                        onChange={e => setBank({ ...bank, ifscCode: e.target.value.toUpperCase() })}
                        className="form-input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="form-label">UPI ID (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="upi@bank" 
                        value={bank.upiId}
                        onChange={e => setBank({ ...bank, upiId: e.target.value })}
                        className="form-input" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Document Uploads */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {/* Mandatory section */}
                  <div className="space-y-4">
                    <div className="pb-2 border-b border-slate-800">
                      <h3 className="font-bold text-slate-300 text-sm">Mandatory Document Uploads</h3>
                      <p className="text-[10px]" style={{ color: '#64748B' }}>Upload clear images or PDFs. Limit 2MB per file.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {MANDATORY_DOCS.map(doc => {
                        const fileUrl = documents[doc.key];
                        return (
                          <div 
                            key={doc.key} 
                            className="p-4 rounded-xl flex flex-col justify-between gap-3 border transition-all"
                            style={{ 
                              background: fileUrl ? 'rgba(34,197,94,0.03)' : 'rgba(5,8,22,0.4)',
                              borderColor: fileUrl ? 'rgba(34,197,94,0.2)' : '#1E293B' 
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-semibold text-white block">{doc.label}</span>
                                <span className="text-[10px]" style={{ color: '#475569' }}>
                                  {fileUrl ? 'Uploaded' : 'No file chosen'}
                                </span>
                              </div>
                              {fileUrl && (
                                <button 
                                  type="button" 
                                  onClick={() => removeDocument(doc.key)}
                                  className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-red-500/10"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            {fileUrl ? (
                              <div className="relative rounded-lg overflow-hidden border border-slate-800 h-24 bg-slate-950 flex items-center justify-center">
                                {fileUrl.startsWith('data:application/pdf') ? (
                                  <span className="text-xs font-semibold text-slate-400">PDF Document</span>
                                ) : (
                                  <img src={fileUrl} alt={doc.label} className="w-full h-full object-contain" />
                                )}
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-1.5 py-4 border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl cursor-pointer transition-all">
                                <Upload size={14} className="text-slate-400" />
                                <span className="text-xs text-slate-300 font-medium">Choose File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={e => handleFileChange(e, doc.key)}
                                  className="hidden" 
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional section */}
                  <div className="space-y-4 pt-2">
                    <div className="pb-2 border-b border-slate-800">
                      <h3 className="font-bold text-slate-300 text-sm">Optional Document Uploads</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OPTIONAL_DOCS.map(doc => {
                        const fileUrl = documents[doc.key];
                        return (
                          <div 
                            key={doc.key} 
                            className="p-4 rounded-xl flex flex-col justify-between gap-3 border"
                            style={{ 
                              background: fileUrl ? 'rgba(34,197,94,0.03)' : 'rgba(5,8,22,0.4)',
                              borderColor: fileUrl ? 'rgba(34,197,94,0.2)' : '#1E293B' 
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-semibold text-white block">{doc.label}</span>
                                <span className="text-[10px]" style={{ color: '#475569' }}>
                                  {fileUrl ? 'Uploaded' : 'No file chosen'}
                                </span>
                              </div>
                              {fileUrl && (
                                <button 
                                  type="button" 
                                  onClick={() => removeDocument(doc.key)}
                                  className="text-red-400 hover:text-red-300 p-1.5 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-red-500/10"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            {fileUrl ? (
                              <div className="relative rounded-lg overflow-hidden border border-slate-800 h-24 bg-slate-950 flex items-center justify-center">
                                {fileUrl.startsWith('data:application/pdf') ? (
                                  <span className="text-xs font-semibold text-slate-400">PDF Document</span>
                                ) : (
                                  <img src={fileUrl} alt={doc.label} className="w-full h-full object-contain" />
                                )}
                              </div>
                            ) : (
                              <label className="flex items-center justify-center gap-1.5 py-4 border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-xl cursor-pointer transition-all">
                                <Upload size={14} className="text-slate-400" />
                                <span className="text-xs text-slate-300 font-medium">Choose File</span>
                                <input 
                                  type="file" 
                                  accept="image/*,application/pdf"
                                  onChange={e => handleFileChange(e, doc.key)}
                                  className="hidden" 
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                {currentStep > 0 ? (
                  <button 
                    type="button" 
                    onClick={handleBack} 
                    className="btn-secondary"
                    style={{ padding: '0.6rem 1.25rem' }}
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    onClick={handleNext} 
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.5rem' }}
                  >
                    Next Step <ArrowRight size={14} />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary"
                    style={{ padding: '0.65rem 2rem' }}
                  >
                    {loading ? <div className="spinner" /> : <>Submit Application <CheckCircle2 size={14} /></>}
                  </button>
                )}
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs border-t border-slate-800" style={{ color: '#334155' }}>
        © {new Date().getFullYear()} AgriFleet Co. — Onboarding Operator Portal.
      </footer>
    </div>
  );
}
