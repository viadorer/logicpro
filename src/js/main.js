// ═══════════════════════════════════════════
// LogicPro — main.js  v3
// ═══════════════════════════════════════════

const API = '/api';
const PLACEHOLDER_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="%23e8e6e1"%3E%3Crect width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%238888a4" font-family="system-ui" font-size="16"%3EBez fotografie%3C/text%3E%3C/svg%3E';

// Codebooks (Sreality standard)
const CODEBOOKS = {
  advert_function: { 1: 'Prodej', 2: 'Pronájem' },
  advert_subtype: {
    25: 'Kanceláře', 26: 'Sklady', 27: 'Výroba', 28: 'Obchodní prostory',
    29: 'Ubytování', 30: 'Restaurace', 31: 'Zemědělský', 32: 'Ostatní',
    38: 'Činžovní dům', 49: 'Virtuální kancelář',
  },
  advert_price_currency: { 1: 'CZK', 2: 'USD', 3: 'EUR' },
  advert_price_unit: {
    1: 'za nemovitost', 2: 'za měsíc', 3: 'za m²',
    4: 'za m²/měs.', 5: 'za m²/rok', 6: 'za rok',
  },
  building_condition: {
    1: 'Velmi dobrý', 2: 'Dobrý', 3: 'Špatný', 4: 'Ve výstavbě',
    5: 'Projekt', 6: 'Novostavba', 7: 'K demolici',
    8: 'Před rekonstrukcí', 9: 'Po rekonstrukci',
  },
  energy_efficiency_rating: { 1:'A', 2:'B', 3:'C', 4:'D', 5:'E', 6:'F', 7:'G' },
};

async function fetchJSON(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// ─── Helpers ───
function formatPrice(l) {
  const curr = CODEBOOKS.advert_price_currency[l.advert_price_currency] || '';
  const unit = CODEBOOKS.advert_price_unit[l.advert_price_unit] || '';
  const val = l.advert_price >= 1000
    ? Math.round(l.advert_price).toLocaleString('cs-CZ')
    : l.advert_price.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (l.advert_price_unit === 1) return `${val} ${curr}`;
  return `${val} ${curr}/${unit.replace('za ', '')}`;
}

function formatArea(l) {
  const area = l.usable_area || l.estate_area || 0;
  return area > 0 ? area.toLocaleString('cs-CZ') + ' m²' : '';
}

function loaderHTML() {
  return '<div class="loader"><div class="loader__spinner"></div></div>';
}

function skeletonCards(n = 4) {
  return Array.from({ length: n }, () => `
    <div class="card--skeleton">
      <div class="skel-img"></div>
      <div class="skel-body">
        <div class="skel-line"></div>
        <div class="skel-line skel-line--short"></div>
        <div class="skel-line skel-line--xs"></div>
      </div>
    </div>`).join('');
}

function emptyStateHTML() {
  return `<div class="listings__empty">
    <div class="listings__empty-icon">&#128269;</div>
    <h3>Žádné výsledky</h3>
    <p>Zkuste upravit filtry nebo rozšířit vyhledávání.</p>
  </div>`;
}

function errorStateHTML(retryFn) {
  const id = 'retry_' + Date.now();
  setTimeout(() => document.getElementById(id)?.addEventListener('click', retryFn), 0);
  return `<div class="listings__error">
    <div class="listings__error-icon">&#9888;</div>
    <h3>Nepodařilo se načíst data</h3>
    <p>Zkontrolujte připojení a zkuste to znovu.</p>
    <button class="btn btn--outline btn--sm" id="${id}">Zkusit znovu</button>
  </div>`;
}

// ─── Render card HTML ───
function renderCard(l) {
  const fn = l.advert_function;
  const badgeClass = fn === 2 ? 'card__badge--rent' : 'card__badge--sale';
  const badgeText = CODEBOOKS.advert_function[fn] || '';
  const subtype = CODEBOOKS.advert_subtype[l.advert_subtype] || '';
  const area = formatArea(l);
  const loc = [l.locality_city, l.locality_region].filter(Boolean).join(', ');
  const img = l.main_image || PLACEHOLDER_IMG;

  return `
    <div class="card">
      <a href="detail.html?id=${l.id}" style="text-decoration:none;color:inherit">
        <div class="card__img">
          <img src="${img.replace('w=800', 'w=600')}" alt="${l.title}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
          <span class="card__badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="card__body">
          <h3>${l.title}</h3>
          <p class="card__loc">${loc}</p>
          <div class="card__tags">${area ? `<span>${area}</span>` : ''}<span>${subtype}</span></div>
          <div class="card__foot">
            <strong class="card__price">${formatPrice(l)}</strong>
            <span class="card__link">Detail &rarr;</span>
          </div>
        </div>
      </a>
    </div>`;
}

// ═══════════════════════════════════════════
// SHARED — Header, mobile nav, scroll reveal
// ═══════════════════════════════════════════

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 1px 8px rgba(0,0,0,.05)' : 'none';
});

const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('nav--open'));
nav.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', () => nav.classList.remove('nav--open')));

const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('vis'), i * 50);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });

function observeReveal(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}
observeReveal('.stat-card, .about__card, .bento__card, .portal, .article, .cl, .strip__item');

// Form (index.html)
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Odesláno!';
  btn.style.background = '#1a9a6c';
  setTimeout(() => { btn.textContent = 'Odeslat'; btn.style.background = ''; e.target.reset(); }, 2000);
});

// Smooth scroll for # links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (h === '#') return;
    e.preventDefault();
    document.querySelector(h)?.scrollIntoView({ behavior: 'smooth' });
  });
});

// ═══════════════════════════════════════════
// NABIDKY.HTML — Listings page
// ═══════════════════════════════════════════

const listingsGrid = document.getElementById('listingsGrid');
const listingCount = document.getElementById('listingCount');

if (listingsGrid) {
  const LIMIT = 12;
  let currentOffset = 0;
  let currentTotal = 0;
  let requestId = 0;

  // Read initial filters from URL params (e.g. nabidky.html?advert_subtype=26)
  const urlParams = new URLSearchParams(window.location.search);

  // Set active chips from URL
  urlParams.forEach((val, key) => {
    const chip = document.querySelector(`.chip--filter[data-filter="${key}"][data-value="${val}"]`);
    if (chip) {
      chip.closest('.filter-group__chips')
        .querySelectorAll('.chip--filter')
        .forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    }
  });

  // Chip click handler
  document.querySelectorAll('.chip--filter').forEach(chip => {
    chip.addEventListener('click', () => {
      const group = chip.closest('.filter-group__chips');
      group.querySelectorAll('.chip--filter').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadListings();
    });
  });

  // Area + Price inputs
  const debouncedLoad = debounce(() => loadListings(), 400);
  document.getElementById('areaMin')?.addEventListener('input', debouncedLoad);
  document.getElementById('areaMax')?.addEventListener('input', debouncedLoad);
  document.getElementById('priceMin')?.addEventListener('input', debouncedLoad);
  document.getElementById('priceMax')?.addEventListener('input', debouncedLoad);

  // Reset
  document.getElementById('filterReset')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-group__chips').forEach(group => {
      group.querySelectorAll('.chip--filter').forEach((c, i) => c.classList.toggle('active', i === 0));
    });
    ['areaMin', 'areaMax', 'priceMin', 'priceMax'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    loadListings();
  });

  // Mobile filter panel
  const filterSidebar = document.getElementById('filterSidebar');
  document.getElementById('filterToggle')?.addEventListener('click', () => {
    filterSidebar?.classList.add('filter-sidebar--open');
  });
  document.getElementById('filterClose')?.addEventListener('click', () => {
    filterSidebar?.classList.remove('filter-sidebar--open');
  });
  // Close on backdrop click (mobile)
  document.querySelector('.listings-page__content')?.addEventListener('click', (e) => {
    if (filterSidebar?.classList.contains('filter-sidebar--open') && !filterSidebar.contains(e.target)) {
      filterSidebar.classList.remove('filter-sidebar--open');
    }
  });

  function buildParams() {
    const params = new URLSearchParams();
    document.querySelectorAll('.filter-group__chips').forEach(group => {
      const active = group.querySelector('.chip--filter.active');
      if (active && active.dataset.value) {
        params.set(active.dataset.filter, active.dataset.value);
      }
    });
    const areaMin = document.getElementById('areaMin')?.value;
    const areaMax = document.getElementById('areaMax')?.value;
    const priceMin = document.getElementById('priceMin')?.value;
    const priceMax = document.getElementById('priceMax')?.value;
    if (areaMin) params.set('area_min', areaMin);
    if (areaMax) params.set('area_max', areaMax);
    if (priceMin) params.set('price_min', priceMin);
    if (priceMax) params.set('price_max', priceMax);
    return params;
  }

  async function loadListings(append = false) {
    const myId = ++requestId;

    if (!append) {
      currentOffset = 0;
      listingsGrid.innerHTML = skeletonCards(6);
    }

    const params = buildParams();
    params.set('limit', LIMIT);
    params.set('offset', currentOffset);

    try {
      const data = await fetchJSON('/listings?' + params.toString());

      // Ignore stale responses
      if (myId !== requestId) return;

      currentTotal = data.total;
      listingCount.textContent = data.total;

      if (data.listings.length === 0 && !append) {
        listingsGrid.innerHTML = emptyStateHTML();
        return;
      }

      const cardsHTML = data.listings.map(renderCard).join('');

      if (append) {
        // Remove old load-more button
        listingsGrid.querySelector('.load-more')?.remove();
        listingsGrid.insertAdjacentHTML('beforeend', cardsHTML);
      } else {
        listingsGrid.innerHTML = cardsHTML;
      }

      // Add load more button if there are more results
      currentOffset += data.listings.length;
      if (currentOffset < currentTotal) {
        listingsGrid.insertAdjacentHTML('beforeend', `
          <div class="load-more">
            <button class="btn btn--outline btn--sm" id="loadMoreBtn">Načíst další</button>
          </div>`);
        document.getElementById('loadMoreBtn').addEventListener('click', () => loadListings(true));
      }

      // Animate cards
      setTimeout(() => observeReveal('#listingsGrid .card'), 50);
    } catch (err) {
      if (myId !== requestId) return;
      console.error('Failed to load listings:', err);
      if (!append) {
        listingsGrid.innerHTML = errorStateHTML(() => loadListings());
      }
    }
  }

  // Initial load
  loadListings();
}


// ═══════════════════════════════════════════
// DETAIL.HTML — Property detail page
// ═══════════════════════════════════════════

const detailTitle = document.getElementById('detailTitle');
const detailDesc = document.getElementById('detailDesc');

if (detailTitle && detailDesc) {
  const id = new URLSearchParams(window.location.search).get('id');

  if (!id) {
    detailTitle.textContent = 'Nabídka nenalezena';
  } else {
    loadDetail(id);
  }

  async function loadDetail(id) {
    try {
      const l = await fetchJSON('/listings/' + id);

      // Page title
      document.getElementById('pageTitle').textContent = l.title + ' | LogicPro';
      document.getElementById('bcTitle').textContent = l.title;

      // Gallery
      const galleryImg = document.getElementById('galleryImg');
      const galleryThumbs = document.getElementById('galleryThumbs');
      const galleryBadge = document.getElementById('galleryBadge');

      let galleryImages = [];

      if (l.images && l.images.length) {
        galleryImages = l.images;
        const mainImg = l.images.find(i => i.is_main) || l.images[0];
        galleryImg.src = mainImg.url.replace('w=800', 'w=1200');
        galleryImg.alt = l.title;
        galleryImg.onerror = function() { this.src = PLACEHOLDER_IMG; };

        galleryBadge.textContent = CODEBOOKS.advert_function[l.advert_function] || '';
        galleryBadge.className = 'card__badge ' + (l.advert_function === 2 ? 'card__badge--rent' : 'card__badge--sale');

        galleryThumbs.innerHTML = l.images.map((img, i) => `
          <button class="gallery__thumb ${i === 0 ? 'active' : ''}" data-src="${img.url.replace('w=800', 'w=1200')}" data-idx="${i}">
            <img src="${img.url}" alt="${img.alt || ''}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
          </button>`).join('');

        galleryThumbs.querySelectorAll('.gallery__thumb').forEach(thumb => {
          thumb.addEventListener('click', () => {
            galleryThumbs.querySelectorAll('.gallery__thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            galleryImg.src = thumb.dataset.src;
          });
        });
      }

      // Keyboard navigation for gallery
      if (galleryImages.length > 1) {
        let currentIdx = 0;
        document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (e.key === 'ArrowRight') currentIdx = (currentIdx + 1) % galleryImages.length;
            else currentIdx = (currentIdx - 1 + galleryImages.length) % galleryImages.length;

            const thumbs = galleryThumbs.querySelectorAll('.gallery__thumb');
            thumbs.forEach(t => t.classList.remove('active'));
            thumbs[currentIdx]?.classList.add('active');
            galleryImg.src = galleryImages[currentIdx].url.replace('w=800', 'w=1200');
          }
        });
      }

      // Title + location
      detailTitle.textContent = l.title;
      document.getElementById('detailLoc').textContent =
        [l.locality_city, l.locality_region].filter(Boolean).join(', ');

      // Badges
      const badges = document.getElementById('detailBadges');
      badges.innerHTML = `
        <span class="chip">${CODEBOOKS.advert_function[l.advert_function] || ''}</span>
        <span class="chip chip--sm">${CODEBOOKS.advert_subtype[l.advert_subtype] || ''}</span>
      `;

      // Params
      const params = document.getElementById('detailParams');
      const paramItems = [];
      if (l.usable_area) paramItems.push({ label: 'Plocha', value: l.usable_area.toLocaleString('cs-CZ') + ' m²' });
      if (l.estate_area) paramItems.push({ label: 'Pozemek', value: l.estate_area.toLocaleString('cs-CZ') + ' m²' });
      paramItems.push({ label: 'Cena', value: formatPrice(l), accent: true });
      if (l.building_condition) paramItems.push({ label: 'Stav', value: CODEBOOKS.building_condition[l.building_condition] || '' });
      if (l.energy_efficiency_rating) paramItems.push({ label: 'Energetika', value: CODEBOOKS.energy_efficiency_rating[l.energy_efficiency_rating] || '' });
      if (l.ceiling_height) paramItems.push({ label: 'Výška', value: l.ceiling_height + ' m' });
      if (l.floors) paramItems.push({ label: 'Podlaží', value: l.floors });

      params.innerHTML = paramItems.map(p =>
        `<div class="params__item">
          <span class="params__label">${p.label}</span>
          <strong class="params__value${p.accent ? ' params__value--accent' : ''}">${p.value}</strong>
        </div>`
      ).join('');

      // Description
      const descParts = (l.description || '').split('\n').filter(Boolean);
      detailDesc.innerHTML = descParts.map(p => `<p>${p}</p>`).join('');

      // Features
      const features = document.getElementById('detailFeatures');
      const featureList = Array.isArray(l.features) ? l.features : [];
      features.innerHTML = featureList.map(f => `<span class="features__item">${f}</span>`).join('');

      // Map placeholder
      const mapEl = document.getElementById('detailMap');
      if (l.locality_city) {
        mapEl.textContent = `Mapa — ${l.locality_citypart || l.locality_city}, ${l.locality_region || ''}`;
      }

      // Animate
      setTimeout(() => observeReveal('.params__item, .features__item'), 100);

      // Similar
      loadSimilar(id);

    } catch (err) {
      console.error('Failed to load detail:', err);
      detailTitle.textContent = 'Nepodařilo se načíst nabídku';
    }
  }

  async function loadSimilar(id) {
    const grid = document.getElementById('similarGrid');
    grid.innerHTML = skeletonCards(3);
    try {
      const data = await fetchJSON('/listings/' + id + '/similar');
      if (data.listings.length) {
        grid.innerHTML = data.listings.map(renderCard).join('');
        setTimeout(() => observeReveal('#similarGrid .card'), 100);
      } else {
        grid.innerHTML = '';
      }
    } catch (err) {
      console.error('Failed to load similar:', err);
      grid.innerHTML = '';
    }
  }
}


// ═══════════════════════════════════════════
// INDEX.HTML — Featured listings
// ═══════════════════════════════════════════

const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid) {
  featuredGrid.innerHTML = skeletonCards(3);
  (async () => {
    try {
      const data = await fetchJSON('/listings/featured');
      featuredGrid.innerHTML = data.listings.map(renderCard).join('');
      setTimeout(() => observeReveal('#featuredGrid .card'), 100);
    } catch (err) {
      console.error('Failed to load featured:', err);
      featuredGrid.innerHTML = '';
    }
  })();
}


// ─── Utility ───
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
