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

const previewImages = [
  "assets/home-dock.png",
  "assets/vendas-dock.png",
  "assets/produtos-dock.png",
  "assets/caixa-dock.png",
  "assets/relatorios-dock.png"
];

let currentIndex = 0;
let interval;
const previewEl = document.getElementById("previewImage");
const dotsContainer = document.getElementById("previewDots");

function renderDots(){
  if(!dotsContainer) return;
  dotsContainer.innerHTML = "";

  previewImages.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("preview-dot");
    if(index === currentIndex) dot.classList.add("active");

    dot.addEventListener("click", () => {
      currentIndex = index;
      updatePreview();
      restartAuto();
    });

    dotsContainer.appendChild(dot);
  });
}

function updatePreview(){
  if(!previewEl) return;

  previewEl.style.opacity = 0;
  previewEl.style.transform = "scale(.98)";

  setTimeout(() => {
    previewEl.src = previewImages[currentIndex];
    previewEl.style.opacity = 1;
    previewEl.style.transform = "scale(1)";
    renderDots();
  }, 200);
}

function startAuto(){
  interval = setInterval(() => {
    currentIndex = (currentIndex + 1) % previewImages.length;
    updatePreview();
  }, 3000);
}

function restartAuto(){
  clearInterval(interval);
  startAuto();
}

if(previewEl){
  renderDots();
  startAuto();
}