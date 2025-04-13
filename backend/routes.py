import json
import os
from controllers.auth import login, register, reset_password, verify_user
from controllers.movies import get_movies, create_movie, update_movie, delete_movie
from controllers.orders import create_order, get_all_orders_with_movies
from controllers.dashboard import delete_user, get_admin_stats, get_all_users, is_admin
from controllers.session import generate_token, get_user_from_token, is_authenticated, logout_user
from controllers.profile import get_profile_data, update_profile_field, update_username_raw

ALLOWED_ORIGIN = "http://localhost:5500"

def get_token_from_cookie(handler):
    cookie = handler.headers.get('Cookie')
    if cookie:
        parts = cookie.split(";")
        for part in parts:
            if "token=" in part:
                token = part.strip().split("=")[1]
                return token
    return None

def add_cors_headers(handler):
    handler.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
    handler.send_header("Access-Control-Allow-Credentials", "true")

def handle_get(handler):
    token = get_token_from_cookie(handler)
    if not token:
        token = generate_token()

    response = {}
    code = 200

    if handler.path.startswith("/movies"):
        if not is_authenticated(token):
            response = {"error": "Usuário não autenticado"}
            code = 401
        else:
            response = get_movies()

    elif handler.path.startswith("/admin/movies"):
        user_id = get_user_from_token(token)
        if not is_authenticated(token) or not is_admin(user_id):
            response = {"error": "Acesso negado"}
            code = 403
        else:
            response = get_movies()
            code = 200

    elif handler.path.startswith("/dashboard"):
        if not is_authenticated(token):
            response = {"error": "Usuário não autenticado"}
            code = 401
        else:
            response = {"error": "Dashboard indisponível"}
            code = 200

    elif handler.path.startswith("/admin/orders"):
        user_id = get_user_from_token(token)
        response = get_all_orders_with_movies(user_id)
        if "error" in response:
            code = 403

    elif handler.path.startswith("/profile"):
        if not is_authenticated(token):
            response = {"error": "Usuário não autenticado"}
            code = 401
        else:
            user_id = get_user_from_token(token)
            response = get_profile_data(user_id)

    elif handler.path.startswith("/admin/stats"):
        user_id = get_user_from_token(token)
        response = get_admin_stats(user_id)
        if "error" in response:
            code = 403

    elif handler.path.startswith("/devtools"):
        return handle_devtools(handler)

    elif handler.path.startswith("/admin/users"):
        user_id = get_user_from_token(token)
        response = get_all_users(user_id)
        if "error" in response:
            code = 403

    elif handler.path.startswith("/isAuthenticated"):
        auth_status = is_authenticated(token)
        response = {"isAuthenticated": auth_status}
        code = 200

    elif handler.path.startswith("/isAdmin"):
        user_id = get_user_from_token(token)
        admin_status = is_admin(user_id)
        response = {"is_admin": admin_status}
        code = 200

    else:
        response = {"error": "Not Found"}
        code = 404

    handler.send_response(code)
    add_cors_headers(handler)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Set-Cookie", f"token={token}; Path=/; HttpOnly; SameSite=Lax")
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())

def handle_post(handler):
    token_cookie = get_token_from_cookie(handler)
    token = token_cookie or generate_token()
    content_length = int(handler.headers.get("Content-Length", 0))
    post_data = json.loads(handler.rfile.read(content_length)) if content_length > 0 else {}

    if handler.path.startswith("/login"):
        response = login(post_data, token)
        code = 200 if response.get("success") else 401
        handler.send_response(code)
        handler.send_header("Set-Cookie", f"token={token}; Path=/; HttpOnly; SameSite=Lax")

    elif handler.path.startswith("/register"):
        response = register(post_data)
        handler.send_response(201 if response.get("success") else 400)

    elif handler.path.startswith("/order"):
        user_id = get_user_from_token(token)
        response = create_order(post_data, user_id)
        handler.send_response(201 if response.get("success") else 400)

    elif handler.path.startswith("/logout"):
        logout_user(token)
        new_token = generate_token()

        handler.send_response(200)
        add_cors_headers(handler)
        handler.send_header("Content-Type", "application/json")
        handler.send_header("Set-Cookie", f"token={new_token}; Path=/; HttpOnly; SameSite=Lax")
        handler.end_headers()
        handler.wfile.write(json.dumps({"success": True}).encode())
        return

    elif handler.path.startswith("/edit-username"):
        user_id = post_data["id"]
        new_username = post_data["value"]
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
        response = verify_user(post_data)
        handler.send_response(200)

    elif handler.path.startswith("/recover/reset"):
        response = reset_password(post_data)
        handler.send_response(200)

    elif handler.path.startswith("/admin/delete-user"):
        response = delete_user(post_data["id"])
        handler.send_response(200)

    elif handler.path.startswith("/admin/movies/create"):
        user_id = get_user_from_token(token)
        if not is_authenticated(token) or not is_admin(user_id):
            response = {"error": "Acesso negado"}
            handler.send_response(403)
        else:
            response = create_movie(post_data)
            handler.send_response(201 if response.get("success") else 400)

    elif handler.path.startswith("/admin/movies/edit"):
        user_id = get_user_from_token(token)
        if not is_authenticated(token) or not is_admin(user_id):
            response = {"error": "Acesso negado"}
            handler.send_response(403)
        else:
            response = update_movie(post_data)
            handler.send_response(200 if response.get("success") else 400)

    elif handler.path.startswith("/admin/movies/delete"):
        user_id = get_user_from_token(token)
        if not is_authenticated(token) or not is_admin(user_id):
            response = {"error": "Acesso negado"}
            handler.send_response(403)
        else:
            movie_id = post_data.get("id")
            response = delete_movie(movie_id)
            handler.send_response(200 if response.get("success") else 400)

    else:
        response = {"error": "Not Found"}
        handler.send_response(404)

    add_cors_headers(handler)
    handler.send_header("Content-Type", "application/json")
    handler.end_headers()
    handler.wfile.write(json.dumps(response).encode())

def handle_devtools(handler):
    base_dir = os.path.abspath('.')
    data = {}

    for root, dirs, files in os.walk(base_dir):
        relative_path = os.path.relpath(root, base_dir)
        data[relative_path] = {
            "dirs": dirs,
            "files": files
        }

    handler.send_response(200)
    add_cors_headers(handler)
    handler.send_header("Content-Type", "application/json")
    handler.end_headers()
    handler.wfile.write(json.dumps(data, indent=2).encode())