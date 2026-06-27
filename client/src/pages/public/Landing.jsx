import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, Shield, Calendar, Users, Calculator, ArrowRight, IndianRupee, Fuel, Clock, Leaf, Star, Compass } from 'lucide-react';

const WORK_TYPE_RATE = {
  ploughing: 1.5, rotavating: 2, seeding: 2.5,
  spraying: 4, harvesting: 1.2, transportation: 1
};
const FUEL_CONSUMPTION = {
  ploughing: 7, rotavating: 6, seeding: 4,
  spraying: 2.5, harvesting: 10, transportation: 5
};
const LABOR_RATE = 200;
const CURRENT_FUEL_PRICE = 96;
const FIXED_SERVICE_FEE = 400;

const SERVICES = [
  { icon: '🌾', title: 'Ploughing', desc: 'Deep soil tilling & bed preparation' },
  { icon: '🔄', title: 'Rotavating', desc: 'Seedbed refinement & soil mixing' },
  { icon: '🌱', title: 'Seeding', desc: 'Precision mechanical sowing' },
  { icon: '💧', title: 'Spraying', desc: 'Crop protection & fertilization' },
  { icon: '🚜', title: 'Harvesting', desc: 'Mechanized crop collection' },
  { icon: '🚛', title: 'Haulage', desc: 'Agricultural goods transportation' },
];

const STATS = [
  { value: '500+', label: 'Farmers Served' },
  { value: '3', label: 'Modern Tractors' },
  { value: '98%', label: 'On-time Rate' },
  { value: '₹96/L', label: 'Current Fuel Rate' },
];

export default function Landing() {
  const [workType, setWorkType] = useState('ploughing');
  const [area, setArea] = useState(5);
  const [estimate, setEstimate] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    const rate = WORK_TYPE_RATE[workType] || 2;
    const fuelRate = FUEL_CONSUMPTION[workType] || 5;
    const hours = Math.ceil((area / rate) * 10) / 10;
    const fuel = Math.ceil((hours * fuelRate) * 10) / 10;
    const labor = Math.round(hours * LABOR_RATE);
    const fuelCost = Math.round(fuel * CURRENT_FUEL_PRICE);
    const total = labor + fuelCost + FIXED_SERVICE_FEE;
    setEstimate({ hours, fuel, total, labor, fuelCost });
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col" style={{ backgroundColor: '#F3F8F4' }}>

      {/* Navigation */}
      <header
        className="sticky top-0 z-50 px-6 md:px-12 h-16 flex justify-between items-center"
        style={{ background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid #E6F4EA', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(21,128,61,0.1)', border: '1px solid rgba(21,128,61,0.2)' }}>
            <Tractor size={16} style={{ color: '#15803D' }} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>
            Agri<span style={{ color: '#15803D' }}>Fleet</span>
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all text-slate-600 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-bold rounded-lg text-white transition-all btn-primary"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Create Account
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 px-6 md:px-12 pt-16 pb-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left content */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.2)', color: '#15803D' }}
              >
                <Leaf size={12} />
                Smart Agricultural Operations Platform
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-5 text-slate-900" style={{ fontFamily: 'Sora, sans-serif' }}>
                Professional Agricultural<br />
                <span className="text-gradient-agri">Services at Your Fingertips</span>
              </h1>

              <p className="text-base leading-relaxed max-w-xl text-slate-600">
                Book company-owned tractors and skilled operators for your farming needs. Real-time scheduling, transparent pricing, and instant allocations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary text-white" style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem' }}>
                Book Service <ArrowRight size={16} />
              </Link>
              <Link
                to="/register"
                className="btn-secondary"
                style={{ padding: '0.8rem 1.8rem', fontSize: '0.9rem' }}
              >
                Create Account
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-green-100">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>{stat.value}</div>
                  <div className="text-xs mt-1 text-slate-500 font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { icon: <Shield size={18} />, title: 'Company Owned', desc: 'All equipment internally maintained and insured' },
                { icon: <Calendar size={18} />, title: 'Smart Scheduling', desc: 'Conflict-free auto-allocation engine' },
                { icon: <Users size={18} />, title: 'Expert Drivers', desc: 'Licensed operators for every service' },
              ].map((f) => (
                <div
                  key={f.title}
                  className="p-5 rounded-2xl bg-white border border-green-50 shadow-sm transition-all hover:border-green-300"
                >
                  <div className="mb-2.5" style={{ color: '#15803D' }}>{f.icon}</div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Cost Estimator */}
          <div className="lg:col-span-5">
            <div
              className="bg-white rounded-3xl border border-green-50 shadow-xl overflow-hidden"
              style={{ boxShadow: '0 20px 40px -15px rgba(21,128,61,0.08)' }}
            >
              {/* Card header */}
              <div className="px-6 pt-6 pb-4 border-b border-green-50">
                <div className="flex items-center gap-2.5 mb-1">
                  <Calculator size={18} style={{ color: '#15803D' }} />
                  <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>Cost Estimator</h2>
                </div>
                <p className="text-xs text-slate-500">Instant transparent pricing before you book</p>
              </div>

              <div className="p-6 space-y-4">
                <form onSubmit={handleCalculate} className="space-y-4">
                  <div>
                    <label className="form-label">Service Type</label>
                    <select
                      value={workType}
                      onChange={(e) => setWorkType(e.target.value)}
                      className="form-input"
                      style={{ appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748b'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2rem', paddingRight: '2.5rem' }}
                    >
                      <option value="ploughing">🌾 Ploughing (Tilling)</option>
                      <option value="rotavating">🔄 Rotavating</option>
                      <option value="seeding">🌱 Seeding / Planting</option>
                      <option value="spraying">💧 Crop Spraying</option>
                      <option value="harvesting">🚜 Harvesting</option>
                      <option value="transportation">🚛 Haulage / Transportation</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Land Size (Acres)</label>
                    <input
                      type="number"
                      min="0.5" max="500" step="0.5"
                      value={area}
                      onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                      className="form-input"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center" style={{ padding: '0.8rem' }}>
                    Calculate Estimate <ArrowRight size={16} />
                  </button>
                </form>

                {estimate && (
                  <div className="animate-fade-in space-y-4">
                    <div className="divider" />
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: <Clock size={14} />, label: 'Est. Time', value: `${estimate.hours} hrs` },
                        { icon: <Fuel size={14} />, label: 'Est. Fuel', value: `${estimate.fuel} L` },
                        { icon: <IndianRupee size={14} />, label: 'Total Cost', value: `₹${estimate.total}` },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl p-3 text-center bg-green-50/30 border border-green-100">
                          <div className="mb-1" style={{ color: '#15803D' }}>{item.icon}</div>
                          <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">{item.label}</div>
                          <div className="text-xs font-bold text-slate-800">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {[
                        { label: 'Labour Cost', value: `₹${estimate.labor}` },
                        { label: 'Fuel Cost', value: `₹${estimate.fuelCost}` },
                        { label: 'Service Fee', value: `₹${FIXED_SERVICE_FEE}` },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between text-slate-500">
                          <span>{r.label}</span><span className="font-semibold text-slate-700">{r.value}</span>
                        </div>
                      ))}
                      <div className="divider my-2" />
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-800">Estimated Total</span>
                        <span style={{ color: '#15803D', fontSize: '0.95rem' }}>₹{estimate.total}</span>
                      </div>
                    </div>

                    <Link to="/register" className="btn-primary w-full justify-center" style={{ padding: '0.7rem' }}>
                      Book This Service <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 border-t border-green-100 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-950 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>How It Works</h2>
            <p className="text-sm text-slate-500">Quick and simple steps to book smart farm services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose Service', desc: 'Select the farm activity you need (e.g. tilling, planting, harvesting) and input your land area.' },
              { step: '02', title: 'Confirm Allocation', desc: 'Our smart auto-allocator assigns a licensed driver and a company-maintained tractor for your target shift.' },
              { step: '03', title: 'Track Execution', desc: 'Monitor service status online, verify completed work, and settle payments securely.' }
            ].map(item => (
              <div key={item.step} className="bg-white p-6 rounded-2xl border border-green-50 shadow-sm relative overflow-hidden">
                <span className="absolute right-4 top-2 text-5xl font-black text-green-50">{item.step}</span>
                <h3 className="font-bold text-slate-800 text-base mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-950 mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Our Agricultural Services</h2>
            <p className="text-sm text-slate-500">Professional mechanized operations for every farming need</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="rounded-xl p-4 bg-white border border-green-50 text-center transition-all hover:border-green-300 hover:shadow-sm"
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-sm font-semibold text-slate-800 mb-1">{s.title}</div>
                <div className="text-[10px] leading-relaxed text-slate-400">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs border-t border-green-100" style={{ color: '#475569', backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Tractor size={14} style={{ color: '#15803D' }} />
          <span className="font-bold text-slate-800" style={{ fontFamily: 'Sora, sans-serif' }}>
            Agri<span style={{ color: '#15803D' }}>Fleet</span>
          </span>
        </div>
        © {new Date().getFullYear()} AgriFleet Co. — Professional Agricultural Service Operations.
      </footer>
    </div>
  );
}
