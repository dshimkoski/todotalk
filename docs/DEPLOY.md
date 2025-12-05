# Deployment Guide - Fly.io

This guide covers deploying TodoTalk to Fly.io with PostgreSQL.

## Prerequisites

- [Fly.io CLI](https://fly.io/docs/hands-on/install-flyctl/) installed
- Fly.io account (sign up at https://fly.io)

## Setup Steps

### 1. Install Fly CLI

```bash
# macOS
brew install flyctl

# Or use install script
curl -L https://fly.io/install.sh | sh
```

### 2. Login to Fly.io

```bash
flyctl auth login
```

### 3. Create PostgreSQL Database

```bash
# Create a FREE Postgres app (not managed)
flyctl postgres create --name todotalk-db --region iad

# When prompted, select:
# - Development - Single node, 1x shared CPU, 256MB RAM, 1GB disk (FREE)

# Note the connection details provided
```

### 4. Launch the App

```bash
# Initialize the app (uses fly.toml)
flyctl launch --no-deploy

# When prompted:
# - Use existing fly.toml? Yes
# - Setup Postgres? No (we already created it)
# - Setup Redis? No

# Attach the database (creates DATABASE_URL secret automatically)
flyctl postgres attach todotalk-db

# IMPORTANT: Update DATABASE_URL to disable SSL for internal network
# Get the current URL first
flyctl secrets list

# Then update it by appending ?sslmode=disable to the connection string
flyctl secrets set \
  DATABASE_URL="postgres://username:password@todotalk-db.flycast:5432/todotalk?sslmode=disable" \
  NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  NEXTAUTH_URL="https://todotalk.fly.dev" \
  AUTH_TRUST_HOST="true"
```

### 5. Deploy and Seed Data

```bash
# Deploy the app (migrations run automatically via release_command)
flyctl deploy

# SSH in once to seed demo data (one-time setup)
flyctl ssh console

# Inside the SSH session:
cd /app
npm run db:seed

# Demo credentials: alice@example.com / bob@example.com / charlie@example.com
# Password for all: demo123
```

### 6. Open Your App

```bash
flyctl open
```

## Environment Variables

Set these secrets before deploying:

- `DATABASE_URL` - PostgreSQL connection string with `?sslmode=disable` for Fly.io internal network
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (e.g., `https://todotalk.fly.dev`)
- `AUTH_TRUST_HOST` - Set to `"true"` for NextAuth in proxy environments

## Monitoring

```bash
# View logs
flyctl logs

# Check status
flyctl status

# SSH into machine
flyctl ssh console

# Scale machines
flyctl scale count 2
flyctl scale memory 512
```

## Updates

To deploy updates:

```bash
# Migrations run automatically on every deployment
flyctl deploy
```

Database migrations are executed automatically via the `release_command` configured in `fly.toml`.

## Database Management

```bash
# Connect to database
flyctl postgres connect -a todotalk-db

# Migrations run automatically on deploy via release_command
# To run manually if needed:
flyctl ssh console
cd /app
npm run db:migrate:deploy

# Seed demo data (one-time)
flyctl ssh console
cd /app
npm run db:seed

# View database with Prisma Studio (local tunnel)
flyctl proxy 5432 -a todotalk-db
# Then in another terminal with DATABASE_URL set:
npx prisma studio --config prisma/prisma.config.ts
```

## Troubleshooting

### Build Fails

- Check `flyctl logs` for errors
- Verify all environment variables are set
- Ensure Prisma schema is valid
- We use Prisma 7.1.0 with config file (prisma.config.ts)

### Database Connection Issues

- Verify `DATABASE_URL` includes `?sslmode=disable` parameter
- Check database is running: `flyctl status -a todotalk-db`
- Ensure database is attached: `flyctl postgres list`
- Fly.io internal network (.flycast domain) doesn't require TLS

### NextAuth Issues

- If seeing "UntrustedHost" errors, ensure `AUTH_TRUST_HOST="true"` is set
- Verify `NEXTAUTH_URL` matches your deployed URL
- Check logs with `flyctl logs` for detailed error messages

### Migration Errors

- SSH into machine and check Prisma status:
  ```bash
  flyctl ssh console
  cd /app
  npm run db:migrate:deploy
  ```
- Prisma 7 uses `prisma.config.ts` (handled by npm scripts in package.json)
- Demo data is seeded via `npm run db:seed`, not migrations
- Full node_modules included in image for Prisma 7 CLI dependencies

## Cost Optimization

The current configuration uses:

- 1GB RAM
- 1 shared CPU
- Auto-stop/auto-start (scales to zero when idle)
- **Image size: ~463MB** (includes full node_modules for migrations/seeding)

Free tier includes:

- Up to 3 shared-cpu-1x machines
- 3GB persistent storage
- 160GB outbound data transfer

### Production Optimizations

For real production deployment, consider:

1. **Separate migration runner**: Build a lightweight migration-only image, run as init container
2. **Remove seed dependencies**: Seed scripts are dev/demo only - production data comes from users
3. **External migration execution**: Run migrations from CI/CD pipeline before deploy
4. **Result**: Image size can be reduced to ~90-120MB with only runtime dependencies

The current setup prioritizes **demonstration completeness** over size optimization, showing:

- Latest Prisma 7 with proper config
- Automated migrations via `release_command`
- Clean separation of migrations and seed data
- Self-contained deployment process

For production, consider:

- Upgrading machine size
- Keeping `min_machines_running = 1` for better response times
- Setting up health checks

## Custom Domain

```bash
flyctl certs create yourdomain.com
flyctl certs show yourdomain.com
```

Add the DNS records shown in the output to your domain provider.
