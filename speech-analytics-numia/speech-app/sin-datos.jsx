/* Path "sin datos" — estados del panel cuando no hay transcripciones */
const { useState: useStateE } = React;

const Icon = ({ n, fill, style }) => <i className={(fill ? "ph-fill ph-" : "ph ph-") + n} style={style} aria-hidden="true"></i>;

const TABS_E = ["Resumen", "Comercial", "Caja", "Interacciones", "Performance de usuarios", "Agencias"];

/* ── Chips de filtro (solo lectura, para explicar el vacío) ── */
function ChipRO({ icon, label, muted }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px",
      borderRadius: 999, border: "1px solid var(--border)", background: muted ? "#F6F6F8" : "var(--card)",
      fontSize: 13, color: muted ? "var(--ink-3)" : "var(--ink-2)", whiteSpace: "nowrap",
    }}>
      <Icon n={icon} style={{ fontSize: 14 }} />{label}
    </span>
  );
}

/* ── Bloque de estado vacío ── */
function Empty({ icon, title, body, primary, secondary, link, children, tone }) {
  const tint = tone === "warn" ? "var(--amber-bg)" : tone === "info" ? "var(--blue-bg)" : "var(--purple-tint)";
  const fg = tone === "warn" ? "var(--amber)" : tone === "info" ? "var(--blue)" : "var(--purple)";
  return (
    <section className="card span-12" style={{ padding: "56px 32px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span style={{ width: 64, height: 64, borderRadius: "50%", background: tint, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          <Icon n={icon} fill />
        </span>
        <h3 style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.2px", textWrap: "pretty" }}>{title}</h3>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, textWrap: "pretty" }}>{body}</p>
        {children}
        {(primary || secondary) ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            {primary ? <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon n={primary.icon} />{primary.label}</button> : null}
            {secondary ? <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon n={secondary.icon} />{secondary.label}</button> : null}
          </div>
        ) : null}
        {link ? <a href="#" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }} onClick={e => e.preventDefault()}>{link} →</a> : null}
      </div>
    </section>
  );
}

/* ── KPI cards sin dato: la tarjeta existe, el valor no ── */
function KpiVacia({ label }) {
  return (
    <div style={{ display: "flex" }}>
      <section className="card" style={{ opacity: 0.75, width: "100%" }}>
        <div className="card-label">{label}</div>
        <div style={{ fontSize: 32, fontWeight: 600, color: "var(--ink-3)", lineHeight: 1.1, marginTop: 6 }}>—</div>
        <div className="card-sub" style={{ marginTop: 4 }}>Sin dato en el período</div>
      </section>
    </div>
  );
}

function KpisVacias({ labels }) {
  return (
    <div className="span-12" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
      {labels.map(l => <KpiVacia key={l} label={l} />)}
    </div>
  );
}

/* ── Tabla vacía (Interacciones / Performance / Agencias) ── */
function TablaVacia({ cols, mensaje, accion }) {
  return (
    <section className="card span-12" style={{ padding: "8px 16px 16px" }}>
      <div style={{ overflowX: "auto" }}>
        <table className="data" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>{cols.map(c => <th key={c} style={{ textAlign: "left", padding: "10px 12px", whiteSpace: "nowrap", color: "var(--ink-3)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{c}</th>)}</tr>
          </thead>
        </table>
      </div>
      <div className="empty-state" style={{ padding: "48px 20px" }}>
        <div className="es-circle"><Icon n="table" /></div>
        <p>{mensaje}</p>
        <span style={{ fontSize: 13, color: "var(--ink-3)", maxWidth: 380, textWrap: "pretty" }}>{accion}</span>
      </div>
    </section>
  );
}

/* ── Detalle de descartes (estado "audio no interpretable") ── */
function Descartes() {
  const rows = [
    ["Volumen por debajo del mínimo", 118],
    ["Grabación cortada antes de 20 s", 96],
    ["Canal único (sin separación de voces)", 61],
    ["Ruido ambiente sobre el umbral", 27],
    ["Archivo corrupto", 10],
  ];
  return (
    <div style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", marginTop: 4 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <tbody>
          {rows.map(([name, n], i) => (
            <tr key={name}>
              <td style={{ padding: "9px 12px", textAlign: "left", color: "var(--ink-2)", borderTop: i ? "1px solid var(--border)" : "none" }}>{name}</td>
              <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", borderTop: i ? "1px solid var(--border)" : "none" }}>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pasos de puesta en marcha ── */
function Pasos({ done }) {
  const steps = [
    { n: 1, label: "Conectar el origen de audio", sub: "Grabador de la agencia o carpeta en la nube" },
    { n: 2, label: "Recibir las primeras grabaciones", sub: "Se validan formato y calidad" },
    { n: 3, label: "Transcribir y analizar", sub: "El panel se habilita automáticamente" },
  ];
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, marginTop: 4, textAlign: "left" }}>
      {steps.map(s => {
        const ok = s.n <= done;
        const cur = s.n === done + 1;
        return (
          <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "11px 12px", borderRadius: 8, background: cur ? "var(--purple-tint)" : "transparent" }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600,
              background: ok ? "var(--green-bg)" : cur ? "var(--purple)" : "#F0F0F3",
              color: ok ? "var(--green)" : cur ? "#fff" : "var(--ink-3)",
            }}>{ok ? <Icon n="check" style={{ fontSize: 12 }} /> : s.n}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: ok || cur ? "var(--ink)" : "var(--ink-3)" }}>{s.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Progreso de transcripción ── */
function Progreso({ hechas, total }) {
  const pct = Math.round((hechas / total) * 100);
  return (
    <div style={{ width: "100%", maxWidth: 380, marginTop: 2 }}>
      <div style={{ height: 6, borderRadius: 3, background: "#F0F0F3", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: 3, background: "var(--purple)" }}></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-3)", marginTop: 7 }}>
        <span>{hechas} de {total} transcritas</span><span>{pct}%</span>
      </div>
    </div>
  );
}

/* ══════════ Estados del path ══════════ */
const ESTADOS = [
  { id: "integracion", label: "Sin integración", sub: "Día 1" },
  { id: "procesando", label: "Procesando", sub: "Transcripción en curso" },
  { id: "periodo", label: "Sin datos en el período", sub: "Filtro sin resultados" },
  { id: "noInterpretable", label: "Audio no interpretable", sub: "Nada pudo transcribirse" },
];

function contenido(estado, tab) {
  const tablas = {
    "Interacciones": { cols: ["ID", "Fecha", "Ejecutivo", "Duración", "Motivo", "Resultado", "Puntuación"], m: "No hay transcripciones para listar" },
    "Performance de usuarios": { cols: ["#", "Ejecutivo", "Rol", "Agencia", "Atenciones", "Conversión", "Score"], m: "No hay actividad de usuarios para rankear" },
    "Agencias": { cols: ["#", "Agencia", "Usuarios", "Atenciones", "Conversión", "Score"], m: "No hay actividad de agencias para comparar" },
  };

  if (estado === "integracion") return (
    <Empty icon="plugs" tone="info"
      title="Todavía no hay grabaciones conectadas"
      body="Speech Analytics necesita recibir las grabaciones de las agencias para generar métricas. Conecte el origen de audio o cargue un lote de prueba para comenzar."
      primary={{ icon: "plug", label: "Conectar origen de audio" }}
      secondary={{ icon: "upload-simple", label: "Cargar lote de prueba" }}
      link="Ver requisitos de audio">
      <Pasos done={0} />
    </Empty>
  );

  if (estado === "procesando") return (
    <Empty icon="waveform" tone="info"
      title="Estamos transcribiendo las primeras grabaciones"
      body="Recibimos 248 grabaciones de Sucursal Centro. El panel se habilita en cuanto termine la transcripción; puede demorar unos minutos."
      secondary={{ icon: "arrow-clockwise", label: "Actualizar" }}>
      <Progreso hechas={112} total={248} />
      <span style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>Le avisaremos por correo cuando el análisis esté disponible.</span>
    </Empty>
  );

  if (estado === "noInterpretable") {
    if (tablas[tab]) return <TablaVacia cols={tablas[tab].cols} mensaje={tablas[tab].m} accion="Ninguna grabación del período pudo transcribirse. Revise los requisitos de audio para habilitar el análisis." />;
    return (
      <Empty icon="microphone-slash" tone="warn"
        title="Ninguna grabación del período pudo transcribirse"
        body="Se recibieron 312 grabaciones, pero el audio no alcanzó la calidad mínima para transcribir. Corrija el origen y vuelva a enviar el lote."
        primary={{ icon: "book-open", label: "Ver requisitos de audio" }}
        secondary={{ icon: "list-magnifying-glass", label: "Revisar 312 descartadas" }}>
        <Descartes />
      </Empty>
    );
  }

  // estado === "periodo"
  if (tablas[tab]) return <TablaVacia cols={tablas[tab].cols} mensaje={tablas[tab].m} accion="No se registraron atenciones con audio del 1 al 7 de julio. Amplíe el período o quite filtros." />;
  const labelsPorTab = {
    "Resumen": ["Total atenciones interpretables", "Cumplimiento de pitch", "CSAT estimado", "Score promedio"],
    "Comercial": ["Total atenciones", "Resueltas", "No resueltas", "Score promedio"],
    "Caja": ["Total atenciones", "Resueltas", "No resueltas", "Score promedio"],
  };
  return (
    <React.Fragment>
      <KpisVacias labels={labelsPorTab[tab] || labelsPorTab["Resumen"]} />
      <Empty icon="calendar-x"
        title="No hay transcripciones en el período seleccionado"
        body="Del 1 al 7 de julio no se registraron atenciones con audio en Sucursal Centro para Ana Riquelme. Amplíe el período o quite filtros para ver resultados."
        primary={{ icon: "calendar-plus", label: "Ampliar a últimos 30 días" }}
        secondary={{ icon: "x", label: "Limpiar filtros" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 2 }}>
          <ChipRO icon="calendar-blank" label="1 – 7 jul 2026" />
          <ChipRO icon="storefront" label="Sucursal Centro" />
          <ChipRO icon="user" label="Ana Riquelme" />
        </div>
      </Empty>
    </React.Fragment>
  );
}

function SinDatos() {
  const [estado, setEstado] = useStateE("periodo");
  const [tab, setTab] = useStateE("Resumen");
  const conFiltros = estado === "periodo" || estado === "noInterpretable";
  const conTabs = estado !== "integracion";

  return (
    <React.Fragment>
      <main className="main" id="contenido" style={{ paddingBottom: 130 }}>
        <div className="topbar">
          <div>
            <h1 className="page-title">Speech Analytics</h1>
            <div className="page-sub">Numia · Sucursal Centro</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
            <button className="btn-primary" disabled title="Necesita al menos una transcripción en el período"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", opacity: 0.4, cursor: "not-allowed" }}>
              <Icon n="sparkle" fill />Generar insights
            </button>
            <button className="chip" disabled title="No hay datos para exportar" style={{ opacity: 0.4, cursor: "not-allowed" }}>
              <Icon n="export" />Exportar<Icon n="caret-down" />
            </button>
          </div>
        </div>

        {conTabs ? (
          <div className="tabs">
            {TABS_E.map(t => (
              <button key={t} className={"tab" + (t === tab ? " on active" : "")} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
        ) : <div style={{ height: 18 }}></div>}

        {conFiltros ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <ChipRO icon="calendar-blank" label="1 – 7 jul 2026" />
            <ChipRO icon="storefront" label="Sucursal Centro" />
            <ChipRO icon="user" label="Ana Riquelme" />
            <button className="link-btn" style={{ marginLeft: 4 }}>Limpiar filtros</button>
          </div>
        ) : null}

        <div className="grid">{contenido(estado, tab)}</div>
      </main>

      {/* Selector de estado del path (control de prototipo) */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderTop: "1px solid var(--border)",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)" }}>Path sin datos</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ESTADOS.map((e, i) => {
            const on = e.id === estado;
            return (
              <button key={e.id} onClick={() => setEstado(e.id)} style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1,
                padding: "6px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: "1px solid " + (on ? "var(--purple)" : "var(--border)"),
                background: on ? "var(--purple-tint)" : "var(--card)",
                color: on ? "var(--purple)" : "var(--ink-2)",
              }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{i + 1}. {e.label}</span>
                <span style={{ fontSize: 11, color: on ? "var(--purple)" : "var(--ink-3)", opacity: on ? 0.8 : 1 }}>{e.sub}</span>
              </button>
            );
          })}
        </div>
        <a href="index.html" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>Ir al panel con datos →</a>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<SinDatos />);
