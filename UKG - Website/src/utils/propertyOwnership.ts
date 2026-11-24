import { Property } from '../types';
import { User } from '../context/AuthContext';

/**
 * Checks if the user is a platform administrator.
 */
export const isAppOwner = (
  user: { username?: string; contact?: string; email?: string; role?: string; isOwner?: boolean } | null | undefined
): boolean => {
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
 * Normalizes phone numbers to standard 10 digits when Indian mobile format is detected.
 */
export const normalizePhone = (num?: string | null): string => {
  if (!num) return '';
  const digits = String(num).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/**
 * Extracts a genuine, lister-provided public phone number from a property record.
 * Never invents, guesses, or substitutes fallback phone numbers.
 */
export const getPublicPropertyPhone = (property?: Property | null): string | null => {
  if (!property) return null;
  const candidates = [property.sellerPhone, property.ownerContact];
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) continue;
    if (trimmed.includes('•') || trimmed.includes('*')) continue;
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) {
      return trimmed;
    }
  }
  return null;
};

/**
 * Formats a genuine phone number cleanly for UI display.
 */
export const formatPhoneForDisplay = (rawPhone?: string | null): string => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    const core = digits.slice(1);
    return `+91 ${core.slice(0, 5)} ${core.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const core = digits.slice(2);
    return `+91 ${core.slice(0, 5)} ${core.slice(5)}`;
  }
  return rawPhone.trim().startsWith('+') ? rawPhone.trim() : `+${digits}`;
};

/**
 * Builds a clickable `tel:` protocol URI from a genuine lister phone number.
 */
export const getTelHref = (rawPhone?: string | null): string | null => {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length === 10) return `tel:+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `tel:+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `tel:+${digits}`;
  return `tel:+${digits}`;
};

/**
 * Normalizes a genuine phone number into international digits required by https://wa.me/<number>.
 */
export const formatWhatsAppPhone = (rawPhone?: string | null): string | null => {
  if (!rawPhone) return null;
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 11 && !digits.startsWith('91')) return `91${digits.slice(-10)}`;
  return digits;
};

/**
 * Builds the default customizable prefilled WhatsApp inquiry message identifying the property.
 */
export const buildDefaultWhatsAppMessage = (
  property?: Pick<Property, 'title' | 'city' | 'location'> | null,
  isHindi: boolean = false
): string => {
  if (!property) {
    return isHindi
      ? 'नमस्ते, मैंने उत्तराखंड गेटवेज पर आपकी प्रॉपर्टी देखी और इसके बारे में अधिक जानकारी चाहता/चाहती हूँ।'
      : 'Hello, I found your property on Uttarakhand Gateways and would like to know more about it.';
  }
  const title = (property.title || '').trim();
  const loc = (property.location || property.city || 'Uttarakhand').trim();
  if (isHindi) {
    return title
      ? `नमस्ते, मैंने उत्तराखंड गेटवेज पर आपकी प्रॉपर्टी "${title}" (${loc}) देखी और इसके बारे में अधिक जानकारी चाहता/चाहती हूँ।`
      : 'नमस्ते, मैंने उत्तराखंड गेटवेज पर आपकी प्रॉपर्टी देखी और इसके बारे में अधिक जानकारी चाहता/चाहती हूँ।';
  }
  return title
    ? `Hello, I found your property "${title}" (${loc}) on Uttarakhand Gateways and would like to know more about it.`
    : 'Hello, I found your property on Uttarakhand Gateways and would like to know more about it.';
};

/**
 * Generates a dynamic WhatsApp deep link for the lister's actual phone number and message.
 */
export const getWhatsAppContactUrl = (
  phoneOrProperty?: string | Property | null,
  customMessage?: string
): string | null => {
  const isPropObj = Boolean(phoneOrProperty && typeof phoneOrProperty === 'object');
  const rawPhone = isPropObj
    ? getPublicPropertyPhone(phoneOrProperty as Property)
    : (phoneOrProperty as string | null | undefined);
  const waPhone = formatWhatsAppPhone(rawPhone);
  if (!waPhone) return null;
  const msg =
    typeof customMessage === 'string'
      ? customMessage.trim()
      : isPropObj
        ? buildDefaultWhatsAppMessage(phoneOrProperty as Property)
        : '';
  return msg
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/${waPhone}`;
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
 * Checks if the currently authenticated user is the direct creator/owner of the given property listing.
 */
export const isDirectPropertyOwner = (property?: Property | null, currentUser?: User | null): boolean => {
  if (!currentUser || !property) return false;

  if (property.ownerId && property.ownerId === currentUser.id) {
    return true;
  }

  const userContact = (currentUser.contact || (currentUser as any).email || '').trim().toLowerCase();
  const userPhoneDigits = normalizePhone(currentUser.contact);
  const userUsername = (currentUser.username || '').trim().toLowerCase();

  if (property.ownerContact) {
    const propOwnerContact = property.ownerContact.trim().toLowerCase();
    if (propOwnerContact === userContact) return true;
    const propOwnerDigits = normalizePhone(property.ownerContact);
    if (
      userPhoneDigits &&
      propOwnerDigits &&
      (userPhoneDigits === propOwnerDigits ||
        userPhoneDigits.endsWith(propOwnerDigits) ||
        propOwnerDigits.endsWith(userPhoneDigits))
    ) {
      return true;
    }
  }

  const hasExplicitOwnerIdentity = Boolean(property.ownerId || property.ownerContact || property.sellerEmail);

  if (!hasExplicitOwnerIdentity) {
    if (property.ownerUsername && property.ownerUsername.trim().toLowerCase() === userUsername) {
      return true;
    }
    if (property.sellerName && property.sellerName.trim().toLowerCase() === userUsername) {
      return true;
    }
  }

  if (property.sellerEmail && property.sellerEmail.trim().toLowerCase() === userContact) {
    return true;
  }

  if (property.sellerPhone) {
    const sellerDigits = normalizePhone(property.sellerPhone);
    if (
      userPhoneDigits.length >= 10 &&
      sellerDigits.length >= 10 &&
      (userPhoneDigits === sellerDigits ||
        userPhoneDigits.endsWith(sellerDigits) ||
        sellerDigits.endsWith(userPhoneDigits))
    ) {
      return true;
    }
  }

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
 * Checks if the user can manage/edit/delete the property (either direct owner or platform administrator).
 */
export const canManageProperty = (property?: Property | null, currentUser?: User | null): boolean => {
  if (!currentUser || !property) return false;
  if (isAppOwner(currentUser)) return true;
  return isDirectPropertyOwner(property, currentUser);
};

export const isPropertyOwner = isDirectPropertyOwner;

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
 * Partially masks a long full name for public display (first two words + "***").
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
 * Deterministic boosted view count strictly for public Property Cards.
 * Admin Control Panel and Listing Analysis always read 100% real `property.views`.
 */
export const getCardDisplayViews = (
  property?: Pick<Property, 'id' | 'views' | 'createdAt'> | null
): number => {
  const realViews = Math.max(0, Math.floor(Number(property?.views) || 0));
  const seed = String(property?.id || 'ukg-listing');
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const baseBoost = 48 + (Math.abs(hash) % 147); // Stable per-card boost between 48 and 194
  return realViews + baseBoost;
};

export const formatCardDisplayViewsCount = (
  property?: Pick<Property, 'id' | 'views' | 'createdAt'> | null,
  isHindi: boolean = false
): string => {
  const count = getCardDisplayViews(property);
  const formatted = count.toLocaleString('en-IN');
  return isHindi ? `${formatted} व्यूज` : `${formatted} views`;
};

/**
 * Formats optional property age in years ("How Old Is This Property?") for cards & detail pages.
 * Returns null when unknown / not set.
 */
export const formatPropertyAge = (
  ageYears?: number | string | null,
  isHindi: boolean = false
): string | null => {
  if (ageYears === undefined || ageYears === null || ageYears === '') return null;
  const parsed = Number(ageYears);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  const clean = Math.round(parsed * 10) / 10;
  if (clean === 0) {
    return isHindi ? 'नया निर्माण (0 वर्ष)' : 'New (0 yrs)';
  }
  if (clean === 1) {
    return isHindi ? '1 वर्ष पुरानी' : '1 yr old';
  }
  return isHindi ? `${clean} वर्ष पुरानी` : `${clean} yrs old`;
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
 * Resolves the display name for a property's owner or broker.
 */
export const getPropertyOwnerDisplayName = (
  property?: Property | null,
  currentUser?: User | null,
  isHindi: boolean = false
): string => {
  if (!property) return '';

  const isBroker = property.sellerType === 'Broker';

  if (currentUser && isAppOwner(currentUser)) {
    const adminViewName =
      cleanRawOwnerName((property as any).fullSellerName) ||
      cleanRawOwnerName(property.ownerUsername) ||
      cleanRawOwnerName(property.sellerName);
    if (adminViewName) return adminViewName;
  }

  if (currentUser && currentUser.username && !isBroker) {
    if (isDirectPropertyOwner(property, currentUser)) {
      return cleanRawOwnerName(currentUser.username) || currentUser.username;
    }
  }

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
