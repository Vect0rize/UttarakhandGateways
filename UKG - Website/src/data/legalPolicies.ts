export type LegalPolicyId = 
  | 'terms'
  | 'privacy'
  | 'cookie'
  | 'disclaimer'
  | 'grievance'
  | 'listing_policy'
  | 'seller_agreement';

export interface LegalPolicySection {
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  bulletPointsEn?: string[];
  bulletPointsHi?: string[];
}

export interface LegalPolicy {
  id: LegalPolicyId;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  iconName: string;
  badgeEn: string;
  badgeHi: string;
  lastUpdated: string;
  sections: LegalPolicySection[];
}

export const LEGAL_POLICIES: Record<LegalPolicyId, LegalPolicy> = {
  terms: {
    id: 'terms',
    titleEn: 'Terms & Conditions / Terms of Use',
    titleHi: 'नियम व शर्तें / उपयोग की शर्तें',
    subtitleEn: 'Legal framework governing your access and usage of the Uttarakhand Gateways marketplace.',
    subtitleHi: 'उत्तराखंड गेटवेज मार्केटप्लेस के उपयोग और पहुंच को नियंत्रित करने वाले कानूनी नियम।',
    iconName: 'FileText',
    badgeEn: 'Binding Legal Agreement',
    badgeHi: 'बाध्यकारी कानूनी अनुबंध',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. Acceptance of Terms & Intermediary Status',
        titleHi: '१. शर्तों की स्वीकृति एवं मध्यस्थ मंच का स्वरूप',
        contentEn: 'By accessing, browsing, or registering on Uttarakhand Gateways ("Platform", "We", "Us", or "Our"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and all applicable laws of India and the State of Uttarakhand. Uttarakhand Gateways functions as an electronic marketplace and intermediary as defined under Section 2(1)(w) of the Information Technology Act, 2000 and rules framed thereunder, specifically Section 79 (safe harbour for intermediaries).',
        contentHi: 'उत्तराखंड गेटवेज ("मंच", "हम", या "हमारा") का उपयोग, ब्राउज़िंग अथवा पंजीकरण करके आप स्वीकार करते हैं कि आपने इन उपयोग की शर्तों तथा भारत गणराज्य और उत्तराखंड राज्य के सभी लागू कानूनों को पढ़, समझ लिया है और उनसे बाध्य होने के लिए सहमत हैं। सूचना प्रौद्योगिकी अधिनियम, २००० की धारा २(१)(w) और धारा ७९ के अंतर्गत उत्तराखंड गेटवेज एक इलेक्ट्रॉनिक मध्यस्थ व रियल एस्टेट मार्केटप्लेस के रूप में कार्य करता है।',
        bulletPointsEn: [
          'Access to the platform implies unequivocal consent to these Terms of Use.',
          'Intermediary status protected under Section 79 of the Information Technology Act, 2000.',
          'Transactions, inquiries, and deeds are conducted directly between users.'
        ],
        bulletPointsHi: [
          'मंच के उपयोग से इन शर्तों के प्रति आपकी पूर्ण सहमति मानी जाएगी।',
          'सूचना प्रौद्योगिकी अधिनियम, २००० की धारा ७९ के अंतर्गत मध्यस्थ संरक्षण लागू है।',
          'सभी लेनदेन, पूछताछ और सौदे उपयोगकर्ताओं के मध्य सीधे संपन्न होते हैं।'
        ]
      },
      {
        titleEn: '2. User Eligibility & Account Responsibilities',
        titleHi: '२. उपयोगकर्ता पात्रता एवं खाता सुरक्षा दायित्व',
        contentEn: 'Users must be at least 18 years of age and legally competent to enter into binding contracts under the Indian Contract Act, 1872. When registering an account or uploading property listings, you agree to provide true, accurate, and current information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.',
        contentHi: 'भारतीय अनुबंध अधिनियम, १८७२ के अनुसार मंच का उपयोग करने वाले व्यक्ति की आयु कम से कम १८ वर्ष होनी चाहिए तथा वह विधिक अनुबंध करने में सक्षम होना चाहिए। खाता पंजीकृत करते समय अथवा संपत्ति की सूची डालते समय आपको पूर्णतः सत्य और प्रामाणिक विवरण देना अनिवार्य है। अपने क्रेडेंशियल्स की गोपनीयता बनाए रखने की पूरी जिम्मेदारी आपकी होगी।',
        bulletPointsEn: [
          'Mandatory age threshold: 18 years or older.',
          'Account changes: Username modifications are subject to a rolling limit of 2 times per 7-day period for security.',
          'Account deletion: Deleting your account will automatically and permanently delete all your uploaded property listings and active chat threads.'
        ],
        bulletPointsHi: [
          'न्यूनतम आयु सीमा: १८ वर्ष या उससे अधिक।',
          'खाता संशोधन: सुरक्षा कारणों से यूजरनेम बदलने की सीमा प्रति ७ दिन में अधिकतम २ बार निर्धारित है।',
          'खाता विलोपन: अपना खाता हटाने पर आपकी समस्त लिस्टेड संपत्तियां और चैट संदेश स्वतः व स्थायी रूप से हटा दिए जाते हैं।'
        ]
      },
      {
        titleEn: '3. 0% Brokerage & Direct Marketplace Model',
        titleHi: '३. ०% ब्रोकरेज एवं प्रत्यक्ष मार्केटप्लेस मॉडल',
        contentEn: 'Uttarakhand Gateways operates on a strictly transparent 0% brokerage model. We do not charge commission from buyers or individual property owners for basic listing and direct peer-to-peer communication. We do not participate in negotiations, cash handovers, registry fees, token money (Bayana), or stamp duty payments. Any offline monetary transaction between buyer and seller is at their sole mutual risk and discretion.',
        contentHi: 'उत्तराखंड गेटवेज ०% ब्रोकरेज के पारदर्शी सिद्धांत पर कार्य करता है। हम सामान्य लिस्टिंग अथवा सीधे खरीदार-मालिक संवाद हेतु किसी भी प्रकार का कमीशन या दलाली शुल्क नहीं लेते। हम किसी भी ऑफलाइन सौदे, नकद भुगतान, बयाना (टोकन मनी) अथवा रजिस्ट्री स्टाम्प शुल्क के लेन-देन में मध्यस्थ या गवाह नहीं बनते। ऑफलाइन लेन-देन पक्षों के अपने विवेक व जोखिम पर होता है।',
        bulletPointsEn: [
          'Zero platform commission on peer-to-peer real estate transactions.',
          'No escrow or financial handling: Payment arrangements must be executed through formal legal channels (Bank Drafts, RTGS, Escrow Lawyers).',
          'Independent inspection: Buyers must physically inspect sites and verify mutation records (Dakhil-Kharij).'
        ],
        bulletPointsHi: [
          'सीधे संपर्कों पर मंच द्वारा कोई ब्रोकरेज या कमीशन देय नहीं है।',
          'कोई वित्तीय हस्तांतरण नहीं: सभी भुगतान कानूनी बैंकिंग माध्यमों (ड्राफ्ट, आरटीजीएस आदि) से ही किए जाने चाहिए।',
          'स्वतंत्र निरीक्षण: खरीदारों को स्थल का भौतिक निरीक्षण व दाखिल-खारिज की पुष्टि स्वयं करनी चाहिए।'
        ]
      },
      {
        titleEn: '4. Prohibited Conduct & Content Moderation',
        titleHi: '४. प्रतिबंधित गतिविधियां एवं सामग्री मॉडरेशन',
        contentEn: 'Users may not upload fraudulent, misleading, or encumbered property listings, nor list land under government dispute or forest reserve restrictions. All uploaded photographs undergo automated AI safety and moderation checks. Content depicting violence, inappropriate visuals, fake documents, or copyright violations will be blocked, deleted, and reported.',
        contentHi: 'उपयोगकर्ता कोई भी भ्रामक, विवादित, सरकारी अथवा वन भूमि से संबंधित अवैध सूची पोस्ट नहीं कर सकते। सभी अपलोड की गई तस्वीरों की स्वचालित एआई सुरक्षा जांच की जाती है। अनुचित, अश्लील, कॉपीराइट उल्लंघन अथवा फर्जी तस्वीरों को तुरंत ब्लॉक व डिलीट कर दिया जाएगा।',
        bulletPointsEn: [
          'Strict prohibition of fraudulent documents or unauthorized third-party broker listings.',
          'AI-moderated photo safety scan blocks unsuitable visuals automatically.',
          'Violation may lead to immediate listing ban and permanent profile termination.'
        ],
        bulletPointsHi: [
          'फर्जी दस्तावेज अथवा अनधिकृत दलाल प्रविष्टियां पूरी तरह प्रतिबंधित हैं।',
          'एआई फोटो सुरक्षा जांच अनुपयुक्त छवियों को स्वतः हटा देती है।',
          'नियम उल्लंघन पर तत्काल लिस्टिंग डिलीट व खाता स्थायी रूप से बैन किया जा सकता है।'
        ]
      },
      {
        titleEn: '5. Limitation of Liability & Governing Jurisdiction',
        titleHi: '५. देयता की सीमा एवं विधिक क्षेत्राधिकार',
        contentEn: 'To the maximum extent permitted under applicable law, Uttarakhand Gateways and its operators shall not be liable for any direct, indirect, punitive, or consequential damages resulting from property disputes, defective titles, fraudulent seller representations, or failed transactions. All disputes arising out of these terms shall be subject to the exclusive jurisdiction of the competent civil courts at Dehradun or the Hon\'ble High Court of Uttarakhand at Nainital, India.',
        contentHi: 'लागू कानून की सीमा तक, उत्तराखंड गेटवेज और इसके संचालक संपत्ति के स्वामित्व विवादों, दोषपूर्ण रजिस्ट्री, विक्रेता के असत्य बयानों अथवा विफल सौदों से होने वाले किसी भी नुकसान के लिए उत्तरदायी नहीं होंगे। इन शर्तों से संबंधित सभी विवादों का क्षेत्राधिकार देहरादून के सक्षम दीवानी न्यायालयों तथा माननीय उत्तराखंड उच्च न्यायालय, नैनीताल के अधीन होगा।',
        bulletPointsEn: [
          'No liability for offline title defect or unregistered private agreements.',
          'Exclusive legal jurisdiction: Dehradun & Nainital, Uttarakhand, India.'
        ],
        bulletPointsHi: [
          'दोषपूर्ण स्वामित्व या मौखिक समझौतों के लिए मंच उत्तरदायी नहीं है।',
          'अनन्य विधिक क्षेत्राधिकार: देहरादून एवं नैनीताल, उत्तराखंड, भारत।'
        ]
      }
    ]
  },

  privacy: {
    id: 'privacy',
    titleEn: 'Privacy Policy',
    titleHi: 'गोपनीयता नीति (Privacy Policy)',
    subtitleEn: 'How we collect, safeguard, and respect your personal and property data in accordance with DPDP Act 2023.',
    subtitleHi: 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम २०२३ के तहत हम आपकी जानकारी को कैसे सुरक्षित व प्रबंधित करते हैं।',
    iconName: 'ShieldCheck',
    badgeEn: 'DPDP Act 2023 Compliant',
    badgeHi: 'डीपीडीपी अधिनियम २०२३ के अनुकूल',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. Commitment to Data Protection',
        titleHi: '१. डेटा सुरक्षा के प्रति हमारी प्रतिबद्धता',
        contentEn: 'Uttarakhand Gateways values your privacy and is dedicated to complying with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. This Privacy Policy details our practices concerning personal data collection, processing, and rights.',
        contentHi: 'उत्तराखंड गेटवेज आपकी गोपनीयता का पूर्ण सम्मान करता है और डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, २०२३ (DPDP Act) तथा सूचना प्रौद्योगिकी नियमावली, २०११ का दृढ़ता से पालन करता है। यह नीति बताती है कि आपकी व्यक्तिगत जानकारी कैसे एकत्र और सुरक्षित की जाती है।',
        bulletPointsEn: [
          'Data fiduciary accountability under Indian DPDP Act 2023.',
          'Zero sale of personal numbers or buyer contact sheets to telemarketing spam agencies.',
          'Granular privacy toggles for phone numbers and messaging.'
        ],
        bulletPointsHi: [
          'भारतीय डीपीडीपी अधिनियम २०२३ के अंतर्गत डेटा की पूर्ण सुरक्षा।',
          'टेलीमार्केटिंग एजेंसियों को नंबर या डाटा बेचने पर सख्त पाबंदी।',
          'फोन नंबर व चैट के लिए उन्नत गोपनीयता नियंत्रण विकल्प।'
        ]
      },
      {
        titleEn: '2. Information We Collect',
        titleHi: '२. हमारे द्वारा एकत्र की जाने वाली जानकारी',
        contentEn: 'We collect minimal and purposeful data needed to facilitate authentic property discoveries and secure buyer-seller correspondence: (a) Account Identifiers: username, email address or mobile phone number, encrypted password hash; (b) Property Listings: property dimensions, photographs, geographical city/locality, RERA registration numbers, pricing; (c) Direct Inquiries: chat thread transcripts, phone reveal approvals.',
        contentHi: 'हम केवल वही आवश्यक जानकारी एकत्र करते हैं जो प्रामाणिक प्रॉपर्टी खोज और सुरक्षित संवाद हेतु आवश्यक हो: (क) खाता विवरण: यूजरनेम, ईमेल या मोबाइल नंबर, एन्क्रिप्टेड पासवर्ड; (ख) संपत्ति विवरण: क्षेत्रफल, तस्वीरें, शहर व स्थान, रेरा संख्या, मूल्य; (ग) संवाद डेटा: इनबॉक्स चैट और फोन नंबर अनुरोध अनुमोदन।',
        bulletPointsEn: [
          'Registration: Mobile number/Email + Username.',
          'Property Media: Clean property photographs with AI safety metadata.',
          'Chat Records: Stored locally and securely for in-app buyer-seller continuity.'
        ],
        bulletPointsHi: [
          'पंजीकरण: मोबाइल/ईमेल एवं यूजरनेम।',
          'तस्वीरें: एआई सुरक्षा जांच से सत्यापित वास्तविक संपत्ति तस्वीरें।',
          'चैट रिकॉर्ड: इन-ऐप सुरक्षित संवाद बनाए रखने हेतु सुरक्षित रूप से संग्रहीत।'
        ]
      },
      {
        titleEn: '3. Phone Number Masking & Controlled Access',
        titleHi: '३. फ़ोन नंबर मास्किंग एवं नियंत्रित संपर्क प्रणाली',
        contentEn: 'To shield sellers and buyers from unwanted spam calls and unsolicited broker solicitations, owner phone numbers are never made public by default on property cards. Potential buyers must click "Request Phone Number", and the seller receives an authorization prompt in their Inbox. Only upon seller approval is the verified direct contact revealed.',
        contentHi: 'विक्रेताओं और खरीदारों को अनचाही स्पैम कॉल्स व ब्रोकरों से बचाने के लिए, संपत्ति कार्डों पर मालिक का फोन नंबर सार्वजनिक रूप से नहीं दिखाया जाता। खरीदार को "नंबर अनुरोध" करना होता है और मालिक द्वारा इनबॉक्स में मंजूरी दिए जाने के बाद ही नंबर प्रदर्शित होता है।',
        bulletPointsEn: [
          'Default masking on all property marketplace cards.',
          'Bilateral consent model: The owner must approve the request before disclosure.',
          'Protection against scraper bots and automated dialers.'
        ],
        bulletPointsHi: [
          'मार्केटप्लेस कार्ड पर नंबर स्वतः छिपा रहता है।',
          'द्विपक्षीय सहमति मॉडल: मालिक की स्वीकृति के बाद ही नंबर दिखेगा।',
          'वेब स्क्रैपर्स और स्वचालित बॉट से पूर्ण सुरक्षा।'
        ]
      },
      {
        titleEn: '4. Data Retention & Deletion ("Right to be Forgotten")',
        titleHi: '४. डेटा प्रतिधारण एवं खाता हटाने का अधिकार',
        contentEn: 'You have full autonomy over your data. You may modify your personal details or initiate complete account deletion at any time from your Profile Settings. Upon deletion, your account credentials and all property listings associated with your identity are instantly and permanently purged from the active marketplace.',
        contentHi: 'आपको अपने डेटा पर पूर्ण नियंत्रण प्राप्त है। आप प्रोफ़ाइल सेटिंग्स से कभी भी अपना विवरण संशोधित कर सकते हैं या खाता पूरी तरह हटा सकते हैं। खाता डिलीट करने पर आपकी समस्त लिस्टेड संपत्तियां मंच से तुरंत व हमेशा के लिए हटा दी जाती हैं।',
        bulletPointsEn: [
          'Self-service account deletion accessible directly inside user profile.',
          'Cascade purging: All active listings, uploaded media, and threads are cleared.',
          'No residual marketing retention.'
        ],
        bulletPointsHi: [
          'प्रोफ़ाइल से सीधे एक क्लिक में खाता हटाने की सुविधा।',
          'कैस्केड विलोपन: सभी सक्रिय लिस्टिंग, तस्वीरें व चैट तुरंत हटा दी जाती हैं।',
          'कोई अवांछित डेटा बैकअप नहीं रखा जाता।'
        ]
      }
    ]
  },

  cookie: {
    id: 'cookie',
    titleEn: 'Cookie Policy',
    titleHi: 'कुकी नीति (Cookie Policy)',
    subtitleEn: 'How we use essential cookies and browser storage for authentication, preferences, and performance.',
    subtitleHi: 'सत्र प्रमाणीकरण, प्राथमिकताओं और प्रदर्शन हेतु कुकीज व ब्राउज़र स्टोरेज का उपयोग।',
    iconName: 'Cookie',
    badgeEn: 'Transparent Storage Practices',
    badgeHi: 'पारदर्शी कुकी प्रणाली',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. What Are Cookies & Local Storage?',
        titleHi: '१. कुकीज़ एवं लोकल स्टोरेज क्या हैं?',
        contentEn: 'Cookies and local storage objects are small text data files placed on your device when you visit web applications. They allow our platform to recognize your device, maintain your signed-in state, remember your selected language (Hindi / English), and store your shortlisted favorite properties between browsing sessions.',
        contentHi: 'कुकीज़ और लोकल स्टोरेज छोटी टेक्स्ट फाइलें होती हैं जो वेबसाइट विजिट करने पर आपके डिवाइस में सुरक्षित होती हैं। ये हमारे मंच को आपके डिवाइस को पहचानने, लॉगिन बनाए रखने, आपकी चुनी हुई भाषा (हिंदी/अंग्रेजी) याद रखने और पसंदीदा संपत्तियों को सहेजने में मदद करती हैं।',
        bulletPointsEn: [
          'Essential for browser session continuity and secure multi-account switching.',
          'Local storage enables instant, offline-resilient preference loading.'
        ],
        bulletPointsHi: [
          'सत्र निरंतरता और सुरक्षित खाता स्विचिंग हेतु अनिवार्य।',
          'लोकल स्टोरेज बिना देरी के आपकी प्राथमिकताओं को लोड करता है।'
        ]
      },
      {
        titleEn: '2. Categorization of Cookies We Use',
        titleHi: '२. हमारे द्वारा उपयोग की जाने वाली कुकीज़ के प्रकार',
        contentEn: 'We maintain a minimal and functional storage footprint. We categorize our cookies and storage mechanisms into four distinct tiers:',
        contentHi: 'हम केवल आवश्यक व उपयोगी स्टोरेज का उपयोग करते हैं। हमारी कुकीज को निम्नलिखित श्रेणियों में विभाजित किया गया है:',
        bulletPointsEn: [
          'Strictly Necessary Cookies: Session keys, authentication tokens, rate-limiting cooldown timers, and device account security.',
          'Preference Cookies: Selected language (Hindi / English toggle state) and UI color scheme (Dark mode / Light mode).',
          'Functional Storage: Shortlisted saved properties, draft listings in progress, and in-app chat thread continuity.',
          'Analytics & Performance: Anonymized page response telemetry and search filter counters (no cross-site advertising tracking).'
        ],
        bulletPointsHi: [
          'अति-आवश्यक कुकीज़: सत्र सुरक्षा, लॉगिन टोकन, अपलोड कूलडाउन टाइमर और खाता सुरक्षा।',
          'प्राथमिकता कुकीज़: भाषा चयन (हिंदी/अंग्रेजी) एवं थीम मोड (डार्क/लाइट)।',
          'कार्यात्मक स्टोरेज: सहेजी गई संपत्तियां, अपलोड ड्राफ्ट और इन-ऐप चैट इतिहास।',
          'एनालिटिक्स व प्रदर्शन: गुमनाम पृष्ठ प्रदर्शन मेट्रिक्स (कोई क्रॉस-साइट विज्ञापन ट्रैकिंग नहीं)।'
        ]
      },
      {
        titleEn: '3. Analytics, Advertising & Third-Party Cookies',
        titleHi: '३. एनालिटिक्स, विज्ञापन एवं तृतीय-पक्ष कुकीज़',
        contentEn: 'Uttarakhand Gateways does NOT employ predatory third-party advertising cookies, ad-retargeting pixels, or data broker beacons. We do not sell your browsing history, price inquiries, or property view habits to third-party marketing companies. Any performance metrics gathered are strictly aggregated and anonymous to optimize website speed in low-bandwidth Himalayan network areas.',
        contentHi: 'उत्तराखंड गेटवेज किसी भी आक्रामक विज्ञापन कुकी, ट्रैकिंग पिक्सेल या डेटा ब्रोकर्स का उपयोग नहीं करता है। हम आपकी खोजों या संपत्ति प्राथमिकताओं को किसी विज्ञापन एजेंसी को नहीं बेचते। एकत्रित मेट्रिक्स केवल पहाड़ी क्षेत्रों में कम इंटरनेट स्पीड पर वेबसाइट को तेज़ चलाने के लिए उपयोग किए जाते हैं।',
        bulletPointsEn: [
          'Zero cross-site advertising trackers or behavioral profiling pixels.',
          'No data resale to third-party financial or mortgage marketing firms.',
          'Optimized for remote connectivity across Uttarakhand hill terrains.'
        ],
        bulletPointsHi: [
          'कोई तृतीय-पक्ष क्रॉस-साइट विज्ञापन या बिहेवियरल ट्रैकर नहीं।',
          'लोन या मार्केटिंग कंपनियों को डेटा कभी नहीं बेचा जाता।',
          'पहाड़ी क्षेत्रों में कमजोर नेटवर्क पर भी सुगम गति हेतु अनुकूलित।'
        ]
      },
      {
        titleEn: '4. How You Can Control & Clear Cookies',
        titleHi: '४. कुकीज़ को नियंत्रित व हटाने का तरीका',
        contentEn: 'You have full discretion to delete or block cookies through your browser settings (Chrome, Safari, Firefox, Edge). Please note that clearing essential session storage will sign you out of your account and reset your language and theme preferences.',
        contentHi: 'आप अपने ब्राउज़र की सेटिंग्स (क्रोम, सफारी, फ़ायरफ़ॉक्स आदि) से किसी भी समय कुकीज़ को डिलीट या ब्लॉक कर सकते हैं। कृपया ध्यान दें कि आवश्यक कुकीज हटाने पर आपका खाता लॉग आउट हो जाएगा और भाषा व थीम डिफ़ॉल्ट पर रीसेट हो जाएगी।',
        bulletPointsEn: [
          'Browser settings allow one-click cookie and site data purge.',
          'Private/Incognito browsing operates without persisting local preferences.'
        ],
        bulletPointsHi: [
          'ब्राउज़र सेटिंग्स के माध्यम से कभी भी डेटा साफ़ करने की स्वतंत्रता।',
          'इंकॉग्निटो/प्राइवेट विंडो में बिना प्राथमिकता सहेजे देखने की सुविधा।'
        ]
      }
    ]
  },

  disclaimer: {
    id: 'disclaimer',
    titleEn: 'Disclaimer',
    titleHi: 'अस्वीकरण (Disclaimer)',
    subtitleEn: 'Crucial disclosures regarding property verification, title due diligence, and Uttarakhand land ceiling laws.',
    subtitleHi: 'संपत्ति स्वामित्व, रजिस्ट्री सत्यापन और उत्तराखंड भू-अधिनियम संबंधी आवश्यक कानूनी अस्वीकरण।',
    iconName: 'AlertTriangle',
    badgeEn: 'Important Real Estate Notice',
    badgeHi: 'महत्वपूर्ण रियल एस्टेट सूचना',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. Independent Due Diligence & Title Search Notice',
        titleHi: '१. स्वतंत्र कानूनी जांच एवं स्वामित्व सत्यापन सूचना',
        contentEn: 'Uttarakhand Gateways is an online discovery marketplace and does NOT act as a title insurer, legal advocate, escrow authority, or certified property appraiser. All property details, photographs, super built-up areas, amenities, and pricing are uploaded directly by individual property owners, builders, or authorized representatives. Buyers are strictly advised to engage qualified legal counsel and conduct a comprehensive title search at the Sub-Registrar Office before executing any financial transaction.',
        contentHi: 'उत्तराखंड गेटवेज केवल एक ऑनलाइन खोज मंच है और यह कोई कानूनी सलाहकार, टाइटल बीमाकर्ता या सरकारी मूल्यांकक नहीं है। सभी विवरण, क्षेत्रफल, तस्वीरें और दरें संपत्ति मालिकों या बिल्डरों द्वारा स्वयं दर्ज की जाती हैं। खरीदारों को पुरजोर सलाह दी जाती है कि वे कोई भी धन देने से पूर्व उप-निबंधक (Sub-Registrar) कार्यालय में जाकर १२ वर्षीय भार-मुक्त प्रमाणपत्र (Non-Encumbrance) व खतौनी की स्वतंत्र कानूनी जांच अवश्य करवाएं।',
        bulletPointsEn: [
          'Verification of Khatauni, Khasra, and Mutation (Dakhil-Kharij) is mandatory for buyers.',
          'Physical boundary survey with a certified local Patwari/Lekhpal is strongly recommended.',
          'Platform does not guarantee unencumbered title or absence of civil mortgage claims.'
        ],
        bulletPointsHi: [
          'खतौनी, खसरा और दाखिल-खारिज की जांच खरीदार द्वारा किया जाना अनिवार्य है।',
          'स्थानीय पटवारी/लेखपाल के माध्यम से मौके की नाप-जोख की सख्त सलाह दी जाती है।',
          'मंच किसी बैंक बंधक या पारिवारिक विवाद से मुक्त होने की पूर्ण गारंटी नहीं देता।'
        ]
      },
      {
        titleEn: '2. Uttarakhand Land Laws & 250 Sq. Meter Ceiling Limits',
        titleHi: '२. उत्तराखंड भू-अधिनियम एवं २५० वर्ग मीटर सीमा नियम',
        contentEn: 'Prospective buyers must familiarize themselves with the Uttarakhand (Uttar Pradesh Zamindari Abolition and Land Reforms Act, 1950) Adaptation and Modification Order, 2007 and subsequent state land amendments. Outside-state residents purchasing agricultural land in rural areas are subject to the statutory ceiling limit of 250 square meters per family, unless the land has been legally converted under Section 143 (now Section 80/81 under current revenue codes) for non-agricultural residential use.',
        contentHi: 'उत्तराखंड में जमीन खरीदने से पहले खरीदार को उत्तराखंड (उत्तर प्रदेश जमींदारी विनाश एवं भूमि व्यवस्था अधिनियम, १९५०) के प्रासंगिक नियमों की जानकारी होनी चाहिए। राज्य के गैर-मूल निवासियों के लिए ग्रामीण क्षेत्रों में कृषि भूमि खरीदने की सीमा २५० वर्ग मीटर (लगभग १.२५ नाली) प्रति परिवार तय है, जब तक कि वह भूमि धारा १४३ (अकृषक आवासीय प्रयोजन) के अंतर्गत विधिवत परिवर्तित न हो।',
        bulletPointsEn: [
          'Non-domicile ceiling: Maximum 250 sq. meters for unconverted agricultural parcels.',
          'Section 143 / Aabadi Conversion: Clear municipal / sub-divisional residential order required for unrestricted ownership.',
          'RERA Compliance: Verify state RERA registration for multi-unit apartment complexes.'
        ],
        bulletPointsHi: [
          'गैर-मूल निवासियों हेतु गैर-परिवर्तित कृषि भूमि की अधिकतम सीमा २५० वर्ग मीटर (१.२५ नाली) है।',
          'धारा १४३ (आबादी रूपांतरण): आवासीय कॉटेज/विला हेतु सक्षम उपजिलाधिकारी का रूपांतरण आदेश देखें।',
          'रेरा अनुपालन: बहुमंजिला अपार्टमेंट्स के लिए उत्तराखंड रेरा पंजीकरण की पुष्टि करें।'
        ]
      },
      {
        titleEn: '3. Pricing, Availability & Topographical Variability',
        titleHi: '३. मूल्य, उपलब्धता एवं पर्वतीय भौगोलिक परिस्थितियां',
        contentEn: 'Property prices displayed in Lakhs (L) and Crores (Cr) are indicative and set by individual sellers. Properties in hilly regions (Nainital, Mussoorie, Mukteshwar, Almora, etc.) may involve unique topographical factors including slope angles, motorable road access widths, natural spring water availability, and winter snowfall access. Uttarakhand Gateways makes no representations regarding infrastructure permanence or seasonal weather accessibility.',
        contentHi: 'प्रदर्शित कीमतें विक्रेताओं द्वारा निर्धारित हैं। पर्वतीय क्षेत्रों (मसूरी, नैनीताल, मुक्तेश्वर, अल्मोड़ा आदि) में संपत्तियों की स्थिति, सड़क की चौड़ाई, पेयजल आपूर्ति व मौसमी बर्फबारी जैसी भौगोलिक परिस्थितियां भिन्न हो सकती हैं। इन भौतिक विशेषताओं की स्वयं जांच करना खरीदार का कर्तव्य है।',
        bulletPointsEn: [
          'Prices subject to direct negotiation between contracting parties.',
          'Physical inspection of road access and municipal water pipeline connection is vital.'
        ],
        bulletPointsHi: [
          'कीमतें पक्षों के बीच आपसी बातचीत और सौदे पर निर्भर करती हैं।',
          'सड़क संपर्क, बिजली व पेयजल उपलब्धता की मौके पर जाकर जांच करना आवश्यक है।'
        ]
      }
    ]
  },

  grievance: {
    id: 'grievance',
    titleEn: 'Grievance Redressal / Complaints',
    titleHi: 'शिकायत निवारण तंत्र (Grievance Redressal)',
    subtitleEn: 'Formal mechanism under the IT Rules 2021 to report unauthorized listings, copyright claims, or disputes.',
    subtitleHi: 'आईटी नियमावली २०२१ के अंतर्गत अनधिकृत लिस्टिंग, कॉपीराइट या धोखाधड़ी की रिपोर्ट करने का विधिक तंत्र।',
    iconName: 'HelpCircle',
    badgeEn: 'IT Rules 2021 Compliant',
    badgeHi: 'आईटी नियम २०२१ के अनुसार अधिकृत',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. Statutory Grievance Redressal Framework',
        titleHi: '१. वैधानिक शिकायत निवारण ढांचा',
        contentEn: 'In accordance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, Uttarakhand Gateways has designated a dedicated Grievance Officer to address user complaints, copyright infringement claims, disputed land listings, impersonation, or offensive content in a prompt and time-bound manner.',
        contentHi: 'सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश और डिजिटल मीडिया आचार संहिता) नियम, २०२१ के नियम ३(२) के अनुसार, उपयोगकर्ताओं की शिकायतों, अनधिकृत लिस्टिंग, कॉपीराइट विवादों अथवा धोखाधड़ी के त्वरित समाधान हेतु एक समर्पित शिकायत निवारण अधिकारी (Grievance Officer) नियुक्त किया गया है।',
        bulletPointsEn: [
          'Mandatory acknowledgement of complaint within 24 hours of receipt.',
          'Thorough disposal, resolution, or delisting action within 15 calendar days.',
          'Transparent tracking and bilateral notification of dispute resolution.'
        ],
        bulletPointsHi: [
          'शिकायत प्राप्त होने के २४ घंटे के भीतर पावती (Acknowledgement) अनिवार्य।',
          'अधिकतम १५ दिनों के भीतर जांच और उचित निवारण/लिस्टिंग हटाने की कार्रवाई।',
          'शिकायतकर्ता को समाधान की लिखित सूचना प्रेषित करना।'
        ]
      },
      {
        titleEn: '2. Designated Grievance Officer Contact Details',
        titleHi: '२. नामित शिकायत अधिकारी का संपर्क विवरण',
        contentEn: 'Users, landowners, or legal authorities may register formal complaints or legal notices to our Grievance Officer via email or written postal dispatch:',
        contentHi: 'उपयोगकर्ता, भूमि स्वामी अथवा विधिक संस्थाएं हमारे शिकायत अधिकारी को ईमेल अथवा डाक द्वारा सीधे संपर्क कर सकती हैं:',
        bulletPointsEn: [
          'Designated Officer: Grievance & Compliance Cell, Uttarakhand Gateways',
          'Official Email: grievance@uttarakhandgateways.com / legal@uttarakhandgateways.com',
          'Physical Address: Rajpur Road, Dehradun, Uttarakhand - 248001, India',
          'Operating Timings: Monday – Friday, 10:00 AM – 6:00 PM IST (Excluding Public Holidays)'
        ],
        bulletPointsHi: [
          'नामित अधिकारी: शिकायत एवं अनुपालन प्रकोष्ठ, उत्तराखंड गेटवेज',
          'आधिकारिक ईमेल: grievance@uttarakhandgateways.com / legal@uttarakhandgateways.com',
          'कार्यालय पता: राजपुर रोड, देहरादून, उत्तराखंड - २४८००१, भारत',
          'कार्य समय: सोमवार से शुक्रवार, सुबह १०:०० से शाम ६:०० बजे तक'
        ]
      },
      {
        titleEn: '3. Escalation Process & Types of Reportable Violations',
        titleHi: '३. शिकायत श्रेणियां एवं निवारण प्रक्रिया',
        contentEn: 'You may file an expedited grievance for any of the following grounds: (a) Unauthorized Listing: Property listed by an unauthorized third party without title deed consent; (b) Intellectual Property Violation: Photographs or blueprints uploaded without copyright license; (c) Fraudulent Pricing: Deliberate misrepresentation of rates or fake RERA claims; (d) Harassment: Abusive communication in direct inbox messages.',
        contentHi: 'आप निम्नलिखित आधारों पर तत्काल शिकायत दर्ज कर सकते हैं: (क) अनधिकृत लिस्टिंग: वास्तविक स्वामी की अनुमति के बिना किसी अन्य द्वारा संपत्ति पोस्ट करना; (ख) कॉपीराइट उल्लंघन: आपकी तस्वीरों या नक्शों का अनधिकृत उपयोग; (ग) फर्जी दरें या झूठे रेरा दावे; (घ) इनबॉक्स में अनुचित भाषा अथवा उत्पीड़न।',
        bulletPointsEn: [
          'Step 1: Submit complaint via the online form below or direct email with Property ID and title proof.',
          'Step 2: Internal review within 24 hours and temporary hiding of contested listing.',
          'Step 3: Permanent delisting or account suspension if violation is established.'
        ],
        bulletPointsHi: [
          'चरण १: नीचे दिए गए फॉर्म अथवा ईमेल द्वारा प्रॉपर्टी आईडी व साक्ष्य सहित विवरण भेजें।',
          'चरण २: २४ घंटे के भीतर जांच और विवादित लिस्टिंग को अस्थायी रूप से छिपाना।',
          'चरण ३: प्रमाण सिद्ध होने पर स्थायी रूप से लिस्टिंग हटाना व खाता बैन करना।'
        ]
      }
    ]
  },

  listing_policy: {
    id: 'listing_policy',
    titleEn: 'Property Listing Policy',
    titleHi: 'संपत्ति लिस्टिंग नीति (Property Listing Policy)',
    subtitleEn: 'Mandatory guidelines for publishing residential plots, flats, and cottages in Uttarakhand.',
    subtitleHi: 'उत्तराखंड में आवासीय प्लॉट, फ्लैट और कॉटेज लिस्ट करने हेतु अनिवार्य नियम व दिशानिर्देश।',
    iconName: 'Building2',
    badgeEn: 'Quality & Authenticity Standard',
    badgeHi: 'गुणवत्ता एवं प्रामाणिकता मानक',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. Genuine Ownership or Direct Authorization',
        titleHi: '१. वास्तविक स्वामित्व अथवा प्रत्यक्ष प्राधिकार',
        contentEn: 'Every listing published on Uttarakhand Gateways must represent an authentic, marketable property. The listing submitter must either be the documented legal titleholder (Khatedar / Registered Owner) or an expressly authorized power of attorney (POA) holder or direct verified builder. Phantom listings, speculative broker poaching, and unauthorized listings from other portals are strictly prohibited.',
        contentHi: 'उत्तराखंड गेटवेज पर प्रकाशित प्रत्येक संपत्ति का वास्तविक व बिक्री योग्य होना अनिवार्य है। लिस्ट करने वाला व्यक्ति स्वयं अभिलेखित भूमि स्वामी (खातेदार/रजिस्टर्ड ओनर), वैध पावर ऑफ अटॉर्नी धारक या अधिकृत बिल्डर होना चाहिए। अन्य वेबसाइटों से बिना अनुमति चुराई गई तस्वीरें या फर्जी लिस्टिंग पूरी तरह निषिद्ध हैं।',
        bulletPointsEn: [
          'Mandatory legal authority to sell the parcel or housing unit.',
          'Immediate delisting of duplicate or unauthorized broker submissions.',
          'Accurate disclosure of freehold vs leasehold status.'
        ],
        bulletPointsHi: [
          'संपत्ति बेचने का वैध कानूनी अधिकार होना अनिवार्य।',
          'अनधिकृत या डुप्लीकेट लिस्टिंग पाए जाने पर तत्काल निष्कासन।',
          'फ्रीहोल्ड अथवा लीजहोल्ड स्थिति का स्पष्ट उल्लेख आवश्यक।'
        ]
      },
      {
        titleEn: '2. Photographic & Media Quality Standards',
        titleHi: '२. फोटोग्राफ एवं मीडिया गुणवत्ता दिशानिर्देश',
        contentEn: 'Photographs must accurately depict the property itself, its physical boundary, approach road, room interior, or genuine view of the Himalayan ranges. All photos are checked with automated AI moderation. You may not upload third-party watermarked images, computer-generated deceptive renders claiming to be actual photos, or irrelevant promotional flyers.',
        contentHi: 'तस्वीरें वास्तविक संपत्ति, उसकी चारदीवारी, पहुंच मार्ग, कमरों के भीतरी भाग अथवा वास्तविक हिमालयन दृश्यों की होनी चाहिए। सभी छवियों की एआई सुरक्षा जांच होती है। किसी अन्य संस्था का वॉटरमार्क लगी तस्वीरें, भ्रामक 3D रेंडर अथवा अवांछित प्रचार सामग्री अपलोड करना वर्जित है।',
        bulletPointsEn: [
          'Real photographs taken at the physical location preferred.',
          'Minimum 1 cover photo; up to 6 high-resolution authentic photographs.',
          'Automated AI filter blocks inappropriate, offensive, or non-real-estate visuals.'
        ],
        bulletPointsHi: [
          'वास्तविक स्थल पर खींची गई प्रामाणिक तस्वीरों को प्राथमिकता।',
          'कम से कम १ कवर फोटो; अधिकतम ६ उच्च गुणवत्ता वाली तस्वीरें।',
          'एआई फिल्टर अनुपयुक्त या असंबंधित तस्वीरों को तुरंत ब्लॉक कर देता है।'
        ]
      },
      {
        titleEn: '3. Uttarakhand Zoning, Land Classification & Prohibited Parcels',
        titleHi: '३. भू-वर्गीकरण, जोनिंग एवं प्रतिबंधित संपत्तियां',
        contentEn: 'Listings must accurately disclose whether land is Section 143 converted (Aabadi residential) or agricultural (Krishi). The following categories are categorically barred from listing on Uttarakhand Gateways:',
        contentHi: 'लिस्टिंग में यह स्पष्ट करना अनिवार्य है कि भूमि धारा १४३ (आबादी) के तहत परिवर्तित है अथवा कृषि योग्य। निम्नलिखित श्रेणियों की संपत्तियां मंच पर सूचीबद्ध करने के लिए पूरी तरह प्रतिबंधित हैं:',
        bulletPointsEn: [
          'Protected Reserve Forest (Sanrakshit Van) or Benap / Civil Soyam land without de-notification.',
          'Parcels falling within the prohibited floodway buffers of riverbeds (Ganga, Alaknanda, Bhagirathi, Kosi, etc.).',
          'Disputed ancestral coparcenary land subject to active stay orders from civil courts or revenue boards.',
          'Government leased Nazul land where lease renewal has lapsed or transfer is statutorily restricted.'
        ],
        bulletPointsHi: [
          'संरक्षित वन क्षेत्र, बेनाप भूमि अथवा बिना अनुमति वाली सिविल सोयम भूमि।',
          'नदियों (गंगा, अलकनंदा, कोसी आदि) के निर्धारित बाढ़ क्षेत्र (Riverbed Buffer) में आने वाली जमीन।',
          'विवादित पैतृक संपत्ति जिस पर अदालत या राजस्व न्यायालय द्वारा स्थगन (Stay Order) दिया गया हो।',
          'ऐसी नजूल भूमि जिसकी लीज समाप्त हो चुकी हो अथवा जिसका हस्तांतरण प्रतिबंधित हो।'
        ]
      },
      {
        titleEn: '4. Rate Limiting & Cooldown Integrity',
        titleHi: '४. लिस्टिंग सीमा एवं कूलडाउन नियम',
        contentEn: 'To prevent marketplace flooding and bot spam, accounts are subject to a standard 5-minute cooldown between listing submissions. Repeated spamming, automated script posting, or deliberate price manipulation will lead to immediate account suspension.',
        contentHi: 'बाजार में अनावश्यक स्पैमिंग रोकने हेतु दो लिस्टिंग के बीच ५ मिनट का सुरक्षा कूलडाउन अनिवार्य है। स्वचालित बॉट अथवा स्क्रिप्ट द्वारा बार-बार पोस्टिंग करने पर खाता निलंबित कर दिया जाएगा।',
        bulletPointsEn: [
          '5-minute rate limit between consecutive property uploads.',
          'Zero tolerance for automated scraping or bot creation.'
        ],
        bulletPointsHi: [
          'दो संपत्तियों को अपलोड करने के बीच ५ मिनट का अनिवार्य अंतराल।',
          'बॉट या स्वचालित स्क्रिप्ट के उपयोग पर पूर्ण प्रतिबंध।'
        ]
      }
    ]
  },

  seller_agreement: {
    id: 'seller_agreement',
    titleEn: 'User / Seller Agreement',
    titleHi: 'उपयोगकर्ता एवं विक्रेता अनुबंध (User / Seller Agreement)',
    subtitleEn: 'Contractual terms governing property owners, sellers, and buyers interacting on the platform.',
    subtitleHi: 'मंच पर संपत्ति सूचीबद्ध करने वाले स्वामियों व खरीदारों के बीच पारस्परिक नियम व शर्तें।',
    iconName: 'Handshake',
    badgeEn: 'Direct Seller Terms',
    badgeHi: 'प्रत्यक्ष विक्रेता अनुबंध',
    lastUpdated: 'Updated October 2026',
    sections: [
      {
        titleEn: '1. Seller Representations, Warranties & Authority',
        titleHi: '१. विक्रेता के विधिक प्रतिज्ञान एवं प्राधिकार',
        contentEn: 'By publishing a listing on Uttarakhand Gateways, the Seller explicitly represents and warrants that: (a) The seller is the sole lawful owner or is duly authorized by power of attorney to negotiate and convey marketable title; (b) The property is free of undisclosed mortgages, bank hypothecations, tax liens, or government attachment; (c) The property does not violate the Uttarakhand Land Ceiling limits.',
        contentHi: 'उत्तराखंड गेटवेज पर अपनी संपत्ति लिस्ट करके विक्रेता यह प्रमाणित व प्रतिज्ञान करता है कि: (क) वह संपत्ति का एकमात्र विधिक स्वामी है अथवा अधिकृत प्रतिनिधि है; (ख) संपत्ति किसी अघोषित बैंक बंधक, सरकारी कुर्की अथवा टैक्स देनदारी से मुक्त है; (ग) संपत्ति उत्तराखंड भू-सीमा नियमों का उल्लंघन नहीं करती है।',
        bulletPointsEn: [
          'Warranty of clear and marketable title.',
          'True disclosure of encumbrances, water/electricity connections, and pathway access.',
          'Seller agrees to provide certified copies of title deeds upon mutual earnest agreement.'
        ],
        bulletPointsHi: [
          'भार-मुक्त और वैध मालिकाना हक का विधिक प्रतिज्ञान।',
          'रास्ता, पानी, बिजली व भार का सत्य विवरण देना अनिवार्य।',
          'बयाना समझौते के समय मूल दस्तावेजों की सत्यापित प्रति उपलब्ध कराने की सहमति।'
        ]
      },
      {
        titleEn: '2. 0% Brokerage & Exemption from Broker-Dealer Liabilities',
        titleHi: '२. ०% ब्रोकरेज एवं मध्यस्थ दायित्वों से मुक्ति',
        contentEn: 'The seller understands and agrees that Uttarakhand Gateways charges zero listing fee and zero success brokerage. In return, the seller acknowledges that Uttarakhand Gateways does not guarantee transaction completion, solvency of prospective buyers, or the realization of the full asking price. All negotiation, earnest token money (Bayana), and registration charges are strictly private matters between the contracting individuals.',
        contentHi: 'विक्रेता यह स्वीकार करता है कि उत्तराखंड गेटवेज कोई लिस्टिंग शुल्क या कमीशन नहीं लेता। इसके बदले विक्रेता यह मानता है कि मंच किसी सौदे के पूरा होने अथवा खरीदार की वित्तीय क्षमता की कोई गारंटी नहीं देता। बयाना, बातचीत व रजिस्ट्री का खर्च पूरी तरह खरीदार व विक्रेता का निजी विषय है।',
        bulletPointsEn: [
          'No fees charged by Uttarakhand Gateways to list properties.',
          'Platform is not party to private bilateral deed negotiations.',
          'Payment security must be independently ensured through verified bank drafts or escrow.'
        ],
        bulletPointsHi: [
          'मंच पर संपत्ति लिस्ट करने हेतु कोई शुल्क नहीं लिया जाता।',
          'मंच निजी सौदों अथवा रजिस्ट्री का कोई पक्षकार नहीं है।',
          'भुगतान की सुरक्षा हेतु बैंक ड्राफ्ट अथवा आरटीजीएस का ही उपयोग करें।'
        ]
      },
      {
        titleEn: '3. Obligation to Update Listing Status ("Mark Sold")',
        titleHi: '३. संपत्ति स्थिति अद्यतन करने का दायित्व ("बिक चुकी मार्क करें")',
        contentEn: 'To preserve marketplace integrity and avoid misleading interested mountain property seekers, the Seller agrees to promptly update the listing status to "Mark Sold" or delete the property from the platform within forty-eight (48) hours of accepting earnest money or executing a registered conveyance deed.',
        contentHi: 'मार्केटप्लेस की विश्वसनीयता बनाए रखने हेतु, यदि संपत्ति का सौदा तय हो जाता है या बयाना स्वीकार कर लिया जाता है, तो विक्रेता का दायित्व है कि वह ४८ घंटे के भीतर लिस्टिंग को "बिक चुकी है (Sold Out)" मार्क करे अथवा लिस्टिंग डिलीट करे।',
        bulletPointsEn: [
          'One-click "Mark Sold / Available" toggle accessible directly on property cards by the owner.',
          'Maintains updated, authentic inventory across Uttarakhand destinations.'
        ],
        bulletPointsHi: [
          'मालिक द्वारा प्रॉपर्टी कार्ड पर "बिक चुका मार्क करें" का सुविधाजनक विकल्प।',
          'ताकि खरीदारों को हमेशा वास्तविक व उपलब्ध संपत्तियां ही दिखाई दें।'
        ]
      },
      {
        titleEn: '4. Indemnification of Uttarakhand Gateways',
        titleHi: '४. क्षतिपूर्ति का अनुबंध (Indemnity)',
        contentEn: 'The Seller agrees to defend, indemnify, and hold harmless Uttarakhand Gateways, its founders, affiliates, and representatives from and against any claims, losses, liabilities, government penalties, or legal fees arising from fraudulent documentation, unauthorized property listings, encroachment on public land, or breach of these representations.',
        contentHi: 'विक्रेता किसी भी गलत दस्तावेज, विवादित भूमि, अतिक्रमण अथवा शर्तों के उल्लंघन से उत्पन्न होने वाले किसी भी अदालती वाद, जुर्माने या क्षति के विरुद्ध उत्तराखंड गेटवेज और इसके संचालकों को पूरी तरह क्षतिपूर्ति करने के लिए सहमत है।',
        bulletPointsEn: [
          'Seller assumes total legal responsibility for listing claims.',
          'Platform reserves the right to share verified ownership metadata with law enforcement in the event of criminal fraud.'
        ],
        bulletPointsHi: [
          'प्रॉपर्टी के सभी दावों के लिए विक्रेता पूर्णतः कानूनी रूप से जिम्मेदार है।',
          'धोखाधड़ी की स्थिति में पुलिस व कानूनी जांच एजेंसियों को विवरण सौंपने का अधिकार सुरक्षित है।'
        ]
      }
    ]
  }
};
