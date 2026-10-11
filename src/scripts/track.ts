// Privacy-friendly events (Plausible). Does nothing when analytics is off.
declare global { interface Window { plausible?: (e: string, o?: { props: Record<string, string> }) => void } }

export function track(event: string, props: Record<string, string> = {}) {
  const page = document.body.dataset.page || '';
  try { window.plausible?.(event, { props: { calculator: page, ...props } }); } catch {}
}
