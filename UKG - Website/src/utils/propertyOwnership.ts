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
 * Checks whether the current user has sent a contact/phone access request
 * for this property and the lister has APPROVED / ACCEPTED it.
 */
export const hasApprovedAccessRequest = (
  propertyId?: string | null,
  currentUser?: User | null
): boolean => {
  if (!propertyId || typeof window === 'undefined') return false;

  try {
    const raw = localStorage.getItem('uk_gateways_phone_requests');
    if (!raw) return false;
    const list: any[] = JSON.parse(raw);
    if (!Array.isArray(list)) return false;

    const userContact = (currentUser?.contact || (currentUser as any)?.email || '').trim().toLowerCase();
    const userUsername = (currentUser?.username || '').trim().toLowerCase();
    const userId = currentUser?.id;

    return list.some((req) => {
      if (req.propertyId !== propertyId) return false;
      if (req.status !== 'approved') return false;

      // Must be an outgoing request sent by this user (not an incoming request for their own listing)
      if (req.isIncomingForUserListing) return false;

      if (userId && req.requesterId && req.requesterId === userId) return true;
      if (userContact && req.requesterContact && req.requesterContact.trim().toLowerCase() === userContact) return true;
      if (userUsername && req.requesterName && req.requesterName.trim().toLowerCase() === userUsername) return true;

      // Fallback for requests created in current browser session
      if (!req.isIncomingForUserListing && req.status === 'approved') return true;

      return false;
    });
  } catch {
    return false;
  }
};

/**
 * Determines if the lister's real personal name and direct contact can be seen.
 * STRICT PRIVACY RULE: People should NOT be able to see the lister's name anywhere
 * UNLESS they send a request and the lister accepts it (or they are the lister/admin).
 */
export const isListerNameVisible = (
  property?: Property | null,
  currentUser?: User | null
): boolean => {
  if (!property) return false;
  if (currentUser && isDirectPropertyOwner(property, currentUser)) return true;
  if (currentUser && isAppOwner(currentUser)) return true;
  if ((property as any).isListerNameVisible === true) return true;
  return hasApprovedAccessRequest(property.id, currentUser);
};

const GENERIC_OWNER_PLACEHOLDERS = new Set([
  'direct property owner',
  'verified direct owner',
  'direct owner',
  'verified broker',
  'property owner',
  'property broker',
  'सत्यापित डायरेक्ट ओनर',
  'सीधे मालिक',
  'सत्यापित ब्रोकर',
]);

export const cleanRawOwnerName = (rawName?: string | null): string => {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (GENERIC_OWNER_PLACEHOLDERS.has(lower)) return '';
  if (lower === 'amit1986.delhi' || lower === 'amit1986.delhi@gmail.com') {
    return 'Amit Tyagi';
  }
  if (trimmed.includes('@')) {
    const localPart = trimmed.split('@')[0].replace(/[._-]+/g, ' ').trim();
    if (!localPart) return '';
    return localPart
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return trimmed;
};

/**
 * Partially masks an owner's full name for public display:
 * - Shows the first two words of the owner's name.
 * - Replaces everything after the first two words with "***".
 * - 1 or 2 words are displayed without masking.
 */
export const maskPublicOwnerName = (rawName?: string | null, fallback = 'Property Owner'): string => {
  if (rawName && rawName.includes('***')) {
    return rawName.trim();
  }
  const cleaned = cleanRawOwnerName(rawName);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fallback;
  if (words.length <= 2) return words.join(' ');
  return `${words[0]} ${words[1]} ***`;
};

/**
 * Formats genuine property view counts (never random or fabricated).
 */
export const formatPropertyViewsCount = (views?: number | null, isHindi: boolean = false): string => {
  const count = Math.max(0, Math.floor(Number(views) || 0));
  const formatted = count.toLocaleString('en-IN');
  return isHindi ? `${formatted} व्यूज` : `${formatted} ${count === 1 ? 'view' : 'views'}`;
};

/**
 * Returns a persistent visitor ID stored in localStorage for duplicate-view protection.
 */
export const getOrCreateVisitorId = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const existing = localStorage.getItem('ukg_visitor_id');
    if (existing && /^[a-zA-Z0-9_-]{8,80}$/.test(existing)) {
      return existing;
    }
    const generated = `vid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem('ukg_visitor_id', generated);
    return generated;
  } catch {
    return '';
  }
};

/**
 * Gets the verified, approved lister name if access has been granted.
 * Returns null if the user does NOT have approved access.
 */
export const getApprovedListerName = (
  property?: Property | null,
  currentUser?: User | null
): string | null => {
  if (!property) return null;
  if (!isListerNameVisible(property, currentUser)) return null;

  // 0. Platform Admin sees complete unmasked owner name
  if (currentUser && isAppOwner(currentUser)) {
    const full =
      cleanRawOwnerName((property as any).fullSellerName) ||
      cleanRawOwnerName(property.ownerUsername) ||
      cleanRawOwnerName(property.sellerName);
    if (full) return full;
  }

  // 1. Direct owner view
  if (currentUser && isDirectPropertyOwner(property, currentUser)) {
    return cleanRawOwnerName(currentUser.username) || cleanRawOwnerName(property.sellerName) || 'You (Owner)';
  }

  // 2. Check approved request record for stored lister name
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('uk_gateways_phone_requests');
      if (raw) {
        const list: any[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          const found = list.find((r) => r.propertyId === property.id && r.status === 'approved' && !r.isIncomingForUserListing);
          if (found && (found.sellerName || found.listerName)) {
            const cleaned = cleanRawOwnerName(found.sellerName || found.listerName);
            if (cleaned) return cleaned;
          }
        }
      }
    } catch {}
  }

  // 3. Fallback to property fullSellerName or sellerName if returned from authorized server response
  const authorizedName =
    cleanRawOwnerName((property as any).fullSellerName) ||
    cleanRawOwnerName(property.sellerName) ||
    cleanRawOwnerName(property.ownerUsername);
  if (authorizedName) {
    return authorizedName;
  }

  return 'Property Owner';
};

/**
 * Gets the verified, approved phone number if access has been granted.
 * Returns null if the user does NOT have approved access.
 */
export const getApprovedPhoneNumber = (
  property?: Property | null,
  currentUser?: User | null
): string | null => {
  if (!property) return null;
  if (!isListerNameVisible(property, currentUser)) return null;

  if (currentUser && isDirectPropertyOwner(property, currentUser) && currentUser.contact) {
    return property.sellerPhone || currentUser.contact;
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('uk_gateways_phone_requests');
      if (raw) {
        const list: any[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          const found = list.find((r) => r.propertyId === property.id && r.status === 'approved' && !r.isIncomingForUserListing);
          if (found && (found.sellerPhone || found.listerPhone)) {
            return found.sellerPhone || found.listerPhone;
          }
        }
      }
    } catch {}
  }

  if (property.sellerPhone && !property.sellerPhone.includes('••')) {
    return property.sellerPhone;
  }

  return null;
};

/**
 * Resolves the display name for a property's owner or broker:
 * - Admin & Direct Owner & Approved Requester: complete unmasked name.
 * - Public visitors: partially masked owner name (first two words + "***", or 1-2 words unmasked).
 * - Never returns "Verified Direct Owner" or "Direct Property Owner".
 */
export const getPropertyOwnerDisplayName = (
  property?: Property | null,
  currentUser?: User | null,
  isHindi: boolean = false
): string => {
  if (!property) return '';

  const isBroker = property.sellerType === 'Broker';

  // 1. Platform Administrator sees the complete unmasked owner name
  if (currentUser && isAppOwner(currentUser)) {
    const adminViewName =
      cleanRawOwnerName((property as any).fullSellerName) ||
      cleanRawOwnerName(property.ownerUsername) ||
      cleanRawOwnerName(property.sellerName);
    if (adminViewName) return adminViewName;
  }

  // 2. Direct author/owner of this property sees their full name
  if (currentUser && currentUser.username && !isBroker) {
    if (isDirectPropertyOwner(property, currentUser)) {
      return cleanRawOwnerName(currentUser.username) || currentUser.username;
    }
  }

  // 3. Approved contact access requester sees complete owner name
  if (isListerNameVisible(property, currentUser)) {
    const approved = getApprovedListerName(property, currentUser);
    if (approved) return approved;
  }

  // 4. Public display: partially masked owner name (first two words + "***")
  const fallback = isBroker
    ? (isHindi ? 'प्रॉपर्टी ब्रोकर' : 'Property Broker')
    : (isHindi ? 'प्रॉपर्टी मालिक' : 'Property Owner');

  return maskPublicOwnerName(property.sellerName || property.ownerUsername, fallback);
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
