import { forwardRef } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { CartItem } from '@/store/useAppStore';
import dayjs from 'dayjs';

interface InvoicePreviewProps {
  cart: CartItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  invoiceNumber: string;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessGst?: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  storeUrl?: string;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({
  cart, customerName, customerPhone, customerEmail, paymentMethod,
  invoiceNumber, businessName, businessAddress, businessPhone, businessGst,
  subtotal, taxTotal, grandTotal, storeUrl,
}, ref) => {
  const qrValue = storeUrl || `INV:${invoiceNumber}|AMT:${grandTotal}|DATE:${dayjs().format('YYYYMMDD')}`;

  return (
    <div ref={ref} className="bg-white text-black p-4 text-xs font-mono" style={{ width: '302px' }}>
      <div className="text-center mb-3">
        <p className="text-sm font-bold">{businessName || 'ZEN POS'}</p>
        {businessAddress && <p>{businessAddress}</p>}
        {businessPhone && <p>Tel: {businessPhone}</p>}
        {businessGst && <p>GST: {businessGst}</p>}
      </div>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <div className="space-y-0.5">
        <div className="flex justify-between"><span>Invoice #</span><span className="font-bold">{invoiceNumber}</span></div>
        <div className="flex justify-between"><span>Date</span><span>{dayjs().format('DD/MM/YYYY HH:mm')}</span></div>
        {customerName && <div className="flex justify-between"><span>Customer</span><span>{customerName}</span></div>}
        {customerPhone && <div className="flex justify-between"><span>Phone</span><span>{customerPhone}</span></div>}
      </div>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <table className="w-full">
        <thead><tr className="border-b border-gray-300"><th className="text-left py-1">Item</th><th className="text-center py-1">Qty</th><th className="text-right py-1">Price</th><th className="text-right py-1">Total</th></tr></thead>
        <tbody>
          {cart.map(item => (
            <tr key={item.product.id}><td className="py-0.5 pr-1 truncate max-w-[100px]">{item.product.name}</td><td className="text-center py-0.5">{item.quantity}</td><td className="text-right py-0.5">₹{item.product.discountPrice}</td><td className="text-right py-0.5">₹{(item.product.discountPrice * item.quantity).toFixed(0)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <div className="space-y-0.5">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>₹{taxTotal.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1"><span>TOTAL</span><span>₹{grandTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Payment</span><span className="uppercase">{paymentMethod}</span></div>
      </div>
      <div className="border-t border-dashed border-gray-400 my-2" />
      <div className="flex flex-col items-center gap-2 my-3">
        <QRCodeSVG value={qrValue} size={80} />
        {storeUrl && <p className="text-[9px] text-gray-500 text-center">{storeUrl}</p>}
        <div className="transform scale-75 origin-center"><Barcode value={invoiceNumber} width={1.2} height={30} fontSize={8} displayValue={false} /></div>
      </div>
      <div className="text-center space-y-1">
        <p className="font-bold">Thank You! Visit Again</p>
        <p className="text-[10px] text-gray-500">Powered by ZEN POS</p>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
export default InvoicePreview;
