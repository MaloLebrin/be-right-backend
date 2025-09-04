# Guide de Démarrage Rapide - Be-Right Backend

## 🚀 Installation et Configuration

### Prérequis Système

```bash
# Vérifier les versions requises
node --version    # v24.7.0+
pnpm --version    # v10.15.1+
docker --version  # v20.0+
```

### Installation en 5 Minutes

```bash
# 1. Cloner le projet
git clone <repository-url>
cd be-right-backend

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp exemple.env .env
# Éditer .env avec vos valeurs

# 4. Démarrer les services
docker-compose up -d

# 5. Lancer l'application
pnpm run dev
```

### Configuration Minimale (.env)

```bash
# Base de données
DATABASE_URL=postgresql://test:test@localhost:5432/be-right-db
NODE_ENV=development
PORT=5555

# JWT
JWT_SECRET=your-secret-key

# Frontend
FRONT_URL=http://localhost:3000
```

## 🧪 Tests Rapides

### Tests Unitaires
```bash
# Lancer tous les tests
pnpm test

# Tests avec coverage
pnpm test --coverage

# Tests en mode watch
pnpm test --watch
```

### Tests d'Intégration
```bash
# Test de connexion à la base de données
pnpm test src/tests/testConnection.test.ts

# Tests des middlewares
pnpm test src/tests/middlewares/
```

## 🔧 Développement

### Scripts Utiles

```bash
# Développement
pnpm dev              # Serveur de développement avec hot reload
pnpm build            # Build TypeScript
pnpm start            # Serveur de production

# Code Quality
pnpm lint             # Vérification ESLint
pnpm lint:fix          # Correction automatique
pnpm type:check       # Vérification TypeScript

# Base de données
pnpm migration:run     # Exécuter les migrations
pnpm migration:revert  # Annuler la dernière migration
pnpm seed             # Peupler la base de données
```

### Structure des Commandes

```bash
# Créer une nouvelle entité
pnpm make:entity User

# Créer un nouveau contrôleur
pnpm make:controller UserController

# Créer un nouveau service
pnpm make:service UserService

# Créer une nouvelle migration
pnpm make:migration CreateUsersTable
```

## 📊 Monitoring Local

### Logs en Temps Réel
```bash
# Suivre les logs de l'application
tail -f logs/app.log

# Logs Docker
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Métriques de Performance
```bash
# Vérifier l'utilisation mémoire
node --inspect src/index.ts

# Profiling avec clinic
npx clinic doctor -- node src/index.js
```

## 🔍 Debugging

### Debug en Mode Développement

```typescript
// Ajouter des logs de debug
import { logger } from './middlewares/loggerService'

logger.debug('Variable value:', { variable: value })
logger.info('Operation completed')
logger.warn('Warning message')
logger.error('Error occurred', error)
```

### Debug avec VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

## 🗄️ Base de Données

### Connexion et Exploration

```bash
# Connexion PostgreSQL
psql -h localhost -U test -d be-right-db

# Lister les tables
\dt

# Explorer une table
\d "UserEntity"

# Requête de test
SELECT * FROM "UserEntity" LIMIT 5;
```

### Migrations

```bash
# Créer une migration
pnpm typeorm migration:create src/migrations/CreateUsers

# Exécuter les migrations
pnpm typeorm migration:run

# Annuler la dernière migration
pnpm typeorm migration:revert
```

### Seed de Données

```bash
# Exécuter le seed complet
pnpm run seed

# Seed spécifique
node src/seed/admin/adminSeed.js
```

## 🔐 Authentification

### Créer un Utilisateur Admin

```bash
# Via script de seed
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=admin123 \
ADMIN_FIRTNAME=Admin \
ADMIN_LASTNAME=User \
pnpm run seed
```

### Test d'Authentification

```bash
# Login
curl -X POST http://localhost:5555/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Utiliser le token retourné
curl -H "Authorization: Bearer <token>" \
  http://localhost:5555/user/profile
```

## 📁 Gestion des Fichiers

### Test d'Upload

```bash
# Upload d'image de profil
curl -X POST http://localhost:5555/file/profile \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg"
```

### Configuration Cloudinary

```bash
# Variables d'environnement Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔔 Notifications

### Test des SSE

```bash
# Connexion SSE
curl -N http://localhost:5555/sse \
  -H "Authorization: Bearer <token>"
```

### Envoi de Notification

```bash
# Créer une notification
curl -X POST http://localhost:5555/notifications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test notification","type":"INFO"}'
```

## 💳 Stripe

### Configuration Stripe

```bash
# Variables d'environnement Stripe
STRIPE_PRIVATE_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test de Paiement

```bash
# Créer un client Stripe
curl -X POST http://localhost:5555/stripe/customer \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🚀 Déploiement

### Build de Production

```bash
# Build optimisé
pnpm run build

# Vérifier le build
node build/src/index.js
```

### Déploiement Fly.io

```bash
# Configuration Fly.io
fly auth login
fly apps create be-right-backend

# Déploiement
fly deploy

# Vérifier le statut
fly status
```

### Variables d'Environnement Production

```bash
# Définir les variables
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set JWT_SECRET="your-secret"
fly secrets set NODE_ENV="production"
```

## 🔧 Troubleshooting

### Problèmes Courants

#### Erreur de Connexion Base de Données
```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Redémarrer les services
docker-compose restart postgres
```

#### Erreur Redis
```bash
# Vérifier Redis
docker-compose logs redis

# Redémarrer Redis
docker-compose restart redis
```

#### Erreur de Port
```bash
# Vérifier les ports utilisés
lsof -i :5555
lsof -i :5432
lsof -i :6379

# Tuer les processus
kill -9 <PID>
```

#### Erreur de Permissions
```bash
# Corriger les permissions
chmod +x scripts/*.sh
chmod 755 src/uploads/
```

### Logs d'Erreur

```bash
# Logs d'application
tail -f logs/error.log

# Logs TypeORM
tail -f logs/typeorm.log

# Logs Redis
docker-compose logs redis | grep ERROR
```

## 📚 Ressources Utiles

### Documentation Externe
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Guide](https://expressjs.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Stripe API Reference](https://stripe.com/docs/api)

### Outils de Développement
- [Postman](https://www.postman.com/) - Test d'API
- [pgAdmin](https://www.pgadmin.org/) - Interface PostgreSQL
- [Redis Commander](https://github.com/joeferner/redis-commander) - Interface Redis

### Extensions VS Code Recommandées
- TypeScript Importer
- ESLint
- Prettier
- Docker
- PostgreSQL

---

*Guide de démarrage généré le $(date)*
*Version : 1.0.0*
