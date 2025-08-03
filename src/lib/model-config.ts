// Model configuration for doubt-solving feature
// Easy to update and manage model settings

export interface ModelConfig {
  name: string;
  provider: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  description?: string;
}

// Text models for normal message text (in order of preference)
export const TEXT_MODELS: ModelConfig[] = [
  {
    name: "deepseek/deepseek-r1-0528:free",
    provider: "deepseek",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "DeepSeek R1 - High performance reasoning model"
  },
  {
    name: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    provider: "deepseek",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "DeepSeek R1 with Qwen3 - Enhanced reasoning capabilities"
  },
  {
    name: "moonshotai/kimi-k2:free",
    provider: "moonshotai",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "Kimi K2 - Advanced reasoning and problem-solving"
  },
  {
    name: "z-ai/glm-4.5-air:free",
    provider: "z-ai",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "GLM-4.5 Air - Fast and efficient reasoning model"
  }
];

// File models for file inputs (in order of preference)
export const FILE_MODELS: ModelConfig[] = [
  {
    name: "qwen/qwen2.5-vl-32b-instruct:free",
    provider: "qwen",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "Qwen2.5 VL 32B - Specialized vision-language model for PDF and image analysis"
  },
  {
    name: "qwen/qwen3-235b-a22b:free",
    provider: "qwen",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "Qwen3 235B - Advanced vision-language model for file analysis"
  },
  {
    name: "deepseek/deepseek-vl-1.5:free",
    provider: "deepseek",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "DeepSeek VL 1.5 - Vision-language model for file analysis"
  },
  {
    name: "openai/gpt-4o-mini",
    provider: "openai",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "GPT-4o Mini - Fast and efficient vision model"
  },
  {
    name: "anthropic/claude-3-haiku-20240307",
    provider: "anthropic",
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.9,
    description: "Claude 3 Haiku - Fast vision-language model"
  }
];

// Model categories for easy management
export const MODEL_CATEGORIES = {
  TEXT: "text",
  FILE: "file"
} as const;

// Helper function to get models by category
export function getModelsByCategory(category: keyof typeof MODEL_CATEGORIES): ModelConfig[] {
  switch (category) {
    case 'TEXT':
      return TEXT_MODELS;
    case 'FILE':
      return FILE_MODELS;
    default:
      return [];
  }
}

// Helper function to get model by name
export function getModelByName(name: string): ModelConfig | undefined {
  const allModels = [...TEXT_MODELS, ...FILE_MODELS];
  return allModels.find(model => model.name === name);
}

// Helper function to validate model configuration
export function validateModelConfig(config: ModelConfig): boolean {
  return !!(
    config.name &&
    config.provider &&
    config.maxTokens &&
    config.temperature !== undefined &&
    config.topP !== undefined
  );
}

// Helper function to get model statistics
export function getModelStats() {
  return {
    textModels: TEXT_MODELS.length,
    fileModels: FILE_MODELS.length,
    totalModels: TEXT_MODELS.length + FILE_MODELS.length,
    providers: [...new Set([...TEXT_MODELS, ...FILE_MODELS].map(m => m.provider))]
  };
}

// Configuration for different use cases
export const MODEL_USE_CASES = {
  EDUCATIONAL: {
    description: "Educational problem-solving and explanations",
    preferredTextModels: ["deepseek/deepseek-r1-0528:free", "moonshotai/kimi-k2:free"],
    preferredFileModels: ["qwen/qwen2.5-vl-32b-instruct:free", "qwen/qwen3-235b-a22b:free"]
  },
  CODING: {
    description: "Programming and code-related questions",
    preferredTextModels: ["deepseek/deepseek-r1-0528:free", "z-ai/glm-4.5-air:free"],
    preferredFileModels: ["qwen/qwen2.5-vl-32b-instruct:free", "qwen/qwen3-235b-a22b:free"]
  },
  MATHEMATICS: {
    description: "Mathematical problem-solving",
    preferredTextModels: ["deepseek/deepseek-r1-0528:free", "moonshotai/kimi-k2:free"],
    preferredFileModels: ["qwen/qwen2.5-vl-32b-instruct:free", "qwen/qwen3-235b-a22b:free"]
  }
};

// Helper function to get models for specific use case
export function getModelsForUseCase(useCase: keyof typeof MODEL_USE_CASES) {
  const config = MODEL_USE_CASES[useCase];
  return {
    textModels: TEXT_MODELS.filter(model =>
      config.preferredTextModels.includes(model.name)
    ),
    fileModels: FILE_MODELS.filter(model =>
      config.preferredFileModels.includes(model.name)
    )
  };
}

// Export default configurations
export default {
  TEXT_MODELS,
  FILE_MODELS,
  MODEL_CATEGORIES,
  MODEL_USE_CASES,
  getModelsByCategory,
  getModelByName,
  validateModelConfig,
  getModelStats,
  getModelsForUseCase
}; 