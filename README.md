# 📚 Fernbank & Rowe Events Desk

> A polished, single-page event discovery and RSVP interface for a bookstore reading room, built with semantic HTML, token-driven CSS, and modular vanilla JavaScript.

![HTML5](https://img.shields.io/badge/HTML5-Semantic-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/UI-Responsive-0F172A?style=for-the-badge)
![Accessibility](https://img.shields.io/badge/A11y-Considered-1D4ED8?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/Stack-Vanilla_JS-111827?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-Ready-16A34A?style=for-the-badge)

## Subtitle
A front-end reservation workflow for literary events, designed to demonstrate real UI state handling, accessibility, and maintainable JavaScript architecture.

## Project Description
Fernbank & Rowe Events Desk is a browser-based event listing and seat reservation experience for a bookstore or reading-room setting. It allows visitors to browse upcoming events, search and filter the schedule, sort results, open a detailed event dialog, and submit an RSVP through a validated form.

The project is built as a front-end implementation with a mock data source and simulated analytics layer. Its primary objective is to model a realistic event-booking flow while keeping the stack lightweight, dependency-free, and easy to understand for academic, portfolio, and internship use.

### Target Users
- Visitors browsing upcoming bookstore or library-style events.
- Staff members demonstrating or testing an events desk workflow.
- Recruiters, reviewers, and instructors evaluating front-end engineering practices.

## Live Features

### Core Experience
- Responsive single-page layout with mobile navigation, stacked layouts on smaller screens, and grid-based sections for larger viewports.
- Event listing driven by a mock event dataset containing titles, dates, locations, categories, descriptions, seat counts, tags, and images.
- Search across event title, author, and description.
- Category filtering through chip-based controls.
- Sorting by soonest, latest, title, and seat availability.
- Dynamic rendering of event cards based on current application state.
- Event details dialog with expanded content, host information, tags, difficulty, imagery, and event facts.
- RSVP form with validation for attendee details and guest count.

### UI States
- Loading state with skeleton content while events are being fetched.
- Error state with retry flow when the simulated request fails.
- Empty state when no events match the current search and filter combination.
- Animated “at a glance” metrics for event count, open seats, next event, and category count.

### UX and Interaction
- Theme support through light and dark design tokens.
- Smooth scrolling and interaction transitions, with reduced-motion fallbacks.
- Keyboard-accessible navigation and control interactions.
- Focus return handling around the event dialog.
- Analytics simulation through structured console logging.

## Project Architecture
The project is intentionally split into small, single-responsibility files so data, utilities, analytics, styling, and application logic remain separate.

### Architecture Overview
- `index.html` defines the semantic structure of the page, including navigation, controls, state panels, event grid, dialog, gallery, supporting content sections, and footer.
- `styles.css` contains the design system, responsive layout rules, theming tokens, focus styles, state styling, dialog styles, gallery/lightbox presentation, and motion behavior.
- `app.js` owns application state, DOM querying, data loading, filtering, sorting, rendering, modal behavior, form handling, statistics, and UI event wiring.
- `data.js` provides the mock event records and an asynchronous loader that simulates latency and request failure.
- `utils.js` centralizes shared helpers such as sanitization, debouncing, date formatting, and category label generation.
- `analytics.js` provides a lightweight telemetry abstraction that standardizes interaction logging without external services.

### Data Flow
1. The application boots and calls the async event loader.
2. The loader returns a cloned copy of the mock dataset after a timed delay.
3. `app.js` stores the results in centralized state.
4. Search, category, and sort controls update state and trigger rerendering.
5. The filtered collection is converted into event cards and injected into the DOM.
6. Selecting a card opens a dialog tied to the active event.
7. RSVP inputs are validated before success feedback is shown.
8. Analytics events are logged for key interactions.

### JavaScript Module Interaction
| Module | Responsibility | Consumed By |
|--------|----------------|-------------|
| `data.js` | Supplies event records and simulated async loading | `app.js` |
| `utils.js` | Sanitization, formatting, debouncing, helper labels | `app.js` |
| `analytics.js` | Console-based telemetry simulation | `app.js` |
| `app.js` | Main state management, rendering, and event handling | Browser runtime |

## Folder Structure
```text
project-root/
│
├── images/
│   ├── image1.jpeg
│   ├── image2.jpeg
│   ├── image3.jpeg
│   ├── image4.jpeg
│   ├── image5.jpeg
│   ├── image6.jpeg
│   ├── image7.jpeg
│   └── image8.jpeg
│
├── index.html          # Application structure and semantic markup
├── styles.css          # Design system, theming, layout, components, and responsiveness
├── app.js              # Main application logic and UI orchestration
├── data.js             # Mock event data source and async loader
├── utils.js            # Shared utility helpers
├── analytics.js        # Analytics simulation via console logging
└── README.md
```

## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic page structure, forms, dialog-related markup, and content sections |
| CSS3 | Layout, responsive design, component styling, transitions, and theming |
| JavaScript (ES6+) | State management, rendering, interactivity, filtering, sorting, and validation |
| Inter | Primary UI typeface defined in the CSS font stack |
| IBM Plex Mono | Monospace accent font defined in the CSS font stack |
| DOM APIs | Element selection, content updates, attribute management, and event handling |
| Event Listeners | User interaction handling across navigation, filters, dialog actions, and form submission |
| `window.matchMedia` | Reduced-motion preference detection |
| `requestAnimationFrame` | Animated number transitions in the statistics strip |
| `performance.now` | Time-based animation calculations |
| `setTimeout` | Simulated network latency in the mock data loader |

## Libraries
This project is built with **Vanilla JavaScript** and does not use external front-end frameworks or third-party runtime libraries.

## Installation
```bash
git clone <repository-url>
cd project-folder
```

No package installation step is required because the project is fully static and dependency-free.

## Running the Project
You can run the project locally using either of the following approaches:

### Option 1: Open directly
- Open `index.html` in a browser.

### Option 2: Use a local development server
- Open the folder in Visual Studio Code.
- Start the project with the Live Server extension.

Using a local server is helpful when reviewing the project in a development workflow and for consistent browser behavior.

## How to Use
1. Open the application in a browser.
2. Review the overview metrics showing event count, available seats, next event, and category coverage.
3. Search events by title, author, or descriptive text.
4. Narrow the list using category chips.
5. Change the sort mode to reorder events.
6. Select an event card to open the detailed dialog.
7. Review the event description, host details, location, tags, and seat availability.
8. Fill in the RSVP form with name, email, number of guests, and optional notes.
9. Submit the form and review inline validation or success feedback.
10. Retry loading if the demo intentionally triggers the error state.

## Screenshots

### Home Page
(Add Screenshot)

### Event Details
(Add Screenshot)

### RSVP Form
(Add Screenshot)

### Dark Theme
(Add Screenshot)

## Accessibility Features
- Semantic headings and structured page sections.
- Skip link for keyboard users.
- Visually hidden helper text for screen-reader support.
- Focus-visible styling for interactive elements.
- Keyboard-friendly navigation controls.
- Status announcements through a live region for important loading and error feedback.
- Reduced-motion handling using `prefers-reduced-motion`.
- Form error messaging integrated into the RSVP flow.
- Dialog interaction designed with focus restoration behavior.

## Performance Optimizations
- Debounced search input to reduce unnecessary rerendering during typing.
- Centralized state to keep filtering and rerender logic predictable.
- Rendering through generated markup rather than repeated manual DOM node construction.
- Lightweight modular file split to keep responsibilities narrow and code easier to maintain.
- Animated counters implemented with `requestAnimationFrame` instead of timer-heavy loops.
- Motion fallbacks for users who prefer reduced animation.

## Security Measures
- Input sanitization before storing user-provided values.
- Text sanitization before writing dynamic content into HTML.
- XSS-conscious rendering through escaped text helpers.
- Validation checks on RSVP form fields before accepting submission.
- Defensive handling of empty and failed data-loading states.

## Challenges Solved
- Building a realistic reservation flow without a backend while still modeling asynchronous loading, failure, and recovery states.
- Keeping the codebase modular without introducing frameworks or build tooling.
- Managing a dialog-driven flow alongside filtering, sorting, and inline form validation from a single front-end state model.
- Supporting accessible interaction patterns such as keyboard focus visibility, reduced motion, and live announcements.
- Designing a polished UI system that remains responsive and theme-aware across sections and screen sizes.

## Future Improvements
- Replace the mock data loader with a real backend API.
- Persist RSVPs to a database.
- Add authentication for staff or administrator workflows.
- Introduce real email confirmations for reservations.
- Build an admin dashboard for event management and seat tracking.
- Add pagination or virtualized rendering for larger datasets.
- Convert the project into a Progressive Web App.
- Add offline support for cached browsing.

## Learning Outcomes
This project demonstrates practical learning in semantic front-end architecture, state-driven UI rendering, accessibility-conscious interaction design, utility-based code reuse, client-side form validation, and secure handling of dynamic content. It also highlights how a polished user experience can be built with a small vanilla JavaScript stack when responsibilities are clearly separated.

## Author

**Kriti Tripathi**

B.S.c Computer Science & Data Analytics

Indian Institute of Technology Patna

- GitHub: [Add GitHub URL]
- LinkedIn: [Add LinkedIn URL]
- Email: [Add Email Address]

## License
This project is released under the MIT License.
