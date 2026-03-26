(function () {
  const canvas = document.getElementById("network-canvas");
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = [];
  const maxNodes = 110;
  const connectionDistance = 185;
  const minInitialNodes = 42;
  const maxInitialNodes = 68;
  const nodeColor = "rgba(79, 93, 68, 0.45)";
  const lineColorBase = "109, 92, 66";

  let width = 0;
  let height = 0;
  let rafId = 0;
  let lastTime = 0;

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createNode(x = Math.random() * width, y = Math.random() * height, emphasize = false) {
    return {
      x,
      y,
      vx: prefersReducedMotion ? 0 : randomBetween(-0.065, 0.065),
      vy: prefersReducedMotion ? 0 : randomBetween(-0.065, 0.065),
      radius: emphasize ? randomBetween(2.8, 3.8) : randomBetween(1.4, 2.8),
    };
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (nodes.length === 0) {
      seedNodes();
      return;
    }

    for (const node of nodes) {
      node.x = Math.min(Math.max(node.x, 0), width);
      node.y = Math.min(Math.max(node.y, 0), height);
    }
  }

  function seedNodes() {
    nodes.length = 0;
    const initialCount = Math.max(minInitialNodes, Math.min(maxInitialNodes, Math.round((width * height) / 28000)));

    for (let i = 0; i < initialCount; i += 1) {
      nodes.push(createNode());
    }
  }

  function addNode(x, y) {
    if (nodes.length >= maxNodes) {
      nodes.shift();
    }

    nodes.push(createNode(x, y, true));
  }

  function step(delta) {
    if (prefersReducedMotion) {
      return;
    }

    const speedFactor = delta / 16;

    for (const node of nodes) {
      node.x += node.vx * speedFactor;
      node.y += node.vy * speedFactor;

      if (node.x <= 0 || node.x >= width) {
        node.vx *= -1;
        node.x = Math.min(Math.max(node.x, 0), width);
      }

      if (node.y <= 0 || node.y >= height) {
        node.vy *= -1;
        node.y = Math.min(Math.max(node.y, 0), height);
      }
    }
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.hypot(dx, dy);

        if (distance > connectionDistance) {
          continue;
        }

        const alpha = (1 - distance / connectionDistance) * 0.36;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${lineColorBase}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  function drawNodes() {
    for (const node of nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
    }
  }

  function renderFrame(timestamp) {
    const delta = lastTime ? Math.min(timestamp - lastTime, 32) : 16;
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);
    step(delta);
    drawConnections();
    drawNodes();

    rafId = window.requestAnimationFrame(renderFrame);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  window.addEventListener("click", (event) => {
    if (event.target && event.target.closest("a, button")) {
      return;
    }

    addNode(event.clientX, event.clientY);
  });

  rafId = window.requestAnimationFrame(renderFrame);

  window.addEventListener("beforeunload", () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
})();
