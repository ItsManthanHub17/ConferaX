
import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { api } from '../api';

interface AdminUsersProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onLogout, onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('USER');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;
    
    await api.createUser({ name: newUserName, email: newUserEmail, role: newUserRole, password: newUserPassword });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserRole('USER');
    setIsAddingUser(false);
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setIsEditingUser(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !newUserName) return;
    
    await api.updateUser(editingUserId, { name: newUserName, role: newUserRole });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('USER');
    setEditingUserId(null);
    setIsEditingUser(false);
    fetchUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("CONFIRM PROTOCOL: Deleting this identity will revoke all system access keys. Proceed?")) {
      await api.deleteUser(id);
      fetchUsers();
    }
  };

  return (
    <div className="flex min-h-screen bg-transparent stagger-in">
      <Sidebar role="ADMIN" activeView="admin-users" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="pl-20 flex-1 p-8 md:p-16 lg:p-24 transition-all">
        <header className="mb-20 flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <Logo size="md" onClick={() => onNavigate('dashboard')} />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#f59e0b] amber-glow-text">Security Protocol</p>
              <h1 className="text-5xl font-black text-white tracking-tight">Identity Hub</h1>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest pt-2">Managing the Space.ONE Ecosystem Nodes</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddingUser(true)}
            className="h-16 btn-amber px-12 rounded-2xl group flex items-center justify-center space-x-4"
          >
            <span className="text-2xl font-light group-hover:rotate-180 transition-transform duration-500">＋</span>
            <span className="text-[11px] font-black uppercase tracking-widest">Onboard Personnel</span>
          </button>
        </header>

        {isAddingUser && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[250] flex items-center justify-center p-4">
            <div className="vibrant-card rounded-[3rem] w-full max-w-xl p-12 border border-white/10 relative shadow-[0_0_100px_rgba(245,158,11,0.1)]">
              <button 
                onClick={() => setIsAddingUser(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors text-3xl"
              >
                ×
              </button>
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Generate Identity Node</h2>
                <div className="w-16 h-1 bg-[#f59e0b] mt-4 mx-auto rounded-full"></div>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Personnel Full Name</label>
                   <input 
                      type="text" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none font-bold"
                      placeholder="e.g. Marcus Aurelius"
                      required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Secure Email Endpoint</label>
                   <input 
                      type="email" 
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none font-bold"
                      placeholder="name@cygnet.one"
                      required
                   />
                </div>
                   <div className="space-y-2">
                     <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Initial Access Key</label>
                     <input 
                       type="password" 
                       value={newUserPassword}
                       onChange={(e) => setNewUserPassword(e.target.value)}
                       className="w-full px-6 py-5 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none font-bold"
                       placeholder="Set a password"
                       required
                     />
                   </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Authority Level</label>
                   <select 
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as Role)}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none font-bold appearance-none"
                   >
                     <option value="USER" className="bg-black">Standard User Access</option>
                     <option value="ADMIN" className="bg-black">Administrator Access</option>
                   </select>
                </div>
                <button type="submit" className="w-full py-6 btn-amber rounded-2xl">Confirm Identity</button>
              </form>
            </div>
          </div>
        )}

        {isEditingUser && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[250] flex items-center justify-center p-4">
            <div className="vibrant-card rounded-[3rem] w-full max-w-xl p-12 border border-white/10 relative shadow-[0_0_100px_rgba(245,158,11,0.1)]">
              <button 
                onClick={() => {
                  setIsEditingUser(false);
                  setEditingUserId(null);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserRole('USER');
                }}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors text-3xl"
              >
                ×
              </button>
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Update Identity Node</h2>
                <div className="w-16 h-1 bg-[#f59e0b] mt-4 mx-auto rounded-full"></div>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Personnel Full Name</label>
                   <input 
                      type="text" 
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none font-bold"
                      placeholder="e.g. Marcus Aurelius"
                      required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Email (Read Only)</label>
                   <input 
                      type="email" 
                      value={newUserEmail}
                      disabled
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white/40 rounded-2xl outline-none font-bold cursor-not-allowed"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Authority Level</label>
                   <select 
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as Role)}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 focus:border-[#f59e0b] text-white rounded-2xl outline-none font-bold appearance-none"
                   >
                     <option value="USER" className="bg-black">Standard User Access</option>
                     <option value="ADMIN" className="bg-black">Administrator Access</option>
                   </select>
                </div>
                <button type="submit" className="w-full py-6 btn-amber rounded-2xl">Update Identity</button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <div className="w-16 h-16 border-2 border-dashed border-[#f59e0b] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Scanning Identity Matrix...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {users.map(u => (
                <div key={u.id} className="vibrant-card rounded-[2.5rem] p-8 flex items-center space-x-6 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-[#f59e0b]/10 transition-all duration-700"></div>
                  
                  <div className="relative flex-shrink-0">
                      <img src={u.avatar} className="w-16 h-16 rounded-2xl border-2 border-white/5 group-hover:border-[#f59e0b]/50 transition-all duration-500 shadow-2xl" alt={u.name} />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#121212] z-20"></div>
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-[#f59e0b] transition-colors truncate">{u.name}</h3>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest truncate">{u.email}</p>
                      <div className="flex items-center space-x-3 pt-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] ${u.role === 'ADMIN' ? 'bg-[#f59e0b] text-black' : 'bg-white/10 text-white/40'}`}>
                              {u.role}
                          </span>
                      </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                        onClick={() => handleEditUser(u)}
                        className="p-4 bg-[#f59e0b]/10 text-[#f59e0b] rounded-2xl hover:bg-[#f59e0b] hover:text-black transition-all transform translate-x-4 group-hover:translate-x-0"
                        title="Edit Identity"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all transform translate-x-4 group-hover:translate-x-0"
                        title="Disconnect Identity"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                  </div>
                </div>
            ))}
            </div>
        )}

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col items-center space-y-4 opacity-30">
            <Logo size="sm" />
            <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white">Encrypted Identity Services by Space.ONE</p>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
