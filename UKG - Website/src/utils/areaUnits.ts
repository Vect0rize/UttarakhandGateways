import { Property } from '../types';

export type AreaUnit =
  | 'sqft'
  | 'gaj'
  | 'nali'
  | 'mutthi'
  | 'bigha'
  | 'pbigha'
  | 'biswa'
  | 'acre'
  | 'hectare'
  | 'sqmeter'
  | 'guntha'
  | 'katha'
  | 'kanal'
  | 'marla';

export interface AreaUnitConfig {
  value: AreaUnit;
  labelEn: string;
  labelHi: string;
  shortEn: string;
  shortHi: string;
  toSqFt: number;
}

export const AREA_UNITS: AreaUnitConfig[] = [
  { value: 'sqft', labelEn: 'Sq.Ft', labelHi: 'वर्ग फुट (Sq.Ft)', shortEn: 'Sq.Ft', shortHi: 'वर्ग फुट', toSqFt: 1 },
  { value: 'gaj', labelEn: 'Gaj (Sq. Yards)', labelHi: 'गज (Gaj)', shortEn: 'Gaj', shortHi: 'गज', toSqFt: 9 },
  { value: 'nali', labelEn: 'Nali', labelHi: 'नाली (Nali)', shortEn: 'Nali', shortHi: 'नाली', toSqFt: 2160 },
  { value: 'mutthi', labelEn: 'Mutthi', labelHi: 'मुट्ठी (Mutthi)', shortEn: 'Mutthi', shortHi: 'मुट्ठी', toSqFt: 135 },
  { value: 'bigha', labelEn: 'UK Hill Bigha', labelHi: 'पहाड़ी बीघा', shortEn: 'UK Hill Bigha', shortHi: 'पहाड़ी बीघा', toSqFt: 8640 },
  { value: 'pbigha', labelEn: 'Plains Bigha', labelHi: 'मैदानी बीघा', shortEn: 'Plains Bigha', shortHi: 'मैदानी बीघा', toSqFt: 27000 },
  { value: 'biswa', labelEn: 'Biswa', labelHi: 'बिस्वा (Biswa)', shortEn: 'Biswa', shortHi: 'बिस्वा', toSqFt: 432 },
  { value: 'acre', labelEn: 'Acre', labelHi: 'एकड़ (Acre)', shortEn: 'Acre', shortHi: 'एकड़', toSqFt: 43560 },
  { value: 'hectare', labelEn: 'Hectare', labelHi: 'हेक्टेयर (Hectare)', shortEn: 'Hectare', shortHi: 'हेक्टेयर', toSqFt: 107639 },
  { value: 'sqmeter', labelEn: 'Sq.Meter', labelHi: 'वर्ग मीटर (Sq.Meter)', shortEn: 'Sq.Meter', shortHi: 'वर्ग मीटर', toSqFt: 10.7639 },
  { value: 'guntha', labelEn: 'Guntha', labelHi: 'गुंठा (Guntha)', shortEn: 'Guntha', shortHi: 'गुंठा', toSqFt: 1089 },
  { value: 'katha', labelEn: 'Katha', labelHi: 'कट्ठा (Katha)', shortEn: 'Katha', shortHi: 'कट्ठा', toSqFt: 1361 },
  { value: 'kanal', labelEn: 'Kanal', labelHi: 'कनाल (Kanal)', shortEn: 'Kanal', shortHi: 'कनाल', toSqFt: 5445 },
  { value: 'marla', labelEn: 'Marla', labelHi: 'मरला (Marla)', shortEn: 'Marla', shortHi: 'मरला', toSqFt: 272.25 },
];

/**
 * Checks whether a property type or category string represents Land/Plot.
 */
export function isLandOrPlotType(type?: string | null): boolean {
  if (!type) return false;
  const normalized = type.trim().toLowerCase();
  return (
    normalized === 'plot' ||
    normalized === 'land' ||
    normalized === 'land/plot' ||
    normalized.includes('plot') ||
    normalized.includes('land')
  );
}

/**
 * Checks whether a Property object is a Land/Plot listing.
 */
export function isLandOrPlotProperty(property?: Pick<Property, 'type' | 'configuration'> | null): boolean {
  if (!property) return false;
  return isLandOrPlotType(property.type);
}

/**
 * Normalizes any saved unit string or key to a valid AreaUnit key for form selects.
 */
export function normalizeAreaUnit(unit?: string | null): AreaUnit {
  if (!unit) return 'sqft';
  const raw = unit.trim().toLowerCase();

  const exactMatch = AREA_UNITS.find((u) => u.value === raw);
  if (exactMatch) return exactMatch.value;

  if (raw.includes('gaj') || raw.includes('yard') || raw.includes('sq. yard') || raw.includes('sq yard')) return 'gaj';
  if (raw.includes('nali')) return 'nali';
  if (raw.includes('mutthi')) return 'mutthi';
  if (raw.includes('pbigha') || raw.includes('plains bigha') || raw === 'plains') return 'pbigha';
  if (raw.includes('bigha') || raw === 'uk') return 'bigha';
  if (raw.includes('biswa')) return 'biswa';
  if (raw.includes('acre')) return 'acre';
  if (raw.includes('hectare')) return 'hectare';
  if (raw.includes('meter') || raw.includes('sq.m') || raw.includes('sqm')) return 'sqmeter';
  if (raw.includes('guntha')) return 'guntha';
  if (raw.includes('katha')) return 'katha';
  if (raw.includes('kanal')) return 'kanal';
  if (raw.includes('marla')) return 'marla';
  if (raw.includes('sq.ft') || raw.includes('sqft') || raw.includes('sq. ft') || raw.includes('square feet')) return 'sqft';

  return 'sqft';
}

export function getAreaUnitConfig(unit?: string | null): AreaUnitConfig {
  const key = normalizeAreaUnit(unit);
  return AREA_UNITS.find((u) => u.value === key) || AREA_UNITS[0];
}

/**
 * Returns the display label for a saved unit.
 * If `unit` is a canonical key (e.g. 'gaj', 'nali', 'sqft'), returns its short label.
 * If `unit` was stored as a custom readable label (e.g. 'Sq. Yards'), preserves it in English.
 */
export function getAreaUnitShortLabel(unit?: string | null, isHindi = false): string {
  if (!unit || !unit.trim()) {
    return isHindi ? 'वर्ग फुट' : 'Sq.Ft';
  }
  const trimmed = unit.trim();
  const exactKeyMatch = AREA_UNITS.find((u) => u.value === trimmed.toLowerCase());
  if (exactKeyMatch) {
    return isHindi ? exactKeyMatch.shortHi : exactKeyMatch.shortEn;
  }

  // Handle legacy split(' ')[0] artifacts from older code ('UK' -> 'UK Hill Bigha', 'Plains' -> 'Plains Bigha')
  if (trimmed === 'UK') return isHindi ? 'पहाड़ी बीघा' : 'UK Hill Bigha';
  if (trimmed === 'Plains') return isHindi ? 'मैदानी बीघा' : 'Plains Bigha';

  if (isHindi) {
    return getAreaUnitConfig(trimmed).shortHi;
  }

  return trimmed;
}

/**
 * Extracts the owner's entered numeric area value and unit key from a Property record.
 * Handles both new listings (with `areaValue`) and legacy listings safely without double-conversion.
 */
export function getPropertyAreaInput(property?: Partial<Property> | null): {
  areaValue: number;
  areaUnit: AreaUnit;
  rawUnitLabel: string;
} {
  if (!property) {
    return { areaValue: 0, areaUnit: 'sqft', rawUnitLabel: 'Sq.Ft' };
  }

  const hasSavedUnit = Boolean(property.areaUnit && property.areaUnit.trim());
  const normalizedUnit = hasSavedUnit ? normalizeAreaUnit(property.areaUnit) : 'sqft';
  const unitConfig = getAreaUnitConfig(normalizedUnit);
  const rawUnitLabel = hasSavedUnit ? getAreaUnitShortLabel(property.areaUnit, false) : 'Sq.Ft';

  // 1. Direct numeric areaValue if saved on property
  if (typeof property.areaValue === 'number' && !isNaN(property.areaValue) && property.areaValue > 0) {
    return {
      areaValue: property.areaValue,
      areaUnit: normalizedUnit,
      rawUnitLabel,
    };
  }

  // 2. Check legacy areaDisplay with parenthetical e.g. "1,350 sq.ft (150 Gaj)"
  const display = (property.areaDisplay || '').trim();
  if (display && normalizedUnit !== 'sqft') {
    const parenMatch = display.match(/\(\s*([0-9.,]+)\s+[^)]+\)/);
    if (parenMatch && parenMatch[1]) {
      const parsedParen = parseFloat(parenMatch[1].replace(/,/g, ''));
      if (!isNaN(parsedParen) && parsedParen > 0) {
        return {
          areaValue: parsedParen,
          areaUnit: normalizedUnit,
          rawUnitLabel,
        };
      }
    }
  }

  // 3. Check if areaDisplay already starts with the value in the selected unit (e.g. "150 Gaj")
  if (display && (!/sq\.?\s*ft/i.test(display) || normalizedUnit === 'sqft')) {
    const leadingMatch = display.match(/^([0-9.,]+)/);
    if (leadingMatch && leadingMatch[1]) {
      const parsedLeading = parseFloat(leadingMatch[1].replace(/,/g, ''));
      if (!isNaN(parsedLeading) && parsedLeading > 0) {
        return {
          areaValue: parsedLeading,
          areaUnit: normalizedUnit,
          rawUnitLabel,
        };
      }
    }
  }

  // 4. Fallback to areaSqFt (converting back if a non-sqft unit was saved)
  if (typeof property.areaSqFt === 'number' && !isNaN(property.areaSqFt) && property.areaSqFt > 0) {
    if (normalizedUnit !== 'sqft' && unitConfig.toSqFt > 0) {
      const converted = Number((property.areaSqFt / unitConfig.toSqFt).toFixed(2));
      return {
        areaValue: converted,
        areaUnit: normalizedUnit,
        rawUnitLabel,
      };
    }
    return {
      areaValue: property.areaSqFt,
      areaUnit: normalizedUnit,
      rawUnitLabel,
    };
  }

  return { areaValue: 0, areaUnit: normalizedUnit, rawUnitLabel };
}

/**
 * Formats a numeric area value and unit into a clean display string (e.g. "150 Gaj").
 */
export function formatAreaValueWithUnit(
  areaValue: number,
  unit?: string | null,
  isHindi = false
): string {
  if (!areaValue || isNaN(areaValue) || areaValue <= 0) return '';
  const unitLabel = getAreaUnitShortLabel(unit, isHindi);
  return `${areaValue.toLocaleString('en-IN')} ${unitLabel}`;
}

/**
 * Formats a property's area for display on cards, details pages, and modals.
 * Always uses the owner's saved unit and never relabels a non-sqft unit as square feet.
 */
export function formatPropertyArea(property?: Partial<Property> | null, isHindi = false): string {
  if (!property) return '';

  const hasSavedUnit = Boolean(property.areaUnit && property.areaUnit.trim());

  if (hasSavedUnit) {
    const { areaValue } = getPropertyAreaInput(property);
    if (areaValue > 0) {
      return formatAreaValueWithUnit(areaValue, property.areaUnit, isHindi);
    }
  }

  // Legacy fallback when no areaUnit was saved on an older listing
  const display = (property.areaDisplay || '').trim();
  if (display) {
    return isHindi ? display.replace(/sq\.ft/gi, 'वर्ग फुट') : display;
  }

  if (typeof property.areaSqFt === 'number' && property.areaSqFt > 0) {
    return `${property.areaSqFt.toLocaleString('en-IN')} ${isHindi ? 'वर्ग फुट' : 'Sq.Ft'}`;
  }

  return '';
}

/**
 * Formats the property's rate per unit for display, ensuring non-sqft listings
 * display their rate in the selected unit rather than sq.ft.
 */
export function formatPropertyRate(property?: Partial<Property> | null, isHindi = false): string | undefined {
  if (!property) return undefined;
  const hasSavedUnit = Boolean(property.areaUnit && property.areaUnit.trim());
  const normalizedUnit = hasSavedUnit ? normalizeAreaUnit(property.areaUnit) : 'sqft';

  if (normalizedUnit !== 'sqft') {
    if (property.ratePerGajOrNali) {
      return property.ratePerGajOrNali;
    }
    const { areaValue } = getPropertyAreaInput(property);
    if (areaValue > 0 && typeof property.price === 'number' && property.price > 0) {
      const rate = Math.round(property.price / areaValue);
      const unitLabel = getAreaUnitShortLabel(property.areaUnit, isHindi);
      return `₹${rate.toLocaleString('en-IN')} / ${unitLabel}`;
    }
    return undefined;
  }

  if (property.ratePerSqFt) {
    return isHindi
      ? property.ratePerSqFt.replace(/sq\.ft/gi, 'वर्ग फुट')
      : property.ratePerSqFt;
  }

  return property.ratePerGajOrNali || undefined;
}
