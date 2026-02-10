import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import './VisualEmailEditor.css'; 

// ============================================================
// VisualEmailEditor.jsx v7.3 — Professional Email Builder (fixed)
// Table-based HTML export for Gmail, Outlook, Libero, Yahoo, Apple Mail
// Features: 17 block types, drag&drop, image upload, countdown,
//   product cards, save-as-template, preheader, deliverability stats,
//   undo/redo 60 levels, keyboard shortcuts, desktop/mobile preview
// ============================================================

// ---------- Constants ----------
const FONT_OPTIONS = [
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet' },
  { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
  { value: "'Courier New', Courier, monospace", label: 'Courier New' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
  { value: "'Lucida Sans Unicode', sans-serif", label: 'Lucida Sans' },
  { value: 'Palatino, serif', label: 'Palatino' },
];

const COLOR_PRESETS = [
  '#000000','#333333','#555555','#777777','#999999','#ffffff',
  '#6c5ce7','#a29bfe','#0984e3','#00b894','#00cec9','#fdcb6e',
  '#e17055','#d63031','#e84393','#2d3436','#636e72','#b2bec3',
];

const BLOCK_TYPES = [
  { type: 'header', label: '\u{1F4C4} Intestazione', category: 'content' },
  { type: 'title', label: '\u{1F524} Titolo', category: 'content' },
  { type: 'text', label: '\u{1F4DD} Testo', category: 'content' },
  { type: 'html', label: '\u{1F9E9} HTML Custom', category: 'content' },
  { type: 'quote', label: '\u{1F4AC} Citazione', category: 'content' },
  { type: 'list', label: '\u{1F4CB} Lista', category: 'content' },
  { type: 'button', label: '\u{1F518} Pulsante', category: 'action' },
  { type: 'image', label: '\u{1F5BC}\uFE0F Immagine', category: 'media' },
  { type: 'video', label: '\u25B6\uFE0F Video', category: 'media' },
  { type: 'product', label: '\u{1F6D2} Prodotto', category: 'media' },
  { type: 'countdown', label: '\u23F1\uFE0F Countdown', category: 'media' },
  { type: 'divider', label: '\u2796 Divisore', category: 'layout' },
  { type: 'spacer', label: '\u2195\uFE0F Spaziatura', category: 'layout' },
  { type: 'columns2', label: '\u25A5 2 Colonne', category: 'layout' },
  { type: 'columns3', label: '\u25A6 3 Colonne', category: 'layout' },
  { type: 'social', label: '\u{1F310} Social', category: 'footer' },
  { type: 'footer', label: '\u{1F4CB} Footer', category: 'footer' },
];

const SOCIAL_PLATFORMS = {
  facebook:  { icon: '\u{1F4D8}', label: 'Facebook',  color: '#1877F2' },
  instagram: { icon: '\u{1F4F7}', label: 'Instagram', color: '#E4405F' },
  twitter:   { icon: '\u{1F426}', label: 'Twitter/X', color: '#1DA1F2' },
  linkedin:  { icon: '\u{1F4BC}', label: 'LinkedIn',  color: '#0A66C2' },
  youtube:   { icon: '\u25B6\uFE0F', label: 'YouTube', color: '#FF0000' },
  tiktok:    { icon: '\u{1F3B5}', label: 'TikTok',    color: '#000000' },
  whatsapp:  { icon: '\u{1F49A}', label: 'WhatsApp',  color: '#25D366' },
  telegram:  { icon: '\u2708\uFE0F', label: 'Telegram', color: '#0088cc' },
  website:   { icon: '\u{1F30D}', label: 'Sito Web',  color: '#6c5ce7' },
};

const CURRENCY_SYMBOLS = { EUR: '\u20AC', USD: '$', GBP: '\u00A3', CHF: 'CHF', JPY: '\u00A5' };

// ---------- Utility ----------
let _uidC = 0;
function uid() { _uidC++; return 'blk_' + Date.now().toString(36) + '_' + _uidC.toString(36) + '_' + Math.random().toString(36).slice(2, 6); }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, Number(v) || 0)); }
function deepClone(o) { try { return structuredClone(o); } catch { return JSON.parse(JSON.stringify(o)); } }
function getYTThumb(url) {
  if (!url) return 'https://via.placeholder.com/600x338/333/fff?text=%E2%96%B6+Video';
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : 'https://via.placeholder.com/600x338/333/fff?text=%E2%96%B6+Video';
}
function fmtPrice(p, cur = 'EUR') {
  const n = parseFloat(p); if (isNaN(n)) return '';
  const s = CURRENCY_SYMBOLS[cur] || cur;
  return cur === 'EUR' ? n.toFixed(2) + ' ' + s : s + n.toFixed(2);
}

// ---------- Default block properties ----------
function defaultProps(type) {
  const base = { id: uid(), type, align: 'center', paddingTop: 10, paddingBottom: 10, paddingLeft: 20, paddingRight: 20, bgColor: '#ffffff', borderTop: 0, borderBottom: 0, borderColor: '#e0e0e0', borderRadius: 0 };
  switch (type) {
    case 'header': return { ...base, text: 'La Tua Azienda', fontSize: 28, color: '#333333', fontFamily: 'Arial, Helvetica, sans-serif', bold: true, italic: false, underline: false, letterSpacing: 0, lineHeight: 1.3 };
    case 'title': return { ...base, text: 'Titolo della Sezione', fontSize: 22, color: '#333333', fontFamily: 'Arial, Helvetica, sans-serif', bold: true, italic: false, underline: false, letterSpacing: 0, lineHeight: 1.3 };
    case 'text': return { ...base, text: 'Inserisci qui il contenuto della tua newsletter. Puoi personalizzare ogni dettaglio.', fontSize: 16, color: '#555555', fontFamily: 'Arial, Helvetica, sans-serif', bold: false, italic: false, underline: false, letterSpacing: 0, lineHeight: 1.6 };
    case 'html': return { ...base, rawHtml: '<p style="margin:0;color:#555;">Il tuo codice HTML qui...</p>' };
    case 'quote': return { ...base, text: 'Questa è una citazione significativa.', fontSize: 18, color: '#555555', fontFamily: 'Georgia, serif', italic: true, bold: false, underline: false, borderLeftColor: '#6c5ce7', borderLeftWidth: 4, lineHeight: 1.6, letterSpacing: 0, paddingLeft: 30 };
    case 'list': return { ...base, items: ['Primo elemento', 'Secondo elemento', 'Terzo elemento'], fontSize: 16, color: '#555555', fontFamily: 'Arial, Helvetica, sans-serif', bold: false, italic: false, underline: false, lineHeight: 1.8, letterSpacing: 0, ordered: false };
    case 'button': return { ...base, text: 'Scopri di più', fontSize: 16, color: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif', btnColor: '#6c5ce7', btnRadius: 6, href: '#', bold: true, italic: false, underline: false, btnPaddingH: 30, btnPaddingV: 14, fullWidth: false };
    case 'image': return { ...base, src: '', alt: 'Immagine', width: '100%', href: '', borderRadius: 0 };
    case 'divider': return { ...base, dividerColor: '#e0e0e0', dividerHeight: 2, dividerStyle: 'solid', dividerWidth: '100%', paddingTop: 15, paddingBottom: 15 };
    case 'columns2': return { ...base, columns: [{ id: uid(), blocks: [{ ...defaultProps('text'), text: 'Colonna 1' }] }, { id: uid(), blocks: [{ ...defaultProps('text'), text: 'Colonna 2' }] }], columnGap: 10 };
    case 'columns3': return { ...base, columns: [{ id: uid(), blocks: [{ ...defaultProps('text'), text: 'Col 1' }] }, { id: uid(), blocks: [{ ...defaultProps('text'), text: 'Col 2' }] }, { id: uid(), blocks: [{ ...defaultProps('text'), text: 'Col 3' }] }], columnGap: 10 };
    case 'spacer': return { ...base, height: 30, bgColor: 'transparent' };
    case 'social': return { ...base, links: [{ platform: 'facebook', url: '#' }, { platform: 'instagram', url: '#' }, { platform: 'twitter', url: '#' }], iconSize: 28, iconSpacing: 12 };
    case 'footer': return { ...base, text: '© 2026 La Tua Azienda. Tutti i diritti riservati.', fontSize: 12, color: '#999999', fontFamily: 'Arial, Helvetica, sans-serif', bold: false, italic: false, underline: false, unsubText: 'Annulla iscrizione', unsubUrl: '#', lineHeight: 1.5, letterSpacing: 0, showAddress: false, address: 'Via Roma 1, 00100 Roma' };
    case 'video': return { ...base, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnailUrl: '', borderRadius: 8 };
    case 'product': return { ...base, productName: 'Nome Prodotto', productDescription: 'Breve descrizione del prodotto con caratteristiche principali.', productPrice: 29.99, originalPrice: 0, currency: 'EUR', productImage: 'https://via.placeholder.com/260x260/f0f0f0/333?text=Prodotto', productUrl: '#', btnText: 'Acquista ora', btnColor: '#6c5ce7', btnTextColor: '#ffffff', badge: '', badgeColor: '#e74c3c', imagePosition: 'top', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, color: '#333333', nameSize: 18, priceSize: 22 };
    case 'countdown': return { ...base, endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,16), label: "L'offerta scade tra:", expiredLabel: 'Offerta scaduta!', accentColor: '#6c5ce7', bgColor: '#f8f9fa', labelColor: '#555555', digitColor: '#333333', digitBg: '#ffffff', fontSize: 14, digitSize: 32, fontFamily: 'Arial, Helvetica, sans-serif', showDays: true, showHours: true, showMinutes: true, showSeconds: true, borderRadius: 8 };
    default: return base;
  }
}

// ---------- Templates ----------
const TEMPLATES = [
  { name: '📨 Newsletter Base', description: 'Header, testo, immagine, CTA e footer', blocks: () => [defaultProps('header'), defaultProps('divider'), defaultProps('title'), defaultProps('text'), defaultProps('image'), defaultProps('button'), defaultProps('divider'), defaultProps('social'), defaultProps('footer')] },
  { name: '🎉 Promo / Offerta', description: 'Countdown e CTA forte', blocks: () => [
    { ...defaultProps('header'), text: 'OFFERTA SPECIALE', bgColor: '#6c5ce7', color: '#ffffff' },
    { ...defaultProps('image'), src: 'https://via.placeholder.com/600x250/6c5ce7/ffffff?text=PROMO' },
    { ...defaultProps('title'), text: 'Sconto del 50%!', fontSize: 28, color: '#6c5ce7' },
    { ...defaultProps('countdown'), label: "L'offerta scade tra:", accentColor: '#e74c3c' },
    { ...defaultProps('text'), text: 'Solo per un tempo limitato! Approfitta della nostra offerta esclusiva.' },
    { ...defaultProps('button'), text: 'ACQUISTA ORA', btnColor: '#e74c3c', fontSize: 18, btnPaddingV: 16, btnPaddingH: 40 },
    defaultProps('footer'),
  ]},
  { name: '🛒 Vetrina Prodotti', description: 'Card prodotto e-commerce', blocks: () => [
    defaultProps('header'), { ...defaultProps('title'), text: 'Le nostre novità' }, defaultProps('divider'),
    { ...defaultProps('product'), productName: 'Prodotto Premium', productPrice: 49.99, productDescription: 'Il nostro bestseller.' },
    defaultProps('divider'),
    { ...defaultProps('product'), productName: 'Prodotto Exclusive', productPrice: 89.99, originalPrice: 119.99, badge: 'SCONTO' },
    defaultProps('divider'), { ...defaultProps('button'), text: 'Vedi tutti i prodotti' }, defaultProps('footer'),
  ]},
  { name: '📰 Aggiornamento', description: 'Novità strutturate', blocks: () => [
    defaultProps('header'), { ...defaultProps('text'), text: 'Ciao {{nome}}! Ecco le ultime novità.' }, defaultProps('divider'),
    { ...defaultProps('title'), text: 'Novità #1', fontSize: 20 }, { ...defaultProps('text'), text: 'Descrizione della prima novità.' }, defaultProps('divider'),
    { ...defaultProps('title'), text: 'Novità #2', fontSize: 20 }, { ...defaultProps('text'), text: 'Descrizione della seconda novità.' }, defaultProps('divider'),
    { ...defaultProps('button'), text: 'Scopri tutto' }, defaultProps('footer'),
  ]},
  { name: '🎄 Auguri / Evento', description: 'Auguri o invito evento', blocks: () => [
    { ...defaultProps('spacer'), height: 20 },
    { ...defaultProps('image'), src: 'https://via.placeholder.com/600x300/2d3436/ffffff?text=Buone+Feste' },
    { ...defaultProps('title'), text: 'Tanti Auguri!', fontSize: 32, color: '#e74c3c' },
    { ...defaultProps('text'), text: 'Ti auguriamo buone feste. Grazie per essere con noi!' },
    { ...defaultProps('button'), text: 'Conferma partecipazione', btnColor: '#00b894' },
    defaultProps('social'), defaultProps('footer'),
  ]},
];

// ============================================================
// InlineEditor — ContentEditable without cursor bugs
// ============================================================
const InlineEditor = memo(function InlineEditor({ value, onChange, tag: Tag = 'p', style, onFocus: extFocus }) {
  const elRef = useRef(null);
  const focRef = useRef(false);
  useEffect(() => { if (!focRef.current && elRef.current && elRef.current.innerText !== value) elRef.current.innerText = value || ''; }, [value]);
  const onBlur = useCallback(() => { focRef.current = false; if (elRef.current) { const t = elRef.current.innerText; if (t !== value) onChange(t); } }, [onChange, value]);
  const onFoc = useCallback(() => { focRef.current = true; extFocus?.(); }, [extFocus]);
  return <Tag ref={elRef} contentEditable suppressContentEditableWarning onBlur={onBlur} onFocus={onFoc} onDragStart={e => { e.preventDefault(); e.stopPropagation(); }} draggable={false} style={{ ...style, outline: 'none', cursor: 'text', WebkitUserSelect: 'text', userSelect: 'text' }} />;
});

// ============================================================
// ImageUploader — Drag & drop / click / paste / URL
// ============================================================
const ImageUploader = memo(function ImageUploader({ src, onUpload, onUrlChange, accept = 'image/*' }) {
  const [isDrag, setIsDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inpRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Immagine troppo grande (max 5MB)'); return; }
    setUploading(true); setProgress(0);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch('/api/upload/image', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }, body: fd });
      if (res.ok) { const d = await res.json(); onUpload(d.url || d.imageUrl || d.src); setUploading(false); return; }
    } catch { /* fallback base64 */ }
    const reader = new FileReader();
    reader.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)); };
    reader.onload = (e) => {
      console.warn('[VisualEmailEditor] Immagine caricata come base64: i client email potrebbero non visualizzarla. Usa un URL pubblico.');
      onUpload(e.target.result);
      setUploading(false);
    };
    reader.onerror = () => { alert('Errore lettura file'); setUploading(false); };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const fileChange = useCallback((e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ''; }, [processFile]);

  if (src) return (
    <div className="vee-image-preview-container">
      <img src={src} alt="Preview" style={{ maxWidth: '100%', borderRadius: 4, display: 'block' }} />
      <div className="vee-image-preview-actions">
        <button onClick={() => inpRef.current?.click()} className="vee-mini-btn" title="Sostituisci">🔄</button>
        <button onClick={() => onUpload('')} className="vee-mini-btn vee-danger-text" title="Rimuovi">✕</button>
      </div>
      <input ref={inpRef} type="file" accept={accept} onChange={fileChange} style={{ display: 'none' }} />
    </div>
  );

  return (
    <div className={`vee-upload-zone ${isDrag ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
      onDrop={e => { e.preventDefault(); setIsDrag(false); if (e.dataTransfer?.files?.[0]) processFile(e.dataTransfer.files[0]); }}
      onDragOver={e => { e.preventDefault(); setIsDrag(true); }} onDragLeave={() => setIsDrag(false)}
      onClick={() => !uploading && inpRef.current?.click()}
      onPaste={e => { const it = e.clipboardData?.items; if (it) for (const i of it) if (i.type.startsWith('image/')) { e.preventDefault(); processFile(i.getAsFile()); break; } }}
      tabIndex={0} role="button" aria-label="Carica immagine">
      {uploading ? (
        <div className="vee-upload-progress"><div className="vee-upload-progress-bar" style={{ width: `${progress}%` }} /><span>Caricamento... {progress}%</span></div>
      ) : (<>
        <div className="vee-upload-icon">📁</div>
        <div className="vee-upload-text">Trascina un'immagine qui</div>
        <div className="vee-upload-subtext">oppure clicca per selezionare · Max 5MB</div>
        <div className="vee-upload-or">— oppure incolla un URL —</div>
        <input type="text" placeholder="https://esempio.com/immagine.jpg" className="vee-upload-url-input"
          onClick={e => e.stopPropagation()} onChange={e => onUrlChange?.(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { e.stopPropagation(); onUpload(e.target.value.trim()); } }} />
      </>)}
      <input ref={inpRef} type="file" accept={accept} onChange={fileChange} style={{ display: 'none' }} />
    </div>
  );
});

// ============================================================
// CountdownLivePreview — Live ticking countdown
// ============================================================
const CountdownLivePreview = memo(function CountdownLivePreview({ block }) {
  const [tl, setTl] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    if (!block.endDate) return;
    const tick = () => {
      const df = new Date(block.endDate).getTime() - Date.now();
      if (df <= 0) { setTl({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      setTl({ d: Math.floor(df/864e5), h: Math.floor(df%864e5/36e5), m: Math.floor(df%36e5/6e4), s: Math.floor(df%6e4/1e3), expired: false });
    };
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [block.endDate]);

  if (tl.expired) return <div style={{ textAlign: 'center', padding: 16, fontFamily: block.fontFamily }}><p style={{ margin: 0, fontSize: block.fontSize, color: block.labelColor }}>{block.expiredLabel}</p></div>;

  const units = [];
  if (block.showDays !== false) units.push({ v: tl.d, l: 'Giorni' });
  if (block.showHours !== false) units.push({ v: tl.h, l: 'Ore' });
  if (block.showMinutes !== false) units.push({ v: tl.m, l: 'Min' });
  if (block.showSeconds !== false) units.push({ v: tl.s, l: 'Sec' });
  const ds = { fontSize: block.digitSize || 32, fontWeight: 'bold', color: block.digitColor || '#333', backgroundColor: block.digitBg || '#fff', border: `2px solid ${block.accentColor || '#6c5ce7'}`, borderRadius: (block.borderRadius || 8) + 'px', padding: '8px 14px', minWidth: 50, textAlign: 'center', fontFamily: block.fontFamily, lineHeight: 1.2 };

  return (
    <div style={{ textAlign: 'center', padding: 16, fontFamily: block.fontFamily }}>
      {block.label && <p style={{ margin: '0 0 12px 0', fontSize: block.fontSize, color: block.labelColor || '#555' }}>{block.label}</p>}
      <div style={{ display: 'inline-flex', gap: 8 }}>
        {units.map((u, i) => <div key={i} style={{ textAlign: 'center' }}><div style={ds}>{String(u.v).padStart(2, '0')}</div><div style={{ fontSize: 10, color: block.labelColor || '#999', marginTop: 4, textTransform: 'uppercase' }}>{u.l}</div></div>)}
      </div>
    </div>
  );
});

// ============================================================
// ProductCardPreview — E-commerce product card
// ============================================================
const ProductCardPreview = memo(function ProductCardPreview({ block, onClick }) {
  const hd = block.originalPrice && block.originalPrice > block.productPrice;
  const dp = hd ? Math.round((1 - block.productPrice / block.originalPrice) * 100) : 0;
  const isH = block.imagePosition === 'left';
  return (
    <div onClick={onClick} style={{ display: isH ? 'flex' : 'block', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden', fontFamily: block.fontFamily, backgroundColor: '#fff', maxWidth: isH ? '100%' : 320, margin: '0 auto' }}>
      <div style={{ position: 'relative', flexShrink: 0, width: isH ? '40%' : '100%' }}>
        <img src={block.productImage || 'https://via.placeholder.com/260x260/f0f0f0/999?text=Prodotto'} alt={block.productName} style={{ width: '100%', height: isH ? '100%' : 'auto', objectFit: 'cover', display: 'block' }} />
        {block.badge && <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: block.badgeColor || '#e74c3c', color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{block.badge}</span>}
      </div>
      <div style={{ padding: 16, flex: 1 }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: block.nameSize || 18, color: block.color, fontWeight: 'bold' }}>{block.productName}</h3>
        {block.productDescription && <p style={{ margin: '0 0 12px 0', fontSize: block.fontSize, color: '#777', lineHeight: 1.5 }}>{block.productDescription}</p>}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: block.priceSize || 22, fontWeight: 'bold', color: hd ? '#e74c3c' : block.color }}>{fmtPrice(block.productPrice, block.currency)}</span>
          {hd && <><span style={{ fontSize: 14, color: '#999', textDecoration: 'line-through' }}>{fmtPrice(block.originalPrice, block.currency)}</span><span style={{ fontSize: 12, color: '#e74c3c', fontWeight: 'bold' }}>-{dp}%</span></>}
        </div>
        <a href={block.productUrl} onClick={e => e.preventDefault()} style={{ display: 'inline-block', padding: '10px 24px', backgroundColor: block.btnColor, color: block.btnTextColor || '#fff', fontSize: 14, fontWeight: 'bold', textDecoration: 'none', borderRadius: 6 }}>{block.btnText || 'Acquista ora'}</a>
      </div>
    </div>
  );
});

// ============================================================
// EmailStatsBar — Deliverability score & tips
// ============================================================
const EmailStatsBar = memo(function EmailStatsBar({ blocks, preheaderText }) {
  const stats = useMemo(() => {
    let ic = 0, lc = 0, wc = 0, sub = false, tb = 0;
    blocks.forEach(b => {
      if (['image', 'video', 'product'].includes(b.type)) ic++;
      if (['button', 'product'].includes(b.type)) lc++;
      if (b.type === 'footer') sub = true;
      if (['text', 'header', 'title', 'quote'].includes(b.type)) { tb++; wc += (b.text || '').split(/\s+/).filter(Boolean).length; }
      if (b.type === 'list') wc += (b.items || []).join(' ').split(/\s+/).filter(Boolean).length;
      if (b.type === 'social') lc += (b.links || []).length;
    });
    let sc = 50;
    if (sub) sc += 15; if (preheaderText?.length > 10) sc += 10; if (wc > 30) sc += 5; if (tb > 0 && ic > 0) sc += 5; if (wc > 50 && wc < 500) sc += 5;
    if (!sub) sc -= 15; if (ic > 5) sc -= 10; if (wc < 20) sc -= 10; if (ic > 0 && tb === 0) sc -= 15; if (lc > 10) sc -= 5; if (!preheaderText) sc -= 5;
    sc = Math.max(0, Math.min(100, sc));
    let lv = 'good', lb = 'Ottimo'; if (sc < 40) { lv = 'bad'; lb = 'Scarso'; } else if (sc < 65) { lv = 'warning'; lb = 'Migliorabile'; }
    const tips = [];
    if (!sub) tips.push('Aggiungi un blocco Footer con disiscrizione');
    if (!preheaderText) tips.push('Aggiungi un preheader nelle impostazioni');
    if (ic > 5) tips.push('Troppe immagini: rischio spam');
    if (wc < 20) tips.push('Aggiungi più testo per la deliverability');
    if (ic > 0 && tb === 0) tips.push('Solo immagini: aggiungi testo');
    return { score: sc, level: lv, label: lb, imageCount: ic, linkCount: lc, wordCount: wc, blockCount: blocks.length, tips };
  }, [blocks, preheaderText]);
  if (blocks.length === 0) return null;
  return (
    <div className="vee-stats-bar">
      <div className="vee-stats-score"><div className={`vee-stats-badge vee-stats-${stats.level}`}><span className="vee-stats-number">{stats.score}</span><span className="vee-stats-label">{stats.label}</span></div></div>
      <div className="vee-stats-details"><span>🧱 {stats.blockCount}</span><span>📝 {stats.wordCount}</span><span>🖼️ {stats.imageCount}</span><span>🔗 {stats.linkCount}</span></div>
      {stats.tips.length > 0 && <div className="vee-stats-tips">{stats.tips.map((t, i) => <span key={i} className="vee-stats-tip">💡 {t}</span>)}</div>}
    </div>
  );
});

// ============================================================
// BlockPreview — Visual block renderer for all 17 types
// ============================================================
const BlockPreview = memo(function BlockPreview({ block, isSelected, onSelect, onUpdate, onColumnDrop, draggingBlockId: dragId }) {
  const ws = { padding: `${block.paddingTop}px ${block.paddingRight}px ${block.paddingBottom}px ${block.paddingLeft}px`, backgroundColor: block.bgColor || '#fff', textAlign: block.align || 'center', position: 'relative', minHeight: 20, borderTop: block.borderTop ? `${block.borderTop}px solid ${block.borderColor}` : 'none', borderBottom: block.borderBottom ? `${block.borderBottom}px solid ${block.borderColor}` : 'none', borderRadius: block.borderRadius ? `${block.borderRadius}px` : '0' };
  const htc = useCallback(t => onUpdate({ ...block, text: t }), [block, onUpdate]);
  const hc = useCallback(e => { e.stopPropagation(); onSelect(block.id); }, [block.id, onSelect]);
  const ts = { fontSize: block.fontSize, color: block.color, fontFamily: block.fontFamily, fontWeight: block.bold ? 'bold' : 'normal', fontStyle: block.italic ? 'italic' : 'normal', textDecoration: block.underline ? 'underline' : 'none', letterSpacing: block.letterSpacing ? `${block.letterSpacing}px` : 'normal', lineHeight: block.lineHeight || 1.5, margin: 0 };

  const content = () => {
    switch (block.type) {
      case 'header': return <InlineEditor tag="h1" value={block.text} onChange={htc} onFocus={() => onSelect(block.id)} style={ts} />;
      case 'title': return <InlineEditor tag="h2" value={block.text} onChange={htc} onFocus={() => onSelect(block.id)} style={ts} />;
      case 'text': return <InlineEditor tag="p" value={block.text} onChange={htc} onFocus={() => onSelect(block.id)} style={ts} />;
      case 'html': return <div style={{ fontSize: 13, color: '#777', fontFamily: 'monospace', textAlign: 'left', padding: 8, background: '#f9f9f9', borderRadius: 4, border: '1px dashed #ddd' }} onClick={hc}><span style={{ color: '#6c5ce7', fontWeight: 600, fontSize: 11, display: 'block', marginBottom: 4 }}>HTML CUSTOM</span>{(block.rawHtml || '').substring(0, 120)}{(block.rawHtml || '').length > 120 ? '...' : ''}</div>;
      case 'quote': return <div style={{ borderLeft: `${block.borderLeftWidth || 4}px solid ${block.borderLeftColor || '#6c5ce7'}`, paddingLeft: 16 }}><InlineEditor tag="p" value={block.text} onChange={htc} onFocus={() => onSelect(block.id)} style={{ ...ts, fontStyle: 'italic' }} /></div>;
      case 'list': { const Tag = block.ordered ? 'ol' : 'ul'; return <div style={{ textAlign: 'left' }} onClick={hc}><Tag style={{ margin: 0, paddingLeft: 20, fontSize: block.fontSize, color: block.color, fontFamily: block.fontFamily, lineHeight: block.lineHeight || 1.8 }}>{(block.items || []).map((it, i) => <li key={i}>{it}</li>)}</Tag></div>; }
      case 'button': return <a href={block.href} onClick={e => { e.preventDefault(); hc(e); }} style={{ display: block.fullWidth ? 'block' : 'inline-block', padding: `${block.btnPaddingV || 14}px ${block.btnPaddingH || 30}px`, backgroundColor: block.btnColor, color: block.color, fontFamily: block.fontFamily, fontSize: block.fontSize, fontWeight: block.bold ? 'bold' : 'normal', textDecoration: 'none', borderRadius: `${block.btnRadius}px`, textAlign: 'center', boxSizing: 'border-box' }}>{block.text}</a>;
      case 'image':
        if (!block.src) return <ImageUploader src="" onUpload={url => onUpdate({ ...block, src: url })} onUrlChange={url => { if (url) onUpdate({ ...block, src: url }); }} />;
        return <div onClick={hc}><img src={block.src} alt={block.alt} style={{ maxWidth: '100%', width: block.width, height: 'auto', display: 'block', margin: '0 auto', borderRadius: block.borderRadius ? `${block.borderRadius}px` : '0' }} /></div>;
      case 'divider': return <div onClick={hc}><hr style={{ border: 'none', borderTop: `${block.dividerHeight}px ${block.dividerStyle || 'solid'} ${block.dividerColor}`, margin: 0, width: block.dividerWidth || '100%', display: 'inline-block' }} /></div>;
      case 'spacer': return <div onClick={hc} style={{ height: `${block.height}px`, background: 'repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(108,92,231,0.04) 5px,rgba(108,92,231,0.04) 10px)', position: 'relative' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 10, color: '#ccc' }}>{block.height}px</span></div>;
      case 'social': return <div onClick={hc} style={{ display: 'flex', justifyContent: block.align || 'center', gap: `${block.iconSpacing || 12}px`, flexWrap: 'wrap' }}>{(block.links || []).map((lk, i) => <a key={i} href={lk.url} onClick={e => e.preventDefault()} style={{ display: 'inline-block', fontSize: block.iconSize || 28, textDecoration: 'none' }} title={SOCIAL_PLATFORMS[lk.platform]?.label}>{SOCIAL_PLATFORMS[lk.platform]?.icon || '🔗'}</a>)}</div>;
      case 'footer': return <div onClick={hc} style={{ fontSize: block.fontSize, color: block.color, fontFamily: block.fontFamily }}><InlineEditor tag="p" value={block.text} onChange={htc} onFocus={() => onSelect(block.id)} style={{ ...ts, margin: '0 0 8px 0' }} />{block.showAddress && block.address && <p style={{ margin: '0 0 8px 0', fontSize: block.fontSize, color: block.color }}>{block.address}</p>}<a href={block.unsubUrl} onClick={e => e.preventDefault()} style={{ color: '#6c5ce7', fontSize: block.fontSize }}>{block.unsubText}</a></div>;
      case 'video': { const th = block.thumbnailUrl || getYTThumb(block.videoUrl); return <a href={block.videoUrl} onClick={e => { e.preventDefault(); hc(e); }} style={{ display: 'block', position: 'relative' }}><img src={th} alt="Video" style={{ maxWidth: '100%', display: 'block', margin: '0 auto', borderRadius: block.borderRadius || 8 }} /><div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: 28, marginLeft: 4 }}>▶</span></div></a>; }
      case 'product': return <ProductCardPreview block={block} onClick={hc} />;
      case 'countdown': return <div onClick={hc} style={{cursor:"pointer"}}><div style={{pointerEvents:"none"}}><CountdownLivePreview block={block} /></div></div>;
      case 'columns2': case 'columns3': return (
        <div style={{ display: 'flex', gap: `${block.columnGap || 10}px` }} onClick={hc}>
          {(block.columns || []).map(col => (
            <div key={col.id} style={{ flex: 1, minWidth: 0, border: '1px dashed #e0e0e0', borderRadius: 4, padding: 8, minHeight: 60, transition: 'background 0.15s' }}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.backgroundColor = 'rgba(108,92,231,0.08)'; }}
              onDragLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.backgroundColor = ''; onColumnDrop?.(block.id, col.id, e.dataTransfer.getData('text/plain')); }}
            >
              {col.blocks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: '#ccc', fontSize: 12, pointerEvents: 'none' }}>Trascina qui</div>
              )}
              {col.blocks.map(cb => (
                <div key={cb.id} style={{ padding: 4, position: 'relative' }}>
                  <BlockPreview block={cb} isSelected={false} onSelect={onSelect} onUpdate={u => {
                    const nc = block.columns.map(c => c.id === col.id ? { ...c, blocks: c.blocks.map(b => b.id === u.id ? u : b) } : c);
                    onUpdate({ ...block, columns: nc });
                  }} />
                  <button onClick={e => { e.stopPropagation(); const nc = block.columns.map(c => c.id === col.id ? { ...c, blocks: c.blocks.filter(b => b.id !== cb.id) } : c); onUpdate({ ...block, columns: nc }); }}
                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(214,48,49,0.85)', color: '#fff', border: 'none', borderRadius: 4, width: 20, height: 20, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                    title="Rimuovi dalla colonna">✕</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
      default: return <div style={{ color: '#999' }}>Blocco sconosciuto</div>;
    }
  };
  return <div style={ws} onClick={hc}>{content()}</div>;
});

// ============================================================
// PropertiesPanel — Edit all block properties
// ============================================================
// ---------- CollapsibleSection ----------
const CollapsibleSection = memo(function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <>
      <button
        className="vee-section-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        type="button"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '10px 0 6px', background: 'none', border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#a29bfe',
          cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 1, fontFamily: 'inherit', marginTop: 10
        }}
      >
        <span>{title}</span>
        <span style={{
          fontSize: 10, transition: 'transform 0.2s',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
          color: '#636e72'
        }}>▶</span>
      </button>
      {isOpen && children}
    </>
  );
});
const PropertiesPanel = memo(function PropertiesPanel({ block, onUpdate, onClose }) {
  if (!block) return null;
  const u = (k, v) => onUpdate({ ...block, [k]: v });
  const uN = (k, v, mn = 0, mx = 999) => u(k, clamp(v, mn, mx));
  const hasText = ['header', 'title', 'text', 'button', 'footer', 'quote'].includes(block.type);
  const labels = { header: 'Intestazione', title: 'Titolo', text: 'Testo', button: 'Pulsante', image: 'Immagine', divider: 'Divisore', spacer: 'Spaziatura', social: 'Social', footer: 'Footer', video: 'Video', columns2: '2 Colonne', columns3: '3 Colonne', html: 'HTML Custom', quote: 'Citazione', list: 'Lista', product: 'Prodotto', countdown: 'Countdown' };

  return (
    <div className="vee-props-panel">
      <div className="vee-props-header"><span>{labels[block.type] || block.type}</span><button onClick={onClose} className="vee-props-close">✕</button></div>
      <div className="vee-props-body">

        {hasText && (<CollapsibleSection title="✏️ Contenuto" defaultOpen={true}><label>Testo</label><textarea className="vee-textarea" value={block.text || ''} onChange={e => u('text', e.target.value)} rows={3} /></CollapsibleSection>
        )}

        {block.type === 'html' && (<CollapsibleSection title="🧩 HTML" defaultOpen={true}><textarea className="vee-textarea vee-textarea-code" value={block.rawHtml || ''} onChange={e => u('rawHtml', e.target.value)} rows={6} spellCheck={false} /></CollapsibleSection>
        )}

        {block.type === 'list' && (<CollapsibleSection title="📋 Lista" defaultOpen={true}>
          <label><input type="checkbox" checked={!!block.ordered} onChange={e => u('ordered', e.target.checked)} /> Numerata</label>
          {(block.items || []).map((item, i) => <div key={i} className="vee-list-item-row"><input type="text" value={item} onChange={e => { const n = [...block.items]; n[i] = e.target.value; u('items', n); }} /><button onClick={() => u('items', block.items.filter((_, j) => j !== i))} className="vee-mini-btn vee-danger-text">✕</button></div>)}
          <button onClick={() => u('items', [...(block.items || []), 'Nuovo elemento'])} className="vee-add-btn">+ Aggiungi</button>
        </CollapsibleSection>
        )}

        {hasText && (<CollapsibleSection title="🔤 Tipografia" defaultOpen={false}>
          <label>Colore</label><div className="vee-color-input-row"><input type="color" value={block.color || '#333'} onChange={e => u('color', e.target.value)} /><input type="text" value={block.color || '#333'} onChange={e => u('color', e.target.value)} className="vee-color-text-input" /></div>
          <div className="vee-color-presets">{COLOR_PRESETS.map(c => <button key={c} className={`vee-color-dot ${block.color === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => u('color', c)} />)}</div>
          <label>Font</label><select value={block.fontFamily || 'Arial, Helvetica, sans-serif'} onChange={e => u('fontFamily', e.target.value)}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
          <label>Dimensione</label><input type="number" value={block.fontSize || 16} onChange={e => uN('fontSize', e.target.value, 8, 72)} />
          <label>Altezza riga</label><input type="number" value={block.lineHeight || 1.5} onChange={e => u('lineHeight', parseFloat(e.target.value) || 1.5)} step="0.1" min="0.8" max="3" />
          <label>Spaziatura lettere</label><input type="number" value={block.letterSpacing || 0} onChange={e => uN('letterSpacing', e.target.value, -2, 10)} />
          <div className="vee-text-style-group">
            <button className={block.bold ? 'active' : ''} onClick={() => u('bold', !block.bold)}><b>B</b></button>
            <button className={block.italic ? 'active' : ''} onClick={() => u('italic', !block.italic)}><i>I</i></button>
            <button className={block.underline ? 'active' : ''} onClick={() => u('underline', !block.underline)}><u>U</u></button>
          </div>
        </CollapsibleSection>
        )}

        {block.type === 'button' && (<CollapsibleSection title="🔘 Pulsante" defaultOpen={true}>
          <label>Colore pulsante</label><div className="vee-color-input-row"><input type="color" value={block.btnColor || '#6c5ce7'} onChange={e => u('btnColor', e.target.value)} /><input type="text" value={block.btnColor || ''} onChange={e => u('btnColor', e.target.value)} className="vee-color-text-input" /></div>
          <div className="vee-color-presets">{COLOR_PRESETS.map(c => <button key={c} className={`vee-color-dot ${block.btnColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => u('btnColor', c)} />)}</div>
          <label>Link</label><input type="text" value={block.href || ''} onChange={e => u('href', e.target.value)} placeholder="https://..." />
          <label>Border radius</label><input type="number" value={block.btnRadius || 0} onChange={e => uN('btnRadius', e.target.value, 0, 50)} />
          <label>Padding V / H</label><div className="vee-padding-group"><input type="number" value={block.btnPaddingV || 14} onChange={e => uN('btnPaddingV', e.target.value, 4, 40)} /><input type="number" value={block.btnPaddingH || 30} onChange={e => uN('btnPaddingH', e.target.value, 8, 80)} /></div>
          <label><input type="checkbox" checked={!!block.fullWidth} onChange={e => u('fullWidth', e.target.checked)} /> Larghezza piena</label>
        </CollapsibleSection>
        )}

        {block.type === 'image' && (<CollapsibleSection title="🖼️ Immagine" defaultOpen={true}>
          <ImageUploader src={block.src || ''} onUpload={url => u('src', url)} onUrlChange={url => u('src', url)} />
          <label>Alt text</label><input type="text" value={block.alt || ''} onChange={e => u('alt', e.target.value)} />
          <label>Larghezza</label><input type="text" value={block.width || '100%'} onChange={e => u('width', e.target.value)} />
          <label>Link</label><input type="text" value={block.href || ''} onChange={e => u('href', e.target.value)} placeholder="https://..." />
          <label>Border radius</label><input type="number" value={block.borderRadius || 0} onChange={e => uN('borderRadius', e.target.value, 0, 50)} />
        </CollapsibleSection>
        )}

        {block.type === 'divider' && (<CollapsibleSection title="➖ Divisore" defaultOpen={true}>
          <label>Colore</label><input type="color" value={block.dividerColor || '#e0e0e0'} onChange={e => u('dividerColor', e.target.value)} />
          <label>Spessore</label><input type="number" value={block.dividerHeight || 2} onChange={e => uN('dividerHeight', e.target.value, 1, 10)} />
          <label>Stile</label><select value={block.dividerStyle || 'solid'} onChange={e => u('dividerStyle', e.target.value)}><option value="solid">Solido</option><option value="dashed">Tratteggiato</option><option value="dotted">Puntinato</option></select>
          <label>Larghezza</label><input type="text" value={block.dividerWidth || '100%'} onChange={e => u('dividerWidth', e.target.value)} />
        </CollapsibleSection>
        )}

        {block.type === 'spacer' && (<CollapsibleSection title="↕️ Spaziatura" defaultOpen={true}><label>Altezza (px)</label><input type="number" value={block.height || 30} onChange={e => uN('height', e.target.value, 5, 200)} /></CollapsibleSection>
        )}

        {block.type === 'quote' && (<CollapsibleSection title="💬 Citazione" defaultOpen={true}><label>Colore bordo</label><input type="color" value={block.borderLeftColor || '#6c5ce7'} onChange={e => u('borderLeftColor', e.target.value)} /><label>Spessore bordo</label><input type="number" value={block.borderLeftWidth || 4} onChange={e => uN('borderLeftWidth', e.target.value, 1, 10)} /></CollapsibleSection>
        )}

        {block.type === 'social' && (<CollapsibleSection title="🌐 Social" defaultOpen={true}>
          <label>Dimensione icone</label><input type="number" value={block.iconSize || 28} onChange={e => uN('iconSize', e.target.value, 16, 48)} />
          <label>Spaziatura</label><input type="number" value={block.iconSpacing || 12} onChange={e => uN('iconSpacing', e.target.value, 0, 30)} />
          {(block.links || []).map((lk, i) => <div key={i} className="vee-social-row"><select value={lk.platform} onChange={e => { const n = [...block.links]; n[i] = { ...lk, platform: e.target.value }; u('links', n); }}>{Object.entries(SOCIAL_PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select><input type="text" value={lk.url || ''} onChange={e => { const n = [...block.links]; n[i] = { ...lk, url: e.target.value }; u('links', n); }} placeholder="https://..." /><button onClick={() => u('links', block.links.filter((_, j) => j !== i))} className="vee-mini-btn vee-danger-text">✕</button></div>)}
          <button onClick={() => u('links', [...(block.links || []), { platform: 'facebook', url: '#' }])} className="vee-add-btn">+ Aggiungi social</button>
        </CollapsibleSection>
        )}

        {block.type === 'video' && (<CollapsibleSection title="▶️ Video" defaultOpen={true}>
          <label>URL video</label><input type="text" value={block.videoUrl || ''} onChange={e => u('videoUrl', e.target.value)} placeholder="https://youtube.com/..." />
          <label>Thumbnail</label><input type="text" value={block.thumbnailUrl || ''} onChange={e => u('thumbnailUrl', e.target.value)} />
          <label>Border radius</label><input type="number" value={block.borderRadius || 0} onChange={e => uN('borderRadius', e.target.value, 0, 30)} />
        </CollapsibleSection>
        )}

        {block.type === 'footer' && (<CollapsibleSection title="📋 Footer" defaultOpen={true}>
          <label>Testo unsub</label><input type="text" value={block.unsubText || ''} onChange={e => u('unsubText', e.target.value)} />
          <label>Link unsub</label><input type="text" value={block.unsubUrl || ''} onChange={e => u('unsubUrl', e.target.value)} />
          <label><input type="checkbox" checked={!!block.showAddress} onChange={e => u('showAddress', e.target.checked)} /> Mostra indirizzo</label>
          {block.showAddress && <><label>Indirizzo</label><input type="text" value={block.address || ''} onChange={e => u('address', e.target.value)} /></>}
        </CollapsibleSection>
        )}

        {block.type === 'product' && (<CollapsibleSection title="🛒 Prodotto" defaultOpen={true}>
          <label>Immagine</label><ImageUploader src={block.productImage || ''} onUpload={url => u('productImage', url)} onUrlChange={url => u('productImage', url)} />
          <label>Nome</label><input type="text" value={block.productName || ''} onChange={e => u('productName', e.target.value)} />
          <label>Descrizione</label><textarea className="vee-textarea" value={block.productDescription || ''} onChange={e => u('productDescription', e.target.value)} rows={2} />
          <label>Prezzo</label><div className="vee-price-row"><input type="number" value={block.productPrice || 0} onChange={e => u('productPrice', parseFloat(e.target.value) || 0)} step="0.01" min="0" /><select value={block.currency || 'EUR'} onChange={e => u('currency', e.target.value)}>{Object.entries(CURRENCY_SYMBOLS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}</select></div>
          <label>Prezzo originale</label><input type="number" value={block.originalPrice || 0} onChange={e => u('originalPrice', parseFloat(e.target.value) || 0)} step="0.01" min="0" placeholder="0 = nessuno" />
          <label>Badge</label><input type="text" value={block.badge || ''} onChange={e => u('badge', e.target.value)} placeholder="SCONTO, NUOVO..." />
          {block.badge && <><label>Colore badge</label><input type="color" value={block.badgeColor || '#e74c3c'} onChange={e => u('badgeColor', e.target.value)} /></>}
          <label>URL prodotto</label><input type="text" value={block.productUrl || ''} onChange={e => u('productUrl', e.target.value)} />
          <label>Testo pulsante</label><input type="text" value={block.btnText || ''} onChange={e => u('btnText', e.target.value)} />
          <label>Colore pulsante</label><input type="color" value={block.btnColor || '#6c5ce7'} onChange={e => u('btnColor', e.target.value)} />
          <label>Layout</label><div className="vee-align-group"><button className={block.imagePosition === 'top' ? 'active' : ''} onClick={() => u('imagePosition', 'top')}>⬆ Sopra</button><button className={block.imagePosition === 'left' ? 'active' : ''} onClick={() => u('imagePosition', 'left')}>◀ Sinistra</button></div>
          <label>Font</label><select value={block.fontFamily || 'Arial, Helvetica, sans-serif'} onChange={e => u('fontFamily', e.target.value)}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
          <label>Colore testo</label><input type="color" value={block.color || '#333'} onChange={e => u('color', e.target.value)} />
        </CollapsibleSection>
        )}

        {block.type === 'countdown' && (<CollapsibleSection title="⏱️ Countdown" defaultOpen={true}>
          <label>Data/Ora fine</label><input type="datetime-local" value={block.endDate || ''} onChange={e => u('endDate', e.target.value)} className="vee-datetime-input" />
          <label>Etichetta</label><input type="text" value={block.label || ''} onChange={e => u('label', e.target.value)} />
          <label>Testo scaduto</label><input type="text" value={block.expiredLabel || ''} onChange={e => u('expiredLabel', e.target.value)} />
          <label>Colore accento</label><div className="vee-color-input-row"><input type="color" value={block.accentColor || '#6c5ce7'} onChange={e => u('accentColor', e.target.value)} /><input type="text" value={block.accentColor || ''} onChange={e => u('accentColor', e.target.value)} className="vee-color-text-input" /></div>
          <div className="vee-color-presets">{COLOR_PRESETS.map(c => <button key={c} className={`vee-color-dot ${block.accentColor === c ? 'active' : ''}`} style={{ backgroundColor: c }} onClick={() => u('accentColor', c)} />)}</div>
          <label>Colore cifre</label><input type="color" value={block.digitColor || '#333'} onChange={e => u('digitColor', e.target.value)} />
          <label>Sfondo cifre</label><input type="color" value={block.digitBg || '#fff'} onChange={e => u('digitBg', e.target.value)} />
          <label>Dimensione cifre</label><input type="number" value={block.digitSize || 32} onChange={e => uN('digitSize', e.target.value, 16, 64)} />
          <label>Font</label><select value={block.fontFamily || 'Arial, Helvetica, sans-serif'} onChange={e => u('fontFamily', e.target.value)}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
          <label>Border radius</label><input type="number" value={block.borderRadius || 8} onChange={e => uN('borderRadius', e.target.value, 0, 30)} />
          <div className="vee-props-section-title">Mostra unità</div>
          <label><input type="checkbox" checked={block.showDays !== false} onChange={e => u('showDays', e.target.checked)} /> Giorni</label>
          <label><input type="checkbox" checked={block.showHours !== false} onChange={e => u('showHours', e.target.checked)} /> Ore</label>
          <label><input type="checkbox" checked={block.showMinutes !== false} onChange={e => u('showMinutes', e.target.checked)} /> Minuti</label>
          <label><input type="checkbox" checked={block.showSeconds !== false} onChange={e => u('showSeconds', e.target.checked)} /> Secondi</label>
        </CollapsibleSection>
        )}

        {block.type === 'list' && (<CollapsibleSection title="🔤 Tipografia" defaultOpen={false}>
          <label>Font</label><select value={block.fontFamily || 'Arial, Helvetica, sans-serif'} onChange={e => u('fontFamily', e.target.value)}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
          <label>Dimensione</label><input type="number" value={block.fontSize || 16} onChange={e => uN('fontSize', e.target.value, 8, 48)} />
          <label>Colore</label><input type="color" value={block.color || '#555'} onChange={e => u('color', e.target.value)} />
        </CollapsibleSection>
        )}

        <CollapsibleSection title="📐 Layout" defaultOpen={false}>
        <label>Sfondo</label><div className="vee-color-input-row"><input type="color" value={block.bgColor || '#ffffff'} onChange={e => u('bgColor', e.target.value)} /><input type="text" value={block.bgColor || '#ffffff'} onChange={e => u('bgColor', e.target.value)} className="vee-color-text-input" /></div>
        <label>Allineamento</label><div className="vee-align-group">{['left', 'center', 'right'].map(a => <button key={a} className={block.align === a ? 'active' : ''} onClick={() => u('align', a)}>{a === 'left' ? '◀' : a === 'center' ? '◆' : '▶'}</button>)}</div>
        <label>Padding (su/giù/sx/dx)</label><div className="vee-padding-group"><input type="number" value={block.paddingTop ?? 10} onChange={e => uN('paddingTop', e.target.value, 0, 100)} placeholder="Su" /><input type="number" value={block.paddingBottom ?? 10} onChange={e => uN('paddingBottom', e.target.value, 0, 100)} placeholder="Giù" /><input type="number" value={block.paddingLeft ?? 20} onChange={e => uN('paddingLeft', e.target.value, 0, 100)} placeholder="Sx" /><input type="number" value={block.paddingRight ?? 20} onChange={e => uN('paddingRight', e.target.value, 0, 100)} placeholder="Dx" /></div>
        </CollapsibleSection>

        <CollapsibleSection title="🔲 Bordi" defaultOpen={false}>
        <label>Bordo su/giù</label><div className="vee-padding-group"><input type="number" value={block.borderTop ?? 0} onChange={e => uN('borderTop', e.target.value, 0, 10)} placeholder="Su" /><input type="number" value={block.borderBottom ?? 0} onChange={e => uN('borderBottom', e.target.value, 0, 10)} placeholder="Giù" /></div>
        <label>Colore bordo</label><input type="color" value={block.borderColor || '#e0e0e0'} onChange={e => u('borderColor', e.target.value)} />
        <label>Border radius</label><input type="number" value={block.borderRadius ?? 0} onChange={e => uN('borderRadius', e.target.value, 0, 30)} />
        </CollapsibleSection>

      </div>
    </div>
  );
});


// ============================================================
// HTML Export — Table-based, email-client compatible
// ============================================================
function escH(s) { if (!s) return ''; return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>'); }
function escA(s) { if (!s) return ''; return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function blkHTML(block) {
  const al = block.align || 'center', bg = block.bgColor || '#ffffff';
  const pT = block.paddingTop ?? 0, pR = block.paddingRight ?? 0, pB = block.paddingBottom ?? 0, pL = block.paddingLeft ?? 0;
  const bT = block.borderTop ? `border-top:${block.borderTop}px solid ${block.borderColor || '#e0e0e0'};` : '';
  const bB = block.borderBottom ? `border-bottom:${block.borderBottom}px solid ${block.borderColor || '#e0e0e0'};` : '';
  const bR = block.borderRadius ? `border-radius:${block.borderRadius}px;` : '';
  const cs = `padding:${pT}px ${pR}px ${pB}px ${pL}px;background-color:${bg};${bT}${bB}${bR}`;
  const cO = `<td align="${al}" style="${cs}">`, cC = '</td>';
  const fw = block.bold ? 'bold' : 'normal', fi = block.italic ? 'italic' : 'normal', td = block.underline ? 'underline' : 'none';
  const ls = block.letterSpacing ? `letter-spacing:${block.letterSpacing}px;` : '';
  const lh = block.lineHeight ? `line-height:${block.lineHeight};` : '';
  const tx = `margin:0;font-size:${block.fontSize}px;color:${block.color};font-family:${block.fontFamily};font-weight:${fw};font-style:${fi};text-decoration:${td};${ls}${lh}`;

  switch (block.type) {
    case 'header': return `<tr>${cO}<h1 style="${tx}">${escH(block.text)}</h1>${cC}</tr>`;
    case 'title': return `<tr>${cO}<h2 style="${tx}">${escH(block.text)}</h2>${cC}</tr>`;
    case 'text': return `<tr>${cO}<p style="${tx}">${escH(block.text)}</p>${cC}</tr>`;
    case 'html': return `<tr>${cO}${block.rawHtml || ''}${cC}</tr>`;
    case 'quote': return `<tr>${cO}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-left:${block.borderLeftWidth || 4}px solid ${block.borderLeftColor || '#6c5ce7'};padding-left:16px;"><p style="${tx};font-style:italic;">${escH(block.text)}</p></td></tr></table>${cC}</tr>`;
    case 'list': { const tg = block.ordered ? 'ol' : 'ul'; const its = (block.items || []).map(i => `<li>${escH(i)}</li>`).join(''); return `<tr>${cO}<${tg} style="margin:0;padding-left:20px;font-size:${block.fontSize}px;color:${block.color};font-family:${block.fontFamily};${lh}">${its}</${tg}>${cC}</tr>`; }
    case 'button': { const pV = block.btnPaddingV || 14, pH = block.btnPaddingH || 30, bw = block.fullWidth ? 'width:100%;' : '', bd = block.fullWidth ? 'display:block;' : 'display:inline-block;';
      return `<tr>${cO}<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escA(block.href)}" style="height:${pV * 2 + block.fontSize}px;v-text-anchor:middle;${bw}width:${block.fullWidth ? '100%' : '200px'}" arcsize="${Math.round(block.btnRadius / 44 * 100)}%" stroke="f" fillcolor="${block.btnColor}"><w:anchorlock/><center><![endif]--><a href="${escA(block.href)}" style="${bd}padding:${pV}px ${pH}px;background-color:${block.btnColor};color:${block.color};font-family:${block.fontFamily};font-size:${block.fontSize}px;font-weight:${fw};text-decoration:none;border-radius:${block.btnRadius}px;mso-hide:all;text-align:center;box-sizing:border-box;${bw}">${escH(block.text)}</a><!--[if mso]></center></v:roundrect><![endif]-->${cC}</tr>`; }
    case 'image': { const ir = block.borderRadius ? `border-radius:${block.borderRadius}px;` : ''; const img = `<img src="${escA(block.src)}" alt="${escA(block.alt)}" width="${String(block.width).replace('px', '').replace('%', '')}" style="max-width:100%;width:${block.width};height:auto;display:block;margin:0 auto;border:0;${ir}" />`; return block.href ? `<tr>${cO}<a href="${escA(block.href)}" style="display:block;">${img}</a>${cC}</tr>` : `<tr>${cO}${img}${cC}</tr>`; }
    case 'divider': return `<tr>${cO}<table role="presentation" width="${block.dividerWidth || '100%'}" cellpadding="0" cellspacing="0" border="0" align="${al}"><tr><td style="border-top:${block.dividerHeight}px ${block.dividerStyle || 'solid'} ${block.dividerColor};font-size:0;line-height:0;">&nbsp;</td></tr></table>${cC}</tr>`;
    case 'spacer': return `<tr><td style="padding:0;height:${block.height}px;font-size:0;line-height:0;background-color:${bg === 'transparent' ? '' : bg};">&nbsp;</td></tr>`;
    case 'columns2': case 'columns3': { const cols = block.columns || [], w = Math.floor(100 / cols.length), g = block.columnGap || 10; const ch = cols.map(col => { const ih = col.blocks.map(b => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${blkHTML(b)}</table>`).join(''); return `<td valign="top" width="${w}%" style="padding:0 ${g / 2}px;">${ih}</td>`; }).join(''); return `<tr>${cO}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="vee-columns"><tr class="vee-columns-row">${ch}</tr></table>${cC}</tr>`; }
    case 'social': { const sl = (block.links || []).map(l => `<a href="${escA(l.url)}" style="display:inline-block;margin:0 ${(block.iconSpacing || 12) / 2}px;font-size:${block.iconSize || 28}px;text-decoration:none;">${SOCIAL_PLATFORMS[l.platform]?.icon || '🔗'}</a>`).join(''); return `<tr>${cO}${sl}${cC}</tr>`; }
    case 'footer': { let ad = ''; if (block.showAddress && block.address) ad = `<p style="margin:0 0 8px 0;font-size:${block.fontSize}px;color:${block.color};font-family:${block.fontFamily};">${escH(block.address)}</p>`; return `<tr>${cO}<p style="${tx};margin:0 0 8px 0;">${escH(block.text)}</p>${ad}<a href="${escA(block.unsubUrl)}" style="color:#6c5ce7;font-size:${block.fontSize}px;font-family:${block.fontFamily};">${escH(block.unsubText)}</a>${cC}</tr>`; }
    case 'video': { const th = block.thumbnailUrl || getYTThumb(block.videoUrl); const vr = block.borderRadius ? `border-radius:${block.borderRadius}px;` : ''; return `<tr>${cO}<a href="${escA(block.videoUrl)}" style="display:block;"><img src="${escA(th)}" alt="Video" width="600" style="max-width:100%;height:auto;display:block;margin:0 auto;border:0;${vr}" /></a>${cC}</tr>`; }
    case 'product': {
      const hd = block.originalPrice && block.originalPrice > block.productPrice, dp = hd ? Math.round((1 - block.productPrice / block.originalPrice) * 100) : 0;
      const pr = fmtPrice(block.productPrice, block.currency), op = hd ? fmtPrice(block.originalPrice, block.currency) : '';
      const badge = block.badge ? `<span style="display:inline-block;background-color:${block.badgeColor || '#e74c3c'};color:#fff;font-size:11px;font-weight:bold;padding:3px 8px;border-radius:4px;text-transform:uppercase;">${escH(block.badge)}</span><br/><br/>` : '';
      const disc = hd ? `<span style="font-size:14px;color:#999;text-decoration:line-through;">${op}</span> <span style="font-size:12px;color:#e74c3c;font-weight:bold;">-${dp}%</span>` : '';
      const desc = block.productDescription ? `<p style="margin:0 0 12px 0;font-size:${block.fontSize}px;color:#777;line-height:1.5;">${escH(block.productDescription)}</p>` : '';
      const btn = `<a href="${escA(block.productUrl)}" style="display:inline-block;padding:10px 24px;background-color:${block.btnColor};color:${block.btnTextColor || '#fff'};font-size:14px;font-weight:bold;text-decoration:none;border-radius:6px;">${escH(block.btnText || 'Acquista ora')}</a>`;
      const nm = `<h3 style="margin:0 0 6px 0;font-size:${block.nameSize || 18}px;color:${block.color};">${escH(block.productName)}</h3>`;
      const prH = `<p style="margin:0 0 12px 0;"><span style="font-size:${block.priceSize || 22}px;font-weight:bold;color:${hd ? '#e74c3c' : block.color};">${pr}</span> ${disc}</p>`;
      if (block.imagePosition === 'left') return `<tr>${cO}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;"><tr><td width="40%" valign="top" style="padding:0;"><img src="${escA(block.productImage)}" alt="${escA(block.productName)}" width="240" style="width:100%;height:auto;display:block;" /></td><td valign="top" style="padding:16px;font-family:${block.fontFamily};">${badge}${nm}${desc}${prH}${btn}</td></tr></table>${cC}</tr>`;
      return `<tr>${cO}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;max-width:320px;margin:0 auto;" align="center"><tr><td style="padding:0;"><img src="${escA(block.productImage)}" alt="${escA(block.productName)}" width="320" style="width:100%;height:auto;display:block;" /></td></tr><tr><td style="padding:16px;font-family:${block.fontFamily};">${badge}${nm}${desc}${prH}${btn}</td></tr></table>${cC}</tr>`;
    }
    case 'countdown': {
      const end = block.endDate ? new Date(block.endDate) : new Date();
      const df = Math.max(0, end.getTime() - Date.now());
      const vs = [Math.floor(df / 864e5), Math.floor(df % 864e5 / 36e5), Math.floor(df % 36e5 / 6e4), Math.floor(df % 6e4 / 1e3)];
      const lb = ['GG', 'ORE', 'MIN', 'SEC'];
      const sh = [block.showDays !== false, block.showHours !== false, block.showMinutes !== false, block.showSeconds !== false];
      const dgs = `display:inline-block;font-size:${block.digitSize || 32}px;font-weight:bold;color:${block.digitColor || '#333'};background-color:${block.digitBg || '#fff'};border:2px solid ${block.accentColor || '#6c5ce7'};border-radius:${block.borderRadius || 8}px;padding:8px 14px;min-width:50px;text-align:center;font-family:${block.fontFamily};line-height:1.2;`;
      const dH = vs.map((v, i) => sh[i] ? `<td align="center" style="padding:0 4px;"><div style="${dgs}">${String(v).padStart(2, '0')}</div><span style="display:block;font-size:10px;color:${block.labelColor || '#999'};margin-top:4px;text-transform:uppercase;">${lb[i]}</span></td>` : '').filter(Boolean).join('');
      const tl = block.label ? `<p style="margin:0 0 12px 0;font-size:${block.fontSize || 14}px;color:${block.labelColor || '#555'};font-family:${block.fontFamily};">${escH(block.label)}</p>` : '';
      return `<tr>${cO}${tl}<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${dH}</tr></table>${cC}</tr>`;
    }
    default: return '';
  }
}

export function exportEmailHTML(blocks, options = {}) {
  const { bodyBg = '#f4f4f7', emailWidth = 600, preheaderText = '' } = options;
  const rows = blocks.map(b => blkHTML(b)).join('');
  const ph = preheaderText ? `<div style="display:none;font-size:1px;color:${bodyBg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escH(preheaderText)}${'&zwnj;&nbsp;'.repeat(30)}</div>` : '';
  return `<!DOCTYPE html>
<html lang="it" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title></title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style type="text/css">body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;}body{margin:0!important;padding:0!important;width:100%!important;}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}@media only screen and (max-width:${emailWidth + 40}px){.vee-email-container{width:100%!important;max-width:100%!important;}.vee-columns-row td{display:block!important;width:100%!important;padding:4px 0!important;}img{max-width:100%!important;height:auto!important;}}</style>
</head>
<body style="margin:0;padding:0;background-color:${bodyBg};-webkit-font-smoothing:antialiased;">
${ph}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bodyBg};"><tr><td align="center" style="padding:20px 0;">
<table role="presentation" class="vee-email-container" width="${emailWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width:${emailWidth}px;width:100%;background-color:#ffffff;">
${rows}
</table></td></tr></table></body></html>`;
}

// ============================================================
// SaveTemplateModal
// ============================================================
function SaveTemplateModal({ blocks, editorOptions, onClose, showToast }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const save = useCallback(() => {
    if (!name.trim()) { showToast?.('Inserisci un nome', 'error'); return; }
    const tpl = { name: name.trim(), description: desc.trim(), blocks: deepClone(blocks), options: { ...editorOptions }, savedAt: new Date().toISOString(), version: 2 };
    try {
      const ex = JSON.parse(localStorage.getItem('vee_custom_templates') || '[]');
      ex.unshift(tpl);
      localStorage.setItem('vee_custom_templates', JSON.stringify(ex.slice(0, 20)));
      showToast?.(`Template "${name}" salvato!`, 'success');
      onClose();
    } catch { showToast?.('Errore nel salvataggio', 'error'); }
  }, [name, desc, blocks, editorOptions, onClose, showToast]);

  return (
    <div className="vee-modal-overlay" onClick={onClose}>
      <div className="vee-modal" onClick={e => e.stopPropagation()}>
        <div className="vee-modal-header"><h3>💾 Salva come template</h3><button onClick={onClose} className="vee-modal-close">✕</button></div>
        <div className="vee-modal-body">
          <p className="vee-modal-desc">Il design verrà salvato come template riutilizzabile.</p>
          <label className="vee-modal-label">Nome template</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Es. Newsletter Mensile" className="vee-modal-input" autoFocus maxLength={60} onKeyDown={e => { if (e.key === 'Enter') save(); }} />
          <label className="vee-modal-label">Descrizione (opzionale)</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Breve descrizione..." className="vee-modal-input" maxLength={120} />
          <div className="vee-modal-info"><p>📦 Include {blocks.length} blocchi e impostazioni layout.</p></div>
        </div>
        <div className="vee-modal-footer">
          <button onClick={onClose} className="vee-sidebar-btn">Annulla</button>
          <button onClick={save} className="vee-sidebar-btn vee-sidebar-btn-primary">💾 Salva</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main VisualEmailEditor Component
// ============================================================
export default function VisualEmailEditor({ initialBlocks, onChange, bodyBg = '#f4f4f7' }) {
  const [blocks, setBlocks] = useState(() => initialBlocks?.length > 0 ? deepClone(initialBlocks) : []);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('blocks');
  const [emailWidth, setEmailWidth] = useState(600);
  const [preheaderText, setPreheaderText] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const [draggingBlockId, setDraggingBlockId] = useState(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [customTemplates, setCustomTemplates] = useState([]);
  const [previewMode, setPreviewMode] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const historyRef = useRef([]);
  const historyIdxRef = useRef(-1);
  const blocksRef = useRef(blocks);
  const onChangeRef = useRef(onChange);
  const mountedRef = useRef(true);
  const bodyBgRef = useRef(bodyBg);
  const emailWidthRef = useRef(emailWidth);
  const preheaderTextRef = useRef(preheaderText);

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { bodyBgRef.current = bodyBg; }, [bodyBg]);
  useEffect(() => { emailWidthRef.current = emailWidth; }, [emailWidth]);
  useEffect(() => { preheaderTextRef.current = preheaderText; }, [preheaderText]);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const toast = useCallback((msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => { if (mountedRef.current) setToastMsg(null); }, 3000);
  }, []);

  useEffect(() => { try { setCustomTemplates(JSON.parse(localStorage.getItem('vee_custom_templates') || '[]')); } catch { setCustomTemplates([]); } }, [showSaveTemplate]);

  const pushHistory = useCallback((nb) => {
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(deepClone(nb));
    if (historyRef.current.length > 60) historyRef.current.shift();
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  const applyBlocks = useCallback((nb, skipH = false) => {
    setBlocks(nb);
    if (!skipH) pushHistory(nb);
    onChangeRef.current?.(nb, exportEmailHTML(nb, { bodyBg: bodyBgRef.current, emailWidth: emailWidthRef.current, preheaderText: preheaderTextRef.current }));
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const prev = deepClone(historyRef.current[historyIdxRef.current]);
    setBlocks(prev);
    onChangeRef.current?.(prev, exportEmailHTML(prev, { bodyBg: bodyBgRef.current, emailWidth: emailWidthRef.current, preheaderText: preheaderTextRef.current }));
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const next = deepClone(historyRef.current[historyIdxRef.current]);
    setBlocks(next);
    onChangeRef.current?.(next, exportEmailHTML(next, { bodyBg: bodyBgRef.current, emailWidth: emailWidthRef.current, preheaderText: preheaderTextRef.current }));
  }, []);

  useEffect(() => { if (historyRef.current.length === 0 && blocks.length > 0) pushHistory(blocks); }, [blocks, pushHistory]);

  const addBlock = useCallback((type, at = -1) => {
    const nb = [...blocksRef.current];
    const n = defaultProps(type);
    at >= 0 ? nb.splice(at, 0, n) : nb.push(n);
    applyBlocks(nb);
    setSelectedId(n.id);
  }, [applyBlocks]);

  const updateBlock = useCallback((upd) => { applyBlocks(blocksRef.current.map(b => b.id === upd.id ? upd : b)); }, [applyBlocks]);

  const deleteBlock = useCallback((id) => {
    applyBlocks(blocksRef.current.filter(b => b.id !== id));
    setSelectedId(prev => prev === id ? null : prev);
  }, [applyBlocks]);

  const duplicateBlock = useCallback((id) => {
    const idx = blocksRef.current.findIndex(b => b.id === id);
    if (idx === -1) return;
    const cl = deepClone(blocksRef.current[idx]);
    cl.id = uid();
    if (cl.columns) cl.columns = cl.columns.map(c => ({ ...c, id: uid(), blocks: c.blocks.map(b => ({ ...b, id: uid() })) }));
    const nb = [...blocksRef.current]; nb.splice(idx + 1, 0, cl);
    applyBlocks(nb); setSelectedId(cl.id);
  }, [applyBlocks]);

  const moveBlock = useCallback((from, to) => {
    if (from === to || from < 0 || to < 0) return;
    const nb = [...blocksRef.current]; const [m] = nb.splice(from, 1);
    nb.splice(to > from ? to - 1 : to, 0, m);
    applyBlocks(nb);
  }, [applyBlocks]);

  const handleColumnDrop = useCallback((columnsBlockId, columnId, data) => {
    if (!data) return;
    const nb = [...blocksRef.current];
    const colIdx = nb.findIndex(b => b.id === columnsBlockId);
    if (colIdx === -1) return;
    const colBlock = deepClone(nb[colIdx]);
    const targetCol = colBlock.columns.find(c => c.id === columnId);
    if (!targetCol) return;

    // Check if it's a block type from sidebar
    const blockType = BLOCK_TYPES.find(bt => bt.type === data);
    if (blockType) {
      // New block from sidebar
      const newBlock = defaultProps(data);
      targetCol.blocks.push(newBlock);
      nb[colIdx] = colBlock;
      applyBlocks(nb);
      return;
    }

    // Check if it's an existing top-level block being dragged in
    const existingIdx = nb.findIndex(b => b.id === data);
    if (existingIdx !== -1) {
      // Don't allow dropping a columns block inside another columns block
      if (nb[existingIdx].type === 'columns2' || nb[existingIdx].type === 'columns3') return;
      const movedBlock = deepClone(nb[existingIdx]);
      movedBlock.id = uid(); // New id for column context
      targetCol.blocks.push(movedBlock);
      // Remove from top level
      nb.splice(existingIdx, 0); // don't remove - user might want to keep it
      // Actually, let's move it (remove from top level)
      const updatedNb = nb.filter(b => b.id === data ? false : true);
      const ci = updatedNb.findIndex(b => b.id === columnsBlockId);
      if (ci !== -1) updatedNb[ci] = colBlock;
      applyBlocks(updatedNb);
      setSelectedId(null);
      return;
    }

    // Check if it's a block from another column in the same columns block
    let sourceColId = null, sourceBlockId = data;
    for (const c of colBlock.columns) {
      if (c.id === columnId) continue;
      const bi = c.blocks.findIndex(b => b.id === data);
      if (bi !== -1) {
        sourceColId = c.id;
        const [moved] = c.blocks.splice(bi, 1);
        targetCol.blocks.push(moved);
        break;
      }
    }
    nb[colIdx] = colBlock;
    applyBlocks(nb);
  }, [applyBlocks]);

  const applyTemplate = useCallback((tpl) => {
    if (blocksRef.current.length > 0 && !confirm('Applicare il template? I blocchi attuali verranno sostituiti.')) return;
    const nb = typeof tpl.blocks === 'function' ? tpl.blocks() : deepClone(tpl.blocks).map(b => ({ ...b, id: uid() }));
    applyBlocks(nb); setSelectedId(null); toast(`Template "${tpl.name}" applicato!`);
  }, [applyBlocks, toast]);

  const deleteCustomTemplate = useCallback((idx) => {
    if (!confirm('Eliminare questo template?')) return;
    try { const s = JSON.parse(localStorage.getItem('vee_custom_templates') || '[]'); s.splice(idx, 1); localStorage.setItem('vee_custom_templates', JSON.stringify(s)); setCustomTemplates(s); toast('Template eliminato'); } catch {}
  }, [toast]);

  const exportJSON = useCallback(() => {
    const d = JSON.stringify({ blocks: blocksRef.current, options: { bodyBg: bodyBgRef.current, emailWidth: emailWidthRef.current, preheaderText: preheaderTextRef.current }, version: 2 }, null, 2);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([d], { type: 'application/json' })); a.download = 'email-design.json'; a.click();
    URL.revokeObjectURL(a.href);
    toast('Design esportato come JSON');
  }, [toast]);

  const importJSON = useCallback(() => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
    inp.onchange = (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          const d = JSON.parse(ev.target.result);
          let imp = [];
          if (d.blocks && Array.isArray(d.blocks)) { imp = d.blocks.map(b => ({ ...b, id: uid() })); if (d.options?.emailWidth) setEmailWidth(d.options.emailWidth); if (d.options?.preheaderText !== undefined) setPreheaderText(d.options.preheaderText); }
          else if (Array.isArray(d)) imp = d.map(b => ({ ...b, id: uid() }));
          if (imp.length > 0) { applyBlocks(imp); toast(`Importati ${imp.length} blocchi`); }
          else toast('File non valido', 'error');
        } catch { toast('Errore lettura file', 'error'); }
      };
      r.readAsText(f);
    };
    inp.click();
  }, [applyBlocks, toast]);

  // Drag from sidebar
  const handleSidebarDrag = useCallback((e, type) => { e.dataTransfer.setData('text/plain', type); e.dataTransfer.effectAllowed = 'copy'; setDraggingBlockId('sidebar'); }, []);
  const handleDragEnd = useCallback(() => { setDragOverIndex(-1); setDraggingBlockId(null); }, []);
  const handleCanvasDragOver = useCallback((e, idx) => { e.preventDefault(); e.dataTransfer.dropEffect = draggingBlockId === 'sidebar' ? 'copy' : 'move'; setDragOverIndex(idx); }, [draggingBlockId]);
  const handleCanvasDrop = useCallback((e, dropIdx) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (draggingBlockId === 'sidebar' && type && BLOCK_TYPES.find(bt => bt.type === type)) addBlock(type, dropIdx);
    else if (draggingBlockId && draggingBlockId !== 'sidebar') { const fi = blocksRef.current.findIndex(b => b.id === draggingBlockId); if (fi !== -1) moveBlock(fi, dropIdx); }
    setDragOverIndex(-1); setDraggingBlockId(null);
  }, [draggingBlockId, addBlock, moveBlock]);
  const handleBlockDrag = useCallback((e, id) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; setDraggingBlockId(id); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedId) { e.preventDefault(); duplicateBlock(selectedId); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) { const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return; e.preventDefault(); deleteBlock(selectedId); }
      if (e.key === 'Escape') setSelectedId(null);
    };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [selectedId, undo, redo, duplicateBlock, deleteBlock]);

  const selectedBlock = useMemo(() => blocks.find(b => b.id === selectedId) || null, [blocks, selectedId]);
  const blockCats = useMemo(() => {
    const c = { content: [], action: [], media: [], layout: [], footer: [] };
    BLOCK_TYPES.forEach(bt => { if (c[bt.category]) c[bt.category].push(bt); });
    return c;
  }, []);
  const catLabels = { content: '📝 Contenuto', action: '🎯 Azione', media: '🖼️ Media', layout: '📐 Layout', footer: '🔻 Footer' };

  return (
    <div className="vee-container">
      {toastMsg && <div className={`vee-local-toast vee-toast-${toastMsg.type}`}>{toastMsg.msg}</div>}

      {/* SIDEBAR */}
      <div className="vee-sidebar">
        <div className="vee-sidebar-tabs">
          <button className={sidebarTab === 'blocks' ? 'active' : ''} onClick={() => setSidebarTab('blocks')} title="Blocchi">🧱</button>
          <button className={sidebarTab === 'templates' ? 'active' : ''} onClick={() => setSidebarTab('templates')} title="Template">📋</button>
          <button className={sidebarTab === 'settings' ? 'active' : ''} onClick={() => setSidebarTab('settings')} title="Impostazioni">⚙️</button>
        </div>
        <div className="vee-sidebar-content">
          {sidebarTab === 'blocks' && <div className="vee-sidebar-scroll">
            {Object.entries(blockCats).map(([cat, types]) => <div key={cat} className="vee-block-category">
              <div className="vee-category-label">{catLabels[cat]}</div>
              {types.map(bt => <button key={bt.type} className="vee-block-type-btn" draggable onDragStart={e => handleSidebarDrag(e, bt.type)} onDragEnd={handleDragEnd} onClick={() => addBlock(bt.type)} title={`Aggiungi ${bt.label}`}>{bt.label}</button>)}
            </div>)}
          </div>}

          {sidebarTab === 'templates' && <div className="vee-sidebar-scroll">
            <div className="vee-category-label">📦 Template predefiniti</div>
            {TEMPLATES.map((tpl, i) => <button key={i} onClick={() => applyTemplate(tpl)} className="vee-template-btn"><span className="vee-template-name">{tpl.name}</span><span className="vee-template-desc">{tpl.description}</span></button>)}
            {customTemplates.length > 0 && <>
              <div className="vee-category-label" style={{ marginTop: 16 }}>💾 I miei template</div>
              {customTemplates.map((tpl, i) => <div key={i} className="vee-custom-template-row">
                <button onClick={() => applyTemplate(tpl)} className="vee-template-btn vee-template-btn-custom"><span className="vee-template-name">📄 {tpl.name}</span>{tpl.description && <span className="vee-template-desc">{tpl.description}</span>}<span className="vee-template-meta">{tpl.blocks?.length || 0} blocchi · {new Date(tpl.savedAt).toLocaleDateString('it-IT')}</span></button>
                <button onClick={() => deleteCustomTemplate(i)} className="vee-mini-btn vee-danger-text" title="Elimina">✕</button>
              </div>)}
            </>}
            <div className="vee-sidebar-divider" />
            <div className="vee-category-label">🔧 Strumenti</div>
            <button onClick={() => setShowSaveTemplate(true)} className="vee-sidebar-btn vee-sidebar-btn-primary" disabled={blocks.length === 0}>💾 Salva come template</button>
            <button onClick={exportJSON} className="vee-sidebar-btn" disabled={blocks.length === 0}>📤 Esporta JSON</button>
            <button onClick={importJSON} className="vee-sidebar-btn">📥 Importa JSON</button>
          </div>}

          {sidebarTab === 'settings' && <div className="vee-sidebar-scroll">
            <div className="vee-category-label">📐 Layout</div>
            <label className="vee-settings-label">Larghezza (px)</label>
            <input type="number" value={emailWidth} onChange={e => setEmailWidth(clamp(e.target.value, 320, 800))} min="320" max="800" className="vee-settings-input" />
            <label className="vee-settings-label">Sfondo body</label>
            <input type="color" value={bodyBg} readOnly className="vee-settings-color" title="Da CampaignEditor" />
            <div className="vee-category-label" style={{ marginTop: 16 }}>✉️ Preheader</div>
            <p className="vee-settings-desc">Testo nascosto visibile nell'anteprima di Gmail, Libero, ecc.</p>
            <textarea className="vee-settings-textarea" value={preheaderText} onChange={e => setPreheaderText(e.target.value)} rows={2} maxLength={200} placeholder="Es. Le migliori offerte..." />
            <span className="vee-settings-counter">{preheaderText.length}/200</span>
            <div className="vee-category-label" style={{ marginTop: 16 }}>👁️ Anteprima</div>
            <div className="vee-preview-toggle-group">
              <button className={`vee-preview-toggle ${previewMode === null ? 'active' : ''}`} onClick={() => setPreviewMode(null)}>Editor</button>
              <button className={`vee-preview-toggle ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')}>Desktop</button>
              <button className={`vee-preview-toggle ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')}>Mobile</button>
            </div>
            <div className="vee-sidebar-divider" />
            <div className="vee-category-label">📊 Deliverability</div>
            <EmailStatsBar blocks={blocks} preheaderText={preheaderText} />
          </div>}
        </div>
      </div>

      {/* CANVAS */}
      <div className="vee-canvas" onClick={() => setSelectedId(null)} style={{ backgroundColor: bodyBg }}>
        {previewMode ? (
          <div className="vee-preview-container" style={{ maxWidth: previewMode === 'mobile' ? 375 : emailWidth }}>
            <iframe title={`Anteprima ${previewMode}`} srcDoc={exportEmailHTML(blocks, { bodyBg, emailWidth: previewMode === 'mobile' ? 375 : emailWidth, preheaderText })} className="vee-preview-iframe" sandbox="allow-same-origin" />
          </div>
        ) : (
          <div className="vee-email-frame" style={{ maxWidth: emailWidth }}>
            <div className={`vee-drop-zone ${dragOverIndex === 0 ? 'active' : ''}`} onDragOver={e => handleCanvasDragOver(e, 0)} onDrop={e => handleCanvasDrop(e, 0)} onDragLeave={() => setDragOverIndex(-1)} />
            {blocks.length === 0 && !draggingBlockId && <div className="vee-empty-state"><div className="vee-empty-icon">📧</div><h3>Inizia a costruire la tua email</h3><p>Trascina un blocco dalla barra laterale o scegli un template</p></div>}
            {blocks.map((block, index) => (
              <div key={block.id} className={`vee-block-wrapper ${selectedId === block.id ? 'selected' : ''} ${draggingBlockId === block.id ? 'dragging' : ''}`}>
                {selectedId === block.id && (
                  <div className="vee-block-toolbar" onClick={e => e.stopPropagation()}>
                    <span className="vee-block-drag-handle" draggable onDragStart={e => handleBlockDrag(e, block.id)} onDragEnd={handleDragEnd} title="Trascina per riordinare">⠿</span>
                    <span className="vee-block-type-label">{BLOCK_TYPES.find(bt => bt.type === block.type)?.label || block.type}</span>
                    <div className="vee-block-actions">
                      <button onClick={e => { e.stopPropagation(); duplicateBlock(block.id); }} title="Duplica (Ctrl+D)">📋</button>
                      <button onClick={e => { e.stopPropagation(); deleteBlock(block.id); }} className="vee-danger-text" title="Elimina (Del)">🗑️</button>
                    </div>
                  </div>
                )}
                <BlockPreview block={block} isSelected={selectedId === block.id} onSelect={setSelectedId} onUpdate={updateBlock} onColumnDrop={handleColumnDrop} draggingBlockId={draggingBlockId} />
                <div className={`vee-drop-zone ${dragOverIndex === index + 1 ? 'active' : ''}`} onDragOver={e => handleCanvasDragOver(e, index + 1)} onDrop={e => handleCanvasDrop(e, index + 1)} onDragLeave={() => setDragOverIndex(-1)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PROPERTIES PANEL */}
      {selectedBlock && <PropertiesPanel block={selectedBlock} onUpdate={updateBlock} onClose={() => setSelectedId(null)} />}
      {showSaveTemplate && <SaveTemplateModal blocks={blocks} editorOptions={{ bodyBg, emailWidth, preheaderText }} onClose={() => setShowSaveTemplate(false)} showToast={toast} />}
    </div>
  );
}
