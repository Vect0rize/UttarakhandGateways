import { Property } from '../types';
import { User } from '../context/AuthContext';

/**
 * Checks if the user is the platform owner ("Amit Tyagi").
 * The owner has unrestricted permissions to delete any property, manage/delete any account, etc.
 */
export const isAppOwner = (user: { username?: string; contact?: string; email?: string; role?: string; isOwner?: boolean } | null | undefined): boolean => {
  if (!user) return false;
  const contact = (user.contact || (user as any).email || '').trim().toLowerCase();
  return (
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
 * Checks if the currently authenticated user is the legitimate direct creator/owner of the given property listing.
 * Does NOT grant automatic ownership to platform owners (Amit Tyagi) so that other sellers' names and listings are not hijacked.
 */
export const isDirectPropertyOwner = (property?: Property | null, currentUser?: User | null): boolean => {
  if (!currentUser || !property) return false;

  // Platform admin known personal listings match
  if (isAppOwner(currentUser)) {
    const rawOwner = (property.ownerUsername || '').trim().toLowerCase();
    const rawSeller = (property.sellerName || '').trim().toLowerCase();
    const rawContact = (property.ownerContact || property.sellerEmail || '').trim().toLowerCase();
    if (
      rawContact === 'amit1986.delhi@gmail.com' ||
      rawContact === '7535981704' ||
      rawOwner === 'amit1986.delhi' ||
      rawOwner === 'amit tyagi' ||
      rawSeller === 'amit1986.delhi' ||
      rawSeller === 'amit tyagi'
    ) {
      return true;
    }
  }

  // 1. Direct owner ID match
  if (property.ownerId && property.ownerId === currentUser.id) {
    return true;
  }

  const userContact = (currentUser.contact || (currentUser as any).email || '').trim().toLowerCase();
  const userPhoneDigits = normalizePhone(currentUser.contact);
  const userUsername = (currentUser.username || '').trim().toLowerCase();

  // 2. Direct owner contact match (email or mobile)
  if (property.ownerContact) {
    const propOwnerContact = property.ownerContact.trim().toLowerCase();
    if (propOwnerContact === userContact) return true;
    const propOwnerDigits = normalizePhone(property.ownerContact);
    if (userPhoneDigits && propOwnerDigits && (userPhoneDigits === propOwnerDigits || userPhoneDigits.endsWith(propOwnerDigits) || propOwnerDigits.endsWith(userPhoneDigits))) {
      return true;
    }
  }

  // If listing already has explicit ownerId/contact identity, strictly require identity match (never match by display username alone to prevent spoofing)
  const hasExplicitOwnerIdentity = Boolean(property.ownerId || property.ownerContact || property.sellerEmail);

  // 3 & 6. Legacy fallback when no explicit owner ID/email exists
  if (!hasExplicitOwnerIdentity) {
    if (property.ownerUsername && property.ownerUsername.trim().toLowerCase() === userUsername) {
      return true;
    }
    if (property.sellerName && property.sellerName.trim().toLowerCase() === userUsername) {
      return true;
    }
  }

  // 4. Seller Email match
  if (property.sellerEmail && property.sellerEmail.trim().toLowerCase() === userContact) {
    return true;
  }

  // 5. Seller Phone comparison (strip non-digits & country prefix)
  if (property.sellerPhone) {
    const sellerDigits = normalizePhone(property.sellerPhone);
    if (userPhoneDigits.length >= 10 && sellerDigits.length >= 10 && (userPhoneDigits === sellerDigits || userPhoneDigits.endsWith(sellerDigits) || sellerDigits.endsWith(userPhoneDigits))) {
      return true;
    }
  }

  // 7. Check local/session uploaded registries
  if (typeof window !== 'undefined') {
    try {
      const sessionList: string[] = JSON.parse(sessionStorage.getItem('ukg_session_uploaded_ids') || '[]');
      if (sessionList.includes(property.id)) return true;
      const localList: string[] = JSON.parse(localStorage.getItem('ukg_local_uploaded_ids') || '[]');
      if (localList.includes(property.id)) return true;
    } catch {}
  }

  return false;
};

/**
 * Checks if the user can manage/edit/delete the property (either direct owner or platform admin Amit Tyagi).
 */
export const canManageProperty = (property?: Property | null, currentUser?: User | null): boolean => {
  if (!currentUser || !property) return false;
  if (isAppOwner(currentUser)) return true;
  return isDirectPropertyOwner(property, currentUser);
};

// Aliasing isPropertyOwner to isDirectPropertyOwner ensures that any component checking "isPropertyOwner"
// to filter user-owned listings or attribute listing ownership only attributes authentic listings created by this user.
export const isPropertyOwner = isDirectPropertyOwner;

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

  // 1. If currentUser is the DIRECT author/owner of this property, show their username
  if (currentUser && currentUser.username && !isBroker) {
    if (isDirectPropertyOwner(property, currentUser)) {
      return currentUser.username;
    }
  }

  // 2. Hide all fake / personal seller names (e.g. Sunil Joshi). Always show verified direct ownership badge.
  return isBroker
    ? (isHindi ? 'ब्रोकर' : 'Broker')
    : (isHindi ? 'सत्यापित डायरेक्ट ओनर' : 'Verified Direct Owner');
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
