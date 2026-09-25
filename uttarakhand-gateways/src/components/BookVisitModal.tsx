import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property, VisitBookingData } from '../types';
import { PROPERTIES } from '../data/properties';
import { 
  X, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  Search, 
  ChevronDown, 
  Check,
  Building2
} from 'lucide-react';

interface BookVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: Property | null;
}

export const BookVisitModal: React.FC<BookVisitModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
}) => {
  const [formData, setFormData] = useState<VisitBookingData>({
    propertyId: selectedProperty ? selectedProperty.id : (PROPERTIES[0]?.id || ''),
    propertyName: selectedProperty ? selectedProperty.title : (PROPERTIES[0]?.title || 'General Consultation'),
    clientName: '',
    phone: '',
    email: '',
    preferredDate: '',
    pickupRequired: 'None',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Search state for "Select Property to Inspect"
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProperty) {
      setFormData((prev) => ({
        ...prev,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.title,
      }));
    }
  }, [selectedProperty]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter properties by search query
  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PROPERTIES;
    return PROPERTIES.filter((p) => 
      p.title.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.priceDisplay.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedPropObj = useMemo(() => {
    return PROPERTIES.find((p) => p.id === formData.propertyId);
  }, [formData.propertyId]);

  if (!isOpen) return null;

  const handleSelectProperty = (property: Property) => {
    setFormData((prev) => ({
      ...prev,
      propertyId: property.id,
      propertyName: property.title,
    }));
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = 'UKG-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setSubmitted(true);
  };

  const handleWhatsAppConfirm = () => {
    const text = encodeURIComponent(
      `Namaste Uttarakhand Gateways team! I have submitted a Site Visit Booking (Ref: ${bookingRef}).\n\nProperty: ${formData.propertyName}\nClient: ${formData.clientName}\nPreferred Date: ${formData.preferredDate}\nPhone: ${formData.phone}`
    );
    window.open(`https://wa.me/917535981704?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0e1824] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Book a Site Visit
              </h2>
              <p className="text-xs text-slate-400">
                Accompanied Property Inspection & Consultation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Site Visit Scheduled Successfully!
            </h3>
            <p className="text-sm text-slate-300">
              Thank you, <strong className="text-amber-300">{formData.clientName}</strong>. Our property advisor from Rishikesh will contact you within 2 hours to confirm your visit.
            </p>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-slate-300 space-y-1 text-left">
              <div>Booking Reference: <span className="text-amber-400 font-bold">{bookingRef}</span></div>
              <div>Property: <span className="text-white">{formData.propertyName}</span></div>
              <div>Date: <span className="text-white">{formData.preferredDate || 'To be scheduled'}</span></div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Notify Advisor on WhatsApp Now</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                Back to Properties
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            
            {/* Searchable Property Selector */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Property to Inspect</span>
              </label>

              {/* Trigger Button showing currently selected property */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-slate-950/90 border border-amber-400/40 hover:border-amber-400 text-left text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer shadow-inner"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate font-medium text-white">
                    {selectedPropObj 
                      ? `${selectedPropObj.title} (${selectedPropObj.city} - ${selectedPropObj.priceDisplay})`
                      : formData.propertyName}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-amber-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown with Integrated Search Bar */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#08121c] border border-amber-400/40 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl">
                  
                  {/* Search Input Bar */}
                  <div className="p-2.5 border-b border-white/10 bg-slate-900/90">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search property by name, location, or price..."
                        className="w-full bg-slate-950/80 border border-white/15 focus:border-amber-400 text-white text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none placeholder-slate-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Properties List */}
                  <div className="max-h-60 overflow-y-auto divide-y divide-white/5 py-1">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((p) => {
                        const isSelected = p.id === formData.propertyId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectProperty(p)}
                            className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 text-white'
                                : 'hover:bg-white/5 text-slate-200'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs sm:text-sm font-semibold truncate text-white">
                                {p.title}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="text-amber-400 font-medium">{p.city}</span>
                                <span>•</span>
                                <span>{p.type}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-medium">{p.priceDisplay}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No properties found matching "{searchQuery}"
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Name and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950/80 border border-white/15 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 7535981704"
                  className="w-full bg-slate-950/80 border border-white/15 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Email & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950/80 border border-white/15 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Visit Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/15 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Special Requests or Questions
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Schedule for morning visit, traveling with family..."
                className="w-full bg-slate-950/80 border border-white/15 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-400 placeholder-slate-500 resize-none"
              />
            </div>

            {/* Notice */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
              ✨ <strong>Site Visit Inspection:</strong> Site visits include on-ground inspection of the plot/flat, road access verification, and registry paper check with our Rishikesh team.
            </div>

            {/* Submit CTA */}
            <button
              id="confirm-visit-booking-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Confirm Site Visit Reservation</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
