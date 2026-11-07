import React from 'react';
import { Property } from '../types';
import { UnifiedListingModal } from './UnifiedListingModal';

interface ListRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRentalUploaded: (property: Property) => void;
  onOpenLegalPolicy?: (tab: string) => void;
}

export const ListRentalModal: React.FC<ListRentalModalProps> = ({
  isOpen,
  onClose,
  onRentalUploaded,
  onOpenLegalPolicy,
}) => {
  return (
    <UnifiedListingModal
      isOpen={isOpen}
      onClose={onClose}
      mode="create-rent"
      onPropertySaved={onRentalUploaded}
      onOpenLegalPolicy={onOpenLegalPolicy}
    />
  );
};
