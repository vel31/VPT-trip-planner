import React from 'react';
import { Hotel } from '../types';
import { 
  Star, 
  MapPin, 
  Check, 
  Bed, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Compass, 
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import { 
  resolvePropertyCardDetails, 
  getPrimaryBookingAction, 
  calculateNights, 
  openExternalBooking,
  BookingContextParams
} from '../utils/bookingLinks';

interface PropertyCardProps {
  hotel: Hotel;
  destinationName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  isSelectedStay?: boolean;
  onSelectAsStay?: () => void;
  onViewDetails: (hotel: Hotel) => void;
  preferredProviderId?: string;
  itinerarySight?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  hotel,
  destinationName,
  checkIn,
  checkOut,
  guests,
  isSelectedStay = false,
  onSelectAsStay,
  onViewDetails,
  preferredProviderId = 'all',
  itinerarySight
}) => {
  const nights = calculateNights(checkIn, checkOut);
  const cardDetails = resolvePropertyCardDetails(hotel, destinationName);
  const bookingParams: BookingContextParams = {
    destinationName,
    checkIn,
    checkOut,
    guests
  };

  const primaryAction = getPrimaryBookingAction(hotel, bookingParams, preferredProviderId);
  const pricePerNight = hotel.pricePerNightINR || 1200;
  const totalPrice = pricePerNight * nights;

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    openExternalBooking(primaryAction.url);
  };

  // Render star icons matching rating
  const ratingVal = hotel.rating || 4.5;
  const fullStars = Math.floor(ratingVal);

  return (
    <div
      className={`rounded-3xl bg-[#0D0D11] border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:shadow-2xl ${
        isSelectedStay
          ? 'border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/40'
          : 'border-white/10 hover:border-amber-400/40'
      }`}
    >
      <div className="space-y-4">
        
        {/* 1. Property Image with Badges */}
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#14141A]">
          <img
            src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-black/20 to-black/50" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Star Rating Badge */}
              <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{ratingVal.toFixed(1)}</span>
                <span className="text-zinc-400 font-normal">({hotel.reviewCount || 150})</span>
              </span>

              {/* Hostel / Tier Tag */}
              {cardDetails.isHostel ? (
                <span className="px-2.5 py-1 rounded-full bg-orange-500/90 text-white text-[10px] font-mono uppercase font-bold tracking-wider shadow-md">
                  Hostel & Dorms
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-purple-500/80 backdrop-blur-md text-white text-[10px] font-mono uppercase font-bold">
                  {hotel.priceCategory || 'Mid-Range'}
                </span>
              )}
            </div>

            {/* Availability Status Badge */}
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-black text-[10px] font-mono uppercase font-bold tracking-wider flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span>Available</span>
            </span>
          </div>

          {/* Selected Itinerary Stay Badge */}
          {isSelectedStay && (
            <div className="absolute top-12 left-3 px-3 py-1 rounded-full bg-purple-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg ring-1 ring-white/20">
              <CheckCircle2 className="w-3 h-3" /> PRIMARY ITINERARY STAY
            </div>
          )}

          {/* Bottom Overlay Info on Image */}
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-[10px] font-mono uppercase text-amber-300 font-semibold tracking-wider block">
              {hotel.hotelCategory || 'Verified Stay'}
            </span>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md truncate">
              {hotel.name}
            </h3>
          </div>
        </div>

        {/* 2. Card Content Body */}
        <div className="px-5 space-y-3.5 text-xs">
          
          {/* Location & Rating Line */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} 
                  />
                ))}
              </div>
              <span className="font-bold">{ratingVal.toFixed(1)}</span>
              <span className="text-zinc-500">• {cardDetails.availabilityStatus}</span>
            </div>

            <div className="flex items-start gap-1.5 text-zinc-400 font-mono text-[11px] leading-snug">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{hotel.address}</span>
            </div>
          </div>

          {/* Room Type */}
          <div className="p-2.5 rounded-xl bg-[#14141A] border border-white/5 flex items-center gap-2">
            <Bed className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block leading-tight">Room Type</span>
              <p className="text-white font-medium text-xs truncate">{cardDetails.roomType}</p>
            </div>
          </div>

          {/* Price per night & estimated total */}
          <div className="flex items-baseline justify-between pt-1 border-t border-white/10">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                  ₹{pricePerNight.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400 font-mono">/ night</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono block">
                Estimated provider rate • ₹{totalPrice.toLocaleString()} total ({nights} {nights === 1 ? 'night' : 'nights'})
              </span>
            </div>
            
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">
              {guests} {guests === 1 ? 'Guest' : 'Guests'}
            </span>
          </div>

          {/* Available Amenities Checklist (✓) */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
              Key Included Amenities:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Free Wi-Fi</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Breakfast</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>AC</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Free Cancellation</span>
              </div>
            </div>
          </div>

          {/* Distance from destination / attractions */}
          <div className="p-2.5 rounded-xl bg-[#14141A] border border-white/5 space-y-1 text-[11px] font-mono">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" /> Location Distance:
              </span>
              <span className="text-white font-medium">{cardDetails.distance}</span>
            </div>
            {itinerarySight && (
              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
                <span className="truncate mr-1">Near: {itinerarySight}</span>
                <span className="text-amber-400 shrink-0">~{(hotel.distanceFromCenterKm ? (hotel.distanceFromCenterKm + 0.6).toFixed(1) : '1.8')} km</span>
              </div>
            )}
          </div>

          {/* Check-in and check-out information */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>In: <strong className="text-zinc-200">{cardDetails.checkInTime}</strong></span>
            </span>
            <span>•</span>
            <span>
              Out: <strong className="text-zinc-200">{cardDetails.checkOutTime}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* 3. Action Buttons Row: [ View Details ] [ Book Now ] */}
      <div className="p-5 pt-4 space-y-2 border-t border-white/10 mt-4">
        <div className="flex items-center gap-2.5">
          {/* View Details Button */}
          <button
            type="button"
            onClick={() => onViewDetails(hotel)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-medium uppercase tracking-wider transition-all cursor-pointer border border-white/15 text-center active:scale-[0.98]"
          >
            View Details
          </button>

          {/* Book Now Button: Prominent & Clickable */}
          <button
            type="button"
            onClick={handleBookNow}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/25 active:scale-[0.98]"
            title={`Open official booking page for ${hotel.name}`}
          >
            <span>{primaryAction.label.includes('View & Book') ? 'View & Book' : 'Book Now'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Set as Itinerary Stay Option */}
        {onSelectAsStay && (
          <button
            type="button"
            onClick={onSelectAsStay}
            className={`w-full py-2 rounded-xl text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              isSelectedStay
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {isSelectedStay ? (
              <>
                <Check className="w-3 h-3 text-purple-400" />
                <span>Selected as Itinerary Stay</span>
              </>
            ) : (
              <>
                <Building2 className="w-3 h-3 text-zinc-400" />
                <span>Set as Itinerary Stay</span>
              </>
            )}
          </button>
        )}
      </div>

    </div>
  );
};
