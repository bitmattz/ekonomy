#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Use Java 21 (required by the project)
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
API_PID=""
UI_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$API_PID" ] && kill "$API_PID" 2>/dev/null
  [ -n "$UI_PID" ]  && kill "$UI_PID"  2>/dev/null
  docker compose -f "$SCRIPT_DIR/docker-compose.yml" stop postgres
  exit 0
}
trap cleanup SIGINT SIGTERM

# Start postgres
echo "[db]  Starting PostgreSQL..."
docker compose -f "$SCRIPT_DIR/docker-compose.yml" up postgres -d

# Wait for postgres to be ready
echo "[db]  Waiting for PostgreSQL to be ready..."
until docker compose -f "$SCRIPT_DIR/docker-compose.yml" exec --no-TTY postgres \
    pg_isready -U ekonomy -q 2>/dev/null; do
  sleep 1
done
echo "[db]  PostgreSQL is ready."

# Start API
echo "[api] Starting Quarkus dev server..."
cd "$SCRIPT_DIR/ekonomy-api"
./mvnw quarkus:dev </dev/null &
API_PID=$!

# Start UI
echo "[ui]  Installing dependencies and starting Angular..."
cd "$SCRIPT_DIR/ekonomy-ui"
npm install
npm start </dev/null &
UI_PID=$!

echo ""
echo "  API → http://localhost:8080"
echo "  UI  → http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop everything."

wait "$API_PID" "$UI_PID"
