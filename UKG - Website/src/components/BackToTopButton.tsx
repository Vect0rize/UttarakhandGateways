import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BackToTopButton: React.FC = () => {
  const { isHindi } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      id="back-to-top-btn"
      type="button"
      onClick={scrollToTop}
      aria-label={isHindi ? 'शीर्ष पर वापस जाएं' : 'Back to top'}
      title={isHindi ? 'ऊपर जाएं (Back to Top)' : 'Back to Top'}
      className={`fixed bottom-16 right-4 sm:bottom-20 sm:right-5 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0E3A2B] dark:bg-[#134232] hover:bg-[#164A37] text-[#F4F3EF] border border-[#C2A691]/50 shadow-lg shadow-[#032D1F]/35 flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C2A691] ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto hover:scale-105 active:scale-95'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#F4F3EF]" />
    </button>
  );
};
