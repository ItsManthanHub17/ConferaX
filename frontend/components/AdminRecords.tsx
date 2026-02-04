
import React from 'react';
import { Booking, BookingStatus, Priority } from '../types';
import Sidebar from './Sidebar';
import { STATUS_COLORS } from '../constants';
import Logo from './Logo';

interface AdminRecordsProps {
  bookings: Booking[];
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const AdminRecords: React.FC<AdminRecordsProps> = ({ bookings, onLogout, onNavigate }) => {
  const processedBookings = bookings.filter(b => b.status !== BookingStatus.PENDING);

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar role="ADMIN" activeView="admin-records" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="pl-20 flex-1 p-8 md:p-16 lg:p-24 transition-all">
        <header className="mb-20 space-y-6">
          <Logo size="md" onClick={() => onNavigate('dashboard')} />
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text">System Audit</p>
            <h1 className="text-5xl font-black text-white tracking-tight">Historical Data Hub</h1>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] pt-4">Immutable logs of processed space authorizations.</p>
          </div>
        </header>

        <section className="vibrant-card rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
          <div className="p-10 border-b border-white/5 bg-white/[0.02]">
             <h2 className="text-[10px] font-black text-white uppercase tracking-[0.5em]">Authorization Registry</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Personnel</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Temporal Frame</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Decision</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Priority</th>
                  <th className="px-10 py-6 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Tactical Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {processedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center text-white/10 font-black uppercase tracking-[0.5em] text-xl">Registry Empty</td>
                  </tr>
                ) : (
                  processedBookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-10 py-8 font-black text-white uppercase tracking-tight group-hover:text-[#f59e0b] transition-colors">{booking.userName}</td>
                      <td className="px-10 py-8">
                         <div className="text-white text-sm font-bold">{new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                         <div className="text-[10px] text-white/30 font-black mt-1 uppercase">{booking.startTime}</div>
                      </td>
                      <td className="px-10 py-8">
                         <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border tracking-widest ${STATUS_COLORS[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${booking.priority === Priority.HIGH ? 'text-red-500' : 'text-white/40'}`}>
                          {booking.priority}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-white/50 text-[11px] font-medium leading-relaxed max-w-xs truncate uppercase tracking-tighter">
                         {booking.notes || booking.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminRecords;
