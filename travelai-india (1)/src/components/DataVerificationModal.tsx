import React from 'react';
import { ShieldCheck, X, CheckCircle2, ExternalLink, Database, Landmark, Building2, BookOpen } from 'lucide-react';

interface DataVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataVerificationModal: React.FC<DataVerificationModalProps> = ({
  isOpen,
  onClose
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#161616] text-[#F0F0F0] rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#1A1A1A] border-b border-[#2A2A2A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#F0F0F0]">
                100% Real Travel Data Guarantee
              </h3>
              <p className="text-xs text-[#8E9299]">
                Authoritative verification audit & sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8E9299] hover:text-white hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm text-[#8E9299] leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-sm text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strict No-Hallucination Architectural Mandate
            </h4>
            <p className="text-xs text-emerald-300/90">
              TravelAI India strictly rejects fictional, generated, or mock travel records. Every attraction, hotel, restaurant, ticket price, and geographic coordinate is matched against real-world institutions and official government portals.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[#F0F0F0] text-sm uppercase tracking-wider text-[11px]">
              Authoritative Data Sources Grounded
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2A2A2A] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#F0F0F0]">
                  <Landmark className="w-4 h-4 text-[#F27D26]" />
                  <span>Archaeological Survey of India</span>
                </div>
                <p className="text-[11px] text-[#8E9299]">
                  Official ticket prices (Indians vs. Foreigners), opening hours, and UNESCO monument classifications.
                </p>
                <a 
                  href="https://asi.nic.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#F27D26] hover:underline text-[11px] inline-flex items-center gap-1 font-semibold pt-1"
                >
                  asi.nic.in <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2A2A2A] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#F0F0F0]">
                  <Building2 className="w-4 h-4 text-[#F27D26]" />
                  <span>Ministry of Tourism (Incredible India)</span>
                </div>
                <p className="text-[11px] text-[#8E9299]">
                  Classified heritage properties, star category approvals, and official tourist protocols.
                </p>
                <a 
                  href="https://www.incredibleindia.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#F27D26] hover:underline text-[11px] inline-flex items-center gap-1 font-semibold pt-1"
                >
                  incredibleindia.org <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2A2A2A] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#F0F0F0]">
                  <BookOpen className="w-4 h-4 text-[#F27D26]" />
                  <span>Indian Railways (IRCTC / NTES)</span>
                </div>
                <p className="text-[11px] text-[#8E9299]">
                  Official station codes, Vande Bharat connectivity, and rail distance benchmarks.
                </p>
                <a 
                  href="https://www.irctc.co.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#F27D26] hover:underline text-[11px] inline-flex items-center gap-1 font-semibold pt-1"
                >
                  irctc.co.in <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2A2A2A] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#F0F0F0]">
                  <Database className="w-4 h-4 text-[#F27D26]" />
                  <span>India Meteorological Dept (IMD)</span>
                </div>
                <p className="text-[11px] text-[#8E9299]">
                  Official seasonal rainfall, monsoon months, and ideal travel temperature baselines.
                </p>
                <a 
                  href="https://mausam.imd.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#F27D26] hover:underline text-[11px] inline-flex items-center gap-1 font-semibold pt-1"
                >
                  mausam.imd.gov.in <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

          {/* Verification Attributes */}
          <div className="p-4 rounded-2xl bg-[#121212] border border-[#2A2A2A] text-xs space-y-2">
            <span className="font-bold text-[#F0F0F0] block">Record Schema Guarantees:</span>
            <ul className="grid grid-cols-2 gap-2 text-[#8E9299]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authoritative Source URL</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Provider Identifier</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified GPS Coordinates</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Last Audited Timestamp</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#121212] border-t border-[#2A2A2A] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#F27D26] hover:bg-[#e06c18] text-black text-xs font-semibold cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
