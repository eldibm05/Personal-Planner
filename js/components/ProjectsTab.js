function ProjectsTab({state,setState}){
  const[modal,setModal]=useState(null);

  const saveTask=(pid,task,editId)=>{
    setState(prev=>{
      const s=JSON.parse(JSON.stringify(prev));
      if(pid){
        const p=s.projects.find(p=>p.id===pid);
        if(editId){const i=p.tasks.findIndex(t=>t.id===editId);p.tasks[i]={...p.tasks[i],...task};}
        else p.tasks.push({id:uid(),done:false,...task});
      } else {
        if(editId){const i=s.standaloneTasks.findIndex(t=>t.id===editId);s.standaloneTasks[i]={...s.standaloneTasks[i],...task};}
        else s.standaloneTasks.push({id:uid(),done:false,...task});
      }
      s.schedule=autoSchedule(s); return s;
    }); setModal(null);
  };

  const delTask=(pid,tid)=>setState(prev=>{
    const s=JSON.parse(JSON.stringify(prev));
    if(pid){const p=s.projects.find(p=>p.id===pid);p.tasks=p.tasks.filter(t=>t.id!==tid);}
    else s.standaloneTasks=s.standaloneTasks.filter(t=>t.id!==tid);
    s.schedule=autoSchedule(s); return s;
  });

  const saveProj=(proj,editId)=>{
    setState(prev=>{
      const s=JSON.parse(JSON.stringify(prev));
      if(editId){const i=s.projects.findIndex(p=>p.id===editId);s.projects[i]={...s.projects[i],...proj};}
      else s.projects.push({id:uid(),tasks:[],...proj});
      return s;
    }); setModal(null);
  };

  const delProj=pid=>setState(prev=>{
    const s=JSON.parse(JSON.stringify(prev));
    s.projects=s.projects.filter(p=>p.id!==pid);
    s.schedule=autoSchedule(s); return s;
  });

  const pct=proj=>proj.tasks.length?Math.round(proj.tasks.filter(t=>t.done).length/proj.tasks.length*100):0;

  const TRow=({task,pid})=>{
    const col=UC[task.urgency];
    return(
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",borderLeft:`3px solid ${col}`,background:C.bg3,marginBottom:2}}>
        <div style={{flex:1}}>
          <div style={{...PX,fontSize:10,color:task.done?C.dim:C.white,textDecoration:task.done?"line-through":"none"}}>{task.title}</div>
          <div style={{...PX,fontSize:8,color:C.dim,marginTop:4,display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{color:col}}>{UL[task.urgency]}</span>
            <span>{task.duration}MIN</span>
            {task.dueDate&&<span>DUE {fmtDate(task.dueDate)}</span>}
            {task.recurring&&<span style={{color:C.orange}}>↻ {task.freq.toUpperCase()}</span>}
          </div>
        </div>
        <Btn onClick={()=>setModal({type:"editTask",pid,task})} bg={C.blueD} tc={C.white} sx={{fontSize:8,padding:"3px 6px"}}>EDIT</Btn>
        <Btn onClick={()=>delTask(pid,task.id)} bg={C.red} tc={C.yellow} sx={{fontSize:8,padding:"3px 6px"}}>DEL</Btn>
      </div>
    );
  };

  return(
    <div style={{padding:14,overflowY:"auto",height:"100%"}}>
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{...PX,fontSize:15,color:C.yellow,lineHeight:1.8}}>▸ STANDALONE TASKS</span>
          <Btn onClick={()=>setModal({type:"addTask",pid:null})} bg={C.blue} sx={{fontSize:9,padding:"5px 9px"}}>+ ADD TASK</Btn>
        </div>
        {state.standaloneTasks.length===0&&<div style={{...PX,fontSize:9,color:C.dim,padding:"8px 0"}}>NO TASKS YET. PRESS + ADD TASK TO START.</div>}
        {state.standaloneTasks.map(t=><TRow key={t.id} task={t} pid={null}/>)}
      </div>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{...PX,fontSize:15,color:C.yellow,lineHeight:1.8}}>▸ PROJECTS</span>
        <Btn onClick={()=>setModal({type:"addProject"})} bg={C.red} tc={C.yellow} sx={{fontSize:9,padding:"5px 9px"}}>+ NEW PROJECT</Btn>
      </div>

      {state.projects.map(proj=>{
        const p=pct(proj);
        return(
          <div key={proj.id} style={{marginBottom:16,border:`2px solid ${proj.color}22`,background:C.bg2}}>
            <div style={{background:proj.color,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <span style={{...PX,fontSize:15,color:C.yellow,lineHeight:1.8}}>{proj.name}</span>
                {proj.dueDate&&<span style={{...PX,fontSize:8,color:`${C.yellow}cc`,marginLeft:10}}>DUE {fmtDate(proj.dueDate)}</span>}
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <span style={{...PX,fontSize:9,color:C.yellow}}>{p}%</span>
                <Btn onClick={()=>setModal({type:"editProject",proj})} bg="rgba(0,0,0,.35)" tc={C.yellow} sx={{fontSize:8,padding:"2px 6px"}}>EDIT</Btn>
                <Btn onClick={()=>delProj(proj.id)} bg="rgba(0,0,0,.35)" tc={C.yellow} sx={{fontSize:8,padding:"2px 6px"}}>DEL</Btn>
              </div>
            </div>
            <div style={{height:4,background:C.dimmer}}><div style={{height:"100%",width:`${p}%`,background:C.green,transition:"width .3s"}}/></div>
            <div style={{padding:8}}>
              {proj.tasks.map(t=><TRow key={t.id} task={t} pid={proj.id}/>)}
              <Btn onClick={()=>setModal({type:"addTask",pid:proj.id})} bg={C.bg3} tc={C.blue} sx={{fontSize:8,padding:"5px 9px",marginTop:6,border:`1px solid ${C.blue}`}}>+ ADD TASK</Btn>
            </div>
          </div>
        );
      })}

      <div style={{marginTop:20,textAlign:"center"}}>
        <Btn onClick={()=>{setState(prev=>({...prev,schedule:autoSchedule(prev)}));playBeep("notify");}} bg={C.orange} tc={C.bg} sx={{fontSize:11,padding:"10px 22px"}}>⚡ AUTO-SCHEDULE WEEK</Btn>
      </div>

      {modal?.type==="addTask"&&<Modal title="+ NEW TASK" onClose={()=>setModal(null)}><TaskForm onSave={t=>saveTask(modal.pid,t,null)} onClose={()=>setModal(null)}/></Modal>}
      {modal?.type==="editTask"&&<Modal title="EDIT TASK" onClose={()=>setModal(null)}><TaskForm init={modal.task} onSave={t=>saveTask(modal.pid,t,modal.task.id)} onClose={()=>setModal(null)}/></Modal>}
      {modal?.type==="addProject"&&<Modal title="+ NEW PROJECT" onClose={()=>setModal(null)}><ProjectForm onSave={p=>saveProj(p,null)} onClose={()=>setModal(null)}/></Modal>}
      {modal?.type==="editProject"&&<Modal title="EDIT PROJECT" onClose={()=>setModal(null)}><ProjectForm init={modal.proj} onSave={p=>saveProj(p,modal.proj.id)} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}
