# ARCADE PLANNER

A retro arcade-themed personal schedule planner. Manages tasks, projects, appointments, and auto-schedules your week — all stored locally in your browser with no backend required.

---

## Features

- **Password login** — simple localStorage-based lock screen to keep the app private
- **Projects & tasks** — organise tasks under projects with urgency, difficulty, and due dates
- **Recurring tasks** — daily, weekdays, or weekly repeating tasks
- **Auto-scheduler** — scores tasks by urgency + due date and fits them into free slots on your calendar
- **Calendar views** — switch between 1-day, 3-day, 1-week, and 1-month views
- **Appointments** — add fixed events that block time on the calendar
- **Day caps** — set a max working hours per day (globally or per day)
- **Now/Next bar** — shows what you should be doing right now and what's up next
- **Streak tracker** — tracks consecutive "perfect days" (all items completed)
- **Analytics** — weekly completion rates, project progress, urgency breakdown
- **Browser notifications** — 5-minute warnings and start alerts for today's items
- **Arcade sound effects** — chiptune beeps on task complete, save, and warnings

---

## Tech Stack

- **React 18** (via CDN, no build step)
- **Babel Standalone** (JSX compiled in-browser)
- **Press Start 2P** font (Google Fonts)
- **localStorage** for all data persistence — nothing is sent to a server

---

## File Structure

```
index.html                    HTML shell — loads all scripts in order
css/
  styles.css                  Global CSS (reset, scrollbar, animations)
js/
  constants.js                Colour palette, urgency labels, calendar layout constants
  audio.js                    Chiptune sound effect generator (Web Audio API)
  helpers.js                  Date/time utility functions
  state.js                    Password config, default state shape, load/save to localStorage
  scheduler.js                Auto-scheduling algorithm (scores + places tasks in free slots)
  components/
    ui.js                     Shared UI primitives: Btn, Lbl, Inp, Sel, Modal
    forms.js                  TaskForm, EventForm, ProjectForm
    ProjectsTab.js            Projects and standalone tasks tab
    CalendarTab.js            Calendar with 1D / 3D / 1W / 1M views
    AnalyticsTab.js           Streak, completion rates, urgency chart
    NowBar.js                 "Now / Next" status bar
    Settings.js               Work-hours settings modal
    LoginScreen.js            Password lock screen
    App.js                    Root App component + ReactDOM bootstrap
```

---

## Running Locally

Because Babel standalone loads component files via `fetch`, the page must be served over HTTP — it won't work if you just open `index.html` directly from the filesystem (`file://`).

**Quickest option — Python:**
```bash
cd Schedule-Planner
python3 -m http.server 8080
# then open http://localhost:8080
```

**Or Node:**
```bash
npx serve .
```

The app is also deployed on **GitHub Pages** at your repo's Pages URL.

---

## Changing the Password

Open [js/state.js](js/state.js) and edit line 2:

```js
const PASSWORD = "arcade123"; // ← change this
```

Save, commit, and push. The new password takes effect immediately (existing sessions stay logged in until the user clicks 🔒).

---

## Data Storage

All data lives in `localStorage` under the key `arcadePlannerV1`. Clearing browser storage resets the app to the default sample project. There is no cloud sync.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Submit password | Enter |
| Close any modal | ✕ button |
| Edit day cap | Click the hour label in a day header |
