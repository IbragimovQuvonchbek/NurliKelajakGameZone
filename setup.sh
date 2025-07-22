#!/bin/bash

EMAIL="1.quvonchbek.ibragimov@example.com"
DOMAIN="nksgamezone.uz"
DOMAINS="-d $DOMAIN -d www.$DOMAIN"

echo "Starting nginx and app containers..."
docker-compose up -d nginx app

echo "Waiting for nginx to be ready..."
sleep 5

echo "Requesting Let's Encrypt certificate with Certbot..."
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot \
  --email $EMAIL --agree-tos --no-eff-email $DOMAINS

if [ $? -eq 0 ]; then
  echo "Certificate obtained successfully!"
  echo "Restarting nginx to apply new certificates..."
  docker-compose restart nginx
else
  echo "Failed to obtain certificate. Please check the logs."
  exit 1
fi

echo "Setup complete. Your site should be available at https://$DOMAIN"
