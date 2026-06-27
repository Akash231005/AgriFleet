import React, { useState, useEffect } from 'react';
import driverAxios from '../../utils/driverAxios';
import { IndianRupee, Calendar, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PaymentsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await driverAxios.get('/dashboard/payments');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load payments details:', err);
      setError(err.response?.data?.message || 'Failed to fetch payments data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-200 border-t-green-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center space-y-3">
        <AlertCircle size={36} className="text-red-500" />
        <p className="text-red-800 font-semibold text-sm">{error}</p>
        <button onClick={fetchPayments} className="bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1.5">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const { lifetimeEarnings, currentMonthEarnings, lastWeekEarnings, payouts, chartData } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Earnings & Settlements</h2>
          <p className="text-xs text-gray-500">Track your payouts, completed job settlements, and revenue statistics.</p>
        </div>
        <button onClick={fetchPayments} className="p-2 bg-white border border-green-100 hover:border-green-300 rounded-xl text-gray-500 hover:text-green-700 shadow-sm transition-all">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPI stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-green-50 shadow-sm">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lifetime Earnings</div>
          <div className="text-2xl font-black text-gray-850 mt-2 flex items-center">
            <span className="text-[#16a34a] font-bold mr-0.5">₹</span>
            {lifetimeEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Total revenue generated</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-green-50 shadow-sm">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Month</div>
          <div className="text-2xl font-black text-gray-850 mt-2 flex items-center">
            <span className="text-[#16a34a] font-bold mr-0.5">₹</span>
            {currentMonthEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-green-600 font-semibold mt-1">Settled this calendar month</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-green-50 shadow-sm">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Last 7 Days</div>
          <div className="text-2xl font-black text-gray-850 mt-2 flex items-center">
            <span className="text-[#16a34a] font-bold mr-0.5">₹</span>
            {lastWeekEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-green-600 font-semibold mt-1">Revenue from last 7 days</p>
        </div>
      </div>

      {/* Chart Section */}
      {chartData && chartData.length > 0 && (
        <div className="bg-white border border-green-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-green-50 pb-2">
            <h3 className="text-sm font-bold text-gray-850 flex items-center gap-1">
              <TrendingUp size={16} className="text-[#16a34a]" /> Monthly Earnings Chart
            </h3>
            <span className="text-[10px] text-gray-400 font-medium">Last 6 Months</span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(34, 197, 94, 0.04)' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid rgba(34, 197, 94, 0.15)',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Earnings']}
                />
                <Bar dataKey="amount" fill="#166534" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transactions Section */}
      <div className="bg-white border border-green-100 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-850 tracking-tight border-b border-green-50 pb-2">Recent Payout Settlements</h3>
        {payouts && payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-green-55 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Settlement Date</th>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {payouts.map((payout, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-2 text-gray-600 font-medium">
                      <Calendar size={14} className="text-[#16a34a]" />
                      {formatDate(payout.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">{payout.bookingRef}</td>
                    <td className="py-3.5 px-4 text-right font-black text-gray-850">
                      ₹{payout.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic py-2 text-center">No completed jobs/payout details recorded yet.</p>
        )}
      </div>
    </div>
  );
}
