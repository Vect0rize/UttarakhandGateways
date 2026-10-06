var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/context/LanguageContext.tsx
var LanguageContext_exports = {};
__export(LanguageContext_exports, {
  LanguageProvider: () => LanguageProvider,
  useLanguage: () => useLanguage
});
module.exports = __toCommonJS(LanguageContext_exports);
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var translations = {
  en: {
    // Nav
    "nav.buy": "Buy",
    "nav.sell": "Sell Property",
    "nav.calculator": "Land Calculator",
    "nav.inbox": "Inbox",
    "nav.contact": "Contact Us",
    "nav.call": "Call",
    "nav.whatsapp": "WhatsApp",
    "nav.menu": "Menu",
    "nav.close": "Close",
    "nav.theme": "Theme",
    "nav.langToggle": "\u0939\u093F\u0928\u094D\u0926\u0940",
    "nav.langName": "English",
    "nav.allUnits": "Any Unit",
    // Hero
    "hero.badge": "Verified Uttarakhand Real Estate \u2022 0% Brokerage",
    "hero.tagline": "Your Gateway To Mountain Living",
    "hero.assurance1": "Flats, Plots & Villas for Direct Purchase",
    "hero.assurance2": "100% Clear Title & Immediate Registry",
    // Search
    "search.hub": "Filter Properties",
    "search.reset": "Reset",
    "search.locationLabel": "Location",
    "search.locationPlaceholder": "Select Your Location",
    "search.typeLabel": "Property Type",
    "search.typePlaceholder": "Villa/Plot/Flat/Shop/Land...",
    "search.inputPlaceholder": "Search by location, builder, project, or property type (e.g. Mussoorie, 3BHK, Plot)...",
    "search.searchBtn": "Search",
    "search.otherLocLabel": "Enter your desired location / town in Uttarakhand:",
    "search.otherLocPlaceholder": "e.g. Joshimath, Bageshwar, Pithoragarh, Champawat, Chamba...",
    "search.setLocBtn": "Set Location",
    // Chat Request Confirmation
    "chat.confirmTitle": "Send Chat Request to Owner",
    "chat.confirmSub": "Start a verified direct conversation with the listing owner",
    "chat.ownerLabel": "Listing Owner",
    "chat.propertyLabel": "Property",
    "chat.msgLabel": "Your introductory message:",
    "chat.msgPlaceholder": "Namaste! I am interested in this property. Is it available for a site visit or discussion?",
    "chat.securityNote": "Your chat request will be delivered to the owner's Inbox. No spam or commission brokers.",
    "chat.cancelBtn": "Cancel",
    "chat.sendBtn": "Send Chat Request",
    "chat.requestSuccess": "Chat request sent to owner! Opening Inbox...",
    // Inbox
    "inbox.title": "Messages & Chat",
    "inbox.phoneRequests": "Phone Requests",
    "inbox.marketplace": "Marketplace",
    "inbox.menu": "Menu",
    "inbox.noChats": "No active conversations yet",
    "inbox.noChatsSub": "When you send a chat request on any property, your conversation will appear here.",
    // General
    "common.featured": "Featured Himalayan Properties",
    "common.allCategories": "All Property Types"
  },
  hi: {
    // Nav
    "nav.buy": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u0926\u0947\u0916\u0947\u0902",
    "nav.sell": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092C\u0947\u091A\u0947\u0902",
    "nav.calculator": "\u092D\u0942\u092E\u093F \u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930",
    "nav.inbox": "\u0907\u0928\u092C\u0949\u0915\u094D\u0938",
    "nav.contact": "\u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902",
    "nav.call": "\u0915\u0949\u0932 \u0915\u0930\u0947\u0902",
    "nav.whatsapp": "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A",
    "nav.menu": "\u092E\u0947\u0928\u0942",
    "nav.close": "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
    "nav.theme": "\u0925\u0940\u092E",
    "nav.langToggle": "English",
    "nav.langName": "\u0939\u093F\u0928\u094D\u0926\u0940",
    "nav.allUnits": "\u0938\u092D\u0940 \u0907\u0915\u093E\u0907\u092F\u093E\u0902",
    // Hero
    "hero.badge": "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0930\u093F\u092F\u0932 \u090F\u0938\u094D\u091F\u0947\u091F \u2022 0% \u092C\u094D\u0930\u094B\u0915\u0930\u0947\u091C",
    "hero.tagline": "\u092A\u0939\u093E\u0921\u093C\u094B\u0902 \u092E\u0947\u0902 \u0906\u092A\u0915\u0947 \u0938\u092A\u0928\u094B\u0902 \u0915\u093E \u0906\u0936\u093F\u092F\u093E\u0928\u093E",
    "hero.assurance1": "\u0938\u0940\u0927\u0940 \u0916\u0930\u0940\u0926 \u0915\u0947 \u0932\u093F\u090F \u092B\u094D\u0932\u0948\u091F\u094D\u0938, \u092A\u094D\u0932\u0949\u091F\u094D\u0938 \u0914\u0930 \u0935\u093F\u0932\u093E",
    "hero.assurance2": "100% \u0938\u094D\u092A\u0937\u094D\u091F \u091F\u093E\u0907\u091F\u0932 \u0914\u0930 \u0924\u0924\u094D\u0915\u093E\u0932 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940",
    // Search
    "search.hub": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0916\u094B\u091C\u0947\u0902",
    "search.reset": "\u0930\u0940\u0938\u0947\u091F",
    "search.locationLabel": "\u0938\u094D\u0925\u093E\u0928",
    "search.locationPlaceholder": "\u0905\u092A\u0928\u093E \u0938\u094D\u0925\u093E\u0928 \u091A\u0941\u0928\u0947\u0902",
    "search.typeLabel": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0915\u093E \u092A\u094D\u0930\u0915\u093E\u0930",
    "search.typePlaceholder": "\u0935\u093F\u0932\u093E/\u092A\u094D\u0932\u0949\u091F/\u092B\u094D\u0932\u0948\u091F/\u0926\u0941\u0915\u093E\u0928/\u091C\u092E\u0940\u0928...",
    "search.inputPlaceholder": "\u0938\u094D\u0925\u093E\u0928, \u092C\u093F\u0932\u094D\u0921\u0930, \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092F\u093E \u092A\u094D\u0930\u0915\u093E\u0930 \u0938\u0947 \u0916\u094B\u091C\u0947\u0902 (\u091C\u0948\u0938\u0947 \u092E\u0938\u0942\u0930\u0940, 3BHK, \u092A\u094D\u0932\u0949\u091F)...",
    "search.searchBtn": "\u0916\u094B\u091C\u0947\u0902",
    "search.otherLocLabel": "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u092E\u0947\u0902 \u0905\u092A\u0928\u0940 \u092A\u0938\u0902\u0926 \u0915\u093E \u0938\u094D\u0925\u093E\u0928 / \u0936\u0939\u0930 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902:",
    "search.otherLocPlaceholder": "\u091C\u0948\u0938\u0947 \u091C\u094B\u0936\u0940\u092E\u0920, \u092C\u093E\u0917\u0947\u0936\u094D\u0935\u0930, \u092A\u093F\u0925\u094C\u0930\u093E\u0917\u0922\u093C, \u091A\u092E\u094D\u092A\u093E\u0935\u0924, \u091A\u092E\u094D\u092C\u093E...",
    "search.setLocBtn": "\u0938\u094D\u0925\u093E\u0928 \u0938\u0947\u091F \u0915\u0930\u0947\u0902",
    // Chat Request Confirmation
    "chat.confirmTitle": "\u092E\u093E\u0932\u093F\u0915 \u0915\u094B \u091A\u0948\u091F \u0905\u0928\u0941\u0930\u094B\u0927 \u092D\u0947\u091C\u0947\u0902",
    "chat.confirmSub": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092E\u093E\u0932\u093F\u0915 \u0938\u0947 \u0938\u0940\u0927\u0947 \u091A\u0948\u091F \u0905\u0928\u0941\u0930\u094B\u0927 \u092D\u0947\u091C\u0915\u0930 \u092C\u093E\u0924 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    "chat.ownerLabel": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092E\u093E\u0932\u093F\u0915",
    "chat.propertyLabel": "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940",
    "chat.msgLabel": "\u0906\u092A\u0915\u093E \u0938\u0902\u0926\u0947\u0936:",
    "chat.msgPlaceholder": "\u0928\u092E\u0938\u094D\u0924\u0947! \u092E\u0948\u0902 \u0907\u0938 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092E\u0947\u0902 \u0930\u0941\u091A\u093F \u0930\u0916\u0924\u093E \u0939\u0942\u0901\u0964 \u0915\u094D\u092F\u093E \u092F\u0939 \u0938\u093E\u0907\u091F \u0935\u093F\u091C\u093C\u093F\u091F \u092F\u093E \u092C\u093E\u0924\u091A\u0940\u0924 \u0915\u0947 \u0932\u093F\u090F \u0909\u092A\u0932\u092C\u094D\u0927 \u0939\u0948?",
    "chat.securityNote": "\u0906\u092A\u0915\u093E \u0905\u0928\u0941\u0930\u094B\u0927 \u0938\u0940\u0927\u0947 \u092E\u093E\u0932\u093F\u0915 \u0915\u0947 \u0907\u0928\u092C\u0949\u0915\u094D\u0938 \u092E\u0947\u0902 \u092D\u0947\u091C\u093E \u091C\u093E\u090F\u0917\u093E\u0964 \u0915\u094B\u0908 \u0926\u0932\u093E\u0932 \u092F\u093E \u092C\u093F\u091A\u094C\u0932\u093F\u092F\u093E \u0928\u0939\u0940\u0902\u0964",
    "chat.cancelBtn": "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902",
    "chat.sendBtn": "\u091A\u0948\u091F \u0905\u0928\u0941\u0930\u094B\u0927 \u092D\u0947\u091C\u0947\u0902",
    "chat.requestSuccess": "\u092E\u093E\u0932\u093F\u0915 \u0915\u094B \u091A\u0948\u091F \u0905\u0928\u0941\u0930\u094B\u0927 \u092D\u0947\u091C \u0926\u093F\u092F\u093E \u0917\u092F\u093E! \u0907\u0928\u092C\u0949\u0915\u094D\u0938 \u0916\u0941\u0932 \u0930\u0939\u093E \u0939\u0948...",
    // Inbox
    "inbox.title": "\u0938\u0902\u0926\u0947\u0936 \u0914\u0930 \u091A\u0948\u091F",
    "inbox.phoneRequests": "\u092B\u094B\u0928 \u0928\u0902\u092C\u0930 \u0905\u0928\u0941\u0930\u094B\u0927",
    "inbox.marketplace": "\u0939\u094B\u092E \u092A\u0947\u091C",
    "inbox.menu": "\u092E\u0947\u0928\u0942",
    "inbox.noChats": "\u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u091A\u0948\u091F \u0928\u0939\u0940\u0902 \u0939\u0948",
    "inbox.noChatsSub": "\u091C\u092C \u0906\u092A \u0915\u093F\u0938\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092A\u0930 \u091A\u0948\u091F \u0905\u0928\u0941\u0930\u094B\u0927 \u092D\u0947\u091C\u0947\u0902\u0917\u0947, \u0924\u094B \u0935\u0939 \u092F\u0939\u093E\u0901 \u0926\u093F\u0916\u093E\u0908 \u0926\u0947\u0917\u0940\u0964",
    // General
    "common.featured": "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0915\u0940 \u092A\u094D\u0930\u092E\u0941\u0916 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C\u093C",
    "common.allCategories": "\u0938\u092D\u0940 \u092A\u094D\u0930\u0915\u093E\u0930"
  }
};
var LanguageContext = (0, import_react.createContext)({
  language: "en",
  isHindi: false,
  setLanguage: () => {
  },
  toggleLanguage: () => {
  },
  t: (key) => key,
  tx: (enText) => enText
});
var LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = (0, import_react.useState)(() => {
    try {
      const saved = localStorage.getItem("uk_gateways_lang");
      if (saved === "en" || saved === "hi") return saved;
    } catch {
    }
    return "en";
  });
  const isHindi = language === "hi";
  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("uk_gateways_lang", lang);
    } catch {
    }
  };
  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };
  const t = (key) => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };
  const tx = (enText, hiText) => {
    return isHindi ? hiText : enText;
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageContext.Provider, { value: { language, isHindi, setLanguage, toggleLanguage, t, tx }, children });
};
var useLanguage = () => (0, import_react.useContext)(LanguageContext);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LanguageProvider,
  useLanguage
});
