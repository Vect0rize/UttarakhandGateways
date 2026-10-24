import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Property } from '../types';

interface ReportListingModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Incorrect information',
  'Fake or misleading listing',
  'Duplicate listing',
  'Property is no longer available',
  'Inappropriate content',
  'Other',
];

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  isOpen,
  property,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !property) return null;

  const handleClose = () => {
    setReason('');
    setDetails('');
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) return;

    /*
     * For now the report is handled on the client side.
     *
     * You can later connect this to your backend/database by
     * replacing this section with a POST request such as:
     *
     * fetch('/api/reports', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({
     *     propertyId: property.id,
     *     reason,
     *     details
     *   })
     * })
     */

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Report Listing
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Report an issue with this property listing.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Close report"
          >
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          /* Success */
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 size={30} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              Report submitted
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
              Thanks for letting us know. The listing will be reviewed by the
              administrator.
            </p>

            <button
              onClick={handleClose}
              className="mt-6 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-5">
              {/* Property */}
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Listing
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {property.title || 'Untitled property'}
                </p>

                {property.location && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {property.location}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="report-reason"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Why are you reporting this listing?
                </label>

                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select a reason</option>

                  {REPORT_REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details */}
              <div>
                <label
                  htmlFor="report-details"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Additional details
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell us more about the issue..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {details.length}/1000
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!reason}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
