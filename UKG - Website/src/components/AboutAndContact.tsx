import React from 'react';
import {
  Mail,
  ShieldCheck,
  FileCheck2,
  Scale,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutAndContactProps {}

export const AboutAndContact: React.FC<AboutAndContactProps> = () => {
  const { isHindi } = useLanguage();

  return (
    <div className="space-y-10 py-8">
      {/* 1. ABOUT THE PLATFORM */}
      <section id="about-section" className="relative">
        <div className="bg-white dark:bg-[#092218] rounded-3xl p-6 sm:p-10 border border-emerald-200/80 dark:border-emerald-900/60 shadow-lg shadow-emerald-950/5 relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold text-[#0E3A2B] dark:text-[#F4F3EF] leading-tight font-serif-luxury">
                {isHindi
                  ? 'उत्तराखंड में प्रॉपर्टी लिस्टिंग और डिस्कवरी प्लेटफॉर्म'
                  : 'Property Listing & Discovery Across Uttarakhand'}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHindi ? (
                  <>
                    <strong>उत्तराखंड गेटवेज</strong> एक ऑनलाइन प्रॉपर्टी लिस्टिंग और डिस्कवरी मंच है जो संपत्ति मालिकों, लिस्टिंगकर्ताओं और इच्छुक खरीदारों या किरायेदारों को बिना किसी प्लेटफॉर्म शुल्क के जोड़ता है। देहरादून, ऋषिकेश, हरिद्वार, मसूरी, नैनीताल, मुक्तेश्वर और अल्मोड़ा में प्लॉट, कॉटेज, फ्लैट और विला खोजें।
                  </>
                ) : (
                  <>
                    <strong>Uttarakhand Gateways</strong> is a property listing and discovery platform connecting property owners, listers, and interested buyers or tenants directly with <strong>NO PLATFORM FEE</strong>. Explore residential plots, cottages, flats, commercial spaces, and hillside villas across Dehradun, Rishikesh, Haridwar, Mussoorie, Nainital, Mukteshwar, and Almora.
                  </>
                )}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isHindi ? 'कोई प्लेटफॉर्म शुल्क नहीं' : 'NO PLATFORM FEE'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isHindi
                        ? 'लिस्टिंग देखने और सीधे फोन या व्हाट्सएप से संपर्क करने की सुविधा।'
                        : 'Direct telephone and WhatsApp contact with listers without platform fees.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isHindi ? 'भूमि नियम एवं स्वतंत्र जांच जानकारी' : 'Land Rules & Due Diligence Info'}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isHindi
                        ? 'उत्तराखंड राजस्व रिकॉर्ड, धारा 143 और दस्तावेज़ जांच पर सामान्य जानकारी।'
                        : 'Educational guides on Uttarakhand revenue records, Section 143, and buyer due diligence.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900/60 shadow-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Uttarakhand Hillside Property"
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
        <div className="bg-[#FAF9F6] dark:bg-[#0C3628] rounded-3xl p-6 sm:p-10 border border-emerald-200/80 dark:border-[#32463D]/70 shadow-lg shadow-[#032D1F]/5 transition-colors">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'मंच जानकारी और सहायता' : 'Platform Information & Support'}</span>
              </div>
              <h3 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#0E3A2B] dark:text-[#F4F3EF] mb-2">
                {isHindi ? 'मार्गदर्शन और सहायता डेस्क' : 'Buyer Awareness & Platform Support'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isHindi
                  ? 'प्रत्येक लेनदेन से पूर्व संपत्ति दस्तावेज़ों और भूमि रिकॉर्ड की स्वतंत्र जांच अवश्य करें।'
                  : 'Always conduct independent verification of property ownership, land records, and legal approvals before any transaction.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-[#0a281c] dark:to-[#071e15] border border-emerald-200/90 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                    {isHindi ? 'भूमि कानून जानकारी' : 'LAND REGULATIONS'}
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {isHindi ? 'स्वतंत्र दस्तावेज़ सत्यापन' : 'Independent Record Verification'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {isHindi
                      ? 'खरीदारों को मूल रजिस्ट्री, खतौनी/खसरा, दाखिल-खारिज और लागू भूमि अनुमतियों की योग्य वकील से जांच करानी चाहिए।'
                      : 'Buyers should independently check original title deeds, Khatauni/Khasra records, mutation entries, and applicable state land rules with a lawyer.'}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href="/guides"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'भूमि गाइड पढ़ें' : 'Read Property Guides'}</span>
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-[#0a281c] dark:to-[#071e15] border border-emerald-200/90 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                    {isHindi ? 'सीधा संवाद' : 'DIRECT COMMUNICATION'}
                  </span>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {isHindi ? 'कॉल, व्हाट्सएप और चैट' : 'Call, WhatsApp & Direct Chat'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {isHindi
                      ? 'प्रत्येक लिस्टिंग पर प्रकाशित संपर्क नंबर के माध्यम से बिना लॉगिन किए सीधे कॉल या व्हाट्सएप करें।'
                      : 'Contact property listers directly via publicly displayed telephone numbers and WhatsApp links without needing to log in.'}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href="/buy"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isHindi ? 'प्रॉपर्टीज़ देखें' : 'Browse Properties'}</span>
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-[#0a281c] dark:to-[#071e15] border border-emerald-200/90 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-sm shadow-emerald-600/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="block text-[11px] font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                    {isHindi ? 'प्लेटफॉर्म सहायता' : 'PLATFORM SUPPORT'}
                  </span>

                  <a
                    href="mailto:ukg@uttarakhandgateways.com"
                    className="font-bold text-xs min-[380px]:text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block break-all leading-tight my-1"
                    title="ukg@uttarakhandgateways.com"
                  >
                    ukg@uttarakhandgateways.com
                  </a>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {isHindi
                      ? 'लिस्टिंग सहायता, तकनीकी प्रश्न या किसी शिकायत के निवारण हेतु हमारे सहायता डेस्क पर ईमेल करें।'
                      : 'For listing support, technical help, or grievance redressal regarding platform content, write to our support desk.'}
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href="mailto:ukg@uttarakhandgateways.com"
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-emerald-950/70 hover:bg-emerald-50 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'ईमेल भेजें' : 'Email Support'}</span>
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
