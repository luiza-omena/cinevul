CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL
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
  user_id INT REFERENCES users(id),
  movie_id INT REFERENCES movies(id),
  quantity INT NOT NULL,
  type TEXT NOT NULL,
  proof TEXT,
  total_price NUMERIC(10,2),
  seats TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
