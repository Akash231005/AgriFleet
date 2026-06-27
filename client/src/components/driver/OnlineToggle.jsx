import React, { useState } from 'react';
import driverAxios from '../../utils/driverAxios';

export default function OnlineToggle({ initialOnline, onToggleStatus }) {
  const [online, setOnline] = useState(initialOnline);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await driverAxios.patch('/dashboard/toggle-status');
      const { isOnline } = res.data.data;
      setOnline(isOnline);
      if (onToggleStatus) onToggleStatus(isOnline);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to update online status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border outline-none select-none duration-200"
      style={{
        background: online ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.08)',
        borderColor: online ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.15)',
        color: online ? '#166534' : '#64748B',
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
    >
      <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
      <span>{online ? 'ONLINE' : 'OFFLINE'}</span>
    </button>
  );
}
