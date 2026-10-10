/* Dedicated SVG history controller. Static artwork is complete before enhancement.
   Fictional interim milestone dates are identified in content/site-content.js. */
(() => {
  'use strict';
  const section = document.querySelector('.jakkar-history'), object = document.getElementById('history-artwork');
  if (!section || !object) return;
  const records = window.JAKKAR?.historyJourney || [], motion = matchMedia('(prefers-reduced-motion: reduce)'), frame = section.querySelector('.history-frame'), editorial = section.querySelector('.history-memory'), year = section.querySelector('[data-history-year]'), caption = section.querySelector('[data-history-caption]'), restart = section.querySelector('[data-history-restart]'), buttons = [...section.querySelectorAll('[data-history-stop]')];
  const chronology = section.querySelector('[data-history-chronology]');
  const chapterMedia = matchMedia('(max-width:600px)');
  if (records.length) {
    chronology.replaceChildren(...records.map(record => {
      const li = document.createElement('li'), details = document.createElement('details'), summary = document.createElement('summary'), label = document.createElement('span'), heading = document.createElement('h3'), short = document.createElement('p'), content = document.createElement('div'), body = document.createElement('p'), expand = document.createElement('span');
      details.className = 'history-chapter'; details.open = !chapterMedia.matches; label.className = 'history-chapter-label'; label.textContent = record.label; heading.textContent = record.title; short.textContent = record.summary || record.caption; expand.className = 'chapter-expand'; expand.textContent = 'Read this chapter'; summary.append(label, heading, short, expand); content.className = 'chapter-content';
      if (record.image) { const image = document.createElement('img'); image.src = record.image; image.alt = record.alt || record.title; image.loading = 'lazy'; image.decoding = 'async'; content.append(image); } body.textContent = record.body || record.caption; content.append(body); details.append(summary, content); li.append(details); return li;
    }));
  }
  chapterMedia.addEventListener('change', () => chronology.querySelectorAll('details').forEach(detail => detail.open = !chapterMedia.matches));
  let flowRaf = 0, flowLast = 0, flowPaused = false, galleryOpen = false, flowWidth = 1200, sceneInvalid = true, layoutRevision = 0; const flowItems = [];
  const flowLayout = reset => {
    const width = photoField.clientWidth || 1200, height = photoField.clientHeight || 680, lanes = 5; flowWidth = width;
    const buckets = Array.from({ length: lanes }, () => []); flowItems.forEach(item => buckets[item.lane % lanes].push(item));
    buckets.forEach((items, lane) => { const laneSpeed = (finale?.laneSpeeds || [20, 24, 28, 24, 40])[lane] || 24, scale = Math.min(1, width / 1200), maxWidth = Math.max(235, ...items.map(item => (item.record.width || 235) * scale)), bound = maxWidth + 80, gap = Math.max(maxWidth + 110, (width + 2 * bound) / Math.max(1, items.length)), span = gap * items.length; items.forEach((item, i) => { item.speed = laneSpeed; item.width = item.kind === 'photo' ? (item.record.width || 180) * scale : Math.max(175, Math.min(235, width * .175)); item.height = item.kind === 'photo' ? (item.record.height || 135) * scale : 130; item.span = span; item.bound = bound; if (reset || item.x === undefined) item.x = ((width + 80 - i * gap + bound) % span + span) % span - bound; item.node.style.width = item.width + 'px'; if (item.kind === 'photo') item.plane.style.setProperty('--photo-height', item.height + 'px'); item.node.style.top = Math.max(12, Math.min(height - item.height - 12, [.025, .19, .38, .59, .79][lane] * height)) + 'px'; item.node.style.left = '0'; item.node.style.right = 'auto'; item.node.style.bottom = 'auto'; item.plane.style.transform = 'none'; }); });
  };
  const flowPaint = () => {
    if (!flowItems.length) return;
    const width = flowWidth, left = width * .28, right = width * .72;
    flowItems.forEach(item => {
      const x = item.x ?? 0, w = item.width || 160;
      let visibility;
      if (item.kind === 'photo') {
        // Fade only the portion entering/exiting the canvas; never suppress a whole photo at the logo.
        const feather = Math.min(100, w * .6);
        visibility = Math.max(0, Math.min(1, (width - x) / feather)) * Math.max(0, Math.min(1, (x + w) / feather));
      } else {
        const room = Math.max(24, left - w), feather = Math.min(110, room * .65), edgeFade = Math.min(70, room * .25);
        const center = x >= right ? Math.max(0, Math.min(1, (x - right) / feather)) : x + w <= left ? Math.max(0, Math.min(1, (left - x - w) / feather)) : 0;
        visibility = center * Math.max(0, Math.min(1, (width - x - w) / edgeFade)) * Math.max(0, Math.min(1, x / edgeFade));
      }
      const alpha = visibility * (item.reveal ?? 1);
      item.node.style.transform = `translate3d(${x}px,0,0)`;
      item.node.style.opacity = alpha;
      if (item.kind === 'quote') {
        const readable = alpha > .15;
        if (readable !== item.readable) { item.readable = readable; item.node.style.pointerEvents = readable ? 'auto' : 'none'; item.node.tabIndex = readable ? 0 : -1; }
      }
    });
  };
  const flowTick = time => { flowRaf = 0; const dt = Math.min(.05, flowLast ? (time - flowLast) / 1000 : 0); flowLast = time; flowItems.forEach(item => { item.x -= item.speed * dt; if (item.x < -item.bound) item.x += item.span; }); flowPaint(); flowRaf = requestAnimationFrame(flowTick); };
  const flowWake = () => { if (!flowItems.length || !enhanced || !completed || galleryOpen || flowPaused || document.hidden || !visible || motion.matches || innerWidth <= 900) { cancelAnimationFrame(flowRaf); flowRaf = 0; flowLast = 0; return; } if (!flowRaf) { flowLast = 0; flowRaf = requestAnimationFrame(flowTick); } };
  const finale = window.JAKKAR?.historyFinale, photoField = section.querySelector('[data-history-tribute-photos]'), voices = section.querySelector('[data-history-tribute-voices]');
  if (finale) {
    section.querySelector('[data-tribute-message]').setAttribute('aria-label', finale.message);[['number', finale.number], ['unit', finale.unit], ['phrase', finale.phrase], ['dates', finale.dates]].forEach(([key, text]) => section.querySelector('[data-tribute-' + key + ']').textContent = text);
    photoField.replaceChildren(...finale.photos.map((record, i) => { const figure = document.createElement('figure'); figure.className = 'tribute-photo stream-photo'; figure.style.setProperty('--float-duration', (record.duration || 18) + 's'); figure.style.setProperty('--float-delay', (record.delay || 0) + 's'); figure.style.setProperty('--float-depth', (record.depth ?? (-24 + i % 5 * 12)) + 'px'); const image = document.createElement('img'); image.src = record.src; image.alt = record.alt || ''; image.loading = 'eager'; image.decoding = 'async'; image.addEventListener('load', () => { if (image.decode) image.decode().catch(() => { }); }, { once: true }); const plane = document.createElement('div'); plane.className = 'tribute-float-plane'; if (record.src) plane.append(image); else plane.classList.add('photo-mat'); figure.append(plane); flowItems.push({ node: figure, plane, kind: 'photo', record, lane: record.lane ?? i % 5, speed: record.speed || 26 + i % 5 * 4, depth: record.depth ?? (-24 + i % 5 * 12) }); return figure; }));
    voices.replaceChildren(...finale.quotes.map((record, i) => { const quote = document.createElement('blockquote'), text = document.createElement('p'), role = document.createElement('footer'); text.textContent = '“' + record.text + '”'; role.textContent = record.role; quote.className = 'tribute-note stream-note'; quote.style.setProperty('--note-duration', (20 + i * 4) + 's'); quote.style.setProperty('--note-depth', (record.depth ?? (-15 + i % 3 * 15)) + 'px'); const plane = document.createElement('div'); plane.className = 'quote-float-plane'; plane.append(text, role); quote.append(plane); flowItems.push({ node: quote, plane, kind: 'quote', record, lane: record.lane ?? (i % 2 ? 3 : 1), speed: record.speed || 20 + i % 3 * 2, depth: record.depth ?? (-15 + i % 3 * 15) }); return quote; }));
  }
  const staticPhotos = section.querySelector('[data-history-static-photos]'); if (staticPhotos && finale) { const indexes = finale.staticPhotoIndexes || [0, 1, 2, 3, 4, 6]; staticPhotos.replaceChildren(...indexes.map(index => finale.photos[index]).filter(photo => photo?.src).map((record, i) => { const figure = document.createElement('figure'); figure.className = 'history-static-photo static-photo-' + (i + 1); const image = document.createElement('img'); image.src = record.src; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'; figure.append(image); return figure; })); }
  const pauseTribute = () => { const selection = window.getSelection(), reading = Boolean(selection?.toString() && section.contains(selection.anchorNode)); flowPaused = document.hidden || !visible || voices.contains(document.activeElement) || reading; section.classList.toggle('tribute-paused', flowPaused); flowWake(); };
  section.addEventListener('focusin', pauseTribute); section.addEventListener('focusout', () => setTimeout(pauseTribute, 0)); document.addEventListener('selectionchange', pauseTribute); document.addEventListener('visibilitychange', pauseTribute);
  const galleryButton = section.querySelector('[data-history-gallery]'), galleryRecords = (finale?.photos || []).filter(record => record.src);
  section.querySelectorAll('[data-history-city]').forEach(city => city.addEventListener('animationend', () => city.classList.remove('is-arriving')));
  let booting = true, initialized = false, enhanced = false, visible = true, raf = 0, start = 0, distance = 1, currentProgress = 0, restarting = false, restartTimer = null, run = 0, active = -1, render = null, completed = false, runCompleted = false;
  const clamp = value => Math.max(0, Math.min(1, value)), ramp = (p, a, b) => clamp((p - a) / (b - a)), ease = t => t * t * (3 - 2 * t), mix = (a, b, t) => a + (b - a) * t;
  const collapseFlow = change => {
    const beforeHeight = section.offsetHeight, beforeTop = frame.getBoundingClientRect().top, style = document.documentElement.style, oldAnchor = style.overflowAnchor, oldBehavior = style.scrollBehavior;
    style.overflowAnchor = 'none'; style.scrollBehavior = 'auto';
    change();
    const removed = Math.max(0, beforeHeight - section.offsetHeight), displacement = Math.max(0, beforeTop - frame.getBoundingClientRect().top), compensation = removed > 0 ? displacement : 0;
    if (compensation > 0) scrollTo({ top: Math.max(0, scrollY - compensation), behavior: 'auto' });
    requestAnimationFrame(() => { style.overflowAnchor = oldAnchor; style.scrollBehavior = oldBehavior; });
  };
  const measureRun = () => { const header = document.querySelector('.site-header').offsetHeight; frame.style.top = `${header}px`; start = section.getBoundingClientRect().top + scrollY - header; distance = Math.max(1, section.offsetHeight - frame.offsetHeight); };
  const finishRun = () => {
    if (completed || restarting || !enhanced) return;
    runCompleted = true; completed = true; currentProgress = 1; render(1); flowWake();
    collapseFlow(() => { section.classList.add('history-completed'); frame.style.top = ''; });
  };
  const draw = () => { raf = 0; if (!enhanced || !render) return; if (completed) { render(1); return; } if (restarting) { if (Math.abs(scrollY - start) < 4) { restarting = false; currentProgress = 0; clearTimeout(restartTimer); restartTimer = null; } else { render(0); return; } } currentProgress = Math.abs(scrollY - start) <= 2 ? 0 : distance - (scrollY - start) <= 2 ? 1 : clamp((scrollY - start) / distance); render(currentProgress); if (currentProgress >= 1) finishRun(); };
  const schedule = () => { if (enhanced && !completed && visible && !raf) raf = requestAnimationFrame(draw); };
  const setup = () => {
    if (booting && render) return;
    if (!render) { initialize(); return; } sceneInvalid = true; layoutRevision++;
    const scale = section.getBoundingClientRect().width / Math.max(1, section.offsetWidth), header = document.querySelector('.site-header').offsetHeight, eligible = innerWidth / scale > 900 && innerHeight / scale >= 700 && !motion.matches, wasRunning = enhanced && !completed, available = innerHeight / scale - header;
    section.style.setProperty('--history-height', `${available}px`); if (eligible) section.classList.add('history-interactive');
    const space = element => { const style = getComputedStyle(element); return element.offsetHeight + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0); }, frameStyle = getComputedStyle(frame), art = section.querySelector('.history-art'), artStyle = getComputedStyle(art);
    const overhead = [section.querySelector('.history-introduction'), section.querySelector('.history-site-legend'), section.querySelector('.history-progress-track'), section.querySelector('.history-navigation')].reduce((sum, element) => sum + space(element), 0) + (parseFloat(frameStyle.paddingTop) || 0) + (parseFloat(frameStyle.paddingBottom) || 0) + (parseFloat(artStyle.marginTop) || 0) + (parseFloat(artStyle.marginBottom) || 0);
    const canvas = Math.min(680, available - overhead); section.classList.toggle('history-compact-finale', eligible && canvas < 620); const statementHeight = section.querySelector('.history-tribute-statement').offsetHeight, logoHeight = Math.min(440, canvas - statementHeight - 32), nextEnhanced = eligible && canvas >= 480 && logoHeight >= 280; section.style.setProperty('--history-canvas-height', `${nextEnhanced ? canvas : 680}px`); section.style.setProperty('--final-logo-height', `${nextEnhanced ? logoHeight : 460}px`); section.classList.toggle('history-compact-finale', nextEnhanced && canvas < 620);
    enhanced = nextEnhanced; flowLayout(false); flowPaint();
    if (enhanced) { completed = runCompleted; section.classList.toggle('history-completed', runCompleted); section.classList.add('history-interactive'); if (completed) { section.classList.add('history-completed'); frame.style.top = ''; render(1); } else { measureRun(); draw(); } }
    else { clearTimeout(restartTimer); restartTimer = null; run++; restarting = false; completed = true; currentProgress = 1; const change = () => { section.classList.remove('history-interactive'); section.classList.add('history-completed'); frame.style.top = ''; render(1); }; if (wasRunning) collapseFlow(change); else change(); }
    flowWake();
  };
  const initialize = () => {
    if (initialized) return; let doc;
    try { doc = object.contentDocument || object.getSVGDocument?.(); } catch { return; }
    if (!doc?.documentElement || doc.readyState === 'loading' || doc.documentElement.localName !== 'svg' || !doc.getElementById('identity-root')) return;
    initialized = true;
    doc.documentElement.setAttribute('width', '100%'); doc.documentElement.setAttribute('height', '100%'); doc.documentElement.setAttribute('preserveAspectRatio', 'xMidYMid meet'); doc.documentElement.style.cssText = 'display:block;width:100%;height:100%;overflow:hidden';
    const root = doc.getElementById('identity-root'), top = doc.getElementById('identity-top'), back = doc.getElementById('identity-depth-back'), front = doc.getElementById('identity-depth-front');
    const parse = value => value.trim().split(/\s+/).map(pair => pair.split(',').map(Number));
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const buildings = [...doc.querySelectorAll('[data-building]')].map(group => ({ group, start: Number(group.dataset.buildStart), end: Number(group.dataset.buildEnd), mergeStart: Number(group.dataset.mergeStart), mergeEnd: Number(group.dataset.mergeEnd), details: group.querySelector('[data-details]'), pieces: [...group.querySelectorAll('[data-material]')].map(piece => ({ node: piece, source: parse(piece.dataset.source), target: parse(piece.dataset.target), color: rgb(piece.dataset.color), layer: Number(piece.dataset.material) })) }));
    let sceneProgress = -1, sceneState = "";
    render = progress => {
      const state = enhanced + ":" + completed + ":" + restarting + ":" + layoutRevision; if (!sceneInvalid && progress === sceneProgress && state === sceneState) return; sceneInvalid = false; sceneProgress = progress; sceneState = state;
      const turn = ease(ramp(progress, .90, 1)), matrix = [mix(1.65, 2.35, turn), mix(.72, 0, turn), mix(-1.65, 0, turn), mix(.72, 2.35, turn), mix(630, 333.275, turn), mix(175, 55.925, turn)];
      root.setAttribute('transform', `matrix(${matrix.join(' ')})`);
      const canonical = progress < .885 ? 1 - .82 * ramp(progress, .80, .855) : .18 + .82 * ramp(progress, .885, .94);
      top.setAttribute('opacity', canonical); const determinant = matrix[0] * matrix[3] - matrix[1] * matrix[2], depth = 20 * (1 - turn), depthX = -matrix[2] * depth / determinant, depthY = matrix[0] * depth / determinant; back.setAttribute('transform', `translate(${depthX} ${depthY})`); front.setAttribute('transform', `translate(${depthX / 2} ${depthY / 2})`); back.setAttribute('opacity', 1 - turn); front.setAttribute('opacity', 1 - turn);
      const project = ([x, y]) => [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
      buildings.forEach(building => {
        building.group.setAttribute('opacity', '1');
        building.pieces.forEach(piece => {
          const assembly = ease(ramp(progress, building.start + piece.layer * .018, building.end)), end = Math.min(.928, building.mergeEnd + piece.layer * .001), merge = ease(ramp(progress, building.mergeStart + piece.layer * .003, end)), handoff = ramp(progress, end, end + .010), lift = 18 * Math.sin(Math.PI * Math.min(1, merge * 3)) * (1 - merge);
          const points = piece.source.map((source, i) => { const destination = project(piece.target[i]); return [mix(source[0], destination[0], merge), mix(source[1] + (1 - assembly) * 24, destination[1], merge) - lift]; });
          piece.node.setAttribute('points', points.map(point => point.map(n => n.toFixed(2)).join(',')).join(' ')); piece.node.setAttribute('opacity', assembly * (1 - handoff));
          const color = piece.color.map((channel, i) => Math.round(mix(channel, 255, merge))); piece.node.setAttribute('fill', `rgb(${color.join(' ')})`); piece.node.setAttribute('stroke', merge > .7 ? '#FFFFFF' : '#45515E');
        });
        const detailsAmount = ramp(progress, building.start + .03, building.end) * (1 - ramp(progress, building.mergeStart, building.mergeStart + .035)); building.details.setAttribute('opacity', detailsAmount); building.details.setAttribute('transform', `translate(0 ${(1 - ramp(progress, building.start, building.end)) * 18})`); const entry = building.details.querySelector('[data-entry-truck]'); if (entry) { const arrived = ease(ramp(progress, building.start + .04, building.end)); entry.setAttribute('transform', `translate(${Number(entry.dataset.x) - (1 - arrived) * 24} ${entry.dataset.y})`); entry.setAttribute('opacity', ramp(progress, building.start + .04, building.start + .09)); }
      });
      const fit = ease(ramp(progress, .86, .98)); const canvasHeight = parseFloat(section.style.getPropertyValue('--history-canvas-height')) || 680, finalHeight = parseFloat(section.style.getPropertyValue('--final-logo-height')) || 460; section.style.setProperty('--history-scene-width', enhanced ? `${mix(63, 100, fit)}%` : '100%'); section.style.setProperty('--history-object-height', enhanced ? `${mix(canvasHeight, finalHeight, fit)}px` : `${finalHeight}px`); object.style.width = '100%'; object.style.height = '100%'; doc.documentElement.setAttribute('viewBox', `${mix(170, 0, fit)} ${mix(90, 0, fit)} ${mix(850, 1200, fit)} ${mix(430, 650, fit)}`); editorial.style.opacity = enhanced ? 1 - ramp(progress, .86, .95) : 0; section.style.setProperty('--history-progress', progress.toFixed(4)); restart.hidden = !enhanced || restarting || !completed; galleryButton.hidden = !completed || !galleryRecords.length; const reveal = ease(ramp(progress, .88, 1)); section.style.setProperty('--finale-reveal', reveal); section.querySelector('[data-history-tribute]').setAttribute('aria-hidden', progress < .90 ? 'true' : 'false'); flowItems.filter(item => item.kind === 'photo').forEach((item, i) => { const photo = item.node; const phase = i / Math.max(1, (finale?.photos.length || 1) - 1), amount = ease(ramp(progress, .88 + phase * .045, .95 + phase * .045)); item.reveal = amount; photo.style.filter = 'none'; }); flowItems.filter(item => item.kind === 'quote').forEach((item, i) => { const note = item.node; const phase = i / Math.max(1, (finale?.quotes.length || 1) - 1), amount = ease(ramp(progress, .902 + phase * .022, .974 + phase * .022)); item.reveal = amount; });[['number', .906, .970], ['unit', .916, .980], ['phrase', .924, .990], ['dates', .942, 1]].forEach(([part, from, to]) => section.querySelector('[data-tribute-' + part + ']').style.setProperty('--type-reveal', ease(ramp(progress, from, to)))); voices.inert = progress < .90; voices.style.pointerEvents = 'none'; voices.setAttribute('aria-hidden', progress < .90 ? 'true' : 'false'); flowPaint(); const cities = [...section.querySelectorAll('[data-history-city]')], cityStages = [.12, .32, .49, .66]; let currentCity = -1; cityStages.forEach((threshold, i) => { if (progress >= threshold) currentCity = i; }); cities.forEach((city, i) => { const wasHidden = city.hidden; city.hidden = enhanced && !completed && progress < cityStages[i]; if (enhanced && !completed && !motion.matches && wasHidden && !city.hidden) city.classList.add('is-arriving'); if (completed || !enhanced) city.classList.remove('is-arriving'); city.classList.toggle('is-current', enhanced && !completed && i === currentCity && progress < .8); });
      let index = 0; records.forEach((record, i) => { if (progress >= record.progress) index = i; }); if (index !== active) { active = index; const record = records[index]; year.textContent = record?.label || ''; caption.textContent = record?.body || record?.caption || ''; section.querySelector('[data-history-memory-title]').textContent = record?.title || ''; const photo = section.querySelector('[data-history-photo]'); photo.replaceChildren(); if (record?.image) { const image = document.createElement('img'); image.src = record.image; image.alt = record.alt || record.caption; image.decoding = 'async'; photo.append(image); } else { ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(corner => { const mount = document.createElement('span'); mount.className = 'memory-mount mount-' + corner; photo.append(mount); }); } buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === index))); }
    };
    Promise.all([document.fonts?.ready, document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => addEventListener('load', resolve, { once: true }))]).then(() => {
      booting = false; setup();
      // A new document starts a new run; browser pixel restoration cannot describe a collapsed timeline.
      const style = document.documentElement.style, previous = style.scrollBehavior; style.scrollBehavior = 'auto';
      if (location.hash === '#story') { if (enhanced) { measureRun(); scrollTo({ top: start, behavior: 'auto' }); currentProgress = 0; active = -1; sceneInvalid = true; render(0); } else section.scrollIntoView({ behavior: 'auto', block: 'start' }); } else scrollTo({ top: 0, behavior: 'auto' });
      requestAnimationFrame(() => { if (enhanced && !completed && location.hash === '#story') { measureRun(); scrollTo({ top: start, behavior: 'auto' }); currentProgress = 0; render(0); } style.scrollBehavior = previous; if (enhanced && !completed) draw(); }); pauseTribute();
    });
  };
  object.addEventListener('load', initialize); initialize();
  restart.addEventListener('click', () => {
    if (!enhanced) return;
    clearTimeout(restartTimer); const token = ++run; restarting = true;
    runCompleted = false; completed = false; section.classList.remove('history-completed'); section.classList.add('history-interactive'); measureRun();
    currentProgress = 0; active = -1; flowWake(); flowLayout(true); flowPaint(); render(0);
    scrollTo({ top: start, behavior: motion.matches ? 'auto' : 'smooth' });
    restartTimer = setTimeout(() => { if (enhanced && restarting && token === run) { const old = document.documentElement.style.scrollBehavior; document.documentElement.style.scrollBehavior = 'auto'; scrollTo({ top: start, behavior: 'auto' }); document.documentElement.style.scrollBehavior = old; restarting = false; currentProgress = 0; restartTimer = null; draw(); } }, 2600);
  });
  buttons.forEach((button, i) => button.addEventListener('click', () => { if (enhanced && !completed) scrollTo({ top: start + distance * (records[i]?.progress || 0) + (i > 0 ? 2 : 0), behavior: motion.matches ? 'auto' : 'smooth' }); else section.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' }); }));
  flowLayout(true); flowPaint(); if ('ResizeObserver' in window) new ResizeObserver(() => { flowLayout(false); flowPaint(); }).observe(photoField);
  addEventListener('pageshow', event => { if (event.persisted) { sceneInvalid = true; const resumeRestart = restarting; restarting = false; setup(); if (resumeRestart && enhanced) { const style = document.documentElement.style, previous = style.scrollBehavior; style.scrollBehavior = 'auto'; measureRun(); scrollTo({ top: start, behavior: 'auto' }); style.scrollBehavior = previous; currentProgress = 0; render(0); } pauseTribute(); schedule(); } }); addEventListener('pagehide', () => { clearTimeout(restartTimer); restartTimer = null; run++; cancelAnimationFrame(raf); raf = 0; cancelAnimationFrame(flowRaf); flowRaf = 0; flowLast = 0; });
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', setup); addEventListener('load', () => { initialize(); setup(); }, { once: true }); motion.addEventListener('change', setup); if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; pauseTribute(); if (visible) schedule(); }, { rootMargin: '0px' }).observe(section);
})();
