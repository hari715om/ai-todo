"""
Seed script — populates the database with a demo user and sample todos.

Usage (from the backend/ directory with venv active):
    python seed.py

This is safe to run multiple times — it checks for existing data first.
"""

from datetime import datetime, timezone, timedelta
from app.core.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.todo import Todo, TodoStatus, TodoPriority

import app.models.user  # noqa: F401
import app.models.todo  # noqa: F401

Base.metadata.create_all(bind=engine)


DEMO_TODOS = [
    {
        "title": "Set up project repository",
        "description": "Initialize Git repo, add .gitignore, push initial commit to GitHub.",
        "status": TodoStatus.completed,
        "priority": TodoPriority.high,
        "days_ago": 5,
    },
    {
        "title": "Design database schema",
        "description": "Define User and Todo models with proper relationships and indexes.",
        "status": TodoStatus.completed,
        "priority": TodoPriority.high,
        "days_ago": 4,
    },
    {
        "title": "Implement Google OAuth flow",
        "description": "Server-side ID token verification using google-auth library.",
        "status": TodoStatus.completed,
        "priority": TodoPriority.high,
        "days_ago": 3,
    },
    {
        "title": "Build CRUD API for todos",
        "description": "GET, POST, PUT, DELETE endpoints with JWT authentication.",
        "status": TodoStatus.completed,
        "priority": TodoPriority.medium,
        "days_ago": 2,
    },
    {
        "title": "Integrate Groq AI for task breakdown",
        "description": "Using llama-3.3-70b-versatile to break tasks into actionable subtasks.",
        "status": TodoStatus.completed,
        "priority": TodoPriority.medium,
        "days_ago": 1,
    },
    {
        "title": "Write API documentation",
        "description": "Document all endpoints with request/response examples in README.",
        "status": TodoStatus.pending,
        "priority": TodoPriority.medium,
        "days_ago": 0,
    },
    {
        "title": "Add input validation and error handling",
        "description": "Handle edge cases: empty titles, invalid tokens, DB errors.",
        "status": TodoStatus.pending,
        "priority": TodoPriority.medium,
        "days_ago": 0,
    },
    {
        "title": "Deploy backend to Render",
        "description": "Configure environment variables, connect PostgreSQL, test live endpoints.",
        "status": TodoStatus.pending,
        "priority": TodoPriority.high,
        "days_ago": 0,
    },
    {
        "title": "Deploy frontend to Vercel",
        "description": "Set NEXT_PUBLIC env vars, verify Google OAuth works on production domain.",
        "status": TodoStatus.pending,
        "priority": TodoPriority.high,
        "days_ago": 0,
    },
    {
        "title": "Prepare project presentation",
        "description": "Record a 2-minute demo video and write a concise project summary.",
        "status": TodoStatus.pending,
        "priority": TodoPriority.low,
        "days_ago": 0,
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "demo@ai-todo.dev").first()
        if existing:
            todo_count = db.query(Todo).filter(Todo.user_id == existing.id).count()
            print(f"Demo user already exists (id={existing.id}) with {todo_count} todos. Skipping.")
            return

        demo_user = User(
            google_id="demo_seed_user_001",
            email="demo@ai-todo.dev",
            name="Demo User",
            picture=None,
        )
        db.add(demo_user)
        db.flush()

        now = datetime.now(timezone.utc)
        for item in DEMO_TODOS:
            days = item.pop("days_ago")
            created = now - timedelta(days=days)
            todo = Todo(
                **item,
                user_id=demo_user.id,
                created_at=created,
                updated_at=created,
            )
            db.add(todo)

        db.commit()
        print(f"Seeded: demo user (id={demo_user.id}) + {len(DEMO_TODOS)} todos.")
        print()
        print("Note: This demo user cannot actually log in via Google OAuth.")
        print("It exists only so you can inspect the DB and see realistic data.")
        print("Your real Google account will get its own separate user record on first login.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
