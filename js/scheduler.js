function findFreeSlot(day,dur,evtBlocks,existing,settings){
  const blocks=[...evtBlocks,...existing.filter(s=>s.date===day).map(s=>({start:s.startMin,end:s.startMin+s.duration}))].sort((a,b)=>a.start-b.start);
  let cur=settings.workStart;
  for(const b of blocks){if(cur+dur<=b.start)return cur; cur=Math.max(cur,b.end);}
  return cur+dur<=settings.workEnd?cur:null;
}

function autoSchedule(state){
  const{projects,standaloneTasks,events,settings,weekAnchor}=state;
  const days=weekDates(weekAnchor);
  const allTasks=[...standaloneTasks,...projects.flatMap(p=>p.tasks)];
  const evtBlocks={};
  days.forEach(d=>{evtBlocks[d]=[];});
  events.forEach(e=>{if(evtBlocks[e.date]!==undefined)evtBlocks[e.date].push({start:t24Min(e.startTime),end:t24Min(e.startTime)+e.duration});});
  const td=today();
  const scored=allTasks.filter(t=>!t.done&&!t.recurring).map(t=>{
    const du=t.dueDate?Math.max(0,(new Date(t.dueDate)-new Date(td))/86400000):99;
    return{...t,score:(t.urgency*2)+Math.max(0,10-du)-(t.difficulty*.5)};
  }).sort((a,b)=>b.score-a.score);
  const used={};days.forEach(d=>{used[d]=0;});
  const sched=[];
  for(const task of scored){
    for(const day of days){
      if(new Date(day+"T12:00:00")<new Date(td+"T12:00:00"))continue;
      const max=(settings.dayOverrides[day]??settings.maxHrsDefault)*60;
      if(used[day]+task.duration>max)continue;
      const slot=findFreeSlot(day,task.duration,evtBlocks[day],sched,settings);
      if(slot!==null){sched.push({id:uid(),taskId:task.id,date:day,startMin:slot,duration:task.duration,done:false,type:"task"});used[day]+=task.duration;break;}
    }
  }
  for(const task of allTasks.filter(t=>t.recurring)){
    for(const day of days){
      const dow=new Date(day+"T12:00:00").getDay();
      if(task.freq==="weekdays"&&(dow===0||dow===6))continue;
      if(task.freq==="weekly"&&dow!==1)continue;
      const max=(settings.dayOverrides[day]??settings.maxHrsDefault)*60;
      if(used[day]+task.duration>max)continue;
      const slot=findFreeSlot(day,task.duration,evtBlocks[day],sched,settings);
      if(slot!==null){sched.push({id:uid(),taskId:task.id,date:day,startMin:slot,duration:task.duration,done:false,type:"recurring"});used[day]+=task.duration;}
    }
  }
  return sched;
}
