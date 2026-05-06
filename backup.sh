#!/usr/bin/env bash
# Dump the ekonomy PostgreSQL database to a SQL file.
# Usage: ./backup.sh [output-file]
# Default output: ekonomy-backup-YYYY-MM-DD.sql

set -euo pipefail

OUTPUT="${1:-ekonomy-backup-$(date +%F).sql}"

docker compose exec --no-TTY postgres pg_dump \
  -U ekonomy \
  -d ekonomy \
  --no-owner \
  --no-acl \
  > "$OUTPUT"

echo "Backup written to: $OUTPUT"
