/* Sveltia CMS custom preview for the single-file site collection. */
(function () {
  if (!window.CMS || !window.createClass || !window.h) return;

  var h = window.h;
  var previewCSS = '/MBLounge/admin/preview.css?v=4';
  window.CMS.registerPreviewStyle(previewCSS);

  function val(value, fallback) {
    return value === undefined || value === null || value === '' ? (fallback || '') : value;
  }

  function keyPath(path) {
    return { 'data-key-path': path, tabIndex: 0 };
  }

  function moduleStyle(block, style) {
    var result = Object.assign({}, style || {});
    if (block.backgroundColor) {
      result.backgroundColor = block.backgroundColor;
      result['--preview-module-background'] = block.backgroundColor;
    }
    if (block.fontColor) {
      result.color = block.fontColor;
      result['--preview-module-color'] = block.fontColor;
    }
    return result;
  }

  function moduleProps(block, index, className, style) {
    return { className: className, key: index, style: moduleStyle(block, style) };
  }

  function imageUrl(path, getAsset) {
    if (!path) return '';
    var asset = getAsset(path);
    var url = asset && asset.url ? asset.url : path;
    if (/^(https?:|blob:|data:|\/)/i.test(url)) return url;
    return 'https://commerce-dash.github.io/MBLounge/' + url.replace(/^\.\//, '');
  }

  function action(label, url, className) {
    if (!label) return null;
    return h('a', { className: className || 'preview-button', href: url || '#', onClick: function (event) { event.preventDefault(); } }, label, h('span', null, '↗'));
  }

  function sectionTitle(block, index) {
    return h('div', { className: 'preview-section-heading' },
      block.eyebrow && h('p', { className: 'preview-eyebrow', 'data-key-path': 'homepage.sections.' + index + '.eyebrow' }, block.eyebrow),
      h('h2', null,
        h('span', { 'data-key-path': 'homepage.sections.' + index + '.heading' }, val(block.heading, 'Section heading')),
        block.accentHeading && h('em', { 'data-key-path': 'homepage.sections.' + index + '.accentHeading' }, block.accentHeading)
      )
    );
  }

  function renderSection(block, index, data, getAsset) {
    var type = block.type;
    var base = 'homepage.sections.' + index + '.';
    var image = imageUrl(block.image || block.poster, getAsset);
    if (type === 'hero') {
      var slides = block.slides || [];
      var heroImage = slides[0] && imageUrl(slides[0].image, getAsset);
      return h('section', moduleProps(block, index, 'preview-hero', heroImage ? { '--preview-hero-image': 'url("' + heroImage + '")' } : {}),
        h('div', { className: 'preview-hero-shade' }),
        h('div', { className: 'preview-hero-copy' },
          h('p', Object.assign({ className: 'preview-eyebrow' }, keyPath(base + 'eyebrow')), '✦  ' + val(block.eyebrow, 'A Worcester original')),
          h('h1', null, h('span', Object.assign({}, keyPath(base + 'heading')), val(block.heading, 'Your night.')), h('em', Object.assign({}, keyPath(base + 'accentHeading')), val(block.accentHeading, 'Your people.'))),
          h('p', Object.assign({ className: 'preview-intro' }, keyPath(base + 'body')), val(block.body, 'A neighborhood lounge with a little more sparkle.')),
          h('div', { className: 'preview-actions' },
            action(block.primaryAction && block.primaryAction.label, block.primaryAction && block.primaryAction.url, 'preview-button'),
            action(block.secondaryAction && block.secondaryAction.label, block.secondaryAction && block.secondaryAction.url, 'preview-link')
          )
        ),
        h('div', { className: 'preview-hero-foot' }, 'WORCESTER · MASSACHUSETTS', h('span', null, 'A NEIGHBORHOOD LOUNGE SINCE 1971'))
      );
    }

    if (type === 'event-list') {
      var events = (data.events || []).filter(function (event) { return event.published !== false && event.startsAt && !isNaN(new Date(event.startsAt)) && new Date(event.startsAt).getTime() >= Date.now(); }).sort(function (a, b) { return new Date(a.startsAt) - new Date(b.startsAt); }).slice(0, Number(block.maxEvents) || 3);
      return h('section', moduleProps(block, index, 'preview-section preview-events'),
        h('div', { className: 'preview-section-heading' }, sectionTitle(block, index), action('All events', block.allEventsUrl, 'preview-text-link')),
        block.intro && h('p', { className: 'preview-muted' }, block.intro),
        h('div', { className: 'preview-event-grid' }, events.length ? events.map(function (event, eventIndex) {
          var date = event.startsAt ? new Date(event.startsAt) : null;
          var dateLabel = date && !isNaN(date) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'UPCOMING';
          var timeLabel = date && !isNaN(date) ? date.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' }) + ' · ' + date.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }) : '';
          var eventCardStyle = {};
          if (event.backgroundColor) eventCardStyle.backgroundColor = event.backgroundColor;
          if (event.fontColor) { eventCardStyle.color = event.fontColor; eventCardStyle['--preview-event-color'] = event.fontColor; }
          var eventImage = imageUrl(event.backgroundImage, getAsset);
          if (eventImage) eventCardStyle.backgroundImage = 'linear-gradient(#17131599,#171315bb),url("' + eventImage + '")';
          return h('article', { className: 'preview-event-card' + (event.featured ? ' preview-event-featured' : ''), key: eventIndex, style: eventCardStyle },
            h('span', { className: 'preview-event-date' }, dateLabel),
            h('small', null, val(event.eventType, 'SPECIAL EVENT')),
            h('h3', null, val(event.title, 'Event title')),
            h('p', null, val(event.summary, 'Event details will appear here.')),
            h('span', { className: 'preview-event-time' }, timeLabel + (event.priceLabel ? ' · ' + event.priceLabel : '')),
            h('span', { className: 'preview-calendar-link' }, 'Add to Google Calendar ↗')
          );
        }) : h('div', { className: 'preview-event-card' }, 'Upcoming events will appear here once added in the CMS.'))
      );
    }

    if (type === 'story' || type === 'private-events') {
      return h('section', moduleProps(block, index, 'preview-section preview-split ' + (type === 'private-events' ? 'preview-dark' : '')),
        h('div', { className: 'preview-split-image', style: image ? { backgroundImage: 'url("' + image + '")' } : {} }, image && h('img', { src: image, alt: block.imageAlt || '', 'data-key-path': base + 'image' })),
        h('div', { className: 'preview-split-copy' }, sectionTitle(block, index),
          h('p', { className: 'preview-body', 'data-key-path': base + 'body' }, val(block.body, 'Add section copy in the editor.')),
          type === 'story' ? h('div', { className: 'preview-stat' }, h('strong', { 'data-key-path': base + 'statValue' }, val(block.statValue, '1971')), h('span', { 'data-key-path': base + 'statLabel' }, val(block.statLabel, 'THE YEAR IT ALL STARTED'))) : action(block.action && block.action.label, block.action && block.action.url)
        )
      );
    }

    if (type === 'community') {
      return h('section', moduleProps(block, index, 'preview-section preview-community'), sectionTitle(block, index), h('p', { className: 'preview-body', 'data-key-path': base + 'body' }, val(block.body, 'Add your community message.')), action(block.action && block.action.label, block.action && block.action.url, 'preview-text-link'));
    }

    if (type === 'logo-grid') {
      return h('section', moduleProps(block, index, 'preview-section preview-logo-grid'), sectionTitle(block, index), h('div', { className: 'preview-logo-grid' }, (block.logos || []).map(function (entry, logoIndex) {
        var src = imageUrl(entry.logo, getAsset);
        return h('div', { className: 'preview-logo-grid-item', key: logoIndex }, src ? h('img', { src: src, alt: entry.name || '', 'data-key-path': base + 'logos.' + logoIndex + '.logo' }) : val(entry.name, 'Partner logo'));
      })));
    }

    if (type === 'logo-ticker') {
      var logos = block.logos || [];
      return h('section', moduleProps(block, index, 'preview-ticker-section'),
        h('h2', { 'data-key-path': base + 'heading' }, val(block.heading, 'Community partners')),
        h('div', { className: 'preview-ticker', style: { '--ticker-time': (Number(block.durationSeconds) || 34) + 's' } },
          h('div', { className: 'preview-ticker-row' }, (logos.length ? logos.concat(logos) : [{ name: 'Uploaded partner logos appear here' }]).map(function (logo, logoIndex) {
            var src = imageUrl(logo.logo, getAsset);
            return h('div', { className: 'preview-logo', key: logoIndex }, src ? h('img', { src: src, alt: logo.altText || logo.name || '', 'data-key-path': base + 'logos.' + logoIndex + '.logo' }) : logo.name);
          }))
        ),
        h('small', null, (block.animation === false ? 'Static' : 'Scrolling') + ' · ' + val(block.effect, 'no') + ' effect · ' + (block.pauseOnHover === false ? 'continues on hover' : 'pauses on hover'))
      );
    }

    if (type === 'live-video') {
      if (block.enabled === false) return null;
      return h('section', moduleProps(block, index, 'preview-section preview-video'), h('div', { className: 'preview-section-heading' }, h('h2', { 'data-key-path': base + 'title' }, val(block.title, 'Live from the Lounge')), h('p', { className: 'preview-muted', 'data-key-path': base + 'caption' }, val(block.caption, 'Live video preview'))), h('div', { className: 'preview-video-frame', style: image ? { backgroundImage: 'linear-gradient(#17131555,#17131555),url("' + image + '")' } : {} }, h('span', null, '▶'), h('small', null, val(block.provider, 'LIVE VIDEO').toUpperCase() + ' EMBED')));
    }

    if (type === 'google-map') {
      if (block.enabled === false) return null;
      return h('section', moduleProps(block, index, 'preview-section preview-map'), h('div', null, sectionTitle(block, index), h('h3', { 'data-key-path': base + 'placeName' }, val(block.placeName, 'The MB Lounge')), h('p', { 'data-key-path': base + 'address' }, val(block.address, data.visit && data.visit.address)), action(block.directionsLabel || 'Get directions', '#', 'preview-button')), h('div', { className: 'preview-map-art' }, h('span', null, '⌖'), h('small', null, 'GOOGLE MAP PREVIEW')));
    }

    if (type === 'promo-banner') {
      return h('section', moduleProps(block, index, 'preview-promo', image ? { backgroundImage: 'linear-gradient(90deg,color-mix(in srgb,var(--preview-module-background,var(--preview-ink)) 95%,transparent),color-mix(in srgb,var(--preview-module-background,var(--preview-ink)) 60%,transparent)),url("' + image + '")' } : {}), h('p', { className: 'preview-eyebrow', 'data-key-path': base + 'eyebrow' }, val(block.eyebrow)), h('h2', null, val(block.heading, 'Make it a night')), h('p', null, val(block.body)), action(block.action && block.action.label, block.action && block.action.url));
    }

    if (type === 'rich-text') return h('section', moduleProps(block, index, 'preview-section preview-rich'), sectionTitle(block, index), h('p', null, val(block.body, 'Rich text content')));
    if (type === 'photo-gallery') return h('section', moduleProps(block, index, 'preview-section'), sectionTitle(block, index), h('div', { className: 'preview-gallery' }, (block.images || []).slice(0, 4).map(function (record, imageIndex) { var src = imageUrl(record.image, getAsset); return src && h('img', { key: imageIndex, src: src, alt: record.altText || '' }); })));
    return null;
  }

  var SitePreview = window.createClass({
    render: function () {
      var data = this.props.entry.get('data').toJS();
      var brand = data.brand || {};
      var typography = data.typography || {};
      var homepage = data.homepage || {};
      var sections = homepage.sections || [];
      var logo = imageUrl(brand.logo, this.props.getAsset);
      var rootStyle = {
        '--preview-ink': val(brand.primaryColor, '#211a1d'),
        '--preview-accent': val(brand.accentColor, '#ef8ab3'),
        '--preview-highlight': val(brand.highlightColor, '#ef9bbd'),
        '--preview-surface': val(brand.surfaceColor, '#f6f1eb'),
        '--preview-text': val(brand.textColor, '#211a1d'),
        '--preview-heading-font': '"' + val(typography.headingFont, 'Playfair Display') + '", Georgia, serif',
        '--preview-body-font': '"' + val(typography.bodyFont, 'DM Sans') + '", Arial, sans-serif'
      };
      return h('div', { className: 'mbl-preview', style: rootStyle },
        data.marketing && data.marketing.announcementEnabled && h('div', { className: 'preview-announcement', 'data-key-path': 'marketing.announcementText' }, '✦  ' + val(data.marketing.announcementText)),
        h('header', { className: 'preview-header' },
          logo ? h('img', { className: 'preview-brand-logo', src: logo, alt: data.siteName || 'MB Lounge', 'data-key-path': 'brand.logo' }) : h('strong', { className: 'preview-wordmark', 'data-key-path': 'siteName' }, val(data.siteName, 'The MB Lounge')),
          h('nav', null, (data.navigation || []).slice(0, 5).map(function (item, index) { return h('span', { key: index, 'data-key-path': 'navigation.' + index + '.label' }, item.label); })),
          h('span', { className: 'preview-nav-cta' }, 'PLAN YOUR VISIT ↗')
        ),
        h('main', null, sections.map(function (block, index) { return renderSection(block, index, data, this.props.getAsset); }, this),
          h('section', moduleProps(data.visit || {}, 'visit', 'preview-visit'), h('div', null, h('small', null, val(data.visit && data.visit.addressLabel, 'COME ON IN')), h('strong', null, val(data.visit && data.visit.address, '40 Grafton Street')), h('span', null, val(data.visit && data.visit.cityLine, 'Worcester, MA'))), h('div', null, h('small', null, val(data.visit && data.visit.hoursLabel, 'THE LIGHTS ARE ON')), h('strong', null, val(data.visit && data.visit.daysOpen, 'Wednesday – Saturday')), h('span', null, val(data.visit && data.visit.openHours, '7 PM – 2 AM'))), h('div', null, h('small', null, val(data.visit && data.visit.phoneLabel, 'SAY HELLO')), h('strong', null, val(data.visit && data.visit.phone, '508-799-4521'))))
        ),
        h('footer', { className: 'preview-footer' }, h('strong', null, val(data.siteName, 'The MB Lounge')), h('span', null, val(data.footer && data.footer.blurb, 'A neighborhood lounge for good nights and the people who make them.')), h('small', null, 'WORCESTER · MA · SINCE 1971'))
      );
    }
  });

  var EventsPreview = window.createClass({
    render: function () {
      var data = this.props.entry.get('data').toJS();
      var events = data.events || [];
      return h('div', { className: 'mbl-preview' },
        h('main', { className: 'preview-event-admin' },
          h('h1', null, 'Event card preview'),
          events.length ? events.map(function (event, index) {
            var style = {};
            if (event.backgroundColor) style.backgroundColor = event.backgroundColor;
            if (event.fontColor) { style.color = event.fontColor; style['--preview-event-color'] = event.fontColor; }
            var image = imageUrl(event.backgroundImage, this.props.getAsset);
            if (image) style.backgroundImage = 'linear-gradient(#17131599,#171315bb),url("' + image + '")';
            return h('article', { className: 'preview-event-card' + (event.featured ? ' preview-event-featured' : ''), key: index, style: style },
              h('span', { className: 'preview-event-date' }, event.startsAt || 'DATE'),
              h('small', null, val(event.eventType, 'SPECIAL EVENT')),
              h('h2', null, val(event.title, 'Event title')),
              h('p', null, val(event.summary, 'Event details will appear here.')),
              h('span', { className: 'preview-event-time' }, val(event.priceLabel, ''))
            );
          }, this) : h('p', null, 'Add an event to preview its homepage card.')
        )
      );
    }
  });

  window.CMS.registerPreviewTemplate('site', SitePreview);
  window.CMS.registerPreviewTemplate('events', EventsPreview);
})();
