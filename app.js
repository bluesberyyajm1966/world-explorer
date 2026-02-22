/* =====================================================
   WORLD EXPLORER — styles.css
   Exact original design: DM Serif Display + DM Sans,
   warm off-white background, blue accent, clean cards
   ===================================================== */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── TOKENS ─────────────────────────────────────────── */
:root {
  --bg:           #F7F5F0;
  --surface:      #FFFFFF;
  --border:       #E8E4DC;
  --text:         #1A1814;
  --muted:        #8A8478;
  --accent:       #2B5CE6;
  --accent-light: #EEF2FD;
  --positive:     #1A7A4A;
  --negative:     #C53030;
  --tag-bg:       #F0EDE7;
}

/* ── BASE ───────────────────────────────────────────── */
body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  font-size: 15px;
}

/* ── HEADER ─────────────────────────────────────────── */
header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  letter-spacing: -0.5px;
  color: var(--text);
}

.logo span { color: var(--accent); }

.header-meta {
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ── LAYOUT ─────────────────────────────────────────── */
.shell {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: calc(100vh - 64px);
}

/* ── SIDEBAR ────────────────────────────────────────── */
.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow: hidden;
}

.search-wrap {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.search-box {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}

.search-box:focus { border-color: var(--accent); }
.search-box::placeholder { color: var(--muted); }

.filter-row {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn.active,
.filter-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.country-count {
  padding: 10px 20px 6px;
  font-size: 11px;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.country-list {
  overflow-y: auto;
  flex: 1;
}

.country-list::-webkit-scrollbar { width: 4px; }
.country-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 20px;
  color: var(--muted);
  font-size: 14px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Country items */
.country-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
  animation: fadeSlide 0.2s ease both;
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.country-item:hover { background: var(--bg); }

.country-item.active {
  background: var(--accent-light);
  border-left: 3px solid var(--accent);
  padding-left: 17px;
}

.flag {
  font-size: 24px;
  width: 32px;
  text-align: center;
  flex-shrink: 0;
}

.country-info { flex: 1; min-width: 0; }

.country-name {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.country-region {
  font-size: 11px;
  color: var(--muted);
  margin-top: 1px;
}

.no-results {
  padding: 32px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
}

/* ── MAIN ───────────────────────────────────────────── */
main {
  padding: 40px;
  overflow-y: auto;
  height: calc(100vh - 64px);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.empty-globe {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  margin-bottom: 8px;
  color: var(--text);
}

.empty-state p {
  color: var(--muted);
  font-size: 15px;
  max-width: 360px;
  line-height: 1.6;
}

/* ── PROFILE ────────────────────────────────────────── */
.profile { animation: profileIn 0.3s ease; }

@keyframes profileIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Hero */
.profile-hero {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 36px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--border);
}

.profile-flag { font-size: 64px; line-height: 1; }

.profile-titles { flex: 1; }

.profile-name {
  font-family: 'DM Serif Display', serif;
  font-size: 42px;
  line-height: 1.1;
  letter-spacing: -1px;
  margin-bottom: 6px;
}

.profile-subtitle {
  color: var(--muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.profile-subtitle span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.profile-tags {
  margin-top: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--tag-bg);
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
}

.tag.accent {
  background: var(--accent-light);
  color: var(--accent);
}

/* Section label */
.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 14px;
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label .src-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.07em;
  padding: 2px 7px;
  border-radius: 4px;
  text-transform: uppercase;
}

.src-wb   { background: #E8F5EE; color: #1A7A4A; }
.src-imf  { background: #EEF2FD; color: #2B5CE6; }
.src-un   { background: #F3EEFF; color: #6B3EC5; }
.src-oecd { background: #FFF4E8; color: #C06A1A; }
.src-owid   { background: #FFECF0; color: #C5203A; }
.src-unesco { background: #FFF8E8; color: #C07A00; }

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  transition: box-shadow 0.15s, transform 0.15s;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--muted);
  margin-bottom: 8px;
}

.stat-value {
  font-family: 'DM Serif Display', serif;
  font-size: 28px;
  letter-spacing: -0.5px;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-sub {
  font-size: 12px;
  color: var(--muted);
}

/* Data section card */
.data-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 14px;
}

.data-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.data-section-header h3 {
  font-family: 'DM Serif Display', serif;
  font-size: 18px;
}

/* Data rows */
.data-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 11px 20px;
  border-bottom: 1px solid var(--border);
  gap: 16px;
  font-size: 14px;
  transition: background 0.1s;
}

.data-row:last-child { border-bottom: none; }
.data-row:hover { background: var(--bg); }

.data-row-label { color: var(--muted); flex: 1; }

.data-row-right { text-align: right; flex-shrink: 0; }

.data-row-value { font-weight: 500; color: var(--text); }

.data-row-year { font-size: 11px; color: var(--muted); margin-top: 1px; }

/* No data placeholder */
.no-data-row {
  padding: 20px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  font-style: italic;
}

/* ── TOAST ──────────────────────────────────────────── */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--text);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  z-index: 300;
  transform: translateY(80px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
  max-width: 320px;
}

.toast.show { transform: translateY(0); opacity: 1; }

/* ── SOURCE BADGES ──────────────────────────────────── */
.src-sipri  { background: #FFF0F0; color: #B00020; }

/* ── HEADER NAV ─────────────────────────────────────── */
.header-nav {
  display: flex;
  gap: 6px;
}

.nav-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.nav-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ── TOOLBAR (region row + gear) ────────────────────── */
.toolbar {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
}

.toolbar .filter-row {
  flex: 1;
  margin-top: 0;
}

.tool-btn {
  width: 30px;
  height: 28px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover,
.tool-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

/* ── FILTER PANEL (collapsible) ─────────────────────── */
.filter-panel {
  display: none;
  padding-top: 4px;
}

.filter-panel.open {
  display: block;
}

.panel-section {
  margin-top: 10px;
}

.panel-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 5px;
}

/* ── SORT ROW ───────────────────────────────────────── */
.sort-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.sort-select {
  flex: 1;
  padding: 5px 8px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  background: var(--bg);
  color: var(--text);
  outline: none;
  cursor: pointer;
}

.sort-select:focus { border-color: var(--accent); }

.sort-dir-btn {
  padding: 5px 9px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text);
}

.sort-dir-btn:hover { border-color: var(--accent); color: var(--accent); }

/* ── SORT VALUE BADGE ───────────────────────────────── */
.sort-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-light);
  padding: 2px 7px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── PAGE TRANSITION ────────────────────────────────── */
@keyframes profileExit {
  to { opacity: 0; transform: translateY(-6px); }
}

.profile-exit { animation: profileExit 0.16s ease forwards; }

/* ── MODALS ─────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  backdrop-filter: blur(3px);
}

.modal-overlay.open { opacity: 1; pointer-events: all; }

.modal-panel {
  background: var(--surface);
  border-radius: 20px;
  width: min(660px, 92vw);
  max-height: 84vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.16);
  transform: translateY(20px) scale(0.97);
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
  overflow: hidden;
}

.modal-overlay.open .modal-panel { transform: translateY(0) scale(1); }

.modal-panel--map {
  width: min(1000px, 95vw);
  max-height: 88vh;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.modal-header h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 19px;
  flex: 1;
}

.modal-controls { display: flex; gap: 6px; }

.modal-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--bg);
  font-size: 13px;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover { border-color: var(--negative); color: var(--negative); }

/* ── RANKINGS ───────────────────────────────────────── */
.rank-list {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
}

.rank-list::-webkit-scrollbar { width: 4px; }
.rank-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 22px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid var(--border);
}

.rank-item:last-child { border-bottom: none; }
.rank-item:hover { background: var(--bg); }

.rank-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted);
  width: 22px;
  text-align: right;
  flex-shrink: 0;
}

.rank-item:nth-child(1) .rank-num { color: #C4960A; font-size: 13px; }
.rank-item:nth-child(2) .rank-num { color: #8A9BB0; }
.rank-item:nth-child(3) .rank-num { color: #A0704A; }

.rank-flag { font-size: 19px; flex-shrink: 0; }

.rank-info { flex: 1; min-width: 0; }

.rank-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bar-wrap {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 4px;
}

.rank-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.rank-val {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  flex-shrink: 0;
  min-width: 56px;
  text-align: right;
}

/* ── MAP ────────────────────────────────────────────── */
.map-container {
  flex: 1;
  overflow: hidden;
  background: #07101e;
  position: relative;
  display: flex;
  align-items: stretch;
}

#globeCanvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  flex: 1;
}
#globeCanvas:active { cursor: grabbing; }

.globe-tooltip {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(7,16,30,0.88);
  color: #fff;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.18s;
  white-space: nowrap;
  z-index: 10;
  letter-spacing: 0.01em;
}
.globe-tooltip.show { opacity: 1; }

.globe-hint {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.35);
  font-size: 11px;
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: 0.02em;
  z-index: 10;
}

/* Map loading state */
.map-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  gap: 10px;
}

/* ── SEARCH CLEAR BUTTON ────────────────────────────── */
.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-input-wrap .search-box {
  padding-right: 34px;
}
.search-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  line-height: 1;
  transition: color 0.15s;
}
.search-clear:hover { color: var(--text); }

/* ── BACK TO TOP ────────────────────────────────────── */
.back-to-top {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  z-index: 150;
  transform: translateY(10px);
}
.back-to-top.visible {
  opacity: 1;
  pointer-events: all;
  transform: translateY(0);
}
.back-to-top:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 4px 20px rgba(43,92,230,0.18);
}

/* ── COLLAPSIBLE SECTIONS ───────────────────────────── */
.section-label {
  cursor: pointer;
  user-select: none;
}
.section-label:hover { opacity: 0.8; }
.section-collapse-icon {
  margin-left: auto;
  font-size: 12px;
  color: var(--muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.section-label.collapsed .section-collapse-icon { transform: rotate(-90deg); }
.data-section.collapsed { display: none; }

/* ── ABOUT / SOURCES MODAL ──────────────────────────── */
.modal-panel--about {
  width: min(760px, 95vw);
  max-height: 88vh;
}
.about-body {
  overflow-y: auto;
  flex: 1;
  padding: 28px 28px 24px;
}
.about-body::-webkit-scrollbar { width: 4px; }
.about-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
.about-intro {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.65;
  margin-bottom: 24px;
  max-width: 620px;
}
.source-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.source-card {
  display: block;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.source-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 20px rgba(43,92,230,0.10);
  transform: translateY(-2px);
}
.source-card .src-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.source-card-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  margin-bottom: 6px;
  line-height: 1.3;
}
.source-card-desc {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 10px;
}
.source-card-url {
  font-size: 11px;
  color: var(--accent);
  font-weight: 500;
}
.about-footer {
  font-size: 12px;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 18px;
  line-height: 1.6;
}
.about-footer a { color: var(--accent); text-decoration: none; }
.about-footer a:hover { text-decoration: underline; }

/* ── KEYBOARD SHORTCUT HINT ─────────────────────────── */
.kbd-hint {
  display: inline-block;
  background: var(--border);
  color: var(--muted);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  font-family: monospace;
  margin-left: 4px;
}

/* ── MOBILE RESPONSIVE ──────────────────────────────── */
@media (max-width: 768px) {
  header { padding: 0 16px; }
  .logo { font-size: 18px; }
  .nav-btn { padding: 6px 10px; font-size: 12px; }

  .shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  .sidebar {
    position: relative;
    top: 0;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  main {
    height: auto;
    min-height: 60vh;
    padding: 20px 16px;
  }
  .profile-name { font-size: 28px; }
  .profile-hero { gap: 14px; }
  .profile-flag { font-size: 44px; }
  .stats-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .source-grid { grid-template-columns: 1fr; }
  .back-to-top { bottom: 16px; right: 16px; }
  .modal-panel--map { max-height: 75vh; }
}
