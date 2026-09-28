gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

const smoother = ScrollSmoother.create({
  wrapper: '.smooth-wrapper',
  content: '.smooth-content',
  smooth: 1,
  effects: true 
});

function setupPathAnimation(svgSelector) {
  const svg = document.querySelector(svgSelector);
  if (!svg) return;

  const path = svg.querySelector("path");
  if (!path) return;

  const pathLength = path.getTotalLength();
  console.log("Path length:", pathLength);

  gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  return path;
}


function createScrollTimeline(path) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "+=1000",
      scrub: 2,
      pin: true,
      markers: false,
    },
  });

  tl.to("#hero", { scale: 0.5 }, 0)
    .to(".logo", { opacity: 0, ease: "expo.out" }, 0)
    .to("#sociallinks i", { opacity: 0, ease: "expo.out" }, 0)
    .to("nav i", { color: "white", ease: "expo.out" }, 0)
    .to("#hero", { background: "#595959", ease: "expo.out" }, 0)
    .to("nav img", { filter: "invert(1)", ease: "expo.out" }, 0)
    .to("#img-container img", { filter: "grayscale(100%)", ease: "expo.out" }, 0)
    .to(path, { strokeDashoffset: 0, duration: 3, ease: "power2.out" })
    .from("#backgroundScroll", { opacity: 0, ease: "expo.out" }, 0);

  return tl;
}

function animateText() {
  const myText = new SplitType(".KoolText", { types: "words" });

  gsap.set(".word", { y: 40, opacity: 0, willChange: "transform, opacity" });

  gsap.to(".word", {
    scrollTrigger: {
      trigger: ".KoolText",
      start: "top 85%",
      end: "bottom 70%",
      once: true,
      markers: false,
    },
    y: 0,
    opacity: 1,
    stagger: 0.03,
    duration: 0.15,
    ease: "power1.out",
    overwrite: "auto",
  });
}

function setupHorizontalScroll() {
  const container = document.querySelector("#imageContainer");
  const scrollSection = document.querySelector("#ImageScroll");

  const scrollDistance = container.scrollWidth - scrollSection.clientWidth;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scrollSection,
      start: "top top",
      end: "+=1000",
      scrub: 2,
      pin: true,
      markers: false,
    },
  });

  tl.to(container, {
    x: "-19%",
    ease: "none",
  });

  tl.to(scrollSection, {
    backgroundColor: "#000000ff",
    ease: "none",
  }, 0);
}

function setupCardHover() {
  const icons = document.querySelectorAll(".Card i");

  icons.forEach(icon => {
    icon.addEventListener("mouseenter", () => {
      const card = icon.closest(".Card");
      const innerDiv = card.querySelector("div");

      if (!innerDiv) return;

      if (!innerDiv.dataset.originalColor) {
        const originalColor = window.getComputedStyle(innerDiv).backgroundColor;
        innerDiv.dataset.originalColor = originalColor;
      }

      gsap.killTweensOf(innerDiv);
      gsap.killTweensOf(icon);

      gsap.to(innerDiv, {
        width: "450%",
        borderRadius: "0%",
        duration: 0.6,
        ease: "power2.out"
      });

      gsap.to(icon, {
        color: "#fff",
        duration: 0.3,
        ease: "power2.out"
      });
    });

    icon.addEventListener("mouseleave", () => {
      const card = icon.closest(".Card");
      const innerDiv = card.querySelector("div");

      if (!innerDiv) return;

      gsap.killTweensOf(innerDiv);
      gsap.killTweensOf(icon);

      const originalColor = innerDiv.dataset.originalColor || "#fff";

      gsap.to(innerDiv, {
        width: "0%",
        borderRadius: "100%",
        backgroundColor: originalColor,
        duration: 0.4,
        ease: "power2.inOut"
      });

      gsap.to(icon, {
        color: "#000",
        duration: 0.3,
        ease: "power2.inOut"
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", setupCardHover);


function Cards() {
  const scrollSection = document.querySelector("#CardsHolder");

  gsap.set(scrollSection, { perspective: 1000 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scrollSection,
      start: "top top",
      end: "+=1000",
      scrub: false, 
      pin: true,
      markers: false,
      toggleActions: "play none none none", 
    }
  });

  tl.to(scrollSection, { gap: '5vw', ease: "none" });
  tl.to('.Card', { borderRadius: '2vh', ease: "none" }, 0);
  tl.to('.Card', { boxShadow: '0 0.5vw 2vw rgba(97, 97, 97, 0.65)', ease: "none" }, 0);

  tl.to('.Card', {
    rotationY: 180,
    transformOrigin: "center center",
    ease: "power2.inOut",
  }, 0.3);

  tl.set('.Card img', { opacity: 0 }, 0.55);
  tl.set('.Card i', { opacity: 1 }, 0.55);
  tl.set('.Card i', { pointerEvents: 'auto' }, 0.6);
}

function resetIconsOpacity() {
  gsap.set(".Card i", { opacity: 0 });
}

function initAnimations() {
  const path = setupPathAnimation("#sign");
  if (path) createScrollTimeline(path);
  animateText();
  setupHorizontalScroll();
  Cards();
}

document.addEventListener("DOMContentLoaded", initAnimations);


/* ============================================================
   RETRO ARCADE SLOT MACHINE (Three.js, monotone black/white)
   ------------------------------------------------------------
   3 physical reel drums built from flat planes arranged in a
   ring. Spinning = rotating each drum group around its X axis.
   Reel geometry notes:
     symbol i sits at ring angle  a_i = i * (2PI / N)
     plane i  -> position (0, R*sin(a_i), R*cos(a_i)), rot.x = -a_i
     group.rotation.x = a_i  brings symbol i to the payline
   So landing on digit d is just: rotate to a_d + (full turns).
   ============================================================ */

const SlotMachine = (() => {
  const SYMBOLS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const N = SYMBOLS.length;
  const REEL_COUNT = 3;
  const REEL_W = 1.5;
  const CELL_H = 0.8;
  const REEL_GAP = 0.34;
  // radius that makes N flat faces tile the drum edge-to-edge
  const RADIUS = CELL_H / (2 * Math.tan(Math.PI / N));

  let scene, camera, renderer, canvas, reels = [], frameId = null;
  let spinning = false;
  let targetDigits = [0, 0, 0];
  let totalEl, statusEl, spinBtn, lever, section;
  let projectCount = 0;
  let scrambleTicker = null;

  /* ---------- digit texture ---------- */

  function makeDigitTexture(char) {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 170;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#060606";
    ctx.fillRect(0, 0, c.width, c.height);

    // faint diagonal hatch so the drum face reads as a surface, not a void
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 2;
    for (let x = -c.height; x < c.width; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, c.height);
      ctx.lineTo(x + c.height, 0);
      ctx.stroke();
    }

    // cell separators (top / bottom edge of each symbol)
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(0, 0, c.width, 3);
    ctx.fillRect(0, c.height - 3, c.width, 3);

    ctx.font = '112px "Press Start 2P", "Courier New", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // glow pass then solid pass -> CRT phosphor look, still pure monotone
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 26;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(char, c.width / 2, c.height / 2 + 4);
    ctx.shadowBlur = 0;
    ctx.fillText(char, c.width / 2, c.height / 2 + 4);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  /* ---------- reel construction ---------- */

  function buildReel(xOffset) {
    const group = new THREE.Group();
    group.position.x = xOffset;

    const geo = new THREE.PlaneGeometry(REEL_W, CELL_H);
    const faces = [];

    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({
        map: makeDigitTexture(SYMBOLS[i]),
        side: THREE.FrontSide
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, RADIUS * Math.sin(a), RADIUS * Math.cos(a));
      mesh.rotation.x = -a;
      mesh.userData.angle = a;
      group.add(mesh);
      faces.push(mesh);
    }

    // wireframe drum rims on both sides -> vector-arcade edge
    const rimPts = [];
    const SEG = 48;
    for (let s = 0; s <= SEG; s++) {
      const t = (s / SEG) * Math.PI * 2;
      rimPts.push(new THREE.Vector3(0, RADIUS * Math.sin(t), RADIUS * Math.cos(t)));
    }
    const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPts);
    [-REEL_W / 2, REEL_W / 2].forEach((x) => {
      const rim = new THREE.Line(
        rimGeo,
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35
        })
      );
      rim.position.x = x;
      group.add(rim);
    });

    return { group, faces, rotation: 0 };
  }

  /* ---------- per-frame drum shading ---------- */

  function shadeReels() {
    reels.forEach((reel) => {
      reel.group.rotation.x = reel.rotation;
      reel.faces.forEach((face) => {
        // how square-on this face is to the camera
        const facing = Math.cos(face.userData.angle - reel.rotation);
        const k = Math.max(0, facing);
        face.material.color.setScalar(0.12 + 0.88 * Math.pow(k, 1.4));
      });
    });
  }

  /* ---------- sizing ---------- */

  function resize() {
    if (!renderer || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const aspect = w / h;

    const deckWidth = REEL_COUNT * REEL_W + (REEL_COUNT - 1) * REEL_GAP;
    const deckHeight = CELL_H * 2.9; // ~3 symbol rows in view
    const halfFov = THREE.MathUtils.degToRad(32) / 2;
    const tanHalf = Math.tan(halfFov);

    // The reel faces sit RADIUS in front of each drum's centre, so they read
    // larger than the plane at z=0. Solve for the camera distance iteratively:
    // the magnification depends on z, and z depends on the magnification.
    let z = 6;
    for (let i = 0; i < 6; i++) {
      const mag = z / Math.max(0.001, z - RADIUS);
      const needW = deckWidth * mag * 1.08; // 8% breathing room at the edges
      const needH = deckHeight * mag;
      z = Math.max(
        needW / (2 * tanHalf * aspect),
        needH / (2 * tanHalf),
        RADIUS + 1.6
      );
    }

    camera.aspect = aspect;
    camera.position.z = z;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
  }

  /* ---------- render loop (only runs while it needs to) ---------- */

  function renderOnce() {
    shadeReels();
    renderer.render(scene, camera);
  }

  function startLoop() {
    if (frameId !== null) return;
    const tick = () => {
      renderOnce();
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (frameId === null) return;
    cancelAnimationFrame(frameId);
    frameId = null;
    renderOnce();
  }

  /* ---------- readout ---------- */

  function setStatus(text, blink) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("blink", !!blink);
  }

  function pad(n) {
    return String(n).padStart(REEL_COUNT, "0").slice(-REEL_COUNT);
  }

  function startScramble() {
    stopScramble();
    scrambleTicker = setInterval(() => {
      let s = "";
      for (let i = 0; i < REEL_COUNT; i++) {
        s += SYMBOLS[Math.floor(Math.random() * N)];
      }
      if (totalEl) totalEl.textContent = s;
    }, 60);
  }

  function stopScramble() {
    if (scrambleTicker) {
      clearInterval(scrambleTicker);
      scrambleTicker = null;
    }
  }

  /* ---------- lever animation ---------- */

  function pullLever() {
    const stick = section && section.querySelector(".lever-stick");
    const knob = section && section.querySelector(".lever-knob");
    if (!stick || !knob) return;
    gsap.timeline()
      .to([stick, knob], {
        rotation: 58,
        duration: 0.16,
        ease: "power3.in",
        transformOrigin: "bottom center"
      })
      .to([stick, knob], {
        rotation: 0,
        duration: 0.75,
        ease: "elastic.out(1, 0.35)"
      });
  }

  /* ---------- the spin ---------- */

  function spin() {
    if (spinning || !reels.length) return;
    spinning = true;
    if (spinBtn) spinBtn.disabled = true;

    startLoop();
    pullLever();
    setStatus("SPINNING", true);
    startScramble();

    const TWO_PI = Math.PI * 2;
    let landed = 0;

    reels.forEach((reel, index) => {
      const digit = targetDigits[index];
      const base = (digit / N) * TWO_PI;
      const turns = 5 + index * 2; // later reels spin longer -> classic stagger

      // next rotation >= current that lands on `digit`, plus whole turns
      const k = Math.ceil((reel.rotation - base) / TWO_PI) + turns;
      const target = base + k * TWO_PI;

      gsap.to(reel, {
        rotation: target,
        duration: 2.1 + index * 0.75,
        ease: "power4.out",
        onComplete() {
          reel.rotation = base + ((reel.rotation - base) % TWO_PI);

          // reel snap kick
          gsap.fromTo(
            reel.group.position,
            { y: -0.07 },
            { y: 0, duration: 0.35, ease: "elastic.out(1.6, 0.4)" }
          );

          landed++;
          if (landed === reels.length) finishSpin();
        }
      });
    });
  }

  function finishSpin() {
    stopScramble();
    if (totalEl) totalEl.textContent = pad(projectCount);
    setStatus("JACKPOT", false);
    spinning = false;
    if (spinBtn) spinBtn.disabled = false;

    if (totalEl) {
      gsap.fromTo(
        totalEl,
        { scale: 1 },
        { scale: 1.18, duration: 0.18, yoyo: true, repeat: 3, ease: "power2.inOut" }
      );
    }

    // let the settle animations play out, then park the loop
    gsap.delayedCall(1.2, () => {
      if (!spinning) stopLoop();
    });
  }

  /* ---------- fallback when Three.js is unavailable ---------- */

  function fallback() {
    if (canvas) canvas.style.display = "none";
    if (totalEl) totalEl.textContent = pad(projectCount);
    setStatus("READY", false);
  }

  /* ---------- init ---------- */

  function init() {
    section = document.querySelector("#slots");
    if (!section) return;

    canvas = section.querySelector("#slot-canvas");
    totalEl = section.querySelector("#slot-total");
    statusEl = section.querySelector("#slot-status");
    spinBtn = section.querySelector("#slot-spin");
    lever = section.querySelector(".lever");

    projectCount = parseInt(section.dataset.count, 10);
    if (!Number.isFinite(projectCount)) projectCount = 0;

    const clamped = Math.min(projectCount, Math.pow(10, REEL_COUNT) - 1);
    targetDigits = pad(clamped).split("").map(Number);

    if (typeof THREE === "undefined" || !canvas) {
      fallback();
      return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    });
    renderer.setClearColor(0x000000, 1);

    const span = REEL_W + REEL_GAP;
    const startX = -span * (REEL_COUNT - 1) / 2;
    for (let i = 0; i < REEL_COUNT; i++) {
      const reel = buildReel(startX + i * span);
      reel.rotation = ((i * 3) / N) * Math.PI * 2; // stagger the idle pose
      reels.push(reel);
      scene.add(reel.group);
    }

    resize();
    if (window.ResizeObserver) {
      new ResizeObserver(() => {
        resize();
        renderOnce();
      }).observe(canvas);
    } else {
      window.addEventListener("resize", () => {
        resize();
        renderOnce();
      });
    }

    // fonts land after first paint, so redraw the digit textures once ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        reels.forEach((reel) => {
          reel.faces.forEach((face, i) => {
            face.material.map.dispose();
            face.material.map = makeDigitTexture(SYMBOLS[i]);
            face.material.needsUpdate = true;
          });
        });
        renderOnce();
      });
    }

    renderOnce();
    setStatus("READY", true);
    if (totalEl) totalEl.textContent = pad(0);

    spinBtn && spinBtn.addEventListener("click", spin);
    lever && lever.addEventListener("click", spin);

    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      if (totalEl) totalEl.textContent = pad(projectCount);
      reels.forEach((reel, i) => {
        reel.rotation = (targetDigits[i] / N) * Math.PI * 2;
      });
      setStatus("READY", false);
      renderOnce();
      return;
    }

    // auto-spin the first time the cabinet scrolls into view
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      once: true,
      onEnter: () => gsap.delayedCall(0.35, spin)
    });

    // keep the drums idling gently whenever the section is on screen
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        if (self.isActive) startLoop();
        else if (!spinning) stopLoop();
      }
    });
  }

  return { init, spin };
})();

document.addEventListener("DOMContentLoaded", () => SlotMachine.init());
