// Model fallback system for doubt-solving
// Handles automatic model switching when rate limits are exceeded

import { TEXT_MODELS, FILE_MODELS, ModelConfig } from './model-config';

export interface ModelResponse {
  success: boolean;
  content?: string;
  modelUsed?: string;
  error?: string;
  finishReason?: string;
}

// Error patterns that indicate rate limits or model unavailability
const RATE_LIMIT_PATTERNS = [
  /rate limit/i,
  /quota exceeded/i,
  /model not available/i,
  /model is currently unavailable/i,
  /model is overloaded/i,
  /too many requests/i,
  /429/i,
  /model not found/i,
  /model is not available/i,
  /no endpoints found that support image input/i,
  /does not support image input/i,
  /image input not supported/i,
  /media format is not supported/i,
  /media format is not supported or incorrect/i,
  /invalidparameter\.datainspection/i,
  /the media format is not supported or incorrect for the data inspection/i,
  /failed to extract.*image/i,
  /failed to extract.*images/i,
  /image extraction failed/i,
  /unable to process image/i,
  /image processing failed/i,
  /is not a valid model id/i,
  /invalid model/i,
  /model not recognized/i
];

export function isRateLimitError(error: string): boolean {
  return RATE_LIMIT_PATTERNS.some(pattern => pattern.test(error));
}

export async function callModelWithFallback(
  messages: any[],
  hasFile: boolean = false,
  apiKey: string
): Promise<ModelResponse> {
  const models = hasFile ? FILE_MODELS : TEXT_MODELS;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];

    try {
      console.log(`🔄 Trying model: ${model.name} (attempt ${i + 1}/${models.length})`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://manetho.com",
          "X-Title": "Manetho"
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          max_tokens: model.maxTokens || 4096,
          temperature: model.temperature || 0.7,
          top_p: model.topP || 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.warn(`❌ Model ${model.name} failed:`, errorBody);

        // Check if it's a rate limit error
        if (isRateLimitError(errorBody)) {
          console.log(`⏳ Rate limit hit for ${model.name}, trying next model...`);
          continue; // Try next model
        } else {
          // Non-rate-limit error, return the error
          return {
            success: false,
            error: `Model ${model.name} failed: ${errorBody}`,
            modelUsed: model.name
          };
        }
      }

      const completion = await response.json();
      const assistantMessage = completion?.choices?.[0]?.message;
      const finishReason = completion?.choices?.[0]?.finish_reason;

      let content = "";

      if (typeof assistantMessage?.content === "string") {
        content = assistantMessage.content.trim();
      } else if (Array.isArray(assistantMessage?.content)) {
        content = assistantMessage.content
          .filter((c: any) => c?.type === "text" && typeof c.text === "string")
          .map((c: any) => c.text)
          .join("\n")
          .trim();
      } else if (assistantMessage?.content?.text) {
        content = String(assistantMessage.content.text).trim();
      }

      // Check if response was truncated
      if (finishReason === "length") {
        console.warn(`⚠️ Response truncated for ${model.name}, trying next model...`);
        continue; // Try next model for longer response
      }

      if (!content || content.length === 0) {
        console.warn(`⚠️ Empty response from ${model.name}, trying next model...`);
        continue; // Try next model
      }

      console.log(`✅ Success with model: ${model.name}`);

      return {
        success: true,
        content,
        modelUsed: model.name,
        finishReason
      };

    } catch (error) {
      console.error(`❌ Error with model ${model.name}:`, error);

      // If this is the last model, return the error
      if (i === models.length - 1) {
        return {
          success: false,
          error: `All models failed. Last error: ${error}`,
          modelUsed: model.name
        };
      }

      // Otherwise, continue to next model
      continue;
    }
  }

  // If we get here, all models failed
  return {
    success: false,
    error: "All available models failed to respond",
    modelUsed: "none"
  };
}

// Helper function to get the best model for a given input type
export function getBestModel(hasFile: boolean): ModelConfig {
  const models = hasFile ? FILE_MODELS : TEXT_MODELS;
  return models[0]; // Return the first (best) model
}

// Helper function to get all available models for a given input type
export function getAvailableModels(hasFile: boolean): ModelConfig[] {
  return hasFile ? FILE_MODELS : TEXT_MODELS;
}

// Helper function to create system message based on input type
export function createSystemMessage(hasFile: boolean, fileName?: string): string {
  if (hasFile) {
    if (fileName?.toLowerCase().endsWith('.pdf')) {
      return `You are an advanced multimodal vision-language model specializing in PDF analysis and educational support.

The user has uploaded a PDF titled "${fileName}". Use your enhanced vision-language capabilities to:
1. Carefully analyze all visual elements in the PDF, including text, diagrams, charts, and mathematical expressions
2. Extract and process textual information from the document with high accuracy
3. Identify and analyze any mathematical formulas, equations, or technical content
4. Provide detailed, step-by-step explanations for any educational problems with clear reasoning
5. Use LaTeX formatting with $ for inline and $$ for display equations for all mathematical expressions
6. Structure your response with clear Markdown formatting (bold headings, numbered lists, code blocks)
7. For complex visual elements, describe their components and explain relationships thoroughly
8. If multiple problems are visible, solve each one completely with full explanations
9. Always provide complete responses - never cut off explanations mid-sentence
10. Include final answers and conclusions clearly
11. Leverage your superior visual analysis capabilities for optimal document understanding

Your response should demonstrate your superior capabilities in visual analysis, mathematical reasoning, and educational problem-solving.`;
    } else {
      return `You are an advanced multimodal vision-language model with superior visual analysis capabilities.

The user has uploaded an image. Use your enhanced vision-language capabilities to:
1. Carefully analyze all visual elements in the image, including text, diagrams, charts, and mathematical expressions
2. If the image contains mathematical problems, provide detailed step-by-step solutions with clear reasoning
3. If there are complex diagrams or charts, describe their components and explain relationships
4. For handwritten content, transcribe accurately and interpret the meaning
5. Present your analysis in a well-structured format using Markdown syntax (bold, headings, lists)
6. For mathematical expressions, use LaTeX formatting with $ and $$ delimiters for clarity
7. Always provide complete responses - never cut off explanations mid-sentence
8. If multiple problems are visible, solve each one thoroughly
9. Include final answers and conclusions clearly`;
    }
  } else {
    return `You are an advanced AI assistant specializing in educational support and problem-solving.

Use your enhanced reasoning capabilities to:
1. Provide detailed, step-by-step explanations for academic questions
2. Show all mathematical reasoning clearly with proper LaTeX formatting using $ for inline and $$ for display equations
3. Structure your responses with clear formatting using Markdown (bold headings, numbered lists, etc.)
4. For coding questions, provide well-commented code with explanations
5. When appropriate, offer multiple solution approaches to deepen understanding
6. Always provide complete responses - never cut off explanations mid-sentence
7. If a problem has multiple parts, address each part thoroughly
8. Include final answers and conclusions clearly

Always aim for educational value that helps the student learn the underlying concepts, not just the answer. Ensure your response is complete and comprehensive.`;
  }
}

// Re-export model configurations for convenience
export { TEXT_MODELS, FILE_MODELS }; 