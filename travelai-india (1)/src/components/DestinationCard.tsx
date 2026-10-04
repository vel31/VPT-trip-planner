import React from 'react';
import { motion } from 'motion/react';
import { Destination } from '../types';
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Calendar,
  Compass
} from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
  onPlanTrip: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
  onPlanTrip,
}) => {
  const formattedLat = destination.coordinates?.lat ? destination.coordinates.lat.toFixed(2) : '28.61';
  const formattedLng = destination.coordinates?.lng ? destination.coordinates.lng.toFixed(2) : '77.20';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(destination)}
      className="group relative bg-[#0D0D11] rounded-2xl border border-white/10 hover:border-amber-400/50 shadow-xl hover:shadow-2xl hover:shadow-black/90 transition-all duration-500 overflow-hidden flex flex-col justify-between cursor-pointer select-none"
    >
      {/* Top Media & Widescreen Cinematic Photography */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
          <img
            src={destination.heroImageUrl || destination.featuredImage || 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80'}
            alt={destination.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D11] via-[#0D0D11]/30 to-black/50" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/80 text-amber-400 backdrop-blur-md border border-white/15 flex items-center gap-1 shadow-sm">
              <MapPin className="w-3 h-3 text-amber-400" />
              {destination.state}
            </span>
            <span className="px-2 py-1 rounded-md text-[9px] font-mono text-[#D4D4D8] bg-black/70 backdrop-blur-md border border-white/10">
              {destination.region}
            </span>
          </div>

          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md border ${
              destination.budgetTier === 'Luxury'
                ? 'bg-purple-950/80 text-purple-200 border-purple-500/40'
                : destination.budgetTier === 'Mid-Range'
                ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                : 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40'
            }`}>
              ₹ {destination.budgetTier || 'Verified'}
            </span>
          </div>

          {/* Coordinates HUD overlay on image */}
          <div className="absolute bottom-2 right-3 font-mono text-[9px] text-[#A1A1AA] bg-black/60 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-sm">
            {formattedLat}° N, {formattedLng}° E
          </div>

          {/* Bottom Title with Hover Color Change */}
          <div className="absolute bottom-3 left-3 right-3 text-white pr-10">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold tracking-wider text-white drop-shadow-md group-hover:text-amber-400 transition-colors">
              {destination.name}
            </h3>
            <p className="text-xs text-[#D4D4D8] line-clamp-1 font-serif-display italic font-light drop-shadow">
              {destination.tagline}
            </p>
          </div>

          {/* Hover Arrow Icon */}
          <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/10 group-hover:bg-amber-400 text-white group-hover:text-black border border-white/20 group-hover:border-amber-400 flex items-center justify-center transition-all duration-300 transform group-hover:rotate-45">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed font-light font-sans">
            {destination.overview}
          </p>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-xl border border-white/5 font-mono">
            <div className="flex items-center gap-2 text-[#A1A1AA]">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[9px] uppercase text-[#71717A] block">Optimal Season</span>
                <span className="font-medium text-white text-[11px]">{destination.bestTimeToVisit}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#A1A1AA]">
              <Clock className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
              <div className="truncate">
                <span className="text-[9px] uppercase text-[#71717A] block">Duration</span>
                <span className="font-medium text-white text-[11px]">{destination.idealDurationDays || 3} Days</span>
              </div>
            </div>
          </div>

          {/* Highlights / Themes Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(destination.popularFor && destination.popularFor.length > 0 ? destination.popularFor : destination.idealFor || []).slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#D4D4D8] bg-white/5 border border-white/10"
              >
                ✦ {tag}
              </span>
            ))}
          </div>

          {/* Real Data Authority Verification Footnote */}
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] pt-2 border-t border-white/5 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {destination.source || 'ASI Certified'}
            </span>
            <span className="text-[#71717A] text-[10px]">VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(destination);
          }}
          className="w-full py-2 px-3 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>GUIDE</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlanTrip(destination);
          }}
          className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-black" />
          <span>AI PLAN</span>
        </button>
      </div>
    </motion.div>
  );
};
