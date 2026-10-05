document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".choice-row button").forEach(btn=>btn.addEventListener("click",()=>{
    const box=btn.closest(".casefile"); if(!box)return;
    box.querySelectorAll(".choice-row button").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected");
    box.querySelectorAll(".choice-result").forEach(r=>r.classList.remove("show"));
    const r=box.querySelector('[data-result="'+btn.dataset.choice+'"]'); if(r)r.classList.add("show");
  }));
});
