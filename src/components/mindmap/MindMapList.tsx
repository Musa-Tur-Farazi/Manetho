'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Brain, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface MindMap {
  mindmapId: string;
  title: string;
  description: string;
  layout: string;
  theme: string;
  contentSource: string;
  nodeCount: number;
  connectionCount: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface MindMapListProps {
  mindMaps: MindMap[];
  selectedMindMap: MindMap | null;
  onSelectMindMap: (mindMap: MindMap) => void;
  onDeleteMindMap: (mindmapId: string) => void;
  isLoading: boolean;
}

export default function MindMapList({
  mindMaps,
  selectedMindMap,
  onSelectMindMap,
  onDeleteMindMap,
  isLoading
}: MindMapListProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (mindmapId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(mindmapId);
  };

  const handleConfirmDelete = (mindmapId: string) => {
    onDeleteMindMap(mindmapId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : mindMaps.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No mind maps yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Create your first mind map to get started
          </p>
        </div>
      ) : (
        mindMaps.map((mindMap) => (
          <div
            key={mindMap.mindmapId}
            onClick={() => onSelectMindMap(mindMap)}
            className={`relative cursor-pointer transition-all duration-200 rounded-lg border p-4 ${selectedMindMap?.mindmapId === mindMap.mindmapId
              ? 'bg-purple-50/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 backdrop-blur-sm'
              : 'bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-600 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm'
              } hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {mindMap.title}
                  </h3>
                </div>
                {mindMap.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {mindMap.description}
                  </p>
                )}
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>{mindMap.nodeCount} nodes</span>
                  <span>{mindMap.connectionCount} connections</span>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteClick(mindMap.mindmapId, e)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(mindMap.lastEditedAt), 'MMM d')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${mindMap.contentSource === 'ai_generated'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  {mindMap.contentSource === 'ai_generated' ? '🤖 AI Generated' : '✏️ User Created'}
                </span>

                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {mindMap.layout}
                </span>
              </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm === mindMap.mindmapId && (
              <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-red-200 dark:border-red-700 rounded-lg p-4 shadow-lg z-10">
                <div className="text-center">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Delete Mind Map?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This action cannot be undone. The mind map "{mindMap.title}" will be permanently deleted.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setShowDeleteConfirm(null)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleConfirmDelete(mindMap.mindmapId)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
} 