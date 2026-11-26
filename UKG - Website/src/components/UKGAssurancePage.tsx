import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  FileSearch,
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowRight,
  Upload,
  X,
  AlertCircle,
  UserCheck,
  Briefcase,
  Lock,
  Info,
  Compass,
  Scale,
  Clock,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import type {
  AssuranceApplication,
  AssuranceDocumentMeta,
  AssurancePriceBracket,
  AssurancePricingConfig,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  assuranceFetch,
  ASSURANCE_PROPERTY_TYPES,
  formatAssuranceRupees,
  formatFileSize,
} from '../utils/assuranceApi';

interface UKGAssurancePageProps {
  onBackToMain: () => void;
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

export const UKGAssurancePage: React.FC<UKGAssurancePageProps> = ({
  onBackToMain,
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
  const [loadingPricing, setLoadingPricing] = useState<boolean>(true);

  // Application Form State
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

  // Uploaded Private Documents State
  const [uploadedDocs, setUploadedDocs] = useState<AssuranceDocumentMeta[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<AssuranceApplication | null>(null);
  const pendingAutoSubmitRef = useRef<boolean>(false);

  // Prefill customer name from logged-in account if blank
  useEffect(() => {
    if (currentUser?.username && !customerName) {
      setCustomerName(currentUser.username);
    }
  }, [currentUser, customerName]);

  // Pre-fill property link/ID if navigated with ?propertyId=...
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const pid = sp.get('propertyId') || sp.get('listing');
      if (pid && !propertyLinkOrId) {
        setPropertyLinkOrId(pid);
      }
    } catch {}
  }, [propertyLinkOrId]);

  const loadPricing = useCallback(async () => {
    setLoadingPricing(true);
    try {
      const res = await assuranceFetch('/api/assurance/pricing', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && data?.pricing) {
        const nextPricing: AssurancePricingConfig = {
          brackets:
            Array.isArray(data.pricing.brackets) && data.pricing.brackets.length > 0
              ? data.pricing.brackets
              : DEFAULT_BRACKETS,
          purchaseAssistancePrice:
            data.pricing.purchaseAssistancePrice === null || data.pricing.purchaseAssistancePrice === undefined
              ? null
              : Number(data.pricing.purchaseAssistancePrice),
          dedicatedCoordinatorPrice:
            data.pricing.dedicatedCoordinatorPrice === null || data.pricing.dedicatedCoordinatorPrice === undefined
              ? null
              : Number(data.pricing.dedicatedCoordinatorPrice),
          updatedAt: data.pricing.updatedAt,
        };
        setPricing(nextPricing);
        setPropertyValueBracketId((prev) =>
          nextPricing.brackets.some((b) => b.id === prev) ? prev : nextPricing.brackets[0].id
        );
      }
    } catch {
      // Fallback to default brackets silently
    } finally {
      setLoadingPricing(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    const tenDigit = digitsOnly.length === 12 && digitsOnly.startsWith('91') ? digitsOnly.slice(2) : digitsOnly;
    if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (propertyLocation.trim().length < 3) {
      return 'Please enter the property location (city / town and locality).';
    }
    if (!propertyValueBracketId) {
      return 'Please select the property value range.';
    }
    if (propertyLinkOrId.trim().length < 2) {
      return 'Please enter the property listing link / UKG Property ID, or click "Not listed on UKG".';
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
          customerName: customerName.trim(),
          mobileNumber: mobileNumber.trim(),
          propertyLocation: propertyLocation.trim(),
          propertyValueBracketId,
          propertyLinkOrId: propertyLinkOrId.trim(),
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
      setTimeout(() => {
        scrollToSection('assurance-application-form');
      }, 80);
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
      executeApplicationSubmit();
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

  const resetForAnotherRequest = () => {
    setSubmittedApp(null);
    setPropertyLocation('');
    setPropertyLinkOrId('');
    setAdditionalRequirements('');
    setAdditionalMessage('');
    setAddonPurchaseAssistance(false);
    setAddonDedicatedCoordinator(false);
    setUploadedDocs([]);
    setFormError(null);
  };

  const standardServices = [
    {
      number: '01',
      title: 'Ownership Verification',
      icon: FileSearch,
      points: [
        'Review available ownership documents.',
        'Check available Khasra and Khatauni records.',
        'Review available land records.',
        'Identify apparent ownership-related concerns.',
      ],
    },
    {
      number: '02',
      title: 'Document Verification',
      icon: Scale,
      points: [
        'Review available registry documents.',
        'Check relevant property paperwork.',
        'Review available land-use information.',
        'Identify apparent document inconsistencies.',
        'Review available information about loans, disputes or other claims.',
      ],
    },
    {
      number: '03',
      title: 'Physical Property Inspection',
      icon: Camera,
      points: [
        'Physical site visit.',
        'Check visible property boundaries.',
        'Check road access.',
        'Inspect visible property condition.',
        'Take photographs of the property.',
      ],
    },
    {
      number: '04',
      title: 'UKG Assurance Report',
      icon: FileText,
      subtitle: 'Professional PDF report containing:',
      points: [
        'Property details.',
        'Documents reviewed.',
        'Verification findings.',
        'Inspection photographs.',
        'Identified concerns.',
        'Services performed.',
        'Important limitations and disclaimers.',
      ],
    },
  ];

  return (
    <div
      className={`w-full ${
        embeddedInMobileApp ? 'pt-2 pb-20' : 'pt-20 sm:pt-24 pb-16'
      } text-slate-900 dark:text-[#F4F3EF]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-20">
        {/* Top Utility Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onBackToMain}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 hover:text-emerald-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={onOpenCustomerDashboard}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-[#09291E] border border-emerald-200/90 dark:border-emerald-800/80 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:border-emerald-400 shadow-2xs transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>My Assurance Applications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 1. HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E3A2B] via-[#092C20] to-[#041F16] text-[#F4F3EF] border border-emerald-800/70 shadow-2xl p-6 sm:p-10 lg:p-14"
        >
          {/* Subtle architectural grid & warm bronze glow */}
          <div className="pointer-events-none absolute -top-28 -right-24 w-96 h-96 rounded-full bg-[#C2A691]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#E5D3C5] text-[11px] font-bold uppercase tracking-[0.14em]">
                <Shield className="w-3.5 h-3.5 text-[#C2A691]" />
                <span>UKG Assurance • Uttarakhand Property Review</span>
              </div>

              <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-white">
                Buy Property with Greater Confidence.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
                Before investing your hard-earned money, let UKG help you review the property documents and inspect the property.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('assurance-application-form')}
                  className="px-6 py-3.5 rounded-2xl bg-[#C2A691] hover:bg-[#d1b7a4] text-[#032D1F] font-extrabold text-sm shadow-lg shadow-black/20 transition-all active:scale-[0.99] cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Get UKG Assurance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('assurance-services')}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm transition-all active:scale-[0.99] cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Explore Our Services</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs text-emerald-100/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C2A691] shrink-0" />
                  <span>Khasra, Khatauni & Registry Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C2A691] shrink-0" />
                  <span>On-Site Physical Inspection</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <CheckCircle2 className="w-4 h-4 text-[#C2A691] shrink-0" />
                  <span>Detailed PDF Assurance Report</span>
                </div>
              </div>
            </div>

            {/* Structured Verification Dossier Visual */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#FAF9F6] dark:bg-[#072319] text-slate-900 dark:text-[#F4F3EF] p-5 sm:p-6 border border-emerald-200/40 dark:border-emerald-800/80 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800/70 pb-3.5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 dark:text-[#C2A691]">
                      Standard Assurance Dossier
                    </div>
                    <div className="font-serif-luxury text-lg font-bold text-[#0E3A2B] dark:text-white mt-0.5">
                      4-Stage Due-Diligence Review
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
                    <FileSearch className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      step: '1',
                      label: 'Ownership & Land Records',
                      desc: 'Available Khasra, Khatauni & ownership chain review',
                    },
                    {
                      step: '2',
                      label: 'Registry & Paperwork Check',
                      desc: 'Deed paperwork, land-use notes & apparent discrepancies',
                    },
                    {
                      step: '3',
                      label: 'On-Ground Site Inspection',
                      desc: 'Visible boundaries, road access & site photographs',
                    },
                    {
                      step: '4',
                      label: 'UKG Assurance PDF Report',
                      desc: 'Structured written findings, photos & key observations',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50"
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#0E3A2B] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-emerald-200/75">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-emerald-200/80 font-medium">
                    Starting from
                  </span>
                  <span className="text-base font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                    {pricing.brackets[0]?.fee !== null && pricing.brackets[0]?.fee !== undefined
                      ? formatAssuranceRupees(pricing.brackets[0].fee)
                      : '₹7,999'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. WHY UKG ASSURANCE? */}
        <motion.section
          initial={{ opacity: 0.96, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.02 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-[#C2A691]">
              Why UKG Assurance?
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0E3A2B] dark:text-white">
              Informed Decisions Before You Commit Your Capital
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/80 leading-relaxed">
              Purchasing land, plots, cottages, or residential property in Uttarakhand involves regional revenue records, hill terrain considerations, and road-access realities that are not always obvious from a listing alone. Reviewing available paperwork and inspecting the property on the ground helps buyers spot apparent concerns before entering into an agreement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-200/80 dark:border-emerald-800/70 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#0E3A2B] dark:text-emerald-300 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Early Paperwork Clarity
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Examining available registry deeds, Khasra and Khatauni extracts, and land-use records helps surface apparent gaps, missing pages, or record mismatches early.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-200/80 dark:border-emerald-800/70 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#0E3A2B] dark:text-emerald-300 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Ground Reality Verification
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Especially for out-of-town buyers, an independent site visit verifies visible boundaries, actual approach road access, terrain condition, and current site photographs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-200/80 dark:border-emerald-800/70 shadow-xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-[#0E3A2B] dark:text-emerald-300 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Structured Written Findings
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Receive a consolidated UKG Assurance PDF Report documenting what was reviewed, site photographs, and apparent observations so you can evaluate next steps clearly.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 3. OUR SERVICES & STANDARD ASSURANCE PACKAGE PRICING */}
        <motion.section
          id="assurance-services"
          initial={{ opacity: 0.96, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.02 }}
          transition={{ duration: 0.35 }}
          className="scroll-mt-24 space-y-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-[#C2A691]">
                Our Services • Standard Assurance Package
              </div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0E3A2B] dark:text-white">
                Four Essential Services Included in Every Standard Package
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/80">
                All four verification and inspection services below are included in the Standard Assurance Package, priced transparently according to the property’s value bracket.
              </p>
            </div>
          </div>

          {/* 4 Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {standardServices.map((service) => {
              const IconComp = service.icon;
              return (
                <div
                  key={service.number}
                  className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/85 dark:border-emerald-800/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shadow-xs">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        Service {service.number} • Included
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#0E3A2B] dark:text-white">
                        {service.title}
                      </h3>
                      {service.subtitle && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-emerald-200/75 mt-1">
                          {service.subtitle}
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 pt-1">
                      {service.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Standard Assurance Package Pricing Table */}
          <div className="rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/90 dark:border-emerald-800/80 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0E3A2B] to-[#082A1E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#C2A691]">
                  Transparent Value-Based Schedule
                </div>
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold mt-1">
                  Standard Assurance Package Pricing
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/85 mt-1">
                  Includes Ownership Verification, Document Verification, Physical Property Inspection, and the UKG Assurance PDF Report.
                </p>
              </div>
              {loadingPricing && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Refreshing rates...</span>
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-100 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <th className="py-3.5 px-5 sm:px-8 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-emerald-200">
                      Property Value
                    </th>
                    <th className="py-3.5 px-5 sm:px-8 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-emerald-200">
                      Assurance Fee
                    </th>
                    <th className="py-3.5 px-5 sm:px-8 text-right text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-emerald-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/60">
                  {pricing.brackets.map((bracket) => {
                    const isSelected = bracket.id === propertyValueBracketId;
                    return (
                      <tr
                        key={bracket.id}
                        onClick={() => {
                          setPropertyValueBracketId(bracket.id);
                        }}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/90 dark:bg-emerald-900/30'
                            : 'hover:bg-slate-50 dark:hover:bg-emerald-950/25'
                        }`}
                      >
                        <td className="py-4 px-5 sm:px-8 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isSelected ? 'bg-emerald-600 dark:bg-[#C2A691]' : 'bg-slate-300 dark:bg-emerald-800'
                              }`}
                            />
                            <span>{bracket.label}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 sm:px-8 text-sm sm:text-base font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                          {bracket.isCustomQuote || bracket.fee === null
                            ? 'Custom quotation'
                            : formatAssuranceRupees(bracket.fee)}
                        </td>
                        <td className="py-4 px-5 sm:px-8 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPropertyValueBracketId(bracket.id);
                              scrollToSection('assurance-application-form');
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0E3A2B] text-white dark:bg-[#C2A691] dark:text-[#032D1F]'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* 4. OPTIONAL PAID ADD-ON SERVICES & 5. OTHER ADDITIONAL EXPENSES */}
        <motion.section
          initial={{ opacity: 0.96, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.02 }}
          transition={{ duration: 0.35 }}
          className="space-y-8"
        >
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Optional Paid Add-On Services • Not Included in Standard Package
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#0E3A2B] dark:text-white">
              Tailor Support With Optional Paid Add-Ons
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/80">
              Select either, both, or neither add-on according to your requirements. Add-on charges are separate from the Standard Assurance Package and are shown clearly before you submit your request.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add-on 1: Purchase Assistance */}
            <div
              className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                addonPurchaseAssistance
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 dark:border-[#C2A691] shadow-md'
                  : 'bg-white dark:bg-[#072118] border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80">
                      Optional Add-On Fee
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                      {pricing.purchaseAssistancePrice !== null
                        ? `+ ${formatAssuranceRupees(pricing.purchaseAssistancePrice)}`
                        : 'Confirmed in quotation'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#0E3A2B] dark:text-white">
                    Purchase Assistance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/75 mt-1">
                    End-to-end transaction & registration coordination support
                  </p>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {[
                    'Seller coordination.',
                    'Assistance with agreement-related formalities.',
                    'Registration appointment coordination.',
                    'Help with the property handover process.',
                  ].map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setAddonPurchaseAssistance((prev) => !prev)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  addonPurchaseAssistance
                    ? 'bg-[#0E3A2B] text-white dark:bg-[#C2A691] dark:text-[#032D1F]'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {addonPurchaseAssistance ? '✓ Selected in Your Request' : '+ Select Purchase Assistance'}
              </button>
            </div>

            {/* Add-on 2: Dedicated UKG Coordinator */}
            <div
              className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                addonDedicatedCoordinator
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-600 dark:border-[#C2A691] shadow-md'
                  : 'bg-white dark:bg-[#072118] border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80">
                      Optional Add-On Fee
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                      {pricing.dedicatedCoordinatorPrice !== null
                        ? `+ ${formatAssuranceRupees(pricing.dedicatedCoordinatorPrice)}`
                        : 'Confirmed in quotation'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#0E3A2B] dark:text-white">
                    Dedicated UKG Coordinator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-200/75 mt-1">
                    Single point of contact throughout your agreed service period
                  </p>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {[
                    'Dedicated contact person.',
                    'Regular progress updates.',
                    'Help understanding the Assurance Report.',
                    'Coordination throughout the agreed service period.',
                  ].map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => setAddonDedicatedCoordinator((prev) => !prev)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  addonDedicatedCoordinator
                    ? 'bg-[#0E3A2B] text-white dark:bg-[#C2A691] dark:text-[#032D1F]'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {addonDedicatedCoordinator ? '✓ Selected in Your Request' : '+ Select Dedicated UKG Coordinator'}
              </button>
            </div>
          </div>

          {/* 5. OTHER ADDITIONAL EXPENSES DISCLOSURE */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF9F6] dark:bg-[#08241A] border border-emerald-200/90 dark:border-emerald-800/80 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Other Additional Expenses (Not Included in Standard Package)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Depending on property location, record availability, or customer requests, the following third-party or out-of-pocket expenses are not included in the standard package:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                "Lawyer's professional fees, if required.",
                'Government document fees.',
                'Surveyor charges, if required.',
                'Additional travel expenses, where applicable.',
              ].map((expense, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#061D15] border border-slate-200/80 dark:border-emerald-900/70 text-xs font-semibold text-slate-700 dark:text-emerald-100"
                >
                  {expense}
                </div>
              ))}
            </div>

            <p className="text-xs font-bold text-emerald-900 dark:text-[#C2A691] pt-1">
              All additional expenses are disclosed transparently and must be approved by the customer before being incurred.
            </p>
          </div>
        </motion.section>

        {/* 6. ASSURANCE APPLICATION FORM */}
        <section id="assurance-application-form" className="scroll-mt-24 space-y-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-[#C2A691]">
              Request Verification & Inspection
            </div>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0E3A2B] dark:text-white">
              UKG Assurance Application Form
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/80">
              Submit your property details below. No automatic payment is charged — UKG will review your submission, confirm service scope, and share your quotation first.
            </p>
          </div>

          {submittedApp ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-7 sm:p-10 rounded-3xl bg-white dark:bg-[#072118] border-2 border-emerald-500/70 dark:border-emerald-700 shadow-xl space-y-6 max-w-3xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Application Submitted • Reference {submittedApp.id}
                  </div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#0E3A2B] dark:text-white">
                    We Have Received Your UKG Assurance Request
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your application status is currently <strong>{submittedApp.status}</strong>. Our verification team will review your details and confirm your quotation before any payment is collected.
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
                  <span>View in Customer Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetForAnotherRequest}
                  className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-emerald-950/60 hover:bg-slate-200 dark:hover:bg-emerald-900/60 text-slate-800 dark:text-emerald-200 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left 7 Columns: Form */}
              <form
                onSubmit={handleFormSubmit}
                className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/85 dark:border-emerald-800/80 shadow-md space-y-5"
              >
                {/* Honeypot anti-spam */}
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
                      Customer Name <span className="text-red-500">*</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="assurance-property-location"
                      className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                    >
                      Property Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        id="assurance-property-location"
                        type="text"
                        required
                        value={propertyLocation}
                        onChange={(e) => setPropertyLocation(e.target.value)}
                        placeholder="e.g., Tapovan, Rishikesh or Sahastradhara Rd, Dehradun"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {ASSURANCE_PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
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

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="assurance-property-link"
                        className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                      >
                        Listing Link or UKG Property ID <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setPropertyLinkOrId('Not listed on UKG')}
                        className="text-[11px] font-bold text-emerald-700 dark:text-[#C2A691] hover:underline cursor-pointer"
                      >
                        Not listed on UKG?
                      </button>
                    </div>
                    <input
                      id="assurance-property-link"
                      type="text"
                      required
                      value={propertyLinkOrId}
                      onChange={(e) => setPropertyLinkOrId(e.target.value)}
                      placeholder="Paste UKG listing link / ID, or click 'Not listed on UKG'"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#051A12] border border-slate-300 dark:border-emerald-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Required: Additional Requirements */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="assurance-additional-requirements"
                    className="block text-xs font-bold text-slate-700 dark:text-emerald-100"
                  >
                    Additional Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="assurance-additional-requirements"
                    rows={3}
                    required
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    placeholder="Specify what you want our team to focus on (e.g., Khasra/Khatauni verification, approach road width check, boundary inspection)..."
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
                      <span>Upload Property Documents (Optional)</span>
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
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/25 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {uploadingDoc ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading securely to private vault...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Select Ownership Deeds, Khasra/Khatauni, or Registry Papers</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Documents are stored in non-public authenticated storage accessible only to you and authorized UKG Assurance administrators.
                  </p>

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
                            title="Remove file"
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
                    placeholder="Preferred callback time or any extra context for our team..."
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
                    No automatic charge on submission. Your request is submitted to UKG for confirmation and quotation first.
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
                      Selected Package & Charges
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
                          : 'Includes all 4 Standard Assurance services. Third-party expenses (if any) always require prior customer approval.'}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs text-emerald-100/85">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C2A691]" />
                      <span>How Confirmation Works</span>
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-emerald-100/80">
                      <li>Submit your Assurance application — no payment is taken upfront.</li>
                      <li>UKG reviews property details and confirms your quotation & timeline.</li>
                      <li>Track all 6 verification stages live in your Customer Dashboard.</li>
                      <li>Download your final UKG Assurance PDF Report once ready.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 10. LEGAL DISCLAIMERS */}
        <section
          id="assurance-legal-disclaimers"
          className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#061D15] border border-slate-200 dark:border-emerald-900/80 space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#0E3A2B] dark:text-[#C2A691] shrink-0" />
            <h2 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#0E3A2B] dark:text-white">
              Important Limitations & Disclaimers
            </h2>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {LEGAL_DISCLAIMERS.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E3A2B] dark:bg-[#C2A691] shrink-0 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
