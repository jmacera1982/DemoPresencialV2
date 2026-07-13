#!/usr/bin/env python3
"""Calcula hashes SRI sha384 para URLs CDN (jsdelivr)."""

from __future__ import annotations

import argparse
import base64
import hashlib
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CDN_ASSETS = {
    'bootstrap-css': 'https://cdn.jsdelivr.net/npm/bootstrap@{version}/dist/css/bootstrap.min.css',
    'bootstrap-js': 'https://cdn.jsdelivr.net/npm/bootstrap@{version}/dist/js/bootstrap.bundle.min.js',
    'bootstrap-icons-css': 'https://cdn.jsdelivr.net/npm/bootstrap-icons@{version}/font/bootstrap-icons.min.css',
    'chart-js': 'https://cdn.jsdelivr.net/npm/chart.js@{version}/dist/chart.umd.min.js',
    'flatpickr-css': 'https://cdn.jsdelivr.net/npm/flatpickr@{version}/dist/flatpickr.min.css',
    'flatpickr-js': 'https://cdn.jsdelivr.net/npm/flatpickr@{version}/dist/flatpickr.min.js',
    'jszip-js': 'https://cdnjs.cloudflare.com/ajax/libs/jszip/{version}/jszip.min.js',
}

VERSIONS = {
    'bootstrap': '5.3.8',
    'bootstrap-icons': '1.11.3',
    'chart.js': '4.5.1',
    'flatpickr': '4.6.13',
    'jszip': '3.10.1',
}


def fetch_sri(url: str) -> str:
    request = urllib.request.Request(url, headers={'User-Agent': 'demopresencial-sri-updater/1.0'})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read()
    digest = hashlib.sha384(data).digest()
    return 'sha384-' + base64.b64encode(digest).decode('ascii')


def apply_cdn_updates() -> None:
    bootstrap = VERSIONS['bootstrap']
    icons = VERSIONS['bootstrap-icons']
    chart = VERSIONS['chart.js']
    flatpickr = VERSIONS['flatpickr']
    jszip = VERSIONS['jszip']

    sri = {
        'bootstrap-css': fetch_sri(CDN_ASSETS['bootstrap-css'].format(version=bootstrap)),
        'bootstrap-js': fetch_sri(CDN_ASSETS['bootstrap-js'].format(version=bootstrap)),
        'bootstrap-icons-css': fetch_sri(CDN_ASSETS['bootstrap-icons-css'].format(version=icons)),
        'chart-js': fetch_sri(CDN_ASSETS['chart-js'].format(version=chart)),
        'flatpickr-css': fetch_sri(CDN_ASSETS['flatpickr-css'].format(version=flatpickr)),
        'flatpickr-js': fetch_sri(CDN_ASSETS['flatpickr-js'].format(version=flatpickr)),
        'jszip-js': fetch_sri(CDN_ASSETS['jszip-js'].format(version=jszip)),
    }

    replacements = [
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/bootstrap@[^/]+/dist/css/bootstrap\.min\.css'),
         f'https://cdn.jsdelivr.net/npm/bootstrap@{bootstrap}/dist/css/bootstrap.min.css'),
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/bootstrap@[^/]+/dist/js/bootstrap\.bundle\.min\.js'),
         f'https://cdn.jsdelivr.net/npm/bootstrap@{bootstrap}/dist/js/bootstrap.bundle.min.js'),
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/bootstrap-icons@[^/]+/font/bootstrap-icons\.min\.css'),
         f'https://cdn.jsdelivr.net/npm/bootstrap-icons@{icons}/font/bootstrap-icons.min.css'),
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/chart\.js@[^/]+/dist/chart\.umd\.min\.js'),
         f'https://cdn.jsdelivr.net/npm/chart.js@{chart}/dist/chart.umd.min.js'),
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/flatpickr(?:@[^/]+)?/dist/flatpickr\.min\.css'),
         f'https://cdn.jsdelivr.net/npm/flatpickr@{flatpickr}/dist/flatpickr.min.css'),
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/flatpickr(?:@[^/]+)?/dist/flatpickr\.min\.js'),
         f'https://cdn.jsdelivr.net/npm/flatpickr@{flatpickr}/dist/flatpickr.min.js'),
        (re.compile(r'https://cdn\.jsdelivr\.net/npm/flatpickr(?:@[^/]+)?(?=")'),
         f'https://cdn.jsdelivr.net/npm/flatpickr@{flatpickr}/dist/flatpickr.min.js'),
        (re.compile(r'https://cdnjs\.cloudflare\.com/ajax/libs/jszip/[^/]+/jszip\.min\.js'),
         f'https://cdnjs.cloudflare.com/ajax/libs/jszip/{jszip}/jszip.min.js'),
    ]

    integrity_map = {
        'bootstrap.min.css': sri['bootstrap-css'],
        'bootstrap.bundle.min.js': sri['bootstrap-js'],
        'bootstrap-icons.min.css': sri['bootstrap-icons-css'],
        'chart.umd.min.js': sri['chart-js'],
        'flatpickr.min.css': sri['flatpickr-css'],
        'flatpickr.min.js': sri['flatpickr-js'],
        'jszip.min.js': sri['jszip-js'],
    }

    for html_path in ROOT.rglob('*.html'):
        content = html_path.read_text(encoding='utf-8')
        original = content

        for pattern, replacement in replacements:
            content = pattern.sub(replacement, content)

        for filename, integrity in integrity_map.items():
            if filename not in content:
                continue
            tag_re = re.compile(
                r'(<(?:link|script)\b[^>]*\b(?:href|src)="[^"]*'
                + re.escape(filename)
                + r'"[^>]*)(>)',
                re.IGNORECASE,
            )

            def add_integrity(match: re.Match[str]) -> str:
                tag = match.group(1)
                tag = re.sub(r'\sintegrity="[^"]*"', '', tag)
                tag = re.sub(r'\scrossorigin="[^"]*"', '', tag)
                return tag + f' integrity="{integrity}" crossorigin="anonymous"' + match.group(2)

            content = tag_re.sub(add_integrity, content)

        if content != original:
            html_path.write_text(content, encoding='utf-8')
            print('Actualizado', html_path.relative_to(ROOT))

    print('SRI CDN actualizado')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        print('Use apply-sri.py --check para scripts locales; CDN verificado en update-cdn-deps.py')
        return
    apply_cdn_updates()


if __name__ == '__main__':
    main()
