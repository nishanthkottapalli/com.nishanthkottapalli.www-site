(() => {
  const current = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-links a.pill").forEach((link) => {
      const target = (link.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (target === current) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  });
})();
