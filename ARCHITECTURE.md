# Architecture Technique - Be-Right Backend

## 🏗️ Vue d'Ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vue)                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer (Fly.io)                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Be-Right Backend API                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Express.js    │  │   TypeORM      │  │   Middlewares   │   │
│  │   Server        │  │   ORM          │  │   (Auth, Val)   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Services Externes                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  PostgreSQL  │  │    Redis    │  │  Cloudinary │            │
│  │  Database    │  │    Cache    │  │    Images   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Stripe     │  │   Mailjet   │  │  Puppeteer  │            │
│  │  Payments    │  │    Email    │  │     PDF     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### 1. Authentification et Autorisation

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    participant Redis

    Client->>API: POST /auth/login
    API->>Auth: Validate credentials
    Auth->>DB: Check user
    DB-->>Auth: User data
    Auth->>Auth: Generate JWT
    Auth->>Redis: Store session
    Auth-->>API: JWT token
    API-->>Client: Token + User data
```

### 2. Création d'Événement

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant EventService
    participant DB
    participant NotificationService
    participant SSE

    Client->>API: POST /event
    API->>EventService: Create event
    EventService->>DB: Save event
    DB-->>EventService: Event created
    EventService->>NotificationService: Notify users
    NotificationService->>SSE: Send real-time notification
    EventService-->>API: Event data
    API-->>Client: Event created
```

### 3. Upload de Fichier

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant FileService
    participant Cloudinary
    participant DB

    Client->>API: POST /file (multipart)
    API->>FileService: Process file
    FileService->>Cloudinary: Upload image
    Cloudinary-->>FileService: Image URL
    FileService->>DB: Save file metadata
    DB-->>FileService: File record
    FileService-->>API: File data
    API-->>Client: File uploaded
```

## 🗄️ Modèle de Données

### Diagramme ERD Principal

```mermaid
erDiagram
    Company ||--o{ User : has
    Company ||--o{ Event : organizes
    Company ||--o{ Employee : employs
    Company ||--o{ Group : contains
    Company ||--|| Address : located_at
    Company ||--|| Subscription : has

    User ||--o{ Event : creates
    User ||--o{ NotificationSubscription : subscribes
    User ||--|| File : has_profile_picture
    User }o--o{ Badge : earns

    Event ||--o{ File : contains
    Event ||--|| Address : takes_place_at
    Event ||--o{ Employee : involves

    Employee ||--o{ Answer : provides
    Employee ||--o{ File : has
    Employee ||--|| Address : lives_at
    Employee }o--o{ Group : belongs_to

    Group ||--o{ Employee : contains

    Answer ||--o{ File : includes

    NotificationSubscription ||--o{ Notification : receives
```

### Relations Clés

| Entité | Relation | Entité Cible | Type | Description |
|--------|----------|--------------|------|-------------|
| Company | → | User | One-to-Many | Une entreprise peut avoir plusieurs utilisateurs |
| Company | → | Event | One-to-Many | Une entreprise peut organiser plusieurs événements |
| Company | → | Employee | One-to-Many | Une entreprise peut employer plusieurs personnes |
| Event | → | File | One-to-Many | Un événement peut contenir plusieurs fichiers |
| Employee | → | Answer | One-to-Many | Un employé peut fournir plusieurs réponses |
| User | ↔ | Badge | Many-to-Many | Un utilisateur peut gagner plusieurs badges |

## 🔧 Architecture des Services

### Couche Contrôleur

```typescript
// Pattern Controller
class EventController {
  constructor(private eventService: EventService) {}
  
  async createEvent(req: Request, res: Response) {
    try {
      const event = await this.eventService.create(req.body)
      res.status(201).json(event)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }
}
```

### Couche Service

```typescript
// Pattern Service Layer
class EventService {
  constructor(
    private eventRepository: Repository<EventEntity>,
    private notificationService: NotificationService
  ) {}
  
  async create(eventData: CreateEventDto): Promise<EventEntity> {
    const event = this.eventRepository.create(eventData)
    await this.eventRepository.save(event)
    
    // Notification asynchrone
    await this.notificationService.notifyEventCreated(event)
    
    return event
  }
}
```

### Couche Repository

```typescript
// Pattern Repository
@EntityRepository(EventEntity)
export class EventRepository extends Repository<EventEntity> {
  async findWithRelations(id: number): Promise<EventEntity> {
    return this.findOne({
      where: { id },
      relations: ['company', 'files', 'address']
    })
  }
  
  async findUpcomingEvents(): Promise<EventEntity[]> {
    return this.find({
      where: {
        start: MoreThan(new Date()),
        status: EventStatusEnum.CREATE
      }
    })
  }
}
```

## 🔄 Système de Files d'Attente

### Architecture BullMQ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Producer      │    │   Redis Queue   │    │   Worker        │
│   (API)         │───►│   (BullMQ)      │───►│   (Processor)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Types de Jobs

```typescript
// Email Job
interface EmailJob {
  type: 'SEND_EMAIL'
  data: {
    to: string
    template: string
    variables: Record<string, any>
  }
}

// PDF Generation Job
interface PDFJob {
  type: 'GENERATE_PDF'
  data: {
    template: string
    data: Record<string, any>
    outputPath: string
  }
}

// Notification Job
interface NotificationJob {
  type: 'SEND_NOTIFICATION'
  data: {
    userId: number
    message: string
    type: NotificationType
  }
}
```

## 🔐 Sécurité et Authentification

### Architecture de Sécurité

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   API Gateway  │    │   Application  │
│                 │───►│   (Rate Limit) │───►│   (Auth Check)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Helmet        │    │   JWT Verify    │
                       │   (Headers)     │    │   (Token)       │
                       └─────────────────┘    └─────────────────┘
```

### Middleware Stack

```typescript
// Ordre des middlewares
app.use(helmet())                    // Headers de sécurité
app.use(cors())                      // CORS
app.use(express.json())              // Parse JSON
app.use(rateLimiter)                // Rate limiting
app.use(isAuthenticated)             // JWT verification
app.use(checkUserRole)               // Role verification
app.use(validation)                  // Data validation
```

## 📊 Monitoring et Observabilité

### Métriques Collectées

```typescript
// Métriques d'application
interface AppMetrics {
  requests: {
    total: number
    perEndpoint: Record<string, number>
    responseTime: number[]
  }
  database: {
    connections: number
    queryTime: number[]
    errors: number
  }
  cache: {
    hitRate: number
    memoryUsage: number
  }
  queue: {
    pendingJobs: number
    processedJobs: number
    failedJobs: number
  }
}
```

### Logging Structure

```typescript
// Format de log
interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  context: {
    userId?: number
    requestId: string
    endpoint: string
    method: string
    ip: string
  }
  metadata: Record<string, any>
}
```

## 🚀 Déploiement et Infrastructure

### Architecture de Déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Git           │    │   Fly.io        │    ┌   PostgreSQL    │
│   Repository    │───►│   Platform      │───►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Redis         │    │   Cloudinary    │
                       │   Cache         │    │   Storage       │
                       └─────────────────┘    └─────────────────┘
```

### Configuration Docker

```dockerfile
# Dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

### Variables d'Environnement par Environnement

```bash
# Development
NODE_ENV=development
DATABASE_URL=postgresql://test:test@localhost:5432/be-right-db
REDIS_HOST=localhost
REDIS_PORT=6379

# Production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/be-right-prod
REDIS_HOST=prod-redis
REDIS_PORT=6379
REDIS_PASSWORD=secure_password
```

## 🔄 Patterns Architecturaux

### 1. Repository Pattern
- Abstraction de la couche de données
- Tests unitaires facilités
- Changement de base de données transparent

### 2. Service Layer Pattern
- Logique métier centralisée
- Réutilisabilité du code
- Séparation des responsabilités

### 3. Middleware Pattern
- Chaînage de fonctionnalités
- Réutilisabilité des middlewares
- Gestion d'erreurs centralisée

### 4. Observer Pattern (SSE)
- Notifications temps réel
- Découplage des composants
- Scalabilité des événements

### 5. Queue Pattern (BullMQ)
- Traitement asynchrone
- Gestion de la charge
- Fiabilité des opérations

## 📈 Scalabilité

### Stratégies de Scalabilité

1. **Scalabilité Horizontale**
   - Load balancing avec Fly.io
   - Réplication de base de données
   - Cache distribué Redis

2. **Scalabilité Verticale**
   - Optimisation des requêtes SQL
   - Mise en cache intelligente
   - Compression des réponses

3. **Scalabilité des Données**
   - Partitionnement des tables
   - Archivage des anciennes données
   - Indexation optimisée

### Optimisations de Performance

```typescript
// Mise en cache Redis
async function getCachedData(key: string): Promise<any> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)
  
  const data = await fetchFromDatabase()
  await redis.setex(key, 3600, JSON.stringify(data))
  return data
}

// Pagination optimisée
async function getPaginatedData(page: number, limit: number) {
  const offset = (page - 1) * limit
  return await repository.find({
    skip: offset,
    take: limit,
    order: { createdAt: 'DESC' }
  })
}
```

## 🔮 Évolutions Futures

### Microservices Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Event        │    │   User         │
│                  │───►│   Service      │    │   Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Notification  │    │   File          │    │   Payment      │
│   Service       │    │   Service       │    │   Service      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technologies Futures

1. **GraphQL** : API plus flexible et performante
2. **WebSockets** : Communication bidirectionnelle
3. **Kubernetes** : Orchestration de conteneurs
4. **Elasticsearch** : Recherche avancée
5. **Apache Kafka** : Streaming d'événements

---

*Document d'architecture généré le $(date)*
*Version : 1.0.0*
