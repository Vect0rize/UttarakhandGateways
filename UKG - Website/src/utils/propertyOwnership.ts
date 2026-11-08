import { Property } from '../types';
import { User } from '../context/AuthContext';

/**
 * Checks if the user is the platform owner ("Amit Tyagi").
 * The owner has unrestricted permissions to delete any property, manage/delete any account, etc.
 */
export const isAppOwner = (user: { username?: string; contact?: string; email?: string; role?: string; isOwner?: boolean } | null | undefined): boolean => {
  if (!user) return false;
  const username = (user.username || '').trim().toLowerCase();
  const contact = (user.contact || user.email || '').trim().toLowerCase();
  return (
    username === 'amit tyagi' ||
    username === 'amit1986.delhi' ||
    contact === 'amit1986.delhi@gmail.com' ||
    Boolean(user.isOwner) ||
    user.role === 'owner' ||
    user.role === 'admin'
  );
};

/**
 * Normalizes phone numbers to standard 10 digits for accurate comparison.
 */
export const normalizePhone = (num?: string): string => {
  if (!num) return '';
  const digits = num.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/**
 * Records a newly created/uploaded property ID in current session and local storage
 * so the author can immediately edit and manage it without waiting for auth sync.
 */
export const recordUploadedPropertyId = (id: string): void => {
  if (!id || typeof window === 'undefined') return;
  try {
    const sessionList: string[] = JSON.parse(sessionStorage.getItem('ukg_session_uploaded_ids') || '[]');
    if (!sessionList.includes(id)) {
      sessionList.push(id);
      sessionStorage.setItem('ukg_session_uploaded_ids', JSON.stringify(sessionList));
    }
  } catch {}

  try {
    const localList: string[] = JSON.parse(localStorage.getItem('ukg_local_uploaded_ids') || '[]');
    if (!localList.includes(id)) {
      localList.push(id);
      localStorage.setItem('ukg_local_uploaded_ids', JSON.stringify(localList));
    }
  } catch {}
};

/**
 * Removes a deleted property ID from uploaded registries.
 */
export const unrecordUploadedPropertyId = (id: string): void => {
  if (!id || typeof window === 'undefined') return;
  try {
    const sessionList: string[] = JSON.parse(sessionStorage.getItem('ukg_session_uploaded_ids') || '[]');
    sessionStorage.setItem('ukg_session_uploaded_ids', JSON.stringify(sessionList.filter((item) => item !== id)));
  } catch {}

  try {
    const localList: string[] = JSON.parse(localStorage.getItem('ukg_local_uploaded_ids') || '[]');
    localStorage.setItem('ukg_local_uploaded_ids', JSON.stringify(localList.filter((item) => item !== id)));
  } catch {}
};

/**
 * Checks if the currently authenticated user is the legitimate owner of the given property listing,
 * or is the platform owner ("Amit Tyagi"), or created it in the current browser session.
 * Protects other users' properties against unauthorized modification or deletion.
 */
export const isPropertyOwner = (property?: Property | null, currentUser?: User | null): boolean => {
  if (!property) return false;

  // 1. Platform owner ("Amit Tyagi" / admin) always has full management permissions
  if (isAppOwner(currentUser)) {
    return true;
  }

  // 2. Allow managing sample, demo, fake, or system properties in app
  const pid = String(property.id || '').toLowerCase();
  const pOwner = String(property.ownerId || '').toLowerCase();
  if (
    !pOwner ||
    pOwner === 'system' ||
    pOwner === 'admin' ||
    pOwner.startsWith('sample') ||
    pOwner.startsWith('demo') ||
    pOwner.startsWith('fake') ||
    pid.startsWith('sample') ||
    pid.startsWith('demo') ||
    pid.startsWith('fake') ||
    Boolean(property.isSample) ||
    Boolean(property.isFake)
  ) {
    return true;
  }

  // 2. Check if the property was created/uploaded in the current browser session/device
  if (typeof window !== 'undefined') {
    try {
      const sessionList: string[] = JSON.parse(sessionStorage.getItem('ukg_session_uploaded_ids') || '[]');
      if (sessionList.includes(property.id)) return true;
    } catch {}

    try {
      const localList: string[] = JSON.parse(localStorage.getItem('ukg_local_uploaded_ids') || '[]');
      if (localList.includes(property.id)) return true;
    } catch {}
  }

  // If no user is logged in and not authored in this session, visitor is NOT owner
  if (!currentUser) return false;

  const currentUserId = (currentUser.id || '').trim();
  const currentContact = (currentUser.contact || currentUser.email || '').trim().toLowerCase();
  const currentUsername = (currentUser.username || '').trim().toLowerCase();

  // 3. Match by ownerId
  if (currentUserId && property.ownerId && property.ownerId === currentUserId) {
    return true;
  }

  // 4. Match by phone or email
  const propContact = (property.ownerContact || property.sellerEmail || property.sellerPhone || '').trim().toLowerCase();
  if (currentContact && propContact) {
    if (propContact === currentContact) return true;
    const normCurrent = normalizePhone(currentContact);
    const normProp = normalizePhone(propContact);
    if (normCurrent && normProp && normCurrent === normProp) return true;
  }

  // 5. Match by username or sellerName
  const propUsername = (property.ownerUsername || property.sellerName || '').trim().toLowerCase();
  if (currentUsername && propUsername && propUsername === currentUsername) {
    return true;
  }

  return false;
};

/**
 * Resolves the display username/name for a property's owner or broker.
 * Prioritizes the actual owner's username over email handles or generic strings.
 */
export const getPropertyOwnerDisplayName = (
  property?: Property | null,
  currentUser?: User | null,
  isHindi: boolean = false
): string => {
  if (!property) return '';

  const isBroker = property.sellerType === 'Broker';

  // If currentUser owns this property and has a username, show currentUser.username
  if (currentUser && currentUser.username && !isBroker) {
    if (isPropertyOwner(property, currentUser)) {
      return currentUser.username;
    }
  }

  const rawOwner = (property.ownerUsername || '').trim();
  const rawSeller = (property.sellerName || '').trim();
  const rawContact = (property.ownerContact || property.sellerEmail || '').trim().toLowerCase();

  // Known platform owner check: Amit Tyagi
  if (
    rawContact === 'amit1986.delhi@gmail.com' ||
    rawOwner.toLowerCase() === 'amit1986.delhi' ||
    rawSeller.toLowerCase() === 'amit1986.delhi' ||
    rawOwner.toLowerCase() === 'amit tyagi' ||
    rawSeller.toLowerCase() === 'amit tyagi'
  ) {
    return 'Amit Tyagi';
  }

  let chosen = isBroker
    ? (rawSeller || rawOwner)
    : (rawOwner || rawSeller);

  if (!chosen) {
    return isBroker
      ? (isHindi ? 'वेरिफाइड ब्रोकर' : 'Verified Broker')
      : (isHindi ? 'सीधे संपत्ति मालिक' : 'Direct Owner');
  }

  if (chosen.includes('@')) {
    chosen = chosen.split('@')[0];
  }

  if (chosen.toLowerCase() === 'amit1986.delhi') {
    return 'Amit Tyagi';
  }

  return chosen;
};

/**
 * Deletes all properties owned by an account when that account is deleted.
 */
export const deletePropertiesForAccount = (account: { id?: string; username?: string; contact?: string }): Property[] => {
  try {
    const raw = localStorage.getItem('uk_gateways_uploaded_properties');
    if (!raw) return [];
    const list: Property[] = JSON.parse(raw);
    const targetId = account.id;
    const targetUser = (account.username || '').trim().toLowerCase();
    const targetContact = (account.contact || '').trim().toLowerCase();

    const remaining = list.filter((p) => {
      if (targetId && p.ownerId === targetId) return false;
      if (targetUser && p.ownerUsername && p.ownerUsername.trim().toLowerCase() === targetUser) return false;
      if (targetUser && p.sellerName && p.sellerName.trim().toLowerCase() === targetUser) return false;
      if (targetContact && p.ownerContact && p.ownerContact.trim().toLowerCase() === targetContact) return false;
      if (targetContact && p.sellerEmail && p.sellerEmail.trim().toLowerCase() === targetContact) return false;
      return true;
    });

    localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent('uk_gateways_properties_updated', { detail: remaining }));
    return remaining;
  } catch (err) {
    console.error('[UKG] Failed to delete properties for account:', err);
    return [];
  }
};
