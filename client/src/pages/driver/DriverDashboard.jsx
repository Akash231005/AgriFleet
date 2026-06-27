import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DriverAuthContext } from '../../context/DriverAuthContext';
import DriverSidebar from '../../components/driver/DriverSidebar';
import OnlineToggle from '../../components/driver/OnlineToggle';
import OverviewTab from '../../components/driver/OverviewTab';
import AvailableJobsTab from '../../components/driver/AvailableJobsTab';
import JobHistoryTab from '../../components/driver/JobHistoryTab';
import PaymentsTab from '../../components/driver/PaymentsTab';
import { Home, Briefcase, Clock, IndianRupee, LogOut, AlertCircle, ChevronRight } from 'lucide-react';

export default function DriverDashboard() {
  const { driverToken, driverInfo, loading, logout } = useContext(DriverAuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && (!driverToken || !driverInfo)) {
      navigate('/login');
    }
  }, [loading, driverToken, driverInfo, navigate]);

  if (loading || !driverInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdf4]">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab setActiveTab={setActiveTab} />;
      case 'jobs':
        return <AvailableJobsTab />;
      case 'history':
        return <JobHistoryTab />;
      case 'payments':
        return <PaymentsTab />;
      default:
        return <OverviewTab setActiveTab={setActiveTab} />;
    }
  };

  const mobileNavItems = [
    { id: 'overview', label: 'Home', icon: <Home size={20} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'payments', label: 'Earnings', icon: <IndianRupee size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#f0fdf4] text-gray-800 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <DriverSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        {/* Header (Brief stats & Online Toggle) */}
        <header className="bg-white border-b border-green-100 p-4 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* User Profile Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#dcfce7] border border-green-300 flex items-center justify-center font-bold text-[#166534] overflow-hidden">
              {driverInfo.profilePhoto ? (
                <img src={driverInfo.profilePhoto} alt="Driver" className="w-full h-full object-cover" />
              ) : (
                driverInfo.name?.charAt(0) || 'D'
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Hello,</p>
              <h3 className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[120px] md:max-w-xs">{driverInfo.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <OnlineToggle initialOnline={driverInfo.isOnline} />
            <button
              onClick={logout}
              className="md:hidden p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {(driverInfo.profileStatus === 'INCOMPLETE' || driverInfo.approvalStatus === 'INCOMPLETE') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="bg-white p-2 rounded-xl text-yellow-600 shadow-sm shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-800 mb-1">Your profile is incomplete.</h3>
                <p className="text-xs text-yellow-700 leading-relaxed mb-3">
                  Please complete your profile and upload your documents to start receiving assignments. 
                  You will not receive any jobs until your account is verified.
                </p>
                <button 
                  onClick={() => navigate('/driver/profile')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Upload Documents <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 flex justify-around py-2 z-20 shadow-lg">
        {mobileNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-4 select-none focus:outline-none transition-all ${
              activeTab === item.id ? 'text-[#16a34a] font-bold' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {item.icon}
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
