#!/usr/bin/env bash
# Restore the ekonomy PostgreSQL database from a SQL dump.
# Usage: ./restore.sh <backup-file.sql>
# WARNING: drops and recreates the public schema — all existing data will be lost.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <backup-file.sql>"
  exit 1
fi

INPUT="$1"

if [[ ! -f "$INPUT" ]]; then
  echo "File not found: $INPUT"
  exit 1
fi

read -rp "This will ERASE all data in the ekonomy database. Continue? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# Drop and recreate schema to cleanly remove all objects
docker compose exec --no-TTY postgres psql -U ekonomy -d ekonomy \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

docker compose exec --no-TTY postgres psql -U ekonomy -d ekonomy < "$INPUT"

echo "Restore complete from: $INPUT"
