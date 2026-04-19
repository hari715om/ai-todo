"use client";

import { useState } from "react";
import { todosApi, aiApi } from "../lib/api";

const PRIORITIES = ["low", "medium", "high"];

export default function CreateTodoModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [aiBreakdown, setAiBreakdown] = useState([]);
  const [aiBreakdownLoading, setAiBreakdownLoading] = useState(false);
  const [aiBreakdownError, setAiBreakdownError] = useState("");

  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [aiSuggestError, setAiSuggestError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await todosApi.create({ title: title.trim(), description: description.trim() || undefined, priority });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBreakdown() {
    if (!title.trim()) {
      setAiBreakdownError("Enter a title first.");
      return;
    }
    setAiBreakdownLoading(true);
    setAiBreakdownError("");
    setAiBreakdown([]);
    try {
      const { data } = await aiApi.breakdown(title.trim());
      if (!data.subtasks.length) {
        setAiBreakdownError("No subtasks returned. Check your GROQ_API_KEY.");
      } else {
        setAiBreakdown(data.subtasks);
      }
    } catch {
      setAiBreakdownError("Failed to break down task. Check your GROQ_API_KEY.");
    } finally {
      setAiBreakdownLoading(false);
    }
  }

  async function handleSuggestTitle() {
    if (!title.trim()) {
      setAiSuggestError("Enter some text first.");
      return;
    }
    setAiSuggestLoading(true);
    setAiSuggestError("");
    try {
      const { data } = await aiApi.suggestTitle(title.trim());
      setTitle(data.suggested_title);
    } catch {
      setAiSuggestError("Title suggestion failed. Check your GROQ_API_KEY.");
    } finally {
      setAiSuggestLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* ── Sticky header ── */}
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">New task</h2>
          <button id="modal-close-btn" className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="modal-body">
          <form id="create-task-form" onSubmit={handleSubmit}>
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title</label>
              <div className="form-input-row">
                <input
                  id="task-title"
                  className="form-input"
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <button
                  id="ai-suggest-btn"
                  type="button"
                  className="btn btn-ai"
                  onClick={handleSuggestTitle}
                  disabled={aiSuggestLoading}
                  title="AI: Clean up this title"
                >
                  {aiSuggestLoading ? "…" : "✨ Clean"}
                </button>
              </div>
              {aiSuggestError && <div className="ai-error" style={{ marginTop: 6 }}>{aiSuggestError}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-description">Description (optional)</label>
              <textarea
                id="task-description"
                className="form-textarea"
                placeholder="Add details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>AI Breakdown</label>
                <button
                  id="ai-breakdown-btn"
                  type="button"
                  className="btn btn-ai"
                  onClick={handleBreakdown}
                  disabled={aiBreakdownLoading}
                >
                  {aiBreakdownLoading ? "Thinking…" : "✦ Break it down"}
                </button>
              </div>
              {aiBreakdownLoading && (
                <div className="ai-panel">
                  <div className="ai-loading">
                    <div className="ai-spinner" />
                    Generating subtasks…
                  </div>
                </div>
              )}
              {aiBreakdownError && (
                <div className="ai-panel">
                  <div className="ai-error">{aiBreakdownError}</div>
                </div>
              )}
              {aiBreakdown.length > 0 && (
                <div className="ai-panel">
                  <div className="ai-panel-title">Suggested subtasks</div>
                  <ul className="ai-subtask-list">
                    {aiBreakdown.map((s, i) => (
                      <li key={i} className="ai-subtask-item">
                        <span className="ai-subtask-bullet" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── Sticky footer ── */}
        <div className="form-footer">
          <button type="button" id="cancel-btn" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="create-task-form" id="create-task-btn" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating…" : "Create task"}
          </button>
        </div>

      </div>
    </div>
  );
}
