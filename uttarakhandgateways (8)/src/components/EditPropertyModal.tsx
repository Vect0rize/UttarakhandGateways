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
  Video
} from 'lucide-react';
import { Property, PropertyType, PropertyCategory, UttarakhandCity } from '../types';
import { CITIES, CATEGORIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { moderateImageWithAI } from '../utils/imageModeration';

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

const PRESET_AMENITIES = [
  'Water Supply',
  'Electricity Connection',
  'Dedicated Car Parking',
  '360° Mountain & Valley View',
];

const AREA_UNITS = [
  { value: 'sqft', label: 'Sq.Ft (Square Feet)', toSqFt: 1 },
  { value: 'gaj', label: 'Gaj (Square Yards)', toSqFt: 9 },
  { value: 'nali', label: 'Nali (UK Hill Land = 2,160 sq.ft)', toSqFt: 2160 },
  { value: 'mutthi', label: 'Mutthi (1/16 Nali = 135 sq.ft)', toSqFt: 135 },
  { value: 'bigha', label: 'UK Hill Bigha (4 Nali = 8,640 sq.ft)', toSqFt: 8640 },
  { value: 'acre', label: 'Acre (43,560 sq.ft)', toSqFt: 43560 },
  { value: 'sqmeter', label: 'Sq.Meter (10.76 sq.ft)', toSqFt: 10.7639 },
];

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
  const [areaUnit, setAreaUnit] = useState<string>('sqft');
  const [totalPriceInput, setTotalPriceInput] = useState<string>('7500000');
  const [ratePerUnitInput, setRatePerUnitInput] = useState<string>('');
  const [facing, setFacing] = useState('');
  const [possession, setPossession] = useState('');
  const [reraStatus, setReraStatus] = useState('');
  const [altitudeMsl, setAltitudeMsl] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenities, setCustomAmenities] = useState<string[]>(['', '', '', '', '']);
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

  // Prepopulate state when property opens
  useEffect(() => {
    if (property && isOpen) {
      setTitle(property.title || '');
      setTagline(property.tagline || '');
      setCategory(property.category || 'Residential');
      setType(property.type || 'Villa');
      setCity(property.city || 'Dehradun');
      setLocationAddress(property.location || '');
      setBedrooms(property.bedrooms ?? 2);
      setBathrooms(property.bathrooms ?? 2);
      
      const pArea = property.areaSqFt || 1200;
      setAreaValue(pArea.toString());
      setAreaUnit(property.areaUnit || 'sqft');

      const priceNum = property.price || 0;
      setTotalPriceInput(priceNum.toString());
      if (pArea > 0 && priceNum > 0) {
        setRatePerUnitInput(Math.round(priceNum / pArea).toString());
      } else {
        setRatePerUnitInput('');
      }

      setFacing(property.facing || '');
      setPossession(property.possession || '');
      setReraStatus(property.reraStatus || '');
      setAltitudeMsl(property.altitudeMsl || '');
      setDescription(property.description || '');
      setImages(Array.isArray(property.images) ? [...property.images] : []);
      setVideoUrl(property.videoUrl || '');

      // Separate preset amenities from custom amenities
      const currentAm = Array.isArray(property.amenities) ? property.amenities : [];
      const presets = currentAm.filter((a) => PRESET_AMENITIES.includes(a));
      const customs = currentAm.filter((a) => !PRESET_AMENITIES.includes(a));
      setSelectedAmenities(presets);
      
      const fiveCustoms = ['', '', '', '', ''];
      customs.slice(0, 5).forEach((c, idx) => {
        fiveCustoms[idx] = c;
      });
      setCustomAmenities(fiveCustoms);

      setIsSold(Boolean(property.isSold));
      setIsAvailableForRent(Boolean(property.isAvailableForRent || property.type === 'Rent/Lease' || property.type === 'PG'));
      setSellerName(property.sellerName || '');
      setSellerPhone(property.sellerPhone || '');
      setSellerEmail(property.sellerEmail || '');
      setSellerType(property.sellerType || 'Owner');
      setErrorMsg(null);
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

    if (images.length === 0) {
      setErrorMsg(isHindi ? 'कम से कम 1 फोटो अनिवार्य है।' : 'At least 1 photo is required.');
      return;
    }

    setIsSaving(true);

    try {
      const unitObj = AREA_UNITS.find((u) => u.value === areaUnit);
      const conversion = unitObj?.toSqFt || 1;
      const areaInSqFt = Math.round(areaNum * conversion);

      const combinedAmenities = [
        ...selectedAmenities,
        ...customAmenities.map((a) => a.trim()).filter(Boolean)
      ];

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
        ownerUsername: property.ownerUsername || currentUser?.username,
        title: trimmedTitle,
        tagline: tagline.trim() || property.tagline,
        type,
        category,
        price: priceNum,
        priceDisplay: formatCurrency(priceNum),
        ratePerSqFt: areaInSqFt > 0 ? `₹${Math.round(priceNum / areaInSqFt).toLocaleString('en-IN')} / sq.ft` : undefined,
        ratePerGajOrNali: ratePerUnitInput.trim() 
          ? `₹${parseFloat(ratePerUnitInput).toLocaleString('en-IN')} / ${unitObj?.label.split(' ')[0] || 'Unit'}`
          : undefined,
        location: locationAddress.trim() || property.location,
        city,
        region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
        areaSqFt: areaInSqFt,
        areaDisplay: `${areaInSqFt.toLocaleString('en-IN')} sq.ft${areaUnit !== 'sqft' ? ` (${areaNum} ${unitObj?.label.split(' ')[0] || 'Unit'})` : ''}`,
        areaUnit,
        configuration: type === 'Plot' || type === 'Land' 
          ? `${areaInSqFt} sq.ft Plot` 
          : bedrooms === 0 ? `Studio Apartment` : `${bedrooms} BHK ${type}`,
        bedrooms: type === 'Plot' || type === 'Land' ? 0 : bedrooms,
        bathrooms: type === 'Plot' || type === 'Land' ? 0 : bathrooms,
        facing: facing.trim() || undefined,
        possession: possession.trim() || undefined,
        reraStatus: reraStatus.trim() || undefined,
        description: description.trim(),
        images,
        videoUrl: videoUrl.trim() || undefined,
        amenities: combinedAmenities,
        isSold,
        isAvailableForRent: Boolean(isAvailableForRent || type === 'Rent/Lease' || type === 'PG'),
        sellerName: sellerName.trim() || property.sellerName || currentUser?.username || 'Direct Owner',
        sellerPhone: sellerPhone.trim() || property.sellerPhone,
        sellerEmail: sellerEmail.trim() || property.sellerEmail,
        sellerType,
      };

      onPropertyUpdated(updatedProperty);
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  disabled={type === 'Plot' || type === 'Land'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
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
                  Area *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={areaValue}
                  onChange={(e) => setAreaValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Area Unit
                </label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label.split(' ')[0]}</option>
                  ))}
                </select>
              </div>
            </div>
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
                    Rate Per {AREA_UNITS.find(u => u.value === areaUnit)?.label.split(' ')[0] || 'Unit'}
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
                    / {AREA_UNITS.find(u => u.value === areaUnit)?.label.split(' ')[0] || 'Unit'}
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
                <span>Photos & Media ({images.length} photos)</span>
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

          {/* Section 5: Amenities */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>5. Amenities & Facilities</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
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
            </div>

            {/* 5 Custom Text Boxes */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Custom Amenities (5 text boxes):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customAmenities.map((val, idx) => (
                  <div key={idx} className={idx === 4 ? 'sm:col-span-2' : ''}>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const updated = [...customAmenities];
                        updated[idx] = e.target.value;
                        setCustomAmenities(updated);
                      }}
                      placeholder={`Amenity #${idx + 1}`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Description & Contact */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              6. Description & Seller Contact
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Property Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your property..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seller Name
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
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
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
        </form>
      </div>
    </div>
  );
};
