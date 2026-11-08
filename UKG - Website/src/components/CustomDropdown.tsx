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
      {/* 1. RELIABLE BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90] bg-black/10 dark:bg-black/40 backdrop-blur-[0.5px] cursor-default"
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

      {/* 2. TRIGGER BUTTON: Soft Mint / Light Green shade in Light mode, Forest Emerald in Dark mode */}
      <div className={`relative ${isOpen ? 'z-[100]' : 'z-20'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`w-full text-left bg-[#f0f9f4] dark:bg-[#07241a] hover:bg-[#e4f5eb] dark:hover:bg-[#0b3527] text-slate-800 dark:text-emerald-100 rounded-2xl px-4 py-2.5 border transition-all duration-200 shadow-xs flex items-center justify-between gap-2.5 group cursor-pointer focus:outline-none ${
            isOpen
              ? 'border-emerald-500 ring-2 ring-emerald-500/25 bg-[#e4f5eb] dark:bg-[#0b3527]'
              : 'border-emerald-300/80 dark:border-emerald-700/60 hover:border-emerald-400 dark:hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {icon && (
              <div className="text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                {label}
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-100 truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Clear button if specific item is selected */}
            {selectedOption && selectedOption.value !== 'All Locations' && selectedOption.value !== 'All Types' && selectedOption.value !== 'all' && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOption(label.toLowerCase().includes('location') ? 'All Locations' : (label.toLowerCase().includes('budget') ? 'all' : 'All Types'), e);
                }}
                className="p-1 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-600 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer"
                title="Reset selection"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-emerald-700 dark:text-emerald-300' : ''
              }`}
            />
          </div>
        </button>

        {/* 3. FLOATING DROPDOWN MENU: Crisp Mint / Light Green in light mode, Forest Emerald in dark mode */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 right-0 sm:right-auto sm:min-w-[280px] mt-1.5 w-full bg-[#f6fbf8] dark:bg-[#07261c] rounded-2xl shadow-2xl border border-emerald-300/90 dark:border-emerald-700/80 py-1.5 z-[100] animate-in fade-in duration-100 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Dismiss row */}
            <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-100/50 dark:bg-[#093023]/60 rounded-t-xl">
              <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                {label} ({options.length})
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white font-semibold cursor-pointer px-1.5 py-0.5 rounded hover:bg-emerald-200/60 dark:hover:bg-emerald-800/60"
              >
                Close ✕
              </button>
            </div>

            {/* Optional Search Input */}
            {searchable && (
              <div className="px-3 pt-2 pb-2 border-b border-emerald-200/80 dark:border-emerald-800/80">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs text-emerald-950 dark:text-emerald-100 bg-white dark:bg-[#051c14] rounded-xl border border-emerald-300 dark:border-emerald-700 focus:outline-none focus:border-emerald-500 placeholder-emerald-600/50 dark:placeholder-emerald-400/50"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-emerald-300 dark:scrollbar-thumb-emerald-700">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => handleSelectOption(option.value, e)}
                      className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer border-b border-emerald-100/60 dark:border-emerald-900/40 last:border-b-0 ${
                        isSelected
                          ? 'bg-emerald-200/70 dark:bg-[#0f4432] text-emerald-950 dark:text-emerald-100 font-bold'
                          : 'text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/70 dark:hover:bg-[#0c3527] hover:text-emerald-950 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="truncate">{option.label}</span>
                        {option.subLabel && (
                          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 line-clamp-1">
                            {option.subLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {option.count !== undefined && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                            isSelected
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                          }`}>
                            {option.count}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-4 px-4 text-xs text-slate-400 dark:text-emerald-400/60 text-center">
                  No matching options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
