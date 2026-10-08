import { Property } from '../types';
import { User } from '../context/AuthContext';

/**
 * Checks if the user is the platform owner ("Amit Tyagi").
 * The owner has unrestricted permissions to delete any property, manage/delete any account, etc.
 */
export const isAppOwner = (user: { username?: string } | null | undefined): boolean => {
  if (!user || !user.username) return false;
  return user.username.trim().toLowerCase() === 'amit tyagi';
};

const normalizePhone = (num?: string): string => {
  if (!num) return '';
  const digits = num.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/**
 * Checks if the currently authenticated user is the legitimate owner of the given property listing,
 * or is the platform owner ("Amit Tyagi").
 */
export const isPropertyOwner = (property: Property, currentUser: User | null): boolean => {
  if (!currentUser) return false;

  // Platform Owner ("Amit Tyagi") has owner access to all properties
  if (isAppOwner(currentUser)) {
    return true;
  }

  // 1. Direct owner ID match
  if (property.ownerId && property.ownerId === currentUser.id) {
    return true;
  }

  const userContact = (currentUser.contact || '').trim().toLowerCase();
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

  // 3. Direct owner username match
  if (property.ownerUsername && property.ownerUsername.trim().toLowerCase() === userUsername) {
    return true;
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

  // 6. Seller name match with current user's username
  if (property.sellerName && property.sellerName.trim().toLowerCase() === userUsername) {
    return true;
  }

  return false;
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
