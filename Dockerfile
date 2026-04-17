# syntax=docker/dockerfile:1.7

# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build the SSR bundle (Cloudflare Workers target)
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
# This project targets the Cloudflare Workers runtime. The simplest way to run
# it inside a container is via Wrangler, which spins up a local Workers
# runtime (workerd) on the specified port.
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Bring in the built artifacts and what wrangler needs at runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# Serve the built worker locally on 0.0.0.0:8080 inside the container.
# For real Cloudflare deployment, run `npx wrangler deploy` from your CI/host
# instead of running this image.
CMD ["npx", "wrangler", "dev", "--ip", "0.0.0.0", "--port", "8080", "--local"]
