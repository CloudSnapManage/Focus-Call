/**
 * Task List Manager
 * Handles task checklist with localStorage persistence
 */

export class TaskList {
  constructor() {
    this.tasks = [];
    this.storageKey = 'focusSync_tasks';
    this.loadTasks();
  }

  /**
   * Load tasks from localStorage
   */
  loadTasks() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.tasks = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      this.tasks = [];
    }
  }

  /**
   * Save tasks to localStorage
   */
  saveTasks() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  /**
   * Add a new task
   */
  addTask(text) {
    if (!text || !text.trim()) return null;

    const task = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  /**
   * Toggle task completion
   */
  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      return task;
    }
    return null;
  }

  /**
   * Delete a task
   */
  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index > -1) {
      const task = this.tasks.splice(index, 1)[0];
      this.saveTasks();
      return task;
    }
    return null;
  }

  /**
   * Clear all tasks
   */
  clearAllTasks() {
    this.tasks = [];
    this.saveTasks();
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return [...this.tasks];
  }

  /**
   * Get completion stats
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Export tasks as JSON
   */
  exportTasks() {
    return JSON.stringify(this.tasks, null, 2);
  }

  /**
   * Import tasks from JSON
   */
  importTasks(jsonData) {
    try {
      const imported = JSON.parse(jsonData);
      if (Array.isArray(imported)) {
        this.tasks = imported;
        this.saveTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing tasks:', error);
      return false;
    }
  }
}

export default TaskList;
