import React from 'react';
import { Modal } from './Modal';
import { PrinterSettings } from '../settings/PrinterSettings';

export const PrinterPairingModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt Printer & ESC/POS Setup" maxWidth="max-w-3xl">
      <div className="space-y-4">
        <PrinterSettings />
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
