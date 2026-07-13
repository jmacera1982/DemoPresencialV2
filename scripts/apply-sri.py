#!/usr/bin/env python3
"""Genera y aplica hashes SRI (sha384) a scripts locales en HTML."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'assets' / 'js' / 'shared' / 'sri-manifest.json'
SCRIPT_TAG_RE = re.compile(
    r'(<script\s+src=")(?P<src>(?!https?://)[^"]+\.js)(")(?P<attrs>[^>]*)(></script>)',
    re.IGNORECASE
)


def file_bytes_for_sri(file_path: Path) -> bytes:
    raw = file_path.read_bytes()
    if file_path.suffix.lower() != '.js':
        return raw

    # Linux/Render sirve LF; normalizar evita SRI distinto entre Windows y producción.
    text = raw.decode('utf-8')
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    return text.encode('utf-8')


def sha384_integrity(file_path: Path) -> str:
    digest = hashlib.sha384(file_bytes_for_sri(file_path)).digest()
    encoded = base64.b64encode(digest).decode('ascii')
    return 'sha384-' + encoded


def resolve_src(html_path: Path, src: str) -> Path:
    return (html_path.parent / src).resolve()


def collect_local_scripts() -> dict[str, str]:
    hashes: dict[str, str] = {}

    for html_path in ROOT.rglob('*.html'):
        content = html_path.read_text(encoding='utf-8')
        for match in SCRIPT_TAG_RE.finditer(content):
            src = match.group('src')
            file_path = resolve_src(html_path, src)
            if not file_path.is_file():
                continue
            key = str(file_path.relative_to(ROOT)).replace('\\', '/')
            if key not in hashes:
                hashes[key] = sha384_integrity(file_path)
    return hashes


def apply_to_html(html_path: Path, hashes: dict[str, str], check_only: bool) -> list[str]:
    errors: list[str] = []
    content = html_path.read_text(encoding='utf-8')
    changed = False

    def replace_tag(match: re.Match[str]) -> str:
        nonlocal changed
        prefix, src, quote, attrs, suffix = match.groups()
        file_path = resolve_src(html_path, src)
        if not file_path.is_file():
            return match.group(0)

        key = str(file_path.relative_to(ROOT)).replace('\\', '/')
        expected = hashes.get(key)
        if not expected:
            return match.group(0)

        integrity_match = re.search(r'\sintegrity="([^"]+)"', attrs)
        crossorigin_match = re.search(r'\scrossorigin="([^"]+)"', attrs)

        if check_only:
            if not integrity_match or integrity_match.group(1) != expected:
                errors.append(f'{html_path.relative_to(ROOT)}: SRI faltante o inválido para {src}')
            if not crossorigin_match:
                errors.append(f'{html_path.relative_to(ROOT)}: falta crossorigin en {src}')
            return match.group(0)

        attrs_clean = re.sub(r'\sintegrity="[^"]*"', '', attrs)
        attrs_clean = re.sub(r'\scrossorigin="[^"]*"', '', attrs_clean)
        changed = True
        return (
            f'{prefix}{src}{quote}'
            f' integrity="{expected}" crossorigin="anonymous"'
            f'{attrs_clean}{suffix}'
        )

    updated = SCRIPT_TAG_RE.sub(replace_tag, content)
    if changed and not check_only:
        html_path.write_text(updated, encoding='utf-8')
    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description='Aplicar o verificar SRI en HTML')
    parser.add_argument('--check', action='store_true', help='Solo verificar, no modificar archivos')
    args = parser.parse_args()

    hashes = collect_local_scripts()
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    manifest = {
        'algorithm': 'sha384',
        'generatedBy': 'scripts/apply-sri.py',
        'files': dict(sorted(hashes.items()))
    }

    if not args.check:
        MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')

    all_errors: list[str] = []
    for html_path in sorted(ROOT.rglob('*.html')):
        all_errors.extend(apply_to_html(html_path, hashes, args.check))

    if args.check and all_errors:
        print('[sri:verify] Errores:')
        for error in all_errors:
            print('  - ' + error)
        raise SystemExit(1)

    if args.check:
        print(f'[sri:verify] OK — {len(hashes)} assets con SRI verificado')
    else:
        print(f'[sri:update] OK — manifest con {len(hashes)} archivos, HTML actualizado')


if __name__ == '__main__':
    main()
