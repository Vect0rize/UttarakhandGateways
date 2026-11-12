import { Property } from '../types';

export interface LocationSeoProfile {
  slug: string;
  name: string;
  district: string;
  region: 'Garhwal' | 'Kumaon' | 'Statewide';
  elevation: string;
  tagline: string;
  overview: string;
  connectivity: string;
  popularLocalities: string[];
  nearbyLocationSlugs: string[];
  /** Authentic buyer guidance specific to topography & local demand without fabricated prices */
  buyerChecklist: string[];
}

export type ProgrammaticIntentKey =
  | 'all-properties'
  | 'buy-property'
  | 'rental-properties'
  | 'flats-for-sale'
  | 'rent-flats'
  | 'plots-for-sale'
  | 'land-for-sale'
  | 'houses-for-sale'
  | 'villas-for-sale'
  | 'cottages-for-sale'
  | 'commercial-property'
  | 'residential-property'
  | 'agricultural-land'
  | 'under-50-lakhs'
  | 'under-1-crore'
  | 'property-dealers';

export interface ProgrammaticPatternSpec {
  intent: ProgrammaticIntentKey;
  urlPrefix: string; // e.g. 'flats-for-sale-in-'
  label: string;
  shortLabel: string;
  h1Template: (locName: string) => string;
  titleTemplate: (locName: string, count: number) => string;
  descriptionTemplate: (locName: string, count: number, priceSummary: string) => string;
  introTemplate: (loc: LocationSeoProfile, count: number, priceSummary: string, typesList: string) => string;
  filter: (p: Property) => boolean;
}

export interface ProgrammaticFaqItem {
  q: string;
  a: string;
}

export interface ProgrammaticBreadcrumb {
  label: string;
  path: string;
}

export interface ProgrammaticLinkItem {
  label: string;
  path: string;
  count?: number;
}

export interface ResolvedProgrammaticRoute {
  canonicalPath: string;
  intent: ProgrammaticIntentKey;
  location: LocationSeoProfile;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  introParagraph: string;
  secondaryInsight: string;
  matchedProperties: Property[];
  fallbackProperties: Property[];
  activeCount: number;
  saleCount: number;
  rentCount: number;
  priceRangeDisplay: string;
  availableTypes: string[];
  shouldIndex: boolean;
  robotsMeta: string;
  breadcrumbs: ProgrammaticBreadcrumb[];
  faqs: ProgrammaticFaqItem[];
  relatedCategoryLinks: ProgrammaticLinkItem[];
  relatedLocationLinks: ProgrammaticLinkItem[];
  relatedGuideSlugs: string[];
}

export const MIN_PROGRAMMATIC_INDEX_COUNT = 2;

export function slugify(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCitySlug(cityName: string): string {
  const s = slugify(cityName);
  return s || 'uttarakhand';
}

export function getPropertySlug(
  property: Pick<Property, 'id' | 'title' | 'city' | 'type' | 'purpose'>
): string {
  const baseTitle = property.title || `${property.type || 'Property'} in ${property.city || 'Uttarakhand'}`;
  const titlePart = slugify(baseTitle).slice(0, 72).replace(/-+$/g, '');
  const idPart = String(property.id || '').trim();
  if (!titlePart) return encodeURIComponent(idPart);
  return `${titlePart}-${encodeURIComponent(idPart)}`;
}

export function getPropertySlugPath(
  property: Pick<Property, 'id' | 'title' | 'city' | 'type' | 'purpose'>
): string {
  return `/property/${getPropertySlug(property)}`;
}

export function findPropertyBySlugOrId(
  slugOrId: string,
  properties: Property[]
): Property | undefined {
  const raw = String(slugOrId || '').trim();
  if (!raw) return undefined;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  // 1. Exact ID match
  const exact = properties.find((p) => p.id === raw || p.id === decoded);
  if (exact) return exact;

  // 2. Suffix match (<slug>-<id>) — longest ID wins to prevent partial overlap
  const sortedByIdLen = [...properties].sort((a, b) => (b.id?.length || 0) - (a.id?.length || 0));
  return sortedByIdLen.find((p) => {
    if (!p.id) return false;
    return decoded.endsWith(`-${p.id}`) || raw.endsWith(`-${encodeURIComponent(p.id)}`);
  });
}

export function formatInrShort(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on Request';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lac = amount / 100000;
    return `₹${Number.isInteger(lac) ? lac : lac.toFixed(1).replace(/\.0$/, '')} L`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export const LOCATION_SEO_PROFILES: Record<string, LocationSeoProfile> = {
  uttarakhand: {
    slug: 'uttarakhand',
    name: 'Uttarakhand',
    district: 'All 13 Districts',
    region: 'Statewide',
    elevation: '300m – 3,100m',
    tagline: 'Devbhoomi Real Estate — Garhwal, Kumaon & Doon Valley',
    overview:
      'Uttarakhand offers diverse real estate corridors spanning planned urban townships in Dehradun and Haldwani, spiritual riverfront hubs in Rishikesh and Haridwar, and high-altitude Himalayan retreats across Nainital, Mukteshwar, Mussoorie, Ranikhet, and Almora.',
    connectivity:
      'Connected via Jolly Grant Airport (Dehradun), Pantnagar Airport (Udham Singh Nagar), the Delhi–Dehradun Expressway corridor, Char Dham all-weather highways, and broad-gauge railheads at Dehradun, Haridwar, Kotdwar, and Kathgodam.',
    popularLocalities: [
      'Rajpur Road (Dehradun)',
      'Tapovan (Rishikesh)',
      'Bhimtal Lake Belt',
      'Mukteshwar Ridge',
      'Mall Road (Nainital)',
      'Sidakul & Shivalik Nagar (Haridwar)',
    ],
    nearbyLocationSlugs: ['dehradun', 'rishikesh', 'haridwar', 'nainital', 'mussoorie', 'haldwani'],
    buyerChecklist: [
      'Confirm whether the land falls inside municipal limits (Nagar Nigam / Nagar Palika) or rural jurisdiction before calculating Section 154 purchase limits.',
      'Check Jamabandi / Khatauni mutation records and verify Bhu-Naksha survey boundaries directly at the Tehsil or Bhulekh Uttarakhand portal.',
      'In hill belts above 1,200m, confirm road width (minimum 6m–9m approach), slope stability, and MDDA or local Development Authority map sanction.',
    ],
  },
  dehradun: {
    slug: 'dehradun',
    name: 'Dehradun',
    district: 'Dehradun District',
    region: 'Garhwal',
    elevation: '640m',
    tagline: 'State Capital & Premier Educational Residential Hub',
    overview:
      'Dehradun combines valley topography with established civic infrastructure, national institutions, hospitals, and commercial corridors, making it the primary market in Uttarakhand for end-use apartments, plotted colonies, and independent homes.',
    connectivity:
      'Served by Jolly Grant Airport (approx. 28 km), Dehradun Railway Terminus, ISBT, and the upgraded Delhi–Dehradun highway corridor linking Saharanpur and Sahastradhara routes.',
    popularLocalities: [
      'Rajpur Road',
      'Sahastradhara Road',
      'GMS Road',
      'Dalanwala',
      'Jakhan',
      'Vasant Vihar',
    ],
    nearbyLocationSlugs: ['mussoorie', 'rishikesh', 'haridwar', 'dhanaulti', 'chakrata', 'kanatal'],
    buyerChecklist: [
      'Verify MDDA (Mussoorie Dehradun Development Authority) approved layout numbers for residential plots and multi-storey flats.',
      'Verify Uttarakhand RERA registration for plotted townships exceeding 500 sq. m. or 8 units.',
      'Confirm perennial water supply line and seasonal drainage setbacks around foothill nalas and streams.',
    ],
  },
  rishikesh: {
    slug: 'rishikesh',
    name: 'Rishikesh',
    district: 'Dehradun / Tehri / Pauri Border',
    region: 'Garhwal',
    elevation: '372m',
    tagline: 'Ganga Riverside Town, Wellness & Homestay Corridor',
    overview:
      'Rishikesh attracts residential buyers, spiritual retirees, and hospitality operators seeking apartments, river-belt flats, yoga retreat spaces, and residential plots across Tapovan, Lakshman Jhula, Shyampur, and Raiwala.',
    connectivity:
      'Approximately 20 km from Jolly Grant Airport and linked directly via NH-34, Rishikesh Railway Station, and Yog Nagari Rishikesh rail terminus.',
    popularLocalities: [
      'Tapovan',
      'Lakshman Jhula',
      'Muni Ki Reti',
      'Dhalwala',
      'Shyampur',
      'Aam Bagh',
    ],
    nearbyLocationSlugs: ['dehradun', 'haridwar', 'devprayag', 'tehri-garhwal', 'kotdwar', 'mussoorie'],
    buyerChecklist: [
      'Check exact jurisdiction across Dehradun, Tehri Garhwal (Muni Ki Reti / Tapovan), or Pauri Garhwal (Swargashram) districts before stamp duty calculation.',
      'Verify Ganga flood-plain NGT buffer compliance and CRZ/riverbank setback norms on river-facing plots.',
      'For homestay or wellness rental intent, confirm UTDB (Uttarakhand Tourism Development Board) registration eligibility.',
    ],
  },
  haridwar: {
    slug: 'haridwar',
    name: 'Haridwar',
    district: 'Haridwar District',
    region: 'Garhwal',
    elevation: '314m',
    tagline: 'Pilgrimage City, SIDCUL Industrial Belt & Highway Corridors',
    overview:
      'Haridwar balances heritage Ganga ghats with modern residential sectors around Shivalik Nagar, BHEL, Bahadrabad, and the NH-334 Roorkee corridor, offering accessible flats, plotted colonies, and commercial retail.',
    connectivity:
      'Direct broad-gauge railway junction with trains across India, NH-334 towards Delhi NCR, and Jolly Grant Airport approx. 38 km away.',
    popularLocalities: [
      'Shivalik Nagar',
      'Jwalapur',
      'Kankhal',
      'Ranipur More',
      'Bhoopatwala',
      'SIDCUL Corridor',
    ],
    nearbyLocationSlugs: ['rishikesh', 'dehradun', 'kotdwar', 'roorkee'],
    buyerChecklist: [
      'Verify HRDA (Haridwar-Roorkee Development Authority) plan approval for multi-unit flats and commercial shops.',
      'Distinguish residential zones from SIDCUL industrial leaseholds, which carry distinct transfer permissions.',
      'Check approach road width and municipal sewer connectivity in expanding Kankhal and Bahadrabad extensions.',
    ],
  },
  nainital: {
    slug: 'nainital',
    name: 'Nainital',
    district: 'Nainital District',
    region: 'Kumaon',
    elevation: '2,084m',
    tagline: 'Iconic Lake District Town of Kumaon Hills',
    overview:
      'Nainital remains Kumaon’s flagship hill station, with heritage cottages, lake-view apartments, and residential villas clustered across Ayarpata, Mallital, Tallital, Sukhatal, and surrounding forested ridges.',
    connectivity:
      'Approx. 35 km from Kathgodam Railway Station and 65 km from Pantnagar Airport via Haldwani and Bhowali.',
    popularLocalities: [
      'Mallital',
      'Tallital',
      'Ayarpata',
      'Sher Ka Danda',
      'Hanuman Garhi',
      'Khurpatal Belt',
    ],
    nearbyLocationSlugs: ['bhimtal', 'bhowali', 'haldwani', 'mukteshwar', 'ranikhet', 'almora'],
    buyerChecklist: [
      'Confirm Lake Development Authority (District Level Development Authority, Nainital) no-objection and seismic zone-IV structural clearance.',
      'Verify old lease/freehold status in heritage core wards around Tallital and Mallital.',
      'Confirm reserved parking availability or motorable approach before purchasing slope properties.',
    ],
  },
  mussoorie: {
    slug: 'mussoorie',
    name: 'Mussoorie',
    district: 'Dehradun District',
    region: 'Garhwal',
    elevation: '2,005m',
    tagline: 'Queen of the Hills — Colonial Estates & Valley Apartments',
    overview:
      'Perched above the Doon Valley, Mussoorie features colonial-era cottages, ridge apartments, and valley-facing villas around Landour, Barlowganj, Camels Back Road, and Kempty road.',
    connectivity:
      '34 km uphill from Dehradun City and ~60 km from Jolly Grant Airport via Rajpur–Kuthal Gate road.',
    popularLocalities: [
      'Landour',
      'Barlowganj',
      'Library Chowk',
      'Picture Palace',
      'Hathi Paon',
      'Camels Back Road',
    ],
    nearbyLocationSlugs: ['dehradun', 'dhanaulti', 'kanatal', 'tehri-garhwal', 'rishikesh'],
    buyerChecklist: [
      'Mussoorie is tightly regulated by MDDA and forest buffer rules—verify non-forest revenue land status (Naap vs Benap) rigorously.',
      'Confirm private winter water storage capacity and dedicated parking due to peak-season traffic restrictions.',
      'Review historic Estate/Cantonment regulations carefully when evaluating Landour Cantonment properties.',
    ],
  },
  haldwani: {
    slug: 'haldwani',
    name: 'Haldwani',
    district: 'Nainital District',
    region: 'Kumaon',
    elevation: '424m',
    tagline: 'Gateway to Kumaon — Foothill Commercial & Residential Hub',
    overview:
      'As Kumaon’s largest commercial city, Haldwani drives demand for independent family houses, gated plots, commercial showrooms, and rental apartments along Kathgodam, Kaladhungi Road, and Rampur Road.',
    connectivity:
      'Terminus of Kathgodam Railway Station (5 km north), NH-109, and 28 km from Pantnagar Airport.',
    popularLocalities: [
      'Kathgodam',
      'Kaladhungi Road',
      'Kusumkhera',
      'Nainital Road',
      'Rampur Road',
      'Lalkuan Belt',
    ],
    nearbyLocationSlugs: ['bhimtal', 'nainital', 'bhowali', 'mukteshwar', 'almora', 'ranikhet'],
    buyerChecklist: [
      'Because Haldwani lies in the plains/foothills belt, verify whether a colony falls inside Nagar Nigam Haldwani for clarity on stamp duty & mutation.',
      'Check Gaula River corridor distance and stormwater drainage levels during monsoon.',
      'Confirm RERA and local development authority sanction on new plotted colonies.',
    ],
  },
  mukteshwar: {
    slug: 'mukteshwar',
    name: 'Mukteshwar',
    district: 'Nainital District',
    region: 'Kumaon',
    elevation: '2,286m',
    tagline: 'Orchard Ridges & Panoramic Himalayan Cottages',
    overview:
      'Mukteshwar is renowned for stone-and-timber mountain cottages, apple orchard plots, and holiday villas with views toward Nanda Devi across Bhatelia, Satbunga, Sargakhet, and Sitla.',
    connectivity:
      'Approx. 51 km from Nainital and 62 km from Kathgodam Railway Station via Bhowali–Ramgarh.',
    popularLocalities: ['Bhatelia', 'Satbunga', 'Sargakhet', 'Sitla', 'Dhanachuli', 'Paharpani'],
    nearbyLocationSlugs: ['bhowali', 'bhimtal', 'nainital', 'almora', 'haldwani'],
    buyerChecklist: [
      'Verify rural Section 154 area limits (250 sq. m. residential purchase cap per family outside municipal zones where applicable) with local Tehsil counsel.',
      'Ensure Van Panchayat / Reserve Forest boundary demarcation is verified before buying ridgeline plots.',
      'Check year-round water spring/borewell yield and winter frost road access.',
    ],
  },
  bhimtal: {
    slug: 'bhimtal',
    name: 'Bhimtal',
    district: 'Nainital District',
    region: 'Kumaon',
    elevation: '1,370m',
    tagline: 'Pleasant Year-Round Lake Valley Residential Hub',
    overview:
      'With milder winters than upper Nainital and wider valley terrain, Bhimtal hosts gated hill apartments, lakeside cottages, and residential plots around Naukuchiatal, Sattal, and Bhowali–Bhimtal Road.',
    connectivity:
      '22 km from Kathgodam Railway Station and 55 km from Pantnagar Airport via Ranibagh.',
    popularLocalities: ['Bhimtal Lake Belt', 'Naukuchiatal', 'Mehragaon', 'June Estate', 'Sattal Road'],
    nearbyLocationSlugs: ['nainital', 'bhowali', 'haldwani', 'mukteshwar', 'ranikhet'],
    buyerChecklist: [
      'Check lake catchment conservation zoning around Bhimtal and Naukuchiatal before planning construction.',
      'Verify municipal vs Gram Sabha boundaries inside Bhimtal Nagar Panchayat.',
      'Confirm rainwater harvesting provisions and all-weather concrete approach roads.',
    ],
  },
  almora: {
    slug: 'almora',
    name: 'Almora',
    district: 'Almora District',
    region: 'Kumaon',
    elevation: '1,642m',
    tagline: 'Cultural Capital of Kumaon — Ridge Homes & Cottages',
    overview:
      'Almora attracts artists, families, and retirees seeking peaceful Kumaoni stone houses, cottages, and valley-view land parcels near Kasar Devi, Bright End Corner, Mall Road, and Chitai.',
    connectivity:
      'Approx. 82 km from Kathgodam Railway Station along NH-109.',
    popularLocalities: ['Kasar Devi', 'Mall Road', 'Dharanaula', 'NTDC', 'Chitai', 'Binsar Road'],
    nearbyLocationSlugs: ['kausani', 'ranikhet', 'mukteshwar', 'bhowali', 'bhimtal'],
    buyerChecklist: [
      'Confirm binsar/forest buffer clearances on plots along Kasar Devi and Binsar Road.',
      'Verify traditional 1-Nali (~2,160 sq. ft.) revenue measurements against square-feet deed conversions carefully.',
      'Check motorable approach distance from nearest metalled road to avoid high porterage costs.',
    ],
  },
  ranikhet: {
    slug: 'ranikhet',
    name: 'Ranikhet',
    district: 'Almora District',
    region: 'Kumaon',
    elevation: '1,869m',
    tagline: 'Pine Cantonment Town & Serene Cedar Villas',
    overview:
      'Framed by pine and oak forests, Ranikhet offers quiet cottages, villas, and hillside estates around Majkhali, Chaubatia, Tarikhet, and Chiliyanaula.',
    connectivity:
      '75 km from Kathgodam Railway Station and connected by scenic Kumaon hill highways.',
    popularLocalities: ['Majkhali', 'Chiliyanaula', 'Tarikhet', 'Chaubatia Belt', 'Mall Road'],
    nearbyLocationSlugs: ['almora', 'kausani', 'bhowali', 'nainital', 'mukteshwar'],
    buyerChecklist: [
      'Carefully distinguish Cantonment Board Ranikhet rules from neighboring Gram Sabha revenue estates like Majkhali.',
      'Confirm pine-forest firebreaks and rainwater storage for ridge properties.',
      'Validate contiguous Khatauni co-sharer NOCs when purchasing ancestral village plots.',
    ],
  },
  lansdowne: {
    slug: 'lansdowne',
    name: 'Lansdowne',
    district: 'Pauri Garhwal District',
    region: 'Garhwal',
    elevation: '1,780m',
    tagline: 'Quiet Garhwal Retreat Within Reach of Delhi NCR',
    overview:
      'Lansdowne is prized as one of the closest Garhwal hill getaways from Delhi NCR, driving demand for weekend cottages, forest-view homestays, and small residential plots in Jaiharikhal, Deriyakhal, and Gumkhal.',
    connectivity:
      'Approx. 40 km uphill from Kotdwar Railway Station (~250 km from Delhi).',
    popularLocalities: ['Jaiharikhal', 'Deriyakhal', 'Gumkhal', 'Bhullatal Belt', 'Tadkeshwar Road'],
    nearbyLocationSlugs: ['kotdwar', 'rishikesh', 'devprayag', 'haridwar'],
    buyerChecklist: [
      'Check Cantonment limits inside main Lansdowne vs freehold civil revenue land in Jaiharikhal and Gumkhal.',
      'Confirm private road easement rights across terraced hill parcels.',
      'Inspect slope angle and retaining wall integrity on valley-edge plots.',
    ],
  },
  dhanaulti: {
    slug: 'dhanaulti',
    name: 'Dhanaulti',
    district: 'Tehri Garhwal District',
    region: 'Garhwal',
    elevation: '2,286m',
    tagline: 'Deodar Forest Ridge Near Mussoorie & Tehri',
    overview:
      'Situated along the Mussoorie–Chamba ridge, Dhanaulti offers high-elevation holiday cottages, eco-villas, and Himalayan view plots amidst dense deodar and oak forests.',
    connectivity:
      '25 km from Mussoorie and ~60 km from Dehradun via Suwakholi.',
    popularLocalities: ['Eco Park Belt', 'Buranskhanda', 'Alu Farm Road', 'Thangdhar'],
    nearbyLocationSlugs: ['kanatal', 'mussoorie', 'dehradun', 'tehri-garhwal'],
    buyerChecklist: [
      'Verify forest boundary settlement lines carefully in high-altitude deodar belts.',
      'Plan for snowfall-grade roof pitches, thermal insulation, and winter water pipes.',
      'Verify rural Tehri Garhwal Tehsil mutation and 1-Nali area measurements.',
    ],
  },
  kanatal: {
    slug: 'kanatal',
    name: 'Kanatal',
    district: 'Tehri Garhwal District',
    region: 'Garhwal',
    elevation: '2,590m',
    tagline: 'High-Altitude Himalayan Panorama & Boutique Resorts',
    overview:
      'Kanatal sits between Chamba and Dhanaulti, attracting second-home buyers and hospitality investors seeking timber cottages, glamping land, and villas facing snow-capped Garhwal peaks.',
    connectivity:
      '38 km from Mussoorie, 12 km from Chamba, and ~75 km from Dehradun / Jolly Grant Airport.',
    popularLocalities: ['Kodia Forest Belt', 'Thangdhar', 'Chamba–Mussoorie Road', 'Sarkanda Ridge'],
    nearbyLocationSlugs: ['dhanaulti', 'tehri-garhwal', 'mussoorie', 'dehradun', 'rishikesh'],
    buyerChecklist: [
      'Confirm Kodia Forest eco-zone distance and district-level building permissions.',
      'Evaluate electricity voltage stability and backup solar/DG infrastructure for hospitality units.',
      'Verify clear approach from NH-707A Chamba–Mussoorie highway.',
    ],
  },
  kausani: {
    slug: 'kausani',
    name: 'Kausani',
    district: 'Bageshwar District',
    region: 'Kumaon',
    elevation: '1,890m',
    tagline: 'Trishul Peak Vistas & Quiet Tea-Estate Cottages',
    overview:
      'Famous for wide views of Trishul and Panchachuli peaks, Kausani hosts tranquil heritage houses, boutique homestays, and hillside land near Tea Estate Road and Anasakti Ashram.',
    connectivity:
      'Approx. 52 km north of Almora and 135 km from Kathgodam Railway Station.',
    popularLocalities: ['Tea Estate Road', 'Anasakti Ashram Belt', 'Baijnath Road', 'Someshwar Valley'],
    nearbyLocationSlugs: ['almora', 'ranikhet', 'mukteshwar'],
    buyerChecklist: [
      'Check Bageshwar vs Almora district revenue demarcation near Someshwar borders.',
      'Verify water spring rights and perennial piped supply on elevated tea-garden ridges.',
      'Confirm Section 154 rural land eligibility and title chain continuity.',
    ],
  },
  chakrata: {
    slug: 'chakrata',
    name: 'Chakrata',
    district: 'Dehradun District',
    region: 'Garhwal',
    elevation: '2,118m',
    tagline: 'Unspoiled Jaunsar-Bawar Hills & Quiet Retreats',
    overview:
      'Chakrata sits on an uncrowded forested ridge north-west of Dehradun, offering cottages, nature-stay properties, and hill plots around Chilmiri Neck, Kalsi road, and Lokhandi.',
    connectivity:
      'Approx. 90 km from Dehradun via Vikasnagar and Kalsi along NH-507.',
    popularLocalities: ['Chilmiri Neck', 'Kalsi Corridor', 'Lokhandi', 'Vikasnagar Foothills'],
    nearbyLocationSlugs: ['dehradun', 'mussoorie', 'uttarkashi', 'dhanaulti'],
    buyerChecklist: [
      'Verify Chakrata Cantonment vs civil/tribal revenue land rules (Jaunsar-Bawar special revenue provisions apply in scheduled areas—consult a local advocate!).',
      'Confirm motorable road access and winter frost exposure around Lokhandi ridge.',
    ],
  },
  devprayag: {
    slug: 'devprayag',
    name: 'Devprayag',
    district: 'Tehri Garhwal District',
    region: 'Garhwal',
    elevation: '830m',
    tagline: 'Sacred Sangam Town on the Badrinath Highway',
    overview:
      'At the confluence of the Alaknanda and Bhagirathi rivers, Devprayag sees growing interest in river-valley homes, pilgrimage guesthouses, and terraced plots along NH-58 (NH-7).',
    connectivity:
      '70 km from Rishikesh along the all-weather Badrinath National Highway and ~90 km from Jolly Grant Airport.',
    popularLocalities: ['Sangam Ghat', 'Shantabazar', 'Bah Bazar', 'NH-7 Highway Belt'],
    nearbyLocationSlugs: ['rishikesh', 'tehri-garhwal', 'rudraprayag', 'kotdwar'],
    buyerChecklist: [
      'Confirm highway widening / Char Dham RoW (Right of Way) setbacks along NH-7 before buying roadside parcels.',
      'Check riverbank flood-zone distance above Alaknanda–Bhagirathi confluence.',
    ],
  },
  rudraprayag: {
    slug: 'rudraprayag',
    name: 'Rudraprayag',
    district: 'Rudraprayag District',
    region: 'Garhwal',
    elevation: '895m',
    tagline: 'Junction Hub for Kedarnath & Badrinath Valley Corridors',
    overview:
      'Rudraprayag anchors hospitality, commercial retail, and residential housing along the Mandakini and Alaknanda confluence, serving year-round pilgrimage and regional district demand.',
    connectivity:
      '140 km from Rishikesh on NH-7, further boosted by the upcoming Rishikesh–Karnaprayag railway project.',
    popularLocalities: ['Main Bazar', 'Tilwara Road', 'Belni', 'Augustmuni Belt'],
    nearbyLocationSlugs: ['devprayag', 'auli', 'tehri-garhwal', 'rishikesh'],
    buyerChecklist: [
      'Verify NH-7 / NH-107 highway acquisition boundaries and railway alignment clearances.',
      'Verify geotechnical slope stability and monsoon drainage lines.',
    ],
  },
  uttarkashi: {
    slug: 'uttarkashi',
    name: 'Uttarkashi',
    district: 'Uttarkashi District',
    region: 'Garhwal',
    elevation: '1,158m',
    tagline: 'Bhagirathi Valley Spiritual & Orchard Real Estate',
    overview:
      'Nestled along the Bhagirathi River en route to Gangotri, Uttarkashi features peaceful riverside cottages, orchard lands, and residential plots across Joshiyara, Gyansu, Netala, and Harsil valley corridors.',
    connectivity:
      'Approx. 145 km from Dehradun and 165 km from Rishikesh via Chamba/Dharasu.',
    popularLocalities: ['Joshiyara', 'Gyansu', 'Netala', 'Bhatwari', 'Dunda'],
    nearbyLocationSlugs: ['tehri-garhwal', 'dhanaulti', 'kanatal', 'mussoorie'],
    buyerChecklist: [
      'Confirm Bhagirathi Eco-Sensitive Zone (BESZ) norms for plots beyond Uttarkashi town toward Gangotri.',
      'Verify municipal ward limits in Uttarkashi (Barahat) Nagar Palika vs village land.',
    ],
  },
  kotdwar: {
    slug: 'kotdwar',
    name: 'Kotdwar',
    district: 'Pauri Garhwal District',
    region: 'Garhwal',
    elevation: '395m',
    tagline: 'Gateway to Pauri Garhwal — Connected Foothill City',
    overview:
      'Kotdwar offers relatively affordable foothill residential houses, independent plots, and commercial shops near Bijnor–Najibabad rail links, serving both local families and investors en route to Lansdowne.',
    connectivity:
      'Broad-gauge Kotdwar Railway Station (~210 km from Delhi) and direct NH-534 ascent toward Lansdowne and Pauri.',
    popularLocalities: ['Padampur', 'Sukhro', 'Jhandi Chaur', 'Kashirampur', 'Bhabhar Belt'],
    nearbyLocationSlugs: ['lansdowne', 'haridwar', 'rishikesh', 'devprayag'],
    buyerChecklist: [
      'Verify Kotdwar Municipal Corporation ward boundaries and approved layout plans.',
      'Check seasonal khoh/sukhro stream flood embankments in foothill colonies.',
    ],
  },
  bhowali: {
    slug: 'bhowali',
    name: 'Bhowali',
    district: 'Nainital District',
    region: 'Kumaon',
    elevation: '1,654m',
    tagline: 'Fruit Hub & Scenic Crossroads of Kumaon Lakes',
    overview:
      'Acting as the central junction connecting Nainital, Bhimtal, Mukteshwar, and Almora, Bhowali draws steady interest for villas, flats, and second-home cottages amidst pine valleys.',
    connectivity:
      '11 km from Nainital, 10 km from Bhimtal, and 33 km from Kathgodam Railway Station.',
    popularLocalities: ['Shyamkhet', 'Ramgarh Road', 'Niglat', 'Ghorakhal Road', 'Bhowali Market'],
    nearbyLocationSlugs: ['bhimtal', 'nainital', 'mukteshwar', 'haldwani', 'almora'],
    buyerChecklist: [
      'Check Bhowali Nagar Palika boundaries vs neighboring Shyamkhet/Ramgarh Gram Sabha revenue land.',
      'Confirm winter sun orientation (south/east aspect) and dedicated vehicle access.',
    ],
  },
  'tehri-garhwal': {
    slug: 'tehri-garhwal',
    name: 'Tehri Garhwal',
    district: 'Tehri Garhwal District',
    region: 'Garhwal',
    elevation: '700m – 2,200m',
    tagline: 'Lakefront Destination — New Tehri, Chamba & Koti Colony',
    overview:
      'Centered around the vast emerald Tehri Lake and planned township of New Tehri, Tehri Garhwal hosts lakeside cottages, adventure homestays, residential plots, and mountain villas across Chamba, Koti Colony, and Narendra Nagar.',
    connectivity:
      'Approx. 80–100 km from Rishikesh and Dehradun via Chamba or Narendra Nagar.',
    popularLocalities: ['New Tehri', 'Koti Colony', 'Chamba', 'Narendra Nagar', 'Dobra Chanti Belt'],
    nearbyLocationSlugs: ['kanatal', 'dhanaulti', 'rishikesh', 'devprayag', 'uttarkashi'],
    buyerChecklist: [
      'Verify THDC / Tehri Special Area Development Authority (TADA) tourism & construction zone clearances near Tehri Lake reservoir levels.',
      'Verify mutation records and exact road access across steep lakeside ridges.',
    ],
  },
  auli: {
    slug: 'auli',
    name: 'Auli',
    district: 'Chamoli District',
    region: 'Garhwal',
    elevation: '2,800m',
    tagline: 'High-Alpine Ski Slopes & Boutique Mountain Lodges',
    overview:
      'Known for alpine meadows and views of Nanda Devi, Auli and nearby Joshimath corridors draw niche demand for snow-view cottages, boutique homestays, and high-altitude hospitality plots.',
    connectivity:
      'Connected via Joshimath on NH-7 (approx. 255 km from Rishikesh).',
    popularLocalities: ['Auli Road', 'Joshimath Belt', 'Tapovan (Chamoli)', 'Sunil Village'],
    nearbyLocationSlugs: ['rudraprayag', 'devprayag', 'uttarkashi'],
    buyerChecklist: [
      'Prioritize thorough geotechnical and subsidence stability clearance from Chamoli district authorities before any hillside transaction.',
      'Confirm military/Cantonment buffer and alpine forest zone boundaries.',
    ],
  },
};

export function findLocationBySlug(slug: string): LocationSeoProfile | undefined {
  const clean = slugify(slug);
  if (!clean) return undefined;
  return LOCATION_SEO_PROFILES[clean];
}

const isFlatType = (t: string) => ['flat', 'apartment', 'studio', 'penthouse', 'duplex'].includes(t.toLowerCase());
const isPlotOrLandType = (t: string) => ['plot', 'land'].includes(t.toLowerCase());
const isHouseType = (t: string) => ['house', 'duplex', 'villa', 'cottage', 'farmhouse'].includes(t.toLowerCase());
const isVillaType = (t: string) => ['villa', 'farmhouse'].includes(t.toLowerCase());
const isCottageType = (t: string) => ['cottage', 'homestay'].includes(t.toLowerCase());

export const PROGRAMMATIC_PATTERNS: ProgrammaticPatternSpec[] = [
  {
    intent: 'all-properties',
    urlPrefix: 'properties-in-',
    label: 'All Properties',
    shortLabel: 'Properties',
    h1Template: (loc) => `Properties in ${loc}`,
    titleTemplate: (loc, count) =>
      `Properties in ${loc} (${count} Active Listings) | Buy & Rent | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Browse ${count} active residential, commercial, plot & land properties in ${loc}, Uttarakhand (${price}). Connect directly with owners and verified local brokers with 0% portal commission.`,
    introTemplate: (loc, count, price, types) =>
      `Explore ${count} current property listings in ${loc.name} (${loc.district}), covering ${types || 'residential homes, flats, plots, and mountain retreats'}. Current active pricing spans ${price}. ${loc.overview}`,
    filter: () => true,
  },
  {
    intent: 'buy-property',
    urlPrefix: 'buy-property-in-',
    label: 'Buy Property',
    shortLabel: 'Buy Property',
    h1Template: (loc) => `Buy Property in ${loc}`,
    titleTemplate: (loc, count) =>
      `Buy Property in ${loc} (${count} For Sale) | Houses, Flats & Plots | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Find ${count} properties for sale in ${loc}, Uttarakhand (${price}). Verified owner and broker listings for houses, flats, residential plots, villas & land.`,
    introTemplate: (loc, count, price, types) =>
      `Discover ${count} active purchase opportunities in ${loc.name} across ${types || 'homes, apartments, plots, and land'}, listed between ${price}. ${loc.connectivity}`,
    filter: (p) => p.purpose !== 'rent',
  },
  {
    intent: 'rental-properties',
    urlPrefix: 'rental-properties-in-',
    label: 'Rental Properties',
    shortLabel: 'Rentals',
    h1Template: (loc) => `Rental Properties in ${loc}`,
    titleTemplate: (loc, count) =>
      `Rental Properties in ${loc} (${count} Available) | Flats, Houses & Homestays | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Explore ${count} verified houses, flats, cottages & apartments for rent in ${loc} (${price}). Connect directly with landlords without middleman portal fees.`,
    introTemplate: (loc, count, price, types) =>
      `Compare ${count} rental listings currently active in ${loc.name} across ${types || 'apartments, houses, cottages, and homestays'}, with monthly rents ranging ${price}.`,
    filter: (p) => p.purpose === 'rent',
  },
  {
    intent: 'flats-for-sale',
    urlPrefix: 'flats-for-sale-in-',
    label: 'Flats & Apartments for Sale',
    shortLabel: 'Flats for Sale',
    h1Template: (loc) => `Flats & Apartments for Sale in ${loc}`,
    titleTemplate: (loc, count) =>
      `Flats for Sale in ${loc} (${count} Listings) | Apartments & Penthouses | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Browse ${count} flats, apartments, studios & penthouses for sale in ${loc}, Uttarakhand (${price}). Compare BHK layouts, area & amenities directly with sellers.`,
    introTemplate: (loc, count, price) =>
      `Compare ${count} ready and upcoming flats, apartments, and penthouses for sale in ${loc.name} (${price}). Ideal for families and second-home buyers seeking low-maintenance gated living with urban connectivity.`,
    filter: (p) => p.purpose !== 'rent' && isFlatType(p.type || ''),
  },
  {
    intent: 'rent-flats',
    urlPrefix: 'rent-flats-in-',
    label: 'Flats for Rent',
    shortLabel: 'Rent Flats',
    h1Template: (loc) => `Flats & Apartments for Rent in ${loc}`,
    titleTemplate: (loc, count) =>
      `Flats for Rent in ${loc} (${count} Available) | Direct Owner Rentals | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Find ${count} furnished and semi-furnished flats & studio apartments for rent in ${loc} (${price}). Transparent monthly rent & deposit terms.`,
    introTemplate: (loc, count, price) =>
      `View ${count} flats and apartments available for rent in ${loc.name} (${price}), curated for working professionals, students, and families relocating to ${loc.district}.`,
    filter: (p) => p.purpose === 'rent' && isFlatType(p.type || ''),
  },
  {
    intent: 'plots-for-sale',
    urlPrefix: 'plots-for-sale-in-',
    label: 'Plots for Sale',
    shortLabel: 'Plots',
    h1Template: (loc) => `Residential & Investment Plots for Sale in ${loc}`,
    titleTemplate: (loc, count) =>
      `Plots for Sale in ${loc} (${count} Listings) | Verified Land Parcels | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Explore ${count} residential plots and hilltop land parcels for sale in ${loc}, Uttarakhand (${price}). Check sqft/nali dimensions & direct seller details.`,
    introTemplate: (loc, count, price) =>
      `Evaluate ${count} plotted parcels currently listed for sale in ${loc.name} (${price}). Always inspect Khatauni mutation entries, motorable approach width, and local Development Authority or rural Section 154 norms prior to registry.`,
    filter: (p) => p.purpose !== 'rent' && (p.type || '').toLowerCase() === 'plot',
  },
  {
    intent: 'land-for-sale',
    urlPrefix: 'land-for-sale-in-',
    label: 'Land for Sale',
    shortLabel: 'Land',
    h1Template: (loc) => `Land for Sale in ${loc}`,
    titleTemplate: (loc, count) =>
      `Land for Sale in ${loc} (${count} Active Parcels) | Residential & Agri Land | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Browse ${count} land parcels and residential plots for sale in ${loc}, Uttarakhand (${price}). Check road frontage, area units (SqFt, Bigha, Nali) & title notes.`,
    introTemplate: (loc, count, price) =>
      `Browse ${count} land and plotted parcels available in ${loc.name} (${price}). Listings cover freehold residential plots, valley-view ridges, and agricultural holdings—verify revenue classification and Section 154 eligibility with local revenue counsel.`,
    filter: (p) => p.purpose !== 'rent' && isPlotOrLandType(p.type || ''),
  },
  {
    intent: 'houses-for-sale',
    urlPrefix: 'houses-for-sale-in-',
    label: 'Houses for Sale',
    shortLabel: 'Houses',
    h1Template: (loc) => `Independent Houses for Sale in ${loc}`,
    titleTemplate: (loc, count) =>
      `Houses for Sale in ${loc} (${count} Listings) | Independent Homes | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Discover ${count} independent houses and duplexes for sale in ${loc}, Uttarakhand (${price}). Compare floor areas, parking & neighborhood infrastructure.`,
    introTemplate: (loc, count, price) =>
      `Explore ${count} independent family houses and duplex homes listed for sale in ${loc.name} (${price}), offering private plots and multi-bedroom layouts.`,
    filter: (p) => p.purpose !== 'rent' && isHouseType(p.type || ''),
  },
  {
    intent: 'villas-for-sale',
    urlPrefix: 'villas-for-sale-in-',
    label: 'Villas & Farmhouses for Sale',
    shortLabel: 'Villas',
    h1Template: (loc) => `Villas & Farmhouses for Sale in ${loc}`,
    titleTemplate: (loc, count) =>
      `Villas & Farmhouses for Sale in ${loc} (${count} Listings) | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `View ${count} luxury villas and gated farmhouses for sale in ${loc}, Uttarakhand (${price}). Panoramic mountain views & private lawns.`,
    introTemplate: (loc, count, price) =>
      `Browse ${count} mountain villas and estate farmhouses for sale in ${loc.name} (${price}), designed for discerning primary residences and serene holiday escapes.`,
    filter: (p) => p.purpose !== 'rent' && isVillaType(p.type || ''),
  },
  {
    intent: 'cottages-for-sale',
    urlPrefix: 'cottages-for-sale-in-',
    label: 'Cottages & Homestays for Sale',
    shortLabel: 'Cottages',
    h1Template: (loc) => `Mountain Cottages & Homestays for Sale in ${loc}`,
    titleTemplate: (loc, count) =>
      `Cottages & Homestays for Sale in ${loc} (${count} Listings) | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Browse ${count} Himalayan cottages and boutique homestay properties for sale in ${loc} (${price}). Scenic views & direct seller connections.`,
    introTemplate: (loc, count, price) =>
      `Explore ${count} mountain cottages and homestay-ready residences in ${loc.name} (${price}), blending hill architecture with hospitality potential.`,
    filter: (p) => p.purpose !== 'rent' && isCottageType(p.type || ''),
  },
  {
    intent: 'commercial-property',
    urlPrefix: 'commercial-property-in-',
    label: 'Commercial Property',
    shortLabel: 'Commercial',
    h1Template: (loc) => `Commercial Property in ${loc}`,
    titleTemplate: (loc, count) =>
      `Commercial Property in ${loc} (${count} Listings) | Retail, Resorts & Offices | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Find ${count} commercial spaces, showrooms, highway plots & hospitality properties in ${loc}, Uttarakhand (${price}).`,
    introTemplate: (loc, count, price) =>
      `Review ${count} commercial and mixed-use property listings in ${loc.name} (${price}), covering high-street retail, highway parcels, and boutique hospitality ventures.`,
    filter: (p) => (p.category || '').toLowerCase() === 'commercial',
  },
  {
    intent: 'residential-property',
    urlPrefix: 'residential-property-in-',
    label: 'Residential Property',
    shortLabel: 'Residential',
    h1Template: (loc) => `Residential Property in ${loc}`,
    titleTemplate: (loc, count) =>
      `Residential Property in ${loc} (${count} Active) | Homes, Flats & Plots | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Search ${count} residential properties in ${loc}, Uttarakhand (${price}) for buying or renting—houses, apartments, villas & plots.`,
    introTemplate: (loc, count, price) =>
      `Compare ${count} residential homes, apartments, villas, cottages, and residential plots in ${loc.name} (${price}).`,
    filter: (p) => (p.category || '').toLowerCase() === 'residential',
  },
  {
    intent: 'agricultural-land',
    urlPrefix: 'agricultural-land-in-',
    label: 'Agricultural Land',
    shortLabel: 'Agri Land',
    h1Template: (loc) => `Agricultural & Orchard Land in ${loc}`,
    titleTemplate: (loc, count) =>
      `Agricultural Land in ${loc} (${count} Parcels) | Orchards & Farmland | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Explore ${count} agricultural, orchard & farmhouse land parcels in ${loc}, Uttarakhand (${price}). Review Section 154 & Section 143 guidelines carefully.`,
    introTemplate: (loc, count, price) =>
      `Inspect ${count} agricultural and orchard land listings in ${loc.name} (${price}). Non-agriculturists purchasing rural farmland outside municipal limits in Uttarakhand are advised to verify Section 154(4) limits and Section 143 land-use status before executing agreements.`,
    filter: (p) =>
      (p.category || '').toLowerCase() === 'agricultural' ||
      ((p.type || '').toLowerCase() === 'land' &&
        /agri|orchard|farm|tea|estate|terrace/i.test(`${p.title} ${p.description}`)),
  },
  {
    intent: 'under-50-lakhs',
    urlPrefix: 'properties-under-50-lakhs-in-',
    label: 'Properties Under ₹50 Lakhs',
    shortLabel: 'Under ₹50L',
    h1Template: (loc) => `Properties Under ₹50 Lakhs in ${loc}`,
    titleTemplate: (loc, count) =>
      `Properties Under ₹50 Lakhs in ${loc} (${count} Listings) | Budget Homes & Plots | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Browse ${count} affordable properties for sale under ₹50 Lakhs in ${loc}, Uttarakhand (${price}). Budget flats, hill plots & compact houses.`,
    introTemplate: (loc, count, price) =>
      `Explore ${count} budget-friendly sale listings priced up to ₹50 Lakhs in ${loc.name} (${price}), curated from active owner and broker submissions.`,
    filter: (p) => p.purpose !== 'rent' && typeof p.price === 'number' && p.price > 0 && p.price <= 5000000,
  },
  {
    intent: 'under-1-crore',
    urlPrefix: 'properties-under-1-crore-in-',
    label: 'Properties Under ₹1 Crore',
    shortLabel: 'Under ₹1 Cr',
    h1Template: (loc) => `Properties Under ₹1 Crore in ${loc}`,
    titleTemplate: (loc, count) =>
      `Properties Under ₹1 Crore in ${loc} (${count} Listings) | Homes & Plots | Uttarakhand Gateways`,
    descriptionTemplate: (loc, count, price) =>
      `Compare ${count} properties for sale under ₹1 Crore in ${loc}, Uttarakhand (${price}). Independent houses, 2/3 BHK flats & residential plots.`,
    introTemplate: (loc, count, price) =>
      `Review ${count} properties for sale priced under ₹1 Crore in ${loc.name} (${price}), spanning flats, family homes, cottages, and residential land.`,
    filter: (p) => p.purpose !== 'rent' && typeof p.price === 'number' && p.price > 0 && p.price <= 10000000,
  },
];

function computePriceRangeDisplay(items: Property[], intent: ProgrammaticIntentKey): string {
  const numericPrices = items
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (numericPrices.length === 0) return 'varied price tiers';

  // Separate sale vs rent when mixed on "all-properties" so monthly rent isn't shown as sale min!
  const salePrices = items
    .filter((p) => p.purpose !== 'rent')
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  const rentPrices = items
    .filter((p) => p.purpose === 'rent')
    .map((p) => Number(p.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (intent === 'rental-properties' || intent === 'rent-flats') {
    const minR = Math.min(...(rentPrices.length ? rentPrices : numericPrices));
    const maxR = Math.max(...(rentPrices.length ? rentPrices : numericPrices));
    return minR === maxR
      ? `${formatInrShort(minR)}/mo`
      : `${formatInrShort(minR)} – ${formatInrShort(maxR)}/mo`;
  }

  if (salePrices.length > 0 && intent !== 'all-properties') {
    const minS = Math.min(...salePrices);
    const maxS = Math.max(...salePrices);
    return minS === maxS ? formatInrShort(minS) : `${formatInrShort(minS)} – ${formatInrShort(maxS)}`;
  }

  if (salePrices.length > 0 && rentPrices.length > 0) {
    return `Sale ${formatInrShort(Math.min(...salePrices))}–${formatInrShort(Math.max(...salePrices))} • Rent ${formatInrShort(Math.min(...rentPrices))}–${formatInrShort(Math.max(...rentPrices))}/mo`;
  }
  const minAll = Math.min(...numericPrices);
  const maxAll = Math.max(...numericPrices);
  return minAll === maxAll ? formatInrShort(minAll) : `${formatInrShort(minAll)} – ${formatInrShort(maxAll)}`;
}

function buildLocationMatchFn(location: LocationSeoProfile): (p: Property) => boolean {
  if (location.slug === 'uttarakhand') return () => true;
  const target = location.slug;
  const targetLower = location.name.toLowerCase();
  return (p: Property) => {
    const citySlug = getCitySlug(p.city || '');
    const locLower = `${p.city || ''} ${p.location || ''}`.toLowerCase();
    return citySlug === target || locLower.includes(targetLower);
  };
}

function buildFaqsForRoute(
  pattern: ProgrammaticPatternSpec,
  loc: LocationSeoProfile,
  activeCount: number,
  priceRange: string,
  availableTypes: string[]
): ProgrammaticFaqItem[] {
  const typesPhrase = availableTypes.length > 0 ? availableTypes.slice(0, 5).join(', ') : 'residential and land options';
  return [
    {
      q: `How many ${pattern.label.toLowerCase()} are currently listed in ${loc.name}?`,
      a:
        activeCount > 0
          ? `Uttarakhand Gateways currently displays ${activeCount} active ${pattern.label.toLowerCase()} in ${loc.name} (${loc.district}), spanning ${typesPhrase} within ${priceRange}.`
          : `There are currently 0 active ${pattern.label.toLowerCase()} specifically matched in ${loc.name}. You can explore nearby ${loc.region} markets or post a direct requirement.`,
    },
    {
      q: `Are properties in ${loc.name} listed with 0% portal brokerage?`,
      a: `Yes. Direct owner listings carry zero brokerage, while verified local broker listings on Uttarakhand Gateways clearly disclose seller role upfront so buyers and tenants can connect directly without hidden portal commissions.`,
    },
    {
      q: `What documents should I verify before buying property or land in ${loc.name}?`,
      a: `Always inspect the latest Bhulekh Uttarakhand Khatauni/Jamabandi, complete sale deed chain, non-encumbrance certificate (EC), RERA registration (if applicable), local authority map sanction, and confirm whether rural Section 154 land-ceiling provisions apply outside municipal limits.`,
    },
    {
      q: `Which nearby locations can I compare alongside ${loc.name}?`,
      a: `Buyers exploring ${loc.name} frequently compare inventory in ${loc.nearbyLocationSlugs
        .map((s) => LOCATION_SEO_PROFILES[s]?.name)
        .filter(Boolean)
        .join(', ')}.`,
    },
  ];
}

export function resolveProgrammaticSeoRoute(
  pathname: string,
  allProperties: Property[]
): ResolvedProgrammaticRoute | null {
  const cleanPath = String(pathname || '')
    .split('?')[0]
    .replace(/\/+$/, '')
    .toLowerCase();

  // Special statewide route: /property-dealers-in-uttarakhand
  if (cleanPath === '/property-dealers-in-uttarakhand') {
    const loc = LOCATION_SEO_PROFILES.uttarakhand;
    const matched = allProperties.filter((p) => !p.isSold);
    const priceRangeDisplay = computePriceRangeDisplay(matched, 'property-dealers');
    const availableTypes = Array.from(new Set(matched.map((p) => p.type).filter(Boolean)));
    const shouldIndex = matched.length >= MIN_PROGRAMMATIC_INDEX_COUNT;

    return {
      canonicalPath: '/property-dealers-in-uttarakhand',
      intent: 'property-dealers',
      location: loc,
      title: `Property Dealers & Direct Owners in Uttarakhand (${matched.length} Listings) | Uttarakhand Gateways`,
      description: `Connect directly with verified property owners, builders & local real estate dealers across Dehradun, Rishikesh, Haridwar, Nainital, Mussoorie & Haldwani on Uttarakhand Gateways.`,
      keywords:
        'property dealers in uttarakhand, real estate agents dehradun, rishikesh property brokers, direct owner property uttarakhand',
      h1: 'Property Dealers & Direct Owners in Uttarakhand',
      introParagraph: `Explore ${matched.length} active listings submitted directly by homeowners, builders, and verified local dealers across ${loc.district}. Every listing on Uttarakhand Gateways displays clear owner vs broker disclosure upfront.`,
      secondaryInsight:
        'Always perform independent legal verification of original title deeds, Khatauni mutation records, and RERA/Development Authority approvals before paying token advances.',
      matchedProperties: matched,
      fallbackProperties: [],
      activeCount: matched.length,
      saleCount: matched.filter((p) => p.purpose !== 'rent').length,
      rentCount: matched.filter((p) => p.purpose === 'rent').length,
      priceRangeDisplay,
      availableTypes,
      shouldIndex,
      robotsMeta: shouldIndex ? 'index, follow, max-image-preview:large' : 'noindex, follow',
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: 'Properties in Uttarakhand', path: '/properties-in-uttarakhand' },
        { label: 'Property Dealers in Uttarakhand', path: '/property-dealers-in-uttarakhand' },
      ],
      faqs: [
        {
          q: 'How does Uttarakhand Gateways differentiate owners and brokers?',
          a: 'Every seller chooses their disclosure role ("Owner" or "Broker") during listing submission, which is displayed transparently on the property card and detail page.',
        },
        {
          q: 'Does Uttarakhand Gateways charge commission to buyers?',
          a: 'No. Uttarakhand Gateways operates as a direct listing marketplace with 0% platform commission.',
        },
      ],
      relatedCategoryLinks: [
        { label: 'Properties in Uttarakhand', path: '/properties-in-uttarakhand', count: matched.length },
        { label: 'Buy Property in Uttarakhand', path: '/buy-property-in-uttarakhand' },
        { label: 'Land for Sale in Uttarakhand', path: '/land-for-sale-in-uttarakhand' },
        { label: 'Rental Properties in Uttarakhand', path: '/rental-properties-in-uttarakhand' },
      ],
      relatedLocationLinks: loc.nearbyLocationSlugs.map((slug) => ({
        label: `Properties in ${LOCATION_SEO_PROFILES[slug]?.name || slug}`,
        path: `/properties-in-${slug}`,
      })),
      relatedGuideSlugs: [
        'buying-property-in-uttarakhand',
        'important-property-documents-uttarakhand',
      ],
    };
  }

  // Match slug aliases -> canonical prefix
  let normalizedSlugPart = cleanPath.replace(/^\/+/, '');
  // Normalize common alternate URL aliases cleanly
  normalizedSlugPart = normalizedSlugPart
    .replace(/^property-for-sale-in-/, 'buy-property-in-')
    .replace(/^buy-plots-in-/, 'plots-for-sale-in-')
    .replace(/^rent-property-in-/, 'rental-properties-in-');

  let matchedPattern: ProgrammaticPatternSpec | undefined;
  let locSlug = '';

  for (const pat of PROGRAMMATIC_PATTERNS) {
    if (normalizedSlugPart.startsWith(pat.urlPrefix)) {
      matchedPattern = pat;
      locSlug = slugify(normalizedSlugPart.slice(pat.urlPrefix.length));
      break;
    }
  }

  if (!matchedPattern || !locSlug) return null;

  const loc = findLocationBySlug(locSlug);
  if (!loc) return null;

  const activeAll = allProperties.filter((p) => !p.isSold);
  const locMatcher = buildLocationMatchFn(loc);
  const locActive = activeAll.filter(locMatcher);
  const matched = locActive.filter(matchedPattern.filter);

  const canonicalPath = `/${matchedPattern.urlPrefix}${loc.slug}`;
  const priceRangeDisplay = computePriceRangeDisplay(matched, matchedPattern.intent);
  const availableTypes = Array.from(new Set(matched.map((p) => p.type).filter(Boolean)));
  const typesJoined = availableTypes.slice(0, 5).join(', ');
  const shouldIndex = matched.length >= MIN_PROGRAMMATIC_INDEX_COUNT;

  const fallbackProperties =
    matched.length > 0
      ? []
      : (locActive.length > 0 ? locActive : activeAll).slice(0, 9);

  // Build related category links that actually have >= 2 live listings in this location!
  const relatedCategoryLinks: ProgrammaticLinkItem[] = PROGRAMMATIC_PATTERNS.filter(
    (p) => p.intent !== matchedPattern!.intent
  )
    .map((p) => {
      const cnt = locActive.filter(p.filter).length;
      return {
        label: p.intent === 'all-properties' ? `All in ${loc.name}` : `${p.shortLabel} in ${loc.name}`,
        path: `/${p.urlPrefix}${loc.slug}`,
        count: cnt,
      };
    })
    .filter((item) => (item.count || 0) >= MIN_PROGRAMMATIC_INDEX_COUNT)
    .slice(0, 8);

  const relatedLocationLinks: ProgrammaticLinkItem[] = loc.nearbyLocationSlugs
    .map((s) => LOCATION_SEO_PROFILES[s])
    .filter(Boolean)
    .map((near) => {
      const cnt = activeAll.filter(buildLocationMatchFn(near)).filter(matchedPattern!.filter).length;
      return {
        label: `${matchedPattern!.shortLabel} in ${near.name}`,
        path:
          cnt >= MIN_PROGRAMMATIC_INDEX_COUNT
            ? `/${matchedPattern!.urlPrefix}${near.slug}`
            : `/properties-in-${near.slug}`,
        count:
          cnt >= MIN_PROGRAMMATIC_INDEX_COUNT
            ? cnt
            : activeAll.filter(buildLocationMatchFn(near)).length,
      };
    });

  const breadcrumbs: ProgrammaticBreadcrumb[] = [{ label: 'Home', path: '/' }];
  if (loc.slug !== 'uttarakhand') {
    breadcrumbs.push({
      label: 'Properties in Uttarakhand',
      path: '/properties-in-uttarakhand',
    });
  }
  if (matchedPattern.intent !== 'all-properties') {
    breadcrumbs.push({
      label: `Properties in ${loc.name}`,
      path: `/properties-in-${loc.slug}`,
    });
  }
  breadcrumbs.push({
    label: matchedPattern.h1Template(loc.name),
    path: canonicalPath,
  });

  // Contextual guide recommendations
  const relatedGuideSlugs = ['buying-property-in-uttarakhand', 'important-property-documents-uttarakhand'];
  if (
    matchedPattern.intent === 'plots-for-sale' ||
    matchedPattern.intent === 'land-for-sale' ||
    matchedPattern.intent === 'agricultural-land'
  ) {
    relatedGuideSlugs.unshift('uttarakhand-land-laws-section-154', 'residential-plots-vs-agricultural-land-uttarakhand');
  }
  if (loc.slug === 'dehradun') relatedGuideSlugs.unshift('things-to-check-before-buying-property-dehradun');
  if (loc.slug === 'rishikesh') relatedGuideSlugs.unshift('property-investment-opportunities-rishikesh');
  if (loc.slug === 'nainital' || loc.slug === 'bhimtal') relatedGuideSlugs.unshift('guide-to-buying-house-nainital');

  return {
    canonicalPath,
    intent: matchedPattern.intent,
    location: loc,
    title: matchedPattern.titleTemplate(loc.name, matched.length),
    description: matchedPattern.descriptionTemplate(loc.name, matched.length, priceRangeDisplay),
    keywords: `${matchedPattern.label.toLowerCase()} in ${loc.name.toLowerCase()}, ${loc.name.toLowerCase()} real estate, properties in ${loc.name.toLowerCase()}, uttarakhand real estate`,
    h1: matchedPattern.h1Template(loc.name),
    introParagraph: matchedPattern.introTemplate(loc, matched.length, priceRangeDisplay, typesJoined),
    secondaryInsight: `Connectivity & Infrastructure: ${loc.connectivity} Popular residential and investment pockets include ${loc.popularLocalities.slice(0, 5).join(', ')}.`,
    matchedProperties: matched,
    fallbackProperties,
    activeCount: matched.length,
    saleCount: matched.filter((p) => p.purpose !== 'rent').length,
    rentCount: matched.filter((p) => p.purpose === 'rent').length,
    priceRangeDisplay,
    availableTypes,
    shouldIndex,
    robotsMeta: shouldIndex ? 'index, follow, max-image-preview:large' : 'noindex, follow',
    breadcrumbs,
    faqs: buildFaqsForRoute(matchedPattern, loc, matched.length, priceRangeDisplay, availableTypes),
    relatedCategoryLinks,
    relatedLocationLinks,
    relatedGuideSlugs: Array.from(new Set(relatedGuideSlugs)).slice(0, 4),
  };
}

/**
 * Generates all index-worthy programmatic landing paths backed by >= MIN_PROGRAMMATIC_INDEX_COUNT
 * live active properties in the database (prevents thin or empty index bloat).
 */
export function getIndexableProgrammaticPaths(allProperties: Property[]): string[] {
  const paths: string[] = [];
  const active = allProperties.filter((p) => !p.isSold);
  if (active.length >= MIN_PROGRAMMATIC_INDEX_COUNT) {
    paths.push('/property-dealers-in-uttarakhand');
  }

  for (const loc of Object.values(LOCATION_SEO_PROFILES)) {
    const locMatcher = buildLocationMatchFn(loc);
    const locActive = active.filter(locMatcher);
    if (locActive.length < MIN_PROGRAMMATIC_INDEX_COUNT) continue;

    for (const pat of PROGRAMMATIC_PATTERNS) {
      const count = locActive.filter(pat.filter).length;
      if (count >= MIN_PROGRAMMATIC_INDEX_COUNT) {
        paths.push(`/${pat.urlPrefix}${loc.slug}`);
      }
    }
  }

  return Array.from(new Set(paths));
}
