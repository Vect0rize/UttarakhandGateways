import React, { useState } from 'react';
import { Property } from '../types';
import { 
  X, 
  MapPin, 
  Home, 
  Maximize2, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  MessageCircle, 
  Phone, 
  Share2, 
  Download, 
  Plane, 
  Train, 
  ChevronLeft, 
  ChevronRight,
  Calculator,
  Bookmark
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onBookVisit: (property: Property) => void;
  onOpenEmiCalculator: (price: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onBookVisit,
  onOpenEmiCalculator,
  isFavorite,
  onToggleFavorite,
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingBrochure, setDownloadingBrochure] = useState(false);

  if (!property) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadBrochure = () => {
    setDownloadingBrochure(true);
    setTimeout(() => {
      setDownloadingBrochure(false);
      window.print();
    }, 800);
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `Namaste! I am interested in "${property.title}" (${property.priceDisplay}, ${property.city}, Uttarakhand) on Uttarakhand Gateways. Please provide full documents and schedule a consultation.`
    );
    window.open(`https://wa.me/917535981704?text=${text}`, '_blank');
  };

  // Rough estimation of monthly EMI for Indian 20-year loan at 8.5%
  const loanPrincipal = property.price * 0.8; // 80% loan
  const monthlyRate = 8.5 / (12 * 100);
  const tenureMonths = 20 * 12;
  const estimatedEmi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-xl">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#0d1722] border border-white/20 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {property.type}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white truncate">
              {property.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save for later toggle button */}
            <button
              onClick={() => onToggleFavorite(property.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
              }`}
              title={isFavorite ? "Saved for later" : "Save for later"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-slate-300'}`} />
              <span>{isFavorite ? 'Saved' : 'Save for later'}</span>
            </button>

            {/* Share link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-amber-400 transition-colors relative"
              title="Share Property"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-1 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-inner">
              <img
                src={property.images[selectedImgIdx]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImgIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImgIdx((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Peak View Watermark */}
              {property.himalayanPeakView && property.peakName && (
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-xs text-amber-300 font-medium">
                  Direct View of {property.peakName}
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {property.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImgIdx === idx 
                        ? 'border-amber-400 scale-95 shadow-md shadow-amber-500/30' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid of Main Details & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 8 Cols: Descriptions, Specs, Amenities */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Title & Pricing Block */}
              <div>
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-serif-luxury">
                    {property.priceDisplay}
                  </span>
                  {property.ratePerSqFt && (
                    <span className="text-sm font-mono text-amber-300">
                      ({property.ratePerSqFt})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="font-medium">{property.location}, {property.city} ({property.region} Uttarakhand)</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-400">{property.altitudeMsl}</span>
                </div>

                <p className="text-sm text-slate-300 italic">
                  "{property.tagline}"
                </p>
              </div>

              {/* Property Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-amber-400" />
                    <span>Plot / Carpet Area</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {property.areaDisplay}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Home className="w-3 h-3 text-amber-400" />
                    <span>Configuration</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {property.configuration}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-400" />
                    <span>Facing & Sunlight</span>
                  </div>
                  <div className="text-sm font-bold text-white truncate" title={property.facing}>
                    {property.facing}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/10">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Possession</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    {property.possession}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-400 rounded-full" />
                  <span>Property Overview</span>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-400 rounded-full" />
                  <span>Key Highlights</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((highlight, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities List */}
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-400 rounded-full" />
                  <span>Features & Amenities</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/10 text-slate-300 text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distances & Access */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Travel & Connectivity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Airport: {property.distanceFromAirport}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Railway: {property.distanceFromRailway}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Contact & Visit Booking Actions */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Primary Action Card */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-3xl border border-white/15 shadow-xl">
                
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
                  Private Property Consultation
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Connect directly with our Rishikesh team for title deeds and site visit.
                </p>

                {/* Book Site Visit */}
                <button
                  onClick={() => {
                    onClose();
                    onBookVisit(property);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all mb-3 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Free Site Visit</span>
                </button>

                {/* WhatsApp Direct Chat */}
                <button
                  onClick={openWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-semibold text-xs transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp: +91 7535981704</span>
                </button>

                {/* Call Advisor */}
                <a
                  href="tel:+917535981704"
                  className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-2 block text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call: +91 7535981704</span>
                </a>

                {/* Save for later button */}
                <button
                  onClick={() => onToggleFavorite(property.id)}
                  className="w-full mt-3 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                  <span>{isFavorite ? 'Saved in Your Shortlist' : 'Save Property for Later'}</span>
                </button>

                {/* Download Brochure Button */}
                <button
                  onClick={handleDownloadBrochure}
                  disabled={downloadingBrochure}
                  className="w-full mt-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>{downloadingBrochure ? "Generating Dossier..." : "Print / Download Brochure"}</span>
                </button>

              </div>

              {/* Indian Home Loan & EMI Quick Card */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    <span>Home Loan EMI</span>
                  </span>
                  <span className="text-xs text-amber-400 font-bold">
                    ~₹{estimatedEmi.toLocaleString('en-IN')}/mo*
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Estimated based on 80% loan at 8.5% interest for 20 years. Bank loans available from SBI, HDFC & ICICI.
                </p>
                <button
                  onClick={() => onOpenEmiCalculator(property.price)}
                  className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-amber-300 font-medium transition-colors cursor-pointer"
                >
                  Customize Loan Calculator →
                </button>
              </div>

              {/* Direct Office Contacts (Rishikesh, Uttarakhand) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-white">Uttarakhand Gateways Presence:</div>
                <div>📍 Rishikesh: Tapovan & Badrinath Marg, Rishikesh, Uttarakhand</div>
                <div>📍 Kumaon: Mallital, Nainital & Sargakhet, Mukteshwar</div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
                  Timings: Mon - Sat, 9:30 AM to 7:00 PM IST
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
