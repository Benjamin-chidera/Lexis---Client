# Legal Assistant — Frontend Client

> An AI-powered litigation command center built for corporate legal teams. The client provides a real-time, dark-themed interface for managing cases, conducting AI-assisted research, reviewing alerts, and communicating with an AI legal strategist via text and voice.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Dev Server](#running-the-dev-server)
  - [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Pages](#pages)
  - [Login (`/login`)](#login-login)
  - [Briefing (`/`)](#briefing-)
  - [Cases (`/cases`)](#cases-cases)
  - [Chat Room (`/chat`)](#chat-room-chat)
  - [Command Center — Alerts (`/alerts`)](#command-center--alerts-alerts)
  - [Case History (`/history`)](#case-history-history)
  - [Error (Catch-all)](#error-catch-all)
- [Components](#components)
  - [UI Primitives (`components/ui/`)](#ui-primitives-componentsui)
  - [Case Components (`components/` & `page/cases/`)](#case-components)
  - [Notifications (`components/notifications/`)](#notifications-componentsnotifications)
  - [Bottom Nav (`components/bottomNav/`)](#bottom-nav-componentsbottomnav)
  - [Chat Room Components (`components/chat-room/`)](#chat-room-components-componentschat-room)
  - [Protected Route](#protected-route)
- [State Management (Zustand Stores)](#state-management-zustand-stores)
  - [`authStore`](#authstore)
  - [`casesStore`](#casesstore)
  - [`alertStore`](#alertstore)
  - [`briefingStore`](#briefingstore)
- [Custom Hooks](#custom-hooks)
  - [`useCaseSocket`](#usecasesocket)
  - [`useVoiceCall`](#usevoicecall)
- [Real-Time Communication (Socket.IO)](#real-time-communication-socketio)
  - [Socket Events — Global (App Level)](#socket-events--global-app-level)
  - [Socket Events — Case Chat](#socket-events--case-chat)
  - [Socket Events — Voice Call](#socket-events--voice-call)
- [API Layer](#api-layer)
- [Styling](#styling)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)

---

## Overview

The Legal Assistant client is a single-page application (SPA) that gives attorneys and legal professionals a centralized workspace to:

1. **Create and manage litigation cases** — Track case status, assign attorneys, and upload evidence (PDFs, images, URLs, and free-text context).
2. **Chat with an AI legal strategist** — Ask questions about a case and receive research-backed responses. The AI runs a multi-agent pipeline (analyst → researcher → strategist) on the backend, and the client shows live stage indicators while the response is being generated.
3. **Conduct voice calls with the AI** — Use a real-time voice channel that captures microphone audio via an AudioWorklet, streams PCM16 chunks to the server, and plays back AI-generated speech.
4. **Monitor AI research alerts** — The Command Center page shows categorized alerts (urgent, strategic, routine) grouped by case. Each alert card renders its content as Markdown and includes an AI reasoning tooltip explaining why the result is relevant.
5. **Review case history** — Browse closed, archived, and resolved cases.

All protected pages require authentication. Session state is stored server-side via HTTP-only cookies, with a Zustand auth store managing the client-side user object.

---

## Tech Stack

| Category           | Technology                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Framework**      | [React 19](https://react.dev/) with TypeScript                                                  |
| **Build Tool**     | [Vite 8](https://vitejs.dev/) with the React Compiler (via `@vitejs/plugin-react` + Babel)       |
| **Styling**        | [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`) + vanilla CSS               |
| **State**          | [Zustand 5](https://zustand-demo.pmnd.rs/) (with `persist` middleware for auth)                  |
| **Routing**        | [React Router DOM 7](https://reactrouter.com/)                                                   |
| **HTTP Client**    | [Axios](https://axios-http.com/) + native `fetch`                                               |
| **Real-time**      | [Socket.IO Client 4](https://socket.io/docs/v4/client-api/)                                     |
| **Markdown**       | [react-markdown 10](https://github.com/remarkjs/react-markdown)                                  |
| **PDF Viewer**     | [react-pdf 10](https://github.com/wojtekmaj/react-pdf)                                          |
| **Toasts**         | [Sonner 2](https://sonner.emilkowal.dev/)                                                       |
| **Icons**          | [Lucide React](https://lucide.dev/)                                                              |
| **UI Primitives**  | [shadcn/ui](https://ui.shadcn.com/) (Button, Badge, Card, Tabs, Skeleton, AlertDialog, Input)    |
| **Animations**     | [tw-animate-css](https://www.npmjs.com/package/tw-animate-css) + CSS transitions                 |
| **Confetti**       | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) (for celebratory UI moments)     |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** (bundled with Node)
- The **backend server** must be running (FastAPI + Socket.IO) at the URL specified in your `.env` file

### Installation

```bash
cd client
npm install
```

### Environment Variables

Create a `.env` file in the `client/` directory (one already exists):

```env
# Backend API base URL — all REST and socket connections are derived from this.
# For local development:
VITE_API_URL=http://localhost:8000/api

# For production (example):
# VITE_API_URL=https://your-server.fly.dev/api
```

> **How it works:** The `VITE_API_URL` value is used directly for REST calls (e.g. `axios.get(\`${VITE_API_URL}/cases\`)`). For Socket.IO, the `/api` suffix is stripped automatically (see `src/lib/socket.ts`).

### Running the Dev Server

```bash
npm run dev
```

This starts Vite's development server with hot module replacement (HMR). By default it runs on `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

This runs `tsc -b` (TypeScript type checking) followed by `vite build`. Output goes to the `dist/` folder.

---

## Project Structure

```
client/
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite config (React, Tailwind, Babel, path aliases)
├── vercel.json                # Vercel SPA rewrite rules
├── tsconfig.json              # TypeScript project references
├── tsconfig.app.json          # App-level TypeScript config
├── tsconfig.node.json         # Node-level TypeScript config (Vite config)
├── eslint.config.js           # ESLint configuration
├── components.json            # shadcn/ui component configuration
├── .env                       # Environment variables (VITE_API_URL)
├── public/                    # Static assets served at root (favicon, audio-processor.js)
└── src/
    ├── main.tsx               # React DOM entry point — renders <App />
    ├── App.tsx                # Root component: routing, socket setup, session check
    ├── App.css                # Minimal global CSS overrides
    ├── index.css              # Tailwind imports and global design tokens
    │
    ├── lib/                   # Low-level utilities
    │   ├── api.ts             # File upload helpers (uploadPdfs, uploadImages)
    │   ├── socket.ts          # Socket.IO client singleton (WebSocket transport)
    │   └── utils.ts           # General utilities (cn — className merger)
    │
    ├── store/                 # Zustand state stores
    │   ├── authStore.ts       # Authentication (login, logout, session, roles)
    │   ├── casesStore.ts      # Case management (CRUD, messages, vault, AI state)
    │   ├── alertStore.ts      # AI research alerts (fetch, read, archive, incoming)
    │   └── briefingStore.ts   # Briefing form state (PDFs, URLs, images, context)
    │
    ├── hooks/                 # Custom React hooks
    │   ├── useCaseSocket.ts   # Socket listeners for AI chat responses & stage updates
    │   └── useVoiceCall.ts    # Full voice call lifecycle (mic, AudioWorklet, playback)
    │
    ├── page/                  # Top-level page components (one per route)
    │   ├── login/page.tsx
    │   ├── briefing/page.tsx
    │   ├── cases/             # Cases page + sub-components
    │   │   ├── page.tsx
    │   │   ├── CaseListCard.tsx
    │   │   ├── CaseModal.tsx
    │   │   ├── CaseChatPanel.tsx
    │   │   ├── CaseChatInput.tsx
    │   │   ├── CaseVaultPanel.tsx
    │   │   ├── VaultPdfViewer.tsx
    │   │   ├── VaultUrlCard.tsx
    │   │   └── CallModal.tsx
    │   ├── chat-room/page.tsx
    │   ├── call/page.tsx
    │   ├── CaseAlert/page.tsx
    │   ├── caseHistory/page.tsx
    │   ├── meetingHistory/     # (Currently disabled in routing)
    │   └── error/page.tsx
    │
    └── components/            # Shared/reusable components
        ├── ProtectedRoute.tsx # Auth gate — redirects to /login if unauthenticated
        ├── ui/                # shadcn/ui primitives
        │   ├── button.tsx
        │   ├── badge.tsx
        │   ├── card.tsx
        │   ├── tabs.tsx
        │   ├── input.tsx
        │   ├── skeleton.tsx
        │   ├── alert-dialog.tsx
        │   └── sonner.tsx
        ├── notifications/     # Alert notification system
        │   ├── BellDropdown.tsx
        │   ├── InAppNotification.tsx
        │   └── useNotificationSound.ts
        ├── bottomNav/         # Bottom navigation bar + input selectors
        │   ├── Bottom-Nav.tsx
        │   ├── pdf-selectors.tsx
        │   ├── image-selectors.tsx
        │   ├── urls.tsx
        │   └── text-mic-input.tsx
        ├── chat-room/         # Split-panel chat room components
        │   ├── left-split-section.tsx
        │   └── right-split-section.tsx
        ├── briefing/          # Briefing page sub-components
        ├── caseHistory/       # Case history sub-components
        ├── CaseAlert/         # Alert page sub-components
        ├── call/              # Voice call sub-components
        └── meetingHistory/    # Meeting history sub-components
```

---

## Routing

All routing is defined in `src/App.tsx` using React Router DOM v7. The `<AppChrome>` wrapper conditionally renders the bottom navigation bar and notification bell on every page except `/login`.

| Route        | Page Component    | Auth Required | Description                                  |
| ------------ | ----------------- | ------------- | -------------------------------------------- |
| `/login`     | `LoginPage`       | No            | Email + password authentication              |
| `/`          | `BriefingPage`    | Yes           | Home dashboard — daily briefing and intake   |
| `/cases`     | `CasesPage`       | Yes           | Active cases list, case modals, AI chat      |
| `/chat`      | `ChatRoomPage`    | Yes           | General AI chat room (not case-specific)     |
| `/alerts`    | `CaseAlertPage`   | Yes           | Command Center — AI research alerts          |
| `/history`   | `CaseHistoryPage` | Yes           | Closed/archived case history                 |
| `*`          | `ErrorPage`       | No            | 404 catch-all                                |

---

## Pages

### Login (`/login`)

The authentication page with a multi-step flow:

1. **Email check** — The user enters their corporate email. The server verifies the email exists and tells the client whether the user has already set a password.
2. **Password entry** — If the user has a password, they log in. If not, they set one (with confirmation).
3. **Session creation** — On success, the server sets an HTTP-only cookie and the client stores the user object in Zustand (persisted to `localStorage`).

### Briefing (`/`)

The home page / daily briefing screen. Serves as the main intake point where users can:
- Upload PDFs, images, and URLs as evidence
- Provide free-text context for new cases
- See a summary of current activity

Uses the `briefingStore` to manage local form state before submission.

### Cases (`/cases`)

The core case management page. Features include:

- **Case list** — Rendered by `CaseListCard`. Shows case name, type, attorney, status, and research progress. Each card is clickable to open the full case modal.
- **Case modal** (`CaseModal`) — A full-screen modal with two tabs:
  - **Chat tab** (`CaseChatPanel` + `CaseChatInput`) — A real-time chat interface with the AI legal strategist. Messages are rendered as Markdown. While the AI is generating a response, a live stage indicator shows which pipeline agent is active (analyst → researcher → strategist).
  - **Vault tab** (`CaseVaultPanel`) — An evidence vault where you can upload PDFs, images, URLs, and plain-text context. Uploaded PDFs can be previewed inline via `VaultPdfViewer`. URL evidence is rendered with metadata and summary via `VaultUrlCard`.
- **Voice call** (`CallModal`) — An overlay for real-time voice conversations with the AI about the active case.

### Chat Room (`/chat`)

A general-purpose AI chat page (not tied to a specific case). Rendered as a split-panel layout:

- **Left panel** (`left-split-section.tsx`) — Shows the AI's analysis output and research context.
- **Right panel** (`right-split-section.tsx`) — The chat message history and input area.

### Command Center — Alerts (`/alerts`)

The AI research alert dashboard. Key features:

- **Alert grouping** — Alerts are automatically grouped by `case_id`. Each group is collapsible, showing the case name and unread count.
- **Severity levels** — Three tiers with distinct visual styling:
  - 🔴 **Urgent** — Red accent, `AlertTriangle` icon
  - 🟣 **Strategic** — Purple accent, `Search` icon
  - 🔵 **Routine** — Cyan accent, `Activity` icon
- **Alert cards** — Each alert renders its `summary` as Markdown (with styled headings, links, lists, code blocks, and section dividers). Cards show:
  - Title, severity badge, and relative timestamp
  - A **Brain icon** that, on hover, reveals an AI reasoning tooltip explaining *why* this result is relevant to the case and how it can be used
  - A "Mark as Read" action button
- **Sidebar** — Shows:
  - **Active Vigilance** — Real-time counts for each severity level
  - **Deep Dig Status** — A live progress indicator showing how many cases have active background research running
- **Skeleton loading** — Full skeleton placeholders that match the exact card layout while data loads
- **Archive all** — A bulk action to archive every visible alert

### Case History (`/history`)

Browse cases that are no longer active (closed, archived, success, abandoned). Provides a read-only view of historical cases and their outcomes.

### Error (Catch-all)

A 404 page for unmatched routes.

---

## Components

### UI Primitives (`components/ui/`)

Built with [shadcn/ui](https://ui.shadcn.com/). These are low-level, reusable building blocks:

| Component      | File                | Purpose                                |
| -------------- | ------------------- | -------------------------------------- |
| `Button`       | `button.tsx`        | Variant-based button (default, outline, ghost, etc.) |
| `Badge`        | `badge.tsx`         | Small status/category labels           |
| `Card`         | `card.tsx`          | Container with header/content/footer   |
| `Tabs`         | `tabs.tsx`          | Tab navigation (used in case modals)   |
| `Input`        | `input.tsx`         | Styled text input                      |
| `Skeleton`     | `skeleton.tsx`      | Loading placeholder animations         |
| `AlertDialog`  | `alert-dialog.tsx`  | Confirmation modals                    |
| `Toaster`      | `sonner.tsx`        | Toast notification container (Sonner)  |

### Case Components

Located in `page/cases/`, these are tightly coupled to the cases feature:

| Component        | File                  | Purpose                                                   |
| ---------------- | --------------------- | --------------------------------------------------------- |
| `CaseListCard`   | `CaseListCard.tsx`    | Individual case card in the cases list                    |
| `CaseModal`      | `CaseModal.tsx`       | Full-screen case detail view (Chat + Vault tabs)          |
| `CaseChatPanel`  | `CaseChatPanel.tsx`   | Chat message list with AI typing indicator and stage updates |
| `CaseChatInput`  | `CaseChatInput.tsx`   | Message input with file upload triggers                   |
| `CaseVaultPanel` | `CaseVaultPanel.tsx`  | Evidence vault (upload/view PDFs, images, URLs, context)  |
| `VaultPdfViewer` | `VaultPdfViewer.tsx`  | Inline PDF preview using react-pdf                        |
| `VaultUrlCard`   | `VaultUrlCard.tsx`    | URL evidence card with metadata and summary               |
| `CallModal`      | `CallModal.tsx`       | Voice call overlay with live transcript and AI response    |

### Notifications (`components/notifications/`)

| Component              | File                        | Purpose                                               |
| ---------------------- | --------------------------- | ----------------------------------------------------- |
| `BellDropdown`         | `BellDropdown.tsx`          | Bell icon in the header with a dropdown list of recent alerts. Shows unread badge count. |
| `InAppNotification`    | `InAppNotification.tsx`     | Full-width slide-in notification that appears when a new alert arrives via socket. Auto-dismisses. |
| `playNotificationSound`| `useNotificationSound.ts`   | Plays an audio chime when a new real-time alert is received. |

### Bottom Nav (`components/bottomNav/`)

The bottom navigation bar and its associated input selectors:

| Component         | File                   | Purpose                                        |
| ----------------- | ---------------------- | ---------------------------------------------- |
| `BottomNav`       | `Bottom-Nav.tsx`       | Fixed bottom navigation with route links        |
| `PdfSelectors`    | `pdf-selectors.tsx`    | PDF file picker and upload trigger              |
| `ImageSelectors`  | `image-selectors.tsx`  | Image file picker and upload trigger            |
| `Urls`            | `urls.tsx`             | URL input and submission                        |
| `TextMicInput`    | `text-mic-input.tsx`   | Text/mic toggle input for evidence context      |

### Chat Room Components (`components/chat-room/`)

| Component             | File                       | Purpose                                     |
| --------------------- | -------------------------- | ------------------------------------------- |
| `LeftSplitSection`    | `left-split-section.tsx`   | AI analysis output panel                    |
| `RightSplitSection`   | `right-split-section.tsx`  | Chat message history and input              |

### Protected Route

`components/ProtectedRoute.tsx` — A wrapper component that checks the Zustand auth store. If the user is not authenticated, it redirects to `/login` using `<Navigate>`. All protected routes in `App.tsx` are wrapped with this component.

---

## State Management (Zustand Stores)

All global state is managed with [Zustand](https://zustand-demo.pmnd.rs/). Each store is a single file in `src/store/`.

### `authStore`

**File:** `src/store/authStore.ts`

Manages user authentication and session state. Persisted to `localStorage` under the key `legal-assistant-auth` (only the `user` field is persisted).

| Field / Method       | Type / Signature                                      | Description                                         |
| -------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `user`               | `AuthUser \| null`                                    | Current logged-in user (id, name, email, role)      |
| `isLoading`          | `boolean`                                             | True during login/password-set network requests     |
| `checkEmail(email)`  | `(email: string) => Promise<{ name, has_password }>`  | Verifies if a corporate email exists                |
| `login(email, pw)`   | `(email, password) => Promise<void>`                  | Authenticates and stores the user                   |
| `setPassword(...)`   | `(email, pw, confirm) => Promise<void>`               | First-time password setup for new users             |
| `logout()`           | `() => Promise<void>`                                 | Clears the server session and local state           |
| `checkSession()`     | `() => Promise<void>`                                 | Verifies the current cookie session on page load    |
| `isAuthenticated()`  | `() => boolean`                                       | Derived check: `user !== null`                      |
| `isAdmin()`          | `() => boolean`                                       | Derived check: `user.role === "admin"`              |

### `casesStore`

**File:** `src/store/casesStore.ts`

The largest store — manages the full lifecycle of cases, chat messages, the evidence vault, and AI response state.

| Field / Method              | Description                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `cases`                     | Array of all `Case` objects (fetched from the backend)                              |
| `activeCaseId`              | ID of the case currently open in the modal (null = no modal)                        |
| `activeCallCaseId`          | ID of the case in an active voice call (null = no call)                             |
| `isAiTyping`                | True while the AI is generating a response                                          |
| `researchStage`             | Current pipeline stage label (e.g. "Analyst reviewing context...")                  |
| `fetchCases()`              | Fetches all cases from `GET /cases`                                                 |
| `loadMessages(caseId)`      | Fetches persisted chat messages for a specific case                                 |
| `openCase(caseId)`          | Sets the active case (opens the modal)                                              |
| `closeCase()`               | Clears the active case (closes the modal)                                           |
| `startCall(caseId)`         | Sets the active call case                                                           |
| `endCall()`                 | Clears the active call case                                                         |
| `addMessage(caseId, msg)`   | Adds a user message locally (optimistic update)                                     |
| `addAiMessage(caseId, msg)` | Adds an AI response message (called from socket handler)                            |
| `addPdfsToVault(...)`       | Uploads PDFs via `POST /upload-pdfs` and refreshes the case list                    |
| `addImagesToVault(...)`     | Uploads images via `POST /upload-images` and refreshes the case list                |
| `addUrlToVault(...)`        | Submits a URL via `POST /cases/:id/add-url`                                         |
| `addContextToVault(...)`    | Submits free-text context via `POST /cases/:id/add-context`                         |
| `removeFromVault(...)`      | Removes a vault item locally                                                        |
| `updateCaseStatus(...)`     | Updates a case's status (active, closed, success, etc.)                             |

### `alertStore`

**File:** `src/store/alertStore.ts`

Manages AI research alerts and the real-time notification popup.

| Field / Method             | Description                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| `alerts`                   | Array of all `AlertItem` objects                                               |
| `isLoading`                | True during the initial fetch                                                  |
| `incomingAlert`            | The most recent alert received via socket (shown in the in-app notification)   |
| `fetchAlerts()`            | Fetches all alerts from `GET /alerts`                                          |
| `addIncomingAlert(alert)`  | Prepends a new alert and sets it as the incoming notification                  |
| `dismissIncomingAlert()`   | Clears the incoming alert popup                                                |
| `markAsRead(alertId)`      | Marks an alert as read via `PATCH /alerts/:id/read`                            |
| `archiveAll()`             | Archives all alerts via `PATCH /alerts/archive-all`                            |
| `getUnreadCount(state)`    | Helper: returns the count of unread alerts                                     |

**`AlertItem` shape:**

```typescript
interface AlertItem {
  id: number;
  case_id: number | null;
  case_name: string | null;
  title: string;
  summary: string;          // Markdown content
  ai_reasoning: string | null;  // Why the AI thinks this is relevant
  severity: "urgent" | "strategic" | "routine";
  status: "unread" | "read" | "archived";
  created_at: string;       // ISO timestamp
}
```

### `briefingStore`

**File:** `src/store/briefingStore.ts`

Manages the local form state for the briefing/intake page. Not persisted — resets on page refresh.

| Field / Method       | Description                                        |
| -------------------- | -------------------------------------------------- |
| `pdfs`               | Array of `File` objects (uploaded PDFs)             |
| `urls`               | Array of URL strings                               |
| `images`             | Array of `File` objects (uploaded images)           |
| `context`            | Free-text context string                           |
| `addPdfs(files)`     | Adds PDFs (deduplicates by filename)               |
| `addUrl(url)`        | Adds a URL (deduplicates)                          |
| `addImages(files)`   | Adds images (deduplicates by filename)             |
| `setContext(text)`   | Sets the free-text context                         |
| `clearAll()`         | Resets all fields to empty                         |

---

## Custom Hooks

### `useCaseSocket`

**File:** `src/hooks/useCaseSocket.ts`

Listens for AI chat-related socket events while a case modal is open. Should be called inside the `CaseModal` component so listeners are automatically cleaned up when the modal closes.

**Events handled:**

| Event            | Action                                                        |
| ---------------- | ------------------------------------------------------------- |
| `ai_typing`      | Shows the typing indicator in the chat panel                  |
| `ai_typing_done` | Hides the typing indicator (on error/timeout)                 |
| `ai_response`    | Adds the AI's completed message to the case in the store      |
| `stage_update`   | Updates the pipeline stage label (analyst → researcher → strategist) |

### `useVoiceCall`

**File:** `src/hooks/useVoiceCall.ts`

Manages the complete voice call lifecycle for a given case. Uses the Web Audio API with an AudioWorklet for real-time audio processing.

**How it works:**

1. **Start call** — Requests microphone access, creates an `AudioContext` (48kHz), loads the `audio-capture-processor` AudioWorklet module from `/audio-processor.js`, and connects the mic stream through the worklet.
2. **Audio streaming** — The worklet downsamples audio to PCM16 at 16kHz and sends chunks to the server via `socket.emit("audio_chunk", buffer)`.
3. **AI responses** — The server returns text transcriptions, AI text responses, and base64-encoded MP3 audio. The hook decodes and plays the audio.
4. **Interruption** — If the user speaks while the AI is talking, the AI audio is stopped immediately and the server is notified.
5. **Mute/unmute** — Toggles the microphone track's `enabled` property.
6. **End call** — Stops all media tracks, disconnects audio nodes, closes the AudioContext, and emits `end_call_session`.

**Returned values:**

```typescript
{
  startCall,       // () => Promise<void>
  endCall,         // () => void
  toggleMute,      // () => void
  callStatus,      // "idle" | "connecting" | "active" | "error"
  transcript,      // string — live user speech transcription
  aiResponse,      // string — AI text response
  isAiSpeaking,    // boolean — true while AI audio is playing
  isMuted,         // boolean — mic mute state
}
```

---

## Real-Time Communication (Socket.IO)

**File:** `src/lib/socket.ts`

A singleton Socket.IO client configured with:
- `autoConnect: false` — Connection is managed manually based on auth state
- `withCredentials: true` — Sends the HTTP-only session cookie automatically
- `transports: ["websocket"]` — Uses WebSocket transport only (no polling)

The server URL is derived from `VITE_API_URL` by stripping the `/api` suffix.

### Socket Events — Global (App Level)

Managed in `App.tsx`:

| Event            | Direction      | Description                                              |
| ---------------- | -------------- | -------------------------------------------------------- |
| `new_alert`      | Server → Client | A new research alert has been generated. Triggers notification sound, refreshes alerts and cases. |
| `research_error` | Server → Client | An error occurred during background research. Shows an error toast. |

### Socket Events — Case Chat

Managed by `useCaseSocket`:

| Event            | Direction      | Description                                              |
| ---------------- | -------------- | -------------------------------------------------------- |
| `ai_typing`      | Server → Client | AI is processing a response                              |
| `ai_typing_done` | Server → Client | AI has finished (or failed)                              |
| `ai_response`    | Server → Client | AI's completed message (`{ case_id, message }`)         |
| `stage_update`   | Server → Client | Pipeline stage change (`{ case_id, stage, message }`)   |

### Socket Events — Voice Call

Managed by `useVoiceCall`:

| Event                    | Direction       | Description                                   |
| ------------------------ | --------------- | --------------------------------------------- |
| `start_call_session`     | Client → Server | Initiates a call for a specific case          |
| `audio_chunk`            | Client → Server | Streams PCM16 audio data to the server        |
| `call_user_speaking`     | Client → Server | Notifies server that user interrupted the AI  |
| `call_ai_speaking_done`  | Client → Server | AI audio playback finished                    |
| `end_call_session`       | Client → Server | Ends the call session                         |
| `call_session_started`   | Server → Client | Call session is ready                         |
| `call_transcript`        | Server → Client | User speech transcription result              |
| `call_ai_text`           | Server → Client | AI text response                              |
| `call_ai_audio`          | Server → Client | AI audio response (base64 MP3)                |
| `call_interrupted`       | Server → Client | Server confirms AI interruption               |
| `call_error`             | Server → Client | Call error occurred                           |

---

## API Layer

**File:** `src/lib/api.ts`

Contains file upload helpers that use `FormData` with `fetch`:

| Function                         | Endpoint               | Description                           |
| -------------------------------- | ---------------------- | ------------------------------------- |
| `uploadPdfs(files, caseId?)`     | `POST /upload-pdfs`    | Uploads PDF files to the server       |
| `uploadImages(files, caseId?)`   | `POST /upload-images`  | Uploads image files to the server     |

All other API calls are made directly from the Zustand stores using `axios` or `fetch` with `credentials: "include"`.

---

## Styling

- **Tailwind CSS 4** — Integrated via `@tailwindcss/vite` plugin. Configured in `src/index.css`.
- **Design language** — Dark theme with a pure black (`#000`) background, `slate` text hierarchy, and accent colors per severity (red, purple, cyan).
- **Path alias** — `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- **Font** — [Geist Variable](https://vercel.com/font) via `@fontsource-variable/geist`.

---

## Deployment

The project includes a `vercel.json` with SPA rewrite rules, meaning it's configured for deployment on [Vercel](https://vercel.com/):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**To deploy:**

1. Push the `client/` directory to a Git repository.
2. Import the project in Vercel and set the **root directory** to `client`.
3. Set the `VITE_API_URL` environment variable to your production backend URL.
4. Vercel will automatically detect Vite and run `npm run build`.

---

## Scripts Reference

| Script          | Command            | Description                                   |
| --------------- | ------------------ | --------------------------------------------- |
| `dev`           | `vite`             | Start the dev server with HMR                 |
| `build`         | `tsc -b && vite build` | Type-check and build for production       |
| `lint`          | `eslint .`         | Run ESLint across the project                 |
| `preview`       | `vite preview`     | Preview the production build locally          |
