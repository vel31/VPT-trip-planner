import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Destination } from '../types';
import { DestinationCard } from './DestinationCard';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Sparkles, 
  Film, 
  Layers, 
  RotateCcw,
  Compass
} from 'lucide-react';

interface IndiaExplorerProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanTrip: (dest: Destination) => void;
}

export const IndiaExplorer: React.FC<IndiaExplorerProps> = ({
  destinations,
  onSelectDestination,
  onPlanTrip
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const regionsList = [
    { id: 'all', label: 'All India (28 States & 8 UTs)' },
    { id: 'North', label: 'North India' },
    { id: 'South', label: 'South India' },
    { id: 'East', label: 'East India' },
    { id: 'West', label: 'West India' },
    { id: 'Central', label: 'Central India' },
    { id: 'North East', label: 'North-East India' },
    { id: 'ut', label: 'Union Territories' }
  ];

  // Dynamic filter across all destinations
  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      // Region / UT match
      const matchesRegion = 
        selectedRegion === 'all' || 
        (selectedRegion === 'ut' ? Boolean(d.unionTerritory) : d.region.toLowerCase().includes(selectedRegion.toLowerCase()));

      // Budget tier match
      const matchesBudget = 
        selectedBudget === 'all' || 
        (d.budgetTier && d.budgetTier.toLowerCase() === selectedBudget.toLowerCase());

      // Theme / Category match
      const matchesTheme = 
        selectedTheme === 'all' || 
        (d.idealFor && d.idealFor.some(t => t.toLowerCase().includes(selectedTheme.toLowerCase()))) || 
        (d.categories && d.categories.some(c => c.toLowerCase().includes(selectedTheme.toLowerCase())));

      // Search Query
      const matchesQuery = 
        !searchQuery.trim() || 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.popularFor && d.popularFor.some(p => p.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesRegion && matchesBudget && matchesTheme && matchesQuery;
    });
  }, [destinations, selectedRegion, selectedBudget, selectedTheme, searchQuery]);

  const resetFilters = () => {
    setSelectedRegion('all');
    setSelectedBudget('all');
    setSelectedTheme('all');
    setSearchQuery('');
  };

  const isFiltered = selectedRegion !== 'all' || selectedBudget !== 'all' || selectedTheme !== 'all' || searchQuery.trim() !== '';

  return (
    <section id="explore-india" className="py-20 sm:py-28 bg-[#060608] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-[0.3em] text-amber-400 uppercase flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              INDIA DESTINATION EXPLORER
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              EXPLORE ALL STATES & UNION TERRITORIES
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] font-light max-w-3xl leading-relaxed">
              Query every verified hub across 28 Indian States and 8 Union Territories. Complete with ASI monument timings, authentic palace stays, and centuries-old culinary lineages.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state, monument, city..."
              className="w-full pl-10 pr-4 py-3 bg-[#121216] border border-white/15 focus:border-amber-400 rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {regionsList.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-mono tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                    : 'bg-[#121216] text-[#A1A1AA] hover:text-white hover:bg-[#1A1A22] border border-white/10'
                }`}
              >
                {reg.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#101014] rounded-2xl border border-white/10 text-xs font-mono">
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#A1A1AA] flex items-center gap-1.5 uppercase">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              FILTERS:
            </span>

            {/* Budget Filter */}
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              className="px-3 py-2 bg-[#181820] border border-white/15 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Budget Tiers</option>
              <option value="Budget">Budget Tier (₹)</option>
              <option value="Mid-Range">Mid-Range (₹₹)</option>
              <option value="Luxury">Luxury Palaces (₹₹₹)</option>
            </select>

            {/* Theme Filter */}
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="px-3 py-2 bg-[#181820] border border-white/15 rounded-lg text-white focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="all">All Themes & Experiences</option>
              <option value="Heritage">UNESCO & Royal Forts</option>
              <option value="Spiritual">Spiritual & Sacred Ghats</option>
              <option value="Backwaters">Backwaters & Lakes</option>
              <option value="Beaches">Beaches & Coastal</option>
              <option value="Food">Culinary Heritage</option>
              <option value="Himalayan">Himalayas & High Passes</option>
              <option value="Wildlife">Wildlife & Jungles</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#71717A]">
              Showing <strong className="text-white">{filteredDestinations.length}</strong> of {destinations.length} hubs
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

        </div>

        {/* Destination Cards Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="py-24 text-center bg-[#101014] rounded-3xl border border-dashed border-white/15 p-8 space-y-4">
            <p className="text-base text-[#A1A1AA] font-light">
              No destinations match your active filter criteria.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider cursor-pointer shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onSelect={onSelectDestination}
                onPlanTrip={onPlanTrip}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
