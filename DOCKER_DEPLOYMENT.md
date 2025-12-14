# 🐳 Docker Deployment Guide - Nebula AI

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- At least 8GB RAM available
- 20GB free disk space

---

## 🚀 Deploy Full System

### Step 1: Clone and Navigate
```bash
cd G:/nebula
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
nebula-api           Up        0.0.0.0:4000->4000/tcp
nebula-web           Up        0.0.0.0:3000->3000/tcp
nebula-ai-service    Up        0.0.0.0:8000->8000/tcp
nebula-realtime      Up        0.0.0.0:3002->3002/tcp
nebula-postgres      Up        0.0.0.0:5432->5432/tcp
nebula-redis         Up        0.0.0.0:6379->6379/tcp
nebula-mongodb       Up        0.0.0.0:27017->27017/tcp
nebula-minio         Up        0.0.0.0:9000-9001->9000-9001/tcp
```

### Check Service Health
```bash
# API Health
curl http://localhost:4000/health

# AI Service Health
curl http://localhost:8000/health

# PostgreSQL
docker exec nebula-postgres pg_isready -U nebula

# Redis
docker exec nebula-redis redis-cli -a redis123 ping

# MongoDB
docker exec nebula-mongodb mongosh --eval "db.adminCommand('ping')"
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
  - Username: `nebula`
  - Password: `minio123456`

### Database Access
- **PostgreSQL**:
  - Host: `localhost:5432`
  - User: `nebula`
  - Password: `nebula123`
  - Database: `nebula_db`

- **MongoDB**:
  - Host: `localhost:27017`
  - User: `nebula`
  - Password: `mongo123`
  - Database: `nebula_transcripts`

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
    "email": "admin@nebula.test",
    "password": "Admin123!",
    "name": "Admin User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nebula.test",
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
docker logs nebula-postgres
docker logs nebula-mongodb
```

### Issue: API Returns 500 Errors
```bash
# Check API logs
docker logs nebula-api

# Check if database is ready
docker exec nebula-postgres pg_isready

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
docker exec nebula-postgres pg_dump -U nebula nebula_db > backup.sql

# Backup MongoDB
docker exec nebula-mongodb mongodump --out /backup

# Backup MinIO
docker exec nebula-minio mc mirror /data /backup
```

### Restore Data
```bash
# Restore PostgreSQL
docker exec -i nebula-postgres psql -U nebula nebula_db < backup.sql

# Restore MongoDB
docker exec nebula-mongodb mongorestore /backup
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
docker exec -it nebula-api sh
docker exec -it nebula-postgres psql -U nebula
docker exec -it nebula-mongodb mongosh
```

---

**Deployment Date**: 2025-11-14
**Version**: 1.0.0
**Status**: Ready for deployment
