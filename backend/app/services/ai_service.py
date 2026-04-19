from typing import Optional
from groq import Groq
from app.core.config import settings

GROQ_MODEL = "llama-3.3-70b-versatile"


def _get_client() -> Optional[Groq]:
    if not settings.GROQ_API_KEY:
        return None
    return Groq(api_key=settings.GROQ_API_KEY)


def breakdown_task(title: str) -> list[str]:
    client = _get_client()
    if not client:
        return []

    prompt = (
        f"Break down this task into 3-5 clear, actionable subtasks. "
        f"Return ONLY a plain numbered list, one subtask per line, no extra text.\n\n"
        f"Task: {title}"
    )

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300,
    )

    lines = response.choices[0].message.content.strip().split("\n")
    subtasks = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        cleaned = line.lstrip("0123456789.-) ").strip()
        if cleaned:
            subtasks.append(cleaned)
    return subtasks[:5]


def suggest_title(rough_input: str) -> str:
    client = _get_client()
    if not client:
        return rough_input

    prompt = (
        f"Convert this rough task description into a clean, concise task title "
        f"(5-8 words max). Return ONLY the title, nothing else.\n\n"
        f"Input: {rough_input}"
    )

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=50,
    )

    return response.choices[0].message.content.strip().strip('"').strip("'")

