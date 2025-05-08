**Providing API details**

The user wants an updated version of the previous API response with a more detailed breakdown. This time, they need the request and response pairs for each endpoint, but with IDs placed in the request body rather than in the URL path. They specifically mentioned that the IDs should not be in the path, and referenced a change in endpoint usage, such as switching from GET /payments/{paymentId} to POST /payments/get. I will reply directly here, giving a more detailed, formatted version of the API, suitable for GitHub.

**Crafting elaborative API documentation**

I’ll need to create a detailed API documentation snippet that includes the various endpoints. Each endpoint should define the correct method and reflect requests with IDs in the request body rather than the URL path. I’ll include examples for various successful and error responses (200 OK, 404 Not Found). I'll group the endpoints by category like Payments, Routine, Flashcards, and others. The goal is to provide a clean, concise document without overwhelming details, clearly mentioning the use of authentication tokens and IDs in the body where applicable. This will be delivered in chat.


Thought for 17 seconds


# Manetho API — Request / Response Cookbook

*(v1 · IDs always travel in the JSON body, never in the URL path)*

> **Base URL** `https://api.manetho.io/v1`  All timestamps UTC ISO‑8601
> **Auth header** `Authorization: Bearer <accessToken>`

---

## 0 · Common Error Envelope

```jsonc
{
  "status": 400,
  "error":  "ValidationError",
  "message": "password must be at least 8 characters"
}
```

| Code | Meaning      | Typical Cause              |
| ---- | ------------ | -------------------------- |
| 400  | Bad Request  | Body schema / validation   |
| 401  | Unauthorized | Missing / expired token    |
| 403  | Forbidden    | Role or plan restriction   |
| 404  | Not Found    | Unknown resourceId         |
| 409  | Conflict     | Duplicate (e‑mail, title…) |
| 429  | Rate Limit   | > 100 req/min (Free)       |
| 500  | Server Error | Unhandled exception        |

---

## 1 · Authentication

### 1.1  Sign‑Up   `POST /auth/signup`

```http
POST /auth/signup
Content‑Type: application/json
```

```json
// request
{
  "fullName": "Ada Lovelace",
  "email":    "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

```json
// 201 Created
{
  "userId":       "8f14e45f‑ea48‑4bb1‑bc02‑4fea8c737df1",
  "fullName":     "Ada Lovelace",
  "email":        "ada@example.com",
  "accessToken":  "eyJhbGciOi...",
  "refreshToken": "df1fb2e0‑bb56‑4e77‑86ba‑79ab0407a1af",
  "expiresIn":    900
}
```

### 1.2  Login   `POST /auth/login`

```json
{ "email": "ada@example.com", "password": "Str0ngP@ssw0rd!" }
```

```json
// 200 OK  (same envelope as sign‑up)
{ "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
```

### 1.3  Refresh Token   `POST /auth/refresh`

```json
{ "refreshToken": "df1fb2e0‑bb56‑4e77‑86ba‑79ab0407a1af" }
```

```json
{ "accessToken": "new...", "refreshToken": "new...", "expiresIn": 900 }
```

### 1.4  Logout   `POST /auth/logout`

```json
{ "refreshToken": "df1fb2e0‑bb56‑4e77‑86ba‑79ab0407a1af" }
```

`204 No Content`

---

## 2 · Payments

### 2.1  Create Intent   `POST /payments/intents`

```json
{
  "amount":   5000,       // cents / paisa
  "currency": "USD",
  "method":   "card"      // card | bkash | nagad
}
```

```json
// 201 Created
{
  "paymentId":    "pi_3Kk123",
  "clientSecret": "pi_3Kk123_secret_4H9x...",
  "status":       "requires_confirmation"
}
```

### 2.2  Get Intent   `POST /payments/get`

```json
{ "paymentId": "pi_3Kk123" }
```

```json
// 200 OK
{
  "paymentId": "pi_3Kk123",
  "amount":    5000,
  "currency":  "USD",
  "method":    "card",
  "status":    "succeeded",
  "createdAt": "2025‑05‑09T12:32:04Z"
}
```

### 2.3  Cancel Intent   `POST /payments/cancel`

```json
{ "paymentId": "pi_3Kk123" }
```

`204 No Content`   or   `404 Not Found`

### 2.4  Webhook   `POST /payments/webhook`

*(handled by gateway, signature‑verified; no auth required)*

---

## 3 · Flashcards

| Action      | Path                        | Notes          |
| ----------- | --------------------------- | -------------- |
| Generate    | `POST /flashcards/generate` | from notes/doc |
| Get deck    | `POST /flashcards/get`      | id in body     |
| Delete deck | `POST /flashcards/delete`   | id in body     |

### 3.1  Generate Deck

```json
{
  "notes": "Photosynthesis converts light energy...",
  "language": "en"
}
```

```json
// 200 OK
{
  "deckId": "2aa4444b‑f3d5‑40b2‑9d87‑d25b5e4b42a2",
  "cards": [
    { "q": "Define photosynthesis",        "a": "Process by which..." },
    { "q": "Where does photosynthesis occur?", "a": "Chloroplasts" }
  ],
  "created": "2025‑05‑09T13:01:00Z"
}
```

### 3.2  Get Deck

```json
{ "deckId": "2aa4444b‑f3d5‑40b2‑9d87‑d25b5e4b42a2" }
```

`404` if unknown.

---

## 4 · Routine Planner

| Verb    | Path              | Purpose        |
| ------- | ----------------- | -------------- |
| `POST`  | `/routine/create` | new routine    |
| `POST`  | `/routine/get`    | fetch one      |
| `PATCH` | `/routine/update` | partial update |
| `POST`  | `/routine/delete` | delete         |

### 4.1  Create Routine

```json
{
  "title":     "Math Revision",
  "startTime": "2025‑05‑10T18:00:00Z",
  "duration":  60,               // minutes
  "days":      ["Mon","Wed","Fri"]
}
```

```json
{
  "routineId": "9c3e66c2‑7e94‑4f05‑9983‑b8e84719a5a5",
  "title": "Math Revision",
  "nextRun": "2025‑05‑12T18:00:00Z"
}
```

### 4.2  Update Routine

```json
{
  "routineId": "9c3e66c2‑7e94‑4f05‑9983‑b8e84719a5a5",
  "duration":  90
}
```

---

## 5 · Practice Tests

| Verb   | Path                     | Purpose |
| ------ | ------------------------ | ------- |
| `POST` | `/practice-tests/create` |         |
| `POST` | `/practice-tests/get`    |         |
| `POST` | `/practice-tests/submit` |         |

### 5.1  Create Test

```json
{
  "title":         "Bio Midterm",
  "topics":        ["Respiration"],
  "numQuestions":  10,
  "timeLimit":     30          // minutes
}
```

```json
{
  "testId":     "4e02e8e4‑ad1a‑4a19‑8cc7‑3f5ced0109c9",
  "startUrl":   "https://app.manetho.io/tests/4e02e8e4..."
}
```

### 5.2  Submit

```json
{
  "testId":  "4e02e8e4‑ad1a‑4a19‑8cc7‑3f5ced0109c9",
  "answers": [{ "q": 1, "a": "B" }, { "q": 2, "a": "True" }]
}
```

```json
{
  "score": 8,
  "percent": 80,
  "rank": "Top 15 %"
}
```

---

## 6 · AI Chat

```http
POST /chat
```

```json
{
  "message": "Explain Maxwell's equations in simple terms",
  "context": [
    { "role": "assistant", "message": "Sure — what background do you have?" }
  ]
}
```

```json
{
  "reply": "Maxwell's equations describe how electric and magnetic fields...",
  "citations": [
    { "title": "Griffiths — EM (4th ed.)", "page": 300 }
  ],
  "tokensUsed": 512,
  "costUSD": 0.001
}
```

---

## 7 · Mind Map

```http
POST /mindmaps/generate
```

```json
{ "notes": "Newton's laws describe the relationship..." }
```

```json
{
  "mindMapId":   "d87c7941‑1f9e‑4cfe‑bb6a‑22bb1ec0cb60",
  "mindMapUrl":  "https://cdn.manetho.io/maps/d87c79.svg"
}
```

---

## 8 · Community

### 8.1  Create Thread   `POST /threads/create`

```json
{ "title": "Need help with FFT", "body": "Why does zero‑padding matter?" }
```

```json
{ "threadId": "b2a1f175‑c567‑470f‑93b8‑0d759b34b341" }
```

### 8.2  Post Message   `POST /threads/post`

```json
{
  "threadId": "b2a1f175‑c567‑470f‑93b8‑0d759b34b341",
  "content":  "It improves interpolation between bins…"
}
```

---

## 9 · Subscriptions

```http
POST /subscriptions          // create / change plan
POST /subscriptions/cancel   // cancel
POST /subscriptions/status   // get current
```

Example **status** request:

```json
{ "userId": "8f14e45f‑ea48‑4bb1‑bc02‑4fea8c737df1" }
```

```json
{
  "plan":       "Pro",
  "renewsOn":   "2025‑06‑09",
  "paymentId":  "pi_3Kk456"
}
```

---

### 🚀 Cost‑Saving Quick Wins ( <30 s pitch)

* Route large embedding jobs → Qdrant on t4g.small (‑55 % vector cost).
* Batch GPT prompts overnight; daylight traffic goes to GPT‑3.5, night traffic to Llama 2 spot (‑35 % token spend).
* Egress > 180 GB/mo? ‑‑› switch to MinIO/Hetzner (‑70 % bandwidth).

---
