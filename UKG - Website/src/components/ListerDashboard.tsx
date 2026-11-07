import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Plus, 
  Edit3, 
  Tag, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  PhoneCall,
  Search
} from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { isPropertyOwner } from '../utils/propertyOwnership';
import { formatLocalizedPrice } from '../utils/language';
import { resolveApiUrl } from '../config/apiConfig';
import { formatPostTime } from '../utils/timeAgo';
import { DeletePropertyConfirmModal } from './DeletePropertyConfirmModal';

interface ListerDashboardProps {
  properties: Property[];
  onBackToMain: () => void;
  onSelectProperty: (property: Property) => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onToggleSold: (propertyId: string) => void;
  onOpenListChooser: () => void;
}

export const ListerDashboard: React.FC<ListerDashboardProps> = ({
  properties,
  onBackToMain,
  onSelectProperty,
  onEditProperty,
  onDeleteProperty,
  onToggleSold,
  onOpenListChooser,
}) => {
  const { currentUser } = useAuth();
  const { isHindi } = useLanguage();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'sold' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPropId, setCopiedPropId] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter properties belonging to current user
  const myProperties = useMemo(() => {
    return properties.filter((p) => isPropertyOwner(p, currentUser));
  }, [properties, currentUser]);

  // Aggregate real verified metrics
  const totalViews = useMemo(() => {
    return myProperties.reduce((sum, p) => sum + (p.views || 0), 0);
  }, [myProperties]);

  const totalInquiries = useMemo(() => {
    return myProperties.reduce((sum, p) => sum + (p.inquiries || 0), 0);
  }, [myProperties]);

  const totalShares = useMemo(() => {
    return myProperties.reduce((sum, p) => sum + (p.shares || 0), 0);
  }, [myProperties]);

  const totalSaves = useMemo(() => {
    return myProperties.reduce((sum, p) => sum + ((p as any).saves || 0), 0);
  }, [myProperties]);

  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0';

  // Share Property handler
  const handleShareProperty = async (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?property=${prop.id}`;
    const shareText = isHindi 
      ? `🏡 उत्तराखंड में यह प्रॉपर्टी देखें: ${prop.title} (${prop.priceDisplay}) - ${prop.city}: ${url}`
      : `🏡 Check out this verified property in Uttarakhand: ${prop.title} (${prop.priceDisplay}) - ${prop.city}: ${url}`;

    // Increment share count via API
    try {
      fetch(resolveApiUrl(`/api/properties/${encodeURIComponent(prop.id)}/share`), { method: 'POST' }).catch(() => {});
    } catch {}

    if (navigator.share) {
      try {
        await navigator.share({
          title: prop.title,
          text: shareText,
          url,
        });
        return;
      } catch {}
    }

    // Fallback: Copy to clipboard & open WhatsApp
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPropId(prop.id);
      setTimeout(() => setCopiedPropId(null), 3000);
    } catch {}

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const filteredList = useMemo(() => {
    let list = myProperties;
    if (activeTab === 'active') list = myProperties.filter((p) => !p.isSold);
    else if (activeTab === 'sold') list = myProperties.filter((p) => p.isSold);
    else if (activeTab === 'pending') list = myProperties.filter((p) => (p as any).status === 'pending');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => 
        p.title.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.type && p.type.toLowerCase().includes(q))
      );
    }
    return list;
  }, [myProperties, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 dark:from-[#061811] dark:via-[#092218] dark:to-[#061811] text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#071d15]/90 backdrop-blur-md border-b border-emerald-200/80 dark:border-emerald-900/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMain}
              className="p-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#0b291d] hover:bg-slate-100 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isHindi ? 'मार्केटप्लेस' : 'Marketplace'}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-700/25">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>{isHindi ? 'प्रॉपर्टी ग्रोथ डैशबोर्ड' : 'Lister Growth Dashboard'}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-emerald-300/80">
                  {currentUser?.username ? `${currentUser.username} (${currentUser.contact})` : (isHindi ? 'आपका लिस्टिंग परफॉर्मेंस' : 'Your Listing Analytics')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenListChooser}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? '+ नई प्रॉपर्टी जोड़ें' : '+ List New Property'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Notice Banner if 0 properties */}
        {myProperties.length === 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'अभी तक कोई प्रॉपर्टी लिस्ट नहीं की गई' : 'No Properties Listed Yet'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {isHindi 
                    ? 'अपनी पहली प्रॉपर्टी मुफ्त लिस्ट करें। जैसे ही खरीदार आपके विज्ञापन देखेंगे, यहां लाइव एनालिटिक्स दिखाई देगा।' 
                    : 'List your first property for free. Once buyers view and inquire about your listings, live analytics will update here.'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenListChooser}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {isHindi ? 'प्रॉपर्टी मुफ्त लिस्ट करें' : 'Post Free Listing'}
            </button>
          </div>
        )}

        {/* 1. TOP GROWTH METRICS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {/* Total Views */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{isHindi ? 'कुल विज्ञापन व्यूज' : 'Total Views'}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'सत्यापित ऑर्गेनिक व्यूज' : 'Verified organic views'}</span>
            </div>
          </div>

          {/* Buyer Inquiries */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{isHindi ? 'खरीदार बातचीत' : 'Buyer Inquiries'}</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalInquiries.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-2">
              <Flame className="w-3.5 h-3.5" />
              <span>{isHindi ? 'सक्रिय खरीदार' : 'High intent buyers'}</span>
            </div>
          </div>

          {/* WhatsApp & Social Shares */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{isHindi ? 'शेयर संख्या' : 'Total Shares'}</span>
              <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalShares.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 dark:text-green-400 mt-2">
              <span>📲 WhatsApp & Web</span>
            </div>
          </div>

          {/* Saved / Bookmarked */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{isHindi ? 'सहेजी गई' : 'Saved / Favs'}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalSaves.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'शॉर्टलिस्टेड' : 'Shortlisted buyers'}</span>
            </div>
          </div>

          {/* Lead Conversion Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs hover:shadow-md transition-all col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{isHindi ? 'कन्वर्जन दर' : 'Lead Rate'}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {conversionRate}%
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-2">
              {isHindi ? 'व्यू-से-पूछताछ अनुपात' : 'View to inquiry ratio'}
            </div>
          </div>
        </div>

        {/* 2. REAL ENGAGEMENT SUMMARY (Only when traffic exists) */}
        {totalViews > 0 && (
          <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'लाइव ऑडियंस पहुंच' : 'Live Audience Reach'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'आपकी लिस्टिंग पर वास्तविक खरीदार व्यूज व संपर्क' : 'Verified organic impressions & buyer chats on your published properties'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                <span>● 100% {isHindi ? 'वास्तविक डाटा' : 'Real-time Live Data'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. YOUR LISTINGS GROWTH BREAKDOWN */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'आपकी संपत्तियों का व्यक्तिगत प्रदर्शन' : 'Your Listed Properties & Growth'}</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  {myProperties.length}
                </span>
              </h3>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? 'लिस्टिंग खोजें...' : 'Search listings...'}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-[#071f16] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-48 transition-all"
                />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-xs font-bold overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'all' 
                      ? 'bg-white dark:bg-[#071f16] text-emerald-700 dark:text-emerald-300 shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? 'सभी' : 'All'} ({myProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'active' 
                      ? 'bg-white dark:bg-[#071f16] text-emerald-700 dark:text-emerald-300 shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? 'सक्रिय' : 'Active'} ({myProperties.filter((p) => !p.isSold).length})
                </button>
                <button
                  onClick={() => setActiveTab('sold')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'sold' 
                      ? 'bg-white dark:bg-[#071f16] text-emerald-700 dark:text-emerald-300 shadow-2xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? 'बिक चुकी' : 'Sold'} ({myProperties.filter((p) => p.isSold).length})
                </button>
              </div>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#071f16] border border-dashed border-slate-300 dark:border-emerald-800/80 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                  {isHindi ? 'कोई लिस्टिंग नहीं मिली' : 'No properties found in this view'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {isHindi ? 'उत्तराखंड में अपनी जमीन, विला, प्लॉट या रेंटल को 0% ब्रोकरेज पर लिस्ट करें!' : 'List your mountain cottage, plot, villa or rental to start tracking buyer growth.'}
                </p>
              </div>
              <button
                onClick={onOpenListChooser}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md cursor-pointer inline-flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isHindi ? 'नई प्रॉपर्टी जोड़ें' : 'Post Free Listing'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredList.map((prop) => {
                const propViews = prop.views || 0;
                const propInquiries = prop.inquiries || 0;
                const propShares = prop.shares || 0;

                return (
                  <div
                    key={prop.id}
                    onClick={() => onSelectProperty(prop)}
                    className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#071f16] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 cursor-pointer group"
                  >
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                        <img
                          src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80'}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prop.isSold && (
                          <div className="absolute inset-0 bg-rose-950/80 text-rose-300 flex items-center justify-center font-black text-[10px] uppercase tracking-wider">
                            SOLD
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            prop.isSold 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/90 dark:text-rose-300' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300'
                          }`}>
                            {prop.isSold ? (isHindi ? 'बिक चुकी' : 'Sold') : (isHindi ? 'लाइव व सक्रिय' : 'Active Live')}
                          </span>

                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            (prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent)
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/90 dark:text-teal-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-300'
                          }`}>
                            {(prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent) ? (isHindi ? 'किराया' : 'Rent') : (isHindi ? 'बिक्री' : 'Sell')}
                          </span>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {prop.type}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                          {prop.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{prop.location || prop.city}</span>
                          </span>
                          <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
                            {formatLocalizedPrice(prop.priceDisplay || `₹${prop.price}`, isHindi ? 'hi' : 'en')}
                          </span>
                          {prop.areaDisplay && (
                            <span className="flex items-center gap-1">
                              <Maximize2 className="w-3 h-3 text-slate-400" />
                              <span>{prop.areaDisplay}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Live Growth Metrics Pills */}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-[#0a271c] border border-slate-200/80 dark:border-emerald-900/60 shrink-0 justify-around sm:justify-start">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{isHindi ? 'व्यूज' : 'Views'}</span>
                        </div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {propViews}
                        </div>
                      </div>

                      <div className="w-px h-8 bg-slate-200 dark:bg-emerald-900/60" />

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{isHindi ? 'चैट' : 'Chats'}</span>
                        </div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {propInquiries}
                        </div>
                      </div>

                      <div className="w-px h-8 bg-slate-200 dark:bg-emerald-900/60" />

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          <Share2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          <span>{isHindi ? 'शेयर' : 'Shares'}</span>
                        </div>
                        <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                          {propShares}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectProperty(prop)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title={isHindi ? 'लिस्टिंग देखें' : 'View Listing'}
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden sm:inline">{isHindi ? 'देखें' : 'View'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShareProperty(e, prop)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/50 hover:bg-green-100 text-green-800 dark:text-green-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title={copiedPropId === prop.id ? 'Link Copied!' : (isHindi ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp')}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{copiedPropId === prop.id ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'शेयर' : 'Share')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditProperty(prop)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title={isHindi ? 'संपादित करें' : 'Edit Listing'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isHindi ? 'एडिट' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleSold(prop.id)}
                        className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          prop.isSold 
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                            : 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                        }`}
                        title={prop.isSold ? (isHindi ? 'उपलब्ध मार्क करें' : 'Mark Available') : (isHindi ? 'बिक चुका मार्क करें' : 'Mark as Sold')}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{prop.isSold ? (isHindi ? 'उपलब्ध' : 'Available') : (isHindi ? 'बिक गया' : 'Sold')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPropertyToDelete(prop)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title={isHindi ? 'हटाएं' : 'Delete Listing'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. EXPERT GROWTH TIPS TO OUTPERFORM MAGICBRICKS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-[#062015] text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              💡
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                {isHindi ? 'उत्तराखंड में अपनी प्रॉपर्टी पर 3x अधिक खरीदार कैसे पाएं?' : 'How to Get 3x More Mountain Buyers (Growth Playbook)'}
              </h3>
              <p className="text-xs text-emerald-200/90">
                {isHindi ? 'मैजिकब्रिक्स जैसी राष्ट्रीय वेबसाइटों से आगे रहने के लिए स्थानीय टिप्स' : 'Actionable tips to rank higher and attract genuine NCR & hill investors'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>{isHindi ? '1. स्पष्ट स्थान व लाभ बताएं' : '1. Clear Location Advantage'}</span>
              </div>
              <p className="text-[11px] text-emerald-100 leading-relaxed">
                {isHindi 
                  ? 'उत्तराखंड में खरीदार प्रमुख स्थानों व प्राकृतिक नजारों को महत्व देते हैं। सटीक लोकेशन का उल्लेख लिस्टिंग के व्यूज को दोगुना करता है।' 
                  : 'In Uttarakhand hills, highlighting proximity to major spots and scenic mountain views immediately drives buyer confidence.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{isHindi ? '2. स्वामित्व व सत्यापन विवरण' : '2. Clear Ownership Details'}</span>
              </div>
              <p className="text-[11px] text-emerald-100 leading-relaxed">
                {isHindi 
                  ? 'खरीदार स्पष्ट व सत्यापित प्रॉपर्टी को प्राथमिकता देते हैं। सही क्षेत्रफल और स्पष्ट विवरण प्रदान करने से डील जल्दी फाइनल होती है।' 
                  : 'Buyers prioritize verified, transparent property listings. Providing accurate area dimensions and clear documentation accelerates deal closing.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? '3. AI से विवरण सुधारें' : '3. AI Listing Polish'}</span>
              </div>
              <p className="text-[11px] text-emerald-100 leading-relaxed">
                {isHindi 
                  ? 'हमारी मुफ्त AI तकनीक का उपयोग करें जो आपके विवरण को आकर्षक बिंदुओं, 0% ब्रोकरेज बैज और मुख्य सुविधाओं के साथ तैयार करती है।' 
                  : 'Use our free 1-click AI enhancer to format your listing with crystal-clear bullet points and verified mountain highlights.'}
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Delete Property Confirmation Modal */}
        {propertyToDelete && (
          <DeletePropertyConfirmModal
            isOpen={Boolean(propertyToDelete)}
            onClose={() => setPropertyToDelete(null)}
            property={propertyToDelete}
            isDeleting={isDeleting}
            onConfirmDelete={async (id) => {
              setIsDeleting(true);
              try {
                await onDeleteProperty(id);
                setPropertyToDelete(null);
              } finally {
                setIsDeleting(false);
              }
            }}
          />
        )}

      </main>
    </div>
  );
};
