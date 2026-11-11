export type AppPageRouteKey =
  | 'home'
  | 'buy'
  | 'rent'
  | 'list'
  | 'sell-gui'
  | 'rent-gui'
  | 'home-loan'
  | 'city'
  | 'guides'
  | 'login'
  | 'register'
  | 'inbox'
  | 'dashboard';

export const CORE_UTTARAKHAND_KEYWORDS: string[] = [
  'properties in uttarakhand',
  'real estate uttarakhand',
  'properties in rishikesh',
  'properties in dehradun',
  'ukg properties',
  'uttarakhand properties',
  'uttraakhand properties',
  'sell property in uttarakhand',
  'rent property in uttarakhand',
  'purchase property in uttarakhand',
  'pg in uttarakhand',
  'buy property in uttarakhand',
  'properties in haridwar',
  'properties in nainital',
  'properties in mussoorie',
  'properties in haldwani',
  'properties in almora',
  'properties in mukteshwar',
  'plots in uttarakhand',
  'flats in dehradun',
  'villas in uttarakhand',
  'cottages in nainital',
  '0% brokerage property uttarakhand',
  'uttarakhand gateways',
];

export const ROUTE_PATH_MAP: Record<Exclude<AppPageRouteKey, 'city' | 'guides'>, string> = {
  home: '/',
  buy: '/buy',
  rent: '/rent',
  list: '/list',
  'sell-gui': '/list/buy',
  'rent-gui': '/list/rent',
  'home-loan': '/home-loan',
  login: '/login',
  register: '/register',
  inbox: '/inbox',
  dashboard: '/dashboard',
};

export interface PageSeoMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
}

export function getPageSeoMeta(
  page: AppPageRouteKey,
  options?: {
    cityName?: string;
    guideTitle?: string;
    guideSlug?: string;
    guideDescription?: string;
  }
): PageSeoMetadata {
  const coreKw = CORE_UTTARAKHAND_KEYWORDS.join(', ');

  switch (page) {
    case 'buy':
      return {
        title: 'Buy & Purchase Property in Uttarakhand | Properties in Dehradun, Rishikesh | Uttarakhand Gateways',
        description:
          'Purchase property in Uttarakhand with 0% brokerage. Browse verified plots, flats, cottages, villas, and commercial UKG properties across Dehradun, Rishikesh, Haridwar, Nainital & Mussoorie.',
        keywords: `purchase property in uttarakhand, buy property in uttarakhand, flats for sale in dehradun, plots for sale in rishikesh, villas in nainital, ${coreKw}`,
        canonicalPath: '/buy',
      };
    case 'rent':
      return {
        title: 'Rent Property & PG in Uttarakhand | Houses, Flats & Rooms for Rent | Uttarakhand Gateways',
        description:
          'Rent property in Uttarakhand & find verified PG in Uttarakhand with 0% brokerage. Houses, furnished flats, rooms, cottages, and offices for rent in Dehradun, Rishikesh, Haridwar, Haldwani & Nainital.',
        keywords: `rent property in uttarakhand, pg in uttarakhand, house for rent in dehradun, flats for rent in rishikesh, rooms for rent in haridwar, ${coreKw}`,
        canonicalPath: '/rent',
      };
    case 'list':
      return {
        title: 'Sell or Rent Property Free in Uttarakhand | Post Ad | Uttarakhand Gateways',
        description:
          'Post your free property ad on UKG Properties. Sell property in Uttarakhand or rent property in Uttarakhand directly to verified buyers & tenants with 0% brokerage.',
        keywords: `sell property in uttarakhand, rent property in uttarakhand, post free property ad uttarakhand, list property uttarakhand, ${coreKw}`,
        canonicalPath: '/list',
      };
    case 'sell-gui':
      return {
        title: 'Sell Property in Uttarakhand (Free Listing) | List Plots, Flats & Villas | Uttarakhand Gateways',
        description:
          'Sell property in Uttarakhand faster with 0% brokerage. List residential plots, agricultural land, flats, houses, villas, and resorts across Dehradun, Rishikesh, Nainital & Haridwar.',
        keywords: `sell property in uttarakhand, list plot for sale uttarakhand, sell land in dehradun, sell house in rishikesh, ${coreKw}`,
        canonicalPath: '/list/buy',
      };
    case 'rent-gui':
      return {
        title: 'List Rental Property & PG in Uttarakhand | 0% Brokerage | Uttarakhand Gateways',
        description:
          'Rent property in Uttarakhand & list your PG in Uttarakhand, house, flat, homestay, or commercial space directly with verified tenants at 0% commission.',
        keywords: `rent property in uttarakhand, list pg in uttarakhand, rent flat in dehradun, rent room in rishikesh, ${coreKw}`,
        canonicalPath: '/list/rent',
      };
    case 'home-loan':
      return {
        title: 'Uttarakhand Home Loan EMI Calculator & Eligibility | UKG Properties',
        description:
          'Calculate home loan EMI for purchasing property in Uttarakhand. Compare SBI, HDFC, ICICI & PNB home loan rates for properties in Dehradun, Rishikesh, Haridwar & Nainital.',
        keywords: `home loan uttarakhand, uttarakhand property loan emi calculator, purchase property in uttarakhand loan, ${coreKw}`,
        canonicalPath: '/home-loan',
      };
    case 'city': {
      const city = options?.cityName || 'Dehradun';
      const cityLower = city.toLowerCase();
      return {
        title: `Properties in ${city} | Buy, Sell & Rent in ${city}, Uttarakhand | Uttarakhand Gateways`,
        description: `Explore verified properties in ${city}, Uttarakhand with 0% brokerage. Buy, purchase, sell, or rent flats, plots, villas, and PG in ${city} directly with owners.`,
        keywords: `properties in ${cityLower}, ${cityLower} real estate, buy property in ${cityLower}, rent property in ${cityLower}, pg in ${cityLower}, ${coreKw}`,
        canonicalPath: `/properties-in-${cityLower}`,
      };
    }
    case 'guides':
      return {
        title: options?.guideTitle
          ? `${options.guideTitle} | Uttarakhand Gateways`
          : 'Uttarakhand Land Laws (Section 154 & Bhoo Kanoon) & Property Guides | Uttarakhand Gateways',
        description:
          options?.guideDescription ||
          'Complete legal guides for real estate Uttarakhand: Section 154 land limit, Bhoo Kanoon, Dakhil Kharij, RERA & registry rules before buying or selling property in Uttarakhand.',
        keywords: `uttarakhand bhoo kanoon, section 154 uttarakhand land law, purchase property in uttarakhand rules, ${coreKw}`,
        canonicalPath: options?.guideSlug ? `/guides/${options.guideSlug}` : '/guides',
      };
    case 'login':
      return {
        title: 'Sign In | Uttarakhand Gateways (UKG Properties)',
        description:
          'Sign in to Uttarakhand Gateways to manage listings, unlock owner contacts, sell or rent property in Uttarakhand, and chat directly with 0% brokerage.',
        keywords: coreKw,
        canonicalPath: '/login',
      };
    case 'register':
      return {
        title: 'Create Account | Uttarakhand Gateways (UKG Properties)',
        description:
          'Create your free Uttarakhand Gateways account to buy, sell, purchase, or rent properties across Dehradun, Rishikesh, Haridwar, Nainital & Mussoorie.',
        keywords: coreKw,
        canonicalPath: '/register',
      };
    case 'inbox':
      return {
        title: 'Direct Messages & Property Inquiries | Uttarakhand Gateways',
        description:
          'Chat directly with property buyers, owners, and tenants on UKG Properties across Uttarakhand with 0% brokerage.',
        keywords: coreKw,
        canonicalPath: '/inbox',
      };
    case 'dashboard':
      return {
        title: 'Seller & Owner Dashboard | Manage UKG Properties | Uttarakhand Gateways',
        description:
          'Track views, inquiries, and manage your Uttarakhand real estate sale and rental listings directly from your UKG Properties dashboard.',
        keywords: coreKw,
        canonicalPath: '/dashboard',
      };
    case 'home':
    default:
      return {
        title: 'Uttarakhand Gateways | Properties in Uttarakhand • Buy, Sell & Rent (0% Brokerage)',
        description:
          'Explore UKG Properties & real estate Uttarakhand with 0% brokerage. Buy, sell, purchase, or rent verified properties in Dehradun, Rishikesh, Haridwar, Nainital, Mussoorie, and PG in Uttarakhand.',
        keywords: coreKw,
        canonicalPath: '/',
      };
  }
}
