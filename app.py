from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import json


BASE_DIR = Path(__file__).resolve().parent


class AppHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/":
            self.path = "/static/index.html"
        elif self.path == "/version":
            version = max(
                path.stat().st_mtime_ns
                for path in (BASE_DIR / "static").iterdir()
                if path.is_file()
            )
            payload = json.dumps({"version": version}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        elif self.path == "/health":
            payload = b'{"status":"ok"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    server = ThreadingHTTPServer(("127.0.0.1", 8000), AppHandler)
    print("HVAC Calculation Studio running at http://127.0.0.1:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
