# Campus Connect

Next.js 15, React 19, TypeScript, and Tailwind. The interface follows a restrained social-feed layout with dark mode, responsive navigation, accessible dialogs, and reduced-motion support.

## Run locally

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Enter any nonempty registration number to continue. This temporary access selects an unverified browser-local profile; it is not production authentication. No password is collected and no password-reset flow is exposed.

The application starts without sample accounts, photos, posts, clubs, events, notifications, or simulated replies. Only entered profiles and user-created content appear. Browser data uses `cc_app_` keys; prior `cc_mock_` sample storage is isolated and left untouched. Fixture-backed data is retained only for legacy tests.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

## GitHub Pages Deployment

This project is configured for automated static deployment to GitHub Pages via GitHub Actions:
- Static HTML export is configured in `next.config.ts` with `output: "export"`, `trailingSlash: true`, and automatic base path handling (`/Campus-connect`).
- GitHub Actions workflow is defined in `.github/workflows/deploy.yml` which builds and publishes the site on pushes to `main`.
- To activate: in GitHub repository **Settings** -> **Pages**, set **Source** to **GitHub Actions**.

New UI tests cover search race handling, registration access, draft retention, incoming requests, comments, and bookmarks. Store tests cover blank initialization, session persistence, and storage failure recovery. Existing `tests/e2e` suites exercise an independent harness; they are not browser tests. Real browser verification scripts and screenshots are in `output/playwright/`.

## Backend status

The supplied `backend` branch contains Supabase schema, password-based production authentication, profile/feed reads, and media upload routes. Its local fixes are isolated in the sibling `Campus-connect-backend-review` worktree on `codex/backend-integration-fixes` so they do not overwrite this UI or existing uncommitted files.

The temporary registration-only frontend is intentionally not connected to Supabase authentication. Remote post/comment/reaction/bookmark writes, search, messaging, notifications, and club/event APIs still need completion before replacing the browser store. Never send the unverified registration-only identity to production as authentication.
