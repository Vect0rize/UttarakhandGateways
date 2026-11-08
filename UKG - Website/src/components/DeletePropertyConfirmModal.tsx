import React from 'react';
import { AlertTriangle, Trash2, X, Building2, MapPin } from 'lucide-react';
import { Property } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DeletePropertyConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onConfirmDelete: (propertyId: string) => Promise<void> | void;
  isDeleting?: boolean;
}

export const DeletePropertyConfirmModal: React.FC<DeletePropertyConfirmModalProps> = ({
  isOpen,
  onClose,
  property,
  onConfirmDelete,
  isDeleting = false,
}) => {
  const { isHindi } = useLanguage();

  if (!isOpen || !property) return null;

  const handleDelete = async () => {
    await onConfirmDelete(property.id);
  };

  const coverImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#071f16] rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                {isHindi ? 'प्रॉपर्टी लिस्टिंग हटाएं?' : 'Delete Property Listing?'}
              </h3>
              <p className="text-xs text-rose-100">
                {isHindi ? 'यह कार्रवाई वापस नहीं ली जा सकती' : 'This action cannot be undone'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Property Identity Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-900/60 flex items-center gap-3">
            <img 
              src={coverImage} 
              alt={property.title} 
              className="w-16 h-16 rounded-xl object-cover shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  (property.type === 'Rent/Lease' || property.purpose === 'rent' || property.isAvailableForRent)
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {(property.type === 'Rent/Lease' || property.purpose === 'rent' || property.isAvailableForRent) ? 'Rent' : 'Sell'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {property.type} • {property.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {property.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{property.city}</span>
                </span>
                <span>•</span>
                <span className="font-bold text-slate-700 dark:text-emerald-300">
                  {property.priceDisplay || `₹${property.price}`}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 text-xs text-rose-900 dark:text-rose-200 space-y-1">
            <p className="font-bold">
              {isHindi 
                ? 'चेतावनी: यह लिस्टिंग तुरंत हटा दी जाएगी!' 
                : 'Warning: This listing will be permanently removed!'}
            </p>
            <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
              {isHindi
                ? 'यह प्रॉपर्टी सार्वजनिक खोजों, एक्सप्लोर कैटलॉग और खरीदार इनबॉक्स से तुरंत गायब हो जाएगी। डेटाबेस से यह पूरी तरह मिटा दी जाएगी।'
                : 'This listing will immediately disappear from public search results, explore pages, and buyer inboxes. All saved records will be deleted.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isHindi ? 'हटाया जा रहा है...' : 'Deleting...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{isHindi ? 'हां, लिस्टिंग हटाएं' : 'Delete Listing'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
