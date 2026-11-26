import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Lock,
  FileText,
  Scale,
  Clock,
  Loader2,
  Maximize2,
  Building2,
  ChevronRight,
  Info,
} from 'lucide-react';
import type {
  AssuranceApplication,
  AssuranceDocumentMeta,
  AssurancePriceBracket,
  AssurancePricingConfig,
  Property,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { formatPropertyArea } from '../utils/areaUnits';
import { resolveApiUrl } from '../config/apiConfig';
import { getPropertySlugPath } from '../data/programmaticSeo';
import {
  assuranceFetch,
  ASSURANCE_PROPERTY_TYPES,
  formatAssuranceRupees,
  formatFileSize,
  matchBracketIdForPrice,
  stripExcludedNames,
} from '../utils/assuranceApi';

interface PropertyAssuranceRequestPageProps {
  propertyId?: string | null;
  initialProperty?: Property | null;
  allProperties?: Property[];
  onBack: () => void;
  onOpenAssuranceInfoPage: () => void;
  onOpenCustomerDashboard: () => void;
  embeddedInMobileApp?: boolean;
}

const DEFAULT_BRACKETS: AssurancePriceBracket[] = [
  { id: 'below-10l', label: 'Below ₹10 lakh', minAmount: 0, maxAmount: 1000000, fee: 7999, isCustomQuote: false },
  { id: '10l-25l', label: '₹10–25 lakh', minAmount: 1000000, maxAmount: 2500000, fee: 11999, isCustomQuote: false },
  { id: '25l-50l', label: '₹25–50 lakh', minAmount: 2500000, maxAmount: 5000000, fee: 17999, isCustomQuote: false },
  { id: '50l-1cr', label: '₹50 lakh–₹1 crore', minAmount: 5000000, maxAmount: 10000000, fee: 24999, isCustomQuote: false },
  { id: 'above-1cr', label: 'Above ₹1 crore', minAmount: 10000000, maxAmount: null, fee: null, isCustomQuote: true },
];

const LEGAL_DISCLAIMERS: string[] = [
  'UKG Assurance is a property document review and inspection assistance service.',
  'Verification is limited to available documents, accessible records and the inspection actually performed.',
  'UKG does not guarantee that a property is free from every possible dispute, liability or legal issue.',
  'UKG does not guarantee ownership or the future outcome of a property transaction.',
  'Any formal legal opinion must be obtained from a qualified legal professional.',
  'The final purchase decision remains with the buyer.',
  'Additional services and expenses require customer approval.',
];

export const PropertyAssuranceRequestPage: React.FC<PropertyAssuranceRequestPageProps> = ({
  propertyId,
  initialProperty = null,
  allProperties = [],
  onBack,
  onOpenAssuranceInfoPage,
  onOpenCustomerDashboard,
  embeddedInMobileApp = false,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pricing, setPricing] = useState<AssurancePricingConfig>({
    brackets: DEFAULT_BRACKETS,
    purchaseAssistancePrice: null,
    dedicatedCoordinatorPrice: null,
  });

  const [resolvedProperty, setResolvedProperty] = useState<Property | null>(initialProperty);
  const [loadingProperty, setLoadingProperty] = useState<boolean>(false);

  // Personalized Form State (Customer Name NEVER pre-filled with Amit Tyagi or owner/admin username)
  const [customerName, setCustomerName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [propertyLocation, setPropertyLocation] = useState<string>('');
  const [propertyValueBracketId, setPropertyValueBracketId] = useState<string>('10l-25l');
  const [propertyLinkOrId, setPropertyLinkOrId] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('Plot');
  const [additionalRequirements, setAdditionalRequirements] = useState<string>('');
  const [additionalMessage, setAdditionalMessage] = useState<string>('');
  const [addonPurchaseAssistance, setAddonPurchaseAssistance] = useState<boolean>(false);
  const [addonDedicatedCoordinator, setAddonDedicatedCoordinator] = useState<boolean>(false);
  const [honeypotWebsite, setHoneypotWebsite] = useState<string>('');

  // Private Document Upload State
  const [uploadedDocs, setUploadedDocs] = useState<AssuranceDocumentMeta[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<AssuranceApplication | null>(null);
  const pendingAutoSubmitRef = useRef<boolean>(false);
  const prefilledForPropIdRef = useRef<string | null>(null);

  // Resolve target property ID from prop or URL query parameter
  const targetPropertyId = useMemo(() => {
    if (propertyId) return propertyId;
    if (initialProperty?.id) return initialProperty.id;
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('propertyId') || sp.get('property') || null;
    } catch {
      return null;
    }
  }, [propertyId, initialProperty]);

  // Match property from initialProperty, allProperties, or backend fetch
  useEffect(() => {
    if (initialProperty && (!targetPropertyId || initialProperty.id === targetPropertyId)) {
      setResolvedProperty(initialProperty);
      return;
    }
    if (!targetPropertyId) return;

    const fromCatalog = allProperties.find((p) => p && p.id === targetPropertyId);
    if (fromCatalog) {
      setResolvedProperty(fromCatalog);
      return;
    }

    let cancelled = false;
    setLoadingProperty(true);
    fetch(resolveApiUrl('/api/properties'), { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: Property[] = Array.isArray(data?.properties)
          ? data.properties
          : Array.isArray(data)
            ? data
            : [];
        const found = list.find((p) => p && p.id === targetPropertyId) || null;
        if (found) setResolvedProperty(found);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingProperty(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetPropertyId, initialProperty, allProperties]);

  // Load live Assurance pricing configuration
  const loadPricing = useCallback(async () => {
    try {
      const res = await assuranceFetch('/api/assurance/pricing', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && data?.pricing) {
        const nextBrackets =
          Array.isArray(data.pricing.brackets) && data.pricing.brackets.length > 0
            ? data.pricing.brackets
            : DEFAULT_BRACKETS;
        setPricing({
          brackets: nextBrackets,
          purchaseAssistancePrice:
            data.pricing.purchaseAssistancePrice === null || data.pricing.purchaseAssistancePrice === undefined
              ? null
              : Number(data.pricing.purchaseAssistancePrice),
          dedicatedCoordinatorPrice:
            data.pricing.dedicatedCoordinatorPrice === null || data.pricing.dedicatedCoordinatorPrice === undefined
              ? null
              : Number(data.pricing.dedicatedCoordinatorPrice),
          updatedAt: data.pricing.updatedAt,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing]);

  // Auto-prefill property details whenever resolvedProperty or pricing brackets arrive
  useEffect(() => {
    if (!resolvedProperty) return;

    const locRaw = stripExcludedNames(resolvedProperty.location || '');
    const cityRaw = stripExcludedNames(resolvedProperty.city || '');
    const combinedLocation =
      locRaw && cityRaw && !locRaw.toLowerCase().includes(cityRaw.toLowerCase())
        ? `${locRaw}, ${cityRaw}`
        : locRaw || cityRaw;

    const matchedType = ASSURANCE_PROPERTY_TYPES.find(
      (t) => t.toLowerCase() === String(resolvedProperty.type || '').trim().toLowerCase()
    ) || 'Plot';

    const slugPath = getPropertySlugPath(resolvedProperty);
    const canonicalLink = `https://uttarakhandgateways.com${slugPath}`;

    if (prefilledForPropIdRef.current !== resolvedProperty.id) {
      prefilledForPropIdRef.current = resolvedProperty.id;
      setPropertyLocation(combinedLocation);
      setPropertyType(matchedType);
      setPropertyLinkOrId(`${canonicalLink} (${resolvedProperty.id})`);
    }

    const matchedBracketId = matchBracketIdForPrice(resolvedProperty.price, pricing.brackets);
    setPropertyValueBracketId(matchedBracketId);
  }, [resolvedProperty, pricing.brackets]);

  const selectedBracket = useMemo(() => {
    return (
      pricing.brackets.find((b) => b.id === propertyValueBracketId) ||
      pricing.brackets[0] ||
      DEFAULT_BRACKETS[0]
    );
  }, [pricing.brackets, propertyValueBracketId]);

  const priceSummary = useMemo(() => {
    const isCustomStandard = Boolean(selectedBracket.isCustomQuote || selectedBracket.fee === null);
    const standardFee = isCustomStandard ? null : Number(selectedBracket.fee);
    const paFee = addonPurchaseAssistance ? pricing.purchaseAssistancePrice : null;
    const dcFee = addonDedicatedCoordinator ? pricing.dedicatedCoordinatorPrice : null;

    const unpricedAddonSelected =
      (addonPurchaseAssistance && paFee === null) ||
      (addonDedicatedCoordinator && dcFee === null);

    let calculatedTotal: number | null = null;
    if (!isCustomStandard && standardFee !== null && !unpricedAddonSelected) {
      calculatedTotal =
        standardFee +
        (addonPurchaseAssistance ? paFee || 0 : 0) +
        (addonDedicatedCoordinator ? dcFee || 0 : 0);
    }

    const numericKnownAddons =
      (addonPurchaseAssistance && paFee !== null ? paFee : 0) +
      (addonDedicatedCoordinator && dcFee !== null ? dcFee : 0);

    return {
      isCustomStandard,
      standardFee,
      paFee,
      dcFee,
      unpricedAddonSelected,
      calculatedTotal,
      basePlusKnownAddons: standardFee !== null ? standardFee + numericKnownAddons : null,
    };
  }, [selectedBracket, addonPurchaseAssistance, addonDedicatedCoordinator, pricing]);

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (files.length === 0) return;

    if (!currentUser) {
      openAuthModal(
        'login',
        'Please sign in or create an account to upload confidential property documents.'
      );
      return;
    }

    setUploadError(null);
    setUploadingDoc(true);
    try {
      for (const file of files) {
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 20 MB maximum file size.`);
        }
        const formData = new FormData();
        formData.append('file', file);
        const res = await assuranceFetch('/api/assurance/upload-document', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success || !data?.document) {
          throw new Error(data?.error || `Failed to upload "${file.name}".`);
        }
        setUploadedDocs((prev) => [...prev, data.document]);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Document upload failed.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeUploadedDoc = (fileId: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.fileId !== fileId));
  };

  const validateFormInputs = (): string | null => {
    if (customerName.trim().length < 2) {
      return 'Please enter your full name.';
    }
    const digitsOnly = mobileNumber.replace(/\D/g, '');
    const tenDigit =
      digitsOnly.length === 12 && digitsOnly.startsWith('91') ? digitsOnly.slice(2) : digitsOnly;
    if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (propertyLocation.trim().length < 3) {
      return 'Please enter the property location.';
    }
    if (!propertyValueBracketId) {
      return 'Please select the property value range.';
    }
    if (propertyLinkOrId.trim().length < 2) {
      return 'Property listing reference is required.';
    }
    if (!propertyType) {
      return 'Please select the property type.';
    }
    if (additionalRequirements.trim().length < 3) {
      return 'Please describe your verification requirements.';
    }
    return null;
  };

  const executeApplicationSubmit = useCallback(async () => {
    setFormError(null);
    const validationErr = validateFormInputs();
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await assuranceFetch('/api/assurance/applications', {
        method: 'POST',
        body: JSON.stringify({
          customerName: stripExcludedNames(customerName),
          mobileNumber: mobileNumber.trim(),
          propertyLocation: stripExcludedNames(propertyLocation),
          propertyValueBracketId,
          propertyLinkOrId: stripExcludedNames(propertyLinkOrId),
          propertyType,
          additionalRequirements: additionalRequirements.trim(),
          additionalMessage: additionalMessage.trim(),
          addonPurchaseAssistance,
          addonDedicatedCoordinator,
          documentFileIds: uploadedDocs.map((d) => d.fileId),
          companyWebsite: honeypotWebsite,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success || !data?.application) {
        throw new Error(data?.error || 'Unable to submit your UKG Assurance request.');
      }
      setSubmittedApp(data.application);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit your UKG Assurance request.');
    } finally {
      setSubmitting(false);
    }
  }, [
    customerName,
    mobileNumber,
    propertyLocation,
    propertyValueBracketId,
    propertyLinkOrId,
    propertyType,
    additionalRequirements,
    additionalMessage,
    addonPurchaseAssistance,
    addonDedicatedCoordinator,
    uploadedDocs,
    honeypotWebsite,
  ]);

  useEffect(() => {
    if (currentUser && pendingAutoSubmitRef.current) {
      pendingAutoSubmitRef.current = false;
      void executeApplicationSubmit();
    }
  }, [currentUser, executeApplicationSubmit]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validationErr = validateFormInputs();
    if (validationErr) {
      setFormError(validationErr);
      return;
    }

    if (!currentUser) {
      pendingAutoSubmitRef.current = true;
      openAuthModal(
        'login',
        'Please sign in or register so your UKG Assurance application and final PDF report are linked securely to your dashboard.',
        () => {
          pendingAutoSubmitRef.current = true;
        }
      );
      return;
    }

    await executeApplicationSubmit();
  };

  const cleanTitle = resolvedProperty ? stripExcludedNames(resolvedProperty.title) : '';
  const cleanPriceDisplay = resolvedProperty
    ? resolvedProperty.priceDisplay || `₹${Number(resolvedProperty.price || 0).toLocaleString('en-IN')}`
    : '';
  const cleanAreaDisplay = resolvedProperty ? formatPropertyArea(resolvedProperty, false) : '';
  const thumbUrl =
    resolvedProperty?.images?.[0]
      ? resolveApiUrl(resolvedProperty.images[0])
      : '/logo.png';

  return (
    <div
      className={`w-full ${
        embeddedInMobileApp ? 'pt-2 pb-20' : 'pt-20 sm:pt-24 pb-16'
      } text-slate-900 dark:text-[#F4F3EF]`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Utility Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 hover:text-emerald-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onOpenAssuranceInfoPage}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#09291E] border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-[#C2A691] hover:border-emerald-400 transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About UKG Assurance & Plans</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1. PERSONALIZED SELECTED PROPERTY SUMMARY BANNER (Zero Owner / Amit Tyagi Name) */}
        <section className="rounded-3xl bg-gradient-to-br from-[#0E3A2B] via-[#092C20] to-[#041F16] text-white border border-emerald-800/80 shadow-xl p-5 sm:p-7">
          {loadingProperty && !resolvedProperty ? (
            <div className="py-6 flex items-center gap-2.5 text-xs text-emerald-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading selected property details...</span>
            </div>
          ) : resolvedProperty ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-full sm:w-36 h-36 sm:h-28 rounded-2xl overflow-hidden bg-black/40 border border-white/15 shrink-0">
                <img
                  src={thumbUrl}
                  alt={cleanTitle || 'Selected Property'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C2A691] text-[#032D1F] text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Personalized UKG Assurance Request</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-emerald-100">
                    {resolvedProperty.type || 'Property'}
                  </span>
                </div>

                <h1 className="font-serif-luxury text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug">
                  {cleanTitle}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-emerald-100/90">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C2A691] shrink-0" />
                    <span>{stripExcludedNames(resolvedProperty.location || resolvedProperty.city)}</span>
                  </span>
                  {cleanAreaDisplay && (
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-[#C2A691] shrink-0" />
                      <span>{cleanAreaDisplay}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-emerald-200/75 font-mono text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-[#C2A691] shrink-0" />
                    <span>Ref: {resolvedProperty.id}</span>
                  </span>
                </div>
              </div>

              <div className="sm:text-right bg-white/10 border border-white/15 rounded-2xl px-4 py-3 shrink-0 w-full sm:w-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Listed Property Value
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#C2A691] mt-0.5">
                  {cleanPriceDisplay}
                </div>
                <div className="text-[11px] text-emerald-100/85 mt-0.5">
                  Assurance Tier: <strong>{selectedBracket.label}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2A691] text-[#032D1F] text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>UKG Assurance Request</span>
              </div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                Request Property Document Review & Site Inspection
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 max-w-2xl">
                Confirm the property details below to submit your UKG Assurance request for confirmation and quotation.
              </p>
            </div>
          )}
        </section>

        {/* 2. CONCISE OVERVIEW OF UKG ASSURANCE PLANS ("little info about plans") */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/85 dark:border-emerald-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-emerald-900/70 pb-3">
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#0E3A2B] dark:text-white">
                UKG Assurance Plan Overview
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-200/80">
                Every Standard Assurance Package includes all 4 verification & inspection services below, plus optional add-ons if required.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAssuranceInfoPage}
              className="text-xs font-bold text-emerald-700 dark:text-[#C2A691] hover:underline self-start sm:self-center cursor-pointer"
            >
              See Full Service Details →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              {
                title: '1. Ownership Verification',
                desc: 'Review available ownership deeds, Khasra, Khatauni & land records.',
              },
              {
                title: '2. Document Verification',
                desc: 'Review registry paperwork, land-use info & apparent claim discrepancies.',
              },
              {
                title: '3. Physical Site Inspection',
                desc: 'On-site visit to inspect visible boundaries, road access & take photos.',
              },
              {
                title: '4. Assurance PDF Report',
                desc: 'Detailed PDF report with findings, site photographs & key observations.',
              },
            ].map((s) => (
              <div
                key={s.title}
                className="p-3.5 rounded-2xl bg-[#FAF9F6] dark:bg-[#051811] border border-emerald-200/60 dark:border-emerald-900/70 space-y-1"
              >
                <div className="font-bold text-[#0E3A2B] dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C2A691] shrink-0" />
                  <span>{s.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Compact Value-Bracket Fee Strip */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-slate-700 dark:text-emerald-200 mr-1">
              Standard Package Tiers:
            </span>
            {pricing.brackets.map((b) => {
              const active = b.id === propertyValueBracketId;
              return (
                <span
                  key={b.id}
                  className={`px-2.5 py-1 rounded-lg border font-semibold ${
                    active
                      ? 'bg-[#0E3A2B] text-white border-[#0E3A2B] dark:bg-[#C2A691] dark:text-[#032D1F] dark:border-[#C2A691]'
                      : 'bg-slate-50 dark:bg-[#051811] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-emerald-900'
                  }`}
                >
                  {b.label}:{' '}
                  <strong>
                    {b.isCustomQuote || b.fee === null ? 'Custom Quote' : formatAssuranceRupees(b.fee)}
                  </strong>
                </span>
              );
            })}
          </div>
        </section>

        {/* 3. PERSONALIZED APPLICATION FORM + LIVE QUOTATION SUMMARY */}
        {submittedApp ? (
          <div className="p-7 sm:p-10 rounded-3xl bg-white dark:bg-[#072118] border-2 border-emerald-500/70 dark:border-emerald-700 shadow-xl space-y-6 max-w-3xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Application Submitted • Reference {submittedApp.id}
                </div>
                <h2 className="font-serif-luxury text-2xl font-bold text-[#0E3A2B] dark:text-white">
                  Your Personalized UKG Assurance Request Is Received
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Current status: <strong>{submittedApp.status}</strong>. Our team will review the property details and confirm your quotation before any payment is collected.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/70 text-xs">
              <div>
                <div className="text-slate-500 dark:text-emerald-300/75 font-semibold">Property</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {submittedApp.propertyType} • {submittedApp.propertyLocation}
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-emerald-300/75 font-semibold">Value Bracket</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {submittedApp.propertyValueBracketLabel}
                </div>
              </div>
              <div>
                <div className="text-slate-500 dark:text-emerald-300/75 font-semibold">Fee Summary</div>
                <div className="font-extrabold text-[#0E3A2B] dark:text-[#C2A691] mt-0.5">
                  {submittedApp.snapshotIsCustomQuote || submittedApp.snapshotCalculatedTotal === null
                    ? 'Custom Quotation Required'
                    : formatAssuranceRupees(submittedApp.snapshotCalculatedTotal)}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenCustomerDashboard}
                className="px-6 py-3 rounded-2xl bg-[#0E3A2B] hover:bg-[#09281d] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Track in Customer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/60 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-800 dark:text-emerald-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Return to Property
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
            {/* Left 7 Columns: Personalized Form */}
            <form
              id="assurance-application-form"
              onSubmit={handleFormSubmit}
              className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/85 dark:border-emerald-800/80 shadow-md space-y-5"
            >
              <div className="border-b border-slate-100 dark:border-emerald-900/60 pb-3">
                <h2 className="font-serif-luxury text-xl font-bold text-[#0E3A2B] dark:text-white">
                  Your Details & Pre-Filled Property Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-emerald-200/75 mt-0.5">
                  Property fields below have been pre-filled from your selected listing. Enter your contact details and requirements to submit.
                </p>
              </div>

              <input
                type="text"
                name="companyWebsite"
                value={honeypotWebsite}
                onChange={(e) => setHoneypotWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="assurance-customer-name"
                    className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                  >
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="assurance-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="assurance-mobile-number"
                    className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                  >
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="assurance-mobile-number"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Pre-filled Property Fields */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-[#051A12] border border-emerald-200/80 dark:border-emerald-800/80 space-y-4">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-[#C2A691]">
                  Pre-Filled Property Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label
                      htmlFor="assurance-property-location"
                      className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                    >
                      Property Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="assurance-property-location"
                      type="text"
                      required
                      value={propertyLocation}
                      onChange={(e) => setPropertyLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#072118] border border-slate-300 dark:border-emerald-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="assurance-property-type"
                      className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                    >
                      Property Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assurance-property-type"
                      required
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#072118] border border-slate-300 dark:border-emerald-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {ASSURANCE_PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label
                      htmlFor="assurance-value-range"
                      className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                    >
                      Property Value Range <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="assurance-value-range"
                      required
                      value={propertyValueBracketId}
                      onChange={(e) => setPropertyValueBracketId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#072118] border border-slate-300 dark:border-emerald-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {pricing.brackets.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label} —{' '}
                          {b.isCustomQuote || b.fee === null
                            ? 'Custom Quotation Required'
                            : formatAssuranceRupees(b.fee)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="assurance-property-link"
                      className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                    >
                      UKG Property Reference / Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="assurance-property-link"
                      type="text"
                      required
                      value={propertyLinkOrId}
                      onChange={(e) => setPropertyLinkOrId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#072118] border border-slate-300 dark:border-emerald-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Required: Additional Requirements */}
              <div className="space-y-1.5">
                <label
                  htmlFor="assurance-additional-requirements"
                  className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                >
                  Verification Focus / Specific Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="assurance-additional-requirements"
                  rows={3}
                  required
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="Specify what you want checked on this property (e.g., Khasra/Khatauni verification, approach road width, boundary markers)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Optional Checkboxes: Paid Add-Ons */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-bold text-slate-700 dark:text-emerald-100">
                  Optional Paid Add-On Services (Select either, both, or neither)
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-200 dark:border-emerald-800/80 cursor-pointer hover:border-emerald-400 transition-colors">
                  <input
                    id="addon-purchase-assistance"
                    type="checkbox"
                    checked={addonPurchaseAssistance}
                    onChange={(e) => setAddonPurchaseAssistance(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#0E3A2B] rounded cursor-pointer"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Purchase Assistance
                      </span>
                      <span className="font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                        {pricing.purchaseAssistancePrice !== null
                          ? `+ ${formatAssuranceRupees(pricing.purchaseAssistancePrice)}`
                          : 'Additional charge confirmed in quotation'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Seller coordination, agreement formalities, registration appointment & handover support.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-200 dark:border-emerald-800/80 cursor-pointer hover:border-emerald-400 transition-colors">
                  <input
                    id="addon-dedicated-coordinator"
                    type="checkbox"
                    checked={addonDedicatedCoordinator}
                    onChange={(e) => setAddonDedicatedCoordinator(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#0E3A2B] rounded cursor-pointer"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Dedicated UKG Coordinator
                      </span>
                      <span className="font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                        {pricing.dedicatedCoordinatorPrice !== null
                          ? `+ ${formatAssuranceRupees(pricing.dedicatedCoordinatorPrice)}`
                          : 'Additional charge confirmed in quotation'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Dedicated contact person, regular progress updates & walkthrough of your Assurance Report.
                    </p>
                  </div>
                </label>
              </div>

              {/* Optional: Private Document Uploads */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Upload Property Documents, If Shared by Seller (Optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    PDF, JPG, PNG, WEBP • Max 20 MB
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleDocumentSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploadingDoc}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3.5 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/25 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {uploadingDoc ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading securely to private vault...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Attach Available Property Papers (Private Storage)</span>
                    </>
                  )}
                </button>

                {uploadError && (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadedDocs.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {uploadedDocs.map((doc) => (
                      <div
                        key={doc.fileId}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-white truncate">
                            {doc.name}
                          </span>
                          <span className="text-[11px] text-slate-500 shrink-0">
                            ({formatFileSize(doc.sizeBytes)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedDoc(doc.fileId)}
                          className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 text-slate-500 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional: Additional Message */}
              <div className="space-y-1.5">
                <label
                  htmlFor="assurance-additional-message"
                  className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                >
                  Additional Message (Optional)
                </label>
                <textarea
                  id="assurance-additional-message"
                  rows={2}
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  placeholder="Preferred callback time or notes for the UKG team..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  id="submit-assurance-request-btn"
                  type="submit"
                  disabled={submitting || uploadingDoc}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0E3A2B] hover:bg-[#09281d] dark:bg-[#C2A691] dark:hover:bg-[#d2b8a5] text-white dark:text-[#032D1F] font-extrabold text-sm shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Assurance Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Assurance Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-500 dark:text-emerald-200/75">
                  No automatic payment is charged on submission. UKG confirms scope and shares your quotation first.
                </p>
              </div>
            </form>

            {/* Right 5 Columns: Sticky Calculated Price & Quotation Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0E3A2B] text-white border border-emerald-800 shadow-xl space-y-5">
                <div className="border-b border-white/15 pb-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#C2A691]">
                    Estimated Assurance Summary
                  </div>
                  <h3 className="font-serif-luxury text-xl font-bold mt-1">
                    Selected Plan & Charges
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white">Standard Assurance Package</div>
                      <div className="text-[11px] text-emerald-200/80">
                        Bracket: {selectedBracket.label}
                      </div>
                    </div>
                    <div className="font-extrabold text-[#C2A691] text-right">
                      {priceSummary.isCustomStandard
                        ? 'Custom Quotation Required'
                        : formatAssuranceRupees(priceSummary.standardFee)}
                    </div>
                  </div>

                  {addonPurchaseAssistance && (
                    <div className="flex items-start justify-between gap-3 pt-2 border-t border-white/10">
                      <div>
                        <div className="font-semibold text-emerald-100">Add-On: Purchase Assistance</div>
                        <div className="text-[11px] text-emerald-200/70">Optional selected service</div>
                      </div>
                      <div className="font-bold text-white text-right">
                        {priceSummary.paFee !== null
                          ? `+ ${formatAssuranceRupees(priceSummary.paFee)}`
                          : 'Confirmed in quotation'}
                      </div>
                    </div>
                  )}

                  {addonDedicatedCoordinator && (
                    <div className="flex items-start justify-between gap-3 pt-2 border-t border-white/10">
                      <div>
                        <div className="font-semibold text-emerald-100">
                          Add-On: Dedicated UKG Coordinator
                        </div>
                        <div className="text-[11px] text-emerald-200/70">Optional selected service</div>
                      </div>
                      <div className="font-bold text-white text-right">
                        {priceSummary.dcFee !== null
                          ? `+ ${formatAssuranceRupees(priceSummary.dcFee)}`
                          : 'Confirmed in quotation'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                      {priceSummary.isCustomStandard ? 'Quotation Status' : 'Estimated Total'}
                    </span>
                    <span
                      id="assurance-calculated-total"
                      className="text-lg sm:text-xl font-black text-[#C2A691]"
                    >
                      {priceSummary.isCustomStandard
                        ? 'Custom Quotation Required'
                        : priceSummary.calculatedTotal !== null
                          ? formatAssuranceRupees(priceSummary.calculatedTotal)
                          : `${formatAssuranceRupees(priceSummary.basePlusKnownAddons)} + Add-On Quote`}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                    {priceSummary.isCustomStandard
                      ? 'For properties above ₹1 crore, UKG prepares a tailored quotation based on property scope and documentation.'
                      : priceSummary.unpricedAddonSelected
                        ? 'Standard package fee is fixed above; charges for your selected optional add-on(s) will be confirmed in your UKG quotation before payment.'
                        : 'Includes all 4 Standard Assurance services. Third-party expenses (if any) always require customer approval before being incurred.'}
                  </p>
                </div>

                <div className="space-y-2 pt-1 text-xs text-emerald-100/85">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C2A691]" />
                    <span>Next Steps After Submission</span>
                  </div>
                  <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-emerald-100/80">
                    <li>Submit request — no automatic payment is taken.</li>
                    <li>UKG confirms quotation & assigns your verification team.</li>
                    <li>Track all 6 stages & download your PDF Report in Dashboard.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Legal Disclaimers */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-[#061D15] border border-slate-200 dark:border-emerald-900/80 space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0E3A2B] dark:text-[#C2A691] shrink-0" />
            <h3 className="font-serif-luxury text-base font-bold text-[#0E3A2B] dark:text-white">
              Important Limitations & Disclaimers
            </h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
            {LEGAL_DISCLAIMERS.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E3A2B] dark:bg-[#C2A691] shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
