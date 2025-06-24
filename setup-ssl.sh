#!/bin/bash
# This script sets up SSL certificates using Certbot

# Ensure script is run as sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

# Check if a domain name is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <domain-name>"
  echo "Example: $0 example.com"
  exit 1
fi

DOMAIN=$1

# Install Certbot if not already installed
apt-get update
apt-get install -y certbot

# Get SSL certificate
certbot certonly --standalone --non-interactive --agree-tos --email admin@${DOMAIN} -d ${DOMAIN}

# Set up auto-renewal
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -

# Create symbolic links for Nginx
mkdir -p /home/azureuser/manetho-deploy/nginx/ssl
ln -sf /etc/letsencrypt/live/${DOMAIN}/fullchain.pem /home/azureuser/manetho-deploy/nginx/ssl/fullchain.pem
ln -sf /etc/letsencrypt/live/${DOMAIN}/privkey.pem /home/azureuser/manetho-deploy/nginx/ssl/privkey.pem

# Set permissions
chown -R azureuser:azureuser /home/azureuser/manetho-deploy/nginx/ssl

echo "======================================"
echo "SSL setup complete for ${DOMAIN}!"
echo "Certificates will auto-renew via cron job"
echo "======================================"
