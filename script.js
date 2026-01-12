const info = document.getElementById("infoText");
const socBar = document.getElementById("socFill");
const socLabel = document.getElementById("socLabel");
const ev = document.getElementById("ev");

function log(message) {
  info.innerHTML += `➡️ ${message}<br>`;
  info.scrollTop = info.scrollHeight;
}

async function blinkArrow(id, color = "#00d9ff", times = 3) {
  const arrow = document.querySelector(id);
  for (let i = 0; i < times; i++) {
    arrow.style.stroke = color;
    arrow.style.opacity = 1;
    await gsap.to(arrow, { opacity: 0.3, duration: 0.4 });
  }
  arrow.style.opacity = 0.2;
}

function updateSoC(value) {
  socBar.style.width = `${value}%`;
  socBar.style.background = `linear-gradient(90deg, #ffaa00, #00ff66)`;
  socLabel.innerText = `SoC: ${value}%`;
}

// --- Animation Cycle ---
async function simulateCycle() {
  info.innerHTML = "";
  updateSoC(20);
  ev.setAttribute("fill", "#ff5555");

  log("EV erkennt niedrigen SoC (20 %) und sendet Ladeanfrage an MQTT-Broker …");
  await blinkArrow("#ev_mqtt", "#00aaff");
  await blinkArrow("#mqtt_cc", "#00aaff");

  log("Zentraler Controller empfängt Anfrage und fragt alle vier Cluster an …");
  await blinkArrow("#cc_clusters", "#ffaa00", 2);
  await blinkArrow("#cc_clusters2", "#ffaa00", 2);
  await blinkArrow("#cc_clusters3", "#ffaa00", 2);
  await blinkArrow("#cc_clusters4", "#ffaa00", 2);

  const offers = [ 
    { cluster: "A", price: 15, dist: 2 },
    { cluster: "B", price: 12, dist: 3 },
    { cluster: "C", price: 18, dist: 1 },
    { cluster: "D", price: 14, dist: 4 }
  ];
  log(`Clusterangebote erhalten: ${offers.map(o => o.cluster + " (" + o.price + " €/kWh, Distanz " + o.dist + ")").join(", ")}`);

  const best = offers.reduce((a, b) => (a.price * a.dist < b.price * b.dist ? a : b));
  log(`EV wählt das beste Angebot: Cluster ${best.cluster}`);

  await blinkArrow("#cc_ev", "#00ff88");
  log(`EV bewegt sich zu Cluster ${best.cluster} …`);
  await gsap.to(ev, { attr: { cx: 1150, cy: 180 + (best.cluster.charCodeAt(0) - 65) * 120 }, duration: 2, ease: "power1.inOut" });

  log("EV verbindet sich über OPC UA mit Cluster und beginnt zu laden …");
  await blinkArrow("#clusters_cc", "#00ff66", 3);

  // Charging
  for (let soc = 20; soc <= 100; soc += 10) {
    await new Promise(r => setTimeout(r, 500));
    updateSoC(soc);
  }
  ev.setAttribute("fill", "#00ff66");
  log("Ladevorgang abgeschlossen. EV ist voll geladen (100 %).");

  await new Promise(r => setTimeout(r, 800));
  log("EV trennt Verbindung und fährt zurück ins Grid …");
  await gsap.to(ev, { attr: { cx: 250, cy: 600 }, duration: 2, ease: "power1.inOut" });
  ev.setAttribute("fill", "#ccc");
}

simulateCycle();
setInterval(simulateCycle, 20000);
