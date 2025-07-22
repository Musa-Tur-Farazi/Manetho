'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { ZoomIn, ZoomOut, RotateCcw, Edit, Plus, Trash2 } from 'lucide-react';

interface Node {
  nodeId: string;
  text: string;
  level: number;
  parentNodeId?: string;
  positionX: number;
  positionY: number;
  color: string;
  backgroundColor: string;
  icon?: string;
  notes?: string;
  isRoot: boolean;
  isCollapsed: boolean;
}

interface Connection {
  connectionId: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  color: string;
}

interface MindMap {
  mindmapId: string;
  title: string;
  description: string;
  layout: string;
  theme: string;
  nodes: Node[];
  connections: Connection[];
}

interface MindMapVisualizationProps {
  mindMap: MindMap;
  onUpdateMindMap: (updatedMindMap: any) => void;
}

export default function MindMapVisualization({ mindMap, onUpdateMindMap }: MindMapVisualizationProps) {
  const [zoom, setZoom] = useState(2.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Calculate positions for nodes if they don't have them
    const calculatedNodes = calculateNodePositions(mindMap.nodes, mindMap.layout);
    setNodes(calculatedNodes);
    setConnections(mindMap.connections || []);
  }, [mindMap]);

  const calculateNodePositions = (inputNodes: any[], layout: string): Node[] => {
    const nodeMap = new Map<string, Node>();

    // Convert nodes to Node type and create map
    inputNodes.forEach(node => {
      nodeMap.set(node.nodeId, {
        nodeId: node.nodeId,
        text: node.text,
        level: node.level,
        parentNodeId: node.parentNodeId,
        positionX: parseFloat(node.positionX?.toString() || '0'),
        positionY: parseFloat(node.positionY?.toString() || '0'),
        color: node.color || '#3b82f6',
        backgroundColor: node.backgroundColor || '#ffffff',
        icon: node.icon,
        notes: node.notes,
        isRoot: node.isRoot,
        isCollapsed: node.isCollapsed || false,
      });
    });

    // Find root node
    const rootNode = Array.from(nodeMap.values()).find(n => n.isRoot);
    if (!rootNode) return Array.from(nodeMap.values());

    // Calculate positions based on layout
    const positioned = new Map<string, Node>();

    if (layout === 'tree') {
      calculateTreeLayout(rootNode, nodeMap, positioned);
    } else if (layout === 'radial') {
      calculateRadialLayout(rootNode, nodeMap, positioned);
    } else {
      // Default: simple tree layout
      calculateTreeLayout(rootNode, nodeMap, positioned);
    }

    return Array.from(positioned.values());
  };

  const calculateTreeLayout = (
    root: Node,
    nodeMap: Map<string, Node>,
    positioned: Map<string, Node>
  ) => {
    const LEVEL_HEIGHT = 300; // Increased from 250
    const NODE_WIDTH = 550;   // Increased from 450

    // Position root at center-top
    const rootPositioned = { ...root, positionX: 1600, positionY: 150 }; // Adjusted for bigger canvas
    positioned.set(root.nodeId, rootPositioned);

    // Get children of root
    const children = Array.from(nodeMap.values()).filter(n => n.parentNodeId === root.nodeId);

    // Position children horizontally with better spacing
    children.forEach((child, index) => {
      const totalWidth = children.length * NODE_WIDTH;
      const startX = 1600 - totalWidth / 2; // Adjusted for bigger canvas
      const x = startX + index * NODE_WIDTH;
      const y = root.positionY + LEVEL_HEIGHT;

      positioned.set(child.nodeId, { ...child, positionX: x, positionY: y });

      // Recursively position grandchildren
      positionChildrenRecursive(child, nodeMap, positioned, LEVEL_HEIGHT, NODE_WIDTH);
    });
  };

  const positionChildrenRecursive = (
    parent: Node,
    nodeMap: Map<string, Node>,
    positioned: Map<string, Node>,
    levelHeight: number,
    nodeWidth: number
  ) => {
    const children = Array.from(nodeMap.values()).filter(n => n.parentNodeId === parent.nodeId);

    children.forEach((child, index) => {
      const totalWidth = children.length * nodeWidth * 0.8; // Slightly reduce spacing for deeper levels
      const startX = parent.positionX - totalWidth / 2;
      const x = startX + index * nodeWidth * 0.8;
      const y = parent.positionY + levelHeight;

      positioned.set(child.nodeId, { ...child, positionX: x, positionY: y });

      // Recursively position grandchildren
      positionChildrenRecursive(child, nodeMap, positioned, levelHeight, nodeWidth);
    });
  };

  const calculateRadialLayout = (
    root: Node,
    nodeMap: Map<string, Node>,
    positioned: Map<string, Node>
  ) => {
    const CENTER_X = 1600; // Adjusted for bigger canvas
    const CENTER_Y = 800;  // Adjusted for bigger canvas
    const RADIUS = 300;    // Increased from 250

    // Position root at center
    positioned.set(root.nodeId, { ...root, positionX: CENTER_X, positionY: CENTER_Y });

    // Get children and position them in a circle
    const children = Array.from(nodeMap.values()).filter(n => n.parentNodeId === root.nodeId);

    children.forEach((child, index) => {
      const angle = (index * 2 * Math.PI) / children.length;
      const x = CENTER_X + RADIUS * Math.cos(angle);
      const y = CENTER_Y + RADIUS * Math.sin(angle);

      positioned.set(child.nodeId, { ...child, positionX: x, positionY: y });
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(2.0);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes.find(n => n.nodeId === nodeId);
    if (node) {
      setEditingNode(nodeId);
      setEditText(node.text);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleNodeMouseMove = (e: React.MouseEvent) => {
    if (draggedNode) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      const updatedNodes = nodes.map(node =>
        node.nodeId === draggedNode
          ? { ...node, positionX: node.positionX + deltaX, positionY: node.positionY + deltaY }
          : node
      );

      setNodes(updatedNodes);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNodeMouseUp = () => {
    setDraggedNode(null);
  };

  const handleEditSubmit = () => {
    if (editingNode && editText.trim()) {
      const updatedNodes = nodes.map(node =>
        node.nodeId === editingNode
          ? { ...node, text: editText.trim() }
          : node
      );

      setNodes(updatedNodes);
      setEditingNode(null);
      setEditText('');

      // Update the mind map
      onUpdateMindMap({
        mindmapId: mindMap.mindmapId,
        title: mindMap.title,
        description: mindMap.description,
        layout: mindMap.layout,
        theme: mindMap.theme,
        nodes: updatedNodes,
        connections: connections,
      });
    }
  };

  const handleEditCancel = () => {
    setEditingNode(null);
    setEditText('');
  };

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !draggedNode) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (draggedNode) {
      handleNodeMouseMove(e);
    }
  };

  const handleSvgMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const renderConnection = (connection: Connection) => {
    const fromNode = nodes.find(n => n.nodeId === connection.fromNodeId);
    const toNode = nodes.find(n => n.nodeId === connection.toNodeId);

    if (!fromNode || !toNode) return null;

    const x1 = fromNode.positionX;
    const y1 = fromNode.positionY;
    const x2 = toNode.positionX;
    const y2 = toNode.positionY;

    return (
      <line
        key={connection.connectionId}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(99, 102, 241, 0.7)"
        strokeWidth="4"
        strokeLinecap="round"
        className="dark:stroke-purple-400"
      />
    );
  };

  const renderNode = (node: Node) => {
    const isSelected = selectedNode === node.nodeId;
    const isEditing = editingNode === node.nodeId;
    const isDraggedNode = draggedNode === node.nodeId;

    return (
      <g key={node.nodeId}>
        {/* Node background */}
        <rect
          x={node.positionX - 200} // Increased from 160
          y={node.positionY - 60}   // Increased from 50
          width="400"               // Increased from 320
          height="120"              // Increased from 100
          fill="rgba(255, 255, 255, 0.95)"
          stroke={isSelected ? '#8b5cf6' : 'rgba(99, 102, 241, 0.5)'}
          strokeWidth={isSelected ? '4' : '3'}
          rx="16"
          className={`cursor-${isDraggedNode ? 'grabbing' : 'grab'} hover:opacity-90 transition-all duration-200 dark:fill-gray-800/95 dark:stroke-gray-500`}
          style={{
            filter: isSelected ? 'drop-shadow(0 6px 20px rgba(139, 92, 246, 0.4))' : 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
          }}
          onClick={() => handleNodeClick(node.nodeId)}
          onDoubleClick={() => handleNodeDoubleClick(node.nodeId)}
          onMouseDown={(e) => handleNodeMouseDown(e, node.nodeId)}
          onMouseMove={handleNodeMouseMove}
          onMouseUp={handleNodeMouseUp}
        />

        {/* Node icon */}
        {node.icon && (
          <text
            x={node.positionX - 140} // Adjusted for bigger node
            y={node.positionY + 10}
            fontSize="32"            // Increased from 28
            textAnchor="middle"
            className="pointer-events-none select-none"
          >
            {node.icon}
          </text>
        )}

        {/* Node text */}
        {isEditing ? (
          <foreignObject
            x={node.positionX - 180} // Adjusted for bigger node
            y={node.positionY - 25}  // Adjusted for bigger node
            width="360"              // Increased from 280
            height="50"              // Increased from 40
          >
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') handleEditCancel();
              }}
              className="w-full px-6 py-4 text-lg font-medium border-2 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              autoFocus
            />
          </foreignObject>
        ) : (
          <foreignObject
            x={node.positionX - (node.icon ? 180 : 190)} // Adjusted for bigger node
            y={node.positionY - 15}
            width={node.icon ? 360 : 380}
            height="30"
          >
            <div
              className="text-center text-xl font-bold text-gray-900 dark:text-white overflow-hidden"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '30px',
                lineHeight: '1.2',
              }}
            >
              {node.text.length > 45 ? node.text.substring(0, 45) + '...' : node.text}
            </div>
          </foreignObject>
        )}

        {/* Level indicator */}
        <circle
          cx={node.positionX + 170} // Adjusted for bigger node
          cy={node.positionY - 40}  // Adjusted for bigger node
          r="16"                    // Increased from 14
          fill={node.color}
          opacity="0.8"
        />
        <text
          x={node.positionX + 170} // Adjusted for bigger node
          y={node.positionY - 30}  // Adjusted for bigger node
          fontSize="14"            // Increased from 13
          textAnchor="middle"
          fill="white"
          className="pointer-events-none select-none font-bold"
        >
          {node.level}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50/90 to-indigo-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-600/20 relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <Button
          onClick={handleZoomIn}
          size="sm"
          variant="outline"
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-800/30 text-gray-900 dark:text-white shadow-lg"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          size="sm"
          variant="outline"
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-800/30 text-gray-900 dark:text-white shadow-lg"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleResetView}
          size="sm"
          variant="outline"
          className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border-white/30 dark:border-gray-600/30 hover:bg-white/30 dark:hover:bg-gray-800/30 text-gray-900 dark:text-white shadow-lg"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-600/30 p-3 z-10 shadow-lg">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
          <div>Nodes: {nodes.length}</div>
          <div>Connections: {connections.length}</div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 3200 2000"
        className="cursor-grab"
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid pattern */}
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(156, 163, 175, 0.3)"
                strokeWidth="1"
              />
            </pattern>
            <pattern
              id="grid-dark"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(75, 85, 99, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="dark:fill-[url(#grid-dark)]" />

          {/* Connections */}
          {connections.map(renderConnection)}

          {/* Nodes */}
          {nodes.map(renderNode)}
        </g>
      </svg>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-600 dark:text-gray-400 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-600/30 p-3 shadow-lg">
        <div>• Double-click node to edit text</div>
        <div>• Click node to select</div>
        <div>• Drag nodes to move them</div>
        <div>• Drag canvas to pan</div>
        <div>• Use zoom controls to scale</div>
      </div>
    </div>
  );
} 