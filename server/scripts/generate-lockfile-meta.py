#!/usr/bin/env python3
"""Genera package-lock.meta.json sin Node.js (huellas sha256)."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


def fingerprint_package_json_deps(pkg: dict) -> str:
    entries: list[str] = []
    for section in ('dependencies', 'devDependencies', 'optionalDependencies'):
        block = pkg.get(section) or {}
        for name in sorted(block):
            entries.append(f'{section}:{name}@{block[name]}')
    payload = '\n'.join(entries)
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()


def fingerprint_lockfile(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def main() -> int:
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    package_json = root / 'package.json'
    lockfile = root / 'package-lock.json'
    meta = root / 'package-lock.meta.json'

    if not lockfile.is_file():
        print(f'[lockfile:meta] Falta {lockfile}', file=sys.stderr)
        return 1

    pkg = json.loads(package_json.read_text(encoding='utf-8'))
    lock_raw = lockfile.read_text(encoding='utf-8')

    meta.write_text(
        json.dumps(
            {
                'packageJsonFingerprint': fingerprint_package_json_deps(pkg),
                'lockfileFingerprint': fingerprint_lockfile(lock_raw),
            },
            indent=2,
        )
        + '\n',
        encoding='utf-8',
    )
    print(f'[lockfile:meta] Generado {meta}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
