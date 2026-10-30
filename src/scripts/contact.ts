export function initContact(): void {
  const btn = document.getElementById("copy-email-btn");
  const label = document.getElementById("copy-email-label");
  if (!btn || !label) return;

  const email = btn.dataset.copyText || "";
  let timeout: number | undefined;

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      const original = label.textContent;
      label.textContent = "✓ Copiado!";
      btn.classList.add("border-accent-2", "text-accent-2");

      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        label.textContent = original;
        btn.classList.remove("border-accent-2", "text-accent-2");
      }, 2000);
    } catch {
      // Fallback para mailto caso clipboard seja restrito
      window.location.href = `mailto:${email}`;
    }
  });
}
