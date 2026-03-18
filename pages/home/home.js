(function(){
  // Scroll reveal simples (sem libs)
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add("on");
    });
  }, { threshold: 0.12 });

  els.forEach(el=>io.observe(el));

  // CTA "Acessar Portal" (depois vira SSO de verdade)
document.querySelectorAll(".js-portal").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    window.location.href = "./app/index.html#/login";
  });
});

// Expandir detalhes do Core
const btnCore = document.getElementById("btnCoreDetails");
const coreCard = document.getElementById("coreCard");
const coreDetails = document.getElementById("coreDetails");

function toggleCore(){
  if(!coreDetails) return;
  const isOpen = coreDetails.style.display !== "none";
  coreDetails.style.display = isOpen ? "none" : "block";
  if(!isOpen) coreDetails.scrollIntoView({ behavior:"smooth", block:"start" });
}

if(btnCore) btnCore.addEventListener("click", (e)=>{ e.stopPropagation(); toggleCore(); });
if(coreCard) coreCard.addEventListener("click", toggleCore);

})();