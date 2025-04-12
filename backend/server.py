import sys
import os
sys.path.append(os.path.dirname(__file__))

from http.server import HTTPServer, BaseHTTPRequestHandler
import routes

ALLOWED_ORIGIN = "http://localhost:5500"
class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        routes.handle_get(self)

    def do_POST(self):
        routes.handle_post(self)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        
def run(server_class=HTTPServer, handler_class=RequestHandler):
    server_address = ('0.0.0.0', 8000)
    httpd = server_class(server_address, handler_class)
    print("🚀 Server running at http://0.0.0.0:8000", flush=True)
    httpd.serve_forever()

if __name__ == "__main__":
    run()