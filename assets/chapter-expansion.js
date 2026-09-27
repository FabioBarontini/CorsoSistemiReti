
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[data-relic]').forEach(relic=>{
  const out=relic.querySelector('.relic-output'); const buttons=[...relic.querySelectorAll('button')]; let expected=1;
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
   const n=Number(btn.dataset.step);
   if(n===expected){btn.classList.add('active'); expected++; const msgs={1:'Hai individuato il problema. Ora chiediti quale idea potrebbe affrontarlo.',2:'Hai trovato l’idea. Ora osserva che cosa cambia nel sistema quando viene applicata.',3:'La traccia è completa: problema → idea → conseguenza. È così che molte innovazioni diventano storia.'}; out.textContent=msgs[n];}
   else {out.textContent=n<expected?'Questo passaggio è già stato aperto.':'Prova a seguire l’ordine narrativo: prima il problema, poi l’idea, infine la conseguenza.';}
  }));
 });
});
