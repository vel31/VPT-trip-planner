import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Compass, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck, 
  ArrowDown,
  ArrowRight,
  Play
} from 'lucide-react';
import { Destination } from '../types';
import { soundscapeEngine } from '../utils/audioSynth';

interface CinematicHeroProps {
  destinations: Destination[];
  onOpenSearch: () => void;
  onOpenPlanner: () => void;
  onOpenDestinations: () => void;
  onSelectDestinationById: (id: string) => void;
}

interface HeroSlide {
  id: string;
  destinationId: string;
  tagline: string;
  state: string;
  region: string;
  coordinates: string;
  imageUrl: string;
  quote: string;
}

const CINEMATIC_SLIDES: HeroSlide[] = [
  {
    id: 'rajasthan',
    destinationId: 'udaipur',
    tagline: 'THE LAND OF ROYALS & MARBLE LAKES',
    state: 'Rajasthan',
    region: 'Royal West',
    coordinates: '24.5854° N, 73.7125° E',
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=2400&q=90',
    quote: 'Floating palaces reflecting a thousand years of Mewari chivalry.'
  },
  {
    id: 'ladakh',
    destinationId: 'leh-ladakh',
    tagline: 'BEYOND THE HIMALAYAN MOUNTAINS',
    state: 'Ladakh (UT)',
    region: 'Himalayan North',
    coordinates: '34.1526° N, 77.5771° E',
    imageUrl: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=2400&q=90',
    quote: 'Turquoise glacial lakes and thousand-year-old Buddhist sanctuaries in the high clouds.'
  },
  {
    id: 'kerala',
    destinationId: 'kerala-backwaters',
    tagline: 'GOD’S OWN COUNTRY & EMERALD BACKWATERS',
    state: 'Kerala',
    region: 'South India',
    coordinates: '9.4981° N, 76.3388° E',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2400&q=90',
    quote: 'Slow-gliding heritage houseboats through quiet lagoons scented with cardamom.'
  },
  {
    id: 'varanasi',
    destinationId: 'varanasi',
    tagline: 'THE ETERNAL CITY OF LIGHT & SACRED GHATS',
    state: 'Uttar Pradesh',
    region: 'East India',
    coordinates: '25.3176° N, 82.9739° E',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=2400&q=90',
    quote: 'Dawn hymns echoing over sacred Ganga waters where time dissolved millennia ago.'
  },
  {
    id: 'hampi',
    destinationId: 'hampi',
    tagline: 'THE LOST BOULDER EMPIRE OF VIJAYANAGARA',
    state: 'Karnataka',
    region: 'South India',
    coordinates: '15.3350° N, 76.4600° E',
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f443b7ec?auto=format&fit=crop&w=2400&q=90',
    quote: 'Monolithic granite chariots standing witness to centuries of architectural perfection.'
  }
];

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  destinations,
  onOpenSearch,
  onOpenPlanner,
  onOpenDestinations,
  onSelectDestinationById
}) => {
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const currentSlide = CINEMATIC_SLIDES[slideIndex];

  // Auto slide advance every 7.5s unless hovered/paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % CINEMATIC_SLIDES.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const toggleSoundscape = () => {
    if (!isPlayingAudio) {
      soundscapeEngine.start();
      setIsPlayingAudio(true);
    } else {
      soundscapeEngine.stop();
      setIsPlayingAudio(false);
    }
  };

  const handleScrollDown = () => {
    window.scrollTo({
      top: window.innerHeight * 0.95,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* 1. Large Background Image with Subtle Scale Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.tagline}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-75"
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. Cinematic Gradient & Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-black/40 to-black/70 pointer-events-none" />
      <div className="absolute inset-0 bg-vignette pointer-events-none" />

      {/* 3. Editorial Coordinates & HUD Top Right */}
      <div className="absolute top-24 sm:top-28 right-4 sm:right-8 z-20 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#D4D4D8]">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>{currentSlide.state}</span>
          <span className="text-white/30">•</span>
          <span className="text-[#A1A1AA]">{currentSlide.coordinates}</span>
        </div>

        {/* Ambient Soundscape Toggle */}
        <button
          onClick={toggleSoundscape}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider border backdrop-blur-md transition-all cursor-pointer ${
            isPlayingAudio 
              ? 'bg-amber-400/20 text-amber-400 border-amber-400/40 shadow-lg shadow-amber-400/20' 
              : 'bg-black/60 text-[#D4D4D8] border-white/10 hover:text-white hover:border-white/30'
          }`}
          title="Toggle ambient Indian soundscape synth"
        >
          {isPlayingAudio ? <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-[#A1A1AA]" />}
          <span className="hidden md:inline">{isPlayingAudio ? 'SOUNDSCAPE ON' : 'ATMOSPHERE'}</span>
        </button>
      </div>

      {/* 4. Main Hero Typography & Call-To-Actions */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center space-y-6 pt-16">
        
        {/* VVT Brand Emblem & Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-mono tracking-[0.2em] uppercase shadow-xl"
        >
          <div className="w-5 h-5 rounded-md overflow-hidden bg-white/10 shrink-0 border border-white/20">
            <img 
              src="/vvt-logo.png" 
              alt="VPT Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <span className="font-bold text-amber-400">VPT</span>
          <span className="text-white/30">•</span>
          <span className="text-[#D4D4D8]">NO PLAN? NO PROBLEM. WE'VE GOT YOU</span>
        </motion.div>

        {/* Subtle Category Badge */}
        <motion.div
          key={`badge-${currentSlide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-mono tracking-[0.25em] uppercase"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentSlide.tagline}</span>
        </motion.div>

        {/* Main Bold Editorial Title: "EXPLORE INDIA" */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-[0.08em] text-white drop-shadow-2xl uppercase"
        >
          EXPLORE INDIA
        </motion.h1>

        {/* Subtitle: "Plan unforgettable journeys across India." */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-2xl md:text-3xl text-[#E4E4E7] font-light tracking-wide max-w-3xl font-serif-display italic drop-shadow-lg"
        >
          Plan unforgettable journeys across India.
        </motion.p>

        {/* Cinematic Sub-Quote */}
        <motion.p
          key={`quote-${currentSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xs sm:text-sm text-[#A1A1AA] font-mono tracking-wider max-w-xl hidden sm:block"
        >
          "{currentSlide.quote}"
        </motion.p>

        {/* Staggered Primary & Secondary Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto"
        >
          {/* Primary CTA: "PLAN YOUR JOURNEY" */}
          <button
            onClick={onOpenPlanner}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-amber-400 text-black font-bold text-xs sm:text-sm font-mono tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-black/80 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>PLAN YOUR JOURNEY</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary CTA: "EXPLORE DESTINATIONS" */}
          <button
            onClick={onOpenDestinations}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-black/60 hover:bg-white/15 text-white font-mono tracking-[0.2em] text-xs sm:text-sm uppercase border border-white/25 hover:border-white/50 backdrop-blur-md transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>EXPLORE DESTINATIONS</span>
          </button>
        </motion.div>

      </div>

      {/* 5. Slide Controls & Progress Dots Bottom Left */}
      <div className="absolute bottom-10 left-4 sm:left-8 z-20 flex items-center gap-3">
        <button
          onClick={() => setSlideIndex((prev) => (prev - 1 + CINEMATIC_SLIDES.length) % CINEMATIC_SLIDES.length)}
          className="w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {CINEMATIC_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setSlideIndex(idx)}
              className={`h-1.5 transition-all rounded-full cursor-pointer ${
                slideIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setSlideIndex((prev) => (prev + 1) % CINEMATIC_SLIDES.length)}
          className="w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Subtle Animated Scroll Indicator Bottom Center */}
      <div 
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer group"
      >
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#A1A1AA] uppercase group-hover:text-white transition-colors">
          SCROLL TO DISCOVER
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 rounded-full bg-amber-400" />
        </motion.div>
      </div>

      {/* 7. Authority Verification Watermark Bottom Right */}
      <div className="absolute bottom-10 right-4 sm:right-8 z-20 hidden md:flex items-center gap-2 text-[10px] font-mono text-[#A1A1AA] bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
        <span>140+ HUBS • ASI VERIFIED DATA</span>
      </div>

    </section>
  );
};
