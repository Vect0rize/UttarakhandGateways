export type PropertyType = 
  | 'Flat' 
  | 'Apartment' 
  | 'Plot' 
  | 'Villa' 
  | 'House'
  | 'Farmhouse' 
  | 'Cottage'
  | 'Shop'
  | 'Showroom'
  | 'Office'
  | 'Hotel'
  | 'Resort'
  | 'Restaurant'
  | 'Cafe'
  | 'Homestay'
  | 'Hostel'
  | 'Warehouse'
  | 'Studio'
  | 'Penthouse'
  | 'Duplex'
  | 'Land'
  | 'Rent'
  | 'Lease'
  | 'Rent/Lease'
  | 'PG';

export type PropertyCategory = 
  | 'Residential' 
  | 'Commercial' 
  | 'Agriculture';

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
  locality?: string;
  address?: string;
  district?: string;
  city: UttarakhandCity;
  region: Region;
  altitudeMsl?: string; // e.g. "7,500 ft MSL"
  areaSqFt: number;
  areaValue?: number;
  areaDisplay: string; // e.g. "150 Gaj" or "2,160 Sq.Ft"
  landMeasureInNali?: number;
  configuration: string; // e.g. "3 BHK Duplex Mountain Cottage" or "Residential Plot"
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  facing?: string;
  possession?: 'Ready to Move' | 'Immediate Registry' | 'Under Construction (2026)' | string;
  reraStatus?: 'RERA Approved' | '143 Converted Clear Title' | 'MDDA Approved' | 'Regd Clear Title' | '143 Converted Freehold' | 'Regd Freehold' | string;
  reraId?: string;
  roadAccess?: 'Highway Facing' | '30 ft Motorable Road' | '20 ft Motorable Road' | '12-15 ft Concrete' | '10 ft Motor Track' | 'Walking Track' | string;
  bhooKanoonStatus?: 'Outsider Eligible (Under 250 sq.m / 1.25 Nali)' | 'Section 143 Converted (Dakhil Kharij)' | 'Municipal / MDDA Freehold' | 'DM Permission Required' | 'Commercial / Resort Approved' | string;
  waterSource?: 'Jal Sansthan (Govt Tap Water)' | 'Natural Spring / Dhara' | 'Private Boring' | 'Water Tanker Supply' | string;
  homestaySubsidyEligible?: boolean;
  isVerifiedListing?: boolean;
  verified?: boolean;
  views?: number;
  shares?: number;
  inquiries?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  himalayanPeakView?: boolean;
  peakName?: string;
  images: string[];
  videoUrl?: string;
  videos?: string[];
  documents?: Array<{ name: string; url: string; size?: number }>;
  areaUnit?: string;
  pricingUnit?: string;
  description: string;
  highlights: string[];
  amenities: string[];
  furnishing?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  legalStatus?: string;
  distanceFromAirport?: string;
  distanceFromRailway?: string;
  featured?: boolean;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerType?: 'Owner' | 'Broker';
  ownerId?: string;
  ownerContact?: string;
  ownerUsername?: string;
  fullSellerName?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  isPublished?: boolean;
  isHidden?: boolean;
  isSold?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  isAvailableForRent?: boolean;
  purpose?: 'sale' | 'rent';
  rentPeriod?: 'monthly' | 'quarterly' | 'yearly';
  monthlyRent?: number;
  securityDeposit?: number | string;
  maintenanceCharges?: number | string;
  availableFrom?: string;
  preferredTenants?: string[];
  propertyAgeYears?: number | null;
  createdAt?: string;
  updatedAt?: string;
  postedAt?: string;
}

export type RequirementType = 'Buy' | 'Rent';

export type RequirementPropertyType =
  | 'Plot'
  | 'House'
  | 'Flat'
  | 'Villa'
  | 'Commercial'
  | 'Other';

export interface RequirementResponseRecord {
  id: string;
  requirementId: string;
  responderId: string;
  responderName: string;
  responderEmail?: string;
  responderPhone: string;
  propertyId?: string;
  propertyTitle?: string;
  message: string;
  createdAt: string;
}

export interface PropertyRequirement {
  id: string;
  requirementType: RequirementType;
  propertyType: RequirementPropertyType;
  city: string;
  preferredLocation: string;
  minBudget: number;
  maxBudget: number;
  bedrooms?: number | null;
  requiredSize?: string | null;
  description?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFulfilled: boolean;
  createdAt: string;
  updatedAt?: string;
  expiresAt: string;
  responsesCount?: number;
  responses?: RequirementResponseRecord[];
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

export interface FilterState {
  region: 'All' | 'Kumaon' | 'Garhwal';
  searchQuery: string;
  category: string;
  city: string;
  budgetRange: string;
  bhkConfig: string;
  himalayanViewOnly: boolean;
  reraApprovedOnly: boolean;
  roadAccessFilter?: string;
  bhooKanoonOnly?: boolean;
  homestayOnly?: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'area-large' | 'area-small';
}
