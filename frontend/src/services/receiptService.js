const STORAGE_KEY = 'trakz_receipt_config';

export const DEFAULT_RECEIPT_CONFIG = {
  storeName: 'MALAYBALAY SUPER FOODS CORP.',
  addressLine1: 'FORTICH STREET BARANGAY 3 POB.',
  addressLine2: 'CITY OF MALAYBALAY CAPITAL BUKIDNON',
  vatTin: '011-019-610-000',
  serialNo: 'GM183SJM',
  minNumber: '26032515372705917',
  headerTitle: 'SALES INVOICE',
  subHeaderTitle: 'CUSTOMER COPY',
  footerLine1: 'POWERED BY TRAKZ SOFTWARE DEVELOPMENT CORP.',
  footerLine2: 'THANK YOU AND PLEASE COME AGAIN!',
  customNotice: 'Items non-refundable after 7 days. Please present receipt for exchange.',
};

class ReceiptService {
  constructor() {
    this.listeners = new Set();
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_RECEIPT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load receipt config from localStorage:', e);
    }
    return { ...DEFAULT_RECEIPT_CONFIG };
  }

  getConfig() {
    return { ...this.config };
  }

  saveConfig(newConfig) {
    // BIR Tax & Machine Registration Info is system-locked per BIR regulations
    const protectedConfig = {
      ...newConfig,
      vatTin: DEFAULT_RECEIPT_CONFIG.vatTin,
      serialNo: DEFAULT_RECEIPT_CONFIG.serialNo,
      minNumber: DEFAULT_RECEIPT_CONFIG.minNumber,
    };
    this.config = { ...this.config, ...protectedConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Failed to save receipt config to localStorage:', e);
    }
    this.notify();
    return this.config;
  }

  resetToDefault() {
    this.config = { ...DEFAULT_RECEIPT_CONFIG };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    this.notify();
    return this.config;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const current = this.getConfig();
    this.listeners.forEach((fn) => fn(current));
  }
}

export const receiptService = new ReceiptService();
