
import React, { useState } from 'react';
import { Booking, BookingStatus, Priority } from '../types';
import Sidebar from './Sidebar';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import Logo from './Logo';

interface AdminDashboardProps {
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onCancel: (id: string) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  logs: {timestamp: string, message: string}[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ bookings, onApprove, onReject, onCancel, onLogout, onNavigate, logs }) => {
  const pendingRequests = bookings.filter(b => b.status === BookingStatus.PENDING);
  const activeBookings = bookings.filter(b => b.status === BookingStatus.APPROVED);
  const [activeTab, setActiveTab] = useState<'queue' | 'active' | 'logs' | 'cleanup'>('queue');
  const [cleanupStatus, setCleanupStatus] = useState<any>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // Load cleanup status
  React.useEffect(() => {
    if (activeTab === 'cleanup') {
      loadCleanupStatus();
    }
  }, [activeTab]);

  const loadCleanupStatus = async () => {
    try {
      const response = await fetch('/api/v1/admin/cleanup/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cygnet_auth_token_raw')}`
        }
      });
      const data = await response.json();
      setCleanupStatus(data);
    } catch (error) {
      console.error('Failed to load cleanup status:', error);
    }
  };

  const handleToggleCleanup = async () => {
    if (!cleanupStatus) return;
    setCleanupLoading(true);
    try {
      const response = await fetch(`/api/v1/admin/cleanup/toggle?enabled=${!cleanupStatus.enabled}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cygnet_auth_token_raw')}`
        }
      });
      const data = await response.json();
      setCleanupStatus(data);
    } catch (error) {
      console.error('Failed to toggle cleanup:', error);
      alert('Failed to toggle cleanup');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleRunCleanupNow = async () => {
    if (!confirm('Run cleanup now? This will delete all audit logs older than ' + cleanupStatus?.retention_days + ' days.')) {
      return;
    }
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/v1/admin/cleanup/run-now', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('cygnet_auth_token_raw')}`
        }
      });
      const data = await response.json();
      alert(`Cleanup completed! Deleted ${data.result.total} records:\n- Approved: ${data.result.approved}\n- Rejected: ${data.result.rejected}\n- Cancelled: ${data.result.cancelled}`);
      await loadCleanupStatus();
    } catch (error) {
      console.error('Failed to run cleanup:', error);
      alert('Failed to run cleanup');
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleDecline = (id: string) => {
    const reason = window.prompt("System Rejection: State Cause", "Asset Conflict / Policy Override");
    if (reason) onReject(id, reason);
  };

  const getConflictingBooking = (req: Booking) => {
    return activeBookings.find(active => {
      if (active.roomId !== req.roomId || active.date !== req.date) return false;
      
      const [rStartH, rStartM] = req.startTime.split(':').map(Number);
      const [rEndH, rEndM] = req.endTime.split(':').map(Number);
      const [aStartH, aStartM] = active.startTime.split(':').map(Number);
      const [aEndH, aEndM] = active.endTime.split(':').map(Number);

      const rStart = rStartH * 60 + rStartM;
      const rEnd = rEndH * 60 + rEndM;
      const aStart = aStartH * 60 + aStartM;
      const aEnd = aEndH * 60 + aEndM;

      return (rStart < aEnd && rEnd > aStart);
    });
  };

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar role="ADMIN" activeView="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="pl-20 flex-1 p-8 md:p-16 lg:p-24 transition-all">
        <header className="mb-20 flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <Logo size="md" onClick={() => onNavigate('dashboard')} />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text">Strategic Overlook</p>
              <h1 className="text-5xl font-black text-white tracking-tight">Authority Console</h1>
            </div>
          </div>
          <div className="flex gap-8 w-full lg:w-auto">
            <div className="vibrant-card p-10 rounded-3xl border border-[#f59e0b]/20 min-w-[200px] flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Queue Load</p>
              <p className="text-5xl font-black text-[#f59e0b] tracking-tighter">{pendingRequests.length}</p>
            </div>
            <div className="bg-white/5 p-10 rounded-3xl border border-white/5 min-w-[200px] flex flex-col justify-center shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Live Nodes</p>
              <p className="text-5xl font-black text-white tracking-tighter">{activeBookings.length}</p>
            </div>
          </div>
        </header>

        <div className="space-y-12">
          <div className="flex bg-[#1a1a1a] p-1.5 rounded-2xl border border-white/10 w-fit shadow-lg">
             {['queue', 'active', 'logs', 'cleanup'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as any)} 
                 className={`px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#f59e0b] text-black shadow-xl shadow-amber-500/20' : 'text-white/40 hover:text-white'}`}
               >
                 {tab === 'queue' ? 'Validation Queue' : tab === 'active' ? 'Operational Streams' : tab === 'logs' ? 'Telemetry Data' : 'Auto-Cleanup'}
               </button>
             ))}
          </div>

          <section className="vibrant-card rounded-[3rem] overflow-hidden min-h-[500px] shadow-2xl">
            {activeTab === 'queue' ? (
              <div className="divide-y divide-white/5">
                {pendingRequests.length === 0 ? (
                  <div className="p-40 text-center">
                    <div className="text-white/5 text-7xl font-black uppercase tracking-tighter">Terminal Idle</div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em] mt-4">All requests synchronized.</p>
                  </div>
                ) : (
                  pendingRequests.map(req => {
                    const conflict = getConflictingBooking(req);
                    return (
                      <div key={req.id} className={`p-12 hover:bg-white/[0.02] transition-colors group ${conflict ? 'bg-red-500/[0.03]' : ''}`}>
                        <div className="flex flex-col xl:flex-row justify-between items-start gap-12">
                          <div className="flex-1 space-y-10">
                            <div className="flex items-center space-x-10">
                              <div className="w-20 h-20 bg-[#f59e0b] text-black font-black flex items-center justify-center rounded-3xl text-3xl shadow-lg shadow-amber-500/20">{req.userName[0]}</div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                  <h3 className="font-black text-white text-2xl uppercase tracking-tight">{req.userName}</h3>
                                  <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase border ${PRIORITY_COLORS[req.priority]}`}>{req.priority} PRIORITY</span>
                                  {conflict && (
                                    <span className="px-4 py-1 rounded-lg text-[9px] font-black uppercase bg-red-600 text-white animate-pulse">Collision Alert</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#f59e0b] font-black uppercase tracking-[0.2em]">{req.roomName} — Window: {req.startTime} to {req.endTime}</p>
                              </div>
                            </div>
                            
                            <div className={`bg-white/5 p-8 rounded-3xl border border-white/5 border-l-4 ${conflict ? 'border-l-red-500' : 'border-l-[#f59e0b]'}`}>
                               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-4">Tactical Description</p>
                               <p className="text-white text-base leading-relaxed font-medium">{req.description || "No mission parameters provided for this session."}</p>
                               {conflict && (
                                 <div className="mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Time Collision with {conflict.userName}</p>
                                      <p className="text-xs text-red-500/70">Occupant: <span className="font-bold">{conflict.userName}</span> ({conflict.priority}). Approving this will <span className="underline font-bold">automatically revoke</span> the occupant's session.</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        if(window.confirm(`Manually revoke ${conflict.userName}'s session now?`)) {
                                          onCancel(conflict.id);
                                        }
                                      }}
                                      className="px-6 py-3 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg"
                                    >
                                      Revoke Conflict
                                    </button>
                                 </div>
                               )}
                               <div className="mt-8 flex flex-wrap gap-4">
                                 <div className="flex items-center space-x-3 px-5 py-2.5 bg-black/40 rounded-xl border border-white/10">
                                    <span className="text-[10px] font-black text-white/30 uppercase">Attendees:</span>
                                    <span className="text-[10px] font-black text-white uppercase">{req.attendees} Personnel</span>
                                 </div>
                                 {req.equipment.map(eq => (
                                   <span key={eq} className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-white/40 uppercase">{eq}</span>
                                 ))}
                               </div>
                            </div>
                          </div>
                          <div className="flex flex-row xl:flex-col gap-4 w-full xl:w-auto">
                            <button 
                              onClick={() => {
                                if (conflict) {
                                  if (window.confirm(`Authorize override? This will cancel ${conflict.userName}'s approved booking.`)) {
                                    onApprove(req.id);
                                  }
                                } else {
                                  onApprove(req.id);
                                }
                              }} 
                              className="flex-1 px-12 py-5 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#f59e0b] transition-all shadow-xl shadow-white/5"
                            >
                              {conflict ? 'Authorize Override' : 'Authorize Access'}
                            </button>
                            <button onClick={() => handleDecline(req.id)} className="flex-1 px-12 py-5 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600/10 hover:text-red-500 hover:border-red-500/50 transition-all">Decline Node</button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : activeTab === 'active' ? (
              <div className="divide-y divide-white/5">
                 {activeBookings.length === 0 ? (
                   <div className="p-40 text-center text-white/10 font-black uppercase text-2xl tracking-tighter">No live streams detected.</div>
                 ) : (
                   <>
                     {activeBookings.map(b => (
                       <div key={b.id} className="p-12 flex justify-between items-center hover:bg-white/[0.01] transition-all">
                          <div className="flex items-center space-x-10">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                            <div className="space-y-1">
                              <span className="font-black text-white text-xl uppercase tracking-tight">{b.userName} <span className="text-white/20 text-xs ml-4 font-mono">[{b.id}]</span></span>
                              <p className="text-[11px] font-black text-[#f59e0b] uppercase tracking-widest">{b.roomName} — Asset Locked</p>
                            </div>
                          </div>
                          <button onClick={() => onCancel(b.id)} className="px-10 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all">Revoke Auth</button>
                       </div>
                     ))}
                   </>
                 )}
              </div>
            ) : activeTab === 'logs' ? (
              <div className="p-12 space-y-6 max-h-[600px] overflow-y-auto font-mono text-[11px]">
                {logs.map((log, i) => (
                  <div key={i} className="flex space-x-10 border-b border-white/5 pb-6 items-start">
                    <span className="text-[#f59e0b] font-black opacity-60">[{log.timestamp}]</span>
                    <span className="text-white/50 tracking-tight uppercase leading-relaxed">{log.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 space-y-16">
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text">Automated Maintenance</p>
                  <h2 className="text-4xl font-black text-white tracking-tight">Audit Log Cleanup System</h2>
                  <p className="text-white/40 text-sm max-w-2xl">Automatically removes old audit logs to maintain database performance. Deletes only processed bookings (Approved, Rejected, Cancelled) while preserving pending requests.</p>
                </div>

                {cleanupStatus ? (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">System Status</p>
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${cleanupStatus.enabled ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                          <p className={`text-2xl font-black ${cleanupStatus.enabled ? 'text-emerald-500' : 'text-red-500'}`}>{cleanupStatus.enabled ? 'ACTIVE' : 'DISABLED'}</p>
                        </div>
                      </div>

                      <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Retention Period</p>
                        <p className="text-3xl font-black text-white">{cleanupStatus.retention_days} <span className="text-lg text-white/40">days</span></p>
                      </div>

                      <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Schedule</p>
                        <p className="text-3xl font-black text-white">{String(cleanupStatus.cleanup_hour).padStart(2, '0')}:00 <span className="text-lg text-white/40">daily</span></p>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <button 
                        onClick={handleToggleCleanup}
                        disabled={cleanupLoading}
                        className={`px-12 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${cleanupStatus.enabled ? 'bg-red-600/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white' : 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white'} ${cleanupLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {cleanupLoading ? 'Processing...' : cleanupStatus.enabled ? 'Disable Cleanup' : 'Enable Cleanup'}
                      </button>

                      <button 
                        onClick={handleRunCleanupNow}
                        disabled={cleanupLoading}
                        className={`px-12 py-5 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/20 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#f59e0b] hover:text-black transition-all ${cleanupLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {cleanupLoading ? 'Running...' : 'Run Cleanup Now'}
                      </button>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-amber-500 text-sm">⚠</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Important Notice</p>
                          <p className="text-white/60 text-sm leading-relaxed">
                            Cleanup will delete bookings with status <strong className="text-white">Approved</strong>, <strong className="text-white">Rejected</strong>, or <strong className="text-white">Cancelled</strong> that are older than {cleanupStatus.retention_days} days. 
                            <strong className="text-emerald-500"> Pending bookings are always preserved</strong> regardless of age.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-20 text-center">
                    <div className="animate-pulse text-white/20 text-2xl font-black uppercase tracking-tighter">Loading configuration...</div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
