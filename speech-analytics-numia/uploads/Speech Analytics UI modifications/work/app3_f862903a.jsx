// Screen 2 — Transcripciones list
const { useState: useStateI } = React;

const INTERACTIONS = [
  { id: "#4521", fecha: "15/07/2026, 11:42", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 2", exec: "Jaqueline Mishelle Alcantara Orozco", ini: "J", dur: "8:10", motivo: "Otras operaciones", sent: "neu", resultado: "Resuelto", punt: 5, estado: "Analizado", review: true, reviewReason: "Disclosure de tasas ausente", reviewSev: "crit" },
  { id: "#4518", fecha: "15/07/2026, 11:05", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 2", exec: "Jaqueline Mishelle Alcantara Orozco", ini: "J", dur: "1:36", motivo: "Operaciones de caja", sent: "neg", resultado: "No resuelto", punt: 6, estado: "Analizado", review: true, reviewReason: "Escalación a defensoría", reviewSev: "crit" },
  { id: "#4515", fecha: "15/07/2026, 10:48", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 1", exec: "Daring Ashanti Valencia Rosales", ini: "D", dur: "6:03", motivo: "Consulta de crédito", sent: "neg", resultado: "No resuelto", punt: 3, estado: "Analizado", review: true, reviewReason: "Satisfacción estimada baja", reviewSev: "warn" },
  { id: "#4512", fecha: "15/07/2026, 10:22", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 3", exec: "Jaqueline Vanessa Barillas Chen", ini: "J", dur: "5:44", motivo: "Apertura de cuenta", sent: "pos", resultado: "Resuelto", punt: 9, estado: "Analizado" },
  { id: "#4508", fecha: "15/07/2026, 09:58", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Plataforma", exec: "Daring Ashanti Valencia Rosales", ini: "D", dur: "9:21", motivo: "Consulta de inversión", sent: "pos", resultado: "Resuelto", punt: 8, estado: "Analizado" },
  { id: "#4504", fecha: "15/07/2026, 09:31", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 2", exec: "Jaqueline Mishelle Alcantara Orozco", ini: "J", dur: "4:15", motivo: "Bloqueo de tarjeta", sent: "neu", resultado: "Resuelto", punt: 6, estado: "Analizado" },
  { id: "#4499", fecha: "15/07/2026, 09:02", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 1", exec: "Jaqueline Vanessa Barillas Chen", ini: "J", dur: "7:50", motivo: "Crédito hipotecario", sent: "pos", resultado: "Resuelto", punt: 7, estado: "Analizado" },
  { id: "#4495", fecha: "14/07/2026, 17:36", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 3", exec: "Daring Ashanti Valencia Rosales", ini: "D", dur: "10:08", motivo: "Reclamo de cargos", sent: "neg", resultado: "No resuelto", punt: 4, estado: "Analizado" },
  { id: "#4491", fecha: "14/07/2026, 17:10", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Caja 2", exec: "Jaqueline Mishelle Alcantara Orozco", ini: "J", dur: "5:27", motivo: "Consulta de app", sent: "neu", resultado: "Resuelto", punt: 6, estado: "Analizado" },
  { id: "#4488", fecha: "14/07/2026, 16:44", suc: "SUCURSAL CENTRO", canal: "CAJA", puesto: "Plataforma", exec: "Jaqueline Vanessa Barillas Chen", ini: "J", dur: "6:55", motivo: "Seguro de vida", sent: "pos", resultado: "Resuelto", punt: 8, estado: "Analizado" },
];

const AGENTES_T = ["Jaqueline Mishelle Alcantara Orozco", "Daring Ashanti Valencia Rosales", "Jaqueline Vanessa Barillas Chen"];
const SUCURSALES_T = ["SUCURSAL CENTRO", "SUCURSAL NORTE", "SUCURSAL SUR", "SUCURSAL ESTE"];
const MOTIVOS_T = ["Otras operaciones", "Operaciones de caja", "Consulta de crédito", "Apertura de cuenta", "Consulta de inversión", "Bloqueo de tarjeta", "Reclamo de cargos"];
const CANALES_T = ["CAJA", "Teléfono", "Video llamada"];

function selStyle() {
  return { width: "100%", height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontFamily: "inherit", fontSize: 13, color: "var(--ink)", cursor: "pointer" };
}

function FilterField({ label, value, onChange, options, type }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-2)" }}>{label}</label>
      {type === "date" ? (
        <input type="date" value={value} onChange={e => onChange(e.target.value)} style={selStyle()} />
      ) : (
        <select value={value} onChange={e => onChange(e.target.value)} style={selStyle()}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </div>
  );
}

const FILTER_DEFAULTS = {
  sucursal: "Todas las sucursales", agente: "Todos los agentes", resultado: "Todos",
  motivo: "Todos", canal: "Todos", durMin: "Sin mínimo", durMax: "Sin máximo",
  desde: "", hasta: "", puntMin: "Sin mínimo",
};

function Interactions({ onOpenDetail, forceEmpty }) {
  const [q, setQ] = useStateI("");
  const [sort, setSort] = useStateI({ col: "fecha", dir: "desc" });
  const [page, setPage] = useStateI(1);
  const [ff, setFf] = useStateI(FILTER_DEFAULTS);
  const setField = (k, v) => setFf(s => ({ ...s, [k]: v }));

  let rows = INTERACTIONS.filter(r =>
    !q || (r.exec + " " + r.motivo + " " + r.suc + " " + r.id + " " + r.puesto).toLowerCase().includes(q.toLowerCase())
  );
  const empty = forceEmpty || rows.length === 0;

  const cols = [
    ["exec", "Agente"], ["puesto", "Puesto"], ["dur", "Duración"], ["suc", "Sucursal"],
    ["fecha", "Fecha"], ["motivo", "Motivo"], ["resultado", "Resultado"], ["punt", "Puntuación"],
    ["estado", "Estado"], ["", "Acciones"],
  ];
  const sortBy = col => {
    if (!col) return;
    setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));
  };
  if (sort.col) {
    rows = [...rows].sort((a, b) => {
      const va = a[sort.col], vb = b[sort.col];
      const cmp = String(va).localeCompare(String(vb), "es", { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }
  const reviews = INTERACTIONS.filter(r => r.review);
  const clearAll = () => { setFf(FILTER_DEFAULTS); };

  return (
    <React.Fragment>
      <div className="filter-row" style={{ paddingTop: 0 }}>
        <div className="search-bar">
          <Ph name="magnifying-glass" />
          <input placeholder="Buscar por palabra clave, agente, motivo…" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} />
        </div>
      </div>

      {/* Panel de filtros */}
      <section className="card" style={{ marginBottom: 20 }} data-screen-label="Filtros de transcripciones">
        <div className="card-head" style={{ marginBottom: 14, alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--red-bg)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ph-fill ph-funnel" style={{ fontSize: 18 }}></i>
            </span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Filtros</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Refiná tu búsqueda</div>
            </div>
          </div>
          <button className="link-btn" style={{ display: "inline-flex", alignItems: "center", gap: 5 }} onClick={clearAll}>
            <i className="ph ph-x"></i>Limpiar filtros
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          <FilterField label="Resultado" value={ff.resultado} onChange={v => setField("resultado", v)} options={["Todos", "Resuelto", "No resuelto"]} />
          <FilterField label="Motivo" value={ff.motivo} onChange={v => setField("motivo", v)} options={["Todos", ...MOTIVOS_T]} />
          <FilterField label="Canal" value={ff.canal} onChange={v => setField("canal", v)} options={["Todos", ...CANALES_T]} />
          <FilterField label="Duración mín." value={ff.durMin} onChange={v => setField("durMin", v)} options={["Sin mínimo", "1 min", "3 min", "5 min", "10 min"]} />
          <FilterField label="Duración máx." value={ff.durMax} onChange={v => setField("durMax", v)} options={["Sin máximo", "5 min", "10 min", "15 min", "30 min"]} />
          <FilterField label="Desde" value={ff.desde} onChange={v => setField("desde", v)} type="date" />
          <FilterField label="Hasta" value={ff.hasta} onChange={v => setField("hasta", v)} type="date" />
          <FilterField label="Puntuación mín." value={ff.puntMin} onChange={v => setField("puntMin", v)} options={["Sin mínimo", "3/10", "5/10", "7/10", "9/10"]} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button className="btn-secondary" onClick={clearAll}>Limpiar</button>
          <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setPage(1)}>
            <i className="ph ph-magnifying-glass"></i>Aplicar filtros
          </button>
        </div>
      </section>

      {!empty ? (
        <div className="review-strip" data-screen-label="Requieren revisión">
          <div className="strip-title"><Ph name="flag" fill style={{ color: "var(--red)" }} />Requieren revisión</div>
          <div className="review-cards">
            {reviews.map(r => (
              <div className={"review-card " + r.reviewSev} key={r.id} onClick={() => onOpenDetail(r)}>
                <div className="rc-top">
                  <span className="rc-reason">{r.reviewReason}</span>
                  <span className={"pill sm " + (r.reviewSev === "crit" ? "crit" : "warn")}>{r.reviewSev === "crit" ? "Crítica" : "Media"}</span>
                </div>
                <div className="rc-meta">
                  <span>{r.id}</span>·<span>{r.exec}</span>·<span>{r.fecha}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <section className="card" style={{ padding: "8px 16px 16px" }} data-screen-label="Tabla de transcripciones">
        {empty ? (
          <div className="empty-state">
            <div className="es-circle"><Ph name="magnifying-glass" /></div>
            <p>No hay transcripciones con estos filtros</p>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Pruebe con otro rango de fechas u otra sucursal.</span>
            <button className="btn-secondary" onClick={() => { setQ(""); clearAll(); }}>Limpiar filtros</button>
          </div>
        ) : (
          <React.Fragment>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 4px 4px" }}>
              <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>2.334 transcripciones en el período</span>
              <ExportMenu compact />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data">
                <thead>
                  <tr>
                    {cols.map(([key, label]) => (
                      <th key={label} onClick={() => sortBy(key)} style={{ whiteSpace: "nowrap" }}>
                        {label}
                        {key && sort.col === key ? <span className="sort">{sort.dir === "asc" ? "▲" : "▼"}</span> : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} onClick={() => onOpenDetail(r)}>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span className="avatar sm gray">{r.ini}</span>
                          <span style={{ fontWeight: 600 }}>{r.exec}</span>
                        </span>
                      </td>
                      <td style={{ color: "var(--ink-2)" }}>{r.puesto}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-2)" }}>{r.dur}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span>{r.suc}</span>
                          <span className="chip-gray" style={{ alignSelf: "flex-start", fontSize: 10, letterSpacing: "0.04em" }}>{r.canal}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--ink-2)", whiteSpace: "nowrap" }}>{r.fecha}</td>
                      <td><span className="chip-gray">{r.motivo}</span></td>
                      <td>
                        <span className={"pill sm " + (r.resultado === "Resuelto" ? "pos" : "neg")}>
                          <span className="dot"></span>{r.resultado}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: r.punt >= 7 ? "var(--green)" : r.punt >= 5 ? "var(--amber)" : "var(--red)", background: r.punt >= 7 ? "var(--green-bg)" : r.punt >= 5 ? "var(--amber-bg)" : "var(--red-bg)", borderRadius: 6, padding: "3px 8px", fontVariantNumeric: "tabular-nums" }}>{r.punt}/10</span>
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--green)", fontWeight: 500 }}>
                          <i className="ph-fill ph-check-circle"></i>{r.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-secondary" style={{ fontSize: 12, padding: "5px 10px" }} onClick={e => { e.stopPropagation(); onOpenDetail(r); }}>
                            <i className="ph ph-eye" style={{ marginRight: 4 }}></i>Ver
                          </button>
                          <button className="btn-secondary" aria-label="Eliminar" title="Eliminar" style={{ padding: "5px 8px", color: "var(--red)" }} onClick={e => e.stopPropagation()}>
                            <i className="ph ph-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Mostrando {rows.length} de 2.334 transcripciones</span>
              <div className="pag-btns">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                {[1, 2, 3].map(n => (
                  <button key={n} className={"pag-btn" + (page === n ? " active" : "")} onClick={() => setPage(n)}>{n}</button>
                ))}
                <span style={{ alignSelf: "center", padding: "0 4px" }}>…</span>
                <button className="pag-btn" onClick={() => setPage(234)}>234</button>
                <button className="pag-btn" onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            </div>
          </React.Fragment>
        )}
      </section>
    </React.Fragment>
  );
}

window.Interactions = Interactions;
window.INTERACTIONS = INTERACTIONS;
