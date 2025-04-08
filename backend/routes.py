import json
from controllers.auth import login, register
from controllers.movies import get_movies
from controllers.orders import create_order
from controllers.dashboard import get_dashboard_data
from controllers.session import generate_token, is_authenticated, logout_user


ALLOWED_ORIGIN = "http://localhost:5500"

def get_token_from_cookie(handler):
    cookie = handler.headers.get('Cookie')
    print("🔍 Cookie recebido:", cookie, flush=True)
    if cookie:
        parts = cookie.split(";")
        for part in parts:
            if "token=" in part:
                token = part.strip().split("=")[1]
                print("✅ Token extraído do cookie:", token, flush=True)
                return token
    return None

def add_cors_headers(handler):
    handler.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
    handler.send_header("Access-Control-Allow-Credentials", "true")

def handle_get(handler):
    print("➡️ GET recebido em:", handler.path, flush=True)

    token = get_token_from_cookie(handler)
    if not token:
        token = generate_token()
        print("🆕 Novo token gerado (GET):", token, flush=True)

    handler.send_response(200)
    add_cors_headers(handler)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Set-Cookie", f"token={token}; Path=/; HttpOnly; SameSite=None")

    if handler.path.startswith("/movies") or handler.path.startswith("/dashboard"):
        if not is_authenticated(token):
            print("⛔ Acesso negado: usuário não autenticado", flush=True)
            handler.end_headers()
            handler.wfile.write(json.dumps({"error": "Usuário não autenticado"}).encode())
            return

    if handler.path.startswith("/movies"):
        response = get_movies()
    elif handler.path.startswith("/dashboard"):
        response = get_dashboard_data()
    else:
        handler.send_response(404)
        response = {"error": "Not Found"}

    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())

def handle_post(handler):
    token_cookie = get_token_from_cookie(handler)
    token = token_cookie or generate_token()

    print("📩 POST recebido:", handler.path, flush=True)
    print("📎 Token usado:", token, flush=True)

    content_length = int(handler.headers.get("Content-Length", 0))
    post_data = json.loads(handler.rfile.read(content_length)) if content_length > 0 else {}

    if handler.path.startswith("/login"):
        print("🔐 Tentando login com dados:", post_data, flush=True)
        response = login(post_data, token)
        code = 200 if response.get("success") else 401
        handler.send_response(code)
        handler.send_header("Set-Cookie", f"token={token}; Path=/; HttpOnly; SameSite=None")
    elif handler.path.startswith("/register"):
        response = register(post_data)
        handler.send_response(201 if response.get("success") else 400)
    elif handler.path.startswith("/order"):
        response = create_order(post_data)
        handler.send_response(201 if response.get("success") else 400)
    elif handler.path.startswith("/logout"):
        print("🚪 Logout recebido!", flush=True)
        logout_user(token)

        new_token = generate_token()
        print("♻️ Novo token anônimo gerado:", new_token, flush=True)

        handler.send_response(200)
        add_cors_headers(handler)
        handler.send_header("Content-Type", "application/json")
        handler.send_header("Set-Cookie", f"token={new_token}; Path=/; HttpOnly; SameSite=None")
        handler.end_headers()
        handler.wfile.write(json.dumps({"success": True}).encode())
        return
    else:
        response = {"error": "Not Found"}
        handler.send_response(404)

    add_cors_headers(handler)
    handler.send_header("Content-Type", "application/json")
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())