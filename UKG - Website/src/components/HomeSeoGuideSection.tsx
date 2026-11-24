import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Scale, FileCheck, MapPin, Sparkles, Building, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HomeSeoGuideSection: React.FC = () => {
  const { isHindi } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const guides = [
    {
      id: 'what-is-ukg',
      icon: <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      titleEn: 'What is Uttarakhand Gateways and How Does the Platform Work?',
      titleHi: 'उत्तराखंड गेटवेज क्या है और यह मंच कैसे काम करता है?',
      contentEn: 'Uttarakhand Gateways is an online property listing and discovery platform dedicated to properties across Uttarakhand. Property owners and listers publish their sale or rental listings along with direct contact details, and interested buyers or tenants can connect directly via phone or WhatsApp with NO PLATFORM FEE.',
      contentHi: 'उत्तराखंड गेटवेज उत्तराखंड की संपत्तियों के लिए एक ऑनलाइन प्रॉपर्टी लिस्टिंग और डिस्कवरी मंच है। संपत्ति मालिक और लिस्टिंगकर्ता अपने बिक्री या किराये के विज्ञापन सीधे संपर्क विवरण के साथ प्रकाशित करते हैं, और इच्छुक खरीदार या किरायेदार बिना किसी प्लेटफॉर्म शुल्क के सीधे फोन या व्हाट्सएप द्वारा संपर्क कर सकते हैं।'
    },
    {
      id: 'outside-buyers-rules',
      icon: <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      titleEn: 'Can People Outside Uttarakhand Buy Land & Property in Uttarakhand?',
      titleHi: 'क्या उत्तराखंड से बाहर के नागरिक उत्तराखंड में जमीन या संपत्ति खरीद सकते हैं?',
      contentEn: 'Yes, absolutely. Any Indian citizen can legally purchase property in Uttarakhand. Under Section 154 of the UPZA & LR Act, non-residents of Uttarakhand can purchase up to 250 square meters (approximately 2,700 sq.ft or ~1.25 Nali) of agricultural/rural land per family without needing special government permissions. Furthermore, within municipal corporation boundaries, municipal boards, and MDDA limits (such as Dehradun, Haridwar, and Rishikesh), there is NO land ceiling limit for purchasing apartments, commercial properties, or residential plots.',
      contentHi: 'हाँ, बिल्कुल। भारत का कोई भी नागरिक उत्तराखंड में कानूनी रूप से संपत्ति खरीद सकता है। यूपीजेडए एवं एलआर अधिनियम की धारा 154 के तहत, राज्य से बाहर के नागरिक बिना किसी विशेष सरकारी अनुमति के 250 वर्ग मीटर (लगभग 2,700 वर्ग फुट या 1.25 नाली) तक की ग्रामीण भूमि प्रति परिवार खरीद सकते हैं। इसके अतिरिक्त, नगर निगमों, नगर पालिका क्षेत्रों और एमडीडीए सीमा (जैसे देहरादून, हरिद्वार, ऋषिकेश) में फ्लैट, वाणिज्यिक संपत्ति या आवासीय भूखंड खरीदने पर कोई ऊपरी सीमा नहीं है।'
    },
    {
      id: 'section-143',
      icon: <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      titleEn: 'What is Section 143 (Non-Agricultural Land Conversion) in Uttarakhand?',
      titleHi: 'उत्तराखंड में धारा 143 (गैर-कृषि भूमि रूपांतरण) क्या है?',
      contentEn: 'Section 143 (and corresponding revenue provisions) relates to administrative conversion of agricultural land for non-agricultural residential or commercial use by the competent revenue authority. Before purchasing plots or land in Uttarakhand, prospective buyers should independently verify revenue records, conversion orders, and title documents with a qualified lawyer.',
      contentHi: 'धारा 143 (एवं संबंधित राजस्व प्रावधान) सक्षम राजस्व अधिकारी द्वारा कृषि भूमि के गैर-कृषि आवासीय या व्यावसायिक उपयोग में रूपांतरण से संबंधित है। उत्तराखंड में प्लॉट या भूमि खरीदने से पहले खरीदारों को योग्य वकील के माध्यम से मूल राजस्व रिकॉर्ड, रूपांतरण आदेश और स्वामित्व दस्तावेजों की स्वतंत्र जांच अवश्य करनी चाहिए।'
    },
    {
      id: 'land-measurements',
      icon: <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      titleEn: 'Understanding Traditional Uttarakhand Land Units: Nali, Mutthi & Bigha',
      titleHi: 'उत्तराखंड की पारंपरिक भूमि माप इकाइयां: नाली, मुट्ठी और बीघा',
      contentEn: 'In Uttarakhand hills, land is traditionally measured in Nali and Mutthi: 1 Nali = 16 Mutthi = 2,160 square feet (approx 200.7 sq.m or 240 sq. yards / Gaj). 1 Uttarakhand Bigha equals approximately 3.15 Nalis or 6,804 square feet. In plains like Haridwar and Udham Singh Nagar, Pucca Bigha equals 27,225 sq.ft. You can use our built-in UKG Land Unit Converter to easily translate hill units into square feet, square meters, Gaj, and acres.',
      contentHi: 'उत्तराखंड के पहाड़ी क्षेत्रों में भूमि को पारंपरिक रूप से नाली और मुट्ठी में मापा जाता है: 1 नाली = 16 मुट्ठी = 2,160 वर्ग फुट (लगभग 200.7 वर्ग मीटर या 240 वर्ग गज)। 1 उत्तराखंड बीघा लगभग 3.15 नाली या 6,804 वर्ग फुट के बराबर होता है। मैदानी क्षेत्रों (जैसे हरिद्वार, ऊधमसिंह नगर) में पक्का बीघा 27,225 वर्ग फुट का होता है। आप हमारे यूकेजी लैंड कैलकुलेटर से नाली, मुट्ठी, गज और वर्ग फुट में सटीक रूपांतरण कर सकते हैं।'
    },
    {
      id: 'top-cities',
      icon: <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      titleEn: 'Where are the Best Places to Buy Real Estate in Uttarakhand?',
      titleHi: 'उत्तराखंड में प्रॉपर्टी व जमीन खरीदने के लिए सबसे बेहतरीन स्थान कौन से हैं?',
      contentEn: 'Popular investment hubs include Dehradun (capital city with prime education, healthcare, and urban conveniences), Mussoorie & Dhanaulti (scenic hill retreats), Rishikesh (world yoga capital, spiritual living along the Ganga, with top rental hubs near AIIMS Rishikesh, Visthapit Colony, Aam Bagh, and Seema Dental College), Nainital & Bhimtal (famous lake district retreats), Mukteshwar & Ramgarh (panoramic Himalayan snow-peak views and fruit orchards), and Almora & Ranikhet (serene pine forest cottages).',
      contentHi: 'प्रमुख रियल एस्टेट गंतव्यों में देहरादून (राजधानी, उच्च स्तरीय शिक्षा व स्वास्थ्य सुविधाएं), मसूरी व धनोल्टी (पहाड़ों की रानी व पर्यटन केंद्र), ऋषिकेश (गंगा किनारे आध्यात्मिक व योग नगरी, एम्स ऋषिकेश, विस्थापित कॉलोनी, आम बाग और सीमा डेंटल कॉलेज के पास उच्च रेंटल रिटर्न वाले प्लॉट्स व फ्लैट्स), नैनीताल व भीमताल (झीलों का शांत वातावरण), मुक्तेश्वर व रामगढ़ (हिमालय की बर्फीली चोटियों के दृश्य और सेब के बगीचे) तथा अल्मोड़ा व रानीखेत (चीड़ के जंगलों से घिरे खूबसूरत कॉटेज) शामिल हैं।'
    }
  ];

  useEffect(() => {
    const schemaId = 'ukg-home-faq-ldjson';
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guides.map((g) => ({
        '@type': 'Question',
        name: g.titleEn,
        acceptedAnswer: {
          '@type': 'Answer',
          text: g.contentEn,
        },
      })),
    });
    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, []);

  return (
    <section id="seo-knowledge-guide" className="my-16 pt-10 border-t border-emerald-200/80 dark:border-emerald-950/80 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isHindi ? 'उत्तराखंड रियल एस्टेट मार्गदर्शिका' : 'Uttarakhand Real Estate Guide & FAQ'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a271c] dark:text-white font-serif-luxury tracking-tight">
          {isHindi 
            ? 'उत्तराखंड में जमीन, विला व फ्लैट खरीदने के कानूनी नियम' 
            : 'Everything to Know About Buying, Selling & Renting in Uttarakhand'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
          {isHindi 
            ? 'भूमि नियमों, धारा 154, गैर-कृषि भूमि प्रावधानों और नाली-मुट्ठी माप से जुड़े सामान्य सूचनात्मक उत्तर।' 
            : 'General informational overview of Uttarakhand land regulations, Section 154 norms, Section 143 conversion, and local land measurements.'}
        </p>
      </div>

      {/* Accordion FAQ Guide */}
      <div className="space-y-3.5">
        {guides.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={item.id} 
              className="rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/90 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                    {item.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {isHindi ? item.titleHi : item.titleEn}
                  </h3>
                </div>
                <div className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-emerald-100 dark:border-emerald-900/40">
                  <p>{isHindi ? item.contentHi : item.contentEn}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
