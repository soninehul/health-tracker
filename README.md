# Health Tracker (MERN)

A MERN stack health tracking app with **login**, **register**, and **dashboard** pages.

## Stack

- **M**ongoDB + Mongoose
- **E**xpress.js
- **R**eact (Vite) + React Router
- **N**ode.js

## Setup

### 1. MongoDB

Use a local MongoDB instance or [MongoDB Atlas](https://www.mongodb.com/atlas).  
Default: `mongodb://localhost:27017/health-tracker`.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env and set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

Server runs at **http://localhost:5000**.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**. API requests are proxied to the backend.

## Pages

- **/login** – Sign in with email and password
- **/register** – Create account (name, email, password)
- **/dashboard** – Protected dashboard (after login)

## API

- `POST /api/auth/register` – Register (name, email, password)
- `POST /api/auth/login` – Login (email, password)
- `GET /api/auth/me` – Current user (Bearer token required)
