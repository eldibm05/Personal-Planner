function LoginScreen({onUnlock}){
  const[pw,setPw]=useState("");
  const[err,setErr]=useState(false);
  const[shake,setShake]=useState(false);

  const attempt=()=>{
    if(pw===PASSWORD){
      localStorage.setItem(AUTH_KEY,"1");
      onUnlock();
    } else {
      setErr(true);
      setShake(true);
      setPw("");
      playBeep("warn");
      setTimeout(()=>setShake(false),500);
    }
  };

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,gap:24}}>
      <div style={{...PX,fontSize:18,color:C.red,letterSpacing:6,textAlign:"center"}}>ARCADE</div>
      <div style={{...PX,fontSize:10,color:C.yellow,letterSpacing:3,marginTop:-18}}>PLANNER v1.0</div>
      <div style={{border:`3px solid ${C.blue}`,background:C.bg2,padding:"28px 32px",maxWidth:320,width:"90%",animation:shake?"shake .4s ease":"none"}}>
        <div style={{...PX,fontSize:10,color:C.yellow,marginBottom:18,textAlign:"center"}}>▸ ENTER PASSWORD</div>
        <Inp
          type="password"
          value={pw}
          onChange={e=>{setPw(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter"&&attempt()}
          placeholder="password..."
          autoFocus
          style={{marginBottom:14}}
        />
        {err&&<div style={{...PX,fontSize:9,color:C.red,marginBottom:12,textAlign:"center"}}>WRONG PASSWORD</div>}
        <Btn onClick={attempt} bg={C.red} tc={C.yellow} sx={{width:"100%",padding:"10px",fontSize:11}}>UNLOCK</Btn>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
}
