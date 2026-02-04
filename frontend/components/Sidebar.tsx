
import React, { useState } from 'react';
import { Role } from '../types';

interface SidebarProps {
  role: Role;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeView, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = role === 'ADMIN' ? [
    { id: 'dashboard', label: 'Command Center', icon: 'M4 6h16M4 12h16m-7 6h7' },
    { id: 'admin-users', label: 'Identity Hub', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'admin-records', label: 'Audit Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ] : [
    { id: 'dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'my-bookings', label: 'Reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'calendar', label: 'Global Schedule', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'reports', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div className="fixed top-0 left-0 h-full z-[100] group">
      <div 
        className={`h-full bg-black/60 backdrop-blur-2xl border-r border-white/10 transition-all duration-500 ease-out flex flex-col items-center py-8 ${isOpen ? 'w-64' : 'w-20'}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="mb-12 p-3 text-[#f59e0b] hover:bg-white/5 rounded-xl transition-all">
          <svg className={`w-8 h-8 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

        <nav className="flex-1 w-full px-4 space-y-3">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center p-3.5 rounded-2xl transition-all relative overflow-hidden group/item ${
                activeView === item.id 
                  ? 'bg-[#f59e0b] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-6 h-6 flex-shrink-0 z-10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <span className={`ml-5 text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-500 z-10 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
                {item.label}
              </span>
              {activeView === item.id && (
                <div className="absolute inset-0 bg-white/20 shimmer"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 w-full space-y-4 pt-8 border-t border-white/5">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center p-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all ${!isOpen && 'justify-center'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`ml-5 text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
