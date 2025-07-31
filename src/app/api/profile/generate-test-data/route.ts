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
  practiceTestsTable,
  studyGroupsTable,
  studyGroupMembersTable,
  studyStreaksTable,
  userProfilesTable,
  subjectsTable,
  topicsTable
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    // Clear existing test data for this user
    await db.delete(studySessionsTable).where(eq(studySessionsTable.userId, userId));
    await db.delete(flashcardDecksTable).where(eq(flashcardDecksTable.userId, userId));
    await db.delete(mindMapsTable).where(eq(mindMapsTable.userId, userId));
    await db.delete(practiceTestSubmissionsTable).where(eq(practiceTestSubmissionsTable.userId, userId));
    await db.delete(practiceTestsTable).where(eq(practiceTestsTable.userId, userId));
    await db.delete(studyGroupMembersTable).where(eq(studyGroupMembersTable.userId, userId));
    await db.delete(threadsTable).where(eq(threadsTable.createdBy, userId));
    await db.delete(savedPostsTable).where(eq(savedPostsTable.userId, userId));
    await db.delete(studyStreaksTable).where(eq(studyStreaksTable.userId, userId));
    await db.delete(usageMetricsTable).where(eq(usageMetricsTable.userId, userId));
    await db.delete(userProfilesTable).where(eq(userProfilesTable.userId, userId));

    // Check for existing subjects or create new ones
    let [mathSubject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.name, 'Mathematics'))
      .limit(1);

    if (!mathSubject) {
      [mathSubject] = await db
        .insert(subjectsTable)
        .values({
          name: 'Mathematics',
          color: '#3B82F6',
          description: 'Advanced mathematics topics'
        })
        .returning();
    }

    let [physicsSubject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.name, 'Physics'))
      .limit(1);

    if (!physicsSubject) {
      [physicsSubject] = await db
        .insert(subjectsTable)
        .values({
          name: 'Physics',
          color: '#EF4444',
          description: 'Physics and mechanics'
        })
        .returning();
    }

    let [chemistrySubject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.name, 'Chemistry'))
      .limit(1);

    if (!chemistrySubject) {
      [chemistrySubject] = await db
        .insert(subjectsTable)
        .values({
          name: 'Chemistry',
          color: '#10B981',
          description: 'Chemical reactions and compounds'
        })
        .returning();
    }

    const [algebraTopic] = await db
      .insert(topicsTable)
      .values({
        name: 'Algebra',
        subjectId: mathSubject.subjectId,
        description: 'Linear algebra and equations'
      })
      .returning();

    const [calculusTopic] = await db
      .insert(topicsTable)
      .values({
        name: 'Calculus',
        subjectId: mathSubject.subjectId,
        description: 'Differential and integral calculus'
      })
      .returning();

    const [mechanicsTopic] = await db
      .insert(topicsTable)
      .values({
        name: 'Mechanics',
        subjectId: physicsSubject.subjectId,
        description: 'Classical mechanics'
      })
      .returning();

    const [organicTopic] = await db
      .insert(topicsTable)
      .values({
        name: 'Organic Chemistry',
        subjectId: chemistrySubject.subjectId,
        description: 'Organic compounds and reactions'
      })
      .returning();

    // Generate 176 hours worth of study sessions (176 * 60 = 10,560 minutes)
    const studySessions = [];
    let totalMinutes = 0;
    const targetMinutes = 10560; // 176 hours
    
    while (totalMinutes < targetMinutes) {
      const sessionDuration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
      const daysAgo = Math.floor(Math.random() * 365); // Random day in the last year
      const startTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      studySessions.push({
        userId,
        activityType: ['quiz', 'flashcard', 'mind-map', 'reading', 'practice'][Math.floor(Math.random() * 5)],
        duration: sessionDuration,
        startedAt: startTime,
        endedAt: new Date(startTime.getTime() + sessionDuration * 60 * 1000),
        subjectId: [mathSubject.subjectId, physicsSubject.subjectId, chemistrySubject.subjectId][Math.floor(Math.random() * 3)],
        topicId: [algebraTopic.topicId, calculusTopic.topicId, mechanicsTopic.topicId, organicTopic.topicId][Math.floor(Math.random() * 4)],
      });
      
      totalMinutes += sessionDuration;
    }

    await db.insert(studySessionsTable).values(studySessions);

    // Generate 23 flashcard decks
    const flashcardDeckNames = [
      'Algebra Basics', 'Calculus Fundamentals', 'Physics Mechanics', 'Organic Chemistry',
      'Linear Algebra', 'Differential Equations', 'Thermodynamics', 'Inorganic Chemistry',
      'Statistics', 'Probability', 'Quantum Mechanics', 'Biochemistry',
      'Number Theory', 'Geometry', 'Electromagnetism', 'Analytical Chemistry',
      'Trigonometry', 'Vector Calculus', 'Optics', 'Physical Chemistry', 'Mathematical Logic',
      'Advanced Calculus', 'Quantum Physics'
    ];

    for (let i = 0; i < 23; i++) {
      await db
        .insert(flashcardDecksTable)
        .values({
          userId,
          name: flashcardDeckNames[i],
          description: `Study materials for ${flashcardDeckNames[i]}`,
          cardCount: Math.floor(Math.random() * 50) + 10, // 10-60 cards
        });
    }

    // Generate 6 mind maps
    const mindMapTitles = [
      'Algebra Concepts', 'Calculus Overview', 'Physics Fundamentals', 'Chemistry Basics',
      'Mathematical Functions', 'Derivatives'
    ];

    for (let i = 0; i < 6; i++) {
      await db
        .insert(mindMapsTable)
        .values({
          userId,
          title: mindMapTitles[i],
          subjectId: [mathSubject.subjectId, physicsSubject.subjectId, chemistrySubject.subjectId][Math.floor(Math.random() * 3)],
          topicId: [algebraTopic.topicId, calculusTopic.topicId, mechanicsTopic.topicId, organicTopic.topicId][Math.floor(Math.random() * 4)],
        });
    }

    // Generate practice tests and submissions
    const testTitles = [
      'Algebra Basics Test', 'Calculus Fundamentals', 'Physics Mechanics Quiz',
      'Chemistry Basics', 'Advanced Mathematics', 'Quantum Physics Test'
    ];

    for (let i = 0; i < 6; i++) {
      const [practiceTest] = await db
        .insert(practiceTestsTable)
        .values({
          userId,
          title: testTitles[i],
          description: `Test for ${testTitles[i]}`,
          subjectId: [mathSubject.subjectId, physicsSubject.subjectId, chemistrySubject.subjectId][Math.floor(Math.random() * 3)],
          topicId: [algebraTopic.topicId, calculusTopic.topicId, mechanicsTopic.topicId, organicTopic.topicId][Math.floor(Math.random() * 4)],
          difficulty: (['beginner', 'intermediate', 'advanced'] as const)[Math.floor(Math.random() * 3)],
          totalQuestions: Math.floor(Math.random() * 20) + 10, // 10-30 questions
          timeLimit: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          isPublic: true,
        })
        .returning();

      // Generate 27 submissions per test (162 total / 6 tests = 27 each)
      for (let j = 0; j < 27; j++) {
        const score = Math.floor(Math.random() * 40) + 60; // 60-100%
        const totalPoints = 100;
        const timeSpent = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
        const daysAgo = Math.floor(Math.random() * 365);
        
        await db
          .insert(practiceTestSubmissionsTable)
          .values({
            userId,
            testId: practiceTest.testId,
            score,
            totalPoints,
            timeSpent: timeSpent * 60, // Convert to seconds
            submittedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          });
      }
    }

    // Generate 12 study groups and join them
    const groupNames = [
      'Advanced Math Study Group', 'Physics Enthusiasts', 'Chemistry Lab Partners',
      'Calculus Masters', 'Quantum Physics Club', 'Organic Chemistry Study',
      'Mathematical Logic Group', 'Statistics Study Group', 'Geometry Enthusiasts',
      'Calculus Advanced', 'Physics Mechanics', 'Chemistry Advanced'
    ];

    for (let i = 0; i < 12; i++) {
      const [studyGroup] = await db
        .insert(studyGroupsTable)
        .values({
          name: groupNames[i],
          description: `Study group for ${groupNames[i]}`,
          createdBy: i === 0 ? userId : 'other-user-id', // User creates 1 group, joins 6 others
          subjectId: [mathSubject.subjectId, physicsSubject.subjectId, chemistrySubject.subjectId][Math.floor(Math.random() * 3)],
          maxParticipants: 10,
          meetingType: 'online',
        })
        .returning();

      await db
        .insert(studyGroupMembersTable)
        .values({
          userId,
          groupId: studyGroup.groupId,
          role: i === 0 ? 'organizer' : 'member',
          joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
        });
    }

    // Generate sample posts
    const postTitles = [
      'Help with quadratic equations', 'Understanding derivatives', 'Physics problem solving',
      'Chemical reaction mechanisms', 'Calculus integration techniques', 'Wave function analysis',
      'Organic synthesis pathways', 'Mathematical proofs', 'Thermodynamics concepts'
    ];

    for (let i = 0; i < 9; i++) {
      const [post] = await db
        .insert(threadsTable)
        .values({
          title: postTitles[i],
          body: `I'm having trouble understanding ${postTitles[i].toLowerCase()}. Can anyone help?`,
          createdBy: userId,
          postType: ['question', 'discussion', 'resource'][Math.floor(Math.random() * 3)],
          subjectId: [mathSubject.subjectId, physicsSubject.subjectId, chemistrySubject.subjectId][Math.floor(Math.random() * 3)],
          topicId: [algebraTopic.topicId, calculusTopic.topicId, mechanicsTopic.topicId, organicTopic.topicId][Math.floor(Math.random() * 4)],
          likeCount: Math.floor(Math.random() * 20) + 1,
          commentCount: Math.floor(Math.random() * 10) + 1,
        })
        .returning();

      // Save some posts
      if (i < 5) {
        await db
          .insert(savedPostsTable)
          .values({
            userId,
            threadId: post.threadId,
            savedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          });
      }
    }

    // Generate sample study streak
    await db
      .insert(studyStreaksTable)
      .values({
        userId,
        currentStreak: 12,
        longestStreak: 25,
        lastStudyDate: new Date().toISOString().split('T')[0], // Convert to date string
      });

    // Generate sample usage metrics
    await db
      .insert(usageMetricsTable)
      .values({
        userId,
        totalQueries: 1250,
        totalStudyTime: 10560 * 60, // 176 hours in seconds
      });

    // Generate sample user profile
    await db
      .insert(userProfilesTable)
      .values({
        userId,
        bio: 'Passionate about learning mathematics, physics, and chemistry. Always eager to help others understand complex concepts.',
        grade: 'University',
        school: 'Computer Science',
        studyGoals: 'Master advanced mathematics, physics, and chemistry concepts',
      });

    // Debug: Check what was actually created
    const actualFlashcardDecks = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashcardDecksTable)
      .where(eq(flashcardDecksTable.userId, userId));

    const actualMindMaps = await db
      .select({ count: sql<number>`count(*)` })
      .from(mindMapsTable)
      .where(eq(mindMapsTable.userId, userId));

    const actualQuizSubmissions = await db
      .select({ count: sql<number>`count(*)` })
      .from(practiceTestSubmissionsTable)
      .where(eq(practiceTestSubmissionsTable.userId, userId));

    const actualStudyGroups = await db
      .select({ count: sql<number>`count(*)` })
      .from(studyGroupMembersTable)
      .where(eq(studyGroupMembersTable.userId, userId));

    console.log('Test Data Generation Debug:', {
      userId,
      actualFlashcardDecks: actualFlashcardDecks[0]?.count,
      actualMindMaps: actualMindMaps[0]?.count,
      actualQuizSubmissions: actualQuizSubmissions[0]?.count,
      actualStudyGroups: actualStudyGroups[0]?.count,
    });

    return NextResponse.json({
      success: true,
      message: 'Realistic test data generated successfully',
      data: {
        studySessions: studySessions.length,
        totalStudyHours: Math.round(totalMinutes / 60),
        flashcardDecks: actualFlashcardDecks[0]?.count || 0,
        mindMaps: actualMindMaps[0]?.count || 0,
        quizSubmissions: actualQuizSubmissions[0]?.count || 0,
        studyGroups: actualStudyGroups[0]?.count || 0,
        posts: 9,
        studyStreak: 12,
      }
    });

  } catch (error) {
    console.error('Error generating test data:', error);
    return NextResponse.json(
      { error: 'Failed to generate test data' },
      { status: 500 }
    );
  }
} 