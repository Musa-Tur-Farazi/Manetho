## 🧱 Core Tables

### 🔐 `users`

| Column         | Type      | Notes                         |
| -------------- | --------- | ----------------------------- |
| user\_id       | UUID (PK) | Unique user identifier        |
| full\_name     | VARCHAR   |                               |
| email          | VARCHAR   | Unique                        |
| password\_hash | VARCHAR   | Bcrypt-hashed                 |
| role           | ENUM      | `student`, `teacher`, `admin` |
| joined\_at     | TIMESTAMP |                               |
| is\_locked     | BOOLEAN   | For account locking           |

---

### 📥 `auth_tokens`

| Column         | Type      | Notes           |
| -------------- | --------- | --------------- |
| token\_id      | UUID (PK) |                 |
| user\_id       | UUID (FK) | → users         |
| refresh\_token | TEXT      | Stored securely |
| expires\_at    | TIMESTAMP |                 |
| last\_used\_at | TIMESTAMP |                 |

---

### 🗂️ `chats`

| Column      | Type      | Notes    |
| ----------- | --------- | -------- |
| chat\_id    | UUID (PK) |          |
| user\_id    | UUID (FK) | → users  |
| created\_at | TIMESTAMP |          |
| title       | VARCHAR   | Optional |

---

### 💬 `messages`

| Column      | Type      | Notes               |
| ----------- | --------- | ------------------- |
| message\_id | UUID (PK) |                     |
| chat\_id    | UUID (FK) | → chats             |
| sender\_id  | UUID (FK) | → users             |
| role        | ENUM      | `user`, `assistant` |
| content     | TEXT      |                     |
| timestamp   | TIMESTAMP |                     |

---

### 📎 `chat_files`

| Column       | Type      | Notes        |
| ------------ | --------- | ------------ |
| file\_id     | UUID (PK) |              |
| chat\_id     | UUID (FK) | → chats      |
| file\_name   | VARCHAR   |              |
| file\_url    | TEXT      | CDN location |
| uploaded\_at | TIMESTAMP |              |

---

### 📊 `usage_metrics`

| Column             | Type      | Notes             |
| ------------------ | --------- | ----------------- |
| user\_id           | UUID (PK) | → users           |
| total\_queries     | INT       |                   |
| prompt\_tokens     | BIGINT    | Internal tracking |
| completion\_tokens | BIGINT    | Internal tracking |

---

### 🧠 `flashcards_decks`

| Column      | Type      | Notes |
| ----------- | --------- | ----- |
| deck\_id    | UUID (PK) |       |
| user\_id    | UUID (FK) |       |
| created\_at | TIMESTAMP |       |

### 🧠 `flashcards`

| Column   | Type      | Notes               |
| -------- | --------- | ------------------- |
| card\_id | UUID (PK) |                     |
| deck\_id | UUID (FK) | → flashcards\_decks |
| question | TEXT      |                     |
| answer   | TEXT      |                     |

---

### 🕒 `routines`

| Column      | Type      | Notes                   |
| ----------- | --------- | ----------------------- |
| routine\_id | UUID (PK) |                         |
| user\_id    | UUID (FK) |                         |
| title       | VARCHAR   |                         |
| start\_time | TIMESTAMP |                         |
| duration    | INT       | Minutes                 |
| days        | TEXT\[]   | Array of weekday values |

---

### 🧷 `mindmaps`

| Column      | Type      | Notes   |
| ----------- | --------- | ------- |
| mindmap\_id | UUID (PK) |         |
| user\_id    | UUID (FK) |         |
| file\_url   | TEXT      | CDN SVG |
| created\_at | TIMESTAMP |         |

---

### 🧪 `practice_tests`

| Column      | Type      | Notes   |
| ----------- | --------- | ------- |
| test\_id    | UUID (PK) |         |
| user\_id    | UUID (FK) |         |
| title       | VARCHAR   |         |
| time\_limit | INT       | Minutes |
| created\_at | TIMESTAMP |         |

### 📌 `practice_test_submissions`

| Column         | Type      | Notes     |
| -------------- | --------- | --------- |
| submission\_id | UUID (PK) |           |
| test\_id       | UUID (FK) |           |
| user\_id       | UUID (FK) |           |
| score          | INT       | Raw score |
| submitted\_at  | TIMESTAMP |           |

---

### 🧵 `threads`

| Column      | Type      | Notes   |
| ----------- | --------- | ------- |
| thread\_id  | UUID (PK) |         |
| title       | VARCHAR   |         |
| body        | TEXT      |         |
| created\_by | UUID (FK) | → users |
| created\_at | TIMESTAMP |         |

### 💬 `comments`

| Column      | Type      | Notes     |
| ----------- | --------- | --------- |
| comment\_id | UUID (PK) |           |
| thread\_id  | UUID (FK) | → threads |
| sender\_id  | UUID (FK) | → users   |
| content     | TEXT      |           |
| timestamp   | TIMESTAMP |           |

---

### 📫 `direct_messages`

| Column        | Type      | Notes   |
| ------------- | --------- | ------- |
| message\_id   | UUID (PK) |         |
| sender\_id    | UUID (FK) |         |
| recipient\_id | UUID (FK) | → users |
| content       | TEXT      |         |
| timestamp     | TIMESTAMP |         |

---

### 📍 `reports`

| Column       | Type      | Notes                 |
| ------------ | --------- | --------------------- |
| report\_id   | UUID (PK) |                       |
| type         | ENUM      | `thread`, `comment`   |
| item\_id     | UUID      | ID of reported item   |
| reason       | TEXT      |                       |
| reported\_by | UUID (FK) |                       |
| timestamp    | TIMESTAMP |                       |
| status       | ENUM      | `pending`, `resolved` |

---

### 💰 `payments`

| Column      | Type      | Notes                                |
| ----------- | --------- | ------------------------------------ |
| payment\_id | UUID (PK) |                                      |
| user\_id    | UUID (FK) |                                      |
| amount      | INT       | Stored in smallest unit (e.g. paisa) |
| method      | ENUM      | `card`, `bkash`, `nagad`             |
| status      | ENUM      | `pending`, `succeeded`, etc.         |
| currency    | VARCHAR   | ISO 4217 code                        |
| timestamp   | TIMESTAMP |                                      |

---

### 📈 `analytics_daily`

| Column               | Type      | Notes |
| -------------------- | --------- | ----- |
| user\_id             | UUID (FK) |       |
| date                 | DATE      |       |
| flashcards\_reviewed | INT       |       |
| quiz\_score\_avg     | FLOAT     |       |
| streak\_days         | INT       |       |

---
