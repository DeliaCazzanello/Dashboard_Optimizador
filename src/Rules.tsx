import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import {
  LuZap, LuGauge, LuCpu, LuChartBar, LuZapOff,
  LuBell, LuMoon, LuSun, LuUser,
  LuMove, LuBatteryCharging, LuWind,
} from 'react-icons/lu';
import { dark, light, ThemeCtx, useT, type AppPage } from './theme';

// ─── Types & data ─────────────────────────────────────────────────

type LuIcon = ComponentType<{ size?: number; color?: string }>;
type RuleTag = 'Ahorro' | 'Confort';
type FilterKey = 'Todas' | 'Activas' | 'Inactivas' | 'Ahorro' | 'Confort';

type Rule = {
  id: number; Icon: LuIcon; name: string;
  tag: RuleTag; condition: string; saving: string; on: boolean;
};

const initRules: Rule[] = [
  { id:1, Icon:LuMove,           name:'Apagar luces sin movimiento', tag:'Ahorro',  condition:'Si no hay movimiento en Sala por 10 min',  saving:'$3.20/mes',  on:true  },
  { id:2, Icon:LuMoon,           name:'AC a 24°C de noche',          tag:'Confort', condition:'Todos los días de 22:00 a 07:00',           saving:'$12.80/mes', on:true  },
  { id:3, Icon:LuZap,            name:'Reducir consumo en hora pico', tag:'Ahorro',  condition:'Lun-Vie de 18:00 a 21:00',                 saving:'$8.50/mes',  on:false },
  { id:4, Icon:LuSun,            name:'Encender luces al amanecer',  tag:'Confort', condition:'Detección de luz < 20%',                   saving:'$1.40/mes',  on:true  },
  { id:5, Icon:LuBatteryCharging,name:'Modo ausente automático',      tag:'Ahorro',  condition:'Todos los dispositivos offline > 30 min',  saving:'$15.60/mes', on:true  },
  { id:6, Icon:LuWind,           name:'Ventilación cruzada',         tag:'Ahorro',  condition:'Temperatura exterior < interior',           saving:'$6.10/mes',  on:false },
];

const TAG_DARK:  Record<RuleTag, { text: string; bg: string }> = {
  Ahorro:  { text:'#10B981', bg:'#10B98120' },
  Confort: { text:'#3B82F6', bg:'#3B82F620' },
};
const TAG_LIGHT: Record<RuleTag, { text: string; bg: string }> = {
  Ahorro:  { text:'#059669', bg:'#DCFCE7' },
  Confort: { text:'#1D4ED8', bg:'#DBEAFE' },
};

const parseSaving = (s: string) => parseFloat(s.replace('$','').replace('/mes',''));
const FILTERS: FilterKey[] = ['Todas','Activas','Inactivas','Ahorro','Confort'];

const DEVICES   = ['Aire Acondicionado','Televisor','Refrigerador','Lavadora','Calentador','Iluminación LED','Router WiFi','Monitor PC'];
const CONDITIONS= ['Sin movimiento > 10 min','Horario programado','Hora pico (18:00–21:00)','Temperatura < umbral','Sensor de luz < 20%','Todos offline > 30 min'];
const ACTIONS   = ['Apagar dispositivo','Reducir potencia 50%','Encender dispositivo','Ajustar temperatura','Activar modo ahorro'];

// ─── Toggle ───────────────────────────────────────────────────────

function RuleToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <div onClick={onToggle} style={{
      position:'relative', flexShrink:0, cursor:'pointer',
      width:36, height:20, borderRadius:10, overflow:'hidden',
      background:on ? '#10B981' : t.toggleOffBg, transition:'background .2s',
    }}>
      <div style={{
        position:'absolute', top:2, width:16, height:16, borderRadius:'50%',
        background:'#FFFFFF', left:on ? 18 : 2, transition:'left .2s',
      }}/>
    </div>
  );
}

// ─── Rule card ────────────────────────────────────────────────────

function RuleCard({ rule, isDark, onToggle }: { rule: Rule; isDark: boolean; onToggle: () => void }) {
  const t = useT();
  const tag = isDark ? TAG_DARK[rule.tag] : TAG_LIGHT[rule.tag];
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'0 16px',
      height:72, borderRadius:12, flexShrink:0,
      background:t.cardBg, border:`1px solid ${t.cardBorder}`,
    }}>
      <div style={{
        width:40, height:40, borderRadius:10, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        background:t.ruleIconBg,
      }}>
        <rule.Icon size={18} color={rule.on ? '#3B82F6' : t.navInactiveIcon}/>
      </div>
      <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:4}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
          <span style={{fontSize:13, fontWeight:600, color:t.textPrimary}}>{rule.name}</span>
          <span style={{
            fontSize:10, padding:'2px 8px', borderRadius:10,
            color:tag.text, background:tag.bg, flexShrink:0,
          }}>{rule.tag}</span>
        </div>
        <span style={{fontSize:11, color:t.textTertiary,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{rule.condition}</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0}}>
        <RuleToggle on={rule.on} onToggle={onToggle}/>
        <span style={{fontSize:10, color:'#10B981', fontWeight:500}}>{rule.saving}</span>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (p: AppPage) => void }) {
  const t = useT();
  const nav = [
    { label:'Dashboard',        Icon:LuGauge,    key:'dashboard',    page:'dashboard' as AppPage },
    { label:'Dispositivos',     Icon:LuCpu,      key:'dispositivos', page:'devices'   as AppPage },
    { label:'Reportes',         Icon:LuChartBar, key:'reportes',     page:'reports'   as AppPage },
    { label:'Reglas de Ahorro', Icon:LuZapOff,   key:'reglas',       page:'rules'     as AppPage },
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
              border:'none', cursor:'pointer', borderRadius:8,
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
      <div style={{
        width:36, height:36, borderRadius:8, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:5, cursor:'pointer',
        background:t.bellBg, border:`1px solid ${t.bellBorder}`,
      }}>
        {[0,1,2].map(i => <div key={i} style={{width:18,height:2,borderRadius:1,background:t.textTertiary}}/>)}
      </div>
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
        <div style={{
          width:34, height:34, borderRadius:8, display:'flex', alignItems:'center',
          justifyContent:'center', background:t.bellBg, border:`1px solid ${t.bellBorder}`,
        }}>
          <LuBell size={16} color={t.textTertiary}/>
        </div>
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
    { key:'dashboard',    label:'Inicio',   page:'dashboard' as AppPage, Icon:LuGauge   },
    { key:'dispositivos', label:'Devices',  page:'devices'   as AppPage, Icon:LuCpu     },
    { key:'reportes',     label:'Reportes', page:'reports'   as AppPage, Icon:LuChartBar},
    { key:'reglas',       label:'Reglas',   page:'rules'     as AppPage, Icon:LuZapOff  },
    { key:'perfil',       label:'Perfil',   page: null,                  Icon:LuUser    },
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
            justifyContent:'center', gap:4, padding:'6px 0', cursor:page ? 'pointer' : 'default',
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

// ─── Summary card ─────────────────────────────────────────────────

function SummaryCard({ rules }: { rules: Rule[] }) {
  const t = useT();
  const active  = rules.filter(r => r.on).length;
  const total   = rules.length;
  const savings = rules.reduce((s, r) => s + parseSaving(r.saving), 0).toFixed(2);
  const rows = [
    { label:'Reglas activas',       value:`${active} / ${total}`, color:'#3B82F6'   },
    { label:'Ahorro estimado',       value:`$${savings}/mes`,       color:'#10B981'   },
    { label:'Dispositivos afectados',value:'8',                     color:'#F59E0B'   },
    { label:'Última ejecución',      value:'Hace 3 min',            color:t.textSecondary },
  ];
  return (
    <div style={{
      padding:16, borderRadius:12,
      background:t.cardBg, border:`1px solid ${t.cardBorder}`,
      display:'flex', flexDirection:'column', gap:0,
    }}>
      <span style={{fontSize:13, fontWeight:600, color:t.textPrimary, marginBottom:8}}>
        Resumen de Ahorro
      </span>
      {rows.map(({ label, value, color }, i) => (
        <div key={label} style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'8px 0',
          borderBottom: i < rows.length - 1 ? `1px solid ${t.divider}` : 'none',
        }}>
          <span style={{fontSize:12, color:t.textSecondary}}>{label}</span>
          <span style={{fontSize:13, fontWeight:600, color}}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Create rule form ─────────────────────────────────────────────

function CreateRuleForm({ isDark, onAdd, nameRef, compact }: {
  isDark: boolean;
  onAdd: (r: Omit<Rule,'id'>) => void;
  nameRef: React.RefObject<HTMLInputElement | null>;
  compact?: boolean;
}) {
  const t = useT();
  const [name,      setName]      = useState('');
  const [device,    setDevice]    = useState('');
  const [condition, setCondition] = useState('');
  const [action,    setAction]    = useState('');

  const inp: React.CSSProperties = {
    width:'100%', height:36, padding:'0 12px', borderRadius:8,
    border:`1px solid ${t.cardBorder}`,
    background:t.pageBg, color:name ? t.textPrimary : t.textTertiary,
    fontSize:12, outline:'none', boxSizing:'border-box',
    appearance:'none', WebkitAppearance:'none',
  };
  const sel: React.CSSProperties = {
    ...inp, color: t.textSecondary, cursor:'pointer',
  };

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd({
      Icon:LuZap, name:name.trim(), tag:'Ahorro',
      condition:condition || 'Condición personalizada',
      saving:'$0.00/mes', on:false,
    });
    setName(''); setDevice(''); setCondition(''); setAction('');
  }

  const fields = [
    {
      label:'Nombre de la regla',
      el: <input ref={nameRef as React.RefObject<HTMLInputElement>} style={{...inp, color:t.textPrimary}}
            placeholder="Ej: Apagar luces de sala" value={name}
            onChange={e => setName(e.target.value)}/>,
    },
    {
      label:'Dispositivo objetivo',
      el: <select style={sel} value={device} onChange={e => setDevice(e.target.value)}>
            <option value="">Seleccionar...</option>
            {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>,
    },
    {
      label:'Condición de activación',
      el: <select style={sel} value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="">Seleccionar...</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>,
    },
    {
      label:'Acción a ejecutar',
      el: <select style={sel} value={action} onChange={e => setAction(e.target.value)}>
            <option value="">Seleccionar...</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>,
    },
  ];

  return (
    <div style={{
      ...(compact ? {} : {flex:1, minHeight:0}),
      padding:16, borderRadius:12,
      background:t.cardBg, border:`1px solid ${t.cardBorder}`,
      display:'flex', flexDirection:'column', gap:12,
    }}>
      <div>
        <p style={{margin:0, fontSize:13, fontWeight:600, color:t.textPrimary}}>Crear Nueva Regla</p>
        <p style={{margin:0, fontSize:11, color:t.textTertiary, marginTop:3}}>
          Define condiciones automáticas para optimizar el consumo
        </p>
      </div>
      {fields.map(({ label, el }) => (
        <div key={label} style={{display:'flex', flexDirection:'column', gap:4}}>
          <label style={{fontSize:11, fontWeight:500, color:t.textSecondary}}>{label}</label>
          {el}
        </div>
      ))}
      {!compact && <div style={{flex:1}}/>}
      <button onClick={handleSubmit} style={{
        height:40, borderRadius:8, border:'none', cursor:'pointer',
        background:'#3B82F6', color:'#FFFFFF',
        fontSize:13, fontWeight:600,
      }}>Crear Regla</button>
    </div>
  );
}

// ─── Desktop content ──────────────────────────────────────────────

function DesktopContent({ rules, isDark, filter, onToggleRule, onToggleTheme, onFilterChange, onAddRule }: {
  rules: Rule[]; isDark: boolean; filter: FilterKey;
  onToggleRule: (id: number) => void; onToggleTheme: () => void;
  onFilterChange: (f: FilterKey) => void; onAddRule: (r: Omit<Rule,'id'>) => void;
}) {
  const t = useT();
  const nameRef = useRef<HTMLInputElement>(null);

  const filtered = rules.filter(r => {
    if (filter === 'Activas')   return r.on;
    if (filter === 'Inactivas') return !r.on;
    if (filter === 'Ahorro')    return r.tag === 'Ahorro';
    if (filter === 'Confort')   return r.tag === 'Confort';
    return true;
  });

  return (
    <main style={{
      flex:1, minWidth:0, display:'flex', flexDirection:'column',
      background:t.pageBg, overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        height:64, flexShrink:0, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 24px',
        background:t.sidebarBg, borderBottom:`1px solid ${t.sidebarBorder}`,
      }}>
        <div style={{display:'flex', flexDirection:'column', gap:2, flex:1}}>
          <span style={{fontSize:20, fontWeight:700, color:t.textPrimary}}>Reglas de Ahorro</span>
          <span style={{fontSize:12, color:t.textTertiary}}>Inicio / Reglas de Ahorro</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
            borderRadius:8, background:t.dateBadgeBg,
          }}>
            <span>📅</span>
            <span style={{fontSize:12, color:t.dateBadgeText}}>Mayo 2026</span>
          </div>
          <ThemePill isDark={isDark} onToggle={onToggleTheme}/>
        </div>
      </div>

      {/* Body */}
      <div style={{
        flex:1, minHeight:0, overflowY:'auto',
        padding:24, display:'flex', gap:16,
      }}>
        {/* Left: rules list */}
        <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:12}}>
          {/* Rules header */}
          <div style={{flexShrink:0}}>
            <span style={{fontSize:14, fontWeight:600, color:t.textPrimary}}>Reglas Activas</span>
          </div>

          {/* Filter tabs */}
          <div style={{display:'flex', gap:8, flexShrink:0, flexWrap:'wrap'}}>
            {FILTERS.map(f => {
              const active = f === filter;
              return (
                <button key={f} onClick={() => onFilterChange(f)} style={{
                  padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12,
                  border:`1px solid ${active ? '#3B82F6' : t.cardBorder}`,
                  background:active ? '#3B82F6' : t.cardBg,
                  color:active ? '#FFFFFF' : t.textSecondary,
                  fontWeight:active ? 600 : 400, transition:'all .15s',
                }}>{f}</button>
              );
            })}
          </div>

          {/* Rule cards */}
          <div style={{display:'flex', flexDirection:'column', gap:10, overflowY:'auto', flex:1, minHeight:0}}>
            {filtered.length === 0 ? (
              <div style={{
                padding:32, textAlign:'center', borderRadius:12,
                background:t.cardBg, border:`1px solid ${t.cardBorder}`,
                color:t.textTertiary, fontSize:13,
              }}>No hay reglas para este filtro</div>
            ) : filtered.map(r => (
              <RuleCard key={r.id} rule={r} isDark={isDark} onToggle={() => onToggleRule(r.id)}/>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{width:340, flexShrink:0, display:'flex', flexDirection:'column', gap:12, minHeight:0}}>
          <SummaryCard rules={rules}/>
          <CreateRuleForm isDark={isDark} onAdd={onAddRule} nameRef={nameRef}/>
        </div>
      </div>
    </main>
  );
}

// ─── Mobile content ───────────────────────────────────────────────

function MobileContent({ rules, isDark, filter, onToggleRule, onFilterChange, onAddRule }: {
  rules: Rule[]; isDark: boolean; filter: FilterKey;
  onToggleRule: (id: number) => void;
  onFilterChange: (f: FilterKey) => void;
  onAddRule: (r: Omit<Rule,'id'>) => void;
}) {
  const t = useT();
  const nameRef = useRef<HTMLInputElement>(null);
  const filtered = rules.filter(r => {
    if (filter === 'Activas')   return r.on;
    if (filter === 'Inactivas') return !r.on;
    if (filter === 'Ahorro')    return r.tag === 'Ahorro';
    if (filter === 'Confort')   return r.tag === 'Confort';
    return true;
  });

  return (
    <main style={{
      flex:1, minHeight:0, overflowY:'auto',
      padding:16, display:'flex', flexDirection:'column', gap:14,
    }}>
      {/* Title */}
      <div>
        <p style={{margin:0, fontSize:18, fontWeight:700, color:t.textPrimary}}>Reglas de Ahorro</p>
        <p style={{margin:0, fontSize:12, color:t.textTertiary, marginTop:2}}>Automatización del hogar</p>
      </div>

      {/* Filter tabs — horizontal scroll */}
      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:2}}>
        {FILTERS.map(f => {
          const active = f === filter;
          return (
            <button key={f} onClick={() => onFilterChange(f)} style={{
              padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:11,
              border:`1px solid ${active ? '#3B82F6' : t.cardBorder}`,
              background:active ? '#3B82F6' : t.cardBg,
              color:active ? '#FFFFFF' : t.textSecondary,
              fontWeight:active ? 600 : 400, flexShrink:0,
            }}>{f}</button>
          );
        })}
      </div>

      {/* Rule cards */}
      {filtered.length === 0 ? (
        <div style={{
          padding:24, textAlign:'center', borderRadius:12,
          background:t.cardBg, border:`1px solid ${t.cardBorder}`,
          color:t.textTertiary, fontSize:13,
        }}>No hay reglas para este filtro</div>
      ) : filtered.map(r => (
        <RuleCard key={r.id} rule={r} isDark={isDark} onToggle={() => onToggleRule(r.id)}/>
      ))}

      {/* Summary */}
      <SummaryCard rules={rules}/>

      {/* Create form */}
      <CreateRuleForm isDark={isDark} onAdd={onAddRule} nameRef={nameRef} compact/>

      <div style={{height:8}}/>
    </main>
  );
}

// ─── Rules page ───────────────────────────────────────────────────

export default function Rules({ onNavigate }: { onNavigate: (p: AppPage) => void }) {
  const [isDark,   setIsDark]   = useState(() => localStorage.getItem('eq-theme') !== 'light');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [rules,    setRules]    = useState(initRules);
  const [filter,   setFilter]   = useState<FilterKey>('Todas');
  const t = isDark ? dark : light;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('eq-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const toggleRule  = (id: number) => setRules(p => p.map(r => r.id === id ? {...r, on:!r.on} : r));
  const toggleTheme = () => setIsDark(p => !p);
  const addRule     = (r: Omit<Rule,'id'>) =>
    setRules(p => [...p, { ...r, id: p.length ? Math.max(...p.map(x => x.id)) + 1 : 1 }]);

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
            <MobileContent
              rules={rules} isDark={isDark} filter={filter}
              onToggleRule={toggleRule} onFilterChange={setFilter} onAddRule={addRule}
            />
            <MobileBottomNav active="reglas" onNavigate={onNavigate}/>
          </>
        ) : (
          <>
            <Sidebar active="reglas" onNavigate={onNavigate}/>
            <DesktopContent
              rules={rules} isDark={isDark} filter={filter}
              onToggleRule={toggleRule} onToggleTheme={toggleTheme}
              onFilterChange={setFilter} onAddRule={addRule}
            />
          </>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
