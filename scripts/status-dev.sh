#!/usr/bin/env bash
# Muestra estado de servicios iniciados por scripts/start-dev.sh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.dev-services.pids"
APP_PORT="${APP_PORT:-8080}"
STAGING_URL="${STAGING_URL:-https://staging.distribuidorasis.com.mx}"

if [[ ! -f "$PID_FILE" ]]; then
  echo "ℹ️  No existe $PID_FILE. El ambiente no parece iniciado."
  echo "   Inicia con: ./scripts/start-dev.sh"
  exit 0
fi

pids=()
while IFS= read -r pid || [[ -n "${pid:-}" ]]; do
  if [[ -n "${pid:-}" ]]; then
    pids+=("$pid")
  fi
done < "$PID_FILE"

if [[ "${#pids[@]}" -eq 0 ]]; then
  echo "⚠️  $PID_FILE está vacío."
  exit 1
fi

services=("Vite dev" "Cloudflare tunnel")

echo "🔎 Estado de servicios"
for i in "${!pids[@]}"; do
  pid="${pids[$i]}"
  name="${services[$i]:-Servicio $((i + 1))}"

  if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
    echo "   ✅ $name (PID $pid) activo"
  else
    echo "   ❌ $name (PID ${pid:-N/A}) inactivo"
  fi
done

echo ""
if curl -fsS "http://localhost:$APP_PORT" >/dev/null 2>&1; then
  echo "   ✅ Local responde en http://localhost:$APP_PORT"
else
  echo "   ❌ Local no responde en http://localhost:$APP_PORT"
fi

if curl -fsS "$STAGING_URL" >/dev/null 2>&1; then
  echo "   ✅ Staging responde en $STAGING_URL"
else
  echo "   ❌ Staging no responde en $STAGING_URL"
fi
