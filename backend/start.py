"""
Diagnostic startup script.
Run this instead of uvicorn directly to see exactly which step crashes.
Change Render start command to: python start.py
"""

import sys
import traceback
import os

print(f"\n{'='*50}")
print("STARTUP DIAGNOSTIC")
print(f"Python: {sys.version}")
print(f"{'='*50}\n")

# Step 1 — Config
print("[1/5] Loading config...")
try:
    from app.core.config import settings
    db_prefix = settings.DATABASE_URL[:25] if settings.DATABASE_URL else "NOT SET"
    print(f"      DATABASE_URL : {db_prefix}...")
    print(f"      GOOGLE_CLIENT_ID : {'SET' if settings.GOOGLE_CLIENT_ID else 'MISSING'}")
    print(f"      SECRET_KEY       : {'SET' if settings.SECRET_KEY else 'MISSING'}")
    print(f"      GROQ_API_KEY     : {'SET' if settings.GROQ_API_KEY else 'MISSING'}")
    print("      OK\n")
except Exception:
    print("      FAILED\n")
    traceback.print_exc()
    sys.exit(1)

# Step 2 — Database engine
print("[2/5] Creating database engine...")
try:
    from app.core.database import engine, Base
    print("      OK\n")
except Exception:
    print("      FAILED\n")
    traceback.print_exc()
    sys.exit(1)

# Step 3 — Models
print("[3/5] Importing models...")
try:
    import app.models.user
    import app.models.todo
    print("      OK\n")
except Exception:
    print("      FAILED\n")
    traceback.print_exc()
    sys.exit(1)

# Step 4 — DB table creation
print("[4/5] Creating database tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("      OK\n")
except Exception:
    print("      FAILED\n")
    traceback.print_exc()
    sys.exit(1)

# Step 5 — Full app import
print("[5/5] Importing FastAPI app...")
try:
    import main  # noqa: F401
    print("      OK\n")
except Exception:
    print("      FAILED\n")
    traceback.print_exc()
    sys.exit(1)

print("="*50)
print("ALL CHECKS PASSED — starting server")
print("="*50 + "\n")

import uvicorn
port = int(os.environ.get("PORT", 8000))
uvicorn.run("main:app", host="0.0.0.0", port=port)
