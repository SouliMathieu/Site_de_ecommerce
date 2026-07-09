# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Manifests (shared layer for dependency installs) ----
FROM base AS manifests
COPY package.json package-lock.json* ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

# ---- Dependencies ----
FROM manifests AS deps
RUN npm install --workspace=@vente/web --workspace=@vente/shared --include-workspace-root

# ---- Build ----
FROM base AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared packages/shared
COPY apps/web apps/web
COPY package.json package-lock.json* ./
RUN npm run build -w packages/shared
RUN npm run build -w apps/web

# ---- Runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
ENV NODE_ENV=production

COPY --from=build /app/apps/web/public ./public
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
