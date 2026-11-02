# Project: Campus Connect Frontend UI/UX

## Architecture
Campus Connect is a mobile-first, campus-scoped web application built with Next.js (App Router), React, TypeScript, and Tailwind CSS.

### System Architecture & State Model
- **Zero-Cloud Boundary**: Excludes live Supabase (Auth, Postgres, Storage, Realtime) and Vercel connections. All functionality executes locally in the client runtime.
- **Client Mock Store (`src/lib/mock-store/`)**: Unified in-memory and `localStorage`-backed store managing all entities (Users, Posts, Comments, Polls, Clubs, Events, Conversations, Messages, Stickers, Notifications, Bookmarks).
- **Responsive Layout Shell (`src/components/layout/`)**:
  - Mobile (<768px): 5-destination bottom navigation bar (Feed, Discover, Create Sheet, Messages, Profile) + sticky header with notification bell.
  - Desktop (>=768px): 240-280px persistent left sidebar, centered `max-w-2xl` content rail, and 280-320px contextual right rail (upcoming events, trending clubs, friend suggestions).
  - Layout invariant: Zero horizontal scroll overflow across all viewports down to 320px.
- **Design System Tokens (`src/styles/` & `tailwind.config.ts`)**:
  - Canvas background: Warm white `#FAFAF6`
  - Text: Deep green-black `#20241E` (14.2:1 contrast ratio against `#FAFAF6`)
  - Primary accent: Lime `#D9F36B` paired with dark text (12.8:1 contrast ratio)
  - Secondary accent: Coral `#F26457`
  - Muted text: `#5A6255` (5.4:1 contrast ratio)
  - Spacing: Strict 4/8px rhythm (`p-2`, `p-4`, `p-6`, `p-8`)
  - Typography: Plus Jakarta Sans / system sans-serif scale
  - Shapes: Soft corners (`rounded-xl`, `rounded-2xl`); pill shapes (`rounded-full`) reserved strictly for tags/badges.
  - Motion: 150-250ms feedback respecting `prefers-reduced-motion` and `visibilitychange` suspension.
- **Studio Canvas Architecture (`src/components/studio/`)**:
  - Konva / `react-konva` HTML5 Canvas dynamically imported with `ssr: false`.
  - Max 20 layers per scene (text, base image, stickers, shapes).
  - Polygon cutout tool with editable vertices and keyboard-accessible coordinate controls.
  - 20-step undo/redo history stack and IndexedDB draft recovery.

---

## Feature Inventory
Every feature identified during the authoritative survey phase is cataloged below with its assigned milestone.

| # | Feature | Description | Milestone | Source |
|---|---|---|---|---|
| 1 | Scaffolding & Tooling | Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest configuration | M1 | survey |
| 2 | Design System Tokens | Color palette (#FAFAF6, #20241E, #D9F36B, coral), typography, 4/8px spacing | M1 | survey |
| 3 | Base UI Component Library | Buttons, Inputs, Cards, Badges, Modals, Tabs, Dropdowns, Avatar, Tooltip | M1 | survey |
| 4 | Client Mock Store Core | In-memory & localStorage store interface, reactive subscriber, async delay simulator | M1 | survey |
| 5 | Seed Data Fixtures | Realistic Christ University Lavasa fixtures (users, posts, clubs, events, stickers) | M1 | survey |
| 6 | Responsive App Shell | Mobile bottom nav bar (5 tabs) + desktop persistent sidebar + right contextual rail | M2 | survey |
| 7 | Zero Horizontal Overflow | Strict responsive layout bounds (down to 320px mobile width) | M2 | survey |
| 8 | Registration Number Normalization | Whitespace trimming, uppercase conversion, regex `^[A-Za-z0-9-]{4,32}$` | M2 | survey |
| 9 | Immediate Student Signup (`/signup`) | Registration without college email or activation code; instant profile provisioning | M2 | survey |
| 10 | Reg Number Login (`/login`) | Authentication with registration number & password, session creation | M2 | survey |
| 11 | Password Recovery (`/forgot-password`, `/reset-password`) | Simulated recovery flow with token validation | M2 | survey |
| 12 | Student Onboarding (`/onboarding`) | Profile personalization: display name, handle, avatar, course, year, bio (<=160 chars) | M2 | survey |
| 13 | Campus Feed Tab (`/feed?tab=campus`) | Pinned campus announcements + reverse-chronological campus posts | M3 | survey |
| 14 | Friends Feed Tab (`/feed?tab=friends`) | Posts strictly from mutual accepted friends with empty state | M3 | survey |
| 15 | My Clubs Feed Tab (`/feed?tab=clubs`) | Posts aggregated from joined clubs with empty state | M3 | survey |
| 16 | Post Composer & Creator Modal | Post creation (<=2000 chars), up to 4 image previews, sticker attachment, polls | M3 | survey |
| 17 | Interactive Single-Choice Polls | Polls with 2-6 options, closing time, live percentage visualization, single vote | M3 | survey |
| 18 | 5-Emoji Reaction Tray | Reaction tray (👍 like, ❤️ love, 😆 laugh, 🔥 fire, 👏 clap) with toggle logic | M3 | survey |
| 19 | Private Post Bookmarking | Save/bookmark post to `/saved` with instant visual feedback | M3 | survey |
| 20 | Post Detail & Comments (`/posts/[id]`) | Full post view, flat comments list (<=1000 chars), `@mention` auto-suggest | M3 | survey |
| 21 | Post Edit & Deletion | Post authoring controls (edit text, delete own post) | M3 | survey |
| 22 | Unified Campus Search (`/discover`) | 350ms debounced search across students, clubs, events, posts with filter chips | M3 | survey |
| 23 | Trending Campus Topics | Hashtag and topic pills filtering campus discussions | M3 | survey |
| 24 | Student Profile View (`/people/[handle]`) | Banner, avatar, bio, course, year, badges, stats (friends, creations, posts) | M3 | survey |
| 25 | Friendship Lifecycle Management | Add friend, pending status, accept request, reject, unfriend | M3 | survey |
| 26 | Account Blocking & Privacy | Block user, dissolve mutual friendship, hide content in feed and search | M3 | survey |
| 27 | Messaging Conversations (`/messages`) | Conversation list for mutual friends and group chats (cap 30), unread badges | M4 | survey |
| 28 | Direct & Group Chat Thread (`/messages/[id]`) | Chat bubbles, timestamps, composer (<=4000 chars), sticker/meme attachment | M4 | survey |
| 29 | Realtime Chat Simulation Bot | Simulated peer responses (1.5s delay) to verify interactive chat flows locally | M4 | survey |
| 30 | Campus Clubs Directory (`/clubs`) | Club catalog, category filters (Tech, Arts, Sports, Academic), club cards | M4 | survey |
| 31 | Club Detail Page (`/clubs/[slug]`) | Banner, about, member count, leadership, announcement feed, join/leave toggle | M4 | survey |
| 32 | Campus Events Calendar (`/events`) | Upcoming events list/calendar, category filters, event cards | M4 | survey |
| 33 | Event Detail Page (`/events/[id]`) | Event banner, date/time, venue, description, organizer, RSVP toggle (Going/Interested) | M4 | survey |
| 34 | Studio Home & Gallery (`/studio`) | Template showcase, user creations gallery, custom sticker packs list | M5 | survey |
| 35 | Studio Canvas Editor (`/studio/[id]`) | Konva canvas, aspect ratios (1:1, 4:5, 16:9), background image upload | M5 | survey |
| 36 | Canvas Text & Styling Tool | Text layers, font size, color, stroke/outline, typography | M5 | survey |
| 37 | Canvas Stickers & Shapes | Layering stickers, decorative shapes, emoji inserts, max 20 layers | M5 | survey |
| 38 | Polygon Cutout Tool | Cutout tool with editable vertices and keyboard-accessible coordinate panel | M5 | survey |
| 39 | Studio Undo / Redo History | 20-step undo/redo stack for all canvas modifications | M5 | survey |
| 40 | Sticker Pack Canvas (`/packs/[id]`) | 512x512 transparent PNG sticker editor & export (<=1MB) | M5 | survey |
| 41 | Activity Notifications (`/notifications`) | Notifications feed (reactions, comments, friend requests, events), unread badge | M5 | survey |
| 42 | Saved Bookmarks Collection (`/saved`) | Grid and list of bookmarked posts and saved memes | M5 | survey |
| 43 | Student Account Settings (`/settings`) | Profile editor, appearance preview (Light/Dark), notification prefs, blocked list | M5 | survey |
| 44 | E2E Testing Suite (Tiers 1-4) | Comprehensive test suite covering all routes, interactions, and boundaries | M6 | survey |
| 45 | Adversarial Coverage Hardening (Tier 5) | White-box edge case testing, code coverage audit, and vulnerability fixes | M6 | survey |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M1 | Foundation, Design System & Mock Architecture | Next.js App Router scaffolding, Tailwind tokens, base UI components, client mock store & seed fixtures | none | IN_PROGRESS |
| M2 | App Shell, Navigation & Authentication Suite | Responsive mobile bottom bar / desktop persistent sidebar, zero overflow layout, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding` | M1 | PLANNED |
| M3 | Social Core — Feed, Posts, Discover & Profiles | Campus/Friends/Clubs feed tabs, post composer, polls, reactions, comments (`/posts/[id]`), unified search (`/discover`), profiles (`/people/[handle]`) & friendships | M1, M2 | PLANNED |
| M4 | Community, Messaging & Campus Events | Conversations (`/messages`, `/messages/[id]`), simulation bot, clubs (`/clubs`, `/clubs/[slug]`), events (`/events`, `/events/[id]`) & RSVP | M1, M2 | PLANNED |
| M5 | Studio Canvas, Activity & Settings | Meme & sticker studio (`/studio`, `/studio/[id]`, `/packs/[id]`), Konva canvas, 20 layers, polygon cutout, undo/redo, `/notifications`, `/saved`, `/settings` | M1, M2 | PLANNED |
| M6 | Final Milestone: E2E Test Pass & Adversarial Hardening | Phase 1: 100% E2E test pass across Tiers 1-4. Phase 2: Adversarial coverage hardening (Tier 5) with Challengers & test-coverage-audit | M1-M5, TEST_READY | PLANNED |

---

## Interface Contracts

### 1. Mock Store Interface (`IMockStore`)
Located in `src/lib/mock-store/types.ts`:
- **Auth Contract**:
  - `login(regNumber: string, password: string): Promise<Session>`
  - `signup(input: SignupInput): Promise<Session>`
  - `logout(): Promise<void>`
  - `getCurrentUser(): User | null`
  - `updateProfile(handle: string, updates: Partial<Profile>): Promise<Profile>`
- **Feed & Post Contract**:
  - `getPosts(tab: 'campus' | 'friends' | 'clubs', page?: number): Promise<Post[]>`
  - `getPostById(id: string): Promise<Post | null>`
  - `createPost(input: CreatePostInput): Promise<Post>`
  - `toggleReaction(postId: string, reactionType: ReactionType): Promise<Post>`
  - `votePoll(pollId: string, optionId: string): Promise<Poll>`
  - `addComment(postId: string, text: string): Promise<Comment>`
  - `toggleBookmark(postId: string): Promise<boolean>`
- **Discover & People Contract**:
  - `search(query: string, filter?: SearchFilter): Promise<SearchResults>`
  - `getProfileByHandle(handle: string): Promise<Profile | null>`
  - `sendFriendRequest(targetUserId: string): Promise<Friendship>`
  - `respondFriendRequest(friendshipId: string, action: 'accept' | 'reject'): Promise<void>`
  - `blockUser(targetUserId: string): Promise<void>`
- **Messaging Contract**:
  - `getConversations(): Promise<Conversation[]>`
  - `getConversationById(id: string): Promise<Conversation | null>`
  - `getMessages(conversationId: string): Promise<Message[]>`
  - `sendMessage(conversationId: string, input: SendMessageInput): Promise<Message>`
- **Clubs & Events Contract**:
  - `getClubs(): Promise<Club[]>`
  - `getClubBySlug(slug: string): Promise<Club | null>`
  - `toggleClubMembership(clubId: string): Promise<ClubMembership>`
  - `getEvents(): Promise<CampusEvent[]>`
  - `getEventById(id: string): Promise<CampusEvent | null>`
  - `toggleEventRsvp(eventId: string, status: RsvpStatus): Promise<EventRsvp>`
- **Studio & Activity Contract**:
  - `getCreations(): Promise<Creation[]>`
  - `saveCreation(creation: CreationInput): Promise<Creation>`
  - `getNotifications(): Promise<Notification[]>`
  - `markNotificationsRead(): Promise<void>`
  - `getBookmarkedPosts(): Promise<Post[]>`

### 2. Layout & Shell Contract
Located in `src/components/layout/Shell.tsx`:
- `<AppShell>` wraps all authenticated and navigable routes.
- Mobile Viewport (<768px): Renders `<MobileHeader>` with notification bell and `<MobileBottomNav>` with 5 tabs (`Feed`, `Discover`, `Create`, `Messages`, `Profile`).
- Desktop Viewport (>=768px): Renders `<DesktopSidebar>` (260px fixed), `<MainContentRail>` (`max-w-2xl` mx-auto), and contextual `<DesktopRightRail>`.
- Zero horizontal overflow invariant: Every container uses `max-w-full overflow-x-hidden`.

---

## Code Layout
```
c:\Users\honey\OneDrive\Desktop\Campus connect/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── public/
│   ├── avatars/
│   ├── banners/
│   └── stickers/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (redirect / gateway)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── onboarding/page.tsx
│   │   ├── feed/page.tsx
│   │   ├── posts/[id]/page.tsx
│   │   ├── discover/page.tsx
│   │   ├── people/[handle]/page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clubs/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── studio/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── packs/[id]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── saved/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   ├── ui/ (Button, Input, Card, Badge, Modal, Tabs, Avatar, Dropdown, Tooltip)
│   │   ├── layout/ (Shell, MobileBottomNav, DesktopSidebar, MobileHeader, RightRail)
│   │   ├── feed/ (PostCard, PostComposer, PollWidget, ReactionTray, CommentSection)
│   │   ├── discover/ (SearchBar, FilterChips, TrendingTags, PeopleCard)
│   │   ├── profile/ (ProfileHeader, StatsRow, ProfileTabs, FriendActionButton)
│   │   ├── messages/ (ConversationList, ChatThread, MessageBubble, MessageInput)
│   │   ├── clubs/ (ClubCard, ClubHeader, ClubAnnouncements)
│   │   ├── events/ (EventCard, EventHeader, RsvpButton)
│   │   └── studio/ (CanvasStage, LayerPanel, TextControls, PolygonCutoutTool, UndoRedoBar)
│   ├── lib/
│   │   ├── utils.ts (cn, formatting)
│   │   ├── mock-store/
│   │   │   ├── types.ts
│   │   │   ├── fixtures.ts
│   │   │   ├── store.ts
│   │   │   └── context.tsx
│   └── styles/
│       └── globals.css
└── tests/
    ├── e2e/
    │   ├── tier1-features/
    │   ├── tier2-boundaries/
    │   ├── tier3-interactions/
    │   └── tier4-scenarios/
    └── setup.ts
```
