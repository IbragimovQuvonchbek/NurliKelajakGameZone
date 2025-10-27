#!/bin/bash

# Deployment script for Nurli Kelajak Game Zone
# This script handles static files and cache clearing

echo "🚀 Starting deployment process..."

# Collect static files with clear
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Clear Python cache
echo "🧹 Clearing Python cache..."
find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null
find . -type f -name "*.pyc" -delete

# Clear Django cache
echo "🗑️  Clearing Django cache..."
python manage.py shell -c "from django.core.cache import cache; cache.clear()"

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps on your server:"
echo "1. git pull origin main"
echo "2. Run this script: bash deploy_static.sh"
echo "3. Restart your server: sudo systemctl restart gunicorn (or your web server)"
echo "4. Clear browser cache or do a hard refresh (Ctrl+Shift+R)"
