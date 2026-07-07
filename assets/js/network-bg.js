(function () {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = [
    "rgba(11, 143, 130, 0.28)",
    "rgba(82, 110, 234, 0.17)",
    "rgba(198, 106, 88, 0.2)",
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = 0;
  let particles = [];
  let fieldFrame = null;
  let fieldOrbits = [];

  const fullTurn = Math.PI * 2;
  const orbitSpecs = [
    {
      selector: ".field-orbit--sampling",
      contourSelector: ".field-contour--one",
      centerX: 0.5,
      centerY: 0.48,
      radiusX: 0.28,
      radiusY: 0.25,
      phase: -2.35,
      period: 24000,
      pathPeriod: 28000,
      tilt: -0.2,
      direction: 1,
      pathDirection: 1,
    },
    {
      selector: ".field-orbit--selection",
      contourSelector: ".field-contour--two",
      centerX: 0.5,
      centerY: 0.48,
      radiusX: 0.22,
      radiusY: 0.17,
      phase: 0.28,
      period: 21000,
      pathPeriod: 42000,
      tilt: 0.84,
      direction: 1,
      pathDirection: 1,
    },
    {
      selector: ".field-orbit--theory",
      contourSelector: ".field-contour--three",
      centerX: 0.5,
      centerY: 0.48,
      radiusX: 0.3,
      radiusY: 0.29,
      phase: 2.15,
      period: 30000,
      pathPeriod: 36000,
      tilt: -0.5,
      direction: -1,
      pathDirection: 1,
    },
  ];

  function railOffset() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--rail-width");
    const parsed = Number.parseFloat(value);
    return window.innerWidth > 860 && Number.isFinite(parsed) ? parsed : 0;
  }

  function resetParticle(particle, randomizeAge) {
    const offset = railOffset();
    particle.x = offset + Math.random() * Math.max(1, width - offset);
    particle.y = Math.random() * height;
    particle.age = randomizeAge ? Math.random() * particle.life : 0;
    particle.prevX = particle.x;
    particle.prevY = particle.y;
  }

  function makeParticle(index) {
    const particle = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      age: 0,
      life: 220 + Math.random() * 220,
      speed: 0.34 + Math.random() * 0.48,
      color: colors[index % colors.length],
    };
    resetParticle(particle, true);
    return particle;
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = Math.max(34, Math.min(96, Math.floor((width * height) / 17000)));
    particles = Array.from({ length: targetCount }, (_, index) => makeParticle(index));
    renderFrame(performance.now());
  }

  function setupFieldOrbits() {
    fieldFrame = document.querySelector(".field-frame");
    if (!fieldFrame) {
      fieldOrbits = [];
      return;
    }

    fieldOrbits = orbitSpecs
      .map((spec) => {
        const element = fieldFrame.querySelector(spec.selector);
        const contour = fieldFrame.querySelector(spec.contourSelector);
        return {
          ...spec,
          contour,
          element,
          label: element?.querySelector(".field-label"),
        };
      })
      .filter((orbit) => orbit.element);

    if (fieldOrbits.length) {
      fieldFrame.classList.add("field-frame--orbiting");
      updateFieldOrbits(0);
    }
  }

  function updateFieldOrbits(time) {
    if (!fieldFrame || !fieldOrbits.length) {
      return;
    }

    const rect = fieldFrame.getBoundingClientRect();
    const motionTime = reduceMotion ? 0 : time;

    for (let i = 0; i < fieldOrbits.length; i += 1) {
      const orbit = fieldOrbits[i];
      const progress = orbit.phase + orbit.direction * (motionTime / orbit.period) * fullTurn;
      const pathTilt = orbit.tilt + orbit.pathDirection * (motionTime / orbit.pathPeriod) * fullTurn;
      const centerX = rect.width * orbit.centerX;
      const centerY = rect.height * orbit.centerY;
      const radiusX = rect.width * orbit.radiusX;
      const radiusY = rect.height * orbit.radiusY;
      const ellipseX = rect.width * orbit.radiusX * Math.cos(progress);
      const ellipseY = rect.height * orbit.radiusY * Math.sin(progress);
      const x =
        centerX +
        ellipseX * Math.cos(pathTilt) -
        ellipseY * Math.sin(pathTilt);
      const y =
        centerY +
        ellipseX * Math.sin(pathTilt) +
        ellipseY * Math.cos(pathTilt);

      if (orbit.contour) {
        orbit.contour.style.left = `${centerX.toFixed(2)}px`;
        orbit.contour.style.top = `${centerY.toFixed(2)}px`;
        orbit.contour.style.width = `${(radiusX * 2).toFixed(2)}px`;
        orbit.contour.style.height = `${(radiusY * 2).toFixed(2)}px`;
        orbit.contour.style.transform = `translate(-50%, -50%) rotate(${pathTilt.toFixed(4)}rad)`;
      }

      orbit.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }
  }

  function vectorAt(x, y, time) {
    const t = time * 0.00012;
    const angle =
      Math.sin(y * 0.006 + t * 3.2) * 0.95 +
      Math.cos(x * 0.004 - t * 2.3) * 0.72 +
      Math.sin((x + y) * 0.0025 + t) * 0.5;

    return {
      x: Math.cos(angle) * 1.4,
      y: Math.sin(angle) * 0.82,
    };
  }

  function drawContours(time) {
    const offset = railOffset();
    const startX = offset + Math.max(24, (width - offset) * 0.04);
    const endX = width - Math.max(24, width * 0.04);
    const span = Math.max(1, endX - startX);
    const rows = 5;

    ctx.save();
    ctx.lineWidth = 1;
    for (let row = 0; row < rows; row += 1) {
      const yBase = height * (0.18 + row * 0.16);
      ctx.beginPath();
      for (let i = 0; i <= 80; i += 1) {
        const u = i / 80;
        const x = startX + span * u;
        const field = vectorAt(x, yBase, time);
        const y =
          yBase +
          Math.sin(u * Math.PI * 2 + row * 0.8 + time * 0.00018) * 18 +
          field.y * 18;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = row % 2 === 0 ? "rgba(11, 143, 130, 0.1)" : "rgba(18, 20, 23, 0.065)";
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles(time) {
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i];
      const vector = vectorAt(particle.x, particle.y, time);
      particle.prevX = particle.x;
      particle.prevY = particle.y;
      particle.x += vector.x * particle.speed;
      particle.y += vector.y * particle.speed;
      particle.age += 1;

      const offset = railOffset();
      if (
        particle.age > particle.life ||
        particle.x < offset - 40 ||
        particle.x > width + 40 ||
        particle.y < -40 ||
        particle.y > height + 40
      ) {
        resetParticle(particle, false);
        continue;
      }

      const lifePhase = Math.sin((particle.age / particle.life) * Math.PI);
      ctx.globalAlpha = 0.18 + lifePhase * 0.34;
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(particle.prevX, particle.prevY);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function renderFrame(time) {
    ctx.clearRect(0, 0, width, height);
    drawContours(time);
    drawParticles(time);
    updateFieldOrbits(time);

    if (!reduceMotion) {
      rafId = window.requestAnimationFrame(renderFrame);
    }
  }

  setupFieldOrbits();
  resizeCanvas();
  window.addEventListener("resize", () => {
    resizeCanvas();
    updateFieldOrbits(performance.now());
  });

  window.addEventListener("beforeunload", () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
})();
