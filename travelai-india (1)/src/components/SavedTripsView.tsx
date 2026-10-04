import React from 'react';
import { TripPlan } from '../types';
import { 
  Bookmark, 
  Trash2, 
  Printer, 
  Share2, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Clock, 
  Utensils, 
  Hotel as HotelIcon, 
  DollarSign, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SavedTripsViewProps {
  savedPlans: TripPlan[];
  onRemovePlan: (planId: string) => void;
  onOpenPlan?: (plan: TripPlan) => void;
  onPlanNewTrip?: () => void;
  onStartNewPlan?: () => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  savedPlans,
  onRemovePlan,
  onOpenPlan,
  onPlanNewTrip,
  onStartNewPlan
}) => {
  const handlePlanClick = onPlanNewTrip || onStartNewPlan || (() => {});

  if (savedPlans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6 text-[#F0F0F0]">
        <div className="w-16 h-16 rounded-3xl bg-[#161616] text-[#F27D26] flex items-center justify-center mx-auto shadow-xl border border-[#2A2A2A]">
          <Bookmark className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif-display text-3xl font-bold text-[#F0F0F0]">
            No Saved Itineraries Yet
          </h2>
          <p className="text-sm text-[#8E9299] max-w-md mx-auto leading-relaxed">
            Generate customized itineraries using our AI Travel Architect grounded with verified Archaeological Survey of India records and save them here for offline access.
          </p>
        </div>
        <button
          onClick={handlePlanClick}
          className="px-6 py-3 rounded-xl bg-[#F27D26] hover:bg-[#e06c18] text-black font-bold text-sm shadow-lg shadow-[#F27D26]/20 transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Plan Your First Verified Trip
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#F0F0F0]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5">
        <div>
          <h2 className="font-serif-display text-3xl font-bold text-[#F0F0F0]">
            Saved Travel Itineraries ({savedPlans.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#8E9299] mt-1">
            All your generated journeys grounded in verified heritage records and stays.
          </p>
        </div>
        <button
          onClick={handlePlanClick}
          className="px-4 py-2.5 rounded-xl bg-[#F27D26] hover:bg-[#e06c18] text-black font-bold text-xs shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Plan Another Journey
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-[#161616] rounded-3xl border border-[#2A2A2A] shadow-xl hover:border-[#3A3A3A] transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/30">
                  {plan.durationDays} Days • {plan.budgetLevel}
                </span>
                <button
                  onClick={() => onRemovePlan(plan.id)}
                  className="p-1.5 text-[#8E9299] hover:text-rose-400 transition-colors"
                  title="Remove saved itinerary"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#F0F0F0]">
                  {plan.title}
                </h3>
                <p className="text-xs text-[#8E9299] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F27D26]" />
                  {plan.destinationName}, {plan.state}
                </p>
              </div>

              <p className="text-xs text-[#8E9299] line-clamp-3 leading-relaxed">
                {plan.summary}
              </p>

              {plan.recommendedHotel && (
                <div className="bg-[#121212] p-3 rounded-2xl border border-[#2A2A2A] text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#8E9299] flex items-center gap-1">
                    <HotelIcon className="w-3 h-3 text-[#F27D26]" />
                    Verified Stay
                  </span>
                  <p className="font-semibold text-[#F0F0F0] line-clamp-1">{plan.recommendedHotel.name}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#8E9299] pt-2 border-t border-[#2A2A2A]">
                <span>Estimated Cost:</span>
                <span className="font-bold text-[#F27D26]">₹{(plan.estimatedTotalCostINR || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onOpenPlan?.(plan)}
                className="w-full py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-[#F0F0F0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                View Full Itinerary
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
