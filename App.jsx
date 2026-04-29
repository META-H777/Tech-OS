const { useState, useEffect, useCallback, useMemo } = React;

const MONTHS=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const SHORT=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
function defaultData(){const d=MONTHS.map(()=>({objMB:0,realMB:0,visites:0,nbVA:0,va:0,parrSig:0,parrColl:0,avis:0,impayes:0}));d[0]={objMB:29979,realMB:8585,visites:28,nbVA:0,va:0,parrSig:4,parrColl:1,avis:10,impayes:0};d[1]={objMB:35521,realMB:0,visites:0,nbVA:0,va:0,parrSig:0,parrColl:2,avis:0,impayes:0};return d;}
// Prime visites — palier rétroactif : à 41+, toutes les visites passent à 25€
const calcPV=v=>{if(v<=0)return 0;if(v>=41)return v*25;if(v<=30)return v*15;return 30*15+(v-30)*20};
const calcCV=va=>{if(va<3000)return 0;if(va<=6000)return va*.08;if(va<=9000)return va*.09;return Math.min(va,15000)*.10};
const calcPP=n=>n*300+(n>=3?100:0);const calcPI=m=>m*.10;
const calcPM=(o,r)=>{if(o<=0)return 0;let p=r*.02;const x=(r/o)*100;if(x>=150)p+=500;else if(x>=120)p+=300;return p};
const calcBP=(o,r)=>(o>0&&o<20000&&r>=o)?150:0;
const calcMonth=m=>{const pv=calcPV(m.visites),cv=calcCV(m.va),pp=calcPP(m.parrSig),pi=calcPI(m.impayes),pm=calcPM(m.objMB,m.realMB),bp=calcBP(m.objMB,m.realMB);return{pv,cv,pp,pi,pm,bp,total:pv+cv+pp+pi+pm+bp}};
const fmt=n=>n.toLocaleString("fr-FR",{maximumFractionDigits:0});const fmtE=n=>fmt(n)+" €";const pct=(a,b)=>b>0?((a/b)*100):0;

// Hook : compteur animé qui monte de 0 vers la valeur cible (easeOutCubic)
function useAnimatedNumber(target,duration=1200){
  const[value,setValue]=useState(0);
  useEffect(()=>{
    const start=performance.now();let raf;
    const tick=(now)=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      setValue(Math.round(target*eased));
      if(t<1)raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf);
  },[target,duration]);
  return value;
}

// Hero — KPI principal animé + 4 cells (signature visuelle premium)
function Hero({m,monthName}){
  const prime=calcMonth(m);
  const animTotal=useAnimatedNumber(prime.total,1500);
  const animMB=useAnimatedNumber(m.realMB,1200);
  const animVA=useAnimatedNumber(m.va,1200);
  const animVisites=useAnimatedNumber(m.visites,1000);
  const animPrime=useAnimatedNumber(prime.total,1500);
  const realMBPct=Math.round(pct(m.realMB,m.objMB||1));
  const vaPct=Math.round(pct(m.va,6000));
  const visitesPct=Math.round(pct(m.visites,41));
  const primePct=Math.min(Math.round(pct(prime.total,3840)),100);
  const cells=[
    {label:"MB Renouv",value:animMB,unit:"€",pct:realMBPct,obj:fmt(m.objMB)+" €"},
    {label:"Prime estimée",value:animPrime,unit:"€",pct:primePct,obj:"3 840 € (mois ref)"},
    {label:"Visites honorées",value:animVisites,unit:"/41",pct:visitesPct,obj:"41 / mois"},
    {label:"VA mois",value:animVA,unit:"€",pct:vaPct,obj:"6 000 €"},
  ];
  return(
    <div className="os-hero os-hud" style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div className="os-hero__label"><span className="os-live-dot"/>LIVE · {monthName.toUpperCase()} 2026</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span className="os-chip os-chip--blue">EN COURS</span>
          <span className="os-chip">FIRESTORE LIVE</span>
        </div>
      </div>
      <div className="os-hero-row">
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:14}}>Performance globale du mois</div>
          <div className="os-hero__big">
            <span className="num">{animTotal.toLocaleString('fr-FR')}</span>
            <span className="unit">€</span>
          </div>
          <div style={{marginTop:18,color:"rgba(255,255,255,0.65)",fontSize:13,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,fontFamily:"'JetBrains Mono',monospace",fontSize:12,padding:"5px 10px",borderRadius:7,background:"rgba(16,216,160,0.12)",color:"#3B82F6",border:"1px solid rgba(16,216,160,0.3)"}}>↗ {primePct}%</span>
            <span>vs mois référence (3 840 € prime cible)</span>
          </div>
        </div>
        <div className="os-hero__radar"><RadarMini m={m}/></div>
      </div>
      <div className="os-hero__cells">
        {cells.map((c,i)=>(
          <div key={i} className="os-hero__cell">
            <div className="os-hero__cell-lbl">{c.label}</div>
            <div className="os-hero__cell-val">{c.value.toLocaleString('fr-FR')}<span className="u"> {c.unit}</span></div>
            <div className="os-bar is-neon" style={{marginTop:10}}><i style={{width:`${Math.min(c.pct,100)}%`}}/></div>
            <div className="os-hero__cell-meta">cible {c.obj} · <b style={{color:c.pct>=100?"#3B82F6":c.pct>=60?"#3B82F6":"#60A5FA"}}>{c.pct}%</b></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mini radar pour le hero (cercle objectif global + effet mana)
function RadarMini({m}){
  const animPct=useAnimatedNumber(Math.round((pct(m.realMB,m.objMB||1)+pct(m.visites,41)+pct(m.va,6000)+pct(m.parrSig,3)+pct(m.avis,10))/5),1400);
  const ringLen=2*Math.PI*68;
  const fill=Math.min(animPct,100);
  const flowDash=ringLen*0.18; // segment lumineux qui circule
  return(
    <div style={{position:"relative",width:160,height:160,margin:"0 auto"}}>
      <svg viewBox="0 0 160 160" style={{width:"100%",height:"100%",display:"block",overflow:"visible"}}>
        <defs>
          <linearGradient id="manaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8">
              <animate attributeName="stop-color" values="#1D4ED8;#3B82F6;#60A5FA;#3B82F6;#1D4ED8" dur="3.5s" repeatCount="indefinite"/>
            </stop>
            <stop offset="50%" stopColor="#60A5FA">
              <animate attributeName="stop-color" values="#60A5FA;#93C5FD;#BFDBFE;#60A5FA" dur="3.5s" repeatCount="indefinite"/>
            </stop>
            <stop offset="100%" stopColor="#3B82F6">
              <animate attributeName="stop-color" values="#3B82F6;#1D4ED8;#3B82F6;#60A5FA" dur="3.5s" repeatCount="indefinite"/>
            </stop>
          </linearGradient>
          <filter id="manaGlow"><feGaussianBlur stdDeviation="3.5"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Track */}
        <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9"/>
        {/* Fill mana animé (gradient bleu + glow pulsé, sans shimmer head) */}
        <circle className="os-mana-circle" cx="80" cy="80" r="68" fill="none" stroke="url(#manaGrad)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(fill/100)*ringLen} ${ringLen}`} transform="rotate(-90 80 80)" filter="url(#manaGlow)" style={{transition:"stroke-dasharray 1s ease-out"}}/>
        <text x="80" y="76" textAnchor="middle" style={{fontSize:36,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fill:"#fff",letterSpacing:"-0.02em"}}>{animPct}<tspan style={{fontSize:18,fill:"rgba(255,255,255,0.5)"}}>%</tspan></text>
        <text x="80" y="100" textAnchor="middle" style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",fill:"rgba(255,255,255,0.45)",letterSpacing:"0.18em",textTransform:"uppercase"}}>GLOBAL</text>
      </svg>
    </div>
  );
}

function Progress({value,max,label,suffix=""}){const p=Math.min(pct(value,max),100);return(<div style={{marginTop:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#A0A4B0",marginBottom:4}}><span>{label} {fmt(pct(value,max))}%</span><span style={{fontFamily:"'JetBrains Mono',monospace"}}>{fmt(value)}{suffix}/{fmt(max)}{suffix}</span></div><div className="os-bar" style={{height:6}}><i style={{width:`${p}%`}}/></div></div>);}
function Field({icon,label,value,onChange,suffix,small}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #252540"}}><span style={{fontSize:12,color:"#A0A4B0"}}>{icon} {label}</span><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(parseFloat(e.target.value)||0)} min="0" style={{background:"#14141C",border:"1px solid #252540",borderRadius:5,padding:"4px 6px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#60A5FA",width:small?50:85,textAlign:"right",outline:"none"}} onFocus={e=>{e.target.style.borderColor="#3B82F6";e.target.style.boxShadow="0 0 8px #3B82F644"}} onBlur={e=>{e.target.style.borderColor="#252540";e.target.style.boxShadow="none"}}/>{suffix&&<span style={{fontSize:10,color:"#7A7E8C",minWidth:16}}>{suffix}</span>}</div></div>);}
function PrimeLine({label,value}){return(<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",fontSize:11}}><span style={{color:"#A0A4B0"}}>{label}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:value>0?"#3B82F6":"#7A7E8C"}}>{fmtE(value)}</span></div>);}
function Stat({label,value,color,sub}){const cols={neon:"#3B82F6",accent:"#3B82F6",gold:"#3B82F6",warn:"#60A5FA",danger:"#60A5FA"};const c=cols[color]||cols.neon;return(<div style={{background:"#14141C",border:"1px solid #252540",borderRadius:10,padding:"10px 8px",textAlign:"center",minWidth:0}}><div style={{fontSize:9,color:"#A0A4B0",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{label}</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:c,textShadow:`0 0 12px ${c}44`}}>{value}</div>{sub&&<div style={{fontSize:9,color:"#7A7E8C",marginTop:2}}>{sub}</div>}</div>);}
function MonthContent({m,idx,update}){const prime=calcMonth(m);const set=(f,v)=>update(idx,f,v);return(<div style={{padding:"12px 16px"}}><Field icon="🎯" label="Objectif MB Renouv" value={m.objMB} onChange={v=>set("objMB",v)} suffix="€"/><Field icon="✅" label="Réalisé MB Renouv" value={m.realMB} onChange={v=>set("realMB",v)} suffix="€"/><Field icon="👤" label="Visites réalisées" value={m.visites} onChange={v=>set("visites",v)} suffix="/41" small/><Field icon="📊" label="Nombre de VA" value={m.nbVA} onChange={v=>set("nbVA",v)} suffix="/4" small/><Field icon="🚀" label="VA réalisée" value={m.va} onChange={v=>set("va",v)} suffix="€"/><Field icon="🤝" label="Parrainages signés" value={m.parrSig} onChange={v=>set("parrSig",v)} suffix="/3" small/><Field icon="📬" label="Parrainages collectés" value={m.parrColl} onChange={v=>set("parrColl",v)} suffix="/30" small/><Field icon="⭐" label="Avis collectés" value={m.avis} onChange={v=>set("avis",v)} suffix="/10" small/><Field icon="💸" label="Impayés récupérés" value={m.impayes} onChange={v=>set("impayes",v)} suffix="€"/><Progress value={m.realMB} max={m.objMB||1} label="MB" suffix=" €"/><Progress value={m.visites} max={41} label="Visites"/><Progress value={m.va} max={6000} label="VA" suffix=" €"/><div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #252540"}}><PrimeLine label="Prime visites" value={prime.pv}/><PrimeLine label="Commission VA" value={prime.cv}/><PrimeLine label="Parrainages signés" value={prime.pp}/><PrimeLine label="Impayés récup." value={prime.pi}/><PrimeLine label="Prime MB Renouv" value={prime.pm}/><PrimeLine label="Bonus ptf <20K" value={prime.bp}/><div style={{marginTop:6,padding:"8px 10px",background:"linear-gradient(135deg,#0F1428,#1F1F2A)",border:"1px solid #3B82F633",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:10,color:"#3B82F6",letterSpacing:".08em"}}>TOTAL PRIME</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:16,fontWeight:700,color:"#3B82F6",textShadow:"0 0 12px #3B82F644"}}>{fmtE(prime.total)}</span></div></div></div>);}
function Section({title,color,children,defaultOpen}){const[open,setOpen]=useState(defaultOpen||false);return(<div style={{background:"#14141C",border:`1px solid ${color}22`,borderRadius:12,overflow:"hidden",marginBottom:10}}><div onClick={()=>setOpen(!open)} style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",background:"linear-gradient(135deg,#1F1F2A,#14141C)"}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:10,color,letterSpacing:".1em"}}>{title}</span><span style={{color:"#7A7E8C",fontSize:14,transition:"transform .2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▼</span></div>{open&&<div style={{padding:"10px 14px"}}>{children}</div>}</div>);}

// AnnualView — page annuelle refondue (header KPI géant + grille 12 mois + détail au clic)
function AnnualView({data,primes,currentIdx,openMonths,toggleMonth,update}){
  const yearTotal=primes.reduce((s,p)=>s+p.total,0);
  const yearVisites=data.reduce((s,m)=>s+(m.visites||0),0);
  const yearVA=data.reduce((s,m)=>s+(m.va||0),0);
  const yearMB=data.reduce((s,m)=>s+(m.realMB||0),0);
  const yearObjMB=data.reduce((s,m)=>s+(m.objMB||0),0);
  const yearPct=yearObjMB>0?Math.round((yearMB/yearObjMB)*100):0;
  const animYearTotal=useAnimatedNumber(yearTotal,1500);
  const selectedMonth=Object.keys(openMonths).find(k=>openMonths[k]);
  return(
    <div className="os-rise">
      {/* Header annuel — KPI géant */}
      <div className="os-card os-hud" style={{marginBottom:18,padding:"28px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(800px 400px at 80% 20%, rgba(59,130,246,0.18), transparent 60%)",pointerEvents:"none"}}/>
        <div className="os-annual-head-row" style={{position:"relative",zIndex:1}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:10}}>Cumul annuel · 2026</div>
            <div style={{fontFamily:"'Inter',sans-serif",fontSize:56,fontWeight:800,letterSpacing:"-0.04em",lineHeight:0.95,display:"flex",alignItems:"baseline",gap:12}}>
              <span style={{background:"linear-gradient(180deg,#FFFFFF 30%,#93C5FD 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 24px rgba(59,130,246,0.5))"}}>{fmt(animYearTotal)}</span>
              <span style={{fontSize:24,color:"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>€</span>
            </div>
            <div style={{marginTop:14,color:"rgba(255,255,255,0.65)",fontSize:13,display:"flex",gap:14,flexWrap:"wrap"}}>
              <span><b style={{color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{yearVisites}</b> visites</span>
              <span>·</span>
              <span><b style={{color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{fmt(yearVA)} €</b> VA</span>
              <span>·</span>
              <span>atteinte MB <b style={{color:yearPct>=80?"#3B82F6":"#60A5FA",fontFamily:"'JetBrains Mono',monospace"}}>{yearPct}%</b></span>
            </div>
          </div>
          <div className="os-grid-4">
            {[
              ["Réalisé MB",fmt(yearMB)+" €"],
              ["Objectif MB",fmt(yearObjMB)+" €"],
              ["Prime totale",fmt(yearTotal)+" €"],
              ["Mois actifs",`${data.filter(m=>m.realMB>0||m.visites>0).length}/12`],
            ].map(([l,v])=>(
              <div key={l} style={{padding:"10px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,minWidth:0}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:6}}>{l}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:600,color:"#fff",whiteSpace:"nowrap"}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grille 12 mini-cards mois */}
      <div className="os-month-grid">
        {MONTHS.map((name,idx)=>{
          const m=data[idx];const pr=primes[idx];const isCur=idx===currentIdx;
          const p=Math.round(pct(m.realMB,m.objMB||1));
          const isFuture=idx>currentIdx;
          const isActive=m.realMB>0||m.visites>0;
          const ringLen2=2*Math.PI*30;
          const isSelected=openMonths[idx];
          return(
            <div key={idx} className={"os-month-cell"+(isCur?" is-current":"")+(isSelected?" is-selected":"")} onClick={()=>toggleMonth(idx)} style={{opacity:isFuture?0.5:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#F5F5FA"}}>{name}</span>
                {isCur&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,padding:"2px 6px",borderRadius:10,border:"1px solid #3B82F6",color:"#3B82F6",background:"rgba(59,130,246,0.12)",letterSpacing:"0.06em"}}>EN COURS</span>}
                {isFuture&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.06em",textTransform:"uppercase"}}>à venir</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
                  <svg viewBox="0 0 64 64" style={{width:"100%",height:"100%",overflow:"visible"}}>
                    <defs>
                      <linearGradient id={`mg${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1D4ED8"/><stop offset="100%" stopColor="#60A5FA"/>
                      </linearGradient>
                    </defs>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
                    {isActive&&<circle cx="32" cy="32" r="28" fill="none" stroke={`url(#mg${idx})`} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(Math.min(p,100)/100)*ringLen2} ${ringLen2}`} transform="rotate(-90 32 32)" style={{filter:"drop-shadow(0 0 4px rgba(59,130,246,0.5))",transition:"stroke-dasharray 0.6s"}}/>}
                    <text x="32" y="36" textAnchor="middle" style={{fontSize:14,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fill:isActive?"#fff":"rgba(255,255,255,0.3)"}}>{isActive?p:"—"}<tspan style={{fontSize:8,fill:"rgba(255,255,255,0.4)"}}>{isActive?"%":""}</tspan></text>
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:isActive?"#fff":"rgba(255,255,255,0.3)",letterSpacing:"-0.02em"}}>{fmt(pr.total)}<span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:500}}> €</span></div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2}}>{m.visites}v · {fmt(m.va)} € VA</div>
                  <div className="os-bar" style={{height:3,marginTop:8}}><i style={{width:`${Math.min(p,100)}%`}}/></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Détail du mois sélectionné — MonthLive */}
      {selectedMonth!==undefined&&data[Number(selectedMonth)]&&(
        <div style={{marginTop:18}}>
          <MonthLive m={data[Number(selectedMonth)]} idx={Number(selectedMonth)} monthName={MONTHS[Number(selectedMonth)]} update={update}/>
        </div>
      )}
    </div>
  );
}

// PipeBlock — bloc de pipeline (input + liste avec status)
function PipeBlock({pipe,newItem,setNewItem}){
  return(
    <>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <input className="os-input" value={newItem[pipe.field]} onChange={e=>setNewItem(p=>({...p,[pipe.field]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&newItem[pipe.field].trim()){pipe.setItems(p=>[...p,{text:newItem[pipe.field].trim(),status:pipe.statuses[0]}]);setNewItem(p=>({...p,[pipe.field]:""}));}}} placeholder={pipe.ph} style={{flex:1,fontSize:13}}/>
        <button className="os-btn os-btn--blue" onClick={()=>{if(newItem[pipe.field].trim()){pipe.setItems(p=>[...p,{text:newItem[pipe.field].trim(),status:pipe.statuses[0]}]);setNewItem(p=>({...p,[pipe.field]:""}));}}}>+</button>
      </div>
      {pipe.items.length===0&&<div style={{fontSize:12,color:"#7A7E8C",textAlign:"center",padding:14,fontStyle:"italic"}}>Aucun dossier</div>}
      {pipe.items.map((v,i)=>{
        const isLast2=v.status===pipe.statuses[pipe.statuses.length-2];
        const isLast=v.status===pipe.statuses[pipe.statuses.length-1];
        const statusC=isLast2?"#3B82F6":isLast?"#7A7E8C":"#60A5FA";
        return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <select value={v.status} onChange={e=>pipe.setItems(p=>p.map((x,j)=>j===i?{...x,status:e.target.value}:x))} className="os-input" style={{width:110,fontSize:11,padding:"4px 6px",color:statusC}}>{pipe.statuses.map(s=><option key={s}>{s}</option>)}</select>
          <span style={{flex:1,fontSize:13,color:"#F5F5FA",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.text}</span>
          <span onClick={()=>pipe.setItems(p=>p.filter((_,j)=>j!==i))} style={{color:"#7A7E8C",cursor:"pointer",fontSize:14,padding:"0 6px",opacity:0.6}}>×</span>
        </div>);
      })}
    </>
  );
}

// Drawer — card dépliable, identité dashboard, hauteur dynamique
function Drawer({title,icon,badge,defaultOpen,children,accent="#3B82F6"}){
  const[open,setOpen]=useState(defaultOpen||false);
  return(
    <div className="os-card os-hud" style={{transition:"all 0.3s"}}>
      <div className="os-card__head" onClick={()=>setOpen(!open)} style={{cursor:"pointer",userSelect:"none",borderBottomColor:open?"rgba(255,255,255,0.06)":"transparent"}}>
        <div className="os-card__title">
          {icon&&<span style={{color:accent,fontSize:14,filter:`drop-shadow(0 0 6px ${accent}88)`}}>{icon}</span>}
          <span>{title}</span>
          {badge&&<span className="os-tag">{badge}</span>}
        </div>
        <span style={{color:"rgba(255,255,255,0.4)",fontSize:14,transition:"transform 0.3s cubic-bezier(.2,.7,.2,1)",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </div>
      <div style={{maxHeight:open?"2000px":"0",overflow:"hidden",transition:"max-height 0.4s cubic-bezier(.2,.7,.2,1)"}}>
        <div className="os-card__body">{children}</div>
      </div>
    </div>
  );
}

// MonthLive — bloc compact unique : cercle global + 6 mini-stats + grille de saisie + détail prime
function MonthLive({m,idx,monthName,update}){
  const prime=calcMonth(m);
  const set=(f,v)=>update(idx,f,v);
  const metrics=[
    {l:"MB Renouv",v:m.realMB,t:m.objMB||1,c:"#3B82F6",pct:Math.round(pct(m.realMB,m.objMB||1))},
    {l:"Visites",v:m.visites,t:41,c:"#3B82F6",pct:Math.round(pct(m.visites,41))},
    {l:"VA",v:m.va,t:6000,c:"#3B82F6",pct:Math.round(pct(m.va,6000))},
    {l:"Impayés",v:m.impayes,t:2000,c:"#60A5FA",pct:Math.round(pct(m.impayes,2000))},
    {l:"Parrainages",v:m.parrSig,t:3,c:"#60A5FA",pct:Math.round(pct(m.parrSig,3))},
    {l:"Avis",v:m.avis,t:10,c:"#60A5FA",pct:Math.round(pct(m.avis,10))},
  ];
  const avgPct=Math.round(metrics.reduce((s,x)=>s+Math.min(x.pct,100),0)/metrics.length);
  const animPct=useAnimatedNumber(avgPct,1500);
  const animPrime=useAnimatedNumber(prime.total,1300);
  const centerC=avgPct>=80?"#3B82F6":avgPct>=50?"#3B82F6":"#60A5FA";
  const ringLen=2*Math.PI*52;
  const fields=[
    {k:"objMB",l:"Obj. MB",icon:"🎯",suf:"€"},
    {k:"realMB",l:"Réal. MB",icon:"✅",suf:"€"},
    {k:"visites",l:"Visites",icon:"👤",suf:"/41",small:true},
    {k:"nbVA",l:"Nb VA",icon:"📊",suf:"/4",small:true},
    {k:"va",l:"VA réal.",icon:"🚀",suf:"€"},
    {k:"parrSig",l:"Parr. signés",icon:"🤝",suf:"/3",small:true},
    {k:"parrColl",l:"Parr. coll.",icon:"📬",suf:"/30",small:true},
    {k:"avis",l:"Avis",icon:"⭐",suf:"/10",small:true},
    {k:"impayes",l:"Impayés",icon:"💸",suf:"€"},
  ];
  const primeLines=[
    {l:"Visites",v:prime.pv},{l:"Commission VA",v:prime.cv},{l:"Parrainages",v:prime.pp},
    {l:"Impayés",v:prime.pi},{l:"MB Renouv",v:prime.pm},{l:"Bonus <20K",v:prime.bp},
  ];
  return(
    <div className="os-monthlive os-card os-hud" style={{marginBottom:18}}>
      {/* Header */}
      <div className="os-card__head" style={{borderBottomColor:"rgba(255,255,255,0.06)"}}>
        <div className="os-card__title">
          <span className="os-live-dot" style={{width:7,height:7}}/>
          <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontStyle:"italic",fontWeight:400,fontSize:18,background:"linear-gradient(120deg,#BFDBFE,#3B82F6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{monthName}</span>
          <span style={{color:"#F5F5FA",fontWeight:600}}>2026</span>
          <span className="os-tag" style={{color:"#3B82F6",borderColor:"rgba(16,216,160,0.4)",background:"rgba(16,216,160,0.10)"}}>EN COURS</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:"0.18em",textTransform:"uppercase"}}>Prime mois</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:700,color:"#3B82F6",textShadow:"0 0 18px rgba(16,216,160,0.45)"}}>{fmt(animPrime)}<span style={{fontSize:14,color:"rgba(255,255,255,0.4)",fontWeight:500}}> €</span></span>
        </div>
      </div>

      {/* Top : cercle global + 6 mini-stats en grille */}
      <div className="os-monthlive-top">
        {/* Cercle global mana — flux lumineux animé */}
        <div style={{position:"relative",width:140,height:140,margin:"0 auto"}}>
          <svg viewBox="0 0 140 140" style={{width:"100%",height:"100%",display:"block",overflow:"visible"}}>
            <defs>
              <linearGradient id={`mlmana${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8">
                  <animate attributeName="stop-color" values="#1D4ED8;#3B82F6;#60A5FA;#3B82F6;#1D4ED8" dur="3.5s" repeatCount="indefinite"/>
                </stop>
                <stop offset="50%" stopColor="#60A5FA">
                  <animate attributeName="stop-color" values="#60A5FA;#93C5FD;#BFDBFE;#60A5FA" dur="3.5s" repeatCount="indefinite"/>
                </stop>
                <stop offset="100%" stopColor="#3B82F6">
                  <animate attributeName="stop-color" values="#3B82F6;#1D4ED8;#3B82F6;#60A5FA" dur="3.5s" repeatCount="indefinite"/>
                </stop>
              </linearGradient>
              <filter id={`mlglow${idx}`}><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* Track */}
            <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9"/>
            {/* Fill mana animé (gradient bleu + glow pulsé, sans shimmer head) */}
            <circle className="os-mana-circle" cx="70" cy="70" r="52" fill="none" stroke={`url(#mlmana${idx})`} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(Math.min(animPct,100)/100)*ringLen} ${ringLen}`} transform="rotate(-90 70 70)" filter={`url(#mlglow${idx})`} style={{transition:"stroke-dasharray 0.8s ease-out"}}/>
            <text x="70" y="68" textAnchor="middle" style={{fontSize:32,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fill:"#fff",letterSpacing:"-0.025em"}}>{animPct}<tspan style={{fontSize:16,fill:"rgba(255,255,255,0.5)"}}>%</tspan></text>
            <text x="70" y="88" textAnchor="middle" style={{fontSize:8,fontFamily:"'JetBrains Mono',monospace",fill:"rgba(255,255,255,0.45)",letterSpacing:"0.18em",textTransform:"uppercase"}}>Global</text>
          </svg>
        </div>
        {/* 6 mini stats grille 3x2 */}
        <div className="os-grid-3">
          {metrics.map((mt,i)=>(
            <div key={i} style={{padding:"10px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,transition:"background 0.2s, border-color 0.2s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.2)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.55)"}}>{mt.l}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:mt.pct>=100?"#3B82F6":mt.pct>=60?mt.c:mt.pct>=30?"#60A5FA":"#60A5FA"}}>{mt.pct}<span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:500}}>%</span></span>
              </div>
              <div className="os-bar" style={{height:5}}><i style={{width:`${Math.min(mt.pct,100)}%`}}/></div>
              <div style={{marginTop:6,fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:"0.04em"}}>{fmt(mt.v)} <span style={{color:"rgba(255,255,255,0.3)"}}>/ {fmt(mt.t)}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom : saisie KPIs en grille 3 colonnes */}
      <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:12}}>Saisie du mois</div>
        <div className="os-grid-3">
          {fields.map(f=>(
            <div key={f.k} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,transition:"border-color 0.15s"}}>
              <span style={{fontSize:13}}>{f.icon}</span>
              <span style={{fontSize:11,color:"#A0A4B0",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.l}</span>
              <input type="number" value={m[f.k]} min="0" onChange={e=>set(f.k,parseFloat(e.target.value)||0)} className="os-input" style={{width:f.small?54:82,padding:"4px 7px",fontSize:12,textAlign:"right",color:"#60A5FA"}}/>
              <span style={{fontSize:10,color:"#7A7E8C",fontFamily:"'JetBrains Mono',monospace",minWidth:18}}>{f.suf}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Détail prime — pliable */}
      <div style={{padding:"16px 24px"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Détail prime</div>
        <div className="os-grid-3" style={{gap:6}}>
          {primeLines.map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,fontSize:11}}>
              <span style={{color:"rgba(255,255,255,0.55)"}}>{p.l}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",color:p.v>0?"#3B82F6":"rgba(255,255,255,0.3)",fontWeight:p.v>0?600:400}}>{fmtE(p.v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerfChart({m}){
  const metrics=[
    {l:"MB Renouv",v:m.realMB,t:m.objMB||1,c:"#3B82F6"},
    {l:"Visites",v:m.visites,t:41,c:"#3B82F6"},
    {l:"VA",v:m.va,t:6000,c:"#3B82F6"},
    {l:"Impayés",v:m.impayes,t:2000,c:"#60A5FA"},
    {l:"Parrainages",v:m.parrSig,t:3,c:"#60A5FA"},
    {l:"Avis",v:m.avis,t:10,c:"#60A5FA"},
  ];
  const n=metrics.length;
  const cx=185,cy=155,R=90;
  const angle=(i)=>((Math.PI*2*i)/n)-(Math.PI/2);
  const point=(i,r)=>{const a=angle(i);return[cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  const gridLevels=[0.25,0.5,0.75,1];
  const values=metrics.map(x=>Math.min((x.v/(x.t||1)),1));
  const dataPoints=values.map((v,i)=>point(i,v*R));
  const avgPct=Math.round(values.reduce((s,v)=>s+v*100,0)/n);
  const animPct=useAnimatedNumber(avgPct,1600);
  const centerColor=avgPct>=80?"#3B82F6":avgPct>=50?"#3B82F6":"#60A5FA";

  return(
    <div style={{position:"relative"}}>
      <svg viewBox="0 0 370 320" style={{width:"100%",maxWidth:460,margin:"0 auto",display:"block"}}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.20"/><stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/></radialGradient>
          <linearGradient id="dataFill" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.32"/><stop offset="50%" stopColor="#3B82F6" stopOpacity="0.20"/><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.28"/></linearGradient>
          <linearGradient id="dataStroke" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#3B82F6"/></linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glowStrong"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Halo radial qui pulse */}
        <circle cx={cx} cy={cy} r={R+10} fill="url(#radarGlow)" className="os-radar-halo"/>
        {/* Grille polygones */}
        {gridLevels.map((lv,li)=>{const pts=Array.from({length:n},(_,i)=>point(i,lv*R));return(<polygon key={li} points={pts.map(p=>p.join(",")).join(" ")} fill="none" stroke="#F5F5FA" strokeOpacity={0.05+li*0.03} strokeWidth={li===3?1.2:0.5}/>)})}
        {/* Lignes radiales */}
        {Array.from({length:n},(_,i)=>{const[x,y]=point(i,R);return(<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#F5F5FA" strokeOpacity="0.08" strokeWidth="0.5"/>)})}
        {/* Polygone rempli (fade in retardé) */}
        <polygon className="os-radar-fill" points={dataPoints.map(p=>p.join(",")).join(" ")} fill="url(#dataFill)" stroke="none"/>
        {/* Polygone stroke (tracé animé) */}
        <polygon className="os-radar-trace" points={dataPoints.map(p=>p.join(",")).join(" ")} fill="none" stroke="url(#dataStroke)" strokeWidth="2.5" filter="url(#glow)" strokeLinejoin="round"/>
        {/* Points sommets (stagger pop in) */}
        {dataPoints.map((p,i)=>{const met=metrics[i];return(<g key={i} className="os-radar-point" style={{animationDelay:`${1.2+i*0.08}s`}}><circle cx={p[0]} cy={p[1]} r={5} fill={met.c} filter="url(#glow)"/><circle cx={p[0]} cy={p[1]} r={2.2} fill="#fff"/></g>)})}
        {/* Labels périphériques */}
        {metrics.map((met,i)=>{const[x,y]=point(i,R+42);const pctVal=Math.round(values[i]*100);const anchor=x<cx-15?"end":x>cx+15?"start":"middle";const dy=y<cy-20?-2:y>cy+20?12:0;const lx=anchor==="end"?x-4:anchor==="start"?x+4:x;return(<g key={i} className="os-radar-label" style={{animationDelay:`${1.4+i*0.06}s`}}><text x={lx} y={y+dy-6} textAnchor={anchor} style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",fill:"rgba(255,255,255,0.55)",fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase"}}>{met.l}</text><text x={lx} y={y+dy+8} textAnchor={anchor} style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fill:pctVal>=100?"#3B82F6":pctVal>=60?"#3B82F6":pctVal>=30?"#60A5FA":"#60A5FA"}}>{pctVal}%</text></g>)})}
        {/* Centre — KPI global animé */}
        <text x={cx} y={cy-2} textAnchor="middle" className="os-radar-center" style={{fontSize:34,fontFamily:"'JetBrains Mono',monospace",fill:centerColor,fontWeight:700,letterSpacing:"-0.02em",filter:"url(#glowStrong)"}}>{animPct}<tspan style={{fontSize:18,fill:"rgba(255,255,255,0.5)",fontWeight:500}}>%</tspan></text>
        <text x={cx} y={cy+18} textAnchor="middle" style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",fill:"rgba(255,255,255,0.45)",letterSpacing:"0.18em",textTransform:"uppercase"}}>Global</text>
        <text x={cx} y={cy+8} textAnchor="middle" style={{fontSize:8,fontFamily:"'JetBrains Mono',monospace",fill:"#A0A4B0",letterSpacing:"0.15em"}}>GLOBAL</text>
      </svg>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6,marginTop:4}}>
        {metrics.map((met,i)=>{const pctVal=Math.round(values[i]*100);return(
          <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"2px 6px",background:"#14141C",borderRadius:6,border:`1px solid ${met.c}22`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:met.c,boxShadow:`0 0 4px ${met.c}`}}/>
            <span style={{fontSize:9,color:"#A0A4B0",fontFamily:"'JetBrains Mono',monospace"}}>{met.l}</span>
            <span style={{fontSize:9,color:pctVal>=100?"#3B82F6":"#F5F5FA",fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{fmt(met.v)}/{fmt(met.t)}</span>
          </div>
        )})}
      </div>
    </div>
  );
}

function App(){
  const[data,setData]=useState(defaultData);const[loaded,setLoaded]=useState(false);const[activeTab,setActiveTab]=useState("dashboard");const[openMonths,setOpenMonths]=useState({});
  const[prepaWeek,setPrepaWeek]=useState(()=>{const n=new Date(),s=new Date(n.getFullYear(),0,1);return Math.ceil(((n-s)/86400000+s.getDay()+1)/7)});
  const[prepaData,setPrepaData]=useState({});const[openFiches,setOpenFiches]=useState({});const[copyMsg,setCopyMsg]=useState("");
  const[todos,setTodos]=useState([]);const[pipeVA,setPipeVA]=useState([]);const[pipeRenouv,setPipeRenouv]=useState([]);const[pipeImpayes,setPipeImpayes]=useState([]);
  const[newTodo,setNewTodo]=useState("");const[newItem,setNewItem]=useState({va:"",renouv:"",imp:""});
  const[notifs,setNotifs]=useState([]);const[newNotif,setNewNotif]=useState({objet:"",date:"",heure:""});const[showNotifForm,setShowNotifForm]=useState(false);
  const[showMoisRef,setShowMoisRef]=useState(false);
  const[showPaste,setShowPaste]=useState(false);const[pasteText,setPasteText]=useState("");
  const[rdvs,setRdvs]=useState({});const[newRdv,setNewRdv]=useState({nom:"",date:"",motif:"Courtoisie"});
  // rdvTab supprimé le 29/04 — onglet RDV ne contient plus que la prépa (la saisie unitaire des visites est passée via MonthLive)
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

  const reminders=useMemo(()=>{const r=[];const n=new Date();const day=n.getDay();const date=n.getDate();const hour=n.getHours();
    // Lundi matin → TOPO KPIs
    if(day===1)r.push({type:"info",icon:"📊",text:"TOPO KPIs — À envoyer ce matin"});
    // Jeudi → préparer prépas RDV
    if(day===4)r.push({type:"info",icon:"📋",text:"PRÉPAS RDV — Préparer ce soir pour envoi demain"});
    // Vendredi → TOPO HEBDO + envoi prépas
    if(day===5)r.push({type:"warn",icon:"📊",text:"TOPO HEBDO — À envoyer avant 12h"});
    if(day===5&&hour<12)r.push({type:"warn",icon:"📋",text:"PRÉPAS RDV — Envoi avant 12h dernier délai"});
    // Le 15 du mois → 30 parrainages + 10 avis
    if(date===15){
      r.push({type:"warn",icon:"🤝",text:"30 PARRAINAGES — À boucler aujourd'hui"});
      r.push({type:"warn",icon:"⭐",text:"10 AVIS GOOGLE — À boucler aujourd'hui"});
    } else if(date===13||date===14){
      const j=15-date;
      r.push({type:"info",icon:"🤝",text:`PARRAINAGES — Objectif 30 dans J-${j}`});
      r.push({type:"info",icon:"⭐",text:`AVIS GOOGLE — Objectif 10 dans J-${j}`});
    }
    // Filler de planning quand calme (ni 13/14/15, ni jeu/ven)
    if(day<4&&day!==1&&date!==13&&date!==14&&date!==15){
      r.push({type:"info",icon:"⏰",text:"Prochain TOPO : vendredi · Prépas : jeudi soir"});
    }
    return r},[]);

  const C={background:"#14141C",border:"1px solid #25254033",borderRadius:12,overflow:"hidden",marginBottom:10};
  const CH=()=>({padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #252540",background:"linear-gradient(135deg,#1F1F2A,#14141C)",cursor:"pointer",userSelect:"none"});
  const MN=a=>({fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,color:a?"#3B82F6":"#3B82F6",letterSpacing:".08em"});
  const CV=o=>({color:"#7A7E8C",fontSize:13,transition:"transform .2s",transform:o?"rotate(180deg)":"rotate(0deg)"});
  const TB=a=>({padding:"5px 12px",borderRadius:16,fontSize:10,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",border:`1px solid ${a?"#3B82F6":"#252540"}`,background:a?"#3B82F618":"transparent",color:a?"#60A5FA":"#A0A4B0",transition:"all .2s"});

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
    <div className="os-app">
      {/* Scan beam — fine ligne lumineuse qui traverse l'écran toutes les 9s */}
      <div className="os-scan-beam"/>

      {/* Topbar frostée */}
      <div className="os-topbar">
        <div className="os-topbar__brand">
          <div className="os-brand-mark"></div>
          <span>Cockpit Technico Linkeo</span>
          <span className="os-brand-os">v2026</span>
        </div>
        <div style={{flex:1}}/>
        <button className="os-btn" onClick={exportJSON} title="Exporter les données en JSON">⬇ Export</button>
        <button className="os-btn" onClick={importJSON} title="Importer des données depuis un JSON">⬆ Import</button>
      </div>

      {/* Canvas principal */}
      <div style={{maxWidth:1280,margin:"0 auto",padding:"32px 28px 80px"}}>
        {/* En-tête canvas — Bonjour Romain */}
        <div className="os-canvas-head" style={{marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:24,flexWrap:"wrap"}}>
          <div style={{flex:"1 1 320px",minWidth:0}}>
            <h1>Bonjour Romain, <em>voici votre cockpit.</em></h1>
            <div className="sub">
              <span style={{display:"inline-block",width:14,height:1.5,background:"linear-gradient(90deg,#3B82F6,transparent)",borderRadius:2}}/>
              <span style={{textTransform:"uppercase",letterSpacing:"0.2em",fontSize:11}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long'})} · {MONTHS[currentIdx]} 2026</span>
            </div>
          </div>
        </div>

        {/* Tabs (segmented control) */}
        <div className="os-tabs" style={{marginBottom:24,maxWidth:"100%",overflowX:"auto"}}>
          {[["dashboard","Dashboard"],["rdv","Prépa RDV"],["annuel","Annuel"],["cadre","Cadre"],["roadmap","Améliorations"]].map(([k,l])=>(<div key={k} className={"os-tab"+(activeTab===k?" is-active":"")} onClick={()=>setActiveTab(k)}>{l}</div>))}
        </div>

{/* ══ DASHBOARD ══ minimaliste, ultra visuel */}
{activeTab==="dashboard"&&(<div className="os-rise">
  {/* Ticker — bandeau "infos 20h" tout en haut, défilement infini, pause au hover */}
  {reminders.length>0&&(
    <div className="os-ticker" aria-label="Rappels permanents">
      <div className="os-ticker__track">
        {[...reminders,...reminders].map((r,i)=>(
          <span key={i} className={"os-ticker__item os-ticker__item--"+r.type}>
            <span className="os-ticker__dot"/>
            <span className="os-ticker__icon">{r.icon}</span>
            <span className="os-ticker__text">{r.text}</span>
          </span>
        ))}
      </div>
    </div>
  )}

  {/* Hero — KPI principal animé + 4 cells */}
  <Hero m={currentM} monthName={MONTHS[currentIdx]}/>

  {/* Bandeau rappels permanents — Plan d'action + Mois référence */}
  <div className="os-grid-2" style={{marginBottom:18}}>
    <div className="os-card os-hud" style={{borderLeft:"2px solid #60A5FA"}}>
      <div className="os-card__head" style={{padding:"12px 16px"}}>
        <div className="os-card__title">
          <span style={{color:"#60A5FA",fontSize:14,filter:"drop-shadow(0 0 6px #60A5FA88)"}}>⚐</span>
          <span>Plan d'action voyage</span>
          <span className="os-tag" style={{color:"#60A5FA",borderColor:"rgba(96,165,250,0.4)"}}>NON NÉGOCIABLE</span>
        </div>
      </div>
      <div className="os-card__body" style={{padding:"10px 16px 14px"}}>
        {[
          ["📍","2 sem. Clermont-Ferrand"],
          ["📍","1 sem. Tours"],
          ["📍","1 sem. Nice"],
          ["❌","Annuler RDV sans sujets / handicapants"],
          ["📱","Trajets longs → tél/visio si gérant accord"],
        ].map(([i,t])=>(<div key={t} style={{display:"flex",gap:10,padding:"5px 0",fontSize:12}}><span style={{flexShrink:0}}>{i}</span><span style={{color:"#F5F5FA"}}>{t}</span></div>))}
      </div>
    </div>

    <div className="os-card os-hud" style={{borderLeft:"2px solid #3B82F6"}}>
      <div className="os-card__head" style={{padding:"12px 16px"}}>
        <div className="os-card__title">
          <span style={{color:"#3B82F6",fontSize:14,filter:"drop-shadow(0 0 6px #3B82F688)"}}>★</span>
          <span>Mois référence</span>
          <span className="os-tag" style={{color:"#3B82F6",borderColor:"rgba(59,130,246,0.4)"}}>OBJECTIF IDÉAL</span>
        </div>
      </div>
      <div className="os-card__body" style={{padding:"10px 16px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px",fontSize:12,marginBottom:10}}>
          {[["Visites (41+)","1 000 €"],["VA (9% de 6K)","540 €"],["Parrainages (3+)","1 000 €"],["Prime MB (2% 30K)","600 €"],["Bonus 150%","500 €"],["Impayés","200 €"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
              <span style={{color:"#A0A4B0"}}>{l}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#60A5FA",fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 12px",background:"rgba(59,130,246,0.10)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.7)"}}>Total cible</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:700,color:"#60A5FA",textShadow:"0 0 24px rgba(59,130,246,0.6)"}}>3 840 €</span>
        </div>
      </div>
    </div>
  </div>

  {/* Reminders compacts retirés — désormais affichés en ticker tout en haut */}

  {/* Mois en cours — bloc compact unifié */}
  <MonthLive m={currentM} idx={currentIdx} monthName={MONTHS[currentIdx]} update={update}/>

  {/* Mes rappels — bloc compact full-width (sorti de la grille pour rééquilibrer à 4) */}
  <div className="os-rappels-compact">
    <div className="os-rappels-compact__head">
      <span className="os-rappels-compact__title">
        <span style={{color:"#3B82F6",fontSize:14}}>⏰</span>
        <span>Mes rappels</span>
        <span className="os-tag">{notifs.filter(n=>!n.done).length} actif{notifs.filter(n=>!n.done).length>1?"s":""}</span>
      </span>
      <span className="os-rappels-compact__add" onClick={()=>setShowNotifForm(s=>!s)}>{showNotifForm?"× Fermer":"+ Rappel"}</span>
    </div>
    {showNotifForm&&(
      <div className="os-rappels-compact__form">
        <input className="os-input" value={newNotif.objet} onChange={e=>setNewNotif(p=>({...p,objet:e.target.value}))} placeholder="Objet du rappel" style={{flex:1,minWidth:140,fontSize:12}}/>
        <input className="os-input" type="date" value={newNotif.date} onChange={e=>setNewNotif(p=>({...p,date:e.target.value}))} style={{width:140,fontSize:11}}/>
        <input className="os-input" type="time" value={newNotif.heure} onChange={e=>setNewNotif(p=>({...p,heure:e.target.value}))} style={{width:90,fontSize:11}}/>
        <button className="os-btn os-btn--blue" onClick={()=>{if(newNotif.objet.trim()&&newNotif.date){setNotifs(p=>[...p,{...newNotif,done:false}].sort((a,b)=>new Date(a.date+"T"+(a.heure||"00:00"))-new Date(b.date+"T"+(b.heure||"00:00"))));setNewNotif({objet:"",date:"",heure:""});setShowNotifForm(false)}}}>✓</button>
      </div>
    )}
    <div className="os-rappels-compact__list">
      {notifs.length===0&&<span className="os-rappels-compact__empty">Aucun rappel programmé · clean ✨</span>}
      {notifs.map((n,i)=>{
        const d=new Date(n.date+"T"+(n.heure||"00:00"));
        const now2=new Date();
        const diff=Math.ceil((d-now2)/(1000*60*60*24));
        const isPast=d<now2&&!n.done;
        const isToday=diff===0&&!n.done;
        const isSoon=diff>0&&diff<=2&&!n.done;
        const tag=isPast?"EN RETARD":isToday?"AUJ.":isSoon?`J-${diff}`:(n.date?new Date(n.date+"T00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}):"");
        const cls=["os-rappels-pill"];
        if(n.done)cls.push("is-done");
        else if(isPast)cls.push("is-past");
        else if(isToday)cls.push("is-today");
        else if(isSoon)cls.push("is-soon");
        return(
          <div key={i} className={cls.join(" ")}>
            <span className="os-rappels-pill__check" onClick={()=>setNotifs(p=>p.map((x,j)=>j===i?{...x,done:!x.done}:x))} title={n.done?"Décocher":"Marquer fait"}>{n.done?"✓":""}</span>
            <span className="os-rappels-pill__text">{n.objet}</span>
            <span className="os-rappels-pill__date">{tag}{n.heure&&!n.done?` · ${n.heure}`:""}</span>
            <span className="os-rappels-pill__close" onClick={()=>setNotifs(p=>p.filter((_,j)=>j!==i))} title="Supprimer">×</span>
          </div>
        );
      })}
    </div>
    {notifs.filter(n=>n.done).length>0&&<div className="os-rappels-compact__clean" onClick={()=>setNotifs(p=>p.filter(n=>!n.done))}>Nettoyer terminés</div>}
  </div>

  {/* Grille de drawers — TO DO + Renouv + VA + Impayés (4 blocs alignés sur 2 colonnes) */}
  <div className="os-drawer-grid">

    {/* TO DO */}
    <Drawer title="To do" icon="✓" badge={`${todos.filter(t=>!t.done).length} ouverte${todos.filter(t=>!t.done).length>1?"s":""}`} defaultOpen={true}>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <input className="os-input" value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newTodo.trim()){setTodos(p=>[...p,{text:newTodo.trim(),done:false}]);setNewTodo("")}}} placeholder="Nouvelle tâche..." style={{flex:1,fontSize:13}}/>
        <button className="os-btn os-btn--blue" onClick={()=>{if(newTodo.trim()){setTodos(p=>[...p,{text:newTodo.trim(),done:false}]);setNewTodo("")}}}>+</button>
      </div>
      {todos.length===0&&<div style={{fontSize:12,color:"#7A7E8C",textAlign:"center",padding:14,fontStyle:"italic"}}>Aucune tâche · clean ✨</div>}
      {todos.map((t,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div onClick={()=>setTodos(p=>p.map((x,j)=>j===i?{...x,done:!x.done}:x))} style={{width:17,height:17,borderRadius:5,border:`1.5px solid ${t.done?"#60A5FA":"#3B82F6"}`,background:t.done?"rgba(96,165,250,0.18)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#60A5FA",flexShrink:0,transition:"all 0.2s",boxShadow:t.done?"0 0 12px rgba(96,165,250,0.45)":"none"}}>{t.done?"✓":""}</div>
        <span style={{flex:1,fontSize:13,color:t.done?"#7A7E8C":"#F5F5FA",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
        <span onClick={()=>setTodos(p=>p.filter((_,j)=>j!==i))} style={{color:"#7A7E8C",cursor:"pointer",fontSize:14,padding:"0 6px",lineHeight:1,opacity:0.6,transition:"opacity 0.15s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>×</span>
      </div>))}
      {todos.filter(t=>t.done).length>0&&<div onClick={()=>setTodos(p=>p.filter(t=>!t.done))} style={{marginTop:8,fontSize:10,color:"#7A7E8C",cursor:"pointer",textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>Nettoyer terminées</div>}
    </Drawer>

    {/* Mes rappels — sorti de la grille pour aérer (bloc compact placé au-dessus) */}

    {/* Renouvellements */}
    <Drawer title="Renouvellements" icon="↻" badge={`${pipeRenouv.length} dossier${pipeRenouv.length>1?"s":""}`}>
      <PipeBlock pipe={{key:"renouv",items:pipeRenouv,setItems:setPipeRenouv,field:"renouv",ph:"Client — Réf / Montant",statuses:["À poser","À phoner","RDV posé","Propale","Relance","Signé","Refus"]}} newItem={newItem} setNewItem={setNewItem}/>
    </Drawer>

    {/* Pipeline VA */}
    <Drawer title="Pipeline VA" icon="⟶" badge={`${pipeVA.length} dossier${pipeVA.length>1?"s":""}`}>
      <PipeBlock pipe={{key:"va",items:pipeVA,setItems:setPipeVA,field:"va",ph:"Client — Description VA",statuses:["À traiter","En cours","Propale envoyée","Relance","Gagné","Perdu"]}} newItem={newItem} setNewItem={setNewItem}/>
    </Drawer>

    {/* Impayés */}
    <Drawer title="Impayés" icon="€" badge={`${pipeImpayes.length} dossier${pipeImpayes.length>1?"s":""}`}>
      <PipeBlock pipe={{key:"imp",items:pipeImpayes,setItems:setPipeImpayes,field:"imp",ph:"Client — Montant €",statuses:["En cours","Relancé","Litige","Tribunal","Récupéré","Perdu"]}} newItem={newItem} setNewItem={setNewItem}/>
    </Drawer>

  </div>
</div>)}

{/* ══ À TRAITER ══ ne contient plus que le Plan d'action voyage (le reste est sur le Dashboard) */}
{activeTab==="atraiter"&&(<div className="os-rise">

  {/* Plan d'action voyage */}
  <div className="os-card os-hud" style={{marginBottom:18,borderLeft:"3px solid #60A5FA"}}>
    <div className="os-card__head">
      <div className="os-card__title">
        <span style={{color:"#60A5FA"}}>⚐</span>
        <span>Plan d'action voyage</span>
        <span className="os-tag" style={{color:"#60A5FA",borderColor:"rgba(96,165,250,0.4)"}}>NON NÉGOCIABLE</span>
      </div>
    </div>
    <div className="os-card__body">
      {[
        ["📍","2 semaines à Clermont-Ferrand"],
        ["📍","1 semaine à Tours"],
        ["📍","1 semaine à Nice"],
        ["❌","Annuler tous les RDV sans sujets ou handicapants"],
        ["📱","Si accord gérant → tél ou visio (trajets longs, repositionner RDV)"],
      ].map(([i,t])=>(<div key={t} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:13}}><span style={{flexShrink:0}}>{i}</span><span style={{color:"#F5F5FA"}}>{t}</span></div>))}
    </div>
  </div>

</div>)}

{/* ══ ANCIEN BLOC À TRAITER (désactivé — contenu déplacé sur le Dashboard) ══ */}
{false&&(<div>

  {/* Mois référence */}
  <div className="os-card" style={{marginBottom:18}}>
    <div className="os-card__head" onClick={()=>setShowMoisRef(!showMoisRef)} style={{cursor:"pointer"}}>
      <div className="os-card__title">
        <span style={{color:"#3B82F6"}}>★</span>
        <span>Mois référence</span>
        <span className="os-tag">objectif idéal</span>
      </div>
      <span style={{color:"#7A7E8C",fontSize:14,transition:"transform .25s",transform:showMoisRef?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
    </div>
    {showMoisRef&&<div className="os-card__body">
      {[["Visites (41+)","1 000 €"],["VA (9% de 6K)","540 €"],["Parrainages (3+)","1 000 €"],["Prime MB (2% de 30K)","600 €"],["Bonus 150%","500 €"],["Impayés","200 €"]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:13}}><span style={{color:"#A0A4B0"}}>{l}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#3B82F6",fontWeight:600}}>{v}</span></div>))}
      <div style={{marginTop:14,padding:"14px 16px",background:"rgba(16,216,160,0.08)",border:"1px solid rgba(16,216,160,0.25)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(16,216,160,0.9)"}}>Total primes</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:700,color:"#3B82F6",textShadow:"0 0 24px rgba(16,216,160,0.5)"}}>3 840 €</span>
      </div>
    </div>}
  </div>

  {/* Mes rappels */}
  <div className="os-card" style={{marginBottom:18}}>
    <div className="os-card__head">
      <div className="os-card__title">
        <span style={{color:"#3B82F6"}}>⏰</span>
        <span>Mes rappels</span>
        <span className="os-tag">{notifs.filter(n=>!n.done).length} actif{notifs.filter(n=>!n.done).length>1?"s":""}</span>
      </div>
    </div>
    <div className="os-card__body">
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        <input className="os-input" value={newNotif.objet} onChange={e=>setNewNotif(p=>({...p,objet:e.target.value}))} placeholder="Objet du rappel" style={{flex:1,minWidth:150,fontSize:13}}/>
        <input className="os-input" type="date" value={newNotif.date} onChange={e=>setNewNotif(p=>({...p,date:e.target.value}))} style={{width:140,fontSize:12}}/>
        <input className="os-input" type="time" value={newNotif.heure} onChange={e=>setNewNotif(p=>({...p,heure:e.target.value}))} style={{width:90,fontSize:12}}/>
        <button className="os-btn os-btn--blue" onClick={()=>{if(newNotif.objet.trim()&&newNotif.date){setNotifs(p=>[...p,{...newNotif,done:false}].sort((a,b)=>new Date(a.date+"T"+(a.heure||"00:00"))-new Date(b.date+"T"+(b.heure||"00:00"))));setNewNotif({objet:"",date:"",heure:""})}}}>+</button>
      </div>
      {notifs.length===0&&<div style={{fontSize:12,color:"#7A7E8C",textAlign:"center",padding:14,fontStyle:"italic"}}>Aucun rappel programmé</div>}
      {notifs.map((n,i)=>{const d=new Date(n.date+"T"+(n.heure||"00:00"));const now2=new Date();const diff=Math.ceil((d-now2)/(1000*60*60*24));const isPast=d<now2;const isToday=diff===0;const isSoon=diff>0&&diff<=2;const dotC=n.done?"#7A7E8C":isPast?"#60A5FA":isToday?"#60A5FA":"#3B82F6";return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div onClick={()=>setNotifs(p=>p.map((x,j)=>j===i?{...x,done:!x.done}:x))} style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${n.done?"#3B82F6":"#3B82F6"}`,background:n.done?"rgba(16,216,160,0.18)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#3B82F6",flexShrink:0}}>{n.done?"✓":""}</div>
        <div style={{width:8,height:8,borderRadius:"50%",background:dotC,boxShadow:n.done?"none":`0 0 10px ${dotC}`,flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,color:n.done?"#7A7E8C":"#F5F5FA",textDecoration:n.done?"line-through":"none"}}>{n.objet}</div>
          <div style={{fontSize:10,color:n.done?"#7A7E8C":isPast?"#60A5FA":isToday?"#60A5FA":"#A0A4B0",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.04em"}}>{n.date}{n.heure?" · "+n.heure:""}{isPast&&!n.done?" · EN RETARD":isToday&&!n.done?" · AUJOURD'HUI":isSoon&&!n.done?` · J-${diff}`:""}</div>
        </div>
        <span onClick={()=>setNotifs(p=>p.filter((_,j)=>j!==i))} style={{color:"#7A7E8C",cursor:"pointer",fontSize:14,padding:"0 6px"}}>×</span>
      </div>)})}
      {notifs.filter(n=>n.done).length>0&&<div onClick={()=>setNotifs(p=>p.filter(n=>!n.done))} style={{marginTop:8,fontSize:10,color:"#A0A4B0",cursor:"pointer",textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>Nettoyer terminés</div>}
    </div>
  </div>

  {/* Pipelines */}
  {[{key:"va",title:"Pipeline VA",icon:"⟶",color:"#3B82F6",items:pipeVA,setItems:setPipeVA,field:"va",ph:"Client — Description VA",statuses:["À traiter","En cours","Propale envoyée","Relance","Gagné","Perdu"]},{key:"renouv",title:"Renouvellements",icon:"↻",color:"#3B82F6",items:pipeRenouv,setItems:setPipeRenouv,field:"renouv",ph:"Client — Réf / Montant",statuses:["À poser","À phoner","RDV posé","Propale","Relance","Signé","Refus"]},{key:"imp",title:"Impayés",icon:"€",color:"#60A5FA",items:pipeImpayes,setItems:setPipeImpayes,field:"imp",ph:"Client — Montant €",statuses:["En cours","Relancé","Litige","Tribunal","Récupéré","Perdu"]}].map(pipe=>(
    <div key={pipe.key} className="os-card" style={{marginBottom:14,borderLeft:`3px solid ${pipe.color}`}}>
      <div className="os-card__head">
        <div className="os-card__title">
          <span style={{color:pipe.color}}>{pipe.icon}</span>
          <span>{pipe.title}</span>
          <span className="os-tag">{pipe.items.length} dossier{pipe.items.length>1?"s":""}</span>
        </div>
      </div>
      <div className="os-card__body">
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input className="os-input" value={newItem[pipe.field]} onChange={e=>setNewItem(p=>({...p,[pipe.field]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"&&newItem[pipe.field].trim()){pipe.setItems(p=>[...p,{text:newItem[pipe.field].trim(),status:pipe.statuses[0]}]);setNewItem(p=>({...p,[pipe.field]:""}));}}} placeholder={pipe.ph} style={{flex:1,fontSize:13}}/>
          <button className="os-btn" onClick={()=>{if(newItem[pipe.field].trim()){pipe.setItems(p=>[...p,{text:newItem[pipe.field].trim(),status:pipe.statuses[0]}]);setNewItem(p=>({...p,[pipe.field]:""}));}}}>+</button>
        </div>
        {pipe.items.length===0&&<div style={{fontSize:12,color:"#7A7E8C",textAlign:"center",padding:14,fontStyle:"italic"}}>Aucun dossier</div>}
        {pipe.items.map((v,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <select value={v.status} onChange={e=>pipe.setItems(p=>p.map((x,j)=>j===i?{...x,status:e.target.value}:x))} className="os-input" style={{width:120,fontSize:11,padding:"4px 6px",color:v.status===pipe.statuses[pipe.statuses.length-2]?"#3B82F6":v.status===pipe.statuses[pipe.statuses.length-1]?"#60A5FA":pipe.color}}>{pipe.statuses.map(s=><option key={s}>{s}</option>)}</select>
          <span style={{flex:1,fontSize:13,color:"#F5F5FA"}}>{v.text}</span>
          <span onClick={()=>pipe.setItems(p=>p.filter((_,j)=>j!==i))} style={{color:"#7A7E8C",cursor:"pointer",fontSize:14,padding:"0 6px"}}>×</span>
        </div>))}
      </div>
    </div>
  ))}
</div>)}

{/* (Section "RDV du mois" retirée le 29/04 — la saisie unitaire des visites était redondante avec MonthLive ; calcul de prime visites désormais basé directement sur le champ "visites réalisées" du mois courant) */}
{false&&(()=>{
  const list=getRdvs(currentIdx);
  const nb=list.length;
  const primeVisites=nb<=0?0:nb<=30?nb*15:nb<=40?30*15+(nb-30)*20:30*15+10*20+(nb-40)*25;
  const motifs=["Courtoisie","Annuelle","Technique","VA","Renouvellement","Litiges"];
  const motifColors={"Courtoisie":"#3B82F6","Annuelle":"#3B82F6","Technique":"#A0A4B0","VA":"#3B82F6","Renouvellement":"#3B82F6","Litiges":"#60A5FA"};
  const countByMotif={};motifs.forEach(m=>{countByMotif[m]=list.filter(r=>r.motif===m).length});

  return(<div className="os-rise">
    {/* Header stats */}
    <div className="os-grid-3" style={{gap:8,marginBottom:12}}>
      <div style={{background:"#14141C",border:"1px solid #252540",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"#A0A4B0",letterSpacing:".08em"}}>VISITES</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:700,color:nb>=41?"#3B82F6":nb>=30?"#3B82F6":"#60A5FA"}}>{nb}</div>
        <div style={{fontSize:8,color:"#7A7E8C"}}>/ 41 obj.</div>
      </div>
      <div style={{background:"#14141C",border:"1px solid #252540",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"#A0A4B0",letterSpacing:".08em"}}>PRIME</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:22,fontWeight:700,color:"#3B82F6"}}>{fmt(primeVisites)}€</div>
        <div style={{fontSize:8,color:"#7A7E8C"}}>{nb<=30?"15€/v":nb<=40?"palier 20€":"palier 25€"}</div>
      </div>
      <div style={{background:"#14141C",border:"1px solid #252540",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
        <div style={{fontSize:8,color:"#A0A4B0",letterSpacing:".08em"}}>PALIER</div>
        <div style={{fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:700,color:nb>=41?"#3B82F6":nb>=31?"#3B82F6":"#3B82F6"}}>{nb>=41?"41+ ✓":nb>=31?`${41-nb} → 25€`:`${31-nb} → 20€`}</div>
        <div style={{fontSize:8,color:"#7A7E8C"}}>prochain palier</div>
      </div>
    </div>

    {/* Breakdown by motif */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
      {motifs.map(m=>countByMotif[m]>0&&<div key={m} style={{padding:"2px 8px",borderRadius:10,fontSize:9,fontFamily:"'JetBrains Mono',monospace",background:`${motifColors[m]}12`,border:`1px solid ${motifColors[m]}33`,color:motifColors[m]}}>{m} {countByMotif[m]}</div>)}
    </div>

    {/* Add RDV */}
    <div style={{...C,border:"1px solid #3B82F633"}}><div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#3B82F6",letterSpacing:".1em",marginBottom:8}}>➕ AJOUTER UN RDV</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
        <input value={newRdv.nom} onChange={e=>setNewRdv(p=>({...p,nom:e.target.value}))} placeholder="Nom client" style={{flex:1,minWidth:100,background:"#14141C",border:"1px solid #252540",borderRadius:6,padding:"6px 8px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#60A5FA",outline:"none"}}/>
        <input type="date" value={newRdv.date} onChange={e=>setNewRdv(p=>({...p,date:e.target.value}))} style={{background:"#14141C",border:"1px solid #252540",borderRadius:6,padding:"6px 8px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#60A5FA",outline:"none",width:120}}/>
        <select value={newRdv.motif} onChange={e=>setNewRdv(p=>({...p,motif:e.target.value}))} style={{background:"#14141C",border:"1px solid #252540",borderRadius:6,padding:"6px 8px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3B82F6",outline:"none"}}>
          {motifs.map(m=><option key={m}>{m}</option>)}
        </select>
        <div onClick={()=>{if(newRdv.nom.trim()){setRdvMonth(currentIdx,[...list,{...newRdv}].sort((a,b)=>a.date>b.date?1:-1));setNewRdv({nom:"",date:"",motif:"Courtoisie"})}}} style={{padding:"6px 10px",background:"#3B82F618",border:"1px solid #3B82F644",borderRadius:6,fontSize:10,color:"#3B82F6",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>+</div>
      </div>
    </div></div>

    {/* List */}
    <div style={C}><div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#3B82F6",letterSpacing:".1em",marginBottom:8}}>📅 {MONTHS[currentIdx].toUpperCase()} 2026 — {nb} VISITE{nb>1?"S":""}</div>
      {list.length===0&&<div style={{fontSize:11,color:"#7A7E8C",textAlign:"center",padding:8}}>Aucun RDV enregistré ce mois</div>}
      {list.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid #252540"}}>
        <div style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:"#A0A4B0",minWidth:55}}>{r.date?new Date(r.date+"T00:00").toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}):"-"}</div>
        <div style={{padding:"1px 6px",borderRadius:8,fontSize:8,fontFamily:"'JetBrains Mono',monospace",background:`${motifColors[r.motif]||"#A0A4B0"}18`,border:`1px solid ${motifColors[r.motif]||"#A0A4B0"}44`,color:motifColors[r.motif]||"#A0A4B0",minWidth:55,textAlign:"center"}}>{r.motif}</div>
        <span style={{flex:1,fontSize:11,color:"#F5F5FA"}}>{r.nom}</span>
        <span onClick={()=>setRdvMonth(currentIdx,list.filter((_,j)=>j!==i))} style={{color:"#60A5FA",cursor:"pointer",fontSize:12}}>×</span>
      </div>))}
    </div></div>

    {/* Prime breakdown */}
    <div style={{...C,border:"1px solid #3B82F633"}}><div style={{padding:"10px 14px"}}>
      <div style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#3B82F6",letterSpacing:".1em",marginBottom:6}}>💰 CALCUL PRIME VISITES</div>
      {nb>0&&<div style={{fontSize:11,color:"#F5F5FA"}}>
        {nb>=1&&<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #252540"}}><span style={{color:"#A0A4B0"}}>{Math.min(nb,30)} visites × 15€</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#3B82F6"}}>{Math.min(nb,30)*15} €</span></div>}
        {nb>30&&<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #252540"}}><span style={{color:"#A0A4B0"}}>{Math.min(nb-30,10)} visites × 20€</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#3B82F6"}}>{Math.min(nb-30,10)*20} €</span></div>}
        {nb>40&&<div style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #252540"}}><span style={{color:"#A0A4B0"}}>{nb-40} visites × 25€</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#3B82F6"}}>{(nb-40)*25} €</span></div>}
      </div>}
      <div style={{marginTop:6,padding:"6px 8px",background:"#0F1428",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#3B82F6"}}>TOTAL</span><span style={{fontFamily:"'Inter',sans-serif",fontSize:18,fontWeight:700,color:"#3B82F6",textShadow:"0 0 12px #3B82F644"}}>{fmt(primeVisites)} €</span></div>
    </div></div>
  </div>);
})()}

{/* ══ PRÉPA RDV ══ */}
{activeTab==="rdv"&&(()=>{
  const week=getWeek(prepaWeek);const addT=()=>setWeek(prepaWeek,{...week,trajets:[...week.trajets,{jour:"Lundi",heure:"",depart:"",arrivee:"",duree:"",km:""}]});
  const updT=(i,f,v)=>{const t=[...week.trajets];t[i]={...t[i],[f]:v};setWeek(prepaWeek,{...week,trajets:t})};const delT=i=>setWeek(prepaWeek,{...week,trajets:week.trajets.filter((_,j)=>j!==i)});
  const addF=()=>setWeek(prepaWeek,{...week,fiches:[...week.fiches,defaultFiche()]});const updF=(i,f,v)=>{const fi=[...week.fiches];fi[i]={...fi[i],[f]:v};setWeek(prepaWeek,{...week,fiches:fi})};const delF=i=>setWeek(prepaWeek,{...week,fiches:week.fiches.filter((_,j)=>j!==i)});
  const togF=i=>setOpenFiches(p=>({...p,[i]:!p[i]}));const iS=w=>({background:"#14141C",border:"1px solid #252540",borderRadius:5,padding:"5px 7px",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#60A5FA",width:w||"100%",outline:"none"});const lS={fontSize:11,color:"#A0A4B0",minWidth:85};
  const exportTxt=()=>{let t=`📋 PRÉPA RDV — ${getWK(prepaWeek)} 2026\n\n`;week.trajets.forEach(tr=>{t+=`🚗 ${tr.jour} ${tr.heure} — ${tr.depart} → ${tr.arrivee}${tr.duree?` — ${tr.duree}`:""}${tr.km?` / ${tr.km} km`:""}\n`});if(week.trajets.length)t+="\n";week.fiches.forEach(f=>{t+=`━━━━━━━━━━━━━━━━━━━━\n▶ ${f.nom||"Client"}\n`;["gerant:Gérant","anciennete:Ancienneté","dernierCo:Dernier co.","offre:Offre actuelle","moisRestants:Mois restants","ideo:IDEO","gmb:GMB","sea:Budget SEA","zone:Zone","motsCles:Mots clés"].forEach(x=>{const[k,l]=x.split(":");t+=`• ${l} : ${f[k]}\n`});if(f.planA)t+=`• Plan A : ${f.planA}\n`;if(f.planB)t+=`• Plan B : ${f.planB}\n`;if(f.planC)t+=`• Plan C : ${f.planC}\n`;t+="\n"});navigator.clipboard.writeText(t).then(()=>{setCopyMsg("✅ Copié !");setTimeout(()=>setCopyMsg(""),2000)})};
  return(<div className="os-rise">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}><div onClick={()=>setPrepaWeek(Math.max(1,prepaWeek-1))} style={{width:26,height:26,borderRadius:"50%",border:"1px solid #252540",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#A0A4B0",fontSize:13}}>‹</div><div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#3B82F6",letterSpacing:".1em"}}>{getWK(prepaWeek)}</div><div onClick={()=>setPrepaWeek(Math.min(52,prepaWeek+1))} style={{width:26,height:26,borderRadius:"50%",border:"1px solid #252540",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#A0A4B0",fontSize:13}}>›</div></div>
      <div onClick={exportTxt} style={{fontSize:9,color:"#3B82F6",cursor:"pointer",padding:"4px 10px",border:"1px solid #3B82F644",borderRadius:10,fontFamily:"'JetBrains Mono',monospace",background:"#3B82F608"}}>{copyMsg||"📋 Copier pour mail"}</div>
    </div>
    <div style={C}><div style={{padding:"10px 14px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#60A5FA",letterSpacing:".1em"}}>🚗 TRAJETS</span><span onClick={addT} style={{fontSize:9,color:"#3B82F6",cursor:"pointer",padding:"3px 8px",border:"1px solid #3B82F644",borderRadius:10,fontFamily:"'JetBrains Mono',monospace"}}>+ Trajet</span></div>
      {week.trajets.length===0&&<div style={{fontSize:11,color:"#7A7E8C",textAlign:"center",padding:6}}>Aucun trajet</div>}
      {week.trajets.map((tr,i)=>(<div key={i} style={{padding:"6px 0",borderBottom:"1px solid #252540"}}><div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}><select value={tr.jour} onChange={e=>updT(i,"jour",e.target.value)} style={{...iS(70),color:"#60A5FA"}}>{["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"].map(j=><option key={j}>{j}</option>)}</select><input value={tr.heure} onChange={e=>updT(i,"heure",e.target.value)} placeholder="10h30" style={iS(45)}/><input value={tr.depart} onChange={e=>updT(i,"depart",e.target.value)} placeholder="Départ" style={iS(85)}/><span style={{color:"#7A7E8C",fontSize:10}}>→</span><input value={tr.arrivee} onChange={e=>updT(i,"arrivee",e.target.value)} placeholder="Arrivée" style={iS(85)}/><input value={tr.duree} onChange={e=>updT(i,"duree",e.target.value)} placeholder="Durée" style={iS(48)}/><input value={tr.km} onChange={e=>updT(i,"km",e.target.value)} placeholder="Km" style={iS(40)}/><span onClick={()=>delT(i)} style={{color:"#60A5FA",cursor:"pointer",fontSize:14}}>×</span></div></div>))}
    </div></div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,marginTop:4}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#3B82F6",letterSpacing:".1em"}}>📄 FICHES — {week.fiches.length}</span><div style={{display:"flex",gap:4}}><span onClick={()=>setShowPaste(true)} style={{fontSize:9,color:"#3B82F6",cursor:"pointer",padding:"3px 10px",border:"1px solid #3B82F644",borderRadius:10,fontFamily:"'JetBrains Mono',monospace"}}>📋 Coller une prépa</span><span onClick={addF} style={{fontSize:9,color:"#3B82F6",cursor:"pointer",padding:"3px 10px",border:"1px solid #3B82F644",borderRadius:10,fontFamily:"'JetBrains Mono',monospace"}}>+ Manuel</span></div></div>

    {/* PASTE MODAL */}
    {showPaste&&<div style={{...C,border:"1px solid #3B82F644",marginBottom:10}}><div style={{padding:"12px 14px"}}>
      <div style={{fontFamily:"'Inter',sans-serif",fontSize:9,color:"#3B82F6",letterSpacing:".1em",marginBottom:8}}>📋 COLLER UNE PRÉPA</div>
      <div style={{fontSize:10,color:"#A0A4B0",marginBottom:6}}>Colle le texte généré par Claude (format "• Gérant : ...", "• IDEO : ...", etc.)</div>
      <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"EINAUDI\n• Gérant : Anthony EINAUDI\n• Ancienneté : Depuis le 17/01/2023\n• Offre actuelle : Pack Essentiel à 116,71€\n..."} style={{width:"100%",minHeight:120,background:"#14141C",border:"1px solid #252540",borderRadius:6,padding:"8px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#60A5FA",outline:"none",resize:"vertical"}}/>
      <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end"}}>
        <span onClick={()=>{setShowPaste(false);setPasteText("")}} style={{fontSize:9,color:"#A0A4B0",cursor:"pointer",padding:"4px 10px",border:"1px solid #252540",borderRadius:8,fontFamily:"'JetBrains Mono',monospace"}}>Annuler</span>
        <span onClick={()=>{if(pasteText.trim()){const parsed=parsePrepa(pasteText);setWeek(prepaWeek,{...week,fiches:[...week.fiches,parsed]});setPasteText("");setShowPaste(false)}}} style={{fontSize:9,color:"#3B82F6",cursor:"pointer",padding:"4px 10px",border:"1px solid #3B82F644",borderRadius:8,fontFamily:"'JetBrains Mono',monospace",background:"#3B82F612"}}>✅ Importer la fiche</span>
      </div>
    </div></div>}
    {week.fiches.length===0&&<div style={{...C,padding:16,textAlign:"center"}}><span style={{fontSize:11,color:"#7A7E8C"}}>Aucune fiche</span></div>}
    {week.fiches.map((f,i)=>{const op=openFiches[i];return(<div key={i} style={{...C,border:op?"1px solid #3B82F633":"1px solid #25254033"}}><div style={CH()} onClick={()=>togF(i)}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:f.nom?"#3B82F6":"#7A7E8C"}}>{f.nom||"Nouveau client"}</span>{f.zone&&<span style={{fontSize:8,color:"#A0A4B0",fontFamily:"'JetBrains Mono',monospace"}}>{f.zone}</span>}</div><div style={{display:"flex",alignItems:"center",gap:8}}>{!op&&f.offre&&<span style={{fontSize:8,color:"#7A7E8C",fontFamily:"'JetBrains Mono',monospace"}}>{f.offre}</span>}<span style={CV(op)}>▼</span></div></div>
      {op&&<div style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={lS}>Nom client</span><input value={f.nom} onChange={e=>updF(i,"nom",e.target.value)} placeholder="NOM" style={{...iS(),color:"#3B82F6",fontWeight:600}}/></div>
        {[["gerant","Gérant","Nom, Prénom"],["anciennete","Ancienneté","Depuis le JJ/MM/AAAA"],["dernierCo","Dernier co.","Nom, date"],["offre","Offre actuelle","Pack X à X€"],["moisRestants","Mois restants","X"],["ideo","IDEO","Visit. / Contacts"],["gmb","GMB","Note / Avis"],["sea","Budget SEA","€ ou Aucun"],["zone","Zone","Dpt — Ville"],["motsCles","Mots clés","mot1, mot2"]].map(([k,l,p])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={lS}>{l}</span><input value={f[k]} onChange={e=>updF(i,k,e.target.value)} placeholder={p} style={iS()}/></div>))}
        <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid #252540"}}><div style={{fontFamily:"'Inter',sans-serif",fontSize:8,color:"#3B82F6",letterSpacing:".1em",marginBottom:4}}>PROPALES</div>{[["planA","Plan A","#3B82F6"],["planB","Plan B","#3B82F6"],["planC","Plan C","#A0A4B0"]].map(([k,l,c])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}><span style={{...lS,color:c}}>{l}</span><input value={f[k]} onChange={e=>updF(i,k,e.target.value)} placeholder="Détail = X€ HT/M" style={{...iS(),borderColor:`${c}33`}}/></div>))}</div>
        <div style={{marginTop:8,textAlign:"right"}}><span onClick={()=>delF(i)} style={{fontSize:9,color:"#60A5FA",cursor:"pointer",padding:"3px 8px",border:"1px solid #60A5FA44",borderRadius:10,fontFamily:"'JetBrains Mono',monospace"}}>Supprimer</span></div>
      </div>}</div>)})}
  </div>)})()}

{/* ══ ANNUEL ══ refonte visuelle */}
{activeTab==="annuel"&&<AnnualView data={data} primes={primes} currentIdx={currentIdx} openMonths={openMonths} toggleMonth={toggleMonth} update={update}/>}
{false&&(()=>{
  const yearTotal=primes.reduce((s,p)=>s+p.total,0);
  const yearVisites=data.reduce((s,m)=>s+(m.visites||0),0);
  const yearVA=data.reduce((s,m)=>s+(m.va||0),0);
  const yearMB=data.reduce((s,m)=>s+(m.realMB||0),0);
  const yearObjMB=data.reduce((s,m)=>s+(m.objMB||0),0);
  const yearPct=yearObjMB>0?Math.round((yearMB/yearObjMB)*100):0;
  const animYearTotal=0;
  const selectedMonth=Object.keys(openMonths).find(k=>openMonths[k]);
  return(
  <div className="os-rise">
    {/* Header annuel — KPI géant */}
    <div className="os-card os-hud" style={{marginBottom:18,padding:"28px 32px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(800px 400px at 80% 20%, rgba(59,130,246,0.18), transparent 60%)",pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:24,flexWrap:"wrap",position:"relative",zIndex:1}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:10}}>Cumul annuel · 2026</div>
          <div style={{fontFamily:"'Inter',sans-serif",fontSize:56,fontWeight:800,letterSpacing:"-0.04em",lineHeight:0.95,display:"flex",alignItems:"baseline",gap:12}}>
            <span style={{background:"linear-gradient(180deg,#FFFFFF 30%,#93C5FD 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 24px rgba(59,130,246,0.5))"}}>{fmt(animYearTotal)}</span>
            <span style={{fontSize:24,color:"rgba(255,255,255,0.5)",fontFamily:"'JetBrains Mono',monospace"}}>€</span>
          </div>
          <div style={{marginTop:14,color:"rgba(255,255,255,0.65)",fontSize:13,display:"flex",gap:14,flexWrap:"wrap"}}>
            <span><b style={{color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{yearVisites}</b> visites</span>
            <span>·</span>
            <span><b style={{color:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{fmt(yearVA)} €</b> VA</span>
            <span>·</span>
            <span>atteinte MB <b style={{color:yearPct>=80?"#3B82F6":"#60A5FA",fontFamily:"'JetBrains Mono',monospace"}}>{yearPct}%</b></span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(60px,1fr))",gap:10}}>
          {[
            ["Réalisé MB",fmt(yearMB)+" €"],
            ["Objectif MB",fmt(yearObjMB)+" €"],
            ["Prime totale",fmt(yearTotal)+" €"],
            ["Mois actifs",`${data.filter(m=>m.realMB>0||m.visites>0).length}/12`],
          ].map(([l,v])=>(
            <div key={l} style={{padding:"10px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,minWidth:0}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:6}}>{l}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:600,color:"#fff",whiteSpace:"nowrap"}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Grille 12 mini-cards mois */}
    <div className="os-month-grid">
      {MONTHS.map((name,idx)=>{
        const m=data[idx];const pr=primes[idx];const isCur=idx===currentIdx;
        const p=Math.round(pct(m.realMB,m.objMB||1));
        const isFuture=idx>currentIdx;
        const isActive=m.realMB>0||m.visites>0;
        const ringLen2=2*Math.PI*30;
        const isSelected=openMonths[idx];
        return(
          <div key={idx} className={"os-month-cell"+(isCur?" is-current":"")+(isSelected?" is-selected":"")} onClick={()=>toggleMonth(idx)} style={{opacity:isFuture?0.45:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#F5F5FA"}}>{name}</span>
              {isCur&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,padding:"2px 6px",borderRadius:10,border:"1px solid #3B82F6",color:"#3B82F6",background:"rgba(59,130,246,0.12)",letterSpacing:"0.06em"}}>EN COURS</span>}
              {isFuture&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.35)",letterSpacing:"0.06em",textTransform:"uppercase"}}>à venir</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
                <svg viewBox="0 0 64 64" style={{width:"100%",height:"100%",overflow:"visible"}}>
                  <defs>
                    <linearGradient id={`mg${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1D4ED8"/><stop offset="100%" stopColor="#60A5FA"/>
                    </linearGradient>
                  </defs>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
                  {isActive&&<circle cx="32" cy="32" r="28" fill="none" stroke={`url(#mg${idx})`} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(Math.min(p,100)/100)*ringLen2} ${ringLen2}`} transform="rotate(-90 32 32)" style={{filter:"drop-shadow(0 0 4px rgba(59,130,246,0.5))",transition:"stroke-dasharray 0.6s"}}/>}
                  <text x="32" y="36" textAnchor="middle" style={{fontSize:14,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",fill:isActive?"#fff":"rgba(255,255,255,0.3)"}}>{isActive?p:"—"}<tspan style={{fontSize:8,fill:"rgba(255,255,255,0.4)"}}>{isActive?"%":""}</tspan></text>
                </svg>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:isActive?"#fff":"rgba(255,255,255,0.3)",letterSpacing:"-0.02em"}}>{fmt(pr.total)}<span style={{fontSize:11,color:"rgba(255,255,255,0.4)",fontWeight:500}}> €</span></div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2}}>{m.visites}v · {fmt(m.va)} € VA</div>
                <div className="os-bar" style={{height:3,marginTop:8}}><i style={{width:`${Math.min(p,100)}%`}}/></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Détail du mois sélectionné — MonthLive */}
    {selectedMonth!==undefined&&data[Number(selectedMonth)]&&(
      <div style={{marginTop:18}}>
        <MonthLive m={data[Number(selectedMonth)]} idx={Number(selectedMonth)} monthName={MONTHS[Number(selectedMonth)]} update={update}/>
      </div>
    )}
  </div>
  );
})()}

{/* ══ CADRE ══ */}
{/* ══ CADRE ══ refonte visuelle stylée */}
{activeTab==="cadre"&&(<div className="os-rise">
  {/* Header magazine */}
  <div className="os-canvas-head" style={{marginBottom:24}}>
    <h1>Mon cadre, <em>mes règles.</em></h1>
    <div className="sub" style={{marginTop:8}}>
      <span style={{display:"inline-block",width:14,height:1.5,background:"linear-gradient(90deg,#3B82F6,transparent)",borderRadius:2}}/>
      <span style={{textTransform:"uppercase",letterSpacing:"0.2em",fontSize:11}}>Lis ça avant de démarrer ta journée</span>
    </div>
  </div>

  {/* Cadre quotidien — Pro + Perso côte à côte */}
  <div className="os-grid-2" style={{marginBottom:18}}>
    <div className="os-card os-hud">
      <div className="os-card__head" style={{padding:"14px 18px"}}>
        <div className="os-card__title">
          <span style={{color:"#3B82F6",fontSize:14,filter:"drop-shadow(0 0 6px #3B82F688)"}}>🏢</span>
          <span>Cadre Pro</span>
          <span className="os-tag">5 règles</span>
        </div>
      </div>
      <div className="os-card__body" style={{padding:"4px 18px 16px"}}>
        {[["⏰","Départ ≥ 8h → retour ≤ 18h"],["🌙","Retour ≤ 20h → départ ≥ 10h"],["✅","Chaque fin de journée : TO DO & mails à 0"],["🏠","Vendredis matins au bureau (sauf RDV urgent)"],["📱","10-20% des RDVs en visio (5-10/mois)"]].map(([i,t],idx)=>(<div key={t} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:idx<4?"1px solid rgba(255,255,255,0.05)":"none"}}><span style={{fontSize:16,flexShrink:0,filter:"drop-shadow(0 0 4px rgba(59,130,246,0.3))"}}>{i}</span><span style={{fontSize:13,color:"#F5F5FA"}}>{t}</span></div>))}
      </div>
    </div>

    <div className="os-card os-hud">
      <div className="os-card__head" style={{padding:"14px 18px"}}>
        <div className="os-card__title">
          <span style={{color:"#60A5FA",fontSize:14,filter:"drop-shadow(0 0 6px #60A5FA88)"}}>🧘</span>
          <span>Cadre Perso</span>
          <span className="os-tag">4 piliers</span>
        </div>
      </div>
      <div className="os-card__body" style={{padding:"4px 18px 16px"}}>
        {[["📖","Toujours un livre sur soi"],["🏋️","2 séances muscu + 1 padel / semaine"],["🤖","Améliorer le process d'automatisation IA"],["🎓","Formation Skool si temps disponible"]].map(([i,t],idx)=>(<div key={t} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:idx<3?"1px solid rgba(255,255,255,0.05)":"none"}}><span style={{fontSize:16,flexShrink:0,filter:"drop-shadow(0 0 4px rgba(96,165,250,0.3))"}}>{i}</span><span style={{fontSize:13,color:"#F5F5FA"}}>{t}</span></div>))}
      </div>
    </div>
  </div>

  {/* Priorités + cibles KPIs */}
  <div className="os-card os-hud" style={{marginBottom:18}}>
    <div className="os-card__head" style={{padding:"14px 18px"}}>
      <div className="os-card__title">
        <span style={{color:"#3B82F6",fontSize:14,filter:"drop-shadow(0 0 6px #3B82F688)"}}>🎯</span>
        <span>Mes 5 priorités du mois</span>
      </div>
    </div>
    <div className="os-card__body" style={{padding:"6px 18px 18px"}}>
      <div style={{display:"grid",gap:6}}>
        {[
          ["1","Renouvellements avant le 15","#3B82F6"],
          ["2","Avis & Parrainages avant le 15","#3B82F6"],
          ["3","Qualifier & poser VA","#60A5FA"],
          ["4","Courtoisies après le 15","#60A5FA"],
          ["5","Impayés — lundi & vendredi","rgba(255,255,255,0.45)"],
        ].map(([n,t,c])=>(
          <div key={n} style={{display:"flex",alignItems:"center",gap:14,padding:"10px 12px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.2)"}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.025)";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`${c.startsWith("rgba")?c:c+"22"}`,border:`1.5px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,color:c,flexShrink:0,boxShadow:`0 0 12px ${c.startsWith("rgba")?c:c+"55"}`}}>{n}</div>
            <span style={{fontSize:14,color:"#F5F5FA",flex:1}}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Cibles mensuelles</div>
        <div className="os-grid-4">
          {[["Renouv","120%"],["VA","3-6K €"],["Impayés","10%"],["Visites","41"]].map(([l,v])=>(
            <div key={l} style={{padding:"12px 14px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,textAlign:"center"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.5)",marginBottom:6}}>{l}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:"#3B82F6",textShadow:"0 0 12px rgba(59,130,246,0.4)"}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Drawers : Primes / Feedbacks / Vision IA */}
  <div className="os-drawer-grid" style={{gridTemplateColumns:"1fr"}}>

    {/* PRIMES — Avenant */}
    <Drawer title="Primes — Avenant Linkeo" icon="💰" badge="11 sources">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:14}}>
        {[
          {n:"1",t:"Visites",l:["≤30 → 15€","31-40 → 20€","41+ → 25€"],w:"Max 2 fiches/client/3 mois"},
          {n:"2",t:"Commission VA",l:["8% (3-6K)","9% (6-9K)","10% (>9K, plafond 15K)"],w:"Recouvrement = dé-comm."},
          {n:"3",t:"Parrainages",l:["300€/contrat","1 000€ au 3ᵉ"]},
          {n:"4",t:"Impayés",l:["10% des recouvrés"]},
          {n:"5",t:"Prime MB Renouv",l:["2% MB","+300€ si ≥120%","+500€ si ≥150%"]},
          {n:"6",t:"Acqui perso",l:[">7.5K → 500€","4-7.5K → 250€"]},
          {n:"7",t:"Comm. MB Acqui",l:["≥20K → 3%","≥30K → 8%"]},
          {n:"8",t:"Bonus ptf <20K",l:["100% atteint → +150€"]},
        ].map(s=>(
          <div key={s.n} style={{padding:"12px 14px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(59,130,246,0.15)",border:"1px solid #3B82F6",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#3B82F6",flexShrink:0,boxShadow:"0 0 10px rgba(59,130,246,0.4)"}}>{s.n}</div>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#F5F5FA"}}>{s.t}</span>
            </div>
            {s.l.map((x,j)=><div key={j} style={{fontSize:12,color:"rgba(255,255,255,0.7)",paddingLeft:30,fontFamily:"'JetBrains Mono',monospace"}}>· {x}</div>)}
            {s.w&&<div style={{fontSize:10,color:"#60A5FA",paddingLeft:30,marginTop:4,fontStyle:"italic"}}>⚠️ {s.w}</div>}
          </div>
        ))}
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:8}}>Conditions / Malus</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {[
            {n:"9",t:"Malus parr/avis",l:["<30 parrainages → -10%","<10 avis → -10%"]},
            {n:"10",t:"Malus trimestriel",l:["<50% obj → prime ÷ 2"]},
            {n:"11",t:"Annuels",l:["2025 : >50% → +5K","2026 : <40% → -2K"]},
          ].map(s=>(
            <div key={s.n} style={{padding:"12px 14px",background:"rgba(96,165,250,0.04)",border:"1px solid rgba(96,165,250,0.2)",borderRadius:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(96,165,250,0.15)",border:"1px solid #60A5FA",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,color:"#60A5FA",flexShrink:0}}>{s.n}</div>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,color:"#F5F5FA"}}>{s.t}</span>
              </div>
              {s.l.map((x,j)=><div key={j} style={{fontSize:12,color:"rgba(255,255,255,0.7)",paddingLeft:30,fontFamily:"'JetBrains Mono',monospace"}}>· {x}</div>)}
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 18px",background:"linear-gradient(135deg,rgba(59,130,246,0.10),rgba(59,130,246,0.04))",border:"1px solid rgba(59,130,246,0.3)",borderRadius:12}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(255,255,255,0.65)",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span>★</span><span>Mois idéal — détail</span></div>
        <div className="os-grid-3" style={{gap:6,marginBottom:12}}>
          {[["Visites","1 000€"],["VA","540€"],["Parrainages","1 000€"],["Prime MB","600€"],["Bonus 150%","500€"],["Impayés","200€"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,fontSize:12}}>
              <span style={{color:"rgba(255,255,255,0.6)"}}>{l}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#60A5FA",fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 14px",background:"rgba(0,0,0,0.3)",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.7)"}}>Total cible</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:700,color:"#60A5FA",textShadow:"0 0 24px rgba(59,130,246,0.6)"}}>3 840 €</span>
        </div>
      </div>
    </Drawer>

    {/* FEEDBACKS */}
    <Drawer title="Feedbacks managers" icon="🗣️" badge="3 niveaux">
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:10}}>Mots-clés</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:6,marginBottom:18}}>
        {[["⚡","Vitesse","Traiter immédiatement"],["🎯","Obj. au 15","Tout bouclé mi-mois"],["🧊","Discipline","30-45min, cadrer"],["📬","Fiabilité","0 relance"],["💰","Cash first","Priorité €"],["🕐","Orga","1 jour = 1 dpt"]].map(([i,t,d])=>(
          <div key={t} style={{display:"flex",gap:10,padding:"10px 12px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8}}>
            <span style={{fontSize:16,flexShrink:0,filter:"drop-shadow(0 0 4px rgba(59,130,246,0.4))"}}>{i}</span>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12,color:"#F5F5FA",fontWeight:600}}>{t}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:1}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gap:14}}>
        {[
          {who:"SAM",when:"Fin 2024",q:"Tu es prêt au niveau supérieur.",pts:["Renouvs sur les 2 premières semaines","Anticiper les RDV","Objectifs au 15","Collecter les renouvs","Impayés en continu"]},
          {who:"SAM",when:"EA 2024 → 2025",q:"Devenir fiable. Zéro relance.",pts:["Vendredis = TOPO / ADMIN / PRÉPA","4 RDV/jour terrain","1 jour = 1 département","TO DO = € d'abord","Parrainages qualifiés"]},
          {who:"ARTHUR",when:"2025",q:"LE Tech par excellence.",pts:["RDV 30-45min max","Découverte → propale VA","Temps morts = prépa + mails","Traiter quand ça arrive","Jamais le soir / WE","Cadrer les co"]},
        ].map((fb,i)=>(
          <div key={i} style={{padding:"16px 18px",background:"rgba(59,130,246,0.04)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:700,color:"#F5F5FA",letterSpacing:"0.04em"}}>{fb.who}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.45)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{fb.when}</span>
            </div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontStyle:"italic",fontSize:18,color:"#BFDBFE",marginBottom:12,paddingLeft:14,borderLeft:"3px solid #3B82F6",lineHeight:1.4}}>« {fb.q} »</div>
            <div style={{display:"grid",gap:4}}>
              {fb.pts.map((t,j)=>(<div key={j} style={{display:"flex",gap:8,fontSize:13,color:"#F5F5FA",alignItems:"flex-start"}}><span style={{color:"#60A5FA",marginTop:2,filter:"drop-shadow(0 0 4px #60A5FA)"}}>→</span><span>{t}</span></div>))}
            </div>
          </div>
        ))}
      </div>
    </Drawer>

    {/* VISION AGENT IA */}
    <Drawer title="Vision Agent IA" icon="🧠" badge="6 modules">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
        {[
          ["📋","Prépa RDV","Auto-générées (MGA + GMB + IDEO)"],
          ["✉️","Confirmations","Mails / SMS automatiques"],
          ["🔔","Relances","VA / litiges / impayés / renouvs"],
          ["🗺️","Orga mois","Trajets / hôtels / planning"],
          ["📚","Wiki produits","Rappels en RDV"],
          ["📧","Mails","Tri / drafts / réponses"],
        ].map(([i,t,d])=>(
          <div key={t} style={{display:"flex",gap:12,padding:"14px 16px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,transition:"all 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(59,130,246,0.3)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}}>
            <span style={{fontSize:22,flexShrink:0,filter:"drop-shadow(0 0 8px rgba(59,130,246,0.5))"}}>{i}</span>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13,color:"#F5F5FA",fontWeight:600,marginBottom:3}}>{t}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.55)"}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </Drawer>

  </div>
</div>)}

{/* ══ AMÉLIORATIONS ══ refonte timeline */}
{activeTab==="roadmap"&&(<div className="os-rise">
  {/* Header */}
  <div className="os-canvas-head" style={{marginBottom:30,textAlign:"center"}}>
    <h1 style={{fontSize:36}}>Roadmap <em>produit</em></h1>
    <div className="sub" style={{justifyContent:"center",marginTop:8}}>
      <span style={{display:"inline-block",width:14,height:1.5,background:"linear-gradient(90deg,#3B82F6,transparent)",borderRadius:2}}/>
      <span>De l'outil perso → à la solution métier vendable</span>
    </div>
  </div>

  {/* Timeline verticale avec ligne mana */}
  <div className="os-roadmap">
    {[
      {label:"DÈS MAINTENANT",status:"in-progress",items:[
        {icon:"🔔",title:"Notifications manuelles sur tâches",desc:"Pouvoir ajouter un rappel sur n'importe quelle tâche de la to do pour ne jamais oublier. Système d'alertes visuelles avec compte à rebours."},
      ]},
      {label:"COURT TERME",status:"next",items:[
        {icon:"🗺️",title:"Carte interactive du parc client",desc:"Listing complet des clients avec intégration Google Maps directement dans le Cockpit OS. Page dédiée avec vue carte + vue liste."},
        {icon:"🟢",title:"Système de pings colorés par client",desc:"Vu récemment / Pas vu 6 mois / Pas vu 12 mois. Visuel immédiat sur l'état du parc."},
        {icon:"📊",title:"Fiches clients avec potentiel de croissance",desc:"Pour chaque client : produits en cours, sujets ouverts, potentiel VA, historique des échanges. Tout centralisé."},
        {icon:"📚",title:"Wiki produits moderne & interactif",desc:"Base de données complète : fiches techniques, prix, argumentaires, cas d'usage. Wiki métier intégré, consultable en RDV."},
      ]},
      {label:"MOYEN / LONG TERME",status:"later",items:[
        {icon:"🤖",title:"Prépas RDV 100% automatisées",desc:"Connexion API MGA → extraction auto des données client. Chaînage MGA + GMB + IDEO + produits pour générer propales sans intervention."},
        {icon:"🧠",title:"Assistant IA en live 24/7",desc:"Agent IA personnel pour le suivi du parc en continu. Topos réguliers automatiques sur état du parc, objectifs, relances, alertes renouvellements."},
      ]},
      {label:"VISION",status:"vision",items:[
        {icon:"🚀",title:"De technico → à créateur de solution métier",desc:"Construire l'outil parfait pour moi, puis le proposer à Linkeo comme produit standard pour tous les technicos France."},
      ]},
    ].map((phase,pi)=>(
      <div key={pi} className={"os-roadmap__phase os-roadmap__phase--"+phase.status}>
        <div className="os-roadmap__node"/>
        <div className="os-roadmap__content">
          <div className="os-roadmap__label">{phase.label}</div>
          <div className="os-roadmap__items">
            {phase.items.map((item,ii)=>(
              <div key={ii} className="os-card os-hud os-roadmap__item">
                <div className="os-roadmap__item-icon">{item.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="os-roadmap__item-title">{item.title}</div>
                  <div className="os-roadmap__item-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>)}

      </div>
    </div>
  );
}
