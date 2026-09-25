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
  onOpenEmiCalculator: (price: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
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
  const loanPrincipal = property.price * 0.8;
  const monthlyRate = 8.5 / (12 * 100);
  const tenureMonths = 20 * 12;
  const estimatedEmi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/70 backdrop-blur-md">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-slate-800 bg-sky-50/80 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-slate-700">
              {property.type}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
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
                  : 'bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-sky-200 dark:border-slate-700'
              }`}
              title={isFavorite ? "Saved for later" : "Save for later"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{isFavorite ? 'Saved' : 'Save for later'}</span>
            </button>

            {/* Share link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-colors relative cursor-pointer"
              title="Share Property"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors ml-1 cursor-pointer"
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
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-800 shadow-inner">
              <img
                src={property.images[selectedImgIdx]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white">
                Photo {selectedImgIdx + 1} of {property.images.length}
              </div>

              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImgIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImgIdx((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-slate-700">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImgIdx === idx 
                        ? 'border-sky-600 scale-105' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Specs & Highlights */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Title & Pricing Block */}
              <div>
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif-luxury">
                    {property.priceDisplay}
                  </span>
                  {property.ratePerSqFt && (
                    <span className="text-sm font-mono text-sky-700 dark:text-sky-400 font-semibold">
                      ({property.ratePerSqFt})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-2">
                  <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                  <span className="font-medium">{property.location}, {property.city} ({property.region} Uttarakhand)</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{property.altitudeMsl}</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                  "{property.tagline}"
                </p>
              </div>

              {/* Property Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-sky-50/70 dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-200/80 dark:border-slate-700">
                  <div className="text-[11px] text-sky-800 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Maximize2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    <span>Plot / Area</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {property.areaDisplay}
                  </div>
                </div>

                <div className="bg-sky-50/70 dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-200/80 dark:border-slate-700">
                  <div className="text-[11px] text-sky-800 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Home className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    <span>Configuration</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {property.configuration}
                  </div>
                </div>

                <div className="bg-sky-50/70 dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-200/80 dark:border-slate-700">
                  <div className="text-[11px] text-sky-800 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Compass className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    <span>Facing & Light</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={property.facing}>
                    {property.facing}
                  </div>
                </div>

                <div className="bg-sky-50/70 dark:bg-slate-800/80 p-3.5 rounded-xl border border-sky-200/80 dark:border-slate-700">
                  <div className="text-[11px] text-sky-800 dark:text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Possession</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {property.possession}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h3 className="text-base font-bold text-[#0c2340] dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-sky-600 dark:bg-sky-400 rounded-full" />
                  <span>Property Overview</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div>
                <h3 className="text-base font-bold text-[#0c2340] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-sky-600 dark:bg-sky-400 rounded-full" />
                  <span>Key Highlights</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((highlight, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl bg-sky-50/60 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 mt-1.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities List */}
              <div>
                <h3 className="text-base font-bold text-[#0c2340] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-sky-600 dark:bg-sky-400 rounded-full" />
                  <span>Features & Amenities</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-900 dark:text-sky-300 text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distances & Access */}
              <div className="bg-sky-50/70 dark:bg-slate-800/80 p-4 rounded-2xl border border-sky-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300 mb-3">
                  Travel & Connectivity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                    <span>Airport: {property.distanceFromAirport}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                    <span>Railway: {property.distanceFromRailway}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Contact & Consultation */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Primary Action Card */}
              <div className="bg-gradient-to-b from-sky-50/90 to-blue-50/60 dark:from-slate-800/90 dark:to-slate-800/60 p-5 rounded-3xl border border-sky-200 dark:border-slate-700 shadow-md">
                
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0c2340] dark:text-white mb-1">
                  Private Property Consultation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                  Connect directly with our Rishikesh team for verified title deeds, layouts, and consultation.
                </p>

                {/* WhatsApp Direct Chat */}
                <button
                  onClick={openWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant WhatsApp: +91 7535981704</span>
                </button>

                {/* Call Advisor */}
                <a
                  href="tel:+917535981704"
                  className="w-full py-2 px-4 rounded-xl bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium border border-sky-200 dark:border-slate-600 transition-all flex items-center justify-center gap-2 block text-center shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Call: +91 7535981704</span>
                </a>

                {/* Save for later button */}
                <button
                  onClick={() => onToggleFavorite(property.id)}
                  className="w-full mt-3 py-2 px-4 rounded-xl bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium border border-sky-200 dark:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{isFavorite ? 'Saved in Your Shortlist' : 'Save Property for Later'}</span>
                </button>

                {/* Download Brochure Button */}
                <button
                  onClick={handleDownloadBrochure}
                  disabled={downloadingBrochure}
                  className="w-full mt-2 py-2 px-4 rounded-xl bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium border border-sky-200 dark:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{downloadingBrochure ? "Generating Dossier..." : "Print / Download Brochure"}</span>
                </button>

              </div>

              {/* Indian Home Loan & EMI Quick Card */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-sky-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Home Loan EMI</span>
                  </span>
                  <span className="text-xs text-sky-700 dark:text-sky-400 font-bold">
                    ~₹{estimatedEmi.toLocaleString('en-IN')}/mo*
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Estimated based on 80% loan at 8.5% interest for 20 years. Bank loans available from SBI, HDFC & ICICI.
                </p>
                <button
                  onClick={() => onOpenEmiCalculator(property.price)}
                  className="w-full py-2 rounded-lg bg-sky-50 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 border border-sky-200 dark:border-slate-600 text-xs text-sky-800 dark:text-sky-300 font-semibold transition-colors cursor-pointer"
                >
                  Customize Loan Calculator →
                </button>
              </div>

              {/* Direct Office Contacts */}
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white">Uttarakhand Gateways Presence:</div>
                <div>📍 Rishikesh: Tapovan & Badrinath Marg, Rishikesh</div>
                <div>📍 Kumaon: Mallital, Nainital & Sargakhet, Mukteshwar</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-sky-200/80 dark:border-slate-700">
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
