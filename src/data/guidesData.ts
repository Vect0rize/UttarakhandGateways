export interface RealEstateGuide {
  slug: string;
  titleEn: string;
  titleHi: string;
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  category: string;
  summaryEn: string;
  summaryHi: string;
  sections: {
    headingEn: string;
    headingHi: string;
    contentEn: string;
    contentHi: string;
  }[];
}

export const REAL_ESTATE_GUIDES: RealEstateGuide[] = [
  {
    slug: 'buying-property-in-uttarakhand',
    titleEn: 'Step-by-Step Guide to Buying Property in Uttarakhand (2026)',
    titleHi: 'उत्तराखंड में प्रॉपर्टी खरीदने की संपूर्ण प्रक्रिया (2026 गाइड)',
    metaTitle: 'Guide to Buying Property in Uttarakhand | Step-by-Step Legal Process (2026)',
    metaDescription: 'Complete legal checklist for buying property in Uttarakhand. Learn how to verify land title, Khatauni, Section 143 conversion, stamp duty, and registry with 0% brokerage.',
    readTime: '6 min read',
    category: 'Legal & Registry',
    summaryEn: 'Everything you need to know before purchasing residential plots, apartments, or mountain cottages in Uttarakhand, including document verification and registry.',
    summaryHi: 'उत्तराखंड में प्लॉट, फ्लैट या कॉटेज खरीदने से पहले कानूनी जांच, खतौनी, धारा 143 रूपांतरण और रजिस्ट्री से संबंधित सभी महत्वपूर्ण जानकारी।',
    sections: [
      {
        headingEn: '1. Verifying Revenue Records: Khatauni & Khasra',
        headingHi: '1. राजस्व रिकॉर्ड की जांच: खतौनी और खसरा',
        contentEn: 'Before token payments, always inspect the official Khatauni (record of rights) on Uttarakhand’s revenue portal (Devbhoomi). Verify that the seller’s name is clearly listed as the sole or co-sharer owner and ensure there are no government encumbrances, hypothecations, or ongoing court disputes.',
        contentHi: 'बयाना देने से पहले उत्तराखंड के भूलेख पोर्टल (देवभूमि) पर खतौनी की जांच करें। सुनिश्चित करें कि विक्रेता का नाम खातेदार के रूप में दर्ज है और भूमि पर कोई बैंक बंधक या अदालती विवाद नहीं है।'
      },
      {
        headingEn: '2. Section 143 (Section 80) Non-Agricultural Clearance',
        headingHi: '2. धारा 143 (धारा 80) गैर-कृषि रूपांतरण',
        contentEn: 'If buying a residential plot or independent house on agricultural land, ensure the SDM has issued a 143 Order. This officially declares the land as Abadi (residential), enabling clear registry, home construction permission, and easy bank loan sanction.',
        contentHi: 'यदि आप आवासीय प्लॉट खरीद रहे हैं तो सुनिश्चित करें कि एसडीएम द्वारा धारा 143 का आदेश पारित हो चुका है। इससे भूमि आबादी घोषित हो जाती है और बैंकों से तुरंत लोन मिलता है।'
      },
      {
        headingEn: '3. Encumbrance Certificate & Search Report',
        headingHi: '3. भारमुक्त प्रमाण पत्र (Encumbrance Certificate)',
        contentEn: 'Obtain an Encumbrance Certificate (EC) for the past 12 to 30 years from the local Sub-Registrar office to guarantee that the property is completely debt-free and has not been sold or mortgaged multiple times.',
        contentHi: 'संबंधित उप-निबंधक कार्यालय से पिछले 12 से 30 वर्षों का भारमुक्त प्रमाण पत्र (EC) प्राप्त करें ताकि यह सुनिश्चित हो सके कि संपत्ति पूरी तरह से देनदारियों से मुक्त है।'
      },
      {
        headingEn: '4. Stamp Duty & Registry in Uttarakhand',
        headingHi: '4. स्टाम्प शुल्क और रजिस्ट्री शुल्क',
        contentEn: 'In Uttarakhand, stamp duty is generally 5% for male buyers and 3.75% for female buyers (providing a generous concession to encourage female property ownership). The registration fee is standardly 2% of the circle rate or sale deed value.',
        contentHi: 'उत्तराखंड में स्टाम्प शुल्क सामान्यतः पुरुषों के लिए 5% और महिला खरीदारों के लिए 3.75% (रियायती दर) है। पंजीकरण शुल्क सर्किल रेट या विक्रय मूल्य का 2% होता है।'
      }
    ]
  },
  {
    slug: 'uttarakhand-land-laws-section-154',
    titleEn: 'Uttarakhand Land Ceiling Laws: Can Outside Buyers Purchase Land?',
    titleHi: 'उत्तराखंड भूमि सीलिंग कानून: क्या राज्य से बाहर के नागरिक जमीन खरीद सकते हैं?',
    metaTitle: 'Uttarakhand Land Ceiling Rules | Section 154 UPZA & LR Act Explained',
    metaDescription: 'Detailed explanation of Uttarakhand land laws for non-residents. Learn about the 250 sq.m (1.25 Nali) rural ceiling and municipal limits exemption under UPZA & LR Act.',
    readTime: '5 min read',
    category: 'State Land Laws',
    summaryEn: 'Clear explanation of UPZA & LR Act Section 154: Who can buy, how much land you can purchase, and where no ceilings apply.',
    summaryHi: 'यूपीजेडए एवं एलआर अधिनियम की धारा 154 का स्पष्ट विश्लेषण: कौन खरीद सकता है, कितनी जमीन खरीदी जा सकती है, और किन क्षेत्रों में कोई सीमा नहीं है।',
    sections: [
      {
        headingEn: '1. The 250 Square Meter (1.25 Nali) Rural Land Ceiling',
        headingHi: '1. 250 वर्ग मीटर (1.25 नाली) ग्रामीण भूमि सीमा',
        contentEn: 'Under Section 154 of the Uttar Pradesh Zamindari Abolition and Land Reforms Act (as adapted by Uttarakhand), any Indian citizen from any state can legally purchase up to 250 square meters (approx 2,700 sq.ft or ~1.25 Nali) of rural/agricultural land per family without requiring special state government permission.',
        contentHi: 'उत्तराखंड जमींदारी विनाश एवं भूमि व्यवस्था अधिनियम की धारा 154 के तहत, भारत का कोई भी नागरिक बिना किसी सरकारी अनुमति के प्रति परिवार 250 वर्ग मीटर (लगभग 2,700 वर्ग फुट या 1.25 नाली) ग्रामीण भूमि खरीद सकता है।'
      },
      {
        headingEn: '2. No Ceiling Inside Municipal Corporation & MDDA Limits',
        headingHi: '2. नगर निगम व एमडीडीए क्षेत्रों में कोई सीलिंग नहीं',
        contentEn: 'In designated urban areas—including Dehradun Nagar Nigam, Haridwar Municipal Corporation, Rishikesh, Haldwani, and development authorities (MDDA, HRDA)—there is NO land size restriction for buying apartments, residential flats, builder floors, or commercial properties.',
        contentHi: 'नगर निगम क्षेत्रों और विकास प्राधिकरणों (जैसे देहरादून, हरिद्वार, ऋषिकेश, हल्द्वानी) के अंतर्गत आने वाले फ्लैट्स, विला और आवासीय प्लॉट्स पर कोई 250 वर्ग मीटर की सीमा लागू नहीं होती।'
      },
      {
        headingEn: '3. Purchasing Land for Tourism, Agriculture & Industry',
        headingHi: '3. पर्यटन, उद्योग व बड़े प्रोजेक्ट्स के लिए अनुमति',
        contentEn: 'For projects exceeding 250 sq. meters (such as eco-resorts, organic farming, hotels, or educational institutions), outside investors can apply for Section 154(2) permission from the District Magistrate / State Government.',
        contentHi: 'यदि आप 250 वर्ग मीटर से अधिक भूमि (जैसे होटल, रिसॉर्ट, ऑर्गेनिक फार्मिंग) के लिए खरीदना चाहते हैं, तो धारा 154(2) के तहत जिलाधिकारी या राज्य सरकार से अनुमति ली जा सकती है।'
      }
    ]
  },
  {
    slug: 'traditional-land-units-nali-mutthi-bigha',
    titleEn: 'Uttarakhand Land Measurement Units: Nali, Mutthi, Bigha to Sq.Ft',
    titleHi: 'उत्तराखंड भूमि माप इकाइयां: नाली, मुट्ठी, बीघा और वर्ग फुट का गणित',
    metaTitle: 'Uttarakhand Land Units Explained | 1 Nali in Sq.Ft, Mutthi, Bigha, Gaj',
    metaDescription: 'Learn how Uttarakhand mountain land is measured. Complete conversion table for 1 Nali in square feet (2,160 sq.ft), Mutthi, Bigha, and Square Yards (Gaj).',
    readTime: '4 min read',
    category: 'Land Measurements',
    summaryEn: 'Complete guide and formula table to convert traditional Himalayan land units (Nali, Mutthi, Bigha) into square feet and Gaj.',
    summaryHi: 'पहाड़ी भूमि मापों (नाली, मुट्ठी, बीघा) को वर्ग फुट, गज और वर्ग मीटर में बदलने की सटीक तालिका और सूत्र।',
    sections: [
      {
        headingEn: '1. What is 1 Nali in Square Feet?',
        headingHi: '1. 1 नाली में कितने वर्ग फुट होते हैं?',
        contentEn: '1 Nali in Uttarakhand equals exactly 2,160 square feet (approx 200.67 square meters or 240 square yards / Gaj). It is the universal land unit used across Garhwal and Kumaon hill districts.',
        contentHi: 'उत्तराखंड में 1 नाली बराबर 2,160 वर्ग फुट (लगभग 200.67 वर्ग मीटर या 240 वर्ग गज) होती है। गढ़वाल और कुमाऊं के पहाड़ी जिलों में जमीन की खरीद-फरोख्त इसी इकाई में होती है।'
      },
      {
        headingEn: '2. What is 1 Mutthi in Square Feet?',
        headingHi: '2. 1 मुट्ठी में कितने वर्ग फुट होते हैं?',
        contentEn: '1 Nali consists of 16 Mutthi. Therefore, 1 Mutthi equals 135 square feet (approx 12.54 sq. meters or 15 square yards / Gaj).',
        contentHi: '1 नाली में 16 मुट्ठी होती हैं। इस प्रकार 1 मुट्ठी बराबर 135 वर्ग फुट (लगभग 12.54 वर्ग मीटर या 15 वर्ग गज) होती है।'
      },
      {
        headingEn: '3. What is 1 Uttarakhand Bigha in Square Feet?',
        headingHi: '3. 1 उत्तराखंड बीघा में कितने वर्ग फुट होते हैं?',
        contentEn: 'In Uttarakhand hills, 1 Bigha typically equals 3.15 Nalis, which translates to approximately 6,804 square feet (approx 632.1 sq.m or 756 Gaj). In plain districts like Haridwar, Pucca Bigha equals 27,225 sq.ft.',
        contentHi: 'पहाड़ी क्षेत्रों में 1 बीघा लगभग 3.15 नाली या 6,804 वर्ग फुट के बराबर होता है। मैदानी क्षेत्रों (जैसे हरिद्वार) में पक्का बीघा 27,225 वर्ग फुट का होता है।'
      }
    ]
  },
  {
    slug: 'section-143-land-conversion',
    titleEn: 'What is Section 143 (Section 80) Land Conversion in Uttarakhand?',
    titleHi: 'उत्तराखंड में धारा 143 (धारा 80) गैर-कृषि रूपांतरण का क्या महत्व है?',
    metaTitle: 'Section 143 Land Conversion in Uttarakhand | Legal Process & Benefits',
    metaDescription: 'Why is Section 143 clearance essential before buying land in Uttarakhand? Learn how agricultural land is converted to residential Abadi and how to verify it.',
    readTime: '5 min read',
    category: 'Legal & Registry',
    summaryEn: 'Understand why Section 143 approval is the single most important factor for securing a clear freehold title and bank loan approval in Uttarakhand.',
    summaryHi: 'जानिए क्यों धारा 143 की मंजूरी उत्तराखंड में फ्रीहोल्ड मालिकाना हक और बैंक लोन के लिए सबसे जरूरी दस्तावेज है।',
    sections: [
      {
        headingEn: '1. Why Section 143 Conversion Matters',
        headingHi: '1. धारा 143 रूपांतरण क्यों जरूरी है',
        contentEn: 'By default, land in rural Uttarakhand is classified as agricultural (Krishi Bhumi). Building a house on unconverted land can lead to zoning violations. Section 143 orders legally declare the parcel for non-agricultural (residential or commercial) use.',
        contentHi: 'उत्तराखंड में ग्रामीण भूमि मूलतः कृषि श्रेणी में होती है। धारा 143 का आदेश मिलने के बाद ही भूमि कानूनी रूप से आवासीय (अकृषिक) घोषित होती है।'
      },
      {
        headingEn: '2. How to Verify 143 Orders in Revenue Records',
        headingHi: '2. राजस्व अभिलेखों में धारा 143 का आदेश कैसे देखें',
        contentEn: 'Inspect the Khatauni entry under Column 1-Kha or Remark Column (Shamilat / Aadesh). The SDM order number and date of conversion will be documented directly in the record.',
        contentHi: 'खतौनी के आदेश कॉलम में एसडीएम कोर्ट के आदेश संख्या और दिनांक की प्रविष्टि दर्ज होती है, जिसे देवभूमि पोर्टल पर ऑनलाइन देखा जा सकता है।'
      }
    ]
  },
  {
    slug: 'plots-vs-flats-vs-cottages',
    titleEn: 'Plots vs Flats vs Mountain Cottages in Uttarakhand: Investment Comparison',
    titleHi: 'उत्तराखंड में प्लॉट, फ्लैट या हिल कॉटेज: निवेश के लिए कौन सा विकल्प सर्वोत्तम है?',
    metaTitle: 'Plots vs Flats vs Cottages in Uttarakhand | Investment ROI & Price Comparison',
    metaDescription: 'Comparing residential plots, luxury flats, and Himalayan cottages in Uttarakhand. Discover capital appreciation, rental yield, and maintenance insights.',
    readTime: '6 min read',
    category: 'Investment Strategy',
    summaryEn: 'Comprehensive investment analysis comparing residential plots in Dehradun, flats in Rishikesh, and cottages in Mussoorie/Nainital.',
    summaryHi: 'देहरादून में प्लॉट, ऋषिकेश में फ्लैट और मसूरी-नैनीताल में कॉटेज के निवेश मूल्य, रिटर्न और रख-रखाव का विस्तृत तुलनात्मक विश्लेषण।',
    sections: [
      {
        headingEn: '1. Residential Plots: Highest Capital Appreciation',
        headingHi: '1. आवासीय प्लॉट: सबसे तेज पूंजीगत मूल्यवृद्धि',
        contentEn: 'Plots in expanding corridors (Delhi-Dehradun Expressway, Sahastradhara, Haridwar bypass) offer the highest land value appreciation. Land is finite in the hills, making clear-title freehold plots a coveted long-term asset.',
        contentHi: 'एक्सप्रेसवे और नए हाईवे के आसपास के प्लॉट्स में सबसे तेज मूल्यवृद्धि होती है। पहाड़ों में सीमित भूमि होने के कारण स्पष्ट टाइटल वाले प्लॉट्स की मांग सदैव बनी रहती है।'
      },
      {
        headingEn: '2. Flats & Apartments: Easy Maintenance & Ready Move-in',
        headingHi: '2. फ्लैट्स व अपार्टमेंट्स: कम देख-रेख व तुरंत रहने योग्य',
        contentEn: 'For retirees and second-home owners who cannot visit the property year-round, gated apartments with 24/7 security, power backup, and lifts in Dehradun and Rishikesh offer hassle-free ownership.',
        contentHi: 'वरिष्ठ नागरिकों और दूर रहने वाले खरीदारों के लिए 24 घंटे सुरक्षा, पावर बैकअप और लिफ्ट की सुविधा वाले गेटेड फ्लैट्स सबसे सुविधाजनक होते हैं।'
      },
      {
        headingEn: '3. Hillside Cottages & Homestays: High Rental Yields',
        headingHi: '3. हिल कॉटेज व होमस्टे: बेहतरीन किराये की आय',
        contentEn: 'Independent wooden and stone cottages in Mukteshwar, Bhimtal, and Mussoorie generate attractive passive income when listed as verified mountain retreats and homestays for travelers.',
        contentHi: 'मुक्तेश्वर, भीमताल और मसूरी में बने खूबसूरत कॉटेज पर्यटकों के बीच काफी लोकप्रिय हैं और पंजीकृत होमस्टे के रूप में बेहतरीन मासिक आय प्रदान करते हैं।'
      }
    ]
  },
  {
    slug: 'renting-property-in-uttarakhand',
    titleEn: 'Tenant & Owner Guide to Renting Property in Uttarakhand (0% Brokerage)',
    titleHi: 'उत्तराखंड में मकान किराये पर लेने व देने की संपूर्ण गाइड (0% ब्रोकरेज)',
    metaTitle: 'Renting Property in Uttarakhand Guide | Tenant Rights & Lease Agreement',
    metaDescription: 'Essential guide for renting houses, furnished cottages, and flats in Uttarakhand. Learn about rental agreements, police verification, and 0% brokerage renting.',
    readTime: '5 min read',
    category: 'Rental Living',
    summaryEn: 'Everything tenants and landlords need to know about standard lease agreements, security deposits, and peaceful mountain rental living.',
    summaryHi: 'किरायेदारों और मकान मालिकों के लिए 11 महीने के रेंट एग्रीमेंट, पुलिस वेरिफिकेशन और शून्य-कमीशन रेंटल की उपयोगी गाइड।',
    sections: [
      {
        headingEn: '1. The Standard 11-Month Rental Agreement',
        headingHi: '1. 11 महीने का मानक किराया अनुबंध (Rent Agreement)',
        contentEn: 'Most residential leases in Uttarakhand are executed for 11 months on ₹100 or ₹500 non-judicial stamp paper, specifying monthly rent, maintenance charges, and a 1 to 2-month security deposit.',
        contentHi: 'उत्तराखंड में अधिकांश रेंटल समझौते 11 महीने की अवधि के लिए ₹100 या ₹500 के स्टाम्प पेपर पर बनते हैं, जिसमें मासिक किराया और सिक्योरिटी डिपॉजिट स्पष्ट लिखा होता है।'
      },
      {
        headingEn: '2. Mandatory Tenant Police Verification',
        headingHi: '2. अनिवार्य किरायेदार पुलिस सत्यापन',
        contentEn: 'Under Uttarakhand Police guidelines, landlords must submit tenant verification forms at the local police station or via the Uttarakhand Police Citizen Portal (Gaura Shakti / e-Verification).',
        contentHi: 'उत्तराखंड पुलिस के नियमों के अनुसार सभी मकान मालिकों को अपने किरायेदार का पुलिस सत्यापन संबंधित थाने या ऑनलाइन नागरिक पोर्टल के माध्यम से कराना अनिवार्य है।'
      }
    ]
  }
];
