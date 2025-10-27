#!/bin/bash

echo "🔄 Restarting the application..."

echo "🗑️  Clearing old static files volume..."
docker-compose down
docker volume rm nurlikelajakgamezone_static_data || true

echo "📦 Recreating containers..."
docker-compose up -d --build

echo "⏳ Waiting for app to be ready..."
sleep 5

echo "📦 Collecting static files..."
docker-compose run --rm app python manage.py collectstatic --noinput

echo "🔄 Restarting containers to pick up new files..."
docker-compose restart

echo "✅ Application restarted successfully!"
