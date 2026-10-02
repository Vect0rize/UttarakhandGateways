import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Send, 
  ShieldCheck, 
  Building2, 
  User, 
  MapPin, 
  Lock, 
  Unlock,
  AlertCircle,
  ExternalLink,
  Search,
  MessageCircle,
  Sparkles,
  PhoneCall,
  ArrowLeft,
  Sun,
  Moon,
  Home,
  Menu,
  X,
  Globe,
  Calculator,
  LogOut,
  Trash2
} from 'lucide-react';
import { ChatThread, PhoneNumberRequest, Property } from '../types';
import { Logo } from './Logo';
import { PROPERTIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';

interface InboxPageProps {
  onBackToMarketplace?: () => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ onBackToMarketplace }) => {
  const { currentUser, openAuthModal, logout, deleteAccount } = useAuth();
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [activeTab, setActiveTab] = useState<'chats' | 'phone-requests'>('chats');
  const [inputText, setInputText] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  // All properties for rich cards (all fake/mock properties removed)
  const [allProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_uploaded_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p: Property) => p.id && p.id.startsWith('user-prop-'));
        }
      }
    } catch {}
    return [];
  });

  // Chat threads - initialized empty (no templates)
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => !t.id.startsWith('thread-prop-'));
        }
      }
    } catch {}
    return [];
  });

  // Phone requests - initialized empty (no templates)
  const [phoneRequests, setPhoneRequests] = useState<PhoneNumberRequest[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_phone_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: any) => !r.id.startsWith('req-incoming-') && !r.id.startsWith('req-outgoing-'));
        }
      }
    } catch {}
    return [];
  });

  // Active thread selection
  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    // Check if propertyId was passed in query params
    try {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('propertyId');
      if (propId) {
        return `thread-${propId}`;
      }
    } catch {}
    return null;
  });

  // Listen to cross-tab storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uk_gateways_chat_threads' && e.newValue) {
        try {
          setChatThreads(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'uk_gateways_phone_requests' && e.newValue) {
        try {
          setPhoneRequests(JSON.parse(e.newValue));
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

  // Update theme class
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('uk_gateways_theme', theme);
    } catch {}
  }, [theme]);

  // Sync state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_chat_threads', JSON.stringify(chatThreads));
    } catch {}
  }, [chatThreads]);

  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_phone_requests', JSON.stringify(phoneRequests));
    } catch {}
  }, [phoneRequests]);

  // Set document title
  useEffect(() => {
    document.title = 'Inbox & Inquiries | Uttarakhand Gateways';
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const currentThread = chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0] || null;

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
      prev.map((t) => {
        if (t.id === currentThread.id) {
          return {
            ...t,
            lastMessage: textToSend,
            lastMessageTime: nowTime,
            messages: [...t.messages, userMsg],
          };
        }
        return t;
      })
    );

    if (!customText) setInputText('');

    // Simulate owner response
    setTimeout(() => {
      const ownerReply = {
        id: `msg-${Date.now() + 1}`,
        sender: 'seller' as const,
        senderName: currentThread.sellerName || 'Property Owner',
        text: `Namaste! Thank you for inquiring. Yes, clear title and immediate mutation are available. Would you like to schedule an in-person site visit or request my direct contact number?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThread.id) {
            return {
              ...t,
              lastMessage: ownerReply.text,
              lastMessageTime: ownerReply.timestamp,
              messages: [...t.messages, ownerReply],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  const handleApproveRequest = (requestId: string) => {
    setPhoneRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', approvedAt: 'Just now' }
          : r
      )
    );
  };

  const handleDeclineRequest = (requestId: string) => {
    setPhoneRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'declined' }
          : r
      )
    );
  };

  const handleReturn = () => {
    if (onBackToMarketplace) {
      onBackToMarketplace();
    } else {
      // If opened in separate window/tab
      try {
        if (window.opener && !window.opener.closed) {
          window.close();
        } else {
          window.location.href = window.location.pathname;
        }
      } catch {
        window.location.href = window.location.pathname;
      }
    }
  };

  const pendingIncomingCount = phoneRequests.filter(
    (r) => r.isIncomingForUserListing && r.status === 'pending'
  ).length;

  const totalUnreadChats = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  const filteredThreads = chatThreads.filter((t) => 
    t.propertyTitle.toLowerCase().includes(chatSearch.toLowerCase()) ||
    t.sellerName.toLowerCase().includes(chatSearch.toLowerCase()) ||
    t.propertyCity.toLowerCase().includes(chatSearch.toLowerCase())
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
              ? 'अपनी चैट, संपत्ति स्वामियों से बातचीत और फोन नंबर अनुरोधों तक पहुँचने के लिए कृपया अपने खाते में लॉगिन करें।'
              : 'Please log in or register with your email or phone number to access direct owner conversations and verified phone requests.'}
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
              {language === 'hi' ? '← मुख्य पोर्टल पर वापस जाएं' : '← Back to Marketplace'}
            </button>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#081a2e] text-slate-100' : 'bg-[#eaf4fc] text-slate-800'} flex flex-col font-sans selection:bg-emerald-600 selection:text-white`}>
      
      {/* Top Standalone Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            title="Return to Properties Marketplace"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Marketplace</span>
          </button>

          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); handleReturn(); }} 
            className="flex items-center gap-2 cursor-pointer outline-none border-0 ring-0 focus:outline-none focus:ring-0 select-none [-webkit-tap-highlight-color:transparent]"
          >
            <Logo size="md" darkText={!isDark} />
          </a>

          <div className="hidden md:flex items-center gap-2 border-l border-emerald-200 dark:border-slate-800 pl-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              Messenger & Direct Inquiries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative">
          {/* User Account Info */}
          {currentUser && (
            <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-emerald-200">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                title={language === 'hi' ? 'प्रोफ़ाइल देखें व संपादित करें' : 'View & edit profile'}
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
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border bg-white dark:bg-slate-800 border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Menu Option Dropdown in Inbox */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer select-none"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span>{t('nav.menu')}</span>
            </button>

            {menuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>Navigation & Options</span>
                  <button 
                    onClick={() => setMenuOpen(false)} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="py-1 space-y-1">
                  <button
                    onClick={() => { setMenuOpen(false); handleReturn(); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Return to Marketplace</span>
                  </button>

                  <button
                    onClick={() => { setMenuOpen(false); toggleLanguage(); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
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
                    onClick={() => { setMenuOpen(false); handleReturn(); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>UKG Land Calculator</span>
                  </button>

                  {currentUser && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to permanently delete your account from this device?')) {
                          deleteAccount();
                          setMenuOpen(false);
                          handleReturn();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account (खाता हटाएं)</span>
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-emerald-100 dark:border-slate-800 px-3 py-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Direct Inquiries</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Inbox Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-6 flex flex-col">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[650px] max-h-[calc(100vh-120px)]">
          
          {/* LEFT COLUMN: Sidebar (Search + Tab selector + Conversation & Request lists) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-emerald-200/80 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-950/40 flex-shrink-0">
            
            {/* Search Bar */}
            <div className="p-3 border-b border-emerald-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats, properties, owners..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-emerald-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Sub-tab Navigation (Chats vs Phone Requests) */}
            <div className="grid grid-cols-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/60 m-3 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('chats')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'chats'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chats</span>
                {totalUnreadChats > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-black">
                    {totalUnreadChats}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('phone-requests')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'phone-requests'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Access</span>
                {pendingIncomingCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                    {pendingIncomingCount}
                  </span>
                )}
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-emerald-100 dark:divide-slate-800/80">
              
              {/* CHATS LIST */}
              {activeTab === 'chats' && (
                filteredThreads.length > 0 ? (
                  filteredThreads.map((thread) => {
                    const isSelected = thread.id === activeThreadId;
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
                            <User className="w-3 h-3" />
                            <span className="truncate">{thread.sellerName}</span>
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
                )
              )}

              {/* PHONE REQUESTS LIST */}
              {activeTab === 'phone-requests' && (
                phoneRequests.length > 0 ? (
                  phoneRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 transition-all hover:bg-emerald-50/60 dark:hover:bg-slate-850 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block mb-1 tracking-wider border">
                            {req.status === 'approved' && (
                              <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300">
                                Approved
                              </span>
                            )}
                            {req.status === 'pending' && (
                              <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300">
                                Pending Approval
                              </span>
                            )}
                            {req.status === 'declined' && (
                              <span className="text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300">
                                Declined
                              </span>
                            )}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {req.propertyTitle}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400">{req.requestedAt}</span>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                        <div>
                          <strong>Requester:</strong> {req.requesterName}
                        </div>
                        {req.requesterNote && (
                          <div className="italic text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                            "{req.requesterNote}"
                          </div>
                        )}
                      </div>

                      {/* Owner Actions if incoming request */}
                      {req.isIncomingForUserListing && req.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req.id)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Reveal Phone</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineRequest(req.id)}
                            className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold text-[11px] cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {/* If approved: show phone and direct call button */}
                      {req.status === 'approved' && req.sellerPhone && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-600" />
                            <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                              {req.sellerPhone}
                            </span>
                          </div>
                          <a
                            href={`tel:${req.sellerPhone.replace(/\s+/g, '')}`}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-xs"
                          >
                            Call Now
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No phone access requests.
                  </div>
                )
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: Active Chat Conversation View */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
            {currentThread ? (
              <>
                {/* Chat Header with Property Card & Phone Status */}
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
                          {currentThread.sellerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Status / Call Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {currentThread.sellerPhone ? (
                      <a
                        href={`tel:${currentThread.sellerPhone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>{currentThread.sellerPhone}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Phone Protected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                  {/* Security Banner */}
                  <div className="max-w-md mx-auto p-2.5 rounded-xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 text-center text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Direct chat enabled. Phone numbers remain private until approved by the owner.</span>
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

                {/* Quick Presets */}
                <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-855 border-t border-emerald-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                    Quick Inquiry:
                  </span>
                  {[
                    "Is site visit open this weekend?",
                    "Can you share 143 conversion certificate?",
                    "Is registry immediate?",
                    "Can you share video walkthrough?"
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

                {/* Message Input Box */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message to property owner..."
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
                <p className="text-xs text-slate-500 mt-1">Choose a conversation from the sidebar to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <AuthModal />
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
};
