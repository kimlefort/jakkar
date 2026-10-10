(() => {
  'use strict';
  const C = window.JAKKAR;
  if (!C) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const escape = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => /^(javascript|data|vbscript):/i.test(String(value).trim()) ? '' : escape(value);
  const demoKey='jakkar-demo-notice-seen-v2';
  let demoSeen=false;
  try{demoSeen=sessionStorage.getItem(demoKey)==='true';}catch{}
  if(!demoSeen){
    const dialog=document.createElement('dialog');
    dialog.className='demo-gate';
    dialog.setAttribute('aria-labelledby','demo-gate-title');
    dialog.setAttribute('aria-describedby','demo-gate-description');
    dialog.innerHTML=`
      <div class="demo-gate-topline">
        <span class="demo-studio"><i class="demo-studio-mark" aria-hidden="true"><b></b><b></b><b></b><b></b></i>laplace labs<span>.</span></span>
        <span class="demo-gate-topline-note">Prepared for Jakkar</span>
      </div>
      <div class="demo-gate-body">
        <span class="demo-gate-label">Jakkar website demo</span>
        <h2 id="demo-gate-title">This is a <em>demo.</em></h2>
        <p id="demo-gate-description" class="demo-gate-intro">A proposed website experience by Laplace Labs. Explore how Jakkar’s story, services, and four sites could come together online.</p>
        <div class="demo-gate-details">
          <h3>What to know before exploring</h3>
          <ul>
            <li>Photos and history are illustrative, not verified company records.</li>
            <li>Partner brands, job posts, and contact details are sample content.</li>
            <li>Inquiry forms are not connected to Jakkar’s inbox yet.</li>
          </ul>
        </div>
      </div>
      <div class="demo-gate-action">
        <button class="button" type="button" data-enter-demo>Explore the demo <span aria-hidden="true">↗</span></button>
        <span>A Laplace Labs presentation</span>
      </div>`;
    document.body.append(dialog);
    const enter=dialog.querySelector('[data-enter-demo]');
    const dismiss=()=>{try{sessionStorage.setItem(demoKey,'true');}catch{}dialog.close?.();dialog.remove();document.body.classList.remove('demo-is-open');};
    enter.addEventListener('click',dismiss);
    dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
    document.body.classList.add('demo-is-open');
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
    requestAnimationFrame(()=>enter.focus());
  }
  $$('[data-business]').forEach(el => { if(C.business[el.dataset.business]) el.textContent=C.business[el.dataset.business]; });
  $$('.brand').forEach(el => el.setAttribute('aria-label', C.business.name + (el.closest('header') ? ' home' : '')));
  const inquiryURL = (service = '', site = '') => {
    const params=new URLSearchParams();
    if(service)params.set('service',service);
    if(site)params.set('site',site);
    return `contact.html${params.size?'?'+params:''}#inquiry`;
  };
  const photo = key => {
    const image = C.images[key];
    return image ? `<img src="${safeURL(image.src)}" alt="${escape(image.alt)}" loading="lazy" decoding="async">` : '';
  };
  $$('[data-photo]').forEach(el => {
    el.innerHTML = photo(el.dataset.photo);
    if (el.hasAttribute('data-eager')) { const img = $('img',el); if(img){img.loading='eager';img.setAttribute('fetchpriority','high');} }
  });
  if (!C.preview) $$('[data-prototype],[data-preview-label]').forEach(el=>el.remove());
  if (!C.workflowPlaceholder) $$('[data-workflow-note]').forEach(el=>el.remove());
  const menu = $('.menu-toggle'), nav = $('#navigation');
  $$('.nav-inquiry,.mobile-direct-inquiry').forEach(link=>{link.href='contact.html#inquiry';if(link.classList.contains('mobile-direct-inquiry'))link.innerHTML='Start an inquiry <span aria-hidden="true">→</span>';else link.textContent='Start an inquiry';});
  menu?.addEventListener('click',()=> {const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus();}});
  $$('[data-footer-sites]').forEach(el=>el.innerHTML=C.sites.map(s=>`<a href="sites.html?site=${escape(s.id)}">${escape(s.name)}</a>`).join(''));
  $$('[data-categories]').forEach(el=>el.innerHTML=C.categories.map(c=>`<span>${escape(c)}</span>`).join('')+(C.categoriesPlaceholder?'<span class="note">Illustrative categories · range to be confirmed</span>':''));
  $$('[data-brand-note]').forEach(el=>el.textContent=C.brandsPlaceholder?'Brand placeholders · confirmed partners will replace these marks.':(C.brands.length?'':'Partner information will be added when available.'));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const carouselAutoplay=(root,rail,advance,delay)=>{
    let hover=false,focused=root.contains(document.activeElement),pressed=false,timer;
    const update=()=>{clearInterval(timer);if(!hover&&!focused&&!pressed&&!document.hidden&&!motion.matches&&rail.scrollWidth>rail.clientWidth+2)timer=setInterval(advance,delay);};
    root.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hover=true;update();}});root.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch'){hover=false;update();}});root.addEventListener('pointerdown',()=>{pressed=true;update();});const release=()=>{pressed=false;update();};document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);
    root.addEventListener('focusin',()=>{focused=true;update();});root.addEventListener('focusout',()=>{setTimeout(()=>{focused=root.contains(document.activeElement);update();},0);});document.addEventListener('visibilitychange',update);motion.addEventListener('change',update);window.addEventListener('resize',update);update();return update;
  };
  $$('[data-brands]').forEach(rail=>{
    rail.classList.add('brand-marquee','brand-inertial');const records=C.brands||[];
    const logo=b=>`<div class="brand-item">${b.logo?`<img src="${safeURL(b.logo)}" alt="${escape(b.name)}" loading="eager" decoding="async">`:escape(b.name)}</div>`;
    let hover=false,keyboardFocus=false,pressed=false,onscreen=true,offset=0,width=1,velocity=35,last=0,raf=0,track=null,railWidth=-1;
    const animate=time=>{raf=0;const dt=Math.min(.05,last?(time-last)/1000:0);last=time;const target=hover||keyboardFocus||pressed?0:35;velocity+=(target-velocity)*(1-Math.exp(-dt/.65));if(Math.abs(velocity-target)<.05)velocity=target;offset=(offset+velocity*dt)%width;if(track)track.style.transform=`translate3d(${-offset}px,0,0)`;if(target||velocity)raf=requestAnimationFrame(animate);};
    const wake=()=>{if(!records.length||document.hidden||!onscreen||motion.matches){cancelAnimationFrame(raf);raf=0;last=0;return;}if(!raf){last=0;raf=requestAnimationFrame(animate);}};
    const build=(force=false)=>{const measured=rail.clientWidth;if(!force&&Math.abs(measured-railWidth)<1)return;railWidth=measured;const copies=Math.max(1,Math.ceil(measured/Math.max(1,records.length*240))),originals=records.map(logo).join(''),extra=Array.from({length:copies-1},()=>`<div class="brand-extra" aria-hidden="true">${originals}</div>`).join('');rail.innerHTML=`<div class="brand-track"><div class="brand-group">${originals}${extra}</div><div class="brand-group brand-clone" aria-hidden="true">${originals}${extra}</div></div>`;track=$('.brand-track',rail);width=Math.max(1,$('.brand-group',rail).getBoundingClientRect().width);offset%=width;track.style.transform=motion.matches?'none':`translate3d(${-offset}px,0,0)`;wake();};
    rail.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){hover=true;wake();}});rail.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch'){hover=false;wake();}});rail.addEventListener('pointerdown',()=>{keyboardFocus=false;pressed=true;wake();});const release=()=>{pressed=false;wake();};document.addEventListener('pointerup',release);document.addEventListener('pointercancel',release);
    rail.addEventListener('keydown',()=>{keyboardFocus=true;wake();});rail.addEventListener('focusin',e=>{keyboardFocus=e.target.matches(':focus-visible');wake();});rail.addEventListener('focusout',()=>setTimeout(()=>{keyboardFocus=rail.contains(document.activeElement)&&document.activeElement.matches(':focus-visible');wake();},0));document.addEventListener('visibilitychange',wake);motion.addEventListener('change',()=>build(true));build(true);
    if('ResizeObserver'in window)new ResizeObserver(()=>build(false)).observe(rail);else window.addEventListener('resize',()=>build(false));if('IntersectionObserver'in window)new IntersectionObserver(entries=>{onscreen=entries[0].isIntersecting;wake();}).observe(rail);
  });
  $$('[data-products]').forEach(rail=>{
    const records=C.products||[];
    rail.innerHTML=records.map((p,i)=>`<article class="product-card" data-product-index="${i}"><img src="${safeURL(p.image)}" alt="${escape(p.alt)}" loading="lazy" decoding="async"><div><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p><a href="contact.html?service=${encodeURIComponent(p.service)}&product=${encodeURIComponent(p.title)}#inquiry">Discuss ${escape(p.title.toLowerCase())}</a></div></article>`).join('');
    const root=rail.closest('section'),prev=$('[data-product-prev]',root),next=$('[data-product-next]',root),position=$('[data-product-position]',root);let current=0,scrollTimer,programmaticUntil=0;
    const select=index=>{if(!records.length)return;programmaticUntil=performance.now()+700;current=(index+records.length)%records.length;const cards=$$('.product-card',rail),card=cards[current];cards.forEach((c,i)=>c.classList.toggle('selected',i===current));rail.scrollTo({left:card.offsetLeft-rail.offsetLeft,behavior:motion.matches?'auto':'smooth'});position.textContent=`${current+1} / ${records.length}`;};
    rail.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(performance.now()<programmaticUntil||rail.scrollWidth<=rail.clientWidth+2)return;const cards=$$('.product-card',rail);let nearest=0,distance=Infinity;cards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft-rail.offsetLeft-rail.scrollLeft);if(d<distance){distance=d;nearest=i;}});current=nearest;cards.forEach((c,i)=>c.classList.toggle('selected',i===current));position.textContent=`${current+1} / ${records.length}`;},140);});
    const update=carouselAutoplay(root,rail,()=>select(current+1),4800);
    prev?.addEventListener('click',()=>{select(current-1);update();});next?.addEventListener('click',()=>{select(current+1);update();});rail.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();select(e.key==='Home'?0:e.key==='End'?records.length-1:current+(e.key==='ArrowLeft'?-1:1));update();}});select(0);
  });
  $$('[data-service-cards]').forEach(el=>el.innerHTML=Object.entries(C.services).map(([id,s])=>`<article class="service-card"><h3>${escape(s.title)}</h3><p>${escape(s.description)}</p><a href="${inquiryURL(id)}">Discuss ${escape(s.title.toLowerCase())}</a></article>`).join(''));
  $$('[data-audiences]').forEach(el=>el.innerHTML=C.audiences.map(a=>`<span class="audience">${escape(a)}</span>`).join('')+(C.audiencesPlaceholder?'<span class="note">Proposed customer groups</span>':''));
  $$('[data-workflow]').forEach(el=>el.innerHTML=C.workflow.map(w=>`<li><h3>${escape(w.title)}</h3><p>${escape(w.text)}</p></li>`).join(''));
  $$('[data-history-compact]').forEach(el=>el.innerHTML=C.history.map(h=>`<div><time>${escape(h.date)}</time><br>${escape(h.title)}</div>`).join(''));
  $$('[data-history]').forEach(el=>el.innerHTML=C.history.map(h=>`<article><time>${escape(h.date)}</time><h3>${escape(h.title)}</h3><p>${escape(h.text)}</p></article>`).join(''));
  $$('[data-faqs]').forEach(el=>el.innerHTML=C.faqs.map(f=>`<details><summary>${escape(f.question)}</summary><p>${escape(f.answer)}</p></details>`).join(''));
  const query=new URLSearchParams(location.search);
  const bindTabs=(buttons,activate)=>{buttons.forEach((b,i)=>b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(i+1)%buttons.length;if(e.key==='ArrowLeft')next=(i-1+buttons.length)%buttons.length;if(e.key==='Home')next=0;if(e.key==='End')next=buttons.length-1;if(next!==undefined){e.preventDefault();activate(buttons[next]);buttons[next].focus();}}));};
  $$('[data-sites]').forEach((root,index)=>{
    const tabs=$('[data-site-tabs]',root),panel=$('[data-site-panel]',root),map=$('[data-site-map]',root);
    panel.id=`site-panel-${index}`;
    tabs.innerHTML=C.sites.map((s,i)=>`<button role="tab" id="site-tab-${index}-${escape(s.id)}" aria-controls="${panel.id}" aria-selected="false" tabindex="-1" data-city="${escape(s.id)}">${escape(s.name)}</button>`).join('');
    if(map)map.innerHTML=C.sites.map(s=>`<button class="site-map-marker marker-${escape(s.id)}" type="button" data-map-city="${escape(s.id)}" aria-pressed="false"><span aria-hidden="true"></span>${escape(s.name)}</button>`).join('');
    const buttons=$$('button',tabs);
    const markers=map?$$('[data-map-city]',map):[];
    const activate=button=>{const original=C.sites.find(x=>x.id===button.dataset.city),s={...original,image:document.body.dataset.page==='index'?(C.homeSites?.[original.id]||original.image):original.image};buttons.forEach(b=>{const active=b===button;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});markers.forEach(marker=>{const active=marker.dataset.mapCity===s.id;marker.setAttribute('aria-pressed',String(active));marker.classList.toggle('active',active);});panel.setAttribute('aria-labelledby',button.id);panel.innerHTML=`<div class="site-panel ${s.image?'':'no-image'}">${s.image?`<figure data-site-photo>${photo(s.image)}</figure>`:`<div class="city-number">${escape(s.name)}</div>`}<div><p class="eyebrow">${escape(s.label)}</p><h3>${escape(s.name)}</h3>${s.address?`<p class="site-fact">${escape(s.address)}</p>`:""}${s.contact?`<p class="site-fact">${escape(s.contact)}</p>`:""}${document.body.dataset.page==='index'?`<a class="text-link" href="sites.html?site=${escape(s.id)}">View site details</a>`:`<a class="button" href="${inquiryURL('',s.id)}">Start an inquiry for ${escape(s.name)}</a>`}</div></div>`;};
    buttons.forEach(b=>b.addEventListener('click',()=>activate(b)));bindTabs(buttons,activate);const selected=buttons.find(b=>b.dataset.city===query.get('site'))||buttons[0];if(selected)activate(selected);
    markers.forEach(marker=>marker.addEventListener('click',()=>{const button=buttons.find(b=>b.dataset.city===marker.dataset.mapCity);if(button)activate(button);}));
  });
  $$('[data-directory]').forEach(el=>el.innerHTML=C.sites.map(s=>`<article><h3>${escape(s.name)}</h3><p>${escape(s.label)}</p>${s.address?`<p>${escape(s.address)}</p>`:""}${s.contact?`<p>${escape(s.contact)}</p>`:""}<a href="${inquiryURL('',s.id)}">Inquire about ${escape(s.name)}</a></article>`).join(''));
  $$('[data-contact-cities]').forEach(el=>el.innerHTML=C.sites.map(s=>`<a class="contact-city" href="sites.html?site=${escape(s.id)}">${escape(s.name)}</a>`).join(''));
  $$('[data-contact-directory]').forEach(el=>el.innerHTML=C.sites.map(s=>`<article class="contact-site-card"><div><p class="eyebrow">${escape(s.label)}</p><h3>${escape(s.name)}</h3>${s.address?`<p>${escape(s.address)}</p>`:""}${s.contact?`<p>${escape(s.contact)}</p>`:""}</div><div class="contact-site-actions"><a href="sites.html?site=${escape(s.id)}">View site</a><a href="${inquiryURL('',s.id)}">Start an inquiry</a></div></article>`).join(''));
  const servicePanel=$('[data-service-panel]');
  if(servicePanel){const buttons=$$('[data-service]');const activate=b=>{const id=b.dataset.service,s=C.services[id];buttons.forEach(x=>{const active=x===b;x.setAttribute('aria-selected',String(active));x.tabIndex=active?0:-1;});servicePanel.setAttribute('aria-labelledby',b.id);const detail=C.serviceDetails[id];servicePanel.innerHTML=`<div class="service-workspace-panel"><figure class="service-workspace-image"><img src="${safeURL(detail.image)}" alt="${escape(detail.alt)}" loading="lazy" decoding="async"><figcaption>${escape(s.title)}</figcaption></figure><div class="service-workspace-copy"><p class="eyebrow">${escape(s.title)}</p><h2>${escape(detail.heading)}</h2>${detail.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}<a class="button" href="${inquiryURL(id)}">Discuss ${escape(s.title.toLowerCase())}</a></div><div class="service-support-points">${detail.points.map(p=>`<article><h3>${escape(p.title)}</h3><p>${escape(p.text)}</p></article>`).join('')}</div><div class="service-checklist"><h3>What to share</h3><ul class="checklist">${s.checklist.map(c=>`<li>${escape(c)}</li>`).join('')}</ul></div></div>`;};buttons.forEach(b=>b.addEventListener('click',()=>activate(b)));bindTabs(buttons,activate);$$('[data-service-jump]').forEach(link=>link.addEventListener('click',()=>activate(buttons.find(b=>b.dataset.service===link.dataset.serviceJump))));activate(buttons.find(b=>b.dataset.service===query.get('service'))||buttons[0]);}
  const jobs=$('[data-jobs]');
  if(jobs){const city=$('[data-job-city]'),department=$('[data-job-department]');city.innerHTML+=C.sites.map(s=>`<option value="${escape(s.id)}">${escape(s.name)}</option>`).join('');department.innerHTML+=[...new Set(C.jobs.map(j=>j.department))].map(d=>`<option>${escape(d)}</option>`).join('');const render=()=>{const shown=C.jobs.filter(j=>(!city.value||city.value===j.site)&&(!department.value||department.value===j.department));jobs.innerHTML=shown.map(j=>`<details class="job"><summary><span><h3>${escape(j.title)}</h3><span class="job-meta">${escape(C.sites.find(s=>s.id===j.site)?.name||j.site)} · ${escape(j.department)}</span></span></summary><p>${escape(j.description)}</p>${C.application.email?`<a class="text-link" href="mailto:${safeURL(C.application.email)}?subject=${encodeURIComponent('Application: '+j.title)}">Open application email</a>`:`<a class="text-link" href="contact.html?topic=careers&role=${encodeURIComponent(j.id)}&site=${encodeURIComponent(j.site)}">Discuss this role</a>`}</details>`).join('')||'<p style="padding:24px 0">No listings match these filters.</p>';$('[data-job-count]').textContent=`${shown.length} ${shown.length===1?'listing':'listings'} shown`;};city.addEventListener('change',render);department.addEventListener('change',render);$('[data-application-note]').textContent=C.application.note;render();}
  $$('[data-contact-email]').forEach(el=>{el.href='mailto:'+C.form.email;el.textContent=C.form.email;});
  $$('[data-careers-email]').forEach(el=>{el.href='mailto:'+C.application.email;el.textContent=C.application.email;});
  $$('[data-privacy]').forEach(el=>el.textContent=C.form.privacyNotice);
  const form=$('#inquiry-form');
  if(!form)return;
  const careerRole = query.get('topic')==='careers' ? C.jobs.find(j=>j.id===query.get('role')) : null;
  if(careerRole){ const heading=$('.compact-hero h1');heading.textContent='Let’s discuss your next chapter.';const legend=$('legend',form);legend.textContent='Career inquiry';const choices=$$('.choice-row label',form);choices.forEach(el=>el.hidden=true);const first=$('.choice-row label',form);first.hidden=false;first.lastChild.textContent=' Career inquiry';const business=form.elements.business;business.required=false;business.closest('label').firstChild.textContent='Current organization (optional)';}
  const storageKey=careerRole?'jakkar-career-draft-'+careerRole.id:'jakkar-inquiry-draft-v1';let draft={};
  try{draft=JSON.parse(sessionStorage.getItem(storageKey)||'{}');}catch{}
  const endpoint=C.form.endpoint.trim();
  const siteSelect=$('[data-site-options]',form);siteSelect.innerHTML+=C.sites.map(s=>`<option value="${escape(s.id)}">${escape(s.name)}</option>`).join('');
  const fields=$('[data-requirement-fields]'),stageOne=$('#stage-one'),stageTwo=$('#stage-two'),status=$('[data-form-status]');
  const service=()=>form.elements.service.value;
  const schemas={distribution:[['products','Products or brands','text'],['location','Business location','text']],trucking:[['cargo','Cargo and approximate quantity','text'],['pickup','Pickup point','text'],['destination','Destination','text']],partnership:[['products','Products or brands','text'],['location','Business location','text']]};
  if(careerRole) schemas.distribution=[['background','Your experience and background','text'],['location','Preferred location','text']];
  const save=()=>{for(const [key,value]of new FormData(form))draft[key]=value;try{sessionStorage.setItem(storageKey,JSON.stringify(draft));}catch{}};
  const restore=()=>{for(const [name,value]of Object.entries(draft)){const element=form.elements.namedItem(name);if(!element)continue;if(element instanceof RadioNodeList){element.value=value;}else element.value=value;}};
  const renderFields=()=>{fields.innerHTML=schemas[service()].map(([name,label,type])=>`<label>${label}<input name="${name}" type="${type}" required></label>`).join('');restore();};
  if(careerRole){draft.service='distribution';draft.site=careerRole.site;}
  if(query.get('service')&&schemas[query.get('service')])draft.service=query.get('service');else if(!schemas[draft.service])draft.service='distribution';if(C.sites.some(s=>s.id===query.get('site')))draft.site=query.get('site');restore();renderFields();if(query.get('product')&&form.elements.products){form.elements.products.value=query.get('product');save();}
  $$('input[name="service"]',form).forEach(r=>r.addEventListener('change',()=>{const chosen=r.value;save();draft.service=chosen;renderFields();}));
  form.addEventListener('input',save);form.addEventListener('change',save);
  const validate=root=>{for(const input of $$('input,select,textarea',root)){if(!input.checkValidity()){input.reportValidity();input.focus();return false;}}return true;};
  const summaryEntries=()=>[['Inquiry',careerRole?'Career inquiry: '+careerRole.title:(service()==='partnership'?'Business partnership':C.services[service()].title)],['Site',C.sites.find(s=>s.id===siteSelect.value)?.name||'No preference'],...schemas[service()].map(([key,label])=>[label,form.elements[key].value]),['Preferred timing',form.elements.timing.value],['Additional requirements',form.elements.requirements.value]].filter(([,value])=>value);
  const renderSummary=()=>{$('[data-summary]').innerHTML='<dl>'+summaryEntries().map(([key,value])=>`<dt>${escape(key)}</dt><dd>${escape(value)}</dd>`).join('')+'</dl>';};
  $('#continue-inquiry').addEventListener('click',()=>{if(!validate(stageOne))return;save();renderSummary();stageOne.hidden=true;stageTwo.hidden=false;$$('[data-progress]').forEach(el=>el.classList.toggle('active',el.dataset.progress==='2'));$('.form-title').focus();status.textContent='';});
  $('#back-inquiry').addEventListener('click',()=>{save();stageTwo.hidden=true;stageOne.hidden=false;$$('[data-progress]').forEach(el=>el.classList.toggle('active',el.dataset.progress==='1'));$('input[name="service"]:checked').focus();});
  $('#send-inquiry').textContent=endpoint?'Send inquiry':'Open email draft';
  const fullSummary=()=>`Jakkar ${careerRole?'career':'business'} inquiry\n\n${summaryEntries().map(([key,value])=>`${key}: ${value}`).join('\n')}\n\nContact\nName: ${form.elements.name.value}\nBusiness: ${form.elements.business.value}\nEmail: ${form.elements.email.value}\nPhone: ${form.elements.phone.value||'Not supplied'}\n\n`;
  form.addEventListener('submit',async e=>{e.preventDefault();if(!validate(stageTwo))return;save();status.classList.remove('error');const summary=fullSummary();if(!endpoint){status.textContent='Your email draft is ready. Review it in your email app before sending.';$('#preview-actions').hidden=false;$('#inquiry-preview').textContent=summary;const recipient=careerRole?C.application.email:C.form.email;const subject=careerRole?'Careers inquiry: '+careerRole.title:'Business inquiry: '+(service()==='partnership'?'Business partnership':C.services[service()].title);if(recipient)location.href='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(summary);return;}
    const button=$('#send-inquiry');button.disabled=true;status.textContent='Sending your inquiry…';try{const data=new FormData();data.append('summary',summary);for(const [k,v]of summaryEntries())data.append(k,v);['name','business','email','phone'].forEach(k=>data.append(k,form.elements[k].value));const response=await fetch(endpoint,{method:'POST',body:data,headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Delivery could not be confirmed.');status.textContent='Your inquiry was accepted by the receiving service. Keep a copy of your summary below.';$('#preview-actions').hidden=false;$('#inquiry-preview').textContent=summary;try{sessionStorage.removeItem(storageKey);}catch{}}catch{status.classList.add('error');status.textContent='We could not confirm delivery. Your details are preserved. You can copy or download your inquiry and try again.';$('#preview-actions').hidden=false;$('#inquiry-preview').textContent=summary;}finally{button.disabled=false;}});
  $('#copy-inquiry').addEventListener('click',async()=>{const text=$('#inquiry-preview').textContent;try{await navigator.clipboard.writeText(text);status.textContent='Summary copied. This action does not send an inquiry.';}catch{const range=document.createRange();range.selectNodeContents($('#inquiry-preview'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Select and copy the highlighted summary. This action does not send an inquiry.';}});
  $('#download-inquiry').addEventListener('click',()=>{const blob=new Blob([$('#inquiry-preview').textContent],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='jakkar-inquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();
