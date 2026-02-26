-- 001_init.sql
-- Purpose:
--   Initializes the SQLite schema for the Animal Shelter Adoption Portal (dog-only).
--   Creates tables, constraints, indexes, and lightweight triggers for updated_at.
--
-- How it's used:
--   The seed script (db/seeds/seed.py) applies migrations in db/migrations/ in filename order.
--   Applied migrations are tracked in schema_migrations.
--
-- Notes:
--   - Valid pet statuses: AVAILABLE -> PENDING -> ADOPTED
--   - Valid application statuses: SUBMITTED -> APPROVED, and others become INVALIDATED
--   - Approvals should be implemented transactionally in the backend. This schema includes a
--     partial unique index to ensure at most one APPROVED application per pet.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL UNIQUE,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years INTEGER NOT NULL CHECK (age_years >= 0 AND age_years <= 30),
  status TEXT NOT NULL CHECK (status IN ('AVAILABLE','PENDING','ADOPTED')),
  image_url TEXT NOT NULL,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_breed ON pets(breed);

CREATE TRIGGER IF NOT EXISTS trg_pets_updated_at
AFTER UPDATE ON pets
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE pets
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,

  applicant_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  reason TEXT NOT NULL,

  status TEXT NOT NULL CHECK (status IN ('SUBMITTED','APPROVED','INVALIDATED')),

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_applications_pet_id ON applications(pet_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_pet_status ON applications(pet_id, status);

-- Enforce: at most one approved application per pet.
CREATE UNIQUE INDEX IF NOT EXISTS ux_applications_pet_approved
ON applications(pet_id)
WHERE status = 'APPROVED';

CREATE TRIGGER IF NOT EXISTS trg_applications_updated_at
AFTER UPDATE ON applications
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE applications
  SET updated_at = datetime('now')
  WHERE id = NEW.id;
END;