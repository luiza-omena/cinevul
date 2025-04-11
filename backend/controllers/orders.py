from database import get_connection

def create_order(data, user_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO orders (user_id, movie_id, quantity, type, proof, total_price, seats)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            user_id,
            data["movie_id"],
            data["quantity"],
            data["type"],
            data.get("proof"),
            data["total_price"],
            data.get("seats")
        )
    )

    order_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return {"success": True, "order_id": order_id}

def get_all_orders_with_movies(user_id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT is_admin FROM users WHERE id = %s", (user_id,))
    result = cur.fetchone()
    if not result or not result[0]:
        cur.close()
        conn.close()
        return {"error": "Acesso não autorizado"}

    cur.execute("""
        SELECT o.id, o.quantity, o.type, o.proof, o.total_price, o.seats, m.title, u.username
        FROM orders o
        JOIN movies m ON o.movie_id = m.id
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "id": row[0],
            "quantity": row[1],
            "type": row[2],
            "proof": row[3],
            "total_price": float(row[4]),
            "seats": row[5],
            "movie_title": row[6],
            "username": row[7]
        }
        for row in rows
    ]