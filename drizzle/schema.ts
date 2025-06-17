import { pgTable, unique, integer, varchar, text, boolean, timestamp, uuid, bigint, jsonb, numeric, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const contentSource = pgEnum("content_source", ['user_created', 'ai_generated', 'ai_assisted', 'imported'])
export const contentType = pgEnum("content_type", ['flashcard', 'quiz', 'mindmap', 'study_plan', 'routine', 'explanation'])
export const difficulty = pgEnum("difficulty", ['beginner', 'intermediate', 'advanced'])
export const generationStatus = pgEnum("generation_status", ['pending', 'generating', 'completed', 'failed', 'needs_review'])
export const messageRole = pgEnum("message_role", ['user', 'assistant'])
export const notificationType = pgEnum("notification_type", ['achievement', 'reminder', 'social', 'system'])
export const paymentMethod = pgEnum("payment_method", ['card', 'bkash', 'nagad', 'rocket'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'succeeded', 'failed', 'cancelled'])
export const reportStatus = pgEnum("report_status", ['pending', 'resolved', 'dismissed'])
export const reportType = pgEnum("report_type", ['thread', 'comment', 'user'])
export const subscriptionStatus = pgEnum("subscription_status", ['active', 'cancelled', 'expired', 'trial'])
export const updateFrequency = pgEnum("update_frequency", ['never', 'daily', 'weekly', 'monthly', 'on_demand'])
export const userRole = pgEnum("user_role", ['student', 'teacher', 'admin'])


export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	clerkId: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	firstName: varchar({ length: 255 }),
	lastName: varchar({ length: 255 }),
	imageUrl: text(),
	username: varchar({ length: 255 }),
	role: varchar({ length: 50 }).default('student').notNull(),
	age: integer(),
	isActive: boolean().default(true).notNull(),
	bio: text(),
	preferences: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const doubtSolvingSessions = pgTable("doubt_solving_sessions", {
	sessionId: uuid("session_id").defaultRandom().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	messageCount: integer("message_count").default(0).notNull(),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).defaultNow().notNull(),
	isArchived: boolean("is_archived").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const threads = pgTable("threads", {
	threadId: uuid("thread_id").defaultRandom().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	body: text().notNull(),
	createdBy: integer("created_by"),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	isPinned: boolean("is_pinned").default(false).notNull(),
	isLocked: boolean("is_locked").default(false).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	likeCount: integer("like_count").default(0).notNull(),
	commentCount: integer("comment_count").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const comments = pgTable("comments", {
	commentId: uuid("comment_id").defaultRandom().primaryKey().notNull(),
	threadId: uuid("thread_id").notNull(),
	senderId: integer("sender_id").notNull(),
	content: text().notNull(),
	parentCommentId: uuid("parent_comment_id"),
	likeCount: integer("like_count").default(0).notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const doubtSolvingFiles = pgTable("doubt_solving_files", {
	fileId: uuid("file_id").defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	messageId: uuid("message_id"),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	fileUrl: text("file_url").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: varchar("mime_type", { length: 100 }),
	base64Data: text("base64_data"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
	achievementId: uuid("achievement_id").defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	iconUrl: text("icon_url"),
	badgeColor: varchar("badge_color", { length: 7 }),
	criteria: jsonb(),
	points: integer().default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const doubtSolvingMessages = pgTable("doubt_solving_messages", {
	messageId: uuid("message_id").defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	role: varchar({ length: 20 }).notNull(),
	content: text().notNull(),
	attachmentUrl: text("attachment_url"),
	attachmentType: varchar("attachment_type", { length: 50 }),
	attachmentName: varchar("attachment_name", { length: 255 }),
	tokenCount: integer("token_count"),
	processingTime: integer("processing_time"),
	modelUsed: varchar("model_used", { length: 100 }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiContentTemplates = pgTable("ai_content_templates", {
	templateId: uuid("template_id").defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	contentType: contentType("content_type").notNull(),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	promptTemplate: text("prompt_template").notNull(),
	systemPrompt: text("system_prompt"),
	parameters: jsonb(),
	difficulty: difficulty().default('beginner').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	usageCount: integer("usage_count").default(0).notNull(),
	successRate: numeric("success_rate", { precision: 5, scale:  2 }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiGenerationJobs = pgTable("ai_generation_jobs", {
	jobId: uuid("job_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	templateId: uuid("template_id"),
	contentType: contentType("content_type").notNull(),
	targetId: uuid("target_id"),
	prompt: text().notNull(),
	parameters: jsonb(),
	status: generationStatus().default('pending').notNull(),
	progress: integer().default(0).notNull(),
	result: jsonb(),
	errorMessage: text("error_message"),
	aiModelUsed: varchar("ai_model_used", { length: 100 }),
	tokensUsed: integer("tokens_used"),
	generationTime: integer("generation_time"),
	qualityScore: numeric("quality_score", { precision: 3, scale:  2 }),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiLearningData = pgTable("ai_learning_data", {
	dataId: uuid("data_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	contentType: contentType("content_type").notNull(),
	contentId: uuid("content_id").notNull(),
	interactionType: varchar("interaction_type", { length: 100 }).notNull(),
	interactionData: jsonb("interaction_data"),
	userPerformance: jsonb("user_performance"),
	contextData: jsonb("context_data"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiModelConfigs = pgTable("ai_model_configs", {
	configId: uuid("config_id").defaultRandom().primaryKey().notNull(),
	modelName: varchar("model_name", { length: 100 }).notNull(),
	version: varchar({ length: 50 }).notNull(),
	contentType: contentType("content_type").notNull(),
	configuration: jsonb(),
	prompts: jsonb(),
	parameters: jsonb(),
	isActive: boolean("is_active").default(true).notNull(),
	performanceMetrics: jsonb("performance_metrics"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const authTokens = pgTable("auth_tokens", {
	tokenId: uuid("token_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	refreshToken: text("refresh_token").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chatFiles = pgTable("chat_files", {
	fileId: uuid("file_id").defaultRandom().primaryKey().notNull(),
	chatId: uuid("chat_id").notNull(),
	messageId: uuid("message_id"),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	fileUrl: text("file_url").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	mimeType: varchar("mime_type", { length: 100 }),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const chats = pgTable("chats", {
	chatId: uuid("chat_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: varchar({ length: 255 }),
	subjectId: uuid("subject_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const contentVersions = pgTable("content_versions", {
	versionId: uuid("version_id").defaultRandom().primaryKey().notNull(),
	contentType: contentType("content_type").notNull(),
	contentId: uuid("content_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	changes: jsonb(),
	changeReason: varchar("change_reason", { length: 255 }),
	previousVersion: text("previous_version"),
	currentVersion: text("current_version"),
	performanceMetrics: jsonb("performance_metrics"),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: varchar("created_by", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const directMessages = pgTable("direct_messages", {
	messageId: uuid("message_id").defaultRandom().primaryKey().notNull(),
	senderId: uuid("sender_id").notNull(),
	recipientId: uuid("recipient_id").notNull(),
	content: text().notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const fileUploads = pgTable("file_uploads", {
	fileId: uuid("file_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	fileUrl: text("file_url").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
});

export const flashcardDecks = pgTable("flashcard_decks", {
	deckId: uuid("deck_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	isPublic: boolean("is_public").default(false).notNull(),
	totalCards: integer("total_cards").default(0).notNull(),
	contentSource: contentSource("content_source").default('user_created').notNull(),
	aiPrompt: text("ai_prompt"),
	autoUpdateEnabled: boolean("auto_update_enabled").default(false).notNull(),
	updateFrequency: updateFrequency("update_frequency").default('never').notNull(),
	lastAutoUpdate: timestamp("last_auto_update", { mode: 'string' }),
	nextScheduledUpdate: timestamp("next_scheduled_update", { mode: 'string' }),
	aiModelVersion: varchar("ai_model_version", { length: 50 }),
	generationMetadata: jsonb("generation_metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
	cardId: uuid("card_id").defaultRandom().primaryKey().notNull(),
	deckId: uuid("deck_id").notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	hint: text(),
	explanation: text(),
	difficulty: difficulty().default('beginner').notNull(),
	orderIndex: integer("order_index").default(0).notNull(),
	contentSource: contentSource("content_source").default('user_created').notNull(),
	aiConfidenceScore: numeric("ai_confidence_score", { precision: 3, scale:  2 }),
	userRating: integer("user_rating"),
	timesReviewed: integer("times_reviewed").default(0).notNull(),
	correctAnswers: integer("correct_answers").default(0).notNull(),
	lastReviewed: timestamp("last_reviewed", { mode: 'string' }),
	needsReview: boolean("needs_review").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const learningProgress = pgTable("learning_progress", {
	progressId: uuid("progress_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subjectId: uuid("subject_id").notNull(),
	topicId: uuid("topic_id"),
	progressPercentage: numeric("progress_percentage", { precision: 5, scale:  2 }).default('0').notNull(),
	timeSpent: integer("time_spent").default(0).notNull(),
	lastStudied: timestamp("last_studied", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
	messageId: uuid("message_id").defaultRandom().primaryKey().notNull(),
	chatId: uuid("chat_id").notNull(),
	senderId: uuid("sender_id"),
	role: messageRole().notNull(),
	content: text().notNull(),
	metadata: jsonb(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const mindMaps = pgTable("mind_maps", {
	mindmapId: uuid("mindmap_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	fileUrl: text("file_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	isPublic: boolean("is_public").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
	notificationId: uuid("notification_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: notificationType().notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	data: jsonb(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const payments = pgTable("payments", {
	paymentId: uuid("payment_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subscriptionId: uuid("subscription_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('BDT').notNull(),
	method: paymentMethod().notNull(),
	status: paymentStatus().default('pending').notNull(),
	transactionId: varchar("transaction_id", { length: 255 }),
	gatewayResponse: jsonb("gateway_response"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const practiceTestSubmissions = pgTable("practice_test_submissions", {
	submissionId: uuid("submission_id").defaultRandom().primaryKey().notNull(),
	testId: uuid("test_id").notNull(),
	userId: uuid("user_id").notNull(),
	answers: jsonb(),
	score: integer().notNull(),
	totalPoints: integer("total_points").notNull(),
	timeSpent: integer("time_spent"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
});

export const practiceTests = pgTable("practice_tests", {
	testId: uuid("test_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	timeLimit: integer("time_limit"),
	totalQuestions: integer("total_questions").default(0).notNull(),
	difficulty: difficulty().default('beginner').notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const reports = pgTable("reports", {
	reportId: uuid("report_id").defaultRandom().primaryKey().notNull(),
	type: reportType().notNull(),
	itemId: uuid("item_id").notNull(),
	reason: text().notNull(),
	reportedBy: uuid("reported_by").notNull(),
	status: reportStatus().default('pending').notNull(),
	reviewedBy: uuid("reviewed_by"),
	reviewNotes: text("review_notes"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
});

export const routineActivities = pgTable("routine_activities", {
	activityId: uuid("activity_id").defaultRandom().primaryKey().notNull(),
	routineId: uuid("routine_id").notNull(),
	activityType: varchar("activity_type", { length: 100 }).notNull(),
	contentId: uuid("content_id"),
	orderIndex: integer("order_index").default(0).notNull(),
	duration: integer().notNull(),
	parameters: jsonb(),
	isOptional: boolean("is_optional").default(false).notNull(),
	adaptiveWeight: numeric("adaptive_weight", { precision: 3, scale:  2 }).default('1.0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const studyRoutines = pgTable("study_routines", {
	routineId: uuid("routine_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	subjectIds: jsonb("subject_ids"),
	schedule: jsonb(),
	duration: integer().notNull(),
	difficulty: difficulty().default('beginner').notNull(),
	contentSource: contentSource("content_source").default('user_created').notNull(),
	autoUpdateEnabled: boolean("auto_update_enabled").default(false).notNull(),
	updateFrequency: updateFrequency("update_frequency").default('weekly').notNull(),
	adaptToProgress: boolean("adapt_to_progress").default(true).notNull(),
	lastAutoUpdate: timestamp("last_auto_update", { mode: 'string' }),
	nextScheduledUpdate: timestamp("next_scheduled_update", { mode: 'string' }),
	aiPrompt: text("ai_prompt"),
	generationMetadata: jsonb("generation_metadata"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const studySessions = pgTable("study_sessions", {
	sessionId: uuid("session_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	subjectId: uuid("subject_id"),
	topicId: uuid("topic_id"),
	activityType: varchar("activity_type", { length: 100 }).notNull(),
	duration: integer().notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
});

export const studyStreaks = pgTable("study_streaks", {
	streakId: uuid("streak_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	currentStreak: integer("current_streak").default(0).notNull(),
	longestStreak: integer("longest_streak").default(0).notNull(),
	lastStudyDate: date("last_study_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const subjects = pgTable("subjects", {
	subjectId: uuid("subject_id").defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	iconUrl: text("icon_url"),
	color: varchar({ length: 7 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
	planId: uuid("plan_id").defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('BDT').notNull(),
	billingPeriod: varchar("billing_period", { length: 20 }).notNull(),
	features: jsonb(),
	maxQueries: integer("max_queries"),
	maxFileUploads: integer("max_file_uploads"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const testQuestions = pgTable("test_questions", {
	questionId: uuid("question_id").defaultRandom().primaryKey().notNull(),
	testId: uuid("test_id").notNull(),
	question: text().notNull(),
	options: jsonb(),
	correctAnswer: text("correct_answer").notNull(),
	explanation: text(),
	points: integer().default(1).notNull(),
	orderIndex: integer("order_index").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const topics = pgTable("topics", {
	topicId: uuid("topic_id").defaultRandom().primaryKey().notNull(),
	subjectId: uuid("subject_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	difficulty: difficulty().default('beginner').notNull(),
	orderIndex: integer("order_index").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const usageMetrics = pgTable("usage_metrics", {
	userId: uuid("user_id").primaryKey().notNull(),
	totalQueries: integer("total_queries").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	promptTokens: bigint("prompt_tokens", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	completionTokens: bigint("completion_tokens", { mode: "number" }).default(0).notNull(),
	totalStudyTime: integer("total_study_time").default(0).notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
	userAchievementId: uuid("user_achievement_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	achievementId: uuid("achievement_id").notNull(),
	earnedAt: timestamp("earned_at", { mode: 'string' }).defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
	profileId: uuid("profile_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	bio: text(),
	grade: varchar({ length: 50 }),
	school: varchar({ length: 255 }),
	dateOfBirth: date("date_of_birth"),
	country: varchar({ length: 100 }),
	timezone: varchar({ length: 100 }),
	preferredLanguage: varchar("preferred_language", { length: 10 }).default('en'),
	studyGoals: text("study_goals"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
	subscriptionId: uuid("subscription_id").defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	planId: uuid("plan_id").notNull(),
	status: subscriptionStatus().default('trial').notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).defaultNow().notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	autoRenew: boolean("auto_renew").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
