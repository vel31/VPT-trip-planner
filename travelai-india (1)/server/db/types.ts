export type UserRole = 'user' | 'admin';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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

export interface DbRoom {
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

export interface DbHotel {
  id: string;
  destinationId: string;
  destinationName: string;
  state: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  basePricePerNightINR: number;
  pricePerNightINR: number;
  priceCategory: 'Budget' | 'Mid-Range' | 'Luxury' | 'Ultra-Luxury';
  hotelCategory: string;
  amenities: string[];
  images: string[];
  imageUrl: string;
  phone?: string;
  email?: string;
  website?: string;
  officialWebsite?: string;
  rooms: DbRoom[];
  cancellationPolicy: string;
  source: string;
  verified: boolean;
}

export interface DbBooking {
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
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
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

export interface DbPayment {
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
  method?: string; // UPI, Card, NetBanking, etc.
  error_code?: string;
  error_description?: string;
  is_verified: boolean;
  is_demo: boolean;
  created_at: string;
  verified_at?: string;
}

export interface DbSavedPlace {
  id: string;
  user_id: string;
  type: 'destination' | 'hotel' | 'attraction' | 'food';
  item_id: string;
  title: string;
  subtitle: string;
  image_url: string;
  location: string;
  saved_at: string;
}

export interface DbItinerary {
  id: string;
  user_id: string;
  destination_id: string;
  destination_name: string;
  title: string;
  duration_days: number;
  budget_level: string;
  plan_json: any;
  created_at: string;
}

export interface DatabaseSchema {
  users: DbUser[];
  hotels: DbHotel[];
  bookings: DbBooking[];
  payments: DbPayment[];
  itineraries: DbItinerary[];
  saved_places: DbSavedPlace[];
}
