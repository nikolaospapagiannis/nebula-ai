FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for monorepo
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/

# Install root deps then web deps
RUN npm install --ignore-scripts --legacy-peer-deps 2>/dev/null; \
    cd apps/web && npm install --ignore-scripts --legacy-peer-deps 2>/dev/null; \
    exit 0

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/turbo.json ./

# Copy source code
COPY apps/web ./apps/web
COPY apps/api/prisma ./apps/api/prisma
COPY turbo.json ./

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client (web uses @prisma/client with API's schema)
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

# Build application
WORKDIR /app/apps/web
RUN npx next build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package*.json ./apps/web/
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/

USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Start Next.js
WORKDIR /app/apps/web
CMD ["../../node_modules/.bin/next", "start"]
