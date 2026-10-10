(() => {
  const photos = (window.JAKKAR?.galleryPhotos || []).filter(p => p.src), grid = document.querySelector('[data-gallery-grid]');
  if (!grid) return;
  grid.replaceChildren();
  document.querySelector('[data-photo-count]').textContent = `${photos.length} photographs`;
  const dialog = document.createElement('dialog'); dialog.className = 'gallery-viewer';
  dialog.setAttribute('aria-label', 'Photo viewer');
  dialog.innerHTML = '<button class="button secondary" data-close aria-label="Close photo viewer">Close</button><figure><img alt=""><figcaption></figcaption></figure><nav aria-label="Photo navigation"><button class="button secondary" data-prev>Previous</button><span data-count aria-live="polite"></span><button class="button secondary" data-next>Next</button></nav>';
  document.body.append(dialog); let current = 0, trigger = null, overflow = '';
  const show = index => { current = (index + photos.length) % photos.length; const photo = photos[current]; dialog.querySelector('img').src = photo.src; dialog.querySelector('img').alt = photo.alt || 'Company story photograph'; dialog.querySelector('figcaption').textContent = photo.title || photo.alt || ''; dialog.querySelector('[data-count]').textContent = `${current + 1} / ${photos.length}`; };
  photos.forEach((photo, i) => { const figure = document.createElement('figure'), button = document.createElement('button'), image = document.createElement('img'), caption = document.createElement('figcaption'); button.type = 'button'; button.setAttribute('aria-label', `Open photo ${i + 1}: ${photo.alt || 'Company story'}`); image.src = photo.src; image.alt = photo.alt || ''; image.loading = 'lazy'; image.decoding = 'async'; caption.textContent = photo.title || photo.alt || ''; button.append(image); figure.append(button, caption); grid.append(figure); button.addEventListener('click', () => { trigger = button; show(i); overflow = document.body.style.overflow; dialog.showModal(); document.body.style.overflow = 'hidden'; dialog.querySelector('[data-close]').focus(); }); });
  dialog.querySelector('[data-prev]').addEventListener('click', () => show(current - 1)); dialog.querySelector('[data-next]').addEventListener('click', () => show(current + 1)); dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.style.overflow = overflow; trigger?.focus({ preventScroll: true }); });
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); } });
})();
