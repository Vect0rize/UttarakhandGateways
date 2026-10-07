import React, { useMemo, useState } from 'react';
import { X, Search, Flag, ExternalLink } from 'lucide-react';
import { Property } from '../types';

interface AdminReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProperties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const AdminReportsModal: React.FC<AdminReportsModalProps> = ({
  isOpen,
  onClose,
  allProperties,
  onSelectProperty,
}) => {
  const [search, setSearch] = useState('');

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return allProperties;

    return allProperties.filter((property) => {
      const values = [
        property.title,
        property.location,
        property.city,
        property.region,
        property.id,
      ];

      return values.some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(query)
      );
    });
  }, [allProperties, search]);

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

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Close reports"
          >
            <X size={20} />
          </button>
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
          {filteredProperties.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <Flag size={32} className="mb-3 text-gray-400" />

              <h3 className="font-medium text-gray-900 dark:text-white">
                No properties found
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {search
                  ? 'Try a different search.'
                  : 'There are currently no properties to review.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                      {property.title || 'Untitled property'}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {property.location ||
                        [property.city, property.region]
                          .filter(Boolean)
                          .join(', ') ||
                        'Location unavailable'}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      ID: {property.id}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectProperty(property)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    <ExternalLink size={16} />
                    View Listing
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {filteredProperties.length} propert
          {filteredProperties.length === 1 ? 'y' : 'ies'} shown
        </div>
      </div>
    </div>
  );
};
