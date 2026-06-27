import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, LogOut, ChevronDown } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';

const ROLE_CONFIG = {
  admin:         { label: 'Administrator',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
  driver:        { label: 'Field Operator',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  farmer:        { label: 'Farmer Partner',  color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)' },
  fleet_manager: { label: 'Fleet Manager',   color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
};

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const roleConf = user ? (ROLE_CONFIG[user.role] || { label: 'User', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' }) : null;

  return (
    <nav
      className="sticky top-0 z-40 flex justify-between items-center px-5 md:px-8 h-[60px]"
      style={{
        background: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid #E2E8F0',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.2)' }}
        >
          <Tractor size={16} style={{ color: '#15803D' }} />
        </div>
        <span className="font-bold text-base tracking-tight text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>
          Agri<span style={{ color: '#15803D' }}>Fleet</span>
        </span>
      </Link>

      {/* User area */}
      {user && roleConf && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 uppercase tracking-wider"
              style={{ color: roleConf.color, background: roleConf.bg, border: `1px solid ${roleConf.border}` }}
            >
              {roleConf.label}
            </span>
          </div>

          <div style={{ width: '1px', height: '28px', background: '#E2E8F0' }} className="hidden sm:block" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ color: '#64748B', border: '1px solid transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#EF4444';
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#64748B';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            title="Log Out"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Log Out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
