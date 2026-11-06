#!/usr/bin/env python3
"""Observe a local disposable Docker database until a capacity report is complete."""
import argparse
import datetime
import json
import os
from pathlib import Path
import subprocess
import time

parser = argparse.ArgumentParser()
parser.add_argument('--container', required=True)
parser.add_argument('--database', required=True)
parser.add_argument('--user', required=True)
parser.add_argument('--report', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
if not args.database.endswith('_test'):
    parser.error('somente banco descartável com sufixo _test')

def command(*parts):
    return subprocess.run(parts, check=True, capture_output=True, text=True,
                          timeout=20).stdout.strip()

deadline = time.monotonic() + 45 * 60
args.output.parent.mkdir(parents=True, exist_ok=True)
with args.output.open('x') as output:
    while time.monotonic() < deadline:
        sample = {'time': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  'hostLoadAverage': os.getloadavg()}
        try:
            sample['docker'] = json.loads(command(
                'docker', 'stats', '--no-stream', '--format', '{{json .}}', args.container))
            sample['postgres'] = json.loads(command(
                'docker', 'exec', args.container, 'psql', '-U', args.user,
                '-d', args.database, '-Atc',
                "SELECT json_build_object('connections',count(*),"
                "'active',count(*) FILTER (WHERE state='active'),"
                "'waitingLock',count(*) FILTER (WHERE wait_event_type='Lock'),"
                "'longestActiveSeconds',COALESCE(max(extract(epoch FROM "
                "clock_timestamp()-query_start)) FILTER (WHERE state='active' "
                "AND pid<>pg_backend_pid()),0)) FROM pg_stat_activity "
                "WHERE datname=current_database()"))
        except (subprocess.SubprocessError, ValueError) as error:
            sample['error'] = type(error).__name__
        output.write(json.dumps(sample) + '\n')
        output.flush()
        try:
            if len(json.loads(args.report.read_text()).get('stages', [])) == 4:
                break
        except (OSError, ValueError):
            pass
        time.sleep(15)
