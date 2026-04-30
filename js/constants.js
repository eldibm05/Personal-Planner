const C = {
  bg:"#080808", bg2:"#0a0a14", bg3:"#0d0d1e",
  blue:"#4466cc", blueD:"#2233aa",
  red:"#cc3322", yellow:"#ffcc00", orange:"#ff6600",
  green:"#33aa44", white:"#ddddcc",
  dim:"#444455", dimmer:"#1a1a2e", borderDim:"#1a1a3a",
};
const UL = ["","LOW","NORMAL","HIGH","URGENT","CRITICAL"];
const UC = ["",C.dim,C.blue,C.green,C.orange,C.red];
const FREQS = ["daily","weekdays","weekly"];
const HOUR_H = 72, CAL_S = 9, CAL_E = 21;
const HOURS = Array.from({length:CAL_E-CAL_S},(_,i)=>CAL_S+i);
const PX = {fontFamily:"'Press Start 2P',monospace"};
