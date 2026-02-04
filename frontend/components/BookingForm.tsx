
import React, { useState } from 'react';
import { Room, Booking, Priority } from '../types';

interface BookingFormProps {
  room: Room;
  selectedDate?: string | null;
  existingBooking: Booking | null;
  onSubmit: (data: any) => void;
  onUpdate: (id: string, data: any) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ room, selectedDate, existingBooking, onSubmit, onUpdate, onCancel }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(existingBooking?.date || selectedDate || getTodayStr());
  const [startTime, setStartTime] = useState(existingBooking?.startTime || '10:00');
  const [endTime, setEndTime] = useState(existingBooking?.endTime || '12:00');
  const [title, setTitle] = useState(existingBooking?.title || '');
  const [attendees, setAttendees] = useState(existingBooking?.attendees?.toString() || '1');
  const [description, setDescription] = useState(existingBooking?.description || '');
  const [priority, setPriority] = useState<Priority>(existingBooking?.priority || Priority.MEDIUM);
  const [equipment, setEquipment] = useState<string[]>(existingBooking?.equipment || []);

  const toggleEquipment = (eq: string) => {
    setEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      roomId: room.id,
      roomName: room.name,
      date,
      startTime,
      endTime,
      title,
      attendees: parseInt(attendees),
      description,
      priority,
      equipment,
    };

    if (existingBooking) {
      onUpdate(existingBooking.id, data);
    } else {
      onSubmit(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="vibrant-card rounded-[3rem] w-full max-w-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative my-8 border border-white/10">
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition text-white/40 hover:text-white text-3xl"
        >
          ×
        </button>

        <form onSubmit={handleSubmit} className="p-10 md:p-16">
          <div className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text mb-2">Request Portal</h2>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {existingBooking ? 'Modify Session' : 'New Authorization'}
            </h1>
            <p className="text-white/40 text-sm mt-3 font-medium uppercase tracking-widest">Configuring Asset: {room.name}</p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Session Date</label>
                <input 
                  type="date" 
                  value={date}
                  min={getTodayStr()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Start Vector</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">End Vector</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Session Objective</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Global Strategy Sync"
                className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Total Personnel</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={attendees}
                    max={room.capacity}
                    onChange={(e) => setAttendees(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm"
                  />
                  <span className="absolute right-5 top-4.5 text-[8px] text-white/20 font-black uppercase tracking-widest">Max {room.capacity}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Priority Protocol</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm"
                >
                  <option value={Priority.LOW} className="bg-black">Low Intensity</option>
                  <option value={Priority.MEDIUM} className="bg-black">Standard</option>
                  <option value={Priority.HIGH} className="bg-black">High Priority (Action Required)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Detailed Briefing</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Outline session goals or special requirements..."
                className="w-full px-5 py-4 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Asset Integration</label>
              <div className="flex flex-wrap gap-3">
                {['Projector', '8K Video Wall', 'Spatial Mic Array', 'Board Link'].map(item => (
                  <button 
                    key={item}
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      equipment.includes(item) 
                      ? 'bg-[#f59e0b] text-black border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                      : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 flex gap-6">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="flex-1 py-5 btn-amber text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl transition-all"
            >
              {existingBooking ? 'Authorize Changes' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
