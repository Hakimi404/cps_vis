// Animate EV request, assignment, charging, and return
async function simulateCycle() {
  const ev = document.getElementById("ev");

  // Step 1: EV needs charging
  await gsap.to(ev, { fill: "#ff5555", duration: 0.8 });
  await blinkArrow("#ev_mqtt"); // request to MQTT
  await blinkArrow("#cc_mqtt"); // controller assignment

  // Step 2: EV moves to cluster
  await moveEV(ev, 850, 400, "#ffaa00"); // moving state

  // Step 3: Charging via OPC UA
  await blinkArrow("#ev_opc");
  await gsap.to(ev, { fill: "#00ff99", duration: 2 }); // charging green

  // Step 4: Full - return to grid
  await moveEV(ev, 330, 390, "#ccc");
}

// Move EV smoothly to target (x,y)
function moveEV(ev, targetX, targetY, color) {
  return gsap.to(ev, {
    attr: { cx: targetX, cy: targetY },
    duration: 2,
    ease: "power1.inOut",
    onUpdate: () => (ev.style.fill = color),
  });
}

// Blink arrow (message sent)
function blinkArrow(selector) {
  const arrow = document.querySelector(selector);
  return gsap.to(arrow, {
    opacity: 1,
    duration: 0.3,
    repeat: 3,
    yoyo: true,
    ease: "power1.inOut",
  });
}

// Loop continuously
simulateCycle();
setInterval(simulateCycle, 10000);
