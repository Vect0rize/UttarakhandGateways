export type LegalPolicyId =
  | 'terms'
  | 'privacy'
  | 'cookie'
  | 'disclaimer'
  | 'grievance'
  | 'listing_policy'
  | 'seller_agreement';

export interface PolicySection {
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  bulletsEn?: string[];
  bulletsHi?: string[];
}

export interface LegalPolicy {
  id: LegalPolicyId;
  shortTitleEn: string;
  shortTitleHi: string;
  fullTitleEn: string;
  fullTitleHi: string;
  lastUpdatedEn: string;
  lastUpdatedHi: string;
  badgeEn: string;
  badgeHi: string;
  summaryEn: string;
  summaryHi: string;
  sections: PolicySection[];
}

/**
 * Points flagged for review and confirmation by a qualified Indian lawyer before final publication.
 * No company registration numbers, physical postal addresses, or numerical liability caps have been invented.
 */
export const LAWYER_CONFIRMATION_NOTES: Array<{
  topicEn: string;
  topicHi: string;
  detailEn: string;
  detailHi: string;
}> = [
  {
    topicEn: 'Legal Entity Identity & Registered Postal Address',
    topicHi: 'विधिक इकाई की पहचान एवं पंजीकृत डाक पता',
    detailEn:
      'Confirm the exact legal operating name (proprietorship, partnership, LLP, or company) and official postal address to be displayed for statutory notices.',
    detailHi:
      'वैधानिक नोटिसों के लिए प्रदर्शित किए जाने वाले सटीक विधिक नाम (प्रोप्राइटरशिप, पार्टनरशिप, एलएलपी या कंपनी) और आधिकारिक डाक पते की पुष्टि करें।',
  },
  {
    topicEn: 'Designated Grievance Officer & Data Protection Contact',
    topicHi: 'नामित शिकायत अधिकारी एवं डेटा संरक्षण संपर्क',
    detailEn:
      'Confirm the full name and contact details of the designated Grievance Officer required under Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Digital Personal Data Protection Act, 2023.',
    detailHi:
      'सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश) नियम, 2021 के नियम 3(2) और डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत नामित शिकायत अधिकारी के पूरे नाम और संपर्क विवरण की पुष्टि करें।',
  },
  {
    topicEn: 'Dispute Resolution & Exclusive Court Jurisdiction',
    topicHi: 'विवाद समाधान एवं न्यायालय का क्षेत्राधिकार',
    detailEn:
      'Confirm the preferred court city/district in Uttarakhand for governing law and jurisdiction clauses, subject to statutory consumer forum protections under the Consumer Protection Act, 2019.',
    detailHi:
      'उपभोक्ता संरक्षण अधिनियम, 2019 के वैधानिक प्रावधानों के अधीन उत्तराखंड में उपयुक्त न्यायालय के शहर/जिले की पुष्टि करें।',
  },
  {
    topicEn: 'RERA Applicability Assessment',
    topicHi: 'रेरा (RERA) प्रयोज्यता मूल्यांकन',
    detailEn:
      'Confirm with counsel that operating strictly as an online advertising/discovery portal with No Platform Fee and without negotiating, brokering, or facilitating real estate transactions does not trigger real estate agent registration under the Real Estate (Regulation and Development) Act, 2016, and confirm rules for project advertisements posted by builders or brokers.',
    detailHi:
      'वकील से पुष्टि करें कि बिना किसी प्लेटफॉर्म शुल्क और बिना किसी लेनदेन या मध्यस्थता के केवल ऑनलाइन विज्ञापन/डिस्कवरी मंच के रूप में कार्य करने पर रेरा अधिनियम, 2016 की आवश्यकताओं की स्थिति क्या है, और बिल्डरों/ब्रोकरों द्वारा प्रोजेक्ट विज्ञापनों के नियमों की समीक्षा करें।',
  },
];

export const LEGAL_POLICIES: Record<LegalPolicyId, LegalPolicy> = {
  terms: {
    id: 'terms',
    shortTitleEn: 'Terms & Conditions',
    shortTitleHi: 'नियम एवं शर्तें',
    fullTitleEn: 'Terms & Conditions of Use',
    fullTitleHi: 'उपयोग के नियम एवं शर्तें',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'Platform Terms',
    badgeHi: 'प्लेटफॉर्म शर्तें',
    summaryEn:
      'Plain-language rules governing your access to and use of Uttarakhand Gateways (uttarakhandgateways.com) as a property listing and discovery platform.',
    summaryHi:
      'प्रॉपर्टी लिस्टिंग और डिस्कवरी प्लेटफॉर्म के रूप में उत्तराखंड गेटवेज (uttarakhandgateways.com) के उपयोग के सरल और स्पष्ट नियम।',
    sections: [
      {
        titleEn: '1. Nature of the Platform',
        titleHi: '1. प्लेटफॉर्म की प्रकृति',
        contentEn:
          'Uttarakhand Gateways ("UKG", accessible at uttarakhandgateways.com) is an online property listing and discovery platform. UKG provides an online space where property owners, listers, and interested buyers or tenants can publish property advertisements and connect directly with one another. By browsing or creating an account on UKG, you agree to follow these Terms & Conditions.',
        contentHi:
          'उत्तराखंड गेटवेज ("UKG", वेबसाइट: uttarakhandgateways.com) एक ऑनलाइन प्रॉपर्टी लिस्टिंग और डिस्कवरी प्लेटफॉर्म है। UKG एक ऐसा ऑनलाइन माध्यम प्रदान करता है जहाँ संपत्ति मालिक, लिस्टिंगकर्ता और इच्छुक खरीदार या किरायेदार संपत्ति विज्ञापन प्रकाशित कर सकते हैं और एक-दूसरे से सीधे जुड़ सकते हैं। इस वेबसाइट का उपयोग करके आप इन नियमों एवं शर्तों से सहमत होते हैं।',
      },
      {
        titleEn: '2. What UKG Does Not Do',
        titleHi: '2. UKG क्या नहीं करता है',
        contentEn:
          'UKG operates solely as an online intermediary under applicable Indian law, including Section 79 of the Information Technology Act, 2000. Users must clearly understand the limits of our role:',
        contentHi:
          'UKG लागू भारतीय कानूनों (सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 79 सहित) के तहत केवल एक ऑनलाइन मध्यवर्ती मंच के रूप में कार्य करता है। उपयोगकर्ताओं को हमारी भूमिका की सीमाएं स्पष्ट रूप से समझनी चाहिए:',
        bulletsEn: [
          'UKG does not own, develop, sell, purchase, rent, lease, manage, inspect, or independently verify any listed property.',
          'UKG does not act as a real estate agent, property broker, legal adviser, tax consultant, valuer, or financial adviser.',
          'All property descriptions, photographs, videos, prices, land measurements, ownership claims, and documents are uploaded by the respective listers.',
          'UKG does not participate in site visits, price negotiations, token payments, agreements, sale deeds, lease deeds, or property handovers between users.',
        ],
        bulletsHi: [
          'UKG किसी भी सूचीबद्ध संपत्ति का मालिक नहीं है और न ही उसे बेचता, खरीदता, किराये पर देता, निरीक्षण करता या स्वतंत्र रूप से सत्यापित करता है।',
          'UKG रियल एस्टेट एजेंट, प्रॉपर्टी ब्रोकर, कानूनी सलाहकार या वित्तीय सलाहकार के रूप में कार्य नहीं करता है।',
          'संपत्ति का सभी विवरण, तस्वीरें, वीडियो, कीमतें, भूमि माप, स्वामित्व दावे और दस्तावेज संबंधित लिस्टिंगकर्ता द्वारा प्रदान किए जाते हैं।',
          'UKG उपयोगकर्ताओं के बीच साइट विजिट, मूल्य बातचीत, बयाना/भुगतान, अनुबंध या रजिस्ट्री प्रक्रिया में भाग नहीं लेता है।',
        ],
      },
      {
        titleEn: '3. Platform Fee Policy (No Platform Fee)',
        titleHi: '3. प्लेटफॉर्म शुल्क नीति (कोई प्लेटफॉर्म शुल्क नहीं)',
        contentEn:
          'UKG currently operates on a NO PLATFORM FEE basis for browsing listings, contacting listers, and posting standard property listings. UKG does not charge brokerage, commission, or transaction fees on any sale or rental arranged between users. Please note that if a listing is posted by a third-party broker or agent rather than a direct owner, that lister may have their own separate terms, which you must clarify directly with them before proceeding. If UKG introduces optional paid features in the future, clear pricing and terms will be communicated in advance before any charge applies.',
        contentHi:
          'UKG वर्तमान में प्रॉपर्टी देखने, लिस्टिंगकर्ता से संपर्क करने और सामान्य प्रॉपर्टी विज्ञापन पोस्ट करने के लिए "कोई प्लेटफॉर्म शुल्क नहीं" (NO PLATFORM FEE) नीति पर काम करता है। UKG उपयोगकर्ताओं के बीच होने वाली किसी भी बिक्री या किराये पर कोई ब्रोकरेज या कमीशन नहीं लेता है। यदि कोई लिस्टिंग किसी बाहरी ब्रोकर या एजेंट द्वारा पोस्ट की गई है, तो उनकी शर्तें आप सीधे उनसे स्पष्ट करें। भविष्य में यदि कोई वैकल्पिक सशुल्क सुविधा शुरू की जाती है, तो उसकी स्पष्ट जानकारी पहले से दी जाएगी।',
      },
      {
        titleEn: '4. User Accounts & Responsibilities',
        titleHi: '4. उपयोगकर्ता खाता एवं जिम्मेदारियां',
        contentEn:
          'Browsing properties, viewing public contact details, and saving properties locally in your browser do not require an account. Creating an account is required to post or manage property listings and use account-specific features. When using an account, you agree to:',
        contentHi:
          'संपत्तियां ब्राउज़ करने, सार्वजनिक संपर्क नंबर देखने और ब्राउज़र में प्रॉपर्टी सेव करने के लिए लॉगिन आवश्यक नहीं है। प्रॉपर्टी विज्ञापन पोस्ट करने या प्रबंधित करने के लिए खाता बनाना आवश्यक है। खाता उपयोग करते समय आप सहमत हैं कि:',
        bulletsEn: [
          'Provide truthful, accurate, and current personal and contact information.',
          'Keep your login credentials confidential and notify us promptly if you suspect unauthorized access to your account.',
          'Only list properties that you own or have clear, verifiable authorization from the lawful owner to advertise.',
          'Accept that any phone number you submit in a property listing form will be displayed publicly on that listing so interested buyers or tenants can call or message you via WhatsApp.',
        ],
        bulletsHi: [
          'आप सही, वास्तविक और अद्यतन व्यक्तिगत व संपर्क जानकारी प्रदान करेंगे।',
          'अपने लॉगिन विवरण को सुरक्षित रखेंगे और अनधिकृत उपयोग की आशंका होने पर तुरंत हमें सूचित करेंगे।',
          'केवल उन्हीं संपत्तियों को लिस्ट करेंगे जिनका स्वामित्व आपके पास है या जिनके मालिक से आपको विज्ञापन देने की स्पष्ट अनुमति प्राप्त है।',
          'प्रॉपर्टी लिस्टिंग फॉर्म में दिया गया आपका फोन नंबर विज्ञापन पर सार्वजनिक रूप से प्रदर्शित होगा ताकि इच्छुक खरीदार या किरायेदार आपको कॉल या व्हाट्सएप कर सकें।',
        ],
      },
      {
        titleEn: '5. Prohibited Content & Conduct',
        titleHi: '5. प्रतिबंधित सामग्री एवं आचरण',
        contentEn:
          'Users must not upload, publish, or transmit any listing, image, document, or message that:',
        contentHi:
          'उपयोगकर्ता ऐसी कोई भी लिस्टिंग, फोटो, दस्तावेज या संदेश अपलोड या साझा नहीं करेंगे जो:',
        bulletsEn: [
          'Is false, misleading, deceptive, impersonating another person, or fraudulent.',
          'Advertises government land, forest land, encroached property, disputed property without disclosure, or property prohibited from transfer under applicable Uttarakhand or Indian laws.',
          'Infringes another person’s copyright, trademark, privacy, or legal rights (such as stolen photographs or unauthorized personal phone numbers).',
          'Contains malware, executable scripts, spam, abusive language, obscene material, or unlawful content.',
          'Attempts to scrape data, disrupt website operations, or bypass security or upload restrictions.',
        ],
        bulletsHi: [
          'झूठी, भ्रामक, धोखाधड़ीपूर्ण हो या किसी अन्य व्यक्ति की पहचान का दुरुपयोग करती हो।',
          'सरकारी भूमि, वन भूमि, अतिक्रमित भूमि या कानून द्वारा हस्तांतरण हेतु प्रतिबंधित संपत्ति का विज्ञापन करती हो।',
          'किसी अन्य व्यक्ति के कॉपीराइट, गोपनीयता या कानूनी अधिकारों का उल्लंघन करती हो (जैसे बिना अनुमति की तस्वीरें या किसी अन्य व्यक्ति का फोन नंबर)।',
          'मैलवेयर, खतरनाक फाइलें, स्पैम, अपमानजनक भाषा या गैरकानूनी सामग्री शामिल करती हो।',
          'वेबसाइट की सुरक्षा, सर्वर या अपलोड सीमाओं को बाधित करने का प्रयास करती हो।',
        ],
      },
      {
        titleEn: '6. Listing Removal & Account Suspension',
        titleHi: '6. लिस्टिंग हटाना एवं खाता निलंबन',
        contentEn:
          'UKG reserves the right to review, hide, reject, edit formatting of, or remove any property listing, and to suspend or terminate any user account if we receive a valid complaint, legal notice, or have reasonable grounds to believe that the user or listing violates these Terms, applicable law, or platform integrity. Removal of a listing or suspension of an account does not imply that UKG pre-screens or endorses remaining listings.',
        contentHi:
          'वैध शिकायत, कानूनी नोटिस मिलने पर या इन शर्तों व लागू कानूनों के उल्लंघन का उचित आधार होने पर UKG किसी भी प्रॉपर्टी लिस्टिंग को छुपाने, अस्वीकार करने या हटाने तथा संबंधित उपयोगकर्ता खाते को निलंबित या समाप्त करने का अधिकार रखता है। किसी लिस्टिंग पर कार्रवाई करने का यह अर्थ नहीं है कि UKG शेष लिस्टिंग्स को प्रमाणित या सत्यापित करता है।',
      },
      {
        titleEn: '7. Independent Verification & Responsibility for Transactions',
        titleHi: '7. स्वतंत्र सत्यापन एवं लेनदेन की जिम्मेदारी',
        contentEn:
          'UKG does not guarantee the accuracy, authenticity, availability, legality, physical condition, or completion of sale or rental of any listed property. Before paying any advance, token amount, rent, or purchase consideration, or signing any document, you are solely responsible for conducting thorough independent due diligence—including inspecting the physical property, checking original title deeds, revenue records (such as Khatauni, Khasra, mutation status, and non-agricultural conversion permissions), encumbrance certificates, building approvals, RERA registration where applicable, and consulting an independent lawyer. UKG is not a party to and is not responsible for agreements, negotiations, payments, disputes, losses, or fraud between users, to the extent permitted under applicable Indian law.',
        contentHi:
          'UKG किसी भी सूचीबद्ध संपत्ति की सटीकता, प्रामाणिकता, उपलब्धता, वैधता, स्थिति या बिक्री/किराये के पूरा होने की कोई गारंटी नहीं देता है। किसी भी प्रकार का भुगतान करने या समझौते पर हस्ताक्षर करने से पहले, भौतिक संपत्ति का निरीक्षण करना, मूल स्वामित्व दस्तावेज, राजस्व रिकॉर्ड (खतौनी, खसरा, दाखिल-खारिज, गैर-कृषि अनुमति आदि), भार-मुक्त प्रमाणपत्र, नक्शा स्वीकृति एवं लागू रेरा विवरण की स्वतंत्र वकील के माध्यम से जांच करना पूरी तरह से उपयोगकर्ता की अपनी जिम्मेदारी है। लागू भारतीय कानून के अधीन, उपयोगकर्ताओं के बीच होने वाले समझौतों, भुगतानों, विवादों, नुकसान या धोखाधड़ी के लिए UKG उत्तरदायी नहीं है।',
      },
      {
        titleEn: '8. Informational Calculators & Guides',
        titleHi: '8. सूचनात्मक कैलकुलेटर एवं गाइड',
        contentEn:
          'Tools such as the EMI Calculator, Land Area Converter, and educational articles on UKG are provided strictly for general informational convenience. They do not constitute legal, revenue, surveying, or financial advice, and UKG does not provide or arrange loans or financial products.',
        contentHi:
          'UKG पर उपलब्ध ईएमआई कैलकुलेटर, भूमि माप कन्वर्टर और मार्गदर्शिका लेख केवल सामान्य जानकारी के लिए हैं। ये कानूनी, राजस्व, सर्वेक्षण या वित्तीय सलाह नहीं हैं, और UKG किसी भी प्रकार का ऋण या वित्तीय सेवा प्रदान नहीं करता है।',
      },
      {
        titleEn: '9. Governing Law & Changes to Terms',
        titleHi: '9. लागू कानून एवं शर्तों में परिवर्तन',
        contentEn:
          'These Terms are governed by the laws of India, including the Information Technology Act, 2000, the Consumer Protection Act, 2019, and the Indian Contract Act, 1872. Nothing in these Terms limits any statutory rights that cannot lawfully be excluded under applicable Indian law. UKG may update these Terms periodically to reflect legal or operational changes, and the updated version will be posted on this page with its revision date.',
        contentHi:
          'ये शर्तें भारत के कानूनों (सूचना प्रौद्योगिकी अधिनियम, 2000, उपभोक्ता संरक्षण अधिनियम, 2019 और भारतीय संविदा अधिनियम, 1872 सहित) द्वारा शासित हैं। इन शर्तों में कुछ भी उन वैधानिक अधिकारों को सीमित नहीं करता जिन्हें भारतीय कानून के तहत समाप्त नहीं किया जा सकता। कानूनी या परिचालन परिवर्तनों के अनुसार UKG समय-समय पर इन शर्तों को अपडेट कर सकता है।',
      },
    ],
  },

  privacy: {
    id: 'privacy',
    shortTitleEn: 'Privacy Policy',
    shortTitleHi: 'गोपनीयता नीति',
    fullTitleEn: 'Privacy Policy',
    fullTitleHi: 'गोपनीयता नीति (Privacy Policy)',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'Data Protection',
    badgeHi: 'डेटा सुरक्षा',
    summaryEn:
      'Clear explanation of what personal information UKG collects, how it is used, stored, and shared, and why lister phone numbers are displayed publicly on property listings.',
    summaryHi:
      'UKG कौन सी व्यक्तिगत जानकारी एकत्र करता है, उसका उपयोग, भंडारण और साझाकरण कैसे होता है, तथा लिस्टिंग पर फोन नंबर सार्वजनिक क्यों दिखते हैं—इसकी स्पष्ट जानकारी।',
    sections: [
      {
        titleEn: '1. Information We Collect',
        titleHi: '1. हम कौन सी जानकारी एकत्र करते हैं',
        contentEn:
          'We collect only the information reasonably necessary to operate Uttarakhand Gateways in accordance with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000:',
        contentHi:
          'हम डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 और सूचना प्रौद्योगिकी अधिनियम, 2000 के अनुरूप प्लेटफॉर्म संचालन के लिए आवश्यक जानकारी ही एकत्र करते हैं:',
        bulletsEn: [
          'Account Information: Your name, email address, encrypted password hash (if registering with password), or basic profile details received when you sign in using Google.',
          'Property Listing Information: Property details, location, pricing, photographs, videos, documents, lister name, and the contact phone number you submit when posting a listing.',
          'Communications & Reports: Messages sent through platform tools, abuse reports, or support/grievance emails sent to us.',
          'Technical & Browser Data: IP address, browser/device type, session cookies, and browser local storage items (such as saved/bookmarked properties, theme, and language preferences) used for security, duplicate-view protection, and site functionality.',
        ],
        bulletsHi: [
          'खाता जानकारी: आपका नाम, ईमेल पता, सुरक्षित रूप से हैश किया गया पासवर्ड, या Google लॉगिन चुनने पर प्राप्त बुनियादी प्रोफ़ाइल विवरण।',
          'प्रॉपर्टी लिस्टिंग जानकारी: प्रॉपर्टी का विवरण, स्थान, मूल्य, फोटो, वीडियो, दस्तावेज, लिस्टिंगकर्ता का नाम और लिस्टिंग पोस्ट करते समय दिया गया संपर्क फोन नंबर।',
          'संदेश एवं शिकायतें: प्लेटफॉर्म के माध्यम से भेजे गए संदेश, रिपोर्ट की गई लिस्टिंग्स या सहायता ईमेल।',
          'तकनीकी एवं ब्राउज़र डेटा: सुरक्षा, डुप्लीकेट-व्यू रोकथाम और वेबसाइट की कार्यक्षमता (जैसे सेव की गई प्रॉपर्टीज और भाषा/थीम पसंद) के लिए आईपी पता, डिवाइस प्रकार, सेशन कुकीज़ और लोकल स्टोरेज।',
        ],
      },
      {
        titleEn: '2. Public Visibility of Lister Contact Numbers',
        titleHi: '2. लिस्टिंगकर्ता के फोन नंबर की सार्वजनिक दृश्यता',
        contentEn:
          'UKG is designed to enable direct communication between property listers and interested buyers or tenants without login barriers. When you submit a contact phone number on a property listing, that phone number and your lister display name are published publicly on the listing page so visitors (including guests who are not logged in) can call you directly via telephone link or contact you via WhatsApp regarding the property. Only enter a contact number that belongs to you and that you consent to make publicly visible for property inquiries. Your account login email and password are never displayed publicly.',
        contentHi:
          'UKG का उद्देश्य खरीदारों/किरायेदारों और प्रॉपर्टी लिस्टिंगकर्ताओं के बीच सीधा संवाद सुलभ बनाना है। जब आप किसी प्रॉपर्टी लिस्टिंग में अपना संपर्क फोन नंबर दर्ज करते हैं, तो वह फोन नंबर और आपका नाम उस लिस्टिंग पर सार्वजनिक रूप से प्रदर्शित होता है ताकि वेबसाइट के आगंतुक (बिना लॉगिन किए भी) प्रॉपर्टी के संबंध में आपको सीधे कॉल या व्हाट्सएप संदेश भेज सकें। कृपया केवल वही फोन नंबर दर्ज करें जो आपका अपना हो और जिसे आप प्रॉपर्टी पूछताछ हेतु सार्वजनिक करने के लिए सहमत हों। आपका लॉगिन ईमेल और पासवर्ड कभी भी सार्वजनिक नहीं किया जाता।',
      },
      {
        titleEn: '3. How We Use Your Information',
        titleHi: '3. हम आपकी जानकारी का उपयोग कैसे करते हैं',
        contentEn:
          'We use collected information strictly for legitimate platform purposes:',
        contentHi:
          'हम एकत्रित जानकारी का उपयोग केवल वैध प्लेटफॉर्म उद्देश्यों के लिए करते हैं:',
        bulletsEn: [
          'Creating and authenticating your account, including sending verification codes or password reset emails.',
          'Publishing, displaying, updating, and managing property listings you submit.',
          'Enabling interested buyers and tenants to contact property listers directly via phone, WhatsApp, or platform messaging.',
          'Optimizing uploaded property photographs for web performance, enforcing upload limits, preventing spam or fraud, and maintaining platform security.',
          'Responding to support queries, abuse reports, grievances, and lawful requests from government or judicial authorities.',
        ],
        bulletsHi: [
          'आपका खाता बनाने, सत्यापित करने और ओटीपी/पासवर्ड रीसेट ईमेल भेजने के लिए।',
          'आपके द्वारा सबमिट की गई प्रॉपर्टी लिस्टिंग को प्रकाशित और प्रबंधित करने के लिए।',
          'इच्छुक खरीदारों और किरायेदारों को फोन, व्हाट्सएप या संदेश के माध्यम से सीधे संपर्क करने में सक्षम बनाने के लिए।',
          'अपलोड की गई तस्वीरों को वेब प्रदर्शन के लिए अनुकूलित करने, स्पैम/धोखाधड़ी रोकने और सुरक्षा बनाए रखने के लिए।',
          'सहायता प्रश्नों, शिकायतों और सरकारी/न्यायिक प्राधिकरणों के वैध अनुरोधों का जवाब देने के लिए।',
        ],
      },
      {
        titleEn: '4. Storage, Security & Retention',
        titleHi: '4. डेटा भंडारण, सुरक्षा एवं प्रतिधारण',
        contentEn:
          'Passwords are stored using cryptographic hashing (bcrypt), authenticated sessions use signed HTTP-only cookies/tokens, and uploaded files are validated before storage. While we implement reasonable technical and organizational security safeguards, no internet transmission or electronic storage system can be guaranteed to be completely immune from risk. We retain account and listing data for as long as your account or listing remains active, and thereafter only as required to resolve disputes, prevent fraud, or comply with statutory record-keeping obligations under Indian law.',
        contentHi:
          'पासवर्ड क्रिप्टोग्राफ़िक हैशिंग (bcrypt) के साथ सुरक्षित रखे जाते हैं, सेशन के लिए सुरक्षित टोकन/कुकीज़ का उपयोग होता है, और अपलोड फाइलों की जांच की जाती है। यद्यपि हम उचित तकनीकी सुरक्षा उपाय अपनाते हैं, फिर भी इंटरनेट पर किसी भी प्रणाली के पूर्णतः जोखिम-मुक्त होने की गारंटी नहीं दी जा सकती। आपका डेटा तब तक रखा जाता है जब तक आपका खाता या लिस्टिंग सक्रिय है, और उसके बाद केवल भारतीय कानून के तहत आवश्यक वैधानिक अवधि या विवाद निवारण हेतु रखा जाता है।',
      },
      {
        titleEn: '5. Information Sharing',
        titleHi: '5. जानकारी साझा करना',
        contentEn:
          'UKG does not sell or rent users’ personal data to data brokers or third-party telemarketers. Information is shared only in the following circumstances:',
        contentHi:
          'UKG उपयोगकर्ताओं का व्यक्तिगत डेटा किसी डेटा ब्रोकर या टेलीमार्केटर को बेचता या किराये पर नहीं देता है। जानकारी केवल निम्न परिस्थितियों में साझा होती है:',
        bulletsEn: [
          'Public Listing Display: Property details, lister name, and lister phone number voluntarily submitted for a published listing are visible to website visitors.',
          'Infrastructure & Authentication Providers: Essential technical providers used to host the platform, deliver transactional emails, or verify Google Sign-In tokens when you choose Google login.',
          'Legal Compliance: When required under applicable Indian law, court order, or lawful request by authorized law enforcement or government agencies.',
        ],
        bulletsHi: [
          'सार्वजनिक लिस्टिंग प्रदर्शन: प्रकाशित प्रॉपर्टी विज्ञापन में स्वेच्छा से दिया गया विवरण, नाम और फोन नंबर आगंतुकों को दिखाई देता है।',
          'तकनीकी सेवा प्रदाता: होस्टिंग, ट्रांजेक्शनल ईमेल या Google साइन-इन सत्यापन के लिए आवश्यक तकनीकी सेवाएं।',
          'कानूनी अनुपालन: भारतीय कानून, न्यायालय के आदेश या अधिकृत सरकारी एजेंसियों के वैध अनुरोध पर।',
        ],
      },
      {
        titleEn: '6. Your Rights & Choices',
        titleHi: '6. आपके अधिकार एवं विकल्प',
        contentEn:
          'You may edit or delete your property listings at any time from your account, update your profile details, clear locally bookmarked properties in your browser, or delete your account. When you delete a listing, its public contact details are removed from our active catalog (note that external search engines may take time to refresh cached pages). For privacy requests or data-related grievances, write to ukg@uttarakhandgateways.com.',
        contentHi:
          'आप किसी भी समय अपने खाते से अपनी प्रॉपर्टी लिस्टिंग को संपादित या हटा सकते हैं, प्रोफ़ाइल अपडेट कर सकते हैं, ब्राउज़र के सेव किए गए बुकमार्क साफ कर सकते हैं, या अपना खाता हटा सकते हैं। लिस्टिंग हटाने पर आपका संपर्क नंबर सक्रिय वेबसाइट सूची से हट जाता है। गोपनीयता संबंधी प्रश्नों या अनुरोधों के लिए ukg@uttarakhandgateways.com पर संपर्क करें।',
      },
    ],
  },

  cookie: {
    id: 'cookie',
    shortTitleEn: 'Cookie Policy',
    shortTitleHi: 'कुकी नीति',
    fullTitleEn: 'Cookie & Browser Storage Policy',
    fullTitleHi: 'कुकी एवं ब्राउज़र स्टोरेज नीति',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'Browser Storage',
    badgeHi: 'ब्राउज़र स्टोरेज',
    summaryEn:
      'How UKG uses essential cookies and browser local storage for login sessions, guest property bookmarks, and display preferences.',
    summaryHi:
      'लॉगिन सेशन, बिना लॉगिन प्रॉपर्टी बुकमार्क और भाषा/थीम सेटिंग्स के लिए कुकीज़ और लोकल स्टोरेज के उपयोग की जानकारी।',
    sections: [
      {
        titleEn: '1. Essential Session Cookies',
        titleHi: '1. आवश्यक सेशन कुकीज़',
        contentEn:
          'When you sign in to post or manage listings, UKG uses a secure HTTP-only session cookie (ukg_session) to keep your session authenticated and protect your account from unauthorized requests.',
        contentHi:
          'जब आप लिस्टिंग पोस्ट या प्रबंधित करने के लिए लॉगिन करते हैं, तो UKG आपके खाते को सुरक्षित रखने के लिए HTTP-only सेशन कुकी (ukg_session) का उपयोग करता है।',
      },
      {
        titleEn: '2. Browser Local Storage (Including Guest Bookmarks)',
        titleHi: '2. ब्राउज़र लोकल स्टोरेज (गेस्ट बुकमार्क सहित)',
        contentEn:
          'To let visitors use the website comfortably without forced login popups, UKG stores lightweight preferences in your browser’s localStorage:',
        contentHi:
          'बिना लॉगिन के सहज अनुभव देने के लिए UKG आपके ब्राउज़र के localStorage में निम्न प्राथमिकताएं सहेजता है:',
        bulletsEn: [
          'Saved / Bookmarked Properties: Guest users can bookmark properties directly in their browser, and those saved listings remain preserved across pages and may be retained when signing in.',
          'Interface Preferences: Selected language (English / Hindi) and light/dark display theme.',
          'Duplicate-View Protection: A random non-personal browser identifier used solely so repeated page refreshes do not artificially inflate property view counts.',
        ],
        bulletsHi: [
          'सेव की गई प्रॉपर्टीज (Bookmarks): बिना लॉगिन वाले उपयोगकर्ता अपने ब्राउज़र में प्रॉपर्टी सेव कर सकते हैं, जो पेज बदलने पर भी सुरक्षित रहती हैं।',
          'इंटरफ़ेस प्राथमिकताएं: चुनी गई भाषा (अंग्रेजी / हिंदी) और लाइट/डार्क थीम।',
          'व्यू-काउंट सुरक्षा: एक यादृच्छिक गैर-व्यक्तिगत आईडी ताकि बार-बार रिफ्रेश करने पर प्रॉपर्टी व्यू की संख्या कृत्रिम रूप से न बढ़े।',
        ],
      },
      {
        titleEn: '3. Managing Cookies & Local Storage',
        titleHi: '3. कुकीज़ और स्टोरेज का प्रबंधन',
        contentEn:
          'UKG does not use third-party behavioral ad-tracking cookies. You can clear cookies and local storage at any time through your browser settings; however, clearing them will sign you out of active sessions and clear locally saved guest bookmarks.',
        contentHi:
          'UKG तृतीय-पक्ष विज्ञापन ट्रैकिंग कुकीज़ का उपयोग नहीं करता है। आप अपने ब्राउज़र सेटिंग्स से कभी भी कुकीज़ और लोकल स्टोरेज साफ कर सकते हैं; ऐसा करने पर सक्रिय लॉगिन सेशन और ब्राउज़र में सेव किए गए गेस्ट बुकमार्क हट जाएंगे।',
      },
    ],
  },

  disclaimer: {
    id: 'disclaimer',
    shortTitleEn: 'Disclaimer',
    shortTitleHi: 'अस्वीकरण (Disclaimer)',
    fullTitleEn: 'Platform, Property & Legal Disclaimer',
    fullTitleHi: 'प्लेटफॉर्म, प्रॉपर्टी एवं विधिक अस्वीकरण',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'Important Notice',
    badgeHi: 'महत्वपूर्ण सूचना',
    summaryEn:
      'Important notice clarifying that UKG does not verify properties, act as a broker or adviser, or participate in real estate or financial transactions.',
    summaryHi:
      'यह स्पष्ट करने वाली महत्वपूर्ण सूचना कि UKG संपत्तियों का सत्यापन नहीं करता, ब्रोकर या सलाहकार नहीं है, और किसी लेनदेन में शामिल नहीं होता।',
    sections: [
      {
        titleEn: '1. No Verification or Endorsement of Listings',
        titleHi: '1. लिस्टिंग का कोई सत्यापन या समर्थन नहीं',
        contentEn:
          'Uttarakhand Gateways (uttarakhandgateways.com) is strictly a property listing and discovery platform. UKG does NOT own, inspect, survey, appraise, or independently verify any property listed on the platform, nor do we verify the identity, ownership title, or authority of listers. All descriptions, prices, land areas, photographs, videos, legal status claims, and contact details are supplied solely by the user who posted the listing. UKG makes no warranty or representation regarding the accuracy, completeness, authenticity, availability, legality, physical condition, or suitability of any property.',
        contentHi:
          'उत्तराखंड गेटवेज (uttarakhandgateways.com) केवल एक प्रॉपर्टी लिस्टिंग और डिस्कवरी मंच है। UKG किसी भी सूचीबद्ध संपत्ति का मालिक नहीं है और न ही उसका भौतिक निरीक्षण, सर्वेक्षण या स्वतंत्र सत्यापन करता है, और न ही लिस्टिंगकर्ता के स्वामित्व की पुष्टि करता है। सभी विवरण, कीमतें, क्षेत्रफल, फोटो और दावे संबंधित लिस्टिंगकर्ता द्वारा प्रदान किए जाते हैं। UKG किसी भी संपत्ति की सटीकता, प्रामाणिकता, उपलब्धता, वैधता या स्थिति की कोई गारंटी नहीं देता है।',
      },
      {
        titleEn: '2. Buyer & Tenant Due Diligence Mandatory',
        titleHi: '2. खरीदार एवं किरायेदार द्वारा स्वतंत्र जांच अनिवार्य',
        contentEn:
          'Real estate transactions—especially land and hill properties in Uttarakhand—involve important legal and regulatory requirements. Every prospective buyer or tenant must independently verify all facts before entering into any commitment or making any payment, including:',
        contentHi:
          'रियल एस्टेट लेनदेन—विशेषकर उत्तराखंड में भूमि और पहाड़ी संपत्तियों के मामले में—महत्वपूर्ण कानूनी जांच आवश्यक होती है। प्रत्येक खरीदार या किरायेदार को किसी भी भुगतान या समझौते से पहले स्वयं स्वतंत्र जांच करनी चाहिए, जिसमें शामिल हैं:',
        bulletsEn: [
          'Physical site inspection, boundary verification, road access, local municipal/development authority building bylaws, and environmental or forest-zone restrictions.',
          'Original ownership chain, registered sale deeds, current revenue records (Khatauni / Khasra), mutation entries, and non-encumbrance searches at the Sub-Registrar office.',
          'Applicable Uttarakhand land purchase permissions, agricultural land transfer restrictions, non-agricultural conversion orders, and RERA registration where required by law.',
          'Verification of the identity and lawful authority of the seller, landlord, power-of-attorney holder, or broker.',
        ],
        bulletsHi: [
          'संपत्ति का भौतिक निरीक्षण, सीमांकन, सड़क पहुंच, विकास प्राधिकरण के भवन नियम और वन/पर्यावरणीय क्षेत्र के प्रतिबंध।',
          'मूल रजिस्ट्री दस्तावेज, अद्यतन राजस्व रिकॉर्ड (खतौनी/खसरा), दाखिल-खारिज और सब-रजिस्ट्रार कार्यालय से भार-मुक्त प्रमाण पत्र।',
          'उत्तराखंड के लागू भूमि खरीद नियम, कृषि भूमि हस्तांतरण नियम, गैर-कृषि रूपांतरण आदेश और जहां लागू हो वहां रेरा पंजीकरण।',
          'विक्रेता, मकान मालिक, मुख्तारनामा धारक या ब्रोकर की पहचान और वैधानिक अधिकार की पुष्टि।',
        ],
      },
      {
        titleEn: '3. Not a Broker, Legal Adviser, or Financial Adviser',
        titleHi: '3. ब्रोकर, कानूनी सलाहकार या वित्तीय सलाहकार नहीं',
        contentEn:
          'UKG does not act as a real estate agent, broker, legal adviser, or financial adviser. Guides, land unit calculators, and EMI calculators on this website provide general educational estimates only. The EMI calculator does not represent any loan offer, interest rate quote, bank partnership, or financial advice. Always consult a qualified Indian advocate, licensed surveyor, and authorized financial institution before making legal or financial decisions.',
        contentHi:
          'UKG रियल एस्टेट एजेंट, ब्रोकर, कानूनी सलाहकार या वित्तीय सलाहकार नहीं है। वेबसाइट पर उपलब्ध गाइड, भूमि माप कैलकुलेटर और ईएमआई कैलकुलेटर केवल सामान्य सूचनात्मक अनुमान प्रदान करते हैं। ईएमआई कैलकुलेटर किसी ऋण प्रस्ताव, बैंक साझेदारी या वित्तीय सलाह का प्रतिनिधित्व नहीं करता है। किसी भी निर्णय से पहले योग्य भारतीय वकील, सर्वेयर और अधिकृत वित्तीय संस्थान से परामर्श लें।',
      },
      {
        titleEn: '4. User-to-User Dealings & Fraud Caution',
        titleHi: '4. उपयोगकर्ताओं के आपसी लेनदेन एवं धोखाधड़ी से सावधानी',
        contentEn:
          'All communications, site visits, negotiations, agreements, payments, and transactions take place directly between users at their own discretion and risk. Never transfer advance token money, booking fees, or deposits to unknown individuals before verifying documents and visiting the property in person. Subject to applicable Indian law, UKG is not responsible for disputes, non-performance, misrepresentation, losses, or fraud occurring between users.',
        contentHi:
          'सभी बातचीत, साइट विजिट, समझौते और भुगतान उपयोगकर्ताओं के बीच सीधे उनके अपने विवेक और जोखिम पर होते हैं। संपत्ति को स्वयं देखे बिना और मूल दस्तावेजों की जांच किए बिना किसी अनजान व्यक्ति को अग्रिम राशि या टोकन मनी कभी न भेजें। लागू भारतीय कानून के अधीन, उपयोगकर्ताओं के बीच होने वाले विवादों, गलत बयानी, नुकसान या धोखाधड़ी के लिए UKG जिम्मेदार नहीं है।',
      },
    ],
  },

  grievance: {
    id: 'grievance',
    shortTitleEn: 'Grievance Redressal',
    shortTitleHi: 'शिकायत निवारण',
    fullTitleEn: 'Grievance Redressal & Takedown Mechanism',
    fullTitleHi: 'शिकायत निवारण एवं सामग्री हटाने की प्रक्रिया',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'IT Rules Compliance',
    badgeHi: 'आईटी नियम अनुपालन',
    summaryEn:
      'Procedure for reporting fraudulent, unauthorized, or unlawful listings, misuse of phone numbers, or privacy grievances under Indian law.',
    summaryHi:
      'भ्रामक, अनधिकृत या गैरकानूनी लिस्टिंग, फोन नंबर के दुरुपयोग या गोपनीयता संबंधी शिकायत दर्ज करने की प्रक्रिया।',
    sections: [
      {
        titleEn: '1. Reporting Fraudulent or Unauthorized Listings',
        titleHi: '1. भ्रामक या अनधिकृत लिस्टिंग की शिकायत',
        contentEn:
          'In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the Digital Personal Data Protection Act, 2023, any person may report a listing or account that:',
        contentHi:
          'सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश) नियम, 2021 और डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के अनुसार, कोई भी व्यक्ति ऐसी लिस्टिंग या खाते की शिकायत कर सकता है जो:',
        bulletsEn: [
          'Uses your property photographs, property details, or personal phone number without your permission.',
          'Contains false ownership claims, misleading pricing, spam, or suspected real estate fraud.',
          'Violates applicable Indian laws, court orders, or our Terms & Conditions.',
        ],
        bulletsHi: [
          'आपकी अनुमति के बिना आपकी संपत्ति की तस्वीरें, विवरण या आपका व्यक्तिगत फोन नंबर उपयोग करती है।',
          'झूठे स्वामित्व दावे, भ्रामक जानकारी, स्पैम या संदिग्ध धोखाधड़ी शामिल करती है।',
          'लागू भारतीय कानूनों, न्यायालय के आदेशों या हमारे नियमों एवं शर्तों का उल्लंघन करती है।',
        ],
      },
      {
        titleEn: '2. How to Submit a Grievance',
        titleHi: '2. शिकायत कैसे दर्ज करें',
        contentEn:
          'You can report a property directly using the Report option on the platform, use the complaint form below, or email our Grievance Desk with the listing URL/ID, a clear description of the issue, and supporting proof (if applicable):',
        contentHi:
          'आप प्रॉपर्टी पेज पर दिए गए रिपोर्ट विकल्प का उपयोग कर सकते हैं, नीचे दिए गए शिकायत फॉर्म को भर सकते हैं, या लिस्टिंग URL/ID और समस्या के स्पष्ट विवरण के साथ हमें ईमेल भेज सकते हैं:',
        bulletsEn: [
          'Official Grievance & Compliance Email: ukg@uttarakhandgateways.com',
          'Platform Website: https://uttarakhandgateways.com',
          'Handling Process: Valid complaints are acknowledged and acted upon within the timelines prescribed under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.',
        ],
        bulletsHi: [
          'आधिकारिक शिकायत एवं अनुपालन ईमेल: ukg@uttarakhandgateways.com',
          'वेबसाइट: https://uttarakhandgateways.com',
          'निस्तारण प्रक्रिया: वैध शिकायतों की पावती और निस्तारण सूचना प्रौद्योगिकी (मध्यवर्ती दिशानिर्देश) नियम, 2021 में निर्धारित वैधानिक समय-सीमा के अनुसार किया जाता है।',
        ],
      },
    ],
  },

  listing_policy: {
    id: 'listing_policy',
    shortTitleEn: 'Property Listing Policy',
    shortTitleHi: 'प्रॉपर्टी लिस्टिंग नीति',
    fullTitleEn: 'Property Listing & Upload Guidelines',
    fullTitleHi: 'प्रॉपर्टी लिस्टिंग एवं अपलोड दिशानिर्देश',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'Listing Rules',
    badgeHi: 'लिस्टिंग नियम',
    summaryEn:
      'Standards for property accuracy, genuine photographs, file upload rules (20 MB limit), and honest role disclosure.',
    summaryHi:
      'सही प्रॉपर्टी विवरण, वास्तविक तस्वीरें, फाइल अपलोड नियम (20 MB सीमा) और भूमिका के स्पष्ट खुलासे के मानक।',
    sections: [
      {
        titleEn: '1. Genuine Property & Role Disclosure',
        titleHi: '1. वास्तविक संपत्ति एवं भूमिका का खुलासा',
        contentEn:
          'Every property posted on UKG must represent a real, available property in Uttarakhand. Listers must accurately select whether they are posting as the Property Owner or as a Broker/Agent, and must enter accurate location, land/built-up area, and pricing.',
        contentHi:
          'UKG पर पोस्ट की गई प्रत्येक प्रॉपर्टी उत्तराखंड में उपलब्ध एक वास्तविक संपत्ति होनी चाहिए। लिस्टिंगकर्ता को सही रूप से बताना होगा कि वह संपत्ति मालिक (Owner) है या ब्रोकर/एजेंट, और सही स्थान, क्षेत्रफल व मूल्य दर्ज करना होगा।',
      },
      {
        titleEn: '2. File Uploads, Image Optimization & 20 MB Size Limit',
        titleHi: '2. फाइल अपलोड, इमेज ऑप्टिमाइजेशन एवं 20 MB सीमा',
        contentEn:
          'To keep pages fast and secure for all visitors:',
        contentHi:
          'वेबसाइट को तेज़ और सुरक्षित बनाए रखने के लिए:',
        bulletsEn: [
          'Each uploaded photograph, document, or supported media file must not exceed 20 MB per file.',
          'Only genuine photographs of the actual property or locality may be uploaded. Watermarked competitor screenshots, misleading stock renders presented as actual photos, or unlawful images are not permitted.',
          'Uploaded property images are automatically resized, orientation-corrected, and compressed into optimized web formats (such as WebP) before storage.',
          'Unsupported, corrupted, or potentially dangerous executable/script files are strictly rejected.',
        ],
        bulletsHi: [
          'प्रत्येक अपलोड की गई फोटो, दस्तावेज या समर्थित मीडिया फाइल का आकार अधिकतम 20 MB प्रति फाइल होना चाहिए।',
          'केवल वास्तविक संपत्ति की असली तस्वीरें ही अपलोड करें। भ्रामक या कॉपीराइट उल्लंघन वाली तस्वीरें प्रतिबंधित हैं।',
          'अपलोड की गई प्रॉपर्टी तस्वीरों को बेहतर वेब लोडिंग के लिए स्वतः ऑप्टिमाइज और कंप्रेस (जैसे WebP फॉर्मेट में) किया जाता है।',
          'असमर्थित या असुरक्षित/खतरनाक फाइलें स्वीकार नहीं की जाती हैं।',
        ],
      },
      {
        titleEn: '3. Duplicate, Sold, or Misleading Listings',
        titleHi: '3. डुप्लीकेट, बिक चुकी या भ्रामक लिस्टिंग',
        contentEn:
          'Listers should promptly mark sold or rented properties as unavailable or delete them so buyers and tenants do not make unnecessary calls. Repeatedly reposting identical spam listings or entering fake prices to manipulate search sorting may result in listing removal and account suspension.',
        contentHi:
          'संपत्ति बिक जाने या किराये पर उठ जाने के बाद लिस्टिंगकर्ता को तुरंत उसे अनुपलब्ध/बिका हुआ चिह्नित करना चाहिए या हटा देना चाहिए। स्पैम या गलत कीमतें डालकर खोज परिणामों को प्रभावित करने पर लिस्टिंग हटाई जा सकती है और खाता निलंबित किया जा सकता है।',
      },
    ],
  },

  seller_agreement: {
    id: 'seller_agreement',
    shortTitleEn: 'User / Seller Agreement',
    shortTitleHi: 'लिस्र्टर / विक्रेता अनुबंध',
    fullTitleEn: 'Lister & Advertiser Declaration',
    fullTitleHi: 'लिस्टिंगकर्ता एवं विज्ञापनदाता घोषणा',
    lastUpdatedEn: 'November 2026',
    lastUpdatedHi: 'नवंबर 2026',
    badgeEn: 'Lister Terms',
    badgeHi: 'लिस्र्टर शर्तें',
    summaryEn:
      'Commitments accepted by owners, landlords, and brokers when publishing a property listing on Uttarakhand Gateways.',
    summaryHi:
      'उत्तराखंड गेटवेज पर प्रॉपर्टी विज्ञापन प्रकाशित करते समय मालिकों, मकान मालिकों और ब्रोकरों द्वारा स्वीकार की जाने वाली शर्तें।',
    sections: [
      {
        titleEn: '1. Authority to Advertise & Accuracy of Claims',
        titleHi: '1. विज्ञापन का अधिकार एवं विवरण की सत्यता',
        contentEn:
          'By submitting a property listing on UKG, you confirm that you are either the lawful owner of the property or hold explicit authorization from the owner to advertise it for sale or rent. You are solely responsible for the truthfulness and legality of all statements, land records, measurements, prices, and media included in your listing.',
        contentHi:
          'UKG पर प्रॉपर्टी लिस्टिंग सबमिट करके आप पुष्टि करते हैं कि आप संपत्ति के वैध मालिक हैं या मालिक से आपको इसका विज्ञापन देने की स्पष्ट अनुमति प्राप्त है। आपकी लिस्टिंग में दिए गए सभी विवरणों, भूमि रिकॉर्ड, माप, कीमतों और मीडिया की सत्यता व वैधता की पूरी जिम्मेदारी आपकी है।',
      },
      {
        titleEn: '2. Consent to Public Contact Display',
        titleHi: '2. सार्वजनिक संपर्क प्रदर्शन हेतु सहमति',
        contentEn:
          'You expressly consent to having your submitted lister name and contact phone number displayed publicly on your listing page and enabled for direct telephone calls and WhatsApp messages from interested visitors without requiring visitors to log in.',
        contentHi:
          'आप स्पष्ट सहमति देते हैं कि आपके द्वारा दर्ज किया गया नाम और संपर्क फोन नंबर आपकी लिस्टिंग पर सार्वजनिक रूप से प्रदर्शित किया जाएगा ताकि इच्छुक आगंतुक बिना लॉगिन किए भी आपको सीधे फोन कॉल या व्हाट्सएप संदेश कर सकें।',
      },
      {
        titleEn: '3. License to Display Listing Content & Responsibility for Claims',
        titleHi: '3. सामग्री प्रदर्शित करने की अनुमति एवं दावों की जिम्मेदारी',
        contentEn:
          'You retain ownership of your photographs and text, and grant UKG a non-exclusive, royalty-free permission to optimize, host, and display your listing on uttarakhandgateways.com while your listing remains active. If a third party brings a legal claim arising from false information, unauthorized property listing, or infringed media uploaded by you, you remain legally responsible for your uploaded content under applicable Indian law.',
        contentHi:
          'अपनी तस्वीरों और विवरण पर आपका स्वामित्व बना रहता है, और आप लिस्टिंग सक्रिय रहने तक uttarakhandgateways.com पर उसे ऑप्टिमाइज व प्रदर्शित करने की अनुमति UKG को देते हैं। यदि आपके द्वारा अपलोड की गई गलत जानकारी, अनधिकृत प्रॉपर्टी लिस्टिंग या कॉपीराइट उल्लंघन के कारण कोई कानूनी दावा उत्पन्न होता है, तो लागू भारतीय कानून के तहत अपनी सामग्री के लिए आप स्वयं उत्तरदायी होंगे।',
      },
    ],
  },
};
