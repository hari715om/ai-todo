# AI Todo

A minimal, production-quality Todo application with Google Authentication and AI-powered task assistance. Built as a portfolio project demonstrating clean backend architecture, proper auth implementation, and practical AI integration.

---

## Features

- **Google OAuth** — One-click sign-in, server-side token verification
- **Full CRUD** — Create, view, update, and delete tasks
- **User-scoped data** — Each user sees only their own tasks
- **Filter & stats** — View all / pending / completed with counts
- **Priority levels** — Low, Medium, High per task
- **AI Task Breakdown** — Paste a vague goal, get 3-5 actionable subtasks
- **AI Title Suggestion** — Clean up rough text into a proper task title
- **Graceful degradation** — App works fully without the Gemini API key

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.11+) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy 2.0 |
| Auth | Google OAuth + JWT (HS256) |
| AI | Google Gemini 1.5 Flash |
| Frontend | Next.js 14 (App Router) |
| Styling | Vanilla CSS |
| HTTP Client | Axios |

---

## Project Structure

```
ai-todo/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── core/         # config, database, security
│       ├── models/       # SQLAlchemy models
│       ├── schemas/      # Pydantic schemas
│       ├── api/          # Route handlers
│       └── services/     # AI service
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/              # API client, auth helpers
│   └── styles/           # Global CSS
├── README.md
└── ARCHITECTURE.md       # Full technical explanation
```

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Google Cloud project

---

### Step 1: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:3000`
7. Add Authorized redirect URIs:
   - `http://localhost:3000`
8. Copy the **Client ID** (you only need the client ID, not the secret, for this flow)

---

### Step 2: Gemini API Key (Optional)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key

---

### Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux

# Edit .env and fill in:
# SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_hex(32))">
# GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# GEMINI_API_KEY=your-api-key (optional)

# Start the server
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.local.example .env.local   # Windows
# cp .env.local.example .env.local   # Mac/Linux

# Edit .env.local:
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Reference

### Authentication

#### `POST /auth/google`
Exchange a Google ID token for an app JWT.

```json
Request:
{ "id_token": "google-credential-string" }

Response:
{ "access_token": "eyJ...", "token_type": "bearer" }
```

---

### Todos

All todo endpoints require: `Authorization: Bearer <token>`

#### `GET /todos/`
Returns all todos for the authenticated user, newest first.

#### `POST /todos/`
```json
Request:
{
  "title": "Study algorithms",
  "description": "Focus on graphs and DP",
  "priority": "high"
}
```

#### `PUT /todos/{id}`
All fields are optional — only provided fields are updated.
```json
{
  "status": "completed",
  "priority": "low"
}
```

#### `DELETE /todos/{id}`
Returns HTTP 204. No body.

---

### AI

#### `POST /ai/breakdown`
```json
Request:  { "title": "Prepare for technical interview" }
Response: { "subtasks": ["Review data structures", "Solve 5 LeetCode problems", ...] }
```

#### `POST /ai/suggest-title`
```json
Request:  { "rough_input": "need to finish the report for the client meeting tmrw" }
Response: { "suggested_title": "Finalize client meeting report" }
```

---

## How Auth Works

```
Browser → Google Sign-In → Google returns ID token
Frontend → POST /auth/google with ID token
Backend → verifies token with Google's public keys
Backend → upserts user in DB → issues JWT
Frontend → stores JWT → uses it for all API calls
```

Full technical breakdown in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Random 32-byte hex string for JWT signing |
| `GOOGLE_CLIENT_ID` | ✅ | From Google Cloud Console |
| `GEMINI_API_KEY` | ❌ | From Google AI Studio. AI features disabled if missing |
| `DATABASE_URL` | ❌ | Defaults to `sqlite:///./ai_todo.db` |
| `FRONTEND_URL` | ❌ | Defaults to `http://localhost:3000` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | Defaults to 10080 (7 days) |

### Frontend (`.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ | Same client ID as backend |
| `NEXT_PUBLIC_API_URL` | ❌ | Defaults to `http://localhost:8000` |

---

## Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. New **Web Service** → root dir: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Import GitHub repo to Vercel
2. Root directory: `frontend`
3. Framework preset: Next.js
4. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_API_URL` in Vercel env vars
5. Update `FRONTEND_URL` in backend env to your Vercel URL

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a full explanation of:
- Every library choice and why
- The auth flow in detail
- Database design decisions
- AI integration and prompt engineering
- Security considerations
- How to switch from SQLite to PostgreSQL
