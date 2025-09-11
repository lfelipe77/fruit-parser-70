// src/debugBlink.ts
const now = () => Math.round(performance.now());

console.log('[BLINKDBG] boot at', now());

/** 1) Detect any hard nav/reload */
const origReload = window.location.reload.bind(window.location);
(window.location as any).reload = (...args:any[]) => {
  console.log('[BLINKDBG] location.reload()', now(), args);
  return origReload(...args);
};
['assign','replace'].forEach((m)=>{
  const orig = (window.location as any)[m].bind(window.location);
  (window.location as any)[m] = (url:any)=>{
    console.log(`[BLINKDBG] location.${m} ->`, url, now());
    return orig(url);
  };
});

/** 2) Detect SPA navs and silent replacements */
const _ps = history.pushState.bind(history);
history.pushState = (...a:any[]) => {
  console.log('[BLINKDBG] history.pushState', a, now());
  return _ps(...a);
};
const _rs = history.replaceState.bind(history);
history.replaceState = (...a:any[]) => {
  console.log('[BLINKDBG] history.replaceState', a, now());
  return _rs(...a);
};

/** 3) Scroll reset detector */
let lastScrollY = window.scrollY;
setInterval(() => {
  const y = window.scrollY;
  if (y < lastScrollY && y <= 2) {
    console.log('[BLINKDBG] SCROLL RESET to top', { from: lastScrollY, to: y, t: now(), url: location.href });
  }
  lastScrollY = y;
}, 200);

/** 4) Visibility/focus (SW and auth sometimes fire on focus) */
['visibilitychange','focus','pageshow'].forEach(ev =>
  window.addEventListener(ev, () => console.log('[BLINKDBG]', ev, now()))
);

/** 5) Auth signals (if exported supabase exists) */
try {
  // @ts-ignore
  if (window.supabase?.auth?.onAuthStateChange) {
    // @ts-ignore
    window.supabase.auth.onAuthStateChange((event:any) => {
      console.log('[BLINKDBG] auth event:', event, now());
    });
  }
} catch {}

/** 6) Route re-mount detector for common root container */
const hookRemount = (selector: string) => {
  const el = document.querySelector(selector);
  if (!el) return;
  const obs = new MutationObserver(muts => {
    muts.forEach(m => {
      if (m.type === 'childList') {
        console.log('[BLINKDBG] DOM childList change under', selector, now());
      }
      if (m.type === 'attributes' && m.attributeName === 'class') {
        console.log('[BLINKDBG] class change on', selector, el?.getAttribute('class'), now());
      }
    });
  });
  obs.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
};
hookRemount('#root');