# AgriFleet MERN Stack Application

AgriFleet is a full-stack web application designed for agricultural fleet operators to seamlessly manage tractor services, driver onboarding, and daily booking dispatch workflows. Providing a bridge between farmers needing equipment and drivers operating them, AgriFleet centralizes the logistics of modern agricultural services.

## Architecture

This project is built using the MERN stack with strict architectural layering:
- **Frontend:** React.js, Vite, Tailwind CSS, Redux Toolkit, Context API.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose).
- **Authentication:** Dual JWT Strategy for Administrative users and Operational Drivers.
- **Security:** Helmet, express-rate-limit, express-mongo-sanitize, xss-clean.

## Directory Structure

- `/client` - Frontend React application (Vite template).
- `/server` - Backend Node.js/Express API.

## Environment Instructions

The application requires specific environment variables for production security and integrations. 

### Backend (`/server/.env`)
```
NODE_ENV=production
PORT=5001
MONGO_URI=<Your MongoDB connection string>
JWT_SECRET=<Your secure JWT signing secret>
JWT_EXPIRE=7d
```

### Frontend (`/client/.env`)
```
VITE_API_URL=https://agrifleet-backend.onrender.com
VITE_API_MEDIA_URL=https://agrifleet-backend.onrender.com
```

## Security Best Practices
- **No Localhost Fallbacks:** Production builds explicitly require valid `VITE_API_URL` values. The system will throw critical errors if booted without correct configuration strings. 
- **Strict Network Policies:** CORS is tightly regulated to specific production domains (`vercel.app` & `localhost:5173`).
- **NoSQL & XSS Hardening:** The Express stack strictly filters all incoming JSON payloads to strip potentially malicious NoSQL execution queries and HTML script tags.
- **Fail Fast Configuration:** The Node server verifies the existence of every critical environment variable prior to taking control of the specified network PORT, preventing silent failures.

## Quick Start (Development)

1. **Install Dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. **Run the Backend**
   ```bash
   cd server
   npm run dev
   ```

3. **Run the Frontend**
   ```bash
   cd client
   npm run dev
   ```

## Production Deployment Checklist (Vercel & Render)
- Validated MongoDB Indexes (No redundant collisions).
- Removed all debug logging and test workflow logic.
- Ensured all cross-origin requests run securely over HTTPS.
- Ensured environment secrets are configured on the hosting dashboard.
