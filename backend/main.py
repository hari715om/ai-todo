from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, todos, ai

import app.models.user  # noqa: F401 — ensures tables are registered
import app.models.todo  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Todo API",
    description="A minimal Todo API with Google OAuth and AI task assistance.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(ai.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "version": "1.0.0"}
