import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  MapPin,
  ExternalLink,
  Search,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';
import { ChatThread, Property } from '../types';
import {
  cleanRawOwnerName,
  formatPhoneForDisplay,
  getTelHref,
  getWhatsAppContactUrl,
  maskPublicOwnerName,
} from '../utils/propertyOwnership';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatThreads: ChatThread[];
  onSendMessage: (threadId: string, text: string) => void;
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
  onSelectProperty,
  activeThreadId,
  onSelectThread,
}) => {
  const [inputText, setInputText] = useState('');
  const [chatSearch, setChatSearch] = useState('');

  if (!isOpen) return null;

  const currentThread = chatThreads.find((t) => t.id === activeThreadId) || chatThreads[0] || null;
  const totalUnreadChats = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

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

  const filteredThreads = chatThreads.filter(
    (t) =>
      t.propertyTitle.toLowerCase().includes(chatSearch.toLowerCase()) ||
      t.sellerName.toLowerCase().includes(chatSearch.toLowerCase()) ||
      t.propertyCity.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const threadTelHref = getTelHref(currentThread?.sellerPhone);
  const threadWaHref = getWhatsAppContactUrl(
    currentThread?.sellerPhone,
    currentThread
      ? `Hello, I found your property "${currentThread.propertyTitle}" (${currentThread.propertyCity}) on Uttarakhand Gateways and would like to know more about it.`
      : undefined
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200/80 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] max-h-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Messages & Inquiries
                </h2>
                {totalUnreadChats > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                    {totalUnreadChats} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/70">
                Direct messages regarding Uttarakhand property listings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-emerald-100 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-slate-900/50 ${
              currentThread && activeThreadId ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by property or lister..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-emerald-100/60 dark:divide-slate-800/80">
              {filteredThreads.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No active conversations yet.
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
                          ? 'bg-emerald-50 dark:bg-slate-800/90 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <img
                        src={thread.propertyImage}
                        alt={thread.propertyTitle}
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-200 dark:border-slate-700 flex-shrink-0"
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
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                          <User className="w-3 h-3 flex-shrink-0 text-emerald-600" />
                          <span className="truncate text-slate-600 dark:text-slate-400">
                            {maskPublicOwnerName(thread.sellerName)}
                          </span>
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

          {currentThread ? (
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden min-h-0">
              <div className="p-3 sm:p-4 border-b border-emerald-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50/80 to-slate-50/80 dark:from-slate-850 dark:to-slate-900 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onSelectThread('')}
                    className="md:hidden p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    ← Back
                  </button>
                  <img
                    src={currentThread.propertyImage}
                    alt={currentThread.propertyTitle}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-200 dark:border-slate-700 flex-shrink-0"
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
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{currentThread.propertyCity}</span>
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Lister: {maskPublicOwnerName(currentThread.sellerName)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {threadTelHref && currentThread.sellerPhone && (
                    <a
                      href={threadTelHref}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{formatPhoneForDisplay(currentThread.sellerPhone)}</span>
                    </a>
                  )}
                  {threadWaHref && (
                    <a
                      href={threadWaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center gap-1 shadow-xs"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {onSelectProperty && (
                    <button
                      onClick={() => onSelectProperty(currentThread.propertyId)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="View Full Property Details"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">Listing</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Always independently verify property ownership, land records, and legal approvals before making any payment.
                  </span>
                </div>

                {currentThread.messages.map((msg) => {
                  const isBuyer = msg.sender === 'buyer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {isBuyer ? 'You' : cleanRawOwnerName(currentThread.sellerName) || 'Lister'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isBuyer
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-emerald-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2 border-t border-emerald-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                  Quick Ask:
                </span>
                <button
                  onClick={() => handleQuickQuestion('Is this property currently available?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Currently available?
                </button>
                <button
                  onClick={() => handleQuickQuestion('Can we schedule a site visit this weekend?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Site visit?
                </button>
                <button
                  onClick={() => handleQuickQuestion('Is the price negotiable?')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Price negotiable?
                </button>
              </div>

              <form
                onSubmit={handleSend}
                className="p-3 border-t border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 flex-shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
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
                Choose a conversation on the left to view messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
