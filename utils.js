/**
 * Shared utility helpers: input sanitization, formatting, debounce.
 * Kept dependency-free per the vanilla-stack requirement.
 */
const Utils = (() => {

  /**
   * Escapes a string for safe insertion into HTML text content.
   * Used on every piece of user-supplied or event data before it is
   * ever written into the DOM, to prevent stored/reflected XSS.
   */
  function sanitizeText(input) {
    if (input === null || input === undefined) return "";
    const div = document.createElement("div");
    div.textContent = String(input);
    return div.innerHTML;
  }

  /**
   * Strips anything that isn't plain printable text from a value
   * before it is stored in application state (e.g. form fields).
   * This runs in addition to, not instead of, textContent-based
   * rendering later.
   */
  function sanitizeForStorage(input) {
    if (input === null || input === undefined) return "";
    return String(input)
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .trim();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function formatDate(isoDate) {
    const d = new Date(`${isoDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function formatTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  }

  function debounce(fn, wait = 200) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function categoryLabel(category) {
    const labels = {
      reading: "Reading",
      workshop: "Workshop",
      panel: "Panel",
      "book-club": "Book club",
      kids: "Kids"
    };
    return labels[category] || category;
  }

  return {
    sanitizeText,
    sanitizeForStorage,
    isValidEmail,
    formatDate,
    formatTime,
    debounce,
    categoryLabel
  };
})();
