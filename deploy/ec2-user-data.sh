#!/bin/bash
# EC2 user-data bootstrap for Walk In (Amazon Linux 2023).
# Installs Docker + compose plugin, prepares the app directory.
set -euxo pipefail

dnf update -y
dnf install -y docker awscli

systemctl enable --now docker
usermod -aG docker ubuntu

# Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# App directory — docker-compose.ec2.yml and .env land here (via CI/scp)
mkdir -p /opt/walk-in
chown ubuntu:ubuntu /opt/walk-in

echo "Walk In host ready. Deploy with: docker compose -f /opt/walk-in/docker-compose.ec2.yml up -d"
