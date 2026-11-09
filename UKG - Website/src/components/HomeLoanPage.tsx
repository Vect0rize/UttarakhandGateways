import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  HelpCircle, 
  CheckCircle2, 
  FileText, 
  Award,
  ChevronDown,
  ChevronUp,
  Percent,
  Clock,
  Landmark,
  BadgePercent
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { HomeLoanCalculator, TOP_BANKS } from './HomeLoanCalculator';
import { BankLogo } from './BankLogo';

interface HomeLoanPageProps {
  onBackToMain: () => void;
  onNavigatePage?: (page: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const HomeLoanPage: React.FC<HomeLoanPageProps> = ({
  onBackToMain,
  onNavigatePage,
  isDark: propIsDark,
  onToggleTheme,
}) => {
  const { isHindi } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Synchronize with website's dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof propIsDark === 'boolean') return propIsDark;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             document.body.classList.contains('dark') || 
             localStorage.getItem('uk_gateways_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (typeof propIsDark === 'boolean') {
      setIsDark(propIsDark);
      return;
    }
    const updateTheme = () => {
      const dark = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark') || 
                   localStorage.getItem('uk_gateways_theme') === 'dark';
      setIsDark(dark);
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [propIsDark]);

  const faqs = [
    {
      q: isHindi ? '₹50,000 मासिक वेतन पर मुझे कितना होम लोन मिल सकता है?' : 'How much home loan can I get on a ₹50,000 monthly salary?',
      a: isHindi 
        ? '₹50,000 के मासिक वेतन पर, 55% FOIR और 20 वर्ष की अवधि (7% - 8.5% ब्याज दर) के अनुसार आप लगभग ₹25 लाख से ₹32 लाख तक के ऋण के लिए पात्र हो सकते हैं, बशर्ते आपकी कोई मौजूदा ईएमआई न हो।'
        : 'On a ₹50,000 net monthly salary with a standard 55% FOIR over a 20-year tenure at 7.5% - 8.5% interest, you typically qualify for a loan between ₹25 Lac to ₹32 Lac, assuming zero ongoing EMI obligations.'
    },
    {
      q: isHindi ? 'क्या गैर-उत्तराखंड निवासी उत्तराखंड में होम लोन ले सकते हैं?' : 'Can non-residents of Uttarakhand get a home loan to buy property in Uttarakhand?',
      a: isHindi 
        ? 'हाँ, भारतीय नागरिक राज्य के म्यूनिसिपल / एमडीडीए क्षेत्रों में 250 वर्ग मीटर (1.25 नाली) तक की आवासीय भूमि या स्वीकृत फ्लैट खरीद सकते हैं और राष्ट्रीयकृत बैंक (एसबीआई, बैंक ऑफ बड़ौदा आदि) इसके लिए होम लोन स्वीकृत करते हैं।'
        : 'Yes, any Indian citizen can purchase up to 250 sq. meters of municipal/MDDA-approved land or apartments in Uttarakhand, and all major banks like SBI, Bank of Baroda, HDFC, and ICICI provide housing loans against valid registered titles.'
    },
    {
      q: isHindi ? 'FOIR क्या है और यह मेरी लोन पात्रता को कैसे प्रभावित करता है?' : 'What is FOIR and how does it determine loan eligibility?',
      a: isHindi 
        ? 'FOIR (Fixed Obligation to Income Ratio) का अर्थ है आपकी कुल आय का वह प्रतिशत जो ऋण किश्तों में जा सकता है। बैंक आमतौर पर 50% से 60% FOIR स्वीकार करते हैं ताकि आपके पास आवश्यक जीवनयापन खर्च शेष रहे।'
        : 'FOIR stands for Fixed Obligation to Income Ratio. Banks calculate how much of your monthly income can safely go toward debt repayments (usually 50% to 60%). The higher your disposable income, the higher loan principal sanctioned.'
    },
    {
      q: isHindi ? 'उत्तराखंड होमस्टे और पर्यटन योजना के तहत क्या विशेष सब्सिडी उपलब्ध है?' : 'What subsidies are available for Uttarakhand homestays and residential properties?',
      a: isHindi 
        ? 'उत्तराखंड वीर चंद्र सिंह गढ़वाली योजना और दीनदयाल उपाध्याय होमस्टे योजना के तहत पहाड़ी क्षेत्रों में 33% से 50% तक (अधिकतम ₹15 लाख) की पूंजी सब्सिडी और ऋण ब्याज पर सब्सिडी प्रदान की जाती है।'
        : 'Under the Deen Dayal Upadhyay Homestay Scheme and Veer Chandra Singh Garhwali Tourism Scheme, the Uttarakhand government offers 33% to 50% capital subsidies (up to ₹15 Lakhs) plus interest subsidies on homestay property loans.'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#04140e] text-slate-100' : 'bg-[#f8faf8] text-slate-900'
    }`}>
      
      {/* Top Header / Nav */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDark 
          ? 'bg-[#061e16]/95 border-emerald-900/60 shadow-lg shadow-black/20' 
          : 'bg-white/95 border-slate-200/90 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Back & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMain}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isDark 
                  ? 'border-emerald-800 bg-[#09291f] text-emerald-300 hover:bg-[#0d382b]' 
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHindi ? 'मुख्य पृष्ठ' : 'Back to Home'}</span>
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Home</span>
              <span>/</span>
              <span className={isDark ? 'text-emerald-400 font-bold' : 'text-slate-700 font-bold'}>
                Home Loan Eligibility & EMI
              </span>
            </div>
          </div>

          {/* UKG Loan Calculator Brand Logo */}
          <div className="flex items-center gap-2 select-none">
            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs sm:text-sm tracking-wider shadow-xs">
              UKG
            </span>
            <span className={`text-xl sm:text-2xl font-black tracking-tight font-serif-luxury ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Loan Calculator
            </span>
          </div>

        </div>
      </header>

      {/* Hero Headline Banner */}
      <section className={`py-8 sm:py-12 border-b relative overflow-hidden ${
        isDark 
          ? 'bg-gradient-to-b from-[#061e16] via-[#082b20] to-[#04140e] border-emerald-900/60' 
          : 'bg-gradient-to-b from-white via-amber-50/30 to-[#f8faf8] border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold border shadow-xs bg-red-50 text-[#d8232a] border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60">
            <BadgePercent className="w-4 h-4" />
            <span>Special Uttarakhand Hill Loan Rates • Lowest 7.0% p.a.</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-serif-luxury">
            {isHindi ? 'होम लोन पात्रता एवं ईएमआई कैलकुलेटर' : 'Home Loan Eligibility & EMI Calculator'}
          </h1>
          
          <p className={`text-sm sm:text-base max-w-3xl mx-auto leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {isHindi 
              ? '40+ शीर्ष बैंकों (एसबीआई, बैंक ऑफ बड़ौदा, एचडीएफसी, आईसीआईसीआई) की ब्याज दरों की तुलना करें, अपनी मासिक पात्रता जांचें और तुरंत स्वीकृति प्राप्त करें।'
              : 'Calculate your maximum housing loan eligibility based on monthly income, explore offers from 40+ leading banks, and get end-to-end digital assistance for property in Uttarakhand.'}
          </p>

          {/* Quick Bank Trust Badges */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 pt-4 flex-wrap">
            {TOP_BANKS.slice(0, 5).map((b) => (
              <div key={b.code} className="flex items-center gap-2">
                <BankLogo code={b.code} size="sm" />
                <div className="text-left">
                  <span className={`text-[11px] font-bold block leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {b.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                    {b.rate}% p.a.
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Main Dual-Card Calculator Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        
        {/* The Magicbricks-Style Eligibility Calculator Component */}
        <HomeLoanCalculator isDark={isDark} />

        {/* Detailed Bank Comparison Matrix */}
        <section className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
          isDark 
            ? 'bg-[#061e16] border-emerald-900/60' 
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-emerald-900/60">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#d8232a] uppercase tracking-wider mb-1">
                <Landmark className="w-3.5 h-3.5" />
                <span>Verified Partner Offers</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {isHindi ? 'शीर्ष बैंकों की ब्याज दर तुलना' : 'Top Banks Interest Rates & Processing Fees'}
              </h2>
            </div>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Updated Daily • October 2026
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className={`border-b text-slate-500 dark:text-slate-400 ${
                  isDark ? 'border-emerald-900/50' : 'border-slate-200'
                }`}>
                  <th className="py-3 px-4 font-bold">Bank Name</th>
                  <th className="py-3 px-4 font-bold">Interest Rate</th>
                  <th className="py-3 px-4 font-bold">Max Loan Tenure</th>
                  <th className="py-3 px-4 font-bold">Processing Charges</th>
                  <th className="py-3 px-4 font-bold">Max LTV</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
                {TOP_BANKS.map((bank) => (
                  <tr key={bank.code} className="hover:bg-slate-50 dark:hover:bg-emerald-950/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <BankLogo code={bank.code} size="md" />
                        <div>
                          <div className="font-extrabold flex items-center gap-2">
                            <span>{bank.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-[#d8232a] dark:text-red-300 font-bold">
                              {bank.tag}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {bank.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 text-base">
                      {bank.rate}%
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {bank.maxTerm}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-400">
                      {bank.processingFee}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {bank.maxLtv}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="inline-block px-4 py-2 rounded-full bg-[#d8232a] hover:bg-[#b81d23] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Check EMI
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Documentation Required for Uttarakhand Property Loans */}
        <section className={`p-6 sm:p-8 rounded-3xl border shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 ${
          isDark 
            ? 'bg-[#061e16] border-emerald-900/60' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#d8232a] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              {isHindi ? '1. पहचान एवं आय दस्तावेज' : '1. KYC & Income Proof'}
            </h3>
            <ul className="text-xs sm:text-sm space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>PAN Card, Aadhaar Card, Passport / Voter ID</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Last 3 months salary slips & 6 months bank statement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Form 16 or latest 2 years ITR filings</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              {isHindi ? '2. उत्तराखंड भूमि एवं संपत्ति दस्तावेज' : '2. Uttarakhand Land Documents'}
            </h3>
            <ul className="text-xs sm:text-sm space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Bhulekh Khatauni & Khasra land title records</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Registered Sale Agreement / Bayana receipt</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>MDDA / RERA / Zila Panchayat building map sanction</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              {isHindi ? '3. विशेष सब्सिडी एवं लाभ' : '3. Subsidies & Hill Concessions'}
            </h3>
            <ul className="text-xs sm:text-sm space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>0.05% interest discount for women co-applicants</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Uttarakhand Homestay subsidy up to ₹15 Lac</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Zero prepayment penalty on floating rate loans</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQs Section */}
        <section className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-4 ${
          isDark 
            ? 'bg-[#061e16] border-emerald-900/60' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-[#d8232a] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {isHindi ? 'अक्सर पूछे जाने वाले सवाल' : 'Home Loan FAQs'}
          </h2>

          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  openFaq === idx
                    ? isDark ? 'bg-[#08291f] border-emerald-600' : 'bg-red-50/40 border-red-200'
                    : isDark ? 'bg-[#04160f] border-emerald-900/60' : 'bg-slate-50/80 border-slate-200'
                }`}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4 font-bold text-sm sm:text-base">
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#d8232a] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                {openFaq === idx && (
                  <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer onCityClick={() => {}} onCategoryClick={() => {}} />

    </div>
  );
};
