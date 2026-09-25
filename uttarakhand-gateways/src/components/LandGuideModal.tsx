import React, { useState } from 'react';
import { X, ShieldCheck, BookOpen, AlertCircle, CheckCircle, Scale, FileText, ChevronRight } from 'lucide-react';

interface LandGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUnitConverter: () => void;
}

export const LandGuideModal: React.FC<LandGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenUnitConverter,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | '143' | 'units' | 'checklist'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0d1722] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Uttarakhand Property & Land Laws Guide</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  Legal Advisory
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understanding Section 154, 250 Sq. Mtr Rule, Section 143, & RERA Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Can Non-Residents Buy? (Section 154)
          </button>
          <button
            onClick={() => setActiveTab('143')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === '143'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Section 143 (Freehold Conversion)
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'units'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Nali, Gaj & Measurement Units
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Due Diligence Checklist
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {activeTab === 'rules' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <CheckCircle className="w-5 h-5" />
                  <span>The Golden Rule: Yes, Any Indian Citizen Can Buy Property in Uttarakhand!</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Indian nationals from any state or union territory are legally permitted to purchase real estate in Uttarakhand under well-defined state revenue laws.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Flats & Apartments: Zero Area Limit</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under Uttarakhand development authority rules (MDDA, NLDA, etc.), any Indian citizen can purchase <strong>unlimited number of flats, apartments, or penthouses</strong> in municipal or approved group housing schemes without any ceiling on area.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Hill Land & Plots: 250 Sq. Mtr Rule</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under Section 154 of the Uttarakhand Land Revenue Act, a non-domicile individual can purchase up to <strong>250 square meters (approx 2,690 sq. ft or 1.25 Nali / 298 Sq. Yards)</strong> of land in rural/hill regions outside municipal limits for residential purposes without needing government permission.
                  </p>
                </div>

              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200/90 leading-relaxed">
                💡 <strong>Family Co-ownership:</strong> If you desire a larger parcel (e.g. 500 or 1,000 sq. mtrs) for an orchard or family estate, multiple adult family members can co-own independent 250 sq. mtr parcels adjacent to each other with clean separate registries.
              </div>

            </div>
          )}

          {activeTab === '143' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                <h4 className="text-base font-bold text-amber-300">
                  What is Section 143 (Non-Agricultural Land Conversion)?
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  In Uttarakhand, historical revenue records classify land as either agricultural (krishi) or non-agricultural (abadi/residential). Section 143 of the U.P. Zamindari Abolition and Land Reforms Act (adopted by Uttarakhand) allows converting agricultural land to residential status.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">Bank Loan Eligibility:</strong>
                    <span className="text-xs text-slate-400">Nationalized and private banks (SBI, HDFC, ICICI) require Section 143 clearance to sanction home construction loans on hill plots.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">Permanent Residential Building Permission:</strong>
                    <span className="text-xs text-slate-400">Once 143 order is passed by the Sub-Divisional Magistrate (SDM), construction of cottages, villas, and boundary walls is completely protected by law.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">Uttarakhand Gateways Guarantee:</strong>
                    <span className="text-xs text-slate-400">All residential plots and villas listed on Uttarakhand Gateways come with pre-verified 143 conversion or complete chain deeds.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10">
                <h4 className="text-base font-bold text-amber-300 mb-2">
                  Traditional Uttarakhand Land Measurement Units
                </h4>
                <p className="text-xs text-slate-300 mb-4">
                  In Kumaon and Garhwal, land is measured using historic units known as <strong>Nali</strong> and <strong>Mutthi</strong>:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold block text-sm">1 Nali</span>
                    <span className="text-slate-300">2,160 Sq. Feet</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold block text-sm">1 Nali</span>
                    <span className="text-slate-300">240 Sq. Yards (Gaj)</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold block text-sm">1 Nali</span>
                    <span className="text-slate-300">16 Mutthi (मुट्ठी)</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold block text-sm">1 Bigha (UK)</span>
                    <span className="text-slate-300">6,804 Sq. Feet</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold block text-sm">1 Bigha</span>
                    <span className="text-slate-300">3.15 Nali</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-amber-400 font-bold block text-sm">1 Acre</span>
                    <span className="text-slate-300">20.16 Nali</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUnitConverter();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open Interactive Unit Converter Tool</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white">
                Buyer’s 5-Point Title Due Diligence in Uttarakhand
              </h4>
              <div className="space-y-2.5">
                {[
                  { title: "1. 30-Year Search Report (Nil Encumbrance)", desc: "Confirms that the property has no pending court litigations, prior mortgages, or government attachments." },
                  { title: "2. Khasra & Khatoni (Bhulekh Uttarakhand)", desc: "Official land revenue records verified online on Bhulekh portal proving the seller's mutated ownership." },
                  { title: "3. Clear Motorable Road Right of Way (Rasta Nali)", desc: "Ensure recorded government road touch or registered private easement path in the revenue map (Shajra)." },
                  { title: "4. Dakhil Kharij (Mutation) Guarantee", desc: "After deed registration at the Sub-Registrar Tehsil office, mutation into your name must be completed within 35 days." },
                  { title: "5. RERA / Local Authority Sanction", desc: "For apartments and gated developments, verify RERA registration number and MDDA / District Town Planning sanction." }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-white">{item.title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Assisted by legal counsels at Uttarakhand Gateways
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
          >
            Understood & Close
          </button>
        </div>

      </div>
    </div>
  );
};
