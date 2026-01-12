const logBox = document.getElementById("log");
function log(msg) {
  const p = document.createElement("p");
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logBox.appendChild(p);
  logBox.scrollTop = logBox.scrollHeight;
}

// === ELEMENTS ===
const grid = document.getElementById("grid");
const controller = document.getElementById("controller");
const clusters = [
  document.getElementById("clusterA"),
  document.getElementById("clusterB"),
  document.getElementById("clusterC"),
  document.getElementById("clusterD")
];

// === EV SIMULATION ===
const evContainer = document.getElementById("ev-container");
const evs = [];
const colors = ["#00e0ff","#22ffaa","#ffee22","#ff8822","#ff44aa","#bb33ff"];
for (let i=0; i<6; i++) {
  const ev = document.createElement("div");
  ev.className = "ev";
  ev.style.background = colors[i % colors.length];
  ev.style.left = `${30 + Math.random()*30}%`;
  ev.style.top = `${50 + Math.random()*30}%`;
  ev.dataset.soc = (40 + Math.random()*50).toFixed(1);
  ev.innerText = `${ev.dataset.soc}%`;
  evContainer.appendChild(ev);
  evs.push(ev);
}

// === ANIMATION LOOP ===
function moveEV(ev) {
  const newX = 30 + Math.random()*30;
  const newY = 40 + Math.random()*40;
  gsap.to(ev, {
    duration: 10,
    left: `${newX}%`,
    top: `${newY}%`,
    ease: "power1.inOut",
    onComplete: () => {
      const soc = parseFloat(ev.dataset.soc) - (Math.random()*5);
      ev.dataset.soc = soc.toFixed(1);
      ev.innerText = `${ev.dataset.soc}%`;
      if (soc < 20) requestCharge(ev);
      else moveEV(ev);
    }
  });
}

function requestCharge(ev) {
  log(`EV_${evs.indexOf(ev)+1} hat nur ${ev.dataset.soc}% – sendet Ladeanfrage.`);
  gsap.to(ev, {duration: 2, boxShadow: "0 0 25px #ffcc00"});
  setTimeout(() => assignCluster(ev), 2000);
}

function assignCluster(ev) {
  const cluster = clusters[Math.floor(Math.random()*clusters.length)];
  log(`Central Controller weist EV_${evs.indexOf(ev)+1} → ${cluster.id} zu.`);
  gsap.to(ev, {
    duration: 6,
    left: cluster.offsetLeft + 30,
    top: cluster.offsetTop + 30,
    ease: "power1.inOut",
    onComplete: () => startCharging(ev, cluster)
  });
}

function startCharging(ev, cluster) {
  log(`EV_${evs.indexOf(ev)+1} lädt am ${cluster.id}.`);
  let soc = parseFloat(ev.dataset.soc);
  const interval = setInterval(() => {
    soc += 5;
    ev.dataset.soc = soc.toFixed(1);
    ev.innerText = `${ev.dataset.soc}%`;
    if (soc >= 100) {
      clearInterval(interval);
      log(`EV_${evs.indexOf(ev)+1} ist vollständig geladen und fährt weiter.`);
      gsap.to(ev, {duration: 2, boxShadow: "0 0 15px #00ffcc"});
      moveEV(ev);
    }
  }, 1000);
}

// === SCENE SETUP ===
log("Windturbine erzeugt Energie und sendet sie an das Netz.");
setTimeout(()=>log("Grid Controller verteilt Energie an Verbraucher und EVs."),3000);
setTimeout(()=>log("Zentrale Controller wartet auf Ladeanfragen der Fahrzeuge."),6000);

evs.forEach(ev => moveEV(ev));
