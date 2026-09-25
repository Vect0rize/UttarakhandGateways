import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((opt) => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  return (
    <div ref={dropdownRef} className={`relative select-none ${className}`}>
      {/* Trigger Button - Matches Background */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left bg-[#0c1825]/90 hover:bg-[#102030] text-slate-100 rounded-2xl px-4 py-2.5 border transition-all duration-200 shadow-sm flex items-center justify-between gap-2.5 group cursor-pointer focus:outline-none ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-[#102030]'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && (
            <div className="text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            <span className="block text-xs sm:text-sm font-semibold text-white truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu - Matches Dark Background */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full min-w-[220px] bg-[#0c1825] rounded-2xl shadow-2xl border border-slate-700/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          
          {/* Optional Search Input */}
          {searchable && (
            <div className="px-3 pt-1 pb-2 border-b border-slate-800">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-100 bg-slate-900 rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500 focus:bg-slate-950 placeholder-slate-400"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.subLabel && (
                        <span className="text-[10px] text-slate-400">
                          {option.subLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {option.count !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {option.count}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-3 px-4 text-xs text-slate-400 text-center">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
