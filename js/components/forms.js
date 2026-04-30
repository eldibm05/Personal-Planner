function TaskForm({init={},onSave,onClose}){
  const[f,setF]=useState({title:"",duration:30,urgency:2,difficulty:2,dueDate:"",recurring:false,freq:"daily",...init});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div>
      <Lbl t="TITLE"><Inp value={f.title} onChange={e=>s("title",e.target.value)} placeholder="Task name..."/></Lbl>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Lbl t="DURATION (MIN)"><Inp type="number" value={f.duration} onChange={e=>s("duration",+e.target.value)} min={5} step={5}/></Lbl>
        <Lbl t="DUE DATE"><Inp type="date" value={f.dueDate} onChange={e=>s("dueDate",e.target.value)}/></Lbl>
        <Lbl t={`URGENCY: ${UL[f.urgency]}`}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <input type="range" min={1} max={5} value={f.urgency} onChange={e=>s("urgency",+e.target.value)} style={{flex:1,accentColor:UC[f.urgency]}}/>
            <span style={{...PX,fontSize:10,color:UC[f.urgency],minWidth:10}}>{f.urgency}</span>
          </div>
        </Lbl>
        <Lbl t={`DIFFICULTY: ${f.difficulty}/5`}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <input type="range" min={1} max={5} value={f.difficulty} onChange={e=>s("difficulty",+e.target.value)} style={{flex:1}}/>
            <span style={{...PX,fontSize:10,color:C.white,minWidth:10}}>{f.difficulty}</span>
          </div>
        </Lbl>
      </div>
      <Lbl t="RECURRING">
        <label style={{...PX,display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:10,color:f.recurring?C.yellow:C.dim}}>
          <input type="checkbox" checked={f.recurring} onChange={e=>s("recurring",e.target.checked)} style={{width:"auto",accentColor:C.yellow}}/>
          RECURRING TASK
        </label>
      </Lbl>
      {f.recurring&&<Lbl t="FREQUENCY"><Sel value={f.freq} onChange={e=>s("freq",e.target.value)} opts={FREQS}/></Lbl>}
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn onClick={()=>{if(f.title){onSave(f);playBeep("done");}}} bg={C.green}>SAVE</Btn>
        <Btn onClick={onClose} bg={C.dim} tc={C.white}>CANCEL</Btn>
      </div>
    </div>
  );
}

function EventForm({init={},onSave,onClose}){
  const[f,setF]=useState({title:"",date:today(),startTime:"09:00",duration:60,...init});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(
    <div>
      <Lbl t="TITLE"><Inp value={f.title} onChange={e=>s("title",e.target.value)} placeholder="Appointment name..."/></Lbl>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Lbl t="DATE"><Inp type="date" value={f.date} onChange={e=>s("date",e.target.value)}/></Lbl>
        <Lbl t="START TIME"><Inp type="time" value={f.startTime} onChange={e=>s("startTime",e.target.value)}/></Lbl>
        <Lbl t="DURATION (MIN)"><Inp type="number" value={f.duration} onChange={e=>s("duration",+e.target.value)} min={15} step={15}/></Lbl>
      </div>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn onClick={()=>{if(f.title){onSave(f);playBeep("done");}}} bg={C.green}>SAVE</Btn>
        <Btn onClick={onClose} bg={C.dim} tc={C.white}>CANCEL</Btn>
      </div>
    </div>
  );
}

function ProjectForm({init={},onSave,onClose}){
  const[f,setF]=useState({name:"",dueDate:"",color:C.red,...init});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const COLS=[C.red,C.blue,C.orange,C.green,C.yellow];
  return(
    <div>
      <Lbl t="PROJECT NAME"><Inp value={f.name} onChange={e=>s("name",e.target.value)} placeholder="Project name..."/></Lbl>
      <Lbl t="DUE DATE"><Inp type="date" value={f.dueDate||""} onChange={e=>s("dueDate",e.target.value)}/></Lbl>
      <Lbl t="COLOR">
        <div style={{display:"flex",gap:8,marginTop:4}}>
          {COLS.map(c=><div key={c} onClick={()=>s("color",c)} style={{width:24,height:24,background:c,cursor:"pointer",border:f.color===c?`3px solid ${C.white}`:"3px solid transparent"}}/>)}
        </div>
      </Lbl>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <Btn onClick={()=>{if(f.name)onSave(f);}} bg={C.green}>SAVE</Btn>
        <Btn onClick={onClose} bg={C.dim} tc={C.white}>CANCEL</Btn>
      </div>
    </div>
  );
}
