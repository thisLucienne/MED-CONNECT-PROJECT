# Guide de Déploiement Docker - Med Connect Backend

Ce guide explique comment déployer l'application Med Connect Backend sur un serveur Linux en utilisant Docker.

## Prérequis

- Docker installé (version 20.10 ou supérieure)
- Docker Compose installé (version 2.0 ou supérieure)
- Un serveur Linux avec au moins 2GB de RAM
- Ports 5000 (backend) et 5432 (PostgreSQL) disponibles

## Installation de Docker sur Linux

Si Docker n'est pas installé, exécutez :

```bash
# Mettre à jour le système
sudo apt-get update

# Installer les dépendances
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Ajouter la clé GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le dépôt Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Vérifier l'installation
docker --version
docker compose version
```

## Configuration

### 1. Préparer les variables d'environnement

Créez un fichier `.env` à la racine du projet backend avec les variables suivantes :

```env
# Base de données
DB_USER=medconnect
DB_PASSWORD=votre_mot_de_passe_securise
DB_NAME=medconnect
DB_PORT=5432

# Application
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=24h

# Frontend (CORS)
# Pour une seule URL: FRONTEND_URL=https://votre-domaine.com
# Pour plusieurs URLs (dev, staging, prod): FRONTEND_URL=https://app.votre-domaine.com,https://staging.votre-domaine.com,http://localhost:3000
FRONTEND_URL=https://votre-domaine.com

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app
```

**⚠️ Important :** Ne commitez jamais le fichier `.env` dans Git. Il doit rester local et sécurisé.

### 2. Transférer les fichiers sur le serveur

Vous pouvez utiliser `scp`, `rsync`, ou `git clone` :

```bash
# Option 1: Via SCP
scp -r backend/ user@votre-serveur:/opt/med-connect/

# Option 2: Via Git (recommandé)
ssh user@votre-serveur
cd /opt
git clone votre-repo.git med-connect
cd med-connect/backend
```

## Déploiement

### 1. Construire et démarrer les conteneurs

```bash
cd /opt/med-connect/backend

# Construire les images et démarrer les services
docker compose up -d --build
```

### 2. Vérifier le statut

```bash
# Voir les conteneurs en cours d'exécution
docker compose ps

# Voir les logs
docker compose logs -f backend

# Voir les logs de la base de données
docker compose logs -f postgres
```

### 3. Exécuter les migrations de base de données

Le projet utilise **Drizzle ORM** pour les migrations. Voici comment les exécuter :

#### Option 1 : Exécution automatique (recommandé)

Un script d'initialisation est disponible pour automatiser les migrations :

```bash
# Donner les permissions d'exécution
chmod +x scripts/init-db.sh

# Exécuter depuis le conteneur backend
docker compose exec backend sh scripts/init-db.sh
```

#### Option 2 : Exécution manuelle

```bash
# Entrer dans le conteneur backend
docker compose exec backend sh

# Exécuter les migrations Drizzle
npm run db:push
```

#### Option 3 : Exécution directe (sans entrer dans le conteneur)

```bash
# Exécuter la commande directement
docker compose exec backend npm run db:push
```

**Note :** Les migrations sont appliquées automatiquement au premier démarrage si vous utilisez le script d'initialisation.

## Commandes Utiles

### Gestion des conteneurs

```bash
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Redémarrer un service spécifique
docker compose restart backend

# Voir les logs en temps réel
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
```

### Maintenance

#### Base de données

```bash
# Accéder au shell du conteneur backend
docker compose exec backend sh

# Accéder à la base de données PostgreSQL
docker compose exec postgres psql -U medconnect -d medconnect

# Ou avec les variables d'environnement
docker compose exec postgres psql -U ${DB_USER:-medconnect} -d ${DB_NAME:-medconnect}

# Lister les tables
docker compose exec postgres psql -U medconnect -d medconnect -c "\dt"

# Voir la structure d'une table
docker compose exec postgres psql -U medconnect -d medconnect -c "\d nom_de_la_table"
```

#### Migrations

```bash
# Appliquer les migrations
docker compose exec backend npm run db:push

# Générer de nouvelles migrations (après modification du schema)
docker compose exec backend npm run db:generate

# Ouvrir Drizzle Studio (interface graphique pour la DB)
docker compose exec backend npm run db:studio
# Puis accéder à http://localhost:4983 (si le port est exposé)
```

#### Sauvegardes

```bash
# Sauvegarder la base de données
docker compose exec postgres pg_dump -U medconnect medconnect > backup_$(date +%Y%m%d_%H%M%S).sql

# Sauvegarder avec compression
docker compose exec postgres pg_dump -U medconnect medconnect | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Restaurer la base de données
docker compose exec -T postgres psql -U medconnect medconnect < backup.sql

# Restaurer depuis une sauvegarde compressée
gunzip < backup.sql.gz | docker compose exec -T postgres psql -U medconnect medconnect
```

#### Volumes Docker

Les données PostgreSQL sont stockées dans un volume Docker nommé `postgres_data`. Pour sauvegarder le volume complet :

```bash
# Sauvegarder le volume
docker run --rm -v med-connect_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_backup.tar.gz /data

# Restaurer le volume
docker run --rm -v med-connect_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data_backup.tar.gz -C /
```

### Mise à jour de l'application

```bash
# Arrêter les services
docker compose down

# Récupérer les dernières modifications
git pull

# Reconstruire et redémarrer
docker compose up -d --build
```

## Configuration CORS (Cross-Origin Resource Sharing)

Le backend est configuré pour gérer les requêtes cross-origin depuis le frontend web et les applications mobiles (Expo/React Native).

### Configuration de base

Dans votre fichier `.env`, configurez `FRONTEND_URL` avec l'URL de votre frontend :

```env
# Pour une seule URL
FRONTEND_URL=https://app.votre-domaine.com

# Pour plusieurs URLs (séparées par des virgules)
FRONTEND_URL=https://app.votre-domaine.com,https://staging.votre-domaine.com,http://localhost:3000

# Autoriser les applications mobiles (Expo/React Native)
ALLOW_MOBILE_APPS=true
```

### Comportement par défaut

- **En développement** (`NODE_ENV=development`) : 
  - Autorise automatiquement `http://localhost:3000`, `http://localhost:3001`, et `http://127.0.0.1:3000`
  - Autorise les requêtes sans origine (apps mobiles, Postman, curl)
- **En production** : 
  - Seules les URLs spécifiées dans `FRONTEND_URL` sont autorisées
  - Les apps mobiles sont autorisées si `ALLOW_MOBILE_APPS=true`

### Vérifier la configuration CORS

```bash
# Tester depuis le frontend
curl -H "Origin: https://app.votre-domaine.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/auth/login

# Vous devriez voir les en-têtes CORS dans la réponse
```

### Configuration pour applications mobiles (Expo/React Native)

Les applications mobiles n'envoient pas d'en-tête `Origin` comme les navigateurs web. Le backend est configuré pour les accepter :

```env
# Dans votre .env
ALLOW_MOBILE_APPS=true
```

**Important pour Expo :**

1. **URL de l'API** : Utilisez l'URL publique de votre backend (pas `localhost`)
   ```javascript
   // Dans votre app Expo
   const API_URL = 'https://api.votre-domaine.com';
   // ou en développement avec tunnel Expo
   const API_URL = 'https://votre-tunnel.exp.direct:5000';
   ```

2. **Authentification** : Les tokens JWT fonctionnent normalement avec les apps mobiles
   ```javascript
   // Exemple de requête avec token
   fetch(`${API_URL}/api/auth/profile`, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   });
   ```

3. **Développement local avec Expo** :
   - Utilisez `expo start --tunnel` pour créer un tunnel public
   - Ou utilisez l'IP locale de votre machine : `http://192.168.1.100:5000`
   - Assurez-vous que `ALLOW_MOBILE_APPS=true` est défini

### Dépannage CORS

Si vous rencontrez des erreurs CORS :

1. **Vérifiez que `FRONTEND_URL` est correctement configuré** dans votre `.env`
2. **Vérifiez que l'URL du frontend correspond exactement** (avec ou sans trailing slash, http vs https)
3. **Vérifiez les logs du backend** pour voir les origines rejetées
4. **En développement**, assurez-vous que `NODE_ENV=development` est défini
5. **Pour les apps mobiles**, vérifiez que `ALLOW_MOBILE_APPS=true` est défini en production

## Configuration du Reverse Proxy (Nginx)

Pour exposer l'application sur le port 80/443, configurez Nginx :

```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Important pour CORS
        proxy_set_header Origin $http_origin;
    }
}
```

**Note importante** : Si vous utilisez Nginx comme reverse proxy, assurez-vous que `FRONTEND_URL` dans le backend pointe vers l'URL finale accessible par les clients (pas `localhost:5000`).

## Sécurité

### 1. Firewall

Configurez un firewall pour limiter l'accès :

```bash
# Autoriser uniquement les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Variables d'environnement sécurisées

- Utilisez des mots de passe forts
- Changez les secrets par défaut
- Ne partagez jamais le fichier `.env`

### 3. Mises à jour régulières

```bash
# Mettre à jour les images Docker
docker compose pull
docker compose up -d
```

## Monitoring

### Vérifier la santé des services

```bash
# Vérifier les healthchecks
docker compose ps

# Vérifier l'utilisation des ressources
docker stats
```

## Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker compose logs backend

# Vérifier la connexion à la base de données
docker compose exec backend node -e "require('./src/config/database').testConnection()"
```

### Problèmes de permissions

```bash
# Vérifier les permissions des volumes
ls -la assets/

# Corriger les permissions si nécessaire
sudo chown -R 1001:1001 assets/
```

### Nettoyer les ressources Docker

```bash
# Supprimer les conteneurs arrêtés
docker compose down

# Supprimer les images non utilisées
docker image prune -a

# Supprimer les volumes non utilisés (⚠️ attention aux données)
docker volume prune
```

## Support

Pour toute question ou problème, consultez la documentation Docker officielle ou contactez l'équipe de développement.

