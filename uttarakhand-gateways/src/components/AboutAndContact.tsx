import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Mountain,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface AboutAndContactProps {
  onOpenBookVisit: () => void;
}

export const AboutAndContact: React.FC<AboutAndContactProps> = ({ onOpenBookVisit }) => {
  const phoneNumber = "+91 7535981704";
  const whatsappNumber = "917535981704";

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Hello Uttarakhand Gateways, I would like to inquire about your properties in Uttarakhand.");
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-12 py-8">
      
      {/* 1. OUR PORTFOLIO STORY (Zero rentals policy box REMOVED per user request) */}
      <section id="about-section" className="relative">
        <div className="bg-[#0c1825]/90 rounded-3xl p-6 sm:p-10 border border-slate-700/60 shadow-2xl relative overflow-hidden backdrop-blur-md">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Story Content */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                <span>Our Exclusive Himalayan Portfolio</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight font-serif-luxury">
                Handpicked Properties Across Uttarakhand's Finest Valleys
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Welcome to <strong>Uttarakhand Gateways</strong>. This website is our private portfolio. Every flat, residential plot, and luxury mountain cottage presented here is exclusively curated and directly represented by us across Rishikesh, Dehradun, Mussoorie, Nainital, and Mukteshwar.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenBookVisit}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Private Site Visit</span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: {phoneNumber}</span>
                </button>
              </div>

            </div>

            {/* Visual Photography */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
                  alt="Uttarakhand Gateways Mountain Architecture"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1825] via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10">
                  <div className="text-xs font-bold text-white flex items-center justify-between mb-1">
                    <span>Direct Property Representation</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Rishikesh Office</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Direct counsel & site visits scheduled throughout Rishikesh, Dehradun, and Kumaon Hills.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. DIRECT CONTACT SECTION ("Send an enquiry" removed per user request) */}
      <section id="contact-section" className="relative">
        <div className="bg-[#0c1825]/90 rounded-3xl p-6 sm:p-10 border border-slate-700/60 shadow-2xl backdrop-blur-md">
          
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Get In Touch</span>
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-white mb-2">
                Contact Details & Office Location
              </h3>
              <p className="text-sm text-slate-300">
                Connect directly with us via Phone, WhatsApp, or visit our office in Rishikesh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Phone / WhatsApp Card */}
              <div className="p-6 rounded-2xl bg-[#064234]/80 border border-emerald-600/40 text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0b5341] text-[#a7f3d0] flex items-center justify-center mb-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-300 uppercase mb-1">
                    PHONE / WHATSAPP
                  </span>
                  
                  <a 
                    href={`tel:${phoneNumber.replace(/\s+/g, '')}`} 
                    className="font-bold text-lg text-white hover:text-emerald-200 transition-colors block"
                  >
                    {phoneNumber}
                  </a>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    Mon–Sun, 8:00 AM – 8:00 PM IST (Direct Line)
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Office Location Card (Rishikesh Uttarakhand) */}
              <div className="p-6 rounded-2xl bg-[#064234]/80 border border-emerald-600/40 text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0b5341] text-[#a7f3d0] flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-300 uppercase mb-1">
                    OFFICE LOCATION
                  </span>
                  <h4 className="font-bold text-lg text-white">
                    Rishikesh, Uttarakhand
                  </h4>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    Tapovan & Badrinath Marg, Rishikesh, Uttarakhand – 249201, India
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={onOpenBookVisit}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Office Visit</span>
                  </button>
                </div>
              </div>

              {/* Email & Social Card */}
              <div className="p-6 rounded-2xl bg-[#064234]/80 border border-emerald-600/40 text-white flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0b5341] text-[#a7f3d0] flex items-center justify-center mb-4">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-300 uppercase mb-1">
                    EMAIL
                  </span>
                  <a 
                    href="mailto:hello@uttarakhandgateways.in" 
                    className="font-bold text-sm sm:text-[15px] xl:text-base text-white hover:text-emerald-200 transition-colors whitespace-nowrap block tracking-tight"
                    title="hello@uttarakhandgateways.in"
                  >
                    hello@uttarakhandgateways.in
                  </a>
                  <p className="text-xs text-emerald-200/70 mt-1">
                    We reply promptly to all inquiries
                  </p>
                </div>

                <div className="pt-6">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300 mb-2 block">
                    FOLLOW US
                  </span>
                  <div className="flex items-center gap-2">
                    {['Instagram', 'Facebook', 'YouTube'].map((channel) => (
                      <span
                        key={channel}
                        className="text-xs font-semibold px-3 py-1 rounded-full border border-emerald-600/50 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/60 transition-colors cursor-pointer"
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
