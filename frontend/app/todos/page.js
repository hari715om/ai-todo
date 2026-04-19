"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../../lib/auth";
import { todosApi } from "../../lib/api";
import Header from "../../components/Header";
import TodoList from "../../components/TodoList";
import CreateTodoModal from "../../components/CreateTodoModal";

const FILTERS = ["all", "pending", "completed"];

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setLoading(true);
    setError("");
    try {
      const { data } = await todosApi.getAll();
      setTodos(data);
    } catch {
      setError("Failed to load tasks. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const completedCount = todos.filter((t) => t.status === "completed").length;

  const counts = { all: todos.length, pending: pendingCount, completed: completedCount };

  return (
    <>
      <Header />
      <main className="page-container">
        <div className="todos-page">
          <div className="todos-header">
            <div>
              <h1 className="todos-title" style={{ display: "inline" }}>
                My Tasks
              </h1>
              <span className="todos-count">
                {pendingCount} pending · {completedCount} done
              </span>
            </div>
            <button
              id="new-task-btn"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              + New task
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <div className="todos-filters">
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {" "}
                <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          <TodoList
            todos={todos}
            filter={filter}
            onUpdated={fetchTodos}
            onDeleted={fetchTodos}
          />
        </div>
      </main>

      {showModal && (
        <CreateTodoModal
          onClose={() => setShowModal(false)}
          onCreated={fetchTodos}
        />
      )}
    </>
  );
}
