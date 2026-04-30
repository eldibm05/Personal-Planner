function CalendarTab({state,setState}){
  const[modal,setModal]=useState(null);
  const[capEdit,setCapEdit]=useState(null);
  const[calView,setCalView]=useState("1W");
  const td=today();

  const displayDays=calView==="1D"?[state.weekAnchor]
    :calView==="3D"?[state.weekAnchor,addDays(state.weekAnchor,1),addDays(state.weekAnchor,2)]
    :calView==="1W"?weekDates(state.weekAnchor)
    :(()=>{const[y,m]=state.weekAnchor.split("-").map(Number);const cnt=new Date(y,m,0).getDate();return Array.from({length:cnt},(_,i)=>{const d=new Date(y,m-1,i+1);return d.toISOString().slice(0,10);});})();

  const navigate=dir=>{
    if(calView==="1M"){setState(p=>{const[y,m]=p.weekAnchor.split("-").map(Number);const nd=new Date(y,m-1+dir,1);return{...p,weekAnchor:nd.toISOString().slice(0,10)};});}
    else{const step=calView==="1D"?1:calView==="3D"?3:7;setState(p=>({...p,weekAnchor:addDays(p.weekAnchor,dir*step)}));}
  };

  const rangeLabel=calView==="1D"?`${dayName(state.weekAnchor)} ${fmtDate(state.weekAnchor)}`
    :calView==="1M"?(()=>{const[y,m]=state.weekAnchor.split("-").map(Number);return["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][m-1]+" "+y;})()
    :`${fmtDate(displayDays[0])} – ${fmtDate(displayDays[displayDays.length-1])}`;

  const taskMap={};
  state.standaloneTasks.forEach(t=>{taskMap[t.id]=t;});
  state.projects.forEach(p=>p.tasks.forEach(t=>{taskMap[t.id]=t;}));

  const checkPerfect=(s,day)=>{
    const all=[...s.events.filter(e=>e.date===day),...s.schedule.filter(x=>x.date===day)];
    const perfect=all.length>0&&all.every(i=>i.done);
    s.completionLog[day]={...(s.completionLog[day]||{}),perfect};
    if(perfect)playBeep("notify");
  };

  const toggle=(type,id,day)=>{
    setState(prev=>{
      const s=JSON.parse(JSON.stringify(prev));
      if(type==="event"){const e=s.events.find(e=>e.id===id);if(e)e.done=!e.done;}
      else{
        const sc=s.schedule.find(x=>x.id===id);
        if(sc){
          sc.done=!sc.done;
          if(!taskMap[sc.taskId]?.recurring){
            s.standaloneTasks=s.standaloneTasks.map(t=>t.id===sc.taskId?{...t,done:sc.done}:t);
            s.projects=s.projects.map(p=>({...p,tasks:p.tasks.map(t=>t.id===sc.taskId?{...t,done:sc.done}:t)}));
          }
        }
      }
      checkPerfect(s,day); return s;
    }); playBeep("done");
  };

  const saveEvt=(data,editId)=>{
    setState(prev=>{
      const s=JSON.parse(JSON.stringify(prev));
      const e={id:editId||uid(),...data,done:false};
      if(editId)s.events=s.events.map(x=>x.id===editId?e:x);
      else s.events.push(e);
      s.schedule=autoSchedule(s); return s;
    }); setModal(null);
  };

  const delEvt=id=>{
    setState(prev=>{const s=JSON.parse(JSON.stringify(prev));s.events=s.events.filter(e=>e.id!==id);s.schedule=autoSchedule(s);return s;});
    setModal(null);
  };

  const setDayCap=(day,hrs)=>{
    setState(prev=>{const s=JSON.parse(JSON.stringify(prev));if(!hrs)delete s.settings.dayOverrides[day];else s.settings.dayOverrides[day]=hrs;s.schedule=autoSchedule(s);return s;});
    setCapEdit(null);
  };

  const streak=(()=>{let c=0,ch=addDays(td,-1);while(state.completionLog[ch]?.perfect){c++;ch=addDays(ch,-1);}if(state.completionLog[td]?.perfect)c++;return c;})();

  useEffect(()=>{
    if(!("Notification"in window))return;
    if(Notification.permission==="default")Notification.requestPermission();
    const timers=[];
    const nowMs=Date.now();
    const items=[
      ...state.events.filter(e=>e.date===td&&!e.done).map(e=>({name:e.title,startMin:t24Min(e.startTime),dur:e.duration})),
      ...state.schedule.filter(s=>s.date===td&&!s.done).map(s=>({name:taskMap[s.taskId]?.title||"Task",startMin:s.startMin,dur:s.duration})),
    ].sort((a,b)=>a.startMin-b.startMin);
    items.forEach((item,i)=>{
      const base=new Date(td+"T00:00:00").getTime();
      const st=base+item.startMin*60000, wt=st-300000, nxt=items[i+1];
      if(wt>nowMs)timers.push(setTimeout(()=>{
        playBeep("warn");
        if(Notification.permission==="granted")new Notification("⏰ 5 MIN WARNING",{body:"Starting soon: "+item.name,icon:""});
      },wt-nowMs));
      if(st>nowMs)timers.push(setTimeout(()=>{
        playBeep("notify");
        if(Notification.permission==="granted")new Notification("▶ NOW: "+item.name,{body:item.dur+"min"+(nxt?" | NEXT: "+nxt.name:""),icon:""});
      },st-nowMs));
    });
    return()=>timers.forEach(clearTimeout);
  },[state.schedule,state.events]);

  const minToY=m=>((m-CAL_S*60)/60)*HOUR_H;

  const DayCol=({day,calView})=>{
    const evts=state.events.filter(e=>e.date===day);
    const sched=state.schedule.filter(s=>s.date===day);
    const titleSz=calView==="1D"?17:calView==="3D"?13:8;
    const timeSz =calView==="1D"?13:calView==="3D"?10:7;
    const chkDim =calView==="1D"?22:calView==="3D"?18:11;
    const pad    =calView==="1D"?"10px 12px":calView==="3D"?"6px 8px":"3px 4px";
    const gap    =calView==="1D"?10:calView==="3D"?7:3;
    const lh     =calView==="1D"?2:calView==="3D"?1.9:1.6;
    return(
      <div style={{flex:1,minWidth:0,borderLeft:`1px solid ${C.borderDim}`,position:"relative"}}>
        {HOURS.map(h=><div key={h} style={{position:"absolute",top:(h-CAL_S)*HOUR_H,left:0,right:0,height:HOUR_H,borderBottom:`1px solid ${C.dimmer}`}}/>)}
        {evts.map(evt=>{
          const top=minToY(t24Min(evt.startTime));
          const ht=Math.max(chkDim+8,(evt.duration/60)*HOUR_H);
          return(
            <div key={evt.id} style={{position:"absolute",top,left:2,right:2,height:ht,background:`${C.yellow}18`,borderLeft:`4px solid ${C.yellow}`,overflow:"hidden",zIndex:2,cursor:"pointer"}} onClick={()=>setModal({type:"editEvt",evt})}>
              <div style={{display:"flex",gap,padding:pad,alignItems:"flex-start"}}>
                <div onClick={e=>{e.stopPropagation();toggle("event",evt.id,day);}} style={{width:chkDim,height:chkDim,border:`2px solid ${C.yellow}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:chkDim-6,color:evt.done?C.bg:C.yellow,background:evt.done?C.yellow:"transparent",cursor:"pointer",flexShrink:0,marginTop:2}}>
                  {evt.done?"✓":""}
                </div>
                <div>
                  <div style={{...PX,fontSize:titleSz,color:C.yellow,lineHeight:lh,textDecoration:evt.done?"line-through":"none"}}>{evt.title}</div>
                  <div style={{...PX,fontSize:timeSz,color:`${C.yellow}bb`,lineHeight:lh,marginTop:2}}>{evt.startTime} · {evt.duration}m</div>
                </div>
              </div>
            </div>
          );
        })}
        {sched.map(sc=>{
          const task=taskMap[sc.taskId]; if(!task)return null;
          const col=UC[task.urgency];
          const top=minToY(sc.startMin);
          const ht=Math.max(chkDim+8,(sc.duration/60)*HOUR_H);
          return(
            <div key={sc.id} style={{position:"absolute",top,left:2,right:2,height:ht,background:`${col}18`,borderLeft:`4px solid ${col}`,overflow:"hidden",zIndex:1}}>
              <div style={{display:"flex",gap,padding:pad,alignItems:"flex-start"}}>
                <div onClick={()=>toggle("scheduled",sc.id,day)} style={{width:chkDim,height:chkDim,border:`2px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:chkDim-6,color:sc.done?C.bg:col,background:sc.done?col:"transparent",cursor:"pointer",flexShrink:0,marginTop:2}}>
                  {sc.done?"✓":""}
                </div>
                <div>
                  <div style={{...PX,fontSize:titleSz,color:col,lineHeight:lh,textDecoration:sc.done?"line-through":"none"}}>{task.title}{task.recurring?" ↻":""}</div>
                  <div style={{...PX,fontSize:timeSz,color:`${col}bb`,lineHeight:lh,marginTop:2}}>{minToTime(sc.startMin)} · {sc.duration}m</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"7px 14px",borderBottom:`2px solid ${C.blue}`,background:C.bg2,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Btn onClick={()=>navigate(-1)} bg={C.blueD} sx={{fontSize:13,padding:"5px 10px"}}>◀</Btn>
        <div style={{textAlign:"center"}}>
          <div style={{...PX,fontSize:9,color:C.yellow}}>{rangeLabel}</div>
          <div style={{...PX,fontSize:13,color:C.orange,marginTop:3}}>🔥 {streak} DAY STREAK</div>
        </div>
        <Btn onClick={()=>navigate(1)} bg={C.blueD} sx={{fontSize:13,padding:"5px 10px"}}>▶</Btn>
      </div>

      <div style={{padding:"5px 12px",borderBottom:`1px solid ${C.borderDim}`,background:C.bg2,flexShrink:0,display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:4}}>
          {["1D","3D","1W","1M"].map(v=>(
            <button key={v} onClick={()=>setCalView(v)} style={{...PX,fontSize:8,padding:"4px 8px",cursor:"pointer",background:calView===v?C.blue:"transparent",color:calView===v?C.yellow:C.dim,border:`2px solid ${calView===v?C.blue:C.dimmer}`}}>{v}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>setModal({type:"addEvt"})} bg={C.yellow} tc={C.bg} sx={{fontSize:9,padding:"5px 9px"}}>+ APPOINTMENT</Btn>
          <Btn onClick={()=>{setState(prev=>({...prev,schedule:autoSchedule(prev)}));playBeep("notify");}} bg={C.orange} tc={C.bg} sx={{fontSize:9,padding:"5px 9px"}}>⚡ RESCHEDULE</Btn>
        </div>
      </div>

      {calView==="1M"?(
        <div style={{flex:1,overflowY:"auto",padding:8}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d=>(
              <div key={d} style={{...PX,fontSize:8,color:C.blue,textAlign:"center",padding:"4px 0"}}>{d}</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {(()=>{
              const[y,m]=state.weekAnchor.split("-").map(Number);
              const firstDow=new Date(y,m-1,1).getDay();
              const cells=Array(firstDow).fill(null).concat(displayDays);
              while(cells.length%7!==0)cells.push(null);
              return cells.map((day,i)=>{
                if(!day)return <div key={i}/>;
                const isToday=day===td;
                const evts=state.events.filter(e=>e.date===day);
                const sched=state.schedule.filter(s=>s.date===day);
                const total=evts.length+sched.length;
                const done=evts.filter(e=>e.done).length+sched.filter(s=>s.done).length;
                const perfect=state.completionLog[day]?.perfect;
                return(
                  <div key={day} onClick={()=>{setState(p=>({...p,weekAnchor:day}));setCalView("1D");}}
                    style={{background:isToday?`${C.yellow}22`:C.bg2,border:`1px solid ${isToday?C.yellow:C.borderDim}`,minHeight:76,padding:"5px 6px",cursor:"pointer"}}>
                    <div style={{...PX,fontSize:11,color:isToday?C.yellow:C.white}}>{day.slice(8)}</div>
                    {perfect&&<div style={{...PX,fontSize:7,color:C.orange}}>★</div>}
                    {total>0&&<div style={{...PX,fontSize:7,color:C.dim,marginTop:2}}>{done}/{total}</div>}
                    <div style={{display:"flex",flexWrap:"wrap",gap:2,marginTop:4}}>
                      {evts.map(e=><div key={e.id} style={{width:7,height:7,background:C.yellow,opacity:e.done?.35:1}}/>)}
                      {sched.map(s=>{const t=taskMap[s.taskId];return t?<div key={s.id} style={{width:7,height:7,background:UC[t.urgency]||C.blue,opacity:s.done?.35:1}}/>:null;})}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ):(
        <>
          <div style={{display:"flex",flexShrink:0,borderBottom:`1px solid ${C.borderDim}`}}>
            <div style={{width:44,flexShrink:0}}/>
            {displayDays.map(day=>{
              const isToday=day===td;
              const cap=state.settings.dayOverrides[day]??state.settings.maxHrsDefault;
              const perfect=state.completionLog[day]?.perfect;
              return(
                <div key={day} style={{flex:1,textAlign:"center",padding:calView==="1D"?"8px 4px":"4px 1px",background:isToday?C.yellow:C.bg2,borderLeft:`1px solid ${C.borderDim}`}}>
                  <div style={{...PX,fontSize:calView==="1D"?14:calView==="3D"?11:8,color:isToday?C.bg:C.blue,lineHeight:1.8}}>{dayName(day)}</div>
                  <div style={{...PX,fontSize:calView==="1D"?24:calView==="3D"?17:11,color:isToday?C.bg:C.white,lineHeight:1.6}}>{day.slice(8)}</div>
                  {perfect&&<div style={{...PX,fontSize:8,color:isToday?C.bg:C.orange}}>★ PERFECT</div>}
                  {capEdit===day
                    ?<input type="number" defaultValue={cap} min={1} max={16} step={.5} autoFocus
                        style={{...PX,width:"100%",fontSize:9,padding:"2px",background:C.bg,color:C.white,border:`1px solid ${C.orange}`}}
                        onBlur={e=>setDayCap(day,+e.target.value)}
                        onKeyDown={e=>{if(e.key==="Enter")setDayCap(day,+e.target.value);if(e.key==="Escape")setCapEdit(null);}}/>
                    :<div style={{...PX,fontSize:7,color:isToday?`${C.bg}aa`:C.dim,cursor:"pointer",marginTop:2}} onClick={()=>setCapEdit(day)}>
                        {cap}h cap{state.settings.dayOverrides[day]?" ✎":""}
                      </div>
                  }
                </div>
              );
            })}
          </div>

          <div style={{flex:1,overflowY:"auto"}}>
            <div style={{display:"flex",height:HOURS.length*HOUR_H}}>
              <div style={{width:44,flexShrink:0,position:"relative"}}>
                {HOURS.map(h=>(
                  <div key={h} style={{...PX,position:"absolute",top:(h-CAL_S)*HOUR_H-10,right:6,fontSize:10,color:C.dim,textAlign:"right",lineHeight:1.8}}>
                    {h>12?`${h-12}PM`:h===12?"12PM":`${h}AM`}
                  </div>
                ))}
              </div>
              {displayDays.map(day=><DayCol key={day} day={day} calView={calView}/>)}
            </div>
          </div>
        </>
      )}

      {modal?.type==="addEvt"&&<Modal title="+ ADD APPOINTMENT" onClose={()=>setModal(null)}><EventForm onSave={d=>saveEvt(d,null)} onClose={()=>setModal(null)}/></Modal>}
      {modal?.type==="editEvt"&&(
        <Modal title="EDIT APPOINTMENT" onClose={()=>setModal(null)}>
          <EventForm init={modal.evt} onSave={d=>saveEvt(d,modal.evt.id)} onClose={()=>setModal(null)}/>
          <div style={{marginTop:10}}><Btn onClick={()=>delEvt(modal.evt.id)} bg={C.red} tc={C.yellow} sx={{fontSize:9}}>DELETE APPOINTMENT</Btn></div>
        </Modal>
      )}
    </div>
  );
}
