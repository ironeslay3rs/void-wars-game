#!/usr/bin/env bash
# Postgres volume backup for docker-compose stack (Phase 10).
# Usage:
#   POSTGRES_PASSWORD=... ./scripts/ops/backup-postgres.sh
# Or from host with compose service name:
#   docker compose exec -T postgres pg_dump -U postgres void_wars | gzip > "void_wars_$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
set -euo pipefail
OUT="${1:-./void_wars_backup_$(date -u +%Y%m%dT%H%M%SZ).sql.gz}"
echo "Writing compressed dump to $OUT"
docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-void_wars}" | gzip > "$OUT"
echo "Done."
