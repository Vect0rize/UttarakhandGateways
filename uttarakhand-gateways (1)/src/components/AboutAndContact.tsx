import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Mountain, 
  Sparkles 
} from 'lucide-react';

interface AboutAndContactProps {}

export const AboutAndContact: React.FC<AboutAndContactProps> = () => {
  const phoneNumber = "+91 7535981704";
  const whatsappNumber = "917535981704";

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Hello Uttarakhand Gateways, I would like to inquire about your properties in Uttarakhand.");
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-12 py-8">
      
      {/* 1. OUR PORTFOLIO STORY */}
      <section id="about-section" className="relative">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-sky-200/80 dark:border-slate-800 shadow-lg shadow-sky-950/5 relative overflow-hidden transition-colors">
          
          {/* Subtle Ambient Light Wash */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-200/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Story Content */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 text-xs font-semibold uppercase tracking-wider">
                <Mountain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Our Exclusive Himalayan Portfolio</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-[#0c2340] dark:text-white leading-tight font-serif-luxury">
                Handpicked Properties Across Uttarakhand's Finest Valleys
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Welcome to <strong>Uttarakhand Gateways</strong>. This website is our private portfolio. Every flat, residential plot, and luxury mountain cottage presented here is exclusively curated and directly represented by us across Rishikesh, Dehradun, Haridwar, Devprayag, Mussoorie, Nainital, Mukteshwar, and Almora.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Property Advisor</span>
                </a>

                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/15"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: {phoneNumber}</span>
                </button>
              </div>

            </div>

            {/* Visual Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-sky-100 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
                  alt="Uttarakhand Gateways Mountain Architecture"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-sky-100 dark:border-slate-800 shadow-md">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between mb-1">
                    <span>Direct Property Representation</span>
                    <span className="text-sky-700 dark:text-sky-400 font-mono text-[11px]">Rishikesh Office</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Direct counsel & property inquiries handled throughout Rishikesh, Dehradun, Devprayag, Haridwar, and Kumaon Hills.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. DIRECT CONTACT SECTION */}
      <section id="contact-section" className="relative">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-sky-200/80 dark:border-slate-800 shadow-lg shadow-sky-950/5 transition-colors">
          
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>Get In Touch</span>
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#0c2340] dark:text-white mb-2">
                Contact Details & Office Location
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Connect directly with us via Phone, WhatsApp, or at our office in Rishikesh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Phone / WhatsApp Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-sky-600/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-sky-800 dark:text-sky-400 uppercase mb-1">
                    PHONE / WHATSAPP
                  </span>
                  
                  <a 
                    href={`tel:${phoneNumber.replace(/\s+/g, '')}`} 
                    className="font-bold text-lg text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors block"
                  >
                    {phoneNumber}
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mon–Sun, 8:00 AM – 8:00 PM IST (Direct Line)
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Office Location Card (Rishikesh Uttarakhand) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-sky-600/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-sky-800 dark:text-sky-400 uppercase mb-1">
                    OFFICE LOCATION
                  </span>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    Rishikesh, Uttarakhand
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Tapovan & Badrinath Marg, Rishikesh, Uttarakhand – 249201, India
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href={`tel:${phoneNumber.replace(/\s+/g, '')}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-slate-600 border border-sky-200 dark:border-slate-600 text-sky-900 dark:text-slate-100 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Direct Call Office</span>
                  </a>
                </div>
              </div>

              {/* Email & Social Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-sky-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-sky-600/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-sky-800 dark:text-sky-400 uppercase mb-1">
                    EMAIL
                  </span>
                  <a 
                    href="mailto:hello@uttarakhandgateways.in" 
                    className="font-bold text-sm sm:text-[15px] text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap block tracking-tight"
                    title="hello@uttarakhandgateways.in"
                  >
                    hello@uttarakhandgateways.in
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We reply promptly to all inquiries
                  </p>
                </div>

                <div className="pt-6">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-800 dark:text-sky-400 mb-2 block">
                    FOLLOW US
                  </span>
                  <div className="flex items-center gap-2">
                    {['Instagram', 'Facebook', 'YouTube'].map((channel) => (
                      <span
                        key={channel}
                        className="text-xs font-semibold px-3 py-1 rounded-full border border-sky-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sky-800 dark:text-sky-300 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
