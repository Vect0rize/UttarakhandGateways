import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  PhoneCall
} from 'lucide-react';
import { ChatThread, PhoneNumberRequest, Property } from '../types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatThreads: ChatThread[];
  onSendMessage: (threadId: string, text: string) => void;
  phoneRequests: PhoneNumberRequest[];
  onApproveRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onSelectProperty?: (propertyId: string) => void;
  activeThreadId?: string | null;
  onSelectThread: (threadId: string) => void;
  allProperties: Property[];
}

export const InboxModal: React.FC<InboxModalProps> = ({
  isOpen,
  onClose,
  chatThreads,
  onSendMessage,
  phoneRequests,
  onApproveRequest,
  onDeclineRequest,
  onSelectProperty,
  activeThreadId,
  onSelectThread,
  allProperties,
}) => {
  const [activeTab, setActiveTab] = useState<'chats' | 'phone-requests'>('chats');
  const [inputText, setInputText] = useState('');
  const [chatSearch, setChatSearch] = useState('');

  // Selected thread
  const currentThread = chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0] || null;

  // Pending incoming requests count
  const pendingIncomingCount = phoneRequests.filter(
    (r) => r.isIncomingForUserListing && r.status === 'pending'
  ).length;

  const totalUnreadChats = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentThread) return;
    onSendMessage(currentThread.id, inputText.trim());
    setInputText('');
  };

  const handleQuickQuestion = (question: string) => {
    if (!currentThread) return;
    onSendMessage(currentThread.id, question);
  };

  const filteredThreads = chatThreads.filter((t) => 
    t.propertyTitle.toLowerCase().includes(chatSearch.toLowerCase()) ||
    t.sellerName.toLowerCase().includes(chatSearch.toLowerCase()) ||
    t.propertyCity.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-sky-200/80 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white flex items-center justify-between border-b border-sky-800/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Inbox & Inquiries
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Direct Owner Chat
                </span>
              </div>
              <p className="text-xs text-sky-200/70">
                Direct buyer-to-owner messages & phone number access requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-850 px-4 sm:px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'chats'
                ? 'border-sky-600 text-sky-700 dark:text-sky-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages & Chats</span>
            {totalUnreadChats > 0 && (
              <span className="bg-sky-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {totalUnreadChats}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('phone-requests')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
              activeTab === 'phone-requests'
                ? 'border-sky-600 text-sky-700 dark:text-sky-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Phone Access Requests</span>
            {pendingIncomingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {pendingIncomingCount} Action Required
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'chats' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* Left Column: Chat Threads List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-sky-100 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-900/50 ${currentThread && activeThreadId ? 'hidden md:flex' : 'flex'}`}>
              
              {/* Search Box */}
              <div className="p-3 border-b border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by property or owner..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Threads Scroll List */}
              <div className="flex-1 overflow-y-auto divide-y divide-sky-100/60 dark:divide-slate-800/80">
                {filteredThreads.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No active chats found. Browse properties and click "Chat with Owner" to start a direct inquiry.
                  </div>
                ) : (
                  filteredThreads.map((thread) => {
                    const isSelected = thread.id === currentThread?.id;
                    return (
                      <button
                        key={thread.id}
                        onClick={() => onSelectThread(thread.id)}
                        className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-slate-800/90 border-l-4 border-sky-600'
                            : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <img 
                          src={thread.propertyImage} 
                          alt={thread.propertyTitle}
                          className="w-12 h-12 rounded-xl object-cover border border-sky-200 dark:border-slate-700 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {thread.propertyTitle}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                              {thread.lastMessageTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-sky-700 dark:text-sky-400 font-medium mb-1">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{thread.sellerName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {thread.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Chat Window */}
            {currentThread ? (
              <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden min-h-0">
                
                {/* Chat Top Banner with Property Details */}
                <div className="p-3 sm:p-4 border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-50/80 to-slate-50/80 dark:from-slate-850 dark:to-slate-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => onSelectThread('')}
                      className="md:hidden p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    >
                      ← Back
                    </button>
                    <img 
                      src={currentThread.propertyImage} 
                      alt={currentThread.propertyTitle}
                      className="w-10 h-10 rounded-xl object-cover border border-sky-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {currentThread.propertyTitle}
                        </h3>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          {currentThread.propertyPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-sky-600" />
                          <span>{currentThread.propertyCity}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Owner: {currentThread.sellerName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {onSelectProperty && (
                      <button
                        onClick={() => onSelectProperty(currentThread.propertyId)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 hover:bg-sky-200 border border-sky-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        title="View Full Property Details"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden sm:inline">Listing Details</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                  {/* Security Banner */}
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 text-[11px] text-sky-900 dark:text-sky-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>
                      Direct chat with the verified property owner. Phone numbers are protected until the owner explicitly approves your request.
                    </span>
                  </div>

                  {/* Messages Bubble List */}
                  {currentThread.messages.map((msg) => {
                    const isBuyer = msg.sender === 'buyer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {isBuyer ? 'You' : currentThread.sellerName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isBuyer
                              ? 'bg-sky-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-sky-200 dark:border-slate-700 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Inquiries / Questions */}
                <div className="px-4 py-2 border-t border-sky-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                    Quick Ask:
                  </span>
                  <button
                    onClick={() => handleQuickQuestion('Is the price negotiable for immediate registry?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Price negotiable?
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('Can we schedule a physical site visit this Sunday?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Site visit this weekend?
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('Is 143 conversion and clear mutation title guaranteed?')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Clear title deed copy?
                  </button>
                  <button
                    onClick={() => handleQuickQuestion('Please share exact Google Maps coordinates pin.')}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Google Maps Pin?
                  </button>
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 flex-shrink-0"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message to the owner..."
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Select a Conversation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Click on an inquiry on the left to chat with the property seller or check property questions.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Phone Access Requests & Approvals */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
            
            {/* Header info card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Privacy Protection & Number Approval Center
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  To protect owners from spam and cold calls, phone numbers are masked. Below you can manage requests you sent to other sellers, and approve incoming requests from interested buyers on your own listings.
                </p>
              </div>
            </div>

            {/* Section 1: Incoming Requests on Your Listings (Seller Approval) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Incoming Buyer Requests (Action Required)</span>
                  {pendingIncomingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {pendingIncomingCount} Pending
                    </span>
                  )}
                </h4>
              </div>

              {phoneRequests.filter((r) => r.isIncomingForUserListing).length === 0 ? (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  No incoming phone access requests for your listings yet. When buyers request your number, they will appear here for your 1-click approval.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {phoneRequests
                    .filter((r) => r.isIncomingForUserListing)
                    .map((req) => (
                      <div 
                        key={req.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.propertyImage} 
                            alt={req.propertyTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {req.requesterName}
                              </h5>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-slate-700 text-sky-800 dark:text-sky-300 font-semibold">
                                Interested Buyer
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Requested your phone number for: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.propertyTitle}</span>
                            </p>
                            {req.requesterNote && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-1 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                "{req.requesterNote}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => onApproveRequest(req.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Approve Access</span>
                              </button>
                              <button
                                onClick={() => onDeclineRequest(req.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : req.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approved (Buyer can now call you)</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              Declined
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Section 2: Outgoing Requests (You sent to other Sellers) */}
            <div className="space-y-3 pt-4 border-t border-sky-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Requests You Sent to Sellers ({phoneRequests.filter(r => !r.isIncomingForUserListing).length})</span>
              </h4>

              {phoneRequests.filter((r) => !r.isIncomingForUserListing).length === 0 ? (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  You haven't requested any phone numbers yet. When browsing any property, click "Request Phone Number" to ask the owner for direct contact permission.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {phoneRequests
                    .filter((r) => !r.isIncomingForUserListing)
                    .map((req) => (
                      <div 
                        key={req.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={req.propertyImage} 
                            alt={req.propertyTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {req.propertyTitle}
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Owner: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.sellerName}</span> ({req.propertyCity})
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Requested: {req.requestedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {req.status === 'approved' ? (
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{req.sellerPhone}</span>
                              </div>
                              <a
                                href={`tel:${req.sellerPhone}`}
                                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center shadow-xs"
                                title="Call Owner"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${req.sellerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center shadow-xs"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                <span>Pending Owner Approval</span>
                              </span>
                              {/* Handy testing button for user */}
                              <button
                                onClick={() => onApproveRequest(req.id)}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-slate-700 hover:bg-sky-200 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-slate-600 font-semibold cursor-pointer"
                                title="Click to simulate owner granting approval"
                              >
                                Simulate Approval
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
