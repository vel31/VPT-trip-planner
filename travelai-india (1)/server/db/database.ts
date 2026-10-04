import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { 
  DatabaseSchema, 
  DbUser, 
  DbHotel, 
  DbRoom, 
  DbBooking, 
  DbPayment, 
  DbSavedPlace, 
  DbItinerary, 
  BookingStatus, 
  PaymentStatus 
} from './types';
import { allHotels, allDestinations } from '../data/index';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'travel_platform_db.json');

class DatabaseService {
  private schema: DatabaseSchema = {
    users: [],
    hotels: [],
    bookings: [],
    payments: [],
    itineraries: [],
    saved_places: []
  };

  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(raw);
        // Normalize loaded hotels to ensure pricePerNightINR and imageUrl exist
        if (this.schema.hotels && Array.isArray(this.schema.hotels)) {
          let modified = false;
          this.schema.hotels = this.schema.hotels.map(h => {
            const price = h.pricePerNightINR ?? h.basePricePerNightINR ?? 8500;
            const img = h.imageUrl || (h.images && h.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
            const web = h.officialWebsite || h.website || 'https://www.tourism.gov.in';
            if (!h.pricePerNightINR || !h.imageUrl || !h.officialWebsite) {
              modified = true;
            }
            return {
              ...h,
              pricePerNightINR: price,
              basePricePerNightINR: h.basePricePerNightINR ?? price,
              imageUrl: img,
              images: h.images && h.images.length > 0 ? h.images : [img],
              officialWebsite: web,
              website: h.website || web
            };
          });
          if (modified) {
            this.persist();
          }
        }
      } else {
        this.seedInitialData();
        this.persist();
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize database, reseeding...', err);
      this.seedInitialData();
      this.persist();
      this.isInitialized = true;
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.schema, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('Admin@TravelAI2026', salt);
    const travelerHash = bcrypt.hashSync('Traveler@2026', salt);

    const now = new Date().toISOString();

    const users: DbUser[] = [
      {
        id: 'usr_admin_001',
        name: 'TravelAI Administrator',
        email: 'admin@travelai.in',
        passwordHash: adminHash,
        role: 'admin',
        phone: '+91 98765 43210',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'usr_traveler_001',
        name: 'Aarav Sharma',
        email: 'traveler@travelai.in',
        passwordHash: travelerHash,
        role: 'user',
        phone: '+91 91234 56789',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        createdAt: now,
        updatedAt: now
      }
    ];

    // Seed hotels and realistic room types from verified India data
    const hotels: DbHotel[] = allHotels.map((h, idx) => {
      const basePrice = h.pricePerNightINR || 8500;
      const destination = allDestinations.find(d => d.id.toLowerCase() === h.destinationId.toLowerCase());
      
      const rooms: DbRoom[] = [
        {
          id: `room_${h.id}_deluxe`,
          hotelId: h.id,
          name: 'Deluxe Heritage Room',
          description: 'Elegantly appointed room featuring authentic Indian craftsmanship, plush bedding, and serene views.',
          maxGuests: 2,
          bedType: '1 King Bed or 2 Twin Beds',
          pricePerNightINR: basePrice,
          totalRooms: 8,
          availableRooms: 5,
          amenities: ['High-speed Wi-Fi', 'Complimentary Buffet Breakfast', 'Climate Control AC', 'Ensuite Marble Bathroom', '24/7 Room Service'],
          imageUrl: h.imageUrl || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
          cancellationPolicy: 'Free cancellation up to 48 hours before check-in. 100% refund.'
        },
        {
          id: `room_${h.id}_suite`,
          hotelId: h.id,
          name: 'Royal Palace Suite',
          description: 'Expansive private suite with separate living salon, antique royal accents, panoramic balcony, and butler service.',
          maxGuests: 3,
          bedType: '1 Royal Master King Bed + Sofa Lounge',
          pricePerNightINR: Math.round(basePrice * 1.65),
          totalRooms: 4,
          availableRooms: 3,
          amenities: ['Private Balcony View', 'VIP Lounge Access', 'Complimentary High Tea & Breakfast', 'Jacuzzi Tub', 'Dedicated Butler'],
          imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          cancellationPolicy: 'Free cancellation up to 72 hours before check-in.'
        },
        {
          id: `room_${h.id}_presidential`,
          hotelId: h.id,
          name: 'Grand Signature Sanctuary',
          description: 'Top-tier luxury residence with custom Rajputana arches, dining pavilion, private plunge pool, and heritage courtyard.',
          maxGuests: 4,
          bedType: '2 King Master Bedrooms',
          pricePerNightINR: Math.round(basePrice * 2.8),
          totalRooms: 2,
          availableRooms: 2,
          amenities: ['Private Plunge Pool', 'Airport Luxury Chauffeur Transfer', 'Full In-Suite Bar', 'Spa Treatments Included', 'Curated Private Dining'],
          imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
          cancellationPolicy: 'Free cancellation up to 5 days before arrival.'
        }
      ];

      return {
        id: h.id,
        destinationId: h.destinationId,
        destinationName: h.destinationName || (destination?.name || 'India'),
        state: destination?.state || 'India',
        name: h.name,
        address: h.address,
        latitude: h.latitude || h.coordinates?.lat || 20.5937,
        longitude: h.longitude || h.coordinates?.lng || 78.9629,
        rating: h.rating || 4.8,
        reviewCount: h.reviewCount || 340,
        basePricePerNightINR: basePrice,
        pricePerNightINR: basePrice,
        priceCategory: (h.priceCategory as any) || 'Luxury',
        hotelCategory: h.hotelCategory || '5-Star Luxury',
        amenities: h.amenities || ['Swimming Pool', 'Spa & Wellness', 'Multi-cuisine Dining', 'Free High-speed Wi-Fi', 'Concierge Desk', 'Valet Parking'],
        images: [h.imageUrl].filter(Boolean),
        imageUrl: h.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        phone: h.phone || '+91 1800 111 222',
        email: 'reservations@' + h.id.replace(/[^a-z0-9]/gi, '').toLowerCase() + '.in',
        website: h.officialWebsite || 'https://www.tourism.gov.in',
        officialWebsite: h.officialWebsite || 'https://www.tourism.gov.in',
        rooms,
        cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival date. No hidden fees.',
        source: h.source || 'Official Heritage Hospitality Registry',
        verified: true
      };
    });

    // Seed a couple of realistic initial bookings for traveler and admin verification
    const bookings: DbBooking[] = [
      {
        booking_id: 'IN-BK-2026-8891',
        user_id: 'usr_traveler_001',
        user_name: 'Aarav Sharma',
        user_email: 'traveler@travelai.in',
        user_phone: '+91 91234 56789',
        hotel_id: hotels[0]?.id || 'hotel-jaipur-rambagh',
        hotel_name: hotels[0]?.name || 'Rambagh Palace',
        hotel_address: hotels[0]?.address || 'Bhawani Singh Road, Jaipur, Rajasthan',
        hotel_image: hotels[0]?.images[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        room_id: hotels[0]?.rooms[0]?.id || 'room_deluxe',
        room_name: 'Deluxe Heritage Room',
        destination: hotels[0]?.destinationName || 'Jaipur',
        destination_state: hotels[0]?.state || 'Rajasthan',
        check_in: '2026-10-15',
        check_out: '2026-10-18',
        nights: 3,
        guests: 2,
        rooms: 1,
        base_amount: 36000,
        tax_amount: 4320, // 12% GST
        total_amount: 40320,
        currency: 'INR',
        payment_status: 'PAID',
        booking_status: 'CONFIRMED',
        razorpay_order_id: 'order_live_jaipur_demo8891',
        razorpay_payment_id: 'pay_live_jaipur_demo8891',
        special_requests: 'Quiet room with courtyard view, late check-in at 7 PM.',
        is_demo_booking: false,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        booking_id: 'IN-BK-2026-7243',
        user_id: 'usr_traveler_001',
        user_name: 'Aarav Sharma',
        user_email: 'traveler@travelai.in',
        user_phone: '+91 91234 56789',
        hotel_id: hotels[1]?.id || 'hotel-goa-taj-exotica',
        hotel_name: hotels[1]?.name || 'Taj Exotica Resort & Spa',
        hotel_address: hotels[1]?.address || 'Benaulim, South Goa',
        hotel_image: hotels[1]?.images[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        room_id: hotels[1]?.rooms[1]?.id || 'room_suite',
        room_name: 'Royal Palace Suite',
        destination: hotels[1]?.destinationName || 'Goa',
        destination_state: hotels[1]?.state || 'Goa',
        check_in: '2026-12-20',
        check_out: '2026-12-24',
        nights: 4,
        guests: 2,
        rooms: 1,
        base_amount: 68000,
        tax_amount: 8160,
        total_amount: 76160,
        currency: 'INR',
        payment_status: 'PAID',
        booking_status: 'CONFIRMED',
        razorpay_order_id: 'order_live_goa_demo7243',
        razorpay_payment_id: 'pay_live_goa_demo7243',
        special_requests: 'Anniversary celebration. Fruit basket and ocean view requested.',
        is_demo_booking: false,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 86400000).toISOString()
      }
    ];

    const payments: DbPayment[] = [
      {
        id: 'pay_rec_001',
        booking_id: 'IN-BK-2026-8891',
        user_id: 'usr_traveler_001',
        amount_inr: 40320,
        amount_paise: 4032000,
        currency: 'INR',
        status: 'PAID',
        razorpay_order_id: 'order_live_jaipur_demo8891',
        razorpay_payment_id: 'pay_live_jaipur_demo8891',
        method: 'UPI',
        is_verified: true,
        is_demo: false,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        verified_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'pay_rec_002',
        booking_id: 'IN-BK-2026-7243',
        user_id: 'usr_traveler_001',
        amount_inr: 76160,
        amount_paise: 7616000,
        currency: 'INR',
        status: 'PAID',
        razorpay_order_id: 'order_live_goa_demo7243',
        razorpay_payment_id: 'pay_live_goa_demo7243',
        method: 'Credit Card',
        is_verified: true,
        is_demo: false,
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        verified_at: new Date(Date.now() - 12 * 86400000).toISOString()
      }
    ];

    this.schema = {
      users,
      hotels,
      bookings,
      payments,
      itineraries: [],
      saved_places: []
    };
  }

  // --- USER AUTHENTICATION & MANAGEMENT ---
  public findUserById(id: string): DbUser | undefined {
    return this.schema.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string): DbUser | undefined {
    const normalized = email.trim().toLowerCase();
    return this.schema.users.find(u => u.email.toLowerCase() === normalized);
  }

  public createUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    phone?: string;
  }): DbUser {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);
    const now = new Date().toISOString();

    const newUser: DbUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash,
      role: userData.role || 'user',
      phone: userData.phone?.trim() || '',
      createdAt: now,
      updatedAt: now
    };

    this.schema.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUserProfile(userId: string, updates: { name?: string; phone?: string; avatarUrl?: string }): DbUser {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found.');

    if (updates.name) user.name = updates.name.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl.trim();
    user.updatedAt = new Date().toISOString();

    this.persist();
    return user;
  }

  public changeUserPassword(userId: string, oldPassword: string, newPassword: string):boolean {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found.');

    const isMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public getAllUsers(): Omit<DbUser, 'passwordHash'>[] {
    return this.schema.users.map(({ passwordHash, ...rest }) => rest);
  }

  // --- HOTELS & SEARCH ---
  public getAllHotels(): DbHotel[] {
    return this.schema.hotels;
  }

  public getHotelById(id: string): DbHotel | undefined {
    return this.schema.hotels.find(h => h.id.toLowerCase() === id.toLowerCase());
  }

  public searchHotels(params: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    amenities?: string[];
    priceCategory?: string;
    freeCancellation?: boolean;
    sortBy?: 'recommended' | 'price_low' | 'price_high' | 'rating';
  }): DbHotel[] {
    let result = [...this.schema.hotels];

    if (params.destination && params.destination.trim()) {
      const q = params.destination.trim().toLowerCase();
      result = result.filter(h => 
        h.destinationName.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q)
      );
    }

    if (params.minPrice !== undefined && params.minPrice > 0) {
      result = result.filter(h => h.basePricePerNightINR >= params.minPrice!);
    }

    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      result = result.filter(h => h.basePricePerNightINR <= params.maxPrice!);
    }

    if (params.rating !== undefined && params.rating > 0) {
      result = result.filter(h => h.rating >= params.rating!);
    }

    if (params.priceCategory && params.priceCategory !== 'all') {
      const cat = params.priceCategory.toLowerCase();
      result = result.filter(h => h.priceCategory.toLowerCase() === cat);
    }

    if (params.freeCancellation) {
      result = result.filter(h => h.cancellationPolicy.toLowerCase().includes('free'));
    }

    if (params.amenities && params.amenities.length > 0) {
      result = result.filter(h => 
        params.amenities!.every(reqAmenity => 
          h.amenities.some(a => a.toLowerCase().includes(reqAmenity.toLowerCase()))
        )
      );
    }

    // Sorting
    switch (params.sortBy) {
      case 'price_low':
        result.sort((a, b) => a.basePricePerNightINR - b.basePricePerNightINR);
        break;
      case 'price_high':
        result.sort((a, b) => b.basePricePerNightINR - a.basePricePerNightINR);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'recommended':
      default:
        result.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
        break;
    }

    return result;
  }

  // --- BOOKINGS ---
  public createBooking(data: {
    user_id: string;
    user_name: string;
    user_email: string;
    user_phone: string;
    hotel_id: string;
    room_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    rooms: number;
    special_requests?: string;
    is_demo_booking?: boolean;
  }): DbBooking {
    const hotel = this.getHotelById(data.hotel_id);
    if (!hotel) throw new Error('Hotel not found.');

    const room = hotel.rooms.find(r => r.id === data.room_id) || hotel.rooms[0];
    if (!room) throw new Error('Room not found.');

    // Calculate dates and nights
    const inDate = new Date(data.check_in);
    const outDate = new Date(data.check_out);
    const diffTime = outDate.getTime() - inDate.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const baseAmount = room.pricePerNightINR * nights * (data.rooms || 1);
    // GST standard in India: 12% for <= ₹7500, 18% for > ₹7500
    const gstRate = room.pricePerNightINR > 7500 ? 0.18 : 0.12;
    const taxAmount = Math.round(baseAmount * gstRate);
    const totalAmount = baseAmount + taxAmount;

    const bookingId = `IN-BK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const isDemo = Boolean(data.is_demo_booking);

    const booking: DbBooking = {
      booking_id: bookingId,
      user_id: data.user_id,
      user_name: data.user_name,
      user_email: data.user_email,
      user_phone: data.user_phone,
      hotel_id: hotel.id,
      hotel_name: hotel.name,
      hotel_address: hotel.address,
      hotel_image: hotel.images[0] || '',
      room_id: room.id,
      room_name: room.name,
      destination: hotel.destinationName,
      destination_state: hotel.state,
      check_in: data.check_in,
      check_out: data.check_out,
      nights,
      guests: data.guests || 2,
      rooms: data.rooms || 1,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: 'INR',
      payment_status: isDemo ? 'DEMO_UNPAID' : 'PENDING',
      booking_status: isDemo ? 'DEMO_UNCONFIRMED' : 'PENDING',
      special_requests: data.special_requests || '',
      is_demo_booking: isDemo,
      created_at: now,
      updated_at: now
    };

    this.schema.bookings.unshift(booking);
    this.persist();
    return booking;
  }

  public getBookingById(bookingId: string): DbBooking | undefined {
    return this.schema.bookings.find(b => b.booking_id === bookingId);
  }

  public getBookingsByUser(userId: string): DbBooking[] {
    return this.schema.bookings.filter(b => b.user_id === userId);
  }

  public getAllBookings(statusFilter?: string): DbBooking[] {
    if (!statusFilter || statusFilter === 'all') {
      return this.schema.bookings;
    }
    return this.schema.bookings.filter(b => 
      b.booking_status.toLowerCase() === statusFilter.toLowerCase() ||
      b.payment_status.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  public cancelBooking(bookingId: string, userId: string, reason?: string): DbBooking {
    const booking = this.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found.');

    const user = this.findUserById(userId);
    if (!user) throw new Error('Unauthorized');
    if (user.role !== 'admin' && booking.user_id !== userId) {
      throw new Error('Permission denied to cancel this booking.');
    }

    booking.booking_status = 'CANCELLED';
    booking.cancellation_reason = reason || 'Cancelled by traveler.';
    if (booking.payment_status === 'PAID') {
      booking.payment_status = 'REFUNDED';
    }
    booking.updated_at = new Date().toISOString();

    this.persist();
    return booking;
  }

  public updateBookingStatus(
    bookingId: string, 
    status: { booking_status?: BookingStatus; payment_status?: PaymentStatus; razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }
  ): DbBooking {
    const booking = this.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found.');

    if (status.booking_status) booking.booking_status = status.booking_status;
    if (status.payment_status) booking.payment_status = status.payment_status;
    if (status.razorpay_order_id) booking.razorpay_order_id = status.razorpay_order_id;
    if (status.razorpay_payment_id) booking.razorpay_payment_id = status.razorpay_payment_id;
    if (status.razorpay_signature) booking.razorpay_signature = status.razorpay_signature;
    booking.updated_at = new Date().toISOString();

    this.persist();
    return booking;
  }

  // --- PAYMENTS ---
  public createPaymentRecord(data: {
    booking_id: string;
    user_id: string;
    amount_inr: number;
    razorpay_order_id: string;
    is_demo?: boolean;
  }): DbPayment {
    const now = new Date().toISOString();
    const payment: DbPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      booking_id: data.booking_id,
      user_id: data.user_id,
      amount_inr: data.amount_inr,
      amount_paise: data.amount_inr * 100,
      currency: 'INR',
      status: 'PENDING',
      razorpay_order_id: data.razorpay_order_id,
      is_verified: false,
      is_demo: Boolean(data.is_demo),
      created_at: now
    };

    this.schema.payments.unshift(payment);
    this.persist();
    return payment;
  }

  public getPaymentByOrderId(orderId: string): DbPayment | undefined {
    return this.schema.payments.find(p => p.razorpay_order_id === orderId);
  }

  public getAllPayments(): DbPayment[] {
    return this.schema.payments;
  }

  public markPaymentVerified(params: {
    orderId: string;
    paymentId: string;
    signature: string;
    method?: string;
  }): DbPayment {
    const payment = this.getPaymentByOrderId(params.orderId);
    if (!payment) throw new Error('Payment record for order not found.');

    payment.status = 'PAID';
    payment.razorpay_payment_id = params.paymentId;
    payment.razorpay_signature = params.signature;
    payment.method = params.method || 'Razorpay Verified';
    payment.is_verified = true;
    payment.verified_at = new Date().toISOString();

    // Update corresponding booking
    const booking = this.getBookingById(payment.booking_id);
    if (booking) {
      booking.payment_status = 'PAID';
      booking.booking_status = 'CONFIRMED';
      booking.razorpay_order_id = params.orderId;
      booking.razorpay_payment_id = params.paymentId;
      booking.razorpay_signature = params.signature;
      booking.updated_at = new Date().toISOString();
    }

    this.persist();
    return payment;
  }

  public markPaymentFailed(orderId: string, errorCode: string, errorDesc: string): DbPayment | undefined {
    const payment = this.getPaymentByOrderId(orderId);
    if (payment) {
      payment.status = 'FAILED';
      payment.error_code = errorCode;
      payment.error_description = errorDesc;

      const booking = this.getBookingById(payment.booking_id);
      if (booking) {
        booking.payment_status = 'FAILED';
        booking.updated_at = new Date().toISOString();
      }

      this.persist();
    }
    return payment;
  }

  // --- ADMIN STATS ---
  public getAdminStats() {
    const totalUsers = this.schema.users.length;
    const totalBookings = this.schema.bookings.length;
    
    let successfulPayments = 0;
    let failedPayments = 0;
    let cancelledBookings = 0;
    let totalRevenueINR = 0;

    this.schema.bookings.forEach(b => {
      if (b.payment_status === 'PAID') {
        successfulPayments += 1;
        totalRevenueINR += b.total_amount;
      } else if (b.payment_status === 'FAILED') {
        failedPayments += 1;
      }

      if (b.booking_status === 'CANCELLED') {
        cancelledBookings += 1;
      }
    });

    // Destination booking popularity
    const destCounts = new Map<string, number>();
    this.schema.bookings.forEach(b => {
      destCounts.set(b.destination, (destCounts.get(b.destination) || 0) + 1);
    });

    const popularDestinations = Array.from(destCounts.entries())
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalUsers,
      totalBookings,
      successfulPayments,
      failedPayments,
      cancelledBookings,
      totalRevenueINR,
      popularDestinations,
      liveApiStatus: {
        razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
        googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
        openWeatherConfigured: Boolean(process.env.OPENWEATHER_API_KEY),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
      }
    };
  }

  // --- SAVED PLACES ---
  public toggleSavedPlace(userId: string, place: {
    type: 'destination' | 'hotel' | 'attraction' | 'food';
    item_id: string;
    title: string;
    subtitle: string;
    image_url: string;
    location: string;
  }): { saved: boolean; savedPlaces: DbSavedPlace[] } {
    const existingIndex = this.schema.saved_places.findIndex(
      p => p.user_id === userId && p.item_id === place.item_id
    );

    if (existingIndex >= 0) {
      this.schema.saved_places.splice(existingIndex, 1);
      this.persist();
      return { 
        saved: false, 
        savedPlaces: this.schema.saved_places.filter(p => p.user_id === userId) 
      };
    } else {
      const newPlace: DbSavedPlace = {
        id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        user_id: userId,
        type: place.type,
        item_id: place.item_id,
        title: place.title,
        subtitle: place.subtitle,
        image_url: place.image_url,
        location: place.location,
        saved_at: new Date().toISOString()
      };
      this.schema.saved_places.unshift(newPlace);
      this.persist();
      return { 
        saved: true, 
        savedPlaces: this.schema.saved_places.filter(p => p.user_id === userId) 
      };
    }
  }

  public getSavedPlacesByUser(userId: string): DbSavedPlace[] {
    return this.schema.saved_places.filter(p => p.user_id === userId);
  }
}

export const db = new DatabaseService();
