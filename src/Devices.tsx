import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import {
  LuZap, LuGauge, LuCpu, LuChartBar, LuZapOff,
  LuBell, LuMoon, LuSun, LuUser, LuActivity,
  LuWind, LuTv, LuRefrigerator, LuFan, LuShowerHead, LuLamp, LuX,
  LuMonitor, LuWifi,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { useT, useThemeToggle, type AppPage, type Theme, pageToPath } from './theme';

// ─── Devices data ─────────────────────────────────────────────────

type LuIcon = ComponentType<{ size?: number; color?: string }>;

type Device = {
  id: number; Icon: LuIcon; iconColor: string; name: string;
  category: string;
  catColor: string; catBg: string;
  catColorLight: string; catBgLight: string;
  watts: number; on: boolean;
  mac: string; date: string;
};

const initDevices: Device[] = [
  {id:1, Icon:LuWind,        iconColor:"#3B82F6", name:"Aire Acondicionado", category:"Climatización",   catColor:"#3B82F6", catBg:"#1E3A5F", catColorLight:"#1D4ED8", catBgLight:"#DBEAFE", watts:1500, on:true,  mac:"AA:BB:CC:11:22:33", date:"12 Ene 2026"},
  {id:2, Icon:LuTv,          iconColor:"#8B5CF6", name:'Televisor Smart 55"', category:"Entretenimiento", catColor:"#8B5CF6", catBg:"#2D1F5E", catColorLight:"#7C3AED", catBgLight:"#EDE9FE", watts:150,  on:true,  mac:"AA:BB:CC:11:22:44", date:"15 Ene 2026"},
  {id:3, Icon:LuRefrigerator,iconColor:"#10B981", name:"Refrigerador",        category:"Cocina",          catColor:"#10B981", catBg:"#1A2D20", catColorLight:"#059669", catBgLight:"#DCFCE7", watts:180,  on:true,  mac:"AA:BB:CC:11:22:55", date:"10 Ene 2026"},
  {id:4, Icon:LuFan,         iconColor:"#F59E0B", name:"Lavadora",            category:"Electrodoméstico",catColor:"#F59E0B", catBg:"#2D2010", catColorLight:"#D97706", catBgLight:"#FEF3C7", watts:2000, on:false, mac:"AA:BB:CC:11:22:66", date:"20 Feb 2026"},
  {id:5, Icon:LuShowerHead,  iconColor:"#3B82F6", name:"Calentador de Agua",  category:"Climatización",   catColor:"#3B82F6", catBg:"#1E3A5F", catColorLight:"#1D4ED8", catBgLight:"#DBEAFE", watts:1200, on:true,  mac:"AA:BB:CC:11:22:77", date:"10 Ene 2026"},
  {id:6, Icon:LuLamp,        iconColor:"#EAB308", name:"Iluminación LED",     category:"Iluminación",     catColor:"#EAB308", catBg:"#2D2A10", catColorLight:"#CA8A04", catBgLight:"#FEF9C3", watts:40,   on:true,  mac:"AA:BB:CC:11:22:88", date:"10 Ene 2026"},
  {id:7, Icon:LuMonitor,    iconColor:"#8B5CF6", name:"Monitor PC Oficina",  category:"Entretenimiento", catColor:"#8B5CF6", catBg:"#2D1F5E", catColorLight:"#7C3AED", catBgLight:"#EDE9FE", watts:35,   on:true,  mac:"AA:BB:CC:11:22:99", date:"18 Feb 2026"},
  {id:8, Icon:LuWifi,       iconColor:"#06B6D4", name:"Router WiFi",         category:"Red",             catColor:"#06B6D4", catBg:"#0D2D35", catColorLight:"#0891B2", catBgLight:"#CFFAFE", watts:18,   on:true,  mac:"AA:BB:CC:11:22:AA", date:"10 Ene 2026"},
];

// ─── Device type catalogue ────────────────────────────────────────

const DEVICE_TYPES = [
  { key:'wind',   label:'Climatización',    Icon:LuWind,         iconColor:"#3B82F6", category:"Climatización",    catColor:"#3B82F6", catBg:"#1E3A5F", catColorLight:"#1D4ED8", catBgLight:"#DBEAFE" },
  { key:'tv',     label:'Entretenimiento',  Icon:LuTv,           iconColor:"#8B5CF6", category:"Entretenimiento",  catColor:"#8B5CF6", catBg:"#2D1F5E", catColorLight:"#7C3AED", catBgLight:"#EDE9FE" },
  { key:'fridge', label:'Cocina',           Icon:LuRefrigerator, iconColor:"#10B981", category:"Cocina",           catColor:"#10B981", catBg:"#1A2D20", catColorLight:"#059669", catBgLight:"#DCFCE7" },
  { key:'fan',    label:'Electrodoméstico', Icon:LuFan,          iconColor:"#F59E0B", category:"Electrodoméstico", catColor:"#F59E0B", catBg:"#2D2010", catColorLight:"#D97706", catBgLight:"#FEF3C7" },
  { key:'shower', label:'Calentador',       Icon:LuShowerHead,   iconColor:"#3B82F6", category:"Climatización",    catColor:"#3B82F6", catBg:"#1E3A5F", catColorLight:"#1D4ED8", catBgLight:"#DBEAFE" },
  { key:'lamp',   label:'Iluminación',      Icon:LuLamp,         iconColor:"#EAB308", category:"Iluminación",      catColor:"#EAB308", catBg:"#2D2A10", catColorLight:"#CA8A04", catBgLight:"#FEF9C3" },
] as const;

type DeviceTypeKey = typeof DEVICE_TYPES[number]['key'];

// ─── Toggle (44 × 24) ─────────────────────────────────────────────

function ToggleMd({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <div onClick={onToggle} style={{
      position:"relative", flexShrink:0, cursor:"pointer",
      width:44, height:24, borderRadius:12, overflow:"hidden",
      background:on ? "#3B82F6" : t.toggleOffBg, transition:"background .2s",
    }}>
      <div style={{
        position:"absolute", top:3, width:18, height:18, borderRadius:9,
        background:on ? "#FFFFFF" : "#94A3B8",
        left:on ? 23 : 3, transition:"left .2s",
      }}/>
    </div>
  );
}

// ─── Register modal ───────────────────────────────────────────────

function RegisterModal({ isDark, onClose, onAdd }: {
  isDark: boolean;
  onClose: () => void;
  onAdd: (d: Omit<Device, 'id'>) => void;
}) {
  const t = useT();
  const [typeKey, setTypeKey] = useState<DeviceTypeKey>('wind');
  const [name,    setName]    = useState('');
  const [watts,   setWatts]   = useState('');
  const [mac,     setMac]     = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const today  = new Date();
  const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  function handleSubmit() {
    if (!name.trim() || !watts) return;
    const type = DEVICE_TYPES.find(x => x.key === typeKey)!;
    const macVal = mac.trim() || Array.from({length:6}, () =>
      Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase()
    ).join(':');
    onAdd({
      Icon: type.Icon, iconColor: type.iconColor,
      name: name.trim(), category: type.category,
      catColor: type.catColor, catBg: type.catBg,
      catColorLight: type.catColorLight, catBgLight: type.catBgLight,
      watts: Number(watts), on: false, mac: macVal, date: dateStr,
    });
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 12px', borderRadius:8,
    border:`1px solid ${t.cardBorder}`,
    background:t.pageBg, color:t.textPrimary,
    fontSize:13, outline:'none', boxSizing:'border-box',
  };

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:'rgba(0,0,0,0.55)', backdropFilter:'blur(2px)',
      }}
    >
      <div style={{
        width:480, maxWidth:'calc(100vw - 32px)',
        background:t.cardBg, border:`1px solid ${t.cardBorder}`,
        borderRadius:16, padding:24, display:'flex', flexDirection:'column', gap:20,
        boxShadow:'0 24px 48px rgba(0,0,0,0.35)',
      }}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <p style={{margin:0, fontSize:17, fontWeight:700, color:t.textPrimary}}>Registrar Dispositivo</p>
            <p style={{margin:0, fontSize:12, color:t.textTertiary, marginTop:2}}>Completa los datos del nuevo dispositivo</p>
          </div>
          <button onClick={onClose} style={{
            width:32, height:32, borderRadius:8, border:`1px solid ${t.cardBorder}`,
            background:t.pageBg, cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <LuX size={15} color={t.textTertiary}/>
          </button>
        </div>

        {/* Device type grid */}
        <div>
          <p style={{margin:'0 0 10px', fontSize:12, fontWeight:600, color:t.textSecondary}}>Tipo de dispositivo</p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            {DEVICE_TYPES.map(({ key, label, Icon, iconColor }) => {
              const sel = key === typeKey;
              return (
                <button key={key} onClick={() => setTypeKey(key)} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  padding:'12px 8px', borderRadius:10, cursor:'pointer',
                  border:`1.5px solid ${sel ? iconColor : t.cardBorder}`,
                  background:sel ? (isDark ? `${iconColor}18` : `${iconColor}14`) : t.pageBg,
                  transition:'border-color .15s, background .15s',
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:10,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:sel ? (isDark ? `${iconColor}30` : `${iconColor}20`) : t.cardBorder,
                  }}>
                    <Icon size={18} color={sel ? iconColor : t.textTertiary}/>
                  </div>
                  <span style={{fontSize:10, fontWeight:sel ? 600 : 400,
                    color:sel ? iconColor : t.textSecondary, textAlign:'center'}}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fields */}
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div>
            <label style={{display:'block', fontSize:12, fontWeight:600,
              color:t.textSecondary, marginBottom:6}}>Nombre del dispositivo *</label>
            <input style={inp} placeholder="Ej: AC Cuarto principal"
              value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div style={{display:'flex', gap:12}}>
            <div style={{flex:1}}>
              <label style={{display:'block', fontSize:12, fontWeight:600,
                color:t.textSecondary, marginBottom:6}}>Vataje (W) *</label>
              <input style={inp} type="number" placeholder="Ej: 1500" min={1}
                value={watts} onChange={e => setWatts(e.target.value)}/>
            </div>
            <div style={{flex:1}}>
              <label style={{display:'block', fontSize:12, fontWeight:600,
                color:t.textSecondary, marginBottom:6}}>Dirección MAC</label>
              <input style={inp} placeholder="Auto-generada si vacía"
                value={mac} onChange={e => setMac(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1, background:t.divider}}/>

        {/* Footer */}
        <div style={{display:'flex', gap:10, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{
            padding:'10px 20px', borderRadius:8, border:`1px solid ${t.cardBorder}`,
            background:'transparent', color:t.textSecondary, fontSize:13,
            fontWeight:600, cursor:'pointer',
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={!name.trim() || !watts} style={{
            padding:'10px 20px', borderRadius:8, border:'none',
            background: name.trim() && watts ? '#3B82F6' : t.barTrack,
            color: name.trim() && watts ? '#FFFFFF' : t.textTertiary,
            fontSize:13, fontWeight:600, cursor: name.trim() && watts ? 'pointer' : 'default',
            transition:'background .15s, color .15s',
          }}>Registrar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Device card ──────────────────────────────────────────────────

function DeviceCard({ d, isDark, onToggle }: { d: Device; isDark: boolean; onToggle: () => void }) {
  const t = useT();
  const catColor = isDark ? d.catColor : d.catColorLight;
  const catBg    = isDark ? d.catBg    : d.catBgLight;
  const wattsStr = d.watts >= 1000 ? `${(d.watts/1000).toFixed(1)} kW` : `${d.watts} W`;
  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:10,
      padding:16, borderRadius:12,
      background:t.cardBg, border:`1px solid ${t.cardBorder}`,
    }}>
      {/* Header row */}
      <div style={{display:"flex", alignItems:"center", gap:10}}>
        <div style={{
          width:40, height:40, borderRadius:10, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:t.deviceIconBg,
        }}>
          <d.Icon size={20} color={d.on ? d.iconColor : t.navInactiveIcon}/>
        </div>
        <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column", gap:3}}>
          <span style={{fontSize:13, fontWeight:600, color:t.textPrimary,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{d.name}</span>
          <span style={{
            fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:4,
            alignSelf:"flex-start", color:catColor, background:catBg,
          }}>{d.category}</span>
        </div>
        <ToggleMd on={d.on} onToggle={onToggle}/>
      </div>

      {/* Divider */}
      <div style={{height:1, background:t.divider}}/>

      {/* Stats */}
      <div style={{display:"flex", gap:8}}>
        <div style={{flex:1, display:"flex", flexDirection:"column", gap:2}}>
          <span style={{fontSize:10, color:t.statLabel}}>Vataje</span>
          <span style={{fontSize:13, fontWeight:600,
            color:d.on ? "#10B981" : t.statLabel}}>{d.on ? wattsStr : `${d.watts} W`}</span>
        </div>
        <div style={{flex:1, display:"flex", flexDirection:"column", gap:2}}>
          <span style={{fontSize:10, color:t.statLabel}}>Estado</span>
          <span style={{fontSize:13, fontWeight:600,
            color:d.on ? "#10B981" : "#EF4444"}}>{d.on ? "Encendido" : "Apagado"}</span>
        </div>
      </div>

      {/* Footer: MAC + date */}
      <div style={{display:"flex", alignItems:"center", gap:6}}>
        <span style={{fontSize:10, color:t.statLabel}}>MAC:</span>
        <span style={{fontSize:10, fontWeight:500, color:t.textTertiary}}>{d.mac}</span>
        <div style={{flex:1}}/>
        <span style={{fontSize:10, color:t.statLabel}}>{d.date}</span>
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (page: AppPage) => void }) {
  const t = useT();
  const nav = [
    {label:"Dashboard",        icon:LuGauge,    key:"dashboard",    page:"dashboard" as AppPage},
    {label:"Dispositivos",     icon:LuCpu,      key:"dispositivos", page:"devices"  as AppPage},
    {label:"Reportes",         icon:LuChartBar, key:"reportes",     page:"reports" as AppPage},
    {label:"Reglas de Ahorro", icon:LuZapOff,   key:"reglas",       page:"rules" as AppPage},
  ];
  return (
    <aside style={{
      width:240, flexShrink:0, position:"sticky", top:0, alignSelf:"flex-start",
      height:"100vh", display:"flex", flexDirection:"column",
      background:t.sidebarBg, borderRight:`1px solid ${t.sidebarBorder}`,
    }}>
      <div style={{height:72, flexShrink:0, display:"flex", alignItems:"center",
        gap:10, padding:"0 20px", borderBottom:`1px solid ${t.sidebarBorder}`,
        background:t.logoBg}}>
        <LuZap size={22} color="#3B82F6" fill="#3B82F6"/>
        <span style={{fontSize:18, fontWeight:700, color:t.textPrimary}}>EnergyIQ</span>
      </div>
      <nav style={{padding:12, display:"flex", flexDirection:"column", gap:4}}>
        {nav.map(({label,icon:Icon,key,page}) => {
          const on = key === active;
          return (
            <button key={key} onClick={() => page && onNavigate(page)} style={{
              display:"flex", alignItems:"center", gap:10,
              height:44, padding:"0 12px", width:"100%",
              border:"none", cursor:page ? "pointer" : "default", borderRadius:8,
              background:on ? t.navActiveBg : "transparent",
            }}>
              <Icon size={18} color={on ? t.navActiveIcon : t.navInactiveIcon}/>
              <span style={{fontSize:13, fontWeight:600,
                color:on ? t.navActiveText : t.navInactiveText}}>{label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{flex:1}}/>
      <div style={{height:72, flexShrink:0, display:"flex", alignItems:"center",
        gap:10, padding:"0 16px", borderTop:`1px solid ${t.sidebarBorder}`}}>
        <div style={{width:36, height:36, borderRadius:"50%", flexShrink:0,
          background:"#3B82F6", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:12, fontWeight:700, color:"#FFFFFF"}}>CM</div>
        <span style={{fontSize:12, fontWeight:600, color:t.textPrimary}}>Carlos Méndez</span>
      </div>
    </aside>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────

function MobileHeader({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <header style={{
      height:60, flexShrink:0, display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 20px",
      background:t.sidebarBg, borderBottom:`1px solid ${t.sidebarBorder}`,
    }}>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <div style={{width:28, height:28, borderRadius:6, display:"flex", alignItems:"center",
          justifyContent:"center", background:"linear-gradient(135deg,#3B82F6 0%,#06B6D4 100%)"}}>
          <LuZap size={14} color="#fff" fill="#fff"/>
        </div>
        <span style={{fontSize:16, fontWeight:700, color:t.textPrimary}}>EnergyIQ</span>
      </div>
      <div style={{display:"flex", alignItems:"center", gap:8}}>
        <div onClick={onToggle} style={{
          position:"relative", width:44, height:24, borderRadius:12, cursor:"pointer",
          background:t.pillBg, border:`1px solid ${t.pillBorder}`,
        }}>
          <div style={{
            position:"absolute", top:2, left:isDark ? 2 : 20,
            width:20, height:20, borderRadius:"50%",
            background:isDark ? "#3B82F6" : "#F59E0B",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"left .2s, background .2s",
          }}>
            {isDark ? <LuMoon size={10} color="#fff"/> : <LuSun size={10} color="#fff"/>}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────

function MobileBottomNav({ active, onNavigate }: { active: string; onNavigate: (page: AppPage) => void }) {
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
      height:64, flexShrink:0, display:"flex", alignItems:"center", padding:"0 8px",
      background:t.sidebarBg, borderTop:`1px solid ${t.sidebarBorder}`,
    }}>
      {items.map(({key,label,page,Icon}) => {
        const on = key === active;
        return (
          <div key={key} onClick={() => page && onNavigate(page)} style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:4, padding:"6px 0",
            cursor:page ? "pointer" : "default",
          }}>
            <div style={{
              width:28, height:28, borderRadius:8, display:"flex",
              alignItems:"center", justifyContent:"center",
              background:on ? t.mNavActiveBg : "transparent",
            }}>
              <Icon size={18} color={on ? t.navActiveIcon : t.navInactiveIcon}/>
            </div>
            <span style={{fontSize:9, fontWeight:on ? 600 : 400,
              color:on ? t.navActiveText : t.navInactiveText}}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

// ─── Theme toggle pill (desktop header) ───────────────────────────

function ThemePill({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <div onClick={onToggle} style={{
      position:"relative", width:52, height:28, borderRadius:14, flexShrink:0,
      background:t.pillBg, border:`1px solid ${t.pillBorder}`, cursor:"pointer",
    }}>
      <div style={{
        position:"absolute", top:3, left:isDark ? 3 : 27,
        width:22, height:22, borderRadius:"50%",
        background:isDark ? "#3B82F6" : "#F59E0B",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"left .2s, background .2s",
      }}>
        {isDark ? <LuMoon size={12} color="#fff"/> : <LuSun size={12} color="#fff"/>}
      </div>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────

function KpiCard({ Icon, value, label, sub, valueColor, iconBg, bg, t }: {
  Icon: LuIcon; value: string; label: string; sub: string;
  valueColor: string; iconBg: string; bg?: string; t: Theme;
}) {
  return (
    <div style={{
      flex:1, minWidth:0, display:"flex", alignItems:"center", gap:12,
      height:90, padding:16, borderRadius:12,
      background:bg ?? t.cardBg, border:`1px solid ${t.cardBorder}`,
    }}>
      <div style={{
        width:40, height:40, borderRadius:20, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:iconBg,
      }}>
        <Icon size={18} color={valueColor}/>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:4}}>
        <span style={{fontSize:22, fontWeight:700, color:valueColor}}>{value}</span>
        <span style={{fontSize:11, color:"#64748B"}}>{label}</span>
        <span style={{fontSize:10, color:"#475569"}}>{sub}</span>
      </div>
    </div>
  );
}

// ─── Desktop content ──────────────────────────────────────────────

function DesktopContent({ devices, isDark, onToggleDevice, onToggleTheme, onNavigate, onOpenModal }: {
  devices: Device[];
  isDark: boolean;
  onToggleDevice: (id: number) => void;
  onToggleTheme: () => void;
  onNavigate: (page: AppPage) => void;
  onOpenModal: () => void;
}) {
  const t = useT();
  const activeCount   = devices.filter(d => d.on).length;
  const inactiveCount = devices.filter(d => !d.on).length;
  const totalWatts    = devices.filter(d => d.on).reduce((s, d) => s + d.watts, 0);
  const consumoKw     = (totalWatts / 1000).toFixed(2);

  const kpiIconBg1 = isDark ? "#1E3A5F" : "#DBEAFE";
  const kpiIconBg2 = isDark ? "#1A3328" : "#DCFCE7";
  const kpiIconBg3 = isDark ? "#2D2010" : "#FEF3C7";
  const kpiIconBg4 = isDark ? "#1E3A5F" : "#DBEAFE";

  return (
    <main style={{
      flex:1, minWidth:0, display:"flex", flexDirection:"column",
      background:t.pageBg, overflow:"hidden",
    }}>
      {/* Header */}
      <div style={{
        height:64, flexShrink:0, display:"flex", alignItems:"center",
        padding:"0 24px", gap:12,
        background:t.sidebarBg, borderBottom:`1px solid ${t.sidebarBorder}`,
      }}>
        <div style={{display:"flex", flexDirection:"column", gap:2, flex:1}}>
          <span style={{fontSize:20, fontWeight:700, color:t.textPrimary}}>Dispositivos</span>
          <span style={{fontSize:12, color:t.textTertiary}}>Inicio / Dispositivos</span>
        </div>
        {/* Date badge */}
        <div style={{display:"flex", alignItems:"center", gap:6, padding:"6px 12px",
          borderRadius:8, background:t.dateBadgeBg}}>
          <span>📅</span>
          <span style={{fontSize:12, color:t.dateBadgeText}}>Mayo 2026</span>
        </div>
        {/* Register button */}
        <button onClick={onOpenModal} style={{
          display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
          borderRadius:8, border:"none", cursor:"pointer",
          background:"#3B82F6", color:"#FFFFFF",
        }}>
          <span style={{fontSize:14, fontWeight:700}}>＋</span>
          <span style={{fontSize:13, fontWeight:600}}>Registrar Dispositivo</span>
        </button>
        <ThemePill isDark={isDark} onToggle={onToggleTheme}/>
      </div>

      {/* Body */}
      <div style={{flex:1, minHeight:0, overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:20}}>
        {/* KPI row */}
        <div style={{display:"flex", gap:16, flexShrink:0}}>
          <KpiCard Icon={LuCpu}      value={String(devices.length)} label="Total Dispositivos" sub="En el hogar"        valueColor={t.textPrimary} iconBg={kpiIconBg1} bg={isDark ? undefined : "linear-gradient(135deg,#FFFFFF 0%,#DBEAFE 100%)"} t={t}/>
          <KpiCard Icon={LuActivity} value={String(activeCount)}    label="Activos ahora"      sub="En funcionamiento"  valueColor="#10B981"       iconBg={kpiIconBg2} bg={isDark ? undefined : "linear-gradient(135deg,#FFFFFF 0%,#DCFCE7 100%)"} t={t}/>
          <KpiCard Icon={LuZapOff}   value={String(inactiveCount)}  label="Inactivos"           sub="Apagados"           valueColor="#F59E0B"       iconBg={kpiIconBg3} bg={isDark ? undefined : "linear-gradient(135deg,#FFFFFF 0%,#FEF3C7 100%)"} t={t}/>
          <KpiCard Icon={LuZap}      value={`${consumoKw} kW`}      label="Consumo actual"      sub="Vataje total activo" valueColor="#3B82F6"      iconBg={kpiIconBg4} bg={isDark ? undefined : "linear-gradient(135deg,#FFFFFF 0%,#DBEAFE 100%)"} t={t}/>
        </div>

        {/* Device grid: 3 cols, scrolls with the body */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16}}>
          {devices.map(d => (
            <DeviceCard key={d.id} d={d} isDark={isDark} onToggle={() => onToggleDevice(d.id)}/>
          ))}
        </div>
      </div>
    </main>
  );
}

// ─── Mobile content ───────────────────────────────────────────────

function MobileContent({ devices, isDark, onToggleDevice, onOpenModal }: {
  devices: Device[];
  isDark: boolean;
  onToggleDevice: (id: number) => void;
  onOpenModal: () => void;
}) {
  const t = useT();
  const activeCount   = devices.filter(d => d.on).length;
  const inactiveCount = devices.filter(d => !d.on).length;
  const totalWatts    = devices.filter(d => d.on).reduce((s, d) => s + d.watts, 0);
  const consumoKw     = (totalWatts / 1000).toFixed(2);

  const kpiIconBg1 = isDark ? "#1E3A5F" : "#DBEAFE";
  const kpiIconBg2 = isDark ? "#1A3328" : "#DCFCE7";
  const kpiIconBg3 = isDark ? "#2D2010" : "#FEF3C7";
  const kpiIconBg4 = isDark ? "#1E3A5F" : "#DBEAFE";

  const kpis = [
    {Icon:LuCpu,      value:String(devices.length), label:"Total",    sub:"En el hogar",       vColor:t.textPrimary, iBg:kpiIconBg1, grad:"linear-gradient(135deg,#FFFFFF 0%,#DBEAFE 100%)"},
    {Icon:LuActivity, value:String(activeCount),    label:"Activos",  sub:"En funcionamiento", vColor:"#10B981",     iBg:kpiIconBg2, grad:"linear-gradient(135deg,#FFFFFF 0%,#DCFCE7 100%)"},
    {Icon:LuZapOff,   value:String(inactiveCount),  label:"Inactivos",sub:"Apagados",          vColor:"#F59E0B",     iBg:kpiIconBg3, grad:"linear-gradient(135deg,#FFFFFF 0%,#FEF3C7 100%)"},
    {Icon:LuZap,      value:`${consumoKw} kW`,      label:"Consumo",  sub:"Vataje activo",     vColor:"#3B82F6",     iBg:kpiIconBg4, grad:"linear-gradient(135deg,#FFFFFF 0%,#DBEAFE 100%)"},
  ];

  return (
    <main style={{
      flex:1, minHeight:0, overflowY:"auto",
      padding:16, display:"flex", flexDirection:"column", gap:14,
    }}>
      {/* Title row */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div>
          <p style={{fontSize:18, fontWeight:700, color:t.textPrimary, margin:0}}>Dispositivos</p>
          <p style={{fontSize:12, color:t.textTertiary, margin:0, marginTop:2}}>Inicio / Dispositivos</p>
        </div>
        <button onClick={onOpenModal} style={{
          display:"flex", alignItems:"center", gap:4, padding:"8px 12px",
          borderRadius:8, border:"none", cursor:"pointer",
          background:"#3B82F6", color:"#FFFFFF", fontSize:12, fontWeight:600,
        }}>＋ Registrar</button>
      </div>

      {/* KPI 2×2 */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        {kpis.map(({Icon, value, label, sub, vColor, iBg, grad}) => (
          <div key={label} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:14, borderRadius:12,
            background:isDark ? t.cardBg : grad, border:`1px solid ${t.cardBorder}`,
          }}>
            <div style={{
              width:36, height:36, borderRadius:18, flexShrink:0,
              display:"flex", alignItems:"center", justifyContent:"center",
              background:iBg,
            }}>
              <Icon size={16} color={vColor}/>
            </div>
            <div style={{display:"flex", flexDirection:"column", gap:2}}>
              <span style={{fontSize:18, fontWeight:700, color:vColor}}>{value}</span>
              <span style={{fontSize:10, color:t.statLabel}}>{label}</span>
              <span style={{fontSize:9, color:t.textTertiary}}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Device list */}
      <div style={{display:"flex", flexDirection:"column", gap:10}}>
        <span style={{fontSize:13, fontWeight:600, color:t.textPrimary}}>Todos los Dispositivos</span>
        {devices.map(d => {
          const catColor = isDark ? d.catColor : d.catColorLight;
          const catBg    = isDark ? d.catBg    : d.catBgLight;
          const wattsStr = `${d.watts} W`;
          return (
            <div key={d.id} style={{
              display:"flex", flexDirection:"column", gap:10,
              padding:14, borderRadius:12,
              background:t.cardBg, border:`1px solid ${t.cardBorder}`,
            }}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:t.deviceIconBg,
                }}>
                  <d.Icon size={20} color={d.on ? d.iconColor : t.navInactiveIcon}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <p style={{fontSize:13, fontWeight:600, color:t.textPrimary, margin:0,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{d.name}</p>
                  <span style={{
                    fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:4,
                    color:catColor, background:catBg,
                  }}>{d.category}</span>
                </div>
                <ToggleMd on={d.on} onToggle={() => onToggleDevice(d.id)}/>
              </div>
              <div style={{height:1, background:t.divider}}/>
              <div style={{display:"flex", gap:16}}>
                <div>
                  <p style={{fontSize:10, color:t.statLabel, margin:0}}>Vataje</p>
                  <p style={{fontSize:12, fontWeight:600, color:d.on ? "#10B981" : t.statLabel, margin:0}}>{wattsStr}</p>
                </div>
                <div>
                  <p style={{fontSize:10, color:t.statLabel, margin:0}}>Estado</p>
                  <p style={{fontSize:12, fontWeight:600, color:d.on ? "#10B981" : "#EF4444", margin:0}}>{d.on ? "Encendido" : "Apagado"}</p>
                </div>
                <div style={{flex:1}}/>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:9, color:t.statLabel, margin:0}}>MAC</p>
                  <p style={{fontSize:9, color:t.textTertiary, margin:0}}>{d.mac}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{height:8}}/>
    </main>
  );
}

// ─── Devices page ─────────────────────────────────────────────────

export default function Devices() {
  const { isDark, toggle } = useThemeToggle();
  const t = useT();
  const navigate = useNavigate();
  const goTo = (page: AppPage) => navigate(pageToPath[page]);
  const [devices, setDevices]     = useState(initDevices);
  const [isMobile, setIsMobile]   = useState(() => window.innerWidth < 768);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleDevice = (id: number) => setDevices(p => p.map(d => d.id === id ? {...d, on:!d.on} : d));
  const addDevice    = (d: Omit<Device, 'id'>) => {
    setDevices(p => [...p, { ...d, id: p.length ? Math.max(...p.map(x => x.id)) + 1 : 1 }]);
    setShowModal(false);
  };

  return (
    <div data-theme={isDark ? "dark" : "light"} style={{
      display:"flex",
      flexDirection:isMobile ? "column" : "row",
      ...(isMobile ? {height:"100vh", overflow:"hidden"} : {minHeight:"100%"}),
      background:t.pageBg,
    }}>
      {showModal && (
        <RegisterModal isDark={isDark} onClose={() => setShowModal(false)} onAdd={addDevice}/>
      )}

      {isMobile ? (
        <>
          <MobileHeader isDark={isDark} onToggle={toggle}/>
          <MobileContent devices={devices} isDark={isDark} onToggleDevice={toggleDevice} onOpenModal={() => setShowModal(true)}/>
          <MobileBottomNav active="dispositivos" onNavigate={goTo}/>
        </>
      ) : (
        <>
          <Sidebar active="dispositivos" onNavigate={goTo}/>
          <DesktopContent
            devices={devices}
            isDark={isDark}
            onToggleDevice={toggleDevice}
            onToggleTheme={toggle}
            onNavigate={goTo}
            onOpenModal={() => setShowModal(true)}
          />
        </>
      )}
    </div>
  );
}
