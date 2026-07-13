/**
 * Telemetry simulation.
 * No real network calls are made — every "ping" is a console log
 * standing in for a future analytics integration. Naming is kept
 * consistent (verb: object) so a real pipeline could adopt it as-is.
 */
const Analytics = (() => {
  function log(action, detail = {}) {
    // eslint-disable-next-line no-console
    console.log(
      `[Analytics] User interacted with Independent Bookstore Events Page — ${action}`,
      detail
    );
  }

  return { log };
})();
