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

    // Theory slider: 3 levels
    const slider = document.getElementById("theorySlider");
    const meterText = document.getElementById("theoryMeterText");
    const panels = document.querySelectorAll(".theory-panel");
    const tags = document.querySelectorAll(".theory-tag");

    const labels = ["Intuition", "Main result", "More complete"];

    function setTheoryLevel(level) {
      panels.forEach(p => p.classList.remove("is-active"));
      const active = document.querySelector(`.theory-panel[data-level="${level}"]`);
      if (active) active.classList.add("is-active");

      tags.forEach(t => t.classList.remove("is-selected"));
      const activeTag = document.querySelector(`.theory-tag[data-level-label="${level}"]`);
      if (activeTag) activeTag.classList.add("is-selected");

      if (meterText) meterText.textContent = labels[level] || "";
    }

    if (slider) {
      setTheoryLevel(parseInt(slider.value, 10) || 0);
      slider.addEventListener("input", (e) => {
        const level = parseInt(e.target.value, 10) || 0;
        setTheoryLevel(level);
      });
    }
  });
})();