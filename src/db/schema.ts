import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  jsonb,
  date,
  bigint,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['student', 'teacher', 'admin']);
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'bkash', 'nagad', 'rocket']);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'resolved', 'dismissed']);
export const reportTypeEnum = pgEnum('report_type', ['thread', 'comment', 'user']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'expired', 'trial']);
export const notificationTypeEnum = pgEnum('notification_type', ['achievement', 'reminder', 'social', 'system']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const contentSourceEnum = pgEnum('content_source', ['user_created', 'ai_generated', 'ai_assisted', 'imported']);
export const generationStatusEnum = pgEnum('generation_status', ['pending', 'generating', 'completed', 'failed', 'needs_review']);
export const updateFrequencyEnum = pgEnum('update_frequency', ['never', 'daily', 'weekly', 'monthly', 'on_demand']);
export const contentTypeEnum = pgEnum('content_type', ['flashcard', 'quiz', 'mindmap', 'study_plan', 'routine', 'explanation']);

// Core Tables
export const usersTable = pgTable("users", {
  userId: uuid("user_id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").default('student').notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  lastActiveAt: timestamp("last_active_at"),
  avatarUrl: text("avatar_url"),
});

export const userProfilesTable = pgTable("user_profiles", {
  profileId: uuid("profile_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  bio: text("bio"),
  grade: varchar("grade", { length: 50 }),
  school: varchar("school", { length: 255 }),
  dateOfBirth: date("date_of_birth"),
  country: varchar("country", { length: 100 }),
  timezone: varchar("timezone", { length: 100 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'),
  studyGoals: text("study_goals"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const authTokensTable = pgTable("auth_tokens", {
  tokenId: uuid("token_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Learning Content Tables
export const subjectsTable = pgTable("subjects", {
  subjectId: uuid("subject_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  color: varchar("color", { length: 7 }), // hex color
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topicsTable = pgTable("topics", {
  topicId: uuid("topic_id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  difficulty: difficultyEnum("difficulty").default('beginner').notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flashcardsTable = pgTable("flashcards", {
  cardId: uuid("card_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mindMapsTable = pgTable("mind_maps", {
  mindmapId: uuid("mindmap_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'set null' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Practice Tests
export const practiceTestsTable = pgTable("practice_tests", {
  testId: uuid("test_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'set null' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"), // minutes
  totalQuestions: integer("total_questions").default(0).notNull(),
  difficulty: difficultyEnum("difficulty").default('beginner').notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testQuestionsTable = pgTable("test_questions", {
  questionId: uuid("question_id").primaryKey().defaultRandom(),
  testId: uuid("test_id").references(() => practiceTestsTable.testId, { onDelete: 'cascade' }).notNull(),
  question: text("question").notNull(),
  options: jsonb("options"), // array of options for MCQ
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(1).notNull(),
  orderIndex: integer("order_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const practiceTestSubmissionsTable = pgTable("practice_test_submissions", {
  submissionId: uuid("submission_id").primaryKey().defaultRandom(),
  testId: uuid("test_id").references(() => practiceTestsTable.testId, { onDelete: 'cascade' }).notNull(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  answers: jsonb("answers"), // user's answers
  score: integer("score").notNull(),
  totalPoints: integer("total_points").notNull(),
  timeSpent: integer("time_spent"), // seconds
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Communication Tables
export const chatsTable = pgTable("chats", {
  chatId: uuid("chat_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  title: varchar("title", { length: 255 }),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("messages", {
  messageId: uuid("message_id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").references(() => chatsTable.chatId, { onDelete: 'cascade' }).notNull(),
  senderId: uuid("sender_id").references(() => usersTable.userId, { onDelete: 'cascade' }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // for storing additional data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const chatFilesTable = pgTable("chat_files", {
  fileId: uuid("file_id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").references(() => chatsTable.chatId, { onDelete: 'cascade' }).notNull(),
  messageId: uuid("message_id").references(() => messagesTable.messageId, { onDelete: 'cascade' }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: bigint("file_size", { mode: 'number' }),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const threadsTable = pgTable("threads", {
  threadId: uuid("thread_id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  createdBy: uuid("created_by").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'set null' }),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  postType: varchar("post_type", { length: 20 }).default('post').notNull(),
  images: jsonb("images"),
  pollOptions: jsonb("poll_options"),
  pollVotes: jsonb("poll_votes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commentsTable: any = pgTable("comments", {
  commentId: uuid("comment_id").primaryKey().defaultRandom(),
  threadId: uuid("thread_id").references(() => threadsTable.threadId, { onDelete: 'cascade' }).notNull(),
  senderId: uuid("sender_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id").references((): any => commentsTable.commentId, { onDelete: 'cascade' }),
  likeCount: integer("like_count").default(0).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const directMessagesTable = pgTable("direct_messages", {
  messageId: uuid("message_id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  recipientId: uuid("recipient_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  content: text("content"),
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 255 }),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: bigint("file_size", { mode: 'number' }),
  isRead: boolean("is_read").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const savedPostsTable = pgTable("saved_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  threadId: uuid("thread_id").references(() => threadsTable.threadId, { onDelete: 'cascade' }).notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserThread: unique().on(table.userId, table.threadId), // Prevent duplicate saves
}));

// Social Connection Tables
export const userFollowsTable = pgTable("user_follows", {
  followId: uuid("follow_id").primaryKey().defaultRandom(),
  followerId: uuid("follower_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  followingId: uuid("following_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Study Group Tables
export const studyGroupsTable = pgTable("study_groups", {
  groupId: uuid("group_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  createdBy: uuid("created_by").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  meetingType: varchar("meeting_type", { length: 20 }).notNull(), // online, in-person, hybrid
  location: text("location"),
  meetingLink: text("meeting_link"),
  nextMeeting: timestamp("next_meeting"),
  meetingTime: varchar("meeting_time", { length: 50 }),
  maxParticipants: integer("max_participants").default(10).notNull(),
  currentParticipants: integer("current_participants").default(1).notNull(),
  tags: jsonb("tags"), // Array of tags
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const studyGroupMembersTable = pgTable("study_group_members", {
  membershipId: uuid("membership_id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => studyGroupsTable.groupId, { onDelete: 'cascade' }).notNull(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  role: varchar("role", { length: 20 }).default('member').notNull(), // member, organizer
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const studyGroupMessagesTable = pgTable("study_group_messages", {
  messageId: uuid("message_id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => studyGroupsTable.groupId, { onDelete: 'cascade' }).notNull(),
  senderId: uuid("sender_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  content: text("content"), // Made optional to allow file-only messages
  fileUrl: text("file_url"),
  fileName: varchar("file_name", { length: 255 }),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: bigint("file_size", { mode: 'number' }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Analytics & Progress Tables
export const usageMetricsTable = pgTable("usage_metrics", {
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).primaryKey(),
  totalQueries: integer("total_queries").default(0).notNull(),
  promptTokens: bigint("prompt_tokens", { mode: 'number' }).default(0).notNull(),
  completionTokens: bigint("completion_tokens", { mode: 'number' }).default(0).notNull(),
  totalStudyTime: integer("total_study_time").default(0).notNull(), // minutes
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const learningProgressTable = pgTable("learning_progress", {
  progressId: uuid("progress_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'cascade' }).notNull(),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'cascade' }),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default('0').notNull(),
  timeSpent: integer("time_spent").default(0).notNull(), // minutes
  lastStudied: timestamp("last_studied").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyStreaksTable = pgTable("study_streaks", {
  streakId: uuid("streak_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastStudyDate: date("last_study_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const achievementsTable = pgTable("achievements", {
  achievementId: uuid("achievement_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  badgeColor: varchar("badge_color", { length: 7 }),
  criteria: jsonb("criteria"), // achievement criteria
  points: integer("points").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievementsTable = pgTable("user_achievements", {
  userAchievementId: uuid("user_achievement_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  achievementId: uuid("achievement_id").references(() => achievementsTable.achievementId, { onDelete: 'cascade' }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const studySessionsTable = pgTable("study_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'set null' }),
  activityType: varchar("activity_type", { length: 100 }).notNull(), // flashcards, chat, test, etc.
  duration: integer("duration").notNull(), // minutes
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

// Business Tables
export const subscriptionPlansTable = pgTable("subscription_plans", {
  planId: uuid("plan_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('BDT').notNull(),
  billingPeriod: varchar("billing_period", { length: 20 }).notNull(), // monthly, yearly
  features: jsonb("features"), // array of features
  maxQueries: integer("max_queries"),
  maxFileUploads: integer("max_file_uploads"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSubscriptionsTable = pgTable("user_subscriptions", {
  subscriptionId: uuid("subscription_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  planId: uuid("plan_id").references(() => subscriptionPlansTable.planId, { onDelete: 'cascade' }).notNull(),
  status: subscriptionStatusEnum("status").default('trial').notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsTable = pgTable("payments", {
  paymentId: uuid("payment_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  subscriptionId: uuid("subscription_id").references(() => userSubscriptionsTable.subscriptionId, { onDelete: 'set null' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('BDT').notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").default('pending').notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  gatewayResponse: jsonb("gateway_response"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const reportsTable = pgTable("reports", {
  reportId: uuid("report_id").primaryKey().defaultRandom(),
  type: reportTypeEnum("type").notNull(),
  itemId: uuid("item_id").notNull(), // ID of reported item
  reason: text("reason").notNull(),
  reportedBy: uuid("reported_by").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  status: reportStatusEnum("status").default('pending').notNull(),
  reviewedBy: uuid("reviewed_by").references(() => usersTable.userId, { onDelete: 'set null' }),
  reviewNotes: text("review_notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// Utility Tables
export const notificationsTable = pgTable("notifications", {
  notificationId: uuid("notification_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // additional notification data
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fileUploadsTable = pgTable("file_uploads", {
  fileId: uuid("file_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: bigint("file_size", { mode: 'number' }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// AI & Content Generation Tables
export const aiContentTemplatesTable = pgTable("ai_content_templates", {
  templateId: uuid("template_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  contentType: contentTypeEnum("content_type").notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'cascade' }),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'cascade' }),
  promptTemplate: text("prompt_template").notNull(), // Template with placeholders
  systemPrompt: text("system_prompt"), // System instructions for AI
  parameters: jsonb("parameters"), // Template parameters and constraints
  difficulty: difficultyEnum("difficulty").default('beginner').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }), // Success rate of generations
  createdBy: uuid("created_by").references(() => usersTable.userId, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiGenerationJobsTable = pgTable("ai_generation_jobs", {
  jobId: uuid("job_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  templateId: uuid("template_id").references(() => aiContentTemplatesTable.templateId, { onDelete: 'set null' }),
  contentType: contentTypeEnum("content_type").notNull(),
  targetId: uuid("target_id"), // ID of the content being generated (deck, test, etc.)
  prompt: text("prompt").notNull(),
  parameters: jsonb("parameters"), // Generation parameters
  status: generationStatusEnum("status").default('pending').notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100
  result: jsonb("result"), // Generated content
  errorMessage: text("error_message"),
  aiModelUsed: varchar("ai_model_used", { length: 100 }),
  tokensUsed: integer("tokens_used"),
  generationTime: integer("generation_time"), // milliseconds
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }), // AI-assessed quality
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyRoutinesTable = pgTable("study_routines", {
  routineId: uuid("routine_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  subjectIds: jsonb("subject_ids"), // Array of subject IDs
  schedule: jsonb("schedule"), // Complex schedule object
  duration: integer("duration").notNull(), // minutes per session
  difficulty: difficultyEnum("difficulty").default('beginner').notNull(),
  contentSource: contentSourceEnum("content_source").default('user_created').notNull(),
  autoUpdateEnabled: boolean("auto_update_enabled").default(false).notNull(),
  updateFrequency: updateFrequencyEnum("update_frequency").default('weekly').notNull(),
  adaptToProgress: boolean("adapt_to_progress").default(true).notNull(), // AI adapts based on user progress
  lastAutoUpdate: timestamp("last_auto_update"),
  nextScheduledUpdate: timestamp("next_scheduled_update"),
  aiPrompt: text("ai_prompt"), // Original prompt for AI-generated routines
  generationMetadata: jsonb("generation_metadata"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const routineActivitiesTable = pgTable("routine_activities", {
  activityId: uuid("activity_id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id").references(() => studyRoutinesTable.routineId, { onDelete: 'cascade' }).notNull(),
  activityType: varchar("activity_type", { length: 100 }).notNull(), // flashcards, quiz, reading, etc.
  contentId: uuid("content_id"), // ID of specific content (deck, test, etc.)
  orderIndex: integer("order_index").default(0).notNull(),
  duration: integer("duration").notNull(), // minutes
  parameters: jsonb("parameters"), // Activity-specific parameters
  isOptional: boolean("is_optional").default(false).notNull(),
  adaptiveWeight: decimal("adaptive_weight", { precision: 3, scale: 2 }).default('1.0'), // AI adjustment weight
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiLearningDataTable = pgTable("ai_learning_data", {
  dataId: uuid("data_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(), // ID of the content
  interactionType: varchar("interaction_type", { length: 100 }).notNull(), // view, answer, rate, etc.
  interactionData: jsonb("interaction_data"), // Detailed interaction data
  userPerformance: jsonb("user_performance"), // Performance metrics
  contextData: jsonb("context_data"), // Context when interaction occurred
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const contentVersionsTable = pgTable("content_versions", {
  versionId: uuid("version_id").primaryKey().defaultRandom(),
  contentType: contentTypeEnum("content_type").notNull(),
  contentId: uuid("content_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  changes: jsonb("changes"), // What changed in this version
  changeReason: varchar("change_reason", { length: 255 }), // Why it was changed
  previousVersion: text("previous_version"), // Snapshot of previous content
  currentVersion: text("current_version"), // Snapshot of current content
  performanceMetrics: jsonb("performance_metrics"), // How this version performed
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by", { length: 100 }), // 'ai' or user_id
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiModelConfigsTable = pgTable("ai_model_configs", {
  configId: uuid("config_id").primaryKey().defaultRandom(),
  modelName: varchar("model_name", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  contentType: contentTypeEnum("content_type").notNull(),
  configuration: jsonb("configuration"), // Model-specific config
  prompts: jsonb("prompts"), // System and user prompts
  parameters: jsonb("parameters"), // Temperature, max_tokens, etc.
  isActive: boolean("is_active").default(true).notNull(),
  performanceMetrics: jsonb("performance_metrics"), // Success rates, quality scores
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Doubt Solving Tables
export const doubtSolvingSessionsTable = pgTable("doubt_solving_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.userId, { onDelete: 'cascade' }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subjectId: uuid("subject_id").references(() => subjectsTable.subjectId, { onDelete: 'set null' }),
  topicId: uuid("topic_id").references(() => topicsTable.topicId, { onDelete: 'set null' }),
  messageCount: integer("message_count").default(0).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const doubtSolvingMessagesTable = pgTable("doubt_solving_messages", {
  messageId: uuid("message_id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => doubtSolvingSessionsTable.sessionId, { onDelete: 'cascade' }).notNull(),
  role: messageRoleEnum("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"), // For uploaded files (images, PDFs)
  attachmentType: varchar("attachment_type", { length: 50 }), // 'image', 'pdf', etc.
  attachmentName: varchar("attachment_name", { length: 255 }), // Original filename
  tokenCount: integer("token_count"), // For usage tracking
  processingTime: integer("processing_time"), // Response time in milliseconds
  modelUsed: varchar("model_used", { length: 100 }), // AI model identifier
  metadata: jsonb("metadata"), // Additional data (confidence scores, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doubtSolvingFilesTable = pgTable("doubt_solving_files", {
  fileId: uuid("file_id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => doubtSolvingSessionsTable.sessionId, { onDelete: 'cascade' }).notNull(),
  messageId: uuid("message_id").references(() => doubtSolvingMessagesTable.messageId, { onDelete: 'cascade' }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: bigint("file_size", { mode: 'number' }),
  mimeType: varchar("mime_type", { length: 100 }),
  base64Data: text("base64_data"), // Store base64 for AI processing
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ one, many }) => ({
  profile: one(userProfilesTable),
  authTokens: many(authTokensTable),
  chats: many(chatsTable),
  flashcards: many(flashcardsTable),
  mindMaps: many(mindMapsTable),
  practiceTests: many(practiceTestsTable),
  testSubmissions: many(practiceTestSubmissionsTable),
  threads: many(threadsTable),
  comments: many(commentsTable),
  sentMessages: many(directMessagesTable, { relationName: 'sentMessages' }),
  receivedMessages: many(directMessagesTable, { relationName: 'receivedMessages' }),
  followers: many(userFollowsTable, { relationName: 'following' }),
  following: many(userFollowsTable, { relationName: 'follower' }),
  createdStudyGroups: many(studyGroupsTable),
  studyGroupMemberships: many(studyGroupMembersTable),
  studyGroupMessages: many(studyGroupMessagesTable),
  usageMetrics: one(usageMetricsTable),
  learningProgress: many(learningProgressTable),
  studyStreak: one(studyStreaksTable),
  achievements: many(userAchievementsTable),
  studySessions: many(studySessionsTable),
  subscription: one(userSubscriptionsTable),
  payments: many(paymentsTable),
  reports: many(reportsTable),
  notifications: many(notificationsTable),
  fileUploads: many(fileUploadsTable),
  doubtSolvingSessions: many(doubtSolvingSessionsTable),
}));

export const subjectsRelations = relations(subjectsTable, ({ many }) => ({
  topics: many(topicsTable),
  mindMaps: many(mindMapsTable),
  practiceTests: many(practiceTestsTable),
  threads: many(threadsTable),
  chats: many(chatsTable),
  studyGroups: many(studyGroupsTable),
  learningProgress: many(learningProgressTable),
  studySessions: many(studySessionsTable),
  doubtSolvingSessions: many(doubtSolvingSessionsTable),
}));

export const topicsRelations = relations(topicsTable, ({ one, many }) => ({
  subject: one(subjectsTable, {
    fields: [topicsTable.subjectId],
    references: [subjectsTable.subjectId],
  }),
  mindMaps: many(mindMapsTable),
  practiceTests: many(practiceTestsTable),
  threads: many(threadsTable),
  learningProgress: many(learningProgressTable),
  studySessions: many(studySessionsTable),
  doubtSolvingSessions: many(doubtSolvingSessionsTable),
}));

export const flashcardsRelations = relations(flashcardsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [flashcardsTable.userId],
    references: [usersTable.userId],
  }),
}));

export const chatsRelations = relations(chatsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [chatsTable.userId],
    references: [usersTable.userId],
  }),
  subject: one(subjectsTable, {
    fields: [chatsTable.subjectId],
    references: [subjectsTable.subjectId],
  }),
  messages: many(messagesTable),
  files: many(chatFilesTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.chatId],
  }),
  sender: one(usersTable, {
    fields: [messagesTable.senderId],
    references: [usersTable.userId],
  }),
}));

export const threadsRelations = relations(threadsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [threadsTable.createdBy],
    references: [usersTable.userId],
  }),
  subject: one(subjectsTable, {
    fields: [threadsTable.subjectId],
    references: [subjectsTable.subjectId],
  }),
  topic: one(topicsTable, {
    fields: [threadsTable.topicId],
    references: [topicsTable.topicId],
  }),
  comments: many(commentsTable),
}));

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  thread: one(threadsTable, {
    fields: [commentsTable.threadId],
    references: [threadsTable.threadId],
  }),
  sender: one(usersTable, {
    fields: [commentsTable.senderId],
    references: [usersTable.userId],
  }),
  parentComment: one(commentsTable, {
    fields: [commentsTable.parentCommentId],
    references: [commentsTable.commentId],
    relationName: 'parentComment',
  }),
  replies: many(commentsTable, { relationName: 'parentComment' }),
}));

// Doubt Solving Relations
export const doubtSolvingSessionsRelations = relations(doubtSolvingSessionsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [doubtSolvingSessionsTable.userId],
    references: [usersTable.userId],
  }),
  subject: one(subjectsTable, {
    fields: [doubtSolvingSessionsTable.subjectId],
    references: [subjectsTable.subjectId],
  }),
  topic: one(topicsTable, {
    fields: [doubtSolvingSessionsTable.topicId],
    references: [topicsTable.topicId],
  }),
  messages: many(doubtSolvingMessagesTable),
  files: many(doubtSolvingFilesTable),
}));

export const doubtSolvingMessagesRelations = relations(doubtSolvingMessagesTable, ({ one }) => ({
  session: one(doubtSolvingSessionsTable, {
    fields: [doubtSolvingMessagesTable.sessionId],
    references: [doubtSolvingSessionsTable.sessionId],
  }),
}));

export const doubtSolvingFilesRelations = relations(doubtSolvingFilesTable, ({ one }) => ({
  session: one(doubtSolvingSessionsTable, {
    fields: [doubtSolvingFilesTable.sessionId],
    references: [doubtSolvingSessionsTable.sessionId],
  }),
  message: one(doubtSolvingMessagesTable, {
    fields: [doubtSolvingFilesTable.messageId],
    references: [doubtSolvingMessagesTable.messageId],
  }),
}));

// Social Connection Relations
export const userFollowsRelations = relations(userFollowsTable, ({ one }) => ({
  follower: one(usersTable, {
    fields: [userFollowsTable.followerId],
    references: [usersTable.userId],
    relationName: 'follower',
  }),
  following: one(usersTable, {
    fields: [userFollowsTable.followingId],
    references: [usersTable.userId],
    relationName: 'following',
  }),
}));

// Study Group Relations
export const studyGroupsRelations = relations(studyGroupsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [studyGroupsTable.createdBy],
    references: [usersTable.userId],
  }),
  subject: one(subjectsTable, {
    fields: [studyGroupsTable.subjectId],
    references: [subjectsTable.subjectId],
  }),
  members: many(studyGroupMembersTable),
  messages: many(studyGroupMessagesTable),
}));

export const studyGroupMembersRelations = relations(studyGroupMembersTable, ({ one }) => ({
  group: one(studyGroupsTable, {
    fields: [studyGroupMembersTable.groupId],
    references: [studyGroupsTable.groupId],
  }),
  user: one(usersTable, {
    fields: [studyGroupMembersTable.userId],
    references: [usersTable.userId],
  }),
}));

export const studyGroupMessagesRelations = relations(studyGroupMessagesTable, ({ one }) => ({
  group: one(studyGroupsTable, {
    fields: [studyGroupMessagesTable.groupId],
    references: [studyGroupsTable.groupId],
  }),
  sender: one(usersTable, {
    fields: [studyGroupMessagesTable.senderId],
    references: [usersTable.userId],
  }),
}));
