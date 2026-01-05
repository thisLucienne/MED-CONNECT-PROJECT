#!/bin/sh

# Script d'initialisation de la base de données pour Docker
# Usage: ./scripts/init-db.sh

set -e

echo "🗄️  Initialisation de la base de données Med Connect"
echo "=================================================="
echo ""

# Charger les variables d'environnement depuis .env si disponible
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Variables par défaut
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-medconnect}
DB_PASSWORD=${DB_PASSWORD:-medconnect123}
DB_NAME=${DB_NAME:-medconnect}

echo "📊 Application des migrations de base de données..."
echo ""

# Attendre que la base de données soit prête
echo "⏳ Attente de la disponibilité de PostgreSQL..."
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Utiliser Node.js pour tester la connexion (plus portable)
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if node -e "
        const postgres = require('postgres');
        const sql = postgres(\`postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME\`, {
            max: 1,
            connect_timeout: 2
        });
        sql\`SELECT 1\`.then(() => {
            sql.end();
            process.exit(0);
        }).catch(() => {
            sql.end();
            process.exit(1);
        });
    " 2>/dev/null; then
        echo "✅ PostgreSQL est prêt"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "   Tentative $RETRY_COUNT/$MAX_RETRIES - PostgreSQL n'est pas encore prêt, attente..."
            sleep 2
        else
            echo "❌ Impossible de se connecter à PostgreSQL après $MAX_RETRIES tentatives"
            echo "   Vérifiez que le conteneur PostgreSQL est démarré et accessible"
            exit 1
        fi
    fi
done

echo ""
echo "🔄 Application des migrations avec Drizzle..."

# Exécuter les migrations
if npm run db:push; then
    echo ""
    echo "✅ Migrations appliquées avec succès"
else
    echo ""
    echo "❌ Erreur lors de l'application des migrations"
    exit 1
fi

echo ""
echo "✅ Initialisation de la base de données terminée !"
echo ""
echo "📋 Informations de connexion:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

