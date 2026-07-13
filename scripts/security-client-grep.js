'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const PATTERNS = [
  { name: 'API key sk-* en cliente', re: /sk-[A-Za-z0-9]{20,}/ },
  {
    name: 'Token/credencial hardcodeada en JS/HTML',
    re: /(?:api[_-]?key|apiKey|x-api-token|authorization)\s*[:=]\s*['"][^'"]{20,}['"]/i
  },
  {
    name: 'DNI en objeto usuarios del cliente',
    re: /usuarios\s*=\s*\{[\s\S]*?\bdni\s*:\s*['"]\d{7,8}['"]/i
  }
];

const SKIP_DIR_NAMES = new Set(['node_modules', '.git']);
const SCAN_EXTENSIONS = new Set(['.js', '.html', '.css', '.json']);
const SKIP_FILES = new Set([
  'assets/js/shared/sri-manifest.json',
  'client/package-lock.json',
  'client/package-lock.meta.json',
  'server/package-lock.json',
  'server/package-lock.meta.json',
  'client/third-party-manifest.json',
  'scripts/security-client-grep.js'
]);

function shouldSkipRelative(relativePath) {
  if (SKIP_FILES.has(relativePath)) {
    return true;
  }

  if (relativePath.startsWith('server/data/')) {
    return true;
  }

  return relativePath.split('/').some(function (part) {
    return SKIP_DIR_NAMES.has(part);
  });
}

function walkDirectory(directory, files) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  entries.forEach(function (entry) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(ROOT, absolutePath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (shouldSkipRelative(relativePath + '/')) {
        return;
      }
      walkDirectory(absolutePath, files);
      return;
    }

    if (!SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      return;
    }

    if (shouldSkipRelative(relativePath)) {
      return;
    }

    files.push(absolutePath);
  });
}

function main() {
  const files = [];
  walkDirectory(ROOT, files);

  let failed = false;

  files.forEach(function (filePath) {
    const relativePath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const content = fs.readFileSync(filePath, 'utf8');

    PATTERNS.forEach(function (pattern) {
      if (pattern.re.test(content)) {
        console.error('[security-grep] ' + pattern.name + ' → ' + relativePath);
        failed = true;
      }
    });
  });

  if (failed) {
    process.exit(1);
  }

  console.log('[security-grep] OK — ' + files.length + ' archivos cliente escaneados');
}

main();
