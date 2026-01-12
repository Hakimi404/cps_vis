gsap.registerPlugin(MotionPathPlugin);

// === ENERGY FLOW ANIMATION ===
const flowPaths = ["#wind_grid", "#grid_cons", "#grid_ctrl"];
flowPaths.forEach((id, i) => {
  gsap.to(id, {
    strokeDasharray: "10,10",
    strokeDashoffset: 100,
    repeat: -1,
    duration: 2 + i,
    ease: "linear",
  });
});

// === MQTT MESSAGE FLOW (Controller <-> EVs) ===
const mqttLines = ["#ctrl_ev1", "#ctrl_ev2", "#ctrl_ev3"];
mqttLines.forEach((line, i) => {
  gsap.to(line, {
    strokeDasharray: "4,6",
    strokeDashoffset: 40,
    stroke: "#ff9800",
    repeat: -1,
    duration: 1.5 + 0.5 * i,
    ease: "linear",
  });
});

// === OPC UA CHARGING FLOW ===
const opcLines = ["#ev1_cl1", "#ev2_cl2", "#ev3_cl1"];
opcLines.forEach((line, i) => {
  gsap.to(line, {
    strokeDasharray: "6,8",
    strokeDashoffset: 80,
    repeat: -1,
    duration: 1.8 + 0.4 * i,
    ease: "linear",
  });
});

// === EV MOVEMENT LOOP ===
const evs = [
  { id: "#ev1", targetX: 1050, targetY: 440 },
  { id: "#ev2", targetX: 1050, targetY: 530 },
  { id: "#ev3", targetX: 1050, targetY: 600 },
];

function loopEV(ev) {
  const el = document.querySelector(ev.id);
  const startX = parseFloat(el.getAttribute("x"));
  const startY = parseFloat(el.getAttribute("y"));
  gsap.to(el, {
    duration: 6,
    x: ev.targetX - startX,
    y: ev.targetY - startY,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
    delay: Math.random() * 3,
  });
}
evs.forEach(loopEV);

// === Node Glow Pulse ===
gsap.to([".node", ".cluster"], {
  filter: "drop-shadow(0 0 10px #00ffff)",
  duration: 2,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
});
