const uid = () => Math.random().toString(36).slice(2,9);
const today = () => new Date().toISOString().slice(0,10);
const fmtDate = d => { if(!d)return""; const[y,m,dy]=d.split("-"); return`${m}/${dy}/${y}`; };
const dayName = d => ["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date(d+"T12:00:00").getDay()];
const addDays = (d,n) => { const dt=new Date(d+"T12:00:00"); dt.setDate(dt.getDate()+n); return dt.toISOString().slice(0,10); };
const weekDates = anchor => {
  const dt=new Date(anchor+"T12:00:00");
  const dow=dt.getDay();
  const mon=new Date(dt);
  mon.setDate(dt.getDate()-(dow===0?6:dow-1));
  return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d.toISOString().slice(0,10); });
};
const minToTime = m => { const h=Math.floor(m/60),mn=m%60,ap=h>=12?"PM":"AM",h12=h%12||12; return`${h12}:${mn.toString().padStart(2,"0")}${ap}`; };
const t24Min = t => { if(!t)return 0; const[h,m]=(t+"").split(":").map(Number); return h*60+(m||0); };
