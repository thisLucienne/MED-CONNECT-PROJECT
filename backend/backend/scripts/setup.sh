#!/bin/bash

# Script de configuration initiale pour Med Connect Backend
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Configuration initiale de Med Connect Backend"
echo "================================================"

# Vérifier Node.js
echo "📋 Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js >= 18.0.0"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "✅ Node.js version: $NODE_VERSION"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Vérifier PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL n'est pas installé ou pas dans le PATH"
    echo "   Veuillez installer PostgreSQL >= 13.0"
    echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql"
fi

# Installation des dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Configuration de l'environnement..."
    cp .env.example .env
    echo "✅ Fichier .env créé à partir de .env.example"
    echo ""
    echo "🔧 IMPORTANT: Éditez le fichier .env avec vos configurations:"
    echo "   - Configuration de la base de données (DB_*)"
    echo "   - Clé JWT secrète (JWT_SECRET)"
    echo "   - Configuration Cloudinary (CLOUDINARY_*)"
    echo "   - Configuration email (EMAIL_*)"
    echo ""
    echo "📝 Exemple de configuration minimale pour le développement:"
    echo "   DB_HOST=localhost"
    echo "   DB_PORT=5432"
    echo "   DB_NAME=med_connect_dev"
    echo "   DB_USER=dev_user"
    echo "   DB_PASSWORD=dev_password"
    echo "   JWT_SECRET=your_jwt_secret_key_here"
else
    echo "✅ Fichier .env existe déjà"
fi

# Vérifier la configuration de la base de données
echo ""
echo "🗄️  Vérification de la base de données..."

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Tester la connexion PostgreSQL
if command -v psql &> /dev/null; then
    echo "🔍 Test de connexion à PostgreSQL..."
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        echo "✅ Connexion à la base de données réussie"
        
        # Appliquer les migrations
        echo "📊 Application des migrations..."
        npm run db:push
        echo "✅ Migrations appliquées"
    else
        echo "❌ Impossible de se connecter à la base de données"
        echo "   Vérifiez votre configuration dans le fichier .env"
        echo "   Assurez-vous que PostgreSQL est démarré et accessible"
        echo ""
        echo "💡 Pour créer la base de données et l'utilisateur:"
        echo "   sudo -u postgres psql"
        echo "   CREATE DATABASE $DB_NAME;"
        echo "   CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
        echo "   GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
        echo "   \\q"
    fi
else
    echo "⚠️  PostgreSQL non détecté, migration ignorée"
fi

# Tests
echo ""
echo "🧪 Exécution des tests..."
if npm test; then
    echo "✅ Tous les tests passent"
else
    echo "⚠️  Certains tests échouent (normal si la DB n'est pas configurée)"
fi

# Résumé
echo ""
echo "🎉 Configuration terminée !"
echo "=========================="
echo ""
echo "📋 Prochaines étapes:"
echo "1. Éditez le fichier .env avec vos configurations"
echo "2. Configurez votre base de données PostgreSQL"
echo "3. Configurez Cloudinary pour l'upload d'images (optionnel)"
echo "4. Configurez Gmail SMTP pour les emails (optionnel)"
echo ""
echo "🚀 Commandes utiles:"
echo "   npm run dev          # Démarrage en mode développement"
echo "   npm start           # Démarrage en mode production"
echo "   npm test            # Lancer les tests"
echo "   npm run db:studio   # Interface graphique de la DB"
echo ""
echo "📚 Documentation:"
echo "   README.md           # Documentation utilisateur"
echo "   DEVELOPER.md        # Guide du développeur"
echo ""
echo "🌐 Une fois démarré, l'API sera disponible sur:"
echo "   http://localhost:${PORT:-5000}"
echo ""
echo "🔐 Identifiants admin par défaut:"
echo "   Email: ${DEFAULT_ADMIN_EMAIL:-admin@medconnect.com}"
echo "   Mot de passe: ${DEFAULT_ADMIN_PASSWORD:-Admin123!@#}"
echo "   ⚠️  Changez ces identifiants en production !"