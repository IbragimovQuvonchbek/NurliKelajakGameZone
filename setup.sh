#!/bin/bash

EMAIL="1.quvonchbek.ibragimov@gmail.com"
DOMAIN="nksgamezone.uz"
DOMAINS="-d $DOMAIN -d www.$DOMAIN"

echo "🟡 Step 1: Starting app and nginx (HTTP config)..."
cp nginx.http.conf nginx.conf
docker-compose up -d --build

echo "⏳ Waiting 10 seconds for Nginx to fully start..."
sleep 10

echo "🟡 Step 2: Requesting Let's Encrypt certificate with Certbot..."
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
  --email $EMAIL --agree-tos --no-eff-email $DOMAINS

if [ $? -eq 0 ]; then
  echo "✅ Certificate obtained successfully!"

  echo "🟢 Step 3: Switching to SSL Nginx config..."
  cp nginx.ssl.conf nginx.conf

  echo "🔁 Restarting Nginx..."
  docker-compose restart nginx

  echo "🎉 Done! Your site is live at https://$DOMAIN"
else
  echo "❌ Failed to obtain certificate. Check your DNS and port 80 access."
  exit 1
fi
