export interface CityMarketData {
  city: string;
  hindiName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  elevation: string;
  priceRange: string;
  landPriceRange: string;
  avgFlatRate: string;
  popularLocalities: string[];
  connectivityHighlights: string[];
  legalNotes: string;
  description: string;
  faqs: { q: string; a: string }[];
}

export const CITY_MARKET_DATA: Record<string, CityMarketData> = {
  Dehradun: {
    city: 'Dehradun',
    hindiName: 'देहरादून',
    metaTitle: 'Properties in Dehradun | Verified Flats, Plots & Villas for Sale & Rent',
    metaDescription: 'Explore verified properties in Dehradun directly with 0% brokerage. Discover residential plots, luxury flats, and hillside villas across Rajpur Road, Sahastradhara, and Mussoorie Bypass.',
    h1: 'Properties in Dehradun | 0% Brokerage Mountain Real Estate',
    tagline: 'Uttarakhand’s vibrant capital nestled in the Doon Valley, offering premier education, healthcare, and urban connectivity.',
    elevation: '640 m (2,100 ft)',
    priceRange: '₹28 Lac - ₹4.8 Cr',
    landPriceRange: '₹30,000 - ₹1,20,000 per Gaj',
    avgFlatRate: '₹4,500 - ₹9,500 per sq.ft',
    popularLocalities: ['Rajpur Road', 'Sahastradhara Road', 'Mussoorie Bypass', 'GMS Road', 'Clement Town', 'Chakrata Road', 'Vasant Vihar'],
    connectivityHighlights: ['Delhi-Dehradun Expressway (2.5 hr commute to Delhi)', 'Jolly Grant Airport (DED) with daily direct metro flights', 'Dehradun Railway Station linking Northern Railway networks'],
    legalNotes: 'Within Dehradun Municipal Corporation & MDDA limits, Indian citizens face no upper ceiling for purchasing apartments, residential houses, or converted freehold plots.',
    description: 'Dehradun is the premier real estate capital of Uttarakhand, offering a perfect blend of lush green Himalayan foothills, renowned residential boarding schools, hospitals, and rapid infrastructure expansion. Whether you are looking for a luxury flat on Rajpur Road, a scenic hillside villa on Mussoorie Bypass, or a residential plot on Sahastradhara Road, Uttarakhand Gateways connects you directly with verified owners with 0% brokerage.',
    faqs: [
      {
        q: 'Can non-residents of Uttarakhand buy property in Dehradun?',
        a: 'Yes. Within the Dehradun Municipal Corporation (Nagar Nigam) and Mussoorie Dehradun Development Authority (MDDA) approved areas, there is no restriction or ceiling on buying apartments, flats, or residential properties.'
      },
      {
        q: 'What are the best localities to invest in Dehradun real estate?',
        a: 'Rajpur Road and Sahastradhara Road command highest demand for premium hillside apartments. GMS Road, Chakrata Road, and Shimla Bypass offer affordable residential plots and family homes.'
      },
      {
        q: 'Does Uttarakhand Gateways charge any brokerage on Dehradun properties?',
        a: 'No. Uttarakhand Gateways operates on a strict 0% brokerage model. Buyers connect directly with verified property owners and builders without agent commissions.'
      }
    ]
  },
  Rishikesh: {
    city: 'Rishikesh',
    hindiName: 'ऋषिकेश',
    metaTitle: 'Properties in Rishikesh | Ganga View Flats, Cottages & Plots for Sale',
    metaDescription: 'Find verified properties in Rishikesh with 0% brokerage. Ganga-view apartments, yoga retreat plots, and cottages across Tapovan, Dhalwala, and Shyampur.',
    h1: 'Properties in Rishikesh | Ganga Valley Living with 0% Brokerage',
    tagline: 'The World Capital of Yoga, offering spiritual tranquility along the holy Ganga River and scenic Shivalik mountain foothills.',
    elevation: '372 m (1,220 ft)',
    priceRange: '₹22 Lac - ₹3.5 Cr',
    landPriceRange: '₹25,000 - ₹85,000 per Gaj',
    avgFlatRate: '₹4,200 - ₹8,500 per sq.ft',
    popularLocalities: ['Tapovan', 'Dhalwala', 'Shyampur', 'Gumaniwala', 'Natraj Chowk', 'Bairaj Road', 'Muni Ki Reti'],
    connectivityHighlights: ['Rishikesh-Karnaprayag Railway Mega-Project', 'Jolly Grant Airport just 18 km away', 'Direct 4-lane Highway to Haridwar & Dehradun'],
    legalNotes: 'Properties located in Rishikesh Municipal Corporation and approved urban layouts carry clear freehold titles. Commercial homestays and yoga retreats must conform to local tourism guidelines.',
    description: 'Rishikesh attracts real estate buyers from across India and worldwide seeking spiritual retreats, wellness centers, and serene retirement living on the banks of the sacred Ganga. Explore verified studios, 2BHK/3BHK Ganga-view flats in Tapovan, and residential plots in Shyampur with zero broker interference.',
    faqs: [
      {
        q: 'Is it profitable to buy an apartment in Rishikesh for rental income?',
        a: 'Yes. Rishikesh experiences high tourist and wellness retreat demand year-round. Studio and 1/2 BHK apartments in Tapovan and Dhalwala offer strong yields through verified long-term rentals and registered homestays.'
      },
      {
        q: 'Are plots available in Rishikesh with clear Section 143 conversion?',
        a: 'Yes, all residential land parcels listed on Uttarakhand Gateways in Shyampur and Gumaniwala specify their Section 143 non-agricultural conversion and registry title status.'
      }
    ]
  },
  Haridwar: {
    city: 'Haridwar',
    hindiName: 'हरिद्वार',
    metaTitle: 'Properties in Haridwar | Affordable Residential Plots & Flats for Sale',
    metaDescription: 'Discover verified residential properties in Haridwar with 0% brokerage. Plots, gated township flats, and independent houses in Shivalik Nagar, SIDCUL, and Jwalapur.',
    h1: 'Properties in Haridwar | Peaceful Living & Thriving Investment',
    tagline: 'An ancient spiritual sanctuary on the banks of the Ganga and a rapidly growing industrial-residential corridor.',
    elevation: '314 m (1,030 ft)',
    priceRange: '₹18 Lac - ₹2.2 Cr',
    landPriceRange: '₹18,000 - ₹60,000 per Gaj',
    avgFlatRate: '₹3,200 - ₹6,000 per sq.ft',
    popularLocalities: ['Shivalik Nagar', 'SIDCUL Integrated Township', 'Jwalapur', 'Kankhal', 'Roorkee-Haridwar Highway', 'Bahadrabad'],
    connectivityHighlights: ['Direct National Highway 58 & 334 to Delhi NCR', 'Haridwar Junction with express train connectivity nationwide', 'Proximity to SIDCUL industrial belt'],
    legalNotes: 'Haridwar properties fall within Haridwar-Roorkee Development Authority (HRDA) jurisdiction. Freehold plots in approved townships ensure clean bank loan approvals.',
    description: 'Haridwar offers some of the most affordable and high-growth real estate opportunities in Uttarakhand. It combines spiritual heritage in Kankhal with modern residential townships near SIDCUL and Shivalik Nagar. Discover verified flats, plots, and duplexes directly from owners with 0% commission.',
    faqs: [
      {
        q: 'What is the average plot price in Haridwar?',
        a: 'Residential plots in gated developments near Shivalik Nagar and Bahadrabad range between ₹18,000 to ₹55,000 per Gaj depending on road width and HRDA approval status.'
      },
      {
        q: 'Can retirees easily buy a flat in Haridwar?',
        a: 'Yes. Many retirees and spiritual seekers purchase ready-to-move flats in Kankhal and Jwalapur due to proximity to the ghats, ashrams, and reputable healthcare facilities.'
      }
    ]
  },
  Nainital: {
    city: 'Nainital',
    hindiName: 'नैनीताल',
    metaTitle: 'Properties in Nainital | Lake View Cottages, Flats & Hill Villas',
    metaDescription: 'Browse verified hill properties in Nainital with 0% brokerage. Buy lake-view hillside cottages, wooden villas, and mountain apartments in Mallital, Tallital, and Bhimtal.',
    h1: 'Properties in Nainital | Lake City Hillside Living with 0% Brokerage',
    tagline: 'The iconic Lake District of Kumaon, surrounded by emerald hills, pleasant summers, and winter snowfalls.',
    elevation: '2,084 m (6,837 ft)',
    priceRange: '₹35 Lac - ₹5.5 Cr',
    landPriceRange: '₹40,000 - ₹1,50,000 per Nali / Gaj',
    avgFlatRate: '₹5,500 - ₹12,000 per sq.ft',
    popularLocalities: ['Mallital', 'Tallital', 'Ayarpatta', 'Bhimtal Bypass', 'Pangot Road', 'Bhowali-Nainital Road'],
    connectivityHighlights: ['Kathgodam Railway Station (34 km away with daily Shatabdi trains)', 'Pantnagar Airport (70 km)', 'Well-maintained all-weather highway to Delhi (6 hours)'],
    legalNotes: 'Within Nainital town boundaries, strict construction and environmental bylaws apply. Outskirts including Bhowali, Bhimtal, and Ramgarh allow outside buyers up to 250 sq.m rural land or freehold apartments.',
    description: 'Nainital is one of India’s most prestigious hill station property markets. From heritage colonial cottages nestled among oak forests in Ayarpatta to modern lakeside apartments overlooking the valley in Bhimtal and Bhowali, Uttarakhand Gateways brings you direct owner deals without broker markups.',
    faqs: [
      {
        q: 'Can outsiders buy a cottage or land around Nainital?',
        a: 'Yes. In the outer belts of Nainital district (Bhimtal, Bhowali, Mukteshwar, Ramgarh), non-residents can buy up to 250 sq. meters (~1.25 Nali) of rural land per family, or freehold apartments without any size restrictions.'
      },
      {
        q: 'How cold does Nainital get in winter?',
        a: 'Nainital experiences sub-zero temperatures and snowfalls between December and February, making it a winter wonderland and high-demand holiday rental hub.'
      }
    ]
  },
  Mussoorie: {
    city: 'Mussoorie',
    hindiName: 'मसूरी',
    metaTitle: 'Properties in Mussoorie | Luxury Hill Cottages & Villas for Sale',
    metaDescription: 'Explore verified luxury properties in Mussoorie with 0% brokerage. Discover heritage hill cottages, panoramic villas, and apartments along Mall Road, Barlowganj, and Hathipaon.',
    h1: 'Properties in Mussoorie | Queen of Hills Estates with 0% Brokerage',
    tagline: 'Perched on the Garhwal Himalayan ridge, overlooking the Doon Valley and snow-crested Himalayan ranges.',
    elevation: '2,005 m (6,578 ft)',
    priceRange: '₹45 Lac - ₹7.5 Cr',
    landPriceRange: '₹50,000 - ₹1,80,000 per Gaj',
    avgFlatRate: '₹6,500 - ₹14,000 per sq.ft',
    popularLocalities: ['Mall Road', 'Library Chowk', 'Barlowganj', 'Landour', 'Hathipaon', 'Kempty Fall Road', 'Dhanaulti Bypass'],
    connectivityHighlights: ['Only 34 km from Dehradun city center (under 1 hr drive)', 'New Ropeway and Tunnel project connecting Dehradun and Mussoorie', 'Direct connectivity to Delhi via upcoming expressway'],
    legalNotes: 'Mussoorie properties come under MDDA regulations and eco-sensitive norms. Outside buyers can purchase approved apartments and designated residential units directly.',
    description: 'Known as the Queen of Hills, Mussoorie offers an extraordinary lifestyle with its misty ridges, colonial heritage, vibrant cafes, and unmatched vistas of the Great Himalayas. Discover private mountain estates, holiday cottages, and boutique homestay listings directly on Uttarakhand Gateways with zero brokerage fees.',
    faqs: [
      {
        q: 'What makes Mussoorie a prime luxury real estate destination?',
        a: 'Proximity to Dehradun, high weekend tourism demand from Delhi NCR, cool temperate summers, and breathtaking valley views make Mussoorie one of the most resilient luxury real estate markets in North India.'
      },
      {
        q: 'What is the land purchase policy in Mussoorie for outsiders?',
        a: 'Approved flats and developed apartments inside municipal town limits can be purchased by any Indian citizen. Rural land beyond municipal limits is subject to the standard 250 sq.m ceiling.'
      }
    ]
  },
  Haldwani: {
    city: 'Haldwani',
    hindiName: 'हल्द्वानी',
    metaTitle: 'Properties in Haldwani | Commercial & Residential Plots for Sale',
    metaDescription: 'Find verified properties in Haldwani with 0% brokerage. Residential plots, builder floors, and houses in Kaladhungi Road, Kusumkhera, and Kathgodam.',
    h1: 'Properties in Haldwani | The Economic Gateway to Kumaon',
    tagline: 'The vibrant commercial, commercial-transit, and educational capital of Kumaon in the Shivalik foothills.',
    elevation: '424 m (1,391 ft)',
    priceRange: '₹20 Lac - ₹2.8 Cr',
    landPriceRange: '₹22,000 - ₹75,000 per Gaj',
    avgFlatRate: '₹3,500 - ₹7,000 per sq.ft',
    popularLocalities: ['Kaladhungi Road', 'Kusumkhera', 'Kathgodam', 'Rampur Road', 'Nawabi Road', 'Bareilly Road'],
    connectivityHighlights: ['Kathgodam Railway Station with Shatabdi & Ranikhet Express', 'Gateway junction to Nainital, Almora, Ranikhet & Jim Corbett', 'Pantnagar Airport only 26 km away'],
    legalNotes: 'Haldwani properties fall under District Development Authority regulations with clear freehold registry and municipal conversion records.',
    description: 'Haldwani is the commercial powerhouse of the Kumaon region. Located at the foothills of Nainital, it offers all metropolitan facilities, top medical colleges, shopping centers, and seamless railway and road transit to Delhi and Lucknow. Explore genuine residential plots, builder floors, and commercial shops directly from owners on Uttarakhand Gateways.',
    faqs: [
      {
        q: 'Why is Haldwani considered a top property investment in Uttarakhand?',
        a: 'Because of its strategic transit location as the primary entry point to all Kumaon hill stations, rapid urbanization, expanding commercial centers, and stable property appreciation.'
      },
      {
        q: 'Are plots in Haldwani approved for immediate house construction?',
        a: 'Yes, listings in developed colonies like Kusumkhera and Kaladhungi Road feature wide roads, electricity, municipal water connections, and immediate registry.'
      }
    ]
  }
};
