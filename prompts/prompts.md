# Project Requirements Document

This is the project requirement document. Please go through the document carefully and understand each and every requirement thoroughly. 

I want to start working on this application, and I have to complete it in the next 7 days. Please create a plan for this in 5 phases. We have to make this a monolithic application. Use these files to understand the backend and frontend technologies to be used.

---

## Phase 1 Prompt

You are a senior full-stack engineer.
I am starting Phase 1 of a production-grade social/community platform.
Your task is to implement Phase 1 with clean architecture, scalability, and production best practices.
First, outline the project structure. Then implement it step by step. Do not skip architectural reasoning.

This is Phase 1 of the plan. 

### Phase 1 — Foundation (Day 1)
**Goal:** Project setup, database, authentication, and base layout.

**Backend**
* [NEW] `server/` — Express.js app scaffold
  * Initialize Node.js + TypeScript + ESM project.
  * Configure Express with CORS, JSON parsing, and error middleware.
  * Set up Prisma with PostgreSQL connection.
* [NEW] `schema.prisma`
  * Define all core tables (User, Post, Comment, Like, Community, Report, etc.).
  * Run the initial migration.
* [NEW] Auth module (`server/src/routes/auth.ts`, `controllers/`, `services/`)
  * `POST /api/auth/signup` — register with email/password (bcrypt).
  * `POST /api/auth/login` — return JWT.
  * `GET /api/auth/me` — get the current user.
  * Zod validation on all inputs.
  * JWT middleware for protected routes.
  * Role-based middleware (`requireRole('admin', 'moderator')`).

**Frontend**
* [NEW] `client/` — Next.js app scaffold
  * Initialize Next.js with App Router + TypeScript + Tailwind CSS.
  * Install and configure Shadcn/UI.
  * Set up Redux store + RTK Query base API.
* [NEW] Layout & Navigation
  * App shell with sidebar navigation (responsive).
  * Role-aware nav items (Moderation for mods, Admin for admins, etc.).
  * Dark mode support.
* [NEW] Auth pages
  * Login page (`/login`) — email/password form, OAuth button (UI only).
  * Signup page (`/signup`) — email, password, display name, terms checkbox.

**Deliverables**
* ✅ Running backend with PostgreSQL connected.
* ✅ Auth endpoints working (signup, login, JWT).
* ✅ Frontend with navigation shell and auth flow.

Go through each and every requirement carefully. Understand it, and then start implementing. Also, use instructions in files `backend-guidelines.md` and `frontend-guidelines.md`.

---

## Phase 2 Prompt

We have completed Phase 1 (Project Setup, Auth, Base Layout).

Now we are starting Phase 2 — Content Publishing.

This is the plan you created for Phase 2. 

### Phase 2 — Content Publishing
**Goal:** Post CRUD, feed, profile, post lifecycle.

**Backend**
* [NEW] Post module
  * `POST /api/posts` — create a post (text, image, poll, thread).
  * `GET /api/posts/feed` — home feed (paginated, from followed users).
  * `GET /api/posts/:id` — single post with comments.
  * `PATCH /api/posts/:id` — edit post.
  * `DELETE /api/posts/:id` — soft delete.
  * `PATCH /api/posts/:id/status` — lifecycle transitions (draft → published → archived).
  * Post publishing rules (account age limits, community moderation gate).
* [NEW] Media upload (AWS S3)
  * File upload endpoint (`POST /api/upload`).
  * Store files in AWS S3 bucket via `@aws-sdk/client-s3`.
  * Return S3 URL for media references in posts.
* [NEW] Profile module
  * `GET /api/users/:id` — user profile + statistics.
  * `GET /api/users/:id/posts` — user's posts (paginated).
  * `PATCH /api/users/me` — update profile.
  * `POST /api/users/:id/follow` / `DELETE /api/users/:id/follow`.

**Frontend**
* [NEW] Home Feed page (`/feed`)
  * Infinite scroll post list.
  * Post cards with like/comment/repost/bookmark actions.
  * Quick report button on each post.
* [NEW] Create Post page (`/create`)
  * Rich text editor.
  * Media upload zone.
  * Poll builder (add/remove options).
  * Schedule toggle with date picker.
  * Community selector dropdown.
  * Save draft / Publish buttons.
* [NEW] Profile page (`/profile/[id]`)
  * Tabs: Posts, Replies, Media, Bookmarks, Followers, Following.
  * Follow/Unfollow button.
  * Edit profile modal (own profile).

**Deliverables**
* ✅ Full post CRUD with lifecycle.
* ✅ Feed with pagination.
* ✅ Profile with follow system.

While starting the implementation of Phase 2, please consider the points mentioned in `backend-guidelines.md`, `frontend-guidelines.md`, and `rules.md`.

---

## Phase 3 Prompt

Phases 1 and 2 of the application development are completed, and mostly all things are working as expected. 

Now you have to start with Phase 3. While working on Phase 3, make sure we don't break the existing functionality.

Follow these guidelines in Phase 3:
* Do NOT modify existing APIs unless strictly required.
* Follow the existing project structure and patterns.

### Phase 3 — Engagement & Communities (Day 3–4)
**Goal:** Social interactions, communities, explore, notifications.

**Backend**
* [NEW] Engagement module
  * `POST /api/posts/:id/like` / `DELETE /api/posts/:id/like`.
  * `POST /api/posts/:id/comments` — add a comment.
  * `POST /api/posts/:id/repost`.
  * `POST /api/posts/:id/bookmark` / `DELETE /api/posts/:id/bookmark`.
  * Engagement counters (likes, comments, reposts per post).
* [NEW] Community module
  * `POST /api/communities` — create a community.
  * `GET /api/communities` — list all.
  * `GET /api/communities/:id` — details + feed.
  * `POST /api/communities/:id/join` / `DELETE /api/communities/:id/leave`.
  * `GET /api/communities/:id/members` — member list.
  * Community-specific roles (owner, moderator, member).
* [NEW] Search module
  * `GET /api/search?q=...&type=posts|users|communities`.
  * Filters: date range, community, engagement threshold.
  * Trending hashtags calculation (simple keyword frequency).
* [NEW] Notification module
  * `GET /api/notifications` — list user notifications.
  * `PATCH /api/notifications/:id/read` — mark as read.
  * Create notifications on: like, comment, mention, follow, moderation decision.

**Frontend**
* [NEW] Communities page (`/communities`)
  * Community cards grid with join/leave buttons.
  * Community detail page with feed and member list.
  * Member management for moderators.
* [NEW] Explore page (`/explore`)
  * Trending hashtags section.
  * Suggested users carousel.
  * Search bar with advanced filters.
* [NEW] Notifications page (`/notifications`)
  * Notification list grouped by type.
  * Mark as read / mark all as read.
  * Click-to-navigate to referenced content.

**Deliverables**
* ✅ Like, comment, repost, bookmark working.
* ✅ Community CRUD and feeds.
* ✅ Search & explore functional.
* ✅ Notifications system working.

Also, follow the instructions that are mentioned in files `backend-guidelines.md`, `frontend-guidelines.md`, and `rules.md`.

---

## Backend Code Review Prompt

You are required to perform a backend code review using the attached `code-review.backend.md` document as your evaluation framework.

First, create a plan for the code review. I will review that plan, and after reviewing, you can start with the review. 

---

## Bug Report: My Posts Prompt

A bug has been identified in the application. Please follow the steps below to reproduce it, then analyze and report the root cause — do not implement any fix at this stage.

**Steps to Reproduce:**
1. Publish 2 posts.
2. Go to the "My Posts" section.
3. Verify that only the most recently published post is displayed — the earlier post is missing.
4. Additionally, observe that the same post incorrectly appears under multiple tabs (Published, Draft, and Archived), even though its status is set to 'Published'.

**Expected Behavior:** All published posts should appear in the "My Posts" section, and each post should only appear under its corresponding status tab.

**Task:** Identify and explain the root cause. Do not make any code changes yet.

You can test by opening the browser also.

---

## Frontend Code Review Prompt

You are required to perform a full frontend code review using the attached `code-review.frontend.md` document as your evaluation framework.

First, create a plan for the code review. I will review that plan, and after reviewing, you can start with the review.

---

## Phase 4 Prompt

Phases 1, 2, and 3 of the application development are completed, and mostly all things are working as expected.

Now you have to start with Phase 4. While working on Phase 4, make sure we don't break the existing functionality.
Follow these guidelines in Phase 4:
* Do NOT modify existing APIs unless strictly required.
* Follow the existing project structure and patterns.

### Phase 4 — Moderation & Reporting (Day 5–6)
**Goal:** Content reporting, risk scoring, moderation dashboard, account suspension.

**Backend**
* [NEW] Report module
  * `POST /api/reports` — submit a report (reason enum: HATE_SPEECH, SPAM, MISINFORMATION, HARASSMENT, NSFW).
  * `GET /api/reports` — list reports (moderator only, with filters).
  * `PATCH /api/reports/:id` — update status (lifecycle transitions).
  * Risk scoring: keyword-based + report count logic (AI integration planned for the future).
  * `reports_count > 5` → escalate.
  * Toxicity keywords list → auto-flag.
  * Architecture designed to plug in AI scoring later.
* [NEW] Moderation module
  * `GET /api/moderation/queue` — flagged posts queue.
  * `POST /api/moderation/:postId/approve`.
  * `POST /api/moderation/:postId/remove`.
  * `POST /api/moderation/:postId/warn-user`.
  * `POST /api/moderation/:postId/escalate`.
* [NEW] Account suspension module
  * `POST /api/users/:id/warn`.
  * `POST /api/users/:id/suspend` — temp/permanent.
  * `POST /api/users/:id/appeal` — user appeal.
  * `POST /api/users/:id/reinstate`.
  * Status lifecycle: ACTIVE → WARNING → TEMP_SUSPENDED → PERMANENTLY_BANNED → APPEAL → REINSTATED.

**Frontend**
* [NEW] Moderation Dashboard (`/moderation`) — Moderator role
  * Data grid: Post ID, User, Risk Score, Report Count, Category, Status, Date.
  * Filters: risk score range, report type, community, status, date range.
  * Action buttons: Approve, Remove, Warn, Escalate.
* [NEW] User Reports page (`/reports`) — Admin role
  * Suspension list tab.
  * Appeal list tab.
  * Repeat offenders tab.
  * Audit history tab (moderation actions log).

**Deliverables**
* ✅ Users can report content with reasons.
* ✅ Simplified risk scoring.
* ✅ Moderation queue with approve/remove/warn/escalate.
* ✅ Account suspension workflow.

Also, follow the instructions that are mentioned in files `backend-guidelines.md`, `frontend-guidelines.md`, and `rules.md`. First, create the plan, then I will review it, and once the review is complete, you can start with the implementation.

---

## Phase 5 Prompt

Phases 1, 2, 3, and 4 of the application development are completed, and mostly all things are working as expected.

Now you have to start with Phase 5. While working on Phase 5, make sure we don't break the existing functionality.
Follow these guidelines in Phase 5:
* Do NOT modify existing APIs unless strictly required.
* Follow the existing project structure and patterns.

### Phase 5 — Analytics, Compliance & Polish (Day 6–7)
**Goal:** Dashboards, compliance, admin settings, final polish.

**Backend**
* [NEW] Analytics module
  * `GET /api/analytics/creator` — engagement rate, post performance, follower growth.
  * `GET /api/analytics/admin` — active users, flagged ratio, moderation SLA, trending topics.
  * Simple aggregation queries via Prisma.
* [NEW] Compliance module
  * `POST /api/compliance/export` — request data export.
  * `GET /api/compliance/exports` — list exports.
  * `GET /api/compliance/audit-logs` — filtered audit log.
  * Data export: generate JSON file, return download link (24h expiry).
* [NEW] Admin settings module
  * `GET /api/admin/users` — user management list.
  * `PATCH /api/admin/users/:id/role` — change user role.
  * `GET /api/admin/settings` — system settings.
  * `PATCH /api/admin/settings` — update risk thresholds, rate limits, etc.

**Frontend**
* [NEW] Analytics Dashboard (`/analytics`)
  * Creator view: engagement chart, follower growth, post performance cards.
  * Admin view: active users chart, content growth, moderation SLA, abuse rate.
  * Charts using Recharts library.
* [NEW] Compliance page (`/compliance`)
  * Data export request form.
  * Export history table with download links.
  * Audit log viewer with filters.
  * Export options: CSV, JSON.
* [NEW] Admin page (`/admin`)
  * User management table (create moderator, suspend, change roles).
  * Moderation rule configuration (risk thresholds, auto-flag categories).
  * System settings (rate limits, retention policy).

**Final Polish**
* Loading states and error boundaries.
* Toast notifications (Shadcn/UI).
* Mobile-responsive tweaks.
* Seed data script for demo.

**Deliverables**
* ✅ Creator & admin analytics dashboards.
* ✅ Compliance with data export and audit logs.
* ✅ Admin settings panel.
* ✅ Polished, demo-ready application.

Also, follow the instructions that are mentioned in `backend-guidelines.md`, `frontend-guidelines.md`, and `rules.md`. First, create the plan, then I will review it, and once the review is complete, you can start with the implementation.

---

## Bug Report: Automatic Logout Prompt

There is another bug. 
**Steps to reproduce the bug:**
1. Log in.
2. Refresh the page.
3. You are automatically logged out.

---

## Bug Report: Like/Follow State Persistence Prompt

Now, there are two bugs. 
**The first one is:**
1. Log in.
2. Like 1 post.
3. Log out.
4. Log in again.
5. Your like is not visible on that post. Similar to Instagram, if you like a post, the like icon should show up in red color.

**And the same is happening for the follow button also:**
1. Follow a user.
2. Log out.
3. Go to the profile of that user. You see the "Follow" button, not "Unfollow".

---

## UI/UX Improvement Prompt

Act as a senior UI/UX designer.

Analyze the UI of my application and suggest improvements to make it more user-friendly, visually appealing, and intuitive.

Focus on the following areas:
- Layout and visual hierarchy.
- Spacing, alignment, and consistency.
- Typography and readability.
- Color usage and contrast.
- Accessibility and usability.
- Navigation clarity.
- Responsiveness and mobile experience.
- Reducing cognitive load for users.

For each suggestion:
1. Explain the problem in the current design.
2. Provide a clear improvement recommendation.
3. Explain why the improvement will enhance the user experience.

If possible, also suggest modern UI patterns or components that can improve the design.

Now, open the browser, go through the application, and then improve the UI/UX. Also, make the UI responsive.
