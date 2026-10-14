# Publish to GitHub

Use a **standalone repository** whose root is this project (`package.json`, `src/`, `render.yaml` at top level).

Suggested repository name: **`dynomesh-2026`**

## First-time push (from this folder)

```bash
git init
git add .
git commit -m "Initial commit: DynoMesh 2026 physics & robotics marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USER/dynomesh-2026.git
git push -u origin main
```

Replace `YOUR_USER` with your GitHub username.

## What is included

- Application source (`src/`)
- Render blueprint (`render.yaml`)
- `.gitignore` (excludes `node_modules`, `dist`)

## What is not included

- No IDE-specific config
- No local editor metadata
- No parent workspace paths in documentation

## After push

1. Render → **New** → **Blueprint** → select `dynomesh-2026`.
2. Wait for green deploy.
3. Share the Render URL.

## Updates

```bash
git add .
git commit -m "Describe your change"
git push
```

Render rebuilds automatically on push to `main`.
