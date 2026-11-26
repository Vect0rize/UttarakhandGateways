import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ArrowRight,
  Lock,
  AlertCircle,
  Loader2,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import type { AssuranceApplication } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  assuranceFetch,
  ASSURANCE_STATUS_STEPS,
  downloadProtectedAssuranceFile,
  formatAssuranceRupees,
  formatFileSize,
} from '../utils/assuranceApi';

interface CustomerAssuranceSectionProps {
  onOpenAssurancePage: () => void;
}

export const CustomerAssuranceSection: React.FC<CustomerAssuranceSectionProps> = ({
  onOpenAssurancePage,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const [applications, setApplications] = useState<AssuranceApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [uploadingAppId, setUploadingAppId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadMyApplications = useCallback(async (silent = false) => {
    if (!currentUser) {
      setApplications([]);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await assuranceFetch('/api/assurance/my-applications', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to load your UKG Assurance applications.');
      }
      setApplications(Array.isArray(data.applications) ? data.applications : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load your UKG Assurance applications.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadMyApplications(false);
  }, [loadMyApplications]);

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    setDownloadingId(fileId);
    setError(null);
    try {
      await downloadProtectedAssuranceFile(fileId, fileName);
    } catch (err: any) {
      setError(err?.message || 'Failed to download file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAdditionalDocUpload = async (
    appId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingAppId(appId);
    setError(null);
    setActionMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await assuranceFetch(`/api/assurance/applications/${encodeURIComponent(appId)}/documents`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to upload document.');
      }
      setActionMsg(`Uploaded "${file.name}" securely.`);
      await loadMyApplications(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload document.');
    } finally {
      setUploadingAppId(null);
    }
  };

  const getPaymentBadgeClasses = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'Partially Paid':
        return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800';
      case 'Refunded':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
    }
  };

  return (
    <section
      id="customer-ukg-assurance-section"
      className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#071f16] border border-emerald-200/85 dark:border-emerald-800/80 shadow-sm space-y-6"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-emerald-900/70 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#0E3A2B] dark:text-white">
                UKG Assurance Applications
              </h2>
              {currentUser && applications.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold">
                  {applications.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-emerald-200/75 mt-0.5">
              Track property document review progress, team updates, payment status, and download your final Assurance PDF report.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentUser && (
            <button
              type="button"
              onClick={() => void loadMyApplications(false)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition cursor-pointer"
              title="Refresh Assurance status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAssurancePage}
            className="px-4 py-2.5 rounded-xl bg-[#0E3A2B] hover:bg-[#09281d] dark:bg-[#C2A691] dark:hover:bg-[#d2b8a5] text-white dark:text-[#032D1F] font-extrabold text-xs shadow-sm transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Get UKG Assurance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!currentUser ? (
        <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#061A12] border border-emerald-200/70 dark:border-emerald-800/70 text-center space-y-3">
          <Lock className="w-6 h-6 text-emerald-700 dark:text-[#C2A691] mx-auto" />
          <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
            Sign in to view your UKG Assurance applications, updates, and protected PDF reports.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login', 'Sign in to access your UKG Assurance dashboard.')}
            className="px-5 py-2.5 rounded-xl bg-[#0E3A2B] text-white text-xs font-bold cursor-pointer"
          >
            Sign In
          </button>
        </div>
      ) : loading && applications.length === 0 ? (
        <div className="py-10 text-center text-xs font-semibold text-slate-500 dark:text-emerald-200/70 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading your UKG Assurance applications...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF9F6] dark:bg-[#061A12] border border-dashed border-emerald-300 dark:border-emerald-800/80 text-center space-y-3">
          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            No UKG Assurance Applications Yet
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Planning to purchase a plot, house, flat, or land in Uttarakhand? Let UKG help review available ownership documents, registry paperwork, and inspect the property on site.
          </p>
          <button
            type="button"
            onClick={onOpenAssurancePage}
            className="px-5 py-2.5 rounded-xl bg-[#0E3A2B] hover:bg-[#09281d] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Explore UKG Assurance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => {
            const currentStepIdx = Math.max(
              0,
              ASSURANCE_STATUS_STEPS.indexOf(app.status)
            );
            const effectiveFee =
              app.customQuotationAmount !== null && app.customQuotationAmount !== undefined
                ? app.customQuotationAmount
                : app.agreedFinalAmount ?? app.snapshotCalculatedTotal;

            return (
              <div
                key={app.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#061A12] border border-emerald-200/90 dark:border-emerald-800/80 space-y-5"
              >
                {/* Application Top Metadata Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-emerald-900/70 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0E3A2B] text-[#C2A691]">
                        {app.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                        {app.status}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPaymentBadgeClasses(
                          app.paymentStatus
                        )}`}
                      >
                        Payment: {app.paymentStatus}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span>
                        {app.propertyType} — {app.propertyLocation}
                      </span>
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Value Range: <strong>{app.propertyValueBracketLabel}</strong></span>
                      <span>•</span>
                      <span>Submitted: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {app.assignedTeamMember && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-semibold">
                            <UserCheck className="w-3.5 h-3.5" />
                            Coordinator: {app.assignedTeamMember}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Agreed / Quoted Fee Display */}
                  <div className="sm:text-right bg-white dark:bg-[#082419] px-4 py-2.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/70 shrink-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/75">
                      {app.customQuotationAmount !== null ? 'Confirmed Quotation' : 'Agreed / Snapshot Fee'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-[#0E3A2B] dark:text-[#C2A691]">
                      {effectiveFee !== null && effectiveFee !== undefined
                        ? formatAssuranceRupees(effectiveFee)
                        : 'Custom Quotation Pending'}
                    </div>
                    {app.customQuotationNotes && (
                      <div className="text-[11px] text-slate-600 dark:text-emerald-200/80 max-w-xs">
                        {app.customQuotationNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* 6-Stage Application Status Stepper */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80">
                    Verification Progress
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {ASSURANCE_STATUS_STEPS.map((stepName, idx) => {
                      const isDone = idx < currentStepIdx || app.status === 'Completed';
                      const isCurrent = idx === currentStepIdx && app.status !== 'Completed';
                      return (
                        <div
                          key={stepName}
                          className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${
                            isCurrent
                              ? 'bg-[#0E3A2B] text-white border-[#0E3A2B] dark:border-[#C2A691]'
                              : isDone
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-white/70 dark:bg-[#071f16]/70 text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-emerald-900/50'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Clock className="w-3.5 h-3.5 text-[#C2A691] shrink-0" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-current text-[9px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                          )}
                          <span className="leading-tight">{stepName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Assurance PDF Report Banner (When Ready / Uploaded) */}
                {app.finalReport && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0E3A2B] to-[#0A2F22] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 text-[#C2A691] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#C2A691] uppercase tracking-wider">
                          Final UKG Assurance PDF Report Ready
                        </div>
                        <div className="text-sm font-bold text-white">
                          {app.finalReport.name} ({formatFileSize(app.finalReport.sizeBytes)})
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={downloadingId === app.finalReport.fileId}
                      onClick={() => handleDownloadFile(app.finalReport!.fileId, app.finalReport!.name)}
                      className="px-4 py-2.5 rounded-xl bg-[#C2A691] hover:bg-[#d3b9a6] text-[#032D1F] font-extrabold text-xs shadow-sm transition cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {downloadingId === app.finalReport.fileId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Download Assurance PDF Report</span>
                    </button>
                  </div>
                )}

                {/* Selected Services, Uploaded Documents & UKG Team Updates Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Selected Services & Submitted Documents */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#072218] border border-slate-200/80 dark:border-emerald-900/70 space-y-3">
                    <div className="text-xs font-extrabold text-slate-800 dark:text-white">
                      Selected Services
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(app.standardServicesIncluded) && app.standardServicesIncluded.length > 0
                        ? app.standardServicesIncluded
                        : [
                            'Ownership Verification',
                            'Document Verification',
                            'Physical Property Inspection',
                            'UKG Assurance Report',
                          ]
                      ).map((svc) => (
                        <span
                          key={svc}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200"
                        >
                          ✓ {svc}
                        </span>
                      ))}
                      {app.addonPurchaseAssistance && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          + Add-On: Purchase Assistance
                        </span>
                      )}
                      {app.addonDedicatedCoordinator && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          + Add-On: Dedicated UKG Coordinator
                        </span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                          <span>Submitted Documents ({app.customerDocuments?.length || 0})</span>
                        </span>
                        <label className="text-[11px] font-bold text-emerald-700 dark:text-[#C2A691] hover:underline cursor-pointer inline-flex items-center gap-1">
                          {uploadingAppId === app.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          <span>+ Add Document</span>
                          <input
                            type="file"
                            accept=".pdf,image/jpeg,image/png,image/webp"
                            onChange={(e) => handleAdditionalDocUpload(app.id, e)}
                            disabled={uploadingAppId === app.id}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {Array.isArray(app.customerDocuments) && app.customerDocuments.length > 0 ? (
                        <div className="space-y-1.5">
                          {app.customerDocuments.map((doc) => (
                            <div
                              key={doc.fileId}
                              className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#051811] border border-slate-200/70 dark:border-emerald-900/60 text-xs"
                            >
                              <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                                {doc.name}
                              </span>
                              <button
                                type="button"
                                disabled={downloadingId === doc.fileId}
                                onClick={() => handleDownloadFile(doc.fileId, doc.name)}
                                className="text-emerald-700 dark:text-[#C2A691] font-bold hover:underline shrink-0 cursor-pointer inline-flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          No documents uploaded yet. You can upload ownership or registry PDFs/photos anytime.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Updates from the UKG Team */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#072218] border border-slate-200/80 dark:border-emerald-900/70 space-y-3">
                    <div className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>Updates from the UKG Team</span>
                    </div>

                    {Array.isArray(app.customerUpdates) && app.customerUpdates.length > 0 ? (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {app.customerUpdates.map((upd) => (
                          <div
                            key={upd.id}
                            className="p-3 rounded-xl bg-emerald-50/50 dark:bg-[#051811] border border-emerald-100 dark:border-emerald-900/60 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-emerald-300/75">
                              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                                {upd.authorName}
                              </span>
                              <span>{new Date(upd.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                              {upd.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Updates from our verification team will appear here as your application progresses.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
