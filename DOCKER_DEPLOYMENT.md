# 🐳 Docker Deployment Guide - FireFF v2

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 8GB RAM available
- 20GB free disk space

---

## 🚀 Deploy Full System

### Step 1: Clone and Navigate
```bash
cd G:/fireff-v2
```

### Step 2: Configure Environment
```bash
# Edit .env file with your API keys
notepad .env

# REQUIRED: Add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

### Step 3: Start All Services
```bash
docker-compose -f docker-compose.prod.yml up -d
```

This will start:
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ MongoDB (port 27017)
- ✅ MinIO S3 (ports 9000, 9001)
- ✅ API Service (port 4000)
- ✅ Web Frontend (port 3000)
- ✅ AI Service (port 8000)
- ✅ WebSocket Service (port 3002)

---

## 🔍 Verify Deployment

### Check All Services Running
```bash
docker-compose -f docker-compose.prod.yml ps
```

Expected output:
```
NAME                 STATUS    PORTS
fireff-api           Up        0.0.0.0:4000->4000/tcp
fireff-web           Up        0.0.0.0:3000->3000/tcp
fireff-ai-service    Up        0.0.0.0:8000->8000/tcp
fireff-realtime      Up        0.0.0.0:3002->3002/tcp
fireff-postgres      Up        0.0.0.0:5432->5432/tcp
fireff-redis         Up        0.0.0.0:6379->6379/tcp
fireff-mongodb       Up        0.0.0.0:27017->27017/tcp
fireff-minio         Up        0.0.0.0:9000-9001->9000-9001/tcp
```

### Check Service Health
```bash
# API Health
curl http://localhost:4000/health

# AI Service Health
curl http://localhost:8000/health

# PostgreSQL
docker exec fireff-postgres pg_isready -U fireflies

# Redis
docker exec fireff-redis redis-cli -a redis123 ping

# MongoDB
docker exec fireff-mongodb mongosh --eval "db.adminCommand('ping')"
```

---

## 📱 Access the Application

### Main Services
- **Web Frontend**: http://localhost:3000
- **API Backend**: http://localhost:4000
- **AI Service**: http://localhost:8000
- **WebSocket**: ws://localhost:3002

### Admin Panels
- **MinIO Console**: http://localhost:9001
  - Username: `fireflies`
  - Password: `minio123456`

### Database Access
- **PostgreSQL**:
  - Host: `localhost:5432`
  - User: `fireflies`
  - Password: `fireflies123`
  - Database: `fireflies_db`

- **MongoDB**:
  - Host: `localhost:27017`
  - User: `fireflies`
  - Password: `mongo123`
  - Database: `fireflies_transcripts`

- **Redis**:
  - Host: `localhost:6379`
  - Password: `redis123`

---

## 🧪 Test the System

### 1. Create First User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fireflies.test",
    "password": "Admin123!",
    "name": "Admin User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fireflies.test",
    "password": "Admin123!"
  }'
```

### 3. Access Web UI
Open browser: http://localhost:3000

---

## 🔧 Management Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f web
docker-compose -f docker-compose.prod.yml logs -f ai-service
```

### Restart Services
```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

### Stop All Services
```bash
docker-compose -f docker-compose.prod.yml down
```

### Stop and Remove All Data
```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Rebuild After Code Changes
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🐛 Troubleshooting

### Issue: Services Won't Start
```bash
# Check Docker is running
docker ps

# Check Docker resources
docker system df

# Free up space if needed
docker system prune -a
```

### Issue: Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Issue: Database Connection Fails
```bash
# Wait for health checks
docker-compose -f docker-compose.prod.yml ps

# Check database logs
docker logs fireff-postgres
docker logs fireff-mongodb
```

### Issue: API Returns 500 Errors
```bash
# Check API logs
docker logs fireff-api

# Check if database is ready
docker exec fireff-postgres pg_isready

# Restart API
docker-compose -f docker-compose.prod.yml restart api
```

---

## 📊 Resource Usage

### Expected Resource Consumption
- **CPU**: 2-4 cores
- **RAM**: 6-8GB
- **Disk**: 10GB (+ storage for recordings)

### Monitor Resource Usage
```bash
docker stats
```

---

## 🔐 Security Notes

### ⚠️ BEFORE PRODUCTION DEPLOYMENT

1. **Change ALL Passwords**
   ```bash
   # Edit .env file
   POSTGRES_PASSWORD=<strong-random-password>
   REDIS_PASSWORD=<strong-random-password>
   MONGO_PASSWORD=<strong-random-password>
   JWT_SECRET=<32-character-random-secret>
   ENCRYPTION_KEY=<32-character-hex-key>
   ```

2. **Generate Secure Secrets**
   ```bash
   # JWT Secret (32+ characters)
   openssl rand -base64 32

   # Encryption Key (32 hex characters)
   openssl rand -hex 32
   ```

3. **Restrict Network Access**
   - Only expose necessary ports (3000, 4000)
   - Keep database ports internal
   - Use reverse proxy (nginx) for SSL

4. **Enable SSL/TLS**
   - Add SSL certificates
   - Configure HTTPS
   - Update CORS settings

---

## 📦 Data Persistence

### Data Volumes
All data is persisted in Docker volumes:
- `postgres_data` - User data, meetings, settings
- `mongodb_data` - Transcripts
- `redis_data` - Cache, sessions
- `minio_data` - Audio/video files

### Backup Data
```bash
# Backup PostgreSQL
docker exec fireff-postgres pg_dump -U fireflies fireflies_db > backup.sql

# Backup MongoDB
docker exec fireff-mongodb mongodump --out /backup

# Backup MinIO
docker exec fireff-minio mc mirror /data /backup
```

### Restore Data
```bash
# Restore PostgreSQL
docker exec -i fireff-postgres psql -U fireflies fireflies_db < backup.sql

# Restore MongoDB
docker exec fireff-mongodb mongorestore /backup
```

---

## 🎯 Production Checklist

- [ ] Change all default passwords in .env
- [ ] Add real OpenAI API key
- [ ] Configure SSL certificates
- [ ] Set up reverse proxy (nginx)
- [ ] Configure backup strategy
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure log aggregation
- [ ] Set resource limits in docker-compose
- [ ] Enable firewall rules
- [ ] Document disaster recovery plan

---

## 📞 Support

### View Service Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Get Service Logs
```bash
docker-compose -f docker-compose.prod.yml logs <service-name>
```

### Access Service Shell
```bash
docker exec -it fireff-api sh
docker exec -it fireff-postgres psql -U fireflies
docker exec -it fireff-mongodb mongosh
```

---

**Deployment Date**: 2025-11-14
**Version**: 1.0.0
**Status**: Ready for deployment
