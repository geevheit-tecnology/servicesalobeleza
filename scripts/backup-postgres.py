#!/usr/bin/env python3
"""Create and verify a private PostgreSQL archive; no scheduler or upload is enabled."""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
from urllib.parse import parse_qs, unquote, urlparse
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--directory', type=Path, required=True)
parser.add_argument('--keep', type=int, default=7)
parser.add_argument('--allow-remote', action='store_true')
args = parser.parse_args()
if args.keep < 1:
    parser.error('keep deve ser pelo menos 1')
url = urlparse(os.environ.get('BACKUP_DATABASE_URL', ''))
if url.scheme not in ('postgres', 'postgresql') or not url.hostname or not url.path.strip('/'):
    parser.error('configure BACKUP_DATABASE_URL; não informe credenciais nos argumentos')
if not args.allow_remote and (url.hostname not in ('localhost', '127.0.0.1') or not url.path.endswith('_test')):
    parser.error('por padrão somente localhost e banco com sufixo _test; remoto exige --allow-remote')

environment = os.environ.copy()
environment.update({
    'PGHOST': url.hostname, 'PGPORT': str(url.port or 5432),
    'PGDATABASE': unquote(url.path.lstrip('/')),
    'PGUSER': unquote(url.username or ''), 'PGPASSWORD': unquote(url.password or ''),
    'PGCONNECT_TIMEOUT': '10',
    'PGSSLMODE': parse_qs(url.query).get('sslmode', ['prefer'])[0],
})
args.directory.mkdir(parents=True, exist_ok=True, mode=0o700)
name = 'belezapura-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S') + '-' + uuid.uuid4().hex
temporary = args.directory / (name + '.partial')
archive = args.directory / (name + '.dump')
manifest = args.directory / (name + '.json')
started = datetime.datetime.now(datetime.timezone.utc)
try:
    # Exclusive creation and private permissions before pg_dump starts writing.
    with temporary.open('xb'):
        temporary.chmod(0o600)
    subprocess.run(['pg_dump', '--format=custom', '--file', str(temporary)],
                   env=environment, capture_output=True, check=True, timeout=3600)
    subprocess.run(['pg_restore', '--list', str(temporary)],
                   capture_output=True, check=True, timeout=120)
    with temporary.open('rb') as input_file:
        digest = hashlib.file_digest(input_file, 'sha256').hexdigest()
    temporary.replace(archive)
    metadata = {'archive': archive.name, 'sha256': digest,
                'bytes': archive.stat().st_size, 'database': environment['PGDATABASE'],
                'createdAt': started.isoformat(),
                'durationSeconds': (datetime.datetime.now(datetime.timezone.utc) - started).total_seconds()}
    with manifest.open('x') as output:
        manifest.chmod(0o600)
        json.dump(metadata, output, indent=2)
    # Retain only archives created by this tool that have a matching manifest.
    pairs = sorted(args.directory.glob('belezapura-*.json'), key=lambda p: p.name, reverse=True)
    valid = []
    for candidate in pairs:
        try:
            item = json.loads(candidate.read_text())
            matching = candidate.with_suffix('.dump')
            if item.get('archive') == matching.name and matching.is_file():
                valid.append((candidate, matching))
        except (OSError, ValueError):
            continue
    removed = 0
    for old_manifest, old_archive in valid[args.keep:]:
        old_archive.unlink()
        old_manifest.unlink()
        removed += 1
    print(json.dumps({'status': 'ok', **metadata, 'removedArchives': removed}))
except (subprocess.SubprocessError, OSError, ValueError) as error:
    # Do not print subprocess stderr: credentials or server details may be present.
    print(json.dumps({'status': 'failed', 'reason': type(error).__name__}), file=sys.stderr)
    sys.exit(1)
finally:
    if temporary.exists():
        temporary.unlink()
