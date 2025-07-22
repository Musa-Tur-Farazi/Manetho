import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { mindMapsTable, mindMapNodesTable, mindMapConnectionsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Helper function to check database connectivity
async function checkDatabaseConnection(db: any, usersTable: any, clerkUserId: string) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const [foundUser] = await db
        .select({ userId: usersTable.userId })
        .from(usersTable)
        .where(eq(usersTable.clerkId, clerkUserId))
        .limit(1);

      return foundUser;
    } catch (dbError) {
      retryCount++;
      console.error(`Database connection attempt ${retryCount} failed:`, dbError);

      if (retryCount >= maxRetries) {
        throw new Error("Database connection failed after multiple attempts");
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
}

interface MindMapGenerationRequest {
  topic: string;
  description?: string;
  context?: string;
  layout?: 'tree' | 'radial' | 'org' | 'fishbone' | 'flowchart';
  theme?: string;
  maxNodes?: number;
  language?: string;
}

interface GeneratedNode {
  id: string;
  text: string;
  level: number;
  parentId?: string;
  children?: GeneratedNode[];
  color?: string;
  icon?: string;
  notes?: string;
}

interface GeneratedMindMap {
  title: string;
  description: string;
  layout: string;
  theme: string;
  nodes: GeneratedNode[];
  connections: {
    from: string;
    to: string;
    label?: string;
  }[];
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // Set a timeout for the entire operation (2 minutes)
  const timeout = 120000; // 2 minutes in milliseconds

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);
  });

  const operationPromise = async () => {
    try {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user from database with retry logic
      let user;
      try {
        user = await checkDatabaseConnection(db, usersTable, clerkUserId);
      } catch (error) {
        console.error("Database connection failed:", error);
        return NextResponse.json({
          error: "Database connection error. Please try again later.",
          details: "Unable to connect to database after multiple attempts. This might be a temporary issue."
        }, { status: 503 });
      }

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const body = await req.json();
      const {
        topic,
        description = "",
        context = "",
        layout = "tree",
        theme = "default",
        maxNodes = 20,
        language = "English"
      } = body as MindMapGenerationRequest;

      if (!topic || topic.trim().length === 0) {
        return NextResponse.json(
          { error: "Topic is required" },
          { status: 400 }
        );
      }

      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Server mis-configuration: OPENROUTER_API_KEY not set." },
          { status: 500 }
        );
      }

      // Create a comprehensive system prompt for mind map generation
      const systemPrompt = `Create an educational mind map JSON with ${maxNodes} nodes max. Focus on SPECIFIC, ACTIONABLE content rather than generic categories.

For math formulas: Include actual examples, memory tricks, visual patterns, real applications.
For concepts: Include definitions, examples, connections, practical uses.
For topics: Include facts, relationships, key points, applications.

Use concise but SPECIFIC text (max 4 words per node).

STRUCTURE:
{
  "title": "Topic title",
  "description": "Brief description",
  "layout": "${layout}",
  "theme": "${theme}",
  "nodes": [
    {
      "id": "root",
      "text": "Main Topic",
      "level": 0,
      "parentId": null,
      "color": "#3b82f6",
      "icon": "📚",
      "notes": "Root node"
    },
    {
      "id": "branch_1",
      "text": "Specific Detail",
      "level": 1,
      "parentId": "root",
      "color": "#10b981",
      "icon": "🌿",
      "notes": "Level 1 branch"
    }
  ],
  "connections": [
    {
      "from": "root",
      "to": "branch_1",
      "label": "leads to"
    }
  ]
}

RULES:
- Level 0 = root node (main topic) - use "root" as ID
- Level 1 = main categories - use descriptive IDs like "branch_1", "branch_2"
- Level 2+ = subcategories - use nested IDs like "branch_1_item_1"
- Use relevant emoji icons
- Keep text short but SPECIFIC and meaningful
- Create logical hierarchies with proper parent-child relationships
- Ensure ALL child nodes have correct parentId references
- For formulas: include actual examples, memory tricks, patterns
- For concepts: include definitions, examples, applications
- Avoid vague terms like "Examples", "Basic Steps" - be specific!
- Return ONLY valid JSON`;

      let enhancedUserPrompt = `Create a mind map about "${topic}"${description ? ` - ${description}` : ""}.${context ? ` Context: ${context}` : ""}`;

      // Add specific guidance based on topic type
      if (topic.includes('=') || topic.includes('^') || topic.includes('²') || topic.includes('√')) {
        enhancedUserPrompt += `

This is a math formula/equation. Include:
- ACTUAL examples with numbers (like (3+4)² = 9+24+16 = 49)
- Memory tricks and patterns
- Visual/geometric interpretations
- Real-world applications
- Common mistakes to avoid
- Step-by-step breakdown with actual calculations

Make it practical and memorable, not just abstract categories.`;
      } else if (topic.toLowerCase().includes('remember') || topic.toLowerCase().includes('memorize')) {
        enhancedUserPrompt += `

This is about memory techniques. Include:
- SPECIFIC memory tricks and mnemonics
- Visual associations and patterns
- Practice examples
- Real applications
- Step-by-step memory methods

Focus on actionable memory strategies, not vague categories.`;
      }

      const userPrompt = enhancedUserPrompt;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      console.log("Generating mind map for topic:", topic);

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
            max_tokens: 4000,
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
          { error: "Failed to generate mind map with AI" },
          { status: 500 }
        );
      }

      const completion = await completionRes.json();
      const aiResponse = completion?.choices?.[0]?.message?.content;
      const finishReason = completion?.choices?.[0]?.finish_reason;

      if (!aiResponse) {
        console.error("No AI response received:", completion);
        return NextResponse.json(
          { error: "Invalid response from AI service" },
          { status: 500 }
        );
      }

      // Check if response was truncated
      if (finishReason === 'length') {
        console.error("AI response was truncated due to token limit");
        return NextResponse.json(
          {
            error: "AI response was too long and got truncated. Please try a simpler topic or be more specific.",
            details: "The AI response exceeded the token limit. Try breaking down your topic into smaller, more focused areas."
          },
          { status: 500 }
        );
      }

      console.log("AI response received for mind map generation:", aiResponse.substring(0, 200) + "...");

      // Parse the AI response
      let generatedMindMap: GeneratedMindMap;
      try {
        // Clean the response to extract JSON - handle various formatting issues
        let cleanResponse = aiResponse.trim();

        // Remove markdown code blocks
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Remove any text before the first { and after the last }
        const startIndex = cleanResponse.indexOf('{');
        const endIndex = cleanResponse.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          cleanResponse = cleanResponse.substring(startIndex, endIndex + 1);
        }

        // Parse the JSON
        generatedMindMap = JSON.parse(cleanResponse);

        // Validate the structure
        if (!generatedMindMap.nodes || !Array.isArray(generatedMindMap.nodes)) {
          throw new Error("Invalid mind map structure: nodes array missing");
        }

        if (!generatedMindMap.connections || !Array.isArray(generatedMindMap.connections)) {
          throw new Error("Invalid mind map structure: connections array missing");
        }

        // Validate nodes structure
        generatedMindMap.nodes.forEach((node, index) => {
          if (!node.id || !node.text || typeof node.level !== 'number') {
            throw new Error(`Node ${index + 1} is missing required fields`);
          }
        });

      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("Raw AI response:", aiResponse);
        console.error("Finish reason:", finishReason);

        // Check if this might be a truncation issue
        if (finishReason === 'length' || !aiResponse.includes('}')) {
          return NextResponse.json(
            {
              error: "AI response was incomplete or truncated. Please try a simpler topic or be more specific.",
              details: "The AI response appears to be cut off. Try using fewer words or breaking down your topic."
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            error: "Failed to parse AI generated mind map. Please try again with a more specific topic.",
            details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
          },
          { status: 500 }
        );
      }

      // Save mind map to database with error handling
      let savedMindMap;
      try {
        [savedMindMap] = await db
          .insert(mindMapsTable)
          .values({
            userId: user.userId,
            title: generatedMindMap.title || topic,
            description: generatedMindMap.description || "",
            prompt: `${topic}${description ? ` - ${description}` : ""}${context ? ` (${context})` : ""}`,
            layout: generatedMindMap.layout || layout,
            theme: generatedMindMap.theme || theme,
            contentSource: 'ai_generated',
            aiConfidenceScore: "0.85",
            nodeCount: generatedMindMap.nodes.length,
            connectionCount: generatedMindMap.connections.length,
          })
          .returning({
            mindmapId: mindMapsTable.mindmapId,
            title: mindMapsTable.title,
            description: mindMapsTable.description,
            layout: mindMapsTable.layout,
            theme: mindMapsTable.theme,
            createdAt: mindMapsTable.createdAt
          });
      } catch (dbError) {
        console.error("Failed to save mind map:", dbError);
        return NextResponse.json({
          error: "Failed to save mind map to database.",
          details: "Database error occurred while saving. Please try again."
        }, { status: 500 });
      }

      // Create mapping from AI-generated IDs to UUIDs
      const nodeIdMap = new Map<string, string>();

      // First pass: Generate UUIDs for all nodes
      generatedMindMap.nodes.forEach((node) => {
        const nodeUUID = randomUUID();
        nodeIdMap.set(node.id, nodeUUID);
        console.log(`Mapping AI ID "${node.id}" to UUID "${nodeUUID}"`);
      });

      // Second pass: Create final nodes with correct parent references
      const finalNodes = generatedMindMap.nodes.map((node, index) => {
        const nodeUUID = nodeIdMap.get(node.id);
        const parentUUID = node.parentId ? nodeIdMap.get(node.parentId) : null;

        // Debug logging
        console.log(`Processing node ${index + 1}:`, {
          originalId: node.id,
          nodeUUID,
          parentId: node.parentId,
          parentUUID,
          text: node.text,
          level: node.level
        });

        // Validate UUIDs
        if (!nodeUUID) {
          throw new Error(`Failed to generate UUID for node "${node.id}"`);
        }

        if (node.parentId && !parentUUID) {
          console.warn(`Warning: Parent node "${node.parentId}" not found for node "${node.id}"`);
        }

        return {
          mindmapId: savedMindMap.mindmapId,
          nodeId: nodeUUID,
          parentNodeId: parentUUID,
          text: node.text.trim(),
          level: node.level,
          color: node.color || (node.level === 0 ? '#1f2937' : '#3b82f6'),
          icon: node.icon || null,
          notes: node.notes || null,
          isRoot: node.level === 0,
          orderIndex: index,
          positionX: '0', // Will be calculated on frontend
          positionY: '0', // Will be calculated on frontend
        };
      });

      console.log(`Created ${finalNodes.length} final nodes for database insertion`);

      // Save nodes to database with error handling
      let savedNodes;
      try {
        console.log('Inserting nodes into database...');
        savedNodes = await db
          .insert(mindMapNodesTable)
          .values(finalNodes)
          .returning();
        console.log(`Successfully saved ${savedNodes.length} nodes`);
      } catch (dbError) {
        console.error("Failed to save mind map nodes:", dbError);
        console.error("Node data that failed to save:", JSON.stringify(finalNodes, null, 2));
        return NextResponse.json({
          error: "Failed to save mind map nodes to database.",
          details: "Database error occurred while saving nodes. Please try again."
        }, { status: 500 });
      }

      // Save connections to database with proper UUID mapping
      let connectionValues: any[] = [];

      if (generatedMindMap.connections.length > 0) {
        const validConnections = generatedMindMap.connections.filter(conn => {
          const fromNodeExists = nodeIdMap.has(conn.from);
          const toNodeExists = nodeIdMap.has(conn.to);
          if (!fromNodeExists || !toNodeExists) {
            console.warn(`Invalid connection: ${conn.from} -> ${conn.to}. Node not found.`);
            return false;
          }
          return true;
        });

        connectionValues = validConnections.map((conn) => ({
          mindmapId: savedMindMap.mindmapId,
          fromNodeId: nodeIdMap.get(conn.from)!,
          toNodeId: nodeIdMap.get(conn.to)!,
          label: conn.label || null,
        }));
      }

      // Fallback: Create connections based on parent-child relationships if no valid connections
      if (connectionValues.length === 0) {
        console.log("No valid connections from AI, creating from parent-child relationships");
        connectionValues = generatedMindMap.nodes
          .filter(node => node.parentId && nodeIdMap.has(node.parentId))
          .map((node) => ({
            mindmapId: savedMindMap.mindmapId,
            fromNodeId: nodeIdMap.get(node.parentId!)!,
            toNodeId: nodeIdMap.get(node.id)!,
            label: null,
          }));
      }

      if (connectionValues.length > 0) {
        try {
          await db
            .insert(mindMapConnectionsTable)
            .values(connectionValues);
        } catch (dbError) {
          console.error("Failed to save mind map connections:", dbError);
          return NextResponse.json({
            error: "Failed to save mind map connections to database.",
            details: "Database error occurred while saving connections. Please try again."
          }, { status: 500 });
        }
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      console.log(`Mind map generation completed successfully in ${executionTime}ms`);

      return NextResponse.json({
        success: true,
        mindMap: {
          ...savedMindMap,
          nodes: savedNodes,
          connections: generatedMindMap.connections
        },
        topic,
        nodeCount: generatedMindMap.nodes.length,
        connectionCount: generatedMindMap.connections.length,
        executionTime
      });

    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      console.error("Mind map generation error:", error);
      console.error(`Mind map generation failed after ${executionTime}ms`);

      // Check if it's a database connection error
      if (error && typeof error === 'object' && 'code' in error && error.code === 'UND_ERR_CONNECT_TIMEOUT') {
        return NextResponse.json({
          error: "Database connection timeout. Please try again.",
          details: "The database connection timed out. This might be due to high server load or temporary connectivity issues."
        }, { status: 503 });
      }

      return NextResponse.json({
        error: "Failed to generate mind map",
        details: "An unexpected error occurred during mind map generation. Please try again."
      }, { status: 500 });
    }
  };

  try {
    return await Promise.race([operationPromise(), timeoutPromise]);
  } catch (error) {
    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.error("Mind map generation timeout or error:", error);
    console.error(`Operation timed out or failed after ${executionTime}ms`);

    if (error instanceof Error && error.message === 'Request timeout') {
      return NextResponse.json({
        error: "Request timeout",
        details: "The mind map generation is taking too long. Please try with a simpler topic or try again later."
      }, { status: 408 });
    }

    return NextResponse.json({
      error: "Failed to generate mind map",
      details: "An unexpected error occurred during mind map generation. Please try again."
    }, { status: 500 });
  }
} 