'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const JOURNEY_FETCH_BLOCK = /const response = await fetch\(JOURNEY_API_URL,\s*\{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'x-api-key': JOURNEY_API_KEY,\s*'Origin': 'journeybuilder\.numia\.co'\s*\},\s*body: JSON\.stringify\(\{\s*input_value: mensaje,\s*input_type: 'chat'\s*\}\)\s*\}\);\s*\n\s*if \(!response\.ok\) \{\s*throw new Error\(`Error en servidor \(\$\{response\.status\}\)`\);\s*\}\s*\n\s*const data = await response\.json\(\);/g;

const JOURNEY_REPLACEMENT = `const data = await NumiaJourneyApi.runJourney(JOURNEY_FLOW_ID, {
              input_value: mensaje,
              input_type: 'chat'
            });`;

const USUARIOS_BLOCK = /\n\s*\/\/ Objeto con nombres y DNI\s*\n\s*const usuarios = \{[\s\S]*?\};\s*\n/;

const USUARIOS_REPLACEMENT = '\n';

const HEADER_REPLACEMENT = `const JOURNEY_FLOW_ID = NumiaJourneyApi.FLOWS.APP_CLIENTE;
`;

const GET_USUARIO_REPLACEMENT = `function getNombreActual() {
        const selector = document.getElementById('nombreSelector');
        return selector ? selector.value : 'Jorge';
      }

      async function buildDatosEnqueue(nombreActual) {
        return NumiaDemoUsers.fetchEnqueueBody(nombreActual, buildExtraFields(ultimoDetalleExtraFields || DETALLE_EXTRA_FIELDS_DEFAULT));
      }
`;

function patchAppClienteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = content.replace(
    /const JOURNEY_API_URL = '[^']+';\s*\n\s*const JOURNEY_API_KEY = '[^']+';\s*\n/,
    HEADER_REPLACEMENT
  );

  content = content.replace(USUARIOS_BLOCK, USUARIOS_REPLACEMENT);

  content = content.replace(
    /\/\/ Función para obtener el usuario actual\s*\n\s*function getUsuarioActual\(\) \{[\s\S]*?\}\s*\n\s*\/\/ Función para obtener el nombre actual\s*\n\s*function getNombreActual\(\) \{[\s\S]*?\}\s*\n\s*function buildDatosEnqueue\(usuarioActual, nombreActual\) \{[\s\S]*?\}\s*\n/,
    GET_USUARIO_REPLACEMENT
  );

  content = content.replace(JOURNEY_FETCH_BLOCK, JOURNEY_REPLACEMENT);

  content = content.replace(
    /const apiUrl = 'https:\/\/filavirtual2\.debmedia\.com\/api\/v1\/queue\/16221\/branch\/10750\/enqueue';\s*\n\s*const apiToken = '[^']+';\s*\n\s*\n\s*const usuarioActual = getUsuarioActual\(\);\s*\n\s*const nombreActual = getNombreActual\(\);\s*\n\s*\n\s*const datos = buildDatosEnqueue\(usuarioActual, nombreActual\);\s*\n\s*\n\s*const response = await fetch\(apiUrl, \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'x-api-token': apiToken\s*\},\s*body: JSON\.stringify\(datos\)\s*\}\);/g,
    `const nombreActual = getNombreActual();
          const datos = await buildDatosEnqueue(nombreActual);
          const responseData = await NumiaDemoUsers.enqueueFilaVirtual('16221', '10750', datos);
          const response = { ok: true, json: async () => responseData };`
  );

  content = content.replace(
    /const apiUrl = `https:\/\/filavirtual2\.debmedia\.com\/api\/v1\/queue\/\$\{queueId\}\/branch\/10750\/enqueue`;\s*\n\s*const apiToken = '[^']+';\s*\n\s*\n\s*const usuarioActual = getUsuarioActual\(\);\s*\n\s*const nombreActual = getNombreActual\(\);\s*\n\s*\n\s*const datos = buildDatosEnqueue\(usuarioActual, nombreActual\);\s*\n\s*\n\s*const response = await fetch\(apiUrl, \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'x-api-token': apiToken\s*\},\s*body: JSON\.stringify\(datos\)\s*\}\);/g,
    `const nombreActual = getNombreActual();
          const datos = await buildDatosEnqueue(nombreActual);
          const responseData = await NumiaDemoUsers.enqueueFilaVirtual(queueId, '10750', datos);
          const response = { ok: true, json: async () => responseData };`
  );

  content = content.replace(
    /Lo llamaremos con su DNI: <strong>\$\{usuarioActual\.dni\}<\/strong>/g,
    'Lo llamaremos con su documento: <strong>${datos.dniMasked || "••••••••"}</strong>'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched', path.relative(root, filePath));
  } else {
    console.log('No changes', path.relative(root, filePath));
  }
}

const appClienteFiles = [
  'assets/js/app-cliente/app-cliente.js',
  'assets/js/app-cliente/app-cliente-banregio.js',
  'assets/js/app-cliente/app-cliente-bac.js',
  'assets/js/app-cliente/app-cliente-bbva.js',
  'assets/js/app-cliente/app-cliente-santander.js',
  'assets/js/app-cliente/app-cliente-popular.js',
  'assets/js/app-cliente/appcliente-en.js'
];

appClienteFiles.forEach(function (rel) {
  patchAppClienteFile(path.join(root, rel));
});
