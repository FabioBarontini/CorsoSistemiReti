(() => {
  const cfg = window.ATLANTE_SUPABASE || {};
  const hasConfig = cfg.url && !cfg.url.includes('TUO-PROGETTO') && cfg.anonKey && !cfg.anonKey.includes('LA-TUA');
  let sb = null, user = null;
  let selectedText = '';
  const pageUrl = location.pathname.split('/').pop() || 'index.html';
  const pageTitle = document.title || pageUrl;

  function addEl(tag, cls, html='') { const e=document.createElement(tag); if(cls)e.className=cls; if(html)e.innerHTML=html; return e; }
  function safe(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

  async function init(){
    if(hasConfig && window.supabase){ sb=window.supabase.createClient(cfg.url,cfg.anonKey); const {data}=await sb.auth.getSession(); user=data.session?.user||null; sb.auth.onAuthStateChange((_e,session)=>{user=session?.user||null; renderUserBar();}); }
    injectUI();
    if(user){ await loadPageHighlights(); await recordVisit(); }
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
    if(user){ bar.innerHTML='<span>STUDIO</span><a href="studio.html">IL MIO ATLANTE</a><button id="study-note-btn">✎ NOTE</button><button id="study-bookmark-btn">🔖</button><button id="study-logout">ESCI</button>'; bar.querySelector('#study-note-btn').onclick=()=>openNote(); bar.querySelector('#study-bookmark-btn').onclick=()=>toggleBookmark(); bar.querySelector('#study-logout').onclick=logout; }
    else { bar.innerHTML='<a href="login.html">ACCEDI AL MIO ATLANTE</a>'; }
  }
  function positionSelectionBar(sel,el){ const r=sel.getRangeAt(0).getBoundingClientRect(); el.style.left=Math.max(8,r.left+window.scrollX)+'px'; el.style.top=Math.max(70,r.top+window.scrollY-52)+'px'; el.style.display='flex'; }
  function requireUser(){ if(!user){ location.href='login.html?next='+encodeURIComponent(location.href); return false;} return true; }

  async function highlight(color){
    if(!requireUser()||!selectedText)return; const {error}=await sb.from('highlights').insert({user_id:user.id,page_url:pageUrl,page_title:pageTitle,quote:selectedText,color});
    if(error) return alert(error.message); await loadPageHighlights(); hideSelect();
  }
  async function loadPageHighlights(){
    const {data,error}=await sb.from('highlights').select('*').eq('page_url',pageUrl).order('created_at'); if(error)return;
    for(const h of data||[]) applyQuote(h.quote,h.color,h.id);
  }
  function textRoot(){ return document.querySelector('main, article, .chapter, .content, .page') || document.body; }
  function applyQuote(quote,color,id){
    if(!quote || document.querySelector('[data-study-hl="'+id+'"]')) return;
    const root=textRoot(); const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{ if(!n.nodeValue.trim())return NodeFilter.FILTER_REJECT; if(n.parentElement.closest('script,style,nav,.nav,.study-userbar,.study-drawer,.study-selectbar,.study-highlight'))return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT; }});
    let nodes=[], all=''; while(walker.nextNode()){nodes.push(walker.currentNode);all+=walker.currentNode.nodeValue;}
    const idx=all.indexOf(quote); if(idx<0)return;
    let pos=0,startNode=null,endNode=null,startOffset=0,endOffset=0;
    for(const n of nodes){const next=pos+n.nodeValue.length; if(startNode===null && idx>=pos && idx<next){startNode=n;startOffset=idx-pos;} const endIdx=idx+quote.length; if(endIdx>pos && endIdx<=next){endNode=n;endOffset=endIdx-pos;break;} pos=next;}
    if(!startNode||!endNode)return;
    try{const range=document.createRange();range.setStart(startNode,startOffset);range.setEnd(endNode,endOffset);const mark=document.createElement('mark');mark.className='study-highlight study-highlight-'+color;mark.dataset.studyHl=id;mark.title='La tua sottolineatura';range.surroundContents(mark);mark.onclick=()=>deleteHighlight(id);}catch(e){}
  }
  async function deleteHighlight(id){ if(!confirm('Eliminare questa sottolineatura?'))return; await sb.from('highlights').delete().eq('id',id); location.reload(); }

  async function toggleBookmark(){
    if(!requireUser())return; const {data}=await sb.from('bookmarks').select('id').eq('user_id',user.id).eq('page_url',pageUrl).maybeSingle();
    if(data?.id){await sb.from('bookmarks').delete().eq('id',data.id); alert('Segnalibro rimosso.');}
    else {await sb.from('bookmarks').insert({user_id:user.id,page_url:pageUrl,page_title:pageTitle}); alert('Pagina salvata nei segnalibri.');}
  }
  function openNote(){
    if(!requireUser())return; ensureDrawer(); const d=document.getElementById('study-drawer'); d.classList.add('open'); document.getElementById('study-overlay').classList.add('open');
    document.getElementById('study-note-quote').value=selectedText||''; document.getElementById('study-note-title').value=''; document.getElementById('study-note-body').value='';
  }
  function ensureDrawer(){ if(document.getElementById('study-drawer'))return; const ov=addEl('div','study-overlay');ov.id='study-overlay';document.body.appendChild(ov);ov.onclick=closeDrawer; const d=addEl('aside','study-drawer');d.id='study-drawer';d.innerHTML='<button class="study-close">CHIUDI</button><h2>Nuova nota</h2><label>TITOLO</label><input id="study-note-title" placeholder="Es. Ricordare questo passaggio"><label>PASSAGGIO COLLEGATO</label><textarea id="study-note-quote" readonly></textarea><label>LA TUA NOTA</label><textarea id="study-note-body" placeholder="Scrivi qui..."></textarea><div class="study-actions"><button id="study-save-note">SALVA NOTA</button><button class="secondary study-close">ANNULLA</button></div><div class="study-status" id="study-note-status"></div>';document.body.appendChild(d);d.querySelectorAll('.study-close').forEach(b=>b.onclick=closeDrawer);d.querySelector('#study-save-note').onclick=saveNote; }
  function closeDrawer(){document.getElementById('study-drawer')?.classList.remove('open');document.getElementById('study-overlay')?.classList.remove('open');}
  async function saveNote(){const title=document.getElementById('study-note-title').value.trim();const body=document.getElementById('study-note-body').value.trim();const quote=document.getElementById('study-note-quote').value;if(!body)return;const {error}=await sb.from('notes').insert({user_id:user.id,page_url:pageUrl,page_title:pageTitle,title,body,quote});document.getElementById('study-note-status').textContent=error?error.message:'Nota salvata nel tuo Atlante.';if(!error)setTimeout(closeDrawer,700);}
  async function logout(){if(sb)await sb.auth.signOut(); location.href='index.html';}
  function hideSelect(){document.getElementById('study-selectbar').style.display='none';window.getSelection()?.removeAllRanges();selectedText='';}

  window.AtlasStudy={getUser:()=>user,openNote,closeDrawer};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
