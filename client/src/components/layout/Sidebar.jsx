import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  CalendarPlus,
  Tractor,
  Users,
  Wrench,
  Fuel,
  BarChart3,
  ClipboardList,
} from 'lucide-react';

function NavItem({ to, icon: Icon, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'active' : ''}`
      }
    >
      <Icon size={16} strokeWidth={isActive => isActive ? 2.5 : 2} />
      {children}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="px-3 mb-1 mt-4 first:mt-0">
      <span style={{ color: '#334155', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {children}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;

  return (
    <aside
      className="w-full md:w-56 flex-shrink-0 md:min-h-[calc(100vh-60px)] p-3 flex flex-col"
      style={{ borderRight: '1px solid #E2E8F0', background: '#FFFFFF' }}
    >
      <div className="space-y-0.5">
        {user.role === 'farmer' && (
          <>
            <SectionLabel>My Services</SectionLabel>
            <NavLink to="/farmer" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink to="/farmer/new-booking" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarPlus size={16} /> Book Service
            </NavLink>
          </>
        )}

        {user.role === 'driver' && (
          <>
            <SectionLabel>Operations</SectionLabel>
            <NavLink to="/driver" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Today's Jobs
            </NavLink>
            <NavLink to="/driver/stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={16} /> Earnings & Stats
            </NavLink>
            <NavLink to="/driver/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={16} /> Profile & Docs
            </NavLink>
          </>
        )}

        {user.role === 'fleet_manager' && (
          <>
            <SectionLabel>Fleet</SectionLabel>
            <NavLink to="/fleet" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Control Panel
            </NavLink>
            <NavLink to="/fleet/tractors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tractor size={16} /> Tractors
            </NavLink>
            <NavLink to="/fleet/attachments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={16} /> Attachments
            </NavLink>
            <NavLink to="/fleet/fuel" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Fuel size={16} /> Fuel Logs
            </NavLink>
            <NavLink to="/fleet/maintenance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Wrench size={16} /> Maintenance
            </NavLink>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <SectionLabel>Command</SectionLabel>
            <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={16} /> Command Panel
            </NavLink>
            <NavLink to="/admin/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={16} /> Bookings & Alloc.
            </NavLink>
            <NavLink to="/fleet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Tractor size={16} /> Fleet Logistics
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={16} /> Operators
            </NavLink>
            <NavLink to="/admin/applications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ClipboardList size={16} /> Driver Applications
            </NavLink>
          </>
        )}
      </div>

      {/* Bottom version tag */}
      <div className="mt-auto pt-4 px-3">
        <div
          className="text-center py-2 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}
        >
          <span style={{ color: '#22C55E', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em' }}>
            AGRIFLEET v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
