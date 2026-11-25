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
    </div>
  );
};
