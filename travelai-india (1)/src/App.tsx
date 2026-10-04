import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { Destination, TripPlan, Hotel } from './types';
import { Navbar, NavTab } from './components/Navbar';
import { CinematicHero } from './components/CinematicHero';
import { FeaturedDestinations } from './components/FeaturedDestinations';
import { ScrollStorytelling } from './components/ScrollStorytelling';
import { CinematicCircuits } from './components/CinematicCircuits';
import { IndiaExplorer } from './components/IndiaExplorer';
import { DestinationDetails } from './components/DestinationDetails';
import { AITripPlanner } from './components/AITripPlanner';
import { HotelsExplorer } from './components/HotelsExplorer';
import { FoodDirectoryView } from './components/FoodDirectoryView';
import { SavedTripsView } from './components/SavedTripsView';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { BookingModal } from './components/BookingModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { DataVerificationModal } from './components/DataVerificationModal';
import { AIAdvisorDrawer } from './components/AIAdvisorDrawer';
import { VVTLogo } from './components/VVTLogo';
import { 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Compass, 
  Search, 
  Heart,
  ChevronUp
} from 'lucide-react';

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [plannerDestination, setPlannerDestination] = useState<Destination | null>(null);
  const [viewingPlan, setViewingPlan] = useState<TripPlan | null>(null);
  
  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState<boolean>(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  const handleOpenBooking = (hotel: Hotel) => {
    setBookingHotel(hotel);
    setIsBookingModalOpen(true);
  };

  // Saved Plans state in localStorage
  const [savedPlans, setSavedPlans] = useState<TripPlan[]>(() => {
    try {
      const stored = localStorage.getItem('travelai_india_saved_plans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 1. Initialize Lenis Smooth Scrolling Engine
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // 2. Global shortcut for Search Modal (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. Load Destinations from backend
  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true);
        const res = await fetch('/api/destinations');
        if (res.ok) {
          const data = await res.json();
          setDestinations(data.destinations || []);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  // Save to localStorage
  const handleSavePlan = (plan: TripPlan) => {
    setSavedPlans((prev) => {
      const exists = prev.some((p) => p.id === plan.id);
      let updated;
      if (exists) {
        updated = prev.filter((p) => p.id !== plan.id);
      } else {
        updated = [plan, ...prev];
      }
      localStorage.setItem('travelai_india_saved_plans', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemovePlan = (planId: string) => {
    setSavedPlans((prev) => {
      const updated = prev.filter((p) => p.id !== planId);
      localStorage.setItem('travelai_india_saved_plans', JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartPlanning = (destination: Destination) => {
    setViewingPlan(null);
    setPlannerDestination(destination);
    setSelectedDestination(null);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDestinationById = (id: string) => {
    const found = destinations.find(d => d.id.toLowerCase() === id.toLowerCase());
    if (found) {
      handleSelectDestination(found);
    } else {
      setIsSearchOpen(true);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060608] text-[#F4F4F5] flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Global Cinematic Glass Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'explore') setSelectedDestination(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        savedCount={savedPlans.length}
      />

      {/* Main Views with Smooth Transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: EXPLORE (HOME / LANDING / DETAILS) */}
          {activeTab === 'explore' && (
            <motion.div
              key="view-explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {selectedDestination ? (
                <DestinationDetails
                  destination={selectedDestination}
                  onBack={() => setSelectedDestination(null)}
                  onPlanTrip={handleStartPlanning}
                  onBookHotel={handleOpenBooking}
                />
              ) : (
                <div className="space-y-0 pb-20">
                  
                  {/* 1. CINEMATIC HERO: Full-screen video/image, EXPLORE INDIA, text reveal */}
                  <CinematicHero
                    destinations={destinations}
                    onOpenSearch={() => setIsSearchOpen(true)}
                    onOpenPlanner={() => {
                      setActiveTab('planner');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onOpenDestinations={() => {
                      const el = document.getElementById('explore-india');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onSelectDestinationById={handleSelectDestinationById}
                  />

                  {/* 2. FEATURED DESTINATIONS: Large animated editorial cards */}
                  <FeaturedDestinations
                    destinations={destinations}
                    onSelectDestination={handleSelectDestination}
                    onPlanTrip={handleStartPlanning}
                  />

                  {/* 3. SCROLL STORYTELLING: 01 DISCOVER, 02 EXPERIENCE, 03 STAY, 04 TASTE, 05 PLAN */}
                  <ScrollStorytelling
                    onOpenPlanner={() => {
                      setActiveTab('planner');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onOpenDestinations={() => {
                      const el = document.getElementById('explore-india');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    destinations={destinations}
                  />

                  {/* 4. CURATED SIGNATURE EXPEDITION CIRCUITS */}
                  <CinematicCircuits
                    destinations={destinations}
                    onSelectDestinationById={handleSelectDestinationById}
                    onPlanTripForDestination={handleStartPlanning}
                  />

                  {/* 5. INDIA DESTINATION EXPLORER: All 28 States & 8 UTs with region and theme filters */}
                  <IndiaExplorer
                    destinations={destinations}
                    onSelectDestination={handleSelectDestination}
                    onPlanTrip={handleStartPlanning}
                  />

                </div>
              )}
            </motion.div>
          )}

          {/* VIEW 2: DESTINATIONS CATALOG */}
          {activeTab === 'destinations' && (
            <motion.div
              key="view-destinations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pt-16"
            >
              <IndiaExplorer
                destinations={destinations}
                onSelectDestination={handleSelectDestination}
                onPlanTrip={handleStartPlanning}
              />
            </motion.div>
          )}

          {/* VIEW 3: HOTELS DIRECTORY */}
          {activeTab === 'hotels' && (
            <motion.div
              key="view-hotels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pt-16"
            >
              <HotelsExplorer
                onSelectHotelForBooking={handleOpenBooking}
              />
            </motion.div>
          )}

          {/* VIEW 4: FOOD & CULINARY DIRECTORY */}
          {activeTab === 'food' && (
            <motion.div
              key="view-food"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <FoodDirectoryView
                destinations={destinations}
                onSelectDestination={handleSelectDestination}
                onPlanTrip={handleStartPlanning}
              />
            </motion.div>
          )}

          {/* VIEW 5: AI TRIP PLANNER */}
          {activeTab === 'planner' && (
            <motion.div
              key="view-planner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pt-16"
            >
              <AITripPlanner
                destinations={destinations}
                initialDestination={plannerDestination}
                initialPlan={viewingPlan}
                onSavePlan={handleSavePlan}
                savedPlanIds={savedPlans.map(p => p.id)}
              />
            </motion.div>
          )}

          {/* VIEW 6: SAVED TRIPS & USER EXPEDITIONS */}
          {activeTab === 'saved' && (
            <motion.div
              key="view-saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pt-20"
            >
              <UserDashboard
                onOpenHotelBooking={handleOpenBooking}
              />
              <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 border-t border-white/10 mt-12 pb-12">
                <h3 className="font-cinzel text-xl font-bold text-white mb-6 uppercase">SAVED AI ITINERARIES</h3>
                <SavedTripsView
                  savedPlans={savedPlans}
                  onRemovePlan={handleRemovePlan}
                  onOpenPlan={(plan) => {
                    setViewingPlan(plan);
                    setActiveTab('planner');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onPlanNewTrip={() => {
                    setViewingPlan(null);
                    setPlannerDestination(null);
                    setActiveTab('planner');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onStartNewPlan={() => {
                    setViewingPlan(null);
                    setPlannerDestination(null);
                    setActiveTab('planner');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* VIEW 8: ADMIN OPERATIONS CONSOLE */}
          {activeTab === 'admin' && (
            <motion.div
              key="view-admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pt-20"
            >
              <AdminDashboard />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <BookingModal
        hotel={bookingHotel}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingHotel(null);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onBookingConfirmed={() => {
          setActiveTab('saved');
        }}
      />

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        destinations={destinations}
        onSelectDestination={handleSelectDestination}
      />

      <DataVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
      />

      <AIAdvisorDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        destinations={destinations}
        onSelectDestination={handleSelectDestination}
      />

      {/* Cinematic Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#040406] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <VVTLogo
                size="md"
                onClick={() => { setActiveTab('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
              <p className="text-xs text-[#A1A1AA] max-w-md font-light leading-relaxed">
                Cinematic exploration engine across India's 28 States & 8 Union Territories. Synthesizing Archaeological Survey of India monuments, certified palace stays, and centuries-old culinary lineages.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% REAL & VERIFIED AUTHORITY RECORDS</span>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <span className="text-white font-bold tracking-widest uppercase block">EXPEDITIONS</span>
              <ul className="space-y-2 text-[#A1A1AA]">
                <li><button onClick={() => { setActiveTab('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 cursor-pointer">Explore India</button></li>
                <li><button onClick={() => { setActiveTab('destinations'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 cursor-pointer">States & UT Directory</button></li>
                <li><button onClick={() => { setActiveTab('hotels'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 cursor-pointer">Palaces & Stays</button></li>
                <li><button onClick={() => { setActiveTab('food'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 cursor-pointer">Culinary Lineage</button></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <span className="text-white font-bold tracking-widest uppercase block">INTELLIGENCE</span>
              <ul className="space-y-2 text-[#A1A1AA]">
                <li><button onClick={() => { setActiveTab('planner'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-amber-400 cursor-pointer">Gemini Trip Architect</button></li>
                <li><button onClick={() => setIsAdvisorOpen(true)} className="hover:text-amber-400 cursor-pointer">AI Travel Advisor</button></li>
                <li><button onClick={() => setIsVerificationOpen(true)} className="hover:text-amber-400 cursor-pointer">ASI Authority Proof</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#71717A]">
            <span>© {new Date().getFullYear()} VPT • AI TRIP PLANNER. NO PLAN? NO PROBLEM. WE'VE GOT YOU.</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              <span>BACK TO TOP</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
