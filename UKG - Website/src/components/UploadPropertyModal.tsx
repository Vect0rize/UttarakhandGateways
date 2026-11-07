import React from 'react';
import { Property } from '../types';
import { UnifiedListingModal } from './UnifiedListingModal';

interface UploadPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyUploaded: (property: Property) => void;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (time: number) => void;
  onOpenLegalPolicy?: (tab: string) => void;
  initialRole?: 'Owner' | 'Broker' | 'Verified Builder' | 'Agent';
}

export const UploadPropertyModal: React.FC<UploadPropertyModalProps> = ({
  isOpen,
  onClose,
  onPropertyUploaded,
  lastUploadTime,
  onUpdateLastUploadTime,
  onOpenLegalPolicy,
  initialRole = 'Owner',
}) => {
  return (
    <UnifiedListingModal
      isOpen={isOpen}
      onClose={onClose}
      mode="create-sale"
      onPropertySaved={onPropertyUploaded}
      lastUploadTime={lastUploadTime}
      onUpdateLastUploadTime={onUpdateLastUploadTime}
      onOpenLegalPolicy={onOpenLegalPolicy}
      initialRole={initialRole}
    />
  );
};
