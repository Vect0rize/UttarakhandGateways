import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  isHindi: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tx: (enText: string, hiText: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.buy': 'Buy',
    'nav.sell': 'Sell Property',
    'nav.calculator': 'Land Calculator',
    'nav.inbox': 'Inbox',
    'nav.contact': 'Contact Us',
    'nav.call': 'Call',
    'nav.whatsapp': 'WhatsApp',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.theme': 'Theme',
    'nav.langToggle': 'हिन्दी',
    'nav.langName': 'English',
    'nav.allUnits': 'Any Unit',

    // Hero
    'hero.badge': 'Uttarakhand Property Discovery • NO PLATFORM FEE',
    'hero.tagline': 'Your Gateway To Mountains',
    'hero.assurance1': 'Residential, Commercial & Land Listings',
    'hero.assurance2': 'Direct Lister Phone & WhatsApp Contact',

    // Search
    'search.hub': 'Filter Properties',
    'search.reset': 'Reset',
    'search.locationLabel': 'Location',
    'search.locationPlaceholder': 'Select Your Location',
    'search.typeLabel': 'Property Type',
    'search.typePlaceholder': 'Villa/Plot/Flat/Shop/Land...',
    'search.inputPlaceholder': 'Search by location, locality, project, or property type (e.g. Mussoorie, 3BHK, Plot)...',
    'search.searchBtn': 'Search',
    'search.otherLocLabel': 'Enter your desired location / town in Uttarakhand:',
    'search.otherLocPlaceholder': 'e.g. Joshimath, Bageshwar, Pithoragarh, Champawat, Chamba...',
    'search.setLocBtn': 'Set Location',

    // Chat Request Confirmation
    'chat.confirmTitle': 'Send Chat Request to Owner',
    'chat.confirmSub': 'Start a verified direct conversation with the listing owner',
    'chat.ownerLabel': 'Listing Owner',
    'chat.propertyLabel': 'Property',
    'chat.msgLabel': 'Your introductory message:',
    'chat.msgPlaceholder': 'Namaste! I am interested in this property. Is it available for a site visit or discussion?',
    'chat.securityNote': 'Your chat request will be delivered to the owner\'s Inbox. No spam or commission brokers.',
    'chat.cancelBtn': 'Cancel',
    'chat.sendBtn': 'Send Chat Request',
    'chat.requestSuccess': 'Chat request sent to owner! Opening Inbox...',

    // Inbox
    'inbox.title': 'Messages & Chat',
    'inbox.phoneRequests': 'Phone Requests',
    'inbox.marketplace': 'Marketplace',
    'inbox.menu': 'Menu',
    'inbox.noChats': 'No active conversations yet',
    'inbox.noChatsSub': 'When you send a chat request on any property, your conversation will appear here.',

    // General
    'common.featured': 'Featured Himalayan Properties',
    'common.allCategories': 'All Property Types',
  },
  hi: {
    // Nav
    'nav.buy': 'प्रॉपर्टीज देखें',
    'nav.sell': 'प्रॉपर्टी बेचें',
    'nav.calculator': 'भूमि कैलकुलेटर',
    'nav.inbox': 'इनबॉक्स',
    'nav.contact': 'संपर्क करें',
    'nav.call': 'कॉल करें',
    'nav.whatsapp': 'व्हाट्सएप',
    'nav.menu': 'मेनू',
    'nav.close': 'बंद करें',
    'nav.theme': 'थीम',
    'nav.langToggle': 'English',
    'nav.langName': 'हिन्दी',
    'nav.allUnits': 'सभी इकाइयां',

    // Hero
    'hero.badge': 'उत्तराखंड प्रॉपर्टी डिस्कवरी • कोई प्लेटफॉर्म शुल्क नहीं',
    'hero.tagline': 'पहाड़ों में आपके सपनों का आशियाना',
    'hero.assurance1': 'आवासीय, व्यावसायिक एवं भूमि लिस्टिंग्स',
    'hero.assurance2': 'सीधा फोन एवं व्हाट्सएप संपर्क',

    // Search
    'search.hub': 'प्रॉपर्टी खोजें',
    'search.reset': 'रीसेट',
    'search.locationLabel': 'स्थान',
    'search.locationPlaceholder': 'अपना स्थान चुनें',
    'search.typeLabel': 'प्रॉपर्टी का प्रकार',
    'search.typePlaceholder': 'विला/प्लॉट/फ्लैट/दुकान/जमीन...',
    'search.inputPlaceholder': 'स्थान, क्षेत्र, प्रोजेक्ट या प्रकार से खोजें (जैसे मसूरी, 3BHK, प्लॉट)...',
    'search.searchBtn': 'खोजें',
    'search.otherLocLabel': 'उत्तराखंड में अपनी पसंद का स्थान / शहर दर्ज करें:',
    'search.otherLocPlaceholder': 'जैसे जोशीमठ, बागेश्वर, पिथौरागढ़, चम्पावत, चम्बा...',
    'search.setLocBtn': 'स्थान सेट करें',

    // Chat Request Confirmation
    'chat.confirmTitle': 'मालिक को चैट अनुरोध भेजें',
    'chat.confirmSub': 'प्रॉपर्टी मालिक से सीधे चैट अनुरोध भेजकर बात शुरू करें',
    'chat.ownerLabel': 'प्रॉपर्टी मालिक',
    'chat.propertyLabel': 'प्रॉपर्टी',
    'chat.msgLabel': 'आपका संदेश:',
    'chat.msgPlaceholder': 'नमस्ते! मैं इस प्रॉपर्टी में रुचि रखता हूँ। क्या यह साइट विज़िट या बातचीत के लिए उपलब्ध है?',
    'chat.securityNote': 'आपका अनुरोध सीधे मालिक के इनबॉक्स में भेजा जाएगा। कोई दलाल या बिचौलिया नहीं।',
    'chat.cancelBtn': 'रद्द करें',
    'chat.sendBtn': 'चैट अनुरोध भेजें',
    'chat.requestSuccess': 'मालिक को चैट अनुरोध भेज दिया गया! इनबॉक्स खुल रहा है...',

    // Inbox
    'inbox.title': 'संदेश और चैट',
    'inbox.phoneRequests': 'फोन नंबर अनुरोध',
    'inbox.marketplace': 'होम पेज',
    'inbox.menu': 'मेनू',
    'inbox.noChats': 'अभी तक कोई चैट नहीं है',
    'inbox.noChatsSub': 'जब आप किसी प्रॉपर्टी पर चैट अनुरोध भेजेंगे, तो वह यहाँ दिखाई देगी।',

    // General
    'common.featured': 'उत्तराखंड की प्रमुख प्रॉपर्टीज़',
    'common.allCategories': 'सभी प्रकार',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  isHindi: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key,
  tx: (enText) => enText,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_lang');
      if (saved === 'en' || saved === 'hi') return saved;
    } catch {}
    return 'en';
  });

  const isHindi = language === 'hi';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('uk_gateways_lang', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  const tx = (enText: string, hiText: string): string => {
    return isHindi ? hiText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, isHindi, setLanguage, toggleLanguage, t, tx }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
