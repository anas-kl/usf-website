// ─────────────────────────────────────────────────────────────────────────────
// main.js — USF Luxury Cars v4
// CdC v4: fleet loaded dynamically from /data/cars.json (GitHub Pages CDN)
// Images served via Cloudinary CDN with auto WebP + quality transforms
// Fallback to CONFIG.fleet if /data/cars.json is unreachable (criterion 13)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Cloudinary image URL builder ────────────────────────────────────────────
// Returns a Cloudinary URL for a given publicId with configurable transforms.
// Falls back to a local path or placeholder if publicId is missing.
//
// CdC v4 §8: "fetch /data/cars.json + getImageUrl()"
// CdC v4 §12 criterion 3: "images se chargent depuis Cloudinary avec WebP"
function getImageUrl(publicId, { transform } = {}) {
  if (!publicId) return 'images/car-placeholder.svg';

  const cloudName = CONFIG.cloudinary?.cloudName;
  if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
    console.warn('[USF] Cloudinary cloudName not configured in config.js');
    return 'images/car-placeholder.svg';
  }

  // Auto-format (WebP/AVIF based on browser), auto quality, fixed width
  const t = transform || CONFIG.cloudinary.defaultTransform || 'f_auto,q_auto,w_800,c_fill,g_auto';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${t}/${publicId}`;
}

// ─── Security: escape HTML to prevent XSS ───────────────────────────────────
// CdC v4 §7 security: "escHtml() dans main.js à conserver"
// Note: escHtml is intentionally NOT applied to ICONS (trusted SVG constants)
// or Cloudinary URLs built internally. It is applied to all user/data-sourced strings.
function escHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── WhatsApp URL builder ────────────────────────────────────────────────────
// escHtml on `number` is defensive — the number is a URL segment, not HTML,
// but escaping here is harmless and consistent with the security policy.
function whatsappUrl(number, message) {
  return `https://wa.me/${escHtml(number)}?text=${encodeURIComponent(message)}`;
}

// ─── Dynamic settings loading from /data/settings.json ──────────────────────
// Allows Youssef to update contact details via the admin panel without a deploy.
// On failure, CONFIG.business is used as-is (safe degradation).
async function loadSettings() {
  try {
    const res = await fetch('data/settings.json', { cache: 'no-store' });
    if (!res.ok) return;
    const settings = await res.json();

    // Patch CONFIG.business with values from Sheets-backed settings.json
    // Only override keys that exist and are non-empty strings
    const patchable = ['name', 'tagline', 'description', 'whatsapp',
      'whatsappMessage', 'email', 'address', 'hours', 'instagram', 'facebook'];
    patchable.forEach(key => {
      if (settings[key] && typeof settings[key] === 'string') {
        CONFIG.business[key] = settings[key];
      }
    });
  } catch (_) {
    // settings.json unavailable — CONFIG.business defaults remain active
  }
}

// ─── Dynamic fleet loading from /data/cars.json ──────────────────────────────
// CdC v4 §8: main.js must fetch /data/cars.json instead of reading CONFIG.fleet
// CdC v4 §12 criterion 2: "voitures s'affichent depuis /data/cars.json"
// CdC v4 §12 criterion 13: "si cars.json indisponible, fallback CONFIG.fleet"
//
// Returns only active cars (active === true). The admin panel sets active=FALSE
// to hide a car without deleting it (criterion 7).
async function loadFleet() {
  try {
    // cache: 'no-store' ensures visitors always get the latest after an admin update
    const res = await fetch('data/cars.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const cars = Array.isArray(data.cars) ? data.cars : [];
    const activeCars = cars.filter(car => car.active === true);

    if (activeCars.length === 0) throw new Error('Empty fleet in cars.json');

    return { cars: activeCars, source: 'remote' };
  } catch (err) {
    console.warn('[USF] cars.json unavailable, using CONFIG.fleet fallback:', err.message);
    // CONFIG.fleet cars all have active: true by default
    return { cars: CONFIG.fleet.filter(c => c.active !== false), source: 'fallback' };
  }
}

// ─── Resolve car image URL ───────────────────────────────────────────────────
// Remote cars (from cars.json) have imagePublicId → Cloudinary URL
// Fallback cars (from CONFIG.fleet) have image → local path
function resolveCarImage(car) {
  if (car.imagePublicId) return getImageUrl(car.imagePublicId);
  if (car.image) return car.image;
  return 'images/car-placeholder.svg';
}

// ─── Render Navigation ───────────────────────────────────────────────────────
function renderNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  const links = [
    { href: '#flotte', label: 'Notre Flotte' },
    { href: '#pourquoi-nous', label: 'Pourquoi Nous' },
    { href: '#processus', label: 'Réservation' },
    { href: '#contact', label: 'Contact' }
  ];
  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="#" class="nav-logo" aria-label="${escHtml(CONFIG.business.name)} - Accueil">
        <span class="logo-usf">USF</span><span class="logo-luxury"> Luxury</span><span class="logo-cars"> Cars</span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-links">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="nav-links" role="list">
        ${links.map(l => `<li><a href="${escHtml(l.href)}" class="nav-link">${escHtml(l.label)}</a></li>`).join('')}
        <li>
          <a href="${waUrl}" class="btn btn-gold btn-sm" target="_blank" rel="noopener noreferrer">
            <span class="btn-icon">${ICONS.whatsapp}</span> Réserver
          </a>
        </li>
      </ul>
    </div>
  `;
}

// ─── Render Hero ─────────────────────────────────────────────────────────────
function renderHero() {
  const section = document.getElementById('hero');
  if (!section) return;
  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  section.innerHTML = `
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-overlay"></div>
      <div class="hero-particles" id="hero-particles"></div>
    </div>
    <div class="container hero-content">
      <div class="hero-badge reveal-up">
        <span class="badge-dot"></span>
        <span>${escHtml(CONFIG.business.hours)}</span>
      </div>
      <h1 class="hero-headline reveal-up">
        ${escHtml(CONFIG.hero.headline)}<br>
        <span class="headline-accent">${escHtml(CONFIG.hero.headlineSub)}</span>
      </h1>
      <p class="hero-sub reveal-up">${escHtml(CONFIG.hero.subheadline)}</p>
      <div class="hero-actions reveal-up">
        <a href="${waUrl}" class="btn btn-gold btn-lg" target="_blank" rel="noopener noreferrer">
          <span class="btn-icon">${ICONS.whatsapp}</span>
          ${escHtml(CONFIG.hero.cta)}
        </a>
        <a href="#flotte" class="btn btn-outline btn-lg">Voir la flotte</a>
      </div>
      <p class="hero-note reveal-up">${escHtml(CONFIG.hero.ctaSub)}</p>
      <div class="hero-stats reveal-up">
        <div class="stat"><span class="stat-num">500+</span><span class="stat-label">Clients satisfaits</span></div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat"><span class="stat-num">3</span><span class="stat-label">Catégories de véhicules</span></div>
        <div class="stat-divider" aria-hidden="true"></div>
        <div class="stat"><span class="stat-num">7j/7</span><span class="stat-label">Disponibilité</span></div>
      </div>
    </div>
    <a href="#flotte" class="hero-scroll" aria-label="Défiler vers la flotte">
      ${ICONS['chevron-down']}
    </a>
  `;
}

// ─── Render Fleet ─────────────────────────────────────────────────────────────
// Receives an array of car objects (from cars.json or CONFIG.fleet fallback)
// and a source flag used for a subtle debug indicator in dev.
function renderFleet(cars, source) {
  const section = document.getElementById('flotte');
  if (!section) return;

  const categories = [...new Set(cars.map(c => c.category))];

  const tabsHtml = categories.map((cat, i) =>
    `<button class="fleet-tab ${i === 0 ? 'active' : ''}" data-cat="${escHtml(cat)}" role="tab" aria-selected="${i === 0}">${escHtml(cat)}</button>`
  ).join('');

  const cardsHtml = cars.map(car => {
    const imgSrc = resolveCarImage(car);
    const imgAlt = car.imageAlt || `${car.name} — location à Tanger`;
    const waMsg = `Bonjour ! Je suis intéressé par la location de la ${car.name}. Pouvez-vous me donner plus d'informations ?`;
    const waUrl = whatsappUrl(CONFIG.business.whatsapp, waMsg);
    const badgeHtml = car.badge ? `<span class="car-badge">${escHtml(car.badge)}</span>` : '';

    // features may be an array (cars.json after sync-sheets.js split) or a string
    const featuresArr = Array.isArray(car.features)
      ? car.features
      : (car.features ? String(car.features).split('|') : []);
    const featuresHtml = featuresArr.map(f => `<li>${escHtml(f.trim())}</li>`).join('');

    return `
      <article class="car-card reveal-up" data-cat="${escHtml(car.category)}">
        <div class="car-img-wrap">
          ${badgeHtml}
          <img
            src="${escHtml(imgSrc)}"
            alt="${escHtml(imgAlt)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='images/car-placeholder.svg'"
          >
          <div class="car-img-overlay"></div>
        </div>
        <div class="car-info">
          <span class="car-category">${escHtml(car.category)}</span>
          <h3 class="car-name">${escHtml(car.name)}</h3>
          <ul class="car-features" aria-label="Caractéristiques">${featuresHtml}</ul>
          <div class="car-footer">
            <div class="car-price">
              <span class="price-from">à partir de</span>
              <span class="price-val">${escHtml(car.price)}</span>
              <span class="price-unit">${escHtml(car.unit || 'MAD/jour')}</span>
            </div>
            <a href="${waUrl}" class="btn btn-gold btn-sm" target="_blank" rel="noopener noreferrer"
               aria-label="Réserver ${escHtml(car.name)} via WhatsApp">
              <span class="btn-icon">${ICONS.whatsapp}</span> Réserver
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Source badge only visible in dev (localhost / 127.0.0.1)
  const devBadge = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? `<p style="text-align:center;font-size:0.7rem;color:var(--white-40);margin-bottom:12px;">
        Source: <strong style="color:var(--gold)">${source === 'remote' ? 'data/cars.json' : 'CONFIG.fleet (fallback)'}</strong>
       </p>`
    : '';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-label">Notre Flotte</span>
        <h2 class="section-title">Choisissez votre <span class="text-gold">véhicule idéal</span></h2>
        <p class="section-sub">De l'économique au luxueux, tous nos véhicules sont propres, assurés et disponibles immédiatement.</p>
      </div>
      ${devBadge}
      <div class="fleet-tabs" role="tablist" aria-label="Catégories de véhicules">
        <button class="fleet-tab active" data-cat="all" role="tab" aria-selected="true">Tous</button>
        ${tabsHtml}
      </div>
      <div class="fleet-grid" id="fleet-grid">${cardsHtml}</div>
    </div>
  `;
}

// ─── Render Why Choose Us ─────────────────────────────────────────────────────
function renderWhyUs() {
  const section = document.getElementById('pourquoi-nous');
  if (!section) return;
  const itemsHtml = CONFIG.whyUs.map(item => `
    <div class="why-item reveal-up">
      <div class="why-icon" aria-hidden="true">${ICONS[item.icon] || ''}</div>
      <h3 class="why-title">${escHtml(item.title)}</h3>
      <p class="why-desc">${escHtml(item.desc)}</p>
    </div>
  `).join('');

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-label">Pourquoi Nous</span>
        <h2 class="section-title">La <span class="text-gold">différence</span> USF</h2>
        <p class="section-sub">Ce qui fait la différence entre une bonne location et une expérience mémorable.</p>
      </div>
      <div class="why-grid">${itemsHtml}</div>
    </div>
  `;
}

// ─── Render Process ───────────────────────────────────────────────────────────
function renderProcess() {
  const section = document.getElementById('processus');
  if (!section) return;
  const stepsHtml = CONFIG.process.map((step) => `
    <div class="process-step reveal-up">
      <div class="step-num" aria-hidden="true">${escHtml(step.step)}</div>
      <div class="step-connector" aria-hidden="true"></div>
      <div class="step-content">
        <h3 class="step-title">${escHtml(step.title)}</h3>
        <p class="step-desc">${escHtml(step.desc)}</p>
      </div>
    </div>
  `).join('');

  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-label">Comment ça marche</span>
        <h2 class="section-title">Réserver en <span class="text-gold">4 étapes simples</span></h2>
        <p class="section-sub">Pas de formulaires compliqués, pas d'attente. Une expérience de réservation aussi rapide que possible.</p>
      </div>
      <div class="process-grid">${stepsHtml}</div>
      <div class="process-cta reveal-up">
        <a href="${waUrl}" class="btn btn-gold btn-lg" target="_blank" rel="noopener noreferrer">
          <span class="btn-icon">${ICONS.whatsapp}</span> Commencer ma réservation
        </a>
      </div>
    </div>
  `;
}

// ─── Render Testimonials ──────────────────────────────────────────────────────
function renderTestimonials() {
  const section = document.getElementById('temoignages');
  if (!section) return;
  const itemsHtml = CONFIG.testimonials.map(t => `
    <blockquote class="testimonial-card reveal-up">
      <div class="testimonial-stars" aria-label="5 étoiles">★★★★★</div>
      <p class="testimonial-text">"${escHtml(t.text)}"</p>
      <footer class="testimonial-footer">
        <cite class="testimonial-author">${escHtml(t.author)}</cite>
        <span class="testimonial-location">${escHtml(t.location)}</span>
      </footer>
    </blockquote>
  `).join('');

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-label">Témoignages</span>
        <h2 class="section-title">Ce que disent <span class="text-gold">nos clients</span></h2>
      </div>
      <div class="testimonials-grid">${itemsHtml}</div>
    </div>
  `;
}

// ─── Render FAQ ───────────────────────────────────────────────────────────────
function renderFaq() {
  const section = document.getElementById('faq');
  if (!section) return;
  const itemsHtml = CONFIG.faq.map((item, i) => `
    <div class="faq-item reveal-up">
      <button class="faq-question" aria-expanded="false" aria-controls="faq-ans-${i}" id="faq-btn-${i}">
        <span>${escHtml(item.q)}</span>
        <span class="faq-icon" aria-hidden="true">${ICONS['chevron-down']}</span>
      </button>
      <div class="faq-answer" id="faq-ans-${i}" role="region" aria-labelledby="faq-btn-${i}" hidden>
        <p>${escHtml(item.a)}</p>
      </div>
    </div>
  `).join('');

  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-label">FAQ</span>
        <h2 class="section-title">Questions <span class="text-gold">fréquentes</span></h2>
      </div>
      <div class="faq-list">${itemsHtml}</div>
      <p class="faq-more reveal-up">Vous avez d'autres questions ? <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="link-gold">Contactez-nous sur WhatsApp</a></p>
    </div>
  `;
}

// ─── Render Contact ───────────────────────────────────────────────────────────
function renderContact() {
  const section = document.getElementById('contact');
  if (!section) return;
  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  const { business } = CONFIG;

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-label">Contact</span>
        <h2 class="section-title">Nous <span class="text-gold">contacter</span></h2>
        <p class="section-sub">Nous sommes disponibles 7j/7 de 8h à 20h. La réponse la plus rapide est via WhatsApp.</p>
      </div>
      <div class="contact-grid">
        <div class="contact-info reveal-up">
          <div class="contact-item">
            <div class="contact-icon" aria-hidden="true">${ICONS.whatsapp}</div>
            <div>
              <p class="contact-label">WhatsApp (Réservations)</p>
              <a href="${waUrl}" class="contact-value link-gold" target="_blank" rel="noopener noreferrer">+212 617 462 173</a>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon" aria-hidden="true">${ICONS.mail}</div>
            <div>
              <p class="contact-label">Email</p>
              <a href="mailto:${escHtml(business.email)}" class="contact-value">${escHtml(business.email)}</a>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon" aria-hidden="true">${ICONS['map-pin']}</div>
            <div>
              <p class="contact-label">Adresse</p>
              <p class="contact-value">${escHtml(business.address)}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon" aria-hidden="true">${ICONS.clock}</div>
            <div>
              <p class="contact-label">Horaires</p>
              <p class="contact-value">${escHtml(business.hours)}</p>
            </div>
          </div>
          <div class="contact-social">
            <a href="https://instagram.com/${escHtml(business.instagram)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram USF Luxury Cars">
              ${ICONS.instagram}
            </a>
            <a href="https://facebook.com/${encodeURIComponent(business.facebook)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook USF Luxury Cars">
              ${ICONS.facebook}
            </a>
          </div>
          <a href="${waUrl}" class="btn btn-gold btn-lg contact-btn" target="_blank" rel="noopener noreferrer">
            <span class="btn-icon">${ICONS.whatsapp}</span> Réserver via WhatsApp
          </a>
        </div>
        <div class="contact-map reveal-up">
          <iframe
            src="${escHtml(CONFIG.contact.mapEmbed)}"
            title="Localisation USF Luxury Cars à Tanger"
            loading="lazy"
            allowfullscreen=""
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  `;
}

// ─── Render Footer ────────────────────────────────────────────────────────────
function renderFooter() {
  const footer = document.getElementById('main-footer');
  if (!footer) return;
  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="container footer-inner">
      <div class="footer-brand">
        <a href="#" class="nav-logo" aria-label="${escHtml(CONFIG.business.name)}">
          <span class="logo-usf">USF</span><span class="logo-luxury"> Luxury</span><span class="logo-cars"> Cars</span>
        </a>
        <p class="footer-tagline">${escHtml(CONFIG.business.tagline)}</p>
        <p class="footer-desc">${escHtml(CONFIG.business.description)}</p>
      </div>
      <div class="footer-links">
        <h4>Navigation</h4>
        <ul>
          <li><a href="#flotte">Notre Flotte</a></li>
          <li><a href="#pourquoi-nous">Pourquoi Nous</a></li>
          <li><a href="#processus">Comment Réserver</a></li>
          <li><a href="#temoignages">Témoignages</a></li>
          <li><a href="#faq">FAQ</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-contact">
        <h4>Contact</h4>
        <ul>
          <li><a href="${waUrl}" target="_blank" rel="noopener noreferrer">+212 617 462 173</a></li>
          <li><a href="mailto:${escHtml(CONFIG.business.email)}">${escHtml(CONFIG.business.email)}</a></li>
          <li>${escHtml(CONFIG.business.address)}</li>
          <li>${escHtml(CONFIG.business.hours)}</li>
        </ul>
        <div class="footer-social">
          <a href="https://instagram.com/${escHtml(CONFIG.business.instagram)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${ICONS.instagram}</a>
          <a href="https://facebook.com/${encodeURIComponent(CONFIG.business.facebook)}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${ICONS.facebook}</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© ${year} ${escHtml(CONFIG.business.name)}. Tous droits réservés.</p>
        <p>Tanger, Maroc — Location de voitures de luxe et économiques</p>
      </div>
    </div>
  `;
}

// ─── Render WhatsApp FAB ──────────────────────────────────────────────────────
function renderWhatsAppFab() {
  const waUrl = whatsappUrl(CONFIG.business.whatsapp, CONFIG.business.whatsappMessage);
  const fab = document.createElement('a');
  fab.href = waUrl;
  fab.className = 'whatsapp-fab';
  fab.target = '_blank';
  fab.rel = 'noopener noreferrer';
  fab.setAttribute('aria-label', 'Contacter USF Luxury Cars sur WhatsApp');
  fab.innerHTML = `${ICONS.whatsapp}<span class="fab-tooltip">Réserver maintenant</span>`;
  document.body.appendChild(fab);
}

// ─── Fleet filter tabs ────────────────────────────────────────────────────────
function initFleetTabs() {
  const tabContainer = document.querySelector('.fleet-tabs');
  if (!tabContainer) return;
  tabContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.fleet-tab');
    if (!tab) return;
    const cat = tab.dataset.cat;
    tabContainer.querySelectorAll('.fleet-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.car-card').forEach(card => {
      const show = cat === 'all' || card.dataset.cat === cat;
      card.style.display = show ? '' : 'none';
    });
  });
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────
function initFaq() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-question');
    if (!btn) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answerId = btn.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);
    // Close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const a = document.getElementById(b.getAttribute('aria-controls'));
      if (a) a.hidden = true;
    });
    // Toggle current
    if (!expanded && answer) {
      btn.setAttribute('aria-expanded', 'true');
      answer.hidden = false;
    }
  });
}

// ─── Nav toggle (mobile) ──────────────────────────────────────────────────────
function initNavToggle() {
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#nav-toggle');
    if (!toggle) return;
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    document.getElementById('nav-links')?.classList.toggle('open', !expanded);
  });
  // Close nav on link click
  document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link') || e.target.closest('.btn-sm')) {
      document.getElementById('nav-links')?.classList.remove('open');
      document.getElementById('nav-toggle')?.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─── Sticky nav on scroll ─────────────────────────────────────────────────────
function initStickyNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Graceful degradation: just show everything
    document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
}

// ─── Active nav link on scroll ───────────────────────────────────────────────
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

// ─── Smooth scroll ────────────────────────────────────────────────────────────
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ─── Main entry point ─────────────────────────────────────────────────────────
// CdC v4 §8: fleet and settings are loaded async before rendering.
// All static sections (nav, hero, whyUs, etc.) render immediately.
// Fleet section renders once the async fetch resolves (with fallback).
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Load remote settings first so CONFIG.business is up to date before render
  await loadSettings();

  // 2. Render static sections immediately (no async dependency)
  renderNav();
  renderHero();
  renderWhyUs();
  renderProcess();
  renderTestimonials();
  renderFaq();
  renderContact();
  renderFooter();
  renderWhatsAppFab();

  // 3. Load fleet async — shows skeleton/empty grid until data arrives
  //    renderFleet is called once with resolved data (remote or fallback)
  const { cars, source } = await loadFleet();
  renderFleet(cars, source);

  // 4. Init interactions AFTER all renders are complete
  initFleetTabs();
  initFaq();
  initNavToggle();
  initStickyNav();
  initScrollReveal();
  initActiveNav();
  initSmoothScroll();
});
