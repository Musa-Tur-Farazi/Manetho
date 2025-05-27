import { NextRequest, NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// We'll treat all files as inputs to the Qwen model instead of trying to parse PDFs ourselves

// Enhanced interface for complex message content types
interface MessageContent {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

// Message type for the API
interface ChatMessage {
  role: string;
  content: string | MessageContent[];
}

// POST /api/doubt-solving
// Expects a JSON body: { messages: { role: "user" | "assistant" | "system", content: string }[] }
// Returns: { reply: string }
//
// The route forwards the chat conversation to the OpenRouter API using the free Qwen2.5 VL 32B Instruct model and
// returns the assistant's reply.
//
// It requires an environment variable `OPENROUTER_API_KEY` to be set in the Vercel / Next.js runtime.

interface UploadedFile {
  name: string;
  type: string;
  data: string; // base64 encoded (no data: prefix)
}

// Force this route handler to use the Node.js runtime (not Edge) so that native Node modules
// such as `pdf-parse` work correctly. See: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#runtime
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, file, sessionId } = (await req.json()) as {
      messages?: ChatMessage[];
      file?: UploadedFile;
      sessionId?: string;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: `messages` array missing." },
        { status: 400 }
      );
    }

    let model = "qwen/qwen3-8b:free";
    const augmentedMessages: ChatMessage[] = [...messages];

    // Add a system message for regular text queries to optimize the model's capabilities
    if (!file) {
      augmentedMessages.unshift({
        role: "system",
        content: `You are Qwen2.5 VL, an advanced AI assistant specializing in educational support and problem-solving.

Use your enhanced reasoning capabilities to:
1. Provide detailed, step-by-step explanations for academic questions
2. Show all mathematical reasoning clearly with proper LaTeX formatting using $ for inline and $$ for display equations
3. Structure your responses with clear formatting using Markdown (bold headings, numbered lists, etc.)
4. For coding questions, provide well-commented code with explanations
5. When appropriate, offer multiple solution approaches to deepen understanding
6. Always provide complete responses - never cut off explanations mid-sentence
7. If a problem has multiple parts, address each part thoroughly
8. Include final answers and conclusions clearly

Always aim for educational value that helps the student learn the underlying concepts, not just the answer. Ensure your response is complete and comprehensive.`
      });
    }

    if (file) {
      // Switch to Qwen model for better vision capabilities and long-context reasoning
      model = "qwen/qwen3-8b:free";

      try {
        if (file.type === "application/pdf") {
          try {
            if (!file.data || typeof file.data !== 'string') {
              throw new Error('Invalid PDF data format');
            }

            // Always use Qwen3 model for PDFs
            model = "qwen/qwen3-8b:free";

            // Tell the model about the PDF, but don't try to parse it
            augmentedMessages.unshift({
              role: "system",
              content: `You are Qwen2.5 VL, an advanced AI assistant specialized in analyzing documents and solving educational problems.
              
The user has uploaded a PDF titled "${file.name}". Use your enhanced visual and reasoning capabilities to:
1. Extract and process textual information from the document
2. Identify any mathematical formulas, diagrams, or charts
3. Provide detailed, step-by-step explanations for any educational problems
4. Ensure all mathematical reasoning is shown clearly with LaTeX formatting using $ and $$ delimiters
5. Format your response with clear sections using Markdown syntax (bold, headings, lists)`
            });

            // Optionally include the PDF data directly for Qwen to process
            augmentedMessages.push({
              role: "user",
              content: [
                {
                  type: "text",
                  text: "I've uploaded a PDF document. Please help with my question about it."
                }
              ]
            });
          } catch (pdfError) {
            console.error("PDF processing error:", pdfError);
            augmentedMessages.unshift({
              role: "system",
              content: `The user uploaded a PDF titled "${file.name}", but there was an error processing it. Please help based on their question alone.`
            });
          }
        } else if (file.type.startsWith("image/")) {
          // For images, we'll use Qwen3 which has enhanced capabilities
          model = "qwen/qwen3-8b:free";
          augmentedMessages.unshift({
            role: "system",
            content: `You are Qwen2.5 VL, an advanced AI assistant with superior visual analysis capabilities.
            
The user has uploaded an image. Use your enhanced vision-language capabilities to:
1. Carefully analyze all visual elements in the image, including text, diagrams, charts, and mathematical expressions
2. If the image contains mathematical problems, provide detailed step-by-step solutions with clear reasoning
3. If there are complex diagrams or charts, describe their components and explain relationships
4. For handwritten content, transcribe accurately and interpret the meaning
5. Present your analysis in a well-structured format using Markdown syntax (bold, headings, lists)
6. For mathematical expressions, use LaTeX formatting with $ and $$ delimiters for clarity
7. Always provide complete responses - never cut off explanations mid-sentence
8. If multiple problems are visible, solve each one thoroughly
9. Include final answers and conclusions clearly

Ensure your response is complete and comprehensive, addressing all aspects of the uploaded image.`
          });

          // Add the image as a separate message with proper format for multimodal models
          augmentedMessages.push({
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${file.data}`
                }
              },
              {
                type: "text",
                text: "Please analyze this image and help with my question above."
              }
            ]
          });
        }
      } catch (err) {
        console.error("File processing failed", err);
      }
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server mis-configuration: OPENROUTER_API_KEY not set." },
        { status: 500 }
      );
    }

    const completionRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          // Optional but recommended headers so your app appears on OpenRouter leaderboards.
          "HTTP-Referer": "https://manetho.com", // change to your production URL if different
          "X-Title": "Manetho"
        },
        body: JSON.stringify({
          model,
          messages: augmentedMessages,
          max_tokens: 4096, // Increased from 1024 to allow longer responses
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      }
    );

    if (!completionRes.ok) {
      const errorBody = await completionRes.text();
      return NextResponse.json(
        { error: "OpenRouter request failed", details: errorBody },
        { status: completionRes.status }
      );
    }

    const completion = await completionRes.json();

    // Helper to safely extract text from different response shapes
    const assistantMessage = completion?.choices?.[0]?.message;
    let reply = "";

    if (typeof assistantMessage?.content === "string") {
      reply = assistantMessage.content.trim();
    } else if (Array.isArray(assistantMessage?.content)) {
      // Concatenate all text chunks (ignore image references in response)
      reply = assistantMessage.content
        .filter((c: any) => c?.type === "text" && typeof c.text === "string")
        .map((c: any) => c.text)
        .join("\n")
        .trim();
    } else if (assistantMessage?.content?.text) {
      reply = String(assistantMessage.content.text).trim();
    }

    // Check if response was truncated and log for debugging
    const finishReason = completion?.choices?.[0]?.finish_reason;
    if (finishReason === "length") {
      console.warn("Response was truncated due to length limit. Consider increasing max_tokens.");
      reply += "\n\n*[Response was truncated due to length limit. Please ask for continuation if needed.]*";
    }

    // Ensure we have a valid response
    if (!reply || reply.length === 0) {
      reply = "I apologize, but I wasn't able to generate a proper response. Please try rephrasing your question or try again.";
    }

    // Save messages to database if sessionId is provided
    if (sessionId) {
      try {
        const { auth } = await import('@clerk/nextjs/server');
        const { db } = await import('@/db');
        const { sql } = await import('drizzle-orm');
        const { syncUserToDatabase } = await import('@/lib/user-sync');

        const { userId } = await auth();

        if (userId) {
          // Ensure user exists in database
          const syncResult = await syncUserToDatabase();
          if (!syncResult.success) {
            console.warn('User sync failed:', syncResult.message);
          }

          // Get user's database ID
          const userResult = await db.execute(sql`
            SELECT id FROM users WHERE "clerkId" = ${userId} LIMIT 1
          `);

          if (userResult.rows && userResult.rows.length > 0) {
            const userDbId = userResult.rows[0].id;

            // Verify session belongs to user
            const sessionResult = await db.execute(sql`
              SELECT session_id FROM doubt_solving_sessions 
              WHERE session_id = ${sessionId} AND user_id = ${userDbId}
              LIMIT 1
            `);

            if (sessionResult.rows && sessionResult.rows.length > 0) {
              // Save user message and handle title update
              const userMessage = messages[messages.length - 1];
              if (userMessage && userMessage.role === 'user') {
                const userContent = typeof userMessage.content === 'string'
                  ? userMessage.content
                  : JSON.stringify(userMessage.content);

                // Check if this is the first user message and session still has default title
                // We need to check BEFORE inserting the message
                const sessionInfoResult = await db.execute(sql`
                  SELECT title, 
                         (SELECT COUNT(*) FROM doubt_solving_messages WHERE session_id = ${sessionId} AND role = 'user') as user_message_count
                  FROM doubt_solving_sessions 
                  WHERE session_id = ${sessionId}
                `);

                const sessionInfo = sessionInfoResult.rows[0];
                const userMessageCount = parseInt(sessionInfo?.user_message_count) || 0;
                const currentTitle = sessionInfo?.title || '';

                // Debug: Check what messages exist
                const debugMessages = await db.execute(sql`
                  SELECT role, LEFT(content, 50) as content_preview, created_at 
                  FROM doubt_solving_messages 
                  WHERE session_id = ${sessionId} 
                  ORDER BY created_at ASC
                `);

                console.log(`Session ${sessionId} title update check:`, {
                  userMessageCount,
                  currentTitle,
                  existingMessages: debugMessages.rows,
                  willUpdateTitle: userMessageCount === 0 && currentTitle === 'New Chat'
                });

                // Check if this will be the first user message (count is 0 before insertion)
                const isFirstUserMessage = userMessageCount === 0;

                // Save user message
                await db.execute(sql`
                  INSERT INTO doubt_solving_messages (
                    session_id, 
                    role, 
                    content, 
                    attachment_url, 
                    attachment_type, 
                    attachment_name
                  )
                  VALUES (
                    ${sessionId}, 
                    'user', 
                    ${userContent}, 
                    ${file ? `data:${file.type};base64,${file.data}` : null}, 
                    ${file?.type || null}, 
                    ${file?.name || null}
                  )
                `);

                // Update title if this was the first user message AND title is still "New Chat"
                if (isFirstUserMessage && currentTitle === 'New Chat') {
                  // Generate a title from the first message
                  const title = userContent.length > 50
                    ? userContent.substring(0, 47) + '...'
                    : userContent;

                  await db.execute(sql`
                    UPDATE doubt_solving_sessions 
                    SET title = ${title}
                    WHERE session_id = ${sessionId}
                  `);
                }
              }

              // Save assistant message
              if (reply) {
                await db.execute(sql`
                  INSERT INTO doubt_solving_messages (
                    session_id, 
                    role, 
                    content, 
                    model_used,
                    token_count
                  )
                  VALUES (
                    ${sessionId}, 
                    'assistant', 
                    ${reply}, 
                    ${model},
                    ${reply.length}
                  )
                `);
              }

              // Update session's message count and last message time
              await db.execute(sql`
                UPDATE doubt_solving_sessions 
                SET 
                  message_count = message_count + 2,
                  last_message_at = NOW(),
                  updated_at = NOW()
                WHERE session_id = ${sessionId}
              `);
            }
          }
        }
      } catch (saveError) {
        console.error('Error saving messages to database:', saveError);
        // Don't fail the request if saving fails
      }
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("/api/doubt-solving error", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}