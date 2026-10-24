import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Image as ImageIcon, 
  Film, 
  Sparkles, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle,
  Upload,
  Video,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { Property, PropertyType, PropertyCategory, UttarakhandCity } from '../types';
import { CITIES, CATEGORIES } from '../data/properties';
import { POPULAR_AMENITIES } from '../data/amenities';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { moderateImageWithAI } from '../utils/imageModeration';
import {
  AREA_UNITS,
  AreaUnit,
  formatAreaValueWithUnit,
  getAreaUnitConfig,
  getAreaUnitShortLabel,
  getPropertyAreaInput,
  isLandOrPlotType,
} from '../utils/areaUnits';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPropertyUpdated: (updatedProperty: Property) => void;
}

const PROPERTY_TYPES: PropertyType[] = [
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
  'Rent',
  'Lease',
  'PG',
];

const PRESET_AMENITIES = POPULAR_AMENITIES.map((a) => a.labelEn);

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  onPropertyUpdated,
}) => {
  const { isHindi } = useLanguage();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('Residential');
  const [type, setType] = useState<PropertyType>('Villa');
  const [city, setCity] = useState<UttarakhandCity>('Dehradun');
  const [locationAddress, setLocationAddress] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [areaValue, setAreaValue] = useState<string>('1200');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqft');
  const [totalPriceInput, setTotalPriceInput] = useState<string>('7500000');
  const [ratePerUnitInput, setRatePerUnitInput] = useState<string>('');
  const [facing, setFacing] = useState('');
  const [possession, setPossession] = useState('');
  const [reraStatus, setReraStatus] = useState('');
  const [altitudeMsl, setAltitudeMsl] = useState('');
  const [description, setDescription] = useState('');
  const [isEnhancingDesc, setIsEnhancingDesc] = useState(false);
  const [prevDescription, setPrevDescription] = useState<string | null>(null);
  const [descEnhanceNotice, setDescEnhanceNotice] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [furnishing, setFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Semi-Furnished');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [otherAmenity, setOtherAmenity] = useState('');
  const [isSold, setIsSold] = useState(false);
  const [isAvailableForRent, setIsAvailableForRent] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerType, setSellerType] = useState<'Owner' | 'Broker' | 'Verified Builder' | 'Agent'>('Owner');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Revert all fields to original saved property values
  const resetFormToOriginal = () => {
    if (!property) return;
    setTitle(property.title || '');
    setTagline(property.tagline || '');
    setCategory(property.category || 'Residential');
    setType(property.type || 'Villa');
    setCity(property.city || 'Dehradun');
    setLocationAddress(property.location || '');
    setBedrooms(property.bedrooms ?? 2);
    setBathrooms(property.bathrooms ?? 2);
    
    const { areaValue: savedAreaVal, areaUnit: savedAreaUnit } = getPropertyAreaInput(property);
    const effectiveAreaVal = savedAreaVal > 0 ? savedAreaVal : 1200;
    setAreaValue(effectiveAreaVal.toString());
    setAreaUnit(savedAreaUnit);

    const priceNum = property.price || 0;
    setTotalPriceInput(priceNum.toString());
    if (effectiveAreaVal > 0 && priceNum > 0) {
      setRatePerUnitInput(Math.round(priceNum / effectiveAreaVal).toString());
    } else {
      setRatePerUnitInput('');
    }

    setFacing(property.facing || '');
    setPossession(property.possession || '');
    setReraStatus(property.reraStatus || '');
    setAltitudeMsl(property.altitudeMsl || '');
    setDescription(property.description || '');
    setPrevDescription(null);
    setDescEnhanceNotice(null);
    setImages(Array.isArray(property.images) ? [...property.images] : []);
    setVideoUrl(property.videoUrl || '');

    // Separate preset amenities from other amenity
    const currentAm = Array.isArray(property.amenities) ? property.amenities : [];
    const presets = currentAm.filter((a) => PRESET_AMENITIES.includes(a));
    const customs = currentAm.filter((a) => !PRESET_AMENITIES.includes(a) && a !== '360° Mountain & Valley View');
    setSelectedAmenities(presets);
    setOtherAmenity(customs.join(', ') || '');
    setFurnishing((property as any).furnishing || 'Semi-Furnished');

    setIsSold(Boolean(property.isSold));
    setIsAvailableForRent(Boolean(property.isAvailableForRent || property.type === 'Rent/Lease' || property.type === 'PG'));
    setSellerName(property.sellerName || '');
    setSellerPhone(property.sellerPhone || '');
    setSellerEmail(property.sellerEmail || '');
    setSellerType(property.sellerType || 'Owner');
    setErrorMsg(null);
  };

  // Prepopulate state when property opens
  useEffect(() => {
    if (property && isOpen) {
      resetFormToOriginal();
    }
  }, [property, isOpen]);

  // Auto calculate rate per unit whenever total price or area changes
  useEffect(() => {
    const total = parseFloat(totalPriceInput);
    const area = parseFloat(areaValue);
    if (!isNaN(total) && total > 0 && !isNaN(area) && area > 0) {
      setRatePerUnitInput(Math.round(total / area).toString());
    } else if (!totalPriceInput.trim()) {
      setRatePerUnitInput('');
    }
  }, [totalPriceInput, areaValue, areaUnit]);

  if (!isOpen || !property) return null;

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => 
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setErrorMsg(isHindi ? 'कृपया एक वैध इमेज URL दर्ज करें।' : 'Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl('');
    setErrorMsg(null);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const mod = await moderateImageWithAI(dataUrl, file.name);
          if (mod.isSafe && !mod.isNSFW) {
            setImages((prev) => [...prev, dataUrl]);
          } else {
            setErrorMsg(isHindi ? `इमेज अस्वीकृत: सुरक्षा नीति का उल्लंघन।` : `Image rejected by safety policy: ${mod.reason}`);
          }
        } catch {
          setImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEnhanceDescription = async () => {
    if (!description.trim() || isEnhancingDesc) return;
    if (description.trim().length < 5) {
      setErrorMsg(isHindi ? 'कृपया सुधारने से पहले प्रॉपर्टी के बारे में कुछ विवरण लिखें।' : 'Please enter a few details about your property first before enhancing.');
      return;
    }

    setIsEnhancingDesc(true);
    setDescEnhanceNotice(null);

    try {
      const res = await fetch('/api/enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          language: isHindi ? 'hi' : 'en',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data?.success && data?.enhancedDescription) {
        setPrevDescription(description);
        setDescription(data.enhancedDescription);
        setDescEnhanceNotice(isHindi ? '✨ AI द्वारा प्रस्तुति सुधारी गई (कोई नई जानकारी नहीं जोड़ी गई)' : '✨ Presentation refined with AI (no extra info added)');
      } else {
        setErrorMsg(data?.error || (isHindi ? 'विवरण सुधारने में असमर्थ।' : 'Could not enhance description at this time.'));
      }
    } catch {
      setErrorMsg(isHindi ? 'नेटवर्क त्रुटि: कृपया पुनः प्रयास करें।' : 'Network error: Please try again.');
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg(isHindi ? 'कृपया प्रॉपर्टी का शीर्षक दर्ज करें।' : 'Please enter a title for the property.');
      return;
    }

    const priceNum = parseFloat(totalPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg(isHindi ? 'कृपया वैध मूल्य दर्ज करें।' : 'Please enter a valid total asking price.');
      return;
    }

    const areaNum = parseFloat(areaValue);
    if (isNaN(areaNum) || areaNum <= 0) {
      setErrorMsg(isHindi ? 'कृपया वैध क्षेत्रफल दर्ज करें।' : 'Please enter a valid area.');
      return;
    }

    setIsSaving(true);

    try {
      const isLandOrPlot = isLandOrPlotType(type);
      const unitObj = getAreaUnitConfig(areaUnit);
      const unitShortLabel = getAreaUnitShortLabel(areaUnit, false);
      const areaInSqFt = Math.round(areaNum * unitObj.toSqFt);
      const formattedArea = formatAreaValueWithUnit(areaNum, areaUnit, false) || `${areaInSqFt.toLocaleString('en-IN')} Sq.Ft`;

      const combinedAmenities = isLandOrPlot
        ? []
        : [
            ...selectedAmenities,
            ...(otherAmenity.trim() ? [otherAmenity.trim()] : [])
          ];

      const pendingUrl = newImageUrl.trim();
      const finalImages =
        pendingUrl && (pendingUrl.startsWith('http://') || pendingUrl.startsWith('https://') || pendingUrl.startsWith('data:image/')) && !images.includes(pendingUrl)
          ? [...images, pendingUrl]
          : images;

      const computedUnitRate = ratePerUnitInput.trim()
        ? parseFloat(ratePerUnitInput)
        : areaNum > 0 && priceNum > 0
        ? Math.round(priceNum / areaNum)
        : 0;

      const formatCurrency = (val: number): string => {
        if (isAvailableForRent || type === 'Rent/Lease' || type === 'PG') {
          return `₹${val.toLocaleString('en-IN')} / month`;
        }
        if (val >= 10000000) {
          return `₹${(val / 10000000).toFixed(2).replace(/\.00$/, '')} Crore`;
        }
        if (val >= 100000) {
          return `₹${(val / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
        }
        return `₹${val.toLocaleString('en-IN')}`;
      };

      const updatedProperty: Property = {
        ...property,
        ownerId: property.ownerId || currentUser?.id,
        ownerContact: property.ownerContact || currentUser?.contact,
        ownerUsername: (sellerType === 'Owner' && currentUser?.username)
          ? currentUser.username
          : (property.ownerUsername || currentUser?.username),
        title: trimmedTitle,
        tagline: tagline.trim() || property.tagline,
        type,
        category,
        price: priceNum,
        priceDisplay: formatCurrency(priceNum),
        ratePerSqFt: areaUnit === 'sqft' && areaInSqFt > 0 ? `₹${Math.round(priceNum / areaInSqFt).toLocaleString('en-IN')} / sq.ft` : (null as any),
        ratePerGajOrNali: areaUnit !== 'sqft' && computedUnitRate > 0
          ? `₹${computedUnitRate.toLocaleString('en-IN')} / ${unitShortLabel}`
          : (null as any),
        location: locationAddress.trim() || property.location,
        city,
        region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
        areaSqFt: areaInSqFt,
        areaValue: areaNum,
        areaDisplay: formattedArea,
        areaUnit,
        configuration: isLandOrPlot
          ? `${formattedArea} ${type}`
          : bedrooms === 0 ? `Studio Apartment` : `${bedrooms} BHK ${type}`,
        bedrooms: isLandOrPlot ? 0 : bedrooms,
        bathrooms: isLandOrPlot ? 0 : bathrooms,
        facing: facing.trim() || undefined,
        possession: possession.trim() || undefined,
        reraStatus: reraStatus.trim() || undefined,
        description: description.trim(),
        images: finalImages,
        videoUrl: videoUrl.trim() || undefined,
        furnishing: isLandOrPlot ? (null as any) : (furnishing || 'Unfurnished'),
        amenities: combinedAmenities,
        isSold,
        isAvailableForRent: Boolean(isAvailableForRent || type === 'Rent/Lease' || type === 'PG'),
        sellerName: (sellerType === 'Owner' && currentUser?.username)
          ? currentUser.username
          : (sellerName.trim() || property.sellerName || currentUser?.username || 'Direct Owner'),
        sellerPhone: sellerPhone.trim() || property.sellerPhone,
        sellerEmail: sellerEmail.trim() || property.sellerEmail,
        sellerType,
      };

      await Promise.resolve(onPropertyUpdated(updatedProperty));
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#071c14] rounded-3xl shadow-2xl border border-emerald-300 dark:border-emerald-800/80 overflow-hidden my-auto max-h-[92vh] flex flex-col modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-[#05291e] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/10 text-emerald-200 border border-white/15">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {isHindi ? 'प्रॉपर्टी विवरण संपादित करें' : 'Edit Property Listing'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {property.type}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                {isHindi ? 'कीमत, विवरण, फोटो व सुविधाएं अपडेट करें।' : 'Update pricing, photos, amenities, or availability status.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 flex items-center gap-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Availability Status Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isHindi ? 'बिक्री / उपलब्धता स्थिति' : 'Listing Availability Status'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isSold ? (isHindi ? 'यह प्रॉपर्टी बिक चुकी है (Sold Out)' : 'Currently marked as Sold Out') : (isHindi ? 'यह प्रॉपर्टी खरीदारों के लिए उपलब्ध है' : 'Active and available to buyers')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSold(!isSold)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                  isSold
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300'
                }`}
              >
                {isSold ? '⚠️ Sold Out' : '✅ Active / Available'}
              </button>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <span>1. Basic Details</span>
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
                placeholder="e.g. 3 BHK Luxury Cottage"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City
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
                Locality / Specific Address
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

          {/* Section 2: Configuration & Size */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <span>2. Configuration & Measurements</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {!isLandOrPlotType(type) && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bedrooms
                    </label>
                    <select
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
                      Bathrooms
                    </label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={0}>0 (Plot)</option>
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
                  Area *
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 overflow-hidden">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={areaValue}
                    onChange={(e) => setAreaValue(e.target.value)}
                    placeholder="Enter area"
                    className="w-full min-w-0 flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />
                  <select
                    value={areaUnit}
                    onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                    aria-label="Area Unit"
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

            {/* Furnishing Status (Hidden for Land/Plot) */}
            {!isLandOrPlotType(type) && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHindi ? 'फर्निशिंग स्थिति (Furnishing Status):' : 'Furnishing Status:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Furnished', 'Semi-Furnished', 'Unfurnished'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFurnishing(status)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                        furnishing === status
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
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
          </div>

          {/* Section 3: Pricing with Automatic Rate Per Unit */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" />
              <span>3. Pricing (Total Price & Rate per Unit)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Total Asking Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalPriceInput}
                    onChange={(e) => setTotalPriceInput(e.target.value)}
                    placeholder="Enter total price in ₹"
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Rate Per {getAreaUnitShortLabel(areaUnit, false)}
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
                    onChange={(e) => {
                      setRatePerUnitInput(e.target.value);
                      const rate = parseFloat(e.target.value);
                      const area = parseFloat(areaValue);
                      if (!isNaN(rate) && rate > 0 && !isNaN(area) && area > 0) {
                        setTotalPriceInput(Math.round(rate * area).toString());
                      }
                    }}
                    placeholder="Auto rate per unit"
                    className="w-full pl-7 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    / {getAreaUnitShortLabel(areaUnit, false)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Photos & Video */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>4. Photos & Media ({images.length} photos)</span>
              </h4>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageFileUpload}
              className="hidden"
            />

            {/* URL Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste an image URL (https://...)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-300 cursor-pointer"
              >
                Add URL
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Upload */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-emerald-600" />
                <span>Property Walkthrough Video</span>
              </label>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleVideoFileUpload}
                className="hidden"
              />

              {!videoUrl ? (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Upload Video (.mp4, .mov, .webm)</span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-black aspect-video max-w-sm">
                  <video src={videoUrl} controls className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                    title="Remove video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Amenities (Hidden for Land/Plot) */}
          {!isLandOrPlotType(type) && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>5. Amenities & Facilities</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_AMENITIES.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-500 text-emerald-950 dark:text-emerald-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{amenity}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}

                {/* Instead of 360 degree mountain view: Other Text Box */}
                <div className="p-1 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/40 flex items-center">
                  <div className="relative w-full">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Other:
                    </span>
                    <input
                      type="text"
                      value={otherAmenity}
                      onChange={(e) => setOtherAmenity(e.target.value)}
                      placeholder="Write 1 more amenity..."
                      className="w-full pl-16 pr-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Description & Contact */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              6. Description & Seller Contact
            </h4>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isHindi ? 'प्रॉपर्टी विवरण' : 'Property Description'}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {sellerType === 'Broker' ? 'Broker / Agency Name' : 'Owner Username / Name'}
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seller Phone
                </label>
                <input
                  type="text"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seller Role
                </label>
                <select
                  value={sellerType}
                  onChange={(e) => setSellerType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Owner">Direct Owner</option>
                  <option value="Verified Builder">Verified Builder</option>
                  <option value="Agent">Agent / Representative</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetFormToOriginal}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
              title={isHindi ? 'सभी परिवर्तनों को मूल डेटा पर रीसेट करें' : 'Revert all fields back to original saved property values'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isHindi ? 'परिवर्तन पूर्ववत करें (Revert All)' : 'Revert All Changes'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (isHindi ? 'सहेज रहे हैं...' : 'Saving Changes...') : (isHindi ? 'परिवर्तन सहेजें' : 'Save Changes')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
