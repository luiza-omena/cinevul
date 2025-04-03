import sys
import os
sys.path.append(os.path.dirname(__file__))

from http.server import HTTPServer, BaseHTTPRequestHandler
import routes

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        routes.handle_get(self)

    def do_POST(self):
        routes.handle_post(self)

def run(server_class=HTTPServer, handler_class=RequestHandler):
    server_address = ('0.0.0.0', 8000)
    httpd = server_class(server_address, handler_class)
    print("Server running at http://0.0.0.0:8000")
    httpd.serve_forever()

if __name__ == "__main__":
    run()

