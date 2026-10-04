import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Sparkles, 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Film,
  Flame,
  ChevronRight
} from 'lucide-react';
import { Destination } from '../types';

interface CinematicCircuitsProps {
  onSelectDestinationById: (id: string) => void;
  onPlanTripForDestination: (dest: Destination) => void;
  destinations: Destination[];
}

interface SignatureCircuit {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  duration: string;
  bestSeason: string;
  heroImage: string;
  routeStops: { name: string; id: string; state: string }[];
  description: string;
  filmQuote: string;
  tier: 'Luxury' | 'Heritage' | 'Adventure';
  badge: string;
}

const SIGNATURE_CIRCUITS: SignatureCircuit[] = [
  {
    id: 'rajputana',
    title: 'The Royal Rajputana Grandeur',
    subtitle: 'Golden Fortresses, Mewari Palaces & Sand Dunes',
    region: 'Royal Rajasthan',
    duration: '7–10 Days',
    bestSeason: 'Oct – Mar',
    heroImage: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=1200&q=80',
    routeStops: [
      { name: 'Delhi', id: 'delhi', state: 'Delhi NCR' },
      { name: 'Agra', id: 'agra', state: 'Uttar Pradesh' },
      { name: 'Jaipur', id: 'jaipur', state: 'Rajasthan' },
      { name: 'Udaipur', id: 'udaipur', state: 'Rajasthan' },
      { name: 'Jaisalmer', id: 'jaisalmer', state: 'Rajasthan' }
    ],
    description: 'Immerse in the timeless chivalry of Mewar, sunrise at the Taj Mahal, desert camel camps in Thar, and floating lake palaces.',
    filmQuote: 'Where royal heritage breathes in sandstone and starlight.',
    tier: 'Luxury',
    badge: 'EXPEDITION REEL #01'
  },
  {
    id: 'himalayan-odyssey',
    title: 'Himalayan High Passes & Trans-Tibet',
    subtitle: 'Pangong Tso, Khardung La & Ancient Monasteries',
    region: 'Ladakh & Spiti',
    duration: '8–12 Days',
    bestSeason: 'May – Sep',
    heroImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    routeStops: [
      { name: 'Leh Ladakh', id: 'leh-ladakh', state: 'Ladakh' },
      { name: 'Srinagar', id: 'srinagar', state: 'Jammu & Kashmir' },
      { name: 'Manali', id: 'manali', state: 'Himachal Pradesh' },
      { name: 'Dharamshala', id: 'dharamshala', state: 'Himachal Pradesh' }
    ],
    description: 'Traverse the highest motorable passes on earth, turquoise glacial lakes, ancient Tibetan gompas, and deep pine-forested valleys.',
    filmQuote: 'Above the clouds, where silence speaks in mountain echoes.',
    tier: 'Adventure',
    badge: 'EXPEDITION REEL #02'
  },
  {
    id: 'sacred-ganga',
    title: 'The Sacred Ganga & Enlightenment Trail',
    subtitle: 'Kashi Aarti, Bodhi Tree Sanctum & Nalanda Ruins',
    region: 'East & Central India',
    duration: '6–8 Days',
    bestSeason: 'Oct – Apr',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    routeStops: [
      { name: 'Varanasi', id: 'varanasi', state: 'Uttar Pradesh' },
      { name: 'Bodh Gaya', id: 'bodh-gaya', state: 'Bihar' },
      { name: 'Nalanda', id: 'nalanda', state: 'Bihar' },
      { name: 'Prayagraj', id: 'prayagraj', state: 'Uttar Pradesh' },
      { name: 'Khajuraho', id: 'khajuraho', state: 'Madhya Pradesh' }
    ],
    description: 'Experience mystical dawn boat rides across Varanasi’s Manikarnika, the Mahabodhi temple where Buddha attained nirvana, and world heritage temple carvings.',
    filmQuote: 'A spiritual pilgrimage through millennia of philosophy.',
    tier: 'Heritage',
    badge: 'EXPEDITION REEL #03'
  },
  {
    id: 'dravidian-spice',
    title: 'Dravidian Temples & Malabar Spice Coast',
    subtitle: 'Hampi Boulders, Madurai Gopurams & Backwaters',
    region: 'South India',
    duration: '7–9 Days',
    bestSeason: 'Sep – Mar',
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f443b7ec?auto=format&fit=crop&w=1200&q=80',
    routeStops: [
      { name: 'Hampi', id: 'hampi', state: 'Karnataka' },
      { name: 'Mysuru', id: 'mysuru', state: 'Karnataka' },
      { name: 'Madurai', id: 'madurai', state: 'Tamil Nadu' },
      { name: 'Kochi & Alleppey', id: 'alleppey-kochi', state: 'Kerala' },
      { name: 'Puducherry', id: 'puducherry', state: 'Puducherry' }
    ],
    description: 'Towering granite Gopurams, Vijayanagara ruins, fragrant cardamom plantations in the Western Ghats, and peaceful backwater cruises.',
    filmQuote: 'Where ancient granite architecture meets the Arabian sea.',
    tier: 'Heritage',
    badge: 'EXPEDITION REEL #04'
  },
  {
    id: 'pristine-northeast',
    title: 'Mystic Northeast & Living Roots',
    subtitle: 'Tawang Gompa, Kaziranga Rhinos & Living Bridges',
    region: 'North East India',
    duration: '7–10 Days',
    bestSeason: 'Oct – May',
    heroImage: 'https://images.unsplash.com/photo-1597040663342-45b6af2b7194?auto=format&fit=crop&w=1200&q=80',
    routeStops: [
      { name: 'Kaziranga', id: 'kaziranga', state: 'Assam' },
      { name: 'Shillong & Cherrapunji', id: 'shillong', state: 'Meghalaya' },
      { name: 'Tawang', id: 'tawang', state: 'Arunachal Pradesh' },
      { name: 'Majuli', id: 'majuli', state: 'Assam' }
    ],
    description: 'The world’s largest river island, prehistoric single-horned rhinoceros reserves, cloud-draped living root bridges, and high monastery peaks.',
    filmQuote: 'Untouched rainforests and dawn-lit mountain sanctuaries.',
    tier: 'Adventure',
    badge: 'EXPEDITION REEL #05'
  }
];

export const CinematicCircuits: React.FC<CinematicCircuitsProps> = ({
  onSelectDestinationById,
  onPlanTripForDestination,
  destinations
}) => {
  const [selectedCircuit, setSelectedCircuit] = useState<SignatureCircuit>(SIGNATURE_CIRCUITS[0]);

  const handleCircuitPlan = (circuit: SignatureCircuit) => {
    // Find first available destination in circuit
    const firstStop = circuit.routeStops[0];
    const match = destinations.find(d => d.id === firstStop.id || d.name.toLowerCase().includes(firstStop.name.toLowerCase()));
    if (match) {
      onPlanTripForDestination(match);
    }
  };

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#0A0A0C] text-[#F0F0F0] border-b border-[#222]/80">
      
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#EA580C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-mono tracking-widest uppercase bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
              <Film className="w-3.5 h-3.5" />
              <span>CURATED CINEMATIC REELS</span>
            </div>
            <h2 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Signature Travel Circuits of Bharat
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] font-light leading-relaxed">
              Explore interconnected routes combining UNESCO monuments, royal palace stays, scenic train passes, and authentic culinary stops.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#64748B]">5 MASTER CIRCUITS • ASI VERIFIED</span>
          </div>
        </div>

        {/* Interactive Circuit Showcase Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Circuit Selector Tabs (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {SIGNATURE_CIRCUITS.map((circuit, idx) => {
              const isSelected = circuit.id === selectedCircuit.id;
              return (
                <motion.div
                  key={circuit.id}
                  onClick={() => setSelectedCircuit(circuit)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                    isSelected
                      ? 'bg-[#141418] border-[#F59E0B] shadow-xl shadow-black/60 text-white ring-1 ring-[#F59E0B]/50'
                      : 'bg-[#0E0E12] border-white/10 hover:border-white/20 text-[#94A3B8] hover:bg-[#121216]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wider text-[#F59E0B] font-bold">
                      {circuit.badge}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#CBD5E1]">
                      {circuit.duration}
                    </span>
                  </div>

                  <h3 className="font-serif-display text-lg sm:text-xl font-bold text-white leading-snug">
                    {circuit.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] line-clamp-1 italic font-light">
                    {circuit.filmQuote}
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-[11px] text-[#A0A5AE] border-t border-white/5">
                    <MapPin className="w-3 h-3 text-[#F59E0B]" />
                    <span className="truncate">{circuit.routeStops.map(s => s.name).join(' → ')}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Active Circuit Cinema Display (7 Cols) */}
          <div className="lg:col-span-7 bg-[#121216] rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col justify-between relative group">
            
            {/* Top Widescreen Image Banner */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-black">
              <img
                src={selectedCircuit.heroImage}
                alt={selectedCircuit.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/40 to-black/60" />

              {/* Badges on Top */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/70 text-[#F59E0B] border border-white/20 backdrop-blur-md">
                  {selectedCircuit.region}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F59E0B] text-black shadow-md">
                  {selectedCircuit.tier} Tier
                </span>
              </div>

              {/* Floating Quote Bottom */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs sm:text-sm font-mono tracking-widest text-[#F59E0B] uppercase font-bold">
                  {selectedCircuit.badge}
                </p>
                <h4 className="font-serif-display text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
                  {selectedCircuit.title}
                </h4>
              </div>
            </div>

            {/* Circuit Details Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <p className="text-sm sm:text-base text-[#CBD5E1] leading-relaxed font-light">
                {selectedCircuit.description}
              </p>

              {/* Key Circuit Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Estimated Pace</span>
                  <span className="font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    {selectedCircuit.duration}
                  </span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Optimal Season</span>
                  <span className="font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                    {selectedCircuit.bestSeason}
                  </span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Stops Verified</span>
                  <span className="font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedCircuit.routeStops.length} Hubs (ASI)
                  </span>
                </div>
              </div>

              {/* Route Itinerary Sequence */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-[#94A3B8] block">Circuit Stop Sequence:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCircuit.routeStops.map((stop, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectDestinationById(stop.id)}
                      className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-[#F59E0B]/20 border border-white/15 hover:border-[#F59E0B]/50 text-xs font-medium text-[#F0F0F0] hover:text-[#F59E0B] transition-all flex items-center gap-1.5 cursor-pointer"
                      title={`Explore ${stop.name} Guide`}
                    >
                      <span className="text-[10px] font-mono text-[#F59E0B] font-bold">0{idx + 1}</span>
                      <span>{stop.name}</span>
                      <span className="text-[10px] text-[#64748B]">({stop.state})</span>
                      <ArrowUpRight className="w-3 h-3 text-[#94A3B8]" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => handleCircuitPlan(selectedCircuit)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#EA580C] text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Generate Full AI Itinerary for this Circuit</span>
                </button>

                <button
                  onClick={() => onSelectDestinationById(selectedCircuit.routeStops[0].id)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-black/60 hover:bg-black text-[#CBD5E1] hover:text-white border border-white/20 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Explore Primary Hub ({selectedCircuit.routeStops[0].name})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
