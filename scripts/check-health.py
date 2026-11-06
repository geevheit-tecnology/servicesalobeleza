#!/usr/bin/env python3
"""Read-only health probe. A scheduler/monitor must invoke this script externally."""
import argparse
import json
import os
from pathlib import Path
import sys
import tempfile
import urllib.request
import fcntl


def transition(previous, healthy, threshold):
    failures = 0 if healthy else previous.get('failures', 0) + 1
    incident = not healthy and failures >= threshold
    event = 'incident' if incident and not previous.get('incident') else None
    if healthy and previous.get('incident'):
        event = 'recovered'
    return {'failures': failures, 'incident': incident}, event


def save_state(path, state):
    descriptor, temporary = tempfile.mkstemp(dir=path.parent, prefix='.health-')
    try:
        with os.fdopen(descriptor, 'w') as output:
            json.dump(state, output)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

parser = argparse.ArgumentParser()
parser.add_argument('url', help='URL HTTPS da API, sem credenciais')
parser.add_argument('--expected-revision')
parser.add_argument('--state-file', type=Path,
                    help='Estado local para emitir incident/recovered sem enviar mensagens')
parser.add_argument('--failure-threshold', type=int, default=3)
args = parser.parse_args()
if args.failure_threshold < 1:
    parser.error('failure-threshold deve ser positivo')
healthy = False
try:
    url = args.url.rstrip('/') + '/health'
    with urllib.request.urlopen(url, timeout=10) as response:
        data = json.load(response)
    if data.get('status') != 'ok':
        raise ValueError('API indisponível')
    if args.expected_revision and data.get('revision') != args.expected_revision:
        raise ValueError('revisão publicada diferente da esperada')
    healthy = True
    result = {'status': 'ok', 'revision': data.get('revision', '')}
except Exception as error:
    result = {'status': 'failed', 'reason': str(error)}

if args.state_file:
    try:
        args.state_file.parent.mkdir(parents=True, exist_ok=True)
        with args.state_file.with_suffix('.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            previous = json.loads(args.state_file.read_text()) if args.state_file.exists() else {}
            target = {'url': args.url.rstrip('/'), 'revision': args.expected_revision}
            if previous.get('target') != target:
                previous = {}
            state, event = transition(previous, healthy, args.failure_threshold)
            state['target'] = target
            save_state(args.state_file, state)
            result.update({'consecutiveFailures': state['failures'], 'event': event})
    except Exception as error:
        healthy = False
        result = {'status': 'failed', 'reason': f'Estado do monitor indisponível: {error}'}

print(json.dumps(result), file=sys.stdout if healthy else sys.stderr)
sys.exit(0 if healthy else 1)
