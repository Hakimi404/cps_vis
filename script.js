const logBox = document.getElementById("log");
function log(msg){
  const t = new Date().toLocaleTimeString();
  logBox.innerHTML += `[${t}] ${msg}<br>`;
  logBox.scrollTop = logBox.scrollHeight;
}

// --- Windturbine rotation ---
gsap.to("#blades",{rotation:360,transformOrigin:"center",repeat:-1,ease:"linear",duration:4});

// EV data
const evs = [
  {id:"EV_1",color:"#00aaff",soc:25},
  {id:"EV_2",color:"#00ff66",soc:45},
  {id:"EV_3",color:"#ff5555",soc:30},
];
const clusters=["A","B","C","D"];

async function blink(elem,color="#00d9ff",times=3){
  for(let i=0;i<times;i++){
    elem.style.stroke=color;elem.style.opacity=1;
    await gsap.to(elem,{opacity:0.3,duration:0.4});
  }
  elem.style.opacity=0.3;
}

// Move EV smoothly
function moveEV(ev,x,y,duration=2){
  return gsap.to(ev,{attr:{cx:x,cy:y},duration,ease:"power1.inOut"});
}

// --- Main EV cycle ---
async function runEV(evObj){
  const ev = document.getElementById(evObj.id);
  while(true){
    // step 1: low SoC
    if(evObj.soc<40){
      ev.setAttribute("fill","#ffaa00");
      log(`${evObj.id}: SoC=${evObj.soc}% → sendet Ladeanfrage an MQTT-Broker`);
      await blink(document.getElementById("mqtt"));
      log(`${evObj.id}: Anfrage erreicht zentralen Controller`);
      await blink(document.getElementById("cc"));
      log(`${evObj.id}: Controller fragt Cluster an ...`);
      await blink(document.getElementById("A"));
      await blink(document.getElementById("B"));
      await blink(document.getElementById("C"));
      await blink(document.getElementById("D"));

      const offers = clusters.map(c=>({c,price:10+Math.random()*8,dist:1+Math.random()*4}));
      const best = offers.reduce((a,b)=>(a.price*a.dist<b.price*b.dist)?a:b);
      log(`${evObj.id}: Beste Option → Cluster ${best.c}`);

      // move to cluster
      const targetY = 150 + (best.c.charCodeAt(0)-65)*120;
      await moveEV(ev,1100,targetY);
      log(`${evObj.id}: erreicht Cluster ${best.c}, beginnt zu laden`);

      // charging
      for(let i=evObj.soc;i<=100;i+=10){
        evObj.soc=i;
        ev.setAttribute("fill","#00ff99");
        log(`${evObj.id}: lädt... SoC=${i}%`);
        await new Promise(r=>setTimeout(r,600));
      }

      log(`${evObj.id}: voll geladen, kehrt zurück zum Grid`);
      await moveEV(ev,300+Math.random()*200,700+Math.random()*80);
      evObj.soc=30+Math.random()*20;
      ev.setAttribute("fill",evObj.color);
      await new Promise(r=>setTimeout(r,2000));
    }else{
      // driving & consumption
      evObj.soc-=Math.random()*5;
      log(`${evObj.id}: fährt im Grid (SoC=${evObj.soc.toFixed(1)}%)`);
      await new Promise(r=>setTimeout(r,2000));
    }
  }
}

// Run all EVs concurrently
evs.forEach(e=>runEV(e));
