import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F3F8F4' }}>
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6 page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
