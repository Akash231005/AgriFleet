import React, { useState, useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, LogIn, AlertCircle, Eye, EyeOff, Mail, Phone, Lock } from 'lucide-react';
import { loginUser, clearError, logout, setAuthData } from '../../features/auth/authSlice';
import { DriverAuthContext } from '../../context/DriverAuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  // Track whether we already cleared the session (to avoid loop)
  const sessionCleared = useRef(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: reduxLoading, error: reduxError, token, user } = useSelector((state) => state.auth);

  const { login: driverLogin, setDriverAuth, logout: driverLogout, loading: driverLoading, driverToken } = useContext(DriverAuthContext);

  // Clear session ONCE on mount – prevents the redirect useEffect from firing on stale state
  useEffect(() => {
    if (!sessionCleared.current) {
      sessionCleared.current = true;
      dispatch(logout());
      driverLogout();
      dispatch(clearError());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect on successful login (Redux path — farmer / admin / fleet_manager)
  useEffect(() => {
    // Only redirect after session-clear is done (token will be null right after clear)
    if (!sessionCleared.current) return;
    if (token && user) {
      if (user.role === 'farmer') navigate('/farmer', { replace: true });
      else if (user.role === 'fleet_manager') navigate('/fleet', { replace: true });
      else if (user.role === 'admin') navigate('/admin', { replace: true });
      // Driver redirect is handled separately after context is populated
    }
  }, [token, user, navigate]);

  // Redirect for driver — watch driverToken from context
  useEffect(() => {
    if (!sessionCleared.current) return;
    if (driverToken && user && user.role === 'driver') {
      navigate('/driver', { replace: true });
    }
  }, [driverToken, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearError());

    const isEmail = username.includes('@');

    if (isEmail) {
      // General Login: farmer / admin / fleet_manager (and driver if they have email)
      dispatch(loginUser({ email: username, password })).then((result) => {
        if (!result.error) {
          const loggedUser = result.payload.user;
          const loggedProfile = result.payload.profile;
          const loggedToken = localStorage.getItem('agrifleet_token');

          if (loggedUser.role === 'driver' && loggedProfile) {
            // Also populate DriverAuthContext so DriverDashboard's guard passes
            setDriverAuth(loggedToken, loggedProfile);
          }
        }
      });
    } else {
      // Mobile Number → Driver login via DriverAuthContext
      try {
        const result = await driverLogin(username, password);
        if (result.success) {
          // Note: driverLogin already dispatched loginUser, which populated the Redux auth state
          // and stored agrifleet_token in localStorage. We don't need to manually read or set 
          // legacy tokens anymore.

          // Navigate immediately
          navigate('/driver', { replace: true });
        }
      } catch (err) {
        setLocalError(err.message || 'Login failed. Please verify your credentials.');
      }
    }
  };

  const loading = reduxLoading || driverLoading;
  const error = reduxError || localError;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: '#F8FAF8',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(21,128,61,0.06) 0%, transparent 60%)',
      }}
    >
      <div className="w-full max-w-[400px] space-y-6 animate-fade-in">

        {/* Logo Block */}
        <div className="text-center mb-4">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white border border-green-100 shadow-md"
              style={{ boxShadow: '0 4px 15px rgba(21, 128, 61, 0.1)' }}
            >
              <Tractor size={26} style={{ color: '#15803D' }} />
            </div>
            <span className="font-bold text-2xl text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>
              Agri<span style={{ color: '#15803D' }}>Fleet</span>
            </span>
          </Link>
          <p className="text-sm mt-2 text-gray-500">Access your agricultural operations portal</p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white rounded-3xl p-8 border shadow-xl"
          style={{ borderColor: '#E5E7EB', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)' }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Sora, sans-serif' }}>Sign In</h2>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-xs bg-red-50 border border-red-200 text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email or Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {username.includes('@') || !/^\d*$/.test(username) ? <Mail size={16} /> : <Phone size={16} />}
                </span>
                <input
                  type="text"
                  placeholder="Enter email or mobile number"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ padding: '0.8rem' }}
            >
              {loading ? <div className="spinner" /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center text-xs border-t text-gray-500" style={{ borderColor: '#E5E7EB' }}>
            New to AgriFleet?{' '}
            <Link to="/register" style={{ color: '#15803D', fontWeight: 700 }} className="hover:underline">
              Create account
            </Link>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-1.5 text-green-700 font-bold text-[10px] uppercase tracking-wider">
            💡 Demo Accounts
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Farmer Demo */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 relative group text-xs shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-center gap-1 mb-2 font-bold text-gray-800 text-sm">
                🚜 Farmer Demo
              </div>
              <div className="text-gray-500 space-y-1">
                <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                  <span className="font-medium truncate">farmer_demo@agrifleet.com</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText('farmer_demo@agrifleet.com')} className="text-green-600 hover:text-green-800 transition-colors ml-1" title="Copy Email">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                  <span>Password123!</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText('Password123!')} className="text-green-600 hover:text-green-800 transition-colors ml-1" title="Copy Password">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Driver Demo */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 relative group text-xs shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-center gap-1 mb-2 font-bold text-gray-800 text-sm">
                🚛 Driver Demo
              </div>
              <div className="text-gray-500 space-y-1">
                <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                  <span className="font-medium truncate">driver_demo@agrifleet.com</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText('driver_demo@agrifleet.com')} className="text-green-600 hover:text-green-800 transition-colors ml-1" title="Copy Email">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                  <span>Password123!</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText('Password123!')} className="text-green-600 hover:text-green-800 transition-colors ml-1" title="Copy Password">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Admin Demo */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 relative group text-xs shadow-sm hover:border-green-300 transition-colors">
              <div className="flex items-center gap-1 mb-2 font-bold text-gray-800 text-sm">
                👨💼 Admin Demo
              </div>
              <div className="text-gray-500 space-y-1">
                <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                  <span className="font-medium truncate">admin_demo@agrifleet.com</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText('admin_demo@agrifleet.com')} className="text-green-600 hover:text-green-800 transition-colors ml-1" title="Copy Email">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded">
                  <span>Password123!</span>
                  <button type="button" onClick={() => navigator.clipboard.writeText('Password123!')} className="text-green-600 hover:text-green-800 transition-colors ml-1" title="Copy Password">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
