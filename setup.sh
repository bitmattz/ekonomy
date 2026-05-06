#!/bin/bash
set -e

echo "=== Ekonomy Setup ==="

# Generate RSA keys for JWT signing
KEY_DIR="./keys"
mkdir -p "$KEY_DIR"

if [ ! -f "$KEY_DIR/privateKey.pem" ]; then
  echo "Generating RSA key pair for JWT..."
  openssl genrsa -out "$KEY_DIR/rsa-temp.pem" 2048 2>/dev/null
  openssl pkcs8 -topk8 -nocrypt -in "$KEY_DIR/rsa-temp.pem" -out "$KEY_DIR/privateKey.pem"
  openssl rsa -in "$KEY_DIR/rsa-temp.pem" -pubout -out "$KEY_DIR/publicKey.pem" 2>/dev/null
  rm "$KEY_DIR/rsa-temp.pem"
  echo "Keys generated at $KEY_DIR/"
else
  echo "Keys already exist at $KEY_DIR/"
fi

echo ""
echo "Setup complete! Run 'docker compose up --build' to start."
echo ""
echo "Default credentials (change via ADMIN_EMAIL / ADMIN_PASSWORD env vars):"
echo "  Email:    admin@ekonomy.com"
echo "  Password: ekonomy123"
