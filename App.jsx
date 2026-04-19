import { useState, useEffect, useCallback, useMemo } from "react";

const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const SHORT=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
function defaultData(){const d=MONTHS.map(()=>({objMB:0,realMB:0,visites:0,nbVA:0,va:0,parrSig:0,parrColl:0,avis:0,impayes:0}));d[0]={objMB:29979,realMB:8585,visites:28,nbVA:0,va:0,parrSig:4,parrColl:1,avis:10,impayes:0};d[1]={objMB:35521,realMB:0,visites:0,nbVA:0,va:0,parrSig:0,parrColl:2,avis:0,impayes:0};return d;}
const calcPV=v=>{if(v<=0)return 0;if(v<=30)return v*15;if(v<=40)return 30*15+(v-30)*20;return 30*15+10*20+(v-40)*25};
const calcCV=va=>{if(va<3000)return 0;if(va<=6000)return va*.08;if(va<=9000)return va*.09;return Math.min(va,15000)*.10};
const calcPP=n=>n*300+(n>=3?100:0);const calcPI=m=>m*.10;
const calcPM=(o,r)=>{if(o<=0)return 0;let p=r*.02;const x=(r/o)*100;if(x>=150)p+=500;else if(x>=120)p+=300;return p};
const calcBP=(o,r)=>(o>0&&o<20000&&r>=o)?150:0;
const calcMonth=m=>{const pv=calcPV(m.visites),cv=calcCV(m.va),pp=calcPP(m.parrSig),pi=calcPI(m.impayes),pm=calcPM(m.objMB,m.realMB),bp=calcBP(m.objMB,m.realMB);return{pv,cv,pp,pi,pm,bp,total:pv+cv+pp+pi+pm+bp}};
const fmt=n=>n.toLocaleString("fr-FR",{maximumFractionDigits:0});const fmtE=n=>fmt(n)+" €";const pct=(a,b)=>b>0?((a/b)*100):0;

function Progress({value,max,label,suffix=""}){const p=Math.min(pct(value,max),100);const c=p>=100?"#00ff88":p>=60?"#00b4ff":p>=30?"#ff6b35":"#ff3366";return(<div style={{marginTop:4}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6b7d8e",marginBottom:2}}><span>{label} {fmt(pct(value,max))}%</span><span>{fmt(value)}{suffix}/{fmt(max)}{suffix}</span></div><div style={{height:4,background:"#111825",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${c}88,${c})`,borderRadius:2,transition:"width .4s",boxShadow:`0 0 8px ${c}44`}}/></div></div>);}
function Field({icon,label,value,onChange,suffix,small}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #ffffff06"}}><span style={{fontSize:12,color:"#6b7d8e"}}>{icon} {label}</span><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} min="0" style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:5,padding:"4px 6px",fontFamily:"monospace",fontSize:12,color:"#66d9ff",width:small?50:85,textAlign:"right",outline:"none"}} onFocus={e=>{e.target.style.borderColor="#00b4ff";e.target.style.boxShadow="0 0 8px #00b4ff44"}} onBlur={e=>{e.target.style.borderColor="#1a2535";e.target.style.boxShadow="none"}}/>{suffix&&<span style={{fontSize:10,color:"#3a4a5a",minWidth:16}}>{suffix}</span>}</div></div>);}
function PrimeLine({label,value}){return(<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:11}}><span style={{color:"#6b7d8e"}}>{label}</span><span style={{fontFamily:"monospace",color:value>0?"#00ff88":"#3a4a5a"}}>{fmtE(value)}</span></div>);}
function Stat({label,value,color,sub}){const cols={neon:"#00b4ff",accent:"#00ff88",gold:"#ffd700",warn:"#ff6b35",danger:"#ff3366"};const c=cols[color]||cols.neon;return(<div style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:10,padding:"10px 8px",textAlign:"center",minWidth:0}}><div style={{fontSize:9,color:"#6b7d8e",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{label}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:c,textShadow:`0 0 12px ${c}44`}}>{value}</div>{sub&&<div style={{fontSize:9,color:"#3a4a5a",marginTop:2}}>{sub}</div>}</div>);}
function MonthContent({m,idx,update}){const prime=calcMonth(m);const set=(f,v)=>update(idx,f,v);return(<div style={{padding:"12px 16px"}}><Field icon="🎯" label="Objectif MB Renouv" value={m.objMB} onChange={v=>set("objMB",v)} suffix="€"/><Field icon="✅" label="Réalisé MB Renouv" value={m.realMB} onChange={v=>set("realMB",v)} suffix="€"/><Field icon="👤" label="Visites réalisées" value={m.visites} onChange={v=>set("visites",v)} suffix="/41" small/><Field icon="📊" label="Nombre de VA" value={m.nbVA} onChange={v=>set("nbVA",v)} suffix="/4" small/><Field icon="🚀" label="VA réalisée" value={m.va} onChange={v=>set("va",v)} suffix="€"/><Field icon="🤝" label="Parrainages signés" value={m.parrSig} onChange={v=>set("parrSig",v)} suffix="/3" small/><Field icon="📬" label="Parrainages collectés" value={m.parrColl} onChange={v=>set("parrColl",v)} suffix="/30" small/><Field icon="⭐" label="Avis collectés" value={m.avis} onChange={v=>set("avis",v)} suffix="/10" small/><Field icon="💸" label="Impayés récupérés" value={m.impayes} onChange={v=>set("impayes",v)} suffix="€"/><Progress value={m.realMB} max={m.objMB||1} label="MB" suffix=" €"/><Progress value={m.visites} max={41} label="Visites"/><Progress value={m.va} max={6000} label="VA" suffix=" €"/><div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #ffffff0a"}}><PrimeLine label="Prime visites" value={prime.pv}/><PrimeLine label="Commission VA" value={prime.cv}/><PrimeLine label="Parrainages signés" value={prime.pp}/><PrimeLine label="Impayés récup." value={prime.pi}/><PrimeLine label="Prime MB Renouv" value={prime.pm}/><PrimeLine label="Bonus ptf <20K" value={prime.bp}/><div style={{marginTop:6,padding:"8px 10px",background:"linear-gradient(135deg,#0a1a10,#0a1520)",border:"1px solid #00ff8833",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00aa55",letterSpacing:".08em"}}>TOTAL PRIME</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:"#00ff88",textShadow:"0 0 12px #00ff8844"}}>{fmtE(prime.total)}</span></div></div></div>);}
function Section({title,color,children,defaultOpen}){const[open,setOpen]=useState(defaultOpen||false);return(<div style={{background:"#0a0f1a",border:`1px solid ${color}22`,borderRadius:12,overflow:"hidden",marginBottom:10}}><div onClick={()=>setOpen(!open)} style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",background:"linear-gradient(135deg,#0d1220,#0a0f1a)"}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color,letterSpacing:".1em"}}>{title}</span><span style={{color:"#3a4a5a",fontSize:14,transition:"transform .2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▼</span></div>{open&&<div style={{padding:"10px 14px"}}>{children}</div>}</div>);}

function PerfChart({m}){
  const metrics=[
    {l:"MB Renouv",v:m.realMB,t:m.objMB||1,c:"#00b4ff"},
    {l:"Visites",v:m.visites,t:41,c:"#00ff88"},
    {l:"VA",v:m.va,t:6000,c:"#ffd700"},
    {l:"Impayés",v:m.impayes,t:2000,c:"#ff6b35"},
    {l:"Parrainages",v:m.parrSig,t:3,c:"#ff3366"},
    {l:"Avis",v:m.avis,t:10,c:"#66d9ff"},
  ];
  const n=metrics.length;
  const cx=185,cy=155,R=90;
  const angle=(i)=>((Math.PI*2*i)/n)-(Math.PI/2);
  const point=(i,r)=>{const a=angle(i);return[cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  const gridLevels=[0.25,0.5,0.75,1];
  const values=metrics.map(x=>Math.min((x.v/(x.t||1)),1));
  const dataPoints=values.map((v,i)=>point(i,v*R));
  const dataPath=dataPoints.map((p,i)=>(i===0?"M":"L")+p[0]+","+p[1]).join(" ")+"Z";
  const avgPct=Math.round(values.reduce((s,v)=>s+v*100,0)/n);

  return(
    <div style={{position:"relative"}}>
      <svg viewBox="0 0 370 320" style={{width:"100%",maxWidth:460,margin:"0 auto",display:"block"}}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#00b4ff" stopOpacity="0.15"/><stop offset="100%" stopColor="#00b4ff" stopOpacity="0"/></radialGradient>
          <linearGradient id="dataFill" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00b4ff" stopOpacity="0.25"/><stop offset="50%" stopColor="#00ff88" stopOpacity="0.15"/><stop offset="100%" stopColor="#ffd700" stopOpacity="0.2"/></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <circle cx={cx} cy={cy} r={R+10} fill="url(#radarGlow)"/>
        {gridLevels.map((lv,li)=>{const pts=Array.from({length:n},(_,i)=>point(i,lv*R));return(<polygon key={li} points={pts.map(p=>p.join(",")).join(" ")} fill="none" stroke="#ffffff" strokeOpacity={0.04+li*0.02} strokeWidth={li===3?1.5:0.5}/>)})}
        {Array.from({length:n},(_,i)=>{const[x,y]=point(i,R);return(<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#ffffff" strokeOpacity="0.06" strokeWidth="0.5"/>)})}
        <polygon points={dataPoints.map(p=>p.join(",")).join(" ")} fill="url(#dataFill)" stroke="url(#dataFill)" strokeWidth="0"/>
        <polygon points={dataPoints.map(p=>p.join(",")).join(" ")} fill="none" stroke="#00b4ff" strokeWidth="2" filter="url(#glow)" strokeLinejoin="round"/>
        {dataPoints.map((p,i)=>{const met=metrics[i];return(<g key={i}><circle cx={p[0]} cy={p[1]} r={4} fill={met.c} filter="url(#glow)"/><circle cx={p[0]} cy={p[1]} r={2} fill="#fff"/></g>)})}
        {metrics.map((met,i)=>{const[x,y]=point(i,R+42);const pctVal=Math.round(values[i]*100);const anchor=x<cx-15?"end":x>cx+15?"start":"middle";const dy=y<cy-20?-2:y>cy+20?12:0;const lx=anchor==="end"?x-4:anchor==="start"?x+4:x;return(<g key={i}><text x={lx} y={y+dy-6} textAnchor={anchor} style={{fontSize:10,fontFamily:"'Orbitron',monospace",fill:met.c,fontWeight:700}}>{met.l}</text><text x={lx} y={y+dy+7} textAnchor={anchor} style={{fontSize:9,fontFamily:"monospace",fill:pctVal>=100?"#00ff88":pctVal>=60?"#ffd700":"#ff3366"}}>{pctVal}%</text></g>)})}
        <text x={cx} y={cy-8} textAnchor="middle" style={{fontSize:22,fontFamily:"'Orbitron',monospace",fill:"#00ff88",fontWeight:900,filter:"url(#glow)"}}>{avgPct}%</text>
        <text x={cx} y={cy+8} textAnchor="middle" style={{fontSize:8,fontFamily:"monospace",fill:"#6b7d8e",letterSpacing:"0.15em"}}>GLOBAL</text>
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginTop:4}}>
        {metrics.map((met,i)=>{const pctVal=Math.round(values[i]*100);return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 6px",background:"#060a14",borderRadius:6,border:`1px solid ${met.c}22`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:met.c,boxShadow:`0 0 4px ${met.c}`}}/>
            <span style={{fontSize:9,color:"#6b7d8e",fontFamily:"monospace"}}>{met.l}</span>
            <span style={{fontSize:9,color:pctVal>=100?"#00ff88":"#e0e8f0",fontFamily:"monospace",fontWeight:600}}>{fmt(met.v)}/{fmt(met.t)}</span>
          </div>
        )})}
      </div>
    </div>
  );
}

export default function App(){
  const[data,setData]=useState(defaultData);const[loaded,setLoaded]=useState(false);const[activeTab,setActiveTab]=useState("dashboard");const[openMonths,setOpenMonths]=useState({});
  const[prepaWeek,setPrepaWeek]=useState(()=>{const n=new Date(),s=new Date(n.getFullYear(),0,1);return Math.ceil(((n-s)/86400000+s.getDay()+1)/7)});
  const[prepaData,setPrepaData]=useState({});const[openFiches,setOpenFiches]=useState({});const[copyMsg,setCopyMsg]=useState("");
  const[todos,setTodos]=useState([]);const[pipeVA,setPipeVA]=useState([]);const[pipeRenouv,setPipeRenouv]=useState([]);const[pipeImpayes,setPipeImpayes]=useState([]);
  const[newTodo,setNewTodo]=useState("");const[newItem,setNewItem]=useState({va:"",renouv:"",imp:""});
  const[notifs,setNotifs]=useState([]);const[newNotif,setNewNotif]=useState({objet:"",date:"",heure:""});
  const[showMoisRef,setShowMoisRef]=useState(false);
  const[showPaste,setShowPaste]=useState(false);const[pasteText,setPasteText]=useState("");
  const[rdvs,setRdvs]=useState({});const[newRdv,setNewRdv]=useState({nom:"",date:"",motif:"Courtoisie"});
  const getRdvKey=idx=>`rdv_${idx}`;const getRdvs=idx=>rdvs[getRdvKey(idx)]||[];const setRdvMonth=(idx,list)=>setRdvs(p=>({...p,[getRdvKey(idx)]:list}));

  const parsePrepa=(txt)=>{
    const f=defaultFiche();const lines=txt.split("\n").map(l=>l.trim()).filter(Boolean);
    const map={"gérant":"gerant","gerant":"gerant","ancienneté":"anciennete","anciennete":"anciennete","dernier commercial":"dernierCo","dernier co":"dernierCo","offre actuelle":"offre","offre":"offre","mois restants":"moisRestants","nb mois restants":"moisRestants","ideo":"ideo","gmb":"gmb","budget sea":"sea","sea":"sea","zone":"zone","mots clés":"motsCles","mots cles":"motsCles","plan a":"planA","plan b":"planB","plan c":"planC"};
    lines.forEach((line,i)=>{
      const clean=line.replace(/^[•\-\*►▶]\s*/,"");
      const match=clean.match(/^([^:]+):\s*(.+)/);
      if(match){const key=match[1].trim().toLowerCase();const val=match[2].trim();const field=map[key];if(field)f[field]=val;}
      else if(i===0&&!clean.includes(":")){f.nom=clean.replace(/^#+\s*/,"").trim();}
    });
    if(!f.nom){const first=lines.find(l=>!l.includes(":"));if(first)f.nom=first.replace(/^[•\-\*►▶#+\s]*/,"").trim();}
    return f;
  };

  const getWK=w=>`S${String(w).padStart(2,"0")}`;const defaultFiche=()=>({nom:"",gerant:"",anciennete:"",dernierCo:"",offre:"",moisRestants:"",ideo:"",gmb:"",sea:"",zone:"",motsCles:"",planA:"",planB:"",planC:""});
  const getWeek=w=>prepaData[getWK(w)]||{trajets:[],fiches:[]};const setWeek=(w,d)=>setPrepaData(p=>({...p,[getWK(w)]:d}));

  useEffect(()=>{(async()=>{try{const r=await window.storage.get("linkeo_cockpit_2026");if(r?.value){const parsed=JSON.parse(r.value);setData(parsed.map(m=>({objMB:m.objMB||0,realMB:m.realMB||0,visites:m.visites||0,nbVA:m.nbVA||0,va:m.va||0,parrSig:m.parrSig||0,parrColl:m.parrColl||0,avis:m.avis||0,impayes:m.impayes||0})))}}catch(e){}try{const r=await window.storage.get("linkeo_prepa_2026");if(r?.value)setPrepaData(JSON.parse(r.value))}catch(e){}try{const r=await window.storage.get("linkeo_v2_2026");if(r?.value){const d=JSON.parse(r.value);if(d.todos)setTodos(d.todos);if(d.pipeVA)setPipeVA(d.pipeVA);if(d.pipeRenouv)setPipeRenouv(d.pipeRenouv);if(d.pipeImpayes)setPipeImpayes(d.pipeImpayes);if(d.notifs)setNotifs(d.notifs);if(d.rdvs)setRdvs(d.rdvs)}}catch(e){}setLoaded(true)})()},[]);
  useEffect(()=>{if(!loaded)return;(async()=>{try{await window.storage.set("linkeo_cockpit_2026",JSON.stringify(data))}catch(e){}})()},[data,loaded]);
  useEffect(()=>{if(!loaded)return;(async()=>{try{await window.storage.set("linkeo_prepa_2026",JSON.stringify(prepaData))}catch(e){}})()},[prepaData,loaded]);
  useEffect(()=>{if(!loaded)return;(async()=>{try{await window.storage.set("linkeo_v2_2026",JSON.stringify({todos,pipeVA,pipeRenouv,pipeImpayes,notifs,rdvs}))}catch(e){}})()},[todos,pipeVA,pipeRenouv,pipeImpayes,notifs,rdvs,loaded]);

  const update=useCallback((i,f,v)=>{setData(p=>{const n=[...p];n[i]={...n[i],[f]:v};return n})},[]);
  const toggleMonth=i=>setOpenMonths(p=>({...p,[i]:!p[i]}));
  const now=new Date();const currentIdx=(now.getFullYear()===2026)?now.getMonth():1;
  const primes=useMemo(()=>data.map(m=>calcMonth(m)),[data]);
  const totals=useMemo(()=>({realMB:data.reduce((s,m)=>s+m.realMB,0),objMB:data.reduce((s,m)=>s+m.objMB,0),visites:data.reduce((s,m)=>s+m.visites,0),va:data.reduce((s,m)=>s+m.va,0),impayes:data.reduce((s,m)=>s+m.impayes,0),parrSig:data.reduce((s,m)=>s+m.parrSig,0)}),[data]);
  const currentM=data[currentIdx];

  const reminders=useMemo(()=>{const r=[];const n=new Date();const day=n.getDay();const date=n.getDate();const last=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();const left=last-date;
    if(day===5)r.push({type:"warn",icon:"📊",text:"TOPO HEBDO — À envoyer avant 12h"});
    if(day===4)r.push({type:"info",icon:"📋",text:"PRÉPAS RDV — Préparer ce soir pour envoi demain"});
    if(day===5&&n.getHours()<12)r.push({type:"warn",icon:"📋",text:"PRÉPAS RDV — Envoi avant 12h dernier délai"});
    if(left<=2)r.push({type:"danger",icon:"📊",text:`TOPO FIN DE MOIS — J-${left} !`});
    else if(left<=4)r.push({type:"warn",icon:"📊",text:`TOPO FIN DE MOIS — J-${left}`});
    if(day<4)r.push({type:"info",icon:"⏰",text:"Prochain topo : vendredi — Prépas : jeudi soir"});
    return r},[]);

  const C={background:"#0a0f1a",border:"1px solid #0d4f8b33",borderRadius:12,overflow:"hidden",marginBottom:10};
  const CH=()=>({padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #ffffff0a",background:"linear-gradient(135deg,#0d1220,#0a0f1a)",cursor:"pointer",userSelect:"none"});
  const MN=a=>({fontFamily:"'Orbitron',monospace",fontSize:11,fontWeight:700,color:a?"#00ff88":"#00b4ff",letterSpacing:".08em"});
  const CV=o=>({color:"#3a4a5a",fontSize:13,transition:"transform .2s",transform:o?"rotate(180deg)":"rotate(0deg)"});
  const TB=a=>({padding:"5px 12px",borderRadius:16,fontSize:10,fontFamily:"monospace",cursor:"pointer",border:`1px solid ${a?"#00b4ff":"#1a2535"}`,background:a?"#00b4ff18":"transparent",color:a?"#66d9ff":"#6b7d8e",transition:"all .2s"});

  const exportJSON=async()=>{
    try{
      const exp={};
      try{const r=await window.storage.get("linkeo_cockpit_2026");if(r?.value)exp.linkeo_cockpit_2026=JSON.parse(r.value);}catch(e){}
      try{const r=await window.storage.get("linkeo_prepa_2026");if(r?.value)exp.linkeo_prepa_2026=JSON.parse(r.value);}catch(e){}
      try{const r=await window.storage.get("linkeo_v2_2026");if(r?.value)exp.linkeo_v2_2026=JSON.parse(r.value);}catch(e){}
      exp.exported_at=new Date().toISOString();
      const blob=new Blob([JSON.stringify(exp,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");
      a.href=url;a.download=`tech_os_backup_${new Date().toISOString().slice(0,10)}.json`;a.click();
      URL.revokeObjectURL(url);
    }catch(e){console.error("Export error:",e)}
  };

  const importJSON=()=>{
    const input=document.createElement("input");input.type="file";input.accept=".json";
    input.onchange=async(e)=>{
      const file=e.target.files[0];if(!file)return;
      const txt=await file.text();
      try{
        const imp=JSON.parse(txt);
        if(imp.linkeo_cockpit_2026){setData(imp.linkeo_cockpit_2026.map(m=>({objMB:m.objMB||0,realMB:m.realMB||0,visites:m.visites||0,nbVA:m.nbVA||0,va:m.va||0,parrSig:m.parrSig||0,parrColl:m.parrColl||0,avis:m.avis||0,impayes:m.impayes||0})));try{await window.storage.set("linkeo_cockpit_2026",JSON.stringify(imp.linkeo_cockpit_2026))}catch(e){}}
        if(imp.linkeo_prepa_2026){setPrepaData(imp.linkeo_prepa_2026);try{await window.storage.set("linkeo_prepa_2026",JSON.stringify(imp.linkeo_prepa_2026))}catch(e){}}
        if(imp.linkeo_v2_2026){const d=imp.linkeo_v2_2026;if(d.todos)setTodos(d.todos);if(d.pipeVA)setPipeVA(d.pipeVA);if(d.pipeRenouv)setPipeRenouv(d.pipeRenouv);if(d.pipeImpayes)setPipeImpayes(d.pipeImpayes);if(d.notifs)setNotifs(d.notifs);if(d.rdvs)setRdvs(d.rdvs);try{await window.storage.set("linkeo_v2_2026",JSON.stringify(imp.linkeo_v2_2026))}catch(e){}}
        alert("✅ Import réussi !");
      }catch(e){alert("❌ Fichier invalide");console.error(e)}
    };input.click();
  };

  return(
    <div style={{minHeight:"100vh",background:"#05080f",color:"#e0e8f0",fontFamily:"'Rajdhani',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 20% 0%,#00b4ff06 0%,transparent 60%)"}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"0 12px 40px"}}>
        <div style={{textAlign:"center",padding:"16px 0 8px"}}><h1 style={{fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:20,letterSpacing:".18em",background:"linear-gradient(135deg,#00b4ff,#66d9ff,#00ff88)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 12px #00b4ff44)"}}>LINKEO COCKPIT 2026</h1><div style={{fontFamily:"monospace",fontSize:9,color:"#6b7d8e",letterSpacing:".3em",marginTop:2}}>Agent IA — Tableau de Bord Commercial</div>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:6}}>
            <span onClick={exportJSON} style={{fontSize:8,color:"#00ff88",cursor:"pointer",padding:"3px 8px",border:"1px solid #00ff8833",borderRadius:8,fontFamily:"monospace",background:"#00ff8808"}}>⬇ Exporter JSON</span>
            <span onClick={importJSON} style={{fontSize:8,color:"#00b4ff",cursor:"pointer",padding:"3px 8px",border:"1px solid #00b4ff33",borderRadius:8,fontFamily:"monospace",background:"#00b4ff08"}}>⬆ Importer JSON</span>
          </div>
        </div>
        <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:10,marginBottom:14,flexWrap:"wrap"}}>
          {[["dashboard","📊 Dashboard"],["rdvmois","👤 RDV du mois"],["prepa","📋 Prépa RDV"],["annuel","📅 Annuel"],["cadre","📌 Cadre"],["roadmap","🔮 Améliorations"]].map(([k,l])=>(<div key={k} style={TB(activeTab===k)} onClick={()=>setActiveTab(k)}>{l}</div>))}
        </div>

{/* ══ DASHBOARD ══ */}
{activeTab==="dashboard"&&(<div>
  {reminders.length>0&&<div style={{marginBottom:10}}>{reminders.map((r,i)=>(<div key={i} style={{padding:"8px 12px",marginBottom:4,borderRadius:8,fontSize:11,display:"flex",alignItems:"center",gap:8,background:r.type==="danger"?"#ff336612":r.type==="warn"?"#ff6b3512":"#00b4ff08",border:`1px solid ${r.type==="danger"?"#ff3366":r.type==="warn"?"#ff6b35":"#00b4ff"}33`}}><span>{r.icon}</span><span style={{color:r.type==="danger"?"#ff3366":r.type==="warn"?"#ff6b35":"#66d9ff",fontWeight:r.type==="danger"?600:400}}>{r.text}</span></div>))}</div>}
  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ffd700",letterSpacing:".1em"}}>🎯 GOALS 2026</span>{[["🤖","Automatisation"],["💯","100%/mois"],["✅","To do à 0"],["😎","3-5K/mois"]].map(([i,t])=>(<div key={t} style={{padding:"3px 8px",background:"#ffd70008",border:"1px solid #ffd70022",borderRadius:10,fontSize:9,color:"#ffd700",fontFamily:"monospace",display:"flex",gap:4,alignItems:"center"}}><span>{i}</span>{t}</div>))}</div>

  {/* PLAN D'ACTION OBLIGATOIRE */}
  <div style={{...C,border:"1px solid #ff3366",background:"linear-gradient(135deg,#1a0a0f,#0a0f1a)",marginBottom:10}}>
    <div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ff3366",letterSpacing:".12em",marginBottom:8}}>🚨 PLAN D'ACTION — NON NÉGOCIABLE</div>
      {[
        ["📍","2 semaines à Clermont-Ferrand"],
        ["📍","1 semaine à Tours"],
        ["📍","1 semaine à Nice"],
        ["❌","Annuler tous les RDV sans sujets ou handicapants"],
        ["📱","Si accord gérant → tél ou visio (trajets longs, repositionner RDV)"],
      ].map(([i,t])=>(<div key={t} style={{display:"flex",gap:8,padding:"4px 0",borderBottom:"1px solid #ff336612",fontSize:11}}><span>{i}</span><span style={{color:"#e0e8f0"}}>{t}</span></div>))}
    </div>
  </div>

  {/* CHALLENGE T2 */}
  <div style={{...C,border:"1px solid #aa66ff",background:"linear-gradient(135deg,#120a1a,#0a0f1a)",marginBottom:10}}>
    <div style={{padding:"10px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#aa66ff",letterSpacing:".12em"}}>🏆 CHALLENGE T2 — 01/04 AU 30/06/2026</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,color:"#ffd700",fontWeight:700}}>500€/mois ?</div>
      </div>
      {[
        {icon:"📊",label:"Taux de transfo parc",target:"50%",color:"#aa66ff"},
        {icon:"🎯",label:"Atteinte renouvellement T2",target:"120% (mini 100%/mois)",color:"#00ff88"},
        {icon:"⭐",label:"Avis par mois",target:"10 (dont 5 Trustpilot)",color:"#ffd700"},
        {icon:"🚀",label:"VA par mois",target:"4 (hors NDD, mails)",color:"#00b4ff"},
      ].map(c=>(<div key={c.label} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid #aa66ff12"}}>
        <span>{c.icon}</span>
        <span style={{flex:1,fontSize:11,color:"#e0e8f0"}}>{c.label}</span>
        <span style={{fontFamily:"monospace",fontSize:10,color:c.color,fontWeight:600}}>{c.target}</span>
      </div>))}
      <div style={{marginTop:8,fontSize:9,color:"#6b7d8e",fontStyle:"italic",textAlign:"center"}}>⚠️ À confirmer : 500€/mois ou 500€ à la fin du challenge</div>
    </div>
  </div>

  {/* MOIS RÉFÉRENCE - dropdown */}
  <div style={{...C,border:"1px solid #ffd70033",marginBottom:10}}>
    <div onClick={()=>setShowMoisRef(!showMoisRef)} style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",background:"linear-gradient(135deg,#0d1220,#0a0f1a)"}}>
      <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ffd700",letterSpacing:".1em"}}>⭐ MOIS RÉFÉRENCE — OBJECTIF IDÉAL</span>
      <span style={{color:"#3a4a5a",fontSize:13,transition:"transform .2s",transform:showMoisRef?"rotate(180deg)":"rotate(0deg)"}}>▼</span>
    </div>
    {showMoisRef&&<div style={{padding:"10px 14px"}}>
      {[["Visites (41+)","1 000 €"],["VA (9% de 6K)","540 €"],["Parrainages (3+)","1 000 €"],["Prime MB (2% de 30K)","600 €"],["Bonus 150%","500 €"],["Impayés","200 €"]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #ffffff06",fontSize:11}}><span style={{color:"#6b7d8e"}}>{l}</span><span style={{fontFamily:"monospace",color:"#00ff88"}}>{v}</span></div>))}
      <div style={{marginTop:6,padding:"6px 8px",background:"#0a1a10",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00aa55"}}>TOTAL PRIMES</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:"#00ff88",textShadow:"0 0 12px #00ff8844"}}>3 840 €</span></div>
    </div>}
  </div>

  {/* NOTIFICATIONS PERSONNALISÉES */}
  <div style={{...C,border:"1px solid #aa66ff33",marginBottom:10}}>
    <div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#aa66ff",letterSpacing:".1em",marginBottom:8}}>🔔 MES RAPPELS</div>
      <div style={{display:"flex",gap:4,marginBottom:8,flexWrap:"wrap"}}>
        <input value={newNotif.objet} onChange={e=>setNewNotif(p=>({...p,objet:e.target.value}))} placeholder="Objet du rappel" style={{flex:1,minWidth:120,background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"5px 7px",fontFamily:"monospace",fontSize:10,color:"#66d9ff",outline:"none"}}/>
        <input type="date" value={newNotif.date} onChange={e=>setNewNotif(p=>({...p,date:e.target.value}))} style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"5px 7px",fontFamily:"monospace",fontSize:10,color:"#66d9ff",outline:"none",width:120}}/>
        <input type="time" value={newNotif.heure} onChange={e=>setNewNotif(p=>({...p,heure:e.target.value}))} style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"5px 7px",fontFamily:"monospace",fontSize:10,color:"#66d9ff",outline:"none",width:80}}/>
        <div onClick={()=>{if(newNotif.objet.trim()&&newNotif.date){setNotifs(p=>[...p,{...newNotif,done:false}].sort((a,b)=>new Date(a.date+"T"+(a.heure||"00:00"))-new Date(b.date+"T"+(b.heure||"00:00"))));setNewNotif({objet:"",date:"",heure:""})}}} style={{padding:"5px 10px",background:"#aa66ff18",border:"1px solid #aa66ff44",borderRadius:6,fontSize:10,color:"#aa66ff",cursor:"pointer",fontFamily:"monospace"}}>+</div>
      </div>
      {notifs.length===0&&<div style={{fontSize:11,color:"#3a4a5a",textAlign:"center",padding:4}}>Aucun rappel programmé</div>}
      {notifs.map((n,i)=>{const d=new Date(n.date+"T"+(n.heure||"00:00"));const now2=new Date();const diff=Math.ceil((d-now2)/(1000*60*60*24));const isPast=d<now2;const isToday=diff===0;const isSoon=diff>0&&diff<=2;return(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #ffffff06"}}>
        <div onClick={()=>setNotifs(p=>p.map((x,j)=>j===i?{...x,done:!x.done}:x))} style={{width:14,height:14,borderRadius:3,border:`1px solid ${n.done?"#00ff88":"#3a4a5a"}`,background:n.done?"#00ff8822":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#00ff88",flexShrink:0}}>{n.done?"✓":""}</div>
        <div style={{width:6,height:6,borderRadius:"50%",background:n.done?"#3a4a5a":isPast?"#ff3366":isToday?"#ff6b35":isSoon?"#ffd700":"#00b4ff",boxShadow:n.done?"none":`0 0 4px ${isPast?"#ff3366":isToday?"#ff6b35":isSoon?"#ffd700":"#00b4ff"}`,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:n.done?"#3a4a5a":"#e0e8f0",textDecoration:n.done?"line-through":"none"}}>{n.objet}</div>
          <div style={{fontSize:9,color:n.done?"#3a4a5a":isPast?"#ff3366":isToday?"#ff6b35":"#6b7d8e",fontFamily:"monospace"}}>{n.date}{n.heure?" à "+n.heure:""}{isPast&&!n.done?" ⚠ EN RETARD":isToday&&!n.done?" ⚡ AUJOURD'HUI":isSoon&&!n.done?` ⏰ J-${diff}`:""}</div>
        </div>
        <span onClick={()=>setNotifs(p=>p.filter((_,j)=>j!==i))} style={{color:"#ff3366",cursor:"pointer",fontSize:12}}>×</span>
      </div>)})}
      {notifs.filter(n=>n.done).length>0&&<div onClick={()=>setNotifs(p=>p.filter(n=>!n.done))} style={{marginTop:6,fontSize:9,color:"#6b7d8e",cursor:"pointer",textAlign:"right",fontFamily:"monospace"}}>Nettoyer terminés</div>}
    </div>
  </div>

  <div style={{...C,border:"1px solid #00ff8844"}}>
    <div style={{padding:"10px 14px",borderBottom:"1px solid #ffffff0a",background:"linear-gradient(135deg,#0d1220,#0a0f1a)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={MN(true)}>{MONTHS[currentIdx]} 2026</span><span style={{fontFamily:"monospace",fontSize:9,padding:"2px 8px",borderRadius:12,border:"1px solid #00ff88",color:"#00ff88",background:"#00ff8818"}}>EN COURS</span></div>
    <div style={{padding:"14px 16px"}}><div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#6b7d8e",letterSpacing:".1em",marginBottom:10}}>📊 PERFORMANCE EN COURS</div><PerfChart m={currentM}/></div>
    <MonthContent m={currentM} idx={currentIdx} update={update}/>
  </div>

  <div style={{...C,border:"1px solid #00b4ff33"}}><div style={{padding:"10px 14px"}}>
    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00b4ff",letterSpacing:".1em",marginBottom:8}}>✅ TO DO</div>
    <div style={{display:"flex",gap:6,marginBottom:8}}><input value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTodo.trim()){setTodos(p=>[...p,{text:newTodo.trim(),done:false}]);setNewTodo("")}}} placeholder="Nouvelle tâche..." style={{flex:1,background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"6px 8px",fontFamily:"monospace",fontSize:11,color:"#66d9ff",outline:"none"}}/><div onClick={()=>{if(newTodo.trim()){setTodos(p=>[...p,{text:newTodo.trim(),done:false}]);setNewTodo("")}}} style={{padding:"6px 10px",background:"#00b4ff18",border:"1px solid #00b4ff44",borderRadius:6,fontSize:10,color:"#00b4ff",cursor:"pointer",fontFamily:"monospace"}}>+</div></div>
    {todos.length===0&&<div style={{fontSize:11,color:"#3a4a5a",textAlign:"center",padding:4}}>Aucune tâche</div>}
    {todos.map((t,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid #ffffff06"}}><div onClick={()=>setTodos(p=>p.map((x,j)=>j===i?{...x,done:!x.done}:x))} style={{width:16,height:16,borderRadius:4,border:`1px solid ${t.done?"#00ff88":"#3a4a5a"}`,background:t.done?"#00ff8822":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#00ff88",flexShrink:0}}>{t.done?"✓":""}</div><span style={{flex:1,fontSize:11,color:t.done?"#3a4a5a":"#e0e8f0",textDecoration:t.done?"line-through":"none"}}>{t.text}</span><span onClick={()=>setTodos(p=>p.filter((_,j)=>j!==i))} style={{color:"#ff3366",cursor:"pointer",fontSize:12}}>×</span></div>))}
    {todos.filter(t=>t.done).length>0&&<div onClick={()=>setTodos(p=>p.filter(t=>!t.done))} style={{marginTop:6,fontSize:9,color:"#6b7d8e",cursor:"pointer",textAlign:"right",fontFamily:"monospace"}}>Nettoyer terminées</div>}
  </div></div>

  {/* PIPELINES */}
  {[{key:"va",title:"🚀 PIPELINE VA",color:"#00ff88",items:pipeVA,setItems:setPipeVA,field:"va",ph:"Client — Description VA",statuses:["À traiter","En cours","Propale envoyée","Relance","Gagné","Perdu"]},{key:"renouv",title:"📋 RENOUVELLEMENTS",color:"#00b4ff",items:pipeRenouv,setItems:setPipeRenouv,field:"renouv",ph:"Client — Réf / Montant",statuses:["À poser","À phoner","RDV posé","Propale","Relance","Signé","Refus"]},{key:"imp",title:"💸 IMPAYÉS",color:"#ff6b35",items:pipeImpayes,setItems:setPipeImpayes,field:"imp",ph:"Client — Montant €",statuses:["En cours","Relancé","Litige","Tribunal","Récupéré","Perdu"]}].map(pipe=>(<div key={pipe.key} style={{...C,border:`1px solid ${pipe.color}33`}}><div style={{padding:"10px 14px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:pipe.color,letterSpacing:".1em"}}>{pipe.title}</div><span style={{fontSize:9,color:"#6b7d8e",fontFamily:"monospace"}}>{pipe.items.length}</span></div>
    <div style={{display:"flex",gap:6,marginBottom:8}}><input value={newItem[pipe.field]} onChange={e=>setNewItem(p=>({...p,[pipe.field]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&newItem[pipe.field].trim()){pipe.setItems(p=>[...p,{text:newItem[pipe.field].trim(),status:pipe.statuses[0]}]);setNewItem(p=>({...p,[pipe.field]:""}));}}} placeholder={pipe.ph} style={{flex:1,background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"6px 8px",fontFamily:"monospace",fontSize:11,color:"#66d9ff",outline:"none"}}/><div onClick={()=>{if(newItem[pipe.field].trim()){pipe.setItems(p=>[...p,{text:newItem[pipe.field].trim(),status:pipe.statuses[0]}]);setNewItem(p=>({...p,[pipe.field]:""}));}}} style={{padding:"6px 10px",background:`${pipe.color}18`,border:`1px solid ${pipe.color}44`,borderRadius:6,fontSize:10,color:pipe.color,cursor:"pointer",fontFamily:"monospace"}}>+</div></div>
    {pipe.items.length===0&&<div style={{fontSize:11,color:"#3a4a5a",textAlign:"center",padding:4}}>Aucun dossier</div>}
    {pipe.items.map((v,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid #ffffff06"}}><select value={v.status} onChange={e=>pipe.setItems(p=>p.map((x,j)=>j===i?{...x,status:e.target.value}:x))} style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:4,padding:"2px 4px",fontFamily:"monospace",fontSize:9,color:v.status===pipe.statuses[pipe.statuses.length-2]?"#00ff88":v.status===pipe.statuses[pipe.statuses.length-1]?"#ff3366":pipe.color,outline:"none",width:75}}>{pipe.statuses.map(s=><option key={s}>{s}</option>)}</select><span style={{flex:1,fontSize:11,color:"#e0e8f0"}}>{v.text}</span><span onClick={()=>pipe.setItems(p=>p.filter((_,j)=>j!==i))} style={{color:"#ff3366",cursor:"pointer",fontSize:12}}>×</span></div>))}
  </div></div>))}
</div>)}

{/* ══ RDV DU MOIS ══ */}
{activeTab==="rdvmois"&&(()=>{
  const list=getRdvs(currentIdx);
  const nb=list.length;
  const primeVisites=nb<=0?0:nb<=30?nb*15:nb<=40?30*15+(nb-30)*20:30*15+10*20+(nb-40)*25;
  const motifs=["Courtoisie","Annuelle","Technique","VA","Renouvellement","Litiges"];
  const motifColors={"Courtoisie":"#00b4ff","Annuelle":"#00ff88","Technique":"#6b7d8e","VA":"#ffd700","Renouvellement":"#aa66ff","Litiges":"#ff3366"};
  const countByMotif={};motifs.forEach(m=>{countByMotif[m]=list.filter(r=>r.motif===m).length});

  return(<div>
    {/* Header stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
      <div style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"#6b7d8e",letterSpacing:".08em"}}>VISITES</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:700,color:nb>=41?"#00ff88":nb>=30?"#00b4ff":"#ff6b35"}}>{nb}</div>
        <div style={{fontSize:8,color:"#3a4a5a"}}>/ 41 obj.</div>
      </div>
      <div style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"#6b7d8e",letterSpacing:".08em"}}>PRIME</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:700,color:"#00ff88"}}>{fmt(primeVisites)}€</div>
        <div style={{fontSize:8,color:"#3a4a5a"}}>{nb<=30?"15€/v":nb<=40?"palier 20€":"palier 25€"}</div>
      </div>
      <div style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"#6b7d8e",letterSpacing:".08em"}}>PALIER</div>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:nb>=41?"#00ff88":nb>=31?"#ffd700":"#00b4ff"}}>{nb>=41?"41+ ✓":nb>=31?`${41-nb} → 25€`:`${31-nb} → 20€`}</div>
        <div style={{fontSize:8,color:"#3a4a5a"}}>prochain palier</div>
      </div>
    </div>

    {/* Breakdown by motif */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
      {motifs.map(m=>countByMotif[m]>0&&<div key={m} style={{padding:"2px 8px",borderRadius:10,fontSize:9,fontFamily:"monospace",background:`${motifColors[m]}12`,border:`1px solid ${motifColors[m]}33`,color:motifColors[m]}}>{m} {countByMotif[m]}</div>)}
    </div>

    {/* Add RDV */}
    <div style={{...C,border:"1px solid #00ff8833"}}><div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00ff88",letterSpacing:".1em",marginBottom:8}}>➕ AJOUTER UN RDV</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
        <input value={newRdv.nom} onChange={e=>setNewRdv(p=>({...p,nom:e.target.value}))} placeholder="Nom client" style={{flex:1,minWidth:100,background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"6px 8px",fontFamily:"monospace",fontSize:11,color:"#66d9ff",outline:"none"}}/>
        <input type="date" value={newRdv.date} onChange={e=>setNewRdv(p=>({...p,date:e.target.value}))} style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"6px 8px",fontFamily:"monospace",fontSize:11,color:"#66d9ff",outline:"none",width:120}}/>
        <select value={newRdv.motif} onChange={e=>setNewRdv(p=>({...p,motif:e.target.value}))} style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"6px 8px",fontFamily:"monospace",fontSize:10,color:"#ffd700",outline:"none"}}>
          {motifs.map(m=><option key={m}>{m}</option>)}
        </select>
        <div onClick={()=>{if(newRdv.nom.trim()){setRdvMonth(currentIdx,[...list,{...newRdv}].sort((a,b)=>a.date>b.date?1:-1));setNewRdv({nom:"",date:"",motif:"Courtoisie"})}}} style={{padding:"6px 10px",background:"#00ff8818",border:"1px solid #00ff8844",borderRadius:6,fontSize:10,color:"#00ff88",cursor:"pointer",fontFamily:"monospace"}}>+</div>
      </div>
    </div></div>

    {/* List */}
    <div style={C}><div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00b4ff",letterSpacing:".1em",marginBottom:8}}>📅 {MONTHS[currentIdx].toUpperCase()} 2026 — {nb} VISITE{nb>1?"S":""}</div>
      {list.length===0&&<div style={{fontSize:11,color:"#3a4a5a",textAlign:"center",padding:8}}>Aucun RDV enregistré ce mois</div>}
      {list.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #ffffff06"}}>
        <div style={{fontSize:9,fontFamily:"monospace",color:"#6b7d8e",minWidth:55}}>{r.date?new Date(r.date+"T00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}):"-"}</div>
        <div style={{padding:"1px 6px",borderRadius:8,fontSize:8,fontFamily:"monospace",background:`${motifColors[r.motif]||"#6b7d8e"}18`,border:`1px solid ${motifColors[r.motif]||"#6b7d8e"}44`,color:motifColors[r.motif]||"#6b7d8e",minWidth:55,textAlign:"center"}}>{r.motif}</div>
        <span style={{flex:1,fontSize:11,color:"#e0e8f0"}}>{r.nom}</span>
        <span onClick={()=>setRdvMonth(currentIdx,list.filter((_,j)=>j!==i))} style={{color:"#ff3366",cursor:"pointer",fontSize:12}}>×</span>
      </div>))}
    </div></div>

    {/* Prime breakdown */}
    <div style={{...C,border:"1px solid #ffd70033"}}><div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ffd700",letterSpacing:".1em",marginBottom:6}}>💰 CALCUL PRIME VISITES</div>
      {nb>0&&<div style={{fontSize:11,color:"#e0e8f0"}}>
        {nb>=1&&<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #ffffff06"}}><span style={{color:"#6b7d8e"}}>{Math.min(nb,30)} visites × 15€</span><span style={{fontFamily:"monospace",color:"#00ff88"}}>{Math.min(nb,30)*15} €</span></div>}
        {nb>30&&<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #ffffff06"}}><span style={{color:"#6b7d8e"}}>{Math.min(nb-30,10)} visites × 20€</span><span style={{fontFamily:"monospace",color:"#00ff88"}}>{Math.min(nb-30,10)*20} €</span></div>}
        {nb>40&&<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #ffffff06"}}><span style={{color:"#6b7d8e"}}>{nb-40} visites × 25€</span><span style={{fontFamily:"monospace",color:"#00ff88"}}>{(nb-40)*25} €</span></div>}
      </div>}
      <div style={{marginTop:6,padding:"6px 8px",background:"#0a1a10",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00aa55"}}>TOTAL</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:"#00ff88",textShadow:"0 0 12px #00ff8844"}}>{fmt(primeVisites)} €</span></div>
    </div></div>
  </div>);
})()}

{/* ══ PRÉPA RDV ══ */}
{activeTab==="prepa"&&(()=>{
  const week=getWeek(prepaWeek);const addT=()=>setWeek(prepaWeek,{...week,trajets:[...week.trajets,{jour:"Lundi",heure:"",depart:"",arrivee:"",duree:"",km:""}]});
  const updT=(i,f,v)=>{const t=[...week.trajets];t[i]={...t[i],[f]:v};setWeek(prepaWeek,{...week,trajets:t})};const delT=i=>setWeek(prepaWeek,{...week,trajets:week.trajets.filter((_,j)=>j!==i)});
  const addF=()=>setWeek(prepaWeek,{...week,fiches:[...week.fiches,defaultFiche()]});const updF=(i,f,v)=>{const fi=[...week.fiches];fi[i]={...fi[i],[f]:v};setWeek(prepaWeek,{...week,fiches:fi})};const delF=i=>setWeek(prepaWeek,{...week,fiches:week.fiches.filter((_,j)=>j!==i)});
  const togF=i=>setOpenFiches(p=>({...p,[i]:!p[i]}));const iS=w=>({background:"#060a14",border:"1px solid #1a2535",borderRadius:5,padding:"5px 7px",fontFamily:"monospace",fontSize:11,color:"#66d9ff",width:w||"100%",outline:"none"});const lS={fontSize:11,color:"#6b7d8e",minWidth:85};
  const exportTxt=()=>{let t=`📋 PRÉPA RDV — ${getWK(prepaWeek)} 2026\n\n`;week.trajets.forEach(tr=>{t+=`🚗 ${tr.jour} ${tr.heure} — ${tr.depart} → ${tr.arrivee}${tr.duree?` — ${tr.duree}`:""}${tr.km?` / ${tr.km} km`:""}\n`});if(week.trajets.length)t+="\n";week.fiches.forEach(f=>{t+=`━━━━━━━━━━━━━━━━━━━━\n▶ ${f.nom||"Client"}\n`;["gerant:Gérant","anciennete:Ancienneté","dernierCo:Dernier co.","offre:Offre actuelle","moisRestants:Mois restants","ideo:IDEO","gmb:GMB","sea:Budget SEA","zone:Zone","motsCles:Mots clés"].forEach(x=>{const[k,l]=x.split(":");t+=`• ${l} : ${f[k]}\n`});if(f.planA)t+=`• Plan A : ${f.planA}\n`;if(f.planB)t+=`• Plan B : ${f.planB}\n`;if(f.planC)t+=`• Plan C : ${f.planC}\n`;t+="\n"});navigator.clipboard.writeText(t).then(()=>{setCopyMsg("✅ Copié !");setTimeout(()=>setCopyMsg(""),2000)})};
  return(<div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div onClick={()=>setPrepaWeek(Math.max(1,prepaWeek-1))} style={{width:26,height:26,borderRadius:"50%",border:"1px solid #1a2535",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#6b7d8e",fontSize:13}}>‹</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"#00b4ff",letterSpacing:".1em"}}>{getWK(prepaWeek)}</div><div onClick={()=>setPrepaWeek(Math.min(52,prepaWeek+1))} style={{width:26,height:26,borderRadius:"50%",border:"1px solid #1a2535",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#6b7d8e",fontSize:13}}>›</div></div>
      <div onClick={exportTxt} style={{fontSize:9,color:"#ffd700",cursor:"pointer",padding:"4px 10px",border:"1px solid #ffd70044",borderRadius:10,fontFamily:"monospace",background:"#ffd70008"}}>{copyMsg||"📋 Copier pour mail"}</div>
    </div>
    <div style={C}><div style={{padding:"10px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ff6b35",letterSpacing:".1em"}}>🚗 TRAJETS</span><span onClick={addT} style={{fontSize:9,color:"#00b4ff",cursor:"pointer",padding:"3px 8px",border:"1px solid #00b4ff44",borderRadius:10,fontFamily:"monospace"}}>+ Trajet</span></div>
      {week.trajets.length===0&&<div style={{fontSize:11,color:"#3a4a5a",textAlign:"center",padding:6}}>Aucun trajet</div>}
      {week.trajets.map((tr,i)=>(<div key={i} style={{padding:"6px 0",borderBottom:"1px solid #ffffff06"}}><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}><select value={tr.jour} onChange={e=>updT(i,"jour",e.target.value)} style={{...iS(70),color:"#ff6b35"}}>{["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"].map(j=><option key={j}>{j}</option>)}</select><input value={tr.heure} onChange={e=>updT(i,"heure",e.target.value)} placeholder="10h30" style={iS(45)}/><input value={tr.depart} onChange={e=>updT(i,"depart",e.target.value)} placeholder="Départ" style={iS(85)}/><span style={{color:"#3a4a5a",fontSize:10}}>→</span><input value={tr.arrivee} onChange={e=>updT(i,"arrivee",e.target.value)} placeholder="Arrivée" style={iS(85)}/><input value={tr.duree} onChange={e=>updT(i,"duree",e.target.value)} placeholder="Durée" style={iS(48)}/><input value={tr.km} onChange={e=>updT(i,"km",e.target.value)} placeholder="Km" style={iS(40)}/><span onClick={()=>delT(i)} style={{color:"#ff3366",cursor:"pointer",fontSize:14}}>×</span></div></div>))}
    </div></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,marginTop:4}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00b4ff",letterSpacing:".1em"}}>📄 FICHES — {week.fiches.length}</span><div style={{display:"flex",gap:4}}><span onClick={()=>setShowPaste(true)} style={{fontSize:9,color:"#ffd700",cursor:"pointer",padding:"3px 10px",border:"1px solid #ffd70044",borderRadius:10,fontFamily:"monospace"}}>📋 Coller une prépa</span><span onClick={addF} style={{fontSize:9,color:"#00ff88",cursor:"pointer",padding:"3px 10px",border:"1px solid #00ff8844",borderRadius:10,fontFamily:"monospace"}}>+ Manuel</span></div></div>

    {/* PASTE MODAL */}
    {showPaste&&<div style={{...C,border:"1px solid #ffd70044",marginBottom:10}}><div style={{padding:"12px 14px"}}>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ffd700",letterSpacing:".1em",marginBottom:8}}>📋 COLLER UNE PRÉPA</div>
      <div style={{fontSize:10,color:"#6b7d8e",marginBottom:6}}>Colle le texte généré par Claude (format "• Gérant : ...", "• IDEO : ...", etc.)</div>
      <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"EINAUDI\n• Gérant : Anthony EINAUDI\n• Ancienneté : Depuis le 17/01/2023\n• Offre actuelle : Pack Essentiel à 116,71€\n..."} style={{width:"100%",minHeight:120,background:"#060a14",border:"1px solid #1a2535",borderRadius:6,padding:"8px",fontFamily:"monospace",fontSize:10,color:"#66d9ff",outline:"none",resize:"vertical"}}/>
      <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end"}}>
        <span onClick={()=>{setShowPaste(false);setPasteText("")}} style={{fontSize:9,color:"#6b7d8e",cursor:"pointer",padding:"4px 10px",border:"1px solid #1a2535",borderRadius:8,fontFamily:"monospace"}}>Annuler</span>
        <span onClick={()=>{if(pasteText.trim()){const parsed=parsePrepa(pasteText);setWeek(prepaWeek,{...week,fiches:[...week.fiches,parsed]});setPasteText("");setShowPaste(false)}}} style={{fontSize:9,color:"#00ff88",cursor:"pointer",padding:"4px 10px",border:"1px solid #00ff8844",borderRadius:8,fontFamily:"monospace",background:"#00ff8812"}}>✅ Importer la fiche</span>
      </div>
    </div></div>}
    {week.fiches.length===0&&<div style={{...C,padding:16,textAlign:"center"}}><span style={{fontSize:11,color:"#3a4a5a"}}>Aucune fiche</span></div>}
    {week.fiches.map((f,i)=>{const op=openFiches[i];return(<div key={i} style={{...C,border:op?"1px solid #00b4ff33":"1px solid #0d4f8b33"}}><div style={CH()} onClick={()=>togF(i)}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:f.nom?"#00b4ff":"#3a4a5a"}}>{f.nom||"Nouveau client"}</span>{f.zone&&<span style={{fontSize:8,color:"#6b7d8e",fontFamily:"monospace"}}>{f.zone}</span>}</div><div style={{display:"flex",alignItems:"center",gap:8}}>{!op&&f.offre&&<span style={{fontSize:8,color:"#3a4a5a",fontFamily:"monospace"}}>{f.offre}</span>}<span style={CV(op)}>▼</span></div></div>
      {op&&<div style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={lS}>Nom client</span><input value={f.nom} onChange={e=>updF(i,"nom",e.target.value)} placeholder="NOM" style={{...iS(),color:"#ffd700",fontWeight:600}}/></div>
        {[["gerant","Gérant","Nom, Prénom"],["anciennete","Ancienneté","Depuis le JJ/MM/AAAA"],["dernierCo","Dernier co.","Nom, date"],["offre","Offre actuelle","Pack X à X€"],["moisRestants","Mois restants","X"],["ideo","IDEO","Visit. / Contacts"],["gmb","GMB","Note / Avis"],["sea","Budget SEA","€ ou Aucun"],["zone","Zone","Dpt — Ville"],["motsCles","Mots clés","mot1, mot2"]].map(([k,l,p])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={lS}>{l}</span><input value={f[k]} onChange={e=>updF(i,k,e.target.value)} placeholder={p} style={iS()}/></div>))}
        <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid #ffffff0a"}}><div style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#ffd700",letterSpacing:".1em",marginBottom:4}}>PROPALES</div>{[["planA","Plan A","#00ff88"],["planB","Plan B","#00b4ff"],["planC","Plan C","#6b7d8e"]].map(([k,l,c])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{...lS,color:c}}>{l}</span><input value={f[k]} onChange={e=>updF(i,k,e.target.value)} placeholder="Détail = X€ HT/M" style={{...iS(),borderColor:`${c}33`}}/></div>))}</div>
        <div style={{marginTop:8,textAlign:"right"}}><span onClick={()=>delF(i)} style={{fontSize:9,color:"#ff3366",cursor:"pointer",padding:"3px 8px",border:"1px solid #ff336644",borderRadius:10,fontFamily:"monospace"}}>Supprimer</span></div>
      </div>}</div>)})}
  </div>)})()}

{/* ══ ANNUEL ══ */}
{activeTab==="annuel"&&(<div>
  <div style={{display:"flex",gap:6,marginBottom:10}}><span onClick={()=>setOpenMonths(()=>{const n={};MONTHS.forEach((_,i)=>n[i]=true);return n})} style={{fontSize:9,color:"#6b7d8e",cursor:"pointer",padding:"3px 8px",border:"1px solid #1a2535",borderRadius:10,fontFamily:"monospace"}}>▼ Tout ouvrir</span><span onClick={()=>setOpenMonths({})} style={{fontSize:9,color:"#6b7d8e",cursor:"pointer",padding:"3px 8px",border:"1px solid #1a2535",borderRadius:10,fontFamily:"monospace"}}>▲ Tout fermer</span></div>
  {MONTHS.map((name,idx)=>{const m=data[idx];const prime=primes[idx];const isOpen=openMonths[idx];const isCur=idx===currentIdx;const p=pct(m.realMB,m.objMB||1);return(<div key={idx} style={{...C,border:isCur?"1px solid #00ff8844":"1px solid #0d4f8b33"}}><div style={CH()} onClick={()=>toggleMonth(idx)}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={MN(isCur)}>{name}</span>{isCur&&<span style={{fontFamily:"monospace",fontSize:8,padding:"2px 6px",borderRadius:10,border:"1px solid #00ff88",color:"#00ff88",background:"#00ff8818"}}>EN COURS</span>}</div><div style={{display:"flex",alignItems:"center",gap:10}}>{!isOpen&&<div style={{display:"flex",gap:8,fontSize:9,fontFamily:"monospace"}}><span style={{color:p>=100?"#00ff88":p>0?"#00b4ff":"#3a4a5a"}}>{fmt(p)}%</span><span style={{color:m.visites>0?"#00b4ff":"#3a4a5a"}}>{m.visites}v</span><span style={{color:prime.total>0?"#ffd700":"#3a4a5a"}}>{fmtE(prime.total)}</span></div>}<span style={CV(isOpen)}>▼</span></div></div>{isOpen&&<MonthContent m={m} idx={idx} update={update}/>}</div>)})}
</div>)}

{/* ══ CADRE ══ */}
{activeTab==="cadre"&&(<div>
  <Section title="📌 RAPPEL — CADRE & MISSIONS" color="#ffd700" defaultOpen={true}>
    <div style={{fontSize:12,color:"#00ff88",fontStyle:"italic",marginBottom:10,padding:"6px 10px",background:"#00ff8808",borderRadius:6,borderLeft:"2px solid #00ff88"}}>"Lis ça avant de démarrer ta journée." 👔</div>
    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00b4ff",letterSpacing:".1em",marginBottom:6}}>🏢 CADRE PRO</div>
    {[["⏰","Départ ≥ 8h → retour ≤ 18h"],["🌙","Retour ≤ 20h → départ ≥ 10h"],["✅","Chaque fin de journée = TO DO & mails à 0"],["🏠","Tous les vendredis matins au bureau sauf RDV urgent"],["📱","10-20% des RDVs en visio (5-10/mois)"]].map(([i,t])=>(<div key={t} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px solid #ffffff06",fontSize:11}}><span>{i}</span><span style={{color:"#e0e8f0"}}>{t}</span></div>))}
    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#00ff88",letterSpacing:".1em",marginTop:10,marginBottom:6}}>🧘 CADRE PERSO</div>
    {[["📖","Toujours un livre sur soi"],["🏋️","2 séances muscu + 1 padel"],["🤖","Améliorer le process automatisation IA"],["🎓","Formation Skool si temps nécessaire"]].map(([i,t])=>(<div key={t} style={{display:"flex",gap:6,padding:"3px 0",borderBottom:"1px solid #ffffff06",fontSize:11}}><span>{i}</span><span style={{color:"#e0e8f0"}}>{t}</span></div>))}
    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#ff6b35",letterSpacing:".1em",marginTop:10,marginBottom:6}}>🎯 PRIORITÉS</div>
    {[["1","Renouvellements avant le 15","#ff3366"],["2","Avis & Parrainages avant le 15","#ff6b35"],["3","Qualifier & poser VA","#ffd700"],["4","Courtoisies après le 15","#00b4ff"],["5","Impayés — lundi & vendredi","#6b7d8e"]].map(([n,t,c])=>(<div key={n} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:"1px solid #ffffff06"}}><div style={{width:18,height:18,borderRadius:"50%",background:`${c}22`,border:`1px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:8,color:c,flexShrink:0}}>{n}</div><span style={{fontSize:11,color:"#e0e8f0"}}>{t}</span></div>))}
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginTop:10}}>{[["Renouv","120%","#00ff88"],["VA","3-6K","#00b4ff"],["Impayés","10%","#ffd700"],["Visites","41","#ff6b35"]].map(([l,v,c])=>(<div key={l} style={{background:"#060a14",border:"1px solid #1a2535",borderRadius:8,padding:"8px",textAlign:"center"}}><div style={{fontSize:8,color:"#6b7d8e"}}>{l}</div><div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:c}}>{v}</div></div>))}</div>
  </Section>
  <Section title="💰 PRIMES — AVENANT" color="#ffd700">
    {[{n:"1",t:"VISITES",c:"#00b4ff",l:["≤30→15€","31-40→20€","41+→25€"],w:"Max 2 fiches/client/3 mois"},{n:"2",t:"COMM. VA",c:"#00ff88",l:["8% 3-6K","9% 6-9K","10% >9K (plaf.15K)"],w:"Recouvrement=dé-comm."},{n:"3",t:"PARRAINAGES",c:"#ffd700",l:["300€/contrat","1000€ au 3ᵉ"]},{n:"4",t:"IMPAYÉS",c:"#ff6b35",l:["10% recouvrés"]},{n:"5",t:"PRIME MB",c:"#00b4ff",l:["2% MB","120%→+300€","150%→+500€"]},{n:"6",t:"ACQUI PERSO",c:"#00ff88",l:[">7.5K→500€","4-7.5K→250€"]},{n:"7",t:"COMM MB ACQUI",c:"#ffd700",l:["≥20K→3%","≥30K→8%"]},{n:"8",t:"BONUS PTF<20K",c:"#00b4ff",l:["100%→+150€"]}].map(s=>(<div key={s.n} style={{marginBottom:4,padding:"4px 0",borderBottom:"1px solid #ffffff06"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><div style={{width:14,height:14,borderRadius:"50%",background:`${s.c}22`,border:`1px solid ${s.c}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:6,color:s.c}}>{s.n}</div><span style={{fontFamily:"monospace",fontSize:9,color:s.c}}>{s.t}</span></div>{s.l.map((x,j)=><div key={j} style={{fontSize:10,color:"#e0e8f0",paddingLeft:20}}>{x}</div>)}{s.w&&<div style={{fontSize:8,color:"#ff6b35",paddingLeft:20}}>⚠️ {s.w}</div>}</div>))}
    <div style={{marginTop:4,borderTop:"1px solid #ff336622",paddingTop:4}}>{[["9","MALUS PARR/AVIS","#ff3366",["<30 parr.→-10%","<10 avis→-10%"]],["10","MALUS TRIM.","#ff3366",["<50% obj→prime÷2"]],["11","ANNUELS","#ff6b35",["2025:>50%→+5K","2026:<40%→-2K"]]].map(([n,t,c,l])=>(<div key={n} style={{marginBottom:4,padding:"4px 0"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><div style={{width:14,height:14,borderRadius:"50%",background:`${c}22`,border:`1px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:6,color:c}}>{n}</div><span style={{fontFamily:"monospace",fontSize:9,color:c}}>{t}</span></div>{l.map((x,j)=><div key={j} style={{fontSize:10,color:"#e0e8f0",paddingLeft:20}}>{x}</div>)}</div>))}</div>
    <div style={{marginTop:8,padding:"8px",background:"#060a14",border:"1px solid #00ff8833",borderRadius:8}}><div style={{fontFamily:"monospace",fontSize:8,color:"#00ff88",marginBottom:4}}>⭐ MOIS IDÉAL</div>{[["Visites","1000€"],["VA","540€"],["Parr.","1000€"],["MB","600€"],["150%","500€"],["Imp.","200€"]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span style={{color:"#6b7d8e"}}>{l}</span><span style={{fontFamily:"monospace",color:"#00ff88"}}>{v}</span></div>))}<div style={{marginTop:4,padding:"4px 6px",background:"#0a1a10",borderRadius:4,display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#00aa55"}}>TOTAL</span><span style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:"#00ff88"}}>3 840 €</span></div></div>
  </Section>
  <Section title="🗣️ FEEDBACK" color="#00b4ff">
    <div style={{display:"grid",gap:4,marginBottom:10}}>{[["⚡","Vitesse","Traiter immédiatement"],["🎯","Obj. au 15","Tout bouclé mi-mois"],["🧊","Discipline","30-45min, cadrer"],["📬","Fiabilité","0 relance"],["💰","Cash first","Priorité €"],["🕐","Orga","1j=1dpt"]].map(([i,t,d])=>(<div key={t} style={{display:"flex",gap:6,padding:"4px 6px",background:"#060a14",borderRadius:6,border:"1px solid #1a2535"}}><span style={{fontSize:12}}>{i}</span><div><span style={{fontSize:10,color:"#ffd700",fontWeight:600}}>{t}</span> <span style={{fontSize:9,color:"#6b7d8e"}}>{d}</span></div></div>))}</div>
    {[{who:"SAM — FIN 2024",c:"#00ff88",q:"Tu es prêt au niveau supérieur.",pts:["Renouvs 2 premières semaines","Anticiper RDV","Objectifs au 15","Collecter renouvs","Impayés en continu"]},{who:"SAM — EA 2024→2025",c:"#ffd700",q:"Devenir fiable. 0 relance.",pts:["Vendredis = TOPO/ADMIN/PRÉPA","4 RDV/jour terrain","1 jour = 1 dpt","TO DO = € d'abord","Parrainages quali"]},{who:"ARTHUR — 2025",c:"#00ff88",q:"LE Tech par excellence.",pts:["RDV 30-45min max","Découverte → propale VA","Temps morts = prépa+mails","Traiter quand ça arrive","Jamais le soir/WE","Cadrer les co"]}].map(fb=>(<div key={fb.who} style={{marginBottom:8}}><div style={{fontFamily:"monospace",fontSize:9,color:fb.c,marginBottom:3}}>{fb.who}</div><div style={{fontSize:10,color:fb.c,fontStyle:"italic",marginBottom:4,padding:"4px 8px",background:`${fb.c}08`,borderRadius:4,borderLeft:`2px solid ${fb.c}`}}>"{fb.q}"</div>{fb.pts.map((t,i)=>(<div key={i} style={{fontSize:10,color:"#e0e8f0",paddingLeft:10}}>→ {t}</div>))}</div>))}
  </Section>
  <Section title="🎯 VISION AGENT IA" color="#00b4ff">{[["📋","Prépa RDV","Auto-générées"],["✉️","Confirm.","Mails/SMS"],["🔔","Relances","VA/litiges/impayés"],["🗺️","Orga mois","Trajets/hôtels"],["📚","Produits","Rappels"],["📧","Mails","Tri/drafts"]].map(([i,t,d])=>(<div key={t} style={{display:"flex",gap:6,padding:"4px 6px",background:"#060a14",borderRadius:6,border:"1px solid #1a2535",fontSize:10,marginBottom:3}}><span>{i}</span><span style={{color:"#6b7d8e"}}><strong style={{color:"#e0e8f0"}}>{t}</strong> — {d}</span></div>))}</Section>
</div>)}

{/* ══ AMÉLIORATIONS ══ */}
{activeTab==="roadmap"&&(<div>
  <div style={{textAlign:"center",marginBottom:14}}>
    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#aa66ff",letterSpacing:".2em",marginBottom:4}}>COCKPIT OS — ROADMAP</div>
    <div style={{fontSize:12,color:"#6b7d8e",fontStyle:"italic"}}>De l'outil perso → à la solution métier vendable</div>
  </div>

  {/* DÈS MAINTENANT */}
  <div style={{...C,border:"1px solid #00ff8844"}}><div style={{padding:"12px 16px"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 8px #00ff88"}}/>
      <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00ff88",letterSpacing:".1em"}}>DÈS MAINTENANT</span>
    </div>
    <div style={{display:"flex",gap:8,padding:"8px 10px",background:"#060a14",borderRadius:8,border:"1px solid #1a2535"}}>
      <span style={{fontSize:16,flexShrink:0}}>🔔</span>
      <div>
        <div style={{fontSize:12,color:"#e0e8f0",fontWeight:600}}>Notifications manuelles sur tâches</div>
        <div style={{fontSize:10,color:"#6b7d8e",marginTop:2}}>Pouvoir ajouter un rappel sur n'importe quelle tâche de la to do pour ne jamais oublier. Système d'alertes visuelles avec compte à rebours.</div>
      </div>
    </div>
  </div></div>

  {/* COURT TERME */}
  <div style={{...C,border:"1px solid #ffd70044"}}><div style={{padding:"12px 16px"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:"#ffd700",boxShadow:"0 0 8px #ffd700"}}/>
      <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#ffd700",letterSpacing:".1em"}}>COURT TERME</span>
    </div>
    {[
      {icon:"🗺️",title:"Carte interactive du parc client",desc:"Listing complet des clients avec intégration Google Maps directement dans le Cockpit OS. Page dédiée avec vue carte + vue liste."},
      {icon:"🟢",title:"Système de pings colorés par client",desc:"Vert = vu récemment | Jaune = pas vu depuis 6 mois | Rouge = pas vu depuis 12 mois. Visuel immédiat sur l'état du parc."},
      {icon:"📊",title:"Fiches clients avec potentiel de croissance",desc:"Pour chaque client : produits en cours, sujets ouverts, potentiel VA, historique des échanges. Tout centralisé."},
      {icon:"📚",title:"Wiki produits moderne & interactif",desc:"Base de données complète : fiches techniques, prix, argumentaires, cas d'usage. Un wiki métier intégré directement dans l'app, consultable en RDV."},
    ].map(item=>(<div key={item.title} style={{display:"flex",gap:8,padding:"8px 10px",background:"#060a14",borderRadius:8,border:"1px solid #1a2535",marginBottom:6}}>
      <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
      <div><div style={{fontSize:12,color:"#e0e8f0",fontWeight:600}}>{item.title}</div><div style={{fontSize:10,color:"#6b7d8e",marginTop:2}}>{item.desc}</div></div>
    </div>))}
  </div></div>

  {/* MOYEN / LONG TERME */}
  <div style={{...C,border:"1px solid #00b4ff44"}}><div style={{padding:"12px 16px"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:"#00b4ff",boxShadow:"0 0 8px #00b4ff"}}/>
      <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00b4ff",letterSpacing:".1em"}}>MOYEN / LONG TERME</span>
    </div>
    {[
      {icon:"🤖",title:"Prépas RDV 100% automatisées",desc:"Connexion API MGA → extraction auto des données client. Chaînage complet MGA + GMB + IDEO + connaissance produits pour générer propales VA ou renouvellement sans intervention."},
      {icon:"🧠",title:"Assistant IA en live 24/7",desc:"Agent IA personnel pour le suivi du parc en continu. Topos réguliers automatiques sur : état du parc, objectifs, impayés, relances, alertes renouvellements. Ne jamais être en retard sur quoi que ce soit."},
    ].map(item=>(<div key={item.title} style={{display:"flex",gap:8,padding:"8px 10px",background:"#060a14",borderRadius:8,border:"1px solid #1a2535",marginBottom:6}}>
      <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
      <div><div style={{fontSize:12,color:"#e0e8f0",fontWeight:600}}>{item.title}</div><div style={{fontSize:10,color:"#6b7d8e",marginTop:2}}>{item.desc}</div></div>
    </div>))}
  </div></div>

  {/* VISION */}
  <div style={{padding:"14px",textAlign:"center",marginTop:6}}>
    <div style={{fontSize:11,color:"#aa66ff",fontStyle:"italic"}}>"Construire l'outil parfait pour moi, puis le proposer à Linkeo."</div>
    <div style={{fontSize:9,color:"#3a4a5a",marginTop:4}}>De technico → à créateur de solution métier</div>
  </div>
</div>)}

      </div>
    </div>
  );
}
