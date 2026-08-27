#!/usr/bin/env python3
"""Render FunIQ OG image (1200x630) from data/leaderboard.json."""
from __future__ import annotations

import json
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("og.py skip: pillow missing")
    raise SystemExit(0)

ROOT = Path(__file__).resolve().parents[1]
BOARD = ROOT / "data" / "leaderboard.json"
OUTS = [
    ROOT / "public" / "og.png",
    ROOT / "app" / "opengraph-image.png",
    ROOT / "app" / "twitter-image.png",
]
META = ROOT / "data" / "og-meta.json"

W, H = 1200, 630
BG = (9, 11, 15)
GOLD = (228, 195, 106)
GOLD2 = (201, 164, 74)
CREAM = (243, 234, 210)
CREAM_DIM = (207, 198, 174)
MUTED = (142, 135, 120)
CARD = (22, 25, 34)
LINE = (40, 44, 54)
RANK_COLORS = [(228, 195, 106), (200, 205, 214), (201, 137, 90)]

BOLD = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
REG = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
KR = 1


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    if not Path(path).exists():
        print("og.py skip: font missing")
        raise SystemExit(0)
    return ImageFont.truetype(path, size, index=KR)


def rank_key(r: dict):
    refusals = r.get("refusals") or 0
    total = r.get("total") or 0
    fully_refused = refusals >= total and total > 0
    return (
        fully_refused,
        -(r.get("ai_iq") or 0),
        -(r.get("accuracy") or 0),
        r.get("format_failures") or 0,
        r.get("avg_ms") or 0,
        str(r.get("id") or ""),
    )


def load_top3():
    board = json.loads(BOARD.read_text())
    results = sorted(board.get("results") or [], key=rank_key)
    return [r for r in results if not ((r.get("refusals") or 0) >= (r.get("total") or 1) and (r.get("total") or 0) > 0)][:3]


def draw_grid(img: Image.Image) -> None:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for x in range(0, W, 28):
        d.line((x, 0, x, H), fill=(243, 234, 210, 10), width=1)
    for y in range(0, H, 28):
        d.line((0, y, W, y), fill=(243, 234, 210, 10), width=1)
    img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))


def text(d, xy, s, f, fill, anchor="lt"):
    d.text(xy, s, font=f, fill=fill, anchor=anchor)


def main() -> None:
    top = load_top3()
    img = Image.new("RGB", (W, H), BG)
    draw_grid(img)
    d = ImageDraw.Draw(img)

    title = font(BOLD, 54)
    sub = font(BOLD, 22)
    name_f = font(BOLD, 32)
    meta_f = font(REG, 18)
    iq_f = font(BOLD, 48)
    rank_f = font(BOLD, 28)
    small = font(REG, 16)

    text(d, (64, 42), "FunIQ", title, CREAM)
    text(d, (64, 108), "행렬을 푸는 재미 IQ", sub, GOLD)
    text(d, (W - 64, 52), "AI IQ 리더보드", meta_f, MUTED, anchor="rt")
    n = (json.loads(BOARD.read_text()) or {}).get("items") or 168
    text(d, (W - 64, 82), f"{n}문항", small, MUTED, anchor="rt")

    y0 = 168
    row_h = 118
    for i, r in enumerate(top):
        y = y0 + i * row_h
        d.rounded_rectangle((48, y, W - 48, y + 102), radius=18, fill=CARD, outline=LINE, width=1)
        cx, cy = 96, y + 51
        d.ellipse((cx - 28, cy - 28, cx + 28, cy + 28), fill=RANK_COLORS[i])
        text(d, (cx, cy + 1), str(i + 1), rank_f, (18, 20, 27), anchor="mm")
        name = r.get("name") or r.get("id") or ""
        provider = r.get("provider") or ""
        correct = r.get("correct")
        total = r.get("total") or 0
        text(d, (148, y + 22), name, name_f, CREAM)
        text(d, (148, y + 64), f"{provider}  ·  {correct}/{total}", meta_f, MUTED)
        iq = r.get("ai_iq")
        text(d, (W - 78, y + 28), str(iq), iq_f, GOLD, anchor="rt")
        text(d, (W - 78, y + 76), "AI IQ", small, MUTED, anchor="rt")

    if not top:
        text(d, (W // 2, H // 2), "아직 리더보드가 비어 있습니다", sub, MUTED, anchor="mm")

    text(d, (64, H - 36), "사람의 IQ가 아닙니다. 재미용 벤치마크.", small, MUTED)
    text(d, (W - 64, H - 36), "llm-fun-iq.vercel.app", small, GOLD2, anchor="rt")

    (ROOT / "public").mkdir(exist_ok=True)
    (ROOT / "app").mkdir(exist_ok=True)
    for p in OUTS:
        img.save(p, "PNG", optimize=True)

    bits = [f"{i+1}위 {r.get('name')} {r.get('ai_iq')}" for i, r in enumerate(top)]
    desc = (
        " · ".join(bits) + ". 같은 문항, 같은 규칙. 재미로 환산한 AI IQ."
        if bits
        else "같은 문항. 같은 규칙. 재미로 환산한 AI IQ."
    )
    META.write_text(
        json.dumps(
            {
                "title": "FunIQ — 재미로 환산한 AI IQ",
                "description": desc,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n"
    )
    print("og wrote", ",".join(str(p.relative_to(ROOT)) for p in OUTS))
    print("top", " | ".join(bits) or "(none)")


if __name__ == "__main__":
    main()
