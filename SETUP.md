# TheCareCircle Setup Instructions

## Prerequisites
- Node.js (v16+)
- PostgreSQL database

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Create a PostgreSQL database and run the schema:
```bash
psql -U your_username -d your_database -f server/db/schema.sql
```

### 3. Environment Variables
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/thecarecircle
JWT_SECRET=your-random-secret-key
PORT=3000
```

### 4. Run the Application
```bash
npm run dev
```

This starts both the backend (port 3000) and frontend (port 5173).

### 5. Access the App
Open your browser to: http://localhost:5173

## Project Structure
```
TheCareCircle/
├── server/              # Backend (Node.js + Express)
│   ├── routes/         # API routes
│   ├── db/             # Database config & schema
│   └── middleware/     # Auth middleware
├── src/                # Frontend (React)
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── store/          # Zustand state management
│   └── utils/          # API utilities
└── package.json
```

## Features Implemented
✅ User authentication (register/login)
✅ Create and manage Care Circles
✅ Calendar with events
✅ Group messaging
✅ Care plan (medications & notes)
✅ Task checklist
✅ Healthcare providers directory
✅ Member management (owner only)
