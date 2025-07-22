import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  usersTable,
  studySessionsTable,
  threadsTable,
  savedPostsTable,
  usageMetricsTable,
  flashcardsTable,
  flashcardDecksTable,
  mindMapsTable,
  practiceTestSubmissionsTable,
  studyGroupsTable,
  studyGroupMembersTable,
  studyStreaksTable,
  userProfilesTable,
  subjectsTable,
  topicsTable
} from '@/db/schema';
import { eq, desc, count, sum, avg, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { userId } = user;

    // Fetch all user activity data in parallel
    const [
      studySessionsResult,
      recentActivitiesResult,
      usageMetricsResult,
      flashcardDecksResult,
      mindMapsResult,
      quizSubmissionsResult,
      studyGroupsResult,
      joinedGroupsResult,
      createdPostsResult,
      savedPostsResult,
      studyStreakResult,
      userProfileResult
    ] = await Promise.all([
      // Study sessions for total study time
      db.select({
        totalSessions: count(),
        totalDuration: sum(studySessionsTable.duration),
        activityType: studySessionsTable.activityType,
      })
        .from(studySessionsTable)
        .where(eq(studySessionsTable.userId, userId))
        .groupBy(studySessionsTable.activityType),

      // Recent activities (last 10)
      db.select({
        sessionId: studySessionsTable.sessionId,
        activityType: studySessionsTable.activityType,
        duration: studySessionsTable.duration,
        startedAt: studySessionsTable.startedAt,
        endedAt: studySessionsTable.endedAt,
        subjectName: subjectsTable.name,
        topicName: topicsTable.name,
      })
        .from(studySessionsTable)
        .leftJoin(subjectsTable, eq(studySessionsTable.subjectId, subjectsTable.subjectId))
        .leftJoin(topicsTable, eq(studySessionsTable.topicId, topicsTable.topicId))
        .where(eq(studySessionsTable.userId, userId))
        .orderBy(desc(studySessionsTable.startedAt))
        .limit(10),

      // Usage metrics
      db.select()
        .from(usageMetricsTable)
        .where(eq(usageMetricsTable.userId, userId))
        .limit(1),

      // Flashcard decks
      db.select({
        deckCount: count(),
      })
        .from(flashcardDecksTable)
        .where(eq(flashcardDecksTable.userId, userId)),

      // Mind maps
      db.select({
        mindMapCount: count(),
      })
        .from(mindMapsTable)
        .where(eq(mindMapsTable.userId, userId)),

      // Quiz submissions
      db.select({
        totalSubmissions: count(),
        totalPoints: sum(practiceTestSubmissionsTable.totalPoints),
        avgScore: avg(practiceTestSubmissionsTable.score),
      })
        .from(practiceTestSubmissionsTable)
        .where(eq(practiceTestSubmissionsTable.userId, userId)),

      // Created study groups
      db.select({
        groupCount: count(),
      })
        .from(studyGroupsTable)
        .where(eq(studyGroupsTable.createdBy, userId)),

      // Joined study groups
      db.select({
        joinedCount: count(),
      })
        .from(studyGroupMembersTable)
        .where(eq(studyGroupMembersTable.userId, userId)),

      // Created posts
      db.select({
        threadId: threadsTable.threadId,
        title: threadsTable.title,
        body: threadsTable.body,
        likeCount: threadsTable.likeCount,
        commentCount: threadsTable.commentCount,
        postType: threadsTable.postType,
        createdAt: threadsTable.createdAt,
        subjectName: subjectsTable.name,
        topicName: topicsTable.name,
      })
        .from(threadsTable)
        .leftJoin(subjectsTable, eq(threadsTable.subjectId, subjectsTable.subjectId))
        .leftJoin(topicsTable, eq(threadsTable.topicId, topicsTable.topicId))
        .where(eq(threadsTable.createdBy, userId))
        .orderBy(desc(threadsTable.createdAt))
        .limit(10),

      // Saved posts
      db.select({
        savedAt: savedPostsTable.savedAt,
        thread: {
          threadId: threadsTable.threadId,
          title: threadsTable.title,
          body: threadsTable.body,
          likeCount: threadsTable.likeCount,
          commentCount: threadsTable.commentCount,
          postType: threadsTable.postType,
          createdAt: threadsTable.createdAt,
          creatorName: usersTable.fullName,
        }
      })
        .from(savedPostsTable)
        .leftJoin(threadsTable, eq(savedPostsTable.threadId, threadsTable.threadId))
        .leftJoin(usersTable, eq(threadsTable.createdBy, usersTable.userId))
        .where(eq(savedPostsTable.userId, userId))
        .orderBy(desc(savedPostsTable.savedAt))
        .limit(10),

      // Study streak
      db.select()
        .from(studyStreaksTable)
        .where(eq(studyStreaksTable.userId, userId))
        .limit(1),

      // User profile
      db.select()
        .from(userProfilesTable)
        .where(eq(userProfilesTable.userId, userId))
        .limit(1),
    ]);

    // Calculate total study hours from sessions
    const totalStudyHours = Math.round(
      (studySessionsResult.reduce((sum, session) => sum + (session.totalDuration || 0), 0) / 60) * 100
    ) / 100;

    // Calculate activity counts
    const activityCounts = studySessionsResult.reduce((acc, session) => {
      acc[session.activityType] = (acc[session.activityType] || 0) + (session.totalSessions || 0);
      return acc;
    }, {} as Record<string, number>);

    // Format recent activities
    const recentActivities = recentActivitiesResult.map(activity => ({
      id: activity.sessionId,
      type: activity.activityType,
      title: activity.subjectName
        ? `${activity.subjectName}${activity.topicName ? ` - ${activity.topicName}` : ''}`
        : `${activity.activityType} session`,
      date: activity.startedAt,
      duration: activity.duration,
      subject: activity.subjectName,
      topic: activity.topicName,
    }));

    // Build comprehensive stats
    const stats = {
      totalStudyHours,
      totalSessions: studySessionsResult.reduce((sum, s) => sum + (s.totalSessions || 0), 0),
      totalQueries: usageMetricsResult[0]?.totalQueries || 0,
      flashcardDecks: flashcardDecksResult[0]?.deckCount || 0,
      mindMapsSaved: mindMapsResult[0]?.mindMapCount || 0,
      problemsSolved: quizSubmissionsResult[0]?.totalSubmissions || 0,
      groupsCreated: studyGroupsResult[0]?.groupCount || 0,
      groupsJoined: joinedGroupsResult[0]?.joinedCount || 0,
      postsCreated: createdPostsResult.length,
      postsSaved: savedPostsResult.length,
      activityCounts,
      averageQuizScore: quizSubmissionsResult[0]?.avgScore || 0,
      totalQuizPoints: quizSubmissionsResult[0]?.totalPoints || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivities,
        createdPosts: createdPostsResult,
        savedPosts: savedPostsResult,
        studyStreak: studyStreakResult[0] || null,
        userProfile: userProfileResult[0] || null,
      }
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
} 