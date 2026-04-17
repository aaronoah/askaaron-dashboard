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
ARG VITE_BACKEND_CORS_ORIGINS
ENV VITE_BACKEND_CORS_ORIGINS=$VITE_BACKEND_CORS_ORIGINS

COPY . .

RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install a simple static server
RUN npm install -g serve

# Copy Vite build output only
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Serve static Vite build
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
