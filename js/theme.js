(() => {
  const storageKey = "nko-theme";
  const root = document.documentElement;

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
  }

  const stored = localStorage.getItem(storageKey);
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(stored === "dark" || stored === "light" ? stored : preferred);

  window.NMKKTheme = {
    toggle() {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  });
})();
