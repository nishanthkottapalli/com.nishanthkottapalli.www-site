(() => {
  const storageKey = "nko-theme";
  const root = document.documentElement;

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
  }

  const stored = localStorage.getItem(storageKey);
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  setTheme(
    stored === "dark" || stored === "light"
      ? stored
      : preferred,
  );

  window.NMKKTheme = {
    toggle() {
      setTheme(
        root.dataset.theme === "dark"
          ? "light"
          : "dark",
      );
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  });
})();


(() => {
  "use strict";

  const MODIFIER_ACTIVE = "ac-active";
  const MOBILE_QUERY = "(max-width: 1000px)";

  const modulo = (value, divisor) =>
    ((value % divisor) + divisor) % divisor;

  const signedDistance = (
    index,
    activeIndex,
    length,
  ) => {
    let distance = index - activeIndex;

    if (distance > length / 2) {
      distance -= length;
    }

    if (distance < -length / 2) {
      distance += length;
    }

    return distance;
  };

  const initialiseCarousel = (root) => {
    const slides = Array.from(
      root.querySelectorAll("[data-carousel-slide]"),
    );

    const dotsContainer = root.querySelector(
      "[data-carousel-dots]",
    );

    const stage = root.querySelector(
      "[data-carousel-stage]",
    );

    const exportButton = root.querySelector(
      "[data-carousel-export]",
    );

    const status = root.querySelector(
      "[data-carousel-status]",
    );

    const previousButtons = Array.from(
      root.querySelectorAll("[data-carousel-prev]"),
    );

    const nextButtons = Array.from(
      root.querySelectorAll("[data-carousel-next]"),
    );

    const mobile = window.matchMedia(MOBILE_QUERY);

    if (
      !slides.length ||
      !dotsContainer ||
      !stage
    ) {
      return;
    }

    let activeIndex = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let dragging = false;

    const dots = slides.map((_, index) => {
      const button = document.createElement("button");

      button.className = "ac-dot";
      button.type = "button";

      button.setAttribute(
        "aria-label",
        `Go to slide ${index + 1}`,
      );

      button.addEventListener("click", () => {
        goTo(index);
      });

      dotsContainer.appendChild(button);

      return button;
    });

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const layout = () => {
      const compact = mobile.matches;

      slides.forEach((slide, index) => {
        const distance = signedDistance(
          index,
          activeIndex,
          slides.length,
        );

        const absoluteDistance = Math.abs(distance);
        const visible = absoluteDistance <= 2;
        const active = index === activeIndex;

        slide.classList.toggle(
          MODIFIER_ACTIVE,
          active,
        );

        slide.setAttribute(
          "aria-hidden",
          active ? "false" : "true",
        );

        slide.style.zIndex = String(
          100 - absoluteDistance,
        );

        if (compact) {
          slide.style.removeProperty("--ac-x");
          slide.style.removeProperty("--ac-z");
          slide.style.removeProperty("--ac-rotation");
          slide.style.removeProperty("--ac-scale");
          slide.style.removeProperty("--ac-opacity");
        } else {
          slide.style.setProperty(
            "--ac-x",
            `${distance * 300}px`,
          );

          slide.style.setProperty(
            "--ac-z",
            `${-absoluteDistance * 190}px`,
          );

          slide.style.setProperty(
            "--ac-rotation",
            `${distance * -18}deg`,
          );

          slide.style.setProperty(
            "--ac-scale",
            `${Math.max(
              0.74,
              1 - absoluteDistance * 0.08,
            )}`,
          );

          slide.style.setProperty(
            "--ac-opacity",
            visible
              ? `${Math.max(
                  0.16,
                  1 - absoluteDistance * 0.25,
                )}`
              : "0",
          );
        }
      });

      dots.forEach((dot, index) => {
        const active = index === activeIndex;

        dot.classList.toggle(
          MODIFIER_ACTIVE,
          active,
        );

        dot.setAttribute(
          "aria-current",
          active ? "true" : "false",
        );
      });

      setStatus(
        `Slide ${activeIndex + 1} of ${slides.length}`,
      );
    };

    function goTo(index) {
      activeIndex = modulo(
        index,
        slides.length,
      );

      layout();
    }

    const next = () => {
      goTo(activeIndex + 1);
    };

    const previous = () => {
      goTo(activeIndex - 1);
    };

    nextButtons.forEach((button) => {
      button.addEventListener("click", next);
    });

    previousButtons.forEach((button) => {
      button.addEventListener("click", previous);
    });

    stage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goTo(slides.length - 1);
      }
    });

    stage.addEventListener(
      "pointerdown",
      (event) => {
        dragging = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
      },
      {
        passive: true,
      },
    );

    stage.addEventListener(
      "pointerup",
      (event) => {
        if (!dragging) {
          return;
        }

        dragging = false;

        const deltaX =
          event.clientX - pointerStartX;

        const deltaY =
          event.clientY - pointerStartY;

        const horizontalSwipe =
          Math.abs(deltaX) > 45 &&
          Math.abs(deltaX) >
            Math.abs(deltaY) * 1.35;

        if (horizontalSwipe) {
          if (deltaX < 0) {
            next();
          } else {
            previous();
          }
        }
      },
      {
        passive: true,
      },
    );

    stage.addEventListener(
      "pointercancel",
      () => {
        dragging = false;
      },
    );

    const handleMediaChange = () => {
      layout();
    };

    if (
      typeof mobile.addEventListener === "function"
    ) {
      mobile.addEventListener(
        "change",
        handleMediaChange,
      );
    } else {
      mobile.addListener(handleMediaChange);
    }

    const exportCurrentSlide = async () => {
      if (!exportButton) {
        return;
      }

      const poster = slides[
        activeIndex
      ].querySelector(".ac-poster");

      if (!poster) {
        return;
      }

      const originalLabel =
        exportButton.textContent;

      let exportLayer = null;

      exportButton.disabled = true;
      exportButton.textContent = "Exporting…";

      setStatus(
        `Exporting slide ${activeIndex + 1}`,
      );

      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        if (!window.html2canvas) {
          throw new Error(
            "html2canvas is unavailable.",
          );
        }

        const clone = poster.cloneNode(true);

        clone
          .querySelectorAll("[id]")
          .forEach((element) => {
            element.removeAttribute("id");
          });

        exportLayer =
          document.createElement("div");

        exportLayer.className =
          "ac-export-neutral-layer arts-carousel";

        exportLayer.appendChild(clone);
        document.body.appendChild(exportLayer);

        document.body.classList.add(
          "ac-is-exporting",
        );

        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });

        const canvas =
          await window.html2canvas(clone, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width: 540,
            height: 960,
            windowWidth: 540,
            windowHeight: 960,
          });

        const blob = await new Promise(
          (resolve) => {
            canvas.toBlob(
              resolve,
              "image/png",
            );
          },
        );

        if (!blob) {
          throw new Error(
            "The browser could not create the PNG file.",
          );
        }

        const download =
          document.createElement("a");

        const baseName =
          root.dataset.exportFilename ||
          "arts-carousel";

        download.download =
          `${baseName}-slide-` +
          `${String(activeIndex + 1).padStart(
            2,
            "0",
          )}.png`;

        download.href =
          URL.createObjectURL(blob);

        document.body.appendChild(download);
        download.click();

        window.setTimeout(() => {
          URL.revokeObjectURL(download.href);
          download.remove();
        }, 300);

        setStatus(
          `Slide ${activeIndex + 1} exported as PNG`,
        );
      } catch (error) {
        console.error(
          "Carousel export failed:",
          error,
        );

        setStatus(
          "Export failed. Check the browser console for details.",
        );
      } finally {
        document.body.classList.remove(
          "ac-is-exporting",
        );

        exportLayer?.remove();

        exportButton.disabled = false;
        exportButton.textContent =
          originalLabel;
      }
    };

    exportButton?.addEventListener(
      "click",
      exportCurrentSlide,
    );

    layout();
  };

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      document
        .querySelectorAll("[data-carousel]")
        .forEach(initialiseCarousel);
    },
  );
})();