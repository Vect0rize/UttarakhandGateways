import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DeleteAllPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeleteAll: () => Promise<void>;
  totalProperties: number;
}

export const DeleteAllPropertiesModal: React.FC<DeleteAllPropertiesModalProps> = ({
  isOpen,
  onClose,
  onConfirmDeleteAll,
  totalProperties,
}) => {
  const { isHindi } = useLanguage();
  const [confirmText, setConfirmText] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText('');
    setIsAcknowledged(false);
    onClose();
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDeleteAll();
      setConfirmText('');
      setIsAcknowledged(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete all properties:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE' || isAcknowledged;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#071c14] border-2 border-rose-500/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95 text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Red Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-rose-600 dark:text-rose-400 block">
                {isHindi ? 'प्लेटफॉर्म एडमिन कार्रवाई' : 'Platform Admin Action'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {isHindi ? 'सभी संपत्तियां हटाएं?' : 'Delete All Properties?'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{isHindi ? 'सावधानी: यह कार्रवाई वापस नहीं ली जा सकती!' : 'Warning: Irreversible Platform Action'}</span>
            </p>
            <p>
              {isHindi
                ? `आप लाइव मार्केटप्लेस से एक साथ सभी ${totalProperties} संपत्तियों को हमेशा के लिए हटाने जा रहे हैं। यह सभी आगंतुकों और उपकरणों के लिए ऑनलाइन कैटलॉग को खाली कर देगा।`
                : `You are about to permanently remove all ${totalProperties} property listing(s) currently online from the live database. All devices and visitors will immediately see an empty catalog.`}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isHindi 
                ? 'पुष्टि हेतु नीचे "DELETE" लिखें:' 
                : 'Type "DELETE" below to confirm:'}
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#061811] text-sm text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAcknowledged}
                onChange={(e) => setIsAcknowledged(e.target.checked)}
                disabled={isDeleting}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {isHindi 
                  ? 'हाँ, मैं सभी संपत्तियों को हटाने की पुष्टि करता हूँ' 
                  : 'I understand and confirm deleting all properties'}
              </span>
            </label>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting || !isConfirmed}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                isConfirmed && !isDeleting
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isHindi ? 'हटाया जा रहा है...' : 'Deleting All...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? `सभी ${totalProperties} हटाएं` : `Delete All (${totalProperties})`}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
