
import React, { useState } from 'react';
import Logo from './Logo';
import { api } from '../api';

interface LoginProps {
  onLoginSuccess: (response: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = isSignup
        ? await api.register({ name, email, password })
        : await api.login({ email, password });
      onLoginSuccess(response);
    } catch (err: any) {
      setError(err.message || "Authentication Failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black font-sans overflow-hidden scanline relative">
      <div className="hidden lg:flex w-7/12 flex-col items-center justify-center p-24 bg-[#020202] relative border-r border-white/5">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#f59e0b]/5 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="w-full max-w-xl space-y-12 relative z-10">
           <div className="space-y-6">
              <h2 className="text-[#f59e0b] text-xs font-black uppercase tracking-[0.8em] opacity-50">Enterprise Space Node</h2>
              <h1 className="text-white text-8xl font-black tracking-tighter leading-[0.8] drop-shadow-2xl uppercase">
                CONFERA<span className="text-[#f59e0b]">X</span>.
              </h1>
              <div className="flex items-center space-x-6">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-[#f59e0b] to-transparent"></div>
                <span className="text-white/20 font-black text-xs uppercase tracking-widest">Powered by Space.ONE Protocol</span>
              </div>
           </div>
           <p className="text-white/40 text-xl font-medium leading-relaxed max-w-lg">
             Next-generation orbital asset synchronization. Secure your penthouse node within the <span className="text-white">Cygnet Infrastructure</span>.
           </p>
           
           <div className="pt-10 grid grid-cols-3 gap-6 opacity-30">
              {['Live Sync', 'Secure Auth', 'Priority Link'].map(feature => (
                <div key={feature} className="p-4 border border-white/10 rounded-xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest">{feature}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center p-12 bg-black relative">
        <div className="w-full max-w-sm space-y-10">
          <header className="flex flex-col items-center lg:items-start space-y-4">
            <Logo size="lg" />
            <div className="pt-12">
              <h3 className="text-3xl font-black text-white tracking-tight">Access Node</h3>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Biometric Signature Required</p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                {error}
              </div>
            )}

            {isSignup && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Firstname Lastname"
                  className="w-full px-6 py-5 bg-[#0a0a0a] border border-white/5 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm shadow-inner"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Identity Endpoint</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="firstname.lastname@cygnet.one"
                className="w-full px-6 py-5 bg-[#0a0a0a] border border-white/5 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm shadow-inner"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Secure Key</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-5 bg-[#0a0a0a] border border-white/5 focus:border-[#f59e0b] text-white rounded-2xl outline-none transition-all font-bold text-sm pr-14 shadow-inner"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 bottom-4 text-white/20 hover:text-[#f59e0b] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 btn-amber rounded-2xl active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Establishing Link...' : (isSignup ? 'Create Identity' : 'Synchronize')}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError(null);
              }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-[#f59e0b] transition-colors"
            >
              {isSignup ? 'Already have access? Sign in' : 'New user? Create account'}
            </button>
          </div>

          {/* New Password Hint */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
             <div className="flex items-center space-x-3 mb-2">
               <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
               <p className="text-[10px] font-black uppercase text-[#f59e0b] tracking-widest">Identity Hub Access</p>
             </div>
             <div className="space-y-3 text-white/40 text-[11px] leading-relaxed">
               <p>User Auth: <code>firstname@2026</code></p>
               <p>Admin Auth: <code>firstname@2026admin</code></p>
               <p className="text-[9px] opacity-50 italic mt-2">Example: john.doe@cygnet.one &rarr; john@2026</p>
             </div>
          </div>

          <footer className="pt-12 text-center lg:text-left border-t border-white/5">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">ConferaX Deployment v4.2.0 | Space.ONE</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
