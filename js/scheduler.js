// ─────────────────────────────────────────────────────────────────────────────
// scheduler.js — auto-scheduling algorithm
// Scores tasks by urgency + proximity to due date, then slots them into the
// earliest available gap on each day within the user's working-hours window.
// ─────────────────────────────────────────────────────────────────────────────

// Returns the earliest start minute (since midnight) for a task of `dur` minutes
// on `day`, given a list of already-blocked minute ranges and the work settings.
// Returns null if no slot fits within workStart–workEnd.
function findFreeSlot(day,dur,evtBlocks,existing,settings){
  // Merge event blocks and already-scheduled tasks into one sorted list
  const blocks=[...evtBlocks,...existing.filter(s=>s.date===day).map(s=>({start:s.startMin,end:s.startMin+s.duration}))].sort((a,b)=>a.start-b.start);
  let cur=settings.workStart;
  for(const b of blocks){
    if(cur+dur<=b.start)return cur; // gap before this block is wide enough
    cur=Math.max(cur,b.end);        // jump past this block
  }
  return cur+dur<=settings.workEnd?cur:null; // fits after the last block, or bust
}

// Rebuilds the entire schedule for the current week anchor.
// Called whenever tasks, events, settings, or the week anchor change.
function autoSchedule(state){
  const{projects,standaloneTasks,events,settings,weekAnchor,prayerTimesCache={}}=state;
  const days=weekDates(weekAnchor);
  const allTasks=[...standaloneTasks,...projects.flatMap(p=>p.tasks)];

  // Pre-compute which event blocks fall on each day of the week.
  // Islamic blocks are added as hard blockers so regular tasks never overlap them.
  const evtBlocks={};
  days.forEach(d=>{evtBlocks[d]=[];});
  events.forEach(e=>{if(evtBlocks[e.date]!==undefined)evtBlocks[e.date].push({start:t24Min(e.startTime),end:t24Min(e.startTime)+e.duration});});
  days.forEach(d=>{
    buildIslamicBlocks(d,prayerTimesCache[d]).forEach(b=>{
      evtBlocks[d].push({start:b.startMin,end:b.startMin+b.duration});
    });
  });

  const td=today();

  // Score every non-done, non-recurring task.
  // Higher urgency and closer due dates score higher; higher difficulty scores lower.
  const scored=allTasks.filter(t=>!t.done&&!t.recurring).map(t=>{
    const du=t.dueDate?Math.max(0,(new Date(t.dueDate)-new Date(td))/86400000):99;
    return{...t,score:(t.urgency*2)+Math.max(0,10-du)-(t.difficulty*.5)};
  }).sort((a,b)=>b.score-a.score);

  // Track how many minutes have been scheduled per day so we respect the day cap
  const used={};days.forEach(d=>{used[d]=0;});
  const sched=[];

  // Place each scored task in the first day/slot that fits
  for(const task of scored){
    for(const day of days){
      if(new Date(day+"T12:00:00")<new Date(td+"T12:00:00"))continue; // skip past days
      const max=(settings.dayOverrides[day]??settings.maxHrsDefault)*60;
      if(used[day]+task.duration>max)continue; // day cap would be exceeded
      const slot=findFreeSlot(day,task.duration,evtBlocks[day],sched,settings);
      if(slot!==null){
        sched.push({id:uid(),taskId:task.id,date:day,startMin:slot,duration:task.duration,done:false,type:"task"});
        used[day]+=task.duration;
        break; // move on to the next task once placed
      }
    }
  }

  // Recurring tasks appear on every applicable day of the week
  for(const task of allTasks.filter(t=>t.recurring)){
    for(const day of days){
      const dow=new Date(day+"T12:00:00").getDay();
      if(task.freq==="weekdays"&&(dow===0||dow===6))continue; // skip weekends
      if(task.freq==="weekly"&&dow!==1)continue;              // weekly = Monday only
      const max=(settings.dayOverrides[day]??settings.maxHrsDefault)*60;
      if(used[day]+task.duration>max)continue;
      // If the task has a pinned time, start searching from that minute;
      // otherwise fall back to the normal workStart.
      const pinSettings=task.pinnedTime?{...settings,workStart:t24Min(task.pinnedTime)}:settings;
      const slot=findFreeSlot(day,task.duration,evtBlocks[day],sched,pinSettings);
      if(slot!==null){
        sched.push({id:uid(),taskId:task.id,date:day,startMin:slot,duration:task.duration,done:false,type:"recurring"});
        used[day]+=task.duration;
      }
    }
  }

  return sched;
}
