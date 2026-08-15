(function () {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.classList.add("reveal");
  });

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.classList.add("reveal");
      child.style.transitionDelay = Math.min(i * 0.08, 0.5) + "s";
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();

(function () {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.documentElement.classList.add("custom-cursor");

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  document.body.appendChild(dot);

  window.addEventListener(
    "mousemove",
    (e) => {
      dot.style.opacity = "1";
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
  });

  const hoverSelector = "a, button, .cta-button";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelector)) dot.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSelector)) dot.classList.remove("is-hover");
  });
})();

(function () {
  const STRIP_COUNT = 8;

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function renderLouvre(container, src, alt, w, h, naturalW, naturalH) {
    // Replicate object-fit: cover math so the sliced strips aren't stretched.
    const scale = Math.max(w / naturalW, h / naturalH);
    const scaledW = naturalW * scale;
    const scaledH = naturalH * scale;
    const offsetX = (scaledW - w) / 2;
    const offsetY = (scaledH - h) / 2;
    const stripW = w / STRIP_COUNT;

    container.innerHTML = "";

    const base = document.createElement("img");
    base.className = "louvre-base";
    base.src = src;
    base.alt = alt;
    container.appendChild(base);

    const strips = document.createElement("div");
    strips.className = "louvre-strips";

    for (let i = 0; i < STRIP_COUNT; i++) {
      const strip = document.createElement("div");
      strip.className = "louvre-strip";
      strip.style.backgroundImage = `url("${src}")`;
      strip.style.backgroundSize = `${scaledW}px ${scaledH}px`;
      strip.style.backgroundPosition = `-${offsetX + i * stripW}px -${offsetY}px`;
      strip.style.transitionDelay = `${i * 0.03}s`;
      strips.appendChild(strip);
    }

    container.appendChild(strips);
  }

  function buildLouvre(container) {
    let src = container.dataset.louvreSrc;
    let alt = container.dataset.louvreAlt || "";

    if (!src) {
      const existingImg = container.querySelector("img");
      if (!existingImg) return;
      src = existingImg.getAttribute("src");
      alt = existingImg.getAttribute("alt") || "";
      container.dataset.louvreSrc = src;
      container.dataset.louvreAlt = alt;
    }

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;

    const probe = new Image();
    probe.onload = () => {
      renderLouvre(container, src, alt, w, h, probe.naturalWidth, probe.naturalHeight);
    };
    probe.src = src;
  }

  function initAll() {
    document.querySelectorAll(".athlete-img").forEach(buildLouvre);
  }

  initAll();
  window.addEventListener("resize", debounce(initAll, 200));
})();
