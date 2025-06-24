#!/bin/bash
# This script prepares the Azure VM for Docker deployment

# Ensure script is run as sudo
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

# Update and install dependencies
apt-get update
apt-get upgrade -y
apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker azureuser
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create deployment directory
mkdir -p /home/azureuser/manetho-deploy
mkdir -p /home/azureuser/manetho-deploy/nginx
mkdir -p /home/azureuser/manetho-deploy/nginx/ssl

# Set correct permissions
chown -R azureuser:azureuser /home/azureuser/manetho-deploy

# Set up firewall rules
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Install Certbot for SSL certificates
apt-get install -y certbot

echo "======================================"
echo "VM preparation complete!"
echo "Next steps:"
echo "1. Configure SSL certificates using Certbot"
echo "2. Set up GitHub Actions secrets"
echo "3. Push to main branch to trigger deployment"
echo "======================================"
