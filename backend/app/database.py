import sqlite3
import bcrypt
import os
import sys
from contextlib import contextmanager
from pathlib import Path

def _get_persistent_data_dir() -> Path:
    if sys.platform.startswith("win"):
        base = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))

    # Keep the folder name stable; changing it will create a new empty DB.
    return base / "CSD-Feedback-Application"


if getattr(sys, "frozen", False):
    DATA_DIR = _get_persistent_data_dir()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DB_PATH = str(DATA_DIR / "store.db")
    IMAGES_DIR = str(DATA_DIR / "images")
else:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(_file_)))
    DB_PATH = os.path.join(BASE_DIR, "backend", "app", "store.db")
    IMAGES_DIR = os.path.join(BASE_DIR, "backend", "images")


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database():
    os.makedirs(IMAGES_DIR, exist_ok=True)

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                password_hash TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY,
                name TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                code TEXT UNIQUE,
                name TEXT,
                category TEXT,
                image_path TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS demands (
                id INTEGER PRIMARY KEY,
                category TEXT,
                product_name TEXT,
                new_description TEXT,
                quantity INTEGER,
                required_by TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Pending'
            )
        """)

        try:
            cursor.execute("ALTER TABLE demands ADD COLUMN quantity INTEGER")
        except sqlite3.OperationalError:
            pass

        try:
            cursor.execute("ALTER TABLE demands ADD COLUMN required_by TEXT")
        except sqlite3.OperationalError:
            pass

        try:
            cursor.execute("ALTER TABLE demands ADD COLUMN name TEXT")
        except sqlite3.OperationalError:
            pass

        try:
            cursor.execute("ALTER TABLE demands ADD COLUMN contact_number TEXT")
        except sqlite3.OperationalError:
            pass

        try:
            cursor.execute("ALTER TABLE demands ADD COLUMN product_code TEXT")
        except sqlite3.OperationalError:
            pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY,
                rating INTEGER,
                text TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        seed_admin(cursor)
        seed_sample_categories(conn)


def seed_admin(cursor):
    cursor.execute("SELECT COUNT(*) FROM admins WHERE username = ?", ("admin",))
    if cursor.fetchone()[0] == 0:
        password_hash = bcrypt.hashpw(
            "password".encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        cursor.execute(
            "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
            ("admin", password_hash),
        )


def seed_sample_categories(conn):
    cursor = conn.cursor()

    # Check if categories already exist
    cursor.execute("SELECT COUNT(*) FROM categories")
    if cursor.fetchone()[0] > 0:
        return

    # Add sample categories
    sample_categories = [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports & Outdoors",
        "Books & Media",
        "Toys & Games",
        "Food & Beverages",
        "Health & Beauty",
    ]

    for category in sample_categories:
        cursor.execute("INSERT INTO categories (name) VALUES (?)", (category,))


def verify_admin(username, password):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT password_hash FROM admins WHERE username = ?", (username,)
        )
        row = cursor.fetchone()
        if row:
            return bcrypt.checkpw(
                password.encode("utf-8"), row["password_hash"].encode("utf-8")
            )
        return False