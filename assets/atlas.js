
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(x=>io.observe(x));

document.querySelectorAll('[data-glitch]').forEach(x=>{
  setInterval(()=>{x.style.transform=`translateX(${Math.random()*2-1}px)`},1800);
});

// Robust local navigation: explicitly resolve links relative to the current page.
document.addEventListener('click', (e)=>{
  const a=e.target.closest('a[href]');
  if(!a) return;
  const raw=a.getAttribute('href');
  if(!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:|javascript:)/i.test(raw)) return;
  const url=new URL(raw, window.location.href);
  if(url.origin === window.location.origin){
    e.preventDefault();
    window.location.assign(url.href);
  }
});
