import { useState, useEffect } from "react";
import { sendOrderEmail, sendCustomOrderEmail, ORDER_EMAIL } from "./emailService";
import { useSiteContacts } from "./useBuilderDB";

// ========== BRAND & CONSTANTS ==========
const B = {
  navy: "#003A70", cyan: "#00AEEF", navyDeep: "#001B3D", navyMid: "#0A4D8A",
  white: "#FFFFFF", midGrey: "#5A7D9E", glass: "rgba(0,174,239,0.12)",
  glassBorder: "rgba(0,174,239,.5)", door: "rgba(0,174,239,0.22)",
  doorBorder: "#00AEEF", wall: "#334155",hob: "#00386E", hinge: "#00AEEF",
  dim: "#F59E0B", slide: "rgba(34,197,94,0.15)", slideBorder: "rgba(34,197,94,0.5)",
  slideColor: "#22C55E", tbc: "rgba(0,174,239,0.06)", tbcBorder: "rgba(0,174,239,0.25)",
  walk: "rgba(245,158,11,0.12)", walkBorder: "rgba(245,158,11,0.4)", walkColor: "#F59E0B",
  price: "#10B981", priceBg: "rgba(16,185,129,0.08)", priceBorder: "rgba(16,185,129,0.25)",
  custom: "#A855F7", customBg: "rgba(168,85,247,0.08)", customBorder: "rgba(168,85,247,0.25)",
};
const REGIONS = ["Gold Coast","Brisbane","Ipswich","Toowoomba","Sunshine Coast"];
const COLOURS = [
  {name:"Chrome",hex:"#C0C0C0",ring:"#E8E8E8"},
  {name:"Black",hex:"#1A1A1A",ring:"#444"},
  {name:"Brushed Nickel",hex:"#A8A9AD",ring:"#C5C6CA"},
  {name:"Brushed Brass",hex:"#CFB53B",ring:"#E8D48B"},
];
const WATERSTOPS = [21,42,60];
const SPLAYED_SIZES = [
  {label:"9",internal:900,leg:425},{label:"10",internal:1000,leg:525},
  {label:"11",internal:1100,leg:625},{label:"12",internal:1200,leg:725},
];
const DOOR_MM = 662;

const LOCATION_OPTIONS = [
  "Bathroom","Ensuite","Upstairs Bathroom","Downstairs Bathroom",
  "Main Bathroom","Guest Bathroom","Master Ensuite","Powder Room","Other"
];

const HSSS_CONTACTS = [
  {name:"Bradley",email:"bradley@hsss.net.au",phone:"0481 145 924",role:"Sales"},
  {name:"Bruce",email:"bruce@hsss.net.au",phone:"0404 126 775",role:"Sales"},
  {name:"Sam",email:"info@hsss.net.au",phone:"0457 296 652",role:"Scheduling"},
];

// ========== PRICING ENGINE ==========
const PRICING = {
  supplyInstall: {
    frontReturn: { rate: 310, min: 1123.00 },
    splay: { rate: 310, min: 1123.00 },
    panelDoor: {
      table: {900:850.82,1000:881.10,1100:915.44,1200:949.78,1300:984.13,1400:1018.47,1500:1052.81},
      min: 850.82, minWidth: 900, incrementAbove: 1500, increment: 34.34, max: 2400,
    },
    panelDoorPanel: {
      table: {1000:973.91,1100:995.89,1200:1022.75,1300:1077.49,1400:1124.94,1500:1153.68,1600:1161.39,1700:1209.66,1800:1217.71},
      min: 973.91, minWidth: 1000, incrementAbove: 1800, increment: 48.00, max: 2400,
    },
    fixedPanel: { small: 704.58, large: 930.33, smallMax: 985, largeMin: 1035, largeMax: 1485 },
    colourSurcharge: {
      Chrome: { multi: 0, fixed: 0 }, Black: { multi: 115, fixed: 65 },
      "Brushed Nickel": { multi: 115, fixed: 65 }, "Brushed Brass": { multi: 220, fixed: 120 },
    },
  },
  supplyOnly: {
    frontReturn: { rate: 215, min: 750.00 },
    splay: { rate: 215, min: 750.00 },
    panelDoor: {
      table: {900:557.13,1000:587.82,1100:622.15,1200:656.50,1300:690.83,1400:725.17,1500:759.51},
      min: 557.13, minWidth: 900, incrementAbove: 1500, increment: 34.34, max: 2400,
    },
    panelDoorPanel: {
      table: {1000:680.63,1100:702.19,1200:776.96,1300:783.79,1400:836.04,1500:854.86,1600:868.11,1700:897.11,1800:924.42},
      min: 680.63, minWidth: 1000, incrementAbove: 1800, increment: 48.00, max: 2400,
    },
    fixedPanel: { small: 504.21, large: 649.86, smallMax: 985, largeMin: 1035, largeMax: 1485 },
    colourSurcharge: {
      Chrome: { multi: 0, fixed: 0 }, Black: { multi: 110, fixed: 85 },
      "Brushed Nickel": { multi: 110, fixed: 85 }, "Brushed Brass": { multi: 215, fixed: 170 },
    },
  },
};

function calcPrice(screenType, config, customerType) {
  const p = customerType === "Supply & Install" ? PRICING.supplyInstall : PRICING.supplyOnly;
  let base = 0, isFixed = false;
  if (screenType === "frontReturn") {
    const m2 = ((config.frontMM + config.returnMM) / 1000) * 2.0;
    base = Math.max(p.frontReturn.min, m2 * p.frontReturn.rate);
  } else if (screenType === "splay") {
    const m2 = ((config.wallA + config.wallB) / 1000) * 2.0;
    base = Math.max(p.splay.min, m2 * p.splay.rate);
  } else if (screenType === "panelDoor") {
    const tbl = p.panelDoor, w = config.w2wMM;
    if (w <= tbl.minWidth) base = tbl.min;
    else if (w <= tbl.incrementAbove) { const r = Math.ceil(w / 100) * 100; base = tbl.table[r] || tbl.min; }
    else { const a = Math.ceil((w - tbl.incrementAbove) / 100); base = tbl.table[tbl.incrementAbove] + a * tbl.increment; }
  } else if (screenType === "panelDoorPanel") {
    const tbl = p.panelDoorPanel, w = config.w2wMM;
    if (w <= tbl.minWidth) base = tbl.min;
    else if (w <= tbl.incrementAbove) { const r = Math.ceil(w / 100) * 100; base = tbl.table[r] || tbl.min; }
    else { const a = Math.ceil((w - tbl.incrementAbove) / 100); base = tbl.table[tbl.incrementAbove] + a * tbl.increment; }
  } else if (screenType === "fixedPanel") {
    isFixed = true; const w = config.panelMM;
    if (w <= p.fixedPanel.smallMax) base = p.fixedPanel.small;
    else if (w >= p.fixedPanel.largeMin && w <= p.fixedPanel.largeMax) base = p.fixedPanel.large;
    else base = p.fixedPanel.small;
  }
  const cs = p.colourSurcharge[config.colour] || { multi: 0, fixed: 0 };
  const colourAdd = isFixed ? cs.fixed : cs.multi;
  let doorAdd = 0;
  if (screenType !== "fixedPanel" && screenType !== "splay") {
    if (config.isSliding) doorAdd = 150;
    else if (config.doorMM === 762) doorAdd = 100;
  }
  const exGst = base + colourAdd + doorAdd;
  return { base, colourAdd, doorAdd, exGst, incGst: exGst * 1.10 };
}

// ========== GLOBAL STYLES ==========
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #000D1A; }
    input, select, textarea { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    button { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; border: none; cursor: pointer; }
    ::-webkit-scrollbar { width: 0; }
  `}</style>
);

// ========== HSSS LOGO ==========
const HsssLogo = ({ size = 140 }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 280 154" fill="none">
    <rect x="8" y="8" width="264" height="138" rx="16" fill="rgba(0,58,112,0.3)" stroke={B.cyan} strokeWidth="2"/>
    <text x="140" y="62" textAnchor="middle" fill={B.white} fontSize="38" fontWeight="800" fontFamily="Plus Jakarta Sans,system-ui">HSSS</text>
    <text x="140" y="88" textAnchor="middle" fill={B.cyan} fontSize="11" fontWeight="600" letterSpacing="3" fontFamily="Plus Jakarta Sans,system-ui">HYDRO SEAL SHOWER SYSTEMS</text>
    <text x="140" y="108" textAnchor="middle" fill={B.midGrey} fontSize="9" fontWeight="500" fontFamily="Plus Jakarta Sans,system-ui">Semi-Frameless Shower Screens</text>
    <line x1="60" y1="70" x2="220" y2="70" stroke={B.cyan} strokeWidth="1" opacity="0.3"/>
  </svg>
);

// ========== SHARED UI COMPONENTS ==========
const PageWrap = ({children, padTop="16px"}) => (
  <div style={{minHeight:"100vh",background:`linear-gradient(165deg,#000D1A 0%,${B.navyDeep} 40%,#001030 100%)`,padding:`${padTop} 16px 40px`,fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",maxWidth:480,margin:"0 auto"}}>
    <GlobalStyles/>{children}
  </div>
);
const Btn = ({children,onClick,variant="primary",full=true,disabled=false,style={}}) => {
  const base = {padding:"14px 20px",borderRadius:12,fontWeight:700,fontSize:15,width:full?"100%":"auto",opacity:disabled?0.4:1,transition:"all 0.2s",cursor:disabled?"default":"pointer"};
  const styles = variant==="primary"?{...base,background:`linear-gradient(135deg,${B.cyan},${B.navy})`,color:B.white,boxShadow:"0 4px 15px rgba(0,174,239,0.3)"}:variant==="outline"?{...base,background:"transparent",color:B.cyan,border:`2px solid ${B.cyan}`}:{...base,background:"rgba(0,174,239,0.1)",color:B.cyan,border:"1px solid rgba(0,174,239,0.2)"};
  return <button onClick={disabled?undefined:onClick} style={{...styles,...style}}>{children}</button>;
};
const Input = ({label,value,onChange,placeholder,type="text",required,optional}) => (
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
      <span style={{color:B.midGrey,fontSize:12,fontWeight:600}}>{label}{required&&<span style={{color:B.cyan}}> *</span>}</span>
      {optional&&<span style={{color:"rgba(90,125,158,0.5)",fontSize:10}}>Optional</span>}
    </div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"12px 14px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.white,fontSize:15,outline:"none",boxSizing:"border-box"}}/>
  </div>
);
const Card = ({children,style={}}) => (
  <div style={{background:"rgba(0,27,61,0.6)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:14,padding:16,marginBottom:16,...style}}>{children}</div>
);
const NavBar = ({onBack,title,onAction,actionLabel}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,padding:"4px 0",position:"relative"}}>
    {onBack?<button onClick={onBack} style={{background:"rgba(0,174,239,0.1)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:10,padding:"8px 14px",color:B.cyan,fontSize:13,fontWeight:600,cursor:"pointer"}}>← Back</button>:<div/>}
    <span style={{color:B.white,fontSize:16,fontWeight:700,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>{title}</span>
    {onAction?<button onClick={onAction} style={{background:"rgba(0,174,239,0.1)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:10,padding:"8px 14px",color:B.cyan,fontSize:13,fontWeight:600,cursor:"pointer"}}>{actionLabel}</button>:<div/>}
  </div>
);

// ========== LIVE PRICE DISPLAY ==========
const PriceDisplay = ({price}) => {
  if (!price) return null;
  return (
    <div style={{background:B.priceBg,border:`1.5px solid ${B.priceBorder}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{color:B.price,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Live Price</span>
        <span style={{color:"rgba(16,185,129,0.5)",fontSize:10}}>Ex GST</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <div><span style={{color:B.white,fontSize:28,fontWeight:800}}>${price.exGst.toFixed(2)}</span>
          <span style={{color:B.midGrey,fontSize:12,marginLeft:6}}>ex GST</span></div>
        <div style={{textAlign:"right"}}><div style={{color:B.midGrey,fontSize:12}}>${price.incGst.toFixed(2)}</div>
          <div style={{color:"rgba(90,125,158,0.5)",fontSize:9}}>inc GST</div></div>
      </div>
      {(price.colourAdd > 0 || price.doorAdd > 0 || price.radiusAdd > 0) && (
        <div style={{borderTop:"1px solid rgba(16,185,129,0.15)",marginTop:10,paddingTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
          <span style={{color:"rgba(90,125,158,0.6)",fontSize:10}}>Base ${price.base.toFixed(2)}</span>
          {price.colourAdd > 0 && <span style={{color:"rgba(90,125,158,0.6)",fontSize:10}}>+ ${price.colourAdd} colour</span>}
          {price.doorAdd > 0 && <span style={{color:"rgba(90,125,158,0.6)",fontSize:10}}>+ ${price.doorAdd} door</span>}
          {price.radiusAdd > 0 && <span style={{color:"rgba(90,125,158,0.6)",fontSize:10}}>+ ${price.radiusAdd} radius</span>}
        </div>
      )}
    </div>
  );
};

// ========== CUSTOM TBC PRICE DISPLAY ==========
const PriceTBC = () => (
  <div style={{background:B.customBg,border:`1.5px solid ${B.customBorder}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:20}}>📐</span>
      <div><div style={{color:B.custom,fontSize:14,fontWeight:700}}>Price TBC — Custom Panel</div>
        <div style={{color:B.midGrey,fontSize:11,marginTop:2}}>Requires site measure. HSSS will confirm pricing after measurement.</div></div>
    </div>
  </div>
);

// ========== CUSTOM PANEL TOGGLE + MEASURE DATE ==========
const CustomPanelToggle = ({isCustom,onToggle,measureDate,setMeasureDate}) => (
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:isCustom?B.customBg:"rgba(0,27,61,0.4)",border:`1.5px solid ${isCustom?B.customBorder:"rgba(0,174,239,0.15)"}`,borderRadius:10,cursor:"pointer",transition:"all 0.2s"}} onClick={onToggle}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:16}}>{isCustom?"📐":"📏"}</span>
        <div><div style={{color:isCustom?B.custom:B.midGrey,fontSize:13,fontWeight:700}}>Custom Panel Required</div>
          <div style={{color:B.midGrey,fontSize:10,marginTop:1}}>Non-stock size — needs site measure</div></div>
      </div>
      <div style={{width:42,height:24,borderRadius:12,background:isCustom?B.custom:"rgba(90,125,158,0.3)",padding:2,transition:"all 0.25s"}}>
        <div style={{width:20,height:20,borderRadius:10,background:B.white,transform:isCustom?"translateX(18px)":"translateX(0)",transition:"transform 0.25s"}}/>
      </div>
    </div>
    {isCustom&&(
      <div style={{marginTop:10,padding:"12px 14px",background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.15)",borderRadius:10}}>
        <div style={{color:B.custom,fontSize:11,fontWeight:700,marginBottom:6}}>Preferred Measure Date</div>
        <input type="date" value={measureDate} onChange={e=>setMeasureDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          style={{width:"100%",padding:"10px 12px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(168,85,247,0.3)",borderRadius:8,color:B.white,fontSize:14,outline:"none",colorScheme:"dark"}}/>
      </div>
    )}
  </div>
);

// ========== TOGGLE COMPONENT ==========
const Toggle = ({options,value,onChange,size="md",colour}) => {
  const idx = options.indexOf(value);
  const w = 100/options.length;
  const bg = colour || `linear-gradient(135deg,${B.cyan},${B.navyMid})`;
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
      <div style={{display:"inline-flex",background:"rgba(0,27,61,0.8)",border:"1px solid rgba(0,174,239,0.3)",borderRadius:10,padding:3,position:"relative",cursor:"pointer"}} onClick={()=>{const next=(idx+1)%options.length;onChange(options[next]);}}>
        <div style={{position:"absolute",top:3,left:`calc(${idx*w}% + 3px)`,width:`calc(${w}% - 4px)`,height:"calc(100% - 6px)",background:bg,borderRadius:8,transition:"left 0.25s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 2px 8px rgba(0,174,239,0.3)"}}/>
        {options.map((o,i)=>(
          <div key={i} style={{position:"relative",zIndex:1,padding:size==="sm"?"7px 12px":"10px 16px",fontSize:size==="sm"?11:13,fontWeight:700,color:i===idx?B.white:B.midGrey,transition:"color 0.2s",userSelect:"none",whiteSpace:"nowrap"}}>{o}</div>
        ))}
      </div>
    </div>
  );
};

// ========== MEASUREMENT INPUT ==========
const MeasurementInput = ({label,value,min,max,step,onChange,error}) => {
  const [inputVal, setInputVal] = useState(String(value));
  useEffect(()=>{ setInputVal(String(value)); },[value]);
  const nudge = d => {const n=value+d*50; if(n>=min&&n<=max) onChange(n);};
  const handleInput = e => {
    const raw=e.target.value.replace(/[^0-9]/g,"");
    setInputVal(raw);
  };
  const handleBlur = () => {
    let n=parseInt(inputVal,10);
    if(isNaN(n)){onChange(min);return;}
    n=Math.max(min,Math.min(max,n));
    onChange(n);
  };
  return (
    <div style={{marginBottom:12}}>
      <div style={{color:B.midGrey,fontSize:11,fontWeight:600,marginBottom:6}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>nudge(-1)} disabled={value<=min} style={{width:44,height:44,borderRadius:10,border:"1px solid rgba(0,174,239,0.3)",background:value<=min?"rgba(0,27,61,0.3)":"rgba(0,27,61,0.8)",color:value<=min?"rgba(90,125,158,0.4)":B.cyan,fontSize:20,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:value<=min?"default":"pointer"}}>−</button>
        <div style={{flex:1,position:"relative"}}>
          <input type="tel" inputMode="numeric" value={inputVal} onChange={handleInput} onFocus={e=>e.target.select()}
            style={{width:"100%",height:44,background:"rgba(0,27,61,0.8)",border:`2px solid ${error?"rgba(239,68,68,0.6)":"rgba(0,174,239,0.3)"}`,borderRadius:10,color:B.white,fontSize:18,fontWeight:700,textAlign:"center",outline:"none",boxSizing:"border-box"}}
            onBlur={handleBlur}/>
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",color:B.midGrey,fontSize:11,pointerEvents:"none"}}>mm</span>
        </div>
        <button onClick={()=>nudge(1)} disabled={value>=max} style={{width:44,height:44,borderRadius:10,border:"1px solid rgba(0,174,239,0.3)",background:value>=max?"rgba(0,27,61,0.3)":"rgba(0,27,61,0.8)",color:value>=max?"rgba(90,125,158,0.4)":B.cyan,fontSize:20,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:value>=max?"default":"pointer"}}>+</button>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4,padding:"0 52px"}}>
        <span style={{color:B.midGrey,fontSize:9}}>Min {min}mm</span>
        <span style={{color:B.midGrey,fontSize:9}}>Max {max}mm</span>
      </div>
    </div>
  );
};

// ========== COLOUR / WATERSTOP / DOOR PICKERS ==========
const ColourPicker = ({value,onChange}) => (
  <div style={{marginBottom:16}}>
    <div style={{color:B.midGrey,fontSize:12,fontWeight:600,marginBottom:10}}>Colour</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
      {COLOURS.map(c=>(
        <button key={c.name} onClick={()=>onChange(c.name)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px 4px",borderRadius:10,border:value===c.name?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.15)",background:value===c.name?"rgba(0,174,239,0.1)":"rgba(0,27,61,0.4)",transition:"all 0.2s"}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:c.hex,border:`2px solid ${c.ring}`,boxShadow:value===c.name?"0 0 12px rgba(0,174,239,0.4)":"none"}}/>
          <span style={{color:value===c.name?B.white:B.midGrey,fontSize:9,fontWeight:600,textAlign:"center"}}>{c.name}</span>
        </button>
      ))}
    </div>
  </div>
);

const WaterstopPicker = ({value,onChange}) => (
  <div style={{marginBottom:14}}>
    <div style={{color:B.midGrey,fontSize:12,fontWeight:600,marginBottom:8}}>Waterstop Height</div>
    <div style={{display:"flex",gap:8}}>
      {WATERSTOPS.map(h=>(
        <button key={h} onClick={()=>onChange(h)} style={{flex:1,padding:"10px 8px",borderRadius:10,border:value===h?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.15)",background:value===h?"rgba(0,174,239,0.15)":"rgba(0,27,61,0.4)",color:value===h?B.white:B.midGrey,fontSize:14,fontWeight:700,transition:"all 0.2s"}}>
          {h}mm
        </button>
      ))}
    </div>
  </div>
);

const DoorToggle = ({doorMM,onToggle}) => (
  <div style={{marginBottom:12}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
      <span style={{color:B.midGrey,fontSize:11,fontWeight:600}}>Door Size</span>
      <div style={{display:"flex",background:"rgba(0,27,61,0.8)",border:"1px solid rgba(0,174,239,0.3)",borderRadius:10,padding:3,position:"relative",cursor:"pointer"}} onClick={onToggle}>
        <div style={{position:"absolute",top:3,left:doorMM===662?"3px":"calc(50% - 1px)",width:"calc(50% - 2px)",height:"calc(100% - 6px)",background:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,borderRadius:8,transition:"left 0.25s cubic-bezier(0.4,0,0.2,1)",boxShadow:"0 2px 8px rgba(0,174,239,0.3)"}}/>
        <div style={{position:"relative",zIndex:1,padding:"8px 16px",fontSize:12,fontWeight:700,color:doorMM===662?B.white:B.midGrey,userSelect:"none"}}>662mm</div>
        <div style={{position:"relative",zIndex:1,padding:"8px 16px",fontSize:12,fontWeight:700,color:doorMM===762?B.white:B.midGrey,userSelect:"none"}}>762mm</div>
      </div>
      {doorMM===762&&<span style={{background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:6,padding:"3px 8px",color:B.dim,fontSize:11,fontWeight:700}}>+$100</span>}
    </div>
  </div>
);

const DoorTypeToggle = ({isSliding,onToggle}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
    <div style={{display:"flex",background:"rgba(0,27,61,0.8)",border:`1px solid ${isSliding?"rgba(34,197,94,0.4)":"rgba(0,174,239,0.3)"}`,borderRadius:10,padding:3,position:"relative",cursor:"pointer"}} onClick={onToggle}>
      <div style={{position:"absolute",top:3,left:!isSliding?"3px":"calc(50% - 1px)",width:"calc(50% - 2px)",height:"calc(100% - 6px)",background:!isSliding?`linear-gradient(135deg,${B.cyan},${B.navyMid})`:`linear-gradient(135deg,${B.slideColor},#166534)`,borderRadius:8,transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)"}}/>
      <div style={{position:"relative",zIndex:1,padding:"10px 18px",fontSize:13,fontWeight:700,color:!isSliding?B.white:B.midGrey,userSelect:"none"}}>Hinged</div>
      <div style={{position:"relative",zIndex:1,padding:"10px 18px",fontSize:13,fontWeight:700,color:isSliding?B.white:B.midGrey,userSelect:"none"}}>Sliding</div>
    </div>
    {isSliding&&<span style={{marginLeft:8,background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:6,padding:"3px 8px",color:B.slideColor,fontSize:11,fontWeight:700}}>+$150</span>}
  </div>
);


// ╔═══════════════════════════════════════════════════════════════╗
// ║  FRONT & RETURN — DIAGRAM COMPONENTS                        ║
// ╚═══════════════════════════════════════════════════════════════╝

const FrontReturnLH = ({hingeSide,frontMM,returnMM,doorMM}) => {
  const s=0.12,fPx=frontMM*s,rPx=returnMM*s,t=8,cX=55+fPx+15,cY=45;
  const rX=cX-fPx,rTY=cY+3,rBY=rTY+rPx,fY=rBY;
  const dW=doorMM*s,dSX=rX+t+2,fSX=dSX+dW+2,fW=Math.max(0,cX-3-fSX),dR=dW;
  const vbW=cX+40,vbH=fY+45;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={rX-15} y1={cY} x2={cX+5} y2={cY} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={cX} y1={cY-5} x2={cX} y2={fY+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={dSX} y={fY+2} width={cX-3-dSX} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={rX-6} y={rTY} width={4} height={rPx} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={rX} y={rTY} width={t} height={rPx} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={rX+t/2} y={rTY+rPx/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600" transform={`rotate(-90,${rX+t/2},${rTY+rPx/2})`}>Return</text>
      <rect x={dSX} y={fY-t} width={dW} height={t} fill={B.door} stroke={B.doorBorder} strokeWidth="2" rx="1"/>
      <text x={dSX+dW/2} y={fY-t/2} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="8" fontWeight="600">Door</text>
      {hingeSide==="left"?(
        <><path d={`M ${dSX+dW} ${fY-t/2} A ${dR} ${dR} 0 0 0 ${dSX} ${fY-t/2-dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d={`M ${dSX+dW} ${fY-t/2} A ${dR} ${dR} 0 0 1 ${dSX} ${fY-t/2+dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
        <circle cx={dSX} cy={fY-t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      ):(
        <><path d={`M ${dSX} ${fY-t/2} A ${dR} ${dR} 0 0 1 ${dSX+dW} ${fY-t/2-dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d={`M ${dSX} ${fY-t/2} A ${dR} ${dR} 0 0 0 ${dSX+dW} ${fY-t/2+dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
        <circle cx={dSX+dW} cy={fY-t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      )}
      {fW>5&&<><rect x={fSX} y={fY-t} width={fW} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={fSX+fW/2} y={fY-t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="500">Fixed</text></>}
      <rect x={rX+t+1} y={fY-t-11} width="10" height="10" fill="none" stroke={B.white} strokeWidth="1.2" opacity="0.5"/>
      <line x1={rX+t} y1={fY+22} x2={cX} y2={fY+22} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={rX+t} y1={fY+17} x2={rX+t} y2={fY+27} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={cX} y1={fY+17} x2={cX} y2={fY+27} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(rX+t+cX)/2} y={fY+37} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{frontMM}mm</text>
      <line x1={rX-18} y1={cY} x2={rX-18} y2={fY} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={rX-23} y1={cY} x2={rX-13} y2={cY} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rX-23} y1={fY} x2={rX-13} y2={fY} stroke={B.dim} strokeWidth="1.5"/>
      <text x={rX-28} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill={B.dim} fontSize="9" fontWeight="600" transform={`rotate(-90,${rX-28},${(cY+fY)/2})`}>{returnMM}mm</text>
      <text x={(rX+cX)/2+10} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill="rgba(0,174,239,0.12)" fontSize="22" fontWeight="800">LH</text>
    </svg>
  );
};

const FrontReturnRH = ({hingeSide,frontMM,returnMM,doorMM}) => {
  const s=0.12,fPx=frontMM*s,rPx=returnMM*s,t=8,lW=55,cY=45;
  const rX=lW+fPx,rTY=cY+3,rBY=rTY+rPx,fY=rBY;
  const dW=doorMM*s,fSX=lW+3,avail=rX-2-fSX,fW=Math.max(0,avail-dW-2),dSX=fSX+fW+2,dR=dW;
  const vbW=rX+t+40,vbH=fY+45;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW-5} y1={cY} x2={rX+t+15} y2={cY} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={lW} y1={cY-5} x2={lW} y2={fY+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={lW+3} y={fY+2} width={rX-t-lW} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={rX+t+2} y={rTY} width={4} height={rPx} fill={B.hob} rx="1" opacity="0.6"/>
      {fW>5&&<><rect x={fSX} y={fY-t} width={fW} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={fSX+fW/2} y={fY-t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="500">Fixed</text></>}
      <rect x={dSX} y={fY-t} width={dW} height={t} fill={B.door} stroke={B.doorBorder} strokeWidth="2" rx="1"/>
      <text x={dSX+dW/2} y={fY-t/2} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="8" fontWeight="600">Door</text>
      {hingeSide==="right"?(
        <><path d={`M ${dSX} ${fY-t/2} A ${dR} ${dR} 0 0 1 ${dSX+dW} ${fY-t/2-dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d={`M ${dSX} ${fY-t/2} A ${dR} ${dR} 0 0 0 ${dSX+dW} ${fY-t/2+dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
        <circle cx={dSX+dW} cy={fY-t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      ):(
        <><path d={`M ${dSX+dW} ${fY-t/2} A ${dR} ${dR} 0 0 0 ${dSX} ${fY-t/2-dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d={`M ${dSX+dW} ${fY-t/2} A ${dR} ${dR} 0 0 1 ${dSX} ${fY-t/2+dR}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
        <circle cx={dSX} cy={fY-t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      )}
      <rect x={rX} y={rTY} width={t} height={rPx} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={rX+t/2} y={rTY+rPx/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600" transform={`rotate(90,${rX+t/2},${rTY+rPx/2})`}>Return</text>
      <rect x={rX-11} y={fY-t-11} width="10" height="10" fill="none" stroke={B.white} strokeWidth="1.2" opacity="0.5"/>
      <line x1={lW} y1={fY+22} x2={rX} y2={fY+22} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={fY+17} x2={lW} y2={fY+27} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rX} y1={fY+17} x2={rX} y2={fY+27} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rX)/2} y={fY+37} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{frontMM}mm</text>
      <line x1={rX+t+18} y1={cY} x2={rX+t+18} y2={fY} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={rX+t+13} y1={cY} x2={rX+t+23} y2={cY} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rX+t+13} y1={fY} x2={rX+t+23} y2={fY} stroke={B.dim} strokeWidth="1.5"/>
      <text x={rX+t+28} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill={B.dim} fontSize="9" fontWeight="600" transform={`rotate(90,${rX+t+28},${(cY+fY)/2})`}>{returnMM}mm</text>
      <text x={(lW+rX)/2-10} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill="rgba(0,174,239,0.12)" fontSize="22" fontWeight="800">RH</text>
    </svg>
  );
};

const FRSliding = ({frontMM,returnMM,isLH}) => {
  const s=0.12,fPx=frontMM*s,rPx=returnMM*s,t=8,off=5;
  const cX=isLH?(55+fPx+15):55,cY=45;
  const rX=isLH?(cX-fPx):(cX+fPx),rTY=cY+3,rBY=rTY+rPx,fY=rBY;
  const avail=isLH?(cX-3-(rX+t+2)):(rX-2-(cX+3));
  const fixPx=avail*0.48,doorPx=fixPx*0.9;
  const fixSX=isLH?(cX-3-fixPx):(cX+3),fixEX=isLH?(cX-3):(cX+3+fixPx);
  const doorSX=isLH?(cX-3-doorPx):(cX+3);
  const vbW=(isLH?cX:cX+fPx)+40,vbH=fY+45;
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      {isLH?<><line x1={rX-15} y1={cY} x2={cX+5} y2={cY} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
        <line x1={cX} y1={cY-5} x2={cX} y2={fY+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/></>
        :<><line x1={cX-5} y1={cY} x2={rX+t+15} y2={cY} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
        <line x1={cX} y1={cY-5} x2={cX} y2={fY+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/></>}
      <rect x={isLH?rX:rX} y={rTY} width={t} height={rPx} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={(isLH?rX:rX)+t/2} y={rTY+rPx/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600" transform={`rotate(${isLH?-90:90},${(isLH?rX:rX)+t/2},${rTY+rPx/2})`}>Return</text>
      <rect x={Math.min(fixSX,fixEX)} y={fY-t} width={fixPx} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={(fixSX+fixEX)/2} y={fY-t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600">Fixed</text>
      <rect x={doorSX} y={fY-t+off} width={doorPx} height={t} fill={B.slide} stroke={B.slideBorder} strokeWidth="2" rx="1"/>
      <text x={doorSX+doorPx/2} y={fY-t/2+off} textAnchor="middle" dominantBaseline="middle" fill={B.slideColor} fontSize="7" fontWeight="600">Sliding Door</text>
      <defs><marker id="sArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill={B.slideColor} opacity="0.7"/></marker></defs>
      {isLH?<line x1={cX-fixPx+20} y1={fY+off+8} x2={cX-3} y2={fY+off+8} stroke={B.slideColor} strokeWidth="1.5" markerEnd="url(#sArrow)" opacity="0.6"/>
        :<line x1={cX+fixPx-20} y1={fY+off+8} x2={cX+3} y2={fY+off+8} stroke={B.slideColor} strokeWidth="1.5" markerEnd="url(#sArrow)" opacity="0.6"/>}
      <line x1={isLH?rX+t:cX} y1={fY+28} x2={isLH?cX:rX} y2={fY+28} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={isLH?rX+t:cX} y1={fY+23} x2={isLH?rX+t:cX} y2={fY+33} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={isLH?cX:rX} y1={fY+23} x2={isLH?cX:rX} y2={fY+33} stroke={B.dim} strokeWidth="1.5"/>
      <text x={isLH?(rX+t+cX)/2:(cX+rX)/2} y={fY+42} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{frontMM}mm</text>
      <text x={isLH?(rX+cX)/2+10:(cX+rX)/2-10} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill="rgba(34,197,94,0.1)" fontSize="18" fontWeight="800">{isLH?"LH":"RH"} SLIDE</text>
    </svg>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  FRONT ONLY — DIAGRAM COMPONENTS                            ║
// ╚═══════════════════════════════════════════════════════════════╝

const PanelDoorHinged = ({w2wMM,doorMM,isLH,hingeSide}) => {
  const s=0.12,w2w=w2wMM*s,dPx=doorMM*s,t=8,lW=50,pY=80,rW=lW+w2w;
  const dSX=isLH?(lW+3):(rW-3-dPx);
  const pSX=isLH?(dSX+dPx+2):(lW+3);
  const pW=isLH?Math.max(0,rW-3-pSX):Math.max(0,dSX-2-pSX);
  const hX=hingeSide==="left"?dSX:dSX+dPx,hdX=hingeSide==="left"?dSX+dPx:dSX;
  const vbW=rW+30,vbH=pY+t+50;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW} y1={30} x2={lW} y2={pY+t+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={rW} y1={30} x2={rW} y2={pY+t+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={lW+3} y={pY+t+2} width={w2w-6} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={dSX} y={pY} width={dPx} height={t} fill={B.door} stroke={B.doorBorder} strokeWidth="2" rx="1"/>
      <text x={dSX+dPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="8" fontWeight="600">Door {doorMM}mm</text>
      {hingeSide==="left"?(
        <><path d={`M ${hdX} ${pY+t/2} A ${dPx} ${dPx} 0 0 0 ${hX} ${pY+t/2-dPx}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d={`M ${hdX} ${pY+t/2} A ${dPx} ${dPx} 0 0 1 ${hX} ${pY+t/2+dPx}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
        <circle cx={hX} cy={pY+t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      ):(
        <><path d={`M ${hdX} ${pY+t/2} A ${dPx} ${dPx} 0 0 1 ${hX} ${pY+t/2-dPx}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <path d={`M ${hdX} ${pY+t/2} A ${dPx} ${dPx} 0 0 0 ${hX} ${pY+t/2+dPx}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
        <circle cx={hX} cy={pY+t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      )}
      {pW>5&&<><rect x={pSX} y={pY} width={pW} height={t} fill={B.tbc} stroke={B.tbcBorder} strokeWidth="1.5" rx="1" strokeDasharray="6 3"/>
      <text x={pSX+pW/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="7" fontWeight="600">Panel TBC</text></>}
      <line x1={lW} y1={pY+t+22} x2={rW} y2={pY+t+22} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={pY+t+17} x2={lW} y2={pY+t+27} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rW} y1={pY+t+17} x2={rW} y2={pY+t+27} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rW)/2} y={pY+t+35} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{w2wMM}mm</text>
      <text x={(lW+rW)/2} y={50} textAnchor="middle" fill="rgba(0,174,239,0.12)" fontSize="18" fontWeight="800">{isLH?"LH":"RH"}</text>
    </svg>
  );
};

const PanelDoorSliding = ({w2wMM,isLH}) => {
  const s=0.12,w2w=w2wMM*s,t=8,off=5,lW=50,pY=80,rW=lW+w2w;
  const panPx=w2w*0.48,dPx=panPx*0.9;
  const pSX=isLH?(lW+3):(rW-3-panPx),dSX=isLH?(lW+3):(rW-3-dPx);
  const vbW=rW+30,vbH=pY+t+off+55;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW} y1={30} x2={lW} y2={pY+t+off+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={rW} y1={30} x2={rW} y2={pY+t+off+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={lW+3} y={pY+t+off+2} width={w2w-6} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={pSX} y={pY} width={panPx} height={t} fill={B.tbc} stroke={B.tbcBorder} strokeWidth="1.5" rx="1" strokeDasharray="6 3"/>
      <text x={pSX+panPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="7" fontWeight="600">Panel TBC</text>
      <rect x={dSX} y={pY+off} width={dPx} height={t} fill={B.slide} stroke={B.slideBorder} strokeWidth="2" rx="1"/>
      <text x={dSX+dPx/2} y={pY+off+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.slideColor} fontSize="7" fontWeight="600">Sliding Door</text>
      <line x1={lW} y1={pY+t+off+25} x2={rW} y2={pY+t+off+25} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={pY+t+off+20} x2={lW} y2={pY+t+off+30} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rW} y1={pY+t+off+20} x2={rW} y2={pY+t+off+30} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rW)/2} y={pY+t+off+40} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{w2wMM}mm</text>
      <text x={(lW+rW)/2} y={50} textAnchor="middle" fill="rgba(34,197,94,0.1)" fontSize="16" fontWeight="800">{isLH?"LH":"RH"} SLIDE</text>
    </svg>
  );
};

const PanelDoorPanelHinged = ({w2wMM,doorMM,leftPanelMM,rightPanelMM,hingeSide}) => {
  const s=0.12,w2w=w2wMM*s,dPx=doorMM*s,lPx=leftPanelMM*s,rPx=rightPanelMM*s,t=8;
  const lW=50,pY=80,rW=lW+w2w;
  const lS=lW+3,dSX=lS+lPx+2,rS=dSX+dPx+2,rWd=Math.max(0,rW-3-rS);
  const hX=hingeSide==="left"?dSX:dSX+dPx,hdX=hingeSide==="left"?dSX+dPx:dSX;
  const vbW=rW+30,vbH=pY+t+55;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW} y1={30} x2={lW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={rW} y1={30} x2={rW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={lW+3} y={pY+t+2} width={w2w-6} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={lS} y={pY} width={lPx} height={t} fill={B.tbc} stroke={B.tbcBorder} strokeWidth="1.5" rx="1" strokeDasharray="6 3"/>
      <text x={lS+lPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="7" fontWeight="600">Panel</text>
      <rect x={dSX} y={pY} width={dPx} height={t} fill={B.door} stroke={B.doorBorder} strokeWidth="2" rx="1"/>
      <text x={dSX+dPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="8" fontWeight="600">Door</text>
      {hingeSide==="left"?(
        <><path d={`M ${hdX} ${pY+t/2} A ${dPx} ${dPx} 0 0 0 ${hX} ${pY+t/2-dPx}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <circle cx={hX} cy={pY+t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      ):(
        <><path d={`M ${hdX} ${pY+t/2} A ${dPx} ${dPx} 0 0 1 ${hX} ${pY+t/2-dPx}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        <circle cx={hX} cy={pY+t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/></>
      )}
      {rWd>5&&<><rect x={rS} y={pY} width={rWd} height={t} fill={B.tbc} stroke={B.tbcBorder} strokeWidth="1.5" rx="1" strokeDasharray="6 3"/>
      <text x={rS+rWd/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="7" fontWeight="600">Panel</text></>}
      <line x1={lW} y1={pY+t+25} x2={rW} y2={pY+t+25} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={pY+t+20} x2={lW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rW} y1={pY+t+20} x2={rW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rW)/2} y={pY+t+40} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{w2wMM}mm</text>
    </svg>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  SPLAYED — DIAGRAM COMPONENT                                ║
// ╚═══════════════════════════════════════════════════════════════╝

const SplayedOverhead = ({hingeSide="left",sizeA=0,sizeB=0}) => {
  const wA=SPLAYED_SIZES[sizeA]||SPLAYED_SIZES[0];
  const wB=SPLAYED_SIZES[sizeB]||SPLAYED_SIZES[0];
  const s=0.13;
  const wApx=wA.internal*s,wBpx=wB.internal*s,lApx=wB.leg*s,lBpx=wA.leg*s;
  const t=8,cx=55+wApx+15,cy=45;
  const pAx=cx-wApx,pATY=cy+3,pABY=pATY+lApx;
  const pBRX=cx-3,pBLX=pBRX-lBpx,pBy=cy+wBpx;
  const dX1=pAx,dY1=pABY,dX2=pBLX,dY2=pBy;
  const ddx=dX2-dX1,ddy=dY2-dY1;
  const dLen=Math.sqrt(ddx*ddx+ddy*ddy);
  if(dLen===0) return <svg viewBox="0 0 200 200" style={{width:"100%"}}><text x="100" y="100" textAnchor="middle" fill={B.midGrey} fontSize="12">Select sizes above</text></svg>;
  const dpx=-ddy/dLen,dpy=ddx/dLen,dAng=Math.atan2(ddy,ddx)*(180/Math.PI);
  const hPt=hingeSide==="left"?{x:dX1,y:dY1}:{x:dX2,y:dY2};
  const hdPt=hingeSide==="left"?{x:dX2,y:dY2}:{x:dX1,y:dY1};
  const arcIn={x:hPt.x+dpx*dLen,y:hPt.y+dpy*dLen};
  const arcOut={x:hPt.x-dpx*dLen,y:hPt.y-dpy*dLen};
  const vbW=cx+45,vbH=pBy+40;
  const doorMidX=(dX1+dX2)/2+dpx*t/2;
  const doorMidY=(dY1+dY2)/2+dpy*t/2;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={pAx-20} y1={cy} x2={cx+5} y2={cy} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={cx} y1={cy-5} x2={cx} y2={pBy+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={pAx-6} y={pATY} width={4} height={lApx} fill={B.hob} rx="1" opacity="0.6"/>
      <line x1={dX1-dpx*5} y1={dY1-dpy*5} x2={dX2-dpx*5} y2={dY2-dpy*5} stroke={B.hob} strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
      <rect x={pBLX} y={pBy+2} width={lBpx} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={pAx} y={pATY} width={t} height={lApx} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={pAx+t/2} y={pATY+lApx/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="500" transform={`rotate(-90,${pAx+t/2},${pATY+lApx/2})`}>{wB.leg}mm</text>
      <polygon points={`${dX1},${dY1} ${dX2},${dY2} ${dX2+dpx*t},${dY2+dpy*t} ${dX1+dpx*t},${dY1+dpy*t}`} fill={B.door} stroke={B.doorBorder} strokeWidth="2"/>
      <text x={doorMidX} y={doorMidY} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="8" fontWeight="600" transform={`rotate(${dAng},${doorMidX},${doorMidY})`}>Door {DOOR_MM}mm</text>
      <path d={`M ${hdPt.x} ${hdPt.y} A ${dLen} ${dLen} 0 0 ${hingeSide==="left"?"1":"0"} ${arcIn.x} ${arcIn.y}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      <path d={`M ${hdPt.x} ${hdPt.y} A ${dLen} ${dLen} 0 0 ${hingeSide==="left"?"0":"1"} ${arcOut.x} ${arcOut.y}`} fill="none" stroke={B.doorBorder} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.35"/>
      <circle cx={hPt.x+dpx*t/2} cy={hPt.y+dpy*t/2} r="4" fill={B.hinge} stroke={B.white} strokeWidth="1.5"/>
      <rect x={pBLX} y={pBy-t} width={lBpx} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={pBLX+lBpx/2} y={pBy-t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="500">{wA.leg}mm</text>
      <rect x={cx-16} y={cy+4} width="12" height="12" fill="none" stroke={B.white} strokeWidth="1.2" opacity="0.5"/>
      <line x1={pAx+t/2} y1={cy-15} x2={cx} y2={cy-15} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={pAx+t/2} y1={cy-20} x2={pAx+t/2} y2={cy-10} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={cx} y1={cy-20} x2={cx} y2={cy-10} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(pAx+t/2+cx)/2} y={cy-23} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{wA.internal}mm</text>
      <line x1={cx+15} y1={cy} x2={cx+15} y2={pBy-t/2} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={cx+10} y1={cy} x2={cx+20} y2={cy} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={cx+10} y1={pBy-t/2} x2={cx+20} y2={pBy-t/2} stroke={B.dim} strokeWidth="1.5"/>
      <text x={cx+28} y={(cy+pBy-t/2)/2} textAnchor="middle" dominantBaseline="middle" fill={B.dim} fontSize="9" fontWeight="600" transform={`rotate(90,${cx+28},${(cy+pBy-t/2)/2})`}>{wB.internal}mm</text>
    </svg>
  );
};

const WallSelector = ({label,sizeIdx,onChange}) => (
  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
    <span style={{color:B.midGrey,fontSize:11,fontWeight:600,minWidth:55}}>{label}</span>
    {SPLAYED_SIZES.map((sz,i)=>(
      <button key={i} onClick={()=>onChange(i)} style={{padding:"7px 12px",borderRadius:8,border:i===sizeIdx?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.2)",background:i===sizeIdx?"linear-gradient(135deg,rgba(0,174,239,0.2),rgba(10,77,138,0.3))":"rgba(0,27,61,0.6)",color:i===sizeIdx?B.white:B.midGrey,fontSize:13,fontWeight:700,flex:1,textAlign:"center",transition:"all 0.2s"}}>{sz.internal}</button>
    ))}
  </div>
);


// ╔═══════════════════════════════════════════════════════════════╗
// ║  FIXED PANELS — DIAGRAM COMPONENTS                          ║
// ╚═══════════════════════════════════════════════════════════════╝

const FixedLH = ({panelMM,wallToWallMM}) => {
  const s=0.12,pPx=panelMM*s,w2w=wallToWallMM*s,wPx=Math.max(0,w2w-pPx),t=8;
  const lW=50,pY=90,pS=lW+3,pE=pS+pPx,rW=lW+w2w;
  const vbW=rW+30,vbH=pY+t+60;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW} y1={30} x2={lW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={rW} y1={30} x2={rW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={pS} y={pY+t+2} width={pPx} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={pS} y={pY} width={pPx} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={pS+pPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600">Fixed</text>
      {wPx>10&&<><rect x={pE+4} y={pY-5} width={wPx-8} height={t+10} fill={B.walk} stroke={B.walkBorder} strokeWidth="1" strokeDasharray="4 3" rx="3"/>
      <text x={pE+4+(wPx-8)/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.walkColor} fontSize="7" fontWeight="600" opacity="0.8">Walk</text></>}
      <line x1={pS} y1={pY-20} x2={pE} y2={pY-20} stroke={B.cyan} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={pS} y1={pY-25} x2={pS} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <line x1={pE} y1={pY-25} x2={pE} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <text x={(pS+pE)/2} y={pY-28} textAnchor="middle" fill={B.cyan} fontSize="9" fontWeight="600">{panelMM}mm</text>
      <line x1={lW} y1={pY+t+25} x2={rW} y2={pY+t+25} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={pY+t+20} x2={lW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rW} y1={pY+t+20} x2={rW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rW)/2} y={pY+t+40} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{wallToWallMM}mm (wall to wall)</text>
      <text x={(lW+rW)/2} y={55} textAnchor="middle" fill="rgba(0,174,239,0.12)" fontSize="18" fontWeight="800">LH</text>
    </svg>
  );
};

const FixedRH = ({panelMM,wallToWallMM}) => {
  const s=0.12,pPx=panelMM*s,w2w=wallToWallMM*s,t=8;
  const lW=50,pY=90,rW=lW+w2w,pE=rW-3,pS=pE-pPx,wPx=Math.max(0,w2w-pPx);
  const vbW=rW+30,vbH=pY+t+60;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW} y1={30} x2={lW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={rW} y1={30} x2={rW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={pS} y={pY+t+2} width={pPx} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={pS} y={pY} width={pPx} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={pS+pPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600">Fixed</text>
      {wPx>10&&<><rect x={lW+7} y={pY-5} width={wPx-8} height={t+10} fill={B.walk} stroke={B.walkBorder} strokeWidth="1" strokeDasharray="4 3" rx="3"/>
      <text x={lW+7+(wPx-8)/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.walkColor} fontSize="7" fontWeight="600" opacity="0.8">Walk</text></>}
      <line x1={pS} y1={pY-20} x2={pE} y2={pY-20} stroke={B.cyan} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={pS} y1={pY-25} x2={pS} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <line x1={pE} y1={pY-25} x2={pE} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <text x={(pS+pE)/2} y={pY-28} textAnchor="middle" fill={B.cyan} fontSize="9" fontWeight="600">{panelMM}mm</text>
      <line x1={lW} y1={pY+t+25} x2={rW} y2={pY+t+25} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={pY+t+20} x2={lW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rW} y1={pY+t+20} x2={rW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rW)/2} y={pY+t+40} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{wallToWallMM}mm (wall to wall)</text>
      <text x={(lW+rW)/2} y={55} textAnchor="middle" fill="rgba(0,174,239,0.12)" fontSize="18" fontWeight="800">RH</text>
    </svg>
  );
};

const FixedWalkthrough = ({wallToWallMM,leftPanelMM,rightPanelMM}) => {
  const s=0.12,w2w=wallToWallMM*s,lPx=leftPanelMM*s,rPx=rightPanelMM*s,t=8;
  const lW=50,pY=90,rW=lW+w2w;
  const lS=lW+3,lE=lS+lPx,rE2=rW-3,rS2=rE2-rPx,gap=Math.max(0,rS2-lE);
  const vbW=rW+30,vbH=pY+t+60;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      <line x1={lW} y1={30} x2={lW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <line x1={rW} y1={30} x2={rW} y2={pY+t+20} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
      <rect x={lS} y={pY+t+2} width={lPx} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={rS2} y={pY+t+2} width={rPx} height={4} fill={B.hob} rx="1" opacity="0.6"/>
      <rect x={lS} y={pY} width={lPx} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={lS+lPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600">Fixed</text>
      <rect x={rS2} y={pY} width={rPx} height={t} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={rS2+rPx/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600">Fixed</text>
      {gap>5&&<><rect x={lE+4} y={pY-5} width={rS2-lE-8} height={t+10} fill={B.walk} stroke={B.walkBorder} strokeWidth="1" strokeDasharray="4 3" rx="3"/>
      <text x={(lE+rS2)/2} y={pY+t/2} textAnchor="middle" dominantBaseline="middle" fill={B.walkColor} fontSize="7" fontWeight="600" opacity="0.8">Walk</text></>}
      <line x1={lS} y1={pY-20} x2={lE} y2={pY-20} stroke={B.cyan} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lS} y1={pY-25} x2={lS} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <line x1={lE} y1={pY-25} x2={lE} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <text x={(lS+lE)/2} y={pY-28} textAnchor="middle" fill={B.cyan} fontSize="9" fontWeight="600">{leftPanelMM}mm</text>
      <line x1={rS2} y1={pY-20} x2={rE2} y2={pY-20} stroke={B.cyan} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={rS2} y1={pY-25} x2={rS2} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <line x1={rE2} y1={pY-25} x2={rE2} y2={pY-15} stroke={B.cyan} strokeWidth="1.5"/>
      <text x={(rS2+rE2)/2} y={pY-28} textAnchor="middle" fill={B.cyan} fontSize="9" fontWeight="600">{rightPanelMM}mm</text>
      <line x1={lW} y1={pY+t+25} x2={rW} y2={pY+t+25} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={lW} y1={pY+t+20} x2={lW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={rW} y1={pY+t+20} x2={rW} y2={pY+t+30} stroke={B.dim} strokeWidth="1.5"/>
      <text x={(lW+rW)/2} y={pY+t+40} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{wallToWallMM}mm (wall to wall)</text>
    </svg>
  );
};

const Fixed90Return = ({returnMM,frontMM,isLH}) => {
  const s=0.12,rPx=returnMM*s,fPx=frontMM*s,t=8;
  const cX=isLH?(55+fPx+15):55,cY=45;
  const rX=isLH?(cX-fPx):(cX+fPx),rTY=cY+3,rBY=rTY+rPx,fY=rBY;
  const fSX=isLH?(rX+t+2):(cX+3),fEX=isLH?(cX-3):(rX-2);
  const vbW=(isLH?cX:cX+fPx)+40,vbH=fY+50;
  return(
    <svg viewBox={`0 0 ${vbW} ${vbH}`} fill="none" style={{width:"100%"}}>
      {isLH?<><line x1={rX-15} y1={cY} x2={cX+5} y2={cY} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
        <line x1={cX} y1={cY-5} x2={cX} y2={fY+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/></>
        :<><line x1={cX-5} y1={cY} x2={rX+15} y2={cY} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/>
        <line x1={cX} y1={cY-5} x2={cX} y2={fY+15} stroke={B.wall} strokeWidth="6" strokeLinecap="round"/></>}
      {isLH?<rect x={rX-6} y={rTY} width={4} height={rPx} fill={B.hob} rx="1" opacity="0.6"/>
        :<rect x={rX+t+2} y={rTY} width={4} height={rPx} fill={B.hob} rx="1" opacity="0.6"/>}
      <rect x={isLH?rX:rX} y={rTY} width={t} height={rPx} fill={B.glass} stroke={B.glassBorder} strokeWidth="1.5" rx="1"/>
      <text x={(isLH?rX:rX)+t/2} y={rTY+rPx/2} textAnchor="middle" dominantBaseline="middle" fill={B.midGrey} fontSize="8" fontWeight="600" transform={`rotate(-90,${(isLH?rX:rX)+t/2},${rTY+rPx/2})`}>Fixed</text>
      <rect x={Math.min(fSX,fEX)} y={fY-10} width={Math.abs(fEX-fSX)} height={20} fill={B.walk} stroke={B.walkBorder} strokeWidth="1" strokeDasharray="4 3" rx="3"/>
      <text x={(fSX+fEX)/2} y={fY} textAnchor="middle" dominantBaseline="middle" fill={B.walkColor} fontSize="8" fontWeight="600" opacity="0.8">Walkthrough</text>
      {isLH?<rect x={cX-16} y={cY+4} width="12" height="12" fill="none" stroke={B.white} strokeWidth="1.2" opacity="0.5"/>
        :<rect x={cX+4} y={cY+4} width="12" height="12" fill="none" stroke={B.white} strokeWidth="1.2" opacity="0.5"/>}
      {isLH?<><line x1={rX-18} y1={cY} x2={rX-18} y2={fY} stroke={B.cyan} strokeWidth="1" strokeDasharray="3 2"/>
        <line x1={rX-23} y1={cY} x2={rX-13} y2={cY} stroke={B.cyan} strokeWidth="1.5"/>
        <line x1={rX-23} y1={fY} x2={rX-13} y2={fY} stroke={B.cyan} strokeWidth="1.5"/>
        <text x={rX-28} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="9" fontWeight="600" transform={`rotate(-90,${rX-28},${(cY+fY)/2})`}>{returnMM}mm</text></>
        :<><line x1={rX+t+18} y1={cY} x2={rX+t+18} y2={fY} stroke={B.cyan} strokeWidth="1" strokeDasharray="3 2"/>
        <line x1={rX+t+13} y1={cY} x2={rX+t+23} y2={cY} stroke={B.cyan} strokeWidth="1.5"/>
        <line x1={rX+t+13} y1={fY} x2={rX+t+23} y2={fY} stroke={B.cyan} strokeWidth="1.5"/>
        <text x={rX+t+28} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill={B.cyan} fontSize="9" fontWeight="600" transform={`rotate(90,${rX+t+28},${(cY+fY)/2})`}>{returnMM}mm</text></>}
      <line x1={isLH?rX+t:cX} y1={fY+22} x2={isLH?cX:rX} y2={fY+22} stroke={B.dim} strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={isLH?rX+t:cX} y1={fY+17} x2={isLH?rX+t:cX} y2={fY+27} stroke={B.dim} strokeWidth="1.5"/>
      <line x1={isLH?cX:rX} y1={fY+17} x2={isLH?cX:rX} y2={fY+27} stroke={B.dim} strokeWidth="1.5"/>
      <text x={isLH?(rX+t+cX)/2:(cX+rX)/2} y={fY+37} textAnchor="middle" fill={B.dim} fontSize="9" fontWeight="600">{frontMM}mm</text>
      <text x={isLH?(rX+cX)/2+5:(cX+rX)/2-5} y={(cY+fY)/2} textAnchor="middle" dominantBaseline="middle" fill="rgba(0,174,239,0.08)" fontSize="14" fontWeight="800">{isLH?"LH":"RH"}</text>
    </svg>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  SCREEN TYPE BUILDERS (with Custom Panel toggle)             ║
// ╚═══════════════════════════════════════════════════════════════╝

const FrontReturnBuilder = ({onBack,onAdd,customerType,initialData}) => {
  const [isLH,setIsLH]=useState(initialData?.isLH??true);
  const [hingeLHS,setHingeLHS]=useState(initialData?.hingeSide?initialData.hingeSide==="LHS":true);
  const [frontMM,setFrontMM]=useState(initialData?.frontMM??900);
  const [returnMM,setReturnMM]=useState(initialData?.returnMM??900);
  const [doorMM,setDoorMM]=useState(initialData?.doorMM??662);
  const [isSliding,setIsSliding]=useState(initialData?.isSliding??false);
  const [colour,setColour]=useState(initialData?.colour??"Chrome");
  const [waterstop,setWaterstop]=useState(initialData?.waterstop??60);
  const [isCustom,setIsCustom]=useState(initialData?.isCustom??false);
  const [measureDate,setMeasureDate]=useState(initialData?.measureDate??"");
  const slidingTooSmall=isSliding&&frontMM<1200;
  const price = isCustom ? null : calcPrice("frontReturn", {frontMM,returnMM,colour,isSliding,doorMM}, customerType);
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Front & Return"/>
      <CustomPanelToggle isCustom={isCustom} onToggle={()=>setIsCustom(!isCustom)} measureDate={measureDate} setMeasureDate={setMeasureDate}/>
      <DoorTypeToggle isSliding={isSliding} onToggle={()=>setIsSliding(!isSliding)}/>
      <Toggle options={["LH Return","RH Return"]} value={isLH?"LH Return":"RH Return"} onChange={v=>setIsLH(v==="LH Return")}/>
      <Card>
        <div style={{color:B.white,fontSize:12,fontWeight:700,marginBottom:12}}>Measurements from Internal Corner</div>
        <MeasurementInput label="Front Width" value={frontMM} min={800} max={1500} step={50} onChange={setFrontMM} error={slidingTooSmall}/>
        {slidingTooSmall&&<div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>⚠️</span><span style={{color:"#EF4444",fontSize:11,fontWeight:600}}>Sliding door requires minimum 1200mm front width</span></div>}
        <MeasurementInput label="Return Width" value={returnMM} min={100} max={1500} step={50} onChange={setReturnMM}/>
        {!isSliding&&<DoorToggle doorMM={doorMM} onToggle={()=>setDoorMM(doorMM===662?762:662)}/>}
        {isSliding&&!slidingTooSmall&&<div style={{background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.15)",borderRadius:8,padding:"8px 12px",marginTop:4,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12}}>🚪</span><span style={{color:B.midGrey,fontSize:10,lineHeight:1.4}}>Sliding door size selected by HSSS based on opening.</span></div>}
      </Card>
      <Card><ColourPicker value={colour} onChange={setColour}/><WaterstopPicker value={waterstop} onChange={setWaterstop}/></Card>
      {isCustom ? <PriceTBC/> : <PriceDisplay price={price}/>}
      <Card style={{border:`1px solid ${isSliding?"rgba(34,197,94,0.2)":"rgba(0,174,239,0.2)"}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:isSliding?`linear-gradient(135deg,${B.slideColor},#166534)`:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:11,fontWeight:700}}>{isLH?"LH":"RH"}</div>
          <div><div style={{color:B.white,fontSize:15,fontWeight:700}}>Front & Return — {isLH?"LH":"RH"}{isSliding?" — Sliding":""}{isCustom?" — CUSTOM":""}</div>
          <div style={{color:B.midGrey,fontSize:11,marginTop:2}}>{frontMM}mm × {returnMM}mm{isSliding?" · sliding":` · ${doorMM}mm door`}</div></div>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:12,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{width:"100%",maxWidth:340,margin:"0 auto"}}>
            {slidingTooSmall?<div style={{padding:"30px 20px",textAlign:"center",color:"#EF4444",fontSize:13,fontWeight:700}}>⚠️ Opening too small for sliding door</div>
              :isSliding?<FRSliding frontMM={frontMM} returnMM={returnMM} isLH={isLH}/>
              :isLH?<FrontReturnLH hingeSide={hingeLHS?"left":"right"} frontMM={frontMM} returnMM={returnMM} doorMM={doorMM}/>
              :<FrontReturnRH hingeSide={hingeLHS?"left":"right"} frontMM={frontMM} returnMM={returnMM} doorMM={doorMM}/>}
          </div>
          {!isSliding&&!slidingTooSmall&&<Toggle options={["Hinge LHS","Hinge RHS"]} value={hingeLHS?"Hinge LHS":"Hinge RHS"} onChange={v=>setHingeLHS(v==="Hinge LHS")} size="sm"/>}
        </div>
      </Card>
      <Btn onClick={()=>onAdd({type:"Front & Return",isLH,isSliding,frontMM,returnMM,doorMM:isSliding?null:doorMM,hingeSide:isSliding?null:(hingeLHS?"LHS":"RHS"),colour,waterstop,isCustom,measureDate:isCustom?measureDate:null,price:isCustom?null:price,summary:`F&R ${isLH?"LH":"RH"} ${frontMM}×${returnMM} ${isSliding?"Slide":`${doorMM}mm`} ${colour}${isCustom?" CUSTOM":""}`})} disabled={slidingTooSmall||(isCustom&&!measureDate)}>
        Add to Order
      </Btn>
    </PageWrap>
  );
};

const FrontOnlyBuilder = ({onBack,onAdd,customerType,initialData}) => {
  const [typeIdx,setTypeIdx]=useState(initialData?.subType==="Panel + Door + Panel"?1:0);
  const [isLH,setIsLH]=useState(initialData?.isLH??true);
  const [hingeLHS,setHingeLHS]=useState(initialData?.hingeSide?initialData.hingeSide==="LHS":true);
  const [w2wMM,setW2wMM]=useState(initialData?.w2wMM??1200);
  const [doorMM,setDoorMM]=useState(initialData?.doorMM??662);
  const [isSliding,setIsSliding]=useState(initialData?.isSliding??false);
  const [leftPanelMM,setLeftPanelMM]=useState(initialData?.leftPanelMM??200);
  const [rightPanelMM,setRightPanelMM]=useState(initialData?.rightPanelMM??200);
  const [colour,setColour]=useState(initialData?.colour??"Chrome");
  const [waterstop,setWaterstop]=useState(initialData?.waterstop??60);
  const [isCustom,setIsCustom]=useState(initialData?.isCustom??false);
  const [measureDate,setMeasureDate]=useState(initialData?.measureDate??"");
  const [approxOnly,setApproxOnly]=useState(initialData?.approxOnly??false);
  const [approxDate,setApproxDate]=useState(initialData?.approxDate??"");
  const isSupplyInstall = customerType === "Supply & Install";
  const slidingTooSmall=isSliding&&w2wMM<1200;
  const typeNames=["Panel + Door","Panel + Door + Panel"];
  const priceType = typeIdx===0 ? "panelDoor" : "panelDoorPanel";
  const price = isCustom ? null : calcPrice(priceType, {w2wMM,colour,isSliding,doorMM}, customerType);
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Front Only"/>
      <CustomPanelToggle isCustom={isCustom} onToggle={()=>setIsCustom(!isCustom)} measureDate={measureDate} setMeasureDate={setMeasureDate}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
        {typeNames.map((t,i)=>(
          <button key={i} onClick={()=>setTypeIdx(i)} style={{padding:"10px 6px",borderRadius:10,border:i===typeIdx?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.2)",background:i===typeIdx?"linear-gradient(135deg,rgba(0,174,239,0.2),rgba(10,77,138,0.3))":"rgba(0,27,61,0.6)",color:i===typeIdx?B.white:B.midGrey,fontSize:11,fontWeight:700,transition:"all 0.2s"}}>{t}</button>
        ))}
      </div>
      <DoorTypeToggle isSliding={isSliding} onToggle={()=>setIsSliding(!isSliding)}/>
      {typeIdx===0&&<Toggle options={["LH","RH"]} value={isLH?"LH":"RH"} onChange={v=>setIsLH(v==="LH")}/>}
      <Card>
        <div style={{color:B.white,fontSize:12,fontWeight:700,marginBottom:12}}>Measurements</div>
        <MeasurementInput label="Sheet to Sheet (wall to wall)" value={w2wMM} min={600} max={2500} step={1} onChange={setW2wMM} error={slidingTooSmall}/>
        {slidingTooSmall&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.4)",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>⚠️</span><span style={{color:"#EF4444",fontSize:11,fontWeight:600}}>Sliding doors require minimum 1200mm opening</span></div>}
        {!isSliding&&<DoorToggle doorMM={doorMM} onToggle={()=>setDoorMM(doorMM===662?762:662)}/>}
        {typeIdx===1&&<><div style={{borderTop:"1px solid rgba(0,174,239,0.1)",paddingTop:12,marginTop:4}}>
          <div style={{color:B.white,fontSize:11,fontWeight:700,marginBottom:10}}>Approximate Panel Sizes</div>
          <MeasurementInput label="Left Panel" value={leftPanelMM} min={100} max={1200} step={50} onChange={setLeftPanelMM}/>
          <MeasurementInput label="Right Panel" value={rightPanelMM} min={100} max={1200} step={50} onChange={setRightPanelMM}/>
        </div></>}
      </Card>
      {isSupplyInstall&&!isCustom&&<div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:approxOnly?"rgba(245,158,11,0.08)":"rgba(0,27,61,0.4)",border:`1.5px solid ${approxOnly?"rgba(245,158,11,0.3)":"rgba(0,174,239,0.15)"}`,borderRadius:10,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>{setApproxOnly(!approxOnly);if(approxOnly)setApproxDate("");}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>{approxOnly?"📏":"📐"}</span>
            <div><div style={{color:approxOnly?"#F59E0B":B.midGrey,fontSize:13,fontWeight:700}}>Approximate measurements only</div>
              <div style={{color:B.midGrey,fontSize:10,marginTop:1}}>Hob & channels sent now — glass after exact sizes confirmed</div></div>
          </div>
          <div style={{width:42,height:24,borderRadius:12,background:approxOnly?"#F59E0B":"rgba(90,125,158,0.3)",padding:2,transition:"all 0.25s"}}>
            <div style={{width:20,height:20,borderRadius:10,background:B.white,transform:approxOnly?"translateX(18px)":"translateX(0)",transition:"transform 0.25s"}}/>
          </div>
        </div>
        {approxOnly&&<div style={{marginTop:10,padding:"12px 14px",background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:10}}>
          <div style={{color:"#F59E0B",fontSize:11,fontWeight:700,marginBottom:6}}>When will exact measurements be available? <span style={{color:B.cyan}}>*</span></div>
          <input type="date" value={approxDate} onChange={e=>setApproxDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={{width:"100%",padding:"10px 12px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:8,color:B.white,fontSize:14,outline:"none",colorScheme:"dark"}}/>
        </div>}
      </div>}
      <Card><ColourPicker value={colour} onChange={setColour}/><WaterstopPicker value={waterstop} onChange={setWaterstop}/></Card>
      {isCustom ? <PriceTBC/> : <>
        <PriceDisplay price={price}/>
        {approxOnly&&<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:10,padding:"10px 14px",marginTop:-10,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>⚠️</span><span style={{color:"#F59E0B",fontSize:11,fontWeight:600}}>Price based on approximate measurements — may change</span>
        </div>}
      </>}
      <Card>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:12,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{width:"100%",maxWidth:340,margin:"0 auto"}}>
            {slidingTooSmall?<div style={{padding:"30px 20px",textAlign:"center",color:"#EF4444",fontSize:12}}>⚠️ Opening too small for sliding door</div>
            :typeIdx===0&&!isSliding?<PanelDoorHinged w2wMM={w2wMM} doorMM={doorMM} isLH={isLH} hingeSide={hingeLHS?"left":"right"}/>
            :typeIdx===0&&isSliding?<PanelDoorSliding w2wMM={w2wMM} isLH={isLH}/>
            :typeIdx===1&&!isSliding?<PanelDoorPanelHinged w2wMM={w2wMM} doorMM={doorMM} leftPanelMM={leftPanelMM} rightPanelMM={rightPanelMM} hingeSide={hingeLHS?"left":"right"}/>
            :<PanelDoorSliding w2wMM={w2wMM} isLH={isLH}/>}
          </div>
          {!isSliding&&!slidingTooSmall&&<Toggle options={["Hinge LHS","Hinge RHS"]} value={hingeLHS?"Hinge LHS":"Hinge RHS"} onChange={v=>setHingeLHS(v==="Hinge LHS")} size="sm"/>}
        </div>
      </Card>
      <Btn onClick={()=>onAdd({type:"Front Only",subType:typeNames[typeIdx],isLH:typeIdx===0?isLH:null,isSliding,w2wMM,doorMM:isSliding?null:doorMM,hingeSide:isSliding?null:(hingeLHS?"LHS":"RHS"),leftPanelMM:typeIdx===1?leftPanelMM:null,rightPanelMM:typeIdx===1?rightPanelMM:null,colour,waterstop,isCustom,measureDate:isCustom?measureDate:null,approxOnly:approxOnly&&isSupplyInstall,approxDate:approxOnly&&isSupplyInstall?approxDate:null,price:isCustom?null:price,summary:`FO ${typeNames[typeIdx]} ${w2wMM}mm ${isSliding?"Slide":`${doorMM}mm`} ${colour}${isCustom?" CUSTOM":""}${approxOnly&&isSupplyInstall?" APPROX":""}`})} disabled={slidingTooSmall||(isCustom&&!measureDate)||(approxOnly&&isSupplyInstall&&!approxDate)}>
        Add to Order
      </Btn>
    </PageWrap>
  );
};

const SplayedBuilder = ({onBack,onAdd,customerType,initialData}) => {
  const [sizeA,setSizeA]=useState(initialData?SPLAYED_SIZES.findIndex(s=>s.label===initialData.sizeA)||0:0);
  const [sizeB,setSizeB]=useState(initialData?SPLAYED_SIZES.findIndex(s=>s.label===initialData.sizeB)||0:0);
  const [hingeLHS,setHingeLHS]=useState(initialData?.hingeSide?initialData.hingeSide==="LHS":true);
  const [colour,setColour]=useState(initialData?.colour??"Chrome");
  const [waterstop,setWaterstop]=useState(initialData?.waterstop??60);
  const [isCustom,setIsCustom]=useState(initialData?.isCustom??false);
  const [measureDate,setMeasureDate]=useState(initialData?.measureDate??"");
  const a=SPLAYED_SIZES[sizeA]||SPLAYED_SIZES[0];
  const b=SPLAYED_SIZES[sizeB]||SPLAYED_SIZES[0];
  const price = isCustom ? null : calcPrice("splay", {wallA:a.internal,wallB:b.internal,colour,isSliding:false,doorMM:662}, customerType);
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Splayed (Truncated)"/>
      <CustomPanelToggle isCustom={isCustom} onToggle={()=>setIsCustom(!isCustom)} measureDate={measureDate} setMeasureDate={setMeasureDate}/>
      <Card>
        <div style={{color:B.white,fontSize:12,fontWeight:700,marginBottom:10}}>Internal Corner Measurements</div>
        <WallSelector label="Wall A ↓" sizeIdx={sizeA} onChange={setSizeA}/>
        <WallSelector label="Wall B ↔" sizeIdx={sizeB} onChange={setSizeB}/>
      </Card>
      <Card><ColourPicker value={colour} onChange={setColour}/><WaterstopPicker value={waterstop} onChange={setWaterstop}/></Card>
      {isCustom ? <PriceTBC/> : <PriceDisplay price={price}/>}
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:32,height:28,borderRadius:8,background:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:10,fontWeight:700}}>{a.label}×{b.label}</div>
          <div><div style={{color:B.white,fontSize:15,fontWeight:700}}>Splayed {a.label}×{b.label}{isCustom?" — CUSTOM":""}</div>
          <div style={{color:B.midGrey,fontSize:11,marginTop:2}}>{a.internal}mm × {b.internal}mm · Legs: {b.leg}mm / {a.leg}mm</div></div>
        </div>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:12,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{width:"100%",maxWidth:340,margin:"0 auto"}}>
            <SplayedOverhead hingeSide={hingeLHS?"left":"right"} sizeA={sizeA} sizeB={sizeB}/>
          </div>
          <Toggle options={["Hinge LHS","Hinge RHS"]} value={hingeLHS?"Hinge LHS":"Hinge RHS"} onChange={v=>setHingeLHS(v==="Hinge LHS")} size="sm"/>
        </div>
      </Card>
      <Btn onClick={()=>onAdd({type:"Splayed",sizeA:a.label,sizeB:b.label,wallA:a.internal,wallB:b.internal,legA:a.leg,legB:b.leg,hingeSide:hingeLHS?"LHS":"RHS",colour,waterstop,isCustom,measureDate:isCustom?measureDate:null,price:isCustom?null:price,summary:`Splayed ${a.label}×${b.label} ${colour}${isCustom?" CUSTOM":""}`})} disabled={isCustom&&!measureDate}>
        Add to Order
      </Btn>
    </PageWrap>
  );
};

const FixedPanelBuilder = ({onBack,onAdd,customerType,initialData}) => {
  const fpTypeNames=["Fixed LH","Fixed RH","Walkthrough","90° Return"];
  const [typeIdx,setTypeIdx]=useState(initialData?Math.max(0,fpTypeNames.indexOf(initialData.subType)):0);
  const [panelMM,setPanelMM]=useState(initialData?.panelMM??500);
  const [wallToWallMM,setWallToWallMM]=useState(initialData?.wallToWallMM??1200);
  const [returnMM,setReturnMM]=useState(initialData?.returnMM??900);
  const [frontMM,setFrontMM]=useState(initialData?.frontMM??900);
  const [isLH,setIsLH]=useState(initialData?.isLH??true);
  const [leftPanelMM,setLeftPanelMM]=useState(initialData?.leftPanelMM??400);
  const [rightPanelMM,setRightPanelMM]=useState(initialData?.rightPanelMM??400);
  const [colour,setColour]=useState(initialData?.colour??"Chrome");
  const [waterstop,setWaterstop]=useState(initialData?.waterstop??60);
  const [isCustom,setIsCustom]=useState(initialData?.isCustom??false);
  const [measureDate,setMeasureDate]=useState(initialData?.measureDate??"");
  const [isRadius,setIsRadius]=useState(initialData?.isRadius??false);
  const typeNames=["Fixed LH","Fixed RH","Walkthrough","90° Return"];
  const RADIUS_SIZES=[900,1000,1200];
  const radiusSizeOk = typeIdx<=1 ? RADIUS_SIZES.includes(panelMM)
    : typeIdx===2 ? RADIUS_SIZES.includes(leftPanelMM)&&RADIUS_SIZES.includes(rightPanelMM)
    : RADIUS_SIZES.includes(returnMM);
  const isCustomRadius = isRadius && !radiusSizeOk;
  let walkMM=0;
  if(typeIdx<=1)walkMM=wallToWallMM-panelMM;
  else if(typeIdx===2)walkMM=wallToWallMM-leftPanelMM-rightPanelMM;
  else walkMM=frontMM;
  const fpWidth = typeIdx<=1 ? panelMM : typeIdx===2 ? Math.max(leftPanelMM,rightPanelMM) : returnMM;
  const basePrice = (isCustom||isCustomRadius) ? null : calcPrice("fixedPanel", {panelMM:fpWidth,colour,isSliding:false,doorMM:662}, customerType);
  const price = basePrice && isRadius ? {...basePrice, exGst:basePrice.exGst+150, incGst:(basePrice.exGst+150)*1.10, radiusAdd:150} : basePrice;
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Fixed Panel"/>
      <CustomPanelToggle isCustom={isCustom} onToggle={()=>setIsCustom(!isCustom)} measureDate={measureDate} setMeasureDate={setMeasureDate}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
        {typeNames.map((t,i)=>(
          <button key={i} onClick={()=>setTypeIdx(i)} style={{padding:"10px 8px",borderRadius:10,border:i===typeIdx?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.2)",background:i===typeIdx?"linear-gradient(135deg,rgba(0,174,239,0.2),rgba(10,77,138,0.3))":"rgba(0,27,61,0.6)",color:i===typeIdx?B.white:B.midGrey,fontSize:11,fontWeight:700,transition:"all 0.2s"}}>{t}</button>
        ))}
      </div>
      <Card>
        <div style={{color:B.white,fontSize:12,fontWeight:700,marginBottom:12}}>Measurements</div>
        {(typeIdx===0||typeIdx===1)&&<>
          <MeasurementInput label="Fixed Panel Width" value={panelMM} min={100} max={1500} step={50} onChange={setPanelMM}/>
          <MeasurementInput label="Wall to Wall" value={wallToWallMM} min={400} max={2500} step={50} onChange={setWallToWallMM}/></>}
        {typeIdx===2&&<>
          <MeasurementInput label="Wall to Wall" value={wallToWallMM} min={400} max={2500} step={50} onChange={setWallToWallMM}/>
          <MeasurementInput label="Left Panel" value={leftPanelMM} min={100} max={1500} step={50} onChange={setLeftPanelMM}/>
          <MeasurementInput label="Right Panel" value={rightPanelMM} min={100} max={1500} step={50} onChange={setRightPanelMM}/></>}
        {typeIdx===3&&<>
          <Toggle options={["LH","RH"]} value={isLH?"LH":"RH"} onChange={v=>setIsLH(v==="LH")}/>
          <MeasurementInput label="Return Panel" value={returnMM} min={100} max={1500} step={50} onChange={setReturnMM}/>
          <MeasurementInput label="Front (wall to wall)" value={frontMM} min={400} max={2500} step={50} onChange={setFrontMM}/></>}
      </Card>
      {!isCustom&&<div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:isRadius?"rgba(0,174,239,0.08)":"rgba(0,27,61,0.4)",border:`1.5px solid ${isRadius?"rgba(0,174,239,0.3)":"rgba(0,174,239,0.15)"}`,borderRadius:10,cursor:"pointer",transition:"all 0.2s"}} onClick={()=>setIsRadius(!isRadius)}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16}}>◐</span>
            <div><div style={{color:isRadius?B.cyan:B.midGrey,fontSize:13,fontWeight:700}}>Upgrade to Radius Corner Panel</div>
              <div style={{color:B.midGrey,fontSize:10,marginTop:1}}>200mm × 200mm bullnose radius</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {isRadius&&radiusSizeOk&&<span style={{background:"rgba(0,174,239,0.15)",border:"1px solid rgba(0,174,239,0.3)",borderRadius:6,padding:"3px 8px",color:B.cyan,fontSize:11,fontWeight:700}}>+$150</span>}
            <div style={{width:42,height:24,borderRadius:12,background:isRadius?B.cyan:"rgba(90,125,158,0.3)",padding:2,transition:"all 0.25s"}}>
              <div style={{width:20,height:20,borderRadius:10,background:B.white,transform:isRadius?"translateX(18px)":"translateX(0)",transition:"transform 0.25s"}}/>
            </div>
          </div>
        </div>
        {isRadius&&!radiusSizeOk&&<div style={{marginTop:10,padding:"12px 14px",background:"rgba(245,158,11,0.08)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:10,display:"flex",alignItems:"flex-start",gap:10}}>
          <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
          <div><div style={{color:"#F59E0B",fontSize:12,fontWeight:700,marginBottom:3}}>Non-standard radius panel</div>
            <div style={{color:"#D4A050",fontSize:11,lineHeight:1.4}}>Radius panels are available in 900, 1000 & 1200mm only. This will be a custom order — price and lead times to be confirmed by HSSS.</div></div>
        </div>}
      </div>}
      <Card><ColourPicker value={colour} onChange={setColour}/><WaterstopPicker value={waterstop} onChange={setWaterstop}/></Card>
      {(isCustom||isCustomRadius) ? <PriceTBC/> : <PriceDisplay price={price}/>}
      {walkMM>0&&walkMM<600&&<div style={{background:"rgba(245,158,11,0.12)",border:"2px solid rgba(245,158,11,0.5)",borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"flex-start",gap:10}}>
        <span style={{fontSize:20,flexShrink:0,lineHeight:1}}>⚠️</span>
        <div><div style={{color:"#F59E0B",fontSize:13,fontWeight:700,marginBottom:3}}>Tight Walkthrough — {walkMM}mm</div>
        <div style={{color:"#D4A050",fontSize:11,lineHeight:1.4}}>Openings under 600mm may not be fit for purpose.</div></div>
      </div>}
      <Card>
        <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:12,border:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{width:"100%",maxWidth:340,margin:"0 auto"}}>
            {typeIdx===0&&<FixedLH panelMM={panelMM} wallToWallMM={wallToWallMM}/>}
            {typeIdx===1&&<FixedRH panelMM={panelMM} wallToWallMM={wallToWallMM}/>}
            {typeIdx===2&&<FixedWalkthrough wallToWallMM={wallToWallMM} leftPanelMM={leftPanelMM} rightPanelMM={rightPanelMM}/>}
            {typeIdx===3&&<Fixed90Return returnMM={returnMM} frontMM={frontMM} isLH={isLH}/>}
          </div>
        </div>
      </Card>
      <Btn onClick={()=>onAdd({type:"Fixed Panel",subType:typeNames[typeIdx],isLH:typeIdx===3?isLH:typeIdx===0?true:typeIdx===1?false:null,panelMM:typeIdx<=1?panelMM:null,wallToWallMM:typeIdx<=2?wallToWallMM:null,returnMM:typeIdx===3?returnMM:null,frontMM:typeIdx===3?frontMM:null,leftPanelMM:typeIdx===2?leftPanelMM:null,rightPanelMM:typeIdx===2?rightPanelMM:null,colour,waterstop,isCustom:isCustom||isCustomRadius,isRadius,measureDate:isCustom?measureDate:null,price:(isCustom||isCustomRadius)?null:price,summary:`Fixed ${typeNames[typeIdx]} ${colour}${isRadius?" RADIUS":""}${(isCustom||isCustomRadius)?" CUSTOM":""}`})} disabled={isCustom&&!measureDate}>
        Add to Order
      </Btn>
    </PageWrap>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  AUTH SCREENS                                                ║
// ╚═══════════════════════════════════════════════════════════════╝

const SplashScreen = ({onDone}) => {
  const [show,setShow]=useState(true);
  useEffect(()=>{setTimeout(()=>setShow(false),2500);setTimeout(onDone,3000);},[]);
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#000D1A,#001B3D)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"opacity 0.5s",opacity:show?1:0}}>
      <GlobalStyles/>
      <div style={{animation:"pulse 2s ease-in-out infinite"}}><HsssLogo size={200}/></div>
      <div style={{marginTop:24,color:B.cyan,fontSize:11,fontWeight:600,letterSpacing:3,textTransform:"uppercase",opacity:0.7}}>Builder Ordering System</div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:0.9}}`}</style>
    </div>
  );
};

const LoginScreen = ({onLogin,onRegister}) => {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  return(
    <PageWrap padTop="40px">
      <div style={{display:"flex",justifyContent:"center",marginBottom:32}}><HsssLogo size={160}/></div>
      <Card>
        <div style={{color:B.white,fontSize:18,fontWeight:700,marginBottom:16,textAlign:"center"}}>Builder Login</div>
        <Input label="Email" value={email} onChange={setEmail} placeholder="you@company.com" type="email" required/>
        <Input label="Password" value={pass} onChange={setPass} placeholder="••••••••" type="password" required/>
        <div style={{marginTop:8}}><Btn onClick={onLogin}>Sign In</Btn></div>
      </Card>
      <div style={{textAlign:"center",marginTop:20}}>
        <span style={{color:B.midGrey,fontSize:13}}>New builder? </span>
        <button onClick={onRegister} style={{background:"none",color:B.cyan,fontSize:13,fontWeight:700,textDecoration:"underline",cursor:"pointer"}}>Register Here</button>
      </div>
    </PageWrap>
  );
};

const RegisterScreen = ({onBack,onSubmit}) => {
  const [step,setStep]=useState(1);
  const [company,setCompany]=useState("");
  const [abn,setAbn]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [mobile,setMobile]=useState("");
  const [customerType,setCustomerType]=useState("Supply Only");
  const [region,setRegion]=useState(REGIONS[0]);
  const [address,setAddress]=useState("");
  const [suburb,setSuburb]=useState("");
  const [state,setState2]=useState("QLD");
  const [pass,setPass]=useState("");
  return(
    <PageWrap>
      <NavBar onBack={step===1?onBack:()=>setStep(step-1)} title="Register"/>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {[1,2,3].map(s=>(
          <div key={s} style={{flex:1,height:4,borderRadius:2,background:s<=step?B.cyan:"rgba(0,174,239,0.15)",transition:"background 0.3s"}}/>
        ))}
      </div>
      {step===1&&<Card>
        <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Company Details</div>
        <Input label="Company Name" value={company} onChange={setCompany} required placeholder="e.g. Smith Bathrooms"/>
        <Input label="ABN" value={abn} onChange={setAbn} optional placeholder="Optional"/>
        <Input label="Contact Name" value={name} onChange={setName} required placeholder="Your full name"/>
        <Input label="Email" value={email} onChange={setEmail} required placeholder="you@company.com" type="email"/>
        <Input label="Mobile" value={mobile} onChange={setMobile} required placeholder="0400 000 000" type="tel"/>
        <Btn onClick={()=>setStep(2)}>Next →</Btn>
      </Card>}
      {step===2&&<Card>
        <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Service & Address</div>
        <div style={{marginBottom:14}}>
          <div style={{color:B.midGrey,fontSize:12,fontWeight:600,marginBottom:8}}>Customer Type <span style={{color:B.cyan}}>*</span></div>
          <Toggle options={["Supply Only","Supply & Install"]} value={customerType} onChange={setCustomerType}/>
        </div>
        {customerType==="Supply & Install"&&<div style={{marginBottom:14}}>
          <div style={{color:B.midGrey,fontSize:12,fontWeight:600,marginBottom:8}}>Install Region</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {REGIONS.map(r=>(
              <button key={r} onClick={()=>setRegion(r)} style={{padding:"10px 8px",borderRadius:8,border:region===r?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.15)",background:region===r?"rgba(0,174,239,0.1)":"rgba(0,27,61,0.4)",color:region===r?B.white:B.midGrey,fontSize:12,fontWeight:600,transition:"all 0.2s"}}>{r}</button>
            ))}
          </div>
        </div>}
        <Input label="Street Address" value={address} onChange={setAddress} required placeholder="123 Main St"/>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
          <Input label="Suburb" value={suburb} onChange={setSuburb} required placeholder="Suburb"/>
          <Input label="State" value={state} onChange={setState2} required placeholder="QLD"/>
        </div>
        <Btn onClick={()=>setStep(3)}>Next →</Btn>
      </Card>}
      {step===3&&<Card>
        <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Set Password</div>
        <Input label="Password" value={pass} onChange={setPass} type="password" required placeholder="Min 8 characters"/>
        <div style={{marginTop:12}}><Btn onClick={onSubmit}>Submit Registration</Btn></div>
      </Card>}
    </PageWrap>
  );
};

const PendingScreen = ({onBack}) => (
  <PageWrap padTop="60px">
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16}}>⏳</div>
      <h2 style={{color:B.white,fontSize:22,fontWeight:800,marginBottom:8}}>Registration Submitted</h2>
      <p style={{color:B.midGrey,fontSize:14,lineHeight:1.5,marginBottom:24}}>Your account is pending approval from HSSS. We'll email you once approved — usually within 1 business day.</p>
      <Btn onClick={onBack} variant="outline">Back to Login</Btn>
    </div>
  </PageWrap>
);


// ╔═══════════════════════════════════════════════════════════════╗
// ║  DASHBOARD                                                   ║
// ╚═══════════════════════════════════════════════════════════════╝

const Dashboard = ({onNavigate}) => {
  const actions = [
    {icon:"⚡",title:"Quick Quote",desc:"Get a fast price estimate",action:"quickQuote"},
    {icon:"📦",title:"New Order",desc:"Place a standard order",action:"newOrder"},
    {icon:"📐",title:"Custom Order",desc:"Request a site measure",action:"customOrder"},
    {icon:"📋",title:"My Quotes",desc:"View saved & submitted quotes",action:"myQuotes"},
    {icon:"🚚",title:"Order History",desc:"Track orders & deliveries",action:"orders"},
    {icon:"📞",title:"Contact HSSS",desc:"Support & enquiries",action:"contact"},
  ];
  return(
    <PageWrap>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div><div style={{color:B.midGrey,fontSize:12,fontWeight:600}}>Welcome back</div>
        <div style={{color:B.white,fontSize:20,fontWeight:800}}>Builder Dashboard</div></div>
        <HsssLogo size={70}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {actions.map((a,i)=>(
          <button key={i} onClick={()=>onNavigate(a.action)} style={{background:"rgba(0,27,61,0.6)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:14,padding:16,textAlign:"left",transition:"all 0.2s",cursor:"pointer"}}>
            <div style={{fontSize:28,marginBottom:8}}>{a.icon}</div>
            <div style={{color:B.white,fontSize:14,fontWeight:700,marginBottom:4}}>{a.title}</div>
            <div style={{color:B.midGrey,fontSize:11}}>{a.desc}</div>
          </button>
        ))}
      </div>
    </PageWrap>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  CONTACT HSSS                                                ║
// ╚═══════════════════════════════════════════════════════════════╝

const ContactScreen = ({onBack}) => (
  <PageWrap>
    <NavBar onBack={onBack} title="Contact HSSS"/>
    <div style={{color:B.midGrey,fontSize:12,marginBottom:20,textAlign:"center"}}>Get in touch with the HSSS team</div>
    {HSSS_CONTACTS.map((c,i)=>(
      <Card key={i}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:18,fontWeight:800,flexShrink:0}}>{c.name[0]}</div>
          <div><div style={{color:B.white,fontSize:16,fontWeight:700}}>{c.name}</div>
            <div style={{color:B.midGrey,fontSize:11,marginTop:2}}>{c.role}</div></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <a href={`tel:${c.phone.replace(/\s/g,"")}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(0,174,239,0.08)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.cyan,fontSize:13,fontWeight:600,textDecoration:"none",cursor:"pointer"}}>
            <span style={{fontSize:16}}>📱</span>{c.phone}
          </a>
          <a href={`mailto:${c.email}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(0,174,239,0.08)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.cyan,fontSize:13,fontWeight:600,textDecoration:"none",cursor:"pointer"}}>
            <span style={{fontSize:16}}>✉️</span>{c.email}
          </a>
        </div>
      </Card>
    ))}
  </PageWrap>
);


// ╔═══════════════════════════════════════════════════════════════╗
// ║  CUSTOM ORDER (standalone flow)                              ║
// ╚═══════════════════════════════════════════════════════════════╝

const CustomOrderScreen = ({onBack}) => {
  const [address,setAddress]=useState("");
  const [suburb,setSuburb]=useState("");
  const [state,setState2]=useState("QLD");
  const [details,setDetails]=useState("");
  const [measureDate,setMeasureDate]=useState("");
  const [contactName,setContactName]=useState("");
  const [contactPhone,setContactPhone]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [sending,setSending]=useState(false);
  const [emailError,setEmailError]=useState(null);
  
  const handleSubmit = async () => {
    setSending(true);
    setEmailError(null);
    const result = await sendCustomOrderEmail({address,suburb,state,details,measureDate,contactName,contactPhone});
    setSending(false);
    if (!result.success) setEmailError("Order saved but email failed to send. Please contact HSSS directly.");
    setSubmitted(true);
  };
  if(submitted) return (
    <PageWrap padTop="60px">
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:16}}>📐</div>
        <h2 style={{color:B.white,fontSize:22,fontWeight:800,marginBottom:8}}>Custom Order Submitted</h2>
        <p style={{color:B.midGrey,fontSize:14,lineHeight:1.5,marginBottom:8}}>HSSS will contact you to confirm the measure date.</p>
        <p style={{color:B.midGrey,fontSize:12,lineHeight:1.5,marginBottom:8}}>Preferred date: <span style={{color:B.white,fontWeight:700}}>{measureDate}</span></p>
        {emailError&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:16}}><span style={{color:"#EF4444",fontSize:12}}>{emailError}</span></div>}
        <div style={{color:"rgba(90,125,158,0.6)",fontSize:10,marginBottom:20}}>Sent to: {ORDER_EMAIL}</div>
        <Btn onClick={onBack}>Back to Dashboard</Btn>
      </div>
    </PageWrap>
  );
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Custom Order"/>
      <div style={{background:B.customBg,border:`1.5px solid ${B.customBorder}`,borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:20}}>📐</span>
        <div><div style={{color:B.custom,fontSize:13,fontWeight:700}}>Non-Standard Screens</div>
          <div style={{color:B.midGrey,fontSize:11,marginTop:1}}>For anything that doesn't fit stock sizes. Submit the job details and we'll arrange a site measure.</div></div>
      </div>
      <Card>
        <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Job Address</div>
        <Input label="Street Address" value={address} onChange={setAddress} required placeholder="123 Builder St"/>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
          <Input label="Suburb" value={suburb} onChange={setSuburb} required placeholder="Suburb"/>
          <Input label="State" value={state} onChange={setState2} required placeholder="QLD"/>
        </div>
      </Card>
      <Card>
        <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>What Do You Need?</div>
        <div style={{marginBottom:14}}>
          <div style={{color:B.midGrey,fontSize:12,fontWeight:600,marginBottom:5}}>Description <span style={{color:B.cyan}}>*</span></div>
          <textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Describe the screens you need, any unusual angles, sizes, or requirements..." rows={4}
            style={{width:"100%",padding:"12px 14px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.white,fontSize:14,outline:"none",resize:"vertical",lineHeight:1.5,boxSizing:"border-box"}}/>
        </div>
      </Card>
      <Card>
        <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Site Contact</div>
        <Input label="Name" value={contactName} onChange={setContactName} placeholder="Who will be on site?" optional/>
        <Input label="Phone" value={contactPhone} onChange={setContactPhone} placeholder="0400 000 000" type="tel" optional/>
      </Card>
      <Card>
        <div style={{color:B.custom,fontSize:13,fontWeight:700,marginBottom:8}}>Preferred Measure Date <span style={{color:B.cyan}}>*</span></div>
        <input type="date" value={measureDate} onChange={e=>setMeasureDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          style={{width:"100%",padding:"12px 14px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(168,85,247,0.3)",borderRadius:10,color:B.white,fontSize:15,outline:"none",colorScheme:"dark"}}/>
        <div style={{color:B.midGrey,fontSize:10,marginTop:6}}>HSSS will confirm the date with you — this is a preferred date only.</div>
      </Card>
      <Btn onClick={handleSubmit} disabled={!address||!suburb||!details||!measureDate||sending}>{sending?"Submitting...":"Submit Custom Order"}</Btn>
    </PageWrap>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  QUICK QUOTE                                                 ║
// ╚═══════════════════════════════════════════════════════════════╝

const QuickQuote = ({onBack,customerType}) => {
  const [screenType,setScreenType]=useState(null);
  const [frontMM,setFrontMM]=useState(900);
  const [returnMM,setReturnMM]=useState(900);
  const [w2wMM,setW2wMM]=useState(1200);
  const [panelMM,setPanelMM]=useState(500);
  const [splayA,setSplayA]=useState(0);
  const [splayB,setSplayB]=useState(0);
  const [doorMM,setDoorMM]=useState(662);
  const [isSliding,setIsSliding]=useState(false);
  const [colour,setColour]=useState("Chrome");
  const [foType,setFoType]=useState(0);

  const types = [
    {key:"frontReturn",label:"Front & Return"},
    {key:"frontOnly",label:"Front Only"},
    {key:"splayed",label:"Splayed"},
    {key:"fixedPanel",label:"Fixed Panel"},
  ];

  let price = null;
  if (screenType === "frontReturn") {
    price = calcPrice("frontReturn", {frontMM,returnMM,colour,isSliding,doorMM}, customerType);
  } else if (screenType === "frontOnly") {
    const pt = foType===0?"panelDoor":"panelDoorPanel";
    price = calcPrice(pt, {w2wMM,colour,isSliding,doorMM}, customerType);
  } else if (screenType === "splayed") {
    const a=SPLAYED_SIZES[splayA]||SPLAYED_SIZES[0],b=SPLAYED_SIZES[splayB]||SPLAYED_SIZES[0];
    price = calcPrice("splay", {wallA:a.internal,wallB:b.internal,colour,isSliding:false,doorMM:662}, customerType);
  } else if (screenType === "fixedPanel") {
    price = calcPrice("fixedPanel", {panelMM,colour,isSliding:false,doorMM:662}, customerType);
  }

  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Quick Quote"/>
      <div style={{color:B.midGrey,fontSize:12,marginBottom:16,textAlign:"center"}}>Get a fast price estimate — no job required</div>
      <Card>
        <div style={{color:B.white,fontSize:12,fontWeight:700,marginBottom:10}}>Screen Type</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {types.map(t=>(
            <button key={t.key} onClick={()=>{setScreenType(t.key);setIsSliding(false);setDoorMM(662);}} style={{padding:"12px 8px",borderRadius:10,border:screenType===t.key?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.2)",background:screenType===t.key?"rgba(0,174,239,0.15)":"rgba(0,27,61,0.4)",color:screenType===t.key?B.white:B.midGrey,fontSize:12,fontWeight:700,transition:"all 0.2s"}}>{t.label}</button>
          ))}
        </div>
      </Card>
      {screenType&&<Card>
        <ColourPicker value={colour} onChange={setColour}/>
        {screenType==="frontReturn"&&<>
          <MeasurementInput label="Front Width" value={frontMM} min={800} max={1500} step={50} onChange={setFrontMM}/>
          <MeasurementInput label="Return Width" value={returnMM} min={100} max={1500} step={50} onChange={setReturnMM}/>
          <DoorTypeToggle isSliding={isSliding} onToggle={()=>setIsSliding(!isSliding)}/>
          {!isSliding&&<DoorToggle doorMM={doorMM} onToggle={()=>setDoorMM(doorMM===662?762:662)}/>}
        </>}
        {screenType==="frontOnly"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
            {["Panel + Door","Panel + Door + Panel"].map((t,i)=>(
              <button key={i} onClick={()=>setFoType(i)} style={{padding:"8px",borderRadius:8,border:i===foType?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.2)",background:i===foType?"rgba(0,174,239,0.15)":"rgba(0,27,61,0.4)",color:i===foType?B.white:B.midGrey,fontSize:11,fontWeight:700}}>{t}</button>
            ))}
          </div>
          <MeasurementInput label="Wall to Wall" value={w2wMM} min={600} max={2500} step={1} onChange={setW2wMM}/>
          <DoorTypeToggle isSliding={isSliding} onToggle={()=>setIsSliding(!isSliding)}/>
          {!isSliding&&<DoorToggle doorMM={doorMM} onToggle={()=>setDoorMM(doorMM===662?762:662)}/>}
        </>}
        {screenType==="splayed"&&<>
          <WallSelector label="Wall A ↓" sizeIdx={splayA} onChange={setSplayA}/>
          <WallSelector label="Wall B ↔" sizeIdx={splayB} onChange={setSplayB}/>
        </>}
        {screenType==="fixedPanel"&&<>
          <MeasurementInput label="Panel Width" value={panelMM} min={100} max={1500} step={50} onChange={setPanelMM}/>
        </>}
      </Card>}
      {price&&<PriceDisplay price={price}/>}
    </PageWrap>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  QUOTE SYSTEM                                                ║
// ╚═══════════════════════════════════════════════════════════════╝

const SiteContactPicker = ({siteContact,setSiteContact,savedContacts,onSaveContact}) => {
  const [showNew,setShowNew]=useState(false);
  return(
    <div style={{marginBottom:14}}>
      <div style={{color:B.white,fontSize:13,fontWeight:700,marginBottom:8}}>Site Contact</div>
      <div style={{color:B.midGrey,fontSize:11,marginBottom:10}}>Who should be contacted on site? (if different from you)</div>
      {savedContacts.length>0&&!showNew&&<div style={{marginBottom:10}}>
        <div style={{color:B.midGrey,fontSize:11,fontWeight:600,marginBottom:6}}>Saved Contacts</div>
        {savedContacts.map((c,i)=>(
          <button key={i} onClick={()=>setSiteContact({name:c.name,phone:c.phone})} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 12px",marginBottom:4,borderRadius:8,border:siteContact.name===c.name&&siteContact.phone===c.phone?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.15)",background:siteContact.name===c.name&&siteContact.phone===c.phone?"rgba(0,174,239,0.1)":"rgba(0,27,61,0.4)",cursor:"pointer"}}>
            <span style={{color:B.white,fontSize:13,fontWeight:600}}>{c.name}</span>
            <span style={{color:B.midGrey,fontSize:11,marginLeft:8}}>{c.phone}</span>
          </button>
        ))}
      </div>}
      {!showNew&&<button onClick={()=>setShowNew(true)} style={{background:"rgba(0,174,239,0.08)",border:"1px dashed rgba(0,174,239,0.3)",borderRadius:8,padding:"10px 14px",color:B.cyan,fontSize:12,fontWeight:600,width:"100%",cursor:"pointer",marginBottom:8}}>+ Add New Site Contact</button>}
      {showNew&&<div style={{background:"rgba(0,27,61,0.4)",border:"1px solid rgba(0,174,239,0.15)",borderRadius:10,padding:12}}>
        <Input label="Contact Name" value={siteContact.name} onChange={v=>setSiteContact({...siteContact,name:v})} placeholder="Site contact name"/>
        <Input label="Phone" value={siteContact.phone} onChange={v=>setSiteContact({...siteContact,phone:v})} placeholder="0400 000 000" type="tel"/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{if(siteContact.name&&siteContact.phone)onSaveContact({name:siteContact.name,phone:siteContact.phone});}} style={{flex:1,padding:"8px",borderRadius:8,background:"rgba(16,185,129,0.15)",border:"1px solid rgba(16,185,129,0.3)",color:B.price,fontSize:11,fontWeight:700,cursor:"pointer"}}>Save to Profile</button>
          <button onClick={()=>setShowNew(false)} style={{padding:"8px 12px",borderRadius:8,background:"rgba(0,27,61,0.6)",border:"1px solid rgba(0,174,239,0.15)",color:B.midGrey,fontSize:11,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>}
    </div>
  );
};

const QuoteSetup = ({onBack,onNext,quoteData,setQuoteData,savedContacts,onSaveContact,customerType}) => {
  const minDate = new Date().toISOString().split("T")[0];
  const isSupplyInstall = customerType === "Supply & Install";
  const datesValid = isSupplyInstall ? (quoteData.hobDate && quoteData.glassDate) : !!quoteData.deliveryDate;
  return(
  <PageWrap>
    <NavBar onBack={onBack} title="New Order"/>
    <Card>
      <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Order Details</div>
      <Input label="Job Reference" value={quoteData.jobRef} onChange={v=>setQuoteData({...quoteData,jobRef:v})} required placeholder="e.g. JOB-2024-001"/>
      <Input label="Delivery Address" value={quoteData.deliveryAddress} onChange={v=>setQuoteData({...quoteData,deliveryAddress:v})} required placeholder="123 Builder St"/>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
        <Input label="Suburb" value={quoteData.deliverySuburb} onChange={v=>setQuoteData({...quoteData,deliverySuburb:v})} required placeholder="Suburb"/>
        <Input label="State" value={quoteData.deliveryState} onChange={v=>setQuoteData({...quoteData,deliveryState:v})} required placeholder="QLD"/>
      </div>
      <Input label="Notes / Special Requirements" value={quoteData.notes} onChange={v=>setQuoteData({...quoteData,notes:v})} optional placeholder="e.g. Lockbox code, access details, gate codes, delivery instructions..."/>
    </Card>
    <Card>
      <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:4}}>Delivery Dates</div>
      <div style={{color:B.midGrey,fontSize:11,marginBottom:14,lineHeight:1.5}}>
        {isSupplyInstall
          ? "We deliver hob & wall channels first, then the glass for install."
          : "We'll pack and ship everything together in one delivery."}
      </div>
      {isSupplyInstall ? <>
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{color:B.midGrey,fontSize:12,fontWeight:600}}>Hob & Channel Delivery — Required By <span style={{color:B.cyan}}>*</span></span>
          </div>
          <input type="date" value={quoteData.hobDate} onChange={e=>setQuoteData({...quoteData,hobDate:e.target.value})}
            min={minDate}
            style={{width:"100%",padding:"12px 14px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.white,fontSize:15,outline:"none",colorScheme:"dark",boxSizing:"border-box"}}/>
          <div style={{color:B.midGrey,fontSize:10,marginTop:4}}>HSSS will deliver on or before this date</div>
        </div>
        <div style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{color:B.midGrey,fontSize:12,fontWeight:600}}>Approx Glass Install Date <span style={{color:B.cyan}}>*</span></span>
          </div>
          <input type="date" value={quoteData.glassDate} onChange={e=>setQuoteData({...quoteData,glassDate:e.target.value})}
            min={quoteData.hobDate||minDate}
            style={{width:"100%",padding:"12px 14px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.white,fontSize:15,outline:"none",colorScheme:"dark",boxSizing:"border-box"}}/>
          <div style={{color:B.midGrey,fontSize:10,marginTop:4}}>Approximate date — HSSS will confirm</div>
        </div>
      </> : <>
        <div style={{marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{color:B.midGrey,fontSize:12,fontWeight:600}}>Delivery Date — Required By <span style={{color:B.cyan}}>*</span></span>
          </div>
          <input type="date" value={quoteData.deliveryDate} onChange={e=>setQuoteData({...quoteData,deliveryDate:e.target.value})}
            min={minDate}
            style={{width:"100%",padding:"12px 14px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(0,174,239,0.2)",borderRadius:10,color:B.white,fontSize:15,outline:"none",colorScheme:"dark",boxSizing:"border-box"}}/>
          <div style={{color:B.midGrey,fontSize:10,marginTop:4}}>Hob, channels & glass shipped together. HSSS delivers on or before this date.</div>
        </div>
      </>}
    </Card>
    <Card>
      <SiteContactPicker siteContact={quoteData.siteContact||{name:"",phone:""}} setSiteContact={v=>setQuoteData({...quoteData,siteContact:v})} savedContacts={savedContacts} onSaveContact={onSaveContact}/>
    </Card>
    <Btn onClick={onNext} disabled={!quoteData.jobRef||!quoteData.deliveryAddress||!datesValid}>Continue — Add Screens →</Btn>
  </PageWrap>
  );
};

const ScreenTypeSelector = ({onSelect,onBack,screenCount}) => {
  const types = [
    {title:"Front & Return",desc:"L-shape with return panel",key:"frontReturn"},
    {title:"Front Only",desc:"Straight run between walls",key:"frontOnly"},
    {title:"Splayed",desc:"Corner screen (truncated)",key:"splayed"},
    {title:"Fixed Panel",desc:"No door — walkthrough opening",key:"fixed"},
  ];
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Add Screen"/>
      {screenCount>0&&<div style={{background:"rgba(0,174,239,0.08)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:B.cyan,fontSize:13,fontWeight:700}}>{screenCount} screen{screenCount>1?"s":""} in quote</span>
        <button onClick={onBack} style={{background:"rgba(0,174,239,0.15)",border:"1px solid rgba(0,174,239,0.3)",borderRadius:8,padding:"6px 12px",color:B.white,fontSize:12,fontWeight:600,cursor:"pointer"}}>Review Quote →</button>
      </div>}
      <div style={{color:B.white,fontSize:16,fontWeight:700,marginBottom:14}}>Select Screen Type</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {types.map(t=>(
          <button key={t.key} onClick={()=>onSelect(t.key)} style={{display:"flex",alignItems:"center",gap:14,padding:16,background:"rgba(0,27,61,0.6)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:14,textAlign:"left",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{flex:1}}>
              <div style={{color:B.white,fontSize:15,fontWeight:700}}>{t.title}</div>
              <div style={{color:B.midGrey,fontSize:11,marginTop:2}}>{t.desc}</div>
            </div>
            <div style={{color:B.cyan,fontSize:18,flexShrink:0}}>›</div>
          </button>
        ))}
      </div>
    </PageWrap>
  );
};

const LocationLabels = ({screens,labels,setLabels,onSubmit,onBack}) => (
  <PageWrap>
    <NavBar onBack={onBack} title="Screen Locations"/>
    <Card>
      <div style={{color:B.white,fontSize:15,fontWeight:700,marginBottom:6}}>Label Each Screen</div>
      <div style={{color:B.midGrey,fontSize:12,marginBottom:16,lineHeight:1.5}}>You have {screens.length} screens in this order. Label each with a location so we know where it goes.</div>
      {screens.map((s,i)=>(
        <div key={i} style={{marginBottom:14}}>
          <div style={{color:B.white,fontSize:12,fontWeight:700,marginBottom:6}}>Screen {i+1}: {s.type}{s.isCustom?" (Custom)":""}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
            {LOCATION_OPTIONS.map(loc=>(
              <button key={loc} onClick={()=>{const nl=[...labels];nl[i]=loc==="Other"?"":loc;setLabels(nl);}} style={{padding:"7px 12px",borderRadius:8,border:labels[i]===loc?`2px solid ${B.cyan}`:"1px solid rgba(0,174,239,0.15)",background:labels[i]===loc?"rgba(0,174,239,0.1)":"rgba(0,27,61,0.4)",color:labels[i]===loc?B.white:B.midGrey,fontSize:11,fontWeight:600,cursor:"pointer"}}>{loc}</button>
            ))}
          </div>
          {(labels[i]===""||(!LOCATION_OPTIONS.includes(labels[i])&&labels[i]!==undefined&&labels[i]!==null))&&(
            <input value={labels[i]||""} onChange={e=>{const nl=[...labels];nl[i]=e.target.value;setLabels(nl);}} placeholder="e.g. Upstairs Bathroom" style={{width:"100%",padding:"10px 12px",background:"rgba(0,27,61,0.8)",border:"1.5px solid rgba(0,174,239,0.2)",borderRadius:8,color:B.white,fontSize:13,outline:"none"}}/>
          )}
        </div>
      ))}
    </Card>
    <Btn onClick={onSubmit} disabled={labels.some(l=>!l||l.trim()==="")}>Submit Order →</Btn>
  </PageWrap>
);

const QuoteSummary = ({screens,quoteData,onAddMore,onBack,onSubmit,customerType,onEdit,onRemove}) => {
  const [confirmRemove, setConfirmRemove] = useState(null);
  const pricedScreens = screens.filter(s=>s.price);
  const customScreens = screens.filter(s=>s.isCustom);
  const total = pricedScreens.reduce((sum,s)=>sum+(s.price?.exGst||0),0);
  const totalInc = total * 1.10;
  const isSupplyInstall = customerType === "Supply & Install";
  return(
    <PageWrap>
      <NavBar onBack={onBack} title="Order Summary"/>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{color:B.white,fontSize:14,fontWeight:700}}>Job: {quoteData.jobRef}</div>
          <span style={{background:"rgba(0,174,239,0.15)",border:"1px solid rgba(0,174,239,0.3)",borderRadius:6,padding:"3px 8px",color:B.cyan,fontSize:11,fontWeight:700}}>{screens.length} screen{screens.length>1?"s":""}</span>
        </div>
        <div style={{color:B.midGrey,fontSize:11,lineHeight:1.5}}>
          📍 {quoteData.deliveryAddress}, {quoteData.deliverySuburb} {quoteData.deliveryState}
        </div>
        {quoteData.siteContact?.name&&<div style={{color:B.midGrey,fontSize:11,marginTop:4}}>👷 Site: {quoteData.siteContact.name} — {quoteData.siteContact.phone}</div>}
        {quoteData.notes&&<div style={{color:B.midGrey,fontSize:11,marginTop:4}}>📝 {quoteData.notes}</div>}
      </Card>
      <Card style={{background:"rgba(0,174,239,0.04)",border:"1px solid rgba(0,174,239,0.2)"}}>
        <div style={{color:B.white,fontSize:13,fontWeight:700,marginBottom:10}}>Delivery Schedule</div>
        {isSupplyInstall ? <>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>📦</div>
            <div><div style={{color:B.white,fontSize:12,fontWeight:700}}>Hob & Channels</div>
              <div style={{color:B.midGrey,fontSize:11}}>Deliver by: <span style={{color:B.cyan,fontWeight:700}}>{quoteData.hobDate}</span></div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🪟</div>
            <div><div style={{color:B.white,fontSize:12,fontWeight:700}}>Glass Install</div>
              <div style={{color:B.midGrey,fontSize:11}}>Approx: <span style={{color:B.cyan,fontWeight:700}}>{quoteData.glassDate}</span></div></div>
          </div>
        </> : <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>📦</div>
          <div><div style={{color:B.white,fontSize:12,fontWeight:700}}>Full Kit Delivery</div>
            <div style={{color:B.midGrey,fontSize:11}}>Deliver by: <span style={{color:B.cyan,fontWeight:700}}>{quoteData.deliveryDate}</span></div></div>
        </div>}
      </Card>
      {screens.map((s,i)=>(
        <Card key={i} style={s.isCustom?{border:`1px solid ${B.customBorder}`}:{}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,borderRadius:8,background:s.isCustom?`linear-gradient(135deg,${B.custom},#6B21A8)`:`linear-gradient(135deg,${B.cyan},${B.navyMid})`,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:12,fontWeight:700}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{color:B.white,fontSize:13,fontWeight:700}}>{s.type}{s.isCustom&&<span style={{color:B.custom,fontSize:10,marginLeft:6}}>CUSTOM</span>}</div>
              <div style={{color:B.midGrey,fontSize:11,marginTop:2}}>{s.summary}</div>
              <div style={{color:B.midGrey,fontSize:10,marginTop:2}}>Waterstop: {s.waterstop}mm · {s.colour}</div>
              {s.isCustom&&s.measureDate&&<div style={{color:B.custom,fontSize:10,marginTop:2}}>📐 Measure: {s.measureDate}</div>}
              {s.approxOnly&&<div style={{color:"#F59E0B",fontSize:10,marginTop:2}}>📏 Approximate — exact sizes by: {s.approxDate}</div>}
              {s.isRadius&&<div style={{color:B.cyan,fontSize:10,marginTop:2}}>◐ Radius Corner Panel{s.isCustom?" (custom)":""}</div>}
            </div>
            {s.price?<div style={{textAlign:"right"}}>
              <div style={{color:B.price,fontSize:14,fontWeight:800}}>${s.price.exGst.toFixed(2)}</div>
              <div style={{color:B.midGrey,fontSize:9}}>ex GST</div>
            </div>:<div style={{textAlign:"right"}}>
              <div style={{color:B.custom,fontSize:12,fontWeight:700}}>TBC</div>
              <div style={{color:B.midGrey,fontSize:9}}>custom</div>
            </div>}
          </div>
          {confirmRemove===i ? (
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,padding:"8px 10px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8}}>
              <span style={{color:"#EF4444",fontSize:12,fontWeight:600,flex:1}}>Remove this screen?</span>
              <button onClick={()=>{onRemove(i);setConfirmRemove(null);}} style={{padding:"6px 12px",borderRadius:6,background:"rgba(239,68,68,0.2)",border:"1px solid rgba(239,68,68,0.4)",color:"#EF4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>Yes</button>
              <button onClick={()=>setConfirmRemove(null)} style={{padding:"6px 12px",borderRadius:6,background:"rgba(0,27,61,0.6)",border:"1px solid rgba(0,174,239,0.15)",color:B.midGrey,fontSize:11,fontWeight:600,cursor:"pointer"}}>No</button>
            </div>
          ) : (
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>onEdit(i)} style={{flex:1,padding:"7px 10px",borderRadius:8,background:"rgba(0,174,239,0.08)",border:"1px solid rgba(0,174,239,0.2)",color:B.cyan,fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Edit</button>
              <button onClick={()=>setConfirmRemove(i)} style={{flex:1,padding:"7px 10px",borderRadius:8,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",color:"#EF4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑 Remove</button>
            </div>
          )}
        </Card>
      ))}
      {total>0&&<Card style={{background:B.priceBg,border:`1.5px solid ${B.priceBorder}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{color:B.price,fontSize:13,fontWeight:700}}>Order Total{customScreens.length>0?" (stock items)":""}</div>
            {customScreens.length>0&&<div style={{color:B.custom,fontSize:10,marginTop:2}}>+ {customScreens.length} custom screen{customScreens.length>1?"s":""} (TBC)</div>}</div>
          <div style={{textAlign:"right"}}>
            <div style={{color:B.white,fontSize:22,fontWeight:800}}>${total.toFixed(2)}</div>
            <div style={{color:B.midGrey,fontSize:11}}>${totalInc.toFixed(2)} inc GST</div>
          </div>
        </div>
      </Card>}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <Btn onClick={onAddMore} variant="ghost" style={{flex:1}}>+ Add Screen</Btn>
      </div>
      <Btn onClick={onSubmit}>Submit Order →</Btn>
    </PageWrap>
  );
};

const QuoteSubmitted = ({quoteData,onDashboard,customerType,emailStatus}) => {
  const isSupplyInstall = customerType === "Supply & Install";
  return(
  <PageWrap padTop="40px">
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16}}>✅</div>
      <h2 style={{color:B.white,fontSize:22,fontWeight:800,marginBottom:8}}>Order Submitted!</h2>
      <p style={{color:B.midGrey,fontSize:14,lineHeight:1.5,marginBottom:8}}>Job Ref: <span style={{color:B.white,fontWeight:700}}>{quoteData.jobRef}</span></p>
      <p style={{color:B.midGrey,fontSize:13,lineHeight:1.5,marginBottom:20}}>HSSS will review and confirm your order.</p>
    </div>
    <Card style={{background:emailStatus==="error"?"rgba(239,68,68,0.06)":"rgba(16,185,129,0.06)",border:`1px solid ${emailStatus==="error"?"rgba(239,68,68,0.2)":"rgba(16,185,129,0.2)"}`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <span style={{fontSize:16}}>{emailStatus==="sending"?"⏳":emailStatus==="error"?"⚠️":"✉️"}</span>
        <div style={{color:emailStatus==="error"?"#EF4444":B.price,fontSize:13,fontWeight:700}}>
          {emailStatus==="sending"?"Sending order to HSSS...":emailStatus==="error"?"Email failed — please contact HSSS directly":"Order Emailed to HSSS"}
        </div>
      </div>
      <div style={{color:B.midGrey,fontSize:11,lineHeight:1.6}}>
        <div>📍 {quoteData.deliveryAddress}, {quoteData.deliverySuburb}</div>
        {isSupplyInstall ? <>
          <div>📦 Hob delivery by: <span style={{color:B.white,fontWeight:600}}>{quoteData.hobDate}</span></div>
          <div>🪟 Glass install approx: <span style={{color:B.white,fontWeight:600}}>{quoteData.glassDate}</span></div>
        </> : <div>📦 Delivery by: <span style={{color:B.white,fontWeight:600}}>{quoteData.deliveryDate}</span></div>}
        <div style={{marginTop:6,color:"rgba(90,125,158,0.6)",fontSize:10}}>Sent to: {ORDER_EMAIL}</div>
      </div>
    </Card>
    {emailStatus==="error"&&<Card>
      <div style={{color:B.midGrey,fontSize:12,lineHeight:1.5}}>Your order details are saved. Please call or email HSSS to confirm:</div>
      {HSSS_CONTACTS.filter(c=>c.role==="Sales").map((c,i)=>(
        <a key={i} href={`tel:${c.phone.replace(/\s/g,"")}`} style={{display:"block",padding:"8px 12px",marginTop:6,background:"rgba(0,174,239,0.08)",border:"1px solid rgba(0,174,239,0.2)",borderRadius:8,color:B.cyan,fontSize:13,fontWeight:600,textDecoration:"none"}}>📱 {c.name} — {c.phone}</a>
      ))}
    </Card>}
    <Btn onClick={onDashboard}>Back to Dashboard</Btn>
  </PageWrap>
  );
};


// ╔═══════════════════════════════════════════════════════════════╗
// ║  MAIN APP                                                    ║
// ╚═══════════════════════════════════════════════════════════════╝

export default function HsssBuilderApp({ user, signOut, builderProfile }) {
  const [screen,setScreen]=useState(user ? "dashboard" : "splash");
  const [screens,setScreens]=useState([]);
  const [quoteData,setQuoteData]=useState({jobRef:"",deliveryAddress:"",deliverySuburb:"",deliveryState:"QLD",notes:"",siteContact:{name:"",phone:""},hobDate:"",glassDate:"",deliveryDate:""});
  const [locationLabels,setLocationLabels]=useState([]);
  const [customerType,setCustomerType]=useState(builderProfile?.service_type || "Supply & Install");
  const [emailStatus,setEmailStatus]=useState(null); // null | 'sending' | 'sent' | 'error'
  const [editIndex,setEditIndex]=useState(null);
  // Persistent site contacts from Supabase
  const { contacts: savedContacts, addContact: saveSiteContact } = useSiteContacts(user, builderProfile);

  const addScreen = (cfg) => {
    if(editIndex!==null){const u=[...screens];u[editIndex]=cfg;setScreens(u);setEditIndex(null);}
    else{setScreens([...screens,cfg]);}
    setScreen("quoteSummary");
  };
  const removeScreen = (idx) => {
    const u=screens.filter((_,i)=>i!==idx);
    setScreens(u);
    if(u.length===0) setScreen("typeSelect");
  };
  const editScreen = (idx) => {
    setEditIndex(idx);
    const s=screens[idx];
    if(s.type==="Front & Return") setScreen("buildFR");
    else if(s.type==="Front Only") setScreen("buildFO");
    else if(s.type==="Splayed") setScreen("buildSP");
    else setScreen("buildFP");
  };
  const resetQuote = () => {
    setScreens([]);
    setQuoteData({jobRef:"",deliveryAddress:"",deliverySuburb:"",deliveryState:"QLD",notes:"",siteContact:{name:"",phone:""},hobDate:"",glassDate:"",deliveryDate:""});
    setLocationLabels([]);
    setEmailStatus(null);
  };
  const handleSaveContact = async (contact) => {
    await saveSiteContact({ name: contact.name, phone: contact.phone });
  };
  
  const submitOrder = async (labels) => {
    setScreen("quoteSubmitted");
    setEmailStatus("sending");
    const result = await sendOrderEmail(quoteData, screens, customerType, labels || locationLabels, user, builderProfile);
    setEmailStatus(result.success ? "sent" : "error");
  };
  
  const handleQuoteSubmit = () => {
    if(screens.length>=2){
      setLocationLabels(screens.map(()=>""));
      setScreen("locationLabels");
    } else { submitOrder([]); }
  };

  switch(screen){

    case "dashboard": return <Dashboard onNavigate={a=>{
      if(a==="newOrder"){resetQuote();setScreen("quoteSetup");}
      else if(a==="quickQuote") setScreen("quickQuote");
      else if(a==="customOrder") setScreen("customOrder");
      else if(a==="contact") setScreen("contact");
      else setScreen("dashboard");
    }}/>;
    case "quickQuote": return <QuickQuote onBack={()=>setScreen("dashboard")} customerType={customerType}/>;
    case "customOrder": return <CustomOrderScreen onBack={()=>setScreen("dashboard")}/>;
    case "contact": return <ContactScreen onBack={()=>setScreen("dashboard")}/>;
    case "quoteSetup": return <QuoteSetup onBack={()=>setScreen("dashboard")} onNext={()=>setScreen("typeSelect")} quoteData={quoteData} setQuoteData={setQuoteData} savedContacts={savedContacts} onSaveContact={handleSaveContact} customerType={customerType}/>;
    case "typeSelect": return <ScreenTypeSelector screenCount={screens.length} onBack={()=>screens.length>0?setScreen("quoteSummary"):setScreen("quoteSetup")} onSelect={t=>{
      if(t==="frontReturn")setScreen("buildFR");
      else if(t==="frontOnly")setScreen("buildFO");
      else if(t==="splayed")setScreen("buildSP");
      else setScreen("buildFP");
    }}/>;
    case "buildFR": return <FrontReturnBuilder onBack={()=>{setEditIndex(null);setScreen(editIndex!==null?"quoteSummary":"typeSelect");}} onAdd={addScreen} customerType={customerType} initialData={editIndex!==null?screens[editIndex]:null}/>;
    case "buildFO": return <FrontOnlyBuilder onBack={()=>{setEditIndex(null);setScreen(editIndex!==null?"quoteSummary":"typeSelect");}} onAdd={addScreen} customerType={customerType} initialData={editIndex!==null?screens[editIndex]:null}/>;
    case "buildSP": return <SplayedBuilder onBack={()=>{setEditIndex(null);setScreen(editIndex!==null?"quoteSummary":"typeSelect");}} onAdd={addScreen} customerType={customerType} initialData={editIndex!==null?screens[editIndex]:null}/>;
    case "buildFP": return <FixedPanelBuilder onBack={()=>{setEditIndex(null);setScreen(editIndex!==null?"quoteSummary":"typeSelect");}} onAdd={addScreen} customerType={customerType} initialData={editIndex!==null?screens[editIndex]:null}/>;
    case "quoteSummary": return <QuoteSummary screens={screens} quoteData={quoteData} onAddMore={()=>setScreen("typeSelect")} onBack={()=>setScreen("quoteSetup")} onSubmit={handleQuoteSubmit} customerType={customerType} onEdit={editScreen} onRemove={removeScreen}/>;
    case "locationLabels": return <LocationLabels screens={screens} labels={locationLabels} setLabels={setLocationLabels} onBack={()=>setScreen("quoteSummary")} onSubmit={()=>submitOrder(locationLabels)}/>;
    case "quoteSubmitted": return <QuoteSubmitted quoteData={quoteData} onDashboard={()=>{resetQuote();setScreen("dashboard");}} customerType={customerType} emailStatus={emailStatus}/>;
    default: return <Dashboard onNavigate={()=>setScreen("dashboard")}/>;

  }
}
