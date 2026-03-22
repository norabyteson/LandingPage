function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function smoothScrollTo(target: Element, duration = 370): void {
  const scrollPaddingTop =
    parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 96;

  const startY = window.scrollY;
  const targetY = startY + target.getBoundingClientRect().top - scrollPaddingTop;
  const distance = targetY - startY;

  let startTime: number | null = null;

  function step(now: number) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuart(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
