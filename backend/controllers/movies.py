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
            "image_url": row[4],
            "price": float(row[5])
        }
        for row in rows
    ]

def create_movie(data):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO movies (title, description, release_date, image_url)
            VALUES (%s, %s, %s, %s)
        """, (
            data.get("title"),
            data.get("description"),
            data.get("release_date"),
            data.get("image_url")
        ))

        conn.commit()
        return {"success": True}
    except Exception as e:
        print("❌ Erro ao criar filme:", e)
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
            return {"success": False, "error": "Movie not found"}

        return {"success": True}
    except Exception as e:
        print("❌ Erro ao deletar filme:", e)
        return {"success": False, "error": str(e)}
    finally:
        cur.close()
        conn.close()
