// ─────────────────────────────────────────────────────────────────────────────
// helpers.js — pure date/time utility functions used across the whole app
// ─────────────────────────────────────────────────────────────────────────────

// Generates a short random ID (7 chars) for tasks, events, schedule entries, etc.
const uid = () => Math.random().toString(36).slice(2,9);

// Returns today's date as a YYYY-MM-DD string
const today = () => new Date().toISOString().slice(0,10);

// Formats a YYYY-MM-DD string to MM/DD/YYYY for display
const fmtDate = d => { if(!d)return""; const[y,m,dy]=d.split("-"); return`${m}/${dy}/${y}`; };

// Returns the 3-letter weekday name for a YYYY-MM-DD string ("MON", "TUE", …)
// Uses T12:00:00 to avoid daylight-saving boundary issues
const dayName = d => ["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date(d+"T12:00:00").getDay()];

// Returns a new YYYY-MM-DD string n days offset from d (negative = past)
const addDays = (d,n) => { const dt=new Date(d+"T12:00:00"); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };

// Returns an array of 7 YYYY-MM-DD strings for the Mon–Sun week containing anchor
const weekDates = anchor => {
  const dt=new Date(anchor+"T12:00:00");
  const dow=dt.getDay();
  const mon=new Date(dt);
  // Shift back to Monday (Sunday = day 0, so treat it as day 7)
  mon.setDate(dt.getDate()-(dow===0?6:dow-1));
  return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d.toISOString().slice(0,10); });
};

// Converts total minutes since midnight to a 12-hour clock string ("9:30AM")
const minToTime = m => { const h=Math.floor(m/60),mn=m%60,ap=h>=12?"PM":"AM",h12=h%12||12; return`${h12}:${mn.toString().padStart(2,"0")}${ap}`; };

// Converts a "HH:MM" 24-hour string to minutes since midnight
const t24Min = t => { if(!t)return 0; const[h,m]=(t+"").split(":").map(Number); return h*60+(m||0); };
