import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Destination, FoodItem } from '../types';
import { 
  Utensils, 
  MapPin, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Star,
  Compass,
  ArrowRight,
  Filter,
  Layers,
  ChefHat,
  Coffee,
  Flame,
  Award,
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';

interface FoodDirectoryViewProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onPlanTrip: (dest: Destination) => void;
}

export const FoodDirectoryView: React.FC<FoodDirectoryViewProps> = ({
  destinations,
  onSelectDestination,
  onPlanTrip
}) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [viewMode, setViewMode] = useState<'category' | 'destination' | 'grid'>('category');

  // Load food data from /api/food
  const fetchFood = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedDestinationId && selectedDestinationId !== 'all') {
        params.append('destination', selectedDestinationId);
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedDiet !== 'all') {
        params.append('diet', selectedDiet);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/food?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFoodItems(data.food || []);
      } else {
        setError('Failed to fetch culinary dishes from registry.');
      }
    } catch (err: any) {
      console.error('Error fetching food items:', err);
      setError('Network error while loading dishes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, [selectedDestinationId, selectedCategory, selectedDiet]);

  // Destination lookup map
  const destinationMap = useMemo(() => {
    const map = new Map<string, Destination>();
    destinations.forEach(d => {
      map.set(d.id.toLowerCase(), d);
      map.set(d.name.toLowerCase(), d);
    });
    return map;
  }, [destinations]);

  // Top featured culinary hubs for quick pills
  const topCulinaryHubs = [
    { id: 'all', label: 'All India' },
    { id: 'jaipur', label: 'Jaipur' },
    { id: 'delhi', label: 'Delhi' },
    { id: 'mumbai', label: 'Mumbai' },
    { id: 'varanasi', label: 'Varanasi' },
    { id: 'amritsar', label: 'Amritsar' },
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'goa', label: 'Goa' },
    { id: 'kerala', label: 'Kerala' },
    { id: 'udaipur', label: 'Udaipur' },
    { id: 'agra', label: 'Agra' },
    { id: 'madurai', label: 'Madurai' },
    { id: 'srinagar', label: 'Kashmir' },
    { id: 'rishikesh', label: 'Rishikesh' },
  ];

  // Verified categories
  const categoriesList = [
    { id: 'all', label: 'All Categories' },
    { id: 'Traditional Main Course', label: 'Traditional Main Course' },
    { id: 'Iconic Street Food', label: 'Street Food & Chaat' },
    { id: 'Royal Cuisine', label: 'Royal Cuisine' },
    { id: 'Famous Dessert / Sweet', label: 'Sweets & Desserts' },
    { id: 'Breakfast Special', label: 'Breakfast Specials' },
    { id: 'Coastal Seafood', label: 'Coastal Seafood' },
    { id: 'Vegetarian Feast', label: 'Vegetarian Feasts' },
    { id: 'Regional Beverage', label: 'Regional Beverages' },
  ];

  // Filtered in memory for instant search typing if needed
  const displayedFood = useMemo(() => {
    if (!searchQuery.trim()) return foodItems;
    const q = searchQuery.toLowerCase().trim();
    return foodItems.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.cuisine.toLowerCase().includes(q) ||
      f.destinationName.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      (f.famousEstablishment && (
        f.famousEstablishment.name.toLowerCase().includes(q) ||
        f.famousEstablishment.address.toLowerCase().includes(q)
      ))
    );
  }, [foodItems, searchQuery]);

  // Grouped by Category
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    displayedFood.forEach(item => {
      const cat = item.category || 'Traditional Cuisine';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(item);
    });
    return map;
  }, [displayedFood]);

  // Grouped by Destination
  const groupedByDestination = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    displayedFood.forEach(item => {
      const destName = item.destinationName || item.destinationId;
      if (!map.has(destName)) {
        map.set(destName, []);
      }
      map.get(destName)!.push(item);
    });
    return map;
  }, [displayedFood]);

  const handleCardExplore = (item: FoodItem) => {
    const dest = destinationMap.get(item.destinationId.toLowerCase()) || 
                 destinations.find(d => d.name.toLowerCase() === item.destinationName.toLowerCase());
    if (dest) {
      onSelectDestination(dest);
    }
  };

  const handleCardPlanTrip = (item: FoodItem) => {
    const dest = destinationMap.get(item.destinationId.toLowerCase()) || 
                 destinations.find(d => d.name.toLowerCase() === item.destinationName.toLowerCase());
    if (dest) {
      onPlanTrip(dest);
    }
  };

  // Helper for FSSAI-style Veg / Non-Veg Badge
  const renderDietBadge = (isVeg: boolean) => {
    if (isVeg) {
      return (
        <span 
          title="Pure Vegetarian"
          className="inline-flex items-center justify-center w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-950/80 shrink-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
      );
    }
    return (
      <span 
        title="Authentic Non-Vegetarian"
        className="inline-flex items-center justify-center w-4 h-4 rounded border-2 border-red-500 bg-red-950/80 shrink-0"
      >
        <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-red-400" />
      </span>
    );
  };

  const renderFoodCard = (food: FoodItem, idx: number) => {
    const destObj = destinationMap.get(food.destinationId.toLowerCase()) || 
                    destinations.find(d => d.name.toLowerCase() === food.destinationName.toLowerCase());

    return (
      <motion.div
        key={`${food.id}-${idx}`}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: (idx % 6) * 0.04 }}
        className="rounded-3xl overflow-hidden bg-[#0D0D12] border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-black/60"
      >
        <div>
          {/* Card Media Header */}
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
            <img
              src={food.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80'}
              alt={food.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80';
              }}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-black/60" />

            {/* Destination Pill */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-black/85 backdrop-blur-md border border-white/20 text-white font-medium shadow-md">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{food.destinationName}</span>
            </div>

            {/* Veg / Non-Veg Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/20 shadow-md">
              {renderDietBadge(food.isVegetarian)}
              <span className={`text-[10px] font-mono font-bold tracking-wider ${food.isVegetarian ? 'text-emerald-400' : 'text-red-400'}`}>
                {food.isVegetarian ? 'VEG' : 'NON-VEG'}
              </span>
            </div>

            {/* Cuisine badge at bottom of photo */}
            <div className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider uppercase bg-[#181822]/90 border border-amber-400/30 text-amber-300 font-medium">
              {food.cuisine}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-400/90 uppercase font-semibold">
                  {food.category}
                </span>
                <span className="text-[9px] font-mono text-[#71717A] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>ASI VERIFIED</span>
                </span>
              </div>
              <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                {food.name}
              </h3>
            </div>

            <p className="text-xs text-[#A1A1AA] line-clamp-3 font-light leading-relaxed">
              {food.description}
            </p>

            {food.localSignificance && (
              <div className="text-[11px] font-mono text-stone-300/80 bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-start gap-2">
                <ChefHat className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{food.localSignificance}</span>
              </div>
            )}

            {/* Iconic Establishment Section */}
            {food.famousEstablishment && (
              <div className="p-3.5 rounded-2xl bg-[#14141C] border border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-widest text-amber-400 uppercase font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>CENTURIES-OLD EATERY</span>
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-mono text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{food.famousEstablishment.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="font-semibold text-white truncate text-xs sm:text-sm">
                  {food.famousEstablishment.name}
                </p>
                <p className="text-[11px] text-[#8E9299] truncate">
                  {food.famousEstablishment.address}
                </p>

                <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono text-[#D4D4D8] border-t border-white/5">
                  <span className="text-[#A1A1AA]">Price for two:</span>
                  <span className="text-amber-300 font-bold">₹{food.famousEstablishment.approxPriceForTwoINR}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2 flex items-center justify-between gap-2 text-xs font-mono">
          <button
            onClick={() => handleCardPlanTrip(food)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PLAN TRIP</span>
          </button>

          <button
            onClick={() => handleCardExplore(food)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <span>EXPLORE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-24 sm:py-32 bg-[#060608] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono text-xs uppercase tracking-widest">
              <Utensils className="w-3.5 h-3.5" />
              <span>OFFICIAL CULINARY LINEAGE & HISTORIC DISHES</span>
            </div>
            <h1 className="font-cinzel text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase">
              AUTHENTIC FOOD & ICONIC ESTABLISHMENTS
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] font-light leading-relaxed">
              Explore authentic regional cuisines, centuries-old recipes, and iconic street eateries across India. Every dish is verified with authentic lineage, FSSAI dietary standards, and century-old legendary establishments.
            </p>
          </div>

          {/* Search bar & Live Filter Count */}
          <div className="w-full lg:w-96 space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish, cuisine, restaurant, city..."
                className="w-full pl-10 pr-4 py-3 bg-[#121216] border border-white/15 focus:border-amber-400 rounded-2xl text-xs font-mono text-white placeholder-[#71717A] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8E9299] px-1">
              <span>{displayedFood.length} verified culinary dishes</span>
              <button 
                onClick={fetchFood}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                title="Refresh dishes"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#0D0D12] border border-white/10 space-y-6 shadow-xl">
          
          {/* Row 1: Destination Filter (Quick Pills + Full Dropdown) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>SELECT DESTINATION:</span>
              </span>
              
              {/* Full Destination Dropdown for all 140 Destinations */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#71717A] uppercase hidden sm:inline">All 140 Cities:</span>
                <select
                  value={selectedDestinationId}
                  onChange={(e) => setSelectedDestinationId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#161620] border border-white/15 text-xs font-mono text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="all">All India (All Cities)</option>
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Destination Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {topCulinaryHubs.map(hub => {
                const isActive = selectedDestinationId === hub.id;
                return (
                  <button
                    key={hub.id}
                    onClick={() => setSelectedDestinationId(hub.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                        : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {hub.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Category Filter Tabs */}
          <div className="space-y-2.5 pt-4 border-t border-white/5">
            <span className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>CATEGORY FILTER:</span>
            </span>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {categoriesList.map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap uppercase transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                        : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Dietary Filter & Grouping View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
            {/* Dietary */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase mr-1">DIET:</span>
              {[
                { id: 'all', label: 'All Dishes' },
                { id: 'veg', label: 'Pure Veg', isVeg: true },
                { id: 'nonveg', label: 'Non-Veg', isVeg: false }
              ].map((diet) => (
                <button
                  key={diet.id}
                  onClick={() => setSelectedDiet(diet.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono uppercase transition-all cursor-pointer ${
                    selectedDiet === diet.id
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/5 text-[#A1A1AA] hover:text-white border border-white/10'
                  }`}
                >
                  {diet.id !== 'all' && renderDietBadge(diet.isVeg!)}
                  <span>{diet.label}</span>
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#A1A1AA] uppercase mr-1">GROUP BY:</span>
              <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('category')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                    viewMode === 'category' ? 'bg-amber-400 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Category
                </button>
                <button
                  onClick={() => setViewMode('destination')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                    viewMode === 'destination' ? 'bg-amber-400 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Destination
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-amber-400 text-black font-bold' : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  All Grid
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
              Loading authentic culinary lineage records from Indian destinations...
            </p>
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
            <p className="text-xs font-mono text-red-400">{error}</p>
            <button
              onClick={fetchFood}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-mono text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Views */}
        {!loading && displayedFood.length > 0 && (
          <>
            {/* VIEW MODE 1: GROUPED BY CATEGORY */}
            {viewMode === 'category' && (
              <div className="space-y-14">
                {Array.from(groupedByCategory.entries()).map(([categoryName, items]) => (
                  <div key={categoryName} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                            {categoryName}
                          </h2>
                          <span className="text-[11px] font-mono text-amber-300/80">
                            {items.length} verified dishes across destinations
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((food, idx) => renderFoodCard(food, idx))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW MODE 2: GROUPED BY DESTINATION */}
            {viewMode === 'destination' && (
              <div className="space-y-14">
                {Array.from(groupedByDestination.entries()).map(([destName, items]) => {
                  const destObj = destinations.find(d => d.name.toLowerCase() === destName.toLowerCase()) ||
                                  destinations.find(d => d.id.toLowerCase() === items[0]?.destinationId.toLowerCase());

                  return (
                    <div key={destName} className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                              {destName} {destObj ? `(${destObj.state})` : ''}
                            </h2>
                            <span className="text-[11px] font-mono text-[#A1A1AA]">
                              {items.length} authentic dishes & iconic eateries
                            </span>
                          </div>
                        </div>

                        {destObj && (
                          <button
                            onClick={() => onSelectDestination(destObj)}
                            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer w-fit"
                          >
                            <span>Explore Destination Guide</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((food, idx) => renderFoodCard(food, idx))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 3: UNIFORM GRID */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedFood.map((food, idx) => renderFoodCard(food, idx))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && displayedFood.length === 0 && (
          <div className="p-16 text-center rounded-3xl bg-[#0D0D11] border border-white/10 space-y-4 max-w-xl mx-auto shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-7 h-7" />
            </div>
            <h3 className="font-cinzel text-xl font-bold text-white uppercase">NO CULINARY DISHES MATCH YOUR FILTERS</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              No dishes match your selected destination, category, or dietary preference. Reset your filters to explore all verified Indian culinary specialties.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDestinationId('all');
                setSelectedCategory('all');
                setSelectedDiet('all');
              }}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              RESET ALL FILTERS
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
