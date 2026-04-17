# syntax=docker/dockerfile:1.7
#
# Production deployment image for Render (or any container host).
#
# This is a plain Vite SPA build (index.html + JS bundles). The runtime
# stage simply serves the static `dist/` folder.

# ---------- Build stage ----------
FROM node:20-slim AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build the SPA bundle
COPY . .
ARG VITE_BACKEND_CORS_ORIGINS=https://admin.askaaron.ai
ENV VITE_BACKEND_CORS_ORIGINS=${VITE_BACKEND_CORS_ORIGINS}

RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install a tiny static file server
RUN npm install -g serve

# Copy only the built static assets
COPY --from=builder /app/dist ./dist

EXPOSE 8080

# Render injects $PORT at runtime; fall back to 8080 for local `docker run`.
# `-s` enables SPA fallback so client routes resolve to index.html.
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
