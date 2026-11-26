import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  FileSearch,
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Briefcase,
  Info,
  Compass,
  Scale,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import type {
  AssurancePriceBracket,
  AssurancePricingConfig,
} from '../types';
import { useAuth } from '../context/AuthContext';
import {
  assuranceFetch,
  formatAssuranceRupees,
} from '../utils/assuranceApi';

interface UKGAssurancePageProps {
  onBackToMain: () => void;
  onBrowseProperties?: () => void;
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
  onBrowseProperties,
  onOpenCustomerDashboard,
  embeddedInMobileApp = false,
}) => {
  const { currentUser } = useAuth();

  const [pricing, setPricing] = useState<AssurancePricingConfig>({
    brackets: DEFAULT_BRACKETS,
    purchaseAssistancePrice: null,
    dedicatedCoordinatorPrice: null,
  });
  const [loadingPricing, setLoadingPricing] = useState<boolean>(true);

  const loadPricing = useCallback(async () => {
    setLoadingPricing(true);
    try {
      const res = await assuranceFetch('/api/assurance/pricing', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && data?.pricing) {
        setPricing({
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
        });
      }
    } catch {
      // Fallback to default brackets silently
    } finally {
      setLoadingPricing(false);
    }
  }, []);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBrowseToSelectProperty = () => {
    if (onBrowseProperties) {
      onBrowseProperties();
    } else {
      onBackToMain();
    }
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
          initial={{ opacity: 0.96, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E3A2B] via-[#092C20] to-[#041F16] text-[#F4F3EF] border border-emerald-800/70 shadow-2xl p-6 sm:p-10 lg:p-14"
        >
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
                  onClick={handleBrowseToSelectProperty}
                  className="px-6 py-3.5 rounded-2xl bg-[#C2A691] hover:bg-[#d1b7a4] text-[#032D1F] font-extrabold text-sm shadow-lg shadow-black/20 transition-all active:scale-[0.99] cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>Browse Properties for Assurance</span>
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

        {/* HOW TO REQUEST ASSURANCE ON ANY PROPERTY */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/85 dark:border-emerald-800/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-[#C2A691]">
                How It Works
              </div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#0E3A2B] dark:text-white mt-0.5">
                Request UKG Assurance Directly From Any Property Listing
              </h2>
            </div>
            <button
              type="button"
              onClick={handleBrowseToSelectProperty}
              className="px-4 py-2.5 rounded-xl bg-[#0E3A2B] hover:bg-[#09281d] dark:bg-[#C2A691] dark:hover:bg-[#d2b8a5] text-white dark:text-[#032D1F] font-extrabold text-xs cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Explore Listings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#051811] border border-emerald-200/70 dark:border-emerald-900/70 space-y-1.5">
              <div className="text-xs font-black text-[#0E3A2B] dark:text-[#C2A691]">Step 1 • Choose a Property</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Click the <strong>UKG Assurance</strong> button on any property card or property details page across Uttarakhand Gateways.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#051811] border border-emerald-200/70 dark:border-emerald-900/70 space-y-1.5">
              <div className="text-xs font-black text-[#0E3A2B] dark:text-[#C2A691]">Step 2 • Personalized Request</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A personalized Assurance page opens with that property’s location, type, listing reference, and value bracket pre-filled automatically.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#051811] border border-emerald-200/70 dark:border-emerald-900/70 space-y-1.5">
              <div className="text-xs font-black text-[#0E3A2B] dark:text-[#C2A691]">Step 3 • Confirmation & PDF Report</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                UKG confirms your quotation first (no automatic charge), conducts the review & inspection, and delivers your PDF report in your Dashboard.
              </p>
            </div>
          </div>
        </section>

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
                    <th className="py-3.5 px-5 sm:px-8 text-right text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-emerald-200">
                      Assurance Fee
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/60">
                  {pricing.brackets.map((bracket) => (
                    <tr
                      key={bracket.id}
                      className="hover:bg-slate-50 dark:hover:bg-emerald-950/25 transition-colors"
                    >
                      <td className="py-4 px-5 sm:px-8 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {bracket.label}
                      </td>
                      <td className="py-4 px-5 sm:px-8 text-right text-sm sm:text-base font-extrabold text-[#0E3A2B] dark:text-[#C2A691]">
                        {bracket.isCustomQuote || bracket.fee === null
                          ? 'Custom quotation'
                          : formatAssuranceRupees(bracket.fee)}
                      </td>
                    </tr>
                  ))}
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
              When requesting Assurance on any property, customers can select either, both, or neither add-on according to their requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add-on 1: Purchase Assistance */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-4">
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

            {/* Add-on 2: Dedicated UKG Coordinator */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-4">
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

        {/* READY TO GET ASSURANCE BANNER */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0E3A2B] via-[#0B3124] to-[#072118] text-white border border-emerald-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#C2A691]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personalized Property Verification</span>
            </div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold">
              Ready to Review a Property Before Buying?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/85">
              Open any property listing on Uttarakhand Gateways and tap the <strong>UKG Assurance</strong> button to launch a personalized request with that property’s details pre-filled.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBrowseToSelectProperty}
            className="px-5 py-3 rounded-2xl bg-[#C2A691] hover:bg-[#d1b8a5] text-[#032D1F] font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-2"
          >
            <span>Browse Properties</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
