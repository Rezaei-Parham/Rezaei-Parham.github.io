(function () {
  const storageKey = "parham-site-theme";
  const root = document.documentElement;
  let toggle = document.querySelector("[data-theme-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeColors = {
    light: "#f3f6f4",
    dark: "#101417",
  };

  function createPageToggle() {
    const button = document.createElement("button");
    button.className = "theme-toggle theme-toggle--page";
    button.type = "button";
    button.setAttribute("data-theme-toggle", "");
    button.innerHTML = [
      '<svg class="theme-toggle__icon theme-toggle__icon--sun" viewBox="0 0 24 24" aria-hidden="true">',
      '<path d="M12 5.4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Zm0 2.2a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8Z"></path>',
      '<path d="M12 1.8c.42 0 .76.34.76.76v1.25a.76.76 0 0 1-1.52 0V2.56c0-.42.34-.76.76-.76Zm0 17.63c.42 0 .76.34.76.76v1.25a.76.76 0 0 1-1.52 0v-1.25c0-.42.34-.76.76-.76ZM3.83 3.83c.3-.3.78-.3 1.08 0l.88.88a.76.76 0 1 1-1.08 1.08l-.88-.88a.76.76 0 0 1 0-1.08Zm14.38 14.38c.3-.3.78-.3 1.08 0l.88.88a.76.76 0 1 1-1.08 1.08l-.88-.88a.76.76 0 0 1 0-1.08ZM1.8 12c0-.42.34-.76.76-.76h1.25a.76.76 0 0 1 0 1.52H2.56A.76.76 0 0 1 1.8 12Zm17.63 0c0-.42.34-.76.76-.76h1.25a.76.76 0 0 1 0 1.52h-1.25a.76.76 0 0 1-.76-.76ZM5.79 18.21c.3.3.3.78 0 1.08l-.88.88a.76.76 0 1 1-1.08-1.08l.88-.88c.3-.3.78-.3 1.08 0Zm14.38-14.38c.3.3.3.78 0 1.08l-.88.88a.76.76 0 1 1-1.08-1.08l.88-.88c.3-.3.78-.3 1.08 0Z"></path>',
      "</svg>",
      '<svg class="theme-toggle__icon theme-toggle__icon--moon" viewBox="0 0 24 24" aria-hidden="true">',
      '<path d="M20.7 14.32a.86.86 0 0 1 .16.9 9.4 9.4 0 1 1-12.08-12.08.86.86 0 0 1 1.07 1.13 7.65 7.65 0 0 0 9.88 9.88.86.86 0 0 1 .97.17ZM12 4.3a7.69 7.69 0 1 0 7.7 7.7 9.38 9.38 0 0 1-7.7-7.7Z"></path>',
      "</svg>",
    ].join("");
    document.body.appendChild(button);
    return button;
  }

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function storedTheme() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      return;
    }
  }

  function applyTheme(theme, persist) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", nextTheme);
    if (themeMeta) {
      themeMeta.setAttribute("content", themeColors[nextTheme]);
    }
    if (toggle) {
      const isDark = nextTheme === "dark";
      const label = isDark ? "Switch to light mode" : "Switch to dark mode";
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("title", label);
    }
    if (persist) {
      saveTheme(nextTheme);
    }
  }

  if (!toggle) {
    toggle = createPageToggle();
  }

  applyTheme(root.getAttribute("data-theme") || storedTheme() || systemTheme(), false);

  if (toggle) {
    toggle.addEventListener("click", () => {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  }

  if (window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (!storedTheme()) {
        applyTheme(systemTheme(), false);
      }
    };
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleSystemThemeChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(handleSystemThemeChange);
    }
  }
})();
