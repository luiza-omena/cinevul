import json
from controllers.auth import login, register, reset_password, verify_user
from controllers.movies import get_movies
from controllers.orders import create_order, get_all_orders_with_movies
from controllers.dashboard import get_dashboard_data
from controllers.session import generate_token, get_user_from_token, is_authenticated, logout_user
from controllers.profile import get_profile_data, update_profile_field, update_username_raw

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

    elif handler.path.startswith("/admin/orders"):
        user_id = get_user_from_token(token)
        print("🔐 Acesso admin solicitado por user_id:", user_id, flush=True)
        response = get_all_orders_with_movies(user_id)
        print("a response do admin", response)
        if "error" in response:
            handler.send_response(403)
        else:
            handler.send_response(200)
            
    elif handler.path.startswith("/profile"):
        if not is_authenticated(token):
            handler.send_response(401)
            response = {"error": "Usuário não autenticado"}
        else:
            user_id = get_user_from_token(token)
            response = get_profile_data(user_id)
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
        user_id = get_user_from_token(token)
        response = create_order(post_data, user_id)
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
    
    elif handler.path.startswith("/edit-username"):
        user_id = post_data.get("id")
        new_username = post_data.get("new_username")
        response = update_username_raw(user_id, new_username)
        code = 200 if response.get("success") else 401
        handler.send_response(code)

    elif handler.path.startswith("/edit-email"):
        response = update_profile_field(post_data["id"], "email", post_data["value"])
        handler.send_response(200 if response.get("success") else 400)
        
    elif handler.path.startswith("/edit-phone"):
        response = update_profile_field(post_data["id"], "phone", post_data["value"])
        handler.send_response(200 if response.get("success") else 400)


    elif handler.path.startswith("/recover/verify"):
        print("questoes de seguranca recebidas!", flush=True)
        response = verify_user(post_data)
        handler.send_response(200)

    elif handler.path.startswith("/recover/reset"):
        print("senha nova recebido!", flush=True)
        response = reset_password(post_data)
        handler.send_response(200)

    else:
        response = {"error": "Not Found"}
        handler.send_response(404)

    add_cors_headers(handler)
    handler.send_header("Content-Type", "application/json")
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())