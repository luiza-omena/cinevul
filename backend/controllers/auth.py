from database import get_connection
from controllers.session import set_session
from controllers.session import get_user_from_token
import psycopg2
import re

def verify_user(data):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, favorite_color, birth_year, first_school FROM users WHERE username = %s", (data["username"],))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return {"success": False, "error": "user_not_found"}

    if (user[1] == data["favorite_color"] and
        user[2] == data["birth_year"] and
        user[3] == data["first_school"]):
        cur.close()
        conn.close()
        return {"success": True}
    else:
        cur.close()
        conn.close()
        return {"success": False, "error": "invalid_answers"}


def reset_password(data):
    if not is_strong_password(data["password"]):
        return {"success": False}

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("UPDATE users SET password = %s WHERE username = %s", (data["password"], data["username"]))
        conn.commit()
        success = True
    except Exception:
        conn.rollback()
        success = False
    finally:
        cur.close()
        conn.close()

    return {"success": success}


def get_user_id_from_token(token):
    return get_user_from_token(token)

def is_strong_password(password):
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[\W_]", password):
        return False
    if re.search(r"(123|111|222|333|444|555|666|777|888|999)", password):
        return False
    return True

def login(data, token):
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
        set_session(token, user_id)
        return {"success": True}
    return {"success": False}


def register(data):
    conn = get_connection()
    cur = conn.cursor()

    try:
        if not is_strong_password(data["password"]):
            return {"success": False, "error": "Senha não atende aos requisitos de segurança."}
        cur.execute(
            """
            INSERT INTO users (
              username, password, full_name, birth_date,
              email, phone, favorite_color, birth_year, first_school
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                data["username"], data["password"], data["full_name"], data["birth_date"],
                data["email"], data.get("phone"), data["favorite_color"],
                data["birth_year"], data["first_school"]
            )
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        return {"success": True, "user_id": user_id}

    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        if 'users_username_key' in str(e):
            return {"success": False, "error": "Nome de usuário já existe."}
        elif 'users_email_key' in str(e):
            return {"success": False, "error": "E-mail já está em uso."}
        return {"success": False, "error": "Erro de duplicidade."}

    except Exception as e:
        conn.rollback()
        return {"success": False, "error": "Erro ao registrar usuário."}

    finally:
        cur.close()
        conn.close()