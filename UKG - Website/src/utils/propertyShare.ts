import { Property } from '../types';

export function slugify(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getPropertySlug(
  property: Pick<Property, 'id' | 'title' | 'city' | 'type' | 'purpose'>
): string {
  const baseTitle = property.title || `${property.type || 'Property'} in ${property.city || 'Uttarakhand'}`;
  const titlePart = slugify(baseTitle).slice(0, 72).replace(/-+$/g, '');
  const idPart = String(property.id || '').trim();
  if (!titlePart) return encodeURIComponent(idPart);
  return `${titlePart}-${encodeURIComponent(idPart)}`;
}

export function getPropertySlugPath(
  property: Pick<Property, 'id' | 'title' | 'city' | 'type' | 'purpose'>
): string {
  return `/property/${getPropertySlug(property)}`;
}

/**
 * Returns a globally accessible, valid, canonical URL for a property listing.
 * - On Native Android/Capacitor/Cordova: ALWAYS returns 'https://uttarakhandgateways.com/property/<slug>-<id>'
 * - On local development (localhost / 127.0.0.1 with port): uses local origin so developers can test locally
 * - On production web: uses 'https://uttarakhandgateways.com/property/<slug>-<id>'
 */
export function getPropertyShareUrl(property: Pick<Property, 'id' | 'title' | 'city' | 'type' | 'purpose'>): string {
  const slugPath = getPropertySlugPath(property);
  if (typeof window !== 'undefined') {
    const origin = (window.location.origin || '').trim().toLowerCase();
    // In Capacitor or local file wrappers, origin is capacitor://localhost, ionic://localhost, or file://
    if (origin.startsWith('capacitor://') || origin.startsWith('ionic://') || origin.startsWith('file://')) {
      return `https://uttarakhandgateways.com${slugPath}`;
    }
    // Development testing with localhost:PORT or 127.0.0.1:PORT
    if (origin.includes('localhost:') || origin.includes('127.0.0.1:')) {
      return `${window.location.origin}${slugPath}`;
    }
    // Web app on domain
    if (origin.includes('uttarakhandgateways.com')) {
      return `https://uttarakhandgateways.com${slugPath}`;
    }
  }
  return `https://uttarakhandgateways.com${slugPath}`;
}

export interface SharePropertyOptions {
  isHindi?: boolean;
  onCopied?: () => void;
}

/**
 * Universally shares a property listing without requiring user login.
 * Anyone can share any property listing at any time.
 * Uses Web Share API when supported, falling back to clipboard copy and WhatsApp.
 */
export async function sharePropertyListing(
  property: Property,
  options: SharePropertyOptions = {}
): Promise<{ success: boolean; method: 'native' | 'clipboard' | 'whatsapp' }> {
  const { isHindi = false, onCopied } = options;
  const shareUrl = getPropertyShareUrl(property);
  const locText = property.location || property.city || 'Uttarakhand';
  const shareTitle = property.title || 'Uttarakhand Property';

  const shareText = isHindi
    ? `🏡 *${shareTitle}*${property.priceDisplay ? ` (${property.priceDisplay})` : ''}\n📍 ${locText}, उत्तराखंड\n\n🔗 0% ब्रोकरेज पर यह प्रॉपर्टी देखें:\n${shareUrl}\n\n_उत्तराखंड गेटवेज़ (Uttarakhand Gateways)_`
    : `🏡 *${shareTitle}*${property.priceDisplay ? ` (${property.priceDisplay})` : ''}\n📍 ${locText}, Uttarakhand\n\n🔗 View Verified Property (0% Brokerage):\n${shareUrl}\n\n_Uttarakhand Gateways_`;

  // Track share interaction asynchronously on the server
  if (property.id) {
    try {
      fetch(`/api/properties/${encodeURIComponent(property.id)}/share`, { method: 'POST' }).catch(() => {});
    } catch {}
  }

  // 1. Try Web Share API (native share sheet on mobile & modern browsers)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return { success: true, method: 'native' };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { success: true, method: 'native' };
      }
    }
  }

  // 2. Always copy link to clipboard as a reliable fallback
  let copied = false;
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copied = true;
      if (onCopied) onCopied();
    } catch {}
  }

  // 3. WhatsApp fallback
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const encoded = encodeURIComponent(shareText);

  if (isMobile) {
    window.location.href = `whatsapp://send?text=${encoded}`;
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }

  return { success: true, method: copied ? 'clipboard' : 'whatsapp' };
}
