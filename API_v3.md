# <div align="center">Manetho API Documentation </div>

### <div align="center">Structuring the Future of Learning</div>

<div align="center">2005032 · Rifat Hossain  2005034 · Gourab Biswas  2005038 · Musa Tur Farazi</div>

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

---

## Global Specs

| Key              | Value                             |
| ---------------- | --------------------------------- |
| **Base URL**     | `https://api.manetho.io/v1`       |
| **Content‑Type** | `application/json`                |
| **Auth Header**  | `Authorization: Bearer <JWT>`     |
| **Version Pin**  | `X‑API‑Version: 1.5` (optional)   |
| **Trace**        | `X‑Request-Id: <uuid>` (optional) |

---

## Standard Error Envelope

```jsonc
{
  "status": 400,
  "error": "ValidationError",
  "message": "email is required",
  "requestId": "4d816e8a-aa32-4e0e-b0f8-b8c34e8d0154"
}
```

---

## 1  Auth Module

### Endpoint Index

| #   | Verb | Path            | Purpose              |
| --- | ---- | --------------- | -------------------- |
| 1.1 | POST | `/auth/signup`  | Register new user    |
| 1.2 | POST | `/auth/login`   | Obtain tokens        |
| 1.3 | POST | `/auth/refresh` | Rotate tokens        |
| 1.4 | POST | `/auth/logout`  | Revoke refresh token |

#### 1.1 Sign‑up

```http
POST /auth/signup
Content-Type: application/json
```

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

```json
// 201 Created
{
  "userId": "8f14e45f-ea48-4bb1-bc02-4fea8c737df1",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "6d90a2e4-5e75-4e00-9e3d-21931a8e1fa4",
  "expiresIn": 900
}
```

#### 1.2 Login

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

#### 1.3 Refresh Token

```http
POST /auth/refresh
```

```json
{ "refreshToken": "f120d036-1d49-4ac2-af0c-e60c0e6d7e54" }
```

```json
// 200 OK
{ "accessToken": "new...", "refreshToken": "rotated...", "expiresIn": 900 }
```

#### 1.4 Logout

```http
POST /auth/logout
Authorization: Bearer eyJ...
```

```json
{ "refreshToken": "rotated..." }
```

204 No Content

---

## 2  AI‑Chat Module

| Verb | Path       | Desc                 |
| ---- | ---------- | -------------------- |
| POST | `/ai-chat` | Conversational tutor |

```http
POST /ai-chat
Authorization: Bearer eyJ...
```

```json
{
  "message": "Explain Maxwell's equations simply",
  "context": []
}
```

```json
// 200 OK
{
  "reply": "Maxwell's equations describe...",
  "citations": [
    { "title": "Griffiths — EM (4th ed.)", "page": 300 }
  ],
  "usage": { "promptTokens": 45, "completionTokens": 120, "costUSD": 0.001 }
}
```

---

## 3  Normal Chat (DM)

### 3.1 Send Message

```http
POST /chat/send
Authorization: Bearer eyJ...
```

```json
{ "chatId": "u_ada__u_isaac", "content": "Finished the lab?" }
```

```json
// 201 Created
{ "messageId": "c3aa4cd9-7c49-44ef-a1bf-3a989abdb66f", "timestamp": "2025-05-09T15:22:11Z" }
```

### 3.2 History (Read) — **GET**

```http
GET /chat/history?chatId=u_ada__u_isaac&limit=50&cursor=0
Authorization: Bearer eyJ...
```

```json
{
  "messages": [ { "messageId": "c3aa4cd9-..." } ],
  "nextCursor": "1683631244"
}
```

### 3.3 WebSocket

```
GET /chat/ws
Sec-WebSocket-Protocol: bearer,<JWT>
```

---

## 4  Flashcards

| Action        | Verb   | Path                                           |
| ------------- | ------ | ---------------------------------------------- |
| Generate deck | POST   | `/flashcards`                                  |
| Fetch deck    | GET    | `/flashcards?deckId=<id>&limit=50&cursor=<ts>` |
| Delete deck   | DELETE | `/flashcards`                                  |

#### Generate Example

```json
{ "notes": "Photosynthesis converts light energy...", "language": "en" }
```

```json
{
  "deckId": "2aa4444b-f3d5-40b2-9d87-d25b5e4b42a2",
  "cards": [ { "q": "Define photosynthesis", "a": "Process by which..." } ],
  "createdAt": "2025-05-09T13:01:00Z"
}
```

---

## 5  Routine Planner

| Action | Verb   | Path                       |
| ------ | ------ | -------------------------- |
| Create | POST   | `/routines`                |
| Get    | GET    | `/routines?routineId=<id>` |
| Update | PATCH  | `/routines`                |
| Delete | DELETE | `/routines`                |

#### Create

```json
{ "title": "Math Revision", "startTime": "2025-05-10T18:00:00Z", "duration": 60, "days": ["Mon","Wed","Fri"] }
```

```json
{ "routineId": "9c3e66c2-7e94-4f05-9983-b8e84719a5a5", "nextRun": "2025-05-12T18:00:00Z" }
```

---

## 6  Mind Maps

| Verb | Path                       | Desc              |
| ---- | -------------------------- | ----------------- |
| POST | `/mindmaps`                | Generate mind map |
| GET  | `/mindmaps?mindMapId=<id>` | Retrieve meta     |

Generate Request:

```json
{ "notes": "Newton's laws describe..." }
```

```json
{ "mindMapId": "d87c7941-1f9e-4cfe-bb6a-22bb1ec0cb60", "mindMapUrl": "https://cdn.manetho.io/maps/d87c79.svg" }
```

---

## 7  Practice Tests

| Action | Verb | Path                 |
| ------ | ---- | -------------------- |
| Create | POST | `/tests`             |
| Get    | GET  | `/tests?testId=<id>` |
| Submit | POST | `/tests/submit`      |

Submit Example:

```json
{ "testId": "4e02e8e4-ad1a-4a19-8cc7-3f5ced0109c9", "answers": [ { "q": 1, "a": "B" } ] }
```

```json
{ "score": 8, "percent": 80, "rank": "Top 15 %" }
```

---

## 8  Payments

| Action        | Verb   | Path                               |
| ------------- | ------ | ---------------------------------- |
| Create intent | POST   | `/payments/intents`                |
| Get intent    | GET    | `/payments/intents?paymentId=<id>` |
| Cancel intent | DELETE | `/payments/intents`                |
| Webhook       | POST   | `/payments/webhook`                |

Create Request:

```json
{ "amount": 5000, "currency": "USD", "method": "card" }
```

```json
// 201
{ "paymentId": "pi_3Kk123", "clientSecret": "pi_3Kk123_secret_4H9x...", "status": "requires_confirmation" }
```

---

## 9  Analytics

`POST /analytics/summary`

```json
{ "from": "2025-01-01", "to": "2025-05-10" }
```

```json
{ "streak": 21, "flashcardsReviewed": 450, "avgQuiz": 87 }
```

---

## 10  Admin

| Verb | Path                   | Purpose               |
| ---- | ---------------------- | --------------------- |
| POST | `/admin/users/list`    | Pageable users        |
| POST | `/admin/chat/moderate` | Remove / flag message |
| POST | `/admin/stats`         | KPIs                  |

---

## 11  Cost‑Efficiency Playbook

| Layer        | Managed           | Cost             | Self‑Host             | Switch When |
| ------------ | ----------------- | ---------------- | --------------------- | ----------- |
| GPT‑3.5      | \$0.002/1k tokens | Llama 2 spot GPU | Token bill > \$200/mo |             |
| Qdrant Cloud | \$30/mo           | t4g.small        | QPS > 200/s           |             |
| DO Spaces    | \$5/250 GB-mo     | MinIO+Hetzner    | Egress > 180 GB       |             |

---

## 12  Rate Limits

| Plan        | req/min | Tokens/mo |
| ----------- | ------- | --------- |
| Free        | 100     | 50 k      |
| Pro         | 600     | 1 M       |
| Institution | 1000    | 10 M      |

Server headers: `X-RateLimit-Limit / Remaining / Reset`

---

    
