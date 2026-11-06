import http.server
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'check-health.py'


class HealthTest(unittest.TestCase):
    def setUp(self):
        self.response = {'status': 'ok', 'revision': 'test-revision'}
        case = self

        class Handler(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(case.response).encode())

            def log_message(self, *_):
                pass

        self.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.directory = tempfile.TemporaryDirectory()
        self.state = Path(self.directory.name) / 'health.json'
        self.addCleanup(self.directory.cleanup)
        self.addCleanup(self.server.server_close)
        self.addCleanup(self.server.shutdown)

    def probe(self):
        result = subprocess.run([
            sys.executable, str(SCRIPT),
            f'http://127.0.0.1:{self.server.server_port}',
            '--expected-revision', 'test-revision',
            '--state-file', str(self.state), '--failure-threshold', '2',
        ], capture_output=True, text=True, timeout=15)
        return result.returncode, json.loads(result.stdout or result.stderr)

    def test_incident_is_emitted_once_and_recovery_clears_failures(self):
        self.response['status'] = 'unavailable'
        self.assertEqual(self.probe()[1]['event'], None)
        code, data = self.probe()
        self.assertEqual(code, 1)
        self.assertEqual(data['event'], 'incident')
        self.assertEqual(self.probe()[1]['event'], None)
        self.response['status'] = 'ok'
        code, data = self.probe()
        self.assertEqual(code, 0)
        self.assertEqual(data['event'], 'recovered')
        self.assertEqual(data['consecutiveFailures'], 0)
        self.assertEqual(self.probe()[1]['event'], None)

    def test_wrong_revision_is_a_failure(self):
        self.response['revision'] = 'old-version'
        code, data = self.probe()
        self.assertEqual(code, 1)
        self.assertIn('revisão', data['reason'])
        self.assertEqual(data['consecutiveFailures'], 1)

    def test_unreadable_state_cannot_report_success(self):
        self.state.write_text('not-json')
        code, data = self.probe()
        self.assertEqual(code, 1)
        self.assertIn('Estado do monitor indisponível', data['reason'])
        self.assertEqual(self.state.read_text(), 'not-json')


if __name__ == '__main__':
    unittest.main()
