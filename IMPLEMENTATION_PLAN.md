# Campus Connect — Detailed Implementation and Agent Plan

**Repository:** https://github.com/arnav-honeyyyeater/Campus-connect

**Planning branch:** `plan`

**Planning baseline:** 31 October 2026

**Status:** Implementation specification; application implementation has not started.

## 1. Summary and confirmed product decisions

Build a polished, mobile-first social web app for Christ Lavasa students. The first release includes a campus feed, friends, private messaging, clubs, events, polls, notifications, and a manual sticker and meme studio.

Deploy the application on **Vercel**, with **Supabase** providing authentication, PostgreSQL, private file storage, and Realtime.

The initial project inspection found no application or Git repository. Node.js 24 and npm were available; Docker was not installed. Those are authoring-machine observations, not assumptions about another agent's environment. The repository is initialized with this planning document before application scaffolding.

### Confirmed decisions

| Area | Decision |
|---|---|
| Working name | Campus Connect |
| Campus | Christ Lavasa only |
| Intended audience | Students aged 16+ |
| Pilot size | 100–500 users |
| First-release scope | Broad social and creative release |
| Visual direction | Fresh, clean, playful; warm white surfaces and lime/coral accents |
| Login | Registration number and a separate Campus Connect password |
| Signup | Self-entered registration number; immediate access |
| Activation | No invitations, activation codes, roster checks, or mandatory email confirmation |
| Registration ownership | Self-declared; the first account to claim an unused number owns that app login |
| Recovery email | Optional; added and verified later in settings |
| Direct messaging | Mutual friends only |
| Group messaging | Invitation and acceptance required |
| Creator tools | Manual editor; no paid AI dependency |
| Platform | Responsive web app; native mobile apps excluded from this release |

**Important product distinction:** authentication protects campus content from signed-out visitors, but self-entered registration numbers do not establish that someone is a Christ Lavasa student. Do not label accounts “college verified” or imply an official college integration.

### Definition of a successful first release

A student can:

1. Create an account using an unused registration number and password.
2. Enter the app immediately and complete a profile.
3. Publish a post, image, poll, or meme.
4. Find classmates by display name or handle.
5. Become mutual friends and exchange private messages.
6. Share GIFs, provider stickers, and custom stickers.
7. Create, save, publish, and reuse a sticker pack.
8. Join a club and discover or RSVP to its events.
9. Receive relevant in-app notifications.
10. Block another account, report content, and manage privacy.
11. Add a verified recovery email without changing their registration-number login.

Every capability must work against the real Supabase backend. Mock data is permitted for development fixtures, never as a substitute for production behavior.

## 2. Product experience and feature specifications

### 2.1 Visual direction

The app should feel like a lively student space with disciplined navigation and typography.

| Element | Implementation direction |
|---|---|
| Main background | Warm white, approximately `#FAFAF6` |
| Primary text | Deep green-black, approximately `#20241E` |
| Supporting text | Muted green-gray with verified AA contrast |
| Primary accent | Lime, approximately `#D9F36B`, paired with dark text |
| Secondary accent | Coral for selected creative details and highlights |
| Typography | Plus Jakarta Sans; restrained weights and fluid headings |
| Spacing | A coherent 4/8px rhythm |
| Shape | Soft corners; reserve pill shapes for tags and compact controls |
| Surfaces | Subtle borders and restrained shadows |
| Motion | Mostly 150–250ms feedback; respect reduced motion |
| Signature detail | Sticker-like graphics concentrated in creation, onboarding, and empty states |
| Themes | Light, dark, and system preference; light is the initial default |

Use familiar social-app layouts for reading and messaging. Spend visual experimentation on the studio, profile customization, and carefully composed empty states.

Do not add decorative WebGL, scroll hijacking, or heavy animation to core app screens.

### 2.2 Navigation and routes

**Mobile navigation:** Feed, Discover, Create, Messages, Profile.

“Create” opens a choice between Post, Poll, Meme, and Sticker. Notifications remain accessible from the header.

**Desktop navigation:** persistent left sidebar, central content, and an optional contextual right rail. Messaging and the editor can use the available width.

| Route | Purpose |
|---|---|
| `/` | Redirect signed-in users to the feed; show a compact welcome screen otherwise |
| `/login` | Registration-number login |
| `/signup` | Immediate account creation |
| `/forgot-password` | Recovery request |
| `/auth/confirm` | Supabase email confirmation/recovery callback |
| `/reset-password` | Set a new password from a recovery session |
| `/onboarding` | Optional profile completion after account creation |
| `/feed` | Campus, Friends, and My Clubs tabs |
| `/posts/[id]` | Post and comments |
| `/discover` | People, clubs, and events |
| `/people/[handle]` | Student profile |
| `/messages` | Conversation list |
| `/messages/[id]` | Direct or group conversation |
| `/clubs` and `/clubs/[slug]` | Club discovery and club page |
| `/events` and `/events/[id]` | Event discovery and details |
| `/studio` | Meme and sticker creation |
| `/studio/[id]` | Edit an owned creation |
| `/packs/[id]` | Sticker pack details |
| `/saved` | Bookmarked posts and saved packs |
| `/notifications` | Notification inbox |
| `/settings` | Account, recovery email, theme, privacy, and deletion |
| `/admin` | Restricted moderation and campus administration |

Signed-out requests must not expose profiles, posts, chat metadata, or media through page HTML, metadata, or APIs.

### 2.3 Account and profile experience

**Signup fields**

- Registration number.
- Password and confirmation.
- Confirmation that the user is at least 16.
- Acceptance of the current terms and privacy notice.

No email or account activation is required.

After successful signup, start a session immediately. Offer profile completion with an explicit skip action.

**Profile fields**

- Display name.
- Unique handle.
- Avatar.
- Bio, maximum 160 characters.
- Optional course, year, and interests.

Registration numbers and recovery emails must not appear in student profiles, people search, URLs, or notifications.

**Settings**

- Change password.
- Add or change recovery email.
- Show recovery state: not added, awaiting verification, or verified.
- Theme and reduced-animation preference.
- Notification preferences.
- Optional read receipts, disabled initially.
- Blocked accounts.
- Export personal account data.
- Delete account.

### 2.4 Feed, comments, polls, and bookmarks

| Capability | First-release behavior |
|---|---|
| Campus feed | Newest accessible campus posts first |
| Friends feed | Posts from accepted friends |
| My Clubs | Posts from clubs the user has joined |
| Post types | Text, images, provider GIF/sticker, custom creation, or poll |
| Text limit | 2,000 characters |
| Images | Up to four sanitized images per post |
| Editing | Authors can edit their own text and attachment selection |
| Deletion | Authors can remove their own posts |
| Comments | Flat comments; replies can reference another commenter without nested threads |
| Reactions | A small fixed emoji set; one current reaction per user per post |
| Bookmarks | Private to the account |
| Polls | Single choice, 2–6 options, closing time, aggregated results |
| Pinned notices | Campus admins can pin a small number of announcements |
| Pagination | Cursor-based, 20 posts per page |

Poll options cannot change after the first vote. Users may change their vote before closing. The database must enforce one vote per account and reject votes after closure.

Persist posts before showing them as published. On recoverable failures, retain the composer content and provide a retry action.

### 2.5 Friends and discovery

Implement:

- People search by handle and display name.
- Send, cancel, accept, and reject friend requests.
- Remove a friendship.
- Block and unblock.
- Discover clubs and upcoming events.

Prevent duplicate requests, self-friendship, and simultaneous crossed requests from creating two friendships.

Do not add address-book uploads, phone-number discovery, precise location, or registration-number search.

### 2.6 Messaging

**Direct conversations**

- Creation requires an accepted friendship.
- Only one direct conversation exists per pair.
- Removing the friendship prevents further messages.
- Historical conversation access remains available unless blocking or moderation removes access.

**Group conversations**

- Any active student can create a group.
- Invite only accepted friends.
- Invitees must accept before accessing messages.
- Maximum 30 participants for the pilot.
- The creator manages invitations, removal, and group details.
- Participants can leave.
- Ownership must transfer before the owner leaves a non-empty group.

**Message types**

- Text, maximum 4,000 characters.
- One uploaded image.
- One custom sticker.
- One provider GIF or sticker.

Include message reactions, unread counts, optional read receipts, retryable failed sends, and message deletion by its author.

Use a client-generated message UUID as an idempotency key so retries cannot duplicate a message.

Keep server persistence authoritative. Realtime delivers updates after a successful database write; it does not replace message storage.

Typing indicators, voice messages, calls, and disappearing messages are excluded from this release.

### 2.7 Clubs and events

**Clubs**

- Campus-visible club directory.
- Student-created clubs with name, description, cover image, and category.
- Open join and leave.
- Owner and organizer roles.
- Club feed and event list.
- Owner can manage organizers and moderate club content.
- Student-run clubs must not receive an “official college” badge automatically.

All first-release clubs are visible to signed-in campus accounts. Private communities are handled through invited group conversations.

**Events**

- Campus admins and club organizers can create events.
- Fields: title, description, cover, start/end time, venue, and optional HTTPS registration link.
- RSVP states: Going, Interested, or neither.
- Show updates and cancellation clearly.
- Store timestamps in UTC; display in `Asia/Kolkata`.
- Offer calendar download.
- No ticket payments, seat inventory, or paid bookings.

### 2.8 Manual meme and sticker studio

The studio is a central product feature and must work well on touch devices.

**Supported inputs**

- User-uploaded PNG, JPEG, or WebP.
- Original built-in layouts and decorative assets.
- Existing creations owned by the current user.

Provider GIFs remain a sharing feature; do not import provider media into the editing canvas or assume remix rights.

**Editor tools**

- Crop and reposition the base image.
- Square, portrait, and landscape meme layouts.
- Transparent sticker canvas.
- Polygon cutout with editable points.
- Text layers: content, size, color, alignment, and outline.
- Emoji and a small original decorative-shape collection.
- Layer ordering, duplicate, delete, rotate, and scale.
- Undo and redo for the last 20 operations.
- Fit-to-screen and zoom controls.
- Reset with confirmation when changes would be lost.

Limit the scene to 20 layers and one uploaded base image per creation.

Provide ordinary controls for editing layer position and size, so dragging is not the only interaction method. Polygon points must also be editable through a keyboard-accessible list.

**Outputs**

| Output | Specification |
|---|---|
| Sticker | Transparent PNG, 512×512, maximum 1MB after processing |
| Meme | Static image, maximum 1,600px on the longest edge and 2MB |
| Editable draft | Versioned editor JSON and a private original asset |
| Sticker pack | Up to 30 owned stickers, with title, cover, and explicit campus publication |
| Download | Export the user's own completed creation |
| Share | Attach to a post or eligible conversation |

Drafts are private. Publishing a pack makes its included stickers available within the signed-in campus community.

Saving a pack adds a reference to it; it does not create an unrestricted duplicate of its files.

Use account-scoped IndexedDB for local draft recovery. Clear local account data on logout and never expose another account's drafts on a shared device.

### 2.9 GIF and provider sticker integration

Use **GIPHY as the first provider**, with a small browser integration module.

- Search and trending tabs.
- Separate GIF and sticker tabs.
- Request `rating=g`.
- Debounce search by approximately 350ms and cancel superseded requests.
- Store provider IDs, not provider media files or media URLs.
- Resolve saved IDs when displaying content.
- Preserve provider attribution and returned URLs.
- Keep provider results separate from custom sticker packs.
- Show a usable unavailable state for removed content, outages, or quota exhaustion.

GIPHY requires client-side requests and prohibits proxying and caching its API responses or media. Production access requires its approval process; beta keys are limited to 100 calls per hour. Treat production access and pricing as a release dependency. [GIPHY documentation](https://developers.giphy.com/docs/api/)

Do not implement Tenor: its API was retired on June 30, 2026. [Google's retirement notice](https://support.google.com/tenor/answer/10455265?hl=en)

### 2.10 Notifications

Provide in-app notifications for:

- Friend requests and acceptance.
- Comments and reactions on the user's posts.
- Group invitations.
- New messages and conversation unread state.
- Significant updates to events the user follows.
- Moderation decisions affecting the account or its content.

Do not notify users about their own actions. Suppress notifications from blocked accounts and inaccessible content.

Notification text must avoid exposing private message bodies. Opening a notification must re-check access to the destination.

Browser push and routine email notifications are deferred.

### 2.11 Blocking, reporting, and moderation

**Blocking**

- Removes the friendship.
- Stops direct messaging and new invitations.
- Hides the blocked account's posts, comments, and discovery results.
- Hides its messages from the blocker in existing shared groups.
- Suppresses related notifications.
- Does not delete content for unrelated group participants.

**Reporting**

Allow reports against accounts, posts, comments, messages, and published packs.

Categories: harassment, impersonation, sexual content, hate, spam, copyright, and other.

A report must reference content the reporter could access when reporting. Users cannot submit fabricated references to another private conversation.

**Moderation**

- Queue with status, category, timestamps, and evidence.
- Remove content, dismiss reports, warn, suspend, or ban.
- Record who acted, why, and when.
- Restrict moderators to reported private-message evidence; no general private-chat browser.
- Keep club organizers' authority limited to their own clubs.
- Provision campus admin roles through a trusted maintenance process; never from editable profile metadata.

## 3. Architecture, data model, and shared contracts

### 3.1 Stack

| Layer | Choice |
|---|---|
| Application | Next.js App Router, React, TypeScript |
| Runtime | Node.js 24 |
| Package manager | npm with committed lockfile |
| Styling | Tailwind CSS and shared CSS tokens |
| Accessible primitives | Selected shadcn/ui components using Radix primitives |
| Validation | Zod at application boundaries |
| Client server-state | TanStack Query for pagination, optimistic updates, and invalidation |
| Editor | Konva and react-konva, loaded only on studio routes |
| Media processing | Sharp in Node.js route handlers |
| Authentication | Supabase Auth with `@supabase/ssr` |
| Database | Supabase PostgreSQL with SQL migrations and RLS |
| Storage | Supabase private buckets |
| Live updates | Supabase Realtime Postgres Changes |
| Unit/integration tests | Vitest |
| Browser tests | Playwright |
| Database tests | Supabase CLI and pgTAP |
| Hosting | Vercel |

Pin compatible stable versions when scaffolding and commit the exact resolved dependency tree. Do not introduce an ORM, separate Express server, Redis, custom WebSocket server, or microservices.

Node.js 24 is supported by Vercel and matches the installed local major version at authoring. [Vercel runtime documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

### 3.2 Application organization

```text
src/
  app/                 Routes, layouts, route handlers
  components/ui/       Shared accessible primitives
  components/layout/   Navigation, headers, application shell
  features/
    auth/
    profiles/
    feed/
    friends/
    chat/
    clubs/
    events/
    studio/
    notifications/
    moderation/
  lib/
    supabase/          Browser, request-scoped server, privileged server clients
    contracts/         Shared Zod inputs and application result types
    media/             Upload and processing helpers
    security/          Origin checks and rate-limit integration
  types/               Generated database types

supabase/
  migrations/
  tests/
  seed.sql

tests/
  integration/
  e2e/

docs/
  CONTRACTS.md
```

Keep feature-specific components, queries, mutations, and tests inside their feature directory.

Use direct imports. Add shared helpers only when at least two real callers need the same behavior.

### 3.3 Registration-number authentication

Supabase password authentication accepts email or phone identities, so registration numbers need an application mapping. Continue using Supabase to store and verify passwords. [Supabase password authentication](https://supabase.com/docs/guides/auth/passwords)

**Registration normalization**

- Trim surrounding whitespace.
- Normalize ASCII letters to uppercase.
- Preserve leading zeros.
- Accept 4–32 ASCII letters, digits, or hyphens.
- Do not infer course, year, or student status from the number.

This is an application input format, not a claim about Christ's official registration format.

**Signup flow**

1. Validate input, age confirmation, terms acceptance, and rate limits.
2. Reject duplicate normalized registration numbers.
3. Generate a unique internal email alias under a reserved `.invalid` domain.
4. Create the Supabase user server-side with the chosen password and the internal alias confirmed.
5. Provision the account identifier, profile, settings, and campus membership through a tested database trigger.
6. Start a normal Supabase password session and write its cookies.
7. Return immediate access.

Disable Supabase's public signup endpoint. The application's registration endpoint is the controlled account-creation path.

Use a server-only privileged Supabase client for account creation. Supabase supports administrative creation with email auto-confirmation. [Supabase administrative user creation](https://supabase.com/docs/reference/javascript/auth-admin-createuser)

**Login flow**

1. Normalize the registration number.
2. Resolve its user ID through a service-only identifier table.
3. Obtain that user's current Supabase email server-side.
4. Authenticate the password using the normal request-scoped Auth client.
5. Verify active campus membership.
6. Establish the session through Supabase SSR cookies.

Never return the internal alias or recovery email as part of a login lookup response.

**Recovery email flow**

- A signed-in user enters an email in settings.
- Require current-password reauthentication before requesting the change.
- Use Supabase's email-change verification.
- Configure confirmation to the new address, because the initial internal alias cannot receive mail.
- Keep recovery unavailable until the real address is confirmed.
- Resolve the current Auth email during later registration-number logins, so the login name stays unchanged.

Supabase provides confirmation to only the new address when its secure email-change setting is disabled. Verify this configuration in the initial integration checkpoint. [Supabase email-change behavior](https://supabase.com/docs/reference/csharp/auth-updateuser)

Forgot-password requests accept the registration number and return the same generic response whether recovery is available or not.

**No verified email means no self-service recovery.** Explain this clearly in settings without blocking access to the app.

### 3.4 Data model

Use UUID primary keys, `timestamptz`, explicit foreign keys, and database constraints for consequential invariants.

| Domain | Tables and responsibilities |
|---|---|
| Campus | `campuses`, `campus_memberships`: one seeded campus; account state and campus role |
| Identity | `account_identifiers`: normalized registration number → Auth user ID; service-only access |
| Profiles | `profiles`, `account_settings`: public-within-campus profile and private preferences |
| Relationships | `friendships`, `blocks`: request lifecycle, accepted friendships, directional blocks |
| Feed | `posts`, `post_attachments`, `comments`, `post_reactions`, `bookmarks` |
| Polls | `polls`, `poll_options`, `poll_votes` |
| Clubs | `clubs`, `club_memberships`: ownership, organizer role, membership |
| Events | `events`, `event_rsvps` |
| Messaging | `conversations`, `conversation_members`, `messages`, `message_reactions` |
| Media | `media_assets`, `upload_sessions`: processing state, storage paths, ownership, size, purpose |
| Creation | `creations`, `sticker_packs`, `pack_items`, `saved_packs` |
| Notifications | `notifications`: recipient, event type, destination, read state, deduplication key |
| Safety | `reports`, `moderation_actions`, `account_acceptances` |
| Operations | `rate_limit_buckets`, `cleanup_jobs` |

**Required constraints**

- Unique normalized registration number.
- Unique lowercase handle.
- Unique canonical user pair for friendships and direct conversations.
- No self-friendship or self-block.
- One reaction per user per target.
- One vote per user per poll.
- One RSVP per user per event.
- One membership per user per club or conversation.
- End time after start time.
- Attachment references must select one supported asset/provider type.
- Message must contain text or one supported attachment.
- Referenced assets must be processed and attachable by the actor.

Add indexes for membership checks, block checks, conversation pagination, notification inboxes, feed pagination, and search.

Do not use a polymorphic `target_type + target_id` as the primary integrity mechanism for media access. Use real foreign keys for attachments.

### 3.5 Permissions and database enforcement

Use RLS on every exposed application table. Signed-out clients receive no campus-content access.

Application route handlers validate inputs, but database policies, constraints, and transactional functions must still reject unauthorized direct Data API calls.

| Resource | Read | Write |
|---|---|---|
| Account identifiers | Trusted server only | Trusted provisioning process |
| Profile | Active campus accounts, subject to blocking | Owner's editable fields |
| Account settings | Owner | Owner |
| Campus posts | Active campus accounts, subject to blocking | Author; scoped moderator removal |
| Bookmarks | Owner | Owner |
| Club content | Active campus accounts | Members and scoped organizers |
| Events | Active campus accounts | Hosting club organizers or campus admins |
| Conversations | Accepted participants only | Eligible members, according to conversation rules |
| Messages | Authorized participants, with block rules | Sender; scoped moderation |
| Draft creations | Owner | Owner |
| Published packs | Active campus accounts | Pack owner |
| Notifications | Recipient | Trusted generation; recipient marks read |
| Reports | Reporter's own status and authorized moderators | Eligible reporter; authorized moderator |
| Roles and suspension state | Appropriate scoped access | Trusted administration only |

Protect privileged columns against self-editing. Keep service-only tables inaccessible to normal authenticated roles.

Use private-schema helpers for permission checks. Harden privileged functions with a fixed search path and explicit execution grants. Add tests for both permitted and forbidden requests. [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)

An account's active state must participate in access checks so suspension takes effect even when an existing JWT has not expired.

### 3.6 Request and type contracts

Use request-scoped user credentials for normal operations. Reserve the privileged client for account provisioning, identity resolution, verified administrative operations, and bounded maintenance.

Standard HTTP errors:

```ts
type ApiError = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    retryAfterSeconds?: number;
  };
};

type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

type AttachmentInput =
  | { kind: "image"; assetId: string }
  | { kind: "custom_sticker"; creationId: string }
  | { kind: "giphy"; providerId: string; mediaKind: "gif" | "sticker" };
```

Generate database types from migrations. Derive application input types from shared validation schemas.

Use `400`, `401`, `403`, `404`, `409`, `429`, and `500` consistently. Return `404` for inaccessible private resources where distinguishing existence would leak information.

**Endpoint families**

| Family | Required operations |
|---|---|
| `/api/auth/*` | Register, login, logout, recovery request, password update, recovery-email change |
| `/api/profile` | Update own profile and settings |
| `/api/feed` | Cursor-paginated feed |
| `/api/posts/*` | Create, update, delete, comment, react, bookmark |
| `/api/polls/*` | Vote and change vote |
| `/api/friends/*` | Request, respond, cancel, remove |
| `/api/blocks/*` | Block and unblock |
| `/api/conversations/*` | Create, invite, accept, leave, remove member, paginate messages, send, mark read |
| `/api/clubs/*` | Create, edit, join, leave, manage organizers |
| `/api/events/*` | Create, edit, cancel, RSVP |
| `/api/uploads/*` | Initialize and finalize an owned upload |
| `/api/creations/*` | Save draft, export metadata, publish, delete |
| `/api/packs/*` | Create, edit, publish, save, unsave |
| `/api/search` | Permission-aware people, posts, clubs, and events |
| `/api/notifications/*` | List and mark read |
| `/api/reports` | Submit report |
| `/api/admin/*` | Moderation actions and scoped administration |
| `/api/account/*` | Export and deletion request |
| `/api/internal/maintenance` | Authenticated cleanup processing |

Server-rendered pages call shared query functions directly; they must not make HTTP requests to their own API.

Use cursor pagination with a timestamp and ID tie-breaker. Encode the selected feed/filter in the cursor so it cannot silently be reused for a different query.

### 3.7 Media pipeline

Upload directly to Supabase Storage rather than sending image bodies through Vercel functions. Vercel currently limits function request and response bodies to 4.5MB. [Vercel function limits](https://vercel.com/docs/functions/limitations)

**Processing sequence**

1. Authenticated client requests an upload session.
2. Server validates purpose and quota, then creates a server-selected object path.
3. Client uploads directly into a private quarantine bucket.
4. Client finalizes using the upload-session ID.
5. Server fetches only that session's object.
6. Inspect actual bytes and dimensions.
7. Decode and re-encode with Sharp, preserving transparency when needed.
8. Strip metadata.
9. Write the sanitized asset to a private application bucket.
10. Mark it ready and remove the quarantine object.

Do not accept arbitrary remote URLs for processing.

**Initial limits**

- Original upload: 10MB.
- Decoded input: maximum 24 megapixels.
- General images: maximum 2,048px longest edge.
- Avatar: 512px.
- Account storage allowance: 100MB.
- Upload attempts: 50 per account per day.
- No SVG, executable files, videos, animated uploads, or document attachments.

All application buckets remain private. Access must follow the attached post, conversation, creation, or pack; ownership alone is insufficient for shared media. Supabase Storage supports RLS-based policies. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

Use short-lived signed URLs, with a five-minute maximum by default. Do not put private media through a public image optimizer or authenticated-content service-worker cache.

Deleting a creation or shared asset must result in an unavailable placeholder wherever referenced. Do not retain an invisible permanent copy solely to keep old messages visually complete.

### 3.8 Realtime and state synchronization

For the pilot:

- Subscribe to persisted message changes for the open conversation.
- Subscribe to the signed-in user's notifications.
- Re-fetch authorized data after reconnecting.
- Deduplicate optimistic messages against persisted UUIDs.
- Remove subscriptions on route change and logout.
- Do not subscribe every client to every message or campus post.
- Use a “New posts available” action instead of shifting the feed while someone reads.

Supabase Postgres Changes authorizes events against subscribers; filtered subscriptions and indexed policies matter. [Realtime documentation](https://supabase.com/docs/guides/realtime/postgres-changes)

After blocking, suspension, or membership removal, clear affected cached content and re-check permissions. Realtime and query caches must never be treated as continuing authorization.

### 3.9 Security and operating defaults

- Validate request origin on cookie-authenticated mutations.
- Keep authenticated HTML and API data out of shared caches.
- Render text as text; no user HTML.
- Restrict external links to safe schemes.
- Never log passwords, tokens, recovery links, private messages, or uploaded image contents.
- Store secrets only in server environments.
- Keep campus roles out of user-editable metadata.
- Enforce consequential quotas in the database as well as application handlers.

Initial abuse limits:

| Action | Default |
|---|---|
| Signup | 5 attempts per IP per hour |
| Login | 30 attempts per IP per 15 minutes, with provider protections |
| Recovery | 3 per registration number per hour and 10 per IP per hour |
| Post creation | 10 per account per hour |
| Comments | 60 per account per hour |
| Messages | 60 per account per minute |
| Uploads | 50 per account per day |

Use short-lived rate-limit buckets. Hash IP-derived identifiers with a server secret; do not create a permanent device fingerprint.

## 4. Agent work packages and integration order

### 4.1 Coordination rules

Use one coordinator and no more than three concurrent implementation agents.

Every task assignment must contain:

- Work-package ID and objective.
- Allowed directories and shared files.
- Required contracts and dependencies.
- Acceptance criteria.
- Tests to run.
- Explicit exclusions.

**Shared ownership**

- Coordinator owns package manifests, lockfile, global configuration, shared contracts, and integration.
- Database agent owns migrations, RLS, database tests, and generated database types.
- UI agent owns shared primitives, tokens, and application shell.
- Feature agents own their feature directories and route handlers.
- Feature agents request schema or shared-component changes through the owning agent.

Do not run parallel dependency installs or let several agents edit shared migrations independently.

Each handoff must include implementation notes, exact verification performed, remaining defects, and changed contracts. “The screen looks done” is not an acceptance criterion.

### 4.2 Work packages

| ID | Owner | Deliverable | Dependencies | Completion evidence |
|---|---|---|---|---|
| P00 | Coordinator | Scaffold Next.js in the initialized repository, strict TypeScript, scripts, environment template, CI skeleton | None | Clean install, typecheck, lint, build |
| P01 | Coordinator + database | Freeze domain contracts, schema outline, permission matrix, and API conventions in `docs/CONTRACTS.md` | P00 | Feature owners can implement without inventing shared shapes |
| P02 | UI | Tokens, themes, application shell, forms, dialogs, menus, toast, empty/error/loading states | P00–P01 | Desktop/mobile render review; keyboard navigation |
| P03 | Identity + database | Complete registration → login → optional verified recovery email → recovery checkpoint | P01 | Real Supabase integration tests; no mock auth |
| P04 | Database | Full schema, constraints, indexes, policies, transactional operations, deterministic seeds | P01 and identity checkpoint findings | Fresh database rebuild and pgTAP suite |
| P05 | Identity | Profiles, settings, friendship lifecycle, blocking, account status | P02–P04 | Two-account relationship and permission tests |
| P06 | Media | Upload sessions, sanitization, private access, quotas, cleanup | P04 | Valid upload plus malicious/oversized/access-denied tests |
| P07 | Feed | Posts, attachments, comments, reactions, bookmarks, polls, feed tabs | P02, P04–P06 | Real two-account publishing and poll tests |
| P08 | Chat | Direct/group conversations, invitations, messages, reactions, unread state, reconnect handling | P02, P04–P06 | Multi-account browser and database tests |
| P09 | Community | Club directory, membership, organizer tools, events, RSVP, calendar export | P02, P04–P06 | Organizer/member authorization and event lifecycle tests |
| P10 | Studio | Manual editor, draft recovery, rendering, packs, custom-sticker sharing | P02, P06; attachment contracts from P07/P08 | Touch/keyboard editor checks and export tests |
| P11 | Provider integration | GIPHY picker, attribution, ID resolution, error states | P02; attachment contracts | Browser integration evidence and mocked failure tests |
| P12 | Safety + platform | Notifications, permission-aware search, reports, moderation, account export/deletion | P05 and relevant feature contracts | Access-isolation and moderation tests |
| P13 | QA + coordinator | Full integration, accessibility, performance, browser verification, defect fixes | All feature packages | Release evidence against acceptance matrix |
| P14 | Coordinator | Vercel/Supabase production configuration, backup/restore runbook, staged pilot | P13 and external release dependencies | Deployment smoke test and rollback rehearsal |

### 4.3 Suggested execution waves

**Wave A — foundations**

- P00, followed by P01.
- P02 and the P03 identity checkpoint can then run in parallel.
- Resolve identity checkpoint failures before expanding feature implementation.

**Wave B — backend and reusable capabilities**

- P04 establishes the shared database.
- Run P05 and P06 in parallel; start P07 after both have supplied its required relationship and media capabilities.

**Wave C — major product features**

- Run P08, P09, and P10 in parallel.
- Assign P11 when a slot becomes available.

**Wave D — cross-feature behavior**

- Complete P12.
- Integrate notification producers, block behavior, media permissions, and deletion behavior across every feature.

**Wave E — release**

- P13, substantive fixes, then P14.
- Do not describe the broad release as complete while chat, studio, or moderation still uses placeholder behavior.

### 4.4 Mandatory first identity checkpoint

Before agents build around authentication, demonstrate all of these against a real test Supabase instance:

1. Register without email or activation.
2. Receive a valid session immediately.
3. Log out and sign in by registration number.
4. Reject duplicate normalized numbers, including concurrent attempts.
5. Preserve leading zeros.
6. Add a real test recovery email and confirm it.
7. Continue logging in by the same registration number.
8. Recover the password through that email.
9. Reject ordinary clients attempting to modify identity mappings or campus roles.
10. Demonstrate that a provisioning-trigger failure cannot leave a usable partial account.

Supabase notes that failing Auth provisioning triggers can block signup, making this an early integration requirement. [User-management guidance](https://supabase.com/docs/guides/auth/managing-user-data)

### 4.5 Agent definition of done

A work package is complete only when:

- UI, handler, database, and permissions are connected.
- Relevant loading, empty, success, validation, disabled, and error states work.
- A refresh preserves persisted state.
- Another account sees only what it is permitted to see.
- Failed actions preserve recoverable user input.
- Meaningful tests pass.
- Applicable mobile and desktop flows have been exercised.
- Console exceptions and failed assets have been investigated.
- The coordinator has integrated the work and updated affected contracts.

## 5. Verification, deployment, and release gates

### 5.1 Automated test matrix

| Area | Required scenarios |
|---|---|
| Authentication | Immediate signup, normalization, duplicate races, wrong password, logout, session refresh |
| Recovery | No email, pending email, verified email, expired link, successful password change |
| Permissions | Signed out, owner, peer, blocked account, suspended account, organizer, moderator |
| Direct API access | Bypassing the UI cannot grant roles, attach others' private files, join private chats, or evade hard limits |
| Friendships | Crossed requests, duplicate requests, rejection, removal, block |
| Feed | Pagination stability, editing, deletion, inaccessible attachments |
| Polls | Duplicate vote, changed vote, closed poll, unauthorized option edits |
| Chat | Duplicate send retries, reconnect, invite acceptance, removed participant, blocked sender |
| Clubs/events | Unauthorized edits, ownership transfer, invalid times, duplicate RSVP, cancellation |
| Uploads | Spoofed MIME type, oversized dimensions, invalid bytes, cross-account finalization, quota exhaustion |
| Studio | Transparent export, crop/cutout rendering, text wrapping, undo/redo, draft version validation |
| Notifications | Deduplication, no self-notifications, blocked actor, inaccessible destination |
| Search | Private content exclusion, blocked profiles, special characters, pagination |
| Moderation | Fabricated report reference, scoped organizer access, reported-message evidence |
| Deletion | Immediate access denial, asset removal, repeatable cleanup, unavailable-content placeholders |

Use unit tests for real logic and database tests for authorization. Avoid large suites that merely assert component markup.

### 5.2 Browser and visual verification

Test Chromium, Firefox, and WebKit at representative widths:

- 320px.
- 390px.
- 768px.
- 1,440px.

Exercise:

- Signup and login with the software keyboard.
- Mobile navigation and safe-area spacing.
- Long names, long posts, empty accounts, and missing images.
- Keyboard focus, dialog dismissal, and focus restoration.
- Studio touch controls and accessible alternatives to dragging.
- Reduced motion and GIF pause/play behavior.
- Slow requests, offline transitions, retries, and expired sessions.
- Browser back/forward navigation.
- Logout followed by a different account on the same browser.

Verify contrast and semantic controls. Automated accessibility scans supplement manual keyboard testing.

A physical mid-range Android device must be used for final studio and chat checks before expanding the pilot.

### 5.3 Performance targets

These are acceptance targets, not claims about an unbuilt application:

- LCP at or below 2.5 seconds on representative mobile conditions.
- CLS below 0.1.
- INP at or below 200ms.
- Chat delivery visible within approximately two seconds under normal pilot conditions.
- No studio dependencies in the feed or login route bundle.
- No provider searches on every keystroke.
- No unbounded feeds, message queries, or subscriptions.
- No image decode that freezes the editor on the target Android device.

Run a synthetic, isolated load check with 50 concurrent authenticated clients using seeded data. Exercise feed reads, paginated messages, and moderate message writes. Do not load-test production or GIPHY.

Investigate database query plans when targets fail; do not add caching infrastructure without evidence that it is needed.

### 5.4 Development and CI setup

Provide scripts for:

```text
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run test:db
npm run build
```

CI must run:

1. Reproducible dependency installation.
2. Lint and type checking.
3. Unit tests.
4. Local Supabase startup and migrations.
5. Database authorization tests.
6. Integration tests.
7. Production build.
8. Core browser journeys.

Docker was absent on the authoring machine. Install/configure Docker before local Supabase tests, or run those tests in a Docker-capable CI environment. Do not replace them with mocks and report database verification as complete.

### 5.5 Environment configuration

Keep local, preview, and production environments isolated.

**Application configuration**

```text
APP_ORIGIN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
NEXT_PUBLIC_GIPHY_FEED_KEY
NEXT_PUBLIC_GIPHY_CHAT_KEY
NEXT_PUBLIC_GIPHY_STUDIO_KEY
RATE_LIMIT_HMAC_SECRET
CRON_SECRET
SIGNUPS_ENABLED
GIF_ENABLED
```

GIPHY browser keys are intentionally client-visible provider credentials. Supabase privileged keys, rate-limit secrets, and maintenance secrets remain server-only.

Configure SMTP through Supabase using a dedicated sender domain. Include the exact approved callback URLs for each environment; avoid unrestricted production redirect wildcards.

Production must never receive development seeds or test-account credentials.

### 5.6 Deployment procedure

1. Create separate development/staging and production Supabase projects.
2. Use a Mumbai region for the application's server operations and database where supported.
3. Apply reviewed migrations through the release process.
4. Configure private buckets, Auth settings, SMTP, redirects, and Realtime publication.
5. Provision the first administrator through a trusted maintenance operation.
6. Configure Vercel environment variables and Node.js 24.
7. Deploy a preview against staging.
8. Run full smoke tests with synthetic accounts.
9. Confirm production GIF access and approved provider settings.
10. Deploy production with signups disabled.
11. Run production smoke tests.
12. Enable signups for the initial small pilot.
13. Expand toward 100–500 users after observing the first cohort.

Use approximately 20–30 students for the initial cohort. Review errors, media usage, signup abuse, and moderation workload before expanding.

### 5.7 Operations, backups, and rollback

- Track server errors, authentication failures, upload failures, message-write latency, database/storage usage, and cleanup backlog.
- Collect operational metrics without recording private content.
- Maintain spending alerts and upload caps.
- Run authenticated daily maintenance for abandoned uploads and deletion jobs.
- Make cleanup idempotent and process bounded batches.
- Account deletion immediately disables application access; permanent removal then proceeds through retryable cleanup.
- Remove owned Storage objects before deleting the Auth user.
- Keep moderation evidence restricted and governed by the published retention policy.

Maintain database backups **and separate Storage-object backups**. Supabase database backups do not include uploaded file contents. Perform one restore exercise before the broad pilot. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups)

Prefer additive migrations. Deploy schema changes before dependent application code. For an application regression, restore the previous Vercel deployment; destructive database rollback must not be the routine recovery strategy.

### 5.8 External release dependencies

These require real project-owner inputs or external access:

- Vercel and Supabase projects and credentials.
- Production sender domain and SMTP setup.
- GIPHY production access and any agreed charges.
- Named campus administrators and moderation ownership.
- Terms, privacy notice, retention policy, and impersonation-dispute process.
- Review of the 16–17-year-old admission and consent requirements before accepting real under-18 users.

The under-18 review must consider the law and commencement dates applicable at launch. Do not assume an educational exemption or add a parental activation flow silently. If the review requires a different signup flow, revise this specification before release. [MeitY rules and enforcement publications](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%3B)

### 5.9 Explicit exclusions

Keep the first release focused on the specified social and creative experience. Defer:

- AI generation and automatic background removal.
- Animated meme rendering and video editing.
- Voice/video calling and voice notes.
- Marketplace payments and ticket sales.
- Anonymous confessions and public internet feeds.
- Location tracking and contact-book imports.
- Native mobile apps.
- Behavioral advertising.
- End-to-end encryption claims.
- Multi-campus administration and cross-campus discovery.

**Verification status:** This document specifies future implementation and acceptance checks. No application implementation, live service integration, or application tests have been performed.

**Known risks:** Registration ownership remains unverified, and accounts without a verified recovery email may be unrecoverable.
