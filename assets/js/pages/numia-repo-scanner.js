const OWASP = {
  A01:'A01 · Control de acceso', A02:'A02 · Criptografía',
  A03:'A03 · Inyección', A04:'A04 · Diseño inseguro',
  A05:'A05 · Mala configuración', A06:'A06 · Componentes vulnerables',
  A07:'A07 · Auth fallida', A08:'A08 · Integridad',
  A09:'A09 · Logging', A10:'A10 · SSRF'
};

const INSTR = {
  full:`Analiza OWASP Top 10 2021 completo + estándares Numia:
A01 Broken Access Control, A02 Cryptographic Failures (credenciales hardcodeadas),
A03 Injection (SQL, XSS, command), A04 Insecure Design, A05 Security Misconfiguration,
A06 Vulnerable Components, A07 Auth Failures, A08 Software Integrity,
A09 Logging insuficiente, A10 SSRF.
Numia: NUNCA credenciales hardcodeadas (CRÍTICO si hay una), SOLID, sin HTML en lógica de negocio.
Explicá el por qué de cada hallazgo en lenguaje claro.`,
  secrets:`OWASP A02 + regla Numia "NUNCA hardcodear credenciales":
API keys, tokens, passwords, DB URLs, claves AWS/GCP/Azure, JWT secrets.
Si encontrás una credencial real → CRÍTICO inmediato.`,
  injection:`OWASP A01 (endpoints sin auth, IDOR),
A03 (SQL injection, XSS, command injection),
A07 (tokens sin expiración, passwords sin bcrypt, JWTs inseguros).`,
  deps:`OWASP A06: dependencias en package.json, requirements.txt, Gemfile, go.mod, composer.json.
Versiones con CVEs, deps sin pinning, librerías abandonadas.`
};

const SKIP = ['node_modules','.git','__pycache__','.venv','venv','env','dist','build','.next','.nuxt','vendor','coverage'];
const SENS = [
  /requirements\.txt$/i,/package\.json$/i,/composer\.json$/i,/Gemfile$/i,
  /go\.mod$/i,/Pipfile$/i,/pyproject\.toml$/i,/pom\.xml$/i,/build\.gradle$/i,
  /\.env$/i,/\.env\./i,/\.envrc$/i,
  /config\.(py|js|ts|yml|yaml|json|rb|php)$/i,
  /settings\.(py|js|ts)$/i,/application\.(yml|yaml|properties)$/i,
  /docker-compose/i,/Dockerfile$/i,/\.tfvars$/i,/serverless\.yml$/i,
  /auth\.(py|js|ts)$/i,/secret/i,/credential/i,/password/i,/token/i,
  /main\.(py|js|ts|go|rb)$/i,/app\.(py|js|ts)$/i,
  /index\.(js|ts|php)$/i,/server\.(js|ts|py)$/i,
  /\.github\/workflows\//i,/\.gitlab-ci\.yml$/i,/Jenkinsfile$/i,
  /middleware/i,/router/i,/routes/i,/api/i,/db\./i,/database/i
];

let op = 'full', file = null, lastResult = null, lastFilename = '';

function sel(o) {
  op = o;
  ['full','secrets','injection','deps'].forEach(x =>
    document.getElementById('opt-'+x).className = 'opt'+(x===o?' on':''));
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function log(msg, s) {
  const cls = s==='ok'?'lok':s==='err'?'lerr':'lpend';
  const p = s==='ok'?'✓ ':s==='err'?'✗ ':'· ';
  document.getElementById('logs').innerHTML += `<div class="${cls}">${p}${esc(msg)}</div>`;
}

function setMsg(m) { document.getElementById('lmsg').textContent = m; }
function isSens(p) {
  const parts = p.split('/');
  for (const x of parts) if (SKIP.includes(x)) return false;
  return SENS.some(r => r.test(p));
}

document.getElementById('fi').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  if (!f.name.endsWith('.zip')) { showErr('Solo archivos .zip'); return; }
  if (f.size > 50*1024*1024) { showErr('El archivo supera 50MB'); return; }
  file = f;
  lastFilename = f.name;
  document.getElementById('drop').classList.add('ready');
  document.getElementById('drop-icon').textContent = '✅';
  document.getElementById('drop-title').textContent = f.name;
  document.getElementById('drop-sub').textContent = (f.size/1024).toFixed(0)+' KB · listo';
  document.getElementById('scan-btn').disabled = false;
});

function showErr(msg) {
  const b = document.getElementById('err');
  b.textContent = '⚠ '+msg; b.style.display = 'block';
  setTimeout(() => b.style.display='none', 5000);
}

async function scan() {
  const key = document.getElementById('api-key').value.trim();
  if (!key || !file) return;

  document.getElementById('panel-input').style.display = 'none';
  document.getElementById('panel-loading').style.display = 'block';
  document.getElementById('logs').innerHTML = '';

  setMsg('Descomprimiendo ZIP...');
  log('Archivo: ' + file.name, 'ok');

  try {
    const zip = await JSZip.loadAsync(file);
    const all = Object.keys(zip.files).filter(p => !zip.files[p].dir);
    log('Archivos en el ZIP: ' + all.length, 'ok');

    let targets = all.filter(p => isSens(p));
    if (!targets.length) {
      targets = all.filter(p =>
        /\.(py|js|ts|go|rb|php|java|cs|env|yml|yaml|json|toml|ini|conf|sh)$/i.test(p) &&
        !SKIP.some(d => p.split('/').includes(d))
      ).slice(0,15);
    }
    log('Archivos sensibles: ' + targets.length, 'ok');
    setMsg('Leyendo archivos...');

    const collected = [];
    let total = 0;
    for (const path of targets.slice(0,20)) {
      if (total >= 14000) break;
      try {
        const c = await zip.files[path].async('string');
        const chunk = c.substring(0,2000);
        collected.push({ path, content: chunk });
        total += chunk.length;
        log(path, 'ok');
      } catch(e) { log(path+' (binario)', 'pend'); }
    }

    if (!collected.length) throw new Error('No se pudo leer ningún archivo de texto.');

    const code = collected.map(f => `=== ${f.path} ===\n${f.content}`).join('\n\n');
    setMsg('Analizando con OWASP Top 10...');
    log('Enviando al motor de análisis...', 'pend');

    const prompt = `Eres un experto en seguridad de aplicaciones (AppSec) especializado en OWASP Top 10 2021.
Analizás código para el equipo de Numia. NUNCA credenciales hardcodeadas, SOLID, sin HTML en lógica de negocio.
Explicá el por qué de cada hallazgo en lenguaje claro para alguien sin background formal de seguridad.

${INSTR[op]}

ARCHIVOS (${collected.length} archivos):
${code}

Devuelve ÚNICAMENTE JSON válido sin markdown ni backticks:
{
  "riskScore": <0-100>,
  "riskLevel": <"CRÍTICO"|"ALTO"|"MEDIO"|"BAJO">,
  "riskSummary": "<2 frases>",
  "owaspHits": ["A01","A03"],
  "numiaViolations": <número>,
  "filesAnalyzed": [<rutas>],
  "totalVulns": <número>,
  "criticalCount": <número>,
  "highCount": <número>,
  "mediumCount": <número>,
  "lowCount": <número>,
  "vulnerabilities": [
    {
      "title": "<nombre>",
      "severity": <"CRÍTICO"|"ALTO"|"MEDIO"|"BAJO">,
      "owaspId": <"A01"..."A10"|null>,
      "owaspName": "<nombre OWASP>",
      "numiaRule": "<regla violada o null>",
      "file": "<archivo>",
      "description": "<qué es y qué impacto>",
      "why": "<por qué es un problema — lenguaje simple>",
      "fix": "<cómo solucionarlo>"
    }
  ],
  "improvements": [
    { "text": "<mejora>", "owaspId": "<A0X o null>" }
  ]
}`;

    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 16000, messages: [{ role: 'user', content: prompt }] })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.content.filter(b => b.type==='text').map(b => b.text).join('');
    let result;
    try {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('no JSON');
      result = JSON.parse(m[0]);
    } catch(e) { console.error('Parse error:', e, '\nRaw text:', text); throw new Error('No se pudo parsear el análisis: ' + e.message); }

    lastResult = result;
    log('Análisis completado ✓', 'ok');
    document.getElementById('panel-loading').style.display = 'none';
    document.getElementById('panel-results').style.display = 'block';
    render(result);

  } catch(err) {
    log('Error: ' + err.message, 'err');
    setTimeout(() => {
      document.getElementById('panel-loading').style.display = 'none';
      document.getElementById('panel-input').style.display = 'block';
      showErr(err.message);
    }, 1500);
  }
}

function render(r) {
  const lm = {
    'CRÍTICO': { cls:'rh', bar:'#EF4444' }, 'ALTO': { cls:'rh', bar:'#F59E0B' },
    'MEDIO': { cls:'rm', bar:'#F59E0B' }, 'BAJO': { cls:'rl', bar:'#22C55E' }
  };
  const l = lm[r.riskLevel] || lm['MEDIO'];

  document.getElementById('r-risk').innerHTML = `
    <div class="risk-banner ${l.cls}">
      <div class="rscore">${Math.round(r.riskScore||0)}</div>
      <div class="rmeta">
        <div class="rlevel">Riesgo ${(r.riskLevel||'').toLowerCase()} · ${Math.round(r.riskScore||0)}/100</div>
        <div class="rsummary">${esc(r.riskSummary||'')}</div>
        <div class="rbar"><div class="rfill" data-risk-width="${Math.round(r.riskScore||0)}"></div></div>
      </div>
    </div>`;

  applyRiskWidths();

  document.getElementById('r-metrics').innerHTML = `
    <div class="metric"><div class="mlabel">Vulnerabilidades</div><div class="mvalue">${r.totalVulns||0}</div><div class="msub">total encontradas</div></div>
    <div class="metric"><div class="mlabel">Críticas / Altas</div><div class="mvalue mvalue-bad">${(r.criticalCount||0)+(r.highCount||0)}</div><div class="msub">atención inmediata</div></div>
    <div class="metric"><div class="mlabel">Violaciones Numia</div><div class="mvalue mvalue-warn">${r.numiaViolations||0}</div><div class="msub">estándares del equipo</div></div>`;

  if (r.owaspHits && r.owaspHits.length) {
    document.getElementById('r-owasp').innerHTML = `
      <div class="sec-label">Categorías OWASP detectadas</div>
      <div class="otags">${r.owaspHits.map(id => `<span class="otag">${esc(OWASP[id]||id)}</span>`).join('')}</div>`;
  }

  const sc = {'CRÍTICO':'vc','ALTO':'va','MEDIO':'vm','BAJO':'vb'};
  const bc = {'CRÍTICO':'bc','ALTO':'ba','MEDIO':'bm','BAJO':'bb'};

  let vh = '';
  if (r.vulnerabilities && r.vulnerabilities.length) {
    vh = '<div class="sec-label sec-label-spaced">Vulnerabilidades detectadas</div>';
    r.vulnerabilities.forEach(v => {
      vh += `<div class="vuln ${sc[v.severity]||'vm'}">
        <div class="vtop">
          <div>
            <div class="vtitle">${esc(v.title)}</div>
            <div class="vmeta">
              ${v.owaspId?`<span class="badge bo">${esc(v.owaspId)} ${esc(v.owaspName||'')}</span>`:''}
              ${v.numiaRule?`<span class="badge bn">${esc(v.numiaRule)}</span>`:''}
              ${v.file?`<span class="badge bf">${esc(v.file)}</span>`:''}
            </div>
          </div>
          <span class="badge ${bc[v.severity]||'bm'}">${esc(v.severity)}</span>
        </div>
        <div class="vdesc">${esc(v.description)}</div>
        ${v.why?`<div class="vwhy">💡 ${esc(v.why)}</div>`:''}
        ${v.fix?`<div class="vfix">→ ${esc(v.fix)}</div>`:''}
      </div>`;
    });
  }
  document.getElementById('r-vulns').innerHTML = vh;

  let ih = '';
  if (r.improvements && r.improvements.length) {
    ih = '<div class="sec-label sec-label-spaced">Mejoras recomendadas</div>';
    r.improvements.forEach(imp => {
      const t = typeof imp==='string'?imp:(imp.text||'');
      const o = typeof imp==='object'?imp.owaspId:null;
      ih += `<div class="imp"><div class="imp-arrow">→</div><div class="imp-text">${o?`<span class="badge bo badge-gap">${esc(o)}</span>`:''} ${esc(t)}</div></div>`;
    });
  }
  document.getElementById('r-imps').innerHTML = ih;
}

function applyRiskWidths() {
  document.querySelectorAll('.rfill[data-risk-width]').forEach(function (bar) { bar.style.width = (bar.getAttribute('data-risk-width') || 0) + "%"; });
}

function reset() {
  file = null; lastResult = null;
  document.getElementById('panel-results').style.display = 'none';
  document.getElementById('panel-input').style.display = 'block';
  document.getElementById('scan-btn').disabled = true;
  document.getElementById('logs').innerHTML = '';
  document.getElementById('drop').classList.remove('ready');
  document.getElementById('drop-icon').textContent = '📦';
  document.getElementById('drop-title').textContent = 'Seleccioná el ZIP de tu repo';
  document.getElementById('drop-sub').textContent = 'GitHub → Code → Download ZIP · Máx 50MB';
  document.getElementById('fi').value = '';
}

function exportReport() {
  if (!lastResult) return;
  const r = lastResult;
  const date = new Date().toLocaleString('es-AR');
  const sevColor = { 'CRÍTICO':'#EF4444','ALTO':'#F59E0B','MEDIO':'#60A5FA','BAJO':'#22C55E' };

  const vulnsHtml = (r.vulnerabilities||[]).map(v => `
    <div style="border:1px solid #27272A;border-left:3px solid ${sevColor[v.severity]||'#60A5FA'};border-radius:8px;padding:14px 16px;margin-bottom:10px;background:#111113;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div>
          <div style="font-size:14px;font-weight:700;color:#FAFAFA;">${esc(v.title)}</div>
          <div style="margin-top:4px;display:flex;gap:5px;flex-wrap:wrap;">
            ${v.owaspId?`<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:rgba(134,61,255,0.12);border:1px solid rgba(134,61,255,0.35);color:#C4A0FF;">${esc(v.owaspId)} ${esc(v.owaspName||'')}</span>`:''}
            ${v.numiaRule?`<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.3);color:#2DD4BF;">${esc(v.numiaRule)}</span>`:''}
            ${v.file?`<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:#18181B;border:1px solid #27272A;color:#71717A;font-family:monospace;">${esc(v.file)}</span>`:''}
          </div>
        </div>
        <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px;background:${sevColor[v.severity]}22;border:1px solid ${sevColor[v.severity]}66;color:${sevColor[v.severity]};white-space:nowrap;">${esc(v.severity)}</span>
      </div>
      <div style="font-size:13px;color:#A1A1AA;line-height:1.55;margin-bottom:5px;">${esc(v.description)}</div>
      ${v.why?`<div style="font-size:12px;color:#71717A;font-style:italic;line-height:1.5;margin-bottom:6px;">💡 ${esc(v.why)}</div>`:''}
      ${v.fix?`<div style="font-family:monospace;font-size:12px;background:#18181B;border:1px solid #27272A;border-radius:6px;padding:7px 11px;color:#C4A0FF;line-height:1.5;">→ ${esc(v.fix)}</div>`:''}
    </div>`).join('');

  const impsHtml = (r.improvements||[]).map(imp => {
    const t = typeof imp==='string'?imp:(imp.text||'');
    const o = typeof imp==='object'?imp.owaspId:null;
    return `<div style="background:#111113;border:1px solid #27272A;border-radius:8px;padding:10px 14px;margin-bottom:7px;display:flex;gap:10px;">
      <div style="color:#863DFF;flex-shrink:0;">→</div>
      <div style="font-size:13px;color:#A1A1AA;line-height:1.5;">${o?`<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:rgba(134,61,255,0.12);border:1px solid rgba(134,61,255,0.35);color:#C4A0FF;margin-right:5px;">${esc(o)}</span>`:''} ${esc(t)}</div>
    </div>`;
  }).join('');

  const riskColor = {'CRÍTICO':'#EF4444','ALTO':'#F59E0B','MEDIO':'#F59E0B','BAJO':'#22C55E'};
  const rc = riskColor[r.riskLevel]||'#F59E0B';

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>Reporte de Seguridad · ${esc(lastFilename)} · Numia</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
body{background:#09090B;color:#FAFAFA;font-family:'Syne',sans-serif;margin:0;padding:0;}
.wrap{max-width:800px;margin:0 auto;padding:48px 24px 80px;}
h1{font-size:32px;font-weight:800;letter-spacing:-0.04em;margin-bottom:6px;}
h1 em{color:#863DFF;font-style:normal;}
.meta{font-size:12px;color:#71717A;margin-bottom:32px;}
.risk-banner{border-radius:10px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;gap:20px;border:1px solid ${rc}44;background:${rc}11;}
.score{font-size:56px;font-weight:800;letter-spacing:-0.05em;color:${rc};}
.sec-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#71717A;margin:24px 0 10px;padding-bottom:8px;border-bottom:1px solid #27272A;}
.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.metric{background:#111113;border:1px solid #27272A;border-radius:10px;padding:14px 16px;}
.mlabel{font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#71717A;margin-bottom:5px;}
.mvalue{font-size:26px;font-weight:800;}
.otags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;}
.otag{font-size:11px;font-weight:600;padding:3px 9px;border-radius:100px;background:rgba(134,61,255,0.12);border:1px solid rgba(134,61,255,0.35);color:#C4A0FF;}
.footer{margin-top:48px;padding-top:20px;border-top:1px solid #27272A;font-size:12px;color:#71717A;text-align:center;}
</style></head><body><div class="wrap">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:32px;">
  <div style="width:28px;height:28px;background:#863DFF;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">N</div>
  <span style="font-size:14px;font-weight:700;">Repo <span style="color:#863DFF;">Scanner</span></span>
</div>
<h1>Reporte de <em>Seguridad</em></h1>
<div class="meta">Repositorio: <strong style="color:#A1A1AA;">${esc(lastFilename)}</strong> &nbsp;·&nbsp; Generado: ${date} &nbsp;·&nbsp; Análisis: OWASP Top 10 2021 + Numia Standards</div>
<div class="risk-banner">
  <div class="score">${Math.round(r.riskScore||0)}</div>
  <div>
    <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${rc};margin-bottom:5px;">Riesgo ${(r.riskLevel||'').toLowerCase()} · ${Math.round(r.riskScore||0)}/100</div>
    <div style="font-size:13px;color:#A1A1AA;line-height:1.5;">${esc(r.riskSummary||'')}</div>
  </div>
</div>
<div class="metrics">
  <div class="metric"><div class="mlabel">Vulnerabilidades</div><div class="mvalue">${r.totalVulns||0}</div></div>
  <div class="metric"><div class="mlabel">Críticas / Altas</div><div class="mvalue" style="color:#EF4444">${(r.criticalCount||0)+(r.highCount||0)}</div></div>
  <div class="metric"><div class="mlabel">Violaciones Numia</div><div class="mvalue" style="color:#F59E0B">${r.numiaViolations||0}</div></div>
</div>
${r.owaspHits&&r.owaspHits.length?`<div class="sec-label">Categorías OWASP detectadas</div><div class="otags">${r.owaspHits.map(id=>`<span class="otag">${esc({'A01':'A01 · Control de acceso','A02':'A02 · Criptografía','A03':'A03 · Inyección','A04':'A04 · Diseño inseguro','A05':'A05 · Mala configuración','A06':'A06 · Componentes vulnerables','A07':'A07 · Auth fallida','A08':'A08 · Integridad','A09':'A09 · Logging','A10':'A10 · SSRF'}[id]||id)}</span>`).join('')}</div>`:''}
<div class="sec-label">Vulnerabilidades detectadas</div>
${vulnsHtml}
${r.improvements&&r.improvements.length?`<div class="sec-label">Mejoras recomendadas</div>${impsHtml}`:''}
<div class="footer">Generado por Numia Repo Scanner · OWASP Top 10 2021</div>
</div></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `reporte-seguridad-${lastFilename.replace('.zip','')}-${new Date().toISOString().slice(0,10)}.html`;
  a.click();
}

function handleActionKey(event, callback) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); } }
function setupRepoScannerBindings() {
  var drop = document.getElementById('drop');
  var fileInput = document.getElementById('fi');
  var scanBtn = document.getElementById('scan-btn');
  var exportBtn = document.getElementById('btnExportReport');
  var resetBtn = document.getElementById('btnResetScan');
  if (drop && fileInput) { drop.addEventListener('click', function () { fileInput.click(); }); drop.addEventListener('keydown', function (event) { handleActionKey(event, function () { fileInput.click(); }); }); }
  document.querySelectorAll('.opt[data-mode]').forEach(function (opt) { var runSelect = function () { sel(opt.getAttribute('data-mode')); }; opt.addEventListener('click', runSelect); opt.addEventListener('keydown', function (event) { handleActionKey(event, runSelect); }); });
  if (scanBtn) { scanBtn.addEventListener('click', scan); }
  if (exportBtn) { exportBtn.addEventListener('click', exportReport); }
  if (resetBtn) { resetBtn.addEventListener('click', reset); }
}
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', setupRepoScannerBindings, { once: true }); } else { setupRepoScannerBindings(); }
