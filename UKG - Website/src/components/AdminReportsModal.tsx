import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Flag, ExternalLink, Trash2, CheckCircle2 } from 'lucide-react';
import { Property } from '../types';

interface ListingReport {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  reason: string;
  details?: string;
  reporterContact?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

interface AdminReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProperties: Property[];
  onSelectProperty: (property: Property) => void;
  onDeleteAllProperties?: () => void;
}

export const AdminReportsModal: React.FC<AdminReportsModalProps> = ({
  isOpen,
  onClose,
  allProperties,
  onSelectProperty,
  onDeleteAllProperties,
}) => {
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [loading, setLoading] = useState(false);

  const getHeaders = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) h['Authorization'] = `Bearer ${token}`;
    } catch {}
    return h;
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/reports', {
      credentials: 'include',
      headers: getHeaders(),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.reports)) {
          setReports(data.reports);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const updateReportStatus = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
      }
    } catch {}
  };

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reports;
    return reports.filter((r) =>
      [r.propertyTitle, r.propertyId, r.reason, r.details, r.reporterContact, r.status]
        .some((v) => typeof v === 'string' && v.toLowerCase().includes(query))
    );
  }, [reports, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Flag size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reports
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review property listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteAllProperties && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteAllProperties();
                }}
                disabled={allProperties.length === 0}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition ${
                  allProperties.length > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
                title="Admin: Delete all properties at once"
              >
                <Trash2 size={14} />
                <span>Delete All Properties ({allProperties.length})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Close reports"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-gray-500">
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <Flag size={32} className="mb-3 text-gray-400" />

              <h3 className="font-medium text-gray-900 dark:text-white">
                No reported listings found
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {search
                  ? 'Try a different search.'
                  : 'There are currently no submitted listing reports.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const matchedProperty = allProperties.find((p) => p.id === report.propertyId);
                return (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                          {matchedProperty?.title || report.propertyTitle || 'Reported Listing'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : report.status === 'dismissed'
                            ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {report.status}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        Reason: {report.reason}
                      </p>

                      {report.details && (
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {report.details}
                        </p>
                      )}

                      <p className="text-xs text-gray-400">
                        Listing ID: {report.propertyId} · Reporter: {report.reporterContact || 'Anonymous'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {report.status === 'open' && (
                        <>
                          <button
                            type="button"
                            onClick={() => void updateReportStatus(report.id, 'resolved')}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 cursor-pointer"
                          >
                            <CheckCircle2 size={14} />
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => void updateReportStatus(report.id, 'dismissed')}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {matchedProperty && (
                        <button
                          type="button"
                          onClick={() => onSelectProperty(matchedProperty)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 cursor-pointer"
                        >
                          <ExternalLink size={16} />
                          View Listing
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {filteredReports.length} report
          {filteredReports.length === 1 ? '' : 's'} shown
        </div>
      </div>
    </div>
  );
};
