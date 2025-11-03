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
