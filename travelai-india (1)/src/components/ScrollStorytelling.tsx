import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Compass, 
  Landmark, 
  Hotel, 
  Utensils, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Destination } from '../types';

interface ScrollStorytellingProps {
  onOpenPlanner: () => void;
  onOpenDestinations: () => void;
  destinations: Destination[];
}

export const ScrollStorytelling: React.FC<ScrollStorytellingProps> = ({
  onOpenPlanner,
  onOpenDestinations,
  destinations
}) => {
  const storytellingChapters = [
    {
      step: '01',
      tag: 'DISCOVER',
      headline: 'THE SUBCONTINENT’S ETERNAL TAPESTRY',
      description: 'From the snowcapped peaks of the Karakoram and Ladakh down to the turquoise waters of the Indian Ocean, India spans 28 States and 8 Union Territories — each harboring distinct languages, architectural eras, and living traditions.',
      image: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1600&q=85',
      location: 'Kashmir to Kanyakumari',
      highlight: '140+ Authority Hubs Across India',
      stats: '28 States • 8 Union Territories • 3,800+ ASI Monuments'
    },
    {
      step: '02',
      tag: 'EXPERIENCE',
      headline: 'MILLENNIA OF ARCHITECTURAL SOVEREIGNTY',
      description: 'Step inside living UNESCO World Heritage monuments protected by the Archaeological Survey of India. Walk the carved granite courtyards of Vijayanagara, the sun-aligned chariot wheels of Konark, and the sandstone battlements of Mehrangarh.',
      image: 'https://images.unsplash.com/photo-1600100397608-f010f443b7ec?auto=format&fit=crop&w=1600&q=85',
      location: 'Hampi, Karnataka',
      highlight: 'Archaeological Survey of India Records',
      stats: '15+ Verified Attractions Per Destination'
    },
    {
      step: '03',
      tag: 'STAY',
      headline: 'ROYAL PALACES & SANCTUARY RETREATS',
      description: 'Rest in authentic royal heritage properties — from 18th-century Rajputana Havelis and floating white marble island palaces in Rajasthan to Kerala backwater kettuvallams and colonial tea bungalows high in the Nilgiris.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
      location: 'Udaipur, Rajasthan',
      highlight: 'Certified Heritage Stays & Luxury Havens',
      stats: 'Authentic Pricing, Star Ratings & Contact Records'
    },
    {
      step: '04',
      tag: 'TASTE',
      headline: 'AN UNBROKEN CULINARY HERITAGE',
      description: 'Savor centuries-old recipes perfected across generations. From Awadhi Dum Biryani cooked in sealed copper pots and Amritsari Kulchas baked in clay tandoors to Malabar fish curries simmered in coconut milk and clay earthen pots.',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1600&q=85',
      location: 'Old Delhi & Lucknow',
      highlight: 'Legendary Culinary Establishments',
      stats: 'Authentic Local Dishes & Must-Visit Heritage Eateries'
    },
    {
      step: '05',
      tag: 'PLAN',
      headline: 'AI ARCHITECT GROUNDED IN REAL DATA',
      description: 'Harness Google Gemini AI synchronized with our verified real-world database. Generate hour-by-hour itineraries with real opening hours, live weather forecasts, verified hotels, and optimal driving routes.',
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=85',
      location: 'Taj Mahal, Agra',
      highlight: 'Intelligent Real-World Synthesis',
      stats: 'Zero Mock Placeholders • Real Distance & Weather'
    }
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#060608] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* Section Lead */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-mono tracking-[0.3em] text-amber-400 uppercase">
            SCROLL STORYTELLING
          </span>
          <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
            THE FIVE PILLARS OF BHARAT
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] font-light">
            An editorial journey through discovery, heritage wonders, royal sanctuaries, culinary dynasties, and artificial intelligence.
          </p>
        </div>

        {/* Chapters */}
        <div className="space-y-32 sm:space-y-40">
          {storytellingChapters.map((chapter, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={chapter.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}
              >
                {/* Visual Imagery Container */}
                <div className="w-full lg:w-7/12 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#101014] border border-white/10 shadow-2xl group">
                  <img
                    src={chapter.image}
                    alt={chapter.headline}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Step Watermark Overlay */}
                  <div className="absolute top-4 left-4 font-cinzel text-4xl sm:text-6xl font-black text-white/20 select-none">
                    {chapter.step}
                  </div>

                  {/* Location Pin */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-mono text-[#E4E4E7]">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{chapter.location}</span>
                  </div>

                  {/* Highlight pill */}
                  <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/90 text-black text-xs font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{chapter.highlight}</span>
                  </div>
                </div>

                {/* Text Story Block */}
                <div className="w-full lg:w-5/12 space-y-6">
                  
                  {/* Step & Tag */}
                  <div className="flex items-center gap-3">
                    <span className="font-cinzel text-2xl sm:text-3xl font-black text-amber-400">
                      {chapter.step}
                    </span>
                    <span className="text-xs font-mono tracking-[0.3em] text-[#A1A1AA] uppercase border-l border-white/20 pl-3">
                      {chapter.tag}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="font-cinzel text-2xl sm:text-4xl font-bold tracking-wide text-white uppercase leading-tight">
                    {chapter.headline}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#D4D4D8] font-light leading-relaxed">
                    {chapter.description}
                  </p>

                  {/* Meta Stats Badge */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#A1A1AA] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{chapter.stats}</span>
                  </div>

                  {/* Action Link */}
                  {chapter.step === '05' ? (
                    <button
                      onClick={onOpenPlanner}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono tracking-widest uppercase transition-all shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer"
                    >
                      <span>LAUNCH AI PLANNER</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={onOpenDestinations}
                      className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 hover:text-white uppercase transition-colors group cursor-pointer"
                    >
                      <span>EXPLORE VERIFIED CATALOG</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
