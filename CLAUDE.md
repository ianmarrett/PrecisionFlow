# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PrecisionFlow is a plating line production planning tool. It is intended to be used by an engineering and project management company to help with design, simulating, quoting, and managing the construction, fabrication, and installation of electroplating process equipment. It should include modules for every step of this work flow. It should serve as the source of truth about the equipment that is to be built. 

## Development Commands

### Backend (Django REST Framework)
```bash
# Activate virtualenv (from repo root)
.\venv\Scripts\activate       # Windows
source venv/bin/activate      # Linux/Mac

# Run dev server (from Backend/)
python manage.py runserver    # serves on :8000

# Migrations
python manage.py makemigrations PlaterBuilder
python manage.py migrate

# Run tests
python manage.py test PlaterBuilder
```

### Frontend (Create React App)
```bash
# From frontend/
npm start     # dev server on :3000
npm test      # Jest in watch mode
npm run build
```

Both servers must run simultaneously for local development. The React app calls the Django API at `http://localhost:8000/api`.

## Architecture

### Backend (`Backend/`)
- **Django 6 + DRF** with SQLite, Python virtualenv in `venv/`.
- Single Django app: `PlaterBuilder`.
- Models are split into separate files under `PlaterBuilder/models/` and re-exported via `__init__.py`. When adding a new model, add it to the appropriate file and update `__init__.py`.
- API uses function-based views with `@api_view` decorators (not ViewSets/routers). All endpoints are registered manually in `PlaterBuilder/urls.py`.
- `services.py` contains `ProductionSimulator` — the core simulation engine that calculates throughput, optimal hoist count, and bottleneck analysis from process map entries + simulation parameters.
- CORS is wide-open (`CORS_ALLOW_ALL_ORIGINS = True`) and auth is `AllowAny` — development-only settings.

### Frontend (`frontend/`)
- **React 19** with React Router v7, Bootstrap 5, Recharts, Font Awesome, Axios.
- `src/api/apiService.js` is the single API client — all backend calls go through here using an Axios instance pointed at `localhost:8000/api`.
- Pages (`src/pages/`) are route-level components; reusable components live in `src/components/{projects,customers,common}/`.

### Data Model Relationships
- `Customers` → `Projects` (FK): each project belongs to a customer.
- `Projects` → `ProcessMapEntry` (FK, ordered by `process_step`): the sequence of plating stations.
- `Projects` → `ProductionGoal` (OneToOne): target throughput; one primary target cascades to all time periods.
- `Projects` → `SimulationParameters` (OneToOne): hoist config, line config, schedule.
- `Projects` → `SimulationResult` (FK, multiple): saved simulation run history.

### API URL Pattern
All API endpoints are under `/api/` and follow the pattern:
- `/api/projects/`, `/api/customers/` — list
- `/api/projects/create/`, `/api/customers/create/` — create (POST)
- `/api/projects/<id>/edit/` — update (PUT)
- `/api/projects/<id>/delete/` — delete (DELETE)
- Nested resources: `/api/projects/<id>/process-map/`, `/api/projects/<id>/simulation/run/`, etc.

Note: `project_id` is a string field (`CharField`), not the auto-increment PK.

## Key Conventions
- Models use plural names (e.g., `Projects`, `Customers`) rather than Django's typical singular convention.
- Several endpoints (process-matrix, controls-matrix, budget, quote) are stubbed with placeholder responses — not yet implemented.
- `equipment_matrix.py` is currently empty. `substrate.py` defines `Element` and `Part_Size` models that are not yet wired into serializers/views.
