'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { Plus, Brain, Download, Share2, Settings, Search, Menu, List } from 'lucide-react';
import MindMapCreator from '@/components/mindmap/MindMapCreator';
import MindMapVisualization from '@/components/mindmap/MindMapVisualization';
import MindMapList from '@/components/mindmap/MindMapList';

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
  nodes?: any[];
  connections?: any[];
}

export default function MindMapsPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [selectedMindMap, setSelectedMindMap] = useState<MindMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLayout, setFilterLayout] = useState('all');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchMindMaps();
    }
  }, [isLoaded, isSignedIn]);

  const fetchMindMaps = async () => {
    try {
      const response = await fetch('/api/mindmaps');
      const data = await response.json();

      if (data.success) {
        setMindMaps(data.mindMaps);
      } else {
        toast.error('Failed to fetch mind maps');
      }
    } catch (error) {
      console.error('Error fetching mind maps:', error);
      toast.error('Failed to fetch mind maps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMindMap = async (mindMapData: any) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/mindmaps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mindMapData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mind map created successfully!');
        setSelectedMindMap(data.mindMap);
        setShowCreator(false);
        await fetchMindMaps();
      } else {
        // Show detailed error message from API
        if (data.details) {
          toast.error(data.error, {
            description: data.details,
            duration: 8000,
          });
        } else {
          toast.error(data.error || 'Failed to create mind map');
        }
      }
    } catch (error) {
      console.error('Error creating mind map:', error);
      toast.error('Network error: Failed to create mind map. Please check your connection and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectMindMap = async (mindMap: MindMap) => {
    try {
      const response = await fetch(`/api/mindmaps/${mindMap.mindmapId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedMindMap(data.mindMap);
        setShowSidebar(false); // Close sidebar after selecting
      } else {
        toast.error('Failed to load mind map');
      }
    } catch (error) {
      console.error('Error loading mind map:', error);
      toast.error('Failed to load mind map');
    }
  };

  const handleUpdateMindMap = async (updatedMindMap: any) => {
    try {
      const response = await fetch('/api/mindmaps', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMindMap),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mind map updated successfully!');
        setSelectedMindMap(data.mindMap);
        await fetchMindMaps();
      } else {
        toast.error(data.error || 'Failed to update mind map');
      }
    } catch (error) {
      console.error('Error updating mind map:', error);
      toast.error('Failed to update mind map');
    }
  };

  const handleDeleteMindMap = async (mindmapId: string) => {
    try {
      const response = await fetch(`/api/mindmaps?id=${mindmapId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mind map deleted successfully!');
        if (selectedMindMap?.mindmapId === mindmapId) {
          setSelectedMindMap(null);
        }
        await fetchMindMaps();
      } else {
        toast.error(data.error || 'Failed to delete mind map');
      }
    } catch (error) {
      console.error('Error deleting mind map:', error);
      toast.error('Failed to delete mind map');
    }
  };

  const handleExportMindMap = async (format: 'pdf' | 'png' | 'svg' | 'json') => {
    if (!selectedMindMap) return;

    try {
      // This would be implemented with a proper export library
      toast.info(`Exporting mind map as ${format.toUpperCase()}...`);

      if (format === 'json') {
        // Export as JSON
        const dataStr = JSON.stringify(selectedMindMap, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${selectedMindMap.title}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success('Mind map exported successfully!');
      } else {
        // For PDF, PNG, SVG exports, we'd need to implement canvas/SVG conversion
        toast.info('Advanced export formats coming soon!');
      }
    } catch (error) {
      console.error('Error exporting mind map:', error);
      toast.error('Failed to export mind map');
    }
  };

  const filteredMindMaps = mindMaps.filter(mindMap => {
    const matchesSearch = mindMap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mindMap.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLayout === 'all' || mindMap.layout === filterLayout;
    return matchesSearch && matchesFilter;
  });

  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  if (!isSignedIn) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in required</h1>
        <p className="text-gray-600">Please sign in to access mind maps.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      {/* Header */}
      <div className="border-b border-gray-200/30 dark:border-gray-700/30">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowSidebar(true)}
                variant="ghost"
                size="sm"
                className="mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mind Maps</h1>
              {selectedMindMap && (
                <div className="hidden md:flex items-center space-x-2 ml-4">
                  <span className="text-gray-400">•</span>
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {selectedMindMap.title}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {selectedMindMap && (
                <Button
                  onClick={() => setShowSidebar(true)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 dark:border-gray-600/20 hover:bg-white/10 dark:hover:bg-gray-800/10 text-gray-700 dark:text-gray-300"
                >
                  <List className="h-4 w-4 mr-1" />
                  Switch Mind Map
                </Button>
              )}
              <Button
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Mind Map
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 py-8">
        <div className="relative">
          {/* Collapsible Sidebar */}
          <div className={`fixed top-0 left-0 h-full w-80 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border-r border-white/20 dark:border-gray-600/20 transform transition-transform duration-300 ease-in-out z-40 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Mind Maps</h2>
                <Button
                  onClick={() => setShowSidebar(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search mind maps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterLayout}
                  onChange={(e) => setFilterLayout(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Layouts</option>
                  <option value="tree">Tree</option>
                  <option value="radial">Radial</option>
                  <option value="org">Organizational</option>
                  <option value="fishbone">Fishbone</option>
                  <option value="flowchart">Flowchart</option>
                </select>
              </div>

              <MindMapList
                mindMaps={filteredMindMaps}
                selectedMindMap={selectedMindMap}
                onSelectMindMap={handleSelectMindMap}
                onDeleteMindMap={handleDeleteMindMap}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Overlay */}
          {showSidebar && (
            <div
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Main Content Area - Full Width */}
          <div className="w-full">
            {showCreator ? (
              <MindMapCreator
                onCreateMindMap={handleCreateMindMap}
                onCancel={() => setShowCreator(false)}
                isLoading={isCreating}
              />
            ) : selectedMindMap ? (
              <div className="space-y-6">
                {/* Mind Map Header */}
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMindMap.title}</h1>
                      {selectedMindMap.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{selectedMindMap.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleExportMindMap('json')}
                        variant="outline"
                        size="sm"
                        className="border-white/20 dark:border-gray-600/20 hover:bg-white/10 dark:hover:bg-gray-800/10 text-gray-900 dark:text-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        onClick={() => toast.info('Sharing feature coming soon!')}
                        variant="outline"
                        size="sm"
                        className="border-white/20 dark:border-gray-600/20 hover:bg-white/10 dark:hover:bg-gray-800/10 text-gray-900 dark:text-white"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Brain className="h-4 w-4 mr-1" />
                      {selectedMindMap.nodeCount} nodes
                    </span>
                    <span>{selectedMindMap.connectionCount} connections</span>
                    <span>Layout: {selectedMindMap.layout}</span>
                    <span>
                      {selectedMindMap.contentSource === 'ai_generated' ? 'AI Generated' : 'User Created'}
                    </span>
                  </div>
                </div>

                {/* Mind Map Visualization - Full Width */}
                <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-2">
                  <MindMapVisualization
                    mindMap={selectedMindMap}
                    onUpdateMindMap={handleUpdateMindMap}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                  <Brain className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create Your First Mind Map
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Transform your ideas into visual mind maps with AI assistance.
                  Start by creating a new mind map or selecting an existing one.
                </p>
                <Button
                  onClick={() => setShowCreator(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Mind Map
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 