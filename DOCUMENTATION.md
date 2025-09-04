# Documentation Complète - Be-Right Backend

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Structure du Projet](#structure-du-projet)
5. [Modèles de Données](#modèles-de-données)
6. [API Endpoints](#api-endpoints)
7. [Services et Logique Métier](#services-et-logique-métier)
8. [Système d'Authentification](#système-dauthentification)
9. [Gestion des Fichiers](#gestion-des-fichiers)
10. [Système de Notifications](#système-de-notifications)
11. [Intégration Stripe](#intégration-stripe)
12. [Tâches Planifiées](#tâches-planifiées)
13. [Tests](#tests)
14. [Déploiement](#déploiement)
15. [Configuration et Variables d'Environnement](#configuration-et-variables-denvironnement)
16. [Guide de Développement](#guide-de-développement)

## 🎯 Vue d'ensemble

**Be-Right Backend** est une application Node.js/TypeScript construite avec Express et TypeORM, conçue pour gérer des événements photographiques et la gestion d'employés. L'application permet aux entreprises de créer des événements, gérer leurs employés, collecter des signatures numériques et organiser des sessions de photos.

### Fonctionnalités Principales
- **Gestion d'événements** : Création, planification et suivi d'événements photographiques
- **Gestion d'employés** : Import en masse, organisation par groupes, collecte de signatures
- **Système de réponses** : Collecte de réponses et signatures des employés
- **Gestion de fichiers** : Upload et gestion d'images via Cloudinary
- **Système de notifications** : Notifications temps réel via Server-Sent Events
- **Intégration de paiement** : Stripe pour les abonnements
- **Système de badges** : Gamification pour les utilisateurs
- **Administration** : Interface d'administration complète

## 🏗️ Architecture du Projet

### Architecture Générale
L'application suit une architecture **MVC (Model-View-Controller)** avec des couches bien séparées :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │     Services    │    │     Entities    │
│   (Routes)      │◄──►│   (Business     │◄──►│   (Database)    │
│                 │    │    Logic)       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middlewares   │    │     Utils       │    │   Migrations   │
│  (Validation,   │    │   (Helpers)     │    │                 │
│   Auth, etc.)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Patterns Utilisés
- **Repository Pattern** : Abstraction de la couche de données
- **Service Layer Pattern** : Logique métier centralisée
- **Middleware Pattern** : Validation, authentification, gestion d'erreurs
- **Queue Pattern** : Traitement asynchrone avec BullMQ
- **Observer Pattern** : Notifications temps réel

## 🛠️ Technologies Utilisées

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

### Outils de Développement
- **Jest** (v29.7.0) - Tests unitaires
- **ESLint** (v8.57.1) - Linting
- **Docker** - Containerisation
- **Fly.io** - Déploiement

## 📁 Structure du Projet

```
be-right-backend/
├── src/
│   ├── controllers/          # Contrôleurs API
│   │   ├── Admin/            # Contrôleurs d'administration
│   │   ├── employees/        # Gestion des employés
│   │   ├── stripe/           # Intégration Stripe
│   │   └── user/             # Gestion utilisateurs
│   ├── entity/               # Modèles de données TypeORM
│   │   ├── bases/            # Entités de base
│   │   ├── employees/        # Entités employés
│   │   ├── event/            # Entités événements
│   │   └── notifications/    # Entités notifications
│   ├── middlewares/          # Middlewares Express
│   │   └── validation/      # Validation des données
│   ├── routes/               # Définition des routes
│   │   ├── Admin/            # Routes d'administration
│   │   ├── Notifications/    # Routes notifications
│   │   └── Stripe/           # Routes Stripe
│   ├── services/             # Logique métier
│   │   ├── employee/         # Services employés
│   │   ├── event/            # Services événements
│   │   ├── notifications/    # Services notifications
│   │   ├── stripe/           # Services Stripe
│   │   └── user/             # Services utilisateurs
│   ├── jobs/                 # Tâches asynchrones
│   │   ├── crons/            # Tâches planifiées
│   │   └── queue/            # Files d'attente BullMQ
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

## 🗄️ Modèles de Données

### Entités Principales

#### UserEntity
```typescript
@Entity()
export class UserEntity extends BaseAuthEntity {
  stripeCustomerId: string
  notificationToken: string
  signature: string
  roles: Role
  profilePicture: FileEntity
  shootingEvent: EventEntity[]
  notificationSubscriptions: NotificationSubcriptionEntity[]
  company: CompanyEntity
  badges: BadgeEntity[]
}
```

#### CompanyEntity
```typescript
@Entity()
export class CompanyEntity extends BaseEntity {
  name: string
  siret: string
  color: string
  subscriptionLabel: SubscriptionEnum
  users: UserEntity[]
  address: AddressEntity
  events: EventEntity[]
  employees: EmployeeEntity[]
  groups: GroupEntity[]
  files: FileEntity[]
  subscription: SubscriptionEntity
}
```

#### EventEntity
```typescript
@Entity()
export default class EventEntity extends BaseEntity {
  name: string
  start: Date
  end: Date
  description: string
  status: EventStatusEnum
  signatureCount: number
  totalSignatureNeeded: number
  partner: UserEntity
  company: CompanyEntity
  files: FileEntity[]
  address: AddressEntity
}
```

#### EmployeeEntity
```typescript
@Entity()
export class EmployeeEntity extends BasePersonEntity {
  phone: string
  slug: string
  signature: string
  address: AddressEntity
  company: CompanyEntity
  answers: AnswerEntity[]
  files: FileEntity[]
  groups: GroupEntity[]
}
```

### Relations Principales
- **Company** ↔ **Users** (One-to-Many)
- **Company** ↔ **Events** (One-to-Many)
- **Company** ↔ **Employees** (One-to-Many)
- **Event** ↔ **Files** (One-to-Many)
- **Employee** ↔ **Answers** (One-to-Many)
- **User** ↔ **Badges** (Many-to-Many)

## 🔌 API Endpoints

### Authentification
```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh
POST   /auth/logout
```

### Utilisateurs
```
GET    /user/profile
PUT    /user/profile
GET    /user/companies
POST   /user/company
```

### Entreprises
```
GET    /company
POST   /company
PUT    /company/:id
DELETE /company/:id
```

### Événements
```
GET    /event
POST   /event
GET    /event/:id
PUT    /event/:id
DELETE /event/:id
GET    /event/calendar
```

### Employés
```
GET    /employee
POST   /employee
GET    /employee/:id
PUT    /employee/:id
DELETE /employee/:id
POST   /employee/many
POST   /employee-upload/csv
```

### Réponses
```
GET    /answer
POST   /answer
GET    /answer/:id
PUT    /answer/:id
```

### Fichiers
```
GET    /file/:id
POST   /file/:id
POST   /file/profile
POST   /file/logo
DELETE /file/:id
```

### Notifications
```
GET    /notifications
POST   /notifications
PUT    /notifications/:id
GET    /sse
```

### Stripe
```
POST   /stripe/customer
POST   /stripe/payment
```

### Administration
```
GET    /admin/stats
GET    /admin/user
GET    /admin/company
GET    /admin/event
GET    /admin/employee
GET    /admin/answer
```

## 🔧 Services et Logique Métier

### Services Principaux

#### EventService
- Création et gestion d'événements
- Calcul des statistiques
- Gestion des statuts d'événements
- Intégration avec les employés

#### EmployeeService
- Import en masse d'employés
- Gestion des groupes
- Collecte de signatures
- Génération de slugs uniques

#### FileService
- Upload vers Cloudinary
- Gestion des types de fichiers
- Optimisation d'images
- Génération de PDF

#### NotificationService
- Envoi de notifications temps réel
- Gestion des abonnements SSE
- Notifications par email
- Badges et gamification

#### StripeService
- Création de clients
- Gestion des abonnements
- Webhooks de paiement
- Intégration avec les entreprises

### Patterns de Services
- **Singleton Pattern** pour les connexions
- **Factory Pattern** pour la création d'objets
- **Strategy Pattern** pour les différents types de notifications
- **Observer Pattern** pour les événements

## 🔐 Système d'Authentification

### Rôles Utilisateurs
```typescript
enum Role {
  ADMIN = 'ADMIN',
  SUPER_USER = 'SUPER_USER',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  EMPLOYEE = 'EMPLOYEE',
  DEVELOPER = 'DEVELOPER',
  USER = 'USER',
  OWNER = 'OWNER'
}
```

### Middlewares d'Authentification
- **isAuthenticated** : Vérification du token JWT
- **checkUserRole** : Vérification des permissions
- **rateLimiter** : Limitation de débit
- **validation** : Validation des données d'entrée

### Sécurité
- **Helmet** : Headers de sécurité
- **CORS** : Configuration cross-origin
- **Rate Limiting** : Protection contre les attaques
- **JWT** : Tokens d'authentification
- **Validation** : Sanitisation des données

## 📁 Gestion des Fichiers

### Intégration Cloudinary
- Upload automatique vers Cloudinary
- Optimisation et redimensionnement
- Gestion des formats (JPG, PNG, PDF)
- URLs sécurisées

### Types de Fichiers
- **Images de profil** : Avatars utilisateurs
- **Logos d'entreprise** : Identité visuelle
- **Photos d'événements** : Documentation
- **PDF de réponses** : Génération automatique

### Fonctionnalités
- Compression automatique
- Watermarking
- Formats multiples
- Gestion des métadonnées

## 🔔 Système de Notifications

### Types de Notifications
- **Événements** : Création, modification, rappels
- **Employés** : Ajout, modification, signatures
- **Système** : Maintenance, mises à jour
- **Badges** : Récompenses et gamification

### Technologies
- **Server-Sent Events (SSE)** : Notifications temps réel
- **BullMQ** : Files d'attente asynchrones
- **Mailjet** : Notifications par email
- **Redis** : Stockage des sessions SSE

### Configuration
```typescript
const notificationChannel = createChannel()
app.use('/sse', new SSERoutes(APP_SOURCE, {
  notificationChannel,
}).intializeRoutes())
```

## 💳 Intégration Stripe

### Fonctionnalités
- **Création de clients** : Enregistrement des utilisateurs
- **Gestion d'abonnements** : Plans Premium, Medium, Basic
- **Webhooks** : Traitement des événements de paiement
- **Facturation** : Génération automatique

### Plans d'Abonnement
```typescript
enum SubscriptionEnum {
  PREMIUM = 'PREMIUM',
  MEDIUM = 'MEDIUM',
  BASIC = 'BASIC'
}
```

### Endpoints Stripe
```
POST /stripe/customer     # Création de client
POST /stripe/payment      # Session de paiement
POST /stripe/webhook      # Webhooks Stripe
```

## ⏰ Tâches Planifiées

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

### Files d'Attente BullMQ
- **Traitement d'emails** : Envoi asynchrone
- **Génération de PDF** : Création de documents
- **Notifications** : Envoi en arrière-plan
- **Import d'employés** : Traitement en masse

## 🧪 Tests

### Configuration Jest
```typescript
const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
}
```

### Structure des Tests
```
src/tests/
├── config/           # Configuration des tests
├── fixtures/         # Données de test
├── middlewares/      # Tests des middlewares
├── utils/            # Tests des utilitaires
└── testConnection.test.ts
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

### Scripts de Déploiement
```bash
# Build et déploiement
pnpm run build
fly deploy

# Seed de la base de données
docker exec -it <container-id> bash
./scripts/scriptSeed.sh
```

## ⚙️ Configuration et Variables d'Environnement

### Variables Requises
```bash
# Base de données
DATABASE_URL=
DB_USERNAME_PROD=
DB_PASSWORD_PROD=

# Test
HOSTNAME_TEST=
POSTGRES_PORT_TEST=
DB_USERNAME_TEST=
DB_PASSWORD_TEST=
DATABASE_URL_TEST=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=

# Email
MAIL_ADRESS=
MAIL_MDP=
MJ_APIKEY_PUBLIC=
MJ_APIKEY_PRIVATE=
IS_FEATURE_MAIL_ENABLED=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_FIRTNAME=
ADMIN_LASTNAME=

# Application
FRONT_URL=
JWT_SECRET=
NODE_ENV=
PORT=

# Redis
REDIS_HOST=
REDIS_PASSWORD=
REDIS_PORT=
CONCURRENT_WORKERS=

# Services
GEO_CODING_API_URL=
BROWSERLESS_API_KEY=
STRIPE_PRIVATE_KEY=
```

### Configuration par Environnement
- **Development** : Base de données locale, logging détaillé
- **Test** : Base de données de test, seed automatique
- **Production** : Base de données distante, logging minimal

## 👨‍💻 Guide de Développement

### Prérequis
- Node.js v24.7.0
- pnpm v10.15.1
- PostgreSQL v16
- Redis v6+

### Installation
```bash
# Cloner le projet
git clone <repository>
cd be-right-backend

# Installer les dépendances
pnpm install

# Configurer l'environnement
cp exemple.env .env
# Éditer .env avec vos valeurs

# Démarrer les services
docker-compose up -d

# Lancer l'application
pnpm run dev
```

### Scripts Disponibles
```bash
pnpm start          # Démarrage en production
pnpm dev            # Démarrage en développement
pnpm build          # Build TypeScript
pnpm test           # Exécution des tests
pnpm lint           # Vérification du code
pnpm lint:fix       # Correction automatique
```

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

## 📊 Métriques et Monitoring

### Logging
- **tslog** : Logging structuré
- **Niveaux** : info, warn, error, debug
- **Format** : JSON avec métadonnées
- **Rotation** : Logs automatiques

### Performance
- **Redis Cache** : Mise en cache des requêtes
- **Connection Pooling** : Optimisation des connexions DB
- **Rate Limiting** : Protection contre la surcharge
- **Compression** : Gzip automatique

### Sécurité
- **Helmet** : Headers de sécurité
- **CORS** : Configuration cross-origin
- **Rate Limiting** : Protection DDoS
- **Validation** : Sanitisation des données

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

---

*Documentation générée le $(date)*
*Version du projet : 0.1.0*
