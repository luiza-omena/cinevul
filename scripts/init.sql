DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS movies;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    favorite_color TEXT,
    birth_year TEXT,
    first_school TEXT
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_date DATE,
    image_url TEXT,
    price NUMERIC(10,2)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  quantity INT NOT NULL,
  type TEXT NOT NULL,
  proof TEXT,
  total_price NUMERIC(10,2),
  seats TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT orders_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);
