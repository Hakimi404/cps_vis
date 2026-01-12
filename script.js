gsap.registerPlugin(MotionPathPlugin);
const logBox = document.getElementById("log");
const canvas = document.getElementById("energyFlow");
const ctx = canvas.getContext("2d");

// ==== Helper logging ====
function log(msg) {
  const p = document.createElement("p");
  p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logBox.appendChild(p);
  logBox.scrollTop = logBox.scrollHeight;
}

// ==== Dynamic canvas resizing ====
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==== Energy Flow Animation ====
function drawEnergyFlow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00ffcc";
  ctx.beginPath();
  ctx.moveTo(window.innerWidth * 0.48, window.innerHeight * 0.1);
  ctx.lineTo(window.innerWidth * 0.48, window.innerHeight * 0.32);
  ctx.lineTo(window.innerWidth * 0.25, window.innerHeight * 0.85);
  ctx.moveTo(window.innerWidth * 0.48, window.innerHeight * 0.32);
  ctx.lineTo(window.innerWidth * 0.88, window.innerHeight * 0.45);
  ctx.stroke();
  requestAnimationFrame(drawEnergyFlow);
}
drawEnergyFlow();

// ==== Initialization logs ====
log("Systemstart – Initialisierung aller Module...");
setTimeout(() => log("Windturbine erzeugt Energie und sendet sie an den Grid Controller."), 1000);
setTimeout(() => log("Grid Controller verteilt Energie an Verbraucher und Controller."), 2500);
setTimeout(() => log("Central Controller wartet auf Anfragen der Fahrzeuge."), 4000);

// ==== Create EVs ====
const evContainer = document.getElementById("ev-container");
const evs = [];
for (let i = 0; i < 10; i++) {
  const ev = document.createElement("div");
  ev.className = "ev";
  ev.dataset.soc = (40 + Math.random() * 50).toFixed(1);
  ev.innerText = `${ev.dataset.soc}%`;
  ev.style.left = `${30 + Math.random() * 40}%`;
  ev.style.top = `${50 + Math.random() * 30}%`;
  evContainer.appendChild(ev);
  evs.push(ev);
}

// ==== Create Clusters ====
const clusterContainer = document.getElementById("cluster-container");
const clusterLetters = ["A", "B", "C", "D"];
const clusters = [];
for (let i = 0; i < 4; i++) {
  const cluster = document.createElement("div");
  cluster.className = "cluster";
  cluster.id = `cluster${clusterLetters[i]}`;
  const slots = Math.floor(2 + Math.random() * 2);
  cluster.dataset.capacity = slots;
  cluster.dataset.used = 0;
  cluster.innerHTML = `Cluster ${clusterLetters[i]}<br><span>Freie Plätze: ${slots}</span>`;
  cluster.style.left = `${10 + Math.random() * 80}%`;
  cluster.style.top = `${15 + Math.random() * 70}%`;
  clusterContainer.appendChild(cluster);
  clusters.push(cluster);
}

// ==== EV Behavior ====
function moveEV(ev) {
  const newX = 10 + Math.random() * 80;
  const newY = 10 + Math.random() * 80;
  gsap.to(ev, {
    duration: 8,
    left: `${newX}%`,
    top: `${newY}%`,
    ease: "power1.inOut",
    onComplete: () => {
      let soc = parseFloat(ev.dataset.soc) - 7;
      if (soc < 0) soc = 0;
      ev.dataset.soc = soc.toFixed(1);
      ev.innerText = `${ev.dataset.soc}%`;
      if (soc <= 20) requestCharge(ev);
      else moveEV(ev);
    }
  });
}

function requestCharge(ev) {
  log(`EV_${evs.indexOf(ev) + 1} hat nur ${ev.dataset.soc}% – sendet Ladeanfrage.`);
  setTimeout(() => controllerOffer(ev), 1500);
}

function controllerOffer(ev) {
  const offers = clusters
    .filter(cl => cl.dataset.capacity - cl.dataset.used > 0)
    .map(cl => ({
      cl,
      preis: (0.10 + Math.random() * 0.1).toFixed(2),
      dist: Math.floor(Math.random() * 50) + 10
    }));

  if (!offers.length) {
    log(`EV_${evs.indexOf(ev) + 1} wartet – alle Cluster sind belegt.`);
    setTimeout(() => controllerOffer(ev), 4000);
    return;
  }

  log("Central Controller fragt verfügbare Cluster an...");
  offers.forEach(o =>
    log(`${o.cl.id} bietet ${o.preis} €/kWh, Entfernung ${o.dist} m, freie Plätze: ${o.cl.dataset.capacity - o.cl.dataset.used}`)
  );

  offers.sort((a, b) => a.preis - b.preis || a.dist - b.dist);
  const best = offers[0];
  log(`EV_${evs.indexOf(ev) + 1} akzeptiert Angebot von ${best.cl.id}.`);
  gsap.to(ev, {
    duration: 5,
    left: best.cl.offsetLeft,
    top: best.cl.offsetTop,
    ease: "power1.inOut",
    onComplete: () => startCharging(ev, best.cl)
  });
}

function startCharging(ev, cluster) {
  cluster.dataset.used = parseInt(cluster.dataset.used) + 1;
  cluster.querySelector("span").innerText = `Freie Plätze: ${cluster.dataset.capacity - cluster.dataset.used}`;
  log(`EV_${evs.indexOf(ev) + 1} lädt am ${cluster.id}...`);
  let soc = parseFloat(ev.dataset.soc);

  const interval = setInterval(() => {
    soc += 15;
    if (soc > 100) soc = 100;
    ev.dataset.soc = soc.toFixed(1);
    ev.innerText = `${ev.dataset.soc}%`;

    if (soc >= 100) {
      clearInterval(interval);
      cluster.dataset.used = parseInt(cluster.dataset.used) - 1;
      cluster.querySelector("span").innerText = `Freie Plätze: ${cluster.dataset.capacity - cluster.dataset.used}`;
      log(`EV_${evs.indexOf(ev) + 1} vollständig geladen – setzt Fahrt fort.`);
      moveEV(ev);
    }
  }, 1000);
}

// ==== Start everything ====
log("Simulation gestartet – EVs fahren los.");
evs.forEach(ev => moveEV(ev));
