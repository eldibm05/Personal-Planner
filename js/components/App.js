// ─────────────────────────────────────────────────────────────────────────────
// App.js — root component and ReactDOM bootstrap
// Manages top-level auth state, active tab, and the single shared app state
// object that gets passed down to all tab components.
// ─────────────────────────────────────────────────────────────────────────────
function App(){
  // authed is checked first — if false, only LoginScreen is rendered
  const[authed,setAuthed]=useState(()=>localStorage.getItem(AUTH_KEY)==="1");
  const[state,setRaw]=useState(loadState);
  const[tab,setTab]=useState("CALENDAR"); // active tab: "PROJECTS" | "CALENDAR" | "ANALYTICS"
  const[showSettings,setShowSettings]=useState(false);

  // Wrapped setState that persists every change to localStorage automatically
  const setState=useCallback(upd=>setRaw(prev=>{
    const next=typeof upd==="function"?upd(prev):upd;
    saveState(next); return next;
  }),[]);

  // On login (or first load after auth), run the scheduler and request
  // notification permission if not already granted
  useEffect(()=>{
    if(!authed)return;
    if(!state.schedule.length)setState(prev=>({...prev,schedule:autoSchedule(prev)}));
    if("Notification"in window&&Notification.permission==="default")Notification.requestPermission();
  },[authed]);

  // Show the lock screen until authenticated
  if(!authed) return <LoginScreen onUnlock={()=>setAuthed(true)}/>;

  const TABS=["PROJECTS","CALENDAR","ANALYTICS"];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg,fontFamily:"'Press Start 2P',monospace",color:C.white}}>

      {/* ── Main navigation header ── */}
      <div style={{background:C.bg2,borderBottom:`3px solid ${C.blue}`,padding:"8px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        {/* Logo */}
        <div>
          <div style={{...PX,fontSize:22,color:C.red,letterSpacing:4,lineHeight:1.6}}>ARCADE</div>
          <div style={{...PX,fontSize:12,color:C.yellow,letterSpacing:2,marginTop:2,lineHeight:1.6}}>PLANNER v1.0</div>
        </div>

        {/* Tab buttons */}
        <div style={{display:"flex"}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{...PX,background:tab===t?C.red:"transparent",color:tab===t?C.yellow:C.dim,border:`2px solid ${tab===t?C.red:C.dimmer}`,fontSize:13,padding:"9px 16px",cursor:"pointer"}}>
              {t}
            </button>
          ))}
        </div>

        {/* Settings + lock buttons */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowSettings(true)} style={{...PX,background:"none",border:`2px solid ${C.dim}`,color:C.dim,fontSize:11,padding:"5px 9px",cursor:"pointer"}}>⚙</button>
          {/* Lock: clears auth flag and returns to login screen */}
          <button onClick={()=>{localStorage.removeItem(AUTH_KEY);setAuthed(false);}} style={{...PX,background:"none",border:`2px solid ${C.dim}`,color:C.dim,fontSize:11,padding:"5px 9px",cursor:"pointer"}}>🔒</button>
        </div>
      </div>

      {/* "Now / Next" bar — hidden when nothing is scheduled for today */}
      <NowBar state={state}/>

      {/* ── Tab content ── */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="PROJECTS"&&<ProjectsTab state={state} setState={setState}/>}
        {tab==="CALENDAR"&&<CalendarTab state={state} setState={setState}/>}
        {tab==="ANALYTICS"&&<AnalyticsTab state={state}/>}
      </div>

      {/* Settings modal (rendered outside the tab container so it overlays everything) */}
      {showSettings&&(
        <Settings settings={state.settings}
          onSave={s=>{setState(prev=>{const next={...prev,settings:{...prev.settings,...s}};next.schedule=autoSchedule(next);return next;});setShowSettings(false);}}
          onClose={()=>setShowSettings(false)}/>
      )}
    </div>
  );
}

// Mount the React tree into the #root div
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
