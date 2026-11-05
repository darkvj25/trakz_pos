import React from 'react';
import { Modal } from './Modal';
import { PrinterSettings } from '../settings/PrinterSettings';

export const PrinterPairingModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Printer Configuration" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <PrinterSettings />
      </div>
    </Modal>
  );
};
