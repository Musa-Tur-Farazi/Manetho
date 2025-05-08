"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Network,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Link2,
  FileText,
  BookOpen,
  Brain,
  Target,
  Zap,
  Lightbulb,
  ArrowRight,
  Search,
  Layout,
  Code,
  Maximize2,
  Minimize2,
  Share2
} from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import ReactFlow with no SSR to avoid hydration issues
const ReactFlow = dynamic(
  () => import('reactflow').then((mod) => {
    // Import necessary components and hooks from ReactFlow
    const { ReactFlow, Background, Controls, Panel } = mod;
    return ReactFlow;
  }),
  { ssr: false }
);

const Background = dynamic(
  () => import('reactflow').then((mod) => mod.Background),
  { ssr: false }
);

const Controls = dynamic(
  () => import('reactflow').then((mod) => mod.Controls),
  { ssr: false }
);

const Panel = dynamic(
  () => import('reactflow').then((mod) => mod.Panel),
  { ssr: false }
);

const MiniMap = dynamic(
  () => import('reactflow').then((mod) => mod.MiniMap),
  { ssr: false }
);

// Import ReactFlow styles
import "reactflow/dist/style.css";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const tooltipVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2 } 
  }
};

interface MindMapNode {
  id: string;
  title: string;
  description: string;
  children: MindMapNode[];
  color: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
  position?: { x: number; y: number };
}

interface MindMap {
  id: string;
  title: string;
  description: string;
  subject: string;
  nodes: MindMapNode[];
  createdAt: string;
  updatedAt: string;
}

// Custom node component for mind map nodes
const MindMapNode = ({ data }: { data: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isHovered) {
      timeout = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    } else {
      setShowTooltip(false);
    }
    return () => clearTimeout(timeout);
  }, [isHovered]);
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg shadow-md cursor-pointer transform transition-all duration-300 ${
        isHovered ? 'scale-105 shadow-lg' : ''
      } ${
        data.color === "blue"
          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30"
          : data.color === "green"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30"
          : data.color === "purple"
          ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30"
          : data.color === "red"
          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
          : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-2">
        <div
          className={`p-2 rounded-full transition-colors ${
            data.color === "blue"
              ? "bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400"
              : data.color === "green"
              ? "bg-green-100 dark:bg-green-800/30 text-green-600 dark:text-green-400"
              : data.color === "purple"
              ? "bg-purple-100 dark:bg-purple-800/30 text-purple-600 dark:text-purple-400"
              : data.color === "red"
              ? "bg-red-100 dark:bg-red-800/30 text-red-600 dark:text-red-400"
              : "bg-yellow-100 dark:bg-yellow-800/30 text-yellow-600 dark:text-yellow-400"
          } mr-3`}
        >
          {data.icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {data.title}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {data.description.length > 60 
          ? `${data.description.substring(0, 60)}...` 
          : data.description}
      </p>
      
      {isHovered && (
        <div className="flex mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 justify-between">
          <button className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
            <Link2 className="h-4 w-4" />
          </button>
          <button className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <AnimatePresence>
        {showTooltip && data.description.length > 60 && (
          <motion.div 
            className="absolute -top-24 left-0 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-10 max-w-xs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tooltipVariants}
          >
            <p className="text-sm text-gray-900 dark:text-white">
              {data.description}
            </p>
            <div className="absolute -bottom-2 left-5 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const nodeTypes = {
  mindMapNode: MindMapNode,
};

export default function MindMapsPage() {
  const [selectedMap, setSelectedMap] = useState<MindMap | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNode, setEditingNode] = useState<MindMapNode | null>(null);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeDescription, setNewNodeDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");
  const [isClient, setIsClient] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredMap, setHoveredMap] = useState<string | null>(null);
  const [layout, setLayout] = useState("horizontal"); // horizontal, vertical, radial
  const [showTips, setShowTips] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // References
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // React Flow state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Mind map tips
  const mindMapTips = [
    "Start with a central idea and branch out to related concepts",
    "Use colors to categorize different types of information",
    "Keep node text brief and focused on key points",
    "Create visual hierarchies with main branches and sub-branches",
    "Use consistent visual styles for similar types of information"
  ];

  // Mock data for mind maps
  const mindMaps: MindMap[] = [
    {
      id: "1",
      title: "Mathematics Concepts",
      description: "A comprehensive mind map of key mathematical concepts",
      subject: "Mathematics",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15",
      nodes: [
        {
          id: "1-1",
          title: "Algebra",
          description: "Basic algebraic concepts and operations including variables, constants, expressions, equations, and functions",
          color: "blue",
          icon: <Target className="h-5 w-5" />,
          children: [
            {
              id: "1-1-1",
              title: "Linear Equations",
              description: "Solving and graphing linear equations and systems of equations in multiple variables",
              color: "blue",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
            {
              id: "1-1-2",
              title: "Quadratic Equations",
              description: "Solving and graphing quadratic equations using factoring, completing the square, and the quadratic formula",
              color: "blue",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
          ],
        },
        {
          id: "1-2",
          title: "Geometry",
          description: "Geometric shapes, properties, transformations, and proofs in Euclidean and non-Euclidean spaces",
          color: "green",
          icon: <BookOpen className="h-5 w-5" />,
          children: [
            {
              id: "1-2-1",
              title: "Triangles",
              description: "Properties and types of triangles including equilateral, isosceles, scalene, and right triangles",
              color: "green",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
            {
              id: "1-2-2",
              title: "Circles",
              description: "Properties and equations of circles including radius, diameter, circumference, and area",
              color: "green",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
          ],
        },
        {
          id: "1-3",
          title: "Calculus",
          description: "The study of continuous change and motion, including limits, derivatives, and integrals",
          color: "purple",
          icon: <Brain className="h-5 w-5" />,
          children: [
            {
              id: "1-3-1",
              title: "Derivatives",
              description: "Rate of change of a function with respect to a variable, with applications in optimization and physics",
              color: "purple",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
            {
              id: "1-3-2",
              title: "Integrals",
              description: "Finding the accumulation of quantities and the areas under curves using definite and indefinite integrals",
              color: "purple",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "Physics Fundamentals",
      description: "Key concepts in physics",
      subject: "Physics",
      createdAt: "2024-03-10",
      updatedAt: "2024-03-10",
      nodes: [
        {
          id: "2-1",
          title: "Mechanics",
          description: "Study of motion and forces",
          color: "purple",
          icon: <Brain className="h-5 w-5" />,
          children: [
            {
              id: "2-1-1",
              title: "Newton's Laws",
              description: "Fundamental principles governing the motion of objects",
              color: "purple",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
            {
              id: "2-1-2",
              title: "Kinematics",
              description: "The study of motion without considering its causes",
              color: "purple",
              icon: <FileText className="h-5 w-5" />,
              children: [],
            },
          ],
        },
        {
          id: "2-2",
          title: "Thermodynamics",
          description: "Study of heat, temperature, and energy transfer",
          color: "red",
          icon: <Zap className="h-5 w-5" />,
          children: [],
        },
      ],
    },
    {
      id: "3",
      title: "Computer Science Concepts",
      description: "Fundamental concepts in computer science",
      subject: "Computer Science",
      createdAt: "2024-03-08",
      updatedAt: "2024-03-12",
      nodes: [
        {
          id: "3-1",
          title: "Algorithms",
          description: "Step-by-step procedures for calculations and data processing",
          color: "blue",
          icon: <Code className="h-5 w-5" />,
          children: [],
        },
        {
          id: "3-2",
          title: "Data Structures",
          description: "Ways of organizing and storing data for efficient access and modification",
          color: "green",
          icon: <Layout className="h-5 w-5" />,
          children: [],
        },
      ],
    },
  ];

  const colors = [
    { name: "blue", value: "bg-blue-500" },
    { name: "green", value: "bg-green-500" },
    { name: "purple", value: "bg-purple-500" },
    { name: "red", value: "bg-red-500" },
    { name: "yellow", value: "bg-yellow-500" },
  ];

  // Filter mind maps based on search query
  const filteredMindMaps = mindMaps.filter(map => 
    searchQuery === "" || 
    map.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    map.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    map.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert mind map nodes to React Flow nodes and edges with different layouts
  const convertToFlowElements = useCallback((mindMapNodes: MindMapNode[], parentId?: string, layout = "horizontal") => {
    const flowNodes = [];
    const flowEdges = [];
    
    const calculatePosition = (index: number, level: number, total: number) => {
      if (layout === "horizontal") {
        // Horizontal tree layout
        return {
          x: level * 300,
          y: index * 200 - (total * 100 / 2) + 100
        };
      } else if (layout === "vertical") {
        // Vertical tree layout
        return {
          x: index * 300 - (total * 150 / 2) + 150,
          y: level * 200
        };
      } else {
        // Radial layout (approximation)
        const angle = (index / total) * 2 * Math.PI;
        const radius = level * 300;
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        };
      }
    };

    const processNodes = (nodes: MindMapNode[], level = 0, parentId?: string) => {
      const nodeCount = nodes.length;
      
      nodes.forEach((node, index) => {
        const position = calculatePosition(index, level, nodeCount);
        
        flowNodes.push({
          id: node.id,
          type: 'mindMapNode',
          position,
          data: {
            title: node.title,
            description: node.description,
            color: node.color,
            icon: node.icon,
          },
        });
        
        if (parentId) {
          flowEdges.push({
            id: `e${parentId}-${node.id}`,
            source: parentId,
            target: node.id,
            style: { stroke: '#ccc', strokeWidth: 2 },
            type: 'smoothstep',
            animated: true,
          });
        }
        
        if (node.children?.length > 0) {
          const childElements = processNodes(node.children, level + 1, node.id);
          flowNodes.push(...childElements.nodes);
          flowEdges.push(...childElements.edges);
        }
      });
      
      return { nodes: flowNodes, edges: flowEdges };
    };
    
    const elements = processNodes(mindMapNodes, 0, parentId);
    return { nodes: elements.nodes, edges: elements.edges };
  }, []);

  const handleSelectMap = (map: MindMap) => {
    setSelectedMap(map);
    const elements = convertToFlowElements(map.nodes, undefined, layout);
    setNodes(elements.nodes);
    setEdges(elements.edges);
  };

  const toggleFullscreen = () => {
    if (flowContainerRef.current) {
      if (!isFullscreen) {
        if (flowContainerRef.current.requestFullscreen) {
          flowContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Update flow when layout changes
  useEffect(() => {
    if (selectedMap) {
      const elements = convertToFlowElements(selectedMap.nodes, undefined, layout);
      setNodes(elements.nodes);
      setEdges(elements.edges);
    }
  }, [layout, selectedMap, convertToFlowElements]);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Mind Maps"
        description="Visualize connections between concepts and ideas"
        icon={<Network className="h-8 w-8" />}
      >
        <div className="flex gap-4 mt-8">
          <Button 
            size="lg"
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Mind Map
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowTips(!showTips)}
            className="border-2 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-300"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Mind Map Tips
          </Button>
        </div>
      </PageHeader>

      {/* Mind Map Tips */}
      <AnimatePresence>
        {showTips && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl p-6 border border-cyan-100 dark:border-cyan-900/30">
              <div className="flex items-start mb-4">
                <Lightbulb className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Mind Mapping Best Practices
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Mind maps are powerful visual tools for organizing information and seeing connections between concepts.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {mindMapTips.map((tip, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex items-start"
                  >
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mr-3">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mind Maps Library */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-full border border-gray-100 dark:border-gray-700">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Mind Maps
              </h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search mind maps..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <motion.div 
              className="space-y-3 overflow-y-auto max-h-[500px] pr-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredMindMaps.length > 0 ? (
                filteredMindMaps.map((map) => (
                  <motion.div
                    key={map.id}
                    variants={itemVariants}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                      selectedMap?.id === map.id 
                        ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 dark:border-cyan-400" 
                        : "bg-white dark:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                    onClick={() => handleSelectMap(map)}
                    onMouseEnter={() => setHoveredMap(map.id)}
                    onMouseLeave={() => setHoveredMap(null)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-medium ${
                        selectedMap?.id === map.id 
                          ? "text-cyan-700 dark:text-cyan-400" 
                          : "text-gray-900 dark:text-white"
                      }`}>
                        {map.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {map.subject}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {map.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {map.nodes.length} nodes
                      </span>
                      <span>
                        Updated {map.updatedAt}
                      </span>
                    </div>
                    
                    {hoveredMap === map.id && (
                      <div className="flex mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Network className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No mind maps found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchQuery ? "Try a different search term" : "Create your first mind map to get started"}
                  </p>
                  <Button 
                    onClick={() => setIsCreating(true)}
                    className="mx-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Mind Map
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Mind Map Viewer */}
        <div className="lg:col-span-2">
          <div 
            ref={flowContainerRef}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-[600px] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
          >
            {selectedMap ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedMap.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedMap.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex overflow-hidden">
                      {["horizontal", "vertical", "radial"].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLayout(l)}
                          className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                            layout === l
                              ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleFullscreen}
                      className="ml-2"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  {isClient && (
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      nodeTypes={nodeTypes}
                      fitView
                      minZoom={0.1}
                      maxZoom={1.5}
                      nodesDraggable={true}
                    >
                      <Background color="#aaa" gap={16} />
                      <Controls />
                      <MiniMap
                        nodeStrokeColor={(n) => {
                          if (n.data?.color === 'blue') return '#3b82f6';
                          if (n.data?.color === 'green') return '#22c55e';
                          if (n.data?.color === 'purple') return '#a855f7';
                          if (n.data?.color === 'red') return '#ef4444';
                          return '#eab308';
                        }}
                        nodeColor={(n) => {
                          if (n.data?.color === 'blue') return '#dbeafe';
                          if (n.data?.color === 'green') return '#dcfce7';
                          if (n.data?.color === 'purple') return '#f3e8ff';
                          if (n.data?.color === 'red') return '#fee2e2';
                          return '#fef9c3';
                        }}
                        nodeBorderRadius={3}
                      />
                    </ReactFlow>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Network className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Select a Mind Map
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  Choose a mind map from the library or create a new one to visualize your ideas.
                </p>
                <Button 
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Mind Map
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal (simplified for demo) */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Mind Map
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    placeholder="Enter mind map title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-600"
                    placeholder="Enter a brief description"
                    rows={3}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  >
                    <option value="">Select a subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="History">History</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false);
                      // In a real app, would create the mind map here
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    Create Mind Map
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .react-flow__node {
          padding: 0 !important;
          width: auto !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .react-flow__edge-path {
          stroke-width: 2 !important;
        }
        
        .react-flow__controls {
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .react-flow__minimap {
          border-radius: 8px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
      `}</style>
    </div>
  );
} 