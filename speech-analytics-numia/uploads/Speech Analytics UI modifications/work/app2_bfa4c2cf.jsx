// Screen 1 — Main dashboard (tab Resumen)
const { useState: useStateD } = React;

function SentimentTimeChart() {
  const days = ["10 sep", "11 sep", "12 sep", "13 sep", "14 sep", "15 sep", "16 sep", "Hoy"];
  // historia coherente: período saludable (positivo dominante y al alza), negativo contenido
  const pos = [50, 53, 51, 56, 54, 57, 55, 58];
  const neu = [28, 26, 27, 24, 26, 24, 26, 25];
  const neg = [22, 21, 22, 20, 20, 19, 19, 17];
  const W = 720, H = 240, x0 = 44, x1 = 700, y0 = 200, y1 = 20; // escala 0..100%
  const X = i => x0 + (i * (x1 - x0)) / (days.length - 1);
  const Y = v => y0 - (v / 100) * (y0 - y1);
  const path = arr => arr.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ");
  const [hover, setHover] = useStateD(null); // index
  const wrapRef = React.useRef(null);

  const onMove = e => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let idx = Math.round(((px - x0) / (x1 - x0)) * (days.length - 1));
    idx = Math.max(0, Math.min(days.length - 1, idx));
    setHover(idx);
  };

  return (
    <div className="chart-wrap" ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ minHeight: 240 }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {[100, 75, 50, 25, 0].map(v => (
          <g key={v}>
            <line className="grid-line" x1={x0} y1={Y(v)} x2={x1 + 10} y2={Y(v)}></line>
            <text className="axis-label" x={x0 - 8} y={Y(v) + 4} textAnchor="end">{v}%</text>
          </g>
        ))}
        {days.map((d, i) => (
          <text key={d} className="axis-label" x={X(i)} y={226} textAnchor="middle">{d}</text>
        ))}
        {hover != null ? <line x1={X(hover)} y1={y1} x2={X(hover)} y2={y0} stroke="#C7BBE3" strokeWidth="1" strokeDasharray="3 3"></line> : null}
        <path d={path(neg)} fill="none" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d={path(neu)} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d={path(pos)} fill="none" stroke="#4B2D8F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d={path(pos) + ` L${x1},${y0} L${x0},${y0} Z`} fill="#4B2D8F" opacity="0.05"></path>
        {hover != null ? [
          <circle key="p" cx={X(hover)} cy={Y(pos[hover])} r="4" fill="#4B2D8F" stroke="#fff" strokeWidth="2"></circle>,
          <circle key="n" cx={X(hover)} cy={Y(neu[hover])} r="4" fill="#9CA3AF" stroke="#fff" strokeWidth="2"></circle>,
          <circle key="g" cx={X(hover)} cy={Y(neg[hover])} r="4" fill="#991B1B" stroke="#fff" strokeWidth="2"></circle>,
        ] : null}
        <circle cx={X(7)} cy={Y(pos[7])} r="4.5" fill="#4B2D8F" stroke="#fff" strokeWidth="2"></circle>
        <circle cx={X(7)} cy={Y(neu[7])} r="3.5" fill="#9CA3AF" stroke="#fff" strokeWidth="1.5"></circle>
        <circle cx={X(7)} cy={Y(neg[7])} r="3.5" fill="#991B1B" stroke="#fff" strokeWidth="1.5"></circle>
      </svg>
      {hover != null ? (
        <div className="chart-tooltip" style={{
          left: `calc(${(X(hover) / W) * 100}% + ${hover > 5 ? -150 : 12}px)`,
          top: "12%",
        }}>
          <div className="tt-date">{days[hover]}</div>
          <div className="tt-row"><span className="dot" style={{ background: "#4B2D8F" }}></span>Positivo<span className="v">{pos[hover]}%</span></div>
          <div className="tt-row"><span className="dot" style={{ background: "#9CA3AF" }}></span>Neutro<span className="v">{neu[hover]}%</span></div>
          <div className="tt-row"><span className="dot" style={{ background: "#991B1B" }}></span>Negativo<span className="v">{neg[hover]}%</span></div>
        </div>
      ) : null}
    </div>
  );
}

function Donut() {
  const C = 2 * Math.PI * 60; // 376.99
  const segs = [
    { p: 55, color: "#1A7F5A" },
    { p: 25, color: "#9CA3AF" },
    { p: 20, color: "#991B1B" },
  ];
  let off = 0;
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true">
      <circle cx="75" cy="75" r="60" fill="none" stroke="#F0F0F3" strokeWidth="16"></circle>
      {segs.map((s, i) => {
        const dash = (s.p / 100) * C;
        const el = (
          <circle key={i} cx="75" cy="75" r="60" fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={`${dash} ${C}`} strokeDashoffset={-off} transform="rotate(-90 75 75)"></circle>
        );
        off += dash;
        return el;
      })}
      <text x="75" y="73" textAnchor="middle" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px", fill: "var(--ink)", fontFamily: "Inter" }}>55%</text>
      <text x="75" y="92" textAnchor="middle" style={{ fontSize: 11, fill: "var(--ink-3)", fontFamily: "Inter" }}>positivo</text>
    </svg>
  );
}

function ComplianceCard({ locked, onDrill }) {
  const rows = [
    { name: "Validación de identidad no detectada", n: "4 casos", sev: "crit", sevLabel: "Crítica", trend: "up" },
    { name: "Script regulatorio ausente", n: "2 casos", sev: "crit", sevLabel: "Crítica", trend: "flat" },
    { name: "Dato sensible expuesto", n: "1 caso", sev: "warn", sevLabel: "Media", trend: "down" },
  ];
  const body = (
    <React.Fragment>
      <div className="card-head" style={{ marginBottom: 6 }}>
        <span className="card-label">Alertas de compliance</span>
      </div>
      <div className="comp-list">
        {rows.map(r => (
          <button className="comp-row" key={r.name} onClick={locked ? undefined : onDrill}>
            <span className="comp-name">{r.name}</span>
            <span className="comp-count">{r.n}</span>
            <span className={"pill sm " + r.sev}>{r.sevLabel}</span>
            <span className={"comp-trend " + r.trend}>
              {r.trend === "up" ? "↑" : r.trend === "down" ? "↓" : "="}
            </span>
          </button>
        ))}
      </div>
      <a href="#" style={{ fontSize: 12, fontWeight: 600, marginTop: 10 }} onClick={e => { e.preventDefault(); if (!locked) onDrill(); }}>Ver todas las alertas →</a>
    </React.Fragment>
  );
  if (locked) return (
    <section className="card span-4 locked">
      <div className="locked-blur">{body}</div>
      <div className="locked-overlay">
        <div className="lock-circle"><Ph name="lock-simple" /></div>
        <p>Activá esta métrica cargando tu protocolo</p>
        <button className="btn-secondary">Ir a configuración</button>
      </div>
    </section>
  );
  return <section className="card span-4">{body}</section>;
}

/* ── Insights por temas ── */
const SENT_KIND = { positiva: "pos", mixta: "neu", negativa: "neg" };
const SENT_LABEL = { positiva: "Positiva", mixta: "Mixta", negativa: "Negativa" };

const TEMAS = [
  { name: "Crédito hipotecario", vol: 412, delta: 12, sent: "mixta",
    headline: "Faltan requisitos claros para aplicar",
    sintesis: "Las consultas crecen impulsadas por la baja de tasas y el interés es genuino, pero los clientes llegan sin saber qué documentos necesitan y la pre-aprobación se percibe lenta. Varias visitas terminan en una segunda cita evitable.",
    recos: [
      { text: "Publicar checklist de requisitos en el sitio y la app", ev: "mencionado en 46 interacciones" },
      { text: "Comunicar plazo real de pre-aprobación al inicio", ev: "38 interacciones" },
    ],
    quotes: ["¿Me podía haber traído todo de una vez si alguien me decía qué papeles pedían…", "La tasa me conviene, pero llevo dos semanas esperando la pre-aprobación."] },
  { name: "Reclamo de cargos", vol: 358, delta: 9, sent: "negativa",
    headline: "Principal motor de escalaciones del período",
    sintesis: "Los reclamos por cargos no reconocidos suben por segunda semana consecutiva y concentran la mayoría de las escalaciones a defensoría. Los clientes reiteran que ya reclamaron antes por el mismo motivo sin resolución visible.",
    recos: [
      { text: "Priorizar seguimiento de reclamos reiterados", ev: "52 interacciones con reclamo previo" },
    ],
    quotes: ["Esto ya me pasó antes y nadie me solucionó nada.", "Si no me devuelven el cargo esta semana, me cambio de banco."] },
  { name: "App móvil", vol: 291, nuevo: true, sent: "negativa",
    headline: "Operaciones que fallan en línea llegan a sucursal",
    sintesis: "Tema nuevo en el período: los clientes llegan a la sucursal después de no poder completar operaciones en la app, principalmente actualización de clave y límites de transferencia. La visita se percibe como un trámite forzado.",
    recos: [
      { text: "Reportar a equipo digital los 2 flujos que más fallan", ev: "clave 118, límites 74 interacciones" },
    ],
    quotes: ["Intenté tres veces cambiar la clave en la app y terminé viniendo igual."] },
  { name: "Apertura de cuenta", vol: 244, delta: 5, sent: "positiva",
    headline: "Buen cierre en primera visita",
    sintesis: "Las aperturas mantienen sentimiento positivo y alta tasa de cierre en la primera visita. Los ejecutivos aprovechan bien la instancia para ofrecer productos complementarios, especialmente tarjetas y seguros.",
    recos: null,
    quotes: ["Salí con la cuenta lista y la tarjeta pedida en la misma visita."] },
  { name: "Solicitud de tarjeta digital", vol: 208, delta: 18, sent: "mixta",
    headline: "Alta demanda, activación confusa",
    sintesis: "La demanda crece fuerte tras la campaña vigente, pero la activación en dos pasos (sucursal + app) genera confusión: parte de los clientes vuelve a consultar cómo terminar el proceso que creía completo.",
    recos: [
      { text: "Entregar instructivo de activación al cierre de la visita", ev: "31 reconsultas en el período" },
    ],
    quotes: ["Pensé que ya estaba activa; nadie me dijo que faltaba un paso en la app."] },
  { name: "Consulta de inversiones", vol: 186, delta: -3, sent: "positiva",
    headline: "Interés sostenido con oportunidades sin capturar",
    sintesis: "El sentimiento sigue positivo y las consultas son de calidad, pero 7 de las 23 oportunidades comerciales no capturadas del período corresponden a este tema: el cliente pregunta y el ejecutivo no deriva ni agenda.",
    recos: null,
    quotes: ["¿Me conviene juntar mis ahorros en una cuenta de inversión?"] },
];

const KEYWORDS_NUBE = [
  ["crédito hipotecario", 412], ["reclamo de cargos", 358], ["app móvil", 291],
  ["apertura de cuenta", 244], ["tarjeta digital", 208], ["inversiones", 186],
  ["tasa de interés", 158], ["cargo duplicado", 134], ["clave bloqueada", 121],
  ["transferencias", 110], ["fondos mutuos", 96], ["dividendo", 84],
  ["seguro de vida", 71], ["reprogramación", 63], ["portabilidad", 48],
];

function DeltaBadge({ t }) {
  if (t.nuevo) return <span className="pill sm purple">nuevo</span>;
  const up = t.delta > 0;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: up ? "var(--ink-2)" : "var(--ink-3)", whiteSpace: "nowrap" }}>
      {up ? "↑ +" : "↓ "}{t.delta}%
    </span>
  );
}

function NubePalabras() {
  const max = KEYWORDS_NUBE[0][1];
  return (
    <div className="nube">
      {KEYWORDS_NUBE.map(([w, n]) => (
        <span key={w} className="nube-word" title={n + " menciones"}
          style={{ fontSize: 12 + (n / max) * 14, opacity: 0.55 + (n / max) * 0.45 }}>{w}</span>
      ))}
    </div>
  );
}

function InsightCard({ t, onDrillTopic, full }) {
  const [open, setOpen] = useStateD(!!full);
  return (
    <article className="insight-card">
      <div className="ic-top">
        <span className="ic-title">{t.name}</span>
        <SentPill kind={SENT_KIND[t.sent]} label={SENT_LABEL[t.sent]} />
      </div>
      <div className="ic-meta">
        <span>{t.vol} interacciones</span>
        <DeltaBadge t={t} />
      </div>
      <div className="ic-headline">{t.headline}</div>
      <p className={"ic-prosa" + (open ? " open" : "")}>{t.sintesis}</p>
      {!full ? (
        <button className="ic-more" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "ver menos" : "ver más"}</button>
      ) : null}
      {full && t.recos ? (
        <div className="ic-recos">
          <div className="ic-recos-title"><Ph name="lightbulb" fill />Próximos pasos</div>
          {t.recos.map(r => (
            <div className="ic-reco" key={r.text}>
              {r.text} <span className="ic-ev">({r.ev})</span>
            </div>
          ))}
        </div>
      ) : null}
      <button className="ic-drill" onClick={() => onDrillTopic(t)}>Ver interacciones →</button>
    </article>
  );
}

function InsightsTemas({ nubeHabilitada, onDrillTopic, full }) {
  const [modo, setModo] = useStateD("temas");
  const temas = [...TEMAS].sort((a, b) => b.vol - a.vol);
  return (
    <section className="card span-12" data-screen-label="Insights por temas">
      <div className="insights-head">
        <span className="card-title" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <Ph name="sparkle" fill style={{ color: "var(--purple)" }} />Insights por temas
          <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)" }}>· período analizado: 10–17 sep (últimos 30 días)</span>
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {nubeHabilitada ? (
            <div className="seg" role="tablist" aria-label="Modo de vista">
              <button className={"seg-btn" + (modo === "temas" ? " on" : "")} onClick={() => setModo("temas")}>Temas</button>
              <button className={"seg-btn" + (modo === "nube" ? " on" : "")} onClick={() => setModo("nube")}>Nube</button>
            </div>
          ) : null}
        </div>
      </div>
      {modo === "nube" && nubeHabilitada ? (
        <div style={{ minHeight: 220, display: "flex" }}><NubePalabras /></div>
      ) : (
        <div className="insights-grid">
          {temas.map(t => <InsightCard key={t.name} t={t} onDrillTopic={onDrillTopic} full={full} />)}
        </div>
      )}
    </section>
  );
}

/* ── Teaser de temas (puente al tab Temas) ── */
/* ── Temas del período: donut top 5 + otros ── */
const TEMA_COLORS = ["#4B2D8F", "#0072B2", "#56B4E9", "#E69F00", "#CC79A7", "#9CA3AF"]; // paleta Okabe–Ito (apta daltonismo)
function TemasTeaser({ onGoTemas }) {
  const [hov, setHov] = useStateD(null);
  const temas = [...TEMAS].sort((a, b) => b.vol - a.vol).slice(0, 5);
  const totalTemas = temas.reduce((s, t) => s + t.vol, 0);
  const otros = 2334 - totalTemas;
  const data = [...temas.map((t, i) => ({ name: t.name, vol: t.vol, sent: t.sent, delta: t, color: TEMA_COLORS[i] })), { name: "Otros", vol: otros, color: TEMA_COLORS[5] }];
  const total = 2334;
  const C = 2 * Math.PI * 62;
  let acc = 0;
  return (
    <section className="card span-12" data-screen-label="Temas del período">
      <div className="card-head" style={{ marginBottom: 4 }}>
        <span className="card-title">Temas del período <InfoDot text="Los 5 temas más mencionados en las conversaciones del período, agrupados por IA." /></span>
        <a href="#" style={{ fontSize: 12, fontWeight: 600 }} onClick={e => { e.preventDefault(); onGoTemas(); }}>Ver análisis completo →</a>
      </div>
      <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
        <svg width="170" height="170" viewBox="0 0 170 170" role="img" aria-label="Distribución de interacciones por tema">
          {data.map((d, i) => {
            const frac = d.vol / total;
            const dash = frac * C;
            const off = -acc; acc += dash;
            return (
              <circle key={d.name} cx="85" cy="85" r="62" fill="none"
                stroke={d.color} strokeWidth={hov === i ? 22 : 17}
                strokeDasharray={(dash - 2) + " " + (C - dash + 2)} strokeDashoffset={off}
                transform="rotate(-90 85 85)" style={{ transition: "stroke-width .12s", cursor: "pointer" }}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                onClick={i < 5 ? onGoTemas : undefined}><title>{d.name}: {d.vol.toLocaleString("es-CL")} interacciones ({Math.round((d.vol / total) * 100)}%)</title></circle>
            );
          })}
          <text x="85" y="81" textAnchor="middle" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", fill: "var(--ink)", fontFamily: "Inter" }}>
            {hov != null ? Math.round((data[hov].vol / total) * 100) + "%" : "2.334"}
          </text>
          <text x="85" y="99" textAnchor="middle" style={{ fontSize: 11, fill: "var(--ink-3)", fontFamily: "Inter" }}>
            {hov != null ? data[hov].name.slice(0, 18) : "interacciones"}
          </text>
        </svg>
        <div style={{ flex: 1, minWidth: 280 }}>
          {data.map((d, i) => (
            <button key={d.name} className="comp-row" style={{ margin: 0, background: hov === i ? "var(--purple-tint)" : undefined }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              onClick={i < 5 ? onGoTemas : undefined} disabled={i === 5}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color, flexShrink: 0 }} aria-hidden="true"></span>
              <span className="comp-name">{d.name}</span>
              <span className="comp-count">{d.vol.toLocaleString("es-CL")}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", width: 40, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {Math.round((d.vol / total) * 100)}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Drill-down de tema (se muestra en drawer) ── */
function TopicDetail({ topic, onClose, onOpenDetail }) {
  const asociadas = [
    { id: "#4521", fecha: "15 jun, 11:42", exec: "María González", ini: "MG", sent: "neu" },
    { id: "#4515", fecha: "15 jun, 10:48", exec: "Lucía Vergara", ini: "LV", sent: "neg" },
    { id: "#4499", fecha: "15 jun, 09:02", exec: "Ana Riquelme", ini: "AR", sent: "pos" },
  ];
  return (
    <React.Fragment>
      <div className="drawer-head" data-screen-label="Detalle de tema">
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Temas · {topic.name}</span>
        <button className="drawer-close" onClick={onClose} aria-label="Cerrar"><Ph name="x" /></button>
      </div>
      <div className="detail-header">
        <h1>{topic.name}</h1>
        <span className="meta-chip">{topic.vol} interacciones</span>
        <DeltaBadge t={topic} />
        <SentPill kind={SENT_KIND[topic.sent]} label={SENT_LABEL[topic.sent]} />
      </div>
      <section className="card ai-card" style={{ marginBottom: 16 }}>
        <div className="card-label"><Ph name="sparkle" fill />Síntesis del tema</div>
        <p style={{ fontWeight: 600 }}>{topic.headline}</p>
        <p style={{ marginTop: 6 }}>{topic.sintesis}</p>
      </section>
      <section className="card" style={{ marginBottom: 16 }}>
        <div className="card-label">Frases textuales de ejemplo</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {topic.quotes.map(qt => (
            <blockquote key={qt} className="topic-quote">“{qt}”</blockquote>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="card-head" style={{ marginBottom: 4 }}>
          <span className="card-label">Interacciones asociadas</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>3 de {topic.vol}</span>
        </div>
        <div className="comp-list" style={{ margin: "0 -12px" }}>
          {asociadas.map(a => (
            <button className="comp-row" key={a.id} onClick={onOpenDetail}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{a.id}</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{a.fecha}</span>
              <span className="comp-name" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="avatar sm gray">{a.ini}</span>{a.exec}
              </span>
              <SentPill kind={a.sent} />
              <i className="ph ph-caret-right" style={{ color: "var(--ink-3)", fontSize: 13 }}></i>
            </button>
          ))}
        </div>
      </section>
    </React.Fragment>
  );
}

/* ── Heatmap de frecuencia de atenciones ── */
const HM_SUCURSALES = ["Todas las sucursales", "Sucursal Centro", "Sucursal Norte", "Sucursal Providencia", "Sucursal Las Condes", "Sucursal Maipú"];
const HM_DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HM_HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function hmValue(suc, d, h) {
  // mock determinista: pico media mañana y mediodía, sábado corto, variación por sucursal
  const base = Math.exp(-Math.pow(h - 11.2, 2) / 8) * 0.75 + Math.exp(-Math.pow(h - 13.5, 2) / 3) * 0.5;
  const dia = d === 5 ? (h > 13 ? 0 : 0.55) : 1 - Math.abs(d - 1.5) * 0.07;
  const seed = Math.abs(Math.sin((suc + 1) * 3.7 + d * 1.3 + h * 0.9)) * 0.22;
  return Math.max(0, Math.min(1, base * dia + seed));
}

function HeatmapAtenciones() {
  const [sel, setSel] = useStateD([]); // índices de sucursales (vacío = todas)
  const [open, setOpen] = useStateD(false);
  const [hover, setHover] = useStateD(null);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const max = 46;
  const activos = sel.length ? sel : HM_SUCURSALES.map((_, i) => i).slice(1);
  const valor = (d, h) => activos.reduce((s, i) => s + hmValue(i, d, h), 0) / activos.length;
  const label = sel.length === 0 ? "Todas las sucursales" : sel.length === 1 ? HM_SUCURSALES[sel[0]] : "Sucursales (" + sel.length + ")";
  const toggleSuc = i => setSel(sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]);
  return (
    <section className="card span-8" data-screen-label="Frecuencia de atenciones">
      <div className="card-head">
        <span className="card-title">Frecuencia de atenciones <InfoDot text="Cantidad promedio de atenciones registradas por día y hora en las últimas 4 semanas." /></span>
      </div>
      <div role="grid" aria-label={"Frecuencia de atenciones por día y hora — " + label}
        style={{ display: "grid", gridTemplateColumns: "44px repeat(" + HM_HORAS.length + ", 1fr)", gap: 3, alignItems: "center" }}>
        <span></span>
        {HM_HORAS.map(h => <span key={h} style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "center" }}>{h}:00</span>)}
        {HM_DIAS.map((d, di) => (
          <React.Fragment key={d}>
            <span style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600 }}>{d}</span>
            {HM_HORAS.map(h => {
              const val = valor(di, h);
              const n = Math.round(val * max * (sel.length === 1 ? 1 : activos.length * 0.6));
              return (
                <div key={h} className="hm-cell" tabIndex={0} role="gridcell"
                  aria-label={d + " " + h + ":00 — " + n + " atenciones"}
                  title={d + " " + h + ":00 — " + n + " atenciones"}
                  onMouseEnter={() => setHover(d + h)} onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(d + h)} onBlur={() => setHover(null)}
                  style={{
                    height: 28, borderRadius: 5, cursor: "default",
                    background: "rgba(75,45,143," + (0.05 + val * 0.85).toFixed(2) + ")",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10.5, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                    color: val > 0.7 ? "#fff" : hover === d + h ? "var(--ink)" : "transparent",
                  }}>{n}</div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 11.5, color: "var(--ink-3)" }}>
        <span>Menos</span>
        {[0.08, 0.25, 0.45, 0.65, 0.9].map(o => (
          <span key={o} style={{ width: 18, height: 12, borderRadius: 3, background: "rgba(75,45,143," + o + ")" }}></span>
        ))}
        <span>Más</span>
        <span style={{ marginLeft: "auto" }}>atenciones por hora · últimas 4 semanas</span>
      </div>
    </section>
  );
}

/* ── Nube de palabras clave ── */
function KeywordCloud({ active, onSelect }) {
  const [hover, setHover] = React.useState(null);
  const data = [
    { t: "Reclamos", n: 512 }, { t: "Inversión", n: 430 }, { t: "Crédito", n: 402 },
    { t: "Tarjeta", n: 358 }, { t: "Cargos", n: 322 }, { t: "Depósito", n: 286 },
    { t: "Transferencia", n: 264 }, { t: "Apertura", n: 240 }, { t: "Seguro", n: 198 },
    { t: "Bloqueo", n: 176 }, { t: "Cajero", n: 150 }, { t: "App", n: 120 },
  ];
  const total = data.reduce((s, d) => s + d.n, 0);
  const max = Math.max.apply(null, data.map(d => d.n));
  const size = n => Math.round(66 + (n / max) * 104);
  const tier = n => { const r = n / max; return r > 0.8 ? 1 : r > 0.6 ? 2 : r > 0.42 ? 3 : r > 0.28 ? 4 : 5; };
  const RAMP = { 1: "#3A2270", 2: "#4B2D8F", 3: "#6D45C9", 4: "#9B6BE8", 5: "#C9B7F0" };
  const font = (s, t) => Math.max(10, Math.min(Math.round(s * 0.17), Math.round((s * 1.55) / t.length)));
  const empty = data.length === 0;
  return (
    <section className="card span-12" data-screen-label="Palabras claves">
      <div className="card-head" style={{ marginBottom: 8 }}>
        <span className="card-title">Palabras claves <InfoDot text="Palabras y frases más mencionadas en las conversaciones del período. El tamaño y la intensidad reflejan la frecuencia." /></span>
        {active ? (
          <button className="pill sm purple" style={{ border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => onSelect && onSelect(active)}>
            Filtrando por: {active}<i className="ph ph-x"></i>
          </button>
        ) : null}
      </div>
      {empty ? (
        <div className="empty-state">
          <div className="es-circle"><Ph name="chat-circle-text" /></div>
          <p>No hay palabras clave para mostrar.</p>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Seleccione un período con actividad para ver los términos más mencionados.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12, padding: "18px 8px 8px" }}>
          {data.map((d, i) => {
            const s = size(d.n), ti = tier(d.n), bg = RAMP[ti], dark = ti >= 5;
            const pct = ((d.n / total) * 100).toFixed(1).replace(".", ",");
            const dim = active && active !== d.t;
            const sel = active === d.t;
            return (
              <button key={d.t} onClick={() => onSelect && onSelect(d.t)}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)}
                aria-label={d.t + ": " + d.n + " menciones, " + pct + "%"}
                style={{
                  position: "relative", width: s, height: s, borderRadius: "50%", flexShrink: 0, border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                  background: bg, color: dark ? "#3A2270" : "#fff", fontFamily: "inherit",
                  fontWeight: 600, letterSpacing: "0.02em", textTransform: "uppercase",
                  fontSize: font(s, d.t), lineHeight: 1.1, padding: 8, cursor: "pointer",
                  opacity: dim ? 0.35 : 1, boxShadow: sel ? "0 0 0 3px var(--purple), 0 0 0 6px var(--purple-soft)" : "none",
                  transition: "opacity .15s, box-shadow .15s, transform .12s", transform: hover === i ? "scale(1.04)" : "none",
                }}>
                {d.t}
                {hover === i ? (
                  <span role="tooltip" style={{
                    position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
                    background: "#1A1A2E", borderRadius: 8, padding: "8px 11px", zIndex: 50, width: 172,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.2)", textTransform: "none", letterSpacing: 0, textAlign: "left", pointerEvents: "none",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", display: "block" }}>{d.t}</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: "#C9C9D4" }}>{d.n.toLocaleString("es-CL")} menciones · {pct}%</span>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Sentimiento en el tiempo (líneas) ── */
function SentimentChart() {
  const days = ["10 sep", "11 sep", "12 sep", "13 sep", "14 sep", "15 sep", "16 sep", "Hoy"];
  const series = [
    { key: "pos", name: "Positivo", color: "#4B2D8F", bg: "var(--purple-tint)", vals: [50, 53, 51, 56, 54, 57, 55, 59] },
    { key: "neu", name: "Neutro", color: "#9CA3AF", bg: "#F0F0F3", vals: [28, 26, 27, 24, 26, 24, 26, 25] },
    { key: "neg", name: "Negativo", color: "#991B1B", bg: "var(--red-bg)", vals: [22, 21, 23, 21, 21, 20, 20, 18] },
  ];
  const W = 760, H = 300, x0 = 46, x1 = 738, yTop = 18, y0 = 250;
  const X = i => x0 + (i * (x1 - x0)) / (days.length - 1);
  const Y = v => y0 - (v / 100) * (y0 - yTop);
  const toPath = arr => arr.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1)).join(" ");
  const pos = series[0];
  const area = toPath(pos.vals) + ` L${X(days.length - 1).toFixed(1)},${Y(pos.vals[days.length - 1]).toFixed(1)} L${X(days.length - 1).toFixed(1)},${y0} L${x0},${y0} Z`;
  const posArea = toPath(pos.vals) + ` L${X(days.length - 1).toFixed(1)},${y0} L${x0},${y0} Z`;
  return (
    <section className="card span-8" data-screen-label="Sentimiento en el tiempo">
      <div className="card-head" style={{ marginBottom: 8 }}>
        <span className="card-title">Sentimiento en el tiempo <InfoDot text="Evolución diaria del sentimiento detectado en las conversaciones del período." /></span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Última actualización 14:32</span>
      </div>
      <div style={{ width: "100%" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Evolución del sentimiento positivo, neutro y negativo en el tiempo">
          {[100, 75, 50, 25, 0].map(v => (
            <g key={v}>
              <line className="grid-line" x1={x0} y1={Y(v)} x2={x1} y2={Y(v)}></line>
              <text className="axis-label" x={x0 - 10} y={Y(v) + 4} textAnchor="end">{v}%</text>
            </g>
          ))}
          {days.map((d, i) => (
            <text key={d} className="axis-label" x={X(i)} y={y0 + 24} textAnchor="middle">{d}</text>
          ))}
          <path d={posArea} fill="#4B2D8F" opacity="0.07"></path>
          {series.map(s => (
            <path key={s.key} d={toPath(s.vals)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
          ))}
          {series.map(s => (
            <circle key={s.key} cx={X(days.length - 1)} cy={Y(s.vals[days.length - 1])} r="4.5" fill={s.color} stroke="#fff" strokeWidth="1.5"></circle>
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {series.map(s => (
            <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "4px 11px", borderRadius: "var(--radius-pill, 999px)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }}></span>{s.name}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
          <b style={{ color: "var(--ink)", fontWeight: 600 }}>55% positivo</b> · 2.334 interacciones
        </div>
      </div>
    </section>
  );
}

function Dashboard({ variant, rankingPublico, onDrillToInteractions, onOpenProfile, onGoTemas, activeKeyword, onFilterKeyword }) {
  const locked = variant === "locked" || variant === "setup";
  const day1 = variant === "day1";
  const setup = variant === "setup";
  const sparkUp = [0.2, 0.32, 0.28, 0.45, 0.4, 0.58, 0.55, 0.72, 0.8];
  const sparkDown = [0.72, 0.6, 0.66, 0.5, 0.55, 0.4, 0.45, 0.3, 0.27];
  const sparkSat = [0.4, 0.38, 0.46, 0.44, 0.55, 0.52, 0.63, 0.66, 0.75];
  const sparkEsc = [0.3, 0.36, 0.33, 0.48, 0.42, 0.6, 0.54, 0.66, 0.62];
  const sparkFcr = [0.25, 0.36, 0.3, 0.48, 0.42, 0.56, 0.5, 0.66, 0.73];

  const products = [
    { name: "Crédito personal", n: 9 },
    { name: "Inversión", n: 7 },
    { name: "Tarjeta", n: 5 },
    { name: "Seguro", n: 2 },
  ];
  const leaders = [
    { rank: 1, name: "Ana Riquelme", ini: "AR", score: 88, trend: "up", cls: "top" },
    { rank: 2, name: "María González", ini: "MG", score: 74, trend: "up" },
    { rank: 3, name: "Carlos Fuentes", ini: "CF", score: 71, trend: "flat" },
    { rank: 4, name: "Lucía Vergara", ini: "LV", score: 65, trend: "down" },
    { rank: 5, name: "Pedro Salas", ini: "PS", score: 58, trend: "down", cls: "low" },
  ];

  return (
    <React.Fragment>
      {setup ? <SetupBanner /> : null}
      {day1 ? (
        <div className="banner-info">
          <Ph name="hourglass-medium" fill />
          Analizando tus primeras interacciones. Los datos se completan en 48 h.
        </div>
      ) : null}
      <div className="grid" data-screen-label="Dashboard Resumen">

        {/* Row 1 — KPIs principales */}
        <div className="span-12" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
          <div style={{ display: "flex" }}>
            <MetricCard className="primary-card" label="Cumplimiento de pitch"
              info="Porcentaje de interacciones donde el ejecutivo completó los pasos del protocolo activo."
              value={day1 ? "—" : "72"} unit={day1 ? "" : "%"}
              spark={day1 ? null : sparkUp}
              locked={locked} lockedText="Activá esta métrica cargando tu protocolo" />
          </div>
          <div style={{ display: "flex" }}>
            <MetricCard label="Resuelto"
              info="Interacciones cuyo motivo se resolvió en el mismo contacto."
              value="1.588" sub="68% del total" spark={sparkFcr} />
          </div>
          <div style={{ display: "flex" }}>
            <MetricCard label="No resuelto"
              info="Interacciones que quedaron sin resolución en el contacto."
              value="746" sub="32% del total" spark={sparkDown} sparkColor="#991B1B" />
          </div>
          <div style={{ display: "flex" }}>
            <MetricCard label="CSAT estimado" tag="estimado"
              info="Satisfacción estimada por IA a partir del tono y contenido de la conversación. No reemplaza encuestas."
              value={day1 ? "3.9" : "4.1"} unit="/5" spark={sparkSat} />
          </div>
          <div style={{ display: "flex" }}>
            <MetricCard label="Score promedio"
              info="Promedio del índice de coaching de los ejecutivos en el período."
              value="6,4" unit="/10" spark={sparkUp} />
          </div>
        </div>

        {/* Row 2 — Sentimiento + Top ejecutivos */}
        <SentimentChart />

        {/* Top ejecutivos — jerarquía: podio destacado */}
        <section className="card span-4">
          <div className="card-head" style={{ marginBottom: 10 }}>
            <span className="card-title">Top ejecutivos <InfoDot text="Ranking por índice de coaching: protocolo, sentimiento, resolución y ratio de escucha." /></span>
            {!rankingPublico ? <span className="pill sm neu">ranking público desactivado</span> : null}
          </div>
          {rankingPublico ? (
            <React.Fragment>
              {/* #1 destacado */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--purple-tint)", border: "1px solid #E4DBF4", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <span className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{leaders[0].ini}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{leaders[0].name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>#1 del período</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--purple)" }}>{leaders[0].score}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>índice</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {leaders.slice(1, 4).map(l => (
                  <div className={"lb-row " + (l.cls || "")} key={l.rank}>
                    <span className="lb-rank">#{l.rank}</span>
                    <span className="avatar sm gray">{l.ini}</span>
                    <span className="lb-name">{l.name}</span>
                    <div className="lb-bar-track"><div className="lb-bar" style={{ width: l.score + "%" }}></div></div>
                    <span className="lb-score">{l.score}</span>
                    <span aria-label={l.trend === "up" ? "en alza" : l.trend === "down" ? "en baja" : "estable"}
                      style={{ fontSize: 13, width: 16, textAlign: "center", color: l.trend === "up" ? "var(--green)" : l.trend === "down" ? "var(--red)" : "var(--ink-3)" }}>
                      {l.trend === "up" ? "▲" : l.trend === "down" ? "▼" : "="}
                    </span>
                  </div>
                ))}
              </div>
              <a href="#" style={{ fontSize: 12, fontWeight: 600, marginTop: 12 }} onClick={e => { e.preventDefault(); onOpenProfile(); }}>Ver performance completa →</a>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="histo" role="img" aria-label="Distribución agregada del índice de coaching">
                {[["40–49", 1], ["50–59", 2], ["60–69", 4], ["70–79", 3], ["80–89", 2], ["90–100", 0]].map(([range, n]) => (
                  <div className="histo-col" key={range}>
                    <span className="histo-n">{n}</span>
                    <div className="histo-bar" style={{ height: (n / 4) * 100 + "%", minHeight: n ? 6 : 2, background: n ? "var(--purple)" : "#E5E5E5" }}></div>
                    <span className="histo-range">{range}</span>
                  </div>
                ))}
              </div>
              <div className="card-sub" style={{ marginTop: 12 }}>Distribución agregada del índice de coaching (12 ejecutivos). Los nombres no se muestran porque el ranking público está desactivado.</div>
            </React.Fragment>
          )}
        </section>

        {/* Row 3 — Heatmap + Ratio */}
        <HeatmapAtenciones />

        {/* Ratio de escucha — gauge circular */}
        <section className="card span-4">
          <div className="card-label">Ratio de escucha <InfoDot text="Porcentaje del tiempo de conversación en que habla el ejecutivo vs. el cliente. Referencia saludable: 45–55%." /></div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 14, paddingTop: 8 }}>
            <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Ratio de escucha: ejecutivo 58 por ciento, cliente 42 por ciento. Referencia saludable 55 por ciento.">
              <circle cx="75" cy="75" r="58" fill="none" stroke="#C7BBE3" strokeWidth="16"><title>Cliente 42%</title></circle>
              <circle cx="75" cy="75" r="58" fill="none" stroke="#4B2D8F" strokeWidth="16"
                strokeDasharray={(0.58 * 2 * Math.PI * 58) + " " + (2 * Math.PI * 58)}
                transform="rotate(-90 75 75)"><title>Ejecutivo 58%</title></circle>
              {/* marcador de referencia 55%: tick corto sobre el anillo */}
              {(() => {
                const a = (0.55 * 360 - 90) * Math.PI / 180;
                const x1 = 75 + 48 * Math.cos(a), y1 = 75 + 48 * Math.sin(a);
                const x2 = 75 + 68 * Math.cos(a), y2 = 75 + 68 * Math.sin(a);
                return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round"><title>Referencia saludable: 55%</title></line>;
              })()}
              <text x="75" y="71" textAnchor="middle" style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", fill: "var(--ink)", fontFamily: "Inter" }}>58%</text>
              <text x="75" y="89" textAnchor="middle" style={{ fontSize: 11, fill: "var(--ink-3)", fontFamily: "Inter" }}>ejecutivo</text>
            </svg>
            <div style={{ display: "flex", gap: 18, fontSize: 12, color: "var(--ink-2)", flexWrap: "wrap", justifyContent: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }} title="Ejecutivo: 58% del tiempo de conversación">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#4B2D8F" }}></span>Ejecutivo 58%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }} title="Cliente: 42% del tiempo de conversación">
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#C7BBE3" }}></span>Cliente 42%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }} title="Referencia saludable: el ejecutivo no debería superar el 55%">
                <span style={{ width: 3, height: 12, borderRadius: 2, background: "var(--ink)" }}></span>referencia 55%
              </span>
            </div>
          </div>
        </section>

        <TemasTeaser onGoTemas={onGoTemas} />

      </div>
    </React.Fragment>
  );
}

window.Dashboard = Dashboard;
window.TopicDetail = TopicDetail;
window.InsightsTemas = InsightsTemas;

/* Banner de configuración pendiente (3 pasos) */
function SetupBanner() {
  const steps = [
    { label: "Industria", done: true },
    { label: "Diccionario de negocio", done: false },
    { label: "Protocolo de atención", done: false },
  ];
  const done = steps.filter(s => s.done).length;
  return (
    <div className="setup-banner" data-screen-label="Configuración pendiente">
      <div className="sb-top">
        <div>
          <div className="sb-title"><Ph name="wrench" fill />Complete la configuración para activar todas las métricas</div>
          <div className="sb-sub">Las métricas globales ya están midiendo. Las métricas de banca requieren estos pasos.</div>
        </div>
        <span className="sb-progress-label">{done} de {steps.length}</span>
      </div>
      <div className="sb-progress"><div className="sb-progress-fill" style={{ width: (done / steps.length) * 100 + "%" }}></div></div>
      <div className="sb-steps">
        {steps.map(s => (
          <div className={"sb-step" + (s.done ? " done" : "")} key={s.label}>
            <span className={"check-ic " + (s.done ? "ok" : "")} style={!s.done ? { background: "#F0F0F3", color: "var(--ink-3)" } : null}>
              <Ph name={s.done ? "check" : "circle"} />
            </span>
            {s.label}
            {!s.done ? <a href="#" onClick={e => e.preventDefault()}>Configurar →</a> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
window.SetupBanner = SetupBanner;
