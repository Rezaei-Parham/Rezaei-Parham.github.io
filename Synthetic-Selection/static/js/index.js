(function () {
  // Bulma navbar burger
  document.addEventListener("DOMContentLoaded", () => {
    const burgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
    burgers.forEach((el) => {
      el.addEventListener("click", () => {
        const target = el.dataset.target;
        const menu = document.getElementById(target);
        el.classList.toggle("is-active");
        if (menu) menu.classList.toggle("is-active");
      });
    });

    const RESULTS_CONFIG = {
      cifar10: {
        groups: [
          {
            key: "paradigm",
            label: "Training Paradigm",
            options: [
              { id: "scratch", label: "Scratch", action: "column", value: "scratch" },
              { id: "distilled", label: "Distilled", action: "column", value: "distilled" },
              { id: "pretrained", label: "Pretrained", action: "column", value: "pretrained" },
            ],
          },
          {
            key: "feature",
            label: "Feature Extractor",
            options: [
              { id: "clip", label: "CLIP", action: "cifarVariant" },
              { id: "dino", label: "DINO-v2", action: "cifarVariant" },
            ],
          },
          {
            key: "generator",
            label: "Generator",
            options: [
              { id: "truncated", label: "Truncated models", action: "cifarVariant" },
              { id: "t2i", label: "T2I models", action: "cifarVariant" },
            ],
          },
        ],
        defaults: {
          paradigm: "scratch",
          feature: "clip",
          generator: "truncated",
        },
      },
      imagenet: {
        groups: [
          {
            key: "feature",
            label: "Feature Extractor",
            options: [
              { id: "clip", label: "CLIP ViT-B" },
            ],
          },
          {
            key: "generator",
            label: "Generator",
            options: [
              { id: "truncated", label: "Truncated models", action: "imagenetVariant" },
              { id: "t2i", label: "T2I models", action: "imagenetVariant" },
            ],
          },
        ],
        defaults: {
          feature: "clip",
          generator: "truncated",
        },
      },
      rxrx1: {
        groups: [
          {
            key: "feature",
            label: "Feature Extractor",
            options: [
              { id: "clip", label: "CLIP ViT-B" },
            ],
          },
          {
            key: "generator",
            label: "Generator",
            options: [
              { id: "morphgen", label: "MorphGen" },
            ],
          },
        ],
        defaults: {
          feature: "clip",
          generator: "morphgen",
        },
      },
      tweetirony: {
        groups: [
          {
            key: "feature",
            label: "Feature Extractor",
            options: [
              { id: "mpnet", label: "all-mpnet-base-v2" },
            ],
          },
          {
            key: "generator",
            label: "Generator",
            options: [
              { id: "gpt", label: "GPT-generated tweets" },
            ],
          },
        ],
        defaults: {
          feature: "mpnet",
          generator: "gpt",
        },
      },
    };

    const selectionState = {};
    let activeDataset = "cifar10";

    const applyActiveColumn = () => {
      if (activeDataset !== "cifar10") return;
      const activeCol = selectionState.cifar10?.paradigm || RESULTS_CONFIG.cifar10.defaults.paradigm;
      const activeVariant = document.querySelector(
        ".dataset-panel[data-dataset=\"cifar10\"] .cifar10-variant.is-active"
      );
      const table = activeVariant ? activeVariant.querySelector(".results-table") : null;
      if (table) table.setAttribute("data-active-col", activeCol);
    };

    const includeTargets = document.querySelectorAll("[data-include]");
    includeTargets.forEach((el) => {
      const url = el.getAttribute("data-include");
      if (!url) return;
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load ${url}`);
          return response.text();
        })
        .then((html) => {
          el.innerHTML = html;
          applyActiveColumn();
        })
        .catch(() => {
          el.innerHTML = "<div class=\"results-table-error\">Unable to load table.</div>";
        });
    });

    const datasetButtons = document.querySelectorAll("[data-role=\"dataset-toggle\"] .toggle-btn");
    const datasetPanels = document.querySelectorAll(".dataset-panel");
    const cifarVariants = document.querySelectorAll(".cifar10-variant");
    const imagenetVariants = document.querySelectorAll(".imagenet-variant");
    const choiceContainer = document.querySelector("[data-role=\"choice-groups\"]");

    const setActiveCifarVariant = () => {
      const feature = selectionState.cifar10?.feature || RESULTS_CONFIG.cifar10.defaults.feature;
      const generator = selectionState.cifar10?.generator || RESULTS_CONFIG.cifar10.defaults.generator;
      cifarVariants.forEach((panel) => {
        const isActive = panel.dataset.feature === feature && panel.dataset.generator === generator;
        panel.classList.toggle("is-active", isActive);
      });
      applyActiveColumn();
    };

    const setActiveImagenetVariant = () => {
      const generator = selectionState.imagenet?.generator || RESULTS_CONFIG.imagenet.defaults.generator;
      imagenetVariants.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.generator === generator);
      });
    };

    const ACTION_HANDLERS = {
      column: () => applyActiveColumn(),
      cifarVariant: () => setActiveCifarVariant(),
      imagenetVariant: () => setActiveImagenetVariant(),
    };

    const ensureSelectionState = (dataset) => {
      if (!selectionState[dataset]) selectionState[dataset] = {};
      const defaults = RESULTS_CONFIG[dataset]?.defaults || {};
      Object.keys(defaults).forEach((key) => {
        if (!selectionState[dataset][key]) selectionState[dataset][key] = defaults[key];
      });
    };

    const renderChoiceGroups = (dataset) => {
      if (!choiceContainer) return;
      const config = RESULTS_CONFIG[dataset];
      if (!config) {
        choiceContainer.innerHTML = "";
        return;
      }
      ensureSelectionState(dataset);
      choiceContainer.innerHTML = "";
      config.groups.forEach((group) => {
        const block = document.createElement("div");
        block.className = "choice-block";

        const label = document.createElement("p");
        label.className = "results-label";
        label.textContent = group.label;

        const groupEl = document.createElement("div");
        groupEl.className = "button-group choice-group is-collapsed";
        groupEl.dataset.group = group.key;

        const selected = selectionState[dataset][group.key];
        group.options.forEach((option) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "button is-small is-light toggle-btn";
          btn.dataset.option = option.id;
          if (option.action) btn.dataset.action = option.action;
          if (option.value) btn.dataset.value = option.value;
          btn.textContent = option.label;
          if (option.id === selected) btn.classList.add("is-selected");
          groupEl.appendChild(btn);
        });

        block.append(label, groupEl);
        choiceContainer.appendChild(block);
      });
    };

    const applyGroupActions = (dataset) => {
      const config = RESULTS_CONFIG[dataset];
      if (!config) return;
      config.groups.forEach((group) => {
        const selected = selectionState[dataset][group.key];
        const option = group.options.find((item) => item.id === selected);
        if (option?.action && ACTION_HANDLERS[option.action]) {
          ACTION_HANDLERS[option.action](option.value || option.id);
        }
      });
    };

    const setActiveDataset = (dataset) => {
      activeDataset = dataset;
      datasetButtons.forEach((btn) => {
        btn.classList.toggle("is-selected", btn.dataset.dataset === dataset);
      });
      datasetPanels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.dataset === dataset);
      });
      renderChoiceGroups(dataset);
      applyGroupActions(dataset);
    };

    const setSelection = (dataset, groupKey, optionId) => {
      ensureSelectionState(dataset);
      selectionState[dataset][groupKey] = optionId;
    };

    datasetButtons.forEach((btn) => {
      btn.addEventListener("click", () => setActiveDataset(btn.dataset.dataset));
    });

    if (choiceContainer) {
      choiceContainer.addEventListener("click", (event) => {
        const btn = event.target.closest(".toggle-btn");
        if (!btn || !choiceContainer.contains(btn)) return;
        const groupEl = btn.closest("[data-group]");
        if (!groupEl) return;
        const groupKey = groupEl.dataset.group;
        const optionId = btn.dataset.option;
        setSelection(activeDataset, groupKey, optionId);
        groupEl.querySelectorAll(".toggle-btn").forEach((item) => {
          item.classList.toggle("is-selected", item === btn);
        });
        const action = btn.dataset.action;
        const value = btn.dataset.value || optionId;
        if (action && ACTION_HANDLERS[action]) ACTION_HANDLERS[action](value);
      });
    }

    setActiveDataset("cifar10");

    // Theory navigation: 3 steps
    const meterText = document.getElementById("theoryMeterText");
    const panels = document.querySelectorAll(".theory-panel");
    const steps = document.querySelectorAll(".theory-step");
    const prevBtn = document.getElementById("theoryPrev");
    const nextBtn = document.getElementById("theoryNext");

    const labels = ["Setup", "Deterministic equivalents", "Optimized synthetic data"];
    const maxTheoryLevel = labels.length - 1;

    function setTheoryLevel(level) {
      panels.forEach(p => p.classList.remove("is-active"));
      const active = document.querySelector(`.theory-panel[data-level="${level}"]`);
      if (active) active.classList.add("is-active");

      steps.forEach((step) => {
        const isActive = parseInt(step.dataset.levelTarget, 10) === level;
        step.classList.toggle("is-selected", isActive);
        step.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (meterText) meterText.textContent = labels[level] || "";
      if (prevBtn) prevBtn.disabled = level === 0;
      if (nextBtn) nextBtn.disabled = level === maxTheoryLevel;
    }

    if (steps.length) {
      let currentTheoryLevel = 0;
      setTheoryLevel(currentTheoryLevel);

      steps.forEach((step) => {
        step.addEventListener("click", () => {
          currentTheoryLevel = parseInt(step.dataset.levelTarget, 10) || 0;
          setTheoryLevel(currentTheoryLevel);
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          currentTheoryLevel = Math.max(0, currentTheoryLevel - 1);
          setTheoryLevel(currentTheoryLevel);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          currentTheoryLevel = Math.min(maxTheoryLevel, currentTheoryLevel + 1);
          setTheoryLevel(currentTheoryLevel);
        });
      }
    }

    function initCovarianceDemo() {
      const root = document.querySelector("[data-covariance-demo]");
      if (!root) return;

      const svg = root.querySelector(".covariance-demo-svg");
      if (!svg) return;

      const NS = "http://www.w3.org/2000/svg";
      const createSvgNode = (tag, attrs = {}) => {
        const node = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([key, value]) => {
          if (value !== undefined && value !== null) node.setAttribute(key, String(value));
        });
        return node;
      };

      const realEllipseLayer = svg.querySelector("[data-layer=\"real-ellipse\"]");
      const selectedEllipseLayer = svg.querySelector("[data-layer=\"selected-ellipse\"]");
      const realPointsLayer = svg.querySelector("[data-layer=\"real-points\"]");
      const poolPointsLayer = svg.querySelector("[data-layer=\"pool-points\"]");
      const selectedPointsLayer = svg.querySelector("[data-layer=\"selected-points\"]");
      const transferLayer = svg.querySelector("[data-layer=\"transfer\"]");
      const gapMetric = root.querySelector("[data-metric=\"gap\"]");
      const rotationMetric = root.querySelector("[data-metric=\"rotation\"]");
      const countMetric = root.querySelector("[data-metric=\"count\"]");
      const toggleBtn = root.querySelector("[data-action=\"toggle\"]");
      const resetBtn = root.querySelector("[data-action=\"reset\"]");
      if (
        !realEllipseLayer ||
        !selectedEllipseLayer ||
        !realPointsLayer ||
        !poolPointsLayer ||
        !selectedPointsLayer ||
        !transferLayer
      ) {
        return;
      }

      const totalRounds = 6;
      const roundDuration = 2400;
      const endHold = 1800;
      const cycleDuration = totalRounds * roundDuration + endHold;
      const plotScale = 54;
      const ellipseScale = plotScale * 1.82;
      const centers = {
        real: { x: 160, y: 214 },
        pool: { x: 480, y: 214 },
        selected: { x: 800, y: 214 },
      };
      const baseCovariance = [
        [1.9, -0.72],
        [-0.72, 0.58],
      ];
      const realPoints = [
        [1.8, 0.92], [1.35, 0.81], [0.98, 0.52], [0.52, 0.25], [0.18, 0.06], [-0.22, -0.06],
        [-0.66, -0.34], [-1.08, -0.63], [-1.48, -0.83], [-1.86, -1.05], [1.22, 0.34], [0.78, 0.02],
        [0.3, -0.18], [-0.18, -0.46], [-0.62, -0.68], [-1.02, -0.91], [-1.36, -1.12], [-0.12, 0.42],
        [0.34, 0.66], [0.76, 0.94], [0.08, -0.66], [0.44, -0.9], [0.92, -1.16], [-0.42, 0.18],
        [-0.88, 0.44], [-1.26, 0.71],
      ];
      const poolPoints = [
        [-0.13, -0.14], [0.25, -0.43], [0.73, 0.71], [-0.66, 1.2], [-0.73, -0.1], [-2.21, -0.39],
        [-0.62, -1.19], [0.1, -0.59], [-0.36, 0.57], [-2.09, -1.17], [-0.7, -0.99], [0.58, -0.46],
        [1.58, 0.26], [-0.36, -0.37],
      ];

      const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
      const ease = (value) => {
        const t = clamp(value, 0, 1);
        return t * t * (3 - 2 * t);
      };
      const lerp = (start, end, value) => start + (end - start) * value;
      const lerpMatrix = (from, to, value) => [
        [lerp(from[0][0], to[0][0], value), lerp(from[0][1], to[0][1], value)],
        [lerp(from[1][0], to[1][0], value), lerp(from[1][1], to[1][1], value)],
      ];
      const projectPoint = (point, panel) => ({
        x: panel.x + point[0] * plotScale,
        y: panel.y - point[1] * plotScale,
      });

      const covariance = (points) => {
        if (points.length < 2) return null;
        const meanX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
        const meanY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
        const denom = points.length - 1;
        const sxx = points.reduce((sum, point) => sum + (point[0] - meanX) ** 2, 0) / denom;
        const sxy = points.reduce((sum, point) => sum + (point[0] - meanX) * (point[1] - meanY), 0) / denom;
        const syy = points.reduce((sum, point) => sum + (point[1] - meanY) ** 2, 0) / denom;
        return [
          [sxx, sxy],
          [sxy, syy],
        ];
      };

      const secondMoment = (points) => {
        if (!points.length) return baseCovariance;
        const denom = points.length;
        const sxx = points.reduce((sum, point) => sum + point[0] ** 2, 0) / denom;
        const sxy = points.reduce((sum, point) => sum + point[0] * point[1], 0) / denom;
        const syy = points.reduce((sum, point) => sum + point[1] ** 2, 0) / denom;
        return [
          [sxx, sxy],
          [sxy, syy],
        ];
      };

      const covarianceForSelection = (points) => covariance(points) || baseCovariance;
      const visualCovariance = (points) => {
        if (!points.length) return baseCovariance;
        if (points.length === 1) return lerpMatrix(baseCovariance, secondMoment(points), 0.45);
        return covariance(points) || baseCovariance;
      };

      const frobeniusGap = (left, right) =>
        Math.sqrt(
          (left[0][0] - right[0][0]) ** 2 +
          2 * (left[0][1] - right[0][1]) ** 2 +
          (left[1][1] - right[1][1]) ** 2
        );

      const matrixDecomposition = (matrix) => {
        const a = matrix[0][0];
        const b = matrix[0][1];
        const d = matrix[1][1];
        const delta = Math.sqrt((a - d) ** 2 + 4 * b * b);
        const lambda1 = Math.max((a + d + delta) / 2, 0.001);
        const lambda2 = Math.max((a + d - delta) / 2, 0.001);
        const angle = 0.5 * Math.atan2(2 * b, a - d);
        return { lambda1, lambda2, angle };
      };

      const angleDifference = (left, right) => {
        const raw = Math.atan2(Math.sin(left - right), Math.cos(left - right));
        return Math.abs(raw);
      };

      const targetCovariance = covariance(realPoints) || baseCovariance;
      const targetDecomposition = matrixDecomposition(targetCovariance);
      const targetAxis = {
        x: Math.cos(targetDecomposition.angle),
        y: Math.sin(targetDecomposition.angle),
      };
      const targetSigma = Math.sqrt(targetDecomposition.lambda1);
      const initialGap = frobeniusGap(baseCovariance, targetCovariance);

      const candidateTieBreak = (point) => {
        const projection = point[0] * targetAxis.x + point[1] * targetAxis.y;
        const orthogonal = -point[0] * targetAxis.y + point[1] * targetAxis.x;
        return Math.abs(orthogonal) + Math.abs(Math.abs(projection) - targetSigma) * 0.6;
      };

      const buildSelectionPlan = () => {
        const plan = [];
        const selected = [];
        const remaining = poolPoints.map((_, index) => index);

        for (let step = 0; step < totalRounds; step += 1) {
          let bestIndex = remaining[0];
          let bestScore = Number.POSITIVE_INFINITY;
          let bestTieBreak = Number.POSITIVE_INFINITY;

          remaining.forEach((candidateIndex) => {
            const candidate = poolPoints[candidateIndex];
            const score = frobeniusGap(
              covarianceForSelection([...selected, candidate]),
              targetCovariance
            );
            const tieBreak = candidateTieBreak(candidate);
            if (
              score < bestScore - 1e-9 ||
              (Math.abs(score - bestScore) <= 1e-9 && tieBreak < bestTieBreak)
            ) {
              bestIndex = candidateIndex;
              bestScore = score;
              bestTieBreak = tieBreak;
            }
          });

          const beforeSelected = selected.slice();
          const candidate = poolPoints[bestIndex];
          const afterSelected = [...beforeSelected, candidate];
          plan.push({
            candidateIndex: bestIndex,
            candidate,
            beforeSelected,
            afterSelected,
          });
          selected.push(candidate);
          remaining.splice(remaining.indexOf(bestIndex), 1);
        }

        return plan;
      };

      const selectionPlan = buildSelectionPlan();
      const states = [{ selected: [], visualMatrix: baseCovariance }];
      selectionPlan.forEach((step) => {
        states.push({
          selected: step.afterSelected,
          visualMatrix: visualCovariance(step.afterSelected),
        });
      });
      states.forEach((state, index) => {
        const decomposition = matrixDecomposition(state.visualMatrix);
        state.angle = decomposition.angle;
        state.rotationDiff = angleDifference(state.angle, targetDecomposition.angle);
        state.gapRatio = frobeniusGap(state.visualMatrix, targetCovariance) / initialGap;
        state.count = index;
      });

      const drawEllipse = (layer, center, matrix, options) => {
        layer.replaceChildren();
        const { lambda1, lambda2, angle } = matrixDecomposition(matrix);
        const rx = Math.sqrt(lambda1) * ellipseScale;
        const ry = Math.sqrt(lambda2) * ellipseScale;
        const rotation = (angle * 180) / Math.PI;

        const halo = createSvgNode("ellipse", {
          cx: center.x,
          cy: center.y,
          rx: rx + 16,
          ry: ry + 16,
          fill: options.halo,
          opacity: options.haloOpacity,
          transform: `rotate(${rotation} ${center.x} ${center.y})`,
        });
        const fill = createSvgNode("ellipse", {
          cx: center.x,
          cy: center.y,
          rx,
          ry,
          fill: options.fill,
          opacity: options.fillOpacity,
          transform: `rotate(${rotation} ${center.x} ${center.y})`,
        });
        const outline = createSvgNode("ellipse", {
          cx: center.x,
          cy: center.y,
          rx,
          ry,
          fill: "none",
          stroke: options.stroke,
          "stroke-width": options.strokeWidth,
          "stroke-dasharray": options.dasharray || "",
          opacity: options.strokeOpacity,
          transform: `rotate(${rotation} ${center.x} ${center.y})`,
        });
        layer.append(halo, fill, outline);
      };

      const drawPointCloud = (layer, points, center, options) => {
        layer.replaceChildren();
        const fragment = document.createDocumentFragment();
        points.forEach((point, index) => {
          const projected = projectPoint(point, center);
          const jitter = ((index % 4) - 1.5) * 0.18;
          const circle = createSvgNode("circle", {
            cx: projected.x + jitter,
            cy: projected.y - jitter * 0.5,
            r: options.radius,
            fill: options.fill,
            opacity: options.opacity,
          });
          fragment.appendChild(circle);
        });
        layer.appendChild(fragment);
      };

      const cubicBezierPoint = (p0, p1, p2, p3, t) => {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        return {
          x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
          y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
        };
      };

      const renderRealReference = () => {
        drawEllipse(realEllipseLayer, centers.real, targetCovariance, {
          fill: "rgba(17, 24, 39, 0.08)",
          fillOpacity: 1,
          stroke: "rgba(17, 24, 39, 0.84)",
          strokeOpacity: 0.86,
          strokeWidth: 2.1,
          halo: "rgba(17, 24, 39, 0.05)",
          haloOpacity: 1,
          dasharray: "0",
        });
        drawPointCloud(realPointsLayer, realPoints, centers.real, {
          radius: 4.6,
          fill: "rgba(17, 24, 39, 0.86)",
          opacity: 0.9,
        });
      };

      const renderFrame = (elapsedMs) => {
        const capped = elapsedMs >= cycleDuration ? cycleDuration : elapsedMs;
        const holding = capped >= totalRounds * roundDuration;
        const roundIndex = holding ? totalRounds - 1 : Math.floor(capped / roundDuration);
        const roundElapsed = holding ? roundDuration : capped - roundIndex * roundDuration;
        const local = clamp(roundElapsed / roundDuration, 0, 1);
        const acceptProgress = holding ? 1 : ease((local - 0.14) / 0.74);
        const transferProgress = holding ? 1 : ease((local - 0.24) / 0.44);
        const candidateStillInPool = !holding && local < 0.32;

        const stateBefore = states[holding ? totalRounds : roundIndex];
        const stateAfter = states[holding ? totalRounds : roundIndex + 1];
        const activePlan = holding ? null : selectionPlan[roundIndex];
        const currentMatrix = holding
          ? stateBefore.visualMatrix
          : lerpMatrix(stateBefore.visualMatrix, stateAfter.visualMatrix, acceptProgress);
        const currentGap = holding
          ? stateBefore.gapRatio
          : lerp(stateBefore.gapRatio, stateAfter.gapRatio, acceptProgress);
        const currentRotation = holding
          ? stateBefore.rotationDiff
          : lerp(stateBefore.rotationDiff, stateAfter.rotationDiff, acceptProgress);
        const currentCount = holding
          ? totalRounds
          : lerp(stateBefore.count, stateAfter.count, acceptProgress);

        drawEllipse(selectedEllipseLayer, centers.selected, currentMatrix, {
          fill: "rgba(45, 212, 191, 0.14)",
          fillOpacity: 1,
          stroke: "rgba(13, 148, 136, 0.94)",
          strokeOpacity: 1,
          strokeWidth: 2.6,
          halo: "rgba(45, 212, 191, 0.16)",
          haloOpacity: 1,
          dasharray: "8 10",
        });

        poolPointsLayer.replaceChildren();
        const poolFragment = document.createDocumentFragment();
        poolPoints.forEach((point, index) => {
          const isAccepted = stateBefore.selected.includes(point) || (holding && stateAfter.selected.includes(point));
          const isCandidate = activePlan && index === activePlan.candidateIndex;
          if (isAccepted || (isCandidate && !candidateStillInPool)) return;
          const projected = projectPoint(point, centers.pool);
          const pulse = isCandidate ? 1 + Math.sin(elapsedMs / 180) * 0.18 : 1;
          if (isCandidate) {
            poolFragment.appendChild(
              createSvgNode("circle", {
                cx: projected.x,
                cy: projected.y,
                r: 11 * pulse,
                fill: "rgba(45, 212, 191, 0.14)",
              })
            );
          }
          poolFragment.appendChild(
            createSvgNode("circle", {
              cx: projected.x,
              cy: projected.y,
              r: isCandidate ? 5.8 : 4.3,
              fill: isCandidate ? "rgba(13, 148, 136, 0.98)" : "rgba(15, 23, 42, 0.18)",
              opacity: isCandidate ? 1 : 0.72,
            })
          );
        });
        poolPointsLayer.appendChild(poolFragment);

        drawPointCloud(selectedPointsLayer, stateBefore.selected, centers.selected, {
          radius: 4.7,
          fill: "rgba(13, 148, 136, 0.94)",
          opacity: 0.9,
        });

        transferLayer.replaceChildren();
        if (activePlan && !candidateStillInPool) {
          const start = projectPoint(activePlan.candidate, centers.pool);
          const end = projectPoint(activePlan.candidate, centers.selected);
          const controlA = { x: lerp(start.x, end.x, 0.32), y: start.y - 32 };
          const controlB = { x: lerp(start.x, end.x, 0.74), y: end.y - 30 };
          const moving = cubicBezierPoint(start, controlA, controlB, end, transferProgress);
          transferLayer.appendChild(
            createSvgNode("path", {
              d: `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`,
              fill: "none",
              stroke: "rgba(45, 212, 191, 0.18)",
              "stroke-width": 2,
              "stroke-linecap": "round",
            })
          );
          transferLayer.appendChild(
            createSvgNode("circle", {
              cx: moving.x,
              cy: moving.y,
              r: 12,
              fill: "rgba(45, 212, 191, 0.16)",
            })
          );
          transferLayer.appendChild(
            createSvgNode("circle", {
              cx: moving.x,
              cy: moving.y,
              r: 5.7,
              fill: "rgba(13, 148, 136, 1)",
            })
          );
        }

        if (gapMetric) gapMetric.textContent = currentGap.toFixed(2);
        if (rotationMetric) rotationMetric.textContent = `${Math.round((currentRotation * 180) / Math.PI)}°`;
        if (countMetric) countMetric.textContent = `${Math.floor(currentCount + 0.001)} / ${totalRounds}`;
      };

      renderRealReference();

      let running = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let rafId = null;
      let elapsed = 0;
      let lastTimestamp = 0;

      const syncControls = () => {
        if (toggleBtn) {
          toggleBtn.textContent = running ? "Pause" : "Play";
          toggleBtn.setAttribute("aria-pressed", running ? "true" : "false");
        }
      };

      const tick = (timestamp) => {
        if (!running) return;
        if (!lastTimestamp) lastTimestamp = timestamp;
        elapsed += timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        if (elapsed > cycleDuration) elapsed = 0;
        renderFrame(elapsed);
        rafId = window.requestAnimationFrame(tick);
      };

      const start = () => {
        if (running && rafId === null) {
          lastTimestamp = 0;
          rafId = window.requestAnimationFrame(tick);
        }
        syncControls();
      };

      const stop = () => {
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
        syncControls();
      };

      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          running = !running;
          if (running) start();
          else stop();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          elapsed = 0;
          lastTimestamp = 0;
          renderFrame(0);
          if (!running) syncControls();
        });
      }

      renderFrame(0);
      if (running) start();
      else syncControls();
    }

    initCovarianceDemo();
  });
})();
