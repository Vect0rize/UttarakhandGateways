import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  ChevronDown, 
  HelpCircle,
  ExternalLink,
  MapPin,
  Calculator
} from 'lucide-react';
import { UKGLogoEmblem } from './Logo';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiChatbotProps {
  onOpenSellModal?: () => void;
  onOpenUnitConverter?: () => void;
  onOpenCalculator?: () => void;
  onExploreProperties?: () => void;
}

const QUICK_PROMPTS = [
  'Can outside buyers buy land in Uttarakhand?',
  'How to sell my property with 0% brokerage?',
  'What is 1 Nali in sq.ft and Gaj?',
  'Best locations for Himalayan views?',
];

export const AiChatbot: React.FC<AiChatbotProps> = ({
  onOpenSellModal,
  onOpenUnitConverter,
  onOpenCalculator,
  onExploreProperties,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! 🙏 I am **UKG Chatbot**, your official AI guide for Uttarakhand Gateways.\n\nI can help you with:\n• Buying & selling freehold mountain properties with **0% brokerage**\n• Uttarakhand land rules (up to 250 sq.m / 1.25 Nali for outside buyers)\n• Land conversions (Nali, Gaj, Bigha, Sq.Ft)\n• Best destinations in Garhwal & Kumaon\n\nHow may I help you today?',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
      
      // Prevent background webpage scrolling when chatbot is open
      const originalOverflow = document.body.style.overflow;
      const originalOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.overscrollBehavior = originalOverscroll;
      };
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I'm here to assist you with Uttarakhand property and site guidance!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Namaste! I had a brief connection pause. Please try asking again, or feel free to use our quick site options above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Namaste! 🙏 UKG Chatbot is ready. How may I assist your Uttarakhand property search today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Mobile Touch Isolation Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] sm:hidden"
          onClick={() => setIsOpen(false)}
          onTouchMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {/* Floating Launcher Button - Compact UKG Chatbot */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/80 hover:border-emerald-500 shadow-md shadow-emerald-950/10 hover:shadow-lg hover:shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 select-none"
            aria-label="Open UKG Chatbot"
            title="Open UKG Chatbot"
          >
            {/* Logo Emblem inside mini circular container */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#062c21] border border-emerald-500/60 flex items-center justify-center p-0.5 flex-shrink-0 shadow-2xs">
              <UKGLogoEmblem className="w-full h-full object-contain" />
            </div>

            {/* Compact Single-line UKG Chatbot Label */}
            <span className="text-xs font-bold tracking-tight text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              UKG Chatbot
            </span>

            {/* Active status pulse dot */}
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
          </button>
        )}

        {/* Expandable Chat Window */}
        {isOpen && (
          <div 
            className="w-[92vw] sm:w-[380px] h-[540px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200/90 dark:border-emerald-800/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 overscroll-contain touch-auto"
            onTouchMove={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center border border-white/30 shadow-xs">
                  <UKGLogoEmblem className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm tracking-wide">UKG Chatbot</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-tight">
                    Uttarakhand Gateways AI Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize Chat"
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Platform Actions Bar */}
            <div className="px-3 py-2 bg-emerald-50/80 dark:bg-slate-800/80 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
              {onOpenUnitConverter && (
                <button
                  onClick={onOpenUnitConverter}
                  className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium"
                >
                  <Calculator className="w-3 h-3 text-emerald-600" />
                  <span>Nali Converter</span>
                </button>
              )}
              {onOpenSellModal && (
                <button
                  onClick={onOpenSellModal}
                  className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium"
                >
                  <span className="text-emerald-600 font-bold">+</span>
                  <span>Sell Property</span>
                </button>
              )}
              {onExploreProperties && (
                <button
                  onClick={onExploreProperties}
                  className="px-2 py-1 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-600 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-medium"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Listings</span>
                </button>
              )}
            </div>

            {/* Messages Area - Dedicated touch-pan-y with overscroll-contain */}
            <div 
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-emerald-100 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-line break-words">
                    {msg.text}
                  </div>
                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.sender === 'user' ? 'text-emerald-100/80 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2.5 border border-emerald-100 dark:border-slate-700 shadow-2xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown when few messages) */}
          {messages.length <= 3 && !isLoading && (
            <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-emerald-600" />
                <span>Suggested questions:</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-300 border border-emerald-200/70 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about mountain properties..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
      </div>
    </>
  );
};
