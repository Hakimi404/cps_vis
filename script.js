const logBox = document.getElementById("log");
function logStory(msg){
  const t = new Date().toLocaleTimeString();
  logBox.innerHTML += `<b>[${t}]</b> ${msg}<br>`;
  logBox.scrollTop = logBox.scrollHeight;
}

// Windturbine rotation
gsap.to("#blades",{rotation:360,transformOrigin:"center",repeat:-1,ease:"linear",duration:4});

// EV data
const evs = [
  {id:"EV_1",color:"#00aaff",soc:30},
  {id:"EV_2",color:"#00ff66",soc:50},
  {id:"EV_3",color:"#ff5555",soc:25},
];
const clusters=["A","B","C","D"];

function moveEV(ev,x,y,duration=2){return gsap.to(ev,{attr:{cx:x,cy:y},duration,ease:"power1.inOut"});}
async function wait(t){return new Promise(r=>setTimeout(r,t));}

async function systemCycle(){
  // --- Stage 1: Windturbine erzeugt Energie ---
  logStory("Der Wind bläst durch die Turbine – Energie wird erzeugt.");
  await wait(1000);
  logStory("Die Windturbine überträgt elektrische Leistung an den Grid Controller.");
  await gsap.to("#windline",{opacity:1,duration:1});
  await wait(500);
  logStory("Der Grid Controller empfängt Energie und verteilt sie an das Netz und die Verbraucher.");
  await wait(1000);
  logStory("Die Verbraucher nutzen aktuell verfügbare Energie für Haushalte und Industrie.");
  await wait(1500);
  logStory("Ein Teil der Energie wird für Elektrofahrzeuge reserviert.");

  // --- Stage 2: EVs bewegen sich ---
  for(const evObj of evs){logStory(`${evObj.id} fährt im Grid. Aktueller SoC: ${evObj.soc}%`);}
  await wait(1500);

  // --- Stage 3: EV sendet Ladeanfrage ---
  const needyEV = evs.find(e=>e.soc<35);
  logStory(`${needyEV.id} erkennt niedrigen Ladezustand (${needyEV.soc}%) und sendet eine Ladeanfrage an den MQTT-Broker.`);
  await wait(1000);
  logStory("Der zentrale Controller empfängt die Anfrage und sendet ein Call-for-Proposals an alle Cluster.");
  await wait(1000);

  // --- Stage 4: Cluster-Angebote ---
  const offers = clusters.map(c=>({c,price:(0.1+Math.random()*0.05).toFixed(3),slot:Math.random()>0.3}));
  for(const o of offers){logStory(`Cluster ${o.c} bietet Preis: ${o.price} €/kWh ${o.slot?"(Slot verfügbar)":"(besetzt)"}`);}
  const best = offers.filter(o=>o.slot).sort((a,b)=>a.price-b.price)[0];
  logStory(`${needyEV.id} akzeptiert das Angebot von Cluster ${best.c}.`);
  await wait(1500);

  // --- Stage 5: EV fährt zum Cluster ---
  const ev = document.getElementById(needyEV.id);
  const clusterY = 350+(best.c.charCodeAt(0)-65)*100;
  await moveEV(ev,1100,clusterY,3);
  logStory(`${needyEV.id} erreicht ${best.c} und startet den Ladevorgang über OPC UA.`);
  await wait(1000);

  // --- Stage 6: Ladevorgang ---
  for(let s=needyEV.soc;s<=100;s+=10){
    needyEV.soc=s;
    logStory(`${needyEV.id} lädt... aktueller SoC: ${s}%`);
    await wait(700);
  }

  // --- Stage 7: Rückkehr ins Grid ---
  logStory(`${needyEV.id} ist vollständig geladen und verlässt den Cluster.`);
  await moveEV(ev,300+Math.random()*200,780+Math.random()*60,2);
  needyEV.soc=40+Math.random()*30;
  await wait(1000);
  logStory(`${needyEV.id} fährt wieder im Netz. Der Zyklus beginnt von vorn.`);
}

// Zyklus wiederholen
async function mainLoop(){
  while(true){
    await systemCycle();
    logStory("────────────────────────────────────────────");
    await wait(3000);
  }
}
mainLoop();
