import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { flashcardsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface FlashcardGenerationRequest {
  topic: string;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  count?: number;
  language?: string;
  additionalContext?: string;
}

interface GeneratedFlashcard {
  question: string;
  answer: string;
  hint?: string;
  explanation?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const [user] = await db
      .select({ userId: usersTable.userId })
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      topic,
      subject = "",
      difficulty = "beginner",
      count = 5,
      language = "English",
      additionalContext = ""
    }: FlashcardGenerationRequest = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required for flashcard generation" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: API key not available" },
        { status: 500 }
      );
    }

    // Construct the prompt for flashcard generation
    const systemPrompt = `You are an expert educator and flashcard creator specializing in creating high-quality educational flashcards that promote effective learning through spaced repetition and active recall.

CRITICAL INSTRUCTIONS:
1. You MUST return ONLY a valid JSON array - no other text, explanations, or markdown formatting
2. Each flashcard should focus on a single, specific concept
3. Questions should be clear, concise, and test understanding rather than memorization
4. Answers should be accurate and appropriately detailed for the difficulty level
5. Include helpful hints and explanations to enhance learning
6. Use appropriate academic language for the subject matter

JSON FORMAT REQUIREMENTS:
- Return a valid JSON array of flashcard objects
- Each object must have these exact fields:
  * "question": string (the question or prompt)
  * "answer": string (the correct answer)
  * "hint": string (optional learning hint, use null if none)
  * "explanation": string (optional detailed explanation, use null if none)
  * "difficulty": string (exactly one of: "beginner", "intermediate", "advanced")

EXAMPLE RESPONSE FORMAT:
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris",
    "hint": "This city is known as the 'City of Light'",
    "explanation": "Paris has been the capital of France since 987 AD and is the country's political, economic, and cultural center.",
    "difficulty": "beginner"
  }
]

Remember: Return ONLY the JSON array, no other text or formatting.`;

    const userPrompt = `Create exactly ${count} flashcards about "${topic}"${subject ? ` in the subject of ${subject}` : ""}.

REQUIREMENTS:
- Difficulty level: ${difficulty}
- Language: ${language}
${additionalContext ? `- Additional context: ${additionalContext}` : ""}
- Each flashcard should focus on a different aspect of the topic
- Questions should be appropriate for ${difficulty} level
- Include hints and explanations where helpful
- Return ONLY the JSON array with no other text, explanations, or formatting

OUTPUT FORMAT: Return exactly ${count} flashcard objects in a JSON array with the structure shown in the system prompt.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const completionRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://manetho.com",
          "X-Title": "Manetho"
        },
        body: JSON.stringify({
          model: "qwen/qwen3-8b:free",
          messages,
          max_tokens: 2048,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      }
    );

    if (!completionRes.ok) {
      const errorBody = await completionRes.text();
      console.error("OpenRouter API error:", errorBody);
      return NextResponse.json(
        { error: "Failed to generate flashcards with AI" },
        { status: 500 }
      );
    }

    const completion = await completionRes.json();
    const aiResponse = completion?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("No AI response received:", completion);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 500 }
      );
    }

    console.log("AI response received for flashcard generation:", aiResponse.substring(0, 200) + "...");

    // Parse the AI response
    let generatedFlashcards: GeneratedFlashcard[];
    try {
      // Clean the response to extract JSON - handle various formatting issues
      let cleanResponse = aiResponse.trim();

      // Remove markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Remove any text before the first [ and after the last ]
      const startIndex = cleanResponse.indexOf('[');
      const endIndex = cleanResponse.lastIndexOf(']');

      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleanResponse = cleanResponse.substring(startIndex, endIndex + 1);
      }

      // Parse the JSON
      generatedFlashcards = JSON.parse(cleanResponse);

      // Validate the structure
      if (!Array.isArray(generatedFlashcards)) {
        throw new Error("Response is not an array");
      }

      // Validate each flashcard has required fields
      generatedFlashcards.forEach((card, index) => {
        if (!card.question || !card.answer) {
          throw new Error(`Card ${index + 1} is missing required fields`);
        }
        if (!['beginner', 'intermediate', 'advanced'].includes(card.difficulty)) {
          card.difficulty = difficulty; // Use the requested difficulty as fallback
        }
      });

    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw AI response:", aiResponse);
      return NextResponse.json(
        {
          error: "Failed to parse AI generated flashcards. Please try again with a more specific topic.",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
        },
        { status: 500 }
      );
    }

    // Limit the number of flashcards to the requested count
    const limitedFlashcards = generatedFlashcards.slice(0, count);
    
    // Save flashcards to database
    const flashcardsToSave = limitedFlashcards.map((card, index) => ({
      userId: user.userId,
      question: card.question.trim(),
      answer: card.answer.trim(),
      hint: card.hint?.trim() || null,
      explanation: card.explanation?.trim() || null,
      difficulty: card.difficulty || difficulty,
      orderIndex: index,
      contentSource: 'ai_generated' as const,
      aiConfidenceScore: "0.85", // Default confidence score
      timesReviewed: 0,
      correctAnswers: 0,
      needsReview: false
    }));

    const savedFlashcards = await db
      .insert(flashcardsTable)
      .values(flashcardsToSave)
      .returning({
        cardId: flashcardsTable.cardId,
        question: flashcardsTable.question,
        answer: flashcardsTable.answer,
        hint: flashcardsTable.hint,
        explanation: flashcardsTable.explanation,
        difficulty: flashcardsTable.difficulty,
        contentSource: flashcardsTable.contentSource,
        createdAt: flashcardsTable.createdAt
      });

    return NextResponse.json({
      success: true,
      flashcards: savedFlashcards,
      count: savedFlashcards.length,
      topic,
      difficulty
    });

  } catch (error) {
    console.error("Flashcard generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during flashcard generation" },
      { status: 500 }
    );
  }
} 