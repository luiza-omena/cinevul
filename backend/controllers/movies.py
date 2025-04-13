from database import get_connection
from datetime import datetime

def get_movies():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, title, description, release_date, image_url, price FROM movies")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "release_year": row[3].year if row[3] else None,
            "release_date": row[3].strftime("%Y-%m-%d") if row[3] else None,
            "image_url": row[4],
            "price": float(row[5]) if row[5] is not None else 0.0
        }
        for row in rows
    ]

def create_movie(data):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO movies (title, description, release_date, image_url, price)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data.get("title"),
            data.get("description"),
            data.get("release_date"),
            data.get("image_url"),
            data.get("price")
        ))
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        conn.close()

def update_movie(data):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE movies
            SET title = %s,
                description = %s,
                release_date = %s,
                image_url = %s,
                price = %s
            WHERE id = %s
        """, (
            data.get("title"),
            data.get("description"),
            data.get("release_date"),
            data.get("image_url"),
            data.get("price"),
            data.get("id")
        ))
        conn.commit()
        if cur.rowcount == 0:
            return {"success": False, "error": "Filme não encontrado"}
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        conn.close()

def delete_movie(movie_id):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM movies WHERE id = %s", (movie_id,))
        conn.commit()
        if cur.rowcount == 0:
            return {"success": False, "error": "Filme não encontrado"}
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        conn.close()
