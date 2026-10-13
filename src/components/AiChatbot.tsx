import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Calculator,
  Building2,
  Compass
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
  onExploreProperties?: () => void;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({
  onOpenSellModal,
  onOpenUnitConverter,
  onExploreProperties,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! 🙏 I am **UKG ChatBot**, your official assistant for **Uttarakhand Gateways**.\n\nHow can I help you today?',
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
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen, messages]);

  // Formats basic Markdown text (bold and bullets) cleanly without external parsers
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Process bold markers **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIdx} className="font-bold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={lineIdx} className="block min-h-[1.1rem]">
          {formattedParts}
        </span>
      );
    });
  };

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

    const lower = messageText.toLowerCase();
    const isGreeting = /^(hi+|hey+|hello+|namaste+|namaskar+|pranam+|hola+|good\s*(morning|afternoon|evening|day)|yo|sup|kese\s*ho|kaise\s*ho)[!.,? ]*$/i.test(lower);

    // Fast zero-latency local greeting (< 100ms)
    if (isGreeting) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: 'Namaste! 🙏 Welcome to **Uttarakhand Gateways**.\n\nI am **UKG ChatBot**. How can I help you today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsLoading(false);
      }, 80);
      return;
    }

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: historyPayload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I'm here to assist you with Uttarakhand properties and website guidance!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.warn('Chat request completed with fallback:', err?.message || err);

      let fallbackText = "Namaste! 🙏 How can I assist you with Uttarakhand mountain properties, land conversion rules, or 0% brokerage listings today?";
      if (lower.includes('nali') || lower.includes('sq ft') || lower.includes('converter') || lower.includes('gaj')) {
        fallbackText = "📐 **Quick Uttarakhand Land Units:**\n• **1 Nali** = **2,160 sq.ft** (approx 240 Gaj / sq. yards)\n• **1 Bigha** (Hills) = **4 Nali** (8,640 sq.ft)\n• **1 Nali** = **16 Mutthi** (1 Mutthi = 135 sq.ft)\n• Outside buyers can purchase up to 250 sq.m (~1.25 Nali) in non-municipal areas.";
      } else if (lower.includes('outside') || lower.includes('rule') || lower.includes('legal') || lower.includes('ceiling') || lower.includes('buy land')) {
        fallbackText = "📜 **Outside Buyer Rules in Uttarakhand:**\n• Any Indian citizen can buy property here.\n• **Agricultural/Rural Land:** Up to **250 sq. meters** (~2,700 sq.ft or ~1.25 Nali) per person without special state permission (Section 154 UPZA&LR).\n• **Municipal Corporation / MDDA Limits:** In urban limits (Dehradun, Rishikesh, Haridwar, etc.), there is **NO ceiling** on purchasing flats or residential plots!";
      } else if (lower.includes('sell') || lower.includes('list') || lower.includes('brokerage') || lower.includes('commission')) {
        fallbackText = "✦ **0% Brokerage Guarantee on UKG:**\n• Listing your property is **100% free**.\n• No commissions or hidden agent charges.\n• Interested buyers connect with you directly via phone or instant inbox messages!";
      } else if (lower.includes('143') || lower.includes('rera') || lower.includes('mdda') || lower.includes('title')) {
        fallbackText = "🏛️ **Legal Badges Explained:**\n• **143 Converted:** Land officially converted to non-agricultural residential freehold, allowing direct construction.\n• **MDDA Approved:** Layout sanctioned by Mussoorie Dehradun Development Authority.\n• **RERA Verified:** Real Estate Regulatory Authority registered project with guaranteed buyer protection.";
      }

      const errorMessage: ChatMessage = {
        id: `fallback-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
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
        text: 'Namaste! 🙏 Chat history cleared. How may I assist your Uttarakhand property journey today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
      {/* Sleek Floating Launcher Button - Named UKG ChatBot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-[#06241a] via-[#093527] to-[#0b4231] hover:from-[#082e21] hover:to-[#0f543e] text-white border border-emerald-400/40 shadow-xl shadow-emerald-950/40 hover:shadow-2xl hover:shadow-emerald-600/30 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Open UKG ChatBot"
          title="Open UKG ChatBot"
        >
          {/* Circular Emblem */}
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center p-0.5 shrink-0 shadow-inner">
            <UKGLogoEmblem className="w-full h-full object-contain" />
          </div>

          {/* Clean Label: UKG ChatBot */}
          <span className="text-xs font-extrabold tracking-tight text-white group-hover:text-emerald-200 transition-colors whitespace-nowrap">
            UKG ChatBot
          </span>

          {/* Active green status indicator */}
          <span className="relative flex h-2 w-2 shrink-0 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-xs" />
          </span>
        </button>
      )}

      {/* Sleek Expandable Floating Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[390px] md:w-[410px] h-[560px] max-h-[82vh] bg-white dark:bg-[#071c14] rounded-3xl shadow-2xl border border-emerald-300/80 dark:border-emerald-700/80 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-200 select-text">
          
          {/* Header - Named UKG ChatBot */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#06241a] via-[#093527] to-[#07251b] text-white flex items-center justify-between border-b border-emerald-600/30 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
                <UKGLogoEmblem className="w-7 h-7 object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-white">UKG ChatBot</h3>
                <p className="text-[11px] text-emerald-200/90 leading-tight flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Uttarakhand Gateways Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Platform Action Bar */}
          <div className="px-3 py-1.5 bg-emerald-50/70 dark:bg-[#092b1f]/70 border-b border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {onOpenUnitConverter && (
              <button
                type="button"
                onClick={onOpenUnitConverter}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#071f16] text-slate-700 dark:text-emerald-100 border border-emerald-300/70 dark:border-emerald-700 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-semibold shrink-0"
              >
                <Calculator className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Nali Calculator</span>
              </button>
            )}
            {onOpenSellModal && (
              <button
                type="button"
                onClick={onOpenSellModal}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#071f16] text-slate-700 dark:text-emerald-100 border border-emerald-300/70 dark:border-emerald-700 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-semibold shrink-0"
              >
                <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>List Property (0%)</span>
              </button>
            )}
            {onExploreProperties && (
              <button
                type="button"
                onClick={onExploreProperties}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#071f16] text-slate-700 dark:text-emerald-100 border border-emerald-300/70 dark:border-emerald-700 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-semibold shrink-0"
              >
                <Compass className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Browse Listings</span>
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#f5f9f6]/60 dark:bg-[#051610]/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-emerald-100" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-md shadow-emerald-700/20'
                      : 'bg-white dark:bg-[#0b2b1f] text-slate-800 dark:text-emerald-100 rounded-tl-xs border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words space-y-0.5">
                    {renderFormattedText(msg.text)}
                  </div>
                  <span
                    className={`block text-[9px] mt-1.5 font-medium ${
                      msg.sender === 'user' ? 'text-emerald-100/80 text-right' : 'text-slate-400 dark:text-emerald-400/60 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Pulsing Thinking Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 text-emerald-100" />
                </div>
                <div className="bg-white dark:bg-[#0b2b1f] rounded-2xl rounded-tl-xs px-3.5 py-2.5 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-slate-500 dark:text-emerald-300 ml-1.5 font-medium">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 bg-white dark:bg-[#071c14] border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask UKG ChatBot anything about properties, rules..."
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0a271c] border border-slate-200 dark:border-emerald-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-emerald-400/60 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-md shadow-emerald-700/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
