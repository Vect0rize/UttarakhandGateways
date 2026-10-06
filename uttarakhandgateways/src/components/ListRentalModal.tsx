import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Home, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Video,
  Key,
  Calendar,
  Layers,
  Zap,
  Droplets,
  Car,
  Wifi,
  Eye,
  Shield,
  Loader2,
  Trash2,
  Lock
} from 'lucide-react';
import { Property, PropertyCategory, PropertyType, UttarakhandCity } from '../types';
import { CITIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { compressAndNormalizeImage, moderateImageWithAI } from '../utils/imageModeration';
import { LegalPolicyId } from '../data/legalPolicies';

interface ListRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRentalUploaded: (property: Property) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

export type RentalFrequency = 'month' | 'quarter' | 'year';

export type FurnishingStatus = 'Furnished' | 'Semi-Furnished' | 'Unfurnished';

export type TenantPreference = 'Anyone' | 'Family Only' | 'Working Professionals' | 'Bachelors' | 'Corporate / Company';

type RentalCategory = 'Residential' | 'Commercial' | 'Land/Plot';

interface AreaUnitConfig {
  value: string;
  labelEn: string;
  labelHi: string;
  toSqFt: number;
}

const RENTAL_AREA_UNITS: AreaUnitConfig[] = [
  { value: 'sqft', labelEn: 'Sq.Ft (Square Feet)', labelHi: 'वर्ग फुट (Sq.Ft)', toSqFt: 1 },
  { value: 'gaj', labelEn: 'Gaj (Square Yards)', labelHi: 'गज (Square Yards)', toSqFt: 9 },
  { value: 'nali', labelEn: 'Nali (UK Hill Land = 2,160 sq.ft)', labelHi: 'नाली (2,160 Sq.Ft)', toSqFt: 2160 },
  { value: 'mutthi', labelEn: 'Mutthi (135 sq.ft)', labelHi: 'मुट्ठी (135 Sq.Ft)', toSqFt: 135 },
  { value: 'bigha', labelEn: 'UK Hill Bigha (8,640 sq.ft)', labelHi: 'पहाड़ी बीघा (8,640 Sq.Ft)', toSqFt: 8640 },
  { value: 'pbigha', labelEn: 'Plains Bigha (27,000 sq.ft)', labelHi: 'मैदानी बीघा (27,000 Sq.Ft)', toSqFt: 27000 },
  { value: 'acre', labelEn: 'Acre (43,560 sq.ft)', labelHi: 'एकड़ (43,560 Sq.Ft)', toSqFt: 43560 },
  { value: 'sqmeter', labelEn: 'Sq.Meter (10.76 sq.ft)', labelHi: 'वर्ग मीटर (Sq.Meter)', toSqFt: 10.7639 },
];

const RENTAL_PRESET_AMENITIES = [
  'Water Supply',
  'Electricity / Power Backup',
  'Dedicated Car Parking',
  '360° Mountain & Valley View',
];

export const ListRentalModal: React.FC<ListRentalModalProps> = ({
  isOpen,
  onClose,
  onRentalUploaded,
  onOpenLegalPolicy,
}) => {
  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();

  // Category & Property Type State
  const [rentalCategory, setRentalCategory] = useState<RentalCategory>('Residential');
  const [propertySubtype, setPropertySubtype] = useState<string>('Apartment / Flat');

  // Basic Information
  const [title, setTitle] = useState('');
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [furnishing, setFurnishing] = useState<FurnishingStatus>('Furnished');
  const [tenantPreference, setTenantPreference] = useState<TenantPreference>('Anyone');
  const [availableFrom, setAvailableFrom] = useState<string>('Immediate');

  // Size
  const [areaValue, setAreaValue] = useState<string>('1200');
  const [areaUnit, setAreaUnit] = useState<string>('sqft');

  // Rental Pricing & Frequency (Month / Quarter / Year)
  const [rentPriceInput, setRentPriceInput] = useState<string>('25000');
  const [rentalFrequency, setRentalFrequency] = useState<RentalFrequency>('month');
  const [securityDeposit, setSecurityDeposit] = useState<string>('50000');
  const [maintenanceCharges, setMaintenanceCharges] = useState<string>('Included in Rent');

  // Location
  const [city, setCity] = useState<UttarakhandCity>('Dehradun');
  const [localityAddress, setLocalityAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  // Media & Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [videoUrl, setVideoUrl] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isScanningImages, setIsScanningImages] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; filename?: string } | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Amenities: Reduced presets + 5 custom text boxes
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Water Supply',
    'Electricity / Power Backup',
    'Dedicated Car Parking',
    '360° Mountain & Valley View'
  ]);
  const [customAmenities, setCustomAmenities] = useState<string[]>(['', '', '', '', '']);
  const [taglineInput, setTaglineInput] = useState('Mountain View, Low Deposit, Family Friendly');
  const [description, setDescription] = useState('');

  // Landlord / Seller Info
  const [sellerName, setSellerName] = useState(currentUser?.username || '');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.contactType === 'phone' ? currentUser.contact : '');
  const [sellerEmail, setSellerEmail] = useState(currentUser?.contactType === 'email' ? currentUser.contact : '');
  const [sellerType, setSellerType] = useState<'Owner' | 'Broker'>('Owner');

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize subtype options based on Category (Includes PG in Residential)
  const subtypeOptions = useMemo(() => {
    if (rentalCategory === 'Residential') {
      return [
        'Apartment / Flat',
        'PG / Paying Guest / Hostel',
        'Independent House / Villa',
        'Himalayan Cottage / Homestay',
        'Studio Apartment',
        'Penthouse / Duplex'
      ];
    }
    if (rentalCategory === 'Commercial') {
      return [
        'Shop / Retail Showroom',
        'Office Space',
        'Hotel / Resort / Homestay',
        'Restaurant / Cafe / Cloud Kitchen',
        'Warehouse / Godown / Industrial'
      ];
    }
    return [
      'Leasehold Agricultural Land',
      'Commercial Plot for Lease',
      'Residential Plot for Lease'
    ];
  }, [rentalCategory]);

  // Unit conversion
  const enteredAreaNum = parseFloat(areaValue) || 0;
  const unitConfig = RENTAL_AREA_UNITS.find(u => u.value === areaUnit) || RENTAL_AREA_UNITS[0];
  const numericAreaSqFt = Math.round(enteredAreaNum * unitConfig.toSqFt);

  // Numeric Rent Calculations
  const numericRent = parseFloat(rentPriceInput) || 0;

  // Monthly equivalent for standard database sorting and filtering
  const monthlyEquivalentPrice = useMemo(() => {
    if (rentalFrequency === 'month') return numericRent;
    if (rentalFrequency === 'quarter') return Math.round(numericRent / 3);
    if (rentalFrequency === 'year') return Math.round(numericRent / 12);
    return numericRent;
  }, [numericRent, rentalFrequency]);

  // Price Display label
  const formattedPriceDisplay = useMemo(() => {
    const formatted = `₹${numericRent.toLocaleString('en-IN')}`;
    if (rentalFrequency === 'month') {
      return isHindi ? `${formatted} / माह` : `${formatted} / month`;
    }
    if (rentalFrequency === 'quarter') {
      return isHindi ? `${formatted} / तिमाही (Quarter)` : `${formatted} / quarter`;
    }
    return isHindi ? `${formatted} / वर्ष (Year)` : `${formatted} / year`;
  }, [numericRent, rentalFrequency, isHindi]);

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    const files = Array.from(rawFiles).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsScanningImages(true);
    setScanNotice(null);
    const approvedBatch: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setScanProgress({ current: i + 1, total: files.length, filename: file.name });

      try {
        const compressedBase64 = await compressAndNormalizeImage(file, 1200, 0.8);
        const modResult = await moderateImageWithAI(compressedBase64, file.name);

        if (modResult.isSafe && !modResult.isNSFW) {
          approvedBatch.push(compressedBase64);
        } else {
          setScanNotice(modResult.reason || 'One or more images did not pass safety moderation.');
        }
      } catch {
        const fallback = await compressAndNormalizeImage(file, 1200, 0.8);
        approvedBatch.push(fallback);
      }
    }

    if (approvedBatch.length > 0) {
      setImageUrls(prev => [...approvedBatch, ...prev]);
    }
    setIsScanningImages(false);
    setScanProgress(null);
  };

  const handleRemovePhoto = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage(isHindi ? 'कृपया प्रॉपर्टी का शीर्षक दर्ज करें।' : 'Please enter a property title.');
      return;
    }
    if (numericRent <= 0) {
      setErrorMessage(isHindi ? 'कृपया वैध किराया राशि दर्ज करें।' : 'Please enter a valid rental amount.');
      return;
    }
    if (numericAreaSqFt <= 0) {
      setErrorMessage(isHindi ? 'कृपया प्रॉपर्टी का क्षेत्रफल दर्ज करें।' : 'Please enter the property area.');
      return;
    }

    const effectiveImages = imageUrls.length > 0 ? imageUrls : [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ];

    const parsedHighlights = taglineInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    // Map rentalCategory to PropertyCategory standard
    const mappedCategory: PropertyCategory = 
      rentalCategory === 'Commercial' ? 'Commercial' : 
      rentalCategory === 'Land/Plot' ? 'Agriculture' : 'Residential';

    // Map to PropertyType (Support PG)
    let mappedType: PropertyType = 'Rent/Lease';
    if (propertySubtype.includes('PG')) mappedType = 'PG';
    else if (propertySubtype.includes('Villa')) mappedType = 'Villa';
    else if (propertySubtype.includes('Flat') || propertySubtype.includes('Apartment')) mappedType = 'Flat';
    else if (propertySubtype.includes('Cottage')) mappedType = 'Cottage';
    else if (propertySubtype.includes('Shop')) mappedType = 'Shop';
    else if (propertySubtype.includes('Hotel')) mappedType = 'Hotel';
    else if (propertySubtype.includes('Plot') || propertySubtype.includes('Land')) mappedType = 'Plot';

    // Combine preset amenities + 5 custom user text box amenities
    const finalAmenities = [
      ...selectedAmenities,
      ...customAmenities.map(a => a.trim()).filter(Boolean)
    ];

    const newRentalProperty: Property = {
      id: `rental-prop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      tagline: parsedHighlights[0] || (isHindi ? 'सत्यापित रेंटल प्रॉपर्टी (0% ब्रोकरेज)' : 'Verified Rental Property (0% Brokerage)'),
      type: mappedType,
      category: mappedCategory,
      price: monthlyEquivalentPrice,
      priceDisplay: formattedPriceDisplay,
      location: localityAddress.trim() ? `${localityAddress.trim()}, ${city}` : city,
      city,
      region: ['Dehradun', 'Mussoorie', 'Rishikesh', 'Haridwar', 'Devprayag', 'Uttarkashi', 'Chakrata', 'Dhanaulti', 'Kanatal', 'Tehri Garhwal', 'Rudraprayag', 'Kotdwar'].includes(city) ? 'Garhwal' : 'Kumaon',
      areaSqFt: numericAreaSqFt,
      areaDisplay: `${numericAreaSqFt.toLocaleString('en-IN')} sq.ft (${enteredAreaNum} ${unitConfig.labelEn.split(' ')[0]})`,
      areaUnit: unitConfig.labelEn.split(' ')[0],
      pricingUnit: rentalFrequency === 'month' ? 'Per Month' : rentalFrequency === 'quarter' ? 'Per Quarter' : 'Per Year',
      configuration: rentalCategory === 'Land/Plot' 
        ? `${numericAreaSqFt} sq.ft Lease Plot` 
        : propertySubtype.includes('PG')
        ? `${bedrooms > 1 ? `${bedrooms}-Sharing` : 'Single Room'} PG (${furnishing})`
        : bedrooms === 0
        ? `Studio Apartment (${furnishing})`
        : `${bedrooms} BHK ${propertySubtype.split(' / ')[0]} (${furnishing})`,
      bedrooms: rentalCategory === 'Land/Plot' || rentalCategory === 'Commercial' ? 0 : bedrooms,
      bathrooms: rentalCategory === 'Land/Plot' ? 0 : bathrooms,
      possession: availableFrom === 'Immediate' ? 'Immediate Move-in' : `Available ${availableFrom}`,
      reraStatus: 'Verified Rental Agreement',
      images: effectiveImages,
      videoUrl: videoUrl.trim() || undefined,
      description: description.trim() || (isHindi 
        ? `उत्तराखंड में किराये हेतु उत्तम संपत्ति। सुसज्जित: ${furnishing}, प्राथमिकता: ${tenantPreference}। सुरक्षा जमा: ₹${securityDeposit}, रखरखाव: ${maintenanceCharges}।` 
        : `Well-maintained rental in ${city}. Furnishing: ${furnishing}, Preferred Tenants: ${tenantPreference}. Security Deposit: ₹${securityDeposit}, Maintenance: ${maintenanceCharges}. 0% Brokerage.`),
      highlights: parsedHighlights.length > 0 ? parsedHighlights : ['0% Brokerage', furnishing, `${tenantPreference} Welcome`],
      amenities: finalAmenities,
      sellerName: sellerName.trim() || currentUser?.username || (sellerType === 'Broker' ? 'Verified Rental Broker' : 'Direct Property Owner'),
      sellerPhone: sellerPhone.trim() || (currentUser?.contactType === 'phone' ? currentUser.contact : '+91 98971 23456'),
      sellerEmail: sellerEmail.trim() || (currentUser?.contactType === 'email' ? currentUser.contact : undefined),
      sellerType: sellerType,
      ownerId: currentUser?.id || `guest-${Date.now()}`,
      ownerContact: currentUser?.contact || sellerPhone.trim(),
      ownerUsername: currentUser?.username || sellerName.trim() || 'Property Owner',
      isSold: false,
      isAvailableForRent: true,
      purpose: 'rent',
    };

    setFormSubmitted(true);
    setTimeout(() => {
      onRentalUploaded(newRentalProperty);
      onClose();
      setFormSubmitted(false);
    }, 1200);
  };

  if (!isOpen) return null;

  if (isOpen && !currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="w-full max-w-md bg-white dark:bg-[#07241a] rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-teal-500 dark:border-teal-600 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isHindi ? 'किराये की संपत्ति लिस्ट करने हेतु लॉगिन आवश्यक है' : 'Login Required to List Rental'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              {isHindi 
                ? '0% ब्रोकरेज के साथ किरायेदार खोजने हेतु कृपया अपने ईमेल या व्हाट्सएप नंबर (ओटीपी) से लॉगिन करें।' 
                : 'Please log in with your email or WhatsApp phone number via OTP to list a rental property with 0% brokerage.'}
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
                openAuthModal('login', isHindi ? 'किराये की संपत्ति लिस्ट करने हेतु कृपया ईमेल या व्हाट्सएप नंबर (ओटीपी) से लॉगिन करें।' : 'Please log in with your email or WhatsApp number via OTP to list a property.');
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
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
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#07241a] rounded-3xl shadow-2xl border-2 border-teal-500/80 dark:border-teal-700 flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Organized Dedicated Rental Branding */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-950 text-white flex items-center justify-between shrink-0 shadow-md border-b border-teal-700/50">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 shadow-sm shrink-0">
              <Key className="w-5 h-5 text-teal-300" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {isHindi ? 'किराये हेतु लिस्ट करें' : 'List Your Rental'}
                </h3>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-teal-400 text-teal-950 shadow-xs">
                  0% Brokerage
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hidden sm:inline-block">
                  Rent Only
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                {isHindi 
                  ? 'मासिक, तिमाही या वार्षिक किराये हेतु सीधे सत्यापित किरायेदारों से जुड़ें।' 
                  : 'Direct tenant connection for flats, cottages, PG, shops, or land across Uttarakhand.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {formSubmitted ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center mx-auto shadow-md animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isHindi ? 'रेंटल प्रॉपर्टी सफलतापूर्वक लिस्ट हो गई!' : 'Rental Property Listed Successfully!'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {isHindi 
                  ? 'आपकी रेंटल प्रॉपर्टी अब लाइव है। किरायेदार सीधे आपसे संपर्क कर सकते हैं।' 
                  : 'Your rental listing is now live in the Uttarakhand rental catalog with 0% brokerage.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* PROMINENT OWNER VS BROKER CHOICE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border-2 border-teal-300 dark:border-teal-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{isHindi ? 'आप इस किराये की प्रॉपर्टी के क्या हैं? (मालिक या ब्रोकर) *' : 'Are you an Owner or a Broker? *'}</span>
                  </label>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-100">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSellerType('Owner')}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      sellerType === 'Owner'
                        ? 'border-teal-600 bg-white dark:bg-[#07241a] ring-2 ring-teal-500/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-teal-300 opacity-80'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                      sellerType === 'Owner' ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      👤
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{isHindi ? 'मैं मकान मालिक हूँ' : 'I am the Property Owner'}</span>
                        <span className="text-[9px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-1.5 py-0.2 rounded-md">0% Brokerage</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isHindi ? 'मकान मालिक / सीधा मालिकाना हक' : 'Direct property owner / landlord'}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSellerType('Broker')}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      sellerType === 'Broker'
                        ? 'border-blue-600 bg-white dark:bg-[#07202c] ring-2 ring-blue-500/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 hover:border-blue-300 opacity-80'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                      sellerType === 'Broker' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      🏢
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{isHindi ? 'मैं रियल एस्टेट ब्रोकर हूँ' : 'I am a Real Estate Broker'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isHindi ? 'अधिकृत ब्रोकर या रेंटल एजेंट' : 'Licensed broker / rental agent'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 1: ORGANIZED RENTAL CATEGORY TAB HEADER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>1. Rental Category & Property Type</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                    Category Selection
                  </span>
                </div>

                {/* Clean Organized Segmented Tab Header */}
                <div className="bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setRentalCategory('Residential');
                      setPropertySubtype('Apartment / Flat');
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center sm:text-left ${
                      rentalCategory === 'Residential'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-700/25 ring-2 ring-teal-400/40'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="leading-tight">Residential</div>
                      <div className="text-[10px] font-normal opacity-85 hidden sm:block">Flats, Houses & PG</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRentalCategory('Commercial');
                      setPropertySubtype('Shop / Retail Showroom');
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center sm:text-left ${
                      rentalCategory === 'Commercial'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-700/25 ring-2 ring-teal-400/40'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="leading-tight">Commercial</div>
                      <div className="text-[10px] font-normal opacity-85 hidden sm:block">Shops & Offices</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRentalCategory('Land/Plot');
                      setPropertySubtype('Leasehold Agricultural Land');
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-center sm:text-left ${
                      rentalCategory === 'Land/Plot'
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-700/25 ring-2 ring-teal-400/40'
                        : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <MapPin className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="leading-tight">Land / Plot</div>
                      <div className="text-[10px] font-normal opacity-85 hidden sm:block">Leasehold Plots</div>
                    </div>
                  </button>
                </div>

                {/* Subtype Dropdown */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Property Type *
                  </label>
                  <select
                    value={propertySubtype}
                    onChange={(e) => setPropertySubtype(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium cursor-pointer"
                  >
                    {subtypeOptions.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECTION 2: BASIC INFO & CONFIGURATION */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  <span>2. Rental Property Title & Configuration</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rental Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fully Furnished 2 BHK Valley-View Flat on Rajpur Road, Dehradun"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Bedrooms (BHK) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bedrooms
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      disabled={rentalCategory === 'Commercial' || rentalCategory === 'Land/Plot'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value={0}>Studio</option>
                      <option value={1}>1 BHK</option>
                      <option value={2}>2 BHK</option>
                      <option value={3}>3 BHK</option>
                      <option value={4}>4 BHK</option>
                      <option value={5}>5+ BHK</option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bathrooms
                    </label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      disabled={rentalCategory === 'Land/Plot'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value={1}>1 Bath</option>
                      <option value={2}>2 Baths</option>
                      <option value={3}>3 Baths</option>
                      <option value={4}>4+ Baths</option>
                    </select>
                  </div>

                  {/* Furnishing Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Furnishing
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                      disabled={rentalCategory === 'Land/Plot'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="Furnished">Fully Furnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>

                  {/* Preferred Tenants */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Tenants
                    </label>
                    <select
                      value={tenantPreference}
                      onChange={(e) => setTenantPreference(e.target.value as TenantPreference)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Anyone">Anyone / All Welcome</option>
                      <option value="Family Only">Family Only</option>
                      <option value="Working Professionals">Working Professionals</option>
                      <option value="Bachelors">Bachelors / Students</option>
                      <option value="Corporate / Company">Company / Corporate Lease</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PROPERTY SIZE & DIMENSIONS */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>3. Property Size & Land Area</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Area Value *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={areaValue}
                      onChange={(e) => setAreaValue(e.target.value)}
                      placeholder="e.g. 1200"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Measurement Unit *
                    </label>
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {RENTAL_AREA_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>{u.labelEn}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {numericAreaSqFt > 0 && (
                  <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 flex items-center justify-between">
                    <span>Equivalent Area:</span>
                    <span className="font-bold">
                      {numericAreaSqFt.toLocaleString('en-IN')} sq.ft • {Math.round(numericAreaSqFt / 9)} Gaj • {(numericAreaSqFt / 2160).toFixed(2)} Nali
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION 4: RENTAL PRICING STRUCTURE (MONTH, QUARTER, YEAR) */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>4. Rental Price & Payment Cycle (Month / Quarter / Year)</span>
                  </h4>
                  {numericRent > 0 && (
                    <span className="text-xs font-black text-teal-700 dark:text-teal-300">
                      {formattedPriceDisplay}
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Asking Rent */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Rent Amount (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          required
                          min="100"
                          step="any"
                          value={rentPriceInput}
                          onChange={(e) => setRentPriceInput(e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Rental Frequency: Month, Quarter, Year */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Rental Frequency / Period *
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'month', label: 'Per Month', icon: '📅' },
                          { id: 'quarter', label: 'Per Quarter', icon: '📊' },
                          { id: 'year', label: 'Per Year', icon: '🗓️' },
                        ].map((freq) => (
                          <button
                            key={freq.id}
                            type="button"
                            onClick={() => setRentalFrequency(freq.id as RentalFrequency)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                              rentalFrequency === freq.id
                                ? 'bg-teal-700 text-white border-teal-600 shadow-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-teal-50'
                            }`}
                          >
                            <span>{freq.icon}</span>
                            <span className="text-[11px] mt-0.5">{freq.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Security Deposit & Maintenance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-teal-200/60 dark:border-teal-900/60">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Security Deposit (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={securityDeposit}
                          onChange={(e) => setSecurityDeposit(e.target.value)}
                          placeholder="e.g. 50000"
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Maintenance Charges
                      </label>
                      <select
                        value={maintenanceCharges}
                        onChange={(e) => setMaintenanceCharges(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Included in Rent">Included in Rent</option>
                        <option value="₹1,000 / month">₹1,000 / month (Extra)</option>
                        <option value="₹2,000 / month">₹2,000 / month (Extra)</option>
                        <option value="As per Society Rules">As per Society Rules</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: ADDRESS & LOCATION */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>5. Address & Location</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City / Destination *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as UttarakhandCity)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Locality / Colony / Sector *
                    </label>
                    <input
                      type="text"
                      required
                      value={localityAddress}
                      onChange={(e) => setLocalityAddress(e.target.value)}
                      placeholder="e.g. Rajpur Road, Near Silver City Mall / Jakhan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nearby Landmark / Road Access (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. 5 mins walk to public transport, wide 30ft motorable road"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* SECTION 6: PHOTOS & MEDIA */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>6. Property Photos & Video Tour</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {imageUrls.length} photos ready
                  </span>
                </div>

                {/* Upload Action Card */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-teal-300 dark:border-teal-700/80 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-teal-600/10 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {isHindi ? 'तस्वीरें अपलोड करने हेतु क्लिक करें' : 'Click to Upload Rental Photos'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    JPEG, PNG, WebP up to 10MB (AI Auto-moderated for family safety)
                  </span>
                </div>

                {/* Scanning indicator */}
                {isScanningImages && (
                  <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-200 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>
                      {scanProgress ? `Scanning photo ${scanProgress.current} of ${scanProgress.total}...` : 'Scanning images for content safety...'}
                    </span>
                  </div>
                )}

                {scanNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 text-xs text-amber-800 dark:text-amber-200">
                    {scanNotice}
                  </div>
                )}

                {/* Thumbnail Strip */}
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={url} alt={`Rental ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Video Upload Section */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 dark:text-teal-200 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>{isHindi ? 'प्रॉपर्टी वीडियो (वैकल्पिक)' : 'Property Video (Optional)'}</span>
                    </label>
                    <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider bg-teal-100/80 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-300 dark:border-teal-800">
                      Video Tour
                    </span>
                  </div>

                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />

                  {!videoUrl ? (
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-50 text-teal-800 dark:text-teal-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>{isHindi ? 'वीडियो फाइल अपलोड करें (.mp4, .mov)' : 'Upload Video (.mp4, .mov, .webm)'}</span>
                    </button>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-teal-300 dark:border-teal-700 bg-black aspect-video max-w-sm">
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

              {/* SECTION 7: RENTAL AMENITIES (REDUCED PRESET + 5 CUSTOM TEXT BOXES) */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>7. Amenities & Facilities</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {selectedAmenities.length + customAmenities.filter((a) => a.trim()).length} selected
                  </span>
                </div>

                {/* Preset Amenities (Reduced) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    {isHindi ? 'मुख्य आवश्यक सुविधाएं:' : 'Essential Preset Amenities:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RENTAL_PRESET_AMENITIES.map((amenity) => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <label
                          key={amenity}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 text-teal-950 dark:text-teal-100 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAmenity(amenity)}
                            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                          />
                          <span className="truncate">{amenity}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Tell user to add 5 amenities of their choice with text boxes */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900 dark:text-teal-200">
                      {isHindi ? 'अपनी पसंद की 5 सुविधाएं (Amenities) दर्ज करें:' : 'Add 5 amenities of your choice (enter in text boxes below):'}
                    </label>
                    <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md border border-teal-300 dark:border-teal-800">
                      5 Text Boxes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isHindi 
                      ? 'अपनी रेंटल प्रॉपर्टी की 5 विशिष्ट सुविधाएं जैसे वाई-फाई, मॉड्यूलर किचन, गीजर आदि लिखें।' 
                      : 'Specify up to 5 unique amenities of your choice (e.g. High-Speed Wi-Fi, Modular Kitchen, Geyser, Balcony, Elevator).'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {customAmenities.map((val, idx) => (
                      <div key={idx} className={idx === 4 ? 'sm:col-span-2' : ''}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-600 dark:text-teal-400">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => {
                              const updated = [...customAmenities];
                              updated[idx] = e.target.value;
                              setCustomAmenities(updated);
                            }}
                            placeholder={
                              idx === 0 ? 'Amenity 1: e.g. High-Speed Fiber Internet' :
                              idx === 1 ? 'Amenity 2: e.g. Modular Kitchen / Chimney' :
                              idx === 2 ? 'Amenity 3: e.g. Geyser / Solar Water Heater' :
                              idx === 3 ? 'Amenity 4: e.g. Balcony with Valley View' :
                              'Amenity 5: e.g. Lift / Gated Security / Pet Friendly'
                            }
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 8: SELLER / LANDLORD INFO */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>8. Landlord / Host Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Landlord / Host Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      placeholder="+91 98971 23456"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={sellerEmail}
                      onChange={(e) => setSellerEmail(e.target.value)}
                      placeholder="landlord@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 9: DESCRIPTION & TERMS */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>9. Description & Lease Terms</span>
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Key Highlights (Comma separated, e.g. Mountain View, Low Deposit)
                  </label>
                  <input
                    type="text"
                    value={taglineInput}
                    onChange={(e) => setTaglineInput(e.target.value)}
                    placeholder="Mountain View, Low Deposit, Family Friendly, Wi-Fi"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Rental Description & Rules (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about security deposit refund terms, notice period (e.g. 1 month), pet policy, proximity to schools/markets, etc."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span>By publishing, you agree to our </span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalPolicy?.('terms')}
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    Rental & Listing Policy
                  </button>
                  <span> with 0% Brokerage.</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isScanningImages}
                    className={`w-full sm:w-auto px-7 py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isScanningImages
                        ? 'bg-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/30 active:scale-95 cursor-pointer ring-2 ring-teal-400/40'
                    }`}
                  >
                    <Key className="w-4 h-4 text-teal-200" />
                    <span>{isHindi ? 'रेंटल तुरंत लाइव करें' : 'Publish Rental Listing Now'}</span>
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
