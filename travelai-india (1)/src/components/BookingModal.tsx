import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hotel, HotelRoom, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Check, 
  Calendar, 
  Users, 
  Bed, 
  ShieldCheck, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Info,
  Clock,
  MapPin,
  Printer,
  Download
} from 'lucide-react';

interface BookingModalProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed?: (booking: Booking) => void;
  onOpenAuth?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  hotel,
  isOpen,
  onClose,
  onBookingConfirmed,
  onOpenAuth
}) => {
  const { user, token } = useAuth();

  // Booking Flow Steps: 1: Room, 2: Dates & Guests, 3: Guest Details, 4: Summary & Pay, 5: Confirmation
  const [step, setStep] = useState<number>(1);

  // Available Rooms from API or Hotel
  const [hotelDetails, setHotelDetails] = useState<any | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  // Dates & Guests
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultOut = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(defaultOut);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [roomsCount, setRoomsCount] = useState<number>(1);

  // Guest Details
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Payment & Booking State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      setGuestName(user.name);
      setGuestEmail(user.email);
      if (user.phone) setGuestPhone(user.phone);
    }
  }, [user]);

  // Load hotel rooms from backend
  useEffect(() => {
    if (hotel && isOpen) {
      setStep(1);
      setErrorMessage(null);
      setConfirmedBooking(null);
      setDemoNotice(null);

      fetch(`/api/hotels/${hotel.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.hotel) {
            setHotelDetails(data.hotel);
            if (data.hotel.rooms && data.hotel.rooms.length > 0) {
              setSelectedRoom(data.hotel.rooms[0]);
            }
          }
        })
        .catch(err => console.error('Failed to load full hotel rooms:', err));
    }
  }, [hotel, isOpen]);

  useEffect(() => {
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

  // Calculate duration and charges
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

  const roomRate = selectedRoom?.pricePerNightINR || hotel.pricePerNightINR || (hotel as any).basePricePerNightINR || (hotel as any).approxPricePerNightINR || 8500;
  const baseAmount = roomRate * nights * roomsCount;
  const gstRate = roomRate > 7500 ? 0.18 : 0.12;
  const taxAmount = Math.round(baseAmount * gstRate);
  const totalAmount = baseAmount + taxAmount;

  const handleDatesNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMessage('Check-out date must be after check-in date.');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleGuestDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMessage('Please fill in your name, email, and phone number.');
      return;
    }
    setErrorMessage(null);
    setStep(4);
  };

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Main Payment & Booking Execution
  const handleProceedPayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setDemoNotice(null);

    try {
      // 1. Create booking in backend
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hotel_id: hotel.id,
          room_id: selectedRoom?.id || '',
          check_in: checkIn,
          check_out: checkOut,
          guests: guestsCount,
          rooms: roomsCount,
          user_name: guestName,
          user_email: guestEmail,
          user_phone: guestPhone,
          special_requests: specialRequests,
          is_demo_booking: false
        })
      });

      if (!bookingRes.ok) {
        const bErr = await bookingRes.json();
        throw new Error(bErr.error || 'Failed to create booking reservation.');
      }

      const { booking } = await bookingRes.json();

      // 2. Initialize Razorpay order on server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          booking_id: booking.booking_id
        })
      });

      if (!orderRes.ok) {
        const oErr = await orderRes.json();
        throw new Error(oErr.error || 'Failed to initiate payment order.');
      }

      const orderData = await orderRes.json();

      // 3. Handle DEMO MODE vs REAL RAZORPAY
      if (orderData.isDemo) {
        // DEMO MODE - live credentials missing
        setDemoNotice(
          'DEMO MODE — LIVE BOOKING UNAVAILABLE. Razorpay API keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured. Under platform policy, simulated transactions cannot be claimed as PAID or CONFIRMED.'
        );

        // Verification call in Demo Mode (will return demo unverified status)
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            is_demo: true,
            booking_id: booking.booking_id
          })
        });

        const verifyData = await verifyRes.json();
        setConfirmedBooking({
          ...booking,
          payment_status: 'DEMO_UNPAID',
          booking_status: 'DEMO_UNCONFIRMED',
          is_demo_booking: true
        });
        setStep(5);
        return;
      }

      // 4. Live Razorpay Flow
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Could not load Razorpay payment SDK. Please check your internet connection.');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency || 'INR',
        name: 'TravelAI India',
        description: `Booking at ${hotel.name} (${nights} nights)`,
        image: hotel.imageUrl,
        order_id: orderData.orderId,
        prefill: {
          name: guestName,
          email: guestEmail,
          contact: guestPhone
        },
        theme: {
          color: '#F59E0B'
        },
        handler: async function (response: any) {
          // 5. Send signature and IDs to backend for verification
          try {
            const vRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: booking.booking_id,
                is_demo: false
              })
            });

            const vData = await vRes.json();
            if (vData.verified) {
              setConfirmedBooking(vData.booking);
              if (onBookingConfirmed) onBookingConfirmed(vData.booking);
              setStep(5);
            } else {
              setErrorMessage(vData.error || 'Payment signature verification failed on backend.');
            }
          } catch (vErr: any) {
            setErrorMessage('Network error while verifying payment with server.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setErrorMessage(resp.error?.description || 'Payment was declined or cancelled.');
      });
      rzp.open();

    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while processing reservation.');
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0D0D12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flow Stepper Indicator */}
          {step < 5 && (
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 text-xs font-mono">
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-[11px]">
                  {step}
                </span>
                <span className="uppercase tracking-widest font-bold">
                  {step === 1 && 'SELECT SANCTUARY ROOM'}
                  {step === 2 && 'TRAVEL DATES & OCCUPANCY'}
                  {step === 3 && 'GUEST INFORMATION'}
                  {step === 4 && 'CONFIRMATION & PAYMENT'}
                </span>
              </div>
              <span className="text-[#71717A] text-[11px]">STEP {step} OF 4</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: ROOM SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] font-mono flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{hotel.address}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">STARTING AT</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">
                    ₹{roomRate.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#71717A] font-mono"> / night</span>
                </div>
              </div>

              {/* Room Cards */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {(hotelDetails?.rooms || [
                  {
                    id: 'room_deluxe',
                    name: 'Deluxe Heritage Room',
                    description: 'Handcrafted furnishings, courtyard views, luxury bath amenities, and King bedding.',
                    maxGuests: 2,
                    bedType: '1 King Bed',
                    pricePerNightINR: hotel.pricePerNightINR || 8500,
                    availableRooms: 4,
                    cancellationPolicy: 'Free cancellation up to 48 hours before check-in.'
                  },
                  {
                    id: 'room_suite',
                    name: 'Royal Palace Suite',
                    description: 'Expansive private living salon, heritage arched balcony, and dedicated butler service.',
                    maxGuests: 3,
                    bedType: '1 Royal Master King + Lounge',
                    pricePerNightINR: Math.round((hotel.pricePerNightINR || 8500) * 1.6),
                    availableRooms: 2,
                    cancellationPolicy: 'Free cancellation up to 72 hours before check-in.'
                  }
                ]).map((room: any) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-400/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel text-base font-bold text-white">{room.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300">
                            {room.bedType}
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] font-light leading-relaxed max-w-md">
                          {room.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A]">
                          <span>Max {room.maxGuests} Guests</span>
                          <span>•</span>
                          <span className="text-emerald-400">{room.cancellationPolicy}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                        <div className="text-right">
                          <span className="text-base font-bold text-white font-mono">
                            ₹{(room.pricePerNightINR || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#71717A] font-mono block">/ night</span>
                        </div>
                        <div className={`mt-2 w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-amber-400 border-amber-400 text-black' : 'border-white/20'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  <span>CONTINUE TO DATES</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DATES & GUESTS */}
          {step === 2 && (
            <form onSubmit={handleDatesNext} className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-cinzel text-xl font-bold text-white uppercase">
                  RESERVATION SCHEDULE
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Selected: <strong className="text-white">{selectedRoom?.name || 'Deluxe Room'}</strong> at {hotel.name}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>CHECK-IN DATE</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>CHECK-OUT DATE</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={checkIn || todayStr}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>GUESTS</span>
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-[#121216] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults (2 Rooms Recommended)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-amber-400" />
                    <span>NUMBER OF ROOMS</span>
                  </label>
                  <select
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-[#121216] border border-white/10 rounded-xl text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>1 Room</option>
                    <option value={2}>2 Rooms</option>
                    <option value={3}>3 Rooms</option>
                  </select>
                </div>
              </div>

              {/* Nights calculation pill */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-[#A1A1AA]">DURATION:</span>
                <span className="text-amber-400 font-bold">{nights} NIGHT{nights > 1 ? 'S' : ''}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  <span>GUEST DETAILS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: GUEST INFORMATION */}
          {step === 3 && (
            <form onSubmit={handleGuestDetailsNext} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cinzel text-xl font-bold text-white uppercase">
                    PRIMARY GUEST DETAILS
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Your reservation voucher and check-in PIN will be sent to these contacts.
                  </p>
                </div>
                {!user && onOpenAuth && (
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="text-xs font-mono text-amber-400 hover:underline cursor-pointer"
                  >
                    Have an account? Sign In
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">
                    Full Legal Name (as per Govt. ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">
                      Mobile Number (with Country Code) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono tracking-widest text-[#A1A1AA] uppercase">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Quiet floor, early check-in request, anniversary arrival..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:border-amber-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  <span>REVIEW & PAY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUMMARY & PAYMENT (RAZORPAY) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-cinzel text-xl font-bold text-white uppercase">
                  BOOKING SUMMARY & VERIFICATION
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Review rates and authentic heritage booking details before checkout.
                </p>
              </div>

              {/* Order Breakdown Box */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-cinzel text-base font-bold text-white">{hotel.name}</h4>
                    <p className="text-xs font-mono text-amber-300">{selectedRoom?.name}</p>
                    <p className="text-[11px] text-[#A1A1AA] font-mono mt-1">
                      {checkIn} to {checkOut} ({nights} Night{nights > 1 ? 's' : ''}, {guestsCount} Guests, {roomsCount} Room)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] uppercase">
                    AVAILABLE
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-[#D4D4D8]">
                  <div className="flex justify-between">
                    <span>Base Room Rate ({nights} nights × {roomsCount} room):</span>
                    <span>₹{baseAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applicable GST Tax ({Math.round(gstRate * 100)}%):</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
                    <span>TOTAL AMOUNT PAYABLE:</span>
                    <span className="text-amber-400">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Live Razorpay Info */}
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/20 space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SECURE INDIAN PAYMENT GATEWAY (RAZORPAY)</span>
                </div>
                <p className="text-[#D4D4D8] text-[11px] font-light leading-relaxed">
                  Supports UPI (Google Pay, PhonePe, Paytm), All Major Debit & Credit Cards, Net Banking, and Wallets. Payments are verified via cryptographic server-side HMAC signatures.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProceedPayment}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-xl disabled:opacity-50 active:scale-95"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessing ? 'COMMUNICATING WITH RAZORPAY...' : `PAY ₹${totalAmount.toLocaleString()}`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: OFFICIAL CONFIRMATION RECEIPT */}
          {step === 5 && confirmedBooking && (
            <div className="space-y-6">
              {/* Demo Mode Notice if simulated */}
              {confirmedBooking.is_demo_booking && (
                <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>DEMO MODE — LIVE BOOKING UNAVAILABLE</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Live Razorpay credentials are not configured in environment variables. Under platform guidelines, this reservation was recorded as a simulated draft (Status: <strong>DEMO_UNCONFIRMED</strong>) and no real money was charged. Configure <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> to enable genuine booking confirmations.
                  </p>
                </div>
              )}

              {/* Verified Confirmation Banner */}
              {!confirmedBooking.is_demo_booking && (
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h3 className="font-cinzel text-2xl font-bold text-white uppercase">
                    RESERVATION CONFIRMED
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    Payment Verified by Backend Engine • Booking Reference Active
                  </p>
                </div>
              )}

              {/* Official Voucher Card */}
              <div id="booking-voucher" className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase block">BOOKING REFERENCE</span>
                    <span className="text-base font-bold text-amber-400 tracking-wider">
                      {confirmedBooking.booking_id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#71717A] uppercase block">STATUS</span>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      confirmedBooking.booking_status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {confirmedBooking.booking_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#71717A] text-[10px] block">PROPERTY</span>
                    <span className="text-white font-bold">{confirmedBooking.hotel_name}</span>
                    <span className="text-[#A1A1AA] text-[10px] block">{confirmedBooking.destination}, {confirmedBooking.destination_state}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] text-[10px] block">ACCOMMODATION</span>
                    <span className="text-white font-bold">{confirmedBooking.room_name}</span>
                    <span className="text-[#A1A1AA] text-[10px] block">{confirmedBooking.rooms} Room(s) • {confirmedBooking.guests} Guest(s)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[#71717A] text-[10px] block">CHECK-IN</span>
                    <span className="text-white font-bold">{confirmedBooking.check_in} (from 14:00)</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] text-[10px] block">CHECK-OUT</span>
                    <span className="text-white font-bold">{confirmedBooking.check_out} (until 11:00)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-white">
                  <span>AMOUNT PAID:</span>
                  <span className="font-bold text-amber-400 text-sm">₹{(confirmedBooking.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs cursor-pointer border border-white/10"
                >
                  <Printer className="w-4 h-4" />
                  <span>PRINT VOUCHER</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-widest transition-all cursor-pointer shadow-md text-center"
                >
                  DONE & VIEW DASHBOARD
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
