# 🗄️ Manetho Database Schema

This document provides a comprehensive overview of the Manetho educational platform database schema.

## 📊 Overview

The database is designed to support a comprehensive educational platform with the following core features:
- User management with role-based access
- Learning content (subjects, topics, flashcards, mind maps)
- **🤖 AI-powered content generation and auto-updating**
- **📅 Intelligent study routines with adaptive scheduling**
- Practice tests and assessments
- AI-powered chat system
- Community features (threads, comments, direct messaging)
- Progress tracking and analytics
- Subscription and payment management
- Achievement system
- File management and notifications
- **🔄 Content versioning and performance tracking**

## 🏗️ Database Architecture

### Technology Stack
- **Database**: PostgreSQL (via Neon)
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Language**: TypeScript

### Schema Organization

The schema is organized into logical groups:

1. **Core Tables** - User management and authentication
2. **Learning Content** - Educational materials and structure
3. **Communication** - Chat, messaging, and community features
4. **Analytics & Progress** - Learning tracking and achievements
5. **Business** - Subscriptions, payments, and moderation
6. **AI & Automation** - Content generation, templates, and auto-updating
7. **Utility** - Notifications and file management

## 📋 Table Definitions

### 🔐 Core Tables

#### `users`
Primary user table with authentication and basic profile information.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID (PK) | Unique user identifier |
| `clerk_id` | VARCHAR | Clerk authentication ID |
| `full_name` | VARCHAR | User's full name |
| `email` | VARCHAR | Email address (unique) |
| `role` | ENUM | User role: student, teacher, admin |
| `joined_at` | TIMESTAMP | Account creation date |
| `is_locked` | BOOLEAN | Account lock status |
| `last_active_at` | TIMESTAMP | Last activity timestamp |
| `avatar_url` | TEXT | Profile picture URL |

#### `user_profiles`
Extended user profile information.

| Column | Type | Description |
|--------|------|-------------|
| `profile_id` | UUID (PK) | Profile identifier |
| `user_id` | UUID (FK) | Reference to users table |
| `bio` | TEXT | User biography |
| `grade` | VARCHAR | Academic grade/level |
| `school` | VARCHAR | School/institution name |
| `date_of_birth` | DATE | Birth date |
| `country` | VARCHAR | Country of residence |
| `timezone` | VARCHAR | User's timezone |
| `preferred_language` | VARCHAR | Language preference |
| `study_goals` | TEXT | Learning objectives |

#### `auth_tokens`
Refresh token management for authentication.

### 📚 Learning Content Tables

#### `subjects`
Academic subjects available on the platform.

| Column | Type | Description |
|--------|------|-------------|
| `subject_id` | UUID (PK) | Subject identifier |
| `name` | VARCHAR | Subject name |
| `description` | TEXT | Subject description |
| `icon_url` | TEXT | Subject icon URL |
| `color` | VARCHAR | Theme color (hex) |
| `is_active` | BOOLEAN | Active status |

#### `topics`
Topics/chapters within subjects.

| Column | Type | Description |
|--------|------|-------------|
| `topic_id` | UUID (PK) | Topic identifier |
| `subject_id` | UUID (FK) | Parent subject |
| `name` | VARCHAR | Topic name |
| `description` | TEXT | Topic description |
| `difficulty` | ENUM | beginner, intermediate, advanced |
| `order_index` | INTEGER | Display order |

#### `flashcard_decks`
Collections of flashcards for studying.

#### `flashcards`
Individual flashcard questions and answers.

#### `mind_maps`
Visual learning aids and concept maps.

#### `practice_tests`
Test definitions and configurations.

#### `test_questions`
Individual questions within practice tests.

#### `practice_test_submissions`
User test attempts and results.

### 💬 Communication Tables

#### `chats`
AI chat sessions between users and the system.

#### `messages`
Individual messages within chat sessions.

#### `chat_files`
File attachments in chat conversations.

#### `threads`
Community discussion threads.

#### `comments`
Comments on discussion threads (supports nested replies).

#### `direct_messages`
Private messages between users.

### 📈 Analytics & Progress Tables

#### `usage_metrics`
User activity and API usage tracking.

#### `learning_progress`
Subject and topic completion tracking.

#### `study_streaks`
Daily study streak management.

#### `achievements`
Available achievements and badges.

#### `user_achievements`
User-earned achievements.

#### `study_sessions`
Individual learning session records.

### 💰 Business Tables

#### `subscription_plans`
Available subscription tiers and pricing.

#### `user_subscriptions`
User subscription status and history.

#### `payments`
Payment transaction records.

#### `reports`
Content moderation and user reports.

### 🔧 Utility Tables

#### `notifications`
User notification system.

#### `file_uploads`
File management and storage tracking.

### 🤖 AI & Automation Tables

#### `ai_content_templates`
Reusable templates for AI content generation.

| Column | Type | Description |
|--------|------|-------------|
| `template_id` | UUID (PK) | Template identifier |
| `name` | VARCHAR | Template name |
| `content_type` | ENUM | Type of content to generate |
| `prompt_template` | TEXT | AI prompt with placeholders |
| `system_prompt` | TEXT | System instructions for AI |
| `parameters` | JSONB | Template parameters and constraints |
| `success_rate` | DECIMAL | Success rate of generations |
| `usage_count` | INTEGER | Number of times used |

#### `ai_generation_jobs`
Tracks AI content generation requests and their status.

| Column | Type | Description |
|--------|------|-------------|
| `job_id` | UUID (PK) | Job identifier |
| `user_id` | UUID (FK) | User who requested generation |
| `template_id` | UUID (FK) | Template used |
| `status` | ENUM | pending, generating, completed, failed |
| `progress` | INTEGER | Generation progress (0-100) |
| `result` | JSONB | Generated content |
| `quality_score` | DECIMAL | AI-assessed quality score |

#### `study_routines`
AI-generated and user-created study schedules.

| Column | Type | Description |
|--------|------|-------------|
| `routine_id` | UUID (PK) | Routine identifier |
| `user_id` | UUID (FK) | Owner of the routine |
| `name` | VARCHAR | Routine name |
| `schedule` | JSONB | Complex schedule configuration |
| `auto_update_enabled` | BOOLEAN | Enable AI auto-updates |
| `update_frequency` | ENUM | How often to update |
| `adapt_to_progress` | BOOLEAN | Adapt based on user progress |
| `ai_prompt` | TEXT | Original AI generation prompt |

#### `routine_activities`
Individual activities within study routines.

#### `ai_learning_data`
Stores user interaction data for AI learning and improvement.

#### `content_versions`
Tracks versions and changes to AI-generated content.

#### `ai_model_configs`
Configuration for different AI models and content types.

## 🔗 Key Relationships

### User-Centric Relationships
- Users have one profile (`user_profiles`)
- Users can have multiple chats, flashcard decks, mind maps, practice tests
- Users track progress across subjects and topics
- Users can earn achievements and maintain study streaks

### Content Hierarchy
```
Subjects → Topics → Learning Materials (Flashcards, Mind Maps, Tests)
```

### Communication Flow
```
Users → Chats → Messages → Files
Users → Threads → Comments (nested)
Users ↔ Direct Messages
```

### Business Logic
```
Users → Subscriptions → Payments
Users → Usage Metrics (API tracking)
```

### AI Content Generation Flow
```
Users → AI Templates → Generation Jobs → Content (Flashcards/Routines)
Content → Versions → Performance Tracking → Auto-Updates
User Interactions → Learning Data → AI Improvement
```

### Adaptive Learning System
```
User Progress → AI Analysis → Routine Adjustments
Content Performance → Quality Scores → Content Updates
Study Patterns → Learning Data → Personalized Recommendations
```

## 🚀 Getting Started

### 1. Generate Migrations
```bash
npm run db:generate
```

### 2. Run Migrations
```bash
npm run db:migrate
```

### 3. Seed Initial Data
```bash
npm run db:seed
```

## 📝 Usage Examples

### Creating a New User
```typescript
import { db } from '@/db';
import { usersTable, userProfilesTable } from '@/db/schema';

// Create user
const user = await db.insert(usersTable).values({
  clerkId: 'clerk_user_123',
  fullName: 'John Doe',
  email: 'john@example.com',
  role: 'student'
}).returning();

// Create profile
await db.insert(userProfilesTable).values({
  userId: user[0].userId,
  grade: '12th Grade',
  school: 'Example High School'
});
```

### Querying User Progress
```typescript
import { db } from '@/db';
import { learningProgressTable, subjectsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

const progress = await db
  .select()
  .from(learningProgressTable)
  .leftJoin(subjectsTable, eq(learningProgressTable.subjectId, subjectsTable.subjectId))
  .where(eq(learningProgressTable.userId, userId));
```

### Generating AI Content
```typescript
import { db } from '@/db';
import { aiGenerationJobsTable, flashcardDecksTable } from '@/db/schema';

// Create AI generation job
const job = await db.insert(aiGenerationJobsTable).values({
  userId: userId,
  templateId: templateId,
  contentType: 'flashcard',
  prompt: 'Create 10 flashcards about calculus derivatives for intermediate students',
  parameters: JSON.stringify({
    count: 10,
    difficulty: 'intermediate',
    includeHints: true
  }),
  status: 'pending'
}).returning();

// Create flashcard deck with AI source
const deck = await db.insert(flashcardDecksTable).values({
  userId: userId,
  subjectId: mathSubjectId,
  title: 'Calculus Derivatives - AI Generated',
  contentSource: 'ai_generated',
  aiPrompt: 'Create flashcards about calculus derivatives',
  autoUpdateEnabled: true,
  updateFrequency: 'weekly'
});
```

### Setting Up Auto-Updating Content
```typescript
import { db } from '@/db';
import { studyRoutinesTable } from '@/db/schema';

// Create adaptive study routine
const routine = await db.insert(studyRoutinesTable).values({
  userId: userId,
  name: 'Adaptive Math Study Plan',
  description: 'AI-generated routine that adapts to your progress',
  subjectIds: JSON.stringify([mathSubjectId, physicsSubjectId]),
  schedule: JSON.stringify({
    dailyTime: 60,
    preferredTimes: ['morning', 'evening'],
    restDays: ['sunday']
  }),
  contentSource: 'ai_generated',
  autoUpdateEnabled: true,
  updateFrequency: 'weekly',
  adaptToProgress: true,
  aiPrompt: 'Create a balanced study routine for math and physics'
});
```

## 🔒 Security Considerations

1. **Row Level Security**: Implement RLS policies for multi-tenant data isolation
2. **Data Validation**: Use Drizzle's built-in validation and constraints
3. **Sensitive Data**: Store sensitive information (tokens, payments) with encryption
4. **Audit Trail**: Track important changes through timestamps and user references

## 🔄 Migration Strategy

1. **Development**: Use `db:generate` and `db:migrate` for schema changes
2. **Production**: Always backup before migrations
3. **Rollback**: Keep migration rollback scripts for critical changes
4. **Testing**: Test migrations on staging environment first

## 📊 Performance Optimization

1. **Indexing**: Add indexes on frequently queried columns
2. **Pagination**: Implement cursor-based pagination for large datasets
3. **Caching**: Cache frequently accessed data (subjects, achievements)
4. **Connection Pooling**: Use connection pooling for high-traffic scenarios

## 🤝 Contributing

When adding new tables or modifying existing ones:

1. Update this documentation
2. Add appropriate relations in the schema
3. Create seed data if applicable
4. Add TypeScript types for new entities
5. Test migrations thoroughly

---

**Last Updated**: December 2024  
**Schema Version**: 1.0.0 