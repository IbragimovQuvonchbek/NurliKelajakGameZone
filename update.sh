#!/bin/bash

echo "🔄 Updating application..."

echo "📥 Pulling latest changes..."
git pull origin main

echo "🗑️  Removing old static files..."
docker-compose down
docker volume rm nurlikelajakgamezone_static_data 2>/dev/null || true

echo "🏗️  Rebuilding containers..."
docker-compose up -d --build

echo "⏳ Waiting for app to be ready..."
sleep 5

echo "📦 Collecting static files..."
docker-compose run --rm app python manage.py collectstatic --noinput

echo "🔄 Final restart..."
docker-compose restart

echo "✅ Update complete! Your site is live with new styles!"
echo "💡 If you still see old styles, clear your browser cache (Ctrl+Shift+R)"
