# Light Speed Order Manager

## Overview

Light Speed Order Manager is a professional report generation tool for purchase orders with advanced filtering and management capabilities. The application is built as a full-stack web application with a React frontend and Express backend, designed to provide data-dense productivity features for managing and analyzing purchase order data across multiple outlets, suppliers, and categories.

The application focuses on efficiency and usability with a clean, Material Design-inspired interface optimized for enterprise productivity. Users can create, save, and manage custom reports with flexible date ranges and multi-dimensional filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component Library**: Shadcn UI (New York style) with Radix UI primitives, providing a comprehensive set of accessible, customizable components. The design system uses Tailwind CSS for styling with custom HSL-based color tokens supporting both light and dark modes.

**State Management**: 
- TanStack Query (React Query) for server state management, data fetching, and caching
- React hooks for local component state
- Cookie-based storage for user preferences and authentication state

**Routing**: Wouter for lightweight client-side routing

**Form Handling**: React Hook Form with Zod validation via @hookform/resolvers for type-safe form validation

**Design System**:
- Typography: Inter font family from Google Fonts
- Color scheme: HSL-based tokens with support for light/dark modes
- Spacing: Tailwind utility classes with consistent 2/4/6/8 unit system
- Components follow Material Design principles with clean borders, subtle shadows, and clear visual hierarchy

**Key Frontend Components**:
- `LightSpeedLayout`: Main application layout with theme toggle and authentication UI
- `ReportForm`: Complex form for configuring report parameters (dates, outlets, suppliers, categories)
- `SavedReportsList`: Sidebar component displaying user's saved reports
- `FilterDropdown`: Reusable multi-select dropdown with search functionality
- `DateRangePicker`: Date range selection component

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Structure**: RESTful API with routes prefixed under `/api`

**Storage Interface**: Abstract storage layer (`IStorage` interface) allowing for pluggable storage implementations:
- Current: In-memory storage (`MemStorage`) for development
- Designed for: PostgreSQL via Drizzle ORM (infrastructure ready but not yet implemented)

**Database ORM**: Drizzle ORM configured for PostgreSQL with schema-driven development
- Schema location: `shared/schema.ts`
- Migrations output: `./migrations` directory
- Database provider: Neon serverless PostgreSQL (via `@neondatabase/serverless`)

**Session Management**: Prepared for `connect-pg-simple` for PostgreSQL-backed sessions

**Development Server**: Custom Vite integration for HMR (Hot Module Replacement) in development mode with Express serving as the API backend

### Data Storage Solutions

**Database**: PostgreSQL (Neon serverless)
- Configured via Drizzle ORM
- Connection via `DATABASE_URL` environment variable
- Schema includes users table with UUID primary keys

**Current Schema**:
- Users table: id (UUID), username (unique), password
- Zod schemas generated from Drizzle schemas for validation

**Future Schema Considerations**: The application is designed for purchase order management, suggesting future tables for:
- Orders/Purchase Orders
- Suppliers
- Outlets/Locations
- Product Categories
- Report configurations

**Client-Side Storage**:
- Cookies for user preferences (theme, authentication state)
- No localStorage/sessionStorage usage currently implemented

### Authentication and Authorization

**Approach**: Cookie-based authentication system (infrastructure prepared but not fully implemented)

**User Model**: Simple username/password authentication
- User schema defined in `shared/schema.ts`
- Password storage prepared (should use bcrypt/scrypt hashing in production)

**Session Management**: 
- Prepared for PostgreSQL-backed sessions via `connect-pg-simple`
- Cookie-based session tracking

**Authorization Pattern**: User-based report ownership (reports are tagged with `createdBy` field indicating the creating user)

### External Dependencies

**Third-Party UI Libraries**:
- Radix UI: Comprehensive set of unstyled, accessible UI primitives (@radix-ui/*)
- Lucide React: Icon library for consistent iconography
- CMDK: Command palette component
- Embla Carousel: Carousel/slider component
- Vaul: Drawer component library
- React Day Picker: Date selection component

**Development Tools**:
- Vite: Build tool and development server
- ESBuild: JavaScript bundler for production builds
- Tailwind CSS: Utility-first CSS framework with PostCSS and Autoprefixer
- TypeScript: Type safety across frontend and backend

**Backend Dependencies**:
- Express.js: Web application framework
- Drizzle ORM: TypeScript ORM for PostgreSQL
- Neon Serverless: PostgreSQL database driver optimized for serverless environments
- Drizzle-Zod: Integration between Drizzle schemas and Zod validation

**Validation**:
- Zod: Schema validation library used for form validation and API data validation
- Drizzle-Zod: Automatic generation of Zod schemas from Drizzle database schemas

**Data Handling**:
- date-fns: Date manipulation and formatting library
- TanStack Query: Asynchronous state management

**Development Environment**:
- Replit-specific plugins for development mode banner and error overlay
- Cartographer plugin for development environment integration

**Potential Future Integrations**:
- Email service for report delivery/sharing
- File export services (Excel, CSV, PDF generation)
- Data import services for purchase order data
- Analytics/charting library for data visualization