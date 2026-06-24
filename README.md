# HIKIGAI Clinic Admin

Monorepo microfrontend setup using Next.js **Multi-Zones**. Multiple independently
built and deployed Next.js apps appear as one site on a single origin.

## Structure

```
clinic-admin/          ← main zone (port 3000): dashboard, API routes, domain router
auth-zone/             ← auth zone (port 3002): /login, /signup
```

See [clinic-admin/docs/microfrontend-architecture.md](clinic-admin/docs/microfrontend-architecture.md)
for the full architecture guide.

## Quick start

```bash
# Install dependencies for each zone
cd auth-zone && npm install
cd ../clinic-admin && npm install

# Run both zones (separate terminals)
cd auth-zone && npm run dev      # port 3002
cd clinic-admin && npm run dev   # port 3000
```

Open http://localhost:3000

## Environment variables

Set these in each zone (or in the platform Environment tab per app):

| Variable | Zones | Description |
|---|---|---|
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | all | Cognito user pool ID |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | all | Cognito app client ID |
| `NEXT_PUBLIC_COGNITO_DOMAIN` | all | Cognito Hosted UI domain (no `https://`) |
| `AUTH_ZONE_URL` | clinic-admin | Live URL of auth-zone (e.g. `https://auth-zone-6d1073e3.apps.hikigaiplatform.io`) |
| `HIKIGAI_API_KEY` | clinic-admin | Main platform API key (appointments, agents, IDEXX) |
| `HIKIGAI_PROJECT_ID` | clinic-admin | Main platform project ID |
| `HIKIGAI_PLATFORM_URL` | clinic-admin | Platform URL for auth exchange (default `https://hikigaiplatform.io`) |
| `HIKIGAI_API_BASE_URL` | clinic-admin | API host (default `https://backend.hikigaiplatform.io`) |
| `HIKIGAI_BADGES_API_KEY` | clinic-admin | Separate API key for QR badge / Identity user management |
| `HIKIGAI_BADGES_PROJECT_ID` | clinic-admin | Project ID for badge Identity pool (e.g. `8cfdec39-d728-4f2b-b9ca-99bc02b5ab3a`) |
| `HIKIGAI_BADGES_APP_ID` | clinic-admin | App ID for badge issuance (e.g. `bc10f7fa-729d-4624-ba71-9899d02d17cc`) |

## Reference

This setup mirrors [ai-scribe-web-platform/microfrontend-monorepo](https://github.com/HKG-Inc/ai-scribe-web-platform/tree/microfrontend-monorepo).
