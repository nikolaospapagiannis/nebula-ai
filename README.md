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
    <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa" alt="PWA">
  </p>

  <!-- Quick Links -->
  <p>
    <a href="#-quick-start">Quick Start</a> &bull;
    <a href="docs/getting-started/installation.md">Documentation</a> &bull;
    <a href="#-features">Features</a> &bull;
    <a href="#-web-app-features">Web App</a> &bull;
    <a href="CONTRIBUTING.md">Contributing</a> &bull;
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## Table of Contents

- [Features](#-features)
- [Web App Features](#-web-app-features)
- [Why Nebula AI?](#-why-nebula-ai)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [API Documentation](#-api-documentation)
- [Components Library](#-components-library)
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
- **Video Clips** - Create, preview, and share meeting highlights
- **Meeting Insights** - Sentiment analysis, talk time, topic extraction

</td>
<td width="50%">

### Revenue Intelligence
- **Deal Tracking** - Link meetings to deals for complete pipeline visibility
- **Pipeline Kanban** - Drag-and-drop deal management board
- **Win/Loss Analysis** - AI-generated insights on closed deals
- **Sales Coaching** - Automated scorecards with AI recommendations
- **Competitor Tracking** - Monitor competitor mentions in calls
- **Deal Health Score** - Visual health indicators with improvement suggestions
- **CRM Sync** - Automatic syncing with Salesforce, HubSpot, and Pipedrive

</td>
</tr>
<tr>
<td width="50%">

### Workflow Automation
- **Visual Workflow Builder** - Drag-and-drop canvas with nodes and edges
- **Custom Triggers** - Meeting completed, keyword detected, schedule-based
- **Action Nodes** - Send email, post to Slack, update CRM, call webhooks
- **Condition Branching** - If/then logic for complex workflows
- **Execution Logs** - Real-time monitoring and debugging
- **Pre-built Templates** - Ready-to-use workflow templates
- **Test Mode** - Test workflows before deploying

</td>
<td width="50%">

### Enterprise Features
- **SSO Integration** - SAML 2.0 with Okta, Azure AD, Auth0
- **OIDC Support** - OpenID Connect configuration
- **SCIM Provisioning** - Automated user provisioning with token management
- **Domain Verification** - DNS TXT record verification
- **Advanced RBAC** - Fine-grained role-based access control
- **White-Label** - Custom branding, domains, and theming
- **Compliance** - GDPR, HIPAA, SOC2 ready audit logging

</td>
</tr>
<tr>
<td width="50%">

### Multi-Platform
- **Web App** - Modern Next.js 14 dashboard with PWA support
- **Mobile App** - React Native for iOS and Android
- **Chrome Extension** - One-click meeting recording with bot injection
- **GraphQL API** - Full-featured API with subscriptions
- **Webhooks** - Real-time event notifications with delivery logs
- **Developer Portal** - API keys, playground, and SDK documentation

</td>
<td width="50%">

### AI Flexibility
- **Multi-Provider** - OpenAI, Anthropic, vLLM, Ollama, LM Studio
- **Self-Hosted AI** - Run models locally for data privacy
- **AI Apps Platform** - Marketplace with 12+ pre-built AI apps
- **Custom App Builder** - Create custom AI apps with prompt templates
- **Custom Fine-Tuning** - Train models on your organization's data
- **Cost Optimization** - Cloud ($920/mo) vs Local ($0/mo)

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
| Visual Workflow Builder | Yes | Limited | No | No |
| AI Apps Marketplace | 12+ apps | No | No | No |
| Custom Fine-Tuning | OpenAI API | No | No | Proprietary |
| PWA Support | Yes | No | No | No |
| Price | $8-29/user/mo | $10-39/user/mo | $16.99+/mo | $100+/user/mo |

</details>

---

## Web App Features

The Nebula AI web application includes a comprehensive set of features organized into functional areas:

### Authentication & Security

| Feature | Description | Components |
|---------|-------------|------------|
| **Login/Register** | Email/password and OAuth authentication | `LoginPage`, `RegisterPage` |
| **Password Reset** | Forgot password with email verification | `ForgotPasswordPage`, `ResetPasswordPage` |
| **Email Verification** | Email confirmation flow with resend | `VerifyEmailPage`, `PendingVerification` |
| **MFA Setup** | TOTP-based two-factor authentication | `MFASetupWizard`, `MFAVerifyModal` |
| **Session Management** | Active sessions and device management | `SecuritySettings` |

### Onboarding & First-Time UX

| Feature | Description | Components |
|---------|-------------|------------|
| **Onboarding Survey** | Multi-step wizard for user preferences | `OnboardingSurvey`, `OnboardingPage` |
| **Welcome Modal** | Feature introduction for new users | `WelcomeModal` |
| **Feature Tour** | Interactive product tour with tooltips | `FeatureTour`, `TourTooltip` |
| **Empty States** | Helpful empty states with CTAs | `EmptyDashboard`, `EmptyMeetingsList` |
| **Setup Checklist** | Progress tracker for account setup | `SetupChecklist` |

### Meeting Management

| Feature | Description | Components |
|---------|-------------|------------|
| **File Upload** | Drag-and-drop with chunked uploads (up to 2GB) | `MeetingUploadModal`, `FileDropZone` |
| **Processing Progress** | Real-time status via WebSocket | `ProcessingProgress` |
| **Meeting Detail** | Synchronized player with transcript | `MeetingPlayer`, `SyncedTranscript` |
| **Meeting Filters** | Advanced filtering with saved presets | `MeetingFilters`, `FilterPresets` |
| **Video Clips** | Timeline selection and sharing | `ClipTimeline`, `ClipPreview`, `ClipShareModal` |

### AI Features

| Feature | Description | Components |
|---------|-------------|------------|
| **Ask AI (Fred)** | Cross-meeting AI assistant | `AskAIChat`, `SuggestedQuestions` |
| **AI Summary** | Expandable summary with sections | `MeetingSummaryPanel` |
| **Meeting Insights** | Sentiment, talk time, topics | `MeetingInsights`, `SentimentTimeline` |
| **AI Apps** | Marketplace and custom builder | `AppMarketplace`, `CustomAppBuilder` |

### Search & Navigation

| Feature | Description | Components |
|---------|-------------|------------|
| **Global Search** | Cmd+K search across all content | `GlobalSearchModal`, `SearchResults` |
| **Live Transcription** | Real-time meeting transcription | `LiveTranscriptPanel`, `LiveControls` |
| **Notifications** | Real-time notification system | `NotificationDropdown`, `NotificationToast` |

### Analytics & Reporting

| Feature | Description | Components |
|---------|-------------|------------|
| **Analytics Dashboard** | Meeting volume, engagement, export | `MeetingVolumeChart`, `EngagementMetrics` |
| **Participant Leaderboard** | Top participants with sorting | `ParticipantLeaderboard` |
| **Quality Score** | Meeting quality metrics (0-100) | `QualityScoreCard`, `QualityBreakdown` |
| **Team Trends** | Team performance over time | `TeamQualityTrends` |
| **Export Reports** | CSV and PDF export | `ExportReportModal` |

### Revenue & Sales

| Feature | Description | Components |
|---------|-------------|------------|
| **Pipeline Kanban** | Drag-and-drop deal board | `PipelineKanban` |
| **Deal Timeline** | Activity history with sentiment | `DealTimeline` |
| **Competitor Mentions** | Track competitor discussions | `CompetitorMentions` |
| **AI Next Steps** | AI-generated recommendations | `NextStepsAI` |
| **Deal Health** | Visual health scoring | `DealHealthScore` |

### Coaching & Training

| Feature | Description | Components |
|---------|-------------|------------|
| **AI Coaching Insights** | Personalized recommendations | `AICoachingInsights` |
| **Performance Trends** | Historical performance charts | `PerformanceTrends` |
| **Peer Comparison** | Anonymous benchmarking | `PeerComparison` |
| **Coaching Goals** | Goal setting and tracking | `CoachingGoals` |
| **Scorecard Evaluator** | Automatic transcript scoring | `ScorecardEvaluator` |

### Templates & Content

| Feature | Description | Components |
|---------|-------------|------------|
| **Template Editor** | Rich text with 70+ variables | `EnhancedTemplateEditor` |
| **Variable Inserter** | Autocomplete variable picker | `EnhancedVariableInserter` |
| **Version History** | Template versioning | `TemplateVersions` |
| **Template Sharing** | Team collaboration | `TemplateSharing`, `TemplateCollaboration` |

### Topics & Tracking

| Feature | Description | Components |
|---------|-------------|------------|
| **Tracker Builder** | Keyword and regex patterns | `TrackerBuilder` |
| **Keyword Highlighter** | Highlight in transcripts | `KeywordHighlighter` |
| **Topic Insights** | Analytics and trends | `TopicInsights` |
| **Competitor Tracker** | Monitor competitors | `CompetitorTracker` |
| **Topic Alerts** | Real-time notifications | `TopicAlerts` |

### Sharing & Collaboration

| Feature | Description | Components |
|---------|-------------|------------|
| **Share Meeting** | Permission-based sharing | `ShareMeetingModal` |
| **Share Links** | Expiring share links | `ShareLinkGenerator` |
| **Email Invites** | Invite via email | `EmailInviteForm` |
| **Clip Library** | Saved clips gallery | `ClipLibrary` |

### Billing & Subscription

| Feature | Description | Components |
|---------|-------------|------------|
| **Plan Management** | View and change plans | `CurrentPlanCard`, `PlanComparison` |
| **Usage Metrics** | Track usage against limits | `UsageMetrics` |
| **Invoice History** | View past invoices | `InvoiceHistory` |
| **Payment Methods** | Stripe Elements integration | `PaymentMethodForm` |

### Settings & Administration

| Feature | Description | Components |
|---------|-------------|------------|
| **Profile Settings** | Avatar, name, preferences | `AvatarUploader`, `ProfileForm` |
| **Notification Prefs** | Granular notification control | `NotificationPreferences` |
| **Timezone/Language** | Localization settings | `TimezoneSelector`, `LanguageSelector` |
| **Team Management** | Invite, roles, activity | `BulkInviteModal`, `TeamActivityLog` |
| **Rate Limits** | Usage gauges and alerts | `UsageGauge`, `AlertThresholds` |

### Enterprise Administration

| Feature | Description | Components |
|---------|-------------|------------|
| **SSO Configuration** | SAML and OIDC setup | `SAMLConfigForm`, `OIDCConfigForm` |
| **SCIM Provisioning** | User provisioning | `SCIMProvisioning` |
| **Domain Verification** | DNS verification | `DomainVerification` |
| **Branding** | Logo, colors, themes | `ThemeEditor`, `BrandAssetLibrary` |
| **Custom Domain** | CNAME setup | `CustomDomainSetup` |

### Developer Tools

| Feature | Description | Components |
|---------|-------------|------------|
| **API Key Manager** | Create and rotate keys | `APIKeyManager` |
| **API Playground** | Interactive API testing | `APIPlayground` |
| **SDK Documentation** | JS, Python, cURL examples | `SDKDocs` |
| **Usage Stats** | Per-key analytics | `UsageStats` |
| **Webhooks** | Event subscriptions | `WebhookForm`, `DeliveryLogs` |

### Chrome Extension

| Feature | Description | Components |
|---------|-------------|------------|
| **Extension Status** | Connection monitoring | `ExtensionStatus` |
| **Bot Injection** | Auto-join settings | `BotInjectionSettings` |
| **Platform Detection** | Zoom, Meet, Teams, Webex | `MeetingDetection` |
| **Quick Record** | Manual recording widget | `QuickRecordWidget` |

### PWA Features

| Feature | Description | Components |
|---------|-------------|------------|
| **Install Prompt** | Add to Home Screen | `InstallPrompt` |
| **Offline Indicator** | Connection status | `OfflineIndicator` |
| **Push Notifications** | Browser notifications | `PushNotificationSetup` |
| **Update Available** | Service worker updates | `UpdateAvailable` |

---

## Why Nebula AI?

**The Problem:** Meeting intelligence tools are either too expensive, too limited, or lock you into proprietary AI systems.

**Our Solution:** Nebula AI provides enterprise-grade meeting intelligence with complete flexibility:

- **Own Your Data** - Self-host the entire platform with Docker Compose
- **Choose Your AI** - Use OpenAI, run local models, or mix providers
- **Customize Everything** - White-label, custom workflows, fine-tuned models
- **Scale Affordably** - Open-source core with transparent pricing
- **Modern UX** - PWA-ready with offline support and native-like experience

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

# Start infrastructure (PostgreSQL, Redis, Elasticsearch)
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
| PWA Demo | http://localhost:3003/pwa-demo |

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
docker-compose up -d postgres redis elasticsearch rabbitmq minio

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
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

See [docs/getting-started/configuration.md](docs/getting-started/configuration.md) for complete configuration reference.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐│
│  │   Next.js   │  │    Chrome    │  │React Native │  │  GraphQL  ││
│  │   Web App   │  │  Extension   │  │  Mobile App │  │   Client  ││
│  │    (PWA)    │  │              │  │             │  │           ││
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
│  │PostgreSQL│ │  Redis   │ │Elastic-  │ │ RabbitMQ │ │  MinIO   │ │
│  │ (Prisma) │ │ (Cache)  │ │ search   │ │ (Queue)  │ │   (S3)   │ │
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
│   │   │   ├── routes/         # REST & GraphQL endpoints (35+ route files)
│   │   │   │   ├── auth.ts             # Authentication routes
│   │   │   │   ├── meetings.ts         # Meeting CRUD
│   │   │   │   ├── sharing.ts          # Sharing & permissions
│   │   │   │   ├── clips.ts            # Video clips
│   │   │   │   ├── analytics.ts        # Analytics endpoints
│   │   │   │   ├── coaching.ts         # Coaching API
│   │   │   │   ├── webhooks.ts         # Webhook management
│   │   │   │   ├── sso.ts              # SSO/SAML
│   │   │   │   ├── scim.ts             # SCIM provisioning
│   │   │   │   └── ...
│   │   │   ├── services/       # Business logic (70+ services)
│   │   │   ├── middleware/     # Auth, rate limiting, etc.
│   │   │   ├── graphql/        # GraphQL schema & resolvers
│   │   │   └── workers/        # Background job processors
│   │   └── prisma/             # Database schema & migrations
│   │
│   ├── web/                    # Next.js 14 Frontend
│   │   ├── public/
│   │   │   ├── manifest.json   # PWA manifest
│   │   │   ├── sw.js           # Service worker
│   │   │   └── offline.html    # Offline fallback
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       │   ├── (dashboard)/
│   │       │   │   ├── analytics/      # Analytics dashboard
│   │       │   │   ├── ask-ai/         # AI assistant
│   │       │   │   ├── coaching/       # Coaching hub
│   │       │   │   ├── developers/     # Developer portal
│   │       │   │   ├── integrations/   # Integration hub
│   │       │   │   ├── live/           # Live transcription
│   │       │   │   ├── meetings/       # Meeting management
│   │       │   │   ├── notifications/  # Notification center
│   │       │   │   ├── quality/        # Quality metrics
│   │       │   │   ├── revenue/        # Revenue intelligence
│   │       │   │   ├── settings/       # All settings pages
│   │       │   │   ├── templates/      # Template management
│   │       │   │   ├── topics/         # Topic tracking
│   │       │   │   ├── workflows/      # Workflow builder
│   │       │   │   └── ai-apps/        # AI apps platform
│   │       │   ├── forgot-password/
│   │       │   ├── reset-password/
│   │       │   ├── verify-email/
│   │       │   ├── onboarding/
│   │       │   └── shared/             # Public shared views
│   │       ├── components/     # React components (200+)
│   │       │   ├── ai-apps/            # AI apps components
│   │       │   ├── analytics/          # Analytics components
│   │       │   ├── auth/               # Auth components
│   │       │   ├── billing/            # Billing components
│   │       │   ├── branding/           # Branding components
│   │       │   ├── coaching/           # Coaching components
│   │       │   ├── developers/         # Developer portal
│   │       │   ├── empty-states/       # Empty state components
│   │       │   ├── extension/          # Chrome extension
│   │       │   ├── integrations/       # Integration components
│   │       │   ├── live/               # Live transcription
│   │       │   ├── meetings/           # Meeting components
│   │       │   ├── notifications/      # Notification components
│   │       │   ├── onboarding/         # Onboarding components
│   │       │   ├── pwa/                # PWA components
│   │       │   ├── quality/            # Quality components
│   │       │   ├── rate-limits/        # Rate limit components
│   │       │   ├── revenue/            # Revenue components
│   │       │   ├── search/             # Search components
│   │       │   ├── settings/           # Settings components
│   │       │   ├── sharing/            # Sharing components
│   │       │   ├── sso/                # SSO components
│   │       │   ├── team/               # Team management
│   │       │   ├── templates/          # Template components
│   │       │   ├── topics/             # Topic components
│   │       │   ├── ui/                 # UI primitives
│   │       │   ├── video/              # Video/clip components
│   │       │   ├── webhooks/           # Webhook components
│   │       │   └── workflows/          # Workflow components
│   │       ├── hooks/          # Custom React hooks (30+)
│   │       │   ├── useAIApps.ts
│   │       │   ├── useAnalyticsData.ts
│   │       │   ├── useBranding.ts
│   │       │   ├── useClipCreation.ts
│   │       │   ├── useCoaching.ts
│   │       │   ├── useDeveloperPortal.ts
│   │       │   ├── useGlobalSearch.ts
│   │       │   ├── useLiveTranscription.ts
│   │       │   ├── useMeetingFilters.ts
│   │       │   ├── useNotifications.ts
│   │       │   ├── useOnboarding.ts
│   │       │   ├── useProcessingStatus.ts
│   │       │   ├── useProfileSettings.ts
│   │       │   ├── usePWA.ts
│   │       │   ├── useQuality.ts
│   │       │   ├── useRateLimits.ts
│   │       │   ├── useRevenueIntelligence.ts
│   │       │   ├── useSubscription.ts
│   │       │   ├── useTeamManagement.ts
│   │       │   ├── useTemplates.ts
│   │       │   ├── useTopics.ts
│   │       │   ├── useWebhooks.ts
│   │       │   └── useWorkflows.ts
│   │       ├── __tests__/      # Test suites (90+ tests)
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
| **GraphQL** | API query language |
| **Socket.io** | Real-time communication |
| **Bull** | Job queue processing |

### Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework (App Router) |
| **React 18** | UI library |
| **TailwindCSS** | Styling |
| **Radix UI** | Accessible components |
| **Recharts** | Data visualization |
| **Zustand** | State management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **@dnd-kit** | Drag and drop |
| **Stripe Elements** | Payment forms |

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

## Components Library

Nebula AI includes 200+ React components organized by feature area:

### UI Primitives (`components/ui/`)

| Component | Description |
|-----------|-------------|
| `Button` | Primary button with variants |
| `Card` | Content container |
| `CardGlass` | Glass morphism card |
| `Input` | Form input |
| `Select` | Dropdown select |
| `Tabs` | Tab navigation |
| `Badge` | Status badges |
| `Progress` | Progress indicators |
| `Skeleton` | Loading skeletons |
| `Tooltip` | Tooltips |
| `Collapsible` | Expandable sections |

### Feature Components

See the [Web App Features](#-web-app-features) section for a complete list of feature-specific components.

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
| **Slack** | Bot commands, meeting notifications, summary sharing, clip sharing |
| **Microsoft Teams** | Bot integration, channel notifications |
| **Email (SendGrid)** | Follow-up emails, summary distribution, verification emails |
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
| **Okta** | SAML 2.0, SCIM, OIDC |
| **Azure AD** | SAML 2.0, SCIM, OIDC |
| **Auth0** | SAML 2.0, OIDC |
| **Google Workspace** | SAML 2.0, OIDC |
| **OneLogin** | SAML 2.0 |

### Payments

| Provider | Features |
|----------|----------|
| **Stripe** | Subscriptions, Elements, invoices, payment methods |

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
- [x] Enterprise SSO (SAML, SCIM, OIDC)
- [x] White-label platform with custom branding
- [x] React Native mobile app
- [x] Chrome extension with bot injection
- [x] Complete authentication flows (password reset, MFA, email verification)
- [x] User onboarding system with survey and feature tour
- [x] File upload with processing progress
- [x] Video clips with timeline selection and sharing
- [x] Global search (Cmd+K)
- [x] Live transcription with WebSocket
- [x] Real-time notifications
- [x] Sharing and collaboration features
- [x] Billing dashboard with Stripe integration
- [x] Analytics dashboard with export
- [x] Coaching system with AI insights
- [x] Visual workflow automation builder
- [x] Templates system with variables
- [x] Topics and keyword tracking
- [x] Quality score metrics
- [x] AI Apps marketplace and custom builder
- [x] Developer portal with API playground
- [x] Webhooks management system
- [x] Rate limits dashboard
- [x] Team management with bulk invite
- [x] PWA support (install, offline, push notifications)
- [x] Comprehensive test suites

### In Progress

- [ ] Real-time meeting bot for Zoom/Teams/Meet
- [ ] Enhanced video intelligence with visual analysis
- [ ] Custom model fine-tuning UI
- [ ] Multi-language support expansion

### Planned

- [ ] Desktop application (Electron)
- [ ] Meeting scheduling (Calendly-like)
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





 ---
  Phase 1 Complete: Full Project Analysis

  I've completed a forensic analysis of your Nebula AI project. Here's the comprehensive overview:

  ---
  🏗️ PROJECT ARCHITECTURE

  Monorepo Structure (pnpm workspaces + Turborepo)

  nebula-ai/
  ├── apps/                    # Main applications
  │   ├── api/                 # Express + GraphQL backend (Port 4100)
  │   ├── web/                 # Next.js 14 frontend (Port 4000)
  │   ├── ai-service/          # FastAPI Python ML service (Port 4200)
  │   ├── mobile/              # React Native mobile app
  │   ├── chrome-extension/    # Browser extension
  │   └── realtime-service/    # WebSocket service (Port 4004)
  ├── packages/                # Shared packages
  │   ├── types/               # TypeScript interfaces
  │   ├── utils/               # Shared utilities
  │   └── ui/                  # Shared UI components
  ├── services/                # Independent microservices
  │   ├── analytics/           # Analytics processing
  │   ├── billing/             # Stripe integration
  │   └── notification/        # Multi-channel notifications
  ├── infrastructure/          # DevOps configurations
  │   ├── k8s/                 # Kubernetes manifests
  │   ├── terraform/           # IaC (multi-region)
  │   ├── monitoring/          # Prometheus/Grafana
  │   ├── elk/                 # Logging stack
  │   ├── cloudflare/          # CDN/WAF configs
  │   ├── security/            # Security policies
  │   └── chaos/               # Chaos engineering
  └── docs/                    # Documentation

  ---
  📦 CORE APPLICATIONS

  1. API Server (apps/api/)

  - Stack: Express.js + Apollo GraphQL + Prisma + TypeScript
  - Database: PostgreSQL with pgvector
  - Cache/Queue: Redis + RabbitMQ
  - Search: Elasticsearch
  - Features:
    - 30+ REST API routes (auth, meetings, transcriptions, analytics, billing, etc.)
    - GraphQL API with resolvers
    - WebSocket support (Socket.IO)
    - SCIM 2.0 provisioning
    - SSO integration (SAML, OIDC)
    - Multi-tenant architecture
    - Comprehensive security middleware (DDoS, rate limiting, XSS, SQL injection protection)

  2. Web Frontend (apps/web/)

  - Stack: Next.js 14 (App Router) + React 18 + TypeScript
  - Styling: Tailwind CSS + Radix UI
  - State: Zustand
  - Features:
    - 40+ pages (dashboard, meetings, analytics, settings, etc.)
    - Real-time collaboration
    - Video player with highlights
    - AI-powered search (AskFred)
    - PWA support
    - White-label branding

  3. AI Service (apps/ai-service/)

  - Stack: FastAPI + Python 3.11
  - Real ML: pyannote.audio, spaCy, KeyBERT, OpenAI/Whisper
  - Endpoints:
    - /api/v1/transcribe - Audio transcription (Whisper)
    - /api/v1/summarize - Meeting summarization (GPT-4)
    - /api/v1/sentiment - Sentiment analysis
    - /api/v1/diarize - Speaker diarization (pyannote.audio)
    - /api/v1/extract-entities - NER (spaCy)
    - /api/v1/extract-keywords - Keywords (KeyBERT)
    - /api/v1/chat - RAG-based Q&A
    - /api/v1/analyze-sales-call - Revenue intelligence
    - /api/v1/detect-highlights - Video highlight detection
    - /api/v1/live-analyze - Real-time analysis
    - /api/v1/export-pdf - PDF report generation
    - /api/v1/train-model - Custom model fine-tuning

  4. Mobile App (apps/mobile/)

  - Stack: React Native 0.73 + Redux Toolkit
  - Features: Firebase push notifications, biometric auth, offline support

  5. Chrome Extension (apps/chrome-extension/)

  - Manifest V3 compatible
  - Meeting auto-recording integration

  6. Realtime Service (apps/realtime-service/)

  - Socket.IO server for live transcription/collaboration

  ---
  🔧 SHARED PACKAGES

  | Package       | Purpose                                                     |
  |---------------|-------------------------------------------------------------|
  | @fireff/types | 35+ TypeScript interfaces (User, Meeting, Transcript, etc.) |
  | @fireff/utils | Utilities (formatDuration, debounce, retry, UUID, etc.)     |
  | @fireff/ui    | Shared React UI components                                  |

  ---
  🛠️ INFRASTRUCTURE

  Docker Services (docker-compose.yml)

  | Service       | Port       | Purpose               |
  |---------------|------------|-----------------------|
  | PostgreSQL    | 4001       | Primary database      |
  | Redis         | 4002       | Cache/sessions/queues |
  | Elasticsearch | 4003       | Full-text search      |
  | RabbitMQ      | 5672/15672 | Message broker        |
  | MinIO         | 9000/9001  | S3-compatible storage |
  | Prometheus    | 9090       | Metrics collection    |
  | Grafana       | 4005       | Monitoring dashboards |

  Kubernetes (infrastructure/k8s/)

  - Production deployment configs
  - Multi-region support
  - Postgres/Redis HA configurations
  - ELK stack integration

  Terraform (infrastructure/terraform/)

  - Multi-region IaC (13K+ lines)
  - AWS/GCP cloud provider support

  Monitoring (infrastructure/monitoring/)

  - Prometheus metrics
  - Grafana dashboards
  - Alert configurations

  ---
  📊 DATABASE SCHEMA (Prisma)

  Key Models:
  - User - Authentication, roles, organization membership
  - Organization - Multi-tenant support with branding
  - Meeting - Core meeting entity with participants
  - Transcript - Meeting transcriptions with segments
  - Summary - AI-generated summaries with action items
  - Recording - Audio/video storage references
  - Integration - OAuth connections (Zoom, Teams, Meet, Salesforce, etc.)
  - Subscription - Stripe billing integration
  - ApiKey - Developer API access
  - NotificationPreference - User notification settings
  - Template - Custom summary/report templates
  - Share - Meeting sharing with permissions

  ---
  🔐 SECURITY FEATURES

  - JWT authentication with refresh tokens
  - HTTP-only secure cookies
  - Rate limiting (IP, user, API key based)
  - DDoS protection
  - SQL injection protection
  - XSS protection
  - Helmet.js security headers
  - API key rotation (90-day cycle)
  - SCIM 2.0 user provisioning
  - SSO (SAML, OIDC, Azure AD, Okta)
  - End-to-end encryption options

  ---
  🚀 KEY CAPABILITIES

  1. Real-time Transcription - Whisper-based with speaker diarization
  2. AI Summarization - GPT-4 powered with action items
  3. Revenue Intelligence - Sales call coaching (Gong competitor)
  4. Video Intelligence - Highlight detection, clip creation
  5. AskFred - RAG-based meeting Q&A
  6. Super Summary - Cross-meeting analysis
  7. Integrations - Zoom, Teams, Meet, Slack, Salesforce, HubSpot, Asana, Jira
  8. White-Label - Full branding customization
  9. Self-Hosted - Air-gapped deployment support
  10. Developer API - Full REST + GraphQL access

  ---
  ✅ Phase 1 Complete

  I now have a complete understanding of:
  - All 6 applications and their tech stacks
  - 3 shared packages
  - 3 independent microservices
  - Full infrastructure setup (Docker, K8s, Terraform)
  - Database schema and relationships
  - Security architecture
  - AI/ML capabilities

● ---
  Ready for Phase 2! What tasks would you like me to work on?
