export interface EnhanceMetadata {
  title?: string;
  language?: string;
}

/**
 * Polishes and structures the user's description text WITHOUT adding any
 * external facts, synthesized metadata, or unmentioned specifications.
 */
export function formatEnhancedDescription(
  rawDescription: string,
  meta?: EnhanceMetadata
): string {
  const clean = (rawDescription || '').trim();
  if (!clean) return clean;

  const isHindi = meta?.language === 'hi' || /[\u0900-\u097F]/.test(clean);

  // Helper to remove existing bullet characters and numbering
  const stripBullets = (s: string) => s.replace(/^[•\-\*▪►\d+\.\)]+\s*/, '').trim();

  // Split on newlines
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

  // If only one phrase exists, split on commas or connectors
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

  // Capitalize helper
  const capitalize = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // If user only provided a very brief 1-line note, polish and return it directly
  if (phrases.length <= 1) {
    const single = capitalize(stripBullets(clean));
    return single.endsWith('.') || single.endsWith('।') ? single : `${single}.`;
  }

  // Use the first user-provided sentence as opening overview
  const openingSentence = capitalize(stripBullets(phrases[0]));
  const detailPhrases = phrases.slice(1);

  const bullets: string[] = [];
  for (const phrase of detailPhrases) {
    const item = capitalize(stripBullets(phrase));
    if (item.length > 2 && !bullets.some(b => b.toLowerCase() === item.toLowerCase())) {
      bullets.push(item);
    }
  }

  if (bullets.length === 0) {
    return openingSentence;
  }

  const highlightsTitle = isHindi ? 'प्रमुख विवरण:' : 'Key Highlights:';
  return `${openingSentence}\n\n${highlightsTitle}\n${bullets.map(b => `• ${b}`).join('\n')}`;
}
