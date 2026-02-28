// ESC/POS Commands for Ezo Thermal Printer
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;

// Encoder helper
const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

export const ESC_POS = {
  INIT: new Uint8Array([ESC, 0x40]),
  CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_HEIGHT: new Uint8Array([ESC, 0x21, 0x10]),
  NORMAL_SIZE: new Uint8Array([ESC, 0x21, 0x00]),
  LINE_FEED: new Uint8Array([LF]),
  CUT: new Uint8Array([GS, 0x56, 0x00]),
  PARTIAL_CUT: new Uint8Array([GS, 0x56, 0x01]),
};

export interface PrinterConnection {
  device: any;
  characteristic: any;
  connected: boolean;
}

const PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const PRINTER_CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

export const connectPrinter = async (): Promise<PrinterConnection> => {
  const nav = navigator as any;
  if (!nav.bluetooth) {
    return { device: null, characteristic: null, connected: false };
  }

  try {
    const device = await nav.bluetooth.requestDevice({
      filters: [{ services: [PRINTER_SERVICE_UUID] }],
      optionalServices: [PRINTER_SERVICE_UUID],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(PRINTER_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(PRINTER_CHAR_UUID);

    return { device, characteristic, connected: true };
  } catch {
    // Try generic approach
    try {
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [PRINTER_SERVICE_UUID],
      });

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      
      for (const service of services) {
        try {
          const chars = await service.getCharacteristics();
          for (const char of chars) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              return { device, characteristic: char, connected: true };
            }
          }
        } catch { continue; }
      }

      throw new Error('No writable characteristic found');
    } catch (err) {
      console.error('Printer connection failed:', err);
      return { device: null, characteristic: null, connected: false };
    }
  }
};

export const sendToPrinter = async (
  characteristic: any,
  data: Uint8Array
) => {
  const chunkSize = 512;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
};

export const buildReceiptData = (invoice: {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessGst?: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{ name: string; qty: number; price: number; total: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}): Uint8Array => {
  const parts: Uint8Array[] = [];
  
  const addLine = (text: string) => parts.push(encode(text + '\n'));
  const addCmd = (cmd: Uint8Array) => parts.push(cmd);

  addCmd(ESC_POS.INIT);
  addCmd(ESC_POS.CENTER);
  addCmd(ESC_POS.BOLD_ON);
  addCmd(ESC_POS.DOUBLE_HEIGHT);
  addLine(invoice.businessName);
  addCmd(ESC_POS.NORMAL_SIZE);
  addCmd(ESC_POS.BOLD_OFF);
  
  if (invoice.businessAddress) addLine(invoice.businessAddress);
  if (invoice.businessPhone) addLine(`Tel: ${invoice.businessPhone}`);
  if (invoice.businessGst) addLine(`GST: ${invoice.businessGst}`);
  
  addLine('--------------------------------');
  addCmd(ESC_POS.LEFT);
  addLine(`Invoice: ${invoice.invoiceNumber}`);
  addLine(`Date: ${new Date().toLocaleString('en-IN')}`);
  if (invoice.customerName) addLine(`Customer: ${invoice.customerName}`);
  if (invoice.customerPhone) addLine(`Phone: ${invoice.customerPhone}`);
  
  addLine('--------------------------------');
  addCmd(ESC_POS.BOLD_ON);
  addLine('Item            Qty  Price  Total');
  addCmd(ESC_POS.BOLD_OFF);
  addLine('--------------------------------');
  
  for (const item of invoice.items) {
    const name = item.name.substring(0, 16).padEnd(16);
    const qty = String(item.qty).padStart(3);
    const price = String(item.price).padStart(6);
    const total = String(item.total).padStart(6);
    addLine(`${name}${qty}${price}${total}`);
  }
  
  addLine('--------------------------------');
  addCmd(ESC_POS.RIGHT);
  addLine(`Subtotal: Rs.${invoice.subtotal.toFixed(2)}`);
  addLine(`Tax:      Rs.${invoice.tax.toFixed(2)}`);
  addCmd(ESC_POS.BOLD_ON);
  addCmd(ESC_POS.DOUBLE_HEIGHT);
  addLine(`TOTAL:    Rs.${invoice.total.toFixed(2)}`);
  addCmd(ESC_POS.NORMAL_SIZE);
  addCmd(ESC_POS.BOLD_OFF);
  addLine(`Payment: ${invoice.paymentMethod.toUpperCase()}`);
  
  addLine('');
  addCmd(ESC_POS.CENTER);
  addLine('Thank You! Visit Again');
  addLine('Powered by ZEN POS');
  addLine('');
  addLine('');
  addLine('');
  addCmd(ESC_POS.PARTIAL_CUT);

  const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
};
