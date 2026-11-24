import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ClipboardList,
  Plus,
  ArrowLeft,
  MapPin,
  IndianRupee,
  Home,
  Maximize2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Trash2,
  RefreshCw,
  Send,
  Lock,
  Search,
  MessageSquare,
  Phone,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  X,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  Property,
  PropertyRequirement,
  RequirementPropertyType,
  RequirementType,
  UttarakhandCity,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';
import { formatPostTime } from '../utils/timeAgo';
import {
  isPropertyOwner,
  formatPhoneForDisplay,
  getTelHref,
  getWhatsAppContactUrl,
} from '../utils/propertyOwnership';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface RequirementsPageProps {
  allProperties?: Property[];
  onBackToMain: () => void;
  onSelectProperty?: (property: Property) => void;
  onNavigatePage?: (page: string) => void;
  onNavigateCity?: (city: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  favoriteCount?: number;
  embeddedInMobileApp?: boolean;
}

const REQUIREMENT_PROPERTY_TYPES: RequirementPropertyType[] = [
  'Plot',
  'House',
  'Flat',
  'Villa',
  'Commercial',
  'Other',
];

const UK_LOCATIONS: string[] = [
  'Dehradun',
  'Rishikesh',
  'Haridwar',
  'Nainital',
  'Mussoorie',
  'Haldwani',
  'Mukteshwar',
  'Bhimtal',
  'Almora',
  'Ranikhet',
  'Lansdowne',
  'Dhanaulti',
  'Kanatal',
  'Kausani',
  'Chakrata',
  'Tehri Garhwal',
  'Devprayag',
  'Rudraprayag',
  'Uttarkashi',
  'Kotdwar',
  'Bhowali',
  'Auli',
  'Anywhere in Uttarakhand',
];

const SIZE_UNITS = ['Sq.Ft', 'Gaj', 'Nali', 'Bigha', 'Acre', 'Sq.M'];

function formatBudgetShort(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function getDaysRemaining(expiresAt?: string): number {
  if (!expiresAt) return 30;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export const RequirementsPage: React.FC<RequirementsPageProps> = ({
  allProperties = [],
  onBackToMain,
  onSelectProperty,
  onNavigatePage,
  onNavigateCity,
  isDark = false,
  onToggleTheme,
  favoriteCount = 0,
  embeddedInMobileApp = false,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { isHindi } = useLanguage();

  const [activeView, setActiveView] = useState<'board' | 'my'>('board');
  const [publicRequirements, setPublicRequirements] = useState<PropertyRequirement[]>([]);
  const [myRequirements, setMyRequirements] = useState<PropertyRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters on Public Board
  const [filterReqType, setFilterReqType] = useState<'All' | RequirementType>('All');
  const [filterPropType, setFilterPropType] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Submission / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<PropertyRequirement | null>(null);
  const [reqType, setReqType] = useState<RequirementType>('Buy');
  const [propType, setPropType] = useState<RequirementPropertyType>('Plot');
  const [preferredCity, setPreferredCity] = useState<string>('Rishikesh');
  const [localityDetail, setLocalityDetail] = useState<string>('');
  const [minBudgetInput, setMinBudgetInput] = useState<string>('');
  const [maxBudgetInput, setMaxBudgetInput] = useState<string>('');
  const [bedroomsInput, setBedroomsInput] = useState<string>('');
  const [sizeValueInput, setSizeValueInput] = useState<string>('');
  const [sizeUnitInput, setSizeUnitInput] = useState<string>('Gaj');
  const [descriptionInput, setDescriptionInput] = useState<string>('');
  const [accountPhoneInput, setAccountPhoneInput] = useState<string>('');
  const [honeypotWebsite, setHoneypotWebsite] = useState<string>('');
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Secure Owner Response Modal State
  const [respondingTo, setRespondingTo] = useState<PropertyRequirement | null>(null);
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [responderPhone, setResponderPhone] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [sendingResponse, setSendingResponse] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);

  // Delete Confirmation
  const [deletingReq, setDeletingReq] = useState<PropertyRequirement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const reqFetch = useCallback((endpoint: string, init: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((init.headers as Record<string, string>) || {}),
    };
    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Session-Token'] = token;
      }
    } catch {}
    return fetch(resolveApiUrl(endpoint), {
      ...init,
      credentials: isNativeAndroidApp() ? 'omit' : 'include',
      headers,
    });
  }, []);

  const loadRequirements = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setErrorMsg(null);
      try {
        const res = await reqFetch('/api/requirements', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Unable to load requirements.');
        }
        setPublicRequirements(Array.isArray(data.requirements) ? data.requirements : []);
        setMyRequirements(Array.isArray(data.myRequirements) ? data.myRequirements : []);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Unable to load requirements.');
      } finally {
        setLoading(false);
      }
    },
    [reqFetch]
  );

  useEffect(() => {
    void loadRequirements(false);
  }, [loadRequirements, currentUser?.id]);

  const myOwnedProperties = useMemo(() => {
    if (!currentUser) return [];
    return allProperties.filter((p) => isPropertyOwner(p, currentUser) && !p.isSold);
  }, [allProperties, currentUser]);

  const openCreateForm = () => {
    if (!currentUser) {
      openAuthModal(
        'login',
        isHindi
          ? 'अपनी प्रॉपर्टी आवश्यकता पोस्ट करने हेतु कृपया लॉगिन करें।'
          : 'Please sign in with your registered account to post a property requirement.',
        () => openCreateFormAfterAuth()
      );
      return;
    }
    openCreateFormAfterAuth();
  };

  const openCreateFormAfterAuth = () => {
    setEditingRequirement(null);
    setReqType('Buy');
    setPropType('Plot');
    setPreferredCity('Rishikesh');
    setLocalityDetail('');
    setMinBudgetInput('');
    setMaxBudgetInput('');
    setBedroomsInput('');
    setSizeValueInput('');
    setSizeUnitInput('Gaj');
    setDescriptionInput('');
    setAccountPhoneInput((currentUser as any)?.phone || '');
    setHoneypotWebsite('');
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditForm = (reqItem: PropertyRequirement) => {
    setEditingRequirement(reqItem);
    setReqType(reqItem.requirementType);
    setPropType(reqItem.propertyType);
    const matchedCity = UK_LOCATIONS.find(
      (c) => c.toLowerCase() === (reqItem.city || '').toLowerCase()
    );
    setPreferredCity(matchedCity || 'Rishikesh');
    const locParts = (reqItem.preferredLocation || '').split(',').map((s) => s.trim());
    setLocalityDetail(locParts.length > 1 ? locParts.slice(0, -1).join(', ') : '');
    setMinBudgetInput(reqItem.minBudget ? String(reqItem.minBudget) : '');
    setMaxBudgetInput(reqItem.maxBudget ? String(reqItem.maxBudget) : '');
    setBedroomsInput(reqItem.bedrooms ? String(reqItem.bedrooms) : '');
    if (reqItem.requiredSize) {
      const m = reqItem.requiredSize.match(/^([\d.]+)\s*(.+)$/);
      if (m) {
        setSizeValueInput(m[1]);
        setSizeUnitInput(SIZE_UNITS.includes(m[2]) ? m[2] : 'Sq.Ft');
      } else {
        setSizeValueInput(reqItem.requiredSize);
      }
    } else {
      setSizeValueInput('');
    }
    setDescriptionInput(reqItem.description || '');
    setAccountPhoneInput('');
    setFormError(null);
    setShowFormModal(true);
  };

  const sanitizeDigits = (raw: string) => raw.replace(/[^0-9]/g, '');

  const handleSubmitRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login', 'Please sign in to submit your requirement.');
      return;
    }

    setFormError(null);
    const minB = Number(minBudgetInput) || 0;
    const maxB = Number(maxBudgetInput) || 0;

    if (maxB <= 0) {
      setFormError(
        isHindi ? 'कृपया अधिकतम बजट दर्ज करें।' : 'Please enter a valid maximum budget.'
      );
      return;
    }
    if (minB > maxB) {
      setFormError(
        isHindi
          ? 'न्यूनतम बजट अधिकतम बजट से अधिक नहीं हो सकता।'
          : 'Minimum budget cannot be greater than maximum budget.'
      );
      return;
    }

    const fullLocation = localityDetail.trim()
      ? `${localityDetail.trim()}, ${preferredCity}`
      : preferredCity;

    const requiredSize = sizeValueInput.trim()
      ? `${sizeValueInput.trim()} ${sizeUnitInput}`
      : '';

    const bedroomsNum =
      propType === 'Plot' || propType === 'Commercial' || !bedroomsInput
        ? null
        : Math.max(0, parseInt(bedroomsInput, 10) || 0);

    setSubmittingForm(true);
    try {
      const endpoint = editingRequirement
        ? `/api/requirements/${encodeURIComponent(editingRequirement.id)}`
        : '/api/requirements';
      const method = editingRequirement ? 'PUT' : 'POST';

      const res = await reqFetch(endpoint, {
        method,
        body: JSON.stringify({
          requirementType: reqType,
          propertyType: propType,
          city: preferredCity,
          preferredLocation: fullLocation,
          minBudget: minB,
          maxBudget: maxB,
          bedrooms: bedroomsNum,
          requiredSize: requiredSize || null,
          description: descriptionInput.trim(),
          contactPhone: accountPhoneInput.trim() || undefined,
          websiteUrl: honeypotWebsite,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save requirement.');
      }

      setShowFormModal(false);
      setActiveView('my');
      showToast(
        editingRequirement
          ? isHindi
            ? 'आपकी आवश्यकता अपडेट कर दी गई है।'
            : 'Your requirement has been updated.'
          : isHindi
            ? 'आवश्यकता सबमिट हो गई है! एडमिन स्वीकृति के बाद यह सार्वजनिक बोर्ड पर दिखेगी।'
            : 'Requirement submitted! Once approved by admin, it will appear on the public board.'
      );
      await loadRequirements(true);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit requirement.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleStatusPatch = async (
    reqItem: PropertyRequirement,
    patch: { isFulfilled?: boolean; renew?: boolean },
    successText: string
  ) => {
    try {
      const res = await reqFetch(`/api/requirements/${encodeURIComponent(reqItem.id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update requirement.');
      }
      showToast(successText);
      await loadRequirements(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Action failed.');
    }
  };

  const handleDeleteRequirement = async () => {
    if (!deletingReq) return;
    const target = deletingReq;
    setDeletingReq(null);
    try {
      const res = await reqFetch(`/api/requirements/${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete requirement.');
      }
      showToast(isHindi ? 'आवश्यकता हटा दी गई।' : 'Requirement deleted.');
      await loadRequirements(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to delete requirement.');
    }
  };

  const openRespondModal = (reqItem: PropertyRequirement) => {
    if (!currentUser) {
      openAuthModal(
        'login',
        isHindi
          ? 'प्रॉपर्टी मालिक के रूप में उत्तर देने हेतु कृपया लॉगिन करें।'
          : 'Please sign in as a property owner or lister to respond to this requirement.',
        () => {
          setRespondingTo(reqItem);
          setResponseMessage('');
          setResponderPhone((currentUser as any)?.phone || '');
          setSelectedPropertyId('');
          setResponseError(null);
        }
      );
      return;
    }
    setRespondingTo(reqItem);
    setResponseMessage('');
    setResponderPhone((currentUser as any)?.phone || '');
    setSelectedPropertyId(myOwnedProperties[0]?.id || '');
    setResponseError(null);
  };

  const handleSendOwnerResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingTo) return;
    setResponseError(null);

    const cleanedMsg = responseMessage.trim();
    if (cleanedMsg.length < 10) {
      setResponseError(
        isHindi
          ? 'कृपया अपनी प्रॉपर्टी के बारे में कम से कम 10 अक्षरों का विवरण लिखें।'
          : 'Please write a short message describing your matching property (at least 10 characters).'
      );
      return;
    }

    const phoneDigits = responderPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setResponseError(
        isHindi
          ? 'कृपया अपना 10-अंकीय संपर्क नंबर दर्ज करें ताकि खरीदार आपसे जुड़ सके।'
          : 'Please enter a valid 10-digit contact number so the seeker can reach you.'
      );
      return;
    }

    setSendingResponse(true);
    try {
      const res = await reqFetch(
        `/api/requirements/${encodeURIComponent(respondingTo.id)}/respond`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: cleanedMsg,
            responderPhone: responderPhone.trim(),
            propertyId: selectedPropertyId || undefined,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to send response.');
      }
      setRespondingTo(null);
      showToast(
        isHindi
          ? 'आपका उत्तर सुरक्षित रूप से आवश्यकता पोस्ट करने वाले उपयोगकर्ता को भेज दिया गया है!'
          : 'Your response has been sent securely to the requirement poster!'
      );
      await loadRequirements(true);
    } catch (err: any) {
      setResponseError(err?.message || 'Failed to send response.');
    } finally {
      setSendingResponse(false);
    }
  };

  const filteredPublicRequirements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publicRequirements.filter((item) => {
      if (filterReqType !== 'All' && item.requirementType !== filterReqType) return false;
      if (filterPropType !== 'All' && item.propertyType !== filterPropType) return false;
      if (
        filterLocation !== 'All' &&
        !(item.preferredLocation || '').toLowerCase().includes(filterLocation.toLowerCase()) &&
        (item.city || '').toLowerCase() !== filterLocation.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const hay = [
          item.preferredLocation,
          item.city,
          item.propertyType,
          item.requirementType,
          item.description,
          item.requiredSize,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [publicRequirements, filterReqType, filterPropType, filterLocation, searchQuery]);

  return (
    <div
      className={
        embeddedInMobileApp
          ? 'pb-24 bg-[#f1f2ef] dark:bg-[#032D1F] text-slate-900 dark:text-slate-100'
          : 'min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#032D1F] text-slate-900 dark:text-slate-100'
      }
    >
      {!embeddedInMobileApp && (
        <Navbar
          onLogoClick={onBackToMain}
          allProperties={allProperties}
          onSelectProperty={onSelectProperty}
          onBuyClick={() => onNavigatePage?.('buy')}
          onRentClick={() => onNavigatePage?.('rent')}
          onOpenListChooser={() => onNavigatePage?.('list')}
          onOpenRequirements={() => {}}
          onOpenDashboard={() => onNavigatePage?.('dashboard')}
          onOpenAdminDashboard={() => onNavigatePage?.('admin')}
          onOpenInbox={() => onNavigatePage?.('inbox')}
          onOpenSignIn={() => onNavigatePage?.('login')}
          onOpenRegister={() => onNavigatePage?.('register')}
          favoriteCount={favoriteCount}
          theme={isDark ? 'dark' : 'light'}
          onToggleTheme={onToggleTheme || (() => {})}
        />
      )}

      <main
        className={`flex-1 w-full max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 ${
          embeddedInMobileApp ? 'pt-3 space-y-4' : 'pt-24 sm:pt-28 pb-16 space-y-6'
        }`}
      >
        {/* Hero / Header Banner */}
        <section className="rounded-3xl bg-gradient-to-br from-[#0E3A2B] via-[#0A2E22] to-[#051B14] text-white p-5 sm:p-8 border border-emerald-800/80 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onBackToMain}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHindi ? 'होम पर वापस जाएं' : 'Back to Home'}</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold">
              <Lock className="w-3 h-3" />
              <span>
                {isHindi
                  ? 'निजी फ़ोन नंबर सार्वजनिक रूप से छिपे रहते हैं'
                  : 'Private Contact Details Kept Hidden Publicly'}
              </span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                {isHindi ? 'अपनी प्रॉपर्टी आवश्यकता पोस्ट करें' : 'Post Your Property Requirements'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                {isHindi
                  ? 'उत्तराखंड में खरीदने या किराये पर लेने हेतु अपनी आवश्यकता साझा करें। प्रॉपर्टी मालिक सुरक्षित रूप से आपसे संपर्क कर सकते हैं।'
                  : 'Looking to buy or rent a plot, house, flat, villa, or commercial space in Uttarakhand? Share what you need and let property owners respond securely.'}
              </p>
            </div>

            <button
              id="post-your-requirement-cta"
              type="button"
              onClick={openCreateForm}
              className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.75]" />
              <span>{isHindi ? 'अपनी आवश्यकता पोस्ट करें' : 'Post Your Requirement'}</span>
            </button>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveView('board')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                activeView === 'board'
                  ? 'bg-white text-[#0E3A2B] shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              {isHindi
                ? `सार्वजनिक आवश्यकताएं (${publicRequirements.length})`
                : `Public Requirements (${publicRequirements.length})`}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  openAuthModal('login', 'Sign in to view and manage your posted requirements.');
                  return;
                }
                setActiveView('my');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeView === 'my'
                  ? 'bg-white text-[#0E3A2B] shadow-sm'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              <span>
                {isHindi
                  ? `मेरी आवश्यकताएं (${myRequirements.length})`
                  : `My Requirements (${myRequirements.length})`}
              </span>
            </button>
          </div>
        </section>

        {toastMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-md">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toastMsg}</span>
            </span>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="opacity-80 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="opacity-80 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= VIEW 1: PUBLIC APPROVED REQUIREMENTS BOARD ================= */}
        {activeView === 'board' && (
          <section className="space-y-4">
            {/* Search & Filters */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs grid grid-cols-2 md:grid-cols-12 gap-2.5">
              <div className="col-span-2 md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'स्थान, प्रॉपर्टी प्रकार या विवरण खोजें...'
                      : 'Search location, property type, or requirement details...'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs sm:text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <select
                  value={filterReqType}
                  onChange={(e) => setFilterReqType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold cursor-pointer"
                  aria-label="Requirement Type"
                >
                  <option value="All">{isHindi ? 'खरीदें व किराया' : 'Buy & Rent'}</option>
                  <option value="Buy">{isHindi ? 'खरीदना चाहते हैं (Buy)' : 'Wanted to Buy'}</option>
                  <option value="Rent">{isHindi ? 'किराये पर चाहिए (Rent)' : 'Wanted for Rent'}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={filterPropType}
                  onChange={(e) => setFilterPropType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold cursor-pointer"
                  aria-label="Property Type"
                >
                  <option value="All">{isHindi ? 'सभी प्रॉपर्टी प्रकार' : 'All Property Types'}</option>
                  {REQUIREMENT_PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-3">
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811] text-xs font-bold cursor-pointer"
                  aria-label="Location"
                >
                  <option value="All">{isHindi ? 'सभी स्थान' : 'All Uttarakhand Locations'}</option>
                  {UK_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {isHindi ? 'आवश्यकताएं लोड हो रही हैं...' : 'Loading active property requirements...'}
              </div>
            ) : filteredPublicRequirements.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#082218] border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-serif-luxury">
                    {isHindi
                      ? 'अभी कोई सक्रिय सार्वजनिक आवश्यकता नहीं है'
                      : 'No Active Requirements Match Right Now'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {isHindi
                      ? 'अपनी प्रॉपर्टी आवश्यकता पोस्ट करें ताकि सत्यापित प्रॉपर्टी मालिक आपसे संपर्क कर सकें।'
                      : 'Post what kind of property you are looking to buy or rent in Uttarakhand so property owners can reach out to you.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isHindi ? 'अपनी आवश्यकता पोस्ट करें' : 'Post Your Requirement'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPublicRequirements.map((reqItem) => {
                  const isMine = Boolean(currentUser && reqItem.userId === currentUser.id);
                  const daysLeft = Math.max(1, getDaysRemaining(reqItem.expiresAt));
                  return (
                    <article
                      key={reqItem.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0C3628] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex flex-col justify-between gap-3.5"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                                reqItem.requirementType === 'Rent' ? 'bg-teal-600' : 'bg-emerald-600'
                              }`}
                            >
                              {reqItem.requirementType === 'Rent'
                                ? isHindi
                                  ? 'किराये पर चाहिए'
                                  : 'Looking to Rent'
                                : isHindi
                                  ? 'खरीदना चाहते हैं'
                                  : 'Looking to Buy'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                              {reqItem.propertyType}
                            </span>
                          </div>

                          <span className="text-[10.5px] font-semibold text-slate-500 dark:text-emerald-200/80 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>{formatPostTime(reqItem.createdAt, reqItem.id)}</span>
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{reqItem.preferredLocation}</span>
                          </div>

                          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-black">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>
                              {reqItem.minBudget > 0
                                ? `${formatBudgetShort(reqItem.minBudget)} – ${formatBudgetShort(reqItem.maxBudget)}`
                                : `Up to ${formatBudgetShort(reqItem.maxBudget)}`}
                              {reqItem.requirementType === 'Rent' ? ' / mo' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                          {reqItem.bedrooms !== null && reqItem.bedrooms !== undefined && reqItem.bedrooms > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                              <Home className="w-3 h-3 text-emerald-600" />
                              <span>{reqItem.bedrooms} BHK</span>
                            </span>
                          )}
                          {reqItem.requiredSize && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">
                              <Maximize2 className="w-3 h-3 text-emerald-600" />
                              <span>{reqItem.requiredSize}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                            <Calendar className="w-3 h-3" />
                            <span>Expires in {daysLeft}d</span>
                          </span>
                        </div>

                        {reqItem.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                            {reqItem.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {isHindi ? 'सत्यापित उपयोगकर्ता • संपर्क गोपनीय' : 'Verified Member • Contact Protected'}
                          </span>
                        </div>

                        {isMine ? (
                          <button
                            type="button"
                            onClick={() => setActiveView('my')}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs cursor-pointer"
                          >
                            {isHindi ? 'प्रबंधित करें' : 'Manage Mine'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRespondModal(reqItem)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'प्रॉपर्टी मालिक उत्तर दें' : 'Respond to Requirement'}</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ================= VIEW 2: MY POSTED REQUIREMENTS & OWNER RESPONSES ================= */}
        {activeView === 'my' && (
          <section className="space-y-4">
            {myRequirements.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#082218] border border-dashed border-emerald-300 dark:border-emerald-800 text-center space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isHindi
                    ? 'आपने अभी तक कोई आवश्यकता पोस्ट नहीं की है'
                    : 'You Have Not Posted Any Requirements Yet'}
                </h2>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isHindi ? 'अपनी आवश्यकता पोस्ट करें' : 'Post Your Requirement'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequirements.map((reqItem) => {
                  const daysLeft = getDaysRemaining(reqItem.expiresAt);
                  const isExpired = daysLeft <= 0;
                  const responses = Array.isArray(reqItem.responses) ? reqItem.responses : [];

                  return (
                    <div
                      key={reqItem.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-3.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white ${
                                reqItem.requirementType === 'Rent' ? 'bg-teal-600' : 'bg-emerald-600'
                              }`}
                            >
                              {reqItem.requirementType} • {reqItem.propertyType}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                reqItem.isFulfilled
                                  ? 'bg-purple-600 text-white'
                                  : isExpired
                                    ? 'bg-slate-600 text-white'
                                    : reqItem.approvalStatus === 'approved'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : reqItem.approvalStatus === 'rejected'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {reqItem.isFulfilled
                                ? 'Fulfilled'
                                : isExpired
                                  ? 'Expired (30d)'
                                  : reqItem.approvalStatus === 'approved'
                                    ? 'Approved & Live'
                                    : reqItem.approvalStatus === 'rejected'
                                      ? 'Rejected'
                                      : 'Pending Admin Approval'}
                            </span>

                            {!isExpired && !reqItem.isFulfilled && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                • Expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {reqItem.preferredLocation} —{' '}
                            <span className="text-emerald-700 dark:text-emerald-400">
                              {reqItem.minBudget > 0
                                ? `${formatBudgetShort(reqItem.minBudget)} – ${formatBudgetShort(reqItem.maxBudget)}`
                                : `Up to ${formatBudgetShort(reqItem.maxBudget)}`}
                            </span>
                          </h3>

                          {reqItem.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {reqItem.description}
                            </p>
                          )}
                        </div>

                        {/* Owner Controls: Edit, Mark Fulfilled, Renew 30d, Delete */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditForm(reqItem)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'संपादित करें' : 'Edit'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleStatusPatch(
                                reqItem,
                                { isFulfilled: !reqItem.isFulfilled },
                                reqItem.isFulfilled
                                  ? 'Requirement reopened!'
                                  : 'Requirement marked as fulfilled!'
                              )
                            }
                            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {reqItem.isFulfilled
                                ? isHindi
                                  ? 'पुनः सक्रिय करें'
                                  : 'Reopen'
                                : isHindi
                                  ? 'पूर्ण मार्क करें'
                                  : 'Mark Fulfilled'}
                            </span>
                          </button>

                          {(isExpired || daysLeft <= 25) && (
                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusPatch(
                                  reqItem,
                                  { renew: true },
                                  'Requirement renewed for another 30 days!'
                                )
                              }
                              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{isHindi ? '30 दिन नवीनीकरण' : 'Renew 30d'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeletingReq(reqItem)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Private Responses from Property Owners */}
                      <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 space-y-2">
                        <div className="text-xs font-extrabold text-slate-800 dark:text-emerald-200 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {isHindi
                              ? `प्रॉपर्टी मालिकों के उत्तर (${responses.length})`
                              : `Responses from Property Owners (${responses.length})`}
                          </span>
                        </div>

                        {responses.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isHindi
                              ? 'अभी तक कोई उत्तर प्राप्त नहीं हुआ है।'
                              : 'No property owner responses yet. Responses sent to you appear privately here.'}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {responses.map((resp) => {
                              const telHref = getTelHref(resp.responderPhone);
                              const waHref = getWhatsAppContactUrl(
                                resp.responderPhone,
                                `Hello ${resp.responderName}, thank you for responding to my property requirement (${reqItem.preferredLocation}) on Uttarakhand Gateways.`
                              );
                              const linkedProp = resp.propertyId
                                ? allProperties.find((p) => p.id === resp.propertyId)
                                : undefined;

                              return (
                                <div
                                  key={resp.id}
                                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900/60 space-y-2"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {resp.responderName}
                                    </span>
                                    <span className="text-[11px] text-slate-500">
                                      {formatPostTime(resp.createdAt, resp.id)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {resp.message}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {telHref && (
                                      <a
                                        href={telHref}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 no-underline"
                                      >
                                        <Phone className="w-3 h-3" />
                                        <span>{formatPhoneForDisplay(resp.responderPhone)}</span>
                                      </a>
                                    )}
                                    {waHref && (
                                      <a
                                        href={waHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs inline-flex items-center gap-1 no-underline"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>WhatsApp</span>
                                      </a>
                                    )}
                                    {(linkedProp || resp.propertyId) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (linkedProp && onSelectProperty) {
                                            onSelectProperty(linkedProp);
                                          } else if (resp.propertyId) {
                                            window.location.href = `/property/${encodeURIComponent(resp.propertyId)}`;
                                          }
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-emerald-200 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>{resp.propertyTitle || 'View Attached Property'}</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {!embeddedInMobileApp && (
        <Footer
          onCityClick={(c) => onNavigateCity?.(c as UttarakhandCity)}
          onNavigateCity={(c) => onNavigateCity?.(c)}
          onNavigatePage={(p) => onNavigatePage?.(p)}
          onCategoryClick={(cat) => onNavigatePage?.('buy')}
        />
      )}

      {/* ================= MODAL: POST / EDIT REQUIREMENT FORM ================= */}
      {showFormModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={() => setShowFormModal(false)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#082218] rounded-t-3xl sm:rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-2xl overflow-hidden max-h-[94dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#0E3A2B] text-white flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black">
                {editingRequirement
                  ? isHindi
                    ? 'आवश्यकता संपादित करें'
                    : 'Edit Your Requirement'
                  : isHindi
                    ? 'अपनी प्रॉपर्टी आवश्यकता पोस्ट करें'
                    : 'Post Your Requirement'}
              </h2>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitRequirement}
              className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm"
            >
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold">
                  {formError}
                </div>
              )}

              {/* Honeypot anti-bot field */}
              <input
                type="text"
                name="websiteUrl"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotWebsite}
                onChange={(e) => setHoneypotWebsite(e.target.value)}
                className="hidden"
              />

              {/* 1. Requirement Type: Buy or Rent */}
              <div>
                <label className="font-bold block mb-1.5">
                  {isHindi ? 'आवश्यकता प्रकार (Buy / Rent) *' : 'Requirement Type *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Buy', 'Rent'] as RequirementType[]).map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setReqType(rt)}
                      className={`py-2.5 rounded-xl font-extrabold text-xs border transition cursor-pointer ${
                        reqType === rt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#051811] border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {rt === 'Buy'
                        ? isHindi
                          ? 'खरीदना चाहते हैं (Buy)'
                          : 'Buy Property'
                        : isHindi
                          ? 'किराये पर चाहिए (Rent)'
                          : 'Rent Property'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Property Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">
                    {isHindi ? 'प्रॉपर्टी प्रकार *' : 'Property Type *'}
                  </label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as RequirementPropertyType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811] font-semibold"
                  >
                    {REQUIREMENT_PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Preferred City in Uttarakhand */}
                <div>
                  <label className="font-bold block mb-1">
                    {isHindi ? 'उत्तराखंड में पसंदीदा शहर *' : 'Preferred Location in Uttarakhand *'}
                  </label>
                  <select
                    value={preferredCity}
                    onChange={(e) => setPreferredCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811] font-semibold"
                  >
                    {UK_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {isHindi
                    ? 'विशिष्ट क्षेत्र / कॉलोनी (वैकल्पिक)'
                    : 'Specific Locality / Area (Optional)'}
                </label>
                <input
                  type="text"
                  value={localityDetail}
                  onChange={(e) => setLocalityDetail(e.target.value)}
                  placeholder="Enter preferred area or locality"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                />
              </div>

              {/* 4. Minimum & Maximum Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold">
                      {isHindi ? 'न्यूनतम बजट (₹)' : 'Minimum Budget (₹)'}
                    </label>
                    {Number(minBudgetInput) > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600">
                        {formatBudgetShort(Number(minBudgetInput))}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={minBudgetInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => setMinBudgetInput(sanitizeDigits(e.target.value))}
                    placeholder="Enter minimum budget"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811] font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold">
                      {isHindi ? 'अधिकतम बजट (₹) *' : 'Maximum Budget (₹) *'}
                    </label>
                    {Number(maxBudgetInput) > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600">
                        {formatBudgetShort(Number(maxBudgetInput))}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={maxBudgetInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => setMaxBudgetInput(sanitizeDigits(e.target.value))}
                    placeholder="Enter maximum budget"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811] font-bold"
                  />
                </div>
              </div>

              {/* 5 & 6. Bedrooms & Required Size (if applicable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {propType !== 'Plot' && propType !== 'Commercial' && (
                  <div>
                    <label className="font-bold block mb-1">
                      {isHindi ? 'कमरे (Bedrooms - वैकल्पिक)' : 'Bedrooms (Optional)'}
                    </label>
                    <select
                      value={bedroomsInput}
                      onChange={(e) => setBedroomsInput(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                    >
                      <option value="">Any / Not Applicable</option>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>
                )}

                <div className={propType === 'Plot' || propType === 'Commercial' ? 'sm:col-span-2' : ''}>
                  <label className="font-bold block mb-1">
                    {isHindi ? 'आवश्यक क्षेत्रफल (वैकल्पिक)' : 'Required Property Size (Optional)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={sizeValueInput}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) =>
                        setSizeValueInput(e.target.value.replace(/[^0-9.]/g, ''))
                      }
                      placeholder="Enter size"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                    />
                    <select
                      value={sizeUnitInput}
                      onChange={(e) => setSizeUnitInput(e.target.value)}
                      className="w-28 px-2.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811] font-bold"
                    >
                      {SIZE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 7. Additional Description */}
              <div>
                <label className="font-bold block mb-1">
                  {isHindi
                    ? 'अतिरिक्त विवरण या आवश्यकताएं'
                    : 'Additional Requirements or Description'}
                </label>
                <textarea
                  rows={3}
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  placeholder="Describe road access, facing, possession timeline, or other preferences..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                />
              </div>

              {/* 8. Registered Account Contact Summary (Private) */}
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {isHindi
                        ? 'पंजीकृत खाता संपर्क (सार्वजनिक रूप से गोपनीय)'
                        : 'Registered Account Details (Hidden Publicly)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>{currentUser.username}</strong> • {currentUser.contact}
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={accountPhoneInput}
                    onChange={(e) => setAccountPhoneInput(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                    placeholder="Optional private contact number (kept hidden publicly)"
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#051811] text-xs"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingForm
                    ? 'Submitting...'
                    : editingRequirement
                      ? 'Save Changes'
                      : 'Submit Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROPERTY OWNER SECURE RESPONSE ================= */}
      {respondingTo && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setRespondingTo(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#082218] rounded-t-3xl sm:rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#0E3A2B] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black">
                  {isHindi ? 'प्रॉपर्टी आवश्यकता का उत्तर दें' : 'Respond to Property Requirement'}
                </h3>
                <p className="text-[11px] text-emerald-200">
                  {respondingTo.requirementType} • {respondingTo.propertyType} in{' '}
                  {respondingTo.preferredLocation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRespondingTo(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendOwnerResponse} className="p-5 space-y-3.5 text-xs sm:text-sm">
              {responseError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold">
                  {responseError}
                </div>
              )}

              {myOwnedProperties.length > 0 && (
                <div>
                  <label className="font-bold block mb-1">
                    {isHindi
                      ? 'अपनी लिस्टेड प्रॉपर्टी जोड़ें (वैकल्पिक)'
                      : 'Attach One of Your Listed Properties (Optional)'}
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                  >
                    <option value="">— Do not attach a specific listing —</option>
                    {myOwnedProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.city} • {p.priceDisplay})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold block mb-1">
                  {isHindi ? 'आपका संपर्क नंबर *' : 'Your Contact Number (Shared Only With Seeker) *'}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={responderPhone}
                  onChange={(e) => setResponderPhone(e.target.value.replace(/[^0-9+\s-]/g, ''))}
                  placeholder="Enter your mobile number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811] font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">
                  {isHindi ? 'प्रॉपर्टी विवरण / संदेश *' : 'Message to Seeker *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Share details of your matching property (location, area, asking price)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#051811]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRespondingTo(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingResponse}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingResponse ? 'Sending...' : 'Send Secure Response'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE REQUIREMENT CONFIRM ================= */}
      {deletingReq && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeletingReq(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-[#082218] rounded-3xl border border-rose-300 dark:border-rose-900 p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isHindi ? 'आवश्यकता हटाएं?' : 'Delete Requirement?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isHindi
                ? 'क्या आप वाकई इस आवश्यकता को हटाना चाहते हैं?'
                : 'Are you sure you want to permanently remove this requirement?'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingReq(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteRequirement()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
