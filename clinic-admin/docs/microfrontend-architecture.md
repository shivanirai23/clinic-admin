# Microfrontend Architecture (Next.js Multi-Zones)

This repo is a monorepo split into independently built and deployed Next.js apps
using Next.js **Multi-Zones**.

```
clinic-admin/
├── clinic-admin/     ← main zone (default): /, /api/*, routes the whole domain
└── auth-zone/        ← /login, /signup       (port 3002, assets under /auth-static)
```

To the user it is still one site on one origin. Under the hood, separate servers
serve different URL namespaces.

## Why Multi-Zones (and not Module Federation)?

| Approach | Verdict for this project |
|---|---|
| Multi-Zones | Officially supported, works with Turbopack/Next 16, path-based splitting |
| Module Federation | The `nextjs-mf` plugin is webpack-only and effectively dead on Next 16/Turbopack |
| iframes / Web Components | Heavy-handed for splitting whole pages |

Multi-Zones implements the core microfrontend ideas — independent build, deploy,
and ownership per slice — by giving each app a set of **paths** instead of
stitching components at runtime.

## How it works

### 1. Each zone is a normal Next.js app

`auth-zone` owns `app/login/page.tsx` and `app/signup/page.tsx` at the same URL
paths they had before. No basePath tricks.

### 2. The zone namespaces its assets (`auth-zone/next.config.ts`)

```ts
assetPrefix: "/auth-static"
```

Both apps would otherwise serve their JS/CSS from `/_next/...` on the same origin
and collide. With the prefix, the zone's assets load from `/auth-static/_next/...`.

### 3. The main app routes the domain (`clinic-admin/next.config.ts`)

```ts
async rewrites() {
  return [
    { source: "/login",              destination: `${AUTH_ZONE_URL}/login` },
    { source: "/signup",             destination: `${AUTH_ZONE_URL}/signup` },
    { source: "/auth-static/:path+", destination: `${AUTH_ZONE_URL}/auth-static/:path+` },
  ];
}
```

Rewrites are server-side proxying — the browser URL stays `yoursite.com/login`;
the main app fetches the response from the zone. `AUTH_ZONE_URL` defaults to
`http://localhost:3002` for local dev.

### 4. Cross-zone links are hard navigations

`next/link` soft-navigates within one app's client router; it cannot reach pages
owned by another zone. So:

- `AuthGuard` redirects to `/login` via `window.location.replace`.
- auth-zone redirects to `/` after a successful login via `window.location.replace`.
- Within auth-zone, soft navigation still works: `/login` ↔ `/signup` keep using
  `router.push` / `next/link`.

### 5. Auth crosses zones for free

Amplify/Cognito stores tokens in `localStorage`, which is per-origin. Both zones
are served from the same origin through the rewrites, so a login in auth-zone is
instantly visible to the main zone. Each zone runs its own `ConfigureAmplify` with
the same pool settings.

## Running locally

```bash
# Terminal 1 — auth zone (port 3002)
cd auth-zone && npm run dev

# Terminal 2 — main app (port 3000)
cd clinic-admin && npm run dev
```

Open http://localhost:3000 — all routes (`/`, `/login`, `/signup`) work as one
site. The auth zone must be running, or those paths will return 500 from the
failed proxy.

## Deploying (Hikigai platform)

The repo is a monorepo; each app deploys as its own platform app pointing at the
**same repo and branch** with a different **Root Directory**:

| Platform app | Root Directory | Port | Env vars to set |
|---|---|---|---|
| main (public URL) | `clinic-admin` | 3000 | `AUTH_ZONE_URL` = `https://auth-zone-6d1073e3.apps.hikigaiplatform.io` (no trailing slash) |
| auth zone | `auth-zone` | 3000 | Cognito vars; uses `PORT` if the platform sets it |

Build command `npm run build`, start command `npm start` for both. On the Hikigai
platform both apps listen on **port 3000** (`auth-zone` uses `PORT` when set).

**Important:** The auth-zone public URL root (`/`) only redirects to `/login`.
Users should use the **clinic-admin** URL for the app; `/login` on clinic-admin
is proxied to auth-zone via middleware + rewrites.

`clinic-admin` middleware reads `AUTH_ZONE_URL` at **server runtime** (not only
at build time), so set it in the platform Environment tab before starting the
main app.

First rollout order:

1. Deploy `auth-zone`, copy its live URL.
2. Set `AUTH_ZONE_URL` in the main app's Environment tab to that URL, then deploy
   the main app. **If this is missing in production, /login and /signup will break**
   since those pages no longer exist in the main app.
3. Only the main app's URL is shared with users — the zone URL exists solely for
   the main app's server-side proxy.

After that, redeploying a zone never requires redeploying the main app, and vice
versa.

## Adding more zones

To add a new zone (e.g. `settings-zone` for `/settings`):

1. Create a new Next.js app folder with its own `package.json`.
2. Set `assetPrefix: "/settings-static"` in its `next.config.ts`.
3. Add rewrites in `clinic-admin/next.config.ts` for the new paths and static assets.
4. Deploy the new zone as a separate platform app with its own root directory and port.
5. Set the zone URL env var on the main app.

Reference implementation: [ai-scribe-web-platform/microfrontend-monorepo](https://github.com/HKG-Inc/ai-scribe-web-platform/tree/microfrontend-monorepo)
(adds a `premium-zone` for `/premium` and `/help`).

## Trade-offs

- **Duplicated shared code**: `shared/ui`, `AuthGuard`, `ConfigureAmplify`, and
  `globals.css` are copied into each zone. Extract into a versioned npm package or
  monorepo workspace when duplication becomes painful.
- **Hard navigations at zone boundaries**: crossing `/` → `/login` reloads the page.
  Group pages frequently visited together into the same zone.
- **Multiple builds and deploys**: independence costs infrastructure.
- **Styling drift risk**: each zone compiles its own Tailwind CSS; keep design
  tokens in `globals.css` in sync.
