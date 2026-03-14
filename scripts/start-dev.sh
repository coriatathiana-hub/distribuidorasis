#!/usr/bin/env bash
# Levanta el ambiente local: app Vite + Cloudflare Tunnel.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$PROJECT_ROOT/app"
PID_FILE="$PROJECT_ROOT/.dev-services.pids"
TUNNEL_CONFIG="${TUNNEL_CONFIG:-$PROJECT_ROOT/cloudflared/distribuidorasis-staging.yml}"
TUNNEL_NAME="${TUNNEL_NAME:-distribuidorasis-staging}"
APP_PORT="${APP_PORT:-8080}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Comando requerido no encontrado: $1"
    exit 1
  fi
}

if [[ -f "$PID_FILE" ]]; then
  echo "⚠️  Ya existe $PID_FILE. Posible ambiente ya iniciado."
  echo "   Ejecuta: ./scripts/stop-dev.sh"
  exit 1
fi

if [[ ! -d "$APP_DIR" ]]; then
  echo "❌ No se encontró el directorio app: $APP_DIR"
  exit 1
fi

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "❌ No se encontró package.json en $APP_DIR"
  exit 1
fi

if [[ ! -f "$TUNNEL_CONFIG" ]]; then
  echo "❌ No se encontró el config de cloudflared: $TUNNEL_CONFIG"
  exit 1
fi

require_cmd npm
require_cmd cloudflared

cleanup_on_error() {
  if [[ -f "$PID_FILE" ]]; then
    while read -r pid; do
      if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi
}

trap cleanup_on_error ERR

echo "🚀 Iniciando ambiente dev en $PROJECT_ROOT"
echo ""

(
  cd "$APP_DIR"
  npm run dev -- --host 0.0.0.0 --port "$APP_PORT"
) &
PID_DEV=$!
echo "$PID_DEV" >> "$PID_FILE"
echo "   (1/2) Vite dev     PID $PID_DEV  → http://localhost:$APP_PORT"

cloudflared tunnel --config "$TUNNEL_CONFIG" run "$TUNNEL_NAME" &
PID_TUNNEL=$!
echo "$PID_TUNNEL" >> "$PID_FILE"
echo "   (2/2) Tunnel       PID $PID_TUNNEL → https://staging.distribuidorasis.com.mx"

echo ""
echo "✅ Servicios iniciados en segundo plano."
echo "   Para detener: ./scripts/stop-dev.sh"
echo "   Ver estado:  ./scripts/status-dev.sh"
echo "   PIDs: $PID_FILE"
