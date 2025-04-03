from database import get_connection

def login(data):
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute(
        "SELECT id FROM users WHERE username=%s AND password=%s",
        (data.get("username"), data.get("password"))
    )
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if user:
        return {"success": True, "user_id": user[0]}
    return {"success": False}
