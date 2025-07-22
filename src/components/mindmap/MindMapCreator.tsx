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
  const [selectedLayout, setSelectedLayout] = useState('tree');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [maxNodes, setMaxNodes] = useState(15);
  const [language, setLanguage] = useState('en');

  const exampleTopics = [
    "Daily routine planning",
    "Healthy eating habits",
    "Study techniques",
    "Project management",
    "Personal finance basics",
    "Exercise motivation",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onCreateMindMap({
      topic: topic.trim(),
      layout: selectedLayout,
      theme: selectedTheme,
      maxNodes,
      language,
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

          {/* Example topics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Example Topics
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {exampleTopics.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTopic(example)}
                  className="text-left p-2 text-sm bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-md hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Layout
            </label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="tree">Tree Layout</option>
              <option value="radial">Radial Layout</option>
              <option value="org">Organizational Layout</option>
              <option value="fishbone">Fishbone Layout</option>
              <option value="flowchart">Flowchart Layout</option>
            </select>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="default">Default Theme</option>
              <option value="nature">Nature Theme</option>
              <option value="ocean">Ocean Theme</option>
              <option value="sunset">Sunset Theme</option>
              <option value="purple">Purple Theme</option>
            </select>
          </div>

          {/* Advanced Options */}
          <details className="border border-gray-200 dark:border-gray-600 rounded-md bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
            <summary className="px-4 py-3 cursor-pointer font-medium text-gray-900 dark:text-white">
              Advanced Options
            </summary>
            <div className="px-4 pb-3 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Nodes
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={maxNodes}
                  onChange={(e) => setMaxNodes(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {maxNodes} nodes
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                  <option value="ru">Russian</option>
                </select>
              </div>
            </div>
          </details>
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