export type PropertyType = 
  | 'Flat' 
  | 'Apartment' 
  | 'Plot' 
  | 'Villa' 
  | 'Farmhouse' 
  | 'Cottage'
  | 'Commercial'
  | 'Shop'
  | 'Hotel'
  | 'Resort'
  | 'Studio'
  | 'Penthouse'
  | 'Duplex'
  | 'Land';

export type PropertyCategory = 
  | 'Flats & Apartments' 
  | 'Residential Plots' 
  | 'Himalayan Villas & Cottages' 
  | 'Commercial Properties & Shops'
  | 'Hotels, Resorts & Homestays'
  | 'Farmhouses & Land'
  | 'Studio Apartments & Suites'
  | 'Penthouses & Duplexes'
  | 'Industrial & Institutional Land';

export type UttarakhandCity = 
  | 'Dehradun' 
  | 'Mussoorie' 
  | 'Rishikesh' 
  | 'Haridwar'
  | 'Devprayag'
  | 'Nainital' 
  | 'Mukteshwar' 
  | 'Bhimtal' 
  | 'Ranikhet' 
  | 'Almora'
  | 'Lansdowne'
  | 'Auli'
  | 'Dhanaulti'
  | 'Kanatal'
  | 'Kausani'
  | 'Chakrata'
  | 'Tehri Garhwal'
  | 'Rudraprayag'
  | 'Uttarkashi'
  | 'Kotdwar'
  | 'Haldwani'
  | 'Bhowali';

export type Region = 'Garhwal' | 'Kumaon';

export interface Property {
  id: string;
  title: string;
  tagline: string;
  type: PropertyType;
  category: PropertyCategory;
  price: number; // in INR
  priceDisplay: string;
  ratePerSqFt?: string;
  ratePerGajOrNali?: string;
  location: string;
  city: UttarakhandCity;
  region: Region;
  altitudeMsl: string; // e.g. "7,500 ft MSL"
  areaSqFt: number;
  areaDisplay: string; // e.g. "2,160 sq.ft (1 Nali / 240 Gaj)"
  landMeasureInNali?: number;
  configuration: string; // e.g. "3 BHK Duplex Mountain Cottage" or "Residential Plot"
  bedrooms: number;
  bathrooms: number;
  facing: string;
  possession: 'Ready to Move' | 'Immediate Registry' | 'Under Construction (2026)';
  reraStatus: 'RERA Approved' | '143 Converted Clear Title' | 'MDDA Approved' | 'Regd Clear Title' | '143 Converted Freehold' | 'Regd Freehold';
  reraId?: string;
  himalayanPeakView: boolean;
  peakName?: string;
  images: string[];
  description: string;
  highlights: string[];
  amenities: string[];
  legalStatus: string;
  distanceFromAirport: string;
  distanceFromRailway: string;
  featured?: boolean;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerType?: 'Owner' | 'Verified Builder' | 'Agent';
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyImage: string;
  propertyPrice: string;
  sellerName: string;
  sellerPhone?: string;
  buyerName: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

export interface PhoneNumberRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyImage: string;
  sellerName: string;
  sellerPhone: string;
  requesterName: string;
  requesterNote?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'declined';
  approvedAt?: string;
  isIncomingForUserListing?: boolean;
}

export interface FilterState {
  region: 'All' | 'Kumaon' | 'Garhwal';
  searchQuery: string;
  category: string;
  city: string;
  budgetRange: string;
  bhkConfig: string;
  himalayanViewOnly: boolean;
  reraApprovedOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'area-large' | 'area-small';
}
