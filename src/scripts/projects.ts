export function initProjectFilters(): void {
  const filterButtons = document.querySelectorAll<HTMLButtonElement>(
    "[data-project-filter]",
  );
  const projectCards = document.querySelectorAll<HTMLElement>(
    "[data-project-category]",
  );

  if (filterButtons.length === 0 || projectCards.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.projectFilter || "all";

      // Atualiza botões
      filterButtons.forEach((b) => {
        const isActive = b === btn;
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (isActive) {
          b.classList.add("border-accent", "text-accent", "bg-accent/10");
          b.classList.remove("border-border", "text-muted", "bg-transparent");
        } else {
          b.classList.remove("border-accent", "text-accent", "bg-accent/10");
          b.classList.add("border-border", "text-muted", "bg-transparent");
        }
      });

      // Filtra os cards sem conflitar com transforms de tilt 3D
      projectCards.forEach((card) => {
        const category = card.dataset.projectCategory;
        const matches = selected === "all" || category === selected;

        if (matches) {
          card.style.display = "";
          requestAnimationFrame(() => {
            card.style.opacity = "1";
          });
        } else {
          card.style.opacity = "0";
          setTimeout(() => {
            if (card.dataset.projectCategory !== selected && selected !== "all") {
              card.style.display = "none";
            }
          }, 180);
        }
      });
    });
  });
}
