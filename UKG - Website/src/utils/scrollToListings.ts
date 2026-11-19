/**
 * Smoothly scrolls the viewport to the exact start of the property listings section,
 * dynamically accounting for any fixed or sticky navigation header so the first
 * property card / section heading is never hidden underneath the navbar.
 */
export function scrollToPropertyListingsStart(targetId: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const performScroll = () => {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Measure active sticky/fixed navigation header height on desktop, tablet & mobile
    let headerOffset = 84;
    const mainNav = document.getElementById('main-navbar');
    if (mainNav) {
      const navRect = mainNav.getBoundingClientRect();
      if (navRect.height > 0) {
        headerOffset = navRect.height + 16;
      }
    } else {
      const stickyHeader = document.querySelector('header.sticky, header.fixed') as HTMLElement | null;
      if (stickyHeader) {
        const headerRect = stickyHeader.getBoundingClientRect();
        if (headerRect.height > 0) {
          headerOffset = headerRect.height + 16;
        }
      }
    }

    const rect = targetEl.getBoundingClientRect();
    const destinationTop = Math.max(0, Math.round(rect.top + window.scrollY - headerOffset));

    window.scrollTo({
      top: destinationTop,
      behavior: 'smooth',
    });
  };

  // Wait one animation frame so newly paginated cards finish rendering before measuring layout
  window.requestAnimationFrame(() => {
    performScroll();
  });
}

/**
 * Reads the current positive integer `page` query parameter from the URL (defaults to 1).
 */
export function readPageParamFromUrl(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = new URLSearchParams(window.location.search).get('page');
    if (raw && /^\d+$/.test(raw.trim())) {
      const parsed = parseInt(raw.trim(), 10);
      if (parsed >= 1) return parsed;
    }
  } catch {}
  return 1;
}

/**
 * Updates pagination and filter query parameters in the browser URL bar using
 * `history.replaceState` without triggering any page reload, preserving existing parameters.
 */
export function syncListingsUrlParams(
  updates: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === undefined || val === '' || val === false) {
        url.searchParams.delete(key);
      } else if (key === 'page' && Number(val) <= 1) {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set(key, String(val));
      }
    }
    const nextRelative = `${url.pathname}${url.search}${url.hash}`;
    const currentRelative = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextRelative !== currentRelative) {
      window.history.replaceState(window.history.state, '', nextRelative);
    }
  } catch {}
}
