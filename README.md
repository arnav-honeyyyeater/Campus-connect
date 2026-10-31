# Campus Connect backend

This is the Next.js/Supabase backend foundation for Campus Connect. It implements the architecture supplied in the backend handoff: registration-number authentication, Supabase RLS, private media processing, and realtime-ready social data.

## What is included

- A complete first Supabase migration: identity, profiles, social graph, posts/polls, clubs/events, messaging, creations, notifications, rate limits, private storage, RLS, and realtime publication.
- Automatic account provisioning after a Supabase Auth user is created.
- Registration-number auth routes with `.invalid` internal aliases:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Profile and feed routes:
  - `GET` / `PATCH /api/profile`
  - `GET /api/feed?tab=campus|friends|clubs&cursor=&limit=20`
- Secure media routes:
  - `POST /api/uploads/session`
  - `POST /api/uploads/finalize`

## Local setup

1. Copy `.env.example` to `.env.local` and fill in a Supabase project's values.
2. Install dependencies with `npm install`.
3. Initialize Supabase locally with `npx supabase init`, then run `npx supabase start`.
4. Apply the migration with `npx supabase db reset` locally, or `npx supabase db push` against the linked staging project.
5. In Supabase Auth, disable public email signup. Configure the site's redirect URLs before enabling recovery email.
6. Run `npm run dev`.

## Important production configuration

- Use Node.js 24 on Vercel and deploy in the Mumbai region where available.
- Set every variable in `.env.example`; the service-role key must remain server-only.
- Keep the `quarantine` and `media` buckets private.
- Run the storage-cleanup maintenance job before opening uploads to students.

The frontend can now use the listed endpoint contracts. Upload the UI next and its mocked data can be replaced incrementally with these APIs.
