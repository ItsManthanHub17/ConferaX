
import React, { useMemo, useState } from 'react';
import { Room, Booking, User, BookingStatus, Priority } from '../types';
import Sidebar from './Sidebar';
import { STATUS_COLORS } from '../constants';
import Logo from './Logo';

interface UserDashboardProps {
  user: User;
  rooms: Room[];
  bookings: Booking[];
  activeSubView: string;
  onSetSubView: (view: string) => void;
  onBookRoom: (room: Room, date: string, time?: string) => void;
  onViewBooking: (booking: Booking) => void;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, rooms, bookings, activeSubView, onSetSubView, onBookRoom, onViewBooking, onLogout 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const PRIORITY_SLOT_COLORS = {
    [Priority.LOW]: 'bg-indigo-600 border-indigo-400 text-white',
    [Priority.MEDIUM]: 'bg-[#f59e0b] border-amber-300 text-black font-bold',
    [Priority.HIGH]: 'bg-red-600 border-red-400 text-white',
  };

  const renderContent = () => {
    const currentView = activeSubView || 'dashboard';

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="stagger-in space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text">System Active</h2>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Executive Wing Dashboard</h1>
              </div>
              <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Real-time Node Monitoring</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {rooms.map((room) => (
                <div key={room.id} className="group vibrant-card rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-2xl">
                  <div className="h-52 overflow-hidden relative">
                    <img 
                      src={room.imageUrl} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 image-vibrance" 
                      alt={room.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute bottom-5 left-6 right-6 flex justify-between items-center">
                      <span className="bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-white border border-white/10 tracking-widest">{room.roomNumber}</span>
                      <div className="flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white group-hover:text-[#f59e0b] transition-colors leading-tight line-clamp-1">{room.name}</h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Executive Capacity: {room.capacity} Pax</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      {room.features.slice(0, 2).map(f => (
                        <span key={f} className="text-[8px] font-black text-white/40 border border-white/5 bg-white/5 px-2.5 py-1.5 rounded-lg uppercase tracking-widest">{f}</span>
                      ))}
                    </div>

                    <button 
                      onClick={() => onSetSubView('calendar')}
                      className="mt-auto w-full py-4 btn-amber rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                      Reserve Space
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'calendar':
        const next7Days = Array.from({length: 7}).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          return d.toISOString().split('T')[0];
        });
        
        const intervals = [];
        for (let h = 9; h <= 22; h++) {
          intervals.push(`${h.toString().padStart(2, '0')}:00`);
          if (h < 22) intervals.push(`${h.toString().padStart(2, '0')}:30`);
        }

        return (
          <div className="stagger-in space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text">Global Hub</h2>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Smart Asset Schedule</h1>
              </div>
              <div className="flex bg-[#1a1a1a] p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
                {next7Days.map(date => (
                  <button 
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedDate === date ? 'bg-[#f59e0b] text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                  </button>
                ))}
              </div>
            </div>

            <div className="vibrant-card rounded-[2.5rem] p-6 md:p-10 overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-6 mb-10">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/10 flex items-center justify-center text-[#f59e0b] border border-[#f59e0b]/20">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                  {rooms.map(room => (
                    <div key={room.id} className="text-center p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-[#f59e0b]/40 transition-all">
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">{room.name}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase mt-1 tracking-widest">PH-{room.roomNumber}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {intervals.map((time) => (
                    <div key={time} className="grid grid-cols-[140px_repeat(4,1fr)] gap-6 items-stretch min-h-[64px]">
                      <div className="flex items-center justify-between px-5 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-base">{parseInt(time) < 18 ? '☀️' : '🌙'}</span>
                         <span className="text-[13px] font-black text-white tracking-[0.1em]">{time}</span>
                      </div>
                      {rooms.map(room => {
                        const booking = bookings.find(b => {
                          if (b.roomId !== room.id || b.date !== selectedDate || b.status !== BookingStatus.APPROVED) return false;
                          const [bStartH, bStartM] = b.startTime.split(':').map(Number);
                          const [bEndH, bEndM] = b.endTime.split(':').map(Number);
                          const [slotH, slotM] = time.split(':').map(Number);
                          const bStartTotal = bStartH * 60 + bStartM;
                          const bEndTotal = bEndH * 60 + bEndM;
                          const slotTotal = slotH * 60 + slotM;
                          return slotTotal >= bStartTotal && slotTotal < bEndTotal;
                        });

                        return (
                          <div key={room.id} className="h-full">
                            {booking ? (
                              <div 
                                onClick={() => onViewBooking(booking)}
                                className={`h-full p-4 rounded-2xl flex flex-col justify-center border-l-4 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform ${PRIORITY_SLOT_COLORS[booking.priority]}`}
                              >
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-[9px] font-black uppercase tracking-tight truncate">{booking.userName}</span>
                                  {booking.userId === user.id && <span className="text-[7px] bg-white/20 px-1 rounded uppercase">MINE</span>}
                                </div>
                                <span className="text-[7px] font-bold uppercase opacity-70 truncate">{booking.title}</span>
                              </div>
                            ) : (
                                <button 
                                onClick={() => onBookRoom(room, selectedDate, time)}
                                className="w-full h-full bg-[#151515] rounded-2xl border border-dashed border-white/10 flex items-center justify-center group hover:bg-[#f59e0b]/5 hover:border-[#f59e0b]/40 transition-all"
                              >
                                <span className="text-[9px] font-black text-white/5 group-hover:text-[#f59e0b] transition-colors">AVAILABLE SLOT</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-1">
                 <h4 className="text-xl font-bold text-white uppercase tracking-tight">Need a locked slot for high priority?</h4>
                 <p className="text-white/30 text-xs font-medium uppercase tracking-widest">Submit a priority override request. System Admin will resolve collisions.</p>
               </div>
               <button 
                  onClick={() => onBookRoom(rooms[0])}
                  className="px-12 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-[#f59e0b] transition-all"
               >
                 Initiate Override Request
               </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="stagger-in space-y-12">
            <h1 className="text-4xl font-black text-white tracking-tight">System Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="vibrant-card p-12 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f59e0b]/10 blur-[60px] group-hover:bg-[#f59e0b]/20 transition-all"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Aggregate Capacity</p>
                <p className="text-6xl font-black text-[#f59e0b] amber-glow-text">{rooms.reduce((sum, r) => sum + r.capacity, 0)}<span className="text-xl text-white/10 ml-2">Pax</span></p>
              </div>
              <div className="btn-amber p-12 rounded-[2.5rem] shadow-2xl flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-4">Prime Asset</p>
                <p className="text-4xl font-black text-black">{rooms.reduce((max, r) => r.capacity > max.capacity ? r : max, rooms[0])?.name || 'N/A'}</p>
              </div>
              <div className="vibrant-card p-12 rounded-[2.5rem] flex flex-col justify-center border-l-4 border-l-[#f59e0b]">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Historical Data</p>
                <p className="text-sm font-bold text-white/60 leading-relaxed uppercase tracking-wider">Session memory synced for <span className="text-white">{user.name}</span>. Asset synchronization: 100%.</p>
              </div>
            </div>
          </div>
        );
      case 'my-bookings':
        const myBookings = bookings.filter(b => b.userId === user.id);
        return (
          <div className="stagger-in space-y-10">
            <h1 className="text-4xl font-black text-white tracking-tight">Personal Reservations</h1>
            <div className="vibrant-card rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Auth Token</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Assigned Node</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Window</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myBookings.map(b => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-10 py-8 text-sm font-black text-white tracking-tight group-hover:text-[#f59e0b] transition-colors">{b.id}</td>
                        <td className="px-10 py-8">
                           <div className="text-[12px] font-black text-white uppercase tracking-wider">{b.roomName}</div>
                           <div className={`text-[9px] font-black uppercase tracking-widest mt-1 ${STATUS_COLORS[b.status].split(' ')[1]}`}>{b.status}</div>
                        </td>
                        <td className="px-10 py-8 text-[11px] font-black text-white/60 tabular-nums tracking-widest">{b.date} | {b.startTime}</td>
                        <td className="px-10 py-8 text-right">
                          <button onClick={() => onViewBooking(b)} className="px-6 py-2.5 bg-white/5 rounded-xl text-[10px] font-black uppercase text-[#f59e0b] border border-white/5 hover:bg-[#f59e0b] hover:text-black transition-all">Verify Node</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar role="USER" activeView={activeSubView || 'dashboard'} onNavigate={onSetSubView} onLogout={onLogout} />
      
      <main className="pl-20 flex-1 p-8 md:p-16 lg:p-24 transition-all">
        <header className="flex flex-col md:flex-row justify-between items-center mb-20 gap-10">
          <div className="flex items-center space-x-12 w-full md:w-auto">
            <Logo size="md" onClick={() => onSetSubView('dashboard')} />
            <div className="h-10 w-px bg-white/10 hidden md:block"></div>
            <div className="flex items-center space-x-5">
              <img src={user.avatar} className="w-14 h-14 rounded-2xl border-2 border-[#f59e0b]/40 shadow-xl shadow-amber-500/10" alt="avatar" />
              <div className="hidden sm:block">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Auth Session</p>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">{user.name}</h3>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onSetSubView('calendar')}
            className="w-full md:w-auto h-16 btn-amber px-12 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center space-x-3 active:scale-95"
          >
            <span className="text-2xl font-light">＋</span>
            <span>Initiate Session</span>
          </button>
        </header>

        {renderContent()}

        <div className="fixed bottom-12 right-12 opacity-[0.05] pointer-events-none select-none hidden lg:block">
           <p className="text-9xl font-black uppercase tracking-tighter text-white">Space.ONE</p>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
