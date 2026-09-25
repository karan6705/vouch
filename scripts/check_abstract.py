from __future__ import annotations

import re
from pathlib import Path


text = Path("submission/abstract.md").read_text(encoding="utf-8")
words = re.findall(r"\b[\w'-]+\b", text)
count = len(words)
print(f"Abstract word count: {count}")
if count > 500:
    raise SystemExit("Abstract exceeds 500 words")

