"use client";

import { todosApi } from "../lib/api";

export default function TodoCard({ todo, onUpdated, onDeleted }) {
  async function toggleStatus() {
    const newStatus = todo.status === "completed" ? "pending" : "completed";
    await todosApi.update(todo.id, { status: newStatus });
    onUpdated();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${todo.title}"?`)) return;
    await todosApi.delete(todo.id);
    onDeleted();
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  const isCompleted = todo.status === "completed";

  return (
    <div className={`todo-card ${isCompleted ? "completed" : ""}`}>
      <button
        id={`toggle-todo-${todo.id}`}
        className={`todo-checkbox ${isCompleted ? "checked" : ""}`}
        onClick={toggleStatus}
        title={isCompleted ? "Mark as pending" : "Mark as completed"}
        aria-label="Toggle completion"
      />

      <div className="todo-body">
        <div className="todo-card-title">{todo.title}</div>
        {todo.description && (
          <div className="todo-card-desc">{todo.description}</div>
        )}
        <div className="todo-meta">
          <span className={`badge badge-${todo.status}`}>{todo.status}</span>
          <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
          <span className="todo-date">{formatDate(todo.created_at)}</span>
        </div>
      </div>

      <div className="todo-actions">
        <button
          id={`delete-todo-${todo.id}`}
          className="action-btn delete"
          onClick={handleDelete}
          title="Delete task"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
