import React from 'react';
import { Property } from '../types';
import { UnifiedListingModal } from './UnifiedListingModal';

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPropertyUpdated: (updatedProperty: Property) => void;
}

export const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  onPropertyUpdated,
}) => {
  return (
    <UnifiedListingModal
      isOpen={isOpen}
      onClose={onClose}
      mode="edit"
      property={property}
      onPropertySaved={onPropertyUpdated}
    />
  );
};
