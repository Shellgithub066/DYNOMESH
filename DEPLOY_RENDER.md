# Deploy DynoMesh 2026 on Render

Static site: Vite build → `dist/`, SPA rewrite to `index.html`.

## 1. GitHub

Create a repository named **`dynomesh-2026`** (or any name) and push **this directory as the repo root** (not a parent monorepo folder). See [GITHUB_PUBLISH.md](./GITHUB_PUBLISH.md).

## 2. Render Blueprint

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Connect the GitHub repository.
3. Confirm `render.yaml` (service name `dynomesh-2026`).
4. Deploy. Live URL example: `https://dynomesh-2026.onrender.com`.

## 3. Manual static site (alternative)

| Setting | Value |
|---------|--------|
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Environment | `NODE_VERSION=22.11.0` |
| Rewrite | `/*` → `/index.html` |

## 4. Verify

After deploy, open:

- `/`
- `/explore?kind=physics`
- `/checkout` (with items in cart)

Deep links must load without 404 (rewrite rule required).

## Notes

- MVP uses browser `localStorage`; no server env vars required.
- GitHub API calls run from the client for public repos.
- Custom domain: Render service → **Settings** → **Custom Domains**.
