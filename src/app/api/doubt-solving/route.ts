import { NextRequest, NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { callModelWithFallback, createSystemMessage } from "@/lib/model-fallback";
// PDF processing using vision models for reliable analysis

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
// The route forwards the chat conversation to the OpenRouter API using the specified models with fallback
// and returns the assistant's reply.
//
// It requires an environment variable `OPENROUTER_API_KEY` to be set in the Vercel / Next.js runtime.

interface UploadedFile {
  name: string;
  type: string;
  data?: string; // base64 encoded (no data: prefix)
  url?: string; // URL to the uploaded file
}

// Helper function to fetch file from URL and convert to base64
async function fetchFileAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return base64;
  } catch (error) {
    console.error('Error fetching file as base64:', error);
    throw error;
  }
}

// Helper function to process PDF using vision models
async function processPDFWithVision(base64Data: string, fileName: string): Promise<string> {
  try {
    // For PDFs, we'll use vision models to "read" the PDF content
    // This is more reliable than text extraction which can fail
    console.log(`Processing PDF "${fileName}" using vision models`);
    return `PDF content from "${fileName}" ready for vision analysis`;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Force this route handler to use the Node.js runtime (not Edge) so that native Node modules
// work correctly. See: https://nextjs.org/docs/app/building-your-application/routing/route-handlers#runtime
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

    // Determine if we have a file and what type of processing it needs
    const hasFile = !!file;
    const isPDF = file?.type === "application/pdf";
    const isImage = file?.type?.startsWith("image/");

    // For PDFs and images, we'll use vision models (file processing)
    const needsFileProcessing = hasFile;

    const augmentedMessages: ChatMessage[] = [...messages];

    // Add system message based on input type
    const systemMessage = createSystemMessage(needsFileProcessing, file?.name);
    augmentedMessages.unshift({
      role: "system",
      content: systemMessage
    });

    // Handle file input and prepare fileData for later use
    let fileData: string | undefined;
    if (file) {
      try {
        // Determine if we have base64 data or need to fetch from URL
        if (file.data) {
          // Direct base64 data provided
          fileData = file.data;
        } else if (file.url) {
          // URL provided, fetch and convert to base64
          console.log(`Fetching file from URL: ${file.url}`);
          fileData = await fetchFileAsBase64(file.url);
          console.log(`Successfully converted file to base64 (${fileData.length} chars)`);
        } else {
          throw new Error('No file data or URL provided');
        }

        if (file.type === "application/pdf") {
          try {
            if (!fileData || typeof fileData !== 'string') {
              throw new Error('Invalid PDF data format');
            }

            // Process PDF using vision models
            await processPDFWithVision(fileData, file.name);

            // For PDFs, we'll use vision models to analyze the PDF content
            augmentedMessages.push({
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${fileData}`
                  }
                },
                {
                  type: "text",
                  text: `I've uploaded a PDF document titled "${file.name}". Please analyze this PDF and help with my question about it.`
                }
              ]
            });

            console.log(`PDF will be processed using vision models: ${file.name}`);
          } catch (pdfError) {
            console.error("PDF processing error:", pdfError);
            const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown PDF processing error';
            augmentedMessages.push({
              role: "user",
              content: `I uploaded a PDF titled "${file.name}", but there was an error processing it (${errorMessage}). Please help based on my question alone.`
            });
          }
        } else if (file.type.startsWith("image/")) {
          // Add the image as a separate message with proper format for multimodal models
          augmentedMessages.push({
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.type};base64,${fileData}`
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

    // Use the model fallback system
    // For PDFs and images, use file models (vision models)
    const useFileModels = hasFile;
    const modelResponse = await callModelWithFallback(augmentedMessages, useFileModels, apiKey);

    if (!modelResponse.success) {
      return NextResponse.json(
        { error: modelResponse.error || "All models failed to respond" },
        { status: 500 }
      );
    }

    let reply = modelResponse.content || "";

    // Check if response was truncated and log for debugging
    if (modelResponse.finishReason === "length") {
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

          // Get user's database ID using correct column names
          const userResult = await db.execute(sql`
            SELECT "user_id" FROM users WHERE "clerk_id" = ${userId} LIMIT 1
          `);

          if (userResult.rows && userResult.rows.length > 0) {
            const userDbId = userResult.rows[0].user_id;

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
                const userMessageCount = parseInt(sessionInfo?.user_message_count as string) || 0;
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
                    ${fileData ? `data:${file?.type};base64,${fileData}` : null}, 
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
                    ${modelResponse.modelUsed || 'unknown'},
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

    return NextResponse.json({
      reply,
      modelUsed: modelResponse.modelUsed
    });
  } catch (err) {
    console.error("/api/doubt-solving error", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}