#!/bin/bash

echo "🔄 Restarting the application..."

echo "📦 Collecting static files..."
docker-compose run --rm app python manage.py collectstatic --noinput

echo "🔄 Restarting containers..."
docker-compose restart

echo "✅ Application restarted successfully!"
