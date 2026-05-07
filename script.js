const verses = [
  {
    text: "Know therefore that the LORD your God is God, the faithful God who keeps covenant and steadfast love with those who love him and keep his commandments, to a thousand generations ",
    reference: "Deuteronomy 7:9 (ESV)"
  },
  {
    text:"As for you, O LORD, you will not restrain your mercy from me; your steadfast love and your faithfulness will ever preserve me!",
    reference: "Psalm 40:11 (ESV)"
  },
  {
    text:
      "And God is able to make all grace abound to you, so that having all sufficiency in all things at all times, you may abound in every good work.",
    reference: "2 Corinthians 9:8 (ESV)"
  },
  {
    text:
      "Therefore, my beloved brothers, be steadfast, immovable, always abounding in the work of the Lord, knowing that in the Lord your labor is not in vain.",
    reference: "1 Corinthians 15:58 (ESV)"
  },
  {
    text:
      "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
    reference: "Proverbs 3:5-6 (ESV)"
  },
   {
    text:"Now to him who is able to keep you from stumbling and to present you blameless before the presence of his glory with great joy, to the only God, our Savior, through Jesus Christ our Lord, be glory, majesty, dominion, and authority, before all time and now and forever. Amen.",
    reference: "Jude 24-25 (ESV)"
  },
  {
    text:"Now may the God of peace who brought again from the dead our Lord Jesus, the great shepherd of the sheep, by the blood of the eternal covenant, equip you with everything good that you may do his will, working in us that which is pleasing in his sight, through Jesus Christ, to whom be glory forever and ever. Amen.",
    reference: "Hebrews 13:20-21 (ESV)"
  }
];

const canvas = document.querySelector("#confetti");
const ctx = canvas.getContext("2d");
const loader = document.querySelector("#loader");
const loaderCount = document.querySelector("#loaderCount");
const loaderText = document.querySelector("#loaderText");
const blowCandleButton = document.querySelector("#blowCandle");
const newVerseButton = document.querySelector("#newVerse");
const verseText = document.querySelector("#verseText");
const verseReference = document.querySelector("#verseReference");
const toastSection = document.querySelector("#toast");
const memoryStage = document.querySelector("#memoryStage");
const memoryImage = document.querySelector("#memoryImage");
const memoryFallback = document.querySelector("#memoryFallback");
const memoryInitial = document.querySelector("#memoryInitial");
const memoryLabel = document.querySelector("#memoryLabel");
const memoryTitle = document.querySelector("#memoryTitle");
const memoryHint = document.querySelector("#memoryHint");
const memoryPrevButton = document.querySelector("#memoryPrev");
const memoryNextButton = document.querySelector("#memoryNext");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const introSteps = [
  { count: "3", text: "wait" },
  { count: "2", text: "waiiit" },
  { count: "1", text: "waiiiiiiiiit" }
];

const memories = [
  {
    label:  "Warm tables, open doors",
    hint: "for the meals, and care you give so freely.",
    image: "assets/memories/students.JPG",
    alt: "hospitality memory placeholder",
    initial: "01"
  },
  {
    label: "Students",
    hint: "for the many students touched by your love for the gospel.",
    image: "assets/memories/blessingstudents.JPG",
    alt: "students memory placeholder",
    initial: "02"
  },
  {
    label: "Church family",
    hint: "for the church family you love so well.",
    image: "assets/memories/biggroup.JPG",
    alt: "church family memory placeholder",
    initial: "03"
  },
  {
    label: "Friendship",
    hint: "for friendship, prayer, and shared life.",
    image: "assets/memories/fun.JPG",
    alt: "friendship memory placeholder",
    initial: "04"
  }
];

let particles = [];
let rafId = null;
let lastVerseIndex = 0;
let activeMemoryIndex = 0;
let swipeStartX = null;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createConfettiParticle(originX, originY) {
  const colors = ["#cf5f78", "#ee8b72", "#f3aa21", "#d8c9a6", "#789a7b", "#fff8ef"];
  const angle = Math.random() * Math.PI * 2;
  const speed = 3 + Math.random() * 6;

  return {
    kind: "confetti",
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    width: 6 + Math.random() * 8,
    height: 8 + Math.random() * 12,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
    spin: -0.18 + Math.random() * 0.36,
    life: 90 + Math.random() * 40,
    age: 0
  };
}

function createSparkParticle(originX, originY) {
  const colors = ["#fff8ef", "#ffd36a", "#f3aa21", "#ee8b72", "#cf5f78"];
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.55;
  const speed = 2.4 + Math.random() * 5.6;

  return {
    kind: "spark",
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 2 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 34 + Math.random() * 26,
    age: 0
  };
}

function createSmokeParticle(originX, originY) {
  return {
    kind: "smoke",
    x: originX + (Math.random() - 0.5) * 28,
    y: originY + (Math.random() - 0.5) * 10,
    vx: (Math.random() - 0.5) * 0.95,
    vy: -0.8 - Math.random() * 1.55,
    radius: 8 + Math.random() * 16,
    growth: 0.24 + Math.random() * 0.28,
    color: "#6f5b59",
    life: 72 + Math.random() * 42,
    age: 0
  };
}

function burst(originX = window.innerWidth * 0.34, originY = window.innerHeight * 0.42) {
  if (reducedMotion.matches) {
    return;
  }

  const count = window.innerWidth < 620 ? 70 : 120;

  for (let index = 0; index < count; index += 1) {
    particles.push(createConfettiParticle(originX, originY));
  }

  if (!rafId) {
    rafId = requestAnimationFrame(tick);
  }
}

function candleBurst(originX, originY) {
  if (reducedMotion.matches) {
    return;
  }

  const sparkCount = window.innerWidth < 620 ? 34 : 56;
  const smokeCount = window.innerWidth < 620 ? 26 : 42;
  const confettiCount = window.innerWidth < 620 ? 48 : 78;

  for (let index = 0; index < sparkCount; index += 1) {
    particles.push(createSparkParticle(originX, originY));
  }

  for (let index = 0; index < smokeCount; index += 1) {
    particles.push(createSmokeParticle(originX, originY - 10));
  }

  for (let index = 0; index < confettiCount; index += 1) {
    particles.push(createConfettiParticle(originX, originY));
  }

  if (!rafId) {
    rafId = requestAnimationFrame(tick);
  }
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter((particle) => {
    particle.age += 1;

    if (particle.kind === "smoke") {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.992;
      particle.radius += particle.growth;

      const alpha = Math.max(1 - particle.age / particle.life, 0) * 0.42;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return particle.age < particle.life;
    }

    if (particle.kind === "spark") {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.035;
      particle.vx *= 0.988;
      particle.radius *= 0.985;

      const alpha = Math.max(1 - particle.age / particle.life, 0);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(particle.x, particle.y);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.radius * 2.3);
      glow.addColorStop(0, "#fff8ef");
      glow.addColorStop(0.48, particle.color);
      glow.addColorStop(1, "rgba(207, 95, 120, 0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, particle.radius * 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return particle.age < particle.life;
    }

    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.12;
    particle.vx *= 0.985;
    particle.rotation += particle.spin;

    const alpha = Math.max(1 - particle.age / particle.life, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.fillRect(
      -particle.width / 2,
      -particle.height / 2,
      particle.width,
      particle.height
    );
    ctx.restore();

    return particle.age < particle.life && particle.y < window.innerHeight + 40;
  });

  if (particles.length) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

function setNewVerse() {
  let nextIndex = Math.floor(Math.random() * verses.length);

  if (nextIndex === lastVerseIndex) {
    nextIndex = (nextIndex + 1) % verses.length;
  }

  lastVerseIndex = nextIndex;
  verseText.textContent = verses[nextIndex].text;
  verseReference.textContent = verses[nextIndex].reference;
  verseText.parentElement.classList.remove("is-changing");

  window.requestAnimationFrame(() => {
    verseText.parentElement.classList.add("is-changing");
  });
}

function handleVerseClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  setNewVerse();
}

function handleCandleClick(event) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const originX = rect.left + Math.min(36, rect.width * 0.22);
  const originY = rect.top + rect.height / 2;

  button.classList.add("is-blowing");
  candleBurst(originX, originY);

  window.setTimeout(() => {
    toastSection.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    window.setTimeout(() => {
      button.classList.remove("is-blowing");
    }, reducedMotion.matches ? 0 : 700);
  }, reducedMotion.matches ? 0 : 650);
}

function setMemory(index) {
  activeMemoryIndex = (index + memories.length) % memories.length;
  const memory = memories[activeMemoryIndex];

  memoryLabel.textContent = memory.label;
  memoryTitle.textContent = memory.title;
  memoryHint.textContent = memory.hint;
  memoryInitial.textContent = memory.initial;
  memoryFallback.hidden = true;
  memoryImage.hidden = false;
  memoryImage.alt = memory.alt;
  memoryImage.src = memory.image;
}

function shiftMemory(direction) {
  setMemory(activeMemoryIndex + direction);
}

function handleMemoryPointerDown(event) {
  swipeStartX = event.clientX;
}

function handleMemoryPointerUp(event) {
  if (swipeStartX === null) {
    return;
  }

  const deltaX = event.clientX - swipeStartX;
  swipeStartX = null;

  if (Math.abs(deltaX) < 48) {
    return;
  }

  shiftMemory(deltaX < 0 ? 1 : -1);
}

function showIntroStep(index) {
  loaderCount.textContent = introSteps[index].count;
  loaderText.textContent = introSteps[index].text;
}

function revealSite() {
  document.body.classList.remove("is-loading");
  loader.setAttribute("aria-hidden", "true");
  window.setTimeout(() => burst(), reducedMotion.matches ? 0 : 500);
}

function runIntro() {
  if (!loader) {
    return;
  }

  const introDuration = 5000;
  const delay = introDuration / introSteps.length;
  let stepIndex = 0;

  showIntroStep(stepIndex);

  const introInterval = window.setInterval(() => {
    stepIndex += 1;

    if (stepIndex < introSteps.length) {
      showIntroStep(stepIndex);
      return;
    }

    window.clearInterval(introInterval);
    revealSite();
  }, delay);
}

window.addEventListener("resize", resizeCanvas);
blowCandleButton.addEventListener("click", handleCandleClick);
newVerseButton.addEventListener("click", handleVerseClick);
memoryPrevButton.addEventListener("click", () => shiftMemory(-1));
memoryNextButton.addEventListener("click", () => shiftMemory(1));
memoryStage.addEventListener("pointerdown", handleMemoryPointerDown);
memoryStage.addEventListener("pointerup", handleMemoryPointerUp);
memoryStage.addEventListener("pointercancel", () => {
  swipeStartX = null;
});
memoryImage.addEventListener("error", () => {
  memoryImage.hidden = true;
  memoryFallback.hidden = false;
});

resizeCanvas();
setMemory(0);
runIntro();
