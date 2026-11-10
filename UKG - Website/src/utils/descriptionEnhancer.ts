export interface EnhanceMetadata {
  title?: string;
  location?: string;
  city?: string;
  propertyType?: string;
  amenities?: string[];
  language?: string;
}

export function formatEnhancedDescription(
  rawDescription: string,
  meta?: EnhanceMetadata
): string {
  const clean = (rawDescription || '').trim();
  if (!clean) return clean;

  const isHindi = meta?.language === 'hi' || /[\u0900-\u097F]/.test(clean);

  // Helper to remove existing bullet characters and numbering
  const stripBullets = (s: string) => s.replace(/^[•\-\*▪►\d+\.\)]+\s*/, '').trim();

  // Split on newlines, periods with space, or semicolons
  const lines = clean.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  let phrases: string[] = [];

  for (const line of lines) {
    const stripped = stripBullets(line);
    if (!stripped) continue;

    // Check if line contains multiple sentences
    const subParts = stripped.split(/(?<=[.?!;])\s+/).map(stripBullets).filter(Boolean);
    if (subParts.length > 1) {
      phrases.push(...subParts);
    } else {
      phrases.push(stripped);
    }
  }

  // If we only have one sentence/phrase, check for commas or common connectors
  if (phrases.length <= 1) {
    const commaParts = clean.split(/[,،]+/).map(stripBullets).filter(Boolean);
    if (commaParts.length > 1) {
      phrases = commaParts;
    } else {
      const connectorParts = clean
        .split(/\s+(?:with|having|near|close to|featuring|including|and)\s+/i)
        .map(stripBullets)
        .filter(Boolean);
      if (connectorParts.length > 1) {
        phrases = connectorParts;
      }
    }
  }

  // Helper to capitalize first letter
  const capitalize = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Determine Headline / Title
  let headline = '';
  if (meta?.title && meta.title.trim().length > 3) {
    headline = meta.title.trim();
  } else if (phrases.length > 0) {
    headline = capitalize(phrases[0]);
  } else {
    headline = capitalize(clean);
  }

  headline = stripBullets(headline);

  // Collect structured highlights
  const bullets: string[] = [];

  // 1. Property Type
  if (meta?.propertyType && meta.propertyType !== 'All' && meta.propertyType !== 'All Types') {
    if (!headline.toLowerCase().includes(meta.propertyType.toLowerCase())) {
      bullets.push(isHindi ? `प्रॉपर्टी प्रकार: ${meta.propertyType}` : `Property Type: ${meta.propertyType}`);
    }
  }

  // 2. Location & Surroundings
  const locArr = [meta?.location, meta?.city].filter(Boolean);
  if (locArr.length > 0) {
    const locStr = locArr.join(', ');
    if (!headline.toLowerCase().includes(locStr.toLowerCase())) {
      bullets.push(isHindi ? `स्थान: ${locStr}` : `Prime Location: ${locStr}`);
    }
  }

  // 3. User details as bullet points
  const detailPhrases = phrases.length > 1 ? phrases.slice(1) : phrases;
  for (const phrase of detailPhrases) {
    const cap = capitalize(phrase);
    if (
      cap.length > 2 &&
      cap.toLowerCase() !== headline.toLowerCase() &&
      !bullets.some(b => b.toLowerCase().includes(cap.toLowerCase()))
    ) {
      bullets.push(cap);
    }
  }

  // 4. Amenities
  if (Array.isArray(meta?.amenities) && meta.amenities.length > 0) {
    const amSlice = meta.amenities.slice(0, 5).join(', ');
    if (amSlice) {
      bullets.push(isHindi ? `प्रमुख सुविधाएं: ${amSlice}` : `Key Amenities: ${amSlice}`);
    }
  }

  // Headers and Footers
  const highlightsTitle = isHindi ? 'मुख्य विशेषताएं:' : 'Key Highlights:';
  const overviewTitle = isHindi ? 'विवरण (Overview):' : 'Property Overview:';
  const footerNote = isHindi
    ? 'उत्तराखंड गेटवेज पर 0% ब्रोकरेज के साथ सत्यापित लिस्टिंग • सीधे मालिक से संपर्क करें।'
    : 'Verified listing on Uttarakhand Gateways • 0% Brokerage • Direct Contact.';

  // Build the enhanced content
  if (bullets.length > 0) {
    return `${headline}\n\n${highlightsTitle}\n${bullets.map(b => `• ${b}`).join('\n')}\n\n${footerNote}`;
  } else {
    return `${headline}\n\n${overviewTitle}\n${clean}\n\n${footerNote}`;
  }
}
