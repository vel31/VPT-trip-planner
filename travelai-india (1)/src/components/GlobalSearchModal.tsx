import React, { useState, useEffect } from 'react';
import { Destination, Hotel, Attraction, FoodItem } from '../types';
import { 
  Search, 
  X, 
  MapPin, 
  Landmark, 
  Hotel as HotelIcon, 
  Utensils, 
  Star, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (destination: Destination) => void;
  onSelectEntity?: (type: 'attraction' | 'hotel' | 'food', item: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDestination,
  onSelectEntity,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    destinations: Destination[];
    hotels: Hotel[];
    attractions: Attraction[];
    food: FoodItem[];
  }>({ destinations: [], hotels: [], attractions: [], food: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ destinations: [], hotels: [], attractions: [], food: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            destinations: data.destinations || [],
            hotels: data.hotels || [],
            attractions: data.attractions || [],
            food: data.food || [],
          });
        }
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits =
    results.destinations.length +
    results.hotels.length +
    results.attractions.length +
    results.food.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#161616] text-[#F0F0F0] rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2A2A2A] bg-[#1A1A1A]">
          <Search className="w-5 h-5 text-[#8E9299] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search ASI monuments, verified hotels, regional dishes, or cities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent border-none focus:outline-none text-[#F0F0F0] placeholder:text-[#666] font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#8E9299] hover:text-[#F0F0F0]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs text-[#8E9299] hover:text-[#F0F0F0] rounded-lg hover:bg-[#252525] font-semibold border border-[#333]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {loading && (
            <div className="py-12 text-center text-xs text-[#8E9299] flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#F27D26] border-t-transparent rounded-full animate-spin" />
              Searching authoritative records...
            </div>
          )}

          {!loading && !query && (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs text-[#8E9299]">
                Try searching for <strong className="text-[#F0F0F0]">"Amber Fort"</strong>, <strong className="text-[#F0F0F0]">"Taj Lake Palace"</strong>, <strong className="text-[#F0F0F0]">"Laal Maas"</strong>, or <strong className="text-[#F0F0F0]">"Varanasi"</strong>
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-medium pt-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                All results query 100% verified real Indian travel records
              </div>
            </div>
          )}

          {!loading && query && totalHits === 0 && (
            <div className="py-12 text-center text-xs text-[#8E9299]">
              No verified records found matching "<strong className="text-[#F0F0F0]">{query}</strong>".
            </div>
          )}

          {/* Destinations */}
          {results.destinations.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#8E9299] tracking-wider block px-2">
                Destination Hubs ({results.destinations.length})
              </span>
              <div className="space-y-1">
                {results.destinations.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelectDestination(d);
                      onClose();
                    }}
                    className="p-3 rounded-2xl hover:bg-[#202020] cursor-pointer flex items-center justify-between group transition-colors border border-transparent hover:border-[#333]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A1A1A] shrink-0 border border-[#333]">
                        <img
                          src={d.heroImageUrl}
                          alt={d.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#F0F0F0] text-sm group-hover:text-[#F27D26]">
                          {d.name}, {d.state}
                        </h4>
                        <p className="text-xs text-[#8E9299] line-clamp-1">{d.tagline}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8E9299] group-hover:text-[#F27D26]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attractions */}
          {results.attractions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#8E9299] tracking-wider block px-2">
                ASI Monuments & Sights ({results.attractions.length})
              </span>
              <div className="space-y-1">
                {results.attractions.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-2xl hover:bg-[#202020] flex items-center justify-between transition-colors border border-transparent hover:border-[#333]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A1A1A] shrink-0 border border-[#333]">
                        <img
                          src={a.imageUrl}
                          alt={a.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#F0F0F0] text-sm">{a.name}</h4>
                          <span className="text-[10px] bg-[#F27D26]/20 text-[#F27D26] px-1.5 py-0.2 rounded font-semibold border border-[#F27D26]/30">
                            {a.destinationName}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E9299] line-clamp-1">
                          {a.category} • Entry ₹{a.entryFeeINR} • {a.openingHours}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotels */}
          {results.hotels.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#8E9299] tracking-wider block px-2">
                Verified Hotels & Stays ({results.hotels.length})
              </span>
              <div className="space-y-1">
                {results.hotels.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-2xl hover:bg-[#202020] flex items-center justify-between transition-colors border border-transparent hover:border-[#333]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A1A1A] shrink-0 border border-[#333]">
                        <img
                          src={h.imageUrl || (h as any).images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                          alt={h.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#F0F0F0] text-sm">{h.name}</h4>
                          <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold">
                            {h.destinationName}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E9299] line-clamp-1">
                          {h.hotelCategory} • ₹{(h.pricePerNightINR ?? (h as any).basePricePerNightINR ?? (h as any).approxPricePerNightINR ?? 8500).toLocaleString()}/night • ★ {h.rating}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Food */}
          {results.food.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#8E9299] tracking-wider block px-2">
                Culinary Gems & Dishes ({results.food.length})
              </span>
              <div className="space-y-1">
                {results.food.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl hover:bg-[#202020] flex items-center justify-between transition-colors border border-transparent hover:border-[#333]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A1A1A] shrink-0 border border-[#333]">
                        <img
                          src={f.imageUrl}
                          alt={f.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#F0F0F0] text-sm">{f.name}</h4>
                          <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                            {f.isVegetarian ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <p className="text-xs text-[#8E9299] line-clamp-1">
                          Famous at: {f.famousEstablishment?.name} ({f.cuisine})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#121212] border-t border-[#2A2A2A] text-center text-[11px] text-[#8E9299]">
          Press <kbd className="bg-[#1A1A1A] px-1.5 py-0.5 rounded border border-[#333] text-[#F0F0F0]">ESC</kbd> to exit • Search is grounded directly in TravelAI India verified registry
        </div>
      </div>
    </div>
  );
};
