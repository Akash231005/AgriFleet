import React, { useContext } from 'react';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import { Home, Briefcase, Clock, IndianRupee, LogOut, Tractor, Star } from 'lucide-react';

export default function DriverSidebar({ activeTab, setActiveTab }) {
  const { driverInfo, logout } = useContext(DriverAuthContext);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { id: 'jobs', label: 'Assigned Jobs', icon: <Briefcase size={20} /> },
    { id: 'history', label: 'Job History', icon: <Clock size={20} /> },
    { id: 'payments', label: 'Payments', icon: <IndianRupee size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#166534] text-white h-screen shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-green-700/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#dcfce7] text-[#166534] rounded-xl flex items-center justify-center shadow-md">
          <Tractor size={22} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">AgriFleet</h1>
          <p className="text-[10px] text-green-200 uppercase tracking-widest font-semibold">Driver Portal</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.id
                ? 'bg-[#16a34a] text-white shadow-md'
                : 'text-green-100 hover:bg-green-700/50 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Profile Summary & Logout */}
      <div className="p-4 border-t border-green-700/50 space-y-4 bg-green-900/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-green-700/50 border border-green-500 flex items-center justify-center font-bold text-white overflow-hidden">
            {driverInfo?.profilePhoto ? (
              <img src={driverInfo.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
            ) : (
              driverInfo?.name?.charAt(0) || 'D'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate leading-tight">{driverInfo?.name || 'Driver'}</p>
            <p className="text-[10px] text-yellow-400 font-semibold flex items-center gap-0.5 mt-0.5">
              {driverInfo?.rating || 0} <Star size={10} className="fill-current" />
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-950/20 rounded-xl text-sm font-semibold transition-all border border-transparent hover:border-red-900/30"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
