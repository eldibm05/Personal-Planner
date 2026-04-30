// ─────────────────────────────────────────────────────────────────────────────
// NowBar.js — "NOW / NEXT" status bar shown below the main header
// Polls every 30 seconds to keep the current/upcoming item fresh.
// Returns null (renders nothing) when there are no items scheduled for today.
// ─────────────────────────────────────────────────────────────────────────────
function NowBar({state}){
  // Dummy state used purely to trigger a re-render every 30 seconds
  const[,tick]=useState(0);
  useEffect(()=>{const id=setInterval(()=>tick(t=>t+1),30000);return()=>clearInterval(id);},[]);

  // Build a flat lookup of taskId → task for resolving scheduled entries
  const taskMap={};
  state.standaloneTasks.forEach(t=>{taskMap[t.id]=t;});
  state.projects.forEach(p=>p.tasks.forEach(t=>{taskMap[t.id]=t;}));

  const nowMin=new Date().getHours()*60+new Date().getMinutes();
  const td=today();

  // Merge today's events and scheduled tasks into one time-sorted list
  const items=[
    ...state.events.filter(e=>e.date===td&&!e.done).map(e=>({name:e.title,start:t24Min(e.startTime),dur:e.duration})),
    ...state.schedule.filter(s=>s.date===td&&!s.done).map(s=>({name:taskMap[s.taskId]?.title||"Task",start:s.startMin,dur:s.duration})),
  ].sort((a,b)=>a.start-b.start);

  const cur=items.find(i=>i.start<=nowMin&&nowMin<i.start+i.dur); // currently active item
  const nxt=items.find(i=>i.start>nowMin);                         // next upcoming item

  if(!cur&&!nxt)return null; // nothing to show — hide the bar entirely

  return(
    <div style={{background:"#090400",borderBottom:`2px solid ${C.orange}`,padding:"6px 14px",...PX,fontSize:9,color:C.orange,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      <span style={{animation:"blink .8s step-end infinite"}}>▶</span>
      {cur
        ? <>NOW: <span style={{color:C.yellow,marginLeft:5}}>{cur.name}</span></>
        : <span style={{color:C.dim}}>IDLE</span>
      }
      {nxt&&(
        <>
          <span style={{color:C.dim,margin:"0 8px"}}>|</span>
          <span style={{color:C.dim}}>NEXT {minToTime(nxt.start)}:</span>
          <span style={{color:C.white,marginLeft:5}}>{nxt.name}</span>
        </>
      )}
    </div>
  );
}
