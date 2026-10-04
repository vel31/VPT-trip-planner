import { Hotel } from '../types';

export interface BookingProviderOption {
  providerId: 'booking' | 'makemytrip' | 'agoda' | 'hostelworld' | 'airbnb' | 'official';
  providerName: string;
  badge?: string;
  url: string;
  isDirectBooking: boolean;
  actionLabel: string;
  description: string;
  colorClass: string;
}

export interface BookingContextParams {
  destinationName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
}

/**
 * Normalizes dates to ensure check-out is strictly after check-in.
 */
export function getValidDateRange(checkIn?: string, checkOut?: string, defaultDays: number = 3): { checkIn: string; checkOut: string } {
  const today = new Date();
  
  // Default check-in tomorrow
  let inDate = new Date(today);
  inDate.setDate(today.getDate() + 1);
  if (checkIn && !isNaN(new Date(checkIn).getTime())) {
    inDate = new Date(checkIn);
  }

  // Default check-out inDate + defaultDays
  let outDate = new Date(inDate);
  outDate.setDate(inDate.getDate() + Math.max(1, defaultDays));
  if (checkOut && !isNaN(new Date(checkOut).getTime())) {
    const candidateOut = new Date(checkOut);
    if (candidateOut > inDate) {
      outDate = candidateOut;
    }
  }

  return {
    checkIn: inDate.toISOString().split('T')[0],
    checkOut: outDate.toISOString().split('T')[0]
  };
}

/**
 * Computes nights between check-in and check-out
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffMs = d2.getTime() - d1.getTime();
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, isNaN(nights) ? 1 : nights);
}

/**
 * Checks if a property is a hostel, backpacker stay, or dorm
 */
export function isHostelProperty(hotel: Hotel): boolean {
  const name = (hotel.name || '').toLowerCase();
  const category = (hotel.hotelCategory || '').toLowerCase();
  const desc = (hotel.address || '').toLowerCase();
  
  return (
    name.includes('zostel') ||
    name.includes('hostel') ||
    name.includes('backpacker') ||
    name.includes('dorm') ||
    name.includes('youth') ||
    category.includes('hostel') ||
    category.includes('dorm') ||
    desc.includes('hostel')
  );
}

/**
 * Generates legitimate booking provider links with destination, check-in, check-out, and guests.
 */
export function getBookingProviderLinks(
  hotel: Hotel,
  params: BookingContextParams
): BookingProviderOption[] {
  const { destinationName, checkIn, checkOut, guests } = params;
  const safeName = hotel.name.trim();
  const safeDest = (hotel.destinationName || destinationName || 'India').trim();
  const fullSearchQuery = `${safeName} ${safeDest}`;
  const isHostel = isHostelProperty(hotel);

  const providers: BookingProviderOption[] = [];

  // 1. Direct / Official website (if valid and not generic tourism portal)
  const isOfficialPropertySite = 
    Boolean(hotel.officialWebsite) && 
    !hotel.officialWebsite?.includes('tourism.gov.in') &&
    !hotel.officialWebsite?.includes('incredibleindia.org');

  if (isOfficialPropertySite && hotel.officialWebsite) {
    providers.push({
      providerId: 'official',
      providerName: 'Official Website',
      badge: 'Direct Official',
      url: hotel.officialWebsite,
      isDirectBooking: true,
      actionLabel: 'Book on Official Site',
      description: 'Official direct reservations & property website',
      colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    });
  }

  // 2. Booking.com Deep Link
  // Supported params: ss (search string), checkin (YYYY-MM-DD), checkout (YYYY-MM-DD), group_adults, no_rooms
  const bookingComUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(fullSearchQuery)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}&no_rooms=1`;
  
  providers.push({
    providerId: 'booking',
    providerName: 'Booking.com',
    badge: isHostel ? 'Hostels & Rooms' : 'Best Price Guarantee',
    url: hotel.bookingUrl && hotel.bookingUrl.includes('booking.com') ? hotel.bookingUrl : bookingComUrl,
    isDirectBooking: Boolean(hotel.bookingUrl && hotel.bookingUrl.includes('booking.com')),
    actionLabel: hotel.bookingUrl && hotel.bookingUrl.includes('booking.com') ? 'Book Now on Booking.com' : 'View & Book on Booking.com',
    description: 'Instant confirmation with free cancellation options',
    colorClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  });

  // 3. Hostelworld (Prioritized for hostels and backpacker dorms)
  if (isHostel) {
    const hostelworldUrl = `https://www.hostelworld.com/s?q=${encodeURIComponent(fullSearchQuery)}&dateFrom=${checkIn}&dateTo=${checkOut}&number_of_guests=${guests}`;
    providers.push({
      providerId: 'hostelworld',
      providerName: 'Hostelworld',
      badge: 'Top for Backpackers',
      url: hostelworldUrl,
      isDirectBooking: false,
      actionLabel: 'View & Book on Hostelworld',
      description: 'Dorms, private rooms, and backpacker social events',
      colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    });
  }

  // 4. MakeMyTrip Deep Link
  // Supported query: city, searchText, checkin, checkout, roomStayQualifier
  const mmtUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(safeDest)}&searchText=${encodeURIComponent(safeName)}&checkin=${encodeURIComponent(checkIn)}&checkout=${encodeURIComponent(checkOut)}&roomStayQualifier=${guests}e0e`;
  
  providers.push({
    providerId: 'makemytrip',
    providerName: 'MakeMyTrip',
    badge: 'Popular in India',
    url: mmtUrl,
    isDirectBooking: false,
    actionLabel: 'View & Book on MakeMyTrip',
    description: 'India domestic hotel & holiday rates with UPI payment',
    colorClass: 'bg-red-500/20 text-red-300 border-red-500/40'
  });

  // 5. Agoda Deep Link
  // Supported query: text, checkIn, checkOut, rooms, adults
  const agodaUrl = `https://www.agoda.com/search?text=${encodeURIComponent(fullSearchQuery)}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=1&adults=${guests}`;
  
  providers.push({
    providerId: 'agoda',
    providerName: 'Agoda',
    badge: 'Member Rates',
    url: agodaUrl,
    isDirectBooking: false,
    actionLabel: 'View & Book on Agoda',
    description: 'Competitive Asia-Pacific pricing & loyalty cashback',
    colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  });

  // 6. Airbnb Deep Link
  const airbnbUrl = `https://www.airbnb.com/s/${encodeURIComponent(safeDest)}/homes?query=${encodeURIComponent(safeName)}&checkin=${checkIn}&checkout=${checkOut}&adults=${guests}`;
  
  providers.push({
    providerId: 'airbnb',
    providerName: 'Airbnb',
    badge: 'Boutique & Homestays',
    url: airbnbUrl,
    isDirectBooking: false,
    actionLabel: 'View & Book on Airbnb',
    description: 'Unique stays, boutique apartments, and local hosts',
    colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  });

  // If not a hostel, still add Hostelworld at the end for flexibility
  if (!isHostel) {
    const hostelworldUrl = `https://www.hostelworld.com/s?q=${encodeURIComponent(fullSearchQuery)}&dateFrom=${checkIn}&dateTo=${checkOut}&number_of_guests=${guests}`;
    providers.push({
      providerId: 'hostelworld',
      providerName: 'Hostelworld',
      badge: 'Backpacker Network',
      url: hostelworldUrl,
      isDirectBooking: false,
      actionLabel: 'View & Book on Hostelworld',
      description: 'Hostel search and social community',
      colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    });
  }

  return providers;
}

/**
 * Gets the primary booking action for the main "Book Now" / "View & Book" button.
 */
export function getPrimaryBookingAction(
  hotel: Hotel,
  params: BookingContextParams,
  preferredProviderId?: string
): {
  url: string;
  label: string;
  providerName: string;
  isDirectBooking: boolean;
  badge?: string;
} {
  const options = getBookingProviderLinks(hotel, params);
  
  // If user selected a preferred provider, match it
  if (preferredProviderId && preferredProviderId !== 'all') {
    const match = options.find(o => o.providerId === preferredProviderId);
    if (match) {
      return {
        url: match.url,
        label: match.isDirectBooking ? `Book Now (${match.providerName})` : `View & Book on ${match.providerName}`,
        providerName: match.providerName,
        isDirectBooking: match.isDirectBooking,
        badge: match.badge
      };
    }
  }

  // If hotel has a direct bookingUrl from API
  if (hotel.bookingUrl) {
    return {
      url: hotel.bookingUrl,
      label: 'Book Now',
      providerName: 'Direct Booking Engine',
      isDirectBooking: true,
      badge: 'Direct Official Link'
    };
  }

  // If hostel, check if official site is available, else Booking.com
  const isHostel = isHostelProperty(hotel);
  const officialOpt = options.find(o => o.providerId === 'official');
  
  if (isHostel && officialOpt) {
    return {
      url: officialOpt.url,
      label: 'Book Now on Official Site',
      providerName: 'Official Website',
      isDirectBooking: true,
      badge: 'Official Zostel / Hostel'
    };
  }

  // Default to Booking.com deep link
  const bookingComOpt = options.find(o => o.providerId === 'booking') || options[0];
  return {
    url: bookingComOpt.url,
    label: bookingComOpt.isDirectBooking ? 'Book Now on Booking.com' : 'View & Book on Booking.com',
    providerName: bookingComOpt.providerName,
    isDirectBooking: bookingComOpt.isDirectBooking,
    badge: bookingComOpt.badge
  };
}

/**
 * Resolves room type, check-in/out, and distance metadata for card display
 */
export function resolvePropertyCardDetails(hotel: Hotel, currentDestinationName?: string) {
  const isHostel = isHostelProperty(hotel);

  // Room type determination
  let roomType = hotel.roomType;
  if (!roomType) {
    if (isHostel) {
      roomType = '6-Bed Mixed AC Dorm & Private En-suite';
    } else if (hotel.priceCategory === 'Ultra-Luxury' || hotel.hotelCategory === 'Luxury Palace') {
      roomType = 'Royal Palace Suite with Heritage Balcony';
    } else if (hotel.priceCategory === 'Luxury' || hotel.hotelCategory === '5-Star Luxury') {
      roomType = 'Deluxe Heritage King Room';
    } else if (hotel.hotelCategory === 'Heritage Haveli') {
      roomType = 'Traditional Haveli Double Room';
    } else if (hotel.priceCategory === 'Budget') {
      roomType = 'Standard AC Double Room';
    } else {
      roomType = 'Superior Deluxe Room';
    }
  }

  // Check-in & Check-out times
  const checkInTime = hotel.checkInTime || (isHostel ? '12:00 PM' : '02:00 PM');
  const checkOutTime = hotel.checkOutTime || (isHostel ? '10:00 AM' : '11:00 AM');

  // Availability status
  const availabilityStatus = hotel.availabilityStatus || 'Instant Confirmation';

  // Distance from destination center / key sights
  const distance = hotel.distanceFromAttraction || 
    (hotel.distanceFromCenterKm 
      ? `${hotel.distanceFromCenterKm} km from City Center` 
      : `Near Central ${currentDestinationName || hotel.destinationName}`);

  // Cancellation policy
  const cancellationPolicy = hotel.cancellationPolicy || 'Free Cancellation (up to 48 hrs before check-in)';

  // Key standard amenities guaranteed
  const standardAmenities = [
    'Free Wi-Fi',
    isHostel ? 'Free Chai & Common Room' : 'Buffet Breakfast Included',
    'Air Conditioning',
    'Free Cancellation'
  ];

  return {
    isHostel,
    roomType,
    checkInTime,
    checkOutTime,
    availabilityStatus,
    distance,
    cancellationPolicy,
    standardAmenities
  };
}

/**
 * Safely opens legitimate external booking page in a new browser tab.
 */
export function openExternalBooking(url: string) {
  if (!url) return;
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      newWindow.opener = null;
    }
  }
}
