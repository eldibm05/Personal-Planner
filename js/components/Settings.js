// ─────────────────────────────────────────────────────────────────────────────
// Settings.js — work-hours settings modal
// Lets the user set the default working window and max hours per day.
// Individual day overrides are set by clicking a day header in the calendar.
// ─────────────────────────────────────────────────────────────────────────────
function Settings({settings,onSave,onClose}){
  // Local form state initialised from the current settings
  const[f,setF]=useState({
    sh:Math.floor(settings.workStart/60),  // work start hour (0–23)
    eh:Math.floor(settings.workEnd/60),    // work end hour (1–24)
    max:settings.maxHrsDefault,            // default max hours per day
  });
  const s=(k,v)=>setF(p=>({...p,[k]:v}));

  return(
    <Modal title="⚙ SETTINGS" onClose={onClose}>
      <Lbl t="WORK START HOUR (0-23)"><Inp type="number" value={f.sh} min={0} max={23} onChange={e=>s("sh",+e.target.value)}/></Lbl>
      <Lbl t="WORK END HOUR (1-24)"><Inp type="number" value={f.eh} min={1} max={24} onChange={e=>s("eh",+e.target.value)}/></Lbl>
      <Lbl t="DEFAULT MAX HRS/DAY"><Inp type="number" value={f.max} min={1} max={16} step={.5} onChange={e=>s("max",+e.target.value)}/></Lbl>
      <div style={{...PX,fontSize:9,color:C.dim,marginBottom:14,lineHeight:2.2}}>
        TIP: CLICK ANY DAY HEADER IN CALENDAR TO OVERRIDE THAT DAY'S CAP
      </div>
      <div style={{display:"flex",gap:8}}>
        {/* Convert hours back to minutes before saving */}
        <Btn onClick={()=>{onSave({workStart:f.sh*60,workEnd:f.eh*60,maxHrsDefault:f.max});playBeep("done");}} bg={C.green}>SAVE</Btn>
        <Btn onClick={onClose} bg={C.dim} tc={C.white}>CANCEL</Btn>
      </div>
    </Modal>
  );
}
