"use client";

import TodoCard from "./TodoCard";

export default function TodoList({ todos, filter, onUpdated, onDeleted }) {
  const filtered = todos.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  if (filtered.length === 0) {
    const messages = {
      all: "No tasks yet. Create your first task above.",
      pending: "No pending tasks. Great work!",
      completed: "No completed tasks yet.",
    };
    return (
      <div className="todos-empty">
        <div className="todos-empty-icon">
          {filter === "completed" ? "✓" : "○"}
        </div>
        <p>{messages[filter]}</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {filtered.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
