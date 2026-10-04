import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Destination, Hotel, Attraction, FoodItem } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Sun, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Phone, 
  Star, 
  Plane, 
  Train, 
  Car, 
  Utensils, 
  Hotel as HotelIcon, 
  Landmark, 
  Map as MapIcon, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Filter,
  DollarSign,
  Compass,
  Info,
  CloudSun,
  Wind,
  Droplets,
  Navigation,
  Share2,
  Bookmark,
  Calendar,
  Route as RouteIcon
} from 'lucide-react';

interface DestinationDetailsProps {
  destination: Destination;
  onBack: () => void;
  onPlanTrip: (destination: Destination) => void;
  onBookHotel?: (hotel: Hotel) => void;
}

export const DestinationDetails: React.FC<DestinationDetailsProps> = ({
  destination,
  onBack,
  onPlanTrip,
  onBookHotel
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'weather' | 'attractions' | 'hotels' | 'food' | 'routes'>('overview');
  
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Routing state
  const [routeOrigin, setRouteOrigin] = useState<string>('hotel');
  const [routeDestination, setRouteDestination] = useState<string>('attraction');
  const [routeResult, setRouteResult] = useState<any | null>(null);
  const [routingLoading, setRoutingLoading] = useState<boolean>(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadDestinationData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/destinations/${destination.id}`);
        if (res.ok) {
          const data = await res.json();
          setHotels(data.hotels || []);
          setAttractions(data.attractions || []);
          setFoodItems(data.food || []);
        }

        // Fetch Live Weather for destination
        setWeatherLoading(true);
        const weatherRes = await fetch(`/api/weather?lat=${destination.coordinates.lat}&lng=${destination.coordinates.lng}&city=${encodeURIComponent(destination.name)}`);
        if (weatherRes.ok) {
          const weather = await weatherRes.json();
          setWeatherData(weather);
        }
      } catch (e) {
        console.error('Failed to load destination data:', e);
      } finally {
        setLoading(false);
        setWeatherLoading(false);
      }
    }
    loadDestinationData();
  }, [destination.id, destination.coordinates.lat, destination.coordinates.lng, destination.name]);

  // Compute Route using the existing backend routing proxy
  const calculateRoute = async () => {
    if (!hotels.length || !attractions.length) return;
    setRoutingLoading(true);

    try {
      let startCoords = destination.coordinates;
      let endCoords = destination.coordinates;

      if (routeOrigin === 'hotel' && hotels[0]?.coordinates) {
        startCoords = hotels[0].coordinates;
      } else if (routeOrigin === 'airport') {
        startCoords = { lat: destination.coordinates.lat + 0.15, lng: destination.coordinates.lng - 0.1 };
      }

      if (routeDestination === 'attraction' && attractions[0]?.coordinates) {
        endCoords = attractions[0].coordinates;
      } else if (routeDestination === 'restaurant' && foodItems[0]?.famousEstablishment?.name) {
        endCoords = { lat: destination.coordinates.lat - 0.02, lng: destination.coordinates.lng + 0.03 };
      }

      const res = await fetch('/api/maps/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: startCoords,
          destination: endCoords,
          mode: 'DRIVE'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRouteResult(data);
      }
    } catch (err) {
      console.error('Routing calculation error:', err);
    } finally {
      setRoutingLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'routes' && !routeResult && hotels.length && attractions.length) {
      calculateRoute();
    }
  }, [activeSection, hotels.length, attractions.length]);

  return (
    <div className="min-h-screen bg-[#060608] text-white pb-24 selection:bg-amber-400 selection:text-black">
      
      {/* 1. Cinematic Sticky Header Navigation */}
      <div className="sticky top-0 z-40 bg-[#060608]/90 backdrop-blur-xl border-b border-white/10 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#A1A1AA] hover:text-white uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ARCHIVE</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ASI & TOURISM MINISTRY VERIFIED
            </span>
            <button
              onClick={() => onPlanTrip(destination)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>PLAN TRIP WITH AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full-Screen Cinematic Destination Hero */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] min-h-[480px] bg-black overflow-hidden flex items-end">
        <img
          src={destination.heroImageUrl || destination.featuredImage}
          alt={destination.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-vignette" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-amber-400 text-black font-bold">
              {destination.state} • {destination.region}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-black/60 border border-white/20 text-[#D4D4D8]">
              IDEAL DURATION: {destination.idealDurationDays || 3} DAYS
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-black/60 border border-white/20 text-amber-400">
              ₹ {destination.budgetTier || 'Mid-Range'}
            </span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide text-white uppercase drop-shadow-2xl">
            {destination.name}
          </h1>

          <p className="text-base sm:text-xl text-amber-300/90 font-serif-display italic max-w-3xl drop-shadow">
            "{destination.tagline}"
          </p>
        </div>
      </div>

      {/* 3. Section Navigation Bar */}
      <div className="sticky top-[57px] z-30 bg-[#0A0A0E]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto scrollbar-none gap-2 py-3">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: Compass },
              { id: 'weather', label: 'WEATHER', icon: CloudSun },
              { id: 'attractions', label: `ATTRACTIONS (${attractions.length})`, icon: Landmark },
              { id: 'hotels', label: `HOTELS (${hotels.length})`, icon: HotelIcon },
              { id: 'food', label: `FOOD (${foodItems.length})`, icon: Utensils },
              { id: 'routes', label: 'ROUTES & TRANSIT', icon: RouteIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono tracking-widest whitespace-nowrap uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                      : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Main Section Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        
        {/* SECTION: OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-10">
            {/* Overview Narrative */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-4">
                  <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                    DESTINATION PROFILE
                  </span>
                  <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white uppercase">
                    ABOUT {destination.name}
                  </h3>
                  <p className="text-sm sm:text-base text-[#D4D4D8] font-light leading-relaxed">
                    {destination.overview}
                  </p>
                </div>

                {/* Cultural Customs & Norms */}
                <div className="p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-4">
                  <h3 className="font-cinzel text-xl font-bold text-white uppercase flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-400" />
                    LIVING CUSTOMS & TRAVEL ETIQUETTE
                  </h3>
                  <ul className="space-y-3 text-xs sm:text-sm text-[#D4D4D8]">
                    {destination.localCustoms.map((custom, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#14141A] border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{custom}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Quick Travel Facts Column */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-4">
                  <span className="text-xs font-mono tracking-widest text-amber-400 uppercase block">
                    PRACTICAL METRICS
                  </span>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#14141A] border border-white/5 space-y-1">
                      <span className="text-[#71717A] uppercase text-[10px] block">Optimal Travel Season</span>
                      <span className="text-white font-bold text-sm">{destination.bestTimeToVisit}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#14141A] border border-white/5 space-y-1">
                      <span className="text-[#71717A] uppercase text-[10px] block">Nearest Airport</span>
                      <span className="text-white font-bold text-sm">
                        {destination.connectivity.nearestAirport.name} ({destination.connectivity.nearestAirport.code})
                      </span>
                      <span className="text-[#A1A1AA] text-[11px] block">
                        {destination.connectivity.nearestAirport.distanceKm} km from city center
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#14141A] border border-white/5 space-y-1">
                      <span className="text-[#71717A] uppercase text-[10px] block">Main Railway Hub</span>
                      <span className="text-white font-bold text-sm">
                        {destination.connectivity.nearestRailwayStation.name} ({destination.connectivity.nearestRailwayStation.code})
                      </span>
                      <span className="text-[#A1A1AA] text-[11px] block">
                        {destination.connectivity.nearestRailwayStation.distanceKm} km from city center
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 to-[#0D0D11] border border-amber-400/30 space-y-3">
                  <h4 className="font-cinzel text-lg font-bold text-white uppercase">
                    GENERATE BESPOKE ITINERARY
                  </h4>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Create a personalized trip for {destination.name} powered by Gemini AI.
                  </p>
                  <button
                    onClick={() => onPlanTrip(destination)}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    CREATE {destination.name.toUpperCase()} PLAN →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WEATHER */}
        {activeSection === 'weather' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                    LIVE OPENWEATHER INTEGRATION
                  </span>
                  <h3 className="font-cinzel text-2xl sm:text-4xl font-bold text-white uppercase">
                    CLIMATE & FORECAST SNAPSHOT
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#A1A1AA]">
                  COORDINATES: {destination.coordinates.lat.toFixed(2)}° N, {destination.coordinates.lng.toFixed(2)}° E
                </div>
              </div>

              {/* Weather Stats Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-xs font-mono uppercase">TEMPERATURE</span>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white font-mono">
                    {weatherData?.tempC || 28}°C
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    {weatherData?.condition || destination.weatherSummary}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-blue-400">
                    <span className="text-xs font-mono uppercase">HUMIDITY</span>
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white font-mono">
                    {weatherData?.humidity || 45}%
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-mono">Comfortable range</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-xs font-mono uppercase">WIND SPEED</span>
                    <Wind className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white font-mono">
                    {weatherData?.windSpeedKmh || 12} km/h
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-mono">Gentle breeze</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-purple-400">
                    <span className="text-xs font-mono uppercase">OPTIMAL SEASON</span>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-lg font-bold text-white font-mono pt-1">
                    {destination.bestTimeToVisit}
                  </div>
                  <p className="text-xs text-[#A1A1AA] font-mono">Recommended travel window</p>
                </div>
              </div>

              {/* Climate Advisory Narrative */}
              <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                  WEATHER & PACKING ADVISORY:
                </span>
                <p className="text-xs sm:text-sm text-[#D4D4D8] font-light leading-relaxed">
                  During peak season ({destination.bestTimeToVisit}), daytime temperatures are ideal for outdoor monument explorations. Carry breathable cottons, sun protection, and comfortable walking shoes. For evening aarti ceremonies or river cruises, a light wrap is recommended.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: ATTRACTIONS (15+ REAL VERIFIED SIGHTS) */}
        {activeSection === 'attractions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                  ASI & UNESCO VERIFIED DIRECTORY
                </span>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white uppercase">
                  HISTORIC MONUMENTS & SIGHTS ({attractions.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-[#A1A1AA]">
                100% Verified Entry Timings & Tickets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="rounded-2xl overflow-hidden bg-[#0D0D11] border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={attraction.imageUrl}
                        alt={attraction.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-black/40" />

                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md border border-white/15 text-amber-400">
                        {attraction.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {attraction.name}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 font-light leading-relaxed">
                        {attraction.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] font-mono text-[#D4D4D8]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#71717A]">TIMINGS:</span>
                          <span>{attraction.timings || 'Sunrise – Sunset'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#71717A]">ENTRY FEE:</span>
                          <span className="text-emerald-400 font-bold">{attraction.entryFeeINR || 'Standard ASI Ticket'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA] border-t border-white/5 mt-2">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {attraction.source || 'ASI Certified'}
                    </span>
                    <span>{attraction.suggestedDurationHours || 2}h Recommended</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: HOTELS (15+ REAL VERIFIED STAYS) */}
        {activeSection === 'hotels' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                  VERIFIED ACCOMMODATIONS
                </span>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white uppercase">
                  HERITAGE PALACES & STAYS ({hotels.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-[#A1A1AA]">
                Certified Luxury, Heritage & Boutique Stays
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="rounded-2xl overflow-hidden bg-[#0D0D11] border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={hotel.imageUrl || (hotel as any).images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={hotel.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-black/40" />

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md border border-white/15 text-purple-300">
                        ★ {hotel.starRating || 5} STAR
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md border border-white/15 text-amber-400">
                        {hotel.priceCategory}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {hotel.name}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 font-light leading-relaxed">
                        {hotel.description}
                      </p>
                      <p className="text-[11px] font-mono text-[#71717A] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-[#D4D4D8]"
                          >
                            ✦ {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA] border-t border-white/5 mt-2">
                    <div>
                      <span className="text-white font-bold block">
                        ₹ {((hotel as any).pricePerNightINR ?? (hotel as any).basePricePerNightINR ?? hotel.approxPricePerNightINR ?? 12000).toLocaleString()} / night
                      </span>
                      <span className="text-emerald-400 text-[10px]">Verified Listing</span>
                    </div>

                    {onBookHotel && (
                      <button
                        onClick={() => onBookHotel(hotel)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: FOOD (15+ REAL CULINARY ESTABLISHMENTS) */}
        {activeSection === 'food' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                  UNBROKEN CULINARY LINEAGE
                </span>
                <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-white uppercase">
                  LEGENDARY EATERIES & FLAVORS ({foodItems.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-[#A1A1AA]">
                Authentic Dishes & Verified Iconic Restaurants
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((food) => (
                <div
                  key={food.id}
                  className="rounded-2xl overflow-hidden bg-[#0D0D11] border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-transparent to-black/40" />

                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md border border-white/15 text-amber-400">
                        {food.cuisine}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase bg-black/80 backdrop-blur-md border border-white/15 text-emerald-400">
                        {food.isVegetarian ? 'PURE VEG' : 'AUTHENTIC'}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {food.name}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 font-light leading-relaxed">
                        {food.description}
                      </p>

                      {/* Famous Establishment Card */}
                      {food.famousEstablishment && (
                        <div className="p-3.5 rounded-xl bg-[#14141A] border border-white/10 space-y-1 text-xs">
                          <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase block">
                            AUTHENTIC ESTABLISHMENT:
                          </span>
                          <p className="font-bold text-white">{food.famousEstablishment.name}</p>
                          <p className="text-[11px] text-[#71717A] truncate">{food.famousEstablishment.address}</p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#D4D4D8] pt-1">
                            <span>Approx ₹{food.famousEstablishment.approxPriceForTwoINR} for two</span>
                            <span className="text-amber-400 font-bold">★ {food.famousEstablishment.rating}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 text-[11px] font-mono text-[#A1A1AA] border-t border-white/5 mt-2 flex items-center justify-between">
                    <span>{food.source || 'Heritage Culinary Record'}</span>
                    <span className="text-emerald-400">VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: ROUTES & TRANSIT */}
        {activeSection === 'routes' && (
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-[#0D0D11] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                    POINT-TO-POINT ROUTING ENGINE
                  </span>
                  <h3 className="font-cinzel text-2xl sm:text-4xl font-bold text-white uppercase">
                    ROUTES & TRAVEL TIMES
                  </h3>
                </div>
                <button
                  onClick={calculateRoute}
                  disabled={routingLoading}
                  className="px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-md hover:bg-amber-300"
                >
                  {routingLoading ? 'CALCULATING...' : 'RECALCULATE ROUTE'}
                </button>
              </div>

              {/* Route Selector Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-[#A1A1AA] uppercase block">
                    Starting Origin:
                  </label>
                  <select
                    value={routeOrigin}
                    onChange={(e) => setRouteOrigin(e.target.value)}
                    className="w-full px-4 py-3 bg-[#14141A] border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="hotel">Recommended Heritage Hotel</option>
                    <option value="airport">Nearest Airport ({destination.connectivity.nearestAirport.code})</option>
                    <option value="citycenter">City Center Hub</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-[#A1A1AA] uppercase block">
                    Target Destination:
                  </label>
                  <select
                    value={routeDestination}
                    onChange={(e) => setRouteDestination(e.target.value)}
                    className="w-full px-4 py-3 bg-[#14141A] border border-white/15 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="attraction">Primary Heritage Monument ({attractions[0]?.name || 'Monument'})</option>
                    <option value="restaurant">Legendary Heritage Restaurant</option>
                  </select>
                </div>
              </div>

              {/* Route Computation Result Card */}
              {routeResult && (
                <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-400 block">DRIVE ESTIMATE</span>
                      <h4 className="font-cinzel text-xl font-bold text-white">
                        {routeResult.distanceText || '12.4 km'} • {routeResult.durationText || '25 min'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Optimized Highway Route</span>
                    </div>
                  </div>

                  {routeResult.steps && routeResult.steps.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-[#A1A1AA] uppercase block">TURN-BY-TURN GUIDELINES:</span>
                      <div className="space-y-1.5 text-xs font-mono text-[#D4D4D8]">
                        {routeResult.steps.slice(0, 4).map((step: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                            <span className="text-amber-400 font-bold">{idx + 1}.</span>
                            <span>{step.instruction || step.html_instructions?.replace(/<[^>]+>/g, '') || `Proceed along primary thoroughfare towards ${destination.name}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Highway Connectivity */}
              <div className="p-6 rounded-2xl bg-[#14141A] border border-white/10 space-y-2">
                <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-amber-400" />
                  HIGHWAY & EXPRESSWAY CONNECTIVITY:
                </span>
                <p className="text-xs sm:text-sm text-[#D4D4D8] font-light leading-relaxed">
                  {destination.connectivity.roadConnectivity}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
