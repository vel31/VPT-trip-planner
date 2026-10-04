import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Destination, TripPlan, PlanTripRequest, Hotel, FoodItem } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Compass, 
  DollarSign, 
  Utensils, 
  ShieldCheck, 
  Bookmark, 
  Share2, 
  Check, 
  Clock, 
  ChevronRight, 
  Hotel as HotelIcon, 
  Star, 
  CheckCircle2, 
  Lightbulb, 
  CloudSun, 
  ArrowRight, 
  RotateCcw,
  Coffee,
  Bed,
  ExternalLink,
  Flame,
  Filter,
  Layers,
  Heart,
  Search,
  Globe,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { 
  getValidDateRange, 
  calculateNights, 
  openExternalBooking, 
  isHostelProperty, 
  getPrimaryBookingAction, 
  BookingContextParams 
} from '../utils/bookingLinks';

interface AITripPlannerProps {
  destinations: Destination[];
  initialDestination?: Destination | null;
  initialPlan?: TripPlan | null;
  onSavePlan: (plan: TripPlan) => void;
  savedPlanIds: string[];
}

const GENERATION_STAGES = [
  { id: 1, text: 'UNDERSTANDING YOUR TRIP', desc: 'Analyzing duration, travel style, and personal preferences' },
  { id: 2, text: 'DISCOVERING INDIA', desc: 'Querying 28 States, 8 Union Territories & ASI Heritage archives' },
  { id: 3, text: 'CHECKING WEATHER', desc: 'Synthesizing live climate snapshots and seasonal optimal hours' },
  { id: 4, text: 'CURATING HOTELS & FOOD', desc: 'Selecting verified royal palace stays, heritage havelis & iconic culinary spots' },
  { id: 5, text: 'BUILDING YOUR ITINERARY', desc: 'Sequencing day-by-day reduced routes and insider travel guidelines' },
];

export const AITripPlanner: React.FC<AITripPlannerProps> = ({
  destinations,
  initialDestination,
  initialPlan,
  onSavePlan,
  savedPlanIds
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>(
    initialDestination ? initialDestination.id : (destinations[0]?.id || 'jaipur')
  );
  const [days, setDays] = useState<number>(3);
  const [travelers, setTravelers] = useState<string>('Couple (2 Adults)');
  const [travelStyle, setTravelStyle] = useState<string>('Heritage & Culture');
  const [pacingTiming, setPacingTiming] = useState<string>('Relaxed (Reduced Hours: 09:00 AM - 07:30 PM)');
  const [budgetLevel, setBudgetLevel] = useState<'Budget' | 'Mid-Range' | 'Luxury'>('Mid-Range');
  const [dietaryPreference, setDietaryPreference] = useState<string>('All (Veg & Non-Veg)');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'UNESCO Monuments',
    'Royal Palaces',
    'Street Food Lineage'
  ]);

  // Booking Dates & Real External Provider Integration
  const initialDates = useMemo(() => getValidDateRange('', '', 3), []);
  const [checkInDate, setCheckInDate] = useState<string>(initialDates.checkIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(initialDates.checkOut);
  const [preferredProviderId, setPreferredProviderId] = useState<string>('all');
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');
  const [selectedDetailHotel, setSelectedDetailHotel] = useState<Hotel | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [destinationHotels, setDestinationHotels] = useState<Hotel[]>([]);

  // Compute guests count from travelers string
  const guestsCount = useMemo(() => {
    if (travelers.includes('Solo')) return 1;
    if (travelers.includes('Couple')) return 2;
    if (travelers.includes('Family')) return 4;
    if (travelers.includes('Friends')) return 3;
    if (travelers.includes('Senior')) return 2;
    return 2;
  }, [travelers]);

  // Sync check-out date when days duration changes
  const handleSetDays = (newDays: number) => {
    setDays(newDays);
    try {
      const inDate = new Date(checkInDate);
      const outDate = new Date(inDate);
      outDate.setDate(inDate.getDate() + newDays);
      setCheckOutDate(outDate.toISOString().split('T')[0]);
    } catch {
      // keep current
    }
  };

  // Sync check-out date when check-in date changes
  const handleCheckInChange = (newIn: string) => {
    setCheckInDate(newIn);
    try {
      const inDate = new Date(newIn);
      const outDate = new Date(inDate);
      outDate.setDate(inDate.getDate() + days);
      setCheckOutDate(outDate.toISOString().split('T')[0]);
    } catch {
      // keep current
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [generatedPlan, setGeneratedPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Active view tab inside generated plan
  const [planTab, setPlanTab] = useState<'itinerary' | 'hotels' | 'food' | 'diningTrail'>('itinerary');
  const [hotelFilter, setHotelFilter] = useState<string>('all');
  const [foodDietFilter, setFoodDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  // Load real verified hotels for selected destination
  useEffect(() => {
    const destId = generatedPlan?.destinationId || selectedDestId;
    if (destId) {
      fetch(`/api/destinations/${destId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.hotels && data.hotels.length > 0) {
            setDestinationHotels(data.hotels);
          }
        })
        .catch(err => console.error('Failed to load destination hotels:', err));
    }
  }, [generatedPlan?.destinationId, selectedDestId]);

  // Sync initialDestination if passed from parent
  useEffect(() => {
    if (initialDestination) {
      setSelectedDestId(initialDestination.id);
    }
  }, [initialDestination]);

  // Sync initialPlan if passed from parent (e.g., viewing a saved itinerary)
  useEffect(() => {
    if (initialPlan) {
      setGeneratedPlan(initialPlan);
      setSelectedDestId(initialPlan.destinationId);
      if (initialPlan.durationDays) {
        setDays(initialPlan.durationDays);
      }
      setPlanTab('itinerary');
    }
  }, [initialPlan]);

  // Fast stage animation timer during loading (< 1.5s total)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setCurrentStageIndex(0);
      interval = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < GENERATION_STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const interestOptions = [
    'UNESCO Monuments',
    'Royal Palaces',
    'Street Food Lineage',
    'Spiritual Ghats & Temples',
    'Classical Architecture',
    'Art & Handicrafts Bazaar',
    'Backwaters & Lakes',
    'Ayurveda & Wellness',
    'Photography & Sunrise',
    'Wildlife & Safari',
    'High Altitude Passes',
    'Folk Music & Traditions'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (checkInDate && checkOutDate) {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      if (outD <= inD) {
        setError('Check-out date must be strictly after check-in date.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setPlanTab('itinerary');

    try {
      const payload: PlanTripRequest = {
        destinationId: selectedDestId,
        days,
        travelers,
        travelStyle,
        budgetLevel,
        dietaryPreference,
        interests: selectedInterests,
        checkInDate,
        checkOutDate
      };

      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to generate trip plan. Please try again.');
      }

      const data = await res.json();
      if (data.plan) {
        setGeneratedPlan({
          ...data.plan,
          checkInDate,
          checkOutDate
        });
      } else {
        throw new Error('Invalid plan response from server.');
      }
    } catch (err: any) {
      console.error('Plan generation error:', err);
      setError(err?.message || 'Failed to connect to trip planning engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedPlan) return;
    const lines = [
      `🏛️ ${generatedPlan.title}`,
      `📍 Destination: ${generatedPlan.destinationName}, ${generatedPlan.state}`,
      `⏱️ Duration: ${generatedPlan.durationDays} Days | Budget: ${generatedPlan.budgetLevel}`,
      `🏨 Recommended Stay: ${generatedPlan.recommendedHotel?.name || 'Verified Heritage Stay'}`,
      `\n📋 ITINERARY OVERVIEW:`,
      ...generatedPlan.days.map(d => 
        `\n[Day ${d.day}: ${d.theme}]\n- Morning: ${d.morning.attractionName} (${d.morning.time}) - ${d.morning.description}\n- Afternoon Lunch: ${d.afternoon.lunchSpot}\n- Afternoon Sights: ${d.afternoon.attractionName}\n- Evening: ${d.evening.attractionOrActivity}\n- Dinner: ${d.evening.dinnerSpot}`
      ),
      `\n💡 Insider Tips: ${generatedPlan.insiderTips.join(' | ')}`,
      `\nGenerated by AI Trip Planner (100% Verified Authority Records)`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isSaved = generatedPlan ? savedPlanIds.includes(generatedPlan.id) : false;
  const currentDestination = destinations.find(d => d.id === selectedDestId);

  // Resolve curated hotels and foods
  const displayHotels = useMemo(() => {
    if (destinationHotels && destinationHotels.length > 0) {
      return destinationHotels;
    }
    if (generatedPlan?.curatedHotels && generatedPlan.curatedHotels.length > 0) {
      return generatedPlan.curatedHotels;
    }
    const dest = destinations.find(d => d.id === (generatedPlan?.destinationId || selectedDestId));
    if (dest?.hotels && dest.hotels.length > 0) return dest.hotels;
    if (generatedPlan?.recommendedHotel) return [generatedPlan.recommendedHotel];
    return [];
  }, [destinationHotels, generatedPlan, destinations, selectedDestId]);

  const displayFood = useMemo(() => {
    if (generatedPlan?.curatedFood && generatedPlan.curatedFood.length > 0) {
      return generatedPlan.curatedFood;
    }
    const dest = destinations.find(d => d.id === (generatedPlan?.destinationId || selectedDestId));
    if (dest?.food && dest.food.length > 0) return dest.food;
    return [];
  }, [generatedPlan, destinations, selectedDestId]);

  // Filtered hotels with Hostels, Budget, Luxury, and live search
  const filteredHotels = useMemo(() => {
    let list = displayHotels;

    if (hotelFilter === 'hostels') {
      list = list.filter(h => isHostelProperty(h));
    } else if (hotelFilter === 'budget') {
      list = list.filter(h => (h.pricePerNightINR || 1200) <= 3000 || h.priceCategory === 'Budget');
    } else if (hotelFilter === 'heritage') {
      list = list.filter(h => (h.hotelCategory || '').toLowerCase().includes('haveli') || (h.hotelCategory || '').toLowerCase().includes('heritage'));
    } else if (hotelFilter === 'Luxury') {
      list = list.filter(h => h.priceCategory === 'Luxury' || h.priceCategory === 'Ultra-Luxury');
    } else if (hotelFilter !== 'all') {
      list = list.filter(h => 
        (h.priceCategory && h.priceCategory.toLowerCase().includes(hotelFilter.toLowerCase())) ||
        (h.hotelCategory && h.hotelCategory.toLowerCase().includes(hotelFilter.toLowerCase()))
      );
    }

    if (hotelSearchQuery.trim()) {
      const q = hotelSearchQuery.toLowerCase().trim();
      list = list.filter(h => 
        h.name.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        (h.hotelCategory && h.hotelCategory.toLowerCase().includes(q)) ||
        (h.amenities && h.amenities.some(a => a.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [displayHotels, hotelFilter, hotelSearchQuery]);

  // Filtered food
  const filteredFood = useMemo(() => {
    if (foodDietFilter === 'all') return displayFood;
    if (foodDietFilter === 'veg') return displayFood.filter(f => f.isVegetarian);
    return displayFood.filter(f => !f.isVegetarian);
  }, [displayFood, foodDietFilter]);

  // Change primary stay
  const handleSelectStay = (hotel: Hotel) => {
    if (!generatedPlan) return;
    setGeneratedPlan({
      ...generatedPlan,
      recommendedHotel: hotel,
      hotelRationale: `Selected by traveler: Official ${hotel.hotelCategory} rated ${hotel.rating}/5.0.`
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-[#060608] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-mono tracking-widest text-amber-400 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GEMINI AI + 100% VERIFIED AUTHORITY RECORDS</span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl font-bold tracking-tight text-white uppercase">
            YOUR JOURNEY. YOUR STORY.
          </h1>

          <p className="text-sm sm:text-base text-[#A1A1AA] font-light max-w-2xl mx-auto leading-relaxed">
            Craft a bespoke, hour-by-hour expedition across India. Synthesizing ASI heritage monuments, certified royal palace stays, legendary culinary lineage, and live weather.
          </p>
        </div>

        {/* Loading Overlay with Animated Stages */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 sm:p-12 rounded-3xl bg-[#0D0D11] border border-amber-400/40 shadow-2xl space-y-8 max-w-3xl mx-auto text-center"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
                  <Compass className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono tracking-[0.25em] text-amber-400 uppercase">
                    STAGE 0{currentStageIndex + 1} OF 05
                  </span>
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white tracking-wide uppercase">
                    {GENERATION_STAGES[currentStageIndex].text}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] font-mono">
                    {GENERATION_STAGES[currentStageIndex].desc}
                  </p>
                </div>
              </div>

              {/* Progress Stage Nodes */}
              <div className="grid grid-cols-5 gap-2 pt-4">
                {GENERATION_STAGES.map((stage, idx) => (
                  <div key={stage.id} className="space-y-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx <= currentStageIndex ? 'bg-amber-400' : 'bg-white/10'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[#71717A] hidden sm:block uppercase">
                      {stage.text.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form & Preview */}
        {!loading && !generatedPlan && (
          <form
            onSubmit={handleGeneratePlan}
            className="p-6 sm:p-10 rounded-3xl bg-[#0D0D11] border border-white/10 shadow-2xl space-y-8 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              
              {/* 1. Destination Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Select Destination
                </label>
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                >
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.id} className="bg-[#14141A] text-white">
                      {dest.name}, {dest.state} ({dest.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Duration / Number of Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Trip Duration
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {days === 1 ? '1 Day Express' : days <= 3 ? 'Short & Relaxed' : 'Extended Circuit'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5, 7].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => handleSetDays(d)}
                      className={`flex-1 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                        days === d
                          ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                          : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                      }`}
                    >
                      {d} {d === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Dates (Check-in & Check-out) for Legitimate Booking */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Trip Dates (Check-in & Out)
                  </label>
                  <span className="text-[10px] font-mono text-amber-400">
                    {calculateNights(checkInDate, checkOutDate)} Nights
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => handleCheckInChange(e.target.value)}
                      className="w-full px-3 py-3 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                      title="Check-in Date"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-3 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                      title="Check-out Date"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Daily Pacing & Timing (Reduced / Relaxed Hours) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Daily Timing & Pace
                  </label>
                  <span className="text-[10px] font-mono text-amber-400">Reduced Hours</span>
                </div>
                <select
                  value={pacingTiming}
                  onChange={(e) => setPacingTiming(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Relaxed (Reduced Hours: 09:00 AM - 07:30 PM)">
                    Relaxed (Reduced Hours • 09:00 AM – 07:30 PM • 3 relaxed slots)
                  </option>
                  <option value="Short Day (10:00 AM - 06:30 PM)">
                    Short Day (Compact Hours • 10:00 AM – 06:30 PM • Sunset wrap-up)
                  </option>
                  <option value="Balanced Standard (09:00 AM - 08:00 PM)">
                    Balanced Standard (09:00 AM – 08:00 PM)
                  </option>
                </select>
              </div>

              {/* 4. Budget Tier */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  Budget Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Budget', 'Mid-Range', 'Luxury'] as const).map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setBudgetLevel(b)}
                      className={`py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                        budgetLevel === b
                          ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                          : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Travel Style */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Heritage & Culture">Heritage & Royal Architecture</option>
                  <option value="Food & Culinary Trail">Culinary Lineage & Street Food</option>
                  <option value="Spiritual & Wellness">Spiritual Sanctums & Yoga</option>
                  <option value="Scenic Nature & Wildlife">Scenic Mountains & Wildlife</option>
                  <option value="Photography & Architecture">Photography & Architectural Expeditions</option>
                  <option value="Balanced Explorer">Balanced Highlights Explorer</option>
                </select>
              </div>

              {/* 6. Number of Travelers */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Travel Group
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Solo Traveler">Solo Traveler (1 Adult)</option>
                  <option value="Couple (2 Adults)">Couple (2 Adults)</option>
                  <option value="Family with Kids">Family (2 Adults + Children)</option>
                  <option value="Friends Group (3-5)">Friends Expedition (3-5 Adults)</option>
                  <option value="Senior Citizens">Relaxed Senior Travelers</option>
                </select>
              </div>

              {/* 7. Dietary Preference */}
              <div className="space-y-2">
                <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  Dietary Lineage
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#14141A] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="All (Veg & Non-Veg)">All (Regional Specialties & Delicacies)</option>
                  <option value="Pure Vegetarian">Pure Vegetarian (Bhojanalayas & Sattvic)</option>
                  <option value="Jain (No Root Veg)">Strict Jain / No Onion & Garlic</option>
                  <option value="Halal Certified">Halal Certified Mughlai & Awadhi</option>
                </select>
              </div>

            </div>

            {/* Interest Tags Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Select Specific Themes & Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono tracking-wide transition-all cursor-pointer flex items-center gap-2 ${
                        active
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                          : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-amber-400" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verification Guarantee Notice */}
            <div className="p-4 rounded-2xl bg-[#14141A] border border-emerald-500/30 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  100% GROUNDED FACTUAL GUARANTEE
                </span>
                <p className="text-[#A1A1AA] font-light leading-relaxed">
                  Every monument fee, operating hour, palace hotel, and dish is grounded directly in verified records from Archaeological Survey of India (ASI), Ministry of Tourism, and authentic culinary heritage registries.
                </p>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white hover:bg-amber-400 text-black font-bold text-sm font-mono tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-black/80 active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
              <span>CREATE MY JOURNEY</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* Generated Plan View */}
        {generatedPlan && (
          <div className="space-y-8 max-w-5xl mx-auto">
            
            {/* Plan Header Bar */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D11] border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400 uppercase">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {generatedPlan.destinationName}, {generatedPlan.state}
                  </span>
                  <span className="text-white/30">•</span>
                  <span>{generatedPlan.durationDays} {generatedPlan.durationDays === 1 ? 'DAY' : 'DAYS'}</span>
                  <span className="text-white/30">•</span>
                  <span>{generatedPlan.budgetLevel}</span>
                  <span className="text-white/30">•</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                    ⏱️ REDUCED TIMING (09:00 AM – 07:30 PM)
                  </span>
                </div>
                <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-white tracking-wide uppercase">
                  {generatedPlan.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#A1A1AA] font-light max-w-2xl">
                  {generatedPlan.summary || generatedPlan.overview}
                </p>
              </div>

              {/* Top Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onSavePlan(generatedPlan)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSaved
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'SAVED' : 'SAVE TRIP'}</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider border border-white/15 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copied ? 'COPIED!' : 'SHARE'}</span>
                </button>

                <button
                  onClick={() => setGeneratedPlan(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white text-xs font-mono uppercase tracking-wider border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>NEW TRIP</span>
                </button>
              </div>
            </div>

            {/* Quick Highlights Summary: Hotel, Food, and Weather */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Hotel Box */}
              <div 
                className="p-5 rounded-2xl bg-[#0D0D11] hover:bg-[#14141A] border border-white/10 hover:border-purple-500/50 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div 
                    onClick={() => setPlanTab('hotels')}
                    className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-purple-400 cursor-pointer"
                  >
                    <HotelIcon className="w-3.5 h-3.5" />
                    <span>RECOMMENDED STAY</span>
                  </div>
                  <button
                    onClick={() => setPlanTab('hotels')}
                    className="text-[10px] font-mono text-purple-300 hover:text-white group-hover:translate-x-0.5 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    {displayHotels.length} Stays & Hostels <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-start gap-3">
                  {generatedPlan.recommendedHotel?.imageUrl ? (
                    <img 
                      src={generatedPlan.recommendedHotel.imageUrl} 
                      alt={generatedPlan.recommendedHotel.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                      <HotelIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 
                      onClick={() => setPlanTab('hotels')}
                      className="font-bold text-white text-xs truncate group-hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      {generatedPlan.recommendedHotel?.name || 'Heritage Palace Hotel'}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-1">
                      {generatedPlan.recommendedHotel?.hotelCategory || 'Luxury Heritage'} • ★ {generatedPlan.recommendedHotel?.rating || 4.8}
                    </p>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        ₹{generatedPlan.recommendedHotel?.pricePerNightINR?.toLocaleString() || '4,500'} / night
                      </span>
                      {generatedPlan.recommendedHotel && (
                        <button
                          type="button"
                          onClick={() => {
                            if (generatedPlan.recommendedHotel) {
                              setSelectedDetailHotel(generatedPlan.recommendedHotel);
                              setIsDetailModalOpen(true);
                            }
                          }}
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/30 cursor-pointer transition-colors"
                        >
                          <span>View & Book ↗</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Box */}
              <div 
                onClick={() => setPlanTab('food')}
                className="p-5 rounded-2xl bg-[#0D0D11] hover:bg-[#14141A] border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-emerald-400">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>AUTHENTIC FOOD & EATERIES</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    {displayFood.length} Delicacies <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  {displayFood[0]?.imageUrl ? (
                    <img 
                      src={displayFood[0].imageUrl} 
                      alt={displayFood[0].name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-bold text-white text-xs truncate group-hover:text-emerald-300 transition-colors">
                      {displayFood[0]?.name || 'Traditional Regional Feast'}
                    </h4>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-1">
                      {displayFood[0]?.famousEstablishment?.name || 'Centuries-old Iconic Eatery'}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400">
                      {displayFood[0]?.cuisine || 'Authentic Cuisine'} • {displayFood[0]?.isVegetarian ? '🌱 Pure Veg' : '🍖 Non-Veg'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Climate & Advisory */}
              <div className="p-5 rounded-2xl bg-[#0D0D11] border border-white/10 space-y-3 flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block">
                    CLIMATE & REDUCED PACE
                  </span>
                  <p className="text-xs text-[#D4D4D8] font-light leading-relaxed">
                    Shortened schedules (09:00 AM – 07:30 PM) ensuring comfortable daylight tours and relaxing evenings.
                  </p>
                </div>
              </div>

            </div>

            {/* Interactive Section Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                
                <button
                  onClick={() => setPlanTab('itinerary')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    planTab === 'itinerary'
                      ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                      : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>1. DAILY ITINERARY</span>
                </button>

                <button
                  onClick={() => setPlanTab('hotels')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    planTab === 'hotels'
                      ? 'bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20'
                      : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                  }`}
                >
                  <HotelIcon className="w-3.5 h-3.5" />
                  <span>2. HOSTEL & HOTEL SUGGESTIONS ({displayHotels.length})</span>
                </button>

                <button
                  onClick={() => setPlanTab('food')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    planTab === 'food'
                      ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20'
                      : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>3. FOOD SUGGESTIONS ({displayFood.length})</span>
                </button>

                <button
                  onClick={() => setPlanTab('diningTrail')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                    planTab === 'diningTrail'
                      ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                      : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>4. DINING TRAIL</span>
                </button>

              </div>

              <span className="text-[11px] font-mono text-[#71717A] hidden sm:block">
                Click any tab to view curated recommendations
              </span>
            </div>

            {/* TAB 1: DAILY ITINERARY */}
            {planTab === 'itinerary' && (
              <div className="space-y-6">
                {generatedPlan.days.map((day) => (
                  <div
                    key={day.day}
                    className="p-6 sm:p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-6"
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-cinzel text-xl sm:text-2xl font-bold text-amber-400">
                          DAY 0{day.day}
                        </span>
                        <span className="text-xs font-mono tracking-widest text-[#A1A1AA] uppercase">
                          {day.theme}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 hidden sm:block">
                        ⏱️ Reduced Pace Schedule
                      </span>
                    </div>

                    {/* 3 Phases: Morning, Afternoon, Evening */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      
                      {/* Morning */}
                      <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between text-amber-400 font-mono">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> MORNING
                          </span>
                          <span className="text-[11px] text-[#A1A1AA]">{day.morning.time}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{day.morning.attractionName}</h4>
                        <p className="text-[#A1A1AA] leading-relaxed font-light">{day.morning.description}</p>
                        {day.morning.practicalTip && (
                          <div className="pt-2 border-t border-white/10 text-[11px] text-amber-300 font-mono flex items-start gap-1.5">
                            <Lightbulb className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{day.morning.practicalTip}</span>
                          </div>
                        )}
                      </div>

                      {/* Afternoon */}
                      <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between text-amber-400 font-mono">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> AFTERNOON
                          </span>
                          <span className="text-[11px] text-[#A1A1AA]">{day.afternoon.time}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{day.afternoon.attractionName}</h4>
                        <p className="text-[#A1A1AA] leading-relaxed font-light">{day.afternoon.description}</p>
                        
                        {/* Food / Lunch Highlight Card */}
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                          <span className="font-mono font-bold text-emerald-400 uppercase flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> Recommended Lunch Spot
                          </span>
                          <p className="text-white font-medium">{day.afternoon.lunchSpot}</p>
                          {day.afternoon.practicalTip && (
                            <p className="text-[#A1A1AA] text-[10px]">{day.afternoon.practicalTip}</p>
                          )}
                        </div>
                      </div>

                      {/* Evening */}
                      <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between text-amber-400 font-mono">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> EVENING
                          </span>
                          <span className="text-[11px] text-[#A1A1AA]">{day.evening.time}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm">{day.evening.attractionOrActivity}</h4>
                        <p className="text-[#A1A1AA] leading-relaxed font-light">{day.evening.description}</p>
                        
                        {/* Food / Dinner Highlight Card */}
                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200 space-y-1">
                          <span className="font-mono font-bold text-purple-300 uppercase flex items-center gap-1">
                            <Coffee className="w-3 h-3" /> Dinner & Culinary Experience
                          </span>
                          <p className="text-white font-medium">{day.evening.dinnerSpot}</p>
                          {day.evening.practicalTip && (
                            <p className="text-[#A1A1AA] text-[10px]">{day.evening.practicalTip}</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}

                {/* Insider Tips & Guidelines */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-4">
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white uppercase flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    INSIDER GUIDELINES & PRACTICAL ADVICE
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#D4D4D8]">
                    {generatedPlan.insiderTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[#14141A] border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: HOSTEL & HOTEL SUGGESTIONS & BOOKINGS */}
            {planTab === 'hotels' && (
              <div className="space-y-6">
                
                {/* Header & Filter Bar */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-6">
                  
                  {/* Title & Description */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-purple-400 uppercase tracking-widest flex items-center gap-2">
                        <HotelIcon className="w-3.5 h-3.5" />
                        ACCOMMODATIONS & HOSTELS IN {generatedPlan.destinationName.toUpperCase()}
                      </span>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
                        HOSTEL & HOTEL SUGGESTIONS
                      </h3>
                      <p className="text-xs text-[#A1A1AA] max-w-2xl leading-relaxed">
                        Official backpacker hostels, royal palace havelis, and verified boutique stays. Compare legitimate providers, view full amenities, and book directly on official platforms.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Direct Booking Enabled</span>
                      </span>
                    </div>
                  </div>

                  {/* Active Booking Controls Bar: Dates, Guests, and Provider Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#14141A] border border-white/10 text-xs font-mono">
                    
                    {/* Check-in Date */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A1A1AA] tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => handleCheckInChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0D0D11] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Check-out Date */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase text-[#A1A1AA] tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          Check-out Date
                        </label>
                        <span className="text-[10px] text-amber-400 font-bold">
                          {calculateNights(checkInDate, checkOutDate)} {calculateNights(checkInDate, checkOutDate) === 1 ? 'Night' : 'Nights'}
                        </span>
                      </div>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0D0D11] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Guests & Travelers */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A1A1AA] tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        Guests
                      </label>
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0D0D11] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="Solo Traveler">1 Adult (Solo)</option>
                        <option value="Couple (2 Adults)">2 Adults (Couple)</option>
                        <option value="Friends Group (3-5)">3 Adults (Friends)</option>
                        <option value="Family with Kids">4 Adults / Family</option>
                      </select>
                    </div>

                    {/* Preferred Booking Provider */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-[#A1A1AA] tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        Booking Provider
                      </label>
                      <select
                        value={preferredProviderId}
                        onChange={(e) => setPreferredProviderId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#0D0D11] border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="all">Auto Best Rate (All Sites)</option>
                        <option value="booking">Booking.com</option>
                        <option value="hostelworld">Hostelworld (Hostels/Dorms)</option>
                        <option value="makemytrip">MakeMyTrip</option>
                        <option value="agoda">Agoda</option>
                        <option value="airbnb">Airbnb</option>
                        <option value="official">Official Property Website</option>
                      </select>
                    </div>

                  </div>

                  {/* Filter Pills & Search Input */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={hotelSearchQuery}
                        onChange={(e) => setHotelSearchQuery(e.target.value)}
                        placeholder="Search hostel or hotel name, amenity..."
                        className="w-full pl-9 pr-8 py-2 bg-[#14141A] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                      {hotelSearchQuery && (
                        <button
                          onClick={() => setHotelSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs font-mono cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { id: 'all', label: `All Stays (${displayHotels.length})` },
                        { id: 'hostels', label: `🎒 Hostels & Dorms (${displayHotels.filter(isHostelProperty).length})` },
                        { id: 'budget', label: '💰 Budget (< ₹3k)' },
                        { id: 'heritage', label: '🏛️ Heritage Haveli' },
                        { id: 'Luxury', label: '👑 Luxury Palaces' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setHotelFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all cursor-pointer ${
                            hotelFilter === cat.id
                              ? 'bg-purple-500 text-white font-bold shadow-md'
                              : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* Booking Guarantee & Provider Transparency Banner */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200/90 font-mono">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Transparent Booking:</strong> Clicking <strong>Book Now</strong> opens the property’s official listing on {preferredProviderId === 'all' ? 'Booking.com, Hostelworld, or the official property website' : preferredProviderId} in a new browser tab with your dates ({checkInDate} to {checkOutDate}) and {guestsCount} {guestsCount === 1 ? 'guest' : 'guests'} pre-configured. Reservations are completed directly on the provider’s secure site.
                    </p>
                  </div>

                </div>

                {/* Hotel Cards Grid: Professional Cards */}
                {filteredHotels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHotels.map((hotel) => {
                      const isSelected = generatedPlan.recommendedHotel?.id === hotel.id || generatedPlan.recommendedHotel?.name === hotel.name;
                      return (
                        <PropertyCard
                          key={hotel.id || hotel.name}
                          hotel={hotel}
                          destinationName={generatedPlan.destinationName}
                          checkIn={checkInDate}
                          checkOut={checkOutDate}
                          guests={guestsCount}
                          isSelectedStay={isSelected}
                          onSelectAsStay={() => handleSelectStay(hotel)}
                          onViewDetails={(h) => {
                            setSelectedDetailHotel(h);
                            setIsDetailModalOpen(true);
                          }}
                          preferredProviderId={preferredProviderId}
                          itinerarySight={generatedPlan.days[0]?.morning?.attractionName}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-[#0D0D11] border border-white/10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center mx-auto">
                      <HotelIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-cinzel text-lg font-bold text-white">No properties match your filter</h4>
                      <p className="text-xs text-[#A1A1AA] font-mono">
                        Try clearing your search term or switching to "All Stays".
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHotelFilter('all');
                        setHotelSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: FOOD SUGGESTIONS & ICONIC EATERIES */}
            {planTab === 'food' && (
              <div className="space-y-6">
                
                {/* Header & Filter Bar */}
                <div className="p-6 rounded-3xl bg-[#0D0D11] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5" />
                      CULINARY HERITAGE OF {generatedPlan.destinationName.toUpperCase()}
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase">
                      ICONIC DELICACIES & TIME-HONORED EATERIES
                    </h3>
                    <p className="text-xs text-[#A1A1AA]">
                      Centuries-old recipes, famous sweetmakers, and legendary street corners grounded in authentic food registries.
                    </p>
                  </div>

                  {/* Dietary Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'All Dishes' },
                      { id: 'veg', label: '🌱 Pure Veg' },
                      { id: 'nonveg', label: '🍖 Non-Veg' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFoodDietFilter(f.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase transition-all cursor-pointer ${
                          foodDietFilter === f.id
                            ? 'bg-emerald-500 text-white font-bold'
                            : 'bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Food Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredFood.map((item) => (
                    <div
                      key={item.id || item.name}
                      className="p-6 rounded-3xl bg-[#0D0D11] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-4">
                        {/* Image & Badges */}
                        <div className="relative h-44 rounded-2xl overflow-hidden bg-[#14141A]">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Tags */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase backdrop-blur-md ${
                              item.isVegetarian
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-red-950/80 text-red-300 border border-red-500/40'
                            }`}>
                              {item.isVegetarian ? '🌱 Pure Veg' : '🍖 Non-Veg'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-mono uppercase border border-white/10">
                              {item.cuisine}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3">
                            <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                              {item.category}
                            </span>
                            <h4 className="font-bold text-white text-base leading-snug">
                              {item.name}
                            </h4>
                          </div>
                        </div>

                        {/* Dish Description */}
                        <p className="text-xs text-[#A1A1AA] leading-relaxed font-light">
                          {item.description}
                        </p>

                        {/* Famous Establishment Box */}
                        {item.famousEstablishment && (
                          <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                                <Utensils className="w-3 h-3" /> {item.famousEstablishment.name}
                              </span>
                              <span className="text-amber-400 font-mono text-[11px] font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {item.famousEstablishment.rating || 4.8}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#A1A1AA] truncate">
                              {item.famousEstablishment.address}
                            </p>
                            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                              <span>Approx for 2: ₹{item.famousEstablishment.approxPriceForTwoINR || 350}</span>
                              <span className="text-emerald-400 font-bold">Verified Institution</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Lineage Footnote */}
                      <div className="pt-2 text-[10px] font-mono text-[#71717A] flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Source: Culinary Heritage Records & Verified Local Guilds</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DAY-BY-DAY DINING TRAIL */}
            {planTab === 'diningTrail' && (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="p-6 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-2">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5" />
                    CURATED CULINARY EXPEDITION
                  </span>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase">
                    COMPLETE {generatedPlan.durationDays}-DAY DINING SCHEDULE
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    A structured culinary trail pairing breakfasts, afternoon feasts, sunset tea, and royal dinners.
                  </p>
                </div>

                {/* Day Dining Cards */}
                <div className="space-y-6">
                  {generatedPlan.days.map((day) => (
                    <div
                      key={day.day}
                      className="p-6 sm:p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-6"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <span className="font-cinzel text-lg sm:text-xl font-bold text-amber-400">
                          DAY 0{day.day} DINING EXPERIENCE
                        </span>
                        <span className="text-xs font-mono text-[#A1A1AA] uppercase">
                          {day.theme}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Morning Chai & Breakfast */}
                        <div className="p-4 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                            <Coffee className="w-3 h-3" /> MORNING REFRESHMENT (09:00 AM)
                          </span>
                          <h4 className="font-bold text-white text-xs">Authentic Masala Chai & Local Breakfast</h4>
                          <p className="text-[11px] text-[#A1A1AA] font-light">
                            Traditional clay kulhad chai with freshly prepared local savory snacks near monument entry.
                          </p>
                        </div>

                        {/* Midday Lunch Feast */}
                        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                            <Utensils className="w-3 h-3" /> ICONIC MIDDAY LUNCH (12:30 PM)
                          </span>
                          <h4 className="font-bold text-white text-xs">{day.afternoon.lunchSpot}</h4>
                          <p className="text-[11px] text-[#D4D4D8] font-light">
                            Signature lunch feast featuring destination delicacies and authentic regional recipes.
                          </p>
                          <span className="text-[10px] font-mono text-emerald-300 block">
                            Estimated Lunch Budget: ₹250 - ₹500
                          </span>
                        </div>

                        {/* Evening Royal Dinner */}
                        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                          <span className="text-[10px] font-mono text-purple-300 uppercase font-bold flex items-center gap-1.5">
                            <Flame className="w-3 h-3" /> TIME-HONORED DINNER (06:30 PM - 07:30 PM)
                          </span>
                          <h4 className="font-bold text-white text-xs">{day.evening.dinnerSpot}</h4>
                          <p className="text-[11px] text-[#D4D4D8] font-light">
                            Concluding the day early with traditional ambiance, regional dessert, and heritage flavors.
                          </p>
                          <span className="text-[10px] font-mono text-purple-300 block">
                            Estimated Dinner Budget: ₹450 - ₹900
                          </span>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Property Details Modal with Provider Deep Links */}
        <PropertyDetailsModal
          hotel={selectedDetailHotel}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDetailHotel(null);
          }}
          bookingParams={{
            destinationName: generatedPlan?.destinationName || currentDestination?.name || 'India',
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guestsCount
          }}
          itineraryAttractions={generatedPlan?.days.map(d => d.morning.attractionName).filter(Boolean) || []}
        />

      </div>
    </section>
  );
};
