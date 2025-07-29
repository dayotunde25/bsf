# Hosting Instructions for BSF Alumni Management System

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database (e.g., Render.com managed PostgreSQL)
- Environment variables configured (see below)

## Environment Variables

For local development, create a `.env` file in the root of the project and add the following variables:

```
DATABASE_URL="your_postgresql_connection_string"
PORT=5000
# Add other secrets like SESSION_SECRET and Replit Auth config if needed
```

For production on Render, you will set these environment variables in the Render dashboard.

- `DATABASE_URL`: PostgreSQL connection string (required)
- `PORT`: Port number to run the server on (default: 5000)
- Session secret and Replit Auth configuration as needed for authentication

## Installation

1. Clone the repository and navigate to the project directory.

2. Install dependencies:

```bash
npm install
```

## Development

To start the development server with hot module replacement:

```bash
npm run dev
```

This runs the Express backend and Vite frontend in development mode on the port specified by `PORT` (default 5000).

## Production Build

To build the frontend and backend for production:

```bash
npm run build
```

This will:

- Build optimized static assets for the frontend using Vite
- Bundle the backend server code using ESBuild into the `dist/` directory

## Starting the Production Server

After building, start the production server with:

```bash
npm start
```

This runs the bundled server from `dist/index.js` in production mode.

The server serves both the API and the frontend client on the specified `PORT`.

## Database

The app uses PostgreSQL as the database, with `pg` and `drizzle-orm/postgres`. Ensure your `DATABASE_URL` environment variable points to your PostgreSQL database connection string.

Database schema migrations can be managed with Drizzle Kit (a dev dependency):

```bash
npm run db:push
```

## File Uploads

File uploads are stored locally by default. For production, consider integrating cloud storage solutions for scalability.

## Scalability Notes

- Sessions are stored in the database to support horizontal scaling.
- Database connection pooling is enabled for efficient resource use.
- Static assets can be served via CDN for better performance.
- File uploads can be migrated to cloud storage (e.g., AWS S3).

## Hosting on Render.com

1. Create a new Web Service on Render.com and connect your GitHub repository.

2. Set the build command to:

```bash
npm install && npm run build
```

3. Set the start command to:

```bash
npm start
```

4. Add environment variables in Render dashboard:

- `DATABASE_URL`: Your Render PostgreSQL database **internal** connection string.
- `PORT`: Set to `5000` or your preferred port.
- Any other secrets such as session secret and Replit Auth config.

5. Create a managed PostgreSQL database on Render.com and use its connection string for `DATABASE_URL`.

6. Deploy the service. Render will build and start your app automatically.

7. Use Render's logs and dashboard to monitor your app.

## Additional Notes

- The server listens on all network interfaces (`0.0.0.0`) to allow external access.
- Ensure environment variables are securely managed in your hosting environment.
- A simple email and password authentication system is now in place.

---

This document provides the essential steps to host and run the BSF Alumni Management System with PostgreSQL on Render.com.
