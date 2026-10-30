export function initScrollSpy(): void {
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("header nav a[href^='#']"),
  );
  if (navLinks.length === 0) return;

  const sectionIds = navLinks
    .map((link) => link.getAttribute("href")?.replace("#", ""))
    .filter(Boolean) as string[];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (sections.length === 0) return;

  const setActive = (id: string | null) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const isMatch = id ? href === `#${id}` : false;
      if (isMatch) {
        link.classList.add("text-accent", "bg-white/5");
        link.classList.remove("text-muted");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("text-accent", "bg-white/5");
        link.classList.add("text-muted");
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0 && visible[0]?.target.id) {
        setActive(visible[0].target.id);
      } else if (window.scrollY < 200) {
        setActive(null);
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    },
  );

  sections.forEach((section) => observer.observe(section));

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < 120) setActive(null);
    },
    { passive: true },
  );
}
