from database import get_connection
from controllers.session import set_session
from controllers.session import get_user_from_token


def get_user_id_from_token(token):
    return get_user_from_token(token)

def login(data, token):
    print("🎯 Verificando usuário no banco...", flush=True)
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id FROM users WHERE username = %s AND password = %s",
        (data["username"], data["password"])
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    if user:
        user_id = user[0]
        print(f"✅ Login bem-sucedido! user_id: {user_id}", flush=True)
        set_session(token, user_id)
        return {"success": True}
    print("❌ Login falhou: credenciais inválidas", flush=True)
    return {"success": False}


def register(data):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO users (username, password, full_name, birth_date) VALUES (%s, %s, %s, %s) RETURNING id",
            (data["username"], data["password"], data["full_name"], data["birth_date"])
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        success = True
    except Exception:
        conn.rollback()
        user_id = None
        success = False

    cur.close()
    conn.close()

    return {"success": success, "user_id": user_id}