"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { Check, Edit, Trash, Plus, BookOpen, Brain, ClipboardList, GraduationCap, Clock, Flag, Calendar } from "lucide-react";


// Define the types for our mind map
interface MindMapNode {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactElement;
  status: "not-started" | "in-progress" | "completed";
  children: MindMapNode[];
}

export default function MindMapPage() {
  const [activeStudySituation, setActiveStudySituation] = useState<string>("exams");
  const [showNodeForm, setShowNodeForm] = useState<boolean>(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [nodeTitle, setNodeTitle] = useState<string>("");
  const [nodeDescription, setNodeDescription] = useState<string>("");
  const [parentNodeId, setParentNodeId] = useState<string | null>(null);

  // Different study situations a user might be in
  const studySituations = [
    { id: "exams", label: "Preparing for Exams" },
    { id: "research", label: "Research Project" },
    { id: "learning", label: "Learning New Subject" },
    { id: "thesis", label: "Writing Thesis" },
    { id: "revision", label: "Revision and Review" },
  ];

  // Initial mind map structures for different situations
  const initialMindMaps: Record<string, MindMapNode> = {
    exams: {
      id: "exams-root",
      title: "Exam Preparation",
      description: "Your roadmap to exam success",
      icon: <GraduationCap className="w-5 h-5" />,
      status: "in-progress",
      children: [
        {
          id: "understand-syllabus",
          title: "Understand Syllabus",
          description: "Review all topics that will be covered in the exam",
          icon: <BookOpen className="w-5 h-5" />,
          status: "completed",
          children: []
        },
        {
          id: "create-study-schedule",
          title: "Create Study Schedule",
          description: "Plan your study sessions with specific goals for each day",
          icon: <Calendar className="w-5 h-5" />,
          status: "in-progress",
          children: [
            {
              id: "prioritize-topics",
              title: "Prioritize Topics",
              description: "Focus more time on difficult or high-value subjects",
              icon: <Flag className="w-5 h-5" />,
              status: "in-progress",
              children: []
            },
            {
              id: "time-allocation",
              title: "Time Allocation",
              description: "Decide how much time to spend on each topic",
              icon: <Clock className="w-5 h-5" />,
              status: "not-started",
              children: []
            }
          ]
        },
        {
          id: "active-learning",
          title: "Active Learning Techniques",
          description: "Use methods that maximize retention and understanding",
          icon: <Brain className="w-5 h-5" />,
          status: "not-started",
          children: [
            {
              id: "practice-questions",
              title: "Practice Questions",
              description: "Work through past papers and example questions",
              icon: <ClipboardList className="w-5 h-5" />,
              status: "not-started",
              children: []
            }
          ]
        }
      ]
    },
    research: {
      id: "research-root",
      title: "Research Project",
      description: "Structured approach to your research",
      icon: <BookOpen className="w-5 h-5" />,
      status: "in-progress",
      children: [
        {
          id: "literature-review",
          title: "Literature Review",
          description: "Find and analyze relevant research papers",
          icon: <BookOpen className="w-5 h-5" />,
          status: "in-progress",
          children: []
        },
        {
          id: "methodology",
          title: "Methodology",
          description: "Design your research approach",
          icon: <ClipboardList className="w-5 h-5" />,
          status: "not-started",
          children: []
        }
      ]
    },
    learning: {
      id: "learning-root",
      title: "Learning New Subject",
      description: "Step-by-step approach to mastering new material",
      icon: <Brain className="w-5 h-5" />,
      status: "not-started",
      children: [
        {
          id: "fundamentals",
          title: "Grasp Fundamentals",
          description: "Focus on core concepts and principles",
          icon: <BookOpen className="w-5 h-5" />,
          status: "not-started",
          children: []
        }
      ]
    },
    thesis: {
      id: "thesis-root",
      title: "Thesis Writing",
      description: "Navigate your thesis journey efficiently",
      icon: <BookOpen className="w-5 h-5" />,
      status: "not-started",
      children: [
        {
          id: "thesis-outline",
          title: "Create Detailed Outline",
          description: "Structure your thesis with clear chapters and sections",
          icon: <ClipboardList className="w-5 h-5" />,
          status: "not-started",
          children: []
        }
      ]
    },
    revision: {
      id: "revision-root",
      title: "Revision and Review",
      description: "Solidify your understanding and memory",
      icon: <BookOpen className="w-5 h-5" />,
      status: "not-started",
      children: [
        {
          id: "knowledge-gaps",
          title: "Identify Knowledge Gaps",
          description: "Find areas where your understanding is weak",
          icon: <ClipboardList className="w-5 h-5" />,
          status: "not-started",
          children: []
        }
      ]
    }
  };

  // State to store the mind maps (one for each situation)
  const [mindMaps, setMindMaps] = useState<Record<string, MindMapNode>>(initialMindMaps);

  // Helper function to find a node by ID recursively
  const findNodeById = (root: MindMapNode, id: string): MindMapNode | null => {
    if (root.id === id) return root;
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  // Helper function to update a node's status recursively
  const updateNodeStatus = (root: MindMapNode, id: string, status: "not-started" | "in-progress" | "completed"): MindMapNode => {
    if (root.id === id) {
      return { ...root, status };
    }
    return {
      ...root,
      children: root.children.map(child => updateNodeStatus(child, id, status))
    };
  };

  // Helper function to add a child node
  const addChildNode = (root: MindMapNode, parentId: string, newNode: MindMapNode): MindMapNode => {
    if (root.id === parentId) {
      return {
        ...root,
        children: [...root.children, newNode]
      };
    }
    return {
      ...root,
      children: root.children.map(child => addChildNode(child, parentId, newNode))
    };
  };

  // Helper function to delete a node
  const deleteNode = (root: MindMapNode, id: string): MindMapNode => {
    return {
      ...root,
      children: root.children
        .filter(child => child.id !== id)
        .map(child => deleteNode(child, id))
    };
  };

  // Helper function to update a node
  const updateNode = (root: MindMapNode, id: string, updates: Partial<MindMapNode>): MindMapNode => {
    if (root.id === id) {
      return { ...root, ...updates };
    }
    return {
      ...root,
      children: root.children.map(child => updateNode(child, id, updates))
    };
  };

  // Handle changing node status
  const handleStatusChange = (nodeId: string, status: "not-started" | "in-progress" | "completed") => {
    const updatedMindMap = updateNodeStatus(mindMaps[activeStudySituation], nodeId, status);
    setMindMaps({
      ...mindMaps,
      [activeStudySituation]: updatedMindMap
    });
  };

  // Handle adding a new node
  const handleAddNode = () => {
    if (!nodeTitle.trim() || !parentNodeId) return;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      title: nodeTitle,
      description: nodeDescription || undefined,
      status: "not-started",
      children: []
    };

    const updatedMindMap = addChildNode(mindMaps[activeStudySituation], parentNodeId, newNode);
    setMindMaps({
      ...mindMaps,
      [activeStudySituation]: updatedMindMap
    });

    // Reset form
    setNodeTitle("");
    setNodeDescription("");
    setShowNodeForm(false);
    setParentNodeId(null);
  };

  // Handle editing a node
  const handleEditNode = () => {
    if (!nodeTitle.trim() || !editingNode) return;

    const updatedMindMap = updateNode(mindMaps[activeStudySituation], editingNode, {
      title: nodeTitle,
      description: nodeDescription || undefined
    });

    setMindMaps({
      ...mindMaps,
      [activeStudySituation]: updatedMindMap
    });

    // Reset form
    setNodeTitle("");
    setNodeDescription("");
    setShowNodeForm(false);
    setEditingNode(null);
  };

  // Handle deleting a node
  const handleDeleteNode = (nodeId: string) => {
    const updatedMindMap = deleteNode(mindMaps[activeStudySituation], nodeId);
    setMindMaps({
      ...mindMaps,
      [activeStudySituation]: updatedMindMap
    });
  };

  // Show the form to add a new node
  const showAddNodeForm = (parentId: string) => {
    setParentNodeId(parentId);
    setEditingNode(null);
    setNodeTitle("");
    setNodeDescription("");
    setShowNodeForm(true);
  };

  // Show the form to edit a node
  const showEditNodeForm = (nodeId: string) => {
    const node = findNodeById(mindMaps[activeStudySituation], nodeId);
    if (node) {
      setEditingNode(nodeId);
      setNodeTitle(node.title);
      setNodeDescription(node.description || "");
      setShowNodeForm(true);
      setParentNodeId(null);
    }
  };

  // Recursive component to render the mind map node and its children
  const renderMindMapNode = (node: MindMapNode, level: number = 0) => {
    const statusColors = {
      "not-started": "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      "in-progress": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
      "completed": "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
    };

    const statusLabels = {
      "not-started": "Not Started",
      "in-progress": "In Progress",
      "completed": "Completed"
    };

    return (
      <div className="mb-4" style={{ marginLeft: `${level * 24}px` }}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-cyan-500 dark:border-cyan-600">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {node.icon && <div>{node.icon}</div>}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{node.title}</h3>
              </div>
              {node.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{node.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[node.status]}`}>
                {statusLabels[node.status]}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => showAddNodeForm(node.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => showEditNodeForm(node.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {level > 0 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteNode(node.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <Button
              size="sm"
              variant={node.status === "not-started" ? "default" : "outline"}
              className={`text-xs ${node.status === "not-started" ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200" : ""}`}
              onClick={() => handleStatusChange(node.id, "not-started")}
            >
              Not Started
            </Button>
            <Button
              size="sm"
              variant={node.status === "in-progress" ? "default" : "outline"}
              className={`text-xs ${node.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" : ""}`}
              onClick={() => handleStatusChange(node.id, "in-progress")}
            >
              In Progress
            </Button>
            <Button
              size="sm"
              variant={node.status === "completed" ? "default" : "outline"}
              className={`text-xs ${node.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" : ""}`}
              onClick={() => handleStatusChange(node.id, "completed")}
            >
              <Check className="w-3 h-3 mr-1" /> Completed
            </Button>
          </div>
        </div>

        {node.children.length > 0 && (
          <div className="mt-2 ml-4 pl-4 border-l border-dashed border-gray-300 dark:border-gray-600">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                <div className="absolute -left-4 top-6 w-3 h-px bg-gray-300 dark:bg-gray-600"></div>
                {renderMindMapNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Study Mind Map"
        subtitle="Visualize your study journey and track your progress"
      />

      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Your Current Study Situation</h3>

          <div className="flex flex-wrap gap-2">
            {studySituations.map((situation) => (
              <button
                key={situation.id}
                onClick={() => setActiveStudySituation(situation.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeStudySituation === situation.id
                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
              >
                {situation.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showNodeForm && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingNode ? "Edit Node" : "Add New Node"}
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
              placeholder="Enter a title"
              value={nodeTitle}
              onChange={(e) => setNodeTitle(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white min-h-[100px]"
              placeholder="Add a description"
              value={nodeDescription}
              onChange={(e) => setNodeDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowNodeForm(false);
                setEditingNode(null);
                setParentNodeId(null);
              }}
            >
              Cancel
            </Button>
            {editingNode ? (
              <Button
                onClick={handleEditNode}
                disabled={!nodeTitle.trim()}
              >
                Update
              </Button>
            ) : (
              <Button
                onClick={handleAddNode}
                disabled={!nodeTitle.trim()}
              >
                Add
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mb-12">
        <div className="space-y-4">
          {renderMindMapNode(mindMaps[activeStudySituation])}
        </div>
      </div>
    </>
  );
} 