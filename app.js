(() => {
  "use strict";

  /* ---------------------------------------------------------
     State
  --------------------------------------------------------- */
  const state = {
    allEvents: [],
    query: "",
    category: "all",
    sort: "date-asc",
    status: "loading", // loading | ready | empty | error
    lastFocusedBeforeDialog: null
  };

  /* ---------------------------------------------------------
     DOM references
  --------------------------------------------------------- */
  const els = {
    navToggle: document.getElementById("navToggle"),
    siteNav: document.getElementById("primary-nav"),
    searchInput: document.getElementById("searchInput"),
    chipGroup: document.getElementById("categoryChips"),
    sortSelect: document.getElementById("sortSelect"),
    resultsCount: document.getElementById("resultsCount"),
    resetFilters: document.getElementById("resetFilters"),
    clearFromEmpty: document.getElementById("clearFromEmpty"),
    skeletonGrid: document.getElementById("skeletonGrid"),
    errorPanel: document.getElementById("errorPanel"),
    emptyPanel: document.getElementById("emptyPanel"),
    eventGrid: document.getElementById("eventGrid"),
    retryLoad: document.getElementById("retryLoad"),
    statusRegion: document.getElementById("statusRegion"),

    glanceTotal: document.getElementById("glanceTotal"),
    glanceSeats: document.getElementById("glanceSeats"),
    glanceNext: document.getElementById("glanceNext"),
    glanceCategories: document.getElementById("glanceCategories"),

    dialogBackdrop: document.getElementById("dialogBackdrop"),
    dialog: document.getElementById("eventDialog"),
    dialogClose: document.getElementById("dialogClose"),
    dialogCancel: document.getElementById("dialogCancel"),
    dialogCategory: document.getElementById("dialogCategory"),
    dialogTitle: document.getElementById("dialogTitle"),
    dialogFacts: document.getElementById("dialogFacts"),
    dialogDescription: document.getElementById("dialogDescription"),
    dialogImage: document.getElementById("dialogImage"),
    dialogDifficulty: document.getElementById("dialogDifficulty"),
    dialogAvatar: document.getElementById("dialogAvatar"),
    dialogHostName: document.getElementById("dialogHostName"),
    dialogTags: document.getElementById("dialogTags"),
    dialogMap: document.getElementById("dialogMap"),

    rsvpForm: document.getElementById("rsvpForm"),
    rsvpName: document.getElementById("rsvpName"),
    rsvpEmail: document.getElementById("rsvpEmail"),
    rsvpGuests: document.getElementById("rsvpGuests"),
    rsvpNotes: document.getElementById("rsvpNotes"),
    formFeedback: document.getElementById("formFeedback")
  };

  let activeEventId = null;

  /* ---------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------- */
  function closeMobileMenu() {
    els.siteNav.classList.remove("is-open");
    els.navToggle.setAttribute("aria-expanded", "false");
  }

  els.navToggle.addEventListener("click", () => {
    const isOpen = els.siteNav.classList.toggle("is-open");
    els.navToggle.setAttribute("aria-expanded", isOpen);
  });

  els.siteNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });
  /* ---------------------------------------------------------
     Data loading
  --------------------------------------------------------- */
  function setStatus(next) {
    state.status = next;
    els.skeletonGrid.hidden = next !== "loading";
    els.errorPanel.hidden = next !== "error";
    els.emptyPanel.hidden = next !== "empty";
    els.eventGrid.hidden = next !== "ready";
  }

  function loadEvents(opts = {}) {
    setStatus("loading");
    els.resultsCount.textContent = "Loading events…";
    fetchEvents(opts)
      .then(events => {
        state.allEvents = events;
        Analytics.log("events loaded", { count: events.length });
        renderList();
        renderGlance(events);
      })
      .catch(() => {
        setStatus("error");
        els.resultsCount.textContent = "Couldn't load events.";
        announce("The event schedule failed to load.");
      });
  }

  /* ---------------------------------------------------------
     At-a-glance stats strip
  --------------------------------------------------------- */
  function renderGlance(events) {
    if (!events.length) {
      els.glanceTotal.textContent = "0";
      els.glanceSeats.textContent = "0";
      els.glanceNext.textContent = "—";
      els.glanceCategories.textContent = "0";
      return;
    }

    const totalSeatsOpen = events.reduce((sum, evt) => sum + Math.max(evt.seatsTotal - evt.seatsTaken, 0), 0);
    const sortedByDate = events.slice().sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    const nextEvent = sortedByDate[0];
    const categoryCount = new Set(events.map(evt => evt.category)).size;

    animateCount(els.glanceTotal, events.length);
    animateCount(els.glanceSeats, totalSeatsOpen);
    els.glanceNext.textContent = Utils.formatDate(nextEvent.date);
    animateCount(els.glanceCategories, categoryCount);
  }

  /* ---------------------------------------------------------
     Smoothly counts a number element up from 0 to its target.
     Respects prefers-reduced-motion by jumping straight to the
     final value.
  --------------------------------------------------------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animateCount(el, target, duration = 900) {
    if (!el) return;
    if (prefersReducedMotion || target === 0) {
      el.textContent = String(target);
      return;
    }
    el.classList.add("is-counting");
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = String(target);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------
     Filtering / sorting / rendering
  --------------------------------------------------------- */
  function getFilteredEvents() {
    const q = state.query.trim().toLowerCase();
    let list = state.allEvents.filter(evt => {
      const matchesCategory = state.category === "all" || evt.category === state.category;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = `${evt.title} ${evt.author} ${evt.description}`.toLowerCase();
      return haystack.includes(q);
    });

    list = list.slice().sort((a, b) => {
      switch (state.sort) {
        case "date-desc":
          return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "availability":
          return (b.seatsTotal - b.seatsTaken) - (a.seatsTotal - a.seatsTaken);
        case "date-asc":
        default:
          return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
      }
    });

    return list;
  }

  function renderList() {
    const filtered = getFilteredEvents();

    if (filtered.length === 0) {
      setStatus("empty");
      els.resultsCount.textContent = "0 events match your search.";
      return;
    }

    setStatus("ready");
    els.resultsCount.textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"} found`;
    els.eventGrid.innerHTML = filtered.map(cardTemplate).join("");

    els.eventGrid.querySelectorAll("[data-open-event]").forEach(btn => {
      btn.addEventListener("click", () => openEventDialog(btn.getAttribute("data-open-event")));
    });
  }

  function cardTemplate(evt) {
    const seatsLeft = evt.seatsTotal - evt.seatsTaken;
    const lowSeats = seatsLeft <= 3 && seatsLeft > 0;
    const full = seatsLeft <= 0;
    const seatsLabel = full ? "Full" : `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`;
    const categoryLabel = Utils.sanitizeText(Utils.categoryLabel(evt.category));

    return `
      <li class="event-grid__item">
        <article class="event-card">
          <button type="button" class="event-card__button" data-open-event="${Utils.sanitizeText(evt.id)}"
                  aria-label="View details and RSVP for ${Utils.sanitizeText(evt.title)}">
            ${evt.image ? `
            <span class="event-card__thumb">
              <img src="${Utils.sanitizeText(evt.image)}" alt="" loading="lazy">
              <span class="event-card__badge">${categoryLabel}</span>
              ${evt.isNew ? `<span class="event-card__badge event-card__badge--new">New</span>` : ""}
            </span>` : ""}
            <p class="event-card__index">${categoryLabel}</p>
            <h3 class="event-card__title">${Utils.sanitizeText(evt.title)}</h3>
            <p class="event-card__meta">
              <span>${Utils.sanitizeText(Utils.formatDate(evt.date))} · ${Utils.sanitizeText(Utils.formatTime(evt.time))}</span>
              <span>${Utils.sanitizeText(evt.location)}</span>
            </p>
            <p class="event-card__desc">${Utils.sanitizeText(evt.description)}</p>
            <span class="event-card__footer">
              <span class="event-card__author">${Utils.sanitizeText(evt.author)}</span>
              <span class="event-card__seats${lowSeats || full ? " is-low" : ""}">${seatsLabel}</span>
            </span>
          </button>
          <div class="event-card__loading" aria-hidden="true">
            <span class="event-card__loading-icon">📖</span>
            <span class="event-card__loading-text">Opening event…</span>
            <span class="event-card__loading-bar"><span></span></span>
          </div>
        </article>
      </li>
    `;
  }

  function announce(message) {
    els.statusRegion.textContent = message;
  }

  /* ---------------------------------------------------------
     Search / filter / sort event wiring
  --------------------------------------------------------- */
  const debouncedSearch = Utils.debounce(value => {
    state.query = value;
    Analytics.log("search", { query: value });
    renderList();
  }, 220);

  els.searchInput.addEventListener("input", e => {
    debouncedSearch(Utils.sanitizeForStorage(e.target.value));
  });

  els.chipGroup.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    els.chipGroup.querySelectorAll(".chip").forEach(c => {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");
    state.category = chip.getAttribute("data-category");
    Analytics.log("filter", { category: state.category });
    renderList();
  });

  els.sortSelect.addEventListener("change", e => {
    state.sort = e.target.value;
    Analytics.log("sort", { sort: state.sort });
    renderList();
  });

  function resetFilters() {
    state.query = "";
    state.category = "all";
    state.sort = "date-asc";
    els.searchInput.value = "";
    els.sortSelect.value = "date-asc";
    els.chipGroup.querySelectorAll(".chip").forEach(c => {
      const isAll = c.getAttribute("data-category") === "all";
      c.classList.toggle("is-active", isAll);
      c.setAttribute("aria-pressed", String(isAll));
    });
    renderList();
    announce("Filters cleared.");
  }

  els.resetFilters.addEventListener("click", resetFilters);
  els.clearFromEmpty.addEventListener("click", resetFilters);
  els.retryLoad.addEventListener("click", () => loadEvents());

  /* ---------------------------------------------------------
     Event detail dialog
  --------------------------------------------------------- */
  function openEventDialog(eventId) {
    const evt = state.allEvents.find(e => e.id === eventId);
    if (!evt) return;

    activeEventId = eventId;
    state.lastFocusedBeforeDialog = document.activeElement;

    els.dialogCategory.textContent = Utils.categoryLabel(evt.category);
    els.dialogTitle.textContent = evt.title;
    els.dialogDescription.textContent = evt.description;

    const seatsLeft = evt.seatsTotal - evt.seatsTaken;
    els.dialogFacts.innerHTML = `
      <dt>Date</dt><dd>${Utils.sanitizeText(Utils.formatDate(evt.date))}</dd>
      <dt>Time</dt><dd>${Utils.sanitizeText(Utils.formatTime(evt.time))}</dd>
      <dt>Location</dt><dd>${Utils.sanitizeText(evt.location)}</dd>
      <dt>Host</dt><dd>${Utils.sanitizeText(evt.author)}</dd>
      <dt>Duration</dt><dd>${Utils.sanitizeText(evt.duration || "—")}</dd>
      <dt>Seats</dt><dd>${seatsLeft > 0 ? `${seatsLeft} of ${evt.seatsTotal} remaining` : "Fully booked"}</dd>
    `;

    // Image + difficulty badge
    if (els.dialogImage) {
      if (evt.image) {
        els.dialogImage.src = evt.image;
        els.dialogImage.alt = `Photo from ${Utils.sanitizeText(evt.title)}`;
        els.dialogImage.closest(".dialog__media").hidden = false;
      } else {
        els.dialogImage.closest(".dialog__media").hidden = true;
      }
    }
    if (els.dialogDifficulty) {
      els.dialogDifficulty.textContent = evt.difficulty || "";
    }

    // Host avatar (initials) + name
    if (els.dialogAvatar && els.dialogHostName) {
      const hostName = evt.author || "";
      const initials = hostName
        .replace(/^(Facilitated by|Hosted by|Read by)\s*/i, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0])
        .join("")
        .toUpperCase();
      els.dialogAvatar.textContent = initials || "?";
      els.dialogHostName.textContent = Utils.sanitizeText(hostName);
    }

    // Tags
    if (els.dialogTags) {
      const tags = Array.isArray(evt.tags) ? evt.tags : [];
      els.dialogTags.innerHTML = tags
        .map(tag => `<li>${Utils.sanitizeText(tag)}</li>`)
        .join("");
    }

    // Map: re-point the embed at this event's location within the store
    if (els.dialogMap) {
      const query = encodeURIComponent(`${evt.location}, 412 Kestrel Street, Linden Falls`);
      els.dialogMap.src = `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
    // Find the clicked card
    const card = document
      .querySelector(`[data-open-event="${eventId}"]`)
      ?.closest(".event-card");

    // Start the book opening animation
    if (card) {
      card.classList.add("opening");
    }

    resetRsvpForm();
    if (seatsLeft <= 0) {
      document.getElementById("rsvpSubmit").disabled = true;
      els.formFeedback.textContent = "This event is fully booked, but you can join the waitlist by contacting the front desk.";
      els.formFeedback.className = "form-feedback";
    } else {
      document.getElementById("rsvpSubmit").disabled = false;
    }

    setTimeout(() => {
      els.dialogBackdrop.hidden = false;
      document.body.style.overflow = "hidden";
      els.dialogClose.focus();
      document.addEventListener("keydown", handleDialogKeydown);
      Analytics.log("event detail viewed", { eventId });
    }, 800);
  }

  function closeEventDialog() {
    els.dialogBackdrop.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", handleDialogKeydown);
    if (state.lastFocusedBeforeDialog) {
      state.lastFocusedBeforeDialog.focus();
    }
    document
      .querySelectorAll(".event-card.opening")
      .forEach(card => card.classList.remove("opening"));
    activeEventId = null;
  }

  function handleDialogKeydown(e) {
    if (e.key === "Escape") {
      closeEventDialog();
      return;
    }
    if (e.key === "Tab") {
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    const focusable = els.dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  els.dialogClose.addEventListener("click", closeEventDialog);
  els.dialogCancel.addEventListener("click", closeEventDialog);
  els.dialogBackdrop.addEventListener("click", e => {
    if (e.target === els.dialogBackdrop) closeEventDialog();
  });

  /* ---------------------------------------------------------
     RSVP form validation + simulated submit
  --------------------------------------------------------- */
  function resetRsvpForm() {
    els.rsvpForm.reset();
    els.formFeedback.textContent = "";
    els.formFeedback.className = "form-feedback";
    ["rsvpName", "rsvpEmail", "rsvpGuests"].forEach(id => {
      document.getElementById(id).closest(".form-row").classList.remove("has-error");
      document.getElementById(`${id}Error`).textContent = "";
    });
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.closest(".form-row").classList.add("has-error");
    document.getElementById(`${fieldId}Error`).textContent = message;
    field.setAttribute("aria-invalid", "true");
  }

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    field.closest(".form-row").classList.remove("has-error");
    document.getElementById(`${fieldId}Error`).textContent = "";
    field.removeAttribute("aria-invalid");
  }

  function validateForm() {
    let valid = true;

    const name = Utils.sanitizeForStorage(els.rsvpName.value);
    if (!name) {
      setFieldError("rsvpName", "Enter your full name.");
      valid = false;
    } else {
      clearFieldError("rsvpName");
    }

    const email = Utils.sanitizeForStorage(els.rsvpEmail.value);
    if (!email) {
      setFieldError("rsvpEmail", "Enter an email address.");
      valid = false;
    } else if (!Utils.isValidEmail(email)) {
      setFieldError("rsvpEmail", "Enter a valid email address, like name@example.com.");
      valid = false;
    } else {
      clearFieldError("rsvpEmail");
    }

    const guests = Number(els.rsvpGuests.value);
    if (!Number.isInteger(guests) || guests < 1 || guests > 6) {
      setFieldError("rsvpGuests", "Enter a number of seats between 1 and 6.");
      valid = false;
    } else {
      clearFieldError("rsvpGuests");
    }

    return valid;
  }

  els.rsvpForm.addEventListener("submit", e => {
    e.preventDefault();
    if (document.getElementById("rsvpSubmit").disabled) return;

    if (!validateForm()) {
      els.formFeedback.textContent = "Fix the highlighted fields and try again.";
      els.formFeedback.className = "form-feedback";
      const firstError = els.rsvpForm.querySelector(".has-error input");
      if (firstError) firstError.focus();
      return;
    }

    const submitBtn = document.getElementById("rsvpSubmit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Reserving…";

    // Simulated async submit (mirrors a real network call / spotty connection).
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Reserve seat";
      els.formFeedback.textContent = "Seat reserved. A confirmation has been sent.";
      els.formFeedback.className = "form-feedback is-success";
      Analytics.log("rsvp submitted", { eventId: activeEventId });
      announce("Your seat has been reserved.");
    }, 600);
  });

  ["rsvpName", "rsvpEmail", "rsvpGuests"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => clearFieldError(id));
  });

  /* ---------------------------------------------------------
     Hero slider — cross-fades through featured photos every
     4 seconds, with dot navigation. Pauses on hover/focus and
     respects prefers-reduced-motion.
  --------------------------------------------------------- */
  (function initHeroSlider() {
    const slidesEl = document.getElementById("heroSlides");
    const dotsEl = document.getElementById("heroDots");
    if (!slidesEl || !dotsEl) return;

    const slides = Array.from(slidesEl.querySelectorAll(".hero-slide"));
    if (slides.length === 0) return;

    let current = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Show slide ${i + 1}`);
      dot.className = i === 0 ? "is-active" : "";
      dot.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(dot);
    });
    const dots = Array.from(dotsEl.children);

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = index;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    function start() {
      stop();
      timer = setInterval(next, 2000);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    const heroSection = slidesEl.closest(".hero-slider");
    heroSection.addEventListener("mouseenter", stop);
    heroSection.addEventListener("mouseleave", start);
    heroSection.addEventListener("focusin", stop);
    heroSection.addEventListener("focusout", start);

    start();
  })();

  /* ---------------------------------------------------------
     Gallery carousel — auto-slides through photos, with arrow
     and dot navigation. Clicking a photo still opens the
     fullscreen lightbox. Pauses on hover/focus/manual scroll
     and respects prefers-reduced-motion.
  --------------------------------------------------------- */
  (function initGalleryCarousel() {
    const track = document.getElementById("galleryGrid");
    const dotsEl = document.getElementById("galleryDots");
    const prevBtn = document.getElementById("galleryPrev");
    const nextBtn = document.getElementById("galleryNext");
    if (!track || !dotsEl) return;

    const items = Array.from(track.children);
    if (items.length === 0) return;

    let current = 0;
    let timer = null;
    let resumeTimer = null;

    items.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Show photo ${i + 1}`);
      dot.className = i === 0 ? "is-active" : "";
      dot.addEventListener("click", () => {
        scrollToIndex(i);
        pauseThenResume();
      });
      dotsEl.appendChild(dot);
    });
    const dots = Array.from(dotsEl.children);

    function setActive(index) {
      current = index;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function scrollToIndex(index) {
      const clamped = (index + items.length) % items.length;
      const item = items[clamped];
      // Scroll only the track horizontally — never the page. scrollIntoView()
      // can pull the whole document down to "reveal" the element, which is
      // exactly the runaway page-scroll this avoids.
      const targetLeft = item.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: targetLeft, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    function next() { scrollToIndex(current + 1); }
    function prev() { scrollToIndex(current - 1); }

    prevBtn && prevBtn.addEventListener("click", () => { prev(); pauseThenResume(); });
    nextBtn && nextBtn.addEventListener("click", () => { next(); pauseThenResume(); });

    // Track which item is most visible so dots/autoplay stay in sync
    // however the track was scrolled (arrows, dots, drag, or autoplay).
    if ("IntersectionObserver" in window) {
      const visibility = new Map();
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => visibility.set(items.indexOf(entry.target), entry.intersectionRatio));
          let bestIndex = current;
          let bestRatio = 0;
          visibility.forEach((ratio, index) => {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestIndex = index;
            }
          });
          if (bestRatio > 0) setActive(bestIndex);
        },
        { root: track, threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      items.forEach(item => observer.observe(item));
    }

    function start() {
      if (prefersReducedMotion) return;
      stop();
      timer = setInterval(next, 3500);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function pauseThenResume() {
      stop();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(start, 4500);
    }

    const carousel = track.closest(".gallery__carousel");
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);
    track.addEventListener("pointerdown", () => stop());
    track.addEventListener("scroll", () => pauseThenResume(), { passive: true });

    start();
  })();

  /* ---------------------------------------------------------
     Gallery lightbox — click a thumbnail to view it fullscreen.
  --------------------------------------------------------- */
  (function initGalleryLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");
    const items = document.querySelectorAll(".gallery__item");
    if (!lightbox || !lightboxImage || items.length === 0) return;

    let lastFocused = null;

    function open(src, alt) {
      lastFocused = document.activeElement;
      lightboxImage.src = src;
      lightboxImage.alt = alt || "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
      Analytics.log("gallery image opened", { src });
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      lightboxImage.src = "";
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(btn => {
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        open(btn.getAttribute("data-full"), img ? img.alt : "");
      });
    });

    lightboxClose.addEventListener("click", close);
    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !lightbox.hidden) close();
    });
  })();

  /* ---------------------------------------------------------
     Testimonials — auto-advancing carousel, pauses on
     hover/focus, dot navigation.
  --------------------------------------------------------- */
  (function initTestimonials() {
    const slidesEl = document.getElementById("testimonialSlides");
    const dotsEl = document.getElementById("testimonialDots");
    if (!slidesEl || !dotsEl) return;

    const slides = Array.from(slidesEl.querySelectorAll(".testimonial"));
    if (slides.length === 0) return;

    let current = 0;
    let timer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
      dot.className = i === 0 ? "is-active" : "";
      dot.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(dot);
    });
    const dots = Array.from(dotsEl.children);

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = index;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    function next() { goTo((current + 1) % slides.length); }

    function start() {
      stop();
      timer = setInterval(next, 5000);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    const track = document.getElementById("testimonialTrack");
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("focusin", stop);
    track.addEventListener("focusout", start);

    start();
  })();

  /* ---------------------------------------------------------
     Timeline scroll-reveal — steps fade/slide in as they enter
     the viewport.
  --------------------------------------------------------- */
  (function initTimelineReveal() {
    const steps = document.querySelectorAll(".timeline__step");
    if (steps.length === 0) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      steps.forEach(step => step.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    steps.forEach(step => observer.observe(step));
  })();

  /* ---------------------------------------------------------
     Theme toggle — switches between light and dark, persists
     the choice, and keeps the button's label/state in sync.
  --------------------------------------------------------- */
  (function initThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    function currentTheme() {
      return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    function applyLabel(theme) {
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }

    applyLabel(currentTheme());

    toggle.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      applyLabel(next);
      try {
        localStorage.setItem("fr-theme", next);
      } catch (e) {
        /* localStorage unavailable — theme still applies for this session */
      }
      Analytics.log("theme toggled", { theme: next });
    });
  })();

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  loadEvents();
})();