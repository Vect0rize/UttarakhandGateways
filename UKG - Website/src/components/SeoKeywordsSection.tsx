import React from 'react';
import type { AppPageRouteKey } from '../data/seoMetadata';

export interface SeoKeywordsSectionProps {
  onNavigatePage?: (page: AppPageRouteKey) => void;
  onNavigateCity?: (city: string) => void;
  onNavigatePath?: (path: string) => void;
  compact?: boolean;
}

export const SeoKeywordsSection: React.FC<SeoKeywordsSectionProps> = () => {
  return null;
};
