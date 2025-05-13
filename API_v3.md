# <div align="center">Manetho API Documentation </div>

### <div align="center">Structuring the Future of Learning</div>

<div align="center">2005032 · Rifat Hossain  2005034 · Gourab Biswas  2005038 · Musa Tur Farazi</div>

---

## Index
1. [Auth Module](#-auth-module)
2. [Admin](#admin)
3. [Dashboard](#-dashboard)   
4. [AI‑Chat](#-ai-chat)  
5. [Normal Chat (DM)](#normal-chat-dm)  
6. [Flashcards](#flashcards)  
7. [Routine Planner](#routine-planner)  
8. [Mind Maps](#mind-maps)  
9. [Practice Tests](#practice-tests)  
10. [Payments](#payments)  
11. [Analytics](#analytics)  
12. [Community Threads](#community-threads)  
13. [Cost‑Efficiency Playbook](#cost-efficiency-playbook)  
14. [Standard Error Envelope](#standard-error-envelope)  
15. [User Profile](#️-user-profile)  
16. [Forgot Password and Reset Password](#-forgot-password-and-reset-password)

---

## Global Specs
| Key | Value |
|-----|-------|
| **Base URL** | `https://api.manetho.io/v1` |
| **Content‑Type** | `application/json` |
| **Auth Header** | `Authorization: Bearer <JWT>` |
| **Version Pin** | `X‑API‑Version: 1.1` (optional) |
| **Trace Header** | `X‑Request‑Id: <uuid>` (optional) |
| **Rate‑Limit Headers** | `X‑RateLimit‑Limit / Remaining / Reset` |

---

## 🔐 Auth Module

Authentication is handled via JSON Web Tokens (**JWT**). Tokens are issued upon **login** or **sign-up** and must be included as a `Bearer` token in the `Authorization` header for protected endpoints.

### 🔑 Required Headers for Authenticated Requests

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

Optional headers:

* `X-API-Version: 1.1`
* `X-Request-Id: <uuid>`

---

```yaml
"password": {
  "type": "string",
  "description": "Plain text password. Will be bcrypt-hashed before storage."
}
```

### 🆕 Sign-Up

**`POST /auth/signup`**
Registers a new user.

#### ✅ Success — `201 Created`

**Request:**

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

**Response:**

```json
{
  "userId": "uuid",
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "expiresIn": 900
}
```

---

#### 🔴 Error Responses

**Missing or Invalid Fields — `400 Bad Request`**

**Request:**

```json
{
  "email": ""
}
```

**Response:**

```json
{
  "error": "InvalidInput",
  "message": "'email' is required."
}
```

---

**Email Already Exists — `409 Conflict`**

**Request:**

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

**Response:**

```json
{
  "error": "EmailExists",
  "message": "This email is already registered."
}
```

---

**Weak Password — `422 Unprocessable Entity`**

**Request:**

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "error": "WeakPassword",
  "message": "Password must include uppercase, number, and symbol."
}
```

---

**Too Many Requests — `429 Too Many Requests`**

**Request:**

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

**Response:**

```json
{
  "error": "RateLimitExceeded",
  "message": "Too many sign-up attempts. Please try again later."
}
```

---

**Internal Server Error — `500 Internal Server Error`**

**Request:**

```json
{
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

**Response:**

```json
{
  "error": "SignupFailed",
  "message": "Internal server error occurred."
}
```

### 🔓 Login

**`POST /auth/login`**
Authenticates an existing user.

#### ✅ Success — `200 OK`

**Request:**

```json
{
  "email": "ada@example.com",
  "password": "Str0ngP@ssw0rd!"
}
```

**Response:** *(same format as Sign-Up response)*

```json
{
  "userId": "uuid",
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "expiresIn": 900
}
```

---

#### 🔴 Error Responses

| Status  | Meaning             | Example Request                | Example Response                                                                 |
| ------- | ------------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| **400** | Missing field       | `{ "email": "" }`              | `{ "error": "MissingField", "message": "'email' is required." }`                 |
| **401** | Invalid credentials | `{ "password": "wrongpass" }`  | `{ "error": "InvalidCredentials", "message": "Incorrect email or password." }`   |
| **403** | Account locked      | After multiple failed attempts | `{ "error": "AccountLocked", "message": "Your account is temporarily locked." }` |
| **429** | Rate limit hit      | >5 attempts/min                | `{ "error": "RateLimitExceeded", "message": "Too many login attempts." }`        |
| **500** | Server error        | —                              | `{ "error": "LoginFailed", "message": "Internal server error occurred." }`       |

---

### 🔁 Refresh Token

**`POST /auth/refresh`**
Generates new access and refresh tokens using a valid refresh token.

#### ✅ Success — `200 OK`

**Request:**

```json
{
  "refreshToken": "valid-refresh-token"
}
```

**Response:**

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "rotated-refresh-token",
  "expiresIn": 900
}
```

---

#### 🔴 Error Responses

| Status  | Meaning               | Example Request | Example Response                                                                  |
| ------- | --------------------- | --------------- | --------------------------------------------------------------------------------- |
| **400** | Missing field         | `{}`            | `{ "error": "MissingRefreshToken", "message": "Refresh token is required." }`     |
| **401** | Invalid/expired token | invalid token   | `{ "error": "InvalidToken", "message": "Provided token is invalid or expired." }` |
| **403** | Token reuse detected  | replayed token  | `{ "error": "TokenReuseDetected", "message": "Refresh token reuse detected." }`   |
| **429** | Too many attempts     | Abuse detection | `{ "error": "RateLimitExceeded", "message": "Too many refresh requests." }`       |
| **500** | Server error          | —               | `{ "error": "TokenRefreshFailed", "message": "Could not refresh token." }`        |

---

### 🚪 Logout

**`POST /auth/logout`**
Revokes a refresh token.

#### ✅ Success — `204 No Content`

**Request:**

```json
{
  "refreshToken": "valid-refresh-token"
}
```

*(No response body returned.)*

---

#### 🔴 Error Responses

| Status  | Meaning         | Example Request | Example Response                                                           |
| ------- | --------------- | --------------- | -------------------------------------------------------------------------- |
| **400** | Missing token   | `{}`            | `{ "error": "MissingRefreshToken", "message": "Refresh token required." }` |
| **401** | Token not found | unknown token   | `{ "error": "InvalidToken", "message": "Refresh token not recognized." }`  |
| **500** | Server error    | —               | `{ "error": "LogoutFailed", "message": "Internal server error." }`         |

---

## 🙍‍♂️ User Profile

Manage user profile information.

### 📌 Get Profile

**`GET /auth/profile`**
Fetches profile details of the authenticated user.

#### ✅ Success — `200 OK`

**Request:**
*No request body needed.*

**Response:**

```json
{
  "userId": "uuid",
  "fullName": "Ada Lovelace",
  "email": "ada@example.com",
  "joinedAt": "2025-05-01T12:00:00Z",
  "subscriptionPlan": "Premium"
}
```

---

#### 🔴 Error Responses

**Unauthorized — `401 Unauthorized`**

**Request:**
*No JWT or invalid JWT token.*

**Response:**

```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid."
}
```

---

**Server Error — `500 Internal Server Error`**

**Request:**
*Valid JWT provided, but server fails to retrieve profile.*

**Response:**

```json
{
  "error": "ProfileFetchFailed",
  "message": "Unable to retrieve profile information."
}
```

---

### ✏️ Update Profile

**`PATCH /auth/profile`**
Updates user profile details.

#### ✅ Success — `200 OK`

**Request:**

```json
{
  "fullName": "Augusta Ada Lovelace"
}
```

**Response:**

```json
{
  "userId": "uuid",
  "fullName": "Augusta Ada Lovelace",
  "email": "ada@example.com",
  "joinedAt": "2025-05-01T12:00:00Z",
  "subscriptionPlan": "Premium"
}
```

---

#### 🔴 Error Responses

**Invalid Fields — `400 Bad Request`**

**Request:**

```json
{
  "fullName": ""
}
```

**Response:**

```json
{
  "error": "InvalidInput",
  "message": "'fullName' must not be empty."
}
```

---

**Unauthorized — `401 Unauthorized`**

**Request:**
*No JWT or invalid JWT token.*

**Response:**

```json
{
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid."
}
```

---

**Rate Limit Exceeded — `429 Too Many Requests`**

**Request:**
*Exceeding update frequency limits (e.g., >5 attempts/min).*

**Response:**

```json
{
  "error": "RateLimitExceeded",
  "message": "Too many profile updates. Please try again later."
}
```

---

**Internal Error — `500 Internal Server Error`**

**Request:**
*Server-side failure during profile update.*

**Response:**

```json
{
  "error": "ProfileUpdateFailed",
  "message": "Unable to update profile at this time."
}
```

---

## 🔑 Forgot Password and Reset Password

### 📩 Forgot Password

**`POST /auth/forgot-password`**
Initiates a password reset process by sending a reset link or OTP to the user's email.

#### ✅ Success — `200 OK`

**Request:**

```json
{
  "email": "ada@example.com"
}
```

**Response:**

```json
{
  "message": "If this email is registered, a reset link has been sent."
}
```

---

#### 🔴 Error Responses

**Missing Email — `400 Bad Request`**

**Request:**

```json
{}
```

**Response:**

```json
{
  "error": "MissingEmail",
  "message": "The 'email' field is required."
}
```

**Rate Limit Exceeded — `429 Too Many Requests`**

**Request:**

```json
{
  "email": "ada@example.com"
}
```

**Response:**

```json
{
  "error": "RateLimitExceeded",
  "message": "Too many reset attempts. Please wait before retrying."
}
```

**Server Error — `500 Internal Server Error`**

**Request:**

```json
{
  "email": "ada@example.com"
}
```

**Response:**

```json
{
  "error": "ForgotPasswordError",
  "message": "A server error occurred. Please try again later."
}
```

---

### 🔄 Reset Password

**`POST /auth/reset-password`**
Completes the password reset process using a valid reset token.

#### ✅ Success — `200 OK`

**Request:**

```json
{
  "resetToken": "abc123-reset-token",
  "newPassword": "NewStr0ngP@ss!"
}
```

**Response:**

```json
{
  "message": "Your password has been successfully reset."
}
```

---

#### 🔴 Error Responses

**Missing Fields — `400 Bad Request`**

**Request:**

```json
{
  "resetToken": ""
}
```

**Response:**

```json
{
  "error": "InvalidRequest",
  "message": "Both 'resetToken' and 'newPassword' fields are required."
}
```

**Invalid or Expired Token — `401 Unauthorized`**

**Request:**

```json
{
  "resetToken": "expired-token",
  "newPassword": "NewStr0ngP@ss!"
}
```

**Response:**

```json
{
  "error": "InvalidOrExpiredToken",
  "message": "The provided reset token is invalid or has expired."
}
```

**Weak Password — `422 Unprocessable Entity`**

**Request:**

```json
{
  "resetToken": "valid-token",
  "newPassword": "weak"
}
```

**Response:**

```json
{
  "error": "WeakPassword",
  "message": "Password must be at least 8 characters, including an uppercase letter, a number, and a special character."
}
```

**Server Error — `500 Internal Server Error`**

**Request:**

```json
{
  "resetToken": "valid-token",
  "newPassword": "NewStr0ngP@ss!"
}
```

**Response:**

```json
{
  "error": "ResetPasswordError",
  "message": "A server error occurred. Please try again later."
}
```

---

## 📊 Dashboard

Endpoints to support the user's dashboard with personalized summaries.

### `GET /dashboard/summary`

Returns an overview of the user’s academic activity.

#### ✅ Success — `200 OK`

**Response:**

```json
{
  "streakDays": 7,
  "flashcardsReviewed": 120,
  "practiceTestsTaken": 3,
  "mindMapsCreated": 2,
  "routineAdherenceRate": 87
}
```

---

### `GET /dashboard/activity-feed`

Returns recent learning actions in chronological order.

#### ✅ Success — `200 OK`

**Response:**

```json
{
  "events": [
    {
      "type": "flashcard-review",
      "detail": "Reviewed 20 flashcards from 'Biology'",
      "timestamp": "2025-05-12T19:30:00Z"
    },
    {
      "type": "practice-test",
      "detail": "Scored 82% on 'Algebra Midterm'",
      "timestamp": "2025-05-12T17:15:00Z"
    }
  ]
}
```

---

## 🤖 AI-Chat

---

### 1. `POST /ai-chat/message`

Send a message to the AI and receive a response.

**Request:**

```json
{
  "chatId": "abc123-chat-id",
  "message": "Explain Maxwell's equations in simple terms"
}
```

**Response:**

```json
{
  "reply": "Maxwell's equations describe how electric and magnetic fields interact...",
  "citations": [
    { "title": "Griffiths EM 4th ed.", "page": 300 }
  ]
}
```

---

### 2. `GET /ai-chat/history`

Retrieve full conversation history for a given chat session.

**Query Parameters:**

* `chatId` (string, required)
* `limit` (int, optional, default: 50)
* `cursor` (timestamp, optional)

**Response:**

```json
{
  "messages": [
    {
      "messageId": "msg_101",
      "role": "user",
      "content": "Explain Maxwell's equations.",
      "timestamp": "2025-05-09T15:22:11Z"
    },
    {
      "messageId": "msg_102",
      "role": "assistant",
      "content": "Maxwell's equations describe...",
      "timestamp": "2025-05-09T15:22:12Z"
    }
  ]
},
  "nextCursor": "1683631306"
}

```

---

### 3. `GET /ai-chat/message/{messageId}`

Fetch details of a specific message.

**Response:**

```json
{
  "messageId": "msg_101",
  "chatId": "abc123-chat-id",
  "role": "assistant",
  "content": "Here’s a simplified explanation...",
  "timestamp": "2025-05-09T15:22:11Z"
}
```

---

### 4. `DELETE /ai-chat/message/{messageId}`

Delete a specific message from a chat.

> ⚠️ This is irreversible. Client UI should confirm before sending the request.

**Response:**
`204 No Content`

---

### 5. `DELETE /ai-chat/chat/{chatId}`

Delete a full chat and all associated messages.

> ⚠️ This is irreversible. Prompt user confirmation in frontend.

**Response:**
`204 No Content`

---

### 6. `POST /ai-chat/upload`

Upload a file (e.g., PDF, DOCX, TXT) to be used as context in chat.

**Headers:**
`Content-Type: multipart/form-data`
`Authorization: Bearer <token>`

**Form Data:**

* `file`: attached file
* `chatId`: (optional) attach to an existing chat

**Response:**

```json
{
  "fileId": "file_98a73df",
  "fileName": "lecture_notes.pdf",
  "uploadTime": "2025-05-13T10:45:00Z",
  "message": "File uploaded successfully."
}
```

---

### 7. `GET /ai-chat/usage-summary`

Returns basic usage summary (for user/account dashboards).

**Response:**

```json
{
  "totalQueries": 1250
}
```

> ⚠️ Token-level usage (e.g., prompt/completion tokens) is tracked internally and not exposed via public API.

---

### 🔴 Error Responses

| Status | Reason         | Example                                                                             |
| -----: | -------------- | ----------------------------------------------------------------------------------- |
|  `400` | Invalid Input  | `{ "error": "InvalidInput", "message": "'message' is required." }`                  |
|  `401` | Unauthorized   | `{ "error": "Unauthorized", "message": "Missing or invalid token." }`               |
|  `403` | Forbidden      | `{ "error": "ForbiddenAction", "message": "Not allowed to access this resource." }` |
|  `404` | Not Found      | `{ "error": "NotFound", "message": "Chat or message does not exist." }`             |
|  `413` | File Too Large | `{ "error": "FileTooLarge", "message": "Upload must be under 10MB." }`              |
|  `500` | Internal Error | `{ "error": "AIProcessingError", "message": "Unexpected server error." }`           |


---



## Admin

Admin-only endpoints for moderation and financial analytics.

> 🔒 All routes require JWT with `role: admin` and are audit-logged. No private messages, academic notes, or unflagged content can be accessed.

---

### `GET /admin/reports`

Retrieve content reported by users or flagged by AI.

#### ✅ `200 OK`

```json
{
  "reports": [
    {
      "reportId": "rpt_2451",
      "type": "thread",
      "itemId": "th_1021",
      "reason": "Slang used in academic post",
      "reportedBy": "usr_3004",
      "timestamp": "2025-05-12T14:10:00Z",
      "status": "pending"
    }
  ]
}
```

---

### `DELETE /admin/threads/{threadId}`

Delete a reported public thread.

#### ✅ `204 No Content`

#### 🔴 `403 Forbidden` — if thread is unflagged

```json
{
  "error": "ForbiddenAction",
  "message": "Thread is not flagged. Admin cannot delete unreported content."
}
```

---

### `GET /admin/moderation-stats`

View platform-wide moderation metrics.

#### ✅ `200 OK`

```json
{
  "totalReports": 120,
  "autoFlaggedByAI": 74,
  "resolvedReports": 95,
  "pendingReports": 25
}
```

---

### `GET /admin/revenue-summary`

Aggregated financial data across plans. No personal billing info is returned.

#### ✅ `200 OK`

```json
{
  "month": "May 2025",
  "totalRevenueUSD": 12850,
  "activePlans": {
    "Basic": 120,
    "Standard": 85,
    "Premium": 45
  },
  "trends": {
    "monthOverMonth": "+12.4%",
    "churnRate": 3.1
  }
}
```

---

### Security Summary

* Admin-only JWT required
* All endpoints are rate-limited and audit-logged
* No access to unflagged content or private user data
* Designed for governance, not surveillance

---

## Normal Chat (DM)


> **Privacy bypass** – the client never sees raw `chatId`.
> • To **send** a message you either provide a `threadToken` (issued when the chat opens)
>   or just the `recipientId` (server resolves/creates the room).

### WebSocket 
`GET /chat/ws`

Upgrades with `Sec‑WebSocket‑Protocol: bearer,<JWT>`.

### Send Message 
`POST /chat/send`

<details><summary>Details</summary>

```json
{
  "recipientId": "8f14e45f-ea48-4bb1-bc02-4fea8c737df1",
  "content": "Finished the lab?"
}
```

**201 Created**

```json
{
  "messageId":  "c3aa4cd9-7c49-44ef-a1bf-3a989abdb66f",
  "threadToken": "th_f94c8e...",
  "timestamp":  "2025-05-09T15:22:11Z"
}
```

</details>

### History 
`GET /chat/history?threadToken=th_f94c8e...&limit=50&cursor=1683631306`

<details><summary>Response Body</summary>

```json
{
  "messages": [
    {
      "messageId": "c3aa4cd9-...",
      "senderId":  "8f14e45f-...",
      "content":   "Finished the lab?",
      "timestamp": "2025-05-09T15:22:11Z"
    }
  ],
  "nextCursor": "1683631244"
}
```

</details>

---

## Flashcards

<details><summary>Endpoints</summary>

| Verb   | Path                                           | Purpose                |
| ------ | ---------------------------------------------- | ---------------------- |
| POST   | `/flashcards`                                  | Generate deck          |
| GET    | `/flashcards?deckId=<id>&limit=50&cursor=<ts>` | Fetch deck             |
| DELETE | `/flashcards`                                  | `{ "deckId": "<id>" }` |

**Generate Example**

```json
{
  "notes": "Photosynthesis converts light energy...",
  "language": "en"
}
```

**200 OK**

```json
{
  "deckId": "2aa4444b-f3d5-40b2-9d87-d25b5e4b42a2",
  "cards": [
    { "q": "Define photosynthesis", "a": "Process by which..." }
  ],
  "createdAt": "2025-05-09T13:01:00Z"
}
```

</details>

---

## Routine Planner

<details><summary>Endpoints + Samples</summary>

*Create* `POST /routines`

```json
{
  "title":     "Math Revision",
  "startTime": "2025-05-10T18:00:00Z",
  "duration":  60,
  "days":      ["Mon", "Wed", "Fri"]
}
```

→ **201** `{ "routineId": "...", "nextRun": "2025-05-12T18:00:00Z" }`

*Update* `PATCH /routines`

```json
{ "routineId": "<uuid>", "duration": 90 }
```

*Delete* `DELETE /routines`

```json
{ "routineId": "<uuid>" }
```

</details>

---

## Mind Maps

<details><summary>Endpoints</summary>

*Generate* `POST /mindmaps`

```json
{ "notes": "Newton's laws describe the relationship..." }
```

→ **201** `{ "mindMapId":"...", "mindMapUrl":"https://cdn..." }`

*Get* `GET /mindmaps?mindMapId=<id>`

</details>

---

## Practice Tests

<details><summary>Endpoints</summary>

*Create* `POST /practice-tests`

```json
{
  "title": "Bio Midterm",
  "topics": ["Respiration"],
  "numQuestions": 10,
  "timeLimit": 30
}
```

→ **201** `{ "testId":"...", "startUrl":"https://app..." }`

*Submit* `POST /practice-tests/submit`

```json
{
  "testId": "<uuid>",
  "answers": [{ "q": 1, "a": "B" }]
}
```

→ **200** `{ "score":8,"percent":80,"rank":"Top 15 %" }`

</details>

---

## Payments

<details><summary>Endpoints</summary>

| Verb   | Path                               | Body                           |
| ------ | ---------------------------------- | ------------------------------ |
| POST   | `/payments/intents`                | `{ amount, currency, method }` |
| GET    | `/payments/intents?paymentId=<id>` | —                              |
| DELETE | `/payments/intents`                | `{ "paymentId": "<id>" }`      |
| POST   | `/payments/webhook`                | (gateway payload)              |

*Create Intent Example*

```json
{ "amount":5000, "currency":"USD", "method":"card" }
```

→ **201**

```json
{
  "paymentId":    "pi_3Kk123",
  "clientSecret": "pi_3Kk123_secret_4H9x...",
  "status":       "requires_confirmation"
}
```

</details>

---

## Analytics

`GET /analytics/summary`

<details><summary>Response</summary>

```json
{
  "dailyStreak": 17,
  "flashcardsReviewed": 420,
  "averageQuizScore": 82,
  "lastUpdated": "2025-05-09T14:00:00Z"
}
```

</details>

---

## Community Threads

<details><summary>Endpoints</summary>

*Create Thread* `POST /threads`

```json
{ "title": "Need FFT help", "body": "Why does zero‑padding matter?" }
```

→ **201** `{ "threadId":"..." }`

*Post Message* `POST /threads/post`

```json
{ "threadId":"...", "content":"It improves interpolation." }
```

*Get Messages* `GET /threads/messages?threadId=<id>&limit=50&cursor=<ts>`

</details>

---

## Cost‑Efficiency Playbook

| Layer          | First‑choice (cheap/managed) | Fallback / self‑host | Trigger                |
| -------------- | ---------------------------- | -------------------- | ---------------------- |
| LLM inference  | GPT‑3.5‑Turbo                | Llama 2 7B (spot)    | Token spend > \$200/mo |
| Vector DB      | Qdrant Cloud                 | Qdrant on t4g.small  | QPS > 200/s            |
| Object Storage | DO Spaces                    | MinIO + Hetzner      | Egress > 180 GB/mo     |
| Auth           | Auth0 Free                   | Keycloak             | MAU > 7 k              |

Routing cold traffic to fallback saves **30‑50 %** cloud spend.

---

## Standard Error Envelope

```json
{
  "status": 404,
  "error":  "NotFound",
  "message": "deckId does not exist",
  "requestId": "9a8d..."
}
```
