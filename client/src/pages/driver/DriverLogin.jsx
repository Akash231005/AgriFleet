import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import { Phone, Lock, Eye, EyeOff, AlertCircle, Tractor } from 'lucide-react';

export default function DriverLogin() {
  const { login, driverToken, driverInfo, loading: authLoading } = useContext(DriverAuthContext);
  const navigate = useNavigate();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driverToken && driverInfo?.approvalStatus?.toUpperCase() === 'APPROVED') {
      navigate('/driver');
    }
  }, [driverToken, driverInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(mobile, password);
      navigate('/driver');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4] font-sans px-4">
      {/* Premium Glass Card */}
      <div className="w-full max-w-md bg-white/85 backdrop-blur-md border border-green-100 rounded-3xl shadow-xl p-8 space-y-6 transition-all duration-300 hover:shadow-2xl hover:border-green-200">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#dcfce7] border border-green-300 rounded-2xl flex items-center justify-center mx-auto text-[#166534] shadow-inner transform hover:rotate-6 transition-transform duration-300">
            <Tractor size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">AgriFleet Driver</h2>
          <p className="text-sm text-gray-500">Sign in to check available jobs and start earning.</p>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className={`p-4 rounded-xl flex items-start gap-3 border text-sm transition-all duration-300 ${
            errorMsg.includes('review')
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {errorMsg.includes('review') ? 'Application Pending' : 'Access Denied'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                placeholder="Enter registered mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#16a34a] focus:bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl outline-none text-sm transition-all focus:ring-2 focus:ring-green-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#16a34a] focus:bg-white text-gray-800 pl-11 pr-11 py-3 rounded-2xl outline-none text-sm transition-all focus:ring-2 focus:ring-green-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full bg-[#166534] hover:bg-[#15803d] disabled:bg-gray-400 text-white font-semibold py-3 rounded-2xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Helpful Info block */}
        <div className="bg-[#f0fdf4]/50 border border-green-100 rounded-2xl p-4 text-xs text-green-800 space-y-1 text-center">
          <p className="font-semibold">💡 Sandbox credentials are:</p>
          <p>Ramesh Kumar: <code className="bg-white px-1.5 py-0.5 rounded border border-green-200">9876543210</code> / <code className="bg-white px-1.5 py-0.5 rounded border border-green-200">Password123</code></p>
        </div>
      </div>
    </div>
  );
}
