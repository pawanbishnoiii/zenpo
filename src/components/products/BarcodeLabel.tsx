import { useRef } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BarcodeLabelProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  barcode: string;
  price: number;
  sku: string;
  businessName?: string;
}

const BarcodeLabel = ({ open, onClose, productName, barcode, price, sku, businessName }: BarcodeLabelProps) => {
  const labelRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!labelRef.current) return;
    // Use canvas to download as image
    const svg = labelRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 250);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(businessName || 'ZEN POS', 200, 25);
    ctx.font = '12px monospace';
    ctx.fillText(productName, 200, 50);
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`₹${price}`, 200, 75);
    ctx.font = '10px monospace';
    ctx.fillText(`SKU: ${sku}`, 200, 95);
    ctx.fillText(barcode, 200, 230);

    const link = document.createElement('a');
    link.download = `barcode-${sku}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl border border-border p-6 space-y-4 max-w-sm w-full"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-foreground">Barcode Label</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Label Preview */}
        <div ref={labelRef} className="bg-white rounded-xl p-4 text-center text-black space-y-2">
          <p className="text-xs font-bold">{businessName || 'ZEN POS'}</p>
          <p className="text-sm font-semibold truncate">{productName}</p>
          <p className="text-lg font-bold">₹{price}</p>
          <p className="text-[10px] text-gray-500">SKU: {sku}</p>
          <div className="flex justify-center">
            <Barcode value={barcode} width={1.5} height={40} fontSize={10} />
          </div>
          <div className="flex justify-center">
            <QRCodeSVG value={barcode} size={60} />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Barcode
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BarcodeLabel;
