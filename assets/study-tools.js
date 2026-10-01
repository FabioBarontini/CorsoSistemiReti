(() => {
  const cfg = window.ATLANTE_SUPABASE || {};
  const hasConfig = cfg.url && !cfg.url.includes('TUO-PROGETTO') && cfg.anonKey && !cfg.anonKey.includes('LA-TUA');
  let sb = null, user = null;
  let selectedText = '';
  const pageUrl = location.pathname.split('/').pop() || 'index.html';
  const pageTitle = document.title || pageUrl;

  function addEl(tag, cls, html='') { const e=document.createElement(tag); if(cls)e.className=cls; if(html)e.innerHTML=html; return e; }
  function safe(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  const pageNotes = [];

  async function init(){
    if(hasConfig && window.supabase){ sb=window.supabase.createClient(cfg.url,cfg.anonKey); const {data}=await sb.auth.getSession(); user=data.session?.user||null; sb.auth.onAuthStateChange((_e,session)=>{user=session?.user||null; renderUserBar();}); }
    injectUI();
    if(user){ await loadPageHighlights(); await loadPageNotes(); await recordVisit(); setTimeout(focusAnnotationFromHash,120); }
  }


  async function recordVisit(){ try{ await sb.from('page_visits').upsert({user_id:user.id,page_url:pageUrl,page_title:pageTitle},{onConflict:'user_id,page_url'}); }catch(e){} }

  function injectUI(){
    const bar=addEl('div','study-userbar');
    bar.id='study-userbar'; document.body.appendChild(bar);
    const select=addEl('div','study-selectbar'); select.id='study-selectbar';
    select.innerHTML='<button class="yellow" title="Evidenzia giallo"></button><button class="blue" title="Evidenzia blu"></button><button class="green" title="Evidenzia verde"></button><button class="red" title="Evidenzia rosso"></button><button data-action="note" title="Nota">✎</button><button data-action="bookmark" title="Segnalibro">🔖</button>';
    document.body.appendChild(select);
    select.querySelector('.yellow').onclick=()=>highlight('yellow'); select.querySelector('.blue').onclick=()=>highlight('blue'); select.querySelector('.green').onclick=()=>highlight('green'); select.querySelector('.red').onclick=()=>highlight('red');
    select.querySelector('[data-action="note"]').onclick=()=>openNote(); select.querySelector('[data-action="bookmark"]').onclick=()=>toggleBookmark();
    document.addEventListener('selectionchange',()=>{ const s=window.getSelection(); const t=s?.toString().trim(); if(t && t.length>2){ selectedText=t; positionSelectionBar(s,select); } else { setTimeout(()=>select.style.display='none',250); }});
    renderUserBar();
  }
  function renderUserBar(){
    const bar=document.getElementById('study-userbar'); if(!bar)return;
    if(user){ bar.innerHTML='<span>STUDIO</span><a href="studio.html?from='+encodeURIComponent(location.href)+'">IL MIO ATLANTE</a><button id="study-note-btn">✎ NOTE</button><button id="study-bookmark-btn">🔖</button><button id="study-logout">ESCI</button>'; bar.querySelector('#study-note-btn').onclick=()=>openNote(); bar.querySelector('#study-bookmark-btn').onclick=()=>toggleBookmark(); bar.querySelector('#study-logout').onclick=logout; }
    else { bar.innerHTML='<a href="login.html?next='+encodeURIComponent('studio.html?from='+encodeURIComponent(location.href))+'">ACCEDI AL MIO ATLANTE</a>'; }
  }
  function positionSelectionBar(sel,el){ const r=sel.getRangeAt(0).getBoundingClientRect(); el.style.left=Math.max(8,r.left+window.scrollX)+'px'; el.style.top=Math.max(70,r.top+window.scrollY-52)+'px'; el.style.display='flex'; }
  function requireUser(){ if(!user){ location.href='login.html?next='+encodeURIComponent(location.href); return false;} return true; }

  async function highlight(color){
    if(!requireUser()||!selectedText)return; const {error}=await sb.from('highlights').insert({user_id:user.id,page_url:pageUrl,page_title:pageTitle,quote:selectedText,color});
    if(error) return alert(error.message); await loadPageHighlights(); hideSelect();
  }
  async function loadPageHighlights(){
    const {data,error}=await sb.from('highlights').select('*').eq('page_url',pageUrl).eq('user_id',user.id).order('created_at'); if(error)return;
    for(const h of data||[]) applyQuote(h.quote,h.color,h.id);
  }

  async function loadPageNotes(){
    pageNotes.length=0;
    const {data,error}=await sb.from('notes').select('*').eq('page_url',pageUrl).eq('user_id',user.id).order('created_at');
    if(error)return;
    (data||[]).forEach(n=>pageNotes.push(n));
    for(const n of pageNotes) applyNoteAnchor(n);
  }
  function textRoot(){ return document.querySelector('main, article, .chapter, .content, .page') || document.body; }
  function textNodes(root, includeMarks=false){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
      if(!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p=n.parentElement;
      if(p && p.closest('script,style,nav,.nav,.study-userbar,.study-drawer,.study-selectbar,.study-note-marker')) return NodeFilter.FILTER_REJECT;
      if(!includeMarks && p && p.closest('.study-highlight')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[]; let all=''; while(walker.nextNode()){nodes.push(walker.currentNode);all+=walker.currentNode.nodeValue;}
    return {nodes,all};
  }
  function findQuote(quote, includeMarks=false){
    if(!quote) return null;
    const {nodes,all}=textNodes(textRoot(),includeMarks);
    const idx=all.indexOf(quote); if(idx<0) return null;
    const endIdx=idx+quote.length; let pos=0, startNode=null,endNode=null,startOffset=0,endOffset=0;
    for(const n of nodes){
      const next=pos+n.nodeValue.length;
      if(!startNode && idx>=pos && idx<next){startNode=n;startOffset=idx-pos;}
      if(endIdx>pos && endIdx<=next){endNode=n;endOffset=endIdx-pos;break;}
      pos=next;
    }
    return startNode&&endNode ? {nodes,idx,startNode,endNode,startOffset,endOffset} : null;
  }
  function wrapQuote(quote,color,id){
    if(!quote || document.querySelector('[data-study-hl="'+id+'"]')) return false;
    const found=findQuote(quote,false); if(!found)return false;
    const {nodes,startNode,endNode,startOffset,endOffset}=found;
    const startIndex=nodes.indexOf(startNode), endIndex=nodes.indexOf(endNode);
    const parts=[];
    for(let i=startIndex;i<=endIndex;i++){
      const n=nodes[i];
      const from=n===startNode?startOffset:0;
      const to=n===endNode?endOffset:n.nodeValue.length;
      if(to>from) parts.push({n,from,to});
    }
    // Work backwards so splitting/wrapping does not invalidate the remaining nodes.
    for(let i=parts.length-1;i>=0;i--){
      const part=parts[i];
      try{
        const r=document.createRange(); r.setStart(part.n,part.from); r.setEnd(part.n,part.to);
        const mark=document.createElement('mark');
        mark.className='study-highlight study-highlight-'+(color||'yellow');
        mark.dataset.studyHl=id; mark.title='La tua sottolineatura';
        r.surroundContents(mark);
        mark.onclick=()=>deleteHighlight(id);
      }catch(e){ /* lascia il passaggio intatto se il DOM della pagina non consente il wrapping */ }
    }
    return !!document.querySelector('[data-study-hl="'+id+'"]');
  }
  function applyQuote(quote,color,id){ wrapQuote(quote,color,id); }

  function applyNoteAnchor(note){
    if(!note || !note.quote || document.querySelector('[data-study-note="'+note.id+'"]')) return;
    // Per trovare una nota possiamo attraversare anche il testo già evidenziato.
    const found=findQuote(note.quote,true); if(!found)return;
    const {endNode,endOffset}=found;
    try{
      const range=document.createRange(); range.setStart(endNode,endOffset); range.collapse(true);
      const marker=document.createElement('button'); marker.type='button'; marker.className='study-note-marker'; marker.dataset.studyNote=note.id; marker.textContent='✎'; marker.title=(note.title||'Nota')+' — apri nota';
      marker.setAttribute('aria-label','Apri nota: '+(note.title||'Nota')); marker.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();openSavedNote(note);};
      range.insertNode(marker);
    }catch(e){}
  }

  function focusAnnotationFromHash(){
    const hash=location.hash||''; if(!hash)return;
    const m=hash.match(/^#(note|highlight)=([^&]+)$/); if(!m)return;
    const type=m[1], id=decodeURIComponent(m[2]);
    let el=document.querySelector(type==='note'?'[data-study-note="'+CSS.escape(id)+'"]':'[data-study-hl="'+CSS.escape(id)+'"]');
    if(!el) return;
    el.classList.add('study-focus');
    el.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>el.classList.remove('study-focus'),2200);
    if(type==='note') setTimeout(()=>openSavedNote(pageNotes.find(n=>String(n.id)===String(id))),450);
  }

  function openSavedNote(note){
    ensureDrawer();
    const d=document.getElementById('study-drawer'); d.classList.add('open'); document.getElementById('study-overlay').classList.add('open');
    d.querySelector('h2').textContent=note.title||'Nota';
    document.getElementById('study-note-title').value=note.title||'';
    document.getElementById('study-note-quote').value=note.quote||'Nota sulla pagina';
    document.getElementById('study-note-body').value=note.body||'';
    document.getElementById('study-note-body').readOnly=true;
    document.getElementById('study-note-title').readOnly=true;
    document.getElementById('study-note-status').textContent='Nota collegata a questo passaggio.';
    document.getElementById('study-save-note').style.display='none';
  }

  async function deleteHighlight(id){ if(!confirm('Eliminare questa sottolineatura?'))return; await sb.from('highlights').delete().eq('id',id); location.reload(); }

  async function toggleBookmark(){
    if(!requireUser())return; const {data}=await sb.from('bookmarks').select('id').eq('user_id',user.id).eq('page_url',pageUrl).maybeSingle();
    if(data?.id){await sb.from('bookmarks').delete().eq('id',data.id); alert('Segnalibro rimosso.');}
    else {await sb.from('bookmarks').insert({user_id:user.id,page_url:pageUrl,page_title:pageTitle}); alert('Pagina salvata nei segnalibri.');}
  }
  function openNote(){
    if(!requireUser())return;
    if(!selectedText){ alert('Seleziona prima una frase del testo. La nota verrà fissata esattamente in quel punto.'); return; }
    ensureDrawer(); const d=document.getElementById('study-drawer'); d.classList.add('open'); document.getElementById('study-overlay').classList.add('open');
    d.querySelector('h2').textContent='Nuova nota';
    document.getElementById('study-note-quote').value=selectedText; document.getElementById('study-note-title').value=''; document.getElementById('study-note-body').value='';
    document.getElementById('study-note-body').readOnly=false; document.getElementById('study-note-title').readOnly=false; document.getElementById('study-save-note').style.display='inline-block';
  }
  function ensureDrawer(){ if(document.getElementById('study-drawer'))return; const ov=addEl('div','study-overlay');ov.id='study-overlay';document.body.appendChild(ov);ov.onclick=closeDrawer; const d=addEl('aside','study-drawer');d.id='study-drawer';d.innerHTML='<button class="study-close">CHIUDI</button><h2>Nuova nota</h2><label>TITOLO</label><input id="study-note-title" placeholder="Es. Ricordare questo passaggio"><label>PASSAGGIO COLLEGATO</label><textarea id="study-note-quote" readonly></textarea><label>LA TUA NOTA</label><textarea id="study-note-body" placeholder="Scrivi qui..."></textarea><div class="study-actions"><button id="study-save-note">SALVA NOTA</button><button class="secondary study-close">ANNULLA</button></div><div class="study-status" id="study-note-status"></div>';document.body.appendChild(d);d.querySelectorAll('.study-close').forEach(b=>b.onclick=closeDrawer);d.querySelector('#study-save-note').onclick=saveNote; }
  function closeDrawer(){document.getElementById('study-drawer')?.classList.remove('open');document.getElementById('study-overlay')?.classList.remove('open');}
  async function saveNote(){const title=document.getElementById('study-note-title').value.trim();const body=document.getElementById('study-note-body').value.trim();const quote=document.getElementById('study-note-quote').value;if(!body)return;const {data,error}=await sb.from('notes').insert({user_id:user.id,page_url:pageUrl,page_title:pageTitle,title,body,quote}).select().single();document.getElementById('study-note-status').textContent=error?error.message:'Nota salvata in questo punto della pagina.';if(!error){if(data){pageNotes.push(data);applyNoteAnchor(data);}setTimeout(closeDrawer,700);hideSelect();}}
  async function logout(){if(sb)await sb.auth.signOut(); location.href='index.html';}
  function hideSelect(){document.getElementById('study-selectbar').style.display='none';window.getSelection()?.removeAllRanges();selectedText='';}

  window.AtlasStudy={getUser:()=>user,openNote,closeDrawer};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
