gsap.registerPlugin(MotionPathPlugin);

const infoBox = document.getElementById("info-text");

// Tooltips for modules
const info = {
  wind: "Die Windturbine wandelt kinetische Energie des Windes in elektrische Energie um.",
  grid: "Der Netzcontroller verteilt die erzeugte Energie zwischen Verbrauchern und Ladesystemen.",
  cons: "Die Verbraucher nutzen den erzeugten Strom für Haushalte und Industrie.",
  ctrl: "Der zentrale Controller verwaltet Fahrzeuganfragen und weist Ladecluster zu.",
  cl1: "Ladecluster A: Steht für verfügbare Ladestationen.",
  cl2: "Ladecluster B: Zweites Ladezentrum, empfängt Anfragen über OPC UA.",
  ev1: "Ein Elektrofahrzeug. Kommuniziert mit dem Controller und fährt zum Cluster.",
  ev2: "Ein weiteres Fahrzeug mit eigener Route.",
  ev3: "Drittes Fahrzeug, simuliert paralleles Laden.",
};

document.querySelectorAll(".node, .cluster, .ev").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    infoBox.innerText = info[el.id] || "Systemmodul.";
  });
  el.addEventListener("mouseleave", () => {
    infoBox.innerText = "Bewege den Mauszeiger über ein Modul, um seine Funktion zu sehen.";
  });
});

// Continuous animations
const evs = [
  { id: "#ev1", target: { x: 970, y: 450 } },
  { id: "#ev2", target: { x: 970, y: 540 } },
  { id: "#ev3", target: { x: 970, y: 620 } },
];

function animateEV(ev) {
  const car = document.querySelector(ev.id);
  const startX = parseFloat(car.getAttribute("cx"));
  const startY = parseFloat(car.getAttribute("cy"));

  gsap.to(car, {
    duration: 6,
    motionPath: {
      path: [
        { x: startX, y: startY },
        { x: ev.target.x, y: ev.target.y },
      ],
      autoRotate: false,
    },
    ease: "power1.inOut",
    yoyo: true,
    repeat: -1,
  });
}

// Animate all EVs
evs.forEach(animateEV);

// Flowline pulse effect
gsap.to(".flow", {
  opacity: 1,
  duration: 2,
  ease: "power1.inOut",
  repeat: -1,
  yoyo: true,
});

// Node pulsing (energy flow)
const nodes = [".node", ".cluster"];
nodes.forEach((sel) => {
  gsap.to(sel, {
    stroke: "#00ffff",
    duration: 1.8,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
  });
});
