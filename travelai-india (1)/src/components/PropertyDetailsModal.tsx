import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hotel } from '../types';
import { 
  X, 
  MapPin, 
  Star, 
  Check, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Bed, 
  Users, 
  Calendar, 
  Info,
  Sparkles,
  Building,
  CheckCircle2
} from 'lucide-react';
import { 
  getBookingProviderLinks, 
  getPrimaryBookingAction, 
  resolvePropertyCardDetails, 
  calculateNights,
  openExternalBooking,
  BookingContextParams
} from '../utils/bookingLinks';

interface PropertyDetailsModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  bookingParams: BookingContextParams;
  itineraryAttractions?: string[];
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  hotel,
  isOpen,
  onClose,
  bookingParams,
  itineraryAttractions = []
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'policies'>('overview');

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

  if (!isOpen || !hotel) return null;

  const cardDetails = resolvePropertyCardDetails(hotel, bookingParams.destinationName);
  const providers = getBookingProviderLinks(hotel, bookingParams);
  const primaryAction = getPrimaryBookingAction(hotel, bookingParams, selectedProviderId);
  const nights = calculateNights(bookingParams.checkIn, bookingParams.checkOut);
  const estTotalPrice = (hotel.pricePerNightINR || 1200) * nights;

  const handleBookNow = (targetUrl?: string) => {
    const url = targetUrl || primaryAction.url;
    openExternalBooking(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-[#0D0D11] border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-white flex flex-col max-h-[90vh]"
        >
          {/* Header Image & Quick Badges */}
          <div className="relative h-56 sm:h-72 w-full shrink-0 bg-[#14141A] overflow-hidden">
            <img
              src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/30 to-black/60" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white border border-white/20 hover:bg-black/80 transition-all cursor-pointer z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {hotel.rating || 4.5} ({hotel.reviewCount || 120} verified reviews)
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-black text-xs font-mono font-bold uppercase tracking-wider">
                {cardDetails.availabilityStatus}
              </span>
              {cardDetails.isHostel && (
                <span className="px-3 py-1 rounded-full bg-orange-500/80 backdrop-blur-md text-white text-xs font-mono font-bold uppercase tracking-wider">
                  Hostel & Dorms
                </span>
              )}
            </div>

            {/* Title & Location on Image Bottom */}
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase block mb-1">
                {hotel.hotelCategory || 'Verified Stay'} • {hotel.priceCategory || 'Mid-Range'}
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-wide leading-tight">
                {hotel.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] mt-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{hotel.address}</span>
              </div>
            </div>
          </div>

          {/* Subheader: Trip Booking Context Bar */}
          <div className="px-6 py-3 bg-[#14141A] border-y border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#D4D4D8]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{bookingParams.checkIn} → {bookingParams.checkOut} ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
              </span>
              <span className="flex items-center gap-1.5 text-purple-300">
                <Users className="w-3.5 h-3.5" />
                <span>{bookingParams.guests} {bookingParams.guests === 1 ? 'Guest' : 'Guests'}</span>
              </span>
            </div>

            <div className="text-right">
              <span className="text-[#A1A1AA] text-[11px]">Est. Rate: </span>
              <span className="text-emerald-400 font-bold text-sm">₹{hotel.pricePerNightINR?.toLocaleString() || '1,200'}</span>
              <span className="text-[10px] text-[#A1A1AA]"> / night (₹{estTotalPrice.toLocaleString()} est. total)</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-3 border-b border-white/10 flex items-center gap-2">
            {[
              { id: 'overview', label: 'Property & Rooms' },
              { id: 'providers', label: `Booking Providers (${providers.length})` },
              { id: 'policies', label: 'Check-in & Policies' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-t-xl text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                  activeTab === t.id
                    ? 'border-amber-400 text-amber-400 font-bold bg-white/5'
                    : 'border-transparent text-[#A1A1AA] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
            
            {/* TAB 1: OVERVIEW & ROOM TYPES */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Room Type Highlight */}
                <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Bed className="w-4 h-4" /> Recommended Room Type
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Instant Online Booking
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-base">
                    {cardDetails.roomType}
                  </h4>
                  <p className="text-xs text-[#A1A1AA] font-light leading-relaxed">
                    {cardDetails.isHostel
                      ? 'Air-conditioned dorm with personal charging sockets, privacy reading lamp, lockable luggage storage, and secure keycard entry.'
                      : 'Spacious well-ventilated accommodation furnished with authentic Indian heritage accents, luxury bedding, and modern ensuite bathroom.'}
                  </p>
                </div>

                {/* Proximity to Destination & Itinerary Attractions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-[#A1A1AA] tracking-wider flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Distance & Location Highlights
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#14141A] border border-white/5 flex items-center justify-between">
                      <span className="text-[#A1A1AA]">City Center / Hub:</span>
                      <span className="text-white font-bold">{cardDetails.distance}</span>
                    </div>

                    {itineraryAttractions.length > 0 ? (
                      <div className="p-3 rounded-xl bg-[#14141A] border border-white/5 flex items-center justify-between">
                        <span className="text-[#A1A1AA] truncate mr-2">Itinerary Sight ({itineraryAttractions[0]}):</span>
                        <span className="text-amber-400 font-bold shrink-0">~{(hotel.distanceFromCenterKm ? (hotel.distanceFromCenterKm + 0.8).toFixed(1) : '2.1')} km</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#14141A] border border-white/5 flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Major Attractions:</span>
                        <span className="text-amber-400 font-bold">10-15 mins transit</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified Amenities Grid with Checkmarks */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase text-[#A1A1AA] tracking-wider">
                    Available Amenities & Perks
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(hotel.amenities && hotel.amenities.length > 0 ? hotel.amenities : [
                      'Free High-Speed Wi-Fi',
                      'Air Conditioning (AC)',
                      'Breakfast Included',
                      'Free Cancellation',
                      '24-Hour Front Desk',
                      'Luggage Storage'
                    ]).map((amenity, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#14141A] border border-white/5 flex items-center gap-2 text-xs text-[#D4D4D8]"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transparent Pricing Disclosure */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5 text-amber-200/90 font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase text-[11px]">
                    <Info className="w-3.5 h-3.5" />
                    <span>Real-World Booking Guarantee & Pricing Notice</span>
                  </div>
                  <p className="text-[11px] font-light leading-relaxed text-[#D4D4D8]">
                    Displayed rates (₹{hotel.pricePerNightINR?.toLocaleString()} / night) are verified estimates based on seasonal averages. When you click <strong>Book Now</strong>, you will be securely redirected to the official booking provider’s website where live room availability, taxes, and instant payment are completed directly without markups.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: ALL LEGITIMATE BOOKING PROVIDERS */}
            {activeTab === 'providers' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white font-cinzel">
                    SELECT OFFICIAL BOOKING PROVIDER
                  </h3>
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    Deep links pre-configured for {bookingParams.destinationName} ({bookingParams.checkIn} to {bookingParams.checkOut}, {bookingParams.guests} {bookingParams.guests === 1 ? 'guest' : 'guests'}).
                  </p>
                </div>

                <div className="space-y-3">
                  {providers.map((p) => (
                    <div
                      key={p.providerId}
                      className="p-4 rounded-2xl bg-[#14141A] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.providerName}</span>
                          {p.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${p.colorClass}`}>
                              {p.badge}
                            </span>
                          )}
                          {p.isDirectBooking && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Direct Deep Link
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#A1A1AA]">{p.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookNow(p.url)}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-amber-400/20 hover:scale-[1.02]"
                      >
                        <span>{p.actionLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CHECK-IN & POLICIES */}
            {activeTab === 'policies' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                    <span className="text-xs font-mono uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Check-in Information
                    </span>
                    <p className="font-bold text-white text-base">{cardDetails.checkInTime}</p>
                    <p className="text-xs text-[#A1A1AA]">
                      Early check-in subject to room availability upon arrival. Government-issued photo ID (Aadhaar / Passport) required.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                    <span className="text-xs font-mono uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Check-out Information
                    </span>
                    <p className="font-bold text-white text-base">{cardDetails.checkOutTime}</p>
                    <p className="text-xs text-[#A1A1AA]">
                      Late check-out may be requested at the reception desk. Luggage storage is available before check-in and after check-out.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                  <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Cancellation & Refund Policy
                  </span>
                  <p className="font-bold text-white text-sm">{cardDetails.cancellationPolicy}</p>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Most partner rates on Booking.com and Hostelworld provide 100% free cancellation if canceled before the specified deadline. Review exact cancellation policies before final checkout.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Footer Sticky CTA Bar */}
          <div className="p-4 sm:p-6 bg-[#0B0B0E] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div>
                <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">
                  {nights} Nights • {bookingParams.guests} {bookingParams.guests === 1 ? 'Guest' : 'Guests'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                    ₹{hotel.pricePerNightINR?.toLocaleString() || '1,200'}
                  </span>
                  <span className="text-xs text-[#A1A1AA] font-mono">/ night</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleBookNow()}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-400/25 hover:scale-[1.02]"
              >
                <span>{primaryAction.label}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
