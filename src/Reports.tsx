import { useEffect, useState } from 'react';
import {
  LuZap, LuGauge, LuCpu, LuChartBar, LuZapOff,
  LuBell, LuMoon, LuSun, LuUser,
  LuTrendingDown, LuDollarSign,
} from 'react-icons/lu';
import { dark, light, ThemeCtx, useT, type AppPage } from './theme';

// ─── Static data ──────────────────────────────────────────────────

const BAR_MAX = 180;
const barData = [
  { month:'Dic', real: 80, proj:100 },
  { month:'Ene', real: 95, proj:100 },
  { month:'Feb', real:110, proj:105 },
  { month:'Mar', real:130, proj:110 },
  { month:'Abr', real:155, proj:120 },
  { month:'May', real:180, proj:130 },
];

const breakdown = [
  { name:'Aire Acondicionado', pct:38 },
  { name:'Calentador',         pct:24 },
  { name:'Lavadora',           pct:18 },
  { name:'Refrigerador',       pct:12 },
  { name:'Iluminación',         pct: 8 },
];

const tableRows = [
  { name:'Aire Acond.',  type:'Climatización',   kwh:'185.2', cost:'$11.11', pct:'38%', up:true  },
  { name:'Calentador',   type:'Calefacción',      kwh:'117.0', cost:'$7.02',  pct:'24%', up:false },
  { name:'Lavadora',     type:'Electrodoméstico', kwh:'87.7',  cost:'$5.26',  pct:'18%', up:false },
  { name:'Refrigerador', type:'Electrodoméstico', kwh:'58.5',  cost:'$3.51',  pct:'12%', up:true  },
  { name:'Iluminación',  type:'Iluminación',      kwh:'39.0',  cost:'$2.34',  pct:'8%',  up:false },
];

// ─── Sidebar ──────────────────────────────────────────────────────

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (p: AppPage) => void }) {
  const t = useT();
  const nav = [
    { label:'Dashboard',        Icon:LuGauge,    key:'dashboard',    page:'dashboard' as AppPage },
    { label:'Dispositivos',     Icon:LuCpu,      key:'dispositivos', page:'devices'   as AppPage },
    { label:'Reportes',         Icon:LuChartBar, key:'reportes',     page:'reports'   as AppPage },
    { label:'Reglas de Ahorro', Icon:LuZapOff,   key:'reglas',       page:'rules'   as AppPage },
  ];
  return (
    <aside style={{
      width:240, flexShrink:0, position:'sticky', top:0, alignSelf:'flex-start',
      height:'100vh', display:'flex', flexDirection:'column',
      background:t.sidebarBg, borderRight:`1px solid ${t.sidebarBorder}`,
    }}>
      <div style={{
        height:72, flexShrink:0, display:'flex', alignItems:'center',
        gap:10, padding:'0 20px', borderBottom:`1px solid ${t.sidebarBorder}`,
        background:t.logoBg,
      }}>
        <LuZap size={22} color="#3B82F6" fill="#3B82F6"/>
        <span style={{fontSize:18, fontWeight:700, color:t.textPrimary}}>EnergyIQ</span>
      </div>
      <nav style={{padding:12, display:'flex', flexDirection:'column', gap:4}}>
        {nav.map(({ label, Icon, key, page }) => {
          const on = key === active;
          return (
            <button key={key} onClick={() => page && onNavigate(page)} style={{
              display:'flex', alignItems:'center', gap:10,
              height:44, padding:'0 12px', width:'100%',
              border:'none', cursor:page ? 'pointer' : 'default', borderRadius:8,
              background:on ? t.navActiveBg : 'transparent',
            }}>
              <Icon size={18} color={on ? t.navActiveIcon : t.navInactiveIcon}/>
              <span style={{fontSize:13, fontWeight:600,
                color:on ? t.navActiveText : t.navInactiveText}}>{label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{flex:1}}/>
      <div style={{
        height:72, flexShrink:0, display:'flex', alignItems:'center',
        gap:10, padding:'0 16px', borderTop:`1px solid ${t.sidebarBorder}`,
      }}>
        <div style={{
          width:36, height:36, borderRadius:'50%', flexShrink:0,
          background:'#3B82F6', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:12, fontWeight:700, color:'#FFFFFF',
        }}>CM</div>
        <span style={{fontSize:12, fontWeight:600, color:t.textPrimary}}>Carlos Méndez</span>
      </div>
    </aside>
  );
}

// ─── Mobile header ────────────────────────────────────────────────

function MobileHeader({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <header style={{
      height:60, flexShrink:0, display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 20px',
      background:t.sidebarBg, borderBottom:`1px solid ${t.sidebarBorder}`,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div style={{
          width:28, height:28, borderRadius:6, display:'flex', alignItems:'center',
          justifyContent:'center', background:'linear-gradient(135deg,#3B82F6 0%,#06B6D4 100%)',
        }}>
          <LuZap size={14} color="#fff" fill="#fff"/>
        </div>
        <span style={{fontSize:16, fontWeight:700, color:t.textPrimary}}>EnergyIQ</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <div onClick={onToggle} style={{
          position:'relative', width:44, height:24, borderRadius:12, cursor:'pointer',
          background:t.pillBg, border:`1px solid ${t.pillBorder}`,
        }}>
          <div style={{
            position:'absolute', top:2, left:isDark ? 2 : 20,
            width:20, height:20, borderRadius:'50%',
            background:isDark ? '#3B82F6' : '#F59E0B',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'left .2s, background .2s',
          }}>
            {isDark ? <LuMoon size={10} color="#fff"/> : <LuSun size={10} color="#fff"/>}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Mobile bottom nav ────────────────────────────────────────────

function MobileBottomNav({ active, onNavigate }: { active: string; onNavigate: (p: AppPage) => void }) {
  const t = useT();
  const items = [
    { key:'dashboard',    label:'Inicio',    page:'dashboard' as AppPage, Icon:LuGauge   },
    { key:'dispositivos', label:'Devices',   page:'devices'   as AppPage, Icon:LuCpu     },
    { key:'reportes',     label:'Reportes',  page:'reports'   as AppPage, Icon:LuChartBar},
    { key:'reglas',       label:'Reglas',    page:'rules'   as AppPage,   Icon:LuZapOff  },
    { key:'perfil',       label:'Perfil',    page: null,                  Icon:LuUser    },
  ];
  return (
    <nav style={{
      height:64, flexShrink:0, display:'flex', alignItems:'center', padding:'0 8px',
      background:t.sidebarBg, borderTop:`1px solid ${t.sidebarBorder}`,
    }}>
      {items.map(({ key, label, page, Icon }) => {
        const on = key === active;
        return (
          <div key={key} onClick={() => page && onNavigate(page)} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', gap:4, padding:'6px 0',
            cursor:page ? 'pointer' : 'default',
          }}>
            <div style={{
              width:28, height:28, borderRadius:8, display:'flex',
              alignItems:'center', justifyContent:'center',
              background:on ? t.mNavActiveBg : 'transparent',
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

// ─── Theme pill ───────────────────────────────────────────────────

function ThemePill({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <div onClick={onToggle} style={{
      position:'relative', width:52, height:28, borderRadius:14, flexShrink:0,
      background:t.pillBg, border:`1px solid ${t.pillBorder}`, cursor:'pointer',
    }}>
      <div style={{
        position:'absolute', top:3, left:isDark ? 3 : 27,
        width:22, height:22, borderRadius:'50%',
        background:isDark ? '#3B82F6' : '#F59E0B',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'left .2s, background .2s',
      }}>
        {isDark ? <LuMoon size={12} color="#fff"/> : <LuSun size={12} color="#fff"/>}
      </div>
    </div>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────

function BarChart({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const maxH = compact ? 100 : 150;
  return (
    <div style={{display:'flex', flexDirection:'column', gap:10, flex:1, minHeight:0}}>
      <div style={{display:'flex', gap:16}}>
        {[{c:'#3B82F6', l:'Real'}, {c:'#10B981', l:'Proyectado'}].map(s => (
          <div key={s.l} style={{display:'flex', alignItems:'center', gap:6}}>
            <div style={{width:10, height:10, borderRadius:2, background:s.c}}/>
            <span style={{fontSize:12, color:t.textSecondary}}>{s.l}</span>
          </div>
        ))}
      </div>
      <div style={{flex:1, display:'flex', alignItems:'flex-end', gap:compact ? 6 : 8, paddingBottom:4}}>
        {barData.map(({ month, real, proj }) => (
          <div key={month} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
            <div style={{
              width:'100%', display:'flex', justifyContent:'center',
              alignItems:'flex-end', gap:3, height:maxH,
            }}>
              <div style={{
                width:compact ? 10 : 13, borderRadius:'3px 3px 0 0',
                height:`${(real / BAR_MAX) * maxH}px`, background:'#3B82F6',
                transition:'height .3s',
              }}/>
              <div style={{
                width:compact ? 10 : 13, borderRadius:'3px 3px 0 0',
                height:`${(proj / BAR_MAX) * maxH}px`, background:'#10B981',
                transition:'height .3s',
              }}/>
            </div>
            <span style={{fontSize:10, color:t.chartAxisText}}>{month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Device breakdown bars ────────────────────────────────────────

function BreakdownBars() {
  const t = useT();
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12, flex:1}}>
      {breakdown.map(({ name, pct }) => (
        <div key={name} style={{display:'flex', flexDirection:'column', gap:5}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:12, color:t.textSecondary}}>{name}</span>
            <span style={{fontSize:12, fontWeight:700, color:t.textPrimary}}>{pct}%</span>
          </div>
          <div style={{height:4, borderRadius:2, background:t.barTrack, overflow:'hidden'}}>
            <div style={{height:'100%', borderRadius:2, width:`${pct}%`, background:'#3B82F6'}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Consumption table ────────────────────────────────────────────

function ConsumptionTable() {
  const t = useT();
  const cols = ['Dispositivo','Tipo','Consumo (kWh)','Costo','% del Total','Tendencia'];
  return (
    <div style={{display:'flex', flexDirection:'column', minWidth:0}}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', height:36, padding:'0 4px',
        borderBottom:`1px solid ${t.divider}`,
      }}>
        {cols.map(c => (
          <div key={c} style={{flex:1, minWidth:0, fontSize:11, color:t.statLabel, paddingRight:8}}>{c}</div>
        ))}
      </div>
      {/* Rows */}
      {tableRows.map((row, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', height:44, padding:'0 4px',
          borderBottom: i < tableRows.length - 1 ? `1px solid ${t.divider}` : 'none',
        }}>
          <div style={{flex:1, minWidth:0, fontSize:12, fontWeight:500, color:t.textPrimary, paddingRight:8}}>{row.name}</div>
          <div style={{flex:1, minWidth:0, fontSize:12, color:t.textSecondary, paddingRight:8}}>{row.type}</div>
          <div style={{flex:1, minWidth:0, fontSize:12, color:t.textPrimary, paddingRight:8}}>{row.kwh}</div>
          <div style={{flex:1, minWidth:0, fontSize:12, color:t.textPrimary, paddingRight:8}}>{row.cost}</div>
          <div style={{flex:1, minWidth:0, fontSize:12, color:t.textPrimary, paddingRight:8}}>{row.pct}</div>
          <div style={{flex:1, minWidth:0, fontSize:18, fontWeight:700, color:row.up ? '#EF4444' : '#10B981'}}>
            {row.up ? '↑' : '↓'}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop content ──────────────────────────────────────────────

function DesktopContent({ isDark, onToggleTheme }: {
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const t = useT();
  const kpiIconBgDark = '#1E3A5F';
  const kpis = [
    {
      label:'Consumo Total', value:'487.3 kWh', sub:'Este mes',
      vColor:t.textPrimary, Icon:LuZap,
      iBg:isDark ? kpiIconBgDark : '#DBEAFE',
      bg:isDark ? undefined : 'linear-gradient(135deg,#FFFFFF 0%,#DBEAFE 100%)',
    },
    {
      label:'Costo Estimado', value:'$29.24', sub:'Bs. 1,462/mes',
      vColor:'#F59E0B', Icon:LuDollarSign,
      iBg:isDark ? kpiIconBgDark : '#FEF3C7',
      bg:isDark ? undefined : 'linear-gradient(135deg,#FFFFFF 0%,#FEF3C7 100%)',
    },
    {
      label:'Ahorro Logrado', value:'18.5%', sub:'vs mes anterior',
      vColor:'#10B981', Icon:LuTrendingDown,
      iBg:isDark ? kpiIconBgDark : '#DCFCE7',
      bg:isDark ? undefined : 'linear-gradient(135deg,#FFFFFF 0%,#DCFCE7 100%)',
    },
  ];

  return (
    <main style={{
      flex:1, minWidth:0, display:'flex', flexDirection:'column',
      background:t.pageBg, overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        height:64, flexShrink:0, display:'flex', alignItems:'center',
        padding:'0 24px', gap:12,
        background:t.sidebarBg, borderBottom:`1px solid ${t.sidebarBorder}`,
      }}>
        <div style={{display:'flex', flexDirection:'column', gap:2, flex:1}}>
          <span style={{fontSize:20, fontWeight:700, color:t.textPrimary}}>Reportes</span>
          <span style={{fontSize:12, color:t.textTertiary}}>Inicio / Reportes</span>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
          borderRadius:8, background:t.dateBadgeBg,
        }}>
          <span>📅</span>
          <span style={{fontSize:12, color:t.dateBadgeText}}>Mayo 2026</span>
        </div>
        <ThemePill isDark={isDark} onToggle={onToggleTheme}/>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex:1, minHeight:0, overflowY:'auto',
        padding:24, display:'flex', flexDirection:'column', gap:20,
      }}>
        {/* KPI row */}
        <div style={{display:'flex', gap:16, flexShrink:0}}>
          {kpis.map(({ label, value, sub, vColor, Icon, iBg, bg }) => (
            <div key={label} style={{
              flex:1, minWidth:0, display:'flex', alignItems:'center', gap:12,
              height:90, padding:16, borderRadius:12,
              background:bg ?? t.cardBg, border:`1px solid ${t.cardBorder}`,
            }}>
              <div style={{
                width:40, height:40, borderRadius:20, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:iBg,
              }}>
                <Icon size={18} color={vColor}/>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:4}}>
                <span style={{fontSize:11, color:t.statLabel}}>{label}</span>
                <span style={{fontSize:22, fontWeight:700, color:vColor}}>{value}</span>
                <span style={{fontSize:11, color:t.textTertiary}}>{sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{display:'flex', gap:16, height:300, flexShrink:0}}>
          {/* Bar chart */}
          <div style={{
            flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:12,
            padding:16, borderRadius:12,
            background:t.cardBg, border:`1px solid ${t.cardBorder}`,
          }}>
            <span style={{fontSize:14, fontWeight:700, color:t.textPrimary, flexShrink:0}}>
              Consumo Real vs Proyectado
            </span>
            <BarChart/>
          </div>

          {/* Device breakdown */}
          <div style={{
            width:280, flexShrink:0, display:'flex', flexDirection:'column', gap:12,
            padding:16, borderRadius:12,
            background:t.cardBg, border:`1px solid ${t.cardBorder}`,
          }}>
            <span style={{fontSize:14, fontWeight:700, color:t.textPrimary, flexShrink:0}}>
              Por Dispositivo
            </span>
            <BreakdownBars/>
          </div>
        </div>

        {/* Consumption table */}
        <div style={{
          flexShrink:0, padding:16, borderRadius:12,
          background:t.cardBg, border:`1px solid ${t.cardBorder}`,
        }}>
          <span style={{
            display:'block', fontSize:14, fontWeight:700,
            color:t.textPrimary, marginBottom:12,
          }}>Detalle por Dispositivo</span>
          <ConsumptionTable/>
        </div>
      </div>
    </main>
  );
}

// ─── Mobile content ───────────────────────────────────────────────

function MobileContent({ isDark }: { isDark: boolean }) {
  const t = useT();
  const kpiIconBgDark = '#1E3A5F';
  const kpis = [
    {
      label:'Consumo Total', value:'487.3 kWh', sub:'Este mes',
      vColor:t.textPrimary, Icon:LuZap,
      iBg:isDark ? kpiIconBgDark : '#DBEAFE',
      grad:'linear-gradient(135deg,#FFFFFF 0%,#DBEAFE 100%)',
    },
    {
      label:'Costo Estimado', value:'$29.24', sub:'Bs. 1,462/mes',
      vColor:'#F59E0B', Icon:LuDollarSign,
      iBg:isDark ? kpiIconBgDark : '#FEF3C7',
      grad:'linear-gradient(135deg,#FFFFFF 0%,#FEF3C7 100%)',
    },
    {
      label:'Ahorro Logrado', value:'18.5%', sub:'vs mes anterior',
      vColor:'#10B981', Icon:LuTrendingDown,
      iBg:isDark ? kpiIconBgDark : '#DCFCE7',
      grad:'linear-gradient(135deg,#FFFFFF 0%,#DCFCE7 100%)',
    },
  ];

  return (
    <main style={{
      flex:1, minHeight:0, overflowY:'auto',
      padding:16, display:'flex', flexDirection:'column', gap:14,
    }}>
      {/* Title */}
      <div>
        <p style={{fontSize:18, fontWeight:700, color:t.textPrimary, margin:0}}>Reportes</p>
        <p style={{fontSize:12, color:t.textTertiary, margin:0, marginTop:2}}>Inicio / Reportes</p>
      </div>

      {/* KPI cards — vertical stack */}
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {kpis.map(({ label, value, sub, vColor, Icon, iBg, grad }) => (
          <div key={label} style={{
            display:'flex', alignItems:'center', gap:12, padding:14, borderRadius:12,
            background:isDark ? t.cardBg : grad, border:`1px solid ${t.cardBorder}`,
          }}>
            <div style={{
              width:40, height:40, borderRadius:20, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center', background:iBg,
            }}>
              <Icon size={18} color={vColor}/>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              <span style={{fontSize:11, color:t.statLabel}}>{label}</span>
              <span style={{fontSize:20, fontWeight:700, color:vColor}}>{value}</span>
              <span style={{fontSize:10, color:t.textTertiary}}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart card */}
      <div style={{
        padding:16, borderRadius:12,
        background:t.cardBg, border:`1px solid ${t.cardBorder}`,
      }}>
        <span style={{
          display:'block', fontSize:13, fontWeight:700,
          color:t.textPrimary, marginBottom:12,
        }}>Consumo Real vs Proyectado</span>
        <BarChart compact/>
      </div>

      {/* Breakdown card */}
      <div style={{
        padding:16, borderRadius:12,
        background:t.cardBg, border:`1px solid ${t.cardBorder}`,
      }}>
        <span style={{
          display:'block', fontSize:13, fontWeight:700,
          color:t.textPrimary, marginBottom:12,
        }}>Por Dispositivo</span>
        <BreakdownBars/>
      </div>

      {/* Mobile table — card list */}
      <div style={{
        padding:16, borderRadius:12,
        background:t.cardBg, border:`1px solid ${t.cardBorder}`,
      }}>
        <span style={{
          display:'block', fontSize:13, fontWeight:700,
          color:t.textPrimary, marginBottom:12,
        }}>Detalle por Dispositivo</span>
        <div style={{display:'flex', flexDirection:'column', gap:0}}>
          {tableRows.map((row, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10,
              paddingTop:10, paddingBottom:10,
              borderTop: i > 0 ? `1px solid ${t.divider}` : 'none',
            }}>
              <div style={{flex:1, minWidth:0}}>
                <p style={{margin:0, fontSize:12, fontWeight:600, color:t.textPrimary}}>{row.name}</p>
                <p style={{margin:0, fontSize:10, color:t.textSecondary, marginTop:1}}>{row.type}</p>
              </div>
              <div style={{textAlign:'right', flexShrink:0}}>
                <p style={{margin:0, fontSize:12, fontWeight:600, color:t.textPrimary}}>{row.kwh} kWh</p>
                <p style={{margin:0, fontSize:10, color:t.textSecondary, marginTop:1}}>{row.cost} · {row.pct}</p>
              </div>
              <div style={{
                width:28, flexShrink:0, textAlign:'center',
                fontSize:18, fontWeight:700,
                color:row.up ? '#EF4444' : '#10B981',
              }}>
                {row.up ? '↑' : '↓'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{height:8}}/>
    </main>
  );
}

// ─── Reports page ─────────────────────────────────────────────────

export default function Reports({ onNavigate }: { onNavigate: (p: AppPage) => void }) {
  const [isDark,   setIsDark]   = useState(() => localStorage.getItem('eq-theme') !== 'light');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const t = isDark ? dark : light;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('eq-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleTheme = () => setIsDark(p => !p);

  return (
    <ThemeCtx.Provider value={t}>
      <div data-theme={isDark ? 'dark' : 'light'} style={{
        display:'flex',
        flexDirection:isMobile ? 'column' : 'row',
        ...(isMobile ? {height:'100vh', overflow:'hidden'} : {minHeight:'100%'}),
        background:t.pageBg,
      }}>
        {isMobile ? (
          <>
            <MobileHeader isDark={isDark} onToggle={toggleTheme}/>
            <MobileContent isDark={isDark}/>
            <MobileBottomNav active="reportes" onNavigate={onNavigate}/>
          </>
        ) : (
          <>
            <Sidebar active="reportes" onNavigate={onNavigate}/>
            <DesktopContent isDark={isDark} onToggleTheme={toggleTheme}/>
          </>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
