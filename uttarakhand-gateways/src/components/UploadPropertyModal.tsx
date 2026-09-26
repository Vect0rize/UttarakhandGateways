import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Upload, 
  Plus, 
  Check, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Home, 
  Compass, 
  Mountain, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Sparkles,
  Camera,
  Layers,
  CheckCircle2,
  Clock,
  Lock,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { Property, PropertyCategory, PropertyType, UttarakhandCity } from '../types';
import { CITIES } from '../data/properties';

interface UploadPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyUploaded: (property: Property) => void;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (timestamp: number) => void;
}

const CATEGORY_OPTIONS: (PropertyCategory | 'Other')[] = [
  'Himalayan Villas & Cottages',
  'Flats & Apartments',
  'Residential Plots',
  'Commercial Properties & Shops',
  'Hotels, Resorts & Homestays',
  'Farmhouses & Land',
  'Studio Apartments & Suites',
  'Penthouses & Duplexes',
  'Other',
];

const TYPE_OPTIONS: PropertyType[] = [
  'Villa',
  'Flat',
  'Plot',
  'Cottage',
  'Farmhouse',
  'Commercial',
  'Shop',
  'Hotel',
  'Resort',
  'Studio',
  'Penthouse',
  'Duplex',
  'Land',
];

const PRESET_IMAGE_PACKS = [
  {
    name: 'Luxury Mountain Villa',
    url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    type: 'Villa',
  },
  {
    name: 'Scenic Hillside Cottage',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    type: 'Cottage',
  },
  {
    name: 'Valley View Flat',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    type: 'Apartment',
  },
  {
    name: 'Orchard & Clear Plot',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    type: 'Plot',
  },
  {
    name: 'Pine Forest Retreat',
    url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    type: 'Estate',
  },
];

const COMMON_AMENITIES = [
  'Clear Title / Immediate Registry',
  'Direct 20ft+ Road Access',
  '24x7 Himalayan Water Supply',
  'Electricity Connection',
  'Gated Community / Security',
  '360° Mountain & Valley View',
  'Landscaped Garden & Lawn',
  'Solar Water Heating',
  'Dedicated Car Parking',
  'High-Speed Fiber Internet',
];

const COOLDOWN_DURATION_SECONDS = 300; // 5 minutes

export const UploadPropertyModal: React.FC<UploadPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyUploaded,
  lastUploadTime,
  onUpdateLastUploadTime,
}) => {
  // Cooldown timer state
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    const checkCooldown = () => {
      try {
        const savedTime = lastUploadTime || parseInt(localStorage.getItem('uk_gateways_last_upload_time') || '0', 10);
        if (savedTime > 0) {
          const elapsed = Math.floor((Date.now() - savedTime) / 1000);
          const remaining = Math.max(0, COOLDOWN_DURATION_SECONDS - elapsed);
          setCooldownRemaining(remaining);
        } else {
          setCooldownRemaining(0);
        }
      } catch {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastUploadTime, isOpen]);

  // Form states
  const [title, setTitle] = useState('');
  const [taglineInput, setTaglineInput] = useState('Himalayan View, Riverfront, Road Touch, Clear Title');
  const [category, setCategory] = useState<PropertyCategory | 'Other'>('Himalayan Villas & Cottages');
  const [customCategory, setCustomCategory] = useState('');
  const [type, setType] = useState<PropertyType>('Villa');
  const [city, setCity] = useState<UttarakhandCity>('Dehradun');
  const [locationAddress, setLocationAddress] = useState('');
  const [price, setPrice] = useState<string>('8500000');
  const [areaSqFt, setAreaSqFt] = useState<string>('2400');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [facing, setFacing] = useState('North-East (Himalayan Facing)');
  const [possession, setPossession] = useState<'Ready to Move' | 'Immediate Registry' | 'Under Construction (2026)'>('Immediate Registry');
  const [reraStatus, setReraStatus] = useState<'RERA Approved' | '143 Converted Clear Title' | 'MDDA Approved' | 'Regd Clear Title' | '143 Converted Freehold' | 'Regd Freehold'>('143 Converted Clear Title');
  const [reraId, setReraId] = useState('');
  
  // Himalayan view is completely OPTIONAL
  const [himalayanPeakView, setHimalayanPeakView] = useState(false);
  const [peakName, setPeakName] = useState('Trishul & Nanda Devi Range');
  const [altitudeMsl, setAltitudeMsl] = useState('6,800 ft MSL');
  
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Clear Title / Immediate Registry',
    'Direct 20ft+ Road Access',
    '24x7 Himalayan Water Supply',
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  
  // Seller information
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerType, setSellerType] = useState<'Owner' | 'Verified Builder' | 'Agent'>('Owner');

  const [formSubmitted, setFormSubmitted] = useState(false);

  // Parse comma-separated taglines (max 7)
  const parsedTags = useMemo(() => {
    return taglineInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 7);
  }, [taglineInput]);

  if (!isOpen) return null;

  // Compute Indian currency readable format
  const formatIndianCurrency = (val: number) => {
    if (isNaN(val) || val <= 0) return '₹0';
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const numericPrice = parseFloat(price) || 0;
  const numericArea = parseFloat(areaSqFt) || 0;

  const handleAddCustomImage = () => {
    if (customImageUrl.trim() && !imageUrls.includes(customImageUrl.trim())) {
      setImageUrls([...imageUrls, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleAddPresetImage = (url: string) => {
    if (!imageUrls.includes(url)) {
      setImageUrls([...imageUrls, url]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const newTags = parsedTags.filter((_, idx) => idx !== indexToRemove);
    setTaglineInput(newTags.join(', '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check cooldown limit
    if (cooldownRemaining > 0) {
      return;
    }

    const finalImages = imageUrls.length > 0 
      ? imageUrls 
      : ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'];

    const effectiveCategory = category === 'Other' 
      ? ((customCategory.trim() || 'Other Property') as PropertyCategory)
      : category;

    const highlightsList = parsedTags.length > 0 
      ? parsedTags 
      : [
          `Direct ${sellerType} Listing (0% Brokerage)`,
          `${possession} with 100% Clear Title`,
          himalayanPeakView ? `Panoramic ${peakName || 'Himalayan'} View` : 'Scenic Forest Environment',
          `${numericArea} sq.ft Prime Mountain Location`,
        ];

    const newProperty: Property = {
      id: `user-prop-${Date.now()}`,
      title: title.trim() || `${bedrooms ? `${bedrooms} BHK ` : ''}${type} in ${city}`,
      tagline: parsedTags.join(' • ') || `Verified ${type} with clear title in ${city}`,
      type,
      category: effectiveCategory,
      price: numericPrice,
      priceDisplay: formatIndianCurrency(numericPrice),
      location: locationAddress.trim() ? `${locationAddress.trim()}, ${city}` : city,
      city,
      region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
      altitudeMsl: altitudeMsl.trim() || '5,500 ft MSL',
      areaSqFt: numericArea,
      areaDisplay: `${numericArea.toLocaleString('en-IN')} sq.ft (${(numericArea / 2160).toFixed(1)} Nali)`,
      configuration: type === 'Plot' || type === 'Land' 
        ? `${numericArea} sq.ft Residential Plot` 
        : `${bedrooms} BHK Independent ${type}`,
      bedrooms: type === 'Plot' || type === 'Land' ? 0 : bedrooms,
      bathrooms: type === 'Plot' || type === 'Land' ? 0 : bathrooms,
      facing,
      possession,
      reraStatus,
      reraId: reraId.trim() || undefined,
      himalayanPeakView,
      peakName: himalayanPeakView ? peakName : undefined,
      images: finalImages,
      description: description.trim() || `Prime ${type} available for sale in ${city}, Uttarakhand. Features authentic mountain architecture, clear freehold title, immediate registry, and scenic Himalayan surroundings. Listed directly by ${sellerType.toLowerCase()} ${sellerName ? `(${sellerName})` : ''}.`,
      highlights: highlightsList,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : ['Immediate Registry', 'Water Connection', 'Road Access'],
      legalStatus: `${reraStatus} - 100% Freehold Mutation Guarantee`,
      distanceFromAirport: city === 'Dehradun' ? '25 km (Jolly Grant Airport)' : '45 km (Direct Highway)',
      distanceFromRailway: city === 'Dehradun' ? '12 km (Dehradun Station)' : '35 km (Kathgodam / Haridwar)',
      featured: true,
      sellerName: sellerName.trim() || 'Direct Property Owner',
      sellerPhone: sellerPhone.trim() || '+91 98765 43210',
      sellerEmail: sellerEmail.trim() || undefined,
      sellerType,
    };

    // Save timestamp for 5 minutes cooldown
    const now = Date.now();
    try {
      localStorage.setItem('uk_gateways_last_upload_time', now.toString());
    } catch {}
    if (onUpdateLastUploadTime) {
      onUpdateLastUploadTime(now);
    }
    setCooldownRemaining(COOLDOWN_DURATION_SECONDS);

    onPropertyUploaded(newProperty);
    setFormSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const cooldownMinutes = Math.floor(cooldownRemaining / 60);
  const cooldownSeconds = cooldownRemaining % 60;
  const cooldownFormatted = `${cooldownMinutes}m ${cooldownSeconds < 10 ? '0' : ''}${cooldownSeconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-200/80 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white flex items-center justify-between border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  List Your Property for Sale
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 tracking-wider">
                  0% Brokerage
                </span>
              </div>
              <p className="text-xs text-sky-200/80">
                Direct buyer marketplace • Flats, Villas, Plots, Land & Commercial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cooldown Active Alert Banner */}
        {cooldownRemaining > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 flex items-center gap-3 text-amber-800 dark:text-amber-300">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-spin" />
            <div className="text-xs">
              <span className="font-bold">Upload Cooldown Active: </span>
              You can list another property in <span className="font-mono font-bold text-amber-700 dark:text-amber-200">{cooldownFormatted}</span>.
              <span className="text-slate-500 dark:text-slate-400 ml-1">(5-minute rate limit prevents duplicate spam listings).</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        {formSubmitted ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Property Listed Successfully!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              Your property is now live on Uttarakhand Gateways. Interested buyers can message you and request your phone number via your Inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
            
            {/* Owner Privacy Guarantee Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-850 border border-sky-200 dark:border-slate-700 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-600 text-white flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-sky-950 dark:text-white">Owner Privacy Shield: </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Your phone number will NOT be shown publicly to strangers or automated scrapers. Buyers must request permission or chat with you in your Inbox first.
                </span>
              </div>
            </div>

            {/* SECTION 1: TITLE & CATEGORY */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                <span>1. Property Basics</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Luxury 3BHK Mountain View Villa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* TAGLINE OPTION (COMMA-SEPARATED, MAX 7) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-600" />
                      <span>Tagline / Keywords (Comma-separated, max 7)</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {parsedTags.length}/7 tags
                    </span>
                  </div>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="e.g. Himalayan View, Riverfront, Road Touch, Clear Title"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  {/* LIVE TAG PILLS PREVIEW */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {parsedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 border border-sky-300/80 dark:border-slate-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:text-rose-600 font-bold ml-0.5 cursor-pointer text-slate-400"
                          title="Remove tag"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {parsedTags.length >= 7 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        (Maximum 7 tags reached)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CATEGORY SELECTOR WITH "OTHER" OPTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Property Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IF CATEGORY IS "OTHER", ASK USER TO WRITE CUSTOM CATEGORY */}
              {category === 'Other' && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/90 border border-amber-300 dark:border-amber-700/60 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 mb-1.5">
                    Specify Your Property Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Apple Orchard, Tea Estate, Homestay, Heritage Haveli, Farmhouse, Camping Land"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-400 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                    Write exactly which category describes your property best for buyers.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2: LOCATION & DIMENSIONS */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>2. Location & Dimensions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Destination *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as UttarakhandCity)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Locality / Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Rajpur Road, Near Forest Checkpost"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Area (sq.ft) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    ≈ {(numericArea / 2160).toFixed(2)} Nali
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    disabled={type === 'Plot' || type === 'Land'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                  >
                    <option value={0}>0 (Plot/Commercial)</option>
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    disabled={type === 'Plot' || type === 'Land'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                  >
                    <option value={0}>0 (Plot/Commercial)</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facing
                  </label>
                  <input
                    type="text"
                    value={facing}
                    onChange={(e) => setFacing(e.target.value)}
                    placeholder="e.g. North-East"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PRICING & LEGAL */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>3. Price & Legal Registry</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Asking Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="mt-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    Listing as: {formatIndianCurrency(numericPrice)}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Possession Status
                  </label>
                  <select
                    value={possession}
                    onChange={(e) => setPossession(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Immediate Registry">Immediate Registry</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Under Construction (2026)">Under Construction (2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title / Approval Status
                  </label>
                  <select
                    value={reraStatus}
                    onChange={(e) => setReraStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="143 Converted Clear Title">143 Converted Clear Title</option>
                    <option value="RERA Approved">RERA Approved</option>
                    <option value="MDDA Approved">MDDA Approved</option>
                    <option value="Regd Clear Title">Regd Clear Title</option>
                    <option value="Regd Freehold">Regd Freehold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 4: MOUNTAIN VIEWS & AMENITIES (COMPLETELY OPTIONAL) */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>4. Mountain Views & Amenities (Optional)</span>
                </h4>
                <span className="text-[11px] text-slate-400">All fields optional</span>
              </div>

              {/* Optional Mountain View Toggle */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={himalayanPeakView}
                    onChange={(e) => setHimalayanPeakView(e.target.checked)}
                    className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                      Has Himalayan / Mountain Peak View
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Check if your property has direct snow peak or valley views (Optional)
                    </span>
                  </div>
                </label>

                {himalayanPeakView && (
                  <div className="flex-1 max-w-xs animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={peakName}
                      onChange={(e) => setPeakName(e.target.value)}
                      placeholder="e.g. Trishul, Nanda Devi, Chaukhamba"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-sky-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Amenities tags (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Key Amenities (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 5: PROPERTY PHOTOS */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>5. Property Photos</span>
              </h4>

              {/* Quick Preset Packs */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  1-Click Sample Himalayan Photo Sets:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_IMAGE_PACKS.map((pack) => (
                    <button
                      type="button"
                      key={pack.name}
                      onClick={() => handleAddPresetImage(pack.url)}
                      className="px-3 py-1 text-xs rounded-lg bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 text-sky-900 dark:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{pack.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Paste direct image URL (https://...)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomImage}
                  className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Add Photo
                </button>
              </div>

              {/* Photo preview gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-slate-950/70 text-[9px] text-white px-1.5 py-0.5 rounded-sm font-semibold">
                        Primary Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: SELLER INFORMATION & PROTECTED CONTACT */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>6. Seller / Owner Contact (Protected)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    You Are *
                  </label>
                  <select
                    value={sellerType}
                    onChange={(e) => setSellerType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Owner">Direct Property Owner</option>
                    <option value="Verified Builder">Developer / Builder</option>
                    <option value="Agent">Authorized Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Rawat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Protected: Hidden until you approve requests</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Property Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property's surroundings, neighborhood, water source, peaceful setting, nearby landmarks, or negotiation details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON WITH 5-MINUTES RATE LIMIT ENFORCEMENT */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                ⚡ Instant Live Listing • Free to list • Direct buyer inquiries via Inbox
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cooldownRemaining > 0}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                    cooldownRemaining > 0
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  }`}
                >
                  {cooldownRemaining > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Wait {cooldownFormatted} to Upload</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>List Property for Sale</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
