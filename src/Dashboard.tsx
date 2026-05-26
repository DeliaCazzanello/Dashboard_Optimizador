import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ThemeCtx, useT, useThemeToggle, type AppPage, type Theme, pageToPath } from './theme';
import { Chart } from "react-google-charts";
import {
  LuZap, LuGauge, LuCpu, LuChartBar, LuZapOff,
  LuTrendingDown, LuTrendingUp, LuActivity,
  LuBell, LuMoon, LuSun, LuWind, LuTv, LuLamp,
  LuThermometer, LuPlug, LuMove, LuTriangleAlert,
  LuWifi, LuMonitor, LuSpeaker, LuRefrigerator,
  LuShowerHead, LuTimer, LuBatteryCharging, LuFan,
  LuUser,
} from "react-icons/lu";

// ─── Desktop layout constants (from .pen 1440×900) ───────────────
const PADDING  = 24;
const GAP      = 16;
const KPI_H    = 110;
const CHARTS_H = 230;
const HEADER_H = 56;
const BOTTOM_H = 412;
const DROW_H   = 165;


// ─── Chart data ──────────────────────────────────────────────────

const lineData = [
  ["Día","Real (kWh)","Proyectado (kWh)"],
  ["Lun",48,52],["Mar",55,52],["Mié",50,53],
  ["Jue",60,54],["Vie",45,53],["Sáb",38,50],["Dom",42,51],
];
const mkLineOpts = (t: Theme) => ({
  backgroundColor:"transparent", legend:{position:"none"},
  chartArea:{left:28,right:8,top:8,bottom:28,width:"100%",height:"100%"},
  hAxis:{textStyle:{color:t.chartAxisText,fontSize:10},gridlines:{color:"transparent"},baselineColor:"transparent"},
  vAxis:{textStyle:{color:t.chartAxisText,fontSize:10},gridlines:{color:t.chartGridline,count:4},baselineColor:t.chartGridline},
  series:{0:{color:"#3B82F6",lineWidth:2,areaOpacity:0.18},1:{color:"#10B981",lineWidth:2,lineDashStyle:[5,4]}},
  curveType:"function",
});

const donutData = [
  ["Dispositivo","kWh"],
  ["AC Cuarto",38],["Iluminación",22],["Pantalla PC",18],["Otros",22],
];
const donutOpts = {
  backgroundColor:"transparent",legend:{position:"none"},pieHole:0.62,
  pieSliceBorderColor:"transparent",
  slices:{0:{color:"#3B82F6"},1:{color:"#10B981"},2:{color:"#F59E0B"},3:{color:"#8B5CF6"}},
  chartArea:{left:0,right:0,top:0,bottom:0,width:"100%",height:"100%"},
  tooltip:{trigger:"none"},
};
const donutLegend = [
  {label:"AC Cuarto",   value:"38%", color:"#3B82F6"},
  {label:"Iluminación", value:"22%", color:"#10B981"},
  {label:"Pantalla PC", value:"18%", color:"#F59E0B"},
  {label:"Otros",       value:"22%", color:"#8B5CF6"},
];

// ─── Static data ─────────────────────────────────────────────────

const initDevices = [
  {id:1,  name:"Luz Sala",     room:"Sala",    icon:LuSun,          nominal:"12W",   current:"12W",    cColor:"#10B981", barPct:14, barColor:"#10B981", on:true  },
  {id:2,  name:"AC Cuarto",    room:"Cuarto",  icon:LuWind,         nominal:"1200W", current:"1,500W", cColor:"#EF4444", barPct:75, barColor:"#EF4444", on:true  },
  {id:3,  name:"Enchufe TV",   room:"Sala",    icon:LuTv,           nominal:"85W",   current:"150W",   cColor:"#64748B", barPct:0,  barColor:"#374151", on:false },
  {id:4,  name:"Luz Cocina",   room:"Cocina",  icon:LuLamp,         nominal:"9W",    current:"8W",     cColor:"#10B981", barPct:14, barColor:"#10B981", on:true  },
  {id:5,  name:"AC Sala",      room:"Sala",    icon:LuThermometer,  nominal:"1400W", current:"1,800W", cColor:"#EF4444", barPct:90, barColor:"#EF4444", on:true  },
  {id:6,  name:"Enchufe PC",   room:"Oficina", icon:LuPlug,         nominal:"250W",  current:"200W",   cColor:"#64748B", barPct:0,  barColor:"#374151", on:false },
  {id:7,  name:"Router WiFi",  room:"Sala",    icon:LuWifi,         nominal:"18W",   current:"18W",    cColor:"#10B981", barPct:20, barColor:"#10B981", on:true  },
  {id:8,  name:"Monitor",      room:"Oficina", icon:LuMonitor,      nominal:"35W",   current:"35W",    cColor:"#10B981", barPct:38, barColor:"#10B981", on:true  },
  {id:9,  name:"Bocina",       room:"Cuarto",  icon:LuSpeaker,      nominal:"20W",   current:"20W",    cColor:"#64748B", barPct:0,  barColor:"#374151", on:false },
  {id:10, name:"Refrigerador", room:"Cocina",  icon:LuRefrigerator, nominal:"150W",  current:"145W",   cColor:"#10B981", barPct:55, barColor:"#10B981", on:true  },
  {id:11, name:"Calentador",   room:"Baño",    icon:LuShowerHead,   nominal:"3500W", current:"3,500W", cColor:"#EF4444", barPct:85, barColor:"#EF4444", on:true  },
  {id:12, name:"Ventilador",   room:"Cuarto",  icon:LuFan,          nominal:"60W",   current:"60W",    cColor:"#10B981", barPct:30, barColor:"#10B981", on:true  },
];

const rulesData = [
  {id:1, icon:LuMove,            iColor:"#3B82F6", text:"Apagar luces sin movimiento 10min",  detail:"Sala · 10 min",           active:true  },
  {id:2, icon:LuMoon,            iColor:"#3B82F6", text:"AC a 24°C de noche",                 detail:"Dormitorio · 22:00–7:00", active:true  },
  {id:3, icon:LuZap,             iColor:"#6B7280", text:"Reducir consumo en horas pico",      detail:"Global · 18:00–21:00",    active:false },
  {id:4, icon:LuTimer,           iColor:"#3B82F6", text:"Encender AC 30min antes de llegar",  detail:"Cuarto · automático",     active:true  },
  {id:5, icon:LuBatteryCharging, iColor:"#6B7280", text:"Cargar dispositivos de madrugada",   detail:"Global · 02:00–05:00",    active:false },
  {id:6, icon:LuFan,             iColor:"#3B82F6", text:"Apagar ventiladores al salir",       detail:"Sala · salida detectada", active:true  },
];

// ─── Shared sub-components ────────────────────────────────────────

function ToggleLg({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <div onClick={onToggle} style={{
      position:"relative",flexShrink:0,cursor:"pointer",
      width:32,height:18,borderRadius:9,overflow:"hidden",
      background:on?"#10B981":t.toggleOffBg,transition:"background .2s",
    }}>
      <div style={{position:"absolute",top:2,width:14,height:14,borderRadius:"50%",
        background:"#FFFFFF",left:on?16:2,transition:"left .2s"}}/>
    </div>
  );
}

function ToggleSm({ active }: { active: boolean }) {
  const t = useT();
  return (
    <div style={{
      position:"relative",flexShrink:0,
      width:28,height:16,borderRadius:8,overflow:"hidden",
      background:active?"#10B981":t.toggleOffBg,
    }}>
      <div style={{position:"absolute",top:2,width:12,height:12,borderRadius:"50%",
        background:"#FFFFFF",left:active?14:2}}/>
    </div>
  );
}

function DeviceCard({ d, onToggle, compact=false }: {
  d: typeof initDevices[0];
  onToggle: () => void;
  compact?: boolean;
}) {
  const t = useT();
  const Icon = d.icon;

  if (compact) {
    return (
      <div style={{
        height:88,padding:12,borderRadius:12,
        display:"flex",flexDirection:"column",justifyContent:"space-between",
        background:d.on?t.deviceOnBg:t.deviceOffBg,
        border:`1px solid ${d.on?t.deviceOnBorder:t.deviceOffBorder}`,
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Icon size={16} color={d.on?"#3B82F6":t.deviceOffText}/>
          <ToggleLg on={d.on} onToggle={onToggle}/>
        </div>
        <div>
          <p style={{fontSize:11,fontWeight:600,color:t.textPrimary,margin:0,lineHeight:1.3}}>{d.name}</p>
          <p style={{fontSize:10,color:t.textTertiary,margin:0,marginTop:2,lineHeight:1.3}}>{d.room}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex:1,minWidth:0,display:"flex",flexDirection:"column",
      justifyContent:"space-between",padding:12,borderRadius:10,
      background:d.on?t.deviceOnBg:t.deviceOffBg,
      border:`1px solid ${d.on?t.deviceOnBorder:t.deviceOffBorder}`,
    }}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Icon size={18} color={d.on?"#3B82F6":t.deviceOffText}/>
        <ToggleLg on={d.on} onToggle={onToggle}/>
      </div>
      <div>
        <p style={{fontSize:11,fontWeight:600,color:t.textPrimary,lineHeight:1.3}}>{d.name}</p>
        <p style={{fontSize:10,color:t.textTertiary,lineHeight:1.3,marginTop:2}}>{d.room}</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,
          background:d.on?"#10B981":t.deviceOffDot}}/>
        <span style={{fontSize:10,color:d.on?"#10B981":t.deviceOffText}}>{d.nominal}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:9,color:t.consumoText}}>Consumo actual</span>
          <span style={{fontSize:9,fontWeight:600,color:d.on?d.cColor:t.consumoText}}>{d.current}</span>
        </div>
        <div style={{height:4,borderRadius:2,background:t.barTrack,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:2,
            width:`${d.on?d.barPct:0}%`,background:d.on?d.barColor:t.deviceOffDot}}/>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────

function Sidebar({ active, onNavigate }: { active: string; onNavigate?: (page: AppPage) => void }) {
  const t = useT();
  const nav = [
    {label:"Dashboard",        icon:LuGauge,    key:"dashboard", page:"dashboard" as AppPage},
    {label:"Dispositivos",     icon:LuCpu,      key:"dispositivos", page:"devices" as AppPage},
    {label:"Reportes",         icon:LuChartBar, key:"reportes",  page:"reports" as AppPage},
    {label:"Reglas de Ahorro", icon:LuZapOff,   key:"reglas",    page:"rules" as AppPage},
  ];
  return (
    <aside style={{
      width:240,flexShrink:0,position:"sticky",top:0,alignSelf:"flex-start",
      height:"100vh",display:"flex",flexDirection:"column",
      background:t.sidebarBg,borderRight:`1px solid ${t.sidebarBorder}`,
    }}>
      <div style={{height:72,flexShrink:0,display:"flex",alignItems:"center",
        gap:10,padding:"0 20px",borderBottom:`1px solid ${t.sidebarBorder}`,
        background:t.logoBg}}>
        <LuZap size={22} color="#3B82F6" fill="#3B82F6"/>
        <span style={{fontSize:18,fontWeight:700,color:t.textPrimary}}>EnergyIQ</span>
      </div>
      <nav style={{padding:12,display:"flex",flexDirection:"column",gap:4}}>
        {nav.map(({label,icon:Icon,key,page}) => {
          const on = key === active;
          return (
            <button key={key} onClick={() => page && onNavigate?.(page)} style={{
              display:"flex",alignItems:"center",gap:10,
              height:44,padding:"0 12px",width:"100%",
              border:"none",cursor:page?"pointer":"default",borderRadius:8,
              background:on?t.navActiveBg:"transparent",
            }}>
              <Icon size={18} color={on?t.navActiveIcon:t.navInactiveIcon}/>
              <span style={{fontSize:13,fontWeight:600,
                color:on?t.navActiveText:t.navInactiveText}}>{label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{flex:1}}/>
      <div style={{height:72,flexShrink:0,display:"flex",alignItems:"center",
        gap:10,padding:"0 16px",borderTop:`1px solid ${t.sidebarBorder}`}}>
        <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
          background:"#3B82F6",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:12,fontWeight:700,color:"#FFFFFF"}}>CM</div>
        <span style={{fontSize:12,fontWeight:600,color:t.textPrimary}}>Carlos Méndez</span>
      </div>
    </aside>
  );
}

// ─── Mobile components ────────────────────────────────────────────

function MobileHeader({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <header style={{
      height:60,flexShrink:0,display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"0 20px",
      background:t.sidebarBg,borderBottom:`1px solid ${t.sidebarBorder}`,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{
          width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",
          justifyContent:"center",
          background:"linear-gradient(135deg,#3B82F6 0%,#06B6D4 100%)",
        }}>
          <LuZap size={14} color="#fff" fill="#fff"/>
        </div>
        <span style={{fontSize:16,fontWeight:700,color:t.textPrimary}}>EnergyIQ</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div onClick={onToggle} style={{
          position:"relative",width:44,height:24,borderRadius:12,cursor:"pointer",
          background:t.pillBg,border:`1px solid ${t.pillBorder}`,
        }}>
          <div style={{
            position:"absolute",top:2,
            left:isDark?2:20,
            width:20,height:20,borderRadius:"50%",
            background:isDark?"#3B82F6":"#F59E0B",
            display:"flex",alignItems:"center",justifyContent:"center",
            transition:"left .2s, background .2s",
          }}>
            {isDark?<LuMoon size={10} color="#fff"/>:<LuSun size={10} color="#fff"/>}
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav({ active, onNavigate }: { active: string; onNavigate?: (page: AppPage) => void }) {
  const t = useT();
  const items = [
    {key:"dashboard",    label:"Inicio",   page:"dashboard" as AppPage, Icon:LuGauge  },
    {key:"dispositivos", label:"Devices",  page:"devices"  as AppPage, Icon:LuCpu    },
    {key:"reportes",     label:"Reportes", page:"reports" as AppPage,    Icon:LuChartBar},
    {key:"reglas",       label:"Reglas",   page:"rules" as AppPage,     Icon:LuZapOff },
    {key:"perfil",       label:"Perfil",   page:null,                   Icon:LuUser   },
  ];
  return (
    <nav style={{
      height:64,flexShrink:0,display:"flex",alignItems:"center",padding:"0 8px",
      background:t.sidebarBg,borderTop:`1px solid ${t.sidebarBorder}`,
    }}>
      {items.map(({key,label,page,Icon}) => {
        const on = key === active;
        return (
          <div key={key} onClick={() => page && onNavigate?.(page)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",gap:4,padding:"6px 0",cursor:page?"pointer":"default",
          }}>
            <div style={{
              width:28,height:28,borderRadius:8,display:"flex",
              alignItems:"center",justifyContent:"center",
              background:on?t.mNavActiveBg:"transparent",
            }}>
              <Icon size={18} color={on?t.navActiveIcon:t.navInactiveIcon}/>
            </div>
            <span style={{fontSize:9,fontWeight:on?600:400,
              color:on?t.navActiveText:t.navInactiveText}}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function MobileContent({ devices, toggleDevice }: {
  devices: typeof initDevices;
  toggleDevice: (id: number) => void;
}) {
  const t = useT();
  const lineOpts = mkLineOpts(t);
  const [period, setPeriod] = useState<"7D"|"1M"|"3M">("1M");

  const kpis = [
    {label:"Consumo Total",  value:"342 kWh", badge:"-12%", Icon:LuTrendingDown, gi:0},
    {label:"Dispositivos",   value:"8 / 12",  badge:"+2",   Icon:LuActivity,     gi:1},
    {label:"Ahorro Mensual", value:"$47.20",  badge:"+18%", Icon:LuTrendingUp,   gi:2},
    {label:"Alertas",        value:"2",       badge:"⚠",    Icon:LuTriangleAlert, gi:3},
  ];

  return (
    <main style={{
      flex:1,minHeight:0,overflowY:"auto",
      padding:16,display:"flex",flexDirection:"column",gap:14,
    }}>
      {/* Greeting */}
      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        <span style={{fontSize:18,fontWeight:700,color:t.textPrimary}}>Hola, Carlos 👋</span>
        <span style={{fontSize:12,color:t.textTertiary}}>Miércoles, 20 Mayo 2026</span>
      </div>

      {/* KPI 2×2 grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {kpis.map(({label,value,badge,Icon,gi}) => (
          <div key={label} style={{
            height:100,borderRadius:14,padding:14,
            display:"flex",flexDirection:"column",justifyContent:"space-between",
            background:`linear-gradient(135deg,${t.mKpiGrad[gi]} 0%,${t.cardBg} 100%)`,
            border:`1px solid ${t.cardBorder}`,
          }}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <Icon size={15} color="#10B981"/>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 5px",borderRadius:4,
                background:t.badgeKpiBg,color:t.badgeKpiColor}}>{badge}</span>
            </div>
            <p style={{fontSize:20,fontWeight:700,color:t.textPrimary,margin:0}}>{value}</p>
            <p style={{fontSize:11,color:t.textTertiary,margin:0}}>{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        height:190,borderRadius:14,padding:14,gap:10,
        display:"flex",flexDirection:"column",
        background:t.cardBg,border:`1px solid ${t.cardBorder}`,
      }}>
        <div style={{flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:600,color:t.textPrimary}}>
            Consumo Real vs Proyectado
          </span>
          <div style={{display:"flex",padding:2,borderRadius:8,background:t.pageBg,gap:2}}>
            {(["7D","1M","3M"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,
                background:period===p?"#3B82F6":"transparent",
                color:period===p?"#FFFFFF":t.textTertiary,
                fontWeight:period===p?600:400,
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{flexShrink:0,display:"flex",gap:14}}>
          {[{c:"#3B82F6",l:"Real"},{c:"#10B981",l:"Proyectado"}].map(s => (
            <div key={s.l} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:16,height:2,borderRadius:1,background:s.c}}/>
              <span style={{fontSize:10,color:t.textSecondary}}>{s.l}</span>
            </div>
          ))}
        </div>
        <div style={{flex:1,minHeight:0}}>
          <Chart chartType="AreaChart" data={lineData} options={lineOpts}
            width="100%" height="100%"/>
        </div>
      </div>

      {/* Devices 2×2 */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:600,color:t.textPrimary}}>
            Control de Dispositivos
          </span>
          <div style={{padding:"4px 8px",borderRadius:6,background:t.badgeInactiveBg,cursor:"pointer"}}>
            <span style={{fontSize:10,color:"#3B82F6"}}>Ver todos</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {devices.slice(0,4).map(d => (
            <DeviceCard key={d.id} d={d} onToggle={() => toggleDevice(d.id)} compact/>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,fontWeight:600,color:t.textPrimary}}>
            Reglas de Ahorro Activas
          </span>
          <div style={{display:"flex",alignItems:"center",padding:"4px 8px",
            borderRadius:6,background:t.mNavActiveBg,cursor:"pointer"}}>
            <span style={{fontSize:10,color:"#3B82F6"}}>+ Nueva</span>
          </div>
        </div>
        {rulesData.slice(0,3).map(r => {
          const Icon = r.icon;
          return (
            <div key={r.id} style={{
              display:"flex",alignItems:"center",gap:10,padding:"12px 14px",
              borderRadius:12,background:t.ruleItemBg,border:`1px solid ${t.cardBorder}`,
            }}>
              <div style={{
                width:36,height:36,borderRadius:10,flexShrink:0,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:t.ruleIconBg,
              }}>
                <Icon size={16} color={r.iColor}/>
              </div>
              <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2}}>
                <span style={{fontSize:12,fontWeight:500,color:t.textPrimary,
                  display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {r.text}
                </span>
                <span style={{fontSize:10,color:t.textTertiary}}>{r.detail}</span>
              </div>
              <ToggleSm active={r.active}/>
            </div>
          );
        })}
      </div>

      <div style={{height:8}}/>
    </main>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────

export default function Dashboard() {
  const { isDark, toggle } = useThemeToggle();
  const t = useT();
  const navigate = useNavigate();
  const goTo = (page: AppPage) => navigate(pageToPath[page]);
  const [devices, setDevices] = useState(initDevices);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleDevice = (id: number) =>
    setDevices(p => p.map(d => d.id === id ? {...d, on:!d.on} : d));

  const card = {background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:12} as const;
  const lineOpts = mkLineOpts(t);

  return (
    <>
      <div data-theme={isDark?"dark":"light"} style={{
        display:"flex",
        flexDirection:isMobile?"column":"row",
        ...(isMobile ? {height:"100vh",overflow:"hidden"} : {minHeight:"100%"}),
        background:t.pageBg,
      }}>

        {isMobile ? (
          <>
            <MobileHeader isDark={isDark} onToggle={toggle}/>
            <MobileContent devices={devices} toggleDevice={toggleDevice}/>
            <MobileBottomNav active="dashboard" onNavigate={goTo}/>
          </>
        ) : (
          <>
            <Sidebar active="dashboard" onNavigate={goTo}/>

            <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",
              padding:PADDING,gap:GAP}}>

              {/* ── Header ── */}
              <div style={{height:HEADER_H,flexShrink:0,display:"flex",
                alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <h1 style={{fontSize:22,fontWeight:700,color:t.textPrimary,margin:0}}>Dashboard</h1>
                  <p style={{fontSize:13,color:t.textSecondary,margin:0}}>Bienvenido de nuevo, Carlos</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:12,color:t.textTertiary}}>Miércoles, 20 Mayo 2026</span>
                  <div style={{width:36,height:36,borderRadius:8,flexShrink:0,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    background:t.bellBg,border:`1px solid ${t.bellBorder}`}}>
                    <LuBell size={15} color={t.textTertiary}/>
                  </div>
                  <div onClick={toggle} style={{
                    position:"relative",width:52,height:28,borderRadius:14,flexShrink:0,
                    background:t.pillBg,border:`1px solid ${t.pillBorder}`,cursor:"pointer",
                  }}>
                    <div style={{
                      position:"absolute",top:3,
                      left:isDark?3:27,
                      width:22,height:22,borderRadius:"50%",
                      background:isDark?"#3B82F6":"#F59E0B",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      transition:"left .2s, background .2s",
                    }}>
                      {isDark?<LuMoon size={12} color="#fff"/>:<LuSun size={12} color="#fff"/>}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── KPI Cards ── */}
              <div style={{height:KPI_H,flexShrink:0,display:"flex",gap:GAP}}>
                {([
                  {label:"Consumo Total",        value:"342 kWh", sub:"Este mes",        badge:"-12%", Icon:LuTrendingDown},
                  {label:"Dispositivos Activos", value:"8/12",    sub:"Conectados",      badge:"+2",   Icon:LuActivity    },
                  {label:"Ahorro Mensual",        value:"$47.20",  sub:"vs mes anterior", badge:"+18%", Icon:LuTrendingUp  },
                ] as const).map(({label,value,sub,badge,Icon}) => (
                  <div key={label} style={{
                    ...card,flex:1,padding:16,gap:6,
                    display:"flex",flexDirection:"column",background:t.kpiGradient,
                  }}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,color:t.textSecondary}}>{label}</span>
                      <Icon size={16} color="#10B981"/>
                    </div>
                    <p style={{fontSize:24,fontWeight:700,color:t.textPrimary,margin:0}}>{value}</p>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:11,color:t.textTertiary}}>{sub}</span>
                      <span style={{fontSize:11,fontWeight:500,padding:"2px 6px",borderRadius:4,
                        background:t.badgeKpiBg,color:t.badgeKpiColor}}>{badge}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Charts ── */}
              <div style={{height:CHARTS_H,flexShrink:0,display:"flex",gap:GAP}}>
                <div style={{...card,flex:1,minWidth:0,padding:16,gap:10,
                  display:"flex",flexDirection:"column"}}>
                  <div style={{flexShrink:0,display:"flex",alignItems:"center",
                    justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:600,color:t.textPrimary}}>
                      Consumo Real vs Proyectado
                    </span>
                    <div style={{display:"flex",alignItems:"center",gap:16}}>
                      {[{c:"#3B82F6",l:"Real"},{c:"#10B981",l:"Proyectado"}].map(s=>(
                        <div key={s.l} style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:20,height:2,borderRadius:1,background:s.c}}/>
                          <span style={{fontSize:11,color:t.textSecondary}}>{s.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{flex:1,minHeight:0}}>
                    <Chart chartType="AreaChart" data={lineData} options={lineOpts}
                      width="100%" height="100%"/>
                  </div>
                </div>

                <div style={{...card,width:320,flexShrink:0,padding:16,gap:10,
                  display:"flex",flexDirection:"column",overflow:"hidden"}}>
                  <span style={{fontSize:13,fontWeight:600,color:t.textPrimary,flexShrink:0}}>
                    Consumo por Dispositivo
                  </span>
                  <div style={{flexShrink:0,display:"flex",justifyContent:"center"}}>
                    <Chart chartType="PieChart" data={donutData} options={donutOpts}
                      width="110px" height="110px"/>
                  </div>
                  <div style={{flex:1,minHeight:0,overflowY:"auto",
                    display:"flex",flexDirection:"column",gap:6}}>
                    {donutLegend.map(item=>(
                      <div key={item.label} style={{display:"flex",alignItems:"center",
                        justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:2,
                            background:item.color,flexShrink:0}}/>
                          <span style={{fontSize:11,color:t.legendText}}>{item.label}</span>
                        </div>
                        <span style={{fontSize:11,fontWeight:600,color:t.legendValue}}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Bottom row ── */}
              <div style={{height:BOTTOM_H,flexShrink:0,display:"flex",gap:GAP}}>

                <div style={{...card,flex:1,minWidth:0,padding:16,gap:12,
                  display:"flex",flexDirection:"column"}}>
                  <div style={{flexShrink:0,display:"flex",alignItems:"center",
                    justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:600,color:t.textPrimary}}>
                      Control de Dispositivos
                    </span>
                    <span style={{fontSize:11,fontWeight:500,padding:"3px 8px",
                      borderRadius:10,background:t.badgeActiveBg,color:t.badgeActiveColor}}>
                      {devices.filter(d=>d.on).length} activos
                    </span>
                  </div>
                  <div style={{flex:1,minHeight:0,overflowY:"auto",
                    display:"flex",flexDirection:"column",gap:8}}>
                    {Array.from({length:Math.ceil(devices.length/3)},(_,i) => (
                      <div key={i} style={{height:DROW_H,flexShrink:0,display:"flex",gap:8}}>
                        {devices.slice(i*3,i*3+3).map(d =>
                          <DeviceCard key={d.id} d={d} onToggle={() => toggleDevice(d.id)}/>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{width:340,flexShrink:0,display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{...card,flex:1,minHeight:0,padding:16,gap:10,
                    display:"flex",flexDirection:"column"}}>
                    <span style={{fontSize:13,fontWeight:600,color:t.textPrimary,flexShrink:0}}>
                      Reglas Activas
                    </span>
                    <div style={{flex:1,minHeight:0,overflowY:"auto",
                      display:"flex",flexDirection:"column",gap:8}}>
                      {rulesData.map(r => {
                        const Icon = r.icon;
                        const iBg  = r.active?t.ruleIconActiveBg:t.ruleIconInactiveBg;
                        const bBg  = r.active?t.badgeActiveBg:t.badgeInactiveBg;
                        const bClr = r.active?t.badgeActiveColor:t.badgeInactiveColor;
                        return (
                          <div key={r.id} style={{display:"flex",alignItems:"center",
                            gap:10,padding:10,borderRadius:8,background:t.ruleItemBg,flexShrink:0}}>
                            <div style={{width:30,height:30,borderRadius:6,flexShrink:0,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              background:iBg}}>
                              <Icon size={14} color={r.iColor}/>
                            </div>
                            <div style={{flex:1,minWidth:0,display:"flex",
                              flexDirection:"column",gap:3}}>
                              <span style={{fontSize:11,color:t.textPrimary,display:"block",
                                whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                                {r.text}
                              </span>
                              <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",
                                borderRadius:4,alignSelf:"flex-start",background:bBg,color:bClr}}>
                                {r.active?"Activa":"Inactiva"}
                              </span>
                            </div>
                            <ToggleSm active={r.active}/>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{
                    background:t.alertBg,border:"1px solid rgba(245,158,11,0.25)",
                    borderRadius:12,flexShrink:0,padding:14,gap:10,
                    display:"flex",alignItems:"center",
                  }}>
                    <div style={{width:34,height:34,borderRadius:8,flexShrink:0,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      background:t.alertIconBg}}>
                      <LuTriangleAlert size={18} color="#F59E0B"/>
                    </div>
                    <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:3}}>
                      <p style={{fontSize:12,fontWeight:600,color:"#F59E0B",margin:0}}>
                        Consumo Elevado Detectado
                      </p>
                      <p style={{fontSize:10,color:t.textSecondary,margin:0}}>
                        Aire Acondicionado supera el límite recomendado
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{height:4,flexShrink:0}}/>
            </main>
          </>
        )}
      </div>
    </>
  );
}
