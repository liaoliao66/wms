# -*- coding: utf-8 -*-
"""Regenerate prototype/versions/*/pages/prd-content.js from docs/versions/*/prd.md"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERSIONS = ("v1.0.0", "v1.0.1", "v1.1.0", "v1.2.0")


def main() -> None:
    for ver in VERSIONS:
        md_path = ROOT / "docs" / "versions" / ver / "prd.md"
        out_path = ROOT / "prototype" / "versions" / ver / "pages" / "prd-content.js"
        if not md_path.exists():
            print(f"SKIP missing {md_path}")
            continue
        md = md_path.read_text(encoding="utf-8")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        js = "window.__WMS_PRD_MARKDOWN__ = " + json.dumps(md, ensure_ascii=False) + ";\n"
        out_path.write_text(js, encoding="utf-8")
        print(f"OK {ver}: md={len(md)} bytes js={out_path.stat().st_size}")


if __name__ == "__main__":
    main()
