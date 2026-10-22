# Minimal Upstash-REST-compatible shim over a local redis (port 6390) for testing. POST / with JSON array.
import json, sys, time, redis
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
DELAY = float(sys.argv[2]) if len(sys.argv) > 2 else 0
r = redis.Redis(port=6390, db=1 if DELAY else 0, decode_responses=True)  # slow shim writes elsewhere
DELAY = float(sys.argv[2]) if len(sys.argv) > 2 else 0
class H(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.headers.get('Authorization') != 'Bearer testtoken':
            self.send_response(401); self.end_headers(); self.wfile.write(b'{"error":"unauthorized"}'); return
        if DELAY: time.sleep(DELAY)
        cmd = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        try:
            res = r.execute_command(*cmd)
            if isinstance(res, dict): res = [x for kv in res.items() for x in kv]  # Upstash returns flat arrays
            if isinstance(res, set): res = sorted(res)
            out = {'result': res}
        except Exception as e: out = {'error': str(e)}
        b = json.dumps(out).encode(); self.send_response(200); self.send_header('Content-Type','application/json'); self.end_headers(); self.wfile.write(b)
    def log_message(self, *a): pass
ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), H).serve_forever()
