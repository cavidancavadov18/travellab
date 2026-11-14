"""Download Travellab.az visual assets into frontend/public/images."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "frontend" / "public" / "images"
TOURS_JSON = Path(
    r"C:\Users\Cavadov\.cursor\projects\c-Users-Cavadov-Desktop-travellab\agent-tools\e06e292d-c179-49a3-9c1e-a0f5c01d6084.txt"
)

STATIC = [
    ("hero/mosque.jpg", "https://www.travellab.az/images/hero/mosque-og.jpg"),
    ("hero/balloons.jpg", "https://www.travellab.az/images/hero/balloons.jpg"),
    ("hotels/hero-pool.jpg", "https://www.travellab.az/images/hotels/hero-pool.jpg"),
    ("hotels/hero-room.jpg", "https://www.travellab.az/images/hotels/hero-room.jpg"),
    ("shop/lifestyle-bottle.jpg", "https://www.travellab.az/images/shop/lifestyle-bottle.jpg"),
    ("shop/lifestyle-woman.jpg", "https://www.travellab.az/images/shop/lifestyle-woman.jpg"),
    ("shop/lifestyle-man.jpg", "https://www.travellab.az/images/shop/lifestyle-man.jpg"),
    ("shop/products/TB-001-1.png", "https://www.travellab.az/images/shop/products/TB-001-1.png"),
    ("shop/products/TB-002-1.png", "https://www.travellab.az/images/shop/products/TB-002-1.png"),
    ("shop/products/TB-003-1.png", "https://www.travellab.az/images/shop/products/TB-003-1.png"),
    ("shop/products/TB-004-1.jpg", "https://www.travellab.az/images/shop/products/TB-004-1.jpg"),
    ("shop/products/TB-005-1.jpg", "https://www.travellab.az/images/shop/products/TB-005-1.jpg"),
    ("shop/products/TB-017-1.jpg", "https://www.travellab.az/images/shop/products/TB-017-1.jpg"),
    ("partners/aztaa-logo.jpeg", "https://www.travellab.az/images/partners/aztaa-logo.jpeg"),
    ("about/travellab-qarabagda.jpg", "https://www.travellab.az/images/about/events/travellab-qarabagda.jpg"),
    ("stories/shop-001.jpg", "https://www.travellab.az/stories/shop/001.jpg"),
    ("stories/labpoint-001.jpg", "https://www.travellab.az/stories/labpoint/001.jpg"),
    ("stories/reviews-001.jpg", "https://www.travellab.az/stories/reyler/001.jpg"),
    ("stories/visa-002.jpg", "https://www.travellab.az/stories/viza/002.jpg"),
    ("brand/favicon.svg", "https://www.travellab.az/favicon.svg?v=2"),
    ("brand/apple-touch-icon.png", "https://www.travellab.az/apple-touch-icon.png?v=2"),
    ("brand/favicon-32.png", "https://www.travellab.az/favicon-32x32.png?v=2"),
    ("brand/favicon-16.png", "https://www.travellab.az/favicon-16x16.png?v=2"),
    ("stories/backend-18063878738792221.jpg", "https://backend.travellab-point.az/site-backend/v1/tours/stories/18063878738792221/image"),
    ("stories/backend-17976990192141140.jpg", "https://backend.travellab-point.az/site-backend/v1/tours/stories/17976990192141140/image"),
]

# Map destination keywords -> local slug used by our seed
DEST_RULES = [
    ("maldives", ("maldiv", "maldives")),
    ("newyork", ("new york", "newyork", "york")),
    ("phuket", ("phuket",)),
    ("istanbul", ("istanbul", "uluda")),
    ("singapore", ("sinqapur", "singapore", "malayziya", "kuala")),
    ("colombia", ("amerik", "kolumbi", "colombia")),
    ("italy", ("itali", "roma", "milan", "lugano")),
    ("korea", ("koreya", "seul", "busan", "korea")),
    ("thailand", ("tayland", "thailand", "banqkok", "bangkok", "bruno")),
    ("vienna", ("vyana", "praqa", "vienna", "prague")),
    ("belgrade", ("belqrad", "belgrade")),
    ("tbilisi", ("tbilisi", "gürc", "georgia")),
    ("oslo", ("oslo", "stokholm", "stockholm")),
    ("london", ("ingiltərə", "london", "İngiltərə".lower())),
    ("china", ("çin", "china")),
    ("dubai", ("dubai", "dubay")),
    ("paris", ("paris",)),
    ("bali", ("bali",)),
    ("tokyo", ("tokyo", "yapon")),
    ("rome", ("rome",)),
    ("seoul", ("seoul",)),
]


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text.strip().lower())
    return text[:80] or "tour"


def download(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        print(f"SKIP {dest.relative_to(OUT)}")
        return True
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) TravellabAssetFetcher/1.0",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            "Referer": "https://www.travellab.az/",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
            ctype = (resp.headers.get("Content-Type") or "").lower()
        if "text/html" in ctype or len(data) < 500:
            print(f"BAD  {url} ({ctype} {len(data)})")
            return False
        dest.write_bytes(data)
        print(f"OK   {dest.relative_to(OUT)} ({len(data)} bytes)")
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"FAIL {url} -> {exc}")
        return False


def optimize_jpeg_png(path: Path) -> None:
    try:
        from PIL import Image  # type: ignore
    except ImportError:
        return
    if path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
        return
    try:
        with Image.open(path) as im:
            im = im.convert("RGB") if path.suffix.lower() in {".jpg", ".jpeg"} and im.mode not in ("RGB", "L") else im
            # Cap very large assets while keeping quality
            max_side = 2200 if "hero" in path.as_posix() or "tours" in path.as_posix() else 1600
            w, h = im.size
            if max(w, h) > max_side:
                im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
            if path.suffix.lower() in {".jpg", ".jpeg"}:
                im.save(path, format="JPEG", quality=88, optimize=True, progressive=True)
            elif path.suffix.lower() == ".png":
                im.save(path, format="PNG", optimize=True)
            elif path.suffix.lower() == ".webp":
                # Convert webp downloads to jpg for broader compatibility
                jpg = path.with_suffix(".jpg")
                im.convert("RGB").save(jpg, format="JPEG", quality=88, optimize=True, progressive=True)
                if jpg != path:
                    path.unlink(missing_ok=True)
    except Exception as exc:  # noqa: BLE001
        print(f"OPT-SKIP {path.name}: {exc}")


def match_dest(title: str) -> str | None:
    t = title.lower()
    for slug, keys in DEST_RULES:
        if any(k.lower() in t for k in keys):
            return slug
    return None


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    ok = 0
    for rel, url in STATIC:
        if download(url, OUT / rel):
            ok += 1
            optimize_jpeg_png(OUT / rel)

    tours = json.loads(TOURS_JSON.read_text(encoding="utf-8"))
    dest_hits: dict[str, str] = {}
    for i, tour in enumerate(tours):
        title = tour.get("title") or f"tour-{i}"
        image = tour.get("imageUrl") or (tour.get("images") or [None])[0]
        if not image:
            continue
        safe = slugify(title)
        dest_file = OUT / "tours" / f"{i:02d}-{safe}.jpg"
        if download(image, dest_file):
            ok += 1
            optimize_jpeg_png(dest_file)
            # Prefer first matched destination image
            dest = match_dest(title)
            if dest and dest not in dest_hits and dest_file.exists():
                dest_hits[dest] = dest_file.name
                # also copy/symlink-like copy under destinations/
                target = OUT / "destinations" / f"{dest}.jpg"
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(dest_file.read_bytes())
                print(f"MAP  {dest} <- {dest_file.name}")

    # Manifest for seed + frontend
    manifest = {
        "static": {rel: f"/images/{rel}" for rel, _ in STATIC},
        "destinations": {k: f"/images/destinations/{k}.jpg" for k in dest_hits},
        "tours": sorted(str(p.relative_to(OUT)).replace("\\", "/") for p in (OUT / "tours").glob("*.jpg")),
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Done. Downloaded/kept ~{ok} files. Dest maps: {list(dest_hits)}")


if __name__ == "__main__":
    main()
