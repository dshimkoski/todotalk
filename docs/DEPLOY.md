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
flyctl postgres create --name todotalk-db --region sjc

# When prompted, select:
# - Development - Single node, 1x shared CPU, 256MB RAM, 1GB disk (FREE)

# Note the connection string provided - you'll need it for secrets
```

### 4. Launch the App

```bash
# Initialize the app (uses fly.toml)
flyctl launch --no-deploy

# When prompted:
# - Use existing fly.toml? Yes
# - Setup Postgres? No (we already created it)
# - Setup Redis? No

# Set secrets (replace with your values)
flyctl secrets set \
  DATABASE_URL="postgres://..." \
  NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  NEXTAUTH_URL="https://todotalk.fly.dev"

# Attach the database we created earlier
flyctl postgres attach todotalk-db
```

### 5. Run Database Migrations

```bash
# Deploy the app first
flyctl deploy

# SSH into the machine and run migrations
flyctl ssh console -C "npx prisma migrate deploy"

# Optional: Seed the database
flyctl ssh console -C "npx prisma db seed"
```

### 6. Open Your App

```bash
flyctl open
```

## Environment Variables

Set these secrets before deploying:

- `DATABASE_URL` - PostgreSQL connection string (from `flyctl postgres create`)
- `NEXTAUTH_SECRET` - Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app URL (e.g., `https://todotalk.fly.dev`)

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
git push origin main
flyctl deploy
```

## Database Management

```bash
# Connect to database
flyctl postgres connect -a todotalk-db

# Run migrations
flyctl ssh console -C "npx prisma migrate deploy"

# View with Prisma Studio (local tunnel)
flyctl proxy 5432 -a todotalk-db
# Then in another terminal:
npx prisma studio
```

## Troubleshooting

### Build Fails

- Check `flyctl logs` for errors
- Verify all environment variables are set
- Ensure Prisma schema is valid

### Database Connection Issues

- Verify `DATABASE_URL` secret is set correctly
- Check database is running: `flyctl status -a todotalk-db`
- Ensure database is attached: `flyctl postgres list`

### Migration Errors

- SSH into machine and check Prisma status:
  ```bash
  flyctl ssh console
  npx prisma migrate status
  ```

## Cost Optimization

The current configuration uses:

- 1GB RAM
- 1 shared CPU
- Auto-stop/auto-start (scales to zero when idle)

Free tier includes:

- Up to 3 shared-cpu-1x machines
- 3GB persistent storage
- 160GB outbound data transfer

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
