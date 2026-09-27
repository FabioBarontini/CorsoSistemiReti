
(function(){
"use strict";
const path=location.pathname.split("/").pop()||"index.html";
const links={
baran:["lezione-packet.html","lezione-arpanet.html"],
packet:["lezione-arpanet.html","lezione-taylor.html"],
taylor:["lezione-arpanet.html","lezione-lo.html"],
lo:["lezione-email.html","lezione-tcpip.html"],
email:["lezione-irc.html","lezione-modem.html"],
modem:["lezione-irc.html"],
irc:["lezione-http.html"],
tcpip:["lezione-dns.html","lezione-http.html"],
dns:["lezione-http.html"],
http:["lezione-web.html","lezione-rest.html"],
web:["lezione-mosaic.html","lezione-http.html"],
berners:["lezione-web.html","lezione-http.html"],
mosaic:["lezione-andreessen.html","timeline.html"]
};
function audioTone(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const c=new AC(), now=c.currentTime;
  const freqs=[350,700,420,900,520,1040,650,1200];
  freqs.forEach((f,i)=>{let o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,now+i*.13);g.gain.exponentialRampToValueAtTime(.12,now+i*.13+.03);g.gain.exponentialRampToValueAtTime(.0001,now+i*.13+.12);o.connect(g).connect(c.destination);o.start(now+i*.13);o.stop(now+i*.13+.13)});
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function section(k,title,lead,body){return `<section class="atlas-interactive"><div class="ix-kicker">${k}</div><h2>${title}</h2><p class="ix-lead">${lead}</p>${body}</section>`}
function inject(s){let m=document.querySelector("main");if(m)m.insertAdjacentHTML("beforeend",s);else document.body.insertAdjacentHTML("beforeend",s);}
function packet(){
 const body=`<div class="ix-panel"><div class="ix-net" id="ixNet"><div class="ix-net-status" id="ixNetStatus">RETE DISTRIBUITA · 5 NODI</div><svg viewBox="0 0 800 420"><g>${[[120,210,270,110],[120,210,270,310],[270,110,430,80],[270,110,430,210],[270,310,430,340],[270,310,430,210],[430,80,610,140],[430,210,610,140],[430,210,610,280],[430,340,610,280],[610,140,710,210],[610,280,710,210]].map(e=>`<line class="ix-edge" x1="${e[0]}" y1="${e[1]}" x2="${e[2]}" y2="${e[3]}"/>`).join("")}</g><g id="ixNodes">${[[120,210,"A"],[270,110,"B"],[270,310,"C"],[430,80,"D"],[430,210,"E"],[430,340,"F"],[610,140,"G"],[610,280,"H"],[710,210,"Z"]].map((n,i)=>`<circle class="ix-node" data-node="${i}" cx="${n[0]}" cy="${n[1]}" r="13"/><text x="${n[0]}" y="${n[1]+35}" text-anchor="middle" fill="#6f7b7d" font-size="11" font-family="DM Mono">${n[2]}</text>`).join("")}</g><g id="ixPackets"></g></svg></div><div class="ix-links"><button class="ix-btn" id="ixSend">INVIA 5 PACCHETTI</button><button class="ix-btn" id="ixFail">SPEGNI UN NODO</button><button class="ix-btn" id="ixReset">RIPRISTINA</button></div><div class="ix-caption" id="ixPacketCaption">Il nodo è caduto. Il messaggio no.</div></div>`;
 inject(section("ESPERIMENTO · BARAN","La rete che sopravvive","Non spieghiamolo soltanto. Proviamo a distruggere un pezzo della rete e osserviamo che cosa succede.",body));
 const send=document.getElementById("ixSend"),fail=document.getElementById("ixFail"),reset=document.getElementById("ixReset");
 let dead=false;
 fail.onclick=()=>{dead=true;document.querySelectorAll(".ix-node")[4].classList.add("dead");document.getElementById("ixNetStatus").textContent="NODO E · OFFLINE";document.getElementById("ixPacketCaption").textContent="Il nodo è caduto. Il messaggio no.";};
 reset.onclick=()=>{dead=false;document.querySelectorAll(".ix-node").forEach(n=>n.classList.remove("dead"));document.getElementById("ixNetStatus").textContent="RETE DISTRIBUITA · 5 NODI";};
 send.onclick=()=>{
  const g=document.getElementById("ixPackets");g.innerHTML="";
  for(let i=0;i<5;i++){let c=document.createElementNS("http://www.w3.org/2000/svg","circle");c.setAttribute("r",6);c.setAttribute("class","ix-packet");g.appendChild(c);let path=dead?[[120,210],[270,110],[430,80],[610,140],[710,210]]:[[120,210],[270,i%2?310:110],[430,i%3?210:80],[610,i%2?280:140],[710,210]]; let start=performance.now()+i*180,dur=1900+i*110; function a(t){let q=Math.min(1,Math.max(0,(t-start)/dur));let seg=(path.length-1)*q,j=Math.min(path.length-2,Math.floor(seg)),u=seg-j;c.setAttribute("cx",path[j][0]+(path[j+1][0]-path[j][0])*u);c.setAttribute("cy",path[j][1]+(path[j+1][1]-path[j][1])*u);if(q<1)requestAnimationFrame(a)}requestAnimationFrame(a)}
 };
}
function lo(){
 const body=`<div class="ix-panel"><div class="ix-terminal" id="ixTerm"><span id="ixOut">UCLA · TERMINAL<br><br>REMOTE HOST: SRI<br>READY<br><br>Premi L, poi O, poi G.<br><br>&gt; <span class="cursor"></span></span></div><div class="ix-keyboard">${["L","O","G","I","N"].map(k=>`<button class="ix-key" data-k="${k}">${k}</button>`).join("")}</div><div class="ix-big" id="ixLO" style="font-size:70px;display:none">LO</div></div>`;
 inject(section("29 OTTOBRE 1969 · UCLA → SRI","Il primo messaggio: LO","Lo studente non deve leggere l'aneddoto. Deve entrarci.",body));
 let typed="";document.querySelectorAll(".ix-key").forEach(b=>b.onclick=()=>{typed+=b.dataset.k;document.getElementById("ixOut").innerHTML="UCLA · TERMINAL<br><br>&gt; "+esc(typed)+"<span class='cursor'></span>";if(typed==="LOG"){setTimeout(()=>{document.getElementById("ixOut").innerHTML="SYSTEM FAILURE<br><br>CONNECTION LOST";document.getElementById("ixLO").style.display="block";},350)}})
}
function taylor(){
 const body=`<div class="ix-panel"><div class="ix-grid"><div class="ix-terminal" id="ixTaylor"><b>BOB TAYLOR · OFFICE</b><br><br><button class="ix-btn" data-t="SAGE">SAGE</button> <button class="ix-btn" data-t="TX-2">TX-2</button> <button class="ix-btn" data-t="AN/FSQ">AN/FSQ</button><br><br><span id="ixTaylorOut">Tre terminali.<br>Tre mondi.</span></div><div class="ix-terminal"><div style="font-size:28px;color:#c9a36b">?</div><br><span style="color:#d9d5ca">Perché devo avere tre terminali?</span><br><br><span style="color:#667276">Una quarta icona aspetta.</span><br><br><button class="ix-btn" id="ixNetwork">NETWORK</button></div></div></div>`;
 inject(section("1966 · IPTO","L'ufficio di Bob Taylor","Tre terminali. Tre macchine. Tre mondi. Poi arriva una domanda che cambia la storia.",body));
 document.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>document.getElementById("ixTaylorOut").innerHTML=`CONNECTED · ${b.dataset.t}<br><br>CHANGE TERMINAL<br>LOGIN<br>PASSWORD<br><br><span style="color:#c9a36b">Perché devo cambiare macchina?</span>`);
 document.getElementById("ixNetwork").onclick=()=>document.getElementById("ixTaylorOut").innerHTML="<span style='color:#c9a36b'>NETWORK</span><br><br>Un solo punto di accesso.<br>Molte macchine.<br>Una rete.";
}
function email(){
 const body=`<div class="ix-grid"><div class="ix-panel"><div class="ix-mail">YOU HAVE MAIL<br><br><span class="ix-at">@</span><br><br><b>RAY</b> <span style="color:#c9a36b">@</span> <b>BBN</b><br><br>Un piccolo simbolo separa due mondi.</div><div class="ix-panel"><div class="ix-kicker">COMPOSI L'INDIRIZZO</div><h3 style="color:#eee">persona → @ → computer</h3><input id="ixEmailInput" value="" placeholder="tomlinson@bbn" style="width:100%;padding:14px;background:#050707;border:1px solid #ffffff18;color:#c9a36b;font:14px 'DM Mono'"><p id="ixEmailMsg" class="ix-caption">La @ è il ponte.</p></div></div><div class="ix-panel"><div class="ix-mail" id="ixTimeMail">1971 · YOU HAVE MAIL</div><button class="ix-btn" id="ixTime">ATTRAVERSA IL TEMPO → 2026</button></div>`;
 inject(section("1971 · RAY TOMLINSON","La nascita della @","Un simbolo già presente sulla tastiera diventa una grammatica per la comunicazione in rete.",body));
 document.getElementById("ixEmailInput").oninput=e=>{document.getElementById("ixEmailMsg").textContent=e.target.value.includes("@")?"RAY → @ → BBN · indirizzo completo":"Manca il ponte: @"};
 document.getElementById("ixTime").onclick=()=>{let x=document.getElementById("ixTimeMail");x.innerHTML="1971 → ··· → 1980 → ··· → 1995 → ··· → 2026<br><br><b>YOU HAVE MAIL</b><br><br>La macchina del tempo è un messaggio che continua a viaggiare.";};
}
function modem(){
 const body=`<div class="ix-panel"><div class="ix-modem"><div class="ix-display" id="ixModemDisplay">READY</div><div class="ix-wave"></div><button class="ix-btn" id="ixDial">DIAL</button> <button class="ix-btn" data-speed="2400">2400</button> <button class="ix-btn" data-speed="14400">14.4K</button> <button class="ix-btn" data-speed="28800">28.8K</button> <button class="ix-btn" data-speed="56000">56K</button><div class="ix-caption" id="ixSpeed">VELOCITÀ · 14.4 kbps</div></div></div>`;
 inject(section("MODEM · ANNI NOVANTA","La rete attraversa il telefono","Il suono non è decorazione: è il momento in cui due modem si riconoscono.",body));
 document.getElementById("ixDial").onclick=()=>{audioTone();let d=document.getElementById("ixModemDisplay");["DIALING...","RING","HANDSHAKE","CONNECTING","CONNECTED"].forEach((s,i)=>setTimeout(()=>d.textContent=s,i*550));};
 document.querySelectorAll("[data-speed]").forEach(b=>b.onclick=()=>{document.getElementById("ixSpeed").textContent="VELOCITÀ · "+b.dataset.speed+" bps";});
}
function irc(){
 const body=`<div class="ix-grid"><div class="ix-chat" id="ixChat"><span class="dim">*** Connecting to irc.example · 1993</span><br><span class="dim">*** Now entering #baghdad</span><br><br><span class="user">&lt;alice&gt;</span> anyone here?<br><span class="user">&lt;nero&gt;</span> yes.<br><span class="user">&lt;alex&gt;</span> 7 users here.<br><span class="user">&lt;you&gt;</span> <span class="cursor"></span></div><div class="ix-panel"><div class="ix-kicker">CANALE</div><h3 style="color:#eee">#baghdad</h3><button class="ix-btn" id="ixJoin">ENTRA NEL CANALE</button><p id="ixUsers" class="ix-caption">7 USERS · 3 CONTINENTS</p><div style="height:110px;margin-top:18px;background:radial-gradient(circle,#c9a36b55 1px,transparent 2px);background-size:24px 24px"></div></div></div>`;
 inject(section("IRC · 1988–1993","Una chat prima delle chat","Niente emoji. Niente feed. Solo testo, canali e persone che entrano da luoghi lontanissimi.",body));
 document.getElementById("ixJoin").onclick=()=>{document.getElementById("ixChat").innerHTML+="<br><span class='dim'>*** You have joined #baghdad</span><br><span class='user'>&lt;you&gt;</span> hello from 2026";};
}
function http(){
 const body=`<div class="ix-panel"><div class="ix-browser"><div class="ix-browser-bar"><span class="ix-browser-dot"></span><span class="ix-browser-dot"></span><span class="ix-browser-dot"></span><div class="ix-url">https://example.com</div></div><div class="ix-browser-body" id="ixBrowserBody"><b>Una pagina vuota.</b><br>Premi INVIO per vedere che cosa accade prima che appaia il Web.</div></div><button class="ix-btn" id="ixHttpGo" style="margin-top:15px">INVIO</button><div class="ix-http-log" id="ixHttpLog">READY</div></div>`;
 inject(section("HTTP · 1990+","Finalmente vedere cosa succede davvero","Prima della pagina arrivano nomi, connessioni, richieste e risposte.",body));
 document.getElementById("ixHttpGo").onclick=()=>{let log=document.getElementById("ixHttpLog"),body=document.getElementById("ixBrowserBody");["DNS","TCP","TLS","GET / HTTP/1.1","Host: example.com","HTTP/1.1 200 OK"].forEach((x,i)=>setTimeout(()=>{log.innerHTML+=`<br>${x}`;},i*450));setTimeout(()=>body.innerHTML="<h2 style='margin-top:0'>EXAMPLE</h2><p>La pagina appare soltanto dopo che la rete ha fatto tutto questo lavoro.</p>",3000)};
}
function tcpip(){
 const body=`<div class="ix-panel"><div class="ix-flow" id="ixProtoFlow">${["Application","TCP","IP","Ethernet / Wi-Fi"].map((x,i)=>`<div class="ix-box" data-i="${i}">${x}<br><small>${["Ho un messaggio.","Lo divido e controllo.","Io penso alla strada.","Io lo porto sul collegamento."][i]}</small></div>${i<3?'<span class="ix-arrow">↓</span>':''}`).join("")}</div><button class="ix-btn" id="ixProto">INCAPSULA → INVIA</button></div>`;
 inject(section("TCP/IP","Il dialogo tra protocolli","Invece di una pila immobile, facciamo parlare i livelli.",body));
 document.getElementById("ixProto").onclick=()=>{document.querySelectorAll("#ixProtoFlow .ix-box").forEach((b,i)=>setTimeout(()=>b.classList.add("active"),i*500));};
}
function dns(){
 const body=`<div class="ix-panel"><input id="ixDnsInput" value="www.example.com" style="width:100%;padding:14px;background:#050707;border:1px solid #ffffff18;color:#c9a36b;font:14px 'DM Mono'"><button class="ix-btn" id="ixDnsGo" style="margin-top:12px">RISOLVI</button><div class="ix-flow" id="ixDnsFlow">${["Browser","DNS Resolver","Root",".com","Authoritative Server","93.184.216.34"].map((x,i)=>`<div class="ix-box" data-i="${i}">${x}</div>${i<5?'<span class="ix-arrow">→</span>':''}`).join("")}</div><p id="ixDnsMsg" class="ix-caption">Non conosco questo nome.</p></div>`;
 inject(section("DNS","Il telefono della rete","Scriviamo un nome umano. La rete deve trasformarlo in un indirizzo.",body));
 document.getElementById("ixDnsGo").onclick=()=>{document.querySelectorAll("#ixDnsFlow .ix-box").forEach((b,i)=>setTimeout(()=>b.classList.add("active"),i*400));setTimeout(()=>document.getElementById("ixDnsMsg").textContent="Ora so dove andare.",2600)};
}
function web(){
 const body=`<div class="ix-panel"><div class="ix-canvas" id="ixWebCanvas"></div><p class="ix-caption">ARPANET collegava macchine. Il Web collega documenti.</p></div>`;
 inject(section("WEB · TIM BERNERS-LEE","Il Web come ragnatela","Clicca i documenti. Una pagina conduce a un'altra, poi a un'altra ancora.",body));
 const c=document.getElementById("ixWebCanvas"), docs=[["DOCUMENT A",15,38],["DOCUMENT B",45,18],["DOCUMENT C",70,42],["DOCUMENT D",44,68],["DOCUMENT E",76,72]];
 docs.forEach((d,i)=>{let el=document.createElement("div");el.className="ix-webdoc";el.textContent=d[0];el.style.left=d[1]+"%";el.style.top=d[2]+"%";el.onclick=()=>el.style.borderColor="#c9a36b";c.appendChild(el)});
 setTimeout(()=>{let els=[...c.children];for(let i=0;i<els.length-1;i++){let l=document.createElement("div");l.className="ix-webline";l.style.left="20%";l.style.top=(35+i*7)+"%";l.style.width="55%";l.style.transform=`rotate(${[-10,8,14,-6][i%4]}deg)`;c.appendChild(l)}},100);
}
function cern(){
 const body=`<div class="ix-cern"><div style="font:11px 'DM Mono';color:#818b8d">CERN · SERVER ROOM · 1989–1990</div><div class="ix-hotspot" style="left:24%;top:40%"></div><div class="ix-hotspot-label" style="left:27%;top:34%">NeXT Computer · la macchina di Berners-Lee</div><div class="ix-hotspot" style="left:62%;top:30%"></div><div class="ix-hotspot-label" style="left:65%;top:24%">Monitor / browser</div><div class="ix-hotspot" style="left:70%;top:67%"></div><div class="ix-hotspot-label" style="left:73%;top:61%">Server · informazioni</div><div style="position:absolute;left:10%;right:10%;bottom:35px;height:110px;border:1px solid #c9a36b22;background:linear-gradient(90deg,#161b1d,#0b0f11);box-shadow:0 25px 40px #0009"></div></div>`;
 inject(section("CERN","La macchina di Berners-Lee","Una fotografia può diventare una scena esplorabile: clicca i punti e scopri cosa c'era dietro l'inizio del Web.",body));
}
function mosaic(){
 const body=`<div class="ix-panel"><div class="ix-mosaic"><div class="ix-mosaic-side ix-before"><h3>PRIMA</h3>TESTO<br>TESTO<br><u>LINK</u><br>TESTO<br>TESTO</div><div class="ix-mosaic-side ix-after"><h3>DOPO · MOSAIC</h3><div style="font-size:34px">◈ ◇ ◎</div><h2 style="margin:15px 0">La pagina prende forma.</h2><p>Immagini + testo + link.</p></div></div><input id="ixMosaicSlider" type="range" min="0" max="100" value="50" style="margin-top:18px"></div>`;
 inject(section("1993 · MOSAIC","Prima e dopo","Trascina la linea: il Web grafico non cambia soltanto l'aspetto delle pagine. Cambia chi può entrarci.",body));
 const s=document.getElementById("ixMosaicSlider"),pane=document.querySelector(".ix-mosaic .ix-after");s.oninput=()=>pane.style.clipPath=`inset(0 ${100-s.value}% 0 0)`;
}
function connections(kind){
 const arr=links[kind]||[];if(!arr.length)return;
 inject(`<section class="atlas-interactive"><div class="ix-kicker">DOVE PORTA QUESTA STORIA?</div><div class="ix-links">${arr.map(x=>`<a href="${x}">→ ${esc(x.replace("lezione-","").replace(".html","").toUpperCase())}</a>`).join("")}</div></section>`);
}
function map(){
 const stops=[["baran","lezione-baran.html"],["packet","lezione-packet.html"],["taylor","lezione-taylor.html"],["lo","lezione-lo.html"],["@","lezione-email.html"],["TCP/IP","lezione-tcpip.html"],["DNS","lezione-dns.html"],["WWW","lezione-web.html"],["MOSAIC","lezione-mosaic.html"]];
 let key=stops.findIndex(x=>path.includes(x[1].replace(".html","")));if(key<0)key=stops.findIndex(x=>x[1]===path);if(key<0)key=0;
 let el=document.createElement("div");el.className="ix-map";el.innerHTML=`<div class="ix-map-title">SEI QUI · MAPPA DELLA STORIA</div><div class="ix-map-track">${stops.map((s,i)=>`${i?'<span class="ix-map-line"></span>':''}<span class="ix-map-stop ${i===key?'active':''}" title="${s[0]}" onclick="location.href='${s[1]}'"></span>`).join("")}</div><div class="ix-map-label">${stops[key][0]} · ${key+1}/${stops.length}</div>`;document.body.appendChild(el);
}
document.addEventListener("DOMContentLoaded",()=>{
 let k=path;
 if(k==="lezione-baran.html")packet();
 if(k==="lezione-taylor.html")taylor();
 if(k==="lezione-lo.html")lo();
 if(k==="lezione-email.html")email();
 if(k==="lezione-modem.html")modem();
 if(k==="lezione-irc.html")irc();
 if(k==="lezione-http.html")http();
 if(k==="lezione-tcpip.html")tcpip();
 if(k==="lezione-dns.html")dns();
 if(k==="lezione-web.html"||k==="lezione-berners-lee.html")web();
 if(k==="lezione-mosaic.html")mosaic();
 if(k==="lezione-web.html"||k==="lezione-berners-lee.html")cern();
 if(k==="timeline.html"){document.querySelector("main")?.insertAdjacentHTML("beforeend",section("TIMELINE · VIVA","La storia non è una linea","Gli eventi si accendono come tappe. Ogni tappa porta a un'altra.",`<div class="ix-flow">${["1969 · LO","1971 · @","1983 · TCP/IP","1989 · WWW","1993 · MOSAIC","1995 · WEB"].map((x,i)=>`<a class="ix-box" href="${["lezione-lo.html","lezione-email.html","lezione-tcpip.html","lezione-web.html","lezione-mosaic.html","timeline.html"][i]}">${x}</a>`).join("")}</div>`));}
 map();
});
})();