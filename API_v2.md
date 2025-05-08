# <div align="center">Manetho API Documentation (v 1.2)</div>

### <div align="center">Structuring the Future of Learning</div>

<div align="center">2005032 · Rifat Hossain  2005034 · Gourab Biswas  2005038 · Musa Tur Farazi</div>

---

## Index

1. [Auth Module](#1-auth-module)
2. [AI‑Chat Module](#2-ai-chat-module)
3. [Normal Chat (DM)](#3-normal-chat-dm)
4. [Learning Tools](#4-learning-tools)
       4.1 [Flashcards](#41-flashcards) 4.2 [Routine Planner](#42-routine-planner) 4.3 [Mind Maps](#43-mind-maps) 4.4 [Practice Tests](#44-practice-tests)
5. [Payments Module](#5-payments-module)
6. [Analytics](#6-analytics)
7. [Admin Module](#7-admin-module)
8. [Error Envelope](#8-standard-error-envelope)
9. [Headers · Rate Limits](#9-headers--rate-limits)
10. [Change‑log](#changelog)

---

## Global Specs

| Key                    | Value                         |
| ---------------------- | ----------------------------- |
| **Base URL**           | `https://api.manetho.io/v1`   |
| **Content‑Type**       | `application/json`            |
| **Auth Header**        | `Authorization: Bearer <JWT>` |
| **Version Pin (opt.)** | `X‑API‑Version: 1.2`          |

---

## 1  Auth Module

| Endpoint        | Verb   | Purpose                   |
| --------------- | ------ | ------------------------- |
| `/auth/signup`  | `POST` | Create account            |
| `/auth/login`   | `POST` | Email + password          |
| `/auth/refresh` | `POST` | New tokens                |
| `/auth/logout`  | `POST` | Invalidate `refreshToken` |

<details>
<summary><strong>1.1 Sign‑Up <code>POST /auth/signup</code></strong></summary>

> **Request**
>
> ```json
> {
>   "fullName": "Ada Lovelace",
>   "email": "ada@example.com",
>   "password": "Str0ngP@ssw0rd!"
> }
> ```
>
> **201 Created**
>
> ```json
> {
>   "userId": "8f14e45f-ea48-4bb1-bc02-4fea8c737df1",
>   "fullName": "Ada Lovelace",
>   "email": "ada@example.com",
>   "accessToken": "eyJhbGciOi...",
>   "refreshToken": "df1f‑bb56‑4e77‑86ba‑79ab0407a1af",
>   "expiresIn": 900
> }
> ```
>
> **Errors:** 400 invalid, 409 duplicate

</details>

*(Login / Refresh / Logout follow same envelope—see appendix).*

---

## 2  AI‑Chat Module

Interactive LLM tutor. Billed per token.

| Endpoint   | Verb   |
| ---------- | ------ |
| `/ai-chat` | `POST` |

> **Request**
>
> ```json
> {
>   "message": "Explain Maxwell's equations simply",
>   "context": [
>     { "role": "assistant", "message": "Sure—what background do you have?" }
>   ]
> }
> ```
>
> **200 OK**
>
> ```json
> {
>   "reply": "Maxwell's equations describe how ...",
>   "citations": [
>     { "title": "Griffiths EM 4th ed.", "page": 300 }
>   ],
>   "usage": { "promptTokens": 45, "completionTokens": 120, "costUSD": 0.001 }
> }
> ```

---

## 3  Normal Chat (DM)

Messenger‑style human‑to‑human chat.

| Endpoint        | Verb       | Purpose           |
| --------------- | ---------- | ----------------- |
| `/chat/send`    | `POST`     | Send message      |
| `/chat/history` | `POST`     | Paginated history |
| `/chat/ws`      | `GET` (WS) | Real‑time stream  |

**Send**

```json
POST /chat/send
{
  "chatId": "u_ada__u_isaac",
  "content": "Finished the lab?"
}
```

**WS Event Shapes**

```json
{ "type": "MESSAGE", "chatId": "...", "message": { "id": "...", "content": "..."} }
```

IDs (`chatId`, `messageId`) always inside payload.

---

## 4  Learning Tools

### 4.1 Flashcards

| Endpoint             | Verb   | Purpose                     |
| -------------------- | ------ | --------------------------- |
| `/flashcards/create` | `POST` | Generate deck               |
| `/flashcards/get`    | `POST` | Fetch deck (body: `deckId`) |
| `/flashcards/delete` | `POST` | Remove deck                 |

**Generate**

```json
{
  "notes": "Photosynthesis converts light energy...",
  "language": "en"
}
```

**200 OK**

```json
{
  "deckId": "2aa4444b‑f3d5‑40b2‑9d87‑d25b5e4b42a2",
  "cards": [
    { "q": "Define photosynthesis", "a": "Process by which..." }
  ],
  "createdAt": "2025‑05‑09T13:01:00Z"
}
```

### 4.2 Routine Planner

\| `/routine/create` `POST` | body: title, days, startTime, duration |
\| `/routine/get` `POST` | body: `routineId` |
\| `/routine/update` `PATCH` | body: `routineId` + partial |
\| `/routine/delete` `POST` | body: `routineId` |

### 4.3 Mind Maps

`POST /mindmaps/generate` → returns `mindMapId`, `mindMapUrl` (SVG/PNG).
`POST /mindmaps/get` with `mindMapId` → metadata.

### 4.4 Practice Tests

| Endpoint               | Verb |
| ---------------------- | ---- |
| `/tests/create` `POST` |      |
| `/tests/get` `POST`    |      |
| `/tests/submit` `POST` |      |

Submit example:

```json
{
  "testId": "4e02e8e4‑ad1a‑4a19‑8cc7‑3f5ced0109c9",
  "answers": [{ "q": 1, "a": "B" }]
}
```

---

## 5  Payments Module

All IDs in body.

| Purpose         | Endpoint            | Verb                 |
| --------------- | ------------------- | -------------------- |
| Create intent   | `/payments/intents` | `POST`               |
| Get intent      | `/payments/get`     | `POST` (`paymentId`) |
| Cancel          | `/payments/cancel`  | `POST`               |
| Gateway webhook | `/payments/webhook` | `POST`               |

**Create**

```json
{
  "amount": 5000,
  "currency": "USD",
  "method": "card"
}
```

**201**

```json
{
  "paymentId": "pi_3Kk123",
  "clientSecret": "pi_3Kk123_secret_4H9x...",
  "status": "requires_confirmation"
}
```

---

## 6  Analytics

`POST /analytics/summary` (body optional filters) → study streaks, quiz scores, flashcard stats.

---

## 7  Admin Module

*(JWT must have role = admin)*

| Endpoint                | Verb                 | Purpose        |
| ----------------------- | -------------------- | -------------- |
| `/admin/users/list`     | `POST`               | pageable users |
| `/admin/courses/import` | `POST` (multipart)   |                |
| `/admin/chat/moderate`  | `POST` (`messageId`) |                |
| `/admin/stats`          | `POST`               | platform KPIs  |

---

## 8  Standard Error Envelope

```json
{
  "status": 400,
  "error": "ValidationError",
  "message": "password too weak",
  "requestId": "9a8d‑e191‑48d0‑9aba‑1b01af62c1b0"
}
```

Common codes: 400, 401, 403, 404, 409, 422, 429, 500.

---

## 9  Headers · Rate Limits

Server returns:

```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 213
X-RateLimit-Reset: 1715253600
```

Exceed → **429** with `Retry‑After`.
