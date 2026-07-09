# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- Manifests (shared layer for dependency installs) ----
FROM base AS manifests
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

# ---- Full dependencies (build-time, incl. devDependencies) ----
FROM manifests AS deps
RUN npm install --workspace=@vente/api --workspace=@vente/shared --include-workspace-root

# ---- Production-only dependencies (runtime image) ----
FROM manifests AS prod-deps
RUN npm install --omit=dev --workspace=@vente/api --workspace=@vente/shared --include-workspace-root

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared packages/shared
COPY apps/api apps/api
COPY package.json package-lock.json* ./
RUN npm run build -w packages/shared
RUN npm run prisma:generate -w apps/api
RUN npm run build -w apps/api

# ---- Runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -S nodejs && adduser -S nestjs -G nodejs
ENV NODE_ENV=production

COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=nestjs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=nestjs:nodejs /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=prod-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /app/apps/api/uploads && chown nestjs:nodejs /app/apps/api/uploads

USER nestjs
EXPOSE 3001
WORKDIR /app/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
