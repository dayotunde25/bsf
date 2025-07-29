# BSF Alumni Management System

## Overview

This is a full-stack alumni management system for the Baptist Student Fellowship (BSF) built with a modern React frontend and Express backend. The system provides comprehensive features for alumni networking, communication, resource sharing, and community engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom BSF branding
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer middleware for handling media uploads
- **API Design**: RESTful endpoints with consistent error handling

### Database Architecture
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive relational schema with proper foreign key relationships
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Authentication System
- Replit Auth integration for secure user authentication
- Session-based authentication with PostgreSQL session store
- User profile management with admin role capabilities
- Middleware protection for authenticated routes

### Core Features
1. **User Management**: Profile creation, role assignments (executive/worker), fellowship history
2. **Real-time Chat**: One-to-one messaging with read/unread status tracking
3. **Alumni Directory**: Searchable member directory with contact information
4. **Media Gallery**: Photo sharing with categorization by event types and sessions
5. **Job Board**: Job posting and application system with admin approval
6. **Mentorship Program**: Mentor-mentee matching and relationship management
7. **Prayer Wall**: Community prayer requests and testimonies
8. **Resource Library**: Document and media resource sharing
9. **Timeline**: Historical events and milestones tracking
10. **Birthday Reminders**: Automatic birthday celebrations display

### UI Components
- Custom BSF-branded color scheme (green primary theme)
- Responsive design with mobile-first approach
- Comprehensive component library using Radix UI primitives
- Toast notifications for user feedback
- Modal dialogs for complex interactions

## Data Flow

### Authentication Flow
1. User clicks "Sign In" → redirects to Replit Auth
2. Successful authentication → user data stored/updated in database
3. Session established with secure cookie
4. Frontend receives user data via `/api/auth/user` endpoint

### Real-time Features
- Chat messages: AJAX polling every 2-5 seconds for near real-time experience
- Birthday banner: Daily check against current date
- Unread message counts: Periodic refresh for header notifications

### File Upload Flow
1. Client uploads files via multipart form data
2. Multer processes uploads to local storage
3. File metadata stored in database with approval workflow
4. Admin approval required for public visibility

## External Dependencies

### Authentication
- **Replit Auth**: Primary authentication provider
- **OpenID Connect**: Standard protocol for secure authentication
- **Passport.js**: Authentication middleware for Express

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **Connection pooling**: Efficient database connection management

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Consistent icon library
- **TanStack Query**: Server state management and caching

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **Zod**: Runtime type validation for API endpoints

## Deployment Strategy

### Development Environment
- Replit integration with live development server
- Hot module replacement for rapid development
- Environment variable management for sensitive configuration

### Production Build
1. Frontend: Vite builds optimized static assets
2. Backend: ESBuild bundles server code with external dependencies
3. Database: Drizzle migrations ensure schema consistency
4. File uploads: Local storage with potential for cloud storage integration

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Sessions**: Secure session secret for cookie signing
- **Auth**: Replit Auth configuration with OIDC endpoints
- **File Storage**: Local uploads directory with size limits

### Scalability Considerations
- Session storage in PostgreSQL allows horizontal scaling
- Database connection pooling for efficient resource utilization
- Static asset serving can be moved to CDN
- File uploads can be migrated to cloud storage (S3, etc.)