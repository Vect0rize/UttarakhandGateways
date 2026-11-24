import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  MapPin,
  Lock,
  Search,
  MessageCircle,
  PhoneCall,
  Sun,
  Moon,
  Home,
  Menu,
  X,
  Globe,
  Calculator,
  LogOut,
  Trash2,
} from 'lucide-react';
import { ChatThread, Property } from '../types';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';
import {
  formatPhoneForDisplay,
  getTelHref,
  getWhatsAppContactUrl,
  maskPublicOwnerName,
} from '../utils/propertyOwnership';
import { isSyntheticFakeProperty } from '../data/properties';

interface InboxPageProps {
  onBackToMarketplace?: () => void;
  onNavigatePage?: (page: AppPageRouteKey) => void;
  onNavigateCity?: (city: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({
  onBackToMarketplace,
  onNavigatePage,
  onNavigateCity,
}) => {
  const { currentUser, openAuthModal, logout, deleteAccount } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [inputText, setInputText] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  const [allProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_uploaded_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p: Property) => p.id && !isSyntheticFakeProperty(p));
        }
      }
    } catch {}
    return [];
  });

  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((tItem: any) => !tItem.id.startsWith('thread-prop-'));
        }
      }
    } catch {}
    return [];
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('propertyId');
      if (propId) return `thread-${propId}`;
    } catch {}
    return null;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uk_gateways_chat_threads' && e.newValue) {
        try {
          setChatThreads(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'uk_gateways_theme' && e.newValue) {
        if (e.newValue === 'light' || e.newValue === 'dark') {
          setTheme(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('uk_gateways_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_chat_threads', JSON.stringify(chatThreads));
    } catch {}
  }, [chatThreads]);

  useEffect(() => {
    document.title = 'Messages & Inquiries | Uttarakhand Gateways';
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentThread = chatThreads.find((tItem) => tItem.id === activeThreadId) || chatThreads[0] || null;

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText.trim();
    if (!textToSend || !currentThread) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'buyer' as const,
      senderName: 'You',
      text: textToSend,
      timestamp: nowTime,
    };

    setChatThreads((prev) =>
      prev.map((tItem) =>
        tItem.id === currentThread.id
          ? {
              ...tItem,
              lastMessage: textToSend,
              lastMessageTime: nowTime,
              messages: [...tItem.messages, userMsg],
            }
          : tItem
      )
    );

    if (!customText) setInputText('');
  };

  const handleReturn = () => {
    if (onBackToMarketplace) {
      onBackToMarketplace();
    } else {
      window.location.href = '/';
    }
  };

  const totalUnreadChats = chatThreads.reduce((sum, tItem) => sum + (tItem.unreadCount || 0), 0);

  const filteredThreads = chatThreads.filter(
    (tItem) =>
      tItem.propertyTitle.toLowerCase().includes(chatSearch.toLowerCase()) ||
      tItem.sellerName.toLowerCase().includes(chatSearch.toLowerCase()) ||
      tItem.propertyCity.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const isDark = theme === 'dark';

  if (!currentUser) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-[#081a2e] text-slate-100' : 'bg-[#eaf4fc] text-slate-800'} flex flex-col items-center justify-center p-4 text-center font-sans`}>
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {language === 'hi' ? 'इनबॉक्स देखने हेतु लॉगिन आवश्यक है' : 'Sign In Required for Inbox'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'hi'
              ? 'अपने खाते के इनबॉक्स संदेश देखने के लिए लॉगिन करें। (बिना लॉगिन किए सीधे कॉल या व्हाट्सएप करने के लिए किसी भी प्रॉपर्टी पेज पर जाएं।)'
              : 'Sign in to view your account Inbox messages. You can also call or message property listers on WhatsApp directly from any property listing without signing in.'}
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => openAuthModal('login', 'Please sign in or register to access your Inbox.')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              {language === 'hi' ? 'लॉग इन / नया पंजीकरण करें' : 'Sign In or Register'}
            </button>
            <button
              type="button"
              onClick={handleReturn}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-center"
            >
              {language === 'hi' ? 'वापस जाएं' : 'Back to Listings'}
            </button>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  const threadTelHref = getTelHref(currentThread?.sellerPhone);
  const threadWaHref = getWhatsAppContactUrl(
    currentThread?.sellerPhone,
    currentThread
      ? `Hello, I found your property "${currentThread.propertyTitle}" (${currentThread.propertyCity}) on Uttarakhand Gateways and would like to know more about it.`
      : undefined
  );

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#081a2e] text-slate-100' : 'bg-[#eaf4fc] text-slate-800'} flex flex-col font-sans selection:bg-emerald-600 selection:text-white`}>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleReturn();
            }}
            className="flex items-center gap-2 cursor-pointer outline-none"
          >
            <Logo size="md" darkText={!isDark} />
          </a>

          <div className="hidden md:flex items-center gap-2 border-l border-emerald-200 dark:border-slate-800 pl-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              Messages & Direct Inquiries
              {totalUnreadChats > 0 ? ` (${totalUnreadChats})` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative">
          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-emerald-200">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black uppercase">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                ) : (
                  currentUser.username.charAt(0)
                )}
              </div>
              <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.username}</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-slate-400 hover:text-rose-600 p-0.5 ml-0.5 cursor-pointer"
              title={language === 'hi' ? 'लॉग आउट' : 'Log out'}
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border bg-white dark:bg-slate-800 border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
              title={t('nav.menu')}
            >
              {menuOpen ? <X className="w-6 h-6 stroke-[2.25]" /> : <Menu className="w-6 h-6 stroke-[2.25]" />}
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-200 dark:border-slate-800 p-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Navigation & Options</span>
                  <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-1 space-y-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleReturn();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Back to Listings</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      toggleLanguage();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Language / भाषा</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                      {language === 'en' ? 'हिन्दी' : 'English'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleReturn();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>UKG Land Calculator</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to permanently delete your account from this server?')) {
                        await deleteAccount();
                        setMenuOpen(false);
                        handleReturn();
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-6 flex flex-col">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[650px] max-h-[calc(100vh-120px)]">
          <div className="w-full md:w-80 lg:w-96 border-r border-emerald-200/80 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-950/40 flex-shrink-0">
            <div className="p-3 border-b border-emerald-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats or properties..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-emerald-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-emerald-100 dark:divide-slate-800/80">
              {filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => {
                  const isSelected = thread.id === currentThread?.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-100/70 dark:bg-slate-800 border-l-4 border-emerald-600'
                          : 'hover:bg-emerald-50/60 dark:hover:bg-slate-850'
                      }`}
                    >
                      <img
                        src={thread.propertyImage}
                        alt={thread.propertyTitle}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {thread.propertyTitle}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                            {thread.lastMessageTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span className="truncate text-slate-600 dark:text-slate-400">
                            {maskPublicOwnerName(thread.sellerName)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {thread.lastMessage}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active conversations found.
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
            {currentThread ? (
              <>
                <div className="p-3.5 sm:p-4 border-b border-emerald-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={currentThread.propertyImage}
                      alt={currentThread.propertyTitle}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {currentThread.propertyTitle}
                        </h3>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                          {currentThread.propertyPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          {currentThread.propertyCity}
                        </span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {maskPublicOwnerName(currentThread.sellerName)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {threadTelHref && currentThread.sellerPhone && (
                      <a
                        href={threadTelHref}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{formatPhoneForDisplay(currentThread.sellerPhone)}</span>
                      </a>
                    )}
                    {threadWaHref && (
                      <a
                        href={threadWaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                  <div className="max-w-md mx-auto p-2.5 rounded-xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 text-center text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Independently verify property documents and ownership before making any payment.</span>
                  </div>

                  {currentThread.messages.map((msg) => {
                    const isUser = msg.sender === 'buyer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-medium">
                          <span>{msg.senderName}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isUser
                              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-slate-700 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-855 border-t border-emerald-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                    Quick Inquiry:
                  </span>
                  {[
                    'Is this property still available?',
                    'Can we schedule a site visit this weekend?',
                    'Is the price negotiable?',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSendMessage(undefined, preset)}
                      className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap flex-shrink-0 cursor-pointer shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-transparent focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center ${
                      inputText.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No conversation selected</h4>
                <p className="text-xs text-slate-500 mt-1">Choose a conversation from the sidebar to view messages.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SeoKeywordsSection onNavigatePage={onNavigatePage} onNavigateCity={onNavigateCity} />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        allProperties={allProperties}
      />
    </div>
  );
};
