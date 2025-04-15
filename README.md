# 🎬 CineViewExperience (CVE)

**CineViewExperience** is an interactive web platform that simulates movie ticket purchases. Developed with an educational focus, the application allows users to explore fullstack development concepts and test security vulnerabilities in a controlled environment. With a complete system featuring user login, orders, and an administrative dashboard, CVE is ideal for hands-on learning in information security and best web development practices.

---

## 🚀 Technologies Used

### 🔹 Frontend

- **HTML**: Structure of the platform's pages.
- **CSS**: Responsive design with mobile-friendly adaptation.
- **JavaScript**: Dynamic interactions and asynchronous communication with the backend.

<p>
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML" width="48" height="48">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS" width="48" height="48">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" width="48" height="48">
</p>

### 🔸 Backend

- **Python**: Primary language for business logic and routing.
- **http.server**: Lightweight built-in HTTP server.
- **psycopg2**: PostgreSQL connector.
- **dotenv**: Reads sensitive environment variables.

<p>
  <img src="https://www.python.org/static/community_logos/python-logo.png" alt="Python" width="100">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="48" height="48">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" width="48" height="48">
</p>

---

## ⚙️ Project Setup

### 🐳 With Docker (Recommended)

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/cineviewexperience.git
   cd cineviewexperience
   ```

2. Start the environment:

   ```bash
   docker compose up --build
   ```

3. Access the services:

   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:5500`

> The database is automatically created with the tables `users`, `movies`, and `orders` via the `init.sql` script.

---

### 💻 Run Frontend Locally

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Start a local server:

   ```bash
   python3 -m http.server 5500
   ```

3. Open in your browser:

   ```
   http://localhost:5500
   ```

---

### 🐍 Run Backend Locally

1. Install the dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

2. Start the server:

   ```bash
   cd backend
   python server.py
   ```

3. Access it at:

   ```
   http://localhost:8000
   ```

---

### 🗃️ Database

- Port: `5432`
- Database: `cinema`
- User: `postgres`
- Password: `senha123`

The credentials are defined in `docker-compose.yml`.

---

## 📁 Directory Structure

```
cineviewexperience/
├── backend/
│   ├── server.py
│   ├── controllers/
│   ├── database/
│   └── requirements.txt
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── orders.html
│   ├── index.html
│   ├── about.html
│   ├── dashboard-movies.html
│   ├── movies.html
│   ├── users.html
│   ├── recover.html
│   ├── register.html
│   ├── profile.html
│   ├── js/
│   └── css/
├── docker-compose.yml
├── Dockerfile
└── scripts.sql/
```

---

## 🎓 Educational Purpose

This platform was created for study, testing, and learning purposes:

- Simulation of common security vulnerabilities
- Analysis of insecure web practices
- Practical application of penetration testing techniques
- Teaching concepts of authentication, validation, and data protection

> ⚠️ **Attention:** Do not use this system in production environments. The vulnerabilities are intentional, and security has been purposely compromised.

