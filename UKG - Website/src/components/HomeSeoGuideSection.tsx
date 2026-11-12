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
      titleEn: 'What is Uttarakhand Gateways and How Does 0% Brokerage Work?',
      titleHi: 'उत्तराखंड गेटवेज क्या है और 0% ब्रोकरेज मॉडल कैसे काम करता है?',
      contentEn: 'Uttarakhand Gateways is a verified real estate marketplace dedicated exclusively to mountain properties across Uttarakhand. Unlike traditional property portals that charge hefty commissions or hide owner contact numbers behind broker desks, Uttarakhand Gateways connects buyers directly with genuine owners and verified brokers with zero brokerage. Listing properties for sale or rent is completely free, providing a transparent, commission-free experience.',
      contentHi: 'उत्तराखंड गेटवेज उत्तराखंड की पहाड़ी संपत्तियों के लिए समर्पित एक सत्यापित रियल एस्टेट मार्केटप्लेस है। पारंपरिक ब्रोकरों के विपरीत जो भारी कमीशन लेते हैं या बिचौलियों के माध्यम से संपर्क कराते हैं, उत्तराखंड गेटवेज खरीदारों को सीधे असली संपत्ति मालिकों और सत्यापित ब्रोकरों से जोड़ता है—वो भी 0% ब्रोकरेज पर। यहां प्रॉपर्टी की बिक्री या किराए की लिस्टिंग पोस्ट करना पूरी तरह से निःशुल्क है।'
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
      contentEn: 'Section 143 (now covered under Section 80 of the Revenue Code) certifies that an agricultural parcel has been legally converted for residential or commercial use by the Sub-Divisional Magistrate (SDM). When purchasing residential plots or cottages in Uttarakhand, ensuring the property has Section 143 clearance guarantees a hassle-free registry, clear freehold title, and quick eligibility for home bank loans.',
      contentHi: 'धारा 143 (अब राजस्व संहिता की धारा 80 के अंतर्गत) यह प्रमाणित करती है कि संबंधित उप-जिलाधिकारी (एसडीएम) द्वारा कृषि भूमि को कानूनी रूप से आवासीय या व्यावसायिक उपयोग में बदल दिया गया है। उत्तराखंड में प्लॉट या कॉटेज खरीदते समय धारा 143 स्वीकृत भूमि होने पर रजिस्ट्री में कोई बाधा नहीं आती, टाइटल पूरी तरह से फ्रीहोल्ड होता है और बैंकों से तुरंत होम लोन मिलता है।'
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
      contentEn: 'Popular investment hubs include Dehradun (capital city with prime education, healthcare, and urban conveniences), Mussoorie & Dhanaulti (scenic hill retreats), Rishikesh (world yoga capital, spiritual living along the Ganga), Nainital & Bhimtal (famous lake district retreats), Mukteshwar & Ramgarh (panoramic Himalayan snow-peak views and fruit orchards), and Almora & Ranikhet (serene pine forest cottages).',
      contentHi: 'प्रमुख रियल एस्टेट गंतव्यों में देहरादून (राजधानी, उच्च स्तरीय शिक्षा व स्वास्थ्य सुविधाएं), मसूरी व धनोल्टी (पहाड़ों की रानी व पर्यटन केंद्र), ऋषिकेश (गंगा किनारे आध्यात्मिक व योग नगरी), नैनीताल व भीमताल (झीलों का शांत वातावरण), मुक्तेश्वर व रामगढ़ (हिमालय की बर्फीली चोटियों के दृश्य और सेब के बगीचे) तथा अल्मोड़ा व रानीखेत (चीड़ के जंगलों से घिरे खूबसूरत कॉटेज) शामिल हैं।'
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
            ? '0% ब्रोकरेज, धारा 154 सीलिंग नियम, धारा 143 गैर-कृषि लैंड टाइटल और नाली-मुट्ठी माप से जुड़े सभी महत्वपूर्ण उत्तर।' 
            : 'Authoritative guidance on 0% brokerage, UPZA & LR Act Section 154 land ceiling, Section 143 conversion, and hill land measurements.'}
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
