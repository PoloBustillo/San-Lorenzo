#!/bin/bash
set -e

# Script de deploy para VPS
# Asume que el proyecto está en /var/www/san-lorenzo-inventario
# y que existe un archivo .env.production con las variables correctas.

APP_DIR="/var/www/san-lorenzo-inventario"
LOG_DIR="/var/log/pm2"

echo "==> Entrando al directorio de la app"
cd "$APP_DIR"

echo "==> Instalando dependencias"
npm install --ignore-scripts

echo "==> Generando Prisma Client"
npx prisma generate

echo "==> Aplicando migraciones"
npx prisma migrate deploy

echo "==> Build de producción"
npm run build

echo "==> Asegurando directorio de logs de PM2"
mkdir -p "$LOG_DIR"

echo "==> Reiniciando app con PM2"
pm2 reload ecosystem.config.js --env production || npm2 start ecosystem.config.js --env production

echo "==> Deploy completado"
