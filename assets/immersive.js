(function(){
  const ambient=document.createElement('div'); ambient.className='ambient-grid'; document.body.appendChild(ambient);
  const vignette=document.createElement('div'); vignette.className='ambient-vignette'; document.body.appendChild(vignette);

  // A quiet moving constellation: decorative, not distracting.
  const canvas=document.createElement('canvas'); canvas.className='ambient-network';
  Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'-1',opacity:'.28'});
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d'); let pts=[];
  function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);pts=Array.from({length:18},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.08,vy:(Math.random()-.5)*.08}))}
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight); for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,1.2,0,Math.PI*2);ctx.fillStyle='rgba(143,197,206,.55)';ctx.fill()} for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){let a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<190){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(143,197,206,'+(0.10*(1-d/190))+')';ctx.stroke()}}requestAnimationFrame(draw)}
  addEventListener('resize',resize);resize();draw();

  // Archival side panels on narrative pages: they turn long text into a book-like visual rhythm.
  const story=document.querySelector('.story-content');
  if(story && !document.querySelector('.archive-strip')){
    const strip=document.createElement('section'); strip.className='archive-strip';
    const title=document.querySelector('.story-heading h1')?.textContent||document.title;
    const person=document.querySelector('.story-person')?.textContent||'';
    strip.innerHTML='<div class="archive-panel"><div class="label">DOCUMENTO / TRACCIA</div><h3>'+title+'</h3><p>Una pagina dell’Atlante non è soltanto una sequenza di fatti: è una traccia. Qui la storia viene letta come un percorso fatto di problemi, intuizioni, macchine e persone.</p><span class="archive-code">'+(person||'ATLANTE')+' · ARCHIVE</span></div><div class="archive-panel"><div class="label">LEGGI COME UN REPERTO</div><h3>Fermati sui passaggi.</h3><p>Le frasi isolate, i nomi e le date non sono decorazioni: sono punti di accesso alle pagine collegate dell’Atlante.</p><span class="archive-code">FOLLOW THE THREAD →</span></div></section>';
    story.insertBefore(strip,story.querySelector('.story-label')||story.firstChild);
  }

  // Page progress line.
  const progress=document.createElement('div'); progress.className='reading-progress'; Object.assign(progress.style,{position:'fixed',top:'0',left:'0',height:'2px',width:'0%',background:'linear-gradient(90deg,#8fc5ce,#d4ad72)',zIndex:'100'});document.body.appendChild(progress);
  addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h?scrollY/h*100:0)+'%'});
})();
