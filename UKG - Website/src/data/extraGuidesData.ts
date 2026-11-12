export interface GuideRelatedLink {
  label: string;
  path: string;
}

export interface ExtendedGuideSection {
  headingEn: string;
  headingHi: string;
  contentEn: string;
  contentHi: string;
}

export interface ExtendedRealEstateGuide {
  slug: string;
  titleEn: string;
  titleHi: string;
  metaTitle: string;
  metaDescription: string;
  readTime: string;
  category: string;
  authorName?: string;
  authorRole?: string;
  publishedDate?: string;
  updatedDate?: string;
  relatedLinks?: GuideRelatedLink[];
  summaryEn: string;
  summaryHi: string;
  sections: ExtendedGuideSection[];
}

export const EXTRA_REAL_ESTATE_GUIDES: ExtendedRealEstateGuide[] = [
  {
    slug: 'best-places-to-buy-property-uttarakhand',
    titleEn: 'Best Places to Buy Property in Uttarakhand: Valley Hubs vs Hill Retreats',
    titleHi: 'उत्तराखंड में प्रॉपर्टी खरीदने के प्रमुख स्थान: मैदानी शहर बनाम पर्वतीय क्षेत्र',
    metaTitle: 'Best Places to Buy Property in Uttarakhand | Garhwal & Kumaon Location Guide',
    metaDescription:
      'Compare Uttarakhand’s top residential and land destinations including Dehradun, Rishikesh, Haridwar, Haldwani, Nainital, Bhimtal & Mukteshwar based on connectivity and end-use.',
    readTime: '7 min read',
    category: 'Location Research',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Regional Real Estate Editorial',
    publishedDate: '2026-04-12',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Properties in Dehradun', path: '/properties-in-dehradun' },
      { label: 'Properties in Rishikesh', path: '/properties-in-rishikesh' },
      { label: 'Properties in Bhimtal', path: '/properties-in-bhimtal' },
      { label: 'Properties in Mukteshwar', path: '/properties-in-mukteshwar' },
    ],
    summaryEn:
      'Choosing where to buy property in Uttarakhand depends heavily on your primary goal: year-round urban living, rental income, retirement, or a quiet mountain retreat. Compare Garhwal and Kumaon markets objectively.',
    summaryHi:
      'उत्तराखंड में प्रॉपर्टी खरीदते समय गढ़वाल और कुमाऊँ के प्रमुख शहरों की कनेक्टिविटी, जलवायु और उपयोगिता के आधार पर तुलनात्मक गाइड।',
    sections: [
      {
        headingEn: '1. Urban Foothill Corridors: Dehradun, Haldwani & Haridwar',
        headingHi: '1. प्रमुख शहरी व तराई केंद्र: देहरादून, हल्द्वानी और हरिद्वार',
        contentEn:
          'For full-time family relocation, schooling, and healthcare access, foothill cities lead in livability. Dehradun serves as the state capital with airport connectivity and established residential neighbourhoods like Rajpur Road, Dalanwala, and Sahastradhara Road. Haldwani functions as the commercial gateway to Kumaon near Kathgodam Railhead, while Haridwar combines industrial belts with pilgrimage access.',
        contentHi:
          'स्थायी निवास, शिक्षा और स्वास्थ्य सुविधाओं के लिए देहरादून, हल्द्वानी और हरिद्वार सबसे व्यावहारिक विकल्प माने जाते हैं, जहाँ वर्ष भर सुगम सड़क और रेल संपर्क उपलब्ध रहता है।',
      },
      {
        headingEn: '2. Wellness & Spiritual Belts: Rishikesh & Tehri Valley',
        headingHi: '2. आध्यात्मिक और वेलनेस केंद्र: ऋषिकेश और टिहरी घाटी',
        contentEn:
          'Rishikesh draws steady residential and hospitality interest across Tapovan, Muni Ki Reti, and Shyampur due to its proximity to Jolly Grant Airport and yoga tourism. Higher up in the Garhwal hills, Tehri Garhwal (New Tehri and Chamba), Dhanaulti, and Kanatal cater to holiday home seekers looking for lake views and deodar ridges.',
        contentHi:
          'ऋषिकेश अपने शांत वातावरण और हवाई अड्डे से निकटता के कारण आवासीय फ्लैट्स और होमस्टे के लिए लोकप्रिय है, जबकि टिहरी झील व धनोल्टी सप्ताहांत कॉटेज के लिए पसंद किए जाते हैं।',
      },
      {
        headingEn: '3. Kumaon Hill Towns: Bhimtal, Bhowali, Mukteshwar & Almora',
        headingHi: '3. कुमाऊँ की पहाड़ियाँ: भीमताल, भवाली, मुक्तेश्वर और अल्मोड़ा',
        contentEn:
          'In Kumaon, buyers seeking milder winters with lake scenery often prefer Bhimtal and Bhowali over dense central Nainital wards. Higher-altitude pockets like Mukteshwar, Ranikhet, Almora, and Kausani are suited to orchard cottages and tranquil retirement living—though buyers must carefully check rural Section 154 area rules and winter road maintenance.',
        contentHi:
          'भीमताल और भवाली संतुलित मौसम व झील के नज़ारे प्रदान करते हैं, जबकि मुक्तेश्वर, रानीखेत और अल्मोड़ा शांत पर्वतीय कॉटेज के लिए उपयुक्त हैं।',
      },
    ],
  },
  {
    slug: 'buying-land-uttarakhand-important-considerations',
    titleEn: 'Buying Land in Uttarakhand: Legal, Slope & Access Considerations',
    titleHi: 'उत्तराखंड में ज़मीन खरीदने से पहले ध्यान रखने योग्य कानूनी व भौगोलिक बातें',
    metaTitle: 'Buying Land in Uttarakhand: Important Legal & Site Considerations',
    metaDescription:
      'Essential checklist before purchasing residential plots or hill land in Uttarakhand: Khatauni ownership, municipal vs rural limits, road approach, water source, and forest buffer rules.',
    readTime: '6 min read',
    category: 'Land Advisory',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Land & Revenue Documentation',
    publishedDate: '2026-04-20',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Land for Sale in Uttarakhand', path: '/land-for-sale-in-uttarakhand' },
      { label: 'Plots for Sale in Dehradun', path: '/plots-for-sale-in-dehradun' },
      { label: 'Agricultural Land in Uttarakhand', path: '/agricultural-land-in-uttarakhand' },
    ],
    summaryEn:
      'Purchasing land in mountain or foothill terrain carries unique revenue and engineering checks compared to metro cities. Review these non-negotiable parameters before executing a bayana.',
    summaryHi:
      'पहाड़ी या तराई क्षेत्रों में ज़मीन खरीदते समय केवल कीमत नहीं बल्कि खतौनी, पहुंच मार्ग, जल स्रोत और वन सीमा की जांच अत्यंत आवश्यक है।',
    sections: [
      {
        headingEn: '1. Verify Jurisdiction: Municipal Area vs Rural Gram Sabha',
        headingHi: '1. क्षेत्राधिकार की जांच: नगर निगम/पालिका बनाम ग्रामीण क्षेत्र',
        contentEn:
          'Always establish whether the plot falls inside notified urban local body limits (Nagar Nigam / Nagar Palika / Nagar Panchayat) or outside them in rural revenue villages. Rural agricultural land purchases by non-residents are strictly governed by Uttarakhand’s Section 154 ceiling norms and require careful legal counsel.',
        contentHi:
          'सबसे पहले यह पुष्टि करें कि भूमि नगर निकाय सीमा के भीतर है या ग्रामीण राजस्व ग्राम में, क्योंकि ग्रामीण कृषि भूमि खरीद पर धारा 154 के नियम लागू होते हैं।',
      },
      {
        headingEn: '2. Forest, NGT River Setback & Retaining Wall Checks',
        headingHi: '2. वन सीमा, नदी-नाला दूरी और ढलान की जांच',
        contentEn:
          'Inspect official Patwari Sajra maps to confirm the parcel is private “Naap” land and does not encroach on Reserve Forest, Van Panchayat land, or seasonal mountain streams (gads/nalas). Evaluate retaining wall quality and soil drainage on terraced plots, especially prior to monsoon construction.',
        contentHi:
          'पटवारी मानचित्र से सुनिश्चित करें कि भूमि निजी ‘नाप’ श्रेणी की है और आरक्षित वन या नदी-नाले के प्रतिबंधित क्षेत्र में नहीं आती।',
      },
      {
        headingEn: '3. Registered Right-of-Way & Perennial Water Supply',
        headingHi: '3. वैध सड़क मार्ग (Right of Way) और जल आपूर्ति',
        contentEn:
          'In hill states, dirt tracks across a neighbour’s field can become future disputes unless a motorable public road or registered easement appears clearly in the revenue map and sale deed. Confirm Jal Sansthan pipeline feasibility or rainwater harvesting scope early.',
        contentHi:
          'सुनिश्चित करें कि प्लॉट तक जाने वाला रास्ता राजस्व मानचित्र या बैनामे में स्पष्ट रूप से दर्ज हो, ताकि भविष्य में आवागमन का कोई विवाद न हो।',
      },
    ],
  },
  {
    slug: 'residential-plots-vs-agricultural-land-uttarakhand',
    titleEn: 'Residential Plots vs Agricultural Land in Uttarakhand: Key Differences',
    titleHi: 'उत्तराखंड में रेजिडेंशियल प्लॉट बनाम कृषि भूमि: मुख्य अंतर',
    metaTitle: 'Residential Plots vs Agricultural Land in Uttarakhand | Legal & Practical Guide',
    metaDescription:
      'Understand the practical and legal differences between buying converted residential plots and agricultural land in Uttarakhand, including Section 143 status, bank loans & resale.',
    readTime: '5 min read',
    category: 'Legal & Registry',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Property Documentation',
    publishedDate: '2026-05-02',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Plots for Sale in Uttarakhand', path: '/plots-for-sale-in-uttarakhand' },
      { label: 'Agricultural Land in Uttarakhand', path: '/agricultural-land-in-uttarakhand' },
      { label: 'Residential Property in Uttarakhand', path: '/residential-property-in-uttarakhand' },
    ],
    summaryEn:
      'Confusing agricultural revenue land with residential-approved plots can delay building sanctions and bank financing. Here is how both categories differ in Uttarakhand.',
    summaryHi:
      'आवासीय प्लॉट और कृषि भूमि के बीच कानूनी श्रेणी, निर्माण अनुमति और होम लोन की पात्रता का स्पष्ट अंतर समझें।',
    sections: [
      {
        headingEn: '1. Revenue Classification & Building Permissions',
        headingHi: '1. राजस्व श्रेणी और निर्माण की अनुमति',
        contentEn:
          'Agricultural land is recorded in revenue Khataunis for farming or horticulture. Constructing a permanent residence or commercial resort typically requires lawful non-agricultural land-use conversion (popularly referred to under Section 143 of U.P.Z.A. & L.R. Act as applicable in Uttarakhand) plus Development Authority map sanction where notified.',
        contentHi:
          'कृषि भूमि मुख्यतः खेती और बागवानी के लिए दर्ज होती है; उस पर आवासीय या व्यावसायिक निर्माण से पहले विधिवत भू-उपयोग परिवर्तन (धारा 143) और नक्शा स्वीकृति आवश्यक होती है।',
      },
      {
        headingEn: '2. Home Loan Eligibility & Stamp Duty Nuances',
        headingHi: '2. बैंक लोन की उपलब्धता और स्टांप शुल्क',
        contentEn:
          'Scheduled banks and housing finance institutions normally grant plot-plus-construction loans only on clear residential or authority-sanctioned plots, rarely financing pure agricultural parcels. Always verify circle rates at the local Sub-Registrar office before budgeting.',
        contentHi:
          'प्रमुख बैंक मुख्य रूप से स्वीकृत आवासीय प्लॉट्स पर ही प्लॉट व निर्माण ऋण प्रदान करते हैं, जबकि शुद्ध कृषि भूमि पर आवासीय ऋण मिलना कठिन होता है।',
      },
    ],
  },
  {
    slug: 'things-to-check-before-buying-property-dehradun',
    titleEn: 'Things to Check Before Buying Property in Dehradun',
    titleHi: 'देहरादून में प्रॉपर्टी खरीदने से पहले जांचने योग्य मुख्य बिंदु',
    metaTitle: 'Things to Check Before Buying Property in Dehradun | MDDA & RERA Checklist',
    metaDescription:
      'Buying a flat, plot, or house in Dehradun? Check MDDA layout approvals, UK-RERA registration, road width, Doon Valley eco-zones, and municipal records.',
    readTime: '6 min read',
    category: 'City Guides',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Garhwal Market Desk',
    publishedDate: '2026-05-14',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Properties in Dehradun', path: '/properties-in-dehradun' },
      { label: 'Flats for Sale in Dehradun', path: '/flats-for-sale-in-dehradun' },
      { label: 'Plots for Sale in Dehradun', path: '/plots-for-sale-in-dehradun' },
      { label: 'Houses for Sale in Dehradun', path: '/houses-for-sale-in-dehradun' },
    ],
    summaryEn:
      'From Rajpur Road and Dalanwala to growing outskirts along Sahastradhara and Shimla Bypass, use this practical inspection checklist before purchasing property in Dehradun.',
    summaryHi:
      'देहरादून में फ्लैट, प्लॉट या मकान खरीदने से पहले एमडीडीए स्वीकृति, रेरा पंजीकरण, सड़क की चौड़ाई और जल निकासी की जांच कैसे करें।',
    sections: [
      {
        headingEn: '1. Verify MDDA Sanction & Uttarakhand RERA Numbers',
        headingHi: '1. एमडीडीए (MDDA) मानचित्र स्वीकृति और रेरा नंबर जांचें',
        contentEn:
          'Whether buying an apartment or a plotted colony site within the Mussoorie Dehradun Development Authority (MDDA) region, always request the approved layout/building plan sanction number. For eligible new projects, verify project details directly on the official Uttarakhand RERA portal.',
        contentHi:
          'देहरादून क्षेत्र में किसी भी मल्टीस्टोरी फ्लैट या कॉलोनी प्लॉट के लिए एमडीडीए द्वारा स्वीकृत लेआउट प्लान और लागू होने पर उत्तराखंड रेरा पंजीकरण की पुष्टि अवश्य करें।',
      },
      {
        headingEn: '2. Assess Approach Road Width & Monsoon Drainage',
        headingHi: '2. पहुंच मार्ग की चौड़ाई और मानसून जल निकासी',
        contentEn:
          'Verify actual on-ground road width against sanctioned drawings—many inner valley lanes taper unexpectedly. Because Dehradun experiences heavy monsoon showers, inspect natural slopes, retaining walls near foothill streams (Rispana/Bindal tributaries), and storm-drainage outlets.',
        contentHi:
          'मौके पर जाकर सड़क की वास्तविक चौड़ाई नापें और मानसून में जल भराव या नजदीकी नाले की स्थिति की स्वयं जांच करें।',
      },
      {
        headingEn: '3. Municipal Mutation (Dakhil Kharij) & Past Utility Bills',
        headingHi: '3. नगर निगम दाखिल-खारिज और बिजली-पानी के बकाया बिल',
        contentEn:
          'For resale houses inside Nagar Nigam Dehradun wards, request updated House Tax receipts, UPCL electricity clearance, and prior registered sale deeds establishing an unbroken 30-year chain of title.',
        contentHi:
          'रीसेल मकान खरीदते समय पिछली सभी रजिस्ट्री की श्रृंखला, नगर निगम गृह कर रसीद और बिजली-पानी के नो-ड्यूज प्रमाणपत्र जरूर जांचें।',
      },
    ],
  },
  {
    slug: 'property-investment-opportunities-rishikesh',
    titleEn: 'Property & Hospitality Insights in Rishikesh: Tapovan, Muni Ki Reti & Foothills',
    titleHi: 'ऋषिकेश में प्रॉपर्टी के अवसर: तपोवन, मुनि की रेती और तराई क्षेत्र',
    metaTitle: 'Property Guide for Rishikesh | Residential & Hospitality Areas Explained',
    metaDescription:
      'Understand micro-markets across Rishikesh including Tapovan, Muni Ki Reti, Dhalwala, and Shyampur for residential flats, rentals, and retreat spaces.',
    readTime: '5 min read',
    category: 'City Guides',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Garhwal Market Desk',
    publishedDate: '2026-06-01',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Properties in Rishikesh', path: '/properties-in-rishikesh' },
      { label: 'Flats for Sale in Rishikesh', path: '/flats-for-sale-in-rishikesh' },
      { label: 'Rental Properties in Rishikesh', path: '/rental-properties-in-rishikesh' },
    ],
    summaryEn:
      'Rishikesh spans three district administrations along the Ganga valley. Learn how residential apartments, rental flats, and retreat corridors differ across local zones.',
    summaryHi:
      'ऋषिकेश तीन जिलों की सीमाओं में फैला क्षेत्र है। तपोवन, मुनि की रेती और श्यामपुर जैसे क्षेत्रों की प्रॉपर्टी विशेषताओं को समझें।',
    sections: [
      {
        headingEn: '1. Understanding Three-District Jurisdiction in Greater Rishikesh',
        headingHi: '1. ऋषिकेश के तीन जिलों के क्षेत्राधिकार को समझें',
        contentEn:
          'A critical nuance in Rishikesh real estate is jurisdiction: central Rishikesh and Shyampur fall in Dehradun district; Muni Ki Reti, Dhalwala, and Tapovan fall in Tehri Garhwal district; while Swargashram / Laxman Jhula east bank falls in Pauri Garhwal district. Verify your Sub-Registrar office and authority limits accordingly.',
        contentHi:
          'ऋषिकेश के मुख्य शहर व श्यामपुर देहरादून जिले में, मुनि की रेती व तपोवन टिहरी गढ़वाल में तथा स्वर्गाश्रम पौड़ी गढ़वाल जिले में आते हैं—रजिस्ट्री से पहले इसकी पुष्टि जरूर करें।',
      },
      {
        headingEn: '2. Riverfront NGT Buffer & Commercial Guesthouse Rules',
        headingHi: '2. गंगा तट दूरी (NGT नियम) और होमस्टे पंजीकरण',
        contentEn:
          'Properties near the Ganga or seasonal tributaries are subject to strict National Green Tribunal and Flood Plain Zoning restrictions. Anyone planning seasonal rentals or yoga retreats should verify official Uttarakhand Tourism Homestay or commercial zoning compliance.',
        contentHi:
          'गंगा किनारे की संपत्तियों पर एनजीटी व बाढ़ क्षेत्र के कड़े नियम लागू होते हैं; होमस्टे या गेस्टहाउस संचालन के लिए वैध पर्यटन पंजीकरण की जांच आवश्यक है।',
      },
    ],
  },
  {
    slug: 'guide-to-buying-house-nainital',
    titleEn: 'Guide to Buying a House or Cottage in Nainital District',
    titleHi: 'नैनीताल जिले में मकान या कॉटेज खरीदने की व्यावहारिक गाइड',
    metaTitle: 'Guide to Buying a House in Nainital District | Nainital, Bhimtal & Bhowali',
    metaDescription:
      'Planning to buy a hillside house or lake-valley cottage in Nainital district? Learn about heritage leases, seismic safety, parking access, and municipal approvals.',
    readTime: '6 min read',
    category: 'City Guides',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Kumaon Market Desk',
    publishedDate: '2026-06-18',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Properties in Nainital', path: '/properties-in-nainital' },
      { label: 'Houses for Sale in Nainital', path: '/houses-for-sale-in-nainital' },
      { label: 'Properties in Bhimtal', path: '/properties-in-bhimtal' },
      { label: 'Cottages for Sale in Mukteshwar', path: '/cottages-for-sale-in-mukteshwar' },
    ],
    summaryEn:
      'Buying in Nainital town versus satellite valleys like Bhimtal, Bhowali, or Mukteshwar involves distinct property rules, terrain factors, and seasonal logistics.',
    summaryHi:
      'नैनीताल शहर व आसपास के भीमताल, भवाली और मुक्तेश्वर क्षेत्रों में मकान या कॉटेज खरीदते समय ध्यान रखने योग्य मुख्य बातें।',
    sections: [
      {
        headingEn: '1. Town Core Heritage Wards vs Satellite Lake Valleys',
        headingHi: '1. नैनीताल शहर बनाम भीमताल और भवाली घाटी',
        contentEn:
          'Core Nainital wards around Mallital, Tallital, and Ayarpata have strict construction freezes, narrow pedestrian alleys, and older leasehold grants in certain estates. Buyers seeking modern vehicle parking, gated apartments, or newer cottages often explore Bhimtal, Bhowali, and Khurpatal roads.',
        contentHi:
          'मुख्य नैनीताल शहर में सघन बसावट और सख्त निर्माण नियम हैं, जबकि भीमताल और भवाली में कार पार्किंग व आधुनिक गेटेड विकल्प अपेक्षाकृत अधिक मिलते हैं।',
      },
      {
        headingEn: '2. Structural Stability & Winter Habitability',
        headingHi: '2. भूकंपीय सुरक्षा, धूप और सर्दियों की व्यवस्था',
        contentEn:
          'Since Kumaon lies in high seismic zones (Zone IV/V), hire a qualified structural engineer to inspect foundation anchoring on sloped plots. Always visit during both peak monsoon and peak winter afternoons to judge sunlight hours, dampness, and water pipe insulation.',
        contentHi:
          'खरीदने से पहले ढलान वाली नींव की मजबूती की जांच किसी सिविल इंजीनियर से कराएं और धूप व सीलन की स्थिति का प्रत्यक्ष निरीक्षण करें।',
      },
    ],
  },
  {
    slug: 'important-property-documents-uttarakhand',
    titleEn: 'Important Property Documents to Verify in Uttarakhand',
    titleHi: 'उत्तराखंड में प्रॉपर्टी खरीदते समय जांचने योग्य महत्वपूर्ण दस्तावेज़',
    metaTitle: 'Important Property Documents in Uttarakhand | Khatauni, Sale Deed & EC Checklist',
    metaDescription:
      'Master checklist of property documents required in Uttarakhand: Khatauni (ROR), Khasra, 30-year Title Chain, Encumbrance Certificate, RERA, and Authority Map Sanction.',
    readTime: '6 min read',
    category: 'Legal & Registry',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Land & Revenue Documentation',
    publishedDate: '2026-07-02',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Buy Property in Uttarakhand', path: '/buy-property-in-uttarakhand' },
      { label: 'Plots for Sale in Uttarakhand', path: '/plots-for-sale-in-uttarakhand' },
    ],
    summaryEn:
      'Before signing an Agreement to Sell or paying token advance anywhere in Uttarakhand, inspect this standard document dossier with an independent property advocate.',
    summaryHi:
      'उत्तराखंड में किसी भी प्रॉपर्टी का सौदा पक्का करने से पहले खतौनी, रजिस्ट्री चेन, नॉन-एनकम्ब्रेंस सर्टिफिकेट और मानचित्र स्वीकृति जैसे दस्तावेज़ों की पूरी सूची।',
    sections: [
      {
        headingEn: '1. Bhulekh Khatauni (Record of Rights) & Khasra Details',
        headingHi: '1. भूलेख खतौनी और खसरा संख्या का विवरण',
        contentEn:
          'Verify the latest certified Khatauni from the Tehsil or cross-check on the official Bhulekh Uttarakhand portal to confirm exact recorded owners (Khatedars), share fractions, bank mortgages, or stay orders noted in column remarks.',
        contentHi:
          'सरकारी भूलेख पोर्टल या तहसील से अद्यतन खतौनी निकलवाकर सभी सह-खातेदारों के नाम, हिस्सेदारी और किसी बैंक ऋण या विवाद के उल्लेख की जांच करें।',
      },
      {
        headingEn: '2. Complete Sale Deed Chain & Non-Encumbrance Certificate (EC)',
        headingHi: '2. पिछली रजिस्ट्री श्रृंखला और भार-मुक्त प्रमाणपत्र (EC)',
        contentEn:
          'Trace ownership transfers across at least 12 to 30 years via original registered Sale Deeds, Partition Deeds, or Probate records, supported by a Search / Non-Encumbrance Certificate from the local Sub-Registrar office confirming the asset is free from prior registered charges.',
        contentHi:
          'सब-रजिस्ट्रार कार्यालय से सर्च/भार-मुक्त रिपोर्ट (EC) और पिछले सभी बैनामों की मूल प्रतियां जांच कर सुनिश्चित करें कि संपत्ति पर कोई पिछला बंधक नहीं है।',
      },
      {
        headingEn: '3. Sanctioned Building Map, Occupancy & Power of Attorney Caution',
        headingHi: '3. स्वीकृत नक्शा और पावर ऑफ अटॉर्नी सावधानी',
        contentEn:
          'For apartments and newly built houses, ask for the Development Authority / Municipal sanctioned layout and Completion/Occupancy status. Exercise extreme caution with unregistered General Power of Attorney (GPA) deals; register title directly from recorded legal owners.',
        contentHi:
          'बने हुए मकान या फ्लैट के लिए स्वीकृत नक्शा जांचें और अपंजीकृत पावर ऑफ अटॉर्नी के बजाय सीधे मूल स्वामी से पक्की रजिस्ट्री कराएं।',
      },
    ],
  },
  {
    slug: 'understanding-property-registration-uttarakhand',
    titleEn: 'Understanding Property Registration & Mutation (Dakhil Kharij) in Uttarakhand',
    titleHi: 'उत्तराखंड में प्रॉपर्टी रजिस्ट्री और दाखिल-खारिज प्रक्रिया की समझ',
    metaTitle: 'Property Registration & Mutation Process in Uttarakhand Explained',
    metaDescription:
      'Step-by-step overview of how property registration, stamp duty valuation, Sub-Registrar execution, and Dakhil Kharij mutation work in Uttarakhand.',
    readTime: '5 min read',
    category: 'Legal & Registry',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Land & Revenue Documentation',
    publishedDate: '2026-07-18',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Properties in Uttarakhand', path: '/properties-in-uttarakhand' },
      { label: 'Houses for Sale in Dehradun', path: '/houses-for-sale-in-dehradun' },
    ],
    summaryEn:
      'Completing registry at the Sub-Registrar office is only half the journey—post-registration mutation (Dakhil Kharij) updates government records in your name.',
    summaryHi:
      'सब-रजिस्ट्रार कार्यालय में बैनामा कराने से लेकर तहसील में दाखिल-खारिज (नाम चढ़ाने) तक की पूरी प्रक्रिया का सरल विवरण।',
    sections: [
      {
        headingEn: '1. Circle Rate Valuation & E-Stamp Payment',
        headingHi: '1. सर्किल रेट मूल्यांकन और ई-स्टांप शुल्क',
        contentEn:
          'Stamp duty and registration fees in Uttarakhand are assessed on whichever is higher between the declared sale consideration and the government Circle Rate notified for that ward or village. Stamp duty concessions or gender-specific rebates may apply per prevailing state government notifications—confirm current rates at the Sub-Registrar office.',
        contentHi:
          'स्टांप शुल्क वास्तविक विक्रय मूल्य या सरकारी सर्किल रेट (जो भी अधिक हो) के आधार पर तय होता है। ताज़ा दरों व महिला छूट संबंधी नियमों की पुष्टि सब-रजिस्ट्रार कार्यालय से करें।',
      },
      {
        headingEn: '2. Sale Deed Execution & Post-Registry Mutation (Dakhil Kharij)',
        headingHi: '2. रजिस्ट्री निष्पादन और दाखिल-खारिज की प्रक्रिया',
        contentEn:
          'Both buyer, seller, and two witnesses attend biometric verification at the jurisdiction Sub-Registrar office. Crucially, do not stop at collecting the registered deed: apply promptly for Dakhil Kharij (mutation) at the Tehsil court (for land) or Nagar Nigam / Palika (for municipal houses) so your name enters the Khatauni or municipal tax register.',
        contentHi:
          'रजिस्ट्री के तुरंत बाद तहसील या नगर निगम में दाखिल-खारिज का आवेदन अवश्य करें, ताकि सरकारी खतौनी/अभिलेखों में क्रेता का नाम विधिवत दर्ज हो सके।',
      },
    ],
  },
  {
    slug: 'common-mistakes-purchasing-land-uttarakhand',
    titleEn: 'Common Mistakes to Avoid When Purchasing Land in Uttarakhand',
    titleHi: 'उत्तराखंड में ज़मीन खरीदते समय की जाने वाली आम गलतियाँ और उनसे बचाव',
    metaTitle: '8 Common Mistakes When Buying Land in Uttarakhand & How to Avoid Them',
    metaDescription:
      'Avoid costly pitfalls when buying plots or hillside land in Uttarakhand: unverified unit conversions, missing co-sharer NOCs, unmeasured boundaries, and rural ceiling errors.',
    readTime: '6 min read',
    category: 'Buyer Protection',
    authorName: 'Uttarakhand Gateways Research Desk',
    authorRole: 'Buyer Protection Advisory',
    publishedDate: '2026-08-05',
    updatedDate: '2026-11-01',
    relatedLinks: [
      { label: 'Land for Sale in Uttarakhand', path: '/land-for-sale-in-uttarakhand' },
      { label: 'Plots for Sale in Rishikesh', path: '/plots-for-sale-in-rishikesh' },
      { label: 'Listing Verification Guidelines', path: '/listing-guidelines' },
    ],
    summaryEn:
      'From local unit misunderstandings (Nali vs Bigha vs Sq.Ft) to informal verbal boundaries on mountain slopes, learn the most frequent traps that catch first-time hill buyers.',
    summaryHi:
      'नाली-बीघा की माप में भ्रम से लेकर सह-खातेदारों की सहमति न लेने तक—पहाड़ी और तराई क्षेत्रों में ज़मीन खरीदते समय इन आम भूलों से बचें।',
    sections: [
      {
        headingEn: '1. Paying Advances Before Independent Physical Demarcation',
        headingHi: '1. मौके पर पैमाइश (Demarcation) से पहले बयाना देना',
        contentEn:
          'Sloped terrain and terraces make visual area estimation unreliable. Never lock sizable token money solely based on a broker’s sketch; get revenue demarcation (Hadbandi) conducted in presence of adjoining plot owners.',
        contentHi:
          'पहाड़ी ढलानों पर आंखों के अंदाज़ से ज़मीन का रकबा समझना कठिन होता है, इसलिए बयाने से पहले अधिकृत पैमाइश और पड़ोसी सीमाओं की पुष्टि अवश्य कराएं।',
      },
      {
        headingEn: '2. Overlooking Multiple Co-Sharers in Joint Khataunis',
        headingHi: '2. संयुक्त खतौनी में सभी सह-खातेदारों की सहमति न लेना',
        contentEn:
          'Ancestral mountain holdings frequently list several siblings or cousins in a single joint Khatauni without formal partition (Batwara). Ensure every recorded shareholder either executes the deed or formally consents after legal division of the specific plot.',
        contentHi:
          'पैतृक भूमि में अक्सर कई सह-खातेदार दर्ज होते हैं। बिना बंटवारा या सभी हिस्सेदारों की लिखित सहमति के सौदा करने पर भविष्य में कानूनी अड़चन आ सकती है।',
      },
      {
        headingEn: '3. Mixing Up Bigha Standards & Nali Conversions',
        headingHi: '3. नाली, मुट्ठी और कच्चा/पक्का बीघा के माप में भ्रम',
        contentEn:
          'Hill districts standardize on 1 Nali (2,160 sq.ft / 240 sq.yd), whereas foothill plains like Dehradun and Haridwar use Bigha measurements whose sq.ft value differs sharply between districts. Always insist that total area appears unambiguously in square feet or square meters inside the Sale Deed.',
        contentHi:
          'हर जिले में बीघा का आकार अलग हो सकता है, इसलिए अनुबंध और रजिस्ट्री में क्षेत्रफल स्पष्ट रूप से वर्ग फुट या वर्ग मीटर में भी दर्ज कराएं।',
      },
    ],
  },
];
