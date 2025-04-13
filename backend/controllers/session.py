import time

sessions = {}

def generate_token():
    return str(int(time.time()))

def set_session(token, user_id):
    sessions[token] = user_id

def get_user_from_token(token):
    return sessions.get(token)

def is_authenticated(token):
    return token in sessions

def logout_user(current_token):
    from controllers.auth import get_user_id_from_token
    user_id = get_user_id_from_token(current_token)
    if not user_id:
        return

    tokens_to_remove = [t for t, uid in sessions.items() if uid == user_id]
    for t in tokens_to_remove:
        del sessions[t]