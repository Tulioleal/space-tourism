export function initTabSwitcher(buttonSelector: string): void {
  const buttons = window.document.querySelectorAll(buttonSelector);
  const panels = window.document.querySelectorAll(".content-panel");
  const groupSize = buttons.length;

  buttons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      panels.forEach((p) => p.setAttribute("data-visible", "false"));
      panels[i]?.setAttribute("data-visible", "true");
      panels[i + groupSize]?.setAttribute("data-visible", "true");
    });
  });
}
