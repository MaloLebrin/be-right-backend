# Be-Right Backend

[![🔖 Create Release](https://github.com/MaloLebrin/be-right-backend/actions/workflows/release.yml/badge.svg)](https://github.com/MaloLebrin/be-right-backend/actions/workflows/release.yml)

> **Be-Right Backend** - API backend moderne pour la gestion d'événements photographiques et d'employés

## 📋 Vue d'Ensemble

Be-Right Backend est une application Node.js/TypeScript construite avec Express et TypeORM, conçue pour gérer des événements photographiques et la gestion d'employés. L'application permet aux entreprises de créer des événements, gérer leurs employés, collecter des signatures numériques et organiser des sessions de photos.

### 🚀 Fonctionnalités Principales

- **🎯 Gestion d'événements** : Création, planification et suivi d'événements photographiques
- **👥 Gestion d'employés** : Import en masse, organisation par groupes, collecte de signatures
- **📝 Système de réponses** : Collecte de réponses et signatures des employés
- **📁 Gestion de fichiers** : Upload et gestion d'images via Cloudinary
- **🔔 Système de notifications** : Notifications temps réel via Server-Sent Events
- **💳 Intégration de paiement** : Stripe pour les abonnements
- **🏆 Système de badges** : Gamification pour les utilisateurs
- **⚙️ Administration** : Interface d'administration complète

## 🛠️ Technologies

### Backend Core
- **Node.js** (v24.7.0) - Runtime JavaScript
- **TypeScript** (v5.9.2) - Langage de programmation
- **Express.js** (v4.21.2) - Framework web
- **TypeORM** (v0.3.26) - ORM pour base de données

### Base de Données
- **PostgreSQL** (v16) - Base de données principale
- **Redis** (v5.8.2) - Cache et sessions

### Services Externes
- **Cloudinary** (v2.7.0) - Gestion d'images
- **Stripe** (v15.12.0) - Paiements
- **Mailjet** (v6.0.9) - Envoi d'emails
- **Puppeteer** (v21.11.0) - Génération de PDF

## 🚀 Démarrage Rapide

### Prérequis
```bash
node --version    # v24.7.0+
pnpm --version    # v10.15.1+
docker --version  # v20.0+
```

### Installation
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
DATABASE_URL=postgresql://test:test@localhost:5432/be-right-db
NODE_ENV=development
PORT=5555
JWT_SECRET=your-secret-key
FRONT_URL=http://localhost:3000
```

## 📚 Documentation

- **[📖 Documentation Complète](DOCUMENTATION.md)** - Guide détaillé du projet
- **[🏗️ Architecture Technique](ARCHITECTURE.md)** - Architecture et patterns utilisés
- **[⚡ Guide de Démarrage](QUICKSTART.md)** - Installation et configuration rapide

## 🔧 Scripts Disponibles

```bash
# Développement
pnpm dev              # Serveur de développement avec hot reload
pnpm build            # Build TypeScript
pnpm start            # Serveur de production

# Tests
pnpm test             # Exécution des tests
pnpm test --coverage  # Tests avec coverage

# Code Quality
pnpm lint             # Vérification ESLint
pnpm lint:fix         # Correction automatique
pnpm type:check       # Vérification TypeScript

# Base de données
pnpm migration:run     # Exécuter les migrations
pnpm seed             # Peupler la base de données
```

## 🗄️ Structure du Projet

```
be-right-backend/
├── src/
│   ├── controllers/          # Contrôleurs API
│   ├── entity/               # Modèles de données TypeORM
│   ├── middlewares/          # Middlewares Express
│   ├── routes/               # Définition des routes
│   ├── services/             # Logique métier
│   ├── jobs/                 # Tâches asynchrones
│   ├── migrations/           # Migrations de base de données
│   ├── seed/                 # Données de test
│   ├── tests/                # Tests unitaires
│   ├── types/                # Types TypeScript
│   ├── utils/                # Utilitaires
│   └── views/                # Templates Handlebars
├── docker-compose.yml        # Configuration Docker
├── fly.toml                  # Configuration Fly.io
└── package.json              # Dépendances et scripts
```

## 🔌 API Endpoints Principaux

### Authentification
```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
```

### Événements
```
GET    /event
POST   /event
GET    /event/:id
PUT    /event/:id
```

### Employés
```
GET    /employee
POST   /employee
POST   /employee/many
POST   /employee-upload/csv
```

### Fichiers
```
GET    /file/:id
POST   /file/:id
POST   /file/profile
```

### Notifications
```
GET    /notifications
GET    /sse
```

## 🔐 Système d'Authentification

### Rôles Utilisateurs
```typescript
enum Role {
  ADMIN = 'ADMIN',
  SUPER_USER = 'SUPER_USER',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
  OWNER = 'OWNER'
}
```

### Sécurité
- **JWT** : Tokens d'authentification
- **Helmet** : Headers de sécurité
- **CORS** : Configuration cross-origin
- **Rate Limiting** : Protection contre les attaques
- **Validation** : Sanitisation des données

## 🗄️ Modèles de Données

### Entités Principales
- **UserEntity** : Utilisateurs du système
- **CompanyEntity** : Entreprises
- **EventEntity** : Événements photographiques
- **EmployeeEntity** : Employés des entreprises
- **FileEntity** : Gestion des fichiers
- **AnswerEntity** : Réponses des employés

### Relations Clés
- **Company** ↔ **Users** (One-to-Many)
- **Company** ↔ **Events** (One-to-Many)
- **Company** ↔ **Employees** (One-to-Many)
- **Event** ↔ **Files** (One-to-Many)
- **Employee** ↔ **Answers** (One-to-Many)

## 🔄 Système de Files d'Attente

### BullMQ Jobs
- **Traitement d'emails** : Envoi asynchrone
- **Génération de PDF** : Création de documents
- **Notifications** : Envoi en arrière-plan
- **Import d'employés** : Traitement en masse

### Tâches Cron
```typescript
// Envoi de mails avant événements
cron.schedule(CronJobInterval.EVERY_DAY_4_AM, async () => {
  await sendMailBeforeStartEvent(JOB_APP_SOURCE)
})

// Nettoyage mensuel
cron.schedule(CronJobInterval.EVERY_FIRST_DAY_MONTH_MIDNIGHT, async () => {
  await deleteUnusedUsersJob(JOB_APP_SOURCE)
  await deleteReadOldNotifications(JOB_APP_SOURCE)
  await deleteOldEventsJob(JOB_APP_SOURCE)
})
```

## 🧪 Tests

### Configuration Jest
```typescript
const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
}
```

### Types de Tests
- **Tests unitaires** : Fonctions individuelles
- **Tests d'intégration** : API endpoints
- **Tests de middlewares** : Validation, authentification
- **Tests de base de données** : Opérations CRUD

## 🚀 Déploiement

### Configuration Docker
```yaml
services:
  postgres:
    image: 'postgres:16'
    ports: ['5432:5432']
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: be-right-db

  redis:
    image: 'redis:alpine'
    ports: ['6379:6379']
```

### Déploiement Fly.io
- **Configuration** : `fly.toml`
- **Région** : Paris (cdg)
- **Ports** : 80 (HTTP), 443 (HTTPS)
- **Limites** : 25 connexions simultanées

## 📊 Monitoring et Observabilité

### Logging
- **tslog** : Logging structuré
- **Niveaux** : info, warn, error, debug
- **Format** : JSON avec métadonnées

### Performance
- **Redis Cache** : Mise en cache des requêtes
- **Connection Pooling** : Optimisation des connexions DB
- **Rate Limiting** : Protection contre la surcharge
- **Compression** : Gzip automatique

## 🔮 Évolutions Futures

### Améliorations Proposées
1. **Microservices** : Séparation des domaines
2. **GraphQL** : API plus flexible
3. **WebSockets** : Communication bidirectionnelle
4. **Monitoring** : Métriques avancées
5. **CI/CD** : Pipeline automatisé
6. **Documentation API** : Swagger/OpenAPI

### Scalabilité
- **Load Balancing** : Répartition de charge
- **Database Sharding** : Partitionnement des données
- **CDN** : Distribution de contenu
- **Caching** : Mise en cache distribuée

## 🤝 Contribution

### Prérequis de Développement
- Node.js v24.7.0+
- pnpm v10.15.1+
- PostgreSQL v16+
- Redis v6+

### Conventions de Code
- **TypeScript strict** : Configuration stricte activée
- **ESLint** : Règles de linting
- **Prettier** : Formatage automatique
- **Jest** : Tests unitaires
- **TypeORM** : Migrations et entités

### Structure des Commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: ajout de tests
chore: tâches de maintenance
```

## 📄 Licence

ISC License

## 👨‍💻 Auteur

**Malo Lebrin** - [malolebrin@gmail.com](mailto:malolebrin@gmail.com)

---

*Projet développé avec ❤️ en TypeScript*
