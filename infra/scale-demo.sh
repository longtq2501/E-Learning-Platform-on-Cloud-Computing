#!/usr/bin/env bash
set -euo pipefail

compose_file="${BASH_SOURCE[0]%/*}/docker-compose.yml"
api_url="http://localhost/api/health"

docker compose -f "$compose_file" up -d

echo "Requests through all backend instances:"
for request_number in $(seq 1 12); do
  instance_id=$(curl --fail --silent --show-error --dump-header - "$api_url" -o /dev/null | awk 'BEGIN {IGNORECASE=1} /^X-Instance-Id:/ {print $2}' | tr -d '\r')
  printf '%s: %s (200)\n' "$request_number" "$instance_id"
done

echo "Stopping backend-2..."
docker compose -f "$compose_file" stop backend-2

echo "Requests after backend-2 stops:"
for request_number in $(seq 1 6); do
  instance_id=$(curl --fail --silent --show-error --dump-header - "$api_url" -o /dev/null | awk 'BEGIN {IGNORECASE=1} /^X-Instance-Id:/ {print $2}' | tr -d '\r')
  printf '%s: %s (200)\n' "$request_number" "$instance_id"
done