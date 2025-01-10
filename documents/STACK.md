# ChatGenius Tech Stack

## Frontend

### Core
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Router**: Next.js App Router

### State Management
- **Server State**: TanStack Query (React Query) v5
  - Handles API data fetching and caching
  - Real-time updates via WebSocket integration
  - Optimistic updates for better UX
- **Client State**: React's useState and Context API
  - Auth context for user state
  - UI state management

### Styling
- **Framework**: Tailwind CSS
- **Component Library**: shadcn/ui
  - Built on Radix UI primitives
  - Custom themed components
- **Icons**: Lucide Icons

### Real-time Features
- **WebSocket**: Socket.IO
  - Real-time message updates
  - Typing indicators
  - Online presence

### Forms & Validation
- **Form Handling**: Native React forms
- **Validation**: HTML5 validation + custom validation logic
- **Error Handling**: Custom error boundaries and toast notifications

## Backend

### Core
- **Framework**: Express.js
- **Language**: TypeScript
- **API Style**: RESTful

### Database
- **Primary Database**: Supabase (PostgreSQL)
- **Schema Features**:
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Foreign key relationships
  - Optimized indexes

### Authentication
- **Provider**: Supabase Auth
- **Features**:
  - JWT-based authentication
  - Session management
  - Role-based access control
  - Secure password hashing

### Security
- **Database Security**:
  - Row Level Security (RLS) policies
  - Role-based access control
  - Input validation
  - SQL injection protection
- **API Security**:
  - JWT validation
  - CORS configuration
  - Rate limiting
  - Request validation

### File Storage
- **Provider**: Supabase Storage
- **Features**:
  - Avatar storage
  - File attachments
  - Secure access policies

## DevOps & Infrastructure

### Hosting
- **Frontend**: Vercel
- **Backend**: Supabase

### Version Control
- **Platform**: Git
- **Repository**: GitHub

### Development Tools
- **Package Manager**: npm/yarn
- **Development Environment**: 
  - TypeScript
  - ESLint
  - Prettier
  - Husky (git hooks)

## Key Features

### Messaging
- Threaded conversations
- Real-time updates
- Message reactions
- Message editing
- Rich text support

### Channels
- Public and private channels
- Channel management
- Member roles and permissions
- Channel discovery

### User Management
- User profiles
- Online presence
- Role-based permissions
- Avatar support

## Project Structure

```
ChatGenius/
├── frontend/                # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── providers/      # React context providers
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
│
└── backend/                # Express.js backend application
    ├── src/
    │   ├── controllers/    # Route controllers
    │   ├── middleware/     # Express middleware
    │   ├── routes/         # API routes
    │   ├── services/       # Business logic
    │   └── types/          # TypeScript type definitions
    └── db/                 # Database migrations and policies
``` 