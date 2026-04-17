# syntax=docker/dockerfile:1.7
#
# Production deployment image for Render (or any container host).
#
# This project targets the Cloudflare Workers runtime, so the production
# build is a Worker bundle. To serve it inside a long-running container we
# run Cloudflare's official `workerd` runtime via Wrangler, bound to the
# port Render injects as $PORT (defaults to 8080 locally).

# ---------- Build stage ----------
FROM node:20-slim AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build the SSR bundle
COPY . .
ARG VITE_BACKEND_CORS_ORIGINS=https://admin.askaaron.ai
ENV VITE_BACKEND_CORS_ORIGINS=${VITE_BACKEND_CORS_ORIGINS}

RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Bring in the built artifacts and what wrangler needs at runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# Render sets $PORT at runtime; fall back to 8080 for local `docker run`.
# `wrangler dev --local` runs the production build under workerd (the same
# runtime Cloudflare uses in production) — it is NOT a hot-reload dev server
# when pointed at a built bundle.
CMD ["sh", "-c", "npx wrangler dev dist/server/index.js --ip 0.0.0.0 --port ${PORT:-8080} --local"]
