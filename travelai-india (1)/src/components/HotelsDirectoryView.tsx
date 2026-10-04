import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Destination, Hotel } from '../types';
import { 
  Hotel as HotelIcon, 
  MapPin, 
  Star, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';

interface HotelsDirectoryViewProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanTrip: (dest: Destination) => void;
}

export const HotelsDirectoryView: React.FC<HotelsDirectoryViewProps> = ({
  destinations,
  onSelectDestination,
  onPlanTrip
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Collect all real verified hotels from destination list
  const allHotels = useMemo(() => {
    const list: { hotel: Hotel; destination: Destination }[] = [];
    destinations.forEach((dest) => {
      if (dest.hotels && dest.hotels.length > 0) {
        dest.hotels.forEach((h) => {
          list.push({ hotel: h, destination: dest });
        });
      }
    });
    return list;
  }, [destinations]);

  const filteredHotels = useMemo(() => {
    return allHotels.filter(({ hotel, destination }) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination.state.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = 
        selectedCategory === 'all' || 
        (hotel.priceCategory && hotel.priceCategory.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [allHotels, searchQuery, selectedCategory]);

  return (
    <div className="py-24 sm:py-32 bg-[#060608] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.3em] text-amber-400 uppercase flex items-center gap-2">
              <HotelIcon className="w-3.5 h-3.5" />
              ROYAL SANCTUARIES & HERITAGE HAVENS
            </span>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              VERIFIED HOTELS ACROSS INDIA
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] font-light max-w-2xl">
              From 18th-century Rajputana palaces and floating marble retreats to Kerala backwater houseboats and luxury mountain lodges.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hotel name, city..."
              className="w-full pl-10 pr-4 py-3 bg-[#121216] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#A1A1AA] uppercase">Price Category:</span>
          {['all', 'Luxury', 'Mid-Range', 'Heritage'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-white/5 text-[#A1A1AA] hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map(({ hotel, destination }, idx) => (
            <motion.div
              key={`${hotel.id}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 6) * 0.05 }}
              className="rounded-2xl overflow-hidden bg-[#0D0D11] border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <img
                    src={hotel.imageUrl}
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
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-xs font-mono text-amber-300/80 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{destination.name}, {destination.state}</span>
                    </p>
                  </div>

                  <p className="text-xs text-[#A1A1AA] line-clamp-2 font-light leading-relaxed">
                    {hotel.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {hotel.amenities.slice(0, 3).map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-[#D4D4D8]"
                      >
                        ✦ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/5 mt-2 flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span className="text-[#71717A] text-[10px] block">FROM</span>
                  <span className="text-white font-bold text-sm">₹ {hotel.approxPricePerNightINR?.toLocaleString() || '14,000'}</span>
                  <span className="text-[#71717A] text-[10px]"> / night</span>
                </div>

                <button
                  onClick={() => onSelectDestination(destination)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  VIEW DESTINATION
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};
