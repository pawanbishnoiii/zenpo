import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, Plus, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaUploaderProps {
  businessId: string;
  userId: string;
  onUploaded: () => void;
}

const MediaUploader = ({ businessId, userId, onUploaded }: MediaUploaderProps) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) { toast({ title: 'File too large (max 10MB)', variant: 'destructive' }); return; }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('store-media').upload(path, file, { cacheControl: '3600' });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setUploading(false); return; }

    const url = supabase.storage.from('store-media').getPublicUrl(path).data.publicUrl;
    const mediaType = file.type.startsWith('video') ? 'video' : 'banner';

    await supabase.from('store_media').insert({ business_id: businessId, media_type: mediaType, url, title: file.name });
    toast({ title: 'Uploaded!' });
    onUploaded();
    setUploading(false);
  };

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
    >
      <input ref={fileRef} type="file" accept="image/*,video/*" onChange={e => handleFiles(e.target.files)} className="hidden" />
      {uploading ? (
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      ) : (
        <>
          <Upload className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">Drag & drop or click to upload</p>
          <p className="text-xs text-muted-foreground mb-4">Images, banners, videos (max 10MB)</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => fileRef.current?.click()}
            className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Choose File
          </motion.button>
        </>
      )}
    </div>
  );
};

export default MediaUploader;
