import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Plus,
  Check,
  AlertTriangle,
  AlertCircle,
  FileText,
  Upload,
  RotateCcw,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Star,
  Bed,
  Bath,
  Mountain,
  Droplet,
  Tag,
  Key,
  Phone,
  MessageCircle,
  Calendar,
  Users,
  Layers,
  Car,
  Wifi,
  Zap,
  Shield,
  Trees,
  Waves,
  Dumbbell,
  CheckCircle2,
  Video,
  Calculator,
} from 'lucide-react';
import { Property, PropertyType, PropertyCategory, UttarakhandCity, Region } from '../types';
import { CITIES, CATEGORIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';
import {
  AreaUnit,
  AREA_UNITS,
  formatAreaValueWithUnit,
  getAreaUnitConfig,
  getPropertyAreaInput,
  isLandOrPlotType,
} from '../utils/areaUnits';
import { formatEnhancedDescription } from '../utils/descriptionEnhancer';
import {
  MAX_UPLOAD_FILE_MB,
  compressImageToWebpFile,
  formatFileSizeMB,
  moderateImageWithAI,
  uploadFileWithProgress,
  validateUploadFile,
} from '../utils/imageModeration';
import { recordUploadedPropertyId } from '../utils/propertyOwnership';

export interface UnifiedListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create-sale' | 'create-rent' | 'edit';
  property?: Property | null;
  onPropertySaved?: (savedProperty: Property) => void;
  isPageMode?: boolean;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (t: number) => void;
  onOpenLegalPolicy?: (tab: any) => void;
  initialRole?: string;
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
  'Restaurant',
  'Cafe',
  'Homestay',
  'Hostel',
  'Warehouse',
  'Studio',
  'Penthouse',
  'Duplex',
  'Land',
  'Rent',
  'Lease',
  'PG',
];

export interface TenantCategoryOption {
  id: string;
  labelEn: string;
  labelHi: string;
}

export const ALL_TENANT_CATEGORIES: TenantCategoryOption[] = [
  { id: 'Family', labelEn: 'Family', labelHi: 'परिवार (Family)' },
  { id: 'Bachelors', labelEn: 'Bachelors', labelHi: 'बैचलर्स (Bachelors)' },
  { id: 'Working Professionals', labelEn: 'Working Professionals', labelHi: 'कामकाजी पेशेवर' },
  { id: 'Students', labelEn: 'Students', labelHi: 'छात्र (Students)' },
  { id: 'Couples', labelEn: 'Couples / Newly Weds', labelHi: 'दंपति (Couples)' },
  { id: 'Corporate / Companies', labelEn: 'Corporate / Companies', labelHi: 'कंपनी लीज (Corporate)' },
  { id: 'Tourists / Holidayers', labelEn: 'Tourists / Holidayers', labelHi: 'पर्यटक (Tourists)' },
  { id: 'Doctors / Healthcare Staff', labelEn: 'Doctors / Healthcare', labelHi: 'डॉक्टर्स / हेल्थकेयर' },
  { id: 'Govt / Defense Officers', labelEn: 'Govt / Defense Officers', labelHi: 'सरकारी / रक्षा अधिकारी' },
  { id: 'Anyone / All Welcome', labelEn: 'Anyone / All Welcome', labelHi: 'कोई भी (All Welcome)' },
];

export interface PresetAmenity {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: React.FC<{ className?: string }>;
}

export const PRESET_AMENITIES: PresetAmenity[] = [
  { id: 'water', labelEn: '24/7 Water Supply', labelHi: '24 घंटे पेयजल आपूर्ति', icon: Droplet },
  { id: 'power', labelEn: 'Electricity / Power Backup', labelHi: 'बिजली / पावर बैकअप', icon: Zap },
  { id: 'parking', labelEn: 'Dedicated Car Parking', labelHi: 'समर्पित कार पार्किंग', icon: Car },
  { id: 'kitchen', labelEn: 'Modular Kitchen', labelHi: 'मॉड्यूलर किचन', icon: Building2 },
  { id: 'wifi', labelEn: 'High-Speed Wi-Fi / Fiber', labelHi: 'हाई-स्पीड इंटरनेट', icon: Wifi },
  { id: 'view', labelEn: 'Mountain & Valley View', labelHi: 'पहाड़ व घाटी का दृश्य', icon: Mountain },
  { id: 'solar', labelEn: 'Solar Water / Power Backup', labelHi: 'सोलर हीटर व पावर', icon: Zap },
  { id: 'security', labelEn: '24x7 Security & CCTV', labelHi: 'सुरक्षा गार्ड व सीसीटीवी', icon: Shield },
  { id: 'garden', labelEn: 'Private Garden / Lawn', labelHi: 'निजी बगीचा / लॉन', icon: Trees },
  { id: 'geyser', labelEn: 'Geyser / Hot Water', labelHi: 'गीजर / गर्म पानी', icon: Droplet },
  { id: 'lift', labelEn: 'Lift / Elevator', labelHi: 'लिफ्ट / एलिवेटर', icon: Layers },
  { id: 'gym', labelEn: 'Gym / Fitness Center', labelHi: 'जिम / फिटनेस', icon: Dumbbell },
  { id: 'pool', labelEn: 'Swimming Pool', labelHi: 'स्वीमिंग पूल', icon: Waves },
  { id: 'clubhouse', labelEn: 'Clubhouse / Community Hall', labelHi: 'क्लबहाउस', icon: Users },
  { id: 'play', labelEn: 'Children Play Area', labelHi: 'बच्चों का खेल क्षेत्र', icon: Trees },
  { id: 'ev', labelEn: 'EV Charging Station', labelHi: 'ईवी चार्जिंग स्टेशन', icon: Zap },
];

export const UnifiedListingModal: React.FC<UnifiedListingModalProps> = ({
  isOpen,
  onClose,
  mode = 'create-sale',
  property = null,
  onPropertySaved,
  isPageMode = false,
  lastUploadTime,
  onUpdateLastUploadTime,
  onOpenLegalPolicy,
  initialRole = 'Owner',
}) => {
  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      mountTimeRef.current = Date.now();
    }
  }, [isOpen]);

  // Detect whether listing is for Sale or Rent
  const determineInitialType = (): 'sale' | 'rent' => {
    if (property) {
      if (
        property.isAvailableForRent ||
        property.type === 'Rent' ||
        property.purpose === 'rent' ||
        Boolean(property.monthlyRent) ||
        (property.priceDisplay && /month|mo|किराया/i.test(property.priceDisplay))
      ) {
        return 'rent';
      }
      return 'sale';
    }
    return mode === 'create-rent' ? 'rent' : 'sale';
  };

  const [transactionType, setTransactionType] = useState<'sale' | 'rent'>(determineInitialType());

  // Form States
  const normalizeSellerRole = (r?: string): 'Owner' | 'Broker' =>
    r && r.trim().toLowerCase() !== 'owner' ? 'Broker' : 'Owner';
  const [sellerType, setSellerType] = useState<'Owner' | 'Broker'>(() => normalizeSellerRole(initialRole));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('Residential');
  const [type, setType] = useState<PropertyType>('Villa');
  const [city, setCity] = useState<UttarakhandCity>('Dehradun');
  const [locationAddress, setLocationAddress] = useState('');

  // Config & Area
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [balconies, setBalconies] = useState<number>(1);
  const [areaValue, setAreaValue] = useState<string>('');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('sqft');
  const [furnishing, setFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Semi-Furnished');

  // Pricing (Sale vs Rent) — genuinely empty by default
  const [totalPriceInput, setTotalPriceInput] = useState<string>('');
  const [ratePerUnitInput, setRatePerUnitInput] = useState<string>('');
  const [showAutoCalculator, setShowAutoCalculator] = useState<boolean>(false);
  const [lastPriceEditSource, setLastPriceEditSource] = useState<'total' | 'rate'>('total');
  const rateInputRef = useRef<HTMLInputElement>(null);
  const [isPriceNegotiable, setIsPriceNegotiable] = useState<boolean>(true);
  const [monthlyRentInput, setMonthlyRentInput] = useState<string>('');
  const [securityDepositInput, setSecurityDepositInput] = useState<string>('');
  const [maintenanceInput, setMaintenanceInput] = useState<string>('');
  const [availableFrom, setAvailableFrom] = useState<string>('Immediate');
  const [tenantPreferences, setTenantPreferences] = useState<string[]>(['Family', 'Working Professionals']);

  // Rent Period: Monthly, Quarterly, Yearly
  const [rentPeriod, setRentPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Photos, Videos & Optional Property Documents (Max 20 MB per file)
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [videos, setVideos] = useState<string[]>([]);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; size?: number }>>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ label: string; percent: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Amenities (none selected by default)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenityInput, setCustomAmenityInput] = useState<string>('');

  // Contact & Description
  const [sellerName, setSellerName] = useState<string>('');
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const [sellerWhatsApp, setSellerWhatsApp] = useState<string>('');
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [prevDescription, setPrevDescription] = useState<string | null>(null);
  const [isEnhancingDesc, setIsEnhancingDesc] = useState<boolean>(false);
  const [descNotice, setDescNotice] = useState<string | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);

  // Status & Validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const cleanNameCandidate = (name?: string | null): string => {
    if (!name || typeof name !== 'string') return '';
    if (name.includes('@')) {
      const prefix = name.split('@')[0].replace(/[._-]/g, ' ').trim();
      return prefix.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return name;
  };

  // Helper ensuring email addresses are never pre-filled into mobile number
  const cleanPhoneCandidate = (val?: string | null): string => {
    if (!val || typeof val !== 'string') return '';
    if (val.includes('@') || /[a-zA-Z]/.test(val)) return ''; // Strictly reject any email or alpha characters!
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : '';
  };

  // Initialize or reset when property prop changes
  useEffect(() => {
    if (property) {
      const isRental =
        property.isAvailableForRent ||
        property.type === 'Rent' ||
        property.purpose === 'rent' ||
        Boolean(property.monthlyRent) ||
        (property.priceDisplay && /month|mo|किराया/i.test(property.priceDisplay));

      setTransactionType(isRental ? 'rent' : 'sale');
      setTitle(property.title || '');
      setCategory(property.category || 'Residential');
      setType(property.type || (isRental ? 'Apartment' : 'Villa'));
      setCity(property.city || 'Dehradun');
      setLocationAddress(property.location || '');
      setBedrooms(property.bedrooms ?? 2);
      setBathrooms(property.bathrooms ?? 2);
      setBalconies(property.balconies ?? (isLandOrPlotType(property.type) ? 0 : 1));

      const { areaValue: savedAreaVal, areaUnit: savedAreaUnit } = getPropertyAreaInput(property);
      const effectiveAreaVal =
        savedAreaVal > 0 ? savedAreaVal : property.areaSqFt && property.areaSqFt > 0 ? property.areaSqFt : 0;
      setAreaValue(effectiveAreaVal > 0 ? effectiveAreaVal.toString() : '');
      setAreaUnit(savedAreaUnit || 'sqft');

      setFurnishing(property.furnishing || 'Semi-Furnished');

      if (isRental) {
        let defaultPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
        if (property.rentPeriod === 'quarterly' || /quarter|तिमाही/i.test(property.priceDisplay || '')) {
          defaultPeriod = 'quarterly';
        } else if (property.rentPeriod === 'yearly' || /year|annual|वार्षिक/i.test(property.priceDisplay || '')) {
          defaultPeriod = 'yearly';
        }
        setRentPeriod(defaultPeriod);
        setMonthlyRentInput(property.monthlyRent || property.price ? String(property.monthlyRent || property.price) : '');
        setSecurityDepositInput(property.securityDeposit ? String(property.securityDeposit) : '');
        setMaintenanceInput(property.maintenanceCharges ? String(property.maintenanceCharges) : '');
        setAvailableFrom(property.availableFrom || 'Immediate');
        setTenantPreferences(
          Array.isArray(property.preferredTenants) && property.preferredTenants.length > 0
            ? property.preferredTenants
            : ['Family', 'Working Professionals']
        );
      } else {
        const initPrice = property.price || 0;
        setTotalPriceInput(initPrice > 0 ? initPrice.toString() : '');
        setRatePerUnitInput(initPrice > 0 && effectiveAreaVal > 0 ? Math.round(initPrice / effectiveAreaVal).toString() : '');
        setLastPriceEditSource('total');
        setMaintenanceInput('');
      }

      setImages(Array.isArray(property.images) ? [...property.images] : []);
      setDocuments(Array.isArray(property.documents) ? [...property.documents] : []);
      setUploadError(null);
      setUploadProgress(null);
      const existingVideos = Array.from(
        new Set(
          [
            ...(Array.isArray(property.videos) ? property.videos : []),
            ...(property.videoUrl ? [property.videoUrl] : []),
          ].filter((v): v is string => Boolean(v && typeof v === 'string'))
        )
      );
      setVideos(existingVideos);
      setSelectedAmenities(
        Array.isArray(property.amenities)
          ? property.amenities.filter((a) => !/road|highway|motorable/i.test(a))
          : []
      );

      setSellerName(cleanNameCandidate(property.sellerName) || '');
      const rawPhone = cleanPhoneCandidate(property.sellerPhone) || cleanPhoneCandidate(property.ownerContact) || '';
      setSellerPhone(rawPhone);
      setSellerWhatsApp(rawPhone);
      setSellerType(normalizeSellerRole(property.sellerType || initialRole));
      setDescription(property.description || '');
      setErrorMsg(null);
      setSuccessMsg(null);
    } else {
      // Default creation state
      const initialType = mode === 'create-rent' ? 'rent' : 'sale';
      setTransactionType(initialType);
      setTitle('');
      setCategory('Residential');
      setType(initialType === 'rent' ? 'Apartment' : 'Villa');
      setCity('Dehradun');
      setLocationAddress('');
      setBedrooms(2);
      setBathrooms(2);
      setBalconies(1);
      setAreaValue('');
      setAreaUnit('sqft');
      setFurnishing('Semi-Furnished');
      setRentPeriod('monthly');
      setTotalPriceInput('');
      setRatePerUnitInput('');
      setLastPriceEditSource('total');
      setMonthlyRentInput('');
      setSecurityDepositInput('');
      setMaintenanceInput('');
      setAvailableFrom('Immediate');
      setTenantPreferences(['Family', 'Working Professionals']);
      setImages([]);
      setVideos([]);
      setDocuments([]);
      setUploadError(null);
      setUploadProgress(null);
      setSelectedAmenities([]);
      setSellerName('');
      setSellerPhone('');
      setSellerWhatsApp('');
      setDeclarationAccepted(false);
      setSellerType(normalizeSellerRole(initialRole));
      setDescription('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [property, mode, isOpen, currentUser, initialRole]);

  // Two-way live Auto-Calculation between Total Price, Value/Rate per Unit, and Area
  const sanitizeAmountDigits = (raw: string): string => raw.replace(/[^0-9]/g, '');
  const sanitizeDecimalInput = (raw: string): string => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    return parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
  };

  const handleTotalPriceChange = (rawVal: string) => {
    const val = sanitizeAmountDigits(rawVal);
    setLastPriceEditSource('total');
    setTotalPriceInput(val);
    const totalNum = parseFloat(val.replace(/,/g, ''));
    const areaNum = parseFloat(areaValue);
    if (!isNaN(totalNum) && totalNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      setRatePerUnitInput(Math.round(totalNum / areaNum).toString());
    } else if (!val.trim()) {
      setRatePerUnitInput('');
    }
  };

  const handleRatePerUnitChange = (rawVal: string) => {
    const val = sanitizeDecimalInput(rawVal);
    setLastPriceEditSource('rate');
    setRatePerUnitInput(val);
    const rateNum = parseFloat(val.replace(/,/g, ''));
    const areaNum = parseFloat(areaValue);
    if (!isNaN(rateNum) && rateNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      setTotalPriceInput(Math.round(rateNum * areaNum).toString());
    } else if (!val.trim()) {
      setTotalPriceInput('');
    }
  };

  const handleAreaValueChange = (rawVal: string) => {
    const val = sanitizeDecimalInput(rawVal);
    setAreaValue(val);
    const areaNum = parseFloat(val);
    if (!isNaN(areaNum) && areaNum > 0) {
      if (lastPriceEditSource === 'rate') {
        const rateNum = parseFloat(ratePerUnitInput.replace(/,/g, ''));
        if (!isNaN(rateNum) && rateNum > 0) {
          setTotalPriceInput(Math.round(rateNum * areaNum).toString());
        }
      } else {
        const totalNum = parseFloat(totalPriceInput.replace(/,/g, ''));
        if (!isNaN(totalNum) && totalNum > 0) {
          setRatePerUnitInput(Math.round(totalNum / areaNum).toString());
        }
      }
    }
  };

  const handleAreaUnitChange = (newUnit: AreaUnit) => {
    setAreaUnit(newUnit);
    const areaNum = parseFloat(areaValue);
    if (!isNaN(areaNum) && areaNum > 0) {
      if (lastPriceEditSource === 'rate') {
        const rateNum = parseFloat(ratePerUnitInput.replace(/,/g, ''));
        if (!isNaN(rateNum) && rateNum > 0) {
          setTotalPriceInput(Math.round(rateNum * areaNum).toString());
        }
      } else {
        const totalNum = parseFloat(totalPriceInput.replace(/,/g, ''));
        if (!isNaN(totalNum) && totalNum > 0) {
          setRatePerUnitInput(Math.round(totalNum / areaNum).toString());
        }
      }
    }
  };

  // Synchronize WhatsApp number when sameAsPhone is checked
  useEffect(() => {
    if (whatsappSameAsPhone) {
      if (sellerPhone && !sellerPhone.includes('@') && !/[a-zA-Z]/.test(sellerPhone)) {
        setSellerWhatsApp(sellerPhone);
      } else {
        setSellerWhatsApp('');
      }
    }
  }, [sellerPhone, whatsappSameAsPhone]);

  // Active safeguard: purge invalid characters or emails if ever injected
  useEffect(() => {
    if (sellerPhone && (sellerPhone.includes('@') || /[a-zA-Z]/.test(sellerPhone))) {
      setSellerPhone('');
    }
    if (sellerWhatsApp && (sellerWhatsApp.includes('@') || /[a-zA-Z]/.test(sellerWhatsApp))) {
      setSellerWhatsApp('');
    }
  }, [sellerPhone, sellerWhatsApp]);

  // Amenity Toggle Handler
  const handleToggleAmenity = (amenityLabel: string) => {
    const targetNorm = amenityLabel.trim().toLowerCase();
    setSelectedAmenities((prev) => {
      const exists = prev.some((a) => a.trim().toLowerCase() === targetNorm);
      if (exists) {
        return prev.filter((a) => a.trim().toLowerCase() !== targetNorm);
      } else {
        return [...prev, amenityLabel.trim()];
      }
    });
  };

  // Add Custom Amenity
  const handleAddCustomAmenity = () => {
    const trimmed = customAmenityInput.trim();
    if (!trimmed) return;
    const targetNorm = trimmed.toLowerCase();
    if (!selectedAmenities.some((a) => a.trim().toLowerCase() === targetNorm)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput('');
  };

  // Tenant Preferences Toggle Handler
  const handleToggleTenant = (tenantId: string) => {
    setTenantPreferences((prev) => {
      if (tenantId === 'Anyone / All Welcome') {
        return prev.includes('Anyone / All Welcome') ? [] : ['Anyone / All Welcome'];
      }
      const withoutAll = prev.filter((t) => t !== 'Anyone / All Welcome');
      return withoutAll.includes(tenantId)
        ? withoutAll.filter((t) => t !== tenantId)
        : [...withoutAll, tenantId];
    });
  };

  // Multiple Photo Upload Handler with 20 MB Validation, Client+Server WebP Compression & Progress
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setUploadError(null);

    const maxAllowed = 15;
    const remainingSlots = maxAllowed - images.length;
    if (remainingSlots <= 0) {
      const limitErr = isHindi
        ? `अधिकतम ${maxAllowed} तस्वीरें ही जोड़ी जा सकती हैं।`
        : `Maximum of ${maxAllowed} images allowed per property.`;
      setUploadError(limitErr);
      setErrorMsg(limitErr);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    setIsUploadingImage(true);
    const newImgs: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const check = validateUploadFile(file, 'image', isHindi);
      if (!check.valid) {
        errors.push(check.error || `Invalid file: ${file.name}`);
        continue;
      }

      try {
        setUploadProgress({
          label: isHindi
            ? `तस्वीर अनुकूलित हो रही है (${i + 1}/${filesToProcess.length}): ${file.name}`
            : `Optimizing photo (${i + 1}/${filesToProcess.length}): ${file.name}`,
          percent: 15,
        });

        const compressed = await compressImageToWebpFile(file, 1600, 0.82);

        setUploadProgress({
          label: isHindi
            ? `सुरक्षा जांच (${i + 1}/${filesToProcess.length}): ${file.name}`
            : `Checking photo (${i + 1}/${filesToProcess.length}): ${file.name}`,
          percent: 35,
        });

        const modResult = await moderateImageWithAI(compressed.dataUrl, file.name);
        if (!modResult.isSafe) {
          errors.push(
            isHindi
              ? `तस्वीर अस्वीकृत (${file.name}): ${modResult.reason}`
              : `Image rejected (${file.name}): ${modResult.reason}`
          );
          continue;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '') || 'property-photo';
        const webpFilename = `${baseName}.webp`;
        const uploaded = await uploadFileWithProgress(compressed.blob, webpFilename, (pct) => {
          setUploadProgress({
            label: isHindi
              ? `तस्वीर अपलोड हो रही है (${i + 1}/${filesToProcess.length}): ${file.name}`
              : `Uploading optimized WebP (${i + 1}/${filesToProcess.length}): ${file.name}`,
            percent: Math.max(40, pct),
          });
        });

        if (uploaded.success && uploaded.url) {
          newImgs.push(uploaded.url);
        } else if (uploaded.error) {
          errors.push(uploaded.error);
        }
      } catch (err: any) {
        errors.push(err?.message || `Failed to process "${file.name}".`);
      }
    }

    if (newImgs.length > 0) {
      setImages((prev) => [...prev, ...newImgs]);
    }
    if (errors.length > 0) {
      const combined = errors.join(' ');
      setUploadError(combined);
      setErrorMsg(combined);
    }
    setIsUploadingImage(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

// Image URL input removed per user requirement: gallery / files only

  // Move Image Left / Right
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  // Set Cover Image
  const setAsCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const target = copy.splice(index, 1)[0];
      copy.unshift(target);
      return copy;
    });
  };

  // Delete Image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Property Video Upload Handler (max 3 videos, strict 20 MB per file)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setUploadError(null);

    const maxVideos = 3;
    const remainingSlots = maxVideos - videos.length;
    if (remainingSlots <= 0) {
      const limitErr = isHindi
        ? `अधिकतम ${maxVideos} वीडियो ही जोड़े जा सकते हैं।`
        : `Maximum of ${maxVideos} videos allowed per property.`;
      setUploadError(limitErr);
      setErrorMsg(limitErr);
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    setIsUploadingVideo(true);
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const check = validateUploadFile(file, 'video', isHindi);
      if (!check.valid) {
        errors.push(check.error || `Invalid video: ${file.name}`);
        continue;
      }

      const uploaded = await uploadFileWithProgress(file, file.name, (pct) => {
        setUploadProgress({
          label: isHindi
            ? `वीडियो अपलोड हो रहा है (${i + 1}/${filesToProcess.length}): ${file.name}`
            : `Uploading video (${i + 1}/${filesToProcess.length}): ${file.name}`,
          percent: pct,
        });
      });

      if (uploaded.success && uploaded.url) {
        uploadedUrls.push(uploaded.url);
      } else {
        errors.push(uploaded.error || `Failed to upload "${file.name}".`);
      }
    }

    if (uploadedUrls.length > 0) {
      setVideos((prev) => [...prev, ...uploadedUrls]);
    }
    if (errors.length > 0) {
      const combined = errors.join(' ');
      setUploadError(combined);
      setErrorMsg(combined);
    }
    setIsUploadingVideo(false);
    setUploadProgress(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // Property PDF Document Upload Handler (max 3 documents, strict 20 MB per file)
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setUploadError(null);

    const maxDocs = 3;
    const remainingSlots = maxDocs - documents.length;
    if (remainingSlots <= 0) {
      const limitErr = isHindi
        ? `अधिकतम ${maxDocs} PDF दस्तावेज़ ही जोड़े जा सकते हैं।`
        : `Maximum of ${maxDocs} PDF documents allowed per property.`;
      setUploadError(limitErr);
      setErrorMsg(limitErr);
      if (docInputRef.current) docInputRef.current.value = '';
      return;
    }

    setIsUploadingDoc(true);
    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const uploadedDocs: Array<{ name: string; url: string; size?: number }> = [];
    const errors: string[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const check = validateUploadFile(file, 'document', isHindi);
      if (!check.valid) {
        errors.push(check.error || `Invalid document: ${file.name}`);
        continue;
      }

      const uploaded = await uploadFileWithProgress(file, file.name, (pct) => {
        setUploadProgress({
          label: isHindi
            ? `दस्तावेज़ अपलोड हो रहा है (${i + 1}/${filesToProcess.length}): ${file.name}`
            : `Uploading PDF (${i + 1}/${filesToProcess.length}): ${file.name}`,
          percent: pct,
        });
      });

      if (uploaded.success && uploaded.url) {
        uploadedDocs.push({
          name: uploaded.name || file.name,
          url: uploaded.url,
          size: file.size,
        });
      } else {
        errors.push(uploaded.error || `Failed to upload "${file.name}".`);
      }
    }

    if (uploadedDocs.length > 0) {
      setDocuments((prev) => [...prev, ...uploadedDocs]);
    }
    if (errors.length > 0) {
      const combined = errors.join(' ');
      setUploadError(combined);
      setErrorMsg(combined);
    }
    setIsUploadingDoc(false);
    setUploadProgress(null);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Description Enhancement: STRICTLY preserves only user input
  const handleEnhanceDescription = async () => {
    const raw = description.trim();
    if (raw.length < 5) {
      setErrorMsg(
        isHindi
          ? 'कृपया विवरण बढ़ाने से पहले प्रॉपर्टी के बारे में कुछ मुख्य बातें लिखें।'
          : 'Please write a few details about your property first before enhancing.'
      );
      return;
    }

    setIsEnhancingDesc(true);
    setDescNotice(null);
    setErrorMsg(null);

    try {
      const resp = await fetch(resolveApiUrl('/api/ai/enhance-description'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: raw,
          language: isHindi ? 'hi' : 'en',
          title: title.trim(),
        }),
      });

      const data = await resp.json();
      if (data.success && data.enhanced && data.enhanced.trim().length > 10) {
        setPrevDescription(description);
        setDescription(data.enhanced.trim());
        setDescNotice(
          isHindi
            ? 'विवरण को सफलतापूर्वक बेहतर और सुव्यवस्थित किया गया।'
            : 'Description polished and organized into clear highlights.'
        );
      } else {
        // Safe client-side fallback
        setPrevDescription(description);
        const polished = formatEnhancedDescription(raw, { language: isHindi ? 'hi' : 'en' });
        setDescription(polished);
        setDescNotice(
          isHindi
            ? 'विवरण को व्याकरण और बुलेट पॉइंट्स के साथ व्यवस्थित किया गया।'
            : 'Polished grammar and structure.'
        );
      }
    } catch {
      setPrevDescription(description);
      const polished = formatEnhancedDescription(raw, { language: isHindi ? 'hi' : 'en' });
      setDescription(polished);
      setDescNotice(
        isHindi
          ? 'विवरण को व्याकरण और बुलेट पॉइंट्स के साथ व्यवस्थित किया गया।'
          : 'Polished grammar and structure.'
      );
    } finally {
      setIsEnhancingDesc(false);
    }
  };

  const handleUndoEnhance = () => {
    if (prevDescription !== null) {
      setDescription(prevDescription);
      setPrevDescription(null);
      setDescNotice(null);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentUser) {
      openAuthModal(
        'login',
        isHindi
          ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया पहले साइन इन करें।'
          : 'Please sign in to post or manage a property listing.'
      );
      return;
    }

    if (!sellerName.trim() || sellerName.trim().length < 2) {
      setErrorMsg(
        isHindi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.'
      );
      return;
    }

    // Validation
    const cleanTitle = title.trim();
    if (cleanTitle.length < 4) {
      setErrorMsg(
        isHindi
          ? 'कृपया संपत्ति का एक उचित शीर्षक दर्ज करें (कम से कम 4 अक्षर)।'
          : 'Please enter a clear property title (at least 4 characters).'
      );
      return;
    }

    const cleanLocality = locationAddress.trim();
    if (!cleanLocality) {
      setErrorMsg(
        isHindi
          ? 'कृपया विशिष्ट क्षेत्र / पता (Locality) दर्ज करें।'
          : 'Please enter the specific locality or address.'
      );
      return;
    }

    const parsedArea = parseFloat(areaValue);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      setErrorMsg(
        isHindi
          ? 'कृपया एक मान्य संपत्ति क्षेत्रफल दर्ज करें।'
          : 'Please enter a valid positive property area.'
      );
      return;
    }

    if (transactionType === 'sale') {
      const parsedPrice = parseFloat(totalPriceInput.replace(/,/g, ''));
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        setErrorMsg(
          isHindi
            ? 'कृपया एक मान्य बिक्री मूल्य दर्ज करें।'
            : 'Please enter a valid total property selling price.'
        );
        return;
      }
    } else {
      const parsedRent = parseFloat(monthlyRentInput.replace(/,/g, ''));
      if (isNaN(parsedRent) || parsedRent <= 0) {
        setErrorMsg(
          isHindi
            ? 'कृपया एक मान्य किराया राशि दर्ज करें।'
            : 'Please enter a valid rent amount.'
        );
        return;
      }
    }

    const cleanPhone = sellerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg(
        isHindi
          ? 'कृपया एक मान्य 10 अंकों का संपर्क मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit contact phone number.'
      );
      return;
    }

    if (!declarationAccepted) {
      setErrorMsg(
        isHindi
          ? 'कृपया आगे बढ़ने हेतु घोषणा पत्र को स्वीकार करें।'
          : 'Please accept the declaration checkbox to confirm listing accuracy.'
      );
      return;
    }

    setIsSaving(true);

    try {
      // Calculate region based on district
      const garhwalCities = [
        'Dehradun',
        'Mussoorie',
        'Rishikesh',
        'Haridwar',
        'Devprayag',
        'Uttarkashi',
        'Chakrata',
        'Dhanaulti',
        'Kanatal',
        'Tehri Garhwal',
        'Rudraprayag',
        'Kotdwar',
      ];
      const region: Region = garhwalCities.includes(city) ? 'Garhwal' : 'Kumaon';

      // Numeric area calculation in sqft for standard filtering
      const unitConfig = getAreaUnitConfig(areaUnit);
      const computedSqFt = Math.round(parsedArea * unitConfig.toSqFt);

      const isLand = isLandOrPlotType(type) || category === 'Agriculture';

      // Effective photos
      const effectiveImages =
        images.length > 0
          ? images
          : [
              'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
            ];

      // Format Price Display
      let priceNumeric = 0;
      let priceDisplayStr = '';

      if (transactionType === 'sale') {
        priceNumeric = Math.round(parseFloat(totalPriceInput.replace(/,/g, '')));
        if (priceNumeric >= 10000000) {
          priceDisplayStr = `₹${(priceNumeric / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
        } else if (priceNumeric >= 100000) {
          priceDisplayStr = `₹${(priceNumeric / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
        } else {
          priceDisplayStr = `₹${priceNumeric.toLocaleString('en-IN')}`;
        }
      } else {
        priceNumeric = Math.round(parseFloat(monthlyRentInput.replace(/,/g, '')));
        const suffix = rentPeriod === 'quarterly' ? '/ quarter' : rentPeriod === 'yearly' ? '/ year' : '/ mo';
        priceDisplayStr = `₹${priceNumeric.toLocaleString('en-IN')}${suffix}`;
      }

      const saleRatePerSqFt =
        transactionType === 'sale' && priceNumeric > 0 && computedSqFt > 0
          ? `₹${Math.round(priceNumeric / computedSqFt).toLocaleString('en-IN')}/Sq.Ft`
          : property?.ratePerSqFt;
      const saleRatePerUnit =
        transactionType === 'sale' && areaUnit !== 'sqft' && priceNumeric > 0 && parsedArea > 0
          ? `₹${Math.round(priceNumeric / parsedArea).toLocaleString('en-IN')}/${unitConfig.shortEn}`
          : undefined;

      // Configuration string
      const configStr = isLand
        ? `${formatAreaValueWithUnit(parsedArea, areaUnit, false)} Plot`
        : type === 'Studio'
        ? `Studio Apartment (${furnishing})`
        : type === 'PG'
        ? `${bedrooms > 1 ? `${bedrooms}-Sharing` : 'Single'} PG (${furnishing})`
        : `${bedrooms} BHK ${type} (${furnishing})`;

      // Cleaned Amenities
      const finalAmenities = selectedAmenities.filter(
        (a) => !/road|highway|motorable/i.test(a)
      );

      // Highlights
      const highlights: string[] = isLand ? ['NO PLATFORM FEE'] : ['NO PLATFORM FEE', furnishing];
      if (transactionType === 'rent') {
        highlights.push(`Tenants: ${tenantPreferences.slice(0, 2).join(', ')}`);
      }

      const existingId = property?.id;
      const generatedId =
        existingId ||
        `${transactionType === 'rent' ? 'rental-prop' : 'prop'}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 6)}`;

      const propertyPayload: Property = {
        id: generatedId,
        title: cleanTitle,
        tagline:
          transactionType === 'rent'
            ? isHindi
              ? 'किराये हेतु प्रॉपर्टी • सीधा संपर्क'
              : 'Rental Listing • Direct Contact'
            : isHindi
            ? 'बिक्री हेतु प्रॉपर्टी • सीधा संपर्क'
            : 'Property Listing • Direct Contact',
        type,
        category,
        price: priceNumeric,
        priceDisplay: priceDisplayStr,
        location: cleanLocality ? `${cleanLocality}, ${city}` : city,
        city,
        region,
        areaSqFt: computedSqFt,
        areaValue: parsedArea,
        areaDisplay: formatAreaValueWithUnit(parsedArea, areaUnit, false),
        areaUnit,
        ratePerSqFt: saleRatePerSqFt,
        ratePerGajOrNali: saleRatePerUnit,
        pricingUnit: transactionType === 'rent'
          ? (rentPeriod === 'quarterly' ? 'Per Quarter' : rentPeriod === 'yearly' ? 'Per Year' : 'Per Month')
          : 'Total Price',
        rentPeriod: transactionType === 'rent' ? rentPeriod : undefined,
        configuration: configStr,
        bedrooms: isLand ? 0 : bedrooms,
        bathrooms: isLand ? 0 : bathrooms,
        balconies: isLand ? 0 : balconies,
        images: effectiveImages,
        videoUrl: videos[0] || undefined,
        videos: videos.length > 0 ? videos : undefined,
        documents: documents.length > 0 ? documents : undefined,
        description:
          description.trim() ||
          (transactionType === 'rent'
            ? isLand
              ? `${configStr} available for rent in ${city}.`
              : `${configStr} available for rent in ${city}. Furnishing: ${furnishing}. Preferred Tenants: ${tenantPreferences.join(', ')}.`
            : `${configStr} available for sale in ${city}.`),
        highlights,
        amenities: finalAmenities,
        furnishing: isLand ? undefined : furnishing,
        sellerName: sellerName.trim() || currentUser?.username || 'Direct Owner',
        sellerPhone: cleanPhone,
        sellerEmail: (currentUser as any)?.email || undefined,
        sellerType,
        ownerId: property?.ownerId || currentUser?.id || `guest-${Date.now()}`,
        ownerContact: cleanPhone,
        ownerUsername: currentUser?.username || undefined,
        isSold: property?.isSold || false,
        isAvailableForRent: transactionType === 'rent',
        purpose: transactionType,
        monthlyRent: transactionType === 'rent'
          ? (rentPeriod === 'quarterly' ? Math.round(priceNumeric / 3) : rentPeriod === 'yearly' ? Math.round(priceNumeric / 12) : priceNumeric)
          : undefined,
        securityDeposit:
          transactionType === 'rent' ? parseFloat(securityDepositInput) || 0 : undefined,
        maintenanceCharges: transactionType === 'rent' ? parseFloat(maintenanceInput) || 0 : 0,
        availableFrom: transactionType === 'rent' ? availableFrom : undefined,
        preferredTenants: transactionType === 'rent' ? tenantPreferences : undefined,
        createdAt: property?.createdAt || new Date().toISOString(),
        postedAt: property?.postedAt || 'Just now',
        views: property?.views ?? 0,
        shares: property?.shares ?? 0,
        inquiries: property?.inquiries ?? 0,
      };

      // Call Backend API
      const isEditMode = Boolean(property && property.id);
      const url = isEditMode
        ? resolveApiUrl(`/api/properties/${property!.id}`)
        : resolveApiUrl('/api/properties');
      const method = isEditMode ? 'PUT' : 'POST';

      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-client-platform': typeof window !== 'undefined' && isNativeAndroidApp() ? 'android' : 'web',
      };
      try {
        const token = localStorage.getItem('ukg_session_token');
        if (token) authHeaders['Authorization'] = `Bearer ${token}`;
      } catch {}

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify(propertyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server rejected listing (HTTP ${response.status})`);
      }

      const savedData = await response.json().catch(() => ({}));
      const finalSavedProperty: Property = savedData?.property
        ? { ...propertyPayload, ...savedData.property, sellerPhone: cleanPhone }
        : propertyPayload;
      (finalSavedProperty as any).__persistedOnServer = true;

      // Record ID locally so the creator always has ownership rights
      recordUploadedPropertyId(propertyPayload.id);

      // Update LocalStorage Cache & Dispatch Sync Event
      try {
        const rawLocal = localStorage.getItem('uk_gateways_uploaded_properties');
        let currentList: Property[] = rawLocal ? JSON.parse(rawLocal) : [];
        if (isEditMode) {
          currentList = currentList.map((p) => (p.id === propertyPayload.id ? propertyPayload : p));
        } else {
          currentList = [propertyPayload, ...currentList.filter((p) => p.id !== propertyPayload.id)];
        }
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(currentList));
        window.dispatchEvent(
          new CustomEvent('uk_gateways_properties_updated', { detail: currentList })
        );
      } catch {}

      if (onUpdateLastUploadTime) {
        onUpdateLastUploadTime(Date.now());
      }

      setSuccessMsg(
        isEditMode
          ? isHindi
            ? 'संपत्ति का विवरण सफलतापूर्वक अपडेट कर दिया गया है!'
            : 'Property details updated successfully!'
          : isHindi
          ? 'संपत्ति सफलतापूर्वक लिस्ट हो गई है!'
          : 'Property published successfully!'
      );

      onPropertySaved?.(finalSavedProperty);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('UnifiedListingModal save error:', err);
      setIsSaving(false);
      setErrorMsg(
        err.message ||
          (isHindi ? 'संपत्ति सहेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to save property. Please try again.')
      );
    }
  };

  if (!isOpen && !isPageMode) return null;

  if (!currentUser) {
    const authGateCard = (
      <div className="max-w-lg mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु लॉगिन आवश्यक है' : 'Sign In Required to Post a Property'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {isHindi
            ? 'कोई भी व्यक्ति बिना लॉगिन किए सभी प्रॉपर्टीज देख सकता है, सेव कर सकता है और लिस्र्टर से संपर्क कर सकता है। नई प्रॉपर्टी लिस्ट या प्रबंधित करने के लिए कृपया अपने खाते में साइन इन करें।'
            : 'Browsing, bookmarking, and contacting listers do not require an account. To post or manage a property listing, please sign in or create an account.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() =>
              openAuthModal(
                'login',
                isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु साइन इन करें।' : 'Sign in or register to post your property listing.'
              )
            }
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer"
          >
            {isHindi ? 'साइन इन / खाता बनाएं' : 'Sign In / Create Account'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isHindi ? 'वापस जाएं' : 'Back'}
          </button>
        </div>
      </div>
    );
    return isPageMode ? (
      authGateCard
    ) : (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>{authGateCard}</div>
      </div>
    );
  }

  const isLandOrPlotSelected = isLandOrPlotType(type) || category === 'Agriculture';
  const selectedAreaUnitConfig = getAreaUnitConfig(areaUnit);
  const parsedSalePriceNum = parseFloat(totalPriceInput.replace(/,/g, '')) || 0;
  const parsedAreaInputNum = parseFloat(areaValue) || 0;
  const pricePerSelectedUnit =
    transactionType === 'sale' && parsedSalePriceNum > 0 && parsedAreaInputNum > 0
      ? Math.round(parsedSalePriceNum / parsedAreaInputNum)
      : 0;
  const pricePerSqFtSale =
    transactionType === 'sale' &&
    parsedSalePriceNum > 0 &&
    parsedAreaInputNum > 0 &&
    selectedAreaUnitConfig.toSqFt > 0
      ? Math.round(parsedSalePriceNum / (parsedAreaInputNum * selectedAreaUnitConfig.toSqFt))
      : 0;

  const content = (
    <div
      className={
        isPageMode
          ? 'w-full max-w-4xl mx-auto bg-white dark:bg-[#061a12] sm:rounded-3xl border-0 sm:border border-emerald-300 dark:border-emerald-800/80 shadow-none sm:shadow-2xl p-2.5 sm:p-7 text-slate-800 dark:text-slate-100'
          : 'relative w-full max-w-3xl bg-white dark:bg-[#071c14] rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl border-0 sm:border border-emerald-300 dark:border-emerald-800/80 overflow-hidden my-0 sm:my-auto h-full sm:h-auto max-h-none sm:max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 modal-animate-pop'
      }
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-[#05291e] text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-white/10 text-emerald-200 border border-white/15">
            {transactionType === 'rent' ? <Key className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {property
                  ? isHindi
                    ? 'लिस्टिंग संपादित करें (Edit Listing)'
                    : 'Edit Property Listing'
                  : transactionType === 'rent'
                  ? isHindi
                    ? 'किराये हेतु संपत्ति लिस्ट करें'
                    : 'List Rental Property'
                  : isHindi
                  ? 'प्रॉपर्टी बेचें'
                  : 'Sell Property'}
              </h2>
              <span className="bg-emerald-500/20 text-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-400/40">
                NO PLATFORM FEE
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {transactionType === 'rent'
                ? isHindi
                  ? 'किरायेदारों से सीधा संपर्क • कोई प्लेटफॉर्म शुल्क नहीं'
                  : 'Connect directly with interested tenants • No Platform Fee'
                : isHindi
                ? 'खरीदारों से सीधा संपर्क • कोई प्लेटफॉर्म शुल्क नहीं'
                : 'Connect directly with interested buyers • No Platform Fee'}
            </p>
          </div>
        </div>

        {!isPageMode && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Segmented Sale vs Rent Switcher */}
      <div className="p-3 sm:px-6 bg-slate-100/90 dark:bg-[#05160f] border-b border-slate-200 dark:border-emerald-950/80 shrink-0">
        <div className="bg-slate-200/80 dark:bg-[#071f16] p-1.5 rounded-2xl border border-slate-300 dark:border-emerald-900/60 grid grid-cols-2 gap-2 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setTransactionType('sale');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              transactionType === 'sale'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{isHindi ? '🏷️ बिक्री हेतु (For Sale)' : '🏷️ For Sale'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTransactionType('rent');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              transactionType === 'rent'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{isHindi ? '🔑 किराये हेतु (For Rent)' : '🔑 For Rent'}</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Form Body */}
      <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SECTION 1: BASIC INFORMATION & LOCATION */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#0a2318] border border-slate-200/80 dark:border-emerald-900/40 space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide border-b border-slate-200/80 dark:border-emerald-950 pb-2">
            <Building2 className="w-4 h-4" />
            <span>1. {isHindi ? 'बुनियादी विवरण एवं स्थान' : 'Basic Information & Location'}</span>
          </div>

          {/* Lister Identity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isHindi ? 'मैं लिस्ट कर रहा हूँ (Listing As):' : 'I am listing as:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Owner', 'Broker'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSellerType(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    sellerType === r
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  {r === 'Owner'
                    ? isHindi
                      ? 'सीधे मालिक (Owner)'
                      : 'Direct Owner'
                    : isHindi
                      ? 'ब्रोकर (Broker)'
                      : 'Broker'}
                </button>
              ))}
            </div>
          </div>

          {/* Property Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isHindi ? 'संपत्ति का मुख्य शीर्षक (Property Title) *' : 'Property Title *'}
              </label>
              <span className="text-[10px] text-slate-400">{title.length}/100</span>
            </div>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                transactionType === 'rent'
                  ? isHindi
                    ? 'उदा. राजपुर रोड देहरादून में 2 BHK लग्जरी वैली-व्यू फ्लैट'
                    : 'e.g. 2 BHK Mountain View Luxury Apartment on Rajpur Road'
                  : isHindi
                  ? 'उदा. मसूरी मॉल रोड के समीप 3 BHK विला'
                  : 'e.g. 3 BHK Luxury Mountain Cottage with Himalayan View'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Category & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'श्रेणी (Category) *' : 'Category *'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Residential'
                      ? isHindi
                        ? 'आवासीय (Residential)'
                        : 'Residential'
                      : c === 'Commercial'
                      ? isHindi
                        ? 'व्यावसायिक (Commercial)'
                        : 'Commercial'
                      : isHindi
                      ? 'कृषि भूमि (Agriculture)'
                      : 'Agriculture'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'प्रकार (Property Type) *' : 'Property Type *'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City & Specific Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'जिला / शहर (City / District) *' : 'City / District *'}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value as UttarakhandCity)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'विशिष्ट क्षेत्र / पता (Locality) *' : 'Specific Locality / Address *'}
              </label>
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder={isHindi ? 'उदा. राजपुर रोड, हाथीबड़कला' : 'e.g. Rajpur Road, Jakhan'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONFIGURATION & PROPERTY SIZE */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#0a2318] border border-slate-200/80 dark:border-emerald-900/40 space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide border-b border-slate-200/80 dark:border-emerald-950 pb-2">
            <Layers className="w-4 h-4" />
            <span>
              2.{' '}
              {isLandOrPlotSelected
                ? isHindi
                  ? 'भूमि / प्लॉट क्षेत्रफल'
                  : 'Plot / Land Area'
                : isHindi
                ? 'क्षेत्रफल और कॉन्फ़िगरेशन'
                : 'Area & Configuration'}
            </span>
          </div>

          {/* 1. Area & Area Unit (Always first) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'क्षेत्रफल (Area) *' : 'Area *'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={areaValue}
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => handleAreaValueChange(e.target.value)}
                placeholder={isHindi ? 'क्षेत्रफल दर्ज करें' : 'Enter property area'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'माप इकाई (Area Unit) *' : 'Area Unit *'}
              </label>
              <select
                value={areaUnit}
                onChange={(e) => handleAreaUnitChange(e.target.value as AreaUnit)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                {AREA_UNITS.map((unitOpt) => (
                  <option key={unitOpt.value} value={unitOpt.value}>
                    {isHindi
                      ? unitOpt.labelHi
                      : unitOpt.toSqFt === 1
                      ? unitOpt.labelEn
                      : `${unitOpt.labelEn} (${unitOpt.toSqFt.toLocaleString('en-IN')} Sq.Ft)`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Bedrooms / Bathrooms / Balconies & 3. Furnishing (Hidden when Land/Plot is selected) */}
          {!isLandOrPlotSelected && (
            <>
              {/* Rooms Counters */}
              <div className="grid grid-cols-3 gap-3">
                {/* Bedrooms */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    {isHindi ? 'बेडरूम (Bedrooms)' : 'Bedrooms'}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBedrooms((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-emerald-100 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm w-5">{bedrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBedrooms((prev) => Math.min(10, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-emerald-100 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    {isHindi ? 'बाथरूम (Baths)' : 'Bathrooms'}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBathrooms((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-emerald-100 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm w-5">{bathrooms}</span>
                    <button
                      type="button"
                      onClick={() => setBathrooms((prev) => Math.min(10, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-emerald-100 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Balconies */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    {isHindi ? 'बालकनी (Balconies)' : 'Balconies'}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBalconies((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-emerald-100 active:scale-95 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-extrabold text-sm w-5">{balconies}</span>
                    <button
                      type="button"
                      onClick={() => setBalconies((prev) => Math.min(6, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-emerald-100 active:scale-95 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isHindi ? 'सुसज्जित स्थिति (Furnishing Status):' : 'Furnishing Status:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Furnished', 'Semi-Furnished', 'Unfurnished'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFurnishing(f)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        furnishing === f
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      {f === 'Furnished'
                        ? isHindi
                          ? 'पूर्ण सुसज्जित'
                          : 'Furnished'
                        : f === 'Semi-Furnished'
                        ? isHindi
                          ? 'अर्ध सुसज्जित'
                          : 'Semi-Furnished'
                        : isHindi
                        ? 'असुसज्जित'
                        : 'Unfurnished'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* SECTION 3: PRICING & COMMERCIAL TERMS */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#0a2318] border border-slate-200/80 dark:border-emerald-900/40 space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide border-b border-slate-200/80 dark:border-emerald-950 pb-2">
            <IndianRupee className="w-4 h-4" />
            <span>
              3.{' '}
              {transactionType === 'sale'
                ? isHindi
                  ? 'बिक्री मूल्य व शर्तें'
                  : 'Sale Pricing & Commercial Terms'
                : isHindi
                ? 'किराया व नियम'
                : 'Rental Pricing & Terms'}
            </span>
          </div>

          {transactionType === 'sale' ? (
            /* SALE PRICING (Two-way Auto Calculator between Value per Unit & Total Price) */
            <div className="space-y-3.5">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isHindi ? 'कुल बिक्री मूल्य (Total Price in ₹) *' : 'Total Property Price (in ₹) *'}
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Live Conversion Badge */}
                    {parsedSalePriceNum > 0 && (
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {parsedSalePriceNum >= 10000000
                          ? `₹${(parsedSalePriceNum / 10000000).toFixed(2)} Cr`
                          : parsedSalePriceNum >= 100000
                          ? `₹${(parsedSalePriceNum / 100000).toFixed(2)} Lakh`
                          : `₹${parsedSalePriceNum.toLocaleString('en-IN')}`}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAutoCalculator((prev) => {
                          const next = !prev;
                          if (next) {
                            setTimeout(() => rateInputRef.current?.focus(), 40);
                          }
                          return next;
                        });
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer active:scale-95 ${
                        showAutoCalculator
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'ऑटो कैलकुलेट (प्रति इकाई)' : 'Auto Calculate'}</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={totalPriceInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => handleTotalPriceChange(e.target.value)}
                    placeholder={isHindi ? 'कुल मूल्य दर्ज करें' : 'Enter property amount'}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Interactive Auto Calculator Panel: Enter Value per Unit -> Auto-calculates Total Price */}
                {showAutoCalculator ? (
                  <div
                    id="sell-auto-calculator-panel"
                    className="mt-2.5 p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {isHindi
                            ? `प्रति ${selectedAreaUnitConfig.shortHi} मूल्य से कुल कीमत ऑटो-कैलकुलेट करें`
                            : `Auto Calculate Total Price from Value per ${selectedAreaUnitConfig.shortEn}`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAutoCalculator(false)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                        aria-label="Close Auto Calculator"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                          {isHindi
                            ? `मूल्य प्रति ${selectedAreaUnitConfig.shortHi} (₹) *`
                            : `Value / Rate per ${selectedAreaUnitConfig.shortEn} (₹)`}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            ref={rateInputRef}
                            type="text"
                            inputMode="decimal"
                            value={ratePerUnitInput}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => handleRatePerUnitChange(e.target.value)}
                            placeholder={isHindi ? 'प्रति इकाई दर दर्ज करें' : 'Enter rate per unit'}
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                          {isHindi
                            ? `कुल क्षेत्रफल (${selectedAreaUnitConfig.shortHi})`
                            : `Area (${selectedAreaUnitConfig.shortEn})`}
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={areaValue}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => handleAreaValueChange(e.target.value)}
                            placeholder={isHindi ? 'क्षेत्रफल' : 'Enter area'}
                            className="w-1/2 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <select
                            value={areaUnit}
                            onChange={(e) => handleAreaUnitChange(e.target.value as AreaUnit)}
                            className="w-1/2 px-2 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer truncate"
                          >
                            {AREA_UNITS.map((u) => (
                              <option key={u.value} value={u.value}>
                                {isHindi ? u.shortHi : u.shortEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {parsedSalePriceNum > 0 && parsedAreaInputNum > 0 && (
                      <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                          {parsedAreaInputNum.toLocaleString('en-IN')}{' '}
                          {isHindi ? selectedAreaUnitConfig.shortHi : selectedAreaUnitConfig.shortEn} × ₹
                          {(parseFloat(ratePerUnitInput) || pricePerSelectedUnit).toLocaleString('en-IN')} =
                        </span>
                        <div className="flex items-center gap-2 font-black text-emerald-950 dark:text-emerald-200">
                          <span>₹{parsedSalePriceNum.toLocaleString('en-IN')}</span>
                          {areaUnit !== 'sqft' && pricePerSqFtSale > 0 && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              ≈ ₹{pricePerSqFtSale.toLocaleString('en-IN')} / Sq.Ft
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Clickable Auto-calculated Price Per Unit Bar (Click to enter Value per Unit) */
                  <button
                    type="button"
                    id="sell-price-per-unit-box"
                    onClick={() => {
                      setShowAutoCalculator(true);
                      setTimeout(() => rateInputRef.current?.focus(), 40);
                    }}
                    className="mt-2 w-full px-3.5 py-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-left transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {pricePerSelectedUnit > 0
                          ? isHindi
                            ? `ऑटो-कैलकुलेटेड दर (${selectedAreaUnitConfig.shortHi} के अनुसार — बदलने हेतु क्लिक करें):`
                            : `Auto-calculated Price per ${selectedAreaUnitConfig.shortEn} (click to enter rate):`
                          : isHindi
                          ? `प्रति ${selectedAreaUnitConfig.shortHi} दर लिखकर कुल कीमत ऑटो-कैलकुलेट करने हेतु क्लिक करें`
                          : `Click to enter value per ${selectedAreaUnitConfig.shortEn} & auto-calculate total price`}
                      </span>
                    </span>
                    {pricePerSelectedUnit > 0 && (
                      <div className="flex items-center gap-2 font-black text-emerald-900 dark:text-emerald-200">
                        <span>
                          ₹{pricePerSelectedUnit.toLocaleString('en-IN')} /{' '}
                          {isHindi ? selectedAreaUnitConfig.shortHi : selectedAreaUnitConfig.shortEn}
                        </span>
                        {areaUnit !== 'sqft' && pricePerSqFtSale > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            ≈ ₹{pricePerSqFtSale.toLocaleString('en-IN')} / Sq.Ft
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPriceNegotiable}
                    onChange={(e) => setIsPriceNegotiable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isHindi ? 'मूल्य पर बातचीत संभव (Price Negotiable)' : 'Price is Negotiable'}
                  </span>
                </label>
              </div>
            </div>
          ) : (
            /* RENTAL PRICING & TENANT PREFERENCES */
            <div className="space-y-4">
              {/* Rent Frequency Selection: Monthly, Quarterly, Yearly */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isHindi ? 'किराये की अवधि (Rent Frequency) *' : 'Rent Frequency *'}
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRentPeriod('monthly')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rentPeriod === 'monthly'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isHindi ? 'मासिक (Monthly)' : 'Monthly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentPeriod('quarterly')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rentPeriod === 'quarterly'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isHindi ? 'त्रैमासिक (Quarterly)' : 'Quarterly'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentPeriod('yearly')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rentPeriod === 'yearly'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isHindi ? 'वार्षिक (Yearly)' : 'Yearly'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {rentPeriod === 'quarterly'
                      ? isHindi
                        ? 'त्रैमासिक किराया (Quarterly Rent in ₹) *'
                        : 'Quarterly Rent (in ₹) *'
                      : rentPeriod === 'yearly'
                      ? isHindi
                        ? 'वार्षिक किराया (Yearly Rent in ₹) *'
                        : 'Yearly Rent (in ₹) *'
                      : isHindi
                      ? 'मासिक किराया (Monthly Rent in ₹) *'
                      : 'Monthly Rent (in ₹) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={monthlyRentInput}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => setMonthlyRentInput(sanitizeAmountDigits(e.target.value))}
                      placeholder={isHindi ? 'किराया राशि दर्ज करें' : 'Enter rent amount'}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'सुरक्षा जमा (Security Deposit in ₹)' : 'Security Deposit (in ₹)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={securityDepositInput}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => setSecurityDepositInput(sanitizeAmountDigits(e.target.value))}
                      placeholder={isHindi ? 'सुरक्षा जमा राशि दर्ज करें' : 'Enter security deposit'}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {rentPeriod === 'quarterly'
                      ? isHindi
                        ? 'त्रैमासिक मेंटेनेंस (₹ / तिमाही)'
                        : 'Quarterly Maintenance (₹/quarter)'
                      : rentPeriod === 'yearly'
                      ? isHindi
                        ? 'वार्षिक मेंटेनेंस (₹ / वर्ष)'
                        : 'Yearly Maintenance (₹/yr)'
                      : isHindi
                      ? 'मासिक मेंटेनेंस (₹ / माह)'
                      : 'Monthly Maintenance Fee (₹/mo)'}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={maintenanceInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => setMaintenanceInput(sanitizeAmountDigits(e.target.value))}
                    placeholder={isHindi ? 'मेंटेनेंस शुल्क दर्ज करें (वैकल्पिक)' : 'Enter maintenance amount (optional)'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'उपलब्धता तिथि (Available From) *' : 'Available From *'}
                  </label>
                  <select
                    value={
                      ['Immediate', 'Within 7 Days', 'Within 15 Days', 'Within 30 Days', 'After 30 Days'].includes(availableFrom)
                        ? availableFrom
                        : 'Specific Date'
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Specific Date') {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setAvailableFrom(tomorrow.toISOString().split('T')[0]);
                      } else {
                        setAvailableFrom(val);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                  >
                    <option value="Immediate">{isHindi ? 'तत्काल उपलब्ध (Immediate / Ready to Move)' : 'Immediate (Ready to Move)'}</option>
                    <option value="Within 7 Days">{isHindi ? '7 दिनों के भीतर (Within 7 Days)' : 'Within 7 Days'}</option>
                    <option value="Within 15 Days">{isHindi ? '15 दिनों के भीतर (Within 15 Days)' : 'Within 15 Days'}</option>
                    <option value="Within 30 Days">{isHindi ? '30 दिनों के भीतर (Within 30 Days)' : 'Within 30 Days'}</option>
                    <option value="After 30 Days">{isHindi ? '30 दिनों के बाद (After 30 Days)' : 'After 30 Days'}</option>
                    <option value="Specific Date">{isHindi ? 'विशिष्ट तिथि चुनें (Pick Specific Date)' : 'Pick Specific Date'}</option>
                  </select>

                  {!['Immediate', 'Within 7 Days', 'Within 15 Days', 'Within 30 Days', 'After 30 Days'].includes(availableFrom) && (
                    <div className="mt-2">
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Tenants Multi-Select Chips (ALL categories included, Family not Family Only) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
                    {isHindi ? 'किरायेदार प्राथमिकता (कई विकल्प चुनें) *' : 'Preferred Tenant Categories (Choose Multiple) *'}
                  </label>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    {tenantPreferences.length} {isHindi ? 'चुने गए' : 'selected'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ALL_TENANT_CATEGORIES.map((cat) => {
                    const isSelected = tenantPreferences.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleTenant(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{isHindi ? cat.labelHi : cat.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: PHOTOS, VIDEOS & DOCUMENTS */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#0a2318] border border-slate-200/80 dark:border-emerald-900/40 space-y-3.5 sm:space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-emerald-950 pb-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide">
              <ImageIcon className="w-4 h-4" />
              <span>4. {isHindi ? 'प्रॉपर्टी की तस्वीरें, वीडियो व दस्तावेज़' : 'Property Photos, Videos & Documents'}</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {images.length}/15 {isHindi ? 'तस्वीरें' : 'Photos'} • {videos.length}/3 {isHindi ? 'वीडियो' : 'Videos'} • {isHindi ? `अधिकतम ${MAX_UPLOAD_FILE_MB} MB/फ़ाइल` : `Max ${MAX_UPLOAD_FILE_MB} MB/file`}
            </span>
          </div>

          {/* Live Upload Progress Bar */}
          {uploadProgress && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200 gap-2">
                <span className="truncate">{uploadProgress.label}</span>
                <span className="shrink-0 font-mono">{uploadProgress.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-200/70 dark:bg-emerald-900 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Inline File Validation / Upload Error Alert */}
          {uploadError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start justify-between gap-2 text-xs text-rose-800 dark:text-rose-200"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-rose-500 hover:text-rose-700 font-bold px-1 cursor-pointer"
                aria-label="Dismiss upload error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Photo Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-400/80 dark:border-emerald-800 rounded-2xl p-5 text-center cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
              onChange={handleFileUpload}
              className="hidden"
            />
            {isUploadingImage ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">
                  {isHindi ? 'तस्वीरें WebP में अनुकूलित व अपलोड हो रही हैं...' : 'Optimizing & uploading WebP photos...'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                    {isHindi ? 'गैलरी / डिवाइस से तस्वीरें चुनें' : 'Choose Photos from Gallery / Device'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isHindi
                      ? 'JPG, PNG, WEBP, AVIF • स्वचालित WebP संपीड़न • अधिकतम 20 MB प्रति फ़ाइल'
                      : 'JPG, PNG, WEBP, AVIF • Auto-optimized to WebP • Max 20 MB per photo'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Image Thumbnails with Reordering & Cover Selection */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video shadow-xs"
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />

                  {/* Cover Badge */}
                  {idx === 0 ? (
                    <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsCover(idx)}
                      className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 bg-slate-950/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-emerald-600 transition-all cursor-pointer"
                    >
                      <Star className="w-2.5 h-2.5" />
                      Set Cover
                    </button>
                  )}

                  {/* Move Left / Right / Delete Actions */}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'left')}
                          className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'right')}
                          className="p-1 rounded bg-white/20 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                          title="Move Right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Property Videos Upload Dropzone & Preview */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-teal-800 dark:text-teal-300">
                <Video className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{isHindi ? 'प्रॉपर्टी वीडियो (वैकल्पिक)' : 'Property Videos (Optional Walkthrough)'}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {videos.length}/3
              </span>
            </div>

            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-teal-400/80 dark:border-teal-800 rounded-2xl p-4 text-center cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all group"
            >
              <input
                type="file"
                ref={videoInputRef}
                multiple
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                className="hidden"
              />
              {isUploadingVideo ? (
                <div className="flex flex-col items-center gap-2 text-teal-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-bold">{isHindi ? 'वीडियो अपलोड हो रहा है...' : 'Uploading property video...'}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                    {isHindi ? 'प्रॉपर्टी वीडियो अपलोड करें' : 'Upload Property Videos from Device'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isHindi ? 'MP4, MOV, WEBM (अधिकतम 3 वीडियो • 20 MB प्रति फ़ाइल)' : 'MP4, MOV, WEBM (Up to 3 videos • max 20 MB each)'}
                  </span>
                </div>
              )}
            </div>

            {videos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {videos.map((vid, vIdx) => (
                  <div
                    key={vIdx}
                    className="relative group rounded-xl overflow-hidden border border-teal-300 dark:border-teal-800 bg-black aspect-video shadow-sm"
                  >
                    <video
                      src={resolveApiUrl(vid)}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(vIdx)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white shadow-md cursor-pointer transition-colors"
                      title={isHindi ? 'वीडियो हटाएं' : 'Remove video'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Property Documents (PDF Floor Plan / Brochure • Max 20 MB) */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-emerald-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-emerald-200">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'प्रॉपर्टी दस्तावेज़ / नक्शा (वैकल्पिक PDF)' : 'Property Brochure / Layout Plan (Optional PDF)'}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">{documents.length}/3</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="file"
                ref={docInputRef}
                multiple
                accept="application/pdf,.pdf"
                onChange={handleDocumentUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingDoc}
                onClick={() => docInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
              >
                {isUploadingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <Upload className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isHindi ? 'PDF अपलोड करें (अधिकतम 20 MB)' : 'Attach PDF Document (Max 20 MB)'}</span>
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'केवल PDF फ़ाइलें अनुमत हैं।' : 'PDF files only • Publicly viewable on listing'}
              </span>
            </div>

            {documents.length > 0 && (
              <div className="space-y-1.5">
                {documents.map((doc, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-800/70 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <a
                        href={resolveApiUrl(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-slate-800 dark:text-slate-100 hover:underline truncate"
                      >
                        {doc.name}
                      </a>
                      {doc.size ? (
                        <span className="text-[10px] text-slate-400 shrink-0">({formatFileSizeMB(doc.size)})</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(dIdx)}
                      className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer shrink-0"
                      title={isHindi ? 'दस्तावेज़ हटाएं' : 'Remove document'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: AMENITIES */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#0a2318] border border-slate-200/80 dark:border-emerald-900/40 space-y-3.5 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-emerald-950 pb-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>5. {isHindi ? 'सुविधाएं व विशेषताएं' : 'Amenities & Features'}</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {selectedAmenities.length} {isHindi ? 'चयनित' : 'selected'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isHindi
              ? 'प्रॉपर्टी में मौजूद सभी सुविधाएं चुनें ताकि खरीदार / किरायेदार आसानी से आकर्षित हों:'
              : 'Select all available amenities to highlight the best features of your property:'}
          </p>

          {/* Interactive Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
            {PRESET_AMENITIES.map((am) => {
              const isSelected = selectedAmenities.some(
                (a) => a.trim().toLowerCase() === am.labelEn.trim().toLowerCase()
              );
              const IconComp = am.icon;
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAmenity(am.labelEn);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer touch-manipulation select-none active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-2xs ring-1 ring-emerald-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pointer-events-none select-none">
                    <div className="flex items-center gap-1.5 text-xs font-bold truncate pointer-events-none">
                      <IconComp className="w-3.5 h-3.5 text-emerald-600 shrink-0 pointer-events-none" />
                      <span className="truncate pointer-events-none">{am.labelEn}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate pointer-events-none">
                      {isHindi ? am.labelHi : am.labelEn}
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 pointer-events-none select-none ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3] pointer-events-none" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Amenity Adder */}
          <div className="pt-1 flex gap-2">
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
              placeholder={isHindi ? 'अन्य कोई खास सुविधा जोड़ें (उदा. रूफ टेरेस, बारबेक्यू)...' : 'Add custom amenity (e.g. Roof Terrace BBQ, Servant Room)...'}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddCustomAmenity}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all"
            >
              + {isHindi ? 'जोड़ें' : 'Add'}
            </button>
          </div>

          {/* Custom Amenity Tags Display */}
          {selectedAmenities.filter(
            (sa) => !PRESET_AMENITIES.some((am) => am.labelEn.trim().toLowerCase() === sa.trim().toLowerCase())
          ).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedAmenities
                .filter((sa) => !PRESET_AMENITIES.some((am) => am.labelEn.trim().toLowerCase() === sa.trim().toLowerCase()))
                .map((customAm) => (
                  <span
                    key={customAm}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 text-xs font-semibold"
                  >
                    <span>{customAm}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleAmenity(customAm);
                      }}
                      className="hover:text-rose-500 cursor-pointer p-0.5"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* SECTION 6: SELLER CONTACT, AI DESCRIPTION & VERIFICATION */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 dark:bg-[#0a2318] border border-slate-200/80 dark:border-emerald-900/40 space-y-3.5 sm:space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wide border-b border-slate-200/80 dark:border-emerald-950 pb-2">
            <Phone className="w-4 h-4" />
            <span>6. {isHindi ? 'संपर्क, विवरण एवं सत्यापन' : 'Contact, Description & Verification'}</span>
          </div>

          {/* Seller Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'मालिक / ब्रोकर का नाम (Name) *' : 'Contact Person / Owner Name *'}
              </label>
              <input
                type="text"
                name="sellerName"
                id="sellerName"
                autoComplete="name"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder={isHindi ? "अपना नाम दर्ज करें" : "Enter your name"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isHindi ? 'मोबाइल नंबर (Phone) *' : 'Mobile Number (10 digits) *'}
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                name="contact_mobile_phone_no"
                id="sellerPhone"
                required
                maxLength={10}
                value={sellerPhone && !sellerPhone.includes('@') && !/[a-zA-Z]/.test(sellerPhone) ? sellerPhone : ''}
                onInput={(e) => {
                  const val = e.currentTarget.value;
                  if (val && (val.includes('@') || /[a-zA-Z]/.test(val))) {
                    e.currentTarget.value = '';
                    setSellerPhone('');
                  }
                }}
                onFocus={(e) => {
                  const val = e.currentTarget.value;
                  if (val && (val.includes('@') || /[a-zA-Z]/.test(val))) {
                    e.currentTarget.value = '';
                    setSellerPhone('');
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes('@') || /[a-zA-Z]/.test(val)) return;
                  const cleaned = val.replace(/\D/g, '').slice(0, 10);
                  setSellerPhone(cleaned);
                }}
                placeholder={isHindi ? "अपना मोबाइल नंबर दर्ज करें" : "Enter your mobile number"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                <MessageCircle className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                {isHindi ? 'व्हाट्सएप नंबर (WhatsApp)' : 'WhatsApp Number'}
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappSameAsPhone}
                  onChange={(e) => setWhatsappSameAsPhone(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>{isHindi ? 'मोबाइल नंबर के समान' : 'Same as phone'}</span>
              </label>
            </div>

            {!whatsappSameAsPhone && (
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                name="contact_whatsapp_phone_no"
                id="sellerWhatsApp"
                maxLength={10}
                value={sellerWhatsApp && !sellerWhatsApp.includes('@') && !/[a-zA-Z]/.test(sellerWhatsApp) ? sellerWhatsApp : ''}
                onInput={(e) => {
                  const val = e.currentTarget.value;
                  if (val && (val.includes('@') || /[a-zA-Z]/.test(val))) {
                    e.currentTarget.value = '';
                    setSellerWhatsApp('');
                  }
                }}
                onFocus={(e) => {
                  const val = e.currentTarget.value;
                  if (val && (val.includes('@') || /[a-zA-Z]/.test(val))) {
                    e.currentTarget.value = '';
                    setSellerWhatsApp('');
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes('@') || /[a-zA-Z]/.test(val)) return;
                  const cleaned = val.replace(/\D/g, '').slice(0, 10);
                  setSellerWhatsApp(cleaned);
                }}
                placeholder={isHindi ? "अपना मोबाइल नंबर दर्ज करें" : "Enter your mobile number"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            )}
          </div>

          {/* Description & AI Enhance Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isHindi ? 'संपत्ति का विस्तृत विवरण (Description)' : 'Property Description'}
              </label>
              <div className="flex items-center gap-2">
                {prevDescription !== null && (
                  <button
                    type="button"
                    onClick={handleUndoEnhance}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isHindi ? 'पहले जैसा करें (Undo)' : 'Undo'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleEnhanceDescription}
                  disabled={isEnhancingDesc || description.trim().length < 5}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {isEnhancingDesc ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{isHindi ? 'विवरण संवर रहा है...' : 'Enhancing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{isHindi ? '✨ AI विवरण संवारें' : '✨ AI Polish Description'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                transactionType === 'rent'
                  ? isHindi
                    ? 'किरायेदार हेतु आवश्यक शर्तें, बिजली-पानी बिल व्यवस्था, शांत वातावरण आदि विवरण यहाँ लिखें...'
                    : 'Describe the rental property, lease conditions, utility arrangements, and peaceful surroundings...'
                  : isHindi
                    ? 'प्रॉपर्टी की खासियत, रजिस्ट्री स्थिति, खुला वातावरण, निर्माण गुणवत्ता आदि का विवरण यहाँ लिखें...'
                    : 'Describe key property highlights, registry status, construction quality, mountain views, and location advantages...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-900/80 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />

            {descNotice && (
              <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ {descNotice}
              </span>
            )}
          </div>

          {/* Legal Declaration Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0 mt-0.5 cursor-pointer"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              {isHindi
                ? 'मैं पुष्टि करता/करती हूँ कि दी गई सभी जानकारी सही और वास्तविक है, तथा मैं सहमत हूँ कि मेरा संपर्क नंबर इस लिस्टिंग पर सार्वजनिक रूप से प्रदर्शित होगा ताकि इच्छुक उपयोगकर्ता सीधे कॉल या व्हाट्सएप कर सकें।'
                : 'I confirm that all property information provided is genuine and accurate, and I agree that my contact number will be displayed publicly on this listing for direct phone and WhatsApp inquiries.'}
            </span>
          </label>
        </div>

        {/* Action Buttons: Cancel & Submit */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-emerald-950">
          {!isPageMode && (
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className={`px-7 py-2.5 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              transactionType === 'rent'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-teal-700/25'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-700/25'
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isHindi ? 'सहेजा जा रहा है...' : 'Saving Listing...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {property
                    ? isHindi
                      ? 'परिवर्तन सहेजें (Update Listing)'
                      : 'Save Changes'
                    : transactionType === 'rent'
                    ? isHindi
                      ? 'किराये हेतु लिस्ट करें'
                      : 'Publish Rental Listing'
                    : isHindi
                    ? 'बिक्री हेतु लिस्ट करें'
                    : 'Publish Sale Listing'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (isPageMode) {
    return content;
  }

  return typeof document !== 'undefined'
    ? createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (Date.now() - mountTimeRef.current < 350) {
              return;
            }
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {content}
        </div>,
        document.body
      )
    : content;
};
