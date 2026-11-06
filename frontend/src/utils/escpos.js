import { receiptService } from '../services/receiptService';

/**
 * ESC/POS Command Encoder Utility for Thermal Printers
 * Generates raw ESC/POS byte arrays for Bluetooth and Web USB printing.
 */

// Command Bytes Constants
export const ESC_POS_COMMANDS = {
  INIT: [0x1B, 0x40],
  ALIGN_LEFT: [0x1B, 0x61, 0x00],
  ALIGN_CENTER: [0x1B, 0x61, 0x01],
  ALIGN_RIGHT: [0x1B, 0x61, 0x02],
  BOLD_ON: [0x1B, 0x45, 0x01],
  BOLD_OFF: [0x1B, 0x45, 0x00],
  UNDERLINE_ON: [0x1B, 0x2D, 0x01],
  UNDERLINE_OFF: [0x1B, 0x2D, 0x00],
  TEXT_SIZE_NORMAL: [0x1D, 0x21, 0x00],
  TEXT_SIZE_LARGE: [0x1D, 0x21, 0x11], // 2x width & 2x height
  TEXT_SIZE_WIDE: [0x1D, 0x21, 0x10],
  TEXT_SIZE_TALL: [0x1D, 0x21, 0x01],
  FEED_LINE: [0x0D, 0x0A], // CR LF for reliable buffer flush across thermal microcontrollers
  CUT_PAPER: [0x1D, 0x56, 0x42, 0x00], // GS V 66 0
  OPEN_DRAWER: [0x1B, 0x70, 0x00, 0x19, 0xFA],
};

/**
 * Text Encoder helper (UTF-8 to Uint8Array ASCII safe conversion)
 */
const encodeText = (text) => {
  const encoder = new TextEncoder();
  return encoder.encode(text);
};

/**
 * Align text with left and right components on a single line of fixed width
 */
const formatTwoColumn = (left, right, width = 48) => {
  const leftStr = String(left);
  const rightStr = String(right);
  const availableSpace = width - rightStr.length;

  if (leftStr.length >= availableSpace) {
    const truncatedLeft = leftStr.slice(0, availableSpace - 1);
    return truncatedLeft.padEnd(availableSpace, ' ') + rightStr;
  }
  return leftStr.padEnd(availableSpace, ' ') + rightStr;
};

/**
 * Builds a byte stream builder for ESC/POS commands
 */
export class EscPosBuilder {
  constructor() {
    this.buffer = [];
  }

  addBytes(bytes) {
    if (Array.isArray(bytes)) {
      this.buffer.push(...bytes);
    } else if (bytes instanceof Uint8Array) {
      this.buffer.push(...Array.from(bytes));
    }
    return this;
  }

  init() {
    return this.addBytes(ESC_POS_COMMANDS.INIT);
  }

  alignLeft() {
    return this.addBytes(ESC_POS_COMMANDS.ALIGN_LEFT);
  }

  alignCenter() {
    return this.addBytes(ESC_POS_COMMANDS.ALIGN_CENTER);
  }

  alignRight() {
    return this.addBytes(ESC_POS_COMMANDS.ALIGN_RIGHT);
  }

  bold(enable = true) {
    return this.addBytes(enable ? ESC_POS_COMMANDS.BOLD_ON : ESC_POS_COMMANDS.BOLD_OFF);
  }

  textSize(mode = 'normal') {
    switch (mode) {
      case 'large':
        return this.addBytes(ESC_POS_COMMANDS.TEXT_SIZE_LARGE);
      case 'wide':
        return this.addBytes(ESC_POS_COMMANDS.TEXT_SIZE_WIDE);
      case 'tall':
        return this.addBytes(ESC_POS_COMMANDS.TEXT_SIZE_TALL);
      case 'normal':
      default:
        return this.addBytes(ESC_POS_COMMANDS.TEXT_SIZE_NORMAL);
    }
  }

  text(str = '') {
    return this.addBytes(encodeText(str));
  }

  line(str = '') {
    this.text(str);
    return this.addBytes(ESC_POS_COMMANDS.FEED_LINE);
  }

  feed(lines = 1) {
    for (let i = 0; i < lines; i++) {
      this.addBytes(ESC_POS_COMMANDS.FEED_LINE);
    }
    return this;
  }

  separator(char = '=', width = 48) {
    return this.line(char.repeat(width));
  }

  cut() {
    return this.addBytes(ESC_POS_COMMANDS.CUT_PAPER);
  }

  openDrawer() {
    return this.addBytes(ESC_POS_COMMANDS.OPEN_DRAWER);
  }

  build() {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Generate binary ESC/POS bytes for a full POS order sales invoice receipt
 */
export const generateReceiptEscPosBytes = (order, options = {}) => {
  const paperWidth = options.paperWidth || '80mm';
  const width = paperWidth === '58mm' ? 32 : 48;
  const builder = new EscPosBuilder();

  if (!order) return builder.build();

  const receiptConfig = options.receiptConfig || receiptService.getConfig();

  const totalAmount = parseFloat(order.totalAmount || 0);
  const subtotal = parseFloat(order.subtotal || totalAmount);
  const deliveryFee = parseFloat(order.deliveryFee || 0);
  const convenienceFee = parseFloat(order.convenienceFee || 0);
  const riderTip = parseFloat(order.riderTip || 0);
  const discount = parseFloat(order.discount || 0);

  const vatableSales = totalAmount > 0 ? (totalAmount / 1.12).toFixed(2) : '0.00';
  const vatAmount = totalAmount > 0 ? (totalAmount - parseFloat(vatableSales)).toFixed(2) : '0.00';
  const totalItemsCount = (order.orderItems || []).reduce((acc, item) => acc + item.quantity, 0);

  const storeCode = order.merchant?.externalMerchantId || 'TZ1076';
  const rawIdNum = (order.externalOrderId || '0000').replace(/[^0-9]/g, '').padEnd(8, '0').slice(-8);
  const siNumber = `05-${rawIdNum}`;
  const transNumber = `1076 ${rawIdNum}`;
  const trakzRef = `TZ-${rawIdNum.slice(-4)}`;

  const formatDateStr = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d).replace(',', '');
    } catch {
      return dateStr || '';
    }
  };

  const formatStartTimeStr = (dateStr) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return '';
    }
  };

  const storeName = receiptConfig.storeName || order.merchant?.merchantName || 'MALAYBALAY SUPER FOODS CORP.';
  const vatTinStr = receiptConfig.vatTin ? (receiptConfig.vatTin.startsWith('VAT') ? receiptConfig.vatTin : `VAT Reg TIN: ${receiptConfig.vatTin}`) : '';
  const serialNoStr = receiptConfig.serialNo ? (receiptConfig.serialNo.startsWith('POS') ? receiptConfig.serialNo : `POS05-SN: ${receiptConfig.serialNo}`) : '';
  const minNumStr = receiptConfig.minNumber ? (receiptConfig.minNumber.startsWith('MIN') ? receiptConfig.minNumber : `MIN# ${receiptConfig.minNumber}`) : '';

  builder
    .init()
    .alignCenter()
    .bold(true)
    .line(storeName)
    .bold(false)
    .textSize('normal');

  if (receiptConfig.addressLine1) builder.line(receiptConfig.addressLine1);
  if (receiptConfig.addressLine2) builder.line(receiptConfig.addressLine2);
  if (vatTinStr) builder.line(vatTinStr);
  if (serialNoStr) builder.line(serialNoStr);
  if (minNumStr) builder.line(minNumStr);

  builder
    .bold(true)
    .line(storeCode)
    .textSize('large')
    .line(receiptConfig.headerTitle || 'SALES INVOICE')
    .textSize('normal')
    .line(receiptConfig.subHeaderTitle || 'CUSTOMER COPY')
    .feed(1)
    .alignLeft()
    .bold(true)
    .line(`SI# ${siNumber}`)
    .bold(false)
    .line(`Trans# ${transNumber}`)
    .line('Cashier: 10762021-RUBY PAUCAN')
    .separator('=', width)
    .bold(true)
    .line(formatTwoColumn(formatDateStr(order.orderDate), `#${rawIdNum.slice(-2)}`, width))
    .bold(false)
    .separator('=', width)
    .alignCenter()
    .bold(true)
    .line('-------- TRAKZ --------')
    .alignLeft()
    .bold(false);

  // Line items
  (order.orderItems || []).forEach((item) => {
    const itemTitle = `${item.quantity} ${item.productName}`;
    const itemSubtotal = `${parseFloat(item.subtotal || 0).toFixed(2)}V`;
    builder.bold(true).line(formatTwoColumn(itemTitle, itemSubtotal, width));
    builder.bold(false).line(`    ${item.quantity} ORIGINAL CHOICE`);
  });

  if (deliveryFee > 0) {
    builder.line(formatTwoColumn('1 DELIVERY FEE', `${deliveryFee.toFixed(2)}V`, width));
  }

  if (convenienceFee > 0) {
    builder.line(formatTwoColumn('1 CONVENIENCE FEE', `${convenienceFee.toFixed(2)}V`, width));
  }

  if (riderTip > 0) {
    builder.line(formatTwoColumn('1 RIDER\'S TIP', `${riderTip.toFixed(2)}V`, width));
  }

  if (discount > 0) {
    builder.line(formatTwoColumn('LESS: DISCOUNT', `-${discount.toFixed(2)}`, width));
  }

  builder
    .separator('-', width)
    .bold(true)
    .line(formatTwoColumn(`${totalItemsCount} Item(s)`, `Subtotal PHP ${subtotal.toFixed(2)}`, width))
    .feed(1)
    .textSize('wide')
    .line(formatTwoColumn('TOTAL DUE', `PHP ${totalAmount.toFixed(2)}`, width))
    .textSize('normal')
    .line(formatTwoColumn(`TRAKZ# ${trakzRef}`, totalAmount.toFixed(2), width))
    .bold(false)
    .separator('.', width)
    .line(formatTwoColumn('VATable Sales', vatableSales, width))
    .line(formatTwoColumn('VAT Amount', vatAmount, width))
    .line(formatTwoColumn('Zero-Rated Sales', '0.00', width))
    .line(formatTwoColumn('VAT-Exempt Sales', '0.00', width))
    .separator('*', width)
    .bold(true)
    .line(`Order #${order.externalOrderId}`)
    .bold(false)
    .line(`Start time: ${formatStartTimeStr(order.orderDate)}`)
    .line(`Name: ${order.customerName || 'N/A'}`)
    .line(formatTwoColumn('Address:', 'Grid: 0', width))
    .line('Not applicable')
    .line('Contact Number: Not applicable')
    .line('Remarks: [D4]')
    .separator('*', width)
    .bold(true)
    .line(`Charge To : ${trakzRef}`)
    .feed(1)
    .line('Signature : _______________________')
    .feed(1);

  if (receiptConfig.customNotice) {
    builder.separator('-', width).alignCenter().line(receiptConfig.customNotice);
  }

  builder
    .alignCenter()
    .textSize('normal');

  if (receiptConfig.footerLine1) builder.line(receiptConfig.footerLine1);
  if (receiptConfig.footerLine2) builder.line(receiptConfig.footerLine2);

  builder.feed(3).cut();

  if (options.openDrawer) {
    builder.openDrawer();
  }

  return builder.build();
};

/**
 * Generate sample test receipt bytes
 */
export const generateTestEscPosBytes = (options = {}) => {
  const paperWidth = options.paperWidth || '80mm';
  const width = paperWidth === '58mm' ? 32 : 48;
  const builder = new EscPosBuilder();

  builder
    .init()
    .alignCenter()
    .bold(true)
    .textSize('large')
    .line('TRAKZ POS')
    .textSize('normal')
    .line('TEST ESC/POS RECEIPT')
    .separator('=', width)
    .alignLeft()
    .line(`Timestamp: ${new Date().toLocaleString()}`)
    .line(`Paper Config: ${paperWidth}`)
    .line(`Interface Mode: ${options.connectionType || 'Bluetooth / Web USB'}`)
    .separator('-', width)
    .bold(true)
    .line(formatTwoColumn('1x ESC/POS Direct Print', '0.00 PASS', width))
    .bold(false)
    .separator('=', width)
    .alignCenter()
    .line('*** PRINTER CONNECTION OK ***')
    .line('ESC/POS Receipt Engine Operational')
    .feed(3)
    .cut();

  return builder.build();
};
