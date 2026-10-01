import React, { useState } from 'react';
import { 
  Mail, 
  Mountain, 
  ShieldCheck, 
  FileCheck2, 
  Scale, 
  MessageSquare, 
  Sparkles,
  CheckCircle2,
  FileText,
  ArrowRight,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutAndContactProps {}

export const AboutAndContact: React.FC<AboutAndContactProps> = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<'rules' | '143' | 'registry'>('143');

  return (
    <div className="space-y-10 py-8">
      
      {/* 1. ABOUT THE PLATFORM */}
      <section id="about-section" className="relative">
        <div className="bg-white dark:bg-[#092218] rounded-3xl p-6 sm:p-10 border border-emerald-200/80 dark:border-emerald-900/60 shadow-lg shadow-emerald-950/5 relative overflow-hidden transition-colors">
          
          {/* Subtle Ambient Light Wash */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Story Content */}
            <div className="lg:col-span-7 space-y-4">
              
              <h2 className="text-2xl sm:text-4xl font-bold text-[#0a271c] dark:text-white leading-tight font-serif-luxury">
                {isHindi 
                  ? 'उत्तराखंड में सीधा रियल एस्टेट और प्रॉपर्टी मार्केटप्लेस' 
                  : 'Direct Property Marketplace Across Uttarakhand'}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHindi ? (
                  <>
                    <strong>उत्तराखंड गेटवेज</strong> 0% ब्रोकरेज के साथ सीधे खरीदार और विक्रेता को जोड़ने वाला प्रॉपर्टी प्लेटफॉर्म है। हम देहरादून, ऋषिकेश, हरिद्वार, मसूरी, नैनीताल, मुक्तेश्वर और अल्मोड़ा में आवासीय प्लॉट, कॉटेज, फ्लैट और विला सीधे संपत्ति मालिकों और सत्यापित बिल्डरों से उपलब्ध कराते हैं।
                  </>
                ) : (
                  <>
                    <strong>Uttarakhand Gateways</strong> connects buyers directly with property owners and verified builders with 0% brokerage. Discover residential plots, cottages, flats, and hillside villas across Dehradun, Rishikesh, Haridwar, Mussoorie, Nainital, Mukteshwar, and Almora.
                  </>
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isHindi ? '0% ब्रोकरेज मॉडल' : '0% Brokerage Model'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isHindi 
                        ? 'बिना किसी बिचौलिए के सीधे विक्रेता से संपर्क और बातचीत।' 
                        : 'Direct buyer-to-seller connections without inflated middlemen fees.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isHindi ? 'स्पष्ट टाइटल व धारा 143 नियम' : 'Clear Title & 143 Rules'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isHindi 
                        ? 'धारा 143 गैर-कृषि रूपांतरण व राजस्व रिकॉर्ड का स्पष्ट मार्गदर्शन।' 
                        : 'Clear guidance on Section 143 non-agri conversion and revenue records.'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Visual Photography of Mountain Villa Architecture */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900/60 shadow-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Uttarakhand Luxury Hillside Property"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. PLATFORM GUIDELINES & SUPPORT */}
      <section id="contact-section" className="relative">
        <div className="bg-white dark:bg-[#092218] rounded-3xl p-6 sm:p-10 border border-emerald-200/80 dark:border-emerald-900/60 shadow-lg shadow-emerald-950/5 transition-colors">
          
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'मंच के स्तंभ और सहायता' : 'Platform Pillars & Support'}</span>
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#0a271c] dark:text-white mb-2">
                {isHindi ? 'कानूनी नियम और खरीदार सहायता' : 'Legal Standards & Buyer Assistance'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isHindi 
                  ? 'उत्तराखंड भूमि कानूनों, धारा 143 रूपांतरण और संपत्ति सत्यापन में आपकी सहायता।' 
                  : 'Helping you navigate Uttarakhand land laws, Section 143 conversion, and property verification.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pillar 1: Section 143 & Land Conversion (Non-Agricultural Land Rules) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-[#0a281c] dark:to-[#071e15] border border-emerald-200/90 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                    {isHindi ? 'भूमि कानून व नियम' : 'LAND REGULATIONS'}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {isHindi ? 'गैर-कृषि भूमि नियम' : 'Non-Agricultural Land Rules'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {isHindi 
                      ? 'गैर-मूल निवासियों के लिए 250 वर्ग मीटर सीमा, धारा 143 रूपांतरण और 100% मुक्त अपार्टमेंट खरीद पर स्पष्ट नियम।' 
                      : 'Clear guidance on the 250 sq. m ceiling for non-domiciles, Section 143 conversion, and 100% unrestricted apartment purchase.'}
                  </p>
                </div>

                <div className="pt-6">
                  <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? '100% रजिस्ट्री सत्यापित' : '100% Registry Verified'}</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Direct Messaging & Phone Requests (Direct In-App Chat) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-[#0a281c] dark:to-[#071e15] border border-emerald-200/90 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                    {isHindi ? 'क्रेता-विक्रेता संदेश' : 'BUYER-SELLER MESSAGING'}
                  </span>
                  
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {isHindi ? 'प्रत्यक्ष इन-ऐप चैट' : 'Direct In-App Chat'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {isHindi 
                      ? 'संपत्ति स्वामियों को सीधे संदेश भेजें, साइट विज़िट तय करें और गोपनीयता के साथ फोन नंबर मांगें।' 
                      : 'Message property owners directly, schedule on-site visits, and request verified phone numbers with complete privacy.'}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href="?page=inbox"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isHindi ? 'इनबॉक्स खोलें' : 'Open Messages Inbox'}</span>
                  </a>
                </div>
              </div>

              {/* Pillar 3: Official Platform Inquiries */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-[#0a281c] dark:to-[#071e15] border border-emerald-200/90 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                    {isHindi ? 'प्लेटफॉर्म सहायता' : 'PLATFORM SUPPORT'}
                  </span>
                  
                  {/* Fixed Email Box: break-all ensures it never overflows */}
                  <a 
                    href="mailto:ukg@uttarakhandgateways.com" 
                    className="font-bold text-xs min-[380px]:text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block break-all leading-tight my-1"
                    title="ukg@uttarakhandgateways.com"
                  >
                    ukg@uttarakhandgateways.com
                  </a>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {isHindi 
                      ? 'लिस्टिंग पूछताछ, साझेदारी प्रस्ताव अथवा कानूनी सत्यापन के लिए हमारे सहायता डेस्क पर लिखें।' 
                      : 'For listing inquiries, partnership proposals, or legal verification queries, write to our platform desk.'}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href="mailto:ukg@uttarakhandgateways.com"
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-emerald-950/70 hover:bg-emerald-50 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'पूछताछ भेजें' : 'Send Inquiries'}</span>
                  </a>
                </div>
              </div>

            </div>

            {/* NON-AGRICULTURAL TAB AT THE BOTTOM OF ENQUIRY */}
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-100/60 via-emerald-50/70 to-teal-50/60 dark:from-[#061d15] dark:via-[#09281d] dark:to-[#071f16] border-2 border-emerald-400/50 dark:border-emerald-700/60 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
                      <Scale className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'गैर-कृषि भूमि (धारा 143)' : 'Non-Agricultural Land (Sec 143)'}</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {isHindi ? '100% फ्रीहोल्ड व खुली खरीद' : '100% Freehold & Open Purchase'}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {isHindi 
                      ? 'गैर-मूल निवासी खरीदारों के लिए धारा 143 गैर-कृषि भूमि व अपार्टमेंट' 
                      : 'Section 143 Non-Agricultural Land & Apartments For All Buyers'}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isHindi 
                      ? 'उत्तराखंड से बाहर के नागरिक 250 वर्ग मीटर (लगभग 2,690 वर्ग फुट / 1.24 नाली) तक विधिवत धारा 143 परिवर्तित गैर-कृषि भूमि तथा आवासीय फ्लैट्स/अपार्टमेंट्स बिना किसी विशेष सरकारी अनुमति के सीधे अपने नाम रजिस्ट्री करवा सकते हैं।' 
                      : 'Buyers from across India can purchase up to 250 sq. meters (~2,690 sq.ft / 1.24 Nali) of legally converted Section 143 non-agricultural land and unlimited residential apartments across Uttarakhand with immediate registry and mutation.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
                  <a
                    href="mailto:ukg@uttarakhandgateways.com?subject=Inquiry%20Regarding%20Section%20143%20Non-Agricultural%20Land"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isHindi ? 'धारा 143 भूमि पूछताछ' : 'Inquire for Non-Agri Land'}</span>
                  </a>
                  <a
                    href="?page=inbox"
                    className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#071f16] border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-[#0c2f22] text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{isHindi ? 'कानूनी टीम से चैट' : 'Chat with Legal Desk'}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
