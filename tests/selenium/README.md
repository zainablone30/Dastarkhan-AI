# Selenium CRUD Test Suite — DastarKhan AI

Automated UI tests covering Create, Read, Update, Delete on four areas of the application.

## Setup

```bash
# 1. From the project root, start the dev server in one terminal
npm run dev      # serves on http://localhost:3000

# 2. In another terminal, install Python deps
pip install -r tests/selenium/requirements.txt

# 3. Create a test account once (visit /signup) or set env vars:
#    DASTARKHAN_TEST_EMAIL, DASTARKHAN_TEST_PASSWORD
```

## Running

```bash
pytest tests/selenium -v                     # all tests
pytest tests/selenium/test_02_profile_crud.py -v   # single suite
HEADLESS=1 pytest tests/selenium -v          # CI-style run without a visible browser
```

## What each file covers

| File | CRUD area | Tests |
|------|-----------|-------|
| `test_01_auth_crud.py`     | Authentication | Signup (Create), Login (Read), invalid-password negative |
| `test_02_profile_crud.py`  | User Profile   | Setup wizard (Create), View (Read), Edit phone (Update), Remove condition (Delete) |
| `test_03_favorites_crud.py`| Favorites      | Heart food (Create), Open page (Read), Switch tabs (Update), Unheart (Delete) |
| `test_04_orders_crud.py`   | Orders         | Place order (Create), Order history (Read), Admin status (Update), Admin cancel (Delete) |
