import { Property, UttarakhandCity, PropertyCategory } from '../types';

// All fake / mock properties removed. Only real user/owner listed properties appear.
export const PROPERTIES: Property[] = [];

export const CITIES: UttarakhandCity[] = [
  'Dehradun',
  'Rishikesh',
  'Haridwar',
  'Mussoorie',
  'Nainital',
  'Mukteshwar',
  'Bhimtal',
  'Devprayag',
  'Ranikhet',
  'Almora',
  'Lansdowne',
  'Auli',
  'Dhanaulti',
  'Kanatal',
  'Kausani',
  'Chakrata',
  'Tehri Garhwal',
  'Rudraprayag',
  'Uttarkashi',
  'Kotdwar',
  'Haldwani',
  'Bhowali'
];

export const CATEGORIES: PropertyCategory[] = [
  'Residential',
  'Commercial',
  'Agriculture'
];

export const BUDGET_RANGES = [
  { label: 'All Budgets', value: 'all' },
  { label: 'Under ₹50 Lakhs', value: 'under-50' },
  { label: '₹50 Lakhs - ₹1 Cr', value: '50-100' },
  { label: '₹1 Cr - ₹2 Cr', value: '100-200' },
  { label: '₹2 Cr+', value: 'above-200' },
];

export const BHK_CONFIGS = [
  { label: 'All Configurations', value: 'all' },
  { label: 'Plots / Land Only', value: 'plot' },
  { label: '1 BHK', value: '1' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4+ BHK / Villas', value: '4' },
];
