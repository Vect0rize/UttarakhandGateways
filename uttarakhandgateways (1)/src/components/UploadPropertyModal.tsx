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
  'PG',
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
  'Water Supply',
  'Electricity Connection',
  'Dedicated Car Parking',
  '360° Mountain & Valley View',
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
  const { currentUser, openAuthModal } = useAuth();
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

  // Pricing: 1 option for Total Price, 1 optional text box for Rate Per {unit} (matching land area unit)
  const [totalPriceInput, setTotalPriceInput] = useState<string>('');
  const [ratePerUnitInput, setRatePerUnitInput] = useState<string>('');
  const pricingUnit = areaUnit; // Keep unit same as land area unit, no separate dropdown

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

  // Amenities: reduced presets + 5 custom text boxes
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<string[]>(['', '', '', '', '']);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Video Tour option (Direct video upload)
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  // AI Content Moderation & Safety Detection States
  const [isScanningImages, setIsScanningImages] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; filename?: string } | null>(null);
  const [blockedImages, setBlockedImages] = useState<Array<{ filename: string; reason: string }>>([]);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Seller information
  const [sellerName, setSellerName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerType, setSellerType] = useState<'Owner' | 'Broker'>('Owner');


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

  // Automatically calculate rate per unit whenever total price, area value, or unit changes
  useEffect(() => {
    const totalNum = parseFloat(totalPriceInput);
    const areaNum = parseFloat(areaValue);
    if (!isNaN(totalNum) && totalNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      const calculatedRate = Math.round(totalNum / areaNum);
      setRatePerUnitInput(calculatedRate.toString());
    } else if (!totalPriceInput.trim()) {
      setRatePerUnitInput('');
    }
  }, [totalPriceInput, areaValue, areaUnit]);

  const handleTotalPriceChange = (val: string) => {
    setTotalPriceInput(val);
    const totalNum = parseFloat(val);
    const areaNum = parseFloat(areaValue);
    if (!isNaN(totalNum) && totalNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      const autoRate = Math.round(totalNum / areaNum);
      setRatePerUnitInput(autoRate.toString());
    } else if (!val.trim()) {
      setRatePerUnitInput('');
    }
  };

  const handleAreaValueChange = (val: string) => {
    setAreaValue(val);
    const areaNum = parseFloat(val);
    const totalNum = parseFloat(totalPriceInput);
    if (!isNaN(totalNum) && totalNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      const autoRate = Math.round(totalNum / areaNum);
      setRatePerUnitInput(autoRate.toString());
    }
  };

  const handleAreaUnitChange = (newUnit: AreaUnit) => {
    setAreaUnit(newUnit);
    const totalNum = parseFloat(totalPriceInput);
    const areaNum = parseFloat(areaValue);
    if (!isNaN(totalNum) && totalNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      const autoRate = Math.round(totalNum / areaNum);
      setRatePerUnitInput(autoRate.toString());
    }
  };

  const handleRatePerUnitChange = (val: string) => {
    setRatePerUnitInput(val);
    const numRate = parseFloat(val);
    const areaNum = parseFloat(areaValue);
    if (!isNaN(numRate) && numRate > 0 && !isNaN(areaNum) && areaNum > 0) {
      setTotalPriceInput(Math.round(numRate * areaNum).toString());
    }
  };

  // Calculate total price based on active inputs
  const calculatedTotalPrice = useMemo(() => {
    const fromTotal = parseFloat(totalPriceInput);
    if (!isNaN(fromTotal) && fromTotal > 0) return fromTotal;
    const fromRate = parseFloat(ratePerUnitInput);
    if (!isNaN(fromRate) && fromRate > 0 && enteredAreaNum > 0) {
      return Math.round(fromRate * enteredAreaNum);
    }
    return 0;
  }, [totalPriceInput, ratePerUnitInput, enteredAreaNum]);

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

    if (!title.trim()) {
      alert(isHindi ? 'कृपया प्रॉपर्टी का शीर्षक दर्ज करें।' : 'Please enter a property title.');
      return;
    }

    if (calculatedTotalPrice <= 0) {
      alert(isHindi ? 'कृपया प्रॉपर्टी की कीमत दर्ज करें।' : 'Please enter the property price.');
      return;
    }

    // Check cooldown limit
    if (cooldownRemaining > 0) {
      return;
    }

    const finalImages = imageUrls.length > 0 
      ? imageUrls 
      : [];

    // STRICT: Only save what user entered. NO auto-injected fake defaults!
    const effectiveVideoUrl = videoUrl.trim() || undefined;

    // Combine preset selected amenities + user's 5 custom entered amenities
    const combinedAmenities = [
      ...selectedAmenities,
      ...customAmenities.map((a) => a.trim()).filter(Boolean)
    ];

    const newProperty: Property = {
      id: `user-prop-${Date.now()}`,
      title: title.trim(),
      tagline: parsedTags.join(' • '),
      type,
      category,
      price: calculatedTotalPrice,
      priceDisplay: formatIndianCurrency(calculatedTotalPrice),
      ratePerSqFt: ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString('en-IN')} / sq.ft` : undefined,
      ratePerGajOrNali: ratePerUnitInput.trim()
        ? `₹${parseFloat(ratePerUnitInput).toLocaleString('en-IN')} / ${AREA_UNITS.find((u) => u.value === areaUnit)?.labelEn.split(' ')[0]}`
        : (ratePerNali > 0 ? `₹${formatIndianCurrency(ratePerNali)} / Nali` : undefined),
      location: locationAddress.trim() || `${city}, Uttarakhand`,
      city,
      region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
      altitudeMsl: altitudeMsl.trim() || undefined,
      areaSqFt: numericAreaSqFt || 0,
      areaDisplay: `${numericAreaSqFt.toLocaleString('en-IN')} sq.ft${areaUnit !== 'sqft' ? ` (${enteredAreaNum} ${AREA_UNITS.find((u) => u.value === areaUnit)?.labelEn.split(' ')[0]})` : ''}`,
      areaUnit,
      pricingUnit,
      configuration: '',
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
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
      amenities: combinedAmenities,
      legalStatus: reraStatus.trim() || undefined,
      featured: false,
      sellerName: sellerName.trim() || undefined,
      sellerEmail: sellerEmail.trim() || undefined,
      sellerType,
      ownerId: currentUser?.id,
      ownerContact: currentUser?.contact,
      ownerUsername: currentUser?.username,
      isSold: false,
      isAvailableForRent: false,
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

  if (isOpen && !currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="w-full max-w-md bg-white dark:bg-[#07241a] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-400 dark:border-emerald-600 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु लॉगिन आवश्यक है' : 'Login Required to List Property'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {isHindi 
                ? 'अपनी संपत्ति लिस्ट करने हेतु कृपया अपने ईमेल या व्हाट्सएप नंबर (ओटीपी) से लॉगिन करें।' 
                : 'Please log in with your email or WhatsApp number via OTP to list a property.'}
            </p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal('login', isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल या व्हाट्सएप नंबर (ओटीपी) से लॉगिन करें।' : 'Please log in with your email or WhatsApp number via OTP to list a property.');
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
            >
              {isHindi ? 'व्हाट्सएप / ईमेल OTP से लॉगिन' : 'Log In via WhatsApp / Email OTP'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {isHindi ? 'अपनी संपत्ति लिस्ट करें' : 'List Your Property'}
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
                  : 'Your property is now live in the marketplace.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* PROMINENT OWNER VS BROKER CHOICE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    {isHindi ? 'आपकी पहचान (0% ब्रोकरेज)' : 'Listing As (0% Brokerage)'}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {sellerType === 'Owner' ? 'Direct Property Owner' : 'Verified Agent / Broker'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSellerType('Owner')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      sellerType === 'Owner'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'सीधे मालिक (Owner)' : 'Direct Owner'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSellerType('Broker')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      sellerType === 'Broker'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'एजेंट / ब्रोकर' : 'Agent / Broker'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: BASIC DETAILS */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>1. {isHindi ? 'मूलभूत विवरण' : 'Basic Property Details'}</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'प्रॉपर्टी का शीर्षक *' : 'Property Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 3 BHK Luxury Himalayan View Cottage"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'श्रेणी' : 'Category'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'प्रकार' : 'Property Type'}
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as PropertyType)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'शहर / जिला' : 'City / District'}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as UttarakhandCity)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'सटीक पता / स्थान' : 'Locality / Specific Address'}
                  </label>
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Camel's Back Road, Mussoorie"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 2: CONFIGURATION & AREA */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>2. {isHindi ? 'कॉन्फ़िगरेशन एवं क्षेत्रफल' : 'Configuration & Area'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'कमरे (Bedrooms)' : 'Bedrooms'}
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      disabled={type === 'Plot' || type === 'Land'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value={0}>0 (Plot / Studio)</option>
                      <option value={1}>1 BHK</option>
                      <option value={2}>2 BHK</option>
                      <option value={3}>3 BHK</option>
                      <option value={4}>4 BHK</option>
                      <option value={5}>5+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'बाथरूम (Baths)' : 'Bathrooms'}
                    </label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      disabled={type === 'Plot' || type === 'Land'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value={0}>0 (Plot)</option>
                      <option value={1}>1 Bath</option>
                      <option value={2}>2 Baths</option>
                      <option value={3}>3 Baths</option>
                      <option value={4}>4+ Baths</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'क्षेत्रफल मान *' : 'Area Value *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={areaValue}
                      onChange={(e) => handleAreaValueChange(e.target.value)}
                      placeholder="e.g. 2160"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'इकाई (Unit)' : 'Area Unit'}
                    </label>
                    <select
                      value={areaUnit}
                      onChange={(e) => handleAreaUnitChange(e.target.value as AreaUnit)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {AREA_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {isHindi ? u.labelHi : u.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {numericAreaSqFt > 0 && areaUnit !== 'sqft' && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>= <strong>{numericAreaSqFt.toLocaleString('en-IN')} sq.ft</strong> (Approx {Math.round(numericAreaSqFt / 9).toLocaleString('en-IN')} Gaj)</span>
                  </div>
                )}
              </div>

              {/* SECTION 3: PRICING */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>3. {isHindi ? 'कीमत एवं दर' : 'Pricing & Rate per Unit'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isHindi ? 'कुल मांग कीमत (₹) *' : 'Total Asking Price (₹) *'}
                      </label>
                      {calculatedTotalPrice > 0 && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          {formatIndianCurrency(calculatedTotalPrice)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        min="1"
                        required
                        value={totalPriceInput}
                        onChange={(e) => handleTotalPriceChange(e.target.value)}
                        placeholder="e.g. 4500000"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {isHindi ? `दर प्रति ${AREA_UNITS.find(u => u.value === areaUnit)?.labelHi.split(' ')[0] || 'यूनिट'}` : `Rate Per ${AREA_UNITS.find(u => u.value === areaUnit)?.labelEn.split(' ')[0] || 'Unit'}`}
                      </label>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                        Auto-calculated
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        value={ratePerUnitInput}
                        onChange={(e) => handleRatePerUnitChange(e.target.value)}
                        placeholder="Rate per unit"
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: HIGHLIGHTS & HIMALAYAN VIEW */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>4. {isHindi ? 'विशेषताएं एवं हिमालय दृश्य' : 'Features & Himalayan View'}</span>
                </h4>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={himalayanPeakView}
                      onChange={(e) => setHimalayanPeakView(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isHindi ? 'पर्वत / हिमालय दृश्य उपलब्ध (Snow Peak View)' : 'Himalayan / Mountain View Property'}
                    </span>
                  </label>

                  {himalayanPeakView && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {isHindi ? 'दिखने वाली चोटी (Peak Name)' : 'Visible Peak Name'}
                        </label>
                        <input
                          type="text"
                          value={peakName}
                          onChange={(e) => setPeakName(e.target.value)}
                          placeholder="e.g. Trishul, Nanda Devi, Kedarnath Range"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {isHindi ? 'ऊंचाई (Altitude MSL)' : 'Altitude (MSL)'}
                        </label>
                        <input
                          type="text"
                          value={altitudeMsl}
                          onChange={(e) => setAltitudeMsl(e.target.value)}
                          placeholder="e.g. 6,800 ft MSL"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'दिशा (Facing)' : 'Facing'}
                    </label>
                    <input
                      type="text"
                      value={facing}
                      onChange={(e) => setFacing(e.target.value)}
                      placeholder="e.g. North-East, Sun-Facing"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'कब्जा स्थिति (Possession)' : 'Possession'}
                    </label>
                    <input
                      type="text"
                      value={possession}
                      onChange={(e) => setPossession(e.target.value)}
                      placeholder="e.g. Ready to Move, Immediate"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'रेरा / टाइटल (RERA / Title)' : 'RERA / Legal Title'}
                    </label>
                    <input
                      type="text"
                      value={reraStatus}
                      onChange={(e) => setReraStatus(e.target.value)}
                      placeholder="e.g. Freehold / RERA Approved"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'टैगलाइन / मुख्य विशेषताएं (कॉमा से अलग करें)' : 'Highlights / Tags (comma separated, max 7)'}
                  </label>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="e.g. 143 Clear Registry, 20ft Wide Road, Pure Spring Water"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 5: AMENITIES */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>5. {isHindi ? 'सुविधाएं' : 'Amenities'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMMON_AMENITIES.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => handleToggleAmenity(amenity)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                      />
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 6: PHOTOS & VIDEO */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>6. {isHindi ? 'फोटो व वीडियो टूर' : 'Photos & Video Tour'}</span>
                </h4>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="file"
                    ref={galleryInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileSelect}
                    capture="environment"
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoSelect}
                    accept="video/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isScanningImages}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isHindi ? 'गैलरी से फोटो चुनें' : 'Upload Photos'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isScanningImages}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isHindi ? 'कैमरा से फोटो खींचें' : 'Take Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>{isHindi ? 'वीडियो टूर जोड़ें' : 'Upload Video Tour'}</span>
                  </button>
                </div>

                {isScanningImages && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>
                      {isHindi ? 'एआई सुरक्षा जांच जारी...' : 'AI Safety Scanning photos...'}
                      {scanProgress ? ` (${scanProgress.current}/${scanProgress.total})` : ''}
                    </span>
                  </div>
                )}

                {blockedImages.length > 0 && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-xl space-y-1">
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>{isHindi ? 'अस्वीकृत तस्वीरें:' : 'Blocked Images (Safety):'}</span>
                    </div>
                    {blockedImages.map((b, idx) => (
                      <p key={idx} className="text-[11px] text-rose-700 dark:text-rose-300">
                        • {b.filename}: {b.reason}
                      </p>
                    ))}
                  </div>
                )}

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-700">
                        <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                          title="Remove image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 7: SELLER INFO & DESCRIPTION */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>7. {isHindi ? 'मालिक का विवरण व विवरण' : 'Owner Contact & Description'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'मालिक / विक्रेता का नाम' : 'Owner / Seller Name'}
                    </label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder={currentUser?.username || "e.g. Ramesh Singh"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span>{isHindi ? 'ईमेल (वैकल्पिक)' : 'Email Address'}</span>
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
                    {isHindi ? 'प्रॉपर्टी का विस्तृत विवरण' : 'Full Property Description'}
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
