import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Kanban, Plus, Clock } from "lucide-react";
import { CustomSelect } from "./CustomSelect";

import { API_BASE } from "../config";

export function ProjectsDashboard() {
  const { token, themeColor } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const [activeTab, setActiveTab] = useState("projects");
  // Modals
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    budget: "",
  });

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    project: "",
    employee_id: "",
    description: "",
  });

  const [showLogTime, setShowLogTime] = useState(false);
  const [newTime, setNewTime] = useState({
    task: "",
    hours: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [projRes, taskRes, empRes] = await Promise.all([
        axios.get(`${API_BASE}/api/projects/projects/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/api/projects/tasks/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios
          .get(`${API_BASE}/api/hr/employees/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/projects/projects/`, newProject, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddProject(false);
      setNewProject({ name: "", description: "", budget: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/projects/tasks/`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddTask(false);
      setNewTask({ name: "", project: "", employee_id: "", description: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    try {
      const taskObj = tasks.find((t) => t.id === newTime.task);
      const data = {
        ...newTime,
        employee_id: taskObj?.employee_id || "unknown",
      };
      await axios.post(`${API_BASE}/api/projects/time-entries/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowLogTime(false);
      setNewTime({
        task: "",
        hours: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      alert("Time logged successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(
        `${API_BASE}/api/projects/tasks/${taskId}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateProjectStatus = async (projId, status) => {
    try {
      await axios.patch(
        `${API_BASE}/api/projects/projects/${projId}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10 p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Kanban className="w-8 h-8" style={{ color: themeColor }} />
            Projects & Tasks
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage consulting projects, assign tasks, and track billable time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddTask(true)}
            className="px-4 py-2 rounded-xl font-bold bg-muted text-foreground transition-colors hover:bg-muted/80"
          >
            New Task
          </button>
          <button
            onClick={() => setShowAddProject(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition-transform hover:scale-[1.02] shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border/50 pb-px">
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === "projects" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={
            activeTab === "projects" ? { borderBottomColor: themeColor } : {}
          }
        >
          Projects Overview
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-4 px-2 font-bold transition-colors ${activeTab === "tasks" ? "text-foreground border-b-2" : "text-muted-foreground"}`}
          style={activeTab === "tasks" ? { borderBottomColor: themeColor } : {}}
        >
          Task Board
        </button>
      </div>

      {activeTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-panel rounded-2xl p-6 border border-border/50 flex flex-col relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: themeColor }}
              ></div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{proj.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {proj.description || "No description"}
                  </p>
                </div>
                <CustomSelect
                  value={proj.status}
                  onChange={(e) => updateProjectStatus(proj.id, e.target.value)}
                  className="bg-transparent border border-border/50 rounded px-2 py-1 text-xs font-bold font-mono"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </CustomSelect>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground mb-2">
                  <span>Tasks</span>
                  <span>
                    {
                      tasks.filter(
                        (t) => t.project === proj.id && t.status === "done",
                      ).length
                    }{" "}
                    / {tasks.filter((t) => t.project === proj.id).length}{" "}
                    Completed
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: themeColor,
                      width: `${tasks.filter((t) => t.project === proj.id).length > 0 ? (tasks.filter((t) => t.project === proj.id && t.status === "done").length / tasks.filter((t) => t.project === proj.id).length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && !isFetching && (
            <div className="col-span-full text-center p-12 text-muted-foreground">
              No projects found. Create one to begin.
            </div>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="flex flex-col h-full gap-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowLogTime(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-muted text-foreground transition-colors hover:bg-muted/80 text-sm border border-border/50"
            >
              <Clock className="w-4 h-4" /> Log Time
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {["todo", "in_progress", "review", "done"].map((status) => (
              <div
                key={status}
                className="flex flex-col gap-4 bg-muted/10 rounded-2xl p-4 border border-border/30 h-full min-h-[400px]"
              >
                <h3 className="font-bold uppercase tracking-wider text-sm text-muted-foreground mb-2 flex justify-between items-center">
                  {status.replace("_", " ")}
                  <span className="bg-muted px-2 py-0.5 rounded-full text-xs">
                    {tasks.filter((t) => t.status === status).length}
                  </span>
                </h3>

                {tasks
                  .filter((t) => t.status === status)
                  .map((task) => {
                    const empName =
                      employees.find((e) => e.id === task.employee_id)
                        ?.first_name || "Unassigned";
                    return (
                      <div
                        key={task.id}
                        className="bg-card p-4 rounded-xl border border-border/50 shadow-sm space-y-3 relative group"
                      >
                        <div className="font-semibold">{task.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {task.project_name}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                            {empName}
                          </div>
                          <CustomSelect
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-background border border-border/50 text-xs rounded"
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(task.id, e.target.value)
                            }
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </CustomSelect>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                New Project
              </h2>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProject.budget}
                  onChange={(e) =>
                    setNewProject({ ...newProject, budget: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                New Task
              </h2>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Project
                </label>
                <CustomSelect
                  required
                  value={newTask.project}
                  onChange={(e) =>
                    setNewTask({ ...newTask, project: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Task Name
                </label>
                <input
                  type="text"
                  required
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Assignee (Employee)
                </label>
                <CustomSelect
                  value={newTask.employee_id}
                  onChange={(e) =>
                    setNewTask({ ...newTask, employee_id: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Unassigned</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Time Modal */}
      {showLogTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
            <div
              className="p-6 border-b border-border/50"
              style={{ backgroundColor: `${themeColor}10` }}
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                Log Billable Time
              </h2>
            </div>
            <form onSubmit={handleLogTime} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Task
                </label>
                <CustomSelect
                  required
                  value={newTime.task}
                  onChange={(e) =>
                    setNewTime({ ...newTime, task: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a task...</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.project_name} - {t.name}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTime.date}
                    onChange={(e) =>
                      setNewTime({ ...newTime, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Hours Logged
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={newTime.hours}
                    onChange={(e) =>
                      setNewTime({ ...newTime, hours: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newTime.description}
                  onChange={(e) =>
                    setNewTime({ ...newTime, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-muted/30 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogTime(false)}
                  className="flex-1 px-4 py-3 border border-border/50 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: themeColor }}
                >
                  Log Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
