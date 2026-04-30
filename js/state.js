// ─────────────────────────────────────────────────────────────────────────────
// state.js — auth config, default app state, and localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────

// ── Auth ──────────────────────────────────────────────────────────────────────
// Change PASSWORD to whatever you want. The app stores an auth flag in
// localStorage so users only need to type it once per browser/device.
const PASSWORD = "arcade123";
const AUTH_KEY = "arcadePlannerAuth"; // localStorage key for the auth flag

// ── Default state ─────────────────────────────────────────────────────────────
// Called on first launch (or after localStorage is cleared). Includes a sample
// project so new users see a populated app instead of a blank screen.
const defaultState = () => ({
  projects:[{id:uid(),name:"Sample Project",color:C.red,dueDate:"",tasks:[
    {id:uid(),title:"Write report",duration:60,urgency:4,difficulty:3,dueDate:addDays(today(),3),recurring:false,freq:"daily",done:false},
    {id:uid(),title:"Research phase",duration:90,urgency:3,difficulty:4,dueDate:addDays(today(),5),recurring:false,freq:"daily",done:false},
  ]}],
  standaloneTasks:[
    // Tasks not attached to any project
    {id:uid(),title:"Morning workout",duration:45,urgency:2,difficulty:2,dueDate:"",recurring:true,freq:"daily",done:false},
  ],
  events:[],        // fixed appointments (block calendar time but aren't "tasks")
  schedule:[],      // auto-generated schedule entries produced by autoSchedule()
  completionLog:{}, // keyed by YYYY-MM-DD, value: { perfect: bool }
  settings:{workStart:9*60,workEnd:21*60,maxHrsDefault:6,dayOverrides:{}},
  weekAnchor:today(), // the date the calendar / navigation is centred on
  prayerTimesCache:{}, // keyed by YYYY-MM-DD → { Fajr, Dhuhr, Asr, Maghrib, Isha }
});

// ── Persistence ───────────────────────────────────────────────────────────────
// Reads state from localStorage. Falls back to defaultState() if nothing is
// stored or the stored JSON is corrupted.
function loadState(){
  try{
    const s=localStorage.getItem("arcadePlannerV1");
    const loaded=s?JSON.parse(s):defaultState();
    if(!loaded.prayerTimesCache)loaded.prayerTimesCache={};
    return loaded;
  }catch{return defaultState();}
}

// Serialises the full state object to localStorage on every change.
function saveState(s){try{localStorage.setItem("arcadePlannerV1",JSON.stringify(s));}catch{}}
