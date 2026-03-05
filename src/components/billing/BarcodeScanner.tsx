import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, RefreshCcw } from 'lucide-react';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

const SCANNER_ID = 'barcode-reader';

const BarcodeScanner = ({ open, onClose, onScan }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const [error, setError] = useState('');
  const [booting, setBooting] = useState(false);

  const stopScanner = async () => {
    if (!scannerRef.current || !startedRef.current) return;
    try { await scannerRef.current.stop(); await scannerRef.current.clear(); } catch { }
    finally { startedRef.current = false; }
  };

  const startScanner = async () => {
    setError('');
    setBooting(true);
    try {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode(SCANNER_ID);
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) { setError('No camera found. Please check camera permissions in your browser settings.'); return; }
      const rearCamera = cameras.find((cam) => /back|rear|environment/i.test(cam.label));
      const selectedCameraId = rearCamera?.id ?? cameras[0].id;
      await scannerRef.current.start(
        selectedCameraId,
        { fps: 10, qrbox: { width: 250, height: 150 } },
        async (decodedText) => { onScan(decodedText); await stopScanner(); onClose(); },
        () => {}
      );
      startedRef.current = true;
    } catch (err: any) {
      const message = String(err?.message ?? '');
      if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('notallowederror')) {
        setError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else {
        setError('Could not start scanner. Please try again.');
      }
    } finally { setBooting(false); }
  };

  useEffect(() => {
    if (!open) return;
    void startScanner();
    return () => { void stopScanner(); };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /><h2 className="text-lg font-bold font-display text-foreground">Scan Barcode</h2></div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"><X className="w-4 h-4 text-foreground" /></motion.button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-3">
              <div id={SCANNER_ID} className="rounded-2xl overflow-hidden border-2 border-primary/30 min-h-[280px]" />
              {error && (
                <div className="space-y-2">
                  <p className="text-sm text-destructive text-center">{error}</p>
                  <button type="button" onClick={() => void startScanner()}
                    className="w-full py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center gap-2">
                    <RefreshCcw className="w-3.5 h-3.5" /> Retry Scanner
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                {booting ? 'Starting camera...' : 'Point camera at product barcode'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BarcodeScanner;
