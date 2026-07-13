#!/usr/bin/env python3
"""Genera package-lock.json (lockfileVersion 3) consultando npm registry."""

from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional, Tuple

REGISTRY = 'https://registry.npmjs.org'


def fetch_json(url: str) -> dict:
    request = urllib.request.Request(url, headers={'Accept': 'application/json'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode('utf-8'))


def parse_version(version: str) -> Optional[Tuple[int, int, int]]:
    match = re.match(r'^(\d+)\.(\d+)\.(\d+)', version)
    if not match:
        return None
    return int(match.group(1)), int(match.group(2)), int(match.group(3))


def version_key(version: str) -> Tuple[int, int, int]:
    parsed = parse_version(version)
    return parsed if parsed else (0, 0, 0)


def list_versions(name: str) -> List[str]:
    metadata = fetch_json(f'{REGISTRY}/{name}')
    return sorted(metadata.get('versions', {}).keys(), key=version_key)


def satisfies(version: str, spec: str) -> bool:
    parsed = parse_version(version)
    if not parsed:
        return False

    major, minor, patch = parsed
    spec = spec.strip()

    if spec in ('*', ''):
        return True

    if re.fullmatch(r'[\d]+\.[\d]+\.[\d]+', spec):
        return version == spec

    if spec.startswith('^'):
        base = parse_version(spec[1:])
        return bool(base) and version_key(version) >= base and major == base[0]

    if spec.startswith('~'):
        base = parse_version(spec[1:])
        return bool(base) and major == base[0] and minor == base[1] and version_key(version) >= base

    return version == spec


def resolve_version(name: str, spec: str) -> str:
    if re.fullmatch(r'\d+\.\d+\.[\d]+', spec):
        return spec

    candidates = [version for version in list_versions(name) if satisfies(version, spec)]
    if not candidates:
        raise ValueError(f'Sin versión para {name}@{spec}')
    return candidates[-1]


def get_manifest(name: str, version: str) -> dict:
    return fetch_json(f'{REGISTRY}/{name}/{version}')


def lock_path(parts: List[str]) -> str:
    if not parts:
        return ''
    return 'node_modules/' + '/node_modules/'.join(parts)


class LockfileBuilder:
    def __init__(self) -> None:
        self.packages: Dict[str, dict] = {}
        self.installed: Dict[str, str] = {}

    def add_package(self, path_parts: List[str], name: str, version: str, manifest: dict) -> None:
        key = lock_path(path_parts + [name])
        dist = manifest.get('dist', {})
        entry = {
            'version': version,
            'resolved': dist.get('tarball'),
            'integrity': dist.get('integrity')
        }
        if manifest.get('license'):
            entry['license'] = manifest['license']
        if manifest.get('dependencies'):
            entry['dependencies'] = dict(manifest['dependencies'])
        self.packages[key] = entry

    def install(self, name: str, spec: str, path_parts: List[str]) -> None:
        version = resolve_version(name, spec)
        if name in self.installed and self.installed[name] == version:
            return

        if name in self.installed and self.installed[name] != version:
            self._install_fresh(name, version, path_parts + [name])
            return

        self._install_fresh(name, version, path_parts)

    def _install_fresh(self, name: str, version: str, path_parts: List[str]) -> None:
        manifest = get_manifest(name, version)
        self.installed[name] = version
        self.add_package(path_parts, name, version, manifest)

        for dep_name, dep_spec in (manifest.get('dependencies') or {}).items():
            if dep_name in self.installed and self.installed[dep_name] == resolve_version(dep_name, dep_spec):
                continue
            if dep_name in self.installed:
                self.install(dep_name, dep_spec, path_parts + [name])
            else:
                self.install(dep_name, dep_spec, path_parts)


def main() -> None:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
    package_json = root / 'package.json'
    lockfile = root / 'package-lock.json'

    package = json.loads(package_json.read_text(encoding='utf-8'))
    root_deps = package.get('dependencies', {})

    builder = LockfileBuilder()
    for dep_name, dep_version in root_deps.items():
        builder.install(dep_name, dep_version, [])

    packages = {
        '': {
            'name': package['name'],
            'version': package['version'],
            'dependencies': root_deps
        }
    }
    packages.update(builder.packages)

    lock = {
        'name': package['name'],
        'version': package['version'],
        'lockfileVersion': 3,
        'requires': True,
        'packages': packages
    }

    lockfile.write_text(json.dumps(lock, indent=2) + '\n', encoding='utf-8')
    print(f'Generado {lockfile} ({len(packages) - 1} paquetes)')


if __name__ == '__main__':
    main()
