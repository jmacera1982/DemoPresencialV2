// Screen 4 — Ranking de ejecutivos (Performance) + Agencias
const { useState: useStateP, useRef: useRefP } = React;

const OKABE_P = ["#4B2D8F", "#0072B2", "#56B4E9", "#E69F00", "#CC79A7", "#1A7F5A", "#9CA3AF", "#991B1B"];
const ROLES = ["Multifuncional", "Servicio al cliente", "Cajero", "Ventas"];
const SUCS_P = ["SUCURSAL CENTRO", "SUCURSAL NORTE", "SUCURSAL SUR", "SUCURSAL ESTE"];

const fmtNum = n => n.toLocaleString("es-CL");
const fmtP = v => v.toFixed(1).replace(".", ",");

function downloadText(filename, mime, text) {
  const b = new Blob([text], { type: mime });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500);
}
function toCSV(headers, rows) {
  const esc = v => { const s = String(v).replace(/"/g, '""'); return /[",;\n]/.test(s) ? '"' + s + '"' : s; };
  return [headers.join(";")].concat(rows.map(r => r.map(esc).join(";"))).join("\n");
}
function exportSvgPng(svg, filename) {
  const xml = new XMLSerializer().serializeToString(svg);
  const vb = svg.viewBox.baseVal;
  const w = (vb && vb.width) || svg.clientWidth || 680;
  const h = (vb && vb.height) || svg.clientHeight || 300;
  const img = new Image();
  img.onload = function () {
    const scale = 2, c = document.createElement("canvas");
    c.width = w * scale; c.height = h * scale;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    c.toBlob(function (b) { const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1500); });
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
}

/* ── Controles reutilizables ── */
function Segmented({ value, options, onChange }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 2 }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: "none", borderRadius: 6, padding: "6px 11px", background: value === o.v ? "var(--card)" : "transparent", color: value === o.v ? "var(--purple)" : "var(--ink-3)", boxShadow: value === o.v ? "0 1px 2px rgba(26,26,46,0.1)" : "none" }}>
          {o.icon ? <i className={"ph ph-" + o.icon}></i> : null}{o.label}
        </button>
      ))}
    </div>
  );
}
function SelectCtrl({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ height: 38, padding: "0 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontFamily: "inherit", fontSize: 13, color: "var(--ink)", cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function ExportBtn({ label, onClick }) {
  return (
    <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-end" }} onClick={onClick}>
      <i className="ph ph-download-simple"></i>{label || "Exportar"}
    </button>
  );
}

/* ── Gráfico configurable (barras / pastel / línea) exportable ── */
function ChartCard({ title, sub, span, items, colorMode }) {
  const [type, setType] = useStateP("barras");
  const svgRef = useRefP(null);
  const W = 700, H = 320, pad = 8;
  const max = Math.max.apply(null, items.map(i => i.value)) || 1;
  const color = i => colorMode === "multi" ? OKABE_P[i % OKABE_P.length] : "var(--purple)";
  const colorHex = i => colorMode === "multi" ? OKABE_P[i % OKABE_P.length] : "#4B2D8F";

  let chart = null;
  if (type === "barras") {
    const x0 = 150, x1 = 660, y0 = 20, rowH = (H - 40) / items.length;
    chart = (
      <g>
        {items.map((it, i) => {
          const y = y0 + i * rowH, bw = (it.value / max) * (x1 - x0);
          return (
            <g key={it.name}>
              <text x={x0 - 10} y={y + rowH / 2 + 4} textAnchor="end" style={{ fontSize: 12, fill: "var(--ink-2)", fontFamily: "Inter" }}>{it.name.length > 20 ? it.name.slice(0, 19) + "…" : it.name}</text>
              <rect x={x0} y={y + rowH * 0.18} width={Math.max(bw, 2)} height={rowH * 0.64} rx="4" fill={colorHex(i)}></rect>
              <text x={x0 + Math.max(bw, 2) + 8} y={y + rowH / 2 + 4} style={{ fontSize: 12, fontWeight: 600, fill: "var(--ink)", fontFamily: "Inter" }}>{it.label}</text>
            </g>
          );
        })}
      </g>
    );
  } else if (type === "pastel") {
    const cx = 165, cy = 160, r = 120, C = 2 * Math.PI * r, sum = items.reduce((s, x) => s + x.value, 0) || 1;
    let acc = 0;
    chart = (
      <g>
        {items.map((it, i) => {
          const frac = it.value / sum, dash = frac * C, off = -acc; acc += dash;
          return <circle key={it.name} cx={cx} cy={cy} r={r} fill="none" stroke={OKABE_P[i % OKABE_P.length]} strokeWidth="52"
            strokeDasharray={(dash - 2) + " " + (C - dash + 2)} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cy})`}></circle>;
        })}
        {items.map((it, i) => (
          <g key={"l" + it.name} transform={`translate(370, ${40 + i * 34})`}>
            <rect x="0" y="-9" width="13" height="13" rx="3" fill={OKABE_P[i % OKABE_P.length]}></rect>
            <text x="22" y="2" style={{ fontSize: 12.5, fill: "var(--ink-2)", fontFamily: "Inter" }}>{it.name.length > 26 ? it.name.slice(0, 25) + "…" : it.name}</text>
            <text x="300" y="2" textAnchor="end" style={{ fontSize: 12.5, fontWeight: 600, fill: "var(--ink)", fontFamily: "Inter" }}>{it.label}</text>
          </g>
        ))}
      </g>
    );
  } else {
    const x0 = 46, x1 = 670, y0 = 280, yTop = 20;
    const X = i => x0 + (items.length === 1 ? 0 : i * (x1 - x0) / (items.length - 1));
    const Y = v => y0 - (v / max) * (y0 - yTop);
    const line = items.map((it, i) => (i ? "L" : "M") + X(i).toFixed(1) + "," + Y(it.value).toFixed(1)).join(" ");
    chart = (
      <g>
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={x0} y1={Y(max * f)} x2={x1} y2={Y(max * f)} stroke="#F0F0F3" strokeWidth="1"></line>
        ))}
        <path d={line} fill="none" stroke="#4B2D8F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d={line + ` L${X(items.length - 1)},${y0} L${x0},${y0} Z`} fill="#4B2D8F" opacity="0.06"></path>
        {items.map((it, i) => (
          <g key={it.name}>
            <circle cx={X(i)} cy={Y(it.value)} r="4" fill="#4B2D8F" stroke="#fff" strokeWidth="1.5"></circle>
            <text x={X(i)} y={y0 + 20} textAnchor="middle" style={{ fontSize: 10.5, fill: "var(--ink-3)", fontFamily: "Inter" }}>{it.name.split(" ")[0]}</text>
          </g>
        ))}
      </g>
    );
  }

  return (
    <section className={"card span-" + (span || 12)} data-screen-label={title}>
      <div className="card-head" style={{ marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
        <span className="card-title">{title}{sub ? <span style={{ fontSize: 12, fontWeight: 400, color: "var(--ink-3)", marginLeft: 8 }}>{sub}</span> : null}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Segmented value={type} onChange={setType} options={[
            { v: "barras", label: "Barras", icon: "chart-bar" },
            { v: "pastel", label: "Pastel", icon: "chart-pie" },
            { v: "linea", label: "Línea", icon: "chart-line" },
          ]} />
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => exportSvgPng(svgRef.current, title + ".png")}>
              <i className="ph ph-image" style={{ marginRight: 4 }}></i>PNG
            </button>
            <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => downloadText(title + ".svg", "image/svg+xml", new XMLSerializer().serializeToString(svgRef.current))}>
              <i className="ph ph-file-svg" style={{ marginRight: 4 }}></i>SVG
            </button>
          </div>
        </div>
      </div>
      <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={title}>
        <rect width={W} height={H} fill="#fff"></rect>
        {chart}
      </svg>
    </section>
  );
}

function TeamKpi({ label, value, icon, tint, iconColor }) {
  return (
    <div style={{ display: "flex" }}>
      <section className="card" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div className="card-label">{label}</div>
          <span style={{ width: 40, height: 40, borderRadius: 10, background: tint, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className={"ph-fill ph-" + icon} style={{ fontSize: 20 }}></i>
          </span>
        </div>
        <div className="metric-value" style={{ fontSize: 32 }}>{value}</div>
      </section>
    </div>
  );
}
function KpiRow({ children }) {
  return <div className="span-12" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>{children}</div>;
}

const EJECUTIVOS_DATA = [
  { name: "Jaqueline Mishelle Alcantara Orozco", ini: "J", rol: "Cajero", suc: "SUCURSAL CENTRO", atenciones: 700, conversion: 47.71, ventas: 42, score: 3, resueltas: 334, noResueltas: 5,
    fortalezas: ["Atención rápida y eficiente", "Operación procesada sin demoras"], mejorar: ["Sin presentación del ejecutivo", "Ausencia de saludo inicial formal"] },
  { name: "Daring Ashanti Valencia Rosales", ini: "D", rol: "Multifuncional", suc: "SUCURSAL CENTRO", atenciones: 592, conversion: 43.58, ventas: 31, score: 2, resueltas: 258, noResueltas: 13,
    fortalezas: ["Procesamiento rápido de la operación", "Atención ágil y directa"], mejorar: ["Ausencia de saludo inicial", "Sin confirmación verbal del resultado"] },
  { name: "Drery Castañeda", ini: "D", rol: "Ventas", suc: "SUCURSAL SUR", atenciones: 210, conversion: 55.2, ventas: 58, score: 6, resueltas: 116, noResueltas: 4,
    fortalezas: ["Cierre efectivo", "Buen manejo de objeciones"], mejorar: ["Podría ampliar sondeo de necesidades"] },
  { name: "Dulce Alexandra Ixcoy Yool", ini: "D", rol: "Cajero", suc: "SUCURSAL NORTE", atenciones: 276, conversion: 38.4, ventas: 18, score: 4, resueltas: 106, noResueltas: 9,
    fortalezas: ["Atención cordial", "Buen ritmo operativo"], mejorar: ["Falta confirmación de operación"] },
  { name: "Jaqueline Vanessa Barillas Chen", ini: "J", rol: "Servicio al cliente", suc: "SUCURSAL CENTRO", atenciones: 134, conversion: 12.69, ventas: 6, score: 2, resueltas: 17, noResueltas: 0,
    fortalezas: ["Paciencia en educación financiera", "Información detallada de productos"], mejorar: ["No personaliza la despedida", "Cierre poco enfático"] },
  { name: "Marlon Estuardo Pérez", ini: "M", rol: "Multifuncional", suc: "SUCURSAL ESTE", atenciones: 168, conversion: 29.8, ventas: 12, score: 3, resueltas: 50, noResueltas: 7,
    fortalezas: ["Trato amable"], mejorar: ["Tiempos de atención altos", "Baja conversión en ofertas"] },
];

const SORTS = { "Conversión": "conversion", "Atenciones": "atenciones", "Score": "score", "Ventas": "ventas" };

function convColor(v) { return v >= 50 ? "var(--green)" : v >= 35 ? "var(--amber)" : "var(--red)"; }
function scoreColor(s) { return s >= 7 ? "var(--green)" : s >= 3 ? "var(--amber)" : "var(--red)"; }
function scoreBg(s) { return s >= 7 ? "var(--green-bg)" : s >= 3 ? "var(--amber-bg)" : "var(--red-bg)"; }

function Profile({ onOpenDetail, datosInsuficientes, onGoInteractions }) {
  const [rol, setRol] = useStateP("Todos los roles");
  const [orden, setOrden] = useStateP("Conversión");
  const [soloNoRes, setSoloNoRes] = useStateP(false);
  const [expanded, setExpanded] = useStateP(null);

  let rows = EJECUTIVOS_DATA.filter(e =>
    (rol === "Todos los roles" || e.rol === rol) &&
    (!soloNoRes || e.noResueltas > 0)
  );
  const key = SORTS[orden];
  rows = [...rows].sort((a, b) => b[key] - a[key]);

  const exportCSV = () => {
    const headers = ["#", "Ejecutivo", "Rol", "Sucursal", "Atenciones", "Conversión %", "Ventas", "Score", "Resueltas", "No resueltas"];
    const data = rows.map((e, i) => [i + 1, e.name, e.rol, e.suc, e.atenciones, fmtP(e.conversion), e.ventas, e.score + "/10", e.resueltas, e.noResueltas]);
    downloadText("ranking-ejecutivos.csv", "text/csv", toCSV(headers, data));
  };
  const exportNoRes = () => {
    const nr = EJECUTIVOS_DATA.filter(e => e.noResueltas > 0);
    const headers = ["Ejecutivo", "Rol", "Sucursal", "No resueltas", "Semana"];
    const data = nr.map(e => [e.name, e.rol, e.suc, e.noResueltas, "10–16 sep 2026"]);
    downloadText("no-resueltas-semana.csv", "text/csv", toCSV(headers, data));
  };
  const chartItems = rows.map(e => ({ name: e.name, value: e[key], label: key === "conversion" ? fmtP(e.conversion) + "%" : key === "score" ? e.score + "/10" : fmtNum(e[key]) }));

  return (
    <React.Fragment>
      <div className="topbar" style={{ paddingTop: 4 }} data-screen-label="Ranking de ejecutivos">
        <h2 className="page-title" style={{ fontSize: 17 }}>Ranking de ejecutivos</h2>
      </div>

      <div className="grid">
        <KpiRow>
          <TeamKpi label="Ejecutivos activos" value="6" icon="users-three" tint="var(--red-bg)" iconColor="var(--red)" />
          <TeamKpi label="Conversión promedio" value="37,9%" icon="trend-up" tint="var(--green-bg)" iconColor="var(--green)" />
          <TeamKpi label="Ventas totales" value="167" icon="handshake" tint="var(--purple-soft)" iconColor="var(--purple)" />
          <TeamKpi label="Score promedio" value="3,3" icon="medal" tint="var(--amber-bg)" iconColor="var(--amber)" />
        </KpiRow>

        {/* Toolbar de filtros + export */}
        <section className="card span-12">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, alignItems: "end" }}>
            <SelectCtrl label="Rol" value={rol} onChange={setRol} options={["Todos los roles", ...ROLES]} />
            <SelectCtrl label="Ordenar por" value={orden} onChange={setOrden} options={Object.keys(SORTS)} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)", cursor: "pointer", height: 38 }}>
              <input type="checkbox" checked={soloNoRes} onChange={e => setSoloNoRes(e.target.checked)} />
              Solo con no resueltas
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={exportNoRes} title="Exporta las no resueltas de la semana completa">
                <i className="ph ph-flag"></i>No resueltas
              </button>
              <ExportBtn label="Exportar CSV" onClick={exportCSV} />
            </div>
          </div>
          <div className="card-sub" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ph ph-info"></i>
            Las interacciones no resueltas se pueden aislar con el filtro y descargar con “No resueltas” (semana completa).
          </div>
        </section>

        <ChartCard span={12} title={"Ranking por " + orden.toLowerCase()} sub={"· " + rows.length + " ejecutivos"} items={chartItems} colorMode="multi" />

        {/* Tabla ranking */}
        <section className="card span-12" style={{ padding: "8px 16px 16px" }} data-screen-label="Tabla ranking ejecutivos">
          <div style={{ overflowX: "auto" }}>
            <table className="data">
              <thead>
                <tr>
                  {["#", "Ejecutivo", "Rol", "Sucursal", "Atenciones", "Conversión", "Ventas", "Score", "Resueltas", "No resueltas", ""].map(h => (
                    <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => (
                  <React.Fragment key={e.name}>
                    <tr onClick={() => setExpanded(expanded === e.name ? null : e.name)} style={{ cursor: "pointer" }}>
                      <td style={{ fontWeight: 600, color: "var(--ink-3)" }}>{i + 1}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span className="avatar sm gray">{e.ini}</span>
                          <span style={{ fontWeight: 600 }}>{e.name}</span>
                        </span>
                      </td>
                      <td><span className="chip-gray">{e.rol}</span></td>
                      <td style={{ color: "var(--ink-2)", whiteSpace: "nowrap" }}>{e.suc}</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{fmtNum(e.atenciones)}</td>
                      <td style={{ fontWeight: 600, color: convColor(e.conversion), fontVariantNumeric: "tabular-nums" }}>{fmtP(e.conversion)}%</td>
                      <td style={{ fontVariantNumeric: "tabular-nums" }}>{e.ventas}</td>
                      <td><span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(e.score), background: scoreBg(e.score), borderRadius: 6, padding: "3px 8px", fontVariantNumeric: "tabular-nums" }}>{e.score}/10</span></td>
                      <td style={{ color: "var(--green)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{e.resueltas}</td>
                      <td style={{ color: e.noResueltas ? "var(--red)" : "var(--ink-3)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{e.noResueltas}</td>
                      <td><i className={"ph ph-caret-" + (expanded === e.name ? "up" : "down")} style={{ color: "var(--ink-3)" }}></i></td>
                    </tr>
                    {expanded === e.name ? (
                      <tr>
                        <td colSpan={11} style={{ background: "var(--bg)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 20, padding: "6px 4px 10px" }}>
                            <div>
                              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--green)", marginBottom: 6 }}>Fortalezas</div>
                              {e.fortalezas.map(f => <div key={f} style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>· {f}</div>)}
                            </div>
                            <div>
                              <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--amber)", marginBottom: 6 }}>A mejorar</div>
                              {e.mejorar.map(m => <div key={m} style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>· {m}</div>)}
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-end" }}>
                              <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={ev => { ev.stopPropagation(); onGoInteractions(); }}>
                                <i className="ph ph-eye" style={{ marginRight: 5 }}></i>Ver atenciones
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="coaching-note">
        <i className="ph ph-info"></i>
        Herramienta de coaching — no constituye evaluación formal de desempeño.
      </div>
    </React.Fragment>
  );
}

/* ══════════ AGENCIAS ══════════ */
const AGENCIAS_DATA = [
  { name: "SUCURSAL CENTRO", ejecutivos: 6, atenciones: 1284, conversion: 41.2, ventas: 88, score: 4.1, resueltas: 643, noResueltas: 21 },
  { name: "SUCURSAL SUR", ejecutivos: 4, atenciones: 410, conversion: 52.8, ventas: 74, score: 5.2, resueltas: 268, noResueltas: 9 },
  { name: "SUCURSAL NORTE", ejecutivos: 5, atenciones: 642, conversion: 37.5, ventas: 52, score: 3.6, resueltas: 301, noResueltas: 18 },
  { name: "SUCURSAL ESTE", ejecutivos: 3, atenciones: 288, conversion: 33.1, ventas: 29, score: 3.2, resueltas: 121, noResueltas: 12 },
];

function Agencias() {
  const [orden, setOrden] = useStateP("Conversión");
  let rows = [...AGENCIAS_DATA];
  const key = SORTS[orden];
  rows = rows.sort((a, b) => b[key] - a[key]);

  const exportCSV = () => {
    const headers = ["#", "Agencia", "Ejecutivos", "Atenciones", "Conversión %", "Ventas", "Score", "Resueltas", "No resueltas"];
    const data = rows.map((a, i) => [i + 1, a.name, a.ejecutivos, a.atenciones, fmtP(a.conversion), a.ventas, fmtP(a.score) + "/10", a.resueltas, a.noResueltas]);
    downloadText("ranking-agencias.csv", "text/csv", toCSV(headers, data));
  };
  const chartItems = rows.map(a => ({ name: a.name, value: a[key], label: key === "conversion" ? fmtP(a.conversion) + "%" : key === "score" ? fmtP(a.score) + "/10" : fmtNum(a[key]) }));

  return (
    <React.Fragment>
      <div className="topbar" style={{ paddingTop: 4 }} data-screen-label="Agencias">
        <h2 className="page-title" style={{ fontSize: 17 }}>Agencias</h2>
      </div>

      <div className="grid">
        <KpiRow>
          <TeamKpi label="Agencias activas" value="4" icon="buildings" tint="var(--purple-soft)" iconColor="var(--purple)" />
          <TeamKpi label="Conversión promedio" value="41,2%" icon="trend-up" tint="var(--green-bg)" iconColor="var(--green)" />
          <TeamKpi label="Ventas totales" value="243" icon="handshake" tint="var(--red-bg)" iconColor="var(--red)" />
          <TeamKpi label="Score promedio" value="4,0" icon="medal" tint="var(--amber-bg)" iconColor="var(--amber)" />
        </KpiRow>

        <section className="card span-12">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, alignItems: "end" }}>
            <SelectCtrl label="Ordenar por" value={orden} onChange={setOrden} options={Object.keys(SORTS)} />
            <div></div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ExportBtn label="Exportar CSV" onClick={exportCSV} />
            </div>
          </div>
        </section>

        <ChartCard span={12} title={"Agencias por " + orden.toLowerCase()} items={chartItems} colorMode="multi" />

        <section className="card span-12" style={{ padding: "8px 16px 16px" }} data-screen-label="Tabla ranking agencias">
          <div style={{ overflowX: "auto" }}>
            <table className="data">
              <thead>
                <tr>
                  {["#", "Agencia", "Ejecutivos", "Atenciones", "Conversión", "Ventas", "Score", "Resueltas", "No resueltas"].map(h => (
                    <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a, i) => (
                  <tr key={a.name}>
                    <td style={{ fontWeight: 600, color: "var(--ink-3)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{a.ejecutivos}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{fmtNum(a.atenciones)}</td>
                    <td style={{ fontWeight: 600, color: convColor(a.conversion), fontVariantNumeric: "tabular-nums" }}>{fmtP(a.conversion)}%</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>{a.ventas}</td>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: scoreColor(a.score), background: scoreBg(a.score), borderRadius: 6, padding: "3px 8px", fontVariantNumeric: "tabular-nums" }}>{fmtP(a.score)}/10</span></td>
                    <td style={{ color: "var(--green)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtNum(a.resueltas)}</td>
                    <td style={{ color: a.noResueltas ? "var(--red)" : "var(--ink-3)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{a.noResueltas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
}

window.Profile = Profile;
window.Agencias = Agencias;
