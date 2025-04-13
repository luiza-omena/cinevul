from database import get_connection

def is_admin(user_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result and result[0]


def get_all_users(requester_id):
    if not is_admin(requester_id):
        return {"error": "Acesso não autorizado"}

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, full_name, email, phone, is_admin FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id": u[0], "username": u[1], "full_name": u[2], "email": u[3], "phone": u[4], "is_admin": u[5]}
        for u in users
    ]

def delete_user(target_user_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM users WHERE id = %s", (target_user_id,))
        conn.commit()
        success = True
    except Exception as e:
        success = False
    cur.close()
    conn.close()
    return {"success": success}

def get_admin_stats(requester_id):
    if not is_admin(requester_id):
        return {"error": "Acesso não autorizado"}
    
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT TO_CHAR(created_at, 'Mon') AS month, SUM(total_price)
        FROM orders
        GROUP BY month
        ORDER BY MIN(created_at)
    """)
    monthly = [{"month": m[0], "total": float(m[1])} for m in cur.fetchall()]

    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM orders")
    total_orders = cur.fetchone()[0]

    cur.execute("SELECT SUM(total_price) FROM orders")
    total_revenue = float(cur.fetchone()[0] or 0)

    cur.close()
    conn.close()

    return {
        "monthlyRevenue": monthly,
        "totals": {
            "users": total_users,
            "orders": total_orders,
            "revenue": total_revenue
        }
    }
