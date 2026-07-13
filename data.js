/**
 * Mock event data source.
 * In production this would be replaced by a real API call; the
 * async wrapper below intentionally mimics network latency and an
 * occasional failure so the loading / error states are exercised.
 */
const EVENT_DATA = [
  {
    id: "evt-001",
    title: "Reading: Salt Marsh, Late August",
    date: "2026-07-12",
    time: "18:30",
    location: "Reading Room",
    category: "reading",
    author: "Naomi Idris",
    description: "Naomi Idris reads from her new novel about three sisters returning to their grandmother's tidal-marsh home for one last summer.",
    seatsTotal: 40,
    seatsTaken: 34,
    status: "upcoming",
    image: "images/image1.jpeg",
    duration: "60 min",
    difficulty: "All levels",
    tags: ["Fiction", "Author talk"],
    isNew: true
  },
  {
    id: "evt-002",
    title: "Workshop: Writing the First Chapter",
    date: "2026-07-14",
    time: "10:00",
    location: "Workshop Annex",
    category: "workshop",
    author: "Facilitated by Priya Nathan",
    description: "A hands-on morning session on opening lines, first-page stakes, and how to avoid the dreaded throat-clearing chapter.",
    seatsTotal: 18,
    seatsTaken: 6,
    status: "upcoming",
    image: "images/image2.jpeg",
    duration: "120 min",
    difficulty: "Beginner friendly",
    tags: ["Craft", "Hands-on"],
    isNew: true
  },
  {
    id: "evt-003",
    title: "Panel: The Future of Independent Presses",
    date: "2026-07-16",
    time: "19:00",
    location: "Main Floor",
    category: "panel",
    author: "Three regional publishers",
    description: "Editors from three independent presses discuss what it takes to keep small imprints alive in a consolidating industry.",
    seatsTotal: 60,
    seatsTaken: 12,
    status: "upcoming",
    image: "images/image3.jpeg",
    duration: "90 min",
    difficulty: "All levels",
    tags: ["Publishing", "Discussion"],
    isNew: false
  },
  {
    id: "evt-004",
    title: "Book Club: Midwinter Reread",
    date: "2026-07-18",
    time: "17:30",
    location: "Reading Room",
    category: "book-club",
    author: "Hosted by store staff",
    description: "Monthly meet-up. This session revisits a reader favorite from last winter's shelf — bring your marked-up copy.",
    seatsTotal: 24,
    seatsTaken: 24,
    status: "upcoming",
    image: "images/image4.jpeg",
    duration: "75 min",
    difficulty: "All levels",
    tags: ["Book club", "Monthly"],
    isNew: false
  },
  {
    id: "evt-005",
    title: "Storytime: The Lantern Fox",
    date: "2026-07-19",
    time: "11:00",
    location: "Children's Corner",
    category: "kids",
    author: "Read by Mr. Alaric",
    description: "A picture-book storytime for ages 3–7, followed by a simple lantern-craft activity in the children's corner.",
    seatsTotal: 30,
    seatsTaken: 9,
    status: "upcoming",
    image: "images/image5.jpeg",
    duration: "45 min",
    difficulty: "Ages 3–7",
    tags: ["Kids", "Craft"],
    isNew: false
  },
  {
    id: "evt-006",
    title: "Reading & Q&A: Cartography of Small Towns",
    date: "2026-07-21",
    time: "18:00",
    location: "Reading Room",
    category: "reading",
    author: "Devon Okafor",
    description: "Devon Okafor discusses mapping fictional towns onto real geography, with a short reading and audience questions.",
    seatsTotal: 45,
    seatsTaken: 40,
    status: "upcoming",
    image: "images/image6.jpeg",
    duration: "60 min",
    difficulty: "All levels",
    tags: ["Fiction", "Q&A"],
    isNew: false
  },
  {
    id: "evt-007",
    title: "Workshop: Query Letters That Get Read",
    date: "2026-07-24",
    time: "10:30",
    location: "Workshop Annex",
    category: "workshop",
    author: "Facilitated by Renata Cole",
    description: "A former literary agent walks through what makes a query letter stand out — and the fastest ways to get a form rejection.",
    seatsTotal: 20,
    seatsTaken: 20,
    status: "upcoming",
    image: "images/image7.jpeg",
    duration: "90 min",
    difficulty: "Intermediate",
    tags: ["Publishing", "Craft"],
    isNew: false
  },
  {
    id: "evt-008",
    title: "Panel: Translating Poetry Across Languages",
    date: "2026-07-27",
    time: "19:00",
    location: "Main Floor",
    category: "panel",
    author: "Three translators",
    description: "A conversation on what is gained and lost when a poem crosses from one language into another, with live translation examples.",
    seatsTotal: 50,
    seatsTaken: 18,
    status: "upcoming",
    image: "images/image8.jpeg",
    duration: "90 min",
    difficulty: "All levels",
    tags: ["Poetry", "Discussion"],
    isNew: false
  },
  {
    id: "evt-009",
    title: "Storytime: Pirates of Pebble Cove",
    date: "2026-07-29",
    time: "11:00",
    location: "Children's Corner",
    category: "kids",
    author: "Read by Ms. Tanaka",
    description: "An interactive pirate-themed storytime with a short treasure hunt around the picture-book shelves.",
    seatsTotal: 30,
    seatsTaken: 4,
    status: "upcoming",
    image: "images/image1.jpeg",
    duration: "45 min",
    difficulty: "Ages 4–8",
    tags: ["Kids", "Interactive"],
    isNew: false
  },
  {
    id: "evt-010",
    title: "Book Club: New Voices in Short Fiction",
    date: "2026-08-01",
    time: "17:30",
    location: "Reading Room",
    category: "book-club",
    author: "Hosted by store staff",
    description: "A discussion of a recent short-story collection, with light refreshments and a guided discussion sheet.",
    seatsTotal: 24,
    seatsTaken: 11,
    status: "upcoming",
    image: "images/image2.jpeg",
    duration: "75 min",
    difficulty: "All levels",
    tags: ["Book club", "Monthly"],
    isNew: false
  },
  {
    id: "evt-011",
    title: "Reading: Correspondence, a Verse Novel",
    date: "2026-08-03",
    time: "18:30",
    location: "Reading Room",
    category: "reading",
    author: "Iris Halvorsen",
    description: "Iris Halvorsen reads from a verse novel told entirely through letters between two estranged siblings.",
    seatsTotal: 40,
    seatsTaken: 2,
    status: "upcoming",
    image: "images/image3.jpeg",
    duration: "60 min",
    difficulty: "All levels",
    tags: ["Poetry", "Author talk"],
    isNew: false
  },
  {
    id: "evt-012",
    title: "Workshop: Self-Editing Before You Submit",
    date: "2026-08-06",
    time: "10:00",
    location: "Workshop Annex",
    category: "workshop",
    author: "Facilitated by Priya Nathan",
    description: "A practical checklist-driven session on catching structural issues before a manuscript goes to an editor or agent.",
    seatsTotal: 18,
    seatsTaken: 3,
    status: "upcoming",
    image: "images/image4.jpeg",
    duration: "120 min",
    difficulty: "Intermediate",
    tags: ["Craft", "Hands-on"],
    isNew: false
  }
];

/**
 * Simulates fetching events from a server. Resolves with a copy of
 * EVENT_DATA after a network-like delay. Pass forceFailure to
 * simulate a dropped connection (used by the Retry button demo).
 */
function fetchEvents({ forceFailure = false } = {}) {
  const delay = 700 + Math.random() * 900;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (forceFailure) {
        reject(new Error("Network request failed"));
        return;
      }
      resolve(EVENT_DATA.map(evt => ({ ...evt })));
    }, delay);
  });
}
