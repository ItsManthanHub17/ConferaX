
import React from 'react';
import { Booking, Room, BookingStatus, User, Priority } from '../types';
import { STATUS_COLORS } from '../constants';

interface BookingDetailsViewProps {
  currentUser: User;
  booking: Booking;
  room: Room;
  onModify: () => void;
  onCancel: () => void;
  onBack: () => void;
  onRequestOverride?: (room: Room, originalBooking: Booking) => void;
}

const BookingDetailsView: React.FC<BookingDetailsViewProps> = ({ 
  currentUser, booking, room, onModify, onCancel, onBack, onRequestOverride 
}) => {
  const isOwner = currentUser.id === booking.userId;

  return (
    <div className="min-h-screen bg-transparent p-8 lg:p-16">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center text-[#f59e0b] font-black text-[10px] uppercase tracking-widest mb-12 hover:-translate-x-2 transition-transform"
        >
          <span className="mr-3 text-lg">←</span> Back to Overview
        </button>

        {!isOwner && booking.status === BookingStatus.APPROVED && (
          <div className="mb-10 bg-gradient-to-r from-[#f59e0b] to-amber-600 p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Slot Occupied</h3>
                <p className="text-[10px] font-bold text-black/60 uppercase tracking-wider mt-1">Need this time? Submit priority override request</p>
              </div>
            </div>
            <button 
              onClick={() => onRequestOverride?.(room, booking)}
              className="w-full md:w-auto px-10 py-4 bg-black text-[#f59e0b] font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-black/90 transition-all shadow-xl"
            >
              Request Priority Override
            </button>
          </div>
        )}


        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-6">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Session Verification</h1>
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-widest ${STATUS_COLORS[booking.status]}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.3em]">Authorization ID: {booking.id}</p>
          </div>
          <div className="flex space-x-4 w-full md:w-auto">
             {booking.status !== BookingStatus.CANCELLED && isOwner && (
               <>
                 <button 
                    onClick={onModify}
                    className="flex-1 md:flex-none px-10 py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-[#f59e0b] transition-all"
                  >
                    Modify
                  </button>
                  <button 
                    onClick={onCancel}
                    className="flex-1 md:flex-none px-10 py-4 bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    Revoke
                  </button>
               </>
             )}
             {!isOwner && booking.status === BookingStatus.APPROVED && (
               <button 
                  onClick={() => onRequestOverride?.(room, booking)}
                  className="w-full md:w-auto px-10 py-4 btn-amber text-black text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl"
               >
                 Request Priority Override
               </button>
             )}
             {!isOwner && (
               <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                   {isOwner ? 'Your Session' : `Owned by ${booking.userName}`}
                 </span>
               </div>
             )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section className="vibrant-card rounded-[3rem] p-12 border border-white/5">
              <div className="space-y-12">
                <div>
                  <h2 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.5em] mb-8 amber-glow-text">Mission Parameters</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Objective</p>
                      <p className="text-xl font-bold text-white">{booking.title}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Organizer</p>
                      <p className="text-xl font-bold text-white">{booking.userName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5">
                  <h2 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.5em] mb-8 amber-glow-text">Asset Allocation</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Target Room</p>
                      <p className="text-xl font-bold text-white">{room.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Location</p>
                      <p className="text-lg font-bold text-white/70 uppercase tracking-tighter">{room.floor}, {room.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Capacity</p>
                      <p className="text-xl font-bold text-white">{room.capacity} Personnel</p>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5">
                  <h2 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.5em] mb-8 amber-glow-text">Temporal Window</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Date</p>
                      <p className="text-xl font-bold text-white">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Time</p>
                      <p className="text-xl font-bold text-white tabular-nums">{booking.startTime} — {booking.endTime}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Status</p>
                      <p className={`text-xl font-bold uppercase ${booking.priority === Priority.HIGH ? 'text-red-500' : 'text-white'}`}>{booking.priority} Priority Session</p>
                    </div>
                  </div>
                </div>

                {booking.equipment.length > 0 && (
                  <div className="pt-12 border-t border-white/5">
                    <h2 className="text-[10px] font-black text-[#f59e0b] uppercase tracking-[0.5em] mb-8 amber-glow-text">Hardware Setup</h2>
                    <div className="flex flex-wrap gap-3">
                      {booking.equipment.map(item => (
                        <span key={item} className="bg-white/5 text-white/70 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-10">
            {!isOwner && (
              <section className="bg-red-600 p-10 rounded-[3rem] text-white shadow-2xl">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] mb-4">Conflict Policy</h2>
                 <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed opacity-90">
                   If your requirement is critical, you may request an override. High-priority submissions will trigger an Admin collision review.
                 </p>
              </section>
            )}

            <section className="vibrant-card rounded-[3rem] p-10 border border-white/5">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8">Node Activity</h2>
              <div className="space-y-8">
                <div className="flex space-x-6 relative">
                  <div className="absolute left-2.5 top-6 bottom-[-32px] w-px bg-white/10"></div>
                  <div className="w-5 h-5 bg-[#f59e0b] rounded-full z-10 flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">{new Date(booking.createdAt).toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-white uppercase tracking-tight">Authorization Created</p>
                    <p className="text-[9px] text-white/40 mt-1">Initiated by {booking.userName}</p>
                  </div>
                </div>
                <div className="flex space-x-6">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full z-10 flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Current State</p>
                    <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-tight">Session {booking.status}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-10 rounded-[3rem] text-black shadow-2xl">
               <h2 className="text-[10px] font-black uppercase tracking-[0.5em] mb-6">Asset Protocols</h2>
               <ul className="space-y-5 text-[11px] font-bold text-black/60 uppercase tracking-tight">
                 <li className="flex items-start">
                   <span className="text-black mr-4 font-black">01</span>
                   Vacate node 5 minutes prior to window closure.
                 </li>
                 <li className="flex items-start">
                   <span className="text-black mr-4 font-black">02</span>
                   Initialize environmental reset upon exit.
                 </li>
               </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsView;
