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
  Home
} from 'lucide-react';
import { ChatThread, PhoneNumberRequest, Property } from '../types';
import { Logo } from './Logo';
import { PROPERTIES } from '../data/properties';

interface InboxPageProps {
  onBackToMarketplace?: () => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ onBackToMarketplace }) => {
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

  // All properties for rich cards
  const [allProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_uploaded_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...PROPERTIES];
        }
      }
    } catch {}
    return PROPERTIES;
  });

  // Chat threads
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_chat_threads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'thread-prop-1',
        propertyId: 'prop-1',
        propertyTitle: 'Himalayan Crest Residences',
        propertyCity: 'Dehradun',
        propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        propertyPrice: '₹1.15 Cr',
        sellerName: 'Vikram Singh Negi (Developer)',
        sellerPhone: '+91 98971 23456',
        buyerName: 'You',
        unreadCount: 1,
        lastMessage: 'Site visits are open this Saturday and Sunday 10 AM to 5 PM. Registry is immediate.',
        lastMessageTime: '10:45 AM',
        messages: [
          {
            id: 'msg-1',
            sender: 'buyer',
            senderName: 'You',
            text: 'Namaste Vikram ji, is the 3BHK penthouse facing the Mussoorie ridge available for visit?',
            timestamp: '10:30 AM',
          },
          {
            id: 'msg-2',
            sender: 'seller',
            senderName: 'Vikram Singh Negi',
            text: 'Namaste! Yes, the 3BHK with servant suite and sunrise terrace is available. Site visits are open this Saturday and Sunday 10 AM to 5 PM. Registry is immediate.',
            timestamp: '10:45 AM',
          }
        ]
      },
      {
        id: 'thread-prop-2',
        propertyId: 'prop-2',
        propertyTitle: 'Nanda Devi View Eco Villa',
        propertyCity: 'Mukteshwar',
        propertyImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        propertyPrice: '₹1.65 Cr',
        sellerName: 'Col. R.S. Rawat (Retd.)',
        sellerPhone: '+91 94120 56789',
        buyerName: 'You',
        unreadCount: 0,
        lastMessage: '143 conversion is 100% completed with mutation in Nainital collectorate.',
        lastMessageTime: 'Yesterday',
        messages: [
          {
            id: 'msg-3',
            sender: 'buyer',
            senderName: 'You',
            text: 'Hello Colonel Rawat, does this property have clear 143 conversion for non-Uttarakhand residents?',
            timestamp: 'Yesterday',
          },
          {
            id: 'msg-4',
            sender: 'seller',
            senderName: 'Col. R.S. Rawat (Retd.)',
            text: '143 conversion is 100% completed with mutation in Nainital collectorate. Anyone can purchase up to legal limits.',
            timestamp: 'Yesterday',
          }
        ]
      }
    ];
  });

  // Phone requests
  const [phoneRequests, setPhoneRequests] = useState<PhoneNumberRequest[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_phone_requests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'req-incoming-1',
        propertyId: 'prop-1',
        propertyTitle: 'Himalayan Crest Residences',
        propertyCity: 'Dehradun',
        propertyImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        sellerName: 'You (Listing Owner)',
        sellerPhone: '+91 7535981704',
        requesterName: 'Priya Sundaram (Delhi NRI)',
        requesterNote: 'Looking to purchase 3BHK for self-use. Ready for 100% immediate payment. Please share contact number.',
        requestedAt: '25 mins ago',
        status: 'pending',
        isIncomingForUserListing: true,
      },
      {
        id: 'req-outgoing-1',
        propertyId: 'prop-2',
        propertyTitle: 'Nanda Devi View Eco Villa',
        propertyCity: 'Mukteshwar',
        propertyImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        sellerName: 'Col. R.S. Rawat (Retd.)',
        sellerPhone: '+91 94120 56789',
        requesterName: 'You',
        requesterNote: 'Site visit coordination',
        requestedAt: '2 hours ago',
        status: 'approved',
        approvedAt: '1 hour ago',
        isIncomingForUserListing: false,
      }
    ];
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
    return 'thread-prop-1';
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

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#071526] text-slate-100' : 'bg-[#eef6fb] text-slate-800'} flex flex-col font-sans selection:bg-sky-500 selection:text-white`}>
      
      {/* Top Standalone Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-sky-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-xs font-bold text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
            title="Return to Properties Marketplace"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Marketplace</span>
          </button>

          <a href="/" onClick={(e) => { e.preventDefault(); handleReturn(); }} className="flex items-center gap-2 cursor-pointer">
            <Logo size="md" darkText={!isDark} />
          </a>

          <div className="hidden md:flex items-center gap-2 border-l border-sky-200 dark:border-slate-800 pl-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              Messenger & Direct Inquiries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Marketplace Button */}
          <button
            onClick={handleReturn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Explore Properties</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border bg-white dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-700" />}
          </button>
        </div>
      </header>

      {/* Main Inbox Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-6 flex flex-col">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-sky-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[650px] max-h-[calc(100vh-120px)]">
          
          {/* LEFT COLUMN: Sidebar (Search + Tab selector + Conversation & Request lists) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-sky-200/80 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-950/40 flex-shrink-0">
            
            {/* Search Bar */}
            <div className="p-3 border-b border-sky-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats, properties, owners..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-sky-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chats</span>
                {totalUnreadChats > 0 && (
                  <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-black">
                    {totalUnreadChats}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('phone-requests')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'phone-requests'
                    ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-sm'
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
            <div className="flex-1 overflow-y-auto divide-y divide-sky-100 dark:divide-slate-800/80">
              
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
                            ? 'bg-sky-100/70 dark:bg-slate-800 border-l-4 border-sky-600' 
                            : 'hover:bg-sky-50/60 dark:hover:bg-slate-850'
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

                          <div className="flex items-center gap-1.5 text-[11px] text-sky-700 dark:text-sky-300 font-semibold mb-1">
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
                      className="p-3.5 transition-all hover:bg-sky-50/60 dark:hover:bg-slate-850 flex flex-col gap-2"
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
                <div className="p-3.5 sm:p-4 border-b border-sky-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                        <span className="text-xs font-black text-sky-700 dark:text-sky-300">
                          {currentThread.propertyPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-sky-500" />
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
                  <div className="max-w-md mx-auto p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 text-center text-[11px] text-sky-900 dark:text-sky-200 flex items-center justify-center gap-2">
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
                              ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-sky-100 dark:border-slate-700 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Presets */}
                <div className="px-4 py-2 bg-slate-100/60 dark:bg-slate-850 border-t border-sky-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
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
                      className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap flex-shrink-0 cursor-pointer shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Message Input Box */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message to property owner..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 border border-transparent focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center ${
                      inputText.trim()
                        ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/25 cursor-pointer'
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
    </div>
  );
};
