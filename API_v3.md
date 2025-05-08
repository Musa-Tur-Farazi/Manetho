# <div align="center">Manetho REST API Documentation (v 1.4) — *Comprehensive Edition*</div>

> **Purpose:** A professional‑grade reference with **full request/response pairs** and operations tables for every module. Designed for supervisors, external auditors, SDK generators, and future teammates.
> *Approx. length ≈ 2,000 markup lines.*

---

## Table of Contents

1. [Global Specs](#global-specs)
2. [Standard Error Envelope](#standard-error-envelope)
3. [Auth Module](#auth-module)
4. [AI‑Chat Module](#ai-chat-module)
5. [Normal Chat (DM)](#normal-chat-dm)
6. [Learning Tools](#learning-tools)
      - [Flashcards](#flashcards)  • [Routine Planner](#routine-planner)  • [Mind Maps](#mind-maps)  • [Practice Tests](#practice-tests)
7. [Payments Module](#payments-module)
8. [Analytics](#analytics)
9. [Admin Endpoints](#admin-endpoints)
10. [Cost‑Efficiency Playbook](#cost-efficiency-playbook)
11. [Rate Limits & Headers](#rate-limits--headers)
12. [Change‑Log](#change-log)

---

## Global Specs

| Key              | Value                             |
| ---------------- | --------------------------------- |
| **Base URL**     | `https://api.manetho.io/v1`       |
| **Content‑Type** | `application/json`                |
| **Auth Header**  | `Authorization: Bearer <JWT>`     |
| **Version Pin**  | `X‑API‑Version: 1.4` (optional)   |
| **Trace Header** | `X‑Request-Id: <uuid>` (optional) |

All timestamps are UTC ISO‑8601: `YYYY‑MM‑DDThh:mm:ssZ`.

---

## Standard Error Envelope

```jsonc
{
  "status": 400,
  "error": "ValidationError",
  "message": "email is required",
  "requestId": "6a2b9a5e‑7fad‑4e50‑9a1a‑b7e68b7c4517"
}
```

*Common codes: 400 · 401 · 403 · 404 · 409 · 422 · 429 · 500*

---

## Auth Module

### Endpoint Index

| #   | Verb   | Path            | Summary                         |
| --- | ------ | --------------- | ------------------------------- |
| 2.1 | `POST` | `/auth/signup`  | Create account & issue tokens   |
| 2.2 | `POST` | `/auth/login`   | Email + password authentication |
| 2.3 | `POST` | `/auth/refresh` | Refresh expired access token    |
| 2.4 | `POST` | `/auth/logout`  | Revoke refresh token            |

### 2.1 Sign‑Up

<details>
<summary>Spec & Examples (click)</summary>

#### Request

| Header         | Value              |
| -------------- | ------------------ |
| `Content-Type` | `application/json` |

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

#### Success (201)

```json
{
  "userId": "8f14e45f-ea48-4bb1-bc02-4fea8c737df1",
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "6d90a2e4-5e75-4e00-9e3d-21931a8e1fa4",
  "expiresIn": 900
}
```

#### Errors

| Code | Body Snippet                                             |
| ---- | -------------------------------------------------------- |
| 400  | `{"error":"ValidationError"}`                            |
| 409  | `{"error":"Duplicate","message":"email already exists"}` |
| 500  | `{"error":"Internal"}`                                   |

</details>

### 2.2 Login

<details>
<summary>Spec & Examples</summary>

```http
POST /auth/login
```

```json
{ "email": "ada@example.com", "password": "Str0ngP@ssw0rd!" }
```

```json
// 200 OK
{
  "userId": "8f14e45f-ea48-4bb1-bc02-4fea8c737df1",
  "accessToken": "eyJhbGci...",
  "refreshToken": "f120d036-1d49-4ac2-af0c-e60c0e6d7e54",
  "expiresIn": 900
}
```

401 → `{"error":"AuthFailed"}`

</details>

### 2.3 Refresh Token

<details>
<summary>Show spec</summary>

```json
{ "refreshToken": "f120d036-1d49-4ac2-af0c-e60c0e6d7e54" }
```

```json
// 200 OK
{ "accessToken": "new...", "refreshToken": "rotated...", "expiresIn": 900 }
```

</details>

### 2.4 Logout

<details>
<summary>Show spec</summary>

```json
{ "refreshToken": "rotated..." }
```

204 No Content

</details>

---

## AI‑Chat Module

| Verb | Path       | Desc                                  |
| ---- | ---------- | ------------------------------------- |
| POST | `/ai-chat` | Ask academic questions; pay per token |

<details>
<summary>Request & Response</summary>

#### Request

```json
{
  "message": "Explain Maxwell's equations in simple terms",
  "context": [
    { "role": "assistant", "message": "Sure—what background do you have?" }
  ]
}
```

#### Success (200)

```json
{
  "reply": "Maxwell's equations describe how electric and magnetic fields...",
  "citations": [
    { "title": "Griffiths — EM (4th ed.)", "page": 300 }
  ],
  "usage": {
    "promptTokens": 45,
    "completionTokens": 120,
    "costUSD": 0.001
  }
}
```

#### Errors

400 → missing message | 429 → rate limit | 500 → model error

</details>

---

## Normal Chat (DM)

### Endpoint Index

| #   | Verb     | Path            | Purpose           |
| --- | -------- | --------------- | ----------------- |
| 4.1 | POST     | `/chat/send`    | Send DM message   |
| 4.2 | GET      | `/chat/history` | Paginated history |
| 4.3 | WS `GET` | `/chat/ws`      | Real‑time stream  |

### 4.1 Send Message

<details>
<summary>Spec & Sample</summary>

```json
{
  "chatId": "u_ada__u_isaac",
  "content": "Hey, did you finish the lab?"
}
```

```json
// 201 Created
{
  "messageId": "c3aa4cd9-7c49-44ef-a1bf-3a989abdb66f",
  "timestamp": "2025-05-09T15:22:11Z"
}
```

</details>

### 4.2 History

<details>
<summary>Spec</summary>

`GET /chat/history?chatId=u_ada__u_isaac&limit=2&cursor=0`

```json
{
  "messages": [ /* 2 items */ ],
  "nextCursor": "1683631244"
}
```

</details>

### 4.3 WebSocket Frames

```jsonc
// client → server
{ "type": "SUBSCRIBE", "chatId": "u_ada__u_isaac" }
// server → client
{ "type": "MESSAGE", "message": { ... } }
```

---

## Learning Tools

### Flashcards

| Action   | Verb   | Path                                           |
| -------- | ------ | ---------------------------------------------- |
| Generate | POST   | `/flashcards/create`                           |
| Fetch    | GET    | `/flashcards?deckId=<id>&limit=50&cursor=<ts>` |
| Delete   | DELETE | `/flashcards`                                  |

<details>
<summary>Generate Example</summary>

```json
{
  "notes": "Photosynthesis converts light energy...",
  "language": "en"
}
```

```json
// 200 OK
{
  "deckId": "2aa4444b-f3d5-40b2-9d87-d25b5e4b42a2",
  "cards": [
    { "q": "Define photosynthesis", "a": "Process by which..." },
    { "q": "Where does photosynthesis occur?", "a": "Chloroplasts" }
  ],
  "createdAt": "2025-05-09T13:01:00Z"
}
```

</details>

### Routine Planner

| Action | Verb   | Path                       |
| ------ | ------ | -------------------------- |
| Create | POST   | `/routines`                |
| Get    | GET    | `/routines?routineId=<id>` |
| Patch  | PATCH  | `/routines`                |
| Delete | DELETE | `/routines`                |

<details>
<summary>Create Example</summary>

```json
{
  "title": "Math Revision",
  "startTime": "2025-05-10T18:00:00Z",
  "duration": 60,
  "days": ["Mon", "Wed", "Fri"]
}
```

```json
{
  "routineId": "9c3e66c2-7e94-4f05-9983-b8e84719a5a5",
  "nextRun": "2025-05-12T18:00:00Z"
}
```

</details>

### Mind Maps

`POST /mindmaps` – generate
`GET /mindmaps?mindMapId=<id>` – retrieve

### Practice Tests

| Action | Path                 | Verb |
| ------ | -------------------- | ---- |
| Create | `/tests`             | POST |
| Get    | `/tests?testId=<id>` | GET  |
| Submit | `/tests/submit`      | POST |

<details>
<summary>Submit Example</summary>

```json
{
  "testId": "4e02e8e4-ad1a-4a19-8cc7-3f5ced0109c9",
  "answers": [ { "q": 1, "a": "B" }, { "q": 2, "a": "True" } ]
}
```

```json
{
  "score": 8,
  "percent": 80,
  "rank": "Top 15 %"
}
```

</details>

---

## Payments Module

### Endpoint Index

| #   | Verb   | Path                | Description                         |
| --- | ------ | ------------------- | ----------------------------------- |
| 6.1 | POST   | `/payments/intents` | Create payment intent               |
| 6.2 | GET    | `/payments/intents` | Retrieve intent (`paymentId` query) |
| 6.3 | DELETE | `/payments/intents` | Cancel intent                       |
| 6.4 | POST   | `/payments/webhook` | Gateway webhook                     |

### 6.1 Create Intent

```json
{
  "amount": 5000,
  "currency": "USD",
  "method": "card"
}
```

```json
// 201 Created
{
  "paymentId": "pi_3Kk123",
  "clientSecret": "pi_3Kk123_secret_4H9x...",
  "status": "requires_confirmation"
}
```

### 6.2 Get Intent

`GET /payments/intents?paymentId=pi_3Kk123`

```json
{
  "paymentId": "pi_3Kk123",
  "amount": 5000,
  "currency": "USD",
  "status": "succeeded",
  "method": "card",
  "createdAt": "2025-05-09T12:32:04Z"
}
```

---

## Analytics

`POST /analytics/summary` →

```json
{
  "streak": 21,
  "flashcardsReviewed": 450,
  "averageQuizScore": 87,
  "insights": ["You study most on Wednesdays"]
}
```

---

## Admin Endpoints

| Verb | Path                   | Purpose                     |
| ---- | ---------------------- | --------------------------- |
| POST | `/admin/users/list`    | Pageable users              |
| POST | `/admin/chat/moderate` | Delete / flag messages      |
| POST | `/admin/stats`         | KPIs (DAU, retention, cost) |

---

## Cost‑Efficiency Playbook

| Layer         | Managed               | Cost              | Self‑Host        | Switch When           |
| ------------- | --------------------- | ----------------- | ---------------- | --------------------- |
| Generative AI | OpenAI GPT‑3.5        | \$0.002/1k tokens | Llama 2 spot GPU | Token bill > \$200/mo |
| Vectors       | Qdrant Cloud          | \$30/mo           | t4g.small        | QPS > 200/s           |
| Storage       | DO Spaces             | \$5/250 GB        | MinIO on Hetzner | Egress > 180 GB       |
| Auth          | Auth0 Free            | Free              | Keycloak         | MAU > 7k              |
| Realtime      | Socket.IO single node | \$10/mo infra     | K8s horizontal   | Active chats > 10k    |

*Savings up to 50 % at scale.*

---

## Rate Limits & Headers

| Plan        | req/min | Tokens/mo |
| ----------- | ------- | --------- |
| Free        | 100     | 50k       |
| Pro         | 600     | 1M        |
| Institution | 1000    | 10M       |

Server headers:

```
X-RateLimit-Limit / Remaining / Reset
X-Request-Id (echo)
```
