# ==============================================================================
# EZWATY ERP (عزوتي) - PRODUCTION MULTI-STAGE DOCKERFILE
# Supports both CLOUD (Multi-Tenant) and ON_PREMISE (Local Single-Tenant)
# ==============================================================================

# STAGE 1: Build Frontend SPA
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# STAGE 2: Production Container
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets
COPY --from=frontend-builder /app/dist ./dist
# Copy backend source
COPY server.ts ./
COPY tsconfig.json ./

EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Launch application
CMD ["npm", "run", "start"]
