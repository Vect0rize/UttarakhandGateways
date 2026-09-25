export type PropertyType = 
  | 'Flat' 
  | 'Apartment' 
  | 'Plot' 
  | 'Villa' 
  | 'Farmhouse' 
  | 'Cottage';

export type PropertyCategory = 
  | 'Flats & Apartments' 
  | 'Residential Plots' 
  | 'Himalayan Villas & Cottages' 
  | 'Farmhouses & Land';

export type UttarakhandCity = 
  | 'Dehradun' 
  | 'Mussoorie' 
  | 'Rishikesh' 
  | 'Nainital' 
  | 'Mukteshwar' 
  | 'Bhimtal' 
  | 'Ranikhet' 
  | 'Almora';

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
  reraStatus: 'RERA Approved' | '143 Converted Freehold' | 'MDDA Approved' | 'Regd Freehold';
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

export interface VisitBookingData {
  propertyId: string;
  propertyName: string;
  clientName: string;
  phone: string;
  email: string;
  preferredDate: string;
  pickupRequired: 'None' | 'Jolly Grant Airport' | 'Dehradun Railway Station' | 'Kathgodam Railway Station';
  notes?: string;
}
