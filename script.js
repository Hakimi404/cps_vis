// Sequential highlight animation
const order = [
  "#tick", "#wt", "#gc", "#cons",
  "#cc", "#ev", "#cl", "#mqtt", "#opc", "#chaos", "#mean"
];

function highlightStep(id, delay) {
  gsap.to(id, {
    strokeWidth: 3,
    duration: 0.5,
    repeat: 1,
    yoyo: true,
    delay: delay,
    ease: "power1.inOut"
  });
}

// animate data flow (arrows fade in sequence)
const arrows = document.querySelectorAll(".arrow");
arrows.forEach((a, i) => {
  gsap.to(a, {
    opacity: 1,
    duration: 1,
    delay: 1.5 + i * 0.7,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
});

// sequential node highlights
order.forEach((id, i) => highlightStep(id, i * 1.2));
