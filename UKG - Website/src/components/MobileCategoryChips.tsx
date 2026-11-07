import React from 'react';
import { FilterState } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Trees, 
  Home, 
  Key, 
  Mountain, 
  ShieldCheck, 
  Layers,
  Sparkles
} from 'lucide-react';

interface MobileCategoryChipsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onScrollToProperties?: () => void;
}

export const MobileCategoryChips: React.FC<MobileCategoryChipsProps> = ({
  filters,
  onFilterChange,
  onScrollToProperties,
}) => {
  const { isHindi } = useLanguage();

  const chips = [
    {
      id: 'all',
      label: isHindi ? 'सभी संपत्तियां' : 'All Properties',
      icon: <Layers className="w-3.5 h-3.5" />,
      isActive: filters.category === 'All Types' && !filters.reraApprovedOnly,
      onClick: () => {
        onFilterChange({
          ...filters,
          category: 'All Types',
          reraApprovedOnly: false,
        });
        if (onScrollToProperties) onScrollToProperties();
      },
    },
    {
      id: 'plot',
      label: isHindi ? '🏞️ प्लॉट व भूमि' : '🏞️ Plots & Land',
      icon: <Trees className="w-3.5 h-3.5" />,
      isActive: filters.category === 'Plot' || filters.category === 'Land',
      onClick: () => {
        onFilterChange({
          ...filters,
          category: 'Plot',
        });
        if (onScrollToProperties) onScrollToProperties();
      },
    },
    {
      id: 'flat',
      label: isHindi ? '🏢 फ्लैट व अपार्टमेंट' : '🏢 Flats',
      icon: <Building2 className="w-3.5 h-3.5" />,
      isActive: filters.category === 'Flat' || filters.category === 'Apartment',
      onClick: () => {
        onFilterChange({
          ...filters,
          category: 'Flat',
        });
        if (onScrollToProperties) onScrollToProperties();
      },
    },
    {
      id: 'cottage',
      label: isHindi ? '🏡 कॉटेज व विला' : '🏡 Cottages & Villas',
      icon: <Home className="w-3.5 h-3.5" />,
      isActive: filters.category === 'Cottage' || filters.category === 'Villa',
      onClick: () => {
        onFilterChange({
          ...filters,
          category: 'Cottage',
        });
        if (onScrollToProperties) onScrollToProperties();
      },
    },
    {
      id: 'rent',
      label: isHindi ? '🔑 किराये पर (Rent)' : '🔑 Rent / Lease',
      icon: <Key className="w-3.5 h-3.5" />,
      isActive: filters.category === 'Rent/Lease',
      onClick: () => {
        onFilterChange({
          ...filters,
          category: 'Rent/Lease',
        });
        if (onScrollToProperties) onScrollToProperties();
      },
    },
    {
      id: 'rera',
      label: isHindi ? '🛡️ रेरा / क्लीयर टाइटल' : '🛡️ Verified RERA',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      isActive: Boolean(filters.reraApprovedOnly),
      onClick: () => {
        onFilterChange({
          ...filters,
          reraApprovedOnly: !filters.reraApprovedOnly,
        });
        if (onScrollToProperties) onScrollToProperties();
      },
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 select-none">
      <div className="flex items-center gap-2 min-w-max px-2">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={chip.onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs whitespace-nowrap ${
              chip.isActive
                ? 'bg-emerald-600 text-white shadow-emerald-700/25 shadow-md scale-102 ring-2 ring-emerald-400/50'
                : 'bg-white dark:bg-[#0a271d] text-slate-700 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800/80 hover:border-emerald-400'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
