'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Brain } from 'lucide-react';

interface MindMapCreatorProps {
  onCreateMindMap: (mindMapData: any) => void;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function MindMapCreator({ onCreateMindMap, onCancel, isLoading }: MindMapCreatorProps) {
  const [topic, setTopic] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [maxNodes, setMaxNodes] = useState(3); // default within 2-5 range

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onCreateMindMap({
      topic: topic.trim(),
      layout: 'sequential_flow',
      theme: selectedTheme,
      maxNodes,
    });
  };

  return (
    <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Mind Map
          </h2>
        </div>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="border-white/20 dark:border-gray-600/20 hover:bg-white/10 dark:hover:bg-gray-800/10 text-gray-900 dark:text-white"
          >
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic or Description
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic or describe what you want to create a mind map about..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Be specific but concise. Avoid overly broad topics to ensure proper AI generation.
            </p>
          </div>

          {/* Maximum Nodes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Nodes (2 - 5)
            </label>
            <input
              type="range"
              min="2"
              max="5"
              value={maxNodes}
              onChange={(e) => setMaxNodes(Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {maxNodes} nodes
            </span>
          </div>

          {/* Theme selection removed - using default theme */}

          {/* Advanced Options removed */}
        </div>

        {/* Create Button */}
        <Button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating Mind Map...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Create Mind Map</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
} 