import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { VVTLogo } from './VVTLogo';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMsg('Logged in successfully.');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 600);
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      } else {
        const res = await register(name, email, password, phone);
        if (res.success) {
          setSuccessMsg('Account registered successfully! Welcome.');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 600);
        } else {
          setError(res.error || 'Registration failed.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
    setLoading(true);
    const res = await login(quickEmail, quickPass);
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 500);
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-[#0D0D12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden"
        >
          {/* Subtle gold decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <VVTLogo size="xs" showTagline={false} />
              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SECURE ACCESS</span>
              </div>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
              {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h2>
            <p className="text-xs text-[#A1A1AA] font-light">
              {mode === 'login' 
                ? 'Access your saved trips, confirmed bookings, and travel itinerary.' 
                : 'Join VPT to book verified heritage stays and plan custom journeys.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-mono tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-amber-400 text-black font-bold shadow-md' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 text-xs font-mono tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-amber-400 text-black font-bold shadow-md' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN TO TRAVELAI' : 'CREATE FREE ACCOUNT'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
              QUICK ROLES (DEMO ACCESS):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('traveler@travelai.in', 'Traveler@2026')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#D4D4D8] hover:text-white transition-colors text-left"
              >
                <span className="font-bold text-amber-300 block">Traveler</span>
                <span className="text-[9px] text-[#71717A]">traveler@travelai.in</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@travelai.in', 'Admin@TravelAI2026')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#D4D4D8] hover:text-white transition-colors text-left"
              >
                <span className="font-bold text-purple-300 block">Administrator</span>
                <span className="text-[9px] text-[#71717A]">admin@travelai.in</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
