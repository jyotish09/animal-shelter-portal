"""db/seeds/seed.py

Purpose
-------
Seed the local SQLite database with dog-only pet data (Dog CEO) and sample adoption applications.

What it does
------------
1) Applies SQL migrations from db/migrations/ (tracks applied files in schema_migrations).
2) Optionally resets tables (pets, applications) for repeatable seeding.
3) Fetches breed list from Dog CEO.
4) Inserts a configured number of pets with:
   - name (from config pool)
   - breed (e.g., "hound" or "spaniel/cocker" for sub-breeds)
   - age_years (random range)
   - status (AVAILABLE/PENDING/ADOPTED distribution)
   - image_url (Dog CEO breed image endpoint)
5) For PENDING pets, inserts multiple SUBMITTED applications to demonstrate admin approval flow.

How to run
----------
From repo root:

  python db/seeds/seed.py

Optional flags:

  python db/seeds/seed.py --config db/seeds/seed_config.json
  python db/seeds/seed.py --db db/shelter.sqlite
  python db/seeds/seed.py --no-reset

Dependencies
------------
Python stdlib only (sqlite3, json, urllib). No pip installs required.

Notes / gotchas
---------------
- Dog CEO provides sub-breeds. We store them as "breed/subbreed" so the backend/UI can
  reconstruct the correct image endpoint or display a friendly label later.
- Dog CEO is used only for seeding; the runtime backend should read from SQLite only.
"""

from __future__ import annotations

import argparse
import json
import random
import sqlite3
import sys
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Tuple
from urllib.request import urlopen, Request


# ---------------------------
# HTTP helpers (stdlib only)
# ---------------------------

def http_get_json(url: str, timeout_s: int = 20) -> Dict[str, Any]:
    req = Request(url, headers={"User-Agent": "animal-shelter-seeder/1.0"})
    with urlopen(req, timeout=timeout_s) as resp:
        data = resp.read().decode("utf-8")
    return json.loads(data)


# ---------------------------
# Migrations
# ---------------------------

def ensure_db_dir(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)


def connect(db_path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def apply_migrations(conn: sqlite3.Connection, migrations_dir: Path) -> None:
    migrations_dir = migrations_dir.resolve()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS schema_migrations (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               filename TEXT NOT NULL UNIQUE,
               applied_at TEXT NOT NULL DEFAULT (datetime('now'))
             );"""
    )

    applied = {
        row["filename"]
        for row in conn.execute("SELECT filename FROM schema_migrations").fetchall()
    }

    sql_files = sorted([p for p in migrations_dir.glob("*.sql") if p.is_file()])
    for f in sql_files:
        if f.name in applied:
            continue
        sql = f.read_text(encoding="utf-8")
        conn.executescript(sql)
        conn.execute("INSERT INTO schema_migrations(filename) VALUES (?)", (f.name,))
        conn.commit()
        print(f"[migrate] applied {f.name}")


# ---------------------------
# Seeding
# ---------------------------

DOG_STATUS = ("AVAILABLE", "PENDING", "ADOPTED")
APP_STATUS = ("SUBMITTED", "APPROVED", "INVALIDATED")


def flatten_breeds(breeds_payload: Dict[str, Any]) -> List[str]:
    """Convert Dog CEO /breeds/list/all response into a flat list.

    Returns breed identifiers suitable for the image endpoint:
      - "hound"
      - "spaniel/cocker" (breed/subbreed)
    """
    message = breeds_payload.get("message", {})
    out: List[str] = []
    for breed, subs in message.items():
        if not subs:
            out.append(breed)
        else:
            for sub in subs:
                out.append(f"{breed}/{sub}")
    return out


def dog_image_url(api_base: str, breed_id: str) -> str:
    """Get a random image URL for the given breed_id."""
    if "/" in breed_id:
        breed, sub = breed_id.split("/", 1)
        url = f"{api_base}/breed/{breed}/{sub}/images/random"
    else:
        url = f"{api_base}/breed/{breed_id}/images/random"
    payload = http_get_json(url)
    if payload.get("status") != "success":
        raise RuntimeError(f"Dog CEO error for {breed_id}: {payload}")
    return payload["message"]


def make_status_list(status_counts: Dict[str, int], total: int) -> List[str]:
    statuses: List[str] = []
    for k, v in status_counts.items():
        if k not in DOG_STATUS:
            raise ValueError(f"Invalid pet status in config: {k}")
        if v < 0:
            raise ValueError(f"Negative count for status {k}")
        statuses.extend([k] * v)

    if len(statuses) != total:
        raise ValueError(
            f"pets.total ({total}) must equal sum(status_counts) ({len(statuses)})"
        )

    random.shuffle(statuses)
    return statuses


def rand_phone_au() -> str:
    digits = [str(random.randint(0, 9)) for _ in range(9)]
    return f"+61 4{digits[0]}{digits[1]} {digits[2]}{digits[3]}{digits[4]} {digits[5]}{digits[6]}{digits[7]}{digits[8]}"


def rand_email(full_name: str) -> str:
    parts = full_name.lower().split()
    first = parts[0]
    last = parts[-1] if len(parts) > 1 else "user"
    n = random.randint(1, 9999)
    return f"{first}.{last}{n}@example.com"


def reset_tables(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM applications;")
    conn.execute("DELETE FROM pets;")
    conn.commit()


def seed_pets(conn: sqlite3.Connection, cfg: Dict[str, Any]) -> None:
    api_base = cfg["dog_api_base_url"].rstrip("/")
    pets_cfg = cfg["pets"]
    total = int(pets_cfg["total"])
    statuses = make_status_list(pets_cfg["status_counts"], total)

    breed_payload = http_get_json(f"{api_base}/breeds/list/all")
    all_breeds = flatten_breeds(breed_payload)
    if not all_breeds:
        raise RuntimeError("No breeds returned by Dog CEO.")

    names = list(pets_cfg.get("name_pool", [])) or ["Buddy", "Bella", "Max", "Daisy"]

    age_min = int(pets_cfg["age_years_min"])
    age_max = int(pets_cfg["age_years_max"])
    if age_min > age_max:
        raise ValueError("age_years_min must be <= age_years_max")

    chosen_breeds = [random.choice(all_breeds) for _ in range(total)]

    pets_to_insert: List[Tuple[str, str, str, int, str, str]] = []
    for i in range(total):
        pet_id = str(uuid.uuid4())
        name = random.choice(names)
        breed = chosen_breeds[i]
        age_years = random.randint(age_min, age_max)
        status = statuses[i]
        image_url = dog_image_url(api_base, breed)

        pets_to_insert.append((pet_id, name, breed, age_years, status, image_url))
        time.sleep(0.05)

    conn.executemany(
        """INSERT INTO pets(id, name, breed, age_years, status, image_url)
           VALUES (?, ?, ?, ?, ?, ?);""",
        pets_to_insert,
    )
    conn.commit()

    count = conn.execute("SELECT COUNT(*) AS c FROM pets;").fetchone()["c"]
    print(f"[seed] inserted pets: {count}")


def seed_applications(conn: sqlite3.Connection, cfg: Dict[str, Any]) -> None:
    apps_cfg = cfg.get("applications", {})
    if not apps_cfg.get("enabled", True):
        print("[seed] applications disabled")
        return

    pending_pets = conn.execute(
        "SELECT id FROM pets WHERE status = 'PENDING' ORDER BY created_at ASC;"
    ).fetchall()

    if not pending_pets:
        print("[seed] no pending pets; skipping applications")
        return

    per_min = int(apps_cfg.get("per_pending_pet_min", 2))
    per_max = int(apps_cfg.get("per_pending_pet_max", 4))
    if per_min > per_max:
        raise ValueError("per_pending_pet_min must be <= per_pending_pet_max")

    applicant_names = list(apps_cfg.get("applicant_name_pool", [])) or ["Alex Nguyen"]
    reasons = list(apps_cfg.get("reason_pool", [])) or ["I can provide a loving home."]

    applications_to_insert: List[Tuple[str, str, str, str, str, str]] = []
    for row in pending_pets:
        pet_id = row["id"]
        n = random.randint(per_min, per_max)
        for _ in range(n):
            app_id = str(uuid.uuid4())
            applicant_name = random.choice(applicant_names)

            if random.random() < 0.6:
                contact = rand_email(applicant_name)
            else:
                contact = rand_phone_au()

            reason = random.choice(reasons)
            status = "SUBMITTED"
            applications_to_insert.append(
                (app_id, pet_id, applicant_name, contact, reason, status)
            )

    conn.executemany(
        """INSERT INTO applications(id, pet_id, applicant_name, contact, reason, status)
           VALUES (?, ?, ?, ?, ?, ?);""",
        applications_to_insert,
    )
    conn.commit()

    count = conn.execute("SELECT COUNT(*) AS c FROM applications;").fetchone()["c"]
    print(f"[seed] inserted applications: {count}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed SQLite DB for animal shelter portal.")
    parser.add_argument(
        "--config",
        default=str(Path(__file__).with_name("seed_config.json")),
        help="Path to seed_config.json",
    )
    parser.add_argument(
        "--db",
        default=None,
        help="Override database path (otherwise uses config db_path)",
    )
    parser.add_argument(
        "--no-reset",
        action="store_true",
        help="Do not wipe existing pets/applications before seeding",
    )
    args = parser.parse_args()

    config_path = Path(args.config).resolve()
    if not config_path.exists():
        print(f"Config not found: {config_path}", file=sys.stderr)
        return 2

    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    random.seed(cfg.get("random_seed", 42))

    if args.db:
        db_path = Path(args.db)
    else:
        db_path = (config_path.parent / cfg.get("db_path", "../shelter.sqlite"))

    db_path = db_path.resolve()
    ensure_db_dir(db_path)

    migrations_dir = (config_path.parent.parent / "migrations").resolve()

    conn = connect(db_path)
    try:
        apply_migrations(conn, migrations_dir)

        if cfg.get("reset", True) and not args.no_reset:
            reset_tables(conn)
            print("[seed] reset tables")

        seed_pets(conn, cfg)
        seed_applications(conn, cfg)

        print(f"[done] db: {db_path}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())