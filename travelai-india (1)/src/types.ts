export interface Coordinates {
  lat: number;
  lng: number;
}

export type DestinationCategory =
  | 'Heritage'
  | 'Beach'
  | 'Mountains'
  | 'Wildlife'
  | 'Spiritual'
  | 'Adventure'
  | 'Food & Culinary'
  | 'Nature'
  | 'Culture'
  | 'Royal Palace'
  | 'Backwaters'
  | 'Ayurveda'
  | 'UNESCO World Heritage'
  | 'Mughal Architecture'
  | string;

export interface NearestTransit {
  name: string;
  code: string;
  distanceKm: number;
}

export interface Connectivity {
  nearestAirport: NearestTransit;
  nearestRailwayStation: NearestTransit;
  roadConnectivity: string;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  unionTerritory?: boolean;
  region: 'North India' | 'South India' | 'West India' | 'East India' | 'Central India' | 'North East India' | string;
  tagline: string;
  overview?: string;
  description: string;
  coordinates: Coordinates;
  bestTimeToVisit: string;
  idealDurationDays: number;
  budgetTier?: 'Budget' | 'Mid-Range' | 'Luxury' | string;
  idealFor?: string[];
  categories?: DestinationCategory[];
  heroImageUrl?: string;
  featuredImage?: string;
  weatherSummary?: string;
  connectivity?: Connectivity;
  localCustoms?: string[];
  food?: FoodItem[];
  officialTourismUrl: string;
  popularFor: string[];
  source: string;
  sourceUrl: string;
  providerId: string;
  lastVerified: string;
  verificationStatus: 'verified' | 'official_tourism_board';
}

export type HotelCategory =
  | 'Luxury Palace'
  | '5-Star Luxury'
  | 'Heritage Haveli'
  | 'Boutique Resort'
  | 'Premium 4-Star'
  | 'Comfort 3-Star'
  | 'Heritage Homestay'
  | 'Eco Lodge'
  | string;

export interface Hotel {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  coordinates?: Coordinates;
  rating: number;
  reviewCount: number;
  pricePerNightINR: number;
  priceCategory: 'Budget' | 'Mid-Range' | 'Luxury' | 'Ultra-Luxury' | string;
  hotelCategory: HotelCategory;
  amenities: string[];
  phone?: string;
  officialWebsite?: string;
  bookingUrl?: string;
  distanceFromCenterKm?: number;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  providerId: string;
  lastVerified: string;
  verificationStatus: 'verified' | 'official_listing';
  roomType?: string;
  checkInTime?: string;
  checkOutTime?: string;
  availabilityStatus?: string;
  distanceFromAttraction?: string;
  cancellationPolicy?: string;
  bookingProvider?: string;
  priceType?: 'estimated' | 'official' | string;
}

export type AttractionCategory =
  | 'UNESCO World Heritage'
  | 'Historic Fort & Palace'
  | 'Sacred Temple / Spiritual'
  | 'Scenic Nature & Lake'
  | 'Wildlife Sanctuary'
  | 'Museum & Art'
  | 'Beach & Coastal'
  | 'Adventure & Trek'
  | 'Market & Bazaar'
  | string;

export interface Attraction {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  coordinates?: Coordinates;
  category: AttractionCategory;
  rating: number;
  reviewCount: number;
  openingHours: string;
  entryFeeINR: number;
  entryFeeForeignerINR?: number;
  officialWebsite?: string;
  bestTimeToVisitTimeOfDay: string;
  estimatedVisitDurationHours: number;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  providerId: string;
  lastVerified: string;
  verificationStatus: 'verified' | 'official_asi_record';
}

export type FoodCategory =
  | 'Traditional Main Course'
  | 'Iconic Street Food'
  | 'Royal Cuisine'
  | 'Famous Dessert / Sweet'
  | 'Regional Beverage'
  | 'Breakfast Special'
  | 'Coastal Seafood'
  | 'Vegetarian Feast'
  | string;

export interface FamousEstablishment {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  coordinates?: Coordinates;
  rating: number;
  approxPriceForTwoINR: number;
  openingHours?: string;
  website?: string;
}

export interface FoodItem {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  description: string;
  cuisine: string;
  category: FoodCategory;
  localSignificance: string;
  isVegetarian: boolean;
  isNonVegetarian: boolean;
  famousEstablishment?: FamousEstablishment;
  imageUrl: string;
  coordinates?: Coordinates;
  source: string;
  sourceUrl: string;
  providerId: string;
  lastVerified: string;
  verificationStatus: 'verified' | 'culinary_heritage_record';
}

export interface ItineraryDaySegment {
  time: string;
  attractionName?: string;
  activityTitle?: string;
  description: string;
  lunchSpot?: string;
  dinnerSpot?: string;
  attractionOrActivity?: string;
  practicalTip?: string;
  estimatedCostINR: number;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  morning: ItineraryDaySegment;
  afternoon: ItineraryDaySegment;
  evening: ItineraryDaySegment;
  estimatedDayCostINR: number;
}

export interface PlanTripRequest {
  destinationId: string;
  days: number;
  travelers: string;
  travelStyle: string;
  budgetLevel: 'Budget' | 'Mid-Range' | 'Luxury' | string;
  dietaryPreference: string;
  interests?: string[];
  checkInDate?: string;
  checkOutDate?: string;
}

export interface TripPlan {
  id: string;
  destinationId: string;
  destinationName: string;
  state: string;
  durationDays: number;
  travelers: string;
  travelStyle: string;
  budgetLevel: string;
  dietaryPreference: string;
  checkInDate?: string;
  checkOutDate?: string;
  title: string;
  summary: string;
  recommendedHotel?: Hotel;
  hotelRationale?: string;
  curatedHotels?: Hotel[];
  curatedFood?: FoodItem[];
  days: ItineraryDay[];
  transportRecommendations: string[];
  insiderTips: string[];
  estimatedTotalCostINR: number;
  createdAt: string;
  verifiedGrounding?: {
    attractionsUsed: number;
    hotelsEvaluated: number;
    foodRecordsGrounded: number;
    status: string;
  };
}

export interface PlaceResult {
  id: string;
  displayName: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: Coordinates;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  priceLevel?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  photos?: Array<{
    name: string;
    authorAttributions?: Array<{ displayName: string; uri: string }>;
  }>;
}

export interface RouteStep {
  instruction: string;
  distanceKm: number;
  durationMins: number;
  startLocation?: Coordinates;
  endLocation?: Coordinates;
}

export interface DirectionsRoute {
  distanceKm: number;
  durationMins: number;
  durationText: string;
  distanceText: string;
  mode: 'DRIVE' | 'TRANSIT' | 'WALK' | 'TWO_WHEELER';
  originName: string;
  destinationName: string;
  originCoords: Coordinates;
  destinationCoords: Coordinates;
  polylinePoints: Coordinates[];
  steps: RouteStep[];
  source: 'google_routes_api' | 'geoapify_routing_api' | 'verified_geo_engine';
}

export interface GeocodeResult {
  formattedAddress: string;
  coordinates: Coordinates;
  placeId?: string;
  types?: string[];
  city?: string;
  state?: string;
  country?: string;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface HotelRoom {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  maxGuests: number;
  bedType: string;
  pricePerNightINR: number;
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  imageUrl: string;
  cancellationPolicy: string;
}

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'PAID' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED'
  | 'DEMO_UNPAID';

export type BookingStatus = 
  | 'CONFIRMED' 
  | 'PENDING' 
  | 'CANCELLED'
  | 'DEMO_UNCONFIRMED';

export interface Booking {
  booking_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  hotel_id: string;
  hotel_name: string;
  hotel_address: string;
  hotel_image: string;
  room_id: string;
  room_name: string;
  destination: string;
  destination_state: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  rooms: number;
  base_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  special_requests?: string;
  cancellation_reason?: string;
  is_demo_booking: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  user_id: string;
  amount_inr: number;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  method?: string;
  error_code?: string;
  error_description?: string;
  is_verified: boolean;
  is_demo: boolean;
  created_at: string;
  verified_at?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  successfulPayments: number;
  failedPayments: number;
  cancelledBookings: number;
  totalRevenueINR: number;
  popularDestinations: { destination: string; count: number }[];
  liveApiStatus: {
    razorpayConfigured: boolean;
    googleMapsConfigured: boolean;
    openWeatherConfigured: boolean;
    geminiConfigured: boolean;
  };
}

