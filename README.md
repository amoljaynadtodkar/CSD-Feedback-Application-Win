# Store Management Application

A desktop application for retail stores built with Electron JS + React + FastAPI + SQLite.

## Features

### Admin Features
- **Product Management**: Add products with code, name, category, and image
- **Demands Dashboard**: View customer product requests, filter by category/date, mark as fulfilled
- **Feedback Dashboard**: View feedback with charts/graphs, average rating, and filters

### Customer Features (Anonymous)
- **Submit Demand**: Request products by category, select existing products or describe new ones
- **Give Feedback**: Rate experience with emoji ratings (😞🙁😐🙂😄) and optional comments

## Tech Stack

- **Frontend**: Electron JS, React 19, Vite, TailwindCSS 4, ShadCN UI
- **Backend**: FastAPI, Python 3.14+, Uvicorn
- **Database**: SQLite (local file-based)
- **Security**: bcrypt password hashing, basic auth for admin endpoints

## Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `password`

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── database.py    # SQLite schema, seeding, auth
│   │   ├── models.py      # Pydantic models
│   │   └── main.py        # FastAPI endpoints
│   ├── images/            # Product images storage
│   ├── store.db           # SQLite database (auto-created)
│   └── pyproject.toml     # Python dependencies
├── src/
│   ├── ui/
│   │   └── App.jsx        # React Router setup
│   ├── pages/
│   │   ├── auth/          # Login page
│   │   ├── admin/         # Admin dashboards
│   │   └── customer/      # Customer features
│   └── lib/
│       └── api.js         # API utilities
└── package.json           # Node dependencies
```

## Installation

### Frontend Dependencies
```bash
npm install
```

### Backend Dependencies
```bash
cd backend
uv sync
```

## Running the App

### Development
```bash
npm run dev
```

This starts:
- React dev server on `http://localhost:3524`
- FastAPI backend on `http://localhost:8000`
- Electron app with auto-backend spawning

## API Endpoints

### Authentication
- `POST /login` - Admin login

### Products (Admin)
- `GET /products` - List all products
- `POST /products` - Add product (multipart form with image)
- `GET /products/categories` - Get product categories

### Demands
- `GET /demands` - List demands (admin, with filters)
- `POST /demands` - Submit demand (customer)
- `PUT /demands/{id}` - Update demand status (admin)

### Feedback
- `GET /feedback` - List feedback (admin, with filters)
- `GET /feedback/stats` - Get feedback statistics
- `POST /feedback` - Submit feedback (customer)

## Building for Production

```bash
# macOS
npm run dist:mac

# Windows
npm run dist:win

# Linux
npm run dist:linux
```

## Notes

- All data is stored locally (offline-capable)
- Images stored in `backend/images/` directory
- Database auto-initialized with admin user on first run
- Touch-friendly UI suitable for kiosk installations


uv run pyinstaller --onefile --name "csd-feedback-server" --add-data "images:images" --add-data "app/store.db:app" server.py

npm run dist:win