# Color Book Wizard Application

## Overview

This is a full-stack web application that transforms user-uploaded images into magical coloring pages using OpenAI's vision API. The application features a whimsical, magical theme with animated UI components and provides real-time processing feedback to users.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 2025**: Switched from Image API to Responses API to match ChatGPT's multimodal approach - now processes uploaded images and text prompts together for more accurate results
- **January 2025**: Updated to use OpenAI's latest gpt-image-1 model for improved image generation quality and better text rendering in coloring pages (replacing DALL-E 3)

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth, magical animations
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Integration**: OpenAI Responses API for multimodal image generation - processes both uploaded images and text prompts together like ChatGPT
- **File Upload**: Multer middleware for handling multipart form data
- **Development**: Hot reloading with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL configured for production use
- **ORM**: Drizzle ORM with PostgreSQL adapter
- **Connection**: Neon Database serverless driver for cloud deployment
- **Development Storage**: In-memory storage implementation for development
- **Migrations**: Drizzle Kit for database schema management

### Key Design Decisions

**Dual Storage Strategy**: The application implements both in-memory storage (for development) and PostgreSQL (for production) through a common interface pattern. This allows for rapid development iteration while maintaining production scalability.

**Serverless-First Database**: Uses Neon Database serverless PostgreSQL, which provides automatic scaling and connection pooling suitable for variable workloads.

**Progressive Enhancement**: The UI gracefully handles different states (uploading, processing, completed) with appropriate loading states and animations.

## Key Components

### API Endpoints
- `POST /api/generate-coloring-page`: Accepts image uploads and initiates background processing
- Processing includes OpenAI API integration for image transformation

### Database Schema
- `coloring_requests` table: Stores request metadata including original image URLs, generated coloring page URLs, and processing status

### Frontend Components
- `UploadZone`: Drag-and-drop file upload with visual feedback
- `ProcessingSection`: Animated loading states with magical themes
- `ResultSection`: Display results with download and sharing capabilities
- `SparkleDecoration`: Reusable animation component for magical effects

### Shared Schema
- Zod schemas for type-safe data validation between frontend and backend
- Drizzle-Zod integration for database schema validation

## Data Flow

1. **Upload**: User uploads image via drag-and-drop or file picker
2. **Processing**: Image converted to base64 and sent to backend
3. **Background Processing**: OpenAI API processes image asynchronously
4. **Polling**: Frontend polls for completion status using TanStack Query
5. **Result Display**: Completed coloring page displayed with download options

## External Dependencies

### Core Dependencies
- **OpenAI Responses API**: Multimodal image processing and coloring page generation using gpt-4.1-mini with image generation tools
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library

### Development Dependencies
- **Replit Integration**: Development banner and runtime error overlay
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database migration and introspection tools

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized React application to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Static files served by Express in production

### Environment Configuration
- `NODE_ENV`: Controls development vs production behavior
- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: OpenAI API authentication

### Development vs Production
- **Development**: Uses Vite dev server with HMR and in-memory storage
- **Production**: Serves static files through Express with PostgreSQL persistence

The application is designed for deployment on platforms that support Node.js with environment variable configuration, with particular optimization for Replit's hosting environment.