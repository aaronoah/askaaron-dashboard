# syntax=docker/dockerfile:1.7
#
# Production deployment image for Cloudflare Workers.
#
# This image builds the SSR bundle and ships it to Cloudflare's edge via
# `wrangler deploy`. It is intended to be run once per release (locally or
# from CI) — NOT as a long-running server.
#
# Required environment variables at `docker run` time:
#   CLOUDFLARE_API_TOKEN   API token with "Edit Cloudflare Workers" permission
#   CLOUDFLARE_ACCOUNT_ID  Your Cloudflare account ID
#
# Usage:
#   docker build -t aaron-skill-deploy .
#   docker run --rm \
#     -e CLOUDFLARE_API_TOKEN=xxx \
#     -e CLOUDFLARE_ACCOUNT_ID=yyy \
#     aaron-skill-deploy

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install deps first (better layer caching)
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build the SSR bundle (Cloudflare Workers target)
COPY . .
RUN npm run build

# Default command: deploy the built worker to Cloudflare's edge.
CMD ["npx", "wrangler", "deploy"]
