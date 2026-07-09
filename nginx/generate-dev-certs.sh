#!/usr/bin/env bash
# Génère un certificat auto-signé pour le développement local en HTTPS.
# Usage : bash nginx/generate-dev-certs.sh
set -euo pipefail

CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"

openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/dev.key" \
  -out "$CERT_DIR/dev.crt" \
  -subj "/C=BF/ST=Ouagadougou/L=Ouagadougou/O=Vente Intelligente/CN=localhost"

echo "Certificats générés dans $CERT_DIR (dev.crt / dev.key)."
echo "Copiez nginx/conf.d/default.ssl.conf.example vers nginx/conf.d/default.conf pour activer le TLS."
