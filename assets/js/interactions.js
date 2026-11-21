(() => {
  "use strict";
  const initSteppers = () => {
    document.querySelectorAll("[data-stepper]").forEach((root) => {
      const buttons = [...root.querySelectorAll("[data-step-target]")];
      const panels = [...root.querySelectorAll("[data-step-panel]")];
      if (!buttons.length || !panels.length) return;
      const activate = (name) => {
        buttons.forEach((button) => {
          const active = button.dataset.stepTarget === name;
          button.setAttribute("aria-pressed", String(active));
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.stepPanel !== name;
        });
      };
      buttons.forEach((button) => {
        button.addEventListener("click", () => activate(button.dataset.stepTarget));
      });
      const initial = buttons.find((button) => button.getAttribute("aria-pressed") === "true") || buttons[0];
      activate(initial.dataset.stepTarget);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSteppers, { once: true });
  } else {
    initSteppers();
  }
})();
