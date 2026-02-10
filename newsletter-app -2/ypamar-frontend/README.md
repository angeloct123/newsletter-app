# YPAMAR Newsletter v8.1

Piattaforma completa per la gestione e l'invio di newsletter professionali, con editor email visuale drag & drop avanzato integrato in React.

## Architettura

```
src/
├── main.jsx                    # Entry point React
├── App.jsx                     # Router principale (context-based)
├── context/
│   └── AppContext.jsx          # State management centralizzato (auth, nav, toasts)
├── components/
│   ├── LoginPage.jsx           # Autenticazione
│   ├── Sidebar.jsx             # Navigazione laterale
│   ├── ToastContainer.jsx      # Notifiche
│   ├── Dashboard.jsx           # Dashboard con stats e grafici
│   ├── CampaignsPage.jsx       # Lista campagne (card premium, drag & drop reorder, search/filter) — v3.0
│   ├── CampaignsPage.css      # Stili pagina campagne (card grid, badges, modali, skeleton, 21K caratteri) — v3.0
│   ├── CampaignEditor.jsx      # Editor campagna (device preview, custom modals) — v3.0
│   ├── CampaignEditor.css      # Stili editor campagna (device frames, modali, 36K caratteri) — v3.0
│   ├── CampaignReport.jsx      # Report analytics premium (5 tab, geo/device/browser stats, funnel) — v2.0
│   ├── CampaignReport.css      # Stili report analytics (stat cards, funnel, timeline, 20K caratteri) — v2.0
│   ├── SubscribersPage.jsx     # Gestione iscritti + import/export
│   ├── SettingsPage.jsx        # Configurazione SMTP/tracking
│   ├── TagInput.jsx            # Componente riutilizzabile per tag
│   ├── VisualEmailEditor.jsx   # Editor email drag & drop (React puro) — v7.1
│   └── VisualEmailEditor.css   # Stili editor email (dark theme, 15 sezioni, 150+ selettori)
├── utils/
│   ├── api.js                  # HTTP client con auth headers
│   ├── sanitize.js             # DOMPurify wrapper
│   └── templates.js            # Template email predefiniti
└── styles/
    └── global.css              # Design system + tutti gli stili
```

## Novità v8.1 vs v8.0

### CSS dedicati per CampaignsPage e CampaignReport

| Area | v8.0 | v8.1 |
|------|------|------|
| **CampaignsPage CSS** | Assente — classi `cp-*` senza stili, layout rotto | `CampaignsPage.css` dedicato (21K caratteri, 80+ selettori) |
| **CampaignReport CSS** | Presente ma non documentato | `CampaignReport.css` documentato (20K caratteri) |
| **Layout campagne** | HTML nudo, spazio vuoto, nessuna grafica | Card grid premium full-width, responsive 3 breakpoint |
| **Badges stato** | Testo piatto senza stile | 4 badge colorati con bordi, icone, pulse animation (sending) |
| **Skeleton** | Non renderizzato (classi assenti) | 6 skeleton card con shimmer sfalsato |
| **Modali** | Non stilizzate | Backdrop blur, scale animation, duplicate options |
| **Quick actions** | Non visibili | Overlay gradient con hover reveal |
| **Drag & drop** | Nessun feedback visivo | Card inclinata + glow viola su drag-over |
| **Search/Filter** | Input senza stile | Search bar con shortcut, filter pills, sort dropdown custom |
| **README** | CSS non documentati | Sezioni dedicate per tutti e 4 i file CSS |

## Novità v8.0 vs v7.1

### CampaignsPage v3.0 (era lista base)

| Area | v7.1 (old) | v8.0 (v3.0) |
|------|------------|--------------|
| **Layout** | Lista semplice con righe | Card grid premium con status colorati |
| **Loading** | Spinner generico | Skeleton card animate con stagger |
| **Ricerca** | Assente | Search bar con shortcut `Ctrl+K`, clear button |
| **Filtro stato** | Assente | Filtri per stato (Tutte/Bozza/Programmata/In invio/Inviata) |
| **Ordinamento** | Solo cronologico | 4 criteri (recenti, meno recenti, nome A-Z, stato) + ordine custom |
| **Drag & Drop** | Assente | Riordino card con drag & drop, ghost animato, persistenza in localStorage |
| **Quick Stats** | Assente | Barra riepilogo (totali, inviate, bozze, programmate) cliccabili come filtro |
| **Eliminazione** | `window.confirm` nativo | Modale custom con conferma visuale e stato loading |
| **Duplicazione** | Solo duplica | Modale con 2 opzioni: "Duplica e modifica" / "Duplica e basta" |
| **Hover actions** | Assente | Quick actions floating bar (modifica/report, duplica, elimina) |
| **Stat bar** | Solo numeri testuali | Mini progress bar colorate per aperture/click/inviate per ogni card |
| **Sending progress** | Testo statico | Barra progresso invio animata nella card |
| **Shortcuts** | Assente | `Ctrl+K` focus ricerca, `Ctrl+N` nuova campagna |
| **Stile** | Classi utility generiche | CSS dedicato con prefisso `cp-`, badge con icone |

### CampaignEditor v3.0 (era v2)

| Area | v7.1 (old) | v8.0 (v3.0) |
|------|------------|--------------|
| **Device Preview** | Solo iframe semplice nel tab Anteprima | Toggle Desktop/Tablet/Mobile con frame realistici (phone notch, tablet camera) |
| **Conferme** | `window.confirm` nativo | Custom `ConfirmModal` con icone, variant (primary/danger), promise-based |
| **Auto-save restore** | `confirm()` nativo | Modale custom asincrona per ripristino salvataggio |
| **Mode switch** | `confirm()` per avviso perdita codice | `ConfirmModal` async/await con icona ⚠️ |
| **Placeholder** | Solo tag + descrizione | Tag + descrizione + icona emoji per ogni variabile |
| **Keyboard shortcuts** | Assente | `Ctrl+S` salva bozza, `Ctrl+Enter` apre test modal |
| **Options highlight** | Assente | Pulsante Opzioni con sfondo/bordo evidenziato quando pannello aperto |
| **Preview toolbar** | Solo "Apri in nuova finestra" | Device toggle (Desktop/Tablet/Mobile) + nuova finestra |
| **DeviceFrame** | Assente | Componente dedicato con frame smartphone (notch + home bar) e tablet (camera + home) |
| **CSS** | 13K caratteri | 36K caratteri (device frames, modal overlay, enhanced UI) |

### CampaignReport v2.0 (era base)

| Area | v7.1 (old) | v8.0 (v2.0) |
|------|------------|--------------|
| **Tab** | 4 tab (Overview, Click, Iscritti, Anteprima) | 5 tab (Overview, Engagement, Click, Audience, Anteprima) con icone |
| **Stats cards** | 4 stat card semplici (testo) | 5 stat card animate con `useCountUp` (easeOutExpo), icone, colori per tipo |
| **Benchmark** | Assente | Confronto vs medie di settore (Mailchimp) con badge ▲/▼/≈ |
| **Funnel** | Assente | Visualizzazione funnel Inviate → Aperte → Cliccate con barre proporzionali e dropoff % |
| **Geo stats** | Assente | Aperture per città con mini bar chart (top 15) |
| **Device stats** | Assente | Breakdown Desktop/Mobile/Tablet con barre animate e percentuali |
| **Browser stats** | Assente | Statistiche browser (Chrome, Safari, Firefox, Edge, Outlook, Thunderbird) |
| **Timeline** | Assente | Timeline aperture e click per ora/giorno con bar chart e legenda |
| **Loading** | Spinner generico | Skeleton completo con placeholder animati |
| **Auto-refresh** | Assente | Polling ogni 10s per campagne in stato "sending" |
| **Export** | Assente | Export CSV completo del report (metriche + aperture + click) |
| **Share** | Assente | Copia link report negli appunti |
| **Sending progress** | Assente | Banner progresso invio con barra animata, contatore, fallite |
| **Preview** | iframe semplice | Device preview con frame smartphone/tablet (come nell'editor) |
| **Click ranking** | Lista con progress bar | Ranking con medaglie 🥇🥈🥉, barra proporzionale, percentuali |
| **Audience** | Lista base (max 50) | Tabella strutturata (email, nome, aperture, prima/ultima apertura, max 100), stagger animation |
| **Performance** | Progress bar semplici | Barre con 5 metriche (consegnate, aperture, click, CTO, bounce) |
| **Componenti custom** | Nessuno | `AnimatedNum`, `MiniBar`, `Funnel`, `StatBar`, `VsBenchmark`, `DeviceFrame`, `ReportSkeleton` |

## Storico versioni precedenti

### v7.1 vs v7.0

| Area | v7.0 | v7.1 |
|------|------|------|
| **Blocchi** | 14 tipi | 16 tipi (+Countdown, +Product Card) |
| **Immagini** | Solo URL manuale | Drag & drop upload + URL (base64, max 5MB) |
| **Template** | Solo predefiniti | Salvataggio template custom in localStorage |
| **Qualità** | Nessun check | Deliverability score 0-100 in tempo reale |
| **Anteprima** | Desktop/Tablet/Mobile canvas | + Anteprima mobile con frame smartphone |
| **Spam check** | Assente | 30+ parole spam IT/EN rilevate automaticamente |
| **CSS** | 18K caratteri, 52 selettori | 40K caratteri, 150 selettori, 42 variabili, 10 animazioni |

### v7.0 vs v6.0

| Area | v6.0 | v7.0 |
|------|------|------|
| **Editor** | iframe + postMessage (`visual-editor.html`) | Componente React puro, zero iframe |
| **Drag & Drop** | Limitato (su/giù con freccette) | Drag & drop fluido tra blocchi + dalla sidebar |
| **Sincronizzazione** | Buggy (closure stale, visual bianco) | Stato React diretto, nessuna race condition |
| **Export HTML** | innerHTML grezzo | Table-based, compatibile Gmail/Outlook/Apple Mail |
| **Outlook** | Non supportato | VML conditional comments per bottoni arrotondati |
| **Undo/Redo** | History nell'iframe (persa al switch mode) | 30 stati in React, persistente tra le modalità |
| **Template** | Applicazione buggata (non aggiornava iframe) | Istantanea, blocchi strutturati |
| **Blocchi** | 10 tipi | 14 tipi (+ social, video, spacer, colonne 2/3) |
| **Proprietà** | Pannello base | Pannello completo (font, colori, padding 4 lati, allineamento, ecc.) |
| **Preview** | Solo desktop | Desktop, Tablet (768px), Mobile (375px) |

## Visual Email Editor v7.1

L'editor email è un componente React autonomo (`VisualEmailEditor.jsx`) che:

- **Non usa iframe** — vive nello stesso albero React del CampaignEditor
- **Blocchi strutturati** — ogni elemento è un oggetto JS con tipo e proprietà
- **Drag & drop** — trascina blocchi dalla sidebar, riordina con drag, duplica con un click
- **Export email-safe** — genera HTML basato su `<table>` compatibile con tutti i client
- **Pannello proprietà** — modifica visuale di colori, font, padding, border, link, ecc.
- **Salvataggio blocchi** — il campo `editor_blocks` nel DB preserva la struttura per il re-editing
- **Undo/Redo** — fino a 30 stati + scorciatoie `Ctrl+Z` / `Ctrl+Y`
- **Keyboard shortcuts** — Delete per rimuovere il blocco selezionato

### Blocchi disponibili (16 tipi)

| Categoria | Blocchi |
|-----------|---------|
| **Contenuto** | Intestazione, Titolo, Testo, Citazione, Elenco, HTML Raw |
| **Azione** | Pulsante |
| **Media** | Immagine (drag & drop upload), Video (YouTube/Vimeo), Countdown Timer, Product Card |
| **Layout** | 2 Colonne, 3 Colonne, Spaziatura, Divisore |
| **Footer** | Social Links, Footer (indirizzo + unsubscribe) |

### Feature 1 — Upload immagini drag & drop

Il componente `ImageDropZone` gestisce l'upload immagini direttamente nel canvas:

- Drag & drop di file con feedback visivo (bordo animato, overlay colorato)
- Click-to-upload come fallback
- Validazione tipo (JPG, PNG, GIF, WebP, SVG) e dimensione (max 5 MB)
- Conversione automatica a base64 via `FileReader`
- Stato di caricamento con spinner CSS animato
- Overlay hover "📷 Cambia immagine" sulle immagini esistenti
- Integrato nei blocchi `image` e `product`

### Feature 2 — Blocco Countdown

Timer animato con aggiornamento ogni secondo per email promozionali:

- **3 stili**: Boxes (cifre in riquadri), Inline (testo fluido), Minimal (DD:HH:MM:SS)
- Selettore data + ora scadenza con `input[type="date"]` e `input[type="time"]`
- Testo personalizzabile sopra il timer (`label`) e a timer scaduto (`expiredText`)
- Colori cifre, sfondo riquadri, dimensione font configurabili
- Etichette "Giorni, Ore, Minuti, Secondi" attivabili/disattivabili
- Export HTML table-based con valori calcolati al momento dell'export

### Feature 3 — Blocco Product Card

Card prodotto completa per email e-commerce:

- **2 layout**: Verticale (immagine sopra) e Orizzontale (immagine a sinistra, testo a destra)
- Upload immagine prodotto con drag & drop (stesso `ImageDropZone`)
- Prezzo attuale + prezzo originale barrato con calcolo percentuale sconto
- Badge personalizzabile (es. "SCONTO", "NUOVO", "-50%") con colore e posizionamento
- Pulsante CTA con testo, URL, colore sfondo e colore testo configurabili
- 5 valute supportate: €, $, £, CHF, UZS
- Editing inline diretto di nome e descrizione sulla canvas
- Tutti i colori e dimensioni testo configurabili dal pannello proprietà

### Feature 4 — Salvataggio template custom

Sistema di template utente persistente:

- Salvataggio in `localStorage` con chiave `vee_custom_templates`
- Modale dedicata con nome, categoria (6 opzioni: Generale, Promozione, Newsletter, Evento, Prodotto, Transazionale)
- Lista template custom nella sidebar tab "Template" con conteggio blocchi
- Caricamento template con deep clone e rigenerazione ID per evitare conflitti
- Eliminazione template custom con conferma
- Pulsante "💾 Salva Template" nella topbar del canvas

### Feature 5 — Deliverability score & stats in-editor

Analisi qualità email in tempo reale nella tab "📊 Stats" della sidebar:

- **Score 0-100** con anello SVG animato e 5 livelli (Eccellente ≥85, Buono ≥70, Sufficiente ≥55, Scarso ≥35, Critico <35)
- **Analisi oggetto**: lunghezza ottimale (30-60 char), maiuscole eccessive (>30%), emoji, punti esclamativi multipli
- **Spam detection**: 30+ parole spam in italiano e inglese (gratis, offerta, urgente, free, buy now, limited time, ecc.)
- **Controlli strutturali**: presenza footer, link disiscrizione, rapporto testo/immagini, almeno un CTA
- **Conteggio** blocchi e parole totali
- **Lista problemi** con icone ❌ (critici) / ⚠️ (warning) e punti di forza con ✅
- **Anteprima mobile live** con frame smartphone realistico (notch + home bar) e iframe aggiornato in tempo reale

## CampaignEditor v3.0

Editor campagna completo con workflow avanzato:

- **Device Preview** — toggle Desktop (660px) / Tablet (768px) / Mobile (375px) con frame realistici
- **DeviceFrame component** — frame smartphone con notch + camera + home bar, frame tablet con camera + home
- **ConfirmModal** — modale custom per tutte le conferme (promise-based, variant primary/danger, icone)
- **Placeholder con icone** — ogni variabile ha icona emoji (👤 nome, 📧 email, 📅 data, 🏢 azienda)
- **Keyboard shortcuts** — `Ctrl+S` salva bozza, `Ctrl+Enter` apre test modal
- **Auto-save** ogni 30s con ripristino via modale custom (non più `confirm()` nativo)
- **Options highlight** — feedback visivo quando pannello opzioni è aperto
- **CSS v3.0** — 36K caratteri con stili per device frame, modal overlay, animazioni avanzate

## CampaignsPage v3.0

Dashboard campagne completamente ridisegnata:

- **Card grid layout** — card premium con status colorati e badge con icone
- **Skeleton loading** — 6 card placeholder animate con stagger delay
- **Search & Filter** — ricerca in tempo reale su nome/oggetto + filtri per stato
- **Ordinamento** — 4 criteri + ordine personalizzato via drag & drop
- **Drag & Drop reorder** — riordino card con ghost animato (rotazione + scale + shadow), persistenza in localStorage
- **Quick Stats bar** — contatori (totali, inviate, bozze, programmate) cliccabili per filtrare
- **Quick Actions** — floating bar on hover con azioni rapide (modifica/report, duplica, elimina)
- **Modali custom** — `DeleteModal` con conferma visuale + `DuplicateModal` con 2 opzioni
- **StatBar component** — mini progress bar per ogni stat delle campagne inviate
- **Keyboard shortcuts** — `Ctrl+K` focus ricerca, `Ctrl+N` nuova campagna
- **Stagger animations** — animazioni sfalsate per entrata card

## CampaignReport v2.0

Dashboard analytics premium con 5 tab e visualizzazioni avanzate:

- **5 tab**: Overview, Engagement, Click, Audience, Anteprima (con icone)
- **Animated counters** — hook `useCountUp` con easing easeOutExpo per numeri animati
- **Benchmark comparison** — confronto vs medie di settore (Mailchimp) con badge ▲ migliore / ▼ peggiore / ≈ media
- **Funnel visualization** — Inviate → Aperte → Cliccate con barre proporzionali e dropoff %
- **Geo stats** — aperture per città con mini bar chart (top 15)
- **Device breakdown** — Desktop/Mobile/Tablet con barre + percentuali
- **Browser stats** — Chrome/Safari/Firefox/Edge/Outlook/Thunderbird con icone
- **Timeline** — aperture e click per ora/giorno con bar chart e legenda colori
- **Auto-refresh** — polling ogni 10s per campagne "sending"
- **Export CSV** — report completo scaricabile (metriche + aperture iscritti + click)
- **Share report** — copia link report negli appunti
- **Sending banner** — progresso invio con barra animata, contatore email, fallite
- **Device preview** — anteprima con frame smartphone/tablet (riutilizza DeviceFrame)
- **Skeleton loading** — placeholder completo durante il caricamento
- **Click ranking** — medaglie 🥇🥈🥉 con barre proporzionali e percentuali

## Template predefiniti

| Template | Blocchi | Descrizione |
|----------|---------|-------------|
| Newsletter Base | 7 | Header + intro + divisore + testo + CTA + social + footer |
| Promozione | 7 | Header + titolo offerta + immagine + testo promo + CTA + social + footer |
| Benvenuto | 5 | Header + testo benvenuto + CTA + social + footer |
| Vetrina Prodotti | 8 | Header + intro + 2 product card + divisore + CTA + social + footer |

## Setup

```bash
npm install
npm run dev      # Dev server su http://localhost:5173
npm run build    # Build produzione → dist/
npm run preview  # Preview build
```

## Integrazione VisualEmailEditor

```jsx
import VisualEmailEditor, { exportEmailHTML } from './VisualEmailEditor';

// Nel CampaignEditor:
<VisualEmailEditor
  initialBlocks={campaign.editor_blocks}
  onChange={setBlocks}
  subject={campaign.subject}  // Necessario per deliverability analysis
/>

// Per ottenere l'HTML finale:
const html = exportEmailHTML(blocks, {
  bodyBg: '#f4f4f7',
  emailWidth: 600,
  preheaderText: campaign.subject
});
```

### Props

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `initialBlocks` | `Array` | `[]` | Blocchi iniziali (da DB o template) |
| `onChange` | `Function` | — | Callback chiamata ad ogni modifica dei blocchi |
| `subject` | `String` | `''` | Oggetto email, usato per l'analisi deliverability |

### Export

| Export | Tipo | Descrizione |
|--------|------|-------------|
| `default` | Component | Il componente `VisualEmailEditor` |
| `exportEmailHTML` | Function | Genera HTML email-safe dai blocchi |

## CSS

### VisualEmailEditor.css (v7.1)

- **42 variabili CSS** custom properties per theming completo
- **150+ selettori** organizzati in 15 sezioni documentate
- **10 animazioni** (fadeIn, slideIn, spin, pulse, shimmer, bounce, ecc.)
- **3 breakpoint responsive** (1100px, 900px, 700px)
- **Accessibilità**: `focus-visible`, `prefers-reduced-motion`, `sr-only`
- **Scrollbar custom** per Webkit e Firefox
- **Dark theme** ottimizzato per lavoro prolungato

### CampaignEditor.css (v3.0)

- **36K caratteri** (~3× rispetto alla v2 con 13K)
- **Device frame styles** — phone (notch, camera, home bar), tablet (camera, home button)
- **Modal overlay** — backdrop blur, fade-in animation
- **ConfirmModal** — stili per variant primary/danger
- **Device toggle** — toolbar con pulsanti Desktop/Tablet/Mobile
- **Enhanced responsive** — layout ottimizzato per tutte le dimensioni

### CampaignsPage.css (v3.0)

- **21K caratteri** — CSS dedicato con prefisso `cp-` per la pagina campagne
- **Variabili locali** — `--cp-*` con fallback su `--bg-*`, `--accent`, `--border` del global.css
- **Card grid** — `repeat(auto-fill, minmax(360px, 1fr))` con hover premium (translateY, shadow, glow)
- **Stagger animations** — card con ingresso sfalsato (fadeIn + scale, 9 livelli di delay)
- **4 badge stato** — draft (grigio), scheduled (viola), sending (giallo pulsante), sent (verde)
- **Search bar** — icona lente, shortcut `⌘K`, clear button, focus glow viola
- **Filter pills** — pill arrotondati con stato active viola
- **Quick actions overlay** — gradient trasparente→scuro con 3 bottoni azione (hover reveal)
- **Drag & drop states** — card inclinata 1° durante drag, glow viola su drag-over
- **Modali** — backdrop blur, scale animation, duplicate modal con opzioni full-width
- **Skeleton loading** — 6 skeleton card con shimmer animation sfalsata
- **Sort dropdown** — select custom con freccia SVG
- **Buttons** — 5 varianti (primary, outline, danger, secondary, sm/lg)
- **3 breakpoint responsive** — 1100px, 768px, 480px
- **Accessibilità** — `focus-visible` su tutti gli interattivi
- **Print styles** — nasconde toolbar e actions, card senza shadow

### CampaignReport.css (v2.0)

- **20K caratteri** — CSS dedicato con variabili `--ce-*` ereditate dall'editor
- **5 stat card** — barra colorata top, layout flex responsive
- **Benchmark badges** — ▲ buono (verde) / ▼ scarso (rosso) / ≈ media (giallo)
- **Funnel** — barre proporzionali con label e dropoff percentuale
- **Timeline** — bar chart per aperture/click con legenda colori
- **MiniBar** — barre orizzontali per geo e browser stats
- **Device breakdown** — barre animate con percentuali
- **Click ranking** — medaglie 🥇🥈🥉 con barre proporzionali
- **Audience table** — griglia responsive con stagger animation
- **Sending banner** — progresso invio con shimmer animation
- **Skeleton loading** — placeholder completo durante caricamento
- **Tab navigation** — tab con icone e stato active
- **3 breakpoint responsive** — 1100px, 900px, 600px

## Proxy API

Il dev server è configurato per proxare `/api` verso `http://localhost:3001`. Modificare `vite.config.js` per puntare al backend reale.

## Database

La tabella `campaigns` richiede:

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `editor_blocks` | `TEXT` | JSON dei blocchi dell'editor (per ri-editing) |
| `html_content` | `TEXT` | HTML finale generato (per invio email) |
| `subject` | `VARCHAR(255)` | Oggetto email |

## Sicurezza

- **HTML sanitizzato** con DOMPurify prima di ogni rendering
- **Export CSV** usa `Authorization` header (non più token in URL)
- **JWT** in localStorage (step successivo: httpOnly cookies)
- **Nessun iframe nell'editor** — eliminato il vettore di attacco postMessage non validato
- **Immagini base64** — nessun upload a server esterni, i dati restano nel browser
- **Custom modals** — niente più `window.confirm()` / `window.alert()` (XSS-safer, UX migliore)

## Prossimi step

1. ~~Upload immagini integrato nell'editor~~ ✅ v7.1
2. ~~Template come array di blocchi~~ ✅ v7.0
3. ~~Report analytics avanzato~~ ✅ v8.0
4. ~~Eliminazione `window.confirm` nativi~~ ✅ v8.0
5. ~~Device preview con frame realistici~~ ✅ v8.0
6. Code splitting con `React.lazy()` per ridurre il bundle
7. httpOnly cookies per JWT
8. Unit test con Vitest
9. Upload immagini a S3/CDN (attualmente base64 in localStorage)
10. A/B testing integrato nell'editor
11. Blocco "Carousel" con immagini multiple
12. Blocco "Tabella dati" per contenuti strutturati
13. Dark mode toggle per preview email
14. ~~CampaignReport CSS dedicato~~ ✅ v8.1
15. ~~CampaignsPage CSS dedicato~~ ✅ v8.1
