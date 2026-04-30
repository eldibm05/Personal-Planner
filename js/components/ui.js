// Expose React hooks globally so all component files can use them without re-declaring
window.useState    = React.useState;
window.useEffect   = React.useEffect;
window.useCallback = React.useCallback;
window.useRef      = React.useRef;

const Btn = window.Btn = ({onClick,bg=C.blue,tc=C.yellow,children,sx={}}) => (
  <button onClick={onClick} style={{...PX,background:bg,border:"none",color:tc,fontSize:10,padding:"7px 10px",cursor:"pointer",...sx}}>{children}</button>
);

const Lbl = window.Lbl = ({t,children}) => (
  <div style={{marginBottom:11}}>
    <div style={{...PX,fontSize:9,color:C.dim,marginBottom:4}}>{t}</div>
    {children}
  </div>
);

const inp = window.inp = {background:C.bg2,color:C.white,border:`2px solid ${C.blue}`,padding:"5px 7px",fontSize:10,width:"100%",outline:"none",...PX};

const Inp = window.Inp = (props) => <input {...props} style={{...inp,...(props.style||{})}}/>;

const Sel = window.Sel = ({value,onChange,opts}) => (
  <select value={value} onChange={onChange} style={{...inp}}>
    {opts.map(o=><option key={o} value={o}>{o.toUpperCase()}</option>)}
  </select>
);

function Modal({title,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div style={{background:C.bg2,border:`3px solid ${C.blue}`,maxWidth:440,width:"100%",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{background:C.red,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{...PX,fontSize:14,color:C.yellow,lineHeight:1.8}}>{title}</span>
          <button onClick={onClose} style={{...PX,background:"none",border:"none",color:C.yellow,fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:14}}>{children}</div>
      </div>
    </div>
  );
}
window.Modal = Modal;
