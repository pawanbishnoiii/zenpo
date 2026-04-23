// Admin: upload APK, manage versions, mark latest. Public download via landing page.
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, Trash2, Star, Download, FileArchive, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import dayjs from 'dayjs';

const AdminAppReleases = () => {
  const { toast } = useToast();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchReleases = async () => {
    setLoading(true);
    const { data } = await supabase.from('app_releases').select('*').order('created_at', { ascending: false });
    setReleases(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchReleases(); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 200 * 1024 * 1024) { toast({ title: 'Too large', description: 'Max 200 MB', variant: 'destructive' }); return; }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !version.trim()) {
      toast({ title: 'Missing info', description: 'Pick a file and enter a version', variant: 'destructive' });
      return;
    }
    setUploading(true);
    setUploadProgress(5);
    try {
      const ext = file.name.split('.').pop() || 'apk';
      const path = `v${version.trim()}-${Date.now()}.${ext}`;
      // Simulated progress (Supabase JS doesn't expose granular upload events)
      const progressInterval = setInterval(() => setUploadProgress(p => Math.min(p + 8, 90)), 300);
      const { error: upErr } = await supabase.storage.from('app-releases').upload(path, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || 'application/vnd.android.package-archive',
      });
      clearInterval(progressInterval);
      if (upErr) throw upErr;
      setUploadProgress(95);
      const publicUrl = supabase.storage.from('app-releases').getPublicUrl(path).data.publicUrl;

      const { data: ins, error: insErr } = await supabase.from('app_releases').insert({
        version: version.trim(), file_url: publicUrl, file_size_bytes: file.size,
        changelog: changelog.trim(), is_latest: false,
      }).select().single();
      if (insErr) throw insErr;

      // Mark this as latest
      await supabase.rpc('set_latest_release', { _release_id: ins.id });
      setUploadProgress(100);
      toast({ title: 'Upload complete!', description: `v${version} is now the latest release.` });
      setVersion(''); setChangelog(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setUploadProgress(0), 1200);
      fetchReleases();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
      setUploadProgress(0);
    } finally { setUploading(false); }
  };

  const handleSetLatest = async (id: string) => {
    await supabase.rpc('set_latest_release', { _release_id: id });
    toast({ title: 'Marked as latest' });
    fetchReleases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this release?')) return;
    await supabase.from('app_releases').delete().eq('id', id);
    toast({ title: 'Deleted' });
    fetchReleases();
  };

  const formatSize = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold font-display text-foreground">App Releases</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Upload .apk files. Latest version shown on landing page download CTA.</p>
      </div>

      {/* Upload form */}
      <div className="rounded-2xl glass-card p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Version *</label>
            <input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.2.0"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">APK File *</label>
            <input ref={fileRef} type="file" accept=".apk,application/vnd.android.package-archive" onChange={handleFile}
              className="w-full text-xs file:mr-2 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-xs file:font-semibold file:cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Changelog (what's new)</label>
          <textarea value={changelog} onChange={e => setChangelog(e.target.value)} rows={3}
            placeholder="• Added Razorpay UPI QR payments&#10;• Fixed dashboard refresh issue&#10;• Improved barcode scanner speed"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {file && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 flex items-center gap-3 text-xs">
            <FileArchive className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{file.name}</p>
              <p className="text-muted-foreground">{formatSize(file.size)}</p>
            </div>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Uploading…</span><span>{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full gradient-primary" style={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={uploading || !file || !version.trim()}
          className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading…' : 'Upload Release'}
        </button>
      </div>

      {/* Releases list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">All Releases ({releases.length})</p>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : releases.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No releases yet. Upload your first APK above.</div>
        ) : (
          releases.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl glass-card p-3 flex items-center gap-3 flex-wrap">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.is_latest ? 'bg-success/10' : 'bg-muted'}`}>
                <FileArchive className={`w-5 h-5 ${r.is_latest ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">v{r.version}</p>
                  {r.is_latest && <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[9px] font-bold">LATEST</span>}
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3 h-3" /> {dayjs(r.created_at).format('D MMM, h:mm A')}
                  <span>• {formatSize(r.file_size_bytes)}</span>
                  <span>• {r.download_count} downloads</span>
                </p>
                {r.changelog && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{r.changelog}</p>}
              </div>
              <div className="flex gap-1.5">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary hover:bg-muted" title="Download">
                  <Download className="w-3.5 h-3.5 text-foreground" />
                </a>
                {!r.is_latest && (
                  <button onClick={() => handleSetLatest(r.id)} className="p-2 rounded-lg bg-secondary hover:bg-muted" title="Mark latest">
                    <Star className="w-3.5 h-3.5 text-foreground" />
                  </button>
                )}
                <button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20" title="Delete">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAppReleases;
