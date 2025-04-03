import json
from controllers.auth import login
from controllers.movies import get_movies
from controllers.orders import create_order
from controllers.dashboard import get_dashboard_data

def handle_get(handler):
    if handler.path.startswith("/movies"):
        response = get_movies()
    elif handler.path.startswith("/dashboard"):
        response = get_dashboard_data()
    else:
        handler.send_response(404)
        handler.end_headers()
        return

    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())

def handle_post(handler):
    content_length = int(handler.headers.get('Content-Length', 0))
    post_data = json.loads(handler.rfile.read(content_length))
    
    if handler.path.startswith("/login"):
        response = login(post_data)
        code = 200 if response.get("success") else 401
        handler.send_response(code)
    elif handler.path.startswith("/order"):
        response = create_order(post_data)
        code = 201 if response.get("success") else 400
        handler.send_response(code)
    else:
        handler.send_response(404)
        response = {"error": "Not Found"}

    handler.send_header('Content-Type', 'application/json')
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())
