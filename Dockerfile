# syntax=docker/dockerfile:1.7
#
# Production deployment image.
#
# Plain Vite SPA: build static assets in Node, serve them via nginx with
# SPA history-mode fallback (any unknown path → index.html).

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
FROM nginx:1.27-alpine AS runner

# Render (and most container hosts) inject $PORT at runtime. nginx can't read
# env vars in its config directly, so we template the listen port at boot via
# `envsubst` and then exec nginx in the foreground.
ENV PORT=8080

# Replace the default site with our SPA config (templated; ${PORT} is substituted at boot)
COPY <<'EOF' /etc/nginx/templates/default.conf.template
server {
  listen       ${PORT};
  server_name  _;

  root   /usr/share/nginx/html;
  index  index.html;

  # Long-cache hashed assets emitted by Vite
  location /assets/ {
    access_log off;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }

  # SPA history-mode fallback: any unknown path returns index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Never cache the entry document so deploys are picked up immediately
  location = /index.html {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
  }

  # Basic gzip
  gzip on;
  gzip_types text/plain text/css application/json application/javascript application/xml image/svg+xml;
  gzip_min_length 1024;
}
EOF

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# The official nginx image entrypoint runs `envsubst` over /etc/nginx/templates/*
# and writes the result to /etc/nginx/conf.d/, then starts nginx in the foreground.
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
