// Change this to whatever password you want:
const PASSWORD = "arcade123";
const AUTH_KEY = "arcadePlannerAuth";

const defaultState = () => ({
  projects:[{id:uid(),name:"Sample Project",color:C.red,dueDate:"",tasks:[
    {id:uid(),title:"Write report",duration:60,urgency:4,difficulty:3,dueDate:addDays(today(),3),recurring:false,freq:"daily",done:false},
    {id:uid(),title:"Research phase",duration:90,urgency:3,difficulty:4,dueDate:addDays(today(),5),recurring:false,freq:"daily",done:false},
  ]}],
  standaloneTasks:[
    {id:uid(),title:"Morning workout",duration:45,urgency:2,difficulty:2,dueDate:"",recurring:true,freq:"daily",done:false},
  ],
  events:[], schedule:[], completionLog:{},
  settings:{workStart:9*60,workEnd:21*60,maxHrsDefault:6,dayOverrides:{}},
  weekAnchor:today(),
});

function loadState(){try{const s=localStorage.getItem("arcadePlannerV1");return s?JSON.parse(s):defaultState();}catch{return defaultState();}}
function saveState(s){try{localStorage.setItem("arcadePlannerV1",JSON.stringify(s));}catch{}}
