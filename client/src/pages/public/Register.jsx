import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, UserPlus, AlertCircle, Leaf, ArrowLeft, ShieldCheck, Briefcase } from 'lucide-react';
import { registerFarmer, registerDriver, clearError, logout } from '../../features/auth/authSlice';

export default function Register() {
  const [role, setRole] = useState(null); // 'farmer' or 'driver'
  const [successMessage, setSuccessMessage] = useState('');
  
  // Farmer State
  const [farmerData, setFarmerData] = useState({
    name: '', phone: '', email: '', address: '', village: '', district: '', password: ''
  });

  // Driver State
  const [driverData, setDriverData] = useState({
    name: '', phone: '', email: '', address: '', licenseNumber: '', experienceYears: '', password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, role]);

  // Prevent automatic login checks on register view
  useEffect(() => {
    if (token && user) {
      if (user.role === 'farmer') navigate('/farmer');
      else if (user.role === 'driver') navigate('/driver');
      else if (user.role === 'fleet_manager') navigate('/fleet');
      else if (user.role === 'admin') navigate('/admin');
    }
  }, [token, user, navigate]);

  const handleFarmerChange = (e) => setFarmerData({ ...farmerData, [e.target.name]: e.target.value });
  const handleDriverChange = (e) => setDriverData({ ...driverData, [e.target.name]: e.target.value });

  const handleFarmerSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: farmerData.name,
      phone: farmerData.phone,
      email: farmerData.email,
      state: farmerData.address, // Map Address to state
      village: farmerData.village,
      district: farmerData.district,
      password: farmerData.password,
      pincode: '',
      totalAcres: 0,
      landType: 'rainfed'
    };
    dispatch(registerFarmer(payload)).then((res) => {
      if (!res.error) {
        dispatch(logout()); // Clear session to prevent auto-login
        setSuccessMessage('Farmer account created successfully.');
        setTimeout(() => navigate('/login'), 2000);
      }
    });
  };

  const handleDriverSubmit = (e) => {
    e.preventDefault();
    const payload = {
      personalDetails: {
        name: driverData.name,
        phone: driverData.phone,
        email: driverData.email,
        password: driverData.password,
        dob: undefined,
        gender: 'male',
        emergencyContact: driverData.phone
      },
      addressDetails: {
        fullAddress: driverData.address,
        village: '',
        taluk: '',
        district: '',
        state: '',
        pincode: ''
      },
      professionalDetails: {
        licenseNumber: driverData.licenseNumber,
        experienceYears: Number(driverData.experienceYears) || 0,
        tractorExperienceYears: Number(driverData.experienceYears) || 0,
        languages: [],
        preferredDistricts: []
      },
      bankDetails: {},
      documents: {}
    };
    dispatch(registerDriver(payload)).then((res) => {
      if (!res.error) {
        dispatch(logout()); // Clear session to prevent auto-login
        setSuccessMessage('Driver account created successfully.');
        setTimeout(() => navigate('/login'), 2000);
      }
    });
  };

  const errorMessage = typeof error === 'string' ? error : error?.message;
  const fieldErrors = typeof error === 'object' && error?.errors ? error.errors : {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  
  // Show global error only if it exists AND it's not the redundant 'Validation Error' message when fields have details
  const showGlobalError = errorMessage && !(hasFieldErrors && errorMessage === 'Validation Error');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 py-12"
      style={{
        backgroundColor: '#F3F8F4',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(21,128,61,0.07) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-xl space-y-5 animate-fade-in">

        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-green-100 shadow-sm"
              style={{ boxShadow: '0 4px 15px rgba(21, 128, 61, 0.08)' }}
            >
              <Tractor size={22} style={{ color: '#15803D' }} />
            </div>
            <span className="font-bold text-xl text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>
              Agri<span style={{ color: '#15803D' }}>Fleet</span>
            </span>
          </Link>
          <p className="text-sm mt-2 text-slate-500">
            {role === null ? 'Join AgriFleet Platform' : role === 'farmer' ? 'Create Farmer Partner account' : 'Create Operator Account'}
          </p>
        </div>

        {/* Success alert */}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-sm bg-green-50 border border-green-200 text-green-700">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error alert */}
        {showGlobalError && (
          <div
            className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-sm bg-red-50 border border-red-100 text-red-700"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div
          className="bg-white rounded-3xl p-8 border border-green-50 shadow-xl"
          style={{ boxShadow: '0 20px 40px -15px rgba(21, 128, 61, 0.08)' }}
        >

          {/* 1. SELECTION SCREEN */}
          {role === null && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Choose Your Account Type</h2>
                <p className="text-xs text-slate-500">Select how you want to interact with AgriFleet</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className="p-6 rounded-2xl text-left border transition-all hover:bg-green-50/20 group bg-white border-slate-200"
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#15803D'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mb-4 text-[#15803D] group-hover:scale-105 transition-all">
                    <Leaf size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Farmer Account</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Book company-owned tractors and professional operators for your farm work.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('driver')}
                  className="p-6 rounded-2xl text-left border transition-all hover:bg-green-50/20 group bg-white border-slate-200"
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#15803D'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                >
                  <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center mb-4 text-[#15803D] group-hover:scale-105 transition-all">
                    <Briefcase size={24} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Driver Account</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Register as a professional driver to view, accept and execute agricultural bookings.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* 2. FARMER REGISTRATION */}
          {role === 'farmer' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} style={{ color: '#15803D' }} />
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Farmer Registration</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all"
                >
                  <ArrowLeft size={12} /> Back
                </button>
              </div>

              <form onSubmit={handleFarmerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" placeholder="Enter full name" value={farmerData.name} onChange={handleFarmerChange} className={`form-input ${fieldErrors.name ? 'border-red-500' : ''}`} required />
                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" name="phone" placeholder="10-digit mobile number" value={farmerData.phone} onChange={handleFarmerChange} className={`form-input ${fieldErrors.phone ? 'border-red-500' : ''}`} required />
                    {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" placeholder="name@example.com" value={farmerData.email} onChange={handleFarmerChange} className={`form-input ${fieldErrors.email ? 'border-red-500' : ''}`} required />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Address</label>
                    <input type="text" name="address" placeholder="Enter full address" value={farmerData.address} onChange={handleFarmerChange} className={`form-input ${fieldErrors.address ? 'border-red-500' : ''}`} required />
                    {fieldErrors.address && <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div>
                    <label className="form-label">Village</label>
                    <input type="text" name="village" placeholder="Village name" value={farmerData.village} onChange={handleFarmerChange} className={`form-input ${fieldErrors.village ? 'border-red-500' : ''}`} required />
                    {fieldErrors.village && <p className="text-xs text-red-500 mt-1">{fieldErrors.village}</p>}
                  </div>
                  <div>
                    <label className="form-label">District</label>
                    <input type="text" name="district" placeholder="District name" value={farmerData.district} onChange={handleFarmerChange} className={`form-input ${fieldErrors.district ? 'border-red-500' : ''}`} required />
                    {fieldErrors.district && <p className="text-xs text-red-500 mt-1">{fieldErrors.district}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" placeholder="Choose a password (min 8 characters)" value={farmerData.password} onChange={handleFarmerChange} className={`form-input ${fieldErrors.password ? 'border-red-500' : ''}`} required />
                    {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ padding: '0.8rem' }}>
                  {loading ? <div className="spinner" /> : <><UserPlus size={16} /> Register as Farmer</>}
                </button>
              </form>
            </div>
          )}

          {/* 3. DRIVER REGISTRATION */}
          {role === 'driver' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} style={{ color: '#15803D' }} />
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>Driver Registration</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-all"
                >
                  <ArrowLeft size={12} /> Back
                </button>
              </div>

              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" placeholder="Enter full name" value={driverData.name} onChange={handleDriverChange} className={`form-input ${fieldErrors.name ? 'border-red-500' : ''}`} required />
                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" name="phone" placeholder="10-digit mobile number" value={driverData.phone} onChange={handleDriverChange} className={`form-input ${fieldErrors.phone ? 'border-red-500' : ''}`} required />
                    {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" placeholder="name@example.com" value={driverData.email} onChange={handleDriverChange} className={`form-input ${fieldErrors.email ? 'border-red-500' : ''}`} required />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Address <span className="text-xs text-slate-400 font-normal">(Optional)</span></label>
                    <input type="text" name="address" placeholder="Enter full address" value={driverData.address} onChange={handleDriverChange} className={`form-input ${fieldErrors.address ? 'border-red-500' : ''}`} />
                    {fieldErrors.address && <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div>
                    <label className="form-label">Driving License Number <span className="text-xs text-slate-400 font-normal">(Optional)</span></label>
                    <input type="text" name="licenseNumber" placeholder="DL number" value={driverData.licenseNumber} onChange={handleDriverChange} className={`form-input ${fieldErrors.licenseNumber ? 'border-red-500' : ''}`} />
                    {fieldErrors.licenseNumber && <p className="text-xs text-red-500 mt-1">{fieldErrors.licenseNumber}</p>}
                  </div>
                  <div>
                    <label className="form-label">Years of Experience <span className="text-xs text-slate-400 font-normal">(Optional)</span></label>
                    <input type="number" name="experienceYears" placeholder="e.g. 5" min="0" value={driverData.experienceYears} onChange={handleDriverChange} className={`form-input ${fieldErrors.experienceYears ? 'border-red-500' : ''}`} />
                    {fieldErrors.experienceYears && <p className="text-xs text-red-500 mt-1">{fieldErrors.experienceYears}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" placeholder="Choose a password (min 8 characters)" value={driverData.password} onChange={handleDriverChange} className={`form-input ${fieldErrors.password ? 'border-red-500' : ''}`} required />
                    {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ padding: '0.8rem' }}>
                  {loading ? <div className="spinner" /> : <><UserPlus size={16} /> Register as Driver</>}
                </button>
              </form>
            </div>
          )}

          {/* Footer sign in link */}
          <div className="mt-5 pt-5 text-center text-xs border-t border-slate-100 text-slate-500">
            Already registered?{' '}
            <Link to="/login" style={{ color: '#15803D', fontWeight: 700 }} className="hover:underline">Sign In Here</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
