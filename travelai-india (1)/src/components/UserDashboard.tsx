import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Booking, Hotel } from '../types';
import { 
  User, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Printer, 
  Bookmark, 
  Compass, 
  ShieldCheck,
  RefreshCw,
  LogOut,
  Edit2
} from 'lucide-react';

interface UserDashboardProps {
  onExploreDestination?: (destinationId: string) => void;
  onOpenHotelBooking?: (hotel: Hotel) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onExploreDestination,
  onOpenHotelBooking
}) => {
  const { user, token, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'profile'>('bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Plans changed');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!token) return;
    setLoadingBookings(true);
    try {
      const res = await fetch('/api/bookings/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchSavedPlaces = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/saved-places', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPlaces(data.savedPlaces || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved places:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchSavedPlaces();
    }
  }, [token]);

  const handleCancelBooking = async (bookingId: string) => {
    setCancelError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      if (res.ok) {
        setCancelConfirmId(null);
        await fetchBookings();
      } else {
        const data = await res.json();
        setCancelError(data.error || 'Failed to cancel booking.');
      }
    } catch (err) {
      setCancelError('Network error while cancelling booking.');
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    const res = await updateProfile({ name: editName, phone: editPhone });
    if (res.success) {
      setProfileMessage('Profile details updated successfully.');
    } else {
      setProfileMessage(res.error || 'Failed to update profile.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-cinzel text-2xl font-bold text-white mb-2 uppercase">GUEST TRAVELER SESSION</h2>
        <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mb-6">
          Sign in to access your confirmed hotel bookings, personalized travel itineraries, and saved heritage spots across India.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* User Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121218] via-[#0F0F15] to-[#141420] border border-white/10 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-black font-bold font-cinzel text-2xl flex items-center justify-center shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] font-mono mt-1">{user.email}</p>
            <p className="text-[11px] text-[#71717A] font-mono mt-0.5">
              Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#D4D4D8] hover:text-white border border-white/10 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-mono text-red-300 border border-red-500/20 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-8 font-mono text-xs uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'bookings'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'saved'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          Saved Destinations ({savedPlaces.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === 'profile'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-[#71717A] hover:text-[#D4D4D8]'
          }`}
        >
          Profile Settings
        </button>
      </div>

      {/* TAB 1: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-[#71717A]">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white uppercase">NO BOOKINGS FOUND</h3>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto font-light leading-relaxed">
                You haven't reserved any accommodations yet. Explore India's top heritage havelis, luxury palaces, and mountain retreats.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.booking_id}
                  className="p-6 rounded-2xl bg-[#0F0F14] border border-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                        {b.booking_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        b.booking_status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.booking_status === 'CANCELLED'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {b.booking_status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#D4D4D8]">
                        PAYMENT: {b.payment_status}
                      </span>
                    </div>

                    <h3 className="font-cinzel text-xl font-bold text-white uppercase">
                      {b.hotel_name}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] font-mono flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{b.destination}, {b.destination_state}</span>
                      <span>•</span>
                      <span>{b.room_name}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#D4D4D8] pt-1">
                      <span>Check-In: <strong className="text-white">{b.check_in}</strong></span>
                      <span>•</span>
                      <span>Check-Out: <strong className="text-white">{b.check_out}</strong> ({b.nights} nights)</span>
                      <span>•</span>
                      <span>Guests: <strong className="text-white">{b.guests}</strong></span>
                    </div>

                    {b.cancellation_reason && (
                      <p className="text-[11px] text-red-400 font-mono">
                        Reason for Cancellation: {b.cancellation_reason}
                      </p>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-white/5 pt-4 md:pt-0 shrink-0">
                    <div className="md:text-right mb-3">
                      <span className="text-[10px] text-[#71717A] font-mono uppercase block">TOTAL AMOUNT</span>
                      <span className="text-xl font-bold font-mono text-white">
                        ₹{(b.total_amount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#D4D4D8] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </button>

                      {b.booking_status !== 'CANCELLED' && (
                        cancelConfirmId === b.booking_id ? (
                          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 p-1 rounded-lg">
                            <span className="text-[10px] text-red-300 font-mono px-1">Confirm?</span>
                            <button
                              onClick={() => handleCancelBooking(b.booking_id)}
                              className="px-2 py-1 rounded bg-red-500 text-white text-[10px] font-mono font-bold hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              Yes, Cancel
                            </button>
                            <button
                              onClick={() => setCancelConfirmId(null)}
                              className="px-2 py-1 rounded bg-white/10 text-white text-[10px] font-mono hover:bg-white/20 transition-colors cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setCancelConfirmId(b.booking_id); setCancelError(null); }}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-mono text-red-400 cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        )
                      )}
                    </div>
                    {cancelError && cancelConfirmId === b.booking_id && (
                      <p className="text-[10px] text-red-400 font-mono mt-1">{cancelError}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED PLACES */}
      {activeTab === 'saved' && (
        <div>
          {savedPlaces.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-[#71717A]">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-white uppercase">NO SAVED PLACES YET</h3>
              <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto font-light leading-relaxed">
                Save monuments, havelis, and street food gems while exploring destinations to create your personalized wishlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {place.image_url && (
                      <img
                        src={place.image_url}
                        alt={place.title}
                        className="w-full h-36 object-cover rounded-xl"
                      />
                    )}
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                      {place.type}
                    </span>
                    <h4 className="font-cinzel text-base font-bold text-white">{place.title}</h4>
                    {place.subtitle && (
                      <p className="text-xs text-[#A1A1AA] line-clamp-2">{place.subtitle}</p>
                    )}
                    {place.location && (
                      <p className="text-[11px] text-[#71717A] font-mono flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{place.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="max-w-xl p-6 sm:p-8 rounded-3xl bg-[#0F0F14] border border-white/10 shadow-xl space-y-6">
          <div>
            <h3 className="font-cinzel text-xl font-bold text-white uppercase">PROFILE PREFERENCES</h3>
            <p className="text-xs text-[#A1A1AA]">Manage personal traveler details and contact information.</p>
          </div>

          {profileMessage && (
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs font-mono text-amber-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{profileMessage}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Full Legal Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-mono text-[#71717A] cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">Contact Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-md"
            >
              SAVE CHANGES
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
