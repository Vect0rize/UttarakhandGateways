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
  Check,
  Plus,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { Property, PropertyCategory, PropertyType, UttarakhandCity } from '../types';
import { CITIES } from '../data/properties';
import { IMPORTANT_AMENITIES } from '../data/amenities';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { compressAndNormalizeImage, moderateImageWithAI } from '../utils/imageModeration';
import { formatEnhancedDescription } from '../utils/descriptionEnhancer';
import { 
  ShieldAlert 
} from 'lucide-react';

import { LegalPolicyId } from '../data/legalPolicies';
import {
  AREA_UNITS,
  AreaUnit,
  formatAreaValueWithUnit,
  getAreaUnitShortLabel,
  isLandOrPlotType,
} from '../utils/areaUnits';

export type { AreaUnit };

interface UploadPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyUploaded: (property: Property) => void;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (timestamp: number) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
  initialSellerType?: 'Owner' | 'Broker';
}

const CATEGORY_OPTIONS: PropertyCategory[] = [
  'Residential',
  'Commercial',
  'Agriculture',
];

const TYPE_OPTIONS: PropertyType[] = [
  'House',
  'Villa',
  'Flat',
  'Apartment',
  'Plot',
  'Cottage',
  'Farmhouse',
  'Shop',
  'Showroom',
  'Office',
  'Hotel',
  'Resort',
  'Studio',
  'Penthouse',
  'Duplex',
  'Land',
  'PG',
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
];

const COOLDOWN_DURATION_SECONDS = 0; // Immediate listing without artificial delays

export const UploadPropertyModal: React.FC<UploadPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyUploaded,
  lastUploadTime,
  onUpdateLastUploadTime,
  onOpenLegalPolicy,
  initialSellerType = 'Owner',
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

  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [facing, setFacing] = useState('');
  const [possession, setPossession] = useState<string>('');
  const [reraStatus, setReraStatus] = useState<string>('');
  const [reraId, setReraId] = useState('');
  
  // Himalayan view is completely OPTIONAL
  const [himalayanPeakView, setHimalayanPeakView] = useState(false);
  const [peakName, setPeakName] = useState('');
  const [altitudeMsl, setAltitudeMsl] = useState('');

  // Uttarakhand Hill Infrastructure & Legal Verification
  const [roadAccess, setRoadAccess] = useState('20 ft Motorable Road');
  const [bhooKanoonStatus, setBhooKanoonStatus] = useState('Section 143 Converted (All-India Outsider Eligible)');
  const [waterSource, setWaterSource] = useState('Jal Sansthan Connection & Spring Line');
  const [homestaySubsidyEligible, setHomestaySubsidyEligible] = useState(true);
  
  const [description, setDescription] = useState('');
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [prevDescription, setPrevDescription] = useState<string | null>(null);
  const [descEnhanceNotice, setDescEnhanceNotice] = useState<string | null>(null);

  // Configuration & Amenities state
  const [furnishing, setFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Semi-Furnished');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState<string>('');
  const [customAmenitiesList, setCustomAmenitiesList] = useState<string[]>([]);
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
  const [sellerName, setSellerName] = useState(currentUser?.username || '');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerType, setSellerType] = useState<'Owner' | 'Broker'>(initialSellerType || 'Owner');

  useEffect(() => {
    if (initialSellerType) {
      setSellerType(initialSellerType);
    }
  }, [initialSellerType]);

  useEffect(() => {
    if (currentUser?.username && (!sellerName.trim() || sellerName.trim().toLowerCase() === 'amit1986.delhi')) {
      setSellerName(currentUser.username);
    }
  }, [currentUser?.username]);


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
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    if (!customAmenitiesList.includes(trimmed) && !selectedAmenities.includes(trimmed)) {
      setCustomAmenitiesList((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput('');
  };

  const handleRemoveCustomAmenity = (item: string) => {
    setCustomAmenitiesList((prev) => prev.filter((a) => a !== item));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const newTags = parsedTags.filter((_, idx) => idx !== indexToRemove);
    setTaglineInput(newTags.join(', '));
  };

  const handleEnhanceDescription = async () => {
    if (!description.trim() || isEnhancingDesc) return;
    if (description.trim().length < 5) {
      alert(isHindi ? 'कृपया सुधारने से पहले प्रॉपर्टी के बारे में कुछ विवरण लिखें।' : 'Please enter a few details about your property first before enhancing.');
      return;
    }

    setIsEnhancingDesc(true);
    setDescEnhanceNotice(null);

    const meta = {
      title: title.trim(),
      location: locationAddress.trim(),
      city: city.trim(),
      propertyType: category,
      amenities: selectedAmenities,
      language: isHindi ? 'hi' : 'en',
    };

    try {
      const res = await fetch('/api/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          ...meta,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data?.success && data?.enhancedDescription && data.enhancedDescription.trim() !== description.trim()) {
        setPrevDescription(description);
        setDescription(data.enhancedDescription);
        setDescEnhanceNotice(isHindi ? '✨ AI द्वारा प्रस्तुति सुधारी गई (कोई नई जानकारी नहीं जोड़ी गई)' : '✨ Presentation refined with AI (no extra info added)');
      } else {
        const clientEnhanced = formatEnhancedDescription(description.trim(), meta);
        setPrevDescription(description);
        setDescription(clientEnhanced);
        setDescEnhanceNotice(isHindi ? '✨ प्रस्तुति सुधारी गई (मुख्य बिंदु और प्रारूप)' : '✨ Presentation refined (structured highlights & layout)');
      }
    } catch {
      const clientEnhanced = formatEnhancedDescription(description.trim(), meta);
      setPrevDescription(description);
      setDescription(clientEnhanced);
      setDescEnhanceNotice(isHindi ? '✨ प्रस्तुति सुधारी गई (मुख्य बिंदु और प्रारूप)' : '✨ Presentation refined (structured highlights & layout)');
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(isHindi ? 'कृपया प्रॉपर्टी का शीर्षक दर्ज करें।' : 'Please enter a property title.');
      return;
    }

    if (!locationAddress.trim()) {
      alert(isHindi ? 'कृपया सटीक पता / स्थान दर्ज करें।' : 'Please enter the locality / specific address.');
      return;
    }

    if (enteredAreaNum <= 0) {
      alert(isHindi ? 'कृपया प्रॉपर्टी का वैध क्षेत्रफल दर्ज करें।' : 'Please enter a valid property area.');
      return;
    }

    if (calculatedTotalPrice <= 0) {
      alert(isHindi ? 'कृपया प्रॉपर्टी की कीमत दर्ज करें।' : 'Please enter the property price.');
      return;
    }

    if (!sellerName.trim()) {
      alert(isHindi ? 'कृपया विक्रेता का नाम दर्ज करें।' : 'Please enter the seller name.');
      return;
    }

    if (!sellerPhone.trim() || sellerPhone.trim().replace(/\D/g, '').length < 10) {
      alert(isHindi ? 'कृपया वैध 10-अंकीय संपर्क फ़ोन नंबर दर्ज करें (अनिवार्य)।' : 'Please enter a valid 10-digit contact phone number (Compulsory).');
      return;
    }

    if (!description.trim()) {
      alert(isHindi ? 'कृपया प्रॉपर्टी का विस्तृत विवरण दर्ज करें।' : 'Please enter the property description.');
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

    // Combine preset selected amenities + user custom added amenities (empty for Land/Plot)
    const isLandOrPlot = isLandOrPlotType(type);
    const combinedAmenities = isLandOrPlot
      ? []
      : Array.from(
          new Set([
            ...selectedAmenities,
            ...customAmenitiesList.map((a) => a.trim()).filter(Boolean)
          ])
        );

    const unitShortLabel = getAreaUnitShortLabel(areaUnit, false);
    const computedUnitRate = ratePerUnitInput.trim()
      ? parseFloat(ratePerUnitInput)
      : enteredAreaNum > 0 && calculatedTotalPrice > 0
      ? Math.round(calculatedTotalPrice / enteredAreaNum)
      : 0;

    const newProperty: Property = {
      id: `user-prop-${Date.now()}`,
      title: title.trim(),
      tagline: parsedTags.join(' • '),
      type,
      category,
      price: calculatedTotalPrice,
      priceDisplay: formatIndianCurrency(calculatedTotalPrice),
      ratePerSqFt: areaUnit === 'sqft' && ratePerSqFt > 0 ? `₹${ratePerSqFt.toLocaleString('en-IN')} / sq.ft` : undefined,
      ratePerGajOrNali: areaUnit !== 'sqft' && computedUnitRate > 0
        ? `₹${computedUnitRate.toLocaleString('en-IN')} / ${unitShortLabel}`
        : undefined,
      location: locationAddress.trim() || `${city}, Uttarakhand`,
      city,
      region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
      altitudeMsl: altitudeMsl.trim() || undefined,
      areaSqFt: numericAreaSqFt || 0,
      areaValue: enteredAreaNum || undefined,
      areaDisplay: formatAreaValueWithUnit(enteredAreaNum, areaUnit, false) || `${numericAreaSqFt.toLocaleString('en-IN')} Sq.Ft`,
      areaUnit,
      pricingUnit,
      configuration: '',
      bedrooms: isLandOrPlot ? 0 : (bedrooms || 0),
      bathrooms: isLandOrPlot ? 0 : (bathrooms || 1),
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
      furnishing: isLandOrPlot ? undefined : (furnishing || 'Unfurnished'),
      amenities: combinedAmenities,
      legalStatus: reraStatus.trim() || undefined,
      featured: false,
      sellerName: (sellerType === 'Owner' && currentUser?.username)
        ? currentUser.username
        : (sellerName.trim() || currentUser?.username || undefined),
      sellerPhone: sellerPhone.trim(),
      sellerType,
      ownerId: currentUser?.id,
      ownerContact: sellerPhone.trim() || currentUser?.contact,
      ownerUsername: currentUser?.username || sellerName.trim() || undefined,
      roadAccess: roadAccess.trim() || undefined,
      bhooKanoonStatus: bhooKanoonStatus.trim() || undefined,
      waterSource: waterSource.trim() || undefined,
      homestaySubsidyEligible,
      views: 0,
      shares: 0,
      inquiries: 0,
      isSold: false,
      isAvailableForRent: false,
      createdAt: new Date().toISOString(),
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
                ? 'अपनी संपत्ति लिस्ट करने हेतु कृपया अपने ईमेल (ओटीपी) से लॉगिन करें।' 
                : 'Please log in with your email via OTP to list a property.'}
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
                openAuthModal('login', isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (ओटीपी) से लॉगिन करें।' : 'Please log in with your email via OTP to list a property.');
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
            >
              {isHindi ? 'ईमेल OTP से लॉगिन' : 'Log In via Email OTP'}
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
                    placeholder="e.g. 3 BHK Luxury Cottage"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'श्रेणी *' : 'Category *'}
                    </label>
                    <select
                      required
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
                      {isHindi ? 'प्रकार *' : 'Property Type *'}
                    </label>
                    <select
                      required
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
                      {isHindi ? 'शहर / जिला *' : 'City / District *'}
                    </label>
                    <select
                      required
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
                    {isHindi ? 'सटीक पता / स्थान *' : 'Locality / Specific Address *'}
                  </label>
                  <input
                    type="text"
                    required
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
                  {!isLandOrPlotType(type) && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {isHindi ? 'कमरे (Bedrooms) *' : 'Bedrooms *'}
                        </label>
                        <select
                          required
                          value={bedrooms}
                          onChange={(e) => setBedrooms(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value={0}>Studio</option>
                          <option value={1}>1 BHK</option>
                          <option value={2}>2 BHK</option>
                          <option value={3}>3 BHK</option>
                          <option value={4}>4 BHK</option>
                          <option value={5}>5+ BHK</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          {isHindi ? 'बाथरूम (Baths) *' : 'Bathrooms *'}
                        </label>
                        <select
                          required
                          value={bathrooms || 1}
                          onChange={(e) => setBathrooms(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value={1}>1 Bath</option>
                          <option value={2}>2 Baths</option>
                          <option value={3}>3 Baths</option>
                          <option value={4}>4+ Baths</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className={isLandOrPlotType(type) ? 'col-span-2 sm:col-span-4' : 'col-span-2'}>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'क्षेत्रफल *' : 'Area *'}
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        required
                        value={areaValue}
                        onChange={(e) => handleAreaValueChange(e.target.value)}
                        placeholder={isHindi ? 'क्षेत्रफल दर्ज करें' : 'Enter area'}
                        className="w-full min-w-0 flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                      />
                      <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <select
                        value={areaUnit}
                        onChange={(e) => handleAreaUnitChange(e.target.value as AreaUnit)}
                        aria-label={isHindi ? 'क्षेत्रफल इकाई' : 'Area Unit'}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none cursor-pointer shrink-0"
                      >
                        {AREA_UNITS.map((u) => (
                          <option key={u.value} value={u.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            {isHindi ? u.labelHi : u.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Furnishing Status: Furnished / Semi-Furnished / Unfurnished (Hidden for Land/Plot) */}
                {!isLandOrPlotType(type) && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'फर्निशिंग स्थिति (Furnishing Status) *:' : 'Furnishing Status *:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Furnished', 'Semi-Furnished', 'Unfurnished'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFurnishing(status)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                            furnishing === status
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                          }`}
                        >
                          {furnishing === status && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          <span>
                            {status === 'Furnished' && (isHindi ? 'फर्निश्ड (Furnished)' : 'Furnished')}
                            {status === 'Semi-Furnished' && (isHindi ? 'सेमी-फर्निश्ड (Semi-Furnished)' : 'Semi-Furnished')}
                            {status === 'Unfurnished' && (isHindi ? 'अनफर्निश्ड (Unfurnished)' : 'Unfurnished')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                        {isHindi ? `दर प्रति ${getAreaUnitShortLabel(areaUnit, true)}` : `Rate Per ${getAreaUnitShortLabel(areaUnit, false)}`}
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

              {/* SECTION: UTTARAKHAND HILL & LEGAL INFRASTRUCTURE */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'पहाड़ी व भू-कानून अवसंरचना विवरण' : 'Uttarakhand Mountain & Legal Infrastructure'}</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    High Trust
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'सड़क संपर्क व चौड़ाई' : 'Road Access & Approach Width'}
                    </label>
                    <select
                      value={roadAccess}
                      onChange={(e) => setRoadAccess(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="20 ft Motorable Road">20 ft Motorable Road (20 फीट पक्की सड़क)</option>
                      <option value="15 ft Paved Road">15 ft Paved Road (15 फीट संपर्क मार्ग)</option>
                      <option value="30 ft Double Lane Highway">30 ft Highway Frontage (राष्ट्रीय/राज्य राजमार्ग)</option>
                      <option value="12 ft Concrete Road">12 ft CC Road (12 फीट कंक्रीट मार्ग)</option>
                      <option value="Footpath Walking Access (100m)">Walking Access / 100m Footpath (पैदल मार्ग)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'भू-कानून व बाहरी व्यक्ति पात्रता (Sec 154 / 143)' : 'Bhoo-Kanoon & Outsider Quota'}
                    </label>
                    <select
                      value={bhooKanoonStatus}
                      onChange={(e) => setBhooKanoonStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Section 143 Converted (All-India Outsider Eligible)">Section 143 Converted (All-India Outsider Freehold)</option>
                      <option value="Within 250 Sq.M Limit (Outsider Allowed)">Within 250 Sq.M Legal Limit (Outsider Allowed)</option>
                      <option value="Commercial / Tourism Permitted">Commercial / Tourism Project Permitted</option>
                      <option value="Uttarakhand Resident / Domicile Only">Uttarakhand Resident / Domicile Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'जल स्रोत व आपूर्ति' : 'Water Supply Source'}
                    </label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Jal Sansthan Connection & Spring Line">Jal Sansthan Connection & Spring Line</option>
                      <option value="Natural Himalayan Spring (Gadhera / Chhan)">Natural Himalayan Spring (प्राकृतिक स्रोत)</option>
                      <option value="Borewell with Storage Tank">Borewell & Overhead Tank (बोरवेल व टंकी)</option>
                      <option value="Gravity Flow Alpine Pipeline">Gravity Flow Alpine Pipeline</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={homestaySubsidyEligible}
                        onChange={(e) => setHomestaySubsidyEligible(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                        {isHindi ? 'उत्तराखंड पर्यटन होमस्टे सब्सिडी योजना हेतु पात्र' : 'Eligible for Uttarakhand Tourism Homestay Subsidy'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PHOTOS & VIDEO */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>4. {isHindi ? 'फोटो व वीडियो टूर' : 'Photos & Video Tour'}</span>
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

              {/* SECTION 5: AMENITIES & FEATURES (Hidden for Land/Plot) */}
              {!isLandOrPlotType(type) && (
                <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>5. {isHindi ? 'प्रॉपर्टी की सुविधाएं एवं विशेषताएं' : 'Amenities & Property Features'}</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {selectedAmenities.length + customAmenitiesList.length} {isHindi ? 'चयनित' : 'selected'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isHindi
                      ? 'अपनी प्रॉपर्टी की सभी उपलब्ध सुविधाएं चुनें ताकि खरीदार सीधे आकर्षित हों:'
                      : 'Select all available amenities to highlight the best features of your property:'}
                  </p>

                  {/* Important Preset Amenities Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {IMPORTANT_AMENITIES.map((item) => {
                      const isSelected = selectedAmenities.includes(item.labelEn);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleAmenity(item.labelEn)}
                          className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold leading-snug truncate">{item.labelEn}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.labelHi}</div>
                          </div>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Amenity Adder */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isHindi ? 'अन्य कोई खास सुविधा जोड़ें (वैकल्पिक):' : 'Add Custom / Unique Amenity (Optional):'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customAmenityInput}
                        onChange={(e) => setCustomAmenityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomAmenity();
                          }
                        }}
                        placeholder={isHindi ? 'उदा. सेब का बगीचा, स्प्रिंग वाटर सोर्स, योगा डेक...' : 'e.g. Apple Orchard, Spring Water Source, Yoga Deck...'}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAmenity}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'जोड़ें' : 'Add'}</span>
                      </button>
                    </div>

                    {/* Custom Amenities Chips */}
                    {customAmenitiesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {customAmenitiesList.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                          >
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomAmenity(item)}
                              className="p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 6: SELLER INFO & DESCRIPTION */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>6. {isHindi ? 'विक्रेता संपर्क व विवरण' : 'Seller Contact & Description'}</span>
                </h4>

                {/* Seller Role Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'आपकी लिस्टिंग भूमिका (Seller Role):' : 'Listing Role (Seller Type):'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setSellerType('Owner')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        sellerType === 'Owner'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'सीधे मालिक (Owner)' : 'Direct Owner'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerType('Broker')}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        sellerType === 'Broker'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'एजेंट / ब्रोकर (Broker)' : 'Agent / Broker'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {sellerType === 'Broker'
                        ? (isHindi ? 'ब्रोकर / एजेंसी का नाम *' : 'Broker / Agency Name *')
                        : (isHindi ? 'मालिक का यूज़रनेम / नाम *' : 'Owner Username / Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder={currentUser?.username || "e.g. Ramesh Singh"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{isHindi ? 'संपर्क फ़ोन नंबर *' : 'Contact Phone Number *'}</span>
                      </span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Compulsory</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      placeholder="e.g. 9897123456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isHindi ? 'प्रॉपर्टी का विस्तृत विवरण *' : 'Full Property Description *'}
                    </label>
                    <div className="flex items-center gap-2">
                      {prevDescription && (
                        <button
                          type="button"
                          onClick={() => {
                            setDescription(prevDescription);
                            setPrevDescription(null);
                            setDescEnhanceNotice(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700 transition-all active:scale-95 cursor-pointer shadow-2xs"
                          title={isHindi ? 'विवरण में किए गए परिवर्तनों को पहले जैसा करें' : 'Revert AI changes to original description'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'पूर्ववत करें (Revert)' : 'Revert Changes'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleEnhanceDescription}
                        disabled={isEnhancingDesc || !description.trim()}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                          isEnhancingDesc
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 animate-pulse cursor-wait'
                            : !description.trim()
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-500 shadow-xs hover:shadow-md active:scale-95 cursor-pointer'
                        }`}
                        title={isHindi ? 'AI से विवरण की प्रस्तुति सुधारें (कोई नई जानकारी नहीं जोड़ी जाएगी)' : 'Enhance description presentation with AI (does not add extra info)'}
                      >
                        {isEnhancingDesc ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{isHindi ? 'सुधारा जा रहा है...' : 'Enhancing...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'AI से सुधारें' : 'Enhance with AI'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter key details about your property, road access, view, or layout..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                  {descEnhanceNotice && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{descEnhanceNotice}</span>
                      </span>
                      {prevDescription && (
                        <button
                          type="button"
                          onClick={() => {
                            setDescription(prevDescription);
                            setPrevDescription(null);
                            setDescEnhanceNotice(null);
                          }}
                          className="ml-2 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/80 font-bold inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                          title={isHindi ? 'परिवर्तन पूर्ववत करें' : 'Revert to original text'}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isHindi ? 'पूर्ववत करें' : 'Revert'}</span>
                        </button>
                      )}
                    </div>
                  )}
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
