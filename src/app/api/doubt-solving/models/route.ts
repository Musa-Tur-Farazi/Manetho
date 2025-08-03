import { NextResponse } from 'next/server';
import { getModelStats, TEXT_MODELS, FILE_MODELS } from '@/lib/model-config';

export async function GET() {
  try {
    const stats = getModelStats();

    return NextResponse.json({
      success: true,
      models: {
        text: TEXT_MODELS.map(model => ({
          name: model.name,
          provider: model.provider,
          description: model.description,
          maxTokens: model.maxTokens,
          temperature: model.temperature,
          topP: model.topP
        })),
        file: FILE_MODELS.map(model => ({
          name: model.name,
          provider: model.provider,
          description: model.description,
          maxTokens: model.maxTokens,
          temperature: model.temperature,
          topP: model.topP
        }))
      },
      stats,
      configuration: {
        textModelsCount: stats.textModels,
        fileModelsCount: stats.fileModels,
        totalModels: stats.totalModels,
        providers: stats.providers,
        fallbackEnabled: true,
        automaticSwitching: true
      }
    });

  } catch (error) {
    console.error('Error fetching model configuration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model configuration' },
      { status: 500 }
    );
  }
} 