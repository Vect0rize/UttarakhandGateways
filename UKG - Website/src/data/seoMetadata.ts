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
  | 'dashboard'
  | 'admin'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'listing-guidelines'
  | 'programmatic'
  | 'not-found';

export const CORE_UTTARAKHAND_KEYWORDS: string[] = [
  'properties in uttarakhand',
  'real estate uttarakhand',
  'properties in rishikesh',
  'properties near aiims',
  'properties near aiims rishikesh',
  'property in visthapit',
  'property in visthapit rishikesh',
  'near visthapit colony',
  'property in aam bagh',
  'property in aam bagh rishikesh',
  'property near seema dental',
  'property near seema dental rishikesh',
  'plots near aiims rishikesh',
  'flats near aiims rishikesh',
  'plots in visthapit',
  'plots in aam bagh',
  'rooms near seema dental',
  'flats near seema dental rishikesh',
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
  'no platform fee property uttarakhand',
  'uttarakhand gateways',
];

export const ROUTE_PATH_MAP: Record<
  Exclude<AppPageRouteKey, 'city' | 'guides' | 'programmatic' | 'not-found'>,
  string
> = {
  home: '/',
  buy: '/buy',
  rent: '/rent',
  list: '/list',
  'sell-gui': '/list/buy',
  'rent-gui': '/list/rent',
  'home-loan': '/home-loan',
  about: '/about',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  disclaimer: '/disclaimer',
  'listing-guidelines': '/listing-guidelines',
  login: '/login',
  register: '/register',
  inbox: '/inbox',
  dashboard: '/dashboard',
  admin: '/admin',
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
          'Browse plots, flats, cottages, villas, and commercial properties for sale across Dehradun, Rishikesh, Haridwar, Nainital & Mussoorie with No Platform Fee.',
        keywords: `purchase property in uttarakhand, buy property in uttarakhand, flats for sale in dehradun, plots for sale in rishikesh, villas in nainital, ${coreKw}`,
        canonicalPath: '/buy',
      };
    case 'rent':
      return {
        title: 'Rent Property & PG in Uttarakhand | Houses, Flats & Rooms for Rent | Uttarakhand Gateways',
        description:
          'Find rental houses, flats, rooms, cottages, PG accommodations, and commercial spaces in Dehradun, Rishikesh, Haridwar, Haldwani & Nainital with direct lister contact.',
        keywords: `rent property in uttarakhand, pg in uttarakhand, house for rent in dehradun, flats for rent in rishikesh, rooms for rent in haridwar, ${coreKw}`,
        canonicalPath: '/rent',
      };
    case 'list':
      return {
        title: 'Sell or Rent Property in Uttarakhand | Post Listing | Uttarakhand Gateways',
        description:
          'Post your property listing on Uttarakhand Gateways with No Platform Fee. Connect directly with interested buyers and tenants across Uttarakhand.',
        keywords: `sell property in uttarakhand, rent property in uttarakhand, post free property ad uttarakhand, list property uttarakhand, ${coreKw}`,
        canonicalPath: '/list',
      };
    case 'sell-gui':
      return {
        title: 'Sell Property in Uttarakhand | List Plots, Flats & Villas | Uttarakhand Gateways',
        description:
          'Publish residential plots, agricultural land, flats, houses, villas, and commercial properties across Dehradun, Rishikesh, Nainital & Haridwar with No Platform Fee.',
        keywords: `sell property in uttarakhand, list plot for sale uttarakhand, sell land in dehradun, sell house in rishikesh, ${coreKw}`,
        canonicalPath: '/list/buy',
      };
    case 'rent-gui':
      return {
        title: 'List Rental Property & PG in Uttarakhand | Uttarakhand Gateways',
        description:
          'List your house, flat, PG, homestay, or commercial space for rent across Uttarakhand with No Platform Fee and direct contact options.',
        keywords: `rent property in uttarakhand, list pg in uttarakhand, rent flat in dehradun, rent room in rishikesh, ${coreKw}`,
        canonicalPath: '/list/rent',
      };
    case 'home-loan':
      return {
        title: 'Informational EMI Calculator | Uttarakhand Gateways',
        description:
          'Simple informational monthly EMI, total interest, and total repayment estimator for general planning purposes.',
        keywords: `emi calculator, loan repayment estimator, ${coreKw}`,
        canonicalPath: '/home-loan',
      };
    case 'city': {
      const city = options?.cityName || 'Dehradun';
      const cityLower = city.toLowerCase();
      return {
        title: `Properties in ${city} | Buy, Sell & Rent in ${city}, Uttarakhand | Uttarakhand Gateways`,
        description: `Browse properties in ${city}, Uttarakhand. Discover flats, plots, villas, commercial spaces, and rentals in ${city} with direct lister contact.`,
        keywords: `properties in ${cityLower}, ${cityLower} real estate, buy property in ${cityLower}, rent property in ${cityLower}, pg in ${cityLower}, ${coreKw}`,
        canonicalPath: `/properties-in-${cityLower}`,
      };
    }
    case 'guides':
      return {
        title: options?.guideTitle
          ? `${options.guideTitle} | Uttarakhand Gateways`
          : 'Uttarakhand Land Laws & Property Due Diligence Guides | Uttarakhand Gateways',
        description:
          options?.guideDescription ||
          'Informational guides on Uttarakhand land records, Section 154 norms, Section 143 non-agricultural conversion, mutation, and buyer due diligence.',
        keywords: `uttarakhand bhoo kanoon, section 154 uttarakhand land law, purchase property in uttarakhand rules, ${coreKw}`,
        canonicalPath: options?.guideSlug ? `/guides/${options.guideSlug}` : '/guides',
      };
    case 'login':
      return {
        title: 'Sign In | Uttarakhand Gateways',
        description:
          'Sign in to Uttarakhand Gateways to post or manage your property listings and access your account.',
        keywords: coreKw,
        canonicalPath: '/login',
      };
    case 'register':
      return {
        title: 'Create Account | Uttarakhand Gateways',
        description:
          'Create an account on Uttarakhand Gateways to post and manage property listings across Uttarakhand.',
        keywords: coreKw,
        canonicalPath: '/register',
      };
    case 'inbox':
      return {
        title: 'Direct Messages | Uttarakhand Gateways',
        description:
          'Manage your property conversations on Uttarakhand Gateways.',
        keywords: coreKw,
        canonicalPath: '/inbox',
      };
    case 'dashboard':
      return {
        title: 'Listing Analysis | Manage Properties | Uttarakhand Gateways',
        description:
          'View Listing Analysis, track views and shares, and manage your Uttarakhand sale and rental listings.',
        keywords: coreKw,
        canonicalPath: '/dashboard',
      };
    case 'about':
      return {
        title: 'About Uttarakhand Gateways | Property Listing & Discovery Platform',
        description:
          'Learn how Uttarakhand Gateways connects property owners, listers, and interested buyers or tenants across Uttarakhand with No Platform Fee.',
        keywords:
          'about uttarakhand gateways, uttarakhand real estate platform, property listing portal uttarakhand',
        canonicalPath: '/about',
      };
    case 'contact':
      return {
        title: 'Contact & Support | Uttarakhand Gateways',
        description:
          'Reach the Uttarakhand Gateways support desk for listing assistance, technical help, or grievance redressal.',
        keywords:
          'contact uttarakhand gateways, uttarakhand real estate support, property listing helpdesk',
        canonicalPath: '/contact',
      };
    case 'privacy':
      return {
        title: 'Privacy Policy | Uttarakhand Gateways',
        description:
          'How Uttarakhand Gateways collects, uses, stores, and shares personal information, including public visibility of lister contact numbers.',
        keywords: 'uttarakhand gateways privacy policy, property portal data protection',
        canonicalPath: '/privacy',
      };
    case 'terms':
      return {
        title: 'Terms & Conditions | Uttarakhand Gateways',
        description:
          'Terms & Conditions governing use of Uttarakhand Gateways, intermediary role, buyer due diligence responsibilities, and No Platform Fee policy.',
        keywords: 'uttarakhand gateways terms and conditions, property listing terms',
        canonicalPath: '/terms',
      };
    case 'disclaimer':
      return {
        title: 'Disclaimer | Uttarakhand Gateways',
        description:
          'Important notice clarifying that Uttarakhand Gateways does not verify properties, act as a broker or adviser, or guarantee transactions.',
        keywords: 'uttarakhand gateways disclaimer, property due diligence notice',
        canonicalPath: '/disclaimer',
      };
    case 'listing-guidelines':
      return {
        title: 'Property Listing Policy | Uttarakhand Gateways',
        description:
          'Standards for publishing property listings on Uttarakhand Gateways, genuine photography, role disclosure, and 20 MB upload rules.',
        keywords: 'property listing guidelines uttarakhand, listing policy',
        canonicalPath: '/listing-guidelines',
      };
    case 'not-found':
      return {
        title: 'Page Not Found (404) | Uttarakhand Gateways',
        description:
          'The requested page or property listing could not be found. Browse active properties across Uttarakhand.',
        keywords: 'uttarakhand gateways 404, browse uttarakhand properties',
        canonicalPath: '/properties-in-uttarakhand',
      };
    case 'admin':
      return {
        title: 'Admin Dashboard | Uttarakhand Gateways',
        description: 'Uttarakhand Gateways Platform Administration Console.',
        keywords: 'uttarakhand gateways admin',
        canonicalPath: '/admin',
      };
    case 'home':
    default:
      return {
        title: 'Uttarakhand Gateways | Properties in Uttarakhand • Buy, Sell & Rent',
        description:
          'Discover plots, flats, cottages, villas, commercial spaces, and rentals across Dehradun, Rishikesh, Haridwar, Nainital & Mussoorie on Uttarakhand Gateways with No Platform Fee.',
        keywords: coreKw,
        canonicalPath: '/',
      };
  }
}
