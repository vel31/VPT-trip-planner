import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminStats, Booking, PaymentRecord, User } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Layers,
  Database
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'users' | 'payments'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    setLoading(true);
    setError(null);

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/payments', { headers })
      ]);

      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsersList(u.users || []);
      }
      if (bookingsRes.ok) {
        const b = await bookingsRes.json();
        setBookingsList(b.bookings || []);
      }
      if (paymentsRes.ok) {
        const p = await paymentsRes.json();
        setPaymentsList(p.payments || []);
      }
    } catch (err: any) {
      setError('Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchAdminData();
    }
  }, [isAdmin, token]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-cinzel text-2xl font-bold text-white mb-2 uppercase">RESTRICTED ADMINISTRATOR PORTAL</h2>
        <p className="text-sm text-[#A1A1AA]">
          This section is strictly restricted to platform administrators. Log in with an administrator account to access platform metrics and live transaction logs.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>TRAVELAI INDIA COMMAND CONSOLE</span>
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-white uppercase tracking-tight">
            OPERATIONS & REVENUE DASHBOARD
          </h1>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white cursor-pointer transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH METRICS</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-mono text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'stats'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          System Overview & APIs
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'bookings'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          All Bookings ({bookingsList.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'payments'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          Payment Transactions ({paymentsList.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'users'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          Registered Users ({usersList.length})
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW & APIS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0F0F15] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">TOTAL REVENUE (INR)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ₹{(stats.totalRevenueINR || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-mono">From confirmed reservations</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F0F15] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">TOTAL RESERVATIONS</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {stats.totalBookings}
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  ({stats.successfulPayments} paid)
                </span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-mono">{stats.cancelledBookings} cancelled</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F0F15] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">REGISTERED USERS</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {stats.totalUsers}
                </span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-mono">Active traveler profiles</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0F0F15] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">DATABASE ENGINE</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono text-amber-400">
                  File Persistence
                </span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-mono">JSON Engine (Cloud Durable)</span>
            </div>
          </div>

          {/* LIVE API HEALTH & AUDIT */}
          <div className="p-6 rounded-3xl bg-[#0F0F15] border border-white/10 space-y-4">
            <h3 className="font-cinzel text-lg font-bold text-white uppercase flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              <span>LIVE THIRD-PARTY APIS & SECRETS AUDIT</span>
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-2xl font-light">
              In accordance with platform security rules, secrets are kept strictly server-side. Missing live keys fall back to clearly labeled DEMO MODE.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Razorpay Payments</span>
                  {stats.liveApiStatus.razorpayConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded block w-fit ${
                  stats.liveApiStatus.razorpayConfigured
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {stats.liveApiStatus.razorpayConfigured ? 'LIVE GATEWAY ACTIVE' : 'DEMO MODE'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Google Maps Platform</span>
                  {stats.liveApiStatus.googleMapsConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded block w-fit bg-blue-500/20 text-blue-300">
                  {stats.liveApiStatus.googleMapsConfigured ? 'LIVE GOOGLE SDK' : 'GEOAPIFY / OSM FALLBACK'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Live Weather (IMD)</span>
                  {stats.liveApiStatus.openWeatherConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded block w-fit bg-emerald-500/20 text-emerald-300">
                  {stats.liveApiStatus.openWeatherConfigured ? 'OPENWEATHER API' : 'IMD CLIMATOLOGY'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">Gemini Itinerary AI</span>
                  {stats.liveApiStatus.geminiConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded block w-fit ${
                  stats.liveApiStatus.geminiConfigured
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {stats.liveApiStatus.geminiConfigured ? 'GEMINI FLASH ACTIVE' : 'DETERMINISTIC ENGINE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0F0F15]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-[#71717A] border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Guest</th>
                <th className="p-4">Property</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#D4D4D8]">
              {bookingsList.map((b) => (
                <tr key={b.booking_id} className="hover:bg-white/5">
                  <td className="p-4 font-bold text-amber-400">{b.booking_id}</td>
                  <td className="p-4">
                    <span className="font-bold text-white block">{b.user_name}</span>
                    <span className="text-[#71717A] text-[10px]">{b.user_email}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white block">{b.hotel_name}</span>
                    <span className="text-[#71717A] text-[10px]">{b.room_name}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {b.check_in} → {b.check_out} ({b.nights}n)
                  </td>
                  <td className="p-4 font-bold text-white">₹{(b.total_amount || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.booking_status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : b.booking_status === 'CANCELLED'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] text-[#A1A1AA]">{b.payment_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0F0F15]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-[#71717A] border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">Txn ID</th>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Razorpay Order ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#D4D4D8]">
              {paymentsList.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="p-4 font-mono text-purple-400">{p.id}</td>
                  <td className="p-4 text-amber-400">{p.booking_id}</td>
                  <td className="p-4 text-[#A1A1AA]">{p.razorpay_order_id}</td>
                  <td className="p-4 font-bold text-white">₹{(p.amount_inr || 0).toLocaleString()}</td>
                  <td className="p-4">
                    {p.is_verified ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> No (Demo)
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/10">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#71717A] whitespace-nowrap">
                    {p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REGISTERED USERS */}
      {activeTab === 'users' && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0F0F15]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-white/5 text-[#71717A] border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#D4D4D8]">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 text-[#A1A1AA]">{u.email}</td>
                  <td className="p-4 text-[#A1A1AA]">{u.phone || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-[#D4D4D8]'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-[#71717A]">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
