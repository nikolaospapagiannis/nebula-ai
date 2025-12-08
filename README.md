<div align="center">
  <img src="docs/assets/logo.svg" alt="Nebula AI Logo" width="180">
  <h1>Nebula AI</h1>
  <p><strong>Enterprise-Grade Meeting Intelligence Platform</strong></p>
  <p>AI-powered transcription, insights, and revenue intelligence for modern teams</p>

  <!-- Status Badges -->
  <p>
    <a href="https://github.com/nikolaospapagiannis/nebula-ai/actions"><img src="https://img.shields.io/github/actions/workflow/status/nikolaospapagiannis/nebula-ai/ci-cd.yml?branch=main&style=flat-square&label=CI/CD" alt="Build Status"></a>
    <a href="https://github.com/nikolaospapagiannis/nebula-ai/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License"></a>
    <img src="https://img.shields.io/badge/TypeScript-5.3+-blue?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js" alt="Node.js">
    <img src="https://img.shields.io/badge/Python-3.11+-yellow?style=flat-square&logo=python" alt="Python">
  </p>

  <!-- Tech Stack Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React_Native-0.73-61DAFB?style=flat-square&logo=react" alt="React Native">
    <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis" alt="Redis">
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker">
  </p>

  <!-- Quick Links -->
  <p>
    <a href="#-quick-start">Quick Start</a> &bull;
    <a href="docs/getting-started/installation.md">Documentation</a> &bull;
    <a href="#-features">Features</a> &bull;
    <a href="CONTRIBUTING.md">Contributing</a> &bull;
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## Table of Contents

- [Features](#-features)
- [Why Nebula AI?](#-why-nebula-ai)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [API Documentation](#-api-documentation)
- [Integrations](#-integrations)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Security](#-security)
- [License](#-license)

---

## Features

<table>
<tr>
<td width="50%">

### Meeting Intelligence
- **AI Transcription** - Real-time transcription with 100+ language support
- **Speaker Diarization** - Automatic speaker identification using PyAnnote
- **Smart Summaries** - GPT-4 powered meeting summaries and action items
- **Live Captions** - Real-time WebSocket-based captioning
- **Video Player** - Synchronized playback with transcript highlighting

</td>
<td width="50%">

### Revenue Intelligence
- **Deal Tracking** - Link meetings to deals for complete pipeline visibility
- **Win/Loss Analysis** - AI-generated insights on closed deals
- **Sales Coaching** - Automated scorecards with talk ratios, questions, and filler words
- **Predictive Insights** - Deal risk scoring and churn prediction
- **CRM Sync** - Automatic syncing with Salesforce, HubSpot, and Pipedrive

</td>
</tr>
<tr>
<td width="50%">

### Workflow Automation
- **Custom Triggers** - Automate actions based on meeting events
- **Action Items** - Auto-create tasks in Asana, Jira, Linear, Monday.com
- **Smart Follow-ups** - Automated email and Slack notifications
- **Topic Tracking** - Monitor keywords and trends across meetings
- **Email Templates** - Customizable follow-up templates

</td>
<td width="50%">

### Enterprise Features
- **SSO Integration** - SAML 2.0 with Okta, Azure AD, Auth0
- **SCIM Provisioning** - Automated user provisioning
- **Advanced RBAC** - Fine-grained role-based access control
- **White-Label** - Custom branding, domains, and theming
- **Compliance** - GDPR, HIPAA, SOC2 ready audit logging

</td>
</tr>
<tr>
<td width="50%">

### Multi-Platform
- **Web App** - Modern Next.js 14 dashboard
- **Mobile App** - React Native for iOS and Android
- **Chrome Extension** - One-click meeting recording
- **GraphQL API** - Full-featured API with subscriptions
- **Webhooks** - Real-time event notifications

</td>
<td width="50%">

### AI Flexibility
- **Multi-Provider** - OpenAI, Anthropic, vLLM, Ollama, LM Studio
- **Self-Hosted AI** - Run models locally for data privacy
- **Custom Fine-Tuning** - Train models on your organization's data
- **Cost Optimization** - Cloud ($920/mo) vs Local ($0/mo)
- **Fallback Support** - Automatic provider switching

</td>
</tr>
</table>

<details>
<summary><strong>Feature Comparison with Competitors</strong></summary>

| Feature | Nebula AI | Fireflies.ai | Otter.ai | Gong |
|---------|-----------|--------------|----------|------|
| Multi-AI Providers | 5 providers | OpenAI only | OpenAI only | Proprietary |
| Mobile App | iOS + Android | Yes | iOS only | Yes |
| White-Label | Full branding | No | No | Enterprise |
| Self-Hosted Option | Docker Compose | No | No | No |
| GraphQL Subscriptions | Real-time | No | No | No |
| Custom Fine-Tuning | OpenAI API | No | No | Proprietary |
| Price | $8-29/user/mo | $10-39/user/mo | $16.99+/mo | $100+/user/mo |

</details>

---

## Why Nebula AI?

**The Problem:** Meeting intelligence tools are either too expensive, too limited, or lock you into proprietary AI systems.

**Our Solution:** Nebula AI provides enterprise-grade meeting intelligence with complete flexibility:

- **Own Your Data** - Self-host the entire platform with Docker Compose
- **Choose Your AI** - Use OpenAI, run local models, or mix providers
- **Customize Everything** - White-label, custom workflows, fine-tuned models
- **Scale Affordably** - Open-source core with transparent pricing

> "Move from paying $100+/user/month to running your own meeting intelligence platform."

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker and Docker Compose
- pnpm (`npm install -g pnpm`)

### 30-Second Setup

```bash
# Clone the repository
git clone https://github.com/nikolaospapagiannis/nebula-ai.git
cd nebula-ai

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Start infrastructure (PostgreSQL, Redis, MongoDB, Elasticsearch)
docker-compose up -d

# Run database migrations
pnpm prisma migrate dev

# Start development servers
pnpm dev
```

**That's it!** Open [http://localhost:3003](http://localhost:3003) to see the web app.

| Service | URL |
|---------|-----|
| Web App | http://localhost:3003 |
| API Server | http://localhost:4000 |
| AI Service | http://localhost:5001 |
| WebSocket | ws://localhost:5003 |

---

## Installation

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/nikolaospapagiannis/nebula-ai.git
cd nebula-ai

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Installation

<details>
<summary><strong>Step-by-step manual setup</strong></summary>

#### 1. Install Dependencies

```bash
# Clone repository
git clone https://github.com/nikolaospapagiannis/nebula-ai.git
cd nebula-ai

# Install Node.js dependencies
pnpm install

# Install Python dependencies (for AI service)
cd apps/ai-service
pip install -r requirements.txt
pip install -r requirements-ml.txt
cd ../..
```

#### 2. Set Up Databases

```bash
# Start infrastructure services
docker-compose up -d postgres redis mongodb elasticsearch rabbitmq minio

# Wait for services to be healthy
docker-compose ps

# Run Prisma migrations
pnpm prisma migrate dev

# (Optional) Seed database
pnpm prisma db seed
```

#### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#-configuration)).

#### 4. Start Services

```bash
# Terminal 1: API Server
pnpm dev:api

# Terminal 2: Web Frontend
pnpm dev:web

# Terminal 3: AI Service
cd apps/ai-service && uvicorn app.main:app --reload --port 5001
```

</details>

### Using Turborepo

```bash
# Run all development servers
pnpm dev

# Run specific app
pnpm dev:web    # Web frontend only
pnpm dev:api    # API server only
pnpm dev:ai     # AI service only

# Build all packages
pnpm build

# Run tests
pnpm test
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root. See [.env.example](.env.example) for all options.

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/nebula` |
| `REDIS_URL` | Redis connection string | `redis://:password@localhost:6379` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-secure-secret-min-32-characters` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `different-secure-secret-min-32-chars` |

#### AI Provider Configuration

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4/Whisper |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `VLLM_URL` | vLLM server URL for local inference |
| `OLLAMA_URL` | Ollama server URL |
| `HF_TOKEN` | HuggingFace token for model downloads |

#### Integration Keys

| Variable | Description |
|----------|-------------|
| `SALESFORCE_CLIENT_ID/SECRET` | Salesforce OAuth credentials |
| `HUBSPOT_API_KEY` | HubSpot API key |
| `SLACK_BOT_TOKEN` | Slack Bot OAuth token |
| `SENDGRID_API_KEY` | SendGrid email API key |
| `STRIPE_SECRET_KEY` | Stripe payment API key |

See [docs/getting-started/configuration.md](docs/getting-started/configuration.md) for complete configuration reference.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐│
│  │   Next.js   │  │    Chrome    │  │React Native │  │  GraphQL  ││
│  │   Web App   │  │  Extension   │  │  Mobile App │  │   Client  ││
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └─────┬─────┘│
└─────────┼────────────────┼─────────────────┼───────────────┼───────┘
          │                │                 │               │
          └────────────────┴────────┬────────┴───────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────┐
│                         API LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                    Express.js API Server                       ││
│  │         REST API • GraphQL • WebSocket • Rate Limiting         ││
│  │                                                                ││
│  │  ┌──────────────────────────────────────────────────────────┐ ││
│  │  │                    SERVICE LAYER (70+)                   │ ││
│  │  │                                                          │ ││
│  │  │  TranscriptionService  •  RevenueIntelligenceService    │ ││
│  │  │  WorkflowAutomationService  •  SSOService  •  RBACService│ ││
│  │  │  SlackBotService  •  TeamsIntegrationService  •  ...     │ ││
│  │  └──────────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────┐
│                        DATA LAYER                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │PostgreSQL│ │  Redis   │ │ MongoDB  │ │Elastic-  │ │ RabbitMQ │ │
│  │ (Prisma) │ │ (Cache)  │ │ (Docs)   │ │ search   │ │ (Queue)  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────┐
│                       AI/ML LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                  Python FastAPI AI Service                     ││
│  │                                                                ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ││
│  │  │ OpenAI  │ │Anthropic│ │  vLLM   │ │ Ollama  │ │LM Studio│ ││
│  │  │ GPT-4   │ │ Claude  │ │ (Local) │ │ (Local) │ │ (Local) │ ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ ││
│  │                                                                ││
│  │  PyAnnote (Diarization) • KeyBERT • spaCy • faster-whisper   ││
│  └────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
nebula-ai/
├── apps/
│   ├── api/                    # Express.js API Server
│   │   ├── src/
│   │   │   ├── routes/         # REST & GraphQL endpoints
│   │   │   ├── services/       # Business logic (70+ services)
│   │   │   ├── middleware/     # Auth, rate limiting, etc.
│   │   │   ├── graphql/        # GraphQL schema & resolvers
│   │   │   └── workers/        # Background job processors
│   │   └── prisma/             # Database schema & migrations
│   │
│   ├── web/                    # Next.js 14 Frontend
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       ├── components/     # React components
│   │       └── services/       # API client services
│   │
│   ├── mobile/                 # React Native App
│   │   └── src/
│   │       ├── screens/        # App screens
│   │       ├── store/          # Redux state
│   │       └── services/       # API & offline sync
│   │
│   ├── ai-service/             # Python FastAPI ML Service
│   │   └── app/
│   │       ├── routes/         # API endpoints
│   │       └── services/       # ML model services
│   │
│   ├── chrome-extension/       # Browser Extension
│   └── realtime-service/       # WebSocket Server
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   └── ui/                     # Shared UI components
│
├── services/
│   ├── analytics/              # Analytics microservice
│   ├── billing/                # Stripe billing
│   └── notification/           # Notification service
│
├── infrastructure/
│   ├── k8s/                    # Kubernetes manifests
│   ├── terraform/              # Infrastructure as code
│   ├── monitoring/             # Grafana dashboards
│   └── scripts/                # Deployment scripts
│
└── docs/                       # Documentation
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js 20** | Runtime environment |
| **Express.js 4** | Web framework |
| **TypeScript 5.3** | Type-safe development |
| **Prisma 5** | PostgreSQL ORM |
| **Mongoose 8** | MongoDB ODM |
| **GraphQL** | API query language |
| **Socket.io** | Real-time communication |
| **Bull** | Job queue processing |

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework |
| **React 18** | UI library |
| **TailwindCSS** | Styling |
| **Radix UI** | Accessible components |
| **Zustand** | State management |
| **React Hook Form** | Form handling |

### Mobile

| Technology | Purpose |
|------------|---------|
| **React Native 0.73** | Cross-platform mobile |
| **Redux Toolkit** | State management |
| **React Navigation** | Navigation |
| **Firebase** | Push notifications |

### AI/ML

| Technology | Purpose |
|------------|---------|
| **FastAPI** | Python API framework |
| **OpenAI** | GPT-4, Whisper, embeddings |
| **Anthropic** | Claude models |
| **PyAnnote** | Speaker diarization |
| **KeyBERT** | Keyword extraction |
| **spaCy** | NLP processing |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **PostgreSQL 15** | Primary database |
| **Redis 7** | Caching, sessions |
| **MongoDB 7** | Document storage |
| **Elasticsearch 8** | Full-text search |
| **RabbitMQ** | Message queue |
| **MinIO** | S3-compatible storage |
| **Docker** | Containerization |

---

## API Documentation

### REST API

The API server runs on port `4000` by default.

```bash
# Health check
curl http://localhost:4000/health

# Authenticate
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Get meetings (authenticated)
curl http://localhost:4000/api/v1/meetings \
  -H "Authorization: Bearer <token>"
```

### GraphQL API

GraphQL endpoint: `http://localhost:4000/graphql`

```graphql
# Query meetings
query {
  meetings(first: 10) {
    id
    title
    status
    scheduledStartAt
    participants {
      name
      email
    }
  }
}

# Subscribe to live transcription
subscription {
  transcriptUpdate(meetingId: "meeting-123") {
    text
    speaker
    timestamp
  }
}
```

### AI Service Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/transcribe` | POST | Transcribe audio file |
| `/api/v1/diarize` | POST | Speaker diarization |
| `/api/v1/summarize` | POST | Generate meeting summary |
| `/api/v1/sentiment` | POST | Sentiment analysis |
| `/api/v1/extract-keywords` | POST | Keyword extraction |
| `/api/v1/chat` | POST | Conversational AI |
| `/health` | GET | Health check |
| `/metrics` | GET | Prometheus metrics |

See [docs/api/reference.md](docs/api/reference.md) for complete API documentation.

---

## Integrations

### CRM Integrations

| Platform | Features |
|----------|----------|
| **Salesforce** | Sync meetings to opportunities, auto-log calls, contact mapping |
| **HubSpot** | Meeting sync, deal association, engagement logging |
| **Pipedrive** | Deal linking, activity sync, contact enrichment |

### Communication

| Platform | Features |
|----------|----------|
| **Slack** | Bot commands, meeting notifications, summary sharing |
| **Microsoft Teams** | Bot integration, channel notifications |
| **Email (SendGrid)** | Follow-up emails, summary distribution |
| **Twilio** | SMS notifications |

### Task Management

| Platform | Features |
|----------|----------|
| **Asana** | Auto-create tasks from action items |
| **Jira** | Issue creation, project sync |
| **Linear** | Issue tracking integration |
| **Monday.com** | Board sync, item creation |

### Calendar

| Platform | Features |
|----------|----------|
| **Google Calendar** | Meeting sync, auto-record scheduling |
| **Microsoft Outlook** | Calendar integration, Teams meetings |

### SSO Providers

| Provider | Protocol |
|----------|----------|
| **Okta** | SAML 2.0, SCIM |
| **Azure AD** | SAML 2.0, SCIM |
| **Auth0** | SAML 2.0 |
| **Google Workspace** | SAML 2.0 |
| **OneLogin** | SAML 2.0 |

---

## Deployment

### Docker Compose (Development/Small Teams)

```bash
# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Production with Docker Compose

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/k8s/

# Check deployment status
kubectl get pods -n nebula-ai
```

See [docs/guides/deployment.md](docs/guides/deployment.md) for detailed deployment guides.

---

## Roadmap

### Completed

- [x] Core meeting transcription and diarization
- [x] Multi-provider AI support (OpenAI, Anthropic, vLLM, Ollama)
- [x] CRM integrations (Salesforce, HubSpot, Pipedrive)
- [x] Revenue intelligence and sales coaching
- [x] Enterprise SSO (SAML, SCIM)
- [x] White-label platform
- [x] React Native mobile app
- [x] Chrome extension

### In Progress

- [ ] Real-time meeting bot for Zoom/Teams/Meet
- [ ] Enhanced video intelligence with visual analysis
- [ ] Custom model fine-tuning UI
- [ ] Multi-language support expansion

### Planned

- [ ] Desktop application (Electron)
- [ ] Meeting scheduling (Calendly-like)
- [ ] Advanced analytics dashboard
- [ ] Plugin marketplace
- [ ] On-premise deployment guide

See [GitHub Issues](https://github.com/nikolaospapagiannis/nebula-ai/issues) for detailed roadmap.

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Format code
pnpm format
```

---

## Security

Security is a top priority. Please see our [Security Policy](SECURITY.md) for:

- Supported versions
- Reporting vulnerabilities
- Security best practices

**Do not** report security vulnerabilities through public GitHub issues.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Use freely for commercial and personal projects.
```

---

<div align="center">
  <p>
    <strong>Built with by the Nebula AI Team</strong>
  </p>
  <p>
    <a href="https://github.com/nikolaospapagiannis/nebula-ai">Star on GitHub</a> &bull;
    <a href="CONTRIBUTING.md">Contribute</a> &bull;
    <a href="https://github.com/nikolaospapagiannis/nebula-ai/issues">Report Issues</a>
  </p>
</div>
