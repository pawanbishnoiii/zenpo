import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const BarcodeScanner = ({ open, onClose, onScan }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    const scanner = new Html5Qrcode('barcode-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      (decodedText) => {
        onScan(decodedText);
        scanner.stop().catch(() => {});
        onClose();
      },
      () => {}
    ).catch((err) => {
      setError('Camera access denied. Please allow camera permission.');
      console.error('Scanner error:', err);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-display text-foreground">Scan Barcode</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
            >
              <X className="w-4 h-4 text-foreground" />
            </motion.button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
              <div
                id="barcode-reader"
                className="rounded-2xl overflow-hidden border-2 border-primary/30"
              />
              {error && (
                <p className="text-sm text-destructive text-center mt-4">{error}</p>
              )}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Point camera at a barcode to scan
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BarcodeScanner;
