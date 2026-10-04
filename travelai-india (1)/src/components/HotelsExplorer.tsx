import React, { useState, useEffect } from 'react';
import { Hotel } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Check, 
  Filter, 
  SlidersHorizontal, 
  Heart,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface HotelsExplorerProps {
  onSelectHotelForBooking: (hotel: Hotel) => void;
  initialDestination?: string;
}

export const HotelsExplorer: React.FC<HotelsExplorerProps> = ({
  onSelectHotelForBooking,
  initialDestination
}) => {
  const { user, token } = useAuth();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [destination, setDestination] = useState<string>(initialDestination || 'all');
  const [priceCategory, setPriceCategory] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [freeCancellation, setFreeCancellation] = useState<boolean>(false);
  const [savedHotelIds, setSavedHotelIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (destination && destination !== 'all') params.append('destination', destination);
      if (priceCategory && priceCategory !== 'all') params.append('priceCategory', priceCategory);
      if (minRating > 0) params.append('rating', minRating.toString());
      if (freeCancellation) params.append('freeCancellation', 'true');
      if (sortBy) params.append('sortBy', sortBy);

      const res = await fetch(`/api/hotels?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
      }
    } catch (err) {
      console.error('Failed to load hotels directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [destination, priceCategory, minRating, freeCancellation, sortBy]);

  const toggleSaveHotel = async (hotel: Hotel) => {
    if (!token) {
      setToastMsg('Please sign in to save hotels to your personal wishlist.');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }
    try {
      const res = await fetch('/api/saved-places/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'hotel',
          item_id: hotel.id,
          title: hotel.name,
          subtitle: `${hotel.destinationName || hotel.destinationId} • ₹${(hotel.pricePerNightINR ?? (hotel as any).basePricePerNightINR ?? 8500).toLocaleString()}/night`,
          image_url: hotel.imageUrl || (hotel as any).images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          location: hotel.address
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedHotelIds(prev => {
          const next = new Set(prev);
          if (data.saved) next.add(hotel.id);
          else next.delete(hotel.id);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          role="alert"
          className="fixed top-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-400 text-black font-medium text-xs shadow-2xl border border-amber-300 transition-all animate-bounce"
        >
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="font-bold ml-2 hover:opacity-80 focus:outline-none"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono text-xs uppercase tracking-widest">
          <Building2 className="w-3.5 h-3.5" />
          <span>VERIFIED INDIAN HERITAGE STAYS & PALACES</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase">
          EXPLORE SANCTUARIES & HAVELIS
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] font-light leading-relaxed">
          Book authentic boutique retreats, royal heritage palaces, and nature retreats across India with verified occupancy rates and instant booking vouchers.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0F0F15] border border-white/10 mb-8 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase">DESTINATION</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14141C] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Destinations</option>
              <option value="jaipur">Jaipur (Rajasthan)</option>
              <option value="udaipur">Udaipur (Rajasthan)</option>
              <option value="varanasi">Varanasi (Uttar Pradesh)</option>
              <option value="goa">Goa (Coastal)</option>
              <option value="kerala">Kerala (Backwaters)</option>
              <option value="agra">Agra (Uttar Pradesh)</option>
              <option value="ladakh">Ladakh (Himalayas)</option>
              <option value="rishikesh">Rishikesh (Uttarakhand)</option>
            </select>
          </div>

          {/* Price Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase">CATEGORY</label>
            <select
              value={priceCategory}
              onChange={(e) => setPriceCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14141C] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Luxury">Luxury Palaces (₹12,000+)</option>
              <option value="Mid-Range">Heritage Haveli (₹5,000 - ₹12,000)</option>
              <option value="Budget">Boutique Budget (Under ₹5,000)</option>
            </select>
          </div>

          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase">MINIMUM RATING</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#14141C] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value={0}>Any Rating</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.8}>4.8+ Stars (Exceptional)</option>
            </select>
          </div>

          {/* Sort */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase">SORT BY</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14141C] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended Stays</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 pt-2 border-t border-white/5 text-xs font-mono text-[#A1A1AA]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={freeCancellation}
              onChange={(e) => setFreeCancellation(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-amber-400 focus:ring-0 cursor-pointer"
            />
            <span>Free Cancellation Only</span>
          </label>
          <span className="text-[11px] text-[#71717A]">
            Showing <strong>{hotels.length}</strong> verified properties
          </span>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs flex items-center justify-between">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-amber-400 hover:text-white cursor-pointer ml-3 font-bold">×</button>
        </div>
      )}

      {/* Hotel Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/5 border border-white/10 space-y-4">
          <Building2 className="w-12 h-12 mx-auto text-[#71717A]" />
          <h3 className="font-cinzel text-xl font-bold text-white uppercase">NO PROPERTIES MATCH YOUR FILTER</h3>
          <p className="text-xs text-[#A1A1AA]">
            Try adjusting your price category or destination selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => {
            const isSaved = savedHotelIds.has(hotel.id);
            return (
              <div
                key={hotel.id}
                className="group rounded-3xl bg-[#0F0F14] border border-white/10 hover:border-amber-400/40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                {/* Photo & Badges */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={hotel.imageUrl || (hotel as any).images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14] via-transparent to-black/40" />

                  {/* Rating Tag */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white font-mono text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{hotel.rating}</span>
                    <span className="text-[#A1A1AA] text-[10px]">({hotel.reviewCount})</span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSaveHotel(hotel)}
                    className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3.5">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-400/90 text-black font-mono text-[10px] font-bold uppercase tracking-wider">
                      {hotel.priceCategory} • {hotel.hotelCategory}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] font-mono flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{hotel.address}</span>
                    </p>
                    <p className="text-xs text-[#D4D4D8] font-light line-clamp-2 leading-relaxed pt-1">
                      {hotel.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {hotel.amenities.slice(0, 3).map((am) => (
                      <span
                        key={am}
                        className="px-2 py-0.5 rounded bg-white/5 text-[#A1A1AA] font-mono text-[10px]"
                      >
                        {am}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[#71717A] font-mono text-[10px]">
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price & Booking Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase block">STARTING AT</span>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-lg font-bold text-white">
                          ₹{(hotel.pricePerNightINR ?? (hotel as any).basePricePerNightINR ?? 8500).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-[#71717A]">/ night</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectHotelForBooking(hotel)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
                    >
                      <span>BOOK STAY</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
