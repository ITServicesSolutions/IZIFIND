"""
Comprehensive test suite for the IZIFIND API.

Uses an in-memory SQLite database isolated from production.
Covers: registration, uniqueness, login (username/email/phone),
Google SSO (mocked), testimonials, public endpoint restrictions,
and seed idempotency.
"""
import os
import sys
from datetime import date
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ── Setup path & in-memory database ──────────────────────────

# Ensure the project root is on sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# We MUST set env vars before importing any app module that reads settings
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-only")
os.environ.setdefault("DATABASE_ENGINE", "sqlite")
os.environ.setdefault("DATABASE_NAME", ":memory:")

from app.database import Base, get_db
from app.main import app
from app.models.auth import User, Role, Permission
from app.models.objets import (
    Categorie, Couleur, Commissariat, Marque, Objet, SousCategorie,
    Statut, Temoignage, TitreObjet,
)
from app.security import get_password_hash

# ── Isolated test database ───────────────────────────────────

TEST_ENGINE = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=TEST_ENGINE
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# ── Fixtures ─────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_database():
    """Recreate all tables before every test for full isolation."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def seed_statuts(db_session):
    """Insert the three reference statuts."""
    statuts = {}
    for name in ("PERDU", "TRANSMIS", "TROUVE"):
        s = Statut(name=name, description=f"Statut {name}")
        db_session.add(s)
        db_session.flush()
        statuts[name] = s
    db_session.commit()
    return statuts


@pytest.fixture()
def seed_references(db_session, seed_statuts):
    """Insert minimal reference data (categories, couleurs)."""
    cat = Categorie(name="Electronique", description="Catégorie test")
    db_session.add(cat)
    db_session.flush()
    couleur = Couleur(name="Noir")
    db_session.add(couleur)
    db_session.flush()
    db_session.commit()
    return {"categorie": cat, "couleur": couleur, "statuts": seed_statuts}


def _register_user(username="testuser", email="test@example.com", password="testpass123", phone=None):
    payload = {
        "username": username,
        "email": email,
        "password": password,
    }
    if phone is not None:
        payload["phone"] = phone
    return client.post("/api/auth/register", json=payload)


def _login_user(identifier: str, password: str):
    return client.post(
        "/api/auth/login",
        data={"username": identifier, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )


def _get_auth_header(token: str):
    return {"Authorization": f"Bearer {token}"}


# ══════════════════════════════════════════════════════════════
#  1. USER REGISTRATION
# ══════════════════════════════════════════════════════════════

class TestRegistration:
    def test_register_basic(self):
        res = _register_user()
        assert res.status_code == 200
        data = res.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_register_with_phone(self):
        res = _register_user(phone="+33612345678")
        assert res.status_code == 200
        assert res.json()["phone"] == "+33612345678"

    def test_register_duplicate_username(self):
        _register_user(username="dup", email="a@example.com")
        res = _register_user(username="dup", email="b@example.com")
        assert res.status_code == 400
        assert "Username already taken" in res.json()["detail"]

    def test_register_duplicate_email(self):
        _register_user(username="u1", email="same@example.com")
        res = _register_user(username="u2", email="same@example.com")
        assert res.status_code == 400
        assert "Email already taken" in res.json()["detail"]

    def test_register_duplicate_phone(self):
        _register_user(username="p1", email="p1@example.com", phone="+33600000000")
        res = _register_user(username="p2", email="p2@example.com", phone="+33600000000")
        assert res.status_code == 400
        assert "Phone already taken" in res.json()["detail"]


# ══════════════════════════════════════════════════════════════
#  2. LOGIN (username / email / phone)
# ══════════════════════════════════════════════════════════════

class TestLogin:
    def test_login_by_username(self):
        _register_user(username="alice", email="alice@example.com", password="pass1234")
        res = _login_user("alice", "pass1234")
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_by_email(self):
        _register_user(username="bob", email="bob@example.com", password="pass1234")
        res = _login_user("bob@example.com", "pass1234")
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_by_phone(self):
        _register_user(username="charlie", email="charlie@example.com", password="pass1234", phone="+33601020304")
        res = _login_user("+33601020304", "pass1234")
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self):
        _register_user(username="eve", email="eve@example.com", password="correct")
        res = _login_user("eve", "wrong")
        assert res.status_code == 400

    def test_login_nonexistent_user(self):
        res = _login_user("nobody", "anything")
        assert res.status_code == 400


# ══════════════════════════════════════════════════════════════
#  3. GOOGLE SSO (mocked)
# ══════════════════════════════════════════════════════════════

class TestGoogleSSO:
    """Mock google.oauth2.id_token.verify_oauth2_token to test the endpoint logic."""

    @patch("app.routers.auth.settings")
    @patch("app.routers.auth.google_id_token.verify_oauth2_token")
    def test_google_login_creates_user(self, mock_verify, mock_settings):
        mock_settings.GOOGLE_CLIENT_ID = "fake-client-id"
        # Copy all other required attributes from the real settings
        from app.config import settings as real_settings
        mock_settings.SECRET_KEY = real_settings.SECRET_KEY
        mock_settings.ALGORITHM = real_settings.ALGORITHM
        mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = real_settings.ACCESS_TOKEN_EXPIRE_MINUTES

        mock_verify.return_value = {
            "email": "google-user@gmail.com",
            "email_verified": True,
            "name": "Google User",
        }
        res = client.post("/api/auth/google", json={"id_token": "fake-token"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data

    @patch("app.routers.auth.settings")
    @patch("app.routers.auth.google_id_token.verify_oauth2_token")
    def test_google_login_returns_existing_user(self, mock_verify, mock_settings):
        mock_settings.GOOGLE_CLIENT_ID = "fake-client-id"
        from app.config import settings as real_settings
        mock_settings.SECRET_KEY = real_settings.SECRET_KEY
        mock_settings.ALGORITHM = real_settings.ALGORITHM
        mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = real_settings.ACCESS_TOKEN_EXPIRE_MINUTES

        mock_verify.return_value = {
            "email": "existing@gmail.com",
            "email_verified": True,
            "name": "Existing User",
        }
        # First call creates
        r1 = client.post("/api/auth/google", json={"id_token": "tok1"})
        assert r1.status_code == 200
        # Second call finds the same user
        r2 = client.post("/api/auth/google", json={"id_token": "tok2"})
        assert r2.status_code == 200

    @patch("app.routers.auth.settings")
    @patch("app.routers.auth.google_id_token.verify_oauth2_token")
    def test_google_login_invalid_token(self, mock_verify, mock_settings):
        mock_settings.GOOGLE_CLIENT_ID = "fake-client-id"
        mock_verify.side_effect = ValueError("Bad token")
        res = client.post("/api/auth/google", json={"id_token": "bad"})
        assert res.status_code == 400
        assert "Invalid Google token" in res.json()["detail"]

    @patch("app.routers.auth.settings")
    def test_google_login_not_configured(self, mock_settings):
        mock_settings.GOOGLE_CLIENT_ID = ""
        res = client.post("/api/auth/google", json={"id_token": "any"})
        assert res.status_code == 503


# ══════════════════════════════════════════════════════════════
#  4. TESTIMONIALS (rating 1-5, status TROUVE required)
# ══════════════════════════════════════════════════════════════

class TestTemoignages:
    def _create_found_object(self, db_session, statuts):
        obj = Objet(
            description="Objet trouvé test",
            statut_id=statuts["TROUVE"].id,
            date_action=date.today(),
            is_public=True,
        )
        db_session.add(obj)
        db_session.commit()
        db_session.refresh(obj)
        return obj

    def _create_lost_object(self, db_session, statuts):
        obj = Objet(
            description="Objet perdu test",
            statut_id=statuts["PERDU"].id,
            date_action=date.today(),
            is_public=True,
        )
        db_session.add(obj)
        db_session.commit()
        db_session.refresh(obj)
        return obj

    def test_create_temoignage_success(self, db_session, seed_statuts):
        obj = self._create_found_object(db_session, seed_statuts)
        _register_user(username="temoin", email="temoin@test.com", password="testpass1")
        login = _login_user("temoin", "testpass1")
        token = login.json()["access_token"]

        res = client.post(
            "/api/temoignages",
            json={"objet_id": obj.id, "contenu": "Super service!", "rating": 4},
            headers=_get_auth_header(token),
        )
        assert res.status_code == 201
        data = res.json()
        assert data["contenu"] == "Super service!"
        assert data["rating"] == 4

    def test_create_temoignage_invalid_rating_too_high(self, db_session, seed_statuts):
        obj = self._create_found_object(db_session, seed_statuts)
        _register_user(username="temoin2", email="temoin2@test.com", password="testpass1")
        token = _login_user("temoin2", "testpass1").json()["access_token"]

        res = client.post(
            "/api/temoignages",
            json={"objet_id": obj.id, "contenu": "Hmm", "rating": 6},
            headers=_get_auth_header(token),
        )
        assert res.status_code == 422  # Pydantic validation error

    def test_create_temoignage_invalid_rating_too_low(self, db_session, seed_statuts):
        obj = self._create_found_object(db_session, seed_statuts)
        _register_user(username="temoin3", email="temoin3@test.com", password="testpass1")
        token = _login_user("temoin3", "testpass1").json()["access_token"]

        res = client.post(
            "/api/temoignages",
            json={"objet_id": obj.id, "contenu": "Bad", "rating": 0},
            headers=_get_auth_header(token),
        )
        assert res.status_code == 422

    def test_create_temoignage_wrong_status(self, db_session, seed_statuts):
        """Testimonials should only be allowed on TROUVE objects."""
        obj = self._create_lost_object(db_session, seed_statuts)
        _register_user(username="temoin4", email="temoin4@test.com", password="testpass1")
        token = _login_user("temoin4", "testpass1").json()["access_token"]

        res = client.post(
            "/api/temoignages",
            json={"objet_id": obj.id, "contenu": "Perdu...", "rating": 3},
            headers=_get_auth_header(token),
        )
        assert res.status_code == 400
        assert "TROUVE" in res.json()["detail"]

    def test_create_temoignage_requires_auth(self, db_session, seed_statuts):
        obj = self._create_found_object(db_session, seed_statuts)
        res = client.post(
            "/api/temoignages",
            json={"objet_id": obj.id, "contenu": "Anonymous", "rating": 5},
        )
        assert res.status_code == 401

    def test_temoignage_includes_user_info(self, db_session, seed_statuts):
        """The Temoignage response schema should include the user's username."""
        obj = self._create_found_object(db_session, seed_statuts)
        _register_user(username="reviewer", email="reviewer@test.com", password="testpass1")
        token = _login_user("reviewer", "testpass1").json()["access_token"]

        client.post(
            "/api/temoignages",
            json={"objet_id": obj.id, "contenu": "Great!", "rating": 5},
            headers=_get_auth_header(token),
        )

        # Fetch all temoignages and check user field
        res = client.get("/api/temoignages")
        assert res.status_code == 200
        items = res.json()
        assert len(items) >= 1
        latest = items[0]
        assert "user" in latest
        if latest["user"] is not None:
            assert latest["user"]["username"] == "reviewer"


# ══════════════════════════════════════════════════════════════
#  5. PUBLIC /api/objets RESTRICTIONS
# ══════════════════════════════════════════════════════════════

class TestPublicObjets:
    def test_returns_only_public_objects(self, db_session, seed_statuts):
        """Public endpoint should never return is_public=False objects."""
        public_obj = Objet(
            description="Public item",
            statut_id=seed_statuts["PERDU"].id,
            date_action=date.today(),
            is_public=True,
        )
        private_obj = Objet(
            description="Private item",
            statut_id=seed_statuts["PERDU"].id,
            date_action=date.today(),
            is_public=False,
        )
        db_session.add_all([public_obj, private_obj])
        db_session.commit()

        res = client.get("/api/objets")
        assert res.status_code == 200
        descriptions = [o["description"] for o in res.json()]
        assert "Public item" in descriptions
        assert "Private item" not in descriptions

    def test_cannot_override_is_public_filter(self, db_session, seed_statuts):
        """Even passing is_public=False as a query parameter should have no effect."""
        private_obj = Objet(
            description="Hidden item",
            statut_id=seed_statuts["PERDU"].id,
            date_action=date.today(),
            is_public=False,
        )
        db_session.add(private_obj)
        db_session.commit()

        # Try to bypass by passing is_public=false
        res = client.get("/api/objets", params={"is_public": "false"})
        assert res.status_code == 200
        descriptions = [o["description"] for o in res.json()]
        assert "Hidden item" not in descriptions

    def test_sorted_by_date_descending(self, db_session, seed_statuts):
        """Objects should be returned in descending order by date."""
        for i in range(3):
            obj = Objet(
                description=f"Item {i}",
                statut_id=seed_statuts["PERDU"].id,
                date_action=date.today(),
                is_public=True,
            )
            db_session.add(obj)
        db_session.commit()

        res = client.get("/api/objets")
        assert res.status_code == 200
        items = res.json()
        assert len(items) == 3
        # Since they all have the same server-default `date`, check ordering by id desc
        ids = [item["id"] for item in items]
        assert ids == sorted(ids, reverse=True)

    def test_advanced_search_requires_auth(self, db_session, seed_statuts):
        """The advanced search endpoint should require authentication."""
        res = client.get("/api/recherche/avancee")
        assert res.status_code == 401


# ══════════════════════════════════════════════════════════════
#  6. SEED IDEMPOTENCY
# ══════════════════════════════════════════════════════════════

class TestSeedIdempotency:
    def test_seed_runs_twice_without_error(self):
        """Running seed_data() multiple times should not raise integrity errors."""
        from app.seed import seed_data
        # Patch the engine/SessionLocal used by seed to use our test engine
        with patch("app.seed.engine", TEST_ENGINE), \
             patch("app.seed.SessionLocal", TestingSessionLocal):
            seed_data()
            seed_data()  # Second run should not crash
