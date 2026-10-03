import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { compressAndNormalizeImage, moderateImageWithAI } from '../utils/imageModeration';
import { 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';

import { LegalPolicyId } from '../data/legalPolicies';

interface UploadPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyUploaded: (property: Property) => void;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (timestamp: number) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

const CATEGORY_OPTIONS: PropertyCategory[] = [
  'Residential',
  'Commercial',
  'Agriculture',
];

const TYPE_OPTIONS: PropertyType[] = [
  'Villa',
  'Flat',
  'Plot',
  'Cottage',
  'Farmhouse',
  'Shop',
  'Hotel',
  'Resort',
  'Studio',
  'Penthouse',
  'Duplex',
  'Land',
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
  onOpenLegalPolicy,
}) => {
  const { currentUser } = useAuth();
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
  const [taglineInput, setTaglineInput] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('Residential');
  const [type, setType] = useState<PropertyType>('Villa');
  const [city, setCity] = useState<UttarakhandCity>('Dehradun');
  const [locationAddress, setLocationAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [price, setPrice] = useState<string>('8500000');
  const [areaSqFt, setAreaSqFt] = useState<string>('2400');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [facing, setFacing] = useState('');
  const [possession, setPossession] = useState<'Ready to Move' | 'Immediate Registry' | 'Under Construction (2026)'>('Immediate Registry');
  const [reraStatus, setReraStatus] = useState<'RERA Approved' | '143 Converted Clear Title' | 'MDDA Approved' | 'Regd Clear Title' | '143 Converted Freehold' | 'Regd Freehold'>('143 Converted Clear Title');
  const [reraId, setReraId] = useState('');
  
  // Himalayan view is completely OPTIONAL
  const [himalayanPeakView, setHimalayanPeakView] = useState(false);
  const [peakName, setPeakName] = useState('');
  const [altitudeMsl, setAltitudeMsl] = useState('5,500 ft MSL');
  
  const [description, setDescription] = useState('');
  const { isHindi } = useLanguage();

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Clear Title / Immediate Registry',
    'Direct 20ft+ Road Access',
    '24x7 Himalayan Water Supply',
  ]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // AI Content Moderation & NSFW Detection States
  const [isScanningImages, setIsScanningImages] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; filename?: string } | null>(null);
  const [blockedImages, setBlockedImages] = useState<Array<{ filename: string; reason: string }>>([]);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Seller information
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerType, setSellerType] = useState<'Owner' | 'Verified Builder' | 'Agent'>('Owner');

  // Prepopulate seller info from authenticated account
  useEffect(() => {
    if (currentUser && isOpen) {
      if (!sellerName && currentUser.username) {
        setSellerName(currentUser.username);
      }
      if (!sellerPhone && currentUser.contactType === 'phone') {
        setSellerPhone(currentUser.contact);
      }
      if (!sellerEmail && currentUser.contactType === 'email') {
        setSellerEmail(currentUser.contact);
      }
    }
  }, [currentUser, isOpen]);

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

  // Automated Real-Time AI Safety & NSFW Scanning for Uploaded Property Photos
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    const files = Array.from(rawFiles).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsScanningImages(true);
    const approvedBatch: string[] = [];
    const blockedBatch: Array<{ filename: string; reason: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setScanProgress({ current: i + 1, total: files.length, filename: file.name });

      try {
        // Step 1: Compress and normalize to fast web-ready resolution (saves bandwidth & prevents storage bloat)
        const compressedBase64 = await compressAndNormalizeImage(file, 1200, 0.82);

        // Step 2: Query Gemini AI Content Moderation for NSFW / Adult / Violence / Inappropriate Content
        const inspection = await moderateImageWithAI(compressedBase64, file.name);

        if (!inspection.isSafe || inspection.isNSFW) {
          // AUTOMATICALLY REJECT, DISCARD & DELETE THE INAPPROPRIATE IMAGE!
          console.warn(`[AI Moderation Blocked] "${file.name}":`, inspection.reason);
          blockedBatch.push({
            filename: file.name,
            reason: inspection.reason || (isHindi ? 'अनुचित या वयस्क सामग्री (NSFW) का पता चला।' : 'Inappropriate or adult NSFW content detected.')
          });
        } else {
          // VERIFIED SAFE: Accept photo
          approvedBatch.push(compressedBase64);
        }
      } catch (err: any) {
        console.warn('Error during image inspection:', err);
        // Fallback reading
        const reader = new FileReader();
        const fallbackUrl = await new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve((ev.target?.result as string) || '');
          reader.readAsDataURL(file);
        });
        if (fallbackUrl) {
          approvedBatch.push(fallbackUrl);
        }
      }
    }

    if (approvedBatch.length > 0) {
      setImageUrls((prev) => [...prev, ...approvedBatch]);
    }

    if (blockedBatch.length > 0) {
      setBlockedImages((prev) => [...blockedBatch, ...prev]);
    }

    setIsScanningImages(false);
    setScanProgress(null);
    e.target.value = '';
  };

  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
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
      category,
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
      coordinates,
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
      sellerName: sellerName.trim() || currentUser?.username || 'Direct Property Owner',
      sellerPhone: sellerPhone.trim() || (currentUser?.contactType === 'phone' ? currentUser.contact : '+91 98765 43210'),
      sellerEmail: sellerEmail.trim() || (currentUser?.contactType === 'email' ? currentUser.contact : undefined),
      sellerType,
      ownerId: currentUser?.id,
      ownerContact: currentUser?.contact,
      ownerUsername: currentUser?.username,
      isSold: false,
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
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200/80 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header - Clean, balanced responsive layout for mobile and desktop */}
        <div className="relative px-4 py-3.5 sm:px-6 sm:py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between gap-3 border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-xl font-bold text-white tracking-tight leading-snug">
                  List Your Property for Sale
                </h2>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 tracking-wider shrink-0">
                  0% Brokerage
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/80 truncate mt-0.5">
                Direct buyer marketplace • Flats, Villas, Plots, Land & Commercial
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
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

            {/* SECTION 1: TITLE & CATEGORY */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* TAGLINE OPTION (OPTIONAL, COMMA-SEPARATED, MAX 7) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>Tagline / Keywords (Optional - max 7)</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {parsedTags.length}/7 tags
                    </span>
                  </div>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="e.g. Forest View, Near Highway, Road Touch (Optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {/* LIVE TAG PILLS PREVIEW */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {parsedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-slate-700"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOCATION & DIMENSIONS */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    disabled={type === 'Plot' || type === 'Land'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    <option value={0}>0 (Studio)</option>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    <option value={0}>0 (Studio / None)</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Facing (Optional)
                  </label>
                  <input
                    type="text"
                    value={facing}
                    onChange={(e) => setFacing(e.target.value)}
                    placeholder="e.g. North-East, East facing (Optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PRICE */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>3. Price</span>
              </h4>

              <div className="max-w-md">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Asking Price (₹ INR) *
                </label>
                <input
                  type="number"
                  min="50000"
                  step="50000"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 8500000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="mt-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  Listing as: {formatIndianCurrency(numericPrice)}
                </div>
              </div>
            </div>

            {/* SECTION 4: PROPERTY PHOTOS WITH AI NSFW & SAFETY SHIELD */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>4. Property Photos</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'एआई सुरक्षा जांच सक्रिय' : 'AI Safety Guard Active'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {imageUrls.length} {imageUrls.length === 1 ? 'photo' : 'photos'} added
                  </span>
                </div>
              </div>

              {/* AI Content Moderation & NSFW Protection Shield Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/80 flex items-start gap-3 text-xs text-slate-700 dark:text-emerald-200 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'जेमिनी एआई (Gemini AI) सामग्री सुरक्षा एवं एनएसएफडब्ल्यू (NSFW) फ़िल्टर' : 'Automated Gemini AI Safety & NSFW Filter Active'}
                    </span>
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                      Zero Tolerance
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isHindi 
                      ? 'परिवार-अनुकूल मंच बनाए रखने हेतु, प्रत्येक अपलोड की गई तस्वीर का एआई द्वारा तत्काल विश्लेषण किया जाता है। किसी भी प्रकार की वयस्क/अश्लील (NSFW), नग्नता, यौन, हिंसक अथवा अप्रासंगिक तस्वीरें स्वतः निरस्त व डिलीट कर दी जाती हैं।'
                      : 'To protect our family-safe mountain real estate portal, every uploaded photo is scanned by AI in real time. Any NSFW, adult, sexually explicit, nude, violent, or abusive images are strictly blocked and automatically deleted.'}
                  </p>
                </div>
              </div>

              {/* Real-time AI Inspection Progress Card */}
              {isScanningImages && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-dashed border-emerald-500/50 flex items-center gap-3 animate-pulse">
                  <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
                  <div className="text-xs min-w-0 flex-1">
                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block text-sm">
                      {isHindi ? 'तस्वीर की एआई सुरक्षा व वयस्क सामग्री जांच जारी है...' : 'AI Safety & NSFW Scan in Progress...'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate block mt-0.5">
                      {scanProgress 
                        ? (isHindi 
                            ? `फोटो ${scanProgress.current} / ${scanProgress.total} का विश्लेषण हो रहा है (${scanProgress.filename || ''})...` 
                            : `Analyzing photo ${scanProgress.current} of ${scanProgress.total} (${scanProgress.filename || ''}) with Gemini AI...`)
                        : (isHindi 
                            ? 'वयस्क सामग्री, नग्नता व सुरक्षा की पुष्टि की जा रही है...' 
                            : 'Scanning for adult content, nudity, and real estate safety...')}
                    </span>
                  </div>
                </div>
              )}

              {/* Blocked / Discarded Images Notification Alert */}
              {blockedImages.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 space-y-2.5 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-rose-900 dark:text-rose-200 font-bold">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="text-sm">
                        {isHindi 
                          ? 'प्रतिबंधित / अनुपयुक्त तस्वीर स्वतः निरस्त व डिलीट कर दी गई' 
                          : 'Inappropriate / NSFW Photo Blocked & Deleted by AI'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBlockedImages([])}
                      className="text-[11px] font-semibold underline text-rose-700 dark:text-rose-300 hover:text-rose-900 cursor-pointer"
                    >
                      {isHindi ? 'बंद करें' : 'Dismiss'}
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    {blockedImages.map((blocked, idx) => (
                      <div 
                        key={idx} 
                        className="text-xs text-rose-800 dark:text-rose-200 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 shadow-xs"
                      >
                        <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">🚫 {blocked.filename}:</span>
                        <span>{blocked.reason}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-rose-700/90 dark:text-rose-300/80 leading-snug">
                    {isHindi 
                      ? 'कृपया केवल अपनी संपत्ति, घर के कमरों, बालकनी, जमीन अथवा वास्तविक पर्वतीय परिदृश्य की प्रामाणिक तस्वीरें ही अपलोड करें।' 
                      : 'Please only upload authentic photos of your property, building exterior, rooms, plot, or surrounding mountain scenery.'}
                  </p>
                </div>
              )}

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                multiple
                disabled={isScanningImages}
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                disabled={isScanningImages}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Action Buttons: Gallery & Camera */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isScanningImages}
                  onClick={() => galleryInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed border-emerald-500/60 hover:border-emerald-600 bg-emerald-50/50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-3 text-emerald-800 dark:text-emerald-300 group ${isScanningImages ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {isScanningImages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block text-slate-800 dark:text-white">
                      {isHindi ? 'गैलरी से अपलोड करें' : 'Upload from Gallery'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isHindi ? 'फोटो फ़ाइल चुनें (एआई सुरक्षा जांच सहित)' : 'Open device gallery (AI safety scan active)'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isScanningImages}
                  onClick={() => cameraInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed border-teal-500/60 hover:border-teal-600 bg-teal-50/50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-3 text-teal-800 dark:text-teal-300 group ${isScanningImages ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {isScanningImages ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block text-slate-800 dark:text-white">
                      {isHindi ? 'कैमरे से फोटो खींचें' : 'Take Photo'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isHindi ? 'लाइव फोटो लें (एआई सुरक्षा जांच सहित)' : 'Snap live photo (AI safety scan active)'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Photo preview gallery with AI Verified Badges */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group shadow-xs">
                      <img src={url} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
                        title={isHindi ? 'फोटो हटाएं' : 'Remove photo'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-slate-950/80 backdrop-blur-xs text-[9px] text-white px-1.5 py-0.5 rounded-sm font-semibold">
                          {isHindi ? 'कवर फोटो' : 'Cover Photo'}
                        </span>
                      )}
                      <span className="absolute bottom-1 right-1 bg-emerald-950/85 backdrop-blur-xs text-[9px] text-emerald-300 px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-0.5 border border-emerald-400/40">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>AI Safe</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: SELLER INFORMATION & PROTECTED CONTACT */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>5. Seller / Owner Contact (Protected)</span>
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    placeholder="Optional (e.g. name@gmail.com)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON WITH 5-MINUTES RATE LIMIT ENFORCEMENT */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 space-y-1">
                <div>⚡ Instant Live Listing • Free to list • Direct buyer inquiries via Inbox</div>
                <div className="text-[11px] text-slate-400">
                  <span>{isHindi ? 'सबमिट करके आप हमारी ' : 'By listing, you agree to our '}</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalPolicy?.('listing_policy')}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    {isHindi ? 'प्रॉपर्टी लिस्टिंग नीति' : 'Listing Policy'}
                  </button>
                  <span> {isHindi ? 'व ' : '& '}</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalPolicy?.('seller_agreement')}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    {isHindi ? 'विक्रेता अनुबंध' : 'Seller Agreement'}
                  </button>
                  <span> {isHindi ? 'से सहमत हैं।' : '.'}</span>
                </div>
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
                  disabled={cooldownRemaining > 0 || isScanningImages}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                    cooldownRemaining > 0 || isScanningImages
                      ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  }`}
                >
                  {isScanningImages ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>{isHindi ? 'एआई फोटो सुरक्षा जांच जारी...' : 'AI Photo Safety Scan...'}</span>
                    </>
                  ) : cooldownRemaining > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Wait {cooldownFormatted} to Upload</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{isHindi ? 'बिक्री हेतु प्रॉपर्टी लिस्ट करें' : 'List Property for Sale'}</span>
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
