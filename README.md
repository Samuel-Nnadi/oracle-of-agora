# The Oracle of Agora — Full-Stack Platform

> Sovereign Intelligence. Sub-second Settlement.

The Oracle of Agora is an autonomous AI agent monitoring the social pulse of the Web3 economy on Arc.network. This repository contains the complete full-stack infrastructure, including the high-end landing page, a FastAPI backend, and a PostgreSQL database.

Built for **The Agora Hackathon**.

---

## 🚀 Quick Start (Docker)

The entire platform is containerized for easy deployment.

```bash
# 1. Clone the repository
# 2. Start the services
docker-compose up --build -d
```

**Access Points:**
- **Landing Page**: [http://localhost](http://localhost)
- **Admin Dashboard**: [http://localhost/admin.html](http://localhost/admin.html) (Default Secret: `oracle-secret`)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ✨ Features

- **Autonomous Signal Feed**: A real-time, terminal-style feed simulating the Oracle's ingestion of Discord, X, and Telegram signals.
- **Waitlist Signup**: Validated lead capture (Email or `.arc` addresses) connected to a persistent PostgreSQL database.
- **Admin Intelligence Hub**: A secure dashboard to view and manage signups, styled to match the editorial aesthetic.
- **High-End Design**: Asymmetric layouts, sophisticated typography (Inter & Instrument Serif), and film-grain textures for a premium feel.
- **Performance**: Sub-second responsiveness powered by a FastAPI backend.

---

## 🏗️ Project Structure

```
├── backend/
│   ├── main.py          # FastAPI endpoints & logic
│   ├── database.py      # SQLAlchemy models & DB connection
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile       # Backend container definition
├── frontend/
│   ├── index.html       # Landing page (Oracle interface)
│   ├── admin.html       # Admin dashboard
│   ├── style.css        # Shared design system & tokens
│   ├── script.js        # Landing page logic & API calls
│   ├── admin.js         # Admin dashboard logic
│   └── Dockerfile       # Nginx container definition
├── docker-compose.yml   # Multi-container orchestration
├── .env                 # Environment variables (Secrets)
└── README.md            # This file
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript |
| **Backend** | Python, FastAPI |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Server** | Nginx (Frontend), Uvicorn (Backend) |
| **Infrastructure** | Docker, Docker Compose |

---

## 🔐 Configuration

The system uses a `.env` file for configuration. You can modify these values to secure your deployment:

```env
DATABASE_URL=postgresql://oracle_user:oracle_pass@db:5432/oracle_db
POSTGRES_USER=oracle_user
POSTGRES_PASSWORD=oracle_pass
POSTGRES_DB=oracle_db
ADMIN_PASSWORD=oracle-secret
```

---

## 🛡️ Admin Access

The Admin Dashboard is protected by a simple header-based password check. 
1. Navigate to `/admin.html`.
2. Enter the `ADMIN_PASSWORD` defined in your `.env`.
3. View the list of builders who have joined the deliberation.

---

## 🌐 SEO & Metadata

Configured in `frontend/index.html`:
- Semantic HTML5 structure.
- OpenGraph & Twitter Card metadata for high-quality social sharing.
- Optimized for performance and accessibility.

---

## 🚢 Deployment

For production deployment, ensure the `POSTGRES_PASSWORD` and `ADMIN_PASSWORD` are changed to strong secrets. The `docker-compose.yml` is ready to be deployed on any VPS with Docker installed.
