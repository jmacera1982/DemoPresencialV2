'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2).filter(function (arg) {
  return arg !== '--update-meta';
});
const ROOT = path.resolve(args[0] || path.join(__dirname, '..'));
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const LOCKFILE = path.join(ROOT, 'package-lock.json');
const META = path.join(ROOT, 'package-lock.meta.json');
const UPDATE_META = process.argv.includes('--update-meta');

function fail(message) {
  console.error('[lockfile:verify] ' + message);
  process.exit(1);
}

function fingerprintPackageJsonDeps(pkg) {
  const sections = ['dependencies', 'devDependencies', 'optionalDependencies'];
  const entries = [];

  sections.forEach(function (section) {
    const block = pkg[section];
    if (!block) {
      return;
    }

    Object.keys(block).sort().forEach(function (name) {
      entries.push(section + ':' + name + '@' + block[name]);
    });
  });

  return crypto.createHash('sha256').update(entries.join('\n')).digest('hex');
}

function fingerprintLockfileContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function writeMeta(pkgFingerprint, lockFingerprint) {
  const meta = {
    packageJsonFingerprint: pkgFingerprint,
    lockfileFingerprint: lockFingerprint
  };

  fs.writeFileSync(META, JSON.stringify(meta, null, 2) + '\n', 'utf8');
}

function verifyMeta(pkgFingerprint, lockFingerprint) {
  if (!fs.existsSync(META)) {
    fail(
      'Falta package-lock.meta.json. Ejecutá: npm run lockfile:sync (commiteá package-lock.json y package-lock.meta.json)'
    );
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(META, 'utf8'));
  } catch (error) {
    fail('package-lock.meta.json inválido: ' + error.message);
  }

  if (meta.packageJsonFingerprint !== pkgFingerprint) {
    fail(
      'Huella de package.json desactualizada en package-lock.meta.json. Ejecutá: npm run lockfile:sync'
    );
  }

  if (meta.lockfileFingerprint !== lockFingerprint) {
    fail(
      'Huella de package-lock.json desactualizada en package-lock.meta.json. Ejecutá: npm run lockfile:sync'
    );
  }
}

function verifyFreshness() {
  const pkgStat = fs.statSync(PACKAGE_JSON);
  const lockStat = fs.statSync(LOCKFILE);

  if (pkgStat.mtimeMs > lockStat.mtimeMs + 1000) {
    fail(
      'package.json es más reciente que package-lock.json. Ejecutá: npm run lockfile:sync'
    );
  }
}

function verifyRootDependencies(pkg, rootPkg) {
  ['dependencies', 'devDependencies', 'optionalDependencies'].forEach(function (section) {
    Object.keys(pkg[section] || {}).forEach(function (name) {
      const expected = pkg[section][name];
      const locked = (rootPkg[section] || {})[name];
      if (locked !== expected) {
        fail(
          'Versión desincronizada para ' +
            name +
            ' (' +
            section +
            '): package.json=' +
            expected +
            ', lock=' +
            locked
        );
      }
    });
  });
}

function verifyPackagesIntegrity(packages) {
  let checked = 0;

  Object.keys(packages).forEach(function (key) {
    if (!key) {
      return;
    }

    const entry = packages[key];
    if (!entry.version) {
      return;
    }

    checked += 1;
    const integrity = entry.integrity || '';
    if (!integrity.startsWith('sha512-')) {
      fail('Paquete sin hash sha512: ' + key);
    }

    if (!entry.resolved || !entry.resolved.startsWith('https://registry.npmjs.org/')) {
      fail('Paquete sin URL resolved de npm: ' + key);
    }
  });

  return checked;
}

function main() {
  if (!fs.existsSync(LOCKFILE)) {
    fail('Falta package-lock.json. Ejecutá: npm run lockfile:sync');
  }

  const pkgRaw = fs.readFileSync(PACKAGE_JSON, 'utf8');
  const lockRaw = fs.readFileSync(LOCKFILE, 'utf8');
  const pkg = JSON.parse(pkgRaw);
  const lock = JSON.parse(lockRaw);

  if (lock.lockfileVersion !== 3) {
    fail('package-lock.json debe usar lockfileVersion 3');
  }

  if (lock.name !== pkg.name || lock.version !== pkg.version) {
    fail('Metadatos desincronizados entre package.json y package-lock.json');
  }

  const packages = lock.packages || {};
  const rootPkg = packages[''];

  if (!rootPkg || !rootPkg.dependencies) {
    fail('package-lock.json sin bloque raíz de dependencias');
  }

  if (rootPkg.name !== pkg.name || rootPkg.version !== pkg.version) {
    fail('Metadatos desincronizados en el bloque raíz del lockfile');
  }

  verifyRootDependencies(pkg, rootPkg);

  const pkgFingerprint = fingerprintPackageJsonDeps(pkg);
  const lockFingerprint = fingerprintLockfileContent(lockRaw);

  if (UPDATE_META) {
    writeMeta(pkgFingerprint, lockFingerprint);
  } else {
    verifyMeta(pkgFingerprint, lockFingerprint);
    verifyFreshness();
  }

  const checked = verifyPackagesIntegrity(packages);
  console.log(
    '[lockfile:verify] OK — ' +
      checked +
      ' paquetes con integridad sha512 verificada' +
      (UPDATE_META ? '; meta actualizada' : '; huellas package.json/lockfile coherentes')
  );
}

main();
