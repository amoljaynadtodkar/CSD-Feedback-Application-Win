# Product Requirements Document (PRD) for Store Management Application

## Document Information

- **Product Name**: Store Management App
- **Version**: 1.0
- **Date**: January 20, 2026
- **Purpose**: This PRD outlines the requirements for developing a desktop application for a store using Electron JS for the frontend, FastAPI for the backend, and SQLite as the database. The app supports admin login for management features and anonymous access for customer interactions.

## Overview

The application is a desktop-based store management tool designed for a retail store. It allows admins to manage product inventory and view customer insights, while customers can submit product demands and provide feedback without logging in. The app will run on Electron JS, providing a cross-platform desktop experience. The backend will handle API requests via FastAPI, with data persisted in a local SQLite database. Product images will be stored locally on the file system.

### Key Objectives

- Enable admins to add and manage products.
- Provide dashboards for admins to monitor customer demands and feedback.
- Allow customers to request products (existing or new) and submit anonymous feedback.
- Ensure simplicity, security (basic admin authentication), and local data storage.

### Target Users

- **Admins**: Store owners or managers who need to add products and review customer data.
- **Customers**: Store visitors who interact with the app anonymously to request products or give feedback.

### Assumptions and Constraints

- The app is desktop-only (via Electron JS) and not web-based.
- All data is stored locally: SQLite for structured data, file system for images.
- No internet connectivity required; everything runs offline.
- Basic authentication for admins (username/password stored in SQLite; no advanced security like JWT unless specified).
- Customers do not create accounts; all interactions are anonymous.
- The app will be installed on a single machine in the store (e.g., a kiosk or admin computer) with a touchscreen.
- Error handling for invalid inputs, database failures and file operations is required but kept minimal.
- UI should be intuitive and responsive and elements for touch based operation shoul be there, using Electron's web technologies (HTML/CSS/JS).

## Tech Stack

- **Frontend**: Electron JS (for building the desktop app, handling UI, and communicating with the backend).
- **Backend**: FastAPI (for RESTful APIs to handle CRUD operations and authentication).
- **Database**: SQLite (local file-based database for products, demands, feedback, and admin credentials).
- **File Storage**: Local file system for product images (e.g., in a `./images` directory relative to the app).
- **Integration**: Electron will make HTTP requests to the FastAPI server running locally (e.g., on `http://localhost:8000`).

## Functional Requirements

### 1. Authentication

- **Admin Login**:
  - A login screen appears on app launch for admin access.
  - Fields: Username and Password.
  - On successful login, redirect to Admin Dashboard.
  - Default admin credentials can be seeded in the database (e.g., username: "admin", password: "password" ).
  - Failed login shows an error message.
  - No session timeout; logout button to return to login screen.
- **Customer Mode**:
  - Accessible without login via a "Customer Mode" button on the initial screen.
  - No authentication required; direct access to customer features.

### 2. Admin Features

#### Feature 1: Product Management

- **Add Product**:
  - Form fields:
    - Product Code (string, unique, required).
    - Product Name (string, required).
    - Product Category (string, required; suggest dropdown with predefined categories, with one category as "Other").
    - Product Image (file upload; accept JPG/PNG; store locally in `./images` folder with filename as `<product_code>.jpg` or similar).
  - Validation: Ensure code uniqueness (check against database).
  - On submit, store code, name, category in SQLite `products` table; save image file locally and store file path in database.
  - Success message and refresh product list.
- **View/Edit/Delete Products** (Optional extension if time allows, but not specified; focus on add only unless expanded).

#### Feature 2: Admin Dashboards

- **Customer Demands Dashboard**:
  - Display a list or table of all customer demands from the `demands` table.
  - Columns: Demand ID, Category, Product Name (or "New Product: [description]" if not in inventory), Timestamp, Status (e.g., Pending/Fulfilled – admin can update).
  - Filters: By category, date range.
  - Allow admin to mark as fulfilled or add notes.
- **Customer Feedback Dashboard**:
  - Display a list or table of all feedback from the `feedback` table.
  - Columns: Feedback ID, Rating (e.g., Smiley Face emoji or 1-5 scale), Optional Text, Timestamp.
  - Aggregates: Average rating, count of feedback.
  - Filters: By rating, date range.
- Dashboards should use charts/graphs if possible (e.g., via Chart.js in Electron) for visual summaries.

### 3. Customer Features

#### Feature 1: Product Demands

- **Submit Demand**:
  - Step 1: Select Category (dropdown populated from existing products' categories in database; allow "Other" for new categories).
  - Step 2: Select Product (dropdown filtered by selected category; populate from `products` table).
  - If product not found: Option to enter "New Product Demand" with free-text description.
  - Submit button to save demand in `demands` table (fields: category, product_name or new_description, timestamp).
  - Success message: "Demand submitted successfully"
  - No quantity or user details; keep anonymous.

#### Feature 2: Anonymous Feedback

- **Submit Feedback**:
  - UI: Smiley face rating system (e.g., 5 emojis: Very Sad 😞, Sad 🙁, Neutral 😐, Happy 🙂, Very Happy 😄).
  - Optional text area for comments.
  - Submit button to save in `feedback` table (fields: rating (1-5 mapped from smileys), text, timestamp).
  - Success message: "Feedback submitted. Thank you!"
  - Anonymous; no user identification.

## Non-Functional Requirements

- **Performance**: App should load quickly (<5s startup). API responses <1s for local operations.
- **Security**:
  - Hash admin passwords (use bcrypt via a Python library in FastAPI).
  - Prevent SQL injection (use parameterized queries in SQLite).
  - Restrict file uploads to images only; limit size (e.g., 5MB).
- **Usability**:
  - Responsive UI for desktop resolutions (min 1024x768).
  - Intuitive navigation: Menu or tabs for features.
  - Error messages for invalid actions (e.g., "Product code already exists").
- **Reliability**: Handle database connections gracefully; auto-create tables on first run.
- **Maintainability**: Clean code structure; use MVC pattern in Electron, routers in FastAPI.
- **Logging**: Basic logging for errors (console or file).
- **Testing**: Unit tests for backend APIs; manual testing for frontend.

## Data Model

### SQLite Schema

- **admins** Table:
  - id (INTEGER PRIMARY KEY)
  - username (TEXT UNIQUE)
  - password_hash (TEXT)

- **products** Table:
  - id (INTEGER PRIMARY KEY)
  - code (TEXT UNIQUE)
  - name (TEXT)
  - category (TEXT)
  - image_path (TEXT) // e.g., './images/product_code.jpg'

- **demands** Table:
  - id (INTEGER PRIMARY KEY)
  - category (TEXT)
  - product_name (TEXT) // NULL if new product
  - new_description (TEXT) // NULL if existing product
  - timestamp (DATETIME DEFAULT CURRENT_TIMESTAMP)
  - status (TEXT DEFAULT 'Pending') // e.g., Pending, Fulfilled

- **feedback** Table:
  - id (INTEGER PRIMARY KEY)
  - rating (INTEGER) // 1-5
  - text (TEXT)
  - timestamp (DATETIME DEFAULT CURRENT_TIMESTAMP)

Initialize database with schema creation script in backend startup.

## API Endpoints (FastAPI)

- **Auth**:
  - POST /login: {username, password} → Success/Fail
- **Products** (Admin-only):
  - POST /products: Add product (multipart for image)
  - GET /products: List all
- **Demands** (Customer: POST; Admin: GET/PUT):
  - POST /demands: Submit demand
  - GET /demands: List for dashboard
  - PUT /demands/{id}: Update status
- **Feedback** (Customer: POST; Admin: GET):
  - POST /feedback: Submit feedback
  - GET /feedback: List for dashboard

Use middleware for admin authentication (e.g., basic auth header).

## UI/UX Guidelines

- **Electron Structure**: Main window with routes for login, admin dashboard, customer home.
- **Themes**: Simple, clean design (use CSS frameworks like Bootstrap if needed).
- **Navigation**:
  - Admin: Sidebar with "Add Product", "Demands Dashboard", "Feedback Dashboard", "Logout".
  - Customer: Buttons for "Submit Demand", "Give Feedback", "Back to Home".
- **Accessibility**: Keyboard navigation, alt text for images.

## Development Roadmap

1. Set up Electron + FastAPI integration (local server).
2. Implement database schema and seeding.
3. Build authentication.
4. Develop admin product add feature (with file upload).
5. Implement customer demand and feedback submission.
6. Create admin dashboards with data visualization.
7. Test end-to-end flows.
8. Package app for distribution (Electron builder).

## Risks and Mitigations

- **File System Issues**: Ensure write permissions; fallback to temp dir if needed.
- **Database Corruption**: Backup SQLite file periodically (manual).
- **Scalability**: Not designed for multi-user; if needed, consider migration to PostgreSQL later.

This PRD provides a comprehensive blueprint for implementation. For any clarifications, refer back to the original specifications.
