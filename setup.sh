#!/bin/bash

EMAIL="1.quvonchbek.ibragimov@gmail.com"
DOMAIN="nksgamezone.uz"

echo "Starting nginx and app containers..."
docker-compose up -d nginx app

echo "Waiting for nginx to be ready..."
sleep 5

echo "Requesting Let's Encrypt certificate with Certbot..."
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  -d "$DOMAIN" -d "www.$DOMAIN"

if [ $? -eq 0 ]; then
  echo "Certificate obtained successfully!"
  docker-compose restart nginx
else
  echo "Failed to obtain certificate. Please check the logs."
  exit 1
fi
