import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Destination } from '../types';
import { ArrowUpRight, MapPin, Sparkles, Compass, ShieldCheck } from 'lucide-react';

interface FeaturedDestinationsProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanTrip: (dest: Destination) => void;
}

interface EditorialTagline {
  name: string;
  tagline: string;
  subtitle: string;
  badge: string;
}

const EDITORIAL_TAGLINES: Record<string, EditorialTagline> = {
  rajasthan: {
    name: 'RAJASTHAN',
    tagline: 'THE LAND OF ROYALS',
    subtitle: 'Golden sandstone fortresses, Mewari royal palaces, and timeless Thar desert sunsets.',
    badge: 'EXPEDITION 01'
  },
  goa: {
    name: 'GOA',
    tagline: 'WHERE THE SEA BEGINS',
    subtitle: 'Portuguese baroque chapels, golden Arabian Sea beaches, and spice plantation serenity.',
    badge: 'EXPEDITION 02'
  },
  kerala: {
    name: 'KERALA',
    tagline: 'GOD’S OWN COUNTRY',
    subtitle: 'Emerald backwaters, misty Western Ghat tea estates, and ancient Ayurvedic sanctuaries.',
    badge: 'EXPEDITION 03'
  },
  ladakh: {
    name: 'LADAKH',
    tagline: 'BEYOND THE MOUNTAINS',
    subtitle: 'Turquoise glacial lakes, thousand-year-old Gompas, and the world’s highest passes.',
    badge: 'EXPEDITION 04'
  },
  'tamil-nadu': {
    name: 'TAMIL NADU',
    tagline: 'TEMPLES, CULTURE & COASTLINES',
    subtitle: 'Towering Dravidian Gopurams, living Chola temples, and Bay of Bengal shores.',
    badge: 'EXPEDITION 05'
  },
  varanasi: {
    name: 'VARANASI',
    tagline: 'THE ETERNAL CITY OF LIGHT',
    subtitle: 'Sacred dawn boat rides, continuous Vedic chants, and evening Ganga Aarti fires.',
    badge: 'EXPEDITION 06'
  },
  karnataka: {
    name: 'HAMPI & KARNATAKA',
    tagline: 'THE LOST BOULDER EMPIRE',
    subtitle: 'Vijayanagara architectural mastery carved into surreal boulder landscapes.',
    badge: 'EXPEDITION 07'
  },
  himachal: {
    name: 'HIMACHAL PRADESH',
    tagline: 'VALLEY OF THE GODS',
    subtitle: 'Snowcapped Dhauladhar peaks, alpine cedar woods, and Tibetan Buddhist peace.',
    badge: 'EXPEDITION 08'
  }
};

export const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({
  destinations,
  onSelectDestination,
  onPlanTrip
}) => {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  // Pick top featured destinations dynamically from the real database
  const featuredList = React.useMemo(() => {
    if (!destinations.length) return [];
    
    // Curate iconic state anchors
    const keys = ['jaipur', 'udaipur', 'kerala-backwaters', 'leh-ladakh', 'goa', 'varanasi', 'madurai', 'hampi'];
    const matched: Destination[] = [];
    
    keys.forEach((key) => {
      const found = destinations.find((d) => 
        d.id.toLowerCase() === key || 
        d.id.toLowerCase().startsWith(key) ||
        d.name.toLowerCase().includes(key)
      );
      if (found && !matched.some(m => m.id === found.id)) {
        matched.push(found);
      }
    });

    // Fill with rest if needed
    destinations.forEach((d) => {
      if (matched.length < 6 && !matched.some(m => m.id === d.id)) {
        matched.push(d);
      }
    });

    return matched.slice(0, 6);
  }, [destinations]);

  return (
    <section className="relative py-20 sm:py-28 bg-[#060608] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.3em] text-amber-400 uppercase flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              CURATED EDITORIAL ARCHIVE
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase">
              FEATURED DESTINATIONS
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] font-light max-w-2xl leading-relaxed">
              Explore India's most iconic landscapes through cinematic photography, verified heritage monuments, and bespoke travel routes.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#A1A1AA]">
            <span>DYNAMIC REGISTRY</span>
            <span className="text-white/30">•</span>
            <span className="text-white">{featuredList.length} ICONIC HUBS</span>
          </div>
        </div>

        {/* 2–3 Large Cinematic Editorial Cards Grid on Desktop, Single on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredList.map((dest, index) => {
            const editorialInfo = EDITORIAL_TAGLINES[dest.id.toLowerCase()] || 
              EDITORIAL_TAGLINES[dest.state.toLowerCase()] || {
                name: dest.name.toUpperCase(),
                tagline: dest.tagline ? dest.tagline.toUpperCase() : `${dest.state.toUpperCase()} • BHARAT`,
                subtitle: dest.overview,
                badge: `EXPEDITION 0${index + 1}`
              };

            const isHovered = activeHoverId === dest.id;

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setActiveHoverId(dest.id)}
                onMouseLeave={() => setActiveHoverId(null)}
                className="group relative h-[480px] sm:h-[540px] rounded-2xl overflow-hidden bg-[#101014] border border-white/10 hover:border-amber-400/50 shadow-2xl transition-all duration-500 flex flex-col justify-between cursor-pointer select-none"
                onClick={() => onSelectDestination(dest)}
              >
                {/* Large Background Photography */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={dest.heroImageUrl || dest.featuredImage || 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80'}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 brightness-90 group-hover:brightness-100"
                  />
                  {/* Cinematic Darkness Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 group-hover:via-black/25 transition-all duration-500" />
                  <div className="absolute inset-0 bg-vignette" />
                </div>

                {/* Top Card Metadata & Badges */}
                <div className="relative z-10 p-6 sm:p-7 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-black/70 backdrop-blur-md border border-white/15 text-amber-400">
                      {editorialInfo.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#E4E4E7] font-mono pt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{dest.state}, {dest.region}</span>
                    </div>
                  </div>

                  {/* Arrow Action Icon that appears and transforms on hover */}
                  <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-amber-400 border border-white/20 group-hover:border-amber-400 text-white group-hover:text-black flex items-center justify-center transition-all duration-300 transform group-hover:rotate-45 shadow-lg">
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                {/* Bottom Card Content with Upward Floating Animation on Hover */}
                <div className="relative z-10 p-6 sm:p-7 space-y-3 transform transition-transform duration-500 group-hover:-translate-y-2">
                  
                  {/* Destination Big Title */}
                  <div className="space-y-1">
                    <h3 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wider text-white group-hover:text-amber-400 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-xs font-mono tracking-[0.2em] text-amber-300/90 uppercase font-semibold">
                      {editorialInfo.tagline}
                    </p>
                  </div>

                  {/* Destination Subtitle Description */}
                  <p className="text-xs text-[#D4D4D8] line-clamp-2 leading-relaxed font-light font-sans">
                    {dest.overview}
                  </p>

                  {/* Bottom Footer Details */}
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                    <span>{dest.idealDurationDays || 3} DAYS RECOMMENDED</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ASI VERIFIED
                    </span>
                  </div>

                  {/* One-Click Action Row */}
                  <div className="pt-2 grid grid-cols-2 gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDestination(dest);
                      }}
                      className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono uppercase tracking-wider transition-colors"
                    >
                      EXPLORE GUIDE
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanTrip(dest);
                      }}
                      className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[11px] font-mono uppercase tracking-wider transition-colors shadow-md"
                    >
                      AI ITINERARY
                    </button>
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
