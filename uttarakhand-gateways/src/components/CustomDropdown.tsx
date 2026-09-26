import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
  count?: number;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  isOpenControlled?: boolean;
  onToggleControlled?: (nextOpen: boolean) => void;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  placeholder = 'Select option',
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  isOpenControlled,
  onToggleControlled,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = typeof isOpenControlled === 'boolean';
  const isOpen = isControlled ? isOpenControlled : internalIsOpen;

  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setIsOpen = (nextOpen: boolean) => {
    if (isControlled && onToggleControlled) {
      onToggleControlled(nextOpen);
    } else {
      setInternalIsOpen(nextOpen);
    }
  };

  // Reset search term when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((opt) => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  const handleSelectOption = (optValue: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative select-none ${className}`}>
      {/* 1. RELIABLE BACKDROP: Closes dropdown instantly when clicking anywhere outside on desktop or mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[0.5px] cursor-default"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* 2. TRIGGER BUTTON - Above the backdrop (z-50 when open) */}
      <div className={`relative ${isOpen ? 'z-50' : 'z-20'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`w-full text-left bg-white dark:bg-slate-900 hover:bg-sky-50/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl px-4 py-2.5 border transition-all duration-200 shadow-xs flex items-center justify-between gap-2.5 group cursor-pointer focus:outline-none ${
            isOpen
              ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/70 dark:bg-slate-800'
              : 'border-sky-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && (
              <div className="text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                {label}
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Clear button if specific item is selected */}
            {selectedOption && selectedOption.value !== 'All Locations' && selectedOption.value !== 'All Types' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOption(label.toLowerCase().includes('location') ? 'All Locations' : 'All Types', e);
                }}
                className="p-1 rounded-full hover:bg-sky-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                title="Reset selection"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-sky-600 dark:text-sky-400' : ''
              }`}
            />
          </div>
        </button>

        {/* 3. FLOATING DROPDOWN MENU - Above the backdrop (z-50) */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[280px] mt-1.5 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-sky-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in duration-100 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Dismiss row */}
            <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-sky-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                {label} ({options.length})
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 font-semibold cursor-pointer px-1.5 py-0.5 rounded hover:bg-sky-50 dark:hover:bg-slate-800"
              >
                Close ✕
              </button>
            </div>

            {/* Optional Search Input - Never auto-focused on open so keyboard doesn't open */}
            {searchable && (
              <div className="px-3 pt-2 pb-2 border-b border-sky-100 dark:border-slate-800">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 bg-sky-50/60 dark:bg-slate-800 rounded-xl border border-sky-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-slate-700">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => handleSelectOption(option.value, e)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer border-b border-sky-50/50 dark:border-slate-800/50 last:border-b-0 ${
                        isSelected
                          ? 'bg-sky-100/70 dark:bg-sky-950/80 text-sky-900 dark:text-sky-200 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-950 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate">{option.label}</span>
                        {option.subLabel && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {option.subLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {option.count !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                            isSelected
                              ? 'bg-sky-600 text-white'
                              : 'bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300'
                          }`}>
                            {option.count}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-4 px-4 text-xs text-slate-400 dark:text-slate-500 text-center">
                  No matching locations or types found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
