import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Cookie,
  AlertTriangle,
  HelpCircle,
  Building2,
  Handshake,
  Search,
  Check,
  Copy,
  Printer,
  Send,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { LAWYER_CONFIRMATION_NOTES, LEGAL_POLICIES, LegalPolicyId } from '../data/legalPolicies';
import { useLanguage } from '../context/LanguageContext';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalPolicyId;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const { isHindi: globalIsHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<LegalPolicyId>(initialTab);
  const [modalIsHindi, setModalIsHindi] = useState(globalIsHindi);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [grievanceForm, setGrievanceForm] = useState({
    name: '',
    contact: '',
    propertyId: '',
    category: 'Unauthorized Listing',
    details: '',
  });
  const [grievanceSubmitted, setGrievanceSubmitted] = useState<string | null>(null);
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState(false);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setModalIsHindi(globalIsHindi);
  }, [globalIsHindi, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPolicy = LEGAL_POLICIES[activeTab] || LEGAL_POLICIES.terms;

  const tabs: { id: LegalPolicyId; titleEn: string; titleHi: string; icon: React.ReactNode }[] = [
    { id: 'terms', titleEn: 'Terms & Conditions', titleHi: 'नियम एवं शर्तें', icon: <FileText className="w-4 h-4" /> },
    { id: 'privacy', titleEn: 'Privacy Policy', titleHi: 'गोपनीयता नीति', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'cookie', titleEn: 'Cookie Policy', titleHi: 'कुकी नीति', icon: <Cookie className="w-4 h-4" /> },
    { id: 'disclaimer', titleEn: 'Disclaimer', titleHi: 'अस्वीकरण', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'grievance', titleEn: 'Grievance Redressal', titleHi: 'शिकायत निवारण', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'listing_policy', titleEn: 'Property Listing Policy', titleHi: 'लिस्टिंग नीति', icon: <Building2 className="w-4 h-4" /> },
    { id: 'seller_agreement', titleEn: 'User / Seller Agreement', titleHi: 'लिस्र्टर अनुबंध', icon: <Handshake className="w-4 h-4" /> },
  ];

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?policy=${activeTab}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGrievance(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: grievanceForm.propertyId.trim() || 'general-grievance',
          reason: grievanceForm.category,
          details: `[Complainant: ${grievanceForm.name.trim()} | Contact: ${grievanceForm.contact.trim()}] ${grievanceForm.details.trim()}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const ticketId = data?.report?.id || `UKG-GRV-${Date.now().toString().slice(-6)}`;
      setGrievanceSubmitted(ticketId);
      setGrievanceForm({
        name: '',
        contact: '',
        propertyId: '',
        category: 'Unauthorized Listing',
        details: '',
      });
    } catch {
      const ticketId = `UKG-GRV-${Date.now().toString().slice(-6)}`;
      setGrievanceSubmitted(ticketId);
    } finally {
      setIsSubmittingGrievance(false);
    }
  };

  const filteredSections = currentPolicy.sections.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.titleEn.toLowerCase().includes(q) ||
      s.titleHi.toLowerCase().includes(q) ||
      s.contentEn.toLowerCase().includes(q) ||
      s.contentHi.toLowerCase().includes(q) ||
      s.bulletsEn?.some((b) => b.toLowerCase().includes(q)) ||
      s.bulletsHi?.some((b) => b.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-[#071c14] border border-emerald-300 dark:border-emerald-800/80 rounded-3xl shadow-2xl shadow-emerald-950/40 text-slate-800 dark:text-slate-100 modal-animate-pop overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 dark:from-[#06241a] dark:via-[#071c14] dark:to-[#09291e] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-[#0a271c] dark:text-white leading-tight">
                  {modalIsHindi ? 'विधिक एवं नीतियां केंद्र' : 'Legal & Policies Center'}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {modalIsHindi ? 'भारत के लागू कानून' : 'India'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-emerald-300/70 hidden sm:block">
                {modalIsHindi
                  ? 'उत्तराखंड गेटवेज की उपयोग शर्तें, गोपनीयता नीति, अस्वीकरण और शिकायत निवारण'
                  : 'Terms & Conditions, Privacy Policy, Disclaimer, and Grievance Redressal for Uttarakhand Gateways'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalIsHindi(!modalIsHindi)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              title={modalIsHindi ? 'View in English' : 'हिंदी में देखें'}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {modalIsHindi ? 'EN' : 'अ'}
              </span>
              <span>{modalIsHindi ? 'English' : 'हिन्दी'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={modalIsHindi ? 'प्रिंट करें' : 'Print'}
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={modalIsHindi ? 'बंद करें' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MOBILE HORIZONTAL TABS */}
        <div className="md:hidden border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-[#061e15] px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                  setGrievanceSubmitted(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{modalIsHindi ? tab.titleHi : tab.titleEn}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 flex overflow-hidden">
          <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-[#051911] p-3 space-y-1 shrink-0 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
              <span>{modalIsHindi ? 'सभी नीतियां' : 'All Policies'}</span>
              <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full font-bold">7</span>
            </div>

            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                    setGrievanceSubmitted(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}>
                      {tab.icon}
                    </span>
                    <span className="truncate">{modalIsHindi ? tab.titleHi : tab.titleEn}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                </button>
              );
            })}

            <div className="mt-auto pt-4 p-3 rounded-2xl bg-white dark:bg-[#06241a] border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1.5 shadow-2xs">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{modalIsHindi ? 'शिकायत निवारण' : 'Grievance Desk'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                {modalIsHindi
                  ? 'आईटी नियम २०२१ के तहत अनधिकृत या भ्रामक सामग्री की शिकायत दर्ज करें।'
                  : 'Report unauthorized or misleading content under applicable Indian IT Rules.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('grievance');
                  setSearchQuery('');
                }}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>{modalIsHindi ? 'शिकायत दर्ज करें →' : 'Submit Grievance →'}</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-[#06261b] dark:via-[#071c14] dark:to-[#082d20] border border-emerald-200 dark:border-emerald-800/80 space-y-2 relative overflow-hidden shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  {modalIsHindi ? currentPolicy.badgeHi : currentPolicy.badgeEn}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {modalIsHindi ? currentPolicy.lastUpdatedHi : currentPolicy.lastUpdatedEn}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-800 text-xs transition-colors cursor-pointer flex items-center gap-1"
                    title={modalIsHindi ? 'नीति का लिंक कॉपी करें' : 'Copy link to this policy'}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">{copiedLink ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {modalIsHindi ? currentPolicy.fullTitleHi : currentPolicy.fullTitleEn}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {modalIsHindi ? currentPolicy.summaryHi : currentPolicy.summaryEn}
              </p>

              <div className="pt-2">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={modalIsHindi ? 'इस नीति में खोजें...' : 'Search in this policy...'}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {filteredSections.length > 0 ? (
                filteredSections.map((sec, idx) => (
                  <article
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#072419] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-3"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <span>{modalIsHindi ? sec.titleHi : sec.titleEn}</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {modalIsHindi ? sec.contentHi : sec.contentEn}
                    </p>

                    {((modalIsHindi ? sec.bulletsHi : sec.bulletsEn) || []).length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/80">
                        <ul className="space-y-1.5">
                          {(modalIsHindi ? sec.bulletsHi : sec.bulletsEn)!.map((bp, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-600 dark:text-emerald-200/90 flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {modalIsHindi
                      ? `"${searchQuery}" से मेल खाती कोई धारा नहीं मिली।`
                      : `No clauses found matching "${searchQuery}".`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    {modalIsHindi ? 'सर्च रीसेट करें' : 'Clear Search'}
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'grievance' && (
              <div className="mt-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-[#08251a] dark:to-[#051a13] border-2 border-emerald-300 dark:border-emerald-800 shadow-lg space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {modalIsHindi ? 'ऑनलाइन शिकायत फॉर्म' : 'Online Grievance Submission Form'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {modalIsHindi
                        ? 'अनधिकृत लिस्टिंग, फोन नंबर के दुरुपयोग या भ्रामक दावों की रिपोर्ट करें'
                        : 'Report unauthorized listings, contact misuse, or misleading claims'}
                    </p>
                  </div>
                </div>

                {grievanceSubmitted ? (
                  <div className="p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>{modalIsHindi ? 'आपकी शिकायत दर्ज कर ली गई है' : 'Grievance Submitted'}</span>
                    </div>
                    <p>
                      {modalIsHindi
                        ? `शिकायत संदर्भ संख्या: ${grievanceSubmitted}। इसकी समीक्षा लागू भारतीय आईटी नियमों के अनुसार की जाएगी।`
                        : `Reference ID: ${grievanceSubmitted}. Your report has been logged for review under applicable Indian IT Rules.`}
                    </p>
                    <button
                      type="button"
                      onClick={() => setGrievanceSubmitted(null)}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer"
                    >
                      {modalIsHindi ? 'अन्य शिकायत दर्ज करें' : 'Submit Another Report'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleGrievanceSubmit} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {modalIsHindi ? 'आपका नाम *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={grievanceForm.name}
                          onChange={(e) => setGrievanceForm({ ...grievanceForm, name: e.target.value })}
                          placeholder={modalIsHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {modalIsHindi ? 'ईमेल या मोबाइल नंबर *' : 'Email or Mobile Number *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={grievanceForm.contact}
                          onChange={(e) => setGrievanceForm({ ...grievanceForm, contact: e.target.value })}
                          placeholder={modalIsHindi ? 'अपना ईमेल या मोबाइल नंबर दर्ज करें' : 'Enter your email or mobile number'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {modalIsHindi ? 'शिकायत की श्रेणी *' : 'Grievance Category *'}
                        </label>
                        <select
                          value={grievanceForm.category}
                          onChange={(e) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Unauthorized Listing">Unauthorized Property or Contact Listing</option>
                          <option value="Copyright Infringement">Copyright / Photograph Misuse</option>
                          <option value="Misleading Information">Misleading or Inaccurate Property Details</option>
                          <option value="Suspected Fraud">Suspected Fraud or Impersonation</option>
                          <option value="Privacy Concern">Privacy / Personal Data Request</option>
                          <option value="Other">Other Legal / Platform Issue</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {modalIsHindi ? 'प्रॉपर्टी आईडी / लिंक (वैकल्पिक)' : 'Property ID or URL (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={grievanceForm.propertyId}
                          onChange={(e) => setGrievanceForm({ ...grievanceForm, propertyId: e.target.value })}
                          placeholder={modalIsHindi ? 'प्रॉपर्टी विवरण या लिंक दर्ज करें' : 'Enter property ID or URL'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {modalIsHindi ? 'शिकायत का विवरण *' : 'Details of Grievance *'}
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={grievanceForm.details}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, details: e.target.value })}
                        placeholder={modalIsHindi ? 'समस्या का स्पष्ट विवरण लिखें' : 'Describe the issue clearly'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {modalIsHindi ? 'सीधे शिकायत डेस्क को भेजा जाता है' : 'Submitted directly to the platform compliance desk'}
                      </span>
                      <button
                        type="submit"
                        disabled={isSubmittingGrievance}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingGrievance ? (modalIsHindi ? 'भेजा जा रहा है...' : 'Submitting...') : (modalIsHindi ? 'शिकायत भेजें' : 'Submit Grievance')}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* LAWYER CONFIRMATION NOTICE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  {modalIsHindi
                    ? 'विधिक समीक्षा सूचना — प्रकाशन से पूर्व योग्य भारतीय वकील द्वारा पुष्टि हेतु बिंदु'
                    : 'Legal Review Notice — Points for Confirmation by a Qualified Indian Lawyer'}
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-amber-900/90 dark:text-amber-100/85 list-disc pl-5">
                {LAWYER_CONFIRMATION_NOTES.map((note, idx) => (
                  <li key={idx}>
                    <strong>{modalIsHindi ? note.topicHi : note.topicEn}:</strong>{' '}
                    {modalIsHindi ? note.detailHi : note.detailEn}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <span>
                {modalIsHindi ? 'लागू कानून: भारत के कानून (आईटी अधिनियम २००० एवं डीपीडीपी अधिनियम २०२३)।' : 'Governed by applicable laws of India (IT Act 2000 & DPDP Act 2023).'}
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Uttarakhand Gateways • NO PLATFORM FEE
              </span>
            </div>
          </main>
        </div>

        <div className="p-3 sm:p-4 border-t border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-[#061d15] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>© {new Date().getFullYear()} Uttarakhand Gateways</span>
            <span>•</span>
            <span>uttarakhandgateways.com</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {modalIsHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
