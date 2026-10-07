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

// src/components/PropertyDetailPage.tsx
var PropertyDetailPage_exports = {};
__export(PropertyDetailPage_exports, {
  PropertyDetailPage: () => PropertyDetailPage
});
module.exports = __toCommonJS(PropertyDetailPage_exports);
var import_react3 = require("react");
var import_lucide_react = require("lucide-react");

// src/context/LanguageContext.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
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
var useLanguage = () => (0, import_react.useContext)(LanguageContext);

// src/context/AuthContext.tsx
var import_react2 = require("react");

// src/utils/propertyOwnership.ts
var isAppOwner = (user) => {
  if (!user || !user.username) return false;
  return user.username.trim().toLowerCase() === "amit tyagi";
};
var normalizePhone = (num) => {
  if (!num) return "";
  const digits = num.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};
var isPropertyOwner = (property, currentUser) => {
  if (!currentUser) return false;
  if (isAppOwner(currentUser)) {
    return true;
  }
  if (property.ownerId && property.ownerId === currentUser.id) {
    return true;
  }
  const userContact = (currentUser.contact || "").trim().toLowerCase();
  const userPhoneDigits = normalizePhone(currentUser.contact);
  const userUsername = (currentUser.username || "").trim().toLowerCase();
  if (property.ownerContact) {
    const propOwnerContact = property.ownerContact.trim().toLowerCase();
    if (propOwnerContact === userContact) return true;
    const propOwnerDigits = normalizePhone(property.ownerContact);
    if (userPhoneDigits && propOwnerDigits && (userPhoneDigits === propOwnerDigits || userPhoneDigits.endsWith(propOwnerDigits) || propOwnerDigits.endsWith(userPhoneDigits))) {
      return true;
    }
  }
  if (property.ownerUsername && property.ownerUsername.trim().toLowerCase() === userUsername) {
    return true;
  }
  if (property.sellerEmail && property.sellerEmail.trim().toLowerCase() === userContact) {
    return true;
  }
  if (property.sellerPhone) {
    const sellerDigits = normalizePhone(property.sellerPhone);
    if (userPhoneDigits.length >= 10 && sellerDigits.length >= 10 && (userPhoneDigits === sellerDigits || userPhoneDigits.endsWith(sellerDigits) || sellerDigits.endsWith(userPhoneDigits))) {
      return true;
    }
  }
  if (property.sellerName && property.sellerName.trim().toLowerCase() === userUsername) {
    return true;
  }
  return false;
};

// src/context/AuthContext.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var AuthContext = (0, import_react2.createContext)(void 0);
var AUTH_USER_KEY = "uk_gateways_auth_user";
var REGISTERED_USERS_KEY = "uk_gateways_registered_users";
var SAVED_ACCOUNTS_KEY = "uk_gateways_saved_accounts";
var ACCOUNTS_WIPED_V3_KEY = "uk_gateways_accounts_wiped_v3";
if (typeof window !== "undefined") {
  try {
    if (localStorage.getItem(ACCOUNTS_WIPED_V3_KEY) !== "true") {
      localStorage.removeItem(REGISTERED_USERS_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(SAVED_ACCOUNTS_KEY);
      sessionStorage.removeItem("uk_gateways_pending_otp");
      localStorage.setItem(ACCOUNTS_WIPED_V3_KEY, "true");
    }
  } catch {
  }
}
var useAuth = () => {
  const context = (0, import_react2.useContext)(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// src/utils/language.ts
var TRANSLATIONS = {
  // Navigation
  "nav.home": { en: "Home", hi: "\u0939\u094B\u092E" },
  "nav.properties": { en: "Properties", hi: "\u0938\u0902\u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902" },
  "nav.about": { en: "About Us", hi: "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902" },
  "nav.contact": { en: "Contact", hi: "\u0938\u0902\u092A\u0930\u094D\u0915" },
  "nav.calculator": { en: "Land Calculator", hi: "\u092D\u0942\u092E\u093F \u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930" },
  "nav.inbox": { en: "Inbox", hi: "\u0907\u0928\u092C\u0949\u0915\u094D\u0938" },
  "nav.saved": { en: "Saved", hi: "\u0938\u0939\u0947\u091C\u0947 \u0917\u090F" },
  "nav.sell": { en: "Sell", hi: "\u0938\u0902\u092A\u0924\u094D\u0924\u093F \u092C\u0947\u091A\u0947\u0902" },
  "nav.menu": { en: "Menu", hi: "\u092E\u0947\u0928\u0942" },
  "nav.close": { en: "Close", hi: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902" },
  "nav.theme": { en: "Theme", hi: "\u0925\u0940\u092E" },
  "nav.light": { en: "Light Mode", hi: "\u0932\u093E\u0907\u091F \u092E\u094B\u0921" },
  "nav.dark": { en: "Dark Mode", hi: "\u0921\u093E\u0930\u094D\u0915 \u092E\u094B\u0921" },
  "nav.displayTheme": { en: "Display Theme", hi: "\u0921\u093F\u0938\u094D\u092A\u094D\u0932\u0947 \u0925\u0940\u092E" },
  "nav.language": { en: "Language", hi: "\u092D\u093E\u0937\u093E" },
  "nav.switchTo": { en: "\u0939\u093F\u0928\u094D\u0926\u0940", hi: "English" },
  // Hero
  "hero.realEstate": { en: "REAL ESTATE", hi: "\u0930\u093F\u092F\u0932 \u090F\u0938\u094D\u091F\u0947\u091F" },
  "hero.tagline": { en: "Your Gateway To Mountain Living", hi: "\u092A\u0939\u093E\u0921\u093C\u094B\u0902 \u092E\u0947\u0902 \u0906\u092A\u0915\u0947 \u0938\u092A\u0928\u094B\u0902 \u0915\u093E \u0906\u0936\u093F\u092F\u093E\u0928\u093E" },
  "hero.buyBtn": { en: "Buy Property", hi: "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u0916\u0930\u0940\u0926\u0947\u0902" },
  "hero.sellBtn": { en: "Sell Property", hi: "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092C\u0947\u091A\u0947\u0902" },
  "hero.assurance1": { en: "Flats, Plots & Villas for Direct Purchase", hi: "\u0938\u0940\u0927\u0940 \u0916\u0930\u0940\u0926 \u0939\u0947\u0924\u0941 \u092B\u094D\u0932\u0948\u091F\u094D\u0938, \u092A\u094D\u0932\u0949\u091F\u094D\u0938 \u0935 \u0935\u093F\u0932\u093E" },
  "hero.assurance2": { en: "100% Clear Title & Immediate Registry", hi: "100% \u0938\u094D\u092A\u0937\u094D\u091F \u092E\u093E\u0932\u093F\u0915\u093E\u0928\u093E \u0939\u0915 \u0914\u0930 \u0924\u0924\u094D\u0915\u093E\u0932 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940" },
  // Search & Filters
  "search.selectLocation": { en: "Select Your Location", hi: "\u0905\u092A\u0928\u093E \u0938\u094D\u0925\u093E\u0928 \u091A\u0941\u0928\u0947\u0902" },
  "search.allLocations": { en: "All Famous Uttarakhand Destinations", hi: "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0915\u0947 \u0938\u092D\u0940 \u092A\u094D\u0930\u092E\u0941\u0916 \u0936\u0939\u0930 \u0935 \u0915\u094D\u0937\u0947\u0924\u094D\u0930" },
  "search.otherLocation": { en: "Other Location...", hi: "\u0905\u0928\u094D\u092F \u0938\u094D\u0925\u093E\u0928..." },
  "search.locationLabel": { en: "Location", hi: "\u0938\u094D\u0925\u093E\u0928" },
  "search.typeLabel": { en: "Property Type", hi: "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0915\u093E \u092A\u094D\u0930\u0915\u093E\u0930" },
  "search.typePlaceholder": { en: "Villa, Flat, Plot, Cottage...", hi: "\u0935\u093F\u0932\u093E, \u092B\u094D\u0932\u0948\u091F, \u092A\u094D\u0932\u0949\u091F, \u0915\u0949\u091F\u0947\u091C..." },
  "search.inputPlaceholder": { en: "Search by location, builder, project, or property type (e.g. Mussoorie, 3BHK, Plot)...", hi: "\u0938\u094D\u0925\u093E\u0928, \u092C\u093F\u0932\u094D\u0921\u0930, \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092F\u093E \u092A\u094D\u0930\u0915\u093E\u0930 \u0926\u094D\u0935\u093E\u0930\u093E \u0916\u094B\u091C\u0947\u0902 (\u091C\u0948\u0938\u0947 \u092E\u0938\u0942\u0930\u0940, 3BHK, \u092A\u094D\u0932\u0949\u091F)..." },
  "search.searchBtn": { en: "Search", hi: "\u0916\u094B\u091C\u0947\u0902" },
  "search.resetBtn": { en: "Reset", hi: "\u0930\u0940\u0938\u0947\u091F" },
  "search.allTypes": { en: "All Property Types", hi: "\u0938\u092D\u0940 \u092A\u094D\u0930\u0915\u093E\u0930 \u0915\u0940 \u0938\u0902\u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902" },
  // Property Types
  "type.Villa": { en: "Villa", hi: "\u0935\u093F\u0932\u093E" },
  "type.Flat": { en: "Flat", hi: "\u092B\u094D\u0932\u0948\u091F" },
  "type.Plot": { en: "Plot", hi: "\u092A\u094D\u0932\u0949\u091F" },
  "type.Cottage": { en: "Cottage", hi: "\u0915\u0949\u091F\u0947\u091C" },
  "type.Farmhouse": { en: "Farmhouse", hi: "\u092B\u093E\u0930\u094D\u092E\u0939\u093E\u0909\u0938" },
  "type.Shop": { en: "Shop", hi: "\u0926\u0941\u0915\u093E\u0928" },
  "type.Hotel": { en: "Hotel", hi: "\u0939\u094B\u091F\u0932" },
  "type.Resort": { en: "Resort", hi: "\u0930\u093F\u0938\u0949\u0930\u094D\u091F" },
  "type.Studio": { en: "Studio", hi: "\u0938\u094D\u091F\u0942\u0921\u093F\u092F\u094B" },
  "type.Penthouse": { en: "Penthouse", hi: "\u092A\u0947\u0902\u091F\u0939\u093E\u0909\u0938" },
  "type.Duplex": { en: "Duplex", hi: "\u0921\u0941\u092A\u094D\u0932\u0947\u0915\u094D\u0938" },
  "type.Land": { en: "Land", hi: "\u092D\u0942\u092E\u093F / \u091C\u092E\u0940\u0928" },
  "type.Apartment": { en: "Apartment", hi: "\u0905\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F" },
  "type.PG": { en: "PG / Co-Living", hi: "\u092A\u0947\u0907\u0902\u0917 \u0917\u0947\u0938\u094D\u091F (PG)" },
  // Property Cards
  "card.clearTitle": { en: "Clear Title", hi: "\u0938\u094D\u092A\u0937\u094D\u091F \u092E\u093E\u0932\u093F\u0915\u093E\u0928\u093E \u0939\u0915" },
  "card.save": { en: "Save for later", hi: "\u0938\u0939\u0947\u091C\u0947\u0902" },
  "card.saved": { en: "Saved", hi: "\u0938\u0939\u0947\u091C\u093E \u0917\u092F\u093E" },
  "card.chat": { en: "Chat", hi: "\u091A\u0948\u091F \u0915\u0930\u0947\u0902" },
  "card.viewDetails": { en: "View Details", hi: "\u0935\u093F\u0935\u0930\u0923 \u0926\u0947\u0916\u0947\u0902" },
  "card.bhk": { en: "BHK", hi: "\u092C\u0940\u090F\u091A\u0915\u0947" },
  "card.baths": { en: "Baths", hi: "\u092C\u093E\u0925\u0930\u0942\u092E" },
  "card.directOwner": { en: "Direct Owner", hi: "\u0938\u0940\u0927\u0947 \u092E\u093E\u0932\u093F\u0915" },
  "card.requestPending": { en: "Request Pending", hi: "\u0905\u0928\u0941\u0930\u094B\u0927 \u0932\u0902\u092C\u093F\u0924" },
  "card.requestPhone": { en: "Request Phone", hi: "\u092B\u094B\u0928 \u0928\u0902\u092C\u0930 \u092E\u093E\u0902\u0917\u0947\u0902" },
  "card.mountainView": { en: "Mountain View", hi: "\u092A\u0930\u094D\u0935\u0924 \u0926\u0943\u0936\u094D\u092F" },
  // Calculator
  "calc.title": { en: "UKG Land Calculator", hi: "\u092F\u0942\u0915\u0947\u091C\u0940 \u092D\u0942\u092E\u093F \u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930" },
  "calc.subtitle": { en: "Convert Nali, Gaj, Sq.Ft, Bigha, Mutthi, Biswa, Acres and more", hi: "\u0928\u093E\u0932\u0940, \u0917\u091C, \u0935\u0930\u094D\u0917 \u092B\u0941\u091F, \u092C\u0940\u0918\u093E, \u092E\u0941\u091F\u094D\u0920\u0940, \u092C\u093F\u0938\u094D\u0935\u093E, \u090F\u0915\u0921\u093C \u0906\u0926\u093F \u0915\u093E \u0938\u091F\u0940\u0915 \u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923" },
  "calc.anyUnit": { en: "Any Unit \u2194 Any Unit", hi: "\u0938\u092D\u0940 \u0907\u0915\u093E\u0907\u092F\u093E\u0902 \u2194 \u0938\u092D\u0940 \u0907\u0915\u093E\u0907\u092F\u093E\u0902" },
  "calc.enterQty": { en: "Enter Quantity:", hi: "\u092E\u093E\u0924\u094D\u0930\u093E \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902:" },
  "calc.convertedResult": { en: "Converted Result in:", hi: "\u0930\u0942\u092A\u093E\u0902\u0924\u0930\u093F\u0924 \u092A\u0930\u093F\u0923\u093E\u092E:" },
  "calc.formula": { en: "Formula:", hi: "\u0938\u0942\u0924\u094D\u0930:" },
  // Pagination & Results
  "grid.showing": { en: "Showing", hi: "\u0915\u0941\u0932" },
  "grid.results": { en: "Results", hi: "\u092A\u0930\u093F\u0923\u093E\u092E" },
  "grid.result": { en: "Result", hi: "\u092A\u0930\u093F\u0923\u093E\u092E" },
  "grid.showingProps": { en: "Showing properties", hi: "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u0926\u093F\u0916\u093E\u0908 \u091C\u093E \u0930\u0939\u0940 \u0939\u0948\u0902" },
  "grid.of": { en: "of", hi: "\u092E\u0947\u0902 \u0938\u0947" },
  "grid.page": { en: "Page", hi: "\u092A\u0943\u0937\u094D\u0920" },
  "grid.previous": { en: "Previous", hi: "\u092A\u093F\u091B\u0932\u093E" },
  "grid.next": { en: "Next", hi: "\u0905\u0917\u0932\u093E" },
  "grid.sellListCTA": { en: "+ List Your Property", hi: "+ \u0905\u092A\u0928\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0932\u093F\u0938\u094D\u091F \u0915\u0930\u0947\u0902" },
  "grid.resetAllFilters": { en: "Reset All Filters", hi: "\u0938\u092D\u0940 \u092B\u093F\u0932\u094D\u091F\u0930 \u0939\u091F\u093E\u090F\u0902" },
  "grid.savedForLater": { en: "Saved for Later", hi: "\u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0938\u0902\u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902" },
  "grid.showAllProps": { en: "Show All Properties", hi: "\u0938\u092D\u0940 \u0938\u0902\u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902 \u0926\u0947\u0916\u0947\u0902" },
  "grid.noPropsFound": { en: "No Properties Match Your Current Filters", hi: "\u0906\u092A\u0915\u0947 \u091A\u0941\u0928\u0947 \u0917\u090F \u092B\u093F\u0932\u094D\u091F\u0930 \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u0915\u094B\u0908 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u0940" },
  "grid.noPropsDesc": { en: 'Try adjusting your search query, selecting "Select Your Location", or expanding the property type.', hi: "\u0915\u0943\u092A\u092F\u093E \u0916\u094B\u091C \u0936\u092C\u094D\u0926 \u092C\u0926\u0932\u0947\u0902 \u092F\u093E \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092A\u094D\u0930\u0915\u093E\u0930 \u0935 \u0938\u094D\u0925\u093E\u0928 \u0915\u094B \u0938\u093E\u092E\u093E\u0928\u094D\u092F \u0930\u0916\u0947\u0902\u0964" },
  "grid.noSavedProps": { en: "No Saved Properties Yet", hi: "\u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0938\u0939\u0947\u091C\u0940 \u0928\u0939\u0940\u0902 \u0917\u0908 \u0939\u0948" },
  "grid.noSavedDesc": { en: 'Click "Save for later" on any property card to build your personal shortlist.', hi: '\u0905\u092A\u0928\u0940 \u092A\u0938\u0902\u0926 \u0915\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092A\u0930 "\u0938\u0939\u0947\u091C\u0947\u0902" \u092C\u091F\u0928 \u0926\u092C\u093E\u0915\u0930 \u0909\u0938\u0947 \u092F\u0939\u093E\u0901 \u091C\u094B\u0921\u093C\u0947\u0902\u0964' },
  // Non-Agricultural Enquiry
  "enquiry.nonAgriTitle": { en: "Non-Agricultural Land (Section 143 Clearance)", hi: "\u0917\u0948\u0930-\u0915\u0943\u0937\u093F \u092D\u0942\u092E\u093F (\u0927\u093E\u0930\u093E 143 \u0935\u093F\u0927\u093F\u0935\u0924 \u0938\u094D\u0935\u0940\u0915\u0943\u0924)" },
  "enquiry.nonAgriBadge": { en: "100% Freehold & Direct Registry", hi: "100% \u092B\u094D\u0930\u0940\u0939\u094B\u0932\u094D\u0921 \u0935 \u0924\u0924\u094D\u0915\u093E\u0932 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940" },
  "enquiry.nonAgriDesc": {
    en: "Non-domicile buyers can freely purchase residential apartments and up to 250 sq. meters of non-agricultural land across Uttarakhand without special state permits.",
    hi: "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0938\u0947 \u092C\u093E\u0939\u0930 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915 \u092D\u0940 \u0930\u093E\u091C\u094D\u092F \u092E\u0947\u0902 250 \u0935\u0930\u094D\u0917 \u092E\u0940\u091F\u0930 \u0924\u0915 \u0917\u0948\u0930-\u0915\u0943\u0937\u093F \u092D\u0942\u092E\u093F (\u0927\u093E\u0930\u093E 143) \u0924\u0925\u093E \u092B\u094D\u0932\u0948\u091F\u094D\u0938 \u092C\u093F\u0928\u093E \u0915\u093F\u0938\u0940 \u0935\u093F\u0936\u0947\u0937 \u0905\u0928\u0941\u092E\u0924\u093F \u0915\u0947 \u0938\u0940\u0927\u0947 \u0905\u092A\u0928\u0947 \u0928\u093E\u092E \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0915\u0930\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
  },
  "enquiry.nonAgriBtn": { en: "Inquire for Section 143 Land", hi: "\u0927\u093E\u0930\u093E 143 \u0917\u0948\u0930-\u0915\u0943\u0937\u093F \u092D\u0942\u092E\u093F \u0939\u0947\u0924\u0941 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902" },
  // Contact & Pillars
  "contact.platformSupport": { en: "PLATFORM SUPPORT", hi: "\u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E \u0938\u0939\u093E\u092F\u0924\u093E \u0935 \u0938\u0902\u092A\u0930\u094D\u0915" },
  "contact.sendInquiries": { en: "Send Inquiries", hi: "\u0908\u092E\u0947\u0932 \u092D\u0947\u091C\u0947\u0902" },
  "contact.supportDesc": { en: "For listing inquiries, partnership proposals, or legal verification queries, write to our platform desk.", hi: "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0932\u093F\u0938\u094D\u091F\u093F\u0902\u0917, \u0938\u093E\u091D\u0947\u0926\u093E\u0930\u0940 \u092A\u094D\u0930\u0938\u094D\u0924\u093E\u0935 \u0905\u0925\u0935\u093E \u0915\u093E\u0928\u0942\u0928\u0940 \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u0947 \u0932\u093F\u090F \u0939\u092E\u093E\u0930\u0947 \u0938\u0939\u093E\u092F\u0924\u093E \u0921\u0947\u0938\u094D\u0915 \u092A\u0930 \u0932\u093F\u0916\u0947\u0902\u0964" },
  "contact.verified": { en: "VERIFIED PLATFORM", hi: "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092E\u0902\u091A" },
  "contact.verifiedTitle": { en: "Zero Brokerage Real Estate", hi: "\u0936\u0942\u0928\u094D\u092F \u092C\u094D\u0930\u094B\u0915\u0930\u0947\u091C \u0930\u093F\u092F\u0932 \u090F\u0938\u094D\u091F\u0947\u091F" },
  "contact.verifiedDesc": { en: "Connect directly with authentic property owners and reputed builders across Uttarakhand.", hi: "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0915\u0947 \u092A\u094D\u0930\u093E\u092E\u093E\u0923\u093F\u0915 \u0938\u0902\u092A\u0924\u094D\u0924\u093F \u092E\u093E\u0932\u093F\u0915\u094B\u0902 \u0914\u0930 \u092A\u094D\u0930\u0924\u093F\u0937\u094D\u0920\u093F\u0924 \u092C\u093F\u0932\u094D\u0921\u0930\u094B\u0902 \u0938\u0947 \u0938\u0940\u0927\u0947 \u091C\u0941\u0921\u093C\u0947\u0902\u0964" },
  "contact.landReg": { en: "LAND REGULATIONS", hi: "\u092D\u0942\u092E\u093F \u0928\u093F\u092F\u092E \u0935 \u0926\u093F\u0936\u093E\u0928\u093F\u0930\u094D\u0926\u0947\u0936" },
  "contact.rulesTitle": { en: "Non-Agricultural Land Rules", hi: "\u0917\u0948\u0930-\u0915\u0943\u0937\u093F \u092D\u0942\u092E\u093F \u0928\u093F\u092F\u092E (\u0927\u093E\u0930\u093E 143)" },
  "contact.rulesDesc": { en: "Clear guidance on the 250 sq. m ceiling for non-domiciles, Section 143 conversion, and unrestricted apartment purchases.", hi: "\u0917\u0948\u0930-\u092E\u0942\u0932 \u0928\u093F\u0935\u093E\u0938\u093F\u092F\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F 250 \u0935\u0930\u094D\u0917 \u092E\u0940\u091F\u0930 \u0938\u0940\u092E\u093E, \u0927\u093E\u0930\u093E 143 \u0930\u0942\u092A\u093E\u0902\u0924\u0930\u0923 \u0914\u0930 \u0905\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F \u0916\u0930\u0940\u0926 \u092A\u0930 \u0938\u094D\u092A\u0937\u094D\u091F \u0928\u093F\u092F\u092E\u0964" },
  "contact.registryVerified": { en: "100% Registry Verified", hi: "100% \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924" },
  "contact.directOwnerLabel": { en: "Direct Buyer-Seller Marketplace", hi: "\u0938\u0940\u0927\u093E \u0915\u094D\u0930\u0947\u0924\u093E-\u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E \u0938\u0902\u092A\u0930\u094D\u0915" },
  // Footer
  "footer.about": { en: "Uttarakhand Gateways is a dedicated real estate platform for discovering verified flats, residential plots, and villas with 0% brokerage.", hi: "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0917\u0947\u091F\u0935\u0947\u091C 0% \u092C\u094D\u0930\u094B\u0915\u0930\u0947\u091C \u0915\u0947 \u0938\u093E\u0925 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092B\u094D\u0932\u0948\u091F, \u0906\u0935\u093E\u0938\u0940\u092F \u092A\u094D\u0932\u0949\u091F \u0914\u0930 \u0935\u093F\u0932\u093E \u0916\u094B\u091C\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092E\u0941\u0916 \u092E\u0902\u091A \u0939\u0948\u0964" },
  "footer.quickLinks": { en: "Quick Navigation", hi: "\u0924\u094D\u0935\u0930\u093F\u0924 \u0928\u0947\u0935\u093F\u0917\u0947\u0936\u0928" },
  "footer.popularDestinations": { en: "Popular Uttarakhand Destinations", hi: "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0915\u0947 \u092A\u094D\u0930\u092E\u0941\u0916 \u0938\u094D\u0925\u0932" },
  "footer.clearTitleNotice": { en: "Clear Title Uttarakhand Registry", hi: "\u0938\u094D\u092A\u0937\u094D\u091F \u092E\u093E\u0932\u093F\u0915\u093E\u0928\u093E \u0939\u0915 \u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940" },
  "footer.rights": { en: "All Rights Reserved. Uttarakhand.", hi: "\u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964 \u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921\u0964" }
};
function formatLocalizedPrice(priceDisplay, language) {
  if (!priceDisplay) return "";
  if (language !== "hi") return priceDisplay;
  return priceDisplay.replace(/Lakh/gi, "\u0932\u093E\u0916").replace(/Cr/gi, "\u0915\u0930\u094B\u0921\u093C").replace(/Crore/gi, "\u0915\u0930\u094B\u0921\u093C").replace(/k/gi, "\u0939\u091C\u093E\u0930");
}
function translatePropertyType(type, language) {
  if (language !== "hi") return type;
  const key = `type.${type}`;
  if (TRANSLATIONS[key]) {
    return TRANSLATIONS[key].hi;
  }
  const map = {
    "Villa": "\u0935\u093F\u0932\u093E",
    "Flat": "\u092B\u094D\u0932\u0948\u091F",
    "Plot": "\u092A\u094D\u0932\u0949\u091F",
    "Cottage": "\u0915\u0949\u091F\u0947\u091C",
    "Farmhouse": "\u092B\u093E\u0930\u094D\u092E\u0939\u093E\u0909\u0938",
    "Shop": "\u0926\u0941\u0915\u093E\u0928",
    "Hotel": "\u0939\u094B\u091F\u0932",
    "Resort": "\u0930\u093F\u0938\u0949\u0930\u094D\u091F",
    "Studio": "\u0938\u094D\u091F\u0942\u0921\u093F\u092F\u094B",
    "Penthouse": "\u092A\u0947\u0902\u091F\u0939\u093E\u0909\u0938",
    "Duplex": "\u0921\u0941\u092A\u094D\u0932\u0947\u0915\u094D\u0938",
    "Land": "\u092D\u0942\u092E\u093F / \u091C\u092E\u0940\u0928",
    "Apartment": "\u0905\u092A\u093E\u0930\u094D\u091F\u092E\u0947\u0902\u091F",
    "Residential": "\u0906\u0935\u093E\u0938\u0940\u092F",
    "Commercial": "\u0935\u094D\u092F\u093E\u0935\u0938\u093E\u092F\u093F\u0915",
    "Agriculture": "\u0915\u0943\u0937\u093F",
    "Rent/Lease": "\u0915\u093F\u0930\u093E\u092F\u093E / \u0932\u0940\u091C",
    "Rent": "\u0915\u093F\u0930\u093E\u092F\u093E",
    "PG": "\u092A\u0947\u0907\u0902\u0917 \u0917\u0947\u0938\u094D\u091F (PG)"
  };
  return map[type] || type;
}

// src/components/PropertyDetailPage.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var PropertyDetailPage = ({
  property,
  onBack,
  onOpenEmiCalculator,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onRequestPhoneNumber,
  phoneRequestStatus = "none",
  approvedPhoneNumber,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
  allProperties = [],
  onSelectProperty,
  onOpenLegalPolicy
}) => {
  const safeImages = (0, import_react3.useMemo)(() => {
    if (Array.isArray(property?.images) && property.images.length > 0) {
      return property.images.filter(Boolean);
    }
    return ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"];
  }, [property?.images]);
  const safeAmenities = (0, import_react3.useMemo)(() => {
    return Array.isArray(property?.amenities) ? property.amenities.filter(Boolean) : [];
  }, [property?.amenities]);
  const [activeImgIdx, setActiveImgIdx] = (0, import_react3.useState)(0);
  const [isLightboxOpen, setIsLightboxOpen] = (0, import_react3.useState)(false);
  const [copiedLink, setCopiedLink] = (0, import_react3.useState)(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = (0, import_react3.useState)(false);
  const [showOwnerMenu, setShowOwnerMenu] = (0, import_react3.useState)(false);
  const [isSoldLocal, setIsSoldLocal] = (0, import_react3.useState)(Boolean(property?.isSold));
  const [soldNotice, setSoldNotice] = (0, import_react3.useState)(null);
  (0, import_react3.useEffect)(() => {
    setIsSoldLocal(Boolean(property?.isSold));
  }, [property?.isSold]);
  const [downPaymentPercent, setDownPaymentPercent] = (0, import_react3.useState)(20);
  const [loanTenureYears, setLoanTenureYears] = (0, import_react3.useState)(20);
  const [interestRate, setInterestRate] = (0, import_react3.useState)(8.5);
  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();
  const isOwner = property ? isPropertyOwner(property, currentUser) : false;
  const isAmitTyagi = currentUser?.username?.trim().toLowerCase() === "amit tyagi";
  (0, import_react3.useEffect)(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (property?.title) {
      document.title = `${property.title} | Uttarakhand Gateways`;
    }
  }, [property]);
  (0, import_react3.useEffect)(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);
  const handleShare = () => {
    if (!property) return;
    const url = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2e3);
  };
  const handleShareWhatsApp = () => {
    if (!property) return;
    const url = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    const lines = [
      `\u{1F3E1} *${property.title}*`,
      `\u{1F4CD} *Location:* ${property.location || property.city}, Uttarakhand`,
      `\u{1F4B0} *Price:* ${property.priceDisplay || `\u20B9${priceNum.toLocaleString("en-IN")}`}`,
      `\u{1F4D0} *Super Area:* ${property.areaDisplay || `${property.areaSqFt} sq.ft`}`,
      `\u{1F4CF} *Size Conversions:* ${gajVal} Gaj / ${naliVal} Nali (${mutthiVal} Mutthi)`,
      ...property.bedrooms > 0 ? [`\u{1F6CF}\uFE0F *Configuration:* ${property.bedrooms} BHK (${property.type})`] : property.type === "Studio" || property.configuration?.toLowerCase().includes("studio") ? [`\u{1F6CF}\uFE0F *Configuration:* Studio (${property.type})`] : [`\u{1F3F7}\uFE0F *Type:* ${property.type}`],
      ...property.facing ? [`\u{1F9ED} *Facing:* ${property.facing}`] : [],
      ...property.possession ? [`\u{1F4C5} *Possession:* ${property.possession}`] : [],
      ...property.reraStatus ? [`\u{1F4DC} *Title Status:* ${property.reraStatus}`] : [],
      `\u26A1 *Brokerage:* 0% Direct Deal (No Commission)`,
      "",
      `\u{1F449} *Click to view all photos, size & full details:*`,
      url
    ];
    const message = lines.join("\n");
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };
  const handleOpenGoogleMaps = () => {
    if (!property) return;
    const query = encodeURIComponent(`${property.location || property.city}, Uttarakhand, India`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };
  const handlePrint = () => {
    window.print();
  };
  const handleInstantToggleSold = () => {
    if (!property) return;
    const nextStatus = !isSoldLocal;
    setIsSoldLocal(nextStatus);
    setSoldNotice(nextStatus ? isHindi ? "\u2705 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092C\u093F\u0915 \u091A\u0941\u0915\u0940 (Sold Out) \u092E\u093E\u0930\u094D\u0915 \u0915\u0930 \u0926\u0940 \u0917\u0908!" : "\u2705 Property marked as Sold Out!" : isHindi ? "\u2705 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u092B\u093F\u0930 \u0938\u0947 \u0909\u092A\u0932\u092C\u094D\u0927 (Active) \u092E\u093E\u0930\u094D\u0915 \u0915\u0930 \u0926\u0940 \u0917\u0908!" : "\u2705 Property marked as Available for Sale!");
    setTimeout(() => setSoldNotice(null), 3e3);
    if (onToggleSold) {
      onToggleSold(property.id);
    }
  };
  const priceNum = typeof property?.price === "string" ? parseFloat(property.price) : property?.price || 0;
  const areaNum = typeof property?.areaSqFt === "string" ? parseFloat(property.areaSqFt) : property?.areaSqFt || 0;
  const pricePerSqFt = areaNum > 0 ? Math.round(priceNum / areaNum) : 0;
  const gajVal = areaNum > 0 ? Math.round(areaNum / 9) : 0;
  const naliVal = areaNum > 0 ? (areaNum / 2160).toFixed(2) : "0";
  const mutthiVal = areaNum > 0 ? (areaNum / 135).toFixed(1) : "0";
  const bighaVal = areaNum > 0 ? (areaNum / 8640).toFixed(2) : "0";
  const sqMeterVal = areaNum > 0 ? (areaNum / 10.7639).toFixed(1) : "0";
  const acreVal = areaNum > 0 ? (areaNum / 43560).toFixed(3) : "0";
  const carpetAreaSqFt = Math.round(areaNum * 0.82);
  const pricePerGaj = gajVal > 0 ? Math.round(priceNum / gajVal) : 0;
  const pricePerNali = parseFloat(naliVal) > 0 ? Math.round(priceNum / parseFloat(naliVal)) : 0;
  const loanAmount = priceNum * (1 - downPaymentPercent / 100);
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const calculatedEmi = Math.round(
    loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
  const isPhoneApproved = phoneRequestStatus === "approved";
  const isPhonePending = phoneRequestStatus === "pending";
  const sellerDisplayName = property?.sellerName || (isHindi ? "\u0938\u0940\u0927\u0947 \u092E\u093E\u0932\u093F\u0915" : "Direct Owner");
  const isForRent = property?.type === "Rent/Lease" || property?.purpose === "rent" || Boolean(property?.isAvailableForRent) || Boolean(property?.priceDisplay) && property.priceDisplay.toLowerCase().includes("/ month");
  const city = property?.city || "Dehradun";
  const airportInfo = property?.distanceFromAirport || (city === "Dehradun" ? "28 km (Jolly Grant Airport)" : city === "Mussoorie" ? "54 km (Jolly Grant Airport)" : city === "Rishikesh" ? "21 km (Jolly Grant Airport)" : city === "Haridwar" ? "38 km (Jolly Grant Airport)" : city === "Nainital" || city === "Bhimtal" || city === "Bhowali" || city === "Mukteshwar" ? "65-90 km (Pantnagar Airport)" : "Nearest Airport: Jolly Grant / Pantnagar");
  const railwayInfo = property?.distanceFromRailway || (city === "Dehradun" ? "6 km (Dehradun Railway Station)" : city === "Mussoorie" ? "34 km (Dehradun Railway Station)" : city === "Rishikesh" ? "4 km (Yog Nagari Rishikesh Station)" : city === "Haridwar" ? "5 km (Haridwar Junction)" : city === "Nainital" || city === "Bhimtal" || city === "Bhowali" ? "28-35 km (Kathgodam Railway Station)" : city === "Mukteshwar" ? "62 km (Kathgodam Railway Station)" : "Nearest Railway Station connected");
  const similarProps = allProperties.filter((p) => p && p.id !== property?.id && (p.city === property?.city || p.category === property?.category)).slice(0, 3);
  if (!property) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#04160f]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h2", { className: "text-xl font-bold mb-4 text-slate-900 dark:text-white", children: "Property Not Found" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          type: "button",
          onClick: onBack,
          className: "px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-sm cursor-pointer shadow-md hover:bg-emerald-700",
          children: isHindi ? "\u0938\u092D\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u092A\u0930 \u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902" : "Back to Properties"
        }
      )
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "min-h-screen bg-slate-50 dark:bg-[#04160f] text-slate-900 dark:text-slate-100 transition-colors pt-16 sm:pt-20 md:pt-24 pb-28 sm:pb-16 overflow-x-hidden", children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "sticky top-[58px] sm:top-[68px] md:top-[76px] z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 shadow-xs", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 sm:gap-3 min-w-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: onBack,
            className: "px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-95 group shrink-0",
            title: isHindi ? "\u0938\u092D\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u092A\u0930 \u0935\u093E\u092A\u0938 \u0932\u094C\u091F\u0947\u0902" : "Return to Properties",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ArrowLeft, { className: "w-4 h-4 group-hover:-translate-x-1 transition-transform text-white shrink-0" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0935\u093E\u092A\u0938 \u0932\u094C\u091F\u0947\u0902" : "Return" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-emerald-300/70 font-medium truncate", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921" : "Uttarakhand" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "/" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-semibold text-emerald-800 dark:text-emerald-300", children: property.city }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "/" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "truncate max-w-[180px] md:max-w-[280px] text-slate-700 dark:text-slate-300", children: property.title })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1 sm:gap-2 shrink-0", children: [
        (isOwner || isAmitTyagi) && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setShowOwnerMenu((prev) => !prev),
              className: "p-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#071f16] hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95",
              title: isHindi ? "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0935\u093F\u0915\u0932\u094D\u092A" : "Property Options",
              children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MoreVertical, { className: "w-4 h-4 text-emerald-700 dark:text-emerald-400" })
            }
          ),
          showOwnerMenu && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute right-0 top-10 z-50 w-52 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200 dark:border-emerald-800 shadow-2xl py-1 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShowOwnerMenu(false);
                  onEditProperty?.(property);
                },
                className: "w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Edit3, { className: "w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902" : "Edit Property Listing" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShowOwnerMenu(false);
                  handleInstantToggleSold();
                },
                className: "w-full px-3.5 py-2.5 text-left hover:bg-amber-50 dark:hover:bg-amber-950/60 flex items-center gap-2 cursor-pointer font-bold text-amber-700 dark:text-amber-300 border-t border-slate-100 dark:border-slate-800/80",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Tag, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isSoldLocal ? isHindi ? "\u0909\u092A\u0932\u092C\u094D\u0927 \u092E\u093E\u0930\u094D\u0915 \u0915\u0930\u0947\u0902" : "Mark Available" : isHindi ? "\u092C\u093F\u0915 \u091A\u0941\u0915\u0940 \u092E\u093E\u0930\u094D\u0915 \u0915\u0930\u0947\u0902" : "Mark as Sold" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShowOwnerMenu(false);
                  setShowDeleteConfirm(true);
                },
                className: "w-full px-3.5 py-2.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer font-bold border-t border-slate-100 dark:border-slate-800/80",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Trash2, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0932\u093F\u0938\u094D\u091F\u093F\u0902\u0917 \u0939\u091F\u093E\u090F\u0902" : "Delete Listing" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: handleShareWhatsApp,
            className: "p-1.5 sm:px-3 sm:py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer",
            title: isHindi ? "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A \u092A\u0930 \u0936\u0947\u092F\u0930 \u0915\u0930\u0947\u0902" : "Share on WhatsApp",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className: "w-4 h-4 fill-current shrink-0", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hidden md:inline", children: "WhatsApp" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: handleShare,
            className: "p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
            title: isHindi ? "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0932\u093F\u0902\u0915 \u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902" : "Share property link",
            children: [
              copiedLink ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Check, { className: "w-4 h-4 text-emerald-600" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Share2, { className: "w-4 h-4 text-slate-600 dark:text-slate-300" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hidden sm:inline", children: copiedLink ? isHindi ? "\u0915\u0949\u092A\u0940 \u0939\u0941\u0906!" : "Copied!" : isHindi ? "\u0936\u0947\u092F\u0930" : "Share" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => onToggleFavorite(property.id),
            className: `p-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${isFavorite ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800"}`,
            title: isFavorite ? isHindi ? "\u0938\u0939\u0947\u091C\u0940 \u0917\u0908 \u0938\u0942\u091A\u0940 \u0938\u0947 \u0939\u091F\u093E\u090F\u0902" : "Remove from saved" : isHindi ? "\u0938\u0939\u0947\u091C\u0947\u0902" : "Save Property",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Bookmark, { className: `w-4 h-4 ${isFavorite ? "fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" : ""}` }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "hidden sm:inline", children: isFavorite ? isHindi ? "\u0938\u0939\u0947\u091C\u093E \u0917\u092F\u093E" : "Saved" : isHindi ? "\u0938\u0939\u0947\u091C\u0947\u0902" : "Save" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            onClick: handlePrint,
            className: "hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer",
            title: isHindi ? "\u0935\u093F\u0935\u0930\u0923 \u092A\u094D\u0930\u093F\u0902\u091F \u0915\u0930\u0947\u0902" : "Print Property Sheet",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Printer, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }) }),
    soldNotice && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "max-w-md mx-auto mt-4 px-4", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-in fade-in", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCircle2, { className: "w-4 h-4" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: soldNotice })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 sm:space-y-8", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "space-y-3", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-2.5 sm:gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lg:col-span-3 relative h-[260px] sm:h-[400px] md:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-lg border border-emerald-200 dark:border-emerald-900/80 group", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "img",
            {
              src: safeImages[activeImgIdx] || safeImages[0],
              alt: property.title,
              className: "w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]",
              onClick: () => setIsLightboxOpen(true)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 pointer-events-none" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none gap-2 flex-wrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5 sm:gap-2 flex-wrap", children: [
              isForRent ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "bg-teal-600/95 backdrop-blur-md text-white text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm border border-teal-300 flex items-center gap-1.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-teal-200 animate-pulse" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0915\u093F\u0930\u093E\u092F\u0947 \u092A\u0930 (For Rent)" : "For Rent" })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "bg-amber-400/95 backdrop-blur-md text-slate-950 text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm border border-amber-300 flex items-center gap-1.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "w-1.5 h-1.5 rounded-full bg-slate-950" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u092C\u093F\u0915\u094D\u0930\u0940 \u0939\u0947\u0924\u0941 (For Sale)" : "For Sale" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "bg-emerald-950/90 backdrop-blur-md border border-emerald-400/50 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-sm", children: translatePropertyType(property.type, isHindi ? "hi" : "en") }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-300 shadow-sm flex items-center gap-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ShieldCheck, { className: "w-3.5 h-3.5 text-emerald-600" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "0% BROKERAGE" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "flex items-center gap-1.5", children: isSoldLocal ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "bg-rose-600 text-white text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-md", children: isHindi ? "\u092C\u093F\u0915 \u091A\u0941\u0915\u0940 \u0939\u0948 (Sold Out)" : "Sold Out" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "bg-emerald-600/95 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm", children: isHindi ? "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924" : "Verified" }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-end justify-between text-white gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[10px] sm:text-[11px] text-emerald-300 font-semibold tracking-wide uppercase block", children: [
                "Photo ",
                activeImgIdx + 1,
                " of ",
                safeImages.length
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "text-xs sm:text-sm font-bold truncate max-w-[220px] sm:max-w-md drop-shadow-md", children: [
                property.location || property.city,
                ", Uttarakhand"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => setIsLightboxOpen(true),
                className: "px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Maximize2, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u092B\u0941\u0932\u0938\u094D\u0915\u094D\u0930\u0940\u0928" : "View Fullscreen" })
                ]
              }
            )
          ] }),
          safeImages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveImgIdx((prev) => prev === 0 ? safeImages.length - 1 : prev - 1);
                },
                className: "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-md active:scale-90",
                title: "Previous photo",
                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronLeft, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setActiveImgIdx((prev) => prev === safeImages.length - 1 ? 0 : prev + 1);
                },
                className: "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-md active:scale-90",
                title: "Next photo",
                children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronRight, { className: "w-5 h-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "grid grid-cols-4 lg:grid-cols-1 gap-2 sm:gap-2.5", children: safeImages.slice(0, 4).map((img, idx) => {
          const isSelected = activeImgIdx === idx;
          return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              onClick: () => setActiveImgIdx(idx),
              className: `relative h-16 sm:h-20 lg:h-[112px] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/30 scale-[1.02]" : "border-transparent opacity-75 hover:opacity-100 hover:border-emerald-300"}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: img, alt: `Preview ${idx + 1}`, className: "w-full h-full object-cover" }),
                idx === 3 && safeImages.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[11px] sm:text-xs font-black", children: [
                  "+",
                  safeImages.length - 4,
                  " more"
                ] })
              ]
            },
            idx
          );
        }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lg:col-span-2 space-y-6 sm:space-y-8", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800", children: property.category }),
              property.reraStatus && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800", children: property.reraStatus }),
              property.possession && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800", children: property.possession }),
              property.altitudeMsl && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800", children: [
                "\u26F0\uFE0F ",
                property.altitudeMsl
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { className: "font-serif-luxury text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight", children: property.title }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-wrap items-center gap-2 text-slate-600 dark:text-emerald-200/90 text-xs sm:text-sm mt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5 font-medium", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MapPin, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
                    property.location || property.city,
                    ", ",
                    property.city,
                    ", Uttarakhand"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                  "button",
                  {
                    type: "button",
                    onClick: handleOpenGoogleMaps,
                    className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800",
                    title: "View on Google Maps",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Navigation, { className: "w-3 h-3" }),
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0917\u0942\u0917\u0932 \u092E\u0948\u092A\u094D\u0938 \u092A\u0930 \u0926\u0947\u0916\u0947\u0902" : "View on Google Maps" }),
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ExternalLink, { className: "w-3 h-3" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-[#082b1f] dark:via-[#06241a] dark:to-[#041911] border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-emerald-300/80 block", children: isForRent ? isHindi ? "\u092E\u093E\u0938\u093F\u0915 \u0915\u093F\u0930\u093E\u092F\u093E (Monthly Rent)" : "Monthly Rental (Direct Deal)" : isHindi ? "\u092E\u093E\u0902\u0917 \u092E\u0942\u0932\u094D\u092F (Direct Owner Price)" : "Asking Price (Direct Deal)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-300", children: formatLocalizedPrice(property.priceDisplay || `\u20B9${priceNum.toLocaleString("en-IN")}`, isHindi ? "hi" : "en") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5", children: "\u2713 0% Brokerage Direct to Owner" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "text-right sm:text-right", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-emerald-300/80 block", children: isHindi ? "\u0926\u0930 \u092A\u094D\u0930\u0924\u093F \u0935\u0930\u094D\u0917 \u092B\u0941\u091F" : "Rate per Sq.Ft" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-sm sm:text-base font-bold text-slate-800 dark:text-emerald-200", children: property.ratePerSqFt || (pricePerSqFt > 0 ? `\u20B9${pricePerSqFt.toLocaleString("en-IN")} / sq.ft` : "N/A") }),
                gajVal > 0 && pricePerGaj > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[11px] text-slate-500 dark:text-slate-400 block font-medium", children: [
                  "\u2248 \u20B9",
                  pricePerGaj.toLocaleString("en-IN"),
                  " / Gaj"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-slate-500 dark:text-slate-400", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold uppercase tracking-wider", children: isHindi ? "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932" : "Super Area" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Ruler, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base sm:text-lg font-black text-slate-900 dark:text-white block", children: [
                  property.areaSqFt,
                  " sq.ft"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[11px] text-emerald-700 dark:text-emerald-300 font-bold block mt-0.5", children: [
                  "\u2248 ",
                  gajVal,
                  " Gaj / ",
                  naliVal,
                  " Nali"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-slate-500 dark:text-slate-400", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold uppercase tracking-wider", children: isHindi ? "\u0915\u0949\u0928\u094D\u092B\u093C\u093F\u0917\u0930\u0947\u0936\u0928" : "Configuration" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Home, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-base sm:text-lg font-black text-slate-900 dark:text-white block", children: property.bedrooms > 0 ? `${property.bedrooms} BHK` : property.type }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5", children: property.bathrooms > 0 ? `${property.bathrooms} Bathrooms` : "Ready Plot" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-slate-500 dark:text-slate-400", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold uppercase tracking-wider", children: isHindi ? "\u0926\u093F\u0936\u093E / \u0935\u093E\u0938\u094D\u0924\u0941" : "Facing & Vastu" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Compass, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate", children: property.facing || (isHindi ? "\u092A\u0942\u0930\u094D\u0935 / \u0909\u0924\u094D\u0924\u0930-\u092A\u0942\u0930\u094D\u0935" : "North-East") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium", children: isHindi ? "\u0935\u093E\u0938\u094D\u0924\u0941 \u0905\u0928\u0941\u0915\u0942\u0932" : "Vastu Compliant" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs flex flex-col justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-slate-500 dark:text-slate-400", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold uppercase tracking-wider", children: isHindi ? "\u0935\u093F\u0927\u093F\u0915 \u0938\u094D\u0925\u093F\u0924\u093F" : "Title / RERA" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ShieldCheck, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "mt-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-sm sm:text-base font-black text-slate-900 dark:text-white block truncate", children: property.reraStatus || "Clear Freehold" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5", children: "100% Non-Encumbrance" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border-2 border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Ruler, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white", children: isHindi ? "\u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932 \u090F\u0935\u0902 \u092E\u093E\u092A \u0915\u093E \u0938\u0902\u092A\u0942\u0930\u094D\u0923 \u0935\u093F\u0935\u0930\u0923 (Complete Size Breakdown)" : "Complete Size & Land Measurements" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-xs text-slate-500 dark:text-slate-400", children: isHindi ? "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u092A\u0939\u093E\u0921\u093C\u0940 \u0935 \u092E\u093E\u0928\u0915 \u0907\u0915\u093E\u0907\u092F\u094B\u0902 \u092E\u0947\u0902 \u0938\u094D\u092A\u0937\u094D\u091F \u092E\u093E\u092A" : "Detailed breakdown across standard and Uttarakhand hill units" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800", children: [
                property.areaSqFt,
                " Sq.Ft"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 block", children: "Super Built-up Area" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-slate-900 dark:text-white block mt-0.5", children: [
                  property.areaSqFt.toLocaleString("en-IN"),
                  " sq.ft"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: "Total architectural footprint" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 block", children: "Carpet Area (Usable)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-slate-900 dark:text-white block mt-0.5", children: [
                  "\u2248 ",
                  carpetAreaSqFt.toLocaleString("en-IN"),
                  " sq.ft"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: "Approx. 82% usable floor" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block", children: "Gaj (Square Yards)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-emerald-900 dark:text-emerald-200 block mt-0.5", children: [
                  gajVal,
                  " Gaj"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-emerald-700 dark:text-emerald-400 font-medium", children: "1 Gaj = 9 sq.ft" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-bold text-teal-800 dark:text-teal-300 block", children: "Uttarakhand Nali (\u0928\u093E\u0932\u0940)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-teal-900 dark:text-teal-200 block mt-0.5", children: [
                  naliVal,
                  " Nali"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-teal-700 dark:text-teal-400 font-medium", children: "1 Nali = 2,160 sq.ft (240 Gaj)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 block", children: "Mutthi (\u092E\u0941\u091F\u094D\u0920\u0940)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-slate-900 dark:text-white block mt-0.5", children: [
                  mutthiVal,
                  " Mutthi"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: "1 Nali = 16 Mutthi (135 sq.ft)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 block", children: "Hill Bigha (\u092A\u0939\u093E\u0921\u093C\u0940 \u092C\u0940\u0918\u093E)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-slate-900 dark:text-white block mt-0.5", children: [
                  bighaVal,
                  " Bigha"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: "1 Hill Bigha = 4 Nali (8,640 sq.ft)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 block", children: "Square Meters (\u0935\u0930\u094D\u0917 \u092E\u0940\u091F\u0930)" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-slate-900 dark:text-white block mt-0.5", children: [
                  sqMeterVal,
                  " sq.m"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: "1 sq.m = 10.76 sq.ft" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-semibold text-slate-500 dark:text-slate-400 block", children: "Acre / Hectare" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-base font-black text-slate-900 dark:text-white block mt-0.5", children: [
                  acreVal,
                  " Acre"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400", children: "1 Acre = 43,560 sq.ft (20.1 Nali)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Building, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white", children: isHindi ? "\u0938\u0902\u092A\u0924\u094D\u0924\u093F \u0915\u0947 \u0938\u0902\u092A\u0942\u0930\u094D\u0923 \u0935\u093F\u0928\u093F\u0930\u094D\u0926\u0947\u0936 (Specifications & Profile)" : "Complete Property Specifications" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Property ID" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-mono font-bold text-slate-900 dark:text-white", children: property.id })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Property Type & Category" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "font-bold text-slate-900 dark:text-white", children: [
                  property.type,
                  " \u2022 ",
                  property.category
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Configuration" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: property.bedrooms > 0 ? `${property.bedrooms} BHK (${property.bathrooms} Bath)` : property.configuration || property.type })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Direction Facing" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: property.facing || "East / North-East (Vastu)" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Possession Status" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-emerald-700 dark:text-emerald-300", children: property.possession || "Ready to Move / Immediate Registry" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Legal / Title Status" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: property.reraStatus || "143 Converted Clear Freehold" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Furnishing Status" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: property.type === "Plot" || property.type === "Land" ? "Ready Plot for Construction" : "Semi-Furnished with Modular Kitchen" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Road Access & Width" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: "15-20 ft Paved All-Weather Motorable Road" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Water Supply" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: "24x7 Potable Mountain Spring / Municipal Supply" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Electricity & Power" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: "Connected UPCL Power Grid + Solar Backup Ready" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Dedicated Parking" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white", children: "Dedicated Car & Two-Wheeler Space" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Brokerage Commission" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-black text-emerald-700 dark:text-emerald-300 uppercase", children: "0% (Direct Owner Deal)" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MapPin, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white", children: isHindi ? "\u0938\u091F\u0940\u0915 \u0938\u094D\u0925\u093E\u0928 \u0935 \u0915\u0928\u0947\u0915\u094D\u091F\u093F\u0935\u093F\u091F\u0940 (Location & Distances)" : "Exact Location & Landmarks" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: handleOpenGoogleMaps,
                  className: "px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Navigation, { className: "w-3.5 h-3.5" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "Google Maps" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-[#07291f] text-white flex items-center justify-between gap-3 shadow-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.TreePine, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-bold text-teal-200 block uppercase tracking-wider", children: isHindi ? "\u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915 \u092A\u0930\u093F\u0935\u0947\u0936 \u0935 \u0939\u093F\u092E\u093E\u0932\u092F \u0926\u0943\u0936\u094D\u092F" : "Scenic Surroundings & Mountain View" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs sm:text-sm font-bold", children: property.himalayanPeakView ? property.peakName ? `Direct View of ${property.peakName}` : "Spectacular 360\xB0 Himalayan Snow Range View" : `${property.location || property.city}, Lush Green Valley & Himalayan Pine Surroundings` })
                ] })
              ] }),
              property.altitudeMsl && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full bg-black/40 border border-teal-300/30 text-xs font-mono font-bold text-teal-200 shrink-0", children: [
                "\u26F0\uFE0F ",
                property.altitudeMsl
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium block", children: "Exact Locality Address" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "font-bold text-slate-900 dark:text-white block mt-0.5", children: [
                  property.location || property.city,
                  ", Uttarakhand"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block", children: [
                  "Region: ",
                  property.region || (["Dehradun", "Mussoorie", "Rishikesh", "Haridwar"].includes(property.city) ? "Garhwal" : "Kumaon")
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium block", children: "City / Town" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "font-bold text-slate-900 dark:text-white block mt-0.5", children: [
                  property.city,
                  ", Uttarakhand"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-slate-500 dark:text-slate-400 mt-1 block", children: "Postal Code & Revenue Circle Verified" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium block", children: "\u2708\uFE0F Nearest Airport" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white block mt-0.5", children: airportInfo })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium block", children: "\u{1F686} Nearest Railway Station" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white block mt-0.5", children: railwayInfo })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium block", children: "\u{1F6E3}\uFE0F Highway & Road Access" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white block mt-0.5", children: "Direct all-weather paved motorable road connection" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-slate-500 dark:text-slate-400 font-medium block", children: "\u{1F3E5} Market, School & Hospitals" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-slate-900 dark:text-white block mt-0.5", children: "Local daily market & medical clinic within 5-10 mins" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.FileText, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white", children: isHindi ? "\u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u093F\u0935\u0930\u0923 (Full Description)" : "Comprehensive Description & Overview" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-[#051a13] p-4 sm:p-5 rounded-2xl border border-emerald-100/60 dark:border-emerald-900/40", children: property.description?.trim() ? property.description : isHindi ? `\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0915\u0947 \u0938\u0941\u0930\u092E\u094D\u092F \u0935\u093E\u0924\u093E\u0935\u0930\u0923 ${property.location || property.city} \u092E\u0947\u0902 \u0938\u094D\u0925\u093F\u0924 \u092F\u0939 \u092A\u094D\u0930\u092E\u0941\u0916 ${property.type} \u0938\u0940\u0927\u0947 \u092E\u093E\u0932\u093F\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u092C\u093F\u0928\u093E \u0915\u093F\u0938\u0940 \u092C\u094D\u0930\u094B\u0915\u0930\u0947\u091C (0% Brokerage) \u0915\u0947 \u0909\u092A\u0932\u092C\u094D\u0927 \u0939\u0948\u0964 \u0915\u0941\u0932 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u092B\u0932 ${property.areaSqFt.toLocaleString("en-IN")} \u0935\u0930\u094D\u0917 \u092B\u0941\u091F (\u0932\u0917\u092D\u0917 ${gajVal} \u0917\u091C / ${naliVal} \u0928\u093E\u0932\u0940) \u0939\u0948\u0964 \u0938\u094D\u092A\u0937\u094D\u091F \u092B\u094D\u0930\u0940\u0939\u094B\u0932\u094D\u0921 \u0935\u093F\u0927\u093F\u0915 \u0938\u094D\u0925\u093F\u0924\u093F (Clear Freehold Title) \u090F\u0935\u0902 \u0924\u0924\u094D\u0915\u093E\u0932 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0939\u0947\u0924\u0941 \u0924\u0948\u092F\u093E\u0930 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u0964 \u092A\u0915\u094D\u0915\u0940 \u0938\u0921\u093C\u0915, 24x7 \u091C\u0932 \u0906\u092A\u0942\u0930\u094D\u0924\u093F \u0935 \u092C\u093F\u091C\u0932\u0940 \u0915\u0928\u0947\u0915\u094D\u0936\u0928 \u091C\u0948\u0938\u0940 \u0938\u092E\u0938\u094D\u0924 \u092E\u0942\u0932\u092D\u0942\u0924 \u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0902 \u0909\u092A\u0932\u092C\u094D\u0927 \u0939\u0948\u0902\u0964` : `Situated in the picturesque hill location of ${property.location || property.city}, Uttarakhand, this prime ${property.type} is listed directly by the verified owner with 0% brokerage. Featuring a generous total area of ${property.areaSqFt.toLocaleString("en-IN")} sq.ft (approx. ${gajVal} Gaj / ${naliVal} Nali) with clear freehold ownership, complete revenue paperwork, and immediate mutation feasibility. All essential infrastructure including paved motor road access, municipal electricity, and continuous potable water are connected.` }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pt-1 space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block", children: isHindi ? "\u092E\u0941\u0916\u094D\u092F \u0935\u093F\u0936\u0947\u0937\u0924\u093E\u090F\u0902 (Key Highlights)" : "Property Highlights" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCheck, { className: "w-3.5 h-3.5 text-emerald-600" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0938\u0940\u0927\u0947 \u092E\u093E\u0932\u093F\u0915 \u0938\u0947 \u0938\u094C\u0926\u093E (0% \u092C\u094D\u0930\u094B\u0915\u0930\u0947\u091C)" : "0% Direct Owner Listing" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCheck, { className: "w-3.5 h-3.5 text-teal-600" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
                    property.location || property.city,
                    ", Uttarakhand"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCheck, { className: "w-3.5 h-3.5 text-amber-600" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: property.reraStatus || "Clear Title & Registry Ready" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCheck, { className: "w-3.5 h-3.5 text-cyan-600" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: property.facing ? `Facing: ${property.facing}` : "Sunny Mountain Orientation" })
                ] }),
                property.highlights && property.highlights.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCheck, { className: "w-3.5 h-3.5 text-emerald-500" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: h })
                ] }, i))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Sparkles, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white", children: isHindi ? "\u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0902 \u090F\u0935\u0902 \u0935\u093F\u0936\u0947\u0937\u0924\u093E\u090F\u0902 (Amenities & Infrastructure)" : "Amenities & Infrastructure Features" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: (safeAmenities.length > 0 ? safeAmenities : [
              isHindi ? "24x7 \u092E\u0940\u0920\u0947 \u092A\u0930\u094D\u0935\u0924\u0940\u092F \u092A\u093E\u0928\u0940 \u0915\u0940 \u0906\u092A\u0942\u0930\u094D\u0924\u093F" : "24x7 Potable Mountain Water Supply",
              isHindi ? "\u092C\u093F\u091C\u0932\u0940 \u0935 \u092A\u093E\u0935\u0930 \u0917\u094D\u0930\u093F\u0921 \u0915\u0928\u0947\u0915\u094D\u0936\u0928" : "Electricity & Power Grid Connection",
              isHindi ? "\u092A\u0915\u094D\u0915\u0940 \u092E\u094B\u091F\u0930 \u0938\u0921\u093C\u0915 \u092A\u0939\u0941\u0902\u091A" : "Paved All-Weather Motorable Road",
              isHindi ? "\u0938\u094D\u092A\u0937\u094D\u091F \u092B\u094D\u0930\u0940\u0939\u094B\u0932\u094D\u0921 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0935 \u0926\u093E\u0916\u093F\u0932 \u0916\u093E\u0930\u093F\u091C" : "Clear Freehold Registry & Mutation",
              isHindi ? "\u0938\u092E\u0930\u094D\u092A\u093F\u0924 \u0915\u093E\u0930 \u092A\u093E\u0930\u094D\u0915\u093F\u0902\u0917 \u0938\u094D\u0925\u0932" : "Dedicated Vehicle Parking Space",
              isHindi ? "\u0936\u093E\u0902\u0924 \u0935 \u092A\u094D\u0930\u0926\u0942\u0937\u0923 \u092E\u0941\u0915\u094D\u0924 \u0935\u093E\u0924\u093E\u0935\u0930\u0923" : "Peaceful Clean Mountain Air Zone",
              isHindi ? "0% \u092C\u094D\u0930\u094B\u0915\u0930\u0947\u091C \u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0938\u094C\u0926\u093E" : "Zero Brokerage Direct Owner Deal",
              isHindi ? "\u092A\u0930\u094D\u0935\u0924\u0940\u092F \u0935 \u0918\u093E\u091F\u0940 \u0915\u093E \u0938\u0941\u0902\u0926\u0930 \u0926\u0943\u0936\u094D\u092F" : "Panoramic Valley & Mountain View"
            ]).map((amenity, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "div",
              {
                className: "p-3 sm:p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-3",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.CheckCircle2, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200", children: amenity })
                ]
              },
              idx
            )) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-5", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Calculator, { className: "w-5 h-5 text-emerald-600 dark:text-emerald-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-base sm:text-lg font-bold text-slate-900 dark:text-white", children: isHindi ? "\u090B\u0923 \u0935 \u092E\u093E\u0938\u093F\u0915 \u0915\u093F\u0938\u094D\u0924 \u0915\u0948\u0932\u0915\u0941\u0932\u0947\u091F\u0930 (EMI Calculator)" : "Mortgage & Monthly EMI Calculator" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300", children: [
                "\u20B9",
                priceNum.toLocaleString("en-IN")
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-semibold text-slate-600 dark:text-slate-300", children: "Down Payment" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "font-bold text-emerald-600", children: [
                    downPaymentPercent,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "input",
                  {
                    type: "range",
                    min: 10,
                    max: 50,
                    step: 5,
                    value: downPaymentPercent,
                    onChange: (e) => setDownPaymentPercent(Number(e.target.value)),
                    className: "w-full accent-emerald-600 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[10px] text-slate-500 block", children: [
                  "\u20B9",
                  Math.round(priceNum * downPaymentPercent / 100).toLocaleString("en-IN")
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-semibold text-slate-600 dark:text-slate-300", children: "Loan Tenure" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "font-bold text-emerald-600", children: [
                    loanTenureYears,
                    " Years"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "input",
                  {
                    type: "range",
                    min: 5,
                    max: 30,
                    step: 1,
                    value: loanTenureYears,
                    onChange: (e) => setLoanTenureYears(Number(e.target.value)),
                    className: "w-full accent-emerald-600 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[10px] text-slate-500 block", children: [
                  totalMonths,
                  " monthly installments"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#051a13] border border-emerald-100/60 dark:border-emerald-900/40", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-semibold text-slate-600 dark:text-slate-300", children: "Interest Rate" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "font-bold text-emerald-600", children: [
                    interestRate,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "input",
                  {
                    type: "range",
                    min: 7,
                    max: 12,
                    step: 0.1,
                    value: interestRate,
                    onChange: (e) => setInterestRate(Number(e.target.value)),
                    className: "w-full accent-emerald-600 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 block", children: "Nationalized Bank Home Loan" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#082b1f] dark:to-[#052117] border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-slate-600 dark:text-emerald-300 block font-medium", children: isHindi ? "\u0905\u0928\u0941\u092E\u093E\u0928\u093F\u0924 \u092E\u093E\u0938\u093F\u0915 \u0915\u093F\u0938\u094D\u0924 (Monthly EMI)" : "Estimated Monthly EMI" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-300", children: [
                  "\u20B9",
                  calculatedEmi.toLocaleString("en-IN"),
                  " ",
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs font-normal", children: "/ month" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => onOpenEmiCalculator?.(priceNum),
                  className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs",
                  children: isHindi ? "\u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u092C\u094D\u0930\u0947\u0915\u0905\u092A" : "Full Amortization"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs text-amber-900 dark:text-amber-200", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.AlertTriangle, { className: "w-4 h-4 shrink-0 text-amber-600" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u0930\u091C\u093F\u0938\u094D\u091F\u094D\u0930\u0940 \u0935 \u092D\u0942-\u0915\u093E\u0928\u0942\u0928 \u0905\u0928\u0941\u092A\u093E\u0932\u0928" : "Uttarakhand Land Law & Title Verification" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "leading-relaxed", children: isHindi ? "\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921 \u092E\u0947\u0902 \u0917\u094D\u0930\u093E\u092E\u0940\u0923 \u0915\u0943\u0937\u093F \u092D\u0942\u092E\u093F \u0939\u0947\u0924\u0941 \u0917\u0948\u0930-\u092E\u0942\u0932 \u0928\u093F\u0935\u093E\u0938\u093F\u092F\u094B\u0902 \u0915\u0940 \u0938\u0940\u092E\u093E \u0968\u096B\u0966 \u0935\u0930\u094D\u0917 \u092E\u0940\u091F\u0930 \u0928\u093F\u0930\u094D\u0927\u093E\u0930\u093F\u0924 \u0939\u0948\u0964 \u0927\u093E\u0930\u093E \u0967\u096A\u0969 (\u0906\u092C\u093E\u0926\u0940) \u092A\u0930\u093F\u0935\u0930\u094D\u0924\u093F\u0924 \u0938\u0902\u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902 \u092B\u094D\u0930\u0940\u0939\u094B\u0932\u094D\u0921 \u0930\u0942\u092A \u0938\u0947 \u0938\u0940\u0927\u0947 \u092A\u0902\u091C\u0940\u0915\u0943\u0924 \u0939\u094B\u0924\u0940 \u0939\u0948\u0902\u0964 \u0938\u094C\u0926\u0947 \u0938\u0947 \u092A\u0942\u0930\u094D\u0935 \u0909\u092A-\u0928\u093F\u092C\u0902\u0927\u0915 \u0915\u093E\u0930\u094D\u092F\u093E\u0932\u092F \u092E\u0947\u0902 \u0967\u0968 \u0935\u0930\u094D\u0937\u0940\u092F \u092D\u093E\u0930-\u092E\u0941\u0915\u094D\u0924 (Non-Encumbrance) \u091C\u093E\u0902\u091A \u0905\u0928\u093F\u0935\u093E\u0930\u094D\u092F \u0939\u0948\u0964" : "For non-domiciles of Uttarakhand, unconverted agricultural land is subject to the statutory 250 sq. meter ceiling. Section 143 converted residential properties can be registered with clear title. Independent revenue check is recommended." }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                onClick: () => onOpenLegalPolicy?.("disclaimer"),
                className: "text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer pt-1 block",
                children: isHindi ? "\u0935\u093F\u0927\u093F\u0915 \u0905\u0938\u094D\u0935\u0940\u0915\u0930\u0923 \u0935 \u0928\u0940\u0924\u093F\u092F\u093E\u0902 \u092A\u0922\u093C\u0947\u0902 \u2192" : "Read Legal Due Diligence Notice \u2192"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "lg:col-span-1 space-y-6 lg:sticky lg:top-24", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#072118] border-2 border-emerald-300 dark:border-emerald-700 shadow-xl space-y-5", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm", children: sellerDisplayName.charAt(0).toUpperCase() }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-slate-500 dark:text-slate-400 block font-medium", children: isHindi ? "\u0938\u0940\u0927\u0947 \u0938\u0902\u092A\u0924\u094D\u0924\u093F \u0935\u093F\u0915\u094D\u0930\u0947\u0924\u093E" : "Direct Property Seller" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { className: "text-sm font-bold text-slate-900 dark:text-white", children: sellerDisplayName })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase", children: "Verified" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "text-center py-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-slate-500 dark:text-slate-400 block", children: isHindi ? "\u092A\u094D\u0930\u0924\u094D\u092F\u0915\u094D\u0937 \u0938\u094C\u0926\u093E \u092E\u0942\u0932\u094D\u092F" : "Direct Deal Price" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-3xl font-black text-emerald-800 dark:text-emerald-300", children: formatLocalizedPrice(property.priceDisplay || `\u20B9${priceNum.toLocaleString("en-IN")}`, isHindi ? "hi" : "en") }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5", children: "\u26A1 0% Brokerage \u2022 Direct to Owner" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-2.5", children: [
            isPhoneApproved && approvedPhoneNumber ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Unlock, { className: "w-3.5 h-3.5 text-emerald-600" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u092B\u093C\u094B\u0928 \u0928\u0902\u092C\u0930 \u0905\u0928\u092C\u094D\u0932\u0949\u0915" : "Verified Phone Unlocked" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full", children: "Approved" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-lg font-black text-emerald-950 dark:text-white tracking-wide text-center", children: approvedPhoneNumber }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                  "a",
                  {
                    href: `tel:${approvedPhoneNumber}`,
                    className: "py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Phone, { className: "w-3.5 h-3.5" }),
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "Call" })
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                  "a",
                  {
                    href: `https://wa.me/91${approvedPhoneNumber.replace(/\D/g, "")}?text=Hello, I am interested in your property on Uttarakhand Gateways: ${property.title}`,
                    target: "_blank",
                    rel: "noreferrer",
                    className: "py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MessageSquare, { className: "w-3.5 h-3.5" }),
                      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "WhatsApp" })
                    ]
                  }
                )
              ] })
            ] }) : isPhonePending ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center space-y-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Clock, { className: "w-3.5 h-3.5 text-amber-600" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0905\u0928\u0941\u0930\u094B\u0927 \u092D\u0947\u091C\u093E \u0917\u092F\u093E" : "Phone Request Pending" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-[11px] text-amber-700 dark:text-amber-400", children: isHindi ? "\u092E\u093E\u0932\u093F\u0915 \u0926\u094D\u0935\u093E\u0930\u093E \u0907\u0928\u092C\u0949\u0915\u094D\u0938 \u092E\u0947\u0902 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u093F\u0932\u0924\u0947 \u0939\u0940 \u0928\u0902\u092C\u0930 \u0926\u093F\u0916\u0947\u0917\u093E\u0964" : "Owner has been notified in their Inbox. Number will unlock once approved." })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (!currentUser) {
                    openAuthModal("login", isHindi ? "\u092E\u093E\u0932\u093F\u0915 \u0915\u093E \u092B\u093C\u094B\u0928 \u0928\u0902\u092C\u0930 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0928\u0947 \u0939\u0947\u0924\u0941 \u0932\u0949\u0917\u093F\u0928 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" : "Please log in to request owner phone number.", () => {
                      onRequestPhoneNumber?.(property);
                    });
                    return;
                  }
                  onRequestPhoneNumber?.(property);
                },
                className: "w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Lock, { className: "w-4 h-4 text-emerald-600" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u092E\u093E\u0932\u093F\u0915 \u0915\u093E \u0928\u0902\u092C\u0930 \u092E\u093E\u0902\u0917\u0947\u0902 (\u0905\u0928\u0941\u0930\u094B\u0927)" : "Request Owner Phone Number" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (!currentUser) {
                    openAuthModal("login", isHindi ? "\u092E\u093E\u0932\u093F\u0915 \u0938\u0947 \u0938\u0940\u0927\u0947 \u0907\u0928\u092C\u0949\u0915\u094D\u0938 \u091A\u0948\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0939\u0947\u0924\u0941 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" : "Please log in to chat with property owner.", () => {
                      onStartChat?.(property);
                    });
                    return;
                  }
                  onStartChat?.(property);
                },
                className: "w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MessageSquare, { className: "w-4 h-4" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u092E\u093E\u0932\u093F\u0915 \u0938\u0947 \u0938\u0940\u0927\u0947 \u091A\u0948\u091F \u0915\u0930\u0947\u0902" : "Chat Directly with Owner" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              "button",
              {
                type: "button",
                onClick: handleShareWhatsApp,
                className: "w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/10 hover:shadow-lg active:scale-95 cursor-pointer",
                title: isHindi ? "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A \u092A\u0930 \u0936\u0947\u092F\u0930 \u0915\u0930\u0947\u0902" : "Share on WhatsApp",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className: "w-4 h-4 fill-current shrink-0", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A \u092A\u0930 \u0936\u0947\u092F\u0930 \u0915\u0930\u0947\u0902 (WhatsApp)" : "Share on WhatsApp" })
                ]
              }
            )
          ] }),
          (isOwner || isAmitTyagi) && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pt-3 border-t border-emerald-100 dark:border-emerald-900/60 space-y-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider", children: isAmitTyagi && !isOwner ? "Platform Admin Controls" : "Your Listing Options" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
                "button",
                {
                  type: "button",
                  onClick: () => setShowOwnerMenu((prev) => !prev),
                  className: "p-1.5 px-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#071f16] hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95",
                  title: isHindi ? "\u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0935\u093F\u0915\u0932\u094D\u092A" : "More Options",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MoreVertical, { className: "w-4 h-4 text-emerald-700 dark:text-emerald-400" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[11px]", children: isHindi ? "\u0935\u093F\u0915\u0932\u094D\u092A" : "Options" })
                  ]
                }
              )
            ] }),
            showDeleteConfirm && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-xs space-y-2.5 animate-in fade-in", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-rose-800 dark:text-rose-200 font-semibold", children: isHindi ? "\u0915\u094D\u092F\u093E \u0906\u092A \u0935\u093E\u0915\u0908 \u0907\u0938 \u0932\u093F\u0938\u094D\u091F\u093F\u0902\u0917 \u0915\u094B \u0939\u091F\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?" : "Are you sure you want to permanently delete this listing?" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => onDeleteProperty?.(property.id),
                    className: "flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer",
                    children: isHindi ? "\u0939\u091F\u093E\u090F\u0902" : "Delete"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowDeleteConfirm(false),
                    className: "px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer",
                    children: isHindi ? "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902" : "Cancel"
                  }
                )
              ] })
            ] })
          ] }),
          !currentUser && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pt-3 border-t border-emerald-100 dark:border-emerald-900/60 text-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              onClick: () => openAuthModal("login", isHindi ? "\u0905\u092A\u0928\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" : "Log in to edit or manage your property listing."),
              className: "text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.Edit3, { className: "w-3 h-3" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0915\u094D\u092F\u093E \u0906\u092A \u0907\u0938\u0915\u0947 \u092E\u093E\u0932\u093F\u0915 \u0939\u0948\u0902? \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0928\u0947 \u0939\u0947\u0924\u0941 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902" : "Are you the owner? Sign in to edit" })
              ]
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "pt-2 border-t border-emerald-100 dark:border-emerald-900/60", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              type: "button",
              onClick: onBack,
              className: "w-full py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ArrowLeft, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0938\u092D\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u092A\u0930 \u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902" : "Return to All Properties" })
              ]
            }
          ) })
        ] }) })
      ] }),
      similarProps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pt-8 border-t border-emerald-200/80 dark:border-emerald-900/60 space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-serif-luxury", children: isHindi ? "\u0938\u092E\u093E\u0928 \u0938\u0902\u092A\u0924\u094D\u0924\u093F\u092F\u093E\u0902 (\u0909\u0924\u094D\u0924\u0930\u093E\u0916\u0902\u0921)" : `More Properties in ${property.city}` }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              onClick: onBack,
              className: "text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer",
              children: isHindi ? "\u0938\u092D\u0940 \u0926\u0947\u0916\u0947\u0902 \u2192" : "View All Properties \u2192"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: similarProps.map((simProp) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "div",
          {
            onClick: () => onSelectProperty?.(simProp),
            className: "p-3.5 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 group",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "img",
                {
                  src: simProp.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                  alt: simProp.title,
                  className: "w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "space-y-1 min-w-0 flex-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] font-bold text-emerald-600 uppercase", children: simProp.type }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h5", { className: "text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors", children: simProp.title }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs font-black text-emerald-800 dark:text-emerald-300 block", children: formatLocalizedPrice(simProp.priceDisplay, isHindi ? "hi" : "en") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-[11px] text-slate-500 truncate block", children: [
                  simProp.city,
                  " \u2022 ",
                  simProp.areaSqFt,
                  " sq.ft"
                ] })
              ] })
            ]
          },
          simProp.id
        )) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "pt-8 pb-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-emerald-200/80 dark:border-emerald-900/60", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: onBack,
            className: "w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ArrowLeft, { className: "w-5 h-5 text-white" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0938\u092D\u0940 \u092A\u094D\u0930\u0949\u092A\u0930\u094D\u091F\u0940\u091C \u092A\u0930 \u0935\u093E\u092A\u0938 \u0932\u094C\u091F\u0947\u0902" : "Return to All Properties" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: handleShareWhatsApp,
            className: "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className: "w-5 h-5 fill-current shrink-0", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A \u092A\u0930 \u0936\u0947\u092F\u0930 \u0915\u0930\u0947\u0902 (WhatsApp)" : "Share on WhatsApp" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071f16]/95 border-t border-emerald-300 dark:border-emerald-800 p-2.5 sm:hidden flex items-center justify-between gap-2 shadow-2xl backdrop-blur-xl", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "min-w-0 pr-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-slate-500 dark:text-slate-400 block font-semibold truncate leading-none", children: isForRent ? "Rent/mo" : "Asking Price" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-base font-black text-emerald-800 dark:text-emerald-300 block truncate leading-tight", children: formatLocalizedPrice(property.priceDisplay || `\u20B9${priceNum.toLocaleString("en-IN")}`, isHindi ? "hi" : "en") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase", children: "0% Brokerage" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center gap-1.5 shrink-0", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => {
              if (!currentUser) {
                openAuthModal("login", isHindi ? "\u092E\u093E\u0932\u093F\u0915 \u0938\u0947 \u0938\u0940\u0927\u0947 \u0907\u0928\u092C\u0949\u0915\u094D\u0938 \u091A\u0948\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0928\u0947 \u0939\u0947\u0924\u0941 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" : "Please log in to chat with property owner.", () => {
                  onStartChat?.(property);
                });
                return;
              }
              onStartChat?.(property);
            },
            className: "px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-md active:scale-95 cursor-pointer",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.MessageSquare, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: isHindi ? "\u091A\u0948\u091F" : "Chat" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            type: "button",
            onClick: handleShareWhatsApp,
            className: "p-2 px-2.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 cursor-pointer",
            title: "WhatsApp",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className: "w-4 h-4 fill-current shrink-0", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: "WA" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "button",
          {
            type: "button",
            onClick: onBack,
            className: "p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 active:scale-95 cursor-pointer",
            title: "Return",
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ArrowLeft, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    isLightboxOpen && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        className: "fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-4",
        onClick: () => setIsLightboxOpen(false),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between text-white shrink-0 z-10", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "text-xs sm:text-sm font-semibold truncate max-w-[80%]", children: [
              property.title,
              " \u2022 ",
              activeImgIdx + 1,
              " / ",
              safeImages.length
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                type: "button",
                onClick: () => setIsLightboxOpen(false),
                className: "p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer",
                children: "\u2715"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex-1 flex items-center justify-center p-2 sm:p-4 relative", onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "img",
              {
                src: safeImages[activeImgIdx],
                alt: `Fullscreen ${activeImgIdx + 1}`,
                className: "max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              }
            ),
            safeImages.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => setActiveImgIdx((prev) => prev === 0 ? safeImages.length - 1 : prev - 1),
                  className: "absolute left-2 sm:left-4 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer active:scale-90",
                  children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronLeft, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "button",
                {
                  type: "button",
                  onClick: () => setActiveImgIdx((prev) => prev === safeImages.length - 1 ? 0 : prev + 1),
                  className: "absolute right-2 sm:right-4 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer active:scale-90",
                  children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react.ChevronRight, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "overflow-x-auto py-2 flex items-center justify-center gap-2 shrink-0 no-scrollbar", onClick: (e) => e.stopPropagation(), children: safeImages.map((img, idx) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "button",
            {
              type: "button",
              onClick: () => setActiveImgIdx(idx),
              className: `w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 ${activeImgIdx === idx ? "border-emerald-400 scale-105" : "border-transparent opacity-60"}`,
              children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: img, alt: `thumb ${idx}`, className: "w-full h-full object-cover" })
            },
            idx
          )) })
        ]
      }
    )
  ] });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PropertyDetailPage
});
