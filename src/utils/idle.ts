/**
 * Run `fn` once the browser is idle — i.e. after the first paint and after any
 * pending input work. Falls back to a short timeout where
 * `requestIdleCallback` is missing (Safari / older WebViews).
 * Returns a cancel function, ready to be used as a useEffect cleanup.
 */
export function onIdle(fn: () => void, timeout = 2000): () => void {
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;

  if (typeof ric === "function") {
    const id = ric(fn, { timeout });
    return () => {
      const cic = (
        window as Window & { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback;
      cic?.(id);
    };
  }

  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}
