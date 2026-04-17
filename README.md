# Aaron.skill

A conversational portfolio chat experience built with TanStack Start, React 19, Tailwind CSS v4, and shadcn/ui — chat with a "distilled" version of Aaron right from the browser.

> Built and edited on [Lovable](https://lovable.dev). The project URL is: https://lovable.dev/projects/8f461a9b-eda5-4268-a06f-d3c953897ce7

---

## ✨ Tech stack

- **Framework**: [TanStack Start](https://tanstack.com/start) v1 (SSR + file-based routing) on top of **Vite 7**
- **UI**: **React 19**, **Tailwind CSS v4**, **shadcn/ui** (Radix primitives)
- **State / Data**: TanStack Router + TanStack Query
- **Forms / Validation**: React Hook Form + Zod
- **Deployment target**: Cloudflare Workers (via `@cloudflare/vite-plugin`)

---

## 🚀 Getting started (local development)

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (or `bun` / `pnpm` if you prefer — examples below use npm)
- **Git**

### 1. Clone the repo

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:8080** (or whichever port Vite reports). The dev server supports hot module replacement — changes to files in `src/` reload instantly.

---

## 📜 Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Production build (SSR bundle for Cloudflare Workers). |
| `npm run build:dev` | Build using the `development` mode (useful for debugging prod issues). |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |
| `npm run format` | Format the codebase with Prettier. |

---

## 🗂 Project structure

```
src/
├── components/        # Reusable UI components
│   ├── chat/          # Chat panel, sidebar, message bubbles
│   └── ui/            # shadcn/ui primitives (button, dialog, ...)
├── hooks/             # Custom React hooks
├── lib/               # Utilities, fake AI, chat store, consent
├── routes/            # File-based routes (TanStack Router)
│   ├── __root.tsx     # Root layout (html/head/body shell)
│   └── index.tsx      # Home (chat) page
├── router.tsx         # Router setup
├── routeTree.gen.ts   # AUTO-GENERATED — do not edit
└── styles.css         # Tailwind v4 entrypoint + design tokens
```

### Adding a new page

Create a file under `src/routes/` (e.g. `src/routes/about.tsx`). The TanStack Router Vite plugin will pick it up automatically and regenerate `routeTree.gen.ts`.

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: () => <div>About</div>,
});
```

---

## 🎨 Design system

Colors, spacing, and typography tokens live in `src/styles.css` as CSS custom properties (using `oklch`). Always reference semantic tokens (e.g. `bg-background`, `text-ink`) rather than hardcoding colors in components.

---

## ☁️ Deployment

### Option A — Deploy with Lovable (recommended)

1. Open the project in [Lovable](https://lovable.dev/projects/8f461a9b-eda5-4268-a06f-d3c953897ce7).
2. Click **Publish** (top-right of the editor).
3. Your app goes live at `https://<your-project>.lovable.app`.

**Notes:**
- **Frontend changes** require clicking **Update** in the publish dialog to ship.
- **Backend changes** (server functions, migrations) deploy automatically.
- To attach a custom domain, go to **Project Settings → Domains** after the first publish.

### Option B — Self-host on Cloudflare Workers

The project is preconfigured for Cloudflare Workers via `wrangler.jsonc`.

```bash
# 1. Build the SSR bundle
npm run build

# 2. Deploy with Wrangler (requires a Cloudflare account)
npx wrangler deploy
```

See the [Lovable self-hosting guide](https://docs.lovable.dev/tips-tricks/self-hosting) for the full walkthrough, including environment variables and DNS.

### Option C — Docker (deploy to Render)

A `Dockerfile` is included at the repo root. It builds the SSR bundle and runs it inside a container using Cloudflare's official `workerd` runtime (the same runtime Cloudflare uses in production), bound to the port Render injects as `$PORT`.

**Deploy on Render:**

1. Push this repo to GitHub.
2. In the [Render dashboard](https://dashboard.render.com/), create a new **Web Service** → **Build and deploy from a Git repository**.
3. Choose the **Docker** runtime (Render auto-detects the `Dockerfile`).
4. No build/start commands needed — the `Dockerfile` handles both.
5. Click **Create Web Service**. Render builds the image, runs the container, and exposes it on a public URL.

**Run locally:**

```bash
# 1. Build the image
docker build -t aaron-skill .

# 2. Run it (app available at http://localhost:8080)
docker run --rm -p 8080:8080 aaron-skill
```

**Notes:**
- Render injects `$PORT` automatically; the container respects it and falls back to `8080` for local runs.
- To inject env vars (e.g. API keys), use Render's **Environment** tab, or pass `-e KEY=value` to `docker run` locally.

---

## 🛠 Troubleshooting

- **Port already in use** → stop other dev servers or run with `vite dev --port 3000`.
- **Type errors after adding a route** → restart `npm run dev` so the router plugin regenerates `routeTree.gen.ts`.
- **Styles not updating** → make sure your class is referenced in source files; Tailwind v4 only generates utilities it sees.

---

## 📄 License

MIT — feel free to fork and remix.
