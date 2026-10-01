# Campus Recover - Lost & Found

A complete, full-stack Next.js web application for managing lost and found items on college campuses.

## 1. Project Overview

Campus Recover is designed to reduce dependence on physical noticeboards and manual communication while providing a transparent digital lost-and-found workflow for students, teachers, and campus administrators.

## 2. Features

- **Authentication & Authorization**: Secure JWT-based registration and login with role-based access control (Student, Teacher, Admin).
- **Report Management**: Create, edit, and browse Lost and Found items.
- **Image Uploads**: Securely upload images for items and claims.
- **Smart Matching Engine**: Deterministically calculates potential matches between lost and found items based on categories, location, date, and description keywords.
- **Secure Claims**: Users can claim found items securely by providing justification and proof of ownership.
- **Admin Review Process**: Administrators review claims and manage the recovery workflow to ensure items are returned to rightful owners.
- **In-App Notifications**: Alerts for potential matches, claim submissions, and status changes.
- **Modern UI**: Polished, responsive design using Shadcn/UI and Tailwind CSS with beautiful dark mode aesthetics.

## 3. Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Authentication**: Custom JWT with secure HTTP-only cookies, bcrypt for password hashing
- **Validation**: Zod
- **Icons**: Lucide React

## 4. Architecture

This is a modular monolith Next.js application. 
- The client-side consists of React Server Components and Client Components interacting with Next.js Route Handlers (`app/api/*`).
- The Route Handlers delegate business logic to a dedicated server-only layer (`server/`).
- The database interactions are handled via Drizzle ORM connecting to a Neon PostgreSQL instance.

## 5. Folder Structure

```
campus-lost-found/
├── app/
│   ├── (auth)/          # Login and registration pages
│   ├── admin/           # Admin dashboard 
│   ├── api/             # Next.js Route Handlers (API Layer)
│   ├── claims/          # Claim submission pages
│   ├── dashboard/       # User dashboard
│   ├── notifications/   # Notification center
│   ├── reports/         # Lost/Found browsing and details
│   ├── layout.tsx       # Root layout with AuthProvider
│   └── page.tsx         # Landing page
├── components/          # Reusable UI components (Shadcn)
├── lib/                 # Client utilities
├── server/
│   ├── auth/            # JWT, Password hashing, RBAC
│   ├── db/              # Database instance, schemas, migrations, seed
│   ├── repositories/    # Database queries and access layer
│   ├── services/        # Business logic (Matching engine, auth, reports)
│   ├── utils/           # Server utilities (Uploads)
│   └── validation/      # Zod validation schemas
├── public/              # Static assets
└── uploads/             # Locally stored user uploads
```

## 6. Prerequisites

- Node.js (v18+)
- pnpm (v9+)
- A Neon PostgreSQL account

## 7. Neon Setup

1. Create a free account at [Neon](https://neon.tech).
2. Create a new project and PostgreSQL database.
3. Copy the Connection String provided in the dashboard.

## 8. Environment Configuration

Copy the sample environment file and add your Neon database connection string:

```bash
cp .env.example .env
```

Update `.env` with your secure values:
```env
DATABASE_URL=postgres://user:password@endpoint.neon.tech/neondb
JWT_SECRET=your_super_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

## 9. Drizzle Setup

The database schema is defined in `server/db/schema/`. Drizzle uses this to generate SQL migrations.

## 10. Migration Commands

To generate migration files based on schema changes:
```bash
npm run db:generate
```

To apply those migrations to your Neon database:
```bash
npm run db:migrate
```

To view and edit your database visually:
```bash
npm run db:studio
```

## 11. Seed Commands

Populate your database with an initial Admin user and a sample Student user:
```bash
npm run db:seed
```
*Default Admin credentials: `admin@college.edu` / `admin123`*

## 12. Development Commands

Run the local development server:
```bash
pnpm dev
```

Build for production:
```bash
pnpm build
```

## 13. Testing

You can verify the codebase using TypeScript compiler and ESLint:
```bash
pnpm tsc --noEmit
pnpm lint
```

## 14. API Structure

All API routes follow a standard REST structure and return standard JSON formats:
- `POST /api/auth/login`
- `POST /api/reports`
- `GET /api/reports?type=LOST`
- `POST /api/claims`
- `PATCH /api/admin/claims/:id`

## 15. Deployment

This application can be deployed effortlessly to Vercel, which natively supports Next.js Server Actions and Route Handlers. Ensure your `UPLOAD_DIR` strategy is modified to an S3 bucket or cloud storage if deploying to serverless environments (as local filesystems are ephemeral).

## 16. Security Considerations

- Passwords are salted and hashed using `bcrypt`.
- Authentication uses secure HTTP-only cookies that cannot be read by client-side JavaScript.
- Role-Based Access Control (RBAC) is enforced at the API route level (`server/auth/session.ts`), preventing unauthorized bypasses.
- All incoming requests are strictly validated using `Zod` schemas.
- Uploaded files are checked for MIME type validation and size boundaries to mitigate malicious file uploads.
- The `server/` directory modules are exclusively utilized by Server Components and API Route handlers.
