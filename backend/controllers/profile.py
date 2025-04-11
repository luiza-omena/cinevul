from database import get_connection

def get_profile_data(user_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT username, full_name, birth_date FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return {"error": "Usuário não encontrado"}

    user_data = {
        "username": user[0],
        "full_name": user[1],
        "birth_date": str(user[2]),
        "id": user_id
    }

    cur.execute("""
        SELECT orders.id, movies.title, orders.quantity, orders.type, orders.total_price, orders.seats
        FROM orders
        JOIN movies ON orders.movie_id = movies.id
        WHERE orders.user_id = %s
        ORDER BY orders.id DESC
    """, (user_id,))

    orders = cur.fetchall()

    orders_data = [
        {
            "order_id": o[0],
            "movie_title": o[1],
            "quantity": o[2],
            "type": o[3],
            "total_price": float(o[4]),
            "seats": o[5]
        }
        for o in orders
    ]

    cur.close()
    conn.close()

    return {"user": user_data, "orders": orders_data}

def update_username_raw(user_id, new_username):
    try:
        conn = get_connection()
        cur = conn.cursor()

        query = f"UPDATE users SET username = '{new_username}' WHERE id = {user_id};"
        cur.execute(query)

        conn.commit()
        cur.close()
        conn.close()
        return {"success": True}
    except Exception as e:
        print("Erro ao editar nome de usuário:", e)
        return {"success": False, "error": str(e)}