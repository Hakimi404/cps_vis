gsap.registerPlugin(MotionPathPlugin);
const logBox = document.getElementById("log");
function log(msg) {
  const p = document.createElement("p");
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logBox.appendChild(p);
  logBox.scrollTop = logBox.scrollHeight;
}

// === INITIAL LOGS ===
log("Systemstart – Initialisierung aller Module...");
setTimeout(()=>log("Windturbine erzeugt Energie und sendet sie an das Netz."),1000);
setTimeout(()=>log("Grid Controller verteilt Energie an Verbraucher und Controller."),2500);
setTimeout(()=>log("Central Controller wartet auf Anfragen der Fahrzeuge."),4000);

// === CREATE EVs ===
const evContainer = document.getElementById("ev-container");
const evs = [];
const colors = ["#00e0ff","#22ffaa","#ffee22","#ff8822","#ff44aa","#bb33ff","#44ffee","#ff3399","#ffcc22","#22aaff"];
for (let i=0; i<10; i++) {
  const ev = document.createElement("div");
  ev.className = "ev";
  ev.style.background = colors[i % colors.length];
  ev.dataset.soc = (40 + Math.random()*50).toFixed(1);
  ev.innerText = `${ev.dataset.soc}%`;
  ev.style.left = `${30 + Math.random()*40}%`;
  ev.style.top = `${50 + Math.random()*30}%`;
  evContainer.appendChild(ev);
  evs.push(ev);
}

// === CREATE RANDOM CLUSTERS ===
const clusterContainer = document.getElementById("cluster-container");
const clusterLetters = ["A","B","C","D"];
const clusters = [];
for (let i=0; i<4; i++) {
  const cluster = document.createElement("div");
  cluster.className = "cluster";
  cluster.id = `cluster${clusterLetters[i]}`;
  const slots = Math.floor(2 + Math.random()*2);
  cluster.dataset.capacity = slots;
  cluster.dataset.used = 0;
  cluster.innerHTML = `Cluster ${clusterLetters[i]}<br><span>Freie Plätze: ${slots}</span>`;
  cluster.style.left = `${10 + Math.random()*80}%`;
  cluster.style.top = `${15 + Math.random()*70}%`;
  clusterContainer.appendChild(cluster);
  clusters.push(cluster);
}

// === BEHAVIOR ===
function tickUpdate() {
  evs.forEach(ev=>{
    let soc = parseFloat(ev.dataset.soc) - 10; // drop 10% per tick
    if (soc < 0) soc = 0;
    ev.dataset.soc = soc.toFixed(1);
    ev.innerText = `${ev.dataset.soc}%`;
    if (soc <= 20) requestCharge(ev);
  });
  log("Tick empfangen – SoC-Werte werden aktualisiert.");
  setTimeout(tickUpdate, 8000);
}

function requestCharge(ev) {
  log(`EV_${evs.indexOf(ev)+1} hat nur ${ev.dataset.soc}% – sendet Ladeanfrage.`);
  setTimeout(()=>controllerOffer(ev),1500);
}

function controllerOffer(ev) {
  log("Central Controller fragt Cluster an...");
  const offers = clusters.map(cl=>{
    const preis=(0.10+Math.random()*0.1).toFixed(2);
    const frei=cl.dataset.capacity-cl.dataset.used;
    const dist=Math.floor(Math.random()*50)+10;
    return {cl,preis,dist,frei};
  });
  offers.forEach(o=>log(`${o.cl.id} bietet ${o.preis} €/kWh, Entfernung ${o.dist} m, Slots ${o.frei}`));
  const available=offers.filter(o=>o.frei>0);
  if (!available.length){log("Kein freier Cluster verfügbar."); return;}
  available.sort((a,b)=>a.preis-b.preis||a.dist-b.dist);
  const best=available[0];
  log(`EV_${evs.indexOf(ev)+1} akzeptiert Angebot von ${best.cl.id}.`);
  gsap.to(ev,{duration:6,left:best.cl.offsetLeft,top:best.cl.offsetTop,ease:"power1.inOut",onComplete:()=>startCharging(ev,best.cl)});
}

function startCharging(ev,cluster){
  cluster.dataset.used=parseInt(cluster.dataset.used)+1;
  cluster.querySelector("span").innerText=`Freie Plätze: ${cluster.dataset.capacity-cluster.dataset.used}`;
  log(`EV_${evs.indexOf(ev)+1} lädt am ${cluster.id}...`);
  let soc=parseFloat(ev.dataset.soc);
  const interval=setInterval(()=>{
    soc+=5;
    if(soc>=100){
      soc=100;
      clearInterval(interval);
      cluster.dataset.used=parseInt(cluster.dataset.used)-1;
      cluster.querySelector("span").innerText=`Freie Plätze: ${cluster.dataset.capacity-cluster.dataset.used}`;
      log(`EV_${evs.indexOf(ev)+1} vollständig geladen – fährt weiter.`);
    }
    ev.dataset.soc=soc.toFixed(1);
    ev.innerText=`${ev.dataset.soc}%`;
  },1000);
}

// === START ===
tickUpdate();
