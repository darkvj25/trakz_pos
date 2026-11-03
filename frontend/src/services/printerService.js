import { generateReceiptEscPosBytes, generateTestEscPosBytes } from '../utils/escpos';
import { printElement } from '../utils/export';

const STORAGE_KEY = 'trakz_printer_config';

// Safe Capacitor runtime lookup without throwing Vite import errors if @capacitor/core isn't built yet
const getCapacitor = () => {
  if (typeof window !== 'undefined' && window.Capacitor) {
    return window.Capacitor;
  }
  return null;
};

const getNativeBluetoothPrinter = () => {
  const cap = getCapacitor();
  if (cap?.registerPlugin) {
    try {
      return cap.registerPlugin('BluetoothPrinter');
    } catch (e) {}
  }
  return cap?.Plugins?.BluetoothPrinter || null;
};

// Common thermal printer BLE service UUIDs
const BLE_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000e0ff-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '00001101-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000af00-0000-1000-8000-00805f9b34fb',
];

class PrinterService {
  constructor() {
    this.connectionType = 'browser'; // 'bluetooth' | 'native' | 'usb' | 'browser'
    this.paperWidth = '80mm'; // '80mm' | '58mm'
    this.autoPrint = true;

    this.bluetoothDevice = null;
    this.bluetoothCharacteristic = null;

    this.usbDevice = null;
    this.usbEndpointOut = null;
    this.usbInterfaceNumber = null;

    this.nativeMacAddress = null;
    this.nativeDeviceName = null;
    this.isNativeConnected = false;

    this.listeners = new Set();

    this.loadSavedConfig();
    this.autoConnect();
  }

  loadSavedConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.connectionType) this.connectionType = config.connectionType;
        if (config.paperWidth) this.paperWidth = config.paperWidth;
        if (typeof config.autoPrint === 'boolean') this.autoPrint = config.autoPrint;
        if (config.nativeMacAddress) this.nativeMacAddress = config.nativeMacAddress;
        if (config.nativeDeviceName) this.nativeDeviceName = config.nativeDeviceName;
        if (this.isCapacitorNative() && this.nativeMacAddress) {
          this.connectionType = 'native';
        }
      }
    } catch (e) {
      console.warn('Failed to load printer config from localStorage:', e);
    }
  }

  saveConfig() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          connectionType: this.connectionType,
          paperWidth: this.paperWidth,
          autoPrint: this.autoPrint,
          nativeMacAddress: this.nativeMacAddress,
          nativeDeviceName: this.nativeDeviceName,
          deviceName: this.getDeviceName(),
        })
      );
    } catch (e) {
      console.warn('Failed to save printer config to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach((fn) => fn(status));
  }

  isCapacitorNative() {
    const cap = getCapacitor();
    return !!(cap?.isNativePlatform && cap.isNativePlatform());
  }

  isBluetoothSupported() {
    return typeof window !== 'undefined' && ('bluetooth' in navigator || this.isCapacitorNative());
  }

  isUsbSupported() {
    return typeof window !== 'undefined' && 'usb' in navigator;
  }

  getDeviceName() {
    if (this.connectionType === 'native' || (this.connectionType === 'bluetooth' && this.isCapacitorNative())) {
      return this.nativeDeviceName || 'Native Android Bluetooth Printer';
    }
    if (this.connectionType === 'bluetooth' && this.bluetoothDevice) {
      return this.bluetoothDevice.name || 'Bluetooth POS Thermal Printer';
    }
    if (this.connectionType === 'usb' && this.usbDevice) {
      return this.usbDevice.productName || this.usbDevice.manufacturerName || 'Web USB Thermal Printer';
    }
    return null;
  }

  getStatus() {
    const isConnected =
      (this.isCapacitorNative() && (this.isNativeConnected || !!this.nativeMacAddress)) ||
      (this.connectionType === 'bluetooth' && !!this.bluetoothCharacteristic && !!this.bluetoothDevice?.gatt?.connected) ||
      (this.connectionType === 'usb' && !!this.usbDevice && this.usbDevice.opened);

    return {
      connectionType: this.connectionType,
      paperWidth: this.paperWidth,
      autoPrint: this.autoPrint,
      isNative: this.isCapacitorNative(),
      isConnected,
      deviceName: this.getDeviceName(),
      isBluetoothSupported: this.isBluetoothSupported(),
      isUsbSupported: this.isUsbSupported(),
    };
  }

  setPaperWidth(width) {
    this.paperWidth = width;
    this.saveConfig();
    this.notify();
  }

  setConnectionType(type) {
    this.connectionType = type;
    this.saveConfig();
    this.autoConnect();
    this.notify();
  }

  setAutoPrint(enabled) {
    this.autoPrint = enabled;
    this.saveConfig();
    this.notify();
  }

  /**
   * Native Capacitor Android Bluetooth Listing
   */
  async listNativePairedDevices() {
    if (!this.isCapacitorNative()) {
      return [];
    }
    try {
      const plugin = getNativeBluetoothPrinter();
      if (!plugin) return [];
      const res = await plugin.listPairedDevices();
      return res.devices || [];
    } catch (e) {
      console.warn('Native list paired devices error:', e);
      return [];
    }
  }

  /**
   * Native Capacitor Android Connect
   */
  async pairNativeBluetooth(address, deviceName) {
    if (!this.isCapacitorNative()) {
      throw new Error('Native Bluetooth plugin is only available on Android native app.');
    }
    try {
      const plugin = getNativeBluetoothPrinter();
      if (!plugin) throw new Error('BluetoothPrinter plugin not loaded on native platform.');

      const res = await plugin.connect({ address });
      this.nativeMacAddress = address;
      this.nativeDeviceName = deviceName || res.deviceName || address;
      this.isNativeConnected = true;
      this.connectionType = 'native';
      this.saveConfig();
      this.notify();
      return { success: true, deviceName: this.nativeDeviceName };
    } catch (err) {
      this.isNativeConnected = false;
      this.notify();
      throw err;
    }
  }

  /**
   * Automatically attempt auto-reconnecting to previously paired USB or Bluetooth printers
   */
  async autoConnect() {
    if (this.getStatus().isConnected) return true;

    // Native Capacitor Android Re-connect
    if (this.isCapacitorNative() && this.nativeMacAddress) {
      try {
        const plugin = getNativeBluetoothPrinter();
        if (plugin) {
          const check = await plugin.isConnected();
          if (check.isConnected) {
            this.isNativeConnected = true;
            this.notify();
            return true;
          }
          await plugin.connect({ address: this.nativeMacAddress });
          this.isNativeConnected = true;
          this.notify();
          return true;
        }
      } catch (e) {
        console.warn('Native Bluetooth auto-connect failed:', e);
      }
    }

    // Web USB Auto Connect
    if (this.connectionType === 'usb' && this.isUsbSupported()) {
      try {
        const devices = await navigator.usb.getDevices();
        if (devices && devices.length > 0) {
          const device = devices[0];
          await device.open();
          if (device.configuration === null) {
            await device.selectConfiguration(1);
          }

          let targetInterface = null;
          let targetEndpoint = null;

          for (const iface of device.configuration.interfaces) {
            for (const alt of iface.alternates) {
              const endpoint = alt.endpoints.find((ep) => ep.direction === 'out');
              if (endpoint) {
                targetInterface = iface;
                targetEndpoint = endpoint;
                break;
              }
            }
            if (targetEndpoint) break;
          }

          if (targetInterface && targetEndpoint) {
            await device.claimInterface(targetInterface.interfaceNumber);
            this.usbDevice = device;
            this.usbInterfaceNumber = targetInterface.interfaceNumber;
            this.usbEndpointOut = targetEndpoint.endpointNumber;
            this.notify();
            return true;
          }
        }
      } catch (e) {
        console.warn('Auto Web USB connection failed:', e);
      }
    }

    // Web Bluetooth Auto Connect
    if (this.connectionType === 'bluetooth' && this.isBluetoothSupported() && 'getDevices' in navigator.bluetooth) {
      try {
        const devices = await navigator.bluetooth.getDevices();
        if (devices && devices.length > 0) {
          const device = devices[0];
          this.bluetoothDevice = device;

          device.addEventListener('gattserverdisconnected', () => {
            this.bluetoothCharacteristic = null;
            this.notify();
          });

          const server = await device.gatt.connect();
          let characteristic = null;

          for (const serviceUuid of BLE_PRINTER_SERVICES) {
            try {
              const service = await server.getPrimaryService(serviceUuid);
              const characteristics = await service.getCharacteristics();
              characteristic = characteristics.find(
                (c) => c.properties.write || c.properties.writeWithoutResponse
              );
              if (characteristic) break;
            } catch (err) {}
          }

          if (characteristic) {
            this.bluetoothCharacteristic = characteristic;
            this.notify();
            return true;
          }
        }
      } catch (e) {
        console.warn('Auto Bluetooth connection failed:', e);
      }
    }

    return false;
  }

  /**
   * Helper to ensure active connection before sending ESC/POS commands
   */
  async ensureConnected() {
    if (this.getStatus().isConnected) return true;
    return await this.autoConnect();
  }

  /**
   * Web Bluetooth Pairing and Connection
   */
  async pairBluetooth() {
    if (this.isCapacitorNative()) {
      const paired = await this.listNativePairedDevices();
      if (paired && paired.length > 0) {
        return await this.pairNativeBluetooth(paired[0].address, paired[0].name);
      }
      throw new Error('No paired Bluetooth printers found in Android Bluetooth Settings.');
    }

    if (!this.isBluetoothSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser or context.');
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: BLE_PRINTER_SERVICES,
      });

      this.bluetoothDevice = device;

      device.addEventListener('gattserverdisconnected', () => {
        this.bluetoothCharacteristic = null;
        this.notify();
      });

      const server = await device.gatt.connect();
      let characteristic = null;

      for (const serviceUuid of BLE_PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          characteristic = characteristics.find(
            (c) => c.properties.write || c.properties.writeWithoutResponse
          );
          if (characteristic) break;
        } catch (err) {}
      }

      if (!characteristic) {
        try {
          const services = await server.getPrimaryServices();
          for (const service of services) {
            const characteristics = await service.getCharacteristics();
            characteristic = characteristics.find(
              (c) => c.properties.write || c.properties.writeWithoutResponse
            );
            if (characteristic) break;
          }
        } catch (err) {}
      }

      if (!characteristic) {
        throw new Error('Could not find a writable ESC/POS GATT characteristic on selected Bluetooth device.');
      }

      this.bluetoothCharacteristic = characteristic;
      this.connectionType = 'bluetooth';
      this.saveConfig();
      this.notify();

      return {
        success: true,
        deviceName: device.name || 'Bluetooth Printer',
      };
    } catch (error) {
      this.bluetoothCharacteristic = null;
      this.notify();
      throw error;
    }
  }

  /**
   * Web USB Pairing and Connection
   */
  async pairUsb() {
    if (!this.isUsbSupported()) {
      throw new Error('Web USB is not supported in this browser or context.');
    }

    try {
      const device = await navigator.usb.requestDevice({ filters: [] });
      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      let targetInterface = null;
      let targetEndpoint = null;

      for (const iface of device.configuration.interfaces) {
        for (const alt of iface.alternates) {
          const endpoint = alt.endpoints.find((ep) => ep.direction === 'out');
          if (endpoint) {
            targetInterface = iface;
            targetEndpoint = endpoint;
            break;
          }
        }
        if (targetEndpoint) break;
      }

      if (!targetInterface || !targetEndpoint) {
        throw new Error('Could not locate an OUT endpoint on the selected USB printer.');
      }

      await device.claimInterface(targetInterface.interfaceNumber);

      this.usbDevice = device;
      this.usbInterfaceNumber = targetInterface.interfaceNumber;
      this.usbEndpointOut = targetEndpoint.endpointNumber;
      this.connectionType = 'usb';

      this.saveConfig();
      this.notify();

      return {
        success: true,
        deviceName: device.productName || device.manufacturerName || 'Web USB Printer',
      };
    } catch (error) {
      this.usbDevice = null;
      this.usbEndpointOut = null;
      this.notify();
      if (error.name === 'SecurityError' || error.message?.includes('Access denied')) {
        throw new Error('Access Denied: Windows Printer Spooler/Driver is locking this USB device. Please select "Browser Standard" mode in settings.');
      }
      throw error;
    }
  }

  /**
   * Disconnect current paired printer
   */
  async disconnect() {
    if (this.isCapacitorNative()) {
      try {
        const plugin = getNativeBluetoothPrinter();
        if (plugin) await plugin.disconnect();
      } catch (e) {}
    }
    this.isNativeConnected = false;

    if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
      try {
        this.bluetoothDevice.gatt.disconnect();
      } catch (e) {}
    }
    this.bluetoothCharacteristic = null;
    this.bluetoothDevice = null;

    if (this.usbDevice && this.usbDevice.opened) {
      try {
        if (this.usbInterfaceNumber !== null) {
          await this.usbDevice.releaseInterface(this.usbInterfaceNumber);
        }
        await this.usbDevice.close();
      } catch (e) {}
    }
    this.usbDevice = null;
    this.usbEndpointOut = null;
    this.usbInterfaceNumber = null;

    this.notify();
  }

  /**
   * Write binary ESC/POS bytes to active printer
   */
  async writeBytes(bytes) {
    const isReady = await this.ensureConnected();

    // Native Capacitor Android Stream
    if (this.connectionType === 'native' || (this.isCapacitorNative() && this.connectionType === 'bluetooth')) {
      if (!this.nativeMacAddress) {
        throw new Error('Native Bluetooth printer is not paired. Please select and pair printer in Settings.');
      }
      const plugin = getNativeBluetoothPrinter();
      if (!plugin) {
        throw new Error('Native BluetoothPrinter plugin not available.');
      }
      // Convert Uint8Array bytes to Base64
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      await plugin.printEscPos({ base64Data, address: this.nativeMacAddress });
      this.isNativeConnected = true;
      this.notify();
      return true;
    }

    // Web Bluetooth Stream
    if (this.connectionType === 'bluetooth') {
      if (!isReady || !this.bluetoothCharacteristic || !this.bluetoothDevice?.gatt?.connected) {
        const reconnected = await this.autoConnect();
        if (!reconnected || !this.bluetoothCharacteristic) {
          throw new Error('Bluetooth printer is disconnected. Click "Printer Pairing" to re-connect GATT session.');
        }
      }

      const chunkSize = 100;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        if (this.bluetoothCharacteristic.writeValueWithoutResponse) {
          await this.bluetoothCharacteristic.writeValueWithoutResponse(chunk);
          await new Promise((res) => setTimeout(res, 20));
        } else if (this.bluetoothCharacteristic.writeValue) {
          await this.bluetoothCharacteristic.writeValue(chunk);
        } else if (this.bluetoothCharacteristic.writeValueWithResponse) {
          await this.bluetoothCharacteristic.writeValueWithResponse(chunk);
        }
      }
      return true;
    }

    // Web USB Stream
    if (this.connectionType === 'usb') {
      if (!isReady || !this.usbDevice || !this.usbDevice.opened) {
        throw new Error('Web USB printer is not connected. Please connect USB cable.');
      }
      await this.usbDevice.transferOut(this.usbEndpointOut, bytes);
      return true;
    }

    throw new Error('No Bluetooth or Web USB hardware printer selected.');
  }

  /**
   * Print an order receipt
   */
  async printOrder(order) {
    if (this.connectionType === 'browser') {
      printElement(`Invoice_${order?.externalOrderId}`, 'thermal-receipt-container');
      return { type: 'browser', success: true };
    }

    await this.ensureConnected();

    const escPosBytes = generateReceiptEscPosBytes(order, {
      paperWidth: this.paperWidth,
      openDrawer: true,
    });

    await this.writeBytes(escPosBytes);
    return { type: this.connectionType, success: true };
  }

  /**
   * Print test receipt
   */
  async printTestReceipt() {
    if (this.connectionType === 'browser') {
      printElement('Test_Receipt', 'thermal-receipt-container');
      return { type: 'browser', success: true };
    }

    await this.ensureConnected();

    const bytes = generateTestEscPosBytes({
      paperWidth: this.paperWidth,
      connectionType: this.connectionType.toUpperCase(),
    });

    await this.writeBytes(bytes);
    return { type: this.connectionType, success: true };
  }
}

export const printerService = new PrinterService();
