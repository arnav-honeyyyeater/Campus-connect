# Campus Connect — E2E Test Infrastructure & Verification Plan

**Version:** 1.0.0  
**Baseline Date:** 31 October 2026  
**Status:** Active Test Specification  
**Project Root:** `c:\Users\honey\OneDrive\Desktop\Campus connect`  
**Test Runner:** Vitest 3.0+ / JSDOM / React Testing Library  

---

## 1. Test Philosophy & Opaque-Box Methodology

Campus Connect is tested using an **opaque-box, requirement-driven** dual-track testing discipline. All test cases, boundary assertions, cross-feature interaction flows, and persona journeys are derived directly from the authoritative product requirements in:
- `ORIGINAL_REQUEST.md` (R1 Shell & Navigation, R2 Screen & Feature Implementations, R3 Zero-Cloud Mock Boundary)
- `PROJECT.md` (Feature Inventory 1–43, Interface Contracts, Layout Bounds)
- `IMPLEMENTATION_PLAN.md` (Design Tokens, Campus Context, Moderation & Privacy Rules)

### Core Invariants:
1. **Opaque-Box Requirement Verification:** Tests interact through public contracts, interfaces, DOM user interactions, and event buses without asserting internal implementation minutiae.
2. **Zero-Cloud Client Execution:** Tests run completely offline in the local client environment without network calls to external Supabase or Vercel services.
3. **Deterministic Test Isolation:** Each test case initializes its own state fixture or resets state before execution, ensuring tests never depend on execution order or shared mutable side effects.
4. **Adversarial & Boundary Rigor:** Validates system resilience against extreme inputs (text length overflows, invalid registration numbers, duplicate votes, max studio layers, responsive narrow viewports down to 320px).
5. **Christ University Lavasa Domain Fidelity:** Fixtures, student personas, course codes (BSc Data Science, AI & ML, BBA, BCA, MBA), and campus venues (Central Block, Auditorium, Cafeteria) accurately reflect the university domain.

---

## 2. Feature Inventory & Multi-Tier Coverage Mapping

The following matrix maps every feature identified in `PROJECT.md` § Feature Inventory (Features 1–43) to its designated E2E test tier and suite file:

| # | Feature Name | Milestone | Tier 1 (Features) | Tier 2 (Boundaries) | Tier 3 (Interactions) |
|---|---|---|---|---|---|
| 1 | Scaffolding & Tooling | M1 | `tier1-features/auth.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | — |
| 2 | Design System Tokens | M1 | `tier1-features/auth.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 3 | Base UI Component Library | M1 | `tier1-features/auth.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 4 | Client Mock Store Core | M1 | `tier1-features/auth.test.ts` | `tier2-boundaries/auth-boundaries.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 5 | Seed Data Fixtures | M1 | `tier1-features/discover.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 6 | Responsive App Shell | M2 | `tier1-features/auth.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 7 | Zero Horizontal Overflow | M2 | `tier1-features/feed.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | — |
| 8 | Reg Number Normalization | M2 | `tier1-features/auth.test.ts` | `tier2-boundaries/auth-boundaries.test.ts` | — |
| 9 | Immediate Student Signup | M2 | `tier1-features/auth.test.ts` | `tier2-boundaries/auth-boundaries.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 10 | Reg Number Login | M2 | `tier1-features/auth.test.ts` | `tier2-boundaries/auth-boundaries.test.ts` | — |
| 11 | Password Recovery | M2 | `tier1-features/auth.test.ts` | `tier2-boundaries/auth-boundaries.test.ts` | — |
| 12 | Student Onboarding | M2 | `tier1-features/auth.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 13 | Campus Feed Tab | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 14 | Friends Feed Tab | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 15 | My Clubs Feed Tab | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/club-membership-event-rsvp.test.ts` |
| 16 | Post Composer & Creator | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 17 | Interactive Polls | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/polls-boundaries.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 18 | 5-Emoji Reaction Tray | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 19 | Private Post Bookmarking | M3 | `tier1-features/settings-saved.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 20 | Post Detail & Comments | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/moderation-blocking-isolation.test.ts` |
| 21 | Post Edit & Deletion | M3 | `tier1-features/feed.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/moderation-blocking-isolation.test.ts` |
| 22 | Unified Campus Search | M3 | `tier1-features/discover.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 23 | Trending Campus Topics | M3 | `tier1-features/discover.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | — |
| 24 | Student Profile View | M3 | `tier1-features/profile.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 25 | Friendship Lifecycle | M3 | `tier1-features/profile.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 26 | Account Blocking & Privacy | M3 | `tier1-features/profile.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/moderation-blocking-isolation.test.ts` |
| 27 | Messaging Conversations | M4 | `tier1-features/messages.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 28 | Direct & Group Threads | M4 | `tier1-features/messages.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 29 | Realtime Bot Simulation | M4 | `tier1-features/messages.test.ts` | — | `tier3-interactions/friendship-messaging.test.ts` |
| 30 | Campus Clubs Directory | M4 | `tier1-features/clubs.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/club-membership-event-rsvp.test.ts` |
| 31 | Club Detail Page | M4 | `tier1-features/clubs.test.ts` | `tier2-boundaries/relationships-boundaries.test.ts` | `tier3-interactions/club-membership-event-rsvp.test.ts` |
| 32 | Campus Events Calendar | M4 | `tier1-features/events.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/club-membership-event-rsvp.test.ts` |
| 33 | Event Detail & RSVP | M4 | `tier1-features/events.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/club-membership-event-rsvp.test.ts` |
| 34 | Studio Home & Gallery | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 35 | Studio Canvas Editor | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 36 | Canvas Text & Styling | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 37 | Canvas Stickers & Shapes | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 38 | Polygon Cutout Tool | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 39 | Studio Undo / Redo | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | — |
| 40 | Sticker Pack Canvas | M5 | `tier1-features/studio.test.ts` | `tier2-boundaries/studio-boundaries.test.ts` | `tier3-interactions/studio-sticker-post-feed.test.ts` |
| 41 | Activity Notifications | M5 | `tier1-features/settings-saved.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/friendship-messaging.test.ts` |
| 42 | Saved Bookmarks | M5 | `tier1-features/settings-saved.test.ts` | `tier2-boundaries/layout-overflow.test.ts` | `tier3-interactions/auth-post-bookmark-saved.test.ts` |
| 43 | Student Account Settings | M5 | `tier1-features/settings-saved.test.ts` | `tier2-boundaries/content-limits.test.ts` | `tier3-interactions/moderation-blocking-isolation.test.ts` |

---

## 3. Test Architecture & Runner Setup

### 3.1 Directory Layout
```
tests/
├── setup.ts                                # JSDOM, matchMedia, ResizeObserver, localStorage polyfills
└── e2e/
    ├── helpers/                            # Test store harness, assertion utilities, event listeners
    │   └── test-store-harness.ts
    ├── tier1-features/                     # Happy-path feature coverage (>=5 test cases per feature)
    │   ├── auth.test.ts                    # Routes: /login, /signup, /forgot-password, /onboarding
    │   ├── feed.test.ts                    # Routes: /feed (tabs), /posts/[id], polls, reactions
    │   ├── discover.test.ts                # Route: /discover (unified search, filter chips, tags)
    │   ├── profile.test.ts                 # Route: /people/[handle], friendship lifecycle, blocking
    │   ├── messages.test.ts                # Routes: /messages, /messages/[id], bot simulation
    │   ├── clubs.test.ts                   # Routes: /clubs, /clubs/[slug], membership, announcements
    │   ├── events.test.ts                  # Routes: /events, /events/[id], RSVP toggle
    │   ├── studio.test.ts                  # Routes: /studio, /studio/[id], /packs/[id], canvas tools
    │   └── settings-saved.test.ts          # Routes: /settings, /notifications, /saved
    ├── tier2-boundaries/                   # Edge conditions, limits, error handling (>=5 per group)
    │   ├── auth-boundaries.test.ts         # Reg number regex, duplicate collision, password mismatch
    │   ├── content-limits.test.ts          # Max lengths: bio 160, post 2000, comment 1000, msg 4000
    │   ├── polls-boundaries.test.ts        # Options (2-6), closed poll rejection, single-choice vote
    │   ├── studio-boundaries.test.ts       # Max 20 canvas layers, undo/redo bounds, polygon vertices
    │   ├── relationships-boundaries.test.ts# Self-friending, non-friend chat lock, block content hiding
    │   └── layout-overflow.test.ts         # Responsive 320px bounds, empty states, zero horizontal scroll
    ├── tier3-interactions/                 # Multi-step pairwise cross-feature flows
    │   ├── auth-post-bookmark-saved.test.ts
    │   ├── friendship-messaging.test.ts
    │   ├── studio-sticker-post-feed.test.ts
    │   ├── club-membership-event-rsvp.test.ts
    │   └── moderation-blocking-isolation.test.ts
    └── tier4-scenarios/                    # End-to-end Christ University Lavasa user journeys
        ├── freshman-onboarding-journey.test.ts
        ├── hackathon-event-rsvp-journey.test.ts
        ├── campus-meme-contest-journey.test.ts
        ├── club-president-announcement-journey.test.ts
        └── student-privacy-account-lifecycle-journey.test.ts
```

### 3.2 Execution Commands
All tests run natively with Vitest and JSDOM:

```powershell
# Run all E2E test suites
npx vitest run tests/e2e

# Run individual test tiers
npx vitest run tests/e2e/tier1-features
npx vitest run tests/e2e/tier2-boundaries
npx vitest run tests/e2e/tier3-interactions
npx vitest run tests/e2e/tier4-scenarios

# Run specific suite file
npx vitest run tests/e2e/tier1-features/auth.test.ts
```

---

## 4. Real-World Application Scenarios (Tier 4)

| Scenario ID | Persona & Context | End-to-End User Journey |
|---|---|---|
| **SC-01** | **Aarav Mehta (`24BDS042`)**<br>1st Year BSc Data Science | Register on Day 1 (`24BDS042`) -> Complete profile onboarding with handle `aarav_m`, bio "BSc Data Science '28 \| Code & Coffee ☕" -> Search campus clubs on `/discover` -> Join "Lavasa Coding Community" -> Browse Campus Feed -> React with ❤️ to the Student Council welcome post. |
| **SC-02** | **Priya Sharma (`23BCA015`)**<br>2nd Year BCA | Discover "Lavasa AI & Web3 Hackathon 2026" at Central Block Amphitheatre on `/events` -> RSVP "Going" -> Publish post on `/feed` with interactive single-choice poll ("Looking for teammates: Frontend / ML / UI Designer") -> Peers vote -> Accept friend request from Rahul Verma (`23BBA088`) -> Launch direct chat thread on `/messages` to coordinate hackathon strategy. |
| **SC-03** | **Kabir Singh (`22BDS007`)**<br>Final Year Student | Create meme "Lavasa Monsoon Weather vs 8:30 AM Class" in `/studio` -> Add white text with black outline -> Insert umbrella sticker -> Test 20-step undo/redo controls -> Create sticker pack "Lavasa Survival Pack" -> Publish meme to Campus Feed -> Receive student comments and fire 🔥 reactions. |
| **SC-04** | **Ananya Patel (`23MBA004`)**<br>Cultural Guild President | Announce Cultural Fest auditions on `/clubs/cultural-guild` -> Attach audition banner -> Pin notice -> Create 5-member audition coordinator group chat on `/messages` -> Broadcast scheduling updates -> Verify member notification delivery. |
| **SC-05** | **Rohan Deshmukh (`24BBA051`)**<br>Privacy-Conscious Student | Configure dark theme & reduced motion in `/settings` -> Report spam comment on `/posts/101` -> Block abusive user -> Verify user posts & profile are hidden across Feed and Search -> Export personal data archive JSON -> Perform clean logout. |

---

## 5. Coverage Thresholds & Quality Gates

| Metric | Target Threshold | Rationale |
|---|---|---|
| **Tier 1 Feature Coverage** | >=5 test cases per screen group | Thorough happy-path validation for all 9 application route groups |
| **Tier 2 Boundary Tests** | >=5 test cases per boundary domain | Prevents regressions on character caps, format regex, closed states, and overflow |
| **Tier 3 Interaction Suites** | 5 pairwise integration suites | Proves contracts between independent subsystems hold seamlessly |
| **Tier 4 Real-World Journeys** | 5 persona-based E2E journeys | Validates holistic user experience in authentic Christ Lavasa workflows |
| **Suite Pass Rate** | **100% Pass** | Zero tolerance for flaky assertions or unhandled exceptions |
| **Zero Network Errors** | 0 external HTTP/WebSocket calls | Enforces complete offline isolation of the Client Mock Store |

---

## 6. Verification and Maintenance

When any route, contract, or mock store model is modified:
1. Re-run `npx vitest run tests/e2e` to confirm no regressions.
2. Invalidate tests only if an explicit user-facing requirement or contract was modified in `PROJECT.md`.
3. Keep test fixtures self-contained in `tests/e2e/helpers/` so tests remain fast and deterministic.
