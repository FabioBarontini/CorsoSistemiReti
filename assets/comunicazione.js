(function(){
const morse={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',' ':'/','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','0':'-----'};
function enc(s){return [...s.toUpperCase()].map(c=>morse[c]||'?').join(' ')}
const input=document.querySelector('#morseInput'), out=document.querySelector('#morseOutput'), disp=document.querySelector('#morseDisplay');
function refresh(){if(!input)return;let s=input.value||'CIAO';disp.textContent=enc(s);out.textContent='DECODIFICA VISIVA · '+s.toUpperCase()+' → '+enc(s)}
if(input){input.addEventListener('input',refresh);refresh}
function audioMorse(){if(!input)return;const ctx=new (window.AudioContext||window.webkitAudioContext)();let t=ctx.currentTime+0.05, unit=.075; for(const ch of enc(input.value||'CIAO')){if(ch==='.'){beep(t,unit);t+=unit*2}else if(ch==='-'){beep(t,unit*3);t+=unit*4}else if(ch===' '){t+=unit*2}else{t+=unit*5}} function beep(start,dur){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=650;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.12,start+.008);g.gain.exponentialRampToValueAtTime(.0001,start+dur-.01);o.connect(g).connect(ctx.destination);o.start(start);o.stop(start+dur)}}
document.querySelector('#morsePlay')?.addEventListener('click',audioMorse);
const canvas=document.querySelector('#waveCanvas'); if(canvas){const c=canvas.getContext('2d'); function draw(){const d=devicePixelRatio||1,w=canvas.clientWidth,h=canvas.clientHeight;canvas.width=w*d;canvas.height=h*d;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.strokeStyle='rgba(215,173,103,.18)';for(let y=20;y<h;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()} c.strokeStyle='#d7ad67';c.lineWidth=2;c.beginPath();for(let x=0;x<w;x++){let y=h/2+Math.sin(x*.055)*18+Math.sin(x*.012)*10;c.lineTo(x,y)}c.stroke()}draw();addEventListener('resize',draw)}
const tone=document.querySelector('#tone2600'); if(tone){tone.addEventListener('click',()=>{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=2600;g.gain.value=.035;o.connect(g).connect(ctx.destination);o.start();setTimeout(()=>{o.stop();ctx.close()},800);document.querySelector('#toneReadout').textContent='2600 Hz · 0,8 s · volume didattico ridotto'});}
const freqBtn=document.querySelector('#freqStart'); if(freqBtn){freqBtn.addEventListener('click',()=>{document.querySelector('.freq-meter')?.classList.toggle('active');freqBtn.textContent=document.querySelector('.freq-meter')?.classList.contains('active')?'FERMA ANALISI':'AVVIA ANALISI';});}
const circuitBtn=document.querySelector('#circuitBtn'), packetBtn=document.querySelector('#packetBtn'), circuitText=document.querySelector('#routeText');
function route(mode){document.querySelectorAll('.route').forEach(x=>x.classList.remove('active')); if(mode==='circuit'){document.querySelectorAll('.route.circuit').forEach(x=>x.classList.add('active')); if(circuitText)circuitText.textContent='Un percorso viene mantenuto per tutta la conversazione.'}else{document.querySelectorAll('.route.packet').forEach(x=>x.classList.add('active')); if(circuitText)circuitText.textContent='I pacchetti possono prendere percorsi differenti.'}}
circuitBtn?.addEventListener('click',()=>route('circuit'));packetBtn?.addEventListener('click',()=>route('packet'));
// Esperimento: circuito elettrico didattico
const electricToggle=document.querySelector('#electricToggle');
if(electricToggle){
  const box=document.querySelector('#electricDemo');
  const lamp=document.querySelector('#lampStatus');
  const text=document.querySelector('#electricText');
  electricToggle.addEventListener('click',function(){
    if(!box)return;
    const on=box.classList.toggle('electric-on');
    if(on){
      electricToggle.textContent='APRI IL CIRCUITO';
      if(lamp)lamp.textContent='LAMPADA · ACCESA';
      if(text)text.textContent='Il circuito è chiuso: la corrente può attraversare il percorso e produrre un effetto a distanza.';
    }else{
      electricToggle.textContent='CHIUDI IL CIRCUITO';
      if(lamp)lamp.textContent='LAMPADA · SPENTA';
      if(text)text.textContent='Il circuito è aperto. Il percorso è interrotto.';
    }
  });
}

// Simulazione modem: trasferimento concettuale, senza connessioni reali
const modemStart=document.querySelector('#modemStart');
modemStart?.addEventListener('click',()=>{
  const status=document.querySelector('#modemStatus');
  const screen=document.querySelector('#modemScreen');
  if(!status)return;
  status.textContent='01001000 → modulazione → ~~~ → linea telefonica → ~~~ → demodulazione → 01001000';
  screen?.classList.add('connected');
  setTimeout(()=>{ if(status)status.textContent='Trasmissione completata: i dati sono stati rappresentati come un segnale adatto al canale.'; },2200);
});

// Suono dimostrativo del modem, sintetizzato localmente
const modemSound=document.querySelector('#modemSound');
modemSound?.addEventListener('click',()=>{
  const ctx=new (window.AudioContext||window.webkitAudioContext)();
  const now=ctx.currentTime;
  const seq=[
    [440,.18],[620,.18],[920,.22],[1200,.15],[700,.20],[1600,.18],[980,.25],
    [520,.12],[1100,.16],[1800,.13],[760,.18],[1400,.22]
  ];
  let t=now+.05;
  seq.forEach(([f,d])=>{
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.035,t+.015);
    g.gain.exponentialRampToValueAtTime(.0001,t+d-.015);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+d); t+=d+.025;
  });
  setTimeout(()=>ctx.close(),(t-now+0.2)*1000);
});

})();

/* Additional immersive interactions */
(function(){
  const canvas=document.getElementById('voiceSignalCanvas');
  if(canvas){
    const ctx=canvas.getContext('2d'), amp=document.getElementById('voiceAmp'), freq=document.getElementById('voiceFreq'), play=document.getElementById('voicePlay');
    let raf=0, phase=0, audioCtx=null, osc=null, gain=null;
    function draw(){
      const dpr=window.devicePixelRatio||1, w=canvas.clientWidth, h=canvas.clientHeight;
      if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;}
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
      ctx.strokeStyle='#d7b46d';ctx.lineWidth=2;ctx.beginPath();
      const a=parseFloat(amp.value), f=parseFloat(freq.value);
      for(let x=0;x<w;x++){const y=h/2+Math.sin(x/w*Math.PI*2*f+phase)*a*h*.38; if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
      phase+=.025; raf=requestAnimationFrame(draw);
    }
    draw();
    play?.addEventListener('click',()=>{
      if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      if(osc){osc.stop();osc=null;play.textContent='ASCOLTA LA VOCE-SIMULAZIONE';return;}
      osc=audioCtx.createOscillator();gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=220+parseFloat(freq.value)*55;gain.gain.value=.035*parseFloat(amp.value);osc.connect(gain).connect(audioCtx.destination);osc.start();play.textContent='FERMA IL SUONO';setTimeout(()=>{if(osc){osc.stop();osc=null;play.textContent='ASCOLTA LA VOCE-SIMULAZIONE'}},1800);
    });
  }

  const options=[...document.querySelectorAll('#speedOptions button')], speedValue=document.getElementById('speedValue'), speedTime=document.getElementById('speedTime'), fill=document.getElementById('transferFill'), start=document.getElementById('startTransfer');
  if(options.length){let speed=56000;
    function fmt(sec){if(sec<60)return `circa ${Math.ceil(sec)} s`;const m=Math.floor(sec/60),s=Math.round(sec%60);return `circa ${m} min ${s} s`}
    function setSpeed(v){speed=Number(v);options.forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===speed));speedValue.textContent=(speed>=1000?(speed/1000)+' kbps':speed+' bps');speedTime.textContent=fmt((1024*1024*8)/speed)+' per 1 MB'}
    options.forEach(b=>b.addEventListener('click',()=>setSpeed(b.dataset.speed)));setSpeed(speed);
    start?.addEventListener('click',()=>{let t=0;const total=(1024*1024*8)/speed, startTime=performance.now();function tick(now){t=Math.min(1,(now-startTime)/(Math.max(700,total*12)));fill.style.width=(t*100)+'%';if(t<1)requestAnimationFrame(tick);else setTimeout(()=>fill.style.width='0%',500)}requestAnimationFrame(tick)});
  }
})();

/* Interazioni: telefonata vista dalla rete e tono storico del phreaking */
(function(){
  const flow=document.getElementById('callFlow'), btn=document.getElementById('callFlowStart'), status=document.getElementById('callFlowStatus');
  if(flow && btn){
    const steps=[...flow.querySelectorAll('.flow-step')];
    btn.addEventListener('click',()=>{
      steps.forEach(s=>s.classList.remove('active'));
      let i=0; status.textContent='La rete sta preparando la connessione...';
      const run=()=>{ if(i<steps.length){steps[i].classList.add('active'); status.textContent=steps[i].querySelector('span').textContent+' · '+steps[i].querySelector('small').textContent; i++; setTimeout(run,750);} else {status.textContent='Connessione stabilita: ora la voce può attraversare il circuito.';} };
      run();
    });
  }
  const freq=document.getElementById('phreakFreq'), read=document.getElementById('phreakReadout'), play=document.getElementById('phreakPlay');
  if(freq && read){
    const update=()=>{const v=Number(freq.value); read.textContent=`${v} Hz · ${v===2600?'frequenza storicamente associata alla segnalazione telefonica':'tono dimostrativo'}`;};
    freq.addEventListener('input',update); update();
    play?.addEventListener('click',()=>{
      const ctx=new (window.AudioContext||window.webkitAudioContext)(), o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.value=Number(freq.value); g.gain.value=.035; o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+1.2); setTimeout(()=>ctx.close(),1500);
    });
  }
})();
