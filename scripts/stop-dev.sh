#!/usr/bin/env bash
# Detiene los servicios iniciados por scripts/start-dev.sh.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.dev-services.pids"

if [[ ! -f "$PID_FILE" ]]; then
  echo "ℹ️  No hay archivo de PIDs ($PID_FILE). Nada que detener."
  exit 0
fi

echo "🛑 Deteniendo servicios..."
while read -r pid; do
  if [[ -z "${pid:-}" ]]; then
    continue
  fi

  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 0.2
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
    echo "   PID $pid detenido"
  else
    echo "   PID $pid no estaba activo"
  fi
done < "$PID_FILE"

rm -f "$PID_FILE"
echo "✅ Servicios detenidos y archivo de PIDs eliminado."
