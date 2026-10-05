const DEFAULT_SLIDES = [
  { imageUrl: 'assets/lounge/mb-lounge-dance-floor.jpg', altText: 'The MB Lounge dance floor lit in blue and green' },
  { imageUrl: 'assets/lounge/mb-lounge-bar-wide.jpg', altText: 'The colorful Worcester skyline mural inside MB Lounge' },
  { imageUrl: 'assets/lounge/mb-lounge-bar-taps.jpg', altText: 'Rainbow flags and taps behind the MB Lounge bar' },
  { imageUrl: 'assets/lounge/mb-lounge-lights.jpg', altText: 'Colorful stage lights across the MB Lounge dance floor' },
];
const DEFAULT_LIVE_VIDEO = {
  enabled: true,
  title: 'Live from the Lounge',
  caption: 'A live look inside MB Lounge. 21+ only.',
  provider: 'rtsp-me',
  embedUrl: 'https://rtsp.me/embed/t9e9hkrN/',
  aspectRatio: '16:9',
};
const FONT_STACKS = {
  'Playfair Display': "'Playfair Display', Georgia, serif",
  'DM Sans': "'DM Sans', Arial, sans-serif",
  Georgia: 'Georgia, serif',
  Arial: 'Arial, sans-serif',
  'system-ui': 'system-ui, sans-serif',
};
const SITE_CONTENT_URL = 'content/site.json?v=2';
const BASE_PATH = new URL('.', document.baseURI).pathname.replace(/\/$/, '');

const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  primaryNav?.classList.toggle('is-open', !isOpen);
});
primaryNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  primaryNav.classList.remove('is-open');
}));
document.querySelector('#year').textContent = new Date().getFullYear();

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function recordValue(record) {
  if (!record) return {};
  if (record.data) return recordValue(record.data);
  return record.attributes ? { ...record.attributes, id: record.id, documentId: record.documentId } : record;
}

function fileValue(file) {
  if (!file) return null;
  if (Array.isArray(file)) return fileValue(file[0]);
  if (file.data) return fileValue(file.data);
  const item = recordValue(file);
  if (item.formats?.large?.url) return { ...item, url: item.formats.large.url };
  return item;
}

function assetUrl(value) {
  const file = fileValue(value);
  const url = typeof file === 'string' ? file : file?.url;
  if (!url) return '';
  if (/^https:\/\//i.test(url)) return url;
  if (/^https:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return url;
  return `${BASE_PATH}/${url.replace(/^\.\//, '')}`;
}

function textOfBlocks(blocks) {
  if (!Array.isArray(blocks)) return String(blocks || '');
  return blocks.map((block) => {
    if (block.type === 'paragraph' || block.type === 'heading') return (block.children || []).map((child) => child.text || '').join('');
    return '';
  }).filter(Boolean).join('\n\n');
}

function setText(selector, value, scope = document) {
  const element = scope.querySelector(selector);
  if (element && value !== undefined && value !== null) element.textContent = value;
  return element;
}

function setHeading(element, heading, accentHeading) {
  if (!element || (!heading && !accentHeading)) return;
  element.replaceChildren();
  if (heading) element.append(document.createTextNode(heading));
  if (accentHeading) {
    if (heading) element.append(document.createElement('br'));
    const accent = document.createElement('em');
    accent.textContent = accentHeading;
    element.append(accent);
  }
}

function setAction(element, action) {
  if (!element || !action) return;
  element.textContent = '';
  element.append(document.createTextNode(action.label || 'Learn more'));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = ' ↗';
  element.append(arrow);
  if (action.url) element.setAttribute('href', action.url);
}

function applySlides(slides, duration = 5000, transitionDuration = 500, transition = 'fade') {
  const surface = document.querySelector('.hero-image');
  const usableSlides = (slides || []).map((slide) => {
    const value = recordValue(slide);
    const image = assetUrl(value.image) || value.imageUrl || '';
    return { image, alt: value.altText || fileValue(value.image)?.alternativeText || 'MB Lounge' };
  }).filter((slide) => slide.image);
  if (!surface || !usableSlides.length) return;

  let current = 0;
  surface.style.transition = transition === 'fade' ? `opacity ${Math.max(0, transitionDuration)}ms ease` : 'none';
  const showSlide = (index, animate = true) => {
    const slide = usableSlides[index];
    if (animate && transition === 'fade' && transitionDuration > 0) surface.style.opacity = '0.25';
    window.setTimeout(() => {
      surface.style.backgroundImage = `url("${slide.image.replace(/["\\]/g, '')}")`;
      surface.setAttribute('aria-label', slide.alt);
      surface.style.opacity = '1';
    }, animate && transition === 'fade' ? Math.min(transitionDuration / 2, 260) : 0);
  };
  showSlide(0, false);
  if (usableSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.setInterval(() => {
    current = (current + 1) % usableSlides.length;
    showSlide(current, true);
  }, Math.max(1000, Number(duration) || 5000));
}

function applySettings(input) {
  const settings = recordValue(input);
  const brand = recordValue(settings.brand);
  const typography = recordValue(settings.typography);
  const layout = recordValue(settings.layout);
  const marketing = recordValue(settings.marketing);
  const visit = recordValue(settings.visit);
  const footer = recordValue(settings.footer);
  const root = document.documentElement;
  if (brand.primaryColor) root.style.setProperty('--ink', brand.primaryColor);
  if (brand.accentColor) root.style.setProperty('--accent', brand.accentColor);
  if (brand.accentColor) root.style.setProperty('--pink', brand.accentColor);
  if (brand.highlightColor) root.style.setProperty('--highlight', brand.highlightColor);
  if (brand.surfaceColor) { root.style.setProperty('--cream', brand.surfaceColor); root.style.setProperty('--paper', brand.surfaceColor); }
  if (brand.textColor) root.style.setProperty('--text-color', brand.textColor);
  if (typography.headingFont && FONT_STACKS[typography.headingFont]) root.style.setProperty('--serif', FONT_STACKS[typography.headingFont]);
  if (typography.bodyFont && FONT_STACKS[typography.bodyFont]) root.style.setProperty('--sans', FONT_STACKS[typography.bodyFont]);
  const fontRules = [];
  const headingFile = assetUrl(typography.headingFontFile);
  const bodyFile = assetUrl(typography.bodyFontFile);
  if (headingFile) fontRules.push(`@font-face{font-family:MBHeading;src:url("${headingFile.replace(/["\\]/g, '')}");font-display:swap}:root{--serif:MBHeading,Georgia,serif}`);
  if (bodyFile) fontRules.push(`@font-face{font-family:MBBody;src:url("${bodyFile.replace(/["\\]/g, '')}");font-display:swap}:root{--sans:MBBody,Arial,sans-serif}`);
  let fontStyle = document.querySelector('#cms-font-faces');
  if (fontRules.length) {
    if (!fontStyle) { fontStyle = document.createElement('style'); fontStyle.id = 'cms-font-faces'; document.head.append(fontStyle); }
    fontStyle.textContent = fontRules.join('\n');
  } else fontStyle?.remove();
  if (layout.contentWidth) root.dataset.contentWidth = layout.contentWidth;
  if (layout.sectionSpacing) root.dataset.sectionSpacing = layout.sectionSpacing;
  root.dataset.rounded = String(Boolean(layout.roundedCorners));

  const announcement = document.querySelector('.announcement');
  if (announcement && marketing.announcementEnabled === false) announcement.hidden = true;
  if (announcement && marketing.announcementText) {
    const text = document.createTextNode(marketing.announcementText);
    const dot = announcement.querySelector('.live-dot');
    announcement.replaceChildren(...(dot ? [dot, text] : [text]));
  }

  const logo = assetUrl(brand.logo);
  if (logo) {
    document.querySelectorAll('.brand').forEach((brandLink) => {
      const mark = brandLink.querySelector('.brand-mark');
      if (!mark) {
        const existingLogo = brandLink.querySelector('.brand-logo');
        if (existingLogo) existingLogo.src = logo;
        return;
      }
      const image = document.createElement('img');
      image.src = logo;
      image.alt = settings.siteName || 'MB Lounge';
      image.className = 'brand-logo';
      mark.replaceWith(image);
    });
  }

  if (Array.isArray(settings.navigation) && settings.navigation.length) {
    const nav = document.querySelector('#primary-nav');
    if (nav) {
      const existingContactClass = 'nav-contact';
      nav.replaceChildren(...settings.navigation.map((entry, index) => {
        const item = recordValue(entry);
        const link = document.createElement('a');
        link.textContent = item.label || 'Link';
        link.href = item.url || '#';
        if (item.openInNewTab) { link.target = '_blank'; link.rel = 'noreferrer'; }
        if (index === settings.navigation.length - 1) {
          link.className = existingContactClass;
          link.append(document.createTextNode(' '));
          const arrow = document.createElement('span');
          arrow.setAttribute('aria-hidden', 'true');
          arrow.textContent = '↗';
          link.append(arrow);
        }
        return link;
      }));
    }
  }

  if (settings.siteName) document.title = `${settings.siteName} — Worcester, MA`;
  if (settings.siteName) document.querySelectorAll('.brand-copy strong').forEach((element) => { element.textContent = settings.siteName.toUpperCase(); });
  if (visit.addressLabel) setText('.visit-address .strip-label', visit.addressLabel);
  if (visit.address) setText('.visit-address strong', visit.address);
  if (visit.cityLine || visit.directionsUrl) {
    const addressLine = document.querySelector('.visit-address>span:last-child');
    if (addressLine) {
      addressLine.replaceChildren(document.createTextNode(visit.cityLine || ''));
      if (visit.directionsUrl) {
        addressLine.append(document.createTextNode(' · '));
        const directions = document.createElement('a');
        directions.href = visit.directionsUrl;
        directions.target = '_blank';
        directions.rel = 'noopener noreferrer';
        directions.textContent = visit.directionsLabel || 'Get directions ↗';
        addressLine.append(directions);
      }
    }
  }
  if (visit.hoursLabel) setText('.visit-hours .strip-label', visit.hoursLabel);
  if (visit.daysOpen) setText('.visit-hours strong', visit.daysOpen);
  if (visit.openHours) setText('.visit-hours>span:last-child', visit.openHours);
  if (visit.phoneLabel) setText('.visit-phone .strip-label', visit.phoneLabel);
  if (visit.phone) {
    const phone = document.querySelector('.visit-phone strong a');
    if (phone) { phone.textContent = visit.phone; phone.href = `tel:${visit.phone.replace(/[^+\d]/g, '')}`; }
  }
  if (visit.parkingNote) setText('.visit-phone>span:last-child', visit.parkingNote);
  if (footer.blurb) setText('.footer-blurb', footer.blurb);
  const footerAddress = document.querySelector('.footer-contact>a');
  if (footerAddress && (footer.address || footer.cityLine)) {
    footerAddress.replaceChildren(document.createTextNode(`${footer.address || ''}${footer.address && footer.cityLine ? '\n' : ''}${footer.cityLine || ''} ↗`));
    if (footer.addressUrl) { footerAddress.href = footer.addressUrl; footerAddress.target = '_blank'; footerAddress.rel = 'noopener noreferrer'; }
  }
  const footerPhone = document.querySelector('.footer-contact>a[href^="tel:"]');
  if (footer.phone && footerPhone) { footerPhone.textContent = footer.phone; footerPhone.href = `tel:${footer.phone.replace(/[^+\d]/g, '')}`; }
  const footerContacts = document.querySelectorAll('.footer-contact');
  const socialLinks = footerContacts[footerContacts.length - 1];
  if (socialLinks) {
    const instagram = socialLinks.querySelector('a[href*="instagram"]');
    const facebook = socialLinks.querySelector('a[href*="facebook"]');
    const email = socialLinks.querySelector('a[href^="mailto:"]');
    if (footer.instagramUrl && instagram) instagram.href = footer.instagramUrl;
    if (footer.facebookUrl && facebook) facebook.href = footer.facebookUrl;
    if (footer.email && email) { email.textContent = footer.email; email.href = `mailto:${footer.email}`; }
  }
  const description = marketing.defaultShareDescription;
  if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
}

function updateEventCards(events, block) {
  const grid = document.querySelector('.event-grid');
  if (!grid || !Array.isArray(events)) return;
  const section = document.querySelector('#events');
  const eventBlock = recordValue(block);
  setText('.eyebrow', eventBlock.eyebrow, section || document);
  setHeading(section?.querySelector('h2'), eventBlock.heading, eventBlock.accentHeading);
  const eventsIntro = section?.querySelector('.events-footnote');
  if (eventsIntro && eventBlock.intro) {
    if (eventsIntro.firstChild?.nodeType === Node.TEXT_NODE) eventsIntro.firstChild.nodeValue = `${eventBlock.intro} `;
    else eventsIntro.prepend(document.createTextNode(`${eventBlock.intro} `));
  }
  const allEvents = section?.querySelector('.section-heading .text-link');
  if (allEvents && eventBlock.allEventsUrl) allEvents.href = eventBlock.allEventsUrl;
  const maximum = Math.max(1, Math.min(12, Number(eventBlock.maxEvents) || 3));
  const items = events.map(recordValue).filter((event) => event.published !== false).slice(0, maximum);
  if (!items.length) {
    grid.replaceChildren();
    const empty = document.createElement('p');
    empty.className = 'events-empty';
    empty.textContent = 'New events are on the way. Follow us for the latest announcements.';
    grid.append(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((event) => {
    const card = document.createElement('article');
    card.className = `event-card reveal${event.featured ? ' event-card-featured' : ''}`;
    const date = new Date(event.startsAt);
    const dateBox = document.createElement('div');
    dateBox.className = 'event-date';
    const month = document.createElement('span');
    month.textContent = Number.isNaN(date.getTime()) ? 'MB' : new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).toUpperCase();
    const day = document.createElement('strong');
    day.textContent = Number.isNaN(date.getTime()) ? 'EVENT' : new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
    dateBox.append(month, day);
    const copy = document.createElement('div');
    copy.className = 'event-copy';
    const type = document.createElement('span');
    type.className = 'event-type';
    type.textContent = String(event.eventType || 'special event').replaceAll('-', ' ').toUpperCase();
    const title = document.createElement('h3');
    title.textContent = event.title || 'MB Lounge event';
    const summary = document.createElement('p');
    summary.textContent = event.summary || '';
    const timing = document.createElement('span');
    timing.className = 'event-time';
    timing.textContent = `${Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(date)}${event.priceLabel ? ` · ${event.priceLabel}` : ''}`;
    copy.append(type, title, summary, timing);
    const arrow = document.createElement('a');
    arrow.className = 'event-arrow';
    arrow.href = event.ticketUrl || block?.allEventsUrl || 'https://www.facebook.com/MBLoungeWorcester/events';
    arrow.target = '_blank';
    arrow.rel = 'noreferrer';
    arrow.setAttribute('aria-label', `Event details for ${event.title || 'MB Lounge event'}`);
    arrow.textContent = '↗';
    card.append(dateBox, copy, arrow);
    fragment.append(card);
  });
  grid.replaceChildren(fragment);
}

function makeSection(className, id) {
  const section = document.createElement('section');
  section.className = className;
  if (id) section.id = id;
  section.dataset.cmsGenerated = 'true';
  return section;
}

function addEyebrow(parent, value, dark = false) {
  if (!value) return;
  const eyebrow = document.createElement('p');
  eyebrow.className = `eyebrow${dark ? ' eyebrow-dark' : ''}`;
  const dot = document.createElement('span');
  eyebrow.append(dot, document.createTextNode(value));
  parent.append(eyebrow);
}

function addCMSAction(parent, action) {
  const item = recordValue(action);
  if (!item.label || !item.url) return;
  const link = document.createElement('a');
  link.className = `button button-${item.style || 'primary'}`;
  link.href = item.url;
  link.append(document.createTextNode(item.label));
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = ' ↗';
  link.append(arrow);
  parent.append(link);
}

function safeEmbedUrl(provider, rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') return '';
    if (provider === 'rtsp-me' && url.hostname === 'rtsp.me' && /^\/embed\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)) return url.href;
    if (provider === 'youtube' && ['www.youtube-nocookie.com', 'www.youtube.com'].includes(url.hostname) && /^\/embed\/[A-Za-z0-9_-]+$/.test(url.pathname)) return url.href;
    if (provider === 'vimeo' && url.hostname === 'player.vimeo.com' && /^\/video\/[0-9]+$/.test(url.pathname)) return url.href;
  } catch (_) { return ''; }
  return '';
}

function makeLiveVideo(input) {
  const block = recordValue(input);
  if (block.enabled === false) return null;
  const src = safeEmbedUrl(block.provider || 'rtsp-me', block.embedUrl || DEFAULT_LIVE_VIDEO.embedUrl);
  if (!src) return null;
  const section = makeSection('live-video-section', 'live-feed');
  const content = document.createElement('div');
  content.className = 'live-video-inner';
  addEyebrow(content, 'FROM INSIDE THE LOUNGE', true);
  const title = document.createElement('h2');
  title.textContent = block.title || DEFAULT_LIVE_VIDEO.title;
  content.append(title);
  if (block.caption) {
    const caption = document.createElement('p');
    caption.className = 'live-video-caption';
    caption.textContent = block.caption;
    content.append(caption);
  }
  const frame = document.createElement('div');
  frame.className = `live-video-frame ratio-${(block.aspectRatio || '16:9').replace(':', '-')}`;
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = block.title || 'MB Lounge live video';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
  frame.append(iframe);
  const poster = assetUrl(block.poster);
  if (poster) frame.style.setProperty('--video-poster', `url("${poster.replace(/["\\]/g, '')}")`);
  content.append(frame);
  section.append(content);
  return section;
}

function makePromo(input) {
  const block = recordValue(input);
  if (block.enabled === false) return null;
  const section = makeSection('cms-promo-section');
  const image = assetUrl(block.image);
  if (image) section.style.setProperty('--promo-image', `url("${image.replace(/["\\]/g, '')}")`);
  const inner = document.createElement('div');
  inner.className = 'cms-promo-inner';
  addEyebrow(inner, block.eyebrow);
  const heading = document.createElement('h2');
  heading.textContent = block.heading || '';
  inner.append(heading);
  if (block.body) {
    const body = document.createElement('p');
    body.textContent = block.body;
    inner.append(body);
  }
  addCMSAction(inner, block.action);
  section.append(inner);
  return section;
}

function makeRichText(input) {
  const block = recordValue(input);
  const section = makeSection('cms-rich-section');
  const inner = document.createElement('div');
  inner.className = 'cms-rich-inner';
  addEyebrow(inner, block.eyebrow, true);
  if (block.heading) {
    const heading = document.createElement('h2');
    heading.textContent = block.heading;
    inner.append(heading);
  }
  const text = textOfBlocks(block.body);
  text.split(/\n{2,}/).filter(Boolean).forEach((part) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = part;
    inner.append(paragraph);
  });
  section.append(inner);
  return section;
}

function makeGallery(input) {
  const block = recordValue(input);
  const section = makeSection('cms-gallery-section');
  const inner = document.createElement('div');
  inner.className = 'cms-gallery-inner';
  addEyebrow(inner, block.eyebrow, true);
  if (block.heading) {
    const heading = document.createElement('h2');
    heading.textContent = block.heading;
    inner.append(heading);
  }
  const grid = document.createElement('div');
  grid.className = 'cms-gallery-grid';
  (block.images || []).map(recordValue).forEach((item) => {
    const src = assetUrl(item.image) || item.imageUrl;
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.alt = item.altText || fileValue(item.image)?.alternativeText || '';
    img.loading = 'lazy';
    grid.append(img);
  });
  inner.append(grid);
  section.append(inner);
  return section;
}

function makeLogoGrid(input) {
  const block = recordValue(input);
  const section = makeSection('cms-logo-section');
  const inner = document.createElement('div');
  inner.className = 'cms-logo-inner';
  addEyebrow(inner, block.eyebrow, true);
  if (block.heading) {
    const heading = document.createElement('h2');
    heading.textContent = block.heading;
    inner.append(heading);
  }
  const grid = document.createElement('div');
  grid.className = 'cms-logo-grid';
  (block.logos || []).map(recordValue).forEach((partner) => {
    const item = document.createElement(partner.url ? 'a' : 'div');
    item.className = 'cms-partner-logo';
    if (partner.url) { item.href = partner.url; item.target = '_blank'; item.rel = 'noreferrer'; }
    const src = assetUrl(partner.logo);
    if (src) {
      const image = document.createElement('img');
      image.src = src;
      image.alt = partner.name || '';
      item.append(image);
    } else item.textContent = partner.name || '';
    grid.append(item);
  });
  inner.append(grid);
  section.append(inner);
  return section;
}

function makeLogoTicker(input) {
  const block = recordValue(input);
  if (block.enabled === false) return null;
  const logos = (block.logos || []).map(recordValue).filter((entry) => assetUrl(entry.logo));
  if (!logos.length) return null;
  const section = makeSection('cms-logo-ticker-section');
  const inner = document.createElement('div');
  inner.className = 'cms-logo-ticker-inner';
  if (block.heading) {
    const heading = document.createElement('h2');
    heading.className = 'cms-logo-ticker-heading';
    heading.textContent = block.heading;
    inner.append(heading);
  }
  const viewport = document.createElement('div');
  viewport.className = `cms-logo-ticker-viewport${block.pauseOnHover === false ? '' : ' pause-on-hover'}`;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', block.heading || 'MB Lounge community partners');
  viewport.tabIndex = 0;
  viewport.style.setProperty('--ticker-duration', `${Math.max(12, Math.min(120, Number(block.durationSeconds) || 34))}s`);
  viewport.style.setProperty('--ticker-gap', `${Math.max(18, Math.min(96, Number(block.gapPixels) || 48))}px`);
  const track = document.createElement('div');
  track.className = `cms-logo-ticker-track${block.direction === 'right' ? ' ticker-right' : ''}${block.effect === 'float' ? ' ticker-float' : ''}`;
  const createLogos = (duplicate = false) => {
    const row = document.createElement('div');
    row.className = 'cms-logo-ticker-row';
    if (duplicate) row.setAttribute('aria-hidden', 'true');
    logos.forEach((entry) => {
      const src = assetUrl(entry.logo);
      const item = entry.url ? document.createElement('a') : document.createElement('span');
      item.className = 'cms-logo-ticker-item';
      if (entry.url) {
        item.href = entry.url;
        if (entry.openInNewTab !== false) { item.target = '_blank'; item.rel = 'noopener noreferrer'; }
      }
      if (entry.name) item.setAttribute('aria-label', entry.name);
      const image = document.createElement('img');
      image.src = src;
      image.alt = duplicate ? '' : (entry.altText || entry.name || '');
      image.loading = 'lazy';
      image.decoding = 'async';
      item.append(image);
      row.append(item);
    });
    return row;
  };
  track.append(createLogos(), createLogos(true));
  viewport.append(track);
  inner.append(viewport);
  section.append(inner);
  if (block.animation === false || window.matchMedia('(prefers-reduced-motion: reduce)').matches) track.classList.add('ticker-static');
  return section;
}

function applyHero(block) {
  const section = document.querySelector('.hero');
  const eyebrow = recordValue(block);
  if (!section) return;
  setText('.eyebrow', eyebrow.eyebrow, section);
  setHeading(section.querySelector('h1'), eyebrow.heading, eyebrow.accentHeading);
  setText('.hero-intro', eyebrow.body, section);
  setAction(section.querySelector('.button-primary'), eyebrow.primaryAction);
  setAction(section.querySelector('.button-quiet'), eyebrow.secondaryAction);
  applySlides(eyebrow.slides?.length ? eyebrow.slides : DEFAULT_SLIDES, eyebrow.slideDuration, eyebrow.transitionDuration, eyebrow.transition);
}

function applyStory(block) {
  const section = document.querySelector('#about');
  const data = recordValue(block);
  if (!section) return;
  setText('.eyebrow', data.eyebrow, section);
  setHeading(section.querySelector('h2'), data.heading, data.accentHeading);
  const copy = textOfBlocks(data.body);
  const storyCopy = section.querySelector('.story-copy');
  storyCopy?.querySelectorAll(':scope>p:not(.eyebrow)').forEach((paragraph) => paragraph.remove());
  const action = storyCopy?.querySelector('.button-outline');
  copy.split(/\n{2,}/).filter(Boolean).forEach((part) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = part;
    action?.before(paragraph);
  });
  const image = assetUrl(data.image) || data.imageUrl;
  if (image) section.querySelector('.story-photo')?.style.setProperty('background-image', `url("${image.replace(/["\\]/g, '')}")`);
  if (data.imageAlt) section.querySelector('.story-photo')?.setAttribute('aria-label', data.imageAlt);
  setText('.story-years strong', data.statValue, section);
  setText('.story-years span', data.statLabel, section);
}

function applyPrivateEvents(block) {
  const section = document.querySelector('#private-events');
  const data = recordValue(block);
  if (!section) return;
  setText('.eyebrow', data.eyebrow, section);
  setHeading(section.querySelector('h2'), data.heading, data.accentHeading);
  const copy = section.querySelector('.private-copy>p:not(.eyebrow)');
  if (copy && data.body) copy.textContent = textOfBlocks(data.body);
  const image = assetUrl(data.image) || data.imageUrl;
  if (image) section.querySelector('.private-image')?.style.setProperty('background-image', `url("${image.replace(/["\\]/g, '')}")`);
  if (data.imageAlt) section.querySelector('.private-image')?.setAttribute('aria-label', data.imageAlt);
  setAction(section.querySelector('.button-primary'), data.action);
}

function applyCommunity(block) {
  const section = document.querySelector('#community');
  const data = recordValue(block);
  if (!section) return;
  setText('.eyebrow', data.eyebrow, section);
  setHeading(section.querySelector('h2'), data.heading, data.accentHeading);
  const copy = section.querySelector('.community-inner>p:not(.eyebrow)');
  if (copy && data.body) copy.textContent = textOfBlocks(data.body);
  setAction(section.querySelector('.text-link'), data.action);
}

function generatedBlock(block, events) {
  const type = block.type || block.__component;
  const aliases = {
    hero: 'sections.hero', 'event-list': 'sections.event-list', story: 'sections.story',
    'private-events': 'sections.private-events', community: 'sections.community',
    'live-video': 'sections.live-video', 'promo-banner': 'sections.promo-banner',
    'rich-text': 'sections.rich-text', 'photo-gallery': 'sections.photo-gallery',
    'logo-grid': 'sections.logo-grid', 'logo-ticker': 'sections.logo-ticker',
  };
  const resolved = aliases[type] || type;
  if (resolved === 'sections.live-video') return makeLiveVideo(block);
  if (resolved === 'sections.promo-banner') return makePromo(block);
  if (resolved === 'sections.rich-text') return makeRichText(block);
  if (resolved === 'sections.photo-gallery') return makeGallery(block);
  if (resolved === 'sections.logo-grid') return makeLogoGrid(block);
  if (resolved === 'sections.logo-ticker') return makeLogoTicker(block);
  if (resolved === 'sections.event-list') updateEventCards(events, block);
  if (resolved === 'sections.hero') applyHero(block);
  if (resolved === 'sections.story') applyStory(block);
  if (resolved === 'sections.private-events') applyPrivateEvents(block);
  if (resolved === 'sections.community') applyCommunity(block);
  const selectors = {
    'sections.hero': '#home',
    'sections.event-list': '#events',
    'sections.story': '#about',
    'sections.private-events': '#private-events',
    'sections.community': '#community',
  };
  return selectors[resolved] ? document.querySelector(selectors[resolved]) : null;
}

function applyHomepage(input, events) {
  const homepage = recordValue(input);
  const sections = homepage.sections;
  if (!Array.isArray(sections) || !sections.length) return;
  const main = document.querySelector('#main');
  const visit = document.querySelector('#visit');
  if (!main || !visit) return;
  const visibleSections = sections.map((block) => generatedBlock(recordValue(block), events)).filter(Boolean);
  const heroPosition = visibleSections.indexOf(document.querySelector('#home'));
  if (!visibleSections.includes(visit)) visibleSections.splice(heroPosition >= 0 ? heroPosition + 1 : 0, 0, visit);
  main.replaceChildren(...visibleSections);
  main.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));

  const seo = recordValue(homepage.seo);
  if (seo.title) document.title = seo.title;
  if (seo.description) document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
  const share = assetUrl(seo.shareImage);
  if (share) {
    let image = document.querySelector('meta[property="og:image"]');
    if (!image) { image = document.createElement('meta'); image.setAttribute('property', 'og:image'); document.head.append(image); }
    image.content = share;
  }
}

function applyFallbackVideo() {
  const events = document.querySelector('#events');
  const main = document.querySelector('#main');
  const block = makeLiveVideo(DEFAULT_LIVE_VIDEO);
  if (block && main) {
    if (events?.nextElementSibling) events.after(block);
    else main.append(block);
  }
}

async function loadCMS() {
  applySlides(DEFAULT_SLIDES, 5000, 500, 'fade');
  applyFallbackVideo();
  try {
    const response = await fetch(`${SITE_CONTENT_URL}?v=1`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Site content returned ${response.status}`);
    const data = await response.json();
    if (data.settings) applySettings(data.settings);
    const events = Array.isArray(data.events) ? data.events.map(recordValue) : [];
    if (data.homepage) {
      document.querySelector('[data-cms-generated="true"]')?.remove();
      applyHomepage(data.homepage, events);
    }
  } catch (error) {
    console.info('MB Lounge content file is not available; showing the built-in preview content.', error);
  }
}

loadCMS();
