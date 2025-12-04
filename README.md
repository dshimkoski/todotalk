# TodoTalk

A modern full-stack task management and team collaboration application built with Next.js 16, React 19, and tRPC v11.

## Features

- 🔐 **Authentication** - Secure login with NextAuth.js v5
- ✅ **Task Management** - Create, update, delete, and reorder tasks with drag-and-drop
- 💬 **Real-time Chat** - Team messaging with Server-Sent Events (SSE)
- 👥 **Team Collaboration** - Multi-team support with role-based access
- ⚡ **Optimistic Updates** - Instant UI feedback with React 19 useOptimistic
- 🎨 **Modern UI** - Tailwind CSS v4 with dark mode support
- 🧪 **Well-tested** - 19 unit tests + 6 E2E tests with Playwright

## Tech Stack

### Frontend

- **Next.js 16** - App Router with React Server Components
- **React 19** - Latest features including useOptimistic, useTransition
- **tRPC v11** - End-to-end typesafe APIs with React Query
- **Tailwind CSS v4** - Modern styling with inline @theme
- **@dnd-kit** - Accessible drag-and-drop for task reordering

### Backend

- **Prisma v7** - Type-safe database ORM with PostgreSQL adapter
- **PostgreSQL 17** - Primary database
- **NextAuth.js v5** - Authentication and session management
- **Server-Sent Events** - Real-time message updates

### Testing & CI/CD

- **Vitest** - Fast unit testing for tRPC routers
- **Playwright** - E2E testing with Chromium
- **GitHub Actions** - Automated CI pipeline
- **Docker** - Multi-stage production build

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 17 (via Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dshimkoski/todotalk.git
   cd todotalk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start PostgreSQL with Docker**

   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todotalk"
   AUTH_SECRET="your-secret-key-here"
   ```

5. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

6. **Seed the database**

   ```bash
   npm run db:seed
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **Open http://localhost:3000**

### Demo Accounts

After seeding, you can log in with:

- Email: `alice@example.com` / Password: `demo123`
- Email: `bob@example.com` / Password: `demo123`
- Email: `charlie@example.com` / Password: `demo123`

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed database with demo data
npm run db:studio    # Open Prisma Studio
```

### Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes (NextAuth, tRPC, SSE)
│   │   ├── dashboard/      # Dashboard with Server Actions
│   │   └── login/          # Login page
│   ├── components/         # React components
│   ├── lib/                # Auth config and tRPC client
│   ├── server/             # Server-side code
│   │   ├── db.ts           # Prisma client
│   │   ├── events.ts       # SSE event emitter
│   │   └── trpc/           # tRPC routers and context
│   └── types/              # TypeScript type definitions
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Database seeding script
├── e2e/                    # Playwright E2E tests
└── docker-compose.yml      # PostgreSQL + Adminer services
```

## Testing

### Unit Tests

```bash
npm test -- --run
```

Tests cover all tRPC routers (user, task, message) with database isolation.

### E2E Tests

```bash
npm run test:e2e
```

E2E tests cover authentication flows and task management features.

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t todotalk .
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e AUTH_SECRET="your-secret" \
  todotalk
```

### Environment Variables

Required for production:

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Secret for NextAuth.js sessions (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Full URL of your deployment

## Architecture

### Authentication Flow

1. User submits credentials via login form
2. NextAuth.js validates against bcrypt-hashed passwords in database
3. JWT session token stored in httpOnly cookie
4. Middleware validates session for protected routes

### Real-time Updates

1. Client opens EventSource connection to `/api/events`
2. Server emits events via TypedEventEmitter
3. tRPC mutations trigger server-side events
4. SSE streams events to connected clients
5. Client invalidates React Query cache for fresh data

### Optimistic Updates

1. User performs action (delete task, update status)
2. `useOptimistic` immediately updates UI
3. Server Action executes in background
4. On success, revalidatePath syncs with server state

## CI/CD

GitHub Actions workflow runs on every push:

1. **Lint** - ESLint checks
2. **Test** - Unit tests with PostgreSQL container
3. **Build** - Verify production build succeeds

## License

MIT

## Author

Built as a demonstration of modern full-stack development practices.
