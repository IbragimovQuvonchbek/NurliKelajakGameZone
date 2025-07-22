#!/bin/bash

EMAIL="1.quvonchbek.ibragimov@gmail.com"
DOMAIN="nksgamezone.uz"
DOMAINS="-d $DOMAIN -d www.$DOMAIN"

echo "🟢 Starting app and nginx..."
docker-compose up -d app nginx

echo "⏳ Waiting for Nginx to be ready..."
sleep 5

echo "🔐 Requesting SSL certificate from Let's Encrypt..."
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
  --email $EMAIL --agree-tos --no-eff-email $DOMAINS

if [ $? -eq 0 ]; then
  echo "✅ Certificate obtained successfully!"
  echo "🔄 Restarting nginx..."
  docker-compose restart nginx
else
  echo "❌ Failed to obtain certificate. Check logs."
  exit 1
fi

echo "✅ DONE: https://$DOMAIN is now secured with SSL!"
