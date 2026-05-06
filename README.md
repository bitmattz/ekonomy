# Ekonomy

A self-hosted personal finance app. Track accounts, transactions, categories, salary allocations, and generate monthly reports — all data stays on your own server.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Running Locally (Dev Mode)](#running-locally-dev-mode)
- [Running with Docker](#running-with-docker)
- [Deploying to a Server](#deploying-to-a-server)
- [Backup & Restore](#backup--restore)
- [Setting Up a Git Repository](#setting-up-a-git-repository)

---

## Architecture

```
┌─────────────────────┐        ┌─────────────────────┐        ┌──────────────┐
│   Angular 17 UI     │  HTTP  │   Quarkus 3 API      │  JDBC  │  PostgreSQL  │
│   (nginx :80)       │◄──────►│   (JVM :8080)        │◄──────►│   (:5432)    │
└─────────────────────┘        └─────────────────────┘        └──────────────┘
```

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Angular 17 + Angular Material | Standalone components, served by nginx |
| Backend | Quarkus 3 + Panache + SmallRye JWT | REST API, Flyway migrations |
| Database | PostgreSQL 16 | Schema managed entirely by Flyway |
| Auth | RSA-signed JWT (2048-bit) | Keys generated locally at setup |

**Request flow in Docker:** browser → nginx (port 80) → nginx proxies `/api/*` to the Quarkus container internally → PostgreSQL. The Angular app and the API are never directly exposed together; nginx is the single entry point.

---

## Project Structure

```
ekonomy/
├── docker-compose.yml       # All three services (postgres, api, ui)
├── setup.sh                 # First-time setup: generates RSA keys
├── dev.sh                   # Run API + UI locally, only DB in Docker
├── backup.sh                # pg_dump the database to a SQL file
├── restore.sh               # Restore database from a SQL dump
├── Makefile                 # Convenience make targets
├── keys/                    # RSA key pair (git-ignored)
│   ├── privateKey.pem
│   └── publicKey.pem
├── ekonomy-api/             # Quarkus backend
│   ├── src/main/java/com/ekonomy/
│   │   ├── auth/            # Login endpoint, JWT issuance
│   │   ├── user/            # User entity + seeding
│   │   ├── account/         # Accounts CRUD
│   │   ├── transaction/     # Transactions CRUD
│   │   ├── category/        # Categories CRUD
│   │   ├── salary/          # Salary & budget allocation CRUD
│   │   ├── export/          # Export / import all user data
│   │   └── security/        # SecurityService (current-user helper)
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/    # Flyway SQL migrations
└── ekonomy-ui/              # Angular frontend
    ├── src/app/
    │   ├── core/            # Models, services, guards
    │   ├── layout/          # Sidebar shell
    │   └── pages/           # dashboard, accounts, transactions,
    │                        # categories, calendar, reports, salary,
    │                        # settings (export/import)
    ├── nginx.conf           # Production nginx config
    └── Dockerfile
```

---

## Running Locally (Dev Mode)

Use this when you want live-reload for both the API and the UI while only the database runs in Docker.

**Prerequisites**

- Docker + Docker Compose
- Java 21 (`/usr/lib/jvm/java-21-openjdk` or adjust `JAVA_HOME` in `dev.sh`)
- Node.js 20+

**First-time setup**

```bash
./setup.sh
```

This generates the RSA key pair in `keys/`. You only need to run this once.

**Start everything**

```bash
./dev.sh
# or
make dev
```

| Service | URL |
|---|---|
| Angular UI (live reload) | http://localhost:4200 |
| Quarkus API (dev mode) | http://localhost:8080 |

Press `Ctrl+C` to stop all processes and the database container.

**Default login**

```
Email:    admin@ekonomy.com
Password: ekonomy123
```

---

## Running with Docker

This builds production images for both the API and the UI and runs everything in Docker.

```bash
# First-time only — generates RSA keys
./setup.sh

# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at **http://localhost:80**.

To change the default admin credentials, pass environment variables:

```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret docker compose up --build -d
```

Or create a `.env` file in the project root:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=secret
```

---

## Deploying to a Server

### 1. Provision a server

Any VPS with Docker and Docker Compose installed will work (Ubuntu 22.04+ recommended, 1 GB RAM minimum).

### 2. Copy the project to the server

```bash
# On the server, clone your repository (see Git section below) or copy via scp:
scp -r ekonomy/ user@your-server:~/ekonomy
```

### 3. Generate keys and configure credentials

```bash
ssh user@your-server
cd ~/ekonomy
./setup.sh   # generates keys/ — only needed once
```

Create a `.env` file with strong credentials:

```bash
cat > .env <<EOF
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=a-strong-password
EOF
```

### 4. Start the stack

```bash
docker compose up --build -d
```

The app will be running on port **80**. To serve it on a domain with HTTPS, put a reverse proxy (Caddy or nginx) in front of it:

**Caddy (recommended — automatic HTTPS)**

```
your-domain.com {
    reverse_proxy localhost:80
}
```

**nginx**

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Updating

```bash
git pull
docker compose up --build -d
```

Flyway runs automatically on startup and applies any new migrations.

---

## Backup & Restore

### SQL dump (full database)

```bash
# Dump to a file
./backup.sh
# → ekonomy-backup-2026-05-06.sql

# Custom filename
./backup.sh my-backup.sql

# Restore (CAUTION: erases all current data)
./restore.sh ekonomy-backup-2026-05-06.sql
```

### In-app JSON export/import (per-user data)

Go to **Settings → Export Data** to download a JSON file with all your accounts, transactions, categories and salary settings. Use **Import Data** to restore it on any Ekonomy instance.

This is the easiest way to move data between computers.

---

## Setting Up a Git Repository

### What to ignore

Create a `.gitignore` in the project root before committing:

```bash
cat > .gitignore <<'EOF'
# RSA keys — never commit these
keys/

# Java build artifacts
ekonomy-api/target/

# Node / Angular
ekonomy-ui/node_modules/
ekonomy-ui/dist/

# Environment files
.env

# IDE
.idea/
*.iml
.vscode/

# OS
.DS_Store
Thumbs.db
EOF
```

> **Important:** the `keys/` directory contains the private key used to sign JWTs. If it ever leaks, anyone could forge authentication tokens. Keep it out of version control and back it up separately.

### Initialize and push

```bash
cd /path/to/ekonomy

git init
git add .
git commit -m "Initial commit"

# Create a repository on GitHub/GitLab, then:
git remote add origin git@github.com:youruser/ekonomy.git
git branch -M main
git push -u origin main
```

### Cloning on another machine

```bash
git clone git@github.com:youruser/ekonomy.git
cd ekonomy

# Re-generate keys (or copy your existing keys/ directory from the other machine)
./setup.sh

docker compose up --build -d
```

If you want to keep using the same JWT keys across machines (so existing sessions stay valid), copy the `keys/` directory manually — do **not** commit it.
