import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  IndianRupee,
  MessageSquare,
  Lock,
  History,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from 'lucide-react';
import type {
  AssuranceApplication,
  AssuranceApplicationStatus,
  AssurancePaymentStatus,
  AssurancePriceBracket,
  AssurancePricingConfig,
} from '../types';
import {
  assuranceFetch,
  ASSURANCE_STATUS_STEPS,
  downloadProtectedAssuranceFile,
  formatAssuranceRupees,
  formatFileSize,
} from '../utils/assuranceApi';

type AdminAssuranceFilter =
  | 'all'
  | 'new'
  | 'in_progress'
  | 'completed'
  | 'payment_pending'
  | 'custom_quote';

const PAYMENT_STATUS_OPTIONS: AssurancePaymentStatus[] = [
  'Quotation Pending',
  'Payment Pending',
  'Partially Paid',
  'Paid',
  'Refunded',
];

interface AdminAssurancePanelProps {
  onOverviewCountChange?: (newAppsCount: number, totalCount: number) => void;
}

export const AdminAssurancePanel: React.FC<AdminAssurancePanelProps> = ({
  onOverviewCountChange,
}) => {
  const [subView, setSubView] = useState<'applications' | 'pricing'>('applications');
  const [applications, setApplications] = useState<AssuranceApplication[]>([]);
  const [pricingDraft, setPricingDraft] = useState<AssurancePricingConfig>({
    brackets: [],
    purchaseAssistancePrice: null,
    dedicatedCoordinatorPrice: null,
  });
  const [paInput, setPaInput] = useState<string>('');
  const [dcInput, setDcInput] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [savingPricing, setSavingPricing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<AdminAssuranceFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  // Per-application inline draft state (keyed by app.id)
  const [draftEdits, setDraftEdits] = useState<
    Record<
      string,
      {
        status: AssuranceApplicationStatus;
        paymentStatus: AssurancePaymentStatus;
        assignedTeamMember: string;
        customQuotationAmount: string;
        customQuotationNotes: string;
        customerUpdateMessage: string;
        internalNote: string;
      }
    >
  >({});

  // Official PDF Report Generator Modal State
  const [reportGeneratorApp, setReportGeneratorApp] = useState<AssuranceApplication | null>(null);
  const [genDocsReviewed, setGenDocsReviewed] = useState<string>('');
  const [genFindings, setGenFindings] = useState<string>('');
  const [genInspectionSummary, setGenInspectionSummary] = useState<string>('');
  const [genConcerns, setGenConcerns] = useState<string>('');
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  const syncDraftsFromApplications = (apps: AssuranceApplication[]) => {
    setDraftEdits((prev) => {
      const next = { ...prev };
      for (const app of apps) {
        const existingDraft = prev[app.id];
        next[app.id] = {
          status: app.status,
          paymentStatus: app.paymentStatus,
          assignedTeamMember: app.assignedTeamMember || '',
          customQuotationAmount:
            app.customQuotationAmount !== null && app.customQuotationAmount !== undefined
              ? String(app.customQuotationAmount)
              : '',
          customQuotationNotes: app.customQuotationNotes || '',
          customerUpdateMessage: existingDraft?.customerUpdateMessage || '',
          internalNote: existingDraft?.internalNote || '',
        };
      }
      return next;
    });
  };

  const onOverviewCountChangeRef = useRef(onOverviewCountChange);
  useEffect(() => {
    onOverviewCountChangeRef.current = onOverviewCountChange;
  }, [onOverviewCountChange]);

  const loadOverview = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setErrorMsg(null);
      try {
        const res = await assuranceFetch('/api/admin/assurance/overview', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to load UKG Assurance overview.');
        }

        const loadedApps: AssuranceApplication[] = Array.isArray(data.applications)
          ? data.applications
          : [];
        setApplications(loadedApps);
        syncDraftsFromApplications(loadedApps);

        if (loadedApps.length > 0) {
          setExpandedAppId((prev) => prev || loadedApps[0].id);
        }

        if (data.pricing) {
          setPricingDraft(data.pricing);
          setPaInput(
            data.pricing.purchaseAssistancePrice !== null &&
              data.pricing.purchaseAssistancePrice !== undefined
              ? String(data.pricing.purchaseAssistancePrice)
              : ''
          );
          setDcInput(
            data.pricing.dedicatedCoordinatorPrice !== null &&
              data.pricing.dedicatedCoordinatorPrice !== undefined
              ? String(data.pricing.dedicatedCoordinatorPrice)
              : ''
          );
        }

        if (onOverviewCountChangeRef.current) {
          const newCount = loadedApps.filter((a) => a.status === 'Application Received').length;
          onOverviewCountChangeRef.current(newCount, loadedApps.length);
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Unable to load UKG Assurance admin data.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadOverview(false);
  }, [loadOverview]);

  const filterCounts = useMemo(() => {
    return {
      all: applications.length,
      new: applications.filter((a) => a.status === 'Application Received').length,
      in_progress: applications.filter((a) =>
        ['Under Document Review', 'Physical Inspection', 'Report Preparation', 'Report Ready'].includes(
          a.status
        )
      ).length,
      completed: applications.filter((a) => a.status === 'Completed').length,
      payment_pending: applications.filter((a) =>
        ['Quotation Pending', 'Payment Pending', 'Partially Paid'].includes(a.paymentStatus)
      ).length,
      custom_quote: applications.filter(
        (a) => Boolean(a.snapshotIsCustomQuote) || a.snapshotCalculatedTotal === null
      ).length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (activeFilter === 'new' && app.status !== 'Application Received') return false;
      if (
        activeFilter === 'in_progress' &&
        !['Under Document Review', 'Physical Inspection', 'Report Preparation', 'Report Ready'].includes(
          app.status
        )
      ) {
        return false;
      }
      if (activeFilter === 'completed' && app.status !== 'Completed') return false;
      if (
        activeFilter === 'payment_pending' &&
        !['Quotation Pending', 'Payment Pending', 'Partially Paid'].includes(app.paymentStatus)
      ) {
        return false;
      }
      if (
        activeFilter === 'custom_quote' &&
        !(Boolean(app.snapshotIsCustomQuote) || app.snapshotCalculatedTotal === null)
      ) {
        return false;
      }

      if (!q) return true;
      const hay = [
        app.id,
        app.customerName,
        app.mobileNumber,
        app.userEmail,
        app.propertyLocation,
        app.propertyType,
        app.propertyLinkOrId,
        app.assignedTeamMember,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [applications, activeFilter, searchQuery]);

  const updateAppDraft = (
    appId: string,
    patch: Partial<{
      status: AssuranceApplicationStatus;
      paymentStatus: AssurancePaymentStatus;
      assignedTeamMember: string;
      customQuotationAmount: string;
      customQuotationNotes: string;
      customerUpdateMessage: string;
      internalNote: string;
    }>
  ) => {
    setDraftEdits((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {
          status: 'Application Received',
          paymentStatus: 'Quotation Pending',
          assignedTeamMember: '',
          customQuotationAmount: '',
          customQuotationNotes: '',
          customerUpdateMessage: '',
          internalNote: '',
        }),
        ...patch,
      },
    }));
  };

  const handleSaveApplicationChanges = async (app: AssuranceApplication) => {
    const draft = draftEdits[app.id];
    if (!draft) return;

    setBusyAppId(app.id);
    setErrorMsg(null);
    try {
      const payload: Record<string, any> = {
        status: draft.status,
        paymentStatus: draft.paymentStatus,
        assignedTeamMember: draft.assignedTeamMember,
        customQuotationAmount:
          draft.customQuotationAmount.trim() === '' ? null : Number(draft.customQuotationAmount),
        customQuotationNotes: draft.customQuotationNotes,
      };
      if (draft.customerUpdateMessage.trim()) {
        payload.customerUpdateMessage = draft.customerUpdateMessage.trim();
      }
      if (draft.internalNote.trim()) {
        payload.internalNote = draft.internalNote.trim();
      }

      const res = await assuranceFetch(
        `/api/admin/assurance/applications/${encodeURIComponent(app.id)}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save application changes.');
      }

      updateAppDraft(app.id, { customerUpdateMessage: '', internalNote: '' });
      showToast(`Saved updates for ${app.id}`);
      await loadOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save application changes.');
    } finally {
      setBusyAppId(null);
    }
  };

  const handleUploadFinalReport = async (
    app: AssuranceApplication,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBusyAppId(app.id);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await assuranceFetch(
        `/api/admin/assurance/applications/${encodeURIComponent(app.id)}/report-upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to upload PDF report.');
      }
      showToast(`Uploaded Final Assurance PDF Report for ${app.id}`);
      await loadOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload PDF report.');
    } finally {
      setBusyAppId(null);
    }
  };

  const openReportGeneratorModal = (app: AssuranceApplication) => {
    setReportGeneratorApp(app);
    setGenDocsReviewed(
      app.customerDocuments?.length
        ? `Reviewed uploaded records (${app.customerDocuments.map((d) => d.name).join(', ')}), available Khasra/Khatauni extracts, and registry copies.`
        : 'Reviewed available ownership deeds, Khasra and Khatauni records, and property registry paperwork.'
    );
    setGenFindings(
      `Ownership chain and available revenue records for ${app.propertyType} at ${app.propertyLocation} were reviewed against accessible entries.`
    );
    setGenInspectionSummary(
      `Site visit completed at ${app.propertyLocation}. Checked visible property boundaries, approach road access, terrain condition, and recorded site photographs.`
    );
    setGenConcerns(
      'Buyer is advised to obtain a formal legal title search from a licensed Uttarakhand advocate prior to final sale deed execution.'
    );
  };

  const handleGenerateOfficialPdfReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportGeneratorApp) return;

    setGeneratingPdf(true);
    setErrorMsg(null);
    try {
      const res = await assuranceFetch(
        `/api/admin/assurance/applications/${encodeURIComponent(reportGeneratorApp.id)}/generate-report`,
        {
          method: 'POST',
          body: JSON.stringify({
            documentsReviewed: genDocsReviewed,
            verificationFindings: genFindings,
            inspectionPhotographsSummary: genInspectionSummary,
            identifiedConcerns: genConcerns,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to generate official PDF report.');
      }
      showToast(`Generated official Assurance PDF Report for ${reportGeneratorApp.id}`);
      setReportGeneratorApp(null);
      await loadOverview(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate PDF report.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadProtected = async (fileId: string, fileName: string) => {
    setDownloadingFileId(fileId);
    setErrorMsg(null);
    try {
      await downloadProtectedAssuranceFile(fileId, fileName);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to download protected file.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Pricing Management Handlers
  const updateBracketField = (idx: number, patch: Partial<AssurancePriceBracket>) => {
    setPricingDraft((prev) => {
      const copy = [...prev.brackets];
      copy[idx] = { ...copy[idx], ...patch };
      return { ...prev, brackets: copy };
    });
  };

  const addNewBracket = () => {
    setPricingDraft((prev) => ({
      ...prev,
      brackets: [
        ...prev.brackets,
        {
          id: `bracket-${Date.now().toString().slice(-5)}`,
          label: 'New Property Bracket',
          minAmount: 0,
          maxAmount: null,
          fee: 14999,
          isCustomQuote: false,
        },
      ],
    }));
  };

  const removeBracket = (idx: number) => {
    if (pricingDraft.brackets.length <= 1) return;
    setPricingDraft((prev) => ({
      ...prev,
      brackets: prev.brackets.filter((_, i) => i !== idx),
    }));
  };

  const handleSavePricingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPricing(true);
    setErrorMsg(null);
    try {
      const payload = {
        brackets: pricingDraft.brackets,
        purchaseAssistancePrice: paInput.trim() === '' ? null : Number(paInput),
        dedicatedCoordinatorPrice: dcInput.trim() === '' ? null : Number(dcInput),
      };
      const res = await assuranceFetch('/api/admin/assurance/pricing', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update pricing configuration.');
      }
      setPricingDraft(data.pricing);
      showToast('UKG Assurance pricing updated live across the website!');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update pricing configuration.');
    } finally {
      setSavingPricing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Sub-Navigation Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              UKG Assurance Management & Pricing Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-200/80">
              Manage incoming verification requests, private customer documents, custom quotations, PDF reports, and live pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubView('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              subView === 'applications'
                ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-700 dark:text-emerald-200'
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView('pricing')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              subView === 'pricing'
                ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-emerald-950/60 text-slate-700 dark:text-emerald-200'
            }`}
          >
            Pricing Management
          </button>
          <button
            type="button"
            onClick={() => void loadOverview(false)}
            className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
            title="Refresh Assurance Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {subView === 'pricing' ? (
        /* ================= PRICING MANAGEMENT VIEW ================= */
        <form
          onSubmit={handleSavePricingConfig}
          className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-800/80 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Standard Assurance Brackets & Optional Add-On Pricing
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-200/80 mt-0.5">
                All updates reflect immediately on the public UKG Assurance page. Existing applications retain the immutable fee snapshot agreed at submission.
              </p>
            </div>
            <button
              type="button"
              onClick={addNewBracket}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Value Bracket</span>
            </button>
          </div>

          {/* Standard Package Brackets Editor */}
          <div className="space-y-3">
            {pricingDraft.brackets.map((b, idx) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-emerald-200 mb-1">
                    Bracket Label
                  </label>
                  <input
                    type="text"
                    required
                    value={b.label}
                    onChange={(e) => updateBracketField(idx, { label: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#082218] border border-slate-300 dark:border-emerald-800 text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-emerald-200 mb-1">
                    Assurance Fee (₹ INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={b.isCustomQuote}
                    value={b.isCustomQuote ? '' : b.fee ?? ''}
                    placeholder={b.isCustomQuote ? 'Custom Quotation' : 'e.g. 11999'}
                    onChange={(e) =>
                      updateBracketField(idx, {
                        fee: e.target.value === '' ? 0 : Math.max(0, Math.round(Number(e.target.value))),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#082218] border border-slate-300 dark:border-emerald-800 text-xs font-bold disabled:opacity-50"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-2 pb-2">
                  <input
                    id={`custom-quote-toggle-${b.id}`}
                    type="checkbox"
                    checked={b.isCustomQuote}
                    onChange={(e) =>
                      updateBracketField(idx, {
                        isCustomQuote: e.target.checked,
                        fee: e.target.checked ? null : b.fee ?? 24999,
                      })
                    }
                    className="w-4 h-4 accent-[#0E3A2B] cursor-pointer"
                  />
                  <label
                    htmlFor={`custom-quote-toggle-${b.id}`}
                    className="text-xs font-bold text-slate-700 dark:text-emerald-200 cursor-pointer"
                  >
                    Custom Quotation Required
                  </label>
                </div>

                <div className="sm:col-span-1 flex justify-end pb-1">
                  {pricingDraft.brackets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBracket(idx)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                      title="Remove bracket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Optional Add-Ons Prices */}
          <div className="pt-4 border-t border-slate-200 dark:border-emerald-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-800/80 space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-white">
                Optional Add-On 1: Purchase Assistance Price (₹ INR)
              </label>
              <input
                id="admin-addon-purchase-assistance-price"
                type="number"
                min={0}
                value={paInput}
                onChange={(e) => setPaInput(e.target.value)}
                placeholder="Leave blank if shared per quotation, or enter fixed ₹ price"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#082218] border border-slate-300 dark:border-emerald-800 text-xs font-bold"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                When set, customers see "+ ₹amount" and it is added automatically to the live estimator. Leave blank to quote case-by-case.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-800/80 space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-white">
                Optional Add-On 2: Dedicated UKG Coordinator Price (₹ INR)
              </label>
              <input
                id="admin-addon-dedicated-coordinator-price"
                type="number"
                min={0}
                value={dcInput}
                onChange={(e) => setDcInput(e.target.value)}
                placeholder="Leave blank if shared per quotation, or enter fixed ₹ price"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#082218] border border-slate-300 dark:border-emerald-800 text-xs font-bold"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                When set, customers see "+ ₹amount" and it is added automatically to the live estimator. Leave blank to quote case-by-case.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="admin-save-assurance-pricing-btn"
              type="submit"
              disabled={savingPricing}
              className="px-6 py-3 rounded-2xl bg-[#0E3A2B] hover:bg-[#09281d] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer inline-flex items-center gap-2"
            >
              {savingPricing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Live Assurance Pricing</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================= APPLICATIONS MANAGEMENT VIEW ================= */
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All (${filterCounts.all})` },
                { id: 'new', label: `New applications (${filterCounts.new})` },
                { id: 'in_progress', label: `In progress (${filterCounts.in_progress})` },
                { id: 'completed', label: `Completed (${filterCounts.completed})` },
                { id: 'payment_pending', label: `Payment pending (${filterCounts.payment_pending})` },
                {
                  id: 'custom_quote',
                  label: `Custom quotation required (${filterCounts.custom_quote})`,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as AdminAssuranceFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-[#0E3A2B] text-white dark:bg-amber-400 dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-[#051811] text-slate-700 dark:text-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Reference ID, customer name, mobile, email, location, or assignee..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-800 text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading UKG Assurance applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No UKG Assurance applications match the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const isExpanded = expandedAppId === app.id;
                const draft = draftEdits[app.id] || {
                  status: app.status,
                  paymentStatus: app.paymentStatus,
                  assignedTeamMember: app.assignedTeamMember || '',
                  customQuotationAmount:
                    app.customQuotationAmount !== null && app.customQuotationAmount !== undefined
                      ? String(app.customQuotationAmount)
                      : '',
                  customQuotationNotes: app.customQuotationNotes || '',
                  customerUpdateMessage: '',
                  internalNote: '',
                };
                const isBusy = busyAppId === app.id;

                return (
                  <div
                    key={app.id}
                    className="rounded-3xl bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 shadow-xs overflow-hidden"
                  >
                    {/* Summary Row */}
                    <div
                      onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                      className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0E3A2B] text-[#C2A691]">
                            {app.id}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200">
                            {app.status}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200">
                            {app.paymentStatus}
                          </span>
                          {(app.snapshotIsCustomQuote || app.snapshotCalculatedTotal === null) && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200">
                              Custom Quote Needed
                            </span>
                          )}
                        </div>

                        <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {app.customerName} • {app.propertyType} in {app.propertyLocation}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Mobile: {app.mobileNumber}</span>
                          <span>•</span>
                          <span>Bracket: {app.propertyValueBracketLabel}</span>
                          <span>•</span>
                          <span>Docs: {app.customerDocuments?.length || 0}</span>
                          {app.assignedTeamMember && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                                Assigned: {app.assignedTeamMember}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end lg:self-center">
                        <div className="text-right">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Quoted / Snapshot
                          </div>
                          <div className="text-sm font-black text-[#0E3A2B] dark:text-amber-300">
                            {app.customQuotationAmount !== null
                              ? formatAssuranceRupees(app.customQuotationAmount)
                              : app.snapshotCalculatedTotal !== null
                                ? formatAssuranceRupees(app.snapshotCalculatedTotal)
                                : 'Custom Quote'}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Detail & Admin Controls */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-emerald-800/80 bg-slate-50/60 dark:bg-[#051811]/70 space-y-6">
                        {/* Customer Contact & Property Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 space-y-2">
                            <div className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                              Customer Contact Details
                            </div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {app.customerName}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-emerald-200">
                              <a
                                href={`tel:+91${app.mobileNumber}`}
                                className="inline-flex items-center gap-1 font-bold hover:underline"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>+91 {app.mobileNumber}</span>
                              </a>
                              {app.userEmail && (
                                <a
                                  href={`mailto:${app.userEmail}`}
                                  className="inline-flex items-center gap-1 hover:underline"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{app.userEmail}</span>
                                </a>
                              )}
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60 space-y-1">
                              <div className="font-semibold text-slate-500">Selected Package & Snapshot:</div>
                              <div>
                                Standard Fee Snapshot:{' '}
                                <strong>
                                  {app.snapshotIsCustomQuote
                                    ? 'Custom Quotation Bracket'
                                    : formatAssuranceRupees(app.snapshotStandardFee)}
                                </strong>
                              </div>
                              <div>
                                Purchase Assistance:{' '}
                                <strong>
                                  {app.addonPurchaseAssistance
                                    ? `Selected (${
                                        app.snapshotPurchaseAssistanceFee !== null
                                          ? formatAssuranceRupees(app.snapshotPurchaseAssistanceFee)
                                          : 'Quote Needed'
                                      })`
                                    : 'No'}
                                </strong>
                              </div>
                              <div>
                                Dedicated UKG Coordinator:{' '}
                                <strong>
                                  {app.addonDedicatedCoordinator
                                    ? `Selected (${
                                        app.snapshotDedicatedCoordinatorFee !== null
                                          ? formatAssuranceRupees(app.snapshotDedicatedCoordinatorFee)
                                          : 'Quote Needed'
                                      })`
                                    : 'No'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 space-y-2">
                            <div className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-[11px]">
                              Property & Request Details
                            </div>
                            <div className="flex items-start gap-1.5 font-bold text-slate-900 dark:text-white">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>
                                {app.propertyType} — {app.propertyLocation} ({app.propertyValueBracketLabel})
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">Listing Link / Property ID: </span>
                              <span className="font-semibold break-all">{app.propertyLinkOrId}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Requirements: </span>
                              <p className="text-slate-700 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">
                                {app.additionalRequirements}
                              </p>
                            </div>
                            {app.additionalMessage && (
                              <div>
                                <span className="text-slate-500">Additional Message: </span>
                                <p className="text-slate-700 dark:text-slate-200 mt-0.5 whitespace-pre-wrap">
                                  {app.additionalMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status, Assignment, Payment & Custom Quotation Controls */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <div>
                              <label className="font-bold block mb-1">Verification Status</label>
                              <select
                                aria-label={`Status for ${app.id}`}
                                value={draft.status}
                                onChange={(e) =>
                                  updateAppDraft(app.id, {
                                    status: e.target.value as AssuranceApplicationStatus,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-300 dark:border-emerald-800 font-bold"
                              >
                                {ASSURANCE_STATUS_STEPS.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-bold block mb-1">Payment Status</label>
                              <select
                                aria-label={`Payment status for ${app.id}`}
                                value={draft.paymentStatus}
                                onChange={(e) =>
                                  updateAppDraft(app.id, {
                                    paymentStatus: e.target.value as AssurancePaymentStatus,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-300 dark:border-emerald-800 font-bold"
                              >
                                {PAYMENT_STATUS_OPTIONS.map((pst) => (
                                  <option key={pst} value={pst}>
                                    {pst}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-bold block mb-1 flex items-center gap-1">
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Assign Team Member</span>
                              </label>
                              <input
                                type="text"
                                value={draft.assignedTeamMember}
                                onChange={(e) =>
                                  updateAppDraft(app.id, { assignedTeamMember: e.target.value })
                                }
                                placeholder="e.g., Rohit Rawat (Dehradun Desk)"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-300 dark:border-emerald-800"
                              />
                            </div>

                            <div>
                              <label className="font-bold block mb-1 flex items-center gap-1">
                                <IndianRupee className="w-3.5 h-3.5" />
                                <span>Custom Quotation (₹ INR)</span>
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={draft.customQuotationAmount}
                                onChange={(e) =>
                                  updateAppDraft(app.id, { customQuotationAmount: e.target.value })
                                }
                                placeholder="Enter custom/confirmed ₹ total"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-300 dark:border-emerald-800 font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="font-bold block mb-1">Quotation Notes (Visible to Customer)</label>
                              <input
                                type="text"
                                value={draft.customQuotationNotes}
                                onChange={(e) =>
                                  updateAppDraft(app.id, { customQuotationNotes: e.target.value })
                                }
                                placeholder="e.g., Includes standard package + Purchase Assistance"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-300 dark:border-emerald-800"
                              />
                            </div>

                            <div>
                              <label className="font-bold block mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Post Update to Customer Dashboard</span>
                              </label>
                              <input
                                type="text"
                                value={draft.customerUpdateMessage}
                                onChange={(e) =>
                                  updateAppDraft(app.id, { customerUpdateMessage: e.target.value })
                                }
                                placeholder="Message shown in customer's Updates feed..."
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-300 dark:border-emerald-800"
                              />
                            </div>

                            <div>
                              <label className="font-bold block mb-1 flex items-center gap-1 text-amber-800 dark:text-amber-300">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Add Internal Admin Note (Private)</span>
                              </label>
                              <input
                                type="text"
                                value={draft.internalNote}
                                onChange={(e) =>
                                  updateAppDraft(app.id, { internalNote: e.target.value })
                                }
                                placeholder="Admin-only internal note (never shown to customer)..."
                                className="w-full px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-[#051811] border border-amber-300 dark:border-amber-800"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleSaveApplicationChanges(app)}
                              className="px-5 py-2.5 rounded-xl bg-[#0E3A2B] hover:bg-[#09281d] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-extrabold text-xs shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              <span>Save Application Updates</span>
                            </button>
                          </div>
                        </div>

                        {/* Documents, Final PDF Report & Internal Notes / History */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                          {/* 1. Customer Uploaded Documents */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 space-y-2.5">
                            <div className="font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Customer Documents ({app.customerDocuments?.length || 0})</span>
                            </div>
                            {Array.isArray(app.customerDocuments) && app.customerDocuments.length > 0 ? (
                              <div className="space-y-2">
                                {app.customerDocuments.map((doc) => (
                                  <div
                                    key={doc.fileId}
                                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-200 dark:border-emerald-900"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-bold truncate">{doc.name}</div>
                                      <div className="text-[10px] text-slate-500">
                                        {formatFileSize(doc.sizeBytes)}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={downloadingFileId === doc.fileId}
                                      onClick={() => handleDownloadProtected(doc.fileId, doc.name)}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>Download</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-slate-500">No documents uploaded by customer.</p>
                            )}
                          </div>

                          {/* 2. Final Assurance PDF Report Upload / Generator */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 space-y-3">
                            <div className="font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Final UKG Assurance PDF Report</span>
                            </div>

                            {app.finalReport ? (
                              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2">
                                <div className="font-bold text-emerald-900 dark:text-emerald-200 break-all">
                                  {app.finalReport.name} ({formatFileSize(app.finalReport.sizeBytes)})
                                </div>
                                <button
                                  type="button"
                                  disabled={downloadingFileId === app.finalReport.fileId}
                                  onClick={() =>
                                    handleDownloadProtected(app.finalReport!.fileId, app.finalReport!.name)
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-[#0E3A2B] text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Uploaded PDF</span>
                                </button>
                              </div>
                            ) : (
                              <p className="text-slate-500">No final PDF report attached yet.</p>
                            )}

                            <div className="flex flex-wrap gap-2 pt-1">
                              <label className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload PDF Report</span>
                                <input
                                  type="file"
                                  accept="application/pdf,.pdf"
                                  onChange={(e) => handleUploadFinalReport(app, e)}
                                  disabled={isBusy}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => openReportGeneratorModal(app)}
                                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#051811] hover:bg-slate-200 text-slate-800 dark:text-emerald-200 border border-slate-300 dark:border-emerald-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Generate Official PDF</span>
                              </button>
                            </div>
                          </div>

                          {/* 3. Internal Notes & Application History */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-[#082218] border border-slate-200 dark:border-emerald-800 space-y-3">
                            {Array.isArray(app.internalNotes) && app.internalNotes.length > 0 && (
                              <div className="space-y-1.5">
                                <div className="font-black text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Internal Notes ({app.internalNotes.length})</span>
                                </div>
                                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                                  {app.internalNotes.map((n) => (
                                    <div
                                      key={n.id}
                                      className="p-2 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70"
                                    >
                                      <div className="text-[10px] font-bold text-amber-900 dark:text-amber-300">
                                        {n.adminName} • {new Date(n.createdAt).toLocaleDateString('en-IN')}
                                      </div>
                                      <div className="text-slate-700 dark:text-slate-200">{n.note}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <div className="font-black text-slate-800 dark:text-white flex items-center gap-1">
                                <History className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Application History ({app.history?.length || 0})</span>
                              </div>
                              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {(app.history || [])
                                  .slice()
                                  .reverse()
                                  .map((h) => (
                                    <div
                                      key={h.id}
                                      className="p-2 rounded-lg bg-slate-50 dark:bg-[#051811] border border-slate-200/70 dark:border-emerald-900/60"
                                    >
                                      <div className="text-[10px] font-bold text-slate-500">
                                        {h.actorName} ({h.actorRole}) •{' '}
                                        {new Date(h.createdAt).toLocaleString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </div>
                                      <div className="text-slate-700 dark:text-slate-200">{h.details}</div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Official PDF Report Generator Modal */}
      {reportGeneratorApp && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReportGeneratorApp(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-[#082218] rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#0E3A2B] text-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#C2A691]">
                Generate Official UKG Assurance PDF Report
              </div>
              <h3 className="text-sm sm:text-base font-black mt-0.5">
                {reportGeneratorApp.id} — {reportGeneratorApp.customerName}
              </h3>
            </div>

            <form
              onSubmit={handleGenerateOfficialPdfReport}
              className="p-5 space-y-3.5 overflow-y-auto text-xs"
            >
              <div>
                <label className="font-bold block mb-1">1. Documents Reviewed *</label>
                <textarea
                  rows={2}
                  required
                  value={genDocsReviewed}
                  onChange={(e) => setGenDocsReviewed(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">2. Verification Findings *</label>
                <textarea
                  rows={3}
                  required
                  value={genFindings}
                  onChange={(e) => setGenFindings(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">
                  3. Physical Site Inspection & Photographs Summary
                </label>
                <textarea
                  rows={2}
                  value={genInspectionSummary}
                  onChange={(e) => setGenInspectionSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">4. Identified Concerns & Observations</label>
                <textarea
                  rows={2}
                  value={genConcerns}
                  onChange={(e) => setGenConcerns(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-slate-50 dark:bg-[#051811]"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Property details, performed services, and all 7 mandatory UKG Assurance legal disclaimers are included automatically in the generated PDF.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportGeneratorApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingPdf}
                  className="px-5 py-2 rounded-xl bg-[#0E3A2B] text-white font-extrabold cursor-pointer inline-flex items-center gap-1.5"
                >
                  {generatingPdf && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate & Attach PDF Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
