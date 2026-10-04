import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Upload, 
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
  AlertTriangle,
  Video,
  Play,
  Trash2,
  Calculator,
  Film,
  Check
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
  'Rent/Lease',
];

export type AreaUnit = 
  | 'sqft' 
  | 'gaj' 
  | 'nali' 
  | 'mutthi' 
  | 'bigha' 
  | 'pbigha' 
  | 'biswa' 
  | 'acre' 
  | 'hectare' 
  | 'sqmeter' 
  | 'guntha' 
  | 'katha' 
  | 'kanal' 
  | 'marla';

const AREA_UNITS: { value: AreaUnit; labelEn: string; labelHi: string; toSqFt: number }[] = [
  { value: 'sqft', labelEn: 'Sq.Ft (Square Feet)', labelHi: 'वर्ग फुट (Sq.Ft)', toSqFt: 1 },
  { value: 'gaj', labelEn: 'Gaj (Square Yards)', labelHi: 'गज (Square Yards)', toSqFt: 9 },
  { value: 'nali', labelEn: 'Nali (UK Hill Land = 2,160 sq.ft)', labelHi: 'नाली (उत्तराखंड पहाड़ी = 2,160 Sq.Ft)', toSqFt: 2160 },
  { value: 'mutthi', labelEn: 'Mutthi (1/16 Nali = 135 sq.ft)', labelHi: 'मुट्ठी (1/16 नाली = 135 Sq.Ft)', toSqFt: 135 },
  { value: 'bigha', labelEn: 'UK Hill Bigha (4 Nali = 8,640 sq.ft)', labelHi: 'पहाड़ी बीघा (4 नाली = 8,640 Sq.Ft)', toSqFt: 8640 },
  { value: 'pbigha', labelEn: 'Plains Bigha (27,000 sq.ft)', labelHi: 'मैदानी बीघा (27,000 Sq.Ft)', toSqFt: 27000 },
  { value: 'biswa', labelEn: 'Biswa (1/20 Bigha = 432 sq.ft)', labelHi: 'बिस्वा (432 Sq.Ft)', toSqFt: 432 },
  { value: 'acre', labelEn: 'Acre (एकड़ = 43,560 sq.ft)', labelHi: 'एकड़ (Acre = 43,560 Sq.Ft)', toSqFt: 43560 },
  { value: 'hectare', labelEn: 'Hectare (हेक्टेयर = 1,07,639 sq.ft)', labelHi: 'हेक्टेयर (Hectare)', toSqFt: 107639 },
  { value: 'sqmeter', labelEn: 'Sq.Meter (वर्ग मीटर = 10.76 sq.ft)', labelHi: 'वर्ग मीटर (Sq.Meter)', toSqFt: 10.7639 },
  { value: 'guntha', labelEn: 'Guntha (गुंठा = 1,089 sq.ft)', labelHi: 'गुंठा (Guntha = 1,089 Sq.Ft)', toSqFt: 1089 },
  { value: 'katha', labelEn: 'Katha (कट्ठा = 1,361 sq.ft)', labelHi: 'कट्ठा (Katha = 1,361 Sq.Ft)', toSqFt: 1361 },
  { value: 'kanal', labelEn: 'Kanal (कनाल = 5,445 sq.ft)', labelHi: 'कनाल (Kanal = 5,445 Sq.Ft)', toSqFt: 5445 },
  { value: 'marla', labelEn: 'Marla (मरला = 272.25 sq.ft)', labelHi: 'मरला (Marla = 272.25 Sq.Ft)', toSqFt: 272.25 },
];

export type PricingMode = 
  | 'total' 
  | 'rate_nali' 
  | 'rate_mutthi' 
  | 'rate_gaj' 
  | 'rate_sqft' 
  | 'rate_bigha' 
  | 'rate_pbigha' 
  | 'rate_biswa' 
  | 'rate_acre' 
  | 'rate_hectare' 
  | 'rate_sqmeter' 
  | 'rate_guntha' 
  | 'rate_katha' 
  | 'rate_kanal' 
  | 'rate_marla' 
  | 'monthly_rent' 
  | 'yearly_lease';

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

const COOLDOWN_DURATION_SECONDS = 0; // Immediate listing without artificial delays

export const UploadPropertyModal: React.FC<UploadPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyUploaded,
  lastUploadTime,
  onUpdateLastUploadTime,
  onOpenLegalPolicy,
}) => {
  const { currentUser } = useAuth();
  const { isHindi } = useLanguage();

  // Cooldown timer state
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    const checkCooldown = () => {
      try {
        const savedTime = lastUploadTime || parseInt(localStorage.getItem('uk_gateways_last_upload_time') || '0', 10);
        if (savedTime > 0) {
          const elapsed = Math.floor((Date.now() - savedTime) / 1000);
          if (elapsed < COOLDOWN_DURATION_SECONDS) {
            setCooldownRemaining(COOLDOWN_DURATION_SECONDS - elapsed);
          } else {
            setCooldownRemaining(0);
          }
        }
      } catch {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastUploadTime, isOpen]);

  // Form states - completely BLANK initial inputs (no auto-prefilled amounts)
  const [title, setTitle] = useState('');
  const [taglineInput, setTaglineInput] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('Residential');
  const [type, setType] = useState<PropertyType>('Villa');
  const [city, setCity] = useState<UttarakhandCity>('Dehradun');
  const [locationAddress, setLocationAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  
  // Area with unit selection
  const [areaValue, setAreaValue] = useState<string>('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqft');

  // Pricing: 1 option for Total Price, 1 text box for Rate Per {unit} with unit dropdown
  const [totalPriceInput, setTotalPriceInput] = useState<string>('');
  const [ratePerUnitInput, setRatePerUnitInput] = useState<string>('');
  const [pricingUnit, setPricingUnit] = useState<AreaUnit>('nali');
  const [isAvailableForRent, setIsAvailableForRent] = useState<boolean>(false);

  const [bedrooms, setBedrooms] = useState<number>(0);
  const [bathrooms, setBathrooms] = useState<number>(0);
  const [facing, setFacing] = useState('');
  const [possession, setPossession] = useState<string>('');
  const [reraStatus, setReraStatus] = useState<string>('');
  const [reraId, setReraId] = useState('');
  
  // Himalayan view is completely OPTIONAL
  const [himalayanPeakView, setHimalayanPeakView] = useState(false);
  const [peakName, setPeakName] = useState('');
  const [altitudeMsl, setAltitudeMsl] = useState('');
  
  const [description, setDescription] = useState('');

  // Amenities start EMPTY (only entered what user ticks)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Video Tour option
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoLinkInput, setVideoLinkInput] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  // AI Content Moderation & Safety Detection States
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

  // Unit conversions & area calculations
  const enteredAreaNum = parseFloat(areaValue) || 0;
  const currentUnitConversion = AREA_UNITS.find((u) => u.value === areaUnit)?.toSqFt || 1;
  const numericAreaSqFt = Math.round(enteredAreaNum * currentUnitConversion);

  const handleTotalPriceChange = (val: string) => {
    setTotalPriceInput(val);
    const numTotal = parseFloat(val) || 0;
    const unitSqFt = AREA_UNITS.find((u) => u.value === pricingUnit)?.toSqFt || 2160;
    if (numTotal > 0 && numericAreaSqFt > 0) {
      const unitsInProp = numericAreaSqFt / unitSqFt;
      setRatePerUnitInput(Math.round(numTotal / unitsInProp).toString());
    } else if (!val) {
      setRatePerUnitInput('');
    }
  };

  const handleRatePerUnitChange = (val: string) => {
    setRatePerUnitInput(val);
    const numRate = parseFloat(val) || 0;
    const unitSqFt = AREA_UNITS.find((u) => u.value === pricingUnit)?.toSqFt || 2160;
    if (numRate > 0 && numericAreaSqFt > 0) {
      const unitsInProp = numericAreaSqFt / unitSqFt;
      setTotalPriceInput(Math.round(numRate * unitsInProp).toString());
    } else if (!val) {
      setTotalPriceInput('');
    }
  };

  const handlePricingUnitChange = (newUnit: AreaUnit) => {
    setPricingUnit(newUnit);
    const numTotal = parseFloat(totalPriceInput) || 0;
    const unitSqFt = AREA_UNITS.find((u) => u.value === newUnit)?.toSqFt || 2160;
    if (numTotal > 0 && numericAreaSqFt > 0) {
      const unitsInProp = numericAreaSqFt / unitSqFt;
      setRatePerUnitInput(Math.round(numTotal / unitsInProp).toString());
    } else if (ratePerUnitInput && numericAreaSqFt > 0) {
      const numRate = parseFloat(ratePerUnitInput) || 0;
      setTotalPriceInput(Math.round(numRate * (numericAreaSqFt / unitSqFt)).toString());
    }
  };

  // Calculate total price based on active inputs
  const calculatedTotalPrice = useMemo(() => {
    const fromTotal = parseFloat(totalPriceInput);
    if (!isNaN(fromTotal) && fromTotal > 0) return fromTotal;
    const fromRate = parseFloat(ratePerUnitInput);
    const unitSqFt = AREA_UNITS.find((u) => u.value === pricingUnit)?.toSqFt || 2160;
    if (!isNaN(fromRate) && fromRate > 0 && numericAreaSqFt > 0) {
      return Math.round(fromRate * (numericAreaSqFt / unitSqFt));
    }
    return 0;
  }, [totalPriceInput, ratePerUnitInput, pricingUnit, numericAreaSqFt]);

  // Derived rates across key units
  const ratePerSqFt = numericAreaSqFt > 0 ? Math.round(calculatedTotalPrice / numericAreaSqFt) : 0;
  const ratePerGaj = numericAreaSqFt > 0 ? Math.round(calculatedTotalPrice / (numericAreaSqFt / 9)) : 0;
  const ratePerNali = numericAreaSqFt > 0 ? Math.round(calculatedTotalPrice / (numericAreaSqFt / 2160)) : 0;
  const ratePerMutthi = numericAreaSqFt > 0 ? Math.round(calculatedTotalPrice / (numericAreaSqFt / 135)) : 0;
  const ratePerBigha = numericAreaSqFt > 0 ? Math.round(calculatedTotalPrice / (numericAreaSqFt / 8640)) : 0;
  const ratePerAcre = numericAreaSqFt > 0 ? Math.round(calculatedTotalPrice / (numericAreaSqFt / 43560)) : 0;

  // Parse comma-separated taglines (max 7)
  const parsedTags = useMemo(() => {
    return taglineInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 7);
  }, [taglineInput]);

  if (!isOpen) return null;

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
        const compressedBase64 = await compressAndNormalizeImage(file, 1200, 0.8);
        const modResult = await moderateImageWithAI(compressedBase64, file.name);

        if (modResult.isSafe && !modResult.isNSFW) {
          approvedBatch.push(compressedBase64);
        } else {
          blockedBatch.push({
            filename: file.name,
            reason: modResult.reason || 'Content did not meet real estate image safety standards.',
          });
        }
      } catch (err) {
        console.warn('Scan skipped or failed for file:', file.name, err);
        const fallbackBase64 = await compressAndNormalizeImage(file, 1200, 0.8);
        approvedBatch.push(fallbackBase64);
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

  // Video File handler
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert(isHindi ? 'कृपया एक मान्य वीडियो फाइल चुनें (.mp4, .mov, .webm)' : 'Please select a valid video file (.mp4, .mov, .webm)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setVideoUrl(result);
      }
    };
    reader.readAsDataURL(file);
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
      : [];

    // STRICT: Only save what user entered. NO auto-injected fake defaults!
    const effectiveVideoUrl = videoUrl.trim() || videoLinkInput.trim() || undefined;

    const newProperty: Property = {
      id: `user-prop-${Date.now()}`,
      title: title.trim() || `${type} in ${city}`,
      tagline: parsedTags.join(' • '),
      type,
      category,
      price: calculatedTotalPrice,
      priceDisplay: (type === 'Rent/Lease' || isAvailableForRent)
        ? `${formatIndianCurrency(calculatedTotalPrice)} / month` 
        : formatIndianCurrency(calculatedTotalPrice),
      ratePerSqFt: ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString('en-IN')} / sq.ft` : undefined,
      ratePerGajOrNali: ratePerNali > 0 ? `₹${formatIndianCurrency(ratePerNali)} / Nali` : undefined,
      location: locationAddress.trim() ? `${locationAddress.trim()}, ${city}` : city,
      city,
      region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
      altitudeMsl: altitudeMsl.trim() || undefined,
      areaSqFt: numericAreaSqFt,
      areaDisplay: `${numericAreaSqFt.toLocaleString('en-IN')} sq.ft${areaUnit !== 'sqft' ? ` (${enteredAreaNum} ${AREA_UNITS.find((u) => u.value === areaUnit)?.labelEn.split(' ')[0]})` : ''}`,
      areaUnit,
      pricingUnit,
      configuration: type === 'Plot' || type === 'Land' 
        ? `${numericAreaSqFt} sq.ft Plot` 
        : bedrooms > 0 ? `${bedrooms} BHK ${type}` : type,
      bedrooms: type === 'Plot' || type === 'Land' ? 0 : bedrooms,
      bathrooms: type === 'Plot' || type === 'Land' ? 0 : bathrooms,
      facing: facing.trim() || undefined,
      possession: possession.trim() || undefined,
      reraStatus: reraStatus.trim() || undefined,
      reraId: reraId.trim() || undefined,
      coordinates,
      himalayanPeakView: Boolean(himalayanPeakView && peakName.trim()),
      peakName: (himalayanPeakView && peakName.trim()) ? peakName.trim() : undefined,
      images: finalImages,
      videoUrl: effectiveVideoUrl,
      description: description.trim(),
      highlights: parsedTags,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : [],
      legalStatus: reraStatus.trim() || undefined,
      featured: false,
      sellerName: sellerName.trim() || currentUser?.username || 'Direct Property Owner',
      sellerPhone: sellerPhone.trim() || (currentUser?.contactType === 'phone' ? currentUser.contact : undefined),
      sellerEmail: sellerEmail.trim() || (currentUser?.contactType === 'email' ? currentUser.contact : undefined),
      sellerType,
      ownerId: currentUser?.id,
      ownerContact: currentUser?.contact,
      ownerUsername: currentUser?.username,
      isSold: false,
      isAvailableForRent: Boolean(isAvailableForRent || type === 'Rent/Lease'),
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
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#07241a] rounded-3xl shadow-2xl border-2 border-emerald-400 dark:border-emerald-700 flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-green-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/20">
                <Building2 className="w-5 h-5 text-emerald-200" />
              </span>
              <h3 className="text-lg sm:text-xl font-black tracking-tight">
                {isHindi ? 'अपनी संपत्ति लिस्ट करें (0% ब्रोकरेज)' : 'List Your Property (0% Brokerage)'}
              </h3>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              {isHindi 
                ? 'सीधे खरीदारों से जुड़ें। कोई बिचौलिया या कमीशन नहीं।' 
                : 'Direct to serious buyers across Uttarakhand with verified owner badge.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cooldown Warning Banner */}
        {cooldownRemaining > 0 && (
          <div className="p-3 bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {isHindi 
                ? `स्पैम सुरक्षा: अगली लिस्टिंग हेतु कृपया ${Math.floor(cooldownRemaining / 60)} मिनट ${cooldownRemaining % 60} सेकंड प्रतीक्षा करें।` 
                : `Spam protection: Next upload available in ${Math.floor(cooldownRemaining / 60)}m ${cooldownRemaining % 60}s.`}
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {formSubmitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                {isHindi ? 'प्रॉपर्टी सफलतापूर्वक लिस्ट हो गई!' : 'Property Listed Successfully!'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {isHindi 
                  ? 'आपकी संपत्ति अब लाइव है और खरीदार सीधे इनबॉक्स के माध्यम से आपसे संपर्क कर सकते हैं।' 
                  : 'Your property is now live in the marketplace with 0% brokerage.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: BASIC DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>1. Basic Property Details</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 3 BHK Luxury Himalayan View Cottage / Freehold Residential Plot"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
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

                {/* Optional Taglines / Highlights */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Key Features / Highlights (Comma separated, Optional)</span>
                    <span className="text-[11px] text-slate-400">{parsedTags.length}/7</span>
                  </label>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="e.g. 20ft Road, Clear Title, Spring Water, Corner Plot"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {parsedTags.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span>{tag}</span>
                          <button type="button" onClick={() => handleRemoveTag(idx)} className="text-emerald-600 hover:text-emerald-800">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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

                {/* Area Input with EVERY Land Unit to Enter */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-emerald-200">
                      Property Area & Unit * (Enter in Any Unit)
                    </label>
                    {numericAreaSqFt > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        = {numericAreaSqFt.toLocaleString('en-IN')} Sq.Ft (≈ {(numericAreaSqFt / 9).toFixed(0)} Gaj • {(numericAreaSqFt / 2160).toFixed(2)} Nali)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        value={areaValue}
                        onChange={(e) => setAreaValue(e.target.value)}
                        placeholder="Enter area number (e.g. 240, 2, 2400)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <select
                        value={areaUnit}
                        onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {AREA_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {isHindi ? u.labelHi : u.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                      <option value={0}>0 (Plot / Studio / Commercial)</option>
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
                      <option value={0}>0 (Plot / None)</option>
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
                      placeholder="e.g. North-East, East"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Altitude MSL (Optional)
                    </label>
                    <input
                      type="text"
                      value={altitudeMsl}
                      onChange={(e) => setAltitudeMsl(e.target.value)}
                      placeholder="e.g. 6,200 ft MSL (Optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PRICING (COMPACT: 1 TOTAL PRICE + 1 RATE PER UNIT WITH DROPDOWN + RENT TOGGLE) */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{isHindi ? '3. मूल्य निर्धारण (Pricing)' : '3. Pricing'}</span>
                  </h4>
                  {calculatedTotalPrice > 0 && (
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                      {formatIndianCurrency(calculatedTotalPrice)} {isAvailableForRent || type === 'Rent/Lease' ? (isHindi ? '/ माह' : '/ month') : ''}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Total Asking Price */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {isHindi ? 'कुल मांग मूल्य (Total Price ₹)' : 'Total Price (₹)'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={totalPriceInput}
                          onChange={(e) => handleTotalPriceChange(e.target.value)}
                          placeholder={isHindi ? 'कुल राशि दर्ज करें...' : 'Enter total price in ₹...'}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Option 2: Rate Per {unit} with Unit Dropdown */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {isHindi 
                            ? `दर प्रति ${AREA_UNITS.find(u => u.value === pricingUnit)?.labelHi.split(' ')[0] || 'इकाई'} (₹)` 
                            : `Rate Per ${AREA_UNITS.find(u => u.value === pricingUnit)?.labelEn.split(' ')[0] || 'Unit'} (₹)`}
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Unit:</span>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={ratePerUnitInput}
                            onChange={(e) => handleRatePerUnitChange(e.target.value)}
                            placeholder={`Rate / ${AREA_UNITS.find(u => u.value === pricingUnit)?.labelEn.split(' ')[0]}`}
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <select
                          value={pricingUnit}
                          onChange={(e) => handlePricingUnitChange(e.target.value as AreaUnit)}
                          className="w-28 px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          {AREA_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.labelEn.split(' ')[0]} ({u.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Rent Toggle inside seller form */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                        {isHindi ? 'किराये / लीज हेतु भी उपलब्ध (Available for Rent)' : 'Available for Rent / Lease'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {isHindi 
                          ? 'चालू करने पर यह संपत्ति रेंट एवं लीज ग्रुप में भी प्रदर्शित होगी।' 
                          : 'When enabled, this property will also be displayed in the Rent/Lease group.'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isAvailableForRent || type === 'Rent/Lease'}
                        onChange={(e) => setIsAvailableForRent(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Dynamic Rate Summary across All Units */}
                  {calculatedTotalPrice > 0 && numericAreaSqFt > 0 && (
                    <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60 flex flex-wrap gap-x-3 gap-y-1">
                      <div>Rate/Nali: <strong className="text-emerald-700 dark:text-emerald-300">₹{ratePerNali.toLocaleString('en-IN')}</strong></div>
                      <div>Rate/Gaj: <strong className="text-emerald-700 dark:text-emerald-300">₹{ratePerGaj.toLocaleString('en-IN')}</strong></div>
                      <div>Rate/Sq.Ft: <strong className="text-emerald-700 dark:text-emerald-300">₹{ratePerSqFt.toLocaleString('en-IN')}</strong></div>
                      <div>Rate/Acre: <strong className="text-emerald-700 dark:text-emerald-300">₹{ratePerAcre.toLocaleString('en-IN')}</strong></div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: PROPERTY PHOTOS & PROPERTY VIDEO UPLOAD */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>4. Property Photos & Video</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {imageUrls.length} photos added
                  </span>
                </div>

                {/* AI Content Moderation & Safety Shield Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/80 flex items-start gap-3 text-xs text-slate-700 dark:text-emerald-200 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {isHindi ? 'एआई सामग्री सुरक्षा एवं एनएसएफडब्ल्यू (NSFW) फ़िल्टर' : 'Automated AI Content Safety & NSFW Filter Active'}
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
                        {isHindi ? 'तस्वीर की एआई सुरक्षा जांच जारी है...' : 'AI Safety & NSFW Scan in Progress...'}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate block mt-0.5">
                        {scanProgress 
                          ? (isHindi 
                              ? `फोटो ${scanProgress.current} / ${scanProgress.total} का विश्लेषण हो रहा है (${scanProgress.filename || ''})...` 
                              : `Analyzing photo ${scanProgress.current} of ${scanProgress.total} (${scanProgress.filename || ''}) with AI safety filters...`)
                          : (isHindi 
                              ? 'सुरक्षा व सामग्री की पुष्टि की जा रही है...' 
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
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />

                {/* Action Buttons: Gallery, Camera & Video Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={isScanningImages}
                    onClick={() => galleryInputRef.current?.click()}
                    className={`p-3.5 rounded-2xl border-2 border-dashed border-emerald-500/60 hover:border-emerald-600 bg-emerald-50/50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2.5 text-emerald-800 dark:text-emerald-300 group ${isScanningImages ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      {isScanningImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-xs sm:text-sm font-bold block text-slate-800 dark:text-white truncate">
                        {isHindi ? 'गैलरी फोटो' : 'Upload Photos'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {isHindi ? 'तस्वीरें जोड़ें' : 'JPG/PNG images'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={isScanningImages}
                    onClick={() => cameraInputRef.current?.click()}
                    className={`p-3.5 rounded-2xl border-2 border-dashed border-teal-500/60 hover:border-teal-600 bg-teal-50/50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2.5 text-teal-800 dark:text-teal-300 group ${isScanningImages ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-xs sm:text-sm font-bold block text-slate-800 dark:text-white truncate">
                        {isHindi ? 'लाइव फोटो' : 'Take Photo'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {isHindi ? 'कैमरे से लें' : 'Snap with camera'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="p-3.5 rounded-2xl border-2 border-dashed border-amber-500/60 hover:border-amber-600 bg-amber-50/50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2.5 text-amber-800 dark:text-amber-300 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-xs sm:text-sm font-bold block text-slate-800 dark:text-white truncate">
                        {isHindi ? 'वीडियो अपलोड' : 'Upload Video'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {videoUrl ? (isHindi ? '✓ वीडियो जोड़ा गया' : '✓ Video added') : (isHindi ? 'MP4 / MOV टूर' : 'MP4/MOV walkthrough')}
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

                {/* VIDEO UPLOAD OPTION */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-emerald-200 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'प्रॉपर्टी वीडियो / वर्चुअल टूर (वैकल्पिक)' : 'Property Video / Virtual Tour (Optional)'}</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      Video Tour
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-slate-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'वीडियो फाइल अपलोड करें (.mp4)' : 'Upload Video File (.mp4)'}</span>
                    </button>

                    <div className="flex-1">
                      <input
                        type="url"
                        value={videoLinkInput}
                        onChange={(e) => setVideoLinkInput(e.target.value)}
                        placeholder={isHindi ? 'या यूट्यूब/ड्राइव वीडियो लिंक पेस्ट करें...' : 'Or paste YouTube / Drive / Cloud video link...'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {videoUrl && (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-black aspect-video max-w-sm">
                      <video src={videoUrl} controls className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setVideoUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
                        title="Remove video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: AMENITIES (CHECKBOXES ONLY WHAT USER SELECTS) */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>5. Select Amenities (Optional - Only chosen ones will be added)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">{selectedAmenities.length} selected</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-100/80 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 6: SELLER INFORMATION & PROTECTED CONTACT */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
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
                    Full Property Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter any additional details about your property..."
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
                        ? 'bg-slate-400 dark:bg-slate-700 text-white cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isScanningImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scanning Photos...</span>
                      </>
                    ) : cooldownRemaining > 0 ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Wait {Math.floor(cooldownRemaining / 60)}m {cooldownRemaining % 60}s</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{isHindi ? 'प्रॉपर्टी तुरंत लाइव करें' : 'Publish Listing Now'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
