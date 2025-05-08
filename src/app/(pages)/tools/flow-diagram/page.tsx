"use client";

import { useState } from "react";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  Link2,
  FileText,
  BookOpen,
  Brain,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import PageHeader from "../../../../../components/ui/PageHeader";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dependencies: string[];
  assignee?: string;
  dueDate?: string;
  color: string;
  icon: React.ReactNode;
}

interface FlowDiagram {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export default function FlowDiagramPage() {
  const [selectedDiagram, setSelectedDiagram] = useState<FlowDiagram | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Task["status"]>("todo");
  const [selectedPriority, setSelectedPriority] = useState<Task["priority"]>("medium");
  const [selectedColor, setSelectedColor] = useState("blue");

  // Mock data for flow diagrams
  const flowDiagrams: FlowDiagram[] = [
    {
      id: "1",
      title: "Project Development Flow",
      description: "Flow diagram for the main project development process",
      createdAt: "2024-03-15",
      updatedAt: "2024-03-15",
      tasks: [
        {
          id: "1-1",
          title: "Requirements Gathering",
          description: "Collect and analyze project requirements",
          status: "completed",
          priority: "high",
          dependencies: [],
          color: "blue",
          icon: <FileText className="h-5 w-5" />,
        },
        {
          id: "1-2",
          title: "Design Phase",
          description: "Create system architecture and UI/UX design",
          status: "in-progress",
          priority: "high",
          dependencies: ["1-1"],
          color: "green",
          icon: <Brain className="h-5 w-5" />,
        },
        {
          id: "1-3",
          title: "Development",
          description: "Implement core features and functionality",
          status: "todo",
          priority: "medium",
          dependencies: ["1-2"],
          color: "purple",
          icon: <GitBranch className="h-5 w-5" />,
        },
        {
          id: "1-4",
          title: "Testing",
          description: "Perform unit and integration testing",
          status: "todo",
          priority: "medium",
          dependencies: ["1-3"],
          color: "yellow",
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
          id: "1-5",
          title: "Deployment",
          description: "Deploy the application to production",
          status: "todo",
          priority: "high",
          dependencies: ["1-4"],
          color: "red",
          icon: <GitMerge className="h-5 w-5" />,
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

  const statusColors = {
    todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };

  const handleCreateDiagram = () => {
    setIsCreating(true);
  };

  const handleSelectDiagram = (diagram: FlowDiagram) => {
    setSelectedDiagram(diagram);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleAddTask = () => {
    if (!selectedDiagram) return;

    const newTask: Task = {
      id: `${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      status: selectedStatus,
      priority: selectedPriority,
      dependencies: [],
      color: selectedColor,
      icon: <FileText className="h-5 w-5" />,
    };

    setSelectedDiagram({
      ...selectedDiagram,
      tasks: [...selectedDiagram.tasks, newTask],
    });

    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setSelectedStatus(task.status);
    setSelectedPriority(task.priority);
    setSelectedColor(task.color);
  };

  const handleSaveTask = () => {
    if (!selectedDiagram || !editingTask) return;

    const updatedTasks = selectedDiagram.tasks.map((task) =>
      task.id === editingTask.id
        ? {
            ...task,
            title: newTaskTitle,
            description: newTaskDescription,
            status: selectedStatus,
            priority: selectedPriority,
            color: selectedColor,
          }
        : task
    );

    setSelectedDiagram({
      ...selectedDiagram,
      tasks: updatedTasks,
    });

    setEditingTask(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedDiagram) return;

    setSelectedDiagram({
      ...selectedDiagram,
      tasks: selectedDiagram.tasks.filter((task) => task.id !== taskId),
    });
  };

  const renderTask = (task: Task) => {
    return (
      <div
        key={task.id}
        className={`p-4 rounded-lg mb-4 ${
          task.color === "blue"
            ? "bg-blue-50 dark:bg-blue-900/20"
            : task.color === "green"
            ? "bg-green-50 dark:bg-green-900/20"
            : task.color === "purple"
            ? "bg-purple-50 dark:bg-purple-900/20"
            : task.color === "red"
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-yellow-50 dark:bg-yellow-900/20"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div
                className={`p-2 rounded-full ${
                  task.color === "blue"
                    ? "bg-blue-100"
                    : task.color === "green"
                    ? "bg-green-100"
                    : task.color === "purple"
                    ? "bg-purple-100"
                    : task.color === "red"
                    ? "bg-red-100"
                    : "bg-yellow-100"
                } mr-3`}
              >
                {task.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}
              >
                {task.status}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}
              >
                {task.priority} priority
              </span>
              {task.dueDate && (
                <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditTask(task)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {task.dependencies.length > 0 && (
          <div className="mt-4 pl-8">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Link2 className="h-4 w-4 mr-2" />
              Dependencies:
            </div>
            <div className="mt-2 space-y-2">
              {task.dependencies.map((depId) => {
                const depTask = selectedDiagram?.tasks.find((t) => t.id === depId);
                return depTask ? (
                  <div
                    key={depId}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {depTask.title}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Flow Diagram"
        description="Visualize and manage your task flow"
        icon={<GitBranch className="h-8 w-8" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Flow Diagrams
              </h2>
              <Button
                onClick={handleCreateDiagram}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Diagram
              </Button>
            </div>
            <div className="space-y-4">
              {flowDiagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedDiagram?.id === diagram.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                  onClick={() => handleSelectDiagram(diagram)}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {diagram.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {diagram.description}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(diagram.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedDiagram ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedDiagram.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedDiagram.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isEditing && (
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingTask ? "Edit Task" : "Add New Task"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) =>
                            setSelectedStatus(e.target.value as Task["status"])
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={selectedPriority}
                          onChange={(e) =>
                            setSelectedPriority(e.target.value as Task["priority"])
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Color
                      </label>
                      <div className="flex space-x-2">
                        {colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-8 h-8 rounded-full ${
                              color.value
                            } ${
                              selectedColor === color.name
                                ? "ring-2 ring-offset-2 ring-gray-400"
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      {editingTask && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingTask(null);
                            setNewTaskTitle("");
                            setNewTaskDescription("");
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      <Button
                        onClick={() =>
                          editingTask ? handleSaveTask() : handleAddTask()
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {editingTask ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Task
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {selectedDiagram.tasks.map((task) => renderTask(task))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
              <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Select a Flow Diagram
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a flow diagram from the sidebar or create a new one to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 