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
| `AUTH_ZONE_URL` | main only | Live URL of the auth-zone deployment |

## Reference

This setup mirrors [ai-scribe-web-platform/microfrontend-monorepo](https://github.com/HKG-Inc/ai-scribe-web-platform/tree/microfrontend-monorepo).
