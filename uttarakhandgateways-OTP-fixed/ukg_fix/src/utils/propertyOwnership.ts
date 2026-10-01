import { Property } from '../types';
import { User } from '../context/AuthContext';

/**
 * Checks if the currently authenticated user is the legitimate owner of the given property listing.
 */
export const isPropertyOwner = (property: Property, currentUser: User | null): boolean => {
  if (!currentUser) return false;

  // 1. Direct owner ID match
  if (property.ownerId && property.ownerId === currentUser.id) {
    return true;
  }

  // 2. Direct owner contact match (email or mobile)
  if (property.ownerContact && property.ownerContact.trim().toLowerCase() === currentUser.contact.trim().toLowerCase()) {
    return true;
  }

  // 3. Direct owner username match
  if (property.ownerUsername && property.ownerUsername.trim().toLowerCase() === currentUser.username.trim().toLowerCase()) {
    return true;
  }

  // 4. Seller Email match
  if (property.sellerEmail && property.sellerEmail.trim().toLowerCase() === currentUser.contact.trim().toLowerCase()) {
    return true;
  }

  // 5. Seller Phone comparison (strip non-digits)
  if (property.sellerPhone) {
    const userDigits = currentUser.contact.replace(/\D/g, '');
    const sellerDigits = property.sellerPhone.replace(/\D/g, '');
    if (userDigits.length >= 10 && sellerDigits.length >= 10 && (userDigits.includes(sellerDigits) || sellerDigits.includes(userDigits))) {
      return true;
    }
  }

  // 6. Seller name match with current user's username
  if (property.sellerName && property.sellerName.trim().toLowerCase() === currentUser.username.trim().toLowerCase()) {
    return true;
  }

  return false;
};
