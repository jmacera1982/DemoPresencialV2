/* ── Tabs Comercial y Caja — reorganización del template azul con estilos del template blanco ── */

const OKABE = ["#4B2D8F", "#0072B2", "#56B4E9", "#E69F00", "#CC79A7", "#1A7F5A", "#9CA3AF", "#991B1B"];

function SecHead({ icon, title, sub }) {
  return (
    <div className="span-12" style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 0 0" }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--purple-soft)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        <Ph name={icon} fill />
      </span>
      <div>
        <div className="card-title" style={{ fontSize: 16 }}>{title}</div>
        {sub ? <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div> : null}
      </div>
    </div>
  );
}

function Stat({ label, value, unit, sub, tone, info, className, span }) {
  return (
    <div className={"span-" + (span || 3)} style={{ display: "flex" }}>
      <section className={"card " + (className || "")}>
        <div className="card-label">{label}{info ? <InfoDot text={info} /> : null}</div>
        <div className="metric-value-row">
          <span className="metric-value" style={tone ? { color: tone } : null}>{value}{unit ? <span className="metric-unit">{unit}</span> : null}</span>
        </div>
        {sub ? <div className="card-sub">{sub}</div> : null}
      </section>
    </div>
  );
}

function HBarList({ title, sub, span, items, max, unit, hideVal }) {
  const m = max || Math.max.apply(null, items.map(i => i.n));
  return (
    <section className={"card span-" + (span || 6)} data-screen-label={title}>
      <div className="card-head" style={{ marginBottom: 6 }}>
        <span className="card-title">{title}</span>
        {sub ? <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</span> : null}
      </div>
      <div style={{ marginTop: 2 }}>
        {items.map(it => (
          <div className="hbar-row" key={it.name} title={it.name + (hideVal ? "" : ": " + it.n + (unit || ""))}>
            <span className="hbar-label" style={{ width: 168 }}>{it.name}</span>
            <div className="hbar-track"><div className="hbar" style={{ width: (it.n / m) * 100 + "%", background: it.color || "var(--purple)" }}></div></div>
            {hideVal ? null : <span className="hbar-val" style={{ width: 48 }}>{it.n}{unit || ""}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}

function RankList({ title, sub, span, items }) {
  return (
    <section className={"card span-" + (span || 12)} data-screen-label={title}>
      <div className="card-head" style={{ marginBottom: 4 }}>
        <span className="card-title">{title}</span>
        {sub ? <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</span> : null}
      </div>
      <div className="comp-list">
        {items.map((it, i) => (
          <div className="comp-row" key={i} style={{ cursor: "default" }}>
            <span className="lb-rank">#{i + 1}</span>
            <span className="comp-name">{it.name}</span>
            <span className="comp-count">{it.right}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatDonut({ title, sub, span, centerNum, centerLabel, segs }) {
  const C = 2 * Math.PI * 62;
  let acc = 0;
  const sum = segs.reduce((s, x) => s + x.n, 0);
  return (
    <section className={"card span-" + (span || 6)} data-screen-label={title}>
      <div className="card-head" style={{ marginBottom: 4 }}>
        <span className="card-title">{title}</span>
        {sub ? <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</span> : null}
      </div>
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <svg width="160" height="160" viewBox="0 0 170 170" role="img" aria-label={title}>
          <circle cx="85" cy="85" r="62" fill="none" stroke="#F0F0F3" strokeWidth="17"></circle>
          {segs.map((d, i) => {
            const frac = d.n / sum; const dash = frac * C; const off = -acc; acc += dash;
            return <circle key={d.name} cx="85" cy="85" r="62" fill="none" stroke={d.color} strokeWidth="17"
              strokeDasharray={(dash - 2) + " " + (C - dash + 2)} strokeDashoffset={off} transform="rotate(-90 85 85)"><title>{d.name}: {d.n}</title></circle>;
          })}
          <text x="85" y="81" textAnchor="middle" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px", fill: "var(--ink)", fontFamily: "Inter" }}>{centerNum}</text>
          <text x="85" y="99" textAnchor="middle" style={{ fontSize: 11, fill: "var(--ink-3)", fontFamily: "Inter" }}>{centerLabel}</text>
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          {segs.map(d => (
            <div key={d.name} className="lb-row">
              <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color, flexShrink: 0 }} aria-hidden="true"></span>
              <span className="lb-name" style={{ flex: 1 }}>{d.name}</span>
              <span className="lb-score">{d.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SentimientoCard() {
  const total = 1766, neu = 1481, pos = 241, neg = 44;
  return (
    <section className="card span-6" data-screen-label="Sentimiento del cliente">
      <div className="card-label">Sentimiento del cliente</div>
      <div className="ratio-bar" style={{ marginTop: 16 }}>
        <div className="ratio-seg" style={{ background: "#9CA3AF", width: (neu / total * 100) + "%" }}>{neu}</div>
        <div className="ratio-seg" style={{ background: "var(--green)", width: (pos / total * 100) + "%" }}></div>
        <div className="ratio-seg" style={{ background: "var(--red)", width: (neg / total * 100) + "%" }}></div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <SentPill kind="neu" label="Neutro " count={neu} />
        <SentPill kind="pos" label="Positivo " count={pos} />
        <SentPill kind="neg" label="Negativo " count={neg} />
      </div>
      <div className="card-sub" style={{ marginTop: 12 }}>sobre {total} atenciones analizadas</div>
    </section>
  );
}

function MotivosPorCanal() {
  const caja = [
    { name: "Otro", n: 525 }, { name: "Depósito", n: 149 }, { name: "Pago", n: 111 },
    { name: "Retiro", n: 108 }, { name: "Consulta", n: 64 }, { name: "Operaciones de caja", n: 56 },
    { name: "Otros motivos", n: 47 }, { name: "Indeterminado", n: 36 },
  ];
  const sac = [
    { name: "Otros motivos", n: 39 }, { name: "Consulta", n: 8 }, { name: "Tarjeta", n: 6 },
    { name: "Reclamo", n: 6 }, { name: "Pagos y transferencias", n: 2 }, { name: "No determinable", n: 2 },
    { name: "Canales digitales", n: 2 }, { name: "Reclamos", n: 1 },
  ];
  const col = (rows, max) => (
    <div style={{ flex: 1, minWidth: 280 }}>
      {rows.map(r => (
        <div className="hbar-row" key={r.name} title={r.name + ": " + r.n}>
          <span className="hbar-label" style={{ width: 150 }}>{r.name}</span>
          <div className="hbar-track"><div className="hbar" style={{ width: (r.n / max) * 100 + "%", background: "var(--red)" }}></div></div>
          <span className="hbar-val" style={{ width: 40 }}>{r.n}</span>
        </div>
      ))}
    </div>
  );
  return (
    <section className="card span-12" data-screen-label="Motivos por canal">
      <div className="card-head" style={{ marginBottom: 10 }}>
        <span className="card-title">Motivos por canal <InfoDot text="Distribución de motivos de atención según el canal (Caja y SAC)." /></span>
      </div>
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="card-label">Caja</span>
            <span className="pill sm neu">1.284 atenciones</span>
          </div>
          {col(caja, 525)}
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="card-label">SAC</span>
            <span className="pill sm neu">88 atenciones</span>
          </div>
          {col(sac, 39)}
        </div>
      </div>
    </section>
  );
}

function GlobalKpis() {
  return (
    <React.Fragment>
      <Stat className="primary-card" label="Total atenciones" value="1.766" sub="Transcripciones analizadas" />
      <Stat label="Resueltas" value="643" tone="var(--green)" sub="36.41% de resolución" />
      <Stat className="alert-card" label="No resuelto" value="21" tone="var(--red)" sub="Pendientes" />
      <Stat label="Score promedio" value="2.3" sub="Calificación" info="Calificación promedio de las atenciones analizadas." />
    </React.Fragment>
  );
}

function slaTone(v) { return v >= 60 ? "var(--green)" : v >= 50 ? "var(--amber)" : "var(--red)"; }

/* ══════════ TAB COMERCIAL ══════════ */
function Comercial() {
  const productos = [
    { name: "Tarjeta de crédito", n: 195 }, { name: "Tarjeta", n: 86 }, { name: "Depósito", n: 84 },
    { name: "Cheque", n: 51 }, { name: "Tarjeta de débito", n: 39 }, { name: "Préstamo", n: 35 },
  ];
  const objeciones = [
    { name: "Aumento de categoría de tarjeta", right: 2 }, { name: "Falta de notificación previa", right: 2 },
    { name: "Confusión sobre cobro", right: 1 }, { name: "Objeción “12”", right: 1 },
    { name: "Objeción “18”", right: 1 }, { name: "Objeción “20”", right: 1 },
  ];
  const etapas = [
    { name: "Cierre", n: 100 }, { name: "Oferta", n: 52 }, { name: "Sondeo", n: 74 }, { name: "Apertura", n: 82 },
  ];
  return (
    <div className="grid" data-screen-label="Comercial">
      <GlobalKpis />

      <SecHead icon="storefront" title="Comercial" sub="Ofrecimiento, cierre y eficiencia ponderada" />
      <Stat label="Productos ofrecidos (prom.)" value="0.1" info="Cantidad promedio de productos ofrecidos por atención." />
      <Stat label="Atenciones con ≥2 alternativas" value="2.0" unit="%" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Cierres efectivos" value="11" sub="0.6% · sobre 1.766 atenciones analizadas" />
      <Stat label="Información exacta" value="41.7" unit="%" sub="sobre 1.766 atenciones analizadas" />

      <Stat span={4} label="Eficiencia ponderada (prom.)" value="5" unit="/100" sub="Ponderación 10/25/25/15" info="Índice ponderado de apertura, sondeo, oferta y cierre." />
      <HBarList span={8} title="Etapas con más quiebres" sub="etapas donde se pierde la venta" items={etapas} hideVal />

      <HBarList span={6} title="Productos más mencionados" items={productos} max={195} />
      <RankList span={6} title="Objeciones más frecuentes" items={objeciones} />

      <SecHead icon="hand-heart" title="Servicio" sub="Cumplimiento de protocolo y experiencia del cliente" />
      <Stat label="Cumplimiento de script" value="5.6" unit="%" tone="var(--red)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Escucha activa" value="12.5" unit="%" tone="var(--amber)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Confirmación operación" value="9.2" unit="%" tone="var(--red)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Resolución primer contacto" value="36.4" unit="%" sub="sobre 1.766 atenciones analizadas" />

      <SentimientoCard />
      <StatDonut title="Quejas" sub="Total detectado: 88" centerNum="88" centerLabel="quejas" segs={[
        { name: "Procesos", n: 75, color: OKABE[7] }, { name: "Mal servicio", n: 5, color: OKABE[3] },
        { name: "Infraestructura", n: 5, color: OKABE[4] }, { name: "Libro de quejas", n: 2, color: OKABE[1] },
        { name: "Conflictivo", n: 1, color: OKABE[6] },
      ]} />

      <Stat span={4} label="Felicitaciones del cliente" value="28" tone="var(--green)" />
      <Stat span={4} label="Interrupciones sin saludo" value="4" tone="var(--amber)" />
      <Stat span={4} label="Promoción de encuesta" value="0.0" unit="%" tone="var(--red)" />

      <RankList span={12} title="Aspectos a trabajar" sub="por volumen de atenciones afectadas" items={[
        { name: "Sin promoción de encuesta", right: "1.766 atenciones" },
        { name: "Bajo cumplimiento de script", right: "1.764 atenciones" },
        { name: "Sin confirmación de operación", right: "1.604 atenciones" },
        { name: "Sin escucha activa", right: "1.545 atenciones" },
        { name: "Sin resolución en primer contacto", right: "1.124 atenciones" },
        { name: "Interrupciones sin saludo", right: "4 atenciones" },
      ]} />
    </div>
  );
}

/* ══════════ TAB CAJA ══════════ */
function Caja() {
  const tipoConsulta = [
    { name: "Otro", n: 700 }, { name: "Depósito", n: 120 }, { name: "Consulta", n: 96 },
    { name: "Pago", n: 82 }, { name: "Retiro", n: 71 }, { name: "Otros motivos", n: 55 },
    { name: "Operaciones de caja (extracción o depósito)", n: 50 }, { name: "Indeterminado", n: 40 },
    { name: "Desconocido", n: 34 }, { name: "Reclamo", n: 29 }, { name: "Tarjeta", n: 25 },
    { name: "Cheque", n: 21 }, { name: "Otras operaciones de caja", n: 17 },
    { name: "Pago de tarjeta de crédito", n: 13 }, { name: "Préstamo", n: 10 },
    { name: "Pagos y transferencias", n: 8 }, { name: "Apertura de cuenta", n: 6 },
  ];
  const horas = [
    { name: "Jaqueline Mishelle A.", n: 2.1 }, { name: "Daring Ashanti V.", n: 1.5 },
    { name: "Dulce Alexandra I.", n: 1.35 }, { name: "Jaqueline Vanessa B.", n: 0.9 },
    { name: "Drery Castañeda", n: 0.2 },
  ];
  const efic = [
    { name: "Jaqueline Vanessa Barillas Chen", at: 83, prom: "14m 13s", sla: 61.9 },
    { name: "Dulce Alexandra Ixcoy Yool", at: 276, prom: "9m 44s", sla: 60.0 },
    { name: "Jaqueline Mishelle Alcantara Orozco", at: 637, prom: "5m 32s", sla: 56.0 },
    { name: "Daring Ashanti Valencia Rosales", at: 516, prom: "5m 49s", sla: 49.2 },
  ].map(e => ({
    name: e.name,
    right: (<span style={{ fontSize: 12.5, color: "var(--ink-2)", fontVariantNumeric: "tabular-nums" }}>
      {e.at} at. · {e.prom} prom · <b style={{ color: slaTone(e.sla) }}>{e.sla.toFixed(1)}% SLA</b>
    </span>),
  }));
  return (
    <div className="grid" data-screen-label="Caja">
      <GlobalKpis />

      <SecHead icon="timer" title="SLA" sub="Tiempo de atención y tipo de consulta" />
      <Stat span={6} label="Cumplimiento Caja (< 4 min)" value="53.0" unit="%" tone="var(--amber)" sub="609 / 1.148 atenciones" />
      <Stat span={6} label="Cumplimiento SAC (< 9 min)" value="59.6" unit="%" tone="var(--amber)" sub="34 / 57 atenciones" />

      <HBarList span={12} title="Tipo de consulta" sub="volumen por motivo de atención" items={tipoConsulta} max={700} />
      <RankList span={12} title="Eficiencia por ejecutivo" sub="atenciones, tiempo promedio y cumplimiento SLA" items={efic} />
      <MotivosPorCanal />

      <SecHead icon="wrench" title="Operativo" sub="Incidencias y derivaciones detectadas en las atenciones" />
      <Stat label="'No hay sistema'" value="9" tone="var(--red)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="'No hay sencillo'" value="4" tone="var(--amber)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Falta vuelto / efectivo" value="2" tone="var(--amber)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Derivaciones externas" value="38" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Derivación a central" value="3" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Derivación a cobros" value="4" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Espera por supervisor" value="8" tone="var(--amber)" sub="sobre 1.766 atenciones analizadas" />
      <Stat label="Promoción canal digital" value="3.3" unit="%" sub="sobre 1.766 atenciones analizadas" />

      <RankList span={6} title="Procesos más tardados" items={[
        { name: "Actualización de número de teléfono", right: "1 atención · 61m 06s" },
        { name: "Cambio de correo electrónico", right: "1 atención · 40m 57s" },
        { name: "División de pagos sin interés", right: "1 atención · 34m 55s" },
        { name: "Cancelación de seguro y tarjeta", right: "1 atención · 34m 53s" },
        { name: "Pago de membresía de tarjeta", right: "1 atención · 34m 31s" },
      ]} />
      <HBarList span={6} title="Horas activas por ejecutivo" sub="promedio diario" items={horas} max={2.2} unit="h" />

      <StatDonut span={12} title="Motivos de no resolución" sub="Total: 169" centerNum="169" centerLabel="no resueltas" segs={[
        { name: "Información incompleta", n: 52, color: OKABE[0] },
        { name: "Derivado a otra agencia", n: 23, color: OKABE[1] },
        { name: "Operación no completada", n: 14, color: OKABE[2] },
        { name: "No se presentó", n: 9, color: OKABE[3] },
        { name: "Derivado a otra área", n: 7, color: OKABE[4] },
        { name: "Operación rechazada por el sistema", n: 5, color: OKABE[7] },
      ]} />
    </div>
  );
}

// Main app — navigation + tweaks
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "estado": "normal",
  "listaVacia": false,
  "rankingPublico": true,
  "datosInsuficientes": false,
  "nubePalabras": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState("Resumen");
  const [drawer, setDrawer] = React.useState(false);
  const [topic, setTopic] = React.useState(null);
  const [filters, setFilters] = React.useState({ periodo: null, sucursales: [], ejecutivos: [], interpretable: null, keyword: null });

  const openDetail = () => setDrawer(true);
  const closeDrawer = () => setDrawer(false);

  React.useEffect(() => {
    if (!drawer && !topic) return;
    const onKey = e => { if (e.key === "Escape") { setDrawer(false); setTopic(null); } };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [drawer, topic]);

  const variant = t.estado === "bloqueado" ? "locked"
    : t.estado === "día 1" ? "day1"
    : t.estado === "config. pendiente" ? "setup"
    : "normal";

  return (
    <React.Fragment>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Sidebar />
      <main className="main" id="contenido">
        <div className="topbar">
          <h1 className="page-title">Speech Analytics</h1>
          <ExportMenu />
        </div>
        {/* Filtros globales: aplican a todas las tabs */}
        <FilterRow filters={filters} onChange={setFilters} />
        <ActiveFiltersBar filters={filters} onChange={setFilters} />
        <Tabs tab={tab} onTab={setTab} />
        {tab === "Resumen" ? (
          <Dashboard variant={variant}
            rankingPublico={t.rankingPublico}
            onGoTemas={() => setTab("Temas")}
            onOpenProfile={() => setTab("Performance de usuarios")}
            onDrillToInteractions={() => setTab("Transcripciones")}
            activeKeyword={filters.keyword}
            onFilterKeyword={kw => setFilters(f => ({ ...f, keyword: f.keyword === kw ? null : kw }))} />
        ) : null}
        {tab === "Comercial" ? <Comercial /> : null}
        {tab === "Caja" ? <Caja /> : null}
        {tab === "Temas" ? (
          <InsightsTemas full nubeHabilitada={t.nubePalabras} onDrillTopic={setTopic} />
        ) : null}
        {tab === "Transcripciones" ? (
          <Interactions onOpenDetail={openDetail} forceEmpty={t.listaVacia} />
        ) : null}
        {tab === "Performance de usuarios" ? (
          <Profile onOpenDetail={openDetail} datosInsuficientes={t.datosInsuficientes}
            onGoInteractions={() => setTab("Transcripciones")} />
        ) : null}
        {tab === "Agencias" ? <Agencias /> : null}
      </main>

      <AiFab />

      {topic ? (
        <div className="drawer-backdrop" onClick={e => { if (e.target === e.currentTarget) setTopic(null); }}>
          <aside className="drawer" role="dialog" aria-label="Detalle de tema">
            <TopicDetail topic={topic} onClose={() => setTopic(null)}
              onOpenDetail={() => { setTopic(null); setDrawer(true); }} />
          </aside>
        </div>
      ) : null}

      {drawer ? (
        <div className="drawer-backdrop" onClick={e => { if (e.target === e.currentTarget) closeDrawer(); }}>
          <aside className="drawer" role="dialog" aria-label="Detalle de interacción">
            <Detail onBack={closeDrawer} locked={variant === "locked" || variant === "setup"} drawer />
          </aside>
        </div>
      ) : null}

      <TweaksPanel>
        <TweakSection label="Estados" />
        <TweakSelect label="Dashboard" value={t.estado}
          options={["normal", "bloqueado", "día 1", "config. pendiente"]}
          onChange={v => setTweak("estado", v)} />
        <TweakToggle label="Lista de interacciones vacía" value={t.listaVacia}
          onChange={v => setTweak("listaVacia", v)} />
        <TweakToggle label="Ranking público de ejecutivos" value={t.rankingPublico}
          onChange={v => setTweak("rankingPublico", v)} />
        <TweakToggle label="Datos insuficientes (perfil)" value={t.datosInsuficientes}
          onChange={v => setTweak("datosInsuficientes", v)} />
        <TweakSection label="Configuración del cliente" />
        <TweakToggle label="Vista nube de palabras" value={t.nubePalabras}
          onChange={v => setTweak("nubePalabras", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
