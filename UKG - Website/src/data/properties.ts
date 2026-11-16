import { Property, UttarakhandCity, PropertyCategory } from '../types';

// Strict Authentic Marketplace: Zero synthetic/seed properties hardcoded
export const PROPERTIES: Property[] = [];

/**
 * Identifies any synthetic, demo, or auto-seeded fake property record so it is never displayed or cached.
 */
export function isSyntheticFakeProperty(p: any): boolean {
  if (!p || typeof p !== 'object') return true;
  const id = String(p.id || '');
  const ownerId = String(p.ownerId || '');
  const ownerContact = String(p.ownerContact || p.sellerEmail || '').toLowerCase();
  const sellerName = String(p.sellerName || '').toLowerCase();
  const ownerUsername = String(p.ownerUsername || '').toLowerCase();

  return (
    id.startsWith('user-prop-2026-') ||
    id.startsWith('prop-seed-') ||
    id.startsWith('prop-sale-') ||
    id.startsWith('prop-rent-') ||
    id.startsWith('fake-') ||
    id.startsWith('seed-') ||
    p.isFake === true ||
    p.is_fake === true ||
    p.isSeed === true ||
    ownerId === 'user-fake-catalog-500' ||
    ownerId === 'user-1794208094775-78b03b00' ||
    ownerId === 'user-sunil-joshi-2026' ||
    ownerContact === 'fakeproperties@uttarakhandgateways.com' ||
    ownerContact === 'sunil.joshi.uk@gmail.com' ||
    sellerName === 'ukg demo listings' ||
    sellerName === 'sunil joshi' ||
    ownerUsername === 'sunil joshi'
  );
}

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
  { label: 'Plots Only', value: 'plot' },
  { label: '1 BHK', value: '1' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4+ BHK', value: '4' },
];
