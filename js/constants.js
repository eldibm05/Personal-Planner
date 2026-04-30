// ─────────────────────────────────────────────────────────────────────────────
// constants.js — shared palette, urgency labels, and calendar layout values
// Loaded as a plain <script> before any Babel/React files so all components
// can reference these globals without importing them.
// ─────────────────────────────────────────────────────────────────────────────

// Colour palette used throughout the UI
const C = {
  bg:"#080808", bg2:"#0a0a14", bg3:"#0d0d1e",   // background shades (darkest → lightest)
  blue:"#4466cc", blueD:"#2233aa",               // primary accent + darker variant
  red:"#cc3322", yellow:"#ffcc00", orange:"#ff6600",
  green:"#33aa44", white:"#ddddcc",
  dim:"#444455", dimmer:"#1a1a2e", borderDim:"#1a1a3a", // muted tones for secondary text/borders
};

// Urgency level labels indexed 1–5 (index 0 is empty so urgency maps directly)
const UL = ["","LOW","NORMAL","HIGH","URGENT","CRITICAL"];

// Corresponding urgency colours — matches UL indexing
const UC = ["",C.dim,C.blue,C.green,C.orange,C.red];

// Allowed recurrence frequencies for recurring tasks
const FREQS = ["daily","weekdays","weekly"];

// Calendar layout: pixel height per hour row, visible hour range (9 AM – 9 PM)
const HOUR_H = 72, CAL_S = 9, CAL_E = 21;

// Array of hour numbers to render as rows in the calendar grid
const HOURS = Array.from({length:CAL_E-CAL_S},(_,i)=>CAL_S+i);

// Inline style shorthand for the Press Start 2P pixel font
const PX = {fontFamily:"'Press Start 2P',monospace"};
