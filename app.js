'use strict';

const S = {
  countries:   [],
  filtered:    [],
  selected:    null,
  region:      'all',
  income:      'all',
  sortField:   'name',
  sortDir:     'asc',
  query:       '',
  countryData: {},  // World Bank — keyed by ISO3
  imfData:     {},  // IMF       — keyed by ISO3 or ISO2
  oecdData:    {},  // OECD      — keyed by ISO2
  unData:      {},  // UN        — keyed by ISO3
  owidData:    {},  // OWID      — keyed by ISO3
  unescoData:  {},  // UNESCO    — keyed by ISO3
};

// ── UTILS ────────────────────────────────────────────

function flag(iso2) {
  if (!iso2 || iso2.length !== 2) return '🌐';
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
}

function fmt(val, decimals = 1) {
  if (val == null || val === '' || isNaN(+val)) return null;
  const n = parseFloat(val);
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(decimals) + 'T';
  if (Math.abs(n) >= 1e9)  return (n / 1e9).toFixed(decimals)  + 'B';
  if (Math.abs(n) >= 1e6)  return (n / 1e6).toFixed(decimals)  + 'M';
  if (Math.abs(n) >= 1e3)  return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function fmtPct(val, decimals = 1) {
  if (val == null || val === '' || isNaN(+val)) return null;
  return parseFloat(val).toFixed(decimals) + '%';
}

function fmtUSD(val, decimals = 2) {
  const f = fmt(val, decimals);
  return f ? '$' + f : null;
}

function sfx(val, decimals, unit) {
  const f = fmt(val, decimals);
  return f ? f + unit : null;
}

function wb(iso3, field)   { return S.countryData[iso3]?.[field] ?? null; }
function wbyr(iso3, field) { return S.countryData[iso3]?.[field + '_year'] ?? null; }

function imf(c, field) {
  const d = S.imfData[c.id] || S.imfData[c.iso2] || null;
  return d?.[field] ?? null;
}
function imfyr(c, field) {
  const d = S.imfData[c.id] || S.imfData[c.iso2] || null;
  return d?.[field + '_year'] ?? null;
}

function oecd(c, field) {
  const d = S.oecdData[c.iso2] || S.oecdData[c.id] || null;
  return d?.[field] ?? null;
}
function oecdyr(c, field) {
  const d = S.oecdData[c.iso2] || S.oecdData[c.id] || null;
  return d?.[field + '_year'] ?? null;
}

function un(c, field)   { return S.unData[c.id]?.[field] ?? null; }
function unyr(c, field) { return S.unData[c.id]?.[field + '_year'] ?? null; }

function owid(c, field)   { return S.owidData[c.id]?.[field] ?? null; }
function owidyr(c, field) { return S.owidData[c.id]?.[field + '_year'] ?? null; }

function unesco(c, field)   { return S.unescoData[c.id]?.[field] ?? null; }
function unescoyr(c, field) { return S.unescoData[c.id]?.[field + '_year'] ?? null; }

function toast(msg, duration = 4000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
}

async function fetchJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

// ── LOAD DATA ────────────────────────────────────────

async function loadAllData() {
  try {
    const json = await fetchJSON('data/worldbank/worldbank_data.json');
    const raw = Array.isArray(json) ? json : (json.countries || []);
    S.countries = parseWorldBank(raw);
    console.log(`✓ worldbank_data.json — ${S.countries.length} countries`);
  } catch (e) {
    console.error('worldbank_data.json missing:', e.message);
    toast('⚠ worldbank_data.json not found', 8000);
    document.getElementById('countLabel').textContent = '⚠ Missing file';
    return;
  }

  try {
    S.countryData = await fetchJSON('data/worldbank/country_data.json');
    console.log(`✓ country_data.json — ${Object.keys(S.countryData).length} entries`);
  } catch { console.warn('country_data.json not found'); }

  try {
    S.imfData = await fetchJSON('data/imf/imf_data.json');
    console.log(`✓ imf_data.json — ${Object.keys(S.imfData).length} entries`);
  } catch { console.warn('imf_data.json not found'); }

  try {
    S.oecdData = await fetchJSON('data/oecd/oecd_data.json');
    console.log(`✓ oecd_data.json — ${Object.keys(S.oecdData).length} entries`);
  } catch { console.warn('oecd_data.json not found'); }

  try {
    S.owidData = await fetchJSON('data/owid/owid_data.json');
    console.log(`✓ owid_data.json — ${Object.keys(S.owidData).length} entries`);
  } catch { console.warn('owid_data.json not found — run fetch_owid.py'); }

  try {
    S.unescoData = await fetchJSON('data/unesco/unesco_data.json');
    console.log(`✓ unesco_data.json — ${Object.keys(S.unescoData).length} entries`);
  } catch { console.warn('unesco_data.json not found — run fetch_unesco.py'); }

  try {
    S.unData = await fetchJSON('data/un/un_data.json');
    console.log(`✓ un_data.json — ${Object.keys(S.unData).length} entries`);
  } catch { console.warn('un_data.json not found — run fetch_un.py'); }

  const sources = [
    Object.keys(S.countryData).length > 0  ? 'World Bank' : null,
    Object.keys(S.imfData).length > 0      ? 'IMF'        : null,
    Object.keys(S.oecdData).length > 0     ? 'OECD'       : null,
    Object.keys(S.unData).length > 0       ? 'UN'         : null,
    Object.keys(S.owidData).length > 0     ? 'OWID'       : null,
    Object.keys(S.unescoData).length > 0   ? 'UNESCO'     : null,
  ].filter(Boolean);
  toast(`✓ Loaded: ${sources.join(' · ')}`);

  buildFilters();
  applyFilters();
}

// ── GEOGRAPHIC REGIONS ───────────────────────────────
const UN_REGIONS = {
  // Africa — sovereign
  DZA:'Africa',AGO:'Africa',BEN:'Africa',BWA:'Africa',BFA:'Africa',BDI:'Africa',
  CMR:'Africa',CPV:'Africa',CAF:'Africa',TCD:'Africa',COM:'Africa',COD:'Africa',
  COG:'Africa',CIV:'Africa',DJI:'Africa',EGY:'Africa',GNQ:'Africa',ERI:'Africa',
  SWZ:'Africa',ETH:'Africa',GAB:'Africa',GMB:'Africa',GHA:'Africa',GIN:'Africa',
  GNB:'Africa',KEN:'Africa',LSO:'Africa',LBR:'Africa',LBY:'Africa',MDG:'Africa',
  MWI:'Africa',MLI:'Africa',MRT:'Africa',MUS:'Africa',MAR:'Africa',MOZ:'Africa',
  NAM:'Africa',NER:'Africa',NGA:'Africa',RWA:'Africa',STP:'Africa',SEN:'Africa',
  SLE:'Africa',SOM:'Africa',ZAF:'Africa',SSD:'Africa',SDN:'Africa',TZA:'Africa',
  TGO:'Africa',TUN:'Africa',UGA:'Africa',ZMB:'Africa',ZWE:'Africa',SYC:'Africa',
  // Africa — territories
  ESH:'Africa',REU:'Africa',MYT:'Africa',SHN:'Africa',IOT:'Africa',
  // Asia — sovereign
  AFG:'Asia',BHR:'Asia',BGD:'Asia',BTN:'Asia',BRN:'Asia',KHM:'Asia',CHN:'Asia',
  IND:'Asia',IDN:'Asia',IRN:'Asia',IRQ:'Asia',ISR:'Asia',JPN:'Asia',JOR:'Asia',
  KAZ:'Asia',KWT:'Asia',KGZ:'Asia',LAO:'Asia',LBN:'Asia',MYS:'Asia',MDV:'Asia',
  MNG:'Asia',MMR:'Asia',NPL:'Asia',PRK:'Asia',OMN:'Asia',PAK:'Asia',PSE:'Asia',
  PHL:'Asia',QAT:'Asia',SAU:'Asia',SGP:'Asia',KOR:'Asia',LKA:'Asia',SYR:'Asia',
  TWN:'Asia',TJK:'Asia',THA:'Asia',TLS:'Asia',TKM:'Asia',ARE:'Asia',UZB:'Asia',
  VNM:'Asia',YEM:'Asia',
  // Asia — transcontinental (UN M49 Western Asia)
  ARM:'Asia',AZE:'Asia',GEO:'Asia',
  // Asia — territories & SAR
  HKG:'Asia',MAC:'Asia',CCK:'Asia',CXR:'Asia',
  // Europe — sovereign
  ALB:'Europe',AND:'Europe',AUT:'Europe',BLR:'Europe',BEL:'Europe',BIH:'Europe',
  BGR:'Europe',HRV:'Europe',CZE:'Europe',DNK:'Europe',EST:'Europe',FIN:'Europe',
  FRA:'Europe',DEU:'Europe',GRC:'Europe',HUN:'Europe',ISL:'Europe',IRL:'Europe',
  ITA:'Europe',XKX:'Europe',LVA:'Europe',LIE:'Europe',LTU:'Europe',LUX:'Europe',
  MLT:'Europe',MDA:'Europe',MCO:'Europe',MNE:'Europe',NLD:'Europe',MKD:'Europe',
  NOR:'Europe',POL:'Europe',PRT:'Europe',ROU:'Europe',RUS:'Europe',SMR:'Europe',
  SRB:'Europe',SVK:'Europe',SVN:'Europe',ESP:'Europe',SWE:'Europe',CHE:'Europe',
  GBR:'Europe',UKR:'Europe',
  // Europe — conventionally grouped (EU members / EEA)
  CYP:'Europe',TUR:'Europe',
  // Europe — territories
  GIB:'Europe',FRO:'Europe',IMN:'Europe',JEY:'Europe',GGY:'Europe',
  ALA:'Europe',SJM:'Europe',
  // North America — 23 sovereign states
  ATG:'North America',BHS:'North America',BRB:'North America',BLZ:'North America',
  CAN:'North America',CRI:'North America',CUB:'North America',DMA:'North America',
  DOM:'North America',SLV:'North America',GRD:'North America',GTM:'North America',
  HTI:'North America',HND:'North America',JAM:'North America',MEX:'North America',
  NIC:'North America',PAN:'North America',KNA:'North America',LCA:'North America',
  VCT:'North America',TTO:'North America',USA:'North America',
  // Caribbean — non-sovereign territories
  ABW:'Caribbean',AIA:'Caribbean',BLM:'Caribbean',BMU:'Caribbean',
  CUW:'Caribbean',CYM:'Caribbean',GLP:'Caribbean',MAF:'Caribbean',
  MSR:'Caribbean',MTQ:'Caribbean',PRI:'Caribbean',SPM:'Caribbean',
  SXM:'Caribbean',TCA:'Caribbean',VGB:'Caribbean',VIR:'Caribbean',
  // Pacific territories — grouped with Oceania
  GUM:'Oceania',MNP:'Oceania',ASM:'Oceania',UMI:'Oceania',
  // South America — sovereign
  ARG:'South America',BOL:'South America',BRA:'South America',CHL:'South America',
  COL:'South America',ECU:'South America',GUY:'South America',PRY:'South America',
  PER:'South America',SUR:'South America',URY:'South America',VEN:'South America',
  // South America — territories
  FLK:'South America',GUF:'South America',SGS:'South America',
  // Oceania — sovereign
  AUS:'Oceania',FJI:'Oceania',KIR:'Oceania',MHL:'Oceania',FSM:'Oceania',
  NRU:'Oceania',NZL:'Oceania',PLW:'Oceania',PNG:'Oceania',WSM:'Oceania',
  SLB:'Oceania',TON:'Oceania',TUV:'Oceania',VUT:'Oceania',
  // Oceania — territories
  COK:'Oceania',NIU:'Oceania',TKL:'Oceania',NCL:'Oceania',PYF:'Oceania',
  WLF:'Oceania',NFK:'Oceania',PCN:'Oceania',
};

// World Bank region string → our standard label
const WB_REGION_MAP = {
  'Sub-Saharan Africa':         'Africa',
  'Middle East & North Africa': 'Africa',
  'South Asia':                 'Asia',
  'East Asia & Pacific':        'Asia',
  'Europe & Central Asia':      'Europe',
  'Latin America & Caribbean':  'South America',
  'North America':              'North America',
};

function parseWorldBank(raw) {
  return raw
    .filter(c => c.capitalCity && c.capitalCity.trim())
    .map(c => ({
      id:          c.id,
      iso2:        c.iso2Code,
      name:        c.name,
      capital:     c.capitalCity,
      region:      UN_REGIONS[c.id] || WB_REGION_MAP[c.region?.value?.trim()] || c.region?.value?.trim() || '',
      regionId:    c.region?.id                 || '',
      adminRegion: c.adminregion?.value?.trim() || '',
      income:      c.incomeLevel?.value         || '',
      incomeId:    c.incomeLevel?.id            || '',
      lending:     c.lendingType?.value         || '',
      lendingId:   c.lendingType?.id            || '',
      lon:         c.longitude                  || '',
      lat:         c.latitude                   || '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── FILTERS ──────────────────────────────────────────

const REGION_SHORT = {
  'Africa':'Africa','Asia':'Asia','Europe':'Europe',
  'North America':'N. America','South America':'S. America',
  'Oceania':'Oceania','Caribbean':'Caribbean',
};

function buildFilters() {
  // ── Region buttons
  const regions = [...new Set(S.countries.map(c => c.region).filter(Boolean))].sort();
  const row = document.getElementById('filterRow');
  row.innerHTML = '<button class="filter-btn active" data-region="all">All</button>';
  regions.forEach(r => {
    const b = document.createElement('button');
    b.className = 'filter-btn'; b.dataset.region = r;
    b.textContent = REGION_SHORT[r] || r; b.title = r;
    row.appendChild(b);
  });
  row.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn'); if (!btn) return;
    row.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); S.region = btn.dataset.region; applyFilters();
  });

  // ── Income buttons
  const incomes = [...new Set(S.countries.map(c => c.income).filter(Boolean))].sort();
  const incomeRow = document.getElementById('incomeRow');
  incomeRow.innerHTML = '<button class="filter-btn active" data-income="all">All</button>';
  incomes.forEach(inc => {
    const b = document.createElement('button');
    b.className = 'filter-btn'; b.dataset.income = inc;
    b.textContent = inc.replace(/ income$/i, '').replace(/^Upper middle$/i, 'Upper mid').replace(/^Lower middle$/i, 'Lower mid');
    b.title = inc;
    incomeRow.appendChild(b);
  });
  incomeRow.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn'); if (!btn) return;
    incomeRow.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); S.income = btn.dataset.income; applyFilters();
  });

  // ── Sort select
  const sortSelect = document.getElementById('sortSelect');
  sortSelect.innerHTML = [
    '<option value="name">Name (A–Z)</option>',
    '<option value="region">Region</option>',
    '<option value="income">Income Level</option>',
  ].join('');
  sortSelect.addEventListener('change', () => { S.sortField = sortSelect.value; applyFilters(); });

  // ── Sort direction button
  const sortDirBtn = document.getElementById('sortDirBtn');
  sortDirBtn.textContent = '↑';
  sortDirBtn.addEventListener('click', () => {
    S.sortDir = S.sortDir === 'asc' ? 'desc' : 'asc';
    sortDirBtn.textContent = S.sortDir === 'asc' ? '↑' : '↓';
    applyFilters();
  });

  // ── Filter panel toggle (class-based)
  const filterToggle = document.getElementById('filterToggle');
  const filterPanel  = document.getElementById('filterPanel');
  filterToggle.addEventListener('click', () => {
    const open = filterPanel.classList.toggle('open');
    filterToggle.classList.toggle('active', open);
  });

  // ── Random button
  document.getElementById('randomBtn').addEventListener('click', () => {
    if (!S.countries.length) return;
    const c = S.countries[Math.floor(Math.random() * S.countries.length)];
    selectCountry(c);
    toast(`🎲 ${c.name}`);
  });

  // ── Rankings field options
  const rankField = document.getElementById('rankField');
  rankField.innerHTML = RANK_FIELDS.map(f => `<option value="${f.key}">${f.label}</option>`).join('');
  rankField.value = 'gdpUSD';
  document.getElementById('rankDir').value = 'desc';
  rankField.addEventListener('change', renderRankList);
  document.getElementById('rankDir').addEventListener('change', renderRankList);
}

document.getElementById('searchInput').addEventListener('input', e => {
  S.query = e.target.value;
  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.style.display = S.query ? 'block' : 'none';
  applyFilters();
});

// Clear button
const searchClearBtn = document.getElementById('searchClear');
if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    const inp = document.getElementById('searchInput');
    inp.value = '';
    S.query = '';
    searchClearBtn.style.display = 'none';
    inp.focus();
    applyFilters();
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  // '/' focuses search (unless already in an input)
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
    return;
  }
  // Escape closes any open modal
  if (e.key === 'Escape') {
    const mapModal   = document.getElementById('mapModal');
    const rankModal  = document.getElementById('rankModal');
    const aboutModal = document.getElementById('aboutModal');
    if (mapModal.classList.contains('open'))   { closeMapModal();   return; }
    if (rankModal.classList.contains('open'))  { closeRankModal();  return; }
    if (aboutModal.classList.contains('open')) { closeAboutModal(); return; }
    // Escape also clears search if it has content
    const inp = document.getElementById('searchInput');
    if (document.activeElement === inp && inp.value) {
      inp.value = ''; S.query = '';
      const cb = document.getElementById('searchClear');
      if (cb) cb.style.display = 'none';
      applyFilters();
    }
    return;
  }
  // Arrow keys navigate list when sidebar is focused
  if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && document.activeElement.tagName !== 'SELECT') {
    if (!S.filtered.length) return;
    const idx = S.filtered.findIndex(c => c.iso2 === S.selected);
    let next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
    next = Math.max(0, Math.min(S.filtered.length - 1, next));
    selectCountry(S.filtered[next]);
  }
});

function applyFilters() {
  const q = S.query.trim().toLowerCase();
  S.filtered = S.countries.filter(c => {
    const rOK = S.region === 'all' || c.region === S.region;
    const iOK = S.income === 'all' || c.income === S.income;
    const sOK = !q ||
      c.name.toLowerCase().includes(q)    ||
      c.capital.toLowerCase().includes(q) ||
      (c.iso2 || '').toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    return rOK && iOK && sOK;
  });
  // Sort
  const sf = S.sortField;
  S.filtered.sort((a, b) => {
    const cmp = (a[sf] || '').localeCompare(b[sf] || '', undefined, { sensitivity: 'base' });
    return S.sortDir === 'asc' ? cmp : -cmp;
  });
  renderList();
  document.getElementById('countLabel').textContent =
    `${S.filtered.length} ${S.filtered.length === 1 ? 'country' : 'countries'}`;
}

// ── SIDEBAR LIST ─────────────────────────────────────

function renderList() {
  const list = document.getElementById('countryList');
  if (S.filtered.length === 0) {
    list.innerHTML = '<div class="no-results">No countries found</div>';
    return;
  }
  list.innerHTML = '';
  const frag = document.createDocumentFragment();
  S.filtered.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'country-item' + (S.selected === c.iso2 ? ' active' : '');
    div.style.animationDelay = `${Math.min(i * 5, 150)}ms`;
    div.dataset.iso2 = c.iso2;
    div.innerHTML = `
      <div class="flag">${flag(c.iso2)}</div>
      <div class="country-info">
        <div class="country-name">${c.name}</div>
        <div class="country-region">${c.region}</div>
      </div>`;
    div.addEventListener('click', () => selectCountry(c));
    frag.appendChild(div);
  });
  list.appendChild(frag);
}

// ── PROFILE ──────────────────────────────────────────

function selectCountry(c) {
  S.selected = c.iso2;
  document.querySelectorAll('.country-item').forEach(el =>
    el.classList.toggle('active', el.dataset.iso2 === c.iso2)
  );
  // Scroll active item into view in the sidebar
  const activeEl = document.querySelector('.country-item.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  // Scroll main panel to top for the new country
  const mainEl = document.getElementById('main');
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  renderProfile(c);
}

function renderProfile(c) {
  const id = c.id;
  document.getElementById('main').innerHTML = `
    <div class="profile">
      <div class="profile-hero">
        <div class="profile-flag">${flag(c.iso2)}</div>
        <div class="profile-titles">
          <div class="profile-name">${c.name}</div>
          <div class="profile-subtitle">
            <span>🏛 ${c.capital}</span>
            <span>🌍 ${c.region}</span>
            ${c.lat !== '' && c.lat != null ? `<span>📍 ${parseFloat(c.lat).toFixed(2)}°, ${parseFloat(c.lon).toFixed(2)}°</span>` : ''}
          </div>
          <div class="profile-tags">
            <span class="tag">${c.income || '—'}</span>
            ${c.lending && c.lending !== 'Not classified' ? `<span class="tag">${c.lending}</span>` : ''}
            ${c.adminRegion ? `<span class="tag accent">${c.adminRegion}</span>` : ''}
          </div>
        </div>
      </div>
      ${renderClassification(c)}
      ${renderIMFEconomy(c)}
      ${renderWBEconomy(id)}
      ${renderOECDLabour(c)}
      ${renderOECDFiscal(c)}
      ${renderOECDInnovation(c)}
      ${renderOECDHealth(c)}
      ${renderOECDEducation(c)}
      ${renderOECDEnvironment(c)}
      ${renderOECDInequality(c)}
      ${renderUNHumanDev(c)}
      ${renderUNPopulation(c)}
      ${renderUNHealth(c)}
      ${renderDemographics(id)}
      ${renderHealth(id)}
      ${renderEducation(id)}
      ${renderEnvironment(id)}
      ${renderPoverty(id)}
      ${renderOWIDEnergy(c)}
      ${renderOWIDClimate(c)}
      ${renderOWIDHealth(c)}
      ${renderOWIDSociety(c)}
      ${renderOWIDFood(c)}
      ${renderUNESCOEducation(c)}
      ${renderUNESCOScience(c)}
    </div>`;

  // Wire section collapse — click the section-label to toggle its sibling data-section
  document.querySelectorAll('.section-label').forEach(label => {
    // Add collapse icon
    const icon = document.createElement('span');
    icon.className = 'section-collapse-icon';
    icon.textContent = '▾';
    label.appendChild(icon);
    label.addEventListener('click', () => {
      const section = label.nextElementSibling;
      if (!section) return;
      const collapsed = section.classList.toggle('collapsed');
      label.classList.toggle('collapsed', collapsed);
    });
  });

  // Back-to-top: show when main scrolls down
  const mainEl = document.getElementById('main');
  const btt    = document.getElementById('backToTop');
  if (mainEl && btt) {
    mainEl.addEventListener('scroll', () => {
      btt.classList.toggle('visible', mainEl.scrollTop > 300);
    }, { passive: true });
  }
}

// ── SECTION RENDERERS ────────────────────────────────

function renderClassification(c) {
  return `
    <p class="section-label">Classification <span class="src-badge src-wb">World Bank</span></p>
    <div class="stats-grid">
      ${statCard('ISO2 Code',    c.iso2,    '2-letter code',   false, true)}
      ${statCard('ISO3 Code',    c.id,      '3-letter code',   false, true)}
      ${statCard('Region',       c.region,  'WB grouping',       true)}
      ${statCard('Income Level', c.income,  `ID: ${c.incomeId}`, true)}
      ${statCard('Lending Type', c.lending, `ID: ${c.lendingId}`, true)}
      ${c.adminRegion ? statCard('Admin Region', c.adminRegion, '', true) : ''}
    </div>`;
}

function renderIMFEconomy(c) {
  const hasIMFFile = Object.keys(S.imfData).length > 0;
  const rows = [
    dataRow('Real GDP Growth',          fmtPct(imf(c,'gdpGrowth')),         imfyr(c,'gdpGrowth')),
    dataRow('GDP (current USD)',         sfx(imf(c,'gdpUSD'), 2, 'B'),       imfyr(c,'gdpUSD')),
    dataRow('GDP per Capita (USD)',      fmtUSD(imf(c,'gdpPerCapUSD')),      imfyr(c,'gdpPerCapUSD')),
    dataRow('GDP (PPP, intl $)',         sfx(imf(c,'gdpPPP'), 2, 'B'),       imfyr(c,'gdpPPP')),
    dataRow('GDP per Capita (PPP)',      fmtUSD(imf(c,'gdpPerCapPPP')),      imfyr(c,'gdpPerCapPPP')),
    dataRow('Share of World GDP (PPP)', fmtPct(imf(c,'gdpShareWorld'), 2),  imfyr(c,'gdpShareWorld')),
    dataRow('Inflation (CPI)',           fmtPct(imf(c,'inflation')),         imfyr(c,'inflation')),
    dataRow('Unemployment Rate',         fmtPct(imf(c,'unemployment')),      imfyr(c,'unemployment')),
    dataRow('Employment',               sfx(imf(c,'employment'), 1, 'M'),   imfyr(c,'employment')),
    dataRow('Fiscal Balance (% GDP)',   fmtPct(imf(c,'fiscalBalance')),     imfyr(c,'fiscalBalance')),
    dataRow('Govt Debt (% GDP)',        fmtPct(imf(c,'govtDebt')),          imfyr(c,'govtDebt')),
    dataRow('Govt Revenue (% GDP)',     fmtPct(imf(c,'govtRevenue')),       imfyr(c,'govtRevenue')),
    dataRow('Govt Expenditure (% GDP)', fmtPct(imf(c,'govtExpenditure')),   imfyr(c,'govtExpenditure')),
    dataRow('Current Account (% GDP)',  fmtPct(imf(c,'currentAccount')),    imfyr(c,'currentAccount')),
    dataRow('Export Volume Growth',     fmtPct(imf(c,'exportGrowth')),      imfyr(c,'exportGrowth')),
    dataRow('Import Volume Growth',     fmtPct(imf(c,'importGrowth')),      imfyr(c,'importGrowth')),
    dataRow('Total Investment (% GDP)', fmtPct(imf(c,'investment')),        imfyr(c,'investment')),
    dataRow('Gross Savings (% GDP)',    fmtPct(imf(c,'savings')),           imfyr(c,'savings')),
  ].filter(Boolean);

  const noDataMsg = hasIMFFile
    ? `<div class="no-data-row">No IMF data available for this country</div>`
    : `<div class="no-data-row">IMF data not loaded — run <code>python3 fetch_imf_data.py</code> from scripts/</div>`;

  return `
    <p class="section-label">Economy — IMF <span class="src-badge src-imf">IMF</span></p>
    <div class="data-section">
      <div class="data-section-header"><h3>IMF Economic Indicators</h3></div>
      ${rows.join('') || noDataMsg}
    </div>`;
}

function renderWBEconomy(id) {
  return section('Economy — World Bank', 'wb', 'World Bank Economic Indicators', [
    dataRow('GDP (Total)',          fmtUSD(wb(id,'gdp')),           wbyr(id,'gdp')),
    dataRow('GDP per Capita',       fmtUSD(wb(id,'gdpPerCap')),     wbyr(id,'gdpPerCap')),
    dataRow('GDP per Capita (PPP)', fmtUSD(wb(id,'gdpPerCapPPP')), wbyr(id,'gdpPerCapPPP')),
    dataRow('GNI per Capita',       fmtUSD(wb(id,'gniPerCap')),     wbyr(id,'gniPerCap')),
    dataRow('GDP Growth',           fmtPct(wb(id,'gdpGrowth')),     wbyr(id,'gdpGrowth')),
    dataRow('Inflation Rate',       fmtPct(wb(id,'inflation')),     wbyr(id,'inflation')),
    dataRow('Unemployment Rate',    fmtPct(wb(id,'unemployment')),  wbyr(id,'unemployment')),
    dataRow('Trade (% of GDP)',     fmtPct(wb(id,'tradeGDP')),      wbyr(id,'tradeGDP')),
    dataRow('FDI Net Inflows',      fmtUSD(wb(id,'fdi')),           wbyr(id,'fdi')),
    dataRow('Gini Index',           fmt(wb(id,'gini'), 1),          wbyr(id,'gini')),
  ]);
}

// ── OECD SECTIONS ────────────────────────────────────

function renderOECDLabour(c) {
  return section('Labour Market — OECD', 'oecd', 'OECD Labour Indicators', [
    dataRow('Avg Hours Worked per Year', fmt(oecd(c,'hoursWorked'), 0),       oecdyr(c,'hoursWorked')),
    dataRow('Trade Union Density',       fmtPct(oecd(c,'unionDensity')),      oecdyr(c,'unionDensity')),
    dataRow('Real Wage Growth',          fmtPct(oecd(c,'wageGrowth')),        oecdyr(c,'wageGrowth')),
    dataRow('GDP per Hour Worked',       fmtUSD(oecd(c,'gdpPerHour')),        oecdyr(c,'gdpPerHour')),
  ]);
}

function renderOECDFiscal(c) {
  return section('Tax & Fiscal — OECD', 'oecd', 'OECD Tax & Fiscal Indicators', [
    dataRow('Tax Revenue (% GDP)',      fmtPct(oecd(c,'taxRevenue')),      oecdyr(c,'taxRevenue')),
    dataRow('Social Spending (% GDP)',  fmtPct(oecd(c,'socialSpending')),  oecdyr(c,'socialSpending')),
    dataRow('Pension Spending (% GDP)', fmtPct(oecd(c,'pensionSpend')),    oecdyr(c,'pensionSpend')),
    dataRow('Family Spending (% GDP)',  fmtPct(oecd(c,'familySpend')),     oecdyr(c,'familySpend')),
    dataRow('Unemployment Benefits',    fmtPct(oecd(c,'unempBenefits')),   oecdyr(c,'unempBenefits')),
  ]);
}

function renderOECDInnovation(c) {
  return section('Innovation — OECD', 'oecd', 'OECD Innovation & Productivity', [
    dataRow('R&D Expenditure (% GDP)', fmtPct(oecd(c,'rdSpending')),  oecdyr(c,'rdSpending')),
    dataRow('GDP per Hour Worked',     fmtUSD(oecd(c,'gdpPerHour')), oecdyr(c,'gdpPerHour')),
  ]);
}

function renderOECDHealth(c) {
  return section('Health — OECD', 'oecd', 'OECD Health Indicators', [
    dataRow('Hospital Beds per 1,000', fmt(oecd(c,'hospitalBeds'), 1), oecdyr(c,'hospitalBeds')),
    dataRow('Nurses per 1,000',        fmt(oecd(c,'nurses'), 1),       oecdyr(c,'nurses')),
    dataRow('Doctors per 1,000',       fmt(oecd(c,'doctors'), 1),      oecdyr(c,'doctors')),
  ]);
}

function renderOECDEducation(c) {
  return section('Education — OECD', 'oecd', 'OECD Education Indicators', [
    dataRow('PISA Math Score',    fmt(oecd(c,'pisaMath'), 0),    oecdyr(c,'pisaMath')),
    dataRow('PISA Reading Score', fmt(oecd(c,'pisaRead'), 0),    oecdyr(c,'pisaRead')),
    dataRow('PISA Science Score', fmt(oecd(c,'pisaScience'), 0), oecdyr(c,'pisaScience')),
  ]);
}

function renderOECDEnvironment(c) {
  return section('Environment — OECD', 'oecd', 'OECD Environment Indicators', [
    dataRow('GHG Emissions (Mt CO2 eq)', fmt(oecd(c,'ghgEmissions'), 1),   oecdyr(c,'ghgEmissions')),
    dataRow('Municipal Waste (kg/cap)',  fmt(oecd(c,'municipalWaste'), 0), oecdyr(c,'municipalWaste')),
  ]);
}

function renderOECDInequality(c) {
  return section('Inequality — OECD', 'oecd', 'OECD Inequality & Income', [
    dataRow('Gini Coefficient',        fmt(oecd(c,'gini'), 2),        oecdyr(c,'gini')),
    dataRow('Poverty Rate',            fmtPct(oecd(c,'povertyRate')), oecdyr(c,'povertyRate')),
    dataRow('Median Household Income', fmtUSD(oecd(c,'medianIncome')),oecdyr(c,'medianIncome')),
    dataRow('Palma Ratio',             fmt(oecd(c,'palmaRatio'), 2),  oecdyr(c,'palmaRatio')),
  ]);
}

// ── UN SECTIONS ──────────────────────────────────────

function renderUNHumanDev(c) {
  return section('Human Development — UN', 'un', 'UN Human Development Report', [
    dataRow('Human Development Index',        fmt(un(c,'hdi'), 3),              unyr(c,'hdi')),
    dataRow('HDI Rank',                       fmt(un(c,'hdiRank'), 0),           unyr(c,'hdiRank')),
    dataRow('Inequality-adj HDI (IHDI)',      fmt(un(c,'hdiAdjInequality'), 3),  unyr(c,'hdiAdjInequality')),
    dataRow('Gender Inequality Index (GII)',  fmt(un(c,'gii'), 3),               unyr(c,'gii')),
    dataRow('GII Rank',                       fmt(un(c,'giiRank'), 0),            unyr(c,'giiRank')),
    dataRow('Gender Development Index (GDI)', fmt(un(c,'gdi'), 3),              unyr(c,'gdi')),
    dataRow('Mean Years of Schooling',        sfx(un(c,'meanSchooling'), 1, ' yrs'), unyr(c,'meanSchooling')),
    dataRow('Expected Years of Schooling',    sfx(un(c,'expSchooling'), 1, ' yrs'),  unyr(c,'expSchooling')),
    dataRow('GNI per Capita (PPP)',           fmtUSD(un(c,'gniPerCap')),         unyr(c,'gniPerCap')),
    dataRow('Income Index',                   fmt(un(c,'incomeIndex'), 3),        unyr(c,'incomeIndex')),
    dataRow('Education Index',                fmt(un(c,'educationIndex'), 3),     unyr(c,'educationIndex')),
    dataRow('Health Index',                   fmt(un(c,'healthIndex'), 3),        unyr(c,'healthIndex')),
    dataRow('Multidimensional Poverty Index', fmt(un(c,'multidimPoverty'), 3),    unyr(c,'multidimPoverty')),
    dataRow('Vulnerable Employment (%)',      fmtPct(un(c,'vulnerableEmploy')),   unyr(c,'vulnerableEmploy')),
    dataRow('CO2 Emissions per Capita',       sfx(un(c,'co2PerCap'), 2, ' t'),   unyr(c,'co2PerCap')),
    dataRow('Adolescent Birth Rate',          sfx(un(c,'adolBirthRate'), 1, ' per 1,000'), unyr(c,'adolBirthRate')),
    dataRow('Remittances (% GNI)',            fmtPct(un(c,'remittances')),        unyr(c,'remittances')),
    dataRow('Foreign Aid Received (% GNI)',   fmtPct(un(c,'foreignAid')),         unyr(c,'foreignAid')),
  ]);
}

function renderUNPopulation(c) {
  return section('Population — UN', 'un', 'UN Population Division', [
    dataRow('Total Population',        sfx(un(c,'popTotal'), 0, 'K'),            unyr(c,'popTotal')),
    dataRow('Male Population',         sfx(un(c,'popMale'), 0, 'K'),             unyr(c,'popMale')),
    dataRow('Female Population',       sfx(un(c,'popFemale'), 0, 'K'),           unyr(c,'popFemale')),
    dataRow('Population Density',      sfx(un(c,'popDensity'), 1, ' /km²'),      unyr(c,'popDensity')),
    dataRow('Population Growth Rate',  fmtPct(un(c,'popGrowthRate')),            unyr(c,'popGrowthRate')),
    dataRow('Median Age',              sfx(un(c,'medianAge'), 1, ' yrs'),         unyr(c,'medianAge')),
    dataRow('Fertility Rate',          sfx(un(c,'fertilityRate'), 2, ' births/woman'), unyr(c,'fertilityRate')),
    dataRow('Birth Rate',              sfx(un(c,'birthRate'), 1, ' per 1,000'),  unyr(c,'birthRate')),
    dataRow('Death Rate',              sfx(un(c,'deathRate'), 1, ' per 1,000'),  unyr(c,'deathRate')),
    dataRow('Net Migration Rate',      sfx(un(c,'netMigration'), 1, ' per 1,000'), unyr(c,'netMigration')),
    dataRow('Urban Population (%)',    fmtPct(un(c,'urbanPct')),                  unyr(c,'urbanPct')),
    dataRow('Population aged 0-14',   fmtPct(un(c,'popAge0to14')),               unyr(c,'popAge0to14')),
    dataRow('Population aged 65+',    fmtPct(un(c,'popAge65plus')),              unyr(c,'popAge65plus')),
    dataRow('Dependency Ratio',        fmt(un(c,'dependencyRatio'), 1),           unyr(c,'dependencyRatio')),
    dataRow('Contraceptive Use',       fmtPct(un(c,'contraceptiveUse')),          unyr(c,'contraceptiveUse')),
  ]);
}

function renderUNHealth(c) {
  return section('Health — UN', 'un', 'UN Health & Mortality', [
    dataRow('Life Expectancy (both)',   sfx(un(c,'lifeExpBoth'), 1, ' yrs'),      unyr(c,'lifeExpBoth')),
    dataRow('Life Expectancy (male)',   sfx(un(c,'lifeExpMale'), 1, ' yrs'),      unyr(c,'lifeExpMale')),
    dataRow('Life Expectancy (female)', sfx(un(c,'lifeExpFemale'), 1, ' yrs'),   unyr(c,'lifeExpFemale')),
    dataRow('Infant Mortality',         sfx(un(c,'infantMortality'), 1, ' per 1,000'), unyr(c,'infantMortality')),
    dataRow('Under-5 Mortality',        sfx(un(c,'under5Mortality'), 1, ' per 1,000'), unyr(c,'under5Mortality')),
    dataRow('Neonatal Mortality',       sfx(un(c,'neonateMortality'), 1, ' per 1,000'), unyr(c,'neonateMortality')),
    dataRow('Maternal Mortality',       sfx(un(c,'maternMortality'), 0, ' per 100,000'), unyr(c,'maternMortality')),
  ]);
}

// ── WORLD BANK SECTIONS ──────────────────────────────

function renderDemographics(id) {
  return section('Demographics', 'wb', 'World Bank Demographics', [
    dataRow('Population',         fmt(wb(id,'population'), 0),                     wbyr(id,'population')),
    dataRow('Population Growth',  fmtPct(wb(id,'popGrowth')),                      wbyr(id,'popGrowth')),
    dataRow('Population Density', sfx(wb(id,'popDensity'), 1, ' /km²'),            wbyr(id,'popDensity')),
    dataRow('Urban Population',   fmtPct(wb(id,'urbanPct')),                       wbyr(id,'urbanPct')),
    dataRow('Fertility Rate',     sfx(wb(id,'fertilityRate'), 2, ' births/woman'), wbyr(id,'fertilityRate')),
  ]);
}

function renderHealth(id) {
  return section('Health', 'wb', 'World Bank Health Indicators', [
    dataRow('Life Expectancy',       sfx(wb(id,'lifeExp'), 1, ' yrs'),                   wbyr(id,'lifeExp')),
    dataRow('Life Expectancy (F)',   sfx(wb(id,'lifeExpFemale'), 1, ' yrs'),             wbyr(id,'lifeExpFemale')),
    dataRow('Life Expectancy (M)',   sfx(wb(id,'lifeExpMale'), 1, ' yrs'),               wbyr(id,'lifeExpMale')),
    dataRow('Infant Mortality',      sfx(wb(id,'infantMortality'), 1, ' per 1,000'),     wbyr(id,'infantMortality')),
    dataRow('Maternal Mortality',    sfx(wb(id,'maternalMortality'), 0, ' per 100,000'), wbyr(id,'maternalMortality')),
    dataRow('Health Spend (% GDP)',  fmtPct(wb(id,'healthSpendGDP')),                   wbyr(id,'healthSpendGDP')),
    dataRow('Physicians per 1,000', fmt(wb(id,'physicians'), 2),                        wbyr(id,'physicians')),
    dataRow('Undernourishment',      fmtPct(wb(id,'undernourishment')),                 wbyr(id,'undernourishment')),
  ]);
}

function renderEducation(id) {
  return section('Education', 'wb', 'World Bank Education Indicators', [
    dataRow('Literacy Rate (Adult)',   fmtPct(wb(id,'literacyRate')),        wbyr(id,'literacyRate')),
    dataRow('Primary Enrollment',      fmtPct(wb(id,'primaryEnrollment')),   wbyr(id,'primaryEnrollment')),
    dataRow('Secondary Enrollment',    fmtPct(wb(id,'secondaryEnrollment')), wbyr(id,'secondaryEnrollment')),
    dataRow('Tertiary Enrollment',     fmtPct(wb(id,'tertiaryEnrollment')),  wbyr(id,'tertiaryEnrollment')),
    dataRow('Education Spend (% GDP)', fmtPct(wb(id,'educationSpendGDP')),  wbyr(id,'educationSpendGDP')),
  ]);
}

function renderEnvironment(id) {
  return section('Environment', 'wb', 'World Bank Environment & Energy', [
    dataRow('Forest Area',           fmtPct(wb(id,'forestArea')),                      wbyr(id,'forestArea')),
    dataRow('Renewable Energy',      fmtPct(wb(id,'renewableEnergy')),                 wbyr(id,'renewableEnergy')),
    dataRow('Access to Electricity', fmtPct(wb(id,'accessElectricity')),               wbyr(id,'accessElectricity')),
    dataRow('Freshwater per Capita', sfx(wb(id,'freshwaterPerCap'), 0, ' m³/yr'),      wbyr(id,'freshwaterPerCap')),
    dataRow('Internet Users',        fmtPct(wb(id,'internetUsers')),                   wbyr(id,'internetUsers')),
    dataRow('Mobile Subscriptions',  sfx(wb(id,'mobileSubscriptions'), 1, ' per 100'), wbyr(id,'mobileSubscriptions')),
  ]);
}

function renderPoverty(id) {
  return section('Poverty & Inequality', 'wb', 'World Bank Poverty & Inequality', [
    dataRow('Poverty Rate ($2.15/day)', fmtPct(wb(id,'povertyRate')),     wbyr(id,'povertyRate')),
    dataRow('Poverty Rate ($5.50/day)', fmtPct(wb(id,'povertyRatio550')), wbyr(id,'povertyRatio550')),
    dataRow('Gini Index',               fmt(wb(id,'gini'), 1),            wbyr(id,'gini')),
  ]);
}


// ── OWID SECTIONS ────────────────────────────────────

function renderOWIDEnergy(c) {
  return section('Electricity Mix — OWID', 'owid', 'Our World in Data — Electricity Generation', [
    dataRow('Solar Generation',      sfx(owid(c,'solarElec'), 1, ' TWh'),       owidyr(c,'solarElec')),
    dataRow('Wind Generation',       sfx(owid(c,'windElec'), 1, ' TWh'),        owidyr(c,'windElec')),
    dataRow('Nuclear Generation',    sfx(owid(c,'nuclearElec'), 1, ' TWh'),     owidyr(c,'nuclearElec')),
    dataRow('Fossil Fuel Generation',sfx(owid(c,'fossilElec'), 1, ' TWh'),      owidyr(c,'fossilElec')),
    dataRow('Renewables Generation', sfx(owid(c,'renewableElec'), 1, ' TWh'),   owidyr(c,'renewableElec')),
    dataRow('Hydro Generation',      sfx(owid(c,'hydroElec'), 1, ' TWh'),       owidyr(c,'hydroElec')),
    dataRow('Solar Share',           fmtPct(owid(c,'solarShare')),              owidyr(c,'solarShare')),
    dataRow('Wind Share',            fmtPct(owid(c,'windShare')),               owidyr(c,'windShare')),
    dataRow('Nuclear Share',         fmtPct(owid(c,'nuclearShare')),            owidyr(c,'nuclearShare')),
    dataRow('Fossil Share',          fmtPct(owid(c,'fossilShareElec')),         owidyr(c,'fossilShareElec')),
    dataRow('Renewables Share',      fmtPct(owid(c,'renewableShare')),          owidyr(c,'renewableShare')),
  ]);
}

function renderOWIDClimate(c) {
  return section('Climate & Emissions — OWID', 'owid', 'Our World in Data — CO₂ & Greenhouse Gases', [
    dataRow('Annual CO₂ (Mt)',          sfx(owid(c,'co2'), 2, ' Mt'),               owidyr(c,'co2')),
    dataRow('CO₂ per Capita',           sfx(owid(c,'co2PerCap'), 2, ' t'),          owidyr(c,'co2PerCap')),
    dataRow('CO₂ per GDP (kg/$)',       sfx(owid(c,'co2PerGDP'), 3, ' kg/$'),       owidyr(c,'co2PerGDP')),
    dataRow('Total GHG (Mt CO₂eq)',     sfx(owid(c,'totalGhg'), 1, ' Mt'),          owidyr(c,'totalGhg')),
    dataRow('Methane (Mt CO₂eq)',       sfx(owid(c,'methane'), 1, ' Mt'),           owidyr(c,'methane')),
    dataRow('Nitrous Oxide (Mt CO₂eq)',sfx(owid(c,'nitrousOxide'), 1, ' Mt'),      owidyr(c,'nitrousOxide')),
    dataRow('Share of Global CO₂',      fmtPct(owid(c,'shareGlobalCo2'), 2),        owidyr(c,'shareGlobalCo2')),
    dataRow('Cumulative CO₂ (Mt)',      sfx(owid(c,'cumulativeCo2'), 0, ' Mt'),     owidyr(c,'cumulativeCo2')),
    dataRow('Coal CO₂ (Mt)',            sfx(owid(c,'coalCo2'), 1, ' Mt'),           owidyr(c,'coalCo2')),
  ]);
}

function renderOWIDHealth(c) {
  return section('Health & Mortality — OWID', 'owid', 'Our World in Data — Health Indicators', [
    dataRow('Life Expectancy',          sfx(owid(c,'lifeExpOwid'), 1, ' yrs'),      owidyr(c,'lifeExpOwid')),
    dataRow('Child Mortality',          sfx(owid(c,'childMortality'), 2, '%'),      owidyr(c,'childMortality')),
    dataRow('Maternal Mortality',       sfx(owid(c,'maternMortOwid'), 1, ' per 100k'), owidyr(c,'maternMortOwid')),
    dataRow('Diabetes Prevalence',      fmtPct(owid(c,'diabetesRate')),             owidyr(c,'diabetesRate')),
    dataRow('Cancer Death Rate',        sfx(owid(c,'cancerDeaths'), 1, ' per 100k'), owidyr(c,'cancerDeaths')),
    dataRow('Suicide Rate',             sfx(owid(c,'suicideRate'), 2, ' per 100k'), owidyr(c,'suicideRate')),
    dataRow('Alcohol Consumption',      sfx(owid(c,'alcoholConsump'), 1, ' L/yr'),  owidyr(c,'alcoholConsump')),
    dataRow('Homicide Rate',            sfx(owid(c,'homicideRate'), 2, ' per 100k'), owidyr(c,'homicideRate')),
    dataRow('Clean Fuels Access',       fmtPct(owid(c,'cleanFuels')),               owidyr(c,'cleanFuels')),
    dataRow('Safe Sanitation',          fmtPct(owid(c,'safeSanitation')),           owidyr(c,'safeSanitation')),
  ]);
}

function renderOWIDSociety(c) {
  return section('Society & Governance — OWID', 'owid', 'Our World in Data — Society', [
    dataRow('Corruption Index (0–100)', fmt(owid(c,'corruptionIndex'), 1),          owidyr(c,'corruptionIndex')),
    dataRow('Press Freedom Index',       fmt(owid(c,'pressFreedom'), 2),             owidyr(c,'pressFreedom')),
    dataRow('Women in Parliament',       fmtPct(owid(c,'womenInParl')),             owidyr(c,'womenInParl')),
    dataRow('Military Spend (% GDP)',    fmtPct(owid(c,'militarySpend')),           owidyr(c,'militarySpend')),
    dataRow('Tourist Arrivals',          fmt(owid(c,'touristArrivals'), 0),          owidyr(c,'touristArrivals')),
    dataRow('Mean Years of Schooling',   sfx(owid(c,'meanSchoolingOwid'), 1, ' yrs'), owidyr(c,'meanSchoolingOwid')),
    dataRow('Gender Wage Gap',           fmtPct(owid(c,'genderWageGap')),           owidyr(c,'genderWageGap')),
    dataRow('Education Spend (% GDP)',   fmtPct(owid(c,'eduSpendOwid')),            owidyr(c,'eduSpendOwid')),
    dataRow('Extreme Poverty Rate',      fmtPct(owid(c,'extremePoverty')),          owidyr(c,'extremePoverty')),
    dataRow('Birth Rate',                sfx(owid(c,'birthRateOwid'), 1, ' per 1k'), owidyr(c,'birthRateOwid')),
  ]);
}

function renderOWIDFood(c) {
  return section('Food, Nature & Waste — OWID', 'owid', 'Our World in Data — Food & Environment', [
    dataRow('Daily Calories per Capita', sfx(owid(c,'dailyCalories'), 0, ' kcal'), owidyr(c,'dailyCalories')),
    dataRow('Meat Supply per Capita',    sfx(owid(c,'meatSupply'), 1, ' kg/yr'),   owidyr(c,'meatSupply')),
    dataRow('Forest Area',               fmtPct(owid(c,'forestOwid')),             owidyr(c,'forestOwid')),
    dataRow('Plastic Waste per Capita',  sfx(owid(c,'plasticWaste'), 3, ' kg/day'), owidyr(c,'plasticWaste')),
  ]);
}

// ── COMPONENT HELPERS ────────────────────────────────

function section(labelText, srcClass, title, rows) {
  const srcLabel = { wb: 'World Bank', imf: 'IMF', un: 'UN', oecd: 'OECD', owid: 'OWID', unesco: 'UNESCO' }[srcClass] || srcClass.toUpperCase();
  const content = rows.filter(Boolean).join('');
  return `
    <p class="section-label">${labelText} <span class="src-badge src-${srcClass}">${srcLabel}</span></p>
    <div class="data-section">
      <div class="data-section-header"><h3>${title}</h3></div>
      ${content || `<div class="no-data-row">No data available for this country</div>`}
    </div>`;
}

function statCard(label, value, sub, small = false, copyable = false) {
  const copyAttr = copyable && value ? ` onclick="navigator.clipboard.writeText('${value}').then(()=>toast('Copied: ${value}'))" title="Click to copy" style="cursor:pointer"` : '';
  return `<div class="stat-card"${copyAttr}>
    <div class="stat-label">${label}</div>
    <div class="stat-value" style="${small ? 'font-size:18px' : ''}">${value || '—'}</div>
    <div class="stat-sub">${sub || ''}${copyable && value ? ' <span class="kbd-hint">click to copy</span>' : ''}</div>
  </div>`;
}

function dataRow(label, value, year) {
  if (value === null || value === undefined) return '';
  return `<div class="data-row">
    <span class="data-row-label">${label}</span>
    <div class="data-row-right">
      <div class="data-row-value">${value}</div>
      ${year ? `<div class="data-row-year">${year}</div>` : ''}
    </div>
  </div>`;
}

// ── UNESCO SECTIONS ───────────────────────────────────

function renderUNESCOEducation(c) {
  const hasFile = Object.keys(S.unescoData).length > 0;
  const rows = [
    dataRow('Adult Literacy Rate',          fmtPct(unesco(c,'literacyAdult')),           unescoyr(c,'literacyAdult')),
    dataRow('Youth Literacy Rate (15–24)',   fmtPct(unesco(c,'literacyYouth')),           unescoyr(c,'literacyYouth')),
    dataRow('Female Adult Literacy',         fmtPct(unesco(c,'literacyAdultF')),          unescoyr(c,'literacyAdultF')),
    dataRow('Primary Net Enrolment',         fmtPct(unesco(c,'primaryNetEnrol')),         unescoyr(c,'primaryNetEnrol')),
    dataRow('Primary Completion Rate',       fmtPct(unesco(c,'primaryCompletion')),       unescoyr(c,'primaryCompletion')),
    dataRow('Out-of-School Rate (Primary)',  fmtPct(unesco(c,'outOfSchoolPrimary')),      unescoyr(c,'outOfSchoolPrimary')),
    dataRow('Lower Secondary Completion',    fmtPct(unesco(c,'lowerSecCompletion')),      unescoyr(c,'lowerSecCompletion')),
    dataRow('Upper Secondary Completion',    fmtPct(unesco(c,'upperSecCompletion')),      unescoyr(c,'upperSecCompletion')),
    dataRow('Lower Sec. Net Enrolment',      fmtPct(unesco(c,'lowerSecNetEnrol')),        unescoyr(c,'lowerSecNetEnrol')),
    dataRow('Upper Sec. Net Enrolment',      fmtPct(unesco(c,'upperSecNetEnrol')),        unescoyr(c,'upperSecNetEnrol')),
    dataRow('Tertiary Gross Enrolment',      fmtPct(unesco(c,'tertiaryGrossEnrol')),      unescoyr(c,'tertiaryGrossEnrol')),
    dataRow('Tertiary Enrolment (Female)',   fmtPct(unesco(c,'tertiaryEnrolF')),          unescoyr(c,'tertiaryEnrolF')),
    dataRow('Pupil–Teacher Ratio (Primary)', fmt(unesco(c,'pupilTeacherPrimary'), 1),    unescoyr(c,'pupilTeacherPrimary')),
    dataRow('Pupil–Teacher Ratio (Sec.)',    fmt(unesco(c,'pupilTeacherSecondary'), 1),  unescoyr(c,'pupilTeacherSecondary')),
    dataRow('Trained Teachers, Primary (%)', fmtPct(unesco(c,'trainedTeachersPrimary')), unescoyr(c,'trainedTeachersPrimary')),
    dataRow('Trained Teachers, Sec. (%)',   fmtPct(unesco(c,'trainedTeachersSec')),     unescoyr(c,'trainedTeachersSec')),
    dataRow('Gender Parity — Primary',       fmt(unesco(c,'gpiPrimary'), 2),              unescoyr(c,'gpiPrimary')),
    dataRow('Gender Parity — Tertiary',      fmt(unesco(c,'gpiTertiary'), 2),             unescoyr(c,'gpiTertiary')),
    dataRow('Proficiency in Math (Primary)', fmtPct(unesco(c,'profMathPrimary')),        unescoyr(c,'profMathPrimary')),
    dataRow('Proficiency in Reading (Pri.)', fmtPct(unesco(c,'profReadPrimary')),        unescoyr(c,'profReadPrimary')),
    dataRow('Proficiency in Math (L.Sec.)', fmtPct(unesco(c,'profMathLowerSec')),       unescoyr(c,'profMathLowerSec')),
    dataRow('Govt Education Spend (% GDP)', fmtPct(unesco(c,'govtEduSpendGDP')),        unescoyr(c,'govtEduSpendGDP')),
    dataRow('Education Share of Budget',    fmtPct(unesco(c,'govtEduSpendBudget')),     unescoyr(c,'govtEduSpendBudget')),
    dataRow('Schools with Electricity',     fmtPct(unesco(c,'schoolsWithElec')),        unescoyr(c,'schoolsWithElec')),
    dataRow('Schools with Internet (Pri.)', fmtPct(unesco(c,'schoolsWithInternet')),    unescoyr(c,'schoolsWithInternet')),
    dataRow('Schools with Internet (Sec.)', fmtPct(unesco(c,'schoolsWithInternetSec')), unescoyr(c,'schoolsWithInternetSec')),
    dataRow('STEM Graduates (% of all)',    fmtPct(unesco(c,'stemGraduates')),           unescoyr(c,'stemGraduates')),
  ].filter(Boolean);

  const noDataMsg = hasFile
    ? `<div class="no-data-row">No UNESCO data for this country</div>`
    : `<div class="no-data-row">Run <code>python3 fetch_unesco.py</code> to load UNESCO data</div>`;

  return `
    <p class="section-label">Education — UNESCO <span class="src-badge src-unesco">UNESCO</span></p>
    <div class="data-section">
      <div class="data-section-header"><h3>UNESCO Education Indicators</h3></div>
      ${rows.join('') || noDataMsg}
    </div>`;
}

function renderUNESCOScience(c) {
  return section('Science & Innovation — UNESCO', 'unesco', 'UNESCO Science & Innovation', [
    dataRow('R&D Expenditure (% GDP)',        fmtPct(unesco(c,'rdSpendGDP')),            unescoyr(c,'rdSpendGDP')),
    dataRow('Govt R&D Spend (% GDP)',         fmtPct(unesco(c,'govRdGDP')),              unescoyr(c,'govRdGDP')),
    dataRow('Researchers (per million pop)',  fmt(unesco(c,'researchersPerMillion'), 0),  unescoyr(c,'researchersPerMillion')),
    dataRow('Female Researchers (%)',         fmtPct(unesco(c,'researchersFemale')),     unescoyr(c,'researchersFemale')),
    dataRow('Patent Applications (per mil)', fmt(unesco(c,'patentApplications'), 1),    unescoyr(c,'patentApplications')),
  ]);
}

// ── RANKINGS ─────────────────────────────────────────

// Each field: key (unique id), label (dropdown text),
//   fmt(c) → display string,  num(c) → raw number for sorting (null = text sort)
const RANK_FIELDS = [
  // Text fields
  { key:'name',            label:'Name (A–Z)',              fmt:c=>c.name,                                                         num:null },
  { key:'region',          label:'Region',                  fmt:c=>c.region,                                                       num:null },
  { key:'income',          label:'Income Level',            fmt:c=>c.income,                                                       num:null },
  // IMF — gdpUSD stored in billions already, so display as-is with B suffix
  { key:'gdpUSD',          label:'GDP (current USD)',        fmt:c=>{ const v=imf(c,'gdpUSD');     return v!=null?'$'+fmt(v,1)+'B':'—'; }, num:c=>+(imf(c,'gdpUSD')||0) },
  { key:'gdpPerCapUSD',    label:'GDP per Capita (USD)',     fmt:c=>fmtUSD(imf(c,'gdpPerCapUSD'),0)||'—',                           num:c=>+(imf(c,'gdpPerCapUSD')||0) },
  { key:'gdpPerCapPPP',    label:'GDP per Capita (PPP)',     fmt:c=>fmtUSD(imf(c,'gdpPerCapPPP'),0)||'—',                           num:c=>+(imf(c,'gdpPerCapPPP')||0) },
  { key:'gdpGrowth',       label:'GDP Growth Rate',          fmt:c=>fmtPct(imf(c,'gdpGrowth'))||'—',                               num:c=>+(imf(c,'gdpGrowth')||0) },
  { key:'inflation',       label:'Inflation (CPI)',          fmt:c=>fmtPct(imf(c,'inflation'))||'—',                               num:c=>+(imf(c,'inflation')||0) },
  { key:'unemployment',    label:'Unemployment Rate',        fmt:c=>fmtPct(imf(c,'unemployment'))||'—',                            num:c=>+(imf(c,'unemployment')||0) },
  { key:'govtDebt',        label:'Govt Debt (% GDP)',        fmt:c=>fmtPct(imf(c,'govtDebt'))||'—',                                num:c=>+(imf(c,'govtDebt')||0) },
  // UN
  { key:'hdi',             label:'Human Dev. Index (HDI)',   fmt:c=>fmt(un(c,'hdi'),3)||'—',                                       num:c=>+(un(c,'hdi')||0) },
  { key:'hdiRank',         label:'HDI Rank',                 fmt:c=>fmt(un(c,'hdiRank'),0)||'—',                                   num:c=>+(un(c,'hdiRank')||0) },
  { key:'population',      label:'Population',               fmt:c=>{ const v=un(c,'popTotal'); return v!=null?fmt(v,0)+'K':'—'; }, num:c=>+(un(c,'popTotal')||0) },
  { key:'lifeExp',         label:'Life Expectancy',          fmt:c=>sfx(un(c,'lifeExpBoth'),1,' yrs')||'—',                        num:c=>+(un(c,'lifeExpBoth')||0) },
  { key:'meanSchooling',   label:'Mean Years Schooling',     fmt:c=>sfx(un(c,'meanSchooling'),1,' yrs')||'—',                      num:c=>+(un(c,'meanSchooling')||0) },
  // OWID
  { key:'co2PerCap',       label:'CO₂ per Capita (t)',       fmt:c=>sfx(owid(c,'co2PerCap'),2,' t')||'—',                          num:c=>+(owid(c,'co2PerCap')||0) },
  { key:'co2',             label:'CO₂ Emissions (Mt)',       fmt:c=>sfx(owid(c,'co2'),1,' Mt')||'—',                               num:c=>+(owid(c,'co2')||0) },
  { key:'extremePoverty',  label:'Extreme Poverty Rate',     fmt:c=>fmtPct(owid(c,'extremePoverty'))||'—',                         num:c=>+(owid(c,'extremePoverty')||0) },
  { key:'corruptionIndex', label:'Corruption Index (0–100)', fmt:c=>fmt(owid(c,'corruptionIndex'),1)||'—',                         num:c=>+(owid(c,'corruptionIndex')||0) },
  { key:'militarySpend',   label:'Military Spend (% GDP)',   fmt:c=>fmtPct(owid(c,'militarySpend'))||'—',                          num:c=>+(owid(c,'militarySpend')||0) },
  { key:'touristArrivals', label:'Tourist Arrivals',         fmt:c=>fmt(owid(c,'touristArrivals'),0)||'—',                         num:c=>+(owid(c,'touristArrivals')||0) },
  // OECD
  { key:'pisaMath',        label:'PISA Math Score',          fmt:c=>fmt(oecd(c,'pisaMath'),0)||'—',                                num:c=>+(oecd(c,'pisaMath')||0) },
  { key:'pisaRead',        label:'PISA Reading Score',       fmt:c=>fmt(oecd(c,'pisaRead'),0)||'—',                                num:c=>+(oecd(c,'pisaRead')||0) },
  { key:'taxRevenue',      label:'Tax Revenue (% GDP)',      fmt:c=>fmtPct(oecd(c,'taxRevenue'))||'—',                             num:c=>+(oecd(c,'taxRevenue')||0) },
  { key:'gini',            label:'Gini Coefficient',         fmt:c=>fmt(oecd(c,'gini'),2)||'—',                                    num:c=>+(oecd(c,'gini')||0) },
];

function showRankings() {
  if (!S.countries.length) { toast('⚠ Data is still loading…', 3000); return; }
  const m = document.getElementById('rankModal');
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('open'));
  renderRankList();
}

function closeRankModal() {
  const m = document.getElementById('rankModal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 220);
}

function renderRankList() {
  const fieldKey = document.getElementById('rankField').value || 'gdpUSD';
  const dir      = document.getElementById('rankDir').value   || 'desc';
  const field    = RANK_FIELDS.find(f => f.key === fieldKey) || RANK_FIELDS[0];
  const isNum    = field.num !== null;

  // For numeric fields, only include countries that have a real non-zero value
  const pool = isNum
    ? S.countries.filter(c => { const v = field.num(c); return v && isFinite(v); })
    : S.countries;

  const sorted = [...pool].sort((a, b) => {
    if (isNum) {
      const va = field.num(a), vb = field.num(b);
      return dir === 'desc' ? vb - va : va - vb;
    }
    const cmp = (a[fieldKey] || '').localeCompare(b[fieldKey] || '', undefined, { sensitivity: 'base' });
    return dir === 'desc' ? -cmp : cmp;
  });

  const maxVal = isNum && sorted.length
    ? Math.max(...sorted.map(c => Math.abs(field.num(c))), 1)
    : 1;

  document.getElementById('rankList').innerHTML = sorted.map((c, i) => {
    const display = field.fmt(c);
    const barPct  = isNum ? (Math.abs(field.num(c)) / maxVal * 100).toFixed(1) : 0;
    return `<div class="rank-item" onclick="selectCountry(S.countries.find(x=>x.iso2==='${c.iso2}')); closeRankModal();">
      <span class="rank-num">${i + 1}</span>
      <span class="rank-flag">${flag(c.iso2)}</span>
      <div class="rank-info">
        <div class="rank-name">${c.name}</div>
        ${isNum ? `<div class="rank-bar-wrap"><div class="rank-bar" style="width:${barPct}%"></div></div>` : ''}
      </div>
      <span class="rank-val">${display}</span>
    </div>`;
  }).join('');
}

// ── MAP — 3D GLOBE + FLAT MAP ─────────────────────────

const MAP = {
  renderer: null, scene: null, camera: null,
  sphere: null, outlineGroup: null, hitGroup: null,
  countries: [],      // [{mesh, outline, iso3, name, match}]
  selected: null,     // currently selected hit mesh
  hovered: null,
  dragging: false, lastMouse: {x:0,y:0},
  rot: {x: 0.3, y: 0},
  autoSpin: true, spinSpeed: 0.0018,
  zoom: 2.6,
  geoData: null,      // cached TopoJSON
  rafId: null,
  _navTimer: null,
};

// Globe colour palette
const MC = {
  ocean:    new THREE.Color('#061220'),
  land:     new THREE.Color('#193558'),
  border:   new THREE.Color('#2a6aad'),
  hover:    new THREE.Color('#4a9fd4'),
  selected: new THREE.Color('#2b5ce6'),
  atm:      new THREE.Color('#1a3a6a'),
};

// ── Geo data ─────────────────────────────────────────
async function fetchGeoData() {
  if (MAP.geoData) return MAP.geoData;
  const r = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  if (!r.ok) throw new Error('geo fetch failed');
  MAP.geoData = await r.json();
  return MAP.geoData;
}

// ISO numeric → ISO3 lookup
const NUM_ISO3 = {
  4:'AFG',8:'ALB',12:'DZA',24:'AGO',32:'ARG',36:'AUS',40:'AUT',50:'BGD',
  56:'BEL',64:'BTN',68:'BOL',70:'BIH',72:'BWA',76:'BRA',100:'BGR',104:'MMR',
  116:'KHM',120:'CMR',124:'CAN',140:'CAF',144:'LKA',152:'CHL',156:'CHN',
  170:'COL',178:'COG',180:'COD',188:'CRI',191:'HRV',192:'CUB',196:'CYP',
  203:'CZE',204:'BEN',208:'DNK',214:'DOM',218:'ECU',818:'EGY',222:'SLV',
  226:'GNQ',232:'ERI',233:'EST',231:'ETH',246:'FIN',250:'FRA',266:'GAB',
  288:'GHA',276:'DEU',300:'GRC',320:'GTM',324:'GIN',332:'HTI',340:'HND',
  348:'HUN',356:'IND',360:'IDN',364:'IRN',368:'IRQ',372:'IRL',376:'ISR',
  380:'ITA',388:'JAM',392:'JPN',400:'JOR',404:'KEN',410:'KOR',408:'PRK',
  414:'KWT',418:'LAO',422:'LBN',426:'LSO',430:'LBR',434:'LBY',440:'LTU',
  442:'LUX',450:'MDG',454:'MWI',458:'MYS',466:'MLI',484:'MEX',496:'MNG',
  504:'MAR',508:'MOZ',516:'NAM',524:'NPL',528:'NLD',554:'NZL',558:'NIC',
  562:'NER',566:'NGA',578:'NOR',586:'PAK',591:'PAN',598:'PNG',600:'PRY',
  604:'PER',608:'PHL',616:'POL',620:'PRT',630:'PRI',634:'QAT',642:'ROU',
  643:'RUS',646:'RWA',682:'SAU',686:'SEN',694:'SLE',706:'SOM',710:'ZAF',
  724:'ESP',729:'SDN',740:'SUR',752:'SWE',756:'CHE',760:'SYR',762:'TJK',
  764:'THA',768:'TGO',780:'TTO',788:'TUN',792:'TUR',800:'UGA',804:'UKR',
  784:'ARE',826:'GBR',840:'USA',858:'URY',860:'UZB',862:'VEN',704:'VNM',
  887:'YEM',894:'ZMB',716:'ZWE',51:'ARM',31:'AZE',112:'BLR',84:'BLZ',
  854:'BFA',108:'BDI',132:'CPV',148:'TCD',174:'COM',262:'DJI',268:'GEO',
  624:'GNB',328:'GUY',398:'KAZ',417:'KGZ',428:'LVA',438:'LIE',498:'MDA',
  492:'MCO',480:'MUS',478:'MRT',807:'MKD',499:'MNE',585:'PLW',275:'PSE',
  674:'SMR',678:'STP',690:'SYC',703:'SVK',705:'SVN',90:'SLB',728:'SSD',
  798:'TUV',626:'TLS',795:'TKM',776:'TON',548:'VUT',212:'DMA',308:'GRD',
  659:'KNA',662:'LCA',670:'VCT',
};

function iso3FromFeature(f) {
  const num = f.id != null ? +f.id : null;
  if (num && NUM_ISO3[num]) return NUM_ISO3[num];
  const nm = (f.properties?.name || '').toLowerCase();
  return S.countries.find(c => c.name.toLowerCase() === nm)?.id || null;
}

// ── TopoJSON decode ───────────────────────────────────
function decodeArcs(topo) {
  const sc = topo.transform?.scale    || [1,1];
  const tr = topo.transform?.translate || [0,0];
  return topo.arcs.map(arc => {
    let x=0,y=0;
    return arc.map(d => { x+=d[0]; y+=d[1]; return [x*sc[0]+tr[0], y*sc[1]+tr[1]]; });
  });
}

function getCountryRings(geom, arcs) {
  const rings = [];
  function addRing(r) {
    const pts = [];
    r.forEach(i => {
      const a = i<0 ? [...arcs[~i]].reverse() : arcs[i];
      pts.push(...a);
    });
    if (pts.length) rings.push(pts);
  }
  if (geom.type==='Polygon')      geom.arcs.forEach(r => addRing(r));
  if (geom.type==='MultiPolygon') geom.arcs.forEach(p => p.forEach(r => addRing(r)));
  return rings;
}

// ── 3D helpers ────────────────────────────────────────
function ll3d(lon, lat, r) {
  const phi   = (90-lat)  * Math.PI/180;
  const theta = (lon+180) * Math.PI/180;
  return new THREE.Vector3(
    -r*Math.sin(phi)*Math.cos(theta),
     r*Math.cos(phi),
     r*Math.sin(phi)*Math.sin(theta)
  );
}

function makeOutline(rings, r, color) {
  const verts = [];
  rings.forEach(ring => {
    for (let i=0; i<ring.length-1; i++) {
      const a=ll3d(ring[i][0],ring[i][1],r), b=ll3d(ring[i+1][0],ring[i+1][1],r);
      verts.push(a.x,a.y,a.z,b.x,b.y,b.z);
    }
  });
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  return new THREE.LineSegments(g,new THREE.LineBasicMaterial({color}));
}

function makeHitMesh(rings, r) {
  const verts=[];
  rings.forEach(ring => {
    if(ring.length<3) return;
    let cx=0,cy=0,cz=0;
    ring.forEach(p=>{const v=ll3d(p[0],p[1],r);cx+=v.x;cy+=v.y;cz+=v.z;});
    const n=ring.length; cx/=n; cy/=n; cz/=n;
    for(let i=0;i<ring.length-1;i++){
      const a=ll3d(ring[i][0],ring[i][1],r), b=ll3d(ring[i+1][0],ring[i+1][1],r);
      verts.push(cx,cy,cz,a.x,a.y,a.z,b.x,b.y,b.z);
    }
  });
  if(!verts.length) return null;
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  return new THREE.Mesh(g,new THREE.MeshBasicMaterial({
    color:MC.land, side:THREE.DoubleSide, transparent:true, opacity:0.01
  }));
}

// ── Build Globe ───────────────────────────────────────
async function buildGlobe() {
  const canvas    = document.getElementById('globeCanvas');
  const container = document.getElementById('mapContainer');
  const W = container.clientWidth  || 900;
  const H = container.clientHeight || 520;

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.setClearColor(0x060e1b,1);
  MAP.renderer = renderer;

  const scene = new THREE.Scene(); MAP.scene = scene;
  const camera = new THREE.PerspectiveCamera(45,W/H,0.1,100);
  camera.position.z = MAP.zoom; MAP.camera = camera;

  // Stars
  const sv=[];
  for(let i=0;i<4000;i++){
    const v=new THREE.Vector3((Math.random()-.5)*120,(Math.random()-.5)*120,(Math.random()-.5)*120);
    if(v.length()>6) sv.push(v.x,v.y,v.z);
  }
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.Float32BufferAttribute(sv,3));
  scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:0.055,transparent:true,opacity:0.5})));

  // Ocean sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1,64,64),
    new THREE.MeshPhongMaterial({color:MC.ocean,shininess:18})
  );
  scene.add(sphere); MAP.sphere=sphere;

  // Atmosphere glow
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.06,32,32),
    new THREE.MeshBasicMaterial({color:MC.atm,transparent:true,opacity:0.06,side:THREE.BackSide})
  ));

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff,0.4));
  const sun=new THREE.DirectionalLight(0xffffff,0.88); sun.position.set(5,3,5); scene.add(sun);
  const fill=new THREE.DirectionalLight(0x4488cc,0.22); fill.position.set(-5,-2,-3); scene.add(fill);

  // Show loading
  const tip = document.getElementById('globeTooltip');
  tip.textContent='🌍 Loading countries…'; tip.classList.add('show');

  let topo;
  try { topo=await fetchGeoData(); }
  catch(e){ tip.textContent='⚠ Map data unavailable — check your internet connection'; startGlobeLoop(); return; }

  const arcs   = decodeArcs(topo);
  const outGrp = new THREE.Group();
  const hitGrp = new THREE.Group();
  MAP.countries    = [];
  MAP.outlineGroup = outGrp;
  MAP.hitGroup     = hitGrp;

  topo.objects.countries.geometries.forEach(geom => {
    const rings = getCountryRings(geom,arcs);
    if(!rings.length) return;
    const iso3  = iso3FromFeature(geom);
    const match = iso3 ? S.countries.find(c=>c.id===iso3) : null;
    const name  = match?.name || geom.properties?.name || iso3 || '?';

    const outline = makeOutline(rings,1.001,MC.border);
    const hit     = makeHitMesh(rings,1.001);
    outGrp.add(outline);
    if(hit){ hit.userData={iso3,name,match,outline}; hitGrp.add(hit); MAP.countries.push({mesh:hit,outline,iso3,name,match}); }
  });

  scene.add(outGrp);
  scene.add(hitGrp);
  tip.classList.remove('show');

  setupGlobeEvents(canvas,scene,camera);
  startGlobeLoop();
}

function startGlobeLoop() {
  if(MAP.rafId) return;
  function loop() {
    MAP.rafId = requestAnimationFrame(loop);
    if(MAP.autoSpin && !MAP.dragging) MAP.rot.y += MAP.spinSpeed;
    [MAP.sphere, MAP.outlineGroup, MAP.hitGroup].forEach(o => {
      if(!o) return; o.rotation.x=MAP.rot.x; o.rotation.y=MAP.rot.y;
    });
    MAP.camera.position.z = MAP.zoom;
    MAP.renderer.render(MAP.scene,MAP.camera);
  }
  loop();
}

function setupGlobeEvents(canvas,scene,camera) {
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();
  const tip       = document.getElementById('globeTooltip');

  function pick(cx,cy) {
    const r=canvas.getBoundingClientRect();
    mouse.set(((cx-r.left)/r.width)*2-1,-((cy-r.top)/r.height)*2+1);
    raycaster.setFromCamera(mouse,camera);
    return raycaster.intersectObjects(MAP.hitGroup.children,false)[0]?.object||null;
  }

  function resetMesh(obj) {
    obj.material.opacity=0.01; obj.material.color.set(MC.land);
    if(obj.userData.outline?.material) obj.userData.outline.material.color.set(MC.border);
  }
  function highlightMesh(obj,col) {
    obj.material.opacity=0.3; obj.material.color.set(col);
    if(obj.userData.outline?.material) obj.userData.outline.material.color.set(col);
  }

  // Mouse drag
  let dragSX=0,dragSY=0;
  canvas.addEventListener('mousedown',e=>{
    MAP.dragging=true; dragSX=e.clientX; dragSY=e.clientY;
    MAP.lastMouse={x:e.clientX,y:e.clientY};
  });
  window.addEventListener('mousemove',e=>{
    if(MAP.dragging){
      MAP.rot.y+=(e.clientX-MAP.lastMouse.x)*0.005;
      MAP.rot.x+=(e.clientY-MAP.lastMouse.y)*0.005;
      MAP.rot.x=Math.max(-Math.PI/2.1,Math.min(Math.PI/2.1,MAP.rot.x));
      MAP.lastMouse={x:e.clientX,y:e.clientY}; MAP.autoSpin=false; return;
    }
    // Only run hover picking when mouse is inside the canvas
    const r=canvas.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){
      if(MAP.hovered&&MAP.hovered!==MAP.selected) { resetMesh(MAP.hovered); MAP.hovered=null; }
      return;
    }
    // Hover
    const hit=pick(e.clientX,e.clientY);
    if(hit!==MAP.hovered){
      if(MAP.hovered&&MAP.hovered!==MAP.selected) resetMesh(MAP.hovered);
      MAP.hovered=hit;
      if(hit&&hit!==MAP.selected){ highlightMesh(hit,MC.hover); tip.textContent=`${flag(hit.userData.match?.iso2||'')} ${hit.userData.name}`; tip.classList.add('show'); }
      else if(!hit){ if(MAP.selected) { tip.textContent=`${flag(MAP.selected.userData.match?.iso2||'')} ${MAP.selected.userData.name}`; tip.classList.add('show'); } else tip.classList.remove('show'); }
    }
  });
  window.addEventListener('mouseup',e=>{
    const wasDrag=Math.hypot(e.clientX-dragSX,e.clientY-dragSY)>5;
    MAP.dragging=false;
    if(!wasDrag){
      const r=canvas.getBoundingClientRect();
      const inCanvas=e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
      if(inCanvas){ const h=pick(e.clientX,e.clientY); if(h) selectGlobeCountry(h); }
    }
  });

  // Touch
  let t0=null;
  canvas.addEventListener('touchstart',e=>{e.preventDefault();t0={x:e.touches[0].clientX,y:e.touches[0].clientY};MAP.lastMouse={...t0};MAP.dragging=true;},{passive:false});
  canvas.addEventListener('touchmove', e=>{e.preventDefault();const t=e.touches[0];MAP.rot.y+=(t.clientX-MAP.lastMouse.x)*0.005;MAP.rot.x+=(t.clientY-MAP.lastMouse.y)*0.005;MAP.rot.x=Math.max(-Math.PI/2.1,Math.min(Math.PI/2.1,MAP.rot.x));MAP.lastMouse={x:t.clientX,y:t.clientY};MAP.autoSpin=false;},{passive:false});
  canvas.addEventListener('touchend', e=>{MAP.dragging=false;if(t0){const t=e.changedTouches[0];if(Math.hypot(t.clientX-t0.x,t.clientY-t0.y)<10){const h=pick(t.clientX,t.clientY);if(h)selectGlobeCountry(h);}}});

  // Scroll zoom
  canvas.addEventListener('wheel',e=>{e.preventDefault();MAP.zoom=Math.max(1.3,Math.min(7,MAP.zoom+e.deltaY*0.003));},{passive:false});
  // Double-click → resume spin
  canvas.addEventListener('dblclick',()=>{MAP.autoSpin=true;});
}

function highlightGlobeCountry(hit) {
  // Visually highlight only — no navigation, no closing modal
  if(MAP.selected && MAP.selected!==hit){
    MAP.selected.material.opacity=0.01; MAP.selected.material.color.set(MC.land);
    if(MAP.selected.userData.outline?.material) MAP.selected.userData.outline.material.color.set(MC.border);
  }
  MAP.selected=hit;
  hit.material.opacity=0.42; hit.material.color.set(MC.selected);
  if(hit.userData.outline?.material) hit.userData.outline.material.color.set(MC.selected);
  const m=hit.userData.match;
  const tip=document.getElementById('globeTooltip');
  tip.textContent=`${flag(m?.iso2||'')} ${hit.userData.name}`;
  tip.classList.add('show');
}

function selectGlobeCountry(hit) {
  // Cancel any previous pending navigation
  if(MAP._navTimer){ clearTimeout(MAP._navTimer); MAP._navTimer=null; }

  highlightGlobeCountry(hit);

  // Spin globe toward the country
  const m=hit.userData.match;
  if(m?.lon&&m?.lat){
    const tY=-(parseFloat(m.lon)+180)*Math.PI/180+Math.PI;
    const tX= parseFloat(m.lat)*Math.PI/180*0.4;
    const sY=MAP.rot.y,sX=MAP.rot.x;
    let t=0;
    (function anim(){t+=0.05;MAP.rot.y=sY+(tY-sY)*Math.min(t,1);MAP.rot.x=sX+(tX-sX)*Math.min(t,1);if(t<1)requestAnimationFrame(anim);})();
  }

  // Navigate + close after delay — only if this was a real user click
  if(m){
    MAP._navTimer=setTimeout(()=>{
      MAP._navTimer=null;
      selectCountry(m);
      closeMapModal();
    },700);
  }
}

async function showMap() {
  // Cancel any stale nav timer from a previous session so we don't auto-close
  if(MAP._navTimer){ clearTimeout(MAP._navTimer); MAP._navTimer=null; }

  const modal = document.getElementById('mapModal');
  modal.style.display='flex';
  // Wait one frame so the modal is actually visible and has real dimensions
  await new Promise(r=>requestAnimationFrame(r));
  modal.classList.add('open');

  if(!MAP.renderer) {
    await buildGlobe();
  } else {
    // Resize renderer to match the now-visible container
    const el=document.getElementById('mapContainer');
    const W=el.clientWidth||900, H=el.clientHeight||520;
    MAP.renderer.setSize(W,H);
    MAP.camera.aspect=W/H;
    MAP.camera.updateProjectionMatrix();
    if(!MAP.rafId) startGlobeLoop();
  }

  // Pre-highlight current country (visual only — no auto-navigation)
  if(S.selected && MAP.countries.length) {
    const f=MAP.countries.find(c=>c.match?.iso2===S.selected);
    if(f) highlightGlobeCountry(f.mesh);
  }
}

function closeMapModal() {
  // Cancel any pending country navigation so reopening doesn't auto-close
  if(MAP._navTimer){ clearTimeout(MAP._navTimer); MAP._navTimer=null; }
  const modal=document.getElementById('mapModal');
  modal.classList.remove('open');
  setTimeout(()=>{ modal.style.display='none'; },220);
  // Pause the render loop while hidden to save resources
  if(MAP.rafId){ cancelAnimationFrame(MAP.rafId); MAP.rafId=null; }
}

window.addEventListener('resize',()=>{
  if(!MAP.renderer) return;
  const el=document.getElementById('mapContainer');
  const W=el.clientWidth, H=el.clientHeight||520;
  MAP.renderer.setSize(W,H);
  MAP.camera.aspect=W/H;
  MAP.camera.updateProjectionMatrix();
});

// ── ABOUT / SOURCES MODAL ────────────────────────────
function showAbout() {
  const m = document.getElementById('aboutModal');
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('open'));
}

function closeAboutModal() {
  const m = document.getElementById('aboutModal');
  m.classList.remove('open');
  setTimeout(() => { m.style.display = 'none'; }, 220);
}

// ── INIT ─────────────────────────────────────────────
loadAllData();
