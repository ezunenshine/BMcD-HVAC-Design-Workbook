from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"


class AppHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if path in {"/", "/index.html"}:
            return str(STATIC / "index.html")
        if path.startswith("/static/"):
            relative = path.removeprefix("/static/").split("?", 1)[0].split("#", 1)[0]
            requested = (STATIC / relative).resolve()
            if STATIC in requested.parents:
                return str(requested)
        return str(STATIC / "__not_found__")

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


if __name__ == "__main__":
    host, port = "127.0.0.1", 8000
    print(f"HVAC Design Workbook running at http://{host}:{port}")
    ThreadingHTTPServer((host, port), AppHandler).serve_forever()
