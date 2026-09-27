(function () {
  const portrait = document.querySelector("[data-pixel-portrait]");
  if (!portrait) {
    return;
  }

  const canvas = portrait.querySelector(".pixel-portrait__canvas");
  const sourceUrl = portrait.getAttribute("data-image-src");
  const context = canvas && canvas.getContext("2d");
  if (!canvas || !context || !sourceUrl) {
    return;
  }

  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d");
  const image = new Image();
  const gridSize = 20;
  const totalTiles = gridSize * gridSize;
  const initialTiles = 24;
  const tilesPerClick = 52;
  const tileOrder = Array.from({ length: totalTiles }, function (_, index) {
    return index;
  });
  let revealedTiles = initialTiles;
  let targetTiles = initialTiles;
  let animationFrame = 0;

  function shuffleTiles() {
    for (let index = tileOrder.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const current = tileOrder[index];
      tileOrder[index] = tileOrder[randomIndex];
      tileOrder[randomIndex] = current;
    }
  }

  function drawSourceImage() {
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (sourceRatio > 1) {
      sourceWidth = image.naturalHeight;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    sourceCanvas.width = canvas.width;
    sourceCanvas.height = canvas.height;
    sourceContext.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );
  }

  function drawTiles(count) {
    const tileSize = canvas.width / gridSize;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;

    for (let orderIndex = 0; orderIndex < count; orderIndex += 1) {
      const tileIndex = tileOrder[orderIndex];
      const column = tileIndex % gridSize;
      const row = Math.floor(tileIndex / gridSize);
      const x = column * tileSize;
      const y = row * tileSize;

      context.drawImage(
        sourceCanvas,
        x,
        y,
        tileSize,
        tileSize,
        x,
        y,
        tileSize,
        tileSize
      );
    }

    const percentage = Math.round((count / totalTiles) * 100);
    portrait.setAttribute(
      "aria-label",
      count === totalTiles
        ? "Portrait fully revealed"
        : "Reveal more of the portrait, currently " + percentage + " percent visible"
    );
  }

  function animateReveal() {
    const remaining = targetTiles - revealedTiles;
    const step = Math.max(1, Math.ceil(remaining * 0.16));
    revealedTiles = Math.min(targetTiles, revealedTiles + step);
    drawTiles(revealedTiles);

    if (revealedTiles < targetTiles) {
      animationFrame = window.requestAnimationFrame(animateReveal);
    } else {
      animationFrame = 0;
    }
  }

  function revealMore() {
    if (targetTiles >= totalTiles) {
      return;
    }

    targetTiles = Math.min(totalTiles, targetTiles + tilesPerClick);
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(animateReveal);
    }
  }

  image.addEventListener("load", function () {
    shuffleTiles();
    drawSourceImage();
    drawTiles(initialTiles);
    portrait.classList.add("is-ready");
    portrait.addEventListener("click", revealMore);
  }, { once: true });

  image.src = sourceUrl;

  if (image.complete) {
    image.dispatchEvent(new Event("load"));
  }
})();
