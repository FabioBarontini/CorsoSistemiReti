/* Genera la presentazione leggendo i contenuti correnti della pagina.
   Non esiste un secondo testo da mantenere: modifiche a titoli, paragrafi, tabelle e link
   delle sezioni .chapter vengono raccolte automaticamente quando si preme il pulsante. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  function buildSlides(){
    const main = $('main') || $('article') || $('body');
    let sections = [];
    const hero = $('header.hero') || $('.hero') || $('body > header');
    if (hero) sections.push(hero);
    // Many Atlante pages use .chapter directly under body or inside wrappers, not inside <main>.
    sections.push(...$$('.chapter, .content-section, main > section, article > section', main));
    // Fallback for pages organized as generic sections/cards.
    if (!sections.length) {
      const candidates = $$('h1, h2, h3', main);
      const seen = new Set();
      candidates.forEach(h => {
        const block = h.closest('section, article, .card, .chapter, .panel') || h.parentElement;
        if (block && !seen.has(block) && !block.closest('#securityPresentationDeck')) { seen.add(block); sections.push(block); }
      });
    }
    if (!sections.length && main) sections = [main];
    return sections.map((section, i) => {
      const title = clean($('h2', section)?.textContent || $('h1', section)?.textContent || $('h3', section)?.textContent || document.title || `Sezione ${i+1}`);
      const eyebrow = clean($('.label', section)?.textContent || $('.kicker', section)?.textContent || $('.num', section)?.textContent || `SEZIONE ${String(i+1).padStart(2,'0')}`);
      const items = [];
      const nodes = $$('p, li, blockquote, table, .thesis, .quote, .study-callout, .panel, .deep-card', section);
      nodes.filter(el => !el.closest('nav, header nav, .snav, .security-navline, footer, #securityPresentationDeck') &&
        !nodes.some(other => other !== el && other.contains(el) && other.matches('.panel,.deep-card,.study-callout,.quote'))).forEach(el => {
        if (el.matches('table')) [...el.rows].forEach(row => { const t=clean(row.innerText || row.textContent); if(t)items.push({type:'text',text:t}); });
        else if (el.matches('.quote,.study-callout,.thesis,blockquote')) { const t=clean(el.innerText || el.textContent); if(t)items.push({type:'quote',text:t}); }
        else if (el.matches('.panel,.deep-card')) { const h=clean($('h3,h4,b,strong',el)?.textContent || ''); const t=clean(el.innerText || el.textContent); if(t)items.push({type:'card',title:h,text:t}); }
        else { const t=clean(el.innerText || el.textContent); if(t)items.push({type:'text',text:t}); }
      });
      const links = $$('a[href]', section).filter(a=>/^https?:/i.test(a.href) && !a.closest('nav')).map(a=>({text:clean(a.textContent)||a.href,href:a.href}));
      // Keep meaningful media and visual/animated learning elements with the slide.
      const visuals = [];
      $$('figure, .media, .scene, .hero-photo, .network, .packet-lab, .killchain, .flow, .timeline-sec, .diagram, .network-diagram, img[alt], picture, video, svg, canvas', section).forEach(el => {
        if (el.closest('nav, header nav, .snav, .security-navline, footer, #securityPresentationDeck')) return;
        if (visuals.some(v => v.contains(el) || el.contains(v))) return;
        if (el.matches('img') && !clean(el.getAttribute('alt')) && !el.closest('figure,.media')) return;
        const clone = el.cloneNode(true);
        clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
        clone.removeAttribute('id');
        visuals.push(clone);
      });
      return {title,eyebrow,items,links,visuals};
    }).filter(s => s.title && (s.items.length || s.links.length || s.visuals.length));
  }
  function addText(parent, tag, text, cls){ const el=document.createElement(tag); if(cls)el.className=cls;el.textContent=text;parent.appendChild(el);return el; }
  function openDeck(){
    let deck=$('#securityPresentationDeck'); if(deck){deck.remove();}
    const slides=buildSlides(); if(!slides.length){alert('Non trovo sezioni da inserire nella presentazione.');return;}
    deck=document.createElement('div');deck.id='securityPresentationDeck';deck.className='sp-deck';deck.setAttribute('role','dialog');deck.setAttribute('aria-modal','true');deck.setAttribute('aria-label','Presentazione generata dalla pagina');
    deck.innerHTML='<div class="sp-toolbar"><span class="sp-brand">ATLANTE DELLA RETE <i>· PRESENTAZIONE VIVA</i></span><div class="sp-tools"><button type="button" data-sp="print">STAMPA / PDF</button><button type="button" data-sp="close" aria-label="Chiudi presentazione">✕ CHIUDI</button></div></div><div class="sp-stage"><button type="button" class="sp-arrow sp-prev" aria-label="Slide precedente">←</button><article class="sp-slide"></article><button type="button" class="sp-arrow sp-next" aria-label="Slide successiva">→</button></div><div class="sp-footer"><span class="sp-count"></span><div class="sp-progress"><span></span></div><span class="sp-hint">← → PER NAVIGARE · ESC PER USCIRE</span></div>';
    document.body.appendChild(deck);
    let index=0; const slideEl=$('.sp-slide',deck);
    function render(){
      const s=slides[index]; slideEl.innerHTML=''; addText(slideEl,'div',s.eyebrow,'sp-eyebrow');addText(slideEl,'h1',s.title,'sp-title');
      const body=document.createElement('div');body.className='sp-content';
      s.items.forEach(item=>{ if(item.type==='quote')addText(body,'blockquote',item.text,'sp-quote'); else if(item.type==='card'){const card=document.createElement('div');card.className='sp-card';if(item.title)addText(card,'h3',item.title);addText(card,'p',item.text);body.appendChild(card);}else addText(body,'p',item.text); });
      if(s.visuals && s.visuals.length){
        const gallery=document.createElement('div');gallery.className='sp-visuals';
        s.visuals.forEach(node=>{const wrap=document.createElement('div');wrap.className='sp-visual';wrap.appendChild(node.cloneNode(true));gallery.appendChild(wrap);});
        body.appendChild(gallery);
      }
      if(s.links.length){const resources=document.createElement('div');resources.className='sp-resources';addText(resources,'div','FONTI E APPROFONDIMENTI','sp-resource-label');s.links.forEach(link=>{const a=document.createElement('a');a.href=link.href;a.target='_blank';a.rel='noopener';a.textContent=link.text+' ↗';resources.appendChild(a);});body.appendChild(resources);}
      slideEl.appendChild(body);$('.sp-count',deck).textContent=`SLIDE ${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;$('.sp-progress span',deck).style.width=`${(index+1)/slides.length*100}%`;
      $('.sp-prev',deck).disabled=index===0;$('.sp-next',deck).disabled=index===slides.length-1;
    }
    function move(d){index=Math.max(0,Math.min(slides.length-1,index+d));render();}
    $('.sp-prev',deck).onclick=()=>move(-1);$('.sp-next',deck).onclick=()=>move(1);
    $('[data-sp="close"]',deck).onclick=()=>{deck.remove();document.removeEventListener('keydown',keys);};
    $('[data-sp="print"]',deck).onclick=()=>window.print();
    function keys(e){if(!$('#securityPresentationDeck')){document.removeEventListener('keydown',keys);return;}if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1);if(e.key==='Escape'){$('[data-sp="close"]',deck).click();}}
    document.addEventListener('keydown',keys);render();
  }
  function init(){
    let btn = $('#generateSecurityPresentation');
    if (!btn) {
      btn = document.createElement('button'); btn.type='button'; btn.id='generateSecurityPresentation';
      btn.className='presentation-launch presentation-launch-fixed';
      btn.textContent='▶ GENERA PRESENTAZIONE DA QUESTA PAGINA';
      btn.setAttribute('aria-label','Genera una presentazione dal contenuto di questa pagina');
      document.body.appendChild(btn);
    } else btn.classList.add('presentation-launch-fixed');
    if (!btn.dataset.presentationBound) { btn.dataset.presentationBound='true'; btn.addEventListener('click',openDeck); }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
