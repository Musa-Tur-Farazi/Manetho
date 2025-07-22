import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import {
  usersTable,
  practiceTestsTable,
  testQuestionsTable,
  subjectsTable,
  topicsTable,
  flashcardDecksTable,
  flashcardsTable
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      topic,
      difficulty = 'intermediate',
      questionCount = 10,
      subjectId = null,
      topicId = null,
      questionType = 'multiple_choice', // multiple_choice, true_false, short_answer
      focusAreas = [],
      additionalContext = ''
    } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
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

    // Generate quiz questions using AI
    const aiPrompt = buildAIPrompt(topic, difficulty, questionCount, questionType, focusAreas, additionalContext);
    const generatedQuestions = await generateQuestionsWithAI(aiPrompt, topic, questionCount);

    // Create practice test
    const [practiceTest] = await db
      .insert(practiceTestsTable)
      .values({
        userId: user.userId,
        title: `AI Generated Quiz: ${topic}`,
        description: `AI-generated quiz on ${topic} (${difficulty} level)`,
        subjectId: subjectId,
        topicId: topicId,
        difficulty: difficulty,
        isPublic: false,
        timeLimit: Math.max(questionCount * 2, 10), // 2 minutes per question, minimum 10 minutes
        totalQuestions: questionCount,
        totalPoints: questionCount,
        tags: focusAreas.length > 0 ? JSON.stringify(focusAreas) : null,
        aiGenerated: true,
        generationPrompt: aiPrompt
      })
      .returning({ testId: practiceTestsTable.testId });

    // Insert generated questions
    const questionsToInsert = generatedQuestions.map((q, index) => ({
      testId: practiceTest.testId,
      question: q.question,
      options: q.options ? JSON.stringify(q.options) : null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || null,
      points: 1,
      orderIndex: index,
      aiGenerated: true
    }));

    await db.insert(testQuestionsTable).values(questionsToInsert);

    // Fetch the complete quiz with questions
    const questions = await db
      .select()
      .from(testQuestionsTable)
      .where(eq(testQuestionsTable.testId, practiceTest.testId))
      .orderBy(testQuestionsTable.orderIndex);

    return NextResponse.json({
      success: true,
      quiz: {
        testId: practiceTest.testId,
        title: `AI Generated Quiz: ${topic}`,
        description: `AI-generated quiz on ${topic} (${difficulty} level)`,
        difficulty,
        totalQuestions: questionCount,
        timeLimit: Math.max(questionCount * 2, 10),
        aiGenerated: true
      },
      questions: questions.map(q => {
        let parsedOptions = null;
        if (q.options) {
          try {
            parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          } catch (e) {
            console.error('Error parsing options for question:', q.questionId, e);
            parsedOptions = null;
          }
        }

        return {
          questionId: q.questionId,
          question: q.question,
          options: parsedOptions,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
          orderIndex: q.orderIndex
        };
      })
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}

// AI Quiz Generation Functions
function buildAIPrompt(topic: string, difficulty: string, questionCount: number, questionType: string, focusAreas: string[], additionalContext: string) {
  let prompt = `Generate ${questionCount} ${questionType.replace('_', ' ')} questions about "${topic}" at ${difficulty} level.`;

  if (focusAreas.length > 0) {
    prompt += ` Focus on these areas: ${focusAreas.join(', ')}.`;
  }

  if (additionalContext) {
    prompt += ` Additional context: ${additionalContext}.`;
  }

  prompt += `

Requirements:
- Questions should be educational and test understanding
- Include clear, concise questions
- Provide accurate answers
- Include brief explanations for each answer
- Ensure questions are at appropriate ${difficulty} level
- Make questions diverse and cover different aspects of the topic

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["A", "B", "C", "D"] // Only for multiple choice
    "correctAnswer": "Correct answer text",
    "explanation": "Brief explanation of why this is correct"
  }
]

For multiple choice questions, provide 4 options.
For true/false questions, omit the options array.
For short answer questions, omit the options array.`;

  return prompt;
}

async function generateQuestionsWithAI(prompt: string, topic: string, questionCount: number) {
  try {
    // Try OpenRouter API (compatible with OpenAI format)
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || process.env.OPEN_ROUTER_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;
    const apiKey = openRouterKey || openAIKey;
    const apiUrl = openRouterKey
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    console.log('API Key Check:', {
      hasOpenRouterKey: !!openRouterKey,
      hasOpenAIKey: !!openAIKey,
      usingOpenRouter: !!openRouterKey,
      apiUrl
    });

    if (apiKey) {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(openRouterKey && {
            'HTTP-Referer': 'https://manetho.com', // Required for OpenRouter
            'X-Title': 'Manetho Quiz Generator'
          })
        },
                  body: JSON.stringify({
            model: openRouterKey ? 'openai/gpt-4o-mini' : 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an educational content creator. Generate high-quality quiz questions that help students learn and test their understanding. Always return valid JSON in the exact format requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Clean up the response to ensure it's valid JSON
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the AI response
        const questions = JSON.parse(cleanedResponse);
        return questions;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API request failed: ${response.status}`);
      }
    }

    // If no API key or API call failed, use fallback
    throw new Error('AI API not available');
  } catch (error) {
    console.error('AI generation error:', error);

    // Fallback to sample questions if AI fails
    const fallbackQuestions = [];
    const topicLower = prompt.toLowerCase();

    // Generate basic questions based on the topic
    for (let i = 0; i < Math.min(questionCount, 10); i++) {
      fallbackQuestions.push({
        question: `What is a key concept related to ${topic}?`,
        options: [
          `Basic concept ${i + 1}`,
          `Alternative concept ${i + 1}`,
          `Related idea ${i + 1}`,
          `Different approach ${i + 1}`
        ],
        correctAnswer: `Basic concept ${i + 1}`,
        explanation: `This is a fundamental concept in ${topic} that helps build understanding.`
      });
    }

    return fallbackQuestions;
  }
}

// API endpoint to convert quiz questions to flashcards
export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testId, deckName, selectedQuestions } = await request.json();

    if (!testId || !deckName) {
      return NextResponse.json({ error: 'Test ID and deck name are required' }, { status: 400 });
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

    // Get quiz questions
    const questions = await db
      .select()
      .from(testQuestionsTable)
      .where(eq(testQuestionsTable.testId, testId));

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this quiz' }, { status: 404 });
    }

    // Create flashcard deck
    const [flashcardDeck] = await db
      .insert(flashcardDecksTable)
      .values({
        userId: user.userId,
        name: deckName,
        description: `Flashcards generated from AI quiz`,
        isPublic: false,
        totalCards: selectedQuestions ? selectedQuestions.length : questions.length,
        tags: JSON.stringify(['ai-generated', 'quiz-derived'])
      })
      .returning({ deckId: flashcardDecksTable.deckId });

    // Convert questions to flashcards
    const questionsToConvert = selectedQuestions
      ? questions.filter(q => selectedQuestions.includes(q.questionId))
      : questions;

    const flashcardsToInsert = questionsToConvert.map((q, index) => ({
      deckId: flashcardDeck.deckId,
      front: q.question,
      back: `${q.correctAnswer}${q.explanation ? '\n\nExplanation: ' + q.explanation : ''}`,
      orderIndex: index,
      aiGenerated: true
    }));

    await db.insert(flashcardsTable).values(flashcardsToInsert);

    return NextResponse.json({
      success: true,
      message: 'Flashcard deck created successfully',
      deck: {
        deckId: flashcardDeck.deckId,
        name: deckName,
        totalCards: flashcardsToInsert.length
      }
    });

  } catch (error) {
    console.error('Error converting to flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to convert quiz to flashcards' },
      { status: 500 }
    );
  }
} 