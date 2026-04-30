// ─────────────────────────────────────────────────────────────────────────────
// AnalyticsTab.js — "ANALYTICS" tab
// Shows streak, last-14-days heatmap, weekly completion bars,
// per-project progress, open-task urgency chart, and summary stats.
// ─────────────────────────────────────────────────────────────────────────────
function AnalyticsTab({state}){
  const allTasks=[...state.standaloneTasks,...state.projects.flatMap(p=>p.tasks)];

  // Build 4-week completion history (most recent week last)
  const weeks=Array.from({length:4},(_,i)=>{
    const days=weekDates(addDays(today(),-i*7));
    const total=state.schedule.filter(s=>days.includes(s.date)).length+state.events.filter(e=>days.includes(e.date)).length;
    const done=state.schedule.filter(s=>days.includes(s.date)&&s.done).length+state.events.filter(e=>days.includes(e.date)&&e.done).length;
    return{label:i===0?"THIS WK":`-${i}W`,total,done,pct:total?Math.round(done/total*100):0};
  }).reverse();

  // Last 14 days for the heatmap
  const last14=Array.from({length:14},(_,i)=>addDays(today(),-13+i));

  // Streak: count consecutive perfect days going backwards from today
  let streak=0,ch=addDays(today(),-1);
  while(state.completionLog[ch]?.perfect){streak++;ch=addDays(ch,-1);}
  if(state.completionLog[today()]?.perfect)streak++;

  const perf14=last14.filter(d=>state.completionLog[d]?.perfect).length;

  // Count open tasks per urgency level for the bar chart
  const openByU=[1,2,3,4,5].map(u=>({u,count:allTasks.filter(t=>!t.done&&t.urgency===u).length}));
  const maxU=Math.max(...openByU.map(x=>x.count),1); // used to normalise bar heights

  return(
    <div style={{padding:16,overflowY:"auto",height:"100%"}}>

      {/* ── Streak + heatmap cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
        <div style={{background:C.bg2,border:`2px solid ${C.orange}`,padding:14,textAlign:"center"}}>
          <div style={{...PX,fontSize:9,color:C.dim,marginBottom:6}}>CURRENT STREAK</div>
          <div style={{...PX,fontSize:70,color:C.orange}}>{streak}</div>
          <div style={{...PX,fontSize:9,color:C.dim,marginTop:4}}>PERFECT DAYS</div>
        </div>
        <div style={{background:C.bg2,border:`2px solid ${C.yellow}`,padding:14}}>
          <div style={{...PX,fontSize:9,color:C.dim,marginBottom:8}}>LAST 14 DAYS</div>
          {/* Small coloured squares — orange = perfect day, dark = incomplete */}
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {last14.map(d=><div key={d} title={d} style={{width:15,height:15,background:state.completionLog[d]?.perfect?C.orange:C.dimmer,border:`1px solid ${C.dim}`}}/>)}
          </div>
          <div style={{...PX,fontSize:8,color:C.dim,marginTop:6}}>{perf14} / 14 PERFECT</div>
        </div>
      </div>

      {/* ── Weekly completion bars ── */}
      <div style={{marginBottom:18}}>
        <div style={{...PX,fontSize:14,color:C.yellow,marginBottom:12,lineHeight:1.8}}>▸ WEEKLY COMPLETION</div>
        {weeks.map(w=>(
          <div key={w.label} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",...PX,fontSize:8,color:C.dim,marginBottom:3}}>
              <span>{w.label}</span><span>{w.done}/{w.total} · {w.pct}%</span>
            </div>
            {/* Bar colour: green ≥80%, blue ≥50%, red <50% */}
            <div style={{height:14,background:C.dimmer,position:"relative"}}>
              <div style={{height:"100%",width:`${w.pct}%`,background:w.pct>=80?C.green:w.pct>=50?C.blue:C.red,transition:"width .4s"}}/>
              <div style={{...PX,position:"absolute",right:4,top:2,fontSize:8,color:C.white}}>{w.pct}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Project progress bars (only shown if there are projects) ── */}
      {state.projects.length>0&&(
        <div style={{marginBottom:18}}>
          <div style={{...PX,fontSize:14,color:C.yellow,marginBottom:12,lineHeight:1.8}}>▸ PROJECT PROGRESS</div>
          {state.projects.map(p=>{
            const done=p.tasks.filter(t=>t.done).length;
            const pct=p.tasks.length?Math.round(done/p.tasks.length*100):0;
            return(
              <div key={p.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",...PX,fontSize:8,marginBottom:3}}>
                  <span style={{color:p.color}}>{p.name}</span><span style={{color:C.dim}}>{done}/{p.tasks.length}</span>
                </div>
                <div style={{height:14,background:C.dimmer}}><div style={{height:"100%",width:`${pct}%`,background:p.color,transition:"width .4s"}}/></div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Open tasks by urgency (vertical bar chart) ── */}
      <div style={{marginBottom:18}}>
        <div style={{...PX,fontSize:14,color:C.yellow,marginBottom:12,lineHeight:1.8}}>▸ OPEN TASKS BY URGENCY</div>
        <div style={{display:"flex",gap:5,alignItems:"flex-end",height:90}}>
          {openByU.map(({u,count})=>(
            <div key={u} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{...PX,fontSize:9,color:UC[u]}}>{count}</div>
              {/* Bar height proportional to count relative to the tallest bar */}
              <div style={{width:"100%",height:(count/maxU)*72,background:UC[u],minHeight:count?4:0}}/>
              <div style={{...PX,fontSize:7,color:C.dim}}>{UL[u].slice(0,3)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[
          {label:"TOTAL TASKS",val:allTasks.length,col:C.blue},
          {label:"COMPLETED",val:allTasks.filter(t=>t.done).length,col:C.green},
          {label:"OVERDUE",val:allTasks.filter(t=>!t.done&&t.dueDate&&t.dueDate<today()).length,col:C.red},
        ].map(s=>(
          <div key={s.label} style={{background:C.bg2,border:`2px solid ${s.col}`,padding:10,textAlign:"center"}}>
            <div style={{...PX,fontSize:8,color:C.dim,marginBottom:6}}>{s.label}</div>
            <div style={{...PX,fontSize:28,color:s.col}}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
